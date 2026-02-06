---
description: Start a new payapp audit. Checks dependencies, guides project setup, PDF upload, and begins scanning.
argument-hint: [project-name]
allowed-tools: Read, Write, Edit, Bash(pdftoppm:*), Bash(pdfinfo:*), Bash(mkdir:*), Bash(ls:*), Bash(which:*), Bash(command:*), Bash(node:*), Bash(npm:*), Bash(bash:*), Glob
---

# Start a New PayApp Audit

## Step 0: Check Dependencies

**ALWAYS run this first before anything else.**

```bash
# Check all required system tools
missing=""
command -v pdftoppm >/dev/null 2>&1 || missing="$missing poppler-utils"
command -v pdfinfo >/dev/null 2>&1  || missing="$missing poppler-utils"
command -v qpdf >/dev/null 2>&1     || missing="$missing qpdf"
command -v zip >/dev/null 2>&1      || missing="$missing zip"
command -v node >/dev/null 2>&1     || missing="$missing nodejs"
echo "MISSING:$missing"
```

**If anything is missing**, tell the user:
```
⚠️ Missing dependencies detected. Please install them first:

  Ubuntu/Debian:
    sudo apt install -y poppler-utils qpdf zip nodejs npm

  macOS:
    brew install poppler qpdf node zip

Then run /payapp:start again.
```
**Do NOT proceed until all deps are present.**

**If all present**, also check Node.js Excel deps:
```bash
# Check if xlsx module is available
ls skills/payapp-auditor/scripts/node_modules/xlsx 2>/dev/null && echo "EXCEL_READY" || echo "EXCEL_MISSING"
```

If EXCEL_MISSING:
```bash
cd skills/payapp-auditor/scripts && npm install --production
```

Or if the skill is installed in ~/.claude/skills/:
```bash
SKILL_DIR=$(find ~/.claude/skills -type d -name "payapp-auditor" -maxdepth 2 2>/dev/null | head -1)
if [ -n "$SKILL_DIR" ]; then
  cd "$SKILL_DIR/scripts" && npm install --production
fi
```

## Step 1: Get project name

- If provided as argument, use it
- Otherwise ask: "What's the project name? (e.g., DTC PA07, Jackson Memorial PA03)"

## Step 2: Get PDF location

- Ask: "Where's the payapp PDF? Give me the file path or folder."
- If folder → list PDFs found, present numbered options
- If file → verify it exists with `ls -la`

## Step 3: Validate PDF

```bash
pdfinfo "<pdf-path>" | grep Pages
```
- Show page count to user
- If >300 pages, warn it'll take a few minutes

## Step 4: Create project

```bash
mkdir -p .payapp-audit/<project-slug>/pages
mkdir -p .payapp-audit/<project-slug>/vendors
mkdir -p .payapp-audit/<project-slug>/audit
mkdir -p .payapp-audit/<project-slug>/exports
```

## Step 5: Initialize workflow.yaml

Write workflow.yaml with project details and `current_phase: scan`

## Step 6: Convert PDF to PNG images

```bash
pdftoppm -png -r 150 "<pdf-path>" ".payapp-audit/<project-slug>/pages/page"
```
Tell user: "Converting PDF pages to images for analysis..."

## Step 7: Begin scanning

- Confirm: "✅ Project set up! Found [N] pages. Let me scan through your payapp..."
- Proceed directly to Phase 1: SCAN (read SKILL.md for scan instructions)
