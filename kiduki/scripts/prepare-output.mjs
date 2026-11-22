import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function prepareOutput({ root, target }) {
  if (!["production", "staging"].includes(target))
    throw new Error("Expected production or staging");
  const build = path.join(root, "build");
  const out = path.join(root, ".pages-deploy");
  if (!existsSync(path.join(build, "index.html"))) throw new Error("Build KiDUKi first");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  cpSync(build, out, { recursive: true });
  for (const marker of ["functions", "_worker.js", "_routes.json"]) {
    rmSync(path.join(out, marker), { recursive: true, force: true });
  }
  if (target === "staging") {
    cpSync(path.join(root, "staging-functions"), path.join(out, "functions"), { recursive: true });
    writeFileSync(
      path.join(out, "_routes.json"),
      `${JSON.stringify({ version: 1, include: ["/*"], exclude: [] }, null, 2)}\n`,
    );
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareOutput({ root: fileURLToPath(new URL("../", import.meta.url)), target: process.argv[2] });
}
