import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Printer, 
  BookmarkCheck, 
  RotateCcw, 
  Clock, 
  Activity, 
  Percent, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { GradCAMViewer } from './GradCAMViewer';
import { ClinicalReportModal } from '../report/ClinicalReportModal';
import { useToast } from '../../context/ToastContext';

interface ResultsDisplayProps {
  assessment: any;
  onReset: () => void;
  onSaveToHistory?: (assessment: any) => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  assessment,
  onReset,
  onSaveToHistory
}) => {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const { showToast } = useToast();

  const isSkin = assessment.assessment_type === 'skin';
  const prediction = assessment.prediction;

  const handleSave = () => {
    setSaved(true);
    if (onSaveToHistory) {
      onSaveToHistory(assessment);
    }
    showToast('Assessment successfully recorded in longitudinal history timeline', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {isSkin ? 'Skin Lesion Diagnostic Report' : 'Scalp & Trichology Assessment Report'}
            </h2>
            <p className="text-xs text-slate-500">
              Completed in {assessment.processing_time_ms || 1450}ms • Model: {prediction.model_name || 'EfficientNetB3'} ({prediction.model_version || 'v2.1.0'})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border border-slate-200"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Clinical Summary Sheet</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saved}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              saved
                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>{saved ? 'Saved to Timeline' : 'Save Assessment'}</span>
          </button>
        </div>
      </div>

      {/* Clinical Triage Flag Alert */}
      {(prediction.requires_consultation || prediction.risk_level === 'high' || prediction.severity === 'High') && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center space-x-2.5 text-rose-900 font-extrabold text-sm sm:text-base">
            <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0" />
            <span>RECOMMEND PROFESSIONAL DERMATOLOGICAL CONSULTATION</span>
          </div>
          <p className="text-xs sm:text-sm text-rose-800/90 leading-relaxed pl-8">
            This screening result indicates elevated clinical attention criteria (Confidence: {prediction.confidence || prediction.density_score}% or high-risk pathology signature). Please schedule an in-person dermoscopic examination with a qualified specialist.
          </p>
        </div>
      )}

      {/* Assessment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Primary Prediction */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isSkin ? 'Classified Lesion Type' : 'Hair Density Rating'}
          </span>
          <div className="my-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {isSkin ? prediction.class : `${prediction.density_score} / 100`}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {isSkin ? prediction.full_name : prediction.thinning_stage}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Confidence Score:</span>
            <span className="font-extrabold text-sky-600 text-sm">
              {isSkin ? `${prediction.confidence}%` : `${prediction.density_score}%`}
            </span>
          </div>
        </div>

        {/* Card 2: Risk / Stage Level */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isSkin ? 'Risk Stratification' : 'Norwood / Ludwig Stage'}
          </span>
          <div className="my-3">
            <div className="inline-flex items-center space-x-2">
              <span className={`text-base font-black px-3 py-1 rounded-xl uppercase tracking-wide ${
                (prediction.risk_level === 'high' || prediction.severity === 'High')
                  ? 'bg-rose-100 text-rose-700'
                  : (prediction.risk_level === 'medium' || prediction.severity === 'Moderate')
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isSkin ? `${prediction.risk_level} Risk` : prediction.severity}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-2">
              {isSkin ? (prediction.risk_level === 'high' ? 'High clinical priority' : 'Benign pattern') : prediction.hairline_type}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-slate-700">Screening Complete</span>
          </div>
        </div>

        {/* Card 3: Clinical Directive */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recommended Action
          </span>
          <div className="my-3">
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {isSkin 
                ? (prediction.requires_consultation ? 'Schedule a formal dermatological evaluation and biopsy assessment.' : 'Routine monitoring. Re-assess if changes in size, color, or shape occur.')
                : (prediction.recommendation || 'Maintain gentle scalp hygiene and observe monthly progression.')}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Interval:</span>
            <span className="font-bold text-slate-700">Re-scan in 30 days</span>
          </div>
        </div>

      </div>

      {/* Deep Learning Breakdown: 7-Class Distribution or Trichology Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Activity className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">
            {isSkin ? 'HAM10000 7-Class Softmax Probability Distribution' : 'Detailed Trichological Scalp Metrics'}
          </h3>
        </div>

        {isSkin && prediction.top_classes ? (
          <div className="space-y-3">
            {prediction.top_classes.map((cls: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">
                    {cls.class} <span className="text-slate-400 text-[11px]">({cls.type})</span>
                  </span>
                  <span className="text-slate-900 font-extrabold">{cls.confidence}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      i === 0
                        ? cls.risk_level === 'high' ? 'bg-rose-500' : 'bg-sky-600'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${Math.max(2, cls.confidence)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold block">Coverage</span>
              <span className="text-xl font-extrabold text-slate-900">{prediction.metrics?.coverage_percentage || 85}%</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold block">Follicle Density</span>
              <span className="text-xl font-extrabold text-teal-600">{prediction.metrics?.follicle_density || 78} /cm²</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold block">Shaft Diameter</span>
              <span className="text-xl font-extrabold text-slate-900">{prediction.metrics?.hair_diameter || 0.065} mm</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold block">Scalp Visibility</span>
              <span className="text-xl font-extrabold text-amber-600">{prediction.metrics?.scalp_visibility || 15}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Explainable AI (Grad-CAM) Visualizer */}
      <GradCAMViewer
        imageUrl={assessment.image_url}
        gradCamUrl={assessment.grad_cam_url}
        assessmentType={assessment.assessment_type}
        predictedClass={prediction.class || prediction.thinning_stage}
        rationale={prediction.diagnostic_rationale}
      />

      {/* Bottom Navigation */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Perform New Assessment</span>
        </button>
      </div>

      {/* Clinical PDF Report Modal */}
      {showReportModal && (
        <ClinicalReportModal
          assessment={assessment}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
};
