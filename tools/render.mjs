#!/usr/bin/env node
// Renders a deployable copy of this repo with your own values.
//
//   node tools/render.mjs <values.env | -> <out-dir> [overlay-dir]
//
// The repo holds only placeholders (__NAME__). Every NAME listed in
// cloudflare.example.env must have a value in <values.env> (it may be empty);
// each __NAME__ in the copied text files is replaced with its value. With "-"
// the values are read from environment variables instead, e.g. the build
// variables of Cloudflare Workers Builds or a container's environment.
// Values may use \n for line breaks, or "@path" to read a file. Files in the
// optional overlay directory are copied on top (e.g. your own images). The
// output goes to build/ (or dist/, site-docs/, .wrangler/) in the repository,
// to a directory below the system temp directory, or to /srv/site; the overlay
// must be below the working directory, the repository or the temp directory.
// Routes
// whose pattern ends up empty are dropped from wrangler.jsonc. Deploy with
//   npx wrangler deploy --cwd <out-dir>   (politiker: --cwd <out-dir>/app)
import { execFileSync } from "node:child_process";
import {
  closeSync,
  cpSync,
  lstatSync,
  mkdirSync,
  fstatSync,
  ftruncateSync,
  openSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeSync,
} from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const [valuesFile, outArg, overlayArg] = process.argv.slice(2);
if (!valuesFile || !outArg) {
  console.error("usage: node tools/render.mjs <values.env | -> <out-dir> [overlay-dir]");
  process.exit(2);
}
const source = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), ".."));

// Paths from the command line are only used after they have been resolved and
// checked against a fixed list of directories. "self" means the directory
// itself is allowed too; for the temp directory only subdirectories are.
function insideRoots(arg, roots, what) {
  const abs = resolve(arg);
  for (const { dir, self } of roots) {
    if (abs.startsWith(dir + sep)) return { path: abs, root: dir };
    if (self && abs === dir) return { path: dir, root: dir };
  }
  throw new Error(`${what} must be inside one of: ${roots.map((r) => r.dir).join(", ")}`);
}
const tempDirs = [...new Set([tmpdir(), realpathSync(tmpdir())])].map((dir) => ({ dir, self: false }));
const GENERATED = ["dist", ".wrangler", "site-docs", "build"];
const outputRoots = [
  ...GENERATED.map((name) => ({ dir: join(source, name), self: true })),
  ...tempDirs,
  // Where the container image renders the site.
  { dir: "/srv/site", self: true },
];
const { path: out, root: outRoot } = insideRoots(outArg, outputRoots, "The output directory");
const isWithin = (parent, candidate) => {
  const rel = relative(parent, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
};
if (isWithin(out, source))
  throw new Error("Output path cannot be the source directory or one of its parent directories.");

// Create the directory if needed and make sure no symbolic link led out of
// the allowed directory on the way there.
mkdirSync(out, { recursive: true });
const realOut = realpathSync(out);
const realRoot = realpathSync(outRoot);
if (realOut !== realRoot && !realOut.startsWith(realRoot + sep))
  throw new Error("Refusing to use an output path that passes through a symbolic link.");
if (lstatSync(out).isSymbolicLink()) throw new Error("Refusing to replace a symbolic-link output path.");
// Nobody else may be able to swap a directory on the way for a link after the
// checks: every directory from the output up to its allowed root must belong to
// the current user, and the root itself must not be writable by others (unless
// it is a sticky directory such as /tmp).
if (typeof process.getuid === "function") {
  for (let dir = out; dir !== outRoot; dir = dirname(dir))
    if (lstatSync(dir).uid !== process.getuid())
      throw new Error(`Refusing to use ${dir}: it belongs to another user.`);
  const rootMode = lstatSync(outRoot).mode;
  if (rootMode & 0o022 && !(rootMode & 0o1000))
    throw new Error(`Refusing to use ${outRoot}: other users can write to it.`);
}
if (isWithin(source, out)) {
  const outputRelative = relative(source, out);
  try {
    execFileSync("git", ["check-ignore", "--quiet", "--no-index", "--", outputRelative], {
      cwd: source,
      stdio: "ignore",
    });
  } catch {
    throw new Error("An output directory inside the repository must be ignored by Git.");
  }
  const trackedFiles = execFileSync("git", ["ls-files", "--", outputRelative], {
    cwd: source,
    encoding: "utf8",
  }).trim();
  if (trackedFiles) throw new Error("Refusing to delete tracked files from the output directory.");
}
const SKIP = new Set(["node_modules", ".wrangler", "dist", "build", "site-docs", ".dev.vars", ".git", ".github"]);
const TEXT = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".html",
  ".css",
  ".txt",
  ".xml",
  ".json",
  ".jsonc",
  ".webmanifest",
  ".toml",
  ".sh",
  ".py",
  ".sql",
  ".md",
  ".svg",
  "",
]);

