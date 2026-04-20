import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles,
  Zap,
  ChevronDown,
  Maximize2,
  Trash2,
  Plus,
  Monitor,
  Layout,
  Paperclip,
  Smile,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../context/ChatContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function ChatWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    activeSession, setActiveSession, 
    activeConv, sendMessage, createNewConv, 
    isTyping, unreadCount, setUnreadCount, KB 
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConv?.messages, isTyping]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  if (location.pathname === '/chat') return null;

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput("");
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0);
  };

  return (
    <>
      {/* Floating Panel (Mini) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9, originX: '100%', originY: '100%' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="chat-mini-panel"
          >
            {/* Header */}
            <div className="cp-head">
               <div className="cp-head-left">
                  <div className="cp-icon-wrap">
                     <Sparkles size={18} />
                     <div className="cp-status-dot"></div>
                  </div>
                  <div className="cp-title-wrap">
                     <div className="cp-name">AnalytixAI Agent</div>
                     <div className="cp-subtitle">Engine Active • AI Grounded</div>
                  </div>
               </div>
               <div className="cp-actions">
                  <button className="cp-btn" onClick={() => { navigate('/chat'); setIsOpen(false); }} title="Expand to Page">
                    <Maximize2 size={15} />
                  </button>
                  <button className="cp-btn" onClick={createNewConv} title="New Chat">
                    <Plus size={16} />
                  </button>
                  <button className="cp-btn cp-btn-close" onClick={() => setIsOpen(false)}>
                    <X size={18} />
                  </button>
               </div>
            </div>

            {/* Session Session Bar */}
            <div className="cp-sess-bar">
               <Monitor size={12} className="text-var(--t3)" />
               <select 
                className="cp-sess-sel"
                value={activeSession}
                onChange={(e) => setActiveSession(e.target.value)}
               >
                 {Object.entries(KB).map(([id, sess]) => (
                    <option key={id} value={id}>{sess.label}</option>
                 ))}
               </select>
               <div className="flex items-center gap-1 ml-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-var(--mint)"></div>
                  <span className="text-[10px] text-var(--mint) font-bold">{KB[activeSession]?.acc}% ACC</span>
               </div>
            </div>

            {/* Messages */}
            <div className="cp-msgs custom-scrollbar" ref={scrollRef}>
               {(!activeConv || activeConv.messages.length === 0) ? (
                 <div className="text-center py-10 px-6">
                    <div className="w-12 h-12 rounded-xl bg-var(--sur) border border-var(--bdr) flex items-center justify-center mx-auto mb-4 text-var(--t3)">
                       <MessageSquare size={24} />
                    </div>
                    <div className="text-[13px] font-bold text-var(--t1) mb-1">Start Analysis</div>
                    <p className="text-[11px] text-var(--t3) mb-6">Ask about drivers, risks, or forecasts in {KB[activeSession]?.label}</p>
                    <div className="flex flex-col gap-2">
                       <button onClick={() => sendMessage('Top revenue drivers?')} className="w-full p-2.5 rounded-lg bg-var(--bg-4) border border-var(--bdr) text-[11px] text-var(--t2) text-left hover:border-[rgba(109,78,255,0.3)] hover:text-[#b0a0ff] transition-all flex items-center justify-between group">
                          Revenue drivers
                          <ChevronRight size={10} className="text-var(--t3) group-hover:text-[#b0a0ff]" />
                       </button>
                       <button onClick={() => sendMessage('Sales drop analysis')} className="w-full p-2.5 rounded-lg bg-var(--bg-4) border border-var(--bdr) text-[11px] text-var(--t2) text-left hover:border-[rgba(109,78,255,0.3)] hover:text-[#b0a0ff] transition-all flex items-center justify-between group">
                          Sales drop reason
                          <ChevronRight size={10} className="text-var(--t3) group-hover:text-[#b0a0ff]" />
                       </button>
                    </div>
                 </div>
               ) : (
                 <>
                   {activeConv.messages.map((msg, i) => (
                     <div key={i} className={`cp-msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
                        <div className={`cp-msg-av ${msg.role === 'user' ? 'user' : 'ai'}`}>
                           {msg.role === 'user' ? 'RS' : 'AI'}
                        </div>
                        <div className={`cp-bubble ${msg.role === 'user' ? 'user' : 'ai'}`} dangerouslySetInnerHTML={{ __html: msg.text }} />
                     </div>
                   ))}
                   {isTyping && (
                     <div className="cp-msg ai">
                        <div className="cp-msg-av ai">AI</div>
                        <div className="typing-bubble">
                           <div className="tdot"></div>
                           <div className="tdot"></div>
                           <div className="tdot"></div>
                        </div>
                     </div>
                   )}
                 </>
               )}
            </div>

            {/* Input */}
            <div className="cp-input-area">
               <div className="cp-input-box">
                  <textarea 
                    className="cp-textarea custom-scrollbar"
                    placeholder="Ask AnalytixAI..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    rows={1}
                  />
                  <div className="cp-input-utils">
                     <div className="cp-util-btn"><Paperclip size={14} /></div>
                     <div className="cp-util-btn"><Smile size={14} /></div>
                     <div className="cp-char-count">{input.length} / 500</div>
                  </div>
                  <button 
                    className="cp-send-btn"
                    disabled={!input.trim() || isTyping}
                    onClick={handleSend}
                  >
                    <Send size={15} />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <button 
        className={`chat-fab ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle AI Chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare size={26} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {unreadCount > 0 && !isOpen && (
          <div className="fab-badge">{unreadCount}</div>
        )}
      </button>
    </>
  );
}
