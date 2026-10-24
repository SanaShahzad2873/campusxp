"use client";
import { useEffect, useRef, useState } from "react";
import { Heart, Flame, Pause, Play, X, ChevronLeft, ChevronRight, Footprints } from "lucide-react";
import { shuffle, type Question } from "@/lib/data";
import { nextCombo } from "@/lib/engine";
import { ArcadeStart, useGameLoop, useCanvas, canvasPoint, wrapText, roundRect } from "./arcade";
import { Explain } from "./ui";
import type { AnswerRec, GameProps } from "./types";

const W = 480, H = 640, PY = 500, TOTAL = 10, LANE_X = [80, 240, 400];
const LANE_COL = ["#4cc9f0", "#ff5d8f", "#a78bfa"];
interface Opt { text: string; orig: number; lane: number }
interface Gate { y: number; q: Question; opts: Opt[]; done: boolean; pick: number; ok: boolean }
interface Part { x: number; y: number; vx: number; vy: number; life: number; c: string }
interface Floater { x: number; y: number; text: string; life: number; c: string }
interface Coin { lane: number; y: number; got: boolean }
interface G {
  lane: number; x: number; t: number; roadOff: number; gates: Gate[]; coins: Coin[]; parts: Part[]; floaters: Floater[];
  qi: number; spawnIn: number; score: number; lives: number; combo: number; shake: number; hurt: number; endIn: number; over: boolean; paused: boolean;
}
const fresh = (): G => ({ lane: 1, x: LANE_X[1], t: 0, roadOff: 0, gates: [], coins: [], parts: [], floaters: [], qi: 0, spawnIn: 0.8, score: 0, lives: 3, combo: 0, shake: 0, hurt: 0, endIn: -1, over: false, paused: false });

/** Code Runner: Subway-Surfers style. Steer into the lane holding the correct answer. */
export function RunnerGame({ record, finish, exit, lang }: GameProps) {
  const [pool, setPool] = useState<Question[] | null>(null);
  if (!pool) return <ArcadeStart title="Code Runner" icon={<Footprints size={40} />} maxLen={34}
    blurb="Run down the server corridor. Each gate shows three answers, one per lane. Steer into the right one before you reach it. Three lives, ten questions."
    controls={["Keyboard: ← → or A / D", "Phone: swipe left or right, or tap a lane", "Wrong lane = lose a life; streaks give bonus points"]}
    onStart={(p) => setPool(p.slice(0, TOTAL))} exit={exit} />;
  return <Run pool={pool} record={record} finish={finish} exit={exit} lang={lang} />;
}

