import { test } from "node:test";
import assert from "node:assert/strict";
import { closeSync, fstatSync, openSync, readFileSync } from "node:fs";

const hook = new URL("../.githooks/pre-push", import.meta.url);

test("the pre-push hook is executable and runs the checks CI runs", () => {
  // Inspect the opened file itself, so the mode and the text come from the same file.
  const fd = openSync(hook, "r");
  try {
    assert.ok((fstatSync(fd).mode & 0o111) !== 0, "hook must be executable");
    const text = readFileSync(fd, "utf8");
    assert.match(text, /^#!\/bin\/sh/);
    assert.match(text, /^set -eu$/m);
    assert.match(text, /^npm test$/m);
    assert.match(text, /^sh tools\/deploy\.sh cloudflare\.example\.env --dry-run$/m);
    assert.match(text, /^node tools\/check-addresses\.mjs$/m);
  } finally {
    closeSync(fd);
  }
});
