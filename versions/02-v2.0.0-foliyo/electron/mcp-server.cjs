// IMPORTANT: Override console.log to redirect to stderr
// StdioServerTransport uses process.stdout strictly for JSON-RPC messages.
// Any extraneous stdout writes will corrupt the MCP stream.
console.log = (...args) => console.error('[MCP LOG]', ...args);

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const WS_URL = 'ws://127.0.0.1:48721';
const STATE_FILE = path.join(__dirname, '..', 'document_state.json');

// Default initial state
let localState = {
  title: 'Marketing Document',
  pageSize: 'A4',
  orientation: 'portrait',
  globalStyles: '',
  pages: [
    {
      id: 'page-1',
      html: `
<div class="h-full flex flex-col justify-between p-12 bg-white text-slate-800">
  <div>
    <div class="flex justify-between items-center border-b border-slate-200 pb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-md">
          P
        </div>
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">PRISM ENTERPRISE</h1>
          <p class="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Quarterly Strategy Overview</p>
        </div>
      </div>
      <div class="text-right">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          Q3 2026 RELEASE
        </span>
      </div>
    </div>

    <div class="mt-10">
      <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
        Next-Generation Autonomous Creative Workflow
      </h2>
      <p class="mt-4 text-slate-600 leading-relaxed text-base">
        Seamlessly blend background web rendering with precision agentic AI editing. Highlight any section, pin instructions, or double-click to modify content directly in-place.
      </p>
    </div>

    <div class="grid grid-cols-2 gap-6 mt-8">
      <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/80 shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mb-4">
          01
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Maximum Clarity Vector PDF</h3>
        <p class="text-sm text-slate-600 leading-normal">
          Direct Chromium print engine integration produces 100% scalable vector text, sharp SVGs, and high-DPI imagery without rasterization degradation.
        </p>
      </div>

      <div class="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-violet-50/40 border border-indigo-100 shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center text-sm font-bold mb-4">
          02
        </div>
        <h3 class="text-lg font-bold text-violet-950 mb-2">Targeted Element AI Edits</h3>
        <p class="text-sm text-violet-900/80 leading-normal">
          Highlight text or select any card to give direct instructions to the AI agent. The agent updates precisely that element via standard MCP tools.
        </p>
      </div>
    </div>
  </div>

  <div class="border-t border-slate-200 pt-4 flex justify-between items-center text-xs text-slate-400">
    <span>Confidential - For Internal Review Only</span>
    <span>Page 1 of 1</span>
  </div>
</div>
      `.trim(),
      css: ''
    }
  ],
  comments: []
};

// Safe JSON load
try {
  if (fs.existsSync(STATE_FILE)) {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    localState = JSON.parse(raw);
  }
} catch (e) {
  console.error('[State Load Error]', e.message);
}

function saveStateToFile() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(localState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[State Save Error]', err.message);
  }
}

// WebSocket bridge management
let ws = null;
let pendingRequests = new Map();
let requestIdCounter = 1;

function connectToApp() {
  try {
    ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      console.error('[WS Connected to App Window]');
      ws.send(JSON.stringify({ type: 'SYNC_STATE_TO_APP', state: localState }));
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'APP_STATE_UPDATE') {
          localState = msg.state;
          saveStateToFile();
        } else if (msg.requestId && pendingRequests.has(msg.requestId)) {
          const { resolve } = pendingRequests.get(msg.requestId);
          pendingRequests.delete(msg.requestId);
          resolve(msg.response);
        }
      } catch (err) {
        console.error('[WS Parse Error]', err.message);
      }
    });

    ws.on('close', () => {
      ws = null;
      setTimeout(connectToApp, 2500);
    });

    ws.on('error', () => {
      ws = null;
    });
  } catch (err) {
    ws = null;
    setTimeout(connectToApp, 2500);
  }
}

connectToApp();

