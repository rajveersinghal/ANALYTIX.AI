export default function PipelineStep({ step, index, status, selected, onClick }) {
  const isCompleted = status === "completed";
  const isActive = status === "running";
  const isPending = status === "pending" || !status;

  // Pretty Name mapping
  const labelMap = {
    upload: "Ingest",
    profiling: "Profiling",
    cleaning: "Clean",
    eda: "EDA",
    statistics: "Stats",
    routing: "Route",
    modeling: "Model",
    tuning: "Tuning",
    explain: "SHAP",
    decision: "Logic",
    report: "Final"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-3 relative z-10 min-w-[80px] cursor-pointer group transition-all duration-300
        ${selected ? "scale-110" : "hover:scale-105"}
      `}
    >
      {/* Node Circle */}
      <div className="relative">
        <motion.div
          animate={isActive ? { 
            scale: [1, 1.15, 1],
            boxShadow: [
              "0 0 0px var(--primary)",
              "0 0 20px var(--primary)",
              "0 0 0px var(--primary)"
            ]
          } : selected ? {
            boxShadow: "0 0 15px rgba(255,255,255,0.1)"
          } : {}}
          transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
          className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative
            ${isCompleted ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-500" : ""}
            ${isActive ? "bg-primary/20 border-primary text-primary" : ""}
            ${isPending ? "bg-white/5 border-white/10 text-gray-600" : ""}
            ${selected ? "!border-white !text-white z-20" : ""}
          `}
        >
          {isCompleted ? (
            <Check size={20} strokeWidth={3} />
          ) : isActive ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <span className="text-sm font-black">{index + 1}</span>
          )}
          
          {/* Subtle Outer Ring for Selected */}
          {selected && (
             <motion.div 
               layoutId="step-ring"
               className="absolute -inset-2 border border-white/20 rounded-full" 
             />
          )}
        </motion.div>

        {/* Active Indicator Glow */}
        {isActive && (
          <div className="absolute inset-0 rounded-full bg-primary/40 blur-xl animate-pulse -z-10" />
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <p className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500
          ${selected ? "text-white" : isActive ? "text-primary" : isCompleted ? "text-emerald-500/80" : "text-gray-600"}
        `}>
          {labelMap[step] || step}
        </p>
      </div>
    </motion.div>
  );
}
