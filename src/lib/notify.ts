import { Capacitor } from '@capacitor/core';
import { t } from '../i18n';
import { notifyAt } from './inventory';
import type { InvItem } from '../db/dexie';

/** Native (Android APK) local notifications for expiring items: 3 days before and on the day, 09:00. Does nothing on the web. */
export async function scheduleExpiry(items: InvItem[]): Promise<number> {
  if (!Capacitor.isNativePlatform()) return 0;
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  if ((await LocalNotifications.requestPermissions()).display !== 'granted') return 0;
  const pending = await LocalNotifications.getPending(); if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications });
  const list = items.flatMap((i) => [3, 0].map((b, k) => ({ i, b, k, at: notifyAt(i.expires, b) })).filter((x) => x.at && i.id != null)
    .map((x) => ({ id: (x.i.id as number) * 10 + x.k, title: t('inv.notify.title'), body: t('inv.notify.body', { name: x.i.name }), schedule: { at: x.at! } })));
  if (list.length) await LocalNotifications.schedule({ notifications: list });
  return list.length;
}
