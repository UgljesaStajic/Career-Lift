
import React, { useState, useEffect } from 'react';
import { Layout, FileText, Search, Video, Home, ChevronRight, Settings as SettingsIcon, Briefcase, User as UserIcon, BookOpen } from 'lucide-react';
import { AppView, Theme, User, EnhancedCV, SavedCV } from './types';
import CVEnhancer from './components/CVEnhancer';
import JobBoard from './components/JobBoard';
import Resumes from './components/Resumes';
import VirtualInterview from './components/VirtualInterview';
import Settings from './components/Settings';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [userCV, setUserCV] = useState<string>(() => localStorage.getItem('careerlift_cv') || '');
  
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>(() => {
    const stored = localStorage.getItem('careerlift_saved_cvs');
    return stored ? JSON.parse(stored) : [];
  });

  const [activeCVId, setActiveCVId] = useState<string | null>(() => 
    localStorage.getItem('careerlift_active_cv_id')
  );

  const [editTarget, setEditTarget] = useState<{ rawText: string, jobDescription: string } | null>(null);

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('careerlift_theme') as Theme) || 'light');
  
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('careerlift_session');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    localStorage.setItem('careerlift_cv', userCV);
  }, [userCV]);

  useEffect(() => {
    localStorage.setItem('careerlift_saved_cvs', JSON.stringify(savedCVs));
  }, [savedCVs]);

  useEffect(() => {
    if (activeCVId) {
      localStorage.setItem('careerlift_active_cv_id', activeCVId);
    } else {
      localStorage.removeItem('careerlift_active_cv_id');
    }
  }, [activeCVId]);

  useEffect(() => {
    localStorage.setItem('careerlift_theme', theme);
    document.body.className = `theme-${theme}`;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleSaveEnhancedCV = (enhanced: EnhancedCV, raw: string, jobDesc: string, userImage?: string) => {
    const newSaved: SavedCV = {
      id: crypto.randomUUID(),
      data: enhanced,
      rawText: raw,
      jobDescription: jobDesc,
      timestamp: Date.now(),
      userImage: userImage
    };
    setSavedCVs(prev => [newSaved, ...prev]);
    setActiveCVId(newSaved.id);
    setCurrentView('resumes');
  };

  const handleEditResume = (cv: SavedCV) => {
    setEditTarget({ rawText: cv.rawText, jobDescription: cv.jobDescription });
    setCurrentView('cv-enhancer');
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('careerlift_session', JSON.stringify(userData));
    setCurrentView('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('careerlift_session');
    localStorage.removeItem('careerlift_saved_cvs');
    localStorage.removeItem('careerlift_active_cv_id');
    setSavedCVs([]);
    setActiveCVId(null);
    setCurrentView('login');
  };

  const getActiveCV = () => {
    if (!activeCVId) return null;
    return savedCVs.find(cv => cv.id === activeCVId)?.data || null;
  };

  const renderView = () => {
    const protectedViews: AppView[] = ['resumes', 'cv-enhancer', 'job-board', 'interview'];
    if (protectedViews.includes(currentView) && !user) {
      return <Login onLoginSuccess={handleLoginSuccess} onNavigate={setCurrentView} />;
    }

    switch (currentView) {
      case 'login': return <Login onLoginSuccess={handleLoginSuccess} onNavigate={setCurrentView} />;
      case 'register': return <Register onRegisterSuccess={handleLoginSuccess} onNavigate={setCurrentView} />;
      case 'resumes':
        return <Resumes 
          savedCVs={savedCVs} 
          setSavedCVs={setSavedCVs}
          activeCVId={activeCVId}
          setActiveCVId={setActiveCVId}
          onNavigate={setCurrentView}
          onEdit={handleEditResume}
        />;
      case 'cv-enhancer': 
        return <CVEnhancer 
          onCVUpdate={setUserCV} 
          onEnhancedCVUpdate={handleSaveEnhancedCV} 
          currentCV={editTarget?.rawText || userCV} 
          initialJobDescription={editTarget?.jobDescription || ''}
          user={user} 
        />;
      case 'job-board': 
        return <JobBoard userCV={userCV} enhancedCV={getActiveCV()} />;
      case 'interview': return <VirtualInterview />;
      case 'settings': return <Settings theme={theme} setTheme={setTheme} user={user} onLogout={handleLogout} />;
      default: return (
        <div className="max-w-5xl mx-auto px-6 py-20 pb-40 animate-in fade-in duration-1000">
          <div className="text-center mb-24">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
              Elevate Your <span className="text-accent">Career</span> with AI
            </h1>
            <p className="text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed text-muted opacity-80">
              A bespoke suite of professional tools designed to refine your narrative, discover opportunities, and master the interview.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card 
              icon={<BookOpen className="w-6 h-6 text-accent" />}
              title="Resume Library"
              description="Your curated repository of optimized executive profiles ready for deployment."
              onClick={() => { setEditTarget(null); user ? setCurrentView('resumes') : setCurrentView('login'); }}
            />
            <Card 
              icon={<FileText className="w-6 h-6 text-accent" />}
              title="CV Enhancer"
              description="A precision-engineered rewrite that aligns your professional history with market demands."
              onClick={() => { setEditTarget(null); user ? setCurrentView('cv-enhancer') : setCurrentView('login'); }}
            />
            <Card 
              icon={<Briefcase className="w-6 h-6 text-accent" />}
              title="Job Board"
              description="Real-time access to the most prestigious openings, curated for your expertise."
              onClick={() => { setEditTarget(null); user ? setCurrentView('job-board') : setCurrentView('login'); }}
            />
          </div>

          <div className="mt-8 flex justify-center">
            <Card 
              icon={<Video className="w-6 h-6 text-accent" />}
              title="Virtual Interview"
              description="Immersive simulation for high-stakes roles."
              onClick={() => { setEditTarget(null); user ? setCurrentView('interview') : setCurrentView('login'); }}
              badge="Elite"
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-main`}>
      <nav className="sticky top-0 z-[60] bg-main/70 backdrop-blur-xl border-b border-main">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setCurrentView('home')}>
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <Layout className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold tracking-tighter">CareerLift <span className="text-accent font-black">AI</span></span>
            </div>
            
            <div className="hidden md:flex gap-10">
              <NavItem active={currentView === 'resumes'} onClick={() => { setEditTarget(null); setCurrentView('resumes'); }}>Library</NavItem>
              <NavItem active={currentView === 'cv-enhancer'} onClick={() => { setEditTarget(null); setCurrentView('cv-enhancer'); }}>Enhancer</NavItem>
              <NavItem active={currentView === 'job-board'} onClick={() => { setEditTarget(null); setCurrentView('job-board'); }}>Board</NavItem>
              <NavItem active={currentView === 'interview'} onClick={() => { setEditTarget(null); setCurrentView('interview'); }}>Interview</NavItem>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div onClick={() => setCurrentView('settings')} className="flex items-center gap-2.5 p-1.5 pl-3 border border-main rounded-xl hover:bg-card cursor-pointer transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">{user.name.split(' ')[0]}</span>
                  <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5 text-accent" />
                  </div>
                </div>
              ) : (
                <button onClick={() => setCurrentView('login')} className="text-xs font-bold text-accent px-4 py-2 border border-accent/20 rounded-xl hover:bg-accent/5 transition-all">
                  Sign In
                </button>
              )}
              <button 
                onClick={() => setCurrentView('settings')}
                className={`p-2 rounded-lg transition-all ${currentView === 'settings' ? 'bg-accent text-white' : 'hover:bg-card border border-transparent hover:border-main text-muted hover:text-main'}`}
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">{renderView()}</main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg">
        <div className="bg-card/90 border-main border rounded-full px-6 py-3 flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <BottomTabItem active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home className="w-5 h-5" />} label="Home" />
          <BottomTabItem active={currentView === 'resumes'} onClick={() => { setEditTarget(null); setCurrentView('resumes'); }} icon={<BookOpen className="w-5 h-5" />} label="Resumes" />
          <BottomTabItem active={currentView === 'cv-enhancer'} onClick={() => { setEditTarget(null); setCurrentView('cv-enhancer'); }} icon={<FileText className="w-5 h-5" />} label="Enhancer" />
          <BottomTabItem active={currentView === 'job-board'} onClick={() => { setEditTarget(null); setCurrentView('job-board'); }} icon={<Search className="w-5 h-5" />} label="Jobs" />
          <BottomTabItem active={currentView === 'interview'} onClick={() => { setEditTarget(null); setCurrentView('interview'); }} icon={<Video className="w-5 h-5" />} label="Interview" />
        </div>
      </div>

      <footer className="opacity-30 py-12 mb-20 text-center text-[10px] font-bold tracking-widest uppercase">
        <p>© 2024 CareerLift AI • Precision Careers for the Global Elite</p>
      </footer>
    </div>
  );
};

const Card: React.FC<{ icon: React.ReactNode, title: string, description: string, onClick: () => void, badge?: string }> = ({ icon, title, description, onClick, badge }) => (
  <div onClick={onClick} className="glass-card group p-8 rounded-3xl border border-main hover:border-accent hover:shadow-xl transition-all cursor-pointer flex flex-col h-full transform hover:translate-y-[-4px]">
    <div className="mb-6 p-3.5 bg-main border border-main rounded-2xl w-fit shadow-sm">{icon}</div>
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-lg font-bold group-hover:text-accent transition-colors leading-tight tracking-tight">{title}</h3>
      {badge && <span className="text-[9px] uppercase font-black px-2 py-0.5 bg-accent/10 text-accent rounded-full border border-accent/20">{badge}</span>}
    </div>
    <p className="text-sm leading-relaxed flex-grow text-muted font-medium opacity-80">{description}</p>
    <div className="mt-8 flex items-center text-accent font-bold gap-1 group-hover:gap-2 transition-all text-xs">
      Enter Service <ChevronRight className="w-3 h-3" />
    </div>
  </div>
);

const NavItem: React.FC<{ children: React.ReactNode, active: boolean, onClick: () => void }> = ({ children, active, onClick }) => (
  <button onClick={onClick} className={`text-xs font-bold transition-all tracking-tight ${active ? 'text-accent' : 'text-muted hover:text-main'}`}>{children}</button>
);

const BottomTabItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-accent scale-105' : 'text-muted hover:text-accent'}`}>
    {icon}
    <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'block' : 'hidden'}`}>{label}</span>
  </button>
);

export default App;
