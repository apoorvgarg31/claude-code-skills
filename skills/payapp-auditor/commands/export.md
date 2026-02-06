---
description: Regenerate or export audit results. Creates vendor Excel files, audit findings, and zip bundle.
argument-hint: [project-name] [--vendor <name>] [--findings] [--all]
allowed-tools: Read, Write, Bash(node:*), Bash(zip:*), Bash(ls:*), Bash(mkdir:*), Glob
---

# Export PayApp Audit Results

## Steps

1. **Find project** (same as continue.md logic)

2. **Determine what to export**
   - `--vendor <name>` → regenerate specific vendor Excel
   - `--findings` → regenerate audit findings Excel
   - `--all` → regenerate everything + zip
   - No args → ask user:
     ```
     What would you like to export?
     [1] All exports (zip bundle)
     [2] Specific vendor Excel
     [3] Audit findings only
     [4] Executive summary
     ```

3. **Generate requested exports**
   - Read vendor YAML data
   - Use `scripts/generate-excel.js` to create .xlsx files
   - Place in `exports/` directory

4. **Create zip bundle** (if --all or option 1)
   ```bash
   cd .payapp-audit/<project>
   zip -r exports/<project>-complete.zip exports/ vendors/
   ```

5. **Show output locations**
   ```
   📦 Exports ready:
   
   .payapp-audit/dtc-pa07/exports/
   ├── classification.xlsx
   ├── white-cap-lp.xlsx
   ├── aaa-automated.xlsx
   ├── audit-findings.xlsx
   └── dtc-pa07-complete.zip
   ```
