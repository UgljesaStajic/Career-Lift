
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { AppView, User } from '../../types';

interface RegisterProps {
  onRegisterSuccess: (user: User) => void;
  onNavigate: (view: AppView) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem('careerlift_users') || '[]');
      
      // Check if email already exists
      if (storedUsers.some((u: any) => u.email === email)) {
        alert("This email is already registered.");
        setIsLoading(false);
        return;
      }

      const newUser = { name, email, password };
      storedUsers.push(newUser);
      localStorage.setItem('careerlift_users', JSON.stringify(storedUsers));
      
      setIsSuccess(true);
      setTimeout(() => {
        onRegisterSuccess({ name, email });
      }, 800);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2 tracking-tight">Create Profile</h2>
        <p className="text-sm font-medium text-muted opacity-60">Join the elite cohort of career professionals</p>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-main bg-card shadow-sm">
        {!isSuccess ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted opacity-40" />
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-main border border-main rounded-xl outline-none focus:border-accent font-bold text-sm transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted opacity-40" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-main border border-main rounded-xl outline-none focus:border-accent font-bold text-sm transition-all"
                  placeholder="Min. 6 characters"
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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Register <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <div className="py-12 text-center animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">Success</h3>
            <p className="text-sm font-medium text-muted">Your professional profile is ready.</p>
          </div>
        )}

        {!isSuccess && (
          <div className="mt-8 pt-6 border-t border-main text-center">
            <p className="text-xs font-medium text-muted">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-accent font-black hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
