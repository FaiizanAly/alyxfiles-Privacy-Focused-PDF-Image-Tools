/* ─────────────────────────────────────────────────────────────────
   alyxfiles — script.js
   Main application: file handling, tool routing, workspace, events
───────────────────────────────────────────────────────────────── */
'use strict';

// ── Tool Definitions ─────────────────────────────────────────────
const TOOLS = {
  'merge-pdf': {
    label:    'Merge PDFs',
    desc:     'Combine multiple PDFs into one document.',
    accept:   '.pdf,application/pdf',
    multiple: true,
    type:     'pdf',
    btnLabel: 'Merge PDFs',
  },
  'split-pdf': {
    label:    'Split PDF',
    desc:     'Split a PDF into separate parts.',
    accept:   '.pdf,application/pdf',
    multiple: false,
    type:     'pdf',
    btnLabel: 'Split',
  },
  'delete-pages': {
    label:    'Delete Pages',
    desc:     'Select pages to remove from your PDF.',
    accept:   '.pdf,application/pdf',
    multiple: false,
    type:     'pdf',
    btnLabel: 'Delete Selected Pages',
  },
  'organize-pdf': {
    label:    'Organize Pages',
    desc:     'Drag pages into the order you want.',
    accept:   '.pdf,application/pdf',
    multiple: false,
    type:     'pdf',
    btnLabel: 'Save New Order',
  },
  'rotate-pdf': {
    label:    'Rotate Pages',
    desc:     'Rotate individual or all pages in a PDF.',
    accept:   '.pdf,application/pdf',
    multiple: false,
    type:     'pdf',
    btnLabel: 'Apply Rotations',
  },
  'pdf-to-image': {
    label:    'PDF → Image',
    desc:     'Export each PDF page as a JPG or PNG image.',
    accept:   '.pdf,application/pdf',
    multiple: false,
    type:     'pdf',
    btnLabel: 'Export Images',
  },
  'image-to-pdf': {
    label:    'Image → PDF',
    desc:     'Convert JPG, PNG or WebP images into a PDF.',
    accept:   'image/*,.jpg,.jpeg,.png,.webp',
    multiple: true,
    type:     'image',
    btnLabel: 'Create PDF',
  },
  'compress-pdf': {
    label:    'Compress PDF',
    desc:     'Reduce the file size of your PDF.',
    accept:   '.pdf,application/pdf',
    multiple: false,
    type:     'pdf',
    btnLabel: 'Compress',
  },
  'compress-image': {
    label:    'Compress Image',
    desc:     'Reduce image file size while preserving quality.',
    accept:   'image/*',
    multiple: false,
    type:     'image',
    btnLabel: 'Compress',
  },
  'resize-image': {
    label:    'Resize Image',
    desc:     'Change image dimensions.',
    accept:   'image/*',
    multiple: false,
    type:     'image',
    btnLabel: 'Resize',
  },
  'crop-image': {
    label:    'Crop Image',
    desc:     'Trim your image to a selected area.',
    accept:   'image/*',
    multiple: false,
    type:     'image',
    btnLabel: 'Crop',
  },
  'convert-image': {
    label:    'Convert Format',
    desc:     'Convert between JPG, PNG and WebP.',
    accept:   'image/*',
    multiple: false,
    type:     'image',
    btnLabel: 'Convert',
  },
  'enhance-image': {
    label:    'Enhance Image',
    desc:     'Adjust brightness, contrast and sharpness.',
    accept:   'image/*',
    multiple: false,
    type:     'image',
    btnLabel: 'Apply Enhancements',
  },
  'scan-enhance': {
    label:    'Scan & Enhance',
    desc:     'Enhance a photo of a document or receipt.',
    accept:   'image/*',
    multiple: false,
    type:     'image',
    camera:   true,
    btnLabel: 'Enhance Document',
  },
};

// ── Initialize ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFileInputs();
  initDropZone();
  initToolCards();
  initWorkspaceButtons();
  initToolSelectView();
});

// ── File Input Wiring ─────────────────────────────────────────────
function initFileInputs() {
  // Add more (inside workspace) — still present in DOM
  const addMoreInput = document.getElementById('add-more-input');
  if (addMoreInput) {
    addMoreInput.addEventListener('change', e => {
      const newFiles = Array.from(e.target.files);
      AppState.files.push(...newFiles);
      renderFileList();
    });
  }
}

// ── Drag & Drop ───────────────────────────────────────────────────
function initDropZone() {
  // Main home drop zone is no longer on the page — only wire the tool-select zone
  const toolZone = document.getElementById('tool-drop-zone');
  if (!toolZone) return;

  ['dragenter', 'dragover'].forEach(evt => {
    toolZone.addEventListener(evt, e => { e.preventDefault(); toolZone.classList.add('drag-over'); });
  });
  ['dragleave', 'drop'].forEach(evt => {
    toolZone.addEventListener(evt, () => toolZone.classList.remove('drag-over'));
  });
  toolZone.addEventListener('drop', e => {
    e.preventDefault();
    toolZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) handleToolFiles(files);
  });
}

