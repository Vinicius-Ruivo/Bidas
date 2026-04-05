const STATIC_CACHE = "bidas-static-v2";
const RUNTIME_CACHE = "bidas-runtime-v2";
const APP_SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.svg", "/icons/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

function isHtmlNavigationRequest(request) {
  if (request.mode === "navigate") return true;
  const accept = request.headers.get("accept");
  return accept != null && accept.includes("text/html");
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  if (isHtmlNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          void caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((c) => c ?? caches.match("/"))),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          void caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(async () => {
          return caches.match("/");
        });
    }),
  );
});
