import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  define: { __BUILD_ID__: JSON.stringify(process.env.BUILD_ID || 'dev') },
  plugins: [
    preact(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json,png,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [{
          urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/@huggingface\/transformers@/,
          handler: 'CacheFirst',
          options: { cacheName: 'ai-runtime', cacheableResponse: { statuses: [0, 200] }, expiration: { maxEntries: 30 } },
        }, {
          urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/onnxruntime-web/,
          handler: 'CacheFirst',
          options: { cacheName: 'ai-runtime', cacheableResponse: { statuses: [0, 200] }, expiration: { maxEntries: 30 } },
        }],
      },
      manifest: {
        name: 'Survival Guide',
        short_name: 'Survival',
        start_url: './',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
