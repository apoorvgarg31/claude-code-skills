---
description: Clean up stale tmux sessions and session mappings (safe by default)
argument-hint: <project>
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
---

# Orchestra Team Dashboard (Cleanup - Safe)

Remove stale session entries and optionally kill tmux sessions. This command is SAFE by default and does not kill anything without explicit user confirmation.

## Process

1. Identify project from `$ARGUMENTS` or by listing `./.orchestra/*/`.
2. Read `./.orchestra/<project-name>/sessions.yaml`.
3. Detect stale sessions:
```bash
tmux has-session -t <session> 2>/dev/null || echo "stale: <session>"
```
4. Present a summary and ask for explicit confirmation before killing or deleting mappings.

### Default (no destructive changes)
- Show stale sessions
- Suggest next action

### If user confirms cleanup
- For each stale session, remove mapping from `sessions.yaml`
- If user also confirms killing sessions, run:
```bash
tmux kill-session -t <session>
```

## Example Prompt
```
Found 2 stale sessions in sessions.yaml:
  - orchestra-todo-api-test-opus
  - orchestra-todo-api-devops-opus

Do you want to remove these mappings from sessions.yaml? (no tmux kill)
```
