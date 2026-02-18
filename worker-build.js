const { generateSW } = require('workbox-build');

const swDest = 'public/sw.js';

generateSW({
    swDest,
    globDirectory: '.next/server/app', // Target server build output? Or .next/static?
    // We want to cache the build artifacts. Next.js App Router structure is complex.
    // A simple strategy is to cache static assets in public + .next/static
    globPatterns: [
        '**/*.{js,css,html,png,jpg,jpeg,svg,json,ico,webmanifest}'
    ],
    // Adjust globDirectory to project root but be careful about what we include
    globDirectory: '.',
    globPatterns: [
        'public/**/*.{png,jpg,jpeg,svg,json,ico,webmanifest}',
        '.next/static/**/*.{js,css}'
    ],
    globIgnores: [
        '**/node_modules/**/*',
        'sw.js',
        'workbox-*.js'
    ],
    // Modify URL prefix to match Next.js serving path
    modifyURLPrefix: {
        'public/': '/',
        '.next/': '/_next/'
    },
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
runtimeCaching: [
  {
    urlPattern: /^\/_next\/static\//,
    handler: 'CacheFirst',
    options: {
      cacheName: 'next-static',
      expiration: {
        maxEntries: 100,
      },
    },
  },
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|ico|webp)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: {
        maxEntries: 100,
      },
    },
  },
],
}).then(({ count, size }) => {
    console.log(`Generated ${swDest}, which will precache ${count} files, totaling ${size} bytes.`);
}).catch(console.error);
