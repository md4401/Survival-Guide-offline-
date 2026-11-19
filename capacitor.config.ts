import type { CapacitorConfig } from '@capacitor/cli';

// Only configured in the MVP: android/ios projects are generated later with `npx cap add`.
const config: CapacitorConfig = {
  appId: 'app.survival.offline',
  appName: 'Survival Guide',
  webDir: 'dist',
  server: { androidScheme: 'https' },
};
export default config;
