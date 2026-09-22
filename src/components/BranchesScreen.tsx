import React, { useState } from 'react';
import { SAMPLE_BRANCHES } from '../data/mockData';
import { BranchLocation } from '../types';

export const BranchesScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'vault' | 'dining'>('all');
  const [selectedBranch, setSelectedBranch] = useState<BranchLocation | null>(SAMPLE_BRANCHES[0]);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  const filteredBranches = SAMPLE_BRANCHES.filter((b) => {
    if (filter === 'vault') return b.hasBullionVault;
    if (filter === 'dining') return b.hasPrivateDining;
    return true;
  });

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 gap-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-[#0d1c32] text-white p-6 rounded-2xl shadow-lg border border-[#1b3a57] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#1b3a57] border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059]">
            <span className="material-symbols-outlined text-[26px]">domain</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-widest uppercase bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5 rounded">
                Global Network
              </span>
              <span className="text-xs text-[#b9c7e4]">Private Lounges &amp; Bullion Depots</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold mt-0.5">
              Flagship Chambers &amp; Vaults
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all' ? 'bg-white text-[#0d1c32]' : 'bg-[#1b3a57] text-white/80 hover:text-white'
            }`}
          >
            All Chambers
          </button>
          <button
            onClick={() => setFilter('vault')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'vault' ? 'bg-white text-[#0d1c32]' : 'bg-[#1b3a57] text-white/80 hover:text-white'
            }`}
          >
            Bullion Vaults
          </button>
          <button
            onClick={() => setFilter('dining')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'dining' ? 'bg-white text-[#0d1c32]' : 'bg-[#1b3a57] text-white/80 hover:text-white'
            }`}
          >
            Private Dining
          </button>
        </div>
      </div>

      {/* Main Grid & Selected Branch Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Branch List */}
        <div className="lg:col-span-6 space-y-3">
          {filteredBranches.map((branch) => {
            const isSelected = selectedBranch?.id === branch.id;
            return (
              <div
                key={branch.id}
                onClick={() => setSelectedBranch(branch)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-white border-[#0d1c32] shadow-md ring-1 ring-[#0d1c32]'
                    : 'bg-[#f6f9ff] border-[#dde3eb] hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-[#446180] tracking-widest uppercase">
                      {branch.city}
                    </span>
                    <h4 className="font-serif text-base font-semibold text-[#161c22]">
                      {branch.name}
                    </h4>
                    <p className="text-xs text-[#44474d] mt-0.5">{branch.address}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {branch.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {branch.features.slice(0, 2).map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-[#44474d] bg-[#eef4fc] px-2 py-0.5 rounded"
                    >
                      {feat}
                    </span>
                  ))}
                  {branch.hasBullionVault && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                      Bullion Vault
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Branch Inspection Panel */}
        {selectedBranch && (
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#dde3eb] shadow-sm flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-[#446180] tracking-widest uppercase block mb-1">
                  Chamber Profile &amp; Depository
                </span>
                <h3 className="font-serif text-xl font-semibold text-[#161c22]">
                  {selectedBranch.name}
                </h3>
                <p className="text-xs text-[#44474d] mt-1">{selectedBranch.address}</p>
              </div>

              {/* Simulated Map View Card */}
              <div className="h-36 rounded-xl bg-[#eef4fc] border border-[#c5c6cd]/50 relative overflow-hidden flex flex-col items-center justify-center text-center p-4">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#446180_1px,transparent_1px)] [background-size:16px_16px]" />
                <span className="material-symbols-outlined text-[32px] text-[#0d1c32] mb-1">
                  location_on
                </span>
                <span className="text-xs font-semibold text-[#161c22]">
                  GPS Lat/Lon: Verified Sovereign Perimeter
                </span>
                <span className="text-[11px] text-[#44474d]">
                  Direct subterranean armored entrance at 58th St &amp; 5th Ave
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#dde3eb]">
                  <span className="text-[#44474d]">Vault Operating Hours</span>
                  <span className="font-semibold text-[#161c22]">{selectedBranch.hours}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#dde3eb]">
                  <span className="text-[#44474d]">Dedicated Desk Line</span>
                  <a href={`tel:${selectedBranch.phone}`} className="font-semibold text-[#446180] hover:underline">
                    {selectedBranch.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#dde3eb]">
                  <span className="text-[#44474d]">Private Vault Level</span>
                  <span className="font-semibold text-[#161c22]">Class 3 UL Listed Depository</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-2">
                  Institutional Amenities
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedBranch.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-[#f6f9ff] border border-[#dde3eb] text-[11px] text-[#161c22] flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">
                        check
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setAppointmentModal(true)}
              className="w-full h-11 bg-[#0d1c32] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Reserve Vault Access &amp; Banker Appointment</span>
            </button>
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {appointmentModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0d1c32]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 border border-[#c5c6cd]/50">
            <div className="flex items-center justify-between pb-3 border-b border-[#dde3eb]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0d1c32] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#161c22]">
                    Chamber Reservation
                  </h3>
                  <p className="text-xs text-[#44474d]">{selectedBranch?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setAppointmentModal(false)}
                className="text-[#44474d] hover:text-[#161c22] p-1 rounded-full hover:bg-[#eef4fc]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {appointmentSuccess ? (
              <div className="py-6 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h4 className="font-serif text-lg font-semibold text-[#161c22]">
                  Private Vault Session Reserved
                </h4>
                <p className="text-xs text-[#44474d]">
                  Your security clearance pass has been added to your Apple Wallet / Sovereign App. An armored escort will greet you at the private subterranean portico.
                </p>
                <button
                  onClick={() => {
                    setAppointmentSuccess(false);
                    setAppointmentModal(false);
                  }}
                  className="mt-2 px-6 h-10 bg-[#0d1c32] text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
                >
                  Confirm &amp; Return
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setAppointmentSuccess(true);
                }}
                className="flex flex-col gap-3.5"
              >
                <div>
                  <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                    Purpose of Visit
                  </label>
                  <select className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-sm text-[#161c22] border border-[#c5c6cd]/50 focus:bg-white focus:outline-none">
                    <option>Physical Bullion Depository Inspection</option>
                    <option>High-Value Dual-Key Wire Execution</option>
                    <option>Private Safe Deposit Box Access</option>
                    <option>Trust Officer Executive Consultation</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      defaultValue="2026-09-25"
                      className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-xs text-[#161c22] border border-[#c5c6cd]/50 focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      defaultValue="14:00"
                      className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-xs text-[#161c22] border border-[#c5c6cd]/50 focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                    Special Escort / Armored Transit Request
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Requesting armored transport from JFK Signature Flight"
                    className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-sm text-[#161c22] border border-[#c5c6cd]/50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAppointmentModal(false)}
                    className="flex-1 h-11 bg-[#e8eef6] hover:bg-[#dde3eb] text-[#161c22] rounded-lg text-xs font-semibold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-[#0d1c32] hover:bg-black text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
