import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, ArrowLeft, RotateCcw } from 'lucide-react';

export default function VideoModal({ video, onClose }) {
  const [isEnded, setIsEnded] = React.useState(false);
  
  if (!video) return null;

  const handleReplay = () => {
    setIsEnded(false);
    const videoElem = document.getElementById('modal-video-player');
    if (videoElem) {
      videoElem.currentTime = 0;
      videoElem.play();
    }
  };



  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        ></motion.div>

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 flex justify-between items-center bg-slate-900 border-b border-white/5 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all text-slate-300 border border-white/5"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white truncate max-w-[200px] sm:max-w-md">{video.title}</h2>
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-semibold">{video.mode} • {video.duration}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>


          {/* Video Player */}
          <div className="aspect-video bg-black flex items-center justify-center relative">
            <video 
              id="modal-video-player"
              src={video.video_url} 
              controls 
              autoPlay 
              onEnded={() => setIsEnded(true)}
              onPlay={() => setIsEnded(false)}
              className="w-full h-full object-contain"
            ></video>

            {/* End Overlay */}
            <AnimatePresence>
              {isEnded && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-20"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Video Completed!</h3>
                    <p className="text-slate-400">What would you like to do next?</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleReplay}
                      className="flex items-center gap-2 px-8 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:scale-105 transition-transform"
                    >
                      <RotateCcw size={20} /> Replay
                    </button>
                    <button 
                      onClick={onClose}
                      className="flex items-center gap-2 px-8 py-3 bg-brand text-white rounded-2xl font-bold hover:scale-105 transition-transform"
                    >
                      <X size={20} /> Close Video
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          {/* Footer / Actions */}
          <div className="p-6 bg-slate-900/50 flex justify-between items-center">
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all text-slate-300 border border-white/5"
              >
                <ArrowLeft size={18} /> Back to Library
              </button>
              <button className="flex items-center gap-2 px-6 py-2 bg-brand hover:bg-brand-dark rounded-xl text-sm font-bold transition-all text-white shadow-lg shadow-brand/20">
                <Download size={18} /> Download
              </button>
              <button className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all text-slate-300 border border-white/5">
                <Share2 size={18} /> Share Link
              </button>
            </div>
            
            <div className="text-xs text-slate-500 italic">

              Rendered on {new Date(video.created_at).toLocaleDateString()}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
