const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

console.log('=== AUDITING SERVER.CJS STANDALONE EXECUTION ===\n');

function checkTempFiles() {
  const dir = path.join(__dirname, '..');
  const files = fs.readdirSync(dir);
  return files.filter(f => f.startsWith('temp_pdf_') || f.startsWith('temp_pptx_'));
}

async function waitServerReady(url, maxWaitMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return true;
    } catch (_) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  throw new Error(`Server at ${url} failed to become ready within ${maxWaitMs}ms`);
}

(async () => {
  // Verify clean initial state
  const initialTemp = checkTempFiles();
  console.log(`[Setup] Initial temp worker files: ${initialTemp.length}`);
  assert.strictEqual(initialTemp.length, 0, 'No temp worker files should exist initially');

  // Launch server.cjs
  console.log('[Step 1] Spawning node server.cjs...');
  const serverProc = spawn('node', ['server.cjs'], {
    cwd: path.join(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProc.stdout.on('data', d => {
    // console.log('[server stdout]', d.toString().trim());
  });
  serverProc.stderr.on('data', d => {
    console.error('[server stderr]', d.toString().trim());
  });

  try {
    const baseUrl = 'http://127.0.0.1:3300';
    await waitServerReady(baseUrl);
    console.log('✓ server.cjs is running and responding on http://127.0.0.1:3300\n');

    // Test A: Static File Serving
    console.log('[Test A] Auditing Static File Serving...');
    
    // 1. Root route -> index.html
    const rootRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(rootRes.status, 200, 'Root should return 200');
    assert.strictEqual(rootRes.headers.get('content-type'), 'text/html; charset=UTF-8', 'Content-Type should be HTML');
    const rootText = await rootRes.text();
    assert(rootText.includes('<!DOCTYPE html>') || rootText.includes('<html'), 'Should contain HTML doctype');
    console.log('✓ Root / correctly serves index.html with text/html; charset=UTF-8');

    // 2. Direct static asset
    const jsRes = await fetch(`${baseUrl}/vendor/pdf.min.js`);
    assert.strictEqual(jsRes.status, 200, 'Vendor JS should return 200');
    assert.strictEqual(jsRes.headers.get('content-type'), 'application/javascript; charset=UTF-8');
    console.log('✓ Direct asset /vendor/pdf.min.js served with application/javascript; charset=UTF-8');

    // 3. 404 for non-existent file
    const notFoundRes = await fetch(`${baseUrl}/does-not-exist-${Date.now()}.html`);
    assert.strictEqual(notFoundRes.status, 404, 'Non-existent file must return 404');
    console.log('✓ Non-existent route returns 404 Not Found');

    // 4. Directory traversal protection (send raw unnormalized path via http.request)
    const rawTraversalStatus = await new Promise((resolve, reject) => {
      const req = http.request({
        host: '127.0.0.1',
        port: 3300,
        path: '/../package.json',
        method: 'GET'
      }, res => resolve(res.statusCode));
      req.on('error', reject);
      req.end();
    });
    assert.strictEqual(rawTraversalStatus, 403, 'Path traversal must return 403');
    console.log('✓ Directory traversal protection (/../package.json) returns 403 Forbidden\n');

    // Test B: CORS Headers
    console.log('[Test B] Auditing CORS Headers...');
    const corsOrigin = rootRes.headers.get('access-control-allow-origin');
    const corsMethods = rootRes.headers.get('access-control-allow-methods');
    const corsHeaders = rootRes.headers.get('access-control-allow-headers');
    assert.strictEqual(corsOrigin, '*', 'Access-Control-Allow-Origin must be *');
    assert(corsMethods.includes('GET') && corsMethods.includes('POST') && corsMethods.includes('OPTIONS'), 'CORS methods include GET, POST, OPTIONS');
    assert(corsHeaders.includes('Content-Type'), 'CORS headers include Content-Type');
    console.log(`✓ CORS headers on GET verified: Origin=${corsOrigin}, Methods=${corsMethods}, Headers=${corsHeaders}`);

    // Preflight OPTIONS check
    const optionsRes = await fetch(`${baseUrl}/api/export-pdf`, { method: 'OPTIONS' });
    assert.strictEqual(optionsRes.status, 204, 'OPTIONS preflight should return 204');
    assert.strictEqual(optionsRes.headers.get('access-control-allow-origin'), '*');
    console.log('✓ OPTIONS preflight returns 204 No Content with CORS headers\n');

    // Test C: Headless PDF Export Worker Spawning & Cleanup
    console.log('[Test C] Testing Headless PDF Export Worker Spawning & Cleanup...');
    const pdfHtml = `<!DOCTYPE html><html><head><style>body { font-family: sans-serif; padding: 40px; color: #111; }</style></head><body><h1>Document Title</h1><p>Test paragraph content for headless PDF generation.</p></body></html>`;
    
    const pdfExportRes = await fetch(`${baseUrl}/api/export-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullHtml: pdfHtml,
        pageSize: 'A4',
        orientation: 'portrait'
      })
    });

    assert.strictEqual(pdfExportRes.status, 200, 'PDF export should return 200');
    assert.strictEqual(pdfExportRes.headers.get('content-type'), 'application/pdf');
    const pdfBuffer = Buffer.from(await pdfExportRes.arrayBuffer());
    console.log('[DEBUG] pdfBuffer length:', pdfBuffer.length);
    console.log('[DEBUG] pdfBuffer preview:', pdfBuffer.subarray(0, 200).toString('utf-8'));
    console.log('[DEBUG] pdfBuffer hex preview:', pdfBuffer.subarray(0, 40).toString('hex'));
    assert(pdfBuffer.toString('utf-8', 0, 5).startsWith('%PDF-'), 'PDF buffer must start with %PDF- at offset 0');
    console.log(`✓ PDF headless worker successfully spawned, generated valid PDF (${pdfBuffer.length} bytes, starts with %PDF-)`);

    // Verify temp_pdf_* file cleanup
    const tempFilesAfterPdf = checkTempFiles();
    assert.strictEqual(tempFilesAfterPdf.length, 0, `temp_pdf_* file should be cleaned up (found: ${tempFilesAfterPdf.join(', ')})`);
    console.log('✓ Headless temp_pdf_* worker file verified cleaned up\n');

    // Test D: Headless PPTX Export Worker Spawning & Cleanup
    console.log('[Test D] Testing Headless PPTX Export Worker Spawning & Cleanup...');
    const slide1Html = `<!DOCTYPE html><html><body style="background: #1e293b; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;"><h1>Slide 1: Executive Summary</h1></body></html>`;
    const slide2Html = `<!DOCTYPE html><html><body style="background: #0f172a; color: #38bdf8; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;"><h2>Slide 2: Key Metrics</h2></body></html>`;

    const pptxExportRes = await fetch(`${baseUrl}/api/export-pptx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slidesHtmlArray: [slide1Html, slide2Html],
        widthPx: 1280,
        heightPx: 720
      })
    });

    assert.strictEqual(pptxExportRes.status, 200, 'PPTX export should return 200');
    assert.strictEqual(pptxExportRes.headers.get('content-type'), 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    const pptxBuffer = Buffer.from(await pptxExportRes.arrayBuffer());
    assert(pptxBuffer.length > 5000, `PPTX buffer length should be > 5KB (got ${pptxBuffer.length})`);
    // PPTX is a zip file, starts with 'PK\x03\x04'
    assert.strictEqual(pptxBuffer[0], 0x50, 'Byte 0 should be P');
    assert.strictEqual(pptxBuffer[1], 0x4B, 'Byte 1 should be K');
    console.log(`✓ PPTX headless worker successfully spawned, generated valid presentation (${pptxBuffer.length} bytes, 2 slides)`);

    // Verify temp_pptx_* file cleanup
    const tempFilesAfterPptx = checkTempFiles();
    assert.strictEqual(tempFilesAfterPptx.length, 0, `temp_pptx_* file should be cleaned up (found: ${tempFilesAfterPptx.join(', ')})`);
    console.log('✓ Headless temp_pptx_* worker file verified cleaned up\n');

    console.log('>>> ALL SERVER.CJS STANDALONE AUDIT CHECKS PASSED 100% <<<');
  } finally {
    // Teardown server
    console.log('[Teardown] Terminating server process...');
    serverProc.kill();
  }
})().catch(err => {
  console.error('\nAudit Failed:', err);
  process.exit(1);
});
