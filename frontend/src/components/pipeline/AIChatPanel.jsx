import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles, X } from "lucide-react";
import { Button } from "../ui/Button";
import { useChat } from "../../context/ChatContext";

export default function AIChatPanel({ activeStepName, sessionId, isEmbedded = false }) {
  const { 
    activeSession, setActiveSession, 
    sendMessage, isTyping, activeConv, createNewConv 
  } = useChat();
  
  const [isOpen, setIsOpen] = useState(isEmbedded); // Default open if embedded
  const [input, setInput] = useState("");

  // Sync session with Pipeline
  useEffect(() => {
    if (sessionId) {
      setActiveSession(sessionId);
      if (!activeConv) createNewConv();
    }
  }, [sessionId, activeConv, createNewConv, setActiveSession]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const query = input;
    setInput("");
    await sendMessage(query);
  };

  // Helper to format message text (replace ** bold with <b>)
  const formatMsg = (text) => {
    if (!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  };

  const messages = activeConv?.messages || [
    { role: "ai", content: `Hello! I'm your AI Analyst. I'm currently monitoring the ${activeStepName} phase. How can I help?` }
  ];

  const chatInterface = (
    <div className={`flex flex-col h-full ${isEmbedded ? 'bg-transparent' : 'bg-[#04050f]/90 backdrop-blur-3xl'} overflow-hidden`}>
      {/* Header - Only if not embedded */}
      {!isEmbedded && (
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Bot size={18} className="text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-tighter">Helper v2.0</h4>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-0.5">Current Step: {activeStepName}</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div 
              className={`max-w-[90%] p-4 rounded-2xl text-[12px] leading-relaxed font-medium transition-all duration-300
                ${msg.role === "user" ? "bg-primary text-white ml-6 shadow-lg shadow-primary/10" : "bg-white/5 text-gray-300 mr-6 border border-white/5"}
              `} 
              dangerouslySetInnerHTML={{ __html: formatMsg(msg.text || msg.content) }}
            />
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`p-4 ${isEmbedded ? 'bg-[#0a0a0b]' : 'bg-white/5'} border-t border-white/5`}>
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about model logic..."
            className="w-full bg-[#111113] border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-[12px] text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) return chatInterface;

  return (
    <div className="z-[1000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-8 w-[350px] md:w-[420px] rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[1001] h-[500px]"
          >
            {chatInterface}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 z-[1000]">
        <Button 
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 px-8 rounded-full flex items-center gap-3 transition-all duration-500 shadow-2xl
            ${isOpen ? "bg-white text-black translate-y-[-10px]" : "bg-primary text-white hover:scale-105 active:scale-95"}
          `}
        >
          <Sparkles size={18} className={isOpen ? "text-primary" : "text-white"} />
          <span className="text-xs font-black uppercase tracking-widest">{isOpen ? "Close Oracle" : "XAI Consultation"}</span>
        </Button>
      </div>
    </div>
  );
}
