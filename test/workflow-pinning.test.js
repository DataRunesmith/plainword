// The security workflow runs scanners with write access to code scanning, so
// every third-party action in it must be pinned to a full commit SHA. Tag
// rewriting tools (for example `gh actions-lock`) must not turn them back
// into mutable tags.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const file = join(import.meta.dirname, "..", ".github", "workflows", "security.yml");
// Matches `uses:` in block style and in flow mappings such as `- {uses: a/b@v1}`.
export function actionRefs(text) {
  return [...text.matchAll(/\buses:\s*["']?([^\s"',}]+)/g)].map((m) => m[1]);
}
const uses = actionRefs(readFileSync(file, "utf8"));

test("actionRefs finds block and flow-mapping references", () => {
  assert.deepEqual(actionRefs("- uses: a/b@v1\n- {uses: c/d@v2, with: {x: 1}}\n- {name: x, uses: \"e/f@v3\"}"), [
    "a/b@v1",
    "c/d@v2",
    "e/f@v3",
  ]);
});

test("security.yml uses at least one action", () => {
  assert.ok(uses.length > 0);
});

test("every action in security.yml is pinned to a 40-character commit SHA", () => {
  for (const ref of uses) {
    assert.match(ref, /@[0-9a-f]{40}$/, `${ref} is not pinned to a commit SHA`);
  }
});
