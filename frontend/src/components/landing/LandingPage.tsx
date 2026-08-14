import React from 'react';
import { 
  Activity, 
  Stethoscope, 
  Sparkles, 
  Layers, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Cpu,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onStart: (type: 'skin' | 'hair') => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onExploreDemo }) => {
  const { loginDemo } = useAuth();

  return (
    <div className="space-y-24">
      
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-16 text-center max-w-4xl mx-auto px-4 space-y-6">
        
        <div className="inline-flex items-center space-x-2 bg-sky-50 border border-sky-200 px-4 py-1.5 rounded-full text-xs font-bold text-sky-800 shadow-sm animate-bounce">
          <GraduationCap className="w-4 h-4 text-sky-600" />
          <span>Final Year Project — Hamdard University Karachi</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] font-sans">
          Intelligent AI Skin & Hair <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-sky-600 via-sky-700 to-teal-600 bg-clip-text text-transparent">
            Health Assessment Platform
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Combining deep convolutional neural networks with <strong>Grad-CAM Explainable AI</strong> to deliver transparent skin lesion screening, trichological hair density telemetry, and longitudinal health tracking.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onStart('skin')}
            className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-sky-600/25 hover:scale-105 transition-all flex items-center justify-center space-x-2"
          >
            <Stethoscope className="w-5 h-5" />
            <span>Screen Skin Lesion</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => onStart('hair')}
            className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-teal-600/25 hover:scale-105 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Analyze Scalp & Hair</span>
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-sm font-bold border border-slate-300 transition-all"
          >
            Launch Live Demo
          </button>
        </div>

        {/* Confidence & Disclaimer Tag */}
        <p className="text-xs text-slate-400 font-medium">
          Preliminary screening aid • 100% Client-side anonymization • Calibrated on HAM10000 & ISIC benchmark datasets
        </p>
      </section>

      {/* 4 Pillars Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600">Core Architecture</h2>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Why Dermalytics Sets A New Standard</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-sky-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Dual-Domain Diagnosis</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unified assessment pipeline supporting 7-class dermoscopic classification and trichological hair loss staging in one platform.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-sky-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Grad-CAM Explainability</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Eliminates the "black-box" dilemma with interactive spatial saliency heatmaps highlighting exact regions driving model predictions.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-sky-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Longitudinal History</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Structured scan-to-scan comparisons and density trajectory monitoring to objectively measure treatment response over months.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-sky-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Clinical Safety Triage</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rigorous safety thresholds: predictions below 80% confidence or high-risk lesions automatically prompt a physician consultation directive.
            </p>
          </div>

        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="bg-slate-900 text-white rounded-3xl max-w-6xl mx-auto p-10 sm:p-14 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">Streamlined Workflow</span>
            <h3 className="text-2xl sm:text-3xl font-black">How Dermalytics Operates</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-sm mx-auto sm:mx-0">
                1
              </div>
              <h4 className="text-base font-bold text-white">Capture / Upload Photo</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take a close-up photo of a skin spot or scalp area using your phone or choose from verified benchmark presets.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black text-sm mx-auto sm:mx-0">
                2
              </div>
              <h4 className="text-base font-bold text-white">Neural Inference & Saliency</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deep CNN models classify the condition and generate Grad-CAM heatmaps to visually explain the diagnostic rationale.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-sm mx-auto sm:mx-0">
                3
              </div>
              <h4 className="text-base font-bold text-white">Track & Export Clinical Sheet</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review your risk score, compare changes over time on the timeline, and generate a printable PDF for your dermatologist.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
