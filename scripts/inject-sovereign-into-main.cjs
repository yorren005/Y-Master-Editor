const fs = require('fs');
const path = require('path');

const manualScriptPath = path.join(__dirname, 'create-powerful-man-manual.cjs');
const mainJsPath = path.join(__dirname, '..', 'src', 'main.js');

const manualContent = fs.readFileSync(manualScriptPath, 'utf-8');
const mainContent = fs.readFileSync(mainJsPath, 'utf-8');

// Extract page1Html, page2Html, page3Html from manualContent
const match1 = manualContent.match(/const page1Html = `([\s\S]*?)`\.trim\(\);/);
const match2 = manualContent.match(/const page2Html = `([\s\S]*?)`\.trim\(\);/);
const match3 = manualContent.match(/const page3Html = `([\s\S]*?)`\.trim\(\);/);

if (!match1 || !match2 || !match3) {
  console.error('Could not extract page htmls');
  process.exit(1);
}

const page1 = match1[1];
const page2 = match2[1];
const page3 = match3[1];

let updated = mainContent;

// 1. Add constant declarations if not already there
if (!updated.includes('const SOVEREIGN_PAGE_1 = `')) {
  const insertMarker = '// Local Storage Keys';
  const newConstants = `
const SOVEREIGN_PAGE_1 = \`
${page1}
\`.trim();

const SOVEREIGN_PAGE_2 = \`
${page2}
\`.trim();

const SOVEREIGN_PAGE_3 = \`
${page3}
\`.trim();

`;
  updated = updated.replace(insertMarker, newConstants + insertMarker);
}

// 2. Add to loadProjects if not already there
if (!updated.includes('hasSovereignMan')) {
  const marker = 'const activeId = localStorage.getItem(STORAGE_ACTIVE_KEY);';
  const newRegistration = `
  const hasSovereignMan = projects.some(p => p.title.includes('The Sovereign Man'));
  if (!hasSovereignMan) {
    const sovereignManProject = {
      id: 'proj_sovereign_man',
      title: 'The Sovereign Man: Principles of Command',
      pageSize: 'A4',
      orientation: 'portrait',
      customWidthMm: null,
      customHeightMm: null,
      zoom: 0.88,
      mode: 'preview',
      globalStyles: DEFAULT_GLOBAL_STYLES,
      pages: [
        { id: 'page-sov-1', html: SOVEREIGN_PAGE_1, css: '' },
        { id: 'page-sov-2', html: SOVEREIGN_PAGE_2, css: '' },
        { id: 'page-sov-3', html: SOVEREIGN_PAGE_3, css: '' }
      ],
      comments: [
        {
          id: 'c_sov_1',
          pageIndex: 0,
          selector: 'Figure 1.1',
          selectedText: 'Figure 1.1 The Sovereign Coordinate Matrix',
          elementHtml: '<span>Figure 1.1</span>',
          userComment: 'Highlight Quadrant I with a bold Autumn Rust accent outline',
          x: 48,
          y: 36,
          resolved: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'c_sov_2',
          pageIndex: 1,
          selector: '04. VOCAL GRAVITY',
          selectedText: 'Vocal Gravity',
          elementHtml: '<span>VOCAL GRAVITY</span>',
          userComment: 'Add footnote detailing diaphragmatic breathing cadence (4s in, 6s out) for vocal resonance',
          x: 75,
          y: 42,
          resolved: false,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    projects.push(sovereignManProject);
    saveProjects();
  }

  `;
  updated = updated.replace(marker, newRegistration + marker);
}

fs.writeFileSync(mainJsPath, updated, 'utf-8');
console.log('Successfully injected The Sovereign Man manual into src/main.js');
