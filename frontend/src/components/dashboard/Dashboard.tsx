import React from 'react';
import { 
  Activity, 
  Stethoscope, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp,
  Camera,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Assessment } from '../../types/assessment';
import { formatDate, getRiskBadgeColor } from '../../utils/formatters';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  recentAssessments: Assessment[];
  onSelectAssessment: (assessment: Assessment) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  recentAssessments,
  onSelectAssessment
}) => {
  const { user } = useAuth();

  const skinCount = recentAssessments.filter(a => a.type === 'skin').length;
  const hairCount = recentAssessments.filter(a => a.type === 'hair').length;
  const highRiskCount = recentAssessments.filter(a => (a.prediction?.risk_level === 'high' || a.prediction?.severity === 'High')).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Patient Welcome Hero */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-teal-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-sky-200 border border-white/10">
            <Activity className="w-3.5 h-3.5 text-sky-300" />
            <span>AI-Driven Telemetry & Grad-CAM Explainability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {user?.first_name || user?.username || 'Patient'}
          </h1>
          <p className="text-sm text-sky-100 leading-relaxed">
            Monitor skin lesion changes and track scalp hair density progression over time using clinical deep learning models.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('skin-analysis')}
              className="px-5 py-2.5 bg-white text-sky-800 hover:bg-sky-50 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center space-x-2"
            >
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span>Analyze Skin Lesion</span>
            </button>
            <button
              onClick={() => onNavigate('hair-analysis')}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Hair & Scalp</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-6 opacity-15 hidden md:block">
          <Activity className="w-48 h-48 text-white" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Scans</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{recentAssessments.length}</h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Profile Active</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Skin Lesions</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{skinCount}</h3>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">HAM10000 7-Class</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scalp Assessments</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{hairCount}</h3>
            <span className="text-[10px] text-teal-600 font-medium mt-0.5 block">Trichology Telemetry</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Triage Flags</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{highRiskCount}</h3>
            <span className={`text-[10px] font-bold mt-0.5 block ${highRiskCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              {highRiskCount > 0 ? 'Requires Specialist Review' : 'All Clear'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Launch & Recent Assessments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Recent Assessments */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-sky-600" />
              <h3 className="text-base font-bold text-slate-900">Recent Health Scans</h3>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentAssessments.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Camera className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No assessments performed yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAssessments.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  onClick={() => onSelectAssessment(a)}
                  className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 bg-slate-50/60 hover:bg-white transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={a.thumbnail_url || a.thumbnail || a.image_url}
                      alt="Scan"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {a.type === 'skin' ? a.prediction?.class : a.prediction?.thinning_stage}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {a.type === 'skin' ? 'Skin Lesion' : 'Scalp Trichoscopy'} • {formatDate(a.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getRiskBadgeColor(a.prediction?.risk_level || a.prediction?.severity)}`}>
                      {a.prediction?.risk_level || a.prediction?.severity || 'Low'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Guidelines & Self-Monitoring Tips */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-sky-50/70 border border-sky-100 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-sky-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                Self-Monitoring Guide
              </h4>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-white rounded-xl border border-sky-100 space-y-1">
                <span className="font-bold text-sky-950 block">Skin: The ABCDE Rule</span>
                <p className="text-[11px] text-slate-600">
                  Track <strong>A</strong>symmetry, <strong>B</strong>order irregularities, <strong>C</strong>olor variation, <strong>D</strong>iameter &gt;6mm, and <strong>E</strong>volution.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-sky-100 space-y-1">
                <span className="font-bold text-sky-950 block">Scalp: Consistent Lighting</span>
                <p className="text-[11px] text-slate-600">
                  Capture scalp scans in uniform natural light with hair parted consistently to track monthly density changes.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
