import React from 'react';

export default function AuthInput({ label, type = "text", ...props }) {
  return (
    <div className="space-y-1.5 mb-4">
      {label && <label className="text-[12px] font-medium text-zinc-400 ml-1">{label}</label>}
      <input 
        type={type}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50 transition-all"
        {...props}
      />
    </div>
  );
}
