import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, X, Search, Plus, Home, History, Zap, MessageSquare, Settings } from 'lucide-react';

const shortcuts = [
  { group: "Navigation", items: [
    { key: "G + H", desc: "Go to Analytics Home", icon: Home },
    { key: "G + W", desc: "View All Workspaces", icon: Home },
    { key: "G + A", desc: "Open Archive", icon: History },
    { key: "G + S", desc: "Open Settings", icon: Settings },
  ]},
  { group: "Intelligence", items: [
    { key: "Ctrl + K", desc: "Quick Command Palette", icon: Search },
    { key: "N", desc: "Run New Analysis", icon: Plus },
    { key: "C", desc: "Open AI Chat", icon: MessageSquare },
  ]},
  { group: "System", items: [
    { key: "?", desc: "Show Shortcuts Overlay", icon: Command },
    { key: "Esc", desc: "Close Modals / Overlays", icon: X },
  ]}
];

const Key = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[24px] px-2 py-1.5 bg-[#1a1c35] border-t border-white/20 border-x border-white/10 border-b-[3px] border-black/40 rounded-lg text-[10px] font-black text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-[2px] active:border-b-[1px] transition-all transform-gpu mx-0.5">
    {children}
  </kbd>
);

export default function ShortcutsOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#04050f]/90 backdrop-blur-3xl"
            onClick={() => setIsOpen(false)}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateX: 10, y: 40 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateX: 10, y: 40 }}
            className="relative w-full max-w-2xl bg-[#080a18] border border-white/10 rounded-[40px] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center text-violet">
                   <Command size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white syne tracking-tighter italic">Expert <span className="text-violet">Control</span></h2>
                  <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">System Command Architecture</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              {shortcuts.map(group => (
                <div key={group.group}>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#40425a] mb-6 flex items-center gap-2">
                    <div className="w-1 h-3 bg-violet rounded-full" />
                    {group.group}
                  </h3>
                  <div className="space-y-6">
                    {group.items.map(item => (
                      <div key={item.key} className="flex items-center justify-between group cursor-default">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-violet group-hover:bg-violet/5 transition-all duration-300">
                            <item.icon size={16} />
                          </div>
                          <span className="text-[13px] font-bold text-slate-400 group-hover:text-white transition-colors">{item.desc}</span>
                        </div>
                        <div className="flex items-center">
                          {item.key.split(' + ').map((k, i, arr) => (
                            <React.Fragment key={k}>
                              <Key>{k}</Key>
                              {i < arr.length - 1 && <span className="mx-1 text-slate-700 font-bold">+</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-black/40 border-t border-white/5 flex justify-center items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">
                 Global Hub Active · Press <Key>?</Key> to Exit
               </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
