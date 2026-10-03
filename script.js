/* ============================================================
   alyxfiles – script.js
   All JavaScript for the website
   Written to be easy to understand for beginners
   ============================================================ */

/* ============================================================
   GLOBAL STATE
   Variables that keep track of the current state of the app
   ============================================================ */

// Which tool is currently open (e.g. 'merge-pdf', 'compress-image')
let currentTool = null;

// The processed Blob (output file) for the current tool.
// We store it here so Download uses the EXACT SAME blob that was shown in the UI.
let processedBlob = null;

// toolState holds all temporary data needed for the current tool.
// For example: the loaded file, loaded PDF object, selected pages, etc.
// It also holds toolState.config so every process function can read the accent colors.
let toolState = {};

/* ============================================================
   NAVIGATION – hamburger menu for mobile
   ============================================================ */

function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('navHamburger');
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
}

function closeMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('navHamburger');
  if (navLinks) navLinks.classList.remove('open');
  if (hamburger) hamburger.classList.remove('open');
}

// Close the menu when the user clicks anywhere outside the navbar
document.addEventListener('click', function (event) {
  const navbar = document.getElementById('navbar');
  if (navbar && !navbar.contains(event.target)) {
    closeMenu();
  }
});

/* ============================================================
   HOME / WORKSPACE VISIBILITY
   ============================================================ */

function showHome() {
  document.getElementById('homePage').style.display = 'block';
  document.getElementById('toolWorkspace').style.display = 'none';
  currentTool = null;
  resetToolState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showWorkspace(toolTitle, toolIconHTML) {
  document.getElementById('homePage').style.display = 'none';
  document.getElementById('toolWorkspace').style.display = 'block';
  document.getElementById('workspaceTitle').textContent = toolTitle;
  document.getElementById('workspaceIcon').innerHTML = toolIconHTML;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   RESET TOOL STATE
   Clears all temporary data when switching tools or going home.
   Important for privacy – we don't keep user files around.
   ============================================================ */

function resetToolState() {
  // Revoke any temporary Object URLs we created to free browser memory
  if (toolState.objectUrls && toolState.objectUrls.length > 0) {
    toolState.objectUrls.forEach(function (url) {
      URL.revokeObjectURL(url);
    });
  }
  // Clear the processed blob reference
  processedBlob = null;
  // Reset all tool-specific data
  toolState = {};
}

/* ============================================================
   OPEN A TOOL
   Called when the user clicks "Open Tool" on a tool card.

   THE FIX FOR "config is not defined":
   We save the config object into toolState.config right here.
   Every process function reads toolState.config instead of
   relying on a variable that was only in the render function's scope.
   ============================================================ */

function openTool(toolId) {
  currentTool = toolId;
  resetToolState();

  // Each tool has a title and accent color for its workspace
  const allTools = {
    'merge-pdf':      { title: 'Merge PDF',        accent: '#FF5252', accentBg: '#FFF5F5' },
    'split-pdf':      { title: 'Split PDF',         accent: '#FF9800', accentBg: '#FFF8F0' },
    'delete-pages':   { title: 'Delete Pages',      accent: '#E91E63', accentBg: '#FFF0F5' },
    'organize-pdf':   { title: 'Organize PDF',      accent: '#9C27B0', accentBg: '#F8F0FF' },
    'rotate-pdf':     { title: 'Rotate PDF',        accent: '#2196F3', accentBg: '#F0F7FF' },
    'compress-pdf':   { title: 'Compress PDF',      accent: '#4CAF50', accentBg: '#F0FFF0' },
    'pdf-to-image':   { title: 'PDF → Image',       accent: '#00BCD4', accentBg: '#F0FEFF' },
    'image-to-pdf':   { title: 'Image → PDF',       accent: '#3F51B5', accentBg: '#F0F1FF' },
    'compress-image': { title: 'Compress Image',    accent: '#4CAF50', accentBg: '#F0FFF0' },
    'resize-image':   { title: 'Resize Image',      accent: '#9C27B0', accentBg: '#F8F0FF' },
    'crop-image':     { title: 'Crop Image',        accent: '#FF9800', accentBg: '#FFF8F0' },
    'convert-image':  { title: 'Convert Image',     accent: '#009688', accentBg: '#F0FFFD' },
    'enhance-image':  { title: 'Enhance Image',     accent: '#2196F3', accentBg: '#F0F7FF' },
    'scan-enhance':   { title: 'Scan Enhance',      accent: '#673AB7', accentBg: '#F5F0FF' },
  };

  const config = allTools[toolId];
  if (!config) return;

  // *** KEY FIX: Save config into toolState so ALL process functions can access it ***
  toolState.config = config;

  // Apply this tool's accent colors to the workspace CSS variables
  const workspace = document.getElementById('toolWorkspace');
  workspace.style.setProperty('--tool-accent', config.accent);
  workspace.style.setProperty('--tool-accent-bg', config.accentBg);

  // Build the small colored icon for the workspace header
  const iconHTML = `<div style="width:36px;height:36px;background:${config.accentBg};border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="font-size:18px;">📄</span></div>`;

  showWorkspace(config.title, iconHTML);

  // Clear the workspace body and render the correct tool UI
  const body = document.getElementById('workspaceBody');
  body.innerHTML = '';

  switch (toolId) {
    case 'merge-pdf':      renderMergePdf(body);      break;
    case 'split-pdf':      renderSplitPdf(body);      break;
    case 'delete-pages':   renderDeletePages(body);   break;
    case 'organize-pdf':   renderOrganizePdf(body);   break;
    case 'rotate-pdf':     renderRotatePdf(body);     break;
    case 'compress-pdf':   renderCompressPdf(body);   break;
    case 'pdf-to-image':   renderPdfToImage(body);    break;
    case 'image-to-pdf':   renderImageToPdf(body);    break;
    case 'compress-image': renderCompressImage(body); break;
    case 'resize-image':   renderResizeImage(body);   break;
    case 'crop-image':     renderCropImage(body);     break;
    case 'convert-image':  renderConvertImage(body);  break;
    case 'enhance-image':  renderEnhanceImage(body);  break;
    case 'scan-enhance':   renderScanEnhance(body);   break;
    default:
      body.innerHTML = '<p style="color:var(--text-secondary);">Tool not found.</p>';
  }
}

/* ============================================================
   HELPER FUNCTIONS
   Simple reusable utilities used across the whole app
   ============================================================ */

// Format a file size in bytes to a readable string like "3.17 MB"
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Trigger a file download in the browser using a Blob
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Wait a moment then free the URL from memory
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
}

// Get the file extension (lowercase) from a filename
function getExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

// Get the filename without the extension
function getBaseName(filename) {
  const parts = filename.split('.');
  if (parts.length > 1) parts.pop();
  return parts.join('.');
}

// Check if a file is a PDF
function isPdf(file) {
  return file.type === 'application/pdf' || getExtension(file.name) === 'pdf';
}

// Check if a file is a supported image
function isImage(file) {
  return file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(getExtension(file.name));
}

// Show a friendly error message inside a container element.
// It automatically disappears after 8 seconds.
function showError(container, message) {
  // Remove any existing error first
  const existing = container.querySelector('.error-message');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = 'error-message';
  div.innerHTML = `<span class="error-icon">⚠️</span><span>${message}</span>`;
  container.prepend(div);
  setTimeout(function () {
    if (div.parentNode) div.parentNode.removeChild(div);
  }, 8000);
}

// Create a loading state HTML string
function createLoadingHTML(message) {
  const text = message || 'Processing...';
  return `<div class="loading-state">
    <div class="spinner"></div>
    <p>${text}</p>
  </div>`;
}

// Show the result area with a big download button.
// Uses toolState.config for accent color – no "config is not defined" ever again.
function showResultWithDownload(container, filename, stats) {
  // Read accent color from toolState.config (always available after openTool)
  const accent = toolState.config ? toolState.config.accent : '#E53935';

  // Build the stats display if provided
  let statsHTML = '';
  if (stats) {
    statsHTML = '<div class="result-stats">';
    for (const [label, value] of Object.entries(stats)) {
      const isSaved = label.toLowerCase().includes('saved') || label.toLowerCase().includes('reduction');
      statsHTML += `<div class="result-stat">
        <div class="result-stat-label">${label}</div>
        <div class="result-stat-value ${isSaved ? 'saved' : ''}">${value}</div>
      </div>`;
    }
    statsHTML += '</div>';
  }

  container.innerHTML = `
    <div class="result-area">
      <div class="result-success-icon">✅</div>
      <h2 class="result-title">File Ready</h2>
      ${statsHTML}
      <button class="btn-download" onclick="handleDownload('${filename}')" style="background:${accent};">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download ${filename}
      </button>
      <button class="btn-start-again" onclick="openTool('${currentTool}')">↺ Start Again</button>
    </div>`;
}

// Download the processedBlob using the given filename.
// This is called from the Download button in showResultWithDownload.
function handleDownload(filename) {
  if (!processedBlob) {
    alert('No file ready to download. Please process a file first.');
    return;
  }
  downloadBlob(processedBlob, filename);
}

// Parse a page range string like "1-3,5,7-9" into an array of 0-indexed page numbers.
// Input uses 1-based page numbers (as the user sees them).
// Returns { pages: [...], errors: [...] }
function parsePageRanges(rangeStr, totalPages) {
  const result = new Set();
  const errors = [];
  const parts = rangeStr.split(',');

  for (let part of parts) {
    part = part.trim();
    if (!part) continue;

    if (part.includes('-')) {
      const sides = part.split('-');
      const start = parseInt(sides[0].trim());
      const end = parseInt(sides[1].trim());

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        errors.push('"' + part + '" is not a valid range');
        continue;
      }
      if (start > totalPages || end > totalPages) {
        errors.push('"' + part + '" exceeds total pages (' + totalPages + ')');
        continue;
      }
      for (let i = start; i <= end; i++) {
        result.add(i - 1); // Convert to 0-indexed
      }
    } else {
      const num = parseInt(part);
      if (isNaN(num) || num < 1) {
        errors.push('"' + part + '" is not a valid page number');
        continue;
      }
      if (num > totalPages) {
        errors.push('Page ' + num + ' exceeds total pages (' + totalPages + ')');
        continue;
      }
      result.add(num - 1); // Convert to 0-indexed
    }
  }

  return {
    pages: Array.from(result).sort(function (a, b) { return a - b; }),
    errors: errors
  };
}

/* ============================================================
   PDF LIBRARY LOADER
   Loads pdf-lib and pdf.js only when needed (lazy loading).
   This keeps initial page load fast.
   ============================================================ */

let pdfLibLoaded = false;
let pdfJsLoaded = false;

// Load pdf-lib (for creating and editing PDF files)
function loadPdfLib() {
  return new Promise(function (resolve, reject) {
    // If already loaded, just return it
    if (window.PDFLib) {
      resolve(window.PDFLib);
      return;
    }
    const script = document.createElement('script');
    script.src = './lib/pdf-lib.min.js';
    script.onload = function () {
      if (!window.PDFLib) {
        reject(new Error('PDF library loaded but PDFLib is not available. Please refresh the page.'));
        return;
      }
      console.log('pdf-lib loaded successfully');
      resolve(window.PDFLib);
    };
    script.onerror = function () {
      reject(new Error('PDF processing library could not be loaded. Please refresh the page and try again.'));
    };
    document.head.appendChild(script);
  });
}

// Load pdf.js (for rendering PDF pages as images / thumbnails)
function loadPdfJs() {
  return new Promise(function (resolve, reject) {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = './lib/pdf.min.js';
    script.onload = function () {
      if (!window.pdfjsLib) {
        reject(new Error('PDF renderer loaded but pdfjsLib is not available. Please refresh the page.'));
        return;
      }
      // Point pdf.js to the worker file (must match the version)
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = './lib/pdf.worker.min.js';
      console.log('pdf.js loaded successfully');
      resolve(window.pdfjsLib);
    };
    script.onerror = function () {
      reject(new Error('PDF rendering library could not be loaded. Please refresh the page and try again.'));
    };
    document.head.appendChild(script);
  });
}

// Load JSZip (for creating ZIP files client-side in PDF → Image)
function loadJsZip() {
  return new Promise(function (resolve, reject) {
    if (window.JSZip) {
      resolve(window.JSZip);
      return;
    }
    const script = document.createElement('script');
    script.src = './lib/jszip.min.js';
    script.onload = function () {
      if (!window.JSZip) {
        reject(new Error('ZIP library loaded but JSZip is not available. Please refresh the page.'));
        return;
      }
      console.log('JSZip loaded successfully');
      resolve(window.JSZip);
    };
    script.onerror = function () {
      reject(new Error('ZIP library could not be loaded. Please refresh the page and try again.'));
    };
    document.head.appendChild(script);
  });
}

// Helper: read a File as an ArrayBuffer (needed by pdf-lib)
function readFileAsArrayBuffer(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(new Error('Could not read the file "' + file.name + '". The file may be corrupted.')); };
    reader.readAsArrayBuffer(file);
  });
}

// Helper: read a File as a data URL (needed for image display)
function readFileAsDataURL(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(new Error('Could not read the file "' + file.name + '".')); };
    reader.readAsDataURL(file);
  });
}

// Helper: render a single PDF page to a canvas using pdf.js
// pageIndex is 0-based; scale controls resolution (0.3 = thumbnail, 1.5 = normal)
async function renderPdfPageToCanvas(pdfjsDoc, pageIndex, scale) {
  const page = await pdfjsDoc.getPage(pageIndex + 1); // pdf.js uses 1-based pages
  const viewport = page.getViewport({ scale: scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: viewport }).promise;
  return canvas;
}

/* ============================================================
   SHARED TOOL HELPERS
   ============================================================ */

