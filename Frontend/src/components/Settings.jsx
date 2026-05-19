import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Film, 
  User, 
  Volume2, 
  Bell, 
  Shield, 
  Key, 
  Save, 
  Check, 
  Sliders, 
  Copy, 
  Eye, 
  EyeOff, 
  Sparkles,
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function Settings({ initialSubTab = 'general' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('eduvideo_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    // Deep dynamic defaults aligned with EduVideo
    return {
      // General
      theme: 'cinematic',
      autoSave: true,
      autoSaveInterval: '1m',
      quality: '4k',
      aspectRatio: '16:9',
      // Video
      videoFormat: 'mp4',
      burnSubtitles: true,
      brandingOverlay: false,
      renderPriority: 'super-res',
      // Avatar
      defaultAvatar: 'daniel',
      presentationMode: 'split',
      lipSyncModel: 'heygen',
      avatarExpression: 'professional',
      // Voice
      defaultVoice: 'alloy',
      voicePitch: 1.0,
      speakingSpeed: 0.95,
      backgroundMusic: true,
      musicVolume: 15,
      // Notifications
      desktopAlerts: true,
      emailAlerts: true,
      creditAlerts: true,
      // Privacy
      anonymizeData: false,
      linkExpiry: '7d',
      analyticsOptIn: true,
      // API
      webhookUrl: '',
      sandboxMode: false,
      apiKey: 'ev_live_7a3d90f23b2c1aef8f'
    };
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('eduvideo_settings', JSON.stringify(settings));
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(settings.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playVoiceSample = (v) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const capitalizedName = v.charAt(0).toUpperCase() + v.slice(1);
      const textToSpeak = `Hi, I'm ${capitalizedName}.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      const voices = window.speechSynthesis.getVoices();
      
      // Filter available system voices into smart buckets
      const femaleVoices = voices.filter(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('zira') || 
        voice.name.toLowerCase().includes('hazel') ||
        voice.name.toLowerCase().includes('susan') || 
        voice.name.toLowerCase().includes('heera') ||
        voice.name.toLowerCase().includes('haruka')
      );
      
      const maleVoices = voices.filter(voice => 
        voice.name.toLowerCase().includes('male') || 
        voice.name.toLowerCase().includes('david') || 
        voice.name.toLowerCase().includes('george') || 
        voice.name.toLowerCase().includes('ravi') ||
        voice.name.toLowerCase().includes('mark')
      );

      const britishVoices = voices.filter(voice => 
        voice.lang.toLowerCase().includes('en-gb') || 
        voice.name.toLowerCase().includes('hazel') || 
        voice.name.toLowerCase().includes('great britain') || 
        voice.name.toLowerCase().includes('uk')
      );

      const defaultEnglishVoices = voices.filter(voice => 
        voice.lang.toLowerCase().startsWith('en')
      );

      let selectedVoice = null;
      let pitchModifier = settings.voicePitch;
      let rateModifier = settings.speakingSpeed;

      if (v === 'alloy') {
        selectedVoice = defaultEnglishVoices[0] || voices[0];
      } else if (v === 'onyx') {
        // Deep resonant male voice
        selectedVoice = maleVoices[0] || defaultEnglishVoices.find(x => x.name.toLowerCase().includes('david')) || defaultEnglishVoices[0];
        pitchModifier = Math.max(0.65, settings.voicePitch - 0.25);
      } else if (v === 'echo') {
        // Crisp, energetic male voice
        selectedVoice = maleVoices[1] || maleVoices[0] || defaultEnglishVoices[0];
        rateModifier = Math.min(1.4, settings.speakingSpeed + 0.15);
      } else if (v === 'nova') {
        // Bright vibrant female voice
        selectedVoice = femaleVoices[0] || defaultEnglishVoices.find(x => x.name.toLowerCase().includes('zira')) || defaultEnglishVoices[0];
        pitchModifier = Math.min(1.4, settings.voicePitch + 0.22);
      } else if (v === 'fable') {
        // British narrator accent
        selectedVoice = britishVoices[0] || defaultEnglishVoices.find(x => x.lang.toLowerCase().includes('en-gb')) || defaultEnglishVoices[0];
      } else if (v === 'shimmer') {
        // Crisp high-fidelity female voice
        selectedVoice = femaleVoices[1] || femaleVoices[0] || defaultEnglishVoices[0];
        pitchModifier = Math.min(1.3, settings.voicePitch + 0.08);
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.pitch = pitchModifier;
      utterance.rate = rateModifier;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const avatarImages = {
    daniel: 'https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=150&h=150&fit=crop',
    sophia: 'https://plus.unsplash.com/premium_photo-1688350839154-1a131bccd78a?q=80&w=400&h=400&fit=crop',
    james: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop',
    aisha: 'https://plus.unsplash.com/premium_photo-1663075864525-cedf69dbff05?q=80&w=400&h=400&fit=crop',
    olivia: 'https://plus.unsplash.com/premium_photo-1690294614341-cf346ba0a637?q=80&w=400&h=400&fit=crop',
    arjun: 'https://plus.unsplash.com/premium_photo-1689977927774-401b12d137d6?w=150&h=150&fit=crop',
    mei: 'https://plus.unsplash.com/premium_photo-1688740375397-34605b6abe48?w=150&h=150&fit=crop',
    lucas: 'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?w=150&h=150&fit=crop',
    isabella: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    noah: 'https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?w=150&h=150&fit=crop'
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, desc: 'Quality & theme specs' },
    { id: 'video', label: 'Video', icon: Film, desc: 'Formating & sub-titles' },
    { id: 'avatar', label: 'Avatar', icon: User, desc: 'Presenter & LipSync models' },
    { id: 'voice', label: 'Voice', icon: Volume2, desc: 'Pitch, engine & overlays' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Render & low credit cues' }
  ];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Studio Settings</h2>
          <p className="text-lg text-slate-400 font-medium">Fine-tune your dynamic neural rendering engine defaults</p>
        </div>
        
        {/* Floating save confirmation toast */}
        <div className="flex items-center gap-4 relative">
          {showToast && (
            <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 animate-fade-in">
              <Check size={16} />
              <span className="text-xs uppercase tracking-wider">Preferences Locked</span>
            </div>
          )}
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="group relative px-8 py-4 bg-white text-[#0a0d14] rounded-2xl font-bold flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:scale-[1.02] active:scale-95 disabled:opacity-75 disabled:hover:scale-100 min-w-[180px] transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {isSaving ? (
              <div className="relative z-10 w-5 h-5 border-2 border-[#0a0d14]/30 border-t-[#0a0d14] rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} className="relative z-10 text-indigo-600" />
                <span className="relative z-10 text-indigo-950">Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Sub-navigation Tabs */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer ${
                  isActive 
                  ? 'bg-gradient-to-r from-indigo-500/10 to-transparent border-indigo-500/30 text-white shadow-xl shadow-indigo-500/5' 
                  : 'bg-[#121620]/40 border-white/5 text-slate-400 hover:bg-[#121620]/80 hover:text-white hover:border-white/10'
                }`}
              >
                <div className={`p-2.5 rounded-xl border transition-all ${
                  isActive 
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' 
                  : 'bg-black/20 border-white/5 text-slate-500 group-hover:text-slate-300'
                }`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight">{tab.label}</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-none mt-1">{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Settings Card Pane */}
        <div className="lg:col-span-3">
          <div className="bg-[#121620]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 md:p-10 transition-all hover:border-white/10 min-h-[500px]">
            
            {/* 1. GENERAL PANE */}
            {activeSubTab === 'general' && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-white/5 pb-5">
                  <h3 className="text-xl font-bold text-white mb-1">General Preferences</h3>
                  <p className="text-xs text-slate-500 font-medium">Configure global workspace specs and auto-saving rules</p>
                </div>

                <div className="space-y-8">
                  {/* Aspect Ratio Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Default Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: '16:9', label: '16:9 Landscape', desc: 'Youtube / Presentations' },
                        { id: '9:16', label: '9:16 Portrait', desc: 'Shorts / TikToks' },
                        { id: '1:1', label: '1:1 Square', desc: 'Instagram / Feed' }
                      ].map((ratio) => (
                        <button
                          key={ratio.id}
                          onClick={() => updateSetting('aspectRatio', ratio.id)}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                            settings.aspectRatio === ratio.id 
                            ? 'border-indigo-500/50 bg-indigo-500/5 text-white' 
                            : 'border-white/5 bg-[#0a0d14] text-slate-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-sm">{ratio.id}</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-1">{ratio.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution Quality */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Default Render Resolution</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: '4k', label: '4K UHD Presentation', desc: 'Ultra High Definition (3840 x 2160)' },
                        { id: '1080p', label: '1080p Pro Quality', desc: 'Full High Definition (1920 x 1080)' }
                      ].map((quality) => (
                        <button
                          key={quality.id}
                          onClick={() => updateSetting('quality', quality.id)}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                            settings.quality === quality.id 
                            ? 'border-cyan-500/50 bg-cyan-500/5 text-white' 
                            : 'border-white/5 bg-[#0a0d14] text-slate-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-sm flex items-center gap-1.5">
                            {quality.label}
                            {quality.id === '4k' && <Sparkles size={12} className="text-indigo-400" />}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-1">{quality.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto Save Config */}
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Auto-Save Studio Drafts</h4>
                      <p className="text-xs text-slate-400 font-medium">Automatically save script and timeline configurations.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <select 
                        value={settings.autoSaveInterval} 
                        onChange={(e) => updateSetting('autoSaveInterval', e.target.value)}
                        className="bg-[#0a0d14] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-indigo-500"
                        disabled={!settings.autoSave}
                      >
                        <option value="30s">Every 30s</option>
                        <option value="1m">Every 1 min</option>
                        <option value="5m">Every 5 mins</option>
                      </select>
                      <button 
                        onClick={() => updateSetting('autoSave', !settings.autoSave)}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.autoSave ? 'bg-indigo-500' : 'bg-black border border-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.autoSave ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. VIDEO PANE */}
            {activeSubTab === 'video' && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-white/5 pb-5">
                  <h3 className="text-xl font-bold text-white mb-1">Video Output Rendering</h3>
                  <p className="text-xs text-slate-500 font-medium">Customize rendering engines, subtitling, and watermarks</p>
                </div>

                <div className="space-y-6">
                  {/* Container Format */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Video Format</label>
                    <select 
                      value={settings.videoFormat} 
                      onChange={(e) => updateSetting('videoFormat', e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none cursor-pointer focus:border-indigo-500/50"
                    >
                      <option value="mp4">MP4 H.264 (Maximum Compatibility)</option>
                      <option value="webm">WebM VP9 (Highly Compressed)</option>
                    </select>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between p-5 bg-[#0a0d14] rounded-2xl border border-white/5">
                      <div className="flex gap-4 items-start pr-10">
                        <Info size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">Burn-In styled Subtitles</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">Bake beautiful, highly legible educational captions directly into the video file.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => updateSetting('burnSubtitles', !settings.burnSubtitles)}
                        className={`w-12 h-6 rounded-full relative shrink-0 transition-colors duration-300 ${settings.burnSubtitles ? 'bg-indigo-500' : 'bg-black border border-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.burnSubtitles ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-[#0a0d14] rounded-2xl border border-white/5">
                      <div className="flex gap-4 items-start pr-10">
                        <Info size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">Cinematic Brand Outro</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">Inject a clean 3-second animated branding credit at the end of every video output.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => updateSetting('brandingOverlay', !settings.brandingOverlay)}
                        className={`w-12 h-6 rounded-full relative shrink-0 transition-colors duration-300 ${settings.brandingOverlay ? 'bg-indigo-500' : 'bg-black border border-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.brandingOverlay ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-[#0a0d14] rounded-2xl border border-white/5">
                      <div className="flex gap-4 items-start pr-10">
                        <Sparkles size={16} className="text-purple-400 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">Super-Resolution Enhancer</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">Run post-processing facial super-resolution network to upscale local face assets.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => updateSetting('renderPriority', settings.renderPriority === 'super-res' ? 'standard' : 'super-res')}
                        className={`w-12 h-6 rounded-full relative shrink-0 transition-colors duration-300 ${settings.renderPriority === 'super-res' ? 'bg-indigo-500' : 'bg-black border border-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.renderPriority === 'super-res' ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. AVATAR PANE */}
            {activeSubTab === 'avatar' && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-white/5 pb-5">
                  <h3 className="text-xl font-bold text-white mb-1">Avatar & Presenter Pipeline</h3>
                  <p className="text-xs text-slate-500 font-medium">Select face representations and neural mouth-sync pipelines</p>
                </div>

                <div className="space-y-8">
                  {/* Default Presenter */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Default Presenter Face</label>
                    <div className="flex flex-wrap gap-4">
                      {Object.keys(avatarImages).map((av) => (
                        <button
                          key={av}
                          onClick={() => updateSetting('defaultAvatar', av)}
                          className={`relative rounded-2xl p-1 border cursor-pointer transition-all ${
                            settings.defaultAvatar === av 
                            ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                            : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          <img 
                            src={avatarImages[av]} 
                            className="w-16 h-16 rounded-xl object-cover" 
                            alt={av} 
                          />
                          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md bg-[#0a0d14]/80 text-[8px] font-black uppercase text-white tracking-wider capitalize`}>
                            {av}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lip-Sync Engine */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Lip-Sync Model Strategy</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'heygen', label: 'HeyGen Video Agents', desc: 'Premium cinematic mouth sync (Cloud)' },
                        { id: 'wav2lip', label: 'Wav2Lip Local Pipeline', desc: 'Dynamic Free/Offline Fallback (Local)' }
                      ].map((model) => (
                        <button
                          key={model.id}
                          onClick={() => updateSetting('lipSyncModel', model.id)}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                            settings.lipSyncModel === model.id 
                            ? 'border-indigo-500/50 bg-indigo-500/5 text-white' 
                            : 'border-white/5 bg-[#0a0d14] text-slate-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-sm">{model.label}</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-1">{model.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Avatar Expressions */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Presenter Emotional Tone</label>
                    <select 
                      value={settings.avatarExpression} 
                      onChange={(e) => updateSetting('avatarExpression', e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none cursor-pointer focus:border-indigo-500/50"
                    >
                      <option value="professional">Professional / Academic (Calm & Clear)</option>
                      <option value="excited">Energetic / Explainer (Dynamic & Engaging)</option>
                      <option value="academic">Scientific / Lectures (Highly Articulate)</option>
                      <option value="neutral">Classic / Flat (Basic read)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 4. VOICE PANE */}
            {activeSubTab === 'voice' && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-white/5 pb-5">
                  <h3 className="text-xl font-bold text-white mb-1">Vocal Synthesis & Soundbeds</h3>
                  <p className="text-xs text-slate-500 font-medium">Fine-tune voice models, pitch factors, and slide music</p>
                </div>

                <div className="space-y-8">
                  {/* Default Voice Select */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Default Synthesis Voice</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['alloy', 'onyx', 'echo', 'nova', 'fable', 'shimmer'].map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            updateSetting('defaultVoice', v);
                            playVoiceSample(v);
                          }}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            settings.defaultVoice === v 
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-black shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                            : 'border-white/5 bg-[#0a0d14] text-slate-500 hover:text-white hover:border-white/10'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Speaking Rate Speed</label>
                        <span className="text-xs font-black text-indigo-400">{settings.speakingSpeed}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.75" 
                        max="1.50" 
                        step="0.05"
                        value={settings.speakingSpeed}
                        onChange={(e) => updateSetting('speakingSpeed', parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                        <span>Slow</span>
                        <span>Normal (1.0x)</span>
                        <span>Fast</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Voice Pitch Shift</label>
                        <span className="text-xs font-black text-cyan-400">
                          {settings.voicePitch === 1.0 ? 'Normal' : settings.voicePitch > 1.0 ? `+${(settings.voicePitch - 1).toFixed(2)}` : `${(settings.voicePitch - 1).toFixed(2)}`}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0.70" 
                        max="1.30" 
                        step="0.05"
                        value={settings.voicePitch}
                        onChange={(e) => updateSetting('voicePitch', parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                        <span>Deep</span>
                        <span>Standard</span>
                        <span>Crisp</span>
                      </div>
                    </div>
                  </div>

                  {/* Background Music Volume */}
                  <div className="flex items-center justify-between p-5 bg-[#0a0d14] rounded-2xl border border-white/5 mt-4">
                    <div className="pr-6">
                      <h4 className="text-sm font-bold text-white mb-1">Slide Ambient Soundbed</h4>
                      <p className="text-xs text-slate-400 font-medium">Bake a smooth, low-volume background melody behind the voice track.</p>
                      
                      {settings.backgroundMusic && (
                        <div className="flex items-center gap-3 mt-3 w-48">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">Vol: {settings.musicVolume}%</span>
                          <input 
                            type="range" 
                            min="5" 
                            max="30" 
                            step="5"
                            value={settings.musicVolume}
                            onChange={(e) => updateSetting('musicVolume', parseInt(e.target.value))}
                            className="w-full accent-cyan-400 bg-white/5 h-1 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => updateSetting('backgroundMusic', !settings.backgroundMusic)}
                      className={`w-12 h-6 rounded-full relative shrink-0 transition-colors duration-300 ${settings.backgroundMusic ? 'bg-indigo-500' : 'bg-black border border-white/10'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.backgroundMusic ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. NOTIFICATIONS PANE */}
            {activeSubTab === 'notifications' && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-white/5 pb-5">
                  <h3 className="text-xl font-bold text-white mb-1">Alerts & Cues</h3>
                  <p className="text-xs text-slate-500 font-medium">Stay updated on finished videos and workspace status</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Desktop Completion Alerts</h4>
                      <p className="text-xs text-slate-400 font-medium">Flash a system notification as soon as a neural rendering job finishes.</p>
                    </div>
                    <button 
                      onClick={() => updateSetting('desktopAlerts', !settings.desktopAlerts)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.desktopAlerts ? 'bg-indigo-500' : 'bg-black border border-white/10'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.desktopAlerts ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Queue Success Emails</h4>
                      <p className="text-xs text-slate-400 font-medium">Email a high-fidelity direct watch link to your logged-in email upon success.</p>
                    </div>
                    <button 
                      onClick={() => updateSetting('emailAlerts', !settings.emailAlerts)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.emailAlerts ? 'bg-indigo-500' : 'bg-black border border-white/10'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.emailAlerts ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Low Credit warnings</h4>
                      <p className="text-xs text-slate-400 font-medium">Alert when API render balance drops below 100 seconds.</p>
                    </div>
                    <button 
                      onClick={() => updateSetting('creditAlerts', !settings.creditAlerts)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.creditAlerts ? 'bg-indigo-500' : 'bg-black border border-white/10'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.creditAlerts ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}
