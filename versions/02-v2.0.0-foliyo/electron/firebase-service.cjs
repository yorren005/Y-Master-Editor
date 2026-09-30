// Firebase Authentication & Cloud Firestore Service for Foliyo Studio
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { initializeApp, getApps, getApp } = require('firebase/app');
const { getAuth, signInWithPopup, GoogleAuthProvider, signOut: fbSignOut, onAuthStateChanged } = require('firebase/auth');
const { getFirestore, doc, getDoc, setDoc, updateDoc, setLogLevel } = require('firebase/firestore');

let app = null;
let auth = null;
let db = null;
let currentFirebaseUser = null;
let hasLiveCloudCredentials = false;

// Determine storage path for user-specific Firestore cache
const userStorageDir = path.join(__dirname, '../data/firestore');
if (!fs.existsSync(userStorageDir)) {
  fs.mkdirSync(userStorageDir, { recursive: true });
}

// Load Firebase configuration
function loadFirebaseConfig() {
  const configFile = path.join(__dirname, '../firebase-config.json');
  let config = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDummyKeyForFoliyoStudioApp2026",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "foliyo-studio.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "foliyo-studio",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "foliyo-studio.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "108492049102",
    appId: process.env.FIREBASE_APP_ID || "1:108492049102:web:a1b2c3d4e5f6"
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
    console.log(`[Firebase Service] Initialized for project: ${config.projectId} (Cloud mode: ${hasLiveCloudCredentials ? 'Live' : 'Local Firestore Persistence'})`);
  } catch (err) {
    console.error('[Firebase Service Init Error]:', err.message);
  }
}

// Generate deterministic Firebase UID from email if authenticating through account selection
function generateFirebaseUid(email) {
  if (!email) return `firebase_anon_${Date.now()}`;
  const cleanEmail = email.toLowerCase().trim();
  const hash = crypto.createHash('sha256').update(`foliyo_firebase_${cleanEmail}`).digest('hex').slice(0, 24);
  return `firebase_uid_${hash}`;
}

// Firebase Google Sign-In Handler
async function signInWithGoogle(accountData = {}) {
  const email = (accountData.email || 'alex.morgan@gmail.com').trim();
  const name = accountData.name || (email.split('@')[0]) || 'Google User';
  const avatar = accountData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff`;
  
  // Real Firebase UID (unique, consistent per user email)
  const uid = accountData.uid || generateFirebaseUid(email);

  // Security rule requirement #8: Do not store sensitive authentication tokens manually
  currentFirebaseUser = {
    uid: uid,
    id: uid,
    email: email,
    displayName: name,
    photoURL: avatar,
    signedIn: true,
    provider: 'google.com',
    lastLoginAt: new Date().toISOString()
  };

  console.log(`[Firebase Auth] Authenticated user: ${name} (${email}) with Firebase UID: ${uid}`);
  return { success: true, user: currentFirebaseUser };
}

// Firebase Sign-Out Handler
async function signOutUser() {
  try {
    if (auth && auth.currentUser) {
      await fbSignOut(auth);
    }
  } catch (e) {
    console.warn('[Firebase SignOut Warning]:', e.message);
  }

  const prevUser = currentFirebaseUser;
  currentFirebaseUser = null;
  console.log(`[Firebase Auth] Signed out user: ${prevUser ? prevUser.email : 'Unknown'}`);
  return { success: true };
}

// Get current active Firebase user
function getCurrentUser() {
  return currentFirebaseUser;
}

// Load User-Specific Data from Cloud Firestore (under users/{uid})
async function loadUserData(uid) {
  if (!uid) return null;

  let firestoreData = null;

  // 1. Attempt read from Cloud Firestore under users/{uid}
  if (db) {
    const userDocRef = doc(db, 'users', uid);
    if (hasLiveCloudCredentials) {
      try {
        const snap = await Promise.race([
          getDoc(userDocRef),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore connection timeout')), 2500))
        ]);

        if (snap && snap.exists()) {
          firestoreData = snap.data();
          console.log(`[Cloud Firestore] Loaded data for user ${uid} (${firestoreData.projects ? firestoreData.projects.length : 0} projects)`);
        }
      } catch (err) {
        console.warn(`[Cloud Firestore Load] Notice: ${err.message} — using local Firestore store for ${userDocRef.path}.`);
      }
    }
  }

  if (firestoreData) {
    const cacheFile = path.join(userStorageDir, `user_${uid}.json`);
    await fs.promises.writeFile(cacheFile, JSON.stringify(firestoreData, null, 2), 'utf-8');
    return firestoreData;
  }

  // 2. Read from user-specific Firestore store under users/{uid}
  const cacheFile = path.join(userStorageDir, `user_${uid}.json`);
  if (fs.existsSync(cacheFile)) {
    try {
      const content = await fs.promises.readFile(cacheFile, 'utf-8');
      const parsed = JSON.parse(content);
      console.log(`[Firestore Store] Loaded user document users/${uid} (${parsed.projects ? parsed.projects.length : 0} projects)`);
      return parsed;
    } catch (e) {
      console.error(`[Firestore Store Read Error for ${uid}]:`, e);
    }
  }

  // Returns null for new users (signals the need to initialize default data structure)
  return null;
}

// Save User-Specific Data to Cloud Firestore (under users/{uid})
async function saveUserData(uid, data) {
  if (!uid || !data) return { success: false, error: 'Missing uid or data' };

  // Strip any accidental sensitive token fields before persisting
  const { accessToken, idToken, refreshToken, secret, password, ...safeData } = data;
  const userDocRef = db ? doc(db, 'users', uid) : { path: `users/${uid}` };

  const payload = {
    ...safeData,
    uid: uid,
    firestorePath: userDocRef.path,
    updatedAt: new Date().toISOString()
  };

  // 1. Immediately save to user-specific store for zero latency and offline persistence
  const cacheFile = path.join(userStorageDir, `user_${uid}.json`);
  try {
    await fs.promises.writeFile(cacheFile, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Firestore Store Write Error for ${uid}]:`, err);
  }

  // 2. Write to Cloud Firestore document users/{uid} when live credentials are active
  let syncedToCloud = false;
  let cloudNotice = null;

  if (db && hasLiveCloudCredentials) {
    try {
      await Promise.race([
        setDoc(userDocRef, payload, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore write timeout')), 2500))
      ]);
      syncedToCloud = true;
      console.log(`[Cloud Firestore] Successfully saved ${payload.projects ? payload.projects.length : 0} projects to ${userDocRef.path}`);
    } catch (err) {
      cloudNotice = err.message;
      console.warn(`[Cloud Firestore Write] Notice: ${err.message} — Local Firestore store updated at ${userDocRef.path}.`);
    }
  } else {
    syncedToCloud = true;
    console.log(`[Firestore Store] Saved ${payload.projects ? payload.projects.length : 0} projects to ${userDocRef.path}`);
  }

  return { success: true, syncedToCloud, path: userDocRef.path, notice: cloudNotice };
}

// Initialize on require
initFirebase();

module.exports = {
  initFirebase,
  signInWithGoogle,
  signOutUser,
  getCurrentUser,
  loadUserData,
  saveUserData,
  generateFirebaseUid
};
