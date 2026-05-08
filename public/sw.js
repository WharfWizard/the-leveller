const CACHE_NAME = 'leveller-v2'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    return
  }
  // Network first — always try to get fresh content, fall back to cache
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok && event.request.method === 'GET') {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
      }
      return response
    }).catch(() =>
      caches.match(event.request).then((cached) => cached || caches.match('/index.html'))
    )
  )
})
