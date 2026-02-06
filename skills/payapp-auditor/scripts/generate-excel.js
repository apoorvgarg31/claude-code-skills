#!/usr/bin/env node

/**
 * generate-excel.js — Convert YAML data to formatted Excel (.xlsx)
 * 
 * Usage:
 *   node generate-excel.js <type> <input.yaml> <output.xlsx>
 * 
 * Types:
 *   classification  — Document classification report
 *   vendor          — Vendor-specific extract (sheet per doc type)
 *   findings        — Audit findings report (all findings + summaries)
 *   summary         — Executive summary with risk assessment
 * 
 * Dependencies:
 *   npm install xlsx js-yaml
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const yaml = require('js-yaml');

const [,, type, inputPath, outputPath] = process.argv;

if (!type || !inputPath || !outputPath) {
  console.error('Usage: node generate-excel.js <type> <input.yaml> <output.xlsx>');
  console.error('Types: classification, vendor, findings, summary');
  process.exit(1);
}

// Read YAML input
const data = yaml.load(fs.readFileSync(inputPath, 'utf8'));

function createWorkbook() {
  return XLSX.utils.book_new();
}

function addSheet(wb, name, rows, colWidths) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  if (colWidths) {
    ws['!cols'] = colWidths.map(w => ({ wch: w }));
  }
  XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31)); // Excel 31-char sheet name limit
  return ws;
}

// ============================================================
// TYPE: classification
// ============================================================
function generateClassification(data) {
  const wb = createWorkbook();

  // Document Classification sheet
  const classRows = [
    ['Page Start', 'Page End', 'Vendor', 'Document Type', 'Document Number', 'Confidence', 'Notes']
  ];

  if (data.prime_docs) {
    for (const doc of data.prime_docs) {
      const pages = doc.pages || [];
      classRows.push([
        pages[0] || '', pages[pages.length - 1] || pages[0] || '',
        data.gc || 'Prime', doc.type || '', doc.number || '', 'High', ''
      ]);
    }
  }

  if (data.vendors) {
    for (const vendor of data.vendors) {
      for (const doc of (vendor.documents || [])) {
        const pages = doc.pages || [];
        classRows.push([
          pages[0] || '', pages[pages.length - 1] || pages[0] || '',
          vendor.name || '', doc.type || '', doc.number || '',
          doc.confidence || 'High', doc.notes || ''
        ]);
      }
    }
  }

  addSheet(wb, 'Document Classification', classRows, [12, 12, 30, 20, 20, 12, 40]);

  // Summary sheet
  const summaryRows = [
    ['Vendor', 'Total Documents', 'Invoices', 'Lien Waivers', 'Change Orders', 'Certified Payroll', 'Insurance', 'Other', 'Page Range']
  ];

  if (data.vendors) {
    for (const vendor of data.vendors) {
      const docs = vendor.documents || [];
      const invoices = docs.filter(d => d.type === 'invoice').length;
      const waivers = docs.filter(d => d.type && d.type.includes('waiver')).length;
      const cos = docs.filter(d => d.type === 'change_order').length;
      const payroll = docs.filter(d => d.type && d.type.includes('payroll')).length;
      const insurance = docs.filter(d => d.type && (d.type.includes('insurance') || d.type.includes('coi'))).length;
      const other = docs.length - invoices - waivers - cos - payroll - insurance;
      const pages = vendor.pages || [];

      summaryRows.push([
        vendor.name || '', docs.length, invoices, waivers, cos, payroll, insurance, other,
        pages.length >= 2 ? `${pages[0]}-${pages[1]}` : ''
      ]);
    }
  }

  addSheet(wb, 'Summary', summaryRows, [30, 15, 12, 15, 15, 15, 12, 12, 15]);
  return wb;
}

// ============================================================
// TYPE: vendor (per-vendor file with sheet per document type)
// ============================================================
function generateVendor(data) {
  const wb = createWorkbook();

  // --- Invoices sheet ---
  const invRows = [
    ['Invoice Number', 'Invoice Date', 'Due Date', 'PO Number', 'Vendor Name (on Invoice)',
     'Bill To', 'Project Name', 'Subtotal', 'Tax', 'Total', 'Source Pages']
  ];

  if (data.invoices && data.invoices.length > 0) {
    for (const inv of data.invoices) {
      invRows.push([
        inv.invoice_number || '', inv.date || inv.invoice_date || '',
        inv.due_date || '', inv.po_number || '',
        inv.vendor_name || '', inv.bill_to || '', inv.project_name || '',
        inv.subtotal || '', inv.tax_amount || '',
        inv.total_amount || inv.amount || '',
        (inv.source_pages || []).join(', ')
      ]);
    }
    addSheet(wb, 'Invoices', invRows, [18, 14, 14, 14, 30, 30, 30, 14, 14, 14, 14]);
  }

  // --- Lien Waivers sheet ---
  if (data.lien_waivers && data.lien_waivers.length > 0) {
    const waiverRows = [
      ['Type', 'Through Date', 'Amount', 'Signed', 'Notarized', 'Source Pages']
    ];
    for (const w of data.lien_waivers) {
      waiverRows.push([
        w.type || '', w.through_date || '', w.amount || '',
        w.signed ? 'Yes' : 'No', w.notarized ? 'Yes' : 'No',
        (w.source_pages || []).join(', ')
      ]);
    }
    addSheet(wb, 'Lien Waivers', waiverRows, [35, 14, 14, 10, 12, 14]);
  }

  // --- Change Orders sheet ---
  if (data.change_orders && data.change_orders.length > 0) {
    const coRows = [
      ['CO Number', 'Description', 'Amount', 'Status', 'Date', 'Signatures', 'Source Pages']
    ];
    for (const co of data.change_orders) {
      coRows.push([
        co.change_order_number || co.co_number || '',
        co.description || '', co.amount || co.change_amount || '',
        co.status || '', co.date || '',
        co.signatures || co.signed_by || '',
        (co.source_pages || []).join(', ')
      ]);
    }
    addSheet(wb, 'Change Orders', coRows, [14, 45, 14, 14, 14, 20, 14]);
  }

  // --- Certified Payroll sheet ---
  if (data.certified_payroll && data.certified_payroll.length > 0) {
    const payrollRows = [
      ['Pay Period', 'Employee Name', 'Classification', 'Regular Hours', 'OT Hours',
       'Total Hours', 'Hourly Rate', 'OT Rate', 'Regular Pay', 'OT Pay',
       'Gross Pay', 'Deductions', 'Net Pay', 'Fringe Benefits']
    ];
    for (const pr of data.certified_payroll) {
      const period = pr.pay_period || pr.week_ending || '';
      const employees = pr.employees || [];
      for (const emp of employees) {
        payrollRows.push([
          period,
          emp.name || emp.employee_name || '',
          emp.classification || emp.trade || '',
          emp.regular_hours || emp.straight_time_hours || '',
          emp.overtime_hours || emp.ot_hours || '',
          emp.total_hours || emp.hours || '',
          emp.hourly_rate || emp.rate || '',
          emp.overtime_rate || emp.ot_rate || '',
          emp.regular_pay || emp.straight_time_pay || '',
          emp.overtime_pay || emp.ot_pay || '',
          emp.gross_pay || emp.gross || '',
          emp.deductions || emp.total_deductions || '',
          emp.net_pay || emp.net || '',
          emp.fringe_benefits || emp.fringe || ''
        ]);
      }
    }
    addSheet(wb, 'Certified Payroll', payrollRows, [14, 25, 20, 14, 12, 12, 12, 12, 14, 14, 14, 14, 14, 14]);
  }

  // --- Insurance sheet ---
  if (data.insurance_certs && data.insurance_certs.length > 0) {
    const insRows = [
      ['Coverage Type', 'Insurer', 'Policy Number', 'Effective Date', 'Expiration Date', 'Limit', 'Status']
    ];
    for (const cert of data.insurance_certs) {
      for (const cov of (cert.coverages || [])) {
        let status = 'Active';
        if (cov.expiration_date) {
          const exp = new Date(cov.expiration_date);
          const now = new Date();
          const daysLeft = (exp - now) / (1000 * 60 * 60 * 24);
          if (daysLeft < 0) status = 'EXPIRED';
          else if (daysLeft < 30) status = 'Expiring Soon';
        }
        insRows.push([
          cov.coverage_type || '', cert.insurer || cert.insurance_company || '',
          cov.policy_number || '', cov.effective_date || '',
          cov.expiration_date || '', cov.limit || '', status
        ]);
      }
    }
    addSheet(wb, 'Insurance', insRows, [20, 25, 18, 14, 14, 14, 14]);
  }

  // --- Line Items sheet (detailed from invoices) ---
  if (data.invoices) {
    const lineRows = [
      ['Invoice Number', 'Description', 'Quantity', 'Unit', 'Unit Price', 'Amount']
    ];
    let hasLineItems = false;
    for (const inv of data.invoices) {
      for (const item of (inv.line_items || [])) {
        hasLineItems = true;
        lineRows.push([
          inv.invoice_number || '', item.description || '',
          item.quantity || '', item.unit || '',
          item.unit_price || '', item.amount || ''
        ]);
      }
    }
    if (hasLineItems) {
      addSheet(wb, 'Line Items', lineRows, [18, 45, 12, 10, 14, 14]);
    }
  }

  // If no sheets were added (empty vendor), add a placeholder
  if (!wb.SheetNames.length) {
    addSheet(wb, 'Info', [['No documents found for this vendor']], [50]);
  }

  return wb;
}

// ============================================================
// TYPE: findings (audit findings with summaries)
// ============================================================
function generateFindings(data) {
  const wb = createWorkbook();

  // All Findings sheet
  const findingsRows = [
    ['#', 'Severity', 'Vendor', 'Rule #', 'Category', 'Check', 'Description', 'Expected', 'Actual', 'Difference', 'Pages', 'Recommendation']
  ];

  if (data.findings) {
    data.findings.forEach((f, i) => {
      findingsRows.push([
        i + 1, f.severity || '', f.vendor || '',
        f.rule_number || '', f.category || '', f.check || '',
        f.message || f.description || '',
        f.expected || '', f.actual || '',
        f.difference != null ? f.difference : '',
        (f.pages || []).join(', '), f.recommendation || ''
      ]);
    });
  }

  addSheet(wb, 'All Findings', findingsRows, [5, 10, 25, 8, 14, 28, 45, 20, 20, 14, 14, 40]);

  // Summary by Vendor
  const vendorMap = {};
  if (data.findings) {
    for (const f of data.findings) {
      const v = f.vendor || 'Unknown';
      if (!vendorMap[v]) vendorMap[v] = { errors: 0, warnings: 0, info: 0, billed: 0 };
      if (f.severity === 'error') vendorMap[v].errors++;
      else if (f.severity === 'warning') vendorMap[v].warnings++;
      else vendorMap[v].info++;
    }
  }

  // Merge billing data if available
  if (data.vendor_totals) {
    for (const [v, total] of Object.entries(data.vendor_totals)) {
      if (vendorMap[v]) vendorMap[v].billed = total;
    }
  }

  const vendorSummaryRows = [
    ['Vendor', 'Errors', 'Warnings', 'Info', 'Total Issues', 'Total Billed', 'Risk Level']
  ];

  for (const [vendor, counts] of Object.entries(vendorMap)) {
    const total = counts.errors + counts.warnings + counts.info;
    const risk = counts.errors > 2 ? 'High' : counts.errors > 0 ? 'Medium' : 'Low';
    vendorSummaryRows.push([
      vendor, counts.errors, counts.warnings, counts.info, total,
      counts.billed || '', risk
    ]);
  }

  addSheet(wb, 'Summary by Vendor', vendorSummaryRows, [30, 10, 12, 10, 14, 14, 12]);

  // Summary by Rule
  const ruleMap = {};
  if (data.findings) {
    for (const f of data.findings) {
      const r = f.check || 'Unknown';
      if (!ruleMap[r]) ruleMap[r] = {
        rule_number: f.rule_number || '', category: f.category || '',
        severity: f.severity, count: 0, vendors: new Set()
      };
      ruleMap[r].count++;
      if (f.vendor) ruleMap[r].vendors.add(f.vendor);
    }
  }

  const ruleSummaryRows = [
    ['Rule #', 'Rule', 'Category', 'Severity', 'Count', 'Vendors Affected']
  ];

  for (const [rule, info] of Object.entries(ruleMap)) {
    ruleSummaryRows.push([
      info.rule_number, rule, info.category, info.severity || '',
      info.count, [...info.vendors].join(', ')
    ]);
  }

  addSheet(wb, 'Summary by Rule', ruleSummaryRows, [8, 30, 14, 10, 10, 50]);

  return wb;
}

// ============================================================
// TYPE: summary (executive summary with risk assessment)
// ============================================================
function generateSummary(data) {
  const wb = createWorkbook();

  // Executive Summary sheet
  const summaryRows = [
    ['PayApp Audit — Executive Summary'],
    [],
    ['Project', data.project_name || ''],
    ['General Contractor', data.gc || ''],
    ['Owner', data.owner || ''],
    ['Billing Period', data.period_ending || ''],
    ['Total Pages', data.total_pages || ''],
    ['Total Documents', data.total_documents || ''],
    ['Total Vendors', data.total_vendors || ''],
    ['Rules Checked', 30],
    [],
    ['Findings Summary'],
    ['Errors', data.errors || 0],
    ['Warnings', data.warnings || 0],
    ['Info', data.info || 0],
    ['Total', (data.errors || 0) + (data.warnings || 0) + (data.info || 0)],
    [],
    ['Risk Assessment'],
    ['Overall Risk', data.overall_risk || (data.errors > 2 ? 'High' : data.errors > 0 ? 'Medium' : 'Low')],
    ['Payment Recommendation', data.recommendation || ''],
    [],
    ['Top Issues'],
  ];

  if (data.top_issues) {
    for (const issue of data.top_issues) {
      summaryRows.push([issue]);
    }
  }

  addSheet(wb, 'Executive Summary', summaryRows, [30, 50]);

  // Vendor Risk Matrix sheet
  if (data.vendor_risks) {
    const riskRows = [
      ['Vendor', 'Total Billed', 'Errors', 'Warnings', 'Risk Score', 'Risk Level', 'Key Issues', 'Recommendation']
    ];
    for (const v of data.vendor_risks) {
      riskRows.push([
        v.vendor || '', v.total_billed || '', v.errors || 0, v.warnings || 0,
        v.risk_score || '', v.risk_level || '', v.key_issues || '', v.recommendation || ''
      ]);
    }
    addSheet(wb, 'Vendor Risk Matrix', riskRows, [25, 14, 10, 12, 12, 12, 40, 20]);
  }

  return wb;
}

// ============================================================
// Main execution
// ============================================================
try {
  let wb;

  switch (type) {
    case 'classification':
      wb = generateClassification(data);
      break;
    case 'vendor':
      wb = generateVendor(data);
      break;
    case 'findings':
      wb = generateFindings(data);
      break;
    case 'summary':
      wb = generateSummary(data);
      break;
    default:
      console.error(`Unknown type: ${type}. Use: classification, vendor, findings, summary`);
      process.exit(1);
  }

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  XLSX.writeFile(wb, outputPath);
  console.log(`✅ Generated: ${outputPath}`);
} catch (err) {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
}
