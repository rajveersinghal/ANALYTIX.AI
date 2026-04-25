import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await forgotPassword(email);
    setLoading(false);
    if (success) setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthLayout>
        <AuthCard 
          title="Verification link sent" 
          subtitle="We've transmitted a secure reset token to your inbox."
        >
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center text-white mb-8">
              <Mail size={32} />
            </div>
            <p className="text-[13px] text-zinc-500 text-center leading-relaxed mb-10 max-w-[280px]">
              If an account is associated with <span className="text-white font-medium">{email}</span>, you will receive a reset link shortly.
            </p>
            <Link to="/login" className="btn-linear w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm">
              <ArrowLeft size={16} />
              Return to Login
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard 
        title="Account Recovery" 
        subtitle="Enter your email to initiate a neural token reset."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-3 text-rose-400 animate-in shake duration-500">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-[12px] font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Email Address</label>
            <input 
              type="email"
              placeholder="name@company.com"
              className="input-linear w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !email}
            className="btn-linear w-full py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              'Send Recovery Link'
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link to="/login" className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-2">
            <ArrowLeft size={14} />
            Back to Workspace Identity
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
