# Code Reviewer Commands

## `/review:file <path>`

Review a single file for code quality, bugs, and security issues.

### Usage
```
/review:file src/auth/login.ts
/review:file --severity high src/utils/parser.py
/review:file --focus security src/api/handlers.ts
```

### Options
| Option | Description | Default |
|--------|-------------|---------|
| `--severity <level>` | Minimum severity to report (critical, high, medium, low, info) | `low` |
| `--focus <area>` | Focus on specific area (security, performance, quality, accessibility) | all |
| `--format <fmt>` | Output format (markdown, json, inline) | `markdown` |
| `--max-findings <n>` | Maximum number of findings | `50` |

### Workflow
1. Read the target file
2. Detect language and framework
3. Load relevant checklist from `checklists/`
4. Analyze code through all review lenses
5. Generate findings with severity, line numbers, and suggestions
6. Output report using appropriate template

---

## `/review:pr [number|url]`

Review a pull request, analyzing all changed files in context.

### Usage
```
/review:pr 42
/review:pr https://github.com/org/repo/pull/42
/review:pr --base main --head feature/auth
```

### Options
| Option | Description | Default |
|--------|-------------|---------|
| `--base <branch>` | Base branch for comparison | auto-detect |
| `--head <branch>` | Head branch for comparison | current branch |
| `--severity <level>` | Minimum severity to report | `low` |
| `--include-tests` | Also review test files | `false` |
| `--diff-only` | Only review changed lines (not full files) | `false` |

### Workflow
1. Fetch PR metadata (title, description, labels)
2. Get the diff (changed files and hunks)
3. For each changed file:
   a. Read the full file for context
   b. Focus analysis on changed regions
   c. Check for related test coverage
4. Cross-file analysis (dependencies, consistency)
5. Generate PR-level summary with per-file findings
6. Include overall recommendation (Approve, Request Changes, Comment)

---

## `/review:security <path|glob>`

Perform a security-focused review on one or more files.

### Usage
```
/review:security src/api/
/review:security "src/**/*.ts"
/review:security src/auth/oauth.py --owasp
```

### Options
| Option | Description | Default |
|--------|-------------|---------|
| `--owasp` | Check against OWASP Top 10 specifically | `false` |
| `--cwe` | Include CWE identifiers in findings | `false` |
| `--severity <level>` | Minimum severity to report | `medium` |
| `--include-deps` | Check dependency versions for known CVEs | `false` |

### Security Checks
- **Injection** — SQL injection, XSS, command injection, path traversal
- **Authentication** — Weak password handling, session management, token storage
- **Authorization** — Missing access controls, IDOR vulnerabilities, privilege escalation
- **Data Exposure** — Sensitive data in logs, error messages, API responses
- **Configuration** — Hardcoded secrets, debug mode in production, insecure defaults
- **Cryptography** — Weak algorithms, improper key management, missing encryption
- **Input Validation** — Missing or insufficient validation, type coercion issues
- **Dependencies** — Known CVEs in dependencies (with `--include-deps`)

### Workflow
1. Identify target files
2. Load security checklist for detected language
3. Scan for common vulnerability patterns
4. Check for hardcoded secrets (API keys, passwords, tokens)
5. Analyze data flow for injection paths
6. Review auth/authz implementation
7. Generate security report with CVSS-like severity scores

---

## `/review:performance <path|glob>`

Analyze code for performance issues and optimization opportunities.

### Usage
```
/review:performance src/services/
/review:performance src/data/query-builder.ts
/review:performance "src/**/*.py" --threshold high
```

### Options
| Option | Description | Default |
|--------|-------------|---------|
| `--threshold <level>` | Minimum impact to report (critical, high, medium, low) | `medium` |
| `--focus <area>` | Specific focus (cpu, memory, io, network) | all |
| `--include-benchmarks` | Suggest benchmark code for findings | `false` |

### Performance Checks
- **Algorithmic Complexity** — O(n²) loops, unnecessary iterations, suboptimal data structures
- **Memory** — Leaks, excessive allocations, large object retention, missing cleanup
- **Database** — N+1 queries, missing indexes, unbounded queries, connection pooling
- **I/O** — Synchronous blocking, missing streaming, excessive file operations
- **Caching** — Missing caching opportunities, cache invalidation issues
- **Concurrency** — Race conditions, deadlocks, thread safety, async bottlenecks
- **Bundle Size** — Large imports, tree-shaking blockers, unnecessary dependencies
- **Rendering** — Unnecessary re-renders, missing memoization, layout thrashing (for UI)

### Workflow
1. Identify target files and detect language/framework
2. Analyze algorithmic complexity of functions
3. Check for common performance anti-patterns
4. Review database query patterns
5. Identify memory management concerns
6. Generate performance report with estimated impact
7. Include optimization suggestions with example code
