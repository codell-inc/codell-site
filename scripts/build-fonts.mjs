import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import subsetFont from "subset-font";

const root = fileURLToPath(new URL("../", import.meta.url));
// The video production site keeps its own Google Fonts families.
const excludedDirectories = new Set(["fonts", "video-production"]);
// Always available so typed form input and short labels never fall back mid-word.
const baseCharacters = Array.from({ length: 0x7f - 0x20 }, (_, index) => String.fromCharCode(0x20 + index)).join("") + "、。・「」『』（）［］〜ー…‐–—→←×？！：；％＆＠＃＄＊＋＝／￥";

export const fonts = [
  { family: "Noto Sans JP", source: "NotoSansJP-Variable.ttf", output: "noto-sans-jp.woff2", axes: { wght: { min: 400, max: 800 } }, license: "OFL-NotoSansJP.txt" },
  { family: "Inter", source: "Inter-Variable.ttf", output: "inter.woff2", axes: { wght: { min: 400, max: 800 }, opsz: 14 }, license: "OFL-Inter.txt" },
];

async function files(directory, extension) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory() && !excludedDirectories.has(entry.name)) found.push(...await files(full, extension));
    else if (entry.isFile() && entry.name.endsWith(extension)) found.push(full);
  }
  return found;
}

const decode = (text) => text
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
  .replace(/&(amp|lt|gt|quot|apos|nbsp|copy);/g, (_, name) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", copy: "©" })[name]);

/** Every character the company pages can render: page text, visible attributes and strings set from scripts. */
export async function collectCharacters(outputDir) {
  let text = baseCharacters;
  for (const file of await files(outputDir, ".html")) {
    const html = await readFile(file, "utf8");
    text += html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
    for (const [, value] of html.matchAll(/\b(?:placeholder|value|alt|title|aria-label)="([^"]*)"/g)) text += value;
  }
  for (const file of await files(path.join(outputDir, "_astro"), ".js")) text += await readFile(file, "utf8");
  return [...new Set(decode(text))].filter((character) => character.codePointAt(0) >= 0x20).sort().join("");
}

export async function buildFonts({ outputDir = path.join(root, "docs"), sourceDir = path.join(root, "fonts") } = {}) {
  const characters = await collectCharacters(outputDir);
  const fontDir = path.join(outputDir, "fonts");
  await mkdir(fontDir, { recursive: true });
  const faces = [];
  for (const font of fonts) {
    const subset = await subsetFont(await readFile(path.join(sourceDir, font.source)), characters, { targetFormat: "woff2", variationAxes: font.axes });
    await writeFile(path.join(fontDir, font.output), subset);
    await copyFile(path.join(sourceDir, font.license), path.join(fontDir, font.license));
    faces.push(`@font-face{font-family:"${font.family}";font-style:normal;font-weight:${font.axes.wght.min} ${font.axes.wght.max};font-display:swap;src:url("/fonts/${font.output}") format("woff2")}`);
    console.log(`fonts/${font.output}: ${characters.length} characters, ${Math.round(subset.length / 1024)} KiB`);
  }
  await writeFile(path.join(fontDir, "fonts.css"), `${faces.join("\n")}\n`);
  return { characters };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) await buildFonts();
