// CampusXP game engine — pure, testable logic + local-first repository (v1 schema)
export const RULES = { correctXP: 100, hintXP: 60, comboEvery: 3, comboBonus: 25, completionXP: 50, reviewXP: 30, masteryMilestoneXP: 100, playerDamage: 12, opponentDamage: 16, masteryThreshold: 80, weakAccuracy: 0.6, weakMinAttempts: 3 };

export const DAILY_BONUS_XP = 40;
export const MOCK_MINUTES = 20;
export function gradeFor(pct: number): { grade: string; label: string } {
  if (pct >= 90) return { grade: "A+", label: "Outstanding" };
  if (pct >= 80) return { grade: "A", label: "Excellent" };
  if (pct >= 70) return { grade: "B", label: "Good" };
  if (pct >= 60) return { grade: "C", label: "Pass — keep pushing" };
  if (pct >= 50) return { grade: "D", label: "Borderline — revise weak topics" };
  return { grade: "F", label: "Needs more practice" };
}
/** Memory Match XP: a perfect run (no wrong flips) pays 200, each extra move costs 10, floor 60. */
export function matchXP(pairs: number, moves: number): number { return Math.max(60, 200 - Math.max(0, moves - pairs) * 10); }

export function levelFromXP(xp: number): { level: number; into: number; needed: number; progress: number } {
  let level = 1, remaining = xp;
  while (remaining >= level * 400) { remaining -= level * 400; level++; }
  const needed = level * 400;
  return { level, into: remaining, needed, progress: Math.min(1, remaining / needed) };
}
export function validateAnswer(q: { correct: number }, selected: number | null): boolean { return selected !== null && selected === q.correct; }
export function xpForAnswer(correct: boolean, usedHint: boolean, comboAfter: number): number {
  if (!correct) return 0;
  let xp = usedHint ? RULES.hintXP : RULES.correctXP;
  if (comboAfter > 0 && comboAfter % RULES.comboEvery === 0) xp += RULES.comboBonus;
  return xp;
}
export function applyHealth(player: number, opponent: number, correct: boolean): { player: number; opponent: number } {
  return correct ? { player, opponent: Math.max(0, opponent - RULES.opponentDamage) } : { player: Math.max(0, player - RULES.playerDamage), opponent };
}
export function nextCombo(current: number, correct: boolean): number { return correct ? current + 1 : 0; }
export function masteryScore(total: number, correctCount: number, recentAccuracy: number): number {
  if (total === 0) return 0;
  return Math.round((0.6 * recentAccuracy + 0.4 * (correctCount / total)) * 100);
}
export function todayStr(d = new Date()): string { return d.toISOString().slice(0, 10); }
export function updateStreak(lastDate: string | null, streak: number, today = todayStr()): { streak: number; lastDate: string; isNewDay: boolean } {
  if (lastDate === today) return { streak: Math.max(1, streak), lastDate: today, isNewDay: false };
  const y = new Date(today); y.setDate(y.getDate() - 1);
  if (lastDate === todayStr(y)) return { streak: streak + 1, lastDate: today, isNewDay: true };
  return { streak: 1, lastDate: today, isNewDay: true };
}

export interface Attempt { questionId: string; subjectId: string; topicId: string; correct: boolean; xp: number; at: number; mode: string }
export interface SessionRec { id: string; mode: string; subjectId?: string; topicId?: string; score: number; xp: number; correct: number; total: number; at: number; durationSec: number }
export interface Profile { nickname: string; degree: string; semester: string; language: "en" | "ur" | "mixed"; createdAt: number }
export interface Store {
  v: 1; onboarded: boolean; profile: Profile; xp: number; claimed: string[];
  attempts: Attempt[]; sessions: SessionRec[]; achievements: string[];
  best: Record<string, number>; streak: number; lastStudyDate: string | null;
  daily: { date: string; answered: number }; settings: { theme: "dark" | "light"; palette: string; language: "en" | "ur" | "mixed"; sound: boolean; reducedMotion: boolean; dailyGoal: number };
  masteryAwarded: string[];
}
export const ACHIEVEMENTS = [
  { id: "first-win", name: "First Victory", desc: "Win your first Quiz Battle", icon: "Trophy", xp: 50 },
  { id: "ten-q", name: "Ten Questions Solved", desc: "Answer 10 questions in total", icon: "Target", xp: 50 },
  { id: "perfect", name: "Perfect Round", desc: "Finish a round with 100% accuracy (5+ questions)", icon: "Sparkles", xp: 100 },
  { id: "streak-3", name: "Three-Day Streak", desc: "Study 3 days in a row", icon: "Flame", xp: 75 },
  { id: "debug-rookie", name: "Debugging Rookie", desc: "Answer 3 Code Arena bug/output questions correctly", icon: "Bug", xp: 75 },
  { id: "dsa-explorer", name: "DSA Explorer", desc: "Answer 5 DSA questions correctly", icon: "Network", xp: 75 },
  { id: "revision-master", name: "Revision Master", desc: "Correctly review 5 previously-missed questions", icon: "RotateCcw", xp: 100 },
  { id: "consistent", name: "Consistent Learner", desc: "Reach a 5-day streak or complete 5 sessions", icon: "CalendarCheck", xp: 100 },
];
export function evaluateAchievements(s: Store): typeof ACHIEVEMENTS {
  const total = s.attempts.length, correct = s.attempts.filter(a => a.correct).length;
  const wonBattle = s.sessions.some(x => x.mode === "battle" && x.correct >= Math.ceil(x.total * 0.6) && x.total >= 3);
  const perfect = s.sessions.some(x => x.total >= 5 && x.correct === x.total);
  const codeCorrect = s.attempts.filter(a => a.mode === "code" && a.correct).length;
  const dsaCorrect = s.attempts.filter(a => a.subjectId === "dsa" && a.correct).length;
  const reviewed = s.claimed.filter(c => c.startsWith("review:")).length;
  const cond: Record<string, boolean> = {
    "first-win": wonBattle, "ten-q": total >= 10, "perfect": perfect, "streak-3": s.streak >= 3,
    "debug-rookie": codeCorrect >= 3, "dsa-explorer": dsaCorrect >= 5, "revision-master": reviewed >= 5,
    "consistent": s.streak >= 5 || s.sessions.length >= 5,
  };
  void correct;
  return ACHIEVEMENTS.filter(a => cond[a.id] && !s.achievements.includes(a.id));
}

