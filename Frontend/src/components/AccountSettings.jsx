import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  ShieldCheck, 
  Zap, 
  AtSign, 
  Phone, 
  Briefcase, 
  Globe, 
  Clock, 
  FileText 
} from 'lucide-react';

export default function AccountSettings() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    company: '',
    language: 'English',
    timezone: 'UTC'
  });

  const [profilePic, setProfilePic] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load full profile details from localStorage
    const savedEmail = localStorage.getItem('username') || 'creator@eduvideo.ai';
    const savedName = localStorage.getItem('fullName') || '';
    const savedHandle = localStorage.getItem('userHandle') || '';
    const savedPhone = localStorage.getItem('phone') || '';
    const savedBio = localStorage.getItem('bio') || '';
    const savedCompany = localStorage.getItem('company') || '';
    const savedLanguage = localStorage.getItem('language') || 'English';
    const savedTimezone = localStorage.getItem('timezone') || 'UTC';
    const savedProfilePic = localStorage.getItem('profilePic');

    let initialName = savedName;
    if (!initialName) {
      const namePart = savedEmail.split('@')[0];
      initialName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._]/g, ' ');
    }

    let initialHandle = savedHandle;
    if (!initialHandle) {
      initialHandle = '@' + savedEmail.split('@')[0];
    }

    setFormData({
      name: initialName,
      username: initialHandle,
      email: savedEmail,
      phone: savedPhone,
      bio: savedBio,
      company: savedCompany,
      language: savedLanguage,
      timezone: savedTimezone
    });

    if (savedProfilePic) {
      setProfilePic(savedProfilePic);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas to resize and compress
          const canvas = document.createElement('canvas');
          const max_size = 200; // Optimal resolution for avatar/headers
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.8 quality (extremely lightweight, perfect thumbnail)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setProfilePic(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      let updated = false;
      try {
        if (formData.email !== localStorage.getItem('username')) {
          localStorage.setItem('username', formData.email);
          updated = true;
        }
        
        localStorage.setItem('fullName', formData.name);
        localStorage.setItem('userHandle', formData.username);
        localStorage.setItem('phone', formData.phone);
        localStorage.setItem('bio', formData.bio);
        localStorage.setItem('company', formData.company);
        localStorage.setItem('language', formData.language);
        localStorage.setItem('timezone', formData.timezone);
        updated = true;
        
        if (profilePic && profilePic !== localStorage.getItem('profilePic')) {
          localStorage.setItem('profilePic', profilePic);
          updated = true;
        }
      } catch (err) {
        console.error("Local storage save error:", err);
      }

      // Dispatch event to update Header, Dashboard, Sidebar in real-time
      if (updated) {
        window.dispatchEvent(new Event('userProfileUpdated'));
      }
      
    }, 1200);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Account Details</h2>
        <p className="text-lg text-slate-400 font-medium">Manage your personal profile, public identity, and course creator details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Summary */}
        <div className="space-y-6">
          <div className="relative group bg-[#121620]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 text-center overflow-hidden transition-all hover:border-white/10 hover:shadow-2xl">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative w-32 h-32 mx-auto mb-6 z-10">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-1 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <img 
                  src={profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0d1017&color=fff&size=200`}
                  className="w-full h-full rounded-full object-cover border-4 border-[#0d1017]" 
                  alt="Profile"
                />
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-white text-[#0d1017] rounded-full shadow-xl border-2 border-[#0d1017] hover:scale-110 hover:bg-indigo-50 transition-all duration-300 cursor-pointer"
                title="Change Avatar"
              >
                <Camera size={16} />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-1.5 relative z-10 truncate max-w-full px-2">{formData.name}</h3>
            <p className="text-xs font-mono text-indigo-400 mb-4 relative z-10">{formData.username}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 relative z-10">
              <Zap size={12} className="text-indigo-400 fill-indigo-400" />
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Pro Creator</p>
            </div>
            
            <div className="pt-6 border-t border-white/5 flex justify-center gap-6 relative z-10">
              <div className="text-center group-hover:-translate-y-1 transition-transform duration-300">
                <div className="text-2xl font-black text-white mb-0.5">42</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Videos</div>
              </div>
              <div className="w-px h-10 bg-white/5" />
              <div className="text-center group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                <div className="text-2xl font-black text-white mb-0.5">8.4k</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Credits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Creator Profile Form */}
          <div className="bg-[#121620]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 md:p-10 transition-all hover:border-white/10">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <User size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Creator Profile</h3>
                  <p className="text-xs text-slate-500 font-medium">Update your educational identity, preferences, and details</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-white focus:border-indigo-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Username</label>
                <div className="relative group">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-white focus:border-indigo-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-white focus:border-indigo-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="tel" 
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-white focus:border-indigo-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Company / Organization */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Company / Organization</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Enter school or organization"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-white focus:border-indigo-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Language Preference */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Language Preference</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <select 
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-12 pr-10 text-sm font-medium text-white focus:border-indigo-500/50 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="English">English (United States)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                  </select>
                </div>
              </div>

              {/* Time Zone */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Time Zone</label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <select 
                    value={formData.timezone}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-12 pr-10 text-sm font-medium text-white focus:border-indigo-500/50 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="EST">EST (Eastern Standard Time / UTC-5)</option>
                    <option value="CST">CST (Central Standard Time / UTC-6)</option>
                    <option value="PST">PST (Pacific Standard Time / UTC-8)</option>
                    <option value="GMT">GMT (Greenwich Mean Time / UTC+0)</option>
                    <option value="IST">IST (Indian Standard Time / UTC+5:30)</option>
                  </select>
                </div>
              </div>

              {/* Bio / About Creator */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Bio / About creator</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <textarea 
                    rows={4}
                    placeholder="Tell us about yourself as a course creator or educator..."
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-white focus:border-indigo-500/50 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-6">
            {showSuccess && (
              <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 animate-fade-in md:mr-auto">
                <ShieldCheck size={18} />
                <span>Changes saved successfully</span>
              </div>
            )}
            
            <button 
              onClick={() => {
                const savedEmail = localStorage.getItem('username') || 'creator@eduvideo.ai';
                const savedName = localStorage.getItem('fullName') || '';
                const savedHandle = localStorage.getItem('userHandle') || '';
                const savedPhone = localStorage.getItem('phone') || '';
                const savedBio = localStorage.getItem('bio') || '';
                const savedCompany = localStorage.getItem('company') || '';
                const savedLanguage = localStorage.getItem('language') || 'English';
                const savedTimezone = localStorage.getItem('timezone') || 'UTC';
                
                let initialName = savedName;
                if (!initialName) {
                  const namePart = savedEmail.split('@')[0];
                  initialName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._]/g, ' ');
                }

                let initialHandle = savedHandle;
                if (!initialHandle) {
                  initialHandle = '@' + savedEmail.split('@')[0];
                }

                setFormData({
                  name: initialName,
                  username: initialHandle,
                  email: savedEmail,
                  phone: savedPhone,
                  bio: savedBio,
                  company: savedCompany,
                  language: savedLanguage,
                  timezone: savedTimezone
                });
              }}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-transparent hover:border-white/10 cursor-pointer"
            >
              Discard Changes
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="group relative px-10 py-4 bg-white text-[#0a0d14] rounded-2xl font-bold flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 min-w-[200px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isSaving ? (
                <div className="relative z-10 w-5 h-5 border-2 border-[#0a0d14]/30 border-t-[#0a0d14] rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} className="relative z-10 text-indigo-600" />
                  <span className="relative z-10 text-indigo-950">Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
