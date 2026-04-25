import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function RunsTable({ runs }) {
  return (
    <div className="card-linear p-0 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/[0.05] bg-white/[0.02]">
            <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Analysis Name</th>
            <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-center">Accuracy</th>
            <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right">Timestamp</th>
            <th className="px-6 py-4 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run, idx) => (
            <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-all duration-150 group">
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-white group-hover:text-white transition-colors">{run.name}</span>
              </td>
              <td className="px-6 py-4">
                <span className={`badge-linear ${
                  run.status === 'Completed' ? 'badge-success' :
                  run.status === 'Processing' ? 'badge-info' :
                  'badge-warning'
                }`}>
                  {run.status}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm font-mono text-zinc-400 group-hover:text-zinc-200">{run.accuracy}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-xs text-zinc-500 group-hover:text-zinc-400">{run.date}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end">
                  <button className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-white/[0.1] rounded-lg text-zinc-500 hover:text-white">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
