# Audit Rules for Construction Payment Applications

Apply these rules during the AUDIT phase. Each rule checks for a specific compliance issue.
Total: **30 rules** covering math validation, document compliance, fraud detection, and Davis-Bacon Act compliance.

---

## Category A: G702/G703 Math Validation

### Rule 1: G702 Contract Sum Math
**Severity:** 🔴 Error  
**Check:** Contract Sum to Date = Original Contract Sum + Net Change Orders

**Logic:**
- Extract `original_contract_sum`, `net_change_orders`, `contract_sum_to_date` from G702
- Calculate: `expected = original + net_change_orders`
- Flag if `|expected - contract_sum_to_date| > $0.01`

### Rule 2: G702 Retainage Calculation
**Severity:** 🟡 Warning  
**Check:** Total Retainage = Total Completed & Stored × Retainage %

**Logic:**
- Extract `total_completed_stored`, `retainage_percent`, `total_retainage` from G702
- Calculate: `expected = total_completed_stored × (retainage_percent / 100)`
- Flag if `|expected - total_retainage| > $0.01`

### Rule 3: G702 Current Payment Due
**Severity:** 🔴 Error  
**Check:** Current Payment Due = Total Earned Less Retainage − Less Previous Certificates

**Logic:**
- Extract `total_earned_less_retainage`, `less_previous_certificates`, `current_payment_due`
- Calculate: `expected = earned_less_retainage - previous_certificates`
- Flag if `|expected - current_payment_due| > $0.01`

### Rule 4: G703 Line Item Math
**Severity:** 🔴 Error  
**Check:** For each SOV line: Total Completed & Stored = Work Completed Previous + Work Completed This Period + Materials Presently Stored

**Logic:**
- For each G703 line item:
  - `expected_total = work_completed_previous + work_completed_this_period + materials_stored`
  - Flag if `|expected_total - total_completed_stored| > $0.01`

### Rule 5: G703 Balance to Finish
**Severity:** 🟡 Warning  
**Check:** For each SOV line: Balance to Finish = Scheduled Value − Total Completed & Stored

**Logic:**
- For each line item:
  - `expected_balance = scheduled_value - total_completed_stored`
  - Flag if `|expected_balance - balance_to_finish| > $0.01`

---

## Category B: Invoice & SOV Matching

### Rule 6: Invoice Matching to SOV "This Period" (GMP Contracts)
**Severity:** 🔴 Error  
**Check:** Invoice total matches SOV "this period" amount for the vendor.

**Logic:**
- Only applies to GMP (Guaranteed Maximum Price) contracts
- Sum all invoice totals for the vendor
- Sum SOV "this period" amounts mapped to the vendor
- Flag if difference exceeds 5% of SOV total
- If difference > 10%, severity = Error; if 5-10%, severity = Warning

### Rule 7: Duplicate Invoice — Same Vendor
**Severity:** 🔴 Error  
**Check:** Same invoice number appearing multiple times for the same vendor.

**Logic:**
- Group all invoices by vendor
- For each vendor, track invoice numbers seen
- Flag if same invoice number appears 2+ times
- Report how many times it appears

### Rule 8: Duplicate Invoice — Cross Vendor
**Severity:** 🟡 Warning  
**Check:** Same invoice number used by different vendors.

**Logic:**
- Collect all invoice numbers across all vendors
- Flag if same number appears under different vendor names
- Note: Some vendors share the same suppliers, so this may be legitimate

---

## Category C: Lien Waiver Compliance

### Rule 9: Missing Lien Waiver
**Severity:** 🔴 Error  
**Check:** Vendor has invoices/billing but no corresponding lien waiver.

**Logic:**
- For each vendor with invoices or SOV billing this period, check if a lien waiver exists
- Conditional waiver expected for current period
- Unconditional waiver expected from previous period
- Flag vendors with billing but no waivers

**Why it matters:** Without lien waivers, the owner is exposed to mechanic's lien claims.

