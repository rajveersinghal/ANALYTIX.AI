import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Zap, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

const TierGuard = ({ children, requiredTier = 'pro' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Let ProtectedRoute handle initial loading

  const userTier = user?.tier || 'free';
  
  // Basic logic: if required is 'pro', and user is 'free', block access
  if (requiredTier === 'pro' && userTier === 'free') {
    return (
      <div className="view active flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0d1026] border border-violet/20 rounded-3xl p-8 text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-violet/10 rounded-2xl flex items-center justify-center text-violet mx-auto mb-6">
            <Zap size={32} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-black text-white syne mb-3">Premium <span className="hl">Intelligence</span> Locked</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            The {location.pathname.replace('/', '').toUpperCase()} module is reserved for AnalytixAI Pro members. 
            Upgrade your neural capacity to unlock advanced forecasting and strategic narratives.
          </p>
          <div className="flex flex-col gap-3">
            <Button 
                onClick={() => window.location.href = '/pricing'}
                className="w-full py-4 bg-gradient-to-r from-violet to-indigo text-white font-bold rounded-xl"
            >
                Upgrade to Pro
            </Button>
            <Button 
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                className="w-full py-4 border-white/5 text-slate-400 hover:text-white"
            >
                Return to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return children;
};

export default TierGuard;
