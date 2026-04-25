import React, { useState } from 'react';
import { SendHorizonal, Loader2 } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#08090a] via-[#08090a] to-transparent">
      <form 
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto relative group"
      >
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder="Ask a question about your data..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-5 pr-12 py-4 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/50 transition-all shadow-2xl"
        />
        <button 
          type="submit"
          disabled={disabled || !input.trim()}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
            input.trim() && !disabled 
              ? 'bg-white text-black shadow-lg shadow-white/10' 
              : 'text-zinc-600'
          }`}
        >
          {disabled ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <SendHorizonal size={18} />
          )}
        </button>
      </form>
    </div>
  );
}
