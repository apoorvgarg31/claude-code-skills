---
description: Check the status of the orchestra workflow and all agents
argument-hint: 
allowed-tools: Read, Bash, Glob
---

# Orchestra Status

Check the current workflow status and agent activity.

## Process

### 1. List all projects

```bash
ls -d ./.orchestra/*/ 2>/dev/null
```

Show all projects:
```
🎼 Orchestra Projects

  todo-api      — developer (in-progress)
  hello-cli     — complete
  new-project   — business-analyst (in-progress)
```

### 2. If user specifies project or only one exists

Read `./.orchestra/<project-name>/workflow.yaml` and `./.orchestra/<project-name>/sessions.yaml` for details.

## Check tmux sessions

```bash
# For each mapped session in sessions.yaml:
tmux has-session -t <session> 2>/dev/null && echo "alive: <session>" || echo "stale: <session>"
```

## Display Status

Show:
- Current phase
- Status of each phase (pending/in-progress/complete)
- Which agent is assigned to each phase
- Any active tmux sessions from sessions.yaml

## Example Output

```
🎼 Orchestra Status

Project: Todo CLI App
Current Phase: developer (in-progress)

Phases:
  ✅ business-analyst (opus) — complete
  🔄 developer (codex) — in-progress [tmux: orchestra-<project>-developer-codex]
  ⏳ code-review (claude) — pending
  ⏳ test (opus) — pending
  ⏳ devops (opus) — pending

Active Agents:
  • orchestra-<project>-developer-codex — codex running

To attach to developer: tmux attach -t orchestra-<project>-developer-codex
```