// ── Tool Cards ────────────────────────────────────────────────────
function initToolCards() {
  document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => {
      const toolKey = card.dataset.tool;
      if (!TOOLS[toolKey]) return;
      launchToolSelect(toolKey);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
}

// ── Tool Select View ──────────────────────────────────────────────
function initToolSelectView() {
  document.getElementById('btn-back-tool-select').addEventListener('click', () => {
    AppState.reset();
    showView('home');
  });

  document.getElementById('tool-file-input').addEventListener('change', e => {
    handleToolFiles(Array.from(e.target.files));
  });

  document.getElementById('tool-camera-input').addEventListener('change', e => {
    handleToolFiles(Array.from(e.target.files));
  });
}

function launchToolSelect(toolKey) {
  const tool = TOOLS[toolKey];
  AppState.activeTool = toolKey;
  AppState.reset();
  AppState.activeTool = toolKey; // re-set after reset

  // Configure tool-select view
  document.getElementById('tool-select-title').textContent = tool.label;
  document.getElementById('tool-select-sub').textContent   = tool.desc;
  document.getElementById('tool-drop-label').textContent   =
    tool.multiple ? 'Drop your files here' : 'Drop your file here';

  // File input
  const fileInput = document.getElementById('tool-file-input');
  fileInput.accept   = tool.accept;
  fileInput.multiple = !!tool.multiple;
  fileInput.value    = '';

  // Camera option
  const cameraOpt = document.getElementById('camera-option');
  cameraOpt.style.display = tool.camera ? '' : 'none';

  showView('toolSelect');
}

// ── Handle files from tool-select view ────────────────────────────
function handleToolFiles(files) {
  const valid = files.filter(f => isFileAllowed(f, AppState.activeTool));
  if (!valid.length) {
    showToast("This file type isn't supported for this tool. Please try another file.");
    return;
  }
  AppState.files = valid;
  openWorkspace();
}

// ── Handle files from generic upload (hero / drop zone) ───────────
function handleFiles(files) {
  const valid = files.filter(f => isFileTypeAllowed(f));
  if (!valid.length) {
    showToast("This file type isn't supported yet.");
    return;
  }
  AppState.files = valid;

  // Auto-detect tool from file types
  const hasPdf   = valid.some(f => f.type === 'application/pdf');
  const hasImage = valid.some(f => f.type.startsWith('image/'));

  if (hasPdf && valid.length > 1 && valid.every(f => f.type === 'application/pdf')) {
    AppState.activeTool = 'merge-pdf';
  } else if (hasPdf) {
    AppState.activeTool = 'organize-pdf';
  } else if (hasImage && valid.length > 1) {
    AppState.activeTool = 'image-to-pdf';
  } else {
    AppState.activeTool = 'enhance-image';
  }

  openWorkspace();
}

// ── Open Workspace ────────────────────────────────────────────────
async function openWorkspace() {
  const tool = TOOLS[AppState.activeTool];
  if (!tool) return;

  document.getElementById('workspace-title').textContent = tool.label;
  document.getElementById('btn-process').textContent     = tool.btnLabel || 'Process';

  // Render file list
  renderFileList();

  // Build tool options panel
  buildToolOptions(AppState.activeTool);

  // Show page grid and init range selectors for PDF page ops
  const pageModes = ['organize-pdf', 'delete-pages', 'rotate-pdf'];
  if (pageModes.includes(AppState.activeTool) && AppState.files[0]?.type === 'application/pdf') {
    try {
      await buildPageGrid(AppState.files[0]);
      // Wire up range selector for delete-pages after grid is ready
      if (AppState.activeTool === 'delete-pages' && AppState.totalPages > 0) {
        initDeletePageRangeSelector(AppState.totalPages);
      }
    } catch (e) {
      console.warn('Page grid failed:', e);
    }
  }

  // For split-pdf: load page count so range inputs know the bounds
  if (AppState.activeTool === 'split-pdf' && AppState.files[0]?.type === 'application/pdf') {
    try {
      const pdfPrev = await loadPdfForPreview(AppState.files[0]);
      if (pdfPrev) {
        AppState.totalPages = pdfPrev.numPages;
        // Update placeholder hints
        const toEl = document.getElementById('split-to');
        if (toEl) toEl.placeholder = String(pdfPrev.numPages);
        const fromEl = document.getElementById('split-from');
        if (fromEl) fromEl.placeholder = '1';
      }
    } catch (e) { /* non-fatal */ }
  }

  // Live compression preview
  if (AppState.activeTool === 'compress-image' && AppState.files[0]) {
    // Run async after workspace is visible
    setTimeout(() => initCompressImageLivePreview(AppState.files[0]), 50);
  }
  if (AppState.activeTool === 'compress-pdf' && AppState.files[0]) {
    setTimeout(() => initCompressPdfPreview(AppState.files[0]), 50);
  }

  showView('workspace');
}

// ── Render File List ──────────────────────────────────────────────
function renderFileList() {
  const list = document.getElementById('file-list');
  list.innerHTML = '';

  // File-ready confirmation bar (shown when at least one file is loaded)
  if (AppState.files.length > 0) {
    const readyBar = document.createElement('div');
    readyBar.className = 'file-ready-bar';
    readyBar.setAttribute('role', 'status');
    readyBar.innerHTML = `
      <span class="file-ready-check">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6.5" stroke="#34C759" stroke-width="1"/>
          <path d="M4 7l2 2 4-4" stroke="#34C759" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${AppState.files.length === 1 ? 'File ready' : `${AppState.files.length} files ready`}
      </span>
      <span class="local-status-pill">
        <span class="local-status-dot" aria-hidden="true"></span>
        🔒 Processing locally on this device
      </span>
    `;
    list.appendChild(readyBar);
  }

  AppState.files.forEach((file, idx) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.setAttribute('role', 'listitem');

    // Thumbnail
    const thumbWrap = document.createElement('div');
    if (file.type.startsWith('image/')) {
      thumbWrap.className = 'file-thumb';
      const img = document.createElement('img');
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:5px';
      img.alt = file.name;
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => URL.revokeObjectURL(url);
      thumbWrap.appendChild(img);
    } else {
      thumbWrap.className = 'file-thumb-placeholder';
      thumbWrap.setAttribute('aria-hidden', 'true');
      thumbWrap.textContent = '📄';
    }

    // Friendly type label instead of raw MIME
    const typeLabel = getFriendlyType(file);

    const info = document.createElement('div');
    info.className = 'file-info';
    info.innerHTML = `
      <div class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
      <div class="file-meta">${typeLabel} · ${formatFileSize(file.size)} &nbsp;<span class="local-status-pill" style="vertical-align:middle"><span class="local-status-dot"></span>Local</span></div>
    `;

    const removeBtn = document.createElement('button');
    removeBtn.className   = 'file-remove';
    removeBtn.textContent = '✕';
    removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
    removeBtn.addEventListener('click', () => {
      AppState.files.splice(idx, 1);
      if (AppState.files.length === 0) {
        AppState.reset();
        showView('home');
      } else {
        renderFileList();
      }
    });

    item.appendChild(thumbWrap);
    item.appendChild(info);
    item.appendChild(removeBtn);
    list.appendChild(item);
  });
}

