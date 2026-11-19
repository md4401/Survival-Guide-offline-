/** Content pack updates (spec §6.4): background, low priority, never in Crisis Mode, keep old version on failure. NOT implemented in the MVP. */
export interface PackInfo { id: string; lang: string; version: string; bytes: number; sha256: string; installed: boolean }
export interface PackUpdater {
  list(): Promise<PackInfo[]>;
  install(id: string): Promise<boolean>;
  remove(id: string): Promise<void>;
  checkForUpdates(): Promise<PackInfo[]>;
}
export const packUpdater: PackUpdater = { list: async () => [], install: async () => false, remove: async () => {}, checkForUpdates: async () => [] };
