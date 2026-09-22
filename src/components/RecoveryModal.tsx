import React, { useState } from 'react';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({ isOpen, onClose }) => {
  const [method, setMethod] = useState<'hardware' | 'officer' | 'phrase'>('hardware');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0d1c32]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 border border-[#c5c6cd]/50">
        <div className="flex items-center justify-between pb-3 border-b border-[#dde3eb]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#eef4fc] text-[#446180] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">enhanced_encryption</span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#161c22]">
                Vault Credentials Recovery
              </h3>
              <p className="text-xs text-[#44474d]">Sovereign Reserve Zero-Knowledge Recovery Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#44474d] hover:text-[#161c22] p-1 rounded-full hover:bg-[#eef4fc]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
            </div>
            <h4 className="font-serif text-lg font-semibold text-[#161c22]">
              Cryptographic Recovery Dispatched
            </h4>
            <p className="text-xs text-[#44474d] max-w-xs">
              An encrypted one-time challenge token has been routed to your registered hardware key and your assigned Private Wealth Director.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-2 px-6 h-10 bg-[#0d1c32] text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
            >
              Return to Vault Entry
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="flex flex-col gap-4"
          >
            <p className="text-xs text-[#44474d]">
              Select your authenticated recovery channel to restore access to your private reserve:
            </p>

            <div className="space-y-2">
              <label
                onClick={() => setMethod('hardware')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  method === 'hardware'
                    ? 'border-[#0d1c32] bg-[#f6f9ff] ring-1 ring-[#0d1c32]'
                    : 'border-[#dde3eb] hover:bg-[#f6f9ff]'
                }`}
              >
                <input
                  type="radio"
                  name="recoveryMethod"
                  checked={method === 'hardware'}
                  onChange={() => setMethod('hardware')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-[#0d1c32] block">
                    FIDO2 Physical Hardware Token / YubiKey
                  </span>
                  <span className="text-xs text-[#44474d]">
                    Touch your registered hardware key to generate an ephemeral challenge response.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setMethod('officer')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  method === 'officer'
                    ? 'border-[#0d1c32] bg-[#f6f9ff] ring-1 ring-[#0d1c32]'
                    : 'border-[#dde3eb] hover:bg-[#f6f9ff]'
                }`}
              >
                <input
                  type="radio"
                  name="recoveryMethod"
                  checked={method === 'officer'}
                  onChange={() => setMethod('officer')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-[#0d1c32] block">
                    Assigned Wealth Officer Dual-Verification
                  </span>
                  <span className="text-xs text-[#44474d]">
                    Live video handshake with Julian Montgomery (Senior Director, Manhattan Flagship).
                  </span>
                </div>
              </label>

              <label
                onClick={() => setMethod('phrase')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  method === 'phrase'
                    ? 'border-[#0d1c32] bg-[#f6f9ff] ring-1 ring-[#0d1c32]'
                    : 'border-[#dde3eb] hover:bg-[#f6f9ff]'
                }`}
              >
                <input
                  type="radio"
                  name="recoveryMethod"
                  checked={method === 'phrase'}
                  onChange={() => setMethod('phrase')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-[#0d1c32] block">
                    Offline Vault Seed Cipher
                  </span>
                  <span className="text-xs text-[#44474d]">
                    Enter the 16-character cipher provided inside your Sovereign Titanium welcome vault.
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                Account ID or Primary Email
              </label>
              <input
                type="text"
                defaultValue="alexander.vanderbilt"
                className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-sm text-[#161c22] border border-[#c5c6cd]/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0d1c32]"
                required
              />
            </div>

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
                Initiate Recovery
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
