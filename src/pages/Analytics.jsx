import React, { useState, useEffect, useMemo } from "react";
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { apiClient } from "../api/api";
import { useStore } from "../store/useStore";
import { 
  Zap, 
  Target, 
  Cpu, 
  Database, 
  TrendingUp, 
  PieChart as PieIcon, 
  Activity, 
  Share2, 
  Download,
  Terminal,
  Layers,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

export default function Analytics() {
  const [period, setPeriod] = useState(30);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { workspaces } = useStore();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiClient.fetchHistory();
        setHistory(data || []);
      } catch (err) {
        console.error("Analytics fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Data Transformation ──────────────────────────────────────────────

  const charts = useMemo(() => {
    if (!history.length) return { acc: [], models: [], weekly: [], volume: [], leaderboard: [] };

    // 1. Accuracy Trend (Last N)
    const acc = history
      .filter(s => s.status === 'completed' && s.accuracy)
      .sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-10)
      .map(s => ({
        name: new Date(s.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' }),
        acc: (s.accuracy * 100).toFixed(1),
        val: s.accuracy
      }));

    // 2. Model Usage
    const modelCounts = history.reduce((acc, s) => {
      const m = s.best_model || s.model_type || "XGBoost";
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    const colors = ['#6d4eff', '#00e5b0', '#f5a623', '#4f8cff', '#f43f5e'];
    const models = Object.keys(modelCounts).map((name, i) => ({
      name,
      value: modelCounts[name],
      color: colors[i % colors.length]
    }));

    // 3. Weekly Volume
    const weekly = history
      .sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-8)
      .map((s, i) => ({
        name: `S${history.length - 8 + i + 1}`,
        sessions: 1, // simplified
        vol: Math.floor((s.rows || 1000) / 100)
      }));

    // 4. Leaderboard
    const leaderboard = [...history]
      .filter(s => s.status === 'completed')
      .sort((a,b) => (b.accuracy || 0) - (a.accuracy || 0))
      .slice(0, 5)
      .map(s => ({
        id: s.id || s._id,
        file: s.filename || s.file_id,
        ws: workspaces.find(w => w.id === s.project_id)?.name || "Default",
        model: s.best_model || "XGBoost",
        acc: (s.accuracy * 100).toFixed(1),
        date: new Date(s.created_at).toISOString().split('T')[0]
      }));

    return { acc, models, weekly, volume: weekly, leaderboard };
  }, [history, workspaces]);

  const stats = useMemo(() => {
    const completed = history.filter(s => s.status === 'completed');
    const avgAcc = completed.length > 0
      ? (completed.reduce((a, b) => a + (b.accuracy || 0), 0) / completed.length * 100).toFixed(1)
      : "0";
    const totalRows = history.reduce((a, b) => a + (b.rows || 0), 0);
    
    return {
      total: history.length,
      avgAcc,
      totalRows: (totalRows / 1000).toFixed(1) + "k"
    };
  }, [history]);

  return (
    <div className="view active">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
        <div className="page-header mb-0">
          <div className="page-eyebrow"><span className="dot"></span>Analytics</div>
          <h1 className="page-title">Platform <span className="hl">Analytics</span></h1>
          <p className="page-sub">Cross-session performance trends, model comparisons, and usage metrics.</p>
        </div>
        <div className="an-period">
          {[7, 30, 90, 365].map(d => (
            <button key={d} className={`period-btn ${period === d ? 'active' : ''}`} onClick={() => setPeriod(d)}>
              {d === 365 ? '1y' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      <div className="an-kpi-grid">
        {[
          { label: "Total Sessions", val: stats.total, sub: "Live syncing", icon: Terminal, color: "var(--t1)" },
          { label: "Avg Accuracy", val: `${stats.avgAcc}%`, sub: "Dynamic analysis", icon: Target, color: "var(--mint)" },
          { label: "Active Models", val: charts.models.length, sub: "Neural ensembles", icon: Cpu, color: "var(--violet)" },
          { label: "Rows Processed", val: stats.totalRows, sub: "Neural throughput", icon: Database, color: "var(--amber)" }
        ].map((k, i) => (
          <motion.div 
            key={k.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="an-kpi-card glass"
          >
            <div className="kpi-header">
               <div className="kpi-icon-wrap" style={{ color: k.color }}>
                 <k.icon size={18} />
               </div>
               <div className="kpi-lbl">{k.label}</div>
            </div>
            <div className="kpi-val" style={{ color: k.color }}>{k.val}</div>
            <div className="kpi-footer">
               <span className="trend-pulse" />
               <span className="kpi-sub">{k.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="an-main">
        {/* Row 1 */}
        <div className="an-grid-row">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="an-glass-card lg">
            <div className="anc-head">
              <div className="anc-icon-box"><TrendingUp size={16} /></div>
              <div>
                <div className="anc-title">Performance Trajectory</div>
                <div className="anc-sub">Historical pipeline accuracy (Last 10 runs)</div>
              </div>
            </div>
            <div className="anc-body" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.acc}>
                  <defs>
                    <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--mint)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--mint)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--t3)" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--t3)" fontSize={10} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ background: '#0d1026', border: '1px solid var(--bdr-s)', borderRadius: '16px', fontSize: '11px', color: 'var(--t1)', backdropFilter: 'blur(20px)' }}
                    itemStyle={{ color: 'var(--mint)' }}
                    cursor={{ stroke: 'var(--mint)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="acc" stroke="var(--mint)" strokeWidth={3} fillOpacity={1} fill="url(#anGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="an-glass-card sm">
            <div className="anc-head">
              <div className="anc-icon-box blue"><PieIcon size={16} /></div>
              <div>
                <div className="anc-title">Model Spread</div>
                <div className="anc-sub">Composition of ensemble runs</div>
              </div>
            </div>
            <div className="anc-body" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.models}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {charts.models.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip cursor={false} contentStyle={{ display: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center">
                <span className="pc-num">{charts.models.length}</span>
                <span className="pc-lbl">Types</span>
              </div>
            </div>
            <div className="an-legend-v2">
              {charts.models.map(m => (
                <div key={m.name} className="an-leg-item-v2">
                  <div className="flex items-center gap-2">
                    <span className="dot-ring" style={{ border: `2px solid ${m.color}` }}></span>
                    <span className="leg-name">{m.name}</span>
                  </div>
                  <span className="leg-val">{m.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Row 2 */}
        <div className="an-grid-triple">
          {[
            { title: "Activity Pulse", sub: "Scan frequency", icon: Activity, data: charts.weekly, type: "bar", color: "var(--violet)" },
            { title: "Neural Volume", sub: "Rows indexed", icon: Layers, data: charts.volume, type: "line", color: "var(--mint)" },
            { title: "Regional Signals", sub: "Confidence by zone", icon: Globe, type: "signals" }
          ].map((item, i) => (
            <motion.div 
               key={item.title}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 + i * 0.1 }}
               className="an-glass-card small-view"
            >
               <div className="anc-head mt-0">
                  <div className="anc-icon-box mini"><item.icon size={12} /></div>
                  <div>
                    <div className="anc-title text-sm">{item.title}</div>
                    <div className="anc-sub text-[9px]">{item.sub}</div>
                  </div>
               </div>

               <div className="anc-body" style={{ height: 160 }}>
                  {item.type === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={item.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.02)" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <Bar dataKey="sessions" fill={item.color} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {item.type === 'line' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={item.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.02)" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <Line type="monotone" dataKey="vol" stroke={item.color} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {item.type === 'signals' && (
                    <div className="an-signals-v2">
                      {['Asia Pacific', 'EMEA Cluster', 'North America'].map((r, i) => (
                        <div key={r} className="signal-item">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="sig-name text-[10px] font-bold text-slate-400">{r}</span>
                            <span className="sig-pct text-[10px] font-black text-white">{(98 - i*2.4).toFixed(1)}%</span>
                          </div>
                          <div className="sig-track">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${98 - i*2.4}%` }}
                               transition={{ duration: 1, delay: 0.5 + i*0.1 }}
                               className="sig-fill" 
                               style={{ background: i === 0 ? 'var(--mint)' : 'var(--violet)' }}
                             />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </motion.div>
          ))}
        </div>

        {/* Leaderboard Table */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="an-table-glass mt-12">
          <div className="anc-head flex justify-between items-center p-8 border-b border-white/5 bg-white/2">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-violet/10 rounded-2xl border border-violet/20 flex items-center justify-center text-violet">
                  <Share2 size={20} />
               </div>
               <div>
                  <div className="anc-title">High-Accuracy Leaderboard</div>
                  <div className="anc-sub">Top 5 precision sessions across all workspaces</div>
               </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all" onClick={() => window.print()}>
               <Download size={14} />
               Export Intelligence
            </button>
          </div>
          
          <div className="p-0 overflow-hidden">
            <table className="an-premium-table">
              <thead>
                <tr>
                  <th>Neural Session</th>
                  <th>Workspace</th>
                  <th>Core Logic</th>
                  <th>Accuracy</th>
                  <th>Analyzed On</th>
                </tr>
              </thead>
              <tbody>
                {charts.leaderboard.map((item, i) => (
                  <tr key={i}>
                    <td className="w-1/3">
                      <div className="flex items-center gap-3">
                        <div className="rank-badge">0{i+1}</div>
                        <div className="flex flex-col">
                           <span className="text-white font-bold text-sm tracking-tight">{item.file}</span>
                           <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Dataset ID: {item.id ? item.id.slice(-6) : 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                       <span className="px-3 py-1 bg-white/5 rounded-full text-[11px] font-bold text-violet border border-violet/10">
                         {item.ws}
                       </span>
                    </td>
                    <td>
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
                          <span className="text-xs font-medium text-slate-300">{item.model}</span>
                       </div>
                    </td>
                    <td>
                       <div className="acc-glow-pill">
                          <span className="text-mint font-black">{item.acc}%</span>
                       </div>
                    </td>
                    <td className="text-slate-500 text-xs font-medium">{item.date}</td>
                  </tr>
                ))}
                {!charts.leaderboard.length && (
                  <tr><td colSpan="5" className="text-center py-20 text-slate-500 font-syne italic">No analytical data available for ranking.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
