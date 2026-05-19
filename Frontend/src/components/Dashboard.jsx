import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  MoreVertical, 
  ArrowUpRight,
  Clock,
  Video,
  Sparkles,
  ShieldCheck,
  Activity,
  RefreshCw
} from 'lucide-react';
import { videoService } from '../services/videoService';
import VideoModal from './VideoModal';

const MinimalStatCard = ({ icon: Icon, label, value, trend, gradient }) => (
  <div className="relative group bg-[#121620]/80 backdrop-blur-xl rounded-3xl border border-white/5 p-6 flex items-center justify-between overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-2xl">
    {/* Radial glow backlight */}
    <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />
    
    <div className="flex items-center gap-4 relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 bg-gradient-to-br ${gradient} shadow-lg shadow-indigo-500/5`}>
        <Icon size={22} className="text-white drop-shadow-md" />
      </div>
      <div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
        <div className="text-3xl font-black text-white tracking-tight mt-0.5">{value}</div>
      </div>
    </div>
    {trend && (
      <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full relative z-10 border border-emerald-500/10">
        {trend}
      </span>
    )}
  </div>
);

const ActiveRendersWidget = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-16 w-full bg-white/[0.02] rounded-2xl animate-pulse border border-white/[0.04]" />
      </div>
    );
  }
  
  if (!items || items.length === 0) {
    return (
      <div className="relative group bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-300 hover:border-emerald-500/20">
        <div className="absolute inset-0 bg-emerald-500/[0.01] group-hover:bg-emerald-500/[0.02] transition-colors" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-left">
            <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">System: Idle</h4>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">All rendering operations complete</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div 
          key={item.id} 
          className="relative group bg-[#161a26]/90 border border-indigo-500/10 rounded-2xl p-4 flex flex-col gap-3 overflow-hidden transition-all duration-300 hover:border-indigo-500/20 shadow-lg hover:shadow-indigo-500/5"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-white truncate pr-1">{item.title}</h4>
                <span className="text-[9px] font-black text-indigo-400 tracking-wider uppercase">{item.status}</span>
              </div>
            </div>
            <span className="text-xs font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10 flex-shrink-0">
              {item.progress}%
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-[#1e2336] rounded-full overflow-hidden relative z-10 border border-white/[0.02]">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const ProjectCard = ({ project, onPlay }) => (
  <div className="group bg-[#121620]/75 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-indigo-500/5 hover:-translate-y-1">
    <div className="relative aspect-video overflow-hidden">
      <img 
        src={project.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop`} 
        alt={project.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e111a] via-transparent to-transparent opacity-90" />
      <div className="absolute top-4 right-4 flex gap-2">
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${
          project.status === 'COMPLETED' 
          ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/10' 
          : 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/10 animate-pulse'
        }`}>
          {project.status === 'COMPLETED' ? 'Completed' : 'Processing'}
        </span>
      </div>
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
        <button 
          onClick={() => onPlay && onPlay(project)}
          className="w-12 h-12 bg-white text-[#0a0d14] rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.45)] hover:bg-gradient-to-br hover:from-white hover:to-indigo-50 hover:text-indigo-600 cursor-pointer"
        >
          <PlayCircle size={24} fill="currentColor" />
        </button>
      </div>
    </div>
    <div className="p-5 flex justify-between items-center bg-gradient-to-b from-transparent to-[#0d1017]/80">
      <div className="min-w-0">
        <h4 className="text-white font-bold mb-1 text-sm truncate pr-2 group-hover:text-indigo-200 transition-colors">{project.title || 'Untitled Project'}</h4>
        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
          <Clock size={11} />
          {project.created_at ? new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
        </div>
      </div>
      <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
        <MoreVertical size={16} />
      </button>
    </div>
  </div>
);

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState({ total_videos: 0, rendering_count: 0 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Creator');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeRenders, setActiveRenders] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('username') || 'creator@eduvideo.ai';
      const fullName = localStorage.getItem('fullName');
      if (fullName) {
        setUsername(fullName);
      } else {
        const namePart = stored.split('@')[0];
        setUsername(namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._]/g, ' '));
      }
    };
    
    loadUser();
    window.addEventListener('userProfileUpdated', loadUser);
    
    return () => window.removeEventListener('userProfileUpdated', loadUser);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, projectsData] = await Promise.all([
          videoService.getStats(),
          videoService.getProjects()
        ]);
        setStats(statsData);
        setProjects(projectsData.slice(0, 3));
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const data = await videoService.getQueue();
        setActiveRenders(data);
      } catch (err) {
        // Silently ignore transient network errors (e.g. server reloading).
        // The poll will automatically retry in 5 seconds.
        if (err.code !== 'ERR_NETWORK' && err.message !== 'Network Error') {
          console.error("Active renders queue fetch error", err);
        }
      } finally {
        setQueueLoading(false);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in space-y-10 pb-12">
      {/* Premium Layout Grid: Left content and Right sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Main Content Area (Left/Center - col-span 2) */}
        <div className="xl:col-span-2 space-y-10">
          
          {/* Beautiful Glassmorphic Hero Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#131622]/90 via-[#191d2d]/90 to-[#12141f]/90 border border-white/[0.06] p-10 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group">
            {/* Neon Backlight Glows */}
            <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full blur-[80px] bg-indigo-500/10 opacity-70 group-hover:opacity-90 transition-opacity duration-700" />
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-[80px] bg-cyan-500/10 opacity-70 group-hover:opacity-90 transition-opacity duration-700" />
            
            <div className="max-w-xl relative z-10 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">System Online & Active</span>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  Welcome back, <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 drop-shadow-sm">
                    {username}
                  </span>
                </h1>
                <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                  Your EduVideo studio is primed. Unleash your creativity and transform notes into professional, engaging video lessons in seconds.
                </p>
              </div>
              
              <button 
                onClick={() => setActiveTab && setActiveTab('wizard')}
                className="group/btn relative px-8 py-4 bg-white text-[#0a0d14] rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(255,255,255,0.08)] hover:shadow-[0_0_40px_rgba(99,102,241,0.25)] transition-all duration-300 hover:scale-[1.03] active:scale-98 cursor-pointer w-full sm:w-fit mx-auto md:mx-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-white to-cyan-100 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                <Sparkles size={18} className="relative z-10 text-indigo-600 animate-pulse" />
                <span className="relative z-10 tracking-tight">Create Magic</span>
              </button>
            </div>
            
            {/* Tech / Wave Visual Graphic */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0 flex items-center justify-center z-10">
              <div className="absolute inset-0 border border-white/[0.04] rounded-full scale-100 animate-[ping_12s_infinite_linear]" />
              <div className="absolute inset-4 border border-white/[0.05] rounded-full scale-100 animate-[pulse_5s_infinite]" />
              <div className="absolute inset-8 border border-indigo-500/10 rounded-full" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-cyan-500/20 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
                <Video size={36} className="text-cyan-300 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Recent Projects Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Recent Projects</h2>
                <p className="text-xs md:text-sm font-semibold text-slate-500">Pick up right where you left off</p>
              </div>
              <button 
                onClick={() => setActiveTab && setActiveTab('library')}
                className="text-xs md:text-sm font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-all group px-4 py-2.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] backdrop-blur-md cursor-pointer"
              >
                View Library <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-slate-500 group-hover:text-white" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-white/[0.03] rounded-3xl animate-pulse border border-white/[0.04]" />
                ))
              ) : projects.length > 0 ? (
                projects.map(project => (
                  <ProjectCard key={project.id} project={project} onPlay={setSelectedVideo} />
                ))
              ) : (
                <div className="col-span-3 py-16 px-6 text-center border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.01]">
                  <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Video size={24} className="text-slate-500" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">No projects yet</h3>
                  <p className="text-slate-400 text-xs font-semibold max-w-xs mx-auto mb-6 leading-relaxed">You haven't created any videos yet. Start your first project to see it appear here.</p>
                  <button 
                    onClick={() => setActiveTab && setActiveTab('wizard')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/5 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Create First Video
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Section (Right - col-span 1) */}
        <div className="space-y-6">
          
          {/* Section Header */}
          <div className="pb-1 border-b border-white/[0.05] mb-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-slate-500" />
              Studio Overview
            </h3>
          </div>

          {/* Total Rendered Videos Card */}
          <MinimalStatCard 
            icon={PlayCircle} 
            label="Total Videos Rendered" 
            value={stats.total_videos || 0} 
            trend={stats.total_videos > 0 ? `+${stats.total_videos} active` : null} 
            gradient="from-indigo-500/20 to-cyan-500/20"
          />

          {/* Render Queue Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <RefreshCw size={12} className="text-slate-400 animate-[spin_10s_linear_infinite]" />
              Render Queue
            </h4>
            <ActiveRendersWidget items={activeRenders} loading={queueLoading} />
          </div>

          {/* Quick Tips Box (Visual Polish) */}
          <div className="relative overflow-hidden bg-[#121620]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col gap-4 group">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-[40px] bg-purple-500/10 opacity-50" />
            <div className="flex gap-3.5 items-start relative z-10">
              <div className="mt-1 p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                <ShieldCheck size={16} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[10px] text-white uppercase tracking-wider mb-1">AI Engines Active</h4>
                <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">
                  Local fallbacks are active. Running local high-quality rendering models (Bark, XTTS, Wav2Lip) to bypass premium cloud API limitations.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}
