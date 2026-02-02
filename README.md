# Claude Code Skills

A collection of reusable skills for Claude Code. Each skill provides specialized capabilities for common development tasks.

## Available Skills

| Skill | Description | Usage |
|-------|-------------|-------|
| [dev-workflow](./skills/dev-workflow/) | Complete development workflow with BA, Developer, Code Review, Test agents | `/dev-workflow` |
| [test-architect](./skills/test-architect/) | Generate comprehensive tests via interactive Q&A | `/test-architect <file>` |
| [pdf-to-data](./skills/pdf-to-data/) | Extract structured data from PDFs to JSON/CSV/Excel | `/pdf-to-data <file>` |

## Quick Start

### dev-workflow

Complete development workflow from requirements to tested code:

```bash
/dev-workflow Build a CLI todo app in Python

# Phases: BA → Developer → Code Review → Test → DevOps
# Creates state/ folder to track progress
# Commits after each task
```

### test-architect

Generate tests through an interactive conversation:

```bash
/test-architect src/utils/parser.ts
/test-architect lib/auth.py --framework pytest
```

### pdf-to-data

Extract text, tables, and form data from PDFs:

```bash
/pdf-to-data invoice.pdf --format json
/pdf-to-data report.pdf --format xlsx
```

## Installation

Copy the skill folder to `~/.claude/skills/`:

```bash
# Clone the repo
git clone https://github.com/apoorvgarg31/claude-code-skills.git

# Copy skills you want
cp -r claude-code-skills/skills/dev-workflow ~/.claude/skills/
cp -r claude-code-skills/skills/test-architect ~/.claude/skills/
cp -r claude-code-skills/skills/pdf-to-data ~/.claude/skills/
```

For pdf-to-data, also install Python dependencies:
```bash
pip install pymupdf openpyxl
```

## Structure

```
claude-code-skills/
├── README.md
└── skills/
    ├── dev-workflow/      # Full dev workflow (BA → Dev → Review → Test)
    │   ├── SKILL.md
    │   ├── README.md
    │   ├── agents/
    │   └── templates/
    ├── test-architect/    # Test generation via Q&A
    │   ├── SKILL.md
    │   └── README.md
    └── pdf-to-data/       # PDF data extraction
        ├── SKILL.md
        ├── README.md
        └── scripts/
```

## License

MIT
