import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  Wind,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  HelpCircle,
  Bell,
  AlertTriangle,
  Info,
  Zap,
  RefreshCw,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import {
  fetchWeatherData,
  getCoordinates,
  getTimeBasedNudges,
  getUVNudge,
  WEEKLY_TIPS,
  FAQS,
  WeatherData,
  UVNudge,
} from '../../utils/uvWeather';

// ─────────────────────────────────────────────
// UV Level Color Map
// ─────────────────────────────────────────────
const UV_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  Low:       { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', bar: 'bg-emerald-500' },
  Moderate:  { bg: 'bg-yellow-50 border-yellow-200',  text: 'text-yellow-800',  bar: 'bg-yellow-500' },
  High:      { bg: 'bg-orange-50 border-orange-200',  text: 'text-orange-800',  bar: 'bg-orange-500' },
  'Very High': { bg: 'bg-rose-50 border-rose-200',    text: 'text-rose-800',    bar: 'bg-rose-500' },
  Extreme:   { bg: 'bg-purple-50 border-purple-200',  text: 'text-purple-800',  bar: 'bg-purple-500' },
};

const URGENCY_STYLE: Record<string, string> = {
  info:    'bg-sky-50 border-sky-200 text-sky-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  danger:  'bg-rose-50 border-rose-200 text-rose-900',
};

type Tab = 'nudges' | 'faq';

export const RoutineCoachWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('nudges');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [nudges, setNudges] = useState<UVNudge[]>([]);
  const [todayTip, setTodayTip] = useState('');
  const [hasUnread, setHasUnread] = useState(true);

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { lat, lon } = await getCoordinates();
      const data = await fetchWeatherData(lat, lon);
      setWeather(data);
      const hour = new Date().getHours();
      const timeNudges = getTimeBasedNudges(hour);
      const uvNudge = getUVNudge(data.uv_index, data.uv_level);
      setNudges([uvNudge, ...timeNudges]);
    } catch (e) {
      setError('Could not load weather data. Showing time-based tips only.');
      const hour = new Date().getHours();
      setNudges(getTimeBasedNudges(hour));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const dayIndex = new Date().getDay(); // 0 = Sunday
    setTodayTip(WEEKLY_TIPS[dayIndex === 0 ? 6 : dayIndex - 1].tip);
    loadWeather();
  }, [loadWeather]);

  const uvColors = weather ? UV_COLORS[weather.uv_level] ?? UV_COLORS.Low : null;

  return (
    <div className="fixed bottom-6 left-6 z-50 print:hidden font-sans">
      
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setHasUnread(false); }}
          className="group flex items-center space-x-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300 border border-white/20"
          title="Open Daily Routine Coach"
        >
          <div className="relative">
            <Sun className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-black tracking-wide block">Routine Coach</span>
            <span className="text-[10px] text-amber-100 font-medium block">
              {weather ? `UV ${weather.uv_index} · ${weather.uv_level}` : 'Daily health nudges'}
            </span>
          </div>
        </button>
      )}

      {/* Coach Panel */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold">Daily Routine Coach</h3>
                  <p className="text-[10px] text-orange-100 font-medium">Context-aware skin & hair guidance</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={loadWeather}
                  disabled={loading}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Refresh weather"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* UV & Weather Strip */}
            {weather && (
              <div className="mt-3 bg-white/15 rounded-2xl px-3 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-100" />
                  <span className="text-orange-100">
                    {weather.lat.toFixed(2)}°, {weather.lon.toFixed(2)}°
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-white font-semibold">
                  <span>🌡️ {weather.temperature}°C</span>
                  <span>☀️ UV {weather.uv_index} ({weather.uv_level})</span>
                </div>
              </div>
            )}

            {/* UV level bar */}
            {weather && (
              <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/70 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (weather.uv_index / 12) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50">
            <button
              onClick={() => setActiveTab('nudges')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'nudges'
                  ? 'text-orange-600 border-b-2 border-orange-500 bg-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Daily Nudges</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'faq'
                  ? 'text-sky-600 border-b-2 border-sky-500 bg-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ Bot</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── NUDGES TAB ── */}
            {activeTab === 'nudges' && (
              <div className="p-4 space-y-3">

                {/* Today's routine tip */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                      Today's Routine Tip · {WEEKLY_TIPS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].day}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">{todayTip}</p>
                </div>

                {/* Error notice */}
                {error && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-500 flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Loading spinner */}
                {loading && (
                  <div className="flex items-center justify-center py-6 space-x-2 text-slate-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Checking local UV & weather…</span>
                  </div>
                )}

                {/* Nudge cards */}
                {nudges.map((nudge, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border p-3.5 space-y-1 ${URGENCY_STYLE[nudge.urgency]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-base leading-none">{nudge.emoji}</span>
                        <span className="text-[11px] font-black uppercase tracking-wide">
                          {nudge.title}
                        </span>
                      </div>
                      {nudge.urgency === 'danger' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs leading-relaxed">{nudge.message}</p>
                    {nudge.action && (
                      <button className="text-[11px] font-bold underline underline-offset-2 mt-1 opacity-80 hover:opacity-100">
                        → {nudge.action}
                      </button>
                    )}
                  </div>
                ))}

                {/* Weekly schedule */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-2.5 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    <span>Weekly Routine</span>
                  </p>
                  <div className="space-y-2">
                    {WEEKLY_TIPS.map((t, i) => {
                      const isToday = WEEKLY_TIPS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].day === t.day;
                      return (
                        <div
                          key={i}
                          className={`flex items-start space-x-2.5 rounded-xl px-2.5 py-2 ${
                            isToday ? 'bg-amber-50 border border-amber-200' : ''
                          }`}
                        >
                          <span
                            className={`text-[10px] font-black w-8 flex-shrink-0 ${
                              isToday ? 'text-amber-700' : 'text-slate-400'
                            }`}
                          >
                            {t.day.substring(0, 3).toUpperCase()}
                          </span>
                          <p className={`text-[11px] leading-relaxed ${isToday ? 'text-amber-900 font-semibold' : 'text-slate-600'}`}>
                            {t.tip}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ── FAQ TAB ── */}
            {activeTab === 'faq' && (
              <div className="p-4 space-y-2">
                <div className="flex items-center space-x-2 px-1 mb-3">
                  <MessageCircle className="w-4 h-4 text-sky-600" />
                  <p className="text-xs text-slate-600 font-medium">
                    Tap a question for an instant clinical answer.
                  </p>
                </div>
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-xs font-bold text-slate-800 pr-4 leading-snug">{faq.q}</span>
                      {openFaq === i ? (
                        <ChevronUp className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-3.5 pt-0 border-t border-slate-200 bg-white">
                        <p className="text-[11px] text-slate-700 leading-relaxed mt-2">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
                <div className="text-center pt-2">
                  <p className="text-[10px] text-slate-400">
                    Have a deeper question? Use the{' '}
                    <span className="text-sky-600 font-semibold">AI Chat (→)</span> for full conversational answers.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
