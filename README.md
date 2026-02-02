# Claude Code Skills

A collection of reusable skills for Claude Code. Each skill provides specialized capabilities for common development tasks.

## Installation

Add the marketplace to Claude Code:

```bash
claude plugin marketplace add apoorvgarg31/claude-code-skills
```

Then install the skills you want:

```bash
claude plugin install dev-workflow@apoorv-skills
claude plugin install test-architect@apoorv-skills
claude plugin install pdf-to-data@apoorv-skills
```

## Available Skills

| Skill | Command | Description |
|-------|---------|-------------|
| dev-workflow | `/dev-workflow:start` | Complete development workflow with BA, Developer, Code Review, Test agents |
| test-architect | `/test-architect:generate` | Generate comprehensive tests via interactive Q&A |
| pdf-to-data | `/pdf-to-data:extract` | Extract structured data from PDFs to JSON/CSV/Excel |

## Usage

### dev-workflow

Complete development workflow from requirements to tested code:

```
/dev-workflow:start Build a CLI todo app in Python
```

Creates `./state/` folder in your project with:
- `tech-spec.yaml` - Requirements and architecture
- `workflow.yaml` - Progress tracking
- `dev-progress.yaml` - Task completion status

### test-architect

Generate tests through an interactive conversation:

```
/test-architect:generate src/utils/parser.ts --framework pytest
```

### pdf-to-data

Extract text, tables, and form data from PDFs:

```
/pdf-to-data:extract invoice.pdf --format json
```

For pdf-to-data, install Python dependencies:
```bash
pip install pymupdf openpyxl
```

## License

MIT
