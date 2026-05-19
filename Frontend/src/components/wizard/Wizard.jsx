import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Step1Mode from './Step1Mode';
import Step2Script from './Step2Script';
import Step3Customization from './Step3Customization';
import StepSlideSync from './StepSlideSync';
import Step4Review from './Step4Review';
import { videoService } from '../../services/videoService';

const steps = [
  { id: 1, title: 'Script & Notes' },
  { id: 2, title: 'Generation Mode' },
  { id: 3, title: 'Cinematic Style' },
  { id: 4, title: 'Timeline Sync' },
  { id: 5, title: 'Final Review' }
];

export default function Wizard({ project, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const [formData, setFormData] = useState({
    mode: project ? project.mode.toLowerCase().replace('_', '-') : 'no-face',
    script: project ? project.script : '',
    voice: project ? project.voice : 'alloy',
    avatar: project ? project.avatar || 'daniel' : 'daniel',
    slides: []
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => {
    if (currentStep === 1) {
      if (onCancel) onCancel();
      return;
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const startRenderFromWizard = async () => {
    setIsRendering(true);
    try {
      let finalSlides = formData.slides;
      if (!finalSlides || finalSlides.length === 0) {
        const rawScenes = formData.script.split('\n\n').filter(s => s.trim()).map((text, idx) => {
          const clean = text.replace(/^(title|description|short description|summary|section\s+\d+|slide\s+\d+):/i, '').trim();
          const words = clean.toLowerCase().match(/\b[a-z]{4,15}\b/g) || [];
          const queryTags = words.slice(0, 2).join(',') || 'education';
          return {
            id: idx + 1,
            text: text.trim(),
            duration: Math.max(5, Math.floor(text.length / 15)),
            style: 'Cinematic',
            visualPrompt: `An educational slide about ${clean.substring(0, 50)}`,
            imageUrl: `https://loremflickr.com/1920/1080/${queryTags}?lock=${idx + 1}`,
            type: idx % 2 === 0 ? 'IMAGE' : 'DRAWING'
          };
        });
        
        let current_time = 0;
        finalSlides = rawScenes.map(scene => {
          const updated = { ...scene, startTime: current_time };
          current_time += scene.duration;
          return updated;
        });
      }

      const payload = {
        title: project ? project.title : `Project ${new Date().toLocaleTimeString()}`,
        script: formData.script,
        mode: formData.mode === 'avatar' ? 'AVATAR' : 'NO_FACE',
        engine: formData.engine || 'COMMUNITY',
        voice: formData.voice,
        avatar: formData.avatar,
        slides: finalSlides,
        is_mock: false
      };

      if (project) {
        try {
          await videoService.updateProject(project.id, payload);
        } catch (e) {
          if (e.response && e.response.status === 404) {
            await videoService.createProject(payload);
          } else {
            throw e;
          }
        }
      } else {
        await videoService.createProject(payload);
      }
      
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Failed to start render from wizard", error);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      {/* Header Container with Float-Right Generate Video Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/5">
        {/* Left Side: Back Button & Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={prevStep} 
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all border border-white/5 cursor-pointer"
          >
            <ChevronLeft size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">{currentStep === 1 ? 'Exit' : 'Back'}</span>
          </button>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Project Workspace</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Draft Mode • Phase {currentStep} of 5</p>
          </div>
        </div>

        {/* Right Side: Generate Video From Any Step */}
        <button
          onClick={startRenderFromWizard}
          disabled={isRendering || !formData.script}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-purple-500/10 cursor-pointer ${
            !formData.script 
            ? 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white hover:scale-[1.02] active:scale-95'
          }`}
        >
          {isRendering ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>⚡ Generate Video</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Stepper */}
      <div className="max-w-4xl mx-auto py-10">
        <div className="flex items-center justify-between relative px-4">
          <div className="absolute top-5 left-0 right-0 h-px bg-white/5 -z-10"></div>
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-4 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= step.id 
                ? 'bg-[#c084fc] text-white shadow-lg shadow-purple-500/20' 
                : 'bg-[#1c1f2e] text-slate-500 border border-white/5'
              }`}>
                {step.id}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider hidden md:block ${
                currentStep >= step.id ? 'text-white' : 'text-slate-500'
              }`}>
                {step.title}
              </span>
              {idx < steps.length - 1 && (
                <div className={`h-px w-12 hidden lg:block ${currentStep > step.id ? 'bg-[#c084fc]' : 'bg-white/5'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-10 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1600px] mx-auto"
          >
            {currentStep === 1 && <Step2Script data={formData} update={updateFormData} onNext={nextStep} onBack={prevStep} />}
            {currentStep === 2 && <Step1Mode data={formData} update={updateFormData} onNext={nextStep} />}
            {currentStep === 3 && <Step3Customization data={formData} update={updateFormData} onNext={nextStep} onBack={prevStep} />}
            {currentStep === 4 && <StepSlideSync data={formData} update={updateFormData} onNext={nextStep} onBack={prevStep} />}
            {currentStep === 5 && <Step4Review data={formData} project={project} onBack={prevStep} onComplete={onComplete} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
