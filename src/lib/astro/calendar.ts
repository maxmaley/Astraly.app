/**
 * Astro Calendar — event calculation engine.
 *
 * Reuses the same VSOP87 (astronomia) library as calculate.ts.
 *
 * Events computed per month:
 *  - Moon phases: New Moon, First Quarter, Full Moon, Last Quarter
 *  - Solar & Lunar eclipses (phase near North/South Node)
 *  - Retrograde station start / station direct for all planets
 *  - Planet sign ingresses (planet enters a new zodiac sign)
 *  - Moon sign changes (every ~2–3 days)
 *  - Sun sign ingresses (once per month)
 */
import { CalendarGregorianToJD } from "astronomia/julian";
import { apparentVSOP87 }        from "astronomia/solar";
import { position as moonPos }   from "astronomia/moonposition";
import { Planet }                from "astronomia/planetposition";
import { nutation as getNutation } from "astronomia/nutation";
import { heliocentric as plutoHelio } from "astronomia/pluto";
import earthData   from "astronomia/data/vsop87Bearth";
import mercuryData from "astronomia/data/vsop87Bmercury";
import venusData   from "astronomia/data/vsop87Bvenus";
import marsData    from "astronomia/data/vsop87Bmars";
import jupiterData from "astronomia/data/vsop87Bjupiter";
import saturnData  from "astronomia/data/vsop87Bsaturn";
import uranusData  from "astronomia/data/vsop87Buranus";
import neptuneData from "astronomia/data/vsop87Bneptune";
import baseModule  from "astronomia/base";

const { pmod } = baseModule;
const TWO_PI = 2 * Math.PI;

// ── Low-level helpers ──────────────────────────────────────────────────────

function norm(rad: number): number { return pmod(rad, TWO_PI); }

function radToDeg(rad: number): number {
  return ((rad * 180 / Math.PI) % 360 + 360) % 360;
}

const SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
] as const;

function signOf(deg: number): string {
  return SIGNS[Math.floor(((deg % 360) + 360) % 360 / 30)];
}

function toXYZ(lon: number, lat: number, r: number) {
  return {
    x: r * Math.cos(lat) * Math.cos(lon),
    y: r * Math.cos(lat) * Math.sin(lon),
    z: r * Math.sin(lat),
  };
}

function helioToGeoDeg(
  planet: { lon: number; lat: number; range: number },
  earth:  { lon: number; lat: number; range: number },
  Δψ: number,
): number {
  const p = toXYZ(planet.lon, planet.lat, planet.range);
  const e = toXYZ(earth.lon, earth.lat, earth.range);
  return radToDeg(norm(Math.atan2(p.y - e.y, p.x - e.x) + Δψ));
}

