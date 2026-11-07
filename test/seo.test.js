import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { seoForPath } from "../src/index.js";

test("public content routes are indexable with canonical URLs", () => {
  assert.deepEqual(seoForPath("/"), {
    robots: "index, follow, max-image-preview:large",
    canonical: "https://__PUBLIC_HOST__/",
    description: null,
  });
  assert.deepEqual(seoForPath("/varfor"), {
    robots: "index, follow, max-image-preview:large",
    canonical: "https://__PUBLIC_HOST__/varfor",
    description:
      "Läs om Plainwords metod, syfte och kvalitetskrav för jämförelser mellan allmänspråk och offentlig användning.",
  });
});

test("admin and API routes are noindex while crawler assets stay neutral", () => {
  assert.equal(seoForPath("/admin").robots, "noindex, nofollow");
  assert.equal(seoForPath("/api/terms").robots, "noindex, nofollow");
  assert.equal(seoForPath("/robots.txt"), null);
  assert.equal(seoForPath("/sitemap.xml"), null);
});

test("robots and sitemap advertise only public content", async () => {
  const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/__PUBLIC_HOST__\/sitemap\.xml/);
  assert.match(sitemap, /https:\/\/__PUBLIC_HOST__\/<\/loc>/);
  assert.match(sitemap, /https:\/\/__PUBLIC_HOST__\/varfor<\/loc>/);
  assert.doesNotMatch(sitemap, /admin|api\//);
});

test("the documentation site under /docs is indexable", () => {
  assert.equal(seoForPath("/docs/").robots, "index, follow, max-image-preview:large");
  assert.equal(seoForPath("/docs/architecture/").canonical, null);
  assert.equal(seoForPath("/docsx").robots, "noindex, nofollow");
});
