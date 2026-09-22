# Sovereign Reserve Banking Portal — Architectural Plan & System Blueprint

## 1. System Overview & Vision
The **Sovereign Reserve** portal is an ultra-secure, institutional-grade personal and commercial banking interface engineered for high-net-worth private wealth clients, family office trusts, and corporate treasuries.

The interface adheres to **Corporate Modern** with **Subtle Tactile Realism**, combining editorial typography (**Newsreader** serif headlines), high-precision metric body fonts (**Hanken Grotesk**), crisp micro-borders, and deep obsidian navy tones (`#0d1c32`) paired with brushed champagne gold accents (`#c5a059`).

---

## 2. Component Hierarchy & Directory Structure

```
├── ARCHITECTURE.md              # System Architecture & Developer Guide (this document)
├── index.html                   # HTML entry point with fonts & SEO meta tags
├── metadata.json                # AI Studio application metadata
├── package.json                 # Dependency manifests (React 19, Tailwind v4, Motion, Lucide)
├── tsconfig.json                # Strict TypeScript configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS plugin
│
└── src/
    ├── main.tsx                 # Root React DOM entry
    ├── App.tsx                  # Master application orchestrator, state store, & modal controller
    ├── index.css                # Global Tailwind CSS v4 design tokens and Google icon utilities
    ├── types.ts                 # Domain contracts (UserProfile, BankAccount, Transaction, SecurityKey, BranchLocation)
    │
    ├── data/
    │   └── mockData.ts          # Authentic mock fixtures for Personal, Wealth, and Corporate tiers
    │
    └── components/
        ├── Header.tsx           # Global header with logo, SSL status, Architecture trigger & Concierge
        ├── BottomNav.tsx        # Persistent 4-item navigation dock (Vault, Security, Support, Branches)
        ├── VaultAccessScreen.tsx# Monolithic Vault Login Card matching Image 1 exactly
        ├── DashboardScreen.tsx  # Authenticated Sovereign Vault Portfolio & Wire Transfer Desk
        ├── SpendingTrendsChart.tsx # Recharts-based multi-tier monthly spending trends bar chart
        ├── SecurityScreen.tsx   # Zero-Trust Security Center, FIDO2 Hardware Keys, Session Auditing
        ├── SupportScreen.tsx    # 24/7 Concierge, Private Wealth Director Julian Montgomery, Armored Courier
        ├── BranchesScreen.tsx   # Global Flagship Lounges & Bullion Vaults with live status
        ├── BiometricModal.tsx   # Passkey/Biometric enclave handshake modal with pulsing scan
        ├── QuickBalanceModal.tsx# Pre-auth instant liquid balance preview drawer
        ├── RecoveryModal.tsx    # Zero-knowledge credential recovery dialog
        ├── ActivateCardModal.tsx# Sovereign Titanium Debit Card activation & EMV handshake
        └── ArchitectureModal.tsx# In-app interactive Architectural Plan viewer
```

---

## 3. State Management & Lifecycle

All global application state is managed cleanly in `App.tsx` through functional React state hooks:
- `isAuthenticated: boolean` — Toggles between the **Vault Access (Login)** screen and the **Authenticated Dashboard**.
- `selectedTab: TabType ('personal' | 'wealth' | 'corporate')` — Controls context switching between Personal Sovereign, Private Wealth Trust, and Corporate Treasury accounts.
- `activeNav: MainNavTab ('vault' | 'security' | 'support' | 'branches')` — Directs bottom navigation bar active view.
- `activeModal: ModalType` — Controls active overlay (`biometric`, `quick-balance`, `recovery`, `activate-card`, `architecture`).

---

## 4. How to Mend and Extend ("Maintenance Guide")

### Adding a New Banking Feature or Sub-View
1. Declare the required domain types in `/src/types.ts`.
2. Add realistic default values in `/src/data/mockData.ts`.
3. Create an isolated sub-component in `/src/components/MyNewFeature.tsx`.
4. Import and mount it conditionally in `App.tsx`.

### Connecting a Real Backend or API Service
- **Authentication**: In `src/App.tsx`, replace `handleLogin` and `handleBiometricSuccess` with your real authentication API endpoint or WebAuthn `navigator.credentials.get()`.
- **Data Fetching**: Replace imports from `mockData.ts` with React `useEffect` or React Query hooks fetching from your `/api/vault` routes.
- **Security Rules**: All server-side routes should enforce Bearer token validation and rate limiting.

### Adjusting Brand Styling & Colors
- Colors and typography variables are declared in `/src/index.css`.
- Modify the CSS `@theme` block to adjust primary fonts or color scales across the entire application without touching individual components.

---

## 5. Security Architecture (Zero-Trust & FIDO2)
- **Transport**: 256-Bit SSL/TLS Encryption with mandatory HTTPS.
- **Authentication Factors**: Password credentials + FIDO2 / WebAuthn passkey handshake.
- **Deposit Insurance**: Member FDIC insured to statutory maximums + Zero-Liability Sovereign Shield protection against unauthorized telemetric transactions.
- **Ledger Verification**: Every transaction displays a verifiable cryptographic hash.
