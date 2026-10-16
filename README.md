# ✨ alyxfiles

🌐 **[Open alyxfiles — Live Website](https://alyxfiles.vercel.app/)**

> *Your files. Your browser. Your privacy.*

alyxfiles is a modern, fast, and privacy-focused collection of everyday PDF and image tools designed to work directly in your web browser. There are no complicated menus, no required accounts, and no server uploads for supported tasks — just simple, reliable file utilities right at your fingertips.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![In-Browser Processing](https://img.shields.io/badge/Processing-100%25_Local_Browser-00C853?style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

---

### 🌟 Why alyxfiles?

- 🔒 **Privacy-Conscious** — Supported operations run locally on your device in your browser.
- ⚡ **Instant & Lightweight** — No sign-ups, no software installation, and no waiting queues.
- 📱 **Works Everywhere** — Responsive design that looks and feels great on desktop, tablet, and mobile.
- 🎨 **Minimal & Clean** — An Apple-inspired, distraction-free interface built for speed and clarity.

---

## 🧰 Features for Everyone

Whether you need to combine reports, convert photos, or check a document before sharing it, alyxfiles gives you simple, dedicated tools for everyday file tasks.

### 📄 PDF Tools

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
- 🔁 **Convert Image** — Switch between JPG, PNG, and modern WebP formats in seconds.
- ✨ **Enhance Image** — Fine-tune brightness, contrast, saturation, and sharpness with live visual controls.
- 📄 **Scan Enhance** — Clean up photographed documents and receipts by boosting text contrast and clarity.

---

## 🔒 Privacy First

Your privacy is the core design principle behind alyxfiles.

- 🔐 **No Account Required** — No sign-up, no login, and no email required. Start using any tool immediately.
- 💻 **Local Browser Processing** — Supported operations run directly on your own device using browser capabilities. Your files are not uploaded to an alyxfiles server for processing.
- 📥 **Direct Downloads** — Your processed files are saved directly to your device from your browser's memory.
- 🛡️ **Responsible Guidance** — While client-side processing keeps your files on your device, no browser tool can replace standard caution with sensitive files. For instance, the Privacy Check scans readable text patterns, but cannot guarantee detection of every sensitive detail or analyse image-only scanned documents without OCR.

---

## 🚀 How to Use alyxfiles

Getting started takes just a few clicks:

1. 🌐 **Open the Website** — Visit [alyxfiles](https://alyxfiles.vercel.app/) in any modern web browser.
2. 🧰 **Select a Tool** — Choose the PDF or image tool you need from the dashboard.
3. 📂 **Add Your File** — Drag and drop your file into the workspace or click to browse.
4. ⚙️ **Customize Settings** — Adjust your preferences (page numbers, compression strength, image dimensions, etc.).
5. ▶️ **Process** — Click the action button to let your browser handle the file.
6. 💾 **Download** — Save your finished file directly to your computer or phone.

*(Note: Specific options and steps vary depending on the selected tool.)*

---

## ⚡ Want Maximum Speed? Use It Offline!

You can run alyxfiles directly on your own computer for an even faster, latency-free experience:

1. 📥 **Download the Source** — Download the project files as a ZIP archive onto your computer.
2. 📂 **Extract the Files** — Unzip the archive into any folder on your machine.
3. 📁 **Open the Folder** — Navigate inside the extracted project folder.
4. 🖥️ **Open `index.html`** — Double-click `index.html` to launch alyxfiles in your web browser.
5. 🚀 **Start Using Tools** — Pick your tool and start processing your files locally!

> 💡 **Good to Know for Local Use:**
> - Running locally eliminates network loading times for local files and bundled libraries.
> - Opening `index.html` directly works for many browser features. However, modern browsers may apply strict security restrictions on Web Workers (such as PDF rendering) over the direct `file://` protocol.
> - If a tool does not open or complete when opening `index.html` directly, run a quick local server instead (see the developer section below).
> - Initial visits or fresh sessions may require internet access if any external assets (such as web fonts) need to be loaded. alyxfiles is a static web application and not an offline Progressive Web App (PWA).

---

## ❓ Frequently Asked Questions

#### Is alyxfiles free to use?
Yes! alyxfiles is 100% free with no paywalls, hidden fees, subscriptions, or usage quotas.

#### Do I need to create an account?
No. There is no registration, sign-in, or account creation. You can use any tool immediately without providing personal details.

#### Are my files uploaded to a server?
No. Supported file processing occurs entirely inside your browser on your own device. Files are not sent to or stored on an alyxfiles server.

#### Can I use it on mobile?
Yes. alyxfiles features a responsive interface optimized for smartphones, tablets, and desktop computers alike.

#### Can I run it locally on my computer?
Yes. You can download the project and open `index.html`. For best compatibility across all PDF tools, running a lightweight local server is recommended to satisfy browser worker restrictions.

#### Why might a particular tool fail to open a file?
A tool may fail to open a file if the file is password-protected, encrypted, corrupted, or in an unsupported format. Additionally, unusually large files may exceed your browser tab's available memory.

---

<details>
<summary><strong>🛠️ Developer Details — Click to Expand</strong></summary>
<br />

### 🧰 Technology Stack

- **HTML5** — Semantic, accessible markup with dialog semantics.
- **CSS3** — Custom design system, Apple-inspired glassmorphism, responsive grid layouts, and custom CSS variables.
- **Vanilla JavaScript (ES6+)** — Modular client-side logic with zero framework overhead.
- **Vercel** — Fast global static edge deployment.

### 📁 Project Structure

```text
alyxfiles/
├── index.html               # Main application layout, tool workspaces & modals
├── style.css                # Complete design system, themes & responsive rules
├── script.js                # Core controller, dynamic library loaders & tool logic
├── assets/
│   ├── logo.png             # alyxfiles brand logo
│   ├── alyxfiles-icon.png   # Favicon and browser touch icon
│   └── faizanali_creator.png# Creator profile image
├── lib/
│   ├── pdf-lib.min.js       # Client-side PDF creation, merging & page manipulation
│   ├── pdf.min.js           # Mozilla PDF.js core rendering engine
│   ├── pdf.worker.min.js    # PDF.js background web worker
│   └── jszip.min.js         # Client-side ZIP creation for image exports (v3.10.1)
└── README.md                # Project documentation
```

### ⚙️ Local Development

To run the project locally with full support for web workers and local scripts:

1. Keep all project files and the `lib/` and `assets/` folders in the same directory.
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

- **pdf-lib** (`lib/pdf-lib.min.js`) — Used for modifying and composing PDF documents in memory (merging, splitting, rearranging, deleting pages, rotating, and document combining).
- **PDF.js** (`lib/pdf.min.js` & `lib/pdf.worker.min.js`) — Mozilla's PDF rendering library used to generate page thumbnails and extract text for privacy checks.
- **JSZip** (`lib/jszip.min.js` v3.10.1) — Creates in-memory ZIP archives when downloading multiple images from the PDF → Image tool.
- **HTML5 Canvas API** — Browser-native image processing engine used for resizing, cropping, compression, color enhancement, scan clarity, and format conversions (JPG/PNG/WebP).

### 🧪 Implementation Notes

- **Dynamic On-Demand Loading**: Heavy libraries in `lib/` are loaded asynchronously via Promises only when the corresponding tool is opened, keeping initial page load fast and lightweight.
- **In-Memory Operations**: File transformations use browser `ArrayBuffer`, `Blob`, and `Canvas` data structures, ensuring no files persist on disk or are transferred to remote backends.
- **Encrypted Files**: Password-protected PDFs cannot be read or processed client-side without credentials, and will return an informative error.
- **Browser Memory Limits**: Because processing runs inside browser memory, performance depends on the client machine's available RAM and browser limits.

### 🚀 Deployment

alyxfiles is statically deployed on Vercel. Because the project consists purely of static HTML, CSS, JavaScript, and local library files, it requires zero build steps or server configurations.

### 🤝 Contributing

Contributions and ideas are welcome! You can improve the project by:
- Testing tools with diverse PDF and image formats.
- Enhancing responsive styles and accessibility across devices.
- Keeping dependencies lightweight, vanilla, and client-side focused.

</details>

---

Made with ❤️ by **Faizan Ali**

[📸 Instagram — @faiizanaly](https://www.instagram.com/faiizanaly/)

*Simple tools. Thoughtful design. Privacy-conscious processing.*
