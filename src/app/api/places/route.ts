import { NextRequest, NextResponse } from "next/server";

export interface PlaceOption {
  name: string; // "Москва, Москва, Россия"
  city: string; // "Москва"
  lat: number;
  lng: number;
  timezone?: string;
}

// ── Open-Meteo Geocoding (primary) ─────────────────────────────────────────
interface OpenMeteoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

async function searchViaOpenMeteo(q: string, lang: string): Promise<PlaceOption[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", q);
  url.searchParams.set("count", "10");
  url.searchParams.set("language", lang);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = (await res.json()) as { results?: OpenMeteoResult[] };
  if (!data.results?.length) return [];

  const seen = new Set<string>();
  const results: PlaceOption[] = [];

  for (const r of data.results) {
    const key = r.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const parts = [r.name, r.admin1, r.country].filter(Boolean);
    results.push({
      name: parts.join(", "),
      city: r.name,
      lat: r.latitude,
      lng: r.longitude,
      timezone: r.timezone,
    });
    if (results.length >= 5) break;
  }

  return results;
}

// ── Photon / komoot (fallback) ──────────────────────────────────────────────
interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: { name?: string; state?: string; country?: string; type?: string };
}

const PLACE_TYPES = new Set([
  "city", "town", "village", "hamlet", "municipality", "borough",
]);

async function searchViaPhoton(q: string, lang: string): Promise<PlaceOption[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "8");
  url.searchParams.set("lang", lang);

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "Astraly.app/1.0 (contact@astraly.app)" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { features: PhotonFeature[] };
  const seen = new Set<string>();
  const results: PlaceOption[] = [];

  for (const f of data.features) {
    const p = f.properties;
    if (!PLACE_TYPES.has(p.type ?? "")) continue;
    const cityName = p.name ?? "";
    if (!cityName) continue;
    const key = cityName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const parts = [cityName, p.state, p.country].filter(Boolean);
    results.push({
      name: parts.join(", "),
      city: cityName,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    });
    if (results.length >= 5) break;
  }

  return results;
}

// ── Handler ─────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const lang = req.nextUrl.searchParams.get("lang") ?? "ru";

  if (q.trim().length < 2) return NextResponse.json([]);

  try {
    let results = await searchViaOpenMeteo(q.trim(), lang);

    if (!results.length) {
      results = await searchViaPhoton(q.trim(), lang);
    }

    return NextResponse.json(results, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json([]);
  }
}