// Signed angular velocity (deg/day). Negative = retrograde.
function vel(prev: number, curr: number): number {
  let d = curr - prev;
  if (d >  180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

// Moon elongation 0–360° (0 = New Moon, 180 = Full Moon)
function elong(moonDeg: number, sunDeg: number): number {
  return ((moonDeg - sunDeg) % 360 + 360) % 360;
}

// Illumination fraction 0–1 from elongation
function illum(e: number): number {
  return (1 - Math.cos(e * Math.PI / 180)) / 2;
}

// Angular distance between two ecliptic longitudes (0–180)
function angDist(a: number, b: number): number {
  const d = Math.abs((a - b + 360) % 360);
  return d > 180 ? 360 - d : d;
}

// ── Singleton planet objects (created once per module) ─────────────────────
const pEarth   = new Planet(earthData);
const pMercury = new Planet(mercuryData);
const pVenus   = new Planet(venusData);
const pMars    = new Planet(marsData);
const pJupiter = new Planet(jupiterData);
const pSaturn  = new Planet(saturnData);
const pUranus  = new Planet(uranusData);
const pNeptune = new Planet(neptuneData);

// ── Daily snapshot ─────────────────────────────────────────────────────────
interface Snapshot {
  sunDeg:  number;
  moonDeg: number;
  nodeDeg: number; // Mean Ascending Node (North Node)
  mercury: number;
  venus:   number;
  mars:    number;
  jupiter: number;
  saturn:  number;
  uranus:  number;
  neptune: number;
  pluto:   number;
}

function takeSnapshot(jde: number): Snapshot {
  const [Δψ]   = getNutation(jde);
  const earthPos = pEarth.position(jde);
  const earthJ   = pEarth.position2000(jde);

  const sunDeg  = radToDeg(norm(apparentVSOP87(pEarth, jde).lon));
  const moonDeg = radToDeg(norm(moonPos(jde).lon));

  const T  = (jde - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  // Mean Ascending Node — Meeus Ch. 22
  const nodeDeg = ((125.0445479 - 1934.1362608*T + 0.0020754*T2 + 0.0000022*T3) % 360 + 360) % 360;

  function fromVSOP(pl: Planet): number {
    return helioToGeoDeg(pl.position(jde), earthPos, Δψ);
  }

  // Pluto uses a separate Meeus table
  const ph = plutoHelio(jde);
  const eh = earthJ;
  const plutoDeg = radToDeg(norm(
    Math.atan2(toXYZ(ph.lon, ph.lat, ph.range).y - toXYZ(eh.lon, eh.lat, eh.range).y,
               toXYZ(ph.lon, ph.lat, ph.range).x - toXYZ(eh.lon, eh.lat, eh.range).x) + Δψ
  ));

  return {
    sunDeg, moonDeg, nodeDeg,
    mercury: fromVSOP(pMercury),
    venus:   fromVSOP(pVenus),
    mars:    fromVSOP(pMars),
    jupiter: fromVSOP(pJupiter),
    saturn:  fromVSOP(pSaturn),
    uranus:  fromVSOP(pUranus),
    neptune: fromVSOP(pNeptune),
    pluto:   plutoDeg,
  };
}

// ── Public types ───────────────────────────────────────────────────────────

export type EventType =
  | "new_moon" | "first_quarter" | "full_moon" | "last_quarter"
  | "solar_eclipse" | "lunar_eclipse"
  | "retrograde_start" | "retrograde_end"
  | "ingress" | "moon_sign";

export interface CalendarEvent {
  type:    EventType;
  date:    string;   // "YYYY-MM-DD"
  planet?: string;   // "Mercury", "Moon", "Sun", …
  sign?:   string;   // "Aries", "Taurus", …
}

export interface DayInfo {
  date:             string;
  moonPhaseAngle:   number; // 0–360 (0=New, 180=Full)
  moonIllumination: number; // 0–1
  moonSign:         string;
  sunSign:          string;
  events:           CalendarEvent[];
}

// ── Main function ──────────────────────────────────────────────────────────

/**
 * Compute all astrological events for every day of a given month.
 * Snapshots are taken at noon UTC each day.
 */
export function calculateCalendarMonth(year: number, month: number): DayInfo[] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  // Build snapshots: day 0 (prev month last day) + days 1..N + day N+1 (next month)
  const snaps: Snapshot[] = [];

  for (let d = 0; d <= daysInMonth + 1; d++) {
    // d=0 → last day of previous month; d=N+1 → first day of next month
    const date = new Date(Date.UTC(year, month - 1, d)); // d=0 goes to prev month
    const jde  = CalendarGregorianToJD(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate() + 0.5, // noon
    );
    snaps.push(takeSnapshot(jde));
  }

  const PLANET_KEYS = [
    "mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto",
  ] as const;
  const PLANET_LABEL: Record<string, string> = {
    mercury: "Mercury", venus: "Venus", mars: "Mars",
    jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus",
    neptune: "Neptune", pluto: "Pluto",
  };

  const result: DayInfo[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const prev = snaps[d - 1]; // noon yesterday
    const curr = snaps[d];     // noon today
    const next = snaps[d + 1]; // noon tomorrow

    const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const events: CalendarEvent[] = [];

    // ── Moon phase ───────────────────────────────────────────────────────
    const prevElong = elong(prev.moonDeg, prev.sunDeg);
    const currElong = elong(curr.moonDeg, curr.sunDeg);

    const phaseCrossed = (target: number): boolean => {
      if (target === 0) return prevElong > 300 && currElong < 60;
      return prevElong < target && currElong >= target;
    };

    const isNewMoon  = phaseCrossed(0);
    const isFullMoon = phaseCrossed(180);

    if (isNewMoon || isFullMoon) {
      // Eclipse check: Moon near North or South Node
      const southNodeDeg = (curr.nodeDeg + 180) % 360;
      const distToNode = Math.min(
        angDist(curr.moonDeg, curr.nodeDeg),
        angDist(curr.moonDeg, southNodeDeg),
      );
      if (isNewMoon) {
        events.push(distToNode < 18
          ? { type: "solar_eclipse", date: dateStr }
          : { type: "new_moon",      date: dateStr });
      } else {
        events.push(distToNode < 12
          ? { type: "lunar_eclipse", date: dateStr }
          : { type: "full_moon",     date: dateStr });
      }
    } else if (phaseCrossed(90)) {
      events.push({ type: "first_quarter", date: dateStr });
    } else if (phaseCrossed(270)) {
      events.push({ type: "last_quarter",  date: dateStr });
    }

    // ── Moon sign change ─────────────────────────────────────────────────
    const prevMoonSign = signOf(prev.moonDeg);
    const currMoonSign = signOf(curr.moonDeg);
    if (prevMoonSign !== currMoonSign) {
      events.push({ type: "moon_sign", date: dateStr, planet: "Moon", sign: currMoonSign });
    }

    // ── Sun ingress (once per month, Sun enters new sign) ────────────────
    const prevSunSign = signOf(prev.sunDeg);
    const currSunSign = signOf(curr.sunDeg);
    if (prevSunSign !== currSunSign) {
      events.push({ type: "ingress", date: dateStr, planet: "Sun", sign: currSunSign });
    }

    // ── Planets: retrograde stations + sign ingresses ────────────────────
    for (const key of PLANET_KEYS) {
      const name    = PLANET_LABEL[key];
      const prevDeg = prev[key];
      const currDeg = curr[key];
      const nextDeg = next[key];

      // Velocity sign change → retrograde station
      const vPrev = vel(prevDeg, currDeg); // velocity during today
      const vCurr = vel(currDeg, nextDeg); // velocity during tomorrow

      if (vPrev > 0.0005 && vCurr < -0.0005) {
        events.push({ type: "retrograde_start", date: dateStr, planet: name });
      } else if (vPrev < -0.0005 && vCurr > 0.0005) {
        events.push({ type: "retrograde_end", date: dateStr, planet: name });
      }

      // Sign change → ingress
      const prevSign = signOf(prevDeg);
      const currSign = signOf(currDeg);
      if (prevSign !== currSign) {
        events.push({ type: "ingress", date: dateStr, planet: name, sign: currSign });
      }
    }

    // ── Sort events: phases first, then moon sign, then planets ─────────
    const ORDER: Record<EventType, number> = {
      solar_eclipse: 0, lunar_eclipse: 1,
      new_moon: 2, full_moon: 3, first_quarter: 4, last_quarter: 5,
      retrograde_start: 6, retrograde_end: 7,
      ingress: 8, moon_sign: 9,
    };
    events.sort((a, b) => (ORDER[a.type] ?? 99) - (ORDER[b.type] ?? 99));

    result.push({
      date: dateStr,
      moonPhaseAngle:   currElong,
      moonIllumination: illum(currElong),
      moonSign:         currMoonSign,
      sunSign:          currSunSign,
      events,
    });
  }

  return result;
}
