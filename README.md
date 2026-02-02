# Claude Code Skills

A collection of powerful skills for Claude Code. Extend your AI coding workflow with multi-agent orchestration, dev workflows, test generation, and data extraction.

## Installation

```bash
# Add the marketplace
claude plugin marketplace add apoorvgarg31/claude-code-skills

# Install skills you want
claude plugin install orchestra@apoorv-skills
claude plugin install dev-workflow@apoorv-skills
claude plugin install test-architect@apoorv-skills
claude plugin install pdf-to-data@apoorv-skills
```

## Skills

### 🎼 Orchestra (Multi-Agent Orchestration)

Opus (Claude Code) orchestrates while delegating work to specialized AI agents (Codex, Gemini CLI, Aider, Droid) running in separate tmux terminals.

```
/orchestra:init              # Interactive setup - choose agents for each phase
/orchestra:start <project>   # Start new project, BA creates tech spec
/orchestra:continue <project># Continue to next phase after agent completes
/orchestra:status <project>  # Check project status
/orchestra:projects          # List all projects
```

**Supported Agents:** `codex`, `claude`, `gemini`, `aider`, `droid`, `opus`

**Flow:**
```
1. /orchestra:init           → Configure which agent for each phase
2. /orchestra:start todo-api → BA creates spec, spawns developer (e.g., codex)
3. [User works with codex in tmux]
4. /orchestra:continue       → Detects done, spawns code reviewer
5. [Repeat until complete]
```

### 🔧 Dev Workflow

Complete single-agent development workflow with BA, Developer, Code Review, and Test phases.

```
/dev-workflow:start <project>  # Start new project workflow
```

### 🧪 Test Architect

Generate comprehensive tests via interactive Q&A conversation.

```
/test-architect:generate src/utils.py --framework pytest
```

### 📄 PDF to Data

Extract structured data from PDFs to JSON, CSV, or Excel.

```
/pdf-to-data:extract invoice.pdf --format json
```

Requires: `pip install pymupdf openpyxl`

## Project-Based State

Each skill uses its own hidden folder for state:

**Orchestra:** `.orchestra/`
```
.orchestra/
├── todo-api/
│   ├── config.yaml
│   ├── tech-spec.yaml
│   ├── workflow.yaml
│   └── dev-progress.yaml
└── another-project/
    └── ...
```

**Dev Workflow:** `.dev-workflow/`
```
.dev-workflow/
├── todo-api/
│   ├── tech-spec.yaml
│   ├── workflow.yaml
│   └── dev-progress.yaml
└── another-project/
    └── ...
```

Run multiple projects without overwriting state!

## Requirements

- Claude Code v1.0.33+
- tmux (for orchestra multi-agent)
- Target agents installed (codex, gemini, aider, droid) as needed

## License

MIT
