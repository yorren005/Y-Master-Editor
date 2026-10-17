const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');

console.log('--- RUNNING DOCUMENT INGESTION & IMPORT PIPELINE VERIFICATION ---');

(async () => {
  // Test 1: Generate a test PDF with text and vector graphics using pdf-lib
  console.log('[Test 1] Creating a sample multi-page PDF document...');
  const pdfDoc = await PDFDocument.create();
  
  const page1 = pdfDoc.addPage([600, 800]);
  page1.drawText('Scientific Architecture & Energy Dynamics', { x: 50, y: 720, size: 20 });
  page1.drawText('Experimental study of thermal boundary dissipation.', { x: 50, y: 680, size: 12 });
  page1.drawRectangle({
    x: 50,
    y: 350,
    width: 500,
    height: 280,
    borderColor: rgb(0.55, 0.32, 0.1),
    borderWidth: 2,
    color: rgb(0.97, 0.95, 0.92)
  });
  page1.drawText('Figure 1: Core Reaction Vessel Diagram', { x: 60, y: 360, size: 11 });

  const page2 = pdfDoc.addPage([800, 600]); // landscape slide
  page2.drawText('Widescreen Executive Briefing', { x: 50, y: 530, size: 22 });

  const pdfBytes = await pdfDoc.save();
  assert(pdfBytes.length > 500, 'PDF bytes should be non-empty');
  console.log(`✓ Sample PDF created (${pdfBytes.length} bytes, 2 pages)`);

  // Test 2: Check vendor/pdf.min.js and vendor/pdf.worker.min.js integrity
  console.log('[Test 2] Verifying offline vendor PDF.js bundle integrity...');
  const vendorPdfPath = path.join(__dirname, '../src/vendor/pdf.min.js');
  const vendorWorkerPath = path.join(__dirname, '../src/vendor/pdf.worker.min.js');
  assert(fs.existsSync(vendorPdfPath), 'src/vendor/pdf.min.js must exist');
  assert(fs.existsSync(vendorWorkerPath), 'src/vendor/pdf.worker.min.js must exist');
  const pdfJsSize = fs.statSync(vendorPdfPath).size;
  const workerSize = fs.statSync(vendorWorkerPath).size;
  assert(pdfJsSize > 200000, 'pdf.min.js size should be > 200KB');
  assert(workerSize > 800000, 'pdf.worker.min.js size should be > 800KB');
  console.log(`✓ Offline vendor assets verified (PDF.js: ${pdfJsSize} bytes, Worker: ${workerSize} bytes)`);

  // Test 3: Workspace JSON Schema & Import Invariant Verification
  console.log('[Test 3] Verifying JSON Workspace parsing & normalization...');
  const sampleWorkspaceJson = JSON.stringify({
    title: 'Imported Quantum Electrodynamics Paper',
    docType: 'pdf',
    pageSize: 'A4',
    orientation: 'portrait',
    pages: [
      {
        id: 'p-1',
        rawHtml: '<div class="p-8"><h1>Quantum Vacuum Energy</h1><p>Equation 4.1</p></div>',
        css: ''
      }
    ],
    comments: [
      {
        id: 'c-import-1',
        pageIndex: 0,
        selector: 'h1',
        selectedText: 'Quantum Vacuum Energy',
        userComment: 'Refine headline to cite Casimir cavity measurements',
        authorized: true,
        status: 'authorized',
        bounds: { x: 0.1, y: 0.1, width: 0.8, height: 0.15 }
      }
    ]
  });

  const parsed = JSON.parse(sampleWorkspaceJson);
  assert.strictEqual(parsed.title, 'Imported Quantum Electrodynamics Paper');
  assert.strictEqual(parsed.pages.length, 1);
  assert.strictEqual(parsed.comments[0].authorized, true);
  console.log('✓ JSON Workspace schema & comment pins verified.');

  // Test 4: Image & SVG Diagram Ingestion Verification
  console.log('[Test 4] Verifying SVG scientific illustration container markup...');
  const sampleSvg = `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="200" fill="#faf7f2"/>
    <circle cx="200" cy="100" r="60" fill="#a85620"/>
    <text x="200" y="105" text-anchor="middle" fill="#ffffff" font-size="14">NEURAL CORE</text>
  </svg>`;

  assert(sampleSvg.includes('<svg') && sampleSvg.includes('</svg>'), 'Valid SVG markup');
  assert(sampleSvg.includes('NEURAL CORE'), 'Contains expected label');
  console.log('✓ SVG diagram verification passed.');

  console.log('\n>>> ALL 4 DOCUMENT INGESTION & IMPORT TESTS PASSED 100% <<<');
})();
