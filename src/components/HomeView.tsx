"use client";
import { useState } from "react";
import { Flame, Zap, AlertTriangle, ChevronRight, RotateCcw, Check, Star } from "lucide-react";
import { SUBJECTS, subjectById, topicById, questionsFor, dailyQuestion } from "@/lib/data";
import { RULES, DAILY_BONUS_XP, todayStr, topicStats, validateAnswer, type Store, levelFromXP } from "@/lib/engine";
import { Bar, Explain, SubjectIcon, Section, Zig } from "./ui";
import { MODES } from "./modes";
import type { RecordFn, View } from "./types";

interface Props {
  store: Store; lvl: ReturnType<typeof levelFromXP>; weak: string[]; dailyDone: number; mistakeCount: number;
  record: RecordFn; go: (v: View, subject?: string, topic?: string) => void;
}

export function HomeView({ store, lvl, weak, dailyDone, mistakeCount, record, go }: Props) {
  const name = store.profile.nickname || "Champion";
  const today = todayStr();
  const dq = dailyQuestion(today);
  const dailyClaimed = store.claimed.includes(`daily:${today}`);
  const [pick, setPick] = useState<number | null>(null);
  const goalPct = Math.min(100, Math.round((dailyDone / Math.max(1, store.settings.dailyGoal)) * 100));
  const lang = store.settings.language;
  const last = store.sessions[store.sessions.length - 1];

  function answerDaily(i: number) {
    if (pick !== null || dailyClaimed) return;
    setPick(i);
    record(dq, i, "daily", false, 0, `daily-${today}`);
  }
  const showResult = pick !== null;

  return (
    <div>
      <h1 className="h1">Assalam-o-Alaikum, {name}!</h1>
      <p className="muted text-sm mt-2">{store.profile.degree} · {store.profile.semester}</p>

      <div className="grid md:grid-cols-5 gap-4 mt-6">
        <div className="card-gold md:col-span-2 !p-0 overflow-hidden flex flex-col">
          <Zig pink />
          <div className="p-5 flex-1">
            <p className="font-extrabold text-sm">Your level</p>
            <div className="flex items-end gap-3 mt-1"><span className="display text-6xl leading-none">{lvl.level}</span><span className="font-extrabold pb-1">{store.xp} XP total</span></div>
            <div className="mt-4"><Bar value={lvl.progress * 100} tone="good" /></div>
            <p className="text-xs font-bold mt-2">{lvl.needed - lvl.into} XP to level {lvl.level + 1}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="chip" style={{ background: "var(--on-gold)", color: "var(--gold)", borderColor: "var(--on-gold)" }}><Flame size={14} /> {store.streak}-day streak</span>
              <span className="chip" style={{ background: "var(--on-gold)", color: "var(--gold)", borderColor: "var(--on-gold)" }}>{dailyDone}/{store.settings.dailyGoal} today</span>
            </div>
            <div className="mt-3"><Bar value={goalPct} tone="sky" thin /></div>
          </div>
        </div>

        <div className="card md:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-extrabold flex items-center gap-2"><Zap size={18} className="gold" /> Daily challenge</p>
            <span className="chip chip-gold">+{DAILY_BONUS_XP} XP once a day</span>
          </div>
          <p className="muted text-xs mt-1">{subjectById(dq.subjectId)?.name} · {topicById(dq.topicId)?.name}</p>
          <h2 className="text-lg font-extrabold mt-3 leading-snug">{dq.prompt}</h2>
          {dailyClaimed && !showResult ? (
            <div className="mt-4 rounded-2xl p-4 flex items-center gap-3" style={{ background: "var(--good-bg)", border: "2px solid var(--good)" }}><Check /><div><p className="font-extrabold">Done for today!</p><p className="text-sm muted">A new challenge arrives tomorrow. Keep your streak alive with a game.</p></div></div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {dq.options.map((o, i) => {
                  const cls = showResult ? (i === dq.correct ? "opt-right" : pick === i ? "opt-wrong" : "opt-dim") : "";
                  return <button key={i} disabled={showResult} onClick={() => answerDaily(i)} className={`opt ${cls}`}><span className="key">{"ABCD"[i]}</span>{o}</button>;
                })}
              </div>
              {showResult && (
                <div className="mt-4 anim-pop">
                  <p className="font-extrabold">{validateAnswer(dq, pick) ? `Correct! +${DAILY_BONUS_XP} XP` : "Not this time — see why:"}</p>
                  <Explain q={dq} lang={lang} className="mt-1" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {(weak.length > 0 || mistakeCount > 0) && (
        <div className="card mt-5">
          {weak.length > 0 && <>
            <p className="font-extrabold flex items-center gap-2"><AlertTriangle size={18} className="text-[var(--pink)]" /> Revise these first</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {weak.slice(0, 4).map((id) => { const sub = SUBJECTS.find((s) => s.topics.some((x) => x.id === id)); return sub ? <button key={id} onClick={() => go("battle", sub.id, id)} className="btn btn-ghost btn-sm">{topicById(id)?.name} · {Math.round(topicStats(store, id).recentAccuracy * 100)}% <ChevronRight size={14} /></button> : null; })}
            </div>
            <p className="text-xs muted mt-2">Topics under {Math.round(RULES.weakAccuracy * 100)}% recent accuracy show up here.</p>
          </>}
          {mistakeCount > 0 && <button onClick={() => go("mistakes")} className={`btn btn-pink btn-sm ${weak.length ? "mt-4" : ""}`}><RotateCcw size={15} /> Review {mistakeCount} mistake{mistakeCount > 1 ? "s" : ""} for +{RULES.reviewXP} XP each</button>}
        </div>
      )}

      <Section title="Pick a game" right={last && <button onClick={() => go("play")} className="btn btn-ghost btn-sm">All games</button>}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODES.map((m) => (
            <button key={m.v} onClick={() => go(m.v)} className="card flex flex-col gap-1">
              <span className="inline-grid place-items-center w-11 h-11 rounded-xl mb-2" style={{ background: m.tint, color: "#12130f", border: "2px solid rgba(0,0,0,.3)" }}><m.Icon size={22} strokeWidth={2.4} /></span>
              <span className="display text-lg">{m.name}</span>
              <span className="muted text-sm">{m.short}</span>
              {store.best[m.bestKey] !== undefined && <span className="chip chip-gold mt-2 self-start"><Star size={12} /> {m.bestLabel}: {store.best[m.bestKey]}</span>}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Subjects">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUBJECTS.slice(0, 6).map((s) => {
            const att = store.attempts.filter((a) => a.subjectId === s.id);
            const acc = att.length ? Math.round((att.filter((a) => a.correct).length / att.length) * 100) : null;
            return (
              <button key={s.id} onClick={() => go("subject", s.id)} className="card flex items-center gap-3 !p-4">
                <SubjectIcon s={s} />
                <span className="min-w-0"><span className="block font-extrabold leading-tight">{s.name}</span><span className="block text-xs muted mt-1">{questionsFor(s.id).length} questions · {acc === null ? "not started" : `${acc}% accuracy`}</span></span>
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
