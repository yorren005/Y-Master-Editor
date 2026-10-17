/**
 * selection-overlay.js
 * Y Master Editor — High-Performance Precision Universal Selection Engine
 * Supports: Pointer / Object Selection, Rectangular Marquee, Circle / Oval (Ellipse)
 * Coordinates: Stored in Normalized [0..1] Page Space, invariant to screen DPI & Zoom
 */

class SelectionOverlayEngine {
  constructor(options = {}) {
    this.mode = 'object'; // 'object' | 'rectangle' | 'oval' (circle)
    this.isDrawing = false;
    this.startPoint = null;
    this.currentPoint = null;
    this.activeSelection = null; // { type, bounds: {x,y,width,height}, center, radius, pageIndex }
    this.onSelectionComplete = options.onSelectionComplete || (() => {});
    this.onSelectionClear = options.onSelectionClear || (() => {});
    this.getPageDimensionsPx = options.getPageDimensionsPx || (() => ({ widthPx: 1440, heightPx: 980 }));
    this.zoom = 1.0;
  }

  setMode(mode) {
    // Normalize lasso / circle to oval
    if (mode === 'lasso' || mode === 'circle') mode = 'oval';
    this.mode = mode;
    this.clearSelection();

    if (typeof document !== 'undefined') {
      document.querySelectorAll('.page-selection-overlay').forEach(canvas => {
        canvas.style.pointerEvents = (mode === 'object') ? 'none' : 'auto';
        canvas.style.cursor = this.getCursorForMode();
      });
    }
  }

  setZoom(zoom) {
    this.zoom = zoom || 1.0;
  }

  clearSelection() {
    this.activeSelection = null;
    this.isDrawing = false;
    this.startPoint = null;
    this.currentPoint = null;
    this.renderAllOverlays();
    this.onSelectionClear();
  }

  getCursorForMode() {
    switch (this.mode) {
      case 'rectangle': return 'crosshair';
      case 'oval': return 'crosshair';
      case 'lasso': return 'crosshair';
      case 'text': return 'text';
      default: return 'default';
    }
  }

  /**
   * Initializes overlay canvas for a given page container
   */
  attachToPage(container, pageIndex, getPageDimensionsPx) {
    this.getPageDimensionsPx = getPageDimensionsPx || this.getPageDimensionsPx;

    let overlay = container.querySelector('.page-selection-overlay');
    if (!overlay) {
      overlay = document.createElement('canvas');
      overlay.className = 'page-selection-overlay';
      overlay.dataset.pageIndex = pageIndex;
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.zIndex = '50';
      overlay.style.pointerEvents = (this.mode === 'object') ? 'none' : 'auto';
      overlay.style.cursor = this.getCursorForMode();
      container.appendChild(overlay);
    }

    const updateCanvasResolution = () => {
      const { widthPx, heightPx } = this.getPageDimensionsPx();
      const dpr = window.devicePixelRatio || 1;
      overlay.width = Math.round(widthPx * dpr);
      overlay.height = Math.round(heightPx * dpr);
      overlay.dataset.widthPx = widthPx;
      overlay.dataset.heightPx = heightPx;
      const ctx = overlay.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scale
      ctx.scale(dpr, dpr);
    };

    updateCanvasResolution();

    // Bind Pointer Events (unified mouse + touch + pen)
    overlay.onpointerdown = (e) => this.handlePointerDown(e, overlay, pageIndex);
    overlay.onpointermove = (e) => this.handlePointerMove(e, overlay, pageIndex);
    overlay.onpointerup = (e) => this.handlePointerUp(e, overlay, pageIndex);
    overlay.onpointercancel = (e) => this.handlePointerCancel(e, overlay);
  }

  /**
   * Translates client pointer coordinates into exact Normalized [0..1] and Unscaled Canvas coordinates
   */
  getNormalizedCoords(e, overlay) {
    const rect = overlay.getBoundingClientRect();
    const widthPx = parseFloat(overlay.dataset.widthPx) || this.getPageDimensionsPx().widthPx;
    const heightPx = parseFloat(overlay.dataset.heightPx) || this.getPageDimensionsPx().heightPx;

    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    return {
      normX,
      normY,
      canvasX: normX * widthPx,
      canvasY: normY * heightPx,
      widthPx,
      heightPx
    };
  }