function Run({ pool, record, finish, exit, lang }: GameProps & { pool: Question[] }) {
  const g = useRef<G>(fresh());
  const answers = useRef<AnswerRec[]>([]);
  const startedAt = useRef(0);
  const swipe = useRef<{ x: number } | null>(null);
  const [sid] = useState(() => `runner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const [hud, setHud] = useState({ score: 0, lives: 3, combo: 0, qi: 0 });
  const [cur, setCur] = useState<Question | null>(null);
  const [fb, setFb] = useState<{ ok: boolean; q: Question; text: string } | null>(null);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const { ref, ctxRef } = useCanvas(W, H, "play");
  const apiRef = useRef({ record, finish });
  useEffect(() => { apiRef.current = { record, finish }; });
  useEffect(() => { startedAt.current = Date.now(); }, []);

  const sync = () => { const s = g.current; setHud({ score: s.score, lives: s.lives, combo: s.combo, qi: s.qi }); };
  function burst(x: number, y: number, cols: string[], n: number) { for (let i = 0; i < n; i++) g.current.parts.push({ x, y, vx: (Math.random() - 0.5) * 320, vy: -Math.random() * 280 - 40, life: 0.7 + Math.random() * 0.4, c: cols[i % cols.length] }); }
  function setLane(l: number) { if (!g.current.over && !g.current.paused) g.current.lane = Math.max(0, Math.min(2, l)); }

  function spawn() {
    const s = g.current; const q = pool[s.qi];
    const wrong = shuffle(q.options.map((_, i) => i).filter((i) => i !== q.correct)).slice(0, 2);
    const lanes = shuffle([0, 1, 2]);
    const opts = shuffle([q.correct, ...wrong]).map((orig, i) => ({ text: q.options[orig], orig, lane: lanes[i] }));
    s.gates.push({ y: -70, q, opts, done: false, pick: -1, ok: false });
    const cl = Math.floor(Math.random() * 3);
    for (let i = 0; i < 5; i++) s.coins.push({ lane: cl, y: -170 - i * 52, got: false });
    setCur(q); setFb(null);
  }

  function resolve(gate: Gate) {
    const s = g.current; gate.done = true;
    const opt = gate.opts.find((o) => o.lane === s.lane)!;
    const ok = opt.orig === gate.q.correct; const nc = nextCombo(s.combo, ok);
    const r = apiRef.current.record(gate.q, opt.orig, "runner", false, nc, sid);
    answers.current.push({ q: gate.q, selected: opt.orig, correct: r.correct, xp: r.xp });
    gate.pick = opt.lane; gate.ok = ok; s.combo = nc; s.qi++;
    if (ok) { const pts = 100 + Math.min(nc, 6) * 20; s.score += pts; s.floaters.push({ x: s.x, y: PY - 50, text: `+${pts}`, life: 1.1, c: "#ffc93c" }); burst(s.x, PY - 30, ["#ffc93c", "#3ddc97", "#4cc9f0"], 26); }
    else { s.lives--; s.shake = 0.4; s.hurt = 0.8; s.floaters.push({ x: s.x, y: PY - 50, text: "Wrong!", life: 1.1, c: "#ff6b6b" }); burst(s.x, PY - 30, ["#ff6b6b", "#ffb3b3"], 22); }
    setFb({ ok, q: gate.q, text: ok ? "Correct!" : `Not quite — answer: ${gate.q.options[gate.q.correct]}` });
    s.spawnIn = 2.2;
    if (s.lives <= 0 || s.qi >= pool.length) s.endIn = 1.8;
    sync();
  }

  function end() {
    const s = g.current; s.over = true; setDone(true);
    const c = answers.current.filter((a) => a.correct).length;
    const outcome = s.lives <= 0 ? "Crashed into the firewall!" : c === answers.current.length ? "Flawless run! 🏁" : `Finished the run — ${c}/${answers.current.length} right`;
    apiRef.current.finish({ mode: "runner", answers: answers.current, durationSec: Math.round((Date.now() - startedAt.current) / 1000), outcome, sid });
  }

  useGameLoop(!done, (dt) => {
    const s = g.current; if (s.paused || s.over) return;
    s.t += dt; s.shake = Math.max(0, s.shake - dt); s.hurt = Math.max(0, s.hurt - dt);
    const speed = Math.min(250, 115 + s.qi * 11);
    s.roadOff = (s.roadOff + speed * dt) % 80;
    s.x += (LANE_X[s.lane] - s.x) * Math.min(1, dt * 14);
    if (s.endIn >= 0) { s.endIn -= dt; if (s.endIn < 0) { end(); return; } }
    else if (!s.gates.length && s.qi < pool.length) { s.spawnIn -= dt; if (s.spawnIn <= 0) spawn(); }
    for (const gate of s.gates) { gate.y += speed * dt; if (!gate.done && gate.y + 40 >= PY) resolve(gate); }
    s.gates = s.gates.filter((x) => x.y < H + 90);
    for (const c of s.coins) {
      c.y += speed * dt;
      if (!c.got && c.lane === s.lane && Math.abs(c.y - PY) < 30) { c.got = true; s.score += 10; s.floaters.push({ x: LANE_X[c.lane], y: PY - 30, text: "+10", life: 0.6, c: "#ffe28a" }); sync(); }
    }
    s.coins = s.coins.filter((c) => c.y < H + 30 && !c.got);
    for (const p of s.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 700 * dt; p.life -= dt; }
    s.parts = s.parts.filter((p) => p.life > 0);
    for (const f of s.floaters) { f.y -= 50 * dt; f.life -= dt; }
    s.floaters = s.floaters.filter((f) => f.life > 0);
    draw();
  });

  function draw() {
    const ctx = ctxRef.current; if (!ctx) return; const s = g.current;
    ctx.save();
    if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#061416"); bg.addColorStop(1, "#0f3a40"); ctx.fillStyle = bg; ctx.fillRect(-10, -10, W + 20, H + 20);
    // floor stripes (speed feel) and lane dividers
    ctx.strokeStyle = "rgba(120,220,220,.07)"; ctx.lineWidth = 2;
    for (let y = -80 + s.roadOff; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.setLineDash([26, 22]); ctx.lineDashOffset = -s.roadOff * 1.2;
    for (const x of [160, 320]) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffc93c"; ctx.fillRect(0, 0, 6, H); ctx.fillRect(W - 6, 0, 6, H);
    // coins
    for (const c of s.coins) { ctx.fillStyle = "#ffc93c"; ctx.beginPath(); ctx.ellipse(LANE_X[c.lane], c.y, 9 * Math.abs(Math.cos(s.t * 5 + c.y / 40)) + 2, 11, 0, 0, 6.3); ctx.fill(); ctx.strokeStyle = "#b88300"; ctx.lineWidth = 2; ctx.stroke(); }
    // gates
    ctx.font = "800 15px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const gate of s.gates) {
      for (const o of gate.opts) {
        const x = LANE_X[o.lane] - 68, y = gate.y - 36; const right = o.orig === gate.q.correct;
        const col = gate.done ? (right ? "#3ddc97" : o.lane === gate.pick ? "#ff6b6b" : "#33565a") : LANE_COL[o.lane];
        ctx.fillStyle = "rgba(0,0,0,.35)"; roundRect(ctx, x + 3, y + 6, 136, 72, 14); ctx.fill();
        ctx.fillStyle = col; roundRect(ctx, x, y, 136, 72, 14); ctx.fill();
        ctx.fillStyle = "#08201f"; const lines = wrapText(ctx, o.text, 120, 3);
        lines.forEach((t, i) => ctx.fillText(t, LANE_X[o.lane], gate.y + (i - (lines.length - 1) / 2) * 18));
      }
    }
    // runner
    const px = s.x, bob = Math.sin(s.t * 16) * 3, leg = Math.sin(s.t * 16) * 9;
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(px, PY + 38, 22, 7, 0, 0, 6.3); ctx.fill();
    const blink = s.hurt > 0 && Math.floor(s.t * 14) % 2 === 0;
    ctx.globalAlpha = blink ? 0.35 : 1;
    ctx.strokeStyle = "#17414a"; ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(px - 6, PY + 14 + bob); ctx.lineTo(px - 6 + leg, PY + 36); ctx.moveTo(px + 6, PY + 14 + bob); ctx.lineTo(px + 6 - leg, PY + 36); ctx.stroke();
    ctx.fillStyle = "#4cc9f0"; roundRect(ctx, px - 20, PY - 22 + bob, 12, 28, 5); ctx.fill();            // backpack
    ctx.fillStyle = "#ffc93c"; roundRect(ctx, px - 14, PY - 18 + bob, 28, 36, 10); ctx.fill();          // hoodie
    ctx.fillStyle = "#f2c9a0"; ctx.beginPath(); ctx.arc(px, PY - 30 + bob, 13, 0, 6.3); ctx.fill();     // head
    ctx.fillStyle = "#17414a"; ctx.beginPath(); ctx.arc(px, PY - 34 + bob, 13, Math.PI, 0); ctx.fill(); ctx.fillRect(px - 13, PY - 35 + bob, 26, 4); // cap
    ctx.fillStyle = "#08201f"; ctx.fillRect(px + 2, PY - 29 + bob, 3, 3);
    ctx.globalAlpha = 1;
    for (const p of s.parts) { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 6, 6); }
    ctx.globalAlpha = 1;
    ctx.font = "800 22px Nunito, system-ui, sans-serif";
    for (const f of s.floaters) { ctx.globalAlpha = Math.min(1, f.life * 2); ctx.fillStyle = f.c; ctx.fillText(f.text, f.x, f.y); }
    ctx.globalAlpha = 1;
    const fog = ctx.createLinearGradient(0, 0, 0, 160); fog.addColorStop(0, "rgba(6,20,22,.9)"); fog.addColorStop(1, "rgba(6,20,22,0)"); ctx.fillStyle = fog; ctx.fillRect(0, 0, W, 160);
    ctx.restore();
  }

  useEffect(() => { // keyboard controls
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") { setLane(g.current.lane - 1); e.preventDefault(); }
      if (k === "arrowright" || k === "d") { setLane(g.current.lane + 1); e.preventDefault(); }
      if (k === " " || k === "p") { togglePause(); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
    // 
  }, []);
  function togglePause() { const s = g.current; s.paused = !s.paused; setPaused(s.paused); }

  return (
    <div className="wrap-narrow" style={{ maxWidth: 440 }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 font-extrabold text-sm">
          <span className="flex gap-0.5" aria-label={`${hud.lives} lives`}>{[0, 1, 2].map((i) => <Heart key={i} size={20} className={i < hud.lives ? "text-[var(--pink)]" : "muted"} fill={i < hud.lives ? "currentColor" : "none"} />)}</span>
          <span className="gold">{hud.score}</span>
          {hud.combo >= 2 && <span className="flex items-center gap-1 text-[var(--pink)]"><Flame size={15} />x{hud.combo}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="chip">Gate {Math.min(hud.qi + (cur && !fb ? 1 : 0), pool.length)}/{pool.length}</span>
          <button onClick={togglePause} className="btn btn-ghost icon-btn" aria-label={paused ? "Resume" : "Pause"}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
          <button onClick={exit} className="btn btn-ghost icon-btn" aria-label="Exit game"><X size={18} /></button>
        </div>
      </div>
      <div className="card-flat mt-3" style={{ minHeight: 78, borderColor: fb ? (fb.ok ? "var(--good)" : "var(--bad)") : undefined }}>
        {fb ? (<><p className="font-extrabold text-sm" style={{ color: fb.ok ? "var(--good)" : "var(--bad)" }}>{fb.text}</p><Explain q={fb.q} lang={lang} className="mt-1 muted" /></>)
          : <p className="font-extrabold leading-snug">{cur ? cur.prompt : "Get ready…"}</p>}
      </div>
      <div className="relative mt-3 rounded-2xl overflow-hidden" style={{ border: "2px solid var(--edge)", touchAction: "none" }}>
        <canvas ref={ref} style={{ width: "100%", aspectRatio: `${W} / ${H}`, display: "block" }} aria-label="Game area"
          onPointerDown={(e) => { swipe.current = { x: e.clientX }; }}
          onPointerUp={(e) => {
            const st = swipe.current; swipe.current = null; if (!st) return; const dx = e.clientX - st.x;
            if (Math.abs(dx) > 30) setLane(g.current.lane + (dx > 0 ? 1 : -1));
            else { const p = canvasPoint(e.currentTarget, e, W, H); setLane(Math.floor(p.x / (W / 3))); }
          }} />
        {paused && <div className="absolute inset-0 grid place-items-center" style={{ background: "rgba(6,20,22,.75)" }}><div className="text-center"><p className="h2">Paused</p><button onClick={togglePause} className="btn btn-gold mt-3">Resume</button></div></div>}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 md:hidden">
        <button className="btn" onClick={() => setLane(g.current.lane - 1)} aria-label="Move left"><ChevronLeft size={20} /> Left</button>
        <button className="btn" onClick={() => setLane(g.current.lane + 1)} aria-label="Move right">Right <ChevronRight size={20} /></button>
      </div>
    </div>
  );
}
