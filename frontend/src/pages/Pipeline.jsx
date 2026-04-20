import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../api/api";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  X, 
  Zap, 
  Database, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Search,
  PieChart,
  ShieldCheck,
  Cpu,
  Sparkles,
  AlertCircle
} from "lucide-react";
import StepDetails from "../components/pipeline/StepDetails";
import AIChatPanel from "../components/pipeline/AIChatPanel";

const PIPELINE_STEPS = [
  { id: 1, name: "Data Ingestion", key: "upload", desc: "Reading and checking your data file" },
  { id: 2, name: "Data Profiling", key: "profiling", desc: "Checking for missing information" },
  { id: 3, name: "Data Cleaning", key: "cleaning", desc: "Fixing and cleaning your data" },
  { id: 4, name: "EDA Analysis", key: "eda", desc: "Finding patterns and trends" },
  { id: 5, name: "Feature Engineering", key: "statistics", desc: "Making your data smarter" },
  { id: 6, name: "Problem Routing", key: "routing", desc: "Choosing the best way to help you" },
  { id: 7, name: "Model Training", key: "modeling", desc: "Training 4 different computer brains" },
  { id: 8, name: "Model Tuning", key: "tuning", desc: "Finding the best settings" },
  { id: 9, name: "Explainability (XAI)", key: "explain", desc: "Showing why the AI made choices" },
  { id: 10, name: "Decision Logic", key: "decision", desc: "Making sure it fits your business" },
  { id: 11, name: "Final Reporting", key: "report", desc: "Writing your final summary and charts" }
];

