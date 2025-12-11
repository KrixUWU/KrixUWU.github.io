const CACHE_NAME = 'mobywatel-cache-v1';
const OFFLINE_URL = 'index.html';

// Pliki do buforowania offline
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/mObywatel_2.0_files/all.min.css',
  '/mObywatel_2.0_files/coi_common_ic_mobywatel_horizontal_logo_text.svg',
  '/mObywatel_2.0_files/aa008_change_password_blue.svg',
  '/mObywatel_2.0_files/coi_common_ui_ic_coi_mobywatel_logo.svg',
  '/mObywatel_2.0_files/coi_common_ui_ic_mc_mobywatel_logo.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalacja SW i buforowanie plików
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Aktywacja SW i czyszczenie starych cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Obsługa fetch – zwracanie plików z cache lub sieci
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
});

// Obsługa przycisku instalacji PWA
let deferredPrompt;
self.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
});

self.addEventListener('message', (event) => {
  if (event.data === 'prompt-install' && deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
  }
});
