import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, ChevronRight, ExternalLink } from "lucide-react"
import { DocContent } from "@/components/docs/doc-content"
import { DocsToc } from "@/components/docs/docs-toc"
import { Reveal } from "@/components/reveal"
import { DOCS_EDIT_BASE_URL } from "@/lib/wizard"
import { getAllDocSlugs, getDocSource, extractHeadings } from "@/lib/docs-content"
import { findDocPage, findSectionForSlug, getAdjacentPages } from "@/lib/docs-nav"

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug: slug.split("/") }))
}

function slugFromParams(slugParts: string[]): string {
  return slugParts.join("/")
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug: slugParts } = await params
  const slug = slugFromParams(slugParts)
  const page = findDocPage(slug)
  if (!page) return {}

  const { body } = getDocSource(slug)
  const description =
    body
      .split("\n")
      .find((line) => line.trim().length > 20 && !line.startsWith("#") && !line.startsWith("```"))
      ?.slice(0, 160)
      ?.trim() || `${page.title} — Official Wizard documentation guide.`

  return {
    title: page.title,
    description,
    alternates: {
      canonical: `/docs/${slug}`,
    },
    openGraph: {
      title: `${page.title} · Wizard Documentation`,
      description,
      url: `https://wizardw2.vercel.app/docs/${slug}`,
    },
  }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugParts } = await params
  const slug = slugFromParams(slugParts)
  const page = findDocPage(slug)
  if (!page) notFound()

  const section = findSectionForSlug(slug)
  const { body } = getDocSource(slug)
  const headings = extractHeadings(body)
  const { prev, next } = getAdjacentPages(slug)

  return (
    <div className="flex items-start gap-8 lg:gap-12 xl:gap-16">
      <article className="min-w-0 max-w-3xl flex-1 py-8 lg:py-10 pl-0 lg:pl-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-mono text-xs text-white/50">
          <Link href="/docs" className="transition-colors hover:text-white">
            Docs
          </Link>
          {section && (
            <>
              <ChevronRight className="h-3 w-3 text-white/30" />
              <span>{section.title}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-white/30" />
          <span className="text-[#eca8d6] font-medium">{page.title}</span>
        </nav>

        <Reveal key={slug}>
          <DocContent markdown={body} />
        </Reveal>

        {/* Edit on GitHub link */}
        <div className="mt-14 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/40">
          <span>Reviewed for Wizard v1.0.8</span>
          <a
            href={`${DOCS_EDIT_BASE_URL}/${slug}.md`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-white/50 transition-colors hover:text-white"
          >
            Edit this page on GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Prev / Next navigation cards */}
        <Reveal delay={100} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/docs/${prev.slug}`}
              className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-[#eca8d6]/50 hover:bg-white/[0.04]"
            >
              <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-white/40 group-hover:text-[#eca8d6]">
                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                Previous
              </span>
              <span className="mt-1.5 font-display text-sm font-medium text-white/90 group-hover:text-white">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/docs/${next.slug}`}
              className="group flex flex-col items-end text-right rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-[#eca8d6]/50 hover:bg-white/[0.04]"
            >
              <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-white/40 group-hover:text-[#eca8d6]">
                Next
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="mt-1.5 font-display text-sm font-medium text-white/90 group-hover:text-white">
                {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </Reveal>
      </article>

      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto py-8 pl-6 border-l border-white/5 xl:block [scrollbar-width:thin]">
        <DocsToc headings={headings} />
      </aside>
    </div>
  )
}
