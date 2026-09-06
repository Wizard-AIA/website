# Architecture & Control Plane

Wizard operates on an **autonomous, self-correcting iterative feedback loop** rather than a one-shot generation pipeline. Real data analysis requires observing real intermediary data, discovering dirty keys, pivoting strategies when assumptions fail, and independently verifying numerical and table findings.

---

## High-Level System Architecture

The Next.js client and the FastAPI backend communicate over a streaming WebSocket (`/ws/chat`) with automatic fallback to Server-Sent Events (`POST /api/chat/stream`).

```diagram
                     ┌───────────────────────────────────────────────┐
                     │              User Query / Turn                │
                     └───────────────────────┬───────────────────────┘
                                             │
                                             ▼
                     ┌───────────────────────────────────────────────┐
                     │          In-Process SLM Intent Router         │
                     └───────┬───────────────────────┬───────────────┘
                             │                       │
         Metadata / Chitchat │                       │ Analytical Investigation
                             ▼                       ▼
            ┌─────────────────────┐       ┌─────────────────────────────────────┐
            │  Instant Fast-Path  │       │ 1. MANAGER ROLE (Reasoning/Planner) │
            │ (Sub-10ms response) │       │ - Formulates analytical hypotheses  │
            └─────────────────────┘       │ - Plans multi-step investigation    │
                                          │ - Coordinates DAG execution graph   │
                                          │ - Synthesizes verified final report │
                                          └──────┬──────────────────────────────┘
                                                 │
                                                 │ retrieves context & skills
                                                 ▼
                                          ┌─────────────────────────────────────┐
                                          │ 3. EMBEDDING ROLE (Vector / RAG)    │
                                          │ - Semantic chunking & indexing      │
                                          │ - Hybrid search (KNN + FTS5 BM25)   │
                                          │ - FlashRank Cross-Encoder reranking │
                                          │ - Local / Hybrid / Cloud / Fallback │
                                          └──────┬──────────────────────────────┘
                                                 │
                                                 │ delegates execution task
                                                 ▼
                                          ┌─────────────────────────────────────┐
                                          │ 2. WORKER ROLE (Code / Executor)    │
                                          │ - Authors Python/DuckDB/Polars code │
                                          │ - Runs within sandboxed environment │
                                          │ - Iterates against real stdout/data │
                                          └─────────────────────────────────────┘
```

Per turn, the control plane coordinates:
1. **SLM Intent Classification:** An in-process router fast-tracks lightweight metadata, column lists, and conversational chitchat in sub-10ms, bypassing heavy reasoning loops.
2. **Stateful DAG Execution:** Complex questions are modeled as an `ExecutionDAG` with topological dependency ordering and automatic cycle detection.
3. **Retrieval & Context:** The Manager consults the **Embedding Role** via hybrid search (`sqlite-vec` KNN + FTS5 BM25 + Reciprocal Rank Fusion + FlashRank Cross-Encoder).
4. **Sandboxed Code Synthesis:** The **Worker Role** authors code executed inside an isolated OS container or subprocess.
5. **Continuous Verification:** The Trust Layer performs headline re-derivation, adversarial critic evaluation, and cell-by-cell table grounding (`check_table_grounding`).

---

## The Tri-Model System (Manager, Worker, Embeddings)

Wizard decouples analytical intelligence into three first-class, independently configurable model pillars:

### 1. Manager Role (`MODEL_NAME`)
- **Core Responsibility:** Strategic planning, hypothesis formation, investigation depth control, subagent branching, and synthesizing verified analytical reports.
- **Topologies:**
  - **Local:** Runs locally on Ollama or LM Studio (`qwen3:8b`, `llama3.1:8b`). 100% private.
  - **Hybrid / Cloud:** Uses frontier cloud models (Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Flash/Pro) with automatic statistical schema redaction.

### 2. Worker Role (`WORKER_MODEL_NAME`)
- **Core Responsibility:** Authoring precision Python, DuckDB, and Polars code, executing queries, parsing execution tracebacks, and iterating on errors until intermediate data is valid.
- **Topologies:**
  - **Local:** Dedicated code models (`qwen2.5-coder:7b`, `deepseek-coder:6.7b`) executing directly against local sandboxes.
  - **Cloud:** Cloud coding models when authorized by the session's data privacy policy.

