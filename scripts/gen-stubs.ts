// Generates DRAFT placeholder guides (no medical/safety facts). Safe to re-run: never overwrites existing files.
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT } from './lib/content';

type S = [id: string, kind: 'scenario' | 'guide' | 'kit', cat: string, vital: boolean, en: string, pt: string];
const STUBS: S[] = [
  ['scenario.blackout', 'scenario', 'scenarios', true, 'Blackout: first 72 hours', 'Apagão: primeiras 72 horas'],
  ['scenario.storm', 'scenario', 'scenarios', true, 'Storm and strong wind', 'Tempestade e ventania'],
  ['scenario.flood', 'scenario', 'scenarios', true, 'Flood: what to do', 'Enchente: o que fazer'],
  ['scenario.house-fire', 'scenario', 'scenarios', true, 'Fire at home', 'Incêndio doméstico'],
  ['scenario.heatwave', 'scenario', 'scenarios', true, 'Heat wave', 'Onda de calor'],
  ['scenario.coldwave', 'scenario', 'scenarios', true, 'Cold wave', 'Onda de frio'],
  ['scenario.earthquake', 'scenario', 'scenarios', true, 'Earthquake: what to do', 'Terremoto: o que fazer'],
  ['scenario.lost', 'scenario', 'scenarios', true, 'Lost in the wild: the STOP rule', 'Perdido na natureza: a regra STOP'],
  ['water.find', 'guide', 'water', true, 'Water: where to find it', 'Água: onde achar'],
  ['water.disinfect', 'guide', 'water', true, 'Water: boil, chlorine and SODIS', 'Água: ferver, cloro e SODIS'],
  ['water.store', 'guide', 'water', true, 'Storing water safely', 'Armazenar água com segurança'],
  ['firstaid.cpr', 'guide', 'firstaid', true, 'CPR in adults', 'RCP em adultos'],
  ['firstaid.choking', 'guide', 'firstaid', true, 'Choking', 'Engasgo'],
  ['firstaid.bleeding', 'guide', 'firstaid', true, 'Stopping severe bleeding', 'Parar um sangramento grave'],
  ['firstaid.burns', 'guide', 'firstaid', true, 'Burns', 'Queimaduras'],
  ['firstaid.fracture', 'guide', 'firstaid', true, 'Fractures and simple splints', 'Fraturas e talas simples'],
  ['firstaid.shock', 'guide', 'firstaid', true, 'Shock', 'Choque'],
  ['firstaid.hypothermia', 'guide', 'firstaid', true, 'Hypothermia and extreme cold', 'Hipotermia e frio extremo'],
  ['firstaid.heat', 'guide', 'firstaid', true, 'Heat stroke and extreme heat', 'Insolação e calor extremo'],
  ['firstaid.bites', 'guide', 'firstaid', true, 'Bites and stings', 'Picadas'],
  ['prepare.kit72', 'kit', 'prepare', false, '72-hour kit', 'Kit de 72 horas'],
  ['prepare.kit-car', 'kit', 'prepare', false, 'Car kit', 'Kit do carro'],
];

for (const lang of ['en', 'pt'] as const) {
  for (const [id, kind, cat, vital, en, pt] of STUBS) {
    const dir = path.join(CONTENT, lang, kind === 'scenario' ? 'scenarios' : kind === 'kit' ? 'kits' : 'guides', cat);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${id.split('.')[1]}.md`);
    if (fs.existsSync(file)) continue;
    fs.writeFileSync(file, `---
id: ${id}
kind: ${kind}
category: ${cat}
plan: free
vital: ${vital}
status: draft
needsReview: true
title: "${lang === 'en' ? en : pt}"
summary: ""
minutes: 0
now: []
materials: []
related: []
mistakes: []
review:
  date: 2026-11-19
  level: draft
  source: pending
tags: []
---
`);
  }
}
console.log('✓ stubs generated');
