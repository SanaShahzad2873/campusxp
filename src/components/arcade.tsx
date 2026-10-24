"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play, X } from "lucide-react";
import { QUESTIONS, SUBJECTS, shuffle, type Question } from "@/lib/data";

/** Questions whose prompt and options are short enough to be drawn inside a game world. */
export function shortPool(subjectId: string, maxLen: number): Question[] {
  const ok = (q: Question) => !q.code && q.prompt.length <= 150 && q.options.every((o) => o.length <= maxLen);
  const own = shuffle(QUESTIONS.filter((q) => ok(q) && (subjectId === "all" || q.subjectId === subjectId)));
  if (subjectId === "all" || own.length >= 8) return own;
  return [...own, ...shuffle(QUESTIONS.filter((q) => ok(q) && q.subjectId !== subjectId))]; // top up when a subject is still small
}

/** requestAnimationFrame loop with a clamped delta so a background tab can't teleport things. */
export function useGameLoop(active: boolean, step: (dt: number) => void) {
  const stepRef = useRef(step);
  useEffect(() => { stepRef.current = step; });
  useEffect(() => {
    if (!active) return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; stepRef.current(dt); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

/** Canvas with a fixed logical size, crisp on high-DPI screens. Returns the ref and a 2D context scaled to logical units. */
export function useCanvas(w: number, h: number, phase: string) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctxRef.current = ctx;
  }, [w, h, phase]);
  return { ref, ctxRef };
}

/** Pointer position in logical canvas units. */
export function canvasPoint(c: HTMLCanvasElement, e: { clientX: number; clientY: number }, w: number, h: number) {
  const r = c.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { const k = lines.slice(0, maxLines); k[maxLines - 1] = k[maxLines - 1].replace(/.{0,2}$/, "…"); return k; }
  return lines;
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

interface StartProps { title: string; icon: ReactNode; blurb: string; controls: string[]; maxLen: number; onStart: (pool: Question[]) => void; exit: () => void }

/** Shared pre-game screen: what the game is, how to control it, and which subject to practise. */
export function ArcadeStart({ title, icon, blurb, controls, maxLen, onStart, exit }: StartProps) {
  const [subject, setSubject] = useState("all");
  const own = QUESTIONS.filter((q) => subject === "all" || q.subjectId === subject).filter((q) => !q.code && q.options.every((o) => o.length <= maxLen)).length;
  const note = subject !== "all" && own < 8 ? `Only ${own} short question${own === 1 ? "" : "s"} in this subject so far; others are mixed in.` : "";
  return (
    <div className="wrap-narrow">
      <div className="flex items-center justify-between"><div className="gold">{icon}</div><button onClick={exit} className="btn btn-ghost icon-btn" aria-label="Back to games"><X size={18} /></button></div>
      <h1 className="h1 mt-2">{title}</h1>
      <p className="muted mt-2 text-sm">{blurb}</p>
      <div className="card-flat mt-4"><p className="label">Controls</p><ul className="mt-2 grid gap-1 text-sm font-bold">{controls.map((c) => <li key={c}>• {c}</li>)}</ul></div>
      <p className="label mt-5">Subject</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {[{ id: "all", name: "All subjects" }, ...SUBJECTS].map((s) => (
          <button key={s.id} onClick={() => setSubject(s.id)} aria-pressed={subject === s.id} className={`btn btn-sm ${subject === s.id ? "btn-gold" : "btn-ghost"}`}>{s.name}</button>
        ))}
      </div>
      {note && <p className="text-xs muted mt-2">{note}</p>}
      <button onClick={() => onStart(shortPool(subject, maxLen))} className="btn btn-gold btn-block !py-3.5 mt-6 text-base"><Play size={18} /> Start</button>
    </div>
  );
}
