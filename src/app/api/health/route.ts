export const dynamic = "force-dynamic";

/** App health. The database is optional (only used for opt-in session sync), so it is reported separately. */
export async function GET() {
  let database: "connected" | "not-configured" | "error" = "not-configured";
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@/db");
      const { sql } = await import("drizzle-orm");
      await db.execute(sql`select 1`);
      database = "connected";
    } catch { database = "error"; }
  }
  return Response.json({ ok: true, app: "campusxp", database });
}