### Rule 10: Lien Waiver Amount Mismatch
**Severity:** 🟡 Warning  
**Check:** Lien waiver amount doesn't match invoice total.

**Logic:**
- Sum waiver `payment_amount` values
- Sum invoice `total_amount` values
- Flag if `|waiver_total - invoice_total| > $0.01`
- Conditional waiver should match current period billing
- Unconditional waiver should match previous period payment

---

## Category D: Insurance & Certificates

### Rule 11: Insurance Certificate Expired
**Severity:** 🔴 Error  
**Check:** Vendor's insurance certificate has expired.

**Logic:**
- For each coverage on each Certificate of Insurance (COI)
- Parse expiration date (try formats: MM/DD/YYYY, YYYY-MM-DD, MM/DD/YY)
- Flag if `expiration_date < today`
- Report which coverage type is expired

### Rule 12: Insurance Expiring Soon
**Severity:** 🟡 Warning  
**Check:** Insurance certificate expires within 30 days.

**Logic:**
- Same as Rule 11 but flag if `expiration_date - today < 30 days`
- Allows proactive renewal requests

---

## Category E: Davis-Bacon Act Compliance

### Rule 13: Certified Payroll Missing
**Severity:** 🟡 Warning  
**Check:** No certified payroll found for a vendor on a prevailing wage project.

**Logic:**
- If project is prevailing wage / federally funded
- And vendor has GMP contract with SOV lines
- And no certified payroll documents found
- Flag as warning

### Rule 14: Davis-Bacon Overtime Calculation
**Severity:** 🔴 Error  
**Check:** Overtime calculations comply with DBA requirements (>40hrs/week = 1.5× base rate).

**Logic:**
- For each employee on certified payroll:
  - If `total_hours > 40`: expected OT hours = `total_hours - 40`
  - Verify reported OT hours match (tolerance: 0.5 hrs)
  - Verify OT rate = `base_rate × 1.5` (tolerance: $0.01)
  - Verify OT pay = `ot_hours × base_rate × 1.5` (tolerance: $1.00)
  - Verify gross pay = `regular_pay + ot_pay` (tolerance: $1.00)
  - Flag if regular hours > 40 (should be capped at 40 with remainder as OT)

### Rule 15: Davis-Bacon Payroll Completeness (WH-347)
**Severity:** 🟡 Warning  
**Check:** Certified payroll has all required WH-347 fields.

**Logic — Payroll-level required fields (at least one from each group):**
- Project identification: `project_name` OR `project_number` OR `project`
- Contractor: `contractor_name` OR `contractor` OR `company_name`
- Pay period: `pay_period` OR `week_ending` OR `period_ending`

**Logic — Employee-level required fields (at least one from each group):**
- Name: `name` OR `employee_name` OR `worker_name`
- Classification: `classification` OR `trade` OR `work_classification`
- Hours: `total_hours` OR `hours` OR `hours_worked`
- Rate: `hourly_rate` OR `rate` OR `base_rate`
- Gross pay: `gross_pay` OR `gross` OR `total_pay` OR `gross_wages`

**Optional but flagged if missing for all employees:**
- Fringe benefits information

### Rule 16: Davis-Bacon Compliance Statement Missing
**Severity:** 🔴 Error  
**Check:** Certified payroll is missing the Statement of Compliance / signature.

**Logic:**
- Check for any of: `statement_of_compliance`, `compliance_statement`, `signature`, `signed_by`, `certification`
- Flag if none found — compliance statement is legally required

---

## Category F: Billing Integrity

### Rule 17: Front-Loading Detection
**Severity:** 🟡 Warning  
**Check:** Disproportionately high billing in early pay applications.

**Logic:**
- For each G703 line item on Application #1:
  - Calculate `pct_billed = (total_completed_stored / scheduled_value) × 100`
  - Flag if `pct_billed > 50%` ("potential front-loading")
- Also flag any single period billing > 40% of a line item's scheduled value

