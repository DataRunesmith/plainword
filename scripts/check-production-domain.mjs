import { pathToFileURL } from "node:url";

const CANONICAL_ROOT = "https://__PUBLIC_HOST__/";
const TERMS_API = "https://__PUBLIC_HOST__/api/terms";
const IDN_ALIAS_ROOT = "https://__ALIAS_HOST__/";
const ATTEMPTS = 5;
const RETRY_DELAY_MS = 10_000;
const REQUEST_TIMEOUT_MS = 20_000;

export async function validateProductionResponse(kind, response) {
  if (kind === "root") {
    if (response.status !== 200)
      throw new Error(`canonical root returned ${response.status}, expected 200`);
    return;
  }

  if (kind === "terms") {
    if (response.status !== 200)
      throw new Error(`terms API returned ${response.status}, expected 200`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw new Error(`terms API returned unexpected content-type ${contentType || "<missing>"}`);
    }
    const body = await response.json();
    if (!body || !Array.isArray(body.terms))
      throw new Error("terms API response is missing a terms array");
    return;
  }

  if (kind === "alias") {
    if (response.status !== 301)
      throw new Error(`IDN alias returned ${response.status}, expected 301`);
    const location = response.headers.get("location");
    if (location !== CANONICAL_ROOT) {
      throw new Error(
        `IDN alias redirected to ${location || "<missing>"}, expected ${CANONICAL_ROOT}`,
      );
    }
    return;
  }

  throw new Error(`unknown production check ${kind}`);
}

async function request(url, fetchImpl) {
  return fetchImpl(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { "user-agent": "plainword-workers-build-production-check" },
  });
}

export async function checkProduction({
  fetchImpl = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
} = {}) {
  const checks = [
    ["root", CANONICAL_ROOT],
    ["terms", TERMS_API],
    // Without an alias host the rendered value is empty and there is nothing to check.
    ...(IDN_ALIAS_ROOT === "https:///" ? [] : [["alias", IDN_ALIAS_ROOT]]),
  ];

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    const failures = [];

    await Promise.all(
      checks.map(async ([kind, url]) => {
        try {
          const response = await request(url, fetchImpl);
          await validateProductionResponse(kind, response);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          failures.push(`${kind}: ${message}`);
        }
      }),
    );

    if (failures.length === 0) {
      console.log(
        `Production checks passed on attempt ${attempt}: ${checks.map(([kind]) => kind).join(", ")}`,
      );
      return;
    }

    console.error(`attempt ${attempt}: ${failures.join("; ")}`);
    if (attempt < ATTEMPTS) await sleep(RETRY_DELAY_MS);
  }

  throw new Error(`production checks failed after ${ATTEMPTS} attempts`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkProduction().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  });
}
