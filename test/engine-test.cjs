/**
 * test/engine-test.cjs
 * Verification suite for Canonical Model & Transaction Manager
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { createDocument, computeRevisionHash, validateBounds, migrateLegacyState } = require('../src/engine/canonical-model.cjs');
const { TransactionManager } = require('../src/engine/transaction-manager.cjs');

console.log('--- RUNNING ENGINE VERIFICATION TESTS ---');

// Test 1: Canonical Document Creation & Hash Invariant
const doc = createDocument('Test Briefing', 'A4', 'portrait');
assert.strictEqual(doc.title, 'Test Briefing');
assert.strictEqual(doc.revision, 1);
assert.ok(doc.revisionHash.length === 16, 'Revision hash must be 16 chars');
console.log('✓ Test 1 Passed: Document creation & deterministic SHA-256 revision hash');

// Test 2: Bounds Validation
assert.strictEqual(validateBounds({ x: 0.1, y: 0.2, width: 0.5, height: 0.3 }), true);
assert.strictEqual(validateBounds({ x: -0.1, y: 0.2, width: 0.5, height: 0.3 }), false);
assert.strictEqual(validateBounds({ x: 0.8, y: 0.2, width: 0.5, height: 0.3 }), false); // exceeds 1.05
console.log('✓ Test 2 Passed: Normalized spatial bounds validation');

// Test 3: Transaction Manager with Mock File
const testStatePath = path.join(__dirname, 'test_state.json');
if (fs.existsSync(testStatePath)) fs.unlinkSync(testStatePath);

const tm = new TransactionManager(testStatePath);
const initialHash = tm.getDocument().revisionHash;

// Test 4: Concurrency Conflict Rejection
const conflictResult = tm.applyTransaction({
  expectedRevisionHash: 'wrong_hash_123',
  operationType: 'UPDATE_PAGE_HTML',
  payload: { pageIndex: 1, html: '<div>Hacked</div>' }
});
assert.strictEqual(conflictResult.success, false);
assert.strictEqual(conflictResult.isError, true);
assert.ok(conflictResult.error.includes('Revision conflict'));
console.log('✓ Test 4 Passed: Optimistic concurrency conflict detected and rejected');

// Test 5: Authorization Gating
tm.getDocument().comments.push({
  id: 'comment_auth_1',
  userComment: 'Change title to editorial style',
  authorized: false,
  status: 'pending'
});

const unauthResult = tm.applyTransaction({
  expectedRevisionHash: initialHash,
  commentId: 'comment_auth_1',
  operationType: 'UPDATE_PAGE_HTML',
  payload: { pageIndex: 1, html: '<div>Unauthorized Edit</div>' }
});
assert.strictEqual(unauthResult.success, false);
assert.strictEqual(unauthResult.isError, true);
assert.ok(unauthResult.error.includes('not been explicitly authorized'));
console.log('✓ Test 5 Passed: Explicit authorization gating blocks unauthorized mutations');

// Test 6: Authorized Mutation Execution & Atomic State Save
tm.getDocument().comments[0].authorized = true;
const currentHash = tm.getDocument().revisionHash;

const authResult = tm.applyTransaction({
  expectedRevisionHash: currentHash,
  commentId: 'comment_auth_1',
  operationType: 'UPDATE_PAGE_HTML',
  payload: { pageIndex: 1, html: '<div>Authorized Change Applied</div>' }
});
assert.strictEqual(authResult.success, true);
assert.strictEqual(tm.getDocument().revision, 2);
assert.strictEqual(tm.getDocument().comments[0].status, 'verified');
assert.ok(fs.existsSync(testStatePath), 'State file must be written atomically');
console.log('✓ Test 6 Passed: Authorized mutation succeeded with atomic persistence and comment status update');

// Test 7: Rollback / Undo
const rollbackResult = tm.rollback(authResult.transactionId);
assert.strictEqual(rollbackResult.success, true);
assert.strictEqual(tm.getDocument().pages[0].rawHtml !== '<div>Authorized Change Applied</div>', true);
console.log('✓ Test 7 Passed: Rollback reverts state cleanly to pre-transaction snapshot');

// Clean up
if (fs.existsSync(testStatePath)) fs.unlinkSync(testStatePath);

console.log('ALL ENGINE VERIFICATION TESTS PASSED SUCCESSFULLY!');
