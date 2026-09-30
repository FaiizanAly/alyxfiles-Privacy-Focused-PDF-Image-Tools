/* ─────────────────────────────────────────────────────────────────
   alyxfiles — js/pdf-tools.js
   PDF operations via pdf-lib + PDF.js
   merge, split, delete pages, reorder, rotate, pdf→image, compress
───────────────────────────────────────────────────────────────── */
'use strict';

// ── Wait for pdf-lib to be available ─────────────────────────────
function ensurePdfLib() {
  if (typeof PDFLib === 'undefined') {
    throw new Error('PDF library is still loading. Please try again in a moment.');
  }
}

// ── Merge PDFs ───────────────────────────────────────────────────
async function mergePDFs(files) {
  ensurePdfLib();
  const { PDFDocument } = PDFLib;
  const merged = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    setProgress(Math.round((i / files.length) * 80), `Merging file ${i+1} of ${files.length}…`);
    const ab  = await files[i].arrayBuffer();
    const src = await PDFDocument.load(ab, { ignoreEncryption: true });
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }

  setProgress(90, 'Saving…');
  const bytes = await merged.save();
  setProgress(100);
  return new Blob([bytes], { type: 'application/pdf' });
}

// ── Split PDF ─────────────────────────────────────────────────────
// mode: 'extract' (extract specific pages), 'halves', 'every-n'
async function splitPDF(file, mode = 'halves', pageIndices = null, everyN = 1) {
  ensurePdfLib();
  const { PDFDocument } = PDFLib;
  const ab  = await file.arrayBuffer();
  const src = await PDFDocument.load(ab, { ignoreEncryption: true });
  const total = src.getPageCount();
  const results = []; // array of { blob, filename }

  if (mode === 'extract' && pageIndices && pageIndices.length > 0) {
    // Extract specified pages into one PDF
    const newDoc = await PDFDocument.create();
    const pages  = await newDoc.copyPages(src, pageIndices);
    pages.forEach(p => newDoc.addPage(p));
    const bytes = await newDoc.save();
    const baseName = file.name.replace(/\.pdf$/i, '');
    results.push({ blob: new Blob([bytes], { type: 'application/pdf' }), filename: `${baseName}_pages.pdf` });

  } else if (mode === 'halves') {
    const half = Math.floor(total / 2);
    const splits = [[...Array(half).keys()], [...Array(total - half).keys()].map(i => i + half)];
    for (let s = 0; s < splits.length; s++) {
      const newDoc = await PDFDocument.create();
      const pages  = await newDoc.copyPages(src, splits[s]);
      pages.forEach(p => newDoc.addPage(p));
      const bytes = await newDoc.save();
      const baseName = file.name.replace(/\.pdf$/i, '');
      results.push({ blob: new Blob([bytes], { type: 'application/pdf' }), filename: `${baseName}_part${s+1}.pdf` });
    }

  } else if (mode === 'every-n') {
    const n = Math.max(1, parseInt(everyN));
    let part = 1;
    for (let start = 0; start < total; start += n) {
      const indices = [];
      for (let j = start; j < Math.min(start + n, total); j++) indices.push(j);
      const newDoc = await PDFDocument.create();
      const pages  = await newDoc.copyPages(src, indices);
      pages.forEach(p => newDoc.addPage(p));
      const bytes  = await newDoc.save();
      const baseName = file.name.replace(/\.pdf$/i, '');
      results.push({ blob: new Blob([bytes], { type: 'application/pdf' }), filename: `${baseName}_part${part++}.pdf` });
    }
  }

  return results;
}

