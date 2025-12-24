
import React, { useState } from 'react';
import { Mail, Lock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { AppView, User } from '../../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (view: AppView) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem('careerlift_users') || '[]');
      const user = storedUsers.find((u: any) => u.email === email && u.password === password);

      if (user) {
        onLoginSuccess({ 
          name: user.name, 
          email: user.email, 
          tier: user.tier || 'free' 
        });
      } else {
        setError('Invalid credentials. Please verify your details.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-sm font-medium text-muted opacity-60">Access your professional dashboard</p>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-main bg-card shadow-sm">
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-xs font-bold animate-in shake duration-300">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted opacity-40" />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 bg-main border border-main rounded-xl outline-none focus:border-accent font-bold text-sm transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Password</label>
              <button type="button" className="text-[9px] font-black text-accent uppercase tracking-tighter hover:underline">Forgot?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted opacity-40" />
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-main border border-main rounded-xl outline-none focus:border-accent font-bold text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-accent text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover-bg-accent transition-all transform hover:translate-y-[-1px] shadow-lg disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ChevronRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-main text-center">
          <p className="text-xs font-medium text-muted">
            New to CareerLift?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-accent font-black hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
