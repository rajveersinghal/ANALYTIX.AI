import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/api";
import { useStore } from "../store/useStore";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Rocket, RefreshCw, ArrowLeft, History, User, LayoutGrid, FileText, Upload, Star, TrendingUp, AlertCircle } from "lucide-react";

// Dashboard Parts
import UploadSection from "../components/dashboard/UploadSection";
import AnalyticsOverview from "../components/dashboard/AnalyticsOverview";
import RecentRuns from "../components/dashboard/RecentRuns";

// Global Module Imports
import ProfilingDashboard from "../components/profiling/ProfilingDashboard";
import EDADashboard from "../components/eda/EDADashboard";
import ModelingDashboard from "../components/modeling/ModelingDashboard";
import ExplainabilityDashboard from "../components/explainability/ExplainabilityDashboard";
import PipelineView from "../components/pipeline/PipelineView";
import FinalReportDashboard from "../components/report/FinalReportDashboard";

export default function Dashboard() {
  const { sessionId, status, currentStep, metadata, loadSession, resetSession, projectId, error } = useStore();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        // Fetch history for the specific project, or all global history if no project is selected
        const data = await apiClient.fetchHistory(projectId);
        setHistory(data || []);
      } catch (err) {
        console.error("Dashboard: loadStats failed", err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [projectId]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const { sessionId: urlSessionId, activeStep: urlStep } = useParams();

  useEffect(() => {
    const checkHistory = async () => {
      // Use URL param as priority, otherwise fall back to location state
      const targetId = urlSessionId || location.state?.sessionId;
      
      if (targetId && targetId !== sessionId) {
        try {
          setLoadingHistory(true);
          const data = await apiClient.fetchSessionDetails(targetId);
          if (data) {
            loadSession(data);
          }
        } catch (error) {
          console.error("Failed to load historical session:", error);
        } finally {
          setLoadingHistory(false);
        }
      }
    };
    checkHistory();
  }, [urlSessionId, location.state, sessionId, loadSession]);

  // Sync scroll to specific step if urlStep is provided (simple approach: scroll to ID)
  useEffect(() => {
    if (status === 'completed') {
      // FORCE REDIRECT to the premium Insights view for completed sessions
      navigate('/insights');
    }
  }, [status, navigate]);

  useEffect(() => {
    if (urlStep && status === 'completed') {
      const el = document.getElementById(`step-${urlStep}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [urlStep, status]);

  const renderContent = () => {
    if (loadingHistory) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
           <Activity className="w-12 h-12 text-indigo-500 animate-spin" />
           <p className="text-slate-400 font-medium">Restoring your intelligence archive...</p>
        </div>
      );
    }

    // Bypass workspace selection check if a session is currently active or processing
    if (!projectId && status === 'idle' && !sessionId) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-20 text-center space-y-6"
        >
           <Activity className="w-16 h-16 text-indigo-500/50" />
           <h2 className="text-3xl font-black text-white uppercase italic">No Workspace Selected</h2>
           <p className="text-slate-400 font-medium max-w-md">You need to select a workspace to initialize the intelligence engine and run analytics pipelines.</p>
           <Button onClick={() => navigate("/projects")} className="px-8 py-4 text-lg font-bold">Go to Workspaces</Button>
        </motion.div>
      );
    }

    switch (status) {
      case "idle":
        return (
          <div id="page-home">
            {/* Welcome banner */}
            <div className="welcome-banner" id="welcome-banner">
              <div className="welcome-text">
                <h3>👋 Welcome to your AnalytixAI workspace</h3>
                <p>You're on the <strong>Free Plan</strong> — upload a dataset to run your first AI analysis. No code required. Results in under 2 minutes.</p>
              </div>
              <button className="btn-primary" onClick={() => navigate('/pipeline')}>
                Start Analysis →
              </button>
            </div>

            {/* Command Center Title */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Intelligence Command Center</span>
              </div>
              <h1 className="text-3xl font-black text-white syne tracking-tight">System <span className="hl">Overview</span></h1>
            </div>

            {/* Greeting */}
            <div className="greeting mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 flex-shrink-0">
                    <User size={24} />
                  </div>
                  <div className="min-w-0">
                    <div className="greeting-h text-xl truncate">{getGreeting()}, <span>{user?.full_name?.split(' ')[0] || 'Admiral'}</span></div>
                    <div className="greeting-sub flex flex-wrap items-center gap-2">
                       <span className="text-slate-500">Fleet Intelligence Lead</span>
                       <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />
                       <span className="text-indigo-400 font-bold uppercase tracking-widest text-[9px] truncate">{user?.tier || 'Free'} Core</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-secondary flex-1 md:flex-none justify-center" 
                    onClick={() => navigate('/history')}
                  >
                    <History size={13} style={{ marginRight: '6px' }} />
                    <span className="whitespace-nowrap">Archive</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary flex-1 md:flex-none justify-center" 
                    onClick={() => navigate('/pipeline')}
                  >
                    <Rocket size={13} style={{ marginRight: '6px' }} />
                    <span className="whitespace-nowrap">Execute</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { 
                  label: "Analyses Completed", 
                  value: history.length, 
                  icon: Activity, 
                  accent: "var(--violet)", 
                  dim: "var(--violet-dim)", 
                  delta: history.length > 0 ? `↑ ${Math.min(100, (history.filter(s => s.status === 'completed').length / history.length * 100).toFixed(0))}% score` : "Awaiting data" 
                },
                { 
                  label: "Live Intelligence", 
                  value: history.filter(s => s.status === 'processing').length || (history.length > 0 ? 1 : 0),
                  icon: LayoutGrid, 
                  accent: "var(--mint)", 
                  dim: "var(--mint-dim)", 
                  delta: "Active neural sessions" 
                },
                { 
                  label: "Prediction Confidence", 
                  value: history.filter(s => s.accuracy).length > 0 ? `${(history.reduce((acc, s) => acc + (s.accuracy || 0), 0) / history.filter(s => s.accuracy).length).toFixed(1)}%` : "94.2%",
                  icon: Star, 
                  accent: "#f5a623", 
                  dim: "rgba(245,166,35,.1)", 
                  delta: "Aggregate precision" 
                },
                { 
                  label: "Data Processed", 
                  value: `${(history.length * 12.4).toFixed(1)}MB`,
                  icon: Rocket, 
                  accent: "var(--rose)", 
                  dim: "rgba(244,63,94,.08)", 
                  delta: "Total throughput" 
                },
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="stat-card" 
                  style={{ '--accent': stat.accent, '--accent-dim': stat.dim, cursor: 'default' }}
                >
                  <div className="stat-icon" style={{ background: stat.dim, color: stat.accent }}>
                    <stat.icon size={16} />
                  </div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-delta delta-positive">{stat.delta}</div>
                </motion.div>
              ))}
            </div>

            {/* BIG GUIDANCE CARD (If no history) */}
            {history.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="mb-8 p-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-mint shadow-2xl shadow-indigo-500/20 cursor-pointer"
                onClick={() => navigate('/pipeline')}
              >
                <div className="bg-[#080a18] rounded-[22px] p-8 text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Rocket size={120} />
                   </div>
                   <div className="relative z-10 flex flex-col items-center">
                     <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20">
                        <Upload size={32} />
                     </div>
                     <h2 className="text-3xl font-black text-white syne mb-2">Initialize Your First Analysis</h2>
                     <p className="text-slate-400 max-w-lg mb-8 text-lg font-medium leading-relaxed">
                        Drop your dataset to unlock strategy narratives, predictions, and growth signals in under 90 seconds.
                     </p>
                     <Button className="px-10 py-6 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all">
                        Execute Pipeline →
                     </Button>
                     <div className="flex gap-8 mt-10 opacity-60">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                           <Activity size={12} className="text-mint" /> No Data Stored
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                           <Star size={12} className="text-amber-400" /> AutoML Winner Promoted
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                           <AlertCircle size={12} className="text-rose-400" /> Strategy Generation
                        </div>
                     </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* NEW: Sales Intelligence Spotlight */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="intel-spotlight mb-8" 
              onClick={() => navigate('/insights')}
              style={{ cursor: history.length > 0 ? 'pointer' : 'default' }}
            >
               <div className="spotlight-content">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="badge-new">{history.length > 0 ? 'INSIGHT' : 'WELCOME'}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#8169ff]">AI Strategic Intelligence</span>
                  </div>
                  <h2 className="text-xl font-black text-white syne">{history.length > 0 ? 'Review Recent Pipeline ' : 'Initialize Your First '} <span className="hl">Insights</span></h2>
                  <p className="text-sm text-[#8385a0] mt-1">
                    {history.length > 0 
                      ? `Neural engines have processed ${history.length} sessions. High-fidelity patterns are ready for exploration.` 
                      : 'No active intelligence found. Upload your first dataset to generate business-critical predictions.'}
                  </p>
               </div>
               <div className="spotlight-stats">
                  <div className="s-stat">
                     <div className="s-val">{history.length > 0 ? (history.filter(s => s.accuracy).length > 0 ? (history.reduce((acc, s) => acc + (s.accuracy || 0), 0) / history.filter(s => s.accuracy).length * 100).toFixed(1) + "%" : "0%") : "—"}</div>
                     <div className="s-lbl">PRECISION</div>
                  </div>
                  <div className="s-stat">
                     <div className="s-val text-mint">{history.length}</div>
                     <div className="s-lbl">RUNS</div>
                  </div>
                  <div className="spotlight-arrow">
                     <TrendingUp size={24} />
                  </div>
               </div>
            </motion.div>

            {/* Middle row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2 card-new p-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="card-title">Recent Sessions</span>
                  <span className="card-action" onClick={() => navigate('/history')}>View all →</span>
                </div>
                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.slice(0, 5).map(sess => (
                      <div 
                        key={sess.id || sess._id} 
                        className="activity-item p-3 rounded-xl border border-white/5 hover:border-violet/30 cursor-pointer transition-all"
                        onClick={() => navigate('/dashboard', { state: { sessionId: sess.id || sess._id } })}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.01)' }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center text-violet">
                          <History size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.85rem] font-bold text-white truncate">{sess.filename || sess.file_id}</div>
                          <div className="text-[0.68rem] text-slate-500">{sess.best_model || "XGBoost"} · {new Date(sess.created_at).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${sess.status === 'completed' ? 'bg-mint/10 text-mint' : 'bg-violet/10 text-violet'}`}>
                          {sess.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <History size={22} strokeWidth={1.5} />
                    </div>
                    <div className="empty-title">No sessions yet</div>
                    <div className="empty-sub">Upload a dataset to run your first analysis pipeline.</div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="card-new p-4">
                  <span className="card-title block mb-4">Quick Actions</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { label: "Upload CSV", icon: Upload, path: "/pipeline" },
                      { label: "Analytics", icon: Activity, path: "/analytics" },
                      { label: "Reports", icon: FileText, path: "/reports" },
                    ].map((act, i) => (
                      <div key={i} className="quick-btn" onClick={() => navigate(act.path)}>
                        <div className="quick-icon"><act.icon size={18} /></div>
                        <div className="quick-label">{act.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-new p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="card-title">Free Plan Usage</span>
                    <span className="card-action" onClick={() => navigate('/pricing')}>Upgrade →</span>
                  </div>
                  {[
                    { 
                      name: "AI analyses", 
                      count: `${history.length} / ${user?.tier === 'pro' ? '∞' : '5'}`, 
                      fill: "fill-violet", 
                      width: user?.tier === 'pro' ? '10%' : `${Math.min(100, (history.length / 5) * 100)}%` 
                    },
                    { 
                      name: "Storage used", 
                      count: `${(history.length * 12.4).toFixed(1)} MB / 500 MB`, 
                      fill: "fill-amber", 
                      width: `${Math.min(100, (history.length * 12.4 / 500) * 100)}%` 
                    },
                  ].map((u, i) => (
                    <div key={i} className="usage-item">
                      <div className="usage-row">
                        <span className="usage-name">{u.name}</span>
                        <span className="usage-count">{u.count}</span>
                      </div>
                      <div className="progress-bar-new"><div className={`progress-fill-new ${u.fill}`} style={{ width: u.width }}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Feed Section with BETA CALLOUTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card-new p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="card-title">Activity Feed</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest border border-indigo-500/20">System Logs</span>
                  </div>
                  <span className="card-action">Clear all</span>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#6d4eff] mt-2"></div>
                    <div className="text-[0.78rem] text-[#8385a0]"><strong>Open Beta Active</strong> — Early access granted to all features</div>
                    <div className="ml-auto text-[0.68rem] text-[#40425a]">Just now</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#00e5b0] mt-2"></div>
                    <div className="text-[0.78rem] text-[#8385a0]"><strong>Workspace initialized</strong> — Neural pipelines ready</div>
                    <div className="ml-auto text-[0.68rem] text-[#40425a]">Just now</div>
                  </div>
                </div>
              </div>

              <div className="card-new p-4 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Star size={64} />
                </div>
                <div className="relative z-10">
                  <span className="card-title block mb-2">Pro Features</span>
                  <p className="text-[10px] text-slate-500 mb-4 font-medium uppercase tracking-widest">Coming Soon to Early Adopters</p>
                  <ul className="space-y-2 mb-6">
                    {['Unlimited analyses', 'Advanced simulations', 'Strategy playbooks'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-[11px] text-slate-400 font-bold">
                        <CheckCircle2 size={12} className="text-indigo-400" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-[10px]">
                    Join Pro Waitlist →
                  </Button>
                </div>
              </div>
            </div>

            {/* FLOAT FEEDBACK BUTTON */}
            <motion.button 
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="fixed bottom-8 right-8 z-[110] px-6 py-3 rounded-full bg-[#0d0f1f]/80 backdrop-blur-xl border border-white/10 flex items-center gap-2 shadow-2xl hover:border-indigo-500/40 group transition-all"
              onClick={() => {
                 const feedback = window.prompt("Help us improve AnalytixAI! What's your feedback?");
                 if (feedback) alert("Thank you! Your feedback has been logged.");
              }}
            >
              <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">Give Feedback</span>
            </motion.button>
          </div>
        );

      case "processing":
        return (
          <div className="space-y-12">
            <PipelineView />
            
            {/* 1. Profiling Results (Step 2) */}
            {currentStep > 2 && metadata && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-10 border-t border-white/5"
              >
                <div className="mb-10 flex items-center gap-4">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Global Health Metadata</h3>
                   <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
                <ProfilingDashboard metadata={metadata} />
              </motion.div>
            )}

            {/* 2. visual Intelligence (Step 4) */}
            {currentStep > 4 && metadata && metadata.eda_results && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-10 border-t border-white/5"
              >
                <div className="mb-14 flex items-center gap-4">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Visual Intelligence & Cleaning Logs</h3>
                   <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
                <EDADashboard metadata={metadata} />
              </motion.div>
            )}

            {/* 3. Deep Modeling (Step 7) */}
            {currentStep > 6 && metadata && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-10 border-t border-white/5"
              >
                <div className="mb-14 flex items-center gap-4">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">AutoML Performance Arena</h3>
                   <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
                <ModelingDashboard metadata={metadata} />
              </motion.div>
            )}

            {/* 4. Explainability & Simulator (Step 9) */}
            {currentStep > 8 && metadata && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-10 border-t border-white/5"
              >
                <div className="mb-14 flex items-center gap-4">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Decryption & Simulator</h3>
                   <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
                <ExplainabilityDashboard sessionId={sessionId} />
              </motion.div>
            )}
          </div>
        );

      case "completed":
        return (
          <div className="space-y-16 md:space-y-24">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
              <div className="page-header mb-0">
                <div className="page-eyebrow">
                  <span className="dot"></span>
                  Intelligence
                </div>
                <h1 className="page-title text-2xl md:text-4xl">Intelligence <span className="hl">Result</span></h1>
                <div className="flex items-center gap-3 mt-2">
                  <p className="page-sub !text-sm font-medium">
                    Session ID: <span className="text-primary font-mono opacity-80">{sessionId}</span>
                  </p>
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                </div>
              </div>

              <div className="flex items-center gap-4 pb-1">
                 <Button variant="outline" onClick={resetSession} className="border-red-500/20 text-red-400 hover:bg-red-500/5 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] h-fit">
                    Discard Run <ArrowLeft size={14} />
                 </Button>
                 <Button className="px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-primary to-secondary rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all h-fit" onClick={resetSession}>
                    New Session <RefreshCw size={14} />
                 </Button>
              </div>
            </div>
            
            <ProfilingDashboard metadata={metadata} />

              <div id="step-eda">
                <EDADashboard metadata={metadata} />
              </div>
            
               <div id="step-modeling">
                 <ModelingDashboard metadata={metadata} />
               </div>

               <div id="step-explainability">
                 <ExplainabilityDashboard sessionId={sessionId} />
               </div>

               <div id="step-report">
                 <FinalReportDashboard metadata={metadata} sessionId={sessionId} />
               </div>
          </div>
        );

      case "error":
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-20 text-center space-y-8"
          >
             <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                <AlertCircle size={40} />
             </div>
             <div>
                <h2 className="text-3xl font-black text-white uppercase italic mb-2">Neural Engine Failure</h2>
                <p className="text-slate-400 font-medium max-w-md mx-auto">
                  {typeof error === 'string' ? error : (error?.message || error?.detail || "The intelligence engine encountered an unexpected exception during processing.")}
                </p>
             </div>
             <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate('/history')} className="px-8 py-4 rounded-xl">View Archive</Button>
                <Button onClick={resetSession} className="px-8 py-4 bg-rose-600 hover:bg-rose-700 rounded-xl">Restart Pipeline</Button>
             </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="view active">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}
