import React, { useState, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  BarChart3,
  GitCompare,
  Calendar,
  Filter,
  Info,
  ArrowUp,
  ArrowDown,
  Stethoscope,
  Layers,
  Eye,
  Flame,
  Trophy,
  Star,
  Video,
  Play,
  Download,
  Lock,
  Zap,
  Target,
} from 'lucide-react';
import { Assessment } from '../../types/assessment';
import {
  calculateStreak,
  calculateConsistency,
  computeBadges,
  getMilestoneMessage,
  Badge,
} from '../../utils/gamification';
import { generateTimelapse, downloadBlob } from '../../utils/timelapseGenerator';


// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: '2-digit' });

const isSkin = (a: Assessment) => a.type === 'skin';
const isHair = (a: Assessment) => a.type === 'hair';

const skinConfidence = (a: Assessment): number =>
  typeof a.prediction?.confidence === 'number' ? a.prediction.confidence : 0;
const hairDensity = (a: Assessment): number =>
  typeof a.prediction?.density_score === 'number' ? a.prediction.density_score : 0;

const RISK_COLOR: Record<string, string> = {
  low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  high: 'text-rose-700 bg-rose-50 border-rose-200',
};

// ─────────────────────────────────────────────
// Inline SVG Spark-line chart (no dependencies)
// ─────────────────────────────────────────────
interface SparkLineProps {
  values: number[];
  color: string;
  height?: number;
  width?: number;
  min?: number;
  max?: number;
}

const SparkLine: React.FC<SparkLineProps> = ({
  values,
  color,
  height = 60,
  width = 280,
  min = 0,
  max = 100,
}) => {
  if (values.length < 2) return null;
  const pad = 8;
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lastPt = pts[pts.length - 1].split(',');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((v, i) => {
        const [x, y] = pts[i].split(',').map(Number);
        return (
          <circle key={i} cx={x} cy={y} r={3.5} fill={color} stroke="white" strokeWidth="1.5" />
        );
      })}
      {/* Value label on last point */}
      <text
        x={Number(lastPt[0]) + 6}
        y={Number(lastPt[1]) + 4}
        fontSize="10"
        fontWeight="700"
        fill={color}
      >
        {values[values.length - 1].toFixed(1)}
      </text>
    </svg>
  );
};

// ─────────────────────────────────────────────
// Bar Chart (horizontal)
// ─────────────────────────────────────────────
interface BarChartProps {
  label: string;
  value: number;
  max?: number;
  color: string;
}

const HorizBar: React.FC<BarChartProps> = ({ label, value, max = 100, color }) => (
  <div className="flex items-center space-x-2 text-xs">
    <span className="w-24 text-slate-600 truncate">{label}</span>
    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }}
      />
    </div>
    <span className="w-10 text-right font-bold text-slate-700">{value.toFixed(1)}</span>
  </div>
);

