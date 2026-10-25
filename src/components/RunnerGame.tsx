"use client";
import { useEffect, useRef, useState } from "react";
import { Heart, Flame, Pause, Play, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Footprints, Coins } from "lucide-react";
import { shuffle, type Question } from "@/lib/data";
import { nextCombo } from "@/lib/engine";
import { ArcadeStart, useGameLoop, useCanvas, wrapText } from "./arcade";
import { Explain } from "./ui";
import type { AnswerRec, GameProps } from "./types";

/* ---- Pseudo-3D camera: x = lateral, y = height above ground, z = distance in front of the camera ---- */
const W = 480, H = 640, HZ = 170, F = 300, CH = 5.4, ZP = 4.2, ZN = 3.45, ZF = 90, ZSPAWN = 46, LW = 1.7, TOTAL = 10;
const LANE_COL = ["#ff7a59", "#2bb6ff", "#8bd450"];
const LANE_NAME = ["Left", "Middle", "Right"];
const TRAIN_COLS = [["#e53935", "#b71c1c", "#ff8a80"], ["#1e88e5", "#0d47a1", "#90caf9"], ["#fbc02d", "#f57f17", "#fff59d"], ["#43a047", "#1b5e20", "#a5d6a7"]];
const WALL_COLS = ["#ff8a65", "#4dd0e1", "#ba68c8", "#fff176", "#81c784", "#f06292"];
const BUILD = [["#7e9fd1", 60], ["#c58fcf", 90], ["#f2a07b", 50], ["#8ac4a7", 75], ["#e8c36a", 110], ["#8d99d9", 70]] as const;

type Kind = "train" | "barrier" | "bar" | "coin" | "gate";
interface Obj { kind: Kind; lane: number; z: number; len: number; col: number; q?: Question; opts?: { text: string; orig: number; lane: number }[]; done?: boolean; pick?: number; got?: boolean; y?: number }
interface Part { x: number; y: number; vx: number; vy: number; life: number; c: string }
interface Fl { x: number; y: number; text: string; life: number; c: string }
interface G {
  px: number; lane: number; camX: number; dist: number; t: number; jy: number; jv: number; slide: number; invuln: number; shake: number;
  objs: Obj[]; parts: Part[]; fl: Fl[]; nextGap: number; sinceGate: number; qi: number; score: number; coins: number; lives: number; combo: number; speedMul: number;
  endIn: number; over: boolean; paused: boolean; gateOut: boolean; gap: number; lastCrash: number;
}
const fresh = (): G => ({ px: 0, lane: 1, camX: 0, dist: 0, t: 0, jy: 0, jv: 0, slide: 0, invuln: 0, shake: 0, objs: [], parts: [], fl: [], nextGap: 22, sinceGate: 0, qi: 0, score: 0, coins: 0, lives: 5, combo: 0, speedMul: 1, endIn: -1, over: false, paused: false, gateOut: false, gap: 0, lastCrash: -99 });

