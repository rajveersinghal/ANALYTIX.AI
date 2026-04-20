import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { motion } from "framer-motion";

export default function QualityGauge({ score }) {
  const data = [{ name: "score", value: score, fill: getScoreColor(score) }];

  function getScoreColor(s) {
    if (s >= 80) return "#22c55e"; // Green
    if (s >= 50) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  }

  return (
    <div className="glass p-8 rounded-3xl flex flex-col items-center justify-center relative min-h-[320px] overflow-hidden group">
      
      {/* Background Decorative Gradient */}
      <div className={`absolute inset-0 opacity-10 blur-3xl rounded-full -z-10 transition-colors duration-1000`} 
           style={{ backgroundColor: getScoreColor(score) }} />

      <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">Data Quality Score</h3>

      <div className="relative h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="80%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={225}
            endAngle={-45}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "rgba(255,255,255,0.05)" }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            key={score}
            className="text-5xl font-black text-white"
          >
            {score}
          </motion.span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Percentile</span>
        </div>
      </div>

      <p className="mt-8 text-xs font-medium text-gray-400 max-w-[180px] text-center leading-relaxed">
        Calculated based on <span className="text-white">missing values</span>, <span className="text-white">duplicates</span>, and <span className="text-white">type consistency</span>.
      </p>
    </div>
  );
}
