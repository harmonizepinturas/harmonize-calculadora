// ============================================================
// SERVICE WORKER — Harmonize Calculadora PWA
// Estratégia: Cache-first para assets, Network-first para dados
// ============================================================

const CACHE_NAME   = 'harmonize-calc-v1';
const CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
];

// ── Instalação: pré-cache dos assets essenciais ───────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS)),
  );
  self.skipWaiting();
});

// ── Ativação: remove caches antigos ───────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

// ── Fetch: cache-first para a app, network-first para API ─────
self.addEventListener('fetch', (e) => {
  // Requisições ao Google Apps Script: tenta rede, fallback no cache
  if (e.request.url.includes('script.google.com')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request)),
    );
    return;
  }

  // Assets locais: cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request)),
  );
});
