import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { validate } from "./sync-release.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const seeded = JSON.parse(readFileSync(join(here, "..", "lib", "release.json"), "utf8"));
const clone = () => structuredClone(seeded);

// A manifest for a newer release, derived from the seeded one.
function bumped(version) {
  const m = clone();
  const from = m.tag;
  m.version = version;
  m.tag = `v${version}`;
  m.checksums_url = m.checksums_url.replace(from, m.tag);
  for (const a of m.assets) {
    a.name = a.name.replace(from, m.tag);
    a.url = `https://github.com/Wizard-AIA/Wizard-w2/releases/download/${m.tag}/${a.name}`;
  }
  return m;
}

test("the seeded manifest is valid", () => assert.equal(validate(seeded), null));

test("rejects a manifest for another repository", () => {
  const m = clone();
  m.repo = "someone/else";
  assert.match(validate(m), /repo is/);
});

test("rejects a download url that is not on the release", () => {
  const m = clone();
  m.assets[0].url = "https://evil.example.com/Wizard.zip";
  assert.match(validate(m), /url is not on this release/);
});

test("rejects a checksum that is not sha256", () => {
  const m = clone();
  m.assets[1].sha256 = "abc123";
  assert.match(validate(m), /sha256/);
});

test("rejects a manifest missing a platform", () => {
  const m = clone();
  m.assets = m.assets.filter((a) => !(a.os === "windows" && a.arch === "amd64"));
  assert.match(validate(m), /windows-amd64/);
});

test("rejects a tag that disagrees with the version", () => {
  const m = clone();
  m.tag = "v9.9.9";
  assert.match(validate(m), /does not match version/);
});

function run(candidate, target) {
  const dir = mkdtempSync(join(tmpdir(), "sync-release-"));
  const c = join(dir, "candidate.json");
  const t = join(dir, "target.json");
  writeFileSync(c, JSON.stringify(candidate));
  if (target) writeFileSync(t, `${JSON.stringify(target, null, 2)}\n`);
  const result = spawnSync("node", [join(here, "sync-release.mjs"), c, t], { encoding: "utf8" });
  return { ...result, target: t };
}

test("an identical manifest leaves the target untouched", () => {
  const r = run(seeded, seeded);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /already at/);
});

test("a newer release replaces the target", () => {
  const r = run(bumped("99.0.1"), seeded);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(readFileSync(r.target, "utf8")).tag, "v99.0.1");
});

test("never moves the site backwards", () => {
  const r = run(bumped("0.0.1"), seeded);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /backwards/);
  assert.equal(JSON.parse(readFileSync(r.target, "utf8")).tag, seeded.tag);
});

test("an invalid candidate leaves the target alone", () => {
  const bad = clone();
  bad.assets = [];
  const r = run(bad, seeded);
  assert.equal(r.status, 1);
  assert.equal(JSON.parse(readFileSync(r.target, "utf8")).tag, seeded.tag);
});
