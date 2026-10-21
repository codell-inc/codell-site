import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

export async function verifyPublication({
  target,
  expectedVersion,
  expectedVideo,
  fetcher = fetch,
}) {
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
  if (!video.headers.get("Content-Type")?.startsWith("video/mp4")) {
    throw new Error("Expected MP4 media type");
  }
  let size;
  if (video.status === 206) {
    const range = video.headers.get("Content-Range");
    if (
      !/^bytes 0-0\/[1-9]\d*$/.test(range ?? "") ||
      (expectedVideo && range !== `bytes 0-0/${expectedVideo.size}`)
    ) {
      throw new Error("Expected MP4 byte-range delivery");
    }
    size = 1;
  } else if (
    video.status === 200 &&
    expectedVideo &&
    Number.isSafeInteger(expectedVideo.size) &&
    expectedVideo.size > 0 &&
    expectedVideo.size <= 25 * 1024 * 1024 &&
    video.headers.get("Content-Length") === String(expectedVideo.size) &&
    !video.headers.has("Content-Range")
  ) {
    // Static Assets can return the complete representation for a Range request.
    // Accept it only after checking every byte against the verified build.
    size = expectedVideo.size;
  } else {
    throw new Error("Expected MP4 range or verified complete delivery");
  }
  const digest = createHash("sha256");
  let received = 0;
  for await (const chunk of video.body ?? []) {
    received += chunk.byteLength;
    if (received > size) throw new Error("MP4 response exceeds expected size");
    digest.update(chunk);
  }
  if (
    received !== size ||
    (video.status === 200 && digest.digest("hex") !== expectedVideo.sha256)
  ) {
    throw new Error("Published MP4 does not match the verified build bytes");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  const expectedVersion =
    target === "production"
      ? JSON.parse(await readFile(new URL("../build/_app/version.json", import.meta.url), "utf8"))
          .version
      : undefined;
  const video =
    target === "production"
      ? await readFile(new URL("../build/videos/hero.mp4", import.meta.url))
      : undefined;
  const expectedVideo = video
    ? { size: video.byteLength, sha256: createHash("sha256").update(video).digest("hex") }
    : undefined;
  await verifyPublication({ target, expectedVersion, expectedVideo });
  console.log(`KiDUKi ${target} publication verified`);
}
