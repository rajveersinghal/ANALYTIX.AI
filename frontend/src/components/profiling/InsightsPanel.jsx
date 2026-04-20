import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function InsightsPanel({ insights }) {
  // Process insights if they are in a summary string or array
  const insightList = Array.isArray(insights) ? insights : (typeof insights === 'string' ? insights.split('\n').filter(l => l.trim()) : []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="glass p-8 rounded-3xl border-white/5 h-full flex flex-col justify-between"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
           <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center p-2 text-primary animate-pulse">
             <Sparkles size={20} />
           </div>
           <div>
             <h3 className="text-xl font-bold text-white tracking-wide uppercase">AI Insights</h3>
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Data Intelligence Engine</p>
           </div>
        </div>

        <div className="space-y-4">
          {insightList.map((insight, i) => (
            <motion.div key={i} variants={item} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-default group">
              <div className="mt-1">
                 {insight.toLowerCase().includes("missing") || insight.toLowerCase().includes("outlier") ? (
                   <AlertTriangle className="text-amber-500" size={18} />
                 ) : (
                   <CheckCircle2 className="text-primary" size={18} />
                 )}
              </div>
              <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                {insight.replace(/^[•*\-\s]+/, '')}
              </p>
            </motion.div>
          ))}

          {insightList.length === 0 && (
             <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                <ShieldCheck size={48} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest leading-loose">Analyzing metadata for <br /> strategic patterns...</p>
             </div>
          )}
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
         <span>Context: {insightList.length > 3 ? "Deep Analysis" : "Core Scanning"}</span>
         <span className="text-primary italic animate-pulse">Live</span>
      </div>
    </motion.div>
  );
}
