<div align="center">

<img src="https://img.shields.io/badge/DevFlow-AI-6EE7B7?style=for-the-badge&logoColor=white" alt="DevFlow AI" />

# DevFlow AI

### AI-Powered GitHub Automation Pipelines

**Plan → Execute → Validate → Commit. Fully Automated.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-6EE7B7?style=for-the-badge)](https://dev-flow-ai-wheat.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-A78BFA?style=for-the-badge)](https://devflow-api-production.up.railway.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)


</div>

---

## What is DevFlow AI?

DevFlow AI is a full-stack SaaS platform that converts plain English descriptions into autonomous AI-powered pipelines that scan, fix, validate, and commit code to your GitHub repositories — without you touching a single file manually.

Most AI coding tools **suggest** fixes. DevFlow AI **executes** them — after planning them intelligently and validating them before a single line reaches your repo.

---

## The Architecture — Planner → Executor → Critic

DevFlow AI is built on a 3-layer AI architecture that eliminates hallucination and ensures only clean, validated code gets committed.

```
User Prompt
     │
     ▼
┌─────────────┐
│   PLANNER   │  ← Fetches real repo file tree
│             │  ← Builds semantic index of codebase
│             │  ← Ranks files by relevance using BM25
│             │  ← Creates strict execution plan with exact filenames
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  EXECUTOR   │  ← Reads actual file content from GitHub
│             │  ← Sends only relevant code sections (token-efficient)
│             │  ← AI fixes bugs, security issues, bad patterns
│             │  ← Writes corrected code back
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   CRITIC    │  ← Validates fix before any commit
│             │  ← Checks syntax, logic, missing imports, regressions
│             │  ← Local syntax validation (Python AST, JS brace check)
│             │  ← Bad fix? Rejected. Original code preserved.
└──────┬──────┘
       │
       ▼
  GitHub Commit + Email Report
```

---

## Features

### 🎨 Visual Pipeline Canvas
- Drag-and-drop node-based pipeline builder (ReactFlow)
- Node types: Trigger, AI Action, Notification, GitHub
- Connect nodes with conditional edges
- AI evaluates edge conditions intelligently — "if errors found", "if code is clean", any natural language condition
- Real-time node status updates via WebSocket
- Auto-save draft pipelines to localStorage — refresh-proof

### 🧠 AI Intelligence Layers
- **Planner AI** — fetches real repo file tree, never invents filenames
- **Semantic Index** — indexes functions, imports, keywords per file
- **BM25 File Ranking** — mathematically ranks files by task relevance
- **Executor AI** — fixes code with context-aware prompting
- **Critic AI** — validates every fix before committing
- **Execution Reflection Memory** — learns from past failures, avoids repeating mistakes
- **Tool Memory** — prevents repeatedly editing the same files
- **AI Node Intent Classifier** — understands what any node should do from its label/description
- **AI Condition Evaluator** — evaluates any edge condition in natural language

### 🔗 GitHub Integration
- Personal Access Token authentication with validation
- Repository browser with visual file tree
- Branch selection per workflow
- File/folder picker integrated into canvas
- Real-time repo tree fetching with TTL cache
- Automatic commit with descriptive messages
- Pull Request creation, review, and merge
- Webhook support for Code Push triggers

### 📧 Email Notifications
- Brevo SMTP API integration
- Rich HTML email reports with pipeline output
- Conditional sending — error alerts, success alerts, custom conditions
- Detailed diff summary in every email

### 🔐 Authentication & Multi-tenancy
- Clerk authentication (OAuth, email/password, SSO)
- JWT RS256 verification with JWKS caching
- Per-user GitHub token encryption
- Protected routes, SSO callback handling

### 📊 Observability
- Full pipeline run logs with timestamps
- Node-level status tracking
- Duration tracking per node and per run
- WebSocket real-time execution feed

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| ReactFlow | Pipeline canvas |
| Clerk (React SDK) | Authentication UI |
| Vite | Build tool |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | API framework |
| Python asyncio | Async execution |
| psycopg2 + ThreadedConnectionPool | Database with pooling |
| httpx AsyncClient | HTTP with connection pooling |
| PyJWT + JWKS | Clerk JWT verification |
| WebSockets | Real-time pipeline execution |

### Infrastructure & Services
| Service | Purpose |
|---|---|
| Neon (PostgreSQL) | Primary database |
| Clerk | Authentication & user management |
| Groq (Llama 3.3 70B) | AI inference |
| Brevo | Transactional email |
| Railway | Backend deployment |
| Vercel | Frontend deployment |
| GitHub API | Repository operations |

---

## Performance Optimizations

Every optimization is built-in with zero additional infrastructure cost:

```python
# Shared HTTP client — reuses TCP connections
_http_client = httpx.AsyncClient(
    limits=httpx.Limits(max_keepalive_connections=20, max_connections=50)
)

# Parallel GitHub API fetches
tree_res, repo_res = await asyncio.gather(
    client.get(tree_url, headers=headers),
    client.get(repo_url, headers=headers)
)

# TTL-based repo tree cache
REPO_TREE_TTL = 120  # seconds

# Groq retry with exponential backoff
for attempt in range(3):
    if res.status_code == 429:
        await asyncio.sleep(2 ** attempt)

# Database connection pooling
_pool = psycopg2.pool.ThreadedConnectionPool(minconn=2, maxconn=10)

# Token-efficient file chunking — send only relevant sections
context_code = _smart_chunk_file(original_content, description)
```

---

## Project Structure

```
devflow-api/                          # FastAPI Backend
├── app/
│   ├── main.py                       # App entry, CORS, routing
│   ├── auth.py                       # Clerk JWKS JWT verification
│   ├── config.py                     # Environment settings (Pydantic)
│   ├── database.py                   # psycopg2 connection pool
│   ├── models/
│   │   └── workflow.py               # Pydantic request/response models
│   ├── routes/
│   │   ├── workflows.py              # Pipeline CRUD + AI generation
│   │   ├── github.py                 # GitHub integration endpoints
│   │   ├── runs.py                   # Pipeline run history
│   │   ├── ws.py                     # WebSocket execution handler
│   │   ├── webhooks.py               # GitHub webhook receiver
│   │   └── health.py                 # Health check
│   └── services/
│       ├── executor.py               # Core: Planner→Executor→Critic
│       ├── bm25_engine.py            # BM25 file relevance ranking
│       ├── ast_engine.py             # AST-based code parsing
│       ├── ai_surgeon.py             # AI fix application
│       ├── parser.py                 # Intent parser (FSM)
│       ├── snapshot.py               # Repo snapshot management
│       ├── workspace.py              # Workspace management
│       ├── sandbox.py                # Execution sandbox
│       ├── shield_loop.py            # Free retry loop
│       ├── free_retry.py             # OpenRouter fallback
│       └── deployment.py             # Deployment management
└── railway.toml                      # Railway deployment config

DevFlow-Fresh/                        # React Frontend
└── src/
    ├── pages/
    │   ├── WorkflowBuilder.jsx       # Main pipeline canvas
    │   ├── Dashboard.jsx             # Workflow management
    │   ├── Logs.jsx                  # Run history & logs
    │   ├── Integrations.jsx          # GitHub + service connections
    │   ├── Landing.jsx               # Marketing page
    │   └── ...                       # Auth, Profile, Docs, etc.
    ├── components/
    │   ├── RepoBranchPanel.jsx       # Repo selector + file tree
    │   ├── CustomNode.jsx            # Pipeline node component
    │   ├── Sidebar.jsx               # Navigation
    │   ├── TopBar.jsx                # Header + notifications
    │   └── ui/                       # Design system components
    ├── contexts/
    │   ├── AuthContext.jsx           # Clerk auth state
    │   └── ToastContext.jsx          # Toast notifications
    ├── hooks/
    │   └── useRepoTree.js            # GitHub file tree hook
    └── lib/
        ├── api.js                    # Centralized API client
        └── templateNodes.js          # Pipeline node templates
```

---

## Database Schema

```sql
-- User settings and integrations
CREATE TABLE user_settings (
    user_id         TEXT PRIMARY KEY,
    github_token    TEXT,
    selected_repo_full_name TEXT,
    selected_branch TEXT,
    gmail_user      TEXT,
    notify_email    TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Saved workflows
CREATE TABLE workflows (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL,
    name        TEXT,
    snapshot    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline execution history
CREATE TABLE workflow_runs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      TEXT NOT NULL,
    workflow_id  UUID,
    workflow_name TEXT,
    status       TEXT,
    started_at   TIMESTAMPTZ,
    duration     TEXT,
    triggered_by TEXT,
    snapshot     JSONB,
    logs         JSONB
);
```

---

## Environment Variables

### Backend (`devflow-api/.env`)
```env
DATABASE_URL=postgresql://...          # Neon connection string
CLERK_SECRET_KEY=sk_test_...           # Clerk secret key
GROQ_API_KEY=gsk_...                   # Groq API key
BREVO_API_KEY=xkeysib-...             # Brevo email API key
GMAIL_USER=your@gmail.com             # Sender email address
```

### Frontend (`DevFlow-Fresh/.env`)
```env
VITE_API_URL=https://your-backend.railway.app
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_GROQ_API_KEY=gsk_...
```

---

## Local Development

### Backend
```bash
cd devflow-api
pip install -r requirements.txt
cp .env.example .env          # fill in your keys
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd DevFlow-Fresh
npm install
cp .env.example .env          # fill in your keys
npm run dev
```

---

## How to Use

1. **Sign up** at [devflow-ai](https://dev-flow-ai-wheat.vercel.app)
2. **Connect GitHub** — add your Personal Access Token in Integrations
3. **Select a repo and branch** in the WorkflowBuilder
4. **Describe your task** in plain English in the prompt bar
5. **DevFlow generates a pipeline** — review the nodes and edges
6. **Hit Run** — watch the pipeline execute live
7. **Get an email** with exactly what was fixed

> ⚠️ **Important:** Test on a repo you don't actively use. GitHub + Email pipelines are fully working. Slack, Notion, Jira integrations are currently in development.

---

## Pipeline Examples

**Bug Fix + Email Report**
```
Code Push → Fix Bugs → Error Alert → All Clear Email
```

**Security Scan**
```
Code Push → Security Scan → [if vulnerabilities] → Fix Code → Commit → Report Email
```

**PR Workflow**
```
Code Push → AI Fix → Create Pull Request → AI Review PR → [if approved] → Merge
```

---

## Current Status

| Feature | Status |
|---|---|
| Visual Pipeline Canvas | ✅ Complete |
| GitHub Integration | ✅ Complete |
| AI Code Fix (Planner→Executor→Critic) | ✅ Complete |
| Email Notifications | ✅ Complete |
| Pull Request Automation | ✅ Complete |
| Real-time WebSocket Execution | ✅ Complete |
| Pipeline Run Logs | ✅ Complete |
| Slack Integration | 🔧 In Development |
| Notion Integration | 🔧 In Development |
| Jira Integration | 🔧 In Development |
| Scheduled Triggers (Cron) | 🔧 In Development |
| Stripe Billing | 🔧 In Development |

---

## Built By

**Vikrant Vinchurkar**
Final Year BSc Computer Science — Mumbai

Built this alongside exams, assignments, and everything else that comes with final year.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/vikrant-vinchurkar-9496862bb/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/Vikrant-kun)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**DevFlow AI** 

⭐ Star this repo if you found it useful

</div>