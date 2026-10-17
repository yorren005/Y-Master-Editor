/**
 * mcp-tools.cjs
 * Universal AI-Agent-Friendly MCP Tool Catalog for Y Master Editor
 * Uses Zod schemas & self-healing isError responses
 */

const { z } = require('zod');

/**
 * Registers all core AI-native document workspace tools on an McpServer instance
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} mcpServer
 * @param {import('./transaction-manager.cjs').TransactionManager} transactionManager
 * @param {Function} [broadcastFn] Optional callback to notify connected Electron UI
 */
function registerDocumentTools(mcpServer, transactionManager, broadcastFn = null) {

  // Helper to format success
  const successResult = (text) => ({
    content: [{ type: 'text', text: typeof text === 'string' ? text : JSON.stringify(text, null, 2) }]
  });

  // Helper to format self-healing error
  const errorResult = (errorMessage, remediation = '') => ({
    content: [{
      type: 'text',
      text: remediation ? `Error: ${errorMessage}\nRemediation: ${remediation}` : `Error: ${errorMessage}`
    }],
    isError: true
  });

  // 1. Tool: get_document_outline
  mcpServer.registerTool(
    'get_document_outline',
    {
      description: `Inspect high-level structure and metadata of the active document.
USE WHEN: You need to understand document layout, page count, paper dimensions, current revision hash, or pending instructions before making changes.
TOKEN FOOTPRINT: Very small (~150 tokens). Always call this first before requesting full page content.`,
      inputSchema: z.object({})
    },
    async () => {
      try {
        const doc = transactionManager.getDocument();
        const pendingCount = (doc.comments || []).filter(c => !c.resolved).length;
        const authorizedCount = (doc.comments || []).filter(c => c.authorized && !c.resolved).length;

        const outline = {
          id: doc.id,
          title: doc.title,
          revision: doc.revision,
          revisionHash: doc.revisionHash,
          dimensions: doc.dimensions,
          totalPages: doc.pages.length,
          instructionsSummary: {
            total: (doc.comments || []).length,
            pending: pendingCount,
            authorizedForExecution: authorizedCount
          },
          pages: doc.pages.map(p => ({
            pageNumber: p.pageNumber,
            id: p.id,
            componentsCount: (p.components || []).length,
            regionsCount: (p.regions || []).length,
            previewText: (p.rawHtml || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
          }))
        };
        return successResult(outline);
      } catch (err) {
        return errorResult(err.message, "Verify document state is accessible.");
      }
    }
  );

  // 2. Tool: get_selection_context
  mcpServer.registerTool(
    'get_selection_context',
    {
      description: `Retrieve targeted context for an element, selection, or specific page.
USE WHEN: You need to inspect the code, text, or visual properties of a selected element or page before modifying it.`,
      inputSchema: z.object({
        pageNumber: z.number().int().min(1).describe("1-indexed page number to inspect."),
        selector: z.string().optional().describe("Optional CSS selector to query within the page HTML."),
        commentId: z.string().optional().describe("Optional comment/instruction ID to retrieve its bound selection target.")
      })
    },
    async ({ pageNumber, selector, commentId }) => {
      try {
        const doc = transactionManager.getDocument();
        const page = doc.pages[pageNumber - 1];
        if (!page) {
          return errorResult(
            `Page ${pageNumber} does not exist.`,
            `Document currently has ${doc.pages.length} pages (1 to ${doc.pages.length}). Call 'get_document_outline' to verify.`
          );
        }

        let boundComment = null;
        if (commentId) {
          boundComment = (doc.comments || []).find(c => c.id === commentId);
        }

        const response = {
          pageNumber,
          pageId: page.id,
          rawHtml: page.rawHtml || '',
          css: page.css || '',
          components: page.components || [],
          regions: page.regions || [],
          boundInstruction: boundComment || null
        };

        return successResult(response);
      } catch (err) {
        return errorResult(err.message);
      }
    }
  );

  // 3. Tool: get_pending_instructions
  mcpServer.registerTool(
    'get_pending_instructions',
    {
      description: `Retrieve all contextual instructions (user comment pins) attached to the document.
USE WHEN: Resolving user intent. Identifies which comments are pending and whether the user has authorized them for implementation.`,
      inputSchema: z.object({
        authorizedOnly: z.boolean().default(false).describe("If true, returns only instructions explicitly authorized by the user for execution.")
      })
    },
    async ({ authorizedOnly }) => {
      try {
        const doc = transactionManager.getDocument();
        let list = doc.comments || [];
        if (authorizedOnly) {
          list = list.filter(c => c.authorized && !c.resolved);
        }
        return successResult({
          currentRevisionHash: doc.revisionHash,
          instructionsCount: list.length,
          instructions: list.map(c => ({
            id: c.id,
            pageIndex: c.pageIndex,
            pageNumber: c.pageIndex + 1,
            userInstruction: c.userComment,
            selectedText: c.selectedText,
            selector: c.selector,
            geometry: c.geometry,
            authorized: !!c.authorized,
            status: c.status || 'pending',
            resolved: !!c.resolved
          }))
        });
      } catch (err) {
        return errorResult(err.message);
      }
    }
  );

  // 4. Tool: authorize_instruction
  mcpServer.registerTool(
    'authorize_instruction',
    {
      description: `Grant explicit user authorization for a pending instruction to be implemented.
USE WHEN: The user explicitly commands 'implement this instruction' or 'implement comment #N'.`,
      inputSchema: z.object({
        commentId: z.string().describe("ID of the instruction/comment to authorize."),
        authorize: z.boolean().default(true).describe("Set true to authorize, false to revoke.")
      })
    },
    async ({ commentId, authorize }) => {
      try {
        const doc = transactionManager.getDocument();
        const comment = (doc.comments || []).find(c => c.id === commentId);
        if (!comment) {
          return errorResult(`Instruction with ID '${commentId}' not found.`, "Call 'get_pending_instructions' to inspect valid IDs.");
        }
        comment.authorized = authorize;
        comment.status = authorize ? 'authorized' : 'pending';
        transactionManager.saveStateAtomic();

        if (broadcastFn) {
          broadcastFn({ type: 'INSTRUCTION_AUTHORIZED', commentId, authorized: authorize });
        }

        return successResult({
          success: true,
          commentId,
          userInstruction: comment.userComment,
          authorized: comment.authorized,
          status: comment.status,
          message: authorize ? "Instruction is now authorized for execution." : "Instruction authorization revoked."
        });
      } catch (err) {
        return errorResult(err.message);
      }
    }
  );

  // 5. Tool: propose_component_change
  mcpServer.registerTool(
    'propose_component_change',
    {
      description: `Update or create a discrete component (heading, text block, card, or vector) on a page.
USE WHEN: Implementing targeted typography, styling, content, or bounding box changes to a specific element.
INVARIANT: Only changes the specified component. All other document components remain untouched.`,
      inputSchema: z.object({
        expectedRevisionHash: z.string().describe("Current revision hash from get_document_outline for optimistic concurrency check."),
        commentId: z.string().optional().describe("Optional authorized comment ID this change fulfills."),
        pageNumber: z.number().int().min(1).describe("Target page number."),
        componentId: z.string().describe("Unique component identifier."),
        type: z.enum(['text', 'image', 'vector', 'shape', 'table', 'group']).default('text'),
        content: z.any().optional().describe("Updated text, markup, or asset data."),
        style: z.record(z.any()).optional().describe("Key-value styling properties (e.g. font, color, border)."),
        bounds: z.object({
          x: z.number().min(0).max(1),
          y: z.number().min(0).max(1),
          width: z.number().min(0).max(1),
          height: z.number().min(0).max(1)
        }).optional().describe("Normalized spatial bounding box [0..1] on the page.")
      })
    },
    async ({ expectedRevisionHash, commentId, pageNumber, componentId, type, content, style, bounds }) => {
      try {
        const result = transactionManager.applyTransaction({
          expectedRevisionHash,
          commentId,
          operationType: 'UPDATE_COMPONENT',
          payload: { pageIndex: pageNumber, componentId, type, content, style, bounds }
        });

        if (result.isError) {
          const remediation = result.error && result.error.includes('Revision conflict')
            ? "Call 'get_document_outline' to inspect current revision hash and refresh proposal."
            : result.error && result.error.includes('authorized')
            ? "Ensure user has authorized the instruction pin via UI."
            : "Verify component ID and bounding coordinates.";
          return errorResult(result.error, remediation);
        }

        if (broadcastFn) {
          try { broadcastFn({ type: 'DOCUMENT_UPDATED', revision: result.revision }); } catch (_) {}
        }

        return successResult({
          success: true,
          transactionId: result.transactionId,
          newRevision: result.revision,
          newRevisionHash: result.revisionHash,
          message: result.message
        });
      } catch (err) {
        return errorResult(err.message, "Inspect parameters and verify transaction manager availability.");
      }
    }
  );

  // 6. Tool: propose_region_replacement
  mcpServer.registerTool(
    'propose_region_replacement',
    {
      description: `Replace a bounded visual region (such as a scientific illustration or diagram) with a generated SVG or high-DPI asset.
USE WHEN: Transforming diagrams, charts, or illustrations within an exact rectangular area without altering surrounding page content.`,
      inputSchema: z.object({
        expectedRevisionHash: z.string().describe("Current revision hash for optimistic concurrency."),
        commentId: z.string().optional().describe("Authorized comment ID fulfilling this region replacement."),
        pageNumber: z.number().int().min(1).describe("Target page number."),
        bounds: z.object({
          x: z.number().min(0).max(1),
          y: z.number().min(0).max(1),
          width: z.number().min(0).max(1),
          height: z.number().min(0).max(1)
        }).describe("Normalized bounding box of the visual region to replace."),
        replacementAsset: z.string().describe("Clean SVG string or image data URL to render inside the region bounds."),
        assetType: z.enum(['svg', 'image', 'html']).default('svg')
      })
    },
    async ({ expectedRevisionHash, commentId, pageNumber, bounds, replacementAsset, assetType }) => {
      try {
        const result = transactionManager.applyTransaction({
          expectedRevisionHash,
          commentId,
          operationType: 'REPLACE_REGION',
          payload: { pageIndex: pageNumber, bounds, replacementAsset, assetType }
        });

        if (result.isError) {
          const remediation = result.error && result.error.includes('Revision conflict')
            ? "Call 'get_document_outline' to inspect current revision hash."
            : "Verify normalized region bounds [0..1] and ensure replacement asset is well-formed.";
          return errorResult(result.error, remediation);
        }

        if (broadcastFn) {
          try { broadcastFn({ type: 'DOCUMENT_UPDATED', revision: result.revision }); } catch (_) {}
        }

        return successResult({
          success: true,
          transactionId: result.transactionId,
          newRevision: result.revision,
          newRevisionHash: result.revisionHash,
          message: result.message
        });
      } catch (err) {
        return errorResult(err.message, "Verify SVG asset syntax and target bounds.");
      }
    }
  );

  // 7. Tool: update_page_content
  mcpServer.registerTool(
    'update_page_content',
    {
      description: `Update the raw HTML body or styling of a document page.
USE WHEN: Performing direct template or layout updates on an entire page.
PREFER: propose_component_change when modifying individual components.`,
      inputSchema: z.object({
        expectedRevisionHash: z.string().describe("Current revision hash for optimistic concurrency."),
        commentId: z.string().optional().describe("Optional authorized comment ID."),
        pageNumber: z.number().int().min(1).describe("1-indexed page number to update."),
        html: z.string().min(5).describe("Complete HTML markup body for the page."),
        css: z.string().optional().describe("Optional scoped CSS overrides for this page.")
      })
    },
    async ({ expectedRevisionHash, commentId, pageNumber, html, css }) => {
      try {
        const result = transactionManager.applyTransaction({
          expectedRevisionHash,
          commentId,
          operationType: 'UPDATE_PAGE_HTML',
          payload: { pageIndex: pageNumber, html, css }
        });

        if (result.isError) {
          const remediation = result.error && result.error.includes('Revision conflict')
            ? "Call 'get_document_outline' to inspect current revision hash."
            : "Verify page number exists in outline.";
          return errorResult(result.error, remediation);
        }

        if (broadcastFn) {
          try { broadcastFn({ type: 'DOCUMENT_UPDATED', revision: result.revision }); } catch (_) {}
        }

        return successResult({
          success: true,
          transactionId: result.transactionId,
          newRevision: result.revision,
          newRevisionHash: result.revisionHash,
          message: result.message
        });
      } catch (err) {
        return errorResult(err.message, "Verify page exists and HTML is valid.");
      }
    }
  );

  // 8. Tool: add_page
  mcpServer.registerTool(
    'add_page',
    {
      description: "Append a new page or slide to the document.",
      inputSchema: z.object({
        expectedRevisionHash: z.string().describe("Current revision hash."),
        html: z.string().optional().describe("Initial HTML body for the new page."),
        css: z.string().optional().describe("Initial CSS styling.")
      })
    },
    async ({ expectedRevisionHash, html, css }) => {
      try {
        const result = transactionManager.applyTransaction({
          expectedRevisionHash,
          operationType: 'ADD_PAGE',
          payload: { html, css }
        });

        if (result.isError) return errorResult(result.error, "Check current revision hash.");
        if (broadcastFn) {
          try { broadcastFn({ type: 'DOCUMENT_UPDATED', revision: result.revision }); } catch (_) {}
        }

        return successResult({
          success: true,
          transactionId: result.transactionId,
          newRevision: result.revision,
          newRevisionHash: result.revisionHash,
          message: result.message
        });
      } catch (err) {
        return errorResult(err.message, "Verify document state is valid.");
      }
    }
  );

  // 9. Tool: rollback_transaction
  mcpServer.registerTool(
    'rollback_transaction',
    {
      description: `Revert the document back to the state preceding a transaction.
USE WHEN: An AI-generated change fails validation, produces visual errors, or the user requests an Undo.`,
      inputSchema: z.object({
        transactionId: z.string().optional().describe("Specific transaction ID to rollback. If omitted, rolls back the most recent transaction.")
      })
    },
    async ({ transactionId }) => {
      try {
        const result = transactionManager.rollback(transactionId);
        if (result.isError) return errorResult(result.error, "Verify transaction history contains reversible operations.");
        if (broadcastFn) {
          try { broadcastFn({ type: 'DOCUMENT_UPDATED', revision: result.revision }); } catch (_) {}
        }

        return successResult({
          success: true,
          message: result.message,
          newRevision: result.revision,
          newRevisionHash: result.revisionHash
        });
      } catch (err) {
        return errorResult(err.message, "Undo stack error.");
      }
    }
  );
}

const TOOL_DEFINITIONS = {
  get_document_outline: {
    description: "Inspect high-level structure and metadata of the active document (pages, revision hash, dimensions, instruction counts).",
    openApiSchema: {
      type: "object",
      properties: {}
    }
  },
  get_selection_context: {
    description: "Retrieve targeted context for an element, selection, or specific page.",
    openApiSchema: {
      type: "object",
      required: ["pageNumber"],
      properties: {
        pageNumber: { type: "integer", minimum: 1, description: "1-indexed page number to inspect" },
        selector: { type: "string", description: "Optional CSS selector to query" },
        commentId: { type: "string", description: "Optional comment/instruction ID" }
      }
    }
  },
  get_pending_instructions: {
    description: "Retrieve all contextual instructions (user comment pins) attached to the document.",
    openApiSchema: {
      type: "object",
      properties: {
        authorizedOnly: { type: "boolean", default: false, description: "Return only authorized instructions" }
      }
    }
  },
  authorize_instruction: {
    description: "Grant explicit user authorization for a pending instruction to be implemented.",
    openApiSchema: {
      type: "object",
      required: ["commentId"],
      properties: {
        commentId: { type: "string", description: "Instruction ID to authorize" },
        authorize: { type: "boolean", default: true, description: "True to authorize, false to revoke" }
      }
    }
  },
  propose_component_change: {
    description: "Update or create a discrete component (heading, text block, card, or vector) on a page.",
    openApiSchema: {
      type: "object",
      required: ["expectedRevisionHash", "pageNumber", "componentId"],
      properties: {
        expectedRevisionHash: { type: "string", description: "Current revision hash for concurrency check" },
        commentId: { type: "string", description: "Authorized comment ID" },
        pageNumber: { type: "integer", minimum: 1, description: "Target page number" },
        componentId: { type: "string", description: "Unique component identifier" },
        type: { type: "string", enum: ["text", "image", "vector", "shape", "table", "group"], default: "text" },
        content: { type: "string", description: "Updated content or text" },
        style: { type: "object", description: "Styling properties" },
        bounds: {
          type: "object",
          properties: {
            x: { type: "number", minimum: 0, maximum: 1 },
            y: { type: "number", minimum: 0, maximum: 1 },
            width: { type: "number", minimum: 0, maximum: 1 },
            height: { type: "number", minimum: 0, maximum: 1 }
          }
        }
      }
    }
  },
  propose_region_replacement: {
    description: "Replace a bounded visual region with a generated SVG or high-DPI asset.",
    openApiSchema: {
      type: "object",
      required: ["expectedRevisionHash", "pageNumber", "bounds", "replacementAsset"],
      properties: {
        expectedRevisionHash: { type: "string", description: "Current revision hash" },
        commentId: { type: "string", description: "Authorized comment ID" },
        pageNumber: { type: "integer", minimum: 1, description: "Target page number" },
        bounds: {
          type: "object",
          required: ["x", "y", "width", "height"],
          properties: {
            x: { type: "number", minimum: 0, maximum: 1 },
            y: { type: "number", minimum: 0, maximum: 1 },
            width: { type: "number", minimum: 0, maximum: 1 },
            height: { type: "number", minimum: 0, maximum: 1 }
          }
        },
        replacementAsset: { type: "string", description: "SVG string or image data URL" },
        assetType: { type: "string", enum: ["svg", "image", "html"], default: "svg" }
      }
    }
  },
  update_page_content: {
    description: "Update the raw HTML body or styling of a document page.",
    openApiSchema: {
      type: "object",
      required: ["expectedRevisionHash", "pageNumber", "html"],
      properties: {
        expectedRevisionHash: { type: "string", description: "Current revision hash" },
        commentId: { type: "string", description: "Authorized comment ID" },
        pageNumber: { type: "integer", minimum: 1, description: "Target page number" },
        html: { type: "string", description: "Complete HTML markup for the page" },
        css: { type: "string", description: "Optional scoped CSS" }
      }
    }
  },
  add_page: {
    description: "Append a new page or slide to the document.",
    openApiSchema: {
      type: "object",
      required: ["expectedRevisionHash"],
      properties: {
        expectedRevisionHash: { type: "string", description: "Current revision hash" },
        html: { type: "string", description: "Initial HTML body" },
        css: { type: "string", description: "Initial CSS styling" }
      }
    }
  },
  rollback_transaction: {
    description: "Revert the document back to the state preceding a transaction.",
    openApiSchema: {
      type: "object",
      properties: {
        transactionId: { type: "string", description: "Optional transaction ID to rollback" }
      }
    }
  }
};

/**
 * Direct tool execution router for REST / OpenAPI bridge
 */
async function executeToolDirectly(toolName, params, transactionManager, broadcastFn = null) {
  const successResult = (text) => ({
    content: [{ type: 'text', text: typeof text === 'string' ? text : JSON.stringify(text, null, 2) }]
  });

  const errorResult = (errorMessage, remediation = '') => ({
    content: [{
      type: 'text',
      text: remediation ? `Error: ${errorMessage}\nRemediation: ${remediation}` : `Error: ${errorMessage}`
    }],
    isError: true
  });

  switch (toolName) {
    case 'get_document_outline': {
      try {
        const doc = transactionManager.getDocument();
        const pendingCount = (doc.comments || []).filter(c => !c.resolved).length;
        const authorizedCount = (doc.comments || []).filter(c => c.authorized && !c.resolved).length;
        return successResult({
          id: doc.id,
          title: doc.title,
          revision: doc.revision,
          revisionHash: doc.revisionHash,
          dimensions: doc.dimensions,
          totalPages: doc.pages.length,
          instructionsSummary: {
            total: (doc.comments || []).length,
            pending: pendingCount,
            authorizedForExecution: authorizedCount
          },
          pages: doc.pages.map(p => ({
            pageNumber: p.pageNumber,
            id: p.id,
            componentsCount: (p.components || []).length,
            regionsCount: (p.regions || []).length,
            previewText: (p.rawHtml || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
          }))
        });
      } catch (err) {
        return errorResult(err.message, "Verify document state is accessible.");
      }
    }

    case 'get_selection_context': {
      try {
        const { pageNumber, selector, commentId } = params;
        const doc = transactionManager.getDocument();
        const page = doc.pages[(pageNumber || 1) - 1];
        if (!page) {
          return errorResult(
            `Page ${pageNumber} does not exist.`,
            `Document currently has ${doc.pages.length} pages (1 to ${doc.pages.length}). Call 'get_document_outline' to verify.`
          );
        }
        let boundComment = null;
        if (commentId) {
          boundComment = (doc.comments || []).find(c => c.id === commentId);
        }
        return successResult({
          pageNumber,
          pageId: page.id,
          rawHtml: page.rawHtml || '',
          css: page.css || '',
          components: page.components || [],
          regions: page.regions || [],
          boundInstruction: boundComment || null
        });
      } catch (err) {
        return errorResult(err.message);
      }
    }

    case 'get_pending_instructions': {
      try {
        const { authorizedOnly } = params;
        const doc = transactionManager.getDocument();
        let list = doc.comments || [];
        if (authorizedOnly) {
          list = list.filter(c => c.authorized && !c.resolved);
        }
        return successResult({
          currentRevisionHash: doc.revisionHash,
          instructionsCount: list.length,
          instructions: list.map(c => ({
            id: c.id,
            pageIndex: c.pageIndex,
            pageNumber: c.pageIndex + 1,
            userInstruction: c.userComment,
            selectedText: c.selectedText,
            selector: c.selector,
            geometry: c.geometry,
            authorized: !!c.authorized,
            status: c.status || 'pending',
            resolved: !!c.resolved
          }))
        });
      } catch (err) {
        return errorResult(err.message);
      }
    }

    case 'authorize_instruction': {
      try {
        const { commentId, authorize = true } = params;
        const doc = transactionManager.getDocument();
        const comment = (doc.comments || []).find(c => c.id === commentId);
        if (!comment) {
          return errorResult(`Instruction with ID '${commentId}' not found.`, "Call 'get_pending_instructions' to inspect valid IDs.");
        }
        comment.authorized = authorize;
        comment.status = authorize ? 'authorized' : 'pending';
        transactionManager.saveStateAtomic();

        if (broadcastFn) {
          broadcastFn({ type: 'INSTRUCTION_AUTHORIZED', commentId, authorized: authorize });
        }

        return successResult({
          success: true,
          commentId,
          userInstruction: comment.userComment,
          authorized: comment.authorized,
          status: comment.status,
          message: authorize ? "Instruction is now authorized for execution." : "Instruction authorization revoked."
        });
      } catch (err) {
        return errorResult(err.message);
      }
    }

    case 'propose_component_change': {
      try {
        const { expectedRevisionHash, commentId, pageNumber, componentId, type, content, style, bounds } = params;
        const result = transactionManager.applyTransaction({
          expectedRevisionHash,
          commentId,
          operationType: 'UPDATE_COMPONENT',
          payload: { pageIndex: pageNumber, componentId, type, content, style, bounds }
        });
        if (result.isError) {
          const remediation = result.error && result.error.includes('Revision conflict')
            ? "Call 'get_document_outline' to inspect current revision hash and refresh proposal."
            : result.error && result.error.includes('authorized')
            ? "Ensure user has authorized the instruction pin via UI."
            : "Verify component ID and bounding coordinates.";
          return errorResult(result.error, remediation);
        }
        if (broadcastFn) {
          try { broadcastFn({ type: 'DOCUMENT_UPDATED', revision: result.revision }); } catch (_) {}
        }
        return successResult({
          success: true,
          transactionId: result.transactionId,
          newRevision: result.revision,
          newRevisionHash: result.revisionHash,
          message: result.message
        });
      } catch (err) {
        return errorResult(err.message, "Inspect parameters and verify transaction manager availability.");
      }
    }

    case 'propose_region_replacement': {
      try {
        const { expectedRevisionHash, commentId, pageNumber, bounds, replacementAsset, assetType } = params;
        const result = transactionManager.applyTransaction({
          expectedRevisionHash,
          commentId,
          operationType: 'REPLACE_REGION',
          payload: { pageIndex: pageNumber, bounds, replacementAsset, assetType }
        });
        if (result.isError) {
          const remediation = result.error && result.error.includes('Revision conflict')
            ? "Call 'get_document_outline' to inspect current revision hash."
            : "Verify normalized region bounds [0..1] and ensure replacement asset is well-formed.";
          return errorResult(result.error, remediation);
        }
        if (broadcastFn) {
          try { broadcastFn({ type: 'DOCUMENT_UPDATED', revision: result.revision }); } catch (_) {}
        }
        return successResult({
          success: true,
          transactionId: result.transactionId,
          newRevision: result.revision,
          newRevisionHash: result.revisionHash,
          message: result.message
        });
      } catch (err) {
        return errorResult(err.message, "Verify SVG asset syntax and target bounds.");
      }
    }

    case 'update_page_content': {
      try {
        const { expectedRevisionHash, commentId, pageNumber, html, css } = params;
        const result = transactionManager.applyTransaction({
          expectedRevisionHash,
          commentId,
          operationType: 'UPDATE_PAGE_HTML',
          payload: { pageIndex: pageNumber, html, css }
        });
        if (result.isError) {
          const remediation = result.error && result.error.includes('Revision conflict')
            ? "Call 'get_document_outline' to inspect current revision hash."
            : "Verify page number exists in outline.";
          return errorResult(result.error, remediation);
        }
        if (broadcastFn) {
          try { broadcastFn({ type: 'DOCUMENT_UPDATED', revision: result.revision }); } catch (_) {}
        }
        return successResult({
          success: true,
          transactionId: result.transactionId,
          newRevision: result.revision,
          newRevisionHash: result.revisionHash,
          message: result.message
        });
      } catch (err) {
        return errorResult(err.message, "Verify page exists and HTML is valid.");
      }
    }

    case 'add_page': {
      try {
        const { expectedRevisionHash, html, css } = params;
        const result = transactionManager.applyTransaction({
          expectedRevisionHash,
          operationType: 'ADD_PAGE',
          payload: { html, css }
        });
        if (result.isError) return errorResult(result.error, "Check current revision hash.");
        if (broadcastFn) {
          try { broadcastFn({ type: 'DOCUMENT_UPDATED', revision: result.revision }); } catch (_) {}
        }
        return successResult({
          success: true,
          transactionId: result.transactionId,
          newRevision: result.revision,
          newRevisionHash: result.revisionHash,
          message: result.message
        });
      } catch (err) {
        return errorResult(err.message, "Verify document state is valid.");
      }
    }

    case 'rollback_transaction': {
      try {
        const { transactionId } = params;
        const result = transactionManager.rollback(transactionId);
        if (result.isError) return errorResult(result.error, "Verify transaction history contains reversible operations.");
        if (broadcastFn) {
          try { broadcastFn({ type: 'DOCUMENT_UPDATED', revision: result.revision }); } catch (_) {}
        }
        return successResult({
          success: true,
          message: result.message,
          newRevision: result.revision,
          newRevisionHash: result.revisionHash
        });
      } catch (err) {
        return errorResult(err.message, "Undo stack error.");
      }
    }

    default:
      return errorResult(`Unknown tool '${toolName}'.`);
  }
}

module.exports = {
  registerDocumentTools,
  executeToolDirectly,
  TOOL_DEFINITIONS
};

