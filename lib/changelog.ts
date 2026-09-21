// Structured release history — same facts as the GitHub releases, kept here
// as data so the /changelog page can render its own designed layout instead
// of linking out to GitHub for release notes.

export interface Release {
  version: string;
  tag: string; // GitHub release tag, for the optional "view on GitHub" link
  kind: "launch" | "feature" | "docs";
  title: string;
  date: string; // ISO date
  highlights: { title: string; body: string }[];
}

export const RELEASES: Release[] = [
  {
    version: "v1.0.15",
    tag: "v1.0.15",
    kind: "feature",
    title: "Uploads and Chat Stay in One Session",
    date: "2026-09-21",
    highlights: [
      {
        title: "No More \"I Need a Dataset\" After a Restart",
        body: "After a backend restart, a tab left open could upload your file to one session while the chat stayed attached to another, so asking about the file answered \"I need a dataset for that.\" The chat now follows the session your uploads went to.",
      },
      {
        title: "Running Turns Are Never Interrupted",
        body: "If the session changes mid-turn, the chat moves after the turn ends, including after Stop, after clearing the chat, or when a queued message is handed back.",
      },
      {
        title: "Other Tabs Count Too",
        body: "A session stored by another tab moves this tab's chat as well, and a session the server replaces mid-connection is adopted in one step. Reload an already open tab after upgrading so it loads the fix.",
      },
    ],
  },
  {
    version: "v1.0.14",
    tag: "v1.0.14",
    kind: "feature",
    title: "Chat That Answers What You Asked",
    date: "2026-09-21",
    highlights: [
      {
        title: "Hi Is Just Hi",
        body: "A greeting or a thank-you is one reply. Before, saying `hi` after an analysis planned, wrote code and ran it. Every message is now routed before any model runs, to the smallest workflow that serves it.",
      },
      {
        title: "Right-Sized Answers",
        body: "A question about your columns is answered from the data in one call, a single number is one code call and an answer, and a complex investigation keeps the full plan, loop and verification.",
      },
      {
        title: "Stop Means Stop",
        body: "Stop ends the turn and leaves the composer usable, typing \"stop\" cancels a running task, and a message sent mid-run comes back to the composer instead of failing it. Auto, Fast and Deep change how hard Wizard works, never what your message is.",
      },
      {
        title: "Cloud Models Work Out of the Box",
        body: "The OpenAI, Gemini, LM Studio, gateway and Anthropic clients ship with the base install, PDF and Word context documents work without an extra step, and `wizard init` no longer pulls in Redis and database drivers just to get a cloud client.",
      },
      {
        title: "Pre-Release Channel",
        body: "Opt in to beta builds with `wizard channel pre-release` or `wizard update --pre-release`. Stable installs, Homebrew, Scoop and this site only ever follow stable releases, and Wizard never downgrades.",
      },
      {
        title: "Safer Sessions",
        body: "One turn at a time per session on every transport, reviewers and chart descriptions follow your data policy, and code that never ran is no longer cached as an answer.",
      },
    ],
  },
  {
    version: "v1.0.13",
    tag: "v1.0.13",
    kind: "feature",
    title: "Installation, Upgrade & Setup Overhaul",
    date: "2026-09-20",
    highlights: [
      {
        title: "Homebrew Installs Again",
        body: "`brew install Wizard-AIA/wizard/wizard` failed on every Mac with a checksum error. Package metadata is now generated from each release's published checksums, so the formula can no longer drift from the archives.",
      },
      {
        title: "Updates That Work",
        body: "`wizard update` was rejected by its own checksum parser from v1.0.10 to v1.0.12. It now works, is package-manager aware (Homebrew and Scoop upgrade through their own commands), and restarts your service if an update fails.",
      },
      {
        title: "Clean Installers Everywhere",
        body: "One-line installers for macOS, Linux and Windows verify the archive checksum, set up PATH for zsh, bash, fish or PowerShell (keeping your existing entries), and are safe to run again.",
      },
      {
        title: "Guided Setup With Real Menus",
        body: "`wizard init` masks your API key with a receipt, lists only the models your provider actually offers, and uses arrow-key dropdowns instead of asking you to type model names or URLs.",
      },
      {
        title: "Use What You Already Have",
        body: "Python, Node.js, uv and pnpm requirements are minimums. Newer versions, and tools installed through nvm, fnm, Volta, asdf or mise, are used as they are; only missing tools are installed.",
      },
      {
        title: "Diagnose and Remove Cleanly",
        body: "`wizard doctor` reports what is wrong with a fix for each problem, `wizard uninstall` removes the program and its PATH entries, and `wizard uninstall --purge` removes your data too.",
      },
    ],
  },
  {
    version: "v1.0.12",
    tag: "v1.0.12",
    kind: "feature",
    title: "Windows Setup & Python Compatibility Fixes",
    date: "2026-09-11",
    highlights: [
      {
        title: "Reliable Windows Setup",
        body: "Wizard now refreshes user and system PATH values after Winget installs and checks common Python, uv, pnpm, and Winget locations in the same setup run.",
      },
      {
        title: "Reuse Compatible Python",
        body: "Any usable Python 3.12 or newer, including Python 3.13 and 3.14, is reused instead of being replaced with a separate 3.12 installation.",
      },
      {
        title: "Store Alias Recovery",
        body: "The Windows Python launcher and versioned interpreters such as python3.14 are detected even when the Microsoft Store App Execution Alias shadows python3.exe.",
      },
    ],
  },
  {
    version: "v1.0.11",
    tag: "v1.0.11",
    kind: "feature",
    title: "Release Reliability & Data Integrity Fixes",
    date: "2026-09-10",
    highlights: [
      {
        title: "Reliable Packaged Setup",
        body: "Cloud and hybrid release archives now include optional provider dependencies, while daemon status, duplicate-start protection, and clean shutdown work reliably.",
      },
      {
        title: "Safer Configuration",
        body: "Interactive API-key entry is hidden, saved embedding models can be cleared, and release metadata is synchronized across installers and platforms.",
      },
      {
        title: "Correct Data Handling",
        body: "Currency-formatted values are normalized deterministically before automatic cleaning so existing financial amounts are preserved.",
      },
    ],
  },
  {
    version: "v1.0.10",
    tag: "v1.0.10",
    kind: "feature",
    title: "Verified CLI Updates & Production Readiness",
    date: "2026-09-07",
    highlights: [
      {
        title: "Verified Release Updates",
        body: "wizard update --check reports new releases. Managed installations stage a platform package, verify its SHA-256 checksum, and only then activate it while retaining the prior package for rollback.",
      },
      {
        title: "Production Readiness Controls",
        body: "Release gates add sandbox readiness checks, bounded request telemetry, backup lifecycle controls, feature kill switches, scoped cache isolation, and fail-safe runtime fallback.",
      },
      {
        title: "Traceable Retrieval",
        body: "Hybrid document retrieval now exposes source-aware citations and retrieval provenance for grounded answers.",
      },
    ],
  },
  {
    version: "v1.0.9",
    tag: "v1.0.9",
    kind: "feature",
    title: "Interactive Setup, Global Installation & Safe Workspace Cleanup",
    date: "2026-09-07",
    highlights: [
      {
        title: "Interactive First-Run Configuration",
        body: "Running wizard init now guides you through provider, privacy mode, manager and worker models, embeddings, endpoints, and API credentials. Explicit flags and --non-interactive remain available for automation.",
      },
      {
        title: "Install Once, Run Anywhere",
        body: "Linux and Windows installers persist the bundled checkout root, while the CLI resolves Homebrew and packaged layouts automatically. After installation, wizard init and wizard start work from any directory.",
      },
      {
        title: "Guarded Local Cleanup",
        body: "The new wizard delete command stops services and removes Wizard-managed local state with confirmation, --yes, and --keep-env controls while leaving the installed checkout and binary intact.",
      },
    ],
  },
  {
    version: "v1.0.8",
    tag: "v1.0.8",
    kind: "feature",
    title: "Systemic Execution Resilience, Pure Python Contracts & Autonomous Diagnostics",
    date: "2026-09-06",
    highlights: [
      {
        title: "Pristine Execution Engine & Monkeypatch Elimination",
        body: "Purged all dynamic runtime monkeypatches from the Python execution engine, establishing a clean runtime where pandas/Polars methods, scikit-learn models, and statsmodels wrappers execute against pure, standard library contracts.",
      },
      {
        title: "Universal Code Generation Invariants",
        body: "Hardened code synthesis prompts with systemic engineering rules: explicit numeric casting for dirty datasets, automated NaN/inf replacement, robust 2D/1D coefficient shape flattening, and zero-assumption API contracts.",
      },
      {
        title: "Context-Enriched Self-Correction & Deep Diagnostics",
        body: "Supercharged autonomous error recovery with failed code traces and live runtime diagnostic introspection, allowing the agent to autonomously diagnose and self-repair edge cases across complex multi-step analytical plans without human intervention.",
      },
    ],
  },
  {
    version: "v1.0.7",
    tag: "v1.0.7",
    kind: "feature",
    title: "Markdown Data Tables, Gemini Flash Model Prioritization & Self-Healing WebSockets",
    date: "2026-08-30",
    highlights: [
      {
        title: "Markdown Table Rendering Engine",
        body: "Fixed table parser boundary detection to render summary statistics, data quality triage matrices, and distribution metrics into interactive, zebra-striped data tables with tabular numeric fonts.",
      },
      {
        title: "Gemini Flash Model Prioritization",
        body: "Default model suggestions now prioritize high-capacity gemini-2.5-flash and gemini-3.7-flash models for all roles, providing seamless zero-friction analysis on standard Google AI Studio free tier keys.",
      },
      {
        title: "Intelligent LLM Error Sanitization & Self-Healing WebSockets",
        body: "Replaced raw JSON exception dumps with human-readable guidance and retry timers. WebSocket connections automatically mint fresh sessions on reconnect, eliminating stale token loops.",
      },
    ],
  },
  {
    version: "v1.0.6",
    tag: "v1.0.6",
    kind: "feature",
    title: "Tri-Model System (Manager, Worker, Embeddings), Hybrid Search & Enterprise SRE Hardening",
    date: "2026-08-30",
    highlights: [
      {
        title: "Tri-Model Architecture & User Embedding Choices",
        body: "Elevated Embeddings into a first-class model pillar alongside Manager and Worker. Users can configure embedding models across Local (Ollama/LM Studio), Hybrid (schema-redacted), and Cloud (OpenAI/Gemini/Gateway) topologies, with automatic zero-disk deterministic Blake2b hashing fallback and dedicated CLI flags (--embedding-provider, --embedding-model).",
      },
      {
        title: "Dynamic Hybrid Vector & BM25 Search Engine",
        body: "Integrated sqlite-vec KNN cosine embeddings with FTS5 BM25 keyword search using Reciprocal Rank Fusion (RRF), batched chunk vectorization, FlashRank Cross-Encoder reranking, and single-flight cache stampede protection.",
      },
      {
        title: "Enterprise SRE Health & Resumable DAG Architecture",
        body: "Added Kubernetes-ready /health/live and /health/ready probes, W3C OpenTelemetry distributed tracing, Prometheus metrics (/metrics with TTFT and p50/p90/p95/p99 latency quantiles), Redis Pub/Sub session bus, Server-Sent Events (SSE) streaming fallback, and a stateful resumable DAG agent architecture.",
      },
    ],
  },
  {
    version: "v1.0.5",
    tag: "v1.0.5",
    kind: "feature",
    title: "Data Preview Fix, Universal Model Filtering & Settings Environment Controls",
    date: "2026-08-28",
    highlights: [
      {
        title: "Dataset preview 'No rows to show' fix",
        body: "Corrected PyArrow schema inference that silently aborted Arrow IPC streaming for datasets with string columns. Schema is now derived from actual data rows instead of empty slices, and the DataGrid loading state prevents empty-state flash.",
      },
      {
        title: "Universal cloud model filtering",
        body: "Added intelligent model filtering that excludes TTS, image/video generation, embeddings, robotics, and other non-chat endpoints from cloud providers. Gemini model list reduced from 54 raw models to 18 usable chat/coding/reasoning models with proper capability tagging.",
      },
      {
        title: "Comprehensive settings environment controls",
        body: "Added full UI controls for API Provider, Data Mode, Gateway URL/Key, Sandbox Timeout, Council Review, Vision Analysis, Context Documents, and Skills toggles — all with atomic persistence to the backend .env file.",
      },
    ],
  },
  {
    version: "v1.0.4",
    tag: "v1.0.4",
    kind: "feature",
    title: "Persistent Workspace Context, Live Datasets Sidebar & Interactive Settings Workbench",
    date: "2026-08-28",
    highlights: [
      {
        title: "Global persistent workspace context",
        body: "Elevated the chat streaming state, WebSocket transport, investigation trail, and dataset state to the root WorkspaceProvider. Tab switching across Chat, Data, Skills, Models, and Settings no longer interrupts execution turns or clears conversational history.",
      },
      {
        title: "Real-time dataset sidebar & live execution pulse",
        body: "Added an active datasets panel directly in the main navigation sidebar with live row counts, fast dataset switching, and an animated live pulsing badge that tracks active background execution.",
      },
      {
        title: "Interactive runtime & environment settings workbench",
        body: "Upgraded settings from static readouts to interactive management with runtime execution backends (host, docker, inprocess), OS-level sandboxing, reasoning depth tiers, verification gates, and atomic .env file persistence on the backend.",
      },
      {
        title: "Synchronized OpenAPI & TypeScript contracts",
        body: "Automated end-to-end schema synchronization and contract validation across backend FastAPI schemas and frontend TypeScript models.",
      },
    ],
  },
  {
    version: "v1.0.3",
    tag: "v1.0.3",
    kind: "feature",
    title: "Universal Cross-Platform Installers, Blueprint Diagrams & Documentation Suite",
    date: "2026-08-28",
    highlights: [
      {
        title: "Universal 1-command installer suite",
        body: "Shipped automated single-command installers for Linux (curl -fsSL https://wizardw2.vercel.app/install.sh | bash) and Windows PowerShell (irm https://wizardw2.vercel.app/install.ps1 | iex), alongside the official Homebrew tap and Scoop package manifest.",
      },
      {
        title: "Fixed 3-column documentation architecture",
        body: "Redesigned the documentation shell with isolated independent scroll containers (Left Navigation, Middle Reading Content, Right Table of Contents) so sidebars remain fixed in place while navigating articles.",
      },
      {
        title: "Blueprint architecture diagram canvas",
        body: "Implemented a dedicated blueprint rendering canvas with non-ligature monospace font grid and verified specification badges for all architecture and workflow flowcharts.",
      },
      {
        title: "Global CLI symlink path resolution",
        body: "Enhanced the Go supervisor CLI with symlink traversal to resolve application roots when executed globally from any directory outside the git checkout.",
      },
      {
        title: "CodeGuard AST & sandbox hardening",
        body: "Expanded static AST security analysis across 31 banned modules, 11 builtins, and 22 dunder access patterns with graceful LLM provider error handling.",
      },
    ],
  },
  {
    version: "v1.0.2",
    tag: "v1.0.2",
    kind: "docs",
    title: "Ecosystem Documentation & Community Governance",
    date: "2026-08-26",
    highlights: [
      {
        title: "Ecosystem documentation overhaul",
        body: "Refreshed the docs site with custom styling, card layouts, and clearer architecture walkthroughs.",
      },
      {
        title: "Community skill registry",
        body: "Populated the skills repository with curated domain skills — cohort-analysis, data-quality-triage, outlier-detection, time-series-forecasting — with automated registry compilation.",
      },
      {
        title: "Standardized issue forms",
        body: "Cross-platform GitHub issue forms with dropdown selectors for operating system, execution backend, and LLM provider.",
      },
      {
        title: "Organization profile refresh",
        body: "A direct standalone download matrix for macOS (arm64/amd64), Linux (amd64/arm64), and Windows.",
      },
    ],
  },
  {
    version: "v1.0.1",
    tag: "v1.0.1",
    kind: "feature",
    title: "Analytics, Task Routing, Arrow Streaming & Hardening",
    date: "2026-08-25",
    highlights: [
      {
        title: "Polars engine integration",
        body: "Added Polars support alongside DuckDB and pandas for fast, multi-threaded DataFrame processing on large datasets.",
      },
      {
        title: "Smart tiered task router",
        body: "A deterministic classifier for lightweight, standard, and reasoning-heavy turns, with safe dynamic downscaling to smaller installed models.",
      },
      {
        title: "Zero-copy Apache Arrow streaming",
        body: "A high-throughput binary Arrow IPC streaming endpoint and frontend decoder for instant large-dataset previews.",
      },
      {
        title: "Security & fuzzing",
        body: "Continuous property-based fuzz testing for AST code guards and file-ingest headers, plus OpenSSF Scorecard token permissions.",
      },
      {
        title: "Dynamic skill RAG & caching",
        body: "Full integration of the semantic result cache and dynamic skill RAG retrieval.",
      },
    ],
  },
  {
    version: "v1.0.0",
    tag: "v1.0.0",
    kind: "launch",
    title: "First Consumer Release",
    date: "2026-08-25",
    highlights: [
      {
        title: "Standalone prebuilt binaries",
        body: "Pre-compiled standalone zip packages for macOS (arm64/amd64), Linux (amd64/arm64), and Windows (amd64).",
      },
      {
        title: "One-command CLI",
        body: "Introduced wizard init and wizard start — a background supervisor daemon for both services.",
      },
      {
        title: "Evidence-backed control plane",
        body: "Multi-hypothesis tracking, adversarial verification, result grounding checks, and transparent assumption extraction.",
      },
      {
        title: "OS-native sandboxing",
        body: "Secure subprocess execution with Landlock/seccomp on Linux, sandbox-exec on macOS, and Windows Job Objects.",
      },
      {
        title: "Autonomous feedback loop",
        body: "A Manager/Worker ReAct agent cycle with automatic Python traceback recovery.",
      },
    ],
  },
];
