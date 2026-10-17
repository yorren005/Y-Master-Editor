/**
 * pdf-adapter.cjs
 * Non-destructive PDF inpainting, stamping, and region replacement engine
 * Powered by pdf-lib
 * Coordinates: Normalized [0..1] Page Space converted to PDF Point Space (72 DPI, bottom-left origin)
 */

const { PDFDocument, rgb } = require('pdf-lib');

class PdfAdapter {
  /**
   * Load and inspect a PDF's structure
   * @param {Uint8Array|Buffer} pdfBytes 
   */
  static async inspectPdf(pdfBytes) {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();
    const pages = [];

    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      pages.push({
        pageNumber: i + 1,
        pageIndex: i,
        widthPt: width,
        heightPt: height,
        rotation: page.getRotation().angle
      });
    }

    return {
      pageCount,
      pages
    };
  }

  /**
   * Convert normalized [0..1] coordinates (top-left origin) to PDF point coordinates (bottom-left origin)
   * @param {Object} bounds { x, y, width, height } in [0..1]
   * @param {number} pageWidthPt Page width in points (72pt/inch)
   * @param {number} pageHeightPt Page height in points
   */
  static normalizeToPdfPoints(bounds, pageWidthPt, pageHeightPt) {
    if (!bounds || typeof bounds !== 'object') {
      bounds = { x: 0, y: 0, width: 0, height: 0 };
    }
    const normX = Math.max(0, Math.min(1, Number(bounds.x) || 0));
    const normY = Math.max(0, Math.min(1, Number(bounds.y) || 0));
    const normW = Math.max(0, Math.min(1 - normX, Number(bounds.width) || 0));
    const normH = Math.max(0, Math.min(1 - normY, Number(bounds.height) || 0));

    const ptX = normX * pageWidthPt;
    const ptW = normW * pageWidthPt;
    const ptH = normH * pageHeightPt;
    // PDF origin (0, 0) is at BOTTOM-LEFT; web normalized (0, 0) is TOP-LEFT
    const ptY = (1 - normY - normH) * pageHeightPt;

    return {
      x: ptX,
      y: ptY,
      width: ptW,
      height: ptH
    };
  }

  /**
   * Inpaint / Replace a bounded rectangular region on a target page with an image
   * All other pages and all content outside the bounded region remain strictly untouched.
   * @param {Uint8Array|Buffer} pdfBytes 
   * @param {number} pageIndex 0-indexed page number
   * @param {Object} bounds Normalized { x, y, width, height } in [0..1]
   * @param {Uint8Array|Buffer} imageBytes PNG or JPEG image bytes
   * @param {string} [format='png'] 'png' | 'jpg' | 'jpeg'
   * @returns {Promise<Uint8Array>} Modified PDF bytes
   */
  static async replacePageRegion(pdfBytes, pageIndex, bounds, imageBytes, format = 'png') {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();

    if (pageIndex < 0 || pageIndex >= pageCount) {
      throw new Error(`Page index ${pageIndex} is out of bounds (document has ${pageCount} pages).`);
    }

    const page = pdfDoc.getPage(pageIndex);
    const { width: pWidth, height: pHeight } = page.getSize();
    const pdfBox = this.normalizeToPdfPoints(bounds, pWidth, pHeight);

    // 1. White out the bounded target region (masking / inpainting)
    page.drawRectangle({
      x: pdfBox.x,
      y: pdfBox.y,
      width: pdfBox.width,
      height: pdfBox.height,
      color: rgb(1, 1, 1), // Crisp white background mask
      borderWidth: 0
    });

    // 2. Embed replacement asset
    let embeddedImg;
    const fmt = (format || 'png').toLowerCase();
    if (fmt === 'png') {
      embeddedImg = await pdfDoc.embedPng(imageBytes);
    } else {
      embeddedImg = await pdfDoc.embedJpg(imageBytes);
    }

    // 3. Draw replacement asset inside target bounds
    page.drawImage(embeddedImg, {
      x: pdfBox.x,
      y: pdfBox.y,
      width: pdfBox.width,
      height: pdfBox.height
    });

    return await pdfDoc.save();
  }

  /**
   * Stamp a vector annotation box or pin on a target page
   * @param {Uint8Array|Buffer} pdfBytes 
   * @param {number} pageIndex 0-indexed page
   * @param {Object} bounds Normalized { x, y, width, height } in [0..1]
   * @param {Object} [options] 
   * @returns {Promise<Uint8Array>}
   */
  static async stampAnnotation(pdfBytes, pageIndex, bounds, options = {}) {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();

    if (pageIndex < 0 || pageIndex >= pageCount) {
      throw new Error(`Page index ${pageIndex} is out of bounds (document has ${pageCount} pages).`);
    }

    const page = pdfDoc.getPage(pageIndex);
    const { width: pWidth, height: pHeight } = page.getSize();
    const pdfBox = this.normalizeToPdfPoints(bounds, pWidth, pHeight);

    // Draw annotation border (e.g. warm terracotta)
    page.drawRectangle({
      x: pdfBox.x,
      y: pdfBox.y,
      width: pdfBox.width,
      height: pdfBox.height,
      color: rgb(0.66, 0.34, 0.13), // #a85620 with opacity
      opacity: options.fillOpacity || 0.15,
      borderColor: rgb(0.66, 0.34, 0.13),
      borderWidth: options.borderWidth || 1.5
    });

    return await pdfDoc.save();
  }

  /**
   * Create a new blank PDF with specified page dimensions
   * @param {number} widthPt 
   * @param {number} heightPt 
   * @param {number} count 
   * @returns {Promise<Uint8Array>}
   */
  static async createEmptyDocument(widthPt = 595.28, heightPt = 841.89, count = 1) {
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < count; i++) {
      pdfDoc.addPage([widthPt, heightPt]);
    }
    return await pdfDoc.save();
  }
}

module.exports = {
  PdfAdapter
};