// ── Friendly file type label ──────────────────────────────────────
function getFriendlyType(file) {
  if (file.type === 'application/pdf') return 'PDF';
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') return 'JPG';
  if (file.type === 'image/png')  return 'PNG';
  if (file.type === 'image/webp') return 'WebP';
  const ext = file.name.split('.').pop()?.toUpperCase();
  return ext || 'File';
}


// ── Tool Options Panel ────────────────────────────────────────────
function buildToolOptions(toolKey) {
  const panel = document.getElementById('tool-options-panel');
  panel.innerHTML = '';

  switch (toolKey) {
    case 'delete-pages':
      panel.innerHTML = `
        <div class="range-selector-panel">
          <p class="range-selector-title">Delete page range</p>
          <div class="range-inputs-row">
            <label for="delete-from">From page</label>
            <input type="number" class="range-num-input" id="delete-from" min="1" placeholder="1" aria-label="From page number">
            <span class="range-dash">—</span>
            <label for="delete-to">to page</label>
            <input type="number" class="range-num-input" id="delete-to" min="1" placeholder="—" aria-label="To page number">
          </div>
          <p class="range-count-label" id="delete-count-label"></p>
          <p class="range-error-msg" id="delete-range-error" role="alert"></p>
          <div class="range-divider"></div>
          <p class="range-manual-hint">Or click individual page thumbnails below to select them manually.</p>
        </div>
      `;
      break;

    case 'split-pdf':
      panel.innerHTML = `
        <div class="option-row">
          <span class="option-label">Split mode</span>
          <div class="split-mode-btns">
            <button class="split-mode-btn active" data-mode="halves">Into 2 halves</button>
            <button class="split-mode-btn" data-mode="range">Custom range</button>
            <button class="split-mode-btn" data-mode="every-n">Every N pages</button>
          </div>
        </div>
        <div class="option-row" id="split-n-row" style="display:none">
          <span class="option-label">Pages per part</span>
          <input type="number" class="option-input" id="split-n" value="1" min="1" style="width:80px">
        </div>
        <div id="split-range-row" style="display:none">
          <div class="range-selector-panel" style="margin-top:8px">
            <p class="range-selector-title">Extract page range</p>
            <div class="range-inputs-row">
              <label for="split-from">From page</label>
              <input type="number" class="range-num-input" id="split-from" min="1" placeholder="1" aria-label="From page number">
              <span class="range-dash">—</span>
              <label for="split-to">to page</label>
              <input type="number" class="range-num-input" id="split-to" min="1" placeholder="—" aria-label="To page number">
            </div>
            <p class="range-count-label" id="split-count-label"></p>
            <p class="range-error-msg" id="split-range-error" role="alert"></p>
          </div>
        </div>
      `;
      panel.querySelectorAll('.split-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          panel.querySelectorAll('.split-mode-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          document.getElementById('split-n-row').style.display    = btn.dataset.mode === 'every-n' ? '' : 'none';
          document.getElementById('split-range-row').style.display = btn.dataset.mode === 'range'   ? '' : 'none';
        });
      });
      // Wire split range inputs
      ['split-from','split-to'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateSplitRangeCount);
      });
      break;

    case 'compress-image':
      panel.innerHTML = `
        <div class="compress-layout">
          <div class="compress-preview-col">
            <div class="compress-img-wrap" id="compress-img-wrap">
              <img id="compress-preview-img" class="compress-preview-img" alt="Preview" hidden />
              <div class="compress-preview-placeholder" id="compress-preview-ph">
                <span>Loading preview…</span>
              </div>
            </div>
          </div>
          <div class="compress-controls-col">
            <div class="compress-size-card" id="compress-size-card">
              <div class="csc-row">
                <span class="csc-label">Original</span>
                <span class="csc-value" id="csc-original">—</span>
              </div>
              <div class="csc-row" id="csc-compressed-row" hidden>
                <span class="csc-label">Compressed</span>
                <span class="csc-value csc-value--green" id="csc-compressed">—</span>
              </div>
              <div class="csc-row" id="csc-saved-row" hidden>
                <span class="csc-label">Saved</span>
                <span class="csc-value csc-value--green" id="csc-saved">—</span>
              </div>
              <div class="csc-badge" id="csc-badge" hidden></div>
              <div class="csc-no-reduction" id="csc-no-reduction" hidden>No size reduction</div>
            </div>
            <div class="option-row" style="margin-top:14px">
              <span class="option-label">Quality</span>
              <input type="range" class="option-slider" id="compress-quality" min="10" max="100" value="75">
              <span class="option-slider-value" id="compress-quality-val">75%</span>
            </div>
            <div class="option-row">
              <span class="option-label">Format</span>
              <select class="option-select" id="compress-format">
                <option value="jpeg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div class="compress-working" id="compress-working" hidden>
              <div class="compress-spinner"></div>
              <span>Compressing…</span>
            </div>
          </div>
        </div>
      `;
      wireSlider('compress-quality', 'compress-quality-val', v => v + '%');
      // Live preview wired after file is known (called from openWorkspace)
      break;

    case 'compress-pdf':
      panel.innerHTML = `
        <div class="compress-size-card" id="compress-size-card">
          <div class="csc-row">
            <span class="csc-label">Original</span>
            <span class="csc-value" id="csc-original">—</span>
          </div>
          <div class="csc-row" id="csc-compressed-row" hidden>
            <span class="csc-label">Compressed</span>
            <span class="csc-value csc-value--green" id="csc-compressed">—</span>
          </div>
          <div class="csc-row" id="csc-saved-row" hidden>
            <span class="csc-label">Saved</span>
            <span class="csc-value csc-value--green" id="csc-saved">—</span>
          </div>
          <div class="csc-badge" id="csc-badge" hidden></div>
          <div class="csc-no-reduction" id="csc-no-reduction" hidden>No size reduction</div>
          <div class="compress-working" id="compress-working" hidden>
            <div class="compress-spinner"></div>
            <span>Compressing…</span>
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-2);margin-top:10px">
          PDF compression re-saves with optimised object streams.
          Results depend on the original file's structure.
        </p>
      `;
      // Show original size immediately
      if (AppState.files[0]) {
        const el = document.getElementById('csc-original');
        if (el) el.textContent = formatFileSize(AppState.files[0].size);
      }
      break;

    case 'resize-image':
      panel.innerHTML = `
        <div class="option-row">
          <span class="option-label">Width (px)</span>
          <input type="number" class="option-input" id="resize-w" placeholder="auto" min="1" style="width:110px">
        </div>
        <div class="option-row">
          <span class="option-label">Height (px)</span>
          <input type="number" class="option-input" id="resize-h" placeholder="auto" min="1" style="width:110px">
        </div>
        <div class="option-row">
          <span class="option-label">Format</span>
          <select class="option-select" id="resize-format">
            <option value="jpeg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      `;
      break;

    case 'convert-image':
      panel.innerHTML = `
        <div class="option-row">
          <span class="option-label">Convert to</span>
          <select class="option-select" id="convert-format">
            <option value="jpeg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <div class="option-row">
          <span class="option-label">Quality</span>
          <input type="range" class="option-slider" id="convert-quality" min="50" max="100" value="90">
          <span class="option-slider-value" id="convert-quality-val">90%</span>
        </div>
      `;
      wireSlider('convert-quality', 'convert-quality-val', v => v + '%');
      break;

    case 'enhance-image':
      panel.innerHTML = `
        <div class="option-row">
          <span class="option-label">Brightness</span>
          <input type="range" class="option-slider" id="enh-brightness" min="-100" max="100" value="0">
          <span class="option-slider-value" id="enh-brightness-val">0%</span>
        </div>
        <div class="option-row">
          <span class="option-label">Contrast</span>
          <input type="range" class="option-slider" id="enh-contrast" min="-100" max="100" value="0">
          <span class="option-slider-value" id="enh-contrast-val">0%</span>
        </div>
        <div class="option-row">
          <span class="option-label">Sharpen</span>
          <input type="range" class="option-slider" id="enh-sharpen" min="0" max="100" value="0">
          <span class="option-slider-value" id="enh-sharpen-val">0</span>
        </div>
        <div class="option-row">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" id="enh-grayscale" style="accent-color:var(--accent);width:16px;height:16px">
            <span style="font-size:13px;color:var(--text-2)">Grayscale</span>
          </label>
        </div>
        <div class="option-row">
          <span class="option-label">Output format</span>
          <select class="option-select" id="enh-format">
            <option value="jpeg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      `;
      wireSlider('enh-brightness', 'enh-brightness-val', v => (v >= 0 ? '+' : '') + v + '%');
      wireSlider('enh-contrast',   'enh-contrast-val',   v => (v >= 0 ? '+' : '') + v + '%');
      wireSlider('enh-sharpen',    'enh-sharpen-val',    v => String(v));
      break;

    case 'pdf-to-image':
      panel.innerHTML = `
        <div class="option-row">
          <span class="option-label">Output format</span>
          <select class="option-select" id="pdf-img-format">
            <option value="jpeg">JPG</option>
            <option value="png">PNG</option>
          </select>
        </div>
        <div class="option-row">
          <span class="option-label">Resolution</span>
          <select class="option-select" id="pdf-img-scale">
            <option value="1">Standard (72 dpi)</option>
            <option value="2" selected>High (144 dpi)</option>
            <option value="3">Very High (216 dpi)</option>
          </select>
        </div>
      `;
      break;

    case 'scan-enhance':
      panel.innerHTML = buildScanOptions();
      initScanSliders();
      // Will init crop btn after first file renders
      if (AppState.files[0]) initScanCropButton(AppState.files[0]);
      break;

    case 'crop-image':
      panel.innerHTML = `
        <div class="option-row">
          <span class="option-label">Output format</span>
          <select class="option-select" id="crop-format">
            <option value="jpeg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <p style="font-size:13px;color:var(--text-2);margin-top:4px">
          Click "Crop" to open the crop selection tool.
        </p>
      `;
      break;

    default:
      // No extra options needed
      break;
  }
}

