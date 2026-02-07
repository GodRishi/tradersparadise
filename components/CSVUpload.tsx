
import React, { useRef, useState } from 'react';
import { Upload, FileText, Download, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import MappingUI from './MappingUI';
import { ColumnMapping, Trade } from '../types';
import { Logo } from './Logo';

interface CSVUploadProps {
  onDataParsed: (trades: Trade[]) => void;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ onDataParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<{ headers: string[], data: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setIsParsing(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Failed to parse CSV. Check file format.');
          setIsParsing(false);
          return;
        }

        if (results.data.length === 0) {
          setError('CSV file is empty.');
          setIsParsing(false);
          return;
        }

        const headers = Object.keys(results.data[0] as object);
        setCsvPreview({ headers, data: results.data });
        setIsParsing(false);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const finalizeMapping = (mapping: ColumnMapping) => {
    if (!csvPreview) return;

    let currentEquity = 0;
    let peakEquity = 0;

    const trades: Trade[] = csvPreview.data.map((row, idx) => {
      const entryPrice = parseFloat(row[mapping.entryPrice]) || 0;
      const exitPrice = parseFloat(row[mapping.exitPrice]) || 0;
      const quantity = parseFloat(row[mapping.quantity]) || 1;
      const direction = row[mapping.direction]?.toString().toLowerCase();
      const isLong = direction?.includes('long') || direction?.includes('buy');
      
      let pnl = mapping.pnl ? (parseFloat(row[mapping.pnl]) || 0) : 0;
      if (!mapping.pnl) {
        pnl = isLong ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
      }

      return {
        id: `trade-${idx}`,
        timestamp: new Date(row[mapping.timestamp]),
        symbol: row[mapping.symbol] || 'Unknown',
        direction: isLong ? 'Long' : 'Short',
        entryPrice,
        exitPrice,
        quantity,
        pnl,
        equity: 0,
        drawdown: 0,
      };
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    trades.forEach((trade) => {
      currentEquity += trade.pnl;
      trade.equity = currentEquity;
      peakEquity = Math.max(peakEquity, currentEquity);
      trade.drawdown = peakEquity - currentEquity;
    });

    onDataParsed(trades);
  };

  const loadDemoData = () => {
    const demoTrades: Trade[] = Array.from({ length: 150 }).map((_, i) => {
      const pnl = (Math.random() - 0.3) * 600;
      return {
        id: `demo-${i}`,
        timestamp: new Date(Date.now() - (150 - i) * 86400000),
        symbol: ['TSLA', 'NVDA', 'BTCUSDT', 'XAUUSD', 'ETHUSD', 'AMD', 'SPY'][Math.floor(Math.random() * 7)],
        direction: Math.random() > 0.5 ? 'Long' : 'Short',
        entryPrice: 100 + Math.random() * 400,
        exitPrice: 100 + Math.random() * 400,
        quantity: 1,
        pnl,
        equity: 0,
        drawdown: 0
      };
    });

    let eq = 0;
    let peak = 0;
    demoTrades.forEach(t => {
      eq += t.pnl;
      t.equity = eq;
      peak = Math.max(peak, eq);
      t.drawdown = peak - eq;
    });

    onDataParsed(demoTrades);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-6 py-10 animate-in fade-in duration-1000">
      <div className="max-w-5xl w-full text-center mb-16">
        <div className="flex justify-center mb-8 animate-float">
          <div className="p-6 glass border border-slate-700 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(59,130,246,0.3)]">
            <Logo className="w-32 h-32" />
          </div>
        </div>
        <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.6em] mb-10">
          Global Analytical Suite v2.5
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold mb-6 tracking-tight leading-tight">
          Escape into <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-500">Trading Paradise</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Refine your strategy. Uncover hidden alpha. <br/>Transform raw history into pure intelligence.
        </p>
      </div>

      <div 
        className={`w-full max-w-2xl p-20 rounded-[4rem] border-4 border-dashed transition-all cursor-pointer glass relative group
          ${isDragging ? 'border-blue-500 bg-blue-500/5 scale-105 shadow-2xl shadow-blue-900/40' : 'border-slate-800 hover:border-slate-700'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".csv"
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center gap-8">
          <div className="w-28 h-28 rounded-[2.5rem] bg-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            {isParsing ? (
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            ) : (
              <Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors" />
            )}
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-3xl font-black tracking-tighter">Inject History Node</h3>
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">Drag Trade CSV or Click to Browse</p>
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-8">
        <p className="text-slate-700 text-[10px] uppercase font-black tracking-[0.5em]">Sandbox Operations</p>
        <button 
          onClick={loadDemoData}
          className="flex items-center gap-5 px-12 py-5 bg-white text-slate-950 rounded-[2rem] font-black text-lg transition-all hover:scale-110 shadow-2xl hover:shadow-white/20 active:scale-95"
        >
          <FileText className="w-7 h-7" />
          Initialize Demo Environment
        </button>
      </div>

      {csvPreview && (
        <MappingUI 
          headers={csvPreview.headers} 
          onConfirm={finalizeMapping} 
          onCancel={() => setCsvPreview(null)}
        />
      )}
    </div>
  );
};

export default CSVUpload;
