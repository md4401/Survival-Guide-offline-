import { useEffect, useState } from 'preact/hooks';

const read = () => (location.hash.replace(/^#/, '') || '/');
export function usePath(): string[] {
  const [p, setP] = useState(read());
  useEffect(() => { const f = () => setP(read()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return p.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);
}
export const href = (...parts: string[]) => '#/' + parts.map(encodeURIComponent).join('/');
export const go = (...parts: string[]) => { location.hash = href(...parts); };
export const back = () => (history.length > 1 ? history.back() : go());