function wireSlider(sliderId, labelId, fmt) {
  const slider = document.getElementById(sliderId);
  const label  = document.getElementById(labelId);
  if (!slider || !label) return;
  slider.addEventListener('input', () => { label.textContent = fmt(slider.value); });
}

// ── Delete-Pages Range Selector ───────────────────────────────────
function initDeletePageRangeSelector(totalPages) {
  const fromInput  = document.getElementById('delete-from');
  const toInput    = document.getElementById('delete-to');
  const countLabel = document.getElementById('delete-count-label');
  const errorMsg   = document.getElementById('delete-range-error');
  const processBtn = document.getElementById('btn-process');

  if (!fromInput || !toInput) return;

  // Set max attribute and placeholder
  fromInput.max = totalPages;
  toInput.max   = totalPages;
  toInput.placeholder = String(totalPages);

  function validate() {
    const from = parseInt(fromInput.value);
    const to   = parseInt(toInput.value);
    errorMsg.textContent = '';
    errorMsg.classList.remove('visible');

    // If both fields are empty, do nothing
    if (!fromInput.value && !toInput.value) {
      countLabel.textContent = '';
      processBtn.textContent = 'Delete Selected Pages';
      return;
    }

    // Range validation
    if (fromInput.value && (from < 1 || from > totalPages)) {
      errorMsg.textContent = `Please enter a page number between 1 and ${totalPages}.`;
      errorMsg.classList.add('visible');
      clearRangeSelection();
      return;
    }
    if (toInput.value && (to < 1 || to > totalPages)) {
      errorMsg.textContent = `Please enter a page number between 1 and ${totalPages}.`;
      errorMsg.classList.add('visible');
      clearRangeSelection();
      return;
    }
    if (fromInput.value && toInput.value && from > to) {
      errorMsg.textContent = 'The starting page must be before the ending page.';
      errorMsg.classList.add('visible');
      clearRangeSelection();
      return;
    }

    // Both valid — apply selection
    if (fromInput.value && toInput.value) {
      const count = to - from + 1;
      countLabel.textContent = `${count} page${count === 1 ? '' : 's'} selected`;
      processBtn.textContent = `Delete ${count} page${count === 1 ? '' : 's'}`;

      // Update AppState and thumbnail visuals
      AppState.selectedPages.clear();
      for (let i = from - 1; i <= to - 1; i++) {
        AppState.selectedPages.add(i);
      }
      updateThumbnailSelection();
    }
  }

  fromInput.addEventListener('input', validate);
  toInput.addEventListener('input',   validate);
}

