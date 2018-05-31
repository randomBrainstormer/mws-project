const staticCacheName = 'mws-static-v2';
const allCaches = [
  staticCacheName,
];

const cache_urls = [
  'dist/img/1.jpg',
  'dist/img/1-400px.jpg',
  'dist/img/1.webp',
  'dist/img/1-400px.webp',
  'dist/img/2.jpg',
  'dist/img/2-400px.jpg',
  'dist/img/2.webp',
  'dist/img/2-400px.webp',
  'dist/img/3.jpg',
  'dist/img/3-400px.jpg',
  'dist/img/3.webp',
  'dist/img/3-400px.webp',
  'dist/img/4.jpg',
  'dist/img/4-400px.jpg',
  'dist/img/4.webp',
  'dist/img/4-400px.webp',
  'dist/img/5.jpg',
  'dist/img/5-400px.jpg',
  'dist/img/5.webp',
  'dist/img/5-400px.webp',
  'dist/img/6.jpg',
  'dist/img/6-400px.jpg',
  'dist/img/6.webp',
  'dist/img/6-400px.webp',
  'dist/img/7.jpg',
  'dist/img/7-400px.jpg',
  'dist/img/7.webp',
  'dist/img/7-400px.webp',
  'dist/img/8.jpg',
  'dist/img/8-400px.jpg',
  'dist/img/8.webp',
  'dist/img/8-400px.webp',
  'dist/img/9.jpg',
  'dist/img/9-400px.jpg',
  'dist/img/9.webp',
  'dist/img/9-400px.webp',
  'dist/img/10.jpg',
  'dist/img/10-400px.jpg',
  'dist/img/10.webp',
  'dist/img/10-400px.webp',
  'dist/img/placeholder.jpg',
  'dist/img/placeholder-400px.jpg',
  'dist/img/placeholder.webp',
  'dist/img/placeholder-400px.webp',
  'dist/js/dbhelper.js',
  'dist/js/main.js',
  'dist/js/restaurant_info.js',
  'dist/js/sw_check.js',
  'index.html',
  'restaurant.html',
  'service_worker.js',
  'manifest.json',
  '/.',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName)
      .then(function(cache) {
        return cache.addAll(cache_urls, {mode: 'no-cors'});
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('mws-') &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/restaurant.html') {
      event.respondWith(caches.match('restaurant.html'));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});