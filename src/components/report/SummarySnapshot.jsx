import React from "react";
import { motion } from "framer-motion";
import { Database, Layout, Target, Zap, CheckCircle2 } from "lucide-react";

export default function SummarySnapshot({ metadata }) {
  if (!metadata) return null;

  const datasetName = metadata.filename || "Untitled Analysis";
  const rows = metadata.rows || 0;
  const cols = metadata.columns || 0;
  const bestModel = metadata.modeling_results?.best_model?.name || "N/A";
  const accuracy = metadata.modeling_results?.best_model?.accuracy || 0;
  const problemType = metadata.problem_type || "General Analysis";

  const metrics = [
    { label: "Observations", value: rows.toLocaleString(), icon: Database, color: "text-blue-400" },
    { label: "Features", value: cols, icon: Layout, color: "text-purple-400" },
    { label: "Best Model", value: bestModel, icon: Zap, color: "text-yellow-400" },
    { label: "Accuracy/Score", value: `${accuracy}%`, icon: Target, color: "text-green-400" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative"
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 p-10 opacity-5 -z-10">
         <CheckCircle2 size={120} className="text-primary" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">{datasetName}</h3>
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2 italic">
             Executive Intelligence Summary • {problemType}
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl flex items-center gap-2">
           <CheckCircle2 size={16} className="text-primary" />
           <span className="text-[10px] font-black uppercase text-primary tracking-widest">Validation Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <motion.div 
            key={m.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/10 hover:border-white/10 transition-all duration-500"
          >
            <m.icon className={`mb-4 ${m.color}`} size={24} />
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{m.label}</p>
            <h4 className="text-xl font-black text-white truncate">{m.value}</h4>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
