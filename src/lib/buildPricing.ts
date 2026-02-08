import type { BuildDims, BuildOptions } from "./buildsStore";

/**
 * Very first-pass estimator (upgradeable):
 * - Materials ~ board feet proxy or sheet proxy
 * - Labor ~ complexity + size scaling
 * - Finish ~ depends on type
 * - Overhead/profit baked in
 *
 * Customer sees ONLY: a single total + optional range.
 * Admin later can see breakdown + editable factors.
 */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function money(n: number) {
  return Math.round(n * 100) / 100;
}

function areaSqFt(d: BuildDims) {
  const topSqIn = clamp(d.lengthIn, 1, 10000) * clamp(d.widthIn, 1, 10000);
  return topSqIn / 144;
}

function volumeProxy(d: BuildDims) {
  // simple “size” proxy for labor scaling
  return (clamp(d.lengthIn, 1, 10000) * clamp(d.widthIn, 1, 10000) * clamp(d.heightIn, 1, 10000)) / 1728;
}

function speciesMultiplier(s: BuildOptions["woodSpecies"]) {
  if (s === "Pine") return 1.0;
  if (s === "Poplar") return 1.05;
  if (s === "Plywood") return 1.1;
  if (s === "Oak") return 1.35;
  if (s === "Maple") return 1.45;
  if (s === "Walnut") return 1.9;
  return 1.2;
}

function finishCostPerSqFt(f: BuildOptions["finish"]) {
  if (f === "Natural") return 3;
  if (f === "Stain") return 6;
  if (f === "Paint") return 8;
  if (f === "Poly") return 7;
  return 5;
}

function joineryComplexity(j: BuildOptions["joinery"]) {
  if (j === "Screws") return 1.0;
  if (j === "Pocket Holes") return 1.15;
  if (j === "Dowels") return 1.35;
  if (j === "Mortise & Tenon") return 1.7;
  return 1.2;
}

export function estimateBuild(dims: BuildDims, options: BuildOptions) {
  const a = areaSqFt(dims);
  const v = volumeProxy(dims);

  // Materials base: $45 per sqft (very rough) scaled by species
  const materials = money(45 * a * speciesMultiplier(options.woodSpecies));

  // Labor base hours: 4 + size + joinery complexity
  const laborHours = clamp(4 + v * 0.35, 4, 60) * joineryComplexity(options.joinery);

  // Labor rate (customer-facing baked into total)
  const labor = money(laborHours * 85); // $85/hr placeholder (admin can change later)

  // Finish
  const finish = money(a * finishCostPerSqFt(options.finish));

  // Overhead + profit
  const overhead = money((materials + labor + finish) * 0.18);

  const subtotal = materials + labor + finish + overhead;

  // Uncertainty band
  const rangeLow = money(subtotal * 0.88);
  const rangeHigh = money(subtotal * 1.18);

  return {
    materials,
    labor,
    finish,
    overhead,
    total: money(subtotal),
    rangeLow,
    rangeHigh,
  };
}
