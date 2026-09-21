# Enterprise CLI Reference (`wizard`)

The `wizard` command-line utility is a compiled, zero-dependency Go binary engineered to supervise, configure, and orchestrate the Wizard control plane, Python execution daemons, and Next.js analytics workbenches as background services across macOS, Linux, and Windows.

---

## 1. CLI Architecture & Process Supervision

Instead of requiring manual multi-terminal script invocations (`uvicorn` + `next dev`), `wizard` operates an idempotent, detached supervisor daemon:

```diagram
                  ┌─────────────────────────────────────┐
                  │          wizard CLI Binary          │
                  │   (CLI entrypoint & CLI manager)    │
                  └──────────────────┬──────────────────┘
                                     │ spawns detached
                                     ▼
                  ┌─────────────────────────────────────┐
                  │    Process Supervisor (__supervise) │
                  │  - Health probing & auto-restart    │
                  │  - Signal forwarding (SIGTERM)      │
                  │  - Size-capped log rotation (10MB)  │
                  └──────────┬──────────────────┬───────┘
                             │                  │
                ┌────────────┴────────┐   ┌─────┴──────────────┐
                │   FastAPI Backend   │   │  Next.js Frontend  │
                │ (Control Plane:8000)│   │ (UI Engine: 3000)  │
                └─────────────────────┘   └────────────────────┘
```

### Key Supervisory Guarantees:
- **Zero Orphaned Subprocesses**: When `wizard stop` or a termination signal is received, the supervisor sends `SIGTERM` to the entire process group, guaranteeing that background Python runtimes or host worker sockets do not leak.
- **Port Conflict Resolution**: Probes availability for ports 8000 (backend) and 3000 (frontend) before launching, reporting the blocking PID if occupied.
- **Automatic Log Rotation**: Rotates `backend.log`, `frontend.log`, and `daemon.log` at 10MB bounds, preserving previous logs as `.1.log` to prevent disk saturation.
- **Global Path Resolution**: Automatically detects project roots from current working directories, Homebrew Cellar installations (`/opt/homebrew/Cellar/wizard/...`), and Linux/Windows packaged installations. `WIZARD_ROOT` is persisted by the installers when executable or symlink resolution cannot identify the checkout.

---

## 2. Command Index & Syntax

### `wizard init`
Initializes local runtime environments, validates system dependencies, generates `backend/.env`, sets up managed virtual environments, installs requirements, and compiles frontend bundles. With no configuration flags in a terminal it is a guided setup: menus you move through with the arrow keys (type to jump to an entry), an API key field that shows one `•` per character and then a receipt with the key's length and last four characters (the key itself is never printed, and it is checked with the provider straight away), and model lists fetched from your provider so you never type a model name or a provider URL. Python 3.12+, Node.js 20+, uv and pnpm are minimums: anything newer that is already installed is used, and only what is missing is installed. Scripts use `--non-interactive`, which never prompts and makes no network lookups.

```bash
wizard init [flags]
```

#### Flags & Options:
| Flag | Type | Description | Default |
|---|---|---|---|
| `--provider` | `string` | Configures the primary LLM provider: `ollama`, `lmstudio`, `gemini`, `anthropic`, `openai`, or `custom_gateway`. | `ollama` |
| `--data-mode` | `string` | Configures privacy policy: `local-only` (zero cloud egress), `hybrid` (redacted cloud queries), or `cloud-only`. | `local-only` |
| `--embedding-provider` | `string` | Configures the embedding provider: `ollama`, `lmstudio`, `openai`, `gemini`, or `custom_gateway`. Empty follows `--provider`. | `""` (follows provider) |
| `--embedding-model` | `string` | Pins the vector embedding model (e.g. `nomic-embed-text`, `bge-m3`, `text-embedding-3-small`). | `""` (auto-discover/default) |
| `--manager-model` | `string` | Pins the Manager reasoning model (e.g. `qwen3:8b`, `gemini-2.5-flash`, `claude-3-5-sonnet-20241022`). | `qwen3:8b` |
| `--worker-model` | `string` | Pins the Worker Python coding model (e.g. `qwen2.5-coder:7b`). | `qwen2.5-coder:7b` |
| `--pull-models` | `bool` | Automatically triggers `ollama pull` for default manager (`qwen3:8b`), worker (`qwen2.5-coder:7b`), and embedding model (`nomic-embed-text`). | `false` |
| `--gemini-key` | `string` | Injects Google Gemini API Key into `backend/.env`. | `""` |
| `--anthropic-key` | `string` | Injects Anthropic Claude API Key into `backend/.env`. | `""` |
| `--openai-key` | `string` | Injects OpenAI API Key into `backend/.env`. | `""` |
| `--gateway-url` | `string` | Sets OpenAI-compatible gateway endpoint URL (Groq, Together, vLLM, OpenRouter). | `""` |
| `--gateway-key` | `string` | Injects authentication bearer token for custom gateway. | `""` |
| `--base-url` | `string` | Overrides base URL for the active provider. | `""` |
| `--interactive` | `bool` | Forces the guided setup prompts even when other flags are supplied. | `false` |
| `--non-interactive` | `bool` | Disables prompts for scripts and CI; missing values use defaults. | `false` |
| `--lmstudio-key` | `string` | Injects an LM Studio API key when the provider requires one. | `""` |
| `--install-prerequisites` | `bool` | Installs missing Python, Node.js, uv and pnpm without asking (for scripts). | `false` |
| `--no-install-prerequisites` | `bool` | Only checks prerequisites; never installs. | `false` |

