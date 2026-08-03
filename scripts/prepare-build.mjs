import { rm } from "node:fs/promises";

await rm(new URL("../docs/_astro/", import.meta.url), { recursive: true, force: true });
