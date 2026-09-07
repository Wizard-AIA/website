# Enterprise Diagnostics, Edge Cases & Troubleshooting

Wizard is engineered around deterministic containment, graceful degradation, and transparent operational reporting. When runtime constraints or infrastructure faults occur, Wizard reports exact root causes rather than failing silently.

---

## 1. Installation & CLI Supervision

### Homebrew Global Execution Outside Git Checkouts
- **Symptom**: Running `wizard start` or `wizard doctor` from arbitrary directories outside a repository clone.
- **Resolution**: The `wizard` Go binary resolves its executable symlink via `os.Executable()`, inspecting `/opt/homebrew/Cellar/wizard/...` or local path layouts to anchor root directories automatically.

### Linux or Windows Global Execution Outside the Install Folder
- **Symptom**: Running `wizard init` or `wizard start` after using the one-command installer from a project directory or a fresh terminal.
- **Resolution**: The installer persists `WIZARD_ROOT` alongside the user PATH entry. The CLI uses that root when Windows has copied the executable into `bin` or when a shell cannot resolve the package symlink. Open a new terminal after installation, then run `wizard init` and `wizard start` from any directory.

### Port Conflicts (Ports 8000 & 3000 Occupied)
- **Symptom**: CLI exits with code `2` (`PORT_CONFLICT`).
- **Diagnosis**: Run `wizard doctor` to view which process PID is holding the port.
- **Remediation**: Pass custom ports via CLI flags:
  ```bash
  wizard start --backend-port 8080 --frontend-port 3001
  ```

---

## 2. LLM Providers & Inferences

### Avoiding Reasoning Models in the Manager Role
- **Symptom**: Turn execution takes 5–10 minutes on local hardware without output.
- **Root Cause**: Reasoning models (`deepseek-r1`, `qwq`) emit hundreds of internal thinking tokens before every JSON plan turn. Because the Manager is invoked multiple times per loop, this creates massive cumulative latency.
- **Recommended Setup**:
  - **Manager (Planner)**: Use standard instruct models (`qwen2.5:3b`, `llama3.2:3b`, `gemini-2.5-flash`, `claude-3-5-haiku`).
  - **Worker (Coder)**: Reasoning or coding models (`qwen2.5-coder:7b`, `gemini-2.5-flash`, `claude-3-5-sonnet`).

### Missing Optional Provider Dependencies
- **Symptom**: `LLMUnavailableError: Provider 'openai' is configured, but langchain-openai is not installed.`
- **Remediation**: Install provider extras via `uv pip install langchain-openai` or configure `API_PROVIDER=gemini` or `API_PROVIDER=ollama`.

### Embedding Server Backoff & Lexical Fallback
- **Behavior**: If an embedding endpoint (e.g. `embeddinggemma` on Ollama) is unreachable or fails during indexing, Wizard does not crash. It applies exponential backoff and automatically falls back to an in-process lexical hashing encoder to preserve RAG retrieval functionality.

---

## 3. Sandboxing & Runtime Execution

### macOS OpenMP Runtime Missing for Tree Models (`xgboost`, `lightgbm`)
- **Symptom**: Subprocess crash with `Library not loaded: /opt/homebrew/opt/libomp/lib/libomp.dylib` when running gradient boosting models under `EXECUTION_BACKEND=host`.
- **Remediation**:
  ```bash
  brew install libomp
  ```

### Docker Daemon Unreachable Under `EXECUTION_BACKEND=docker`
- **Behavior**: Wizard logs a degradation warning and safely switches runtime containment to the Host OS Sandbox (`HOST_SANDBOX=best-effort`) instead of falling back to insecure in-process mode.

### Linux Landlock & Seccomp Availability
- **Behavior**: On Linux kernels prior to 5.13 lacking Landlock LSM support, Wizard enforces Seccomp-BPF socket filters and process namespace isolation, reporting `"Landlock unsupported, fallback to process namespace isolation"` in `wizard doctor`.

