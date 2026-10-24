"use client";
import type { ReactNode } from "react";
import { Home, BookOpen, Gamepad2, User, RotateCcw, Bot, Flame, Star, Wifi, WifiOff } from "lucide-react";
import type { levelFromXP, Store } from "@/lib/engine";
import { Brand, Bar } from "./ui";
import type { View } from "./types";

const TABS: { id: View; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Home", Icon: Home }, { id: "learn", label: "Learn", Icon: BookOpen },
  { id: "play", label: "Play", Icon: Gamepad2 }, { id: "mistakes", label: "Fix", Icon: RotateCcw },
  { id: "coach", label: "Coach", Icon: Bot }, { id: "profile", label: "Profile", Icon: User },
];
const ACTIVE: Partial<Record<View, View>> = { subject: "learn", results: "play" };

interface Props { view: View; go: (v: View) => void; store: Store; lvl: ReturnType<typeof levelFromXP>; mistakeCount: number; online: boolean; children: ReactNode }

/** Sidebar on desktop, bottom tab bar + compact header on phones. */
export function Shell({ view, go, store, lvl, mistakeCount, online, children }: Props) {
  const cur = ACTIVE[view] ?? view;
  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col p-5 z-40" style={{ background: "var(--bg-2)", borderRight: "2px solid var(--edge)" }}>
        <button onClick={() => go("home")} className="text-left bg-transparent border-0 p-0" aria-label="CampusXP home"><Brand size={26} /><p className="text-xs muted mt-1 font-bold">Learn. Play. Level Up.</p></button>
        <div className="card-flat mt-6">
          <div className="flex justify-between items-center text-sm font-extrabold"><span className="flex items-center gap-1.5"><Star size={16} className="gold" fill="currentColor" /> Level {lvl.level}</span><span>{store.xp} XP</span></div>
          <div className="mt-2"><Bar value={lvl.progress * 100} thin /></div>
          <p className="text-[11px] muted mt-1.5 font-bold">{lvl.needed - lvl.into} XP to level {lvl.level + 1}</p>
          <p className="text-xs mt-2 flex items-center gap-1.5 font-extrabold"><Flame size={15} className="text-[var(--pink)]" /> {store.streak}-day streak</p>
        </div>
        <nav className="mt-5 grid gap-1.5" aria-label="Main">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => go(id)} aria-current={cur === id ? "page" : undefined} className="nav-btn">
              <Icon size={20} />{id === "mistakes" ? "Review mistakes" : id === "coach" ? "AI Coach" : label}
              {id === "mistakes" && mistakeCount > 0 && <span className="ml-auto chip chip-pink !py-0">{mistakeCount}</span>}
            </button>
          ))}
        </nav>
        <p className="mt-auto text-xs muted font-bold flex items-center gap-1.5">{online ? <><Wifi size={13} className="text-[var(--good)]" /> Saved on this device</> : <><WifiOff size={13} className="gold" /> Offline — games still work</>}</p>
      </aside>

      <header className="md:hidden flex items-center justify-between px-4 pt-4">
        <button onClick={() => go("home")} className="bg-transparent border-0 p-0" aria-label="CampusXP home"><Brand size={26} /></button>
        <div className="flex items-center gap-2 text-sm font-extrabold">
          <span className="chip"><Flame size={14} className="text-[var(--pink)]" />{store.streak}</span>
          <span className="chip chip-gold">Lv {lvl.level} · {store.xp} XP</span>
        </div>
      </header>

      <main className="md:pl-56 pb-28 md:pb-12"><div className="max-w-7xl mx-auto px-5 pt-5">{children}</div></main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5" style={{ background: "var(--bg-2)", borderTop: "2px solid var(--edge)" }} aria-label="Mobile">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => go(id)} aria-current={cur === id ? "page" : undefined} className="tab-btn relative">
            <Icon size={21} />{label}
            {id === "mistakes" && mistakeCount > 0 && <span className="absolute top-0 right-[22%] w-2.5 h-2.5 rounded-full" style={{ background: "var(--pink)" }} />}
          </button>
        ))}
      </nav>
    </>
  );
}