// Sync visual selected state on all page thumbnails
function updateThumbnailSelection() {
  document.querySelectorAll('.page-thumb').forEach(thumb => {
    const idx = parseInt(thumb.dataset.order);
    thumb.classList.toggle('selected', AppState.selectedPages.has(idx));
  });
}

// Clear range selection (keep manual selections if any)
function clearRangeSelection() {
  document.getElementById('delete-count-label').textContent = '';
  document.getElementById('btn-process').textContent = 'Delete Selected Pages';
  AppState.selectedPages.clear();
  updateThumbnailSelection();
}

// ── Split-PDF Range Count display ─────────────────────────────────
function updateSplitRangeCount() {
  const from      = parseInt(document.getElementById('split-from')?.value || '0');
  const to        = parseInt(document.getElementById('split-to')?.value   || '0');
  const countEl   = document.getElementById('split-count-label');
  const errorEl   = document.getElementById('split-range-error');
  const total     = AppState.totalPages || 0;

  if (!countEl) return;
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
  countEl.textContent = '';

  if (!from || !to) return;

  if (from < 1 || (total && from > total) || to < 1 || (total && to > total)) {
    errorEl.textContent = total
      ? `Please enter page numbers between 1 and ${total}.`
      : 'Invalid page number.';
    errorEl.classList.add('visible');
    return;
  }
  if (from > to) {
    errorEl.textContent = 'The starting page must be before the ending page.';
    errorEl.classList.add('visible');
    return;
  }

  const count = to - from + 1;
  countEl.textContent = `${count} page${count === 1 ? '' : 's'} will be extracted`;
}


// ── Live Compression Preview ──────────────────────────────────────
// Shared state for compress tools — holds the most recent processed Blob
// so doCompressImage / doCompressPdf can download it without re-processing.
const compressState = {
  blob:          null,   // final processed Blob
  originalBytes: 0,
  previewUrl:    null,   // object URL for the img preview

  clear() {
    if (this.previewUrl) { URL.revokeObjectURL(this.previewUrl); this.previewUrl = null; }
    this.blob = null;
    this.originalBytes = 0;
  }
};

