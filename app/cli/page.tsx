import type { Metadata } from "next"
import Link from "next/link"
import { Navigation } from "@/components/landing/navigation"
import { FooterSection } from "@/components/landing/footer-section"
import { CopyCommand } from "@/components/copy-command"
import { Reveal } from "@/components/reveal"
import { Terminal, Shield, Cpu, RefreshCw, Zap, Layers, AlertCircle, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Enterprise CLI Reference — wizard",
  description: "Complete command-line interface specification for Wizard: init, start, stop, doctor, status, attach, logs, update, uninstall, delete, skills and version.",
  alternates: {
    canonical: "/cli",
  },
}

const CLI_COMMANDS = [
  {
    command: "wizard init",
    badge: "Lifecycle",
    summary: "Guided first-run setup: choose a provider and models, check prerequisites, install dependencies.",
    description:
      "On a terminal it is interactive: menus you move through with the arrow keys, an API key field that shows one bullet per character (never the key), and model lists fetched from your provider so you never type a model name or a URL. Python 3.12+, Node 20+, uv and pnpm are minimums, so any newer version you already have is used; only missing tools are installed. Scripts use --non-interactive.",
    flags: [
      { flag: "--provider <name>", desc: "Default provider (ollama, lmstudio, anthropic, openai, gemini, custom_gateway)" },
      { flag: "--data-mode <mode>", desc: "Data residency policy (local-only, hybrid, cloud-only)" },
      { flag: "--manager-model <name>", desc: "Model for the manager role (skips the picker)" },
      { flag: "--worker-model <name>", desc: "Model for the worker role (skips the picker)" },
      { flag: "--embedding-provider <name>", desc: "Provider for embeddings (ollama, lmstudio, openai, gemini, custom_gateway)" },
      { flag: "--embedding-model <model>", desc: "Embedding model (e.g. nomic-embed-text, gemini-embedding-001, text-embedding-3-small)" },
      { flag: "--gemini-key / --anthropic-key / --openai-key / --lmstudio-key <key>", desc: "Write that provider's API key to backend/.env" },
      { flag: "--gateway-url <url> / --gateway-key <key>", desc: "Endpoint and bearer token for a custom OpenAI-compatible gateway" },
      { flag: "--base-url <url>", desc: "Point --provider at a proxy instead of its official endpoint" },
      { flag: "--interactive", desc: "Force the guided prompts even when other flags are given" },
      { flag: "--non-interactive", desc: "Never prompt; for CI and scripted installs (no network lookups)" },
      { flag: "--install-prerequisites", desc: "Install missing Python, Node.js, uv and pnpm without asking" },
      { flag: "--no-install-prerequisites", desc: "Only check prerequisites; never install" },
      { flag: "--pull-models", desc: "Also pull a default manager, worker and embedding model through Ollama" },
    ],
  },
  {
    command: "wizard start",
    badge: "Supervisor",
    summary: "Launches the backend and frontend in the background and opens the browser.",
    description:
      "Starts the detached supervisor, waits until the backend answers healthy, checks its API version against this binary, then opens the workspace. Ports are validated (1-65535).",
    flags: [
      { flag: "--backend-port <port>", desc: "Backend port (default 8000)" },
      { flag: "--frontend-port <port>", desc: "Frontend port (default 3000)" },
      { flag: "--no-browser", desc: "Do not open a browser once healthy" },
      { flag: "--timeout <seconds>", desc: "How long to wait for the backend to become healthy (default 90)" },
    ],
  },
  {
    command: "wizard stop",
    badge: "Supervisor",
    summary: "Stops the background services.",
    description:
      "Idempotent. Asks the supervisor to stop and waits for it to clean up; falls back to a forced stop of the recorded processes if it does not exit in time.",
    flags: [],
  },
  {
    command: "wizard doctor",
    badge: "Diagnostics",
    summary: "Checks this installation and tells you how to fix what is wrong.",
    description:
      "A read-only report with PASS, WARN or FAIL for the version, platform, install method, whether wizard is on your PATH, the bundled files, the settings directory, Python, Node, uv and pnpm, your configuration and credentials, and the running service. It works even when the bundled files cannot be found. Exits 3 if a check fails.",
    flags: [
      { flag: "--json", desc: "Print the report as JSON, for scripts and support tickets" },
      { flag: "--network", desc: "Also test GitHub Releases and your configured model provider" },
    ],
  },
  {
    command: "wizard status",
    badge: "Diagnostics",
    summary: "Shows what is running and the active configuration.",
    description:
      "Daemon, backend and frontend state, log sizes, API_PROVIDER, DATA_MODE and EXECUTION_BACKEND, plus the backend's own /api/config (host sizing, sandbox capability) when it answers.",
    flags: [],
  },
  {
    command: "wizard attach",
    badge: "Observability",
    summary: "Follows the backend and frontend logs live.",
    description: "Prints status, then streams both logs with source prefixes until Ctrl+C. Read-only.",
    flags: [],
  },
  {
    command: "wizard logs",
    badge: "Observability",
    summary: "Prints log file locations and recent output.",
    description: "A one-shot look at where the logs are and, with --tail, their last lines.",
    flags: [
      { flag: "--tail <N>", desc: "Also print the last N lines of each log" },
    ],
  },
  {
    command: "wizard update",
    badge: "Lifecycle",
    summary: "Updates Wizard, using the right mechanism for how it was installed.",
    description:
      "For an installer-managed install it checks GitHub Releases, verifies the archive's SHA-256, stages and prepares the new release, then switches over, keeping the previous one for rollback. A git checkout uses git pull --ff-only. It never overwrites files a package manager owns: on Homebrew or Scoop it prints the command to run (brew upgrade wizard, scoop update wizard).",
    flags: [
      { flag: "--check", desc: "Only report whether a newer release exists" },
      { flag: "--self", desc: "Force the release-install update path" },
    ],
  },
  {
    command: "wizard uninstall",
    badge: "Lifecycle",
    summary: "Removes Wizard; --purge removes everything.",
    description:
      "Removes what the official installer created (program, shell startup entries, and on Windows the user PATH entry) and keeps your settings, keys and logs, backing up backend/.env. With --purge it also deletes your data, and lists exactly what it will remove before asking. It refuses git checkouts and package-manager installs, and prints brew uninstall wizard or scoop uninstall wizard instead.",
    flags: [
      { flag: "--purge, --all", desc: "Also delete settings, API keys, logs and the Python environment" },
      { flag: "--yes", desc: "Skip the confirmation prompt (unattended runs without it are refused)" },
    ],
  },
  {
    command: "wizard delete",
    badge: "Lifecycle",
    summary: "Stops Wizard and deletes its data; the program stays installed.",
    description:
      "Removes user configuration, credentials, connections, skills, logs, the managed virtualenv and backend/.env, after confirmation.",
    flags: [
      { flag: "--yes", desc: "Skip confirmation; useful for automation" },
      { flag: "--keep-env", desc: "Keep backend/.env while removing other managed state" },
    ],
  },
  {
    command: "wizard skills",
    badge: "Ecosystem",
    summary: "Manages modular analytical skills and domain playbooks.",
    description:
      "Fronts the skill engine with a preview of exactly what will be installed and commit pinning.",
    flags: [
      { flag: "list", desc: "Lists all installed skills, source repositories, and active tiers" },
      { flag: "add <url>", desc: "Installs a remote skill repository with a preview and commit pinning" },
      { flag: "update <name>", desc: "Updates an installed skill to the latest remote revision" },
      { flag: "discard <name>", desc: "Discards local modifications to an installed skill" },
      { flag: "remove <name>", desc: "Removes a skill package" },
      { flag: "token <token>", desc: "Saves a GitHub personal access token for private skill repositories" },
    ],
  },
  {
    command: "wizard version",
    badge: "Metadata",
    summary: "Prints the CLI version and the backend API it targets.",
    description: "For example: wizard CLI v1.0.14, backend API compat v4.0.0. Makes no network request; use wizard update --check to look for a newer release.",
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
    command: "wizard init --provider gemini --gemini-key <your-gemini-key> --data-mode cloud-only",
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
  { code: "0", name: "SUCCESS", description: "The command succeeded (including --help)." },
  { code: "1", name: "FAILURE", description: "Any other runtime failure. Run wizard doctor for a diagnosis." },
  { code: "2", name: "USAGE", description: "A bad command line or an invalid value, such as a stray argument or a port outside 1-65535." },
  { code: "3", name: "ENVIRONMENT", description: "A required tool is missing or the installation is broken. wizard doctor says what to fix." },
  { code: "4", name: "NETWORK", description: "A release lookup or download failed. Check your connection or set HTTPS_PROXY." },
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
              <div className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Global Installation via Homebrew (macOS, Linux)</div>
              <div className="text-sm text-white/80 font-medium">Install Wizard globally with a single command</div>
            </div>
            <div className="w-full sm:w-auto">
              <CopyCommand command="brew install Wizard-AIA/wizard/wizard" />
            </div>
          </div>
        </Reveal>

        {/* Subcommands list */}
        <div className="mt-16">
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display text-white">Command Reference</h2>
              <span className="text-xs font-mono text-white/40">{CLI_COMMANDS.length} Subcommands</span>
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
