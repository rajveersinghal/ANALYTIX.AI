import React from 'react';

export default function SettingsSection({ title, description, children }) {
  return (
    <div className="py-10 first:pt-0 border-b border-white/[0.05] last:border-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
          <p className="text-[12px] text-zinc-500 leading-relaxed">{description}</p>
        </div>
        <div className="md:col-span-2">
          {children}
        </div>
      </div>
    </div>
  );
}
