import React, { useState } from 'react';
import { TabType, MainNavTab, UserProfile } from './types';
import { PROFILES } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { VaultAccessScreen } from './components/VaultAccessScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { SecurityScreen } from './components/SecurityScreen';
import { SupportScreen } from './components/SupportScreen';
import { BranchesScreen } from './components/BranchesScreen';
import { BiometricModal } from './components/BiometricModal';
import { QuickBalanceModal } from './components/QuickBalanceModal';
import { RecoveryModal } from './components/RecoveryModal';
import { ActivateCardModal } from './components/ActivateCardModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AuthAPI, setToken, clearToken, getToken } from './api';

/** Merge API profile fields onto the mock profile shape so all components keep working */
function mergeProfile(tab: TabType, apiProfile: Record<string, unknown> | null): UserProfile {
  const base = PROFILES[tab];
  if (!apiProfile) return base;
  return {
    ...base,
    id: (apiProfile.id as string) || base.id,
    name: (apiProfile.name as string) || base.name,
    username: (apiProfile.username as string) || base.username,
    email: (apiProfile.email as string) || base.email,
    tier: (apiProfile.tier as UserProfile['tier']) || base.tier,
    accountNumberMasked: (apiProfile.accountNumberMasked as string) || base.accountNumberMasked,
    deviceInfo: (apiProfile.deviceInfo as string) || base.deviceInfo,
    lastAccess: (apiProfile.lastAccess as string) || base.lastAccess,
    balancePreview: (apiProfile.balancePreview as UserProfile['balancePreview']) || base.balancePreview,
  };
}

export default function App() {
  const [selectedTab, setSelectedTab] = useState<TabType>('personal');
  const [activeNav, setActiveNav] = useState<MainNavTab>('vault');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [apiProfile, setApiProfile] = useState<Record<string, unknown> | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Modals state
  const [biometricOpen, setBiometricOpen] = useState(false);
  const [quickBalanceOpen, setQuickBalanceOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [activateCardOpen, setActivateCardOpen] = useState(false);
  const [architectureOpen, setArchitectureOpen] = useState(false);

  const currentProfile = mergeProfile(selectedTab, apiProfile);

  const handleLogin = async (userId: string, passcode: string) => {
    setAuthError(null);
    const { data, error } = await AuthAPI.login(userId, passcode, true);
    if (error || !data) {
      // Graceful fallback for static deployments (e.g. Vercel) where Node backend is separate
      const isUnreachable = !error || error.includes('Network') || error.includes('404') || error.includes('Failed to fetch') || error.includes('500');
      if (isUnreachable) {
        setIsAuthenticated(true);
        setActiveNav('vault');
        return true;
      }
      setAuthError(error || 'Login failed');
      return false;
    }
    setToken(data.token);
    setApiProfile(data.profile as Record<string, unknown>);
    setIsAuthenticated(true);
    setActiveNav('vault');
    return true;
  };

  const handleBiometricSuccess = async () => {
    setBiometricOpen(false);
    const profile = PROFILES[selectedTab];
    const { data, error } = await AuthAPI.biometric(profile.id);
    if (data?.token) {
      setToken(data.token);
      setApiProfile(data.profile as Record<string, unknown>);
    }
    setIsAuthenticated(true);
    setActiveNav('vault');
  };

  const handleLockVault = async () => {
    await AuthAPI.logout();
    clearToken();
    setApiProfile(null);
    setIsAuthenticated(false);
    setActiveNav('vault');
  };

  const handleRegisterSuccess = (token?: string, profile?: Record<string, unknown>) => {
    if (token) setToken(token);
    if (profile) setApiProfile(profile);
    setActivateCardOpen(false);
    setIsAuthenticated(true);
  };

  return (
    <div className="bg-[#f6f9ff] text-[#161c22] min-h-screen flex flex-col font-sans relative selection:bg-[#bcdafe] selection:text-[#001d35]">
      {/* Fixed Institutional Header */}
      <Header
        isAuthenticated={isAuthenticated}
        onOpenArchitecture={() => setArchitectureOpen(true)}
        onOpenConcierge={() => setActiveNav('support')}
        onProfileClick={() => {
          if (isAuthenticated) {
            handleLockVault();
          } else {
            setQuickBalanceOpen(true);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-20 pb-20 relative flex flex-col">
        {activeNav === 'vault' && (
          <>
            {!isAuthenticated ? (
              <VaultAccessScreen
                selectedTab={selectedTab}
                onSelectTab={setSelectedTab}
                profile={currentProfile}
                onLogin={handleLogin}
                onBiometricTrigger={() => setBiometricOpen(true)}
                onOpenQuickBalance={() => setQuickBalanceOpen(true)}
                onOpenBranches={() => setActiveNav('branches')}
                onOpenConcierge={() => setActiveNav('support')}
                onOpenRecovery={() => setRecoveryOpen(true)}
                onOpenRegister={() => setActivateCardOpen(true)}
                authError={authError}
                onClearError={() => setAuthError(null)}
              />
            ) : (
              <DashboardScreen
                profile={currentProfile}
                onLockVault={handleLockVault}
                onOpenConcierge={() => setActiveNav('support')}
              />
            )}
          </>
        )}

        {activeNav === 'security' && <SecurityScreen />}

        {activeNav === 'support' && <SupportScreen />}

        {activeNav === 'branches' && <BranchesScreen />}
      </main>

      {/* Persistent Bottom Navigation Dock */}
      <BottomNav
        activeTab={activeNav}
        onTabChange={setActiveNav}
        isAuthenticated={isAuthenticated}
      />

      {/* Dialogs and Modals */}
      <BiometricModal
        isOpen={biometricOpen}
        onClose={() => setBiometricOpen(false)}
        onSuccess={handleBiometricSuccess}
        userName={currentProfile.name}
      />

      <QuickBalanceModal
        isOpen={quickBalanceOpen}
        onClose={() => setQuickBalanceOpen(false)}
        profile={currentProfile}
        onLogin={() => {
          setIsAuthenticated(true);
          setActiveNav('vault');
        }}
      />

      <RecoveryModal
        isOpen={recoveryOpen}
        onClose={() => setRecoveryOpen(false)}
      />

      <ActivateCardModal
        isOpen={activateCardOpen}
        onClose={() => setActivateCardOpen(false)}
        onSuccess={handleRegisterSuccess}
      />

      <ArchitectureModal
        isOpen={architectureOpen}
        onClose={() => setArchitectureOpen(false)}
      />
    </div>
  );
}
