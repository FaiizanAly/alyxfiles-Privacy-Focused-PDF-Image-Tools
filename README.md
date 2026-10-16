# alyxfiles

**A simple, fast and privacy-focused toolkit for PDFs and images.**  
Everyday file tools, right in your browser.

🌐 **Live Website:** https://alyxfiles.vercel.app/

---

## ✨ PDF Tools

📄 **Merge PDF** — Combine multiple PDF files into one.

✂️ **Split PDF** — Extract selected pages or page ranges from a PDF.

🗑️ **Delete Pages** — Remove unwanted pages with visual page thumbnails.

📑 **Organize PDF** — Reorder, rotate, or delete pages using a visual interface.

🔄 **Rotate PDF** — Rotate all or selected pages by 90°, 180°, or 270°.

🗜️ **Compress PDF** — Reduce PDF file size using the available compression methods.

🖼️ **PDF → Image** — Convert PDF pages to JPG or PNG. Multiple images can be downloaded as a ZIP.

📷 **Image → PDF** — Convert supported images into a single PDF.

🧩 **Merge Documents** — Combine PDFs and supported images (JPG, PNG, WEBP) into one PDF in your chosen order.

🛡️ **PDF Privacy Check** — Check supported PDF content for potential sensitive information before sharing.

## 🖼️ Image Tools

🗜️ **Compress Image** — Reduce image file size and choose a supported output format.

📐 **Resize Image** — Change image dimensions with an optional aspect-ratio lock.

✂️ **Crop Image** — Crop images to custom dimensions or preset aspect ratios.

🔁 **Convert Image** — Convert between supported JPG, PNG, and WebP formats.

✨ **Enhance Image** — Adjust brightness, contrast, saturation, and sharpness.

📄 **Scan Enhance** — Improve photographed documents with image adjustments.

---

## 🔒 Privacy First

alyxfiles is designed to process supported files locally in your browser rather than upload them to a server for processing.

- 🔐 **No account required** — no sign-up or login.
- 💻 **Local processing** — supported operations run on your device in the browser.
- 📥 **Your results, your device** — download processed files directly.
- 📴 **Offline use** — a local copy may work without internet when its required files and libraries are available.

> **Note:** The live website is hosted on Vercel, so opening it for the first time requires an internet connection. Offline behavior can vary by browser and tool. For sensitive work, disconnect from the internet and verify that your chosen tool still works.

No browser-based tool can guarantee perfect security or detect every possible piece of sensitive information.

## 🚀 How to Use

1. 🌐 Open https://alyxfiles.vercel.app/ or open your local copy.
2. 🧰 Choose a PDF or image tool.
3. 📂 Add your file using the file picker or drag-and-drop area.
4. ⚙️ Adjust the available settings.
5. ▶️ Start processing.
6. 💾 Download your result.

For multi-file tools, add files in the order you want them processed and review the list before starting.

## ⚠️ Good to Know

- 🗜️ **Compression results vary:** some files may not shrink much, depending on their contents and existing compression.
- 🛡️ **Privacy Check has limits:** it can detect some text patterns, but may miss sensitive information or flag harmless text. Image-only scanned pages may not be analysed without OCR.
- 📁 **Supported formats are limited:** Merge Documents supports PDF, JPG, PNG, and WEBP. Word documents and spreadsheets are not supported.
- 🔑 **Encrypted or damaged PDFs:** password-protected or corrupted files may fail to open or process.
- 🐢 **Large files:** processing speed depends on your device, browser, available memory, and file size.

## ❤️ Credits

Made with ❤️ by **Faizan Ali**.

📸 [Instagram — @faiizanaly](https://www.instagram.com/faiizanaly/)

---

<details>
<summary><strong>🛠️ For Developers</strong></summary>

### 💻 Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Vercel static hosting

### 📚 Local Libraries

The project may include browser-side libraries for PDF processing and ZIP creation. Check the local `lib/` folder and script references in your copy for the exact libraries and versions.

### 📁 Project Structure

```text
alyxfiles/
├── index.html
├── script.js
├── style.css
├── assets/
└── lib/
```

The exact files may vary by project version. Refer to your local project for the current structure.

### ▶️ Run Locally

1. Download or clone the project.
2. Keep the HTML, CSS, JavaScript, assets, and required libraries together.
3. Open `index.html` in a modern browser.

Some browsers restrict PDF workers or other features when opened with `file://`. If a tool does not work correctly, try an optional local server from the project folder:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Python is only needed for this optional local-server workaround; it is not part of the website's application stack.

### 🧪 Development Notes

- Keep required libraries local if offline use is important.
- Avoid CDN dependencies for tools intended to work offline.
- Verify offline behavior with the network disconnected.
- Test downloaded output files, not just the interface.
- Keep privacy claims aligned with the actual code and network behavior.

</details>
