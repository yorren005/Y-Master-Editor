// Firebase Authentication & Cloud Firestore Service for Y Master Editor Desktop
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { initializeApp, getApps, getApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider, 
  signInAnonymously,
  updateProfile,
  signOut: fbSignOut, 
  onAuthStateChanged 
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  onSnapshot,
  setLogLevel 
} = require('firebase/firestore');

let app = null;
let auth = null;
let db = null;
let currentFirebaseUser = null;
let hasLiveCloudCredentials = false;

const { resolveWritablePath } = require('./storage-paths.cjs');

// Determine storage path for local Firestore & Telemetry caches (guaranteed writable outside app.asar)
const userStorageDir = resolveWritablePath('data', 'firestore');
const trackingStorageDir = resolveWritablePath('data', 'tracking');

// Load Firebase configuration
function loadFirebaseConfig() {
  const configFile = path.join(__dirname, '../firebase-config.json');
  let config = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDummyKeyForYMasterEditorApp2026",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "y-master-editor-app.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "y-master-editor-app",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "y-master-editor-app.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "587803616353",
    appId: process.env.FIREBASE_APP_ID || "1:587803616353:web:f8d4b65bb1c5a1d2c63620"
  };

  if (fs.existsSync(configFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      config = { ...config, ...parsed };
    } catch (err) {
      console.warn('[Firebase Config] Error reading firebase-config.json:', err.message);
    }
  }

  return config;
}

function isLiveKeyConfigured(config) {
  if (!config || !config.apiKey) return false;
  const key = String(config.apiKey).trim();
  if (key.startsWith('YOUR_') || key.startsWith('AIzaSyDummy')) return false;
  return key.length > 20;
}

// Initialize Firebase
function initFirebase() {
  try {
    const config = loadFirebaseConfig();
    hasLiveCloudCredentials = isLiveKeyConfigured(config);
    if (!hasLiveCloudCredentials) {
      setLogLevel('silent');
    }

    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getFirestore(app);
    console.log(`[Firebase Service] Initialized for Y Master Editor: ${config.projectId} (Cloud mode: ${hasLiveCloudCredentials ? 'Live' : 'Local Persistence & Emulation'})`);
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentFirebaseUser = {
          uid: user.uid,
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isAnonymous: user.isAnonymous,
          signedIn: true
        };
      }
    });
  } catch (err) {
    console.error('[Firebase Service Init Error]:', err.message);
  }
}

// Deterministic UID generator from seed/handle for local/offline modes
function generateDeterministicUid(seed) {
  const hash = crypto.createHash('sha256').update(`ymaster_${String(seed).toLowerCase().trim()}`).digest('hex').slice(0, 24);
  return `uid_${hash}`;
}

// Format internal email from nickname if no email provided
function nicknameToInternalEmail(nickname) {
  const clean = String(nickname).toLowerCase().replace(/[^a-z0-9_]/g, '');
  return `${clean}@ymaster.internal`;
}

// -------------------------------------------------------------
// 1. NICKNAME RESERVATION & UNIQUENESS
// -------------------------------------------------------------

