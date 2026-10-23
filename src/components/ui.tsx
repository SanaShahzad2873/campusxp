import type { ReactNode } from "react";
import { Terminal, Boxes, Network, Database, Cpu, Globe, GitBranch, Sigma, Brain, Binary, BookOpen } from "lucide-react";
import type { Question, Subject } from "@/lib/data";

export function Brand({ size = 26 }: { size?: number }) {
  return <span className="display" style={{ fontSize: size }}>Campus<span className="gold">XP</span></span>;
}
export function Zig({ pink, double }: { pink?: boolean; double?: boolean }) {
  if (double) return <div className="zig-2" aria-hidden><div className="zig" /><div className="zig pink" /></div>;
  return <div className={`zig ${pink ? "pink" : ""}`} aria-hidden />;
}
export function Bar({ value, tone = "gold", thin }: { value: number; tone?: "gold" | "good" | "bad" | "sky"; thin?: boolean }) {
  return <div className={`bar ${tone === "gold" ? "" : tone} ${thin ? "thin" : ""}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}
const ICONS: Record<string, typeof Terminal> = { pf: Terminal, oop: Boxes, dsa: Network, db: Database, os: Cpu, cn: Globe, se: GitBranch, dm: Sigma, ai: Brain, coa: Binary };
export function SubjectIcon({ s, size = 44 }: { s: Pick<Subject, "id" | "color">; size?: number }) {
  const I = ICONS[s.id] || BookOpen;
  return <span className="inline-grid place-items-center shrink-0" style={{ width: size, height: size, borderRadius: size * 0.32, background: s.color, color: "#12130f", border: "2px solid rgba(0,0,0,.35)", boxShadow: "0 3px 0 rgba(0,0,0,.35)" }}><I size={size * 0.5} strokeWidth={2.4} /></span>;
}
/** English and/or Urdu explanation depending on the learner's language setting. */
export function Explain({ q, lang, className = "" }: { q: Pick<Question, "explanation" | "explanationUr">; lang: "en" | "ur" | "mixed"; className?: string }) {
  return (
    <div className={className}>
      {lang !== "ur" && <p className="text-sm leading-relaxed">{q.explanation}</p>}
      {lang !== "en" && <p className="urdu text-[15px] mt-1" lang="ur">{q.explanationUr}</p>}
    </div>
  );
}
export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return <section className="mt-8"><div className="flex items-center justify-between mb-3"><h2 className="h2">{title}</h2>{right}</div>{children}</section>;
}
export function fmtTime(sec: number) { const m = Math.floor(sec / 60); const s = sec % 60; return `${m}:${String(s).padStart(2, "0")}`; }
