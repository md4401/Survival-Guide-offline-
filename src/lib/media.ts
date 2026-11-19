import { t } from '../i18n';
/** Human message for a failed getUserMedia call: tells permission problems apart from a missing device or a busy one. */
export function mediaMessage(e: unknown, kind: 'mic' | 'cam'): string {
  const name = (e as { name?: string })?.name ?? '';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return t('media.nodevice');
  if (name === 'NotReadableError' || name === 'AbortError') return t('media.busy');
  return `${t(kind === 'mic' ? 'media.mic.denied' : 'media.cam.denied')} ${t('media.settings')}`;
}
