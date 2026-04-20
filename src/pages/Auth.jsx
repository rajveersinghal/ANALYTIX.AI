import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight,
  Database,
  Search,
  Lock,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

const SLIDES = [
  {
    icon: <BarChart3 size={32} />,
    title: "Predictive Intelligence",
    desc: "XGBoost and Prophet engines working in parallel to surface future 12-month revenue curves.",
    color: "var(--violet)"
  },
  {
    icon: <Search size={32} />,
    title: "SHAP Explainability",
    desc: "Don't just see the 'what'. See the 'why' behind every SKU and regional sales anomaly.",
    color: "var(--mint)"
  },
  {
    icon: <ShieldCheck size={32} />,
    title: "Zero-Knowledge Privacy",
    desc: "Enterprise-grade encryption means your data stays in RAM. We never store raw CSVs.",
    color: "var(--indigo)"
  }
];

const Auth = () => {
  const { login, register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [suFirst, setSuFirst] = useState('');
  const [suLast, setSuLast] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPw, setSuPw] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setSuccess(false);
    setErrors({});
    if (!location.state?.from) {
      clearError();
    }
  }, [location.pathname, location.state, clearError]);

  const toggleView = (view) => {
    navigate(view === 'login' ? '/login' : '/signup');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(loginEmail, loginPw);
    if (success) navigate('/projects');
    setIsSubmitting(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fullName = `${suFirst} ${suLast}`;
    const ok = await register(suEmail, suPw, fullName);
    if (ok) {
      setSuccess(true);
      setSuEmail(''); // Clear fields
      setSuPw('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="auth-container">
      {/* Mesh Background */}
      <div className="mesh"></div>
      
      {/* Left Side: Forms */}
      <div className="auth-form-side">
        <div className="auth-form-inner">
          {/* Top Bar / Brand */}
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
            <div className="auth-header">
               <h1 className="syne font-black text-2xl text-white">
                 {isLogin ? "Welcome Back" : "Create Account"}
               </h1>
               <p className="text-sm text-gray-500 mt-2">
                 {isLogin ? "Enter your credentials to access your intelligence dashboard." : "Join 2,400+ teams automating their sales analytics."}
               </p>
            </div>

            {/* Sliding Tab Controller */}
            <div className="auth-tabs-slider">
               <div className={`tab-pill ${isLogin ? 'active' : ''}`} onClick={() => toggleView('login')}>Sign In</div>
               <div className={`tab-pill ${!isLogin ? 'active' : ''}`} onClick={() => toggleView('signup')}>Sign Up</div>
               <div className="tab-indicator" style={{ left: isLogin ? '4px' : 'calc(50% + 2px)' }}></div>
            </div>

            <AnimatePresence>
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                      <Lock size={16} />
                    </div>
                    <div>
                       <div className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-0.5">Authentication Failure</div>
                       <div className="text-[12px] font-bold text-orange-100">{authError}</div>
                    </div>
                    <button onClick={clearError} className="ml-auto text-orange-500 hover:text-orange-300 p-1">
                       <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLogin}
                >
                  <div className="form-group">
                    <label className="auth-label">Email Address</label>
                    <input className="auth-input" type="email" placeholder="you@company.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <div className="flex justify-between items-center mb-1">
                      <label className="auth-label">Password</label>
                      <Link to="/forgot" className="text-[10px] text-violet-400 font-bold hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative group/pass">
                      <input 
                        className="auth-input pr-10" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={loginPw} 
                        onChange={e => setLoginPw(e.target.value)} 
                        required 
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className={`btn-submit ${isSubmitting ? 'loading' : ''}`}>
                    {isSubmitting ? "Authenticating..." : "Sign In →"}
                  </button>
                </motion.form>
              ) : success ? (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="auth-success-state"
                  style={{ textAlign: 'center', padding: '40px 0' }}
                >
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-mint/20 text-mint rounded-full flex items-center justify-center">
                      <CheckCircle2 size={32} />
                    </div>
                  </div>
                  <h2 className="syne font-black text-xl text-white mb-2">Registration Complete!</h2>
                  <p className="text-gray-400 text-sm mb-6">Your account is ready. Please sign in with your email and password to access the dashboard.</p>
                  <button 
                    onClick={() => {
                      setSuccess(false);
                      setIsLogin(true);
                    }} 
                    className="btn-submit"
                    style={{ background: 'var(--mint)', color: '#000' }}
                  >
                    Proceed to Sign In →
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="signup-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSignup}
                >
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="form-group mb-0">
                      <label className="auth-label">First Name</label>
                      <input className="auth-input" type="text" placeholder="John" value={suFirst} onChange={e => setSuFirst(e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label className="auth-label">Last Name</label>
                      <input className="auth-input" type="text" placeholder="Doe" value={suLast} onChange={e => setSuLast(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="auth-label">Work Email</label>
                    <input className="auth-input" type="email" placeholder="john@company.com" value={suEmail} onChange={e => setSuEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="auth-label">Password</label>
                    <div className="relative group/pass">
                      <input 
                        className="auth-input pr-10" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Min 8 characters" 
                        value={suPw} 
                        onChange={e => setSuPw(e.target.value)} 
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className={`btn-submit ${isSubmitting ? 'loading' : ''}`}>
                    {isSubmitting ? "Creating Account..." : "Create Free Account →"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="auth-footer-links">
               <p className="text-[11px] text-gray-500">
                  By continuing, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
               </p>
            </div>
          </div>

          {/* Bottom Footer for Auth */}
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

      {/* Right Side: Feature Slider */}
      <div className="auth-slider-side">
        <div className="slider-overlay"></div>
        <div className="slider-content">
           <AnimatePresence mode="wait">
             <motion.div 
               key={activeSlide}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.5 }}
               className="slide-item"
             >
                <div className="slide-icon" style={{ color: SLIDES[activeSlide].color }}>
                   {SLIDES[activeSlide].icon}
                </div>
                <h2 className="syne slide-title">{SLIDES[activeSlide].title}</h2>
                <p className="slide-desc">{SLIDES[activeSlide].desc}</p>
             </motion.div>
           </AnimatePresence>

           <div className="slider-nav">
             {SLIDES.map((_, i) => (
               <div 
                 key={i} 
                 className={`slider-dot ${i === activeSlide ? 'active' : ''}`}
                 onClick={() => setActiveSlide(i)}
               ></div>
             ))}
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
              <div className="badge-text">Join 2,400+ teams trust AnalytixAI</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
