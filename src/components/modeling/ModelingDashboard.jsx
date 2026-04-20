import { motion, AnimatePresence } from "framer-motion";
import BestModelCard from "./BestModelCard";
import ModelLeaderboard from "./ModelLeaderboard";
import AccuracyChart from "./AccuracyChart";
import TrainingProgress from "./TrainingProgress";
import { Sparkles, Activity } from "lucide-react";

export default function ModelingDashboard({ metadata }) {
  const modelingResults = metadata?.modeling_results || {};
  const pipelineState = metadata?.pipeline_state || {};
  
  const bestModel = modelingResults.best_model || null;
  const leaderboard = modelingResults.leaderboard || [];
  
  const isModelingDone = pipelineState.modeling === "completed" || pipelineState.report === "completed";

  const container = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.3
      }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-16"
    >
      {/* 1. Header (Orchestration Progress) */}
      <div className="relative">
        <TrainingProgress pipelineState={pipelineState} />
        
        {/* Dynamic Badge for Training Completion */}
        {isModelingDone && (
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-4 -right-4 h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl flex items-center justify-center text-white border-4 border-[#09090b] z-20"
          >
             <Sparkles size={24} />
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isModelingDone && (
          <motion.div 
            key="modeling-done-results"
            className="space-y-16"
          >
            {/* 2. Champion Model (Hero section) */}
            <BestModelCard best={bestModel} />

            {/* 3. Performance Delta (Charts + List) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <AccuracyChart models={leaderboard} />
              <ModelLeaderboard models={leaderboard} bestName={bestModel?.name} />
            </div>

            {/* 4. Infrastructure Detail Footer */}
            <div className="flex items-center justify-center gap-10 py-6 border-y border-white/5 opacity-30 group cursor-default">
               <div className="flex items-center gap-2"><Activity size={12} className="text-primary" /> Multi-fold Validation: Active</div>
               <div className="flex items-center gap-2"><Activity size={12} className="text-secondary" /> Hyper-param Search: Global</div>
               <div className="flex items-center gap-2"><Activity size={12} className="text-yellow-500" /> GPU Acceleration: On</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