### 3. Embedding Role (`EMBEDDING_PROVIDER`, `EMBEDDING_REMOTE_MODEL`)
- **Core Responsibility:** Vectorizing document chunks (PDF/DOCX), indexing table schemas, retrieving community skills, and computing cosine similarities for analytical RAG.
- **Topologies:**
  - **Local:** Dedicated local embeddings via Ollama (`nomic-embed-text`, `bge-m3`) or in-process models (`all-MiniLM-L6-v2`).
  - **Cloud:** High-dimensional vector models (OpenAI `text-embedding-3-small` / `text-embedding-3-large`, Google `text-embedding-004`).
  - **Hybrid:** Local Manager/Worker with cloud embeddings under strict schema redaction policies.
  - **Deterministic Offline Fallback:** When no model server is reachable, Wizard automatically cascades to an instant, zero-disk 384-dimensional Blake2b deterministic hashing encoder.

---

## Dynamic Hybrid Vector & BM25 Search Engine

Wizard incorporates a dual-retriever search pipeline combining exact lexical keyword search with dense vector embeddings:

1. **Dense Vector KNN (`sqlite-vec`):** Cosine distance vector indexing powered by native C/SQLite vector extensions.
2. **Lexical Keyword Search (FTS5 BM25):** Full-text search matching precise column names, table identifiers, and analytical terms.
3. **Reciprocal Rank Fusion (RRF):** Fuses dense and sparse rankings with standard smoothing constant $k=60$:

   $$
   RRF(d) = \frac{1}{60 + \text{Rank}_{\text{dense}}(d)} + \frac{1}{60 + \text{Rank}_{\text{sparse}}(d)}
   $$

4. **Cross-Encoder Reranking:** Applies FlashRank ONNX cross-attention scoring across the top candidate chunks to capture query-document semantic nuance.
5. **Single-Flight Cache Stampede Protection:** Coalesces concurrent vectorization requests using `asyncio.Event` locks, preventing duplicate encoder calls.

---

## Stateful Resumable DAG Agent Architecture

In place of fragile linear ReAct loops, complex analytical multi-step tasks are executed as a Directed Acyclic Graph (`ExecutionDAG`):
- **Topological Scheduling:** Nodes execute only after all prerequisite parent nodes have completed successfully.
- **Cycle Prevention:** Validates graph structure via Kahn's algorithm and DFS traversal before execution begins.
- **Crash Resilience:** Every step serializes its execution checkpoint to JSON (`to_dict` / `from_dict`), allowing interrupted analytical investigations to resume without re-running completed queries.

---

## The Evidence-Backed Control Plane

To eliminate LLM hallucinations, Wizard applies multi-layered verification:

1. **Cell-by-Cell Table Grounding:** Validates every numeric cell in generated Markdown tables against actual execution DataFrames (`check_table_grounding`).
2. **Result Scalar Grounding:** Every numerical claim in the narrative answer is traced back to actual execution stdout.
3. **Headline Result Re-Derivation:** The central conclusion is independently computed through an alternative calculation path (e.g., cross-checking SQL aggregate output with native Python arithmetic).
4. **Adversarial Critic:** Ambiguous questions evaluate competing statistical routes (e.g. Parametric vs Non-parametric tests) to verify consensus.

---

## Distributed Observability & Horizontal Scaling

- **W3C OpenTelemetry Tracing:** Standardized distributed spans with W3C `traceparent` propagation across HTTP, WebSockets, background tasks, and supervisor daemons (`telemetry.py`).
- **Prometheus Metrics (`/metrics`):** Captures Time-To-First-Token (TTFT), rolling p50/p90/p95/p99 latency quantiles, error budgets, and token generation counters.
- **Redis Pub/Sub Event Bus (`SessionEventBus`):** Synchronizes streaming turn events across horizontally scaled multi-worker backend replicas.
- **Reverse Proxy:** Production-ready Nginx configuration (`deploy/nginx.conf`) with least-connection upstream balancing, IP rate limiting, and SSE buffering controls.
- **SRE Health Honesty:** Kubernetes-ready `/health/live` (process liveness) and `/health/ready` (cluster readiness probing SQLite, Redis, and Docker reachability with 503 on degradation).
- **Sandboxing & Isolation:** Hardened Linux Landlock/seccomp, macOS sandbox-exec, or Docker container with read-only rootfs and blocked Docker socket mounts.
