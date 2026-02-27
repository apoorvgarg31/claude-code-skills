---
description: View or attach to the team dashboard
argument-hint: <project>
allowed-tools: Read, Bash, Glob, Grep
---

# Orchestra Team Dashboard (View)

Attach to the existing team dashboard if it exists; otherwise suggest starting it.

## Process

1. Identify project from `$ARGUMENTS` or by listing `./.orchestra/*/`.
2. Read `./.orchestra/<project-name>/sessions.yaml` for `dashboards.team.tmux_session`.
3. If the dashboard session exists, attach:
```bash
tmux attach -t <team_session>
```
4. If missing, suggest running:
```
/orchestra:team:start <project>
```
