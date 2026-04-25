import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SettingsSection from '../../components/settings/SettingsSection';
import { LogOut, Shield, User, CreditCard, CheckCircle2, ChevronRight, Key } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || ''
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="animate-fade-in max-w-5xl py-4">
      <header className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Account Settings</h1>
        <p className="text-sm text-zinc-500">Manage your workspace identity, security, and global preferences.</p>
      </header>

      <div className="space-y-4">
        {/* Profile Section */}
        <SettingsSection 
          title="Identity" 
          description="Your personal information is used for identification across neural workspace sessions."
        >
          <form onSubmit={handleSave} className="card-linear p-6 space-y-6 bg-white/[0.01]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Display Name</label>
                <input 
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="input-linear w-full"
                  placeholder="e.g. Rajveer Singhal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative group">
                  <input 
                    type="email"
                    value={formData.email}
                    readOnly
                    className="input-linear w-full opacity-40 cursor-not-allowed bg-white/[0.01]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] bg-black border border-white/10 text-zinc-500 px-2 py-0.5 rounded">Contact support to change</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end pt-2">
              <button 
                type="submit" 
                disabled={saving || !formData.full_name}
                className="btn-linear flex items-center gap-2 min-w-[140px] justify-center"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : success ? (
                  <>
                    <CheckCircle2 size={14} />
                    Saved
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </SettingsSection>

        {/* Plan Section */}
        <SettingsSection 
          title="Billing & Usage" 
          description="Monitor your compute usage and manage your subscription tiers."
        >
          <div className="card-linear p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white/[0.01]">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white">
                <Shield size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-white uppercase tracking-tight">
                    {user?.tier || 'Pro'} Tier
                  </p>
                  <span className="badge-linear badge-info">Active</span>
                </div>
                <p className="text-[12px] text-zinc-500">Your next billing cycle starts in 12 days.</p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex flex-col gap-3">
              <div className="flex items-center justify-between text-[11px] mb-1 px-1">
                <span className="text-zinc-500 font-bold uppercase tracking-widest">Workspace Usage</span>
                <span className="text-zinc-400">74% of 50GB</span>
              </div>
              <div className="w-full sm:w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 rounded-full" style={{ width: '74%' }} />
              </div>
              <button className="btn-secondary w-full text-[11px] font-bold uppercase tracking-widest py-2">Manage Subscription</button>
            </div>
          </div>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection 
          title="Privacy & Security" 
          description="Control your authentication methods and data isolation settings."
        >
          <div className="card-linear p-0 bg-white/[0.01]">
            {[
              { icon: Key, label: 'Change Password', desc: 'Update your login credentials' },
              { icon: CreditCard, label: 'Billing Methods', desc: 'Manage credit cards and invoices' },
              { icon: User, label: 'Data Export', desc: 'Download a copy of your analysis history' }
            ].map((item, i) => (
              <button 
                key={i} 
                className="w-full flex items-center justify-between p-5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-zinc-500 group-hover:text-white transition-colors">
                    <item.icon size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-[11px] text-zinc-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection 
          title="Danger Zone" 
          description="Actions here are permanent and cannot be reversed. Use with caution."
        >
          <div className="card-linear border-rose-500/20 bg-rose-500/[0.02] p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Log out of Session</h4>
                <p className="text-[12px] text-zinc-500">End your current session on this device. Your data will remain synced.</p>
              </div>
              <button 
                onClick={logout}
                className="btn-secondary border-rose-500/30 hover:bg-rose-500/10 text-rose-400 px-8 py-2.5 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 w-full sm:w-auto"
              >
                <LogOut size={14} />
                Logout Account
              </button>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
