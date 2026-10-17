/**
 * canonical-model.cjs
 * Y Master Editor — Canonical Document Model & Invariant Engine
 * Isomorphic / Node.js & Electron compatible
 */

const crypto = require('crypto');

/**
 * Standard Paper and Screen Dimensions in Millimeters
 */
const DOCUMENT_DIMENSIONS = {
  A4: { widthMm: 210, heightMm: 297, name: 'A4' },
  A3: { widthMm: 297, heightMm: 420, name: 'A3' },
  A5: { widthMm: 148, heightMm: 210, name: 'A5' },
  Letter: { widthMm: 215.9, heightMm: 279.4, name: 'Letter' },
  Legal: { widthMm: 215.9, heightMm: 355.6, name: 'Legal' },
  Tabloid: { widthMm: 279.4, heightMm: 431.8, name: 'Tabloid' },
  '16:9': { widthMm: 338.7, heightMm: 190.5, name: '16:9 Widescreen' },
  '4:3': { widthMm: 254.0, heightMm: 190.5, name: '4:3 Standard' }
};

/**
 * Computes deterministic SHA-256 hash of document structure
 */
function computeRevisionHash(doc) {
  const hashPayload = {
    id: doc.id,
    title: doc.title || '',
    revision: doc.revision,
    dimensions: doc.dimensions,
    globalStyles: doc.globalStyles || '',
    pages: (doc.pages || []).map(p => ({
      id: p.id,
      pageNumber: p.pageNumber,
      rawHtml: p.rawHtml || '',
      css: p.css || '',
      components: (p.components || []).map(c => ({
        id: c.id,
        type: c.type,
        bounds: c.bounds,
        content: c.content,
        style: c.style
      })),
      regions: (p.regions || []).map(r => ({
        id: r.id,
        bounds: r.bounds,
        assetRef: r.assetRef || '',
        content: r.content || '',
        assetType: r.assetType || ''
      }))
    }))
  };

  const rawJson = JSON.stringify(hashPayload);
  return crypto.createHash('sha256').update(rawJson).digest('hex').slice(0, 16);
}

/**
 * Validates normalized bounds [0..1]
 */
function validateBounds(bounds) {
  if (!bounds || typeof bounds !== 'object') return false;
  const { x, y, width, height } = bounds;
  if (
    typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number' ||
    !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)
  ) {
    return false;
  }
  return x >= 0 && x <= 1.0 && y >= 0 && y <= 1.0 && width > 0 && height > 0 && (x + width) <= 1.05 && (y + height) <= 1.05;
}

/**
 * Creates a new Canonical Document
 */
function createDocument(title = 'Untitled Document', pageSize = 'A4', orientation = 'portrait') {
  const dims = DOCUMENT_DIMENSIONS[pageSize] || DOCUMENT_DIMENSIONS.A4;
  const isLandscape = orientation === 'landscape' || pageSize === '16:9' || pageSize === '4:3';

  const doc = {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: title,
    revision: 1,
    revisionHash: '',
    metadata: {
      author: 'Y Master Editor User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formatVersion: '3.0.0'
    },
    dimensions: {
      pageSize: pageSize,
      orientation: isLandscape ? 'landscape' : 'portrait',
      widthMm: isLandscape ? dims.heightMm : dims.widthMm,
      heightMm: isLandscape ? dims.widthMm : dims.heightMm
    },
    globalStyles: '',
    pages: [createPage(1)],
    comments: [],
    history: []
  };

  doc.revisionHash = computeRevisionHash(doc);
  return doc;
}

/**
 * Creates a Canonical Page with default content
 */
function createPage(pageNumber = 1, initialHtml = '') {
  return {
    id: `page_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    pageNumber: pageNumber,
    components: [],
    regions: [],
    rawHtml: initialHtml || '<div class="p-12 text-slate-800">New Page Content</div>',
    css: ''
  };
}

/**
 * Migrates a legacy document state (raw HTML strings) into Canonical Document model
 */
function migrateLegacyState(legacyState) {
  if (!legacyState || typeof legacyState !== 'object') {
    return createDocument();
  }

  // If already canonical, return sanitized version
  if (legacyState.revision !== undefined && Array.isArray(legacyState.pages) && legacyState.dimensions) {
    if (!legacyState.revisionHash) {
      legacyState.revisionHash = computeRevisionHash(legacyState);
    }
    return legacyState;
  }

  const pageSize = legacyState.pageSize || 'A4';
  const orientation = legacyState.orientation || 'portrait';
  const doc = createDocument(legacyState.title || 'Migrated Project', pageSize, orientation);

  doc.id = legacyState.id || doc.id;
  doc.globalStyles = legacyState.globalStyles || '';
  doc.currentUser = legacyState.currentUser || null;
  doc.ownerEmail = legacyState.ownerEmail || null;

  if (Array.isArray(legacyState.pages) && legacyState.pages.length > 0) {
    doc.pages = legacyState.pages.map((p, idx) => ({
      id: p.id || `page_${idx + 1}`,
      pageNumber: idx + 1,
      components: p.components || [],
      regions: p.regions || [],
      rawHtml: p.rawHtml || p.html || '',
      css: p.css || ''
    }));
  } else {
    doc.pages = [createPage(1)];
  }

  if (Array.isArray(legacyState.comments)) {
    doc.comments = legacyState.comments.map(c => ({
      id: c.id || `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      pageIndex: c.pageIndex !== undefined ? c.pageIndex : 0,
      selector: c.selector || '#page-content',
      selectedText: c.selectedText || '',
      userComment: c.userComment || c.comment || '',
      geometry: c.geometry || {
        type: 'point',
        x: (c.x || 80) / 800,
        y: (c.y || 120) / 1130
      },
      resolved: !!c.resolved,
      status: c.status || (c.resolved ? 'verified' : 'pending'),
      authorized: !!c.authorized,
      createdAt: c.createdAt || new Date().toISOString()
    }));
  }

  doc.revisionHash = computeRevisionHash(doc);
  return doc;
}

module.exports = {
  DOCUMENT_DIMENSIONS,
  computeRevisionHash,
  validateBounds,
  createDocument,
  createPage,
  migrateLegacyState
};
