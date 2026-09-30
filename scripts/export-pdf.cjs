const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const STATE_FILE = path.join(__dirname, '..', 'document_state.json');
const OUTPUT_PDF = path.join(__dirname, '..', 'Product_Briefing_Document.pdf');

console.log('📄 Exporting Product Briefing Document to High-Clarity Vector PDF...');

if (!fs.existsSync(STATE_FILE)) {
  console.error('❌ document_state.json not found!');
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));

// Dimensions for A4
const widthMm = 210;
const heightMm = 297;
const isLandscape = state.orientation === 'landscape';

const pagesMarkup = state.pages.map((p) => `
  <div class="print-page" style="width: ${widthMm}mm; height: ${heightMm}mm; max-height: ${heightMm}mm;">
    ${p.html}
  </div>
`).join('\n');

const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: ${widthMm}mm ${heightMm}mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: ${widthMm}mm;
      background: #ffffff;
    }
    ${state.globalStyles || ''}
    .print-page {
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      background: #ffffff;
    }
    .print-page:not(:last-child) {
      page-break-after: always;
      break-after: page;
    }
  </style>
</head>
<body>
  ${pagesMarkup}
</body>
</html>
`.trim();

// Use headless Electron to render and printToPDF
const electronBinary = require(path.join(__dirname, '..', 'node_modules', 'electron'));
const tempWorker = path.join(__dirname, `temp_worker_${Date.now()}.cjs`);

const workerCode = `
const { app, BrowserWindow } = require('electron');
const fs = require('fs');

app.whenReady().then(async () => {
  try {
    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: false
      }
    });

    const fullHtml = ${JSON.stringify(fullHtml)};
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml));

    // Wait for fonts & layout
    await win.webContents.executeJavaScript(\`
      new Promise((resolve) => {
        const checkReady = () => {
          if (document.fonts && document.fonts.status !== 'loaded') {
            document.fonts.ready.then(() => resolve(true));
          } else {
            resolve(true);
          }
        };
        if (document.readyState === 'complete') {
          checkReady();
        } else {
          window.addEventListener('load', checkReady);
        }
      });
    \`);

    await new Promise((r) => setTimeout(r, 600));

    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      landscape: ${isLandscape},
      pageSize: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    fs.writeFileSync(${JSON.stringify(OUTPUT_PDF)}, pdfBuffer);
    console.log('✅ PDF Written successfully!');
    win.close();
    app.quit();
  } catch (err) {
    console.error('Error generating PDF:', err);
    app.exit(1);
  }
});
`.trim();

fs.writeFileSync(tempWorker, workerCode, 'utf-8');

const proc = spawn(electronBinary, [tempWorker], {
  stdio: 'inherit'
});

proc.on('close', (code) => {
  try { fs.unlinkSync(tempWorker); } catch (_) {}
  if (code === 0) {
    const stats = fs.statSync(OUTPUT_PDF);
    console.log('🎉 Vector PDF generated successfully!');
    console.log('File:', OUTPUT_PDF);
    console.log('Size:', (stats.size / 1024).toFixed(1), 'KB');
  } else {
    console.error('❌ Failed to generate PDF, exit code:', code);
    process.exit(1);
  }
});
