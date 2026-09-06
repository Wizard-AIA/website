// Shared constants and the GitHub release lookup for /download and /cli.
// Verified against the repo directly (gh api, cli/README.md, README.md).

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

// Pinned to releases/latest at the time this page was written. Used only if
// the GitHub API is unreachable or rate-limited, so /download never renders
// broken links just because that one request failed.
const FALLBACK_RELEASE: ReleaseInfo = {
  tag: "v1.0.8",
  publishedAt: "2026-09-06T10:21:00Z",
  htmlUrl: `${REPO_URL}/releases/tag/v1.0.8`,
  live: false,
  assets: [
    { name: "Wizard-v1.0.8-darwin-arm64.zip", url: `${REPO_URL}/releases/download/v1.0.8/Wizard-v1.0.8-darwin-arm64.zip`, sizeBytes: 5805446 },
    { name: "Wizard-v1.0.8-darwin-amd64.zip", url: `${REPO_URL}/releases/download/v1.0.8/Wizard-v1.0.8-darwin-amd64.zip`, sizeBytes: 6048068 },
    { name: "Wizard-v1.0.8-linux-amd64.zip", url: `${REPO_URL}/releases/download/v1.0.8/Wizard-v1.0.8-linux-amd64.zip`, sizeBytes: 6178618 },
    { name: "Wizard-v1.0.8-linux-arm64.zip", url: `${REPO_URL}/releases/download/v1.0.8/Wizard-v1.0.8-linux-arm64.zip`, sizeBytes: 5861810 },
    { name: "Wizard-v1.0.8-windows-amd64.zip", url: `${REPO_URL}/releases/download/v1.0.8/Wizard-v1.0.8-windows-amd64.zip`, sizeBytes: 6302852 },
  ],
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
