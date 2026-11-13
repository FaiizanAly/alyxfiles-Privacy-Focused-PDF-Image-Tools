# ✨ alyxfiles

🌐 **[Open alyxfiles — Live Website](https://alyxfiles.vercel.app/)**

> *Your files. Your browser. Your privacy.*

alyxfiles is a modern, fast, and privacy-focused collection of everyday PDF and image tools designed to work directly in your web browser. There are no complicated menus, no required accounts, and no server uploads for supported tasks — just simple, reliable file utilities right at your fingertips.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![PWA Ready](https://img.shields.io/badge/PWA-Installable_&_Offline-5A0FC8?style=flat-square)
![In-Browser Processing](https://img.shields.io/badge/Processing-100%25_Local_Browser-00C853?style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

---

### 🌟 Why alyxfiles?

- 🔒 **Privacy-Conscious** — Supported operations run locally on your device in your browser.
- ⚡ **Instant & Lightweight** — No sign-ups, no software installation, and no waiting queues.
- 📲 **Installable Progressive Web App (PWA)** — Install directly onto your desktop or mobile home screen and use cached tools even without an internet connection.
- 🚀 **Batch Processing** — Compress, resize, or convert multiple files in a single pass with ZIP downloads.
- 📱 **Works Everywhere** — Responsive design that looks and feels great on desktop, tablet, and mobile.
- 🎨 **Minimal & Clean** — An Apple-inspired, distraction-free interface built for speed and clarity.

---

## 🧰 Features for Everyone

Whether you need to combine reports, convert documents, optimize photos in bulk, or check a document before sharing it, alyxfiles gives you simple, dedicated tools for everyday file tasks.

### ⚡ Batch Processing

- 🖼️ **Batch Images** — Compress, resize, or convert multiple images simultaneously.
  - Multi-file drag & drop and browse with the ability to add more files without losing earlier selections.
  - Compression quality adjustment slider (10% to 100%).
  - Dimensions scaling by percentage (75%, 50%, 25%) or maximum pixel constraints.
  - Format conversion across JPG, PNG, and WebP.
  - Non-blocking sequential processing queue with cancel support.
  - Real-time progress bar, individual file status, and single-click "Download All as ZIP".
- 📄 **Batch PDF** — Process multiple PDF documents together.
  - Batch PDF compression with client-side object stream optimization.
  - Batch PDF to Image extraction.
  - Clear file lists with individual file removal and batch cancellation.
  - Download individual results or bundle everything as a ZIP archive.

### 📄 Document & Word Conversion Tools

- 📝 **Word → PDF** — Convert Microsoft Word (`.docx`) documents to PDF directly inside your browser.
  - Extracts headings, paragraphs, formatted text, and bullet lists using Mammoth.js.
  - In-browser visual document preview prior to conversion.
  - High-resolution client-side PDF generation.
  - *Formatting Note:* Preserves core text, headings, and formatting. Complex desktop layouts, custom desktop fonts, embedded macros, or complex vector shapes may render with minor visual variations.
- 📄 **PDF → Word** — Extract text from PDF documents and save them as an editable Microsoft Word (`.docx`) file.
  - Text extraction powered by Mozilla's PDF.js.
  - Page-by-page extracted text preview with character counts.
  - Generates structured DOCX documents with headings, paragraphs, and page breaks.
  - *Limitations Notice:* Works on text-based PDFs. Scanned/image-only PDFs require Optical Character Recognition (OCR), which is not supported in-browser. Complex multi-column layouts and tables are simplified for editing.

### 📑 PDF Tools

- 📑 **Merge PDF** — Combine multiple PDF files into one clean, organized document.
- ✂️ **Split PDF** — Extract specific pages or custom page ranges into a separate PDF.
- 🗑️ **Delete Pages** — Visually inspect page thumbnails and remove unwanted pages with a single click.
- 🗂️ **Organize PDF** — Rearrange page order, rotate individual pages, or delete pages with an intuitive visual editor.
- 🔄 **Rotate PDF** — Fix upside-down or sideways pages by rotating all or selected pages by 90°, 180°, or 270°.
- 🗜️ **Compress PDF** — Reduce file size using multiple optimization modes for easy emailing and sharing.
- 🖼️ **PDF to Images** — Turn PDF pages into high-quality JPG or PNG images, with a one-click ZIP download for multiple pages.
- 📄 **Images to PDF** — Convert your photos and graphics into a single, beautifully formatted PDF document.
- 🧩 **Merge Documents** — Seamlessly combine PDFs and supported images (JPG, PNG, WebP) into one unified PDF in any order you choose.
- 🛡️ **PDF Privacy Check** — Scan document text locally for potential sensitive data (such as emails, phone numbers, and card numbers) before sharing.

### 🖼️ Image Tools

- 🗜️ **Compress Image** — Shrink image file sizes while keeping great visual quality, with real-time size previews.
- 📐 **Resize Image** — Scale images to exact pixel dimensions with an optional aspect-ratio lock.
- ✂️ **Crop Image** — Trim images freely or lock to popular aspect ratios (1:1 square, 4:3, 16:9, and more).
- 🔄 **Convert Image** — Switch between JPG, PNG, and modern WebP formats in seconds.
- ✨ **Enhance Image** — Fine-tune brightness, contrast, saturation, and sharpness with live visual controls.
- 📄 **Scan Enhance** — Clean up photographed documents and receipts by boosting text contrast and clarity.

---

## 📲 Installable App & Offline Mode (PWA)

alyxfiles is a fully compliant Progressive Web App (PWA).

### How to Install:
- **Chrome / Edge / Brave (Desktop):** Click the **Install App** button in the navigation bar, or click the install icon in your browser address bar.
- **Android:** Tap **Install App** in the navigation bar or select *Install app* / *Add to Home Screen* from Chrome's menu.
- **iOS (Safari):** Tap the **Share** button in Safari and choose **Add to Home Screen**.

### Offline Support:
- Once installed or visited once, the core application shell, styles, scripts, and local libraries are cached locally on your device.
- You can launch alyxfiles without an internet connection and use cached tools (PDF compression, image tools, batch processing, document conversion) 100% locally.
- When you are offline, a friendly status banner informs you that Offline Mode is active.
- If an uncached page is requested while offline, a branded offline fallback screen is presented with a "Try Again" option.
- **Important Privacy & Cache Rule:** Your files, uploaded images, PDFs, and generated documents are **never cached** or stored in persistent browser storage.

---

## 🔒 Privacy First

Your privacy is the core design principle behind alyxfiles.

- 🔓 **No Account Required** — No sign-up, no login, and no email required. Start using any tool immediately.
- 💻 **Local Browser Processing** — Supported operations run directly on your own device using browser capabilities. Your files are not uploaded to an alyxfiles server for processing.
- 📥 **Direct Downloads** — Your processed files are saved directly to your device from your browser's memory.
- 🛡️ **Responsible Guidance** — While client-side processing keeps your files on your device, no browser tool can replace standard caution with sensitive files. For instance, the Privacy Check scans readable text patterns, but cannot guarantee detection of every sensitive detail or analyse image-only scanned documents without OCR.

---

## 🚀 How to Use alyxfiles

Getting started takes just a few clicks:

1. 🌐 **Open the Website** — Visit [alyxfiles](https://alyxfiles.vercel.app/) in any modern web browser or open the installed PWA.
2. 🧰 **Select a Tool** — Choose any PDF, image, document, or batch tool from the dashboard.
3. 📁 **Add Your File(s)** — Drag and drop your file into the workspace or click to browse.
4. ⚙️ **Customize Settings** — Adjust your preferences (page numbers, compression strength, image dimensions, etc.).
5. ▶️ **Process** — Click the action button to let your browser handle the file locally.
6. 💾 **Download** — Save your finished file or ZIP bundle directly to your computer or phone.

---

## ❓ Frequently Asked Questions

#### Is alyxfiles free to use?
Yes! alyxfiles is 100% free with no paywalls, hidden fees, subscriptions, or usage quotas.

#### Do I need to create an account?
No. There is no registration, sign-in, or account creation. You can use any tool immediately without providing personal details.

#### Are my files uploaded to a server?
No. Supported file processing occurs entirely inside your browser on your own device. Files are not sent to or stored on an alyxfiles server.

#### Can I use it on mobile?
Yes. alyxfiles features a responsive interface optimized for smartphones, tablets, and desktop computers alike. You can also add it to your home screen as a PWA.

#### Does Word to PDF or PDF to Word upload my documents?
No. All Word-to-PDF and PDF-to-Word operations run strictly inside your browser using client-side JavaScript libraries (Mammoth.js, docx.js, PDF.js, and jsPDF).

#### Can PDF to Word convert scanned PDFs?
PDF to Word extracts text from digital, text-based PDF documents. Scanned PDFs (photographed or scanned pages stored as pictures) require Optical Character Recognition (OCR), which is not currently performed client-side. The tool will warn you if no readable text is detected.

#### Can I use alyxfiles without an internet connection?
Yes! Once visited or installed as a PWA, the app shell and libraries are cached so you can use the supported tools completely offline.

---

<details>
<summary><strong>🛠️ Developer Details — Click to Expand</strong></summary>
<br />

### 🧬 Technology Stack

- **HTML5** — Semantic, accessible markup with dialog semantics and Web App Manifest integration.
- **CSS3** — Custom design system, Apple-inspired aesthetics, responsive grid layouts, and custom CSS variables.
- **Vanilla JavaScript (ES6+)** — Modular client-side logic with zero framework overhead.
- **Progressive Web App (PWA)** — Service Worker with Cache Storage API and Web App Manifest (`manifest.json`, `sw.js`, `offline.html`).
- **Vercel** — Fast global static edge deployment.

### 📁 Project Structure

```text
alyxfiles/
├── index.html               # Main application layout, tool workspaces & modals
├── style.css                # Complete design system, themes, batch styles & responsive rules
├── script.js                # Core controller, dynamic library loaders & tool logic
├── manifest.json            # Web App Manifest for PWA installation
├── sw.js                    # Service Worker with smart caching and offline support
├── offline.html             # Standalone branded offline fallback screen
├── assets/
│   ├── logo.png             # alyxfiles brand logo
│   ├── alyxfiles-icon.png   # Favicon and PWA application icon (192x192 & 512x512)
│   └── faizanali_creator.png# Creator profile image
├── lib/
│   ├── pdf-lib.min.js       # Client-side PDF creation, merging & page manipulation
│   ├── pdf.min.js           # Mozilla PDF.js core rendering engine
│   ├── pdf.worker.min.js    # PDF.js background web worker
│   ├── jszip.min.js         # Client-side ZIP creation for batch exports & images
│   ├── mammoth.browser.min.js# Client-side DOCX to HTML conversion
│   ├── docx.umd.min.js      # Client-side DOCX file generator
│   ├── jspdf.umd.min.js     # Client-side PDF document generator
│   └── html2canvas.min.js   # Client-side DOM to canvas renderer
└── README.md                # Project documentation
```

### ⚙️ Local Development

To run the project locally with full support for service workers and web workers:

1. Keep all project files, `lib/`, and `assets/` folders in the same directory.
2. Start a simple local HTTP server from the project directory:

```bash
# Using Python 3
python -m http.server 8080
```

3. Open your browser and navigate to:
```text
http://localhost:8080
```

*(Python is used only to serve static files locally; it is not part of the website's runtime stack.)*

### 📚 Libraries and Dependencies

- **pdf-lib** (`lib/pdf-lib.min.js`) — Modifies and composes PDF documents in memory (merging, splitting, rearranging, deleting pages, rotating, and batch compression).
- **PDF.js** (`lib/pdf.min.js` & `lib/pdf.worker.min.js`) — Mozilla's PDF rendering library used to generate page thumbnails, convert PDF pages to images, extract text for privacy checks, and extract text for PDF-to-Word conversion.
- **JSZip** (`lib/jszip.min.js`) — Creates in-memory ZIP archives for Batch Processing downloads and multi-page image exports.
- **Mammoth.js** (`lib/mammoth.browser.min.js`) — Converts `.docx` files to HTML for client-side Word previewing and PDF conversion.
- **docx.js** (`lib/docx.umd.min.js`) — Generates native Microsoft Word (`.docx`) files from extracted text in PDF to Word.
- **jsPDF** (`lib/jspdf.umd.min.js`) & **html2canvas** (`lib/html2canvas.min.js`) — Renders formatted HTML into multi-page A4 PDFs for Word to PDF conversion.
- **HTML5 Canvas API** — Browser-native image processing engine used for resizing, cropping, compression, color enhancement, scan clarity, batch operations, and format conversions (JPG/PNG/WebP).

### 🧪 Implementation Notes

- **Dynamic On-Demand Loading**: Heavy libraries in `lib/` are loaded asynchronously via Promises only when the corresponding tool is opened, keeping initial page load fast and lightweight.
- **In-Memory Operations**: File transformations use browser `ArrayBuffer`, `Blob`, and `Canvas` data structures, ensuring no files persist on disk or are transferred to remote backends.
- **Service Worker Caching**: The Service Worker caches application assets on install (`CACHE_ASSETS`), serves cached files offline, and uses network-first for navigation with fallback to `offline.html`. User files and generated blobs are strictly excluded from Cache Storage.
- **Encrypted Files**: Password-protected PDFs cannot be read or processed client-side without credentials, and return an informative error.
- **Browser Memory Limits**: Because processing runs inside browser memory, batch performance depends on the client machine's available RAM and browser limits. Sequential execution queues prevent UI freezing.

### 🚀 Deployment

alyxfiles is statically deployed on Vercel. Because the project consists purely of static HTML, CSS, JavaScript, and local library files, it requires zero build steps or server configurations.

### 🤝 Contributing

Contributions and ideas are welcome! You can improve the project by:
- Testing tools with diverse PDF, Word, and image formats.
- Enhancing responsive styles and accessibility across devices.
- Keeping dependencies lightweight, vanilla, and client-side focused.

</details>

---

Made with ❤️ by **Faizan Ali**

[📸 Instagram — @faiizanaly](https://www.instagram.com/faiizanaly/)

*Simple tools. Thoughtful design. Privacy-conscious processing.*
