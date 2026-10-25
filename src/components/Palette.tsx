"use client";
import { Palette as PaletteIcon } from "lucide-react";

export const PALETTES: { id: string; name: string; light: boolean; sw: [string, string, string] }[] = [
  { id: "violet", name: "Violet Night", light: false, sw: ["#090e22", "#7c5cff", "#22d3ee"] },
  { id: "sunset", name: "Sunset", light: false, sw: ["#1b0f1f", "#ff7a45", "#ff4d8d"] },
  { id: "mint", name: "Teal & Gold", light: false, sw: ["#061a1c", "#ffc93c", "#4cc9f0"] },
  { id: "candy", name: "Candy (light)", light: true, sw: ["#fff7e8", "#5b5bff", "#ff3d86"] },
  { id: "ocean", name: "Ocean (light)", light: true, sw: ["#eaf6ff", "#0a84ff", "#00a99a"] },
];
export const paletteById = (id: string) => PALETTES.find((p) => p.id === id) ?? PALETTES[0];

/** Row of colour swatches; the chosen palette is applied app-wide instantly. */
export function PalettePicker({ value, onChange, compact }: { value: string; onChange: (id: string) => void; compact?: boolean }) {
  return (
    <div>
      {!compact && <p className="label flex items-center gap-1.5"><PaletteIcon size={13} /> Colour theme</p>}
      <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-2"}`} role="radiogroup" aria-label="Colour theme">
        {PALETTES.map((p) => (
          <button key={p.id} role="radio" aria-checked={value === p.id} aria-label={p.name} title={p.name} onClick={() => onChange(p.id)} className="rounded-xl p-1 border-0" style={{ background: value === p.id ? "var(--gold)" : "var(--card-2)", boxShadow: value === p.id ? "0 0 0 2px var(--gold-d)" : "0 0 0 2px var(--edge)" }}>
            <span className="flex overflow-hidden rounded-lg" style={{ width: compact ? 38 : 56, height: compact ? 24 : 32 }}>
              <i style={{ flex: 2, background: p.sw[0] }} /><i style={{ flex: 1.4, background: p.sw[1] }} /><i style={{ flex: 1, background: p.sw[2] }} />
            </span>
          </button>
        ))}
      </div>
      {!compact && <p className="text-xs muted mt-2">{paletteById(value).name}</p>}
    </div>
  );
}
