import React from 'react';
import { ShieldAlert, HeartHandshake, GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Project Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold">
                D
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Dermalytics</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              AI-Driven Skin and Hair Health Assessment Platform integrating deep convolutional neural networks with Grad-CAM explainable visual heatmaps and longitudinal progress telemetry.
            </p>
            <div className="flex items-center space-x-2 text-xs text-sky-400 font-medium pt-1">
              <GraduationCap className="w-4 h-4" />
              <span>Hamdard University, Karachi — Department of Computer Science</span>
            </div>
          </div>

          {/* Col 2: Research & Team */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Project Team</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="font-semibold text-slate-300">Syed Azan Ahmed (3119-2023)</li>
              <li className="font-semibold text-slate-300">Asma Ghani (3226-2023)</li>
              <li className="font-semibold text-slate-300">Hania Saeed (2235-2023)</li>
              <li className="pt-2 text-sky-400 font-medium">Supervisor: Khurram Iqbal</li>
            </ul>
          </div>

          {/* Col 3: Core Technology */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Architecture</h4>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• HAM10000 7-Class Classifier</li>
              <li>• MobileNetV3 Trichology Model</li>
              <li>• Grad-CAM Spatial Explainability</li>
              <li>• FastAPI & PyTorch Microservices</li>
              <li>• React.js Responsive Web Engine</li>
            </ul>
          </div>
        </div>

        {/* Clinical Disclaimer Banner */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-amber-300/90 bg-amber-950/40 border border-amber-800/50 px-3 py-2 rounded-xl">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              <strong>Medical Disclaimer:</strong> Dermalytics provides supplementary preliminary screening and educational insights. It does not provide medical diagnoses or prescriptions. Always consult a licensed board-certified dermatologist for clinical concerns.
            </span>
          </div>
          <p className="text-[11px] text-slate-500 whitespace-nowrap">
            © 2026 Dermalytics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
