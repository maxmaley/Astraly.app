import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeCity } from "@/lib/geocode";
import { calculateNatalChart } from "@/lib/astro/calculate";
import { PLANS } from "@/lib/plans";
import type { Relation, SubscriptionTier } from "@/types/database";
import { find as findTimezone } from "geo-tz";

/** Convert local birth time in a given IANA timezone to a UTC Date. */
function localToUTC(
  year: number, month: number, day: number,
  hour: number, minute: number,
  tzName: string,
): Date {
  const naiveMs = Date.UTC(year, month - 1, day, hour, minute);
  const probe = new Date(naiveMs);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tzName,
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", hour12: false,
  }).formatToParts(probe);

  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value ?? "0");
  const tzMs = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"));
  const offsetMs = tzMs - naiveMs;
  return new Date(naiveMs - offsetMs);
}

// ── Shared: geocode + calculate ───────────────────────────────────────────────

interface BirthInput {
  name: string;
  relation?: Relation;
  birth_date: string;
  birth_time?: string;
  birth_city: string;
  lat?: number;
  lng?: number;
}

async function resolveAndCalculate(body: BirthInput) {
  let lat = body.lat;
  let lng = body.lng;

  if (lat == null || lng == null) {
    const geo = await geocodeCity(body.birth_city);
    if (!geo) return { error: `City not found: ${body.birth_city}` } as const;
    lat = geo.lat;
    lng = geo.lng;
  }

  const [year, month, day] = body.birth_date.split("-").map(Number);
  let localHour = 12;
  let localMinute = 0;
  if (body.birth_time) {
    const [h, m] = body.birth_time.split(":").map(Number);
    localHour = h;
    localMinute = m;
  }

  const tzName = findTimezone(lat, lng)[0] ?? "UTC";
  const utc = localToUTC(year, month, day, localHour, localMinute, tzName);

  try {
    const result = calculateNatalChart(
      utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(),
      utc.getUTCHours(), utc.getUTCMinutes(),
      lat, lng,
    );
    return { lat, lng, result };
  } catch (err) {
    return { error: `Calculation failed: ${err instanceof Error ? err.message : String(err)}` } as const;
  }
}

