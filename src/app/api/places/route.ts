import { NextRequest, NextResponse } from "next/server";

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    state?: string;
    country?: string;
    type?: string;
  };
}

export interface PlaceOption {
  name: string; // "Старобільськ, Луганська область, Україна"
  city: string; // "Старобільськ"
  lat: number;
  lng: number;
}

const PLACE_TYPES = new Set([
  "city", "town", "village", "hamlet", "municipality", "borough",
]);

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const lang = req.nextUrl.searchParams.get("lang") ?? "ru";

  if (q.trim().length < 2) return NextResponse.json([]);

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "8");
  url.searchParams.set("lang", lang);

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Astraly.app/1.0 (contact@astraly.app)" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return NextResponse.json([]);

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

    return NextResponse.json(results, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json([]);
  }
}
