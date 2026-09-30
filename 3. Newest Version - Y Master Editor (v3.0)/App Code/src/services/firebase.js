// Modular Firebase Service for Foliyo Studio
// Bridges Firebase Authentication with Google Sign-In and Cloud Firestore Data Isolation

(function(global) {
  const FirebaseService = {
    // Check if running in Electron environment with backend service
    isElectron: typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.firebaseSignIn === 'function',

    // Google Sign-In via Firebase Auth
    async signInWithGoogle(accountData = {}) {
      if (this.isElectron) {
        return await window.electronAPI.firebaseSignIn(accountData);
      }

      // Web Fallback if run directly in browser
      const email = accountData.email || 'alex.morgan@gmail.com';
      const name = accountData.name || email.split('@')[0];
      const avatar = accountData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff`;
      const uid = accountData.uid || `firebase_uid_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;

      const user = {
        uid,
        id: uid,
        email,
        displayName: name,
        photoURL: avatar,
        signedIn: true,
        provider: 'google.com',
        lastLoginAt: new Date().toISOString()
      };

      return { success: true, user };
    },

    // Sign out from Firebase Auth
    async signOut() {
      if (this.isElectron) {
        return await window.electronAPI.firebaseSignOut();
      }
      return { success: true };
    },

    // Load User's Scoped Workspace Data from Cloud Firestore (under users/{uid})
    async loadUserData(uid) {
      if (!uid) return null;
      if (this.isElectron) {
        return await window.electronAPI.firebaseLoadUserData(uid);
      }

      // Browser fallback (Local Storage cache mimicking Firestore path users/{uid})
      try {
        const raw = localStorage.getItem(`firestore_users_${uid}`);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    // Save User's Scoped Workspace Data to Cloud Firestore (under users/{uid})
    async saveUserData(uid, data) {
      if (!uid || !data) return { success: false };
      if (this.isElectron) {
        return await window.electronAPI.firebaseSaveUserData(uid, data);
      }

      // Browser fallback
      try {
        localStorage.setItem(`firestore_users_${uid}`, JSON.stringify({
          ...data,
          uid,
          updatedAt: new Date().toISOString()
        }));
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },

    // Generate clean default data structure for new users
    createDefaultUserData(user) {
      const welcomeProject = {
        id: `proj_welcome_${Date.now()}`,
        title: `${user.displayName || 'My'} Workspace`,
        pageSize: 'A4',
        orientation: 'portrait',
        customWidthMm: null,
        customHeightMm: null,
        zoom: 0.88,
        mode: 'preview',
        ownerId: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName,
        assignedAt: new Date().toISOString(),
        globalStyles: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');\n  body { font-family: 'Plus Jakarta Sans', sans-serif; }\n  h1, h2, h3, .font-serif { font-family: 'Cormorant Garamond', serif; }`,
        pages: [
          {
            id: `page_${Date.now()}_1`,
            html: `<div class="h-full flex flex-col justify-between p-14 bg-[#faf7f2] text-[#241c15]">
  <div>
    <!-- Masthead -->
    <div class="flex justify-between items-baseline border-b border-[#dcd3c5] pb-5">
      <div>
        <p class="text-xs uppercase tracking-[0.25em] font-semibold text-[#a85620]">Cloud Firestore &bull; User Workspace</p>
        <h1 class="text-3xl font-serif text-[#241c15] mt-1">${user.displayName || 'User'}'s Foliyo Studio</h1>
      </div>
      <span class="text-xs font-mono text-[#786755] bg-[#ede7df] px-2.5 py-1 rounded-full border border-[#dcd3c5]">
        UID: ${user.uid.slice(0, 14)}...
      </span>
    </div>

    <!-- Welcome Content -->
    <div class="mt-12">
      <p class="text-xs uppercase tracking-widest text-[#a85620] font-bold mb-2">Authenticated Session</p>
      <h2 class="text-4xl font-serif text-[#241c15] leading-tight tracking-tight">
        Personalized Workspace Loaded from Cloud Firestore
      </h2>
      <p class="mt-4 text-[#4d3f32] text-sm leading-relaxed max-w-2xl font-light">
        Welcome to Foliyo. Your documents, AI review pins, and vector print configurations are isolated to your Firebase UID. All edits automatically synchronize to your private Firestore records.
      </p>
    </div>

    <!-- 3 Quick Cards -->
    <div class="grid grid-cols-3 gap-5 mt-10">
      <div class="p-5 bg-white border border-[#dcd3c5] rounded-lg shadow-sm">
        <span class="text-xs font-mono font-bold text-[#a85620] block mb-2">01 / ISOLATION</span>
        <h3 class="font-serif text-lg text-[#241c15] mb-1">User-Specific Store</h3>
        <p class="text-xs text-[#786755] leading-relaxed">Secured with Firestore Security Rules restricting reads and writes to request.auth.uid.</p>
      </div>

      <div class="p-5 bg-white border border-[#dcd3c5] rounded-lg shadow-sm">
        <span class="text-xs font-mono font-bold text-[#8c633a] block mb-2">02 / VECTOR FIDELITY</span>
        <h3 class="font-serif text-lg text-[#241c15] mb-1">Print &amp; Slides</h3>
        <p class="text-xs text-[#786755] leading-relaxed">Create multi-page documents or 16:9 presentations with 100% Chromium PDF precision.</p>
      </div>

      <div class="p-5 bg-white border border-[#dcd3c5] rounded-lg shadow-sm">
        <span class="text-xs font-mono font-bold text-[#756350] block mb-2">03 / AI AGENT PINS</span>
        <h3 class="font-serif text-lg text-[#241c15] mb-1">Sub-pixel Review</h3>
        <p class="text-xs text-[#786755] leading-relaxed">Highlight text and drop pins for autonomous pair-programming agents via MCP.</p>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="border-t border-[#dcd3c5] pt-4 flex justify-between items-center text-xs text-[#786755]">
    <span>Foliyo Studio &bull; Cloud Firestore Backed</span>
    <span class="font-mono text-[#241c15]">Page 01</span>
  </div>
</div>`,
            css: ''
          }
        ],
        comments: []
      };

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        activeProjectId: welcomeProject.id,
        projects: [welcomeProject],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  };

  global.FoliyoFirebase = FirebaseService;
})(typeof window !== 'undefined' ? window : this);
