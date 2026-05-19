import React from 'react';
import { User, Monitor, CheckCircle2 } from 'lucide-react';

export default function Step1Mode({ data, update, onNext }) {
  const modes = [
    {
      id: 'no-face',
      title: 'No-Face Mode',
      description: 'Focus on your content with slides and AI narration. Perfect for quick lectures.',
      icon: <Monitor size={36} className="text-indigo-400" />,
      gradient: 'from-indigo-500/20 to-purple-500/20',
      activeBorder: 'border-indigo-500',
      glowColor: 'rgba(99, 102, 241, 0.15)',
    },
    {
      id: 'avatar',
      title: 'Avatar Mode',
      description: 'A customizable digital human delivers your content. More engaging for presentations.',
      icon: <User size={36} className="text-cyan-400" />,
      gradient: 'from-cyan-500/20 to-teal-500/20',
      activeBorder: 'border-cyan-400',
      glowColor: 'rgba(34, 211, 238, 0.15)',
    }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Title Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-300">Cinematic Video Creation</span>
        </div>
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
          Choose your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Creation Mode</span>
        </h2>
        <p className="text-sm font-medium text-slate-400">Select how you want your educational content to be delivered.</p>
      </div>

      {/* Grid Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {modes.map(mode => {
          const isSelected = data.mode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => update({ mode: mode.id })}
              className={`relative group p-10 rounded-[2.5rem] border-2 transition-all duration-500 text-left flex flex-col gap-6 overflow-hidden hover:-translate-y-1.5 hover:scale-[1.01] cursor-pointer ${
                isSelected 
                ? `${mode.activeBorder} bg-[#121620]/90 shadow-2xl` 
                : 'border-white/5 bg-[#121620]/50 hover:border-white/15'
              }`}
              style={{
                boxShadow: isSelected ? `0 0 40px ${mode.glowColor}` : 'none'
              }}
            >
              {/* Backlight Glow */}
              <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-[50px] opacity-10 group-hover:opacity-25 transition-opacity duration-500 bg-gradient-to-br ${mode.gradient}`} />
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-6 right-6 text-white bg-indigo-500/20 border border-indigo-500/30 p-1.5 rounded-full backdrop-blur-md shadow-md animate-pulse">
                  <CheckCircle2 size={18} className="text-cyan-400 fill-cyan-400/20" />
                </div>
              )}
              
              {/* Icon Frame */}
              <div className={`p-5 rounded-2xl border transition-all duration-300 w-fit ${
                isSelected 
                ? 'bg-white/5 border-white/10 scale-105 shadow-lg' 
                : 'bg-white/[0.02] border-white/5 group-hover:scale-110 group-hover:border-white/10'
              }`}>
                {mode.icon}
              </div>
              
              {/* Title & Description */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 transition-all">
                  {mode.title}
                </h3>
                <p className="text-sm font-medium text-slate-400 leading-relaxed transition-colors group-hover:text-slate-300">
                  {mode.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={onNext}
          className="px-12 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-[#0a0d14] rounded-2xl font-bold shadow-[0_0_35px_rgba(99,102,241,0.25)] hover:shadow-[0_0_45px_rgba(34,211,238,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          Continue to Script
        </button>
      </div>
    </div>
  );
}
