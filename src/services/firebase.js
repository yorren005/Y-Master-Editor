// Modular Firebase Service for Y Master Editor Desktop
// Bridges Firebase Omni-Auth, Fun Nicknames, Animated SVG Avatars, Activity Telemetry & Cloud Firestore

(function(global) {
  const FirebaseService = {
    // Check if running in Electron environment with backend service
    isElectron: typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.firebaseSignUp === 'function',

    /**
     * Check nickname availability in Firebase
     */
    async checkNickname(nickname) {
      if (this.isElectron) {
        return await window.electronAPI.firebaseCheckNickname(nickname);
      }
      // Browser fallback using local registry
      const clean = String(nickname || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (clean.length < 3) return { available: false, error: 'Nickname must be at least 3 characters.' };
      const taken = localStorage.getItem(`ymaster_nick_${clean}`);
      return { available: !taken, nickname: clean, error: taken ? `Nickname @${clean} is already taken.` : undefined };
    },

    /**
     * Sign up with Nickname, Password, and optional Email & Animated Avatar
     */
    async signUpWithNickname(data) {
      if (this.isElectron) {
        return await window.electronAPI.firebaseSignUp(data);
      }

      // Browser fallback
      const clean = String(data.nickname || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      const uid = `uid_web_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const user = {
        uid,
        id: uid,
        nickname: clean,
        displayName: clean,
        email: data.email || `${clean}@ymaster.internal`,
        photoURL: data.avatarDataUrl || (window.YAvatarEngine ? window.YAvatarEngine.generateDataUrl(clean) : null),
        avatarSvg: data.avatarSvg || (window.YAvatarEngine ? window.YAvatarEngine.generateSvg(clean) : null),
        authProvider: 'password',
        signedIn: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      localStorage.setItem(`ymaster_nick_${clean}`, JSON.stringify({ uid, nickname: clean }));
      localStorage.setItem(`firestore_users_${uid}`, JSON.stringify(user));
      await this.logActivity(uid, { eventType: 'AUTH_SIGNUP', nickname: clean });

      return { success: true, user };
    },

    /**
     * Sign in using Nickname or Email + Password
     */
    async signInWithNickname(data) {
      if (this.isElectron) {
        return await window.electronAPI.firebaseSignInWithNickname(data);
      }

      // Browser fallback
      const input = String(data.nicknameOrEmail || '').trim();
      const clean = input.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const rawReg = localStorage.getItem(`ymaster_nick_${clean}`);
      let uid = rawReg ? JSON.parse(rawReg).uid : `uid_${clean}`;
      let user = await this.loadUserData(uid);

      if (!user) {
        user = {
          uid,
          id: uid,
          nickname: clean,
          displayName: clean,
          email: `${clean}@ymaster.internal`,
          photoURL: window.YAvatarEngine ? window.YAvatarEngine.generateDataUrl(clean) : null,
          authProvider: 'password',
          signedIn: true,
          lastLoginAt: new Date().toISOString()
        };
        await this.saveUserData(uid, user);
      }

      await this.logActivity(uid, { eventType: 'AUTH_LOGIN', nickname: user.nickname || clean });
      return { success: true, user };
    },

    /**
     * Omni-Auth: Sign in with Social Provider (Google, Facebook, GitHub, Apple, Anonymous)
     */
    async signInWithSocial(provider = 'google', meta = {}) {
      if (this.isElectron) {
        return await window.electronAPI.firebaseSignInSocial(provider, meta);
      }

      // Browser fallback
      const uid = `uid_${provider}_${Date.now()}`;
      const name = meta.name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} Creator`;
      const nickname = (meta.nickname || name.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16) || `${provider}_user`).toLowerCase();
      const photo = meta.avatar || (window.YAvatarEngine ? window.YAvatarEngine.generateDataUrl(nickname) : null);

      const user = {
        uid,
        id: uid,
        nickname,
        displayName: name,
        email: meta.email || `${nickname}@${provider}.com`,
        photoURL: photo,
        authProvider: provider,
        signedIn: true,
        lastLoginAt: new Date().toISOString()
      };

      await this.saveUserData(uid, user);
      await this.logActivity(uid, { eventType: 'AUTH_SOCIAL_LOGIN', provider, nickname });
      return { success: true, user };
    },

    // Google Sign-In wrapper
    async signInWithGoogle(accountData = {}) {
      return await this.signInWithSocial('google', accountData);
    },

    // Sign out from Firebase Auth
    async signOut() {
      if (this.isElectron) {
        return await window.electronAPI.firebaseSignOut();
      }
      return { success: true };
    },

    // Log Activity to Firebase Telemetry
    async logActivity(uid, eventData = {}) {
      if (!uid) return { success: false };
      if (this.isElectron) {
        return await window.electronAPI.firebaseLogActivity({ uid, eventData });
      }

      // Browser fallback
      try {
        const key = `ymaster_activity_${uid}`;
        const raw = localStorage.getItem(key);
        const logs = raw ? JSON.parse(raw) : [];
        logs.unshift({
          eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          userId: uid,
          ...eventData,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(logs.slice(0, 100)));
        return { success: true };
      } catch (e) {
        return { success: false };
      }
    },

    // Get recent activity telemetry
    async getActivityLogs(uid, maxResults = 20) {
      if (!uid) return [];
      if (this.isElectron) {
        return await window.electronAPI.firebaseGetActivityLogs({ uid, maxResults });
      }

      // Browser fallback
      try {
        const key = `ymaster_activity_${uid}`;
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw).slice(0, maxResults) : [];
      } catch (e) {
        return [];
      }
    },

    // Load User's Scoped Workspace Data from Cloud Firestore (under users/{uid})
    async loadUserData(uid) {
      if (!uid) return null;
      if (this.isElectron) {
        return await window.electronAPI.firebaseLoadUserData(uid);
      }

      // Browser fallback
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
      const nick = user.nickname || (user.displayName ? user.displayName.replace(/\s+/g, '') : 'Creator');
      const welcomeProject = {
        id: `proj_${Date.now()}`,
        title: `${user.displayName || `@${nick}`}'s Studio Workspace`,
        pageSize: 'A4',
        orientation: 'portrait',
        customWidthMm: null,
        customHeightMm: null,
        zoom: 0.95,
        mode: 'preview',
        ownerId: user.uid,
        ownerNickname: nick,
        ownerEmail: user.email,
        ownerName: user.displayName || `@${nick}`,
        assignedAt: new Date().toISOString(),
        globalStyles: `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Cinzel:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');\n  body { font-family: 'Plus Jakarta Sans', sans-serif; }\n  h1, h2, h3, .font-serif { font-family: 'Cinzel', serif; }`,
        pages: [
          {
            id: `page_${Date.now()}_1`,
            html: `<div class="h-full flex flex-col justify-between p-12 bg-[#0e1117] text-[#e6edf3] font-sans relative box-border overflow-hidden">
  <!-- Subtle Ambient Glow -->
  <div class="absolute -top-32 -right-32 w-80 h-80 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-[#ff007a]/10 rounded-full blur-3xl pointer-events-none"></div>

  <!-- Masthead -->
  <div class="relative z-10 flex justify-between items-center border-b border-[#30363d] pb-5">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#7000ff] flex items-center justify-center font-bold text-black font-mono text-lg shadow-lg">Y</div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white font-serif">Y Master Editor</h1>
        <p class="text-xs uppercase tracking-widest text-[#00f0ff] font-mono mt-0.5">Desktop Vector Studio &bull; Cloud Firebase Backend</p>
      </div>
    </div>
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] font-mono text-xs text-[#8b949e]">
      <span class="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
      <span>@${nick}</span>
    </div>
  </div>

  <!-- Hero Content -->
  <div class="relative z-10 my-auto py-8">
    <span class="inline-block px-3 py-1 rounded text-xs font-mono font-bold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 mb-4">
      OMNI-AUTH &bull; UNIQUE NICKNAME &bull; ANIMATED AVATARS
    </span>
    <h2 class="text-4xl font-serif font-bold text-white tracking-tight leading-tight max-w-2xl">
      Welcome to your personalized studio workspace.
    </h2>
    <p class="mt-4 text-[#8b949e] text-sm leading-relaxed max-w-xl font-light">
      Your account is tied to your unique handle <strong class="text-white">@${nick}</strong>. All documents, sub-pixel AI review pins, and vector print configurations are isolated to your Firebase UID. Edits stream with zero latency and automatically sync to Cloud Firestore.
    </p>

    <!-- 3 Dynamic Cards -->
    <div class="grid grid-cols-3 gap-4 mt-8">
      <div class="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
        <span class="text-xs font-mono text-[#00f0ff] font-bold block mb-1">01 / NICKNAME IDENTITY</span>
        <h3 class="text-sm font-bold text-white mb-1">@${nick}</h3>
        <p class="text-xs text-[#8b949e] leading-relaxed">Unique claim locked in /nicknames with procedural animated SVG avatar.</p>
      </div>
      <div class="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
        <span class="text-xs font-mono text-[#ff007a] font-bold block mb-1">02 / FIREBASE TELEMETRY</span>
        <h3 class="text-sm font-bold text-white mb-1">Audit Tracking</h3>
        <p class="text-xs text-[#8b949e] leading-relaxed">Every login, vector revision, and tool call streams to /tracking/{uid}/activity.</p>
      </div>
      <div class="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
        <span class="text-xs font-mono text-[#34d399] font-bold block mb-1">03 / EXTENSIBLE REPO</span>
        <h3 class="text-sm font-bold text-white mb-1">Plug-and-Play Core</h3>
        <p class="text-xs text-[#8b949e] leading-relaxed">Easily plug future features directly into Firebase with BaseFirebaseRepository.</p>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="relative z-10 border-t border-[#30363d] pt-4 flex justify-between items-center text-xs text-[#8b949e] font-mono">
    <span>Y Master Editor Desktop &bull; Secured with Cloud Firestore</span>
    <span>Page 01</span>
  </div>
</div>`,
            css: ''
          }
        ],
        comments: []
      };

      return {
        user,
        projects: [welcomeProject],
        activeProjectId: welcomeProject.id
      };
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseService;
  }
  if (typeof window !== 'undefined') {
    window.FoliyoFirebase = FirebaseService;
  }
})(typeof window !== 'undefined' ? window : global);
