import React from 'react';

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="card-linear bg-white/[0.02] p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">{title}</h1>
        <p className="text-sm text-zinc-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
