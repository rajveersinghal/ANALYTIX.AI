import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  UploadCloud, 
  LayoutGrid, 
  ListFilter, 
  ArrowUpRight, 
  Sparkles,
  Database,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { apiClient } from '../../api/api';
import KpiCard from '../../components/dashboard/KpiCard';
import RunsTable from '../../components/dashboard/RunsTable';
import { CardSkeleton, TableSkeleton, EmptyState } from '../../components/common/Feedback';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalRuns: 0,
    successRate: 0,
    avgAccuracy: 0,
    storage: "0 GB"
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiClient.fetchHistory();
        setSessions(data || []);
        
        // Calculate dynamic stats
        if (data && data.length > 0) {
          const completed = data.filter(s => s.status === 'completed');
          const avgAcc = completed.reduce((acc, curr) => acc + (parseFloat(curr.accuracy) || 0), 0) / (completed.length || 1);
          const totalSize = data.reduce((acc, curr) => acc + (parseFloat(curr.rows) || 0), 0);
          
          setStats({
            totalRuns: data.length,
            successRate: ((completed.length / data.length) * 100).toFixed(1),
            avgAccuracy: avgAcc.toFixed(1),
            storage: totalSize > 1000 ? `${(totalSize / 1000).toFixed(1)}M Rows` : `${totalSize} Rows`
          });
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-12">
        <div className="flex justify-between items-end mb-10">
          <div className="space-y-2">
            <div className="h-8 w-48 skeleton" />
            <div className="h-4 w-64 skeleton" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[300px] skeleton" />
          <div className="h-[300px] skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Workspace Overview</h1>
          <p className="text-[15px] text-zinc-500 font-light">Monitor your autonomous analysis engine and neural workflows.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/app/upload')}
            className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 py-2.5"
          >
            <UploadCloud size={14} />
            <span className="text-[13px]">Ingest Data</span>
          </button>
          <button 
            onClick={() => navigate('/app/upload')}
            className="flex-1 md:flex-none btn-linear flex items-center justify-center gap-2 py-2.5"
          >
            <Plus size={14} />
            <span className="text-[13px]">Trigger Analysis</span>
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <KpiCard label="Total Neural Runs" value={stats.totalRuns} trend="+12%" trendType="positive" />
        <KpiCard label="Model Success" value={`${stats.successRate}%`} trend="+0.4%" trendType="positive" />
        <KpiCard label="Avg Inference" value={`${stats.avgAccuracy}%`} />
        <KpiCard label="Storage Scale" value={stats.storage} />
      </section>

      {/* Middle Row: Chart & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Activity Chart */}
        <div className="lg:col-span-2 card-linear p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Analysis Activity</h3>
              <p className="text-[11px] text-zinc-500">Inference volume over the last 7 days</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Previous</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Current</span>
              </div>
            </div>
          </div>
          
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessions.length > 0 ? sessions.slice(0, 7).map((s, i) => ({ name: `Run ${i+1}`, value: parseFloat(s.accuracy) || 0 })) : [ { name: 'Empty', value: 0 } ]}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#52525b', fontSize: 10}}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{backgroundColor: '#08090a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px'}}
                  itemStyle={{color: '#ffffff'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ffffff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Insights Column */}
        <div className="space-y-6">
          <div className="card-linear p-6 bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Sparkles size={16} />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Recent Discovery</h3>
            </div>
            <p className="text-[13px] text-zinc-400 leading-relaxed mb-4">
              {sessions.length > 0 
                ? `Detected a significant pattern in ${sessions[0].filename}. Analysis accuracy peaked at ${sessions[0].accuracy}.`
                : "No recent discoveries. Upload a dataset to start autonomous analysis."}
            </p>
            <button className="text-[11px] font-bold text-white hover:underline flex items-center gap-1">
              View full report <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="card-linear p-6 bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <Database size={16} />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Storage Health</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Capacity Used</span>
                <span className="text-white">{stats.totalRuns > 0 ? "Normal" : "0%"}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 rounded-full" style={{ width: stats.totalRuns > 0 ? '45%' : '0%' }} />
              </div>
              <p className="text-[10px] text-zinc-600">
                {stats.totalRuns > 0 
                  ? `Active indexing across ${stats.totalRuns} data objects.`
                  : "Standby mode. No data objects indexed."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table Section */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white tracking-tight">Neural Run History</h3>
            <span className="badge-linear bg-white/5 border-white/10 text-zinc-500">
              {sessions.filter(s => s.status === 'running').length} Active
            </span>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-2 text-zinc-500 hover:text-white cursor-pointer transition-colors">
              <Search size={14} />
              <span className="text-[12px] font-medium tracking-tight">Search runs</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 hover:text-white cursor-pointer transition-colors">
              <ListFilter size={14} />
              <span className="text-[12px] font-medium tracking-tight">Filters</span>
            </div>
            <button 
              onClick={() => navigate('/app/archive')}
              className="text-[11px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
            >
              Archive
            </button>
          </div>
        </div>
        {sessions.length > 0 ? (
          <RunsTable runs={sessions} />
        ) : (
          <EmptyState 
            title="No neural runs yet" 
            message="Upload a dataset to see your first autonomous analysis run." 
            action={() => navigate('/app/upload')}
            actionText="Start Analysis"
          />
        )}
      </section>
    </div>
  );
}
