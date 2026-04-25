import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Isolated Auth Grid */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          zIndex: 0
        }}
      />
      <div className="hero-glow" />

      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-[12px] text-zinc-500 hover:text-white transition-colors z-10"
      >
        <ArrowLeft size={14} />
        Back to home
      </Link>
      
      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        <div className="flex justify-center mb-10">
          <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 32H18L26 14L34 50L42 32H56" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-2xl font-bold text-white tracking-tight">AnalytixAI</span>
          </Link>
        </div>
        <div className="card-linear p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
