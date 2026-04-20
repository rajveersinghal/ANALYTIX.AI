import React from "react";
import SummarySnapshot from "./SummarySnapshot";
import ReportPreview from "./ReportPreview";
import DownloadCenter from "./DownloadCenter";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function FinalReportDashboard({ metadata, sessionId }) {
  if (!metadata || !sessionId) return null;

  return (
    <div className="space-y-16 py-10">
      
      {/* 1. Executive Summary */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
           <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary" />
           <h3 className="text-xs font-black uppercase tracking-[0.6em] text-gray-500">Executive Insight Summary</h3>
           <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary" />
        </div>
        <SummarySnapshot metadata={metadata} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
        {/* 2. PDF Preview (3 columns) */}
        <div className="xl:col-span-3">
          <ReportPreview sessionId={sessionId} />
        </div>

        {/* 3. Download Center (2 columns) */}
        <div className="xl:col-span-2">
          <DownloadCenter sessionId={sessionId} />
          
          {/* Action Call for next steps */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2.5rem] relative overflow-hidden group"
          >
             <div className="absolute -right-8 -bottom-8 p-10 opacity-10 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={120} className="text-primary" />
             </div>
             <h4 className="text-xl font-black text-white mb-2">Next Phase?</h4>
             <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Your AI-driven analysis is complete. Deploy this model to production or start a new experimentation session.
             </p>
             <button className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs group-hover:gap-4 transition-all" onClick={() => window.location.href = '/projects'}>
                Go to Mission Control <ChevronRight size={14} />
             </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
