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
  // Simple, readable “wood-ish” tones (not photoreal). Upgrade later.
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
  // Slight material feel differences
  if (finish === "Natural") return { roughness: 0.65, metalness: 0.02 };
  if (finish === "Stain") return { roughness: 0.55, metalness: 0.03 };
  if (finish === "Paint") return { roughness: 0.35, metalness: 0.01 };
  if (finish === "Poly") return { roughness: 0.25, metalness: 0.04 };
  return { roughness: 0.55, metalness: 0.03 };
}

function makeCamera(view: View, size: number) {
  // Orthographic camera keeps outputs consistent for “render boxes”
  const frustum = size;
  const cam = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0.1, 4000);

  if (view === "top") {
    cam.position.set(0, 520, 0.001);
  } else if (view === "front") {
    cam.position.set(0, 140, 520);
  } else if (view === "detail") {
    cam.position.set(260, 220, 260);
  } else {
    cam.position.set(340, 240, 340);
  }

  cam.lookAt(0, 0, 0);
  cam.updateProjectionMatrix();
  return cam;
}

function fitToView(length: number, width: number, height: number) {
  // Determine a reasonable frustum size based on object dimensions
  const maxDim = Math.max(length, width, height);
  return clamp(maxDim * 1.05, 60, 520);
}

function makeTableProxy(params: {
  length: number;
  depth: number;
  height: number;
  topT: number;
  legT: number;
  mat: THREE.MeshStandardMaterial;
}) {
  const g = new THREE.Group();

  const { length, depth, height, topT, legT, mat } = params;

  // Top slab centered at origin X/Z, sitting at the top
  const topGeom = new THREE.BoxGeometry(length, topT, depth);
  const top = new THREE.Mesh(topGeom, mat);
  top.position.set(0, height - topT / 2, 0);
  g.add(top);

  // Legs only if there is enough height to show them
  const legHeight = Math.max(0, height - topT);
  if (legHeight >= 4) {
    const legGeom = new THREE.BoxGeometry(legT, legHeight, legT);

    // Inset a bit so legs aren’t flush to edges (looks more realistic)
    const insetX = Math.max(legT / 2, Math.min(3.5, length * 0.08));
    const insetZ = Math.max(legT / 2, Math.min(3.5, depth * 0.08));

    const xL = -length / 2 + insetX;
    const xR =  length / 2 - insetX;
    const zF =  depth / 2 - insetZ;
    const zB = -depth / 2 + insetZ;

    const y = legHeight / 2;

    const leg1 = new THREE.Mesh(legGeom, mat); leg1.position.set(xL, y, zF);
    const leg2 = new THREE.Mesh(legGeom, mat); leg2.position.set(xR, y, zF);
    const leg3 = new THREE.Mesh(legGeom, mat); leg3.position.set(xL, y, zB);
    const leg4 = new THREE.Mesh(legGeom, mat); leg4.position.set(xR, y, zB);

    g.add(leg1, leg2, leg3, leg4);
  }

  return g;
}

export async function renderBuildPreviewPng(args: {
  view: View;
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

  // Dimensions (inches -> scene units)
  const L = safeIn(args.dims.lengthIn, 48);
  const D = safeIn(args.dims.widthIn, 24);
  const Ht = safeIn(args.dims.heightIn, 30);

  const length = clamp(L, 6, 240);
  const depth  = clamp(D, 6, 240);
  const height = clamp(Ht, 6, 240);

  const topT = clamp(safeIn(args.dims.topThicknessIn ?? 1.5, 1.5), 0.75, Math.min(6, height * 0.35));
  const legT = clamp(Math.max(1.25, Math.min(3.0, Math.min(length, depth) * 0.08)), 1.25, 4);

  const sheen = finishSheen(args.options.finish);
  const mat = new THREE.MeshStandardMaterial({
    color: woodColor(args.options.woodSpecies),
    roughness: sheen.roughness,
    metalness: sheen.metalness,
  });

  // Model: table-like proxy (top + legs)
  const model = makeTableProxy({ length, depth, height, topT, legT, mat });
  scene.add(model);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    new THREE.MeshStandardMaterial({ color: 0x0f1a2f, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  const grid = new THREE.GridHelper(1000, 36, 0x334155, 0x1f2a44);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.25;
  scene.add(grid);

  // Camera
  const frustumSize = fitToView(length, depth, height);
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

  // Orthographic aspect fit
  const aspect = W / H;
  const ortho = camera as THREE.OrthographicCamera;
  const s = frustumSize;
  ortho.left = -s * aspect;
  ortho.right = s * aspect;
  ortho.top = s;
  ortho.bottom = -s;
  ortho.updateProjectionMatrix();

  renderer.render(scene, camera);

  // Cleanup (important if many renders)
  renderer.dispose();
  mat.dispose();
  (ground.geometry as THREE.BufferGeometry).dispose();
  (ground.material as THREE.Material).dispose();
  (grid.geometry as THREE.BufferGeometry).dispose();
  (grid.material as THREE.Material).dispose();

  return canvas.toDataURL("image/png");
}
