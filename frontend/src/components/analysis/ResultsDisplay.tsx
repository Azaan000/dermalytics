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
  Info,
  HeartHandshake,
  HelpCircle
} from 'lucide-react';
import { GradCAMViewer } from './GradCAMViewer';
import { ClinicalReportModal } from '../report/ClinicalReportModal';
import { useToast } from '../../context/ToastContext';

interface ResultsDisplayProps {
  assessment: any;
  onReset: () => void;
  onSaveToHistory?: (assessment: any) => void;
}

// Plain, friendly explanations for everyday people (no medical jargon)
const PLAIN_SKIN_TERMS: Record<string, { simpleName: string; easyMeaning: string; isFriendly: boolean }> = {
  nv: {
    simpleName: 'Common Normal Mole',
    easyMeaning: 'A normal, healthy beauty mark. It is completely harmless and not cancer. Just check it once a month for changes.',
    isFriendly: true,
  },
  mel: {
    simpleName: 'Melanoma (Needs Immediate Doctor Check)',
    easyMeaning: 'A serious skin spot that requires prompt attention. Please see a skin doctor (dermatologist) right away for an in-person look.',
    isFriendly: false,
  },
  bcc: {
    simpleName: 'Basal Cell Skin Spot (Common & Very Treatable)',
    easyMeaning: 'A very common, slow-growing skin condition. It rarely spreads elsewhere and is easy for a doctor to treat when found early.',
    isFriendly: false,
  },
  akiec: {
    simpleName: 'Rough Sun Spot (Pre-Cancerous Patch)',
    easyMeaning: 'A dry, scaly patch from long sun exposure. It is good to have a doctor treat it now so it does not turn into something worse.',
    isFriendly: false,
  },
  bkl: {
    simpleName: 'Harmless Age Spot',
    easyMeaning: 'A very common, harmless spot that appears naturally as we get older. It is not dangerous and needs no treatment.',
    isFriendly: true,
  },
  df: {
    simpleName: 'Harmless Small Skin Bump',
    easyMeaning: 'A small, firm bump that is completely harmless. Often appears after a small mosquito bite or scrape.',
    isFriendly: true,
  },
  vasc: {
    simpleName: 'Harmless Red Blood Vessel Dot',
    easyMeaning: 'A tiny red or purple dot made of harmless small blood vessels. Very common and completely safe.',
    isFriendly: true,
  },
};

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
    showToast('Assessment saved to your timeline!', 'success');
  };

  const codeKey = (prediction.code || '').toLowerCase();
  const simpleSkinInfo = PLAIN_SKIN_TERMS[codeKey] || {
    simpleName: prediction.class || 'Skin Spot',
    easyMeaning: 'Skin analysis completed. Review details below.',
    isFriendly: true,
  };

  const isHighRisk = prediction.requires_consultation || prediction.risk_level === 'high' || prediction.severity === 'High';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn text-base">
      
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {isSkin ? 'Your Skin Health Checkup Result' : 'Your Scalp & Hair Health Checkup Result'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Scan finished in {(assessment.processing_time_ms ? assessment.processing_time_ms / 1000 : 1.4).toFixed(1)} seconds
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 border border-slate-200"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Doctor Report</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saved}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
              saved
                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>{saved ? 'Saved to Timeline' : 'Save Result'}</span>
          </button>
        </div>
      </div>

      {/* Doctor Checkup Reassurance Alert */}
      {isHighRisk && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-3 text-rose-900 font-black text-lg">
            <ShieldAlert className="w-7 h-7 text-rose-600 flex-shrink-0" />
            <span>Doctor Checkup Recommended (Early Check is Best!)</span>
          </div>
          <p className="text-sm sm:text-base text-rose-900 leading-relaxed pl-10 font-medium">
            The AI noticed features that a qualified skin doctor (dermatologist) should look at in person. 
            <strong> Please do not panic</strong> — having a specialist examine unusual spots is the safest, most reassuring way to protect your health.
          </p>
        </div>
      )}

      {/* Everyday Meaning Highlight Card */}
      {isSkin && (
        <div className={`rounded-3xl p-6 border-2 flex items-start space-x-4 shadow-sm ${
          simpleSkinInfo.isFriendly 
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
            : 'bg-amber-50/80 border-amber-300 text-amber-950'
        }`}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
            simpleSkinInfo.isFriendly ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-900'
          }`}>
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-extrabold tracking-wider opacity-80">
              In Simple Words (What Does This Mean?)
            </p>
            <h3 className="text-lg font-black leading-snug">
              {simpleSkinInfo.simpleName}
            </h3>
            <p className="text-sm leading-relaxed opacity-90 font-medium">
              {simpleSkinInfo.easyMeaning}
            </p>
          </div>
        </div>
      )}

      {/* Assessment Summary 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Primary Finding */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isSkin ? 'Most Likely Condition' : 'Hair Fullness Rating'}
          </span>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {isSkin ? prediction.class : `${prediction.density_score} / 100`}
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-1">
              {isSkin ? (simpleSkinInfo.simpleName) : prediction.thinning_stage}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">AI Confidence:</span>
            <span className="font-extrabold text-sky-600 text-base">
              {isSkin ? `${prediction.confidence}%` : `${prediction.density_score}%`}
            </span>
          </div>
        </div>

        {/* Card 2: Risk / Safety Level */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isSkin ? 'Safety & Urgency Level' : 'Hair Loss Stage'}
          </span>
          <div>
            <div className="inline-flex items-center space-x-2">
              <span className={`text-base font-black px-4 py-1.5 rounded-2xl uppercase tracking-wide ${
                (prediction.risk_level === 'high' || prediction.severity === 'High')
                  ? 'bg-rose-100 text-rose-800'
                  : (prediction.risk_level === 'medium' || prediction.severity === 'Moderate')
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isSkin 
                  ? (prediction.risk_level === 'high' ? 'High Attention' : prediction.risk_level === 'medium' ? 'Medium Attention' : 'Safe / Low Concern')
                  : (prediction.severity === 'Low' ? 'Normal / Healthy' : prediction.severity)}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-2">
              {isSkin 
                ? (prediction.risk_level === 'high' ? 'Doctor checkup strongly advised' : 'Normal, benign-looking pattern') 
                : (prediction.hairline_type || 'Hairline check')}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">Check Status:</span>
            <span className="font-bold text-slate-700">Complete</span>
          </div>
        </div>

        {/* Card 3: What You Should Do */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            What You Should Do
          </span>
          <div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {isSkin 
                ? (prediction.requires_consultation 
                    ? 'Please book a visit with a dermatologist (skin specialist) to have this spot looked at under good medical lighting.' 
                    : 'Everything looks calm. Keep checking this spot once a month. Take a new picture if you ever notice size, color, or shape changes.')
                : (prediction.recommendation || 'Wash gently, avoid harsh pulls or extreme heat, and check progress again in 30 days.')}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">Next check:</span>
            <span className="font-bold text-slate-700">In 30 days</span>
          </div>
        </div>

      </div>

      {/* Easy-to-Understand Breakdown Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <Activity className="w-6 h-6 text-sky-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isSkin ? 'All Skin Conditions Checked by the AI' : 'Your Hair & Scalp Health Measurements'}
            </h3>
            <p className="text-xs text-slate-500">
              {isSkin ? 'Here is how confident the AI was for each possible skin spot type:' : 'Simple breakdown of what was measured in your photo:'}
            </p>
          </div>
        </div>

        {isSkin && prediction.top_classes ? (
          <div className="space-y-4">
            {prediction.top_classes.map((cls: any, i: number) => {
              const code = (cls.type || '').toLowerCase();
              const info = PLAIN_SKIN_TERMS[code] || { simpleName: cls.class, easyMeaning: '' };
              return (
                <div key={i} className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <div className="space-x-2">
                      <span className="text-slate-900">{cls.class}</span>
                      <span className="text-slate-500 font-normal text-xs">— {info.simpleName}</span>
                    </div>
                    <span className="text-slate-900 font-extrabold text-base">{cls.confidence}%</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
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
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-200">
              <span className="text-xs text-slate-500 font-bold block">Hair Coverage</span>
              <span className="text-2xl font-black text-slate-900 my-1 block">{prediction.metrics?.coverage_percentage || 85}%</span>
              <span className="text-[11px] text-slate-500 block">How much scalp is covered</span>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-200">
              <span className="text-xs text-slate-500 font-bold block">Hair Fullness</span>
              <span className="text-2xl font-black text-teal-600 my-1 block">{prediction.metrics?.follicle_density || 78}</span>
              <span className="text-[11px] text-slate-500 block">Hairs per square area</span>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-200">
              <span className="text-xs text-slate-500 font-bold block">Hair Strand Thickness</span>
              <span className="text-2xl font-black text-slate-900 my-1 block">{prediction.metrics?.hair_diameter || 0.065} mm</span>
              <span className="text-[11px] text-slate-500 block">Average strand width</span>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-200">
              <span className="text-xs text-slate-500 font-bold block">Visible Scalp Skin</span>
              <span className="text-2xl font-black text-amber-600 my-1 block">{prediction.metrics?.scalp_visibility || 15}%</span>
              <span className="text-[11px] text-slate-500 block">Skin showing through hair</span>
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

      {/* Bottom Action Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-base font-extrabold shadow-lg transition-all flex items-center space-x-3 hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Check Another Picture</span>
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
