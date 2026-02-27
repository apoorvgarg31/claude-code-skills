---
description: Delegate a specific phase to an agent in a new terminal
argument-hint: <phase> [agent]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Delegate Phase to Agent

Manually delegate a specific phase to an agent.

## Usage
- `/orchestra:delegate developer` — delegate developer phase to configured agent
- `/orchestra:delegate developer codex` — delegate developer phase to codex specifically

## Arguments
- `$ARGUMENTS` contains: phase name and optionally agent override

## Process

1. Parse arguments to get phase and optional agent override
2. Read `./.orchestra/<project-name>/config.yaml` for configured agent (or use override)
3. Read `./.orchestra/<project-name>/workflow.yaml` for current state
4. Spawn or reuse agent in tmux with appropriate context
5. Record session mapping in `./.orchestra/<project-name>/sessions.yaml`

## Supported Phases
- `developer` — Implementation
- `code-review` — Code review
- `test` — Testing
- `devops` — Deployment

## Spawning Pattern (Session Reuse)

```bash
# Resolve project name from workflow/config
# Load sessions.yaml and look up: sessions.<phase>.<agent>.tmux_session
# If mapped session exists and alive: reuse it

tmux has-session -t orchestra-<project>-<phase>-<agent> 2>/dev/null || \
  tmux new-session -d -s orchestra-<project>-<phase>-<agent> -c "$(pwd)"

# Send agent-specific command ONLY when creating a fresh session
tmux send-keys -t orchestra-<project>-<phase>-<agent> "<agent_command>" Enter
```

Update `./.orchestra/<project-name>/sessions.yaml` (create if missing):
```yaml
sessions:
  <phase>:
    <agent>:
      tmux_session: orchestra-<project>-<phase>-<agent>
      created_at: "<timestamp>"
      last_seen: "<timestamp>"
```

## Agent Commands

### Codex
```bash
codex --yolo 'You are the <PHASE> agent in an orchestra workflow.

PROJECT: $(pwd)
Read: .orchestra/<project>/tech-spec.yaml, .orchestra/<project>/workflow.yaml, .orchestra/<project>/<previous-phase>.yaml

<Phase-specific instructions>

Update .orchestra/<project>/<phase>-output.yaml when done. Add "status: complete" at top when finished.'
```

### Gemini CLI
```bash
gemini 'You are the <PHASE> agent in an orchestra workflow.

PROJECT: $(pwd)
Read: .orchestra/<project>/tech-spec.yaml, .orchestra/<project>/workflow.yaml

<Phase-specific instructions>

Update .orchestra/<project>/<phase>-output.yaml when done.'
```

### Aider
```bash
aider --message 'You are the <PHASE> agent. Read .orchestra/<project>/tech-spec.yaml for requirements. <Phase-specific instructions>'
```

### Claude
```bash
claude 'You are the <PHASE> agent in an orchestra workflow.

PROJECT: $(pwd)
Read state files for context.

<Phase-specific instructions>

Update .orchestra/<project>/<phase>-output.yaml when done.'
```

## After Spawning

Tell the user:
```
🚀 <Phase> agent (<agent>) spawned in tmux!

To interact:
  tmux attach -t orchestra-<project>-<phase>-<agent>

To detach (keep agent running):
  Ctrl+B, then D

I'll wait for .orchestra/<project>/<phase>-output.yaml to show "status: complete"
```
