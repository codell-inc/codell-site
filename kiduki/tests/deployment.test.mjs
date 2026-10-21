import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { verifyTarget } from "../scripts/preflight.mjs";
import { prepareOutput } from "../scripts/prepare-output.mjs";

const hostname = "staging.kiduki.codell.jp";
function api({ project = {}, domain = {}, secrets = true, owned = true, status = 200 } = {}) {
  const calls = [];
  const fetcher = async (url, options) => {
    assert.equal(options.method, "GET");
    calls.push(url);
    let result;
    if (url.endsWith("/workers/domains"))
      result = owned
        ? [
            {
              hostname: "kiduki.codell.jp",
              service: "kiduki-landing",
              environment: "",
              previews_enabled: false,
            },
          ]
        : [];
    else if (url.endsWith(`/domains/${hostname}`))
      result = { name: hostname, status: "active", ...domain };
    else if (url.endsWith("/subdomain")) result = { enabled: false, previews_enabled: false };
    else
      result = {
        name: "kiduki-landing-staging",
        production_branch: "staging",
        deployment_configs: {
          production: {
            env_vars: secrets
              ? {
                  BASIC_AUTH_USER: { type: "secret_text" },
                  BASIC_AUTH_PASSWORD: { type: "secret_text" },
                }
              : {},
          },
        },
        ...project,
      };
    return new Response(JSON.stringify({ success: status === 200, result }), { status });
  };
  return { fetcher, calls };
}
const config = { accountId: "account", token: "test-token" };

test("production verifies the existing domain and disabled public preview URLs using GET only", async () => {
  const f = api();
  await verifyTarget({ ...config, target: "production", fetcher: f.fetcher });
  assert.equal(f.calls.length, 2);
});
test("staging verifies the existing project, active hostname and production-slot secret names", async () => {
  const f = api();
  await verifyTarget({ ...config, target: "staging", fetcher: f.fetcher });
  assert.equal(f.calls.length, 2);
});
for (const [name, target, options] of [
  ["missing production ownership", "production", { owned: false }],
  ["wrong staging branch", "staging", { project: { production_branch: "main" } }],
  ["pending staging domain", "staging", { domain: { status: "pending" } }],
  ["missing auth secrets", "staging", { secrets: false }],
  ["API denial", "production", { status: 403 }],
])
  test(`refuses ${name} without provisioning or modifying resources`, async () => {
    await assert.rejects(verifyTarget({ ...config, target, fetcher: api(options).fetcher }));
  });

test("deployment outputs preserve root media and isolate staging Functions from production", () => {
  const root = mkdtempSync(join(tmpdir(), "kiduki-output-"));
  try {
    mkdirSync(join(root, "build/videos"), { recursive: true });
    mkdirSync(join(root, "staging-functions"));
    writeFileSync(join(root, "build/index.html"), "KiDUKi");
    writeFileSync(join(root, "build/videos/hero.mp4"), "video");
    writeFileSync(join(root, "staging-functions/_middleware.ts"), "// auth");
    for (const marker of ["_worker.js", "_routes.json"])
      writeFileSync(join(root, "build", marker), "stale");
    prepareOutput({ root, target: "staging" });
    assert(existsSync(join(root, ".pages-deploy/functions/_middleware.ts")));
    assert.deepEqual(JSON.parse(readFileSync(join(root, ".pages-deploy/_routes.json"))), {
      version: 1,
      include: ["/*"],
      exclude: [],
    });
    prepareOutput({ root, target: "production" });
    for (const marker of ["functions", "_worker.js", "_routes.json"])
      assert.equal(existsSync(join(root, ".pages-deploy", marker)), false);
    assert.equal(readFileSync(join(root, ".pages-deploy/videos/hero.mp4"), "utf8"), "video");
    assert.throws(() => prepareOutput({ root, target: "other" }));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
