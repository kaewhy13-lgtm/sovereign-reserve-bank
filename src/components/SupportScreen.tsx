import React, { useState } from 'react';
import { ConciergeAPI } from '../api';

export const SupportScreen: React.FC = () => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    await ConciergeAPI.contact(ticketSubject, ticketMessage);
    setTimeout(() => {
      setSubmitted(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 gap-6 animate-in fade-in duration-300">
      {/* Concierge Desk Banner */}
      <div className="bg-[#0d1c32] text-white p-6 rounded-2xl shadow-lg border border-[#1b3a57] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#1b3a57] border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059]">
            <span className="material-symbols-outlined text-[26px]">support_agent</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-widest uppercase bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5 rounded">
                24/7 Private Wealth Concierge
              </span>
              <span className="text-xs text-[#b9c7e4]">Dedicated Line</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold mt-0.5">
              Sovereign Concierge &amp; Private Banker
            </h2>
          </div>
        </div>

        <a
          href="tel:18005550199"
          className="px-4 py-2.5 rounded-lg bg-[#c5a059] hover:bg-[#b08c45] text-[#0d1c32] text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-colors shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
          <span>1-800-555-0199</span>
        </a>
      </div>

      {/* Dedicated Banker Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#dde3eb] shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-[#eef4fc] border-2 border-[#446180] flex items-center justify-center text-[#0d1c32] shadow-sm flex-shrink-0">
            <span className="material-symbols-outlined text-[36px]">person</span>
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="font-serif text-lg font-semibold text-[#161c22]">
                Julian Montgomery
              </h3>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Online &amp; Active
              </span>
            </div>
            <p className="text-xs font-semibold text-[#446180] uppercase tracking-wider mt-0.5">
              Managing Director • Sovereign Private Client Services
            </p>
            <p className="text-xs text-[#44474d] mt-1 max-w-md">
              Manhattan Flagship Office • Series 7, 63, 65 Registered. Available for direct wire verification, bullion depository appointments, and bespoke portfolio structuring.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <a
            href="tel:18005550199"
            className="px-4 py-2 rounded-lg bg-[#0d1c32] hover:bg-black text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
            <span>Direct Desk Call</span>
          </a>
          <button
            onClick={() => {
              setTicketSubject('Confidential Consultation with Julian Montgomery');
            }}
            className="px-4 py-2 rounded-lg bg-[#e8eef6] hover:bg-[#dde3eb] text-[#0d1c32] text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Secure Message</span>
          </button>
        </div>
      </div>

      {/* Services Grid (Armored courier, safe deposit, wire authorization) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#dde3eb] shadow-xs flex flex-col justify-between gap-3">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#eef4fc] text-[#446180] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <h4 className="font-serif text-sm font-semibold text-[#161c22]">
              Armored Bullion Transit
            </h4>
            <p className="text-xs text-[#44474d] mt-1">
              Discreet point-to-point armed escort transit for precious metals between airport customs and our vaults.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#446180] hover:underline cursor-pointer">
            Schedule Escort →
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#dde3eb] shadow-xs flex flex-col justify-between gap-3">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#eef4fc] text-[#446180] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[20px]">vpn_lock</span>
            </div>
            <h4 className="font-serif text-sm font-semibold text-[#161c22]">
              Emergency Card Freeze
            </h4>
            <p className="text-xs text-[#44474d] mt-1">
              Instant telemetric revocation across all merchant terminals, ATMs, and contactless tokens globally.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer">
            1-Click Card Freeze →
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#dde3eb] shadow-xs flex flex-col justify-between gap-3">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#eef4fc] text-[#446180] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[20px]">meeting_room</span>
            </div>
            <h4 className="font-serif text-sm font-semibold text-[#161c22]">
              Private Dining &amp; Salons
            </h4>
            <p className="text-xs text-[#44474d] mt-1">
              Reserve confidential executive conference suites and private dining in New York, Zurich, and London.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#446180] hover:underline cursor-pointer">
            Reserve Suite →
          </span>
        </div>
      </div>

      {/* Cryptographic Secure Message Dispatch */}
      <div className="bg-white rounded-2xl p-6 border border-[#dde3eb] shadow-xs space-y-4">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[#161c22]">
            End-to-End Encrypted Concierge Dispatch
          </h3>
          <p className="text-xs text-[#44474d]">
            Messages are signed with your session private key and delivered exclusively to your assigned officer.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 animate-in fade-in">
            <span className="material-symbols-outlined text-[24px] text-emerald-700">check_circle</span>
            <div>
              <strong className="block font-semibold">Message Dispatched Securely:</strong>
              Julian Montgomery has received your encrypted priority transmission. Expected response window: under 15 minutes.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Allocation inquiry for 2026 Sovereign Gold Eagle delivery"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-sm text-[#161c22] border border-[#c5c6cd]/50 focus:bg-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                Confidential Message
              </label>
              <textarea
                rows={4}
                placeholder="Specify your inquiry, transaction amount, or scheduling preference..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="w-full p-3 bg-[#eef4fc] rounded-lg text-sm text-[#161c22] border border-[#c5c6cd]/50 focus:bg-white focus:outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="self-end px-6 h-11 bg-[#0d1c32] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-md transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Sign &amp; Dispatch Encrypted Inquiry</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
