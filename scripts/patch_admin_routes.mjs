import fs from "fs";
import path from "path";

const SRC = path.join(process.cwd(), "src");

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx|js|jsx)$/.test(ent.name)) out.push(p);
  }
  return out;
}

const files = walk(SRC);

// Heuristic: pick the first file that looks like the router root
const candidates = files.filter(f => {
  const t = fs.readFileSync(f, "utf8");
  return t.includes("react-router-dom") && (t.includes("<Routes") || t.includes("createBrowserRouter") || t.includes("RouterProvider"));
});

if (!candidates.length) {
  console.error("❌ Could not find a router file in src/. (No <Routes / createBrowserRouter / RouterProvider found)");
  process.exit(1);
}

const target = candidates[0];
let txt = fs.readFileSync(target, "utf8");

// Add imports if missing
function ensureImport(needle, lineToAdd) {
  if (!txt.includes(needle)) {
    txt = txt.replace(/from\s+["']react-router-dom["'];\s*\n/, m => m + lineToAdd + "\n");
  }
}
function ensureTopImport(lineToAdd) {
  if (!txt.includes(lineToAdd)) {
    txt = lineToAdd + "\n" + txt;
  }
}

// Ensure AdminGuard + AdminLoginPage imports
if (!txt.includes('from "./admin/AdminGuard"') && !txt.includes('from "../admin/AdminGuard"')) {
  // Prefer relative from same folder
  const rel = path.relative(path.dirname(target), path.join(SRC, "admin", "AdminGuard")).replace(/\\/g, "/");
  ensureTopImport(`import AdminGuard from "${rel.startsWith(".") ? rel : "./" + rel}";`);
}
if (!txt.includes('from "./admin/AdminLoginPage"') && !txt.includes('from "../admin/AdminLoginPage"')) {
  const rel = path.relative(path.dirname(target), path.join(SRC, "admin", "AdminLoginPage")).replace(/\\/g, "/");
  ensureTopImport(`import AdminLoginPage from "${rel.startsWith(".") ? rel : "./" + rel}";`);
}

// If using <Routes> style, insert a login route and protect /admin routes.
// We do NOT assume exact formatting — we match loosely.
if (txt.includes("<Routes")) {
  // Ensure /admin/login route exists
  if (!txt.match(/path\s*=\s*["']\/admin\/login["']/)) {
    txt = txt.replace(/<Routes[^>]*>\s*/m, match => match + `\n        <Route path="/admin/login" element={<AdminLoginPage />} />\n`);
  }

  // Wrap admin routes (except /admin/login) by turning:
  // <Route path="/admin" element={<AdminPage />} />
  // into:
  // <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
  //
  // Also handles /admin/... paths.
  txt = txt.replace(
    /<Route([^>]*?)path\s*=\s*["'](\/admin(?!\/login)[^"']*)["']([^>]*?)element\s*=\s*{([^}]+)}([^\/>]*)\/>/g,
    (m, a, pth, c, el, tail) => {
      const elTrim = el.trim();
      // avoid double-wrapping
      if (elTrim.includes("AdminGuard")) return m;
      return `<Route${a}path="${pth}"${c}element={<AdminGuard>${elTrim}</AdminGuard>}${tail} />`;
    }
  );
}

// If createBrowserRouter style, we’ll do a minimal injection if possible.
// (If your app uses this and it doesn’t patch cleanly, we’ll adjust next.)
fs.writeFileSync(target, txt, "utf8");
console.log("✅ Patched router file:", target);
