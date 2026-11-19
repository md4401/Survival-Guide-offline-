import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT } from './lib/content';

// Sources (all build-time, npm): world-countries (ODbL), country-json (MIT, population), countries-and-timezones (MIT),
// emergency-numbers (MIT, derived from a Wikipedia list: community data, UNVERIFIED). Spec §5.1 numbers override and are marked "spec".
const require = createRequire(import.meta.url);
const raw: any[] = require('world-countries');
const pop: Array<{ country: string; population: number | null }> = require('country-json/src/country-by-population.json');
const tz = require('countries-and-timezones');
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
const popBy = new Map(pop.map((p) => [norm(p.country), p.population]));

const countries = raw.map((c) => {
  const key = [c.name.common, c.name.official, ...(c.altSpellings ?? [])].map(norm).find((n) => popBy.has(n));
  return {
    cca2: c.cca2, cca3: c.cca3, region: c.region, subregion: c.subregion,
    capital: c.capital?.[0] ?? null, area: c.area, languages: Object.keys(c.languages ?? {}),
    currencies: Object.keys(c.currencies ?? {}), borders: c.borders ?? [],
    callingCode: c.idd?.root ? c.idd.root + (c.idd.suffixes?.length === 1 ? c.idd.suffixes[0] : '') : '',
    latlng: c.latlng, name: c.name?.common, independent: !!c.independent, landlocked: !!c.landlocked,
    population: key !== undefined ? popBy.get(key) ?? null : null,
    timezones: (tz.getCountry(c.cca2)?.timezones ?? []) as string[],
  };
});
const dir = path.join(ROOT, 'src/generated');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'countries.json'), JSON.stringify(countries));

// Emergency numbers
const pkg = path.join(ROOT, 'node_modules/emergency-numbers/dist/metadata.js');
const community: Record<string, Record<string, number>> = require(pkg).emergencyNumbers ?? require(pkg).default ?? {};
type Entry = { numbers: Record<string, string>; source: 'spec' | 'community' };
const out: Record<string, Entry> = {};
for (const [code, v] of Object.entries(community)) {
  const nums: Record<string, string> = {};
  for (const [k, n] of Object.entries(v)) if (typeof n === 'number' && n >= 10) nums[k] = String(n); // 0 = leading zeros lost in source → dropped
  if (Object.keys(nums).length) out[code] = { numbers: nums, source: 'community' };
}
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/emergency-numbers.json'), 'utf8')).countries as Record<string, Record<string, string>>;
for (const [code, nums] of Object.entries(spec)) out[code] = { numbers: nums, source: 'spec' };
fs.writeFileSync(path.join(dir, 'emergency.json'), JSON.stringify(out));
console.log(`✓ ${countries.length} countries (${countries.filter((c) => c.population != null).length} with population), ${Object.keys(out).length} emergency entries`);
