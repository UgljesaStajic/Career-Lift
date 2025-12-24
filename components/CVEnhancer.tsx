
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Sparkles, ArrowRight, Loader2, Download, FileText, Camera, User as UserIcon, CheckCircle, Phone, Mail as MailIcon, MapPin, Globe, AlertTriangle } from 'lucide-react';
import { enhanceCV } from '../services/gemini';
import { EnhancedCV, User } from '../types';

interface CVEnhancerProps {
  currentCV: string;
  initialJobDescription?: string;
  onCVUpdate: (cv: string) => void;
  onEnhancedCVUpdate: (enhanced: EnhancedCV, raw: string, jobDesc: string, userImage?: string) => void;
  user: User | null;
  savedCVCount: number;
  onPricingNavigate: () => void;
}

const CVEnhancer: React.FC<CVEnhancerProps> = ({ currentCV, initialJobDescription = '', onCVUpdate, onEnhancedCVUpdate, user, savedCVCount, onPricingNavigate }) => {
  const [cvText, setCvText] = useState(currentCV);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<EnhancedCV | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCvText(currentCV);
  }, [currentCV]);

  useEffect(() => {
    setJobDescription(initialJobDescription);
  }, [initialJobDescription]);

  const resumeLimit = user?.tier === 'pro' ? Infinity : user?.tier === 'plus' ? 10 : 1;
  const isOverLimit = savedCVCount >= resumeLimit;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCvText(text);
        onCVUpdate(text);
      };
      reader.readAsText(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualTextChange = (text: string) => {
    setCvText(text);
    onCVUpdate(text);
  };

  const handleEnhance = async () => {
    if (!cvText || !jobDescription) return;
    if (isOverLimit) {
      onPricingNavigate();
      return;
    }
    
    setIsProcessing(true);
    try {
      const enhanced = await enhanceCV(cvText, jobDescription);
      setResult(enhanced);
      onEnhancedCVUpdate(enhanced, cvText, jobDescription, userImage || undefined);
    } catch (error) {
      console.error(error);
      alert("Enhancement failed. Please check your API key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    setIsDownloading(true);
    
    setTimeout(async () => {
      const element = resumeRef.current;
      const opt = {
        margin: [10, 0, 10, 0],
        filename: `${user?.name.replace(/\s+/g, '_') || 'Portfolio'}_CV.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 4, 
          useCORS: true, 
          letterRendering: true, 
          scrollY: 0, 
          windowHeight: element?.scrollHeight, 
          logging: false, 
          backgroundColor: '#ffffff' 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'], 
          avoid: ['header', 'section', 'h3', 'h4', '.avoid-break'] 
        }
      };

      try {
        // @ts-ignore
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error("PDF Export failed", err);
      } finally {
        setIsDownloading(false);
      }
    }, 800);
  };

  if (result) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 animate-in zoom-in duration-700 pb-40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black mb-1 tracking-tight">Executive Portfolio <CheckCircle className="inline w-6 h-6 text-accent" /></h2>
            <p className="text-sm font-semibold text-muted opacity-80">Optimized for high-impact professional review.</p>
          </div>
          <button onClick={() => setResult(null)} className="px-5 py-2.5 bg-card border border-main text-accent rounded-xl font-bold flex items-center gap-2 hover:bg-accent hover:text-white transition-all text-xs">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Editor
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card rounded-3xl p-10 bg-card border border-main shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-accent mb-6">Profile Summary</h3>
              <p className="text-lg font-medium leading-relaxed mb-10">{result.summary}</p>
              
              <h3 className="text-xs font-black uppercase tracking-widest text-accent mb-6">Experience Architecture</h3>
              <div className="space-y-8">
                {result.experience.map((exp, idx) => (
                  <div key={idx} className="border-l-2 border-accent/20 pl-6 py-1">
                    <h4 className="text-lg font-bold">{exp.role} | {exp.company}</h4>
                    <p className="text-xs text-muted font-bold mb-3 italic">{exp.dates} | {exp.location}</p>
                    <p className="text-sm text-main/90 mb-4">{exp.description}</p>
                    <ul className="space-y-2">
                      {exp.achievements.map((point, pIdx) => (
                        <li key={pIdx} className="text-sm text-main/80 flex gap-3">
                          <span className="text-accent">•</span> {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-accent rounded-3xl p-8 text-white shadow-xl sticky top-24">
              <div className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-80">ATS MATCH SCORE</div>
              <div className="text-5xl font-black mb-4 tracking-tighter">{result.score}%</div>
              <p className="text-sm font-bold opacity-90 leading-relaxed mb-8">{result.analysis}</p>
              
              <button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full py-5 bg-white text-accent rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-white/90 transition-all shadow-xl disabled:opacity-50">
                {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isDownloading ? 'POLISHING PDF...' : 'EXPORT PRESTIGE PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* HIGH-FIDELITY PDF TEMPLATE */}
        <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none">
          <div ref={resumeRef} 
               style={{ 
                 width: '210mm', 
                 minHeight: '297mm',
                 padding: '20mm 20mm',
                 backgroundColor: 'white',
                 display: 'flex',
                 flexDirection: 'column',
                 fontFamily: "'Inter', sans-serif",
                 color: '#1a202c'
               }}>
            
            <header className="avoid-break" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '2px solid #3b82f6', paddingBottom: '25px' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '32pt', fontWeight: 900, color: '#1a202c', margin: 0, letterSpacing: '-0.02em', lineHeight: '1.1', textTransform: 'uppercase' }}>
                  {user?.name || result.contact.email.split('@')[0].replace('.', ' ') || 'CANDIDATE NAME'}
                </h1>
                <h2 style={{ fontSize: '18pt', fontWeight: 600, color: '#3b82f6', margin: '8px 0 15px 0' }}>
                  {result.jobTitle}
                </h2>
                
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10pt', fontWeight: 600, color: '#4a5568' }}>
                     <div style={{ border: '1.5px solid #3b82f6', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Phone size={10} color="#3b82f6" strokeWidth={3} />
                     </div>
                    {result.contact.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10pt', fontWeight: 600, color: '#4a5568' }}>
                    <div style={{ border: '1.5px solid #3b82f6', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={10} color="#3b82f6" strokeWidth={3} />
                    </div>
                    {result.contact.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10pt', fontWeight: 600, color: '#4a5568' }}>
                    <div style={{ border: '1.5px solid #3b82f6', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={10} color="#3b82f6" strokeWidth={3} />
                    </div>
                    {result.contact.location}
                  </div>
                </div>
              </div>
              
              <div style={{ width: '130px', height: '150px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {userImage ? (
                  <img src={userImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e0' }}>
                    <UserIcon size={48} />
                  </div>
                )}
              </div>
            </header>

            <div style={{ display: 'flex', gap: '40px', flexGrow: 1 }}>
              <div style={{ width: '120mm', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <section className="avoid-break">
                  <h3 style={{ fontSize: '12pt', fontWeight: 800, textTransform: 'uppercase', color: '#1a202c', letterSpacing: '0.05em', margin: '0 0 12px 0', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '6px' }}>
                    Profile Narrative
                  </h3>
                  <p style={{ fontSize: '10.5pt', lineHeight: '1.7', color: '#2d3748', margin: 0, textAlign: 'justify' }}>
                    {result.summary}
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '12pt', fontWeight: 800, textTransform: 'uppercase', color: '#1a202c', letterSpacing: '0.05em', margin: '0 0 18px 0', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '6px' }}>
                    Work Experience
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {result.experience.map((exp, i) => (
                      <div key={i} className="avoid-break" style={{ pageBreakInside: 'avoid' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '13pt', fontWeight: 800, color: '#1a202c', margin: 0 }}>
                            {exp.role}
                          </h4>
                          <span style={{ fontSize: '10pt', fontWeight: 700, color: '#3b82f6' }}>{exp.dates}</span>
                        </div>
                        <div style={{ fontSize: '11pt', fontWeight: 700, fontStyle: 'italic', color: '#4a5568', marginBottom: '10px' }}>
                          {exp.company} <span style={{ fontWeight: 400 }}>|</span> {exp.location}
                        </div>
                        <p style={{ fontSize: '10pt', lineHeight: '1.6', color: '#4a5568', marginBottom: '10px' }}>
                          {exp.description}
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {exp.achievements.map((ach, j) => (
                            <li key={j} style={{ fontSize: '10pt', lineHeight: '1.4', color: '#2d3748', display: 'flex', gap: '10px' }}>
                              <span style={{ color: '#3b82f6', fontWeight: 900 }}>•</span>
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div style={{ width: '50mm', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <section className="avoid-break">
                  <h3 style={{ fontSize: '11pt', fontWeight: 800, textTransform: 'uppercase', color: '#1a202c', letterSpacing: '0.05em', margin: '0 0 15px 0', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '6px' }}>
                    Education
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {result.education.map((edu, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '10.5pt', fontWeight: 800, color: '#1a202c', lineHeight: '1.2' }}>{edu.degree}</div>
                        <div style={{ fontSize: '9pt', fontWeight: 700, fontStyle: 'italic', color: '#4a5568', margin: '2px 0' }}>{edu.institution}</div>
                        <div style={{ fontSize: '8.5pt', color: '#718096' }}>{edu.locationAndDates}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="avoid-break">
                  <h3 style={{ fontSize: '11pt', fontWeight: 800, textTransform: 'uppercase', color: '#1a202c', letterSpacing: '0.05em', margin: '0 0 15px 0', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '6px' }}>
                    Skills & Expertise
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {result.skills.map((skill, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '10pt', fontWeight: 800, color: '#1a202c', marginBottom: '8px' }}>{skill.category}</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {skill.items.map((item, j) => (
                            <li key={j} style={{ fontSize: '9.5pt', color: '#4a5568', lineHeight: '1.4' }}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="avoid-break">
                  <h3 style={{ fontSize: '11pt', fontWeight: 800, textTransform: 'uppercase', color: '#1a202c', letterSpacing: '0.05em', margin: '0 0 12px 0', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '6px' }}>
                    Tech Stack
                  </h3>
                  <p style={{ fontSize: '9.5pt', color: '#4a5568', lineHeight: '1.6', margin: 0 }}>
                    {result.techStack}
                  </p>
                </section>
                
                <section className="avoid-break">
                  <h3 style={{ fontSize: '11pt', fontWeight: 800, textTransform: 'uppercase', color: '#1a202c', letterSpacing: '0.05em', margin: '0 0 12px 0', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '6px' }}>
                    Languages
                  </h3>
                  <p style={{ fontSize: '10pt', fontWeight: 600, color: '#2d3748', margin: 0 }}>
                    {result.languages}
                  </p>
                </section>
              </div>
            </div>

            <footer className="pdf-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4 }}>
              <div style={{ fontSize: '8pt', fontWeight: 800, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                CareerLift AI • Professional Grade Strategy
              </div>
              <div style={{ fontSize: '8pt', color: '#718096' }}>
                CONFIDENTIAL PORTFOLIO
              </div>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 animate-in fade-in duration-1000 pb-40">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-black mb-3 tracking-tight">Narrative <span className="text-accent">Architect</span></h2>
        <p className="text-base font-medium text-muted max-lg mx-auto leading-relaxed opacity-80">Refine your professional trajectory through precision alignment and visual excellence.</p>
      </div>

      {isOverLimit && (
        <div className="mb-10 p-6 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg"><AlertTriangle className="w-6 h-6" /></div>
          <div className="flex-grow text-center md:text-left">
            <h4 className="font-black text-amber-500 tracking-tight">Generation Limit Reached</h4>
            <p className="text-xs font-bold text-muted opacity-80 leading-relaxed">Your current <b>{user?.tier}</b> plan allows up to <b>{resumeLimit}</b> resume. Upgrade to continue crafting your story.</p>
          </div>
          <button 
            onClick={onPricingNavigate}
            className="px-6 py-3 bg-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all whitespace-nowrap"
          >
            See Plans
          </button>
        </div>
      )}

      <div className={`space-y-8 ${isOverLimit ? 'opacity-40 pointer-events-none' : ''}`}>
        <section className="glass-card p-8 rounded-3xl bg-card border border-main shadow-sm hover:border-accent transition-all">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm">01</div>
            <label className="text-lg font-bold tracking-tight">Identity & Visuals</label>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-main border border-main flex items-center justify-center overflow-hidden shadow-inner hover:border-accent transition-all">
                {userImage ? (
                  <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <UserIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              <input type="file" id="img-up" className="hidden" accept="image/*" onChange={handleImageUpload} />
              <label htmlFor="img-up" className="absolute -bottom-2 -right-2 p-2.5 bg-accent text-white rounded-xl shadow-lg cursor-pointer transform hover:scale-110 transition-all">
                <Camera className="w-3.5 h-3.5" />
              </label>
            </div>
            
            <div className="flex-grow space-y-4 text-center md:text-left">
              <div className="p-4 bg-main border border-main rounded-2xl">
                <h4 className="text-lg font-black">{user?.name || 'Candidate Name'}</h4>
                <p className="text-xs font-bold text-muted">{user?.email}</p>
              </div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-2 opacity-60">High-resolution headshots recommended for PDF clarity.</p>
            </div>
          </div>
        </section>

        <section className="glass-card p-8 rounded-3xl bg-card border border-main shadow-sm hover:border-accent transition-all">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm">02</div>
            <label className="text-lg font-bold tracking-tight">Core Narrative</label>
          </div>
          <div className="border-2 border-dashed border-main rounded-3xl p-10 text-center hover:border-accent transition-all bg-main/20 cursor-pointer group mb-6">
            <input type="file" id="cv-up" className="hidden" accept=".txt,.pdf" onChange={handleFileUpload} />
            <label htmlFor="cv-up" className="cursor-pointer">
              <Upload className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-sm font-bold">Import Professional History</p>
            </label>
          </div>
          <textarea placeholder="Paste raw CV text here..." className="w-full h-40 p-5 rounded-2xl bg-main border border-main outline-none focus:ring-1 focus:ring-accent font-medium text-sm transition-all" value={cvText} onChange={(e) => handleManualTextChange(e.target.value)} />
        </section>

        <section className="glass-card p-8 rounded-3xl bg-card border border-main shadow-sm hover:border-accent transition-all">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm">03</div>
            <label className="text-lg font-bold tracking-tight">Target Specification</label>
          </div>
          <textarea placeholder="Paste target job description..." className="w-full h-40 p-5 rounded-2xl bg-main border border-main outline-none focus:ring-1 focus:ring-accent font-medium text-sm transition-all" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
        </section>

        <button onClick={handleEnhance} disabled={isProcessing || !cvText || !jobDescription} className="w-full py-5 bg-accent text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl disabled:opacity-20">
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isProcessing ? 'GENERATING ARCHITECTURE...' : 'REWRITE & ALIGN PROFILE'}
        </button>
      </div>
    </div>
  );
};

export default CVEnhancer;
