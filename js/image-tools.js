/* ─────────────────────────────────────────────────────────────────
   alyxfiles — js/image-tools.js
   Canvas-based image processing: compress, resize, crop, convert,
   rotate, grayscale, brightness, contrast, sharpen
───────────────────────────────────────────────────────────────── */
'use strict';

// ── Image loader ─────────────────────────────────────────────────
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image.')); };
    img.src = url;
  });
}

// Draw image to canvas and return the canvas
function drawImageToCanvas(img, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

// ── Compress ──────────────────────────────────────────────────────
// quality: 0.0–1.0, format: 'jpeg'|'png'|'webp'
async function compressImage(file, quality = 0.8, format = 'jpeg') {
  const img    = await loadImageFromFile(file);
  const canvas = drawImageToCanvas(img, img.naturalWidth, img.naturalHeight);
  const mime   = `image/${format}`;
  return canvasToBlob(canvas, mime, quality);
}

// ── Resize ────────────────────────────────────────────────────────
async function resizeImage(file, targetWidth, targetHeight, maintainAspect = true, format = 'jpeg', quality = 0.9) {
  const img = await loadImageFromFile(file);
  let w = parseInt(targetWidth)  || img.naturalWidth;
  let h = parseInt(targetHeight) || img.naturalHeight;

  if (maintainAspect && targetWidth && !targetHeight) {
    h = Math.round(img.naturalHeight * (w / img.naturalWidth));
  } else if (maintainAspect && !targetWidth && targetHeight) {
    w = Math.round(img.naturalWidth * (h / img.naturalHeight));
  }

  const canvas = drawImageToCanvas(img, w, h);
  return canvasToBlob(canvas, `image/${format}`, quality);
}

// ── Rotate ────────────────────────────────────────────────────────
async function rotateImage(file, degrees, format = 'jpeg', quality = 0.9) {
  const img  = await loadImageFromFile(file);
  const rad  = (degrees * Math.PI) / 180;
  const sin  = Math.abs(Math.sin(rad));
  const cos  = Math.abs(Math.cos(rad));
  const w    = img.naturalWidth;
  const h    = img.naturalHeight;
  const newW = Math.round(w * cos + h * sin);
  const newH = Math.round(w * sin + h * cos);

  const canvas = document.createElement('canvas');
  canvas.width  = newW;
  canvas.height = newH;
  const ctx = canvas.getContext('2d');
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -w / 2, -h / 2);
  return canvasToBlob(canvas, `image/${format}`, quality);
}

// ── Convert Format ────────────────────────────────────────────────
async function convertImageFormat(file, targetFormat = 'jpeg', quality = 0.9) {
  const img    = await loadImageFromFile(file);
  const canvas = drawImageToCanvas(img, img.naturalWidth, img.naturalHeight);
  return canvasToBlob(canvas, `image/${targetFormat}`, quality);
}

// ── Grayscale ─────────────────────────────────────────────────────
async function grayscaleImage(file, format = 'jpeg', quality = 0.9) {
  const img    = await loadImageFromFile(file);
  const w = img.naturalWidth, h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
    d[i] = d[i+1] = d[i+2] = gray;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas, `image/${format}`, quality);
}

// ── Enhance (brightness + contrast + sharpness) ───────────────────
async function enhanceImage(file, brightness = 0, contrast = 0, sharpen = 0, format = 'jpeg', quality = 0.9) {
  const img = await loadImageFromFile(file);
  const w = img.naturalWidth, h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Brightness & contrast via CSS filter on a temp canvas
  ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`;
  ctx.drawImage(img, 0, 0);
  ctx.filter = 'none';

  // Sharpening via convolution
  if (sharpen > 0) {
    applySharpening(ctx, w, h, sharpen);
  }

  return canvasToBlob(canvas, `image/${format}`, quality);
}

// Simple unsharp-mask-style sharpening kernel
function applySharpening(ctx, w, h, amount) {
  const src   = ctx.getImageData(0, 0, w, h);
  const dst   = ctx.createImageData(w, h);
  const s     = src.data;
  const d     = dst.data;
  const k     = amount / 100; // 0..1

  // Sharpen kernel: center = 1 + 4k, neighbours = -k
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const val = (1 + 4 * k) * s[i + c]
                  - k * s[((y-1)*w+x)*4+c]
                  - k * s[((y+1)*w+x)*4+c]
                  - k * s[(y*w+(x-1))*4+c]
                  - k * s[(y*w+(x+1))*4+c];
        d[i + c] = Math.max(0, Math.min(255, Math.round(val)));
      }
      d[i + 3] = s[i + 3]; // preserve alpha
    }
  }
  ctx.putImageData(dst, 0, 0);
}

// ── Crop ──────────────────────────────────────────────────────────
async function cropImage(file, x, y, cropW, cropH, format = 'jpeg', quality = 0.9) {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width  = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, x, y, cropW, cropH, 0, 0, cropW, cropH);
  return canvasToBlob(canvas, `image/${format}`, quality);
}

// ── Canvas → Blob promise ─────────────────────────────────────────
function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.9) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed.'));
    }, type, quality);
  });
}

// ── Image → single-page PDF using pdf-lib ─────────────────────────
async function imagesToPdf(files) {
  const { PDFDocument } = PDFLib;
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ab   = await file.arrayBuffer();
    const type = file.type;

    let pdfImage;
    if (type === 'image/jpeg' || type === 'image/jpg') {
      pdfImage = await pdfDoc.embedJpg(ab);
    } else {
      // PNG / WebP — convert to PNG first if WebP
      let pngAb = ab;
      if (type === 'image/webp') {
        const blob  = await convertImageFormat(file, 'png', 1.0);
        pngAb = await blob.arrayBuffer();
      }
      pdfImage = await pdfDoc.embedPng(pngAb);
    }

    const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
    page.drawImage(pdfImage, { x: 0, y: 0, width: pdfImage.width, height: pdfImage.height });
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

// ── Thumbnail preview ─────────────────────────────────────────────
async function createImageThumbnail(file, maxW = 80, maxH = 80) {
  const img = await loadImageFromFile(file);
  const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
  const w = Math.round(img.naturalWidth  * ratio);
  const h = Math.round(img.naturalHeight * ratio);
  const c = drawImageToCanvas(img, w, h);
  return c;
}

// ── Output file extension helper ──────────────────────────────────
function imageOutputFilename(originalName, format) {
  const base = originalName.replace(/\.[^.]+$/, '');
  const ext  = format === 'jpeg' ? 'jpg' : format;
  return `${base}.${ext}`;
}
