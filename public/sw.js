// Xizmat ishchisi (service worker) — offline uchun app-shell keshlash
const CACHE = "rfm-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/boshqaruv", "/kundalik", "/icon.svg"]).catch(() => {})));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Faqat GET so'rovlarni boshqaramiz; POST (yozuv) app tomonidan navbatga qo'yiladi
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Tarmoq-birinchi, offline bo'lsa keshdan
  event.respondWith(
    fetch(req)
      .then((res) => {
        const kopiya = res.clone();
        caches.open(CACHE).then((c) => c.put(req, kopiya).catch(() => {}));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("/boshqaruv")))
  );
});
