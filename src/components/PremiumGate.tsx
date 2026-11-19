import { useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { t } from '../i18n';
import { href } from '../router';
import { useSettings } from '../db/settings';
import { licenseService, type License } from '../interfaces/license';
import { premiumUnlocked } from '../lib/access';

export function usePremium(): boolean {
  const s = useSettings(); const [lic, setLic] = useState<License | null>(null);
  useEffect(() => { licenseService.current().then(setLic).catch(() => {}); }, []);
  return premiumUnlocked(s, lic);
}
/** Wraps a Premium feature. For everyone else it only says it is not available yet: no purchase, no nag. Never wrap vital features. */
export function PremiumGate({ children }: { children: ComponentChildren }) {
  const ok = usePremium();
  if (ok) return <>{children}</>;
  return (
    <main class="stack"><h1>{t('plans.premium')}</h1><p class="danger-box">{t('gate.soon')}</p>
      <a class="btn" href={href('plans')}>{t('plans.title')}</a></main>
  );
}
