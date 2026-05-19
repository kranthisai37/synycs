import React, { useState, useEffect } from 'react';
import { Bell, LogOut, User, Settings, CheckCheck } from 'lucide-react';

export default function Header({ onLogout, setActiveTab }) {
  const [profileData, setProfileData] = useState({
    username: 'creator@eduvideo.ai',
    profilePic: null,
    name: 'Creator'
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Render Completed',
      message: 'Video project #77 is ready for playback.',
      time: 'Just now',
      unread: true
    },
    {
      id: 2,
      title: 'Local Fallback Active',
      message: 'Bark and Wav2Lip engines are online and running.',
      time: '15 mins ago',
      unread: true
    },
    {
      id: 3,
      title: 'Welcome to EduVideo',
      message: 'Explore the high-fidelity educational layout!',
      time: '2 hours ago',
      unread: false
    }
  ]);

  const loadProfile = () => {
    const username = localStorage.getItem('username') || 'creator@eduvideo.ai';
    const profilePic = localStorage.getItem('profilePic');
    const fullName = localStorage.getItem('fullName');
    
    let name = fullName;
    if (!name) {
      const namePart = username.split('@')[0];
      name = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._]/g, ' ');
    }
    
    setProfileData({ username, profilePic, name });
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('userProfileUpdated', loadProfile);

    // Click outside handler
    const handleClickOutside = (e) => {
      if (!e.target.closest('#notification-btn') && !e.target.closest('#notification-dropdown')) {
        setIsNotificationsOpen(false);
      }
      if (!e.target.closest('#profile-btn') && !e.target.closest('#profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('userProfileUpdated', loadProfile);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false);
    setHasUnread(false);
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false);
  };

  return (
    <header className="h-[80px] fixed top-0 left-0 right-0 bg-[#0d1017] border-b border-white/5 flex items-center justify-between px-10 z-50">
      {/* Logo */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          EduVideo
        </h1>
      </div>

      {/* Navigation Space */}
      <nav className="hidden md:flex items-center gap-10">
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-6 relative">
        {/* Bell Button */}
        <button 
          id="notification-btn"
          onClick={handleNotificationsClick}
          className={`p-2 rounded-xl transition-all relative ${
            isNotificationsOpen 
              ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bell size={20} />
          {hasUnread && (
            <>
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full"></span>
            </>
          )}
        </button>

        {/* Notifications Dropdown */}
        {isNotificationsOpen && (
          <div 
            id="notification-dropdown"
            className="absolute top-[50px] right-16 w-[360px] bg-[#10141f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Notifications
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-400 font-medium rounded-full">
                    {notifications.filter(n => n.unread).length} new
                  </span>
                )}
              </h3>
              <button 
                onClick={() => setNotifications([])}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
                  <CheckCheck className="mb-2 text-indigo-500/30" size={28} />
                  No new notifications
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-xl border transition-all text-left ${
                      n.unread 
                        ? 'bg-indigo-500/5 border-indigo-500/20' 
                        : 'bg-white/2 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-bold text-xs text-white">{n.title}</h4>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Profile Action Container */}
        <div className="flex items-center gap-4 pl-4 border-l border-white/5">
          {/* Clickable Profile Avatar */}
          <div 
            id="profile-btn"
            onClick={handleProfileClick}
            className={`w-10 h-10 rounded-full p-0.5 shadow-[0_0_15px_rgba(99,102,241,0.15)] cursor-pointer hover:scale-105 transition-all ${
              isProfileOpen 
                ? 'bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 ring-2 ring-indigo-500/40 scale-105' 
                : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400'
            }`}
            title={profileData.name}
          >
            <img 
              src={profileData.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=0d1017&color=fff&size=100`}
              alt="Profile" 
              className="w-full h-full rounded-full object-cover border border-[#0d1017]" 
            />
          </div>
        </div>

        {/* Profile Dropdown */}
        {isProfileOpen && (
          <div 
            id="profile-dropdown"
            className="absolute top-[50px] right-0 w-[260px] bg-[#10141f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {/* Header profile info */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/5 mb-3 text-left">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-0.5">
                <img 
                  src={profileData.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=0d1017&color=fff&size=100`}
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover border border-[#0d1017]" 
                />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-xs text-white truncate">{profileData.name}</h4>
                <p className="text-[10px] text-slate-500 truncate">{profileData.username}</p>
              </div>
            </div>
            
            {/* Nav actions */}
            <div className="space-y-1">
              <button 
                onClick={() => { setActiveTab('account'); setIsProfileOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium text-left"
              >
                <User size={15} className="text-indigo-400" />
                My Account
              </button>
              
              <button 
                onClick={() => { setActiveTab('settings'); setIsProfileOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium text-left"
              >
                <Settings size={15} className="text-purple-400" />
                Settings
              </button>
              
              <div className="pt-2 mt-2 border-t border-white/5">
                <button 
                  onClick={() => { onLogout(); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-xs font-bold text-left"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
