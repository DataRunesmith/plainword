import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
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

// build/ may hold someone's work: remove it afterwards only if the test created it.
const build = join(root, "build");
const removeIfCreated = (existed) => {
  if (!existed) rmSync(build, { recursive: true, force: true });
};

test("renders into a nested directory under build/ without copying build into itself", () => {
  const existed = existsSync(build);
  try {
    const result = render(join(root, "build", "render-test"));
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(join(root, "build", "render-test", "package.json")), true);
    assert.equal(existsSync(join(root, "build", "render-test", "build")), false);
  } finally {
    rmSync(join(root, "build", "render-test"), { recursive: true, force: true });
    removeIfCreated(existed);
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
  const existed = existsSync(build);
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
    removeIfCreated(existed);
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

test("refuses a symbolic link as the allowed output root", (t) => {
  if (existsSync(build)) return t.skip("build/ already exists");
  const dir = tempDir();
  const elsewhere = join(dir, "elsewhere");
  mkdirSync(join(elsewhere, "site"), { recursive: true });
  writeFileSync(join(elsewhere, "site", "keep.txt"), "keep");
  try {
    symlinkSync(elsewhere, build);
    const result = render(join(build, "site"));
    assert.notEqual(result.status, 0);
    assert.equal(existsSync(join(elsewhere, "site", "keep.txt")), true);
  } finally {
    rmSync(build, { force: true });
    rmSync(dir, { recursive: true, force: true });
  }
});

test("refuses an overlay that is reached through a symbolic-link directory", () => {
  const dir = tempDir();
  const elsewhere = join(dir, "elsewhere", "assets");
  mkdirSync(elsewhere, { recursive: true });
  writeFileSync(join(elsewhere, "secret.txt"), "secret");
  try {
    symlinkSync(join(dir, "elsewhere"), join(dir, "link"));
    const out = join(dir, "site");
    const result = render(out, join(dir, "link", "assets"));
    assert.notEqual(result.status, 0);
    assert.equal(existsSync(join(out, "secret.txt")), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// A copy of the renderer inside a throwaway git repository below the temp directory.
function scaffoldRepo() {
  const repo = tempDir();
  mkdirSync(join(repo, "tools"));
  cpSync(join(root, "tools", "render.mjs"), join(repo, "tools", "render.mjs"));
  cpSync(join(root, "cloudflare.example.env"), join(repo, "cloudflare.example.env"));
  writeFileSync(join(repo, ".gitignore"), "node_modules\nbuild\n");
  writeFileSync(join(repo, "package.json"), "{}");
  mkdirSync(join(repo, "src"));
  writeFileSync(join(repo, "src", "a.txt"), "tracked");
  mkdirSync(join(repo, "node_modules"));
  writeFileSync(join(repo, "node_modules", "keep.txt"), "keep");
  writeFileSync(join(repo, ".dev.vars"), "SECRET=1");
  spawnSync("git", ["init", "-q"], { cwd: repo });
  spawnSync("git", ["add", "-A"], { cwd: repo });
  return repo;
}
const renderIn = (repo, ...args) =>
  spawnSync("node", ["tools/render.mjs", "cloudflare.example.env", ...args], {
    cwd: repo,
    encoding: "utf8",
  });

test("a repository below the temp directory may only render into its generated directories", () => {
  const repo = scaffoldRepo();
  try {
    for (const target of ["src/foo", "node_modules", "node_modules/x", "."]) {
      const result = renderIn(repo, join(repo, target));
      assert.notEqual(result.status, 0, `${target} should be refused`);
    }
    assert.equal(existsSync(join(repo, "src", "foo")), false);
    assert.equal(existsSync(join(repo, "node_modules", "keep.txt")), true);
    assert.equal(existsSync(join(repo, "node_modules", "x")), false);
    const ok = renderIn(repo, join(repo, "build", "site"));
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(existsSync(join(repo, "build", "site", "src", "a.txt")), true);
    assert.equal(existsSync(join(repo, "build", "site", ".dev.vars")), false);
    assert.equal(existsSync(join(repo, "build", "site", "build")), false);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("refuses an overlay that is the repository or lies inside or around the output", () => {
  const repo = scaffoldRepo();
  const out = join(repo, "build", "site");
  try {
    assert.equal(renderIn(repo, out).status, 0);
    writeFileSync(join(out, "marker.txt"), "marker");
    mkdirSync(join(out, "assets"));
    for (const overlay of [".", repo, join(repo, "build"), join(out, "assets"), out]) {
      const result = renderIn(repo, out, overlay);
      assert.notEqual(result.status, 0, `${overlay} should be refused`);
      assert.equal(existsSync(join(out, "marker.txt")), true, "the output must be left intact");
    }
    const real = join(repo, "images");
    mkdirSync(real);
    writeFileSync(join(real, "logo.txt"), "logo");
    const ok = renderIn(repo, out, real);
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(existsSync(join(out, "logo.txt")), true);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