### `wizard delete`

Stops Wizard and removes its managed user configuration, credentials, connections, skills, logs, managed virtual environment, and checkout `backend/.env`. The installed checkout and CLI binary remain available for a later `wizard init`.

```bash
wizard delete          # asks for confirmation in an interactive terminal
wizard delete --yes    # suitable for automation
wizard delete --keep-env
```

---

### `wizard start`
Launches the backend control plane and Next.js frontend as a detached background supervisor, polls health endpoints until ready, validates API compatibility markers, and opens the default web browser.

```bash
wizard start [flags]
```

#### Flags & Options:
| Flag | Type | Description | Default |
|---|---|---|---|
| `--backend-port` | `int` | Overrides the backend HTTP port. | `8000` |
| `--frontend-port` | `int` | Overrides the frontend HTTP port. | `3000` |
| `--no-browser` | `bool` | Suppresses automatic browser launch upon service startup. | `false` |
| `--timeout` | `int` | Seconds to wait for the backend to become healthy. | `90` |

---

### `wizard stop`
Gracefully halts running backend, frontend, and supervisor processes. Idempotent — safe to execute multiple times.

```bash
wizard stop
```

---

### `wizard doctor`
A read-only health report for this installation. Each check is **PASS**, **WARN** or **FAIL**, and anything that is not a pass comes with the command that fixes it. It works even when the bundled files cannot be found, which is when you need it most.

```bash
wizard doctor
wizard doctor --json      # machine-readable, for scripts and support tickets
wizard doctor --network   # also test GitHub Releases and your configured model provider
```

#### What it checks:
- **Wizard CLI, platform, install method**: the version, the OS/architecture, and whether this is a Homebrew, Scoop, installer or git-checkout install.
- **On PATH**: whether typing `wizard` runs *this* binary from any directory, and exactly what to add if not (or which other install is shadowing it).
- **Wizard files**: whether the bundled `backend/` and `frontend/` are found.
- **Config directory**: that it exists or can be created, and is writable.
- **Python, Node.js, uv, pnpm**: found at or above the minimum. A tool that exists but cannot run is a failure with the reason.
- **Configuration and credentials**: the configured provider, and whether its API key is set.
- **Dependencies and service**: whether `wizard init` has run, and if the service is up, whether its API version matches this CLI.

Exit code `0` means no check failed; `3` means at least one did.

### `wizard status`
Shows what is running (supervisor, backend, frontend and their PIDs), log sizes, the active `API_PROVIDER`, `DATA_MODE`, `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL` and `EXECUTION_BACKEND` (including a Docker reachability probe), and the backend's own `GET /api/config`.

```bash
wizard status
```

---

### `wizard attach`
Multiplexes and streams live stdout/stderr from `backend.log` and `frontend.log` directly to your terminal session with source color prefixes until `Ctrl+C` is pressed.

```bash
wizard attach
```

---

### `wizard logs`
Inspects and outputs log file locations and recent log records.

```bash
# Print all log file paths
wizard logs

# Output the last 50 lines across backend and frontend
wizard logs --tail 50
```

