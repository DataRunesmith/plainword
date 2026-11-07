self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Deliberately network-only. Plainword's canonical term/review state lives in D1.
// Do not add caches here without a separate data-classification review.
self.addEventListener("fetch", () => {});
