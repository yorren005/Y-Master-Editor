# Y Master Editor

**Y Master Editor** is an Electron-based Vector PDF & Presentation Studio with bidirectional **MCP (Model Context Protocol)** AI agent integration, a **Light Earth Tone** editorial interface, a minimalist **Y** monogram identity, and **Firebase Authentication (Google Sign-In) + Cloud Firestore** user-isolated workspace persistence.

---

## Chronological Version Progression (Oldest $\rightarrow$ Newest)

The repository tracks the full evolution of the application across chronological version directories under [`versions/`](./versions) as well as tagged Git commits:

```text
├── versions/
│   ├── 01-v1.0.0-pdf-studio/        # [Oldest] v1.0.0 — Original PDF Studio (Dark Moss UI, Vector PDF/PPTX, MCP Bridge)
│   ├── 02-v2.0.0-foliyo/            # [Middle] v2.0.0 — Foliyo Editorial Redesign, Product Briefing Doc & In-App Updater
│   └── 03-v3.0.0-y-master-editor/   # [Newest] v3.0.0 — Y Master Editor, Minimalist Y Logo, Light Earth Tone UI & Firebase/Firestore
├── electron/                        # Active Latest Main Process, Preload, MCP Server & Firebase Service
│   ├── main.cjs
│   ├── preload.cjs
│   ├── firebase-service.cjs
│   └── mcp-server.cjs
├── src/                             # Active Latest Renderer UI, Light Earth Tone CSS & Firebase Client
│   ├── assets/
│   │   ├── y-logo.svg               # Minimalist vector 'Y' logo
│   │   └── y-logo.jpg               # Minimalist raster 'Y' logo
│   ├── services/
│   │   └── firebase.js              # Renderer Firebase Auth & Firestore bridge
│   ├── styles/
│   │   └── app.css                  # Light Earth Tone stylesheet
│   ├── index.html
│   └── main.js
├── firestore.rules                  # Cloud Firestore Security Rules (strict per-UID isolation)
├── firebase-config.json             # Firebase Project Configuration
└── package.json
```

### Version Milestones

1. **[`versions/01-v1.0.0-pdf-studio`](./versions/01-v1.0.0-pdf-studio)** *(Oldest)*
   - Initial desktop release as **PDF Studio**.
   - Chromium offscreen vector PDF compiler (`printToPDF`) and widescreen 16:9 `.pptx` presentation exporter.
   - Sub-pixel AI comment pins and live WebSocket MCP bridge (`ws://127.0.0.1:48721`).

2. **[`versions/02-v2.0.0-foliyo`](./versions/02-v2.0.0-foliyo)** *(Middle)*
   - Rebranded to **Foliyo** with editorial typography (`Cormorant Garamond` + `Plus Jakarta Sans`).
   - Built-in 3-page executive *Product Briefing & Specification* document.
   - Added in-app Software Update system (`v1.0.0` $\rightarrow$ `v2.0.0`) and Google account workspace UI.

3. **[`versions/03-v3.0.0-y-master-editor`](./versions/03-v3.0.0-y-master-editor)** *(Newest / Active Root)*
   - Renamed to **Y Master Editor** with a minimalist **Y** monogram logo symbolizing the convergence of **AI Agent + Human Editor** and **PDF + PPTX**.
   - Refined **Light Earth Tone** palette (`#faf7f2` Soft Linen, `#ede7df` Sandstone Oat, `#a85620` Warm Terracotta, `#241c15` Espresso).
   - Integrated **Firebase Authentication (Google Sign-In)** and **Cloud Firestore** per-UID storage (`users/{uid}`) protected by [`firestore.rules`](./firestore.rules).

---

## Quick Start

```bash
npm install
npm start
```
