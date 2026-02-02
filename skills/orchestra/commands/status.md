---
description: Check the status of the orchestra workflow and all agents
argument-hint: 
---

# Orchestra Status

Check the current workflow status and agent activity.

## Process

1. Read `./state/workflow.yaml` for overall status
2. Read phase-specific files for details
3. Check tmux for running agents

## Check tmux sessions

```bash
tmux list-windows -t orchestra 2>/dev/null || echo "No orchestra session"
```

## Display Status

Show:
- Current phase
- Status of each phase (pending/in-progress/complete)
- Which agent is assigned to each phase
- Any active tmux windows

## Example Output

```
🎼 Orchestra Status

Project: Todo CLI App
Current Phase: developer (in-progress)

Phases:
  ✅ business-analyst (opus) — complete
  🔄 developer (codex) — in-progress [tmux: orchestra:developer]
  ⏳ code-review (claude) — pending
  ⏳ test (opus) — pending
  ⏳ devops (opus) — pending

Active Agents:
  • orchestra:developer — codex running

To attach to developer: tmux attach -t orchestra:developer
```
