// Sehati CRM Service Worker — offline shell + runtime cache
// Strategy: cache-first untuk assets, network-first untuk API + HTML.

const CACHE_NAME    = "sehati-v1"
const RUNTIME_CACHE = "sehati-runtime-v1"

const PRECACHE_URLS = [
  "/",
  "/home",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {})),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME && n !== RUNTIME_CACHE).map((n) => caches.delete(n)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  const url = new URL(req.url)

  // Skip cross-origin and supabase realtime
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/_next/data/")) return  // Next.js data prefetch

  // API: network-first, fall back to cache hanya untuk GET reads tertentu
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok && (url.pathname === "/api/whoami" || url.pathname.startsWith("/api/booking"))) {
          const copy = res.clone()
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy))
        }
        return res
      }).catch(() => caches.match(req)),
    )
    return
  }

  // Static assets: cache-first
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy))
        }
        return res
      })),
    )
    return
  }

  // HTML pages: network-first dengan fallback ke shell
  event.respondWith(
    fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone()
        caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy))
      }
      return res
    }).catch(() => caches.match(req).then((cached) => cached || caches.match("/"))),
  )
})

// Web Push handler
self.addEventListener("push", (event) => {
  if (!event.data) return
  let payload = { title: "Sehati CRM", body: "Pesan baru", url: "/" }
  try { payload = { ...payload, ...event.data.json() } } catch {}
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.svg",
      badge: "/icons/icon-192.svg",
      data: { url: payload.url },
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if (c.url.includes(url)) return c.focus()
      }
      return self.clients.openWindow(url)
    }),
  )
})
