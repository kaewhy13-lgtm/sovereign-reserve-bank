import React, { useState } from 'react';
import { AuthAPI, setToken } from '../api';

interface ActivateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token?: string, profile?: Record<string, unknown>) => void;
}

export const ActivateCardModal: React.FC<ActivateCardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [lastFour, setLastFour] = useState('8821');
  const [cvv, setCvv] = useState('942');
  const [ssnLast4, setSsnLast4] = useState('1904');
  const [status, setStatus] = useState<'form' | 'activating' | 'success'>('form');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('activating');

    const { data, error: apiError } = await AuthAPI.register({
      cardLastFour: lastFour,
      cvv,
      ssnLast4,
    });

    if (apiError) {
      setStatus('form');
      setError(apiError);
      return;
    }

    setStatus('success');
    setTimeout(() => {
      onSuccess(data?.token, data?.profile as Record<string, unknown> | undefined);
    }, 1200);
  };

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
              <span className="material-symbols-outlined text-[18px]">credit_card</span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#161c22]">
                Activate Sovereign Card
              </h3>
              <p className="text-xs text-[#44474d]">Precision Titanium Debit & Black Reserve Card</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#44474d] hover:text-[#161c22] p-1 rounded-full hover:bg-[#eef4fc]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {status === 'activating' ? (
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <span className="material-symbols-outlined text-[44px] text-[#446180] animate-spin">
              autorenew
            </span>
            <h4 className="font-serif text-lg font-semibold text-[#161c22]">
              Cryptographic Card Handshake...
            </h4>
            <p className="text-xs text-[#44474d]">
              Provisioning EMV contact chips and linking biometric enclave to card #•••• {lastFour}.
            </p>
          </div>
        ) : status === 'success' ? (
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h4 className="font-serif text-lg font-semibold text-[#161c22]">
              Sovereign Card Activated
            </h4>
            <p className="text-xs text-[#44474d]">
              Your physical titanium card is unlocked with instant zero-liability protection and global ATM limits.
            </p>
          </div>
        ) : (
          <form onSubmit={handleActivate} className="flex flex-col gap-3.5">
            {/* Visual Mini Card */}
            <div className="h-32 rounded-xl bg-gradient-to-tr from-[#0a192f] via-[#1b3a57] to-[#0a192f] p-4 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#c5a059]/20 to-transparent pointer-events-none" />
              <div className="flex justify-between items-start">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#c5a059]">
                  Sovereign Reserve Titanium
                </span>
                <span className="material-symbols-outlined text-[20px] text-[#c5a059]">contactless</span>
              </div>
              <div className="text-sm tracking-widest font-mono">
                •••• •••• •••• {lastFour || '8821'}
              </div>
              <div className="flex justify-between items-end text-[10px] text-gray-300">
                <span>ALEXANDER VANDERBILT</span>
                <span>EXP 10/29</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                Last 4 Digits on Card Front
              </label>
              <input
                type="text"
                maxLength={4}
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ''))}
                className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-sm text-[#161c22] font-mono tracking-widest border border-[#c5c6cd]/50 focus:bg-white focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                  3-Digit Security CVV
                </label>
                <input
                  type="password"
                  maxLength={3}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-sm text-[#161c22] font-mono border border-[#c5c6cd]/50 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                  Tax ID / SSN (Last 4)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={ssnLast4}
                  onChange={(e) => setSsnLast4(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-sm text-[#161c22] font-mono border border-[#c5c6cd]/50 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded px-3 py-2 text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px] text-red-600">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 bg-[#e8eef6] hover:bg-[#dde3eb] text-[#161c22] rounded-lg text-xs font-semibold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-11 bg-[#0d1c32] hover:bg-black text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md"
              >
                Activate Card
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