async function checkNicknameAvailability(nickname) {
  if (!nickname || typeof nickname !== 'string') {
    return { available: false, error: 'Nickname is required.' };
  }
  const clean = nickname.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (clean.length < 3) {
    return { available: false, error: 'Nickname must be at least 3 characters.' };
  }

  // 1. Check Cloud Firestore if connected
  if (db && hasLiveCloudCredentials) {
    try {
      const nickDocRef = doc(db, 'nicknames', clean);
      const snap = await Promise.race([
        getDoc(nickDocRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ]);
      if (snap && snap.exists()) {
        return { available: false, nickname: clean, error: `Nickname "@${clean}" is already claimed.` };
      }
    } catch (e) {
      console.warn('[Nickname Cloud Check Notice]:', e.message);
    }
  }

  // 2. Check local nickname registry cache
  const localRegistryFile = path.join(userStorageDir, 'nickname_registry.json');
  if (fs.existsSync(localRegistryFile)) {
    try {
      const reg = JSON.parse(fs.readFileSync(localRegistryFile, 'utf-8'));
      if (reg[clean]) {
        return { available: false, nickname: clean, error: `Nickname "@${clean}" is already claimed.` };
      }
    } catch (e) {}
  }

  return { available: true, nickname: clean };
}

async function reserveNickname(nickname, uid, metadata = {}) {
  const clean = String(nickname).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const payload = {
    nickname: clean,
    uid: uid,
    claimedAt: new Date().toISOString(),
    ...metadata
  };

  // Local persistent registration
  const localRegistryFile = path.join(userStorageDir, 'nickname_registry.json');
  let reg = {};
  if (fs.existsSync(localRegistryFile)) {
    try { reg = JSON.parse(fs.readFileSync(localRegistryFile, 'utf-8')); } catch (e) {}
  }
  reg[clean] = payload;
  fs.writeFileSync(localRegistryFile, JSON.stringify(reg, null, 2), 'utf-8');

  // Cloud Firestore reservation
  if (db && hasLiveCloudCredentials) {
    try {
      const nickDocRef = doc(db, 'nicknames', clean);
      await setDoc(nickDocRef, payload, { merge: true });
    } catch (err) {
      console.warn('[Cloud Nickname Reservation Notice]:', err.message);
    }
  }

  return { success: true, nickname: clean };
}

// -------------------------------------------------------------
// 2. AUTHENTICATION (NICKNAME + PASSWORD & SOCIAL)
// -------------------------------------------------------------

async function signUpWithNickname({ nickname, password, email, avatarSvg, avatarDataUrl }) {
  const check = await checkNicknameAvailability(nickname);
  if (!check.available) {
    return { success: false, error: check.error || 'Nickname unavailable.' };
  }

  const cleanNick = check.nickname;
  const effectiveEmail = (email && email.includes('@')) ? email.trim() : nicknameToInternalEmail(cleanNick);
  let uid = null;
  let fbUser = null;

  // 1. Create user in Firebase Authentication
  if (auth && hasLiveCloudCredentials) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, effectiveEmail, password);
      fbUser = cred.user;
      uid = fbUser.uid;
      // Set display name to nickname
      await updateProfile(fbUser, {
        displayName: cleanNick,
        photoURL: avatarDataUrl || undefined
      });
    } catch (err) {
      console.warn('[Firebase Auth Signup Cloud Notice]:', err.message);
      // If error is email-already-in-use or credentials issue, return error
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email/nickname already exists.' };
      }
      if (err.code === 'auth/weak-password') {
        return { success: false, error: 'Password should be at least 6 characters.' };
      }
      uid = generateDeterministicUid(cleanNick);
    }
  } else {
    // Offline / Emulated deterministic registration
    uid = generateDeterministicUid(cleanNick);
  }

  // 2. Reserve Nickname
  await reserveNickname(cleanNick, uid, { email: effectiveEmail, avatarDataUrl });

  // 3. Create user profile in Firestore
  const userProfile = {
    uid: uid,
    id: uid,
    nickname: cleanNick,
    displayName: cleanNick,
    email: effectiveEmail,
    photoURL: avatarDataUrl || null,
    avatarSvg: avatarSvg || null,
    authProvider: 'password',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    signedIn: true
  };

  currentFirebaseUser = userProfile;
  await saveUserData(uid, userProfile);

  // 4. Log signup activity
  await logActivity(uid, {
    eventType: 'AUTH_SIGNUP',
    nickname: cleanNick,
    authProvider: 'password',
    message: `Account created with nickname @${cleanNick}`
  });

  return { success: true, user: userProfile };
}

