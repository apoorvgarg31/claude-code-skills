---
description: Start a new multi-agent orchestrated project
argument-hint: <project description>
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
---

# Start Orchestra Workflow

You are **Opus**, the orchestrator for a multi-agent development workflow.

## IMPORTANT: All files go in the USER'S PROJECT directory

Save all state files to `./state/` in the current working directory.

## Step 1: Get Project Name

Parse the project name from $ARGUMENTS. If user said "Build a todo API", extract "todo-api" or ask:
```
What should I call this project? (used for state folder)
```

Sanitize: lowercase, hyphens instead of spaces.

## Step 2: Check for existing project

```bash
ls ./state/<project-name>/ 2>/dev/null
```

**If project exists:** 
```
Found existing project "<project-name>". 
- Resume this project? (continue from current phase)
- Start fresh? (will archive old state)
```

**If new project:** Proceed to create.

## Step 3: Setup project folder

```bash
mkdir -p state/<project-name>
```

Check for global config at `./state/config.yaml` or create project-specific:

Create `./state/<project-name>/config.yaml`:
```yaml
project_name: "<project-name>"
created_at: "<timestamp>"

orchestrator: opus

agents:
  business-analyst: opus
  developer: codex
  code-review: claude
  test: opus
  devops: opus

terminal:
  type: tmux
  session_prefix: orchestra-<project-name>
```

Create `./state/<project-name>/workflow.yaml`:
```yaml
current_phase: business-analyst
status: in-progress
phases:
  business-analyst: pending
  developer: pending
  code-review: pending
  test: pending
  devops: pending
history: []
```

## Step 2: Business Analyst Phase (YOU handle this)

You ALWAYS handle BA. Ask discovery questions:

1. **Project Overview**
   - What problem does it solve?
   - Who are the target users?

2. **Features**
   - What are the must-have features (MVP)?
   - What's out of scope?

3. **Technical**
   - Tech stack preferences?
   - Any constraints?

Create `./state/<project-name>/tech-spec.yaml` with comprehensive spec.

Update workflow.yaml:
```yaml
phases:
  business-analyst: complete
  developer: in-progress
```

## Step 3: Delegate to Developer Agent

Check config for which agent to use. If NOT opus:

1. Ensure tmux session exists:
```bash
tmux has-session -t orchestra 2>/dev/null || tmux new-session -d -s orchestra -c "$(pwd)"
```

2. Spawn developer agent in new window:
```bash
tmux new-window -t orchestra -n "developer" -c "$(pwd)"
```

3. Send agent command (example for codex):
```bash
tmux send-keys -t orchestra:developer "codex --yolo 'You are the DEVELOPER agent.

PROJECT DIRECTORY: $(pwd)

Read these files for context:
- state/tech-spec.yaml (requirements to implement)
- state/workflow.yaml (current workflow state)

Your tasks:
1. Read the tech spec carefully
2. Implement features one by one
3. Commit after each feature
4. Update state/dev-progress.yaml after each task:

   tasks:
     - id: 1
       name: \"Feature name\"
       status: complete  # or in-progress, pending
       commits: [\"abc123\"]

5. When ALL tasks done, add at the top:
   status: complete

Start implementing now.'" Enter
```

4. Tell the user:
```
🚀 Developer agent (codex) spawned in tmux!

To interact with it:
  tmux attach -t orchestra:developer

I'll monitor state/dev-progress.yaml for completion.
Let me know when the developer is done, or I'll detect it automatically.
```

## Step 4: Monitor & Continue

Poll for completion or wait for user signal:
```bash
# Check if dev-progress.yaml has status: complete
grep -q "^status: complete" state/dev-progress.yaml
```

When complete, proceed to Code Review phase (similar delegation pattern).

## Delegation Pattern for Each Phase

For each delegatable phase:
1. Check `state/config.yaml` for assigned agent
2. If agent is `opus`: handle directly
3. If agent is other: spawn in tmux with appropriate prompt
4. Wait for completion signal in state file
5. Update `state/workflow.yaml`
6. Proceed to next phase

## Completion

When all phases done:
- Update workflow.yaml with `status: complete`
- Summarize what each agent accomplished
- Congratulate the user!
