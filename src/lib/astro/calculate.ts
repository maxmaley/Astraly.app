/**
 * Natal chart calculation using VSOP87 (via astronomia) + Meeus algorithms.
 *
 * Planetary positions: VSOP87 Series B — accuracy < 1 arcminute for all planets.
 * House system: Placidus — the professional standard (used by Astro.com, Solar Fire, etc.)
 * Fallback for latitudes > 66°: Equal houses (Placidus is undefined near poles).
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
  mc_sign: ZodiacSign;
  mc_degree: number;
}

export interface HouseData {
  house: number;
  sign: ZodiacSign;
  degree: number;   // degrees within sign where this house cusp falls
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

// ── Low-level helpers ─────────────────────────────────────────────────────────

function norm(rad: number): number {
  return pmod(rad, TWO_PI);
}

function normDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function lonToSignDeg(lonRad: number): { sign: ZodiacSign; degree: number } {
  const deg = (lonRad * 180 / Math.PI % 360 + 360) % 360;
  const idx = Math.floor(deg / 30);
  return { sign: SIGNS[idx], degree: deg - idx * 30 };
}

function toRect(lon: number, lat: number, r: number) {
  return {
    x: r * Math.cos(lat) * Math.cos(lon),
    y: r * Math.cos(lat) * Math.sin(lon),
    z: r * Math.sin(lat),
  };
}

function helioToGeo(
  planet: { lon: number; lat: number; range: number },
  earth: { lon: number; lat: number; range: number },
  Δψ: number,
): number {
  const p = toRect(planet.lon, planet.lat, planet.range);
  const e = toRect(earth.lon, earth.lat, earth.range);
  return norm(Math.atan2(p.y - e.y, p.x - e.x) + Δψ);
}

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

// Ascendant — Meeus Ch. 11, p. 99
function calcAsc(lastSec: number, epsilon: number, phiRad: number): number {
  const lastRad = norm(lastSec * Math.PI / 43200);
  const [sinL, cosL] = [Math.sin(lastRad), Math.cos(lastRad)];
  const [sinE, cosE] = [Math.sin(epsilon), Math.cos(epsilon)];
  return norm(Math.atan2(-cosL, sinE * Math.tan(phiRad) + cosE * sinL));
}

// MC from RAMC and obliquity
function calcMC(RAMC_deg: number, eps: number): number {
  const r = RAMC_deg * DEG;
  return norm(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(eps)));
}

// ── Placidus house system ─────────────────────────────────────────────────────
//
// Each intermediate cusp λ satisfies:
//   Upper (houses 11, 12, n=1,2):
//     RA(λ) = RAMC + n·30° + (n+3)/3 · AD(λ)
//   Lower (houses 2, 3, n=1,2):
//     RA(λ) = RAMC + (n+6)·30° − (n+3)/3 · AD(λ)
//
// Where:
//   δ(λ) = arcsin(sin ε · sin λ)          — declination
//   AD(λ) = arcsin(tan φ · tan δ)          — ascensional difference
//   RA(λ) = atan2(sin λ · cos ε, cos λ)   — right ascension
//   λ     = atan2(sin RA / cos ε, cos RA)  — back from RA to ecliptic lon
//
// Solved iteratively (typically converges in < 10 steps to < 0.1 arcsec).

function placidusIntermediate(
  RAMC_deg: number,
  eps: number,        // obliquity in radians
  phi: number,        // latitude in radians
  n: number,          // 1 or 2
  upper: boolean,     // true → houses 11/12; false → houses 2/3
): number {
  const initialOffset = upper ? n * 30 : (n + 6) * 30;
  let lambdaDeg = normDeg(RAMC_deg + initialOffset);

  for (let iter = 0; iter < 50; iter++) {
    const lambda = lambdaDeg * DEG;

    // Declination
    const sinDelta = Math.sin(eps) * Math.sin(lambda);
    if (Math.abs(sinDelta) > 1) break;
    const delta = Math.asin(sinDelta);

    // Ascensional difference
    const tanProd = Math.tan(phi) * Math.tan(delta);
    if (Math.abs(tanProd) >= 1) return norm(lambda); // circumpolar
    const AD_deg = Math.asin(tanProd) / DEG;

    // Target RA for this cusp
    const RA_deg = upper
      ? RAMC_deg + n * 30 + (n + 3) / 3 * AD_deg
      : RAMC_deg + (n + 6) * 30 - (n + 3) / 3 * AD_deg;

    // RA → ecliptic longitude: tan(λ) = tan(RA) / cos(ε)
    const RA_rad = RA_deg * DEG;
    const newLambdaDeg = normDeg(
      Math.atan2(Math.sin(RA_rad) / Math.cos(eps), Math.cos(RA_rad)) / DEG
    );

    if (Math.abs(newLambdaDeg - lambdaDeg) < 0.00005) break; // ~0.18 arcsec
    lambdaDeg = newLambdaDeg;
  }

  return norm(lambdaDeg * DEG);
}

/**
 * Compute 12 Placidus house cusps as ecliptic longitudes in radians (0–2π).
 * Index 0 = House 1 (ASC), index 9 = House 10 (MC), etc.
 * Falls back to Equal houses for latitudes > 66° where Placidus is undefined.
 */
