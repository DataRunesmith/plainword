// The security workflow runs scanners with write access to code scanning, so
// every third-party action in it must be pinned to a full commit SHA. Tag
// rewriting tools (for example `gh actions-lock`) must not turn them back
// into mutable tags.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const dir = join(import.meta.dirname, "..", ".github", "workflows");
const files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
// Matches `uses:` in block style, in flow mappings (`- {uses: a/b@v1}`) and with quoted keys.
export function actionRefs(text) {
  return [...text.matchAll(/["']?\buses["']?\s*:\s*["']?([^\s"',}]+)/g)].map((m) => m[1]);
}
const uses = files.flatMap((f) =>
  actionRefs(readFileSync(join(dir, f), "utf8")).map((ref) => `${f}: ${ref}`),
);

test("actionRefs finds block and flow-mapping references", () => {
  assert.deepEqual(actionRefs("- uses: a/b@v1\n- {uses: c/d@v2, with: {x: 1}}\n- {name: x, uses: \"e/f@v3\"}\n- {\"uses\": \"g/h@v4\"}\n- {'uses': 'i/j@v5'}"), [
    "a/b@v1",
    "c/d@v2",
    "e/f@v3",
    "g/h@v4",
    "i/j@v5",
  ]);
});

test("workflows use at least one action", () => {
  assert.ok(uses.length > 0);
});

test("every action in every workflow is pinned to a 40-character commit SHA", () => {
  for (const ref of uses) {
    assert.match(ref, /@[0-9a-f]{40}$/, `${ref} is not pinned to a commit SHA`);
  }
});
