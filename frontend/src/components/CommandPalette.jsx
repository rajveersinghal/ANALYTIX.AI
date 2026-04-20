import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Terminal, 
  LayoutDashboard, 
  Database, 
  Cpu, 
  BarChart3, 
  History, 
  Settings, 
  MessageSquare, 
  FileText, 
  Plus, 
  Zap,
  ChevronRight,
  Command as CommandIcon,
  X,
  Keyboard
} from 'lucide-react';
import { Logo } from './ui/Logo';

const Key = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-1 bg-[#1a1c35] border-t border-white/20 border-x border-white/10 border-b-[2px] border-black/40 rounded text-[9px] font-black text-white shadow-sm mx-0.5">
    {children}
  </kbd>
);

const PALETTE_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', category: 'Pages' },
  { id: 'pipeline', label: 'Data Pipeline', icon: Database, path: '/pipeline', category: 'Pages' },
  { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3, path: '/analytics', category: 'Pages' },
  { id: 'insights', label: 'AI Insights', icon: Cpu, path: '/insights', category: 'Pages' },
  { id: 'history', label: 'Analysis History', icon: History, path: '/history', category: 'Pages' },
  { id: 'reports', label: 'Executive Reports', icon: FileText, path: '/reports', category: 'Pages' },
  { id: 'sales', label: 'Sales Intelligence', icon: Zap, path: '/sales', category: 'Pages' },
  { id: 'chat', label: 'AI Agent Chat', icon: MessageSquare, path: '/chat', category: 'Pages' },
  { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings', category: 'Pages' },
  { id: 'new-analysis', label: 'Run New Analysis', icon: Plus, action: 'NEW_ANALYSIS', category: 'Actions' },
  { id: 'export', label: 'Export Active Report', icon: Zap, action: 'EXPORT', category: 'Actions' },
  { id: 'logout', label: 'Logout / Sign Out', icon: X, action: 'LOGOUT', category: 'Actions' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filteredItems = PALETTE_ITEMS.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        if (filteredItems[activeIndex]) {
          handleSelect(filteredItems[activeIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, filteredItems, onClose]);

  // Global Cmd+K Listener (in case Layout is not mounting it correctly)
  useEffect(() => {
    const handleGlobalK = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // Invert logic if needed, but usually Layout handles this
      }
    };
    window.addEventListener('keydown', handleGlobalK);
    return () => window.removeEventListener('keydown', handleGlobalK);
  }, [onClose]);

  const handleSelect = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      switch(item.action) {
        case 'NEW_ANALYSIS':
          navigate('/pipeline');
          break;
        case 'EXPORT':
          navigate('/reports');
          break;
        case 'LOGOUT':
          localStorage.clear();
          window.location.href = '/login';
          break;
        default:
          console.log(`Triggering action: ${item.action}`);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="command-palette-overlay" onMouseDown={onClose}>
          <motion.div 
            className="command-palette-modal !bg-[#080a18] !border-white/10 !rounded-[24px]"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="command-palette-header border-b border-white/5 !px-6 !py-5">
              <Search className="text-slate-500" size={18} />
              <input 
                ref={inputRef}
                type="text" 
                className="!text-sm !font-bold"
                placeholder="Search commands or pages..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-1 opacity-50">
                 <Key>ESC</Key>
              </div>
            </div>

            <div className="command-palette-body !px-2 !py-3 max-h-[400px]">
              {filteredItems.length > 0 ? (
                <div className="cp-results">
                  {['Pages', 'Actions'].map(category => {
                    const categoryItems = filteredItems.filter(i => i.category === category);
                    if (categoryItems.length === 0) return null;

                    return (
                      <div key={category} className="cp-group">
                        <div className="cp-group-label !text-[10px] !font-black !px-4 !py-2 uppercase tracking-widest text-[#40425a]">{category}</div>
                        {categoryItems.map((item, idx) => {
                          const globalIdx = filteredItems.indexOf(item);
                          const isActive = globalIdx === activeIndex;
                          return (
                            <div 
                              key={item.id}
                              className={`cp-item !rounded-xl !mx-2 !py-3 !px-4 ${isActive ? '!bg-white/[0.04] !text-white' : '!text-slate-400'}`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(item);
                              }}
                              onMouseEnter={() => setActiveIndex(globalIdx)}
                            >
                              <div className={`cp-item-icon !bg-transparent ${isActive ? 'text-violet' : ''}`}>
                                <item.icon size={18} />
                              </div>
                              <div className="cp-item-label !text-[13px] !font-bold">{item.label}</div>
                              {isActive && (
                                <div className="flex items-center gap-2">
                                  <Key>↵</Key>
                                  <ChevronRight size={14} className="text-slate-600" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="cp-no-results py-12">
                  <Terminal size={40} className="mb-4 text-slate-800" />
                  <p className="text-slate-600 font-bold">No results for "{query}"</p>
                </div>
              )}
            </div>

            <div className="command-palette-footer !bg-black/20 !border-white/5 !px-6 !py-4">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <Key>↑</Key><Key>↓</Key> <span>NAVIGATE</span>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <Key>↵</Key> <span>SELECT</span>
                 </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#40425a]">
                 <Logo size={16} showText={false} />
                 <span>ANALYTIX MISSION CONTROL</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
