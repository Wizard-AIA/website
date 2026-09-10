import type { Metadata } from "next"
import Link from "next/link"
import { Navigation } from "@/components/landing/navigation"
import { FooterSection } from "@/components/landing/footer-section"
import { CopyCommand } from "@/components/copy-command"
import { Reveal } from "@/components/reveal"
import { Terminal, Shield, Cpu, RefreshCw, Zap, Layers, AlertCircle, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Enterprise CLI Reference — wizard",
  description: "Complete command-line interface specification for Wizard: init, start, stop, doctor, attach, logs, update, skills, and environment orchestration.",
  alternates: {
    canonical: "/cli",
  },
}

const CLI_COMMANDS = [
  {
    command: "wizard init",
    badge: "Lifecycle",
    summary: "Guides first-run configuration, verifies toolchain, creates virtualenv, and compiles workbenches.",
    description:
      "Validates Python 3.12+, Node 20+, uv, pnpm, and optional Ollama/Docker. Copies backend/.env.example if missing, builds the Next.js production frontend bundle, and registers service defaults.",
    flags: [
      { flag: "--provider <name>", desc: "Primary LLM provider (ollama, lmstudio, gemini, anthropic, openai, custom_gateway)" },
      { flag: "--data-mode <mode>", desc: "Data residency policy (local-only, hybrid, cloud-only)" },
      { flag: "--embedding-provider <name>", desc: "Provider for vector embeddings (ollama, gemini, openai, custom_gateway, fastembed)" },
      { flag: "--embedding-model <model>", desc: "Model identifier for vector embeddings (e.g. nomic-embed-text, gemini-embedding-001, text-embedding-3-small)" },
      { flag: "--gemini-key <key>", desc: "Sets Google Gemini API key" },
      { flag: "--anthropic-key <key>", desc: "Sets Anthropic Claude API key" },
      { flag: "--openai-key <key>", desc: "Sets OpenAI API key" },
      { flag: "--gateway-url <url>", desc: "Endpoint URL for custom OpenAI-compatible gateway (Groq, vLLM, OpenRouter)" },
      { flag: "--gateway-key <key>", desc: "Bearer authorization token for custom gateway" },
      { flag: "--interactive", desc: "Forces guided prompts for provider, privacy, models, embeddings, and credentials" },
      { flag: "--non-interactive", desc: "Disables prompts for CI and scripted installs" },
      { flag: "--lmstudio-key <key>", desc: "Sets LM Studio API key" },
      { flag: "--pull-models", desc: "Triggers automated background pull of default reasoning, coding & embedding weights via Ollama" },
      { flag: "--skip-frontend", desc: "Skips Node.js dependency installation and frontend bundle compilation" },
      { flag: "--skip-backend", desc: "Skips Python virtualenv creation and package installation" },
    ],
  },
  {
    command: "wizard start",
    badge: "Supervisor",
    summary: "Spawns detached background supervisor, starts control plane & frontend, and opens the browser.",
    description:
      "Spawns the detached supervisor daemon (__supervise). Polls backend readiness, performs API compatibility handshakes, rotates logs at 10MB bounds, and forwards OS signals.",
    flags: [
      { flag: "--backend-port <port>", desc: "Overrides backend control plane port (default: 8000)" },
      { flag: "--frontend-port <port>", desc: "Overrides analytics workbench port (default: 3000)" },
      { flag: "--no-browser", desc: "Suppresses automatic browser launch upon successful boot" },
      { flag: "--provider <name>", desc: "Overrides active LLM provider for this execution run" },
      { flag: "--data-mode <mode>", desc: "Overrides privacy data mode for this execution run" },
      { flag: "--embedding-provider <name>", desc: "Overrides active embedding provider for this execution run" },
      { flag: "--embedding-model <model>", desc: "Overrides active embedding model for this execution run" },
    ],
  },
  {
    command: "wizard delete",
    badge: "Lifecycle",
    summary: "Stops services and removes Wizard-managed local state safely.",
    description:
      "Requests confirmation in a terminal, then removes user configuration, credentials, connections, skills, logs, managed virtualenv, and backend/.env while preserving the installed checkout and CLI binary.",
    flags: [
      { flag: "--yes", desc: "Skip confirmation; useful for automation" },
      { flag: "--keep-env", desc: "Preserve backend/.env while removing other managed state" },
    ],
  },
  {
    command: "wizard stop",
    badge: "Supervisor",
    summary: "Gracefully terminates all background services and execution daemons.",
    description:
      "Idempotent process cleanup. Sends SIGTERM to supervisor and process groups; falls back to forced termination of recorded PIDs if processes fail to exit within deadline.",
    flags: [],
  },
  {
    command: "wizard doctor",
    badge: "Diagnostics",
    summary: "Performs full operational health audit and diagnostics check.",
    description:
      "Inspects supervisor PID files, active network listeners, log disk usage, OS kernel sandbox enforcement (Landlock, seccomp, Apple Seatbelt), and live backend /api/config state.",
    flags: [],
  },
  {
    command: "wizard status",
    badge: "Diagnostics",
    summary: "Alias for wizard doctor. Reports cluster state and active configurations.",
    description: "Renders active service status, uptime, PID mapping, and data mode policies.",
    flags: [],
  },
  {
    command: "wizard attach",
    badge: "Observability",
    summary: "Multiplexes and live-streams backend and frontend logs to terminal.",
    description:
      "Connects to rotating log streams, rendering real-time colored output with source prefixes (backend/frontend) until Ctrl+C.",
    flags: [],
  },
  {
    command: "wizard logs",
    badge: "Observability",
    summary: "Prints log file paths and dumps recent output lines.",
    description: "One-shot diagnostic tool to inspect log locations and recent crash/event markers.",
    flags: [
      { flag: "--tail <N>", desc: "Outputs the last N lines across backend.log and frontend.log" },
    ],
  },
  {
    command: "wizard update",
    badge: "Lifecycle",
    summary: "Pulls latest Git revisions, updates dependencies, and restarts services.",
    description:
      "Executes git pull --ff-only, updates lockfile dependencies via uv/pnpm, verifies compatibility targets, and restarts active supervisor daemons.",
    flags: [],
  },
  {
    command: "wizard skills",
    badge: "Ecosystem",
    summary: "Manages modular corporate analytical skills and domain playbooks.",
    description:
      "Fronts the declarative skill engine with static AST security verification and commit pinning.",
    flags: [
      { flag: "list", desc: "Lists all installed skills, source repositories, and active tiers" },
      { flag: "add <url>", desc: "Installs a remote skill repository with AST preview and commit pinning" },
      { flag: "update <name>", desc: "Updates an installed skill to latest remote revision" },
      { flag: "discard <name>", desc: "Discards local modifications to an installed skill" },
      { flag: "remove <name>", desc: "Safely uninstalls and deletes a skill package" },
      { flag: "token <token>", desc: "Saves GitHub Personal Access Token for private enterprise skill repos" },
    ],
  },
  {
    command: "wizard env",
    badge: "Configuration",
    summary: "Validates and displays resolved runtime configuration settings.",
    description: "Inspects effective environment settings across .env, system environment, and credentials store.",
    flags: [],
  },
  {
    command: "wizard version",
    badge: "Metadata",
    summary: "Outputs CLI binary version, build hash, and backend API target.",
    description: "Displays compile-time compatibility markers (e.g. wizard CLI, backend API compat v4.0.0).",
    flags: [],
  },
]

