import { motion } from "framer-motion";
import { Database, Layout, AlertCircle, Layers } from "lucide-react";

export default function MetadataCards({ data }) {
  const cards = [
    { 
      label: "Total Rows", 
      value: data.rows?.toLocaleString() || "0", 
      icon: <Database className="text-blue-400" />,
      sub: "Records detected"
    },
    { 
      label: "Columns", 
      value: data.columns || "0", 
      icon: <Layout className="text-secondary" />,
      sub: "Feature space"
    },
    { 
      label: "Missing Values", 
      value: data.missing_count || "0", 
      icon: <AlertCircle className={`transition-colors ${data.missing_count > 0 ? "text-red-400" : "text-green-400"}`} />,
      sub: "Null data cells"
    },
    { 
      label: "Duplicate Rows", 
      value: data.duplicate_rows || "0", 
      icon: <Layers className={`transition-colors ${data.duplicate_rows > 0 ? "text-amber-400" : "text-green-400"}`} />,
      sub: "Redundant entries"
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {cards.map((c, i) => (
        <motion.div key={i} variants={item} className="glass p-6 rounded-3xl border-white/5 hover:border-primary/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
               {c.icon}
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{c.label}</p>
          </div>
          <div className="space-y-1">
             <h2 className="text-3xl font-black text-white">{c.value}</h2>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{c.sub}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