  handlePointerDown(e, overlay, pageIndex) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (overlay.setPointerCapture) overlay.setPointerCapture(e.pointerId);

    const coords = this.getNormalizedCoords(e, overlay);
    this.isDrawing = true;
    this.startPoint = coords;
    this.currentPoint = coords;
  }

  handlePointerMove(e, overlay, pageIndex) {
    if (!this.isDrawing || !this.startPoint) return;

    const coords = this.getNormalizedCoords(e, overlay);
    this.currentPoint = coords;
    const ctx = overlay.getContext('2d');
    const { widthPx, heightPx } = coords;

    if (this.mode === 'oval' || this.mode === 'lasso') {
      this.drawOvalPreview(ctx, widthPx, heightPx, this.startPoint, coords, e.shiftKey);
    } else {
      this.drawRectPreview(ctx, widthPx, heightPx, this.startPoint, coords, e.shiftKey);
    }
  }

  handlePointerUp(e, overlay, pageIndex) {
    if (!this.isDrawing || !this.startPoint) return;
    this.isDrawing = false;
    if (overlay.releasePointerCapture) overlay.releasePointerCapture(e.pointerId);

    const endCoords = this.getNormalizedCoords(e, overlay);
    const { widthPx, heightPx } = endCoords;
    const shiftKey = e.shiftKey;

    let finalSelection = null;

    if (this.mode === 'oval' || this.mode === 'lasso') {
      let minX = Math.min(this.startPoint.normX, endCoords.normX);
      let minY = Math.min(this.startPoint.normY, endCoords.normY);
      let spanX = Math.abs(endCoords.normX - this.startPoint.normX);
      let spanY = Math.abs(endCoords.normY - this.startPoint.normY);

      // Handle simple click/tap: generate clean circle at point
      if (spanX < 0.015 && spanY < 0.015) {
        spanX = 0.12;
        spanY = 0.12;
        minX = Math.max(0, Math.min(1 - spanX, this.startPoint.normX - 0.06));
        minY = Math.max(0, Math.min(1 - spanY, this.startPoint.normY - 0.06));
      } else if (shiftKey) {
        const maxSpan = Math.max(spanX, spanY);
        spanX = maxSpan;
        spanY = maxSpan;
        if (endCoords.normX < this.startPoint.normX) minX = this.startPoint.normX - spanX;
        if (endCoords.normY < this.startPoint.normY) minY = this.startPoint.normY - spanY;
      }

      finalSelection = {
        type: 'oval',
        pageIndex: pageIndex,
        bounds: {
          x: Math.max(0, minX),
          y: Math.max(0, minY),
          width: Math.min(1 - minX, spanX),
          height: Math.min(1 - minY, spanY)
        },
        center: {
          x: minX + spanX / 2,
          y: minY + spanY / 2
        },
        radius: {
          x: spanX / 2,
          y: spanY / 2
        },
        pixelRect: {
          left: Math.round(minX * widthPx),
          top: Math.round(minY * heightPx),
          width: Math.round(spanX * widthPx),
          height: Math.round(spanY * heightPx)
        }
      };
    } else {
      // Rectangle Marquee
      let minX = Math.min(this.startPoint.normX, endCoords.normX);
      let minY = Math.min(this.startPoint.normY, endCoords.normY);
      let spanX = Math.abs(endCoords.normX - this.startPoint.normX);
      let spanY = Math.abs(endCoords.normY - this.startPoint.normY);

      if (spanX < 0.015 && spanY < 0.015) {
        // Point click
        spanX = 0.10;
        spanY = 0.08;
        minX = Math.max(0, Math.min(1 - spanX, this.startPoint.normX - 0.05));
        minY = Math.max(0, Math.min(1 - spanY, this.startPoint.normY - 0.04));
      } else if (shiftKey) {
        const maxSpan = Math.max(spanX, spanY);
        spanX = maxSpan;
        spanY = maxSpan;
        if (endCoords.normX < this.startPoint.normX) minX = this.startPoint.normX - spanX;
        if (endCoords.normY < this.startPoint.normY) minY = this.startPoint.normY - spanY;
      }

      finalSelection = {
        type: 'rectangle',
        pageIndex: pageIndex,
        bounds: {
          x: Math.max(0, minX),
          y: Math.max(0, minY),
          width: Math.min(1 - minX, spanX),
          height: Math.min(1 - minY, spanY)
        },
        pixelRect: {
          left: Math.round(minX * widthPx),
          top: Math.round(minY * heightPx),
          width: Math.round(spanX * widthPx),
          height: Math.round(spanY * heightPx)
        }
      };
    }

    if (finalSelection) {
      this.activeSelection = finalSelection;
      this.renderSelection(overlay, finalSelection);
      // After selection completes, stop blocking pointer events so the user can interact with the page
      overlay.style.pointerEvents = 'none';
      overlay.style.cursor = 'default';
      this.onSelectionComplete(finalSelection);
    }
  }

  handlePointerCancel(e, overlay) {
    this.isDrawing = false;
    this.clearOverlay(overlay);
  }

  clearOverlay(overlay) {
    const ctx = overlay.getContext('2d');
    const widthPx = parseFloat(overlay.dataset.widthPx) || overlay.width;
    const heightPx = parseFloat(overlay.dataset.heightPx) || overlay.height;
    ctx.clearRect(0, 0, widthPx, heightPx);
  }

  /**
   * Smooth live preview for Rectangle selection
   */
  drawRectPreview(ctx, widthPx, heightPx, start, current, shiftKey) {
    ctx.clearRect(0, 0, widthPx, heightPx);

    let minX = Math.min(start.normX, current.normX);
    let minY = Math.min(start.normY, current.normY);
    let spanX = Math.abs(current.normX - start.normX);
    let spanY = Math.abs(current.normY - start.normY);

    if (shiftKey) {
      const maxSpan = Math.max(spanX, spanY);
      spanX = maxSpan;
      spanY = maxSpan;
      if (current.normX < start.normX) minX = start.normX - spanX;
      if (current.normY < start.normY) minY = start.normY - spanY;
    }

    const x = minX * widthPx;
    const y = minY * heightPx;
    const w = spanX * widthPx;
    const h = spanY * heightPx;

    ctx.fillStyle = 'rgba(168, 86, 32, 0.12)';
    ctx.strokeStyle = '#a85620';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);

    // Live Badge
    const label = `${Math.round(spanX * 100)}% × ${Math.round(spanY * 100)}%`;
    this.drawDimensionBadge(ctx, x, y, label, widthPx);
  }

  /**
   * Smooth live preview for Circle / Oval selection
   */
  drawOvalPreview(ctx, widthPx, heightPx, start, current, shiftKey) {
    ctx.clearRect(0, 0, widthPx, heightPx);

    let minX = Math.min(start.normX, current.normX);
    let minY = Math.min(start.normY, current.normY);
    let spanX = Math.abs(current.normX - start.normX);
    let spanY = Math.abs(current.normY - start.normY);

    if (shiftKey) {
      const maxSpan = Math.max(spanX, spanY);
      spanX = maxSpan;
      spanY = maxSpan;
      if (current.normX < start.normX) minX = start.normX - spanX;
      if (current.normY < start.normY) minY = start.normY - spanY;
    }

    const cx = (minX + spanX / 2) * widthPx;
    const cy = (minY + spanY / 2) * heightPx;
    const rx = Math.max(2, (spanX / 2) * widthPx);
    const ry = Math.max(2, (spanY / 2) * heightPx);

    ctx.fillStyle = 'rgba(168, 86, 32, 0.12)';
    ctx.strokeStyle = '#a85620';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Center Crosshair
    ctx.strokeStyle = '#a85620';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.lineTo(cx + 6, cy);
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx, cy + 6);
    ctx.stroke();

    // Live Badge
    const label = shiftKey ? `Circle ${Math.round(spanX * 100)}%` : `Oval ${Math.round(spanX * 100)}% × ${Math.round(spanY * 100)}%`;
    this.drawDimensionBadge(ctx, minX * widthPx, minY * heightPx, label, widthPx);
  }

  drawDimensionBadge(ctx, x, y, label, widthPx) {
    ctx.fillStyle = '#241c15';
    ctx.font = '600 10.5px Plus Jakarta Sans, sans-serif';
    const textW = ctx.measureText(label).width;
    const badgeX = Math.max(4, Math.min(widthPx - textW - 14, x));
    const badgeY = Math.max(20, y - 6);

    ctx.fillRect(badgeX, badgeY - 14, textW + 8, 16);
    ctx.fillStyle = '#faf7f2';
    ctx.fillText(label, badgeX + 4, badgeY - 2);
  }

  /**
   * Final committed selection rendering with handles
   */
  renderSelection(overlay, selection) {
    const ctx = overlay.getContext('2d');
    const widthPx = parseFloat(overlay.dataset.widthPx) || overlay.width;
    const heightPx = parseFloat(overlay.dataset.heightPx) || overlay.height;

    ctx.clearRect(0, 0, widthPx, heightPx);
    if (!selection || !selection.bounds) return;

    const b = selection.bounds;
    const rx = b.x * widthPx;
    const ry = b.y * heightPx;
    const rw = b.width * widthPx;
    const rh = b.height * heightPx;

    const isOval = selection.type === 'oval' || selection.type === 'lasso';

    if (isOval) {
      const cx = rx + rw / 2;
      const cy = ry + rh / 2;
      const radX = rw / 2;
      const radY = rh / 2;

      ctx.fillStyle = 'rgba(168, 86, 32, 0.15)';
      ctx.strokeStyle = '#a85620';
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      ctx.ellipse(cx, cy, radX, radY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cardinal Handles (North, South, East, West)
      const handleSize = 7;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#a85620';
      ctx.lineWidth = 1.8;

      const cardinals = [
        { x: cx, y: cy - radY },
        { x: cx, y: cy + radY },
        { x: cx - radX, y: cy },
        { x: cx + radX, y: cy }
      ];

      cardinals.forEach(c => {
        ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      });

      // Dimension Badge
      const label = `OVAL ${Math.round(b.width * 100)}% × ${Math.round(b.height * 100)}%`;
      this.drawDimensionBadge(ctx, rx, ry, label, widthPx);
    } else {
      // Solid Box with 4 corner handles
      ctx.fillStyle = (selection.type === 'object') ? 'rgba(168, 86, 32, 0.10)' : 'rgba(168, 86, 32, 0.14)';
      ctx.strokeStyle = '#a85620';
      ctx.lineWidth = 2.2;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);

      // 4 Corner Handles
      const handleSize = 7;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#a85620';
      ctx.lineWidth = 1.8;

      const corners = [
        { x: rx, y: ry },
        { x: rx + rw, y: ry },
        { x: rx + rw, y: ry + rh },
        { x: rx, y: ry + rh }
      ];

      corners.forEach(c => {
        ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      });

      // Dimension Badge
      const typeLabel = (selection.type === 'object') ? 'COMPONENT' : 'RECT';
      const label = `${typeLabel} ${Math.round(b.width * 100)}% × ${Math.round(b.height * 100)}%`;
      this.drawDimensionBadge(ctx, rx, ry, label, widthPx);
    }
  }

  renderAllOverlays() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.page-selection-overlay').forEach(canvas => {
      this.clearOverlay(canvas);
    });
  }

  highlightBounds(pageIndex, bounds, type = 'object') {
    this.renderAllOverlays();
    if (typeof document === 'undefined') return;
    const canvas = document.querySelector(`.page-selection-overlay[data-page-index="${pageIndex}"]`);
    if (!canvas || !bounds) return;
    this.renderSelection(canvas, {
      type: type,
      pageIndex: pageIndex,
      bounds: bounds
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SelectionOverlayEngine };
} else {
  window.SelectionOverlayEngine = SelectionOverlayEngine;
}
