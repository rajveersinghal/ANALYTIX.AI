import { motion } from "framer-motion";
import QualityGauge from "./QualityGauge";
import MetadataCards from "./MetadataCards";
import InsightsPanel from "./InsightsPanel";

export default function ProfilingDashboard({ metadata }) {
  const score = metadata?.data_quality_score || 0;
  const insights = metadata?.summary || [];
  
  // Stats normalization
  const stats = {
    rows: metadata?.rows || 0,
    columns: metadata?.columns || 0,
    missing_count: Object.values(metadata?.column_info || {}).reduce((acc, col) => acc + (col.missing_count || 0), 0),
    duplicate_rows: metadata?.duplicate_rows || 0
  };

  const container = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <QualityGauge score={score} />
        </div>
        <div className="lg:col-span-2">
          <InsightsPanel insights={insights} />
        </div>
      </div>

      <MetadataCards data={stats} />
    </motion.div>
  );
}
