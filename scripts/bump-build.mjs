import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const metaPath = path.join(root, "build-meta.json");
const outPath = path.join(root, "apps", "frontend", "src", "generated", "buildInfo.ts");

const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
meta.build += 1;

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const dateStamp = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}-${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;

const version = `${meta.major}.${meta.minor}.${meta.build}-${dateStamp}`;

fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n", "utf8");

const content = `export const BUILD_NUMBER = ${meta.build};\nexport const BUILD_TIMESTAMP = \"${dateStamp}\";\nexport const VERSION_LABEL = \"${version}\";\n`;
fs.writeFileSync(outPath, content, "utf8");

console.log(`Updated build to ${meta.build} (${version})`);
