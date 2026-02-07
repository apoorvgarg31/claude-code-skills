# Workflow Phases — Detailed Instructions

## Key Principle: ASK, DON'T ASSUME

Between every phase, **stop and ask the user to confirm** before proceeding. Never silently move to the next phase. Present what you found, ask for confirmation/corrections, then proceed.

---

## Phase 0: INIT (`/payapp:start`)

1. Ask for project name (e.g., "DTC PA07")
2. Ask for PDF file path or folder location
3. If folder given → use `ls` to list PDFs, present numbered options
4. Verify file exists using `ls -la <path>`
5. Get page count: `pdfinfo <file> | grep Pages`
6. Create project directory: `.payapp-audit/<project-slug>/`
7. Initialize workflow.yaml with status
8. Convert PDF to images:
   ```bash
   mkdir -p .payapp-audit/<project>/pages
   pdftoppm -png -r 150 "<pdf-path>" ".payapp-audit/<project>/pages/page"
   ```
9. Confirm setup to user, show page count, begin scanning

---

## Phase 1: SCAN

**Goal:** Build a scratchpad understanding of the entire PDF.

1. Read page images in batches of 5 using the Read tool
2. After each batch, update `.payapp-audit/<project>/scratchpad.yaml`:
   ```yaml
   scanned_through: 10
   notes:
     - pages: [1, 5]
       summary: |
         Page 1: Cover sheet - "DTC Vertical Expansion PA07"
         Page 2: G702 Application for Payment
         Page 3-5: Schedule of Values, ~51 line items
     - pages: [6, 10]
       summary: |
         Page 6-7: SOV continuation
         Page 8-9: White Cap LP - Invoice PP0000232850
         Page 10: White Cap LP - Invoice 27993
   ```
3. Continue until all pages are scanned
4. **For large PDFs (100+ pages):** Use Task agents to process multiple batches in parallel

### ⛔ STOP — User Confirmation Required

Present a summary to the user:
```
📋 Scan Complete — Here's what I found:

🏗️ Prime Contractor: Skanska USA Building Inc
🏢 Owner: Jackson Health System
📅 Billing Period: Through 01/31/2024
📄 Total Pages: 156

👷 Vendors Identified (11):
  1. White Cap LP — pages 8-14 (invoices, lien waiver)
  2. Precision Portables LLC — pages 15-22 (invoices)
  3. ...

📊 SOV: 51 line items found on pages 3-7

Does this look right? Any vendors I missed or got wrong?
Reply with corrections or "looks good" to proceed.
```

**Wait for user response.** Apply any corrections before proceeding.

Update workflow.yaml: `current_phase: classify`

---

## Phase 2: CLASSIFY

**Goal:** Build a document tree — which pages belong to which vendor and what type.

1. Read scratchpad.yaml
2. Re-read specific page ranges where document boundaries are unclear
3. Build `.payapp-audit/<project>/document-tree.yaml`:
   ```yaml
   project: "DTC PA07"
   gc: "Skanska USA Building Inc"
   owner: "Jackson Health System"
   period_ending: "01/31/2024"
   total_pages: 156
   
   prime_docs:
     - type: cover_sheet
       pages: [1]
     - type: g702
       pages: [2]
     - type: sov
       pages: [3, 7]
       line_items: 51
   
   vendors:
     - name: "White Cap LP"
       pages: [8, 14]
       documents:
         - type: invoice
           number: "PP0000232850"
           pages: [8, 9]
         - type: invoice
           number: "27993"
           pages: [10]
         - type: conditional_lien_waiver
           pages: [11]
   ```
4. If unsure about any pages → present options to user:
   ```
   ⚠️ Pages 45-47: I'm not sure about these.
   [1] Change order
   [2] Delivery ticket
   [3] Let me re-read more carefully
   ```

### ⛔ STOP — User Confirmation Required

Present the full document tree:
```
📁 Document Tree — DTC PA07

📋 Prime Contractor Documents:
  • Cover Sheet (p.1)
  • G702 Application for Payment (p.2)
  • G703 Schedule of Values (pp.3-7, 51 line items)

👷 White Cap LP (pp.8-14):
  📄 Invoice #PP0000232850 (pp.8-9)
  📄 Invoice #27993 (p.10)
  📄 Invoice #28150 (pp.11-12)
  📜 Conditional Lien Waiver (p.13)
  📜 Unconditional Lien Waiver (p.14)

👷 Precision Portables LLC (pp.15-22):
  📄 Invoice #INV-9934 (pp.15-17)
  📜 Conditional Lien Waiver (p.18)
  ...

Please review:
- Are the vendor names correct?
- Are document types correctly identified?
- Any documents I missed or misclassified?

Reply with corrections or "looks good" to proceed.
```

