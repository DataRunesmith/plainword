import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const render = (...args) =>
  spawnSync("node", ["tools/render.mjs", "cloudflare.example.env", ...args], {
    cwd: root,
    encoding: "utf8",
  });
const tempDir = () => mkdtempSync(join(tmpdir(), "plainword-render-"));

test("renders into a nested directory under build/ without copying build into itself", () => {
  try {
    const result = render(join(root, "build", "render-test"));
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(join(root, "build", "render-test", "package.json")), true);
    assert.equal(existsSync(join(root, "build", "render-test", "build")), false);
  } finally {
    rmSync(join(root, "build", "render-test"), { recursive: true, force: true });
  }
});

test("renders into a directory below the temp directory", () => {
  const dir = tempDir();
  try {
    const result = render(join(dir, "site"));
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(join(dir, "site", "package.json")), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("refuses output directories outside the allowed ones and deletes nothing", () => {
  const dir = tempDir();
  const victim = join(dir, "keep.txt");
  writeFileSync(victim, "keep");
  try {
    for (const target of ["/", "/etc", root, join(root, "src"), resolve(root, ".."), tmpdir(), "relative-dir"]) {
      const result = render(target);
      assert.notEqual(result.status, 0, `${target} should be refused`);
    }
    assert.equal(existsSync(victim), true);
    assert.equal(existsSync(join(root, "src", "worker.js")), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("refuses an output path that passes through a symbolic link", () => {
  const dir = tempDir();
  const elsewhere = join(dir, "elsewhere");
  mkdirSync(elsewhere);
  writeFileSync(join(elsewhere, "keep.txt"), "keep");
  try {
    mkdirSync(join(root, "build"), { recursive: true });
    symlinkSync(elsewhere, join(root, "build", "link"));
    const result = render(join(root, "build", "link", "site"));
    assert.notEqual(result.status, 0);
    assert.equal(existsSync(join(elsewhere, "keep.txt")), true);
  } finally {
    rmSync(join(root, "build", "link"), { recursive: true, force: true });
    rmSync(dir, { recursive: true, force: true });
  }
});

test("refuses an overlay that is outside the allowed directories or a symbolic link", () => {
  const dir = tempDir();
  const out = join(dir, "site");
  try {
    assert.notEqual(render(out, "/etc").status, 0);
    const link = join(dir, "overlay-link");
    symlinkSync(join(dir, "missing"), link);
    assert.notEqual(render(out, link).status, 0);
    const real = join(dir, "overlay");
    mkdirSync(real);
    writeFileSync(join(real, "logo.txt"), "logo");
    const ok = render(out, real);
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(existsSync(join(out, "logo.txt")), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
