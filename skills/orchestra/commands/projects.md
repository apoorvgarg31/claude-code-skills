---
description: List all orchestra projects and their status
argument-hint: 
allowed-tools: Read, Bash, Glob
---

# List Orchestra Projects

Show all projects under `./state/` and their current phase.

## Process

```bash
ls -d ./state/*/ 2>/dev/null
```

For each project folder, read its `workflow.yaml` to get status.

## Output

```
🎼 Orchestra Projects

┌─────────────────┬───────────────────┬─────────────┐
│ Project         │ Current Phase     │ Status      │
├─────────────────┼───────────────────┼─────────────┤
│ todo-api        │ developer         │ in-progress │
│ hello-cli       │ test              │ in-progress │
│ my-app          │ complete          │ ✅ done     │
└─────────────────┴───────────────────┴─────────────┘

To continue a project:  /orchestra:continue <project-name>
To check details:       /orchestra:status <project-name>
```

## If no projects

```
No orchestra projects found.

Start one with: /orchestra:start Build a todo API
```
