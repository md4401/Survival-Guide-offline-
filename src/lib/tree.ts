import type { L } from './l10n';
export interface Opt { label: L; next?: string; result?: { text: L; guide?: string; urgent?: boolean } }
export interface Node { id: string; q: L; options: Opt[] }
export interface Tree { id: string; title: L; start: string; nodes: Node[] }
/** Follows chosen option indexes from the start; returns the path and, if finished, the result. */
export function walk(tree: Tree, choices: number[]) {
  const by = new Map(tree.nodes.map((n) => [n.id, n])); const path: Node[] = []; let cur = by.get(tree.start);
  for (const c of choices) {
    if (!cur) break; path.push(cur); const o = cur.options[c]; if (!o) break;
    if (o.result) return { path, result: o.result, current: null as Node | null };
    cur = o.next ? by.get(o.next) : undefined;
  }
  return { path, result: null, current: cur ?? null };
}
/** Structural validation: links resolve, every node is reachable, there are no cycles, and every leaf has text. */
export function validateTree(tree: Tree): string[] {
  const errs: string[] = []; const ids = new Set(tree.nodes.map((n) => n.id));
  if (!ids.has(tree.start)) errs.push('start missing');
  for (const n of tree.nodes) for (const o of n.options) { if (!o.next && !o.result) errs.push(`${n.id}: option without next/result`); if (o.next && !ids.has(o.next)) errs.push(`${n.id}: broken link ${o.next}`); if (o.result && !o.result.text.en) errs.push(`${n.id}: empty result`); }
  const seen = new Set<string>(), stack = new Set<string>(); const by = new Map(tree.nodes.map((n) => [n.id, n]));
  const dfs = (id: string) => { if (stack.has(id)) { errs.push(`cycle at ${id}`); return; } if (seen.has(id)) return; seen.add(id); stack.add(id); for (const o of by.get(id)?.options ?? []) if (o.next) dfs(o.next); stack.delete(id); };
  if (ids.has(tree.start)) dfs(tree.start);
  for (const id of ids) if (!seen.has(id)) errs.push(`unreachable ${id}`);
  return errs;
}
