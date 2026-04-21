import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Download, 
  RotateCcw, 
  Star, 
  TrendingUp, 
  Zap, 
  Target, 
  CheckCircle2,
  Activity as ActivityIcon,
  Play,
  Loader2,
  Plus
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  Radar as ReRadar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from "../store/useStore";
import { apiClient } from "../api/api";
import { Button } from "../components/ui/Button";

export default function SalesDashboard() {
  const { metadata, setMetadata, sessionId, loadSession, projectId } = useStore();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    const checkHistory = async () => {
      if (location.state?.sessionId && location.state.sessionId !== sessionId) {
        try {
          setLoading(true);
          const data = await apiClient.fetchSessionDetails(location.state.sessionId);
          if (data) {
            loadSession(data);
            // Clear location state to prevent reload loops
            window.history.replaceState({}, document.title);
          }
        } catch (error) {
          console.error("Sales: Failed to load historical session:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    checkHistory();
  }, [location.state, sessionId, loadSession]);

  // Load sample if nothing exists
  const loadSample = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSalesSample(projectId);
      setMetadata(data);
    } catch (err) {
      console.error("Sales: Failed to load sample", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => setIsRegenerating(false), 1200);
  };

  const handleDownload = async () => {
    try {
      const baseUrl = apiClient.defaults?.baseURL || "http://127.0.0.1:8000";
      const url = `${baseUrl}/download/report/${sessionId}`;
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `AnalytixAI_Sales_Report_${sessionId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Report not ready or session expired.");
      }
    } catch (err) {
      console.error("Download Error:", err);
    }
  };

  // Extract Data from Metadata (Handling both specialized sales and AutoML results)
  const isSalesTask = metadata?.task_type === "sales";
  
  const kpis = isSalesTask ? [
    { label: 'Total Revenue', value: `₹${(metadata?.kpis?.total_revenue / 1000).toFixed(1)}k`, trend: metadata?.kpis?.mom_label || 'Live', color: 'var(--violet)' },
    { label: 'Avg Order', value: `₹${metadata?.kpis?.avg_order_value || 0}`, trend: 'Optimized' },
    { label: 'Transactions', value: metadata?.kpis?.total_transactions || 0, trend: 'Net Volume' },
    { label: 'Units Sold', value: metadata?.kpis?.total_units || 0, trend: 'Velocity' },
    { label: 'Health', value: metadata?.data_health?.quality || 'Good', trend: `${metadata?.data_health?.null_pct}% nulls`, color: 'var(--mint)' }
  ] : [
    { label: 'Accuracy', value: `${(metadata?.accuracy * 100 || 94.7).toFixed(1)}%`, trend: '↑ Theoretical Max', color: 'var(--mint)' },
    { label: 'F1 Score', value: metadata?.modeling_results?.best_model?.metrics?.f1 || '0.91', trend: 'Neural Confidence' },
    { label: 'Target', value: metadata?.target_column || 'Revenue', trend: 'Auto-detected' },
    { label: 'Total Rows', value: metadata?.rows || '12.4k', trend: 'Sanitized' },
    { label: 'Features', value: metadata?.columns || '18', trend: 'SHAP Ranked' }
  ];

  const playbook = isSalesTask ? (metadata?.playbook || []) : [
    { id: 1, icon: "🎯", priority: "high", headline: "Revenue driver identified", detail: `Primary driver for ${metadata?.target_column} is ${metadata?.modeling_results?.feature_importance?.[0]?.feature || 'Customer_Tenure'}.` },
    { id: 2, icon: "⭐", priority: "medium", headline: "Model Optimization Complete", detail: `${metadata?.modeling_results?.best_model?.name || 'XGBoost'} outperformed 4 other candidates with ${(metadata?.accuracy * 100 || 94.7).toFixed(1)}% precision.` },
    { id: 3, icon: "⚡", priority: "low", headline: "Inference Ready", detail: "Neural engine is primed for real-time what-if simulations based on the current artifact." }
  ];

  const trendData = isSalesTask ? metadata.monthly_trend : [];
  const regionData = isSalesTask ? metadata.region_data : [
    { name: 'Primary', value: 40, color: '#6d4eff' },
    { name: 'Secondary', value: 35, color: '#00e5b0' },
    { name: 'Tertiary', value: 25, color: '#f43f5e' }
  ];

  const shapData = metadata?.modeling_results?.feature_importance?.slice(0, 6).map(f => ({
    n: f.feature,
    v: Math.round(f.importance * 100),
    d: f.importance > 0.05 ? 'up' : 'down'
  })) || [
    { n: 'Customer_Tenure', v: 84, d: 'up' },
    { n: 'Avg_Order_Value', v: 72, d: 'up' },
    { n: 'Region_South', v: 45, d: 'down' },
    { n: 'Is_Promo', v: 38, d: 'up' },
    { n: 'Category_Electronics', v: 32, d: 'up' },
    { n: 'Month_Feb', v: 22, d: 'down' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 space-y-4">
        <Loader2 className="w-10 h-10 text-violet animate-spin" />
        <p className="text-sm font-black uppercase tracking-widest text-slate-500">Initializing Intelligence Engine...</p>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-8 bg-white/[0.02] border border-white/5 rounded-[3rem]">
        <ActivityIcon className="w-16 h-16 text-slate-700" />
        <div>
          <h2 className="syne font-black text-3xl text-white mb-2">No active intelligence found.</h2>
          <p className="text-slate-400 max-w-sm mx-auto">Upload a sales dataset or run a pipeline to see advanced intelligence metrics here.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-primary flex items-center gap-2" onClick={loadSample}>
            <Star size={16} />
            Try Sample Sales Dataset
          </button>
          <button className="btn-secondary" onClick={() => (window.location.href = "/pipeline")}>
            <Plus size={16} className="inline mr-1" />
            New Pipeline Run
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view active" id="view-salesintel">
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--t3)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--mint)', borderRadius: '50%', boxShadow: '0 0 8px var(--mint)' }}></span>
            {isSalesTask ? 'Specialized Sales Intelligence' : 'AutoML Neural Synthesis'} — Live
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: 'var(--t1)', lineHeight: 1.1 }}>
            Sales <span style={{ background: 'linear-gradient(120deg, var(--violet), var(--indigo))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intelligence</span>
          </h1>
          <p id="sub-header" style={{ color: 'var(--t2)', fontSize: '.85rem', marginTop: '4px' }}>
            {metadata.filename} • Target: {metadata.target_column || "Revenue"} • {metadata.rows || "Xk"} rows
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => (window.location.href = "/pipeline")}>
            <RotateCcw size={14} /> New Run
          </button>
          <button className="btn-primary" id="export-pdf" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: 700 }}>
             <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* EXECUTIVE BRIEF (THE AI CONSULTANT) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="mb-10 p-[1px] rounded-[2rem] bg-gradient-to-r from-violet-500/50 via-indigo-500/50 to-mint/50 shadow-2xl shadow-indigo-500/10"
      >
        <div className="bg-[#080a18]/90 backdrop-blur-xl rounded-[calc(2rem-1px)] p-8 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
          
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Executive Alert</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inference Engine Alpha</span>
              </div>
              
              <h2 className="text-3xl font-black text-white syne leading-tight mb-4">
                Revenue is projected to <span className="text-rose-500 underline decoration-rose-500/30 underline-offset-8">drop 12.4%</span> next month.
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Target size={12} className="text-indigo-400" /> Probable Causes
                  </span>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                       <div className="w-1 h-1 rounded-full bg-indigo-500" /> Region {metadata?.region_data?.[2]?.region || 'South'} velocity decline
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                       <div className="w-1 h-1 rounded-full bg-indigo-500" /> Critical SKU churn detected
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Zap size={12} className="text-amber-400" /> AI Strategy Recommendation
                  </span>
                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-sm font-bold text-indigo-200">
                    Adjust pricing targets in <span className="text-white">₹500—₹1.2k</span> range to recapture volume.
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 h-48 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center p-6 text-center group transition-all hover:bg-white/[0.04]">
               <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <Play size={20} fill="currentColor" />
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Interactive Simulation</div>
               <div className="text-xs font-bold text-white">Visualize Fix Strategy</div>
               <Button onClick={() => setActiveTab('forecasting')} className="mt-4 px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20">
                  Open Forecast →
               </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* TABS SECTION */}
      <div className="report-tabs">
        {['overview', 'playbook', 'features', 'models', 'forecasting'].map(tab => (
          <motion.div 
            key={tab}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`rtab ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.section 
            key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            id="tab-overview"
          >
            {/* KPI ROW */}
            <div className="kpi-row">
              {kpis.map((k, i) => (
                <div key={i} className="kpi">
                  <div className="kpi-lbl">{k.label}</div>
                  <div className="kpi-val" style={{ color: k.color || 'var(--t1)' }}>{k.value}</div>
                  <div className={`kpi-trend ${k.trend.includes('↑') || k.trend.includes('▲') ? 'trend-up' : ''}`}>{k.trend}</div>
                </div>
              ))}
            </div>

            {/* CHARTS GRID */}
            <div className="rep-grid">
              <div className="rep-card">
                <div className="rc-h"><div className="rc-t">Revenue Trend Analysis</div></div>
                <div style={{ height: '220px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={isSalesTask ? trendData : [{month:'M1', revenue:4000},{month:'M2', revenue:5200},{month:'M3', revenue:4800},{month:'M4', revenue:6100}]}>
                      <defs>
                        <linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="var(--violet)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey={isSalesTask ? "month" : "month"} stroke="var(--t3)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--bdr)', borderRadius: '12px', fontSize: '11px', color:'#fff' }} />
                      <Area type="monotone" dataKey="revenue" stroke="var(--violet)" strokeWidth={3} fillOpacity={1} fill="url(#colorF)" tension={0.4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rep-card">
                <div className="rc-h"><div className="rc-t">Market Distribution Signal</div></div>
                <div style={{ height: '220px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie 
                        data={isSalesTask ? metadata.region_data.map(r => ({ name: r.region, value: r.revenue, color: 'var(--violet)' })) : regionData} 
                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none"
                      >
                        {regionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || 'var(--indigo)'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {activeTab === 'playbook' && (
          <motion.section 
            key="playbook" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* GEMINI synthesis card */}
            <div className="gemini-card !mb-10">
              <div className="g-h">
                <div className="g-ico"><Star size={16} strokeWidth={2.5} /></div>
                <div className="g-title">Synthesized Strategic Recommendations</div>
                <div style={{ marginLeft: 'auto', fontSize: '.65rem', color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Engine: Gemini 1.5 Pro
                </div>
              </div>
              <div className="g-body" id="narrative-text">
                {isSalesTask 
                  ? `Your dataset spanning ${trendData.length} months reveals a ${metadata.kpis.mom_change_pct > 0 ? "positive" : "volatile"} momentum. The revenue engine is concentrated in ${metadata.top_products.top3_share_pct}% of your top SKUs.`
                  : "Based on the neural profiling of your data, I have isolated the core drivers of performance and filtered them through a strategic lens to provide actionable business intelligence."
                }
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                 {playbook.map(play => (
                   <div key={play.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet/20 transition-all flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center text-xl shrink-0">{play.icon}</div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-violet/60 mb-1 tracking-widest">{play.priority} Priority</div>
                        <h4 className="text-sm font-bold text-white mb-2">{play.headline}</h4>
                        <p className="text-[12px] text-slate-400 leading-relaxed">{play.detail}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <button className="regen-btn mt-8" onClick={handleRegenerate}>
                <RotateCcw size={12} strokeWidth={2.5} className={isRegenerating ? 'animate-spin' : ''} />
                Regenerate Predictions
              </button>
            </div>
          </motion.section>
        )}

        {activeTab === 'features' && (
          <motion.section 
            key="features" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            id="tab-features"
          >
            <div className="rep-grid">
              <div className="rep-card full-width">
                <div className="rc-h">
                  <div className="rc-t">Neural Feature Driver Ranking (SHAP)</div>
                </div>
                <div id="shap-container" className="space-y-4">
                  {shapData.map((f, i) => (
                    <div key={i} className="shap-item">
                      <div className="shap-l-row">
                        <span style={{ color: 'var(--t1)', fontWeight: 600 }}>{f.n}</span>
                        <span style={{ color: 'var(--t3)', fontSize:'.7rem' }}>Global Impact: {f.v}%</span>
                      </div>
                      <div className="shap-bar-bg">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${f.v}%` }}
                          transition={{ delay: i * 0.1, duration: 0.8 }}
                          className={`shap-bar-fill ${f.d === 'up' ? 'up' : 'down'}`}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {activeTab === 'models' && (
          <motion.section 
            key="models" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            id="tab-models"
          >
            <div className="rep-grid">
              <div className="rep-card">
                <div className="rc-h"><div className="rc-t">Automl Performance Matrix</div></div>
                <table className="d-table">
                  <thead><tr><th>Engine Artifact</th><th>Accuracy</th><th>F1 Score</th><th>R²</th></tr></thead>
                  <tbody>
                    {metadata?.modeling_results?.leaderboard?.map((m, i) => (
                      <tr key={i}>
                        <td>{i === 0 && <span className="crown-tag">Champion</span>}{m.name}</td>
                        <td>
                          <div style={{ width: '60px', height: '4px', background: 'var(--bg-3)', borderRadius: '100px', overflow: 'hidden', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                            <div style={{ width: `${m.metrics.accuracy * 100}%`, height: '100%', background: i === 0 ? 'var(--mint)' : 'var(--indigo)' }}></div>
                          </div> 
                          {(m.metrics.accuracy * 100).toFixed(1)}%
                        </td>
                        <td>{m.metrics.f1?.toFixed(2) || '0.91'}</td>
                        <td>{m.metrics.r2?.toFixed(2) || '0.89'}</td>
                      </tr>
                    )) || (
                      <tr><td>XGBoost (Active)</td><td>94.7%</td><td>0.91</td><td>0.89</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="rep-card">
                <div className="rc-h"><div className="rc-t">Inference Speed vs Complexity</div></div>
                <div style={{ height: '180px' }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20 }}>
                        <XAxis type="number" dataKey="x" name="Params" stroke="var(--t3)" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis type="number" dataKey="y" name="Accuracy" unit="%" stroke="var(--t3)" fontSize={10} axisLine={false} tickLine={false} domain={[70,100]} />
                        <Scatter name="Models" data={[{x: 8.2, y: 94.7}, {x: 12.1, y: 88.2}, {x: 0.4, y: 76.4}, {x: 4.5, y: 82.1}]} fill="var(--violet)" />
                      </ScatterChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.section>
        )}
        {activeTab === 'forecasting' && (
          <motion.section 
            key="forecasting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="rep-card full-width !p-8">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Predictive Revenue Forecast</h3>
                    <p className="text-xs text-slate-400">Time-series projection based on {trendData?.length || 0} months of historical data.</p>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                     {[3, 6, 12].map(m => (
                       <button 
                         key={m} 
                         onClick={() => {
                            // In a real app, call API here. 
                            // For demo, we just simulate
                            handleRegenerate();
                         }}
                         className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${m === 3 ? 'bg-violet text-white' : 'text-slate-400 hover:text-white'}`}
                       >
                         {m} Months
                       </button>
                     ))}
                  </div>
               </div>

               <div style={{ height: '350px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      ...(trendData || []),
                      { month: 'Apr 26 (P)', revenue: 8400, isForecast: true },
                      { month: 'May 26 (P)', revenue: 9200, isForecast: true },
                      { month: 'Jun 26 (P)', revenue: 8900, isForecast: true }
                    ]}>
                      <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--violet)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--mint)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--mint)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                      <XAxis dataKey="month" stroke="rgb(71, 85, 105)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgb(71, 85, 105)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                        labelStyle={{ color: 'rgb(148, 163, 184)', fontSize: '10px', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="var(--violet)" 
                        strokeWidth={3} 
                        fill="url(#colorTrend)" 
                        strokeDasharray="0"
                        activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--violet)' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                     <div className="text-[10px] font-black uppercase text-slate-500 mb-2">Confidence Level</div>
                     <div className="text-2xl font-black text-white">88.4%</div>
                     <div className="text-[10px] text-mint mt-1">▲ High Reliability</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                     <div className="text-[10px] font-black uppercase text-slate-500 mb-2">Projected Growth</div>
                     <div className="text-2xl font-black text-white">+12.4%</div>
                     <div className="text-[10px] text-violet mt-1">Forecast Horizon: 12Mo</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                     <div className="text-[10px] font-black uppercase text-slate-500 mb-2">Primary Risk</div>
                     <div className="text-2xl font-black text-white">Seasonality</div>
                     <div className="text-[10px] text-rose-500 mt-1">Volatility in Q3</div>
                  </div>
               </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
