/**
 * transaction-manager.cjs
 * Y Master Editor — Transactional Change Engine & Rollback Manager
 */

const fs = require('fs');
const path = require('path');
const { computeRevisionHash, validateBounds, migrateLegacyState } = require('./canonical-model.cjs');

class TransactionManager {
  constructor(stateFilePath) {
    this.stateFilePath = stateFilePath || path.join(__dirname, '..', '..', 'document_state.json');
    this.document = this.loadState();
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 50;
  }

  loadState() {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return migrateLegacyState(parsed);
      }
    } catch (err) {
      console.error('[TransactionManager] Failed to load state file:', err.message);
    }
    return migrateLegacyState(null);
  }

  saveStateAtomic() {
    let tempPath = null;
    try {
      this.document.revisionHash = computeRevisionHash(this.document);
      this.document.metadata = this.document.metadata || {};
      this.document.metadata.updatedAt = new Date().toISOString();

      const dir = path.dirname(this.stateFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      tempPath = `${this.stateFilePath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.document, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.stateFilePath);
      return true;
    } catch (err) {
      if (tempPath && fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (_) {}
      }
      console.error('[TransactionManager] Atomic save failed:', err.message);
      return false;
    }
  }

  loadDocument() {
    this.document = this.loadState();
    return this.document;
  }

  getDocument() {
    return this.document;
  }

  setDocument(newDoc) {
    this.document = migrateLegacyState(newDoc);
    this.saveStateAtomic();
  }

  /**
   * Validates and applies a structured mutation to the document
   */
  applyTransaction(proposal) {
    const {
      transactionId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      expectedRevisionHash,
      commentId,
      operationType, // 'UPDATE_COMPONENT' | 'REPLACE_REGION' | 'UPDATE_PAGE_HTML' | 'ADD_PAGE' | 'DELETE_PAGE'
      payload,
      force = false
    } = proposal;

    // 1. Optimistic Concurrency Check
    if (!force && expectedRevisionHash && expectedRevisionHash !== this.document.revisionHash) {
      return {
        success: false,
        isError: true,
        error: `Revision conflict. Expected revision hash '${expectedRevisionHash}', but document is currently at revision ${this.document.revision} ('${this.document.revisionHash}'). Refresh outline and re-evaluate.`
      };
    }

    // 2. Bounds Validation
    if (payload && payload.bounds) {
      if (!validateBounds(payload.bounds)) {
        return {
          success: false,
          isError: true,
          error: `Invalid spatial bounds: ${JSON.stringify(payload.bounds)}. Normalized coordinates must be within [0..1] with positive width and height.`
        };
      }
    }

    // 3. Explicit User Authorization Check
    if (commentId) {
      const comment = (this.document.comments || []).find(c => c.id === commentId);
      if (!comment) {
        return {
          success: false,
          isError: true,
          error: `Comment ID '${commentId}' not found. Cannot verify user authorization.`
        };
      }
      if (!comment.authorized && !force) {
        return {
          success: false,
          isError: true,
          error: `Instruction '${comment.userComment}' (ID: ${commentId}) has not been explicitly authorized by the user for execution. User must confirm implementation first.`
        };
      }
      if (comment.resolved && !force) {
        return {
          success: false,
          isError: true,
          error: `Instruction '${comment.userComment}' (ID: ${commentId}) is already marked as resolved. Cannot reuse resolved instruction.`
        };
      }
    }

    // 4. Capture Snapshot for Rollback Stack
    const preSnapshot = JSON.parse(JSON.stringify(this.document));

    // 4. Execute Mutation
    let mutated = false;
    let mutationMessage = '';

    try {
      switch (operationType) {
        case 'UPDATE_PAGE_HTML': {
          const pageIndex = (payload.pageIndex || 1) - 1;
          const page = this.document.pages[pageIndex];
          if (!page) {
            return {
              success: false,
              isError: true,
              error: `Page ${payload.pageIndex} does not exist. Document has ${this.document.pages.length} pages.`
            };
          }
          if (payload.html !== undefined) page.rawHtml = payload.html;
          if (payload.css !== undefined) page.css = payload.css;
          mutated = true;
          mutationMessage = `Updated HTML for Page ${payload.pageIndex}.`;
          break;
        }

        case 'UPDATE_COMPONENT': {
          const { pageIndex = 1, componentId, content, style, bounds } = payload;
          const page = this.document.pages[pageIndex - 1];
          if (!page) {
            return {
              success: false,
              isError: true,
              error: `Page ${pageIndex} does not exist.`
            };
          }
          if (!page.components) page.components = [];
          let comp = page.components.find(c => c.id === componentId);
          if (!comp) {
            comp = {
              id: componentId,
              type: payload.type || 'text',
              bounds: bounds || { x: 0.1, y: 0.1, width: 0.8, height: 0.1 },
              rotation: 0,
              zIndex: page.components.length + 1,
              content: content || '',
              style: style || {}
            };
            page.components.push(comp);
          } else {
            if (content !== undefined) comp.content = content;
            if (style !== undefined) comp.style = Object.assign({}, comp.style, style);
            if (bounds !== undefined) comp.bounds = bounds;
          }
          mutated = true;
          mutationMessage = `Updated component '${componentId}' on Page ${pageIndex}.`;
          break;
        }

        case 'REPLACE_REGION': {
          const { pageIndex = 1, bounds, replacementAsset, assetType = 'svg' } = payload;
          const page = this.document.pages[pageIndex - 1];
          if (!page) {
            return { success: false, isError: true, error: `Page ${pageIndex} does not exist.` };
          }
          if (!page.regions) page.regions = [];
          const regionId = `reg_${Date.now()}`;
          page.regions.push({
            id: regionId,
            bounds: bounds,
            assetType: assetType,
            content: replacementAsset,
            createdAt: new Date().toISOString()
          });
          mutated = true;
          mutationMessage = `Replaced visual region on Page ${pageIndex} (${assetType.toUpperCase()} asset injected).`;
          break;
        }

        case 'ADD_PAGE': {
          const newPageNumber = this.document.pages.length + 1;
          this.document.pages.push({
            id: `page_${Date.now()}`,
            pageNumber: newPageNumber,
            components: [],
            regions: [],
            rawHtml: payload.html || '<div class="p-12 text-slate-800">New Page</div>',
            css: payload.css || ''
          });
          mutated = true;
          mutationMessage = `Added Page ${newPageNumber}.`;
          break;
        }

        case 'DELETE_PAGE': {
          const pageIndex = (payload.pageIndex || 1) - 1;
          if (this.document.pages.length <= 1) {
            return { success: false, isError: true, error: 'Cannot delete the only page in the document.' };
          }
          if (!this.document.pages[pageIndex]) {
            return { success: false, isError: true, error: `Page ${payload.pageIndex} does not exist.` };
          }
          this.document.pages.splice(pageIndex, 1);
          // Re-index remaining pages
          this.document.pages.forEach((p, idx) => { p.pageNumber = idx + 1; });
          mutated = true;
          mutationMessage = `Deleted Page ${payload.pageIndex}. Remaining pages: ${this.document.pages.length}.`;
          break;
        }

        default:
          return {
            success: false,
            isError: true,
            error: `Unknown operation type '${operationType}'.`
          };
      }
    } catch (execErr) {
      return {
        success: false,
        isError: true,
        error: `Mutation failed: ${execErr.message}`
      };
    }

    if (mutated) {
      // 5. Update Comment status if bound to comment
      if (commentId) {
        const comment = (this.document.comments || []).find(c => c.id === commentId);
        if (comment) {
          comment.status = 'verified';
          comment.resolved = true;
          comment.appliedAt = new Date().toISOString();
          comment.transactionId = transactionId;
        }
      }

      // 6. Push to Undo Stack
      this.undoStack.push({
        transactionId,
        operationType,
        description: mutationMessage,
        snapshot: preSnapshot,
        timestamp: new Date().toISOString()
      });
      if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
      this.redoStack = []; // Clear redo on new action

      // 7. Increment Revision and Atomic Save
      this.document.revision += 1;
      const saved = this.saveStateAtomic();
      if (!saved) {
        this.document = preSnapshot;
        this.undoStack.pop();
        return {
          success: false,
          isError: true,
          error: 'Atomic state persistence failed to save to disk. In-memory state rolled back.'
        };
      }

      return {
        success: true,
        transactionId,
        revision: this.document.revision,
        revisionHash: this.document.revisionHash,
        message: mutationMessage
      };
    }

    return { success: false, isError: true, error: 'No mutation was applied.' };
  }

  /**
   * Reverts the last transaction or a specific transaction ID
   */
  rollback(targetTxId) {
    if (this.undoStack.length === 0) {
      return { success: false, isError: true, error: 'Undo stack is empty. No operations to revert.' };
    }

    let entry = null;
    if (targetTxId) {
      const idx = this.undoStack.findIndex(e => e.transactionId === targetTxId);
      if (idx !== -1) {
        entry = this.undoStack.splice(idx, 1)[0];
      }
    } else {
      entry = this.undoStack.pop();
    }

    if (!entry) {
      return { success: false, isError: true, error: `Transaction '${targetTxId}' not found in undo history.` };
    }

    // Save current state to redo
    this.redoStack.push({
      transactionId: `redo_${Date.now()}`,
      description: `Reverted: ${entry.description}`,
      snapshot: JSON.parse(JSON.stringify(this.document)),
      timestamp: new Date().toISOString()
    });

    // Revert state
    this.document = migrateLegacyState(entry.snapshot);
    this.document.revision += 1;
    this.saveStateAtomic();

    return {
      success: true,
      message: `Successfully rolled back transaction '${entry.transactionId}' (${entry.description}).`,
      revision: this.document.revision,
      revisionHash: this.document.revisionHash
    };
  }

  /**
   * Redoes a previously reverted transaction
   */
  redo() {
    if (this.redoStack.length === 0) {
      return { success: false, isError: true, error: 'Redo stack is empty.' };
    }

    const entry = this.redoStack.pop();
    this.undoStack.push({
      transactionId: `undo_redo_${Date.now()}`,
      description: entry.description,
      snapshot: JSON.parse(JSON.stringify(this.document)),
      timestamp: new Date().toISOString()
    });

    this.document = migrateLegacyState(entry.snapshot);
    this.document.revision += 1;
    this.saveStateAtomic();

    return {
      success: true,
      message: `Redid transaction: ${entry.description}`,
      revision: this.document.revision,
      revisionHash: this.document.revisionHash
    };
  }
}

module.exports = {
  TransactionManager
};