function shade(hex: string, k: number) { const n = parseInt(hex.slice(1), 16); const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
const proj = (x: number, y: number, z: number, camX: number): [number, number, number] => { const k = F / z; return [W / 2 + (x - camX) * k, HZ + (CH - y) * k, k]; };
const laneX = (l: number) => (l - 1) * LW;

/** Code Runner: Subway-Surfers style endless runner. Dodge trains, jump barriers, slide under bars, and run through the lane with the right answer. */
export function RunnerGame({ record, finish, exit, lang }: GameProps) {
  const [pool, setPool] = useState<Question[] | null>(null);
  if (!pool) return <ArcadeStart title="Code Runner" icon={<Footprints size={40} />} maxLen={34}
    blurb="Run through the railway yard! Dodge trains, jump over barriers, slide under bars, grab coins, and at every quiz gate run through the lane with the correct answer."
    controls={["Keyboard: ← → change lane, ↑ or W jump, ↓ or S slide", "Phone: swipe left / right / up / down", "Trains block a lane: switch away. Hit something = lose a life (5 lives)"]}
    onStart={(p) => setPool(p.slice(0, TOTAL))} exit={exit} />;
  return <Run pool={pool} record={record} finish={finish} exit={exit} lang={lang} />;
}

function Run({ pool, record, finish, exit, lang }: GameProps & { pool: Question[] }) {
  const g = useRef<G>(fresh());
  const answers = useRef<AnswerRec[]>([]);
  const startedAt = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const city = useRef(Array.from({ length: 22 }, (_, i) => ({ x: i * 46 - 30, ...(() => { const b = BUILD[(i * 7 + 3) % BUILD.length]; return { c: b[0], h: b[1] + ((i * 13) % 30) }; })() })));
  const [sid] = useState(() => `runner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const [hud, setHud] = useState({ score: 0, lives: 5, combo: 0, coins: 0 });
  const [gateQ, setGateQ] = useState<{ q: Question; opts: { text: string; orig: number; lane: number }[] } | null>(null);
  const [fb, setFb] = useState<{ ok: boolean; q: Question; text: string } | null>(null);
  const [qNo, setQNo] = useState(0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const { ref, ctxRef } = useCanvas(W, H, "play");
  const apiRef = useRef({ record, finish });
  useEffect(() => { apiRef.current = { record, finish }; });
  useEffect(() => { startedAt.current = Date.now(); }, []);

  const sync = () => { const s = g.current; setHud({ score: s.score, lives: s.lives, combo: s.combo, coins: s.coins }); };
  const setLane = (l: number) => { const s = g.current; if (!s.over && !s.paused) s.lane = Math.max(0, Math.min(2, l)); };
  const jump = () => { const s = g.current; if (!s.over && !s.paused && s.jy <= 0.01) { s.jv = 10.5; s.slide = 0; } };
  const slide = () => { const s = g.current; if (!s.over && !s.paused) { s.slide = 0.9; if (s.jy > 0.01) s.jv = -14; } };
  function burst(x: number, y: number, cols: string[], n: number) { for (let i = 0; i < n; i++) g.current.parts.push({ x, y, vx: (Math.random() - 0.5) * 300, vy: -Math.random() * 260 - 30, life: 0.6 + Math.random() * 0.4, c: cols[i % cols.length] }); }

  function spawnPattern() {
    const s = g.current; const z = ZSPAWN; const lanes = shuffle([0, 1, 2]); const r = Math.random();
    const coinLine = (lane: number, n = 5, y = 1) => { for (let i = 0; i < n; i++) s.objs.push({ kind: "coin", lane, z: z + i * 2.2, len: 0, col: 0, y }); };
    let L = 3;
    if (r < 0.34) { // one or two trains: same length and colour, so they read as one train set
      const n = Math.random() < 0.5 ? 1 : 2; L = 9 + Math.floor(Math.random() * 3); const col = Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) s.objs.push({ kind: "train", lane: lanes[i], z, len: L, col });
      coinLine(lanes[2], 6);
    } else if (r < 0.64) { // jump barriers with a coin arc over the first one
      const n = Math.random() < 0.5 ? 1 : 2;
      for (let i = 0; i < n; i++) s.objs.push({ kind: "barrier", lane: lanes[i], z, len: 0.5, col: 0 });
      for (let i = 0; i < 5; i++) s.objs.push({ kind: "coin", lane: lanes[0], z: z - 3 + i * 1.5, len: 0, col: 0, y: 1.1 + Math.sin((i / 4) * Math.PI) * 1.2 });
      if (n === 1) coinLine(lanes[2], 5);
    } else { // slide-under bars
      const n = Math.random() < 0.5 ? 1 : 3;
      for (let i = 0; i < n; i++) s.objs.push({ kind: "bar", lane: lanes[i], z, len: 0.5, col: 0 });
      coinLine(lanes[0], 4, 0.6);
    }
    s.nextGap = L + 15 + Math.random() * 6;
  }
  function spawnGate() {
    const s = g.current; const q = pool[s.qi];
    const wrong = shuffle(q.options.map((_, i) => i).filter((i) => i !== q.correct)).slice(0, 2);
    const lanes = shuffle([0, 1, 2]);
    const opts = shuffle([q.correct, ...wrong]).map((orig, i) => ({ text: q.options[orig], orig, lane: lanes[i] }));
    s.objs.push({ kind: "gate", lane: 1, z: ZSPAWN, len: 0.6, col: 0, q, opts, done: false, pick: -1 });
    s.gateOut = true; setGateQ({ q, opts }); setFb(null); setQNo(s.qi + 1);
  }
  function resolveGate(o: Obj) {
    const s = g.current; o.done = true; s.gateOut = false;
    const opt = o.opts!.find((x) => x.lane === s.lane)!; const ok = opt.orig === o.q!.correct; const nc = nextCombo(s.combo, ok);
    const r = apiRef.current.record(o.q!, opt.orig, "runner", false, nc, sid);
    answers.current.push({ q: o.q!, selected: opt.orig, correct: r.correct, xp: r.xp });
    o.pick = opt.lane; s.combo = nc; s.qi++; s.sinceGate = 0; s.nextGap = 18;
    if (ok) { const pts = 150 + Math.min(nc, 6) * 25; s.score += pts; s.fl.push({ x: W / 2, y: 330, text: `+${pts}`, life: 1.3, c: "#fff200" }); burst(W / 2, 400, ["#ffd54f", "#69f0ae", "#40c4ff", "#ff80ab"], 34); }
    else { s.lives--; s.shake = 0.45; s.invuln = 1.2; s.fl.push({ x: W / 2, y: 330, text: "Wrong gate!", life: 1.3, c: "#ff5252" }); burst(W / 2, 420, ["#ff5252", "#ffab91"], 24); }
    setFb({ ok, q: o.q!, text: ok ? "Correct! 🎉" : `Not quite — answer: ${o.q!.options[o.q!.correct]}` });
    if (s.lives <= 0 || s.qi >= pool.length) s.endIn = s.lives <= 0 ? 1.4 : 2.6;
    sync();
  }
  /** Hitting an obstacle is a stumble (slows you, costs points). A second stumble within 6 seconds costs a life. */
  function crash(label: string) {
    const s = g.current; const caught = s.t - s.lastCrash < 6; s.lastCrash = s.t;
    s.shake = 0.4; s.invuln = 1.4; s.speedMul = 0.5; s.combo = 0; s.score = Math.max(0, s.score - 30);
    if (caught) { s.lives--; s.fl.push({ x: W / 2, y: 380, text: "Caught! -1 life", life: 1.3, c: "#ff5252" }); }
    else s.fl.push({ x: W / 2, y: 380, text: `${label} Careful!`, life: 1.1, c: "#ffb74d" });
    burst(W / 2, 480, ["#ff7043", "#ffab91", "#fff"], 18);
    if (s.lives <= 0) s.endIn = 1.4; sync();
  }
  function end() {
    const s = g.current; s.over = true; setDone(true);
    const c = answers.current.filter((a) => a.correct).length;
    const outcome = s.lives <= 0 ? "Busted by the inspector! 🚔" : c === answers.current.length ? "Perfect run! 🏁" : `Run complete — ${c}/${answers.current.length} gates right`;
    apiRef.current.finish({ mode: "runner", answers: answers.current, durationSec: Math.round((Date.now() - startedAt.current) / 1000), outcome, sid });
  }

  useGameLoop(!done, (dt) => {
    const s = g.current; if (s.paused || s.over) return;
    s.t += dt; s.shake = Math.max(0, s.shake - dt); s.invuln = Math.max(0, s.invuln - dt); s.slide = Math.max(0, s.slide - dt);
    s.speedMul = Math.min(1, s.speedMul + dt * 0.35);
    const V = Math.min(12, 7 + s.qi * 0.5) * s.speedMul;
    s.dist += V * dt; s.score += V * dt * 0.8;
    const tx = laneX(s.lane); s.px += (tx - s.px) * Math.min(1, dt * 13); s.camX += (s.px * 0.5 - s.camX) * Math.min(1, dt * 5);
    if (s.jy > 0 || s.jv > 0) { s.jv -= 22 * dt; s.jy = Math.max(0, s.jy + s.jv * dt); if (s.jy === 0) s.jv = 0; }
    if (s.endIn >= 0) { s.endIn -= dt; if (s.endIn < 0) { end(); return; } }
    else if (s.qi < pool.length) { // spawning
      s.gap += V * dt;
      if (s.gap >= s.nextGap) {
        s.gap = 0;
        if (!s.gateOut && s.sinceGate >= 2) { spawnGate(); s.nextGap = 26; }
        else if (!s.gateOut) { spawnPattern(); s.sinceGate++; }
      }
    }
    for (const o of s.objs) {
      o.z -= V * dt;
      if (o.kind === "gate" && !o.done && o.z <= ZP + 0.1) resolveGate(o);
      else if (o.kind === "coin" && !o.got && o.z < ZP + 0.6 && o.z > ZP - 0.6 && Math.abs(laneX(o.lane) - s.px) < 0.9) { o.got = true; s.coins++; s.score += 10; s.fl.push({ x: W / 2 + (laneX(o.lane) - s.camX) * 60, y: 450, text: "+10", life: 0.6, c: "#fff59d" }); sync(); }
      else if (s.invuln <= 0 && (o.kind === "train" || o.kind === "barrier" || o.kind === "bar") && !o.done) {
        const hit = o.kind === "train" ? o.z <= ZP + 0.4 && o.z + o.len >= ZP - 0.3 : o.z <= ZP + 0.3 && o.z + o.len >= ZP - 0.3;
        if (hit && Math.abs(laneX(o.lane) - s.px) < 0.85) {
          if (o.kind === "train") { o.done = true; crash("Train!"); }
          else if (o.kind === "barrier" && s.jy < 0.6) { o.done = true; crash("Ouch!"); }
          else if (o.kind === "bar" && s.slide <= 0) { o.done = true; crash("Bonk!"); }
        }
      }
    }
    s.objs = s.objs.filter((o) => o.z + o.len > ZN - 1 && !o.got && !(o.done && o.kind !== "gate"));
    for (const p of s.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 700 * dt; p.life -= dt; }
    s.parts = s.parts.filter((p) => p.life > 0);
    for (const f of s.fl) { f.y -= 45 * dt; f.life -= dt; }
    s.fl = s.fl.filter((f) => f.life > 0);
    draw();
  });

  /** A box in world space (x0..x1, y0..y1, zNear..zFar), drawn with its visible faces. */
  function box(ctx: CanvasRenderingContext2D, cx: number, x0: number, x1: number, y0: number, y1: number, zn: number, zf: number, col: string, front?: (p: number[]) => void) {
    const clipped = zn < ZN; zn = Math.max(zn, ZN); if (zf <= zn) return;
    const P = (x: number, y: number, z: number) => proj(x, y, z, cx);
    const quad = (pts: [number, number, number][], fill: string) => { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); };
    if (x1 < cx) quad([P(x1, y0, zn), P(x1, y0, zf), P(x1, y1, zf), P(x1, y1, zn)], shade(col, 0.72));
    else if (x0 > cx) quad([P(x0, y0, zn), P(x0, y0, zf), P(x0, y1, zf), P(x0, y1, zn)], shade(col, 0.72));
    if (y1 < CH) quad([P(x0, y1, zn), P(x1, y1, zn), P(x1, y1, zf), P(x0, y1, zf)], shade(col, 1.18));
    if (!clipped) quad([P(x0, y0, zn), P(x1, y0, zn), P(x1, y1, zn), P(x0, y1, zn)], col);
    if (front && !clipped) { const a = P(x0, y1, zn), b = P(x1, y0, zn); front([a[0], a[1], b[0] - a[0], b[1] - a[1]]); }
  }

  function draw() {
    const ctx = ctxRef.current; if (!ctx) return; const s = g.current; const cx = s.camX;
    ctx.save();
    if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
    // sky, sun, clouds
    const sky = ctx.createLinearGradient(0, 0, 0, HZ + 20); sky.addColorStop(0, "#43b4ff"); sky.addColorStop(1, "#d9f4ff"); ctx.fillStyle = sky; ctx.fillRect(-12, -12, W + 24, HZ + 40);
    ctx.fillStyle = "#fff6b0"; ctx.beginPath(); ctx.arc(380 - cx * 4, 70, 30, 0, 6.3); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.9)";
    for (let i = 0; i < 4; i++) { const x = ((i * 190 - s.t * 6 - cx * 6) % 760 + 760) % 760 - 140; ctx.beginPath(); ctx.ellipse(x, 40 + (i % 2) * 38, 48, 14, 0, 0, 6.3); ctx.ellipse(x + 30, 33 + (i % 2) * 38, 30, 14, 0, 0, 6.3); ctx.fill(); }
    // skyline
    for (const b of city.current) { const x = ((b.x - cx * 5) % 1012 + 1012) % 1012 - 60; ctx.fillStyle = b.c; ctx.fillRect(x, HZ - b.h, 38, b.h + 6); ctx.fillStyle = "rgba(255,255,255,.4)"; for (let yy = HZ - b.h + 8; yy < HZ - 6; yy += 14) ctx.fillRect(x + 7, yy, 7, 7), ctx.fillRect(x + 22, yy, 7, 7); }
    // ballast + tracks
    ctx.fillStyle = "#9a9284"; ctx.fillRect(-12, HZ, W + 24, H - HZ + 12);
    const SP = 2.4;
    const strip = (xa: number, xb: number, za: number, zb: number, fill: string) => { const a = proj(xa, 0, za, cx), b = proj(xb, 0, za, cx), c = proj(xb, 0, zb, cx), d = proj(xa, 0, zb, cx); ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); };
    for (let l = 0; l < 3; l++) { const c = laneX(l); strip(c - 0.82, c + 0.82, ZN, ZF, "#857d70"); }
    for (let k = Math.floor((ZN + s.dist) / SP) - 1; ; k++) {
      const zz = k * SP - s.dist; if (zz > ZF) break; const z0 = Math.max(zz, ZN), z1 = zz + 0.42; if (z1 <= ZN) continue;
      for (let l = 0; l < 3; l++) { const c = laneX(l); strip(c - 0.72, c + 0.72, z0, z1, "#6b4a2f"); }
    }
    for (let l = 0; l < 3; l++) { const c = laneX(l); strip(c - 0.5, c - 0.43, ZN, ZF, "#e3e7ec"); strip(c + 0.43, c + 0.5, ZN, ZF, "#e3e7ec"); }
    // side walls (colourful graffiti panels) + trees line
    const WS = 7;
    for (const sd of [-1, 1]) {
      for (let k = Math.floor((ZF + s.dist) / WS); k * WS - s.dist + WS > ZN; k--) {
        const z0 = Math.max(k * WS - s.dist, ZN), z1 = Math.min(k * WS - s.dist + WS, ZF); if (z1 <= z0) continue;
        const x = sd * 4.1; const a = proj(x, 0, z0, cx), b = proj(x, 0, z1, cx), c2 = proj(x, 3.4, z1, cx), d = proj(x, 3.4, z0, cx);
        ctx.fillStyle = WALL_COLS[((k % 6) + 6 + (sd > 0 ? 2 : 0)) % 6]; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
        const e = proj(x, 0.9, z0, cx), f = proj(x, 0.9, z1, cx); ctx.strokeStyle = "rgba(0,0,0,.18)"; ctx.lineWidth = Math.max(1, e[2] * 0.25); ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(f[0], f[1]); ctx.stroke();
      }
    }
    const hz = ctx.createLinearGradient(0, HZ, 0, HZ + 110); hz.addColorStop(0, "rgba(217,244,255,.95)"); hz.addColorStop(1, "rgba(217,244,255,0)"); ctx.fillStyle = hz; ctx.fillRect(-12, HZ, W + 24, 110);
    // objects far -> near
    const objs = [...s.objs].sort((a, b) => b.z - a.z);
    for (const o of objs) {
      if (o.z > ZF) continue; const c = laneX(o.lane);
      if (o.kind === "train") {
        const [m, d, l] = TRAIN_COLS[o.col];
        box(ctx, cx, c - 0.62, c + 0.62, 0.25, 3.0, o.z, o.z + o.len, m, ([x, y, w, h]) => {
          ctx.fillStyle = l; ctx.fillRect(x + w * 0.08, y + h * 0.1, w * 0.84, h * 0.3); ctx.fillStyle = "#17324a"; ctx.fillRect(x + w * 0.14, y + h * 0.16, w * 0.32, h * 0.2); ctx.fillRect(x + w * 0.54, y + h * 0.16, w * 0.32, h * 0.2);
          ctx.fillStyle = d; ctx.fillRect(x, y + h * 0.62, w, h * 0.1); ctx.fillStyle = "#fff59d"; ctx.beginPath(); ctx.arc(x + w * 0.2, y + h * 0.82, Math.max(1, w * 0.06), 0, 6.3); ctx.arc(x + w * 0.8, y + h * 0.82, Math.max(1, w * 0.06), 0, 6.3); ctx.fill();
        });
      } else if (o.kind === "barrier") {
        box(ctx, cx, c - 0.75, c + 0.75, 0, 0.85, o.z, o.z + 0.45, "#ff7043", ([x, y, w, h]) => { ctx.fillStyle = "#fff"; ctx.fillRect(x, y + h * 0.35, w, h * 0.28); ctx.fillStyle = "#212121"; for (let i = 0; i < 5; i++) ctx.fillRect(x + (w * i) / 5, y + h * 0.35, w / 10, h * 0.28); });
      } else if (o.kind === "bar") {
        box(ctx, cx, c - 0.75, c - 0.6, 0, 1.6, o.z, o.z + 0.4, "#546e7a"); box(ctx, cx, c + 0.6, c + 0.75, 0, 1.6, o.z, o.z + 0.4, "#546e7a");
        box(ctx, cx, c - 0.78, c + 0.78, 1.0, 1.55, o.z, o.z + 0.4, "#ffc107", ([x, y, w, h]) => { ctx.fillStyle = "#212121"; for (let i = 0; i < 6; i += 2) ctx.fillRect(x + (w * i) / 6, y, w / 6, h); });
      } else if (o.kind === "coin") {
        if (o.z < 1.5) continue; const [sx, sy, k] = proj(c, o.y ?? 1, o.z, cx); const wv = Math.abs(Math.cos(s.t * 6 + o.z)) * 0.8 + 0.2;
        ctx.fillStyle = "#ffca28"; ctx.strokeStyle = "#ef6c00"; ctx.lineWidth = Math.max(1, k * 0.05); ctx.beginPath(); ctx.ellipse(sx, sy, 0.3 * k * wv, 0.3 * k, 0, 0, 6.3); ctx.fill(); ctx.stroke();
      } else if (o.kind === "gate") {
        const half = 1.5 * LW + 0.4; if (o.z < ZN) continue;
        box(ctx, cx, -half - 0.3, -half, 0, 3.6, o.z, o.z + 0.5, "#37474f"); box(ctx, cx, half, half + 0.3, 0, 3.6, o.z, o.z + 0.5, "#37474f");
        box(ctx, cx, -half - 0.3, half + 0.3, 3.1, 3.6, o.z, o.z + 0.5, "#263238");
        for (const op of o.opts!) {
          const bc = o.done ? (op.orig === o.q!.correct ? "#2ecc71" : op.lane === o.pick ? "#e74c3c" : "#78909c") : LANE_COL[op.lane];
          const [bx, by, k] = proj(laneX(op.lane), 3.05, o.z, cx);
          ctx.fillStyle = bc; ctx.strokeStyle = "#fff"; ctx.lineWidth = Math.max(1, k * 0.06); ctx.beginPath(); ctx.roundRect(bx - 0.78 * k, by - 1.15 * k, 1.56 * k, 1.1 * k, 0.15 * k); ctx.fill(); ctx.stroke();
          if (k > 14) { ctx.fillStyle = "#10222b"; ctx.font = `800 ${Math.max(8, Math.min(20, k * 0.19))}px Nunito, system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; const lines = wrapText(ctx, op.text, 1.4 * k, 3); lines.forEach((t, i) => ctx.fillText(t, bx, by - 0.6 * k + (i - (lines.length - 1) / 2) * k * 0.28)); }
        }
      }
    }
    drawPlayer(ctx, s, cx);
    for (const p of s.parts) { ctx.globalAlpha = Math.max(0, p.life * 1.5); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 6, 6); }
    ctx.globalAlpha = 1; ctx.textAlign = "center"; ctx.font = "800 26px Nunito, system-ui, sans-serif"; ctx.lineJoin = "round";
    for (const f of s.fl) { ctx.globalAlpha = Math.min(1, f.life * 2); ctx.lineWidth = 5; ctx.strokeStyle = "rgba(0,0,0,.55)"; ctx.strokeText(f.text, f.x, f.y); ctx.fillStyle = f.c; ctx.fillText(f.text, f.x, f.y); }
    ctx.globalAlpha = 1; ctx.restore();
  }

  function drawPlayer(ctx: CanvasRenderingContext2D, s: G, cx: number) {
    const [sx, sy, k] = proj(s.px, s.jy, ZP, cx); const blink = s.invuln > 0 && Math.floor(s.t * 16) % 2 === 0;
    const sh = proj(s.px, 0, ZP, cx); ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(sh[0], sh[1], 0.45 * k * (1 - s.jy * 0.12), 0.14 * k, 0, 0, 6.3); ctx.fill();
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.max(-0.25, Math.min(0.25, (laneX(s.lane) - s.px) * 0.35))); if (blink) ctx.globalAlpha = 0.35;
    const sliding = s.slide > 0, run = Math.sin(s.t * 14) * (s.jy > 0.05 ? 0.25 : 1), U = k;
    if (sliding) { ctx.translate(0, -0.12 * U); ctx.scale(1, 0.5); }
    const leg = (dx: number, ph: number) => { ctx.strokeStyle = "#2b3a67"; ctx.lineWidth = 0.2 * U; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(dx * U, -0.8 * U); ctx.lineTo(dx * U, (-0.1 + 0.12 * ph) * U); ctx.stroke(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(dx * U, (0 + 0.12 * ph) * U, 0.17 * U, 0.09 * U, 0, 0, 6.3); ctx.fill(); };
    leg(-0.14, run); leg(0.14, -run);
    ctx.fillStyle = "#ff7a00"; ctx.beginPath(); ctx.roundRect(-0.3 * U, -1.5 * U, 0.6 * U, 0.78 * U, 0.14 * U); ctx.fill();            // hoodie
    ctx.fillStyle = "#20b2aa"; ctx.beginPath(); ctx.roundRect(-0.23 * U, -1.42 * U, 0.46 * U, 0.55 * U, 0.1 * U); ctx.fill();            // backpack
    ctx.strokeStyle = "#ff7a00"; ctx.lineWidth = 0.15 * U; ctx.beginPath(); ctx.moveTo(-0.3 * U, -1.35 * U); ctx.lineTo((-0.42) * U, (-0.95 + 0.1 * run) * U); ctx.moveTo(0.3 * U, -1.35 * U); ctx.lineTo(0.42 * U, (-0.95 - 0.1 * run) * U); ctx.stroke(); // arms
    ctx.fillStyle = "#f1c27d"; ctx.beginPath(); ctx.arc(0, -1.72 * U, 0.2 * U, 0, 6.3); ctx.fill();                                          // head
    ctx.fillStyle = "#e53935"; ctx.beginPath(); ctx.arc(0, -1.76 * U, 0.215 * U, Math.PI, 0); ctx.fill(); ctx.fillRect(-0.215 * U, -1.77 * U, 0.43 * U, 0.05 * U); // cap
    ctx.restore();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase(); let used = true;
      if (k === "arrowleft" || k === "a") setLane(g.current.lane - 1); else if (k === "arrowright" || k === "d") setLane(g.current.lane + 1);
      else if (k === "arrowup" || k === "w") jump(); else if (k === "arrowdown" || k === "s") slide(); else if (k === " " || k === "p") togglePause(); else used = false;
      if (used) e.preventDefault();
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);
  function togglePause() { const s = g.current; s.paused = !s.paused; setPaused(s.paused); }

  return (
    <div className="wrap-narrow" style={{ maxWidth: 420 }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 font-extrabold text-sm">
          <span className="flex gap-0.5" aria-label={`${hud.lives} lives`}>{[0, 1, 2, 3, 4].map((i) => <Heart key={i} size={19} className={i < hud.lives ? "text-[var(--pink)]" : "muted"} fill={i < hud.lives ? "currentColor" : "none"} />)}</span>
          <span className="gold">{Math.floor(hud.score)}</span>
          <span className="flex items-center gap-1 text-[var(--text)]"><Coins size={14} className="gold" />{hud.coins}</span>
          {hud.combo >= 2 && <span className="flex items-center gap-1 text-[var(--pink)]"><Flame size={14} />x{hud.combo}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="chip">Gate {Math.min(qNo, pool.length)}/{pool.length}</span>
          <button onClick={togglePause} className="btn btn-ghost icon-btn" aria-label={paused ? "Resume" : "Pause"}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
          <button onClick={exit} className="btn btn-ghost icon-btn" aria-label="Exit game"><X size={18} /></button>
        </div>
      </div>
      <div className="card-flat mt-2.5" style={{ minHeight: 70, borderColor: fb ? (fb.ok ? "var(--good)" : "var(--bad)") : undefined }}>
        {fb ? (<><p className="font-extrabold text-sm" style={{ color: fb.ok ? "var(--good)" : "var(--bad)" }}>{fb.text}</p><Explain q={fb.q} lang={lang} className="mt-1 muted" /></>)
          : gateQ ? (<><p className="font-extrabold leading-snug text-sm">{gateQ.q.prompt}</p>
            <div className="grid grid-cols-3 gap-1.5 mt-2">{[0, 1, 2].map((l) => { const op = gateQ.opts.find((o) => o.lane === l)!; return <button key={l} onClick={() => setLane(l)} className="rounded-lg px-1.5 py-1 text-[11.5px] font-extrabold leading-tight text-left" style={{ background: LANE_COL[l], color: "#10222b", border: "2px solid rgba(0,0,0,.25)" }}><span className="block opacity-70 text-[10px]">{LANE_NAME[l]}</span>{op.text}</button>; })}</div></>)
            : <p className="font-extrabold text-sm muted">Run! Jump ↑ · Slide ↓ · Switch lanes ← →. A quiz gate is coming…</p>}
      </div>
      <div className="relative mt-2.5 rounded-2xl overflow-hidden" style={{ border: "2px solid var(--edge)", touchAction: "none" }}>
        <canvas ref={ref} style={{ width: "100%", aspectRatio: `${W} / ${H}`, display: "block" }} aria-label="Game area"
          onPointerDown={(e) => { swipe.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={(e) => { const st = swipe.current; swipe.current = null; if (!st) return; const dx = e.clientX - st.x, dy = e.clientY - st.y; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; if (Math.abs(dx) > Math.abs(dy)) setLane(g.current.lane + (dx > 0 ? 1 : -1)); else if (dy < 0) jump(); else slide(); }} />
        {paused && <div className="absolute inset-0 grid place-items-center" style={{ background: "rgba(10,30,45,.7)" }}><div className="text-center"><p className="h2">Paused</p><button onClick={togglePause} className="btn btn-gold mt-3">Resume</button></div></div>}
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2.5 md:hidden">
        <button className="btn !px-0" onClick={() => setLane(g.current.lane - 1)} aria-label="Move left"><ChevronLeft size={22} /></button>
        <button className="btn !px-0" onClick={jump} aria-label="Jump"><ChevronUp size={22} /></button>
        <button className="btn !px-0" onClick={slide} aria-label="Slide"><ChevronDown size={22} /></button>
        <button className="btn !px-0" onClick={() => setLane(g.current.lane + 1)} aria-label="Move right"><ChevronRight size={22} /></button>
      </div>
    </div>
  );
}
