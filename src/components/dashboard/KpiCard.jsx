import React from 'react';

export default function KpiCard({ label, value, trend, trendType = 'neutral' }) {
  return (
    <div className="card-linear p-6 card-linear-hover">
      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline justify-between">
        <h3 className="text-3xl font-bold text-white tracking-tighter">{value}</h3>
        {trend && (
          <span className={`badge-linear ${
            trendType === 'positive' ? 'badge-success' : 
            trendType === 'negative' ? 'badge-error' : 'badge-info'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
