import type { ReactNode } from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { slugifyHeading } from "@/lib/docs-content"
import { DocCodeBlock } from "@/components/docs/doc-code-block"

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textContent).join("")
  if (node && typeof node === "object" && "props" in node) {
    return textContent((node as { props: { children?: ReactNode } }).props.children)
  }
  return ""
}

function heading(level: 2 | 3 | 4) {
  const Tag = level === 2 ? "h2" : level === 3 ? "h3" : "h4"
  const className =
    level === 2
      ? "mt-14 mb-4 scroll-mt-24 font-display text-2xl lg:text-3xl font-semibold tracking-tight text-white pb-3 border-b border-white/10 first:mt-0"
      : level === 3
      ? "mt-9 mb-3 scroll-mt-24 font-display text-xl font-medium tracking-tight text-white/95"
      : "mt-7 mb-2 text-base font-semibold tracking-tight text-white/90"

  return function DocHeading({ children }: { children?: ReactNode }) {
    const id = slugifyHeading(textContent(children))
    return (
      <Tag id={id} className={className}>
        {children}
      </Tag>
    )
  }
}

export function DocContent({ markdown }: { markdown: string }) {
  return (
    <div className="doc-prose w-full max-w-full min-w-0 overflow-hidden break-words text-[15px] sm:text-[15.5px] leading-[1.75] text-white/80 font-normal">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 font-display text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
              {children}
            </h1>
          ),
          h2: heading(2),
          h3: heading(3),
          h4: heading(4),
          p: ({ children }) => <p className="mb-5 leading-[1.75] text-white/80">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-6 ml-6 list-disc space-y-2 text-white/80 marker:text-white/30">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 ml-6 list-decimal space-y-2 text-white/80 marker:text-white/40 font-normal">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1 leading-[1.7]">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          hr: () => <hr className="my-10 border-white/10" />,
          blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-r-lg border-l-2 border-[#eca8d6] bg-white/[0.03] py-3.5 pl-4 pr-5 text-[15px] italic text-white/75">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => {
            const isExternal = /^https?:\/\//.test(href ?? "")
            if (isExternal) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#eca8d6] underline underline-offset-4 decoration-[#eca8d6]/30 transition-colors hover:text-white hover:decoration-white"
                >
                  {children}
                </a>
              )
            }
            return (
              <Link
                href={href ?? "#"}
                className="font-medium text-[#eca8d6] underline underline-offset-4 decoration-[#eca8d6]/30 transition-colors hover:text-white hover:decoration-white"
              >
                {children}
              </Link>
            )
          },
          table: ({ children }) => (
            <div className="my-7 overflow-x-auto rounded-xl border border-white/10 bg-black/40 shadow-sm">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-white/90">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-white/90">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-t border-white/5 px-4 py-3 align-top text-white/75 leading-relaxed">
              {children}
            </td>
          ),
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const raw = String(children).replace(/\n$/, "")
            const match = /language-(\w+)/.exec(className ?? "")
            const isBlock = Boolean(match) || raw.includes("\n") || /[┌─│└┘▼▲├┤┼►]/.test(raw) || /├──|└──/.test(raw)

            if (!isBlock) {
              return (
                <code className="rounded-md border border-white/10 bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.875em] text-[#eca8d6] font-normal">
                  {children}
                </code>
              )
            }

            const language = match ? match[1] : /[┌─│└┘▼▲├┤┼►]/.test(raw) || /├──|└──/.test(raw) ? "diagram" : "text"
            return <DocCodeBlock code={raw} language={language} />
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
