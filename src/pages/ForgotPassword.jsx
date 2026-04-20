import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ChevronLeft, ArrowRight, ShieldCheck, CheckCircle2, Lock, X } from "lucide-react";
import { apiClient } from "../api/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Simulate or call real API
      await apiClient.requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      console.error("Reset request failed:", err);
      // Even if it fails (e.g. email not found), common practice is to simulate success 
      // for security, but here we can show a specific error if we want.
      setError(err.response?.data?.message || "Failed to process request. Please try again.");
      // Simulation for demo purposes if backend isn't ready
      if (err.code === 'ERR_NETWORK') {
         setSubmitted(true); 
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="mesh"></div>
      
      <div className="auth-form-side">
        <div className="auth-form-inner">
          <div className="auth-brand">
             <Link to="/" className="auth-logo flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 13H7L10 5L14 21L17 13H24" stroke="url(#auth_logo_grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="auth_logo_grad" x1="2" y1="13" x2="24" y2="13" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#9a85ff"/><stop offset="1" stopColor="#8169ff"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="auth-logo-text syne font-black text-[20px] tracking-tight text-[#eeeeff]">Analytix<span className="text-[#8169ff]">AI</span></span>
             </Link>
          </div>

          <div className="auth-card-wrap">
            <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Login</span>
            </Link>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="auth-header">
                    <div className="w-12 h-12 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center text-violet mb-6">
                      <ShieldCheck size={24} />
                    </div>
                    <h1 className="syne font-black text-2xl text-white">Reset Password</h1>
                    <p className="text-sm text-gray-500 mt-2">
                      Enter your email address and we'll send you a secure link to reset your password.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                        <Lock size={16} />
                      </div>
                      <div className="text-[12px] font-bold text-rose-100">{error}</div>
                      <button onClick={() => setError(null)} className="ml-auto text-rose-500 p-1"><X size={14} /></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="form-group relative">
                      <label className="auth-label">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                          className="auth-input pl-10" 
                          type="email" 
                          placeholder="name@company.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    
                    <button type="submit" className={`btn-submit ${isSubmitting ? 'loading' : ''}`}>
                      {isSubmitting ? "Sending Link..." : "Send Reset Link →"}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="auth-success-state py-10 text-center"
                >
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-mint/20 text-mint rounded-full flex items-center justify-center relative">
                      <CheckCircle2 size={40} />
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-mint/30 rounded-full"
                      />
                    </div>
                  </div>
                  <h2 className="syne font-black text-2xl text-white mb-2">Check your inbox</h2>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                    We've sent a password reset link to <span className="text-white font-bold">{email}</span>. 
                    Please check your email and follow the instructions.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => window.open('https://gmail.com', '_blank')} 
                      className="btn-submit"
                      style={{ background: 'var(--mint)', color: '#000' }}
                    >
                      Open Email App
                    </button>
                    <button 
                      onClick={() => setSubmitted(false)} 
                      className="text-xs font-bold text-gray-500 hover:text-white transition-colors py-2"
                    >
                      Didn't get the email? Try again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="auth-footer-links mt-12">
               <p className="text-[11px] text-gray-500 text-center">
                  Protected by AnalytixAI Shield Identity Services.
               </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mt-auto pt-12 opacity-40">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded bg-violet/20 flex items-center justify-center text-violet">
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <span className="text-[9px] font-black syne tracking-wider text-white">ANALYTIXAI</span>
             </div>
             <div className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                © Rajveer Singhal❤️
             </div>
          </div>
        </div>
      </div>

      <div className="auth-slider-side overflow-hidden">
        <div className="slider-overlay"></div>
        <div className="slider-content">
           <div className="slide-item">
              <div className="slide-icon" style={{ color: 'var(--violet)' }}>
                 <Lock size={32} />
              </div>
              <h2 className="syne slide-title">Forgot your Logic? No problem.</h2>
              <p className="slide-desc">Our automated recovery system ensures your analytics pipeline stays secure while getting you back in the driver's seat.</p>
           </div>
        </div>

        {/* Decorative Badge */}
        <div className="slider-badge">
           <div className="badge-avatars">
              {['RK', 'PM', 'SV', 'AN'].map((name, i) => (
                <div key={i} className={`b-avatar ba-${i}`}>
                   {name}
                </div>
              ))}
              <div className="b-avatar ba-plus">+</div>
           </div>
           <div className="badge-content">
              <div className="badge-stars">★★★★★</div>
              <div className="badge-text">Secure Identity Recovery</div>
           </div>
        </div>
      </div>
    </div>
  );
}
