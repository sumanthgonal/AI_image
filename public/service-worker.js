
const CACHE = 'ai-studio-mock-v1'
const ASSETS = ['/', '/index.html']
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)))
})
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request).catch(() => caches.match('/index.html'))),
  )
})
