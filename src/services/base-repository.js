/**
 * Y Master Editor — Extensible Base Firebase Repository & Feature Registry
 * 
 * Provides an out-of-the-box abstraction for any future feature to instantly connect
 * to Cloud Firestore, local offline caching, real-time sync, and activity telemetry.
 */

(function(global) {
  class BaseFirebaseRepository {
    /**
     * @param {string} collectionName - Firestore collection name
     * @param {object} options
     * @param {boolean} options.userScoped - Whether documents must be scoped to the authenticated user's UID (default: true)
     * @param {boolean} options.auditEnabled - Whether writes automatically trigger activity telemetry (default: true)
     * @param {boolean} options.offlineCache - Whether local cache is prioritized for instant desktop responsiveness (default: true)
     */
    constructor(collectionName, options = {}) {
      if (!collectionName) {
        throw new Error('[BaseFirebaseRepository] collectionName is required.');
      }
      this.collectionName = collectionName;
      this.userScoped = options.userScoped !== false;
      this.auditEnabled = options.auditEnabled !== false;
      this.offlineCache = options.offlineCache !== false;
      this.cacheKey = `ymaster_repo_${collectionName}`;
      this._subscribers = new Map();
      this._memoryCache = new Map();

      this._loadInitialCache();
    }

    // Helper to get active user UID from environment
    getCurrentUid() {
      if (typeof window !== 'undefined' && window.FoliyoFirebase && window.FoliyoFirebase.getCurrentUser) {
        const u = window.FoliyoFirebase.getCurrentUser();
        return u ? (u.uid || u.id) : null;
      }
      return null;
    }

    _loadInitialCache() {
      if (!this.offlineCache || typeof localStorage === 'undefined') return;
      try {
        const raw = localStorage.getItem(this.cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item && item.id) this._memoryCache.set(item.id, item);
            });
          }
        }
      } catch (e) {
        console.warn(`[BaseFirebaseRepository:${this.collectionName}] Cache load notice:`, e.message);
      }
    }

    _persistCache() {
      if (!this.offlineCache || typeof localStorage === 'undefined') return;
      try {
        const items = Array.from(this._memoryCache.values());
        localStorage.setItem(this.cacheKey, JSON.stringify(items));
      } catch (e) {
        console.warn(`[BaseFirebaseRepository:${this.collectionName}] Cache persist notice:`, e.message);
      }
    }

    /**
     * Records an audit/activity event into Firebase Telemetry
     */
    async _logTelemetry(action, docId, metadata = {}) {
      if (!this.auditEnabled) return;
      const uid = this.getCurrentUid();
      if (!uid) return;

      const eventPayload = {
        action: `${this.collectionName.toUpperCase()}_${action.toUpperCase()}`,
        collectionName: this.collectionName,
        documentId: docId,
        metadata,
        timestamp: new Date().toISOString()
      };

      try {
        if (typeof window !== 'undefined' && window.FoliyoFirebase && window.FoliyoFirebase.logActivity) {
          await window.FoliyoFirebase.logActivity(uid, eventPayload);
        }
      } catch (err) {
        console.warn('[Telemetry Log Notice]:', err.message);
      }
    }

    /**
     * Create a new document in the collection
     * @param {object} data
     * @returns {Promise<object>} The created document with generated ID and timestamps
     */
    async create(data = {}) {
      const uid = this.getCurrentUid();
      const id = data.id || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();

      const docPayload = {
        ...data,
        id,
        ownerId: this.userScoped ? (data.ownerId || uid) : undefined,
        createdAt: data.createdAt || now,
        updatedAt: now
      };

      // 1. Instant local-first memory & persistent cache update (zero UI latency)
      this._memoryCache.set(id, docPayload);
      this._persistCache();
      this._notifySubscribers(id, docPayload);

      // 2. Dispatch to Firebase via Electron IPC or Web SDK
      try {
        if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.firebaseRepoCreate) {
          await window.electronAPI.firebaseRepoCreate({
            collection: this.collectionName,
            id,
            data: docPayload
          });
        }
      } catch (err) {
        console.warn(`[BaseFirebaseRepository:${this.collectionName}] Cloud write error, kept in local cache:`, err.message);
      }

      // 3. Log Telemetry
      this._logTelemetry('create', id, { title: docPayload.title || docPayload.name });

      return docPayload;
    }

    /**
     * Get a document by ID
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    async get(id) {
      if (!id) return null;

      // Check fast local cache
      if (this._memoryCache.has(id)) {
        return this._memoryCache.get(id);
      }

      // Fetch from Cloud Firestore
      try {
        if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.firebaseRepoGet) {
          const res = await window.electronAPI.firebaseRepoGet({ collection: this.collectionName, id });
          if (res && res.data) {
            this._memoryCache.set(id, res.data);
            this._persistCache();
            return res.data;
          }
        }
      } catch (e) {
        console.warn(`[BaseFirebaseRepository:${this.collectionName}] Cloud fetch failed for ${id}:`, e.message);
      }

      return null;
    }

    /**
     * Update an existing document
     * @param {string} id
     * @param {object} partialData
     * @returns {Promise<object>} Updated document
     */
    async update(id, partialData = {}) {
      if (!id) throw new Error('ID required for update');
      const existing = await this.get(id) || { id };

      const updated = {
        ...existing,
        ...partialData,
        id,
        updatedAt: new Date().toISOString()
      };

      this._memoryCache.set(id, updated);
      this._persistCache();
      this._notifySubscribers(id, updated);

      try {
        if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.firebaseRepoUpdate) {
          await window.electronAPI.firebaseRepoUpdate({
            collection: this.collectionName,
            id,
            data: partialData
          });
        }
      } catch (err) {
        console.warn(`[BaseFirebaseRepository:${this.collectionName}] Cloud update error:`, err.message);
      }

      this._logTelemetry('update', id, { fields: Object.keys(partialData) });

      return updated;
    }

    /**
     * Delete a document
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
      if (!id) return false;
      this._memoryCache.delete(id);
      this._persistCache();
      this._notifySubscribers(id, null);

      try {
        if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.firebaseRepoDelete) {
          await window.electronAPI.firebaseRepoDelete({ collection: this.collectionName, id });
        }
      } catch (err) {
        console.warn(`[BaseFirebaseRepository:${this.collectionName}] Cloud delete error:`, err.message);
      }

      this._logTelemetry('delete', id);
      return true;
    }

    /**
     * List all items (with optional filter)
     * @param {function} [predicate]
     * @returns {Promise<Array<object>>}
     */
    async list(predicate = null) {
      const items = Array.from(this._memoryCache.values());
      const uid = this.getCurrentUid();

      let filtered = items;
      if (this.userScoped && uid) {
        filtered = filtered.filter(item => !item.ownerId || item.ownerId === uid);
      }

      if (typeof predicate === 'function') {
        filtered = filtered.filter(predicate);
      }

      return filtered;
    }

    /**
     * Subscribe to live changes on a document
     * @param {string} id
     * @param {function} callback
     * @returns {function} Unsubscribe function
     */
    subscribe(id, callback) {
      if (!this._subscribers.has(id)) {
        this._subscribers.set(id, new Set());
      }
      this._subscribers.get(id).add(callback);

      // Deliver cached state immediately if present
      if (this._memoryCache.has(id)) {
        callback(this._memoryCache.get(id));
      }

      return () => {
        const set = this._subscribers.get(id);
        if (set) {
          set.delete(callback);
          if (set.size === 0) this._subscribers.delete(id);
        }
      };
    }

    _notifySubscribers(id, data) {
      const set = this._subscribers.get(id);
      if (set) {
        set.forEach(cb => {
          try { cb(data); } catch (e) { console.error(e); }
        });
      }
    }
  }

  // Feature Registry for registering future features effortlessly
  const FeatureRegistry = {
    _repositories: new Map(),

    /**
     * Register a new feature with an associated collection and repository.
     * @param {string} featureName E.g. 'custom_templates', 'vector_brushes', 'cloud_assets'
     * @param {object} options { repositoryClass, userScoped, auditEnabled }
     * @returns {BaseFirebaseRepository}
     */
    register(featureName, options = {}) {
      if (this._repositories.has(featureName)) {
        return this._repositories.get(featureName);
      }
      const RepoClass = options.repositoryClass || BaseFirebaseRepository;
      const repo = new RepoClass(featureName, options);
      this._repositories.set(featureName, repo);
      console.log(`[Feature Registry] ✨ Registered future feature "${featureName}" with auto-Firebase sync & telemetry`);
      return repo;
    },

    /**
     * Get an existing repository for a feature
     * @param {string} featureName
     * @returns {BaseFirebaseRepository|undefined}
     */
    get(featureName) {
      return this._repositories.get(featureName);
    },

    /**
     * List all registered features
     */
    listFeatures() {
      return Array.from(this._repositories.keys());
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BaseFirebaseRepository, FeatureRegistry };
  }
  if (typeof window !== 'undefined') {
    window.BaseFirebaseRepository = BaseFirebaseRepository;
    window.YFeatureRegistry = FeatureRegistry;
  }
})(typeof window !== 'undefined' ? window : global);
