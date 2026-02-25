/**
 * Geocode a city name to lat/lng using OpenStreetMap Nominatim.
 * No API key required. Handles Russian/Ukrainian/English city names,
 * common prefixes, and multi-attempt fallback for robustness.
 */
export interface GeoLocation {
  lat: number;
  lng: number;
  displayName: string;
}

// Common CIS/Eastern European city name prefixes to strip before searching
const PREFIX_RE = /^(г\.о\.|г\.|city\s+of\s+|с\.|пгт\.?\s*|п\.\s*|городской округ\s*|oblast'?\s+|обл\.\s*)/i;

/**
 * Normalize a city string: strip prefixes, collapse whitespace, trim.
 * "г. Москва" → "Москва"
 * "г.о. Красногорск" → "Красногорск"
 * "city of London" → "London"
 */
function normalizeCity(city: string): string {
  return city.replace(PREFIX_RE, "").replace(/\s+/g, " ").trim();
}

/**
 * Simple Cyrillic → Latin transliteration for common letters.
 * Used as a fallback when native Cyrillic query returns no results.
 */
function transliterate(text: string): string {
  const MAP: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
    ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
    я: "ya",
    // Ukrainian extras
    і: "i", ї: "yi", є: "ye", ґ: "g",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => MAP[c] ?? c)
    .join("");
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;
}

async function queryNominatim(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0&featuretype=city,town,village`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Astraly.app/1.0 (contact@astraly.app)",
      "Accept-Language": "ru,uk,en",
    },
    next: { revalidate: 86400 }, // 24h cache — coordinates don't change
  });

  if (!res.ok) return [];
  return (await res.json()) as NominatimResult[];
}

function pickBest(results: NominatimResult[]): NominatimResult | null {
  if (!results.length) return null;
  // Prefer actual city/town/village/municipality results over administrative areas
  const preferred = results.find((r) =>
    ["city", "town", "village", "municipality", "administrative"].includes(r.type ?? ""),
  );
  return preferred ?? results[0];
}

/**
 * Geocode a city name with multi-attempt fallback:
 * 1. Normalized input (strips prefixes like "г.", "г.о.", etc.)
 * 2. Transliterated to Latin (for small CIS towns only in OSM under Latin name)
 * Returns null if city genuinely not found after all attempts.
 */
export async function geocodeCity(city: string): Promise<GeoLocation | null> {
  const normalized = normalizeCity(city);

  // Attempt 1 — normalized native input
  let results = await queryNominatim(normalized);
  let best = pickBest(results);

  // Attempt 2 — transliterated Latin (common for obscure CIS towns)
  if (!best) {
    const latin = transliterate(normalized);
    if (latin !== normalized.toLowerCase()) {
      results = await queryNominatim(latin);
      best = pickBest(results);
    }
  }

  // Attempt 3 — first word only (handles "Нижний Новгород" if spelled "Нижни Новгород")
  if (!best && normalized.includes(" ")) {
    const firstWord = normalized.split(" ")[0];
    if (firstWord.length > 3) {
      results = await queryNominatim(firstWord);
      best = pickBest(results);
    }
  }

  if (!best) return null;

  return {
    lat: parseFloat(best.lat),
    lng: parseFloat(best.lon),
    displayName: best.display_name,
  };
}
