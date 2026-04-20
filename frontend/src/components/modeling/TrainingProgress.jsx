import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Circle, Zap } from "lucide-react";

export default function TrainingProgress({ pipelineState }) {
  const steps = [
    { id: "routing", label: "Model Selection" },
    { id: "modeling", label: "Neural Training" },
    { id: "tuning", label: "Hyper-Parameter Optimization" }
  ];

  const currentStepIdx = steps.findIndex(s => pipelineState[s.id] === "running");
  const displayIdx = currentStepIdx === -1 
    ? (steps.findLastIndex(s => pipelineState[s.id] === "completed") + 1)
    : currentStepIdx;

  const totalSteps = steps.length;
  const progressPercent = (displayIdx / totalSteps) * 100;

  return (
    <div className="glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden group shadow-2xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Progress Text */}
        <div className="max-w-xs w-full text-center md:text-left space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
              <Zap size={12} fill="currentColor" /> Real-time Orchestration
           </div>
           <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Training <br /> <span className="text-primary">Continuum</span></h3>
           <p className="text-xs font-medium text-gray-500 leading-loose">
              Parallelizing candidate evaluation across multiple cross-validation folds.
           </p>
        </div>

        {/* Steps Visualizer */}
        <div className="flex-1 w-full relative">
           <div className="flex items-center justify-between gap-6 relative z-10 w-full px-4">
              {steps.map((step, index) => {
                 const isCompleted = pipelineState[step.id] === "completed";
                 const isActive = pipelineState[step.id] === "running";
                 const isPending = !isCompleted && !isActive;

                 return (
                    <div key={step.id} className="flex flex-col items-center gap-4 flex-1">
                       <motion.div 
                          animate={isActive ? { scale: [1, 1.2, 1], boxShadow: ["0 0 0px var(--primary)", "0 0 20px var(--primary)", "0 0 0px var(--primary)"] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700
                            ${isCompleted ? "bg-primary border-primary text-white" : isActive ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/10 text-gray-700"}
                          `}
                       >
                          {isCompleted ? <CheckCircle2 size={24} strokeWidth={3} /> : isActive ? <Loader2 size={24} className="animate-spin" /> : <Circle size={12} strokeWidth={3} />}
                       </motion.div>
                       <p className={`text-[9px] font-black uppercase tracking-widest text-center h-4 transition-colors duration-500 ${isActive ? "text-primary" : isCompleted ? "text-white" : "text-gray-700"}`}>
                          {step.label}
                       </p>
                    </div>
                 );
              })}
           </div>

           {/* Connector Line Base */}
           <div className="absolute top-6 left-12 right-12 h-0.5 bg-white/5 rounded-full -z-0" />
           {/* Active Line Fill */}
           <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="absolute top-6 left-12 h-0.5 bg-gradient-to-r from-primary to-blue-400 rounded-full origin-left -z-0" 
           />
        </div>

        {/* Big Progress Circle */}
        <div className="relative h-28 w-28 flex items-center justify-center">
           <svg className="h-full w-full rotate-[-90deg]">
              <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle 
                cx="56" cy="56" r="48" fill="none" stroke="var(--primary)" strokeWidth="8" 
                strokeDasharray="301.5"
                initial={{ strokeDashoffset: 301.5 }}
                animate={{ strokeDashoffset: 301.5 - (301.5 * progressPercent / 100) }}
                transition={{ duration: 1.5 }}
                strokeLinecap="round"
              />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white tracking-tighter">{Math.round(progressPercent)}%</span>
              <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">Global</span>
           </div>
        </div>
      </div>

      {/* Decorative Glow Background */}
      <div className="absolute top-0 right-0 h-full w-48 bg-gradient-to-l from-primary/5 to-transparent -z-10" />
    </div>
  );
}
