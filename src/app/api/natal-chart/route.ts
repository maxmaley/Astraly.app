import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeCity } from "@/lib/geocode";
import { calculateNatalChart } from "@/lib/astro/calculate";
import type { Relation } from "@/types/database";
import { find as findTimezone } from "geo-tz";

/** Convert local birth time in a given IANA timezone to a UTC Date. */
function localToUTC(
  year: number, month: number, day: number,
  hour: number, minute: number,
  tzName: string,
): Date {
  // Use Intl to get the UTC offset at this date/time in the target timezone.
  // We probe with a naive-UTC date and iterate once to correct for DST edge cases.
  const naiveMs = Date.UTC(year, month - 1, day, hour, minute);
  const probe = new Date(naiveMs);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tzName,
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", hour12: false,
  }).formatToParts(probe);

  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value ?? "0");
  const tzMs = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"));
  const offsetMs = tzMs - naiveMs; // tz local - UTC = offset
  return new Date(naiveMs - offsetMs);
}

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
  const [year, month, day] = birth_date.split("-").map(Number);

  let localHour = 12; // noon when birth time is unknown
  let localMinute = 0;
  if (birth_time) {
    const [h, m] = birth_time.split(":").map(Number);
    localHour = h;
    localMinute = m;
  }

  // Look up the exact IANA timezone for the birth coordinates, then convert
  // local birth time → UTC properly (handles DST, historical offsets, etc.)
  const tzResults = findTimezone(lat, lng);
  const tzName = tzResults[0] ?? "UTC";
  const utcDate = localToUTC(year, month, day, localHour, localMinute, tzName);
  const utcYear = utcDate.getUTCFullYear();
  const utcMonth = utcDate.getUTCMonth() + 1;
  const utcDay = utcDate.getUTCDate();
  const hour = utcDate.getUTCHours();
  const minute = utcDate.getUTCMinutes();

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
