"use client";
import { useEffect, useRef, useState } from "react";
import { GraduationCap, Clock, ChevronLeft, ChevronRight, X, Send } from "lucide-react";
import { QUESTIONS, SUBJECTS, shuffle, subjectById, type Question } from "@/lib/data";
import { MOCK_MINUTES, gradeFor } from "@/lib/engine";
import { fmtTime } from "./ui";
import type { AnswerRec, GameProps } from "./types";

const COUNT = 15;

/** Mock Exam: timed, no feedback until you submit — like a real paper. */
export function MockExam({ record, finish, exit }: GameProps) {
  const [subject, setSubject] = useState("all");
  const [qs, setQs] = useState<Question[] | null>(null);
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(MOCK_MINUTES * 60);
  const [confirm, setConfirm] = useState(false);
  const endAt = useRef(0);
  const startedAt = useRef(0);
  const submitted = useRef(false);
  const state = useRef({ qs: null as Question[] | null, picks: [] as (number | null)[] });
  const [sid] = useState(() => `mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const api = useRef({ record, finish });
  useEffect(() => { api.current = { record, finish }; state.current = { qs, picks }; });

  function submit() {
    if (submitted.current || !state.current.qs) return;
    submitted.current = true;
    const { qs: Q, picks: P } = state.current;
    const answers: AnswerRec[] = Q.map((q, i) => {
      const sel = P[i];
      if (sel === null || sel === undefined) return { q, selected: -1, correct: false, xp: 0 };
      const r = api.current.record(q, sel, "mock", false, 0, sid);
      return { q, selected: sel, correct: r.correct, xp: r.xp };
    });
    const correct = answers.filter((a) => a.correct).length;
    const pct = Math.round((correct / Q.length) * 100);
    const grade = gradeFor(pct);
    api.current.finish({ mode: "mock", answers, durationSec: Math.round((Date.now() - startedAt.current) / 1000), outcome: `Grade ${grade.grade} — ${pct}%`, sid, subjectId: subject === "all" ? undefined : subject, correct, total: Q.length, grade });
  }

  useEffect(() => {
    if (!qs) return;
    const iv = setInterval(() => {
      const remain = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(remain);
      if (remain <= 0) { clearInterval(iv); submit(); }
    }, 500);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  function begin() {
    const pool = QUESTIONS.filter((q) => subject === "all" || q.subjectId === subject);
    const chosen = shuffle(pool).slice(0, COUNT);
    startedAt.current = Date.now(); endAt.current = Date.now() + MOCK_MINUTES * 60 * 1000;
    setPicks(chosen.map(() => null)); setLeft(MOCK_MINUTES * 60); setIdx(0); setQs(chosen);
  }

  if (!qs) {
    return (
      <div className="wrap-narrow">
        <GraduationCap size={44} className="gold" />
        <h1 className="h1 mt-3">Mock Exam</h1>
        <p className="muted mt-2 text-sm">Up to {COUNT} questions, {MOCK_MINUTES} minutes. You see no answers until you submit, then get a grade and a full review. Practice like the real paper.</p>
        <label className="label mt-6" htmlFor="mock-subject">Subject</label>
        <select id="mock-subject" className="field mt-2" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="all">All subjects (mixed paper)</option>
          {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex gap-3 mt-6"><button onClick={begin} className="btn btn-gold">Start exam</button><button onClick={exit} className="btn btn-ghost">Back</button></div>
      </div>
    );
  }
  const q = qs[idx];
  const answered = picks.filter((p) => p !== null).length;
  return (
    <div className="wrap-narrow">
      <div className="flex items-center justify-between">
        <p className="h2 flex items-center gap-2"><GraduationCap className="gold" /> Mock Exam</p>
        <div className="flex items-center gap-2">
          <span className={`chip ${left <= 60 ? "chip-pink" : ""}`} style={{ fontSize: 16 }}><Clock size={16} />{fmtTime(left)}</span>
          <button onClick={exit} className="btn btn-ghost icon-btn" aria-label="Leave exam"><X size={18} /></button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4" aria-label="Question navigator">
        {qs.map((_, i) => <button key={i} onClick={() => setIdx(i)} aria-label={`Go to question ${i + 1}`} aria-current={i === idx} className="btn btn-sm !px-0" style={{ width: 36, height: 36, background: i === idx ? "var(--gold)" : picks[i] !== null ? "var(--card-2)" : "var(--bg-2)", color: i === idx ? "var(--on-gold)" : "var(--text)", border: `2px solid ${picks[i] !== null ? "var(--sky)" : "var(--edge)"}` }}>{i + 1}</button>)}
      </div>
      <div className="card mt-4" key={q.id}>
        <p className="text-xs font-bold muted">Question {idx + 1} of {qs.length} · {subjectById(q.subjectId)?.name}</p>
        <h2 className="text-lg font-extrabold mt-2 leading-snug">{q.prompt}</h2>
        {q.code && <pre className="code mt-3">{q.code}</pre>}
        <div className="grid gap-3 mt-5">{q.options.map((o, i) => <button key={i} onClick={() => setPicks((p) => p.map((v, k) => (k === idx ? i : v)))} className={`opt ${picks[idx] === i ? "opt-picked" : ""}`}><span className="key">{"ABCD"[i]}</span>{o}</button>)}</div>
        <div className="flex items-center justify-between mt-6 gap-2">
          <button disabled={idx === 0} onClick={() => setIdx(idx - 1)} className="btn btn-ghost btn-sm"><ChevronLeft size={16} /> Previous</button>
          {idx + 1 < qs.length ? <button onClick={() => setIdx(idx + 1)} className="btn btn-ghost btn-sm">Next <ChevronRight size={16} /></button> : <span />}
        </div>
      </div>
      <div className="mt-5">
        {!confirm ? <button onClick={() => (answered < qs.length ? setConfirm(true) : submit())} className="btn btn-pink btn-block"><Send size={16} /> Submit exam ({answered}/{qs.length} answered)</button>
          : <div className="card-flat"><p className="font-extrabold">{qs.length - answered} question(s) unanswered. Submit anyway?</p><div className="flex gap-3 mt-3"><button onClick={submit} className="btn btn-pink btn-sm">Yes, submit</button><button onClick={() => setConfirm(false)} className="btn btn-ghost btn-sm">Keep working</button></div></div>}
      </div>
    </div>
  );
}
