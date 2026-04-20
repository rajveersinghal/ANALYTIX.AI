import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ChatWidget from "../ChatWidget";
import CommandPalette from "../CommandPalette";
import Onboarding from "../Onboarding";
import ShortcutsOverlay from "../ShortcutsOverlay";
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function MainLayout() {
  const location = useLocation();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Auto-close mobile menu on navigation
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app">
      <div 
        className={`mobile-overlay ${isMenuOpen ? 'visible' : ''}`} 
        onClick={() => setIsMenuOpen(false)}
      ></div>

      <header className="mobile-header">
        <div className="flex items-center gap-3" onClick={() => setIsMenuOpen(true)}>
          <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center text-violet">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12H21M3 6H21M3 18H21" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-black syne tracking-tighter">ANALYTIX.AI</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-slate-400" onClick={() => setIsPaletteOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
      </header>

      <Sidebar isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      <div className="main">
        <Navbar onSearchClick={() => setIsPaletteOpen(true)} />
        <div className="ambient"></div>
        <main className="page">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ChatWidget />
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      <Onboarding />
      <ShortcutsOverlay />
    </div>
  );
}
