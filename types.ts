
export type TradeDirection = 'Long' | 'Short' | 'Buy' | 'Sell';

export interface Trade {
  id: string;
  timestamp: Date;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  equity: number;
  drawdown: number;
}

export interface PeriodPerformance {
  period: string;
  pnl: number;
  trades: number;
}

export interface DirectionalStats {
  winRate: number;
  pnl: number;
  count: number;
  avgWin: number;
  avgLoss: number;
}

export interface TradeStats {
  totalPnL: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  maxConsecWins: number;
  maxConsecLosses: number;
  riskReward: number;
  recoveryFactor: number;
  // New metrics
  bestDay: { date: string, pnl: number };
  worstDay: { date: string, pnl: number };
  bestMonth: { date: string, pnl: number };
  worstMonth: { date: string, pnl: number };
  longStats: DirectionalStats;
  shortStats: DirectionalStats;
  dailyPnL: Record<string, number>;
  monthlyPnL: Record<string, number>;
}

export interface ColumnMapping {
  timestamp: string;
  symbol: string;
  direction: string;
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  pnl?: string;
}

export type TimeRange = 'All' | '1M' | '3M' | '6M' | '1Y' | 'YTD';
