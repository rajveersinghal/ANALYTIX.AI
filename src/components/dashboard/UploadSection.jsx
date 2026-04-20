import { useState, useRef } from "react";
import { useStore } from "../../store/useStore";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Upload, Database, Plus, Search, FileCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../api/api";

export default function UploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const { sessionId, setSessionId, setStatus, setMetadata, projectId } = useStore();

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await executeUpload(file);
  };

  const executeUpload = async (file) => {
    setIsUploading(true);
    setStatus("idle");
    
    try {
      const data = await apiClient.uploadDataset(file, projectId);
      
      const fileId = data.file_id;
      setSessionId(fileId);
      setMetadata(data);
      
      setStatus("processing");
      await apiClient.startPipeline(fileId, { mode: "fast" });
      
    } catch (err) {
      console.error("Upload failed:", err);
      alert(err.message || "Something went wrong during the intelligence handshake.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSimulatedBenchmark = async (title) => {
    const mockCsvContent = "id,price,sqft,year,location\n" +
      "1,250000,1200,2010,Brooklyn\n2,300000,1500,2015,Queens\n3,180000,800,2005,Bronx\n" +
      "4,450000,2200,2020,Manhattan\n5,320000,1650,2012,StatenIsland\n6,280000,1400,2014,Brooklyn\n" +
      "7,150000,600,1995,Bronx\n8,600000,2800,2022,Manhattan\n9,310000,1550,2018,Queens\n" +
      "10,240000,1100,2008,StatenIsland\n11,270000,1300,2011,Brooklyn\n12,310000,1520,2016,Queens";
    const file = new File([mockCsvContent], `${title.replace(/\s+/g, '_')}_benchmark.csv`, { type: "text/csv" });
    
    await executeUpload(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-10">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">
          Ingest <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Intelligence</span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto font-medium text-lg leading-relaxed">
          Upload your raw data to begin the <span className="text-indigo-400">11-step autonomous</span> intelligence pipeline. 
          Real-time orchestration starts immediately.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Real Upload Zone */}
        <div className="lg:col-span-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".csv,.xlsx" 
          />
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) await executeUpload(file);
            }}
            className={`h-[420px] rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-12 cursor-pointer relative overflow-hidden
              ${isDragging ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]" : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-700"}
              ${isUploading ? "opacity-80 pointer-events-none" : ""}
            `}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {/* Pulsing Border Effect for Dragging */}
            {isDragging && (
              <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 border-4 border-indigo-500/30 rounded-[2.5rem]"
              />
            )}

            {isUploading ? (
              <div className="flex flex-col items-center gap-6 text-center">
                 <div className="relative">
                    <Loader2 className="text-indigo-500 animate-[spin_1.5s_linear_infinite]" size={64} />
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"
                    />
                 </div>
                 <div>
                    <p className="text-2xl font-black text-white tracking-tight">INGESTING METADATA</p>
                    <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">FastAPI Secure Handshake...</p>
                 </div>
                 
                 <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                    <motion.div 
                      animate={{ x: [-256, 256] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                    />
                 </div>
              </div>
            ) : (
              <>
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="p-8 rounded-[2rem] bg-indigo-500/10 text-indigo-400 mb-8 shadow-inner"
                >
                  <Upload size={48} />
                </motion.div>
                <h3 className="text-3xl font-black text-white mb-3 text-center">Initialize Analysis</h3>
                <p className="text-slate-400 mb-10 text-center max-w-sm font-medium">
                  Drop your CSV or Excel archive here to initialize the neural orchestration.
                </p>
                <Button className="px-12 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-lg font-bold shadow-xl shadow-indigo-500/20 border-t border-white/10 group">
                  Select Data <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </Button>
              </>
            )}
          </motion.div>
        </div>

        {/* Info & Recent Benchmarks */}
        <div className="space-y-8">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
           >
             <Card className="p-6 border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl rounded-[2rem]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 flex items-center gap-2">
                   <FileCheck size={16} /> Backend Protocol 2.0
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                   Processing utilizes <span className="text-white">Distributed MongoDB</span> persistence with real-time SHAP explainability and 11-step validation.
                </p>
             </Card>
           </motion.div>
           
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 px-2">Intelligence Marketplace</h3>
           
           <div className="space-y-4">
             <SampleCard 
              title="Real Estate NYC" 
              desc="Clustering & Segmentation" 
              rows="5,200" 
              delay={0.4}
              onSelect={() => handleSimulatedBenchmark("REAL_ESTATE")}
             />
             <SampleCard 
              title="SaaS Churn" 
              desc="Predictive Retention Analysis" 
              rows="10,000" 
              delay={0.5}
              onSelect={() => handleSimulatedBenchmark("CHURN")}
             />
             <SampleCard 
              title="Health Analytics" 
              desc="Outcome Classification" 
              rows="12,500" 
              delay={0.6}
              onSelect={() => handleSimulatedBenchmark("HEALTH")}
             />
           </div>
        </div>
      </div>
    </div>
  );
}

function SampleCard({ title, desc, rows, onSelect, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ x: 5 }}
    >
      <Card 
        className="p-5 border-slate-800 bg-slate-900/40 hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all cursor-pointer group rounded-[1.5rem]" 
        onClick={onSelect}
      >
        <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
               <Database size={18} />
            </div>
            <span className="text-[10px] font-black bg-slate-800 px-2.5 py-1 rounded-full text-slate-500 group-hover:text-indigo-300 transition-colors uppercase tracking-widest">{rows} ROWS</span>
        </div>
        <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors text-sm">{title}</h4>
        <p className="text-xs text-slate-500 mt-1 font-medium">{desc}</p>
      </Card>
    </motion.div>
  );
}
