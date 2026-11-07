import assert from "node:assert/strict";
import test from "node:test";

import { adminRoute, isAdminPath } from "../src/index.js";

test("admin page uses one protected namespace", () => {
  assert.deepEqual(adminRoute("/admin"), { type: "pass", pathname: "/admin" });
  assert.deepEqual(adminRoute("/admin/"), { type: "redirect", pathname: "/admin" });
  assert.deepEqual(adminRoute("/admin.html"), { type: "redirect", pathname: "/admin" });
});

test("all canonical admin APIs rewrite to existing handlers", () => {
  for (const [method, pathname, internal] of [
    ["GET", "/admin/api/queue", "/api/admin/queue"],
    ["GET", "/admin/api/terms", "/api/admin/terms"],
    ["POST", "/admin/api/review/7", "/api/admin/review/7"],
    ["PUT", "/admin/api/terms/7", "/api/admin/terms/7"],
    ["POST", "/admin/api/terms/7/status", "/api/admin/terms/7/status"],
  ]) {
    assert.deepEqual(adminRoute(pathname), { type: "rewrite", pathname: internal });
  }
});

test("direct calls to the internal admin API redirect to /admin/api", () => {
  for (const [method, pathname, target] of [
    ["GET", "/api/admin/queue", "/admin/api/queue"],
    ["POST", "/api/admin/review/7", "/admin/api/review/7"],
    ["PUT", "/api/admin/terms/7", "/admin/api/terms/7"],
    ["POST", "/api/admin/terms/7/status", "/admin/api/terms/7/status"],
  ]) {
    assert.deepEqual(adminRoute(pathname), { type: "redirect", pathname: target });
  }
});

test("public API paths pass through unchanged", () => {
  assert.deepEqual(adminRoute("/api/terms"), { type: "pass", pathname: "/api/terms" });
  assert.deepEqual(adminRoute("/api/submit"), { type: "pass", pathname: "/api/submit" });
});

test("all admin entry points are marked no-store", () => {
  for (const pathname of [
    "/admin",
    "/admin/",
    "/admin.html",
    "/admin/api/queue",
    "/api/admin/queue",
  ]) {
    assert.equal(isAdminPath(pathname), true, pathname);
  }
  assert.equal(isAdminPath("/api/terms"), false);
});
