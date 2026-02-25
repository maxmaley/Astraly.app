import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeCity } from "@/lib/geocode";
import { calculateNatalChart } from "@/lib/astro/calculate";
import type { Relation, Json } from "@/types/database";

interface CreateChartBody {
  name: string;
  relation?: Relation;
  birth_date: string;    // "YYYY-MM-DD"
  birth_time?: string;   // "HH:MM" or "" (unknown)
  birth_city: string;
  lat?: number;          // optional — geocoded from birth_city if absent
  lng?: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateChartBody;
  try {
    body = await request.json() as CreateChartBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, relation = "self", birth_date, birth_time = "", birth_city } = body;

  if (!name || !birth_date || !birth_city) {
    return NextResponse.json(
      { error: "name, birth_date and birth_city are required" },
      { status: 400 },
    );
  }

  // ── Geocode ──────────────────────────────────────────────────────────────
  let lat = body.lat;
  let lng = body.lng;

  if (lat == null || lng == null) {
    const geo = await geocodeCity(birth_city);
    if (!geo) {
      return NextResponse.json(
        { error: `City not found: ${birth_city}` },
        { status: 422 },
      );
    }
    lat = geo.lat;
    lng = geo.lng;
  }

  // ── Parse birth date & time and convert local → UTC ──────────────────────
  // The user enters local time at the birth location. We estimate the UTC offset
  // from the longitude (rough but acceptable for astrology: 1h per 15° longitude).
  const [year, month, day] = birth_date.split("-").map(Number);

  let localHour = 12; // noon when birth time is unknown
  let localMinute = 0;
  if (birth_time) {
    const parts = birth_time.split(":");
    localHour = parseInt(parts[0], 10);
    localMinute = parseInt(parts[1], 10);
  }

  // Estimate UTC offset from longitude and apply it
  const utcOffsetHours = Math.round(lng / 15);
  const localMs = Date.UTC(year, month - 1, day, localHour, localMinute);
  const utcDate = new Date(localMs - utcOffsetHours * 3_600_000);
  const hour = utcDate.getUTCHours();
  const minute = utcDate.getUTCMinutes();
  const utcYear = utcDate.getUTCFullYear();
  const utcMonth = utcDate.getUTCMonth() + 1;
  const utcDay = utcDate.getUTCDate();

  // ── Calculate chart ───────────────────────────────────────────────────────
  let chartResult;
  try {
    chartResult = calculateNatalChart(utcYear, utcMonth, utcDay, hour, minute, lat, lng);
  } catch (err) {
    console.error("Chart calculation failed:", err);
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }

  // ── Save to DB ────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: chart, error } = await (supabase as any)
    .from("natal_charts")
    .insert({
      user_id: user.id,
      name,
      relation,
      birth_date,
      birth_time: birth_time || null,
      birth_city,
      lat,
      lng,
      planets_json: chartResult.planets,
      houses_json: chartResult.houses,
      ascendant: chartResult.ascendant,
    })
    .select()
    .single();

  if (error) {
    console.error("DB insert failed:", error);
    return NextResponse.json({ error: "Failed to save chart" }, { status: 500 });
  }

  return NextResponse.json({ chart }, { status: 201 });
}

// GET: fetch all charts for the current user
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: charts, error } = await supabase
    .from("natal_charts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch charts" }, { status: 500 });
  }

  return NextResponse.json({ charts });
}
