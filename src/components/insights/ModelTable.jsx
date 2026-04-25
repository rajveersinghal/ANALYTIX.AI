import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function ModelTable({ models }) {
  return (
    <div className="card-linear p-0 overflow-hidden bg-white/[0.01] border-white/[0.05]">
      <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.01]">
        <h3 className="text-sm font-semibold text-white tracking-tight">Model Leaderboard</h3>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/[0.05] bg-white/[0.01]">
            <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Algorithm</th>
            <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Accuracy</th>
            <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Precision</th>
            <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Recall</th>
            <th className="px-6 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {models.map((model, idx) => (
            <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
                  <span className="text-sm font-medium text-white">{model.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm font-mono text-zinc-300">{model.accuracy}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm font-mono text-zinc-500 group-hover:text-zinc-300">{model.precision}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm font-mono text-zinc-500 group-hover:text-zinc-300">{model.recall}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-white/[0.1] rounded-lg text-zinc-500 hover:text-white">
                  <ExternalLink size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
