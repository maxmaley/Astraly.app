/**
 * Natal chart calculation using VSOP87 (via astronomia) + Meeus algorithms.
 * Accuracy: ~0.5–2 arcminutes for planets, sufficient for astrology.
 * Houses: Whole Sign system (simplest and widely used in traditional astrology).
 */
import { CalendarGregorianToJD } from "astronomia/julian";
import baseModule from "astronomia/base";
import { apparentVSOP87 } from "astronomia/solar";
import { position as moonPosition } from "astronomia/moonposition";
import { Planet } from "astronomia/planetposition";
import { apparent as gast } from "astronomia/sidereal";
import { nutation as getNutation, meanObliquity } from "astronomia/nutation";
import { heliocentric as plutoHeliocentric } from "astronomia/pluto";
import { eclipticPosition as precess } from "astronomia/precess";
import earthData from "astronomia/data/vsop87Bearth";
import mercuryData from "astronomia/data/vsop87Bmercury";
import venusData from "astronomia/data/vsop87Bvenus";
import marsData from "astronomia/data/vsop87Bmars";
import jupiterData from "astronomia/data/vsop87Bjupiter";
import saturnData from "astronomia/data/vsop87Bsaturn";
import uranusData from "astronomia/data/vsop87Buranus";
import neptuneData from "astronomia/data/vsop87Bneptune";

const { pmod, JDEToJulianYear } = baseModule;

const TWO_PI = 2 * Math.PI;
const DEG = Math.PI / 180;

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export type ZodiacSign = typeof SIGNS[number];

export interface PlanetData {
  sign: ZodiacSign;
  degree: number;   // 0–29.999...° within the sign
  house: number;    // 1–12
  retrograde: boolean;
}

export interface AscendantData {
  sign: ZodiacSign;
  degree: number;
}

export interface HouseData {
  house: number;
  sign: ZodiacSign;
  degree: number; // always 0 for Whole Sign
}

