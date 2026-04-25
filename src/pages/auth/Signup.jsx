import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';

export default function Signup() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    agree: false
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { signup, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setLocalError("Passwords do not match");
      return;
    }
    if (!formData.agree) {
      setLocalError("You must agree to the Terms and Privacy Policy");
      return;
    }
    
    setLoading(true);
    setLocalError('');
    const success = await signup(formData.email, formData.password, formData.full_name);
    setLoading(false);
    
    if (success) {
      // Linear style: on success, direct to login with a success state or just login
      navigate('/login', { state: { message: "Account created! Please log in." } });
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Create account</h1>
        <p className="text-sm text-zinc-500">Start your data journey today</p>
      </div>

      <form onSubmit={handleSubmit}>
        {(localError || authError) && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] text-red-400 font-medium">
            {localError || authError}
          </div>
        )}

          <AuthInput 
            label="Full name"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            required
          />
          
          <AuthInput 
            label="Email address"
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />

          <AuthInput 
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          <AuthInput 
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            value={formData.confirm_password}
            onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
            required
          />

          <div className="flex items-center gap-3 mt-6 mb-2 group cursor-pointer" onClick={() => setFormData({...formData, agree: !formData.agree})}>
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              formData.agree ? 'bg-white border-white text-black' : 'border-zinc-800 bg-white/[0.02]'
            }`}>
              {formData.agree && <svg size={10} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </div>
            <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors select-none">
              I agree to the <span className="text-zinc-300 hover:text-white underline cursor-pointer">Terms of Service</span> and <span className="text-zinc-300 hover:text-white underline cursor-pointer">Privacy Policy</span>
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-linear w-full py-2.5 mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

      <div className="mt-8 text-center text-xs text-zinc-500">
        Already have an account?{' '}
        <Link to="/login" className="text-white hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
