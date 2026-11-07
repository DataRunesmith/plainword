import assert from "node:assert/strict";
import test from "node:test";

import { d1SessionConstraint, isD1ApiRoute, withD1Session } from "../src/worker.js";

test("public terms use an unconstrained D1 session", () => {
  assert.equal(d1SessionConstraint("GET", "/api/terms"), "first-unconstrained");
});

test("admin reads and mutations start on primary", () => {
  assert.equal(d1SessionConstraint("GET", "/api/admin/queue"), "first-primary");
  assert.equal(d1SessionConstraint("POST", "/api/submit"), "first-primary");
  assert.equal(d1SessionConstraint("PUT", "/api/admin/terms/1"), "first-primary");
});

test("only handled API routes create D1 sessions", () => {
  assert.equal(isD1ApiRoute("GET", "/api/terms"), true);
  assert.equal(isD1ApiRoute("POST", "/api/submit"), true);
  assert.equal(isD1ApiRoute("GET", "/api/admin/queue"), true);
  assert.equal(isD1ApiRoute("GET", "/api/admin/terms"), true);
  assert.equal(isD1ApiRoute("POST", "/api/admin/review/1"), true);
  assert.equal(isD1ApiRoute("POST", "/api/admin/terms/1/status"), true);
  assert.equal(isD1ApiRoute("PUT", "/api/admin/terms/1"), true);
  assert.equal(isD1ApiRoute("GET", "/api/not-handled"), false);
  assert.equal(isD1ApiRoute("POST", "/api/terms"), false);
});

test("session environment swaps only the D1 binding", () => {
  const session = { prepare() {} };
  let receivedConstraint = null;
  const env = {
    DB: {
      withSession(constraint) {
        receivedConstraint = constraint;
        return session;
      },
    },
    ADMIN_TOKEN: "secret",
  };

  const sessionEnv = withD1Session(env, "first-unconstrained");

  assert.equal(receivedConstraint, "first-unconstrained");
  assert.equal(sessionEnv.DB, session);
  assert.equal(sessionEnv.ADMIN_TOKEN, "secret");
  assert.notEqual(sessionEnv, env);
});
