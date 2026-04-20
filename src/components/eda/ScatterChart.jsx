import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { motion } from "framer-motion";
import { Zap, GitCommit } from "lucide-react";

export default function ScatterPlot({ data, xLabel, yLabel }) {
  if (!data || data.length === 0) return null;

  // Optimized Data Guard: Sample if > 1000 points to ensure 60FPS UI
  const isSampled = data.length > 1200;
  const displayData = isSampled 
    ? data.filter((_, i) => i % Math.ceil(data.length / 1000) === 0)
    : data;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden h-[420px] flex flex-col group"
    >
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 p-2 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-widest leading-none">Feature Relationship</h3>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Bivariate Correlation</p>
            </div>
         </div>
         {isSampled && (
            <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black uppercase text-indigo-400 tracking-tighter shimmer">
              Optimized View: 1000 Pts
            </div>
         )}
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
            <XAxis 
              type="number" 
              dataKey="x" 
              name={xLabel} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 700 }}
              label={{ value: xLabel, position: 'insideBottom', offset: -5, fill: "#3b82f6", fontSize: 9, fontWeight: 900, textTransform: "uppercase" }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name={yLabel} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 700 }}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 0, fill: "#3b82f6", fontSize: 9, fontWeight: 900, textTransform: "uppercase" }}
            />
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3', stroke: "rgba(255,255,255,0.1)" }}
              contentStyle={{ 
                backgroundColor: "#000", 
                border: "1px solid rgba(255,255,255,0.1)", 
                borderRadius: "12px",
                fontSize: "10px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "0.1em"
              }}
            />
            <Scatter 
              name="Relationship" 
              data={displayData} 
              fill="#fb923c" 
              className="drop-shadow-[0_0_8px_rgba(251,146,60,0.4)]"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
         <span>Driver: {xLabel}</span>
         <span className="flex items-center gap-1"><GitCommit size={12} className="text-orange-500" /> Target: {yLabel}</span>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -bottom-20 -right-20 h-48 w-48 bg-orange-500/10 blur-[60px] rounded-full -z-10" />
    </motion.div>
  );
}
