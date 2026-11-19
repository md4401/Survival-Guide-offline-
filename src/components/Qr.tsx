import { useEffect, useRef, useState } from 'preact/hooks';
import qrcode from 'qrcode-generator';
import { toFrames } from '../lib/mesh/bundle';
import { t } from '../i18n';

export function qrSvg(text: string): string {
  const q = qrcode(0, 'L'); q.addData(text); q.make();
  return q.createSvgTag({ cellSize: 3, margin: 2, scalable: true });
}
/** A QR for one text; long texts become frames shown one after another (the receiver collects them in any order). */
export function MultiQr({ text, size = 600 }: { text: string; size?: number }) {
  const frames = toFramesMemo(text, size);
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); if (frames.length < 2) return; const id = setInterval(() => setI((x) => (x + 1) % frames.length), 1400); return () => clearInterval(id); }, [text]);
  const f = frames[Math.min(i, frames.length - 1)];
  return (
    <div class="stack" style="text-align:center">
      <div style="background:#fff;padding:.5rem;border-radius:12px;max-inline-size:20rem;margin-inline:auto" dangerouslySetInnerHTML={{ __html: qrSvg(f) }} role="img" aria-label="QR" />
      {frames.length > 1 && <p class="muted" aria-live="off">{i + 1} / {frames.length}</p>}
    </div>
  );
}
const cache = new Map<string, string[]>();
function toFramesMemo(text: string, size: number) { const k = `${size}:${text}`; if (!cache.has(k)) { cache.clear(); cache.set(k, toFrames(text, size)); } return cache.get(k)!; }

/** Camera QR reader (jsQR). Calls onText with every distinct code it sees. */
export function QrScanner({ onText, onError }: { onText: (s: string) => void; onError?: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let stop = false; let stream: MediaStream | null = null; let last = '';
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const v = video.current!; v.srcObject = stream; await v.play();
        const jsQR = (await import('jsqr')).default;
        const c = document.createElement('canvas'); const ctx = c.getContext('2d', { willReadFrequently: true })!;
        const tick = () => {
          if (stop) return;
          if (v.videoWidth) {
            const k = Math.min(1, 640 / v.videoWidth); c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
            ctx.drawImage(v, 0, 0, c.width, c.height);
            const img = ctx.getImageData(0, 0, c.width, c.height); const r = jsQR(img.data, img.width, img.height);
            if (r?.data && r.data !== last) { last = r.data; onText(r.data); }
          }
          setTimeout(tick, 180);
        };
        tick();
      } catch { onError?.(); }
    })();
    return () => { stop = true; stream?.getTracks().forEach((x) => x.stop()); };
  }, []);
  return <video ref={video} muted playsInline aria-label={t('msg.bundle.scan')} style="inline-size:100%;max-block-size:18rem;border-radius:12px;background:#000" />;
}
