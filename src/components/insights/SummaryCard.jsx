import React from 'react';

export default function SummaryCard({ label, value, icon: Icon, type = 'default' }) {
  const typeMap = {
    success: 'badge-success',
    info: 'badge-info',
    warning: 'badge-warning',
    default: 'bg-white/5 border-white/10 text-zinc-400'
  };

  return (
    <div className="card-linear p-6 card-linear-hover">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <div className="text-zinc-500">
          <Icon size={16} />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white tracking-tighter truncate">{value}</h3>
      <div className="mt-4">
        <span className={`badge-linear ${typeMap[type]}`}>Validated</span>
      </div>
    </div>
  );
}
