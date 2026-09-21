# Enterprise Installation Guide

Wizard is engineered to deploy seamlessly across personal developer workstations, secure air-gapped corporate environments, and containerized cloud clusters.

---

## 1. Prerequisites Matrix

Before installing Wizard, verify your system matches the runtime requirements for your chosen deployment topology:

| Requirement | Minimum | Recommended | Notes |
|---|---|---|---|
| **Operating System** | macOS 12+ (Apple Silicon / Intel), Linux (Ubuntu 20.04+, Debian 11+, RHEL 8+, Alpine 3.18+), Windows 10/11 (x64) | macOS Sonoma (M2/M3/M4) or Linux x86_64 | Native OS sandboxing is enforced on macOS (`sandbox-exec`) and Linux (`landlock`/`seccomp`). |
| **Python Runtime** | Python 3.12+ | Python 3.12 with `uv` package manager | Required for Host Execution Backend. Container mode requires no host Python. |
| **Node.js** | Node.js v20.0.0+ | Node.js v22 LTS with `pnpm` v10+ | Required only when building frontend from source or modifying UI workbenches. |
| **Hardware Resources** | 4 CPU Cores, 8 GB RAM | 8+ Cores, 16 GB+ Unified Memory | Local LLM inference (`3B`–`7B`) benefits significantly from Apple Silicon Unified Memory or NVIDIA CUDA GPUs. |
| **Container Engine** *(Optional)* | Docker Engine 24.0+ & Docker Compose v2+ | Docker Engine 27+ with Colima / OrbStack (macOS) | Required only when running `EXECUTION_BACKEND=docker`. |

---

## 2. Installation Channels

Nothing below needs administrator rights. Every channel installs the same release archive, and the installers check its SHA-256 against the release's `SHA256SUMS` before unpacking anything.

The requirements above are minimums. `wizard init` uses whatever Python, Node.js, `uv` and `pnpm` your machine already has (nvm, fnm, Volta, Homebrew and system installs are all found), and only offers to install what is missing, at the current release.

### Channel A: Homebrew (macOS & Linux)

```bash
brew install Wizard-AIA/wizard/wizard
wizard init
wizard start
```

Upgrade with `brew update && brew upgrade wizard`, then run `wizard init` again (your settings are kept). Uninstall with `brew uninstall wizard`. Homebrew owns those files, so `wizard update` and `wizard uninstall` point you at these commands instead of changing them.

---

### Channel B: Linux and macOS installer script

No Homebrew needed. It installs into `~/.wizard`, picks the archive for your CPU, verifies the checksum, and sets up your shell's PATH (zsh, bash, fish or plain `sh`):

```bash
curl -fsSL https://wizardw2.vercel.app/install.sh | sh
```

Options go after `sh -s --`:

```bash
curl -fsSL https://wizardw2.vercel.app/install.sh | sh -s -- --version 1.0.15 --no-modify-path
# --version X.Y.Z   --install-dir DIR   --no-modify-path   --force   --verbose
```

Open a new terminal (or run the `. ~/.wizard/env` line the installer prints) and both commands work from any directory:

```bash
wizard init
wizard start
```

Running the installer again is safe: it never duplicates the PATH entry, and it keeps your settings. `WIZARD_VERSION`, `WIZARD_INSTALL_DIR` and `WIZARD_NO_MODIFY_PATH` are the environment-variable forms of the options, and `WIZARD_RELEASE_BASE_URL` points the installer at an internal mirror.

---

### Channel C: Windows (PowerShell or Scoop)

#### Option 1: PowerShell 5.1 or 7+

```powershell
irm https://wizardw2.vercel.app/install.ps1 | iex
```

It installs into `%LOCALAPPDATA%\Wizard` and adds that to your user PATH (your existing `%VARIABLES%` entries are preserved). Open a new PowerShell window, then:

```powershell
wizard init
wizard start
```

With options:

```powershell
& ([scriptblock]::Create((irm https://wizardw2.vercel.app/install.ps1))) -Version 1.0.15 -NoModifyPath
```

Windows on ARM is not supported yet; the installer says so and exits with code 3 instead of downloading anything.

#### Option 2: Scoop

```powershell
scoop install https://github.com/Wizard-AIA/Wizard-w2/releases/latest/download/wizard.json
wizard init
wizard start
```

Upgrade with `scoop update wizard`.

---

### Channel D: Manual download

