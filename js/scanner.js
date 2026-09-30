/* ─────────────────────────────────────────────────────────────────
   alyxfiles — js/scanner.js
   Scan & Enhance: load image, grayscale, brightness, contrast,
   sharpening, crop modal, download
───────────────────────────────────────────────────────────────── */
'use strict';

// ── Crop Modal State ──────────────────────────────────────────────
const CropModal = {
  overlay:    document.getElementById('crop-modal'),
  canvas:     document.getElementById('crop-canvas'),
  selection:  document.getElementById('crop-selection'),
  btnClose:   document.getElementById('crop-modal-close'),
  btnReset:   document.getElementById('btn-reset-crop'),
  btnApply:   document.getElementById('btn-apply-crop'),

  // State
  img:        null,
  scale:      1,
  selX: 0, selY: 0, selW: 0, selH: 0,
  isDragging: false,
  dragStartX: 0, dragStartY: 0,
  isResizing: false,

  open(img, onApply) {
    this.img     = img;
    this.onApply = onApply;
    this._render();
    this.overlay.removeAttribute('hidden');
    this._bindEvents();
  },

  close() {
    this.overlay.setAttribute('hidden', '');
    this._unbindEvents();
    this.img = null;
  },

  _render() {
    const MAX_W = Math.min(window.innerWidth - 80, 560);
    const MAX_H = 400;
    const img   = this.img;
    const ratio = Math.min(MAX_W / img.naturalWidth, MAX_H / img.naturalHeight, 1);
    this.scale  = ratio;

    this.canvas.width  = Math.round(img.naturalWidth  * ratio);
    this.canvas.height = Math.round(img.naturalHeight * ratio);
    const ctx = this.canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);

    // Default selection: full image
    this.selX = 10;
    this.selY = 10;
    this.selW = this.canvas.width  - 20;
    this.selH = this.canvas.height - 20;
    this._updateSelectionEl();
    this.selection.style.display = 'block';
  },

  _updateSelectionEl() {
    const rect = this.canvas.getBoundingClientRect();
    const cr   = this.canvas.parentElement.getBoundingClientRect();
    const offL = rect.left - cr.left;
    const offT = rect.top  - cr.top;

    this.selection.style.left   = `${offL + this.selX}px`;
    this.selection.style.top    = `${offT + this.selY}px`;
    this.selection.style.width  = `${this.selW}px`;
    this.selection.style.height = `${this.selH}px`;
  },

  _bindEvents() {
    this._onMouseDown = this._mouseDown.bind(this);
    this._onMouseMove = this._mouseMove.bind(this);
    this._onMouseUp   = this._mouseUp.bind(this);

    this.canvas.addEventListener('mousedown',  this._onMouseDown);
    document.addEventListener('mousemove',     this._onMouseMove);
    document.addEventListener('mouseup',       this._onMouseUp);

    // Touch
    this._onTouchStart = e => { if (e.touches[0]) this._mouseDown(e.touches[0]); e.preventDefault(); };
    this._onTouchMove  = e => { if (e.touches[0]) this._mouseMove(e.touches[0]); e.preventDefault(); };
    this._onTouchEnd   = e => this._mouseUp(e);
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    document.addEventListener('touchmove',     this._onTouchMove,  { passive: false });
    document.addEventListener('touchend',      this._onTouchEnd);

    this.btnClose.addEventListener('click', () => this.close());
    this.btnReset.addEventListener('click', () => this._render());
    this.btnApply.addEventListener('click', () => this._apply());
  },

  _unbindEvents() {
    this.canvas.removeEventListener('mousedown',  this._onMouseDown);
    document.removeEventListener('mousemove',     this._onMouseMove);
    document.removeEventListener('mouseup',       this._onMouseUp);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    document.removeEventListener('touchmove',     this._onTouchMove);
    document.removeEventListener('touchend',      this._onTouchEnd);
  },

  _getCanvasXY(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left),
      y: (e.clientY - rect.top)
    };
  },

  _mouseDown(e) {
    const { x, y } = this._getCanvasXY(e);
    this.isDragging = true;
    this.dragStartX = x;
    this.dragStartY = y;
    this.selX = x;
    this.selY = y;
    this.selW = 0;
    this.selH = 0;
  },

  _mouseMove(e) {
    if (!this.isDragging) return;
    const { x, y } = this._getCanvasXY(e);
    const rawW = x - this.dragStartX;
    const rawH = y - this.dragStartY;

    this.selX = rawW >= 0 ? this.dragStartX : x;
    this.selY = rawH >= 0 ? this.dragStartY : y;
    this.selW = Math.abs(rawW);
    this.selH = Math.abs(rawH);

    // Clamp to canvas
    this.selX = Math.max(0, Math.min(this.selX, this.canvas.width));
    this.selY = Math.max(0, Math.min(this.selY, this.canvas.height));
    this.selW = Math.min(this.selW, this.canvas.width  - this.selX);
    this.selH = Math.min(this.selH, this.canvas.height - this.selY);

    this._updateSelectionEl();
  },

  _mouseUp() {
    this.isDragging = false;
  },

  _apply() {
    if (this.selW < 4 || this.selH < 4) {
      showToast('Please draw a crop selection first.');
      return;
    }
    // Convert back to original image coordinates
    const srcX = Math.round(this.selX / this.scale);
    const srcY = Math.round(this.selY / this.scale);
    const srcW = Math.round(this.selW / this.scale);
    const srcH = Math.round(this.selH / this.scale);
    this.close();
    if (this.onApply) this.onApply(srcX, srcY, srcW, srcH);
  }
};

