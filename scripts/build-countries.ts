import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT } from './lib/content';

// Source: npm "world-countries" (ODbL). Attribution in DECISIONS.md / README.
const require = createRequire(import.meta.url);
const raw: any[] = require('world-countries');
const countries = raw.map((c) => ({
  cca2: c.cca2, cca3: c.cca3, region: c.region, subregion: c.subregion,
  capital: c.capital?.[0] ?? null, area: c.area, languages: Object.keys(c.languages ?? {}),
  currencies: Object.keys(c.currencies ?? {}), borders: c.borders ?? [],
  callingCode: c.idd?.root ? c.idd.root + (c.idd.suffixes?.length === 1 ? c.idd.suffixes[0] : '') : '',
  latlng: c.latlng, name: c.name?.common, independent: !!c.independent,
  landlocked: !!c.landlocked,
}));
const dir = path.join(ROOT, 'src/generated');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'countries.json'), JSON.stringify(countries));
console.log(`✓ ${countries.length} countries/territories`);
