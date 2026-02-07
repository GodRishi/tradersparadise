
import React, { useState } from 'react';
import { formatCurrency } from '../utils/stats';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface TradingCalendarProps {
  dailyPnL: Record<string, number>;
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({ dailyPnL }) => {
  const [viewDate, setViewDate] = useState(new Date());
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum <= 0 || dayNum > daysInMonth) return null;
    
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return { dayNum, pnl: dailyPnL[dateKey] || 0 };
  });

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));

  return (
    <div className="glass border border-slate-800 rounded-[3rem] p-12 h-full shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h3 className="text-white font-black text-3xl tracking-tighter mb-2">Alpha Heatmap</h3>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            Daily Performance Feed — {monthName} {year}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-[2rem] border border-slate-800">
          <button onClick={prevMonth} className="p-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-90 group">
            <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-white" />
          </button>
          <div className="h-8 w-px bg-slate-800 mx-2"></div>
          <button onClick={nextMonth} className="p-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-90 group">
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-white" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs text-slate-600 font-black uppercase pb-6 tracking-widest">{d}</div>
        ))}
        {days.map((day, i) => {
          const intensity = day ? Math.min(Math.abs(day.pnl) / 1000, 1) : 0;
          const isWinner = day && day.pnl > 0;
          const isLoser = day && day.pnl < 0;
          
          const bgColor = !day ? 'transparent' : isWinner 
            ? `rgba(16, 185, 129, ${0.1 + intensity * 0.4})` 
            : isLoser 
              ? `rgba(244, 63, 94, ${0.1 + intensity * 0.4})`
              : 'rgba(30, 41, 59, 0.4)';

          return (
            <div 
              key={i} 
              className={`min-h-[110px] rounded-3xl border transition-all hover:scale-105 hover:z-20 cursor-default group relative flex flex-col p-4 overflow-hidden
                ${!day ? 'border-transparent opacity-0 pointer-events-none' : 'border-slate-800 shadow-lg'}
              `}
              style={{ backgroundColor: bgColor }}
            >
              {day && (
                <>
                  <span className="text-sm font-black text-slate-500 group-hover:text-white transition-colors">{day.dayNum}</span>
                  <div className="mt-auto flex flex-col items-start">
                    <span className={`text-xs font-black tracking-tight leading-none ${isWinner ? 'text-emerald-400' : isLoser ? 'text-rose-400' : 'text-slate-500'}`}>
                      {day.pnl === 0 ? '$0.00' : formatCurrency(day.pnl)}
                    </span>
                    <div className={`h-1 w-full mt-2 rounded-full transition-all duration-700 ${isWinner ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : isLoser ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-700'}`} style={{ width: day.pnl !== 0 ? '100%' : '20%' }} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-10 pt-10 border-t border-slate-800/50">
        {[
          { label: 'Deep Drawdown', color: 'bg-rose-500' },
          { label: 'Neutral / No Data', color: 'bg-slate-700' },
          { label: 'Profit Expansion', color: 'bg-emerald-500' }
        ].map((legend, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-lg ${legend.color} shadow-lg shadow-black/20`}></div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{legend.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradingCalendar;
