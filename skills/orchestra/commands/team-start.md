---
description: Start the tmux team dashboard for a project
argument-hint: <project>
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Orchestra Team Dashboard (Start)

Create a tmux dashboard that shows all live agent sessions together.

## Process

### 1. Identify project
- Use `$ARGUMENTS` or ask the user to pick from `./.orchestra/*/`.

### 2. Load sessions
Read:
- `./.orchestra/<project-name>/config.yaml`
- `./.orchestra/<project-name>/sessions.yaml`

If `sessions.yaml` is missing, create it with:
```yaml
sessions: {}
```

### 3. Determine dashboard session name
Use the configured session prefix and append `-team`:
```
<session_prefix>-team
```
Example: `orchestra-todo-api-team`

### 4. Check which agent sessions are alive
For each `sessions.<phase>.<agent>.tmux_session`:
```bash
tmux has-session -t <session> 2>/dev/null && echo "alive: <session>" || echo "stale: <session>"
```

### 5. Create or reuse the team dashboard
```bash
tmux has-session -t <team_session> 2>/dev/null || \
  tmux new-session -d -s <team_session> -c "$(pwd)" -n "team"
```

### 6. Populate panes with live agent sessions (interactive)
For each live agent session, create a pane and attach:
```bash
# First pane
tmux send-keys -t <team_session> "TMUX= tmux attach -t <agent_session_1>" Enter

# Additional panes
tmux split-window -t <team_session> -c "$(pwd)"
tmux send-keys -t <team_session>.1 "TMUX= tmux attach -t <agent_session_2>" Enter

# Repeat for each live agent session, then tile layout

tmux select-layout -t <team_session> tiled
```

### 7. Record dashboard session (optional)
Update `./.orchestra/<project-name>/sessions.yaml`:
```yaml
dashboards:
  team:
    tmux_session: <team_session>
    created_at: "<timestamp>"
    last_seen: "<timestamp>"
```

### 8. Tell the user
```
🎼 Team dashboard ready!

Attach with:
  tmux attach -t <team_session>

All live agent sessions are visible and interactive in tiled panes.
```
