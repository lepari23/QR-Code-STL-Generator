# QR-to-STL Generator

This is a simple browser-based tool that converts QR codes into 3D-printable STL files.  
It uses `three.js` to render the model and exports clean geometry you can slice and print.

👉 **Live site:**  
[https://lepari23.github.io/QR-Code-STL-Generator](https://lepari23.github.io/QR-Code-STL-Generator)

---

## 🧩 Features

- **Input custom data** to encode as a QR code (e.g. URLs, text, etc.)
- Choose **error correction level**: L (7%), M (15%), Q (25%), H (30%)
- Optionally select **QR version (size)** from 1–10 or let it auto-size
- Set **real-world dimensions**:
  - Units: millimeters / centimeters / inches
  - Width/height of the QR plate
  - Extrusion depth (thickness)
- **Optional flat base** under the QR code
  - You can set its width and depth
- Interactive 3D preview with rotation and zoom
- **Download clean ASCII STL** files
  - Filenames include dimensions and units for easy tracking

---

## 🛠 Tech Stack

- Vanilla JS + ES Modules
- [`three.js`](https://threejs.org/) (via CDN import map)
- [`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator)
- No bundler, framework, or install needed — runs 100% client-side

---

## 🚧 Limitations

- Supports **QR version 1–10** (the full spec goes up to 40)
- Long or complex text may **exceed the selected version**
  - You’ll get a helpful popup if this happens

---

## 💡 Contributing

If you have ideas, bug reports, or want to request features, please [open an issue](https://github.com/lepari23/QR-Code-STL-Generator/issues).  

---

## 📄 License

MIT — free for personal and commercial use. Attribution appreciated but not required.
