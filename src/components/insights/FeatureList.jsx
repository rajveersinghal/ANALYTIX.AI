import React from 'react';

export default function FeatureList({ features }) {
  return (
    <div className="card-linear p-6 bg-white/[0.01] border-white/[0.05]">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white tracking-tight">Feature Importance</h3>
        <p className="text-[11px] text-zinc-500 leading-relaxed font-light">Contribution score per attribute</p>
      </div>
      <div className="space-y-5">
        {features.map((feature, i) => (
          <div key={i} className="space-y-2 group">
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="text-zinc-300 font-mono group-hover:text-white transition-colors">{feature.name}</span>
              <span className="text-zinc-500 group-hover:text-zinc-300">{Math.round(feature.score * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/40 group-hover:bg-white transition-all duration-500 rounded-full" 
                style={{ width: `${feature.score * 100}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
