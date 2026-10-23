"use client";
import { useMemo, useState } from "react";
import { Swords, Code2, RotateCcw, Pause, Play, X, Heart, Shield, Flame, Lightbulb, Check, ChevronRight, Brain } from "lucide-react";
import { shuffle, subjectById, topicById, type Question } from "@/lib/data";
import { RULES, validateAnswer, applyHealth, nextCombo } from "@/lib/engine";
import { Bar, Explain } from "./ui";
import type { AnswerRec, GameProps } from "./types";

interface Props extends GameProps { mode: "battle" | "code" | "review"; pool: Question[]; subjectId?: string; topicId?: string }

export function EmptyState({ exit }: { exit: () => void }) {
  return (
    <div className="wrap-narrow text-center py-16">
      <Brain size={44} className="mx-auto muted" />
      <h1 className="h2 mt-4">No questions here yet</h1>
      <p className="muted mt-2 text-sm">Pick another topic or play the full subject battle.</p>
      <button onClick={exit} className="btn btn-gold mt-5">Back to games</button>
    </div>
  );
}

/** Quiz Battle, Code Arena and Revision Round share one engine: 4 options, hints, combos, boss HP. */
export function QuizGame({ mode, pool, subjectId, topicId, record, finish, exit, lang }: Props) {
  const qs = useMemo(() => (mode === "review" ? shuffle(pool) : shuffle(pool).slice(0, mode === "code" ? 8 : 10)), [pool, mode]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRec[]>([]);
  const [php, setPhp] = useState(100);
  const [ohp, setOhp] = useState(100);
  const [combo, setCombo] = useState(0);
  const [hint, setHint] = useState(false);
  const [hidden, setHidden] = useState<number[]>([]);
  const [paused, setPaused] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [sid] = useState(() => `${mode}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const q = qs[idx];
  if (!q) return <EmptyState exit={exit} />;
  const revealed = selected !== null;
  const isBattle = mode === "battle";
  const last = idx + 1 >= qs.length || (isBattle && (php <= 0 || ohp <= 0));
  const title = mode === "code" ? "Code Arena" : mode === "review" ? "Revision Round" : "Quiz Battle";
  const Icon = mode === "code" ? Code2 : mode === "review" ? RotateCcw : Swords;
  const typeLabel = { mcq: "MCQ", output: "Predict the output", bug: "Find the bug", arrange: "Arrange the blocks", pseudo: "Pseudocode" }[q.type];

  function choose(i: number) {
    if (revealed || paused) return;
    const ok = validateAnswer(q, i);
    const nc = nextCombo(combo, ok);
    setSelected(i); setCombo(nc);
    const r = record(q, i, mode, hint, nc, sid);
    if (isBattle) { const h = applyHealth(php, ohp, r.correct); setPhp(h.player); setOhp(h.opponent); }
    setAnswers((prev) => [...prev, { q, selected: i, correct: r.correct, xp: r.xp }]);
  }
  function next() {
    if (last) {
      const wins = answers.filter((a) => a.correct).length;
      const outcome = mode !== "battle" ? "Round complete!" : ohp <= 0 ? "Boss defeated! 🏆" : php <= 0 ? "Knocked out — but you learned a lot" : wins >= Math.ceil(answers.length * 0.6) ? "Won on points!" : "Boss survived this round";
      finish({ mode, answers, durationSec: Math.round((Date.now() - startedAt) / 1000), outcome, sid, subjectId, topicId });
      return;
    }
    setIdx(idx + 1); setSelected(null); setHint(false); setHidden([]);
  }
  function takeHint() {
    if (hint || revealed) return;
    setHidden(shuffle(q.options.map((_, i) => i).filter((i) => i !== q.correct)).slice(0, 2));
    setHint(true);
  }

  return (
    <div className="wrap-narrow">
      <div className="flex items-center justify-between">
        <p className="h2 flex items-center gap-2"><Icon className="gold" /> {title}</p>
        <div className="flex gap-2">
          <button aria-label={paused ? "Resume" : "Pause"} onClick={() => setPaused(!paused)} className="btn btn-ghost icon-btn">{paused ? <Play size={18} /> : <Pause size={18} />}</button>
          <button aria-label="Exit game" onClick={exit} className="btn btn-ghost icon-btn"><X size={18} /></button>
        </div>
      </div>

      {isBattle && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="card-flat"><p className="text-xs font-extrabold flex justify-between"><span className="flex items-center gap-1"><Heart size={14} className="text-[var(--good)]" /> You</span><span>{php} HP</span></p><div className="mt-2"><Bar value={php} tone="good" /></div></div>
          <div className="card-flat"><p className="text-xs font-extrabold flex justify-between"><span className="flex items-center gap-1"><Shield size={14} className="text-[var(--bad)]" /> Campus Boss</span><span>{ohp} HP</span></p><div className="mt-2"><Bar value={ohp} tone="bad" /></div></div>
        </div>
      )}

      <div className="flex items-center gap-3 mt-4 text-sm font-extrabold">
        <span>Q {idx + 1}/{qs.length}</span>
        <div className="flex-1"><Bar value={((idx + (revealed ? 1 : 0)) / qs.length) * 100} tone="sky" thin /></div>
        {combo >= 2 && <span className="flex items-center gap-1 text-[var(--pink)]"><Flame size={16} /> x{combo}</span>}
        <span className="gold">{answers.reduce((n, a) => n + a.xp, 0)} XP</span>
      </div>

      {paused ? (
        <div className="card mt-4 text-center py-10">
          <p className="h2">Paused</p><p className="muted text-sm mt-2">Chai piyo, wapas aao.</p>
          <button onClick={() => setPaused(false)} className="btn btn-gold mt-5">Resume</button>
        </div>
      ) : (
        <div className="card mt-4 anim-pop" key={q.id}>
          <p className="text-xs font-bold muted">{subjectById(q.subjectId)?.name} · {topicById(q.topicId)?.name} · {"★".repeat(q.difficulty)} · {typeLabel}</p>
          <h2 className="text-lg font-extrabold mt-2 leading-snug">{q.prompt}</h2>
          {q.code && <pre className="code mt-3">{q.code}</pre>}
          {q.blocks && <div className="mt-3 grid gap-2">{q.blocks.map((b, i) => <pre key={i} className="code !py-2">{b}</pre>)}</div>}
          <div className="grid gap-3 mt-5" role="group" aria-label="Answer options">
            {q.options.map((o, i) => {
              if (hidden.includes(i)) return null;
              const right = i === q.correct, sel = selected === i;
              const cls = revealed ? (right ? "opt-right" : sel ? "opt-wrong anim-shake" : "opt-dim") : "";
              return (
                <button key={i} disabled={revealed} onClick={() => choose(i)} className={`opt ${cls}`}>
                  <span className="key">{"ABCD"[i]}</span><span className="flex-1">{o}</span>
                  {revealed && right && <Check size={18} />}{revealed && sel && !right && <X size={18} />}
                </button>
              );
            })}
          </div>
          {!revealed && <button onClick={takeHint} disabled={hint} className="mt-4 text-sm font-extrabold flex items-center gap-2 gold disabled:opacity-50 bg-transparent border-0 p-0"><Lightbulb size={16} />{hint ? `Hint used — this answer pays ${RULES.hintXP} XP` : `Use hint — removes 2 wrong options (XP drops to ${RULES.hintXP})`}</button>}
          {revealed && (
            <div className="mt-5 rounded-2xl p-4 anim-pop" style={{ background: validateAnswer(q, selected) ? "var(--good-bg)" : "var(--bad-bg)", border: `2px solid ${validateAnswer(q, selected) ? "var(--good)" : "var(--bad)"}` }}>
              <p className="font-extrabold">{validateAnswer(q, selected) ? `Correct! +${answers[answers.length - 1]?.xp || 0} XP` : `Not quite — the answer is ${"ABCD"[q.correct]}. ${q.options[q.correct]}`}</p>
              <Explain q={q} lang={lang} className="mt-2" />
              <button onClick={next} className="btn btn-gold mt-4">{last ? "See results" : "Next question"} <ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