function calcPlacidusHouses(
  RAMC_deg: number,
  eps: number,
  phi: number,
  ascLon: number,
): number[] {
  const mc  = calcMC(RAMC_deg, eps);
  const ic  = norm(mc  + Math.PI);
  const dc  = norm(ascLon + Math.PI);

  // Equal house fallback for polar latitudes
  if (Math.abs(phi / DEG) > 66) {
    return Array.from({ length: 12 }, (_, i) => norm(ascLon + i * 30 * DEG));
  }

  let c11: number, c12: number, c2: number, c3: number;
  try {
    c11 = placidusIntermediate(RAMC_deg, eps, phi, 1, true);
    c12 = placidusIntermediate(RAMC_deg, eps, phi, 2, true);
    c2  = placidusIntermediate(RAMC_deg, eps, phi, 1, false);
    c3  = placidusIntermediate(RAMC_deg, eps, phi, 2, false);
  } catch {
    // Arithmetic fallback (shouldn't normally trigger)
    c11 = norm(mc + 30  * DEG);
    c12 = norm(mc + 60  * DEG);
    c2  = norm(ic + 30  * DEG);
    c3  = norm(ic + 60  * DEG);
  }

  // Cusps ordered by house number (index 0 = House 1):
  //  1=ASC  2=c2   3=c3   4=IC   5=c11+π  6=c12+π
  //  7=DC   8=c2+π 9=c3+π 10=MC  11=c11   12=c12
  return [
    ascLon,              // H1
    c2,                  // H2
    c3,                  // H3
    ic,                  // H4
    norm(c11 + Math.PI), // H5 (opposite H11)
    norm(c12 + Math.PI), // H6 (opposite H12)
    dc,                  // H7
    norm(c2  + Math.PI), // H8 (opposite H2)
    norm(c3  + Math.PI), // H9 (opposite H3)
    mc,                  // H10
    c11,                 // H11
    c12,                 // H12
  ];
}

/**
 * Determine which Placidus house a planet (ecliptic longitude in radians) falls in.
 * Cusps array: index 0 = House 1, ..., index 11 = House 12.
 */
function findHouse(planetLon: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end   = cusps[(i + 1) % 12];

    const inArc = end >= start
      ? planetLon >= start && planetLon < end
      : planetLon >= start || planetLon < end;

    if (inArc) return i + 1;
  }
  return 1;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Calculate a natal chart for the given UTC birth date/time and location.
 *
 * @param year   full year (e.g. 1995)
 * @param month  1–12
 * @param day    1–31
 * @param hour   0–23 (UTC)
 * @param minute 0–59 (UTC)
 * @param lat    geographic latitude  (+N / −S)
 * @param lng    geographic longitude (+E / −W)
 */