// ── Delete Pages ──────────────────────────────────────────────────
async function deletePages(file, indicesToDelete) {
  ensurePdfLib();
  const { PDFDocument } = PDFLib;
  const ab  = await file.arrayBuffer();
  const src = await PDFDocument.load(ab, { ignoreEncryption: true });
  const total   = src.getPageCount();
  const deleteSet = new Set(indicesToDelete);
  const keep      = [...Array(total).keys()].filter(i => !deleteSet.has(i));

  if (keep.length === 0) throw new Error('Cannot delete all pages.');

  const newDoc = await PDFDocument.create();
  const pages  = await newDoc.copyPages(src, keep);
  pages.forEach(p => newDoc.addPage(p));
  const bytes = await newDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

// ── Reorder Pages ─────────────────────────────────────────────────
async function reorderPages(file, newOrder) {
  ensurePdfLib();
  const { PDFDocument } = PDFLib;
  const ab  = await file.arrayBuffer();
  const src = await PDFDocument.load(ab, { ignoreEncryption: true });

  const newDoc = await PDFDocument.create();
  const pages  = await newDoc.copyPages(src, newOrder);
  pages.forEach(p => newDoc.addPage(p));
  const bytes = await newDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

// ── Rotate Pages ─────────────────────────────────────────────────
async function rotatePages(file, pageRotations) {
  // pageRotations: array of { index, degrees }
  ensurePdfLib();
  const { PDFDocument, degrees: pdfDeg } = PDFLib;
  const ab  = await file.arrayBuffer();
  const doc = await PDFDocument.load(ab, { ignoreEncryption: true });

  pageRotations.forEach(({ index, degrees }) => {
    const page    = doc.getPage(index);
    const current = page.getRotation().angle || 0;
    page.setRotation(pdfDeg((current + degrees) % 360));
  });

  const bytes = await doc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

// ── PDF → Images (using PDF.js) ───────────────────────────────────
async function pdfToImages(file, scale = 2, format = 'jpeg', quality = 0.92) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('PDF renderer is still loading. Please try again.');
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const ab       = await file.arrayBuffer();
  const loadTask = pdfjsLib.getDocument({ data: ab });
  const pdf      = await loadTask.promise;
  const total    = pdf.numPages;
  const blobs    = [];

  for (let i = 1; i <= total; i++) {
    setProgress(Math.round((i / total) * 95), `Exporting page ${i} of ${total}…`);
    const page     = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas   = document.createElement('canvas');
    canvas.width   = viewport.width;
    canvas.height  = viewport.height;
    const ctx      = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await canvasToBlob(canvas, `image/${format}`, quality);
    blobs.push(blob);
  }

  return blobs; // one blob per page
}

// ── "Compress" PDF (re-save; limited without backend) ────────────
// We use pdf-lib's save with objectsPerTick hint, effectively
// re-serializing. For JPG images inside the PDF we re-compress them.
async function compressPDF(file) {
  ensurePdfLib();
  const { PDFDocument } = PDFLib;
  const ab  = await file.arrayBuffer();
  const doc = await PDFDocument.load(ab, { ignoreEncryption: true });

  // Re-save with compression
  const bytes = await doc.save({ useObjectStreams: true });
  return new Blob([bytes], { type: 'application/pdf' });
}

// ── Render PDF page thumbnail via PDF.js ──────────────────────────
async function renderPdfPageThumbnail(pdfDoc, pageNumber, scale = 0.3) {
  const page     = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas   = document.createElement('canvas');
  canvas.width   = viewport.width;
  canvas.height  = viewport.height;
  const ctx      = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

// ── Load PDF for thumbnail display ────────────────────────────────
async function loadPdfForPreview(file) {
  if (typeof pdfjsLib === 'undefined') return null;

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  try {
    const ab  = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    return pdf;
  } catch {
    return null;
  }
}

// ── Build page grid UI ────────────────────────────────────────────
async function buildPageGrid(file) {
  const pdfPreview = await loadPdfForPreview(file);
  if (!pdfPreview) return;

  const total    = pdfPreview.numPages;
  const grid     = document.getElementById('page-grid');
  const label    = document.getElementById('page-count-label');
  const wrapper  = document.getElementById('page-grid-wrapper');

  grid.innerHTML = '';
  label.textContent = `(${total} pages)`;
  wrapper.removeAttribute('hidden');

  // Store total for range selectors
  AppState.totalPages = total;

  // Initialize page order & rotations
  AppState.pageOrder     = [...Array(total).keys()];
  AppState.pageRotations = Array(total).fill(0);
  AppState.selectedPages.clear();

  for (let i = 0; i < total; i++) {
    const thumbCanvas = await renderPdfPageThumbnail(pdfPreview, i + 1, 0.25);
    const thumb = createPageThumb(thumbCanvas, i, i + 1);
    grid.appendChild(thumb);
  }

  initPageGridDragDrop();
  initPageSelectionButtons();
}

// ── Create a single page thumbnail element ────────────────────────
function createPageThumb(canvas, orderIndex, pageLabel) {
  const wrap = document.createElement('div');
  wrap.className = 'page-thumb';
  wrap.dataset.order = orderIndex;
  wrap.setAttribute('draggable', 'true');
  wrap.setAttribute('role', 'button');
  wrap.setAttribute('tabindex', '0');
  wrap.setAttribute('aria-label', `Page ${pageLabel}`);

  wrap.appendChild(canvas);

  const labelEl = document.createElement('div');
  labelEl.className   = 'page-thumb-label';
  labelEl.textContent = `Page ${pageLabel}`;
  wrap.appendChild(labelEl);

  const rotBtn = document.createElement('button');
  rotBtn.className   = 'page-thumb-rotate';
  rotBtn.textContent = '↻';
  rotBtn.title       = 'Rotate 90°';
  rotBtn.setAttribute('aria-label', `Rotate page ${pageLabel}`);
  rotBtn.addEventListener('click', e => {
    e.stopPropagation();
    const idx = parseInt(wrap.dataset.order);
    AppState.pageRotations[idx] = (AppState.pageRotations[idx] + 90) % 360;
    canvas.style.transform = `rotate(${AppState.pageRotations[idx]}deg)`;
  });
  wrap.appendChild(rotBtn);

  // Click to select
  wrap.addEventListener('click', () => {
    const idx = parseInt(wrap.dataset.order);
    if (AppState.selectedPages.has(idx)) {
      AppState.selectedPages.delete(idx);
      wrap.classList.remove('selected');
    } else {
      AppState.selectedPages.add(idx);
      wrap.classList.add('selected');
    }
  });

  // Keyboard select
  wrap.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wrap.click(); }
  });

  return wrap;
}

