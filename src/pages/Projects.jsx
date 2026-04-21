import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../components/ui/Skeleton";
import { 
  Plus, 
  Search, 
  Trash2, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  FileText, 
  LayoutGrid,
  List,
  ChevronRight,
  MoreVertical,
  Database,
  Clock,
  BarChart3,
  CheckCircle2
} from "lucide-react";

export default function Projects() {
  const { 
    workspaces, setWorkspaces, addWorkspace, deleteWorkspace: delWorkspace,
    viewMode, setViewMode, filterMode, setFilterMode, sortMode, setSortMode,
    setProjectId, setSessionId, setStatus, setMetadata, setStep 
  } = useStore();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newWs, setNewWs] = useState({ name: "", desc: "" });
  const [selectedWs, setSelectedWs] = useState(null); // When Not Null, Show Workspace Detail View
  const [wsSessions, setWsSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [allHistory, setAllHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Load Projects
        const projData = await apiClient.fetchProjects();
        if (projData && Array.isArray(projData)) {
          const normalized = projData.map(p => ({
            id: p.id || p._id,
            name: p.name,
            desc: p.description || p.desc || "AI analysis workspace",
            sessions: p.sessions_count || 0,
            updated: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Just now",
            color: p.color || colors[Math.floor(Math.random() * colors.length)],
            bestAcc: p.best_accuracy ? `${(p.best_accuracy).toFixed(1)}%` : "—"
          }));
          setWorkspaces(normalized);
        }

        // 2. Load Global History for Stats & Activity
        const histData = await apiClient.fetchHistory();
        setAllHistory(histData || []);

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = {
    total: allHistory.length,
    avgAcc: allHistory.filter(s => s.accuracy).length > 0 
      ? (allHistory.reduce((acc, s) => acc + (s.accuracy || 0), 0) / allHistory.filter(s => s.accuracy).length).toFixed(1)
      : "0",
    active: allHistory.filter(s => s.status === 'running').length,
    dataSize: (allHistory.reduce((acc, s) => acc + (s.rows || 0), 0) / 1000).toFixed(1) + "k"
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const colors = ['violet', 'mint', 'amber', 'indigo'];
  const WS_COLORS = {
    violet: { bg:'var(--violet-g)', stroke:'#b0a0ff' },
    mint:   { bg:'var(--mint-g)',   stroke:'var(--mint)' },
    amber:  { bg:'rgba(245,166,35,.1)', stroke:'var(--amber)' },
    indigo: { bg:'rgba(79,140,255,.12)', stroke:'var(--indigo)' },
  };

  const filteredWorkspaces = workspaces
    .filter(ws => {
      const matchSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ws.desc.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterMode === 'active') return matchSearch && ws.sessions > 1; // Example logic
      if (filterMode === 'completed') return matchSearch && ws.sessions <= 1; // Example logic
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortMode === 'alpha') return a.name.localeCompare(b.name);
      if (sortMode === 'sessions') return b.sessions - a.sessions;
      return 0; // Default: Recent (as in store order)
    });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = await apiClient.createProject({
        name: newWs.name,
        description: newWs.desc
      });
      // Backend returns the new project
      const ws = {
        id: data.id || data._id,
        name: data.name,
        desc: data.description || data.desc || 'New workspace',
        sessions: 0,
        updated: 'just now',
        color: colors[workspaces.length % colors.length],
        bestAcc: '—'
      };
      addWorkspace(ws);
      setShowModal(false);
      setNewWs({ name: "", desc: "" });
    } catch (err) {
      console.error("Failed to create workspace:", err);
      alert("Error creating workspace. Please try again.");
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this workspace forever? This cannot be undone.")) {
      delWorkspace(id);
      if (selectedWs?.id === id) setSelectedWs(null);
    }
  };

  const openWorkspaceDetail = async (ws) => {
    setSelectedWs(ws);
    setProjectId(ws.id);
    try {
      setLoadingSessions(true);
      const sessions = await apiClient.fetchHistory(ws.id);
      setWsSessions(sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions for workspace:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const startAnalysis = (e, ws) => {
    e.stopPropagation();
    setProjectId(ws.id);
    navigate('/pipeline');
  };

  if (selectedWs) {
    return (
      <div className="view active">
        <div style={{ marginBottom: '20px' }}>
          <div className="breadcrumb">
            <span className="bc-link" onClick={() => setSelectedWs(null)}>Workspaces</span>
            <span className="bc-sep">›</span>
            <span className="bc-cur">{selectedWs.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <h1 className="ph-title text-2xl md:text-3xl">{selectedWs.name.split(' ').slice(0,-1).join(' ')}{' '}<span className="hl">{selectedWs.name.split(' ').pop()}</span></h1>
              <p className="ph-sub">{selectedWs.desc}</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="btn-secondary flex-1 sm:flex-none justify-center" onClick={(e) => handleDelete(e, selectedWs.id)}>
                <Trash2 size={13} strokeWidth={2.5} />
                Delete
              </button>
              <button className="btn-primary flex-1 sm:flex-none justify-center" onClick={(e) => startAnalysis(e, selectedWs)}>
                <Plus size={13} strokeWidth={2.5} />
                New Run
              </button>
            </div>
          </div>
        </div>

        <div className="ws-detail-header p-6 flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-white/2 border border-white/5 rounded-2xl mb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="ws-dh-icon shrink-0" style={{ background: WS_COLORS[selectedWs.color]?.bg, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Database size={20} stroke={WS_COLORS[selectedWs.color]?.stroke} />
            </div>
            <div>
              <div style={{ fontSize: '.76rem', color: 'var(--t3)', marginBottom: '2px' }}>Workspace</div>
              <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--t1)' }}>{selectedWs.name}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-8 w-full md:w-auto md:ml-auto">
            <div className="text-center sm:text-left">
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: 'var(--t1)' }}>{selectedWs.sessions}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--t3)' }}>Sessions</div>
            </div>
            <div className="text-center sm:text-left">
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: 'var(--mint)' }}>{selectedWs.bestAcc}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--t3)' }}>Best Accuracy</div>
            </div>
            <div className="text-center sm:text-left col-span-2 sm:col-span-1">
              <div style={{ fontSize: '.8rem', fontWeight: 500, color: 'var(--t2)' }}>{selectedWs.updated}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--t3)' }}>Last Run</div>
            </div>
          </div>
        </div>

        <div className="section-header">
          <div className="section-title">Sessions in this workspace</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingSessions ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="sess-card">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-3 w-1/2 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))
          ) : wsSessions.length > 0 ? (
            wsSessions.map(sess => (
              <div key={sess.id || sess._id} className="sess-card" onClick={() => navigate('/dashboard', { state: { sessionId: sess.id || sess._id } })}>
                <div className="sess-top">
                  <div className="sess-name">{sess.filename || sess.file_id}</div>
                  <span className={`badge ${sess.status === 'completed' ? 'b-done' : 'b-run'}`}>
                    {sess.status === 'completed' ? 'Done' : 'Running'}
                  </span>
                </div>
                <div className="sess-meta">
                  {new Date(sess.created_at).toLocaleDateString()} · {sess.best_model || "XGBoost"}
                </div>
                <div className="sess-stats">
                  <div className="sess-stat">
                    <strong>{sess.accuracy ? (sess.accuracy * 100).toFixed(1) : "—"}%</strong> accuracy
                  </div>
                  <div className="sess-stat">
                    <strong>{sess.rows || "—"}</strong> rows
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="sess-card" style={{ borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '100px', color: 'var(--t3)', cursor: 'pointer' }} onClick={(e) => startAnalysis(e, selectedWs)}>
              <Plus size={16} />
              <span style={{ fontSize: '.8rem', fontWeight: 500 }}>New Run</span>
            </div>
          )}

          {wsSessions.length > 0 && (
            <div className="sess-card" style={{ borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '100px', color: 'var(--t3)', cursor: 'pointer' }} onClick={(e) => startAnalysis(e, selectedWs)}>
              <Plus size={16} />
              <span style={{ fontSize: '.8rem', fontWeight: 500 }}>New Run</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="view active">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 md:mb-10">
        <div>
          <div className="ph-eye" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '.4rem' }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--mint)' }}></span>Dashboard
          </div>
          <h1 className="ph-title text-2xl md:text-3xl">{getGreeting()}, <span className="hl">{user?.full_name?.split(' ')[0] || 'Rajveer'}</span>.</h1>
          <p className="ph-sub">Here's what's happening across your workspaces.</p>
        </div>
        <button className="btn-primary w-full sm:w-auto justify-center" onClick={() => setShowModal(true)}>
          <Plus size={13} strokeWidth={2.5} />
          New Workspace
        </button>
      </div>

      <div className="kpi-row mb-8">
        {[
          { label: "Total Runs", val: stats.total, sub: "↑ Live tracking" },
          { label: "Avg Accuracy", val: `${stats.avgAcc}%`, sub: "↑ Neural efficiency" },
          { label: "Active Sessions", val: stats.active, sub: "Syncing now" },
          { label: "Total Rows", val: stats.dataSize, sub: "↑ Neural throughput" }
        ].map((k, i) => (
          <div key={i} className="kpi">
            <div className="kpi-lbl">{k.label}</div>
            <div className="kpi-val">
              {loading ? <Skeleton className="h-6 w-20" /> : k.val}
            </div>
            <div className="kpi-sub">
              {loading ? <Skeleton className="h-3 w-24" /> : <span className="trend-up" style={{ padding: '1px 6px', borderRadius: '4px' }}>{k.sub.split(' ')[0]}</span>} {loading ? '' : k.sub.split(' ').slice(1).join(' ')}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="qa" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)', borderRadius: '12px', padding: '14px', cursor: 'pointer', display: 'flex', gap: '11px', alignItems: 'flex-start' }} onClick={() => navigate('/pipeline')}>
          <div className="qa-ico" style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--violet-g)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={15} stroke="#b0a0ff" /></div>
          <div><div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--t1)' }}>Upload Dataset</div><div style={{ fontSize: '.72rem', color: 'var(--t3)' }}>Start an AI pipeline run</div></div>
        </div>
        <div className="qa" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)', borderRadius: '12px', padding: '14px', cursor: 'pointer', display: 'flex', gap: '11px', alignItems: 'flex-start' }} onClick={() => navigate('/sales')}>
          <div className="qa-ico" style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--mint-g)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={15} stroke="var(--mint)" /></div>
          <div><div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--t1)' }}>Sales Intelligence</div><div style={{ fontSize: '.72rem', color: 'var(--t3)' }}>Revenue & forecast analysis</div></div>
        </div>
        <div className="qa" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)', borderRadius: '12px', padding: '14px', cursor: 'pointer', display: 'flex', gap: '11px', alignItems: 'flex-start' }} onClick={() => navigate('/reports')}>
          <div className="qa-ico" style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(245,166,35,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={15} stroke="var(--amber)" /></div>
          <div><div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--t1)' }}>View Reports</div><div style={{ fontSize: '.72rem', color: 'var(--t3)' }}>Browse past AI analyses</div></div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">Your Workspaces</div>
        <span className="section-action" onClick={() => navigate('/history')}>View all sessions →</span>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <Search size={13} style={{ color: 'var(--t3)', flexShrink: 0 }} />
          <input type="text" placeholder="Filter workspaces…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <span className={`chip ${filterMode === 'all' ? 'active' : ''}`} onClick={() => setFilterMode('all')}>All</span>
        <span className={`chip ${filterMode === 'active' ? 'active' : ''}`} onClick={() => setFilterMode('active')}>Active</span>
        <span className={`chip ${filterMode === 'completed' ? 'active' : ''}`} onClick={() => setFilterMode('completed')}>Completed</span>
        <div className="filter-right">
          <select className="sort-sel" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="alpha">A → Z</option>
            <option value="sessions">Most Sessions</option>
          </select>
          <div className="view-toggle">
            <button className={`vt-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <LayoutGrid size={12} />
            </button>
            <button className={`vt-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              <List size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'ws-grid' : 'ws-list'}>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className={`ws-card ${viewMode === 'list' ? 'list-mode' : ''}`}>
              <div className="wc-top">
                <Skeleton circle className="w-10 h-10" />
              </div>
              <div className="wc-mid">
                <Skeleton className="h-5 w-1/2 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="wc-footer">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))
        ) : filteredWorkspaces.length > 0 ? (
          filteredWorkspaces.map(ws => (
            <div key={ws.id} className={`ws-card ${viewMode === 'list' ? 'list-mode' : ''}`} onClick={() => openWorkspaceDetail(ws)}>
              <div className="wc-top">
                <div className="wc-icon" style={{ background: WS_COLORS[ws.color]?.bg, width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={16} stroke={WS_COLORS[ws.color]?.stroke} />
                </div>
                {viewMode === 'grid' && (
                  <div className="wc-menu" onClick={(e) => { e.stopPropagation(); /* TODO: Context Menu */ }}>
                    <MoreVertical size={14} />
                  </div>
                )}
              </div>
              <div className="wc-mid">
                <div className="wc-name" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '.9rem', color: 'var(--t1)', marginBottom: '3px' }}>{ws.name}</div>
                <div className="wc-desc" style={{ fontSize: '.75rem', color: 'var(--t3)', lineHeight: 1.5 }}>{ws.desc}</div>
              </div>
              <div className="wc-footer">
                <div className="wc-stats" style={{ display: 'flex', gap: '12px' }}>
                  <div className="wc-stat" style={{ fontSize: '.7rem', color: 'var(--t3)' }}><strong>{ws.sessions}</strong> sessions</div>
                  <div className="wc-stat" style={{ fontSize: '.7rem', color: 'var(--t3)' }}>{ws.updated}</div>
                  <div className="wc-stat" style={{ fontSize: '.7rem', color: 'var(--t3)' }}><strong>{ws.bestAcc}</strong></div>
                </div>
                <ArrowRight className="wc-arr" size={14} />
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center text-var(--t3)">No workspaces found matching filters.</div>
        )}
      </div>

      <div className="section-header" style={{ marginTop: '26px' }}>
        <div className="section-title">Recent Activity</div>
        <span className="section-action" onClick={() => navigate('/history')}>View all →</span>
      </div>
      <div className="activity-list">
        {allHistory.length > 0 ? allHistory.slice(0, 3).map(sess => (
          <div key={sess.id || sess._id} className="activity-item" onClick={() => navigate('/dashboard', { state: { sessionId: sess.id || sess._id } })}>
             <div className="act-icon" style={{ background: sess.status === 'completed' ? 'var(--mint-g)' : 'var(--violet-g)' }}>
                {sess.status === 'completed' ? <CheckCircle2 size={14} stroke="var(--mint)" /> : <Clock size={14} stroke="#b0a0ff" />}
             </div>
             <div className="act-main">
                <div className="act-name">{sess.filename || sess.file_id}</div>
                <div className="act-meta">{sess.best_model || "XGBoost"} · {sess.accuracy ? (sess.accuracy * 100).toFixed(1) + "% accuracy" : "Processing"} · {sess.rows || 0} rows</div>
             </div>
             <span className={`badge ${sess.status === 'completed' ? 'b-done' : 'b-run'}`}>
                {sess.status === 'completed' ? 'Completed' : 'Running'}
             </span>
          </div>
        )) : (
          <div className="activity-item" style={{ justifyContent: 'center', opacity: 0.5 }}>
             No recent activity. Start your first analysis in the Pipeline!
          </div>
        )}
      </div>

      {/* Workspace Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay open" onClick={(e) => e.target.className.includes('modal-overlay') && setShowModal(false)}>
            <motion.div 
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              className="modal"
            >
              <div className="modal-header">
                <div className="modal-title">Create Workspace</div>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <Plus size={13} style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Workspace Name</label>
                  <input required autoFocus className="form-input" placeholder="e.g. Q3 Sales Analysis" value={newWs.name} onChange={e => setNewWs({...newWs, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description <span style={{ color: 'var(--t3)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea className="form-input form-textarea" placeholder="What kind of data will you analyse here?" value={newWs.desc} onChange={e => setNewWs({...newWs, desc: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Quick Templates</label>
                  <div className="tpl-row">
                    {[
                      { name: 'Sales Intel', full: 'Sales Intelligence', desc: 'Monthly revenue, SKU velocity, regional breakdown' },
                      { name: 'Inventory', full: 'Inventory Analysis', desc: 'Stock levels, dead SKUs, reorder points' },
                      { name: 'Churn Model', full: 'Customer Churn', desc: 'Churn prediction, cohort retention, LTV analysis' },
                      { name: 'E-commerce', full: 'E-commerce Analytics', desc: 'Orders, GMV, category performance, returns' }
                    ].map(tpl => (
                      <span key={tpl.name} className="tpl" onClick={() => setNewWs({ name: tpl.full, desc: tpl.desc })}>{tpl.name}</span>
                    ))}
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-create">Create Workspace</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
