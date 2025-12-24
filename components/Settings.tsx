
import React from 'react';
import { Sun, Moon, Palette, Shield, User as UserIcon, LogOut } from 'lucide-react';
import { Theme, User } from '../types';

interface SettingsProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User | null;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme, user, onLogout }) => {
  const themes: { id: Theme; label: string; icon: React.ReactNode; desc: string; accent: string }[] = [
    { 
      id: 'light', 
      label: 'Light / Blue', 
      icon: <Sun className="w-5 h-5" />, 
      desc: 'Elegant white and soft gray with a precise cobalt accent.',
      accent: 'bg-blue-500'
    },
    { 
      id: 'dark', 
      label: 'Dark / Emerald', 
      icon: <Moon className="w-5 h-5" />, 
      desc: 'Deep obsidian interface with a vibrant emerald highlight.',
      accent: 'bg-green-500'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 animate-in fade-in duration-1000 pb-40">
      <h2 className="text-2xl font-black mb-12 tracking-tighter uppercase opacity-80">Configuration</h2>
      
      <div className="space-y-8">
        {/* User Account Section */}
        <section className="glass-card rounded-3xl p-8 border border-main shadow-sm bg-card relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-card border border-main rounded-xl shadow-sm"><UserIcon className="w-5 h-5 text-accent" /></div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Professional Profile</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">Account details</p>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20">
                  <span className="text-accent font-black text-lg">{user.name[0]}</span>
                </div>
                <div>
                  <div className="text-base font-bold tracking-tight">{user.name}</div>
                  <div className="text-xs font-medium text-muted opacity-60">{user.email}</div>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs font-bold text-muted mb-4 opacity-60">Authentication required for full profile management.</p>
              <button className="text-accent font-black text-xs hover:underline">Link an account</button>
            </div>
          )}
        </section>

        {/* Appearance Section */}
        <section className="glass-card rounded-3xl p-8 border border-main shadow-sm relative overflow-hidden bg-card">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-card border border-main rounded-xl shadow-sm"><Palette className="w-5 h-5 text-accent" /></div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Appearance</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">Interface aesthetics</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`group flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all transform hover:translate-y-[-2px] ${
                  theme === t.id 
                    ? 'border-accent bg-main text-main shadow-md' 
                    : 'border-transparent bg-main/40 hover:bg-main opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm transition-transform group-hover:scale-105 ${
                  theme === t.id ? 'bg-accent text-white' : 'bg-card border border-main'
                }`}>
                  {t.icon}
                </div>
                <div className="text-base font-bold mb-2 tracking-tight">{t.label}</div>
                <div className="text-[11px] font-medium text-muted leading-relaxed max-w-[160px] opacity-80">{t.desc}</div>
                <div className={`mt-5 w-full h-1 rounded-full ${t.accent} opacity-20`}></div>
              </button>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6 border border-main opacity-40 grayscale cursor-not-allowed transform scale-[0.98] transition-all bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-main border border-main rounded-lg shadow-sm"><Shield className="w-4 h-4 text-muted" /></div>
            <h3 className="text-sm font-bold opacity-80">Advanced Encryption</h3>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