export interface ChartResult {
  planets: {
    Sun: PlanetData;
    Moon: PlanetData;
    Mercury: PlanetData;
    Venus: PlanetData;
    Mars: PlanetData;
    Jupiter: PlanetData;
    Saturn: PlanetData;
    Uranus: PlanetData;
    Neptune: PlanetData;
    Pluto: PlanetData;
  };
  ascendant: AscendantData;
  houses: HouseData[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function norm(rad: number): number {
  return pmod(rad, TWO_PI);
}

function lonToSignDeg(lonRad: number): { sign: ZodiacSign; degree: number } {
  const deg = (lonRad * 180 / Math.PI % 360 + 360) % 360;
  const idx = Math.floor(deg / 30);
  return { sign: SIGNS[idx], degree: deg - idx * 30 };
}

// Convert heliocentric ecliptic (spherical) to rectangular Cartesian
function toRect(lon: number, lat: number, r: number) {
  return {
    x: r * Math.cos(lat) * Math.cos(lon),
    y: r * Math.cos(lat) * Math.sin(lon),
    z: r * Math.sin(lat),
  };
}

// Geocentric ecliptic longitude from heliocentric planet + earth positions
function helioToGeo(
  planet: { lon: number; lat: number; range: number },
  earth: { lon: number; lat: number; range: number },
  Δψ: number,
): number {
  const p = toRect(planet.lon, planet.lat, planet.range);
  const e = toRect(earth.lon, earth.lat, earth.range);
  return norm(Math.atan2(p.y - e.y, p.x - e.x) + Δψ);
}

// Is the geocentric longitude decreasing over ±0.5 day?
function checkRetrograde(
  planetObj: Planet,
  earthObj: Planet,
  jde: number,
): boolean {
  const step = 0.5;
  const [Δψ1] = getNutation(jde - step);
  const [Δψ2] = getNutation(jde + step);
  const l1 = helioToGeo(planetObj.position(jde - step), earthObj.position(jde - step), Δψ1);
  const l2 = helioToGeo(planetObj.position(jde + step), earthObj.position(jde + step), Δψ2);
  let d = l2 - l1;
  if (d > Math.PI) d -= TWO_PI;
  if (d < -Math.PI) d += TWO_PI;
  return d < 0;
}

// Ascendant from Local Apparent Sidereal Time + obliquity + latitude
// Meeus, Chapter 11, p. 99
function calcAsc(lastSec: number, epsilon: number, phiRad: number): number {
  const lastRad = norm(lastSec * Math.PI / 43200);
  const [sinL, cosL] = [Math.sin(lastRad), Math.cos(lastRad)];
  const [sinE, cosE] = [Math.sin(epsilon), Math.cos(epsilon)];
  return norm(Math.atan2(-cosL, sinE * Math.tan(phiRad) + cosE * sinL));
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Calculate a natal chart for the given UTC birth date/time and location.
 *
 * @param year  full year (e.g. 1995)
 * @param month 1–12
 * @param day   1–31
 * @param hour  0–23 (UTC)
 * @param minute 0–59 (UTC)
 * @param lat   geographic latitude (+N, -S)
 * @param lng   geographic longitude (+E, -W)
 */
export function calculateNatalChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  lat: number,
  lng: number,
): ChartResult {
  // Julian Ephemeris Day for birth moment (input is UTC; TT ≈ UTC + ~70s, negligible for astrology)
  const dayFrac = day + (hour + minute / 60) / 24;
  const jde = CalendarGregorianToJD(year, month, dayFrac);

  // Pre-compute shared values
  const [Δψ, Δε] = getNutation(jde);
  const ε = meanObliquity(jde) + Δε; // true obliquity
  const earth = new Planet(earthData);
  const earthPos = earth.position(jde);
  const epochNow = JDEToJulianYear(jde);

  // ── Sun ────────────────────────────────────────────────────────────────────
  const sunCoord = apparentVSOP87(earth, jde);
  const sunLon = norm(sunCoord.lon);

  // ── Moon ───────────────────────────────────────────────────────────────────
  const moonCoord = moonPosition(jde);
  const moonLon = norm(moonCoord.lon);

  // ── Inner / outer planets via VSOP87 B ────────────────────────────────────
  function makePlanet(data: object): { lon: number; retrograde: boolean } {
    const obj = new Planet(data);
    return {
      lon: helioToGeo(obj.position(jde), earthPos, Δψ),
      retrograde: checkRetrograde(obj, earth, jde),
    };
  }
  const mercury = makePlanet(mercuryData);
  const venus = makePlanet(venusData);
  const mars = makePlanet(marsData);
  const jupiter = makePlanet(jupiterData);
  const saturn = makePlanet(saturnData);
  const uranus = makePlanet(uranusData);
  const neptune = makePlanet(neptuneData);

  // ── Pluto (Meeus Table 37.a — J2000 heliocentric, precessed to date) ───────
  const plutoJ2000 = plutoHeliocentric(jde);
  const earthJ2000 = earth.position2000(jde);
  const plutoGeoJ2000 = Math.atan2(
    toRect(plutoJ2000.lon, plutoJ2000.lat, plutoJ2000.range).y
      - toRect(earthJ2000.lon, earthJ2000.lat, earthJ2000.range).y,
    toRect(plutoJ2000.lon, plutoJ2000.lat, plutoJ2000.range).x
      - toRect(earthJ2000.lon, earthJ2000.lat, earthJ2000.range).x,
  );
  // Precess J2000 → ecliptic of date, then add nutation
  const plutoPrec = precess({ lon: plutoGeoJ2000, lat: 0 }, 2000.0, epochNow);
  const plutoLon = norm(plutoPrec.lon + Δψ);

  // ── Ascendant ──────────────────────────────────────────────────────────────
  // GAST (seconds of time) → LAST (seconds) by adding lng × 240 s/°
  const gastSec = gast(jde);
  const lastSec = pmod(gastSec + lng * 240, 86400);
  const ascLon = calcAsc(lastSec, ε, lat * DEG);

  const ascSignDeg = lonToSignDeg(ascLon);
  const ascSignIdx = SIGNS.indexOf(ascSignDeg.sign);

  // ── Whole Sign houses ─────────────────────────────────────────────────────
  const houses: HouseData[] = Array.from({ length: 12 }, (_, i) => ({
    house: i + 1,
    sign: SIGNS[(ascSignIdx + i) % 12],
    degree: 0,
  }));

  function toHouse(lonRad: number): number {
    const { sign } = lonToSignDeg(lonRad);
    const diff = (SIGNS.indexOf(sign) - ascSignIdx + 12) % 12;
    return diff + 1;
  }

  function planet(lonRad: number, retrograde = false): PlanetData {
    const { sign, degree } = lonToSignDeg(lonRad);
    return { sign, degree, house: toHouse(lonRad), retrograde };
  }

  return {
    planets: {
      Sun: planet(sunLon, false),
      Moon: planet(moonLon, false),
      Mercury: planet(mercury.lon, mercury.retrograde),
      Venus: planet(venus.lon, venus.retrograde),
      Mars: planet(mars.lon, mars.retrograde),
      Jupiter: planet(jupiter.lon, jupiter.retrograde),
      Saturn: planet(saturn.lon, saturn.retrograde),
      Uranus: planet(uranus.lon, uranus.retrograde),
      Neptune: planet(neptune.lon, neptune.retrograde),
      Pluto: planet(plutoLon, false),
    },
    ascendant: ascSignDeg,
    houses,
  };
}
