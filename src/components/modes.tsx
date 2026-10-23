import { Swords, Timer, Code2, ThumbsUp, Brain, GraduationCap } from "lucide-react";
import type { View } from "./types";

export interface ModeInfo { v: View; name: string; short: string; how: string; Icon: typeof Swords; bestKey: string; bestLabel: string; tint: string }
export const MODES: ModeInfo[] = [
  { v: "battle", name: "Quiz Battle", short: "Beat the Campus Boss", how: "You and the Boss both have 100 HP. A correct answer hits the Boss for 16; a wrong one costs you 12. Three correct in a row earns +25 XP. Hints cost XP.", Icon: Swords, bestKey: "battle", bestLabel: "Best score", tint: "var(--gold)" },
  { v: "speed", name: "Speed Run", short: "60 or 90 seconds, go!", how: "Answer as many as you can before the clock hits zero. The timer uses real elapsed time, so lag can't cheat you. Explanations come in the results.", Icon: Timer, bestKey: "speed", bestLabel: "Most correct", tint: "var(--pink)" },
  { v: "code", name: "Code Arena", short: "Trace code, hunt bugs", how: "Predict the output, find the bug, arrange blocks. Nothing is executed — answers are checked safely against the answer key.", Icon: Code2, bestKey: "code", bestLabel: "Best score", tint: "var(--sky)" },
  { v: "tf", name: "Sahi ya Ghalat", short: "Spot the wrong statement", how: "Ten statements, three lives. Decide if each one is right or wrong. Pays half XP because a guess has a 50% chance.", Icon: ThumbsUp, bestKey: "tf", bestLabel: "Best score", tint: "var(--good)" },
  { v: "match", name: "Memory Match", short: "Pair terms with meanings", how: "Flip cards to match six CS terms with their definitions. Fewer moves means more XP.", Icon: Brain, bestKey: "match", bestLabel: "Best XP", tint: "var(--gold)" },
  { v: "mock", name: "Mock Exam", short: "Timed paper, graded", how: "Fifteen questions in twenty minutes with no feedback until you submit. Get a grade and a full mistake review.", Icon: GraduationCap, bestKey: "mock", bestLabel: "Best %", tint: "var(--pink)" },
];
