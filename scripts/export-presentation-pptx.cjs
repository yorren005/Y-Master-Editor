/**
 * scripts/export-presentation-pptx.cjs
 * Exports a project JSON to a PowerPoint (.pptx) presentation
 */

const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

async function exportPptx() {
  const projectFile = path.join(__dirname, '..', 'data', 'projects', 'project_executive_ai_2026.json');
  const outputFile = path.join(__dirname, '..', 'Executive_AI_Strategy_2026.pptx');

  if (!fs.existsSync(projectFile)) {
    console.error('Project file not found:', projectFile);
    process.exit(1);
  }

  const project = JSON.parse(fs.readFileSync(projectFile, 'utf-8'));
  console.log(`Exporting "${project.title}" (${project.pages.length} slides) to PowerPoint...`);

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  // Add slides with native PptxGenJS vector elements and text
  for (let i = 0; i < project.pages.length; i++) {
    const page = project.pages[i];
    const slide = pptx.addSlide();

    // Slide Background
    slide.background = { color: 'FAF7F2' };

    // Slide Header
    slide.addText('Executive Strategy & Precision Vector Architecture', {
      x: 0.8,
      y: 0.5,
      w: 8.5,
      h: 0.4,
      fontSize: 10,
      color: '786755',
      bold: true,
      fontFace: 'Arial'
    });

    slide.addText(`SLIDE 0${i + 1} / 0${project.pages.length}`, {
      x: 10.0,
      y: 0.5,
      w: 2.5,
      h: 0.4,
      fontSize: 10,
      color: 'A85620',
      bold: true,
      align: 'right',
      fontFace: 'Arial'
    });

    if (i === 0) {
      // Cover Slide
      slide.addText('UNIVERSAL MODEL CONTEXT PROTOCOL', {
        x: 0.8,
        y: 2.0,
        w: 10.0,
        h: 0.5,
        fontSize: 14,
        color: 'A85620',
        bold: true,
        fontFace: 'Arial'
      });

      slide.addText('Universal MCP & Precision Vector Synthesis', {
        x: 0.8,
        y: 2.6,
        w: 11.5,
        h: 1.5,
        fontSize: 36,
        color: '241C15',
        bold: true,
        fontFace: 'Georgia'
      });

      slide.addText('A Multi-Tenant, Zero-Lag Execution Architecture Connecting Real-Time Vector Graphics with Global LLM Intelligence.', {
        x: 0.8,
        y: 4.3,
        w: 11.0,
        h: 1.0,
        fontSize: 16,
        color: '786755',
        italic: true,
        fontFace: 'Georgia'
      });
    } else if (i === 1) {
      // Benchmarks Slide
      slide.addText('ARCHITECTURAL BENCHMARKS & METRICS', {
        x: 0.8,
        y: 1.5,
        w: 10.0,
        h: 0.5,
        fontSize: 14,
        color: 'A85620',
        bold: true,
        fontFace: 'Arial'
      });

      // 3 KPI Cards
      const cards = [
        { label: 'THROUGHPUT', stat: '1,240 tx/s', desc: 'Deterministic SHA-256 state hashing with sub-millisecond atomic memory commit.' },
        { label: 'CONCURRENCY', stat: '100% Isolated', desc: 'Multi-session Streamable HTTP routing eliminates session collision risks.' },
        { label: 'VECTOR FIDELITY', stat: '±0.00 pt', desc: 'Zero rasterization loss across normalized 72 DPI PDF point transforms.' }
      ];

      cards.forEach((c, idx) => {
        const xPos = 0.8 + (idx * 3.9);
        slide.addShape(pptx.ShapeType.roundRect, {
          x: xPos, y: 2.3, w: 3.6, h: 3.8,
          fill: { color: 'FFFFFF' },
          line: { color: 'DCD3C5', width: 1 },
          rectRadius: 0.1
        });

        slide.addText(c.label, {
          x: xPos + 0.3, y: 2.6, w: 3.0, h: 0.3,
          fontSize: 10, color: 'A85620', bold: true, fontFace: 'Arial'
        });

        slide.addText(c.stat, {
          x: xPos + 0.3, y: 3.0, w: 3.0, h: 0.8,
          fontSize: 26, color: '241C15', bold: true, fontFace: 'Georgia'
        });

        slide.addText(c.desc, {
          x: xPos + 0.3, y: 4.0, w: 3.0, h: 1.5,
          fontSize: 12, color: '786755', fontFace: 'Arial'
        });
      });
    } else {
      // Roadmap Slide
      slide.addText('EXECUTION HORIZONS & ROADMAP', {
        x: 0.8,
        y: 1.5,
        w: 10.0,
        h: 0.5,
        fontSize: 14,
        color: 'A85620',
        bold: true,
        fontFace: 'Arial'
      });

      // 2 Horizon Cards
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 2.3, w: 5.6, h: 3.8,
        fill: { color: 'FFFFFF' },
        line: { color: 'DCD3C5', width: 1 },
        rectRadius: 0.1
      });
      slide.addText('HORIZON 1: MULTI-AGENT AUTONOMY', {
        x: 1.1, y: 2.6, w: 5.0, h: 0.3,
        fontSize: 10, color: 'A85620', bold: true, fontFace: 'Arial'
      });
      slide.addText('Cross-IDE Synchronized Tool Calling', {
        x: 1.1, y: 3.1, w: 5.0, h: 0.6,
        fontSize: 20, color: '241C15', bold: true, fontFace: 'Georgia'
      });
      slide.addText('Connecting Claude Code, Cursor Cascade, Windsurf, and ChatGPT to a single unified live canvas state with real-time optimistic locking.', {
        x: 1.1, y: 3.8, w: 5.0, h: 1.8,
        fontSize: 13, color: '786755', fontFace: 'Arial'
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.8, y: 2.3, w: 5.6, h: 3.8,
        fill: { color: 'EDE7DF' },
        line: { color: 'DCD3C5', width: 1 },
        rectRadius: 0.1
      });
      slide.addText('HORIZON 2: GLOBAL CLOUD SCALE', {
        x: 7.1, y: 2.6, w: 5.0, h: 0.3,
        fontSize: 10, color: '786755', bold: true, fontFace: 'Arial'
      });
      slide.addText('Distributed Vector Streaming', {
        x: 7.1, y: 3.1, w: 5.0, h: 0.6,
        fontSize: 20, color: '241C15', bold: true, fontFace: 'Georgia'
      });
      slide.addText('Collaborative real-time CRDT vector canvas updates broadcasted to thousands of viewers with instant sub-millisecond PDF/PPTX compilation.', {
        x: 7.1, y: 3.8, w: 5.0, h: 1.8,
        fontSize: 13, color: '786755', fontFace: 'Arial'
      });
    }

    // Slide Footer
    slide.addText('Y Master Editor Studio &bull; Precision Vector Synthesis', {
      x: 0.8,
      y: 6.8,
      w: 8.5,
      h: 0.3,
      fontSize: 9,
      color: '786755',
      fontFace: 'Arial'
    });
  }

  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  fs.writeFileSync(outputFile, buffer);
  console.log(`✓ Presentation successfully saved to: ${outputFile} (${buffer.length} bytes)`);
}

exportPptx().catch(err => {
  console.error('[Export PPTX Failed]:', err);
  process.exit(1);
});
