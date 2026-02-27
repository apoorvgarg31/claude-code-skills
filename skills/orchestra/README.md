# Orchestra 🎼

Multi-agent orchestration for Claude Code. Opus 4.5 orchestrates while delegating work to specialized AI agents (Codex, Gemini CLI, Aider) running in separate tmux terminals.

## Concept

```
┌─────────────────────────────────────────────────────────┐
│  OPUS (Claude Code) — ORCHESTRATOR                       │
│  • Manages workflow & state                              │
│  • Handles BA phase (requirements)                       │
│  • Delegates to other agents                             │
└─────────────────────────────────────────────────────────┘
         │ spawns in tmux
         ▼
┌─────────────────────────────────────────────────────────┐
│  DEVELOPER TERMINAL (Codex / Gemini / Aider / Claude)   │
│  • Receives context from .orchestra/                          │
│  • User interacts here for coding                        │
│  • Updates .orchestra/ when done                              │
└─────────────────────────────────────────────────────────┘
```

## Installation

```bash
claude plugin marketplace add apoorvgarg31/claude-code-skills
claude plugin install orchestra@apoorv-skills
```

## Usage

### 1. Configure your workflow (interactive)
```
/orchestra:init
```
This walks you through choosing agents for each phase.

### 2. Start a new project
```
/orchestra:start Build a REST API for todo management
```

### 3. Check status
```
/orchestra:status
```

### 4. Team dashboard (tmux)
```
/orchestra:team:start <project>
/orchestra:team:status <project>   # optional
/orchestra:team:view <project>     # optional (alias style)
/orchestra:team:cleanup <project>  # optional, safe by default
```

### 5. Manually delegate a phase
```
/orchestra:delegate developer codex
```

## Configuration

During setup, you choose which agent handles each phase:

```yaml
# .orchestra/config.yaml
agents:
  business-analyst: opus      # Always Opus
  developer: codex            # Codex for coding
  code-review: claude         # Claude for review
  test: opus                  # Opus for testing
  devops: opus                # Opus for deployment
```

## Supported Agents

| Agent | Command | Best For |
|-------|---------|----------|
| `opus` | (handled directly) | Complex reasoning, BA |
| `codex` | `codex --yolo` | Fast coding |
| `claude` | `claude` | Thorough review |
| `gemini` | `gemini` | Alternative coding |
| `aider` | `aider --message` | Git-integrated coding |
| `droid` | `droid` | Autonomous coding |

## How It Works

1. **Setup**: Configure which agents handle which phases
2. **BA Phase**: Opus gathers requirements, creates tech-spec.yaml
3. **Developer Phase**: Spawns configured agent in tmux, passes context
4. **Code Review**: Spawns reviewer agent, checks code quality
5. **Test**: Spawns test agent, runs/creates tests
6. **DevOps**: Spawns deploy agent (optional)

State files in `./.orchestra/` serve as the communication layer between agents.

New in v1.2: session reuse is recorded in `./.orchestra/<project>/sessions.yaml`, so returning to a phase reuses the same tmux session and preserves agent context.

## License

MIT