async function signInWithNickname({ nicknameOrEmail, password }) {
  if (!nicknameOrEmail || !password) {
    return { success: false, error: 'Please enter nickname/email and password.' };
  }

  const input = nicknameOrEmail.trim();
  let email = input;
  let nickname = input;

  // Resolve nickname to email if input does not have @
  if (!input.includes('@')) {
    const cleanNick = input.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const localRegistryFile = path.join(userStorageDir, 'nickname_registry.json');
    if (fs.existsSync(localRegistryFile)) {
      try {
        const reg = JSON.parse(fs.readFileSync(localRegistryFile, 'utf-8'));
        if (reg[cleanNick] && reg[cleanNick].email) {
          email = reg[cleanNick].email;
          nickname = cleanNick;
        } else {
          email = nicknameToInternalEmail(cleanNick);
        }
      } catch (e) {
        email = nicknameToInternalEmail(cleanNick);
      }
    } else {
      email = nicknameToInternalEmail(cleanNick);
    }
  }

  let uid = null;
  let userProfile = null;

  // 1. Attempt Firebase Auth sign-in
  if (auth && hasLiveCloudCredentials) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      uid = user.uid;
      nickname = user.displayName || nickname;
      userProfile = await loadUserData(uid);
    } catch (err) {
      console.warn('[Firebase Signin Notice]:', err.code, err.message);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }
      if (err.code === 'auth/user-not-found') {
        return { success: false, error: 'No account found with this nickname or email.' };
      }
      // For local fallback testing
      uid = generateDeterministicUid(input);
    }
  } else {
    uid = generateDeterministicUid(input);
  }

  if (!userProfile) {
    userProfile = await loadUserData(uid) || {
      uid: uid,
      id: uid,
      nickname: nickname,
      displayName: nickname,
      email: email,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname)}&background=00F0FF&color=000`,
      authProvider: 'password',
      signedIn: true,
      lastLoginAt: new Date().toISOString()
    };
  }

  userProfile.lastLoginAt = new Date().toISOString();
  userProfile.signedIn = true;
  currentFirebaseUser = userProfile;
  await saveUserData(uid, userProfile);

  // Log activity
  await logActivity(uid, {
    eventType: 'AUTH_LOGIN',
    nickname: userProfile.nickname || nickname,
    authProvider: 'password',
    message: `Logged in as @${userProfile.nickname || nickname}`
  });

  return { success: true, user: userProfile };
}

async function signInWithSocial(providerName = 'google', metadata = {}) {
  const provider = String(providerName).toLowerCase();
  let email = metadata.email || `${provider}_user_${Date.now()}@gmail.com`;
  let name = metadata.name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} Explorer`;
  let uid = metadata.uid || `uid_${provider}_${crypto.randomBytes(6).toString('hex')}`;
  let photo = metadata.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff`;

  // Real Social Auth in live mode
  if (auth && hasLiveCloudCredentials) {
    try {
      let authProvider = null;
      if (provider === 'google') authProvider = new GoogleAuthProvider();
      else if (provider === 'facebook') authProvider = new FacebookAuthProvider();
      else if (provider === 'github') authProvider = new GithubAuthProvider();
      else if (provider === 'apple') authProvider = new OAuthProvider('apple.com');
      else if (provider === 'anonymous') {
        const cred = await signInAnonymously(auth);
        uid = cred.user.uid;
        name = 'Guest Artist';
        email = `guest_${uid.slice(0, 8)}@ymaster.app`;
      }

      if (authProvider) {
        const res = await signInWithPopup(auth, authProvider);
        uid = res.user.uid;
        email = res.user.email || email;
        name = res.user.displayName || name;
        photo = res.user.photoURL || photo;
      }
    } catch (err) {
      console.warn(`[Firebase Social Auth (${provider}) Notice]:`, err.message);
    }
  }

  const nickname = name.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16) || `${provider}_creator`;
  
  const userProfile = {
    uid: uid,
    id: uid,
    nickname: nickname,
    displayName: name,
    email: email,
    photoURL: photo,
    authProvider: provider,
    signedIn: true,
    lastLoginAt: new Date().toISOString()
  };

  currentFirebaseUser = userProfile;
  await reserveNickname(nickname, uid, { email, avatarDataUrl: photo });
  await saveUserData(uid, userProfile);

  await logActivity(uid, {
    eventType: 'AUTH_SOCIAL_LOGIN',
    provider,
    nickname,
    message: `Authenticated via ${provider.toUpperCase()}`
  });

  return { success: true, user: userProfile };
}

// Firebase Sign-Out
async function signOutUser() {
  const prevUser = currentFirebaseUser;
  if (prevUser && prevUser.uid) {
    await logActivity(prevUser.uid, {
      eventType: 'AUTH_SIGNOUT',
      nickname: prevUser.nickname,
      message: 'Signed out of desktop session'
    });
  }

  try {
    if (auth && auth.currentUser) {
      await fbSignOut(auth);
    }
  } catch (e) {
    console.warn('[Firebase SignOut Warning]:', e.message);
  }

  currentFirebaseUser = null;
  return { success: true };
}

function getCurrentUser() {
  return currentFirebaseUser;
}

// -------------------------------------------------------------
// 3. FIREBASE ACTIVITY TELEMETRY & TRACKING
// -------------------------------------------------------------

async function logActivity(uid, eventData = {}) {
  if (!uid) return { success: false, error: 'Missing UID' };
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();

  const record = {
    eventId,
    userId: uid,
    eventType: eventData.eventType || 'GENERAL_ACTIVITY',
    action: eventData.action || eventData.eventType || 'ACTION',
    nickname: eventData.nickname || (currentFirebaseUser ? currentFirebaseUser.nickname : null),
    metadata: eventData.metadata || eventData,
    timestamp,
    device: {
      platform: process.platform,
      arch: process.arch,
      appVersion: '3.0.0'
    }
  };

  // 1. Save to local audit tracking file
  const localFile = path.join(trackingStorageDir, `activity_${uid}.json`);
  let logs = [];
  if (fs.existsSync(localFile)) {
    try { logs = JSON.parse(fs.readFileSync(localFile, 'utf-8')); } catch (e) {}
  }
  logs.unshift(record);
  if (logs.length > 200) logs = logs.slice(0, 200); // Maintain rolling 200 events
  fs.writeFileSync(localFile, JSON.stringify(logs, null, 2), 'utf-8');

  // 2. Write to Cloud Firestore under tracking/{uid}/activity/{eventId}
  if (db && hasLiveCloudCredentials) {
    try {
      const trackRef = doc(db, 'tracking', uid, 'activity', eventId);
      await setDoc(trackRef, record);
    } catch (err) {
      console.warn('[Firestore Activity Log Notice]:', err.message);
    }
  }

  return { success: true, eventId, record };
}

async function getActivityLogs(uid, maxResults = 25) {
  if (!uid) return [];

  // Check Cloud Firestore
  if (db && hasLiveCloudCredentials) {
    try {
      const q = query(
        collection(db, 'tracking', uid, 'activity'),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );
      const snap = await getDocs(q);
      if (snap && !snap.empty) {
        return snap.docs.map(d => d.data());
      }
    } catch (e) {
      console.warn('[Cloud Telemetry Fetch Notice]:', e.message);
    }
  }

  // Fallback to local tracking cache
  const localFile = path.join(trackingStorageDir, `activity_${uid}.json`);
  if (fs.existsSync(localFile)) {
    try {
      const logs = JSON.parse(fs.readFileSync(localFile, 'utf-8'));
      return logs.slice(0, maxResults);
    } catch (e) {}
  }

  return [];
}

// -------------------------------------------------------------
// 4. USER DATA & WORKSPACE PERSISTENCE
// -------------------------------------------------------------

async function loadUserData(uid) {
  if (!uid) return null;
  const safeUid = String(uid).replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeUid) return null;

  // Cloud Firestore read
  if (db && hasLiveCloudCredentials) {
    try {
      const userDocRef = doc(db, 'users', safeUid);
      const snap = await Promise.race([
        getDoc(userDocRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500))
      ]);
      if (snap && snap.exists()) {
        const data = snap.data();
        const cacheFile = path.join(userStorageDir, `user_${safeUid}.json`);
        fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2), 'utf-8');
        return data;
      }
    } catch (err) {
      console.warn(`[Cloud Firestore Load Notice]: ${err.message}`);
    }
  }

  // Local user cache
  const cacheFile = path.join(userStorageDir, `user_${safeUid}.json`);
  if (fs.existsSync(cacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    } catch (e) {}
  }

  return null;
}

async function saveUserData(uid, data) {
  if (!uid || !data) return { success: false };
  const safeUid = String(uid).replace(/[^a-zA-Z0-9_-]/g, '');
  const { accessToken, idToken, refreshToken, secret, password, ...safeData } = data;

  const payload = {
    ...safeData,
    uid: safeUid,
    updatedAt: new Date().toISOString()
  };

  // 1. Instant local write
  const cacheFile = path.join(userStorageDir, `user_${safeUid}.json`);
  try {
    fs.writeFileSync(cacheFile, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (e) {}

  // 2. Cloud Firestore sync
  if (db && hasLiveCloudCredentials) {
    try {
      const userDocRef = doc(db, 'users', safeUid);
      await setDoc(userDocRef, payload, { merge: true });
    } catch (err) {
      console.warn('[Cloud Firestore Save Notice]:', err.message);
    }
  }

  return { success: true };
}

// -------------------------------------------------------------
// 5. EXTENSIBLE REPOSITORY CRUD (FOR FUTURE FEATURES)
// -------------------------------------------------------------

async function repoCreate({ collection: colName, id, data }) {
  const docRef = db ? doc(db, colName, id) : null;
  if (db && hasLiveCloudCredentials && docRef) {
    try {
      await setDoc(docRef, data, { merge: true });
    } catch (e) {
      console.warn(`[RepoCreate Cloud Error for ${colName}]:`, e.message);
    }
  }
  return { success: true, id };
}

async function repoGet({ collection: colName, id }) {
  if (db && hasLiveCloudCredentials) {
    try {
      const docRef = doc(db, colName, id);
      const snap = await getDoc(docRef);
      if (snap && snap.exists()) return { success: true, data: snap.data() };
    } catch (e) {}
  }
  return { success: false, data: null };
}

async function repoUpdate({ collection: colName, id, data }) {
  if (db && hasLiveCloudCredentials) {
    try {
      const docRef = doc(db, colName, id);
      await updateDoc(docRef, data);
    } catch (e) {}
  }
  return { success: true };
}

async function repoDelete({ collection: colName, id }) {
  if (db && hasLiveCloudCredentials) {
    try {
      const docRef = doc(db, colName, id);
      await deleteDoc(docRef);
    } catch (e) {}
  }
  return { success: true };
}

/**
 * Real-time listener for app_meta/desktop_release (Zero-delay hot-swap trigger)
 */
function subscribeDesktopRelease(callback) {
  if (!db || !hasLiveCloudCredentials) return () => {};
  try {
    return onSnapshot(doc(db, 'app_meta', 'desktop_release'), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data && typeof callback === 'function') {
        callback(data);
      }
    });
  } catch (err) {
    console.warn('[Firebase Desktop Release Subscribe Notice]:', err.message);
    return () => {};
  }
}

// Initialize on load
initFirebase();

module.exports = {
  initFirebase,
  checkNicknameAvailability,
  reserveNickname,
  signUpWithNickname,
  signInWithNickname,
  signInWithSocial,
  signOutUser,
  getCurrentUser,
  logActivity,
  getActivityLogs,
  loadUserData,
  saveUserData,
  repoCreate,
  repoGet,
  repoUpdate,
  repoDelete,
  subscribeDesktopRelease
};
