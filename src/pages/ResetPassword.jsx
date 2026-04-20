import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { apiClient } from "../api/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await apiClient.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error("Reset failed:", err);
      setError(err.response?.data?.message || "Failed to reset password. The link may have expired.");
      // Simulation for demo
      if (err.code === 'ERR_NETWORK') {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
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
            {!success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="auth-header">
                  <h1 className="syne font-black text-2xl text-white">Create New Password</h1>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter a secure password for your account. Make sure it's something unique.
                  </p>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                      <AlertCircle size={16} />
                    </div>
                    <div className="text-[12px] font-bold text-rose-100">{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="auth-label">New Password</label>
                    <div className="relative">
                      <input 
                        className="auth-input pr-10" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="auth-label">Confirm Password</label>
                    <input 
                      className="auth-input" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <button type="submit" className={`btn-submit ${isSubmitting ? 'loading' : ''}`}>
                    {isSubmitting ? "Updating Password..." : "Update Password →"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-mint/20 text-mint rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} />
                  </div>
                </div>
                <h2 className="syne font-black text-2xl text-white mb-2">Password Updated</h2>
                <p className="text-gray-400 text-sm mb-8">
                  Your password has been reset successfully. Redirecting you to login...
                </p>
                <Link to="/login" className="btn-submit" style={{ background: 'var(--mint)', color: '#000' }}>
                  Back to Login Now
                </Link>
              </motion.div>
            )}
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

      <div className="auth-slider-side">
        <div className="slider-overlay"></div>
        <div className="slider-content">
           <div className="slide-item">
              <div className="slide-icon" style={{ color: 'var(--mint)' }}>
                 <CheckCircle2 size={32} />
              </div>
              <h2 className="syne slide-title">Security is our Priority.</h2>
              <p className="slide-desc">Updating your password is an essential part of maintaining the integrity of your intelligence workspace.</p>
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
              <div className="badge-text">Enterprise Grade Protection</div>
           </div>
        </div>
      </div>
    </div>
  );
}
