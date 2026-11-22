import { fileURLToPath } from "node:url";
import path from "node:path";

// A repository handover must reuse existing targets. This helper is GET-only;
// missing targets, domain conflicts or credentials are an operator blocker.
export async function verifyTarget({ target, accountId, token, fetcher = fetch }) {
  if (!["production", "staging"].includes(target))
    throw new Error("Expected production or staging");
  if (!accountId || !token) throw new Error("Cloudflare account ID and token are required");
  const base = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}`;
  async function get(resource) {
    const response = await fetcher(`${base}${resource}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    if (!response.ok || body?.success !== true || body.result_info?.total_pages > 1) {
      throw new Error(`Cannot verify existing Cloudflare target: ${resource} (${response.status})`);
    }
    return body.result;
  }
  if (target === "production") {
    const domains = await get("/workers/domains");
    if (!Array.isArray(domains)) throw new Error("Invalid Workers domain list");
    const owners = domains.filter((domain) => domain?.hostname === "kiduki.codell.jp");
    if (
      owners.length !== 1 ||
      owners[0].service !== "kiduki-landing" ||
      !["", "production"].includes(owners[0].environment) ||
      owners[0].previews_enabled === true
    ) {
      throw new Error(
        "kiduki.codell.jp must already belong to the production kiduki-landing Worker",
      );
    }
    const subdomain = await get("/workers/scripts/kiduki-landing/subdomain");
    if (subdomain?.enabled !== false || subdomain?.previews_enabled !== false) {
      throw new Error("workers.dev and preview URLs must already be disabled");
    }
  } else {
    const project = await get("/pages/projects/kiduki-landing-staging");
    if (project?.name !== "kiduki-landing-staging" || project.production_branch !== "staging") {
      throw new Error("Existing staging Pages project must use production_branch=staging");
    }
    const vars = project.deployment_configs?.production?.env_vars;
    for (const name of ["BASIC_AUTH_USER", "BASIC_AUTH_PASSWORD"]) {
      if (vars?.[name]?.type !== "secret_text")
        throw new Error(`Existing Pages secret required: ${name}`);
    }
    const domain = await get(
      "/pages/projects/kiduki-landing-staging/domains/staging.kiduki.codell.jp",
    );
    if (domain?.name !== "staging.kiduki.codell.jp" || domain.status !== "active") {
      throw new Error("Existing staging.kiduki.codell.jp domain must be active");
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.GITHUB_REF !== "refs/heads/main") throw new Error("Deploy only from main");
  await verifyTarget({
    target: process.argv[2],
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
  });
  console.log("Existing KiDUKi target verified; no infrastructure changes made");
}
