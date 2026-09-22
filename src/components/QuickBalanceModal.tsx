import React from 'react';
import { UserProfile } from '../types';

interface QuickBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onLogin: () => void;
}

export const QuickBalanceModal: React.FC<QuickBalanceModalProps> = ({
  isOpen,
  onClose,
  profile,
  onLogin,
}) => {
  if (!isOpen) return null;

  const formatUSD = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0d1c32]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 border border-[#c5c6cd]/50">
        <div className="flex items-center justify-between pb-3 border-b border-[#dde3eb]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0d1c32] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#161c22]">
                Quick Balance View
              </h3>
              <p className="text-xs text-[#44474d]">{profile.name} • {profile.accountNumberMasked}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#44474d] hover:text-[#161c22] p-1 rounded-full hover:bg-[#eef4fc]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Security watermark notice */}
        <div className="bg-[#eef4fc] p-3 rounded-lg flex items-center gap-2 text-xs text-[#446180]">
          <span className="material-symbols-outlined text-[18px]">lock_clock</span>
          <span>Snapshot cached via Trusted Hardware Enclave. Full vault unlock required for transfers.</span>
        </div>

        {/* Balance cards */}
        <div className="space-y-2.5">
          <div className="p-3.5 bg-[#f6f9ff] rounded-xl border border-[#dde3eb] flex justify-between items-center">
            <div>
              <span className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block">
                Sovereign Premier Checking
              </span>
              <span className="text-xl font-semibold text-[#0d1c32]">
                {formatUSD(profile.balancePreview.checking)}
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
              Available
            </span>
          </div>

          <div className="p-3.5 bg-[#f6f9ff] rounded-xl border border-[#dde3eb] flex justify-between items-center">
            <div>
              <span className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block">
                Treasury Yield Reserve (5.15% APY)
              </span>
              <span className="text-xl font-semibold text-[#0d1c32]">
                {formatUSD(profile.balancePreview.reserve)}
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
              Interest Accruing
            </span>
          </div>

          <div className="p-3.5 bg-[#f6f9ff] rounded-xl border border-[#dde3eb] flex justify-between items-center">
            <div>
              <span className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block">
                Zurich Allocated Bullion
              </span>
              <span className="text-lg font-semibold text-[#0d1c32]">
                {profile.balancePreview.bullionOz} oz Fine Gold (~$1,420,000)
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
              Vaulted
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              onLogin();
            }}
            className="w-full h-11 bg-[#0d1c32] hover:bg-black text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">vpn_key</span>
            <span>Authenticate to Manage Funds</span>
          </button>
          <button
            onClick={onClose}
            className="w-full h-10 bg-[#e8eef6] hover:bg-[#dde3eb] text-[#161c22] font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
