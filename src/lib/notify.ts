import { Capacitor } from '@capacitor/core';
import { t } from '../i18n';
import { notifyAt } from './inventory';
import type { InvItem, EventRow } from '../db/dexie';
import { upcoming } from './agenda';

/** Notification ids from this number up belong to the agenda; below it, to inventory expiry. */
export const AGENDA_BASE = 1_000_000;

/** Native (Android APK) local notifications for expiring items: 3 days before and on the day, 09:00. Does nothing on the web. */
export async function scheduleExpiry(items: InvItem[]): Promise<number> {
  if (!Capacitor.isNativePlatform()) return 0;
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  if ((await LocalNotifications.requestPermissions()).display !== 'granted') return 0;
  const pending = await LocalNotifications.getPending(); const old = pending.notifications.filter((n) => n.id < AGENDA_BASE); if (old.length) await LocalNotifications.cancel({ notifications: old });
  const list = items.flatMap((i) => [3, 0].map((b, k) => ({ i, b, k, at: notifyAt(i.expires, b) })).filter((x) => x.at && i.id != null)
    .map((x) => ({ id: (x.i.id as number) * 10 + x.k, title: t('inv.notify.title'), body: t('inv.notify.body', { name: x.i.name }), schedule: { at: x.at! } })));
  if (list.length) await LocalNotifications.schedule({ notifications: list });
  return list.length;
}

/** Native reminders for the next agenda events (at the event time). Does nothing on the web. */
export async function scheduleAgenda(events: EventRow[], now = Date.now()): Promise<number> {
  if (!Capacitor.isNativePlatform()) return 0;
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  if ((await LocalNotifications.requestPermissions()).display !== 'granted') return 0;
  const pending = await LocalNotifications.getPending(); const old = pending.notifications.filter((n) => n.id >= AGENDA_BASE); if (old.length) await LocalNotifications.cancel({ notifications: old });
  const list = upcoming(events, now, 40).filter((e) => e.id != null && e.next > now).map((e) => ({ id: AGENDA_BASE + (e.id as number), title: e.title, body: e.note || t('agenda.notify'), schedule: { at: new Date(e.next) } }));
  if (list.length) await LocalNotifications.schedule({ notifications: list });
  return list.length;
}
