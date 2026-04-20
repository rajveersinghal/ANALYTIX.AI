import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, Maximize2, ExternalLink } from "lucide-react";
import { api, endpoints } from "../../api/api";

export default function ReportPreview({ sessionId }) {
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoading(true);
        const response = await api.get(endpoints.downloadReport(sessionId), {
          responseType: 'blob'
        });
        const blob = response instanceof Blob ? response : new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err) {
        console.error("PDF Preview failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchPdf();
    
    return () => {
      if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    };
  }, [sessionId]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-1 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden group"
    >
      <div className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <FileText size={20} className="text-red-400" />
           </div>
           <div>
             <h3 className="text-lg font-black text-white">Full Intelligence Report</h3>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Live Preview Ready
             </p>
           </div>
        </div>
        <div className="flex gap-2">
           <a href={blobUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all text-gray-400 hover:text-white">
              <ExternalLink size={18} />
           </a>
        </div>
      </div>

      <div className="relative aspect-[16/10] bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-white/5">
        <AnimatePresence>
          {loading && (
            <motion.div 
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center space-y-4 z-10 bg-[#0f172a]"
            >
              <Loader2 size={32} className="text-primary animate-spin" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Rendering Analytical PDF...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <iframe
          src={blobUrl}
          className="w-full h-full border-none"
          title="Executive Report Preview"
          onLoad={() => setLoading(false)}
        />
        
        {/* Overlay for premium look */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
