
import React, { useState } from 'react';
import { Search, MapPin, ExternalLink, Briefcase, Loader2, Filter, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { searchJobs } from '../services/gemini';
import { Job, EnhancedCV } from '../types';

interface JobBoardProps {
  userCV: string;
  enhancedCV: EnhancedCV | null;
}

const JobBoard: React.FC<JobBoardProps> = ({ userCV, enhancedCV }) => {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sources, setSources] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setIsSearching(true);
    
    // Construct search content based on whatever profile information we have
    // Prioritize the enhanced profile as it contains better keyword alignment
    let profileContent = userCV;
    if (enhancedCV) {
      // Fix: replaced non-existent 'qualifications' with flattened 'skills' and 'techStack'
      profileContent = `
        Executive Summary: ${enhancedCV.summary}
        Core Qualifications: ${enhancedCV.skills.flatMap(s => s.items).join(', ')}
        Tech Stack: ${enhancedCV.techStack}
        Work Experience: ${enhancedCV.experience.map(exp => `${exp.role} at ${exp.company}`).join('; ')}
      `;
    }

    try {
      const result = await searchJobs(role, location, profileContent);
      setJobs(result.jobs);
      setSources(result.sources);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const getMatchColor = (percentage?: number) => {
    if (percentage === undefined) return 'bg-main text-muted border-main';
    if (percentage >= 80) return 'bg-accent/10 text-accent border-accent font-black';
    if (percentage >= 50) return 'bg-amber-500/10 text-amber-500 border-amber-500 font-black';
    return 'bg-red-500/10 text-red-500 border-red-500 font-black';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 animate-in slide-in-from-bottom-4 duration-700 pb-40">
      {enhancedCV ? (
        <div className="mb-10 p-5 bg-accent/5 border border-accent/20 rounded-2xl flex items-center justify-between gap-4 text-main shadow-sm animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-accent text-white rounded-lg shadow-sm"><Sparkles className="w-5 h-5 flex-shrink-0" /></div>
            <p className="text-sm font-bold opacity-90">
              Enhanced matching enabled. Using your <span className="text-accent underline">Optimized Narrative</span> for precision ranking.
            </p>
          </div>
          <div className="hidden md:block px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[9px] font-black text-accent uppercase tracking-widest">Profile Linked</div>
        </div>
      ) : !userCV && (
        <div className="mb-10 p-5 bg-accent/5 border border-accent/20 rounded-2xl flex items-center gap-4 text-main shadow-sm">
          <div className="p-2 bg-accent text-white rounded-lg shadow-sm"><AlertCircle className="w-5 h-5 flex-shrink-0" /></div>
          <p className="text-sm font-bold opacity-90">
            Personalize your search: <span className="text-accent underline">Import a profile</span> to enable match scoring.
          </p>
        </div>
      )}

      <div className="glass-card rounded-3xl p-10 bg-card border border-main shadow-sm mb-16">
        <h2 className="text-2xl font-black mb-8 tracking-tight">Curated <span className="text-accent">Opportunities</span></h2>
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accent w-4 h-4 opacity-70" />
            <input 
              type="text" 
              placeholder="Position, Expertise, or Firm"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-main border border-main outline-none focus:border-accent font-bold text-sm transition-all"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="lg:w-1/4 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-accent w-4 h-4 opacity-70" />
            <input 
              type="text" 
              placeholder="Location or Remote"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-main border border-main outline-none focus:border-accent font-bold text-sm transition-all"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="px-8 py-3.5 bg-accent text-white rounded-xl font-black text-sm hover-bg-accent transition-all transform hover:translate-y-[-2px] shadow-lg flex items-center justify-center gap-2 min-w-[140px]"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Search <ChevronRight className="w-3.5 h-3.5" /></>}
          </button>
        </form>
      </div>

      <div className="grid lg:grid-cols-4 gap-10">
        <div className="hidden lg:block space-y-8">
          <div className="glass-card p-6 rounded-2xl bg-card border border-main shadow-sm">
            <h3 className="text-xs font-black mb-6 flex items-center gap-2 text-muted uppercase tracking-widest">
              Refinement
            </h3>
            <div className="space-y-5">
              <FilterItem label="Remote" count={12} />
              <FilterItem label="Contract" count={8} />
              <FilterItem label="Permanent" count={45} />
              <FilterItem label="Executive" count={5} />
            </div>
          </div>
          <div className="bg-accent rounded-3xl p-6 text-white shadow-xl">
            <h4 className="text-sm font-black mb-2 uppercase tracking-tight">Intelligence</h4>
            <p className="text-xs font-bold opacity-80 mb-6 leading-relaxed">Automated matching alerts for top-tier positions based on your enhanced CV.</p>
            <button className="w-full py-2.5 bg-white text-accent font-black rounded-lg text-[10px] uppercase hover:bg-white/90 transition-all">Enable AI Agent</button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {isSearching ? (
            <div className="py-24 text-center glass-card rounded-3xl border border-main bg-card">
              <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
              <p className="text-lg font-black mb-1">Scanning Market</p>
              <p className="text-muted text-sm font-bold opacity-60">Curating the most relevant placements...</p>
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6 px-2">
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Showing <span className="text-accent">{jobs.length}</span> results</p>
              </div>
              {jobs.map((job, idx) => (
                <div key={idx} className="glass-card p-8 rounded-3xl border border-main bg-card hover:border-accent shadow-sm hover:shadow-md transition-all transform hover:translate-x-1">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold tracking-tight">{job.title}</h3>
                        {(userCV || enhancedCV) && job.matchPercentage !== undefined && (
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border flex items-center gap-1 ${getMatchColor(job.matchPercentage)}`}>
                            <Sparkles className="w-3 h-3" />
                            {job.matchPercentage}% RANKING
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-5 text-muted text-sm font-bold mb-4">
                        <span className="flex items-center gap-1.5 opacity-80"><Briefcase className="w-3.5 h-3.5 text-accent" /> {job.company}</span>
                        <span className="flex items-center gap-1.5 opacity-80"><MapPin className="w-3.5 h-3.5 text-accent" /> {job.location}</span>
                      </div>
                      <p className="text-sm leading-relaxed font-medium opacity-70 text-main line-clamp-2">{job.descriptionSnippet}</p>
                    </div>
                    <a 
                      href={job.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-auto px-6 py-3 bg-main border border-main text-accent rounded-xl font-bold text-xs hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      View Details <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
              {sources.length > 0 && (
                <div className="mt-12 p-6 bg-main border border-main rounded-2xl shadow-inner">
                  <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-4">Verified Sources</p>
                  <div className="flex flex-wrap gap-3">
                    {sources.map((src, i) => (
                      src.web && (
                        <a key={i} href={src.web.uri} target="_blank" className="px-3 py-1 bg-card border border-main rounded-lg text-[10px] font-bold text-muted hover:text-accent transition-all">
                          {src.web.title || "External Feed"}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center glass-card rounded-3xl border-dashed border-2 border-main opacity-40 bg-main/10">
              <div className="p-6 bg-card border border-main rounded-full w-fit mx-auto mb-6"><Briefcase className="w-8 h-8 text-muted" /></div>
              <h3 className="text-lg font-black mb-2">Feed Idle</h3>
              <p className="text-xs font-bold max-w-[200px] mx-auto text-muted opacity-80">Refine your criteria to initialize the curated board.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterItem: React.FC<{ label: string, count: number }> = ({ label, count }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <div className="flex items-center gap-3">
      <div className="relative flex items-center">
        <input type="checkbox" className="peer w-5 h-5 rounded-lg appearance-none bg-main border border-main checked:bg-accent checked:border-accent transition-all cursor-pointer" />
        <Sparkles className="absolute left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
      </div>
      <span className="text-sm font-bold opacity-70 group-hover:opacity-100 transition-opacity leading-none text-main tracking-tight">{label}</span>
    </div>
    <span className="px-2 py-0.5 bg-main rounded-md text-[9px] font-black text-muted border border-main">{count}</span>
  </label>
);

export default JobBoard;
