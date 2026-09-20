// Shared constants and the GitHub release lookup for /download and /cli.
// Verified against the repo directly (gh api, cli/README.md, README.md).

import releaseData from "./release.json";

export const REPO_URL = "https://github.com/Wizard-AIA/Wizard-w2";
export const WEBSITE_REPO_URL = "https://github.com/Wizard-AIA/website";
export const DOCS_EDIT_BASE_URL = `${WEBSITE_REPO_URL}/edit/main/content/docs`;
// First-party docs live at /docs now — this used to point at the separate
// MkDocs/GitHub Pages site, which is no longer linked from the site.
export const DOCS_URL = "/docs";
export const CODESPACES_URL = "https://codespaces.new/Wizard-AIA/Wizard-w2";

export const PLATFORMS = [
  { label: "macOS (Apple Silicon)", suffix: "darwin-arm64" },
  { label: "macOS (Intel)", suffix: "darwin-amd64" },
  { label: "Linux (x86_64)", suffix: "linux-amd64" },
  { label: "Linux (arm64)", suffix: "linux-arm64" },
  { label: "Windows (x86_64)", suffix: "windows-amd64" },
] as const;

export interface ReleaseAsset {
  name: string;
  url: string;
  sizeBytes: number;
}

export interface ReleaseInfo {
  tag: string;
  publishedAt: string;
  htmlUrl: string;
  assets: ReleaseAsset[];
  live: boolean;
}

// The latest release as recorded in lib/release.json, which the "Sync release"
// workflow regenerates from the release's own release.json after every Wizard
// release. It is the single place the site learns a version, tag or checksum
// from: nothing else in the site hardcodes one. Used for the version shown on
// pages and, if the GitHub API is unreachable or rate-limited, so /download
// never renders broken links just because that one request failed.
export const LATEST_VERSION: string = releaseData.version;
export const LATEST_TAG: string = releaseData.tag;

const FALLBACK_RELEASE: ReleaseInfo = {
  tag: releaseData.tag,
  publishedAt: "",
  htmlUrl: `${REPO_URL}/releases/tag/${releaseData.tag}`,
  live: false,
  assets: releaseData.assets.map((a) => ({ name: a.name, url: a.url, sizeBytes: a.size ?? 0 })),
};

export async function getLatestRelease(): Promise<ReleaseInfo> {
  try {
    const res = await fetch("https://api.github.com/repos/Wizard-AIA/Wizard-w2/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK_RELEASE;

    const data = await res.json();
    if (!data.tag_name || !Array.isArray(data.assets) || data.assets.length === 0) {
      return FALLBACK_RELEASE;
    }

    return {
      tag: data.tag_name,
      publishedAt: data.published_at,
      htmlUrl: data.html_url,
      live: true,
      assets: data.assets.map((a: { name: string; browser_download_url: string; size: number }) => ({
        name: a.name,
        url: a.browser_download_url,
        sizeBytes: a.size,
      })),
    };
  } catch {
    return FALLBACK_RELEASE;
  }
}

export function assetForSuffix(release: ReleaseInfo, suffix: string): ReleaseAsset | undefined {
  return release.assets.find((a) => a.name.endsWith(`${suffix}.zip`));
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
