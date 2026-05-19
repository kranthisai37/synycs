import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  Video,
  Monitor,
  Zap,
  Check,
  X
} from 'lucide-react';

export default function StepSlideSync({ data, update, onNext, onBack }) {
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoGeneratingIndex, setAutoGeneratingIndex] = useState(-1);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Reset load error state on active scene or slide updates
  useEffect(() => {
    setImageLoadError(false);
  }, [activeScene, data.slides]);

  // Helper to dynamically synthesize school-student-friendly AI prompts based on selected art style
  const generateVisualPromptForStyle = (text, style) => {
    const clean = text.replace(/^(title|description|short description|summary|section\s+\d+|slide\s+\d+|introduction|intro|explanation|conclusion):/i, '').trim();
    const cleanText = clean.substring(0, 120);
    
    switch (style?.toLowerCase()) {
      case 'cartoon / anime':
        return `Vibrant colorful educational cartoon anime illustration showing: ${cleanText}. Bright anime art style, friendly character designs, engaging colors, clear details, school-friendly, no text.`;
      case '3d clay render':
        return `Cute 3d clay model style toy illustration showing: ${cleanText}. Playful claymorphism character and environment, soft volumetric lighting, colorful, highly detailed, no text.`;
      case 'chalkboard sketch':
        return `Educational chalk sketch drawing on a green school chalkboard showing: ${cleanText}. Detailed hand-drawn white and colored chalk lines, clean school classroom style illustration, no text.`;
      case 'watercolor illustration':
        return `Soft paint textures watercolor illustration showing: ${cleanText}. Hand-painted aesthetic, creative educational art, beautiful artistic bleed, clean background, no text.`;
      case 'photorealistic':
        return `Detailed high-fidelity realistic photo showing: ${cleanText}. Professional photography, clean composition, natural lighting, sharp focus, 8k, no text.`;
      case 'minimalist':
        return `Minimalist vector graphic design showing: ${cleanText}. Clean flat design, simple geometric shapes, modern infographic layout, clean background, no text.`;
      case 'cinematic':
      default:
        return `Professional cinematic educational scene showing: ${cleanText}. Cinematic lighting, modern style, clean composition, soft depth of field, 8k, no text.`;
    }
  };

  // Helper to remove colons, parentheses, slashes, and brackets that break CDN/routing paths on Pollinations AI
  const sanitizePromptForUrl = (prompt) => {
    if (!prompt) return '';
    return prompt
      .replace(/[:()/\\\[\]]/g, ' ') // Replace route-breaking characters with spaces
      .replace(/\s+/g, ' ')          // Collapse double spaces
      .trim();
  };

  // Helper to map styles to theme badge colors for premium UX
  const getStyleBadgeColor = (style) => {
    switch (style?.toLowerCase()) {
      case 'cartoon / anime': return 'bg-purple-500/15 border-purple-500/30 text-purple-400';
      case '3d clay render': return 'bg-pink-500/15 border-pink-500/30 text-pink-400';
      case 'chalkboard sketch': return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      case 'watercolor illustration': return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      case 'photorealistic': return 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400';
      case 'minimalist': return 'bg-slate-500/15 border-slate-500/30 text-slate-400';
      case 'cinematic':
      default:
        return 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400';
    }
  };

  // Automatic background, sequential AI generation for all slides still using placeholders or old broken URLs!
  useEffect(() => {
    if (!data.slides || data.slides.length === 0 || autoGeneratingIndex !== -1) return;

    // Find the first slide that is not yet generated via the high-fidelity Pollinations Flux model
    const nextPlaceholderIdx = data.slides.findIndex(s => !s.imageUrl || !s.imageUrl.includes('image.pollinations.ai'));
    
    if (nextPlaceholderIdx !== -1) {
      setAutoGeneratingIndex(nextPlaceholderIdx);
      const slide = data.slides[nextPlaceholderIdx];
      
      // Build safe visual prompt if not set
      let prompt = slide.visualPrompt;
      if (!prompt) {
        prompt = generateVisualPromptForStyle(slide.text, slide.style || 'Cinematic');
      }

      const safePrompt = prompt.length > 180 ? prompt.substring(0, 180) : prompt;
      const sanitized = sanitizePromptForUrl(safePrompt);
      const seed = Math.floor(Math.random() * 1000000) + 1;
      const encodedPrompt = encodeURIComponent(sanitized);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&private=true&model=flux&seed=${seed}`;

      // Pre-load the AI visual in the background sequentially
      const img = new Image();
      img.src = pollinationsUrl;
      img.onload = () => {
        const updatedSlides = [...data.slides];
        updatedSlides[nextPlaceholderIdx] = {
          ...slide,
          imageUrl: pollinationsUrl,
          visualPrompt: prompt,
          style: slide.style || 'Cinematic'
        };
        update({ slides: updatedSlides });
        setAutoGeneratingIndex(-1); // Reset to trigger the next slide in sequence
      };
      img.onerror = () => {
        const updatedSlides = [...data.slides];
        updatedSlides[nextPlaceholderIdx] = {
          ...slide,
          imageUrl: pollinationsUrl,
          visualPrompt: prompt,
          style: slide.style || 'Cinematic'
        };
        update({ slides: updatedSlides });
        setAutoGeneratingIndex(-1);
      };
    }
  }, [data.slides, autoGeneratingIndex, update]);
  
  // Helper to compute start times and return updated scenes
  const synchronizeScenes = (rawScenes) => {
    let current_time = 0;
    return rawScenes.map(scene => {
      const updated = {
        ...scene,
        startTime: current_time
      };
      current_time += scene.duration;
      return updated;
    });
  };

  // Parse script into scenes with stable keyword images
  const rawScenes = data.slides && data.slides.length > 0 ? data.slides : data.script.split('\n\n').filter(s => s.trim()).map((text, idx) => {
    const initialStyle = 'Cinematic';
    return {
      id: idx + 1,
      text: text.trim(),
      duration: Math.max(5, Math.floor(text.length / 15)),
      style: initialStyle,
      visualPrompt: generateVisualPromptForStyle(text, initialStyle),
      imageUrl: '',
      type: 'IMAGE'
    };
  });

  const scenes = synchronizeScenes(rawScenes);

  // Persist the generated slides to the parent state on mount so they are cached and stable!
  useEffect(() => {
    if (!data.slides || data.slides.length === 0) {
      update({ slides: scenes });
    }
  }, [data.slides, scenes, update]);

  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);
  const seekTimeoutRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice setup
  const getUtterance = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const isFemale = data.voice?.toLowerCase().includes('bella') || 
                      data.voice?.toLowerCase().includes('alice') || 
                      data.voice?.toLowerCase().includes('lily') ||
                      data.voice?.toLowerCase().includes('nova') ||
                      data.voice?.toLowerCase().includes('shimmer');
    
    const matchedVoice = voices.find(v => {
      if (isFemale) return v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google US English') || v.name.includes('Susan');
      return v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google UK English Male') || v.name.includes('Mark');
    });
    
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.rate = data.pace || 1.0;
    return utterance;
  };

  const speakFrom = (startTime) => {
    window.speechSynthesis.cancel();
    let accTime = 0;
    let textToSpeak = "";
    
    scenes.forEach(scene => {
      if (accTime + scene.duration > startTime) {
        textToSpeak += scene.text + " ";
      }
      accTime += scene.duration;
    });

    if (textToSpeak.trim()) {
      const utterance = getUtterance(textToSpeak.trim());
      utterance.onend = () => { if (isPlaying) setIsPlaying(false); };
      window.speechSynthesis.speak(utterance);
    }
  };

  // Playback Timer
  useEffect(() => {
    let interval;
    if (isPlaying) {
      speakFrom(currentTime);
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            window.speechSynthesis.cancel();
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      window.speechSynthesis.cancel();
      clearInterval(interval);
    }
    return () => {
      window.speechSynthesis.cancel();
      clearInterval(interval);
    };
  }, [isPlaying]);

  // Auto-switch scene based on time
  useEffect(() => {
    let accTime = 0;
    for (let i = 0; i < scenes.length; i++) {
      accTime += scenes[i].duration;
      if (accTime > currentTime) {
        if (activeScene !== i) setActiveScene(i);
        break;
      }
    }
  }, [currentTime]);

  const handleSeek = (newTime) => {
    const time = parseFloat(newTime);
    setCurrentTime(time);
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = setTimeout(() => {
        speakFrom(time);
      }, 200); // Debounce to prevent stuttering
    }
  };

  const handleNext = () => {
    update({ slides: scenes });
    onNext();
  };

  const progress = (currentTime / (totalDuration || 1)) * 100;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-300">Timeline Synchronizer</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
          Timeline & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Slide Sync</span>
        </h2>
        <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed">
          Fine-tune the pacing and visual style for each segment. The narrator will follow your seeking.
        </p>
      </div>

      {/* Grid Elements */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Scene List */}
        <div className="lg:col-span-1 space-y-4 max-h-[620px] overflow-y-auto pr-3 custom-scrollbar">
          {scenes.map((scene, idx) => {
            const isActive = activeScene === idx;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  setActiveScene(idx);
                  // Seek to start of scene
                  let startTime = 0;
                  for(let i=0; i<idx; i++) startTime += scenes[i].duration;
                  handleSeek(startTime);
                }}
                className={`w-full p-6 rounded-[2rem] border transition-all duration-300 text-left relative overflow-hidden group cursor-pointer ${
                  isActive 
                  ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5' 
                  : 'bg-[#121620]/50 border-white/5 hover:border-white/12 hover:bg-[#121620]/80'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-lg" />
                )}
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                    Scene {scene.id}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Dynamic Style Badge */}
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border backdrop-blur-md ${getStyleBadgeColor(scene.style)}`}>
                      {scene.style || 'Cinematic'}
                    </span>
                    
                    {autoGeneratingIndex === idx ? (
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                        <Sparkles size={9} className="animate-spin" /> drawing...
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        <Clock size={10} className="text-cyan-400" /> {scene.duration}s
                      </span>
                    )}
                  </div>
                </div>
                <p className={`text-xs line-clamp-2 leading-relaxed font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                  {scene.text}
                </p>
              </button>
            );
          })}
        </div>

        {/* Center Column: Scene Editor & Progress Bar */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="bg-[#121620]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col justify-between min-h-[500px]">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <Monitor size={16} className="text-indigo-400" />
                Scene Editor <span className="text-slate-600">/</span> <span className="text-cyan-400">{activeScene + 1} of {scenes.length}</span>
              </h3>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Side: Script Segment & Duration Controls */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Script Segment</label>
                  <div className="p-6 bg-[#0a0d14]/80 border border-white/5 rounded-2xl text-xs text-slate-200 leading-relaxed font-semibold italic shadow-inner h-32 overflow-y-auto custom-scrollbar">
                    "{scenes[activeScene].text}"
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Style</label>
                    <select 
                      value={scenes[activeScene].style || 'Cinematic'}
                      onChange={(e) => {
                        const newStyle = e.target.value;
                        const newScenes = [...scenes];
                        const active = newScenes[activeScene];
                        active.style = newStyle;
                        // Dynamically update the visual prompt to match the new style
                        active.visualPrompt = generateVisualPromptForStyle(active.text, newStyle);
                        // Reset image url to trigger sequential background generator
                        active.imageUrl = '';
                        update({ slides: newScenes });
                      }}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500/50 cursor-pointer transition-colors font-semibold"
                    >
                      <option value="Cinematic">Cinematic (Professional)</option>
                      <option value="Cartoon / Anime">Cartoon / Anime (Fun & Vibrant)</option>
                      <option value="3D Clay Render">3D Clay Render (Playful Toy)</option>
                      <option value="Chalkboard Sketch">Chalkboard Sketch (Classroom Chalk)</option>
                      <option value="Watercolor Illustration">Watercolor Illustration (Creative Art)</option>
                      <option value="Photorealistic">Photorealistic (Realistic)</option>
                      <option value="Minimalist">Minimalist (Flat Design)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                      <span>Scene Duration</span>
                      <span className="text-cyan-400 font-black">{scenes[activeScene].duration}s</span>
                    </label>
                    <div className="flex items-center gap-4 bg-[#0a0d14] p-3 rounded-xl border border-white/10">
                      <input 
                        type="range" min="2" max="20" step="1" 
                        value={scenes[activeScene].duration}
                        onChange={(e) => {
                          const newScenes = [...scenes];
                          newScenes[activeScene].duration = parseInt(e.target.value);
                          update({ slides: newScenes });
                        }}
                        className="flex-1 h-1 bg-white/10 rounded-full appearance-none accent-indigo-500 cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Right Side: Stock Image Visual Preview with Regenerate button */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between items-center">
                  <span>Scene Visual (Custom AI Generation)</span>
                  <button
                    onClick={() => {
                      const newScenes = [...scenes];
                      const active = newScenes[activeScene];
                      
                      // Fallback if visualPrompt is missing
                      if (!active.visualPrompt) {
                        active.visualPrompt = generateVisualPromptForStyle(active.text, active.style || 'Cinematic');
                      }
                      
                      const safePrompt = active.visualPrompt.length > 180 ? active.visualPrompt.substring(0, 180) : active.visualPrompt;
                      const sanitized = sanitizePromptForUrl(safePrompt);
                      const encodedPrompt = encodeURIComponent(sanitized);
                      const newUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&private=true&model=flux`;
                      
                      // Trigger loading states immediately and let browser native fetch handle it
                      setImageLoadError(true);
                      
                      // Append a fresh random seed to bypass cache and force a new creative generation
                      const freshSeed = Math.floor(Math.random() * 1000000);
                      const freshUrl = `${newUrl}&seed=${freshSeed}`;
                      
                      active.imageUrl = freshUrl;
                      update({ slides: newScenes });
                    }}
                    disabled={isGenerating}
                    className={`text-[9px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {isGenerating ? '✨ Generating...' : '🎲 Regenerate via AI'}
                  </button>
                </label>
                <div className="w-full aspect-video rounded-2xl bg-[#0a0d14] border border-white/5 overflow-hidden flex items-center justify-center relative group">
                  {(isGenerating || autoGeneratingIndex === activeScene) ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse">AI is drawing your scene...</span>
                    </div>
                  ) : imageLoadError ? (
                    <div className="flex flex-col items-center gap-2.5 p-6 text-center">
                      <Sparkles size={22} className="text-purple-400 animate-pulse" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Creating your custom AI art...</span>
                      <p className="text-[9px] text-slate-500 font-medium max-w-xs leading-relaxed">
                        The AI is drawing this scene now. It will appear here shortly! If it does not load, please check your network connection.
                      </p>
                    </div>
                  ) : scenes[activeScene].imageUrl ? (
                    <img 
                      src={scenes[activeScene].imageUrl} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" 
                      alt="Visual Preview"
                      onLoad={() => setImageLoadError(false)}
                      onError={() => setImageLoadError(true)}
                    />
                  ) : (
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">No Visual Selected</span>
                  )}
                  {!(isGenerating || autoGeneratingIndex === activeScene) && scenes[activeScene].imageUrl && !imageLoadError && (
                    <div className="absolute inset-0 bg-[#0a0d14]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-lg border border-white/5">
                        Visual: {scenes[activeScene].type || 'IMAGE'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Custom AI Visual Prompt Textarea Box */}
                <div className="space-y-2 mt-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between items-center">
                    <span>AI Visual Description / Prompt</span>
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Flux Model (Full Control)</span>
                  </label>
                  <textarea
                    value={scenes[activeScene].visualPrompt || ""}
                    onChange={(e) => {
                      const newScenes = [...scenes];
                      newScenes[activeScene].visualPrompt = e.target.value;
                      update({ slides: newScenes });
                    }}
                    placeholder="Describe the visual scene you want to generate in detail..."
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-indigo-500/50 cursor-text transition-colors resize-none h-24 custom-scrollbar font-medium leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Playback Progression Tracker */}
            <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-6">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-[#0a0d14] flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
              </button>
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  <span>Playback Progress</span>
                  <span className="text-white font-mono">{formatTime(currentTime)} <span className="text-slate-600">/</span> {formatTime(totalDuration)}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full relative group overflow-hidden border border-white/5 shadow-inner">
                  <input 
                    type="range" min="0" max={totalDuration} step="0.1" 
                    value={currentTime}
                    onChange={(e) => handleSeek(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-100 ease-linear relative rounded-full" 
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border border-indigo-400 scale-0 group-hover:scale-100 transition-transform duration-300 z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summaries & Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#121620]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-[0.03] bg-cyan-400 pointer-events-none" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Project Summary</h3>
            
            <div className="space-y-4 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Scenes</span>
                <span className="text-white font-mono font-black bg-white/5 px-3 py-1 rounded-lg border border-white/5">{scenes.length}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Run Time</span>
                <span className="text-cyan-400 font-mono font-black bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/10">{totalDuration}s</span>
              </div>
            </div>
          </div>

          {/* AI Storyboard Panel */}
          <div className="bg-[#121620]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-[0.03] bg-purple-400 pointer-events-none" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              AI Storyboard Status
            </h3>
            
            <div className="space-y-4 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-wider">Visuals Ready</span>
                <span className={`${(data.slides ? data.slides.filter(s => s.imageUrl && s.imageUrl.includes('image.pollinations.ai')).length : 0) === scenes.length ? 'text-emerald-400' : 'text-purple-400'} font-mono font-black`}>
                  {data.slides ? data.slides.filter(s => s.imageUrl && s.imageUrl.includes('image.pollinations.ai')).length : 0} <span className="text-slate-600">/</span> {scenes.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                  <div 
                    className={`h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 ${autoGeneratingIndex !== -1 ? 'animate-pulse' : ''}`}
                    style={{ width: `${((data.slides ? data.slides.filter(s => s.imageUrl && s.imageUrl.includes('image.pollinations.ai')).length : 0) / (scenes.length || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                  <span className="text-slate-600">Storyboard Progress</span>
                  {autoGeneratingIndex !== -1 ? (
                    <span className="text-purple-400 animate-pulse">AI drawing...</span>
                  ) : (data.slides ? data.slides.filter(s => s.imageUrl && s.imageUrl.includes('image.pollinations.ai')).length : 0) === scenes.length ? (
                    <span className="text-emerald-400 font-black">All Set!</span>
                  ) : (
                    <span className="text-slate-500">Generating...</span>
                  )}
                </div>
              </div>

              {/* Regenerate All Button */}
              <button
                onClick={() => {
                  if (autoGeneratingIndex !== -1) return;
                  const newScenes = scenes.map(scene => ({
                    ...scene,
                    imageUrl: '', // clear image url to trigger background generation for all!
                    visualPrompt: generateVisualPromptForStyle(scene.text, scene.style || 'Cinematic')
                  }));
                  update({ slides: newScenes });
                }}
                disabled={autoGeneratingIndex !== -1}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                  autoGeneratingIndex !== -1
                  ? 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 active:scale-98 cursor-pointer'
                }`}
              >
                <Zap size={12} className={autoGeneratingIndex !== -1 ? 'animate-spin' : ''} />
                {autoGeneratingIndex !== -1 ? 'Generating Storyboard...' : '⚡ Re-Generate All Visuals'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center">
        <button className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest cursor-pointer">
          <X size={16} /> Cancel Draft
        </button>
        <div className="flex gap-4">
          <button 
            onClick={onBack} 
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5 cursor-pointer"
          >
            Previous Step
          </button>
          <button 
            onClick={handleNext} 
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-[#0a0d14] rounded-xl font-black text-sm transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            Review & Generate
          </button>
        </div>
      </div>
    </div>
  );
}
