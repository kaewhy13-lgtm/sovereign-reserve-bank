import React, { useState, useEffect } from 'react';
import { UserProfile, BankAccount, Transaction } from '../types';
import { SAMPLE_ACCOUNTS, SAMPLE_TRANSACTIONS } from '../data/mockData';
import { SpendingTrendsChart } from './SpendingTrendsChart';
import { VaultAPI } from '../api';

interface DashboardScreenProps {
  profile: UserProfile;
  onLockVault: () => void;
  onOpenConcierge: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  onLockVault,
  onOpenConcierge,
}) => {
  const [accounts, setAccounts] = useState<BankAccount[]>(SAMPLE_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [cardLocked, setCardLocked] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [wireModalOpen, setWireModalOpen] = useState(false);
  const [wireRecipient, setWireRecipient] = useState('');
  const [wireAmount, setWireAmount] = useState('');
  const [wireRouting, setWireRouting] = useState('021000021 (Federal Reserve NY)');
  const [wireSending, setWireSending] = useState(false);
  const [wireSuccess, setWireSuccess] = useState(false);
  const [wireError, setWireError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load real data from API on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [accRes, txRes] = await Promise.all([
        VaultAPI.getAccounts(),
        VaultAPI.getTransactions(50, 0),
      ]);
      if (cancelled) return;

      if (accRes.data?.accounts) {
        setAccounts(accRes.data.accounts as BankAccount[]);
      }
      if (txRes.data?.transactions) {
        setTransactions(txRes.data.transactions as Transaction[]);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [profile.id]);

  const formatUSD = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const totalNet = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const handleSendWire = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(wireAmount);
    if (!amt || amt <= 0) return;
    setWireError(null);
    setWireSending(true);

    const { data, error } = await VaultAPI.sendWire(wireRecipient, wireRouting, amt);

    setWireSending(false);
    if (error || !data) {
      setWireError(error || 'Wire transfer failed');
      return;
    }

    setWireSuccess(true);
    if (data.accounts) setAccounts(data.accounts as BankAccount[]);
    if (data.transactions) setTransactions(data.transactions as Transaction[]);

    setTimeout(() => {
      setWireSuccess(false);
      setWireModalOpen(false);
      setWireRecipient('');
      setWireAmount('');
      setWireError(null);
    }, 1500);
  };


  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 gap-6 animate-in fade-in duration-300">
      {/* Top Welcome Bar */}
      <div className="bg-[#0d1c32] text-white p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#1b3a57] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-[#c5a059]/15 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-full bg-[#1b3a57] border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059] shadow-inner">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-widest uppercase bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5 rounded">
                {profile.tier}
              </span>
              <span className="text-xs text-[#b9c7e4]">Acct {profile.accountNumberMasked}</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold mt-0.5">
              Welcome back, {profile.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 self-end sm:self-auto">
          <button
            onClick={onOpenConcierge}
            className="px-3 py-2 rounded-lg bg-[#1b3a57] hover:bg-[#2b4967] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors border border-[#c5c6cd]/20"
          >
            <span className="material-symbols-outlined text-[16px] text-[#c5a059]">room_service</span>
            <span>Concierge Desk</span>
          </button>
          <button
            onClick={onLockVault}
            className="px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-800/40"
            title="Lock Vault & Terminate Session"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Lock Vault</span>
          </button>
        </div>
      </div>

      {/* Net Portfolio Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#dde3eb] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-[#446180] tracking-widest uppercase block mb-1">
            Total Net Sovereign Liquidity &amp; Bullion
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-semibold text-[#0d1c32] tracking-tight">
              {formatUSD(totalNet)}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="material-symbols-outlined text-[14px] mr-0.5">arrow_upward</span>
              +$4,120.80 (+0.18%)
            </span>
          </div>
          <span className="text-xs text-[#44474d] mt-1 block">
            Real-time mark-to-market valuation • Insured by Zero-Liability Sovereign Shield
          </span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setWireModalOpen(true)}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-[#0d1c32] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">send_money</span>
            <span>Dispatch Fedwire</span>
          </button>
          <button
            onClick={onOpenConcierge}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-[#e8eef6] hover:bg-[#dde3eb] text-[#0d1c32] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">diamond</span>
            <span>Bullion Order</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="p-5 bg-white rounded-xl border border-[#dde3eb] shadow-xs flex flex-col justify-between gap-4 hover:border-[#446180]/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[#446180] uppercase tracking-wider">
                  {acc.type.toUpperCase()}
                </span>
                {acc.yieldApy && (
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {acc.yieldApy}
                  </span>
                )}
                {acc.location && (
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Zurich Vault
                  </span>
                )}
              </div>
              <h4 className="font-serif text-base font-semibold text-[#161c22]">{acc.name}</h4>
              <p className="text-xs text-[#44474d] font-mono mt-0.5">{acc.accountNumber}</p>
            </div>

            <div>
              <span className="text-2xl font-semibold text-[#0d1c32] block">
                {formatUSD(acc.balance)}
              </span>
              <span className="text-[11px] text-[#44474d]">{acc.currency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Spending & Outflow Trends Recharts Bar Chart */}
      <SpendingTrendsChart profile={profile} />

      {/* Titanium Card Management Strip */}
      <div className="bg-gradient-to-br from-[#0a192f] via-[#1b3a57] to-[#0a192f] rounded-2xl p-6 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 border border-[#c5a059]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto">
          {/* Card Mockup */}
          <div className="w-64 h-40 rounded-xl bg-gradient-to-tr from-black via-[#161c22] to-[#2b3137] p-4 flex flex-col justify-between shadow-2xl border border-[#c5a059]/40 relative overflow-hidden flex-shrink-0">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest uppercase font-bold text-[#c5a059]">
                Sovereign Reserve Titanium
              </span>
              <span className="material-symbols-outlined text-[20px] text-[#c5a059]">contactless</span>
            </div>
            <div>
              <span className="text-sm font-mono tracking-widest block text-white/90">
                {cardRevealed ? '4912  8821  9044  8821' : '••••  ••••  ••••  8821'}
              </span>
              <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                CVV: {cardRevealed ? '942' : '•••'} • EXP: 10/29
              </span>
            </div>
            <div className="flex justify-between items-end text-[10px] text-gray-300">
              <span className="font-semibold uppercase tracking-wider">{profile.name}</span>
              <span className="text-[9px] text-[#c5a059]">BLACK RESERVE</span>
            </div>
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-[#c5a059] uppercase tracking-widest">
              Physical Card Security
            </span>
            <h4 className="font-serif text-lg font-semibold">Laser-Etched Pure Titanium Card</h4>
            <p className="text-xs text-[#b9c7e4] max-w-sm">
              Status: {cardLocked ? 'Locked (Zero transactions authorized)' : 'Active • Worldwide VIP Airport & Private Safe Access'}
            </p>
          </div>
        </div>

        {/* Card Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-center">
          <button
            onClick={async () => {
              const newRevealed = !cardRevealed;
              setCardRevealed(newRevealed);
              if (newRevealed) await VaultAPI.revealCard();
            }}
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <span className="material-symbols-outlined text-[16px]">
              {cardRevealed ? 'visibility_off' : 'visibility'}
            </span>
            <span>{cardRevealed ? 'Hide Details' : 'Reveal Numbers'}</span>
          </button>

          <button
            onClick={async () => {
              const newLocked = !cardLocked;
              setCardLocked(newLocked);
              await VaultAPI.setCardLock(newLocked);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
              cardLocked
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-900/60 hover:bg-red-800/70 text-red-200 border border-red-700/50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {cardLocked ? 'lock_open' : 'lock'}
            </span>
            <span>{cardLocked ? 'Unlock Card' : 'Freeze Card'}</span>
          </button>
        </div>
      </div>

      {/* Recent Ledger Activity */}
      <div className="bg-white rounded-2xl p-6 border border-[#dde3eb] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#161c22]">
              Cryptographic Transaction Ledger
            </h3>
            <p className="text-xs text-[#44474d]">
              Audited by Zero-Trust Proof-of-Reserve • All transfers carry irreversible SHA-256 clearance
            </p>
          </div>
          <span className="text-xs font-semibold text-[#446180] bg-[#eef4fc] px-2.5 py-1 rounded-full border border-[#dde3eb]">
            Verified Immutable
          </span>
        </div>

        <div className="divide-y divide-[#dde3eb]">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-[#eef4fc] text-[#0d1c32]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {tx.amount > 0 ? 'arrow_downward' : 'arrow_upward'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#161c22] block">
                    {tx.description}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#44474d] mt-0.5">
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-[#446180]">{tx.hash}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-sm font-semibold block ${
                    tx.amount > 0 ? 'text-emerald-700' : 'text-[#161c22]'
                  }`}
                >
                  {tx.amount > 0 ? `+${formatUSD(tx.amount)}` : formatUSD(tx.amount)}
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outgoing Fedwire Modal */}
      {wireModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0d1c32]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 border border-[#c5c6cd]/50">
            <div className="flex items-center justify-between pb-3 border-b border-[#dde3eb]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0d1c32] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">send_money</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#161c22]">
                    Dispatch Sovereign Fedwire
                  </h3>
                  <p className="text-xs text-[#44474d]">Direct Federal Reserve Bank Clearance</p>
                </div>
              </div>
              <button
                onClick={() => setWireModalOpen(false)}
                className="text-[#44474d] hover:text-[#161c22] p-1 rounded-full hover:bg-[#eef4fc]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {wireSuccess ? (
              <div className="py-6 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h4 className="font-serif text-lg font-semibold text-[#161c22]">
                  Fedwire Broadcast Confirmed
                </h4>
                <p className="text-xs text-[#44474d]">
                  Transfer settled through Fedwire RTGS. Cryptographic receipt logged to your permanent ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendWire} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                    Beneficiary Entity / Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zurich Bullion Logistics LLC"
                    value={wireRecipient}
                    onChange={(e) => setWireRecipient(e.target.value)}
                    className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-sm text-[#161c22] border border-[#c5c6cd]/50 focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                    ABA Routing / SWIFT BIC
                  </label>
                  <input
                    type="text"
                    value={wireRouting}
                    onChange={(e) => setWireRouting(e.target.value)}
                    className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-sm font-mono text-[#161c22] border border-[#c5c6cd]/50 focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider block mb-1">
                    Wire Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50000.00"
                    value={wireAmount}
                    onChange={(e) => setWireAmount(e.target.value)}
                    className="w-full h-11 px-3 bg-[#eef4fc] rounded-lg text-sm text-[#161c22] font-semibold border border-[#c5c6cd]/50 focus:bg-white focus:outline-none"
                    required
                  />
                  <span className="text-[11px] text-[#44474d] mt-1 block">
                    Available in Checking: {formatUSD(accounts.find(a => a.type === 'checking')?.balance ?? 0)}
                  </span>
                </div>

                {wireError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded px-3 py-2 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-red-600">error</span>
                    <span>{wireError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setWireModalOpen(false); setWireError(null); }}
                    className="flex-1 h-11 bg-[#e8eef6] hover:bg-[#dde3eb] text-[#161c22] rounded-lg text-xs font-semibold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={wireSending}
                    className="flex-1 h-11 bg-[#0d1c32] hover:bg-black text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
                  >
                    {wireSending ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                        <span>Clearing Wire...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                        <span>Sign &amp; Dispatch</span>
                      </>
                    )}
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
