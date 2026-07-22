// ─────────────────────────────────────────────────────────────
// Self-Audit — recursive learning loop checkpoint
// Run: node scripts/self-audit.mjs

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");

const C = { reset: "\x1b[0m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m" };
function ok(m) { console.log("  " + C.green + "\u2713" + C.reset + " " + m); }
function warn(m) { console.log("  " + C.yellow + "\u25b2" + C.reset + " " + m); }
function info(m) { console.log("  " + C.cyan + "\u2192" + C.reset + " " + m); }

function read(p) { try { return readFileSync(p, "utf-8"); } catch { return null; } }

console.log("\n" + C.cyan + "══════════════════════════════════════" + C.reset);
console.log(C.cyan + "  RECURSIVE LEARNING LOOP - SELF AUDIT" + C.reset);
console.log(C.cyan + "══════════════════════════════════════" + C.reset + "\n");

// BUILD STATE
console.log("\n" + C.yellow + "[BUILD STATE]" + C.reset);
const distIndex = join(ROOT, "dist", "index.html");
if (existsSync(distIndex)) {
  const html = read(distIndex);
  const m = html?.match(/src="\/assets\/([^"]+)"/);
  if (m) ok("Built JS bundle: " + m[1]);
} else warn("No dist/index.html");

// GIT STATE
console.log("\n" + C.yellow + "[GIT STATE]" + C.reset);
try {
  const { execSync } = await import("child_process");
  const st = execSync("git status --short", { cwd: ROOT, encoding: "utf-8" }).trim();
  if (st) {
    const n = st.split("\n").filter(Boolean).length;
    warn(n + " uncommitted file(s)");
  } else ok("Clean working tree");
  info("HEAD: " + execSync("git log --oneline -1", { cwd: ROOT, encoding: "utf-8" }).trim());
} catch { warn("Git not available"); }

// DEPLOYMENT
console.log("\n" + C.yellow + "[DEPLOYMENT]" + C.reset);
const pkg = JSON.parse(read(join(ROOT, "package.json")) || "{}");
if (pkg.scripts?.build) ok("Build: " + pkg.scripts.build);
if (pkg.scripts?.start) ok("Start: " + pkg.scripts.start);

// FRONTEND
console.log("\n" + C.yellow + "[FRONTEND]" + C.reset);
const pageDir = join(ROOT, "src", "dashboard", "src", "pages");
if (existsSync(pageDir)) {
  const pages = readdirSync(pageDir).filter(f => f.endsWith(".tsx"));
  ok(pages.length + " pages: " + pages.map(p => p.replace(".tsx", "")).join(", "));
}

console.log("\n" + C.cyan + "══════════════════════════════════════" + C.reset);
console.log(C.cyan + "  AUDIT COMPLETE" + C.reset);
console.log(C.cyan + "══════════════════════════════════════\n" + C.reset);
