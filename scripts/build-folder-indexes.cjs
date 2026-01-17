const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "s3");
const OUT_DIR = path.join(process.cwd(), "generated-indexes");

const S3_BUCKET = process.env.S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION;

const PUBLIC_BASE_URL =
    process.env.PUBLIC_BASE_URL ||
    `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;

const IMAGE_EXTS = new Set([
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif", ".bmp", ".tif", ".tiff",
]);

function isImage(name) {
    return IMAGE_EXTS.has(path.extname(name).toLowerCase());
}

function walk(dirAbs, relBase, app) {
    const out = [];
    const entries = fs
        .readdirSync(dirAbs, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name));

    for (const e of entries) {
        const abs = path.join(dirAbs, e.name);
        const rel = path.posix.join(relBase, e.name);

        if (e.isDirectory()) {
            out.push(...walk(abs, rel, app));
            continue;
        }

        if (e.isFile() && isImage(e.name)) {
            const key = rel; // bucket key has NO s3/ prefix
            out.push({
                app,
                key,
                url: `${PUBLIC_BASE_URL}/${key}`,
            });
        }
    }

    return out;
}

function main() {
    if (!S3_BUCKET || !AWS_REGION) {
        console.error("Missing env S3_BUCKET or AWS_REGION");
        process.exit(1);
    }
    if (!fs.existsSync(ROOT)) {
        console.error("Missing ./s3 directory");
        process.exit(1);
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });

    const index = [];

    const topFolders = fs
        .readdirSync(ROOT, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b));

    for (const folder of topFolders) {
        const abs = path.join(ROOT, folder);
        index.push(...walk(abs, folder, folder));
    }

    // stable ordering
    index.sort((a, b) => {
        const appCmp = (a.app || "").localeCompare(b.app || "");
        if (appCmp !== 0) return appCmp;
        return (a.key || "").localeCompare(b.key || "");
    });

    const output = `// AUTO-GENERATED — DO NOT EDIT
// Generated at ${new Date().toISOString()}

const IMAGE_INDEX = ${JSON.stringify(index, null, 2)};

export default IMAGE_INDEX;
`;

    fs.writeFileSync(path.join(OUT_DIR, "index.js"), output, "utf8");
    console.log(`generated-indexes/index.js written (${index.length} entries)`);
}

main();
