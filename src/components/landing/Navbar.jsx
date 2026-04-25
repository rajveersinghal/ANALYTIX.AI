import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Product', path: '#' },
    { label: 'Pricing', path: '#' },
    { label: 'Contact', path: '#' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <svg width="20" height="20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
            <path d="M8 32H18L26 14L34 50L42 32H56" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white font-semibold tracking-tight">AnalytixAI</span>
        </Link>
        
        {/* Simplified Links & CTA */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.path} 
                className="text-[13px] text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate('/app/dashboard')}
                className="btn-linear px-5 py-1.5 text-xs rounded-full"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-[13px] text-zinc-400 hover:text-white transition-colors">Log in</Link>
                <button 
                  onClick={() => navigate('/signup')}
                  className="btn-linear px-6 py-2 text-xs rounded-full"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
