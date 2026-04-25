import React from 'react';
import { User, Sparkles } from 'lucide-react';

export default function MessageItem({ message }) {
  const isAI = message.role === 'ai';

  return (
    <div className={`flex gap-4 py-8 ${isAI ? 'bg-white/[0.01]' : ''} border-b border-white/[0.03]`}>
      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
        isAI ? 'bg-white/5 text-white' : 'bg-zinc-800 text-zinc-400'
      }`}>
        {isAI ? <Sparkles size={16} /> : <User size={16} />}
      </div>
      
      <div className="flex-1 space-y-4">
        <p className="text-[14px] leading-relaxed text-zinc-200 whitespace-pre-wrap">
          {typeof message.content === 'string' 
            ? message.content.replace(/\*\*/g, '').replace(/__/g, '').replace(/`/g, '') 
            : message.content}
        </p>

        {isAI && message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.citations.map((cite, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.08] text-[10px] font-mono text-zinc-500">
                {cite}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
