
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, Play, Loader2, Sparkles, CreditCard, Check } from 'lucide-react';
import { getGeminiClient } from '../services/gemini';
import { decode, encode, decodeAudioData, createPcmBlob } from '../services/audio';
import { InterviewStatus } from '../types';
import { Modality, LiveServerMessage } from '@google/genai';

const VirtualInterview: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [status, setStatus] = useState<InterviewStatus>(InterviewStatus.IDLE);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [micActive, setMicActive] = useState(false);

  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startInterview = async () => {
    setStatus(InterviewStatus.CONNECTING);
    try {
      const ai = getGeminiClient();
      if (!inputAudioContextRef.current) inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicActive(true);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus(InterviewStatus.ACTIVE);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const outCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscripts(prev => {
                const last = prev[prev.length - 1];
                if (last?.startsWith('Elite: ')) {
                  return [...prev.slice(0, -1), last + text];
                }
                return [...prev.slice(-9), `Elite: ${text}`];
              });
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscripts(prev => {
                const last = prev[prev.length - 1];
                if (last?.startsWith('Candidate: ')) {
                  return [...prev.slice(0, -1), last + text];
                }
                return [...prev.slice(-9), `Candidate: ${text}`];
              });
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Session Error:", e),
          onclose: () => setStatus(InterviewStatus.ENDED),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are an elite executive search consultant. Conduct a high-level interview for a senior position. Be insightful, concise, and professional. Welcome the candidate briefly.',
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error(error);
      setStatus(InterviewStatus.IDLE);
      alert("Verification failed. Please check permissions.");
    }
  };

  const stopInterview = () => {
    if (sessionRef.current) sessionRef.current.close();
    setStatus(InterviewStatus.ENDED);
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center pb-40">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Sparkles className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-3xl font-black text-main mb-3 tracking-tight">Elite Simulation</h2>
        <p className="text-base text-muted font-medium mb-12 max-w-md mx-auto opacity-80 leading-relaxed">
          The ultimate preparation environment for high-stakes executive positions. Master your delivery in real-time.
        </p>

        <div className="grid md:grid-cols-1 gap-8 mb-12 max-w-sm mx-auto">
          <div className="bg-card border border-main p-8 rounded-3xl text-left shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 opacity-60">Features</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-center text-sm font-bold text-muted">
                <div className="bg-accent/10 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-accent" /></div>
                Executive voice synthesis
              </li>
              <li className="flex gap-3 items-center text-sm font-bold text-muted">
                <div className="bg-accent/10 p-1 rounded-md"><Check className="w-3.5 h-3.5 text-accent" /></div>
                Semantic feedback loops
              </li>
            </ul>
          </div>
          <div className="bg-accent p-8 rounded-3xl text-white flex flex-col justify-center items-center shadow-2xl">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Lifetime Access</div>
            <div className="text-4xl font-black mb-8 tracking-tighter">$29.99</div>
            <button 
              onClick={() => setIsUnlocked(true)}
              className="w-full py-3.5 bg-white text-accent rounded-xl font-black text-xs hover:bg-white/95 transition-all shadow-md"
            >
              Unlock Service
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 pb-40">
      <div className="bg-card rounded-3xl p-12 text-center relative overflow-hidden border border-main shadow-sm">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 h-24 px-12">
            {[...Array(40)].map((_, i) => (
              <div 
                key={i} 
                className={`bg-accent w-1 rounded-full transition-all duration-300 ${status === InterviewStatus.ACTIVE ? 'animate-pulse' : 'h-1'}`}
                style={{ 
                  height: status === InterviewStatus.ACTIVE ? `${Math.random() * 60 + 10}%` : '4px',
                  animationDelay: `${i * 0.04}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-main rounded-full mx-auto mb-8 flex items-center justify-center border border-main shadow-inner">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-accent/5 ${status === InterviewStatus.ACTIVE ? 'animate-ping opacity-20' : ''}`}>
              <Sparkles className={`w-8 h-8 ${status === InterviewStatus.ACTIVE ? 'text-accent' : 'text-muted opacity-20'}`} />
            </div>
          </div>

          <h2 className="text-xl font-black text-main mb-1 tracking-tight">AI Consultant</h2>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-12 ${status === InterviewStatus.ACTIVE ? 'text-accent' : 'text-muted opacity-50'}`}>
            {status === InterviewStatus.IDLE && "Ready"}
            {status === InterviewStatus.CONNECTING && "Connecting..."}
            {status === InterviewStatus.ACTIVE && "Active"}
            {status === InterviewStatus.ENDED && "Complete"}
          </p>

          <div className="flex justify-center gap-6">
            {status === InterviewStatus.IDLE || status === InterviewStatus.ENDED ? (
              <button 
                onClick={startInterview}
                className="px-8 py-3.5 bg-accent hover-bg-accent text-white rounded-xl font-black text-sm transition-all shadow-lg flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Begin
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setMicActive(!micActive)}
                  className={`p-4 rounded-full transition-all border ${micActive ? 'bg-main text-main border-main' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}
                >
                  {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button 
                  onClick={stopInterview}
                  className="p-4 bg-red-600 text-white rounded-full transition-all shadow-lg"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 bg-card rounded-3xl border border-main p-8 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-6 opacity-60">Real-time Transcript</h3>
        <div className="space-y-4 max-h-48 overflow-y-auto pr-4 scroll-smooth">
          {transcripts.length > 0 ? (
            transcripts.map((t, i) => (
              <div key={i} className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${t.startsWith('Elite:') ? 'bg-accent/5 text-accent border border-accent/10' : 'bg-main text-muted border border-main ml-8'}`}>
                {t}
              </div>
            ))
          ) : (
            <p className="text-xs font-bold text-muted italic text-center py-6 opacity-40 tracking-tight">Waiting for verbal interaction...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualInterview;