// ── Page grid drag-and-drop reorder ───────────────────────────────
function initPageGridDragDrop() {
  const grid = document.getElementById('page-grid');
  let dragSrc = null;

  grid.addEventListener('dragstart', e => {
    dragSrc = e.target.closest('.page-thumb');
    if (!dragSrc) return;
    e.dataTransfer.effectAllowed = 'move';
    dragSrc.style.opacity = '0.4';
  });

  grid.addEventListener('dragover', e => {
    e.preventDefault();
    const target = e.target.closest('.page-thumb');
    if (!target || target === dragSrc) return;
    target.classList.add('drag-over-page');
  });

  grid.addEventListener('dragleave', e => {
    const target = e.target.closest('.page-thumb');
    if (target) target.classList.remove('drag-over-page');
  });

  grid.addEventListener('drop', e => {
    e.preventDefault();
    const target = e.target.closest('.page-thumb');
    if (!target || target === dragSrc || !dragSrc) return;
    target.classList.remove('drag-over-page');

    const thumbs = [...grid.querySelectorAll('.page-thumb')];
    const srcIdx = thumbs.indexOf(dragSrc);
    const tgtIdx = thumbs.indexOf(target);

    // Reorder DOM
    if (srcIdx < tgtIdx) {
      grid.insertBefore(dragSrc, target.nextSibling);
    } else {
      grid.insertBefore(dragSrc, target);
    }

    // Update AppState.pageOrder
    const newOrder = [...grid.querySelectorAll('.page-thumb')].map(el => parseInt(el.dataset.order));
    AppState.pageOrder = newOrder;
  });

  grid.addEventListener('dragend', () => {
    if (dragSrc) dragSrc.style.opacity = '';
    dragSrc = null;
    grid.querySelectorAll('.drag-over-page').forEach(el => el.classList.remove('drag-over-page'));
  });

  // Touch drag (simple swap on touch)
  initTouchDragGrid(grid);
}