// ── POST: create new chart ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: BirthInput;
  try { body = await request.json() as BirthInput; }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { name, relation = "self", birth_date, birth_time = "", birth_city } = body;
  if (!name || !birth_date || !birth_city) {
    return NextResponse.json({ error: "name, birth_date and birth_city are required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // ── Self chart: always upsert (edit = update, not insert) ─────────────────
  if (relation === "self") {
    const geo = await resolveAndCalculate({ ...body, birth_time });
    if ("error" in geo) {
      const msg = geo.error ?? "Unknown error";
      return NextResponse.json({ error: msg }, { status: msg.includes("City") ? 422 : 500 });
    }

    // Check for existing self chart
    const { data: existing } = await db
      .from("natal_charts")
      .select("id")
      .eq("user_id", user.id)
      .eq("relation", "self")
      .limit(1)
      .maybeSingle();

    const payload = {
      user_id: user.id,
      name,
      relation: "self" as Relation,
      birth_date,
      birth_time: birth_time || null,
      birth_city,
      lat: geo.lat,
      lng: geo.lng,
      planets_json: geo.result.planets,
      houses_json: geo.result.houses,
      ascendant: geo.result.ascendant,
    };

    let chart, dbError;
    if (existing?.id) {
      // Update existing self chart
      ({ data: chart, error: dbError } = await db
        .from("natal_charts")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single());
    } else {
      // Ensure user row exists
      await db.from("users").upsert({ id: user.id, email: user.email }, { onConflict: "id", ignoreDuplicates: true });
      ({ data: chart, error: dbError } = await db
        .from("natal_charts")
        .insert(payload)
        .select()
        .single());
    }

    if (dbError) {
      console.error("[natal-chart] self upsert failed:", dbError.message);
      return NextResponse.json({ error: `DB error: ${dbError.message}` }, { status: 500 });
    }
    return NextResponse.json({ chart }, { status: 201 });
  }

  // ── Non-self chart: enforce plan limit (counts ALL charts incl. self) ──────
  const { data: userRow } = await db
    .from("users")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const tier = (userRow?.subscription_tier ?? "free") as SubscriptionTier;
  const maxCharts = PLANS[tier].maxCharts;

  const { count: currentCount } = await db
    .from("natal_charts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (maxCharts !== -1 && (currentCount ?? 0) >= maxCharts) {
    return NextResponse.json({ error: "chart_limit", max_charts: maxCharts, tier }, { status: 403 });
  }

  const geo = await resolveAndCalculate({ ...body, birth_time });
  if ("error" in geo) {
    const msg = geo.error ?? "Unknown error";
    return NextResponse.json({ error: msg }, { status: msg.includes("City") ? 422 : 500 });
  }

  const { data: chart, error } = await db
    .from("natal_charts")
    .insert({
      user_id: user.id,
      name,
      relation,
      birth_date,
      birth_time: birth_time || null,
      birth_city,
      lat: geo.lat,
      lng: geo.lng,
      planets_json: geo.result.planets,
      houses_json: geo.result.houses,
      ascendant: geo.result.ascendant,
    })
    .select()
    .single();

  if (error) {
    console.error("[natal-chart] insert failed:", error.message);
    return NextResponse.json({ error: `DB error: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ chart }, { status: 201 });
}

// ── GET: fetch all charts for the current user ────────────────────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: charts, error } = await (supabase as any)
    .from("natal_charts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: `DB error: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ charts });
}

// ── PATCH: edit (recalculate) an existing chart ───────────────────────────────

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chartId = request.nextUrl.searchParams.get("chart_id");
  if (!chartId) return NextResponse.json({ error: "chart_id required" }, { status: 400 });

  let body: BirthInput;
  try { body = await request.json() as BirthInput; }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { name, relation, birth_date, birth_time = "", birth_city } = body;
  if (!name || !birth_date || !birth_city) {
    return NextResponse.json({ error: "name, birth_date and birth_city are required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Verify ownership
  const { data: existing } = await db
    .from("natal_charts")
    .select("id, user_id")
    .eq("id", chartId)
    .eq("user_id", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Chart not found" }, { status: 404 });

  const geo = await resolveAndCalculate({ ...body, birth_time });
  if ("error" in geo) {
    const msg = geo.error ?? "Unknown error";
    return NextResponse.json({ error: msg }, { status: msg.includes("City") ? 422 : 500 });
  }

  const { data: chart, error } = await db
    .from("natal_charts")
    .update({
      name,
      ...(relation ? { relation } : {}),
      birth_date,
      birth_time: birth_time || null,
      birth_city,
      lat: geo.lat,
      lng: geo.lng,
      planets_json: geo.result.planets,
      houses_json: geo.result.houses,
      ascendant: geo.result.ascendant,
      updated_at: new Date().toISOString(),
    })
    .eq("id", chartId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[natal-chart] PATCH failed:", error.message);
    return NextResponse.json({ error: `DB error: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ chart });
}

// ── DELETE: remove a non-self chart ──────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chartId = request.nextUrl.searchParams.get("chart_id");
  if (!chartId) return NextResponse.json({ error: "chart_id required" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: chart } = await db
    .from("natal_charts")
    .select("id, user_id, relation")
    .eq("id", chartId)
    .eq("user_id", user.id)
    .single();

  if (!chart) return NextResponse.json({ error: "Chart not found" }, { status: 404 });
  if (chart.relation === "self") return NextResponse.json({ error: "Cannot delete your own chart" }, { status: 403 });

  const { error } = await db
    .from("natal_charts")
    .delete()
    .eq("id", chartId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: `DB error: ${error.message}` }, { status: 500 });

  return NextResponse.json({ success: true });
}
