import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { apiClient } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { 
  Plus, 
  Trash2, 
  Download, 
  Send, 
  Search, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  Monitor,
  Layout,
  FileText,
  Copy,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatView() {
  const { 
    activeSession, setActiveSession, 
    conversations, activeConvId, setActiveConvId, activeConv,
    sendMessage, createNewConv, deleteConv, isTyping 
  } = useChat();
  
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await apiClient.fetchHistory();
        setSessions(history || []);
        if (history && history.length > 0 && !activeSession) {
          setActiveSession(history[0].file_id || history[0]._id);
        }
      } catch (err) {
        console.error("Failed to load chat sessions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const handleExport = () => {
    if (!activeConv?.messages?.length) return;
    const text = activeConv.messages.map(m => `[${m.time}] ${m.role === 'user' ? 'You' : 'AI'}: ${m.text.replace(/<[^>]+>/g, '')}`).join('\n\n');
    navigator.clipboard.writeText(text);
    // showToast or simple alert
  };

  const handleClear = () => {
    if (window.confirm('Clear conversation history?')) {
       // Logic in context would be better but for now...
    }
  };

  return (
    <div className="chat-page -m-8">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="cs-head">
          <div className="cs-head-title">Conversations</div>
          <button className="new-conv-btn" onClick={createNewConv}>
            <Plus size={14} />
            New Conversation
          </button>
        </div>
        
        <div className="conv-list custom-scrollbar">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`conv-item ${activeConvId === conv.id ? 'active' : ''}`}
            >
              <div className="conv-title">{conv.title}</div>
              <div className="conv-meta">
                <span className="conv-sess-tag">
                  {sessions.find(s => (s.file_id || s._id) === conv.sessionId)?.filename?.split('.')[0] || 'DATA'}
                </span>
                <div className="flex items-center gap-2">
                  <span>{conv.time}</span>
                  <span 
                    className="conv-del" 
                    onClick={(e) => { e.stopPropagation(); deleteConv(conv.id); }}
                  >
                    <Trash2 size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        <div className="chat-main-head">
          <Layout size={14} className="text-var(--t3)" />
          <select 
            className="cm-session-sel"
            value={activeSession || ""}
            onChange={(e) => setActiveSession(e.target.value)}
          >
            {sessions.map((sess) => (
              <option key={sess.file_id || sess._id} value={sess.file_id || sess._id} className="bg-var(--bg-3)">
                {sess.filename} ({sess.task_type || 'General'})
              </option>
            ))}
          </select>

          <div className="cm-context-card">
            <div className="cm-ctx-dot"></div>
            <span className="cm-ctx-text">
              {sessions.find(s => (s.file_id || s._id) === activeSession)?.task_type === 'sales' ? 'Sales Insights On' : 'Smart Analysis On'}
            </span>
          </div>

          <button className="cm-clear-btn" onClick={handleClear}>Clear chat</button>
          <button className="cm-expand-btn" title="Export conversation" onClick={handleExport}>
            <Download size={14} />
          </button>
        </div>

        {/* Messages or Empty State */}
        <div className="cm-msgs custom-scrollbar" ref={scrollRef}>
          {!activeConv || activeConv.messages.length === 0 ? (
            <div className="chat-empty">
              <div className="ce-icon">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                >
                  <Sparkles size={32} className="text-indigo-400" />
                </motion.div>
              </div>
              <h2 className="ce-title mt-6 text-2xl font-black syne">AI Assistant Ready</h2>
              <p className="ce-sub text-slate-400 mt-2 max-w-sm mx-auto">
                Select a data session to begin your analysis. My AI is ready to help you understand your datasets.
              </p>
              <div className="mt-8">
                 <Button onClick={createNewConv} className="px-8 py-4 bg-indigo-600 rounded-xl font-black uppercase tracking-widest text-xs">
                   Start AI Chat
                 </Button>
              </div>
              <div className="ce-suggestions mt-10">
                {[
                  { label: 'Revenue analysis', q: 'Why did Q2 sales underperform?' },
                  { label: 'Actionable insight', q: 'Suggest 3 ways to improve SKU velocity' },
                  { label: 'Risk assessment', q: 'Is there a churn risk in the North region?' }
                ].map((item, idx) => (
                  <motion.button 
                    key={idx}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="ce-sug group"
                    onClick={() => {
                        if (!activeConvId) createNewConv();
                        sendMessage(item.q);
                    }}
                  >
                    <span className="ce-sug-label group-hover:text-indigo-400">{item.label}</span>
                    <span className="text-xs text-slate-500 line-clamp-1">{item.q}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pt-10">
              {activeConv.messages.map((msg, i) => (
                <div key={i} className={`cm-msg-row ${msg.role === 'user' ? 'user pl-12' : 'ai pr-12'}`}>
                  <div className={`cm-av ${msg.role === 'user' ? 'user border-slate-700' : 'ai border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)]'}`}>
                    {msg.role === 'user' ? (user?.full_name?.charAt(0) || 'U') : <MessageSquare size={14} />}
                  </div>
                  <div className="cm-bubble-wrap">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`cm-bubble ${msg.role === 'user' ? 'user' : 'ai-premium'}`}
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                    
                    {msg.followups && (
                      <div className="followup-row mt-3">
                        {msg.followups.map(f => (
                          <button 
                            key={f}
                            className="fq"
                            onClick={() => sendMessage(f)}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="cm-msg-footer">
                      <span className="cm-time">{msg.time}</span>
                      <div className="cm-actions">
                        <button className="cm-act" title="Copy">
                          <Copy size={12} />
                        </button>
                        {msg.role === 'ai' && (
                          <>
                            <button className="cm-act" title="Helpful">
                              <ThumbsUp size={12} />
                            </button>
                            <button className="cm-act" title="Share">
                              <Share2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="cm-msg-row">
                  <div className="cm-av ai">AI</div>
                  <div className="typing-bubble">
                    <div className="tdot"></div>
                    <div className="tdot"></div>
                    <div className="tdot"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="cm-input-wrap">
          <div className="cm-input-box">
            <textarea 
              className="cm-textarea custom-scrollbar"
              placeholder="Ask anything about your session data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              rows={1}
              style={{ height: 'auto' }}
            />
            <button 
              className="cm-send-btn"
              disabled={!input.trim() || isTyping}
              onClick={handleSend}
            >
              <Send size={18} />
            </button>
            <div className="cm-input-footer">
              <span className="cm-hint">⏎ Send · Shift + ⏎ New Line</span>
              <div className="ml-auto flex items-center gap-3">
                 <span className="cm-char">{input.length} / 1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
