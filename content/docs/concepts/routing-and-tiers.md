# Smart Task Routing & Execution Tiers

Not every turn needs the same amount of model compute. Wizard classifies each incoming turn and dispatches it across a **Tri-Model Architecture** (**Manager**, **Worker**, and **Embeddings**) sized specifically for that task, rather than routing everything through the same heavyweight pair — see [Architecture](architecture.md).

---

## 1. Turn Routing

Before any model runs, Wizard routes each message to the smallest workflow that serves it. Every message used to run plan, loop, verify, answer, so a `hi` after an analysis planned, wrote code and ran it. The router is deterministic: no model call and no I/O. It reads evidence from the message and the session, such as which of your column names the message mentions and which operations it asks for, instead of matching phrases. A message with no task evidence is a conversation, whatever its wording.

| Workflow | What it is for | What runs | Model calls |
|---|---|---|:---:|
| **converse** | Greetings, thanks, "what can you do?" | One reply. No dataset access, no tools. | 1 |
| **inspect** | Columns, types, row counts, "what is in this table?" | The facts are read from the data frame, then written up. No code runs. | 1 |
| **direct** | One number or one chart | Write code, run it, answer. No planner and no verification. | 2 |
| **agentic** | A multi-step investigation | Plan, loop (decide, code, run), verify, answer. | 5 or more |
| **plan_only** | "Make a plan, do not run it" | The plan, then it stops and waits for you. | 1 |
| **execute_plan** | "Go ahead" after a plan | Runs the plan you confirmed, against the question it was made for. | varies |

Complexity is the number of independent steps, not the length of the message: two aggregations are one step, an aggregation plus a model plus a report are three.

### When the router is unsure

If a message is probably conversation but could be a request, or is in a language the router does not know, it replies conversationally. The reply is itself the classifier: the model either answers normally or signals that it needs the data, and the same turn then continues as an analysis. No separate router model is called. With no dataset loaded the reply says what is missing.

### Depth is a preference

**Auto**, **Fast** and **Deep** stay until you change them. They change how hard Wizard works on an analytic message and never what the message is: Fast skips the planner and verification, Deep runs the full verified investigation, and a greeting costs one call in every mode. An explicit request for a plan is honoured in all of them.

---

## 2. The Tri-Model Routing Matrix

Wizard independently routes three model roles:

```diagram
User Query ──► Turn Router       ──► [Manager Role]    (Planning & Synthesis)
                                 ──► [Embedding Role]  (Vector RAG & Search)
                                 ──► [Worker Role]     (Code & Sandbox)
```

1. **Manager Role (`MODEL_NAME`):**
   - Directs investigation strategy and formulates hypotheses.
   - Sized to model tier: `compact` (4 steps), `balanced` (12 steps), or `full` (24 steps).
2. **Worker Role (`WORKER_MODEL_NAME`):**
   - Authors Python (Pandas, Polars, DuckDB) or SQL queries.
   - Receives execution feedback and self-corrects tracebacks.
3. **Embedding Role (`EMBEDDING_PROVIDER`, `EMBEDDING_REMOTE_MODEL`):**
   - Vectors document chunks and schemas for hybrid RAG search.
   - Routes automatically: Local Ollama $\to$ In-Process Sentence-Transformers $\to$ Deterministic Blake2b Hashing.

---

## 3. Dynamic Turn Downscaling & VRAM Management

When multiple models are available locally, Wizard dynamically manages hardware allocations:
- **Zero VRAM Contention:** Manager and Worker roles unload sequentially during memory-constrained operations (`llm_keep_alive`), avoiding memory paging.
- **Fast-Path Metadata:** Schema and column queries never invoke the coding worker.
- **Continuous Quality:** Complex analytical depth remains available whenever required.
