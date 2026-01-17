#!/usr/bin/env node

/**
 * Run from ./scripts:
 *   node test-build-folder-indexes.cjs
 *
 * Or from repo root:
 *   node scripts/test-build-folder-indexes.cjs
 */

const fs = require("fs");
const path = require("path");

// Determine repo root:
// - If this file is in /scripts, repo root is one level up from this file.
// This works regardless of current working directory.
const repoRoot = path.resolve(__dirname, "..");

// Ensure process runs from repo root (so the indexer that uses process.cwd() works)
process.chdir(repoRoot);

// Defaults for local testing (override via env vars if you want)
process.env.S3_BUCKET = process.env.S3_BUCKET || "hansik-dummy-images";
process.env.AWS_REGION = process.env.AWS_REGION || "eu-north-1";
process.env.S3_KEY_PREFIX = process.env.S3_KEY_PREFIX || "s3";
// Optional: PUBLIC_BASE_URL=https://cdn.example.com

const s3Dir = path.join(repoRoot, "s3");
if (!fs.existsSync(s3Dir)) {
    console.error("❌ ./s3 directory not found at:", s3Dir);
    process.exit(1);
}

console.log("▶ Running local folder index build from:", repoRoot);
console.log("  S3_BUCKET:", process.env.S3_BUCKET);
console.log("  AWS_REGION:", process.env.AWS_REGION);
console.log("  S3_KEY_PREFIX:", process.env.S3_KEY_PREFIX);
console.log("  PUBLIC_BASE_URL:", process.env.PUBLIC_BASE_URL || "(auto)");

// Run the actual generator
try {
    require(path.join(repoRoot, "scripts", "build-folder-indexes.js"));
} catch (err) {
    console.error("❌ Failed to run scripts/build-folder-indexes.js");
    console.error(err);
    process.exit(1);
}

// Validate output
const outDir = path.join(repoRoot, "generated-indexes");
if (!fs.existsSync(outDir)) {
    console.error("❌ generated-indexes/ was not created:", outDir);
    process.exit(1);
}

const files = fs.readdirSync(outDir).filter((f) => f.endsWith(".json"));

console.log("✔ Generated index files:");
for (const f of files) {
    const p = path.join(outDir, f);
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    console.log(`  - ${path.join("generated-indexes", f)}: ${data.length} entries`);
}

console.log("✔ Local index generation OK");
