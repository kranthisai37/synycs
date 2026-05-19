import React, { useEffect, useState } from 'react';
import { Filter, ListFilter, CheckCircle, Edit3, Play, Trash2, AlertCircle, Search, Share2, Video, Clock, X, Download } from 'lucide-react';
import { videoService } from '../services/videoService';
import VideoModal from './VideoModal';

const DeleteConfirmationModal = ({ video, onConfirm, onCancel, isDeleting }) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0a0d14]/80 backdrop-blur-sm animate-fade-in"
        onClick={!isDeleting ? onCancel : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-[#121620] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl shadow-rose-500/10 overflow-hidden animate-slide-up">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500" />
        
        <div className="p-8">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 mx-auto">
            <AlertCircle size={32} className="text-rose-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">Delete Video?</h2>
          <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed">
            Are you sure you want to delete <span className="text-white font-bold">"{video.title}"</span>? This action cannot be undone and the video will be permanently removed from your library.
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5 hover:border-white/10"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(video.id)}
              disabled={isDeleting}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DownloadConfirmationModal = ({ video, onConfirm, onCancel, isDownloading }) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0a0d14]/80 backdrop-blur-sm animate-fade-in"
        onClick={!isDownloading ? onCancel : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-[#121620] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl shadow-indigo-500/10 overflow-hidden animate-slide-up">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500" />
        
        <div className="p-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 mx-auto">
            <Download size={32} className="text-indigo-400 animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">Download Video?</h2>
          <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed">
            Would you like to download <span className="text-white font-bold">"{video.title}"</span> to your local device? This will save a high-quality offline copy of your video.
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={onCancel}
              disabled={isDownloading}
              className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5 hover:border-white/10"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(video)}
              disabled={isDownloading}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onEdit, onPlay, onDelete, onDownload, onShare }) => {
  const isCompleted = project.status === 'COMPLETED';
  const isProcessing = ['PENDING', 'PARSING', 'RENDERING'].includes(project.status);

  return (
    <div 
      className="group relative bg-[#121620]/80 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:-translate-y-1 hover:shadow-indigo-500/10 cursor-pointer"
      onClick={() => onEdit(project)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={project.thumbnail_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop`} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-4 right-4 flex gap-2">
          {isProcessing ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 rounded-full shadow-lg">
              <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                {project.progress ? `${project.progress}%` : 'Starting...'}
              </span>
            </div>
          ) : (
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg border ${
              isCompleted 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-white/10 text-slate-300 border-white/10'
            }`}>
              {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
            </span>
          )}
        </div>
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-10 backdrop-blur-[2px]" onClick={(e) => e.stopPropagation()}>
          {isCompleted && (
            <button 
              onClick={(e) => { e.stopPropagation(); onPlay(project); }}
              className="w-10 h-10 bg-white text-[#0a0d14] rounded-full flex items-center justify-center hover:scale-110 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              title="Play Video"
            >
              <Play fill="currentColor" size={16} className="ml-0.5" />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onDownload(project); }}
            className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-indigo-500 hover:border-indigo-500 hover:text-white transition-all shadow-lg"
            title="Download Video"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(project); }}
            className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-rose-300 hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-lg"
            title="Delete Video"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-gradient-to-b from-transparent to-[#0d1017]/50 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-bold mb-1.5 text-lg truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-cyan-300 transition-all" title={project.title}>
              {project.title || 'Untitled Project'}
            </h4>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Clock size={12} />
              {project.created_at ? new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
            </div>
          </div>
          
          {isCompleted && (
            <button
              onClick={(e) => { e.stopPropagation(); onShare(project); }}
              className="p-2.5 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/30 rounded-xl text-slate-400 transition-all duration-300 flex items-center justify-center shrink-0"
              title="Copy share link"
            >
              <Share2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Library({ onEdit }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Custom Delete Modal
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for Custom Download Modal
  const [videoToDownload, setVideoToDownload] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await videoService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerDelete = (project) => {
    setVideoToDelete(project);
  };

  const confirmDelete = async (id) => {
    setIsDeleting(true);
    try {
      await videoService.deleteProject(id);
      fetchProjects();
      setVideoToDelete(null);
    } catch (err) {
      console.error("Failed to delete project", err);
      alert("Failed to delete video. Please check your connection.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (project) => {
    if (project.status !== 'COMPLETED' || !project.video_url) {
      alert("This video is still processing. You can only download it once rendering is completed!");
      return;
    }
    setVideoToDownload(project);
  };

  const confirmDownload = async (project) => {
    setIsDownloading(true);
    try {
      const response = await fetch(project.video_url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/\s+/g, '_') || 'video'}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setVideoToDownload(null);
    } catch (err) {
      console.error("Failed to download via blob, falling back to direct link", err);
      // Fallback: direct download link
      const a = document.createElement('a');
      a.href = project.video_url;
      a.target = '_blank';
      a.download = `${project.title.replace(/\s+/g, '_') || 'video'}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setVideoToDownload(null);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareLink = async (project) => {
    if (project.status !== 'COMPLETED' || !project.video_url) {
      alert("This video is still processing. You can only share it once rendering is completed!");
      return;
    }
    
    const shareUrl = project.video_url.startsWith('http') 
      ? project.video_url 
      : window.location.origin + project.video_url;
      
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch (err) {
      console.error("Failed to copy share link:", err);
      alert(`Here is your share link:\n\n${shareUrl}`);
    }
  };

  const filters = ['All', 'Completed', 'Processing', 'Drafts'];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'Drafts') return project.status === 'PENDING';
    if (activeFilter === 'Completed') return project.status === 'COMPLETED';
    if (activeFilter === 'Processing') return ['PARSING', 'RENDERING'].includes(project.status);
    return true;
  });

  return (
    <div className="space-y-10 animate-fade-in pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
            Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Library</span>
          </h1>
          <p className="text-lg text-slate-400 font-medium">Manage and organize your cinematic productions.</p>
        </div>
        
        <div className="relative w-full md:w-80 group z-10">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121620]/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all shadow-inner hover:border-white/20"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {filters.map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all border ${
              filter === activeFilter 
              ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && projects.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-white/5 rounded-[2.5rem] animate-pulse border border-white/5" />
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onEdit={onEdit} 
              onPlay={setSelectedVideo}
              onDelete={triggerDelete}
              onDownload={handleDownload}
              onShare={handleShareLink}
            />
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-[#121620]/40 backdrop-blur-sm border border-dashed border-white/10 rounded-[2.5rem]">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Video size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">
              {searchQuery ? `No projects match "${searchQuery}". Try a different term.` : "You don't have any projects in this category yet."}
            </p>
          </div>
        )}
      </div>

      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      
      <DeleteConfirmationModal 
        video={videoToDelete} 
        isDeleting={isDeleting}
        onConfirm={confirmDelete} 
        onCancel={() => setVideoToDelete(null)} 
      />

      <DownloadConfirmationModal 
        video={videoToDownload}
        isDownloading={isDownloading}
        onConfirm={confirmDownload}
        onCancel={() => setVideoToDownload(null)}
      />

      {showShareToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-cyan-400 font-bold bg-[#121620]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-cyan-500/30 animate-slide-up shadow-2xl shadow-cyan-500/10">
          <CheckCircle size={20} className="text-cyan-400 animate-bounce" />
          <div className="flex flex-col text-left">
            <span className="text-sm text-white">Share link copied!</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Ready to share with friends</span>
          </div>
        </div>
      )}
    </div>
  );
}
