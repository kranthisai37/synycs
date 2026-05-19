import React from 'react';
import { 
  LayoutDashboard, 
  Library, 
  Settings, 
  Plus,
  Zap,
  User,
  LogOut,
  Users,
  Mic
} from 'lucide-react';

const NavItem = ({ icon: Icon, label, active, onClick, variant = 'default' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
      ? 'bg-[#1c2130] text-white shadow-sm' 
      : variant === 'danger' 
        ? 'text-rose-400 hover:bg-rose-500/10' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={18} className={active ? 'text-indigo-400' : variant === 'danger' ? 'text-rose-500' : 'text-slate-500 group-hover:text-slate-300'} />
    <span className="text-sm font-medium tracking-tight">{label}</span>
  </button>
);

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-[#0d1017] border-r border-white/5 flex flex-col z-40 p-6">
      {/* Workspace Header */}
      <div className="mb-10 px-2">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-white tracking-tight">Educator Workspace</h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Zap size={10} className="text-indigo-400 fill-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Pro Plan</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        <NavItem 
          icon={LayoutDashboard} 
          label="Studio" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <NavItem 
          icon={Library} 
          label="Library" 
          active={activeTab === 'library'} 
          onClick={() => setActiveTab('library')} 
        />
        <NavItem 
          icon={Users} 
          label="Avatars" 
          active={activeTab === 'avatars'} 
          onClick={() => setActiveTab('avatars')} 
        />
        <NavItem 
          icon={Mic} 
          label="Voice Studio" 
          active={activeTab === 'voice-studio'} 
          onClick={() => setActiveTab('voice-studio')} 
        />
        <NavItem 
          icon={Settings} 
          label="Settings" 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
        />
        
        <div className="pt-4 mt-4 border-t border-white/5">
          <div className="px-4 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account</span>
          </div>
          <NavItem 
            icon={User} 
            label="Account Details" 
            active={activeTab === 'account'} 
            onClick={() => setActiveTab('account')} 
          />
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto space-y-4">
        <NavItem 
          icon={LogOut} 
          label="Sign Out" 
          variant="danger"
          onClick={onLogout} 
        />
        
        <button 
          onClick={() => setActiveTab('wizard')}
          className="w-full py-4 bg-gradient-to-r from-cyan-200 to-cyan-400 hover:from-cyan-100 hover:to-cyan-300 text-[#0d1017] rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Create New Video
        </button>
      </div>
    </aside>
  );
}
