import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/api';
import {
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, BarChart, Bar, Cell, PieChart, Pie, ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  Cpu, Target, Database, Sparkles, AlertCircle, ArrowLeft, Download,
  ShieldCheck, Zap, Activity, Info, Eye, Layers, Brain, MessageSquare, TrendingUp,
  PieChart as PieChartIcon, ScatterChart as ScatterChartIcon
} from 'lucide-react';
import { CardSkeleton } from '../../components/common/Feedback';

const TOOLTIP_STYLE = { backgroundColor: '#08090a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px' };
const AXIS_STYLE = { stroke: '#52525b', fontSize: 10, tickLine: false, axisLine: false };

const StatCard = ({ label, value, sub, color = 'zinc' }) => (
  <div className="card-linear p-6 flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
    <div>
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-white tracking-tight">{value ?? '—'}</h3>
    </div>
    {sub && <p className="text-[11px] text-zinc-600 mt-2 font-medium">{sub}</p>}
  </div>
);

export default function Insights() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('job_id');

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [derived, setDerived] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchInsights(jobId);
    } else {
      apiClient.fetchHistory()
        .then(sessions => {
          if (sessions && sessions.length > 0) {
            const latest = sessions[0];
            const id = latest.dataset_id || latest.file_id || latest.id;
            if (id) {
              navigate(`/app/insights?job_id=${id}`, { replace: true });
            } else {
              setError("No completed analysis found. Please upload a dataset first.");
              setLoading(false);
            }
          } else {
            setError("No analysis sessions found. Please upload a dataset to get started.");
            setLoading(false);
          }
        })
        .catch(() => { setError("Could not load sessions. Please try again."); setLoading(false); });
    }
  }, [jobId]);

  const fetchInsights = async (id) => {
    setLoading(true);
    try {
      const s = await apiClient.fetchSessionDetails(id);
      setSession(s);

      const modeling = s.modeling_results || {};
      const leaderboard = modeling.leaderboard || [];
      const bestModel = modeling.best_model || {};
      const edaResults = s.eda_results || {};
      const edaPlots = edaResults.plot_data || {};
      const explainResults = s.explainability_results || {};
      const featureImportance = explainResults.global_explanation?.feature_importance || {};
      const cleaningActions = Array.isArray(s.cleaning_actions) ? s.cleaning_actions : [];
      const statsSummary = s.stats_summary || {};
      const decisionResults = s.decision_results || {};

      const extractNum = (str) => { const m = str?.match(/[\d,]+/); return m ? parseInt(m[0].replace(',','')) : 0; };
      const dupAction = cleaningActions.find(a => a.toLowerCase().includes('duplicate'));
      const imputeAction = cleaningActions.find(a => a.toLowerCase().includes('missing'));
      const outlierAction = cleaningActions.find(a => a.toLowerCase().includes('outlier') || a.toLowerCase().includes('capped'));

      const featureChartData = Object.entries(featureImportance)
        .map(([name, score]) => ({ name, score: parseFloat((score * 100).toFixed(1)) }))
        .sort((a, b) => b.score - a.score);

      const modelChartData = leaderboard.map(m => ({
        name: m.model || m.name || 'Model',
        score: parseFloat(((m.score || m.accuracy || 0) * 100).toFixed(1)),
        time: parseFloat((m.time || 0).toFixed(2))
      }));

      const corrMatrix = edaPlots.correlation_matrix || {};
      const target = s.target_column || 'price';
      const corrData = Object.entries(corrMatrix)
        .filter(([k]) => k !== target)
        .map(([name, vals]) => ({
          name,
          correlation: typeof vals === 'object' ? parseFloat((vals[target] || 0).toFixed(3)) : 0
        }))
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
        .slice(0, 8);

      const distributions = edaPlots.distributions || {};
      const firstDistKey = Object.keys(distributions)[0];
      const firstDist = firstDistKey ? (distributions[firstDistKey] || []) : (edaPlots.numerical_distribution || []);
      
      const distRaw = firstDist?.data || (Array.isArray(firstDist) ? firstDist : []);
      const distData = distRaw.slice(0, 20).map((v, i) => ({
        name: typeof v === 'object' ? (v.bin || v.label || String(i)) : String(i),
        value: typeof v === 'object' ? (v.count ?? v.value ?? 0) : Number(v)
      }));

      const compositions = edaPlots.compositions || {};
      const firstCatKey = Object.keys(compositions)[0];
      const pieData = firstCatKey ? compositions[firstCatKey] : [];

      const scatterData = edaPlots.scatter || [];
      const scatterMeta = edaPlots.scatter_meta || { x_label: 'Feature', y_label: 'Target' };

      const accuracy = bestModel.accuracy != null
        ? `${Number(bestModel.accuracy).toFixed(1)}%`
        : bestModel.mean_score != null
        ? `${(bestModel.mean_score * 100).toFixed(1)}%`
        : 'N/A';

      const sanitize = (text) => {
        if (Array.isArray(text)) return text.map(sanitize).join(' ');
        if (typeof text !== 'string') return text;
        return text.replace(/\*\*/g, '').replace(/__/g, '').replace(/`/g, '');
      };

      setDerived({
        bestModelName: bestModel.name || bestModel.model_name || 'AutoML Champion',
        accuracy,
        metric: (modeling.metric || 'r2').toUpperCase(),
        rows: s.rows || 0,
        cleanRows: s.clean_rows || s.rows || 0,
        columns: s.columns || 0,
        target,
        taskType: (s.task_type || s.problem_type || 'regression').toUpperCase(),
        qualityScore: s.data_quality_score || 0,
        cleaningActions,
        duplicatesRemoved: extractNum(dupAction),
        imputedValues: extractNum(imputeAction),
        outliersHandled: extractNum(outlierAction),
        featureChartData,
        modelChartData,
        corrData,
        distData,
        pieData,
        pieLabel: firstCatKey || 'Categories',
        scatterData,
        scatterMeta,
        edaInsights: (Array.isArray(edaResults.insights) ? edaResults.insights : []).map(sanitize),
        significant: Array.isArray(statsSummary.significant_features) ? statsSummary.significant_features : [],
        recommendations: (Array.isArray(decisionResults.recommendations) ? decisionResults.recommendations : []).map(r => ({
          title: sanitize(typeof r === 'object' ? r.title : r),
          rationale: sanitize(r.rationale),
          action: sanitize(r.action)
        })),
        risks: Array.isArray(decisionResults.risks) ? decisionResults.risks : [],
        narrative: Array.isArray(decisionResults.executive_narrative) 
          ? decisionResults.executive_narrative.map(sanitize).join(' ') 
          : sanitize(decisionResults.executive_narrative),
      });
      setLoading(false);
    } catch (err) {
      console.error('Insights fetch error:', err);
      setError('Failed to load insights. Please try again.');
      setLoading(false);
    }
  };

  const handleExport = async (format = 'pdf') => {
    try {
      const response = await apiClient.exportIntelligence(jobId, format);
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `AnalytixAI_Report_${jobId.slice(0,8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (loading) return (
    <div className="animate-fade-in space-y-12 py-4">
      <div className="flex justify-between items-center mb-10">
        <div className="h-8 w-64 skeleton" />
        <div className="h-10 w-32 skeleton rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-xl mx-auto py-24 text-center animate-fade-in">
      <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-8 text-white">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">Intelligence Fetch Failed</h3>
      <p className="text-zinc-500 text-sm mb-10 leading-relaxed">{error}</p>
      <button onClick={() => navigate('/app/dashboard')} className="btn-secondary px-8 py-2.5 text-xs">Back to Dashboard</button>
    </div>
  );

  if (!derived) return null;

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-5 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
        activeTab === id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
      }`}>
      <Icon size={14} />{label}
    </button>
  );

  return (
    <div className="animate-fade-in py-4 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <button onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest mb-4 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Workspace
          </button>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Analysis Insights</h1>
            <span className="badge-info">Neural Sync Complete</span>
          </div>
          <p className="text-sm text-zinc-500 font-mono">Session: {jobId?.slice(0, 8)} · {derived.taskType} · Target: <span className="text-zinc-300">{derived.target}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/app/chat?job_id=${jobId}`)} className="btn-secondary flex items-center gap-2">
            <MessageSquare size={14} /> Chat with Data
          </button>
          <button onClick={handleExport} className="btn-linear flex items-center gap-2">
            <Download size={14} /> Export
          </button>
        </div>
      </header>

      <div className="flex items-center border-b border-white/[0.05] mb-12 overflow-x-auto scrollbar-hide">
        <TabButton id="overview" label="Overview" icon={Activity} />
        <TabButton id="data" label="Data & Cleaning" icon={ShieldCheck} />
        <TabButton id="eda" label="Visual EDA" icon={Eye} />
        <TabButton id="models" label="Models & Eval" icon={Brain} />
        <TabButton id="shap" label="SHAP Explain" icon={Sparkles} />
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Best Model" value={derived.bestModelName} sub={`Metric: ${derived.metric}`} />
            <StatCard label="Score" value={derived.accuracy} sub="Model performance" />
            <StatCard label="Data Quality" value={`${derived.qualityScore}%`} sub="Health score" />
            <StatCard label="Dataset" value={`${derived.rows?.toLocaleString()} rows`} sub={`${derived.columns} features`} />
          </div>

          {derived.narrative && (
            <div className="card-linear p-8 border-white/10 bg-white/[0.01]">
              <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-white uppercase tracking-widest">
                <Brain size={12} className="text-zinc-400" /> Executive Narrative
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{derived.narrative}</p>
            </div>
          )}

          {derived.recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Strategic Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {derived.recommendations.slice(0, 4).map((r, i) => (
                  <div key={i} className="card-linear p-6">
                    <h4 className="text-sm font-bold text-white mb-2">{r.title || r}</h4>
                    {r.rationale && <p className="text-[12px] text-zinc-500 leading-relaxed">{r.rationale}</p>}
                    {r.action && <p className="text-[11px] text-white mt-3 font-medium">→ {r.action}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Original Rows" value={derived.rows?.toLocaleString()} />
            <StatCard label="After Cleaning" value={derived.cleanRows?.toLocaleString()} />
            <StatCard label="Duplicates Removed" value={derived.duplicatesRemoved?.toLocaleString()} />
            <StatCard label="Values Imputed" value={derived.imputedValues?.toLocaleString()} />
          </div>

          <div className="card-linear p-8">
            <h3 className="text-base font-bold text-white mb-6">Autonomous Cleaning Actions</h3>
            <div className="space-y-3">
              {derived.cleaningActions.length > 0 ? derived.cleaningActions.map((action, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 text-xs font-bold mt-0.5">{i+1}</div>
                  <p className="text-sm text-zinc-300">{action}</p>
                </div>
              )) : <p className="text-zinc-600 text-sm">No cleaning actions recorded.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'eda' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-linear p-6">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Target size={16} className="text-white" />
                Feature Correlation with Target ({derived.target})
              </h3>
              <p className="text-[11px] text-zinc-600 mb-6">Strength and direction of influence on the predicted outcome.</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={derived.corrData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <XAxis type="number" domain={[-1, 1]} {...AXIS_STYLE} tickFormatter={v => v.toFixed(1)} />
                  <YAxis dataKey="name" type="category" {...AXIS_STYLE} width={90} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <Bar dataKey="correlation" radius={[0, 4, 4, 0]} barSize={18}>
                    {derived.corrData.map((entry, i) => (
                      <Cell key={i} fill={entry.correlation >= 0 ? '#ffffff' : '#52525b'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card-linear p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <PieChartIcon size={16} className="text-white" />
                  {derived.pieLabel} Composition
                </h3>
                <p className="text-[11px] text-zinc-600 mb-6">Top categories by frequency.</p>
              </div>
              <div className="h-[240px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={derived.pieData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {derived.pieData.map((_, index) => {
                        const colors = ['#ffffff', '#818cf8', '#34d399', '#fb7185', '#fbbf24'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                  {derived.pieData.slice(0, 4).map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: ['#ffffff', '#818cf8', '#34d399', '#fb7185', '#fbbf24'][i % 5]}} />
                        <span className="text-zinc-400 truncate max-w-[120px]">{d.name}</span>
                      </div>
                      <span className="text-white font-mono">{d.value}</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-linear p-6">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <TrendingUp size={16} className="text-white" />
                Variable Distribution
              </h3>
              <p className="text-[11px] text-zinc-600 mb-6">Data density and spread for key numerical features.</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={derived.distData}>
                  <defs>
                    <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" {...AXIS_STYLE} />
                  <YAxis {...AXIS_STYLE} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="value" stroke="#818cf8" fill="url(#distGrad)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card-linear p-6">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <ScatterChartIcon size={16} className="text-white" />
                Predictor Relationship
              </h3>
              <p className="text-[11px] text-zinc-600 mb-6">Scatter analysis: {derived.scatterMeta.x_label} vs {derived.scatterMeta.y_label}.</p>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis type="number" dataKey="x" name={derived.scatterMeta.x_label} unit="" {...AXIS_STYLE} />
                  <YAxis type="number" dataKey="y" name={derived.scatterMeta.y_label} unit="" {...AXIS_STYLE} />
                  <ZAxis type="number" range={[60, 60]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={TOOLTIP_STYLE} />
                  <Scatter name="Data Points" data={derived.scatterData} fill="#34d399" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {derived.edaInsights.length > 0 && (
            <div className="card-linear p-8 bg-white/[0.01] border-white/10">
              <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Info size={12} className="text-zinc-400" /> Automated EDA Discoveries
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {derived.edaInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 text-[13px] text-zinc-400 leading-relaxed group">
                    <span className="text-white font-bold mt-0.5 group-hover:scale-125 transition-transform">•</span>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard label="Best Model" value={derived.bestModelName} />
            <StatCard label={derived.metric + ' Score'} value={derived.accuracy} sub="Higher is better" />
            <StatCard label="Models Evaluated" value={derived.modelChartData.length || 1} sub="AutoML leaderboard" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {derived.modelChartData.length > 0 && (
              <div className="card-linear p-6">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Layers size={16} className="text-white" />
                  Model Leaderboard
                </h3>
                <p className="text-[11px] text-zinc-600 mb-6">Score comparison across evaluated architectures.</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={derived.modelChartData} margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" {...AXIS_STYLE} />
                    <YAxis {...AXIS_STYLE} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Accuracy']} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={32}>
                      {derived.modelChartData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#ffffff' : '#27272a'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {derived.modelChartData.length > 0 && (
              <div className="card-linear p-6">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Activity size={16} className="text-white" />
                  Training Efficiency
                </h3>
                <p className="text-[11px] text-zinc-600 mb-6">Accuracy vs. Training Time (seconds).</p>
                <ResponsiveContainer width="100%" height={260}>
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis type="number" dataKey="time" name="Time" unit="s" {...AXIS_STYLE} />
                    <YAxis type="number" dataKey="score" name="Accuracy" unit="%" domain={[0, 100]} {...AXIS_STYLE} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={TOOLTIP_STYLE} />
                    <Scatter name="Models" data={derived.modelChartData} fill="#ffffff">
                      {derived.modelChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ffffff' : '#3f3f46'} fillOpacity={0.7} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card-linear overflow-hidden">
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-base font-bold text-white">Full Evaluation Results</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rank</th>
                  <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Model</th>
                  <th className="p-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{derived.metric} Score</th>
                  <th className="p-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Train Time</th>
                </tr>
              </thead>
              <tbody>
                {derived.modelChartData.map((m, i) => (
                  <tr key={i} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${i === 0 ? 'bg-white/[0.03]' : ''}`}>
                    <td className="p-4">
                      <span className={`text-[11px] font-bold ${i === 0 ? 'text-white' : 'text-zinc-600'}`}>#{i+1}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-white">{m.name}</span>
                      {i === 0 && <span className="ml-2 text-[9px] font-bold text-white bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Champion</span>}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-sm font-bold ${i === 0 ? 'text-white' : 'text-zinc-400'}`}>{m.score}%</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm text-zinc-500">{m.time}s</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'shap' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {derived.featureChartData.length > 0 ? (
            <>
              <div className="card-linear p-6">
                <h3 className="text-base font-bold text-white mb-1">Global Feature Importance</h3>
                <p className="text-[11px] text-zinc-600 mb-6">Contribution of each feature to model predictions (% of total importance)</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={derived.featureChartData} layout="vertical" margin={{ left: 20, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                    <XAxis type="number" {...AXIS_STYLE} tickFormatter={v => `${v}%`} />
                    <YAxis dataKey="name" type="category" {...AXIS_STYLE} width={100} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Importance']} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={22}>
                      {derived.featureChartData.map((_, i) => (
                        <Cell key={i} fill="#ffffff" fillOpacity={1 - i * 0.1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card-linear p-6">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info size={10} /> Interpretation Guide
                </h3>
                <p className="text-[14px] leading-relaxed text-zinc-200 whitespace-pre-wrap">
                  Features with higher importance scores have a stronger influence on the model's output. 
                  The top feature "{derived.featureChartData[0]?.name}" accounts for {derived.featureChartData[0]?.score}% of the model's decision-making — making it the most critical variable to monitor and optimize.
                </p>
              </div>
            </>
          ) : (
            <div className="card-linear p-12 text-center">
              <Sparkles size={32} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">SHAP explainability data not available for this session.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
