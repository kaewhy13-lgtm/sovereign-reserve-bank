import React, { useState } from 'react';
import { TabType, UserProfile } from '../types';

interface VaultAccessScreenProps {
  selectedTab: TabType;
  onSelectTab: (tab: TabType) => void;
  profile: UserProfile;
  onLogin: (userId: string, passcode: string) => Promise<boolean>;
  onBiometricTrigger: () => void;
  onOpenQuickBalance: () => void;
  onOpenBranches: () => void;
  onOpenConcierge: () => void;
  onOpenRecovery: () => void;
  onOpenRegister: () => void;
  authError?: string | null;
  onClearError?: () => void;
}

const DEMO_PASSWORDS: Record<string, string> = {
  'alexander.vanderbilt': 'vault-alpha-8821',
  'trust.officer@vanderbilt.reserve': 'vault-wealth-1904',
  'treasury@apex-capital.corp': 'vault-corp-4410',
};

export const VaultAccessScreen: React.FC<VaultAccessScreenProps> = ({
  selectedTab,
  onSelectTab,
  profile,
  onLogin,
  onBiometricTrigger,
  onOpenQuickBalance,
  onOpenBranches,
  onOpenConcierge,
  onOpenRecovery,
  onOpenRegister,
  authError,
  onClearError,
}) => {
  const [userId, setUserId] = useState(profile.username);
  const [passcode, setPasscode] = useState(DEMO_PASSWORDS[profile.username] || 'vault-alpha-8821');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Sync inputs when tab changes profile
  React.useEffect(() => {
    setUserId(profile.username);
    setPasscode(DEMO_PASSWORDS[profile.username] || 'vault-alpha-8821');
    setAuthSuccess(false);
  }, [profile]);

  const handleAutofill = () => {
    setUserId(profile.username);
    setPasscode(DEMO_PASSWORDS[profile.username] || 'vault-alpha-8821');
    onClearError?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearError?.();
    setIsAuthenticating(true);
    setAuthSuccess(false);

    const success = await onLogin(userId, passcode);

    if (success) {
      setAuthSuccess(true);
    } else {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 sm:px-6 pt-4 pb-28 gap-4">
      {/* Handshake Status Badge */}
      <div className="flex items-center justify-between bg-[#eef4fc] px-4 py-2.5 rounded-lg shadow-xs border border-[#c5c6cd]/40">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[#446180] text-[18px]">verified_user</span>
          <span className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider truncate">
            FIDO2 &amp; AES-256 Handshake Active
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dde3eb] text-[#161c22] text-[11px] font-semibold whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#446180] animate-pulse"></span>
          Vault Ready
        </span>
      </div>

      {/* Header Titles */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-[#446180] uppercase tracking-widest">
          Sovereign Reserve Portal
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#161c22] tracking-tight font-semibold">
          Welcome to Sovereign Reserve
        </h1>
        <p className="text-sm text-[#44474d]">
          Personal &amp; Commercial Banking Portal
        </p>
      </div>

      {/* Segmented Tabs (Personal, Private Wealth, Corporate) */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#e3e9f1] rounded-lg border border-[#c5c6cd]/30" id="account-type-tabs">
        <button
          type="button"
          onClick={() => onSelectTab('personal')}
          className={`py-2 px-1 text-center rounded text-xs font-semibold tracking-wider transition-all duration-200 ${
            selectedTab === 'personal'
              ? 'bg-white text-[#0d1c32] shadow-sm font-bold'
              : 'text-[#44474d] hover:text-[#0d1c32]'
          }`}
        >
          Personal
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('wealth')}
          className={`py-2 px-1 text-center rounded text-xs font-semibold tracking-wider transition-all duration-200 ${
            selectedTab === 'wealth'
              ? 'bg-white text-[#0d1c32] shadow-sm font-bold'
              : 'text-[#44474d] hover:text-[#0d1c32]'
          }`}
        >
          Private Wealth
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('corporate')}
          className={`py-2 px-1 text-center rounded text-xs font-semibold tracking-wider transition-all duration-200 ${
            selectedTab === 'corporate'
              ? 'bg-white text-[#0d1c32] shadow-sm font-bold'
              : 'text-[#44474d] hover:text-[#0d1c32]'
          }`}
        >
          Corporate
        </button>
      </div>

      {/* Monolithic Vault Authentication Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col gap-4 relative overflow-hidden border border-[#c5c6cd]/40">
        {/* Top hairline gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#bcdafe] via-[#446180] to-[#0d1c32]"></div>

        {/* Sign‑In Header */}
        <div className="flex items-center justify-between bg-[#eef4fc] p-3 rounded-lg border border-[#dde3eb]">
          <span className="text-sm font-semibold text-[#161c22]">Sign in to access your vault</span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* User Identification */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="user-id"
              className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider"
            >
              User Identification
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#446180] text-[20px] pointer-events-none">
                badge
              </span>
              <input
                id="user-id"
                type="text"
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                className="w-full h-12 pl-10 pr-10 bg-[#eef4fc] focus:bg-white focus:ring-1 focus:ring-[#0d1c32] rounded text-[#161c22] text-sm transition-all outline-none border border-transparent focus:border-[#0d1c32]"
                required
              />
              <span
                id="user-verified-icon"
                className="material-symbols-outlined absolute right-3 text-[#446180] text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
          </div>

          {/* Access Passcode */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="user-password"
                className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider"
              >
                Access Passcode
              </label>
              <span className="text-[11px] font-semibold text-[#446180]">Secured Pin</span>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#446180] text-[20px] pointer-events-none">
                lock
              </span>
              <input
                id="user-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter vault password"
                className="w-full h-12 pl-10 pr-12 bg-[#eef4fc] focus:bg-white focus:ring-1 focus:ring-[#0d1c32] rounded text-[#161c22] text-sm transition-all outline-none border border-transparent focus:border-[#0d1c32]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                className="absolute right-3 text-[#44474d] hover:text-[#161c22] transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember User ID & Trusted Hardware */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#dde3eb] text-[#0d1c32] accent-[#0d1c32] focus:ring-0"
              />
              <span className="text-xs text-[#161c22]">Remember User ID</span>
            </label>
            <span className="text-[11px] font-medium text-[#44474d]">Trusted Hardware</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              id="login-btn"
              type="submit"
              disabled={isAuthenticating || authSuccess}
              className="w-full h-12 bg-[#0d1c32] hover:bg-black active:scale-[0.99] text-white rounded font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-150 cursor-pointer disabled:opacity-80"
            >
              {isAuthenticating ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  <span>Authenticating Vault...</span>
                </>
              ) : authSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[18px] text-emerald-400">verified</span>
                  <span>Vault Unlocked</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Inline auth error */}
            {authError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded px-3 py-2 text-xs font-semibold animate-in fade-in">
                <span className="material-symbols-outlined text-[16px] text-red-600">error</span>
                <span>{authError === 'Invalid credentials' ? 'Invalid username or password. Please try again.' : authError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onBiometricTrigger}
              className="w-full h-12 bg-[#eef4fc] hover:bg-[#e3e9f1] active:scale-[0.99] text-[#161c22] rounded font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-150 border border-[#dde3eb] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#446180] text-[22px]">fingerprint</span>
              <span>Instant Biometric Key</span>
            </button>
          </div>
        </form>

        {/* Secondary Links */}
        <div className="flex items-center justify-between pt-1 text-center">
          <button
            type="button"
            onClick={onOpenRecovery}
            className="text-[11px] font-semibold text-[#446180] hover:underline py-1"
          >
            Forgot Credentials?
          </button>
          <span className="text-[#c5c6cd] text-xs">•</span>
          <button
            type="button"
            onClick={onOpenRegister}
            className="text-[11px] font-semibold text-[#0d1c32] hover:underline py-1"
          >
            Activate New Card / Register
          </button>
        </div>

        {/* Security Advisory Strip */}
        <div className="bg-[#eef4fc] p-3 rounded flex items-center gap-2.5 border border-[#dde3eb]">
          <span className="material-symbols-outlined text-[#446180] text-[18px] flex-shrink-0">history</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-[#44474d] uppercase tracking-wider">
              Security Advisory
            </span>
            <span className="text-xs text-[#161c22]">
              {profile.lastAccess}
            </span>
          </div>
        </div>
      </div>

      {/* Pre-Authentication Services */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-[#446180] uppercase tracking-widest">
            Pre-Authentication Services
          </span>
          <span className="text-[11px] text-[#44474d]">Immediate Assistance</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Quick Balance */}
          <button
            type="button"
            onClick={onOpenQuickBalance}
            className="flex flex-col items-center justify-center text-center p-3 bg-white hover:bg-[#eef4fc] rounded-lg shadow-xs gap-1 transition-colors min-h-[92px] border border-[#c5c6cd]/30"
          >
            <div className="w-10 h-10 rounded-full bg-[#e8eef6] flex items-center justify-center text-[#446180]">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
            <span className="text-xs font-semibold text-[#161c22] leading-tight">Quick Balance</span>
            <span className="text-[11px] text-[#44474d]">Instant View</span>
          </button>

          {/* Branches & ATM */}
          <button
            type="button"
            onClick={onOpenBranches}
            className="flex flex-col items-center justify-center text-center p-3 bg-white hover:bg-[#eef4fc] rounded-lg shadow-xs gap-1 transition-colors min-h-[92px] border border-[#c5c6cd]/30"
          >
            <div className="w-10 h-10 rounded-full bg-[#e8eef6] flex items-center justify-center text-[#446180]">
              <span className="material-symbols-outlined text-[20px]">explore</span>
            </div>
            <span className="text-xs font-semibold text-[#161c22] leading-tight">Branches &amp; ATM</span>
            <span className="text-[11px] text-[#44474d]">GPS Map</span>
          </button>

          {/* 24/7 Concierge */}
          <button
            type="button"
            onClick={onOpenConcierge}
            className="flex flex-col items-center justify-center text-center p-3 bg-white hover:bg-[#eef4fc] rounded-lg shadow-xs gap-1 transition-colors min-h-[92px] border border-[#c5c6cd]/30"
          >
            <div className="w-10 h-10 rounded-full bg-[#e8eef6] flex items-center justify-center text-[#446180]">
              <span className="material-symbols-outlined text-[20px]">room_service</span>
            </div>
            <span className="text-xs font-semibold text-[#161c22] leading-tight">24/7 Concierge</span>
            <span className="text-[11px] text-[#44474d]">Private Line</span>
          </button>
        </div>
      </div>

      {/* Zero-Liability Sovereign Shield Card */}
      <div className="bg-[#e8eef6] p-4 rounded-xl flex items-center gap-3.5 shadow-xs border border-[#c5c6cd]/40">
        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#0d1c32] flex-shrink-0 shadow-xs border border-[#dde3eb]">
          <span className="material-symbols-outlined text-[26px]">shield_with_heart</span>
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-base font-semibold text-[#161c22]">
            Zero-Liability Sovereign Shield
          </span>
          <p className="text-xs text-[#44474d] leading-relaxed">
            Your balances remain federally insured to maximum statutory limits and insured against unauthorized telemetric transactions.
          </p>
        </div>
      </div>

      {/* Disclosures & Regulatory Footer */}
      <footer className="mt-4 px-2 text-center flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-3 text-[#44474d]">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#446180]">verified_user</span>
            <span className="text-[11px] font-semibold tracking-wider">MEMBER FDIC</span>
          </div>
          <span className="text-[#c5c6cd]">•</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#446180]">holiday_village</span>
            <span className="text-[11px] font-semibold tracking-wider">EQUAL HOUSING LENDER</span>
          </div>
        </div>

        <p className="text-xs text-[#44474d] max-w-sm leading-relaxed">
          Sovereign Reserve Bank, N.A. Real-time institutional encryption actively guarded by zero-trust fraud architecture.
        </p>

        <div className="flex items-center justify-center gap-3 text-xs font-semibold text-[#446180]">
          <button type="button" onClick={onOpenRecovery} className="hover:underline">
            Privacy &amp; Security
          </button>
          <span className="text-[#c5c6cd]">•</span>
          <button type="button" onClick={onOpenRecovery} className="hover:underline">
            Terms of Access
          </button>
          <span className="text-[#c5c6cd]">•</span>
          <button type="button" onClick={onOpenRecovery} className="hover:underline">
            Fraud Guarantee
          </button>
        </div>
      </footer>
    </div>
  );
};
