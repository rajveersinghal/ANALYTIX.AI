import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../store/useStore";
import { useSSE } from "../../hooks/useSSE";
import { useNavigate } from "react-router-dom";
import PipelineStep from "./PipelineStep";
import StepDetails from "./StepDetails";
import AIChatPanel from "./AIChatPanel";
import { Button } from "../ui/Button";
import { Rocket, Activity, Zap, Shield, BarChart, Database, FileText } from "lucide-react";

export default function PipelineView() {
  const { sessionId, setStatus, setStep, setMetadata, resetSession } = useStore();
  const [pipelineState, setPipelineState] = useState({});
  const [selectedStep, setSelectedStep] = useState(null);
  const navigate = useNavigate();

  const { data: sseData } = useSSE(sessionId);

  const steps = [
    "upload", "profiling", "cleaning", "eda", "statistics", 
    "routing", "modeling", "tuning", "explain", "decision", "report"
  ];

  useEffect(() => {
    if (!sseData) return;

    setPipelineState(sseData.pipeline_state || {});
    setMetadata(sseData);

    // Find current step index
    let activeIdx = 0;
    for (let i = 0; i < steps.length; i++) {
        const s = sseData.pipeline_state?.[steps[i]];
        if (s === "completed") {
            activeIdx = i + 1;
        } else if (s === "running") {
            activeIdx = i;
            break;
        }
    }
    setStep(activeIdx + 1);

    if (sseData.pipeline_state?.report === "completed") {
        setStatus("completed");
        navigate(`/dashboard/${sessionId}`);
    }
  }, [sseData, sessionId, setMetadata, setStep, setStatus, navigate]);

  const currentStepIdx = steps.findIndex(s => pipelineState[s] === "running");
  const displayIdx = currentStepIdx === -1 ? steps.findLastIndex(s => pipelineState[s] === "completed") : currentStepIdx;

  // Sync displayIdx with selectedStep if nothing is selected manually
  const activeEffectiveIdx = selectedStep !== null ? selectedStep : (displayIdx === -1 ? 0 : displayIdx);

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] w-full max-w-7xl mx-auto px-4 py-12 relative">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />

      {/* 1. Header Hero */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-float">
           <Activity size={12} /> Live Engine Orchestra
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
          Autonomous <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-300">Intelligence</span>
        </h2>
      </motion.div>

      {/* 2. Pipeline Progress Flow */}
      <div className="relative w-full overflow-x-auto pb-12 no-scrollbar">
        <div className="flex justify-between items-center gap-6 min-w-[1240px] px-10 relative">
          
          <div className="absolute top-6 left-16 right-16 h-1 bg-white/5 rounded-full -z-0" />
          
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: (displayIdx + 1) / steps.length }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-6 left-16 right-16 h-1 bg-gradient-to-r from-primary via-blue-500 to-cyan-400 rounded-full origin-left -z-0 glow-line shadow-[0_0_15px_#3b82f6]" 
          />

          {steps.map((step, index) => (
            <PipelineStep 
               key={step} 
               step={step} 
               index={index} 
               status={pipelineState[step]} 
               selected={activeEffectiveIdx === index}
               onClick={() => setSelectedStep(index)}
            />
          ))}
        </div>
      </div>

      {/* 3. Deep-Insights / Side Panels would go here or toggleable central view */}
      <div className="w-full flex flex-col md:flex-row gap-8 items-start mt-8">
        
        {/* Left: Interactive Details */}
        <div className="flex-1 w-full order-2 md:order-1">
          <AnimatePresence mode="wait">
            <StepDetails currentStep={activeEffectiveIdx} />
          </AnimatePresence>
        </div>

        {/* Right: AI Support Panel */}
        <div className="w-full md:w-80 order-1 md:order-2">
           <div className="glass p-6 rounded-[2rem] border-white/5 h-full min-h-[320px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <Shield size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Transparency Protocol</span>
                </div>
                <h5 className="text-white font-black text-sm uppercase leading-tight mb-2">Step Intelligence</h5>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Every decision made during the <span className="text-primary">{steps[activeEffectiveIdx]}</span> phase is backed by local variance analysis. Consult the Oracle for a detailed breakdown.
                </p>
                
                <div className="mt-6 space-y-2">
                   {["Why this model?", "Explain features", "Identify bias"].map(q => (
                     <div key={q} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[9px] text-gray-400 font-bold uppercase transition-colors hover:bg-white/10 cursor-pointer">
                        {q}
                     </div>
                   ))}
                </div>
              </div>
              
              <div className="mt-6">
                <AIChatPanel activeStepName={steps[activeEffectiveIdx]} />
              </div>
           </div>
        </div>
        
      </div>

      {/* 4. Controls */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 pt-8 border-t border-white/5 w-full max-w-sm flex justify-center"
      >
        <Button 
          variant="outline" 
          onClick={resetSession} 
          className="border-white/10 text-gray-500 hover:text-white hover:border-red-500/50 hover:bg-red-500/5 transition-all text-xs uppercase tracking-widest font-black rounded-full px-8"
        >
          Abort Mission <Rocket size={14} className="ml-2" />
        </Button>
      </motion.div>

    </div>
  );
}
