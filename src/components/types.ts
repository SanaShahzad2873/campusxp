import type { Question } from "@/lib/data";

export type View =
  | "onboard" | "home" | "learn" | "subject" | "play"
  | "battle" | "speed" | "code" | "tf" | "match" | "mock" | "review"
  | "runner" | "blaster" | "catapult" | "tower" | "maze"
  | "results" | "mistakes" | "coach" | "profile";

export interface AnswerRec { q: Question; selected: number; correct: boolean; xp: number }
export interface Result {
  mode: string; score: number; xp: number; correct: number; total: number; durationSec: number;
  answers: AnswerRec[]; outcome: string; newAchievements: string[]; sid: string;
  grade?: { grade: string; label: string };
}
export type RecordFn = (q: Question, selected: number, mode: string, usedHint: boolean, comboAfter: number, sid: string) => { correct: boolean; xp: number };
export interface FinishArgs {
  mode: string; answers: AnswerRec[]; durationSec: number; outcome: string; sid: string;
  subjectId?: string; topicId?: string;
  /** For games not built from questions (Memory Match): override counts and add direct XP. */
  correct?: number; total?: number; gameXP?: number; grade?: { grade: string; label: string };
}
export type FinishFn = (a: FinishArgs) => void;
export interface GameProps { record: RecordFn; finish: FinishFn; exit: () => void; lang: "en" | "ur" | "mixed" }

export const MODE_LABEL: Record<string, string> = { battle: "Quiz Battle", speed: "Speed Run", code: "Code Arena", tf: "Sahi ya Ghalat", match: "Memory Match", mock: "Mock Exam", review: "Revision Round", runner: "Code Runner", blaster: "Bug Blaster", catapult: "Catapult Quiz", tower: "Server Defense", maze: "Maze Quest", daily: "Daily Challenge" };