### Rule 18: Overbilling
**Severity:** 🔴 Error  
**Check:** Total billed exceeds scheduled value on any SOV line item.

**Logic:**
- For each G703 line item:
  - Flag if `total_completed_stored > scheduled_value`
  - Report the overbilled amount: `total - scheduled_value`

### Rule 19: Retainage Compliance
**Severity:** 🟡 Warning  
**Check:** Retainage percentage matches contract terms and is a standard rate.

**Logic:**
- Calculate actual retainage %: `(total_retainage / total_completed_stored) × 100`
- If contract retainage % is known, compare (tolerance: 0.5%)
- Flag non-standard rates (not 5% or 10%) as Info

### Rule 20: Progress Reality
**Severity:** 🔴 Error / 🟡 Warning  
**Check:** Reported progress percentages are realistic.

**Logic:**
- Flag line items > 100% complete as Error
- Flag suspicious completion patterns: if ≥80% of line items are at exactly 100%, flag as Warning ("verify actual completion")
- Both patterns can indicate billing fraud or data entry errors

---

## Category G: Continuity & Integration

### Rule 21: Previous Pay App Continuity
**Severity:** 🔴 Error  
**Check:** Previous period data is consistent.

**Logic:**
- If Application #1: all "work completed previous" values should be $0
  - Flag any line with previous > $0.01 on first application
- Flag any negative "previous" amounts (data error)
- Verify: `previous + this_period + materials ≤ total` for each line

### Rule 22: Change Order Integration
**Severity:** 🟡 Warning  
**Check:** Change orders match G702 Net Change Orders value.

**Logic:**
- Sum all approved/executed/signed change order amounts
- Compare to G702 `net_change_orders`
- Flag if difference > $0.01
  - If difference < 10% of approved total → Warning
  - If difference ≥ 10% → Error
- Flag pending COs as Info (not yet in contract sum)
- Flag negative net COs without corresponding deductive COs

---

## Category H: Stored Materials

### Rule 23: Stored Materials Verification
**Severity:** 🟡 Warning  
**Check:** Materials stored amounts are reasonable.

**Logic:**
- For each line item with materials stored > $0:
  - Calculate `materials_pct = (materials / scheduled_value) × 100`
  - Flag if > 30% of line item (configurable threshold)
