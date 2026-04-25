import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, PlayCircle } from 'lucide-react';

export default function Hero() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative pt-48 pb-48 px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="hero-glow opacity-20" />
      
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <h1 className="text-[56px] md:text-[84px] font-medium tracking-[-0.03em] leading-[1] text-white mb-8 animate-fade-in">
          The data intelligence system <br /> for teams and agents
        </h1>
        
        <p className="text-[18px] md:text-[20px] text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Upload your data, run intelligent pipelines, and get clear insights — automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={() => navigate(user ? '/app/dashboard' : '/signup')}
            className="w-full sm:w-auto btn-linear px-10 py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2"
          >
            Get Started Free
            <ArrowRight size={16} />
          </button>
          <button className="w-full sm:w-auto btn-secondary px-10 py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 group">
            <PlayCircle size={18} className="text-zinc-500 group-hover:text-white transition-colors" />
            View Demo
          </button>
        </div>
      </div>
    </section>
  );
}
