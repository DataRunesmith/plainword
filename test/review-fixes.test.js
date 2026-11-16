import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import worker, { ipv6Prefix } from "../src/worker.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function migrated() {
  const sqlite = new DatabaseSync(":memory:");
  const files = readdirSync(new URL("migrations/", root)).filter((f) => f.endsWith(".sql")).sort();
  return { sqlite, files };
}

function d1(sqlite) {
  const session = {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      const bound = (values) => ({
        async first() {
          return statement.get(...values);
        },
        async all() {
          return { results: statement.all(...values) };
        },
        async run() {
          return { meta: { changes: statement.run(...values).changes } };
        },
        statement,
        values,
      });
      return { bind: (...values) => bound(values), ...bound([]) };
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const out = statements.map((s) => ({ meta: { changes: s.statement.run(...s.values).changes } }));
        sqlite.exec("COMMIT");
        return out;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
  return { withSession: () => session };
}

test("HTML pages contain no literal backslash-n text between tags", () => {
  for (const page of ["public/index.html", "public/varfor.html", "public/admin.html"]) {
    assert.doesNotMatch(read(page), /^\s*\\n\s*$/m, `${page} has a stray \\n line`);
  }
});

test("client search covers displayed fields only and Turnstile resets after every submit", () => {
  const app = read("public/app.js");
  assert.doesNotMatch(app, /JSON\.stringify\(t\)/);
  assert.match(app, /finally\s*\{[^}]*turnstile\.reset\(\)/s);
});

test("invalid submissions are rejected before Turnstile is consulted", async (t) => {
  const original = globalThis.fetch;
  t.after(() => (globalThis.fetch = original));
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ success: true });
  };
  const response = await worker.fetch(
    new Request("https://example.com/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ turnstileToken: "x" }),
    }),
    { TURNSTILE_SECRET: "s", DB: { withSession: () => ({}) } },
  );
  assert.equal(response.status, 400);
  assert.equal(calls, 0);
});

test("a submission already reviewed cannot be approved or rejected again", async (t) => {
  const { sqlite, files } = migrated();
  t.after(() => sqlite.close());
  for (const f of files) sqlite.exec(read(`migrations/${f}`));
  sqlite
    .prepare("INSERT INTO submissions (id, term, status, created_at) VALUES (900, 'Zzz', 'rejected', 'x')")
    .run();
  const before = sqlite.prepare("SELECT COUNT(*) AS n FROM published_terms").get().n;
  const publication = {
    term: "Zzz", rattsomrade: "Annat", allmansprak: "a", sprak_kalla_namn: "n",
    sprak_kalla_url: "https://example.com", institution: "i", institution_kalla_namn: "n",
    institution_kalla_url: "https://example.com", skillnad: "s",
  };
  const call = (body) =>
    worker.fetch(
      new Request("https://example.com/api/admin/review/900", {
        method: "POST",
        headers: { authorization: "Bearer secret", "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      { DB: d1(sqlite), ADMIN_TOKEN: "secret" },
    );
  assert.equal((await call({ action: "approve", publication })).status, 404);
  assert.equal((await call({ action: "reject" })).status, 404);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM published_terms").get().n, before);
});

test("approval racing a rejection publishes nothing", async (t) => {
  const { sqlite, files } = migrated();
  t.after(() => sqlite.close());
  for (const f of files) sqlite.exec(read(`migrations/${f}`));
  sqlite.prepare("INSERT INTO submissions (id, term, status, created_at) VALUES (901, 'Yyy', 'pending', 'x')").run();
  const db = d1(sqlite);
  const session = db.withSession();
  const realBatch = session.batch;
  session.batch = async (s) => {
    sqlite.prepare("UPDATE submissions SET status = 'rejected' WHERE id = 901").run();
    return realBatch(s);
  };
  const response = await worker.fetch(
    new Request("https://example.com/api/admin/review/901", {
      method: "POST",
      headers: { authorization: "Bearer secret", "content-type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        publication: {
          term: "Yyy", rattsomrade: "Annat", allmansprak: "a", sprak_kalla_namn: "n",
          sprak_kalla_url: "https://example.com", institution: "i", institution_kalla_namn: "n",
          institution_kalla_url: "https://example.com", skillnad: "s",
        },
      }),
    }),
    { DB: db, ADMIN_TOKEN: "secret" },
  );
  assert.equal(response.status, 404);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM published_terms WHERE term='Yyy'").get().n, 0);
});

test("migrations archive the term 'Ö' and repair literal backslash-n in notes", () => {
  const { sqlite, files } = migrated();
  for (const f of files.filter((f) => f < "0013")) sqlite.exec(read(`migrations/${f}`));
  sqlite.prepare("UPDATE published_terms SET status = 'published' WHERE term = 'Ö'").run();
  sqlite.prepare("INSERT INTO submissions (term, status, created_at, reviewer_note) VALUES ('T','pending','x','a\\nb')").run();
  sqlite.exec(read(`migrations/${files.find((f) => f.startsWith("0013"))}`));
  const row = sqlite.prepare("SELECT status FROM published_terms WHERE term = 'Ö'").get();
  assert.ok(row, "the 'Ö' row must still exist");
  assert.equal(row.status, "archived");
  assert.equal(sqlite.prepare("SELECT reviewer_note FROM submissions WHERE term='T'").get().reviewer_note, "a\nb");
  sqlite.close();
});

test("IPv6 addresses in the same /64 share one rate-limit identity input", () => {
  assert.equal(ipv6Prefix("2001:db8:1:2:aaaa::1"), ipv6Prefix("2001:0db8:0001:0002:bbbb:cccc:dddd:eeee"));
  assert.notEqual(ipv6Prefix("2001:db8:1:2::1"), ipv6Prefix("2001:db8:1:3::1"));
  assert.equal(ipv6Prefix("203.0.113.10"), "203.0.113.10");
});

test("admin ids must be plain decimal numbers", async () => {
  for (const id of ["1e3", "0x10", "1.0", "+5"]) {
    const response = await worker.fetch(
      new Request(`https://example.com/api/admin/review/${id}`, {
        method: "POST",
        headers: { authorization: "Bearer secret", "content-type": "application/json" },
        body: "{}",
      }),
      { DB: { withSession: () => ({}) }, ADMIN_TOKEN: "secret" },
    );
    assert.equal(response.status, 400, id);
  }
});
