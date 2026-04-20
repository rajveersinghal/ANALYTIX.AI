import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2, MoreHorizontal } from "lucide-react";

export default function AuditLog({ logs }) {
  const logList = Array.isArray(logs) ? logs : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden"
    >
      <div className="flex items-center gap-4 mb-8">
         <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
           <ClipboardList size={20} />
         </div>
         <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Cleaning Audit Log</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transaction History</p>
         </div>
      </div>

      <div className="space-y-4 relative">
        {/* Vertical Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/5" />

        {logList.map((log, i) => (
          <motion.div key={i} variants={item} className="flex items-start gap-6 relative z-10">
            <div className="mt-1.5 h-[10px] w-[10px] rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] border-2 border-[#09090b]" />
            <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group">
               <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Transformation {i + 1}</span>
                  <CheckCircle2 size={12} className="text-blue-500/50" />
               </div>
               <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                 {log}
               </p>
            </div>
          </motion.div>
        ))}

        {logList.length === 0 && (
           <div className="py-10 text-center space-y-4 opacity-20">
              <MoreHorizontal className="mx-auto" size={32} />
              <p className="text-xs font-black uppercase tracking-[0.3em]">No transformations <br /> required</p>
           </div>
        )}
      </div>
    </motion.div>
  );
}
