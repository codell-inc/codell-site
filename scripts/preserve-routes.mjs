import { access, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const outputRoot = new URL("../docs/", import.meta.url);
const compatibilityRoutes = [
  ["contact/index.html", "contact.html"],
];

for (const [source, target] of compatibilityRoutes) {
  await copyFile(new URL(source, outputRoot), new URL(target, outputRoot));
}

for (const requiredPath of ["index.html", "contact.html", "sonovade/index.html", "CNAME", ".nojekyll"]) {
  await access(fileURLToPath(new URL(requiredPath, outputRoot)));
}
