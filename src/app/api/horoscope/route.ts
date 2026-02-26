/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { calculateNatalChart } from "@/lib/astro/calculate";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── GET: return (or lazily generate) today's horoscope ───────────────────────
//
// Lazy generation: generated once per user per day on first page visit.
// Cached in `daily_horoscopes` table — no tokens wasted for inactive users.

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locale = request.nextUrl.searchParams.get("locale") || "ru";

  // Today in UTC (YYYY-MM-DD)
  const today = new Date().toLocaleDateString("en-CA");

  // ── Check DB cache ─────────────────────────────────────────────────────────
  const { data: cached } = await (supabase as any)
    .from("daily_horoscopes")
    .select("content")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (cached?.content) {
    return NextResponse.json({ horoscope: cached.content, cached: true });
  }

  // ── Load user's primary natal chart ───────────────────────────────────────
  const { data: charts } = await (supabase as any)
    .from("natal_charts")
    .select("name, birth_date, birth_city, planets_json, ascendant")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const chart = charts?.[0];
  if (!chart) {
    return NextResponse.json({ error: "no_chart" }, { status: 404 });
  }

  // ── Today's transiting planets (noon UTC — universal sky snapshot) ─────────
  const now = new Date();
  let transitLines = "";
  try {
    const t = calculateNatalChart(
      now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(),
      12, 0, 0, 0,
    );
    transitLines = Object.entries(t.planets)
      .map(([name, p]) =>
        `- ${name}: ${p.sign} ${p.degree.toFixed(1)}°${p.retrograde ? " ℞" : ""}`
      )
      .join("\n");
  } catch { /* non-fatal */ }

  // ── Prompt ─────────────────────────────────────────────────────────────────
  const langMap: Record<string, string> = { ru: "Russian", uk: "Ukrainian", en: "English" };
  const todayFormatted = now.toLocaleDateString(
    locale === "en" ? "en-US" : locale === "uk" ? "uk-UA" : "ru-RU",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  const planets = chart.planets_json as Record<string, { sign: string; house: number; retrograde: boolean }>;
  const asc = chart.ascendant as { sign: string; degree: number };
  const chartLines = Object.entries(planets)
    .map(([name, p]) => `- ${name}: ${p.sign} (House ${p.house})${p.retrograde ? " ℞" : ""}`)
    .join("\n");

  const prompt = `You are Astraly — a poetic, warm AI astrologer. Write a personalized daily horoscope for ${chart.name} for ${todayFormatted}.

NATAL CHART (${chart.name}, born ${chart.birth_date} in ${chart.birth_city}):
- Ascendant: ${asc.sign} ${asc.degree.toFixed(1)}°
${chartLines}

TODAY'S TRANSITING PLANETS (${today}):
${transitLines}

Write in ${langMap[locale] || "Russian"}. Respond with ONLY a valid JSON object — no markdown fences, no explanation outside the JSON:
{
  "overview": "2-3 sentences on today's overall energy, weaving in 1-2 of their natal placements (80-100 words)",
  "love": "1-2 sentences on love and relationships today (40-60 words)",
  "career": "1-2 sentences on work and finances today (40-60 words)",
  "advice": "One short mystical tip or invitation for the day (15-25 words)",
  "planets": [
    "Transit highlight 1 — very short (e.g. 'Луна в Стрельце — тяга к свободе и приключениям')",
    "Transit highlight 2",
    "Transit highlight 3"
  ]
}

Style: warm, poetic, never preachy. Address as 'ты' in Russian/Ukrainian. Frame insights as tendencies and invitations, not absolutes.`;

  // ── Generate (Haiku — fast, cheap, perfect for daily horoscopes) ──────────
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON — guard against markdown code fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");
    JSON.parse(jsonMatch[0]); // validate before caching

    const content = jsonMatch[0];

    // Cache — upsert handles simultaneous requests
    await (supabase as any)
      .from("daily_horoscopes")
      .upsert(
        { user_id: user.id, date: today, content },
        { onConflict: "user_id,date" },
      );

    return NextResponse.json({ horoscope: content, cached: false });
  } catch (err) {
    console.error("Horoscope generation error:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
