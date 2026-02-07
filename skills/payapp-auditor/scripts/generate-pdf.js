#!/usr/bin/env node
/**
 * generate-pdf.js — Generate a professional PayApp Audit Report PDF
 * Usage: node generate-pdf.js <input.yaml> <output.pdf>
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const PDFDocument = require('pdfkit');

// --- Helpers ---

function fmt$(amount) {
  if (amount == null) return 'N/A';
  return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(part, whole) {
  if (!whole) return 'N/A';
  return ((part / whole) * 100).toFixed(1) + '%';
}

function safeStr(val, fallback = 'N/A') {
  return val != null ? String(val) : fallback;
}

function severityLabel(sev) {
  const s = String(sev).toLowerCase();
  if (s === 'error') return '[ERROR]';
  if (s === 'warning') return '[WARNING]';
  return '[INFO]';
}

function riskColor(risk) {
  const r = String(risk).toLowerCase();
  if (r === 'high' || r === 'critical') return '#CC0000';
  if (r === 'medium') return '#CC8800';
  return '#006600';
}

// --- Colors & Styling ---
const COLORS = {
  navy: '#1B2A4A',
  darkGray: '#333333',
  medGray: '#666666',
  lightGray: '#F5F5F5',
  accent: '#2C5F8A',
  error: '#CC0000',
  warning: '#CC8800',
  info: '#2C5F8A',
  white: '#FFFFFF',
  lineRule: '#CCCCCC',
};

// --- Main ---
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node generate-pdf.js <input.yaml> <output.pdf>');
  process.exit(1);
}

const inputPath = path.resolve(args[0]);
const outputPath = path.resolve(args[1]);

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

// Ensure output directory exists
const outDir = path.dirname(outputPath);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const data = yaml.load(fs.readFileSync(inputPath, 'utf8')) || {};

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 72, bottom: 72, left: 60, right: 60 },
  info: {
    Title: `PayApp Audit Report — ${safeStr(data.project_name, 'Project')}`,
    Author: 'PayApp Auditor',
    Subject: 'Construction Payment Application Audit',
  },
  bufferPages: true,
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const PAGE_W = 612; // letter width in points
const MARGIN_L = 60;
const MARGIN_R = 60;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

// ─── PAGE FOOTER (added after all pages rendered) ───

function addFooters() {
  const range = doc.bufferedPageRange();
  const auditDate = safeStr(data.audit_date, new Date().toISOString().slice(0, 10));
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    // Skip cover page footer
    if (i === 0) continue;
    doc.save();
    doc.fontSize(8).fillColor(COLORS.medGray);
    const footerY = 756; // near bottom
    doc.moveTo(MARGIN_L, footerY - 6).lineTo(PAGE_W - MARGIN_R, footerY - 6).strokeColor(COLORS.lineRule).lineWidth(0.5).stroke();
    doc.text(`PayApp Auditor  |  Page ${i}  |  ${auditDate}`, MARGIN_L, footerY, {
      width: CONTENT_W,
      align: 'center',
    });
    doc.restore();
  }
}

// ─── COVER PAGE ───

function drawCover() {
  // Background band
  doc.rect(0, 0, PAGE_W, 792).fill(COLORS.navy);
  // Accent stripe
  doc.rect(0, 280, PAGE_W, 6).fill(COLORS.accent);

  // Title
  doc.fontSize(36).fillColor(COLORS.white).font('Helvetica-Bold');
  doc.text('PAYAPP AUDIT REPORT', MARGIN_L, 180, { width: CONTENT_W, align: 'center' });

  // Project details
  doc.fontSize(14).font('Helvetica').fillColor('#BBCCDD');
  const details = [
    safeStr(data.project_name, 'Unnamed Project'),
    '',
    `General Contractor: ${safeStr(data.gc)}`,
    `Owner: ${safeStr(data.owner)}`,
    `Period Ending: ${safeStr(data.period_ending)}`,
    `Audit Date: ${safeStr(data.audit_date)}`,
  ];
  let y = 320;
  for (const line of details) {
    doc.text(line, MARGIN_L, y, { width: CONTENT_W, align: 'center' });
    y += 22;
  }

  // Stats bar
  y = 520;
  doc.fontSize(11).fillColor('#8899AA');
  const stats = [
    `${safeStr(data.total_pages, '—')} pages`,
    `${safeStr(data.total_documents, '—')} documents`,
    `${safeStr(data.total_vendors, '—')} vendors`,
  ].join('   •   ');
  doc.text(stats, MARGIN_L, y, { width: CONTENT_W, align: 'center' });

  // Confidential
  doc.fontSize(10).fillColor('#FF6666').font('Helvetica-Bold');
  doc.text('CONFIDENTIAL', MARGIN_L, 640, { width: CONTENT_W, align: 'center' });

  doc.fillColor(COLORS.darkGray).font('Helvetica');
}

// ─── SECTION HEADING ───

function sectionHeading(title) {
  if (doc.y > 660) doc.addPage();
  doc.moveDown(0.5);
  doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.navy);
  doc.text(title, MARGIN_L, doc.y, { width: CONTENT_W });
  doc.moveTo(MARGIN_L, doc.y + 2).lineTo(PAGE_W - MARGIN_R, doc.y + 2).strokeColor(COLORS.accent).lineWidth(1.5).stroke();
  doc.moveDown(0.6);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.darkGray);
}

function subHeading(title) {
  if (doc.y > 680) doc.addPage();
  doc.moveDown(0.3);
  doc.fontSize(13).font('Helvetica-Bold').fillColor(COLORS.accent);
  doc.text(title, MARGIN_L, doc.y, { width: CONTENT_W });
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.darkGray);
}

function bodyText(txt) {
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.darkGray);
  doc.text(txt, MARGIN_L, doc.y, { width: CONTENT_W });
}

// ─── EXECUTIVE SUMMARY ───

function drawExecutiveSummary() {
  doc.addPage();
  sectionHeading('Executive Summary');

  // Risk badge
  const risk = safeStr(data.overall_risk, 'Unknown');
  doc.fontSize(12).font('Helvetica-Bold').fillColor(riskColor(risk));
  doc.text(`Overall Risk Level: ${risk.toUpperCase()}`, MARGIN_L, doc.y, { width: CONTENT_W });
  doc.moveDown(0.4);

  // Recommendation
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.darkGray);
  doc.text(`Recommendation: ${safeStr(data.recommendation, 'No recommendation provided.')}`, { width: CONTENT_W });
  doc.moveDown(0.6);

  // Stats grid
  subHeading('Key Statistics');
  const statsRows = [
    ['Total Pages', safeStr(data.total_pages)],
    ['Total Documents', safeStr(data.total_documents)],
    ['Total Vendors', safeStr(data.total_vendors)],
    ['Errors', safeStr(data.errors, '0')],
    ['Warnings', safeStr(data.warnings, '0')],
    ['Info Items', safeStr(data.info, '0')],
  ];
  for (const [label, val] of statsRows) {
    doc.font('Helvetica-Bold').text(`${label}: `, MARGIN_L, doc.y, { continued: true, width: CONTENT_W });
    doc.font('Helvetica').text(val);
  }
  doc.moveDown(0.4);

  // G702 snapshot
  const g = data.g702 || {};
  if (Object.keys(g).length > 0) {
    subHeading('G702 Snapshot');
    const g702Rows = [
      ['Contract Sum', fmt$(g.contract_sum)],
      ['Total Completed to Date', `${fmt$(g.total_completed)} (${pct(g.total_completed, g.contract_sum)})`],
      ['Retainage', fmt$(g.retainage)],
      ['Current Payment Due', fmt$(g.current_payment_due)],
      ['Balance to Finish', fmt$(g.balance_to_finish)],
      ['Change Orders', fmt$(g.change_orders_total)],
    ];
    for (const [label, val] of g702Rows) {
      doc.font('Helvetica-Bold').text(`${label}: `, MARGIN_L, doc.y, { continued: true, width: CONTENT_W });
      doc.font('Helvetica').text(val);
    }
  }
}

// ─── PRIME CONTRACTOR ANALYSIS ───

function drawPrimeAnalysis() {
  sectionHeading('Prime Contractor Analysis');

  // SOV summary
  const sov = data.sov || {};
  if (sov.total_line_items) {
    subHeading('Schedule of Values');
    doc.text(`Total Line Items: ${sov.total_line_items}`, MARGIN_L, doc.y, { width: CONTENT_W });
    doc.text(`Items with Activity This Period: ${safeStr(sov.items_with_activity, '0')}`, { width: CONTENT_W });
    doc.moveDown(0.4);
  }

  // Prime analysis narrative
  if (data.prime_analysis) {
    subHeading('Analysis');
    bodyText(data.prime_analysis.trim());
    doc.moveDown(0.4);
  }
}

// ─── FINDINGS TABLE ───

function drawFindings() {
  sectionHeading('Audit Findings');

  const findings = data.findings || [];
  if (findings.length === 0) {
    bodyText('No findings recorded.');
    return;
  }

  // Summary counts
  const errCount = data.errors || 0;
  const warnCount = data.warnings || 0;
  const infoCount = data.info || 0;
  doc.font('Helvetica-Bold').fontSize(10);
  doc.fillColor(COLORS.error).text(`Errors: ${errCount}`, MARGIN_L, doc.y, { continued: true });
  doc.fillColor(COLORS.darkGray).text('   ', { continued: true });
  doc.fillColor(COLORS.warning).text(`Warnings: ${warnCount}`, { continued: true });
  doc.fillColor(COLORS.darkGray).text('   ', { continued: true });
  doc.fillColor(COLORS.info).text(`Info: ${infoCount}`);
  doc.moveDown(0.6);
  doc.fillColor(COLORS.darkGray).font('Helvetica');

  // Group by severity
  const groups = { error: [], warning: [], info: [] };
  for (const f of findings) {
    const sev = String(f.severity || 'info').toLowerCase();
    const bucket = groups[sev] || groups.info;
    bucket.push(f);
  }

  for (const severity of ['error', 'warning', 'info']) {
    const items = groups[severity];
    if (items.length === 0) continue;

    const label = severity === 'error' ? 'ERRORS' : severity === 'warning' ? 'WARNINGS' : 'INFO';
    const color = severity === 'error' ? COLORS.error : severity === 'warning' ? COLORS.warning : COLORS.info;

    if (doc.y > 640) doc.addPage();
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(color);
    doc.text(`${severityLabel(severity)}  ${label}`, MARGIN_L, doc.y, { width: CONTENT_W });
    doc.moveDown(0.3);

    // Table header
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.navy);
    const colX = [MARGIN_L, MARGIN_L + 45, MARGIN_L + 160, MARGIN_L + 260];
    const headerY = doc.y;
    doc.text('Rule', colX[0], headerY);
    doc.text('Vendor', colX[1], headerY);
    doc.text('Check', colX[2], headerY);
    doc.text('Description', colX[3], headerY, { width: CONTENT_W - (colX[3] - MARGIN_L) });
    doc.moveDown(0.2);
    doc.moveTo(MARGIN_L, doc.y).lineTo(PAGE_W - MARGIN_R, doc.y).strokeColor(COLORS.lineRule).lineWidth(0.5).stroke();
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(9).fillColor(COLORS.darkGray);
    for (const f of items) {
      if (doc.y > 700) doc.addPage();
      const rowY = doc.y;
      doc.text(safeStr(f.rule_number, '—'), colX[0], rowY, { width: 40 });
      doc.text(safeStr(f.vendor, '—'), colX[1], rowY, { width: 110 });
      doc.text(safeStr(f.check, '—'), colX[2], rowY, { width: 95 });
      doc.text(safeStr(f.description, '—'), colX[3], rowY, { width: CONTENT_W - (colX[3] - MARGIN_L) });
      // calculate max height used
      const descHeight = doc.heightOfString(safeStr(f.description, '—'), { width: CONTENT_W - (colX[3] - MARGIN_L) });
      doc.y = rowY + Math.max(descHeight, 14) + 4;

      // Recommendation line if present
      if (f.recommendation) {
        doc.fontSize(8).fillColor(COLORS.medGray).font('Helvetica-Oblique');
        doc.text(`↳ ${f.recommendation}`, colX[1], doc.y, { width: CONTENT_W - (colX[1] - MARGIN_L) });
        doc.moveDown(0.2);
        doc.font('Helvetica').fontSize(9).fillColor(COLORS.darkGray);
      }
    }
  }
}

// ─── VENDOR RISK SUMMARY ───

function drawVendorRisks() {
  const vendors = data.vendor_risks || [];
  if (vendors.length === 0) return;

  sectionHeading('Vendor Risk Summary');

  // Table header
  const colX = [MARGIN_L, MARGIN_L + 180, MARGIN_L + 280, MARGIN_L + 330, MARGIN_L + 380];
  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.navy);
  const hy = doc.y;
  doc.text('Vendor', colX[0], hy);
  doc.text('Total Billed', colX[1], hy);
  doc.text('Errors', colX[2], hy);
  doc.text('Warnings', colX[3], hy);
  doc.text('Risk Level', colX[4], hy, { width: CONTENT_W - (colX[4] - MARGIN_L) });
  doc.moveDown(0.2);
  doc.moveTo(MARGIN_L, doc.y).lineTo(PAGE_W - MARGIN_R, doc.y).strokeColor(COLORS.lineRule).lineWidth(0.5).stroke();
  doc.moveDown(0.2);

  doc.font('Helvetica').fontSize(9);
  for (const v of vendors) {
    if (doc.y > 700) doc.addPage();
    const ry = doc.y;
    doc.fillColor(COLORS.darkGray);
    doc.text(safeStr(v.vendor, '—'), colX[0], ry, { width: 175 });
    doc.text(fmt$(v.total_billed), colX[1], ry, { width: 95 });
    doc.text(String(v.errors || 0), colX[2], ry, { width: 45 });
    doc.text(String(v.warnings || 0), colX[3], ry, { width: 45 });
    doc.fillColor(riskColor(v.risk_level));
    doc.font('Helvetica-Bold').text(safeStr(v.risk_level, '—'), colX[4], ry, { width: CONTENT_W - (colX[4] - MARGIN_L) });
    doc.font('Helvetica').fillColor(COLORS.darkGray);
    doc.y = ry + 16;
  }
}

// ─── RECOMMENDATIONS ───

function drawRecommendations() {
  const issues = data.top_issues || [];
  if (issues.length === 0) return;

  sectionHeading('Recommendations & Top Issues');

  for (let i = 0; i < issues.length; i++) {
    if (doc.y > 700) doc.addPage();
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.darkGray);
    doc.text(`${i + 1}. ${issues[i]}`, MARGIN_L, doc.y, { width: CONTENT_W });
    doc.moveDown(0.2);
  }

  if (data.recommendation) {
    doc.moveDown(0.4);
    subHeading('Overall Recommendation');
    bodyText(data.recommendation);
  }
}

// ─── BUILD DOCUMENT ───

drawCover();
drawExecutiveSummary();
drawPrimeAnalysis();
drawFindings();
drawVendorRisks();
drawRecommendations();

// Add footers to all pages
addFooters();

doc.end();

stream.on('finish', () => {
  const size = fs.statSync(outputPath).size;
  console.log(`✅ PDF generated: ${outputPath} (${(size / 1024).toFixed(1)} KB)`);
});
stream.on('error', (err) => {
  console.error(`❌ Failed to write PDF: ${err.message}`);
  process.exit(1);
});
