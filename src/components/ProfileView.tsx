"use client";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { GraduationCap, TrendingUp, Award, Settings, Download, Upload, Database, Trash2, Volume2, Flame, Bug, Trophy, RotateCcw, Sparkles, Medal, Lock, Target, Network, CalendarCheck, Eye, Brain } from "lucide-react";
import { SUBJECTS } from "@/lib/data";
import { ACHIEVEMENTS, defaultStore, topicStats, validateImport, type levelFromXP, type Store } from "@/lib/engine";
import { Bar, Section } from "./ui";

const ACH_ICONS: Record<string, typeof Flame> = { Flame, Bug, Trophy, RotateCcw, Sparkles, Target, Network, CalendarCheck, Eye, Brain, GraduationCap };

interface Props {
  store: Store; setStore: Dispatch<SetStateAction<Store>>; lvl: ReturnType<typeof levelFromXP>;
  fileRef: RefObject<HTMLInputElement | null>; confirmReset: boolean; setConfirmReset: (b: boolean) => void;
  setToast: (s: string) => void; syncMsg: string; setSyncMsg: (s: string) => void; goOnboard: () => void;
}

export function ProfileView({ store, setStore, lvl, fileRef, confirmReset, setConfirmReset, setToast, syncMsg, setSyncMsg, goOnboard }: Props) {
  const total = store.attempts.length, correct = store.attempts.filter((a) => a.correct).length;
  function exportData() { const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "campusxp-progress.json"; a.click(); setToast("Progress exported. Keep the file safe."); }
  function importData(f: File) { f.text().then((txt) => { try { const v = validateImport(JSON.parse(txt)); if (!v) { setToast("Invalid file — nothing was changed."); return; } setStore(v); setToast("Progress imported!"); } catch { setToast("Could not read that file — nothing was changed."); } }); }
  async function sync() {
    setSyncMsg("Syncing…");
    try { let ok = 0; for (const s of store.sessions.slice(-10)) { const r = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...s, guestId: "guest" }) }); if (r.ok) ok++; } setSyncMsg(ok ? `Synced ${ok} recent session(s).` : "Server sync isn't set up here. Your progress is safe on this device."); }
    catch { setSyncMsg("Server sync unavailable. Your progress is safe on this device."); }
  }
  const setS = <K extends keyof Store["settings"]>(k: K, v: Store["settings"][K]) => setStore((p) => ({ ...p, settings: { ...p.settings, [k]: v } }));
  return (
    <div className="wrap-narrow" style={{ maxWidth: 820 }}>
      <div className="card flex flex-wrap items-center gap-4">
        <span className="grid place-items-center w-16 h-16 rounded-2xl" style={{ background: "var(--gold)", color: "var(--on-gold)", border: "2px solid var(--gold-d)" }}><GraduationCap size={32} /></span>
        <div className="flex-1 min-w-[180px]"><h1 className="h1">{store.profile.nickname || "Guest Champion"}</h1><p className="text-sm muted mt-1">{store.profile.degree} · {store.profile.semester}</p></div>
        <div className="text-right"><p className="display text-3xl">Lv {lvl.level}</p><p className="font-extrabold gold text-sm">{store.xp} XP</p></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {[[`${total}`, "Answered"], [`${total ? Math.round((correct / total) * 100) : 0}%`, "Accuracy"], [`${store.streak}`, "Day streak"], [`${store.sessions.length}`, "Rounds played"]].map(([v, x]) => <div key={x} className="card-flat text-center"><p className="display text-2xl">{v}</p><p className="text-xs muted font-bold mt-1">{x}</p></div>)}
      </div>
      <p className="text-xs muted mt-3">Local scores are for your own motivation. Browser storage can be edited, so they are never shown as verified competitive results.</p>

      <Section title="Topic mastery">
        <div className="grid gap-3">
          {SUBJECTS.flatMap((s) => s.topics.map((tp) => ({ s, tp, st: topicStats(store, tp.id) }))).filter((x) => x.st.total > 0).sort((a, b) => b.st.mastery - a.st.mastery).slice(0, 10).map(({ s, tp, st }) => (
            <div key={tp.id} className="card-flat"><div className="flex justify-between text-sm font-extrabold gap-2"><span>{tp.name} <span className="muted font-semibold">· {s.name}</span></span><span className="shrink-0">{st.mastery}%</span></div><div className="mt-2"><Bar value={st.mastery} tone={st.mastery >= 80 ? "good" : st.mastery >= 50 ? "sky" : "gold"} thin /></div></div>
          ))}
          {total === 0 && <p className="text-sm muted flex items-center gap-2"><TrendingUp size={16} /> Play any game and your mastery estimates will appear here.</p>}
        </div>
      </Section>

      <Section title={`Badges (${store.achievements.length}/${ACHIEVEMENTS.length})`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((a) => { const has = store.achievements.includes(a.id); const I = ACH_ICONS[a.icon] || Medal; return (
            <div key={a.id} className="card-flat text-center" style={{ borderColor: has ? "var(--gold)" : undefined, opacity: has ? 1 : 0.6 }}>
              <span className={has ? "gold" : "muted"}>{has ? <I size={22} className="mx-auto" /> : <Lock size={22} className="mx-auto" />}</span>
              <p className="font-extrabold text-sm mt-2">{a.name}</p><p className="text-[11px] muted mt-1">{a.desc} (+{a.xp} XP)</p>
            </div>); })}
        </div>
      </Section>

      <Section title="Settings and data">
        <div className="card grid gap-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label" htmlFor="theme">Theme</label><select id="theme" className="field mt-2" value={store.settings.theme} onChange={(e) => setS("theme", e.target.value as "dark" | "light")}><option value="dark">Dark navy</option><option value="light">Light</option></select></div>
            <div><label className="label" htmlFor="lang">Explanation language</label><select id="lang" className="field mt-2" value={store.settings.language} onChange={(e) => setS("language", e.target.value as Store["settings"]["language"])}><option value="en">English</option><option value="ur">Urdu (technical terms in English)</option><option value="mixed">English + Urdu</option></select></div>
            <div><label className="label" htmlFor="goal">Daily goal (questions)</label><input id="goal" type="number" min={5} max={50} className="field mt-2" value={store.settings.dailyGoal} onChange={(e) => setS("dailyGoal", Math.min(50, Math.max(5, Number(e.target.value) || 10)))} /></div>
            <div className="flex items-end gap-2 flex-wrap">
              <button onClick={() => setS("sound", !store.settings.sound)} className="btn btn-ghost btn-sm" aria-pressed={store.settings.sound}><Volume2 size={15} /> Sound {store.settings.sound ? "on" : "off"}</button>
              <button onClick={() => setS("reducedMotion", !store.settings.reducedMotion)} className="btn btn-ghost btn-sm" aria-pressed={store.settings.reducedMotion}>Reduced motion {store.settings.reducedMotion ? "on" : "off"}</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={goOnboard} className="btn btn-ghost btn-sm">Edit profile</button>
            <button onClick={exportData} className="btn btn-ghost btn-sm"><Download size={15} /> Export progress</button>
            <button onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm"><Upload size={15} /> Import progress</button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = ""; }} />
            <button onClick={sync} className="btn btn-ghost btn-sm"><Database size={15} /> Sync to server (optional)</button>
          </div>
          {syncMsg && <p className="text-sm muted">{syncMsg}</p>}
          <p className="text-sm muted rounded-xl p-3" style={{ background: "var(--bg-2)", border: "2px solid var(--edge)" }}><b className="text-[var(--text)]">Privacy:</b> CampusXP collects no name, email or phone. Progress lives in this browser. Clearing site data deletes it, so export regularly.</p>
          {!confirmReset
            ? <button onClick={() => setConfirmReset(true)} className="btn btn-danger btn-sm self-start"><Trash2 size={15} /> Reset all local data</button>
            : <div className="flex flex-wrap items-center gap-3"><p className="text-sm font-extrabold">Delete XP, streak and badges?</p><button onClick={() => { setStore(defaultStore()); setConfirmReset(false); setToast("All local data erased. Fresh start!"); }} className="btn btn-danger btn-sm">Yes, delete everything</button><button onClick={() => setConfirmReset(false)} className="btn btn-ghost btn-sm">Cancel</button></div>}
        </div>
      </Section>
      <p className="text-xs muted text-center mt-8">CampusXP is an independent, free study tool for Pakistani students. Not affiliated with HEC or any university. Questions are original, not copied from past papers.</p>
    </div>
  );
}
