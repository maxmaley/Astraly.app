/**
 * Geocode a city name to lat/lng using Photon (komoot.io).
 * Built on OpenStreetMap data, free, no API key required.
 * Better multilingual support for CIS cities than raw Nominatim.
 */
export interface GeoLocation {
  lat: number;
  lng: number;
  displayName: string;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    state?: string;
    country?: string;
    type?: string;
  };
}

const PLACE_TYPES = new Set([
  "city", "town", "village", "hamlet", "municipality", "borough",
]);

export async function geocodeCity(city: string): Promise<GeoLocation | null> {
  const query = city.trim();
  if (!query) return null;

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");
  url.searchParams.set("lang", "ru");

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Astraly.app/1.0 (contact@astraly.app)" },
      next: { revalidate: 86400 }, // 24h cache
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { features: PhotonFeature[] };

    const best = data.features.find((f) => PLACE_TYPES.has(f.properties.type ?? ""))
      ?? data.features[0];

    if (!best) return null;

    const p = best.properties;
    const parts = [p.name, p.state, p.country].filter(Boolean);

    return {
      lat: best.geometry.coordinates[1],
      lng: best.geometry.coordinates[0],
      displayName: parts.join(", "),
    };
  } catch {
    return null;
  }
}
