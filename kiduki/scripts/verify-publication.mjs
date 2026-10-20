import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export async function verifyPublication({ target, expectedVersion, fetcher = fetch }) {
  if (!["staging", "production"].includes(target))
    throw new Error("Expected staging or production");
  const origin =
    target === "staging" ? "https://staging.kiduki.codell.jp" : "https://kiduki.codell.jp";
  async function get(resource, options = {}) {
    return fetcher(`${origin}${resource}`, {
      ...options,
      headers: { "Cache-Control": "no-cache", ...options.headers },
      signal: AbortSignal.timeout(15000),
      redirect: "error",
    });
  }
  if (target === "staging") {
    for (const resource of [
      "/",
      "/images/hero-poster.jpg",
      "/videos/hero.mp4",
      "/_app/version.json",
    ]) {
      const response = await get(resource);
      if (
        response.status !== 401 ||
        !response.headers.get("WWW-Authenticate")?.startsWith("Basic ") ||
        response.headers.get("Cache-Control") !== "no-store"
      ) {
        throw new Error(`Staging authentication is not active: ${resource}`);
      }
    }
    return;
  }
  const html = await get("/");
  if (
    html.status !== 200 ||
    html.headers.has("WWW-Authenticate") ||
    !(await html.text()).includes("KiDUKi")
  ) {
    throw new Error("Expected public KiDUKi HTML without authentication");
  }
  if (expectedVersion) {
    const response = await get("/_app/version.json");
    if (response.status !== 200 || (await response.json()).version !== expectedVersion) {
      throw new Error("Published version does not match the verified build artifact");
    }
  }
  for (const resource of ["/images/hero-poster.jpg", "/kiduki-logo.svg", "/videos/hero.webm"]) {
    const response = await get(resource, { method: "HEAD" });
    if (response.status !== 200 || response.headers.has("WWW-Authenticate")) {
      throw new Error(`Public asset is unavailable: ${resource}`);
    }
  }
  const video = await get("/videos/hero.mp4", { headers: { Range: "bytes=0-0" } });
  if (
    video.status !== 206 ||
    !video.headers.get("Content-Range")?.startsWith("bytes 0-0/") ||
    !video.headers.get("Content-Type")?.startsWith("video/mp4")
  ) {
    throw new Error("Expected MP4 byte-range delivery");
  }
  await video.body?.cancel();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  const expectedVersion =
    target === "production"
      ? JSON.parse(await readFile(new URL("../build/_app/version.json", import.meta.url), "utf8"))
          .version
      : undefined;
  await verifyPublication({ target, expectedVersion });
  console.log(`KiDUKi ${target} publication verified`);
}