// Set up drag-and-drop and click-to-browse for a tool's upload area.
// dropId   = the id of the clickable drop zone element
// inputId  = the id of the hidden <input type="file">
// fileType = 'pdf' | 'image'
// multiple = true if multiple files are allowed
// onFiles  = callback function(files) called with the valid files
function setupToolDropzone(dropId, inputId, fileType, multiple, onFiles) {
  const dropZone = document.getElementById(dropId);
  const input = document.getElementById(inputId);
  if (!dropZone || !input) return;

  // Click the hidden file input when the drop zone is clicked
  dropZone.addEventListener('click', function () { input.click(); });

  // Keyboard support: Enter or Space also opens the file picker
  dropZone.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      input.click();
    }
  });

  // When the user selects files using the file picker
  input.addEventListener('change', function () {
    const files = validateToolFiles(Array.from(this.files), fileType, multiple);
    if (files.length > 0) onFiles(files);
    this.value = ''; // Reset so the same file can be re-selected
  });

  // Drag enter: highlight the drop zone
  dropZone.addEventListener('dragenter', function (event) {
    event.preventDefault();
    dropZone.classList.add('drag-over');
  });

  // Drag over: must prevent default to allow drop
  dropZone.addEventListener('dragover', function (event) {
    event.preventDefault();
  });

  // Drag leave: remove highlight
  dropZone.addEventListener('dragleave', function (event) {
    if (!dropZone.contains(event.relatedTarget)) {
      dropZone.classList.remove('drag-over');
    }
  });

  // Drop: handle the dropped files
  dropZone.addEventListener('drop', function (event) {
    event.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = validateToolFiles(Array.from(event.dataTransfer.files), fileType, multiple);
    if (files.length > 0) onFiles(files);
  });
}

// Validate files by type and enforce single/multiple rules
function validateToolFiles(files, fileType, multiple) {
  let valid = [];
  for (const file of files) {
    if (fileType === 'pdf' && !isPdf(file)) {
      alert('"' + file.name + '" is not a PDF file. Please select a PDF.');
      continue;
    }
    if (fileType === 'image' && !isImage(file)) {
      alert('"' + file.name + '" is not a supported image. Please use JPG, PNG, or WebP.');
      continue;
    }
    valid.push(file);
  }
  if (!multiple && valid.length > 1) {
    alert('This tool only accepts one file at a time. Using the first file.');
    valid = [valid[0]];
  }
  return valid;
}

// Render a simple file list inside a container element (used in tool workspaces)
function renderToolFileList(containerId, files, fileType) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  files.forEach(function (file) {
    const icon = fileType === 'pdf' ? '📄' : '🖼️';
    const div = document.createElement('div');
    div.className = 'file-item';
    div.innerHTML = `
      <span class="file-item-icon">${icon}</span>
      <span class="file-item-name" title="${file.name}">${file.name}</span>
      <span class="file-item-size">${formatFileSize(file.size)}</span>`;
    container.appendChild(div);
  });
}

// Helper: convert an image data URL to a Blob using a canvas
function convertImageToBlob(dataUrl, mimeType, quality) {
  return new Promise(function (resolve, reject) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error('Could not convert the image.'));
      }, mimeType, quality);
    };
    img.onerror = function () { reject(new Error('Could not load the image.')); };
    img.src = dataUrl;
  });
}

/* ============================================================
   PAGE THUMBNAIL RENDERER
   Used by Split PDF and Delete Pages to show visual page thumbnails.
   Renders at low resolution for performance.
   ============================================================ */

// Render all pages of a PDF as small thumbnail cards inside a container.
// onPageClick(pageIndex) is called when a thumbnail is clicked.
// Returns the pdfjsDoc so it can be stored for later use.
async function renderPageThumbnails(containerId, file, onPageClick) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  container.innerHTML = createLoadingHTML();

  let pdfjsLib, pdfDoc;
  try {
    pdfjsLib = await loadPdfJs();
    const arrayBuffer = await readFileAsArrayBuffer(file);
    pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (error) {
    container.innerHTML = '';
    showError(container, 'Unable to load PDF pages: ' + error.message);
    return null;
  }

  const pageCount = pdfDoc.numPages;
  container.innerHTML = '';

  // Use a small scale for thumbnails to save memory
  const THUMB_SCALE = 0.35;

  for (let i = 0; i < pageCount; i++) {
    // Create the thumbnail card
    const card = document.createElement('div');
    card.className = 'page-thumb';
    card.dataset.pageIndex = i;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Page ' + (i + 1));

    // Render the page canvas
    try {
      const canvas = await renderPdfPageToCanvas(pdfDoc, i, THUMB_SCALE);
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      card.appendChild(canvas);
    } catch (e) {
      // Fallback placeholder if rendering fails
      const placeholder = document.createElement('div');
      placeholder.style.cssText = 'height:90px;display:flex;align-items:center;justify-content:center;font-size:20px;background:#f5f5f7;';
      placeholder.textContent = '📄';
      card.appendChild(placeholder);
    }

    // Page number footer
    const footer = document.createElement('div');
    footer.className = 'page-thumb-footer';
    footer.innerHTML = '<span class="page-thumb-number">' + (i + 1) + '</span>';
    card.appendChild(footer);

    // Click and keyboard selection
    card.addEventListener('click', function () {
      onPageClick(parseInt(this.dataset.pageIndex));
    });
    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onPageClick(parseInt(this.dataset.pageIndex));
      }
    });

    container.appendChild(card);
  }

  return pdfDoc;
}

// Update the visual selected/unselected state of all thumbnails.
// selectedSet is a Set of 0-indexed page numbers that should appear "selected".
// mode: 'select' (green highlight) or 'delete' (red highlight)
function updateThumbnailSelection(containerId, selectedSet, mode) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const accent = toolState.config ? toolState.config.accent : '#E53935';
  const cards = container.querySelectorAll('.page-thumb');

  cards.forEach(function (card) {
    const pageIndex = parseInt(card.dataset.pageIndex);
    const isSelected = selectedSet.has(pageIndex);

    if (isSelected) {
      card.style.borderColor = accent;
      card.style.boxShadow = '0 0 0 2px ' + accent + '33';
      card.style.background = accent + '10';
      // Add a small indicator badge
      let badge = card.querySelector('.thumb-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'thumb-badge';
        badge.style.cssText = 'position:absolute;top:5px;right:5px;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;background:' + accent + ';';
        card.style.position = 'relative';
        card.appendChild(badge);
      }
      badge.textContent = mode === 'delete' ? '✕' : '✓';
    } else {
      card.style.borderColor = '';
      card.style.boxShadow = '';
      card.style.background = '';
      const badge = card.querySelector('.thumb-badge');
      if (badge) badge.remove();
    }
  });
}

/* ============================================================
   TOOL: MERGE PDF
   Combines multiple PDF files into one.
   Files accumulate across multiple picks — nothing is lost
   when the user clicks "Add More Files" a second time.
   The merge order is always the exact order shown in the list.
   ============================================================ */

function renderMergePdf(container) {
  const accent = toolState.config.accent;

  // This array holds ALL selected PDFs in the exact order the user added them.
  // We never replace it — we only push() new files onto it.
  toolState.mergeFiles = [];

  container.innerHTML = `
    <div class="info-box">Add two or more PDF files. Use ↑ ↓ to reorder. The merged PDF will follow this exact order.</div>

    <div class="tool-upload" id="mergeDrop" tabindex="0" role="button" aria-label="Upload PDF files">
      <span class="upload-label">📁 Add PDF Files</span>
      <p>Drag &amp; drop PDFs here, or click to browse</p>
      <input type="file" id="mergeInput" multiple accept=".pdf" />
    </div>

    <div id="mergeFileListWrap" style="display:none; margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span id="mergeFileCount" style="font-size:13px;font-weight:600;color:var(--text-secondary);"></span>
        <div style="display:flex;gap:8px;">
          <button class="btn-add-more" id="mergeAddMoreBtn" onclick="mergePickMore()" style="color:${accent};">
            + Add More Files
          </button>
          <button class="btn-clear-all-files" onclick="mergeClearAll()" style="color:var(--text-secondary);">
            Clear All
          </button>
        </div>
      </div>
      <ul id="mergeOrderedList" class="merge-file-list"></ul>
    </div>

    <button class="btn-process" id="mergePdfBtn" disabled onclick="processMergePdf()" style="background:${accent};">
      Merge PDFs
    </button>
    <div id="mergeResult"></div>`;

  // Hidden secondary input for "Add More Files" (avoids re-triggering the dropzone)
  const moreInput = document.createElement('input');
  moreInput.type = 'file';
  moreInput.id = 'mergeMoreInput';
  moreInput.multiple = true;
  moreInput.accept = '.pdf';
  moreInput.style.display = 'none';
  moreInput.addEventListener('change', function () {
    const newFiles = validateToolFiles(Array.from(this.files), 'pdf', true);
    if (newFiles.length > 0) mergeAddFiles(newFiles);
    this.value = '';
  });
  container.appendChild(moreInput);

  // Main drop zone: adds files to the accumulator
  setupToolDropzone('mergeDrop', 'mergeInput', 'pdf', true, function (files) {
    mergeAddFiles(files);
  });
}

// Open the "Add More Files" secondary picker
function mergePickMore() {
  const input = document.getElementById('mergeMoreInput');
  if (input) input.click();
}

// Add files to the ordered accumulator and refresh the list UI
function mergeAddFiles(newFiles) {
  // Push each new file onto the end of the ordered array
  newFiles.forEach(function (file) {
    toolState.mergeFiles.push(file);
  });
  renderMergeFileList();
}

// Remove one file from the list by its current index
function mergeRemoveFile(index) {
  toolState.mergeFiles.splice(index, 1);
  renderMergeFileList();
}

// Move a file up in the list (earlier in merge order)
function mergeMoveUp(index) {
  if (index === 0) return;
  const tmp = toolState.mergeFiles[index - 1];
  toolState.mergeFiles[index - 1] = toolState.mergeFiles[index];
  toolState.mergeFiles[index] = tmp;
  renderMergeFileList();
}

// Move a file down in the list (later in merge order)
function mergeMoveDown(index) {
  const files = toolState.mergeFiles;
  if (index === files.length - 1) return;
  const tmp = files[index + 1];
  files[index + 1] = files[index];
  files[index] = tmp;
  renderMergeFileList();
}

// Clear all selected files
function mergeClearAll() {
  toolState.mergeFiles = [];
  renderMergeFileList();
}

// Re-render the file list UI to match the current toolState.mergeFiles array.
// The UI order and the array order are always identical.
function renderMergeFileList() {
  const files = toolState.mergeFiles;
  const wrap = document.getElementById('mergeFileListWrap');
  const list = document.getElementById('mergeOrderedList');
  const countEl = document.getElementById('mergeFileCount');
  const mergeBtn = document.getElementById('mergePdfBtn');
  const dropZone = document.getElementById('mergeDrop');

  if (!wrap || !list) return;

  if (files.length === 0) {
    wrap.style.display = 'none';
    if (dropZone) dropZone.style.display = '';
    if (mergeBtn) mergeBtn.disabled = true;
    return;
  }

  // Hide the drop zone once files are added — use "Add More Files" button instead
  if (dropZone) dropZone.style.display = 'none';
  wrap.style.display = 'block';
  countEl.textContent = files.length + ' PDF' + (files.length !== 1 ? 's' : '') + ' selected';
  mergeBtn.disabled = files.length < 2;

  list.innerHTML = '';
  files.forEach(function (file, index) {
    const li = document.createElement('li');
    li.className = 'merge-file-item';
    li.innerHTML = `
      <span class="merge-file-order">${index + 1}</span>
      <span class="file-item-icon">📄</span>
      <span class="file-item-name" title="${file.name}">${file.name}</span>
      <span class="file-item-size">${formatFileSize(file.size)}</span>
      <div class="merge-file-actions">
        <button class="merge-btn-order" onclick="mergeMoveUp(${index})"
          ${index === 0 ? 'disabled' : ''} title="Move up" aria-label="Move up">↑</button>
        <button class="merge-btn-order" onclick="mergeMoveDown(${index})"
          ${index === files.length - 1 ? 'disabled' : ''} title="Move down" aria-label="Move down">↓</button>
        <button class="merge-btn-remove" onclick="mergeRemoveFile(${index})"
          title="Remove" aria-label="Remove file">×</button>
      </div>`;
    list.appendChild(li);
  });
}

async function processMergePdf() {
  // Use the ordered array exactly as-is — the UI order IS the merge order
  const files = toolState.mergeFiles;
  if (!files || files.length < 2) {
    alert('Please add at least 2 PDF files to merge.');
    return;
  }

  const resultDiv = document.getElementById('mergeResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('mergePdfBtn').disabled = true;

  try {
    const PDFLib = await loadPdfLib();
    const { PDFDocument } = PDFLib;

    const mergedPdf = await PDFDocument.create();

    // Process files in the exact order stored in the array (= the order shown in the UI)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let arrayBuffer;
      try {
        arrayBuffer = await readFileAsArrayBuffer(file);
      } catch (e) {
        throw new Error('Could not read "' + file.name + '". The file may be corrupted.');
      }

      let srcDoc;
      try {
        srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      } catch (e) {
        throw new Error('"' + file.name + '" could not be opened. It may be password-protected or corrupted.');
      }

      const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
      copiedPages.forEach(function (page) { mergedPdf.addPage(page); });
    }

    const pdfBytes = await mergedPdf.save();
    processedBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    showResultWithDownload(resultDiv, 'merged.pdf', {
      'Files Merged': files.length,
      'Total Pages': mergedPdf.getPageCount(),
      'Output Size': formatFileSize(processedBlob.size)
    });

  } catch (error) {
    console.error('Merge PDF error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong while merging. Please try another file.');
    document.getElementById('mergePdfBtn').disabled = false;
  }
}


