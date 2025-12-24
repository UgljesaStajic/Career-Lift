
import React, { useState, useRef } from 'react';
import { BookOpen, Trash2, CheckCircle2, Search, FileText, ChevronRight, Download, Edit3, Calendar, Loader2, Phone, Mail as MailIcon, MapPin, User as UserIcon, Globe } from 'lucide-react';
import { SavedCV, AppView, EnhancedCV } from '../types';

interface ResumesProps {
  savedCVs: SavedCV[];
  setSavedCVs: React.Dispatch<React.SetStateAction<SavedCV[]>>;
  activeCVId: string | null;
  setActiveCVId: (id: string | null) => void;
  onNavigate: (view: AppView) => void;
  onEdit: (cv: SavedCV) => void;
}

const Resumes: React.FC<ResumesProps> = ({ savedCVs, setSavedCVs, activeCVId, setActiveCVId, onNavigate, onEdit }) => {
  const [viewingCV, setViewingCV] = useState<SavedCV | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this executive profile?')) {
      setSavedCVs(prev => prev.filter(cv => cv.id !== id));
      if (activeCVId === id) setActiveCVId(null);
    }
  };

  const handleSelect = (id: string) => {
    setActiveCVId(id);
  };

  const handleDownloadPDF = async (cv: SavedCV) => {
    setViewingCV(cv);
    setIsDownloading(true);
    
    setTimeout(async () => {
      const element = resumeRef.current;
      if (!element) return;

      const opt = {
        margin: [15, 0, 15, 0], // Consistent 1.5cm margin
        filename: `${cv.data.fullName?.replace(/\s+/g, '_') || cv.data.jobTitle.replace(/\s+/g, '_')}_CV.pdf`,
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
          avoid: ['header', 'section', 'h1', 'h2', 'h3', 'h4', '.avoid-break']
        }
      };

      try {
        // @ts-ignore
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error("PDF Export failed", err);
      } finally {
        setIsDownloading(false);
        setViewingCV(null);
      }
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 animate-in fade-in duration-1000 pb-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div>
          <h2 className="text-3xl font-black mb-2 tracking-tight">Executive <span className="text-accent">Library</span></h2>
          <p className="text-sm font-semibold text-muted opacity-80">A curated repository of your optimized professional narratives.</p>
        </div>
        <button 
          onClick={() => onNavigate('cv-enhancer')}
          className="px-6 py-3 bg-accent text-white rounded-xl font-bold flex items-center gap-2 hover:bg-accent/90 transition-all text-xs shadow-lg"
        >
          Enhance New CV <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {savedCVs.length === 0 ? (
        <div className="py-24 text-center glass-card rounded-3xl border-dashed border-2 border-main opacity-40 bg-main/10 max-w-2xl mx-auto">
          <div className="p-6 bg-card border border-main rounded-full w-fit mx-auto mb-6"><BookOpen className="w-8 h-8 text-muted" /></div>
          <h3 className="text-xl font-black mb-2">Library Empty</h3>
          <p className="text-xs font-bold max-w-[240px] mx-auto text-muted opacity-80 mb-8 leading-relaxed">
            Initialize your repository by enhancing your first CV for a specific job target.
          </p>
          <button 
            onClick={() => onNavigate('cv-enhancer')}
            className="px-8 py-3 bg-main border border-main text-accent rounded-xl font-bold hover:bg-accent hover:text-white transition-all text-xs"
          >
            Go to Enhancer
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedCVs.map((cv) => (
            <div 
              key={cv.id}
              onClick={() => handleSelect(cv.id)}
              className={`glass-card p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col h-full relative ${
                activeCVId === cv.id 
                  ? 'border-accent bg-accent/5' 
                  : 'border-main hover:border-accent/40 bg-card'
              }`}
            >
              {activeCVId === cv.id && (
                <div className="absolute -top-3 -right-3 bg-accent text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-black z-10 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}

              <div className="mb-6 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl transition-colors ${activeCVId === cv.id ? 'bg-accent text-white' : 'bg-main text-accent'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  {cv.userImage && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-main shadow-sm bg-main">
                      <img src={cv.userImage} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(cv); }}
                    className="p-2 text-muted hover:text-accent hover:bg-accent/5 rounded-xl transition-all"
                    title="Edit original content"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDownloadPDF(cv); }}
                    className="p-2 text-muted hover:text-accent hover:bg-accent/5 rounded-xl transition-all"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(cv.id, e)}
                    className="p-2 text-muted hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-black tracking-tight mb-2 group-hover:text-accent transition-colors">
                {cv.data.fullName || cv.data.jobTitle}
              </h3>
              
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest mb-4 opacity-60">
                <Calendar className="w-3 h-3" />
                {new Date(cv.timestamp).toLocaleDateString()}
              </div>

              <p className="text-xs font-medium text-muted line-clamp-3 mb-8 opacity-80 leading-relaxed">
                {cv.data.summary}
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex flex-wrap gap-2">
                  {cv.data.techStack.split(',').slice(0, 3).map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 bg-main border border-main rounded-md text-[8px] font-black text-muted uppercase tracking-tighter">
                      {tech.trim()}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('job-board');
                    }}
                    className={`flex-grow py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activeCVId === cv.id 
                        ? 'bg-accent text-white shadow-md shadow-accent/20' 
                        : 'bg-main border border-main text-muted hover:border-accent hover:text-accent'
                    }`}
                  >
                    <Search className="w-3 h-3" /> {activeCVId === cv.id ? 'Active Profile' : 'Select for Search'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden PDF template for background export */}
      {viewingCV && (
        <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none">
          <ResumePDFTemplate resumeRef={resumeRef} result={viewingCV.data} userImage={viewingCV.userImage} />
        </div>
      )}

      {isDownloading && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-8 rounded-3xl border border-main shadow-2xl text-center animate-in zoom-in duration-300">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-black mb-2">Architecting PDF</h3>
            <p className="text-sm font-medium text-muted opacity-60">Optimizing layouts and refining typography...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Unified High-Fidelity Template matched to the user reference image
const ResumePDFTemplate: React.FC<{ resumeRef: React.RefObject<HTMLDivElement>, result: EnhancedCV, userImage?: string }> = ({ resumeRef, result, userImage }) => (
  <div ref={resumeRef} 
       style={{ 
         width: '210mm', 
         minHeight: '297mm', // Consistent min-height for rendering context, but no flex-stretch
         padding: '0 15mm', 
         backgroundColor: 'white',
         display: 'flex',
         flexDirection: 'column',
         fontFamily: "'Inter', sans-serif",
         color: '#1a202c',
         lineHeight: '1.3' // Compact line height
       }}>
    
    {/* Header Section */}
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', paddingTop: '5px' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '26pt', fontWeight: 800, color: '#000000', margin: '0 0 2px 0', letterSpacing: '-0.02em', lineHeight: '1', textTransform: 'uppercase' }}>
          {result.fullName || 'NAME SURNAME'}
        </h1>
        <h2 style={{ fontSize: '14pt', fontWeight: 600, color: '#3b82f6', margin: '0 0 10px 0' }}>
          {result.jobTitle}
        </h2>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8.5pt', fontWeight: 500, color: '#333' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={9} color="white" />
            </div>
            {result.contact.phone}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8.5pt', fontWeight: 500, color: '#333' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={9} color="white" />
            </div>
            {result.contact.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8.5pt', fontWeight: 500, color: '#333' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={9} color="white" />
            </div>
            {result.contact.location}
          </div>
        </div>
      </div>
      
      <div style={{ width: '100px', height: '100px', borderRadius: '0px', overflow: 'hidden', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', flexShrink: 0 }}>
        {userImage ? (
          <img src={userImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            <UserIcon size={40} />
          </div>
        )}
      </div>
    </header>

    {/* Main Content (Two Columns) */}
    <div style={{ display: 'flex', gap: '30px' }}>
      
      {/* Left Column (65%) */}
      <div style={{ width: '125mm', display: 'flex', flexDirection: 'column' }}>
        
        {/* Profile Summary */}
        <section style={{ marginBottom: '15px' }}>
          <h3 style={{ fontSize: '9.5pt', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em', margin: '0 0 6px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
            Profile Summary
          </h3>
          <p style={{ fontSize: '9pt', color: '#444', margin: 0, lineHeight: '1.4', textAlign: 'justify' }}>
            {result.summary}
          </p>
        </section>

        {/* Experience */}
        <section>
          <h3 style={{ fontSize: '9.5pt', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em', margin: '0 0 10px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
            Experience
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {result.experience.map((exp, i) => (
              <div key={i} style={{ breakInside: 'avoid' }}>
                <h4 style={{ fontSize: '10.5pt', fontWeight: 800, color: '#000', margin: '0 0 2px 0' }}>
                  {exp.role} <span style={{ fontWeight: 400, color: '#666' }}>|</span> {exp.company}
                </h4>
                <div style={{ fontSize: '8.5pt', fontWeight: 600, fontStyle: 'italic', color: '#3b82f6', marginBottom: '4px' }}>
                  {exp.dates} <span style={{ fontWeight: 400, color: '#666' }}>|</span> {exp.location}
                </div>
                <p style={{ fontSize: '9pt', color: '#444', marginBottom: '6px', lineHeight: '1.3' }}>
                  {exp.description}
                </p>
                {exp.achievements.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {exp.achievements.map((ach, j) => (
                      <li key={j} style={{ fontSize: '8.5pt', color: '#444', display: 'flex', gap: '6px', lineHeight: '1.3' }}>
                        <span style={{ color: '#3b82f6' }}>•</span>
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right Column (35%) */}
      <div style={{ width: '55mm', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Education */}
        <section style={{ breakInside: 'avoid' }}>
          <h3 style={{ fontSize: '9.5pt', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em', margin: '0 0 8px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
            Education
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.education.map((edu, i) => (
              <div key={i}>
                <div style={{ fontSize: '9pt', fontWeight: 800, color: '#000', lineHeight: '1.2' }}>{edu.degree}</div>
                <div style={{ fontSize: '8.5pt', fontWeight: 700, fontStyle: 'italic', color: '#444', margin: '1px 0' }}>
                  {edu.institution}
                </div>
                <div style={{ fontSize: '8pt', color: '#666' }}>{edu.locationAndDates}</div>
                {edu.specialization && <div style={{ fontSize: '8pt', color: '#666', fontStyle: 'italic' }}>{edu.specialization}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        {result.certifications && result.certifications.length > 0 && (
          <section style={{ breakInside: 'avoid' }}>
            <h3 style={{ fontSize: '9.5pt', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em', margin: '0 0 8px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
              Certifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.certifications.map((cert, i) => (
                <div key={i}>
                  <div style={{ fontSize: '8.5pt', fontWeight: 800, color: '#000', lineHeight: '1.2' }}>{cert.name}</div>
                  <div style={{ fontSize: '8pt', color: '#666' }}>{cert.issuerAndYear}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Expertise */}
        <section style={{ breakInside: 'avoid' }}>
          <h3 style={{ fontSize: '9.5pt', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em', margin: '0 0 8px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
            Expertise
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.skills.map((skill, i) => (
              <div key={i}>
                <div style={{ fontSize: '8.5pt', fontWeight: 800, color: '#000', marginBottom: '2px' }}>{skill.category}:</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {skill.items.map((item, j) => (
                    <li key={j} style={{ fontSize: '8pt', color: '#444', display: 'flex', gap: '4px', lineHeight: '1.2' }}>
                      <span>•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section style={{ breakInside: 'avoid' }}>
          <h3 style={{ fontSize: '9.5pt', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em', margin: '0 0 6px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
            Tech Stack
          </h3>
          <p style={{ fontSize: '8pt', color: '#444', lineHeight: '1.3', margin: 0 }}>
            {result.techStack}
          </p>
        </section>
        
        {/* Languages */}
        <section style={{ breakInside: 'avoid' }}>
          <h3 style={{ fontSize: '9.5pt', fontWeight: 800, textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em', margin: '0 0 6px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
            Languages
          </h3>
          <p style={{ fontSize: '8.5pt', color: '#444', margin: 0 }}>
            {result.languages}
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default Resumes;