// Update the size-stats card (shared between image and PDF compress)
function updateCompressSizeCard(originalBytes, compressedBlob) {
  const origEl       = document.getElementById('csc-original');
  const compEl       = document.getElementById('csc-compressed');
  const compRow      = document.getElementById('csc-compressed-row');
  const savedEl      = document.getElementById('csc-saved');
  const savedRow     = document.getElementById('csc-saved-row');
  const badge        = document.getElementById('csc-badge');
  const noReduction  = document.getElementById('csc-no-reduction');

  if (!origEl) return;

  origEl.textContent = formatFileSize(originalBytes);

  const compressedBytes = compressedBlob.size;
  const savedBytes      = originalBytes - compressedBytes;
  const pct             = ((savedBytes / originalBytes) * 100);

  if (savedBytes > 0) {
    compEl.textContent   = formatFileSize(compressedBytes);
    savedEl.textContent  = formatFileSize(savedBytes);
    badge.textContent    = `↓ ${pct.toFixed(1)}% smaller`;

    compRow.removeAttribute('hidden');
    savedRow.removeAttribute('hidden');
    badge.removeAttribute('hidden');
    if (noReduction) noReduction.setAttribute('hidden', '');
  } else {
    compEl.textContent   = formatFileSize(compressedBytes);
    compRow.removeAttribute('hidden');
    if (savedRow) savedRow.setAttribute('hidden', '');
    if (badge)    badge.setAttribute('hidden', '');
    if (noReduction) noReduction.removeAttribute('hidden');
  }
}

// ── Image Compression Live Preview ───────────────────────────────
async function initCompressImageLivePreview(file) {
  compressState.clear();
  compressState.originalBytes = file.size;

  const ph      = document.getElementById('compress-preview-ph');
  const imgEl   = document.getElementById('compress-preview-img');
  const working = document.getElementById('compress-working');
  const origEl  = document.getElementById('csc-original');

  if (origEl) origEl.textContent = formatFileSize(file.size);

  // Show original image as placeholder immediately
  const origUrl = URL.createObjectURL(file);
  if (imgEl) {
    imgEl.src = origUrl;
    imgEl.removeAttribute('hidden');
    if (ph) ph.setAttribute('hidden', '');
  }

  // Run initial compression
  await runCompressImageUpdate(file);

  // Wire slider + format selector with debounce
  let debounceTimer = null;
  const onSettingChange = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runCompressImageUpdate(file), 280);
  };

  const qualitySlider  = document.getElementById('compress-quality');
  const formatSelector = document.getElementById('compress-format');
  if (qualitySlider)  qualitySlider.addEventListener('input',  onSettingChange);
  if (formatSelector) formatSelector.addEventListener('change', onSettingChange);

  // Revoke the original preview URL after a moment (imgEl still shows it)
  setTimeout(() => URL.revokeObjectURL(origUrl), 5000);
}

async function runCompressImageUpdate(file) {
  const working      = document.getElementById('compress-working');
  const imgEl        = document.getElementById('compress-preview-img');
  const qualityInput = document.getElementById('compress-quality');
  const formatInput  = document.getElementById('compress-format');

  const quality = parseInt(qualityInput?.value || '75') / 100;
  const format  = formatInput?.value || 'jpeg';

  if (working) working.removeAttribute('hidden');

  try {
    const blob = await compressImage(file, quality, format);

    // Update cached blob
    compressState.blob = blob;

    // Update preview image
    if (imgEl) {
      const oldSrc = imgEl.src;
      const newUrl = URL.createObjectURL(blob);
      imgEl.src = newUrl;
      // Revoke old after render
      imgEl.onload = () => {
        if (oldSrc && oldSrc.startsWith('blob:')) URL.revokeObjectURL(oldSrc);
      };
    }

    updateCompressSizeCard(file.size, blob);
  } catch (err) {
    console.warn('Live compress failed:', err);
  } finally {
    if (working) working.setAttribute('hidden', '');
  }
}

// ── PDF Compression Preview ───────────────────────────────────────
async function initCompressPdfPreview(file) {
  compressState.clear();
  compressState.originalBytes = file.size;

  const origEl  = document.getElementById('csc-original');
  const working = document.getElementById('compress-working');

  if (origEl) origEl.textContent = formatFileSize(file.size);
  if (working) working.removeAttribute('hidden');

  try {
    const blob = await compressPDF(file);
    compressState.blob = blob;
    updateCompressSizeCard(file.size, blob);
  } catch (err) {
    console.warn('PDF compress preview failed:', err);
    if (origEl) origEl.textContent = formatFileSize(file.size);
  } finally {
    if (working) working.setAttribute('hidden', '');
  }
}

// ── Workspace Buttons ─────────────────────────────────────────────
function initWorkspaceButtons() {
  document.getElementById('btn-back-workspace').addEventListener('click', () => {
    AppState.reset();
    showView('home');
  });

  document.getElementById('btn-process').addEventListener('click', processFiles);
}

// ── Main Processing Dispatcher ────────────────────────────────────
async function processFiles() {
  if (!AppState.files.length) {
    showToast('Please add at least one file first.');
    return;
  }

  const tool = AppState.activeTool;

  try {
    switch (tool) {
      case 'merge-pdf':       await doMergePdf();      break;
      case 'split-pdf':       await doSplitPdf();      break;
      case 'delete-pages':    await doDeletePages();   break;
      case 'organize-pdf':    await doOrganizePdf();   break;
      case 'rotate-pdf':      await doRotatePdf();     break;
      case 'pdf-to-image':    await doPdfToImages();   break;
      case 'image-to-pdf':    await doImagesToPdf();   break;
      case 'compress-pdf':    await doCompressPdf();   break;
      case 'compress-image':  await doCompressImage(); break;
      case 'resize-image':    await doResizeImage();   break;
      case 'crop-image':      await doCropImage();     break;
      case 'convert-image':   await doConvertImage();  break;
      case 'enhance-image':   await doEnhanceImage();  break;
      case 'scan-enhance':    await doScanEnhance();   break;
      default:
        showToast("This tool isn't available yet.");
    }
  } catch (err) {
    console.error('Processing error:', err);
    const msg = err?.message?.includes('loading')
      ? err.message
      : "This file couldn't be processed. Please try another file.";
    showToast(msg);
    if (currentView === 'processing') showView('workspace');
  }
}

