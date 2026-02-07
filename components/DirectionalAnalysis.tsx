
import React from 'react';
import { DirectionalStats } from '../types';
import { formatCurrency, formatPercent } from '../utils/stats';

interface DirectionalAnalysisProps {
  long: DirectionalStats;
  short: DirectionalStats;
}

const StatRow = ({ label, long, short, isCurrency = false }: { label: string, long: number, short: number, isCurrency?: boolean }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>
    <div className="flex gap-8 text-sm font-bold">
      <span className="text-emerald-500">{isCurrency ? formatCurrency(long) : label === 'Win Rate' ? formatPercent(long) : long}</span>
      <span className="text-rose-500">{isCurrency ? formatCurrency(short) : label === 'Win Rate' ? formatPercent(short) : short}</span>
    </div>
  </div>
);

const DirectionalAnalysis: React.FC<DirectionalAnalysisProps> = ({ long, short }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-full animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-slate-200 font-bold uppercase tracking-widest text-xs">Directional Bias</h3>
        <div className="flex gap-4 text-[10px] font-black uppercase">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Longs</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Shorts</span>
        </div>
      </div>

      <div className="space-y-1">
        <StatRow label="Count" long={long.count} short={short.count} />
        <StatRow label="Win Rate" long={long.winRate} short={short.winRate} />
        <StatRow label="Avg Win" long={long.avgWin} short={short.avgWin} isCurrency />
        <StatRow label="Avg Loss" long={long.avgLoss} short={short.avgLoss} isCurrency />
        <StatRow label="Total PnL" long={long.pnl} short={short.pnl} isCurrency />
      </div>
      
      <div className="mt-8 flex h-4 rounded-full overflow-hidden bg-slate-950 border border-slate-800">
        <div className="bg-emerald-500 transition-all duration-1000" style={{ width: `${(long.count / (long.count + short.count)) * 100}%` }}></div>
        <div className="bg-rose-500 transition-all duration-1000" style={{ width: `${(short.count / (long.count + short.count)) * 100}%` }}></div>
      </div>
    </div>
  );
};

export default DirectionalAnalysis;
