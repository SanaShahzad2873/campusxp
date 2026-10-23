import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
// Optional opt-in sync of a finished session to PostgreSQL. Gameplay never depends on this.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body.id || "").slice(0, 80); const mode = String(body.mode || "").slice(0, 30);
    if (!id || !mode) return NextResponse.json({ ok: false, error: "id and mode are required" }, { status: 400 });
    const { db } = await import("@/db");
    const { gameSessions } = await import("@/db/schema");
    await db.insert(gameSessions).values({ id, mode, subjectId: body.subjectId ? String(body.subjectId).slice(0, 40) : null, topicId: body.topicId ? String(body.topicId).slice(0, 60) : null, score: Number(body.score) || 0, xpEarned: Number(body.xp) || 0, correctCount: Number(body.correct) || 0, totalCount: Number(body.total) || 0, durationSec: Number(body.durationSec) || 0, guestId: body.guestId ? String(body.guestId).slice(0, 60) : null }).onConflictDoNothing();
    return NextResponse.json({ ok: true, synced: true });
  } catch { return NextResponse.json({ ok: false, error: "Sync unavailable — your progress is safely stored on this device." }, { status: 503 }); }
}
export async function GET() {
  try {
    const { db } = await import("@/db");
    const { gameSessions } = await import("@/db/schema");
    const { desc } = await import("drizzle-orm");
    const rows = await db.select().from(gameSessions).orderBy(desc(gameSessions.createdAt)).limit(20);
    return NextResponse.json({ ok: true, sessions: rows });
  } catch { return NextResponse.json({ ok: false, sessions: [], error: "Database unavailable — local progress is unaffected." }); }
}
