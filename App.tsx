import { collection, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "./utils/firebase";
import React, { useState, useMemo, useEffect } from 'react';
import { Trade } from './types';
import CSVUpload from './components/CSVUpload';
import SummaryCards from './components/SummaryCards';
import { EquityCurve, DrawdownCurve, WinLossDistribution, PerformanceBySymbol } from './components/Charts';
import TradeTable from './components/TradeTable';
import TradingCalendar from './components/TradingCalendar';
import DirectionalAnalysis from './components/DirectionalAnalysis';
import { calculateStats, formatCurrency } from './utils/stats';
import { Logo } from './components/Logo';
import { Table, BarChart3, Settings2, LogOut, ArrowUpRight, ArrowDownRight, Zap, Globe, ShieldCheck } from 'lucide-react';

import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "./utils/firebase";



const App: React.FC = () => {
  const [user, setUser] = <User | null>(null);
  const [trades, setTrades] = useState<Trade[] | null>(null);
  const [view, setView] = useState<'analytics' | 'trades'>('analytics');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadTrades = async () => {
      if (!user) return;

      try {
        const tradesRef = collection(db, "users", user.uid, "trades");
        const snapshot = await getDocs(tradesRef);

        const loadedTrades: Trade[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;

          return {
            ...data,
            id: doc.id,
            timestamp: new Date(data.timestamp),
          };
        });

        if (loadedTrades.length > 0) {
          setTrades(loadedTrades);
        }
      } catch (error) {
        console.error("Error loading trades:", error);
      }
    };

    loadTrades();
  }, [user]);
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      const tradesRef = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(tradesRef);

      const loadedTrades = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate
          ? doc.data().timestamp.toDate()
          : new Date(doc.data().timestamp),
      }));

      // IMPORTANT → use your existing state setter
      setTrades(loadedTrades);

      console.log("Trades loaded from cloud ✅");
    } catch (err) {
      console.error("Failed to load trades:", err);
    }
  });

  return () => unsubscribe();
}, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTrades(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  // 🔹 Save trades to Firestore for logged-in user
const saveTradesToCloud = async (parsedTrades: Trade[]) => {
  if (!user) return;

  try {
    const tradesRef = collection(db, "users", user.uid, "trades");

    for (const trade of parsedTrades) {
      await addDoc(tradesRef, {
        ...trade,
        timestamp: trade.timestamp.toISOString(),
      });
    }

    setTrades(parsedTrades);
  } catch (error) {
    console.error("Error saving trades:", error);
  }
};



  const stats = useMemo(() => {
    return trades ? calculateStats(trades) : null;
  }, [trades]);

  const recentTrades = useMemo(() => {
    return trades ? [...trades].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10) : [];
  }, [trades]);

  if (!trades || !stats) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-blue-500/30 flex flex-col">
        <nav className="p-10 flex items-center justify-between max-w-[1700px] mx-auto w-full flex-shrink-0">
          <div className="flex items-center gap-4 group cursor-pointer">
             <div className="p-2 glass border border-slate-700 rounded-2xl group-hover:scale-110 transition-all duration-500 shadow-2xl">
               <Logo className="w-12 h-12" />
             </div>
            <span className="font-black text-3xl tracking-tighter">Trading Paradise</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Auth Button */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <img
                    src={user.photoURL || ""}
                    alt="user"
                    className="w-9 h-9 rounded-full border border-slate-700"
                  />
                  <button
                    onClick={handleLogout}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold tracking-widest"
                >
                  Sign In
                </button>
              )}
            </div>

            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Proprietary Execution Engine</span>
            <div className="h-4 w-px bg-slate-800"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Secure Node 8.4.1</span>
          </div>
        </nav>
        
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <CSVUpload onDataParsed={saveTradesToCloud} />

        </div>

        <footer className="w-full py-12 text-center border-t border-slate-900/50 bg-slate-950/20 flex-shrink-0">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest opacity-50">Built for traders by traders — developed by Rishi Saha</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col selection:bg-blue-500/20">
      <header className="sticky top-0 z-40 bg-[#020617]/40 backdrop-blur-2xl border-b border-slate-900/50 p-6 flex-shrink-0">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="p-1.5 glass border border-slate-800 rounded-xl shadow-2xl">
               <Logo className="w-10 h-10" />
             </div>
            <div>
              <h1 className="font-black text-2xl leading-tight tracking-tighter">Trading Paradise</h1>
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Analytical Matrix Verified</p>
              </div>
            </div>
          </div>

          <nav className="flex items-center glass p-1.5 rounded-[1.5rem] border border-slate-800 shadow-2xl">
            <button 
              onClick={() => setView('analytics')}
              className={`flex items-center gap-3 px-10 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${view === 'analytics' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <BarChart3 className="w-4 h-4" />
              Pulse View
            </button>
            <button 
              onClick={() => setView('trades')}
              className={`flex items-center gap-3 px-10 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${view === 'trades' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Table className="w-4 h-4" />
              Log Core
            </button>
          </nav>

          <button 
            onClick={() => setTrades(null)}
            className="flex items-center gap-3 px-6 py-3.5 text-slate-500 hover:text-rose-400 transition-all glass border border-slate-800 rounded-2xl hover:bg-rose-500/10 group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">New Feed</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto w-full p-6 md:p-12 space-y-24 flex-1">
        <div className="animate-in fade-in slide-in-from-top-12 duration-1000">
          <SummaryCards stats={stats} />
        </div>

        {view === 'analytics' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <div className="animate-in fade-in slide-in-from-left-12 duration-1000">
                <EquityCurve trades={trades} />
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <TradingCalendar dailyPnL={stats.dailyPnL} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <DirectionalAnalysis long={stats.longStats} short={stats.shortStats} />
                <WinLossDistribution trades={trades} />
              </div>

              <div className="grid grid-cols-1 gap-12">
                <DrawdownCurve trades={trades} />
                <PerformanceBySymbol trades={trades} />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-12">
              <section className="glass border border-slate-800 rounded-[3rem] p-12 space-y-10 animate-in fade-in slide-in-from-right-12 duration-1000">
                 <div className="flex items-center justify-between">
                    <h3 className="text-white text-2xl font-black tracking-tight flex items-center gap-4">
                        <Zap className="w-6 h-6 text-amber-400 animate-pulse" /> Range Spikes
                    </h3>
                    <Globe className="w-6 h-6 text-slate-700" />
                 </div>
                 <div className="grid grid-cols-1 gap-8">
                   {[
                     { label: 'Prime Day Gain', value: stats.bestDay.pnl, date: stats.bestDay.date, pos: true },
                     { label: 'Critical Day Slump', value: stats.worstDay.pnl, date: stats.worstDay.date, pos: false },
                     { label: 'Cycle Month Alpha', value: stats.bestMonth.pnl, date: stats.bestMonth.date, pos: true },
                     { label: 'Cycle Month Recess', value: stats.worstMonth.pnl, date: stats.worstMonth.date, pos: false },
                   ].map((item, i) => (
                    <div key={i} className={`p-8 border rounded-[2rem] transition-all hover:scale-[1.03] cursor-default group ${item.pos ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30' : 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${item.pos ? 'text-emerald-500/40' : 'text-rose-500/40'}`}>{item.label}</p>
                      <p className={`text-4xl font-black tracking-tighter ${item.pos ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(item.value)}</p>
                      <div className="flex items-center justify-between mt-6">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.date}</span>
                        <ArrowUpRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${item.pos ? 'text-emerald-400' : 'text-rose-400'}`} />
                      </div>
                    </div>
                   ))}
                 </div>
              </section>

              <div className="glass border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-48 h-48 text-blue-500" />
                </div>
                <h3 className="text-white text-2xl font-black tracking-tight mb-10 flex items-center gap-4">
                  <Settings2 className="w-6 h-6 text-blue-500" /> Statistical DNA
                </h3>
                <div className="space-y-2 relative z-10">
                  {[
                    { label: 'Average Alpha', value: formatCurrency(stats.avgWin), color: 'text-emerald-400' },
                    { label: 'Average Decay', value: formatCurrency(stats.avgLoss), color: 'text-rose-400' },
                    { label: 'Reward Multiplier', value: stats.riskReward.toFixed(2), color: 'text-white' },
                    { label: 'Market Expectancy', value: formatCurrency(stats.expectancy), color: 'text-blue-400' },
                    { label: 'System Recovery', value: stats.recoveryFactor.toFixed(2), color: 'text-white' },
                    { label: 'Profit Coefficient', value: stats.profitFactor.toFixed(2), color: 'text-white' },
                    { label: 'Max Structural DD', value: `${stats.maxDrawdownPercent.toFixed(2)}%`, color: 'text-amber-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-6 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 px-4 rounded-2xl transition-all group">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] group-hover:text-slate-300 transition-colors">{item.label}</span>
                      <span className={`font-black text-xl tracking-tighter ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <section className="glass border border-slate-800 rounded-[3rem] overflow-hidden">
                <div className="p-10 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/30">
                   <h3 className="text-white font-black text-2xl tracking-tighter">Live Stream</h3>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Active</span>
                     <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                   </div>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {recentTrades.map((t) => (
                    <div key={t.id} className="p-10 flex items-center justify-between hover:bg-slate-800/40 transition-all group">
                       <div className="flex flex-col">
                          <span className="font-black text-xl text-white tracking-tighter group-hover:text-blue-400 transition-colors">{t.symbol}</span>
                          <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-2">{t.timestamp.toLocaleDateString()}</span>
                       </div>
                       <div className="flex flex-col items-end">
                          <span className={`font-black text-xl tracking-tighter flex items-center gap-2 ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {t.pnl >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                             {formatCurrency(t.pnl)}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-[0.3em] mt-2 px-3 py-1 rounded-full ${['Long', 'Buy'].includes(t.direction) ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'}`}>
                            {t.direction}
                          </span>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <TradeTable trades={trades} />
          </div>
        )}
      </main>

      <footer className="w-full py-24 border-t border-slate-900/50 bg-[#020617] relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-blue-600/5 opacity-20 pointer-events-none"></div>
        <div className="max-w-[1700px] mx-auto px-12 flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
             <div className="p-4 glass border border-slate-800 rounded-[2rem] shadow-2xl">
                <Logo className="w-20 h-20" />
             </div>
             <div className="text-center md:text-left">
                <p className="text-white font-black text-3xl tracking-tighter mb-2">Trading Paradise</p>
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">Where Institutional Data Meets Human Alpha</p>
             </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-5">
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/60">Global Analytics Node 2.5.0-Release</span>
             <p className="text-slate-500 text-sm font-black uppercase tracking-widest">developed with pride by <span className="text-white underline decoration-blue-500 decoration-4 underline-offset-8">Rishi Saha</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;




