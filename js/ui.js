/* ─────────────────────────────────────────────────────────────────
   alyxfiles — js/ui.js
   View routing, navigation, toast, progress, drag-drop wiring
───────────────────────────────────────────────────────────────── */
'use strict';

// ── View Router ──────────────────────────────────────────────────
const Views = {
  home:       document.getElementById('view-home'),
  workspace:  document.getElementById('view-workspace'),
  processing: document.getElementById('view-processing'),
  result:     document.getElementById('view-result'),
  toolSelect: document.getElementById('view-tool-select'),
};

let currentView = 'home';

function showView(name) {
  // Hide all views
  Object.values(Views).forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });

  const target = Views[name];
  if (!target) return;

  // Show the footer only on home view
  const footer = document.querySelector('.site-footer');
  const infoSections = document.querySelectorAll('.info-section');

  if (name === 'home') {
    if (footer) footer.style.display = '';
    infoSections.forEach(s => s.style.display = '');
  } else {
    if (footer) footer.style.display = 'none';
    infoSections.forEach(s => s.style.display = 'none');
  }

  target.style.display = 'block';
  // Trigger reflow then animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.classList.add('active');
    });
  });

  currentView = name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Navigation ───────────────────────────────────────────────────
function initNav() {
  const wrapper    = document.getElementById('nav-wrapper');
  const hamburger  = document.getElementById('nav-hamburger');
  const navLinks   = document.getElementById('nav-links');
  const logoLink   = document.getElementById('nav-logo-link');

  // Logo click → home
  logoLink.addEventListener('click', e => {
    e.preventDefault();
    AppState.reset();
    showView('home');
  });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  // Close menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');

      // If we're not on home, navigate home first then scroll
      const section = link.getAttribute('data-section');
      if (section) {
        e.preventDefault();
        if (currentView !== 'home') {
          AppState.reset();
          showView('home');
          setTimeout(() => scrollToSection(section), 300);
        } else {
          scrollToSection(section);
        }
      }
    });
  });

  // Scroll shadow
  window.addEventListener('scroll', () => {
    wrapper.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ── Toast ────────────────────────────────────────────────────────
let toastTimer = null;

function showToast(msg, duration = 4000) {
  const toast   = document.getElementById('toast');
  const msgEl   = document.getElementById('toast-msg');
  const closeBtn = document.getElementById('toast-close');

  msgEl.textContent = msg;
  toast.removeAttribute('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hideToast(), duration);

  closeBtn.onclick = hideToast;
}

function hideToast() {
  const toast = document.getElementById('toast');
  toast.classList.remove('show');
  setTimeout(() => toast.setAttribute('hidden', ''), 300);
}

// ── Progress ─────────────────────────────────────────────────────
function showProcessing(label = 'Processing…', sub = '') {
  document.getElementById('processing-label').textContent = label;
  document.getElementById('processing-sub').textContent = sub;
  document.getElementById('processing-bar-track').setAttribute('hidden', '');
  document.getElementById('processing-bar').style.width = '0%';
  showView('processing');
}

function setProgress(pct, sub) {
  const track = document.getElementById('processing-bar-track');
  const bar   = document.getElementById('processing-bar');
  const subEl = document.getElementById('processing-sub');

  track.removeAttribute('hidden');
  bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  if (sub) subEl.textContent = sub;
}

// ── Result Screen ─────────────────────────────────────────────────
let _resultBlob = null;
let _resultFilename = '';

function showResult(blob, filename, meta = '') {
  _resultBlob     = blob;
  _resultFilename = filename;

  const infoEl = document.getElementById('result-file-info');
  const sizeStr = formatFileSize(blob.size);
  infoEl.innerHTML = `
    <span style="font-weight:600;color:var(--text)">${escapeHtml(filename)}</span><br>
    <span style="color:var(--text-2)">${sizeStr}${meta ? ' · ' + meta : ''}</span>
  `;

  showView('result');
}

document.getElementById('btn-download').addEventListener('click', () => {
  if (_resultBlob) triggerDownload(_resultBlob, _resultFilename);
});

document.getElementById('btn-start-over').addEventListener('click', () => {
  AppState.reset();
  showView('home');
});

// ── Utility helpers ───────────────────────────────────────────────
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ── Shared App State ──────────────────────────────────────────────
const AppState = {
  files: [],          // Array of File objects
  activeTool: null,   // string: tool key
  pageOrder: [],      // page indices for PDF operations
  pageRotations: [],  // rotation per page
  selectedPages: new Set(),
  totalPages: 0,      // total pages in loaded PDF (for range selectors)

  reset() {
    this.files = [];
    this.activeTool = null;
    this.pageOrder = [];
    this.pageRotations = [];
    this.selectedPages.clear();
    this.totalPages = 0;
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('page-grid').innerHTML = '';
    document.getElementById('tool-options-panel').innerHTML = '';
    document.getElementById('page-grid-wrapper').setAttribute('hidden', '');
    // Clear file inputs
    ['add-more-input','tool-file-input','tool-camera-input'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
};