const SETUP_RECIPES = [
  {
    name: "100% Air-Gapped / Local-Only",
    icon: Shield,
    tagline: "Zero data egress. Hard barrier against cloud endpoints.",
    command: "wizard init --data-mode local-only --provider ollama --pull-models",
    notes: "Requires local Ollama or LM Studio instance. Automatically pulls reasoning & coding models.",
  },
  {
    name: "Cloud-Native (Gemini / Claude / OpenAI)",
    icon: Zap,
    tagline: "Frontier cloud intelligence with telemetry tracking.",
    command: "wizard init --provider gemini --gemini-key AQ.Ab8RN6... --data-mode cloud-only",
    notes: "Dispatches planning and code generation directly to Gemini 2.5 Flash with sub-second latency.",
  },
  {
    name: "Enterprise Hybrid Mode",
    icon: Layers,
    tagline: "Cloud reasoning with strict row-level data redaction.",
    command: "wizard init --data-mode hybrid --anthropic-key sk-ant-... --provider anthropic",
    notes: "Raw datasets remain strictly on host; only masked schemas and metadata reach the cloud manager.",
  },
  {
    name: "Custom OpenAI-Compatible Gateway",
    icon: Cpu,
    tagline: "Connect Groq, Together AI, OpenRouter, vLLM, or internal corporate LLM gateways.",
    command: "wizard init --provider custom_gateway --gateway-url https://api.groq.com/openai/v1 --gateway-key gsk_...",
    notes: "Supports any endpoint implementing the standard OpenAI chat completions wire protocol.",
  },
]

