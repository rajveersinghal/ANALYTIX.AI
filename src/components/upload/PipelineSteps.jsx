import React from 'react';
import { CheckCircle2, Circle, Loader2, Sparkles } from 'lucide-react';

const STEPS = [
  { id: 'upload', label: 'Data Understanding' },
  { id: 'cleaning', label: 'Data Neural Cleaning' },
  { id: 'profiling', label: 'Neural Processing' },
  { id: 'eda', label: 'Visual EDA' },
  { id: 'statistics', label: 'Feature Engineering' },
  { id: 'modeling', label: 'Model Training' },
  { id: 'tuning', label: 'Model Evaluation' },
  { id: 'explain', label: 'SHAP Explainability' },
  { id: 'decision', label: 'Neural Logic' },
  { id: 'report', label: 'Report Generation' },
  { id: 'completed', label: 'Analysis Complete' }
];

export default function PipelineSteps({ currentStep, progress, status }) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full max-w-lg mx-auto relative">
      {/* Neural Pulse Background */}
      <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full opacity-50 animate-pulse" />
      
      <div className="relative space-y-6">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex || currentStep === 'completed';
          const isCurrent = idx === currentIndex && currentStep !== 'completed';
          
          return (
            <div key={step.id} className={`flex items-start gap-5 transition-all duration-700 ${isCurrent ? 'scale-[1.02]' : 'scale-100'}`}>
              <div className="flex flex-col items-center pt-1">
                <div className="relative">
                  {isCompleted ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full" />
                      <CheckCircle2 size={22} className="text-emerald-500 relative z-10" />
                    </div>
                  ) : isCurrent ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 blur-lg rounded-full animate-pulse" />
                      <Loader2 size={22} className="text-white animate-spin relative z-10" />
                    </div>
                  ) : (
                    <Circle size={22} className="text-zinc-800" />
                  )}
                </div>
                
                {idx < STEPS.length - 1 && (
                  <div className={`w-[2px] h-10 my-1 transition-colors duration-1000 ${isCompleted ? 'bg-emerald-500/40' : 'bg-zinc-900'}`} />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-semibold tracking-tight transition-colors duration-500 ${isCompleted ? 'text-zinc-400' : isCurrent ? 'text-white' : 'text-zinc-700'}`}>
                    {step.label}
                  </p>
                  {isCurrent && <Sparkles size={12} className="text-white animate-pulse" />}
                </div>

                {isCurrent && (
                  <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-700">
                    <div className="flex justify-between items-end">
                      <p className="text-[11px] text-zinc-500 font-mono italic leading-none">{status || 'Initializing neural engine...'}</p>
                      <span className="text-[10px] font-bold text-white font-mono">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
                      <div 
                        className="h-full bg-gradient-to-r from-zinc-600 to-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {isCompleted && (
                  <p className="text-[10px] text-emerald-500/60 font-medium">Successfully processed</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
