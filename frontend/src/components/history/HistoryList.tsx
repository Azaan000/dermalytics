import React, { useState } from 'react';
import { 
  Clock, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  Eye, 
  SplitSquareVertical, 
  TrendingUp, 
  CheckSquare, 
  Square,
  Sparkles,
  Stethoscope,
  X
} from 'lucide-react';
import { Assessment } from '../../types/assessment';
import { formatDate, getRiskBadgeColor } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { SAMPLE_CASES } from '../../utils/sampleData';

interface HistoryListProps {
  history: Assessment[];
  onSelectAssessment: (assessment: Assessment) => void;
  onDeleteAssessment: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelectAssessment,
  onDeleteAssessment
}) => {
  const [filterType, setFilterType] = useState<'all' | 'skin' | 'hair'>('all');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const { showToast } = useToast();

  const filtered = history.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        showToast('You can compare up to 3 scans simultaneously', 'warning');
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const compareAssessments = history.filter((a) => selectedForCompare.includes(a.id));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-sky-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Longitudinal Assessment Timeline
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track condition stability, hair density trends, and compare dermatoscopic scans across visits.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 text-xs font-semibold">
            {(['all', 'skin', 'hair'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filterType === t
                    ? 'bg-white text-sky-700 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All Scans' : t === 'skin' ? 'Skin Lesions' : 'Scalp & Hair'}
              </button>
            ))}
          </div>

          {selectedForCompare.length >= 2 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center space-x-1.5"
            >
              <SplitSquareVertical className="w-4 h-4" />
              <span>Compare ({selectedForCompare.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Trajectory Trend Card */}
      {history.length > 0 && (
        <div className="bg-gradient-to-br from-sky-900 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Longitudinal Health Telemetry</span>
              </span>
              <h3 className="text-lg font-black tracking-tight">
                {history.length} Assessment Records Linked to Profile
              </h3>
              <p className="text-xs text-slate-300 max-w-lg">
                Consistent monthly scans enable accurate progression tracking and objective change detection for your dermatologist.
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
              <div>
                <span className="text-[10px] text-sky-300 block uppercase font-bold">Skin Scans</span>
                <span className="text-lg font-black text-white">{history.filter(h => h.type === 'skin').length}</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <span className="text-[10px] text-teal-300 block uppercase font-bold">Hair Scans</span>
                <span className="text-lg font-black text-white">{history.filter(h => h.type === 'hair').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Assessment Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload your first skin lesion or scalp image to start tracking your longitudinal health metrics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isSkin = item.type === 'skin';
            const pred = item.prediction || {};
            const isSelected = selectedForCompare.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 hover:shadow-md ${
                  isSelected ? 'border-sky-500 ring-2 ring-sky-400' : 'border-slate-200'
                }`}
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isSkin ? (
                      <span className="p-1.5 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold flex items-center space-x-1">
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Skin</span>
                      </span>
                    ) : (
                      <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Hair</span>
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCompare(item.id)}
                    className={`p-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-sky-100 text-sky-700 font-bold'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    <span className="text-[10px]">Compare</span>
                  </button>
                </div>

                {/* Thumbnail & Prediction */}
                <div className="flex space-x-3 items-center">
                  <img
                    src={item.thumbnail_url || item.thumbnail || item.image_url}
                    alt="Thumbnail"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {isSkin ? (pred.class || 'Skin Lesion') : (pred.thinning_stage || 'Scalp Assessment')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Confidence: <span className="font-bold text-sky-600">{pred.confidence || pred.density_score || 90}%</span>
                    </p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 ${getRiskBadgeColor(pred.risk_level || pred.severity)}`}>
                      {pred.risk_level || pred.severity || 'Normal'}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectAssessment(item)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Diagnostic Details</span>
                  </button>

                  <button
                    onClick={() => onDeleteAssessment(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SplitSquareVertical className="w-5 h-5 text-sky-400" />
                <span className="text-sm font-bold">Scan-to-Scan Longitudinal Comparison</span>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {compareAssessments.map((ca, idx) => (
                <div key={ca.id} className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      Scan #{idx + 1}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {formatDate(ca.created_at)}
                    </span>
                  </div>
                  <img
                    src={ca.image_url}
                    alt="Scan"
                    className="w-full h-40 object-cover rounded-xl border border-slate-200"
                  />
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-slate-900">
                      {ca.prediction?.class || ca.prediction?.thinning_stage}
                    </h5>
                    <p className="text-xs text-slate-600">
                      Confidence: <strong>{ca.prediction?.confidence || ca.prediction?.density_score}%</strong>
                    </p>
                    <p className="text-xs text-slate-500 leading-snug pt-1">
                      {ca.prediction?.diagnostic_rationale || ca.prediction?.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
