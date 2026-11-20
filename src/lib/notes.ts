// Note text helpers. A checklist is plain text: lines that start with "[ ] " or "[x] ".
export const isTask = (line: string) => /^\[( |x)\] /.test(line);
export const toggleTask = (text: string, index: number): string => text.split('\n').map((l, i) => (i === index && isTask(l) ? (l.startsWith('[x] ') ? '[ ] ' : '[x] ') + l.slice(4) : l)).join('\n');
/** Makes the line at `index` a task (or removes the box if it already is one). */
export function toggleTaskLine(text: string, index: number): string { return text.split('\n').map((l, i) => (i !== index ? l : isTask(l) ? l.slice(4) : `[ ] ${l}`)).join('\n'); }
/** Index of the line that holds the cursor. */
export const lineAt = (text: string, pos: number) => text.slice(0, pos).split('\n').length - 1;
export const countChars = (text: string) => text.replace(/\s/g, '').length;
export const titleOf = (n: { title?: string; text: string }) => (n.title?.trim() || n.text.split('\n').find((l) => l.trim())?.replace(/^\[( |x)\] /, '').slice(0, 60) || '');
/** Undo/redo history of text states. */
export class History {
  private past: string[] = []; private future: string[] = [];
  constructor(private cur = '') {}
  push(v: string) { if (v === this.cur) return; this.past.push(this.cur); if (this.past.length > 200) this.past.shift(); this.cur = v; this.future = []; }
  undo(): string | null { const p = this.past.pop(); if (p == null) return null; this.future.push(this.cur); this.cur = p; return p; }
  redo(): string | null { const f = this.future.pop(); if (f == null) return null; this.past.push(this.cur); this.cur = f; return f; }
  get canUndo() { return this.past.length > 0; } get canRedo() { return this.future.length > 0; }
}
