import React from 'react';

export const Skeleton = ({ className }) => (
  <div className={`skeleton ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card-linear p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4 px-4 py-2 border-b border-white/[0.05]">
      <Skeleton className="h-4 w-8" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-white/[0.02]">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
      </div>
    ))}
  </div>
);

export const EmptyState = ({ title, description, icon: Icon, action }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-zinc-500 mb-6">
      {Icon && <Icon size={32} />}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-zinc-500 max-w-xs mb-8">{description}</p>
    {action && (
      <button 
        onClick={action.onClick}
        className="btn-linear px-8 py-2.5"
      >
        {action.label}
      </button>
    )}
  </div>
);
