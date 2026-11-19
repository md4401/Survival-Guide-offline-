/** ICAO/NATO spelling alphabet (radiotelephony): letters and digits. */
export const PHONETIC: Record<string, string> = {
  A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike',
  N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
  0: 'Zero', 1: 'One', 2: 'Two', 3: 'Tree', 4: 'Fower', 5: 'Fife', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Niner',
};
/** "ab 7" → ["Alfa","Bravo","/","Seven"] (accents stripped, unknown characters skipped, "/" between words). */
export function spell(text: string): string[] {
  const out: string[] = [];
  text.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(Boolean).forEach((w, i) => {
    const letters = [...w].map((c) => PHONETIC[c]).filter(Boolean);
    if (!letters.length) return;
    if (i > 0 && out.length) out.push('/');
    out.push(...letters);
  });
  return out;
}
