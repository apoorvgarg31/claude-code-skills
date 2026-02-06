#!/usr/bin/env node

/**
 * generate-excel.js — Convert YAML data to formatted Excel (.xlsx)
 * 
 * Usage:
 *   node generate-excel.js <type> <input.yaml> <output.xlsx>
 * 
 * Types:
 *   classification  — Document classification report
 *   vendor          — Vendor-specific extract (invoices, waivers, line items)
 *   findings        — Audit findings report
 *   summary         — Executive summary
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

// Style definitions
const headerStyle = {
  font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
  fill: { fgColor: { rgb: '1F4E79' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
};

const severityStyles = {
  error: { fill: { fgColor: { rgb: 'FFC7CE' } }, font: { color: { rgb: '9C0006' } } },
  warning: { fill: { fgColor: { rgb: 'FFEB9C' } }, font: { color: { rgb: '9C6500' } } },
  info: { fill: { fgColor: { rgb: 'BDD7EE' } }, font: { color: { rgb: '1F4E79' } } }
};

function createWorkbook() {
  return XLSX.utils.book_new();
}

function addSheet(wb, name, data, colWidths) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  if (colWidths) {
    ws['!cols'] = colWidths.map(w => ({ wch: w }));
  }
  
  XLSX.utils.book_append_sheet(wb, ws, name);
  return ws;
}

function generateClassification(data) {
  const wb = createWorkbook();
  
  // Document Classification sheet
  const classRows = [
    ['Page Start', 'Page End', 'Vendor', 'Document Type', 'Document Number', 'Confidence', 'Notes']
  ];
  
  // Prime docs
  if (data.prime_docs) {
    for (const doc of data.prime_docs) {
      const pages = doc.pages || [];
      classRows.push([
        pages[0] || '',
        pages[pages.length - 1] || pages[0] || '',
        data.gc || 'Prime',
        doc.type || '',
        doc.number || '',
        'High',
        ''
      ]);
    }
  }
  
  // Vendor docs
  if (data.vendors) {
    for (const vendor of data.vendors) {
      for (const doc of (vendor.documents || [])) {
        const pages = doc.pages || [];
        classRows.push([
          pages[0] || '',
          pages[pages.length - 1] || pages[0] || '',
          vendor.name || '',
          doc.type || '',
          doc.number || '',
          doc.confidence || 'High',
          doc.notes || ''
        ]);
      }
    }
  }
  
  addSheet(wb, 'Document Classification', classRows, [12, 12, 30, 20, 20, 12, 40]);
  
  // Summary sheet
  const summaryRows = [
    ['Vendor', 'Total Documents', 'Invoices', 'Lien Waivers', 'Change Orders', 'Other', 'Page Range']
  ];
  
  if (data.vendors) {
    for (const vendor of data.vendors) {
      const docs = vendor.documents || [];
      const invoices = docs.filter(d => d.type === 'invoice').length;
      const waivers = docs.filter(d => d.type && d.type.includes('waiver')).length;
      const cos = docs.filter(d => d.type === 'change_order').length;
      const other = docs.length - invoices - waivers - cos;
      const pages = vendor.pages || [];
      
      summaryRows.push([
        vendor.name || '',
        docs.length,
        invoices,
        waivers,
        cos,
        other,
        pages.length >= 2 ? `${pages[0]}-${pages[1]}` : ''
      ]);
    }
  }
  
  addSheet(wb, 'Summary', summaryRows, [30, 15, 12, 15, 15, 12, 15]);
  
  return wb;
}

function generateVendor(data) {
  const wb = createWorkbook();
  
  // Invoices sheet
  const invRows = [
    ['Invoice Number', 'Invoice Date', 'Due Date', 'PO Number', 'Vendor Name (on Invoice)', 
     'Bill To', 'Project Name', 'Subtotal', 'Tax', 'Total', 'Source Pages']
  ];
  
  if (data.invoices) {
    for (const inv of data.invoices) {
      invRows.push([
        inv.invoice_number || '',
        inv.date || inv.invoice_date || '',
        inv.due_date || '',
        inv.po_number || '',
        inv.vendor_name || '',
        inv.bill_to || '',
        inv.project_name || '',
        inv.subtotal || '',
        inv.tax_amount || '',
        inv.total_amount || inv.amount || '',
        (inv.source_pages || []).join(', ')
      ]);
    }
  }
  
  addSheet(wb, 'Invoices', invRows, [18, 14, 14, 14, 30, 30, 30, 14, 14, 14, 14]);
  
  // Lien Waivers sheet
  const waiverRows = [
    ['Type', 'Through Date', 'Amount', 'Signed', 'Notarized', 'Source Pages']
  ];
  
  if (data.lien_waivers) {
    for (const w of data.lien_waivers) {
      waiverRows.push([
        w.type || '',
        w.through_date || '',
        w.amount || '',
        w.signed ? 'Yes' : 'No',
        w.notarized ? 'Yes' : 'No',
        (w.source_pages || []).join(', ')
      ]);
    }
  }
  
  addSheet(wb, 'Lien Waivers', waiverRows, [35, 14, 14, 10, 12, 14]);
  
  // Line Items sheet
  const lineRows = [
    ['Invoice Number', 'Description', 'Quantity', 'Unit', 'Unit Price', 'Amount']
  ];
  
  if (data.invoices) {
    for (const inv of data.invoices) {
      for (const item of (inv.line_items || [])) {
        lineRows.push([
          inv.invoice_number || '',
          item.description || '',
          item.quantity || '',
          item.unit || '',
          item.unit_price || '',
          item.amount || ''
        ]);
      }
    }
  }
  
  addSheet(wb, 'Line Items', lineRows, [18, 45, 12, 10, 14, 14]);
  
  return wb;
}

function generateFindings(data) {
  const wb = createWorkbook();
  
  // All Findings sheet
  const findingsRows = [
    ['#', 'Severity', 'Vendor', 'Check', 'Description', 'Expected', 'Actual', 'Pages', 'Recommendation']
  ];
  
  if (data.findings) {
    data.findings.forEach((f, i) => {
      findingsRows.push([
        i + 1,
        f.severity || '',
        f.vendor || '',
        f.check || '',
        f.message || f.description || '',
        f.expected || '',
        f.actual || '',
        (f.pages || []).join(', '),
        f.recommendation || ''
      ]);
    });
  }
  
  addSheet(wb, 'All Findings', findingsRows, [5, 10, 25, 28, 45, 20, 20, 14, 40]);
  
  // Summary by Vendor
  const vendorMap = {};
  if (data.findings) {
    for (const f of data.findings) {
      const v = f.vendor || 'Unknown';
      if (!vendorMap[v]) vendorMap[v] = { errors: 0, warnings: 0, info: 0 };
      if (f.severity === 'error') vendorMap[v].errors++;
      else if (f.severity === 'warning') vendorMap[v].warnings++;
      else vendorMap[v].info++;
    }
  }
  
  const vendorSummaryRows = [
    ['Vendor', 'Errors', 'Warnings', 'Info', 'Total Issues']
  ];
  
  for (const [vendor, counts] of Object.entries(vendorMap)) {
    vendorSummaryRows.push([
      vendor,
      counts.errors,
      counts.warnings,
      counts.info,
      counts.errors + counts.warnings + counts.info
    ]);
  }
  
  addSheet(wb, 'Summary by Vendor', vendorSummaryRows, [30, 10, 12, 10, 14]);
  
  // Summary by Rule
  const ruleMap = {};
  if (data.findings) {
    for (const f of data.findings) {
      const r = f.check || 'Unknown';
      if (!ruleMap[r]) ruleMap[r] = { severity: f.severity, count: 0, vendors: new Set() };
      ruleMap[r].count++;
      if (f.vendor) ruleMap[r].vendors.add(f.vendor);
    }
  }
  
  const ruleSummaryRows = [
    ['Rule', 'Severity', 'Count', 'Vendors Affected']
  ];
  
  for (const [rule, info] of Object.entries(ruleMap)) {
    ruleSummaryRows.push([
      rule,
      info.severity || '',
      info.count,
      [...info.vendors].join(', ')
    ]);
  }
  
  addSheet(wb, 'Summary by Rule', ruleSummaryRows, [30, 10, 10, 50]);
  
  return wb;
}

function generateSummary(data) {
  const wb = createWorkbook();
  
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
    [],
    ['Findings Summary'],
    ['Errors', data.errors || 0],
    ['Warnings', data.warnings || 0],
    ['Info', data.info || 0],
    ['Total', (data.errors || 0) + (data.warnings || 0) + (data.info || 0)],
    [],
    ['Top Issues'],
  ];
  
  if (data.top_issues) {
    for (const issue of data.top_issues) {
      summaryRows.push([issue]);
    }
  }
  
  addSheet(wb, 'Executive Summary', summaryRows, [30, 40]);
  
  return wb;
}

// Main execution
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
