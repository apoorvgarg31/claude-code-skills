---
description: Start a new payapp audit. Guides you through project setup, PDF upload, and begins the scanning process.
argument-hint: [project-name]
allowed-tools: Read, Write, Edit, Bash(pdftoppm:*), Bash(pdfinfo:*), Bash(mkdir:*), Bash(ls:*), Glob
---

# Start a New PayApp Audit

## Steps

1. **Get project name**
   - If provided as argument, use it
   - Otherwise ask: "What's the project name? (e.g., DTC PA07, Jackson Memorial PA03)"

2. **Get PDF location**
   - Ask: "Where's the payapp PDF? Give me the file path or folder."
   - If folder → list PDFs found, present numbered options
   - If file → verify it exists with `ls -la`

3. **Validate PDF**
   ```bash
   pdfinfo "<pdf-path>" | grep Pages
   ```
   - Show page count to user
   - If >300 pages, warn it'll take a few minutes

4. **Create project**
   ```bash
   mkdir -p .payapp-audit/<project-slug>/pages
   mkdir -p .payapp-audit/<project-slug>/vendors
   mkdir -p .payapp-audit/<project-slug>/audit
   mkdir -p .payapp-audit/<project-slug>/exports
   ```

5. **Initialize workflow.yaml**
   Write workflow.yaml with project details and `current_phase: scan`

6. **Convert PDF to PNG images**
   ```bash
   pdftoppm -png -r 150 "<pdf-path>" ".payapp-audit/<project-slug>/pages/page"
   ```
   Tell user: "Converting PDF pages to images for analysis..."

7. **Begin scanning**
   - Confirm: "✅ Project set up! Found [N] pages. Let me scan through your payapp..."
   - Proceed directly to Phase 1: SCAN (read SKILL.md for scan instructions)
