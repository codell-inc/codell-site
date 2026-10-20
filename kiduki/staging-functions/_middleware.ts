// Bundled only into the staging Pages output. Every path and host is protected.
const STAGING_BASIC_AUTH_CHALLENGE = 'Basic realm="KiDUKi staging", charset="UTF-8"';
type StagingBasicAuthEnv = { BASIC_AUTH_USER?: string; BASIC_AUTH_PASSWORD?: string };
function timingSafeEqual(left: string, right: string): boolean {
  const encodedLeft = new TextEncoder().encode(left);
  const encodedRight = new TextEncoder().encode(right);
  const length = Math.max(encodedLeft.length, encodedRight.length);
  let diff = encodedLeft.length ^ encodedRight.length;
  for (let index = 0; index < length; index += 1) {
    diff |= (encodedLeft[index] ?? 0) ^ (encodedRight[index] ?? 0);
  }
  return diff === 0;
}

function parseBasic(header: string | null): { user: string; password: string } | null {
  if (!header) return null;
  const match = /^Basic\s+(\S+)\s*$/i.exec(header);
  if (!match?.[1] || !/^[A-Za-z0-9+/]*={0,2}$/.test(match[1]) || match[1].length % 4 !== 0) {
    return null;
  }
  let binary: string;
  try {
    binary = atob(match[1]);
  } catch {
    return null;
  }
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  let decoded: string;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
  const separator = decoded.indexOf(":");
  if (separator < 0) return null;
  return { user: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
}

function credentialsMatch(request: Request, env: StagingBasicAuthEnv): boolean {
  const parsed = parseBasic(request.headers.get("Authorization"));
  const userOk = timingSafeEqual(parsed?.user ?? "", env.BASIC_AUTH_USER ?? "");
  const passwordOk = timingSafeEqual(parsed?.password ?? "", env.BASIC_AUTH_PASSWORD ?? "");
  return parsed !== null && userOk && passwordOk;
}

function unauthorized(): Response {
  return new Response("Authentication required\n", {
    status: 401,
    headers: {
      "WWW-Authenticate": STAGING_BASIC_AUTH_CHALLENGE,
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function onRequest(context: {
  request: Request;
  env: StagingBasicAuthEnv;
  next: () => Promise<Response>;
}): Promise<Response> {
  if (!context.env.BASIC_AUTH_USER || !context.env.BASIC_AUTH_PASSWORD) {
    return new Response("Staging authentication is not configured\n", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
  if (!credentialsMatch(context.request, context.env)) return unauthorized();
  return context.next();
}
