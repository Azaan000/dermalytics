import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Stethoscope, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  User,
  Clock
} from 'lucide-react';
import { Doctor } from '../../types/doctor';
import { doctorsApi } from '../../api/doctors';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

interface DoctorReviewModalProps {
  assessment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const DoctorReviewModal: React.FC<DoctorReviewModalProps> = ({
  assessment,
  onClose,
  onSuccess
}) => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);

  const assessmentId = assessment.assessment_id || assessment.id;
  const isSkin = assessment.assessment_type === 'skin' || assessment.type === 'skin';
  const prediction = assessment.prediction || {};

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDocs(true);
        const res = await doctorsApi.getDoctors({ limit: 10 });
        setDoctors(res.doctors);
        if (res.doctors.length > 0) {
          // Default to first doctor (e.g. Dr. Fatima Zehra)
          setSelectedDoctorId(res.doctors[0].id);
        }
      } catch (e) {
        showToast('Failed to load doctors list', 'error');
      } finally {
        setLoadingDocs(false);
      }
    };
    loadDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentId) {
      showToast('Assessment ID is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await doctorsApi.requestReview({
        assessment_id: assessmentId,
        doctor_id: selectedDoctorId || undefined,
        patient_notes: patientNotes.trim() || undefined
      });
      showToast('Review request submitted successfully! A specialist will evaluate your scan.', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to submit review request. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Telehealth Clinical Review</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Request Specialist Second Opinion
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Have a verified Pakistani dermatologist or trichologist evaluate your AI assessment, review the Grad-CAM telemetry, and provide an official care plan.
          </p>
        </div>

        {/* Scan Summary Preview Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center space-x-4 mb-6">
          <img
            src={assessment.image_url}
            alt="Scan Thumbnail"
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Scan Type: {isSkin ? 'Skin Lesion Dermoscopy' : 'Scalp Trichoscopy'}
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 truncate">
              {prediction.class || prediction.thinning_stage || 'Clinical Scan'}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
              <span>Confidence: <strong>{prediction.confidence || prediction.density_score || 90}%</strong></span>
              <span>•</span>
              <span className={`font-bold ${
                prediction.risk_level === 'high' ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                Risk: {prediction.risk_level || 'Low'}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Doctor Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Select Examining Specialist:</span>
              <span className="text-[10px] font-normal text-slate-400">All doctors PMDC registered</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} — {d.hospital_affiliation} ({d.city}) • Fee: PKR {d.consultation_fee}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Symptoms and Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Your Symptoms & Medical History (Optional):
            </label>
            <textarea
              rows={3}
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              placeholder="e.g. The spot started getting darker 3 weeks ago, feels itchy when exposed to sun. No personal history of melanoma."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400 resize-none"
            />
          </div>

          {/* SLA / Assurance */}
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-start space-x-2.5 text-xs text-teal-800">
            <Clock className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <p className="leading-snug">
              Specialist reviews are typically completed within <strong>2 to 4 business hours</strong>. You will be able to view their clinical comments and download the verified PDF report.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingDocs}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting Request...' : 'Submit for Review'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
