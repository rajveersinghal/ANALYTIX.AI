import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  BarChart3, 
  Archive as ArchiveIcon, 
  Settings, 
  MessageSquare,
  ChevronRight,
  X
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
  { icon: Upload, label: 'Upload Data', path: '/app/upload' },
  { icon: BarChart3, label: 'Insights', path: '/app/insights' },
  { icon: MessageSquare, label: 'Neural Chat', path: '/app/chat' },
  { icon: ArchiveIcon, label: 'Archive', path: '/app/archive' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

export default function Sidebar({ onClose }) {
  return (
    <aside className="w-64 border-r border-zinc-800 bg-[#08090a] flex flex-col h-screen relative z-40">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 px-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.href = '/app/dashboard'}
          >
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 32H18L26 14L34 50L42 32H56" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-semibold text-[15px] tracking-tight text-white">AnalytixAI</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
            title="Hide Sidebar"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 mb-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Main Workspace</span>
        </div>
        
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => window.innerWidth < 1024 && onClose()}
            className={({ isActive }) => `
              flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 group
              ${isActive 
                ? 'bg-white/[0.05] text-white' 
                : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'}
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className="transition-colors" />
              <span className="text-sm font-medium tracking-tight">{item.label}</span>
            </div>
            <ChevronRight 
              size={14} 
              className={`opacity-0 group-hover:opacity-40 transition-opacity transform group-hover:translate-x-0.5`} 
            />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-800">
        <div className="px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] group cursor-pointer hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-white/5 flex items-center justify-center text-[10px] text-zinc-400">RS</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">Rajveer Singhal</p>
              <p className="text-[10px] text-zinc-500 truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
