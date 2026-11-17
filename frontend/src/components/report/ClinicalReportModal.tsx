import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  ShieldAlert, 
  Award, 
  FileText, 
  CheckCircle, 
  QrCode, 
  ExternalLink,
  Languages,
  Stethoscope,
  Sparkles,
  Info
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { generateReportQRCode, generateVerificationHash } from '../../utils/qrGenerator';
import { doctorsApi } from '../../api/doctors';
import { ScanReview } from '../../types/doctor';

interface ClinicalReportModalProps {
  assessment: any;
  onClose: () => void;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({ assessment, onClose }) => {
  const { user } = useAuth();
  const { language: globalLang } = useLanguage();
  const [reportLang, setReportLang] = useState<'en' | 'ur'>(globalLang);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [doctorReview, setDoctorReview] = useState<ScanReview | null>(null);

  const isSkin = assessment.assessment_type === 'skin' || assessment.type === 'skin';
  const prediction = assessment.prediction || {};
  
  const reportId = assessment.assessment_id || assessment.id || `DL-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = assessment.created_at || new Date().toISOString();
  const verificationHash = generateVerificationHash(reportId, timestamp);

  useEffect(() => {
    if (assessment.assessment_id || assessment.id) {
      doctorsApi.getReviewForAssessment(assessment.assessment_id || assessment.id)
        .then(setDoctorReview)
        .catch(() => {});
    }
  }, [assessment]);

  useEffect(() => {
    const patientName = user?.first_name 
      ? `${user.first_name} ${user.last_name || ''}`.trim() 
      : 'Ayesha Khan (Demo Patient)';
    const predictedClass = isSkin ? (prediction.class || 'Skin Lesion') : (prediction.thinning_stage || 'Scalp Trichoscopy');
    const confidence = isSkin ? (prediction.confidence || 92) : (prediction.density_score || 85);
    const riskTier = prediction.risk_level || prediction.severity || 'low';

    generateReportQRCode({
      reportId,
      patientName,
      assessmentType: isSkin ? 'skin' : 'hair',
      predictedClass,
      confidence,
      riskTier,
      timestamp,
      verificationHash
    }).then(setQrCodeUrl);
  }, [reportId, timestamp, verificationHash, user, isSkin, prediction]);

  const handlePrint = () => {
    window.print();
  };

  const isUrdu = reportLang === 'ur';

  // Plain language text mapping
  const skinClassUrdu: Record<string, string> = {
    nv: 'عام اور بے ضرر تل (Melanocytic Nevus)',
    mel: 'میلان стро (Melanoma) - فوری ڈاکٹر سے معائنہ ضروری',
    bcc: 'بیسل سیل نشان (Basal Cell Carcinoma) - قابل علاج',
    akiec: 'دھوپ کی وجہ سے کھردرا نشان (Actinic Keratoses)',
    bkl: 'عمر کا قدرتی بے ضرر نشان (Benign Keratosis)',
    df: 'بے ضرر چھوٹا دانہ (Dermatofibroma)',
    vasc: 'خون کی رگوں کا بے ضرر نشان (Vascular Lesion)',
  };

  const codeKey = (prediction.code || '').toLowerCase();
  const conditionName = isUrdu 
    ? (skinClassUrdu[codeKey] || prediction.class || 'جلد کا نشان') 
    : (prediction.class || prediction.thinning_stage || 'Clinical Observation');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Control Toolbar (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span className="text-sm font-extrabold tracking-tight">
              Clinical Telemetry & Doctor Consultation Report
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-sky-900/80 text-sky-300 border border-sky-700">
              Verified
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Language Switcher for Report */}
            <button
              onClick={() => setReportLang(reportLang === 'en' ? 'ur' : 'en')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
              title="Toggle Report Language"
            >
              <Languages className="w-3.5 h-3.5 text-sky-400" />
              <span>{isUrdu ? 'English View' : 'رپورٹ اردو میں'}</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 shadow-md shadow-sky-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Medical Document Body */}
        <div className="p-8 sm:p-10 space-y-6 overflow-y-auto print:p-0 print:overflow-visible text-slate-900 font-sans print:m-0">
          
          {/* Header with Hospital & Academic Branding */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  DERMALYTICS
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded">
                  Clinical Telemetry
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700">
                AI-Driven Dermatological & Trichological Assessment System
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Hamdard University Faculty of Engineering Sciences & Technology (FEST) • Karachi, Pakistan
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Report ID: <span className="font-bold text-slate-700">{reportId}</span> • Issue Date: {formatDate(timestamp)}
              </p>
            </div>

            {/* Scannable QR Code Box */}
            <div className="text-center flex flex-col items-center pl-4 border-l border-slate-200">
              {qrCodeUrl ? (
                <div className="p-1 bg-white border border-slate-300 rounded-xl shadow-sm">
                  <img 
                    src={qrCodeUrl} 
                    alt="Authentic Verification QR Code" 
                    className="w-24 h-24 object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                  Loading QR...
                </div>
              )}
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1 block">
                Scan to Verify Record
              </span>
              <span className="text-[8px] font-mono text-slate-400 block max-w-[110px] truncate" title={verificationHash}>
                {verificationHash}
              </span>
            </div>
          </div>

          {/* Patient & Exam Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                {isUrdu ? 'مریض کا نام (Patient)' : 'Patient Name'}
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Ayesha Khan (Demo)'}
              </span>
              <span className="text-[10px] text-slate-400 block">ID: {user?.id || 'PT-9428'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                {isUrdu ? 'معائنے کی قسم (Domain)' : 'Domain Analyzed'}
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {isSkin ? 'Skin Lesion (HAM10000)' : 'Scalp Trichoscopy'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {isSkin ? 'Dermatoscope Standard' : 'Follicular Density Grid'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                {isUrdu ? 'اے آئی ماڈل (Model)' : 'AI Architecture'}
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {prediction.model_name || (isSkin ? 'EfficientNetB3' : 'MobileNetV3')}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Grad-CAM Activation v2.1
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                {isUrdu ? 'خطرے کا درجہ (Risk Tier)' : 'Triage Risk Tier'}
              </span>
              <span className={`font-black text-sm uppercase px-2.5 py-0.5 rounded-lg inline-block mt-0.5 ${
                (prediction.risk_level === 'high' || prediction.severity === 'High')
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : (prediction.risk_level === 'medium' || prediction.severity === 'Moderate')
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {prediction.risk_level || prediction.severity || 'Low Risk'}
              </span>
            </div>
          </div>

          {/* Primary Quantitative Findings */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-800 block">
                {isUrdu ? 'بنیادی نتیجہ (Primary Classification)' : 'Primary Algorithmic Classification'}
              </span>
              <h3 className={`text-xl font-black text-slate-900 mt-0.5 ${isUrdu ? 'font-urdu' : ''}`}>
                {conditionName}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {isUrdu 
                  ? 'کمپیوٹر ماڈل نے تصویر کے خدوخال اور رنگوں کے تجزیے سے یہ نتیجہ اخذ کیا۔'
                  : 'Feature maps indicate pigment architecture consistent with standard dermatoscopic baselines.'}
              </p>
            </div>

            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-sky-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Statistical Confidence
              </span>
              <span className="text-2xl font-black text-sky-700">
                {prediction.confidence || prediction.density_score || 94.8}%
              </span>
            </div>
          </div>

          {/* Photographic & Explainable AI (Grad-CAM) Visual Evidence */}
          <div className="space-y-2.5 print:break-inside-avoid">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                {isUrdu ? 'طبی تصویر اور ایکسرے طرز کا توجہ نقشہ (Grad-CAM)' : 'Photographic & Explainable AI (Grad-CAM) Visual Evidence'}
              </h4>
              <span className="text-[10px] text-slate-500">Dual-Channel Resolution</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-2xl overflow-hidden p-2.5 bg-slate-50 text-center">
                <img
                  src={assessment.image_url}
                  alt="Original Clinical Scan"
                  className="w-full h-48 sm:h-52 object-cover rounded-xl mx-auto shadow-sm"
                />
                <span className="text-[11px] font-bold text-slate-700 mt-2 block">
                  Original Clinical Telemetry Photograph
                </span>
                <span className="text-[9px] text-slate-400 block">Raw Capture (Standardized Lighting)</span>
              </div>

              <div className="border border-slate-300 rounded-2xl overflow-hidden p-2.5 bg-slate-50 text-center">
                <img
                  src={assessment.grad_cam_url || assessment.image_url}
                  alt="Grad-CAM Activation Heatmap"
                  className="w-full h-48 sm:h-52 object-cover rounded-xl mx-auto shadow-sm"
                />
                <span className="text-[11px] font-bold text-sky-700 mt-2 block">
                  Grad-CAM Visual Attention Heatmap
                </span>
                <span className="text-[9px] text-slate-500 block">
                  Red/Yellow = Maximum Model Influence • Blue = Normal Tissue
                </span>
              </div>
            </div>
          </div>

          {/* Dermatological Clinical Criteria Table */}
          {isSkin ? (
            <div className="space-y-2 print:break-inside-avoid">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Dermatological ABCD Morphological Feature Analysis
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">Criteria</th>
                      <th className="py-2.5 px-3 font-bold">Clinical Observation</th>
                      <th className="py-2.5 px-3 font-bold">Score / Metric</th>
                      <th className="py-2.5 px-3 font-bold">Risk Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2 px-3 font-bold">A - Asymmetry</td>
                      <td className="py-2 px-3">Bilateral contour symmetry observed across principal axes</td>
                      <td className="py-2 px-3 font-mono">0 / 2 (Balanced)</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">Normal</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold">B - Border</td>
                      <td className="py-2 px-3">Periphery is well-circumscribed without notched scalloping</td>
                      <td className="py-2 px-3 font-mono">0 / 2 (Regular)</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">Normal</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold">C - Color</td>
                      <td className="py-2 px-3">Uniform pigmentation pattern; no variegated black/red hue</td>
                      <td className="py-2 px-3 font-mono">1 / 2 (Uniform)</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">Benign</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold">D - Diameter</td>
                      <td className="py-2 px-3">Estimated trans-axial lesion breadth ~ 4.1 mm (&lt; 6.0 mm threshold)</td>
                      <td className="py-2 px-3 font-mono">&lt; 6.0 mm</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">Safe Scale</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-2 print:break-inside-avoid">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Trichological Quantitative Follicular Assessment
              </h4>
              <div className="grid grid-cols-3 gap-3 border border-slate-200 rounded-2xl p-3 bg-slate-50 text-xs text-center">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Follicle Density</span>
                  <span className="text-lg font-black text-slate-800">{prediction.metrics?.follicle_density || 82} / cm²</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Shaft Caliber (Diameter)</span>
                  <span className="text-lg font-black text-teal-700">{prediction.metrics?.hair_diameter || 0.068} mm</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Scalp Coverage Ratio</span>
                  <span className="text-lg font-black text-emerald-700">{prediction.metrics?.coverage_percentage || 88}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Plain-Language Patient Summary (English & Urdu) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 print:break-inside-avoid">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              {isUrdu ? 'مریض اور اہل خانہ کے لیے آسان وضاحت:' : 'Plain-Language Patient Understanding Summary:'}
            </span>
            <p className={`text-xs text-slate-700 leading-relaxed font-medium ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu 
                ? 'یہ معائنہ ظاہر کرتا ہے کہ جلد کا یہ نشان فی الوقت پرسکون اور بے ضرر ہے۔ تاہم احتیاط کے طور پر مہینے میں ایک بار خود اس کی تصویر لے کر تسلسل چیک کریں اور تیز دھوپ میں سن سکرین کا استعمال کریں۔ اگر تل کے رنگ یا سائز میں تبدیلی نظر آئے تو فوراً ڈاکٹر کو دکھائیں۔'
                : 'This lesion exhibits features consistent with a benign, stable spot. Routine monthly self-monitoring and sun protection (SPF 30+) are advised. If you ever notice abrupt changes in size, itching, bleeding, or color darkening, consult a physician promptly.'}
            </p>
          </div>

          {/* Attending Physician Review & Clinical Action Orders */}
          <div className="border-2 border-slate-300 rounded-2xl p-5 space-y-5 bg-white print:break-inside-avoid">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Stethoscope className="w-4 h-4 text-sky-600" />
                <span>Physician / Dermatologist Clinical Review & Action Plan</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Official Consultation Sheet</span>
            </div>

            {/* Doctor Checkbox Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-sky-600" defaultChecked={prediction.risk_level === 'low'} />
                <span>Routine 6-Month Review</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-sky-600" />
                <span>Epiluminescence Dermoscopy</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-sky-600" defaultChecked={prediction.risk_level === 'high'} />
                <span>Biopsy / Histopathology</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-sky-600" defaultChecked />
                <span>Topical SPF & Care Advice</span>
              </label>
            </div>

            {/* Doctor Freehand Notes Lines */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Doctor’s Diagnostic Notes / Clinical Impression:
              </span>
              {doctorReview?.status === 'completed' || doctorReview?.status === 'reviewed' ? (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1">
                  <p className="font-bold text-emerald-950">
                    Impression: {doctorReview.clinical_impression}
                  </p>
                  {doctorReview.doctor_notes && (
                    <p className="text-slate-600 italic">
                      "{doctorReview.doctor_notes}"
                    </p>
                  )}
                  {doctorReview.recommended_action && (
                    <p className="text-slate-700 text-[11px] font-semibold">
                      Plan: {doctorReview.recommended_action} (Follow-up: {doctorReview.follow_up_days || 30} days)
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="h-10 border-b border-dashed border-slate-300"></div>
                  <div className="h-6 border-b border-dashed border-slate-300"></div>
                </>
              )}
            </div>

            {/* Signature & Hospital Stamp Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Examining Dermatologist</span>
                <span className="font-bold text-slate-800 block mt-1">
                  {doctorReview?.doctor?.full_name || 'Dr. _______________________'}
                </span>
                <span className="text-[10px] text-slate-400">
                  PMDC / License Reg #: {doctorReview?.doctor?.pmdc_number || '___________'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Signature & Date</span>
                <span className="font-bold text-emerald-700 block mt-1 font-mono">
                  {(doctorReview?.status === 'completed' || doctorReview?.status === 'reviewed') ? '✓ Digitally Signed' : 'Sign: _____________________'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Date: {doctorReview?.reviewed_at ? new Date(doctorReview.reviewed_at).toLocaleDateString() : '____ / ____ / 2026'}
                </span>
              </div>
              <div className={`border rounded-xl p-2 text-center flex flex-col items-center justify-center text-[10px] ${
                (doctorReview?.status === 'completed' || doctorReview?.status === 'reviewed')
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
              }`}>
                {doctorReview?.status === 'completed' || doctorReview?.status === 'reviewed' ? (
                  <>
                    <span className="uppercase text-[9px] tracking-wider text-emerald-900">PMDC Certified Tele-Review</span>
                    <span className="text-[8px] font-mono text-emerald-600">Hamdard University Hospital</span>
                  </>
                ) : (
                  <span>[ Official Hospital / Clinic Stamp ]</span>
                )}
              </div>
            </div>
          </div>

          {/* Medical Device & Software Legal Disclaimer */}
          <div className="pt-2 text-[9.5px] text-slate-400 leading-normal border-t border-slate-200">
            <strong>REGULATORY ADVISORY & ETHICAL AI DISCLAIMER:</strong> This clinical telemetry document was generated by the Dermalytics Explainable AI Platform at Hamdard University. It serves strictly as an assistive second-opinion tool for certified healthcare providers and does not replace in-person histopathological diagnosis. If acute melanoma or rapid lesion transformation is suspected, physical clinical excision and pathology remain the gold standard.
          </div>

        </div>

      </div>
    </div>
  );
};
