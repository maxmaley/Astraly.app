// Minimal type declarations for the `astronomia` package (no @types available)
declare module "astronomia/julian" {
  export function CalendarGregorianToJD(y: number, m: number, d: number): number;
  export function DateToJD(d: Date): number;
}
declare module "astronomia/base" {
  export function J2000Century(jde: number): number;
  export function pmod(x: number, y: number): number;
  export const J2000: number;
  export function JDEToJulianYear(jde: number): number;
  interface BaseModule {
    J2000Century(jde: number): number;
    pmod(x: number, y: number): number;
    J2000: number;
    JDEToJulianYear(jde: number): number;
    sincos(x: number): [number, number];
    horner(x: number, ...c: number[]): number;
  }
  const _default: BaseModule;
  export default _default;
}
declare module "astronomia/solar" {
  interface Coord { lon: number; lat: number; range: number }
  export function apparentVSOP87(earth: object, jde: number): Coord;
  export function trueVSOP87(earth: object, jde: number): Coord;
}
declare module "astronomia/moonposition" {
  interface Coord { lon: number; lat: number; range: number }
  export function position(jde: number): Coord;
}
declare module "astronomia/planetposition" {
  export class Planet {
    constructor(data: object);
    position(jde: number): { lon: number; lat: number; range: number };
    position2000(jde: number): { lon: number; lat: number; range: number };
  }
}
declare module "astronomia/sidereal" {
  export function apparent(jd: number): number;
}
declare module "astronomia/nutation" {
  export function nutation(jde: number): [number, number];
  export function meanObliquity(jde: number): number;
}
declare module "astronomia/pluto" {
  export function heliocentric(jde: number): { lon: number; lat: number; range: number };
}
declare module "astronomia/precess" {
  interface EclipticCoord { lon: number; lat: number }
  export function eclipticPosition(eclFrom: EclipticCoord, epochFrom: number, epochTo: number): EclipticCoord;
}
declare module "astronomia/data/vsop87Bearth" { const data: object; export default data; }
declare module "astronomia/data/vsop87Bmercury" { const data: object; export default data; }
declare module "astronomia/data/vsop87Bvenus" { const data: object; export default data; }
declare module "astronomia/data/vsop87Bmars" { const data: object; export default data; }
declare module "astronomia/data/vsop87Bjupiter" { const data: object; export default data; }
declare module "astronomia/data/vsop87Bsaturn" { const data: object; export default data; }
declare module "astronomia/data/vsop87Buranus" { const data: object; export default data; }
declare module "astronomia/data/vsop87Bneptune" { const data: object; export default data; }
