import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  deleteDocs
} from "firebase/firestore";

import { db } from "./utils/firebase";
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
import { auth, googleProvider } from "./utils/firebase";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[] | null>(null);
  const [view, setView] = useState<"analytics" | "trades">("analytics");

  // 🔐 AUTH STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        await loadUserTrades(u.uid);
      } else {
        setTrades(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 📥 LOAD TRADES FROM FIRESTORE
  const loadUserTrades = async (uid: string) => {
    try {
      const tradesRef = collection(db, "users", uid, "trades");
      const snapshot = await getDocs(tradesRef);

      const loadedTrades: Trade[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          timestamp: new Date(data.timestamp),
        } as Trade;
      });

      setTrades(loadedTrades);
    } catch (err) {
      console.error("Error loading trades:", err);
    }
  };

  // 💾 SAVE TRADES TO FIRESTORE
  const saveTradesToCloud = async (parsedTrades: Trade[]) => {
    if (!user) return;

    try {
      const tradesRef = collection(db, "users", user.uid, "trades");

      // optional: clear old trades
      const oldDocs = await getDocs(tradesRef);
      await Promise.all(oldDocs.docs.map((d) => d.ref.delete()));

      // save new trades
      for (const trade of parsedTrades) {
        await addDoc(tradesRef, {
          ...trade,
          timestamp: trade.timestamp.toISOString(),
        });
      }

      setTrades(parsedTrades);
    } catch (err) {
      console.error("Error saving trades:", err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTrades(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

  // ================= LANDING (NO TRADES) =================
  if (!trades || !stats) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-blue-500/30 flex flex-col">
        <nav className="p-10 flex items-center justify-between max-w-[1700px] mx-auto w-full flex-shrink-0">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="p-2 glass border border-slate-700 rounded-2xl group-hover:scale-110 transition-all duration-500 shadow-2xl">
              <Logo className="w-12 h-12" />
            </div>
            <span className="font-black text-3xl tracking-tighter">
              Trading Paradise
            </span>
          </div>

          <div className="flex items-center gap-6">
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
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center py-20">
          {/* 🔥 CHANGED: save to cloud instead of direct setTrades */}
          <CSVUpload onDataParsed={saveTradesToCloud} />
        </div>
      </div>
    );
  }

  // ================= MAIN APP (UNCHANGED UI) =================
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col selection:bg-blue-500/20">
    
    </div>
  );
};

export default App;
