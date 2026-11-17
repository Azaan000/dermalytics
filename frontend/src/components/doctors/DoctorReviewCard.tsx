import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  FileText,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { ScanReview } from '../../types/doctor';
import { doctorsApi } from '../../api/doctors';
import { DoctorReviewModal } from './DoctorReviewModal';
import { useLanguage } from '../../context/LanguageContext';

interface DoctorReviewCardProps {
  assessment: any;
  onOpenReport?: () => void;
}

export const DoctorReviewCard: React.FC<DoctorReviewCardProps> = ({
  assessment,
  onOpenReport
}) => {
  const { language } = useLanguage();
  const [review, setReview] = useState<ScanReview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  const assessmentId = assessment.assessment_id || assessment.id;

  const fetchReviewStatus = async () => {
    if (!assessmentId) return;
    try {
      setLoading(true);
      const rev = await doctorsApi.getReviewForAssessment(assessmentId);
      setReview(rev);
    } catch (e) {
      // not found or error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewStatus();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-8 bg-slate-200 rounded" />
      </div>
    );
  }

  // State 1: Review Completed
  if (review && (review.status === 'completed' || review.status === 'reviewed')) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-300 shadow-sm space-y-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-extrabold text-slate-900 text-base">
                  Verified Doctor Second Opinion
                </h4>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-300">
                  Completed & Certified
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Examined by <strong>{review.doctor?.full_name || 'Specialist Dermatologist'}</strong> (PMDC #{review.doctor?.pmdc_number})
              </p>
            </div>
          </div>

          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <FileText className="w-4 h-4" />
              <span>View Certified Report</span>
            </button>
          )}
        </div>

        {/* Doctor Impression and AI Agreement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white/80 rounded-2xl border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              AI Prediction Concordance
            </span>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className={`w-4 h-4 ${review.agreed_with_ai ? 'text-emerald-600' : 'text-amber-500'}`} />
              <span className="font-extrabold text-slate-900 text-sm">
                {review.agreed_with_ai ? 'Doctor Confirmed AI Assessment' : 'Doctor Provided Adjusted Clinical Diagnosis'}
              </span>
            </div>
            <p className="text-xs text-slate-600 pt-1">
              <strong>Clinical Impression:</strong> {review.clinical_impression}
            </p>
          </div>

          <div className="p-4 bg-white/80 rounded-2xl border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Triage & Follow-up Timeline
            </span>
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Recommended Follow-up: <strong>{review.follow_up_days ? `${review.follow_up_days} Days` : 'Routine Check'}</strong></span>
            </div>
            <p className="text-xs text-slate-600 pt-1">
              <strong>Urgency:</strong> <span className="capitalize font-semibold">{review.urgency_level}</span>
            </p>
          </div>
        </div>

        {/* Doctor Clinical Notes / Treatment Advice */}
        {review.doctor_notes && (
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Doctor's Personalized Clinical Instructions:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              "{review.doctor_notes}"
            </p>
          </div>
        )}

      </div>
    );
  }

  // State 2: Review Pending / In Review
  if (review && (review.status === 'pending' || review.status === 'in_review')) {
    return (
      <div className="bg-gradient-to-r from-sky-50 via-teal-50 to-amber-50 rounded-3xl p-6 border-2 border-sky-300 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center animate-pulse">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Doctor Second-Opinion Review in Progress
              </h4>
              <p className="text-xs text-slate-500">
                Assigned to <strong>{review.doctor?.full_name || 'Assigned Specialist'}</strong> • Submitted on {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
            Pending Doctor Sign-off
          </span>
        </div>
        <p className="text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-sky-100">
          Your scan and explainable AI Grad-CAM maps are queued for review. You will receive an official clinical stamp and feedback once completed.
        </p>
      </div>
    );
  }

  // State 3: Not Requested Yet
  return (
    <>
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-teal-800 rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-4 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-sky-200 text-[11px] font-semibold border border-white/15">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Collaborative Tele-Dermatology Second Opinion</span>
            </div>
            <h4 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Want a Verified Dermatologist to Review This Scan?
            </h4>
            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
              Have our PMDC-registered dermatologists in Karachi, Lahore, or Islamabad inspect your scan and confirm the AI findings with an official digital stamp and care plan.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3.5 bg-white text-sky-900 hover:bg-sky-50 rounded-2xl text-xs sm:text-sm font-black shadow-lg transition-all flex items-center space-x-2 flex-shrink-0 hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Request Specialist Review</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {showModal && (
        <DoctorReviewModal
          assessment={assessment}
          onClose={() => setShowModal(false)}
          onSuccess={fetchReviewStatus}
        />
      )}
    </>
  );
};