**Wait for user response.** Apply corrections.

5. Generate classification Excel: `exports/classification.xlsx`
6. Update workflow.yaml: `current_phase: extract`

---

## Phase 3: EXTRACT

**Goal:** Extract structured data from each vendor's documents.

1. Read document-tree.yaml
2. For each vendor:
   a. Create vendor directory: `vendors/<vendor-slug>/`
   b. Re-read the vendor's page images via vision
   c. Extract data based on document type:
      - **Invoice**: vendor name, address, invoice #, date, amount, line items, tax, total
      - **Lien Waiver**: type (conditional/unconditional), period, amount, signed status
      - **Change Order**: CO number, description, amount, approval status
      - **Certified Payroll**: contractor, project, week ending, employees, hours, rates, gross pay, deductions, compliance statement
      - **Insurance COI**: coverages, limits, expiration dates
      - **Delivery Ticket**: date, items, quantities, receiver
   d. Save to `vendors/<vendor-slug>/invoices.yaml`, `lien-waivers.yaml`, etc.
   e. **Generate vendor Excel** (MANDATORY): `vendors/<vendor-slug>/<vendor-slug>.xlsx`
      - Sheet per document type (Invoices, Lien Waivers, Change Orders, etc.)
   f. Report progress: "✅ White Cap LP extracted — 3 invoices, 1 lien waiver, $866.61 total"

### ⛔ STOP — User Confirmation Required

After extracting all vendors, present a data summary:
```
📊 Extraction Complete — Key Data Points:

👷 White Cap LP:
  💰 Invoices: 3 totaling $866.61
    • #PP0000232850 — $234.50
    • #27993 — $312.11
    • #28150 — $320.00
  📜 Lien Waiver: Conditional, $866.61
  ✅ Excel generated: white-cap-lp.xlsx

👷 Precision Portables LLC:
  💰 Invoices: 1 totaling $3,450.00
    • #INV-9934 — $3,450.00
  📜 Lien Waiver: Conditional, $3,450.00
  ✅ Excel generated: precision-portables-llc.xlsx

...

Please verify:
- Do the amounts look correct?
- Any invoices I missed or got wrong?
- Ready to run audit checks?

Reply with corrections or "looks good" to proceed.
```

**Wait for user response.** Apply corrections.

3. Update workflow.yaml: `current_phase: audit`

---

## Phase 4: AUDIT

**Goal:** Apply all 30 compliance rules and generate findings.

1. Load audit rules from `references/audit-rules.md`
2. Read all vendor YAML data
3. Read G702/G703 data
4. Apply ALL 30 audit checks:

   **Category A — G702/G703 Math (Rules 1-5):**
   - G702 contract sum, retainage, current payment due
   - G703 line item totals, balance to finish

   **Category B — Invoice & SOV Matching (Rules 6-8):**
   - Invoice-to-SOV matching (GMP only)
   - Duplicate invoices (same vendor and cross-vendor)

   **Category C — Lien Waiver Compliance (Rules 9-10):**
   - Missing waivers, amount mismatches

   **Category D — Insurance (Rules 11-12):**
   - Expired certificates, expiring soon

   **Category E — Davis-Bacon (Rules 13-16):**
   - Missing payroll, OT calculation, WH-347 completeness, compliance statement

   **Category F — Billing Integrity (Rules 17-20):**
   - Front-loading, overbilling, retainage compliance, progress reality

   **Category G — Continuity & Integration (Rules 21-22):**
   - Previous pay app continuity, change order integration

   **Category H — Stored Materials (Rule 23):**
   - Excessive materials, missing delivery tickets

   **Category I — Fraud Detection (Rules 24-28):**
   - Payroll reconciliation, round numbers, labor rates, work velocity, vendor concentration

   **Category J — Data Quality (Rules 29-30):**
   - Period date mismatch, vendor name mismatch

5. Save findings to `.payapp-audit/<project>/audit/findings.yaml`
6. Generate audit findings Excel (MANDATORY): `exports/audit-findings.xlsx`
   - Sheet: "All Findings" — every finding with details
   - Sheet: "Summary by Vendor" — error/warning/info counts per vendor
   - Sheet: "Summary by Rule" — counts per rule with affected vendors

### ⛔ STOP — User Confirmation Required