// ── PDF Operations ────────────────────────────────────────────────
async function doMergePdf() {
  if (AppState.files.length < 2) {
    showToast('Please add at least 2 PDF files to merge.');
    return;
  }
  showProcessing('Merging PDFs…', `Combining ${AppState.files.length} files…`);
  const blob = await mergePDFs(AppState.files);
  const name = 'merged.pdf';
  showResult(blob, name, `${AppState.files.length} files merged`);
}

async function doSplitPdf() {
  const file  = AppState.files[0];
  const mode  = document.querySelector('.split-mode-btn.active')?.dataset.mode || 'halves';

  // Custom range mode
  if (mode === 'range') {
    const from = parseInt(document.getElementById('split-from')?.value || '0');
    const to   = parseInt(document.getElementById('split-to')?.value   || '0');
    const total = AppState.totalPages || 0;

    if (!from || !to) {
      showToast('Please enter a From and To page number.');
      return;
    }
    if (from > to) {
      showToast('The starting page must be before the ending page.');
      return;
    }
    if (total && (from > total || to > total)) {
      showToast(`Please enter page numbers between 1 and ${total}.`);
      return;
    }

    showProcessing('Extracting pages…', `Pages ${from}–${to}`);
    // Build 0-indexed array
    const indices = [];
    for (let i = from - 1; i <= to - 1; i++) indices.push(i);
    const results = await splitPDF(file, 'extract', indices);
    const base    = file.name.replace(/\.pdf$/i, '');
    showResult(results[0].blob, `${base}_pages${from}-${to}.pdf`, `${to - from + 1} pages extracted`);
    return;
  }

  const everyN = parseInt(document.getElementById('split-n')?.value || '1');
  showProcessing('Splitting PDF…');

  const results = await splitPDF(file, mode, null, everyN);
  if (results.length === 1) {
    showResult(results[0].blob, results[0].filename);
  } else {
    showResult(results[0].blob, results[0].filename, `${results.length} parts — downloading all`);
    setTimeout(() => {
      results.slice(1).forEach((r, i) => {
        setTimeout(() => triggerDownload(r.blob, r.filename), i * 600);
      });
    }, 800);
  }
}

async function doDeletePages() {
  const file    = AppState.files[0];
  const deleted = [...AppState.selectedPages];
  if (deleted.length === 0) {
    showToast('Enter a page range above or click page thumbnails to select pages to delete.');
    return;
  }
  showProcessing('Removing pages…');
  const blob = await deletePages(file, deleted);
  const name = file.name.replace(/\.pdf$/i, '') + '_edited.pdf';
  showResult(blob, name, `${deleted.length} page${deleted.length === 1 ? '' : 's'} removed`);
}

async function doOrganizePdf() {
  const file  = AppState.files[0];
  const order = AppState.pageOrder;
  showProcessing('Saving new page order…');
  const blob = await reorderPages(file, order);
  const name = file.name.replace(/\.pdf$/i, '') + '_organized.pdf';
  showResult(blob, name);
}

async function doRotatePdf() {
  const file = AppState.files[0];
  const rotations = AppState.pageRotations
    .map((deg, idx) => ({ index: idx, degrees: deg }))
    .filter(r => r.degrees !== 0);

  if (rotations.length === 0) {
    showToast('Rotate some pages first using the ↻ buttons on the thumbnails.');
    return;
  }
  showProcessing('Applying rotations…');
  const blob = await rotatePages(file, rotations);
  const name = file.name.replace(/\.pdf$/i, '') + '_rotated.pdf';
  showResult(blob, name);
}

async function doPdfToImages() {
  const file   = AppState.files[0];
  const format = document.getElementById('pdf-img-format')?.value || 'jpeg';
  const scale  = parseFloat(document.getElementById('pdf-img-scale')?.value || '2');

  showProcessing('Exporting pages…', 'This may take a moment for large PDFs…');
  const blobs = await pdfToImages(file, scale, format, 0.92);
  const base  = file.name.replace(/\.pdf$/i, '');
  const ext   = format === 'jpeg' ? 'jpg' : format;

  if (blobs.length === 1) {
    showResult(blobs[0], `${base}_page1.${ext}`);
  } else {
    // Download all
    showResult(blobs[0], `${base}_page1.${ext}`, `${blobs.length} images — downloading all`);
    setTimeout(() => {
      blobs.slice(1).forEach((b, i) => {
        setTimeout(() => triggerDownload(b, `${base}_page${i+2}.${ext}`), i * 400);
      });
    }, 800);
  }
}

async function doImagesToPdf() {
  showProcessing('Creating PDF…', `Processing ${AppState.files.length} image(s)…`);
  const blob = await imagesToPdf(AppState.files);
  showResult(blob, 'images.pdf', `${AppState.files.length} images`);
}

