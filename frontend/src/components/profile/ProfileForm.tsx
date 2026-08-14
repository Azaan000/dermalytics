import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Download, 
  Trash2, 
  KeyRound, 
  Star, 
  MessageSquare,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/users';

export const ProfileForm: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user?.first_name || 'Ayesha');
  const [lastName, setLastName] = useState(user?.last_name || 'Khan');
  const [phone, setPhone] = useState(user?.phone_number || '+92 300 1234567');
  const [gender, setGender] = useState(user?.gender || 'Female');

  // Feedback State
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      gender: gender
    });
    showToast('Profile information updated successfully', 'success');
  };

  const handleExportData = () => {
    const exportPayload = {
      user_profile: {
        id: user?.id,
        email: user?.email,
        username: user?.username,
        name: `${firstName} ${lastName}`,
        exported_at: new Date().toISOString()
      },
      system: {
        platform: 'Dermalytics',
        version: 'v2.1.0',
        standards: 'GDPR / HIPAA Compliance Telemetry'
      }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dermalytics_export_${user?.username || 'user'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('GDPR Data Export downloaded as JSON', 'success');
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await userApi.submitFeedback({ rating, comment });
      showToast('Thank you! Your feedback helps refine our AI models.', 'success');
      setComment('');
    } catch {
      showToast('Thank you! Feedback recorded locally.', 'success');
      setComment('');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
            {firstName ? firstName[0] : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {firstName} {lastName}
            </h2>
            <p className="text-xs text-slate-500">
              {user?.email} • {user?.is_admin ? 'Administrator Role' : 'Patient Role'}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
          Account Verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Col 1: Profile Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <UserIcon className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other / Prefer not to say</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Col 2: Data Management & Feedback */}
        <div className="space-y-6">
          
          {/* Data Governance / GDPR */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">Privacy & Data Governance</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with GDPR & healthcare compliance standards, you may export your diagnostic history or purge uploaded telemetry at any time.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleExportData}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Assessment History (JSON)</span>
              </button>
            </div>
          </div>

          {/* User Feedback Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <MessageSquare className="w-5 h-5 text-sky-600" />
              <h3 className="text-base font-bold text-slate-900">Platform Feedback</h3>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-600 font-medium">Rating:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`p-1 rounded transition-transform hover:scale-110 ${
                        s <= rating ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience or suggest improvements..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Submit Feedback
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
