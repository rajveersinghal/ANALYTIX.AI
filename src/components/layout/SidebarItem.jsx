import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarItem({ to, icon: Icon, label }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `
        flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all
        ${isActive 
          ? 'bg-white/[0.06] text-white' 
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'}
      `}
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
}
