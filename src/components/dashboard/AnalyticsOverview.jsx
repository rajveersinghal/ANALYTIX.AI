import StatsCards from "./StatsCards";
import DownloadCenter from "./DownloadCenter";
import { Card } from "../ui/Card";
import { motion } from "framer-motion";
import { PieChart, TrendingUp, Cpu, Lightbulb, Zap, ArrowRight, Share2, Clipboard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const mockData = [
  { name: 'Feature A', value: 45 },
  { name: 'Feature B', value: 30 },
  { name: 'Feature C', value: 15 },
  { name: 'Feature D', value: 10 },
];

const COLORS = ['#3B82F6', '#8B5CF6', '#22D3EE', '#F471B5'];

import { useStore } from "../../store/useStore";

export default function AnalyticsOverview() {
  const metadata = useStore((state) => state.metadata);
  
  // Real Insight Mapping
  const insights = [
    {
      title: "Data Quality Audit",
      desc: metadata?.summary || "Initial profiling complete. Quality score calculated based on missing values and outliers.",
      icon: <Zap className="text-blue-400" size={18} />
    },
    {
      title: "Task Orchestration",
      desc: `Detected ${metadata?.problem_type || 'Unknown'} task. Primary objective: Optimize for ${metadata?.possible_target_columns?.[0] || 'Target Identification'}.`,
      icon: <TrendingUp className="text-secondary" size={18} />
    },
    {
       title: "Autonomous Decision",
       desc: metadata?.logic_applied || "Applied standard preprocessing (encoding, scaling) and HistGradientBoosting for fast convergence.",
       icon: <Cpu className="text-purple-400" size={18} />
    }
  ];

  // Map features to chart data if available
  const chartData = metadata?.feature_importance 
    ? Object.entries(metadata.feature_importance).slice(0, 5).map(([name, value]) => ({ name, value }))
    : mockData;

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* 1. Stats Grid */}
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Key Insights Panel */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="p-8 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Lightbulb className="text-primary" /> Strategic Discovery
                 </h2>
                 <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Share2 size={18} /></button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Clipboard size={18} /></button>
                 </div>
              </div>
              
              <div className="space-y-6">
                 {insights.map((ins, i) => (
                    <InsightItem 
                      key={i}
                      title={ins.title} 
                      desc={ins.desc} 
                      icon={ins.icon}
                    />
                 ))}
              </div>

              <button className="mt-10 text-primary font-bold text-sm flex items-center gap-2 hover:translate-x-2 transition-transform">
                 View Detailed PDF Narrative <ArrowRight size={16} />
              </button>
           </Card>

           {/* Visualization Section */}
           <Card className="p-8 h-[400px]">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <PieChart className="text-secondary" /> Feature Impact Distribution
                 </h2>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#E5E7EB' }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </Card>
        </div>

        {/* 3. Action Center / Download */}
        <div className="space-y-8">
           <DownloadCenter />
           
           <Card className="p-6 bg-secondary/5 border-secondary/20">
              <h3 className="text-lg font-bold text-white mb-4">Strategic Next Steps</h3>
              <ul className="space-y-3">
                 <li className="flex items-start gap-2 text-xs text-gray-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-1 flex-shrink-0" />
                    Deploy model to production via API endpoint.
                 </li>
                 <li className="flex items-start gap-2 text-xs text-gray-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-1 flex-shrink-0" />
                    Review high-impact features with business leads.
                 </li>
              </ul>
           </Card>
        </div>

      </div>
    </div>
  );
}

function InsightItem({ title, desc, icon }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
       <div className="p-2.5 h-fit rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
          {icon}
       </div>
       <div>
          <h4 className="text-white font-bold mb-1 tracking-tight">{title}</h4>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">{desc}</p>
       </div>
    </div>
  );
}
