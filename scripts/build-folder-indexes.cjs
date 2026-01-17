const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "s3");
const OUT_DIR = path.join(process.cwd(), "generated-indexes");

const S3_BUCKET = process.env.S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION;
const KEY_PREFIX = process.env.S3_KEY_PREFIX || "s3";

const PUBLIC_BASE_URL =
    process.env.PUBLIC_BASE_URL ||
    `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;

const IMAGE_EXTS = new Set([
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif", ".bmp", ".tif", ".tiff",
]);

function isImage(name) {
    return IMAGE_EXTS.has(path.extname(name).toLowerCase());
}

function walk(dirAbs, relBase) {
    const out = [];
    const entries = fs.readdirSync(dirAbs, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name));

    for (const e of entries) {
        const abs = path.join(dirAbs, e.name);
        const rel = path.posix.join(relBase, e.name);

        if (e.isDirectory()) {
            out.push(...walk(abs, rel));
            continue;
        }

        if (e.isFile() && isImage(e.name)) {
            const key = `${KEY_PREFIX}/${rel}`; // e.g. s3/app1/foo.png
            out.push({
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

    const topFolders = fs.readdirSync(ROOT, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b));

    for (const folder of topFolders) {
        const abs = path.join(ROOT, folder);
        const files = walk(abs, folder); // include folder name in rel path
        fs.writeFileSync(
            path.join(OUT_DIR, `${folder}.json`),
            JSON.stringify(files, null, 2),
            "utf8"
        );
        console.log(`generated-indexes/${folder}.json (${files.length} files)`);
    }
}

main();