const EXIT_CODES = [
  { code: "0", name: "SUCCESS", description: "Operation completed successfully." },
  { code: "1", name: "GENERAL_ERROR", description: "Operational or runtime error. Inspect wizard doctor for root cause." },
  { code: "2", name: "PORT_CONFLICT", description: "Port 8000 or 3000 is occupied by an external process." },
  { code: "3", name: "DEPENDENCY_MISSING", description: "Required prerequisite (Python 3.12, Node 20, or uv) was not found on PATH." },
]

export default function CliPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation />

      <section className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-12 pt-32 sm:pt-40 pb-24">
        {/* Header */}
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-[#eca8d6] mb-6">
            <Terminal className="w-3.5 h-3.5" />
            CLI Reference Manual v4.0.0
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display tracking-tight mb-4 text-white">
            The wizard CLI.
          </h1>
          <p className="text-lg text-white/60 max-w-2xl leading-relaxed">
            A single static Go binary that manages the backend control plane, Python sandboxes, and Next.js workbenches as background services across macOS, Linux, and Windows.
          </p>
        </Reveal>

        {/* Installation banner */}
        <Reveal className="mt-10 p-5 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Global Installation via Homebrew</div>
              <div className="text-sm text-white/80 font-medium">Install Wizard globally with a single command</div>
            </div>
            <div className="w-full sm:w-auto">
              <CopyCommand command="brew tap Wizard-AIA/wizard && brew install wizard" />
            </div>
          </div>
        </Reveal>

        {/* Subcommands list */}
        <div className="mt-16">
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display text-white">Command Reference</h2>
              <span className="text-xs font-mono text-white/40">12 Subcommands</span>
            </div>
          </Reveal>
          
          <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/10 bg-black/40">
            {CLI_COMMANDS.map((cmd, i) => (
              <Reveal key={cmd.command} delay={i * 30} as="div" className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <code className="text-base font-mono font-semibold text-[#eca8d6] bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    {cmd.command}
                  </code>
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/60">
                    {cmd.badge}
                  </span>
                </div>
                <div className="text-sm font-medium text-white/90 mb-1.5">{cmd.summary}</div>
                <p className="text-sm text-white/60 leading-relaxed mb-4">{cmd.description}</p>
                
                {cmd.flags && cmd.flags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-2">Flags &amp; Options</div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {cmd.flags.map((f) => (
                        <div key={f.flag} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 text-xs">
                          <code className="font-mono text-white/90 shrink-0 font-medium">{f.flag}</code>
                          <span className="text-white/50">{f.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>

        {/* Setup recipes */}
        <div className="mt-20">
          <Reveal>
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-[#eca8d6]" />
              <h2 className="text-2xl font-display text-white">Production Deployment Recipes</h2>
            </div>
            <p className="text-sm text-white/60 mb-8 max-w-xl">
              One-line configuration recipes to initialize Wizard for strict air-gapped security, enterprise cloud providers, or custom internal model gateways.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6">
            {SETUP_RECIPES.map((recipe, i) => {
              const Icon = recipe.icon
              return (
                <Reveal key={recipe.name} delay={i * 50} className="p-6 rounded-xl border border-white/10 bg-black/50 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#eca8d6]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{recipe.name}</h3>
                      <div className="text-xs text-white/50">{recipe.tagline}</div>
                    </div>
                  </div>
                  <div className="my-3.5">
                    <CopyCommand command={recipe.command} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#eca8d6]" />
                    <span>{recipe.notes}</span>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* Exit codes */}
        <div className="mt-20">
          <Reveal>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-[#eca8d6]" />
              <h2 className="text-2xl font-display text-white">Exit Codes &amp; Automation</h2>
            </div>
            <p className="text-sm text-white/60 mb-6">
              Standard POSIX exit codes returned by the CLI binary for CI/CD scripting and container health checks.
            </p>
          </Reveal>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr className="text-left text-xs font-mono uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {EXIT_CODES.map((row) => (
                  <tr key={row.code}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#eca8d6]">{row.code}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/80">{row.name}</td>
                    <td className="px-4 py-3 text-xs text-white/60">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer links */}
        <Reveal className="mt-20 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/docs/getting-started/cli"
            className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
          >
            Deep CLI Architecture &amp; Supervisor Docs →
          </Link>
          <Link
            href="/docs/reference/configuration"
            className="text-sm font-medium text-white/50 hover:text-white transition-colors"
          >
            Complete .env Configuration Matrix →
          </Link>
        </Reveal>
      </section>

      <FooterSection />
    </main>
  )
}
