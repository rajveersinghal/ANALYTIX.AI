import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── ICONS (lucide-react replacements) ───────────────────────────────────────
// Using inline SVG icons to avoid import issues in standalone file
const Icon = ({ d, size = 20, color = "currentColor", strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  Rocket: ["M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z", "m3.5 5.5 5 5m5.5-7.5 1 5-8 8-5-1z", "M14.5 6.5l3 3"],
  Play: ["M5 3l14 9-14 9V3z"],
  TrendingUp: ["M22 7l-8.5 8.5-5-5L2 17", "M16 7h6v6"],
  ShieldCheck: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "m9 12 2 2 4-4"],
  Lock: ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  Search: ["M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0"],
  Activity: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  Zap: ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  MessageSquare: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  Check: ["M20 6 9 17l-5-5"],
  ArrowRight: ["M5 12h14", "m12 5 7 7-7 7"],
  Timer: ["M10 2h4", "M12 14l4-4", "M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16"],
  UserX: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M17 11l4 4m0-4-4 4", "M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  BarChart3: ["M3 3v18h18", "M18 17V9", "M13 17V5", "M8 17v-3"],
  Clock: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20", "M12 6v6l4 2"],
  Package: ["M16.5 9.4 7.55 4.24", "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", "M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"],
  Sparkles: ["M12 3l1.09 3.26L16.5 7l-3.41.74L12 11l-1.09-3.26L7.5 7l3.41-.74L12 3z", "M5 12l.55 1.64L7 14.5l-1.45.36L5 16.5l-.55-1.64L3 14.5l1.45-.36L5 12z", "M19 12l.55 1.64L21 14.5l-1.45.36L19 16.5l-.55-1.64L17 14.5l1.45-.36L19 12z"],
  Lightbulb: ["M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5", "M9 18h6", "M10 22h4"],
  MessageCircle: ["M7.9 20A9 9 0 1 0 4 16.1L2 22z"],
  Cpu: ["M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0", "M3 9h3", "M3 15h3", "M18 9h3", "M18 15h3", "M9 3v3", "M15 3v3", "M9 18v3", "M15 18v3", "M7 7h10v10H7z"],
  Database: ["M12 2C8.13 2 5 3.34 5 5v14c0 1.66 3.13 3 7 3s7-1.34 7-3V5c0-1.66-3.13-3-7-3z", "M5 5c0 1.66 3.13 3 7 3s7-1.34 7-3", "M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3"],
  ShieldAlert: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M12 8v4", "M12 16h.01"],
  Star: ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  ChevronDown: ["m6 9 6 6 6-6"],
  X: ["M18 6 6 18", "m6 6 12 12"],
  Menu: ["M4 12h16", "M4 6h16", "M4 18h16"],
};

