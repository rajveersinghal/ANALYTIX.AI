import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/api';
import MessageItem from '../../components/chat/MessageItem';
import ChatInput from '../../components/chat/ChatInput';
import { BrainCircuit, MessageSquare, AlertCircle, Sparkles, Database, TrendingUp, BarChart2, Target, Loader2 } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  { icon: Database, text: "What are the key statistics of this dataset?" },
  { icon: TrendingUp, text: "Which features are most correlated with the target?" },
  { icon: BarChart2, text: "What are the top 5 most common values in each category?" },
  { icon: Target, text: "How accurate is the best model and why was it selected?" },
];

export default function Chat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobIdFromUrl = searchParams.get('job_id');

  const [sessionId, setSessionId] = useState(jobIdFromUrl || null);
  const [sessionLoading, setSessionLoading] = useState(!jobIdFromUrl);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef(null);

  // Auto-load most recent session if no job_id in URL
  useEffect(() => {
    if (jobIdFromUrl) {
      setSessionId(jobIdFromUrl);
      setSessionLoading(false);
      setMessages([{
        role: 'ai',
        content: "Hello! I'm your AnalytixAI Data Intelligence Agent. I have loaded your dataset and analysis results. Ask me anything — statistics, trends, model performance, or business insights.",
        citations: ["Dataset Loaded", "Models Synchronized"]
      }]);
    } else {
      // No job_id → fetch most recent session automatically
      apiClient.fetchHistory()
        .then(sessions => {
          if (sessions && sessions.length > 0) {
            const latest = sessions[0];
            const id = latest.dataset_id || latest.file_id || latest.id;
            setSessionId(id);
            setMessages([{
              role: 'ai',
              content: `Hello! I've automatically loaded your most recent dataset: "${latest.filename || 'Dataset'}". Ask me anything about it — statistics, trends, model performance, or business insights.`,
              citations: [`Auto-loaded: ${latest.filename || 'Latest Session'}`]
            }]);
          } else {
            setMessages([{
              role: 'ai',
              content: "Hello! Please upload a dataset and run an analysis first, then come back here to chat about your results.",
              citations: []
            }]);
          }
        })
        .catch(() => {
          setMessages([{
            role: 'ai',
            content: "Hello! I'm ready to help. Please upload a dataset first to get started.",
            citations: []
          }]);
        })
        .finally(() => setSessionLoading(false));
    }
  }, [jobIdFromUrl]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (content) => {
    if (!sessionId) return;
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', content }]);
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.askAIContextual(sessionId, content);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: response?.answer || "I processed your request but couldn't generate a specific insight. Please try rephrasing.",
        citations: sessionId ? [`Session: ${sessionId.slice(0, 8)}`] : []
      }]);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "I encountered an error. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] relative animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white">
            <BrainCircuit size={18} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Data Intelligence Chat</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {sessionId
              ? <>Context-aware analysis · Session <span className="font-mono text-zinc-400 text-[11px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 ml-1">{sessionId.slice(0,8)}</span></>
              : "Loading your most recent session..."}
          </p>
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Agent Online</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-36">
        {sessionLoading ? (
          <div className="flex items-center gap-3 py-10 text-zinc-600">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading your dataset session...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, idx) => <MessageItem key={idx} message={msg} />)}

            {/* Suggested Questions */}
            {showSuggestions && sessionId && messages.length <= 1 && (
              <div className="pt-6 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles size={10} /> Suggested questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => handleSend(q.text)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all text-left group">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-white/20 transition-colors">
                        <q.icon size={14} />
                      </div>
                      <span className="text-[12px] text-zinc-400 group-hover:text-zinc-200 transition-colors leading-snug">{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading dots */}
            {loading && (
              <div className="flex gap-6 py-8 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-zinc-600 shrink-0">
                  <BrainCircuit size={14} className="animate-pulse" />
                </div>
                <div className="flex-1 mt-2 space-y-3">
                  <div className="flex items-center gap-2">
                    {[0, 150, 300].map(delay => (
                      <div key={delay} className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay:`${delay}ms`}} />
                    ))}
                    <span className="text-[11px] text-zinc-600 ml-2 font-mono italic">Analyzing your data...</span>
                  </div>
                  <div className="h-2 bg-white/[0.03] rounded-full w-3/4 skeleton" />
                  <div className="h-2 bg-white/[0.03] rounded-full w-1/2 skeleton" />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-4 text-rose-400">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold mb-1">Agent Error</p>
                  <p className="text-[12px] text-rose-400/80 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Fixed Input */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#000212] via-[#000212]/90 to-transparent pt-12 pb-4">
        <ChatInput onSend={handleSend} disabled={loading || !sessionId || sessionLoading} />
      </div>
    </div>
  );
}
