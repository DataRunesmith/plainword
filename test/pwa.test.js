import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (name) => readFile(new URL("../public/" + name, import.meta.url), "utf8");

test("public pages expose an installable web app manifest", async () => {
  const [index, why, raw] = await Promise.all([
    read("index.html"),
    read("varfor.html"),
    read("site.webmanifest"),
  ]);
  const manifest = JSON.parse(raw);

  assert.equal(manifest.id, "/");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.deepEqual(
    manifest.icons.map((icon) => icon.sizes),
    ["192x192", "512x512"],
  );
  for (const html of [index, why]) {
    assert.match(html, /<link rel="manifest" href="\/site\.webmanifest"\s*\/?>/);
    assert.match(html, /<link rel="apple-touch-icon"[^>]+app-icon-192\.png/);
    assert.match(html, /<script src="\/pwa\.js" defer><\/script>/);
  }
});

test("PWA registration is secure-context only and the service worker is network-only", async () => {
  const [pwa, worker] = await Promise.all([read("pwa.js"), read("service-worker.js")]);

  assert.match(pwa, /window\.isSecureContext/);
  assert.match(pwa, /serviceWorker\.register\("\/service-worker\.js"/);
  assert.match(worker, /self\.addEventListener\("fetch"/);
  assert.doesNotMatch(worker, /caches\./);
  assert.doesNotMatch(worker, /\/api\//);
  assert.doesNotMatch(worker, /\/admin/);
});