---

### `wizard update`
Checks for and applies an available release. Installed release packages are downloaded into a staging directory, verified against the published SHA-256 checksum, then atomically activated while the previous package is retained for rollback. Source checkouts instead perform their normal fast-forward Git synchronization and dependency refresh.

```bash
wizard update --check  # report whether a newer release is available
wizard update          # apply the available release or update a source checkout
```

`wizard update` never overwrites files a package manager owns. On a Homebrew install it prints `brew update && brew upgrade wizard` (then run `wizard init`, which restores your settings), and on Scoop `scoop update wizard`. If an update fails after the service was stopped, the previous version is restarted.

---

### `wizard skills`
Manages the modular corporate skill ecosystem. Allows installing, updating, inspecting, and removing analytical skills with security scanning.

```bash
# List all installed skills, source repositories, and pinned commit hashes
wizard skills list

# Install a skill from a GitHub repository with AST safety preview
wizard skills add https://github.com/Wizard-AIA/wizard-skills-financial

# Update an installed skill to the latest remote revision
wizard skills update financial-modeling

# Discard local modifications to an installed skill
wizard skills discard financial-modeling

# Remove an installed skill safely
wizard skills remove financial-modeling

# Configure GitHub Personal Access Token (PAT) for private enterprise skill repos
wizard skills token ghp_yourPersonalAccessToken
```

---

### `wizard uninstall`
Removes Wizard from this machine.

```bash
wizard uninstall            # removes the program and its PATH entries; keeps your settings and keys
wizard uninstall --purge    # removes everything (alias: --all)
wizard uninstall --yes      # skip the confirmation prompt
```

Without `--purge` your settings, API keys, logs and Python environment stay in the configuration directory, and `backend/.env` is backed up there so a reinstall picks it up. With `--purge` everything is deleted: the program, its shell startup entries (or the user PATH entry on Windows), the configuration directory, API keys, logs, the managed Python environment and `backend/.env`. Both forms list exactly what they will remove and ask first; unattended runs without `--yes` are refused.

It only removes what the official installer created. A Homebrew or Scoop install is removed with `brew uninstall wizard` / `scoop uninstall wizard`, which `wizard uninstall` prints, and a git checkout is never touched. `wizard delete` removes only your data and leaves the program installed.

---

### `wizard version`
Outputs the CLI version and the backend API compatibility target. It makes no network request; use `wizard update --check` to look for a newer release.

```bash
wizard version            # also: wizard --version
# Output: wizard CLI v1.0.14, backend API compat v4.0.0
```

Global flags go before the command: `wizard --no-color doctor`, `wizard --verbose update`. `NO_COLOR` also disables colour, and `wizard help <command>` shows a command's flags.

---

## 3. Configuration & State Paths

Wizard adheres to standard OS configuration hierarchy standards:

| Operating System | Configuration directory (`WIZARD_CONFIG_DIR` overrides it) | Logs |
|---|---|---|
| **macOS** | `~/Library/Application Support/Wizard` | `<config dir>/logs` |
| **Linux** | `~/.config/wizard` (or `$XDG_CONFIG_HOME/wizard`) | `<config dir>/logs` |
| **Windows** | `%APPDATA%\Wizard` | `<config dir>\logs` |

The settings, credentials, connections, skills, logs and the managed Python environment (`venv/`) all live under that one directory. The program itself lives in `~/.wizard` (installer script), `%LOCALAPPDATA%\Wizard` (PowerShell installer), or the package manager's own location.

---

## 4. Exit Codes & Automation Recipes

The `wizard` binary returns exit codes suitable for CI/CD pipelines and deployment scripts:

| Exit Code | Meaning | Remediation |
|:---:|---|---|
| `0` | Success (including `--help`) | None required. |
| `1` | Failure | Run `wizard doctor` for a diagnosis. |
| `2` | Bad usage or invalid value | A stray argument, an unknown flag, or a port outside 1-65535. Run `wizard help <command>`. |
| `3` | Missing dependency or broken installation | Run `wizard doctor`; it prints the fix for each failing check. |
| `4` | Network error | A release lookup or download failed. Check your connection, or set `HTTPS_PROXY`. |

`wizard doctor --json` gives scripts the full report, and `wizard update --check` exits `4` when GitHub cannot be reached.