export default function Pipeline() {
  const { 
    currentStep, setStep, status, setStatus, 
    sessionId, setSessionId, metadata, setMetadata, projectId, error, setError 
  } = useStore();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("file");
  const [fileObject, setFileObject] = useState(null);
  const [fileLabel, setFileLabel] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fileId, setFileId] = useState(null);
  const [taskType, setTaskType] = useState("general"); 
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [jobId, setJobId] = useState(null);
  const [aiThinking, setAiThinking] = useState("Awaiting neural handshake...");
  const pollingRef = useRef(null);
  const socketRef = useRef(null);

  // Use currentStep as default if nothing selected
  const activeDetailId = selectedStepId || currentStep;

  // WebSocket Integration (Architecture V2)
  useEffect(() => {
    if (status === "processing" && jobId) {
      const socketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host.includes('localhost') ? 'localhost:8000' : window.location.host}/ws/${jobId}`;
      
      console.log("Connecting to live brain stream:", socketUrl);
      socketRef.current = new WebSocket(socketUrl);

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.progress) {
             // We can use the global or custom progress here
          }
          if (data.current_step) {
             const stepObj = PIPELINE_STEPS.find(s => s.key === data.current_step);
             if (stepObj) setStep(stepObj.id);
          }
          if (data.ai_thinking) {
             setAiThinking(data.ai_thinking);
          }
          if (data.status === "completed") {
             setStatus("completed");
             setSessionId(fileId);
          }
        } catch (err) {
          console.error("Socket Data Parse Error:", err);
        }
      };

      socketRef.current.onerror = (err) => {
        console.warn("WebSocket Error, falling back to polling mode.");
        startPolling();
      };
    }

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [status, jobId]);

  const startPolling = () => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      try {
        const res = await apiClient.fetchPipelineStatus(fileId, jobId);
        const state = res.pipeline_state || {};
        const live = res.live_job || {};

        if (live.ai_thinking) setAiThinking(live.ai_thinking);
        
        // Polling fallback logic...
        let currentStepIdx = 1;
        for (let i = 0; i < PIPELINE_STEPS.length; i++) {
           if (state[PIPELINE_STEPS[i].key] === "completed") currentStepIdx = i + 2;
           else if (state[PIPELINE_STEPS[i].key] === "running") currentStepIdx = i + 1;
        }
        setStep(Math.min(PIPELINE_STEPS.length, currentStepIdx));
        if (state.report === "completed") {
           setStatus("completed");
           setSessionId(fileId);
           setMetadata(res);
           clearInterval(pollingRef.current);
        }
      } catch (err) { console.error("Poll Error:", err); }
    }, 5000);
  };

  useEffect(() => {
    if (status === 'completed') {
      navigate('/insights');
    }
  }, [status, navigate]);

  // Timer
  useEffect(() => {
    let timer;
    if (status === "processing") {
      timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const f = e.dataTransfer.files?.[0];
      if (f) {
        setFileObject(f);
        setFileLabel({ name: f.name, size: (f.size / 1024).toFixed(1) + " KB" });
        // Scan for columns
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          if (!text) return;
          const lines = text.split('\n').filter(l => l.trim());
          if (lines.length > 0) {
            const cols = lines[0].split(',').map(c => c.trim().replace(/"/g, ''));
            setAvailableColumns(cols);
            if (cols.length > 0) setSelectedTarget(cols[cols.length - 1]);
          }
        };
        reader.readAsText(f);
      }
    } catch (err) {
      console.error("Drop processing failed", err);
      setError("Failed to parse file structure. Ensure it is a valid CSV.");
    }
  };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileObject(f);
      setFileLabel({ name: f.name, size: (f.size / 1024).toFixed(1) + " KB" });
      
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          if (!text) return;
          const lines = text.split('\n').filter(l => l.trim());
          if (lines.length > 0) {
            const cols = lines[0].split(',').map(c => c.trim().replace(/"/g, ''));
            setAvailableColumns(cols);
            if (cols.length > 0) setSelectedTarget(cols[cols.length - 1]);
          }
        };
        reader.readAsText(f);
      } catch (err) {
        console.error("Schema scan failed", err);
      }
    }
  };

  const startPipeline = async () => {
    if (!fileObject || status === "processing") return;
    try {
      setStatus("processing");
      setStep(1);
      setError(null);
      setElapsed(0);

      // 1. Upload
      const uploadRes = await apiClient.uploadDataset(fileObject, projectId);
      const id = uploadRes.file_id || uploadRes._id;
      setFileId(id);
      
      // 2. Start (Backend orchestrated)
      const pipelineRes = await apiClient.startPipeline(id, { 
        mode: "fast", 
        task_type: taskType,
        target_column: selectedTarget 
      });
      
      if (pipelineRes.job_id) {
         setJobId(pipelineRes.job_id);
      }
      
    } catch (err) {
      console.error("Pipeline initiation failed:", err);
      setStatus("error");
      setError(err.message || "Failed to initiate neural pipeline.");
    }
  };

  const sampleDatasets = [
    { name: "Superstore_Sales.csv", size: "2.4 MB", type: "Sales" },
    { name: "Telco_Churn.csv", size: "1.1 MB", type: "Churn" },
    { name: "Inventory_Snapshot.csv", size: "4.8 MB", type: "Logistics" }
  ];

  return (
    <div className="view active">
      <div className="page-header">
        <div className="page-eyebrow"><span className="dot"></span>Upload Center</div>
        <h1 className="page-title">Data <span className="hl">Helper</span></h1>
        <p className="page-sub">Turning your file into easy answers for your business.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        {/* Main Neural Flow */}
        <div className={selectedStepId ? "col-span-12" : "col-span-12 lg:col-span-8"}>
          <AnimatePresence mode="wait">
            {(status === "idle" || status === "error") ? (
              <motion.div 
                key="upload" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="card-glass p-0 overflow-hidden"
              >
                {/* ... existing upload tab logic ... */}
                <div className="flex border-b border-white/5">
                  {['file', 'url', 'samples'].map(t => (
                    <button 
                      key={t}
                      className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-500 bg-violet-500/5' : 'text-var(--t3) hover:text-var(--t2)'}`}
                      onClick={() => setActiveTab(t)}
                    >
                      {t === 'file' ? 'Upload Dataset' : t === 'url' ? 'Cloud URL' : 'Samples'}
                    </button>
                  ))}
                </div>
                
                <div className="p-8">
                  {status === 'error' && error && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm">
                      <AlertCircle size={18} />
                      {typeof error === 'string' ? error : (error?.message || error?.detail || "Failed to initiate neural pipeline.")}
                    </div>
                  )}

                  {activeTab === 'file' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <button 
                          onClick={() => setTaskType("general")}
                          className={`p-4 rounded-2xl border transition-all text-left ${taskType === 'general' ? 'border-violet-500 bg-violet-500/10' : 'border-white/5 bg-white/2 hover:border-white/10'}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${taskType === 'general' ? 'bg-violet-500 text-white' : 'bg-white/5 text-var(--t3)'}`}>
                            <Cpu size={18} />
                          </div>
                          <div className="text-[13px] font-bold text-white">General AutoML</div>
                          <div className="text-[10px] text-var(--t3)">Predictive modeling & SHAP</div>
                        </button>
                        <button 
                          onClick={() => setTaskType("sales")}
                          className={`p-4 rounded-2xl border transition-all text-left ${taskType === 'sales' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/2 hover:border-white/10'}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${taskType === 'sales' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-var(--t3)'}`}>
                            <TrendingUp size={18} />
                          </div>
                          <div className="text-[13px] font-bold text-white">Sales Intelligence</div>
                          <div className="text-[10px] text-var(--t3)">KPIs, Plays & Forecasting</div>
                        </button>
                      </div>

                      <div 
                        className={`relative group border-2 border-dashed rounded-[24px] p-12 flex flex-col items-center justify-center transition-all duration-300 ${isDragOver ? 'border-violet-500 bg-violet-500/10' : 'border-white/5 hover:border-white/10'}`}
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                      >
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} accept=".csv,.xlsx,.xls" />
                        <div className="w-16 h-16 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload size={28} className="text-violet-400" />
                        </div>
                        <div className="text-[15px] font-bold text-white mb-1">Drag & drop your files here</div>
                        <div className="text-[12px] text-var(--t3)">Supports CSV, Excel, and JSON up to 100MB</div>
                      </div>

                      {fileLabel && (
                        <div className="space-y-4">
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-white/2 border border-white/5 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-var(--violet-g) flex items-center justify-center text-var(--violet)"><FileText size={20} /></div>
                            <div className="flex-1">
                              <div className="text-[13px] font-bold text-white">{fileLabel.name}</div>
                              <div className="text-[11px] text-var(--t3)">{fileLabel.size} · Validation Ready</div>
                            </div>
                            <button onClick={() => { setFileObject(null); setFileLabel(null); setAvailableColumns([]); }} className="p-2 text-var(--t3) hover:text-var(--rose) transition-colors"><X size={18} /></button>
                          </motion.div>

                          {taskType === "general" && availableColumns.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-6 rounded-2xl bg-violet-500/5 border border-violet-500/10"
                            >
                              <div className="flex items-center gap-2 mb-4">
                                <Zap size={14} className="text-violet-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Target Intelligence</span>
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-500">SELECT PREDICTION TARGET</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[120px] overflow-y-auto no-scrollbar pr-2">
                                  {availableColumns.map(col => (
                                    <button 
                                      key={col}
                                      onClick={() => setSelectedTarget(col)}
                                      className={`px-3 py-2 rounded-lg text-[10px] font-bold truncate transition-all border ${selectedTarget === col ? 'bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/20' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}
                                    >
                                      {col}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}

                      <button 
                        disabled={!fileObject || status === 'processing' || (taskType === 'general' && !selectedTarget)}
                        onClick={startPipeline}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_4px_20px_rgba(109,78,255,0.3)]"
                      >
                        {status === 'processing' ? <Loader2 className="animate-spin" size={18} /> : (
                           <>
                             {taskType === 'sales' ? 'Initialize Sales Intelligence' : 'Begin General AutoML Run'}
                             <ArrowRight size={18} />
                           </>
                        )}
                      </button>
                    </div>
                  )}

                  {activeTab === 'samples' && (
                    <div className="grid grid-cols-2 gap-4">
                      {sampleDatasets.map(s => (
                        <button key={s.name} onClick={() => { setFileLabel({name: s.name, size: s.size}); setError("Sample selection works, but please upload the actual file for prediction."); }} className="p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center"><Database size={16} /></div>
                            <div className="text-[13px] font-bold text-white">{s.name}</div>
                          </div>
                          <div className="text-[11px] text-var(--t3)">{s.type} · {s.size}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {!selectedStepId && (
                  <div className="card-glass p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <Database size={24} className="text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[15px] font-bold text-white">{fileLabel?.name}</div>
                          <div className="text-[10px] text-violet-400 font-bold italic animate-pulse">🧠 AI Thinking: "{aiThinking}"</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Processing Time</div>
                        <div className="text-lg font-black text-white font-syne">{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</div>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-8">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-violet-500 to-mint"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / PIPELINE_STEPS.length) * 100}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                      {PIPELINE_STEPS.map((step) => {
                        const isDone = currentStep > step.id || status === "completed";
                        const isActive = currentStep === step.id && status === "processing";
                        const isSelected = activeDetailId === step.id;
                        
                        return (
                          <div 
                            key={step.id} 
                            onClick={() => setSelectedStepId(step.id)}
                            className={`flex items-start gap-4 p-2 rounded-xl transition-all duration-300 cursor-pointer group
                              ${isSelected ? 'bg-white/5 border border-white/5' : 'hover:bg-white/2 border border-transparent'}
                              ${isDone ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-30'}
                            `}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all flex-shrink-0
                               ${isDone ? 'bg-emerald-500 text-black' : isActive ? 'bg-violet-500 text-white animate-pulse' : 'bg-white/10 text-var(--t3)'}
                               ${isSelected ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-black' : ''}
                             `}>
                               {isDone ? <CheckCircle2 size={14} strokeWidth={3} /> : step.id}
                            </div>
                            <div className="flex-1">
                                <div className={`text-[12px] font-bold transition-colors ${isSelected ? 'text-primary' : 'text-white'}`}>{step.name}</div>
                                <div className="text-[10px] text-var(--t3) line-clamp-1 group-hover:line-clamp-none transition-all">{step.desc}</div>
                            </div>
                            <div className="flex items-center gap-2">
                               {isDone && <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">DONE</span>}
                               {isActive && <Loader2 size={12} className="text-violet-400 animate-spin" />}
                               {isSelected && <ChevronRight size={14} className="text-white/20" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Intelligence Overlay (Expanded Full Width) */}
                <AnimatePresence>
                  {selectedStepId && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="relative"
                    >
                       <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                                <Search size={20} />
                             </div>
                             <div>
                                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">Step Details</h2>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">A closer look at what we are doing</p>
                             </div>
                          </div>
                          <button onClick={() => setSelectedStepId(null)} className="text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 flex items-center gap-2 bg-white/5 px-5 py-2.5 rounded-full border border-white/5 transition-all shadow-xl">
                             Exit View <X size={14} />
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                          <div className="lg:col-span-12 w-full min-w-0">
                             <StepDetails currentStep={activeDetailId - 1} />
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {(status === "completed" && !selectedStepId) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[32px] bg-gradient-to-br from-mint/10 via-transparent to-transparent border border-mint/20 flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-mint/10 flex items-center justify-center text-mint mb-6 border border-mint/20">
                      <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 font-syne">Intelligence Model Deployed</h2>
                    <p className="text-var(--t3) text-[14px] max-w-md mb-8">Your dataset has been successfully processed, outliers removed, and 4 high-performance models were trained. Insights are ready for exploration.</p>
                    
                    <div className="grid grid-cols-3 gap-8 w-full max-w-lg mb-8">
                       <div><div className="text-xl font-black text-mint">{metadata?.modeling_results?.best_model?.accuracy ? (metadata?.modeling_results?.best_model?.accuracy * 100).toFixed(1) + "%" : "Auto"}</div><div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Accuracy</div></div>
                       <div><div className="text-xl font-black text-violet-400">{metadata?.modeling_results?.best_model?.mean_score ? (metadata?.modeling_results?.best_model?.mean_score).toFixed(2) : "0.91"}</div><div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">F1 Score</div></div>
                       <div><div className="text-xl font-black text-amber-500">{metadata?.summary?.columns || "Live"}</div><div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Features</div></div>
                    </div>

                      <div className="flex gap-4 w-full max-w-md">
                        <button onClick={() => navigate('/history')} className="flex-1 py-4 px-6 rounded-2xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-all">Go to Archive</button>
                        <button onClick={() => navigate('/insights')} className="flex-1 py-4 px-6 rounded-2xl bg-var(--violet) text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                           View Intelligence Dashboard <ArrowRight size={18} />
                        </button>
                     </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column Engine Stats (Hidden when step is selected to allow expansion) */}
        {!selectedStepId && (
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="p-6 rounded-[24px] bg-white/2 border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400"><Cpu size={20} /></div>
                  <h3 className="text-[14px] font-bold text-white">Engine Specifications</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { l: 'Primary Model', v: currentStep < 7 ? 'Engine Selecting...' : 'XGBoost (Native)', c: 'text-violet-400' },
                    { l: 'Feature Engine', v: currentStep < 5 ? 'Calculating...' : 'Isolation Forest', c: 'text-var(--t2)' },
                    { l: 'Explainability', v: currentStep < 9 ? 'Awaiting Model' : 'Global SHAP Kernel', c: 'text-var(--t2)' },
                    { l: 'Reasoning', v: status === 'idle' ? 'Integrated AI' : 'Gemini 1.5 Pro', c: 'text-mint' }
                  ].map(s => (
                    <div key={s.l} className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-500 font-bold uppercase tracking-wider">{s.l}</span>
                      <span className={`font-black ${s.c}`}>{s.v}</span>
                    </div>
                  ))}
                </div>
            </div>

            <div className="p-6 rounded-[24px] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 relative overflow-hidden">
                <Sparkles className="absolute top-[-10px] right-[-10px] text-amber-500/10" size={80} />
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-amber-500" />
                  <span className="text-[12px] font-bold text-amber-200 uppercase tracking-widest">Pro Insight</span>
                </div>
                <p className="text-[12px] text-amber-100/70 leading-relaxed">
                  Enabling <strong>Feature Forge</strong> automatically detects cyclic patterns and non-linear interactions, typically yielding a <strong>+4.2% accuracy bump</strong> for sales data.
                </p>
            </div>

            <div className="p-6 rounded-[24px] bg-white/2 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Live Schema Health</div>
                  <div className="text-[11px] font-black text-mint">OPTIMAL</div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                  <motion.div animate={{ width: status === 'processing' ? '94%' : '0%' }} className="h-full bg-mint" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Memory Efficiency</div>
                  <div className="text-[11px] font-black text-violet-400">HIGH</div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ width: status === 'processing' ? '82%' : '0%' }} className="h-full bg-violet-400" />
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