const KEY = "campusxp_v1";
export function defaultStore(): Store {
  return { v: 1, onboarded: false, profile: { nickname: "", degree: "BS Computer Science", semester: "Semester 3", language: "en", createdAt: Date.now() }, xp: 0, claimed: [], attempts: [], sessions: [], achievements: [], best: {}, streak: 0, lastStudyDate: null, daily: { date: todayStr(), answered: 0 }, settings: { theme: "dark", palette: "violet", language: "en", sound: true, reducedMotion: false, dailyGoal: 10 }, masteryAwarded: [] };
}
export function loadStore(): Store {
  try { const raw = localStorage.getItem(KEY); if (!raw) return defaultStore(); const p = JSON.parse(raw) as Store; if (p.v !== 1) return defaultStore(); return { ...defaultStore(), ...p, settings: { ...defaultStore().settings, ...(p.settings || {}) }, profile: { ...defaultStore().profile, ...(p.profile || {}) } }; } catch { return defaultStore(); }
}
export function saveStore(s: Store) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full/blocked — game continues in-memory */ } }

export function topicStats(s: Store, topicId: string) {
  const a = s.attempts.filter(x => x.topicId === topicId);
  const recent = a.slice(-8); const ra = recent.length ? recent.filter(x => x.correct).length / recent.length : 0;
  return { total: a.length, correct: a.filter(x => x.correct).length, accuracy: a.length ? a.filter(x => x.correct).length / a.length : 0, recentAccuracy: ra, mastery: masteryScore(a.length, a.filter(x => x.correct).length, ra) };
}
export function weakTopics(s: Store): string[] {
  const ids = [...new Set(s.attempts.map(a => a.topicId))];
  return ids.filter(id => { const st = topicStats(s, id); return st.total >= RULES.weakMinAttempts && st.recentAccuracy < RULES.weakAccuracy; })
    .sort((a, b) => topicStats(s, a).recentAccuracy - topicStats(s, b).recentAccuracy);
}
export function recommendedDifficulty(s: Store, topicId: string): 1 | 2 | 3 {
  const st = topicStats(s, topicId); if (st.total < 3) return 1;
  if (st.recentAccuracy < 0.5) return 1; if (st.recentAccuracy > 0.85) return 3; return 2;
}
export function validateImport(raw: unknown): Store | null {
  try { const p = raw as Store; if (!p || p.v !== 1 || typeof p.xp !== "number" || !Array.isArray(p.attempts)) return null; return { ...defaultStore(), ...p }; } catch { return null; }
}
export function validateAIQuestions(data: unknown): { ok: boolean; error?: string; questions?: unknown[] } {
  if (!data || typeof data !== "object") return { ok: false, error: "Response is not an object" };
  const qs = (data as { questions?: unknown }).questions;
  if (!Array.isArray(qs) || qs.length === 0 || qs.length > 10) return { ok: false, error: "questions must be an array of 1–10 items" };
  for (const q of qs as Record<string, unknown>[]) {
    if (typeof q.prompt !== "string" || !q.prompt.trim()) return { ok: false, error: "Each question needs a prompt" };
    if (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options).size !== 4) return { ok: false, error: "Each MCQ needs 4 distinct options" };
    if (typeof q.correct !== "number" || q.correct < 0 || q.correct > 3) return { ok: false, error: "correct must be an index 0–3" };
    if (typeof q.explanation !== "string" || q.explanation.trim().length < 10) return { ok: false, error: "Each question needs a meaningful explanation" };
  }
  return { ok: true, questions: qs };
}