- Flag materials on 100%-complete line items (shouldn't have stored materials if work is done)
- Flag if significant materials ($1,000+) but no delivery tickets found
- Flag if overall materials > 25% of total scheduled value (Info)

---

## Category I: Fraud Detection

### Rule 24: Payroll ↔ Invoice Reconciliation
**Severity:** 🟡 Warning  
**Check:** Certified payroll hours/amounts reconcile with invoice labor claims.

**Logic:**
- Sum payroll total hours and gross pay amounts
- Sum labor-related invoice line items (keywords: labor, hour, time, work, crew, man)
- Flag if invoice labor exceeds payroll by > 20%
- Flag individual employees with > 60 hours/week ("verify OT approval")

### Rule 25: Round Number Detection
**Severity:** ℹ️ Info / 🟡 Warning  
**Check:** Suspiciously round invoice amounts (fraud indicator).

**Logic:**
- For each invoice, check if amount is divisible by $1,000
- Flag individual invoices ≥ $10,000 that are perfectly round as Info
- Flag if ≥ 50% of invoices (minimum 3) are round numbers as Warning ("potential fabrication")

### Rule 26: Labor Rate Classification
**Severity:** 🟡 Warning  
**Check:** Labor rate anomalies within same classification.

**Logic:**
- Group employees by classification/trade
- Within same classification, flag if rate variance > 50% (max/min > 1.5×)
- Compare apprentice vs journeyman rates:
  - Flag if apprentice rate ≥ 90% of journeyman rate ("verify classifications")

### Rule 27: Work Velocity (Impossible Billing Rate)
**Severity:** 🟡 Warning  
**Check:** Billing velocity is realistic given reported work hours.

**Logic:**
- Calculate implied hourly rate: `this_period_billing / total_timesheet_hours`
- Flag if implied rate > $500/hr as Warning ("verify hours")
- Flag if implied rate > $250/hr as Info

### Rule 28: Vendor Concentration
**Severity:** ℹ️ Info  
**Check:** Single vendor dominance (potential kickback indicator).

**Logic:**
- Calculate each vendor's % of total billing this period
- Flag if any vendor > 40% of total billing
- Also flag if a single vendor is billing on > 60% of active SOV lines (when ≥ 5 active lines)

---

## Category J: Data Quality & Consistency

### Rule 29: Period Date Mismatch
**Severity:** 🟡 Warning  
**Check:** Invoice date or lien waiver period doesn't match the payapp billing period.

**Logic:**
- Get billing period from G702/G703 (Period To date)
- Check each invoice date falls within reasonable range (billing period ± 30 days)
- Check lien waiver "Through Date" matches billing period

### Rule 30: Vendor Name Mismatch
**Severity:** 🟡 Warning  
**Check:** Vendor name on invoice doesn't match the classified vendor.

**Logic:**
- Compare `vendor_name` in extracted invoice data to the vendor classification name
- Flag if they differ significantly
- Example: Invoice says "Precision Portables LLC" but classified under "White Cap LP"
- Common causes: sub-subcontractor invoices, DBA names, misclassification

---

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| 🔴 Error | Compliance issue requiring attention | Must be resolved before payment |
| 🟡 Warning | Potential issue, may be legitimate | Review and verify |
| ℹ️ Info | Informational, no action required | Note for awareness |

## Rule Summary Table

| # | Rule | Category | Severity |
|---|------|----------|----------|
| 1 | G702 Contract Sum Math | Math | 🔴 Error |
| 2 | G702 Retainage Calculation | Math | 🟡 Warning |
| 3 | G702 Current Payment Due | Math | 🔴 Error |
| 4 | G703 Line Item Math | Math | 🔴 Error |
| 5 | G703 Balance to Finish | Math | 🟡 Warning |
| 6 | Invoice Matching to SOV | Matching | 🔴 Error |
| 7 | Duplicate Invoice — Same Vendor | Matching | 🔴 Error |
| 8 | Duplicate Invoice — Cross Vendor | Matching | 🟡 Warning |
| 9 | Missing Lien Waiver | Compliance | 🔴 Error |
| 10 | Lien Waiver Amount Mismatch | Compliance | 🟡 Warning |
| 11 | Insurance Certificate Expired | Compliance | 🔴 Error |
| 12 | Insurance Expiring Soon | Compliance | 🟡 Warning |
| 13 | Certified Payroll Missing | Davis-Bacon | 🟡 Warning |
| 14 | DBA Overtime Calculation | Davis-Bacon | 🔴 Error |
| 15 | DBA Payroll Completeness | Davis-Bacon | 🟡 Warning |
| 16 | DBA Compliance Statement Missing | Davis-Bacon | 🔴 Error |
| 17 | Front-Loading Detection | Billing | 🟡 Warning |
| 18 | Overbilling | Billing | 🔴 Error |
| 19 | Retainage Compliance | Billing | 🟡 Warning |
| 20 | Progress Reality | Billing | 🔴/🟡 |
| 21 | Previous Pay App Continuity | Continuity | 🔴 Error |
| 22 | Change Order Integration | Continuity | 🟡 Warning |
| 23 | Stored Materials Verification | Materials | 🟡 Warning |
| 24 | Payroll ↔ Invoice Reconciliation | Fraud | 🟡 Warning |
| 25 | Round Number Detection | Fraud | ℹ️/🟡 |
| 26 | Labor Rate Classification | Fraud | 🟡 Warning |
| 27 | Work Velocity | Fraud | 🟡 Warning |
| 28 | Vendor Concentration | Fraud | ℹ️ Info |
| 29 | Period Date Mismatch | Quality | 🟡 Warning |
| 30 | Vendor Name Mismatch | Quality | 🟡 Warning |
