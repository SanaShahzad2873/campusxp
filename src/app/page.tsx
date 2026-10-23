"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { QUESTIONS, CODE_QUESTIONS, ALL_QUESTIONS, questionsFor, type Question } from "@/lib/data";
import {
  RULES, DAILY_BONUS_XP, levelFromXP, validateAnswer, xpForAnswer, todayStr, updateStreak, evaluateAchievements,
  loadStore, saveStore, defaultStore, topicStats, weakTopics, type Store, type SessionRec,
} from "@/lib/engine";
import { Shell } from "@/components/Shell";
import { Onboarding } from "@/components/Onboarding";
import { HomeView } from "@/components/HomeView";
import { LearnView, SubjectView } from "@/components/LearnViews";
import { PlayView } from "@/components/PlayView";
import { QuizGame } from "@/components/QuizGame";
import { SpeedGame } from "@/components/SpeedGame";
import { TrueFalseGame } from "@/components/TrueFalseGame";
import { MatchGame } from "@/components/MatchGame";
import { MockExam } from "@/components/MockExam";
import { ResultsView, MistakesView } from "@/components/ResultsViews";
import { CoachView } from "@/components/CoachView";
import { ProfileView } from "@/components/ProfileView";
import { Brand } from "@/components/ui";
import type { FinishArgs, RecordFn, Result, View } from "@/components/types";

const GAME_VIEWS: View[] = ["battle", "speed", "code", "tf", "match", "mock", "review"];

function subscribeOnline(cb: () => void) { window.addEventListener("online", cb); window.addEventListener("offline", cb); return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); }; }

