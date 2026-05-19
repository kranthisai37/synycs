import React, { useState, useRef } from 'react';
import { Sparkles, Mic, Volume2, Check, X, PlayCircle, Plus, Play, Pause } from 'lucide-react';

export default function Step3Customization({ data, update, onNext, onBack }) {
  const avatars = [
    { id: 'daniel', name: 'Daniel', role: 'Professional', img: 'https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D' },
    { id: 'sophia', name: 'Sophia', role: 'Educator', img: 'https://plus.unsplash.com/premium_photo-1688350839154-1a131bccd78a?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 'james', name: 'James', role: 'Corporate', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop' },
    { id: 'aisha', name: 'Aisha', role: 'Professional', img: 'https://plus.unsplash.com/premium_photo-1663075864525-cedf69dbff05?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 'olivia', name: 'Olivia', role: 'Casual', img: 'https://plus.unsplash.com/premium_photo-1690294614341-cf346ba0a637?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 'arjun', name: 'Arjun', role: 'Educator', img: 'https://plus.unsplash.com/premium_photo-1689977927774-401b12d137d6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D' },
    { id: 'mei', name: 'Mei', role: 'Corporate', img: 'https://plus.unsplash.com/premium_photo-1688740375397-34605b6abe48?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D' },
    { id: 'lucas', name: 'Lucas', role: 'Professional', img: 'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzN8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D' },
    { id: 'isabella', name: 'Isabella', role: 'Corporate', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop' },
    { id: 'noah', name: 'Noah', role: 'Casual', img: 'https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXZhdGFyfGVufDB8fDB8fHww' }
  ];

  const voices = [
    { id: 'alloy', name: 'Alloy', type: 'Cinematic AI', sample: '' },
    { id: 'onyx', name: 'Onyx', type: 'Cinematic AI', sample: '' },
    { id: 'echo', name: 'Echo', type: 'Cinematic AI', sample: '' },
    { id: 'nova', name: 'Nova', type: 'Cinematic AI', sample: '' },
    { id: 'fable', name: 'Fable (UK)', type: 'Cinematic AI', sample: '' },
    { id: 'shimmer', name: 'Shimmer', type: 'Cinematic AI', sample: '' },
    { id: 'bark_v2', name: 'Bark (Local)', type: 'Local AI', sample: '' },
    { id: 'xtts_v2', name: 'XTTS (Local)', type: 'Local AI', sample: '' }
  ];

  const [pace, setPace] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(null); // track which voice is playing
  const audioRef = useRef(null);

  const selectedAvatar = data.avatar || 'daniel';
  const selectedVoice = data.voice || 'alloy';

  // Voice selection logic with better browser voice matching
  const handlePlaySample = (voiceObj) => {
    if (!voiceObj) return;

    const avatar = avatars.find(a => a.id === selectedAvatar);
    const introText = `Hi, I'm ${voiceObj.name.replace(' (UK)', '').replace(' (Local)', '')}.`;

    if (isPlaying === voiceObj.id) {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(introText);
    const availableVoices = window.speechSynthesis.getVoices();

    // Categorize browser voices
    const femaleVoices = availableVoices.filter(v =>
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('zira') ||
      v.name.toLowerCase().includes('hazel') ||
      v.name.toLowerCase().includes('susan') ||
      v.name.toLowerCase().includes('heera')
    );
    const maleVoices = availableVoices.filter(v =>
      v.name.toLowerCase().includes('male') ||
      v.name.toLowerCase().includes('david') ||
      v.name.toLowerCase().includes('george') ||
      v.name.toLowerCase().includes('ravi') ||
      v.name.toLowerCase().includes('mark')
    );
    const britishVoices = availableVoices.filter(v =>
      v.lang.toLowerCase().includes('en-gb') ||
      v.name.toLowerCase().includes('hazel')
    );
    const defaultEnglishVoices = availableVoices.filter(v =>
      v.lang.toLowerCase().startsWith('en')
    );
    const allVoices = availableVoices.length > 0 ? availableVoices : [];

    let selectedBrowserVoice = null;
    let pitchModifier = (parseFloat(pitch) / 10) + 1.0;
    let rateModifier = parseFloat(pace) || 1.0;

    if (voiceObj.id === 'alloy') {
      selectedBrowserVoice = maleVoices[0] || defaultEnglishVoices[0] || allVoices[0];
    } else if (voiceObj.id === 'onyx') {
      selectedBrowserVoice = maleVoices[0] || defaultEnglishVoices.find(x => x.name.toLowerCase().includes('david')) || allVoices[0];
      pitchModifier = Math.max(0.65, pitchModifier - 0.25);
    } else if (voiceObj.id === 'echo') {
      selectedBrowserVoice = femaleVoices[0] || defaultEnglishVoices.find(x => x.name.toLowerCase().includes('zira')) || allVoices[0];
      rateModifier = Math.min(1.4, rateModifier + 0.05);
    } else if (voiceObj.id === 'nova') {
      selectedBrowserVoice = femaleVoices[0] || defaultEnglishVoices.find(x => x.name.toLowerCase().includes('zira')) || allVoices[0];
      pitchModifier = Math.min(1.4, pitchModifier + 0.22);
    } else if (voiceObj.id === 'fable') {
      selectedBrowserVoice = britishVoices[0] || defaultEnglishVoices.find(x => x.lang.toLowerCase().includes('en-gb')) || maleVoices[0] || allVoices[0];
    } else if (voiceObj.id === 'shimmer') {
      selectedBrowserVoice = femaleVoices[1] || femaleVoices[0] || allVoices[0];
      pitchModifier = Math.min(1.3, pitchModifier + 0.08);
    } else {
      // Bark / XTTS fallback
      const isFemale = voiceObj.name.includes('Bella') || voiceObj.name.includes('Alice') || voiceObj.name.includes('Lily') || voiceObj.id === 'shimmer' || voiceObj.id === 'nova' || voiceObj.id === 'bark_v2';
      if (isFemale) {
        selectedBrowserVoice = femaleVoices[0] || allVoices[0];
      } else {
        selectedBrowserVoice = maleVoices[0] || allVoices[0];
      }
    }

    if (selectedBrowserVoice) {
      utterance.voice = selectedBrowserVoice;
      console.log(`Using browser voice: ${selectedBrowserVoice.name}`);
    }

    utterance.rate = rateModifier;
    utterance.pitch = pitchModifier;

    utterance.onstart = () => setIsPlaying(voiceObj.id);
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);

    window.speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded (Chrome fix)
  React.useEffect(() => {
    window.speechSynthesis.getVoices();
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
  }, []);

  const currentVoice = voices.find(v => v.id === selectedVoice);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
              Step 03
            </div>
            <div className="h-px w-12 bg-white/10" />
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Customization</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Cinematic Personas</h2>
          <p className="text-slate-400 font-medium mt-2">Craft your AI presenter with high-fidelity voices and custom pacing.</p>
        </div>
        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold transition-all border border-white/10 flex items-center gap-2 backdrop-blur-xl">
          <Plus size={18} />
          Custom Avatar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area (Col 8) */}
        <div className="lg:col-span-8 space-y-12">

          {/* Section 1: Avatars */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" />
                Select Presenter
              </h3>
              <div className="flex gap-2">
                {['Professional', 'Casual', 'Educator'].map(tab => (
                  <button key={tab} className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white/5 text-slate-500 hover:text-white transition-colors">
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {avatars.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => update({ avatar: avatar.id })}
                  className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-500 ${selectedAvatar === avatar.id
                    ? 'border-indigo-500 shadow-2xl shadow-indigo-500/40 scale-105 z-10'
                    : 'border-white/5 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 hover:border-white/20'
                    }`}
                >
                  <img src={avatar.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={avatar.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="text-xs font-black text-white mb-0.5">{avatar.name}</div>
                    <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{avatar.role}</div>
                  </div>
                  {selectedAvatar === avatar.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Section 2: Voices (4 per row) */}
          <section>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <Mic size={16} className="text-indigo-400" />
              Voice Selection
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {voices.map(voice => (
                <div
                  key={voice.id}
                  onClick={() => update({
                    voice: voice.id,
                    engine: 'COMMUNITY'
                  })}
                  role="button"
                  tabIndex={0}
                  className={`group relative p-4 rounded-2xl border transition-all duration-300 text-left cursor-pointer ${selectedVoice === voice.id
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-xl ${selectedVoice === voice.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                      <Volume2 size={14} />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlaySample(voice); }}
                      className={`p-2 rounded-lg transition-colors ${isPlaying === voice.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                    >
                      {isPlaying === voice.id ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                    </button>
                  </div>
                  <div className="text-xs font-black mb-1 truncate">{voice.name}</div>
                  <div className="text-[9px] uppercase font-bold opacity-40 tracking-widest">{voice.type}</div>

                  {selectedVoice === voice.id && (
                    <div className="absolute bottom-2 right-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Controls */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 p-8 rounded-3xl border border-white/5">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speaking Pace</label>
                <div className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-[10px] font-black">{pace}x</div>
              </div>
              <input
                type="range" min="0.5" max="2.0" step="0.1" value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pitch Shift</label>
                <div className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-[10px] font-black">{pitch > 0 ? `+${pitch}` : pitch}</div>
              </div>
              <input
                type="range" min="-10" max="10" step="1" value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                <span>Deep</span>
                <span>Neutral</span>
                <span>High</span>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Preview (Col 4) */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 space-y-6">
            <div className="relative group aspect-video bg-[#121620] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying === selectedVoice ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">{isPlaying === selectedVoice ? 'Playing Sample...' : 'Live Preview'}</span>
              </div>

              <img
                src={avatars.find(a => a.id === selectedAvatar)?.img}
                className={`w-full h-full object-cover transition-all duration-1000 ${isPlaying === selectedVoice ? 'scale-110 blur-[2px] opacity-70' : 'group-hover:scale-110'}`}
                alt="Preview"
              />

              <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay group-hover:opacity-0 transition-opacity" />

              <button
                onClick={() => handlePlaySample(currentVoice)}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isPlaying === selectedVoice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                  {isPlaying === selectedVoice ? <Pause size={32} fill="currentColor" /> : <PlayCircle size={32} />}
                </div>
              </button>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isPlaying === selectedVoice ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Voice</div>
                  <div className="text-sm font-black text-white">{currentVoice?.name}</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                The selected voice will be used to synthesize your script with a {pace}x speed multiplier.
              </p>
            </div>

            <button
              onClick={onNext}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
            >
              Continue to Rendering
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center">
        <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
          <X size={16} /> Cancel Draft
        </button>
        <button
          onClick={onBack}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/5"
        >
          Previous Step
        </button>
      </div>
    </div>
  );
}
