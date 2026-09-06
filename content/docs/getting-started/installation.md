# Enterprise Installation Guide

Wizard is engineered to deploy seamlessly across personal developer workstations, secure air-gapped corporate environments, and containerized cloud clusters.

---

## 1. Prerequisites Matrix

Before installing Wizard, verify your system matches the runtime requirements for your chosen deployment topology:

| Requirement | Minimum | Recommended | Notes |
|---|---|---|---|
| **Operating System** | macOS 12+ (Apple Silicon / Intel), Linux (Ubuntu 20.04+, Debian 11+, RHEL 8+, Alpine 3.18+), Windows 10/11 (x64) | macOS Sonoma (M2/M3/M4) or Linux x86_64 | Native OS sandboxing is enforced on macOS (`sandbox-exec`) and Linux (`landlock`/`seccomp`). |
| **Python Runtime** | Python 3.11+ | Python 3.12 with `uv` package manager | Required for Host Execution Backend. Container mode requires no host Python. |
| **Node.js** | Node.js v20.0.0+ | Node.js v22 LTS with `pnpm` v10+ | Required only when building frontend from source or modifying UI workbenches. |
| **Hardware Resources** | 4 CPU Cores, 8 GB RAM | 8+ Cores, 16 GB+ Unified Memory | Local LLM inference (`3B`–`7B`) benefits significantly from Apple Silicon Unified Memory or NVIDIA CUDA GPUs. |
| **Container Engine** *(Optional)* | Docker Engine 24.0+ & Docker Compose v2+ | Docker Engine 27+ with Colima / OrbStack (macOS) | Required only when running `EXECUTION_BACKEND=docker`. |

---

## 2. Installation Channels

Choose the installation channel that best aligns with your infrastructure policies:

### Channel A: Homebrew (macOS & Linux)

The official Homebrew tap delivers pre-compiled, self-contained releases with global binary symlinking:

```bash
# 1. Tap the official Wizard tap repository
brew tap Wizard-AIA/wizard

# 2. Install the Wizard suite
brew install wizard

# 3. Initialize workspace and launch
wizard init
wizard start
```

---

### Channel B: Linux 1-Command Universal Installer (Curl)

For all Linux distributions (Ubuntu, Debian, Fedora, Arch, RHEL, Alpine, Pop!_OS), install with a single shell command:

```bash
# Automatically detects architecture (x86_64 or aarch64), verifies checksums, and configures PATH
curl -fsSL https://wizardw2.vercel.app/install.sh | bash
```

Once installed, initialize and launch:

```bash
wizard init
wizard start
```

---

### Channel C: Windows 1-Command Installer (PowerShell & Scoop)

#### Option 1: Native PowerShell 1-Liner
Open PowerShell (Terminal) and run:

```powershell
# Automatically downloads latest release, extracts to %LOCALAPPDATA%\Wizard, and registers global PATH
irm https://wizardw2.vercel.app/install.ps1 | iex
```

Once complete, run:

```powershell
wizard init
wizard start
```

#### Option 2: Scoop Package Manager
If you use [Scoop](https://scoop.sh) on Windows:

```powershell
scoop install https://wizardw2.vercel.app/wizard.json
wizard init
wizard start
```

---

### Channel D: Standalone Release Packages (Zero-Compiler Deployment)

Standalone release packages bundle the pre-compiled `wizard` Go binary, backend application code, and optimized production Next.js frontend builds without requiring Git or Go compilers.

1. Download the verified package for your operating system from the [Download Hub](/download):

```bash
# macOS (Apple Silicon ARM64)
curl -sSL -O https://github.com/Wizard-AIA/Wizard-w2/releases/latest/download/Wizard-darwin-arm64.zip

# macOS (Intel x86_64)
curl -sSL -O https://github.com/Wizard-AIA/Wizard-w2/releases/latest/download/Wizard-darwin-amd64.zip

# Linux (x86_64)
curl -sSL -O https://github.com/Wizard-AIA/Wizard-w2/releases/latest/download/Wizard-linux-amd64.zip

# Linux (ARM64)
curl -sSL -O https://github.com/Wizard-AIA/Wizard-w2/releases/latest/download/Wizard-linux-arm64.zip

# Windows (x86_64)
curl -sSL -O https://github.com/Wizard-AIA/Wizard-w2/releases/latest/download/Wizard-windows-amd64.zip
```

2. Extract and initialize the service:

```bash
unzip Wizard-darwin-arm64.zip
cd Wizard-v1.0.8-darwin-arm64

./cli/wizard init
./cli/wizard start
```

3. Open **http://localhost:3000** in your browser.

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
go build -ldflags "-s -w -X wizard/internal/compat.BuildCompatVersion=v4.0.0" -o wizard ./cmd/wizard
cd ..

# 3. Initialize dependencies and build frontend
./cli/wizard init

# 4. Start the supervised cluster
./cli/wizard start
```

---

## 3. Post-Installation Verification (`wizard doctor`)

Run `wizard doctor` to perform comprehensive environment diagnostics across process supervisors, network ports, and OS sandbox boundaries:

```bash
wizard doctor
```

**Sample Diagnostic Output:**

```log
wizard status
==============
daemon:            healthy (supervisor pid=41208, uptime=14m22s)
backend (8000):    running (pid=41209, healthy)
frontend (3000):   running (pid=41210, healthy)

config dir:        /Users/admin/Library/Application Support/Wizard
logs dir:          /Users/admin/Library/Application Support/Wizard/logs
  backend.log:     42.1 KB
  frontend.log:    18.4 KB
  daemon.log:      3.2 KB

API_PROVIDER:      gemini
DATA_MODE:         cloud-only
EXECUTION_BACKEND: host (enforced: +filesystem,network,processes -memory)
SANDBOX_CAPABILITY: OS seatbelt active, Landlock ready
```

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

