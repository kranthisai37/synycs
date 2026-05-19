import React, { useState } from 'react';
import { Sparkles, Loader2, X, PlayCircle } from 'lucide-react';
import { videoService } from '../../services/videoService';
import { API_BASE_URL } from '../../utils/apiConfig';

export default function Step2Script({ data, update, onNext, onBack }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateScript = async () => {
    if (!data.script) return;
    setIsGenerating(true);
    try {
      const response = await videoService.generateScript(data.script, data.directorsNotes);
      if (response.script) {
        update({ 
          script: response.script,
          slides: response.slides || []
        });
      }
    } catch (error) {
      console.error('Error generating script:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">Project Foundation</h2>
        <p className="text-slate-400 font-medium leading-relaxed">
          EduVideo's Cinematic Intelligence engine requires a script or detailed prompt to generate your visuals. Be as descriptive as possible for best results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Input Areas */}
        <div className="lg:col-span-2 space-y-8 bg-[#121620]/80 rounded-[2.5rem] border border-white/5 p-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-indigo-300">Video Script</label>
              <button 
                onClick={handleGenerateScript}
                disabled={!data.script || isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 hover:bg-indigo-500/20 transition-all uppercase tracking-widest disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {isGenerating ? 'Synthesizing Deep Dive...' : 'NotebookLM Style Deep Dive'}
              </button>
            </div>
            <textarea
              value={data.script}
              onChange={(e) => update({ script: e.target.value, slides: [] })}
              placeholder="Enter your notes or script here... Click the button above to enhance them into a conversational educational video!"
              className="w-full h-[500px] bg-[#0a0d14] border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
            ></textarea>
          </div>
        </div>

        {/* Right: Insights & Preview */}
        <div className="space-y-8">
          {/* AI Insights */}
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-2 text-indigo-300 mb-4">
              <Sparkles size={18} />
              <span className="text-sm font-bold">AI Insights</span>
            </div>
            <p className="text-xs text-slate-400 italic leading-relaxed">
              "Descriptive scripts with sensory language (e.g., 'shimmering neon', 'heavy silence') significantly improve visual fidelity."
            </p>
          </div>

          {/* Preview Style */}
          <div 
            onClick={() => setShowPreview(true)}
            className="bg-[#121620] rounded-[2.5rem] border border-white/5 overflow-hidden group cursor-pointer hover:border-indigo-500/30 transition-all"
          >
            <div className="aspect-video relative bg-slate-900 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=450&fit=crop" 
                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" 
                alt="Style Preview"
              />
              <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <PlayCircle size={48} className="absolute text-white/50 group-hover:text-white group-hover:scale-110 transition-all shadow-2xl" />
            </div>
            <div className="p-4 text-center">
              <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Preview EduVideo Style</span>
            </div>
          </div>

          {/* Style Preview Modal Overlay */}
          {showPreview && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a0d14]/90 backdrop-blur-md">
              <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="absolute top-6 right-6 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                >
                  <X size={20} />
                </button>
                <video 
                  autoPlay 
                  controls 
                  className="w-full h-full object-contain"
                  src={`${API_BASE_URL}/media/videos/video_36.mp4`}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute bottom-10 left-10 right-10 p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5">
                  <h4 className="text-white font-bold mb-1">Style Preview: Cinematic Educator</h4>
                  <p className="text-xs text-slate-300">This is a demonstration of the EduVideo circular avatar overlay with dynamic chalkboard background effects.</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Config */}
          <div className="bg-[#121620]/80 rounded-[2.5rem] border border-white/5 p-8 space-y-6">
            <h3 className="text-sm font-bold text-white mb-4">Current Config</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Resolution</span>
                <span className="text-cyan-400 font-bold">4K Ultra HD</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Voice Engine</span>
                <span className="text-white font-bold">Neural-v2</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Est. Processing</span>
                <span className="text-slate-400 font-bold">~4 mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} /> Exit Wizard
        </button>
        <div className="flex gap-4">
          <button 
            onClick={onBack}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
          >
            Back
          </button>
          <button 
            onClick={onNext}
            disabled={!data.script || isGenerating}
            className="px-8 py-3 bg-gradient-to-r from-indigo-400 to-cyan-400 text-[#0a0d14] rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            {isGenerating ? 'Analyzing...' : 'Continue to Mode Select'}
          </button>
        </div>
      </div>
    </div>
  );
}
