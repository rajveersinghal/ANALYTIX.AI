import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Book, Zap, Database, ShieldCheck, 
  Settings, MessageSquare, TrendingUp, Search, Lock,
  ChevronRight, ArrowRight
} from "lucide-react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Figtree:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  :root {
    --bg-void: #04050f; --bg-deep: #080a18; --bg-surface: #0d0f22;
    --violet: #8169ff; --indigo: #498ffb; --mint: #00e5b0; --amber: #f5a623; --rose: #f43f5e;
    --t1: #eeeeff; --t2: #8385a0; --t3: #40425a;
  }

  body { background: var(--bg-void); color: var(--t1); font-family: 'Figtree', sans-serif; }
  .syne { font-family: 'Syne', sans-serif; }

  .mesh-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }
  .mesh-bg::before {
    content: '';
    position: absolute;
    width: 760px; height: 760px;
    top: -280px; left: -180px;
    background: radial-gradient(circle, rgba(129,105,255,0.1) 0%, transparent 68%);
    animation: drift1 20s ease-in-out infinite alternate;
  }
  .mesh-bg::after {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    bottom: -180px; right: -80px;
    background: radial-gradient(circle, rgba(0,229,176,0.06) 0%, transparent 68%);
    animation: drift2 24s ease-in-out infinite alternate;
  }
  @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(70px,50px) scale(1.12); } }
  @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-50px,-35px) scale(1.08); } }
`;

const Docs = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "intro",
      title: "Getting Started",
      icon: <Book size={18} className="text-[#8169ff]" />,
      desc: "Welcome to AnalytixAI. Learn how to set up your account and create your first workspace in under 60 seconds.",
      content: [
        "1. Create your account on the Login/Signup page.",
        "2. You will be assigned to the 'Free Tier' automatically.",
        "3. Create a 'New Workspace' to organize your records.",
        "4. Click into the workspace card to access the predictive engine."
      ]
    },
    {
      id: "pipeline",
      title: "The 11-Step Pipeline",
      icon: <Zap size={18} className="text-[#00e5b0]" />,
      desc: "Our proprietary engine performs deep-matrix analysis using an autonomous 11-stage intelligence cycle.",
      content: [
        "Step 01-03: Real-time File Ingestion and Automated Target Feature Inference.",
        "Step 04-06: Cleaning and Advanced Exploratory Data Clustering.",
        "Step 07-09: Model Racing (AutoML) and SHAP Explainability Decomposition.",
        "Step 10-11: Gemini-Powered Narrative Synthesis and Final Dashboard Deployment."
      ]
    },
    {
      id: "features",
      title: "Key Features",
      icon: <TrendingUp size={18} className="text-[#f5a623]" />,
      desc: "Harness the power of XGBoost and SHAP explainers to drive actual business growth.",
      content: [
        "🔮 Forecasting: Predictive models trained on your data curves for future demand tracking.",
        "📉 XAI (Explainability): SHAP values tell you exactly 'Why' a variable moved your metrics.",
        "💬 AI Chat: A session-aware widget that answers questions about your specific data graphs."
      ]
    },
    {
      id: "monetization",
      title: "Tiers & Pricing",
      icon: <ShieldCheck size={18} className="text-[#4f8cff]" />,
      desc: "Flexible plans designed to scale with your business intelligence needs.",
      content: [
        "Free: 1 Analysis/Day, Standard Reports, Community Support.",
        "Pro (₹499/mo): Unlimited Analyses, Instant Forecasts, Full SHAP Access.",
        "Enterprise: Custom ERP connectivity and Private GPU nodes."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#04050f] text-[#eeeeff] font-['Figtree'] pb-20 selection:bg-[#8169ff] overflow-x-hidden">
      <style>{styles}</style>
      <div className="mesh-bg" />
      
      {/* ── Header ── */}
      <nav className="h-[70px] border-b border-white/5 flex items-center px-8 sm:px-[10%] sticky top-0 bg-[#04050f]/80 backdrop-blur-xl z-[100] justify-between">
        <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer group">
          <ChevronLeft size={16} className="text-[#40425a] group-hover:text-white transition-colors" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8385a0] group-hover:text-white transition-colors">Back to Home</span>
        </div>
        <div className="syne font-black text-lg tracking-tight">Documentation</div>
        <div className="w-[100px]" />
      </nav>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto pt-16 px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8169ff]/30 bg-[#8169ff]/10 text-[#c7b9ff] text-[10px] font-black uppercase tracking-widest mb-6">
            Help Center
          </div>
          <h1 className="syne font-black text-5xl tracking-tighter leading-none mb-6">
            Master the <br /><span className="text-[#8169ff]">Intelligence Engine.</span>
          </h1>
          <p className="text-[#8385a0] text-lg max-w-xl leading-relaxed">
            Everything you need to know about processing, analyzing, and explaining your data with AnalytixAI.
          </p>
        </motion.div>

        <div className="grid gap-12">
          {sections.map((s, i) => (
            <motion.section 
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-1 bg-gradient-to-br from-white/5 to-transparent rounded-[32px] border border-white/5 hover:border-[#8169ff]/20 transition-all"
            >
              <div className="bg-[#080a18] rounded-[30px] p-10 h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                    {s.icon}
                  </div>
                  <h2 className="syne font-bold text-xl">{s.title}</h2>
                </div>
                
                <p className="text-[#8385a0] leading-relaxed mb-8 text-[15px]">
                  {s.desc}
                </p>

                <div className="space-y-4">
                  {s.content.map((item, j) => (
                    <div key={j} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                      <div className="w-5 h-5 shrink-0 rounded-full bg-[#8169ff]/20 text-[#8169ff] flex items-center justify-center text-[10px] font-black">
                        {j + 1}
                      </div>
                      <div className="text-[14px] text-[#eeeeff] font-medium leading-relaxed">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* ── CTA ── */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 p-12 rounded-[40px] bg-gradient-to-br from-[#8169ff]/20 to-transparent border border-[#8169ff]/10 text-center"
        >
          <h2 className="syne font-black text-3xl mb-4">Ready to test the engine?</h2>
          <p className="text-[#8385a0] mb-8">Create your first workspace and start your analysis today.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#8169ff] text-white px-10 py-4 rounded-xl font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-2 mx-auto"
          >
            Go to App <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* ── Footer ── */}
        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center gap-4 text-center pb-10">
           <div className="text-[10px] font-black text-[#40425a] uppercase tracking-[0.5em]">© 2026 ANALYTIX.AI</div>
           <ul className="flex gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-[#40425a]">
              <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
           </ul>
        </footer>
      </div>
    </div>
  );
};

export default Docs;
