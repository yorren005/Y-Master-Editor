const assert = require('assert');
const { PdfAdapter } = require('../src/engine/pdf-adapter.cjs');

async function runTests() {
  console.log('--- RUNNING PDF ADAPTER VERIFICATION SUITE ---');

  // 1. Create a 3-page test document
  console.log('[Test 1] Create empty multi-page document...');
  const initialPdfBytes = await PdfAdapter.createEmptyDocument(595.28, 841.89, 3);
  assert(initialPdfBytes && initialPdfBytes.length > 0, 'PDF bytes generated');

  // 2. Inspect document
  console.log('[Test 2] Inspect document structure...');
  const info = await PdfAdapter.inspectPdf(initialPdfBytes);
  assert.strictEqual(info.pageCount, 3, 'Should have exactly 3 pages');
  assert.strictEqual(Math.round(info.pages[0].widthPt), 595, 'Page 1 width');
  assert.strictEqual(Math.round(info.pages[0].heightPt), 842, 'Page 1 height');
  console.log('✓ Document inspection succeeded.');

  // 3. Stamp annotation on page 2 (index 1)
  console.log('[Test 3] Stamp vector annotation on page 2...');
  const stampedBytes = await PdfAdapter.stampAnnotation(initialPdfBytes, 1, {
    x: 0.1,
    y: 0.2,
    width: 0.8,
    height: 0.3
  });
  assert(stampedBytes.length > initialPdfBytes.length, 'Stamped PDF has annotation content');
  const stampedInfo = await PdfAdapter.inspectPdf(stampedBytes);
  assert.strictEqual(stampedInfo.pageCount, 3, 'Page count preserved');
  console.log('✓ Annotation stamping succeeded.');

  // 4. Test Coordinate Normalization
  console.log('[Test 4] Verify normalized to PDF point conversion...');
  const box = PdfAdapter.normalizeToPdfPoints({ x: 0.1, y: 0.2, width: 0.5, height: 0.4 }, 600, 800);
  assert.strictEqual(box.x, 60, 'Box X');
  assert.strictEqual(box.width, 300, 'Box Width');
  assert.strictEqual(box.height, 320, 'Box Height');
  // Top-left y=0.2, h=0.4 => bottom-left y = (1 - 0.2 - 0.4) * 800 = 0.4 * 800 = 320
  assert.strictEqual(box.y, 320, 'Box Y (inverted origin)');
  console.log('✓ Coordinate mapping verified.');

  // 5. Replace region with mock 1x1 PNG image
  console.log('[Test 5] Regional inpainting / replacement with image...');
  // Minimal valid 1x1 transparent PNG bytes
  const mockPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const mockPngBytes = Buffer.from(mockPngBase64, 'base64');
  const replacedBytes = await PdfAdapter.replacePageRegion(stampedBytes, 0, {
    x: 0.2,
    y: 0.2,
    width: 0.6,
    height: 0.4
  }, mockPngBytes, 'png');

  const replacedInfo = await PdfAdapter.inspectPdf(replacedBytes);
  assert.strictEqual(replacedInfo.pageCount, 3, 'Page count still 3');
  console.log('✓ Regional inpainting succeeded.');

  console.log('\n>>> ALL 5 PDF ADAPTER TESTS PASSED 100% <<<');
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
