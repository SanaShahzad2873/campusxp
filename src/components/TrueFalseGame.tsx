"use client";
import { useState } from "react";
import { Heart, Check, X, ThumbsUp, ThumbsDown, ChevronRight, Flame } from "lucide-react";
import { QUESTIONS, shuffle, subjectById, topicById, type Question } from "@/lib/data";
import { nextCombo } from "@/lib/engine";
import { Bar, Explain } from "./ui";
import type { AnswerRec, GameProps } from "./types";

interface Item { q: Question; shown: number; isTrue: boolean }
const TOTAL = 10;

/** Sahi ya Ghalat: a statement is shown ("question → answer"); decide if it is right. 3 lives. */
export function TrueFalseGame({ record, finish, exit, lang }: GameProps) {
  const [items] = useState<Item[]>(() =>
    shuffle(QUESTIONS.filter((q) => !q.code)).slice(0, TOTAL).map((q) => {
      const isTrue = Math.random() < 0.5;
      const wrong = q.options.map((_, i) => i).filter((i) => i !== q.correct);
      return { q, isTrue, shown: isTrue ? q.correct : wrong[Math.floor(Math.random() * wrong.length)] };
    }));
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [said, setSaid] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<AnswerRec[]>([]);
  const [startedAt] = useState(() => Date.now());
  const [sid] = useState(() => `tf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const it = items[idx];
  const revealed = said !== null;
  const ok = revealed && said === it.isTrue;
  const over = lives <= 0 || idx + 1 >= TOTAL;

  function answer(v: boolean) {
    if (revealed) return;
    const good = v === it.isTrue;
    const nc = nextCombo(combo, good);
    setSaid(v); setCombo(nc);
    if (!good) setLives((l) => l - 1);
    // Map the true/false verdict onto the real question so XP, mastery and the mistake queue all work.
    const r = record(it.q, good ? it.q.correct : (it.q.correct + 1) % 4, "tf", false, nc, sid);
    setAnswers((a) => [...a, { q: { ...it.q, options: it.q.options }, selected: good ? it.q.correct : it.shown, correct: good, xp: r.xp }]);
  }
  function next() {
    if (over) {
      const c = answers.filter((a) => a.correct).length;
      finish({ mode: "tf", answers, durationSec: Math.round((Date.now() - startedAt) / 1000), outcome: lives <= 0 ? "Out of lives — revise and retry" : c >= 9 ? "Sharp eyes! 🎯" : "Round complete!", sid });
      return;
    }
    setIdx(idx + 1); setSaid(null);
  }

  return (
    <div className="wrap-narrow">
      <div className="flex items-center justify-between">
        <p className="h2 flex items-center gap-2"><ThumbsUp className="gold" /> Sahi ya Ghalat</p>
        <button onClick={exit} className="btn btn-ghost icon-btn" aria-label="Exit game"><X size={18} /></button>
      </div>
      <div className="flex items-center gap-3 mt-4 text-sm font-extrabold">
        <span>{idx + 1}/{TOTAL}</span>
        <div className="flex-1"><Bar value={((idx + (revealed ? 1 : 0)) / TOTAL) * 100} tone="sky" thin /></div>
        {combo >= 2 && <span className="text-[var(--pink)] flex items-center gap-1"><Flame size={16} />x{combo}</span>}
        <span className="flex gap-1" aria-label={`${lives} lives left`}>{[0, 1, 2].map((i) => <Heart key={i} size={20} className={i < lives ? "text-[var(--pink)]" : "muted"} fill={i < lives ? "currentColor" : "none"} />)}</span>
      </div>
      <div className="card mt-4 anim-pop" key={it.q.id}>
        <p className="text-xs font-bold muted">{subjectById(it.q.subjectId)?.name} · {topicById(it.q.topicId)?.name}</p>
        <p className="text-sm font-extrabold mt-4 muted">Is this statement correct?</p>
        <h2 className="text-xl font-extrabold leading-snug mt-1">{it.q.prompt}</h2>
        <p className="display text-2xl mt-3 gold break-words">{it.q.options[it.shown]}</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button disabled={revealed} onClick={() => answer(true)} className={`opt !justify-center ${revealed ? (it.isTrue ? "opt-right" : said === true ? "opt-wrong" : "opt-dim") : ""}`}><Check size={20} /> Sahi</button>
          <button disabled={revealed} onClick={() => answer(false)} className={`opt !justify-center ${revealed ? (!it.isTrue ? "opt-right" : said === false ? "opt-wrong" : "opt-dim") : ""}`}><ThumbsDown size={20} /> Ghalat</button>
        </div>
        {revealed && (
          <div className="mt-5 rounded-2xl p-4 anim-pop" style={{ background: ok ? "var(--good-bg)" : "var(--bad-bg)", border: `2px solid ${ok ? "var(--good)" : "var(--bad)"}` }}>
            <p className="font-extrabold">{ok ? `Right! +${answers[answers.length - 1]?.xp ?? 0} XP` : it.isTrue ? "That statement was correct." : `That statement was wrong. The real answer: ${it.q.options[it.q.correct]}`}</p>
            <Explain q={it.q} lang={lang} className="mt-2" />
            <button onClick={next} className="btn btn-gold mt-4">{over ? "See results" : "Next"} <ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
