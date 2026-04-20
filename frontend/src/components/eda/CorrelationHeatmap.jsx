import React from "react";
import { motion } from "framer-motion";
import { GitMerge, Info } from "lucide-react";

export default function CorrelationHeatmap({ matrix }) {
  if (!matrix) return null;

  const features = Object.keys(matrix);
  const data = features.map(f1 => features.map(f2 => matrix[f1][f2]));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group shadow-2xl"
    >
      <div className="flex items-center justify-between mb-10">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 p-2 group-hover:scale-110 transition-transform">
              <GitMerge size={24} />
            </div>
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-widest leading-none">Correlation Heatmap</h3>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Multivariate dependencies</p>
            </div>
         </div>
         <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
            <Info size={14} />
         </div>
      </div>

      <div className="overflow-x-auto no-scrollbar pb-6 px-1 flex justify-center">
        <div 
          className="grid gap-1 w-full max-w-[800px]" 
          style={{ gridTemplateColumns: `repeat(${features.length + 1}, minmax(0, 1fr))` }}
        >
          {/* Header row */}
          <div className="h-12" />
          {features.map(f => (
            <div key={f} className="h-12 flex items-center justify-center text-[8px] font-black uppercase text-gray-500 truncate px-2 text-center leading-none">
              {f.slice(0, 10)}
            </div>
          ))}

          {/* Data rows */}
          {features.map((f1, i) => (
            <React.Fragment key={f1}>
              <div key={f1} className="h-12 flex items-center justify-end text-[8px] font-black uppercase text-gray-500 pr-4 truncate leading-none">
                {f1.slice(0, 10)}
              </div>
              {features.map((f2, j) => {
                const value = matrix[f1][f2];
                const intensity = Math.abs(value);
                const isPositive = value >= 0;
                
                return (
                  <motion.div
                    key={`${i}-${j}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (i * features.length + j) * 0.005 }}
                    className="h-12 rounded-lg flex items-center justify-center text-[10px] font-black relative group/cell cursor-default shadow-sm border border-white/5"
                    style={{
                      backgroundColor: isPositive 
                        ? `rgba(59, 130, 246, ${intensity * 0.8 + 0.05})` 
                        : `rgba(239, 68, 68, ${intensity * 0.8 + 0.05})`,
                      color: intensity > 0.4 ? "white" : "rgba(255,255,255,0.4)"
                    }}
                  >
                    {value.toFixed(2)}
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/cell:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-xl border border-white/10">
                       {f1} ↔ {f2}
                    </div>
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
         <div className="flex items-center gap-4">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-blue-500 opacity-80" /> Positive</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-red-500 opacity-80" /> Negative</span>
         </div>
         <p className="max-w-xs text-right italic font-medium opacity-50 lowercase tracking-normal">Stronger colors indicate more significant predictive relationships.</p>
      </div>
    </motion.div>
  );
}
