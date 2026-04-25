import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Welcome back</h1>
        <p className="text-sm text-zinc-500">Log in to your AnalytixAI account</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] text-red-400 font-medium">
            {error}
          </div>
        )}
          
          <AuthInput 
            label="Email address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <AuthInput 
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          <Link 
            to="/forgot-password" 
            className="absolute top-0.5 right-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
          >
            Forgot?
          </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-linear w-full py-2.5 mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

      <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
        <p className="text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-white hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
