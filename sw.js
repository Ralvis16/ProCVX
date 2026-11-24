// ProCVX - Service worker: lets the app work offline.
// Only the app's own static files are cached; the user's CV data lives in localStorage, never here.
const CACHE_NAME = 'procvx-v4';

const APP_SHELL = [
    './',
    './style.css',
    './config.js',
    './storage.js',
    './utils.js',
    './ui.js',
    './i18n.js',
    './sample-data.js',
    './forms.js',
    './render.js',
    './sections.js',
    './script.js',
    './favicon.svg',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './vendor/icons.js',
    './vendor/Sortable.min.js',
    './fonts/fonts.css',
    './fonts/files/jetbrains-mono-latin-400-normal.woff2',
    './fonts/files/jetbrains-mono-latin-500-normal.woff2',
    './fonts/files/jetbrains-mono-latin-ext-400-normal.woff2',
    './fonts/files/jetbrains-mono-latin-ext-500-normal.woff2',
    './fonts/files/outfit-latin-300-normal.woff2',
    './fonts/files/outfit-latin-400-normal.woff2',
    './fonts/files/outfit-latin-500-normal.woff2',
    './fonts/files/outfit-latin-600-normal.woff2',
    './fonts/files/outfit-latin-700-normal.woff2',
    './fonts/files/outfit-latin-ext-300-normal.woff2',
    './fonts/files/outfit-latin-ext-400-normal.woff2',
    './fonts/files/outfit-latin-ext-500-normal.woff2',
    './fonts/files/outfit-latin-ext-600-normal.woff2',
    './fonts/files/outfit-latin-ext-700-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-300-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-400-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-500-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-600-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-700-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-800-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-ext-300-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-ext-400-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-ext-500-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-ext-600-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-ext-700-normal.woff2',
    './fonts/files/plus-jakarta-sans-latin-ext-800-normal.woff2',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

// Network first (always the latest version when online), cache as fallback when offline.
// Hosts like Cloudflare Pages redirect /index.html to /, so the page is cached as './' only.
// ignoreSearch lets "style.css?v=18" be served from the cached "style.css".
self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok && response.type === 'basic') {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                }
                return response;
            })
            .catch(async () => {
                const cached = await caches.match(request, { ignoreSearch: true });
                if (cached) return cached;
                if (request.mode === 'navigate') return caches.match('./');
                return Response.error();
            })
    );
});
