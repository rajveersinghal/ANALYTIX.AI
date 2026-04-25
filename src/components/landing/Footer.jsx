import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-zinc-800 bg-[#000000]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <svg width="18" height="18" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
              <path d="M8 32H18L26 14L34 50L42 32H56" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-white font-semibold tracking-tight">AnalytixAI</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-8">
          <a href="#" className="text-[13px] text-zinc-500 hover:text-white transition-colors">Twitter</a>
          <a href="#" className="text-[13px] text-zinc-500 hover:text-white transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
