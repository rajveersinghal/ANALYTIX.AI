import { motion, AnimatePresence } from "framer-motion";
import { Zap, Loader2, Search, Database, BarChart2, ShieldCheck, Activity, Rocket, FileCheck, Check } from "lucide-react";

const details = [
  { 
    title: "Data Ingestion", 
    desc: "Why: To establish a high-fidelity data bridge and validate structural integrity before downstream processing.", 
    icon: <Database className="text-blue-400" />,
    diagnostics: ["Schema Validation", "Type Inference", "Load Balancing"],
    narrative: "Initial parsing complete. We have successfully mapped 100% of your source columns with a 99.8% schema alignment, ensuring a zero-loss transfer for the next analytical stage."
  },
  { 
    title: "Data Cleaning", 
    desc: "Why: To resolve statistical noise and address sparsity through multi-stage heuristic imputation algorithms.", 
    icon: <Search className="text-secondary" />,
    diagnostics: ["Outlier Detection", "Null Imputation", "Deduplication"],
    narrative: "Sanitization finalized. I have resolved 4,280 missing data points and normalized your numeric distributions, increasing our usable feature space by 12.4%."
  },
  { 
    title: "EDA Analysis", 
    desc: "Why: To uncover multivariate correlations and identify latent patterns through deep statistical profiling.", 
    icon: <BarChart2 className="text-purple-400" />,
    diagnostics: ["Correlation Matrix", "Distribution Check", "Variance Mapping"],
    narrative: "Pattern discovery active. We've detected a significant 0.84 correlation between 'User Activity' and 'Retention', suggesting a primary leverage point for your Q3 growth."
  },
  { 
    title: "Validation", 
    desc: "Why: To ensure model generalizability and prevent overfitting through rigorous cross-validation testing.", 
    icon: <Activity className="text-green-400" />,
    diagnostics: ["K-Fold Validation", "Bias Detection", "Score Stability"],
    narrative: "Statistical audit passed. Our 5-fold cross-validation confirms that the trends found are 96.5% stable across different data segments, making them highly reliable."
  },
  { 
    title: "Model Training", 
    desc: "Why: To deploy parallel neural architectures that decode complex interactions within your specific dataset.", 
    icon: <ShieldCheck className="text-indigo-400" />,
    diagnostics: ["Weights Training", "Loss Minimization", "Epoch Iteration"],
    narrative: "Neural training optimized. After 150 training iterations across 4 algorithms, we have achieved a peak R-Squared of 0.92, indicating extremely high predictive power."
  },
  { 
    title: "Model Tuning", 
    desc: "Why: To perform Bayesian optimization and hyperparameter refinement for peak predictive performance.", 
    icon: <Zap className="text-blue-500 animate-pulse" />,
    diagnostics: ["Hyper-Parameters", "Grid Searching", "Loss Convergence"],
    narrative: "Fine-tuning finalized. By optimizing the learning rate and tree depth, we've achieved a further 3.2% gain in 'How sure we are', reaching a final score of 99.4%."
  },
  { 
    title: "Explainability (XAI)", 
    desc: "Why: To decompose the model's 'black box' and reveal the SHAP attribution driving every business outcome.", 
    icon: <ShieldCheck className="text-emerald-400" />,
    diagnostics: ["SHAP Importance", "Feature Impact", "Decision Logic"],
    narrative: "SHAP decomposition complete. The model identifies 'Regional Pricing' as the top influence factor, accounting for 42% of the total variance in your sales outcomes."
  },
  { 
    title: "Final Reporting", 
    desc: "Why: To synthesize high-dimensional findings into an executive-grade strategic plan for immediate deployment.", 
    icon: <FileCheck className="text-green-500" />,
    diagnostics: ["PDF Synthesis", "Strategic Vision", "Metric Highlights"],
    narrative: "Executive intelligence ready. We have synthesized 1.4 million data points into 5 strategic actions. Your business is now backed by evidence-based neural logic."
  },
];

export default function StepDetails({ currentStep }) {
  const step = details[currentStep] || details[0];

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card-glass p-6 md:p-10 rounded-[2rem] border-white/5 relative overflow-hidden shadow-2xl min-h-[450px] flex flex-col"
    >
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 md:mb-12 gap-6">
        <div className="flex items-center gap-4 md:gap-5">
           <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary shadow-inner shrink-0">
             {step.icon}
           </div>
           <div className="min-w-0">
             <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase leading-tight truncate">{step.title}</h3>
             <p className="text-[9px] text-primary/60 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
               Neural Trace Active
             </p>
           </div>
        </div>
        
        {/* Step Micro-Stats */}
        <div className="flex gap-4 md:gap-6 bg-white/[0.02] p-3 rounded-xl border border-white/5 self-start md:self-auto">
           <div className="text-right">
              <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Speed</p>
              <p className="text-[13px] text-white font-mono font-bold">1.2<span className="text-[9px] text-gray-500 ml-0.5">s</span></p>
           </div>
           <div className="text-right border-l border-white/10 pl-4 md:pl-6">
              <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">How sure we are</p>
              <p className="text-[13px] text-emerald-400 font-mono font-bold">99.4<span className="text-[9px] text-gray-400 ml-0.5">%</span></p>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 flex-1">
        {/* Top Section: Strategy and Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4 min-w-0">
             <h4 className="text-[10px] text-primary font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Search size={12} /> Strategy: Why we do this
             </h4>
             <p className="text-gray-400 font-medium leading-[1.6] text-[13px]">
                {step.desc}
             </p>
          </div>

          <div className="space-y-3">
             <h4 className="text-[10px] text-primary font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Database size={12} /> Simple Checks
             </h4>
             <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
                {step.diagnostics.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[10px] text-gray-300 font-bold transition-all hover:bg-white/[0.06] shadow-sm overflow-hidden">
                    <div className="w-4 h-4 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                       <Check size={8} className="text-primary" /> 
                    </div>
                    <span className="truncate">{item}</span>
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* Bottom Section: AI Narrative - Full Width for breathing room */}
        <div className="bg-primary/5 rounded-[1.5rem] p-6 md:p-8 border border-primary/10 relative group overflow-hidden mt-0">
            <h4 className="text-[10px] text-primary font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-4">
               <Zap size={12} className="fill-primary" /> Simple Story
            </h4>
            <div className="relative z-10">
              <p className="text-[15px] md:text-[16px] text-white font-medium leading-[1.6] italic max-w-4xl">
                 "{step.narrative}"
              </p>
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className={`h-8 w-8 rounded-full border-2 border-[#0a0a0b] flex items-center justify-center text-[10px] font-black
                       ${i === 1 ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'}
                    `}>
                      {i === 1 ? 'A' : 'i'}
                    </div>
                  ))}
               </div>
               <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest cursor-pointer hover:text-white transition-all flex items-center gap-3 group">
                 <span>Explore Decision Journal</span>
                 <Rocket size={12} className="group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform text-primary" />
               </span>
            </div>

            {/* Background Decorative Mesh */}
            <div className="absolute top-0 right-0 h-48 w-48 bg-primary/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 h-32 w-32 bg-blue-500/5 blur-[80px] rounded-full" />
        </div>
      </div>

      {/* No permanent loader to avoid confusion */}
    </motion.div>
  );
}
