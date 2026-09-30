const fs = require('fs');
const path = require('path');

const updateScriptPath = path.join(__dirname, 'update-sovereign-man-simple.cjs');
const mainJsPath = path.join(__dirname, '..', 'src', 'main.js');

const updateScript = fs.readFileSync(updateScriptPath, 'utf-8');
let mainContent = fs.readFileSync(mainJsPath, 'utf-8');

const match1 = updateScript.match(/const page1SimpleHtml = `([\s\S]*?)`\.trim\(\);/);
const match2 = updateScript.match(/const page2SimpleHtml = `([\s\S]*?)`\.trim\(\);/);
const match3 = updateScript.match(/const page3SimpleHtml = `([\s\S]*?)`\.trim\(\);/);

if (!match1 || !match2 || !match3) {
  console.error('Could not extract simple htmls');
  process.exit(1);
}

mainContent = mainContent.replace(
  /const SOVEREIGN_PAGE_1 = `[\s\S]*?`\.trim\(\);/,
  `const SOVEREIGN_PAGE_1 = \`\n${match1[1]}\n\`.trim();`
);

mainContent = mainContent.replace(
  /const SOVEREIGN_PAGE_2 = `[\s\S]*?`\.trim\(\);/,
  `const SOVEREIGN_PAGE_2 = \`\n${match2[1]}\n\`.trim();`
);

mainContent = mainContent.replace(
  /const SOVEREIGN_PAGE_3 = `[\s\S]*?`\.trim\(\);/,
  `const SOVEREIGN_PAGE_3 = \`\n${match3[1]}\n\`.trim();`
);

fs.writeFileSync(mainJsPath, mainContent, 'utf-8');
console.log('✅ src/main.js successfully synchronized with simplified gap-free pages!');
