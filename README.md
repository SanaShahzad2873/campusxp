# CampusXP — Learn. Play. Level Up.

Gamified Computer Science learning platform for Pakistani BS CS / SE / IT students. Built with Next.js (App Router), React, TypeScript and Tailwind CSS. Core gameplay is **local-first**: no account, no paid API and no cloud database required. Progress persists in the browser (localStorage, versioned schema v1 behind a typed store in `src/lib/engine.ts`), and the app is installable as a PWA with an offline app shell (`public/manifest.json`, `public/sw.js`).

## Features
- Guest onboarding: degree, semester, explanation language (English / Urdu / Mixed, technical terms preserved), optional nickname
- Home dashboard: level, XP progress, daily streak, daily goal, daily challenge, weak-topic recommendations, recently played
- 10 subjects, 37 topics, 77 reviewed seed MCQs + 12 Code Arena challenges (every question: 4 distinct options, one correct answer, English + Urdu explanation, source + verified label)
- **Six games:** Quiz Battle, Speed Run, Code Arena, Sahi ya Ghalat, Memory Match, Mock Exam.
- **Quiz Battle** (100 HP vs Campus Boss, combos, hints, pause), **Speed Run** (60/90s, real elapsed-time timer), **Code Arena** (predict output / find the bug / arrange blocks / pseudocode — deterministic checking, no code execution)
- XP/levels/streaks/achievements with duplicate-reward protection via stable session IDs and a claimed-rewards ledger
- Rule-based adaptive learning: recent-accuracy topic mastery, weak-topic detection, difficulty recommendation
- Results, mistake-review queue (+30 XP revision rewards, once per question), profile with export/import/reset, optional server sync to PostgreSQL via Drizzle (`/api/sessions`)
- Optional AI Coach (`/api/ai`): provider-independent, server-side key only, rate-limited, strict runtime schema validation for generated MCQs (structure only — generated content is labelled *unverified*). With no key configured it honestly reports unavailability and serves verified local content.

## Run locally
```bash
npm install
npm run dev   # http://localhost:3000
```
PostgreSQL is only needed for the optional session-sync endpoint; gameplay works without it. To enable sync, set `DATABASE_URL` and run `npx drizzle-kit push`.

## Environment (`.env.example`)
```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
AI_API_KEY=            # optional — leave empty to run without AI
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_PROVIDER=openai-compatible
```
Never commit a real key; secrets are read only in server route handlers.

## Deployment (Vercel, free)
See `DEPLOY_GUIDE.md` (step by step, Roman Urdu). No environment variables are required: the build and the whole game work without a database or AI key.

## Privacy
No mandatory account, email or phone. All progress stays on the student's device; warn students that clearing browser data erases it (export from Profile). CampusXP is an independent study tool, not affiliated with HEC or any university; questions are original, not copied past papers.

## Game rules (configurable in `src/lib/engine.ts`)
Correct 100 XP · with hint 60 XP · 3-combo +25 XP · battle completion +50 XP (once per session) · fixing a mistake +30 XP (once per question) · topic mastery ≥80% milestone +100 XP.
