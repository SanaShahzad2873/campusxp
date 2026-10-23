import { Gamepad2 } from "lucide-react";
import { MODES } from "./modes";
import type { View } from "./types";

export function PlayView({ go, best }: { go: (v: View) => void; best: Record<string, number> }) {
  return (
    <div>
      <h1 className="h1 flex items-center gap-3"><Gamepad2 className="gold" size={34} /> Choose a game</h1>
      <p className="muted text-sm mt-2">Every question comes with an explanation, so you learn even when you lose.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {MODES.map((m) => (
          <div key={m.v} className="card flex flex-col">
            <span className="inline-grid place-items-center w-12 h-12 rounded-xl" style={{ background: m.tint, color: "#12130f", border: "2px solid rgba(0,0,0,.3)" }}><m.Icon size={24} strokeWidth={2.4} /></span>
            <h2 className="display text-xl mt-3">{m.name}</h2>
            <p className="muted text-sm mt-2 flex-1">{m.how}</p>
            {best[m.bestKey] !== undefined && <p className="text-xs font-extrabold gold mt-3">{m.bestLabel}: {best[m.bestKey]}</p>}
            <button onClick={() => go(m.v)} className="btn btn-gold btn-block mt-4">Play</button>
          </div>
        ))}
      </div>
    </div>
  );
}
