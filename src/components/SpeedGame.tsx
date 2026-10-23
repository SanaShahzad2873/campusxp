"use client";
import { useEffect, useRef, useState } from "react";
import { Timer, Clock, Flame } from "lucide-react";
import { QUESTIONS, shuffle, subjectById, topicById, type Question } from "@/lib/data";
import { validateAnswer, nextCombo } from "@/lib/engine";
import { Bar } from "./ui";
import type { AnswerRec, GameProps } from "./types";

const nowMs = () => Date.now();

export function SpeedGame({ record, finish, exit }: GameProps) {
  const [dur, setDur] = useState<number | null>(null);
  const [left, setLeft] = useState(0);
  const [qs, setQs] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerRec[]>([]);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<boolean | null>(null);
  const endAt = useRef(0);
  const done = useRef(false);
  const answersRef = useRef<AnswerRec[]>([]);
  const [sid] = useState(() => `speed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const finishRef = useRef(finish);
  useEffect(() => { finishRef.current = finish; });

  function start(d: number) { endAt.current = nowMs() + d * 1000; setQs(shuffle(QUESTIONS)); setLeft(d); setDur(d); }

  useEffect(() => {
    if (!dur) return;
    const iv = setInterval(() => {
      const remain = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(remain);
      if (remain <= 0 && !done.current) {
        done.current = true; clearInterval(iv);
        const a = answersRef.current;
        finishRef.current({ mode: "speed", answers: a, durationSec: dur, outcome: a.length ? `Time! You answered ${a.length}` : "Time's up — no answers", sid });
      }
    }, 200);
    return () => clearInterval(iv);
  }, [dur, sid]);

  if (!dur) {
    return (
      <div className="wrap-narrow text-center">
        <Timer size={44} className="mx-auto gold" />
        <h1 className="h1 mt-3">Speed Run</h1>
        <p className="muted mt-2 text-sm max-w-md mx-auto">Pick a clock. Every correct answer scores and earns XP; a wrong answer just wastes time. Explanations are in the results.</p>
        <div className="grid grid-cols-2 gap-4 mt-7">
          {[60, 90].map((d) => <button key={d} onClick={() => start(d)} className="btn btn-gold !flex-col !py-7"><span className="display text-4xl">{d}s</span><span className="text-xs font-extrabold opacity-80">{d === 60 ? "Quick fire" : "Marathon"}</span></button>)}
        </div>
        <button onClick={exit} className="btn btn-ghost btn-sm mt-6">Back to games</button>
      </div>
    );
  }
  const q = qs[idx % qs.length];
  if (!q) return null;
  function choose(i: number) {
    if (done.current || nowMs() > endAt.current) return;
    const ok = validateAnswer(q, i);
    const nc = nextCombo(streak, ok);
    setStreak(nc);
    const r = record(q, i, "speed", false, nc, sid);
    answersRef.current = [...answersRef.current, { q, selected: i, correct: ok, xp: r.xp }];
    setAnswers(answersRef.current);
    setFlash(ok); setTimeout(() => setFlash(null), 250);
    setIdx(idx + 1);
  }
  const hits = answers.filter((a) => a.correct).length;
  const low = left <= 10;
  return (
    <div className="wrap-narrow">
      <div className="flex items-center justify-between">
        <p className="h2 flex items-center gap-2"><Timer className="gold" /> Speed Run</p>
        <button onClick={exit} className="btn btn-ghost btn-sm">Quit</button>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <div className={`chip ${low ? "chip-pink" : ""}`} style={{ fontSize: 18, padding: "8px 14px" }}><Clock size={18} />{left}s</div>
        <div className="flex-1"><Bar value={(left / dur) * 100} tone={low ? "bad" : "gold"} /></div>
      </div>
      <p className="text-sm font-extrabold mt-3">✓ {hits} correct · {answers.length} answered{streak >= 3 && <span className="text-[var(--pink)]"> · <Flame size={14} className="inline" /> {streak}</span>}</p>
      <div className="card mt-4" key={q.id} style={flash === null ? undefined : { background: flash ? "var(--good-bg)" : "var(--bad-bg)" }}>
        <p className="text-xs font-bold muted">{subjectById(q.subjectId)?.name} · {topicById(q.topicId)?.name}</p>
        <h2 className="text-lg font-extrabold mt-2">{q.prompt}</h2>
        {q.code && <pre className="code mt-3">{q.code}</pre>}
        <div className="grid gap-3 mt-5">{q.options.map((o, i) => <button key={i} onClick={() => choose(i)} className="opt"><span className="key">{"ABCD"[i]}</span>{o}</button>)}</div>
      </div>
    </div>
  );
}
