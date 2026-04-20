import { motion } from "framer-motion";
import AuditLog from "./AuditLog";
import HistogramChart from "./HistogramChart";
import ScatterPlot from "./ScatterChart";
import CorrelationHeatmap from "./CorrelationHeatmap";

export default function EDADashboard({ metadata }) {
  const auditLogs = metadata?.cleaning_actions || [];
  const edaResults = metadata?.eda_results || {};
  const plotData = edaResults.plot_data || {};

  // Extract primary distribution
  const distKey = Object.keys(plotData.distributions || {})[0];
  const histogramData = distKey ? plotData.distributions[distKey] : null;

  // Extract scatter data
  const scatterData = plotData.scatter || [];
  const scatterMeta = plotData.scatter_meta || { x_label: "Driver", y_label: "Target" };

  // Extract correlation
  const corrMatrix = plotData.correlation_matrix || null;

  const container = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.3
      }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-16"
    >
      {/* 1. Header (Audit Logs) */}
      <div className="max-w-4xl">
        <AuditLog logs={auditLogs} />
      </div>

      {/* 2. Visual Intelligence (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <HistogramChart data={histogramData} title={`Focus: ${distKey}`} />
        <ScatterPlot 
          data={scatterData} 
          xLabel={scatterMeta.x_label} 
          yLabel={scatterMeta.y_label} 
        />
      </div>

      {/* 3. Global Dependencies (Heatmap) */}
      <CorrelationHeatmap matrix={corrMatrix} />
    </motion.div>
  );
}
