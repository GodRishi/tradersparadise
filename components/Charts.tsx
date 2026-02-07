
import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { Trade } from '../types';
import { formatCurrency } from '../utils/stats';

interface ChartProps {
  trades: Trade[];
}

export const EquityCurve: React.FC<ChartProps> = ({ trades }) => {
  const data = trades.map((t, i) => ({
    name: i + 1,
    equity: t.equity,
    timestamp: t.timestamp.toLocaleDateString(),
  }));

  return (
    <div className="h-[500px] w-full glass border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-slate-100 font-black text-2xl tracking-tight">Cumulative Equity</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Full Historical Performance Trail</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="5 5" stroke="#1e293b" vertical={false} strokeOpacity={0.5} />
          <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
          <Tooltip 
            cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1.5rem', padding: '15px' }}
            itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
            formatter={(value: number) => [formatCurrency(value), 'Equity']}
          />
          <Area type="monotone" dataKey="equity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={4} animationDuration={2000} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DrawdownCurve: React.FC<ChartProps> = ({ trades }) => {
  const data = trades.map((t, i) => ({
    name: i + 1,
    drawdown: -t.drawdown,
  }));

  return (
    <div className="h-[350px] w-full glass border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
      <h3 className="text-slate-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">Risk Exposure (Drawdown)</h3>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorDD" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.3} />
          <XAxis dataKey="name" stroke="#475569" fontSize={8} hide />
          <YAxis stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1rem' }}
            formatter={(value: number) => [formatCurrency(Math.abs(value)), 'Exposure']}
          />
          <Area type="stepAfter" dataKey="drawdown" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDD)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WinLossDistribution: React.FC<ChartProps> = ({ trades }) => {
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  
  const data = [
    { name: 'Wins', value: wins.length, color: '#10b981' },
    { name: 'Losses', value: losses.length, color: '#f43f5e' },
  ];

  return (
    <div className="h-[350px] w-full glass border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
      <h3 className="text-slate-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">Alpha Capture Probability</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} layout="vertical" barSize={40}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} fontWeight="bold" />
          <Tooltip 
            cursor={{fill: 'rgba(255,255,255,0.05)'}}
            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1rem' }}
          />
          <Bar dataKey="value" radius={[0, 10, 10, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PerformanceBySymbol: React.FC<ChartProps> = ({ trades }) => {
  const symbolMap: Record<string, number> = {};
  trades.forEach(t => {
    symbolMap[t.symbol] = (symbolMap[t.symbol] || 0) + t.pnl;
  });

  const data = Object.entries(symbolMap)
    .map(([symbol, pnl]) => ({ symbol, pnl }))
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 10);

  return (
    <div className="h-[450px] w-full glass border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
      <h3 className="text-slate-100 font-black text-2xl tracking-tight mb-2">Alpha Concentration</h3>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">PnL Contribution by Ticker Symbol</p>
      <ResponsiveContainer width="100%" height="75%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.3} />
          <XAxis dataKey="symbol" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
          <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1.5rem', padding: '15px' }}
            formatter={(value: number) => [formatCurrency(value), 'ProfitContribution']}
          />
          <Bar dataKey="pnl" radius={[12, 12, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
