"use client";
import { useEffect, useState } from "react";
import { Bot, ChevronRight, RefreshCw } from "lucide-react";
import { QUESTIONS, SUBJECTS, topicById } from "@/lib/data";
import type { Store } from "@/lib/engine";

interface Reply { kind: string; text: string; source: "local" | "ai" | "ai-unverified" }
interface AIQ { prompt: string; options: string[]; correct: number; explanation: string }

export function CoachView({ store, weak, startTopic }: { store: Store; weak: string[]; startTopic: (s: string, t: string) => void }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [concept, setConcept] = useState("recursion");
  const [reply, setReply] = useState<Reply | null>(null);
  const [aiQs, setAiQs] = useState<AIQ[]>([]);
  useEffect(() => { fetch("/api/ai").then((r) => r.json()).then((d) => setConfigured(Boolean(d.configured))).catch(() => setConfigured(false)); }, []);

  const offline = (name: string) => {
    const q = QUESTIONS.find((x) => (topicById(x.topicId)?.name || "").toLowerCase().includes(name.toLowerCase().split(" ")[0])) || QUESTIONS.find((x) => x.prompt.toLowerCase().includes(name.toLowerCase().split(" ")[0])) || QUESTIONS[0];
    return `${topicById(q.topicId)?.name}: ${q.prompt}\n\nAnswer: ${q.options[q.correct]}\n\nWhy: ${store.settings.language === "ur" ? q.explanationUr : q.explanation}`;
  };
  async function act(action: string, label: string) {
    setBusy(true); setAiQs([]);
    try {
      const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, topic: concept, language: store.settings.language }) });
      const d = await r.json();
      if (d.ok && d.questions) { setAiQs(d.questions); setReply({ kind: label, source: "ai-unverified", text: d.disclaimer || "AI-generated, unverified." }); }
      else if (d.ok && d.text) setReply({ kind: label, source: "ai", text: d.text });
      else setReply({ kind: label, source: "local", text: `${d.error || "AI is unavailable right now."}\n\nHere is a verified explanation from the question bank instead:\n\n${offline(concept)}` });
    } catch { setReply({ kind: label, source: "local", text: `You look offline, so no AI request was sent.\n\n${offline(concept)}` }); }
    setBusy(false);
  }
  const buttons: [string, string][] = [["explain", "Explain this"], ["mistake", "Explain my mistake"], ["quiz", "Make a practice quiz"], ["simplify", "Simplify it"], ["urdu", "In Urdu"], ["english", "In English"]];
  return (
    <div className="wrap-narrow">
      <h1 className="h1 flex items-center gap-3"><Bot className="gold" size={32} /> AI Coach</h1>
      <div className="rounded-2xl p-4 mt-4 text-sm font-bold" style={{ background: configured ? "var(--good-bg)" : "var(--card-2)", border: `2px solid ${configured ? "var(--good)" : "var(--edge)"}` }}>
        {configured === null ? "Checking AI availability…" : configured ? "Live AI is on. Generated questions are checked for structure only and marked unverified — confirm facts with your notes." : "AI isn't set up on this deployment, so nothing is sent anywhere. You still get verified explanations from the built-in question bank."}
      </div>
      <label className="label mt-6" htmlFor="concept">What do you want to learn?</label>
      <input id="concept" className="field mt-2" value={concept} onChange={(e) => setConcept(e.target.value.slice(0, 120))} placeholder="e.g. normalization, deadlock, binary search" />
      <div className="flex flex-wrap gap-2 mt-3">{buttons.map(([a, l]) => <button key={a} disabled={busy} onClick={() => act(a, l)} className="btn btn-ghost btn-sm">{l}</button>)}</div>
      {weak.length > 0 && <div className="mt-5"><p className="font-extrabold text-sm mb-2">Your weak topics</p><div className="flex flex-wrap gap-2">{weak.slice(0, 4).map((id) => { const sub = SUBJECTS.find((s) => s.topics.some((x) => x.id === id)); return sub ? <button key={id} onClick={() => startTopic(sub.id, id)} className="btn btn-pink btn-sm">{topicById(id)?.name} <ChevronRight size={14} /></button> : null; })}</div></div>}
      {busy && <p className="mt-5 text-sm muted flex items-center gap-2"><RefreshCw size={15} className="animate-spin" /> Asking the coach…</p>}
      {reply && (
        <div className="card mt-5 anim-pop">
          <p className="text-xs font-extrabold" style={{ color: reply.source === "local" ? "var(--gold)" : "var(--good)" }}>{reply.kind} · {reply.source === "local" ? "Verified question bank" : reply.source === "ai-unverified" ? "AI-generated, unverified" : "AI response"}</p>
          <p className="text-sm mt-2 leading-relaxed whitespace-pre-line">{reply.text}</p>
          {aiQs.length > 0 && <div className="grid gap-3 mt-4">{aiQs.map((q, i) => <div key={i} className="card-flat"><p className="font-bold text-sm">{i + 1}. {q.prompt}</p>{q.options.map((o, oi) => <p key={oi} className="text-sm mt-1" style={{ color: oi === q.correct ? "var(--good)" : "var(--muted)", fontWeight: oi === q.correct ? 800 : 500 }}>{"ABCD"[oi]}. {o}{oi === q.correct ? " ✓" : ""}</p>)}<p className="text-xs muted mt-2">{q.explanation}</p></div>)}</div>}
        </div>
      )}
      {!reply && !busy && <div className="card mt-5"><p className="font-extrabold text-sm">Try it now: a verified explanation</p><p className="text-sm muted mt-2 whitespace-pre-line">{offline("stack")}</p></div>}
    </div>
  );
}
