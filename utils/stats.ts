
import { Trade, TradeStats, DirectionalStats } from '../types';

const calculateDirectional = (trades: Trade[]): DirectionalStats => {
  if (trades.length === 0) return { winRate: 0, pnl: 0, count: 0, avgWin: 0, avgLoss: 0 };
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const pnl = trades.reduce((acc, t) => acc + t.pnl, 0);
  return {
    count: trades.length,
    pnl,
    winRate: (wins.length / trades.length) * 100,
    avgWin: wins.length > 0 ? wins.reduce((acc, t) => acc + t.pnl, 0) / wins.length : 0,
    avgLoss: losses.length > 0 ? Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0) / losses.length) : 0,
  };
};

export const calculateStats = (trades: Trade[]): TradeStats => {
  const base = {
    totalPnL: 0, totalTrades: 0, winningTrades: 0, losingTrades: 0,
    winRate: 0, avgWin: 0, avgLoss: 0, profitFactor: 0,
    expectancy: 0, maxDrawdown: 0, maxDrawdownPercent: 0,
    maxConsecWins: 0, maxConsecLosses: 0, riskReward: 0,
    recoveryFactor: 0,
    bestDay: { date: '', pnl: -Infinity },
    worstDay: { date: '', pnl: Infinity },
    bestMonth: { date: '', pnl: -Infinity },
    worstMonth: { date: '', pnl: Infinity },
    longStats: { winRate: 0, pnl: 0, count: 0, avgWin: 0, avgLoss: 0 },
    shortStats: { winRate: 0, pnl: 0, count: 0, avgWin: 0, avgLoss: 0 },
    dailyPnL: {} as Record<string, number>,
    monthlyPnL: {} as Record<string, number>
  };

  if (trades.length === 0) return base;

  let totalPnL = 0;
  let wins = 0;
  let losses = 0;
  let winAmount = 0;
  let lossAmount = 0;
  let currentConsecWins = 0;
  let maxConsecWins = 0;
  let currentConsecLosses = 0;
  let maxConsecLosses = 0;
  
  let peakEquity = 0;
  let maxDD = 0;
  let maxDDPercent = 0;
  let currentEquity = 0;

  const dailyMap: Record<string, number> = {};
  const monthlyMap: Record<string, number> = {};

  trades.forEach((trade) => {
    totalPnL += trade.pnl;
    currentEquity += trade.pnl;
    
    // Period Grouping
    const dayKey = trade.timestamp.toISOString().split('T')[0];
    const monthKey = `${trade.timestamp.getFullYear()}-${String(trade.timestamp.getMonth() + 1).padStart(2, '0')}`;
    dailyMap[dayKey] = (dailyMap[dayKey] || 0) + trade.pnl;
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + trade.pnl;

    if (trade.pnl > 0) {
      wins++;
      winAmount += trade.pnl;
      currentConsecWins++;
      currentConsecLosses = 0;
    } else {
      losses++;
      lossAmount += Math.abs(trade.pnl);
      currentConsecLosses++;
      currentConsecWins = 0;
    }

    maxConsecWins = Math.max(maxConsecWins, currentConsecWins);
    maxConsecLosses = Math.max(maxConsecLosses, currentConsecLosses);

    peakEquity = Math.max(peakEquity, currentEquity);
    const dd = peakEquity - currentEquity;
    maxDD = Math.max(maxDD, dd);
    if (peakEquity > 0) maxDDPercent = Math.max(maxDDPercent, (dd / peakEquity) * 100);
  });

  // Find extremes
  Object.entries(dailyMap).forEach(([date, pnl]) => {
    if (pnl > base.bestDay.pnl) base.bestDay = { date, pnl };
    if (pnl < base.worstDay.pnl) base.worstDay = { date, pnl };
  });
  Object.entries(monthlyMap).forEach(([date, pnl]) => {
    if (pnl > base.bestMonth.pnl) base.bestMonth = { date, pnl };
    if (pnl < base.worstMonth.pnl) base.worstMonth = { date, pnl };
  });

  const longTrades = trades.filter(t => ['Long', 'Buy'].includes(t.direction));
  const shortTrades = trades.filter(t => ['Short', 'Sell'].includes(t.direction));

  const totalTrades = trades.length;
  const winRate = (wins / totalTrades) * 100;
  const avgWin = wins > 0 ? winAmount / wins : 0;
  const avgLoss = losses > 0 ? lossAmount / losses : 0;
  const profitFactor = lossAmount > 0 ? winAmount / lossAmount : winAmount > 0 ? Infinity : 0;
  const expectancy = ((winRate / 100) * avgWin) - ((1 - winRate / 100) * avgLoss);

  return {
    ...base,
    totalPnL,
    totalTrades,
    winningTrades: wins,
    losingTrades: losses,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    expectancy,
    maxDrawdown: maxDD,
    maxDrawdownPercent: maxDDPercent,
    maxConsecWins,
    maxConsecLosses,
    riskReward: avgLoss > 0 ? avgWin / avgLoss : 0,
    recoveryFactor: maxDD > 0 ? totalPnL / maxDD : 0,
    longStats: calculateDirectional(longTrades),
    shortStats: calculateDirectional(shortTrades),
    dailyPnL: dailyMap,
    monthlyPnL: monthlyMap
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number): string => `${value.toFixed(2)}%`;
