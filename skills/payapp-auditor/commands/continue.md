---
description: Resume a payapp audit project. Picks up from where you left off.
argument-hint: [project-name]
allowed-tools: Read, Write, Edit, Bash(pdftoppm:*), Bash(pdfinfo:*), Bash(ls:*), Bash(node:*), Bash(zip:*), Glob, Grep, Task
---

# Continue a PayApp Audit

## Steps

1. **Find projects**
   ```bash
   ls -d .payapp-audit/*/
   ```

2. **Select project**
   - If argument provided, use it
   - If only one project exists, use it automatically
   - If multiple → list with numbered options:
     ```
     Found 3 projects:
     [1] dtc-pa07 (Phase: extract, 65% complete)
     [2] jackson-pa03 (Phase: scan, 20% complete)
     [3] miami-pa12 (Phase: audit, 90% complete)
     ```

3. **Read project state**
   - Read `workflow.yaml` for current phase
   - Read relevant state files for the current phase

4. **Resume from current phase**
   - Show user: "Resuming [project] from [phase]..."
   - Follow SKILL.md instructions for that phase
   - Pick up where we left off based on state files

5. **Phase-specific resume logic**
   - **scan**: Check `scratchpad.yaml` → `scanned_through` → continue from next batch
   - **classify**: Re-read scratchpad, continue building document tree
   - **extract**: Check which vendors are done → continue with next vendor
   - **audit**: Re-run audit checks on all extracted data
   - **report**: Generate final exports
