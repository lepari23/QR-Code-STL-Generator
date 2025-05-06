/* ---------- libs ---------- */
import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/controls/OrbitControls.js?module";
import { STLExporter } from "https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/exporters/STLExporter.js?module";
import qrcode from "https://esm.sh/qrcode-generator@1.4.4?bundle";
import * as BufferGeometryUtils from "https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/utils/BufferGeometryUtils.js?module";

/* ---------- DOM ---------- */
const viewerBox = document.querySelector(".viewer-box");
const canvas = document.getElementById("viewer");
const dataInput = document.getElementById("qr-data");
const eccSel = document.getElementById("qr-ecc");
const verSel = document.getElementById("qr-version");
const unitSel = document.getElementById("units");
const sizeInput = document.getElementById("plate-size");
const depthInput = document.getElementById("depth");

const addBaseChk = document.getElementById("add-base");
const baseScaleInput = document.getElementById("base-scale");
const baseDepthInput = document.getElementById("base-depth");

const genBtn = document.getElementById("generate");
const dlBtn = document.getElementById("download");

/* populate version dropdown: Auto + V1‑V10 */
verSel.innerHTML =
  `<option value="0" selected>Auto</option>` +
  Array.from(
    { length: 10 },
    (_, i) => `<option value="${i + 1}">V${i + 1}</option>`
  ).join("");

/* ---------- Three scene ---------- */
const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
scene.add(new THREE.DirectionalLight(0xffffff, 0.9));

const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
cam.position.set(150, 120, 150);
cam.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(0x222426);
const controls = new OrbitControls(cam, renderer.domElement);
controls.enableDamping = true;

window.addEventListener("resize", resize);
resize();
function resize() {
  const w = viewerBox.clientWidth;
  renderer.setSize(w, w, false);
  cam.aspect = 1;
  cam.updateProjectionMatrix();
}

/* ---------- helpers ---------- */
const mm = () => ({ mm: 1, cm: 10, in: 25.4 }[unitSel.value]);
let mesh = null;

function buildGeometry() {
  const text = dataInput.value.trim() || "https://example.com";

  let qr;
  try {
    qr = qrcode(+verSel.value || 0, eccSel.value);
    qr.addData(text);
    qr.make();
    const actualVersion = qr.typeNumber;

    if (+verSel.value !== 0 && actualVersion !== +verSel.value) {
      throw new Error(
        `Data doesn't fit in version ${verSel.value}. It needs version ${actualVersion} or higher.`
      );
    }
  } catch (err) {
    alert("❌ QR code generation failed:\n" + err.message);
    throw err; // stop execution so bad geometry isn’t rendered
  }

  const modules = qr.getModuleCount();
  const plateMM = +sizeInput.value * mm();
  const depthMM = +depthInput.value * mm();
  const cell = plateMM / modules;

  const boxes = [];
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (qr.isDark(r, c)) {
        const box = new THREE.BoxGeometry(cell, depthMM, cell).translate(
          -plateMM / 2 + c * cell + cell / 2,
          depthMM / 2,
          -plateMM / 2 + (modules - r - 1) * cell + cell / 2
        );
        boxes.push(box);
      }
    }
  }

  /* 4) Optional backing plate */
  if (addBaseChk.checked) {
    const scale = Math.max(1, +baseScaleInput.value);
    const baseEdge = plateMM * scale;
    const baseThick = +baseDepthInput.value * mm();

    /* Base square */
    const base = new THREE.BoxGeometry(baseEdge, baseThick, baseEdge).translate(
      0,
      baseThick / 2,
      0
    );

    /* Lift QR voxels on top of base */
    boxes.forEach((b) => b.translate(0, baseThick, 0));
    boxes.push(base);
  }

  /* 5) Merge everything */
  return BufferGeometryUtils.mergeGeometries(boxes, false);
}

function refresh() {
  if (mesh) scene.remove(mesh);
  mesh = new THREE.Mesh(
    buildGeometry(),
    new THREE.MeshStandardMaterial({ color: 0x333366, roughness: 0.4 })
  );
  scene.add(mesh);
}

/* ---------- filename helper ---------- */
const fmt = (n) => (+n.toFixed(3)).toString().replace(".", ",");
function fname() {
  const u = unitSel.value;
  const baseTag = addBaseChk.checked
    ? `_b-${fmt(+baseScaleInput.value)}_bt-${fmt(+baseDepthInput.value)}`
    : "";
  return `qr_${u}_${fmt(+sizeInput.value)}x${fmt(+sizeInput.value)}_d-${fmt(
    +depthInput.value
  )}${baseTag}.stl`;
}

/* ---------- events ---------- */
genBtn.onclick = refresh;
dlBtn.onclick = () => {
  const stl = new STLExporter().parse(mesh, { binary: false });
  const blob = new Blob([stl], { type: "model/stl" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: fname(),
  });
  a.click();
  URL.revokeObjectURL(a.href);
};

/* ---------- first draw & loop ---------- */
refresh();
(function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, cam);
})();
