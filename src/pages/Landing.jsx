import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Footer from '../components/landing/Footer';
import { Zap, Search, ArrowRight, Database, BrainCircuit, Upload, Play, Sparkles } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#000000] selection:bg-white/20 overflow-x-hidden">
      <Navbar />
      
      <main className="relative min-h-screen">
        <div className="relative z-10">
          <Hero />
        
        {/* Section 1: Features */}
        <section className="py-32 px-6 border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
              <FeatureCard 
                title="Self-Cleaning Pipelines"
                description="Automatically handle missing values, outliers, and preprocessing — no manual work required."
                image="/images/landing/pipeline.png"
              />
              <FeatureCard 
                title="Context-Aware AutoML"
                description="Select the best model based on your dataset and problem, without guesswork."
                image="/images/landing/automl.png"
              />
              <FeatureCard 
                title="Generative Insights"
                description="Turn complex analysis into simple, human-readable explanations anyone can understand."
                image="/images/landing/insights.png"
              />
            </div>
          </div>
        </section>

        {/* Section 2: How It Works */}
        <section className="py-40 px-6 border-y border-white/[0.05]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">How it works</h2>
              <p className="text-zinc-500 max-w-lg mx-auto">Three simple steps to autonomous data intelligence.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-24" />
              
              <Step 
                num="1" 
                icon={<Upload size={24} />} 
                title="Upload Data" 
                desc="Drop your CSV or connect your data source." 
              />
              <Step 
                num="2" 
                icon={<Play size={24} />} 
                title="Run Pipeline" 
                desc="Our AI handles cleaning, feature engineering, and model training." 
              />
              <Step 
                num="3" 
                icon={<Sparkles size={24} />} 
                title="Get Insights" 
                desc="Receive clear results, predictions, and explanations instantly." 
              />
            </div>
          </div>
        </section>

        {/* Section 3: Neural Workspace */}
        <section className="py-40 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <div className="card-linear p-0 overflow-hidden bg-[#08090a] border-white/[0.08] shadow-2xl">
                <div className="flex flex-col h-[450px] md:h-[500px]">
                  <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-black/20">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/10 border border-rose-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/10 border border-amber-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20" />
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Agent Active</span>
                  </div>
                  <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                    <ChatMessage 
                      user="data_lead" 
                      time="10:22 AM" 
                      msg="Analyze the target distribution variance." 
                    />
                    <ChatMessage 
                      user="analytix_ai" 
                      time="10:23 AM" 
                      msg="A significant skew is detected in the target variable. Applying a log transformation is recommended to stabilize variance before training." 
                      isAI
                    />
                  </div>
                  <div className="p-4 border-t border-white/[0.05] bg-black/40">
                    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5">
                      <Search size={14} className="text-zinc-600" />
                      <span className="text-zinc-600 text-xs italic">Ask a question...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white mb-8">
                <BrainCircuit size={24} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">Ask questions. <br/> Get answers from your data.</h2>
              <p className="text-lg text-zinc-400 leading-relaxed font-light max-w-xl">
                Collaborate with AI agents to detect anomalies, debug models, and understand results in real time.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Code Section */}
        <section className="py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white mb-8 mx-auto">
                <Database size={24} />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">From manual pipelines to <br className="hidden md:block" /> AI-optimized workflows</h2>
              <p className="text-zinc-500">Generate production-ready code automatically — no manual tuning required.</p>
            </div>

            <div className="card-linear p-0 overflow-hidden bg-[#08090a] border-white/[0.08] max-w-5xl mx-auto shadow-2xl">
              <div className="p-4 border-b border-white/[0.05] flex items-center gap-3 bg-black/20 overflow-x-auto">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-3 h-3 rounded-sm bg-white/10 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                  <span className="text-[11px] text-zinc-600 font-mono tracking-tighter">processing.py</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 text-[12px] md:text-[13px] font-mono leading-relaxed overflow-x-auto">
                <div className="p-8 bg-rose-500/[0.01] border-b md:border-b-0 md:border-r border-white/[0.05]">
                  <pre className="text-zinc-600">
                    <span className="text-zinc-700 font-bold block mb-4 uppercase tracking-widest text-[10px]">Before</span>
                    <span className="bg-rose-500/10 text-rose-300 w-full inline-block py-1 px-2 rounded mb-2"># Manual scaling</span><br/>
                    df['val'] = (df['val'] - df['val'].mean()) / df['val'].std()
                  </pre>
                </div>
                <div className="p-8 bg-emerald-500/[0.01]">
                  <pre className="text-zinc-600">
                    <span className="text-zinc-700 font-bold block mb-4 uppercase tracking-widest text-[10px]">After (AI Optimized)</span>
                    <span className="bg-emerald-500/10 text-emerald-300 w-full inline-block py-1 px-2 rounded mb-2"># AI Optimized Scaling</span><br/>
                    scaler = SmartScaler(method='robust')<br/>
                    df['val'] = scaler.fit_transform(df)
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-48 px-6 border-t border-white/[0.05] relative overflow-hidden">
          <div className="hero-glow opacity-30" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8">
              Start analyzing your data today
            </h2>
            <p className="text-zinc-500 mb-12 text-lg font-light leading-relaxed">
              Stop cleaning data manually. Let AI handle it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate(user ? '/app/dashboard' : '/signup')}
                className="w-full sm:w-auto btn-linear px-12 py-4 rounded-full font-bold"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ title, description, image }) {
  return (
    <div className="flex flex-col gap-8 group">
      <div className="relative aspect-square flex items-center justify-center bg-white/[0.01] rounded-2xl border border-white/[0.03] group-hover:border-white/[0.1] transition-all duration-500 overflow-hidden shadow-xl">
        <img src={image} alt={title} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed font-light">{description}</p>
      </div>
    </div>
  );
}

function Step({ num, icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center relative z-10 group">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white mb-8 group-hover:border-white/20 group-hover:bg-white/10 transition-all duration-300 relative z-20">
        {icon}
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 text-[120px] font-bold text-white/[0.02] pointer-events-none select-none leading-none z-0">
        {num}
      </div>
      <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed font-light max-w-[200px]">{desc}</p>
    </div>
  );
}

function ChatMessage({ user, time, msg, isAI }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-zinc-500 font-bold uppercase tracking-tighter shrink-0">
        {user.split('_').map(n => n[0]).join('')}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-bold ${isAI ? 'text-white' : 'text-zinc-400'}`}>{user}</span>
          <span className="text-[10px] text-zinc-600 font-mono">{time}</span>
        </div>
        <p className={`text-[13px] leading-relaxed ${isAI ? 'text-zinc-300' : 'text-zinc-500 font-light'}`}>
          {msg}
        </p>
      </div>
    </div>
  );
}
