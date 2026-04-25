import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ArchiveTable({ runs, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="card-linear p-0 overflow-hidden bg-white/[0.01] border-white/[0.05]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/[0.05] bg-white/[0.01]">
            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dataset Artifact</th>
            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Inference Status</th>
            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Best Performer</th>
            <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Processed On</th>
            <th className="px-6 py-4 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr 
              key={run.id} 
              className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-all duration-150 group cursor-pointer"
              onClick={() => navigate(`/app/insights?job_id=${run.id}`)}
            >
              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-white group-hover:text-white transition-colors">{run.filename}</span>
                <p className="text-[10px] text-zinc-600 font-mono mt-0.5 truncate max-w-[150px]">{run.id}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`badge-linear ${
                  run.status === 'completed' ? 'badge-success' :
                  run.status === 'running' ? 'badge-info' :
                  'badge-error'
                }`}>
                  {run.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  {run.best_model || 'Neural Engine'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
                  {new Date(run.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </td>
              <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button 
                    onClick={() => navigate(`/app/insights?job_id=${run.id}`)}
                    className="p-1.5 hover:bg-white/[0.08] rounded-lg text-zinc-500 hover:text-white transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    onClick={() => onDelete(run.id)}
                    className="p-1.5 hover:bg-rose-500/10 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
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
