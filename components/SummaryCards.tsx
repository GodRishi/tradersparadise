
import React from 'react';
import { TradeStats } from '../types';
import { formatCurrency, formatPercent } from '../utils/stats';
import { TrendingUp, TrendingDown, Target, BarChart2, Zap, ShieldAlert } from 'lucide-react';

interface SummaryCardsProps {
  stats: TradeStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Net Performance',
      value: formatCurrency(stats.totalPnL),
      icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400',
      shadow: stats.totalPnL >= 0 ? 'shadow-emerald-500/10' : 'shadow-rose-500/10',
      delay: '0ms',
    },
    {
      label: 'Edge Ratio',
      value: formatPercent(stats.winRate),
      icon: Target,
      color: 'text-blue-400',
      shadow: 'shadow-blue-500/10',
      delay: '100ms',
    },
    {
      label: 'Profitability Index',
      value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2),
      icon: Zap,
      color: 'text-indigo-400',
      shadow: 'shadow-indigo-500/10',
      delay: '200ms',
    },
    {
      label: 'Trading Velocity',
      value: stats.totalTrades.toString(),
      icon: BarChart2,
      color: 'text-slate-200',
      shadow: 'shadow-slate-500/10',
      delay: '300ms',
    },
    {
      label: 'System Risk (DD)',
      value: formatCurrency(stats.maxDrawdown),
      icon: ShieldAlert,
      color: 'text-amber-400',
      shadow: 'shadow-amber-500/10',
      delay: '400ms',
    },
    {
      label: 'Trade Expectancy',
      value: formatCurrency(stats.expectancy),
      icon: TrendingUp,
      color: 'text-teal-400',
      shadow: 'shadow-teal-500/10',
      delay: '500ms',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          style={{ transitionDelay: card.delay }}
          className={`glass border border-slate-800 rounded-3xl p-8 shadow-2xl ${card.shadow} hover:border-slate-600 transition-all group animate-float glow-card cursor-default`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-[0.2em]">{card.label}</span>
            <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors`}>
              <card.icon className={`${card.color} w-5 h-5`} />
            </div>
          </div>
          <div className={`text-3xl font-black tracking-tighter ${card.color}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
