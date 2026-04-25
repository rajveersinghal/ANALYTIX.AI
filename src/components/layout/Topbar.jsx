import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, Search, Command, HelpCircle, Menu } from 'lucide-react';

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="h-14 border-b border-zinc-800 bg-[#000000]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <h2 className="text-sm font-semibold tracking-tight text-white hidden sm:block">{title}</h2>
        
        <div className="hidden lg:flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-1.5 pl-9 pr-12 text-[13px] text-white focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.02]">
              <Command size={10} className="text-zinc-500" />
              <span className="text-[10px] font-bold text-zinc-500">K</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full border border-black" />
        </button>
        <button className="hidden sm:flex p-2 text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all">
          <HelpCircle size={18} />
        </button>
        <div className="h-4 w-px bg-white/[0.1] mx-2 hidden sm:block" />
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-medium text-white leading-none mb-1">{user?.full_name || 'User'}</p>
            <p className="text-[10px] text-zinc-500 leading-none truncate max-w-[100px]">Workspace</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
