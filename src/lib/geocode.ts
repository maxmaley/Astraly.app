export interface GeoLocation {
  lat: number;
  lng: number;
  displayName: string;
  timezone?: string;
}

// ── Open-Meteo Geocoding (primary) ─────────────────────────────────────────
// Free, no API key, GeoNames-based, returns timezone.
// https://open-meteo.com/en/docs/geocoding-api
interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

async function geocodeViaOpenMeteo(query: string, lang: string): Promise<GeoLocation | null> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", lang);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const data = (await res.json()) as { results?: OpenMeteoResult[] };
  const best = data.results?.[0];
  if (!best) return null;

  const parts = [best.name, best.admin1, best.country].filter(Boolean);
  return {
    lat: best.latitude,
    lng: best.longitude,
    displayName: parts.join(", "),
    timezone: best.timezone,
  };
}

// ── Photon / komoot (fallback) ──────────────────────────────────────────────
interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: { name?: string; state?: string; country?: string; type?: string };
}

const PLACE_TYPES = new Set([
  "city", "town", "village", "hamlet", "municipality", "borough",
]);

async function geocodeViaPhoton(query: string): Promise<GeoLocation | null> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");
  url.searchParams.set("lang", "en");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "Astraly.app/1.0 (contact@astraly.app)" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { features: PhotonFeature[] };
  const best =
    data.features.find((f) => PLACE_TYPES.has(f.properties.type ?? "")) ??
    data.features[0];
  if (!best) return null;

  const p = best.properties;
  const parts = [p.name, p.state, p.country].filter(Boolean);
  return {
    lat: best.geometry.coordinates[1],
    lng: best.geometry.coordinates[0],
    displayName: parts.join(", "),
  };
}

// ── Public API ──────────────────────────────────────────────────────────────
export async function geocodeCity(
  city: string,
  lang = "ru",
): Promise<GeoLocation | null> {
  const query = city.trim();
  if (!query) return null;

  try {
    const result = await geocodeViaOpenMeteo(query, lang);
    if (result) return result;
  } catch { /* fall through */ }

  try {
    return await geocodeViaPhoton(query);
  } catch {
    return null;
  }
}
