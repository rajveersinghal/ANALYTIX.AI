import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import api, { endpoints } from "../../api/api";
import { Button } from "../ui/Button";
import { Loader2 as LoaderIcon } from "lucide-react";

export default function DownloadCenter({ sessionId }) {
  const [downloading, setDownloading] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDownload = async (type, linkUrl) => {
    setDownloading(type);
    try {
      // Use the direct relative path for authenticated fetch
      const relativeUrl = linkUrl.replace(window.location.origin, "").replace(/http:\/\/.*?:8000/, "");
      
      const response = await api.get(relativeUrl, {
        responseType: 'blob'
      });
      
      // Axios interceptor might have unwrapped it, check structure
      const blob = response instanceof Blob ? response : new Blob([response]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const filename = type === 'report' ? `AnalytixAI_Report_${sessionId.slice(-6)}.pdf` : `AnalytixAI_Model_${sessionId.slice(-6)}.pkl`;
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(type);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(null);
    }
  };

  const reportUrl = `${endpoints.downloadReport(sessionId)}`;
  const modelUrl = `${endpoints.downloadModel(sessionId)}`;

  const downloads = [
    { 
      id: "report", 
      title: "Executive Report", 
      subtitle: "Comprehensive PDF with all insights & charts", 
      icon: FileText, 
      color: "bg-red-500/10 text-red-400 border-red-500/20",
      url: reportUrl
    },
    { 
      id: "model", 
      title: "Trained Model", 
      subtitle: "Production-ready Scikit-Learn Pipeline (.pkl)", 
      icon: Cpu, 
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      url: modelUrl
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {downloads.map((d) => (
        <motion.div 
          key={d.id}
          initial={{ opacity: 0, x: d.id === "report" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-xl group hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex items-start justify-between mb-8">
            <div className={`p-4 rounded-2xl border ${d.color} group-hover:scale-110 transition-transform`}>
               <d.icon size={28} />
            </div>
            <AnimatePresence>
               {success === d.id && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest"
                 >
                    <CheckCircle2 size={14} /> Downloaded
                 </motion.div>
               )}
            </AnimatePresence>
          </div>

          <div className="space-y-1 mb-8">
            <h3 className="text-xl font-black text-white">{d.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{d.subtitle}</p>
          </div>

          <Button 
            className={`w-full py-6 text-lg font-black rounded-2xl flex items-center justify-center gap-3 transition-all ${success === d.id ? 'bg-green-600' : 'bg-primary hover:scale-[1.02]'}`}
            onClick={() => handleDownload(d.id, d.url)}
            disabled={downloading === d.id}
          >
             {downloading === d.id ? (
               <Loader2 className="animate-spin" size={20} />
             ) : (
               <>
                 {success === d.id ? "Download Success" : `Get ${d.id === 'report' ? 'Report' : 'Model'}`}
                 <Download size={20} />
               </>
             )}
          </Button>
        </motion.div>
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-rgb: 0, 242, 255;
        }
      `}} />
    </div>
  );
}

function Loader2({ className, size }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`animate-spin ${className}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
