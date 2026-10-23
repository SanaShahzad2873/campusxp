"use client";
import { useState } from "react";
import { Swords, Timer, Trophy } from "lucide-react";
import type { Store } from "@/lib/engine";
import { Brand, Zig } from "./ui";

const DEGREES = ["BS Computer Science", "BS Software Engineering", "BS Information Technology", "BS Artificial Intelligence", "BS Data Science", "College / Intermediate CS"];
const SEMESTERS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];

export function Onboarding({ onDone, onSkip }: { onDone: (p: Store["profile"]) => void; onSkip: () => void }) {
  const [nickname, setNickname] = useState("");
  const [degree, setDegree] = useState(DEGREES[0]);
  const [semester, setSemester] = useState("Semester 3");
  const [language, setLanguage] = useState<"en" | "ur" | "mixed">("en");
  return (
    <div className="max-w-xl mx-auto pb-10">
      <Zig double />
      <div className="px-4 pt-8">
        <Brand size={48} />
        <h1 className="h1 mt-4">Revision ko game banao.</h1>
        <p className="mt-3 leading-relaxed muted">Pakistan ke CS students ke liye: quiz battles, speed runs, code challenges aur mock exams. XP kamao, streak bachao, aur midterm se pehle tayyar ho jao. No sign-up, no fees.</p>
        <div className="grid grid-cols-3 gap-3 mt-6 text-center text-xs font-extrabold">
          <div className="card-flat"><Swords className="mx-auto mb-1 gold" size={22} />Battle the Boss</div>
          <div className="card-flat"><Timer className="mx-auto mb-1 text-[var(--pink)]" size={22} />Beat the clock</div>
          <div className="card-flat"><Trophy className="mx-auto mb-1 text-[var(--sky)]" size={22} />Earn badges</div>
        </div>
        <div className="card mt-6 grid gap-5">
          <div><label className="label" htmlFor="nick">Nickname (optional)</label><input id="nick" className="field mt-2" value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 24))} placeholder="e.g. CodeWala Ali" /></div>
          <div><label className="label" htmlFor="deg">Degree</label><select id="deg" className="field mt-2" value={degree} onChange={(e) => setDegree(e.target.value)}>{DEGREES.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className="label" htmlFor="sem">Semester</label><select id="sem" className="field mt-2" value={semester} onChange={(e) => setSemester(e.target.value)}>{SEMESTERS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div>
            <p className="label">Explanation language</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {([["en", "English"], ["ur", "اردو"], ["mixed", "Mixed"]] as const).map(([v, x]) => <button key={v} onClick={() => setLanguage(v)} aria-pressed={language === v} className={`btn btn-sm ${language === v ? "btn-gold" : "btn-ghost"}`}>{x}</button>)}
            </div>
            <p className="text-xs muted mt-2">In Urdu mode, technical terms like stack and normalization stay in English, just like in class.</p>
          </div>
          <button onClick={() => onDone({ nickname: nickname.trim(), degree, semester, language, createdAt: Date.now() })} className="btn btn-gold btn-block !py-4 text-base">Start playing</button>
          <button onClick={onSkip} className="btn btn-ghost btn-sm btn-block">Skip setup</button>
        </div>
        <p className="text-xs muted mt-4">Guest mode needs no email or phone. Progress is saved on this device only, so export it from Profile now and then. CampusXP is an independent study tool, not affiliated with HEC or any university.</p>
      </div>
    </div>
  );
}
