import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("tracked production config cannot be sanitized into a preview-only config", async () => {
  const config = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");

  assert.match(config, /"name"\s*:\s*"plainword"/);
  assert.match(config, /"observability"\s*:\s*\{[\s\S]*?"enabled"\s*:\s*true/);
  assert.match(config, /"binding"\s*:\s*"DB"/);
  assert.match(config, /"pattern"\s*:\s*"__PUBLIC_HOST__"/);
  assert.match(config, /"pattern"\s*:\s*"__ALIAS_HOST__"/);
  assert.match(config, /"run_worker_first"\s*:\s*true/);
});
