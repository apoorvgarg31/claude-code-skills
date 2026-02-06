---
description: Check the status of a payapp audit project. Shows current phase, progress, and findings so far.
argument-hint: [project-name]
allowed-tools: Read, Bash(ls:*), Glob
---

# PayApp Audit Status

## Steps

1. **Find project** (same as continue.md logic)

2. **Read workflow.yaml**

3. **Display status**
   ```
   📊 PayApp Audit: DTC PA07
   
   Phase: Extract (3/5)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 60%
   
   ✅ Init — Complete
   ✅ Scan — 156 pages scanned
   ✅ Classify — 42 documents, 11 vendors
   🔄 Extract — 7/11 vendors done
   ⏳ Audit — Pending
   ⏳ Report — Pending
   
   Vendors extracted:
   ✅ White Cap LP (3 docs, $866.61)
   ✅ AAA Automated (2 docs, $736.00)
   ✅ Eric's Industrial (4 docs, $2,340.00)
   ... 4 more done
   🔄 Tecta America — In progress
   ⏳ 3 vendors remaining
   ```

4. **Show findings so far** (if audit phase reached)
