import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");

test("render.mjs can write to a nested directory under build/ without copying build into itself", () => {
  const out = resolve(root, "build", "render-test");
  try {
    execFileSync("node", ["tools/render.mjs", "cloudflare.example.env", out], {
      cwd: root,
      stdio: "pipe",
    });
    assert.equal(existsSync(resolve(out, "package.json")), true);
    assert.equal(existsSync(resolve(out, "build")), false);
  } finally {
    rmSync(resolve(root, "build"), { recursive: true, force: true });
  }
});
