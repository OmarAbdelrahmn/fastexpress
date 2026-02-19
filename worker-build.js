const { generateSW } = require('workbox-build');

const swDest = 'public/sw.js';

generateSW({
    swDest,
    globPatterns: [],
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