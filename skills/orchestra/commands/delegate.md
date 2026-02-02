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
2. Read `./.orchestra/config.yaml` for configured agent (or use override)
3. Read `./.orchestra/workflow.yaml` for current state
4. Spawn agent in tmux with appropriate context

## Supported Phases
- `developer` — Implementation
- `code-review` — Code review
- `test` — Testing
- `devops` — Deployment

## Spawning Pattern

```bash
# Ensure tmux session exists
tmux has-session -t orchestra 2>/dev/null || tmux new-session -d -s orchestra -c "$(pwd)"

# Create window for this phase
tmux new-window -t orchestra -n "<phase>" -c "$(pwd)"

# Send agent-specific command
tmux send-keys -t orchestra:<phase> "<agent_command>" Enter
```

## Agent Commands

### Codex
```bash
codex --yolo 'You are the <PHASE> agent in an orchestra workflow.

PROJECT: $(pwd)
Read: .orchestra/tech-spec.yaml, .orchestra/workflow.yaml, .orchestra/<previous-phase>.yaml

<Phase-specific instructions>

Update .orchestra/<phase>-output.yaml when done. Add "status: complete" at top when finished.'
```

### Gemini CLI
```bash
gemini 'You are the <PHASE> agent in an orchestra workflow.

PROJECT: $(pwd)
Read: .orchestra/tech-spec.yaml, .orchestra/workflow.yaml

<Phase-specific instructions>

Update .orchestra/<phase>-output.yaml when done.'
```

### Aider
```bash
aider --message 'You are the <PHASE> agent. Read .orchestra/tech-spec.yaml for requirements. <Phase-specific instructions>'
```

### Claude
```bash
claude 'You are the <PHASE> agent in an orchestra workflow.

PROJECT: $(pwd)
Read state files for context.

<Phase-specific instructions>

Update .orchestra/<phase>-output.yaml when done.'
```

## After Spawning

Tell the user:
```
🚀 <Phase> agent (<agent>) spawned in tmux!

To interact:
  tmux attach -t orchestra:<phase>

To detach (keep agent running):
  Ctrl+B, then D

I'll wait for .orchestra/<phase>-output.yaml to show "status: complete"
```
