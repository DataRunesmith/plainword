import assert from "node:assert/strict";
import test from "node:test";
import { isHttpUrl } from "../src/worker.js";

test("publication source URLs use HTTP(S) without embedded credentials", () => {
  assert.equal(isHttpUrl("https://example.org/source"), true);
  assert.equal(isHttpUrl("http://example.org/source"), true);
  assert.equal(isHttpUrl("javascript:alert(1)"), false);
  assert.equal(isHttpUrl("file:///etc/passwd"), false);
  assert.equal(isHttpUrl("https://user:password@example.org/source"), false);
  assert.equal(isHttpUrl("https://user@example.org/source"), false);
});