Present findings summary:
```
🔍 Audit Complete — 30 Rules Checked

📊 Results:
  🔴 Errors: 5
  🟡 Warnings: 8
  ℹ️ Info: 3

🔴 Critical Findings:
  1. White Cap LP: Duplicate invoice #PP0000232850 (appears 3 times)
  2. Precision Portables: Missing lien waiver
  3. G702: Contract sum doesn't match ($1,245,000 vs expected $1,244,850)
  4. SOV Line 12: Overbilled by $2,340
  5. Metro Electric: Insurance expired 12/31/2025

🟡 Warnings:
  1. Round number invoices: 4 of 7 are perfectly round ($5,000, $10,000...)
  2. White Cap LP: Lien waiver amount mismatch ($866.61 vs $854.50)
  ...

📋 Audit findings Excel: exports/audit-findings.xlsx

Want to:
[1] Dig deeper into any specific finding
[2] Proceed to final report
[3] Re-run audit with adjustments
```

**Wait for user response.**

7. Update workflow.yaml: `current_phase: report`

---

## Phase 5: REPORT

**Goal:** Generate final deliverables and package everything.

1. Generate executive summary: `audit/summary.yaml`
2. Generate summary Excel: `exports/executive-summary.xlsx`
3. Verify ALL vendor Excel files exist (one per vendor, sheet per doc type)
4. Verify audit findings Excel exists
5. **Generate AI Audit Report PDF:**
   a. Build `audit/report-data.yaml` containing all report data:
      - `project`: name, gc, owner, period, total_pages
      - `g702`: all G702 fields (contract sum, retainage, current payment due, balance, etc.)
      - `sov`: line_items array with scheduled values, completed amounts, percentages
      - `findings`: full findings array with severity, vendor, rule_number, category, message, recommendation
      - `vendors`: per-vendor summary with name, total_billed, document_count, errors, warnings, risk_level
      - `top_issues`: ordered list of most critical recommendations
      - `overall_risk`, `recommendation`, `audit_date`, `rules_checked`, `total_documents`
   b. Generate PDF:
      ```bash
      node scripts/generate-pdf.js audit/report-data.yaml exports/audit-report.pdf
      ```
   c. Confirm PDF was created: `ls -la exports/audit-report.pdf`
6. Create final zip:
   ```bash
   cd .payapp-audit/<project>
   zip -r exports/<project>-complete.zip exports/ vendors/
   ```
7. Present final deliverables:
   ```
   📦 Audit Package Ready!

   📁 Files:
     • exports/classification.xlsx — Document classification
     • exports/audit-findings.xlsx — All audit findings
     • exports/executive-summary.xlsx — Executive summary
     • exports/audit-report.pdf — AI Audit Report with prime contractor analysis
     • vendors/white-cap-lp/white-cap-lp.xlsx — White Cap LP data
     • vendors/precision-portables/precision-portables.xlsx — Precision Portables data
     • ... (one per vendor)
     • exports/dtc-pa07-complete.zip — Everything zipped

   📊 Summary:
     • 156 pages processed
     • 11 vendors audited
     • 42 documents classified
     • 30 compliance rules checked
     • 5 errors, 8 warnings, 3 info items

   Want me to email this to anyone or dig deeper into anything?
   ```

---

## State Directory Structure

```
.payapp-audit/
└── <project-slug>/
    ├── workflow.yaml              # Current phase, history, timestamps
    ├── scratchpad.yaml            # Running scan notes
    ├── document-tree.yaml         # Classification tree
    ├── pages/                     # PNG images of PDF pages
    ├── vendors/
    │   └── <vendor-slug>/
    │       ├── profile.yaml
    │       ├── invoices.yaml
    │       ├── lien-waivers.yaml
    │       ├── change-orders.yaml
    │       ├── certified-payroll.yaml
    │       ├── insurance.yaml
    │       ├── findings.yaml
    │       └── <vendor-slug>.xlsx    # ← MANDATORY per-vendor Excel
    ├── audit/
    │   ├── findings.yaml
    │   └── summary.yaml
    └── exports/
        ├── classification.xlsx
        ├── audit-findings.xlsx       # ← MANDATORY
        ├── executive-summary.xlsx
        ├── audit-report.pdf          # ← AI Audit Report PDF
        └── <project>-complete.zip
```

## workflow.yaml Format
```yaml
project_name: "DTC PA07"
project_slug: "dtc-pa07"
pdf_path: "/path/to/payapp.pdf"
total_pages: 156
current_phase: scan
status: in-progress
created_at: "2026-02-06T17:00:00Z"
updated_at: "2026-02-06T17:15:00Z"
phases:
  init: complete
  scan: in-progress
  classify: pending
  extract: pending
  audit: pending
  report: pending
user_confirmations:
  scan: null       # Will be set to confirmed/corrected
  classify: null
  extract: null
  audit: null
```