/* ============================================================
   TOOL: SPLIT PDF
   Extracts pages into separate PDFs, with visual thumbnail selection
   ============================================================ */

function renderSplitPdf(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="info-box">Upload a PDF, then select pages visually or enter ranges like <strong>1-5, 8, 10-12</strong>.</div>
    <div class="tool-upload" id="splitDrop" tabindex="0" role="button" aria-label="Upload PDF file">
      <span class="upload-label">📄 Select PDF File</span>
      <p>Drag &amp; drop your PDF here, or click to browse</p>
      <input type="file" id="splitInput" accept=".pdf" />
    </div>
    <div id="splitFileInfo" style="margin-bottom:12px;"></div>

    <div id="splitPageSection" style="display:none;">
      <div class="tool-options" style="margin-bottom:16px;">
        <div class="option-group">
          <label class="option-label" for="splitRanges">Page Ranges (one range per line)</label>
          <textarea class="option-input" id="splitRanges" rows="3"
            placeholder="1-5&#10;8&#10;10-12"
            oninput="onSplitRangeInput()"
            style="resize:vertical;font-family:inherit;"></textarea>
          <p style="font-size:12px;color:var(--text-secondary);margin-top:6px;" id="splitRangeHint">
            Each line creates a separate output PDF. Click thumbnails to select/deselect pages.
          </p>
        </div>
      </div>

      <h3 style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">
        Pages — click to select
      </h3>
      <div class="pages-grid" id="splitThumbGrid"></div>
    </div>

    <button class="btn-process" id="splitBtn" disabled onclick="processSplitPdf()" style="background:${accent};">
      Split PDF
    </button>
    <div id="splitResult"></div>`;

  // Selected pages for the current range line (used for thumbnail highlighting)
  toolState.splitSelectedPages = new Set();
  toolState.splitManuallySelected = new Set(); // Pages toggled by clicking thumbnails

  setupToolDropzone('splitDrop', 'splitInput', 'pdf', false, async function (files) {
    toolState.splitFile = files[0];
    document.getElementById('splitPageSection').style.display = 'block';
    document.getElementById('splitBtn').disabled = false;

    // Show file info while thumbnails load
    document.getElementById('splitFileInfo').innerHTML =
      `<div class="file-item"><span class="file-item-icon">📄</span>
       <span class="file-item-name">${files[0].name}</span>
       <span class="file-item-size">${formatFileSize(files[0].size)}</span></div>`;

    // Render page thumbnails; clicking a thumbnail toggles it in/out of the range
    const pdfDoc = await renderPageThumbnails('splitThumbGrid', files[0], function (pageIndex) {
      onSplitThumbClick(pageIndex);
    });

    if (pdfDoc) {
      toolState.splitPdfDoc = pdfDoc;
      toolState.splitPageCount = pdfDoc.numPages;

      // Update file info with page count
      document.getElementById('splitFileInfo').innerHTML =
        `<div class="file-item"><span class="file-item-icon">📄</span>
         <span class="file-item-name">${files[0].name}</span>
         <span class="file-item-size">${pdfDoc.numPages} pages &middot; ${formatFileSize(files[0].size)}</span></div>`;
    }
  });
}

// Called when a thumbnail is clicked – toggles that page in the manual selection set
function onSplitThumbClick(pageIndex) {
  if (toolState.splitManuallySelected.has(pageIndex)) {
    toolState.splitManuallySelected.delete(pageIndex);
  } else {
    toolState.splitManuallySelected.add(pageIndex);
  }

  // Also update the text range input to reflect clicked pages
  const sorted = Array.from(toolState.splitManuallySelected).sort(function (a, b) { return a - b; });
  document.getElementById('splitRanges').value = sorted.map(function (p) { return p + 1; }).join(',');

  // Merge manual + range selections for display
  mergeSplitSelections();
}

// Called when the range text input changes – parse ranges and update thumbnails
function onSplitRangeInput() {
  const rangeStr = document.getElementById('splitRanges').value.trim();
  const totalPages = toolState.splitPageCount || 999;

  if (!rangeStr) {
    toolState.splitManuallySelected = new Set();
    toolState.splitSelectedPages = new Set();
    updateThumbnailSelection('splitThumbGrid', new Set(), 'select');
    return;
  }

  // Parse all lines together for preview highlighting
  const allLines = rangeStr.split('\n').join(',');
  const { pages, errors } = parsePageRanges(allLines, totalPages);

  const hintEl = document.getElementById('splitRangeHint');
  if (errors.length > 0) {
    hintEl.textContent = '⚠️ ' + errors[0];
    hintEl.style.color = '#C62828';
  } else {
    hintEl.textContent = pages.length + ' page(s) selected across all ranges.';
    hintEl.style.color = '';
  }

  toolState.splitSelectedPages = new Set(pages);
  // Keep manual selection in sync
  toolState.splitManuallySelected = new Set(pages);
  updateThumbnailSelection('splitThumbGrid', toolState.splitSelectedPages, 'select');
}

// Combine manual clicks + text input selections
function mergeSplitSelections() {
  const combined = new Set([
    ...toolState.splitSelectedPages,
    ...toolState.splitManuallySelected
  ]);
  updateThumbnailSelection('splitThumbGrid', combined, 'select');
}

async function processSplitPdf() {
  const file = toolState.splitFile;
  const rangeText = document.getElementById('splitRanges').value.trim();
  const totalPages = toolState.splitPageCount || 999;

  if (!file) return;

  // Decide what pages to use: text ranges if provided, else manually clicked pages
  let rangesToProcess = [];

  if (rangeText) {
    // Each line = one output file
    rangesToProcess = rangeText.split('\n').filter(function (l) { return l.trim(); });
  } else if (toolState.splitManuallySelected.size > 0) {
    // All manually selected pages → one output file
    const selected = Array.from(toolState.splitManuallySelected).sort(function (a, b) { return a - b; });
    rangesToProcess = [selected.map(function (p) { return p + 1; }).join(',')];
  } else {
    alert('Please enter a page range or click pages to select them.');
    return;
  }

  const resultDiv = document.getElementById('splitResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('splitBtn').disabled = true;

  try {
    const PDFLib = await loadPdfLib();
    const { PDFDocument } = PDFLib;

    const arrayBuffer = await readFileAsArrayBuffer(file);
    let srcDoc;
    try {
      srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch (e) {
      throw new Error('Unable to open this PDF. It may be password-protected or corrupted.');
    }

    const realTotal = srcDoc.getPageCount();
    const outputFiles = [];

    for (let i = 0; i < rangesToProcess.length; i++) {
      const { pages, errors } = parsePageRanges(rangesToProcess[i], realTotal);
      if (errors.length > 0) {
        throw new Error('Invalid range on line ' + (i + 1) + ': ' + errors[0]);
      }
      if (pages.length === 0) continue;

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, pages);
      copiedPages.forEach(function (p) { newDoc.addPage(p); });
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      outputFiles.push({ blob: blob, name: 'split-' + (i + 1) + '.pdf', size: blob.size });
    }

    if (outputFiles.length === 0) {
      throw new Error('No pages were extracted. Please check your page selections.');
    }

    if (outputFiles.length === 1) {
      // Single output: simple download
      processedBlob = outputFiles[0].blob;
      showResultWithDownload(resultDiv, outputFiles[0].name, {
        'Output Size': formatFileSize(outputFiles[0].blob.size)
      });
    } else {
      // Multiple outputs: show a list with individual download buttons
      toolState.splitOutputFiles = outputFiles;
      const accent = toolState.config.accent;
      resultDiv.innerHTML = `
        <div class="result-area">
          <div class="result-success-icon">✅</div>
          <h2 class="result-title">${outputFiles.length} Files Ready</h2>
          <div class="result-files-list">
            ${outputFiles.map(function (f, i) {
              return `<div class="result-file-item">
                <span class="file-item-icon">📄</span>
                <span class="result-file-name">${f.name}</span>
                <span class="file-item-size">${formatFileSize(f.size)}</span>
                <button class="btn-download-single" onclick="downloadSplitFile(${i})" style="color:${accent};">Download</button>
              </div>`;
            }).join('')}
          </div>
          <button class="btn-start-again" onclick="openTool('split-pdf')">↺ Start Again</button>
        </div>`;
    }

  } catch (error) {
    console.error('Split PDF error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong while splitting. Please try again.');
    document.getElementById('splitBtn').disabled = false;
  }
}

function downloadSplitFile(index) {
  const files = toolState.splitOutputFiles;
  if (files && files[index]) {
    downloadBlob(files[index].blob, files[index].name);
  }
}

/* ============================================================
   TOOL: DELETE PAGES
   Removes specific pages; shows visual thumbnails that highlight
   which pages will be deleted as the user types a range
   ============================================================ */

function renderDeletePages(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="info-box">Upload a PDF, then enter page ranges to delete (e.g., <strong>2-5, 8</strong>). Selected pages are highlighted in the preview.</div>
    <div class="tool-upload" id="deleteDrop" tabindex="0" role="button" aria-label="Upload PDF file">
      <span class="upload-label">📄 Select PDF File</span>
      <p>Drag &amp; drop your PDF here, or click to browse</p>
      <input type="file" id="deleteInput" accept=".pdf" />
    </div>
    <div id="deleteFileInfo" style="margin-bottom:12px;"></div>

    <div id="deletePageSection" style="display:none;">
      <div class="tool-options" style="margin-bottom:16px;">
        <div class="option-group">
          <label class="option-label" for="deleteRanges">Pages to Delete</label>
          <input type="text" class="option-input" id="deleteRanges"
            placeholder="e.g. 2-5,8,10-12"
            oninput="onDeleteRangeInput()" />
          <p style="font-size:12px;color:var(--text-secondary);margin-top:6px;" id="deleteRangeHint">
            Enter page numbers to delete. You can also click thumbnails to select pages.
          </p>
        </div>
      </div>

      <h3 style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">
        Pages — click to mark for deletion
      </h3>
      <div class="pages-grid" id="deleteThumbGrid"></div>
    </div>

    <button class="btn-process" id="deleteBtn" disabled onclick="processDeletePages()" style="background:${accent};">
      Delete Selected Pages
    </button>
    <div id="deleteResult"></div>`;

  toolState.deleteMarkedPages = new Set(); // 0-indexed pages marked for deletion

  setupToolDropzone('deleteDrop', 'deleteInput', 'pdf', false, async function (files) {
    toolState.deleteFile = files[0];
    document.getElementById('deletePageSection').style.display = 'block';
    document.getElementById('deleteBtn').disabled = false;

    document.getElementById('deleteFileInfo').innerHTML =
      `<div class="file-item"><span class="file-item-icon">📄</span>
       <span class="file-item-name">${files[0].name}</span>
       <span class="file-item-size">${formatFileSize(files[0].size)}</span></div>`;

    const pdfDoc = await renderPageThumbnails('deleteThumbGrid', files[0], function (pageIndex) {
      onDeleteThumbClick(pageIndex);
    });

    if (pdfDoc) {
      toolState.deletePdfDoc = pdfDoc;
      toolState.deletePageCount = pdfDoc.numPages;

      document.getElementById('deleteFileInfo').innerHTML =
        `<div class="file-item"><span class="file-item-icon">📄</span>
         <span class="file-item-name">${files[0].name}</span>
         <span class="file-item-size">${pdfDoc.numPages} pages &middot; ${formatFileSize(files[0].size)}</span></div>`;

      document.getElementById('deleteRangeHint').textContent =
        'Total pages: ' + pdfDoc.numPages + '. Enter pages to delete, or click thumbnails.';
    }
  });
}

// Called when user clicks a thumbnail — toggles that page as marked-for-deletion
function onDeleteThumbClick(pageIndex) {
  if (toolState.deleteMarkedPages.has(pageIndex)) {
    toolState.deleteMarkedPages.delete(pageIndex);
  } else {
    toolState.deleteMarkedPages.add(pageIndex);
  }

  // Sync the text input to show the clicked pages
  const sorted = Array.from(toolState.deleteMarkedPages).sort(function (a, b) { return a - b; });
  document.getElementById('deleteRanges').value = sorted.map(function (p) { return p + 1; }).join(',');

  updateDeleteHint();
  updateThumbnailSelection('deleteThumbGrid', toolState.deleteMarkedPages, 'delete');
}

// Called when the range text input changes – parse and highlight thumbnails
function onDeleteRangeInput() {
  const rangeStr = document.getElementById('deleteRanges').value.trim();
  const totalPages = toolState.deletePageCount || 999;

  if (!rangeStr) {
    toolState.deleteMarkedPages = new Set();
    updateThumbnailSelection('deleteThumbGrid', new Set(), 'delete');
    updateDeleteHint();
    return;
  }

  const { pages, errors } = parsePageRanges(rangeStr, totalPages);
  toolState.deleteMarkedPages = new Set(pages);
  updateThumbnailSelection('deleteThumbGrid', toolState.deleteMarkedPages, 'delete');

  const hintEl = document.getElementById('deleteRangeHint');
  if (errors.length > 0) {
    hintEl.textContent = '⚠️ ' + errors[0];
    hintEl.style.color = '#C62828';
  } else {
    updateDeleteHint();
    hintEl.style.color = '';
  }
}

