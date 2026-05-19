import React, { useState, useEffect } from 'react';
import { CheckCircle, Play, FileVideo, X, Sparkles, Loader2 } from 'lucide-react';
import { videoService } from '../../services/videoService';

export default function Step4Review({ data, project, onBack, onComplete }) {
  const [isRendering, setIsRendering] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isMocking, setIsMocking] = useState(false);
  const [mockReady, setMockReady] = useState(false);

  const [isPlayingDraft, setIsPlayingDraft] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [utterance, setUtterance] = useState(null);

  // Clean up any active speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const textToSpeak = data.script || "Hello! Welcome to EduVideo workspace.";
      const newUtterance = new SpeechSynthesisUtterance(textToSpeak);
      
      const voicesList = window.speechSynthesis.getVoices();
      
      // Categorize browser voices
      const femaleVoices = voicesList.filter(v =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('hazel') ||
        v.name.toLowerCase().includes('susan') ||
        v.name.toLowerCase().includes('heera') ||
        v.name.toLowerCase().includes('jenny') ||
        v.name.toLowerCase().includes('ana') ||
        v.name.toLowerCase().includes('sonia') ||
        v.name.toLowerCase().includes('michelle')
      );
      const maleVoices = voicesList.filter(v =>
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('george') ||
        v.name.toLowerCase().includes('ravi') ||
        v.name.toLowerCase().includes('mark') ||
        v.name.toLowerCase().includes('guy') ||
        v.name.toLowerCase().includes('ryan')
      );
      const britishVoices = voicesList.filter(v =>
        v.lang.toLowerCase().includes('en-gb') ||
        v.name.toLowerCase().includes('hazel') ||
        v.name.toLowerCase().includes('george')
      );
      const defaultEnglishVoices = voicesList.filter(v =>
        v.lang.toLowerCase().startsWith('en')
      );
      const allVoices = voicesList.length > 0 ? voicesList : [];

      let selectedBrowserVoice = null;
      let pitchModifier = 1.0;
      let rateModifier = 0.95;

      const voiceId = data.voice || 'alloy';

      if (voiceId === 'alloy') {
        selectedBrowserVoice = maleVoices[0] || defaultEnglishVoices[0] || allVoices[0];
      } else if (voiceId === 'onyx') {
        selectedBrowserVoice = maleVoices[0] || defaultEnglishVoices.find(x => x.name.toLowerCase().includes('david')) || allVoices[0];
        pitchModifier = 0.75;
      } else if (voiceId === 'echo') {
        selectedBrowserVoice = femaleVoices[0] || defaultEnglishVoices.find(x => x.name.toLowerCase().includes('zira')) || allVoices[0];
        pitchModifier = 1.05;
      } else if (voiceId === 'nova') {
        selectedBrowserVoice = femaleVoices[0] || defaultEnglishVoices.find(x => x.name.toLowerCase().includes('zira')) || allVoices[0];
        pitchModifier = 1.22;
      } else if (voiceId === 'fable') {
        selectedBrowserVoice = britishVoices[0] || defaultEnglishVoices.find(x => x.lang.toLowerCase().includes('en-gb')) || maleVoices[0] || allVoices[0];
      } else if (voiceId === 'shimmer') {
        selectedBrowserVoice = femaleVoices[1] || femaleVoices[0] || allVoices[0];
        pitchModifier = 1.08;
      } else {
        const isFemale = voiceId === 'bark_v2' || voiceId === 'shimmer' || voiceId === 'nova' || voiceId === 'echo';
        if (isFemale) {
          selectedBrowserVoice = femaleVoices[0] || allVoices[0];
        } else {
          selectedBrowserVoice = maleVoices[0] || allVoices[0];
        }
      }

      if (selectedBrowserVoice) {
        newUtterance.voice = selectedBrowserVoice;
      }
      
      newUtterance.rate = rateModifier;
      newUtterance.pitch = pitchModifier;

      newUtterance.onboundary = (event) => {
        if (event.name === 'word') {
          const percent = (event.charIndex / textToSpeak.length) * 100;
          setProgress(percent);

          if (data.slides && data.slides.length > 0) {
            const slidePart = textToSpeak.length / data.slides.length;
            const targetSlideIndex = Math.floor(event.charIndex / slidePart);
            if (targetSlideIndex < data.slides.length) {
              setCurrentSlideIndex(targetSlideIndex);
            }
          }
        }
      };

      newUtterance.onend = () => {
        setIsPlayingDraft(false);
        setProgress(100);
        setTimeout(() => {
          setProgress(0);
          setCurrentSlideIndex(0);
        }, 800);
      };

      newUtterance.onerror = () => {
        setIsPlayingDraft(false);
      };

      setUtterance(newUtterance);
      window.speechSynthesis.speak(newUtterance);
      setIsPlayingDraft(true);
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingDraft(false);
  };

  const handleMockDraft = () => {
    if (mockReady) {
      // Toggle play/pause
      if (isPlayingDraft) {
        stopSpeech();
      } else {
        startSpeech();
      }
      return;
    }

    setIsMocking(true);
    // Simulate a fast mock generation
    setTimeout(() => {
      setIsMocking(false);
      setMockReady(true);
    }, 2000);
  };

  const startRender = async () => {
    // Stop draft speech if running before final production rendering
    stopSpeech();
    setIsRendering(true);
    try {
      const payload = {
        title: project ? project.title : `Project ${new Date().toLocaleTimeString()}`,
        script: data.script,
        mode: data.mode === 'avatar' ? 'AVATAR' : 'NO_FACE',
        engine: data.engine || 'COMMUNITY',
        voice: data.voice,
        avatar: data.avatar,
        slides: data.slides || [],
        is_mock: false
      };

      if (project) {
        try {
          await videoService.updateProject(project.id, payload);
        } catch (e) {
          if (e.response && e.response.status === 404) {
            console.warn("Project not found on server, creating new one instead.");
            await videoService.createProject(payload);
          } else {
            throw e;
          }
        }
      } else {
        await videoService.createProject(payload);
      }
      setIsDone(true);
    } catch (error) {
      console.error("Failed to start render", error);
    } finally {
      setIsRendering(false);
    }
  };

  const avatarImages = {
    daniel: 'https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D',
    sophia: 'https://plus.unsplash.com/premium_photo-1688350839154-1a131bccd78a?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    james: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    aisha: 'https://plus.unsplash.com/premium_photo-1663075864525-cedf69dbff05?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    olivia: 'https://plus.unsplash.com/premium_photo-1690294614341-cf346ba0a637?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    arjun: 'https://plus.unsplash.com/premium_photo-1689977927774-401b12d137d6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D',
    mei: 'https://plus.unsplash.com/premium_photo-1688740375397-34605b6abe48?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D',
    lucas: 'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzN8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D',
    isabella: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    noah: 'https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXZhdGFyfGVufDB8fDB8fHww'
  };

  if (isDone) {
    return (
      <div className="text-center py-20 animate-fade-in max-w-xl mx-auto">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-emerald-500/20 border border-emerald-500/20 animate-pulse">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-4xl font-black text-white mb-4">Production Initiated</h2>
        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-12">
          Your project has been queued for neural rendering. High-fidelity visuals and AI voice synthesis are being processed.
        </p>
        <button 
          onClick={onComplete}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-[#0a0d14] rounded-xl font-black text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          Go to Library
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-300">Final Verification</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
          Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Final Review</span>
        </h2>
        <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed">
          Verify your project configurations before initiating the final production render.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Side: Specs & Preview Draft Player */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#121620]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Project Specs</h3>
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="space-y-1 bg-[#0a0d14]/50 p-4 rounded-xl border border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Presenter</div>
                <div className="text-sm font-black text-white capitalize">{data.avatar || 'Marcus'}</div>
              </div>
              <div className="space-y-1 bg-[#0a0d14]/50 p-4 rounded-xl border border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Voice Engine</div>
                <div className="text-sm font-black text-white capitalize">{data.voice || 'Alloy'}</div>
              </div>
              <div className="space-y-1 bg-[#0a0d14]/50 p-4 rounded-xl border border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Format</div>
                <div className="text-sm font-black text-white">4K UHD / 16:9</div>
              </div>
              <div className="space-y-1 bg-[#0a0d14]/50 p-4 rounded-xl border border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Resolution</div>
                <div className="text-sm font-black text-white">3840 x 2160</div>
              </div>
              <div className="space-y-1 bg-[#0a0d14]/50 p-4 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Engine</div>
                <div className="text-sm font-black text-cyan-400 uppercase tracking-wider text-xs">
                  Local AI Engine
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Preview Draft Player */}
          <div className="bg-[#121620] rounded-[2.5rem] border border-white/5 overflow-hidden group shadow-2xl relative">
            <button 
              onClick={handleMockDraft}
              disabled={isMocking}
              className="w-full aspect-video relative bg-black flex items-center justify-center overflow-hidden cursor-pointer"
            >
              {mockReady ? (
                <>
                  {/* Mock Split Screen Content */}
                  <div className="flex w-full h-full pt-10">
                    {/* Left: Mock Image Area */}
                    <div className="w-1/2 flex items-center justify-center p-4">
                      <div className="w-full aspect-square bg-[#0c0f16] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
                         {data.slides && data.slides[currentSlideIndex]?.imageUrl ? (
                           <img src={data.slides[currentSlideIndex].imageUrl} className="w-full h-full object-cover opacity-85 transition-all duration-500" alt="Slide Visual" />
                         ) : (
                           <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest text-center px-2">
                             Slide {currentSlideIndex + 1} Visual
                           </div>
                         )}
                      </div>
                    </div>

                    {/* Right: Mock Text Area */}
                    <div className="w-1/2 flex flex-col justify-center p-4 text-left space-y-2">
                      <div className="h-1 w-12 bg-cyan-500/50 mb-2 rounded-full" />
                      <h4 className="text-white text-[11px] font-semibold leading-relaxed line-clamp-6 italic opacity-85">
                        "{data.script.slice(0, 150)}..."
                      </h4>
                    </div>
                  </div>

                  {/* Avatar PIP Overlay */}
                  {data.mode === 'avatar' && (
                    <div className={`absolute bottom-4 right-4 w-20 h-20 rounded-full border-2 overflow-hidden shadow-2xl z-10 bg-slate-900 transition-all duration-500 ${isPlayingDraft ? 'border-cyan-400 scale-105 shadow-cyan-500/20' : 'border-white/10'}`}>
                      <img 
                        src={avatarImages[data.avatar] || avatarImages.daniel} 
                        className={`w-full h-full object-cover ${isPlayingDraft ? 'scale-110' : ''} transition-transform duration-300`}
                        alt="Avatar PIP"
                      />
                    </div>
                  )}

                  {/* Animated Wave visualizer when playing, else pulsing play indicator */}
                  {isPlayingDraft ? (
                    <div className="absolute bottom-4 left-4 flex items-end gap-1 h-5 z-10 bg-black/50 px-2.5 py-1.5 rounded-md backdrop-blur-sm border border-white/5 shadow-lg">
                      <div className="w-0.5 h-3 bg-cyan-400 rounded-full animate-bounce [animation-duration:0.6s]"></div>
                      <div className="w-0.5 h-3 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.4s]"></div>
                      <div className="w-0.5 h-3 bg-purple-400 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                      <div className="w-0.5 h-3 bg-cyan-400 rounded-full animate-bounce [animation-duration:0.5s]"></div>
                    </div>
                  ) : (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/5 shadow-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">Draft Loaded</span>
                    </div>
                  )}

                  {/* Speech Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-20">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-[#0a0d14] flex items-center justify-center group-hover:bg-black transition-colors duration-500">
                  <div className="text-center">
                    <div className="text-slate-800 font-black text-4xl mb-2 opacity-35 tracking-wider select-none font-sans">EDUVIDEO</div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Waiting for neural draft</div>
                  </div>
                </div>
              )}
              
              <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 ${isMocking ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {isMocking ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-indigo-400 animate-spin" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Neural Synthesis...</span>
                  </div>
                ) : mockReady ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 backdrop-blur-[2.5px] opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-[#0a0d14] rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-[0.95]">
                      {isPlayingDraft ? (
                        <div className="flex gap-1.5 items-center justify-center">
                          <div className="w-1.5 h-6 bg-[#0a0d14] rounded-full"></div>
                          <div className="w-1.5 h-6 bg-[#0a0d14] rounded-full"></div>
                        </div>
                      ) : (
                        <Play size={22} fill="currentColor" className="ml-1" />
                      )}
                    </div>
                    <span className="mt-4 text-[10px] font-black text-white uppercase tracking-widest drop-shadow">
                      {isPlayingDraft ? 'Pause Draft' : 'Preview Draft'}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-105 transition-transform duration-300">
                      <Play size={22} fill="currentColor" className="ml-1" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Generate Mock Draft</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Right Side: Script Preview & Ready Capsule */}
        <div className="space-y-8">
          <div className="bg-[#121620]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-4">Script Preview</h3>
            <div className="p-6 bg-[#0a0d14]/80 rounded-2xl border border-white/5 max-h-56 overflow-y-auto custom-scrollbar">
              <p className="text-xs text-slate-300 leading-relaxed font-semibold italic">
                "{data.script}"
              </p>
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <FileVideo size={20} className="text-indigo-400" />
              <span className="text-sm font-black text-white uppercase tracking-wider text-xs">Ready for Production</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Your video will be rendered using our Cinematic Neural Engine. Est. time: 6 mins.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
        <button className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest cursor-pointer">
          <X size={18} /> Cancel Draft
        </button>
        <div className="flex gap-4">
          <button 
            onClick={onBack}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5 cursor-pointer"
          >
            Back
          </button>
          <button 
            onClick={startRender}
            disabled={isRendering}
            className="px-12 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-[#0a0d14] rounded-xl font-black text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            {isRendering ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isRendering ? 'Processing...' : 'Initiate Final Render'}
          </button>
        </div>
      </div>
    </div>
  );
}
