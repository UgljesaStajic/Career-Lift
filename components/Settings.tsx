
import React, { useState } from 'react';
import { Sun, Moon, Palette, Shield, User as UserIcon, LogOut, Crown, ChevronRight, Languages, CreditCard, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Theme, User, Language } from '../types';
import { translations } from '../translations';

interface SettingsProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User | null;
  onLogout: () => void;
  onPricingNavigate: () => void;
  onUnsubscribe: () => void;
  onDeleteAccount: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme, user, onLogout, onPricingNavigate, onUnsubscribe, onDeleteAccount, language, setLanguage }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmUnsub, setShowConfirmUnsub] = useState(false);
  const [paymentUpdateStatus, setPaymentUpdateStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const t = translations[language] || translations.en;

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

  const langs: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'nl', label: 'Nederlands' },
    { id: 'de', label: 'Deutsch' },
    { id: 'es', label: 'Español' },
    { id: 'pt', label: 'Português' },
    { id: 'fr', label: 'Français' },
    { id: 'sr', label: 'Srpski' },
    { id: 'zh', label: '中文' },
    { id: 'ar', label: 'العربية' }
  ];

  const handleUpdatePayment = () => {
    setPaymentUpdateStatus('loading');
    setTimeout(() => setPaymentUpdateStatus('success'), 1500);
    setTimeout(() => setPaymentUpdateStatus('idle'), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-1000 pb-40">
      <h2 className="text-2xl font-black mb-12 tracking-tighter uppercase opacity-80">{t.settingsTitle}</h2>
      
      <div className="space-y-8">
        {/* Professional Profile */}
        <section className="glass-card rounded-3xl p-8 border border-main shadow-sm bg-card relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-card border border-main rounded-xl shadow-sm"><UserIcon className="w-5 h-5 text-accent" /></div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{t.profile}</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">{t.accountDetails}</p>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col gap-8">
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
                  <LogOut className="w-3.5 h-3.5" /> {t.signOut}
                </button>
              </div>

              <div className="p-6 bg-main border border-main rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-accent/10 rounded-lg"><Crown className="w-5 h-5 text-accent" /></div>
                  <div>
                    <div className="text-sm font-black tracking-tight flex items-center gap-2 uppercase">
                      {t.plan}: {user.tier}
                    </div>
                    <p className="text-[10px] font-bold text-muted opacity-60">{t.manageSub}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {user.tier !== 'free' && (
                    <button 
                      onClick={() => setShowConfirmUnsub(true)}
                      className="flex-grow md:flex-none px-4 py-2 bg-card border border-main rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-red-500/30 hover:text-red-500 transition-all"
                    >
                      {t.unsubscribe}
                    </button>
                  )}
                  <button 
                    onClick={onPricingNavigate}
                    className="flex-grow md:flex-none px-4 py-2 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs font-bold text-muted mb-4 opacity-60">Authentication required for full profile management.</p>
            </div>
          )}
        </section>

        {/* Language Selection */}
        <section className="glass-card rounded-3xl p-8 border border-main shadow-sm bg-card relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-card border border-main rounded-xl shadow-sm"><Languages className="w-5 h-5 text-accent" /></div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{t.language}</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">{t.selectLang}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {langs.map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`px-4 py-3 rounded-xl border-2 transition-all text-xs font-bold ${
                  language === l.id 
                    ? 'border-accent bg-accent/5 text-accent shadow-sm' 
                    : 'border-main bg-main/40 text-muted hover:border-accent/40'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* Appearance */}
        <section className="glass-card rounded-3xl p-8 border border-main shadow-sm bg-card relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-card border border-main rounded-xl shadow-sm"><Palette className="w-5 h-5 text-accent" /></div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{t.appearance}</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">{t.aesthetics}</p>
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
              </button>
            ))}
          </div>
        </section>

        {/* Billing & Payment */}
        <section className="glass-card rounded-3xl p-8 border border-main shadow-sm bg-card relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-card border border-main rounded-xl shadow-sm"><CreditCard className="w-5 h-5 text-accent" /></div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{t.billing}</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">{t.paymentDetails}</p>
            </div>
          </div>
          
          <div className="p-6 bg-main border border-main rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-sm font-black opacity-80">•••• •••• •••• 4242</p>
                <p className="text-[10px] font-bold text-muted opacity-60 uppercase tracking-widest">Expires 12/26</p>
              </div>
            </div>
            <button 
              onClick={handleUpdatePayment}
              disabled={paymentUpdateStatus !== 'idle'}
              className="w-full md:w-auto px-6 py-2.5 bg-card border border-main rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2"
            >
              {paymentUpdateStatus === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 
               paymentUpdateStatus === 'success' ? <CheckCircle className="w-3.5 h-3.5 text-accent" /> : 
               t.updatePayment}
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="glass-card rounded-3xl p-8 border border-red-500/20 shadow-sm bg-red-500/[0.02] relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-card border border-red-500/20 rounded-xl shadow-sm"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-red-500">{t.dangerZone}</h3>
              <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest opacity-60">Irreversible professional actions</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => setShowConfirmDelete(true)}
              className="flex-grow px-6 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> {t.deleteAccount}
            </button>
          </div>
        </section>
      </div>

      {/* Confirmation Modals */}
      {(showConfirmDelete || showConfirmUnsub) && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-card w-full max-w-md p-10 rounded-[2.5rem] border border-main shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-black text-center mb-4 tracking-tighter">
              {showConfirmDelete ? t.deleteAccount : t.unsubscribe}
            </h3>
            <p className="text-center text-sm font-medium text-muted opacity-80 leading-relaxed mb-10">
              {showConfirmDelete ? t.deleteConfirm : t.unsubConfirm}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => { setShowConfirmDelete(false); setShowConfirmUnsub(false); }}
                className="flex-1 py-4 bg-main border border-main rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-card"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (showConfirmDelete) onDeleteAccount();
                  else if (showConfirmUnsub) { onUnsubscribe(); setShowConfirmUnsub(false); }
                }}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Loader2 = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default Settings;
