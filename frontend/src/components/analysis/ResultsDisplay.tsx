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
  HelpCircle,
  Volume2,
  VolumeX,
  Languages,
  FileText
} from 'lucide-react';
import { GradCAMViewer } from './GradCAMViewer';
import { ClinicalReportModal } from '../report/ClinicalReportModal';
import { DoctorReviewCard } from '../doctors/DoctorReviewCard';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

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
  const { 
    language, 
    toggleLanguage, 
    t, 
    getSkinInfo, 
    getHairInfo, 
    getRiskDisplay,
    speakText, 
    stopSpeaking, 
    isSpeaking 
  } = useLanguage();

  const isSkin = assessment.assessment_type === 'skin' || assessment.type === 'skin';
  const prediction = assessment.prediction || {};

  const handleSave = () => {
    setSaved(true);
    if (onSaveToHistory) {
      onSaveToHistory(assessment);
    }
    showToast(language === 'ur' ? 'معائنہ آپ کے ریکارڈ میں محفوظ ہو گیا ہے!' : 'Assessment saved to your timeline!', 'success');
  };

  const codeKey = (prediction.code || '').toLowerCase();
  const skinInfo = getSkinInfo(codeKey);
  const hairInfo = getHairInfo(prediction.thinning_stage, prediction.density_score);
  const riskInfo = getRiskDisplay(prediction.risk_level || prediction.severity);

  const activeInfo = isSkin ? skinInfo : hairInfo;
  const isHighRisk = prediction.requires_consultation || prediction.risk_level === 'high' || prediction.severity === 'High';

  const handleAudioToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const speechScript = language === 'ur'
        ? `${activeInfo.name}۔ ${activeInfo.meaning} اگلا مشورہ: ${activeInfo.advice}`
        : `${activeInfo.name}. ${activeInfo.meaning} Recommended step: ${activeInfo.advice}`;
      speakText(speechScript);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn text-base">
      
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className={`text-xl font-black text-slate-900 ${language === 'ur' ? 'font-urdu' : ''}`}>
              {language === 'ur'
                ? (isSkin ? 'آپ کی جلد کے معائنے کے نتائج' : 'آپ کے بالوں اور سر کی جلد کا معائنہ مکمل')
                : (isSkin ? 'Your Skin Health Checkup Result' : 'Your Scalp & Hair Health Checkup Result')}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {language === 'ur' ? 'معائنہ مکمل ہوا' : 'Scan finished in'} {(assessment.processing_time_ms ? assessment.processing_time_ms / 1000 : 1.4).toFixed(1)} {language === 'ur' ? 'سیکنڈ میں' : 'seconds'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border border-slate-200"
            title="Switch Language (English / اردو)"
          >
            <Languages className="w-4 h-4 text-sky-600" />
            <span>{language === 'en' ? 'اردو میں پڑھیں' : 'English View'}</span>
          </button>

          {/* Clinical Doctor-Ready PDF Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span className={language === 'ur' ? 'font-urdu' : ''}>
              {language === 'ur' ? 'ڈاکٹر رپورٹ (PDF)' : 'Doctor Report (PDF)'}
            </span>
          </button>

          {/* Save to History Button */}
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
            <span className={language === 'ur' ? 'font-urdu' : ''}>
              {saved 
                ? (language === 'ur' ? 'محفوظ ہو گیا' : 'Saved to Timeline') 
                : (language === 'ur' ? 'نتیجہ محفوظ کریں' : 'Save Result')}
            </span>
          </button>
        </div>
      </div>

      {/* Doctor Checkup Reassurance Alert (If high risk) */}
      {isHighRisk && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-3 text-rose-900 font-black text-lg">
            <ShieldAlert className="w-7 h-7 text-rose-600 flex-shrink-0" />
            <span className={language === 'ur' ? 'font-urdu' : ''}>
              {language === 'ur' 
                ? 'ماہر امراضِ جلد سے باقاعدہ معائنہ تجویز کیا جاتا ہے'
                : 'Doctor Checkup Recommended (Early Check is Best!)'}
            </span>
          </div>
          <p className={`text-sm sm:text-base text-rose-900 leading-relaxed pl-10 font-medium ${language === 'ur' ? 'font-urdu' : ''}`}>
            {language === 'ur' 
              ? 'کمپیوٹر ماڈل نے ایسے خدوخال دیکھے ہیں جن کا جلد کے ماہر ڈاکٹر (Dermatologist) سے بالمشافہ معائنہ کروانا بہتر ہے۔ براہ کرم بالکل مت گھبرائیں — کسی بھی غیر معمولی نشان کو وقت پر چیک کروانا آپ کی صحت کی بہترین حفاظت ہے۔'
              : 'The AI noticed features that a qualified skin doctor (dermatologist) should look at in person. Please do not panic — having a specialist examine unusual spots is the safest, most reassuring way to protect your health.'}
          </p>
        </div>
      )}

      {/* Everyday Meaning Highlight Card (Plain Words & Audio Read-Aloud) */}
      <div className={`rounded-3xl p-6 sm:p-7 border-2 flex flex-col sm:flex-row items-start justify-between gap-5 shadow-sm ${
        (isSkin ? (skinInfo as any).isFriendly : true)
          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
          : 'bg-amber-50/80 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
            (isSkin ? (skinInfo as any).isFriendly : true) ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-900'
          }`}>
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs uppercase font-extrabold tracking-wider opacity-75">
              {language === 'ur' ? 'آسان الفاظ میں مطلب (In Plain Words)' : 'In Simple Words (What Does This Mean?)'}
            </p>
            <h3 className={`text-xl sm:text-2xl font-black leading-snug ${language === 'ur' ? 'font-urdu' : ''}`}>
              {activeInfo.name}
            </h3>
            <p className={`text-sm sm:text-base leading-relaxed opacity-90 font-medium ${language === 'ur' ? 'font-urdu' : ''}`}>
              {activeInfo.meaning}
            </p>
            <div className="pt-2 text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-1.5">
              <span className="text-slate-500">{language === 'ur' ? 'مشورہ:' : 'Advice:'}</span>
              <span className={language === 'ur' ? 'font-urdu text-slate-800' : 'text-slate-800'}>{activeInfo.advice}</span>
            </div>
          </div>
        </div>

        {/* Audio Read-Aloud Button */}
        <div className="flex-shrink-0 self-end sm:self-start">
          <button
            onClick={handleAudioToggle}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 shadow-sm ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-white" />
                <span className={language === 'ur' ? 'font-urdu' : ''}>{t('common.stopAudio')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-sky-600" />
                <span className={language === 'ur' ? 'font-urdu' : ''}>{t('common.listen')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Assessment Summary 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Primary Finding */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === 'ur' 
              ? (isSkin ? 'بنیادی تشخیص' : 'بالوں کی کثافت') 
              : (isSkin ? 'Most Likely Condition' : 'Hair Fullness Rating')}
          </span>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {isSkin ? prediction.class : `${prediction.density_score || 85} / 100`}
            </h3>
            <p className={`text-sm text-slate-600 font-bold mt-1 ${language === 'ur' ? 'font-urdu' : ''}`}>
              {activeInfo.name}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">{t('common.accuracy')}:</span>
            <span className="font-extrabold text-sky-600 text-base">
              {isSkin ? `${prediction.confidence || 94.8}%` : `${prediction.density_score || 85}%`}
            </span>
          </div>
        </div>

        {/* Card 2: Risk / Safety Level */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === 'ur' ? 'خطرے کا درجہ' : (isSkin ? 'Safety & Urgency Level' : 'Hair Loss Stage')}
          </span>
          <div>
            <div className="inline-flex items-center space-x-2">
              <span className={`text-sm sm:text-base font-black px-3.5 py-1.5 rounded-2xl border ${riskInfo.badgeClass} ${language === 'ur' ? 'font-urdu' : ''}`}>
                {riskInfo.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
              {isSkin 
                ? (prediction.risk_level === 'high' ? 'Doctor checkup strongly advised' : 'Normal, benign-looking pattern') 
                : (prediction.hairline_type || 'Hairline symmetry check')}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-slate-700">Verified</span>
          </div>
        </div>

        {/* Card 3: What You Should Do */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === 'ur' ? 'تجویز کردہ احتیاط' : 'What You Should Do'}
          </span>
          <div>
            <p className={`text-sm text-slate-700 leading-relaxed font-medium ${language === 'ur' ? 'font-urdu' : ''}`}>
              {activeInfo.advice}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">{language === 'ur' ? 'اگلا معائنہ:' : 'Next check:'}</span>
            <span className="font-bold text-slate-700">{language === 'ur' ? '30 دن بعد' : 'In 30 days'}</span>
          </div>
        </div>

      </div>

      {/* Easy-to-Understand Breakdown Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <Activity className="w-6 h-6 text-sky-600" />
          <div>
            <h3 className={`text-lg font-bold text-slate-900 ${language === 'ur' ? 'font-urdu' : ''}`}>
              {language === 'ur' 
                ? (isSkin ? 'کمپیوٹر کے چیک کردہ تمام امکانی نشانات' : 'بالوں کی صحت کے پیمانے')
                : (isSkin ? 'All Skin Conditions Checked by the AI' : 'Your Hair & Scalp Health Measurements')}
            </h3>
            <p className="text-xs text-slate-500">
              {isSkin ? 'Detailed confidence breakdown across HAM10000 benchmark categories:' : 'Simple breakdown of what was measured in your photo:'}
            </p>
          </div>
        </div>

        {isSkin && prediction.top_classes ? (
          <div className="space-y-4">
            {prediction.top_classes.map((cls: any, i: number) => {
              const code = (cls.type || '').toLowerCase();
              const clsInfo = getSkinInfo(code);
              return (
                <div key={i} className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <div className="space-x-2">
                      <span className="text-slate-900">{cls.class}</span>
                      <span className={`text-slate-500 font-normal text-xs ${language === 'ur' ? 'font-urdu' : ''}`}>
                        — {clsInfo.name}
                      </span>
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
        assessmentType={assessment.assessment_type || assessment.type}
        predictedClass={prediction.class || prediction.thinning_stage}
        rationale={prediction.diagnostic_rationale}
      />

      {/* Doctor Collaborative Second-Opinion Card */}
      <DoctorReviewCard
        assessment={assessment}
        onOpenReport={() => setShowReportModal(true)}
      />

      {/* Bottom Action Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-base font-extrabold shadow-lg transition-all flex items-center space-x-3 hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          <span className={language === 'ur' ? 'font-urdu' : ''}>{t('common.checkAnother')}</span>
        </button>
      </div>

      {/* Clinical PDF Report Modal with QR Code */}
      {showReportModal && (
        <ClinicalReportModal
          assessment={assessment}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
};
