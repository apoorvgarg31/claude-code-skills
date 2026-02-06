# Construction Payment Application Domain Knowledge

## What is a Payment Application (PayApp)?

A payment application is a formal request for payment from a contractor to the project owner. In construction, the general contractor (GC) submits a payapp that includes their own billing plus all subcontractor billing for work completed during a billing period.

### Typical PayApp Structure

```
Payment Application Package
├── Cover Sheet / Transmittal Letter
├── AIA G702 (Application and Certificate for Payment)
├── AIA G703 (Continuation Sheet / Schedule of Values)
├── Prime Contractor's Lien Waiver
├── Subcontractor Documentation (per vendor)
│   ├── Invoice(s)
│   ├── Lien Waiver(s)
│   ├── Change Order(s) (if applicable)
│   ├── Certified Payroll (if Davis-Bacon applies)
│   └── Insurance Certificate (if expiring)
└── Supporting Documents
    ├── Delivery Tickets
    ├── Purchase Orders
    └── Other backup
```

## Key Forms

### AIA G702 (Application and Certificate for Payment)
The main summary form. Contains:
- **Original Contract Sum** — initial contract amount
- **Net Change by Change Orders** — sum of approved COs
- **Contract Sum to Date** — original + changes
- **Total Completed and Stored to Date** — cumulative work done
- **Retainage** — amount withheld (typically 5-10%)
- **Total Earned Less Retainage** — what's owed
- **Less Previous Certificates for Payment** — already paid
- **Current Payment Due** — this period's payment

### AIA G703 (Continuation Sheet / Schedule of Values)
The detailed breakdown. Each line represents a cost item or subcontractor:
- **Item Number** — line reference
- **Description of Work** — what the work is (or subcontractor name)
- **Scheduled Value** — budgeted amount for this item
- **From Previous Application** — cumulative from prior payapps
- **This Period** — amount billed this period
- **Materials Presently Stored** — materials on-site not yet installed
- **Total Completed and Stored to Date** — cumulative total
- **% Complete** — percentage of scheduled value completed
- **Balance to Finish** — remaining amount
- **Retainage** — amount held back

## Key Concepts

### Retainage
- A percentage (typically 5% or 10%) withheld from each payment
- Protects the owner against incomplete or defective work
- Released at project completion or substantial completion
- Can vary by contract (some reduce retainage after 50% completion)

### Lien Waivers
Legal documents that waive a party's right to file a mechanic's lien.

**Four types:**
1. **Conditional Waiver on Progress Payment** — "I waive my lien rights IF I receive payment of $X for work through [date]"
2. **Unconditional Waiver on Progress Payment** — "I have received payment of $X and waive my lien rights for work through [date]"
3. **Conditional Waiver on Final Payment** — Same as #1 but for final payment
4. **Unconditional Waiver on Final Payment** — Same as #2 but for final payment

**Flow:**
- Current payapp includes CONDITIONAL waiver for this period
- Previous payapp's payment triggers UNCONDITIONAL waiver for that period
- Each vendor should have both types in sequence

### Change Orders
Formal modifications to the original contract:
- **Change Order (CO)** — agreed change with defined scope and price
- **Construction Change Directive (CCD)** — owner-directed change, price TBD
- **Field Order** — minor change, usually within contractor's authority

Change orders affect:
- Contract sum (adds or deducts)
- SOV line items (new lines or modified amounts)
- Schedule (may extend completion date)

### Davis-Bacon Act (Certified Payroll)
Applies to federally funded construction projects over $2,000:
- Requires payment of prevailing wages
- Contractors must submit weekly certified payroll (WH-347 form)
- Includes: employee names, classifications, hours, rates, deductions
- Overtime: hours > 40/week at 1.5x base rate
- Statement of compliance signed by contractor

## Common Parties

| Role | Description |
|------|-------------|
| **Owner** | Entity paying for construction (e.g., Jackson Health System) |
| **Architect/Engineer** | Reviews and certifies payment applications |
| **General Contractor (GC)** | Prime contractor managing the project (e.g., Skanska) |
| **Subcontractor** | Specialty contractors working under the GC |
| **Sub-subcontractor** | Contractors working under a subcontractor |
| **Surety** | Company providing payment/performance bonds |

## Billing Period
- Usually monthly (e.g., "Period To: January 31, 2024")
- GC collects all sub invoices, compiles into one payapp
- Submitted to architect for review
- Architect certifies → owner pays GC → GC pays subs

## Red Flags to Watch For

1. **Front-loading** — Billing more than actual progress early in the project
2. **Overbilling** — Billing more than the SOV line item amount
3. **Duplicate billing** — Same invoice in multiple payapps
4. **Missing backup** — Invoices without supporting documentation
5. **Expired insurance** — Working without valid coverage
6. **Lien waiver gaps** — Missing waivers create legal exposure
7. **Unexecuted change orders** — Work done without approved CO
8. **Ghost vendors** — Vendors not in the original subcontractor list
9. **Round number invoices** — Exact round amounts may indicate estimates, not actual work
10. **Retainage manipulation** — Reducing retainage without contractual basis