export default function Page() {
  const [store, setStore] = useState<Store>(() => defaultStore());
  const storeRef = useRef(store);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("home");
  const [subjectId, setSubjectId] = useState("pf");
  const [pool, setPool] = useState<Question[]>(QUESTIONS);
  const [scope, setScope] = useState<{ subject?: string; topic?: string }>({});
  const [playId, setPlayId] = useState(0);
  const [toast, setToast] = useState("");
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);

  /** Single write path: compute from the latest state synchronously so back-to-back updates never go stale. */
  function update(fn: (s: Store) => Store) { const next = fn(storeRef.current); storeRef.current = next; setStore(next); }
  const setStoreAny: Dispatch<SetStateAction<Store>> = (v) => update((s) => (typeof v === "function" ? (v as (p: Store) => Store)(s) : v));

  useEffect(() => {
    const s = loadStore();
    storeRef.current = s;
    // Reading localStorage must happen after mount (the server has none), so state is set here on purpose.
    /* eslint-disable react-hooks/set-state-in-effect */
    setStore(s); setHydrated(true); if (!s.onboarded) setView("onboard");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => { if (hydrated) saveStore(store); }, [store, hydrated]);
  useEffect(() => { document.documentElement.dataset.theme = store.settings.theme; }, [store.settings.theme]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(""), 3500); return () => clearTimeout(id); }, [toast]);

  const lvl = levelFromXP(store.xp);
  const weak = weakTopics(store);
  const lang = store.settings.language;
  const dailyDone = store.daily.date === todayStr() ? store.daily.answered : 0;
  const mistakes = useMemo(() => {
    const latest = new Map<string, boolean>();
    for (const a of store.attempts) latest.set(a.questionId, a.correct);
    return [...latest.entries()].filter(([, ok]) => !ok).map(([id]) => ALL_QUESTIONS.find((q) => q.id === id)).filter(Boolean) as Question[];
  }, [store.attempts]);

  function beep(ok: boolean) {
    if (!storeRef.current.settings.sound) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "triangle"; o.frequency.value = ok ? 660 : 190; g.gain.value = 0.05; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.13);
      o.onended = () => ctx.close();
    } catch { /* audio not available */ }
  }

  /** One answered question: XP, attempt log, streak, daily goal, mastery milestone, badges. */
  const record: RecordFn = (q, selected, mode, usedHint, comboAfter) => {
    const correct = validateAnswer(q, selected);
    let s = storeRef.current;
    const today = todayStr();
    let xp = xpForAnswer(correct, usedHint, comboAfter);
    const claimed = [...s.claimed];
    if (mode === "tf") xp = Math.floor(xp / 2);
    if (mode === "review") { const k = `review:${q.id}`; if (correct && !claimed.includes(k)) { xp = RULES.reviewXP; claimed.push(k); } else xp = 0; }
    if (mode === "daily") { const k = `daily:${today}`; if (!claimed.includes(k)) { xp = correct ? DAILY_BONUS_XP : 0; claimed.push(k); } else xp = 0; }
    s = { ...s, xp: s.xp + xp, claimed, attempts: [...s.attempts, { questionId: q.id, subjectId: q.subjectId, topicId: q.topicId, correct, xp, at: Date.now(), mode }] };
    const st = updateStreak(s.lastStudyDate, s.streak);
    s = { ...s, streak: st.streak, lastStudyDate: st.lastDate, daily: s.daily.date === today ? { date: today, answered: s.daily.answered + 1 } : { date: today, answered: 1 } };
    const ts = topicStats(s, q.topicId);
    if (ts.mastery >= RULES.masteryThreshold && ts.total >= 5 && !s.masteryAwarded.includes(q.topicId)) {
      s = { ...s, xp: s.xp + RULES.masteryMilestoneXP, masteryAwarded: [...s.masteryAwarded, q.topicId] };
      setToast(`Topic mastered! +${RULES.masteryMilestoneXP} XP`);
    }
    const earned = evaluateAchievements(s);
    if (earned.length) { s = { ...s, xp: s.xp + earned.reduce((n, a) => n + a.xp, 0), achievements: [...s.achievements, ...earned.map((a) => a.id)] }; setToast(`New badge: ${earned[0].name}`); }
    update(() => s);
    beep(correct);
    return { correct, xp };
  };

  /** End of a round: completion bonus (once per round id), best scores, badges, then the results screen. */
  function finish(a: FinishArgs) {
    const s0 = storeRef.current;
    const correct = a.correct ?? a.answers.filter((x) => x.correct).length;
    const total = a.total ?? a.answers.length;
    const answerXP = a.answers.reduce((n, x) => n + x.xp, 0);
    const gameXP = a.gameXP ?? 0;
    const firstTime = !s0.claimed.includes(a.sid);
    const bonus = firstTime ? RULES.completionXP : 0;
    const score = answerXP + gameXP;
    const rec: SessionRec = { id: a.sid, mode: a.mode, subjectId: a.subjectId, topicId: a.topicId, score, xp: score + bonus, correct, total, at: Date.now(), durationSec: a.durationSec };
    let s: Store = { ...s0, xp: s0.xp + bonus + gameXP, claimed: firstTime ? [...s0.claimed, a.sid] : s0.claimed, sessions: [...s0.sessions, rec] };
    const bestVal: Record<string, number> = { speed: correct, battle: score, code: score, tf: score, match: gameXP, mock: total ? Math.round((correct / total) * 100) : 0 };
    if (a.mode in bestVal) s = { ...s, best: { ...s.best, [a.mode]: Math.max(s.best[a.mode] || 0, bestVal[a.mode]) } };
    const earned = evaluateAchievements(s);
    if (earned.length) s = { ...s, xp: s.xp + earned.reduce((n, x) => n + x.xp, 0), achievements: [...s.achievements, ...earned.map((x) => x.id)] };
    update(() => s);
    setLastResult({ mode: a.mode, score, xp: score + bonus, correct, total, durationSec: a.durationSec, answers: a.answers, outcome: a.outcome, newAchievements: earned.map((x) => x.name), sid: a.sid, grade: a.grade });
    window.scrollTo(0, 0);
    setView("results");
  }

  function startBattle(subject?: string, topic?: string) {
    let p = subject ? questionsFor(subject, topic) : QUESTIONS;
    if (topic && p.length < 3) p = questionsFor(subject);
    if (!p.length) p = QUESTIONS;
    setPool(p); setScope({ subject, topic }); setPlayId((n) => n + 1); setView("battle");
  }
  function go(v: View, subject?: string, topic?: string) {
    window.scrollTo(0, 0);
    if (v === "battle") { startBattle(subject, topic); return; }
    if (subject) setSubjectId(subject);
    setPlayId((n) => n + 1);
    setView(v);
  }
  function startReview() { setPool(mistakes); setPlayId((n) => n + 1); setView("review"); setToast(`Revision round — ${RULES.reviewXP} XP for each mistake you fix.`); }
  function replay() {
    const m = lastResult?.mode;
    if (m === "review") return startReview();
    if (m === "battle") return startBattle(scope.subject, scope.topic);
    go((m && GAME_VIEWS.includes(m as View) ? m : "play") as View);
  }

  if (!hydrated) {
    return <div className="min-h-screen grid place-items-center"><div className="text-center"><div className="anim-floaty"><Brand size={52} /></div><p className="muted mt-3 font-bold">Loading your adventure…</p></div></div>;
  }

  const inGame = GAME_VIEWS.includes(view);
  const gp = { record, finish, exit: () => go("play"), lang };
  const content = (
    <>
      {view === "home" && <HomeView store={store} lvl={lvl} weak={weak} dailyDone={dailyDone} mistakeCount={mistakes.length} record={record} go={go} />}
      {view === "learn" && <LearnView store={store} goSubject={(id) => go("subject", id)} />}
      {view === "subject" && <SubjectView store={store} subjectId={subjectId} back={() => go("learn")} play={(tid) => startBattle(subjectId, tid)} />}
      {view === "play" && <PlayView go={go} best={store.best} />}
      {view === "results" && lastResult && <ResultsView r={lastResult} lang={lang} go={go} replay={replay} />}
      {view === "mistakes" && <MistakesView mistakes={mistakes} lang={lang} retry={startReview} go={go} />}
      {view === "coach" && <CoachView store={store} weak={weak} startTopic={(s, t) => startBattle(s, t)} />}
      {view === "profile" && <ProfileView store={store} setStore={setStoreAny} lvl={lvl} fileRef={fileRef} confirmReset={confirmReset} setConfirmReset={setConfirmReset} setToast={setToast} syncMsg={syncMsg} setSyncMsg={setSyncMsg} goOnboard={() => setView("onboard")} />}
    </>
  );

  return (
    <div className={store.settings.reducedMotion ? "no-motion" : ""}>
      {view === "onboard" ? (
        <Onboarding
          onDone={(p) => { update((s) => ({ ...s, onboarded: true, profile: p, settings: { ...s.settings, language: p.language } })); go("home"); setToast("Welcome to CampusXP! Your first quest is ready."); }}
          onSkip={() => { update((s) => ({ ...s, onboarded: true })); go("home"); }}
        />
      ) : inGame ? (
        <div className="max-w-5xl mx-auto px-4 py-6" key={`${view}-${playId}`}>
          {view === "battle" && <QuizGame {...gp} mode="battle" pool={pool} subjectId={scope.subject} topicId={scope.topic} />}
          {view === "code" && <QuizGame {...gp} mode="code" pool={CODE_QUESTIONS} />}
          {view === "review" && <QuizGame {...gp} mode="review" pool={pool} exit={() => go("mistakes")} />}
          {view === "speed" && <SpeedGame {...gp} />}
          {view === "tf" && <TrueFalseGame {...gp} />}
          {view === "match" && <MatchGame {...gp} />}
          {view === "mock" && <MockExam {...gp} />}
        </div>
      ) : (
        <Shell view={view} go={go} store={store} lvl={lvl} mistakeCount={mistakes.length} online={online}>{content}</Shell>
      )}
      {toast && <div role="status" className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-extrabold anim-rise max-w-[92vw] text-center" style={{ background: "var(--gold)", color: "var(--on-gold)", border: "2px solid var(--gold-d)", boxShadow: "0 4px 0 var(--gold-d)" }}>{toast}</div>}
    </div>
  );
}
