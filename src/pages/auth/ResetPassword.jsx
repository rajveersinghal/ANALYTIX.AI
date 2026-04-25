import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { resetPassword, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    
    if (!token) {
      setLocalError("Invalid or missing reset token");
      return;
    }

    setLoading(true);
    setLocalError('');
    const success = await resetPassword(token, password);
    setLoading(false);
    
    if (success) {
      navigate('/login', { state: { message: "Neural token synchronized! Please log in." } });
    }
  };

  return (
    <AuthLayout>
      <AuthCard 
        title="Sync Credentials" 
        subtitle="Establish a new secure neural access token."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {(localError || authError) && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-3 text-rose-400 animate-in shake duration-500">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-[12px] font-medium leading-relaxed">{localError || authError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">New Password</label>
              <input 
                type="password"
                placeholder="••••••••"
                className="input-linear w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Confirm Identity</label>
              <input 
                type="password"
                placeholder="••••••••"
                className="input-linear w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !password}
            className="btn-linear w-full py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck size={16} />
                Reset Credentials
              </>
            )}
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
