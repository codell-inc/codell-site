import { readdir, stat } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const pagesFileLimit = 25 * 1024 * 1024;
const staticDirectory = new URL("../static/", import.meta.url);

describe("Cloudflare Pages static assets", () => {
  it("keeps every published static file within the 25 MiB upload limit", async () => {
    const entries = await readdir(staticDirectory, { recursive: true, withFileTypes: true });
    const oversized: { file: string; bytes: number }[] = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const path = `${entry.parentPath}/${entry.name}`;
      const { size } = await stat(path);
      if (size > pagesFileLimit) {
        oversized.push({ file: path, bytes: size });
      }
    }

    expect(oversized, "Reencode oversized media before deploying to Pages").toEqual([]);
  });
});
