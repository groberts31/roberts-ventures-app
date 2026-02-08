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

function normNotes(n: string | undefined) {
  return String(n || "").trim().toLowerCase();
}

function has(notes: string, ...phrases: string[]) {
  return phrases.some((p) => notes.includes(p));
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

/**
 * Notes-driven features (simple heuristics, safe defaults):
 * - "lower shelf", "bottom shelf", "shelf" -> adds a shelf panel for table/bench/workbench
 * - "apron" -> adds apron rails (unless notes include "no apron")
 * - "drawer" -> adds a simple drawer box under top (front-facing)
 * - "taper" / "tapered legs" -> visually tapers legs using mesh scaling
 * - "feet" -> adds small feet blocks for planter/cabinet
 *
 * This is NOT photoreal; it's an improving proxy model based on customer intent.
 */
function buildModel(args: {
  projectType: string;
  dims: BuildDims;
  options: BuildOptions;
  notes?: string;
}) {
  const group = new THREE.Group();
  const notes = normNotes(args.notes);

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

  const isTable = t.includes("table");
  const isBench = t.includes("bench");
  const isWorkbench = t.includes("workbench");

  // --- TABLE / BENCH / WORKBENCH (top + 4 legs) ---
  if (isTable || isBench || isWorkbench) {
    const topY = height - topThickness / 2;

    // Top
    geoms.push(addBox(group, length, topThickness, depth, 0, topY, 0, woodMat));

    // Legs
    const legH = Math.max(2, height - topThickness);
    const inset = clamp(legSize * 0.65, 1.25, 4.5);

    const lx1 = xMin + inset + legSize / 2;
    const lx2 = xMax - inset - legSize / 2;
    const lz1 = zMin + inset + legSize / 2;
    const lz2 = zMax - inset - legSize / 2;

    const legY = legH / 2;

    const legGeom = new THREE.BoxGeometry(legSize, legH, legSize);

    function addLeg(x: number, z: number) {
      const mesh = new THREE.Mesh(legGeom, darkMat);
      mesh.position.set(x, legY, z);

      // Notes: tapered legs (visual taper using non-uniform scale)
      if (has(notes, "taper", "tapered leg", "tapered legs")) {
        // slightly narrower at the top by scaling X/Z a bit (simple proxy)
        // Using scale affects the whole mesh uniformly; we fake taper by scaling and adding a small "cap"
        mesh.scale.set(0.88, 1, 0.88);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(legSize * 0.92, legSize * 0.18, legSize * 0.92), darkMat);
        cap.position.set(x, legH - (legSize * 0.09), z);
        group.add(cap);
        geoms.push(cap.geometry as THREE.BufferGeometry);
      }

      group.add(mesh);
    }

    addLeg(lx1, lz1);
    addLeg(lx2, lz1);
    addLeg(lx1, lz2);
    addLeg(lx2, lz2);

    geoms.push(legGeom);

    // Notes: apron rails (default on workbench, optional on table/bench)
    const wantsApron = isWorkbench || (has(notes, "apron") && !has(notes, "no apron", "noapron"));
    if (wantsApron) {
      const apronH = clamp(height * 0.12, 2, 6);
      const apronY = height - topThickness - apronH / 2;

      // Front/back rails (along X)
      geoms.push(addBox(group, length - inset * 2, apronH, boardT, 0, apronY, zMax - inset - boardT / 2, darkMat));
      geoms.push(addBox(group, length - inset * 2, apronH, boardT, 0, apronY, zMin + inset + boardT / 2, darkMat));

      // Left/right rails (along Z)
      geoms.push(addBox(group, boardT, apronH, depth - inset * 2, xMin + inset + boardT / 2, apronY, 0, darkMat));
      geoms.push(addBox(group, boardT, apronH, depth - inset * 2, xMax - inset - boardT / 2, apronY, 0, darkMat));
    }

    // Notes: lower shelf / bottom shelf
    const wantsShelf = isWorkbench || has(notes, "lower shelf", "bottom shelf") || (has(notes, "shelf") && !has(notes, "no shelf"));
    if (wantsShelf) {
      const shelfY = clamp(legH * 0.28, 6, legH - 8);
      const shelfT = clamp(boardT, 0.6, 1.5);
      geoms.push(addBox(group, length - inset * 2 - legSize * 0.2, shelfT, depth - inset * 2 - legSize * 0.2, 0, shelfY, 0, woodMat));
    }

    // Notes: drawer (simple centered drawer under top, front-facing)
    if (has(notes, "drawer", "drawers")) {
      const drawerH = clamp(height * 0.18, 3, 8);
      const drawerW = clamp(length * 0.35, 10, length - 10);
      const drawerD = clamp(depth * 0.45, 8, depth - 6);
      const drawerY = height - topThickness - drawerH / 2 - 1.2;
      const drawerZ = zMax - drawerD / 2 - 1.2;

      geoms.push(addBox(group, drawerW, drawerH, drawerD, 0, drawerY, drawerZ, darkMat));

      // drawer face
      const faceT = clamp(boardT * 0.8, 0.4, 1.1);
      geoms.push(addBox(group, drawerW * 0.96, drawerH * 0.92, faceT, 0, drawerY, zMax - 0.6, woodMat));
    }

    // Simple stretcher for workbench feel
    if (isWorkbench) {
      const stretcherH = clamp(legSize * 0.45, 0.8, 2.0);
      const stretcherY = clamp(legH * 0.35, 6, legH - 4);
      geoms.push(addBox(group, length - inset * 2 - legSize, stretcherH, legSize * 0.6, 0, stretcherY, 0, darkMat));
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

    geoms.push(addBox(group, sideT, upH, depth, -upX, upY, 0, woodMat));
    geoms.push(addBox(group, sideT, upH, depth,  upX, upY, 0, woodMat));

    // Shelves: bottom, mid, top
    const insideL = Math.max(8, length - sideT * 2);
    const shelfCount = has(notes, "5 shelf", "five shelf") ? 5 : has(notes, "4 shelf", "four shelf") ? 4 : 3;

    for (let i = 0; i < shelfCount; i++) {
      const frac = (i + 1) / (shelfCount + 1);
      const y = clamp(frac * (height - shelfT) + shelfT / 2, shelfT / 2, height - shelfT / 2);
      geoms.push(addBox(group, insideL, shelfT, depth, 0, y, 0, woodMat));
    }
  }

  // --- CABINET (box with shelf + back) ---
  else if (t.includes("cabinet")) {
    const wallT = clamp(boardT, 0.6, 1.25);
    const shelfT = wallT;
    const insideL = Math.max(10, length - wallT * 2);
    const insideD = Math.max(8, depth - wallT * 2);

    geoms.push(addBox(group, length, wallT, depth, 0, wallT / 2, 0, woodMat));                        // bottom
    geoms.push(addBox(group, length, wallT, depth, 0, height - wallT / 2, 0, woodMat));               // top
    geoms.push(addBox(group, wallT, height, depth, -length / 2 + wallT / 2, height / 2, 0, woodMat)); // left
    geoms.push(addBox(group, wallT, height, depth,  length / 2 - wallT / 2, height / 2, 0, woodMat)); // right
    geoms.push(addBox(group, length, height, wallT, 0, height / 2, -depth / 2 + wallT / 2, woodMat)); // back

    // Shelf count from notes
    const shelves = has(notes, "2 shelf", "two shelf") ? 2 : has(notes, "3 shelf", "three shelf") ? 3 : 1;
    for (let i = 0; i < shelves; i++) {
      const frac = (i + 1) / (shelves + 1);
      const y = clamp(frac * (height - shelfT) + shelfT / 2, shelfT / 2, height - shelfT / 2);
      geoms.push(addBox(group, insideL, shelfT, insideD, 0, y, wallT / 2, woodMat));
    }

    // Notes: feet
    if (has(notes, "feet", "legs")) {
      const foot = clamp(wallT * 1.2, 0.8, 2.2);
      const fy = foot / 2;
      geoms.push(addBox(group, foot, foot, foot, xMin + foot, fy, zMin + foot, darkMat));
      geoms.push(addBox(group, foot, foot, foot, xMax - foot, fy, zMin + foot, darkMat));
      geoms.push(addBox(group, foot, foot, foot, xMin + foot, fy, zMax - foot, darkMat));
      geoms.push(addBox(group, foot, foot, foot, xMax - foot, fy, zMax - foot, darkMat));
    }
  }

  // --- PLANTER BOX (open top, 4 walls + bottom) ---
  else if (t.includes("planter")) {
    const wallT = clamp(boardT, 0.6, 1.5);
    const bottomT = wallT;

    geoms.push(addBox(group, length, bottomT, depth, 0, bottomT / 2, 0, woodMat)); // bottom

    const wallH = Math.max(8, height - bottomT);
    const wallY = bottomT + wallH / 2;

    // front/back
    geoms.push(addBox(group, length, wallH, wallT, 0, wallY,  depth / 2 - wallT / 2, woodMat));
    geoms.push(addBox(group, length, wallH, wallT, 0, wallY, -depth / 2 + wallT / 2, woodMat));

    // left/right
    geoms.push(addBox(group, wallT, wallH, depth - wallT * 2, -length / 2 + wallT / 2, wallY, 0, woodMat));
    geoms.push(addBox(group, wallT, wallH, depth - wallT * 2,  length / 2 - wallT / 2, wallY, 0, woodMat));

    // Notes: feet
    if (has(notes, "feet", "legs", "stand")) {
      const foot = clamp(wallT * 1.25, 0.8, 2.4);
      const fy = foot / 2;
      geoms.push(addBox(group, foot, foot, foot, xMin + foot, fy, zMin + foot, darkMat));
      geoms.push(addBox(group, foot, foot, foot, xMax - foot, fy, zMin + foot, darkMat));
      geoms.push(addBox(group, foot, foot, foot, xMin + foot, fy, zMax - foot, darkMat));
      geoms.push(addBox(group, foot, foot, foot, xMax - foot, fy, zMax - foot, darkMat));
    }
  }

  // --- DEFAULT (fallback block) ---
  else {
    geoms.push(addBox(group, length, height, depth, 0, height / 2, 0, woodMat));
  }

  return { group, length, depth, height, geoms };
}

export async function renderBuildPreviewPng(args: {
  view: View;
  projectType: string;
  title?: string;
  notes?: string;
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

  // Model (now notes-aware)
  const model = buildModel({
    projectType: args.projectType,
    dims: args.dims,
    options: args.options,
    notes: args.notes,
  });
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
