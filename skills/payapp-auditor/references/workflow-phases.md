# Workflow Phases — Detailed Instructions

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

## Phase 1: SCAN

**Goal:** Build a scratchpad understanding of the entire PDF.

1. Read page images in batches of 5 using the Read tool
2. After each batch, update `.payapp-audit/<project>/scratchpad.yaml`:
   ```yaml
   scanned_through: 10  # last page scanned
   notes:
     - pages: [1, 5]
       summary: |
         Page 1: Cover sheet - "DTC Vertical Expansion PA07"
         Page 2: G7-03 Application for Payment
         Page 3-5: Schedule of Values, ~51 line items
     - pages: [6, 10]
       summary: |
         Page 6-7: SOV continuation
         Page 8-9: White Cap LP - Invoice PP0000232850
         Page 10: White Cap LP - Invoice 27993
   ```
3. Continue until all pages are scanned
4. Present summary to user:
   - Prime contractor identified
   - Owner identified
   - Number of vendors found
   - SOV line count
   - Total documents spotted
5. Ask user to confirm or correct
6. Update workflow.yaml: `current_phase: classify`

**For large PDFs (100+ pages):** Use Task agents to process multiple batches in parallel. Split images into groups and assign each group to a Task agent. Merge results into scratchpad.

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
     - type: g7_03
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
5. Generate classification Excel: `exports/classification.xlsx`
6. Update workflow.yaml: `current_phase: extract`

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
      - **Certified Payroll**: contractor, project, week ending, employees, hours, rates
      - **Delivery Ticket**: date, items, quantities, receiver
   d. Save to `vendors/<vendor-slug>/invoices.yaml`, `lien-waivers.yaml`, etc.
   e. Generate vendor Excel: `vendors/<vendor-slug>/<vendor-slug>.xlsx`
   f. Report progress: "✅ White Cap LP extracted — 3 docs, $866.61 total"
3. If extraction is uncertain → show user what was found, ask to confirm
4. Update workflow.yaml: `current_phase: audit`

## Phase 4: AUDIT

**Goal:** Apply compliance rules and generate findings.

1. Load audit rules from `references/audit-rules.md`
2. Read all vendor YAML data
3. Apply each audit check (see references/audit-rules.md for full list)
4. Save findings to `.payapp-audit/<project>/audit/findings.yaml`:
   ```yaml
   findings:
     - vendor: "White Cap LP"
       check: duplicate_invoice_same_vendor
       severity: error
       message: "Invoice #PP0000232850 appears 3 times"
       pages: [8, 9, 20, 21, 45, 46]
   ```
5. Generate audit findings Excel: `exports/audit-findings.xlsx`
6. Present findings summary grouped by severity
7. Update workflow.yaml: `current_phase: report`

## Phase 5: REPORT

**Goal:** Package everything up for the user.

1. Generate executive summary: `audit/summary.yaml`
2. Ensure all vendor Excel files are generated
3. Create final zip:
   ```bash
   cd .payapp-audit/<project>
   zip -r exports/<project>-complete.zip exports/ vendors/
   ```
4. Present final summary:
   - Total documents processed
   - Total vendors
   - Findings by severity (🔴 errors, 🟡 warnings, ℹ️ info)
   - List of all export files
5. Ask if user wants to dig deeper into any vendor or finding

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
    │       ├── findings.yaml
    │       └── <vendor-slug>.xlsx
    ├── audit/
    │   ├── findings.yaml
    │   └── summary.yaml
    └── exports/
        ├── classification.xlsx
        ├── audit-findings.xlsx
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
```
