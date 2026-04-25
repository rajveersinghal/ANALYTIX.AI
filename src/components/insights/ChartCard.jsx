import React from 'react';

export default function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card-linear p-8 bg-white/[0.01] border-white/[0.05]">
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white tracking-tight mb-1">{title}</h3>
        <p className="text-[11px] text-zinc-500 leading-relaxed font-light">{subtitle}</p>
      </div>
      <div className="h-[300px] w-full">
        {children}
      </div>
    </div>
  );
}
