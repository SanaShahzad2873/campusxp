"use client";
import { useRef, useState } from "react";
import { Brain, X, RefreshCw } from "lucide-react";
import { GLOSSARY, shuffle } from "@/lib/data";
import { matchXP } from "@/lib/engine";
import type { GameProps } from "./types";

const PAIRS = 6;
interface Card { key: string; pair: number; kind: "term" | "meaning"; text: string }

/** Memory Match: flip cards to pair each CS term with its meaning. Fewer moves = more XP. */
export function MatchGame({ finish, exit }: GameProps) {
  const [cards, setCards] = useState<Card[]>(() => deal());
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [sid, setSid] = useState(() => `match-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function deal(): Card[] {
    const picks = shuffle(GLOSSARY).slice(0, PAIRS);
    return shuffle(picks.flatMap((t, p) => [
      { key: `t${p}`, pair: p, kind: "term" as const, text: t.term },
      { key: `m${p}`, pair: p, kind: "meaning" as const, text: t.meaning },
    ]));
  }
  function restart() { if (timer.current) clearTimeout(timer.current); setCards(deal()); setOpen([]); setMatched([]); setMoves(0); setLocked(false); setStartedAt(Date.now()); setSid(`match-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`); }

  function flip(i: number) {
    if (locked || open.includes(i) || matched.includes(cards[i].pair)) return;
    const now = [...open, i];
    setOpen(now);
    if (now.length < 2) return;
    const m = moves + 1; setMoves(m);
    const [a, b] = now.map((n) => cards[n]);
    if (a.pair === b.pair && a.kind !== b.kind) {
      const all = [...matched, a.pair];
      setMatched(all); setOpen([]);
      if (all.length === PAIRS) {
        setLocked(true);
        timer.current = setTimeout(() => finish({ mode: "match", answers: [], durationSec: Math.round((Date.now() - startedAt) / 1000), outcome: m <= 8 ? "Photographic memory! 🧠" : "All pairs found!", sid, correct: PAIRS, total: m, gameXP: matchXP(PAIRS, m) }), 700);
      }
    } else {
      setLocked(true);
      timer.current = setTimeout(() => { setOpen([]); setLocked(false); }, 900);
    }
  }

  return (
    <div className="wrap-narrow" style={{ maxWidth: 760 }}>
      <div className="flex items-center justify-between">
        <p className="h2 flex items-center gap-2"><Brain className="gold" /> Memory Match</p>
        <div className="flex gap-2">
          <button onClick={restart} className="btn btn-ghost icon-btn" aria-label="Reshuffle"><RefreshCw size={18} /></button>
          <button onClick={exit} className="btn btn-ghost icon-btn" aria-label="Exit game"><X size={18} /></button>
        </div>
      </div>
      <p className="muted text-sm mt-2">Match each gold term with its meaning. Moves: <b className="text-[var(--text)]">{moves}</b> · Pairs: <b className="text-[var(--text)]">{matched.length}/{PAIRS}</b> (aim for {PAIRS * 2} moves or fewer)</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-5">
        {cards.map((c, i) => {
          const done = matched.includes(c.pair), on = done || open.includes(i);
          return (
            <button key={c.key} onClick={() => flip(i)} aria-label={on ? c.text : "Hidden card"} className={`flip ${on ? "on" : ""} ${done ? "done" : ""} ${c.kind === "term" ? "term" : ""} border-0 bg-transparent p-0`}>
              <div className="flip-in"><div className="flip-face flip-front">?</div><div className="flip-face flip-back">{c.text}</div></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