const LucideIcon = ({ name, size = 20, color = "currentColor", strokeWidth = 1.75, className = "" }) => {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Figtree:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  :root {
    --bg-void: #04050f;
    --bg-deep: #080a18;
    --bg-surface: #0d0f22;
    --bg-glass: rgba(255,255,255,0.028);
    --bg-glass-h: rgba(255,255,255,0.055);
    --bdr: rgba(255,255,255,0.07);
    --bdr-glow: rgba(109,78,255,0.38);
    --violet: #8169ff;
    --indigo: #498ffb;
    --mint: #00e5b0;
    --amber: #f5a623;
    --rose: #f43f5e;
    --t1: #eeeeff;
    --t2: #8385a0;
    --t3: #40425a;
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg-void);
    color: var(--t1);
    font-family: 'Figtree', sans-serif;
    overflow-x: hidden;
    overflow-y: auto !important;
  }

  .syne { font-family: 'Syne', sans-serif; }

  /* Scroll Progress */
  .scroll-progress {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #8169ff 0%, #498ffb 50%, #00e5b0 100%);
    z-index: 9999;
    transform-origin: 0%;
  }

  /* Gradient text */
  .grad-text {
    background: linear-gradient(135deg, #c4b5fd 0%, #8169ff 45%, #00e5b0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .grad-text-warm {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Marquee */
  .marquee-track {
    display: flex;
    gap: 2rem;
    width: max-content;
    animation: marquee 35s linear infinite;
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .marquee-mask {
    mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
  }

  /* Glowing CTA */
  .cta-glow {
    position: relative;
    background: linear-gradient(135deg, #8169ff, #6046e6);
    box-shadow: 0 0 0 0 rgba(129,105,255,0.4);
    transition: box-shadow 0.3s ease, transform 0.2s ease;
  }
  .cta-glow:hover {
    box-shadow: 0 0 30px 8px rgba(129,105,255,0.35), 0 20px 40px rgba(129,105,255,0.25);
    transform: translateY(-3px) scale(1.02);
  }
  .cta-glow:active { transform: translateY(0) scale(0.98); }

  .cta-outline {
    position: relative;
    border: 1.5px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
  }
  .cta-outline:hover {
    border-color: rgba(129,105,255,0.5);
    background: rgba(129,105,255,0.06);
    transform: translateY(-3px);
  }

  /* Card 3D tilt */
  .card-3d {
    transform-style: preserve-3d;
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease;
  }
  .card-3d:hover {
    box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(129,105,255,0.08);
  }

  /* Noise texture overlay */
  .noise::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.4;
    border-radius: inherit;
  }

  /* Typing cursor */
  .typing-cursor::after {
    content: '|';
    animation: blink 0.8s step-end infinite;
    color: #00e5b0;
    margin-left: 2px;
  }
  @keyframes blink {
    50% { opacity: 0; }
  }

  /* Glow pulse ring */
  @keyframes glow-ring {
    0% { box-shadow: 0 0 0 0 rgba(129,105,255,0.4); }
    70% { box-shadow: 0 0 0 10px rgba(129,105,255,0); }
    100% { box-shadow: 0 0 0 0 rgba(129,105,255,0); }
  }
  .glow-pulse { animation: glow-ring 2s ease-out infinite; }

  /* Section divider */
  .section-glow {
    background: radial-gradient(ellipse 60% 1px at 50% 50%, rgba(129,105,255,0.25) 0%, transparent 100%);
    height: 1px;
    width: 100%;
  }

  /* Floating blobs */
  @keyframes float1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.05); }
    66% { transform: translate(-20px, 15px) scale(0.97); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, 25px) scale(1.08); }
    66% { transform: translate(25px, -15px) scale(0.95); }
  }
  .blob1 { animation: float1 18s ease-in-out infinite; }
  .blob2 { animation: float2 22s ease-in-out infinite; }

  /* Grid lines bg */
  .grid-bg {
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  /* Shimmer effect */
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .shimmer-text {
    background: linear-gradient(90deg, #8385a0 0%, #eeeeff 50%, #8385a0 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #04050f; }
  ::-webkit-scrollbar-thumb { background: #8169ff40; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #8169ff80; }

  /* Selection */
  ::selection { background: rgba(129,105,255,0.3); color: #fff; }
`;

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }
  })
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { delay, duration: 0.5 }
  })
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } }
};

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.12 }}
    custom={delay}
    variants={fadeUp}
    className={className}
  >
    {children}
  </motion.div>
);

const CountUp = ({ target, duration = 2, dec = 0, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    if (nodeRef.current) ob.observe(nodeRef.current);
    return () => ob.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let t = null;
    const step = (ts) => {
      if (!t) t = ts;
      const progress = Math.min((ts - t) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(ease * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return <span ref={nodeRef}>{prefix}{count.toFixed(dec)}{suffix}</span>;
};

// Typing effect hook
const useTypingEffect = (texts, speed = 60, pause = 1800) => {
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [display, setDisplay] = useState("");

  useEffect(() => {
    const current = texts[textIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => {
        setDisplay(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      }, speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx(i => (i + 1) % texts.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  return display;
};

// 3D Tilt Card
const TiltCard = ({ children, className = "", intensity = 8 }) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * intensity, y: -x * intensity });
  };

  return (
    <div
      ref={ref}
      className={`card-3d ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); }}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovered ? 'translateY(-6px)' : ''}`,
      }}
    >
      {children}
    </div>
  );
};

// Glowing orb bg element
const GlowOrb = ({ color, size, top, left, right, bottom, blur = 120, opacity = 0.12, className = "" }) => (
  <div
    className={`pointer-events-none absolute rounded-full ${className}`}
    style={{
      width: size, height: size,
      top, left, right, bottom,
      background: color,
      filter: `blur(${blur}px)`,
      opacity,
    }}
  />
);

// Section Label
const SectionLabel = ({ children, color = "#8169ff" }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color }}>{children}</span>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [navDark, setNavDark] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [mousePos, setMousePos] = useState({ x: -400, y: -400 });
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [appLoaded, setAppLoaded] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const prevScrollY = useRef(0);

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const typedText = useTypingEffect([
    "why revenue dropped in Mumbai",
    "which SKUs are bleeding margin",
    "your Q4 demand with 94% accuracy",
    "where inventory is silently piling up",
  ], 55, 2200);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    let rafId = null;
    const handleMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
        rafId = null;
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => { window.removeEventListener("mousemove", handleMove); if (rafId) cancelAnimationFrame(rafId); };
  }, []);

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      setNavDark(y > 60);
      setNavVisible(!(y > prevScrollY.current && y > 120));
      prevScrollY.current = y;
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  useEffect(() => {
    const ids = ["features", "pipeline", "pricing"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAppLoaded(true), 900);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id) => {
    if (id === "top") return window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  if (loading) return null;

  const navLinks = [
    { label: "Intelligence", id: "features" },
    { label: "How It Works", id: "pipeline" },
    { label: "Pricing", id: "pricing" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#04050f", color: "#eeeeff" }}>
      <style>{styles}</style>

      {/* ─── INTRO LOADER ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {!appLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            style={{
              position: "fixed", inset: 0, background: "#04050f",
              zIndex: 99999, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 20,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #8169ff, #6046e6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(129,105,255,0.5)" }}>
                <LucideIcon name="Activity" size={16} color="white" strokeWidth={2} />
              </div>
              <span className="syne" style={{ fontSize: 22, fontWeight: 900, color: "#eeeeff", letterSpacing: "-0.02em" }}>AnalytixAI</span>
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeInOut" }}
              style={{ height: 2, background: "linear-gradient(90deg, #8169ff, #00e5b0)", borderRadius: 2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Progress */}
      <motion.div className="scroll-progress" style={{ scaleX }} />

      {/* Cursor Glow */}
      <div
        className="fixed rounded-full pointer-events-none z-0"
        style={{
          width: 480, height: 480,
          left: mousePos.x - 240, top: mousePos.y - 240,
          background: "radial-gradient(circle, rgba(129,105,255,0.08) 0%, transparent 70%)",
          transition: "left 0.15s linear, top 0.15s linear",
        }}
      />

      {/* Fixed Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob1 absolute" style={{ top: "-15%", left: "-10%", width: 700, height: 700, background: "radial-gradient(circle, rgba(129,105,255,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div className="blob2 absolute" style={{ bottom: "-20%", right: "-5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(0,229,176,0.07) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div className="absolute" style={{ top: "40%", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, background: "radial-gradient(circle, rgba(73,143,251,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      {/* ─── NAV ─────────────────────────────────────────────────────────── */}
      <motion.nav
        style={{
          position: "fixed", top: 24, left: "4%", right: "4%",
          height: 72, zIndex: 100,
          borderRadius: 24,
          border: navDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
          background: navDark ? "rgba(8,10,24,0.92)" : "rgba(8,10,24,0.65)",
          backdropFilter: "blur(40px)",
          boxShadow: navDark ? "0 30px 60px rgba(0,0,0,0.6)" : "none",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px",
          transform: navVisible ? "translateY(0)" : "translateY(-120%)",
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s, border 0.3s",
        }}
      >
        {/* Left: Logo */}
        <div 
          onClick={() => scrollTo("top")}
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, #8169ff, #6046e6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(129,105,255,0.45)" }}>
            <LucideIcon name="Activity" size={18} color="white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col sm:flex"> {/* Keep it simple for now */}
            <span className="syne" style={{ fontSize: 19, fontWeight: 900, color: "white", letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1 }}>Analytix<span style={{ color: "#8169ff" }}>AI</span></span>
            <span className="hidden sm:block" style={{ fontSize: '8px', fontWeight: 900, color: '#8169ff', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '2px' }}>Open Beta 1.0</span>
          </div>
        </div>

        {/* Center: Desktop Links (Absolutely Centered) - Hidden on mobile */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 28 }} className="hidden lg:flex">
          {navLinks.map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: "none", border: "none", cursor: "pointer", color: activeSection === id ? "#ffffff" : "#8385a0", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => { if (activeSection !== id) e.target.style.color = "#8385a0"; }}>
              {label}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, md: { gap: 20 } }}>
          <button 
            className="hidden sm:block"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8385a0", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = "#8385a0"}
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cta-glow px-4 py-2 sm:px-6 sm:py-3"
            style={{ borderRadius: 14, border: "none", color: "white", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer" }}
            onClick={handleStart}
          >
            Get Started
          </motion.button>
          
          <button className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10" onClick={() => setMobileMenu(m => !m)} style={{ cursor: "pointer" }}>
            <LucideIcon name={mobileMenu ? "X" : "Menu"} size={20} color="#eeeeff" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "fixed", top: 90, left: "4%", right: "4%", zIndex: 90,
              background: "rgba(8,10,24,0.97)", backdropFilter: "blur(32px)",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)",
              padding: "20px 28px",
            }}
          >
            {navLinks.map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "#8385a0", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", padding: "12px 0" }}>
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10" style={{ paddingTop: 160, paddingBottom: 80, textAlign: "center" }}>

        {/* Grid background */}
        <div className="grid-bg absolute inset-0 opacity-40" />

        {/* Live Badge */}
        <FadeUp>
          <div className="inline-flex items-center gap-2.5 rounded-full mb-12" style={{ padding: "8px 16px", border: "1px solid rgba(0,229,176,0.2)", background: "rgba(0,229,176,0.05)", backdropFilter: "blur(12px)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-pulse" />
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(0,229,176,0.8)" }}>Autonomous Sales Intelligence · Live</span>
          </div>
        </FadeUp>

        {/* Headlines */}
        <div style={{ marginBottom: 32, padding: "0 16px" }}>
          <FadeUp delay={0.05}>
            <h1 className="syne" style={{ fontSize: "clamp(38px, 7vw, 80px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, color: "#eeeeff", marginBottom: 6 }}>
              Stop Guessing.
            </h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="syne grad-text" style={{ fontSize: "clamp(38px, 7vw, 80px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 18, fontStyle: "italic" }}>
              Start Deciding.
            </h1>
          </FadeUp>
          <FadeUp delay={0.17}>
            <h2 className="syne" style={{ fontSize: "clamp(18px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: "rgba(238,238,255,0.55)", marginBottom: 4 }}>
              Your data already has the answers.
            </h2>
          </FadeUp>
          <FadeUp delay={0.22}>
            <h2 className="syne" style={{ fontSize: "clamp(18px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: "rgba(238,238,255,0.28)" }}>
              AnalytixAI helps you ask the right questions.
            </h2>
          </FadeUp>
        </div>


        {/* Trust Strip */}
        <FadeUp delay={0.3}>
          <div style={{ marginBottom: 48, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
            {[
              { icon: "TrendingUp", label: "+18% Revenue Lift", color: "#00e5b0" },
              { icon: "Timer", label: "Insights in 90s", color: "#8169ff" },
              { icon: "ShieldCheck", label: "Zero Data Storage", color: "#498ffb" },
              { icon: "Zap", label: "94.2% Accuracy", color: "#f5a623" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className="flex items-center gap-2"
                style={{ padding: "8px 16px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)", backdropFilter: "blur(12px)" }}
              >
                <LucideIcon name={item.icon} size={14} color={item.color} strokeWidth={2} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(238,238,255,0.7)", letterSpacing: "0.02em" }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
        </FadeUp>

        {/* CTAs */}
        <FadeUp delay={0.38}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginBottom: 80 }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="cta-glow"
              style={{ color: "white", padding: "18px 44px", borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: "pointer", border: "none", display: "flex", alignItems: "center", gap: 10, letterSpacing: "0.01em" }}
              onClick={handleStart}
            >
              <LucideIcon name="Rocket" size={18} color="white" strokeWidth={2} />
              Analyse My First Dataset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="cta-outline"
              onClick={() => scrollTo("pipeline")}
              style={{ color: "#eeeeff", padding: "18px 36px", borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LucideIcon name="Play" size={14} color="white" strokeWidth={2} />
              </div>
              See It In Action
            </motion.button>
          </div>
        </FadeUp>

        {/* Social Proof */}
        <FadeUp delay={0.45}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {["RK", "PM", "SV", "AN", "+"].map((name, i) => (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: "50%",
                  marginLeft: i === 0 ? 0 : -8,
                  border: "2px solid #04050f",
                  background: ["#8169ff", "#498ffb", "#f5a623", "#00e5b0", "linear-gradient(135deg, #f43f5e, #f5a623)"][i],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontWeight: 900, color: "white", zIndex: 5 - i,
                }}>
                  {name}
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: "#f5a623", fontSize: 10, marginBottom: 1, letterSpacing: 2 }}>★★★★★</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8385a0" }}><strong style={{ color: "#eeeeff" }}>2,400+</strong> founders trust AnalytixAI</div>
            </div>
          </div>
        </FadeUp>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 56, cursor: "pointer", opacity: 0.45 }}
          onClick={() => scrollTo("features")}
        >
          <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.3em", color: "#8385a0" }}>Scroll</span>
          <LucideIcon name="ChevronDown" size={16} color="#8385a0" strokeWidth={2} />
        </motion.div>
      </section>

      {/* ─── PRODUCT PREVIEW ──────────────────────────────────────────────── */}
      <section className="relative z-10" style={{ padding: "0 24px 80px" }}>
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative" }}>
            {/* Glow behind card */}
            <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(129,105,255,0.1), transparent)", pointerEvents: "none", borderRadius: "50%" }} />

            <div style={{ position: "relative", borderRadius: 40, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(8,10,24,0.9)", backdropFilter: "blur(40px)", overflow: "hidden", boxShadow: "0 60px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)", padding: 4 }}>
              {/* Top bar */}
              <div style={{ borderRadius: 38, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(13,15,34,0.6)", padding: "32px 40px 40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["#f43f5e30", "#f5a62330", "#00e5b030"].map((c, i) => (
                      <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c, border: `1px solid ${["rgba(244,63,94,0.5)", "rgba(245,166,35,0.5)", "rgba(0,229,176,0.5)"][i]}` }} />
                    ))}
                  </div>
                  <div style={{ padding: "6px 18px", borderRadius: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 9, fontWeight: 900, color: "#8385a0", letterSpacing: "0.35em", textTransform: "uppercase" }}>
                    Intelligence Terminal v2
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 100, background: "rgba(0,229,176,0.08)", border: "1px solid rgba(0,229,176,0.2)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e5b0", boxShadow: "0 0 6px #00e5b0" }} className="glow-pulse" />
                    <span style={{ fontSize: 9, fontWeight: 900, color: "#00e5b0", letterSpacing: "0.25em", textTransform: "uppercase" }}>Live</span>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
                  {/* Left: Narrative */}
                  <div className="w-full lg:w-1/2">
                    <div style={{ fontSize: 10, fontWeight: 900, color: "#8169ff", textTransform: "uppercase", letterSpacing: "0.4em", marginBottom: 16 }}>Narrative Engine</div>
                    <h3 className="syne" style={{ fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 900, color: "white", lineHeight: 1.15, letterSpacing: "-0.02em", fontStyle: "italic", marginBottom: 28 }}>
                      "Your Mumbai revenue drop<br />traces back to 3 SKUs<br />in the ₹500–₹1.2k band."
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                      {[
                        { val: "+22%", label: "Opp. Lift", color: "#00e5b0", bg: "rgba(0,229,176,0.06)", border: "rgba(0,229,176,0.12)" },
                        { val: "98.4%", label: "Confidence", color: "#8169ff", bg: "rgba(129,105,255,0.06)", border: "rgba(129,105,255,0.12)" },
                        { val: "₹18.4L", label: "Q4 Forecast", color: "#f5a623", bg: "rgba(245,166,35,0.06)", border: "rgba(245,166,35,0.12)" },
                        { val: "0.91", label: "F1 Score", color: "#498ffb", bg: "rgba(73,143,251,0.06)", border: "rgba(73,143,251,0.12)" },
                      ].map((m, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.04 }}
                          style={{ padding: "16px", borderRadius: 20, background: m.bg, border: `1px solid ${m.border}`, cursor: "default" }}
                        >
                          <div className="syne" style={{ fontSize: 24, fontWeight: 900, color: m.color, fontStyle: "italic", marginBottom: 4 }}>{m.val}</div>
                          <div style={{ fontSize: 9, fontWeight: 900, color: "#8385a0", textTransform: "uppercase", letterSpacing: "0.25em" }}>{m.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Neural Nodes */}
                  <div style={{ padding: 32, borderRadius: 32, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: "#40425a", textTransform: "uppercase", letterSpacing: "0.35em", marginBottom: 24 }}>Model Processing</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {[
                        { label: "Feature Importance", val: "94%", g: "from-violet-500 to-indigo-500" },
                        { label: "SHAP Analysis", val: "87%", g: "from-cyan-500 to-emerald-500" },
                        { label: "Forecast Accuracy", val: "91%", g: "from-violet-500 to-indigo-500" },
                        { label: "Churn Signals", val: "78%", g: "from-amber-500 to-orange-500" },
                        { label: "Revenue Drivers", val: "96%", g: "from-cyan-500 to-emerald-500" },
                      ].map((node, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#8385a0" }}>{node.label}</span>
                            <span style={{ fontSize: 10, fontWeight: 900, color: "#00e5b0" }}>{node.val}</span>
                          </div>
                          <div style={{ height: 4, borderRadius: 100, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: node.val }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.4, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                              style={{
                                height: "100%",
                                background: i % 2 === 0 ? "linear-gradient(90deg, #8169ff, #498ffb)" : i % 3 === 1 ? "linear-gradient(90deg, #00e5b0, #498ffb)" : "linear-gradient(90deg, #f5a623, #f97316)",
                                borderRadius: 100,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section blur divider */}
      <div style={{ height: 100, background: "linear-gradient(to bottom, transparent, rgba(8,10,24,0.6), transparent)", pointerEvents: "none" }} />
      <div style={{ height: 80, background: "linear-gradient(to bottom, transparent, rgba(8,10,24,0.7), transparent)", pointerEvents: "none" }} />
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: "60px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(8,10,24,0.4)" }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: 48 }}>
          {[
            { icon: "Activity", value: "11-Step", label: "Autonomous Pipeline", color: "#8169ff" },
            { icon: "Zap", value: "94.2%", label: "Prediction Confidence", color: "#00e5b0" },
            { icon: "Timer", value: "<90s", label: "Raw Data to Insight", color: "#498ffb" },
            { icon: "ShieldCheck", value: "0 KB", label: "Your Data Ever Stored", color: "#f5a623" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              style={{ textAlign: "center" }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}12`, border: `1px solid ${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <LucideIcon name={s.icon} size={22} color={s.color} strokeWidth={1.75} />
              </div>
              <div className="syne" style={{ fontSize: 36, fontWeight: 900, marginBottom: 4, fontStyle: "italic", color: "#c4b5fd", textShadow: "0 0 24px rgba(129,105,255,0.18)", willChange: "auto" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#40425a", textTransform: "uppercase", letterSpacing: "0.28em" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>
      <div style={{ height: 80, background: "linear-gradient(to bottom, rgba(8,10,24,0.7), transparent)", pointerEvents: "none" }} />

      {/* ─── INTEGRATIONS MARQUEE ─────────────────────────────────────────── */}
      <section style={{ padding: "48px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <p style={{ textAlign: "center", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.45em", color: "#40425a", marginBottom: 28 }}>Connects with your entire stack</p>
        <div className="marquee-mask" style={{ overflow: "hidden" }}>
          <div className="marquee-track">
            {[
              { icon: "Database", label: "Shopify" },
              { icon: "Database", label: "WooCommerce" },
              { icon: "BarChart3", label: "Excel / CSV" },
              { icon: "Lock", label: "Razorpay" },
              { icon: "Cpu", label: "POS Systems" },
              { icon: "Package", label: "Amazon" },
              { icon: "Activity", label: "Flipkart" },
              { icon: "BarChart3", label: "Google Sheets" },
              { icon: "Database", label: "MySQL" },
              { icon: "Database", label: "Shopify" },
              { icon: "Database", label: "WooCommerce" },
              { icon: "BarChart3", label: "Excel / CSV" },
              { icon: "Lock", label: "Razorpay" },
              { icon: "Cpu", label: "POS Systems" },
              { icon: "Package", label: "Amazon" },
              { icon: "Activity", label: "Flipkart" },
              { icon: "BarChart3", label: "Google Sheets" },
              { icon: "Database", label: "MySQL" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 100, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", flexShrink: 0, transition: "all 0.2s" }}>
                <LucideIcon name={item.icon} size={13} color="#8385a0" strokeWidth={1.75} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#8385a0", whiteSpace: "nowrap" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────────── */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <FadeUp>

          <h2 className="syne" style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            What you'd normally pay<br />
            <span style={{ color: "#40425a" }}>₹50,000/month for.</span>
          </h2>
          <p style={{ fontSize: 15, color: "#8385a0", maxWidth: 560, lineHeight: 1.7, marginBottom: 56 }}>
            AnalytixAI replaces a team of analysts with an autonomous engine that explains what happened, why it happened, and what to do next — without a single meeting.
          </p>
        </FadeUp>

        {/* "Before" cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 60 }}>
          {[
            { icon: "UserX", title: "Hiring Analysts", desc: "Expensive. Slow. Gone in 3 months. And you still can't get answers on Sunday." },
            { icon: "BarChart3", title: "Manual Dashboards", desc: "Beautiful slides that age poorly. Static numbers that explain nothing about why." },
            { icon: "Clock", title: "Delayed Decisions", desc: "By the time the report lands, the window is shut. Your competitor already moved." },
          ].map((f, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <TiltCard className="h-full">
                <div style={{ padding: 28, borderRadius: 22, background: "rgba(244,63,94,0.04)", border: "1px solid rgba(244,63,94,0.1)", height: "100%", cursor: "default" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(244,63,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <LucideIcon name={f.icon} size={18} color="#f43f5e" strokeWidth={1.75} />
                  </div>
                  <h3 className="syne" style={{ fontSize: 14, fontWeight: 700, color: "#eeeeff", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 12, color: "#8385a0", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </TiltCard>
            </FadeUp>
          ))}
        </div>

        {/* Divider */}
        <FadeUp>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 56 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
            <div style={{ padding: "8px 20px", borderRadius: 100, background: "rgba(129,105,255,0.08)", border: "1px solid rgba(129,105,255,0.2)", fontSize: 11, fontWeight: 900, color: "#8169ff", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Instead, AnalytixAI gives you →
            </div>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          </div>
        </FadeUp>

        {/* "After" feature grid */}
        {(() => {
          const features = [
            { icon: "Search", title: "Know WHY metrics changed", desc: "SHAP explainability pinpoints the exact products, regions, and time windows where revenue leaks.", color: "#8169ff" },
            { icon: "Package", title: "Kill dead inventory early", desc: "Predictive signals surface slow-moving stock 30 days out — before it locks up capital.", color: "#f5a623" },
            { icon: "Sparkles", title: "See what's coming next", desc: "XGBoost models trained on your own curves deliver personalised forecast precision at 94.2%.", color: "#00e5b0" },
            { icon: "Lightbulb", title: "Get a decision, not a chart", desc: "Gemini translates raw model outputs into plain-English action narratives your team acts on today.", color: "#498ffb" },
            { icon: "Cpu", title: "Auto-select the best model", desc: "Six algorithms compete. The winner is promoted automatically based on F1 score and accuracy.", color: "#f43f5e" },
            { icon: "MessageCircle", title: "Ask any question, anytime", desc: "Session-aware AI widget. Ask 'Why did Q2 underperform?' and get a sourced, data-backed answer.", color: "#14b8a6" },
          ];
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16 }}>
              {features.map((f, i) => (
                <FadeUp key={i} delay={i * 0.05}>
                  <TiltCard className="h-full">
                    <div
                      style={{
                        padding: 28, borderRadius: 22,
                        background: "rgba(255,255,255,0.015)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        height: "100%", cursor: "default",
                        transition: "border-color 0.3s, opacity 0.25s",
                        opacity: hoveredFeature === null || hoveredFeature === i ? 1 : 0.35,
                      }}
                      onMouseEnter={() => { setHoveredFeature(i); }}
                      onMouseLeave={() => { setHoveredFeature(null); }}
                      ref={el => { if (el && hoveredFeature === i) el.style.borderColor = `${f.color}40`; else if (el) el.style.borderColor = "rgba(255,255,255,0.05)"; }}
                    >
                      <motion.div
                        whileHover={{ rotate: 8, scale: 1.15 }}
                        style={{ width: 40, height: 40, borderRadius: 12, background: `${f.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}
                      >
                        <LucideIcon name={f.icon} size={18} color={f.color} strokeWidth={1.75} />
                      </motion.div>
                      <h3 className="syne" style={{ fontSize: 14, fontWeight: 700, color: "#eeeeff", marginBottom: 8 }}>{f.title}</h3>
                      <p style={{ fontSize: 13, color: "#8385a0", lineHeight: 1.65 }}>{f.desc}</p>
                    </div>
                  </TiltCard>
                </FadeUp>
              ))}
            </div>
          );
        })()}
      </motion.section>

      {/* Section blur divider */}
      <div style={{ height: 100, background: "linear-gradient(to bottom, transparent, rgba(129,105,255,0.03), transparent)", pointerEvents: "none" }} />

      {/* ─── PIPELINE ─────────────────────────────────────────────────────── */}
      <motion.section
        id="pipeline"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: "80px 24px 100px", background: "linear-gradient(180deg, transparent, rgba(129,105,255,0.03), transparent)" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }} className="flex flex-col lg:grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">

          {/* Left: Steps */}
          <div>
            <FadeUp>

              <h2 className="syne" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
                11 steps.<br />Zero setup.
              </h2>
              <p style={{ fontSize: 14, color: "#8385a0", marginBottom: 48, lineHeight: 1.7 }}>
                Drop a CSV. The pipeline runs end-to-end in under 90 seconds — no configuration, no data science degree required.
              </p>
            </FadeUp>

            <div style={{ position: "relative" }}>
              {[
                { n: "01", title: "Ingestion & Parsing", desc: "Memory-safe streaming load. Any format, any size." },
                { n: "02", title: "Metadata Extraction", desc: "Sparsity scoring and distribution fingerprinting." },
                { n: "03", title: "Target Inference", desc: "Auto-detects your prediction goal — no labelling needed." },
                { n: "05", title: "Feature Engineering", desc: "Scaling, interactions, and temporal variables automated." },
                { n: "09", title: "SHAP Explainability", desc: "Every prediction is explained with driver attribution." },
                { n: "11", title: "Intelligence Ready", desc: "Dashboard syncs. AI session opens. You ask questions." },
              ].map((s, i) => (
                <FadeUp key={i} delay={i * 0.05}>
                  <div style={{ display: "flex", gap: 16, paddingBottom: 24, position: "relative" }}>
                    {i < 5 && (
                      <div style={{ position: "absolute", left: 14, top: 32, bottom: 0, width: 1, background: "linear-gradient(to bottom, rgba(129,105,255,0.4), transparent)" }} />
                    )}
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0d0f22", border: "1px solid rgba(129,105,255,0.4)", fontSize: 9, fontWeight: 900, color: "#c4b5fd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                      {s.n}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 3 }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: "#40425a", lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Right: Live Card */}
          <div className="w-full lg:sticky lg:top-[120px]">
            <FadeUp delay={0.3}>
              <div style={{ padding: 32, borderRadius: 28, background: "#0d0f22", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", overflow: "hidden", position: "relative" }}>
                <GlowOrb color="rgba(129,105,255,0.3)" size={200} top={-80} right={-60} blur={80} opacity={0.15} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#eeeeff" }}>Sales_Data_Q3.csv</div>
                  <div style={{ padding: "5px 12px", borderRadius: 100, background: "rgba(0,229,176,0.08)", border: "1px solid rgba(0,229,176,0.25)", fontSize: 9, fontWeight: 900, color: "#00e5b0", textTransform: "uppercase", letterSpacing: "0.25em" }}>
                    ✓ Complete
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, color: "#40425a", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 8 }}>
                    <span>Pipeline Status</span><span>11 / 11</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 100, background: "rgba(0,0,0,0.5)", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 1.8, delay: 0.4 }}
                      style={{ height: "100%", background: "linear-gradient(90deg, #8169ff, #498ffb, #00e5b0)", borderRadius: 100 }} />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 mb-6">
                  {[
                    { v: "94.7%", l: "Accuracy", c: "#00e5b0" },
                    { v: "XGBoost", l: "Best Model", c: "#8169ff" },
                    { v: "₹18.4L", l: "Q4 Forecast", c: "#f5a623" },
                    { v: "0.91", l: "F1 Score", c: "#498ffb" },
                  ].map((m, i) => (
                    <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="syne" style={{ fontSize: 20, fontWeight: 900, color: m.c, fontStyle: "italic", marginBottom: 2 }}>{m.v}</div>
                      <div style={{ fontSize: 9, fontWeight: 900, color: "#40425a", textTransform: "uppercase", letterSpacing: "0.25em" }}>{m.l}</div>
                    </div>
                  ))}
                </div>

                {/* SHAP drivers */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: "#40425a", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 12 }}>
                    <LucideIcon name="Search" size={10} color="#40425a" />
                    Intelligence Drivers
                  </div>
                  {[
                    { n: "Region: South India", w: 84, g: "linear-gradient(90deg, #8169ff, #c4b5fd)" },
                    { n: "SKU Velocity (₹500–1.2k)", w: 67, g: "linear-gradient(90deg, #00e5b0, #498ffb)" },
                  ].map((s, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8385a0", marginBottom: 4 }}>
                        <span>{s.n}</span><span>{s.w}%</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 100, background: "rgba(0,0,0,0.4)", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.w}%` }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.5 + i * 0.2 }}
                          style={{ height: "100%", background: s.g, borderRadius: 100 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Chat */}
                <div style={{ padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, fontWeight: 900, color: "#40425a", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 12 }}>
                    <LucideIcon name="MessageSquare" size={10} color="#40425a" />
                    AI Session
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00e5b0", boxShadow: "0 0 5px #00e5b0", marginLeft: 4 }} className="glow-pulse" />
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(129,105,255,0.1)", border: "1px solid rgba(129,105,255,0.2)", marginBottom: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: "#c4b5fd", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.2em" }}>You</div>
                    <div style={{ fontSize: 12, color: "white" }}>Why did Q2 revenue drop in Mumbai?</div>
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: "#00e5b0", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.2em" }}>AnalytixAI</div>
                    <div style={{ fontSize: 12, color: "#8385a0", lineHeight: 1.6 }}>
                      SHAP analysis shows <strong style={{ color: "white" }}>Region: South</strong> accounts for 84% of the drop, driven by velocity decline in the ₹500–₹1.2k SKU band. Recommend targeted markdown on 3 SKUs.
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </motion.section>

      {/* Section blur divider */}
      <div style={{ height: 100, background: "linear-gradient(to bottom, transparent, rgba(8,10,24,0.5), transparent)", pointerEvents: "none" }} />

      {/* ─── PRIVACY ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 80px" }}>
        <FadeUp>
          <div style={{ maxWidth: 1100, margin: "0 auto" }} className="p-8 md:p-14 rounded-[40px] bg-gradient-to-br from-[#8169ff15] to-[#00e5b008] border border-[#8169ff30] flex flex-col md:flex-row items-center gap-10">
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(0,229,176,0.08)", border: "1px solid rgba(0,229,176,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LucideIcon name="Lock" size={32} color="#00e5b0" strokeWidth={1.5} />
            </motion.div>
            <div style={{ flex: 1 }}>
              <h2 className="syne" style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 8 }}>Zero retention. Always.</h2>
              <p style={{ fontSize: 14, color: "#8385a0", lineHeight: 1.7, maxWidth: 560, marginBottom: 20 }}>
                Your datasets are processed entirely in encrypted memory and purged the moment analysis completes. Nothing is written to disk — ever.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["AES-256 Encrypted", "GDPR Ready", "Zero Logging", "In-Memory Only"].map(tag => (
                  <span key={tag} style={{ padding: "5px 14px", borderRadius: 100, background: "rgba(0,229,176,0.07)", border: "1px solid rgba(0,229,176,0.18)", fontSize: 10, fontWeight: 900, color: "#00e5b0", textTransform: "uppercase", letterSpacing: "0.15em" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      </section>


      <motion.section
        id="pricing"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: "80px 24px 100px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <SectionLabel color="#8169ff" />
              <h2 className="syne" style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>
                Priced for growth.
              </h2>
              <p style={{ fontSize: 14, color: "#8385a0" }}>14-day free trial · No credit card · Cancel anytime.</p>
            </div>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              {
                name: "Free", price: "₹0", period: "", desc: "Start exploring today. No credit card required.",
                features: ["3 Analyses / month", "Real-time KPI dashboard", "PDF Export", "Basic AI Q&A"],
                highlight: false,
              },
              {
                name: "Pro", price: "₹499", period: "/mo", desc: "For teams that need real answers, fast.",
                features: ["Unlimited Analyses", "AI Demand Forecasting", "SHAP Explainability", "Playbook Generation", "Priority Support"],
                highlight: true,
              },
              {
                name: "Enterprise", price: "Custom", period: "", desc: "For organisations with advanced needs.",
                features: ["Multi-seat Access", "White-labelling", "Custom ERP Sync", "Dedicated SLA", "SSO & Audit Logs"],
                highlight: false,
              },
            ].map((p, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <TiltCard className="h-full">
                  <div
                    style={{
                      padding: 32, borderRadius: 26,
                      background: p.highlight ? "linear-gradient(145deg, rgba(129,105,255,0.12), rgba(0,229,176,0.04))" : "rgba(255,255,255,0.018)",
                      border: p.highlight ? "1px solid rgba(129,105,255,0.45)" : "1px solid rgba(255,255,255,0.05)",
                      display: "flex", flexDirection: "column", height: "100%",
                      position: "relative", overflow: "hidden",
                      boxShadow: p.highlight ? "0 0 60px rgba(129,105,255,0.1)" : "none",
                    }}
                  >
                    {p.highlight && (
                      <div style={{ position: "absolute", top: 0, right: 0, padding: "6px 18px", background: "#8169ff", fontSize: 9, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "0.2em", borderBottomLeftRadius: 16, boxShadow: "0 4px 20px rgba(129,105,255,0.5)" }}>
                        Most Popular
                      </div>
                    )}
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: p.highlight ? "#c4b5fd" : "#8385a0", textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 8 }}>{p.name}</div>
                      <div className="syne" style={{ fontSize: 40, fontWeight: 900, color: "#eeeeff", marginBottom: 6, letterSpacing: "-0.02em" }}>
                        {p.price}<span style={{ fontSize: 13, color: "#40425a", fontWeight: 700 }}>{p.period}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "#8385a0", lineHeight: 1.6 }}>{p.desc}</p>
                    </div>

                    <div style={{ flex: 1, marginBottom: 28 }}>
                      {p.features.map(f => (
                        <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(0,229,176,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <LucideIcon name="Check" size={10} color="#00e5b0" strokeWidth={2.5} />
                          </div>
                          <span style={{ fontSize: 13, color: "#8385a0", fontWeight: 500 }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleStart}
                      style={{
                        width: "100%", padding: "14px", borderRadius: 14,
                        background: p.highlight ? "linear-gradient(135deg, #8169ff, #6046e6)" : "rgba(255,255,255,0.05)",
                        border: p.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                        color: p.highlight ? "white" : "#8385a0",
                        fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em",
                        cursor: "pointer",
                        boxShadow: p.highlight ? "0 8px 24px rgba(129,105,255,0.35)" : "none",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { if (!p.highlight) { e.target.style.color = "white"; e.target.style.borderColor = "rgba(129,105,255,0.4)"; } }}
                      onMouseLeave={e => { if (!p.highlight) { e.target.style.color = "#8385a0"; e.target.style.borderColor = "rgba(255,255,255,0.1)"; } }}
                    >
                      Get Started
                    </motion.button>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 100px" }}>
        <FadeUp>
          <div style={{ maxWidth: 1100, margin: "0 auto" }} className="px-8 py-16 md:px-20 md:py-16 rounded-[40px] bg-gradient-to-br from-[#8169ff15] to-[#00e5b008] border border-[#8169ff30] text-center relative overflow-hidden">
            <GlowOrb color="rgba(129,105,255,0.4)" size={350} top={-150} left="50%" blur={120} opacity={0.15} />
            <GlowOrb color="rgba(0,229,176,0.3)" size={250} bottom={-100} right={-80} blur={100} opacity={0.12} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 100, background: "rgba(129,105,255,0.12)", border: "1px solid rgba(129,105,255,0.3)", marginBottom: 32 }}>
                <LucideIcon name="Zap" size={12} color="#8169ff" strokeWidth={2.5} />
                <span style={{ fontSize: 10, fontWeight: 900, color: "#8169ff", textTransform: "uppercase", letterSpacing: "0.28em" }}>Ready in 30 seconds</span>
              </div>

              <h2 className="syne" style={{ fontSize: "clamp(32px, 5.5vw, 68px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 24, color: "white" }}>
                Stop reading reports. Start reading signals.
              </h2>
              <p style={{ fontSize: 17, color: "#8385a0", lineHeight: 1.6, maxWidth: 640, margin: "0 auto 48px" }}>
                Upload your first CSV. The 11-step pipeline takes over. You get answers — not charts — in under 90 seconds.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 28 }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="cta-glow"
                  onClick={handleStart}
                  style={{ color: "white", padding: "18px 48px", borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: "pointer", border: "none", display: "flex", alignItems: "center", gap: 10 }}
                >
                  <LucideIcon name="Rocket" size={18} color="white" strokeWidth={2} />
                  Start Your First Analysis
                </motion.button>
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8169ff", textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 12 }}>
                Built for founders who can't afford to guess.
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#40425a", letterSpacing: "0.05em" }}>
                No setup. No dashboards. Just answers.
              </p>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ padding: "48px 32px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }} className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          {/* Left: Name with Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }} className="justify-center md:justify-start">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #8169ff, #6046e6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LucideIcon name="Activity" size={14} color="white" strokeWidth={2} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: 'Syne' }}>Analytix<span style={{ color: '#8169ff' }}>AI</span></span>
          </div>

          {/* Center: Copyright */}
          <div style={{ flex: 1, textAlign: "center" }}>
             <span style={{ fontSize: 11, fontWeight: 700, color: "#40425a", textTransform: "uppercase", letterSpacing: "0.4em" }}>© Rajveer Singhal❤️</span>
          </div>

          {/* Right: Links */}
          <div style={{ display: "flex", gap: 24, flex: 1, justifyContent: "center" }} className="md:justify-end">
            {["Privacy", "Blog", "Terms"].map(link => (
              <span key={link} style={{ fontSize: 10, fontWeight: 700, color: "#40425a", textTransform: "uppercase", letterSpacing: "0.2em", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#8169ff"}
                onMouseLeave={e => e.target.style.color = "#40425a"}
              >{link}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}