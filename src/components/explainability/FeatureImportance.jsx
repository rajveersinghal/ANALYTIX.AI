import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

export default function FeatureImportance({ features }) {
  if (!features || features.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            Feature Importance
            <div className="group relative">
               <Info size={16} className="text-gray-500 cursor-help" />
               <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-black/90 border border-white/10 rounded-xl text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  This chart shows which factors contribute most to the model's predictions. Higher values indicate greater influence on the final result.
               </div>
            </div>
          </h3>
          <p className="text-sm text-gray-500">Global influence of each feature on model outcomes</p>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={features}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                      <p className="text-lg font-black text-primary">{(payload[0].value * 100).toFixed(1)}%</p>
                      <p className="text-[10px] text-gray-500">Contribution Score</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="importance" 
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {features.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? "url(#colorImportance)" : "rgba(255,255,255,0.15)"}
                  className={index === 0 ? "drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" : ""}
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="colorImportance" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Logic for defining custom CSS variable if not exists */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-rgb: 0, 242, 255;
        }
      `}} />
    </motion.div>
  );
}
