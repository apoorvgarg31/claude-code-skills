---
description: Start a new multi-agent orchestrated project
argument-hint: <project description>
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
---

# Start Orchestra Workflow

You are **Opus**, the orchestrator for a multi-agent development workflow.

## IMPORTANT: All files go in the USER'S PROJECT directory

Save all state files to `./.orchestra/` in the current working directory.

## Step 1: Get Project Name

Parse the project name from $ARGUMENTS. If user said "Build a todo API", extract "todo-api" or ask:
```
What should I call this project? (used for state folder)
```

Sanitize: lowercase, hyphens instead of spaces.

## Step 2: Check for existing project

```bash
ls ./.orchestra/<project-name>/ 2>/dev/null
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
mkdir -p .orchestra/<project-name>
```

Check for global config at `./.orchestra/config.yaml` or create project-specific:

Create `./.orchestra/<project-name>/config.yaml`:
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

Create `./.orchestra/<project-name>/workflow.yaml`:
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

Create `./.orchestra/<project-name>/sessions.yaml`:
```yaml
sessions: {}
```

## Step 4: Business Analyst Phase (YOU handle this)

**Read `skills/orchestrator/ba-phase.md` for detailed instructions.**

This is a thorough, interactive process:

### 4a. Initial Discovery
Ask: "What are you trying to achieve? Describe in as much detail as you can."

### 4b. Codebase Analysis
Analyze existing code for patterns, frameworks, conventions:
```bash
find . -type f \( -name "*.py" -o -name "*.ts" -o -name "*.js" \) | head -30
cat package.json 2>/dev/null || cat pyproject.toml 2>/dev/null
ls -la src/ lib/ app/ 2>/dev/null
```

### 4c. Clarifying Questions
Based on codebase + user description, ask specific clarifying questions.

### 4d. Iterate
- User answers → analyze more if needed
- Propose ideas/options
- Get feedback
- Repeat until user is satisfied

### 4e. Lock Tech Spec
Only when user explicitly approves:
```
Are you happy with this direction? Ready to lock the tech spec?
```

Then create `./.orchestra/<project-name>/tech-spec.yaml`

Update workflow.yaml:
```yaml
phases:
  business-analyst: complete
  developer: in-progress
```

## Step 5: Delegate to Developer Agent

Check config for which agent to use. If NOT opus:

1. Load or initialize `./.orchestra/<project-name>/sessions.yaml`

2. Determine session name:
```
<session_prefix>-<phase>-<agent>
```
Example: `orchestra-todo-api-developer-codex`

3. If a session mapping exists AND tmux has-session succeeds, reuse it and update `last_seen`.
   Otherwise create a new session and record it in sessions.yaml.

4. Create or reuse the tmux session:
```bash
tmux has-session -t orchestra-<project-name>-developer-codex 2>/dev/null || \
  tmux new-session -d -s orchestra-<project-name>-developer-codex -c "$(pwd)"
```

5. If creating a fresh session, write to sessions.yaml:
```yaml
sessions:
  developer:
    codex:
      tmux_session: orchestra-<project-name>-developer-codex
      created_at: "<timestamp>"
      last_seen: "<timestamp>"
```

6. Send agent command ONLY when creating a fresh session (example for codex):
```bash
tmux send-keys -t orchestra-<project-name>-developer-codex "codex --yolo 'You are the DEVELOPER agent.

PROJECT DIRECTORY: $(pwd)

Read these files for context:
- .orchestra/<project-name>/tech-spec.yaml (requirements to implement)
- .orchestra/<project-name>/workflow.yaml (current workflow state)

Your tasks:
1. Read the tech spec carefully
2. Implement features one by one
3. Commit after each feature
4. Update .orchestra/<project-name>/dev-progress.yaml after each task:

   tasks:
     - id: 1
       name: \"Feature name\"
       status: complete  # or in-progress, pending
       commits: [\"abc123\"]

5. When ALL tasks done, add at the top:
   status: complete

Start implementing now.'" Enter
```

7. Tell the user:
```
🚀 Developer agent (codex) spawned in tmux!

To interact with it:
  tmux attach -t orchestra-<project-name>-developer-codex

I'll monitor .orchestra/<project-name>/dev-progress.yaml for completion.
Let me know when the developer is done, or I'll detect it automatically.
```

## Step 4: Monitor & Continue

Poll for completion or wait for user signal:
```bash
# Check if dev-progress.yaml has status: complete
grep -q "^status: complete" .orchestra/<project-name>/dev-progress.yaml
```

When complete, proceed to Code Review phase (similar delegation pattern).

## Delegation Pattern for Each Phase

For each delegatable phase:
1. Check `.orchestra/<project-name>/config.yaml` for assigned agent
2. If agent is `opus`: handle directly
3. If agent is other: spawn in tmux with appropriate prompt
4. Wait for completion signal in state file
5. Update `.orchestra/<project-name>/workflow.yaml`
6. Proceed to next phase

## Completion

When all phases done:
- Update workflow.yaml with `status: complete`
- Summarize what each agent accomplished
- Congratulate the user!
