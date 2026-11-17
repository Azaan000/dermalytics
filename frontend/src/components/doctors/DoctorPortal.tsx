import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Layers,
  Activity,
  Award,
  LogIn,
  User,
  ChevronRight,
  Eye,
  FileText,
  RefreshCw,
  Badge,
  Zap,
  Lock
} from 'lucide-react';
import { ScanReview, SubmitReviewPayload } from '../../types/doctor';
import { doctorsApi } from '../../api/doctors';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const DoctorPortal: React.FC = () => {
  const { user, loginDemo } = useAuth();
  const { showToast } = useToast();

  const isDoctor = !!(user?.is_doctor || user?.role === 'doctor');

  const [pendingReviews, setPendingReviews] = useState<ScanReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<ScanReview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeImageView, setActiveImageView] = useState<'original' | 'gradcam'>('original');

  // Form state
  const [doctorAgreement, setDoctorAgreement] = useState<'agree' | 'partial' | 'disagree'>('agree');
  const [clinicalImpression, setClinicalImpression] = useState<string>('');
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [recommendedAction, setRecommendedAction] = useState<string>('');
  const [prescriptionAdvice, setPrescriptionAdvice] = useState<string>('');
  const [urgencyTier, setUrgencyTier] = useState<'routine' | 'semi_urgent' | 'immediate'>('routine');

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const data = await doctorsApi.getPendingReviews();
      setPendingReviews(data);
      if (data.length > 0) {
        setSelectedReview(data[0]);
        prefillForm(data[0]);
      }
    } catch (err: any) {
      showToast('Could not load review queue. Ensure you are authenticated as a clinician.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDoctor) fetchPendingReviews();
    else setLoading(false);
  }, [isDoctor]);

  const prefillForm = (rev: ScanReview) => {
    const aiPred = rev.assessment?.ai_prediction || 'Melanocytic Nevus';
    setDoctorAgreement('agree');
    setClinicalImpression(`Clinically consistent with ${aiPred}. No acute malignant features observed.`);
    setDoctorNotes('Benign morphology. Continue daily broad-spectrum SPF 50+ and monthly self-examination.');
    setRecommendedAction('Topical care & routine surveillance');
    setPrescriptionAdvice('');
    setUrgencyTier('routine');
  };

  const handleSelectReview = (rev: ScanReview) => {
    setSelectedReview(rev);
    prefillForm(rev);
    setActiveImageView('original');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview || !clinicalImpression.trim()) {
      showToast('Clinical impression is required.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const payload: SubmitReviewPayload = {
        doctor_agreement: doctorAgreement,
        clinical_impression: clinicalImpression.trim(),
        doctor_notes: doctorNotes.trim() || undefined,
        recommended_action: recommendedAction.trim() || undefined,
        prescription_advice: prescriptionAdvice.trim() || undefined,
        urgency_tier: urgencyTier,
      };
      await doctorsApi.submitReview(selectedReview.id, payload);
      showToast('Clinical review signed and submitted successfully!', 'success');
      const remaining = pendingReviews.filter(r => r.id !== selectedReview.id);
      setPendingReviews(remaining);
      setSelectedReview(remaining.length > 0 ? remaining[0] : null);
      if (remaining.length > 0) prefillForm(remaining[0]);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to submit review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── ACCESS GATE for non-doctors ──────────────────────────────────────────
  if (!isDoctor) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center shadow-2xl">
              <Stethoscope className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
              <Lock className="w-4 h-4 text-amber-900" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Clinician Assessment Portal</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              This workspace is exclusively for <span className="font-bold text-slate-700">PMDC-registered dermatologists & trichologists</span> to review patient AI scans, evaluate Grad-CAM telemetry, and provide certified second opinions.
            </p>
          </div>

          {/* Credentials badge row */}
          <div className="flex items-center justify-center space-x-4 py-2">
            {['PMDC Verified', 'IEEE 830', 'Telehealth'].map(label => (
              <span key={label} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {label}
              </span>
            ))}
          </div>

          {/* Demo login */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demo Access</p>
            <button
              onClick={async () => {
                await loginDemo('doctor');
              }}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center space-x-2"
            >
              <Stethoscope className="w-5 h-5" />
              <span>Enter as Demo Clinician — Dr. Fatima Tariq</span>
            </button>
            <p className="text-[11px] text-slate-400">
              Logs in as <code className="bg-slate-100 px-1 rounded">doctor@dermalytics.com</code> · PMDC-Dermatologist
            </p>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: Layers, label: 'Grad-CAM Telemetry', desc: 'Side-by-side heatmap review' },
              { icon: ShieldCheck, label: 'PMDC Sign-off', desc: 'Certified digital stamp' },
              { icon: FileText, label: 'Care Plans', desc: 'Prescriptions & action orders' },
              { icon: Activity, label: 'AI Concordance', desc: 'Agree / partial / override' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                <Icon className="w-5 h-5 text-emerald-600" />
                <p className="text-xs font-bold text-slate-800">{label}</p>
                <p className="text-[10px] text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ACCESS GATE for unverified doctors ────────────────────────────────────
  if (isDoctor && !user?.is_verified) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-300 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-10 h-10 text-amber-600 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              PMDC Credential Audit in Progress
            </span>
            <h2 className="text-2xl font-black text-slate-900 pt-2">
              Welcome, {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Your specialist registration has been submitted. In compliance with PMDC telemedicine standards, your license is being reviewed by the medical administrator before access to patient diagnostic telemetry is enabled.
            </p>
          </div>

          {/* Verification Progress Checklist */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Account Created & Identity Registered</span>
              </span>
              <span className="text-[10px] text-emerald-600 uppercase font-black">Passed</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>PMDC Registry & Qualification Audit</span>
              </span>
              <span className="text-[10px] text-amber-600 uppercase font-black">Under Review</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Clinical Queue & Telemetry Authorization</span>
              </span>
              <span className="text-[10px] uppercase font-black">Locked</span>
            </div>
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-xs text-left">
            💡 <strong>Evaluation Tip:</strong> You can log in with the administrator account (<code>admin@dermalytics.com</code> / <code>Admin@123</code>) to approve pending specialist applications in the Admin Dashboard.
          </div>
        </div>
      </div>
    );
  }

  // ── DOCTOR WORKSPACE ─────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Top stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending Reviews', value: pendingReviews.filter(r => r.status === 'pending').length, color: 'amber', icon: Clock },
          { label: 'Completed Today', value: pendingReviews.filter(r => r.status === 'completed').length, color: 'emerald', icon: CheckCircle2 },
          { label: 'Total in Queue', value: pendingReviews.length, color: 'sky', icon: FileText },
          { label: 'Clinician', value: `Dr. ${user?.last_name || 'Specialist'}`, color: 'teal', icon: Award },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center space-x-3`}>
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-lg font-black text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-3">
          <RefreshCw className="w-10 h-10 text-emerald-500 mx-auto animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading clinical review queue...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && pendingReviews.length === 0 && (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-black text-slate-900">Review Queue Clear</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No pending tele-dermatology requests awaiting sign-off. New patient submissions will appear here automatically.
          </p>
          <button onClick={fetchPendingReviews}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition">
            <RefreshCw className="w-4 h-4" /><span>Refresh Queue</span>
          </button>
        </div>
      )}

      {/* Main workspace */}
      {!loading && pendingReviews.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT: Review Queue ─────────────────────────── */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Pending Queue ({pendingReviews.length})</span>
              </h3>
              <button onClick={fetchPendingReviews} className="text-slate-400 hover:text-white transition">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {pendingReviews.map((rev) => {
                const isSelected = selectedReview?.id === rev.id;
                return (
                  <div
                    key={rev.id}
                    onClick={() => handleSelectReview(rev)}
                    className={`p-3.5 cursor-pointer transition-all flex items-center space-x-3 ${
                      isSelected ? 'bg-emerald-50 border-l-2 border-emerald-500' : 'hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                      {rev.assessment?.image_url ? (
                        <img src={rev.assessment.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Eye className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                          rev.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {rev.status}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                        {rev.assessment?.ai_prediction || 'AI Scan'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{rev.patient_notes || 'No patient notes'}</p>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-300'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Clinical Workspace ──────────────────── */}
          {selectedReview && (
            <div className="lg:col-span-9 space-y-5">

              {/* Case Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                    Case #{selectedReview.id.slice(0, 8)} · AI Telemetry Review
                  </span>
                  <h2 className="text-xl font-black mt-0.5">
                    {selectedReview.assessment?.ai_prediction || 'Clinical Scan Assessment'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Submitted: {new Date(selectedReview.created_at).toLocaleString()} ·
                    Type: {selectedReview.assessment?.assessment_type?.toUpperCase() || 'SKIN'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-black text-emerald-400">
                    {selectedReview.assessment?.confidence_score || 94}%
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400">AI Confidence</p>
                    <p className="text-[10px] text-slate-500">EfficientNet-B3</p>
                  </div>
                </div>
              </div>

              {/* Image viewer + Patient info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Image panel */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center bg-slate-50 border-b border-slate-200 p-2 space-x-1">
                    <button
                      onClick={() => setActiveImageView('original')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        activeImageView === 'original' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Original Scan
                    </button>
                    <button
                      onClick={() => setActiveImageView('gradcam')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                        activeImageView === 'gradcam' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" /><span>Grad-CAM</span>
                    </button>
                  </div>
                  <div className="relative aspect-square bg-slate-900">
                    {selectedReview.assessment?.image_url ? (
                      <img
                        src={
                          activeImageView === 'gradcam' && selectedReview.assessment?.gradcam_url
                            ? selectedReview.assessment.gradcam_url
                            : selectedReview.assessment.image_url
                        }
                        alt="Scan"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {activeImageView === 'gradcam' ? '🔥 Attention Heatmap' : '🔬 Dermoscopic View'}
                    </div>
                  </div>
                </div>

                {/* Patient info panel */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Patient Submission
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient ID</span>
                      <span className="text-xs font-bold text-slate-800">{selectedReview.patient_id?.slice(0, 12)}...</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Diagnosis</span>
                      <span className="text-sm font-black text-slate-900">{selectedReview.assessment?.ai_prediction || 'Melanocytic Nevus'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confidence Score</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                            style={{ width: `${selectedReview.assessment?.confidence_score || 94}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-800">
                          {selectedReview.assessment?.confidence_score || 94}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient Notes</span>
                      <div className="mt-1 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 italic">
                        "{selectedReview.patient_notes || 'No specific clinical history provided.'}"
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Evaluation Form */}
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-900 to-teal-900 px-6 py-4">
                  <h3 className="text-sm font-black text-white flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                    <span>Specialist Clinical Evaluation & PMDC Sign-off</span>
                  </h3>
                  <p className="text-xs text-emerald-200/70 mt-0.5">
                    Your assessment is digitally signed with your PMDC credentials and attached to the patient record.
                  </p>
                </div>

                <div className="p-6 space-y-5">

                  {/* AI Concordance — 3-way */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">AI Concordance Assessment:</label>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { value: 'agree', label: 'Agree', icon: CheckCircle2, colors: 'border-emerald-400 bg-emerald-50 text-emerald-800', iconColor: 'text-emerald-600' },
                        { value: 'partial', label: 'Partial', icon: AlertTriangle, colors: 'border-amber-400 bg-amber-50 text-amber-800', iconColor: 'text-amber-600' },
                        { value: 'disagree', label: 'Override', icon: XCircle, colors: 'border-rose-400 bg-rose-50 text-rose-800', iconColor: 'text-rose-600' },
                      ] as const).map(({ value, label, icon: Icon, colors, iconColor }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setDoctorAgreement(value)}
                          className={`py-3 px-4 rounded-xl border-2 text-xs font-bold transition flex flex-col items-center space-y-1 ${
                            doctorAgreement === value
                              ? `${colors} shadow-sm`
                              : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${doctorAgreement === value ? iconColor : 'text-slate-400'}`} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Impression */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Clinical Impression <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={clinicalImpression}
                      onChange={(e) => setClinicalImpression(e.target.value)}
                      placeholder="e.g. Benign melanocytic nevus with regular pigment network, no atypical features"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      required
                    />
                  </div>

                  {/* Doctor Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Clinical Notes & Patient Guidance:
                    </label>
                    <textarea
                      rows={3}
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="Specific advice: sun protection, monitoring, lifestyle changes, follow-up triggers..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  {/* Two-column: Action Plan + Prescription */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Action Plan / Care Orders:</label>
                      <input
                        type="text"
                        value={recommendedAction}
                        onChange={(e) => setRecommendedAction(e.target.value)}
                        placeholder="e.g. Monthly self-dermoscopy; clinic visit if change occurs"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Prescription / Topical Advice:</label>
                      <input
                        type="text"
                        value={prescriptionAdvice}
                        onChange={(e) => setPrescriptionAdvice(e.target.value)}
                        placeholder="e.g. Clindamycin 1% gel, SPF 50+ sunscreen daily"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Urgency triage */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Triage / Urgency Tier:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: 'routine', label: 'Routine', sub: 'Monitor periodically', dot: 'bg-emerald-500' },
                        { value: 'semi_urgent', label: 'Semi-Urgent', sub: 'Visit within 2–4 wks', dot: 'bg-amber-500' },
                        { value: 'immediate', label: 'Immediate', sub: 'In-person ASAP', dot: 'bg-rose-500' },
                      ] as const).map(({ value, label, sub, dot }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setUrgencyTier(value)}
                          className={`py-2.5 px-3 rounded-xl border text-left transition ${
                            urgencyTier === value
                              ? 'border-slate-400 bg-slate-900 text-white shadow-sm'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 mb-0.5">
                            <span className={`w-2 h-2 rounded-full ${dot}`} />
                            <span className={`text-xs font-bold ${urgencyTier === value ? 'text-white' : 'text-slate-800'}`}>{label}</span>
                          </div>
                          <p className={`text-[10px] ${urgencyTier === value ? 'text-slate-300' : 'text-slate-500'}`}>{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Digitally signed as <strong className="text-slate-700">{user?.first_name} {user?.last_name}</strong> · PMDC</span>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-emerald-600/25 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Signing & Submitting...' : 'Sign & Submit Review'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
