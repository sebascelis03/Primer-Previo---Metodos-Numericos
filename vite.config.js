import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Base relativa: permite abrir el build desde cualquier ruta local
// (servidor estático, carpeta compartida o subdirectorio) sin reconfigurar.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Métodos Iterativos 3x3 — Jacobi & Gauss-Seidel',
        short_name: 'Iterativos 3x3',
        description:
          'Resuelve sistemas de ecuaciones lineales 3x3 con los métodos de Jacobi y Gauss-Seidel. Funciona 100% sin conexión.',
        lang: 'es-CO',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Todo el shell de la aplicación se precachea: la app nunca hace
        // peticiones de red en tiempo de ejecución.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