function parseEnv(file) {
  const values = new Map();
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2];
    if (value.startsWith("@"))
      value = readFileSync(resolve(dirname(file), value.slice(1)), "utf8").trimEnd();
    values.set(match[1], value.replace(/\\n/g, "\n"));
  }
  return values;
}

const declared = [...parseEnv(join(source, "cloudflare.example.env")).keys()];
const values =
  valuesFile === "-"
    ? new Map(
        declared
          .filter((name) => name in process.env)
          .map((name) => [name, process.env[name].replace(/\\n/g, "\n")]),
      )
    : parseEnv(valuesFile);
const missing = declared.filter((name) => !values.has(name));
if (missing.length) {
  console.error(
    `${valuesFile === "-" ? "the environment" : valuesFile} is missing: ${missing.join(", ")}`,
  );
  process.exit(1);
}

// Validate the overlay before anything is deleted, so a rejected input leaves
// an existing output untouched. It must be below the working directory, the
// repository or the temp directory.
let overlay = null;
if (overlayArg) {
  const overlayRoots = [
    { dir: process.cwd(), self: true },
    { dir: source, self: true },
    ...tempDirs,
  ];
  const checked = insideRoots(overlayArg, overlayRoots, "The overlay directory").path;
  let overlayInfo;
  try {
    overlayInfo = lstatSync(checked);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  // lstat sees a dangling link that existsSync would report as missing.
  if (overlayInfo?.isSymbolicLink()) throw new Error("Overlay directory cannot be a symbolic link.");
  if (overlayInfo) overlay = checked;
}

// The output directory was checked above, so it may be replaced.
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const keep = (path) => {
  const outRelative = relative(out, path);
  const isOutput = outRelative === "" ||
    (outRelative !== ".." && !outRelative.startsWith(`..${sep}`) && !isAbsolute(outRelative));
  const sourceRelative = relative(source, path);
  // A directory that contains the output cannot be copied into itself.
  return !isOutput && !isWithin(path, out) &&
    !sourceRelative.split(sep).some((part) => SKIP.has(part));
};
for (const name of readdirSync(source)) {
  const path = join(source, name);
  if (keep(path))
    cpSync(path, join(out, name), {
      recursive: true,
      filter: (candidate) => keep(candidate) && !lstatSync(candidate).isSymbolicLink(),
    });
}
if (overlay) {
  cpSync(overlay, out, {
    recursive: true,
    filter: (candidate) => !lstatSync(candidate).isSymbolicLink(),
  });
}

// Dependencies stay in the repo; link them instead of copying.
(function linkModules(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      !entry.isDirectory() ||
      entry.name.startsWith(".") ||
      (SKIP.has(entry.name) && entry.name !== "node_modules") ||
      isWithin(join(dir, entry.name), out)
    )
      continue;
    const path = join(dir, entry.name);
    if (entry.name === "node_modules") {
      symlinkSync(path, join(out, relative(source, path)));
    } else if (relative(source, path).split(sep).length < 3) {
      linkModules(path);
    }
  }
})(source);

let replaced = 0;
(function substitute(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      substitute(path);
      continue;
    }
    if (!TEXT.has(extname(entry.name)) && entry.name !== "_headers") continue;
    // Size check, read and write all go through one descriptor, so the file
    // cannot be swapped between them.
    const fd = openSync(path, "r+");
    try {
      const descriptorInfo = fstatSync(fd);
      const pathInfo = lstatSync(path);
      if (
        !descriptorInfo.isFile() ||
        !pathInfo.isFile() ||
        pathInfo.isSymbolicLink() ||
        descriptorInfo.dev !== pathInfo.dev ||
        descriptorInfo.ino !== pathInfo.ino ||
        descriptorInfo.size > 5_000_000
      ) continue;
      let text = readFileSync(fd, "utf8");
      const before = text;
      for (const name of declared) text = text.split(`__${name}__`).join(values.get(name));
      if (entry.name === "wrangler.jsonc") {
        text = text.replace(/\{\s*"pattern":\s*""[^}]*\},?\s*/g, "");
      }
      if (text !== before) {
        // writeSync may write less than asked, so loop until every byte is out.
        const bytes = Buffer.from(text, "utf8");
        ftruncateSync(fd);
        for (let done = 0; done < bytes.length;) {
          done += writeSync(fd, bytes, done, bytes.length - done, done);
        }
        replaced++;
      }
    } finally {
      closeSync(fd);
    }
  }
})(out);

console.log(`rendered into ${out} (${replaced} files filled in)`);
