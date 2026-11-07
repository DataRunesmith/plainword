import assert from "node:assert/strict";
import test from "node:test";

import { rateLimitIdentity } from "../src/worker.js";

test("rate-limit identity is deterministic and does not expose the raw IP", async () => {
  const first = await rateLimitIdentity("203.0.113.10", "test-secret");
  const second = await rateLimitIdentity("203.0.113.10", "test-secret");

  assert.equal(first, second);
  assert.match(first, /^hmac-sha256:[0-9a-f]{64}$/);
  assert.equal(first.includes("203.0.113.10"), false);
});

test("different IPs or keys produce different identities", async () => {
  const a = await rateLimitIdentity("203.0.113.10", "secret-a");
  const b = await rateLimitIdentity("203.0.113.11", "secret-a");
  const c = await rateLimitIdentity("203.0.113.10", "secret-b");

  assert.notEqual(a, b);
  assert.notEqual(a, c);
});

test("missing IP or secret returns no identity", async () => {
  assert.equal(await rateLimitIdentity(null, "secret"), null);
  assert.equal(await rateLimitIdentity("203.0.113.10", null), null);
});
