import { Card } from "../ui/Card";
import { CheckCircle2, AlertCircle, Database, BarChart2, Hash, Layers } from "lucide-react";
import { motion } from "framer-motion";

import { useStore } from "../../store/useStore";

export default function StatsCards() {
  const metadata = useStore((state) => state.metadata);
  
  const stats = [
    { 
      label: "Quality Score", 
      value: metadata?.data_quality_score ? `${metadata.data_quality_score}/100` : "Calculating...", 
      icon: <CheckCircle2 className="text-green-500" />, 
      sub: metadata?.data_quality_score > 80 ? "High Integrity" : "Requires Review" 
    },
    { 
      label: "Total Rows", 
      value: metadata?.rows?.toLocaleString() || metadata?.total_rows?.toLocaleString() || "Analyzing...", 
      icon: <Hash className="text-primary" />, 
      sub: "Ingested" 
    },
    { 
      label: "Task Identified", 
      value: metadata?.problem_type || "Detecting...", 
      icon: <Layers className="text-secondary" />, 
      sub: metadata?.possible_target_columns?.[0] ? `Target: ${metadata.possible_target_columns[0]}` : "Schema Mapping" 
    },
    { 
      label: "Optimized Models", 
      value: metadata?.model_performance ? Object.keys(metadata.model_performance).length : "0", 
      icon: <Database className="text-blue-400" />, 
      sub: "AutoML Mode" 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s, i) => (
        <motion.div
           key={i}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: i * 0.1 }}
        >
          <Card className="p-6 flex flex-col gap-4 border border-white/5 hover:border-primary/20 hover:bg-primary/5 cursor-default group">
            <div className="flex items-center justify-between">
               <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                  {s.icon}
               </div>
               <span className="text-[10px] font-black tracking-[0.1em] text-gray-500 uppercase">{s.label}</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white group-hover:text-primary transition-colors">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium italic opacity-60">{s.sub}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
