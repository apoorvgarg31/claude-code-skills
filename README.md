# Claude Code Skills

A collection of reusable skills for Claude Code. Each skill provides specialized capabilities for common development tasks.

## Available Skills

| Skill | Description | Install |
|-------|-------------|---------|
| [test-architect](./skills/test-architect/) | Generate comprehensive tests via interactive Q&A | `npm i @apoorvgarg-31/test-architect` |
| [pdf-to-data](./skills/pdf-to-data/) | Extract structured data from PDFs | `pip install pymupdf openpyxl` |

## Quick Start

### test-architect

Generate tests through an interactive conversation:

```bash
/test-architect src/utils/parser.ts
/test-architect lib/auth.py --framework pytest
```

### pdf-to-data

Extract text, tables, and form data from PDFs:

```bash
/pdf-to-data invoice.pdf --format xlsx
/pdf-to-data report.pdf --tables-only
```

## Structure

```
claude-code-skills/
├── README.md
└── skills/
    ├── test-architect/    # Test generation via Q&A
    │   ├── SKILL.md
    │   ├── README.md
    │   ├── package.json
    │   └── scripts/
    └── pdf-to-data/       # PDF data extraction
        ├── SKILL.md
        ├── README.md
        ├── package.json
        └── scripts/
```

## Contributing

1. Fork this repo
2. Create a new skill in `skills/your-skill-name/`
3. Include: `SKILL.md`, `README.md`, `package.json`, and `scripts/`
4. Submit a PR

## License

MIT
