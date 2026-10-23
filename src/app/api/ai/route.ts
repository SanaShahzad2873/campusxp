import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
// Provider-independent optional AI endpoint. No key => honest "unavailable", never fake AI.
// Set AI_API_KEY (+ optional AI_BASE_URL, AI_MODEL) server-side to enable a real provider.
const hits = new Map<string, number[]>();
function rateLimited(ip: string) { const now = Date.now(); const arr = (hits.get(ip) || []).filter(t => now - t < 60000); arr.push(now); hits.set(ip, arr); return arr.length > 20; }

export async function GET() {
  const configured = Boolean(process.env.AI_API_KEY);
  return NextResponse.json({ configured, provider: configured ? (process.env.AI_PROVIDER || "openai-compatible") : null, note: configured ? "AI Coach is configured." : "AI is not configured on this deployment. The verified local question bank remains fully available." });
}
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
  let body: { action?: string; topic?: string; concept?: string; language?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 }); }
  const action = String(body.action || "").slice(0, 40);
  if (!["explain", "mistake", "quiz", "weak", "simplify", "urdu", "english"].includes(action)) return NextResponse.json({ ok: false, error: "Unsupported action." }, { status: 400 });
  const key = process.env.AI_API_KEY;
  if (!key) return NextResponse.json({ ok: false, configured: false, error: "AI service is not configured on this deployment. No AI request was made. You can keep learning with the verified CampusXP question bank below." }, { status: 503 });
  const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const topic = String(body.topic || body.concept || "Computer Science").slice(0, 200);
  const lang = body.language === "ur" ? "Urdu (keep technical terms in English)" : "English";
  const wantQuiz = action === "quiz" || action === "weak";
  const prompt = wantQuiz
    ? `Create 5 original MCQs about "${topic}" for Pakistani BS CS students. Respond ONLY with JSON: {"questions":[{"prompt":"...","options":["A","B","C","D"],"correct":0,"explanation":"...","difficulty":1}]}. Each question: 4 distinct options, one correct index 0-3, a real explanation. Language: ${lang}. Mark nothing as verified.`
    : `Explain "${topic}" simply for a Pakistani BS CS student preparing for exams. Max 180 words. Language: ${lang}. Give one tiny example.`;
  try {
    const res = await fetch(`${base}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.4 }) });
    if (!res.ok) return NextResponse.json({ ok: false, configured: true, error: `AI provider returned ${res.status}. Please try again later — local questions still work.` }, { status: 502 });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    if (wantQuiz) {
      let parsed: unknown; try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { return NextResponse.json({ ok: false, configured: true, error: "AI returned malformed JSON and it was rejected. Local questions still work." }, { status: 422 }); }
      const qs = (parsed as { questions?: unknown }).questions;
      if (!Array.isArray(qs) || qs.length < 1 || qs.length > 10) return NextResponse.json({ ok: false, error: "AI response failed validation (question count)." }, { status: 422 });
      for (const q of qs as Record<string, unknown>[]) {
        if (typeof q.prompt !== "string" || !Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options as unknown[]).size !== 4 || typeof q.correct !== "number" || q.correct < 0 || q.correct > 3 || typeof q.explanation !== "string" || (q.explanation as string).length < 10)
          return NextResponse.json({ ok: false, error: "AI response failed schema validation and was rejected. Schema validation checks structure only — it cannot prove factual correctness, so generated questions are labelled unverified." }, { status: 422 });
      }
      return NextResponse.json({ ok: true, configured: true, source: "ai-unverified", questions: qs, disclaimer: "AI-generated and schema-validated for structure only. Not verified — cross-check with your course notes." });
    }
    if (!text.trim()) return NextResponse.json({ ok: false, error: "AI returned an empty response." }, { status: 502 });
    return NextResponse.json({ ok: true, configured: true, source: "ai", text: text.slice(0, 4000) });
  } catch { return NextResponse.json({ ok: false, configured: true, error: "Could not reach the AI provider. Check connection — local gameplay is unaffected." }, { status: 502 }); }
}
