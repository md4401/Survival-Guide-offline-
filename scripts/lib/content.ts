import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Guide } from '../../src/content/types';

export const ROOT = path.resolve(import.meta.dirname, '../..');
export const CONTENT = path.join(ROOT, 'content');
export const LANGS = ['en', 'pt'] as const;

export function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });
}

export interface Loaded { file: string; raw: Record<string, any>; body: string }

export function loadRaw(lang: string): Loaded[] {
  return walk(path.join(CONTENT, lang)).map((file) => {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    return { file: path.relative(ROOT, file), raw: data, body: content };
  });
}

export function bullets(body: string): string[] {
  return body.split('\n').filter((l) => /^\s*[-*]\s+/.test(l)).map((l) => l.replace(/^\s*[-*]\s+/, '').trim());
}

export function toGuide(l: Loaded): Guide {
  const r = l.raw;
  const review = r.review ?? {};
  return {
    id: r.id, kind: r.kind ?? 'guide', category: r.category, plan: r.plan ?? 'free',
    vital: !!r.vital, status: r.status ?? 'published', needsReview: !!r.needsReview,
    title: r.title, summary: r.summary ?? '', minutes: r.minutes ?? 0, difficulty: r.difficulty,
    warning: r.warning, now: r.now ?? [], materials: r.materials ?? [], related: r.related ?? [],
    mistakes: r.mistakes ?? [], understand: bullets(l.body),
    review: { date: String(review.date ?? ''), level: review.level ?? 'draft', source: String(review.source ?? '') },
    tags: r.tags ?? [],
  };
}
