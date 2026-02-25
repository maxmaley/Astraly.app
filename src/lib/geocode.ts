/**
 * Geocode a city name to lat/lng using OpenStreetMap Nominatim.
 * No API key required. Returns null if city not found.
 */
export interface GeoLocation {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeCity(city: string): Promise<GeoLocation | null> {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&addressdetails=0`;

  const res = await fetch(url, {
    headers: {
      // Nominatim requires a User-Agent identifying the app
      "User-Agent": "Astraly.app/1.0 (contact@astraly.app)",
      "Accept-Language": "ru,en",
    },
    next: { revalidate: 86400 }, // cache 24h — city coords don't change
  });

  if (!res.ok) return null;

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
