import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { verifyPublication } from "../scripts/verify-publication.mjs";

function fixture(target, { status, challenge, range, title, version = "release-build" } = {}) {
  const calls = [];
  return {
    calls,
    fetcher: async (url, options) => {
      calls.push({ url, method: options?.method ?? "GET", headers: options?.headers });
      if (target === "staging")
        return new Response("Authentication required", {
          status: status ?? 401,
          headers: {
            ...(challenge === false ? {} : { "WWW-Authenticate": 'Basic realm="KiDUKi staging"' }),
            "Cache-Control": "no-store",
          },
        });
      if (url.endsWith("/"))
        return new Response(title === false ? "wrong page" : "<title>KiDUKi</title>", {
          status: status ?? 200,
        });
      if (url.endsWith("/version.json")) return Response.json({ version });
      if (url.endsWith(".mp4"))
        return new Response("v", {
          status: range === false ? 200 : 206,
          headers: { "Content-Type": "video/mp4", "Content-Range": "bytes 0-0/9853505" },
        });
      return new Response(null, { status: 200 });
    },
  };
}

test("staging requires a Basic challenge for HTML, image, video and script paths", async () => {
  const f = fixture("staging");
  await verifyPublication({ target: "staging", fetcher: f.fetcher });
  assert.equal(f.calls.length, 4);
  assert(f.calls.every(({ url }) => url.startsWith("https://staging.kiduki.codell.jp/")));
});
test("production verifies public KiDUKi HTML, assets and MP4 byte range", async () => {
  const f = fixture("production");
  await verifyPublication({
    target: "production",
    expectedVersion: "release-build",
    fetcher: f.fetcher,
  });
  assert(f.calls.some(({ headers }) => headers?.Range === "bytes=0-0"));
});
for (const [name, target, options] of [
  ["public staging", "staging", { status: 200 }],
  ["missing staging challenge", "staging", { challenge: false }],
  ["wrong production HTML", "production", { title: false }],
  ["broken video range", "production", { range: false }],
])
  test(`publication verification refuses ${name}`, async () => {
    await assert.rejects(verifyPublication({ target, fetcher: fixture(target, options).fetcher }));
  });

test("production rejects a stale artifact version", async () => {
  await assert.rejects(
    verifyPublication({
      target: "production",
      expectedVersion: "release-build",
      fetcher: fixture("production", { version: "old-build" }).fetcher,
    }),
  );
});

const fullVideo = Buffer.from("verified static MP4 bytes");
const expectedVideo = {
  size: fullVideo.length,
  sha256: createHash("sha256").update(fullVideo).digest("hex"),
};

function fullVideoFixture({
  body = fullVideo,
  type = "video/mp4",
  length = fullVideo.length,
} = {}) {
  const f = fixture("production");
  return async (url, options) =>
    url.endsWith(".mp4")
      ? new Response(body, {
          status: 200,
          headers: { "Content-Type": type, "Content-Length": String(length) },
        })
      : f.fetcher(url, options);
}

test("production accepts a complete static MP4 only when it matches the build bytes", async () => {
  await verifyPublication({ target: "production", expectedVideo, fetcher: fullVideoFixture() });
});

for (const [name, options] of [
  ["corrupt MP4", { body: Buffer.concat([fullVideo.subarray(0, -1), Buffer.from("!")]) }],
  ["truncated MP4", { body: fullVideo.subarray(0, 5) }],
  ["wrong MP4 MIME", { type: "text/html" }],
  ["wrong MP4 length", { length: 1 }],
])
  test(`production rejects a complete response with ${name}`, async () => {
    await assert.rejects(
      verifyPublication({
        target: "production",
        expectedVideo,
        fetcher: fullVideoFixture(options),
      }),
    );
  });
