// Köppen-Geiger classes for every country and up to 5 cities per country (build time).
// Climate: koppen-climate-lookup (ISC) → Kottek et al. 2006 / Rubel et al. 2017, 1986–2010, 0.5° grid. Cities: all-the-cities (ISC) ← GeoNames (CC BY 4.0).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT } from './lib/content';

const require = createRequire(import.meta.url);
const K = require('koppen-climate-lookup'); const lookup = (K.default ?? K).getInstance();
const wc: any[] = require('world-countries');
const cities: any[] = require('all-the-cities');

const cls = (lat: number, lon: number): string | null => {
  for (const r of [60, 150, 400, 900]) { const x = lookup.findNearest(lat, lon, r); if (x) return x.koppenClass; }
  return null;
};
const byCountry = new Map<string, any[]>();
for (const c of cities) { if (!byCountry.has(c.country)) byCountry.set(c.country, []); byCountry.get(c.country)!.push(c); }

const countries: Record<string, { c: string | null; classes: string[] }> = {};
const outCities: Array<[string, string, number, number, number, string, number]> = []; // name, cc, lat, lon, population, class, capital(0/1)
for (const c of wc) {
  const list = (byCountry.get(c.cca2) ?? []).sort((a, b) => b.population - a.population);
  const capital = list.find((x) => x.featureCode === 'PPLC') ?? list.find((x) => c.capital?.[0] && x.name === c.capital[0]);
  const pick = [...(capital ? [capital] : []), ...list.filter((x) => x !== capital).slice(0, capital ? 4 : 5)];
  const classes = new Set<string>();
  for (const x of pick) {
    const [lon, lat] = x.loc.coordinates; const k = cls(lat, lon); if (!k) continue;
    classes.add(k); outCities.push([x.name, c.cca2, +lat.toFixed(3), +lon.toFixed(3), x.population, k, x === capital ? 1 : 0]);
  }
  const center = c.latlng?.length === 2 ? cls(c.latlng[0], c.latlng[1]) : null;
  if (center) classes.add(center);
  countries[c.cca2] = { c: center, classes: [...classes].sort() };
}
const dir = path.join(ROOT, 'src/generated'); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'climate.json'), JSON.stringify({ countries, cities: outCities }));
const withCls = Object.values(countries).filter((x) => x.classes.length).length;
console.log(`✓ Köppen: ${withCls}/${wc.length} countries with a class, ${outCities.length} cities`);