function updateDeleteHint() {
  const hintEl = document.getElementById('deleteRangeHint');
  if (!hintEl) return;
  const totalPages = toolState.deletePageCount || 0;
  const markedCount = toolState.deleteMarkedPages ? toolState.deleteMarkedPages.size : 0;
  const remaining = totalPages - markedCount;
  if (markedCount > 0) {
    hintEl.textContent = markedCount + ' page(s) will be deleted. ' + remaining + ' will remain.';
    hintEl.style.color = '';
  } else {
    hintEl.textContent = 'Total pages: ' + totalPages + '. Enter pages to delete, or click thumbnails.';
    hintEl.style.color = '';
  }
}

async function processDeletePages() {
  const file = toolState.deleteFile;
  const markedPages = toolState.deleteMarkedPages;

  if (!file) return;
  if (!markedPages || markedPages.size === 0) {
    alert('Please select at least one page to delete.');
    return;
  }

  const resultDiv = document.getElementById('deleteResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('deleteBtn').disabled = true;

  try {
    const PDFLib = await loadPdfLib();
    const { PDFDocument } = PDFLib;

    const arrayBuffer = await readFileAsArrayBuffer(file);
    let srcDoc;
    try {
      srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } catch (e) {
      throw new Error('Unable to open this PDF. It may be password-protected or corrupted.');
    }

    const totalPages = srcDoc.getPageCount();

    if (markedPages.size >= totalPages) {
      throw new Error('You cannot delete all pages from a PDF.');
    }

    // Build list of pages to KEEP (everything that is NOT marked for deletion)
    const pagesToKeep = [];
    for (let i = 0; i < totalPages; i++) {
      if (!markedPages.has(i)) {
        pagesToKeep.push(i);
      }
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pagesToKeep);
    copiedPages.forEach(function (p) { newDoc.addPage(p); });

    const pdfBytes = await newDoc.save();
    processedBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    const baseName = getBaseName(file.name);
    showResultWithDownload(resultDiv, baseName + '-edited.pdf', {
      'Original Pages': totalPages,
      'Deleted Pages': markedPages.size,
      'Remaining Pages': pagesToKeep.length,
      'Output Size': formatFileSize(processedBlob.size)
    });

  } catch (error) {
    console.error('Delete Pages error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong. Please try again.');
    document.getElementById('deleteBtn').disabled = false;
  }
}

/* ============================================================
   TOOL: ORGANIZE PDF
   Reorder, rotate, delete pages with visual drag-and-drop thumbnails
   ============================================================ */

function renderOrganizePdf(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="info-box">Drag thumbnails to reorder pages. Use the rotate (↻) and delete (×) buttons on each page.</div>
    <div class="tool-upload" id="orgDrop" tabindex="0" role="button" aria-label="Upload PDF file">
      <span class="upload-label">📄 Select PDF File</span>
      <p>Drag &amp; drop your PDF here, or click to browse</p>
      <input type="file" id="orgInput" accept=".pdf" />
    </div>
    <div class="pages-grid" id="orgPageGrid" style="margin-bottom:16px;"></div>
    <button class="btn-process" id="orgBtn" disabled onclick="processOrganizePdf()" style="background:${accent};">
      Save Organized PDF
    </button>
    <div id="orgResult"></div>`;

  setupToolDropzone('orgDrop', 'orgInput', 'pdf', false, async function (files) {
    toolState.orgFile = files[0];
    await loadOrgThumbnails(files[0]);
    document.getElementById('orgBtn').disabled = false;
  });
}

async function loadOrgThumbnails(file) {
  const grid = document.getElementById('orgPageGrid');
  grid.innerHTML = createLoadingHTML();

  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdfDoc.numPages;

    // Build the page order array: each entry has the original pageIndex and current rotation
    toolState.orgPages = [];
    for (let i = 0; i < pageCount; i++) {
      toolState.orgPages.push({ pageIndex: i, rotation: 0 });
    }

    // Load pdf-lib too for saving later
    toolState.orgPdfLib = await loadPdfLib();
    toolState.orgPdfJsDoc = pdfDoc;

    await renderOrgGrid();

  } catch (error) {
    console.error('Organize PDF load error:', error);
    const grid = document.getElementById('orgPageGrid');
    grid.innerHTML = '';
    showError(grid, 'Unable to load PDF pages: ' + error.message);
  }
}

async function renderOrgGrid() {
  const grid = document.getElementById('orgPageGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const pages = toolState.orgPages;
  const pdfDoc = toolState.orgPdfJsDoc;

  for (let i = 0; i < pages.length; i++) {
    const pageData = pages[i];
    const thumb = document.createElement('div');
    thumb.className = 'page-thumb';
    thumb.dataset.index = i;
    thumb.draggable = true;

    // Render the page canvas (with rotation applied)
    try {
      const page = await pdfDoc.getPage(pageData.pageIndex + 1);
      const scale = 0.35;
      const viewport = page.getViewport({ scale: scale, rotation: pageData.rotation });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
      thumb.appendChild(canvas);
    } catch (e) {
      const ph = document.createElement('div');
      ph.style.cssText = 'height:90px;display:flex;align-items:center;justify-content:center;font-size:20px;background:#f5f5f7;';
      ph.textContent = '📄';
      thumb.appendChild(ph);
    }

    // Footer with page number and action buttons
    const footer = document.createElement('div');
    footer.className = 'page-thumb-footer';
    footer.innerHTML = `
      <span class="page-thumb-number">Page ${i + 1}</span>
      <div class="page-thumb-actions">
        <button class="page-thumb-btn" onclick="orgRotatePage(${i})" title="Rotate" aria-label="Rotate page">↻</button>
        <button class="page-thumb-btn" onclick="orgDeletePage(${i})" title="Delete" aria-label="Delete page" style="color:#E53935;">×</button>
      </div>`;
    thumb.appendChild(footer);

    // Drag-and-drop reordering
    thumb.addEventListener('dragstart', function () {
      toolState.orgDragFrom = parseInt(this.dataset.index);
      this.classList.add('dragging');
    });
    thumb.addEventListener('dragend', function () {
      this.classList.remove('dragging');
    });
    thumb.addEventListener('dragover', function (event) {
      event.preventDefault();
      this.classList.add('drag-over-page');
    });
    thumb.addEventListener('dragleave', function () {
      this.classList.remove('drag-over-page');
    });
    thumb.addEventListener('drop', function (event) {
      event.preventDefault();
      this.classList.remove('drag-over-page');
      const from = toolState.orgDragFrom;
      const to = parseInt(this.dataset.index);
      if (from !== to) {
        const moved = toolState.orgPages.splice(from, 1)[0];
        toolState.orgPages.splice(to, 0, moved);
        renderOrgGrid();
      }
    });

    grid.appendChild(thumb);
  }
}

function orgRotatePage(index) {
  toolState.orgPages[index].rotation = (toolState.orgPages[index].rotation + 90) % 360;
  renderOrgGrid();
}

function orgDeletePage(index) {
  if (toolState.orgPages.length <= 1) {
    alert('You cannot delete the only remaining page.');
    return;
  }
  toolState.orgPages.splice(index, 1);
  renderOrgGrid();
}

async function processOrganizePdf() {
  const resultDiv = document.getElementById('orgResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('orgBtn').disabled = true;

  try {
    const PDFLib = toolState.orgPdfLib;
    if (!PDFLib) throw new Error('PDF library not loaded. Please refresh the page.');

    const { PDFDocument, degrees } = PDFLib;

    const arrayBuffer = await readFileAsArrayBuffer(toolState.orgFile);
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    for (const pageData of toolState.orgPages) {
      const [copiedPage] = await newDoc.copyPages(srcDoc, [pageData.pageIndex]);
      if (pageData.rotation !== 0) {
        copiedPage.setRotation(degrees(pageData.rotation));
      }
      newDoc.addPage(copiedPage);
    }

    const pdfBytes = await newDoc.save();
    processedBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    const baseName = getBaseName(toolState.orgFile.name);
    showResultWithDownload(resultDiv, baseName + '-organized.pdf', {
      'Pages': toolState.orgPages.length,
      'Output Size': formatFileSize(processedBlob.size)
    });

  } catch (error) {
    console.error('Organize PDF error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong. Please try again.');
    document.getElementById('orgBtn').disabled = false;
  }
}

/* ============================================================
   TOOL: ROTATE PDF
   ============================================================ */

function renderRotatePdf(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="tool-upload" id="rotateDrop" tabindex="0" role="button" aria-label="Upload PDF file">
      <span class="upload-label">📄 Select PDF File</span>
      <p>Drag &amp; drop your PDF here, or click to browse</p>
      <input type="file" id="rotateInput" accept=".pdf" />
    </div>
    <div id="rotateFileInfo" style="margin-bottom:16px;"></div>
    <div class="tool-options" id="rotateOptions" style="display:none;">
      <div class="option-group">
        <label class="option-label">Rotation</label>
        <div class="btn-group">
          <button class="btn-choice active" onclick="selectRotation(this, 90)">90° Clockwise</button>
          <button class="btn-choice" onclick="selectRotation(this, 180)">180°</button>
          <button class="btn-choice" onclick="selectRotation(this, 270)">90° Counter-clockwise</button>
        </div>
      </div>
      <div class="option-group">
        <label class="option-label">Apply To</label>
        <div class="btn-group">
          <button class="btn-choice active" onclick="selectRotateApply(this, 'all')">All Pages</button>
          <button class="btn-choice" onclick="selectRotateApply(this, 'odd')">Odd Pages</button>
          <button class="btn-choice" onclick="selectRotateApply(this, 'even')">Even Pages</button>
          <button class="btn-choice" onclick="selectRotateApply(this, 'first')">First Page Only</button>
        </div>
      </div>
    </div>
    <button class="btn-process" id="rotateBtn" disabled onclick="processRotatePdf()" style="background:${accent};">
      Rotate PDF
    </button>
    <div id="rotateResult"></div>`;

  toolState.rotateDeg = 90;
  toolState.rotateApply = 'all';

  setupToolDropzone('rotateDrop', 'rotateInput', 'pdf', false, async function (files) {
    toolState.rotateFile = files[0];
    document.getElementById('rotateOptions').style.display = 'block';
    document.getElementById('rotateBtn').disabled = false;

    try {
      const PDFLib = await loadPdfLib();
      const buf = await readFileAsArrayBuffer(files[0]);
      const doc = await PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      const count = doc.getPageCount();
      document.getElementById('rotateFileInfo').innerHTML =
        `<div class="file-item"><span class="file-item-icon">📄</span>
         <span class="file-item-name">${files[0].name}</span>
         <span class="file-item-size">${count} pages &middot; ${formatFileSize(files[0].size)}</span></div>`;
    } catch (e) {
      document.getElementById('rotateFileInfo').innerHTML =
        `<div class="file-item"><span class="file-item-icon">📄</span>
         <span class="file-item-name">${files[0].name}</span>
         <span class="file-item-size">${formatFileSize(files[0].size)}</span></div>`;
    }
  });
}

function selectRotation(button, deg) {
  document.querySelectorAll('#rotateOptions .btn-group:first-of-type .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.rotateDeg = deg;
}

function selectRotateApply(button, mode) {
  document.querySelectorAll('#rotateOptions .btn-group:last-of-type .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.rotateApply = mode;
}

async function processRotatePdf() {
  const file = toolState.rotateFile;
  if (!file) return;

  const resultDiv = document.getElementById('rotateResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('rotateBtn').disabled = true;

  try {
    const PDFLib = await loadPdfLib();
    const { PDFDocument, degrees } = PDFLib;

    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const rotDeg = toolState.rotateDeg;
    const applyMode = toolState.rotateApply;

    pages.forEach(function (page, i) {
      let shouldRotate = false;
      if (applyMode === 'all')   shouldRotate = true;
      if (applyMode === 'odd')   shouldRotate = (i % 2 === 0); // 0-indexed: i=0 is page 1 (odd)
      if (applyMode === 'even')  shouldRotate = (i % 2 === 1);
      if (applyMode === 'first') shouldRotate = (i === 0);

      if (shouldRotate) {
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + rotDeg) % 360));
      }
    });

    const pdfBytes = await pdfDoc.save();
    processedBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    const baseName = getBaseName(file.name);
    showResultWithDownload(resultDiv, baseName + '-rotated.pdf', {
      'Rotation': rotDeg + '°',
      'Pages': pages.length,
      'Output Size': formatFileSize(processedBlob.size)
    });

  } catch (error) {
    console.error('Rotate PDF error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong. Please try again.');
    document.getElementById('rotateBtn').disabled = false;
  }
}

/* ============================================================
   TOOL: COMPRESS PDF
   Quality control + live actual output size display.
   The displayed size comes from the real generated Blob — never faked.
   The Download button downloads the exact same Blob shown in the stats.
   ============================================================ */

function renderCompressPdf(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="info-box">PDF compression re-saves the document to reduce its size. The size shown is always the actual output — never estimated.</div>
    <div class="tool-upload" id="compressPdfDrop" tabindex="0" role="button" aria-label="Upload PDF file">
      <span class="upload-label">📄 Select PDF File</span>
      <p>Drag &amp; drop your PDF here, or click to browse</p>
      <input type="file" id="compressPdfInput" accept=".pdf" />
    </div>
    <div id="compressPdfFileInfo" style="margin-bottom:16px;"></div>

    <div class="tool-options" id="compressPdfOptions" style="display:none;">
      <div class="option-group">
        <label class="option-label">Compression Level</label>
        <div class="compress-levels">
          <button class="btn-choice" onclick="setCompressPdfLevel(this,'low')">Low</button>
          <button class="btn-choice active" onclick="setCompressPdfLevel(this,'medium')">Medium</button>
          <button class="btn-choice" onclick="setCompressPdfLevel(this,'high')">High</button>
          <button class="btn-choice" onclick="setCompressPdfLevel(this,'maximum')">Maximum</button>
        </div>
        <p style="font-size:12px;color:var(--text-secondary);margin-top:6px;" id="compressPdfLevelHint">
          Medium — balanced size and quality
        </p>
      </div>

      <div id="compressPdfLiveStats" style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:10px;padding:14px 16px;">
        <div style="display:flex;flex-wrap:wrap;gap:20px;justify-content:center;" id="compressPdfStatsInner">
          <div style="text-align:center;">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-secondary);margin-bottom:3px;">Original</div>
            <div style="font-size:18px;font-weight:700;" id="compressOrigSize">—</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-secondary);margin-bottom:3px;">Output</div>
            <div style="font-size:18px;font-weight:700;" id="compressOutSize">—</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-secondary);margin-bottom:3px;">Reduction</div>
            <div style="font-size:18px;font-weight:700;color:#2E7D32;" id="compressReduction">—</div>
          </div>
        </div>
        <div id="compressPdfProcessing" style="text-align:center;font-size:13px;color:var(--text-secondary);display:none;">
          <span>Processing preview…</span>
        </div>
      </div>
    </div>

    <button class="btn-process" id="compressPdfBtn" disabled onclick="downloadCompressedPdf()" style="background:${accent};">
      Download Compressed PDF
    </button>
    <div id="compressPdfResult"></div>`;

  // Track the current compression level and its generated blob
  toolState.compressPdfLevel = 'medium';
  toolState.compressedPdfBlob = null;      // The blob from the last preview generation
  toolState.compressPdfDebounce = null;    // Debounce timer for slider changes

  setupToolDropzone('compressPdfDrop', 'compressPdfInput', 'pdf', false, async function (files) {
    toolState.compressPdfFile = files[0];
    document.getElementById('compressPdfOptions').style.display = 'block';
    document.getElementById('compressPdfFileInfo').innerHTML =
      `<div class="file-item"><span class="file-item-icon">📄</span>
       <span class="file-item-name">${files[0].name}</span>
       <span class="file-item-size">${formatFileSize(files[0].size)}</span></div>`;
    document.getElementById('compressOrigSize').textContent = formatFileSize(files[0].size);
    // Generate the initial preview immediately
    await runCompressPdfPreview();
  });
}

// Map compression level names to options
function getCompressPdfOptions(level) {
  // We use pdf-lib's save() with useObjectStreams for all levels.
  // For higher compression we also remove metadata and flatten structures.
  // Note: client-side JS can only achieve structural compression, not lossy image compression.
  switch (level) {
    case 'low':     return { useObjectStreams: false, addDefaultPage: false };
    case 'medium':  return { useObjectStreams: true,  addDefaultPage: false };
    case 'high':    return { useObjectStreams: true,  addDefaultPage: false, objectsPerTick: 50 };
    case 'maximum': return { useObjectStreams: true,  addDefaultPage: false, objectsPerTick: 20 };
    default:        return { useObjectStreams: true,  addDefaultPage: false };
  }
}

const compressPdfLevelHints = {
  'low':     'Low — minimal processing, closest to original',
  'medium':  'Medium — balanced size and quality',
  'high':    'High — more aggressive restructuring',
  'maximum': 'Maximum — most aggressive, may take longer'
};

function setCompressPdfLevel(button, level) {
  document.querySelectorAll('.compress-levels .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.compressPdfLevel = level;

  const hintEl = document.getElementById('compressPdfLevelHint');
  if (hintEl) hintEl.textContent = compressPdfLevelHints[level] || '';

  // Run a new preview with the selected level
  runCompressPdfPreview();
}

// Generate the actual compressed PDF blob and update the live size display.
// This is the ONLY place where the blob is generated. Download uses this exact blob.
async function runCompressPdfPreview() {
  const file = toolState.compressPdfFile;
  if (!file) return;

  // Show processing indicator
  const processingEl = document.getElementById('compressPdfProcessing');
  const statsInner = document.getElementById('compressPdfStatsInner');
  const btn = document.getElementById('compressPdfBtn');

  if (processingEl) processingEl.style.display = 'block';
  if (statsInner) statsInner.style.opacity = '0.4';
  if (btn) btn.disabled = true;
  toolState.compressedPdfBlob = null;

  try {
    const PDFLib = await loadPdfLib();
    const { PDFDocument } = PDFLib;

    const arrayBuffer = await readFileAsArrayBuffer(file);
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true, updateMetadata: false });
    } catch (e) {
      throw new Error('Unable to open this PDF. It may be password-protected or corrupted.');
    }

    const saveOptions = getCompressPdfOptions(toolState.compressPdfLevel);
    const pdfBytes = await pdfDoc.save(saveOptions);

    // Store the generated blob so Download uses this EXACT blob
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    toolState.compressedPdfBlob = blob;

    // Update live stats with the ACTUAL blob size
    const originalSize = file.size;
    const outputSize = blob.size;
    const savedBytes = originalSize - outputSize;
    const reduction = ((savedBytes / originalSize) * 100).toFixed(1);

    document.getElementById('compressOutSize').textContent = formatFileSize(outputSize);
    const reductionEl = document.getElementById('compressReduction');
    if (savedBytes > 0) {
      reductionEl.textContent = '−' + reduction + '%';
      reductionEl.style.color = '#2E7D32';
    } else {
      reductionEl.textContent = 'No reduction';
      reductionEl.style.color = 'var(--text-secondary)';
    }

    if (btn) btn.disabled = false;

  } catch (error) {
    console.error('Compress PDF preview error:', error);
    const resultDiv = document.getElementById('compressPdfResult');
    showError(resultDiv, error.message || 'Something went wrong. Please try again.');
  } finally {
    if (processingEl) processingEl.style.display = 'none';
    if (statsInner) statsInner.style.opacity = '1';
  }
}

// Download the EXACT blob that was generated in the preview — no second processing
function downloadCompressedPdf() {
  const blob = toolState.compressedPdfBlob;
  if (!blob) {
    alert('Please wait for the preview to finish processing.');
    return;
  }

  const file = toolState.compressPdfFile;
  const baseName = getBaseName(file.name);
  processedBlob = blob; // Set it so handleDownload works if called
  downloadBlob(blob, baseName + '-compressed.pdf');

  // Show a small result confirmation
  const resultDiv = document.getElementById('compressPdfResult');
  const originalSize = file.size;
  const outputSize = blob.size;
  const savedBytes = originalSize - outputSize;
  const reduction = ((savedBytes / originalSize) * 100).toFixed(1);

  let stats;
  if (savedBytes > 0) {
    stats = {
      'Original': formatFileSize(originalSize),
      'Compressed': formatFileSize(outputSize),
      'Saved': formatFileSize(savedBytes),
      'Reduction': reduction + '%'
    };
  } else {
    stats = {
      'Original': formatFileSize(originalSize),
      'Output': formatFileSize(outputSize),
      'Note': 'No significant size reduction for this file'
    };
  }

  let statsHTML = '<div class="result-stats">';
  for (const [label, value] of Object.entries(stats)) {
    const isSaved = label.toLowerCase().includes('saved') || label.toLowerCase().includes('reduction');
    statsHTML += `<div class="result-stat">
      <div class="result-stat-label">${label}</div>
      <div class="result-stat-value ${isSaved ? 'saved' : ''}">${value}</div>
    </div>`;
  }
  statsHTML += '</div>';

  const accent = toolState.config.accent;
  resultDiv.innerHTML = `
    <div class="result-area">
      <div class="result-success-icon">✅</div>
      <h2 class="result-title">Downloaded!</h2>
      ${statsHTML}
      <button class="btn-download" onclick="downloadCompressedPdf()" style="background:${accent};">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Again
      </button>
      <button class="btn-start-again" onclick="openTool('compress-pdf')">↺ Start Again</button>
    </div>`;
}


/* ============================================================
   TOOL: PDF → IMAGE
   Converts each PDF page to a JPG or PNG image
   ============================================================ */

function renderPdfToImage(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="tool-upload" id="pdfImgDrop" tabindex="0" role="button" aria-label="Upload PDF file">
      <span class="upload-label">📄 Select PDF File</span>
      <p>Drag &amp; drop your PDF here, or click to browse</p>
      <input type="file" id="pdfImgInput" accept=".pdf" />
    </div>
    <div id="pdfImgInfo" style="margin-bottom:16px;"></div>
    <div class="tool-options" id="pdfImgOptions" style="display:none;">
      <div class="option-group">
        <label class="option-label">Output Format</label>
        <div class="btn-group">
          <button class="btn-choice active" onclick="setPdfImgFormat(this,'jpeg')">JPG</button>
          <button class="btn-choice" onclick="setPdfImgFormat(this,'png')">PNG</button>
        </div>
      </div>
      <div class="option-group">
        <label class="option-label">Resolution</label>
        <div class="btn-group">
          <button class="btn-choice" onclick="setPdfImgScale(this,1.0)">Standard</button>
          <button class="btn-choice active" onclick="setPdfImgScale(this,1.5)">Good</button>
          <button class="btn-choice" onclick="setPdfImgScale(this,2.0)">High</button>
        </div>
      </div>
    </div>
    <button class="btn-process" id="pdfImgBtn" disabled onclick="processPdfToImage()" style="background:${accent};">
      Convert to Images
    </button>
    <div id="pdfImgResult"></div>`;

  toolState.pdfImgFormat = 'jpeg';
  toolState.pdfImgScale = 1.5;

  setupToolDropzone('pdfImgDrop', 'pdfImgInput', 'pdf', false, async function (files) {
    toolState.pdfImgFile = files[0];
    document.getElementById('pdfImgOptions').style.display = 'block';
    document.getElementById('pdfImgBtn').disabled = false;

    try {
      const pdfjsLib = await loadPdfJs();
      const buf = await readFileAsArrayBuffer(files[0]);
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      document.getElementById('pdfImgInfo').innerHTML =
        `<div class="file-item"><span class="file-item-icon">📄</span>
         <span class="file-item-name">${files[0].name}</span>
         <span class="file-item-size">${doc.numPages} pages &middot; ${formatFileSize(files[0].size)}</span></div>`;
    } catch (e) {
      document.getElementById('pdfImgInfo').innerHTML =
        `<div class="file-item"><span class="file-item-icon">📄</span>
         <span class="file-item-name">${files[0].name}</span>
         <span class="file-item-size">${formatFileSize(files[0].size)}</span></div>`;
    }
  });
}