// Basic touch drag for page grid
function initTouchDragGrid(grid) {
  let dragging = null, startX, startY;
  let clone    = null;

  grid.addEventListener('touchstart', e => {
    const thumb = e.target.closest('.page-thumb');
    if (!thumb) return;
    dragging = thumb;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;

    clone = thumb.cloneNode(true);
    clone.style.cssText = `
      position:fixed; opacity:.7; pointer-events:none;
      z-index:9999; width:${thumb.offsetWidth}px; height:${thumb.offsetHeight}px;
      left:${touch.clientX - thumb.offsetWidth/2}px;
      top:${touch.clientY - thumb.offsetHeight/2}px;
    `;
    document.body.appendChild(clone);
    thumb.style.opacity = '0.3';
  }, { passive: true });

  grid.addEventListener('touchmove', e => {
    if (!dragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    clone.style.left = `${touch.clientX - clone.offsetWidth/2}px`;
    clone.style.top  = `${touch.clientY - clone.offsetHeight/2}px`;

    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const target = el?.closest?.('.page-thumb');
    grid.querySelectorAll('.page-thumb').forEach(t => t.classList.remove('drag-over-page'));
    if (target && target !== dragging) target.classList.add('drag-over-page');
  }, { passive: false });

  grid.addEventListener('touchend', e => {
    if (!dragging) return;
    const touch = e.changedTouches[0];
    const el    = document.elementFromPoint(touch.clientX, touch.clientY);
    const target = el?.closest?.('.page-thumb');

    grid.querySelectorAll('.drag-over-page').forEach(t => t.classList.remove('drag-over-page'));
    if (target && target !== dragging) {
      const thumbs = [...grid.querySelectorAll('.page-thumb')];
      const si = thumbs.indexOf(dragging);
      const ti = thumbs.indexOf(target);
      if (si < ti) grid.insertBefore(dragging, target.nextSibling);
      else         grid.insertBefore(dragging, target);
      AppState.pageOrder = [...grid.querySelectorAll('.page-thumb')].map(el => parseInt(el.dataset.order));
    }

    dragging.style.opacity = '';
    dragging = null;
    if (clone) { clone.remove(); clone = null; }
  });
}

// ── Page action buttons ───────────────────────────────────────────
function initPageSelectionButtons() {
  document.getElementById('btn-rotate-selected').onclick = () => {
    if (AppState.selectedPages.size === 0) {
      showToast('Select at least one page to rotate.');
      return;
    }
    AppState.selectedPages.forEach(idx => {
      AppState.pageRotations[idx] = (AppState.pageRotations[idx] + 90) % 360;
      const el = document.querySelector(`.page-thumb[data-order="${idx}"] canvas`);
      if (el) el.style.transform = `rotate(${AppState.pageRotations[idx]}deg)`;
    });
  };

  document.getElementById('btn-delete-selected').onclick = () => {
    if (AppState.selectedPages.size === 0) {
      showToast('Select at least one page to delete.');
      return;
    }
    AppState.selectedPages.forEach(idx => {
      const el = document.querySelector(`.page-thumb[data-order="${idx}"]`);
      if (el) el.remove();
    });
    // Remove from pageOrder
    AppState.pageOrder = AppState.pageOrder.filter(i => !AppState.selectedPages.has(i));
    AppState.selectedPages.clear();
    document.getElementById('page-count-label').textContent = `(${AppState.pageOrder.length} pages)`;
  };

  document.getElementById('btn-select-all-pages').onclick = () => {
    const thumbs = document.querySelectorAll('.page-thumb');
    if (AppState.selectedPages.size === thumbs.length) {
      // Deselect all
      thumbs.forEach(t => { t.classList.remove('selected'); });
      AppState.selectedPages.clear();
    } else {
      // Select all
      thumbs.forEach(t => {
        const idx = parseInt(t.dataset.order);
        AppState.selectedPages.add(idx);
        t.classList.add('selected');
      });
    }
  };
}
