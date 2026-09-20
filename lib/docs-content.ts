import fs from "node:fs";
import path from "node:path";
import { ALL_DOC_PAGES, DOC_ALIASES, resolveDocSlug } from "@/lib/docs-nav";

const CONTENT_DIR = path.join(process.cwd(), "content", "docs");

export interface DocSource {
  title: string;
  body: string;
}

export function getAllDocSlugs(): string[] {
  const canonicalSlugs = ALL_DOC_PAGES.map((p) => p.slug);
  const aliasSlugs = Object.keys(DOC_ALIASES);
  return [...canonicalSlugs, ...aliasSlugs];
}

// Doc source links are file-relative to the linking page (mkdocs convention),
// e.g. "../reference/configuration.md" from a guides/ page. Resolve each one
// against *that page's* directory and rewrite it into a real /docs/... route,
// preserving any #anchor. External links pass through untouched.
function rewriteRelativeLinks(markdown: string, slug: string): string {
  const dir = path.posix.dirname(slug);
  return markdown.replace(/\]\(([^)]+)\)/g, (match, target: string) => {
    if (/^([a-z]+:)?\/\//i.test(target) || target.startsWith("#") || target.startsWith("/")) {
      return match;
    }
    if (!target.endsWith(".md") && !target.includes(".md#")) return match;

    const [rawPath, hash] = target.split("#");
    const resolved = path.posix.normalize(path.posix.join(dir, rawPath)).replace(/\.md$/, "");
    const href = `/docs/${resolved}${hash ? `#${hash}` : ""}`;
    return `](${href})`;
  });
}

export function getDocSource(slug: string): DocSource {
  const canonicalSlug = resolveDocSlug(slug);
  const filePath = path.join(CONTENT_DIR, `${canonicalSlug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : canonicalSlug;
  const body = rewriteRelativeLinks(raw, canonicalSlug);
  return { title, body };
}

export interface DocHeading {
  depth: number;
  text: string;
  id: string;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function extractHeadings(markdown: string): DocHeading[] {
  const headings: DocHeading[] = [];
  const lines = markdown.split("\n");
  let inCodeFence = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const text = match[2].trim();
      // The id is derived from the raw text (slugifyHeading drops backticks, and DocContent
      // computes the same id from the rendered heading); the label shows no markdown.
      headings.push({ depth: match[1].length, text: text.replace(/`/g, ""), id: slugifyHeading(text) });
    }
  }
  return headings;
}
