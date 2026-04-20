import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { BarChart2, Info } from "lucide-react";

export default function HistogramChart({ data, title = "Data Distribution" }) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden h-[420px] flex flex-col group"
    >
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 p-2 group-hover:scale-110 transition-transform">
              <BarChart2 size={24} />
            </div>
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-widest">{title}</h3>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Univariate Frequency</p>
            </div>
         </div>
         <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
            <Info size={14} />
         </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="bin" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 700 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip 
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
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
            <Bar 
              dataKey="count" 
              radius={[6, 6, 0, 0]} 
            >
               {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`rgba(168, 85, 247, ${0.4 + (index / data.length) * 0.6})`} 
                    className="hover:fill-purple-400 transition-colors duration-500"
                  />
               ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -bottom-20 -left-20 h-48 w-48 bg-purple-500/10 blur-[60px] rounded-full -z-10" />
    </motion.div>
  );
}
