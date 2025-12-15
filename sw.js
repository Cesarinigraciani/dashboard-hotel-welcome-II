const CACHE_NAME = "dashboard-cache-v7"; // sube versión
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./dashboard_misterios.html",
  "./dashboard_welcome.html",
  "./dashboard_dinamico.html",
  "./scripts/main_misterios.js",
  "./scripts/main-v2.js",
  "./styles/style-v2.css",
  "./styles/styles-residencias-misterios.css",
  "./assets/img/logo-empresa.png",
  "./assets/img/icono_dashboard.png"
];


// 📥 Instalación: cachea archivos básicos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// ♻️ Activación: limpia cachés antiguas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// 🌐 Fetch: intenta red primero, si falla usa caché
self.addEventListener("fetch", event => {
  if (!event.request.url.startsWith("http")) {
    return; // ignora chrome-extension:// y otros esquemas
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});



