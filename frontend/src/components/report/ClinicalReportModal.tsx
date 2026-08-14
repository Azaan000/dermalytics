import React from 'react';
import { X, Printer, ShieldAlert, Award, FileText, CheckCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface ClinicalReportModalProps {
  assessment: any;
  onClose: () => void;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({ assessment, onClose }) => {
  const { user } = useAuth();
  const isSkin = assessment.assessment_type === 'skin';
  const prediction = assessment.prediction;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Toolbar (hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span className="text-sm font-bold">Clinical Consultation Summary Sheet</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 space-y-6 overflow-y-auto print:p-0 print:overflow-visible text-slate-900 font-sans">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                Dermalytics Clinical Telemetry
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                AI-Driven Dermatological & Trichological Preliminary Assessment
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Report ID: {assessment.assessment_id || assessment.id} • Generated: {formatDate(assessment.created_at || new Date().toISOString())}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                Screening Summary
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Hamdard University FYP</p>
            </div>
          </div>

          {/* Patient Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Patient Name</span>
              <span className="font-bold text-slate-800">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Ayesha Khan (Demo)'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Assessment Domain</span>
              <span className="font-bold text-slate-800">{isSkin ? 'Skin Lesion (HAM10000)' : 'Scalp Trichoscopy'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">AI Model Architecture</span>
              <span className="font-bold text-slate-800">{prediction.model_name || 'EfficientNetB3'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Risk Tier</span>
              <span className={`font-extrabold uppercase ${prediction.risk_level === 'high' ? 'text-rose-600' : 'text-emerald-700'}`}>
                {prediction.risk_level || 'Low'}
              </span>
            </div>
          </div>

          {/* Images Section: Original vs Grad-CAM */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Photographic & Explainable AI (Grad-CAM) Visual Evidence
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden text-center p-2 bg-slate-50">
                <img
                  src={assessment.image_url}
                  alt="Original"
                  className="w-full h-44 object-cover rounded-lg mx-auto"
                />
                <span className="text-[11px] font-bold text-slate-600 mt-1 block">
                  Original Clinical Scan
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-center p-2 bg-slate-50">
                <img
                  src={assessment.grad_cam_url || assessment.image_url}
                  alt="Grad-CAM"
                  className="w-full h-44 object-cover rounded-lg mx-auto"
                />
                <span className="text-[11px] font-bold text-sky-700 mt-1 block">
                  Grad-CAM Visual Activation Overlay
                </span>
              </div>
            </div>
          </div>

          {/* Findings & Probabilities */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Quantitative Diagnostic Metrics
            </h3>
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-sm">
                  Primary Classification: {isSkin ? prediction.class : prediction.thinning_stage}
                </span>
                <span className="text-sm font-extrabold text-sky-700">
                  Confidence: {prediction.confidence || prediction.density_score}%
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Diagnostic Rationale:</strong> {prediction.diagnostic_rationale || 'Morphological and spatial feature analysis shows patterns aligned with model baseline.'}
              </p>
            </div>
          </div>

          {/* Clinical Doctor Notes Section */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 space-y-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Physician / Dermatologist Clinical Review Notes & Action Plan:
            </span>
            <div className="flex justify-between pt-6 border-t border-slate-200 text-xs text-slate-500">
              <span>Physician Signature: _______________________</span>
              <span>Date: ____ / ____ / 2026</span>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-2 text-[10px] text-slate-400 leading-normal border-t border-slate-100">
            <strong>NOTICE:</strong> This document represents an automated algorithmic assessment generated by the Dermalytics software platform. It is not an official medical diagnosis. Any high-risk indications should be evaluated in person by a certified clinician.
          </div>

        </div>

      </div>
    </div>
  );
};
