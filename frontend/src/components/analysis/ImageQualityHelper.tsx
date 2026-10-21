import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Camera, 
  Sun, 
  Focus, 
  HelpCircle,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { ImageQualityReport } from '../../utils/imageQualityChecker';
import { useLanguage } from '../../context/LanguageContext';

interface ImageQualityHelperProps {
  report: ImageQualityReport;
  onRetake: () => void;
  onProceed: () => void;
  isAnalyzing?: boolean;
}

export const ImageQualityHelper: React.FC<ImageQualityHelperProps> = ({
  report,
  onRetake,
  onProceed,
  isAnalyzing = false
}) => {
  const { language } = useLanguage();
  const isUrdu = language === 'ur';

  const tierColors = {
    excellent: 'text-emerald-700 bg-emerald-50 border-emerald-300 ring-emerald-400',
    good: 'text-sky-700 bg-sky-50 border-sky-300 ring-sky-400',
    fair: 'text-amber-700 bg-amber-50 border-amber-300 ring-amber-400',
    poor: 'text-rose-700 bg-rose-50 border-rose-300 ring-rose-400',
  }[report.tier];

  const scoreBadgeBg = {
    excellent: 'bg-emerald-600',
    good: 'bg-sky-600',
    fair: 'bg-amber-500',
    poor: 'bg-rose-600',
  }[report.tier];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 animate-fadeIn text-sm">
      
      {/* Top Header & Quality Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-base font-black text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'تصویر کا کوالٹی اور فوکس ٹیسٹ' : 'Smart Photo Quality & Distance Check'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'مصنوعی ذہانت کے درست نتیجے کے لیے کوالٹی کی جانچ' : 'Pre-flight check for clear focus, lighting & framing'}
            </p>
          </div>
        </div>

        {/* Score Pill */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className={`px-3.5 py-1.5 rounded-2xl border flex items-center space-x-2 ${tierColors}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${scoreBadgeBg} animate-pulse`} />
            <span className={`text-xs font-black uppercase ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? report.tierLabelUr : report.tierLabelEn} ({report.overallScore}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Sharpness Card */}
        <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
          report.sharpness.passed ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center space-x-1.5 text-slate-800">
              <Focus className="w-3.5 h-3.5 text-sky-600" />
              <span className={isUrdu ? 'font-urdu' : ''}>
                {isUrdu ? report.sharpness.nameUr : report.sharpness.name}
              </span>
            </div>
            {report.sharpness.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <p className={`text-[11px] text-slate-600 leading-snug ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? report.sharpness.detailUr : report.sharpness.detail}
          </p>
        </div>

        {/* Lighting Card */}
        <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
          report.lighting.passed ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center space-x-1.5 text-slate-800">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className={isUrdu ? 'font-urdu' : ''}>
                {isUrdu ? report.lighting.nameUr : report.lighting.name}
              </span>
            </div>
            {report.lighting.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <p className={`text-[11px] text-slate-600 leading-snug ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? report.lighting.detailUr : report.lighting.detail}
          </p>
        </div>

        {/* Glare Card */}
        <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
          report.glare.passed ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center space-x-1.5 text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className={isUrdu ? 'font-urdu' : ''}>
                {isUrdu ? report.glare.nameUr : report.glare.name}
              </span>
            </div>
            {report.glare.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <p className={`text-[11px] text-slate-600 leading-snug ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? report.glare.detailUr : report.glare.detail}
          </p>
        </div>

      </div>

      {/* Distance & Advice Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start space-x-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-800 block">
            {isUrdu ? 'کیمرے کے فاصلے اور اینگل کی رہنمائی:' : 'Camera Distance & Framing Guide:'}
          </span>
          <p className={`text-slate-600 leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? report.recommendationUr : report.recommendationEn}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onRetake}
          disabled={isAnalyzing}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className={isUrdu ? 'font-urdu' : ''}>
            {isUrdu ? 'دوسری تصویر منتخب کریں' : 'Choose / Take Another Photo'}
          </span>
        </button>

        <button
          onClick={onProceed}
          disabled={isAnalyzing}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 shadow-sm ${
            report.canProceed
              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          <span>
            {isAnalyzing 
              ? (isUrdu ? 'معائنہ جاری ہے...' : 'Analyzing Image...') 
              : (isUrdu ? 'اس تصویر سے معائنہ شروع کریں' : 'Proceed with This Photo')}
          </span>
        </button>
      </div>

    </div>
  );
};
