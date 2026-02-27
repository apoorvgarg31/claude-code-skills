---
description: Continue to the next phase after an agent completes
argument-hint: 
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
---

# Continue Orchestra Workflow

Check the current state and automatically proceed to the next phase.

## Process

### 1. Identify project

List available projects:
```bash
ls -d ./.orchestra/*/ 2>/dev/null
```

If multiple projects exist, ask user:
```
Which project do you want to continue?
- todo-api
- hello-cli
```

Or user can specify: `/orchestra:continue todo-api`

### 2. Read current state

```bash
cat ./.orchestra/<project-name>/workflow.yaml
cat ./.orchestra/<project-name>/dev-progress.yaml 2>/dev/null
cat ./.orchestra/<project-name>/review-notes.yaml 2>/dev/null
cat ./.orchestra/<project-name>/test-results.yaml 2>/dev/null
cat ./.orchestra/<project-name>/sessions.yaml 2>/dev/null
```

### 2. Determine what's next

Check workflow.yaml for `current_phase` and check if that phase's output file has `status: complete`.

| Current Phase | Check File | Next Phase |
|--------------|------------|------------|
| developer | dev-progress.yaml | code-review |
| code-review | review-notes.yaml | test |
| test | test-results.yaml | devops |
| devops | deploy-status.yaml | complete |

### 3. If current phase complete → trigger next

Update workflow.yaml:
```yaml
current_phase: <next_phase>
phases:
  <previous>: complete
  <next>: in-progress
```

Then spawn or reuse the next agent (read from config.yaml) using the same session-reuse pattern as start.md, and update `sessions.yaml` with `last_seen`.

### 4. If current phase NOT complete

Tell user:
```
⏳ Current phase (<phase>) is still in progress.

Check on the agent:
  tmux attach -t orchestra-<project>-<phase>-<agent>

Or check status:
  /orchestra:status
```

### 5. If all phases complete

```
🎉 **Workflow Complete!**

All phases finished:
✅ Business Analyst — tech spec created
✅ Developer — features implemented  
✅ Code Review — code approved
✅ Test — tests passing
✅ DevOps — deployed (if configured)

Great work! Your project is ready.
```

## Example Flow

```
User: /orchestra:continue

BA: Checking state...

Developer phase shows "status: complete" in dev-progress.yaml.
Moving to Code Review phase.

🚀 Spawning code review agent (claude) in tmux...

[tmux session reused or created: orchestra-<project>-code-review-claude]

Code reviewer is running! 
  tmux attach -t orchestra-<project>-code-review-claude

Run /orchestra:continue again when code review is done.
```
