# Audit Rules for Construction Payment Applications

Apply these rules during the AUDIT phase. Each rule checks for a specific compliance issue.

## Rule 1: Duplicate Invoice — Same Vendor

**Severity:** 🔴 Error  
**Check:** Same invoice number appearing multiple times for the same vendor.

**Logic:**
- Group all invoices by vendor
- For each vendor, check for duplicate invoice numbers
- Flag if same invoice number appears 2+ times

**Common cause:** Same invoice submitted in consecutive payapps, or scanned multiple times.

## Rule 2: Duplicate Invoice — Cross Vendor

**Severity:** 🟡 Warning  
**Check:** Same invoice number used by different vendors.

**Logic:**
- Collect all invoice numbers across all vendors
- Flag if same number appears under different vendor names
- Note: Some vendors share the same suppliers, so this may be legitimate

**Common cause:** Sub-subcontractor invoices submitted through multiple subs.

## Rule 3: Missing Lien Waiver

**Severity:** 🔴 Error  
**Check:** Vendor has invoices but no corresponding lien waiver.

**Logic:**
- For each vendor with invoices, check if a lien waiver exists
- Conditional waiver expected for current period
- Unconditional waiver expected from previous period
- Flag vendors with invoices but no waivers

**Why it matters:** Without lien waivers, the owner is exposed to mechanic's lien claims.

## Rule 4: Math Verification

**Severity:** 🔴 Error  
**Check:** Invoice math (line items → subtotal → tax → total).

**Logic:**
- Sum all line item amounts
- Compare to stated subtotal
- Apply stated tax rate to subtotal, compare to stated tax amount
- Verify subtotal + tax = total
- Allow small rounding tolerance (±$0.05)

**Common issues:** Transposition errors, missing line items, incorrect tax calculations.

## Rule 5: Vendor Name Mismatch

**Severity:** 🟡 Warning  
**Check:** Vendor name on invoice doesn't match the classified vendor.

**Logic:**
- Compare vendor_name in extracted invoice data to the vendor folder name
- Flag if they differ significantly
- Example: Invoice says "Precision Portables LLC" but classified under "White Cap LP"

**Common cause:** Sub-subcontractor invoices, DBA names, or misclassification.

## Rule 6: Period Date Mismatch

**Severity:** 🟡 Warning  
**Check:** Invoice date or lien waiver period doesn't match the payapp billing period.

**Logic:**
- Get billing period from G7-03 (Period To date)
- Check each invoice date falls within reasonable range (billing period ± 30 days)
- Check lien waiver "Through Date" matches billing period

**Common cause:** Invoices from previous periods included in current payapp.

## Rule 7: Retainage Rate Anomaly

**Severity:** ℹ️ Info  
**Check:** Retainage rate is non-standard.

**Logic:**
- Extract retainage rate from G7-03 or SOV
- Standard rates are 5% or 10%
- Flag if rate is different (could be legitimate but worth noting)

## Rule 8: Over-Billing Detection

**Severity:** 🔴 Error  
**Check:** Vendor's total billing exceeds their SOV line item amount.

**Logic:**
- For each vendor, sum all invoice amounts across all payapps
- Compare to their SOV scheduled value
- Flag if total billed > scheduled value
- Note: Change orders may legitimately increase the amount

**Common cause:** Billing errors, unauthorized work, change order not yet approved.

## Rule 9: Davis-Bacon Compliance (Certified Payroll)

**Severity:** 🔴 Error  
**Check:** Certified payroll compliance on federally funded projects.

**Logic (only applies if certified payroll documents are present):**
- **Overtime math**: Hours > 40/week should be at 1.5x base rate
- **Payroll completeness**: WH-347 must have: contractor name, project, week ending, employee names, classifications, hours, rates, gross pay, deductions, net pay
- **Prevailing wage**: Compare rates to Davis-Bacon prevailing wage rates for the area (if available)
- **Missing payrolls**: Check for gaps in weekly payroll submissions

## Rule 10: Change Order Validation

**Severity:** 🟡 Warning  
**Check:** Change orders are properly documented and approved.

**Logic:**
- Each change order should have: CO number, description, amount, signatures
- CO amounts should be reflected in the SOV
- Cumulative CO total should match the "Net Change by Change Orders" field in G7-03

## Rule 11: SOV Line Item Reconciliation

**Severity:** 🟡 Warning  
**Check:** SOV totals reconcile with vendor submissions.

**Logic:**
- Sum "This Period" column for each vendor in SOV
- Compare to total of invoices submitted by that vendor
- Flag discrepancies > 1%

**Common cause:** Invoices not yet reflected in SOV, or SOV updated separately.

## Rule 12: Lien Waiver Amount Mismatch

**Severity:** 🔴 Error  
**Check:** Lien waiver amount doesn't match invoice total.

**Logic:**
- Conditional waiver amount should match current period billing
- Unconditional waiver amount should match previous period payment
- Allow small tolerance for retainage adjustments

## Rule 13: Insurance Certificate Expiry

**Severity:** 🟡 Warning  
**Check:** Vendor's insurance certificate has expired.

**Logic:**
- If COI (Certificate of Insurance) is present, check expiry date
- Flag if expired before or during the billing period
- Note required coverage types and limits

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| 🔴 Error | Compliance issue requiring attention | Must be resolved before payment |
| 🟡 Warning | Potential issue, may be legitimate | Review and verify |
| ℹ️ Info | Informational, no action required | Note for awareness |

## Adding New Rules

To add a new audit rule:
1. Define the check name, severity, and logic
2. Add it to this file
3. The AUDIT phase will automatically pick it up
4. No code changes needed — just describe the rule clearly