function sendAppRequest(action, payload) {
  return new Promise((resolve) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      const fallback = handleLocalAction(action, payload);
      return resolve(fallback);
    }

    const reqId = `req_${requestIdCounter++}_${Date.now()}`;
    const timeout = setTimeout(() => {
      if (pendingRequests.has(reqId)) {
        pendingRequests.delete(reqId);
        const fallback = handleLocalAction(action, payload);
        resolve(fallback);
      }
    }, 3500);

    pendingRequests.set(reqId, {
      resolve: (data) => {
        clearTimeout(timeout);
        resolve(data);
      }
    });

    try {
      ws.send(JSON.stringify({
        requestId: reqId,
        action,
        payload
      }));
    } catch (err) {
      clearTimeout(timeout);
      pendingRequests.delete(reqId);
      const fallback = handleLocalAction(action, payload);
      resolve(fallback);
    }
  });
}

function handleLocalAction(action, payload) {
  switch (action) {
    case 'get_document_state':
      return {
        title: localState.title,
        pageSize: localState.pageSize,
        orientation: localState.orientation,
        totalPages: localState.pages.length,
        currentUser: localState.currentUser || null,
        ownerEmail: localState.ownerEmail || null,
        ownerName: localState.ownerName || null,
        pendingCommentsCount: (localState.comments || []).filter(c => !c.resolved).length,
        pages: localState.pages.map((p, idx) => ({
          pageNumber: idx + 1,
          id: p.id,
          htmlSummary: (p.html || '').slice(0, 150)
        }))
      };

    case 'get_pending_comments':
      return (localState.comments || []).filter(c => !c.resolved);

    case 'resolve_comment':
      if (localState.comments) {
        const comment = localState.comments.find(c => c.id === payload.commentId);
        if (comment) {
          comment.resolved = true;
          saveStateToFile();
          return { success: true, message: `Comment ${payload.commentId} resolved.` };
        }
      }
      return { success: false, error: 'Comment not found' };

    case 'add_comment': {
      if (!localState.comments) localState.comments = [];
      const newC = {
        id: payload.id || `c_${Date.now()}`,
        pageIndex: payload.pageIndex !== undefined ? payload.pageIndex : 0,
        selector: payload.selector || '#page-content',
        selectedText: payload.selectedText || '',
        userComment: payload.userComment || payload.comment || 'AI instruction',
        x: payload.x || 80,
        y: payload.y || 120,
        resolved: false,
        createdAt: new Date().toISOString()
      };
      localState.comments.push(newC);
      saveStateToFile();
      return { success: true, comment: newC };
    }

    case 'get_page_content': {
      const pageIndex = (payload.pageIndex || 1) - 1;
      const page = localState.pages[pageIndex];
      if (!page) return { error: `Page ${payload.pageIndex} does not exist.` };
      return {
        pageNumber: payload.pageIndex,
        html: page.html,
        css: page.css || ''
      };
    }

    case 'set_page_content': {
      const pageIndex = (payload.pageIndex || 1) - 1;
      if (!localState.pages[pageIndex]) {
        return { error: `Page ${payload.pageIndex} does not exist.` };
      }
      if (payload.html !== undefined) localState.pages[pageIndex].html = payload.html;
      if (payload.css !== undefined) localState.pages[pageIndex].css = payload.css;
      saveStateToFile();
      return { success: true, pageNumber: payload.pageIndex };
    }

    case 'add_page': {
      const newPage = {
        id: `page-${Date.now()}`,
        html: payload.html || '<div class="p-12 text-slate-800">New Page</div>',
        css: payload.css || ''
      };
      localState.pages.push(newPage);
      saveStateToFile();
      return { success: true, pageNumber: localState.pages.length, totalPages: localState.pages.length };
    }

    case 'delete_page': {
      const pageIndex = (payload.pageIndex || 1) - 1;
      if (localState.pages.length <= 1) {
        return { error: 'Cannot delete the only page in the document.' };
      }
      if (!localState.pages[pageIndex]) {
        return { error: `Page ${payload.pageIndex} does not exist.` };
      }
      localState.pages.splice(pageIndex, 1);
      saveStateToFile();
      return { success: true, totalPages: localState.pages.length };
    }

    case 'set_document_settings': {
      if (payload.title) localState.title = payload.title;
      if (payload.pageSize) localState.pageSize = payload.pageSize;
      if (payload.orientation) localState.orientation = payload.orientation;
      saveStateToFile();
      return { success: true, state: localState };
    }

    case 'set_global_styles': {
      localState.globalStyles = payload.css || '';
      saveStateToFile();
      return { success: true };
    }

    case 'create_project': {
      localState.title = payload.title || 'Untitled Project';
      localState.pageSize = payload.pageSize || 'A4';
      localState.customWidthMm = payload.customWidthMm || null;
      localState.customHeightMm = payload.customHeightMm || null;
      const isWidescreen = localState.pageSize === '16:9' || localState.pageSize === '4:3';
      localState.orientation = payload.orientation || (isWidescreen ? 'landscape' : 'portrait');
      localState.pages = [
        {
          id: `page-${Date.now()}`,
          html: payload.initialHtml || (isWidescreen ? `
<div class="h-full flex flex-col justify-between p-16 bg-[#2b352d] text-[#f4eee5]">
  <div>
    <p class="text-xs uppercase tracking-widest text-[#8e511b] font-semibold">Presentation Slide 01</p>
    <h1 class="text-5xl font-serif mt-4 text-[#d3c6b5] leading-tight">${payload.title}</h1>
    <p class="text-lg text-[#b6a48c] mt-4 font-light">Custom Presentation Designed with Web Standards & AI Precision</p>
  </div>
  <div class="border-t border-[#b6a48c]/30 pt-4 flex justify-between text-xs text-[#b6a48c]">
    <span>16:9 Widescreen PPTX</span>
    <span>Slide 1</span>
  </div>
</div>
          `.trim() : `
<div class="h-full flex flex-col justify-between p-14 bg-[#fbf9f5] text-[#2b352d]">
  <div>
    <h1 class="text-4xl font-serif text-[#2b352d]">${payload.title}</h1>
    <p class="mt-4 text-[#423b28] leading-relaxed">Document generated via AI Agent under custom size.</p>
  </div>
  <div class="border-t border-[#b6a48c]/30 pt-4 flex justify-between text-xs text-[#8a6b4c]">
    <span>${payload.title}</span>
    <span>Page 01</span>
  </div>
</div>
          `.trim()),
          css: ''
        }
      ];
      localState.comments = [];
      saveStateToFile();
      return { success: true, project: localState };
    }

    case 'list_projects':
      return [
        {
          id: 'default',
          title: localState.title,
          pageSize: localState.pageSize,
          orientation: localState.orientation,
          totalPages: localState.pages.length
        }
      ];

    case 'get_current_user':
      return localState.currentUser || {
        signedIn: false,
        message: 'No Google account currently signed in. Guest mode active.'
      };

    case 'set_current_user': {
      const email = payload.email || 'user@gmail.com';
      const name = payload.name || 'Google User';
      const id = payload.id || `google_${Buffer.from(email).toString('hex').slice(0, 16)}`;
      const avatar = payload.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`;

      localState.currentUser = {
        id,
        email,
        name,
        avatar,
        signedIn: true,
        authenticatedAt: new Date().toISOString()
      };
      localState.ownerId = id;
      localState.ownerEmail = email;
      localState.ownerName = name;
      saveStateToFile();
      return { success: true, user: localState.currentUser };
    }

    default:
      return { success: true, action };
  }
}

// Server Initialization
const server = new Server(
  {
    name: 'foliyo-studio',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Register Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_document_state',
        description: 'Get document metadata: title, paper size, orientation, page count, and pending AI comments.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'get_pending_comments',
        description: 'Get all active user highlights and comments asking for AI modifications on specific elements, including CSS selector, selected text, surrounding HTML, and user prompt.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'update_element',
        description: 'Surgically update or replace a specific HTML element or apply new styles on a page, identified by its CSS selector. Ideal for addressing user highlight comments with high precision without re-rendering the whole page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageNumber: {
              type: 'integer',
              description: '1-based index of the target page (e.g. 1 for first page).'
            },
            selector: {
              type: 'string',
              description: 'CSS selector of the element to modify (e.g. "#pricing-card h2", ".banner-title", "header > div:first-child").'
            },
            newHtml: {
              type: 'string',
              description: 'The updated HTML content or replacement for this element.'
            },
            newClasses: {
              type: 'string',
              description: 'Optional Tailwind CSS or standard classes to set on the element.'
            },
            newStyles: {
              type: 'string',
              description: 'Optional inline CSS styles string (e.g. "color: #4f46e5; font-size: 24px;").'
            },
            commentIdToResolve: {
              type: 'string',
              description: 'Optional ID of the comment this edit fulfills, which will automatically resolve the comment badge.'
            }
          },
          required: ['pageNumber', 'selector']
        }
      },
      {
        name: 'resolve_comment',
        description: 'Mark a user highlight comment as completed/resolved and dismiss its visual badge.',
        inputSchema: {
          type: 'object',
          properties: {
            commentId: {
              type: 'string',
              description: 'ID of the comment to resolve.'
            }
          },
          required: ['commentId']
        }
      },
      {
        name: 'add_comment',
        description: 'Add a new visual precision comment pin on an element or page with an instruction prompt.',
        inputSchema: {
          type: 'object',
          properties: {
            pageIndex: {
              type: 'integer',
              description: '0-based index of the target page.'
            },
            selector: {
              type: 'string',
              description: 'CSS selector of the element to anchor the comment pin.'
            },
            selectedText: {
              type: 'string',
              description: 'Optional selected text snippet.'
            },
            comment: {
              type: 'string',
              description: 'The instruction prompt or revision request for this element.'
            },
            x: {
              type: 'number',
              description: 'Optional visual X coordinate (percentage or px).'
            },
            y: {
              type: 'number',
              description: 'Optional visual Y coordinate (percentage or px).'
            }
          },
          required: ['comment']
        }
      },
      {
        name: 'get_page_content',
        description: 'Retrieve the complete HTML and custom CSS of a specific page for full inspection.',
        inputSchema: {
          type: 'object',
          properties: {
            pageNumber: {
              type: 'integer',
              description: '1-based page index (e.g. 1 for first page).'
            }
          },
          required: ['pageNumber']
        }
      },
      {
        name: 'set_page_content',
        description: 'Replace the full HTML design and custom CSS of a page. You can use full HTML5, modern Tailwind CSS classes, inline SVG, and CSS styling without restrictions.',
        inputSchema: {
          type: 'object',
          properties: {
            pageNumber: {
              type: 'integer',
              description: '1-based page index (e.g. 1).'
            },
            html: {
              type: 'string',
              description: 'Complete HTML structure for this page. Can use Tailwind utility classes.'
            },
            css: {
              type: 'string',
              description: 'Optional custom CSS for this page.'
            }
          },
          required: ['pageNumber', 'html']
        }
      },
      {
        name: 'add_page',
        description: 'Add a new blank or custom designed page to the document.',
        inputSchema: {
          type: 'object',
          properties: {
            html: {
              type: 'string',
              description: 'HTML content of the new page.'
            },
            css: {
              type: 'string',
              description: 'Optional custom CSS for this page.'
            }
          }
        }
      },
      {
        name: 'delete_page',
        description: 'Delete a page by its 1-based page number.',
        inputSchema: {
          type: 'object',
          properties: {
            pageNumber: {
              type: 'integer',
              description: '1-based page index to delete.'
            }
          },
          required: ['pageNumber']
        }
      },
      {
        name: 'set_document_settings',
        description: 'Configure document title, paper size, and orientation.',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the document.'
            },
            pageSize: {
              type: 'string',
              description: 'Standard paper format or 16:9 / 4:3 slide format.'
            },
            orientation: {
              type: 'string',
              enum: ['portrait', 'landscape'],
              description: 'Orientation.'
            }
          }
        }
      },
      {
        name: 'set_global_styles',
        description: 'Set global CSS styling applied across all pages (e.g., font family imports, theme colors, CSS variables).',
        inputSchema: {
          type: 'object',
          properties: {
            css: {
              type: 'string',
              description: 'Global CSS rules.'
            }
          },
          required: ['css']
        }
      },
      {
        name: 'create_project',
        description: 'Create a new project under ANY custom or standard size (A4, A3, 16:9 Widescreen slides, 4:3, or custom mm/inch dimensions).',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the new project (e.g. "Q4 Investor Pitch Deck" or "Botanical Magazine").'
            },
            pageSize: {
              type: 'string',
              enum: ['A4', 'A3', 'A5', 'Letter', 'Legal', 'Tabloid', '16:9', '4:3', 'custom'],
              description: 'Page or slide format. Use "16:9" for modern presentations, or "custom" for arbitrary dimensions.'
            },
            customWidthMm: {
              type: 'number',
              description: 'Optional custom width in millimeters (used when pageSize is "custom" or for exact arbitrary dimensions).'
            },
            customHeightMm: {
              type: 'number',
              description: 'Optional custom height in millimeters.'
            },
            orientation: {
              type: 'string',
              enum: ['portrait', 'landscape'],
              description: 'Orientation (defaults to landscape for 16:9 / 4:3, portrait for A4).'
            },
            initialHtml: {
              type: 'string',
              description: 'Optional initial HTML content for the first page/slide.'
            }
          },
          required: ['title']
        }
      },
      {
        name: 'list_projects',
        description: 'List all existing projects in the workspace.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'switch_project',
        description: 'Switch the active workspace project by its project ID.',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'The unique ID of the project to open.'
            }
          },
          required: ['projectId']
        }
      },
      {
        name: 'export_pptx',
        description: 'Export the current project as a high-clarity PowerPoint (.pptx) presentation file.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Optional output destination path for the .pptx file.'
            }
          }
        }
      },
      {
        name: 'get_current_user',
        description: 'Get details of the currently authenticated Google user and account-scoped data statistics.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'set_current_user',
        description: 'Authenticate or set the active Google user credential for the document workspace.',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Google Account email address' },
            name: { type: 'string', description: 'Google Account display name' },
            avatar: { type: 'string', description: 'Optional avatar URL' },
            id: { type: 'string', description: 'Optional unique Google ID' }
          },
          required: ['email', 'name']
        }
      }
    ]
  };
});

// Tool Call Router
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'get_document_state':
        result = await sendAppRequest('get_document_state', {});
        break;

      case 'get_pending_comments':
        result = await sendAppRequest('get_pending_comments', {});
        break;

      case 'update_element':
        result = await sendAppRequest('update_element', {
          pageIndex: args.pageNumber,
          selector: args.selector,
          newHtml: args.newHtml,
          newClasses: args.newClasses,
          newStyles: args.newStyles,
          commentIdToResolve: args.commentIdToResolve
        });
        break;

      case 'resolve_comment':
        result = await sendAppRequest('resolve_comment', {
          commentId: args.commentId
        });
        break;

      case 'add_comment':
        result = await sendAppRequest('add_comment', {
          pageIndex: args.pageIndex,
          selector: args.selector,
          selectedText: args.selectedText,
          userComment: args.comment,
          x: args.x,
          y: args.y
        });
        break;

      case 'get_page_content':
        result = await sendAppRequest('get_page_content', {
          pageIndex: args.pageNumber
        });
        break;

      case 'set_page_content':
        result = await sendAppRequest('set_page_content', {
          pageIndex: args.pageNumber,
          html: args.html,
          css: args.css
        });
        break;

      case 'add_page':
        result = await sendAppRequest('add_page', {
          html: args.html,
          css: args.css
        });
        break;

      case 'delete_page':
        result = await sendAppRequest('delete_page', {
          pageIndex: args.pageNumber
        });
        break;

      case 'set_document_settings':
        result = await sendAppRequest('set_document_settings', {
          title: args.title,
          pageSize: args.pageSize,
          orientation: args.orientation
        });
        break;

      case 'set_global_styles':
        result = await sendAppRequest('set_global_styles', {
          css: args.css
        });
        break;

      case 'create_project':
        result = await sendAppRequest('create_project', {
          title: args.title,
          pageSize: args.pageSize || 'A4',
          customWidthMm: args.customWidthMm,
          customHeightMm: args.customHeightMm,
          orientation: args.orientation || (args.pageSize === '16:9' || args.pageSize === '4:3' ? 'landscape' : 'portrait'),
          initialHtml: args.initialHtml
        });
        break;

      case 'list_projects':
        result = await sendAppRequest('list_projects', {});
        break;

      case 'switch_project':
        result = await sendAppRequest('switch_project', {
          projectId: args.projectId
        });
        break;

      case 'export_pptx':
        result = await sendAppRequest('export_pptx', {
          filePath: args.filePath
        });
        break;

      case 'get_current_user':
        result = await sendAppRequest('get_current_user', {});
        break;

      case 'set_current_user':
        result = await sendAppRequest('set_current_user', {
          email: args.email,
          name: args.name,
          avatar: args.avatar,
          id: args.id
        });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${err.message}`
        }
      ]
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((err) => {
  console.error('[Fatal MCP Server Error]', err);
  process.exit(1);
});
