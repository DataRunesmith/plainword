import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import worker, { rateLimitIdentity } from "../src/worker.js";

function database() {
  const sqlite = new DatabaseSync(":memory:");
  for (const migration of [
    "0001_create_submissions.sql",
    "0002_add_submitter_ip.sql",
    "0003_add_foreslaget_rattsomrade.sql",
  ]) {
    sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
  }
  const session = {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return {
        bind(...values) {
          return {
            async first() {
              const row = statement.get(...values);
              await new Promise((resolve) => setImmediate(resolve));
              return row;
            },
            async run() {
              const { changes } = statement.run(...values);
              await new Promise((resolve) => setImmediate(resolve));
              return { meta: { changes } };
            },
          };
        },
      };
    },
  };
  return {
    sqlite,
    binding: {
      withSession(constraint) {
        assert.equal(constraint, "first-primary");
        return session;
      },
    },
  };
}

function request(ip = "203.0.113.10", body = {}) {
  const headers = { "content-type": "application/json" };
  if (ip) headers["CF-Connecting-IP"] = ip;
  return new Request("https://example.com/api/submit", {
    method: "POST",
    headers,
    body: JSON.stringify({
      term: "Example",
      foreslagen_juridisk_definition: "Legal meaning",
      foreslagen_vardagsbetydelse: "Everyday meaning",
      turnstileToken: "valid-token",
      ...body,
    }),
  });
}

test("submission quota is enforced atomically and preserves existing controls", async (t) => {
  const { sqlite, binding } = database();
  t.after(() => sqlite.close());
  const env = {
    DB: binding,
    RATE_LIMIT_KEY: "test-key",
    TURNSTILE_SECRET: "test-secret",
    TURNSTILE_HOSTNAMES: "example.com",
  };
  const originalFetch = globalThis.fetch;
  t.after(() => (globalThis.fetch = originalFetch));
  globalThis.fetch = async () =>
    Response.json({ success: true, action: "term_submit", hostname: "example.com" });

  const identity = await rateLimitIdentity("203.0.113.10", env.RATE_LIMIT_KEY);
  const seed = sqlite.prepare(
    "INSERT INTO submissions (term, status, created_at, submitter_ip) VALUES (?, ?, ?, ?)",
  );
  for (let i = 0; i < 4; i++) seed.run("Existing", "rejected", new Date().toISOString(), identity);
  seed.run("Expired", "pending", new Date(Date.now() - 3_600_001).toISOString(), identity);

  const responses = await Promise.all(
    Array.from({ length: 8 }, () => worker.fetch(request(), env)),
  );
  assert.equal(responses.filter((response) => response.status === 201).length, 1);
  assert.equal(responses.filter((response) => response.status === 429).length, 7);
  const inserted = sqlite.prepare("SELECT * FROM submissions WHERE term = 'Example'").all();
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].submitter_ip, identity);
  assert.equal(inserted[0].status, "pending");

  assert.equal((await worker.fetch(request("203.0.113.11"), env)).status, 201);
  for (let i = 0; i < 6; i++) assert.equal((await worker.fetch(request(null), env)).status, 503);
  assert.equal((await worker.fetch(request("203.0.113.12", { term: "x".repeat(128 * 1024 + 1) }), env)).status, 413);
  assert.equal((await worker.fetch(request(), { ...env, RATE_LIMIT_KEY: "" })).status, 503);
  assert.equal((await worker.fetch(request("203.0.113.12", { term: "" }), env)).status, 400);

  for (const result of [
    { success: false, action: "term_submit", hostname: "example.com" },
    { success: true, action: "other", hostname: "example.com" },
    { success: true, action: "term_submit", hostname: "other.example.com" },
  ]) {
    globalThis.fetch = async () => Response.json(result);
    assert.equal((await worker.fetch(request("203.0.113.12"), env)).status, 403);
  }
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM submissions").get().n, 7);
});
