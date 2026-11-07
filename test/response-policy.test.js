import test from "node:test";
import assert from "node:assert/strict";
import { applyResponsePolicy } from "../src/response-policy.js";

const REQUIRED_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
];

test("applyResponsePolicy adds all common security headers", async () => {
  const response = applyResponsePolicy(
    new Response("ok", {
      status: 201,
      headers: { "x-existing": "kept" },
    }),
  );

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("x-existing"), "kept");
  for (const name of REQUIRED_HEADERS) assert.ok(response.headers.get(name), `${name} is missing`);
  assert.equal(await response.text(), "ok");
});

test("applyResponsePolicy adds X-Robots-Tag when requested", () => {
  const response = applyResponsePolicy(new Response(null), {
    robots: "noindex, nofollow",
  });

  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
});

test("applyResponsePolicy overrides cache headers when noStore is requested", () => {
  const response = applyResponsePolicy(
    new Response(null, {
      headers: { "cache-control": "public, max-age=3600" },
    }),
    { noStore: true },
  );

  assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
  assert.equal(response.headers.get("pragma"), "no-cache");
});

test("applyResponsePolicy preserves cache policy for public responses", () => {
  const response = applyResponsePolicy(
    new Response(null, {
      headers: { "cache-control": "public, max-age=60" },
    }),
  );

  assert.equal(response.headers.get("cache-control"), "public, max-age=60");
  assert.equal(response.headers.get("pragma"), null);
});

test("applyResponsePolicy puts a given nonce in the CSP", () => {
  const response = applyResponsePolicy(new Response(null), { nonce: "abc123" });
  assert.match(response.headers.get("content-security-policy"), /'nonce-abc123'/);
});
