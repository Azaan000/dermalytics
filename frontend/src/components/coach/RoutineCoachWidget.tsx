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

// UV Level Color Map
const UV_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  Low:       { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', bar: 'bg-emerald-500' },
  Moderate:  { bg: 'bg-yellow-50 border-yellow-200',  text: 'text-yellow-800',  bar: 'bg-yellow-500' },
  High:      { bg: 'bg-orange-50 border-orange-200',  text: 'text-orange-800',  bar: 'bg-orange-500' },
  'Very High': { bg: 'bg-rose-50 border-rose-200',    text: 'text-rose-800',    bar: 'bg-rose-500' },
  Extreme:   { bg: 'bg-purple-50 border-purple-200',  text: 'text-purple-800',  bar: 'bg-purple-500' },
};

const URGENCY_STYLE: Record<string, string> = {
  info:    'bg-sky-50 border-sky-200 text-sky-950',
  warning: 'bg-amber-50 border-amber-200 text-amber-950',
  danger:  'bg-rose-50 border-rose-200 text-rose-950',
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
      setError('Could not load local weather. Showing general daily tips.');
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

  return (
    <div className="fixed bottom-6 left-6 z-50 print:hidden font-sans">
      
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setHasUnread(false); }}
          className="group flex items-center space-x-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-5 py-4 rounded-full shadow-2xl hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300 border-2 border-white/30"
          title="Open Daily Routine Coach"
        >
          <div className="relative">
            <Sun className="w-7 h-7" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-sm font-black tracking-wide block">Daily Routine Coach</span>
            <span className="text-xs text-amber-100 font-bold block">
              {weather ? `Sun Level: ${weather.uv_level} (UV ${weather.uv_index})` : 'Daily Health Tips'}
            </span>
          </div>
        </button>
      )}

      {/* Coach Panel */}
      {isOpen && (
        <div className="w-[94vw] sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] text-base">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Your Daily Routine Coach</h3>
                  <p className="text-xs text-orange-100 font-medium">Easy daily tips for healthy skin and hair</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={loadWeather}
                  disabled={loading}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  title="Refresh weather"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* UV & Weather Strip */}
            {weather && (
              <div className="mt-3.5 bg-white/20 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-orange-100" />
                  <span className="text-orange-100">
                    Location Weather
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-white font-bold text-sm">
                  <span>🌡️ {weather.temperature}°C</span>
                  <span>☀️ UV {weather.uv_index} ({weather.uv_level})</span>
                </div>
              </div>
            )}

            {/* UV level bar */}
            {weather && (
              <div className="mt-2.5 h-2 bg-white/25 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (weather.uv_index / 12) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setActiveTab('nudges')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-extrabold transition-all ${
                activeTab === 'nudges'
                  ? 'text-orange-600 border-b-2 border-orange-500 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Daily Tips & Sun Alert</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-extrabold transition-all ${
                activeTab === 'faq'
                  ? 'text-sky-600 border-b-2 border-sky-500 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Simple Q&A Guide</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">

            {/* NUDGES TAB */}
            {activeTab === 'nudges' && (
              <div className="p-5 space-y-4">

                {/* Today's routine tip */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                      Today's Tip · {WEEKLY_TIPS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].day}
                    </span>
                  </div>
                  <p className="text-sm text-amber-950 leading-relaxed font-semibold">{todayTip}</p>
                </div>

                {/* Error notice */}
                {error && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-600 flex items-center space-x-2">
                    <Info className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Loading spinner */}
                {loading && (
                  <div className="flex items-center justify-center py-6 space-x-2 text-slate-500 text-sm font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Checking today's sun and weather…</span>
                  </div>
                )}

                {/* Nudge cards */}
                {nudges.map((nudge, i) => (
                  <div
                    key={i}
                    className={`rounded-3xl border-2 p-4 space-y-1.5 ${URGENCY_STYLE[nudge.urgency]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl leading-none">{nudge.emoji}</span>
                        <span className="text-xs font-black uppercase tracking-wide">
                          {nudge.title}
                        </span>
                      </div>
                      {nudge.urgency === 'danger' && (
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm leading-relaxed font-medium">{nudge.message}</p>
                  </div>
                ))}

                {/* Weekly schedule */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>7-Day Simple Habit Guide</span>
                  </p>
                  <div className="space-y-2">
                    {WEEKLY_TIPS.map((t, i) => {
                      const isToday = WEEKLY_TIPS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].day === t.day;
                      return (
                        <div
                          key={i}
                          className={`flex items-start space-x-3 rounded-2xl px-3 py-2.5 transition-all ${
                            isToday ? 'bg-amber-100/70 border border-amber-300' : 'bg-white'
                          }`}
                        >
                          <span
                            className={`text-xs font-black w-10 flex-shrink-0 pt-0.5 ${
                              isToday ? 'text-amber-800' : 'text-slate-400'
                            }`}
                          >
                            {t.day.substring(0, 3).toUpperCase()}
                          </span>
                          <p className={`text-xs leading-relaxed ${isToday ? 'text-amber-950 font-bold' : 'text-slate-700'}`}>
                            {t.tip}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* FAQ TAB */}
            {activeTab === 'faq' && (
              <div className="p-5 space-y-3">
                <div className="flex items-center space-x-2 px-1 mb-2">
                  <MessageCircle className="w-4 h-4 text-sky-600" />
                  <p className="text-sm text-slate-600 font-medium">
                    Tap any question below for an easy, plain-English answer:
                  </p>
                </div>
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left font-bold text-slate-900 text-sm hover:bg-slate-100"
                    >
                      <span className="pr-3 leading-snug">{faq.q}</span>
                      {openFaq === i ? (
                        <ChevronUp className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-200 bg-white">
                        <p className="text-sm text-slate-700 leading-relaxed mt-2 font-medium">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
