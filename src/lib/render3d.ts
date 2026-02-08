import * as THREE from "three";
import type { BuildDims, BuildOptions } from "./buildsStore";

type View = "iso" | "front" | "top" | "detail";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeIn(n: number, fallback: number) {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function woodColor(species: BuildOptions["woodSpecies"]) {
  // Simple readable tones (non-photoreal). Upgrade later with textures.
  switch (species) {
    case "Pine": return 0xE6D2A6;
    case "Poplar": return 0xD8E0A8;
    case "Plywood": return 0xD9C7A3;
    case "Oak": return 0xC8A06C;
    case "Maple": return 0xEAD9B6;
    case "Walnut": return 0x6B4A2E;
    default: return 0xC8A06C;
  }
}

function finishSheen(finish: BuildOptions["finish"]) {
  if (finish === "Natural") return { roughness: 0.65, metalness: 0.02 };
  if (finish === "Stain") return { roughness: 0.55, metalness: 0.03 };
  if (finish === "Paint") return { roughness: 0.35, metalness: 0.01 };
  if (finish === "Poly") return { roughness: 0.25, metalness: 0.04 };
  return { roughness: 0.55, metalness: 0.03 };
}

function fitToView(length: number, depth: number, height: number) {
  const maxDim = Math.max(length, depth, height);
  return clamp(maxDim * 0.95, 40, 320);
}

function makeCamera(view: View, frustumSize: number) {
  const cam = new THREE.OrthographicCamera(
    -frustumSize, frustumSize, frustumSize, -frustumSize,
    0.1, 4000
  );

  if (view === "top") {
    cam.position.set(0, 600, 0.001);
  } else if (view === "front") {
    cam.position.set(0, 220, 600);
  } else if (view === "detail") {
    cam.position.set(420, 280, 420);
  } else {
    cam.position.set(520, 360, 520); // iso
  }

  cam.lookAt(0, 0, 0);
  cam.updateProjectionMatrix();
  return cam;
}

function normType(t: string) {
  return String(t || "").trim().toLowerCase();
}

function addBox(
  group: THREE.Group,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  mat: THREE.Material
) {
  const geom = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return geom;
}

function buildModel(args: {
  projectType: string;
  dims: BuildDims;
  options: BuildOptions;
}) {
  const group = new THREE.Group();

  // Interpret dims consistently:
  // lengthIn => X (long)
  // widthIn  => Z (depth)
  // heightIn => Y (overall height)
  const length = clamp(safeIn(args.dims.lengthIn, 60), 12, 240);
  const depth  = clamp(safeIn(args.dims.widthIn, 30), 10, 240);
  const height = clamp(safeIn(args.dims.heightIn, 30), 10, 240);

  const topThickness = clamp(safeIn(args.dims.topThicknessIn ?? 1.5, 1.5), 0.5, 6);

  const sheen = finishSheen(args.options.finish);
  const woodMat = new THREE.MeshStandardMaterial({
    color: woodColor(args.options.woodSpecies),
    roughness: sheen.roughness,
    metalness: sheen.metalness,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85,
    metalness: 0.05,
  });

  const t = normType(args.projectType);

  // Shared thickness defaults (inches-as-units)
  const boardT = clamp(Math.min(depth, length) * 0.035, 0.6, 1.25); // panel/board thickness
  const legSize = clamp(Math.min(depth, length) * 0.06, 1.5, 4.0);

  // Helpers
  const xMin = -length / 2;
  const xMax =  length / 2;
  const zMin = -depth  / 2;
  const zMax =  depth  / 2;

  const geoms: THREE.BufferGeometry[] = [];

  // --- TABLE / BENCH / WORKBENCH (top + 4 legs) ---
    // (We will write valid TS below)
  // NOTE: keep one model per type.

  const isTable = t.includes("table");
  const isBench = t.includes("bench");
  const isWorkbench = t.includes("workbench");

  if (isTable || isBench || isWorkbench) {
    const topY = height - topThickness / 2;

    // Top
    geoms.push(addBox(group, length, topThickness, depth, 0, topY, 0, woodMat) as any);

    // Legs
    const legH = Math.max(2, height - topThickness);
    const inset = clamp(legSize * 0.65, 1.25, 4.5);

    const lx1 = xMin + inset + legSize / 2;
    const lx2 = xMax - inset - legSize / 2;
    const lz1 = zMin + inset + legSize / 2;
    const lz2 = zMax - inset - legSize / 2;

    const legY = legH / 2;

    geoms.push(addBox(group, legSize, legH, legSize, lx1, legY, lz1, darkMat) as any);
    geoms.push(addBox(group, legSize, legH, legSize, lx2, legY, lz1, darkMat) as any);
    geoms.push(addBox(group, legSize, legH, legSize, lx1, legY, lz2, darkMat) as any);
    geoms.push(addBox(group, legSize, legH, legSize, lx2, legY, lz2, darkMat) as any);

    // Simple stretcher for workbench feel (optional but helps “accuracy”)
    if (isWorkbench) {
      const stretcherH = clamp(legSize * 0.45, 0.8, 2.0);
      const stretcherY = clamp(legH * 0.35, 6, legH - 4);
      geoms.push(addBox(group, length - inset * 2 - legSize, stretcherH, legSize * 0.6, 0, stretcherY, 0, darkMat) as any);
    }
  }

  // --- SHELF (two uprights + shelves) ---
  else if (t.includes("shelf")) {
    const sideT = boardT;
    const shelfT = boardT;

    // Uprights (left/right)
    const upH = height;
    const upY = upH / 2;
    const upX = length / 2 - sideT / 2;

    geoms.push(addBox(group, sideT, upH, depth, -upX, upY, 0, woodMat) as any);
    geoms.push(addBox(group, sideT, upH, depth,  upX, upY, 0, woodMat) as any);

    // Shelves: bottom, mid, top (inside the uprights)
    const insideL = Math.max(8, length - sideT * 2);
    const shelfZ = 0;

    const shelfCount = 3;
    for (let i = 0; i < shelfCount; i++) {
      const frac = (i + 1) / (shelfCount + 1); // 1/4, 2/4, 3/4
      const y = clamp(frac * (height - shelfT) + shelfT / 2, shelfT / 2, height - shelfT / 2);
      geoms.push(addBox(group, insideL, shelfT, depth, 0, y, shelfZ, woodMat) as any);
    }
  }

  // --- CABINET (box with shelves + back panel feel) ---
  else if (t.includes("cabinet")) {
    const wallT = clamp(boardT, 0.6, 1.25);
    const shelfT = wallT;
    const insideL = Math.max(10, length - wallT * 2);
    const insideD = Math.max(8, depth - wallT * 2);

    // Bottom / Top / Sides / Back
    geoms.push(addBox(group, length, wallT, depth, 0, wallT / 2, 0, woodMat) as any);                 // bottom
    geoms.push(addBox(group, length, wallT, depth, 0, height - wallT / 2, 0, woodMat) as any);          // top
    geoms.push(addBox(group, wallT, height, depth, -length / 2 + wallT / 2, height / 2, 0, woodMat) as any); // left
    geoms.push(addBox(group, wallT, height, depth,  length / 2 - wallT / 2, height / 2, 0, woodMat) as any); // right
    geoms.push(addBox(group, length, height, wallT, 0, height / 2, -depth / 2 + wallT / 2, woodMat) as any); // back

    // One shelf
    const shelfY = height * 0.55;
    geoms.push(addBox(group, insideL, shelfT, insideD, 0, shelfY, wallT / 2, woodMat) as any);
  }

  // --- PLANTER BOX (open top, 4 walls + bottom) ---
  else if (t.includes("planter")) {
    const wallT = clamp(boardT, 0.6, 1.5);
    const bottomT = wallT;

    // Bottom
    geoms.push(addBox(group, length, bottomT, depth, 0, bottomT / 2, 0, woodMat) as any);

    // Walls
    const wallH = Math.max(8, height - bottomT);
    const wallY = bottomT + wallH / 2;

    // front/back
    geoms.push(addBox(group, length, wallH, wallT, 0, wallY,  depth / 2 - wallT / 2, woodMat) as any);
    geoms.push(addBox(group, length, wallH, wallT, 0, wallY, -depth / 2 + wallT / 2, woodMat) as any);

    // left/right
    geoms.push(addBox(group, wallT, wallH, depth - wallT * 2, -length / 2 + wallT / 2, wallY, 0, woodMat) as any);
    geoms.push(addBox(group, wallT, wallH, depth - wallT * 2,  length / 2 - wallT / 2, wallY, 0, woodMat) as any);
  }

  // --- DEFAULT (fallback block) ---
  else {
    geoms.push(addBox(group, length, height, depth, 0, height / 2, 0, woodMat) as any);
  }

  return { group, length, depth, height, geoms };
}

export async function renderBuildPreviewPng(args: {
  view: View;
  projectType: string;
  title?: string;
  dims: BuildDims;
  options: BuildOptions;
  width?: number;
  height?: number;
}) {
  const W = args.width ?? 1200;
  const H = args.height ?? 800;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1220);

  // Lights
  const hemi = new THREE.HemisphereLight(0xBBD7FF, 0x101827, 0.95);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xFFFFFF, 1.05);
  key.position.set(240, 280, 200);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xA78BFA, 0.55);
  rim.position.set(-260, 160, -200);
  scene.add(rim);

  // Model
  const model = buildModel({ projectType: args.projectType, dims: args.dims, options: args.options });
  scene.add(model.group);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    new THREE.MeshStandardMaterial({ color: 0x0f1a2f, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  const grid = new THREE.GridHelper(1000, 32, 0x334155, 0x1f2a44);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.25;
  scene.add(grid);

  // Camera
  const frustumSize = fitToView(model.length, model.depth, model.height);
  const camera = makeCamera(args.view, frustumSize);

  // Renderer (offscreen)
  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H, false);

  // Ortho aspect correction
  const aspect = W / H;
  const ortho = camera as THREE.OrthographicCamera;
  const s = frustumSize;
  ortho.left = -s * aspect;
  ortho.right = s * aspect;
  ortho.top = s;
  ortho.bottom = -s;
  ortho.updateProjectionMatrix();

  renderer.render(scene, camera);

  // Cleanup
  model.geoms.forEach((g) => g.dispose());

  (ground.geometry as THREE.BufferGeometry).dispose();
  (ground.material as THREE.Material).dispose();
  (grid.geometry as THREE.BufferGeometry).dispose();
  (grid.material as THREE.Material).dispose();
  renderer.dispose();

  return canvas.toDataURL("image/png");
}
