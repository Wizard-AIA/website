"use client"

import { useState } from "react"
import { Check, Copy, Terminal, Layers, FileCode } from "lucide-react"

export function DocCodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const isDiagram =
    ["diagram", "ascii", "flowchart", "mermaid", "topology"].includes(language.toLowerCase()) ||
    /[┌─│└┘▼▲├┤┼►]/.test(code) ||
    /├──|└──/.test(code)

  const isShell = ["bash", "sh", "zsh", "shell"].includes(language.toLowerCase())

  const handleCopy = async () => {
    try {
      const cleanCode = isShell ? code.replace(/^\$\s+/gm, "") : code
      await navigator.clipboard.writeText(cleanCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard fallback
    }
  }

  if (isDiagram) {
    return (
      <div className="group relative my-8 w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-white/15 bg-[#07090e] shadow-2xl">
        {/* Diagram Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-mono">
          <div className="flex items-center gap-2 text-white/70">
            <Layers className="h-4 w-4 text-[#eca8d6]" />
            <span className="uppercase tracking-wider text-[11px] font-semibold text-white/90">
              System Architecture &amp; Flow
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Spec
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Copy diagram"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#eca8d6]" />
                  <span className="text-[#eca8d6]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diagram Monospace Canvas with Blueprint Grid */}
        <div className="w-full max-w-full overflow-x-auto p-4 sm:p-6 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:20px_20px]">
          <pre
            className="font-mono text-[12px] sm:text-[13px] leading-[1.32] tracking-normal text-white/95 whitespace-pre selection:bg-[#eca8d6]/30 font-normal m-0"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontVariantLigatures: "none",
            }}
          >
            <code>{code}</code>
          </pre>
        </div>
      </div>
    )
  }

  const lines = code.split("\n")

  return (
    <div className="group relative my-6 w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3.5 sm:px-4 py-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-white/50">
          {isShell ? (
            <Terminal className="h-3.5 w-3.5 text-[#eca8d6]" />
          ) : (
            <FileCode className="h-3.5 w-3.5 text-[#eca8d6]" />
          )}
          <span className="uppercase tracking-wider text-[10px] sm:text-[11px] font-semibold text-white/60">
            {language || "code"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#eca8d6]" />
              <span className="text-[#eca8d6]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="w-full max-w-full overflow-x-auto p-3.5 sm:p-4 text-[12.5px] sm:text-[13.5px] font-mono leading-relaxed text-white/90">
        <pre
          className="whitespace-pre m-0"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          <code>
            {lines.map((line, idx) => {
              const isComment = line.trim().startsWith("#") || line.trim().startsWith("//")
              return (
                <div key={idx} className={isComment ? "text-white/40 italic" : ""}>
                  {line || " "}
                </div>
              )
            })}
          </code>
        </pre>
      </div>
    </div>
  )
}
