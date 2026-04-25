import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/api';
import ArchiveTable from '../../components/archive/ArchiveTable';
import { Search, ListFilter, AlertCircle, ArrowLeft, RefreshCw, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TableSkeleton, EmptyState } from '../../components/common/Feedback';

export default function Archive() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.fetchHistory();
      setRuns(response || []);
    } catch (err) {
      setError("Synchronizing the neural archive failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent Deletion: This neural run and its insights will be purged. Confirm?")) return;
    try {
      await apiClient.deleteSession(id);
      setRuns(prev => prev.filter(run => run.id !== id));
    } catch (err) {
      alert("Purge failed. Inference fragments remain.");
    }
  };

  const filteredRuns = runs.filter(run => {
    const matchesSearch = run.filename?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          run.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in py-4 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <button 
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest mb-4 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Workspace
          </button>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Neural Archive</h1>
            <span className="badge-linear bg-white/5 border-white/10 text-zinc-500">{runs.length} Saved Runs</span>
          </div>
          <p className="text-sm text-zinc-500 font-light">Audit and manage historical inference results and datasets.</p>
        </div>
        
        <button 
          onClick={fetchHistory} 
          disabled={loading}
          className="btn-secondary flex items-center gap-2 px-6 py-2.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sync Archive
        </button>
      </header>

      {/* High-Fidelity Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="md:col-span-3 relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
          <input 
            type="text"
            placeholder="Search datasets, job IDs, or metadata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.04] transition-all"
          />
        </div>
        
        <div className="relative group">
          <ListFilter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-focus-within:text-white transition-colors" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-400 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.04] transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Inference Status</option>
            <option value="completed">Success</option>
            <option value="processing">Running</option>
            <option value="failed">Interrupted</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card-linear p-0 border-white/[0.05]">
          <TableSkeleton rows={8} />
        </div>
      ) : error ? (
        <div className="py-24 text-center animate-fade-in">
          <div className="w-16 h-16 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-rose-500">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Archive Sync Interrupted</h3>
          <p className="text-zinc-500 text-sm mb-10 leading-relaxed">{error}</p>
          <button onClick={fetchHistory} className="btn-linear px-8 py-2.5">Retry Synchronization</button>
        </div>
      ) : runs.length === 0 ? (
        <EmptyState 
          title="Archive is Empty"
          description="You haven't preserved any neural runs yet. Complete an analysis to see it here."
          icon={Database}
          action={{
            label: "Trigger First Run",
            onClick: () => navigate('/app/upload')
          }}
        />
      ) : (
        <div className="animate-fade-in">
          <ArchiveTable runs={filteredRuns} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