// ─────────────────────────────────────────────
// Trend Badge
// ─────────────────────────────────────────────
const TrendBadge: React.FC<{ delta: number; unit?: string }> = ({ delta, unit = '' }) => {
  if (Math.abs(delta) < 0.1)
    return (
      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
        <Minus className="w-3 h-3" /> <span>Stable</span>
      </span>
    );
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
        up ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
      }`}
    >
      {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      <span>
        {up ? '+' : ''}
        {delta.toFixed(1)}
        {unit}
      </span>
    </span>
  );
};

// ─────────────────────────────────────────────
// Assessment Card (for comparison column)
// ─────────────────────────────────────────────
const CompareCard: React.FC<{ a: Assessment; onDeselect: () => void }> = ({ a, onDeselect }) => {
  const skin = isSkin(a);
  const pred = a.prediction;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Header strip */}
      <div
        className={`px-4 py-2 flex items-center justify-between ${
          skin ? 'bg-sky-600' : 'bg-teal-600'
        } text-white`}
      >
        <div className="flex items-center space-x-1.5 text-xs font-bold">
          {skin ? <Stethoscope className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{skin ? 'Skin Lesion' : 'Scalp & Hair'}</span>
        </div>
        <button
          onClick={onDeselect}
          className="text-white/70 hover:text-white text-xs hover:bg-white/20 px-1.5 py-0.5 rounded"
        >
          Remove
        </button>
      </div>

      {/* Scan preview */}
      <div className="w-full h-36 bg-slate-100 overflow-hidden relative">
        {a.image_url ? (
          <img src={a.image_url} alt="scan" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Eye className="w-8 h-8" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full">
          {fmt(a.created_at)}
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-2.5 flex-1">
        {skin ? (
          <>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Diagnosis</p>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                {pred?.class || pred?.full_name || 'N/A'}
              </p>
              <p className="text-[10px] text-slate-500">{pred?.code || ''}</p>
            </div>
            <HorizBar
              label="Confidence"
              value={pred?.confidence ?? 0}
              color="#0284c7"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600 font-medium">Risk Level</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  RISK_COLOR[pred?.risk_level ?? 'low'] || RISK_COLOR.low
                }`}
              >
                {pred?.risk_level ?? 'low'}
              </span>
            </div>
            {pred?.requires_consultation && (
              <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200 rounded-xl p-2 text-[10px] text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Consultation Recommended</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                Thinning Stage
              </p>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                {pred?.thinning_stage || 'N/A'}
              </p>
            </div>
            <HorizBar label="Density Score" value={pred?.density_score ?? 0} color="#0d9488" />
            <HorizBar
              label="Coverage %"
              value={pred?.metrics?.coverage_percentage ?? 0}
              color="#6366f1"
            />
            <HorizBar
              label="Follicle Density"
              value={pred?.metrics?.follicle_density ?? 0}
              color="#f59e0b"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600 font-medium">Severity</span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                {pred?.severity ?? '—'}
              </span>
            </div>
          </>
        )}
        {pred?.diagnostic_rationale && (
          <p className="text-[10px] text-slate-500 italic leading-relaxed border-t border-slate-100 pt-2">
            "{pred.diagnostic_rationale}"
          </p>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main ProgressTracker Component
// ─────────────────────────────────────────────
interface ProgressTrackerProps {
  history: Assessment[];
  onSelectAssessment?: (a: Assessment) => void;
}

type TabType = 'overview' | 'skin' | 'hair' | 'compare' | 'streaks';

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ history, onSelectAssessment }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [timelapseType, setTimelapseType] = useState<'all' | 'skin' | 'hair'>('all');
  const [timelapseLoading, setTimelapseLoading] = useState(false);
  const [timelapseProgress, setTimelapseProgress] = useState<{ stage: string; percent: number } | null>(null);
  const [timelapseError, setTimelapseError] = useState<string | null>(null);

  // ── Derived data ──────────────────────────────────
  const sorted = useMemo(
    () => [...history].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [history]
  );

  const skinItems = useMemo(() => sorted.filter(isSkin), [sorted]);
  const hairItems = useMemo(() => sorted.filter(isHair), [sorted]);

  const skinConfidences = skinItems.map(skinConfidence);
  const hairDensities = hairItems.map(hairDensity);

  const skinDelta =
    skinConfidences.length >= 2
      ? skinConfidences[skinConfidences.length - 1] - skinConfidences[0]
      : 0;
  const hairDelta =
    hairDensities.length >= 2
      ? hairDensities[hairDensities.length - 1] - hairDensities[0]
      : 0;

  const highRiskCount = skinItems.filter(
    (a) => a.prediction?.risk_level === 'high' || a.prediction?.requires_consultation
  ).length;

  // Class distribution
  const classDist = useMemo(() => {
    const map: Record<string, number> = {};
    skinItems.forEach((a) => {
      const cls = a.prediction?.class || a.prediction?.code || 'Unknown';
      map[cls] = (map[cls] || 0) + 1;
    });
    return Object.entries(map).sort((x, y) => y[1] - x[1]);
  }, [skinItems]);

  // Stage distribution for hair
  const stageDist = useMemo(() => {
    const map: Record<string, number> = {};
    hairItems.forEach((a) => {
      const s = a.prediction?.thinning_stage || 'Unknown';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).sort((x, y) => y[1] - x[1]);
  }, [hairItems]);

  // Compare selection helpers
  const selectedAssessments = history.filter((a) => selectedIds.includes(a.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  // ── Gamification ─────────────────────────────
  const streak = useMemo(() => calculateStreak(history), [history]);
  const consistency = useMemo(() => calculateConsistency(history), [history]);
  const badges = useMemo(() => computeBadges(history, streak, consistency), [history, streak, consistency]);
  const milestone = useMemo(() => getMilestoneMessage(streak, consistency, history.length), [streak, consistency, history]);

  // ── Timelapse handler ─────────────────────────
  const handleGenerateTimelapse = useCallback(async () => {
    setTimelapseLoading(true);
    setTimelapseError(null);
    setTimelapseProgress({ stage: 'Starting…', percent: 0 });
    try {
      const blob = await generateTimelapse(
        history,
        { type: timelapseType, durationSec: 5, fps: 24 },
        (p) => setTimelapseProgress(p)
      );
      const name = `dermalytics-journey-${timelapseType}-${new Date().toISOString().slice(0, 10)}.webm`;
      downloadBlob(blob, name);
    } catch (e: any) {
      setTimelapseError(e?.message ?? 'Timelapse generation failed.');
    } finally {
      setTimelapseLoading(false);
      setTimeout(() => setTimelapseProgress(null), 2000);
    }
  }, [history, timelapseType]);

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview',                         icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'skin',     label: `Skin Trend (${skinItems.length})`, icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'hair',     label: `Hair Trend (${hairItems.length})`, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'compare',  label: 'Compare Scans',                    icon: <GitCompare className="w-4 h-4" /> },
    { id: 'streaks',  label: 'Streaks & Badges',                 icon: <Flame className="w-4 h-4 text-orange-500" /> },
  ];

  const SKIN_COLORS: Record<string, string> = {
    mel: '#e11d48',
    nv: '#10b981',
    bcc: '#f59e0b',
    akiec: '#f97316',
    bkl: '#6366f1',
    df: '#8b5cf6',
    vasc: '#ec4899',
    Unknown: '#94a3b8',
  };

  // ─────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-100 to-teal-100 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-sky-600" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">No Assessments Yet</h2>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
          Run your first Skin Lesion AI or Scalp & Hair analysis to start tracking your progress over
          time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-sky-600" />
            <span>Track Your Progress</span>
          </h1>
          <p className="text-base text-slate-600 mt-1">
            See how your skin and hair are doing over time, compare past photos, and keep up your healthy routine!
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200 font-semibold">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>
            {history.length} total check{history.length !== 1 ? 's' : ''} ({skinItems.length} skin, {hairItems.length} hair)
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Checks Done',
            value: history.length,
            icon: <Layers className="w-6 h-6 text-sky-600" />,
            bg: 'bg-sky-50',
            border: 'border-sky-200',
          },
          {
            label: 'Skin Checks',
            value: skinItems.length,
            icon: <Stethoscope className="w-6 h-6 text-indigo-600" />,
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
          },
          {
            label: 'Hair & Scalp Checks',
            value: hairItems.length,
            icon: <Sparkles className="w-6 h-6 text-teal-600" />,
            bg: 'bg-teal-50',
            border: 'border-teal-200',
          },
          {
            label: 'Doctor Review Alerts',
            value: highRiskCount,
            icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
            bg: 'bg-rose-50',
            border: 'border-rose-200',
          },
        ].map((c) => (
          <div
            key={c.label}
            className={`${c.bg} border-2 ${c.border} rounded-3xl p-5 flex items-center space-x-4 shadow-sm`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xs flex-shrink-0">
              {c.icon}
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-600 font-bold leading-tight mt-0.5">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Skin Confidence Trend */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Skin Confidence Trend</h3>
              </div>
              <TrendBadge delta={skinDelta} unit="%" />
            </div>
            {skinItems.length >= 2 ? (
              <div className="overflow-hidden">
                <SparkLine values={skinConfidences} color="#0284c7" width={340} />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-2">
                  <span>{fmt(skinItems[0].created_at)}</span>
                  <span>{fmt(skinItems[skinItems.length - 1].created_at)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">
                Run at least 2 skin scans to see a trend line.
              </p>
            )}
          </div>

          {/* Hair Density Trend */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Hair Density Score Trend</h3>
              </div>
              <TrendBadge delta={hairDelta} unit=" pts" />
            </div>
            {hairItems.length >= 2 ? (
              <div className="overflow-hidden">
                <SparkLine values={hairDensities} color="#0d9488" width={340} />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-2">
                  <span>{fmt(hairItems[0].created_at)}</span>
                  <span>{fmt(hairItems[hairItems.length - 1].created_at)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">
                Run at least 2 scalp scans to see a density trend.
              </p>
            )}
          </div>

          {/* Skin Class Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Skin Lesion Class Distribution</h3>
            </div>
            {classDist.length > 0 ? (
              <div className="space-y-2">
                {classDist.map(([cls, count]) => (
                  <HorizBar
                    key={cls}
                    label={cls}
                    value={count}
                    max={skinItems.length}
                    color={SKIN_COLORS[cls.split(' ')[0]?.toLowerCase()] || '#6366f1'}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No skin scans yet.</p>
            )}
          </div>

          {/* Timeline of all scans */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Assessment Timeline</h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {[...sorted].reverse().map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelectAssessment?.(a)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all text-left group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSkin(a) ? 'bg-sky-100' : 'bg-teal-100'
                    }`}
                  >
                    {isSkin(a) ? (
                      <Stethoscope className="w-4 h-4 text-sky-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-teal-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {isSkin(a)
                        ? a.prediction?.class || a.prediction?.code || 'Skin Scan'
                        : a.prediction?.thinning_stage || 'Hair Scan'}
                    </p>
                    <p className="text-[10px] text-slate-400">{fmt(a.created_at)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isSkin(a) && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                          RISK_COLOR[a.prediction?.risk_level ?? 'low'] || RISK_COLOR.low
                        }`}
                      >
                        {a.prediction?.risk_level || 'low'}
                      </span>
                    )}
                    {isHair(a) && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-200">
                        {a.prediction?.density_score?.toFixed(0) ?? '—'} pts
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SKIN TREND TAB ── */}
      {activeTab === 'skin' && (
        <div className="space-y-5">
          {skinItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No skin scans found yet.</p>
            </div>
          ) : (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Skin Scans', value: skinItems.length.toString() },
                  {
                    label: 'Latest Confidence',
                    value: `${skinConfidences[skinConfidences.length - 1]?.toFixed(1) ?? '—'}%`,
                  },
                  {
                    label: 'Avg Confidence',
                    value: `${(skinConfidences.reduce((a, b) => a + b, 0) / (skinConfidences.length || 1)).toFixed(1)}%`,
                  },
                  { label: 'High-Risk Alerts', value: highRiskCount.toString() },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm"
                  >
                    <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Confidence chart */}
              {skinItems.length >= 2 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Prediction Confidence Over Time</h3>
                    <TrendBadge delta={skinDelta} unit="%" />
                  </div>
                  <div className="overflow-x-auto">
                    <SparkLine values={skinConfidences} color="#0284c7" width={560} height={80} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-2">
                    {skinItems.map((a, i) => (
                      <span key={i} className={i === 0 || i === skinItems.length - 1 ? '' : 'hidden sm:block'}>
                        {fmt(a.created_at)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed scan table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">All Skin Assessments</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-5 py-2.5 font-bold text-slate-600">Date</th>
                        <th className="text-left px-4 py-2.5 font-bold text-slate-600">Diagnosis</th>
                        <th className="text-left px-4 py-2.5 font-bold text-slate-600">Confidence</th>
                        <th className="text-left px-4 py-2.5 font-bold text-slate-600">Risk</th>
                        <th className="text-left px-4 py-2.5 font-bold text-slate-600">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skinItems.map((a, idx) => {
                        const conf = skinConfidence(a);
                        const prev = idx > 0 ? skinConfidence(skinItems[idx - 1]) : null;
                        const delta = prev !== null ? conf - prev : null;
                        return (
                          <tr
                            key={a.id}
                            className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => onSelectAssessment?.(a)}
                          >
                            <td className="px-5 py-3 text-slate-500">{fmt(a.created_at)}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">
                              {a.prediction?.class || a.prediction?.code || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-sky-500"
                                    style={{ width: `${conf}%` }}
                                  />
                                </div>
                                <span className="font-bold text-slate-700">{conf.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full border ${
                                  RISK_COLOR[a.prediction?.risk_level ?? 'low'] || RISK_COLOR.low
                                }`}
                              >
                                {a.prediction?.risk_level || 'low'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {delta !== null ? <TrendBadge delta={delta} unit="%" /> : <span className="text-slate-400">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── HAIR TREND TAB ── */}
      {activeTab === 'hair' && (
        <div className="space-y-5">
          {hairItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No scalp/hair scans found yet.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Hair Scans', value: hairItems.length.toString() },
                  {
                    label: 'Latest Density',
                    value: `${hairDensities[hairDensities.length - 1]?.toFixed(1) ?? '—'}`,
                  },
                  {
                    label: 'Avg Density',
                    value: `${(hairDensities.reduce((a, b) => a + b, 0) / (hairDensities.length || 1)).toFixed(1)}`,
                  },
                  {
                    label: 'Latest Coverage',
                    value: `${hairItems[hairItems.length - 1]?.prediction?.metrics?.coverage_percentage?.toFixed(0) ?? '—'}%`,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm"
                  >
                    <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Density chart */}
              {hairItems.length >= 2 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Density Score Over Time</h3>
                    <TrendBadge delta={hairDelta} unit=" pts" />
                  </div>
                  <div className="overflow-x-auto">
                    <SparkLine values={hairDensities} color="#0d9488" width={560} height={80} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-2">
                    {hairItems.map((a, i) => (
                      <span key={i} className={i === 0 || i === hairItems.length - 1 ? '' : 'hidden sm:block'}>
                        {fmt(a.created_at)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-metric comparison chart */}
              {hairItems.length >= 2 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Coverage % Over Time</h3>
                  <SparkLine
                    values={hairItems.map((a) => a.prediction?.metrics?.coverage_percentage ?? 0)}
                    color="#6366f1"
                    width={560}
                    height={70}
                  />
                </div>
              )}

              {/* Stage distribution */}
              {stageDist.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Thinning Stage Distribution</h3>
                  <div className="space-y-2">
                    {stageDist.map(([stage, count]) => (
                      <HorizBar
                        key={stage}
                        label={stage.length > 28 ? stage.substring(0, 28) + '…' : stage}
                        value={count}
                        max={hairItems.length}
                        color="#0d9488"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">All Hair Assessments</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-5 py-2.5 font-bold text-slate-600">Date</th>
                        <th className="text-left px-4 py-2.5 font-bold text-slate-600">Stage</th>
                        <th className="text-left px-4 py-2.5 font-bold text-slate-600">Density</th>
                        <th className="text-left px-4 py-2.5 font-bold text-slate-600">Coverage</th>
                        <th className="text-left px-4 py-2.5 font-bold text-slate-600">Δ Density</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hairItems.map((a, idx) => {
                        const dens = hairDensity(a);
                        const prev = idx > 0 ? hairDensity(hairItems[idx - 1]) : null;
                        const delta = prev !== null ? dens - prev : null;
                        return (
                          <tr
                            key={a.id}
                            className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => onSelectAssessment?.(a)}
                          >
                            <td className="px-5 py-3 text-slate-500">{fmt(a.created_at)}</td>
                            <td className="px-4 py-3 font-bold text-slate-800 max-w-[160px] truncate">
                              {a.prediction?.thinning_stage || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-teal-500"
                                    style={{ width: `${dens}%` }}
                                  />
                                </div>
                                <span className="font-bold text-slate-700">{dens.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {a.prediction?.metrics?.coverage_percentage?.toFixed(0) ?? '—'}%
                            </td>
                            <td className="px-4 py-3">
                              {delta !== null ? <TrendBadge delta={delta} unit=" pts" /> : <span className="text-slate-400">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── COMPARE TAB ── */}
      {activeTab === 'compare' && (
        <div className="space-y-5">
          {/* Instructions */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-sky-900">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">How to Compare</p>
              <p className="text-sky-700">
                Select up to <strong>3 assessments</strong> from the list below (skin or hair — mix freely) and they
                will appear side-by-side above for direct comparison.
              </p>
            </div>
          </div>

          {/* Side-by-side comparison cards */}
          {selectedAssessments.length > 0 && (
            <div
              className={`grid gap-4 ${
                selectedAssessments.length === 1
                  ? 'grid-cols-1 max-w-sm'
                  : selectedAssessments.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-3'
              }`}
            >
              {selectedAssessments.map((a) => (
                <CompareCard
                  key={a.id}
                  a={a}
                  onDeselect={() => setSelectedIds((prev) => prev.filter((x) => x !== a.id))}
                />
              ))}
            </div>
          )}

          {/* Selection picker grid */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Select Scans to Compare{' '}
                <span className="text-slate-400 font-medium">({selectedIds.length}/3 selected)</span>
              </h3>
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-50">
              {[...sorted].reverse().map((a) => {
                const skin = isSkin(a);
                const selected = selectedIds.includes(a.id);
                const disabled = !selected && selectedIds.length >= 3;
                return (
                  <button
                    key={a.id}
                    onClick={() => !disabled && toggleSelect(a.id)}
                    disabled={disabled}
                    className={`w-full flex items-center space-x-4 px-5 py-3.5 text-left transition-all ${
                      selected
                        ? 'bg-sky-50 border-l-4 border-sky-500'
                        : disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selected
                          ? 'bg-sky-600 border-sky-600'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>

                    {/* Type icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        skin ? 'bg-sky-100' : 'bg-teal-100'
                      }`}
                    >
                      {skin ? (
                        <Stethoscope className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-teal-600" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {skin
                          ? a.prediction?.class || a.prediction?.code || 'Skin Scan'
                          : a.prediction?.thinning_stage || 'Hair Scan'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {skin ? 'Skin Lesion' : 'Scalp & Hair'} · {fmt(a.created_at)}
                      </p>
                    </div>

                    {/* Score badge */}
                    <div className="flex-shrink-0">
                      {skin ? (
                        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          {a.prediction?.confidence?.toFixed(1) ?? '—'}% conf
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          {a.prediction?.density_score?.toFixed(0) ?? '—'} density
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* ── STREAKS & BADGES TAB ── */}
      {activeTab === 'streaks' && (
        <div className="space-y-5">

          {/* Milestone Banner */}
          {milestone && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-orange-200 rounded-2xl p-4 flex items-start space-x-3">
              <span className="text-2xl leading-none mt-0.5">🎉</span>
              <div>
                <p className="text-sm font-extrabold text-orange-900">Milestone Reached!</p>
                <p className="text-xs text-orange-800 mt-0.5 leading-relaxed">{milestone}</p>
              </div>
            </div>
          )}

          {/* Streak & Consistency Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Current Streak */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-1 col-span-1">
              <Flame className="w-7 h-7 text-orange-500" />
              <p className="text-3xl font-black text-orange-700">{streak.currentStreak}</p>
              <p className="text-[11px] text-orange-600 font-bold uppercase tracking-wide">Day Streak</p>
              {streak.currentStreak >= 7 && (
                <span className="text-[10px] text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-bold">🔥 On fire!</span>
              )}
            </div>

            {/* Longest Streak */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-1">
              <Trophy className="w-7 h-7 text-rose-500" />
              <p className="text-3xl font-black text-rose-700">{streak.longestStreak}</p>
              <p className="text-[11px] text-rose-600 font-bold uppercase tracking-wide">Best Streak</p>
            </div>

            {/* Consistency Score */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-1">
              <Target className="w-7 h-7 text-emerald-500" />
              <p className="text-3xl font-black text-emerald-700">{consistency}%</p>
              <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wide">Consistency</p>
            </div>

            {/* Days Since Last Scan */}
            <div className={`rounded-2xl p-4 flex flex-col items-center text-center space-y-1 border ${
              streak.daysSinceLastScan === 0
                ? 'bg-sky-50 border-sky-200'
                : streak.daysSinceLastScan <= 7
                ? 'bg-slate-50 border-slate-200'
                : 'bg-rose-50 border-rose-200'
            }`}>
              <Calendar className={`w-7 h-7 ${streak.daysSinceLastScan === 0 ? 'text-sky-500' : streak.daysSinceLastScan <= 7 ? 'text-slate-500' : 'text-rose-500'}`} />
              <p className={`text-3xl font-black ${streak.daysSinceLastScan === 0 ? 'text-sky-700' : streak.daysSinceLastScan <= 7 ? 'text-slate-700' : 'text-rose-700'}`}>
                {streak.daysSinceLastScan}
              </p>
              <p className={`text-[11px] font-bold uppercase tracking-wide ${streak.daysSinceLastScan === 0 ? 'text-sky-600' : streak.daysSinceLastScan <= 7 ? 'text-slate-500' : 'text-rose-600'}`}>
                {streak.daysSinceLastScan === 0 ? 'Scanned Today!' : 'Days Since Scan'}
              </p>
            </div>
          </div>

          {/* Consistency Progress Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Weekly Consistency Score</h3>
              </div>
              <span className="text-sm font-extrabold text-emerald-700">{consistency}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  consistency >= 90 ? 'bg-emerald-500' : consistency >= 60 ? 'bg-amber-500' : 'bg-rose-400'
                }`}
                style={{ width: `${consistency}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {consistency >= 90
                ? '🏆 Excellent — you scan almost every week. Keep it up!'
                : consistency >= 60
                ? '📊 Good consistency. Try to scan every 7 days to reach 90%+'
                : '💡 Scan weekly to build a strong health baseline and improve this score.'}
            </p>
          </div>

          {/* Next Scan Reminder */}
          {streak.lastScanDate && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-sky-900">Recommended Next Scan</p>
                  <p className="text-sm font-extrabold text-sky-700">
                    {new Date(streak.nextScanDue).toLocaleDateString('en-PK', { weekday: 'long', day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                new Date(streak.nextScanDue) <= new Date()
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                {new Date(streak.nextScanDue) <= new Date() ? '⚠️ Overdue' : '✓ Upcoming'}
              </span>
            </div>
          )}

          {/* Badges Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Achievement Badges</h3>
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                {badges.filter(b => b.unlocked).length}/{badges.length} unlocked
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map((badge) => {
                const TIER_RING: Record<string, string> = {
                  bronze:   'border-amber-300 bg-amber-50',
                  silver:   'border-slate-400 bg-slate-50',
                  gold:     'border-yellow-400 bg-yellow-50',
                  platinum: 'border-sky-400 bg-sky-50',
                };
                const TIER_LABEL: Record<string, string> = {
                  bronze: 'text-amber-700', silver: 'text-slate-600', gold: 'text-yellow-700', platinum: 'text-sky-700',
                };
                return (
                  <div
                    key={badge.id}
                    className={`rounded-2xl border-2 p-3 flex flex-col items-center text-center space-y-1.5 transition-all ${
                      badge.unlocked
                        ? TIER_RING[badge.tier]
                        : 'border-slate-200 bg-slate-50 opacity-40 grayscale'
                    }`}
                    title={badge.description}
                  >
                    <span className="text-2xl">{badge.unlocked ? badge.emoji : '🔒'}</span>
                    <p className={`text-[11px] font-extrabold leading-tight ${badge.unlocked ? TIER_LABEL[badge.tier] : 'text-slate-400'}`}>
                      {badge.name}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">{badge.description}</p>
                    {badge.unlocked && (
                      <span className={`text-[9px] uppercase font-black tracking-wide ${TIER_LABEL[badge.tier]}`}>
                        {badge.tier}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── TIMELAPSE GENERATOR ── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Journey Timelapse Video</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compile your chronological assessments into a smooth 5-second timelapse video with
              crossfade transitions. Downloads as a <code className="text-indigo-700 bg-indigo-50 px-1 rounded text-[11px]">.webm</code> file.
            </p>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">Filter by:</span>
              {(['all', 'skin', 'hair'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimelapseType(t)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    timelapseType === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {t === 'all' ? 'All Scans' : t === 'skin' ? '🔬 Skin' : '💈 Hair'}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Info className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span>
                {history.filter(a => timelapseType === 'all' || a.type === timelapseType).length} scan
                {history.filter(a => timelapseType === 'all' || a.type === timelapseType).length !== 1 ? 's' : ''} selected.
                {history.filter(a => timelapseType === 'all' || a.type === timelapseType).length < 2 && (
                  <span className="text-rose-600 font-semibold"> Need at least 2 to generate.</span>
                )}
              </span>
            </div>

            {/* Progress indicator */}
            {timelapseProgress && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{timelapseProgress.stage}</span>
                  <span className="text-indigo-700 font-bold">{timelapseProgress.percent}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${timelapseProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {timelapseError && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{timelapseError}</span>
              </div>
            )}

            <button
              onClick={handleGenerateTimelapse}
              disabled={
                timelapseLoading ||
                history.filter(a => timelapseType === 'all' || a.type === timelapseType).length < 2
              }
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${
                timelapseLoading || history.filter(a => timelapseType === 'all' || a.type === timelapseType).length < 2
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:scale-[1.02]'
              }`}
            >
              {timelapseLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Timelapse…</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Generate 5-Second Journey Video</span>
                  <Download className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
