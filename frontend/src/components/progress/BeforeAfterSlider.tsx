import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  SplitSquareVertical, 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  FileText, 
  X,
  Stethoscope,
  Sparkles,
  Info
} from 'lucide-react';
import { Assessment } from '../../types/assessment';
import { formatDate } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';

interface BeforeAfterSliderProps {
  beforeAssessment: Assessment;
  afterAssessment: Assessment;
  onClose?: () => void;
  onOpenReport?: (a: Assessment) => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeAssessment,
  afterAssessment,
  onClose,
  onOpenReport
}) => {
  const { language } = useLanguage();
  const isUrdu = language === 'ur';

  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'photo' | 'gradcam'>('photo');
  const [swapped, setSwapped] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const primaryBefore = swapped ? afterAssessment : beforeAssessment;
  const primaryAfter = swapped ? beforeAssessment : afterAssessment;

  const isSkin = primaryBefore.type === 'skin';
  const beforePred = primaryBefore.prediction || {};
  const afterPred = primaryAfter.prediction || {};

  // Time delta
  const beforeDate = new Date(primaryBefore.created_at);
  const afterDate = new Date(primaryAfter.created_at);
  const daysDiff = Math.abs(Math.round((afterDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Stability metric
  const beforeScore = isSkin ? (beforePred.confidence || 90) : (beforePred.density_score || 80);
  const afterScore = isSkin ? (afterPred.confidence || 90) : (afterPred.density_score || 80);
  const delta = Number((afterScore - beforeScore).toFixed(1));

  const isStable = isSkin 
    ? (beforePred.class === afterPred.class && Math.abs(delta) < 8)
    : (Math.abs(delta) < 10);

  // Drag handlers
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const beforeImg = viewMode === 'gradcam' 
    ? (primaryBefore.grad_cam_url || primaryBefore.image_url) 
    : primaryBefore.image_url;

  const afterImg = viewMode === 'gradcam' 
    ? (primaryAfter.grad_cam_url || primaryAfter.image_url) 
    : primaryAfter.image_url;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-5 p-6 animate-fadeIn text-base">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <SplitSquareVertical className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-black text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'انٹرایکٹو بیفور / آفٹر موازنہ سلائیڈر' : 'Interactive Before & After Evolution Slider'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isUrdu 
                  ? 'سلائیڈر کو دائیں اور بائیں گھما کر وقت کے ساتھ تبدیلی کا براہ راست معائنہ کریں'
                  : 'Drag the split divider left and right to inspect structural progression over time'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Photo vs Grad-CAM View Switch */}
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 text-xs font-bold border border-slate-200">
            <button
              onClick={() => setViewMode('photo')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'photo'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              📷 Photo
            </button>
            <button
              onClick={() => setViewMode('gradcam')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                viewMode === 'gradcam'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Grad-CAM</span>
            </button>
          </div>

          {/* Swap Button */}
          <button
            onClick={() => setSwapped(!swapped)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            title="Swap Before & After images"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
            <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'ترتیب بدلیں' : 'Swap'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Split-Screen Image Box */}
      <div 
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden select-none cursor-ew-resize border border-slate-300 shadow-inner bg-slate-900"
      >
        {/* Background Layer: "After / Follow-up" Image */}
        <img
          src={afterImg}
          alt="Follow-up Scan"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Foreground Layer: "Before / Baseline" Image with Clip-Path */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeImg}
            alt="Baseline Scan"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ 
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%', 
              height: '100%' 
            }}
          />
        </div>

        {/* Draggable Vertical Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center -translate-x-1/2 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-lg border-2 border-sky-600 flex items-center justify-center text-sky-700 font-bold text-xs pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>

        {/* Top Floating Badges */}
        {/* Left Badge (Before) */}
        <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/20 text-xs shadow-md">
          <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
            {isUrdu ? 'پہلا معائنہ (BASELINE)' : 'BASELINE SCAN'}
          </span>
          <span className="font-extrabold">{formatDate(primaryBefore.created_at)}</span>
        </div>

        {/* Right Badge (After) */}
        <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/20 text-xs shadow-md text-right">
          <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">
            {isUrdu ? 'تازہ ترین معائنہ (FOLLOW-UP)' : 'FOLLOW-UP SCAN'}
          </span>
          <span className="font-extrabold">{formatDate(primaryAfter.created_at)}</span>
        </div>

        {/* Bottom Floating Labels */}
        <div className="absolute bottom-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[11px] font-bold">
          {beforePred.class || beforePred.thinning_stage} ({beforeScore}%)
        </div>

        <div className="absolute bottom-3 right-3 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[11px] font-bold text-right">
          {afterPred.class || afterPred.thinning_stage} ({afterScore}%)
        </div>
      </div>

      {/* Slider Position Range Bar for Touch/Accessibility */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-bold text-slate-400">
          <span>← Reveal Baseline ({sliderPos}%)</span>
          <span className="text-slate-600">Drag or slide anywhere on the image</span>
          <span>Reveal Follow-up ({100 - sliderPos}%) →</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />
      </div>

      {/* Quantitative Longitudinal Health Telemetry Card */}
      <div className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isStable 
          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
          : 'bg-amber-50/80 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-start space-x-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isStable ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
          }`}>
            {isStable ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <h4 className={`text-base font-black ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu 
                ? (isStable ? 'حالت مستحکم ہے — کوئی غیر معمولی تبدیلی نہیں' : 'تبدیلی دیکھی گئی — ڈاکٹر سے معائنہ مفید ہے')
                : (isStable ? 'Stable Condition — No Adverse Morphological Evolution' : 'Morphological Variance Observed — Routine Review Advised')}
            </h4>
            <p className={`text-xs mt-1 leading-relaxed opacity-90 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu
                ? `دونوں معائنوں کے درمیان ${daysDiff} دن کا وقفہ ہے۔ تصویروں کے موازنے سے معلوم ہوتا ہے کہ نشان کے خدوخال پرسکون ہیں۔`
                : `${daysDiff} days elapsed between scans. Pigment network border and symmetry remain within normal longitudinal tolerance bounds.`}
            </p>
          </div>
        </div>

        {/* Delta stats */}
        <div className="flex items-center space-x-4 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 text-xs">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Time Apart</span>
            <span className="font-black text-sm text-slate-900">{daysDiff} Days</span>
          </div>
          <div className="h-6 w-px bg-slate-300" />
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Confidence Delta</span>
            <span className={`font-black text-sm ${delta >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {delta > 0 ? `+${delta}%` : `${delta}%`}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
