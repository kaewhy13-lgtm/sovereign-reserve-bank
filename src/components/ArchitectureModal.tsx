import React, { useState } from 'react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'diagram' | 'mend' | 'security'>(
    'overview'
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyPlan = () => {
    navigator.clipboard.writeText(`SOVEREIGN RESERVE - ARCHITECTURAL BLUEPRINT
==================================================
1. System Layers:
   - Presentation Layer: React 19 + Tailwind v4 + Material Symbols + Newsreader & Hanken Grotesk fonts
   - State & Domain Layer: TypeScript domain models (UserProfile, BankAccount, Transaction, SecurityKeyItem, BranchLocation)
   - Authentication Layer: Multi-tier auth (Passcode, FIDO2/WebAuthn Biometric handshake, Hardware key simulation)
   - Navigation & Routing: Vault Access (Login & Auth), Security Center, Support/Concierge, Flagship Branches
   - Pre-Auth Services: Quick Balance snapshot, Branch/ATM locator, 24/7 Concierge Hotline

2. Component Hierarchy:
   App.tsx (Main Coordinator & Session State)
   ├── Header.tsx (Brand, SSL Badge, Architecture trigger, Concierge, Profile)
   ├── VaultAccessScreen.tsx (Monolithic Card, Tabs, Inputs, Biometrics, Trust Badges)
   ├── DashboardScreen.tsx (Authenticated Portfolio, Bullion, Wire transfers, Titanium Card)
   ├── SecurityScreen.tsx (Hardware Keys, Zero-Trust defense, Session audit)
   ├── SupportScreen.tsx (Dedicated Wealth Banker, Concierge Hotline, Armored transit)
   ├── BranchesScreen.tsx (Global Vaults, Amenities, Real-time status)
   ├── Modals (BiometricModal, QuickBalanceModal, RecoveryModal, ActivateCardModal, ArchitectureModal)
   └── BottomNav.tsx (4 Persistent Navigation Anchors)

3. How to Mend and Extend:
   - To update design tokens: Edit /src/index.css @theme block.
   - To add a new authentication method: Extend /src/types.ts and update VaultAccessScreen.tsx.
   - To connect real backend: Swap /src/data/mockData.ts endpoints with REST/GraphQL or Firebase/CloudSQL SDK calls.`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0d1c32]/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#c5c6cd]/50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0d1c32] text-white flex items-center justify-between border-b border-[#1b3a57]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1b3a57] text-[#c5a059] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">account_tree</span>
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold tracking-wide">
                Sovereign Reserve Architecture Blueprint
              </h2>
              <p className="text-xs text-[#b9c7e4]">
                Engineering Specifications, Component Hierarchy & Maintenance Plan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyPlan}
              className="px-3 py-1.5 rounded bg-[#1b3a57] hover:bg-[#2b4967] text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied' : 'Copy Plan'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Sub-nav */}
        <div className="flex border-b border-[#dde3eb] bg-[#f6f9ff] px-6">
          <button
            onClick={() => setActiveSection('overview')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeSection === 'overview'
                ? 'border-[#0d1c32] text-[#0d1c32]'
                : 'border-transparent text-[#44474d] hover:text-[#0d1c32]'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveSection('diagram')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeSection === 'diagram'
                ? 'border-[#0d1c32] text-[#0d1c32]'
                : 'border-transparent text-[#44474d] hover:text-[#0d1c32]'
            }`}
          >
            Component Tree
          </button>
          <button
            onClick={() => setActiveSection('mend')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeSection === 'mend'
                ? 'border-[#0d1c32] text-[#0d1c32]'
                : 'border-transparent text-[#44474d] hover:text-[#0d1c32]'
            }`}
          >
            How to Mend & Extend
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeSection === 'security'
                ? 'border-[#0d1c32] text-[#0d1c32]'
                : 'border-transparent text-[#44474d] hover:text-[#0d1c32]'
            }`}
          >
            Security & Zero-Trust
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#161c22]">
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#eef4fc] border border-[#c5c6cd]/50">
                  <span className="material-symbols-outlined text-[#446180] text-[24px]">verified_user</span>
                  <h4 className="font-serif font-semibold text-base mt-2">Institutional UX</h4>
                  <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                    Engineered with Newsreader editorial serif typography, crisp micro-borders, and high contrast for sovereign wealth and institutional banking.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#eef4fc] border border-[#c5c6cd]/50">
                  <span className="material-symbols-outlined text-[#446180] text-[24px]">fingerprint</span>
                  <h4 className="font-serif font-semibold text-base mt-2">Hardware Passkeys</h4>
                  <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                    Full FIDO2 WebAuthn & biometric enclave verification flow, simulated with authentic timed cryptographic handshakes.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#eef4fc] border border-[#c5c6cd]/50">
                  <span className="material-symbols-outlined text-[#446180] text-[24px]">devices</span>
                  <h4 className="font-serif font-semibold text-base mt-2">Responsive Architecture</h4>
                  <p className="text-xs text-[#44474d] mt-1 leading-relaxed">
                    Pixel-perfect on mobile viewport (matching initial design exactly) with elegant responsive expansion on desktop displays.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#dde3eb]">
                <h4 className="font-serif font-semibold text-base mb-2">Layered Architectural Paradigm</h4>
                <ul className="space-y-2 text-xs text-[#44474d]">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d1c32] mt-1.5" />
                    <div>
                      <strong className="text-[#0d1c32]">Presentation Layer:</strong> Modular React 19 functional components paired with Tailwind v4 utilities. Accessible semantic HTML landmarks (`header`, `main`, `nav`, `form`, `dialog`).
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d1c32] mt-1.5" />
                    <div>
                      <strong className="text-[#0d1c32]">State Coordination:</strong> Centralized immutable state in `App.tsx` governing authentication status, selected tier (Personal, Wealth, Corporate), modal states, and active tabs.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d1c32] mt-1.5" />
                    <div>
                      <strong className="text-[#0d1c32]">Domain & Contract Layer:</strong> Pure TypeScript definitions in `/src/types.ts` ensuring strict type boundaries across cards, accounts, wires, and security tokens.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'diagram' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#dde3eb] font-mono text-xs overflow-x-auto">
                <pre className="text-[#0d1c32] leading-relaxed">
{`App.tsx (Global State Manager & Session Lifecycle)
 │
 ├── Header.tsx (Persistent Brand, SSL Indicator, Architecture Trigger, Concierge)
 │
 ├── [View Switcher based on Active Navigation Tab & Auth State]
 │    │
 │    ├── VaultAccessScreen.tsx (When Unauthenticated - Matches Image 1)
 │    │    ├── Handshake Status Banner (FIDO2 & AES-256)
 │    │    ├── Headline (Newsreader Serif)
 │    │    ├── Account Type Segmented Tabs (Personal / Wealth / Corporate)
 │    │    ├── Monolithic Authentication Card
 │    │    │    ├── Saved Profile Strip (Alexander V. •••• 8821)
 │    │    │    ├── User ID & Passcode Secured Inputs
 │    │    │    ├── Hardware Remember Toggle
 │    │    │    ├── Primary Action: "Log In Securely"
 │    │    │    ├── Secondary Action: "Instant Biometric Key"
 │    │    │    ├── Ancillary Links (Forgot Credentials / Register Card)
 │    │    │    └── Security Advisory History Strip
 │    │    ├── Pre-Authentication Services (Quick Balance / Branches / Concierge)
 │    │    ├── Zero-Liability Sovereign Shield Card
 │    │    └── Footer (FDIC, Equal Housing, Legal links)
 │    │
 │    ├── DashboardScreen.tsx (When Authenticated - Sovereign Vault Portfolio)
 │    │    ├── Net Liquidity & Bullion Reserve Balances
 │    │    ├── Titanium Sovereign Physical Card Controls (Freeze / Reveal / Limits)
 │    │    ├── Recent Ledger Transactions with cryptographic hashes
 │    │    └── Outgoing Fedwire / Dual-Key Approval Simulator
 │    │
 │    ├── SecurityScreen.tsx (Tab 2: Zero-Trust Defense & Enclave Management)
 │    ├── SupportScreen.tsx (Tab 3: 24/7 Private Concierge & Dedicated Banker)
 │    └── BranchesScreen.tsx (Tab 4: Global Flagship Lounges & Bullion Vaults)
 │
 ├── Modals & Overlay Portals:
 │    ├── BiometricModal.tsx (Pulsing Passkey Handshake)
 │    ├── QuickBalanceModal.tsx (Instant Balances without full login)
 │    ├── RecoveryModal.tsx (Zero-Knowledge Credential Recovery)
 │    ├── ActivateCardModal.tsx (Titanium Card Provisioning)
 │    └── ArchitectureModal.tsx (This Interactive Blueprint)
 │
 └── BottomNav.tsx (Persistent Navigation Dock: Vault / Security / Support / Branches)`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'mend' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#eef4fc] rounded-xl border border-[#c5c6cd]/50">
                <h4 className="font-serif font-semibold text-base text-[#0d1c32] mb-1">
                  How to Mend & Extend this Application
                </h4>
                <p className="text-xs text-[#44474d] mb-4">
                  Follow these modular patterns when adding new features or connecting to production APIs:
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-[#dde3eb]">
                    <strong className="text-[#0d1c32] block mb-1">1. Adding a New Account Tier or Client Type:</strong>
                    <p className="text-[#44474d]">
                      Edit <code className="bg-[#f6f9ff] px-1 py-0.5 rounded">src/types.ts</code> to update <code className="bg-[#f6f9ff] px-1 py-0.5 rounded">TabType</code> and add profile records in <code className="bg-[#f6f9ff] px-1 py-0.5 rounded">src/data/mockData.ts</code>. The UI automatically handles rendering and pre-population.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#dde3eb]">
                    <strong className="text-[#0d1c32] block mb-1">2. Connecting Real Authentication (OAuth / Backend API):</strong>
                    <p className="text-[#44474d]">
                      In <code className="bg-[#f6f9ff] px-1 py-0.5 rounded">src/App.tsx</code>, replace the simulated <code className="bg-[#f6f9ff] px-1 py-0.5 rounded">handleLogin</code> and <code className="bg-[#f6f9ff] px-1 py-0.5 rounded">handleBiometricSuccess</code> functions with real WebAuthn calls via <code className="bg-[#f6f9ff] px-1 py-0.5 rounded">navigator.credentials.get()</code> or your backend authentication endpoint.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#dde3eb]">
                    <strong className="text-[#0d1c32] block mb-1">3. Customizing Brand Colors & Fonts:</strong>
                    <p className="text-[#44474d]">
                      Edit <code className="bg-[#f6f9ff] px-1 py-0.5 rounded">src/index.css</code>. Fonts are registered under <code className="bg-[#f6f9ff] px-1 py-0.5 rounded">@theme</code> for Newsreader and Hanken Grotesk, keeping all components in sync automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-[#dde3eb]">
                <h4 className="font-serif font-semibold text-base mb-2">Zero-Trust & Compliance Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#f6f9ff] rounded-lg border border-[#dde3eb]">
                    <span className="font-semibold text-[#0d1c32] block">FIDO2 / WebAuthn Level 3</span>
                    <span className="text-[#44474d]">
                      Enclave-attested public key cryptography preventing phishing, session hijacking, and credential stuffing.
                    </span>
                  </div>
                  <div className="p-3 bg-[#f6f9ff] rounded-lg border border-[#dde3eb]">
                    <span className="font-semibold text-[#0d1c32] block">FDIC Insurance & Shield</span>
                    <span className="text-[#44474d]">
                      Balances protected up to statutory maximums with sovereign zero-liability against telemetric fraud.
                    </span>
                  </div>
                  <div className="p-3 bg-[#f6f9ff] rounded-lg border border-[#dde3eb]">
                    <span className="font-semibold text-[#0d1c32] block">Immutable Ledger Hashes</span>
                    <span className="text-[#44474d]">
                      Every wire transfer and vault storage fee is stamped with a SHA-256 verifiable cryptographic audit hash.
                    </span>
                  </div>
                  <div className="p-3 bg-[#f6f9ff] rounded-lg border border-[#dde3eb]">
                    <span className="font-semibold text-[#0d1c32] block">Dual-Key Wire Authorization</span>
                    <span className="text-[#44474d]">
                      High-value transactions exceeding $250,000 require concurrent verification from two distinct hardware keys.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f6f9ff] border-t border-[#dde3eb] flex justify-between items-center text-xs text-[#44474d]">
          <span>Document Ref: SR-ARCH-2026-v1.4 • Sovereign Reserve Engineering</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0d1c32] hover:bg-black text-white font-semibold rounded-lg uppercase tracking-wider text-xs"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
