# Code Reviewer Skill

## Purpose

Perform deep, structured code reviews on files, pull requests, and entire codebases. Identify bugs, security vulnerabilities, performance issues, and code quality concerns with actionable feedback.

## How It Works

The code reviewer analyzes code through multiple lenses:

1. **Correctness** — Logic errors, edge cases, null safety, type mismatches
2. **Security** — Injection vulnerabilities, auth issues, data exposure, OWASP Top 10
3. **Performance** — Algorithmic complexity, memory leaks, unnecessary allocations, N+1 queries
4. **Maintainability** — Code clarity, naming, duplication, SOLID principles
5. **Accessibility** — WCAG compliance, ARIA attributes, keyboard navigation (for UI code)

## Review Methodology

### Phase 1: Context Gathering
- Understand the purpose of the change (PR description, commit messages, related issues)
- Identify the programming language, framework, and project conventions
- Check for existing tests and documentation

### Phase 2: Structural Analysis
- Review file organization and module boundaries
- Check import/dependency structure
- Verify naming conventions and code style consistency

### Phase 3: Deep Review
- Line-by-line analysis of changed code
- Cross-reference with existing codebase for consistency
- Check error handling paths
- Verify edge cases and boundary conditions

### Phase 4: Security Scan
- Input validation and sanitization
- Authentication and authorization checks
- Data exposure risks (logging, error messages)
- Dependency vulnerabilities

### Phase 5: Performance Review
- Algorithmic complexity analysis
- Database query patterns
- Memory allocation patterns
- Caching opportunities

### Phase 6: Report Generation
- Categorize findings by severity (Critical, High, Medium, Low, Info)
- Provide specific line references
- Include fix suggestions with code examples
- Summarize overall assessment

## Severity Levels

| Level | Description | Action Required |
|-------|-------------|-----------------|
| 🔴 Critical | Security vulnerability, data loss risk, crash | Must fix before merge |
| 🟠 High | Bugs, logic errors, significant perf issues | Should fix before merge |
| 🟡 Medium | Code quality, maintainability concerns | Fix recommended |
| 🔵 Low | Style, naming, minor improvements | Consider fixing |
| ⚪ Info | Observations, suggestions, praise | No action needed |

## Commands

See [commands.md](./commands.md) for available commands.

## Templates

Review report templates are in the `templates/` directory:
- `security-review.md` — Security-focused review template
- `performance-review.md` — Performance analysis template
- `quality-review.md` — General code quality template
- `accessibility-review.md` — UI/UX accessibility review template

## Checklists

Language-specific review checklists in `checklists/`:
- `python.md` — Python-specific review items
- `typescript.md` — TypeScript/JavaScript review items
- `react.md` — React component review items

## Configuration

The reviewer adapts to project conventions automatically. Override defaults by specifying:

```yaml
# .code-review.yml (project root)
severity_threshold: medium  # minimum severity to report
max_findings: 50            # cap on findings per review
include_praise: true        # include positive observations
languages:
  - python
  - typescript
style_guide: airbnb         # or google, standard, custom
```

## Best Practices

1. **Review in context** — Understand why the change was made before critiquing how
2. **Be specific** — Reference exact lines and provide code examples
3. **Prioritize** — Focus on critical/high items; don't bury important findings in noise
4. **Be constructive** — Suggest fixes, not just problems
5. **Acknowledge good code** — Positive feedback reinforces good practices
