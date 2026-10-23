"use client";
import { BookOpen, ArrowLeft, Swords, Check } from "lucide-react";
import { SUBJECTS, subjectById, questionsFor } from "@/lib/data";
import { topicStats, recommendedDifficulty, type Store } from "@/lib/engine";
import { Bar, SubjectIcon } from "./ui";

export function LearnView({ store, goSubject }: { store: Store; goSubject: (id: string) => void }) {
  return (
    <div>
      <h1 className="h1 flex items-center gap-3"><BookOpen className="gold" size={32} /> Subjects</h1>
      <p className="muted text-sm mt-2 max-w-xl">Arranged like common HEC-style BS CS outlines, but every university orders semesters differently. Nothing is locked — start anywhere.</p>
      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {SUBJECTS.map((s) => {
          const att = store.attempts.filter((a) => a.subjectId === s.id);
          const acc = att.length ? Math.round((att.filter((a) => a.correct).length / att.length) * 100) : null;
          return (
            <button key={s.id} onClick={() => goSubject(s.id)} className="card flex flex-col gap-2">
              <div className="flex items-start justify-between w-full"><SubjectIcon s={s} size={48} /><span className="chip">{s.code}</span></div>
              <span className="display text-lg mt-1">{s.name}</span>
              <span className="muted text-sm">{s.desc}</span>
              <span className="text-xs font-bold muted mt-1">{s.sem} · {s.topics.length} topics · {questionsFor(s.id).length} questions{acc !== null && ` · ${acc}% accuracy`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SubjectView({ store, subjectId, back, play }: { store: Store; subjectId: string; back: () => void; play: (topicId: string | undefined) => void }) {
  const s = subjectById(subjectId) || SUBJECTS[0];
  return (
    <div>
      <button onClick={back} className="btn btn-ghost btn-sm"><ArrowLeft size={15} /> All subjects</button>
      <div className="card mt-4 flex flex-wrap items-center gap-4">
        <SubjectIcon s={s} size={60} />
        <div className="flex-1 min-w-[220px]"><h1 className="h1">{s.name}</h1><p className="muted text-sm mt-2">{s.desc} Usually taught in {s.sem}; this varies by university.</p></div>
        <button onClick={() => play(undefined)} className="btn btn-gold"><Swords size={16} /> Battle the whole subject</button>
      </div>
      <h2 className="h2 mt-8 mb-3">Topics</h2>
      <div className="grid gap-4">
        {s.topics.map((tp, i) => {
          const st = topicStats(store, tp.id), diff = recommendedDifficulty(store, tp.id);
          return (
            <div key={tp.id} className="card">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-xl font-extrabold" style={{ background: st.mastery >= 80 ? "var(--good)" : "var(--card-2)", color: st.mastery >= 80 ? "#04210f" : "var(--text)", border: "2px solid var(--edge)" }}>{st.mastery >= 80 ? <Check size={18} /> : i + 1}</span>
                <h3 className="font-extrabold text-lg">{tp.name}</h3>
                <span className="urdu muted text-sm" lang="ur">{tp.urdu}</span>
                <span className="chip ml-auto">{st.total ? `${st.mastery}% mastery · ${Math.round(st.accuracy * 100)}% accuracy` : "New topic"}</span>
              </div>
              <p className="text-sm muted mt-2">{tp.desc}. You will practise: {tp.objectives.join(", ").toLowerCase()}. Next difficulty: {"★".repeat(diff)}{"☆".repeat(3 - diff)}</p>
              <div className="mt-3"><Bar value={st.mastery} tone={st.mastery >= 80 ? "good" : "sky"} thin /></div>
              <button onClick={() => play(tp.id)} className="btn btn-pink btn-sm mt-4">Practice this topic</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
