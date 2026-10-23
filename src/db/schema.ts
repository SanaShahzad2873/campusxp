import { pgTable, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
// Optional server-side sync schema. Core gameplay is local-first; these tables
// let a future deployment sync progress when a student opts in. No secrets here.
export const gameSessions = pgTable("game_sessions", {
  id: text("id").primaryKey(),
  mode: text("mode").notNull(),
  subjectId: text("subject_id"),
  topicId: text("topic_id"),
  score: integer("score").notNull().default(0),
  xpEarned: integer("xp_earned").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  totalCount: integer("total_count").notNull().default(0),
  durationSec: integer("duration_sec").notNull().default(0),
  guestId: text("guest_id"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const answerAttempts = pgTable("answer_attempts", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  questionId: text("question_id").notNull(),
  topicId: text("topic_id"),
  isCorrect: boolean("is_correct").notNull().default(false),
  xpEarned: integer("xp_earned").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
export const aiGenerations = pgTable("ai_generations", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  payload: jsonb("payload"),
  valid: boolean("valid").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
