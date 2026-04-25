import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { apiClient } from '../api/api';

const KB = {}; // Cleared demo datasets

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const clearChat = useCallback(() => {
    setConversations([]);
    setActiveConvId(null);
    setActiveSession(null);
    setUnreadCount(0);
  }, []);

  const clearConversation = useCallback((id) => {
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, messages: [] } : c
    ));
  }, []);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const getReply = (query, sessionId) => {
    const sess = KB[sessionId] || KB.s1;
    const lq = query.toLowerCase();
    const match = sess.qa.find(item => lq.includes(item.key));
    if (match) return match.reply;
    return `Analysing your query against <strong>${sess.label}</strong>… Based on the <strong>${sess.model}</strong> model, this appears related to the top key factors. Could you be more specific?`;
  };

  const getFollowUps = (query) => {
    const lq = query.toLowerCase();
    if (lq.includes('drop') || lq.includes('q2')) return ['Worst affected regions?', 'Show details', 'How to fix?'];
    if (lq.includes('forecast') || lq.includes('q4')) return ['Confidence level?', 'Region breakdown'];
    return ['Show key factors', 'Next steps?', 'Tell me more'];
  };

  const sendMessage = async (text, role = 'user') => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    setConversations(prev => prev.map(c => 
      c.id === activeConvId ? { ...c, messages: [...c.messages, { role, text, time }] } : c
    ));

    if (role === 'user') {
      setIsTyping(true);
      
      try {
        const data = await apiClient.askAIContextual(activeSession, text);
        setIsTyping(false);
        
        // Add AI message
        setConversations(prev => prev.map(c => 
          c.id === activeConvId ? { ...c, messages: [...c.messages, { 
            role: 'ai', 
            text: data.answer, 
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            followups: ['Tell me more', 'Explore factors', 'Next steps?']
          }] } : c
        ));

        if (window.location.pathname !== '/chat') {
           setUnreadCount(prev => prev + 1);
        }
      } catch (err) {
        console.error("Chat error:", err);
        setIsTyping(false);
        setConversations(prev => prev.map(c => 
          c.id === activeConvId ? { ...c, messages: [...c.messages, { 
            role: 'ai', 
            text: "I seem to be having trouble reaching my knowledge base. Please ensure your session is active.", 
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          }] } : c
        ));
      }
    }
  };

  const createNewConv = () => {
    const id = Date.now();
    const newConv = {
      id,
      title: 'New intelligence session',
      sessionId: activeSession,
      time: 'now',
      messages: [{
        role: 'ai',
        text: "I've analyzed your data patterns. <strong>Region South</strong> shows a potential sales drop next month. Would you like me to explain why or suggest some price changes?",
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        followups: ['Explain Drop', 'Find Opportunities', 'Forecast Next Month']
      }]
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(id);
    return id;
  };

  const deleteConv = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(conversations[0]?.id || null);
    }
  };

  const value = {
    activeSession,
    setActiveSession,
    conversations,
    activeConvId,
    setActiveConvId,
    activeConv,
    isTyping,
    sendMessage,
    createNewConv,
    deleteConv,
    clearChat,
    clearConversation,
    unreadCount,
    setUnreadCount,
    KB
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => useContext(ChatContext);
