import React from 'react';

interface HeaderProps {
  isAuthenticated: boolean;
  onOpenArchitecture: () => void;
  onOpenConcierge: () => void;
  onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  onOpenArchitecture,
  onOpenConcierge,
  onProfileClick,
}) => {
  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[#f6f9ff]/90 backdrop-blur-xl border-b border-[#dde3eb]/60 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand & Security Certification */}
        <div className="flex items-center gap-3">
          <img
            alt="Sovereign Reserve Bank Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XCy-n-_RUf8u0KQtKx4Po2Awg_gTPVy0SpCJjPmFQv2fVu7k1mEFPqITC-yftSMAn4bZs0m8jZ-NBPSkX0LMRCWx41SCx92V6JBbNylXoGA-yOUDIxkxdwj59DdKvxIFR_O_9PLqzjp3zSOO9SXYTQY-HQufsPylXfAddRe2C0a8PbP0VhQh31vklyijhGnpvm2F5HNvjygOCKramAevb0Y7ofNC9V7JtwOzcHL71SJFf2CFz2WMP6GaU"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-base sm:text-lg text-[#0d1c32] tracking-tight leading-none">
              Sovereign Reserve
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[13px] text-[#446180]">lock</span>
              <span className="text-[10px] font-semibold text-[#44474d] uppercase tracking-wider">
                256-Bit SSL Encrypted
              </span>
            </div>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenArchitecture}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#e8eef6] hover:bg-[#dde3eb] text-[#0d1c32] text-xs font-semibold tracking-wide transition-colors border border-[#c5c6cd]/50 shadow-xs"
            title="View Architectural Plan & System Specifications"
            aria-label="View Architectural Plan"
          >
            <span className="material-symbols-outlined text-[16px] text-[#446180]">account_tree</span>
            <span className="hidden sm:inline">Architecture Plan</span>
          </button>

          <span className="hidden md:inline text-sm font-semibold text-[#161c22] px-1 font-serif">
            {isAuthenticated ? 'Private Client Suite' : 'Member Portal'}
          </span>

          <button
            aria-label="Customer Concierge Support"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#44474d] hover:text-[#0d1c32] hover:bg-[#e8eef6] transition-colors"
            onClick={onOpenConcierge}
          >
            <span className="material-symbols-outlined text-[22px]">support_agent</span>
          </button>

          <button
            aria-label={isAuthenticated ? 'Account Profile & Log Out' : 'Member Profile'}
            onClick={onProfileClick}
            className="relative w-8 h-8 rounded-full bg-[#0d1c32] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-xs"
            title={isAuthenticated ? 'Lock Vault / Sign Out' : 'Member Profile'}
          >
            <span className="material-symbols-outlined text-white text-[18px]">person</span>
            {isAuthenticated && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
