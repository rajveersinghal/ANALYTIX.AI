import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { BarChart2, Zap } from "lucide-react";

export default function AccuracyChart({ models = [] }) {
  if (!models || models.length === 0) return null;

  // Process data for charts (ensure score is 0-100 for gauge effect)
  const chartData = models.map(m => ({
    name: m.model.split(' ')[0], // Short name
    fullName: m.model,
    score: m.score <= 1.0 ? Math.round(m.score * 100) : m.score
  })).sort((a, b) => b.score - a.score);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden h-[450px] flex flex-col group"
    >
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary p-2 group-hover:rotate-12 transition-transform">
              <BarChart2 size={24} />
            </div>
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-widest leading-none">Performance Delta</h3>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Relative Model Efficiency</p>
            </div>
         </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#4b5563", fontSize: 9, fontWeight: 900, textTransform: "uppercase" }}
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#4b5563", fontSize: 9, fontWeight: 900 }}
            />
            <Tooltip 
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{ 
                backgroundColor: "#000", 
                border: "1px solid rgba(255,255,255,0.1)", 
                borderRadius: "16px",
                fontSize: "10px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
              }}
            />
            <Bar 
              dataKey="score" 
              radius={[10, 10, 4, 4]} 
              animationDuration={2000}
            >
               {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? "var(--primary)" : `rgba(59, 130, 246, ${0.3 + (index / chartData.length) * 0.4})`} 
                    className="hover:fill-blue-400 group-hover:opacity-80 transition-all duration-500"
                  />
               ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
         <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-primary" /> Winner</span>
            <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-primary/30" /> Candidates</span>
         </div>
         <p className="flex items-center gap-1.5 text-primary italic lowercase font-medium tracking-normal opacity-50"><Zap size={10} strokeWidth={3} /> Normalized performance scores (0-100 scaled)</p>
      </div>

      {/* Decorative Blur Background */}
      <div className="absolute -top-24 -left-24 h-48 w-48 bg-primary/10 blur-[60px] rounded-full -z-10 group-hover:opacity-30 transition-opacity duration-1000" />
    </motion.div>
  );
}
