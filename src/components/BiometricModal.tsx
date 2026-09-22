import React, { useEffect, useState } from 'react';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userName?: string;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userName = 'Alexander V.',
}) => {
  const [phase, setPhase] = useState<'scanning' | 'verified'>('scanning');

  useEffect(() => {
    if (!isOpen) {
      setPhase('scanning');
      return;
    }

    const timer = setTimeout(() => {
      setPhase('verified');
      const finishTimer = setTimeout(() => {
        onSuccess();
      }, 700);
      return () => clearTimeout(finishTimer);
    }, 1800);

    return () => clearTimeout(timer);
  }, [isOpen, onSuccess]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-modal-title"
      className="fixed inset-0 z-50 bg-[#0d1c32]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center text-center gap-4 border border-[#c5c6cd]/40">
        {/* Pulsing Biometric Enclave Graphic */}
        <div className="relative w-20 h-20 rounded-full bg-[#eef4fc] flex items-center justify-center text-[#446180]">
          {phase === 'scanning' ? (
            <>
              <span className="material-symbols-outlined text-[42px] animate-pulse">fingerprint</span>
              <div className="absolute inset-0 rounded-full border-2 border-[#446180]/30 animate-ping pointer-events-none" />
            </>
          ) : (
            <span className="material-symbols-outlined text-[44px] text-emerald-600 animate-in zoom-in-75 duration-300">
              verified_user
            </span>
          )}
        </div>

        {/* Text descriptions */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-[#446180] tracking-widest uppercase">
            Hardware Security Key
          </span>
          <h3 id="biometric-modal-title" className="text-xl font-semibold text-[#161c22] font-serif">
            {phase === 'scanning' ? 'Passkey Verification' : 'Handshake Verified'}
          </h3>
          <p className="text-sm text-[#44474d] leading-relaxed">
            {phase === 'scanning'
              ? `Confirming biometric signature with ${userName}'s device security enclave...`
              : 'Cryptographic identity confirmed. Unlocking sovereign vault.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#eef4fc] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              phase === 'scanning' ? 'bg-[#446180] w-3/4 animate-pulse' : 'bg-emerald-600 w-full'
            }`}
          />
        </div>

        {/* Actions */}
        <div className="w-full pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 bg-[#e8eef6] hover:bg-[#dde3eb] active:scale-[0.99] rounded-lg text-[#161c22] font-semibold text-xs tracking-wider uppercase transition-colors"
          >
            Cancel Handshake
          </button>
        </div>
      </div>
    </div>
  );
};
