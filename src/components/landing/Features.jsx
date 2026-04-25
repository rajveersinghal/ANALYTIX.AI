import React from 'react';
import { Database, Zap, Search, PieChart } from 'lucide-react';

const FEATURES = [
  {
    icon: Database,
    title: "Smart Data Ingestion",
    description: "Automated cleaning and preparation of your raw datasets. We handle the heavy lifting of data engineering."
  },
  {
    icon: Zap,
    title: "Instant AutoML",
    description: "No code required. Our engine automatically selects the best model for your specific problem in seconds."
  },
  {
    icon: Search,
    title: "Explainable AI",
    description: "Understand the 'why' behind every prediction. We provide human-readable explanations for complex models."
  },
  {
    icon: PieChart,
    title: "Interactive EDA",
    description: "Beautiful, interactive visualizations that reveal the hidden patterns and outliers in your data."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Features</h2>
          <p className="text-3xl md:text-5xl font-bold tracking-tight text-white max-w-2xl mx-auto">
            Powerful tools for <br className="hidden md:block" /> modern data teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="card-linear group">
              <div className="w-10 h-10 bg-white/[0.05] rounded-lg flex items-center justify-center text-white mb-6 group-hover:bg-white group-hover:text-black transition-all duration-300">
                <feature.icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
