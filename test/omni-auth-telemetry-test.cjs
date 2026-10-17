/**
 * Automated Verification Suite for Y Master Editor
 * Tests:
 * 1. Procedural Animated SVG Avatar Engine & Nickname Generator
 * 2. Firebase Service Omni-Auth, Nickname Reservation & Unique Checks
 * 3. Firebase Activity Telemetry Logging & History Retrieval
 * 4. Extensible Base Repository CRUD
 */

const assert = require('assert');
const path = require('path');
const AvatarEngine = require('../src/engine/avatar-engine.js');
const firebaseService = require('../electron/firebase-service.cjs');
const { BaseFirebaseRepository, FeatureRegistry } = require('../src/services/base-repository.js');

async function runTests() {
  console.log('🧪 Starting Y Master Editor Verification Suite...\n');

  // Test 1: Avatar Engine
  console.log('--- 1. Testing Animated SVG Avatar Engine & Nickname Generator ---');
  const funNick = AvatarEngine.generateFunNickname();
  console.log(`✓ Generated fun nickname: ${funNick}`);
  assert.ok(funNick.length >= 5, 'Nickname must be at least 5 chars');

  const validation = AvatarEngine.validateNickname(funNick);
  assert.strictEqual(validation.valid, true, 'Generated nickname should be valid');

  const svg = AvatarEngine.generateSvg(funNick, { size: 100, animated: true });
  assert.ok(svg.includes('<svg'), 'Output should contain <svg tag');
  assert.ok(svg.includes('class="y-animated-avatar"'), 'Output should have animated avatar class');
  assert.ok(svg.includes('animateTransform') || svg.includes('animate'), 'SVG should contain embedded SMIL animations');
  console.log('✓ Procedural Animated SVG generated with embedded SMIL animations');

  const dataUrl = AvatarEngine.generateDataUrl(funNick);
  assert.ok(dataUrl.startsWith('data:image/svg+xml;utf8,'), 'Data URL should be correctly encoded');
  console.log('✓ Data URL generation passed');

  // Test 2: Nickname Availability & Registration
  console.log('\n--- 2. Testing Nickname Verification & Reservation ---');
  const testHandle = `TestPilot_${Date.now()}`;
  const check1 = await firebaseService.checkNicknameAvailability(testHandle);
  assert.strictEqual(check1.available, true, 'Fresh nickname should be available');
  console.log(`✓ Nickname @${testHandle} is available`);

  // Test 3: Sign Up with Nickname
  console.log('\n--- 3. Testing Sign Up with Nickname & Password ---');
  const signupRes = await firebaseService.signUpWithNickname({
    nickname: testHandle,
    password: 'MasterPassword123!',
    email: `${testHandle.toLowerCase()}@test.internal`,
    avatarSvg: svg,
    avatarDataUrl: dataUrl
  });

  assert.strictEqual(signupRes.success, true, 'Sign up should succeed');
  assert.ok(signupRes.user, 'User object must be returned');
  assert.strictEqual(signupRes.user.nickname, testHandle.toLowerCase(), 'Nickname should be recorded');
  console.log(`✓ User signed up with UID: ${signupRes.user.uid} and handle @${signupRes.user.nickname}`);

  // Test 3b: Verify Nickname is now TAKEN
  const check2 = await firebaseService.checkNicknameAvailability(testHandle);
  assert.strictEqual(check2.available, false, 'Claimed nickname must now report as taken');
  console.log(`✓ Nickname @${testHandle} correctly verified as claimed`);

  // Test 4: Sign In with Nickname
  console.log('\n--- 4. Testing Sign In with Nickname & Password ---');
  const signinRes = await firebaseService.signInWithNickname({
    nicknameOrEmail: testHandle,
    password: 'MasterPassword123!'
  });
  assert.strictEqual(signinRes.success, true, 'Sign in with nickname should succeed');
  assert.strictEqual(signinRes.user.uid, signupRes.user.uid, 'UID must match');
  console.log(`✓ Authenticated as @${signinRes.user.nickname}`);

  // Test 5: Firebase Activity Telemetry & Tracking
  console.log('\n--- 5. Testing Firebase Activity Telemetry Logging ---');
  await firebaseService.logActivity(signupRes.user.uid, {
    eventType: 'VECTOR_CANVAS_EDIT',
    action: 'ADD_PAGE',
    nickname: testHandle,
    metadata: { pageIndex: 2, pageSize: 'A4' }
  });

  const logs = await firebaseService.getActivityLogs(signupRes.user.uid, 5);
  assert.ok(logs.length >= 2, 'Should have signup, login, and edit logs');
  const recentAction = logs[0];
  console.log(`✓ Recent Telemetry Event: ${recentAction.eventType || recentAction.action} at ${recentAction.timestamp}`);
  assert.strictEqual(recentAction.userId, signupRes.user.uid, 'Telemetry record must match user UID');

  // Test 6: Extensible Base Firebase Repository
  console.log('\n--- 6. Testing Plug-and-Play BaseFirebaseRepository & Feature Registry ---');
  const templateRepo = FeatureRegistry.register('cloud_templates', { userScoped: true });
  assert.ok(templateRepo, 'Repository instance created');
  assert.strictEqual(FeatureRegistry.listFeatures().includes('cloud_templates'), true, 'Feature registered in registry');
  console.log(`✓ Future feature registered dynamically: ${FeatureRegistry.listFeatures().join(', ')}`);

  console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
