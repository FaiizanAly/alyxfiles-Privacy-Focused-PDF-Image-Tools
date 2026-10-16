# alyxfiles

A privacy-focused PDF and image utility website. Every file is processed directly in your browser — nothing is ever uploaded to a server.

🌐 **Live Website:** [https://alyxfiles.vercel.app/](https://alyxfiles.vercel.app/)
📦 **GitHub Repository:** [https://github.com/FaiizanAly/alyxfiles-Privacy-Focused-PDF-Image-Tools](https://github.com/FaiizanAly/alyxfiles-Privacy-Focused-PDF-Image-Tools)

---

## ✨ Features

### 📄 PDF Tools

| Tool | Description |
|---|---|
| **Merge PDF** | Combine multiple PDFs into one file |
| **Split PDF** | Extract specific pages or ranges from a PDF |
| **Delete Pages** | Remove specific pages from a PDF with visual page thumbnails |
| **Organize PDF** | Reorder, rotate, or delete pages with a visual drag-and-drop interface |
| **Rotate PDF** | Rotate all or selected pages 90°, 180°, or 270° |
| **Compress PDF** | Reduce PDF file size via structural repack (lossless) or page rasterisation (lossy), with a live size preview |
| **PDF → Image** | Convert PDF pages to JPG or PNG; multi-page output is downloaded as a ZIP |
| **Image → PDF** | Convert one or more images (JPG, PNG, WEBP) into a single PDF |
| **Merge Documents** | Combine PDFs and images (JPG, PNG, WEBP) into one PDF in any order |
| **PDF Privacy Check** | Scan a PDF for sensitive information — metadata, text patterns, form fields, annotations, and embedded files — before sharing it |

### 🖼️ Image Tools

| Tool | Description |
|---|---|
| **Compress Image** | Reduce image file size; output format selectable as JPG, PNG, or WebP |
| **Resize Image** | Change image dimensions with optional aspect-ratio lock |
| **Crop Image** | Crop to custom dimensions or preset aspect ratios with a live preview |
| **Convert Image** | Convert between JPG, PNG, and WebP formats |
| **Enhance Image** | Adjust brightness, contrast, saturation, and sharpness in real time |
| **Scan Enhance** | Sharpen and improve photographed documents by adjusting contrast, brightness, and sharpness |

---

## 🔒 Privacy & Local Processing

All file processing happens inside your browser using JavaScript. Files are **never uploaded** to any server for processing.

- **No account required.** No sign-up, no login.
- **No server-side processing.** Every operation runs locally in your browser tab.
- **No persistent storage.** Files and results are held in memory only for the duration of your session.
- **No analytics on file contents.** alyxfiles does not read, log, or transmit what is inside your files.

> **Note:** The website itself is hosted on Vercel. Loading the page requires an internet connection. Once loaded, all tool operations work offline — your files do not leave your device. PDF Privacy Check, like all other tools, processes files entirely in the browser.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom design system, no framework) |
| Logic | Vanilla JavaScript (ES2017+) |
| PDF reading / rendering | [PDF.js](https://mozilla.github.io/pdf.js/) (bundled locally) |
| PDF creation / editing | [pdf-lib](https://pdf-lib.js.org/) (bundled locally) |
| ZIP creation | [JSZip v3.10.1](https://stuk.github.io/jszip/) (bundled locally) |
| Hosting | [Vercel](https://vercel.com/) (static deployment) |

All JavaScript libraries are bundled inside the `lib/` folder. No CDN requests are made at runtime.

---

## 🚀 How to Use

1. Open [alyxfiles.vercel.app](https://alyxfiles.vercel.app/) in your browser.
2. Select a tool from the PDF or image section.
3. Add your file using the drag-and-drop area or the file picker. For multi-file tools (Merge PDF, Image → PDF, Merge Documents), you can add files one at a time and they will be appended to the list in order.
4. Adjust any options (compression level, page range, output format, etc.).
5. Click the action button to process.
6. Download your result.

---

## 💻 Running Locally

No build tools, package managers, or servers are needed.

1. Clone or download the repository.
2. Open `index.html` directly in a modern browser (Chrome, Edge, Firefox, Safari).

```
File → Open File → index.html
```

> **Important:** Some browsers block local JavaScript workers by default when opening files with `file://`. If PDF tools fail to load locally, serve the folder through a simple local server instead:
>
> ```bash
> # Python 3
> python -m http.server 8080
> # Then open http://localhost:8080
> ```

All libraries are loaded from the `lib/` folder using relative paths, so no internet connection is required once the files are on your machine.

---

## 📁 Project Structure

```
alyxfiles/
├── index.html              # Single-page application shell and all tool cards
├── script.js               # All tool logic, UI rendering, and file processing
├── style.css               # Full design system and responsive styles
├── assets/
│   ├── logo.png            # Site logo
│   └── alyxfiles-icon.png  # Favicon / app icon
└── lib/
    ├── pdf.min.js          # PDF.js — PDF rendering and text/metadata extraction
    ├── pdf.worker.min.js   # PDF.js Web Worker (required for PDF.js to function)
    ├── pdf-lib.min.js      # pdf-lib — PDF creation, editing, and manipulation
    └── jszip.min.js        # JSZip v3.10.1 — ZIP archive creation
```

---

## ⚠️ Known Limitations

- **PDF compression results vary.** Compression works by repacking PDF structure (lossless) or rasterising pages to JPEG (lossy). Files already heavily compressed, or PDFs with mostly vector graphics, may see little size reduction.
- **Password-protected PDFs** may not open correctly. Tools attempt to load with `ignoreEncryption`, but encrypted content may be inaccessible.
- **PDF Privacy Check is pattern-based.** Text scanning uses regular expressions to find potential matches (emails, phone numbers, Aadhaar-like patterns, PAN-like patterns). It cannot guarantee that all sensitive content is detected, and some matches may be false positives. It does not perform OCR on image-based PDFs.
- **No OCR support.** If a PDF consists entirely of scanned images rather than selectable text, Privacy Check will warn you but cannot extract or analyse the image content.
- **Image tools accept JPG, PNG, and WEBP only.** Other formats (GIF, TIFF, BMP, SVG, HEIC, etc.) are not supported.
- **Merge Documents accepts PDF, JPG, PNG, and WEBP only.** Word documents, spreadsheets, and other office formats are not supported.
- **Large files may be slow.** All processing runs on the main browser thread or a Web Worker. Very large PDFs (100+ MB) or high-resolution images may take time depending on device performance.

---

## ❤️ Credits

Created by **Faizan Ali**

[![Instagram](https://img.shields.io/badge/Instagram-@faiizanaly-E53935?style=flat&logo=instagram&logoColor=white)](https://www.instagram.com/faiizanaly/)