### Permission Grants Restarting Execution Children
- **Behavior**: When an interactive consent grant widens directory access (`allowed_roots`), the execution child process is restarted to bake the new OS security profile into the kernel table from inception. Intermediary Python runtime variables are reset, but loaded datasets are automatically rehydrated into memory.

---

## 4. Anti-Hallucination & Numerical Provenance

### Red Numerical Grounding Badges
- **Symptom**: UI displays an ungrounded indicator on a synthesized metric.
- **Cause**: The Manager model cited a number in its prose synthesis that was not present in the raw stdout of the executed Python code.
- **Remediation**: Re-run the question with `AGENT_TIER=deep` or check the underlying code output tab to inspect the raw computed DataFrame.

- **Under `local-only`, there's no cost meter at all.** Not `$0.00`
  (which would imply a real computed value) — an explicit statement that
  nothing is being metered.

## Data modes & privacy

- **`local-only` refuses a cloud provider outright**, rather than silently
  skipping it and falling back to a local one you didn't choose.
- **Web search is unavailable under `local-only`**, not merely an option
  you didn't pick. A plan step that would search the web is dropped with a
  warning instead of turned into a consent prompt — there's no consent that
  would make it allowed.
- **Switching data mode clears role assignments the new mode forbids.**
  The alternative would be your very next question simply failing, which
  would make a safer setting read as a broken app.
- **Redaction is decided per prompt, not once per turn.** Under a mixed
  setup (cloud planner, local code generator), the same turn can send a
  redacted prompt to one model and an unredacted one to the other.

## Permissions & consent

- **Declining a consent prompt doesn't end your turn.** The specific
  sub-task that needed it is recorded as failed, and the loop routes around
  it — just like any other failed step.
- **Database writes always ask**, every session, regardless of your
  consent profile. There's no setting that skips this specific one.
- **Saving a database connection isn't gated; opening it is.** Saving
  reaches nothing on its own.
- **A permission-suspended turn that hangs resolves to a denial**, not an
  indefinite wait — a timeout, a cancel, and a disconnect all resolve the
  same way.

## Skills

- **A skill can't contain executable code**, enforced by refusing the whole
  install and naming the offending file — not by silently stripping it.
- **Installing a skill from GitHub is something only you can do.** The
  agent can never install one mid-analysis on its own — a fetched skill
  instructing the agent to fetch more skills would otherwise be a real
  self-propagation risk.
- **A shadowed built-in skill still appears in listings.** If a
  user-installed skill has the same name as a built-in one, editing the
  built-in copy would otherwise appear to silently do nothing.

## Connectors

- **A table from a database connection is never embedded in an exported
  script or notebook** — the export looks the connection up by name at run
  time instead, so no credential and no raw data snapshot ends up baked
  into a file you might hand to someone else.
- **Generated code never opens a connector or a socket of its own** — a
  connection is read once by the backend and the result is handed over as a
  normal table, which is what keeps `HOST_SANDBOX_NETWORK=deny` meaning
  what it says even when a database is involved.

## Trust & answers

- **A number close to an execution output isn't flagged as invented.**
  Reporting `3.14` from a raw output of `3.14159159` is recognized as
  rounding, based on the *answer's own* precision — not a false positive.
- **Verification re-derives the result by a genuinely different route.**
  A model reviewing its own answer tends to confirm its own mistakes; a
  second independent computation doesn't share that blind spot.
- **The final answer is synthesized from real execution output — nothing
  client-side ever "cleans up" the response.** An older version of the UI
  used to regex-strip tracebacks, code blocks, and numeric rows out of
  answers, which occasionally deleted legitimate results along with the
  noise.

## Installing models

- **LM Studio reports download progress as a percentage, not bytes** —
  Ollama's native pull API reports bytes; the two are shown differently on
  purpose rather than forced into one shape that's wrong for one of them.
- **A gateway provider hosts its own models.** Asking to install one says
  so plainly rather than offering a button that would just fail.
