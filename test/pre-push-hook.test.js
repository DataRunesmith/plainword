import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const hook = new URL("../.githooks/pre-push", import.meta.url);

test("the pre-push hook is executable and runs the checks CI runs", () => {
  assert.ok((statSync(hook).mode & 0o111) !== 0, "hook must be executable");
  const text = readFileSync(hook, "utf8");
  assert.match(text, /^#!\/bin\/sh/);
  assert.match(text, /^set -eu$/m);
  assert.match(text, /^npm test$/m);
  assert.match(text, /^node tools\/check-addresses\.mjs$/m);
});
