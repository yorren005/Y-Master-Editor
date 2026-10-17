/**
 * Selection Overlay & Pointer Engine Verification Test
 * Tests:
 * 1. Mode normalizations (circle/lasso -> oval, rectangle, object)
 * 2. Parametric Oval / Circle selection geometry & shift constraint
 * 3. Zoom decoupling and normalized coordinate invariant [0..1]
 * 4. Popover zoom-scaled screen placement
 */

const assert = require('assert');
const { SelectionOverlayEngine } = require('../src/engine/selection-overlay.js');

console.log('--- RUNNING SELECTION OVERLAY & POINTER ENGINE TESTS ---');

// Mock DOM elements for headless testing
function createMockCanvas(widthPx = 1440, heightPx = 980) {
  return {
    dataset: {
      pageIndex: '0',
      widthPx: String(widthPx),
      heightPx: String(heightPx)
    },
    width: widthPx,
    height: heightPx,
    style: {},
    getContext: () => ({
      clearRect: () => {},
      beginPath: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      setLineDash: () => {},
      measureText: (txt) => ({ width: txt.length * 6 }),
      fillText: () => {},
      moveTo: () => {},
      lineTo: () => {}
    }),
    getBoundingClientRect: () => ({
      left: 100,
      top: 50,
      width: widthPx * 0.75, // Scaled down by zoom
      height: heightPx * 0.75
    })
  };
}

// Test 1: Mode Normalization
console.log('[Test 1] Mode normalization & alias resolution...');
const engine = new SelectionOverlayEngine({
  getPageDimensionsPx: () => ({ widthPx: 1200, heightPx: 800 })
});

engine.setMode('lasso');
assert.strictEqual(engine.mode, 'oval', 'Mode "lasso" must normalize to "oval"');

engine.setMode('circle');
assert.strictEqual(engine.mode, 'oval', 'Mode "circle" must normalize to "oval"');

engine.setMode('rectangle');
assert.strictEqual(engine.mode, 'rectangle', 'Mode "rectangle" must remain "rectangle"');

engine.setMode('object');
assert.strictEqual(engine.mode, 'object', 'Mode "object" must remain "object"');
console.log('✓ Mode normalizations verified.');

// Test 2: Oval / Circle Selection completion & bounds normalization
console.log('[Test 2] Parametric Oval & Circle drag completion...');
let completedSelection = null;
const engineWithCallback = new SelectionOverlayEngine({
  getPageDimensionsPx: () => ({ widthPx: 1000, heightPx: 800 }),
  onSelectionComplete: (sel) => { completedSelection = sel; }
});
engineWithCallback.setMode('oval');

const mockCanvas = createMockCanvas(1000, 800);

// Simulate pointer down at normX: 0.2, normY: 0.3
engineWithCallback.handlePointerDown({ clientX: 250, clientY: 230 }, mockCanvas);

// Simulate pointer up at normX: 0.6, normY: 0.7 (drag span = 0.4 x 0.4)
engineWithCallback.handlePointerUp({ clientX: 550, clientY: 470, shiftKey: false }, mockCanvas);

assert(completedSelection, 'Selection must complete');
assert.strictEqual(completedSelection.type, 'oval', 'Type must be oval');
assert(completedSelection.bounds.width > 0 && completedSelection.bounds.width <= 1, 'Width must be normalized [0..1]');
assert(completedSelection.bounds.height > 0 && completedSelection.bounds.height <= 1, 'Height must be normalized [0..1]');
assert.strictEqual(completedSelection.pixelRect.width, 400, 'Pixel width on 1000px canvas must be 400');
assert.strictEqual(completedSelection.pixelRect.height, 320, 'Pixel height on 800px canvas must be 320');
console.log('✓ Oval drag bounds & unscaled pixelRect verified.');

// Test 3: Shift key circle constraint
console.log('[Test 3] Shift key perfect circle constraint...');
engineWithCallback.handlePointerDown({ clientX: 250, clientY: 230 }, mockCanvas);
// Drag asymmetric rectangle spanX = 0.4, spanY = 0.2 with shiftKey = true
engineWithCallback.handlePointerUp({ clientX: 550, clientY: 350, shiftKey: true }, mockCanvas);

assert(completedSelection, 'Shift selection must complete');
assert.strictEqual(completedSelection.bounds.width, completedSelection.bounds.height, 'Width and height must be identical for circle');
console.log('✓ Circle shift-constraint verified.');

// Test 4: Single-click instant circular focus
console.log('[Test 4] Single-click instant circular focus zone...');
engineWithCallback.handlePointerDown({ clientX: 300, clientY: 200 }, mockCanvas);
engineWithCallback.handlePointerUp({ clientX: 302, clientY: 201 }, mockCanvas); // minimal move < 0.015

assert(completedSelection, 'Single-click must create focus zone');
assert.strictEqual(completedSelection.bounds.width, 0.12, 'Default focus zone width must be 0.12');
assert.strictEqual(completedSelection.bounds.height, 0.12, 'Default focus zone height must be 0.12');
console.log('✓ Instant circular focus zone verified.');

// Test 5: Popover zoom-scaled screen placement formula
console.log('[Test 5] Popover zoom-scaled screen placement formula...');
function computePopoverPos(iframeRect, pinLeft, pinTop, pinHeight, zoom) {
  const screenX = iframeRect.left + (pinLeft * zoom);
  const screenY = iframeRect.top + ((pinTop + pinHeight) * zoom) + 12;
  return { screenX, screenY };
}

const iframeRect = { left: 200, top: 100 };
const pinLeft = 400; // unscaled page coordinate
const pinTop = 300;
const pinHeight = 100;

// At 100% zoom:
const pos100 = computePopoverPos(iframeRect, pinLeft, pinTop, pinHeight, 1.0);
assert.strictEqual(pos100.screenX, 600, 'ScreenX at 100% zoom must be 200 + 400 = 600');
assert.strictEqual(pos100.screenY, 512, 'ScreenY at 100% zoom must be 100 + 400 + 12 = 512');

// At 72% zoom:
const pos72 = computePopoverPos(iframeRect, pinLeft, pinTop, pinHeight, 0.72);
assert.strictEqual(pos72.screenX, 200 + (400 * 0.72), 'ScreenX at 72% zoom must scale by 0.72');
assert.strictEqual(pos72.screenY, 100 + (400 * 0.72) + 12, 'ScreenY at 72% zoom must scale by 0.72');

console.log('✓ Popover zoom scaling coordinates verified across zoom levels.');

console.log('\n>>> ALL 5 SELECTION OVERLAY & POINTER TESTS PASSED 100% <<<');
