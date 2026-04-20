import React from 'react';
import { motion } from 'framer-motion';

export const Logo = ({ size = 32, showText = true, className = "" }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600 to-emerald-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center bg-[#0d1026] border border-white/10 rounded-xl overflow-hidden"
          style={{ width: size, height: size }}
        >
          {/* Original Heartbeat/Pulse Icon */}
          <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 13H7L10 5L14 21L17 13H24" stroke="url(#logo_grad_original)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="logo_grad_original" x1="2" y1="13" x2="24" y2="13" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9a85ff" />
                <stop offset="1" stopColor="#8169ff" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {showText && (
        <div className="syne font-black text-xl tracking-tighter text-white">
          Analytix<span className="text-[#8169ff]">AI</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
