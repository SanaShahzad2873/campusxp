"use client";
import { Trophy, RefreshCw, RotateCcw, Home, Award, Sparkles } from "lucide-react";
import { topicById, subjectById, type Question } from "@/lib/data";
import { RULES, type Store } from "@/lib/engine";
import { Explain } from "./ui";
import { MODE_LABEL, type Result, type View } from "./types";

export function ResultsView({ r, lang, go, replay }: { r: Result; lang: Store["settings"]["language"]; go: (v: View) => void; replay: () => void }) {
  const acc = r.total ? Math.round((r.correct / r.total) * 100) : 0;
  const isMatch = r.mode === "match";
  const byTopic = [...new Set(r.answers.map((a) => a.q.topicId))].map((id) => { const a = r.answers.filter((x) => x.q.topicId === id); return { name: topicById(id)?.name || id, c: a.filter((x) => x.correct).length, t: a.length }; });
  const wrong = r.answers.filter((a) => !a.correct);
  const stats: [string, string][] = isMatch
    ? [[`${r.correct}`, "Pairs found"], [`${r.total}`, "Moves"], [`+${r.xp}`, "XP earned"]]
    : [[r.grade ? r.grade.grade : `${acc}%`, r.grade ? "Grade" : "Accuracy"], [`${r.correct}/${r.total}`, "Correct"], [`+${r.xp}`, "XP earned"]];
  return (
    <div className="wrap-narrow text-center">
      <div className="inline-grid place-items-center w-20 h-20 rounded-3xl anim-rise" style={{ background: "var(--gold)", color: "var(--on-gold)", border: "2px solid var(--gold-d)", boxShadow: "0 5px 0 var(--gold-d)" }}><Trophy size={40} /></div>
      <h1 className="h1 mt-4">{r.outcome}</h1>
      <p className="muted text-sm mt-2">{MODE_LABEL[r.mode] || "Round"} · {r.durationSec}s{r.grade ? ` · ${r.grade.label}` : ""}</p>
      {r.newAchievements.length > 0 && <div className="flex flex-wrap gap-2 justify-center mt-4">{r.newAchievements.map((a) => <span key={a} className="chip chip-pink"><Award size={13} /> New badge: {a}</span>)}</div>}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {stats.map(([v, x]) => <div key={x} className="card-flat"><p className="display text-2xl">{v}</p><p className="text-xs muted font-bold mt-1">{x}</p></div>)}
      </div>
      {byTopic.length > 0 && <div className="card mt-5 text-left"><p className="font-extrabold mb-2">By topic</p>{byTopic.map((x) => <div key={x.name} className="flex justify-between text-sm py-1.5"><span>{x.name}</span><b>{x.c}/{x.t}</b></div>)}</div>}
      {wrong.length > 0 && (
        <div className="card mt-5 text-left">
          <p className="font-extrabold mb-1">Review your mistakes ({wrong.length})</p>
          {wrong.map((a, i) => (
            <div key={i} className="py-3" style={{ borderTop: i ? "2px solid var(--edge)" : "none" }}>
              <p className="font-bold text-sm">{a.q.prompt}</p>
              {a.q.code && <pre className="code mt-2">{a.q.code}</pre>}
              {r.mode !== "tf" && <p className="text-sm mt-2 text-[var(--bad)]">{a.selected >= 0 ? `Your answer: ${a.q.options[a.selected]}` : "Not answered"}</p>}
              <p className="text-sm text-[var(--good)]">Correct: {a.q.options[a.q.correct]}</p>
              <Explain q={a.q} lang={lang} className="mt-1 muted" />
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 justify-center mt-7">
        <button onClick={replay} className="btn btn-gold"><RefreshCw size={16} /> Play again</button>
        {wrong.length > 0 && <button onClick={() => go("mistakes")} className="btn btn-pink"><RotateCcw size={16} /> Mistake queue</button>}
        <button onClick={() => go("home")} className="btn btn-ghost"><Home size={16} /> Home</button>
      </div>
      <p className="text-xs muted mt-5">Completion XP (+{RULES.completionXP}) is paid once per round; replaying starts a fresh round.</p>
    </div>
  );
}

export function MistakesView({ mistakes, lang, retry, go }: { mistakes: Question[]; lang: Store["settings"]["language"]; retry: () => void; go: (v: View) => void }) {
  if (!mistakes.length) {
    return (
      <div className="wrap-narrow text-center py-12">
        <Sparkles size={46} className="mx-auto text-[var(--good)]" />
        <h1 className="h1 mt-4">Nothing to fix</h1>
        <p className="muted text-sm mt-2">Questions you miss land here automatically so you can win them back.</p>
        <button onClick={() => go("play")} className="btn btn-gold mt-6">Play a game</button>
      </div>
    );
  }
  return (
    <div className="wrap-narrow">
      <h1 className="h1 flex items-center gap-3"><RotateCcw className="gold" size={30} /> Mistake queue</h1>
      <p className="muted text-sm mt-2">{mistakes.length} question{mistakes.length > 1 ? "s" : ""} waiting. Answer each correctly in a revision round to earn {RULES.reviewXP} XP — once per question.</p>
      <button onClick={retry} className="btn btn-gold mt-5">Start revision round</button>
      <div className="grid gap-4 mt-6">
        {mistakes.map((q) => (
          <div key={q.id} className="card">
            <p className="text-xs font-bold muted">{subjectById(q.subjectId)?.name} · {topicById(q.topicId)?.name}</p>
            <p className="font-extrabold mt-1">{q.prompt}</p>
            {q.code && <pre className="code mt-2">{q.code}</pre>}
            <p className="text-sm mt-3 text-[var(--good)] font-bold">Correct answer: {q.options[q.correct]}</p>
            <Explain q={q} lang={lang} className="mt-1 muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