Take the archive for your platform (`Wizard-v<version>-<os>-<arch>.zip`) and `SHA256SUMS` from the [latest release](https://github.com/Wizard-AIA/Wizard-w2/releases/latest), check the archive against the checksum file, then extract it:

```bash
# Checks only the archive you downloaded; a mismatch prints FAILED and exits 1
sha256sum -c --ignore-missing SHA256SUMS        # Linux
shasum -a 256 -c --ignore-missing SHA256SUMS    # macOS

unzip Wizard-v1.0.15-darwin-arm64.zip
cd Wizard-v1.0.15-darwin-arm64
./cli/wizard init
./cli/wizard start
```

Then open **http://localhost:3000** in your browser. A manual install is not on your PATH and `wizard update` will not manage it; use Channel B if you want that.

---

### Channel E: Production Containerization (Docker Compose)

For fully containerized, air-gapped deployments where Python and Node run inside isolated microservices:

```bash
# 1. Clone the repository
git clone https://github.com/Wizard-AIA/Wizard-w2.git
cd Wizard-w2

# 2. Launch container stack in detached mode
docker compose up --build -d
```

The containerized stack exposes:
- **Web UI & Analytics Workbenches**: `http://localhost:3000`
- **FastAPI Control Plane & REST API**: `http://localhost:8000`
- **Interactive OpenAPI Specification**: `http://localhost:8000/docs`

#### Sandbox Image Tier Allocation
Wizard provides three pre-configured sandbox container tiers tailored to analytical compute footprints:

```bash
# Core: Lightweight data manipulation (pandas, numpy, pyarrow, duckdb, polars, openpyxl)
SANDBOX_TIER=core docker compose up --build -d

# Standard (Default): Advanced statistics & machine learning (scikit-learn, scipy, statsmodels, seaborn)
SANDBOX_TIER=standard docker compose up --build -d

# Full: Specialized geospatial & survival analytics (lifelines, geopandas, shapely)
SANDBOX_TIER=full docker compose up --build -d
```

---

### Channel F: Building from Source

For contributors and enterprise teams maintaining internal forks:

```bash
# 1. Clone the repository
git clone https://github.com/Wizard-AIA/Wizard-w2.git
cd Wizard-w2

# 2. Build the Go CLI supervisor
cd cli
go build -ldflags "-X wizard/internal/compat.CompatAPIVersion=4.0.0" -o wizard ./cmd/wizard
cd ..

# 3. Initialize dependencies and build frontend
./cli/wizard init

# 4. Start the supervised cluster
./cli/wizard start
```

---

## 3. Post-Installation Verification (`wizard doctor`)

`wizard doctor` checks the installation without changing anything: which install method owns the files, whether `wizard` on your PATH is the one you expect, the platform, the config directory, and each prerequisite, with a fix for every problem it finds. It works before `wizard init` has ever run.

```bash
wizard --version    # wizard CLI v1.0.15, backend API compat v4.0.0
wizard doctor
```

**Sample output** (your paths and versions will differ):

```log
Wizard 1.0.15  -  installation diagnostics

Diagnostics
----------------------------------------------------------------
  [ OK ]  Wizard CLI          v1.0.15, backend API compat v4.0.0
  [ OK ]  Platform            darwin-arm64
  [ OK ]  Installation        release installer  (/Users/you/.wizard/bin/wizard)
  [ OK ]  On PATH             `wizard` runs from any directory
  [ OK ]  Wizard files        /Users/you/.wizard/Wizard-v1.0.15-darwin-arm64
  [ OK ]  Config directory    /Users/you/Library/Application Support/Wizard
  [ OK ]  Python              3.14  /usr/local/bin/python3.14
  [ OK ]  Node.js             22.11  /usr/local/bin/node
  [ OK ]  uv                  0.12  /opt/homebrew/bin/uv
  [ OK ]  pnpm                10.2  /opt/homebrew/bin/pnpm
  [WARN]  Configuration       backend/.env not created yet
     -> Run `wizard init` to configure a provider.

10 passed  |  1 warning  |  0 failed
```

`wizard doctor --json` prints the same report for scripts. Exit codes: `0` healthy, `1` failure, `2` usage error, `3` a prerequisite is missing or the installation is broken, `4` a network error. For the running service, use `wizard status`.

## Updating and uninstalling

```bash
wizard update --check    # is a newer release available?
wizard update            # installer installs; keeps your settings and the previous package
wizard uninstall         # removes the program and its PATH entries, keeps your data
wizard uninstall --purge # removes everything: settings, API keys, logs, the Python environment
```

`wizard update` sends `GITHUB_TOKEN` or `GH_TOKEN` to `api.github.com` if you have one set, which avoids GitHub's anonymous rate limit on shared networks. Behind a proxy, `HTTPS_PROXY`, `HTTP_PROXY` and `NO_PROXY` are honoured by the installers, the updater and model lookups.

---

## 4. Enterprise Air-Gap & Platform Guidelines

### macOS OpenMP Dynamic Linking
If running in host execution mode (`EXECUTION_BACKEND=host`) on macOS and training tree-based models (`xgboost`, `lightgbm`), install Apple's OpenMP library:

```bash
brew install libomp
```

### Linux Seccomp & Landlock Sandboxing
Linux host sandboxing requires unprivileged user namespaces and a kernel with Landlock enabled (Linux 5.13+). To ensure non-root execution boundaries:

```bash
# Verify Landlock support
cat /sys/kernel/security/lsm | grep -o landlock || echo "Landlock inactive, falling back to process isolation"
```

### Complete Offline / Air-Gapped Setup
For classified or strict zero-egress networks:
1. Download wheel caches using `uv pip download -r requirements.txt -r requirements-local.txt -d /opt/wizard-wheels`.
2. Configure `DATA_MODE=local-only` in `backend/.env`.
3. Pre-load local GGUF models into Ollama or LM Studio (`ollama pull qwen2.5:3b && ollama pull qwen2.5-coder:7b`).
4. Wizard will enforce a strict zero-outbound network policy across all agent nodes and tools.
