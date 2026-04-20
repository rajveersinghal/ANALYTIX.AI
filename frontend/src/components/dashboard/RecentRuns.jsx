import { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { Clock, CheckCircle, Database, ChevronRight, Loader2 } from "lucide-react";
import { apiClient } from "../../api/api";
import { useStore } from "../../store/useStore";
import { motion, AnimatePresence } from "framer-motion";

export default function RecentRuns() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { sessionId, setSessionId, setStatus, setMetadata, setStep } = useStore();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await apiClient.fetchHistory();
        if (Array.isArray(data)) {
          setRuns(data.slice(0, 5)); // Show last 5
        } else {
          setRuns([]);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this intelligence session?")) return;
    
    try {
      await apiClient.deleteSession(id);
      setRuns(prev => prev.filter(r => r.dataset_id !== id));
      if (sessionId === id) {
        setSessionId(null);
        setStatus("idle");
        setMetadata(null);
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
      alert("Failed to delete session.");
    }
  };

  const handleSelectSession = async (session) => {
    try {
      setSessionId(session.dataset_id);
      setStatus("completed");
      setMetadata(session);
      const fullStatus = await apiClient.fetchPipelineStatus(session.dataset_id);
      setMetadata(fullStatus);
      setStep(11);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Failed to hydrate session:", err);
    }
  };

  if (loading) return (
    <Card className="p-12 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="text-primary animate-spin" size={32} />
      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Hydrating History...</p>
    </Card>
  );

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
           <Clock className="text-primary" /> Historic Portfolio
        </h2>
        <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">Recent Intelligence</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {runs.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-gray-600 uppercase font-bold text-center py-8"
            >
              No prior intelligence sessions found.
            </motion.p>
          ) : (
            runs.map((run, i) => (
              <motion.div 
                key={run.dataset_id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                onClick={() => handleSelectSession(run)}
                className="group p-4 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <Database size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate max-w-[150px]">
                        {run.filename || "Unnamed Project"}
                      </h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">
                        ID: {run.dataset_id?.slice(0, 8) || "N/A"} • {run.created_at ? new Date(run.created_at).toLocaleDateString() : "Unknown"}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                      <CheckCircle size={10} className="text-green-500" />
                      <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">ARCHIVED</span>
                   </div>
                   <button 
                     onClick={(e) => handleDeleteSession(e, run.dataset_id)}
                     className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                   >
                     <ChevronRight size={16} /> {/* Placeholder for Trash if Lucide Trash is used, but ChevronRight was here */}
                   </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      <button className="w-full py-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors mt-4">
         View All Intelligence Logs
      </button>
    </Card>
  );
}
