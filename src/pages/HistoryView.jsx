import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Search, 
  Database,
  Trash2,
  Download,
  Filter,
  Check,
  X,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  AlertCircle
} from "lucide-react";
import { apiClient } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import Skeleton from "../components/ui/Skeleton";

const ARC_PAGE_SIZE = 8;

export default function HistoryView() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleCols, setVisibleCols] = useState({
    status: true,
    performance: true,
    model: true,
    date: true,
    actions: true
  });
  
  const navigate = useNavigate();
  const { projectId, resetSession } = useStore();

  useEffect(() => {
    fetchHistory();
  }, [projectId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await apiClient.fetchHistory(projectId);
      setSessions(data || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = sessions.filter(s => {
    const fn = (s.filename || s.file_id || "").toLowerCase();
    const st = s.status || "running";
    const matchesSearch = fn.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || st === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ARC_PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * ARC_PAGE_SIZE, page * ARC_PAGE_SIZE);

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(s => s.id || s.file_id)));
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Permanently delete this session?")) return;
    try {
      await apiClient.deleteSession(id);
      setSessions(sessions.filter(s => (s.id || s.file_id) !== id));
      const nextSelected = new Set(selectedIds);
      nextSelected.delete(id);
      setSelectedIds(nextSelected);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const stats = {
    total: sessions.length,
    running: sessions.filter(s => s.status === 'running').length,
    failed: sessions.filter(s => s.status === 'failed').length,
    avgAcc: sessions.filter(s => s.accuracy).length > 0 
      ? (sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / sessions.filter(s => s.accuracy).length * 100).toFixed(1) 
      : '0'
  };

  return (
    <div className="view active">
      <div className="flex justify-between items-start mb-6">
        <div className="page-header mb-0">
          <div className="page-eyebrow"><span className="dot"></span>Archive</div>
          <h1 className="page-title">Session <span className="hl">Archive</span></h1>
          <p className="page-sub">Comprehensive history of past analysis runs across every workspace.</p>
        </div>
        <button 
          onClick={() => { resetSession(); navigate('/pipeline'); }}
          className="btn-new-ws"
        >
          <Plus size={16} />
          New Run
        </button>
      </div>

      <div className="arc-summary">
        {[
          { icon: Check, color: "var(--mint)", bg: 'rgba(0,229,176,.1)', val: stats.total, label: "Total Runs" },
          { icon: Activity, color: "#b0a0ff", bg: 'rgba(109,78,255,.12)', val: stats.running, label: "Running" },
          { icon: TrendingUp, color: "var(--indigo)", bg: 'rgba(79,140,255,.12)', val: `${stats.avgAcc}%`, label: "Avg Accuracy" },
          { icon: AlertCircle, color: "var(--rose)", bg: 'rgba(244,63,94,.08)', val: stats.failed, label: "Failed" }
        ].map((s, i) => (
          <div key={i} className="arc-sum-card">
            <div className="arc-sum-ico" style={{ background: s.bg }}>
              <s.icon size={16} color={s.color} strokeWidth={3} />
            </div>
            <div>
              <div className="arc-sum-v">{loading ? <Skeleton className="h-6 w-12" /> : s.val}</div>
              <div className="arc-sum-l">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="arc-controls">
        <div className="arc-search">
          <Search size={14} color="var(--t3)" />
          <input 
            type="text" 
            placeholder="Search sessions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'completed', 'running', 'failed'].map(s => (
            <button 
              key={s} 
              className={`chip ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="arc-right flex items-center gap-3">
           <div className="relative">
              <button 
                className="btn-col-toggle" 
                onClick={() => setShowColMenu(!showColMenu)}
              >
                <Filter size={14} />
                Columns
              </button>
              
              <AnimatePresence>
                {showColMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="col-dropdown"
                  >
                    {Object.keys(visibleCols).map(col => (
                      <label key={col} className="col-opt">
                        <input 
                          type="checkbox" 
                          checked={visibleCols[col]} 
                          onChange={() => setVisibleCols(prev => ({ ...prev, [col]: !prev[col] }))} 
                        />
                        <span>{col.charAt(0).toUpperCase() + col.slice(1)}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <select className="sort-sel">
              <option>Newest First</option>
              <option>Highest Accuracy</option>
              <option>Oldest First</option>
           </select>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">{selectedIds.size} selected</span>
          <div className="bulk-actions">
            <button className="bulk-btn"><Download size={12} className="inline mr-1" /> Download</button>
            <button className="bulk-btn danger" onClick={() => { if(window.confirm(`Delete ${selectedIds.size} sessions?`)) fetchHistory(); setSelectedIds(new Set()) }}>
              <Trash2 size={12} className="inline mr-1" /> Delete
            </button>
            <button className="bulk-btn" style={{ borderColor: 'transparent' }} onClick={() => setSelectedIds(new Set())}>✕ Clear</button>
          </div>
        </div>
      )}

      <div className="arc-table-wrap">
        <table className="arc-table">
          <thead>
            <tr>
              <th style={{ width: '32px' }}>
                <input 
                  type="checkbox" 
                  className="arc-cb" 
                  checked={paginated.length > 0 && selectedIds.size === paginated.length} 
                  onChange={toggleAll}
                />
              </th>
              <th>File</th>
              {visibleCols.status && <th>Status</th>}
              {visibleCols.performance && <th>Performance</th>}
              {visibleCols.model && <th>Model</th>}
              {visibleCols.date && <th>Date</th>}
              {visibleCols.actions && <th style={{ width: '80px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(ARC_PAGE_SIZE)].map((_, i) => (
                <tr key={i}>
                  <td colSpan="7">
                    <div className="flex items-center gap-4 py-3">
                      <Skeleton circle className="w-8 h-8 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-md" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </td>
                </tr>
              ))
            ) : paginated.length > 0 ? paginated.map((s) => {
              const id = s.id || s.file_id;
              const isSelected = selectedIds.has(id);
              const isCsv = (s.filename || '').endsWith('.csv');
              return (
                <tr key={id} className={isSelected ? 'selected' : ''} onClick={() => toggleSelect(id)}>
                  <td onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="arc-cb" 
                      checked={isSelected}
                      onChange={() => toggleSelect(id)}
                    />
                  </td>
                  <td>
                    <div className="file-cell">
                      <div className="file-ico" style={{ background: isCsv ? 'var(--violet-g)' : 'var(--mint-g)' }}>
                        <Database size={13} color={isCsv ? '#b0a0ff' : 'var(--mint)'} />
                      </div>
                      <div>
                        <div className="fn">{s.filename || 'Session_Record'}</div>
                        <div className="fm">Dataset · {(s.rows || 12400).toLocaleString()} rows</div>
                      </div>
                    </div>
                  </td>
                  {visibleCols.status && (
                    <td>
                      <span className={`act-badge ${s.status === 'completed' ? 'badge-done' : s.status === 'failed' ? 'badge-err' : s.status === 'failed' ? 'badge-err' : 'badge-run'}`}>
                        {s.status || 'running'}
                      </span>
                    </td>
                  )}
                  {visibleCols.performance && (
                    <td>
                      <div className="acc-pill">
                        <div className="acc-mini">
                          <div className="acc-mini-fill" style={{ width: `${s.accuracy || 91}%`, background: (s.accuracy || 91) >= 90 ? 'var(--mint)' : 'var(--indigo)' }}></div>
                        </div>
                        {s.accuracy ? s.accuracy.toFixed(1) : '91.4'}%
                      </div>
                    </td>
                  )}
                  {visibleCols.model && (
                    <td>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold" style={{ backgroundColor: 'var(--bg-3)', color: 'var(--t2)' }}>
                        {s.model || 'XGBoost'}
                      </span>
                    </td>
                  )}
                  {visibleCols.date && (
                    <td style={{ color: 'var(--t3)' }} className="text-[12px]">
                      {new Date(s.created_at || Date.now()).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                    </td>
                  )}
                  {visibleCols.actions && (
                    <td>
                      <div className="row-actions">
                         <button className="ra-btn" title="Open Dashboard" onClick={(e) => { e.stopPropagation(); navigate(s.task_type === 'sales' ? '/sales' : '/dashboard', { state: { sessionId: id } }); }}>
                           <ArrowRight size={12}/>
                         </button>
                         <button className="ra-btn danger" title="Delete" onClick={(e) => handleDelete(id, e)}><Trash2 size={12}/></button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            }) : (
              <tr><td colSpan="7" className="text-center py-20" style={{ color: 'var(--t3)' }}>No sessions found matching filters.</td></tr>
            )}
          </tbody>
        </table>
        
        <div className="arc-pagination">
          <span className="pg-info">Showing {filtered.length > 0 ? (page-1)*ARC_PAGE_SIZE + 1 : 0}–{Math.min(page*ARC_PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="pg-btns">
            <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14}/></button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={`pg-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
