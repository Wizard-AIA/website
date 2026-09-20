// Validates a Wizard release manifest (the release.json asset attached to every
// Wizard-w2 release) and installs it as lib/release.json, which the site reads
// for the current version, download links and checksums.
//
//   node scripts/sync-release.mjs <candidate.json> [target.json]
//
// Exit 0: the target is up to date or was rewritten (`changed=true|false` is
// appended to $GITHUB_OUTPUT when set). Exit 1: the candidate is not a manifest
// this site should publish, and the target is left alone. The site never shows a
// version, link or checksum that did not come from a release GitHub is serving.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const REPO = "Wizard-AIA/Wizard-w2";
const PLATFORMS = ["darwin-arm64", "darwin-amd64", "linux-amd64", "linux-arm64", "windows-amd64"];

const fail = (message) => {
  console.error(`sync-release: ${message}`);
  process.exit(1);
};

const parts = (version) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  return m ? m.slice(1).map(Number) : null;
};
const newer = (a, b) => {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
};

export function validate(manifest) {
  if (manifest?.schema !== 1) return `unsupported schema ${JSON.stringify(manifest?.schema)}`;
  if (manifest.repo !== REPO) return `repo is ${JSON.stringify(manifest.repo)}, expected ${REPO}`;
  const version = parts(manifest.version);
  if (!version) return `version ${JSON.stringify(manifest.version)} is not X.Y.Z`;
  if (manifest.tag !== `v${manifest.version}`) return `tag ${manifest.tag} does not match version ${manifest.version}`;
  const base = `https://github.com/${REPO}/releases/download/${manifest.tag}/`;
  if (manifest.checksums_url !== `${base}SHA256SUMS`) return "checksums_url is not this release's SHA256SUMS";
  if (!Array.isArray(manifest.assets)) return "assets is missing";
  const seen = new Set();
  for (const asset of manifest.assets) {
    const platform = `${asset.os}-${asset.arch}`;
    if (asset.name !== `Wizard-${manifest.tag}-${platform}.zip`) return `unexpected asset name ${asset.name}`;
    if (asset.url !== `${base}${asset.name}`) return `${asset.name}: url is not on this release`;
    if (!/^[0-9a-f]{64}$/.test(asset.sha256 ?? "")) return `${asset.name}: sha256 is not 64 hex characters`;
    // release.py leaves size out when it had no archives to measure; the site copes with that.
    if (asset.size !== undefined && (!Number.isInteger(asset.size) || asset.size <= 0)) return `${asset.name}: size is not positive`;
    seen.add(platform);
  }
  const missing = PLATFORMS.filter((p) => !seen.has(p));
  if (missing.length) return `no asset for ${missing.join(", ")}`;
  return null;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [candidatePath, targetPath = "lib/release.json"] = process.argv.slice(2);
  if (!candidatePath) fail("usage: node scripts/sync-release.mjs <candidate.json> [target.json]");

  let candidate;
  try {
    candidate = JSON.parse(readFileSync(candidatePath, "utf8"));
  } catch (error) {
    fail(`${candidatePath} is not valid JSON: ${error.message}`);
  }
  const problem = validate(candidate);
  if (problem) fail(problem);

  let current = null;
  if (existsSync(targetPath)) {
    try {
      current = JSON.parse(readFileSync(targetPath, "utf8"));
    } catch {
      current = null; // a corrupt target is replaced
    }
  }
  const currentVersion = current && parts(current.version);
  if (currentVersion && newer(currentVersion, parts(candidate.version))) {
    fail(`refusing to move backwards from ${current.version} to ${candidate.version}`);
  }

  const next = `${JSON.stringify(candidate, null, 2)}\n`;
  const changed = !existsSync(targetPath) || readFileSync(targetPath, "utf8") !== next;
  if (changed) writeFileSync(targetPath, next);
  console.log(changed ? `sync-release: ${targetPath} is now ${candidate.tag}` : `sync-release: ${targetPath} already at ${candidate.tag}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\ntag=${candidate.tag}\n`);
}