// ── Build Scan & Enhance tool options ────────────────────────────
function buildScanOptions() {
  return `
    <div class="option-row">
      <span class="option-label">Grayscale</span>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="scan-grayscale" checked style="accent-color:var(--accent);width:16px;height:16px">
        <span style="font-size:13px;color:var(--text-2)">Convert to grayscale</span>
      </label>
    </div>
    <div class="option-row">
      <span class="option-label">Brightness</span>
      <input type="range" class="option-slider" id="scan-brightness" min="-50" max="50" value="10">
      <span class="option-slider-value" id="scan-brightness-val">+10%</span>
    </div>
    <div class="option-row">
      <span class="option-label">Contrast</span>
      <input type="range" class="option-slider" id="scan-contrast" min="-50" max="50" value="20">
      <span class="option-slider-value" id="scan-contrast-val">+20%</span>
    </div>
    <div class="option-row">
      <span class="option-label">Sharpen</span>
      <input type="range" class="option-slider" id="scan-sharpen" min="0" max="100" value="40">
      <span class="option-slider-value" id="scan-sharpen-val">40</span>
    </div>
    <div class="option-row">
      <button class="btn btn-secondary btn-sm" id="btn-scan-crop">✂️ Crop first</button>
    </div>
  `;
}

function initScanSliders() {
  [
    { id: 'scan-brightness', valId: 'scan-brightness-val', fmt: v => (v >= 0 ? '+' : '') + v + '%' },
    { id: 'scan-contrast',   valId: 'scan-contrast-val',   fmt: v => (v >= 0 ? '+' : '') + v + '%' },
    { id: 'scan-sharpen',    valId: 'scan-sharpen-val',    fmt: v => String(v) },
  ].forEach(({ id, valId, fmt }) => {
    const slider = document.getElementById(id);
    const label  = document.getElementById(valId);
    if (!slider) return;
    slider.addEventListener('input', () => { label.textContent = fmt(slider.value); });
  });
}

// ── Run scan processing ───────────────────────────────────────────
async function runScanEnhance(file) {
  const grayscale  = document.getElementById('scan-grayscale')?.checked  ?? true;
  const brightness = parseInt(document.getElementById('scan-brightness')?.value ?? '10');
  const contrast   = parseInt(document.getElementById('scan-contrast')?.value   ?? '20');
  const sharpen    = parseInt(document.getElementById('scan-sharpen')?.value    ?? '40');

  showProcessing('Enhancing document…');

  try {
    // Enhance: brightness + contrast + sharpen
    let blob;
    if (grayscale) {
      blob = await grayscaleImage(file, 'jpeg', 0.92);
      // Apply enhance on the grayscale result
      const grayFile = new File([blob], file.name, { type: 'image/jpeg' });
      blob = await enhanceImage(grayFile, brightness, contrast, sharpen, 'jpeg', 0.92);
    } else {
      blob = await enhanceImage(file, brightness, contrast, sharpen, 'jpeg', 0.92);
    }

    const outName = file.name.replace(/\.[^.]+$/, '') + '_scanned.jpg';
    showResult(blob, outName, 'Scanned & Enhanced');
  } catch (err) {
    console.error(err);
    showToast("This file couldn't be processed. Please try another file.");
    showView('home');
  }
}

// ── Scan Crop flow ────────────────────────────────────────────────
let _scanCropBounds = null; // { x, y, w, h } in original pixels or null

function initScanCropButton(file) {
  const btn = document.getElementById('btn-scan-crop');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      const img = await loadImageFromFile(file);
      CropModal.open(img, (x, y, w, h) => {
        _scanCropBounds = { x, y, w, h };
        btn.textContent = `✂️ Crop: ${w}×${h}`;
        btn.style.borderColor = 'var(--accent)';
        btn.style.color = 'var(--accent)';
      });
    } catch (e) {
      showToast("Couldn't load image for cropping.");
    }
  });
}
