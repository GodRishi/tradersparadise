import React, { useState, useMemo, useEffect } from "react";
import { Trade } from "./types";
import CSVUpload from "./components/CSVUpload";
import SummaryCards from "./components/SummaryCards";
import {
  EquityCurve,
  DrawdownCurve,
  WinLossDistribution,
  PerformanceBySymbol,
} from "./components/Charts";
import TradeTable from "./components/TradeTable";
import TradingCalendar from "./components/TradingCalendar";
import DirectionalAnalysis from "./components/DirectionalAnalysis";
import { calculateStats, formatCurrency } from "./utils/stats";
import { Logo } from "./components/Logo";
import {
  Table,
  BarChart3,
  Settings2,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe,
  ShieldCheck,
} from "lucide-react";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";

import { auth, googleProvider, db } from "./utils/firebase";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[] | null>(null);
  const [view, setView] = useState<"analytics" | "trades">("analytics");

  /* ================= AUTH LISTENER ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await loadTradesFromCloud(firebaseUser.uid);
      } else {
        setTrades(null);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTrades(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /* ================= LOAD TRADES ================= */
  const loadTradesFromCloud = async (uid: string) => {
    try {
      const q = query(collection(db, "trades"), where("uid", "==", uid));
      const snapshot = await getDocs(q);

      const cloudTrades: Trade[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          timestamp: new Date(data.timestamp),
        } as Trade;
      });

      setTrades(cloudTrades.length ? cloudTrades : null);
    } catch (error) {
      console.error("Error loading trades:", error);
    }
  };

  /* ================= SAVE TRADES ================= */
  const saveTradesToCloud = async (newTrades: Trade[]) => {
    if (!user) return;

    try {
      const tradesRef = collection(db, "trades");

      for (const trade of newTrades) {
        await addDoc(tradesRef, {
          ...trade,
          uid: user.uid,
          timestamp: trade.timestamp.toISOString(),
        });
      }

      console.log("Trades saved to cloud ✔");
    } catch (error) {
      console.error("Error saving trades:", error);
    }
  };

  /* ================= HANDLE CSV ================= */
  const handleCSVParsed = async (parsedTrades: Trade[]) => {
    setTrades(parsedTrades);
    await saveTradesToCloud(parsedTrades);
  };

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    return trades ? calculateStats(trades) : null;
  }, [trades]);

  const recentTrades = useMemo(() => {
    return trades
      ? [...trades]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10)
      : [];
  }, [trades]);

  /* ================= LANDING PAGE ================= */
  if (!trades || !stats) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col">
        <nav className="p-10 flex items-center justify-between max-w-[1700px] mx-auto w-full">
          <div className="flex items-center gap-4">
            <Logo className="w-12 h-12" />
            <span className="font-black text-3xl">Trading Paradise</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL || ""}
                className="w-9 h-9 rounded-full border"
              />
              <button onClick={handleLogout} className="text-rose-400 text-xs">
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="px-5 py-2 rounded-xl bg-blue-600 text-xs font-bold"
            >
              Sign In
            </button>
          )}
        </nav>

        <div className="flex-1 flex items-center justify-center">
          <CSVUpload onDataParsed={handleCSVParsed} />
        </div>
      </div>
    );
  }

  /* ================= MAIN DASHBOARD ================= */
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col">
      <header className="p-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Logo className="w-10 h-10" />
          <h1 className="font-black text-2xl">Trading Paradise</h1>
        </div>

        <button
          onClick={() => setTrades(null)}
          className="flex items-center gap-2 text-rose-400"
        >
          <LogOut className="w-4 h-4" /> New Feed
        </button>
      </header>

      <main className="max-w-[1700px] mx-auto w-full p-6 space-y-16 flex-1">
        <SummaryCards stats={stats} />

        {view === "analytics" ? (
          <>
            <EquityCurve trades={trades} />
            <TradingCalendar dailyPnL={stats.dailyPnL} />
            <DirectionalAnalysis
              long={stats.longStats}
              short={stats.shortStats}
            />
            <WinLossDistribution trades={trades} />
            <DrawdownCurve trades={trades} />
            <PerformanceBySymbol trades={trades} />
          </>
        ) : (
          <TradeTable trades={trades} />
        )}
      </main>
    </div>
  );
};

export default App;
