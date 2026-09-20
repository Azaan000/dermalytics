import { Assessment } from '../types/assessment';

// ────────────────────────────────────────────────────────────
// BADGE DEFINITIONS
// ────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked: boolean;
}

const BADGE_DEFS: Omit<Badge, 'unlocked'>[] = [
  { id: 'first_scan',     name: 'First Step',        emoji: '🔬', tier: 'bronze',   description: 'Completed your very first assessment.' },
  { id: 'scan_5',         name: 'Getting Started',   emoji: '🌱', tier: 'bronze',   description: 'Completed 5 assessments.' },
  { id: 'scan_10',        name: 'Active Monitor',    emoji: '📊', tier: 'silver',   description: 'Completed 10 assessments.' },
  { id: 'scan_25',        name: 'Dedicated Patient', emoji: '🏆', tier: 'gold',     description: 'Completed 25 assessments.' },
  { id: 'scan_50',        name: 'Health Champion',   emoji: '⭐', tier: 'platinum', description: 'Completed 50 assessments.' },
  { id: 'streak_7',       name: 'Week Warrior',      emoji: '🔥', tier: 'bronze',   description: 'Maintained a 7-day scan streak.' },
  { id: 'streak_30',      name: 'Monthly Monitor',   emoji: '📅', tier: 'silver',   description: 'Maintained a 30-day scan streak.' },
  { id: 'streak_90',      name: 'Consistency King',  emoji: '👑', tier: 'gold',     description: 'Maintained a 90-day scan streak.' },
  { id: 'dual_user',      name: 'Full Spectrum',     emoji: '✨', tier: 'silver',   description: 'Used both Skin and Hair assessments.' },
  { id: 'high_risk_act',  name: 'Safety First',      emoji: '🛡️', tier: 'gold',     description: 'Acted on a high-risk alert within 48h (re-scanned).' },
  { id: 'consistent_90',  name: 'Three-Month Streak', emoji: '📈', tier: 'gold',    description: 'Scanned every week for 3 months.' },
  { id: 'consistent_100', name: 'Perfect Record',    emoji: '💎', tier: 'platinum', description: '100% weekly consistency score.' },
];

// ────────────────────────────────────────────────────────────
// STREAK CALCULATION
// ────────────────────────────────────────────────────────────
export interface StreakData {
  currentStreak: number;       // consecutive days with ≥1 scan
  longestStreak: number;
  lastScanDate: string | null;
  daysSinceLastScan: number;
  nextScanDue: string;         // ISO date string of recommended next scan
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function calculateStreak(history: Assessment[]): StreakData {
  if (history.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastScanDate: null, daysSinceLastScan: 0, nextScanDue: new Date().toISOString() };
  }

  // Unique scan-days (sorted ascending)
  const scanDays = [
    ...new Set(history.map((a) => startOfDay(new Date(a.created_at)))),
  ].sort((a, b) => a - b);

  const MS_DAY = 86400000;
  const today = startOfDay(new Date());

  // Calculate current streak (counting backwards from today)
  let current = 0;
  let ptr = today;
  for (let i = scanDays.length - 1; i >= 0; i--) {
    if (scanDays[i] === ptr || scanDays[i] === ptr - MS_DAY) {
      current++;
      ptr = scanDays[i];
    } else if (scanDays[i] < ptr - MS_DAY) {
      break;
    }
  }

  // Calculate longest streak
  let longest = 1;
  let run = 1;
  for (let i = 1; i < scanDays.length; i++) {
    if (scanDays[i] - scanDays[i - 1] <= MS_DAY) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const lastScanMs = scanDays[scanDays.length - 1];
  const daysSince = Math.floor((today - lastScanMs) / MS_DAY);
  const nextScanDue = new Date(lastScanMs + 7 * MS_DAY).toISOString();

  return {
    currentStreak: current,
    longestStreak: Math.max(longest, current),
    lastScanDate: new Date(lastScanMs).toISOString(),
    daysSinceLastScan: daysSince,
    nextScanDue,
  };
}

// ────────────────────────────────────────────────────────────
// CONSISTENCY SCORE (weekly)
// ────────────────────────────────────────────────────────────
export function calculateConsistency(history: Assessment[]): number {
  if (history.length === 0) return 0;

  const sorted = [...history].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const firstDate = new Date(sorted[0].created_at);
  const now = new Date();
  const totalWeeks = Math.max(1, Math.ceil((now.getTime() - firstDate.getTime()) / (7 * 86400000)));

  // Count weeks with ≥1 scan
  const weekSet = new Set<number>();
  sorted.forEach((a) => {
    const d = new Date(a.created_at);
    const weekNum = Math.floor((d.getTime() - firstDate.getTime()) / (7 * 86400000));
    weekSet.add(weekNum);
  });

  return Math.min(100, Math.round((weekSet.size / totalWeeks) * 100));
}

// ────────────────────────────────────────────────────────────
// BADGE UNLOCK LOGIC
// ────────────────────────────────────────────────────────────
export function computeBadges(history: Assessment[], streak: StreakData, consistency: number): Badge[] {
  const total = history.length;
  const hasSkin = history.some((a) => a.type === 'skin');
  const hasHair = history.some((a) => a.type === 'hair');

  const unlockMap: Record<string, boolean> = {
    first_scan:      total >= 1,
    scan_5:          total >= 5,
    scan_10:         total >= 10,
    scan_25:         total >= 25,
    scan_50:         total >= 50,
    streak_7:        streak.longestStreak >= 7,
    streak_30:       streak.longestStreak >= 30,
    streak_90:       streak.longestStreak >= 90,
    dual_user:       hasSkin && hasHair,
    high_risk_act:   false, // requires re-scan within 48h of high-risk — simplified
    consistent_90:   consistency >= 90,
    consistent_100:  consistency === 100,
  };

  return BADGE_DEFS.map((def) => ({ ...def, unlocked: unlockMap[def.id] ?? false }));
}

// ────────────────────────────────────────────────────────────
// MILESTONE MESSAGES
// ────────────────────────────────────────────────────────────
export function getMilestoneMessage(streak: StreakData, consistency: number, total: number): string | null {
  if (total === 1) return '🎉 First scan complete! Your health journey has begun.';
  if (total === 5) return '🌱 5 scans done! You\'re building a solid health baseline.';
  if (total === 10) return '📊 10 assessments! Your AI model now has great progression data.';
  if (streak.currentStreak === 7) return '🔥 7-day streak! You\'ve earned the Week Warrior badge.';
  if (streak.currentStreak === 30) return '🏆 30 days straight! Exceptional consistency. Monthly Monitor badge unlocked!';
  if (consistency >= 90 && total >= 10) return '👑 90%+ consistency score! You\'re in the top tier of health monitors.';
  if (streak.daysSinceLastScan >= 7) return `⏰ It's been ${streak.daysSinceLastScan} days since your last scan. Time to check in!`;
  return null;
}
