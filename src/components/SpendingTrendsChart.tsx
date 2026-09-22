import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MonthlySpending, UserProfile } from '../types';

interface SpendingTrendsChartProps {
  profile: UserProfile;
}

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ profile }) => {
  const [chartMode, setChartMode] = useState<'stacked' | 'grouped'>('stacked');
  const [activeCategory, setActiveCategory] = useState<'all' | 'wires' | 'vaultStorage' | 'concierge'>('all');

  const data: MonthlySpending[] = profile.spendingTrends || [];

  // Helper formatting for currency
  const formatUSD = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  const formatCompactUSD = (val: number) => {
    if (val >= 1_000_000) {
      return `$${(val / 1_000_000).toFixed(1)}M`;
    }
    if (val >= 1_000) {
      return `$${(val / 1_000).toFixed(0)}k`;
    }
    return `$${val}`;
  };

  const totalPeriod = data.reduce((sum, item) => sum + item.total, 0);
  const avgMonthly = data.length > 0 ? Math.round(totalPeriod / data.length) : 0;
  const peakMonth = data.reduce(
    (max, item) => (item.total > (max?.total || 0) ? item : max),
    data[0]
  );
  const latestMonth = data[data.length - 1];

  // Custom branded Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const monthTotal = payload.reduce(
        (acc: number, curr: any) => acc + (Number(curr.value) || 0),
        0
      );

      return (
        <div className="bg-white p-3.5 rounded-xl shadow-xl border border-[#c5c6cd]/60 text-xs flex flex-col gap-2 min-w-[200px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#dde3eb]">
            <span className="font-serif font-semibold text-sm text-[#0d1c32]">
              {label} 2024 Outflow
            </span>
            <span className="text-[10px] font-semibold text-[#446180] bg-[#eef4fc] px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>

          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-xs"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-[#44474d]">{entry.name}:</span>
                </div>
                <span className="font-semibold text-[#161c22]">
                  {formatUSD(entry.value)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-1.5 border-t border-[#dde3eb] flex justify-between items-center font-semibold text-[#0d1c32]">
            <span>Monthly Total:</span>
            <span className="font-bold text-sm">{formatUSD(monthTotal)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#dde3eb] shadow-xs space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-[#446180] tracking-widest uppercase">
              Treasury Outflow &amp; Ledger Trends
            </span>
            <span className="text-[10px] bg-[#eef4fc] text-[#0d1c32] font-semibold px-2 py-0.5 rounded-full border border-[#dde3eb]">
              6-Month Audit
            </span>
          </div>
          <h3 className="font-serif text-xl font-semibold text-[#161c22] mt-0.5">
            Monthly Spending &amp; Outflow Trends
          </h3>
          <p className="text-xs text-[#44474d]">
            Visualizing verified telemetric wires, allocated depository custody, and concierge expenditures for {profile.name}.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="inline-flex p-1 bg-[#e8eef6] rounded-lg border border-[#c5c6cd]/40">
            <button
              type="button"
              onClick={() => setChartMode('stacked')}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider transition-all ${
                chartMode === 'stacked'
                  ? 'bg-white text-[#0d1c32] shadow-xs font-bold'
                  : 'text-[#44474d] hover:text-[#0d1c32]'
              }`}
            >
              Stacked Total
            </button>
            <button
              type="button"
              onClick={() => setChartMode('grouped')}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider transition-all ${
                chartMode === 'grouped'
                  ? 'bg-white text-[#0d1c32] shadow-xs font-bold'
                  : 'text-[#44474d] hover:text-[#0d1c32]'
              }`}
            >
              Grouped
            </button>
          </div>
        </div>
      </div>

      {/* Metric Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#f6f9ff] border border-[#dde3eb]">
          <span className="text-[10px] font-semibold text-[#44474d] uppercase tracking-wider block">
            Latest Month (Oct)
          </span>
          <span className="text-lg font-semibold text-[#0d1c32] block mt-0.5">
            {latestMonth ? formatUSD(latestMonth.total) : '$0'}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">Within target allocation</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#f6f9ff] border border-[#dde3eb]">
          <span className="text-[10px] font-semibold text-[#44474d] uppercase tracking-wider block">
            Monthly Average
          </span>
          <span className="text-lg font-semibold text-[#0d1c32] block mt-0.5">
            {formatUSD(avgMonthly)}
          </span>
          <span className="text-[10px] text-[#44474d]">Rolling 180-day baseline</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#f6f9ff] border border-[#dde3eb]">
          <span className="text-[10px] font-semibold text-[#44474d] uppercase tracking-wider block">
            Peak Outflow
          </span>
          <span className="text-lg font-semibold text-[#0d1c32] block mt-0.5">
            {peakMonth ? formatUSD(peakMonth.total) : '$0'}
          </span>
          <span className="text-[10px] text-[#c5a059] font-medium">
            {peakMonth?.month} (Allocation rebalance)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#f6f9ff] border border-[#dde3eb]">
          <span className="text-[10px] font-semibold text-[#44474d] uppercase tracking-wider block">
            6-Month Aggregate
          </span>
          <span className="text-lg font-semibold text-[#0d1c32] block mt-0.5">
            {formatUSD(totalPeriod)}
          </span>
          <span className="text-[10px] text-[#446180] font-medium">100% Zero-Liability Guarded</span>
        </div>
      </div>

      {/* Category Pill Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-[11px] font-semibold text-[#44474d] uppercase tracking-wider mr-1">
          Filter Category:
        </span>
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
            activeCategory === 'all'
              ? 'bg-[#0d1c32] text-white'
              : 'bg-[#eef4fc] text-[#44474d] hover:bg-[#dde3eb]'
          }`}
        >
          All Outflows
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('wires')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
            activeCategory === 'wires'
              ? 'bg-[#0d1c32] text-white'
              : 'bg-[#eef4fc] text-[#44474d] hover:bg-[#dde3eb]'
          }`}
        >
          <span className="w-2 h-2 rounded-xs bg-[#0d1c32]" />
          Wires &amp; Dispatches
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('vaultStorage')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
            activeCategory === 'vaultStorage'
              ? 'bg-[#446180] text-white'
              : 'bg-[#eef4fc] text-[#44474d] hover:bg-[#dde3eb]'
          }`}
        >
          <span className="w-2 h-2 rounded-xs bg-[#446180]" />
          Vault &amp; Custody
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('concierge')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
            activeCategory === 'concierge'
              ? 'bg-[#a17f3b] text-white'
              : 'bg-[#eef4fc] text-[#44474d] hover:bg-[#dde3eb]'
          }`}
        >
          <span className="w-2 h-2 rounded-xs bg-[#c5a059]" />
          Concierge &amp; Titanium Card
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eef6" />
            <XAxis
              dataKey="month"
              stroke="#75777e"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#dde3eb' }}
            />
            <YAxis
              stroke="#75777e"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCompactUSD}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
            />

            {(activeCategory === 'all' || activeCategory === 'wires') && (
              <Bar
                dataKey="wires"
                name="Wires & Dispatches"
                fill="#0d1c32"
                stackId={chartMode === 'stacked' ? 'a' : undefined}
                radius={chartMode === 'stacked' && activeCategory === 'wires' ? [4, 4, 0, 0] : chartMode === 'grouped' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            )}

            {(activeCategory === 'all' || activeCategory === 'vaultStorage') && (
              <Bar
                dataKey="vaultStorage"
                name="Vault Custody"
                fill="#446180"
                stackId={chartMode === 'stacked' ? 'a' : undefined}
                radius={chartMode === 'stacked' && activeCategory === 'vaultStorage' ? [4, 4, 0, 0] : chartMode === 'grouped' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            )}

            {(activeCategory === 'all' || activeCategory === 'concierge') && (
              <Bar
                dataKey="concierge"
                name="Concierge & Card"
                fill="#c5a059"
                stackId={chartMode === 'stacked' ? 'a' : undefined}
                radius={chartMode === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
