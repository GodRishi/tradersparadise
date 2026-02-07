
import React, { useState } from 'react';
import { Trade } from '../types';
import { formatCurrency } from '../utils/stats';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
}

const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Trade>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Trade) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredTrades = trades
    .filter(t => t.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const renderSortIcon = (field: keyof Trade) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-slate-600" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />;
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden mt-8">
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-bold">Trade History</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search symbol..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/50 text-slate-400 font-medium border-b border-slate-800">
            <tr>
              {['Timestamp', 'Symbol', 'Direction', 'Entry', 'Exit', 'Qty', 'PnL'].map((header) => {
                const fieldMap: Record<string, keyof Trade> = {
                  'Timestamp': 'timestamp',
                  'Symbol': 'symbol',
                  'Direction': 'direction',
                  'Entry': 'entryPrice',
                  'Exit': 'exitPrice',
                  'Qty': 'quantity',
                  'PnL': 'pnl'
                };
                const field = fieldMap[header];
                return (
                  <th 
                    key={header} 
                    className="px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors"
                    onClick={() => handleSort(field)}
                  >
                    <div className="flex items-center gap-1">
                      {header}
                      {renderSortIcon(field)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 text-slate-400">{trade.timestamp.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold">{trade.symbol}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    ['Long', 'Buy'].includes(trade.direction) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {trade.direction}
                  </span>
                </td>
                <td className="px-6 py-4">{trade.entryPrice.toFixed(2)}</td>
                <td className="px-6 py-4">{trade.exitPrice.toFixed(2)}</td>
                <td className="px-6 py-4">{trade.quantity}</td>
                <td className={`px-6 py-4 font-semibold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {formatCurrency(trade.pnl)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTrades.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No trades found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeTable;
