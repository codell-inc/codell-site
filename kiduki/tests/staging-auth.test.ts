import { describe, expect, it } from "vitest";
import { onRequest } from "../staging-functions/_middleware";

const env = { BASIC_AUTH_USER: "test", BASIC_AUTH_PASSWORD: "test:password" };
async function request(path: string, authorization?: string, configured = true) {
  return onRequest({
    request: new Request(`https://staging.kiduki.codell.jp${path}`, {
      headers: authorization ? { Authorization: authorization } : {},
    }),
    env: configured ? env : {},
    next: async () => new Response("asset"),
  });
}

describe("staging Basic authentication", () => {
  it("protects HTML, static media, scripts and well-known paths", async () => {
    for (const path of [
      "/",
      "/images/hero-poster.jpg",
      "/videos/hero.mp4",
      "/_app/immutable/start.js",
      "/.well-known/assetlinks.json",
    ]) {
      const response = await request(path);
      expect(response.status).toBe(401);
      expect(response.headers.get("WWW-Authenticate")).toContain('Basic realm="KiDUKi staging"');
      expect(response.headers.get("Cache-Control")).toBe("no-store");
    }
  });
  it("accepts valid credentials, including a colon in the password", async () => {
    expect((await request("/", `Basic ${btoa("test:test:password")}`)).status).toBe(200);
  });
  it("rejects invalid or malformed credentials", async () => {
    for (const authorization of ["Bearer test", "Basic invalid!", `Basic ${btoa("test:wrong")}`]) {
      expect((await request("/", authorization)).status).toBe(401);
    }
  });
  it("fails closed if either required secret is missing", async () => {
    expect((await request("/", undefined, false)).status).toBe(503);
  });
});