async function doCompressPdf() {
  const file = AppState.files[0];
  const name = file.name.replace(/\.pdf$/i, '') + '_compressed.pdf';

  // Use the blob already generated by the live preview (same blob the user sees)
  if (compressState.blob) {
    const saved = file.size - compressState.blob.size;
    const pct   = ((saved / file.size) * 100).toFixed(1);
    const meta  = saved > 0
      ? `${formatFileSize(file.size)} \u2192 ${formatFileSize(compressState.blob.size)} (${pct}% smaller)`
      : `${formatFileSize(file.size)} (no size reduction)`;
    showResult(compressState.blob, name, meta);
    return;
  }

  // Fallback: compress now (live preview may not have run yet)
  showProcessing('Compressing PDF\u2026');
  const blob  = await compressPDF(file);
  const saved = file.size - blob.size;
  const pct   = ((saved / file.size) * 100).toFixed(1);
  const meta  = saved > 0
    ? `${formatFileSize(file.size)} \u2192 ${formatFileSize(blob.size)} (${pct}% smaller)`
    : `${formatFileSize(file.size)} (no size reduction)`;
  showResult(blob, name, meta);
}

// ── Image Operations ──────────────────────────────────────────────
async function doCompressImage() {
  const file   = AppState.files[0];
  const format = document.getElementById('compress-format')?.value || 'jpeg';
  const name   = imageOutputFilename(file.name, format);

  // Use the blob already generated by the live preview (same blob the user sees)
  if (compressState.blob) {
    const saved = file.size - compressState.blob.size;
    const pct   = ((saved / file.size) * 100).toFixed(1);
    const meta  = saved > 0
      ? `${formatFileSize(file.size)} \u2192 ${formatFileSize(compressState.blob.size)} (${pct}% smaller)`
      : `${formatFileSize(file.size)} (no size reduction)`;
    showResult(compressState.blob, name, meta);
    return;
  }

  // Fallback: compress now
  const quality = parseInt(document.getElementById('compress-quality')?.value || '75') / 100;
  showProcessing('Compressing\u2026');
  const blob  = await compressImage(file, quality, format);
  const saved = file.size - blob.size;
  const pct   = ((saved / file.size) * 100).toFixed(1);
  const meta  = saved > 0
    ? `${formatFileSize(file.size)} \u2192 ${formatFileSize(blob.size)} (${pct}% smaller)`
    : `${formatFileSize(file.size)} (no size reduction)`;
  showResult(blob, name, meta);
}

async function doResizeImage() {
  const file   = AppState.files[0];
  const w      = document.getElementById('resize-w')?.value || '';
  const h      = document.getElementById('resize-h')?.value || '';
  const format = document.getElementById('resize-format')?.value || 'jpeg';

  if (!w && !h) {
    showToast('Please enter a width or height value.');
    return;
  }

  showProcessing('Resizing…');
  const blob = await resizeImage(file, w, h, true, format);
  const name = imageOutputFilename(file.name, format);
  showResult(blob, name);
}

async function doCropImage() {
  const file   = AppState.files[0];
  const format = document.getElementById('crop-format')?.value || 'jpeg';

  // Open crop modal
  const img = await loadImageFromFile(file);
  CropModal.open(img, async (x, y, w, h) => {
    showProcessing('Cropping…');
    try {
      const blob = await cropImage(file, x, y, w, h, format);
      const name = imageOutputFilename(file.name, format);
      showResult(blob, name, `${w}×${h}px`);
    } catch (e) {
      console.error(e);
      showToast("Couldn't crop the image. Please try again.");
      showView('workspace');
    }
  });
}

async function doConvertImage() {
  const file    = AppState.files[0];
  const format  = document.getElementById('convert-format')?.value || 'jpeg';
  const quality = parseInt(document.getElementById('convert-quality')?.value || '90') / 100;

  showProcessing('Converting…');
  const blob = await convertImageFormat(file, format, quality);
  const name = imageOutputFilename(file.name, format);
  showResult(blob, name);
}

async function doEnhanceImage() {
  const file       = AppState.files[0];
  const brightness = parseInt(document.getElementById('enh-brightness')?.value || '0');
  const contrast   = parseInt(document.getElementById('enh-contrast')?.value   || '0');
  const sharpen    = parseInt(document.getElementById('enh-sharpen')?.value    || '0');
  const gray       = document.getElementById('enh-grayscale')?.checked;
  const format     = document.getElementById('enh-format')?.value || 'jpeg';

  showProcessing('Enhancing image…');
  let blob;
  if (gray) {
    blob = await grayscaleImage(file, format, 0.92);
    const gFile = new File([blob], file.name, { type: `image/${format}` });
    blob = await enhanceImage(gFile, brightness, contrast, sharpen, format, 0.92);
  } else {
    blob = await enhanceImage(file, brightness, contrast, sharpen, format, 0.92);
  }
  const name = imageOutputFilename(file.name, format);
  showResult(blob, name);
}

async function doScanEnhance() {
  // Check if crop was done first
  if (_scanCropBounds) {
    const { x, y, w, h } = _scanCropBounds;
    showProcessing('Cropping & enhancing…');
    const file     = AppState.files[0];
    const croppedB = await cropImage(file, x, y, w, h, 'jpeg', 0.95);
    const croppedF = new File([croppedB], file.name, { type: 'image/jpeg' });
    await runScanEnhance(croppedF);
    _scanCropBounds = null;
  } else {
    await runScanEnhance(AppState.files[0]);
  }
}

// ── File Type Validation ──────────────────────────────────────────
function isFileTypeAllowed(file) {
  const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowed.includes(file.type) || file.name.endsWith('.pdf');
}

function isFileAllowed(file, toolKey) {
  const tool = TOOLS[toolKey];
  if (!tool) return false;
  if (tool.type === 'pdf') {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }
  if (tool.type === 'image') {
    return file.type.startsWith('image/');
  }
  return isFileTypeAllowed(file);
}
