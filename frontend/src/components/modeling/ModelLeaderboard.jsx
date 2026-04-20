import { motion } from "framer-motion";
import { ListOrdered, ChevronRight, Zap, Target } from "lucide-react";

export default function ModelLeaderboard({ models = [], bestName }) {
  // Sort models by accuracy descending (assuming score is 0-1)
  const sortedModels = [...models].sort((a, b) => b.score - a.score);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass p-8 rounded-[2.5rem] border-white/5 h-[450px] flex flex-col group overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 p-2 group-hover:scale-110 transition-transform">
              <ListOrdered size={24} />
            </div>
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-widest leading-none">Model Leaderboard</h3>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Cross-Validation Rankings</p>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        {sortedModels.map((m, i) => {
          const isBest = m.model === bestName;
          const scorePct = m.score <= 1.0 ? Math.round(m.score * 10000) / 100 : m.score;
          
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all group/row border
                ${isBest ? "bg-primary/10 border-primary/20 shadow-xl" : "bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10"}
              `}
            >
              <div className="flex items-center gap-4">
                 <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black shadow-inner
                   ${isBest ? "bg-primary text-white" : "bg-white/10 text-gray-400"}
                 `}>
                    #{i + 1}
                 </div>
                 <div>
                    <p className={`text-sm font-black uppercase tracking-widest transition-colors ${isBest ? "text-primary" : "text-white"}`}>
                      {m.model}
                    </p>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                       <Zap size={10} strokeWidth={3} /> {m.time || 0}s Latency
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className={`text-lg font-black tracking-tighter ${isBest ? "text-primary text-2xl" : "text-white opacity-80"}`}>
                       {scorePct}%
                    </p>
                    <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Weighted F1 / R²</p>
                 </div>
                 <ChevronRight className={`transition-transform duration-300 ${isBest ? "text-primary translate-x-1" : "text-gray-800"}`} size={16} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative Blur Background */}
      <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-orange-500/10 blur-[60px] rounded-full -z-10 group-hover:opacity-30 transition-opacity duration-1000" />
    </motion.div>
  );
}
