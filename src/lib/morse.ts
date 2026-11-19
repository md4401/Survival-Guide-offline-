const TABLE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
};
export const MORSE_TABLE = TABLE;

/** Text → morse. Letters separated by space, words by " / ". Unknown characters are skipped. */
export function toMorse(text: string): string {
  return text.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(Boolean)
    .map((w) => [...w].map((c) => TABLE[c]).filter(Boolean).join(' ')).filter(Boolean).join(' / ');
}

/** Standard timing: dot=1 unit, dash=3, intra-letter gap=1, letter gap=3, word gap=7. Returns [on, durationUnits][]. */
export function morseTimeline(morse: string): Array<[boolean, number]> {
  const out: Array<[boolean, number]> = [];
  const push = (on: boolean, n: number) => {
    const last = out[out.length - 1];
    if (last && last[0] === on) last[1] += n; else out.push([on, n]);
  };
  const words = morse.split(' / ');
  words.forEach((w, wi) => {
    if (wi > 0) push(false, 7);
    w.split(' ').forEach((letter, li) => {
      if (li > 0) push(false, 3);
      [...letter].forEach((s, si) => { if (si > 0) push(false, 1); push(true, s === '.' ? 1 : 3); });
    });
  });
  return out;
}
export const SOS = '... --- ...';
