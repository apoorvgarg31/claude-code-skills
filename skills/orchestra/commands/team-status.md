---
description: Show team dashboard status and live agent sessions
argument-hint: <project>
allowed-tools: Read, Bash, Glob, Grep
---

# Orchestra Team Dashboard (Status)

Show which agent sessions are live and whether the team dashboard session exists.

## Process

1. Identify project from `$ARGUMENTS` or by listing `./.orchestra/*/`.
2. Read `./.orchestra/<project-name>/sessions.yaml`.
3. For each mapped session:
```bash
tmux has-session -t <session> 2>/dev/null && echo "alive: <session>" || echo "stale: <session>"
```
4. Check dashboard session (if recorded):
```bash
tmux has-session -t <team_session> 2>/dev/null && echo "dashboard: alive" || echo "dashboard: missing"
```

## Example Output
```
🎼 Team Dashboard Status

Agents:
  ✅ orchestra-todo-api-developer-codex
  ✅ orchestra-todo-api-code-review-claude
  ❌ orchestra-todo-api-test-opus (stale)

Dashboard:
  ✅ orchestra-todo-api-team
```
