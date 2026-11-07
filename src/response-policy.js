const COMMON_HEADERS = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
};

function contentSecurityPolicy(nonce) {
  return [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com`,
    "connect-src 'self' https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "img-src 'self' data:",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join("; ");
}

export function newNonce() {
  return crypto.randomUUID().replaceAll("-", "");
}

export function applyResponsePolicy(
  response,
  { noStore = false, robots = null, nonce = newNonce() } = {},
) {
  const result = new Response(response.body, response);
  result.headers.set("content-security-policy", contentSecurityPolicy(nonce));
  for (const [name, value] of Object.entries(COMMON_HEADERS)) {
    result.headers.set(name, value);
  }
  if (robots) result.headers.set("x-robots-tag", robots);
  if (noStore) {
    result.headers.set("cache-control", "no-store, max-age=0");
    result.headers.set("pragma", "no-cache");
  }
  return result;
}
