
import React, { useState, useEffect } from 'react';
import { ColumnMapping } from '../types';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';

interface MappingUIProps {
  headers: string[];
  onConfirm: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

const MappingUI: React.FC<MappingUIProps> = ({ headers, onConfirm, onCancel }) => {
  const [mapping, setMapping] = useState<ColumnMapping>({
    timestamp: '',
    symbol: '',
    direction: '',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Simple auto-detection logic
  useEffect(() => {
    const newMapping = { ...mapping };
    headers.forEach(h => {
      const lower = h.toLowerCase();
      if (lower.includes('date') || lower.includes('time')) newMapping.timestamp = h;
      if (lower.includes('symbol') || lower.includes('ticker') || lower.includes('inst')) newMapping.symbol = h;
      if (lower.includes('dir') || lower.includes('side') || lower.includes('buy')) newMapping.direction = h;
      if (lower.includes('entry') || (lower.includes('open') && lower.includes('price'))) newMapping.entryPrice = h;
      if (lower.includes('exit') || (lower.includes('close') && lower.includes('price'))) newMapping.exitPrice = h;
      if (lower.includes('qty') || lower.includes('size') || lower.includes('amount')) newMapping.quantity = h;
      if (lower.includes('pnl') || lower.includes('profit') || lower.includes('gain')) newMapping.pnl = h;
    });
    setMapping(newMapping);
  }, [headers]);

  const handleConfirm = () => {
    const missing = Object.entries(mapping)
      .filter(([key, value]) => key !== 'pnl' && !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      setErrors([`Please map all required fields: ${missing.join(', ')}`]);
      return;
    }
    onConfirm(mapping);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Map CSV Columns
          </h2>
          <p className="text-slate-400 text-sm mt-1">Select the corresponding columns from your CSV to match the trade analyzer schema.</p>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {errors.map((err, i) => (
            <div key={i} className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {err}
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { id: 'timestamp', label: 'Date/Time*', icon: <Check className="w-3 h-3"/> },
              { id: 'symbol', label: 'Symbol*', icon: <Check className="w-3 h-3"/> },
              { id: 'direction', label: 'Direction*', icon: <Check className="w-3 h-3"/> },
              { id: 'entryPrice', label: 'Entry Price*', icon: <Check className="w-3 h-3"/> },
              { id: 'exitPrice', label: 'Exit Price*', icon: <Check className="w-3 h-3"/> },
              { id: 'quantity', label: 'Quantity*', icon: <Check className="w-3 h-3"/> },
              { id: 'pnl', label: 'PnL (Optional)', icon: <Check className="w-3 h-3"/> },
            ].map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{field.label}</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={mapping[field.id as keyof ColumnMapping] || ''}
                  onChange={(e) => setMapping({ ...mapping, [field.id]: e.target.value })}
                >
                  <option value="">-- Select Column --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            Load Analytics <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MappingUI;