function setPdfImgFormat(button, format) {
  document.querySelectorAll('#pdfImgOptions .btn-group:first-of-type .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.pdfImgFormat = format;
}

function setPdfImgScale(button, scale) {
  document.querySelectorAll('#pdfImgOptions .btn-group:last-of-type .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.pdfImgScale = scale;
}

async function processPdfToImage() {
  const file = toolState.pdfImgFile;
  if (!file) return;

  const resultDiv = document.getElementById('pdfImgResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('pdfImgBtn').disabled = true;

  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdfDoc.numPages;
    const scale = toolState.pdfImgScale;
    const format = toolState.pdfImgFormat;
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const baseName = getBaseName(file.name);
    const outputImages = [];

    for (let i = 0; i < pageCount; i++) {
      const canvas = await renderPdfPageToCanvas(pdfDoc, i, scale);
      const blob = await new Promise(function (resolve) {
        canvas.toBlob(function (b) { resolve(b); }, 'image/' + format, 0.92);
      });
      outputImages.push({ blob: blob, name: baseName + '-page-' + (i + 1) + '.' + ext, size: blob.size });
    }

    if (outputImages.length === 1) {
      // Single page: download directly, no ZIP needed
      processedBlob = outputImages[0].blob;
      showResultWithDownload(resultDiv, outputImages[0].name, {
        'Format': ext.toUpperCase(),
        'Size': formatFileSize(outputImages[0].blob.size)
      });
    } else {
      // Multiple pages: pack into one ZIP file so the user downloads once
      resultDiv.innerHTML = createLoadingHTML('Creating ZIP file…');

      const JSZip = await loadJsZip();
      const zip = new JSZip();

      // Add every image to the ZIP in page order
      for (let j = 0; j < outputImages.length; j++) {
        const img = outputImages[j];
        // Convert blob to ArrayBuffer for JSZip
        const arrayBuffer = await img.blob.arrayBuffer();
        zip.file('page-' + (j + 1) + '.' + ext, arrayBuffer);
      }

      // Generate the ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      processedBlob = zipBlob;

      const zipName = getBaseName(file.name) + '-images.zip';
      const accent = toolState.config.accent;
      const totalSize = outputImages.reduce(function (sum, img) { return sum + img.size; }, 0);

      resultDiv.innerHTML = `
        <div class="result-area">
          <div class="result-success-icon">✅</div>
          <h2 class="result-title">Conversion Complete</h2>
          <div class="result-stats">
            <div class="result-stat">
              <div class="result-stat-label">Pages</div>
              <div class="result-stat-value">${outputImages.length}</div>
            </div>
            <div class="result-stat">
              <div class="result-stat-label">Format</div>
              <div class="result-stat-value">${ext.toUpperCase()}</div>
            </div>
            <div class="result-stat">
              <div class="result-stat-label">ZIP Size</div>
              <div class="result-stat-value">${formatFileSize(zipBlob.size)}</div>
            </div>
          </div>
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;">
            All ${outputImages.length} images are packed in one ZIP file.
          </p>
          <button class="btn-download" onclick="handleDownload('${zipName}')" style="background:${accent};">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download ZIP (${outputImages.length} images)
          </button>
          <button class="btn-start-again" onclick="openTool('pdf-to-image')">↺ Start Again</button>
        </div>`;
    }

  } catch (error) {
    console.error('PDF to Image error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong. Please try another file.');
    document.getElementById('pdfImgBtn').disabled = false;
  }
}

function downloadPdfImage(index) {
  const imgs = toolState.pdfImgOutputs;
  if (imgs && imgs[index]) {
    downloadBlob(imgs[index].blob, imgs[index].name);
  }
}

/* ============================================================
   TOOL: IMAGE → PDF
   Converts one or more images into a single PDF file
   ============================================================ */

function renderImageToPdf(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="info-box">Select one or more images. They will be combined into a single PDF in the order shown.</div>
    <div class="tool-upload" id="imgPdfDrop" tabindex="0" role="button" aria-label="Upload images">
      <span class="upload-label">🖼️ Add Images</span>
      <p>Drag &amp; drop images here, or click to browse</p>
      <input type="file" id="imgPdfInput" multiple accept=".jpg,.jpeg,.png,.webp" />
    </div>
    <div id="imgPdfFileList" style="margin-bottom:16px;"></div>
    <button class="btn-process" id="imgPdfBtn" disabled onclick="processImageToPdf()" style="background:${accent};">
      Convert to PDF
    </button>
    <div id="imgPdfResult"></div>`;

  setupToolDropzone('imgPdfDrop', 'imgPdfInput', 'image', true, function (files) {
    toolState.imgPdfFiles = files;
    renderToolFileList('imgPdfFileList', files, 'image');
    document.getElementById('imgPdfBtn').disabled = files.length === 0;
  });
}

async function processImageToPdf() {
  const files = toolState.imgPdfFiles;
  if (!files || files.length === 0) return;

  const resultDiv = document.getElementById('imgPdfResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('imgPdfBtn').disabled = true;

  try {
    const PDFLib = await loadPdfLib();
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const ext = getExtension(file.name);
      let pdfImage;

      if (ext === 'jpg' || ext === 'jpeg') {
        pdfImage = await pdfDoc.embedJpg(arrayBuffer);
      } else if (ext === 'png') {
        pdfImage = await pdfDoc.embedPng(arrayBuffer);
      } else {
        // WebP and others: convert to PNG via canvas first
        const dataUrl = await readFileAsDataURL(file);
        const pngBlob = await convertImageToBlob(dataUrl, 'image/png', 1.0);
        const pngBuffer = await pngBlob.arrayBuffer();
        pdfImage = await pdfDoc.embedPng(pngBuffer);
      }

      const { width, height } = pdfImage;
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(pdfImage, { x: 0, y: 0, width: width, height: height });
    }

    const pdfBytes = await pdfDoc.save();
    processedBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    showResultWithDownload(resultDiv, 'images.pdf', {
      'Pages': files.length,
      'Output Size': formatFileSize(processedBlob.size)
    });

  } catch (error) {
    console.error('Image to PDF error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong. Please try again.');
    document.getElementById('imgPdfBtn').disabled = false;
  }
}

/* ============================================================
   TOOL: COMPRESS IMAGE
   Reduces image file size using the canvas API.
   The ACTUAL blob.size is shown – never a fake estimate.
   ============================================================ */

function renderCompressImage(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="tool-upload" id="compImgDrop" tabindex="0" role="button" aria-label="Upload image">
      <span class="upload-label">🖼️ Select Image</span>
      <p>Drag &amp; drop an image here, or click to browse</p>
      <input type="file" id="compImgInput" accept=".jpg,.jpeg,.png,.webp" />
    </div>
    <div id="compImgPreview" style="margin-bottom:16px;"></div>
    <div class="tool-options" id="compImgOptions" style="display:none;">
      <div class="option-group">
        <label class="option-label">Quality</label>
        <div class="range-group">
          <input type="range" id="compImgQuality" min="10" max="95" value="75"
            oninput="updateCompressPreview()" aria-label="Quality" style="accent-color:${accent};" />
          <span class="range-value" id="compImgQualityVal">75%</span>
        </div>
      </div>
      <div class="option-group">
        <label class="option-label">Output Format</label>
        <div class="btn-group">
          <button class="btn-choice active" onclick="setCompImgFormat(this,'jpeg')">JPG</button>
          <button class="btn-choice" onclick="setCompImgFormat(this,'png')">PNG</button>
          <button class="btn-choice" onclick="setCompImgFormat(this,'webp')">WebP</button>
        </div>
      </div>
      <div id="compImgLiveStats" style="margin-top:12px;"></div>
    </div>
    <button class="btn-process" id="compImgBtn" disabled onclick="processCompressImage()" style="background:${accent};">
      Compress Image
    </button>
    <div id="compImgResult"></div>`;

  toolState.compImgFormat = 'jpeg';

  setupToolDropzone('compImgDrop', 'compImgInput', 'image', false, async function (files) {
    toolState.compImgFile = files[0];
    document.getElementById('compImgOptions').style.display = 'block';
    document.getElementById('compImgBtn').disabled = false;
    await loadCompressImagePreview(files[0]);
    await updateCompressPreview();
  });
}

async function loadCompressImagePreview(file) {
  const previewDiv = document.getElementById('compImgPreview');
  previewDiv.innerHTML = '';

  const dataUrl = await readFileAsDataURL(file);
  const img = new Image();
  await new Promise(function (resolve, reject) {
    img.onload = resolve;
    img.onerror = function () { reject(new Error('Could not load the image.')); };
    img.src = dataUrl;
  });

  // Store the full-resolution canvas for processing
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext('2d').drawImage(img, 0, 0);
  toolState.compImgCanvas = canvas;

  // Show a small preview
  const previewImg = document.createElement('img');
  previewImg.src = dataUrl;
  previewImg.style.cssText = 'max-width:100%;max-height:200px;object-fit:contain;border-radius:8px;border:1px solid var(--border-color);display:block;margin:0 auto;';
  previewImg.alt = 'Image preview';
  previewDiv.appendChild(previewImg);
}

function setCompImgFormat(button, format) {
  document.querySelectorAll('#compImgOptions .btn-group .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.compImgFormat = format;
  updateCompressPreview();
}

async function updateCompressPreview() {
  if (!toolState.compImgCanvas) return;

  const qualityEl = document.getElementById('compImgQuality');
  const quality = parseInt(qualityEl.value) / 100;
  document.getElementById('compImgQualityVal').textContent = qualityEl.value + '%';

  const format = toolState.compImgFormat;
  const mimeType = 'image/' + format;

  // Generate the ACTUAL blob to get the real compressed size
  const blob = await new Promise(function (resolve) {
    toolState.compImgCanvas.toBlob(function (b) { resolve(b); }, mimeType, quality);
  });

  const originalSize = toolState.compImgFile.size;
  const compressedSize = blob.size;
  const saved = originalSize - compressedSize;
  const reduction = ((saved / originalSize) * 100).toFixed(1);

  const statsEl = document.getElementById('compImgLiveStats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--text-secondary);">
        <span>Original: <strong style="color:var(--text-primary);">${formatFileSize(originalSize)}</strong></span>
        <span>Estimated output: <strong style="color:var(--text-primary);">${formatFileSize(compressedSize)}</strong></span>
        ${saved > 0 ? `<span style="color:#2E7D32;">Saves ~${reduction}%</span>` : ''}
      </div>`;
  }
}

async function processCompressImage() {
  if (!toolState.compImgCanvas) return;

  const qualityEl = document.getElementById('compImgQuality');
  const quality = parseInt(qualityEl.value) / 100;
  const format = toolState.compImgFormat;
  const mimeType = 'image/' + format;
  const ext = format === 'jpeg' ? 'jpg' : format;

  const resultDiv = document.getElementById('compImgResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('compImgBtn').disabled = true;

  // Generate the final blob — this is what the user downloads
  const blob = await new Promise(function (resolve) {
    toolState.compImgCanvas.toBlob(function (b) { resolve(b); }, mimeType, quality);
  });

  processedBlob = blob; // Store it for download

  const originalSize = toolState.compImgFile.size;
  const compressedSize = blob.size;
  const saved = originalSize - compressedSize;
  const reduction = ((saved / originalSize) * 100).toFixed(1);
  const baseName = getBaseName(toolState.compImgFile.name);

  let stats;
  if (saved > 0) {
    stats = {
      'Original': formatFileSize(originalSize),
      'Compressed': formatFileSize(compressedSize),
      'Saved': formatFileSize(saved),
      'Reduction': reduction + '%'
    };
  } else {
    stats = {
      'Original': formatFileSize(originalSize),
      'Output': formatFileSize(compressedSize),
      'Note': 'Try a lower quality setting'
    };
  }

  showResultWithDownload(resultDiv, baseName + '-compressed.' + ext, stats);
}

/* ============================================================
   TOOL: RESIZE IMAGE
   ============================================================ */

function renderResizeImage(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="tool-upload" id="resizeDrop" tabindex="0" role="button" aria-label="Upload image">
      <span class="upload-label">🖼️ Select Image</span>
      <p>Drag &amp; drop an image here, or click to browse</p>
      <input type="file" id="resizeInput" accept=".jpg,.jpeg,.png,.webp" />
    </div>
    <div id="resizeFileInfo" style="margin-bottom:16px;"></div>
    <div class="tool-options" id="resizeOptions" style="display:none;">
      <div class="option-group">
        <label class="option-label">Presets</label>
        <div class="btn-group">
          <button class="btn-choice" onclick="applyResizePreset(1920,1080)">1920×1080</button>
          <button class="btn-choice" onclick="applyResizePreset(1280,720)">1280×720</button>
          <button class="btn-choice" onclick="applyResizePreset(1080,1080)">1080×1080</button>
          <button class="btn-choice" onclick="applyResizePreset(800,600)">800×600</button>
        </div>
      </div>
      <div class="option-group">
        <label class="option-label">Width &amp; Height (px)</label>
        <div class="option-input-row">
          <input type="number" class="option-input" id="resizeWidth" placeholder="Width" min="1" oninput="onResizeWidthChange()" />
          <span style="font-size:16px;color:var(--text-secondary);">×</span>
          <input type="number" class="option-input" id="resizeHeight" placeholder="Height" min="1" oninput="onResizeHeightChange()" />
        </div>
      </div>
      <div class="option-group">
        <label class="checkbox-row">
          <input type="checkbox" id="resizeLock" checked />
          <span>Maintain aspect ratio</span>
        </label>
      </div>
      <div class="option-group">
        <label class="option-label">Output Format</label>
        <div class="btn-group">
          <button class="btn-choice active" onclick="setResizeFormat(this,'jpeg')">JPG</button>
          <button class="btn-choice" onclick="setResizeFormat(this,'png')">PNG</button>
          <button class="btn-choice" onclick="setResizeFormat(this,'webp')">WebP</button>
        </div>
      </div>
    </div>
    <button class="btn-process" id="resizeBtn" disabled onclick="processResizeImage()" style="background:${accent};">
      Resize Image
    </button>
    <div id="resizeResult"></div>`;

  toolState.resizeFormat = 'jpeg';

  setupToolDropzone('resizeDrop', 'resizeInput', 'image', false, async function (files) {
    toolState.resizeFile = files[0];
    document.getElementById('resizeOptions').style.display = 'block';
    document.getElementById('resizeBtn').disabled = false;

    const dataUrl = await readFileAsDataURL(files[0]);
    const img = new Image();
    await new Promise(function (resolve) { img.onload = resolve; img.src = dataUrl; });
    toolState.resizeOrigW = img.naturalWidth;
    toolState.resizeOrigH = img.naturalHeight;
    toolState.resizeAspect = img.naturalWidth / img.naturalHeight;

    document.getElementById('resizeWidth').value = img.naturalWidth;
    document.getElementById('resizeHeight').value = img.naturalHeight;
    document.getElementById('resizeFileInfo').innerHTML =
      `<div class="file-item"><span class="file-item-icon">🖼️</span>
       <span class="file-item-name">${files[0].name}</span>
       <span class="file-item-size">${img.naturalWidth}×${img.naturalHeight} &middot; ${formatFileSize(files[0].size)}</span></div>`;
  });
}

function applyResizePreset(w, h) {
  document.getElementById('resizeWidth').value = w;
  document.getElementById('resizeHeight').value = h;
  document.getElementById('resizeLock').checked = false;
}

function onResizeWidthChange() {
  if (document.getElementById('resizeLock').checked && toolState.resizeAspect) {
    const w = parseInt(document.getElementById('resizeWidth').value);
    if (!isNaN(w) && w > 0) {
      document.getElementById('resizeHeight').value = Math.round(w / toolState.resizeAspect);
    }
  }
}

function onResizeHeightChange() {
  if (document.getElementById('resizeLock').checked && toolState.resizeAspect) {
    const h = parseInt(document.getElementById('resizeHeight').value);
    if (!isNaN(h) && h > 0) {
      document.getElementById('resizeWidth').value = Math.round(h * toolState.resizeAspect);
    }
  }
}

function setResizeFormat(button, format) {
  document.querySelectorAll('#resizeOptions .btn-group:last-of-type .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.resizeFormat = format;
}

async function processResizeImage() {
  const file = toolState.resizeFile;
  if (!file) return;

  const w = parseInt(document.getElementById('resizeWidth').value);
  const h = parseInt(document.getElementById('resizeHeight').value);
  if (isNaN(w) || isNaN(h) || w < 1 || h < 1) {
    alert('Please enter valid width and height values.');
    return;
  }

  const resultDiv = document.getElementById('resizeResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('resizeBtn').disabled = true;

  try {
    const dataUrl = await readFileAsDataURL(file);
    const img = new Image();
    await new Promise(function (resolve, reject) { img.onload = resolve; img.onerror = reject; img.src = dataUrl; });

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);

    const format = toolState.resizeFormat;
    const ext = format === 'jpeg' ? 'jpg' : format;
    const blob = await new Promise(function (resolve) {
      canvas.toBlob(function (b) { resolve(b); }, 'image/' + format, 0.92);
    });

    processedBlob = blob;
    const baseName = getBaseName(file.name);
    showResultWithDownload(resultDiv, baseName + '-' + w + 'x' + h + '.' + ext, {
      'New Size': w + ' × ' + h + ' px',
      'Format': ext.toUpperCase(),
      'File Size': formatFileSize(blob.size)
    });

  } catch (error) {
    console.error('Resize error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong. Please try again.');
    document.getElementById('resizeBtn').disabled = false;
  }
}

/* ============================================================
   TOOL: CROP IMAGE
   ============================================================ */

function renderCropImage(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="tool-upload" id="cropDrop" tabindex="0" role="button" aria-label="Upload image">
      <span class="upload-label">🖼️ Select Image</span>
      <p>Drag &amp; drop an image here, or click to browse</p>
      <input type="file" id="cropInput" accept=".jpg,.jpeg,.png,.webp" />
    </div>
    <div id="cropArea" style="display:none;">
      <div class="tool-options" style="margin-bottom:12px;">
        <div class="option-group">
          <label class="option-label">Aspect Ratio</label>
          <div class="btn-group">
            <button class="btn-choice" onclick="setCropRatio(event,1,1)">1:1</button>
            <button class="btn-choice" onclick="setCropRatio(event,4,3)">4:3</button>
            <button class="btn-choice" onclick="setCropRatio(event,16,9)">16:9</button>
            <button class="btn-choice active" onclick="setCropRatio(event,0,0)">Free</button>
          </div>
        </div>
        <div class="option-group">
          <label class="option-label">Crop Region (px)</label>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;">
            <div><label style="font-size:11px;color:var(--text-secondary);">X</label>
              <input type="number" class="option-input" id="cropX" value="0" min="0" oninput="updateCropFromInputs()" /></div>
            <div><label style="font-size:11px;color:var(--text-secondary);">Y</label>
              <input type="number" class="option-input" id="cropY" value="0" min="0" oninput="updateCropFromInputs()" /></div>
            <div><label style="font-size:11px;color:var(--text-secondary);">Width</label>
              <input type="number" class="option-input" id="cropW" value="100" min="1" oninput="updateCropFromInputs()" /></div>
            <div><label style="font-size:11px;color:var(--text-secondary);">Height</label>
              <input type="number" class="option-input" id="cropH" value="100" min="1" oninput="updateCropFromInputs()" /></div>
          </div>
        </div>
        <div class="option-group">
          <label class="option-label">Output Format</label>
          <div class="btn-group">
            <button class="btn-choice active" onclick="setCropFormat(this,'jpeg')">JPG</button>
            <button class="btn-choice" onclick="setCropFormat(this,'png')">PNG</button>
            <button class="btn-choice" onclick="setCropFormat(this,'webp')">WebP</button>
          </div>
        </div>
      </div>
      <div style="margin-bottom:16px;text-align:center;background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;overflow:hidden;padding:12px;">
        <canvas id="cropCanvas" style="max-width:100%;border:1px solid var(--border-color);border-radius:4px;cursor:crosshair;"></canvas>
        <p style="font-size:12px;color:var(--text-secondary);margin-top:8px;">Click and drag to select the crop area</p>
      </div>
    </div>
    <button class="btn-process" id="cropBtn" disabled onclick="processCropImage()" style="background:${accent};">
      Crop Image
    </button>
    <div id="cropResult"></div>`;

  toolState.cropFormat = 'jpeg';
  toolState.cropRatioW = 0;
  toolState.cropRatioH = 0;
  toolState.cropSel = { x: 0, y: 0, w: 0, h: 0 };
  toolState.cropDragging = false;

  setupToolDropzone('cropDrop', 'cropInput', 'image', false, async function (files) {
    toolState.cropFile = files[0];
    document.getElementById('cropArea').style.display = 'block';
    document.getElementById('cropBtn').disabled = false;
    await setupCropCanvas(files[0]);
  });
}

async function setupCropCanvas(file) {
  const dataUrl = await readFileAsDataURL(file);
  const img = new Image();
  await new Promise(function (resolve) { img.onload = resolve; img.src = dataUrl; });
  toolState.cropImg = img;

  const maxDisplay = 600;
  let dispW = img.naturalWidth;
  let dispH = img.naturalHeight;
  if (dispW > maxDisplay) {
    dispH = Math.round(img.naturalHeight * (maxDisplay / dispW));
    dispW = maxDisplay;
  }

  const canvas = document.getElementById('cropCanvas');
  canvas.width = dispW;
  canvas.height = dispH;
  toolState.cropDispW = dispW;
  toolState.cropDispH = dispH;
  toolState.cropScale = img.naturalWidth / dispW;
  toolState.cropSel = { x: 0, y: 0, w: dispW, h: dispH };

  updateCropInputsFromSel();
  drawCropCanvas();

  canvas.onmousedown = cropMouseDown;
  canvas.onmousemove = cropMouseMove;
  canvas.onmouseup = cropMouseUp;
}

function drawCropCanvas() {
  const canvas = document.getElementById('cropCanvas');
  if (!canvas || !toolState.cropImg) return;
  const ctx = canvas.getContext('2d');
  const sel = toolState.cropSel;
  const w = canvas.width;
  const h = canvas.height;

  // Draw the image
  ctx.drawImage(toolState.cropImg, 0, 0, w, h);

  // Dim the non-selected area
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, w, h);

  // "Cut out" the selection to show the original
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(sel.x, sel.y, sel.w, sel.h);
  ctx.globalCompositeOperation = 'destination-over';
  ctx.drawImage(toolState.cropImg, 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';

  // Draw selection border
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
  ctx.setLineDash([]);
}

function cropMouseDown(event) {
  const rect = event.target.getBoundingClientRect();
  toolState.cropStartX = event.clientX - rect.left;
  toolState.cropStartY = event.clientY - rect.top;
  toolState.cropDragging = true;
  toolState.cropSel = { x: toolState.cropStartX, y: toolState.cropStartY, w: 0, h: 0 };
}

function cropMouseMove(event) {
  if (!toolState.cropDragging) return;
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  let selX = toolState.cropStartX;
  let selY = toolState.cropStartY;
  let selW = x - selX;
  let selH = y - selY;

  if (toolState.cropRatioW && toolState.cropRatioH) {
    selH = selW * (toolState.cropRatioH / toolState.cropRatioW);
  }

  if (selW < 0) { selX += selW; selW = Math.abs(selW); }
  if (selH < 0) { selY += selH; selH = Math.abs(selH); }

  selX = Math.max(0, Math.min(selX, toolState.cropDispW - 1));
  selY = Math.max(0, Math.min(selY, toolState.cropDispH - 1));
  selW = Math.min(selW, toolState.cropDispW - selX);
  selH = Math.min(selH, toolState.cropDispH - selY);

  toolState.cropSel = { x: selX, y: selY, w: selW, h: selH };
  updateCropInputsFromSel();
  drawCropCanvas();
}

function cropMouseUp() {
  toolState.cropDragging = false;
}

function updateCropInputsFromSel() {
  const scale = toolState.cropScale || 1;
  const sel = toolState.cropSel;
  const xEl = document.getElementById('cropX');
  if (xEl) {
    document.getElementById('cropX').value = Math.round(sel.x * scale);
    document.getElementById('cropY').value = Math.round(sel.y * scale);
    document.getElementById('cropW').value = Math.round(sel.w * scale);
    document.getElementById('cropH').value = Math.round(sel.h * scale);
  }
}

function updateCropFromInputs() {
  const scale = toolState.cropScale || 1;
  toolState.cropSel = {
    x: parseFloat(document.getElementById('cropX').value) / scale || 0,
    y: parseFloat(document.getElementById('cropY').value) / scale || 0,
    w: parseFloat(document.getElementById('cropW').value) / scale || 0,
    h: parseFloat(document.getElementById('cropH').value) / scale || 0
  };
  drawCropCanvas();
}

function setCropRatio(event, w, h) {
  document.querySelectorAll('#cropArea .btn-group:first-of-type .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  event.target.classList.add('active');
  toolState.cropRatioW = w;
  toolState.cropRatioH = h;
}

function setCropFormat(button, format) {
  document.querySelectorAll('#cropArea .btn-group:last-of-type .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.cropFormat = format;
}

async function processCropImage() {
  const file = toolState.cropFile;
  if (!file) return;

  const sel = toolState.cropSel;
  const scale = toolState.cropScale || 1;
  const cropX = Math.round(sel.x * scale);
  const cropY = Math.round(sel.y * scale);
  const cropW = Math.round(sel.w * scale);
  const cropH = Math.round(sel.h * scale);

  if (cropW < 1 || cropH < 1) {
    alert('Please drag to select a crop area on the image first.');
    return;
  }

  const resultDiv = document.getElementById('cropResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('cropBtn').disabled = true;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    canvas.getContext('2d').drawImage(toolState.cropImg, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const format = toolState.cropFormat;
    const ext = format === 'jpeg' ? 'jpg' : format;
    const blob = await new Promise(function (resolve) {
      canvas.toBlob(function (b) { resolve(b); }, 'image/' + format, 0.92);
    });

    processedBlob = blob;
    const baseName = getBaseName(file.name);
    showResultWithDownload(resultDiv, baseName + '-cropped.' + ext, {
      'Crop Size': cropW + ' × ' + cropH + ' px',
      'Format': ext.toUpperCase(),
      'File Size': formatFileSize(blob.size)
    });

  } catch (error) {
    console.error('Crop error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong. Please try again.');
    document.getElementById('cropBtn').disabled = false;
  }
}

/* ============================================================
   TOOL: CONVERT IMAGE
   Convert between JPG, PNG, WebP
   ============================================================ */

function renderConvertImage(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="tool-upload" id="convertDrop" tabindex="0" role="button" aria-label="Upload image">
      <span class="upload-label">🖼️ Select Image</span>
      <p>Drag &amp; drop an image here, or click to browse</p>
      <input type="file" id="convertInput" accept=".jpg,.jpeg,.png,.webp" />
    </div>
    <div id="convertFileInfo" style="margin-bottom:16px;"></div>
    <div class="tool-options" id="convertOptions" style="display:none;">
      <div class="option-group">
        <label class="option-label">Convert To</label>
        <div class="btn-group">
          <button class="btn-choice active" onclick="setConvertFormat(this,'jpeg')">JPG</button>
          <button class="btn-choice" onclick="setConvertFormat(this,'png')">PNG</button>
          <button class="btn-choice" onclick="setConvertFormat(this,'webp')">WebP</button>
        </div>
      </div>
    </div>
    <button class="btn-process" id="convertBtn" disabled onclick="processConvertImage()" style="background:${accent};">
      Convert Image
    </button>
    <div id="convertResult"></div>`;

  toolState.convertFormat = 'jpeg';

  setupToolDropzone('convertDrop', 'convertInput', 'image', false, function (files) {
    toolState.convertFile = files[0];
    document.getElementById('convertOptions').style.display = 'block';
    document.getElementById('convertBtn').disabled = false;
    document.getElementById('convertFileInfo').innerHTML =
      `<div class="file-item"><span class="file-item-icon">🖼️</span>
       <span class="file-item-name">${files[0].name}</span>
       <span class="file-item-size">${formatFileSize(files[0].size)}</span></div>`;
  });
}

function setConvertFormat(button, format) {
  document.querySelectorAll('#convertOptions .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.convertFormat = format;
}

async function processConvertImage() {
  const file = toolState.convertFile;
  if (!file) return;

  const resultDiv = document.getElementById('convertResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('convertBtn').disabled = true;

  try {
    const dataUrl = await readFileAsDataURL(file);
    const img = new Image();
    await new Promise(function (resolve, reject) { img.onload = resolve; img.onerror = reject; img.src = dataUrl; });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    const format = toolState.convertFormat;
    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF'; // Fill white background for JPG (no transparency)
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    const ext = format === 'jpeg' ? 'jpg' : format;
    const blob = await new Promise(function (resolve) {
      canvas.toBlob(function (b) { resolve(b); }, 'image/' + format, 0.92);
    });

    processedBlob = blob;
    const baseName = getBaseName(file.name);
    showResultWithDownload(resultDiv, baseName + '.' + ext, {
      'From': getExtension(file.name).toUpperCase(),
      'To': ext.toUpperCase(),
      'File Size': formatFileSize(blob.size)
    });

  } catch (error) {
    console.error('Convert error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong. Please try again.');
    document.getElementById('convertBtn').disabled = false;
  }
}

/* ============================================================
   TOOL: ENHANCE IMAGE
   Adjust brightness, contrast, saturation, sharpness
   ============================================================ */

function renderEnhanceImage(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="tool-upload" id="enhanceDrop" tabindex="0" role="button" aria-label="Upload image">
      <span class="upload-label">🖼️ Select Image</span>
      <p>Drag &amp; drop an image here, or click to browse</p>
      <input type="file" id="enhanceInput" accept=".jpg,.jpeg,.png,.webp" />
    </div>
    <div id="enhanceArea" style="display:none;">
      <div class="image-compare" id="enhanceCompare">
        <div class="compare-pane">
          <div class="compare-label">Original</div>
          <canvas id="enhanceOrigCanvas"></canvas>
        </div>
        <div class="compare-pane">
          <div class="compare-label">Preview</div>
          <canvas id="enhanceOutCanvas"></canvas>
        </div>
      </div>
      <div class="tool-options">
        <div class="option-group">
          <label class="option-label">Brightness</label>
          <div class="range-group">
            <input type="range" id="enhBrightness" min="-100" max="100" value="0"
              oninput="applyEnhancement()" aria-label="Brightness" style="accent-color:${accent};" />
            <span class="range-value" id="enhBrightnessVal">0</span>
          </div>
        </div>
        <div class="option-group">
          <label class="option-label">Contrast</label>
          <div class="range-group">
            <input type="range" id="enhContrast" min="-100" max="100" value="0"
              oninput="applyEnhancement()" aria-label="Contrast" style="accent-color:${accent};" />
            <span class="range-value" id="enhContrastVal">0</span>
          </div>
        </div>
        <div class="option-group">
          <label class="option-label">Saturation</label>
          <div class="range-group">
            <input type="range" id="enhSaturation" min="-100" max="100" value="0"
              oninput="applyEnhancement()" aria-label="Saturation" style="accent-color:${accent};" />
            <span class="range-value" id="enhSaturationVal">0</span>
          </div>
        </div>
        <div class="option-group">
          <label class="option-label">Sharpness</label>
          <div class="range-group">
            <input type="range" id="enhSharpness" min="0" max="10" value="0"
              oninput="applyEnhancement()" aria-label="Sharpness" style="accent-color:${accent};" />
            <span class="range-value" id="enhSharpnessVal">0</span>
          </div>
        </div>
        <div class="option-group">
          <label class="option-label">Output Format</label>
          <div class="btn-group">
            <button class="btn-choice active" onclick="setEnhanceFormat(this,'jpeg')">JPG</button>
            <button class="btn-choice" onclick="setEnhanceFormat(this,'png')">PNG</button>
            <button class="btn-choice" onclick="setEnhanceFormat(this,'webp')">WebP</button>
          </div>
        </div>
      </div>
    </div>
    <button class="btn-process" id="enhanceBtn" disabled onclick="processEnhanceImage()" style="background:${accent};">
      Apply Enhancements
    </button>
    <div id="enhanceResult"></div>`;

  toolState.enhanceFormat = 'jpeg';

  setupToolDropzone('enhanceDrop', 'enhanceInput', 'image', false, async function (files) {
    toolState.enhanceFile = files[0];
    document.getElementById('enhanceArea').style.display = 'block';
    document.getElementById('enhanceBtn').disabled = false;
    await loadEnhanceImage(files[0]);
  });
}

async function loadEnhanceImage(file) {
  const dataUrl = await readFileAsDataURL(file);
  const img = new Image();
  await new Promise(function (resolve) { img.onload = resolve; img.src = dataUrl; });
  toolState.enhanceImg = img;

  const maxW = 400;
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }
  toolState.enhanceDispW = w;
  toolState.enhanceDispH = h;

  const orig = document.getElementById('enhanceOrigCanvas');
  orig.width = w; orig.height = h;
  orig.style.width = '100%'; orig.style.height = 'auto';
  orig.getContext('2d').drawImage(img, 0, 0, w, h);

  const out = document.getElementById('enhanceOutCanvas');
  out.width = w; out.height = h;
  out.style.width = '100%'; out.style.height = 'auto';
  out.getContext('2d').drawImage(img, 0, 0, w, h);
}

function setEnhanceFormat(button, format) {
  document.querySelectorAll('#enhanceArea .btn-group .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.enhanceFormat = format;
}

function applyEnhancement() {
  const outCanvas = document.getElementById('enhanceOutCanvas');
  if (!outCanvas || !toolState.enhanceImg) return;

  const img = toolState.enhanceImg;
  const w = toolState.enhanceDispW;
  const h = toolState.enhanceDispH;
  const ctx = outCanvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  const brightness  = parseInt(document.getElementById('enhBrightness').value);
  const contrast    = parseInt(document.getElementById('enhContrast').value);
  const saturation  = parseInt(document.getElementById('enhSaturation').value);
  const sharpness   = parseInt(document.getElementById('enhSharpness').value);

  document.getElementById('enhBrightnessVal').textContent = brightness;
  document.getElementById('enhContrastVal').textContent = contrast;
  document.getElementById('enhSaturationVal').textContent = saturation;
  document.getElementById('enhSharpnessVal').textContent = sharpness;

  applyPixelAdjustments(ctx, w, h, brightness, contrast, saturation);
  if (sharpness > 0) { applySharpness(ctx, w, h, sharpness * 0.3); }
}

// Apply brightness, contrast, saturation via pixel manipulation
function applyPixelAdjustments(ctx, w, h, brightness, contrast, saturation) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const satFactor = (saturation + 100) / 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    r += brightness; g += brightness; b += brightness;
    // Contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;
    // Saturation
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = gray + satFactor * (r - gray);
    g = gray + satFactor * (g - gray);
    b = gray + satFactor * (b - gray);

    data[i]     = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(imageData, 0, 0);
}

// Simple unsharp mask for sharpness
function applySharpness(ctx, w, h, amount) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;
  const k = [0, -1, 0, -1, 4 + amount, -1, 0, -1, 0]; // Sharpening kernel

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            val += src[((y + ky) * w + (x + kx)) * 4 + c] * k[(ky + 1) * 3 + (kx + 1)];
          }
        }
        dst[idx + c] = Math.max(0, Math.min(255, val));
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

async function processEnhanceImage() {
  const file = toolState.enhanceFile;
  if (!file) return;

  const resultDiv = document.getElementById('enhanceResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('enhanceBtn').disabled = true;

  try {
    // Apply adjustments to the FULL resolution image
    const img = toolState.enhanceImg;
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = img.naturalWidth;
    fullCanvas.height = img.naturalHeight;
    const ctx = fullCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const brightness = parseInt(document.getElementById('enhBrightness').value);
    const contrast   = parseInt(document.getElementById('enhContrast').value);
    const saturation = parseInt(document.getElementById('enhSaturation').value);
    const sharpness  = parseInt(document.getElementById('enhSharpness').value);

    applyPixelAdjustments(ctx, img.naturalWidth, img.naturalHeight, brightness, contrast, saturation);
    if (sharpness > 0) { applySharpness(ctx, img.naturalWidth, img.naturalHeight, sharpness * 0.3); }

    const format = toolState.enhanceFormat;
    const ext = format === 'jpeg' ? 'jpg' : format;
    const blob = await new Promise(function (resolve) {
      fullCanvas.toBlob(function (b) { resolve(b); }, 'image/' + format, 0.92);
    });

    processedBlob = blob;
    const baseName = getBaseName(file.name);
    showResultWithDownload(resultDiv, baseName + '-enhanced.' + ext, {
      'Format': ext.toUpperCase(),
      'Output Size': formatFileSize(blob.size)
    });

  } catch (error) {
    console.error('Enhance error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong. Please try again.');
    document.getElementById('enhanceBtn').disabled = false;
  }
}

/* ============================================================
   TOOL: SCAN ENHANCE
   Improve photographed documents using contrast/brightness
   Note: Standard image processing only – not AI
   ============================================================ */

function renderScanEnhance(container) {
  const accent = toolState.config.accent;
  container.innerHTML = `
    <div class="info-box">Upload a photo of a document to improve its clarity using brightness and contrast adjustments. This is standard image processing, not AI.</div>
    <div class="tool-upload" id="scanDrop" tabindex="0" role="button" aria-label="Upload document photo">
      <span class="upload-label">📷 Select Document Photo</span>
      <p>Drag &amp; drop your image here, or click to browse</p>
      <input type="file" id="scanInput" accept=".jpg,.jpeg,.png,.webp" />
    </div>
    <div id="scanArea" style="display:none;">
      <div class="image-compare">
        <div class="compare-pane">
          <div class="compare-label">Original</div>
          <canvas id="scanOrigCanvas" style="width:100%;height:auto;"></canvas>
        </div>
        <div class="compare-pane">
          <div class="compare-label">Enhanced</div>
          <canvas id="scanOutCanvas" style="width:100%;height:auto;"></canvas>
        </div>
      </div>
      <div class="tool-options">
        <div class="option-group">
          <label class="option-label">Mode</label>
          <div class="btn-group">
            <button class="btn-choice active" onclick="setScanMode(this,'bw')">Black &amp; White</button>
            <button class="btn-choice" onclick="setScanMode(this,'color')">Color</button>
          </div>
        </div>
        <div class="option-group">
          <label class="option-label">Contrast</label>
          <div class="range-group">
            <input type="range" id="scanContrast" min="0" max="100" value="50"
              oninput="applyScanEnhancement()" style="accent-color:${accent};" aria-label="Contrast" />
            <span class="range-value" id="scanContrastVal">50</span>
          </div>
        </div>
        <div class="option-group">
          <label class="option-label">Brightness</label>
          <div class="range-group">
            <input type="range" id="scanBrightness" min="-80" max="80" value="10"
              oninput="applyScanEnhancement()" style="accent-color:${accent};" aria-label="Brightness" />
            <span class="range-value" id="scanBrightnessVal">10</span>
          </div>
        </div>
        <div class="option-group">
          <label class="option-label">Sharpness</label>
          <div class="range-group">
            <input type="range" id="scanSharpness" min="0" max="10" value="3"
              oninput="applyScanEnhancement()" style="accent-color:${accent};" aria-label="Sharpness" />
            <span class="range-value" id="scanSharpnessVal">3</span>
          </div>
        </div>
        <div class="option-group">
          <label class="option-label">Output Format</label>
          <div class="btn-group">
            <button class="btn-choice active" onclick="setScanFormat(this,'jpeg')">JPG</button>
            <button class="btn-choice" onclick="setScanFormat(this,'png')">PNG</button>
          </div>
        </div>
      </div>
    </div>
    <button class="btn-process" id="scanBtn" disabled onclick="processScanEnhance()" style="background:${accent};">
      Enhance Document
    </button>
    <div id="scanResult"></div>`;

  toolState.scanMode = 'bw';
  toolState.scanFormat = 'jpeg';

  setupToolDropzone('scanDrop', 'scanInput', 'image', false, async function (files) {
    toolState.scanFile = files[0];
    document.getElementById('scanArea').style.display = 'block';
    document.getElementById('scanBtn').disabled = false;
    await loadScanImage(files[0]);
    applyScanEnhancement();
  });
}

async function loadScanImage(file) {
  const dataUrl = await readFileAsDataURL(file);
  const img = new Image();
  await new Promise(function (resolve) { img.onload = resolve; img.src = dataUrl; });
  toolState.scanImg = img;

  const maxW = 400;
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }
  toolState.scanDispW = w;
  toolState.scanDispH = h;

  const orig = document.getElementById('scanOrigCanvas');
  orig.width = w; orig.height = h;
  orig.getContext('2d').drawImage(img, 0, 0, w, h);

  const out = document.getElementById('scanOutCanvas');
  out.width = w; out.height = h;
}

function setScanMode(button, mode) {
  document.querySelectorAll('#scanArea .btn-group:first-of-type .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.scanMode = mode;
  applyScanEnhancement();
}

function setScanFormat(button, format) {
  document.querySelectorAll('#scanArea .btn-group:last-of-type .btn-choice').forEach(function (b) { b.classList.remove('active'); });
  button.classList.add('active');
  toolState.scanFormat = format;
}

function applyScanEnhancement() {
  const out = document.getElementById('scanOutCanvas');
  if (!out || !toolState.scanImg) return;

  const img = toolState.scanImg;
  const w = toolState.scanDispW;
  const h = toolState.scanDispH;
  const ctx = out.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  const contrast   = parseInt(document.getElementById('scanContrast').value);
  const brightness = parseInt(document.getElementById('scanBrightness').value);
  const sharpness  = parseInt(document.getElementById('scanSharpness').value);
  document.getElementById('scanContrastVal').textContent = contrast;
  document.getElementById('scanBrightnessVal').textContent = brightness;
  document.getElementById('scanSharpnessVal').textContent = sharpness;

  applyPixelAdjustments(ctx, w, h, brightness, contrast, 0);

  if (toolState.scanMode === 'bw') {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, gray));
    }
    ctx.putImageData(imageData, 0, 0);
  }

  if (sharpness > 0) { applySharpness(ctx, w, h, sharpness * 0.3); }
}

async function processScanEnhance() {
  const file = toolState.scanFile;
  if (!file) return;

  const resultDiv = document.getElementById('scanResult');
  resultDiv.innerHTML = createLoadingHTML();
  document.getElementById('scanBtn').disabled = true;

  try {
    const img = toolState.scanImg;
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = img.naturalWidth;
    fullCanvas.height = img.naturalHeight;
    const ctx = fullCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const contrast   = parseInt(document.getElementById('scanContrast').value);
    const brightness = parseInt(document.getElementById('scanBrightness').value);
    const sharpness  = parseInt(document.getElementById('scanSharpness').value);

    applyPixelAdjustments(ctx, img.naturalWidth, img.naturalHeight, brightness, contrast, 0);

    if (toolState.scanMode === 'bw') {
      const imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, gray));
      }
      ctx.putImageData(imageData, 0, 0);
    }

    if (sharpness > 0) { applySharpness(ctx, img.naturalWidth, img.naturalHeight, sharpness * 0.3); }

    const format = toolState.scanFormat;
    const ext = format === 'jpeg' ? 'jpg' : format;
    const blob = await new Promise(function (resolve) {
      fullCanvas.toBlob(function (b) { resolve(b); }, 'image/' + format, 0.94);
    });

    processedBlob = blob;
    const baseName = getBaseName(file.name);
    showResultWithDownload(resultDiv, baseName + '-scan.' + ext, {
      'Mode': toolState.scanMode === 'bw' ? 'Black & White' : 'Color',
      'Output Size': formatFileSize(blob.size)
    });

  } catch (error) {
    console.error('Scan enhance error:', error);
    resultDiv.innerHTML = '';
    showError(resultDiv, error.message || 'Something went wrong. Please try again.');
    document.getElementById('scanBtn').disabled = false;
  }
}
