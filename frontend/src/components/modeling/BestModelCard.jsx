import { motion } from "framer-motion";
import { Trophy, Award, Target, Zap } from "lucide-react";

export default function BestModelCard({ best }) {
  if (!best) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-10 rounded-[3rem] border-primary/30 relative overflow-hidden group shadow-[0_0_50px_rgba(59,130,246,0.15)]"
    >
      {/* Animated Background Pulse */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 -z-10 group-hover:opacity-30 transition-opacity duration-1000" />
      <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/20 blur-[100px] rounded-full animate-pulse" />

      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Trophy Icon */}
        <div className="relative">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-2xl scale-110">
             <Trophy size={48} strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-3 -right-3 h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white border-4 border-[#09090b] animate-bounce">
             <Award size={18} />
          </div>
        </div>

        {/* Text Details */}
        <div className="flex-1 text-center md:text-left space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
              <Zap size={12} fill="currentColor" /> Autonomous Selection
           </div>
           <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.4em]">Champion Foundation</h2>
           <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
             {best.name}
           </h1>
           <p className="text-gray-400 font-medium max-w-md">
             Selected via grid-search optimization as the most robust architecture for this specific dataset domain.
           </p>
        </div>

        {/* Score Radial (Simple version for card) */}
        <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-[2.5rem] border border-white/5 min-w-[140px]">
           <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Score Index</span>
           <span className="text-4xl font-black text-white">{best.accuracy}%</span>
           <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1.5 w-1.5 rounded-full ${i <= 5 ? "bg-primary shadow-[0_0_5px_#3b82f6]" : "bg-white/10"}`} />
              ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
}