export function calculateNatalChart(
  year: number, month: number, day: number,
  hour: number, minute: number,
  lat: number, lng: number,
): ChartResult {
  const dayFrac = day + (hour + minute / 60) / 24;
  const jde = CalendarGregorianToJD(year, month, dayFrac);

  const [Δψ, Δε] = getNutation(jde);
  const ε = meanObliquity(jde) + Δε;          // true obliquity
  const earth = new Planet(earthData);
  const earthPos = earth.position(jde);
  const epochNow = JDEToJulianYear(jde);

  // ── Sun ──────────────────────────────────────────────────────────────────
  const sunLon = norm(apparentVSOP87(earth, jde).lon);

  // ── Moon ─────────────────────────────────────────────────────────────────
  const moonLon = norm(moonPosition(jde).lon);

  // ── Planets (VSOP87 B) ───────────────────────────────────────────────────
  function makePlanet(data: object) {
    const obj = new Planet(data);
    return {
      lon: helioToGeo(obj.position(jde), earthPos, Δψ),
      retrograde: checkRetrograde(obj, earth, jde),
    };
  }
  const mercury = makePlanet(mercuryData);
  const venus   = makePlanet(venusData);
  const mars    = makePlanet(marsData);
  const jupiter = makePlanet(jupiterData);
  const saturn  = makePlanet(saturnData);
  const uranus  = makePlanet(uranusData);
  const neptune = makePlanet(neptuneData);

  // ── Pluto (Meeus Table 37.a) ─────────────────────────────────────────────
  const plutoJ2000  = plutoHeliocentric(jde);
  const earthJ2000  = earth.position2000(jde);
  const plutoGeoJ2000 = Math.atan2(
    toRect(plutoJ2000.lon, plutoJ2000.lat, plutoJ2000.range).y - toRect(earthJ2000.lon, earthJ2000.lat, earthJ2000.range).y,
    toRect(plutoJ2000.lon, plutoJ2000.lat, plutoJ2000.range).x - toRect(earthJ2000.lon, earthJ2000.lat, earthJ2000.range).x,
  );
  const plutoPrec = precess({ lon: plutoGeoJ2000, lat: 0 }, 2000.0, epochNow);
  const plutoLon = norm(plutoPrec.lon + Δψ);

  // ── Ascendant & MC ───────────────────────────────────────────────────────
  const gastSec  = gast(jde);
  const lastSec  = pmod(gastSec + lng * 240, 86400);
  const RAMC_deg = (lastSec / 240); // LAST in degrees
  const ascLon   = calcAsc(lastSec, ε, lat * DEG);
  const mcLon    = calcMC(RAMC_deg, ε);

  const ascSignDeg = lonToSignDeg(ascLon);
  const mcSignDeg  = lonToSignDeg(mcLon);

  // ── Placidus houses ──────────────────────────────────────────────────────
  const cusps = calcPlacidusHouses(RAMC_deg, ε, lat * DEG, ascLon);

  const houses: HouseData[] = cusps.map((cuspLon, i) => {
    const { sign, degree } = lonToSignDeg(cuspLon);
    return { house: i + 1, sign, degree };
  });

  function planet(lonRad: number, retrograde = false): PlanetData {
    const { sign, degree } = lonToSignDeg(lonRad);
    return { sign, degree, house: findHouse(lonRad, cusps), retrograde };
  }

  return {
    planets: {
      Sun:     planet(sunLon, false),
      Moon:    planet(moonLon, false),
      Mercury: planet(mercury.lon, mercury.retrograde),
      Venus:   planet(venus.lon,   venus.retrograde),
      Mars:    planet(mars.lon,    mars.retrograde),
      Jupiter: planet(jupiter.lon, jupiter.retrograde),
      Saturn:  planet(saturn.lon,  saturn.retrograde),
      Uranus:  planet(uranus.lon,  uranus.retrograde),
      Neptune: planet(neptune.lon, neptune.retrograde),
      Pluto:   planet(plutoLon,   false),
    },
    ascendant: {
      sign:     ascSignDeg.sign,
      degree:   ascSignDeg.degree,
      mc_sign:  mcSignDeg.sign,
      mc_degree: mcSignDeg.degree,
    },
    houses,
  };
}
