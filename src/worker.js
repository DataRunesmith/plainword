// plainword Worker: statiska assets + publika termer + granskningsflöde.
const CANONICAL_HOST = "__PUBLIC_HOST__";
const CANONICAL_ALIAS_HOST = "__ALIAS_HOST__";
// URL.hostname is always ASCII (punycode), so compare against the alias in the
// same form; ALIAS_HOST may be written with å, ä or ö.
const ALIAS_HOSTNAME = (() => {
  try {
    return CANONICAL_ALIAS_HOST ? new URL(`https://${CANONICAL_ALIAS_HOST}`).hostname : "";
  } catch {
    return "";
  }
})();

export function d1SessionConstraint(method, pathname) {
  return method === "GET" && pathname === "/api/terms" ? "first-unconstrained" : "first-primary";
}

export function isD1ApiRoute(method, pathname) {
  if (method === "GET") {
    return (
      pathname === "/api/terms" ||
      pathname === "/api/admin/queue" ||
      pathname === "/api/admin/terms"
    );
  }
  if (method === "POST") {
    return (
      pathname === "/api/submit" ||
      /^\/api\/admin\/review\/[^/]+$/.test(pathname) ||
      /^\/api\/admin\/terms\/[^/]+\/status$/.test(pathname)
    );
  }
  return method === "PUT" && /^\/api\/admin\/terms\/[^/]+$/.test(pathname);
}

export function withD1Session(env, constraint) {
  return Object.assign(Object.create(env), { DB: env.DB.withSession(constraint) });
}

const MAX_LEN = {
  term: 200,
  foreslagen_juridisk_definition: 4000,
  foreslagen_vardagsbetydelse: 4000,
  foreslagen_exempel: 2000,
  foreslaget_rattsomrade: 100,
  inskickare_namn: 200,
  inskickare_kommentar: 2000,
};

const PUBLICATION_MAX_LEN = {
  term: 200,
  rattsomrade: 100,
  allmansprak: 4000,
  sprak_kalla_namn: 300,
  sprak_kalla_url: 2000,
  institution: 4000,
  institution_kalla_namn: 300,
  institution_kalla_url: 2000,
  skillnad: 4000,
  notering: 2000,
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init.headers || {}) },
  });
}
function badRequest(message) {
  return json({ error: message }, { status: 400 });
}
function clean(v) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}
export function isHttpUrl(v) {
  try {
    const u = new URL(v);
    return (
      (u.protocol === "https:" || u.protocol === "http:") &&
      Boolean(u.hostname) &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
}
function parsePositiveId(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}
function duplicateError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /unique|constraint/i.test(message);
}

function validateSubmission(body) {
  if (!body || typeof body !== "object") return "Ogiltig förfrågan.";
  if (!clean(body.term)) return "Term krävs.";
  if (body.term.trim().length > MAX_LEN.term) return `Term får vara max ${MAX_LEN.term} tecken.`;
  if (!clean(body.foreslagen_juridisk_definition) || !clean(body.foreslagen_vardagsbetydelse)) {
    return "Både allmänspråklig betydelse och myndighetens/juridikens användning krävs.";
  }
  for (const [key, max] of Object.entries(MAX_LEN)) {
    if (key === "term") continue;
    if (typeof body[key] === "string" && body[key].length > max)
      return `Fältet "${key}" får vara max ${max} tecken.`;
  }
  return null;
}

function validatePublication(p) {
  if (!p || typeof p !== "object") return "Publiceringsdata saknas.";
  const required = [
    "term",
    "rattsomrade",
    "allmansprak",
    "sprak_kalla_namn",
    "sprak_kalla_url",
    "institution",
    "institution_kalla_namn",
    "institution_kalla_url",
    "skillnad",
  ];
  for (const key of required) if (!clean(p[key])) return `Publiceringsfältet "${key}" krävs.`;
  for (const [key, max] of Object.entries(PUBLICATION_MAX_LEN)) {
    if (typeof p[key] === "string" && p[key].length > max)
      return `Publiceringsfältet "${key}" får vara max ${max} tecken.`;
  }
  if (!isHttpUrl(p.sprak_kalla_url))
    return "Språkkällans URL måste börja med http:// eller https://.";
  if (!isHttpUrl(p.institution_kalla_url))
    return "Institutionens käll-URL måste börja med http:// eller https://.";
  return null;
}

const MAX_API_BODY_BYTES = 128 * 1024;

export async function requestBodyTooLarge(request) {
  const contentLength = request.headers.get("Content-Length");
  if (contentLength !== null) {
    if (!/^\\d+$/.test(contentLength)) return true;
    const length = Number(contentLength);
    if (!Number.isSafeInteger(length) || length > MAX_API_BODY_BYTES) return true;
  }
  const body = request.clone().body;
  if (!body) return false;
  const reader = body.getReader();
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return false;
      total += value.byteLength;
      if (total > MAX_API_BODY_BYTES) {
        await Promise.allSettled([
          reader.cancel(),
          request.body?.cancel() ?? Promise.resolve(),
        ]);
        return true;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function rateLimitIdentity(ip, secret) {
  if (!ip || !secret) return null;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(ip));
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return `hmac-sha256:${hex}`;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function checkAdminAuth(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  const match = (request.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  return !!match && timingSafeEqual(match[1], env.ADMIN_TOKEN);
}
function requireAdmin(request, env) {
  return checkAdminAuth(request, env) ? null : json({ error: "Unauthorized" }, { status: 401 });
}

function publicTerm(row) {
  return {
    id: `published:${row.id}`,
    term: row.term,
    rattsomrade: row.rattsomrade,
    allmansprak: row.allmansprak,
    sprakKalla: { namn: row.sprak_kalla_namn, url: row.sprak_kalla_url },
    institution: row.institution,
    institutionKalla: { namn: row.institution_kalla_namn, url: row.institution_kalla_url },
    skillnad: row.skillnad,
    not: row.notering,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

async function handleTerms(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, term, rattsomrade, allmansprak, sprak_kalla_namn, sprak_kalla_url,
            institution, institution_kalla_namn, institution_kalla_url,
            skillnad, notering, published_at, updated_at
       FROM published_terms
      WHERE status = 'published'
      ORDER BY LOWER(term), id`,
  ).all();
  return json(
    { terms: results.map(publicTerm) },
    { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}

async function verifyTurnstile(request, env, token, expectedAction) {
  if (!env.TURNSTILE_SECRET || !token || typeof token !== "string") return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return false;
    const result = await response.json();
    const allowed = new Set(
      String(env.TURNSTILE_HOSTNAMES || "")
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean),
    );
    return (
      result.success === true &&
      result.action === expectedAction &&
      typeof result.hostname === "string" &&
      allowed.has(result.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

async function handleSubmit(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ogiltig JSON.");
  }
  if (!(await verifyTurnstile(request, env, body?.turnstileToken, "term_submit")))
    return json({ error: "Turnstile-verifieringen misslyckades. Försök igen." }, { status: 403 });
  delete body.turnstileToken;
  const error = validateSubmission(body);
  if (error) return badRequest(error);
  const ip = request.headers.get("CF-Connecting-IP");
  const identity = await rateLimitIdentity(ip, env.RATE_LIMIT_KEY || env.ADMIN_TOKEN);
  if (!ip || !identity)
    return json({ error: "Rate limit configuration unavailable." }, { status: 503 });
  const timestamp = Date.now();
  const now = new Date(timestamp).toISOString();
  const since = new Date(timestamp - RATE_LIMIT_WINDOW_MS).toISOString();
  const result = await env.DB.prepare(
    `INSERT INTO submissions
      (term, foreslagen_juridisk_definition, foreslagen_vardagsbetydelse, foreslagen_exempel,
       foreslaget_rattsomrade, inskickare_namn, inskickare_kommentar, status, created_at, submitter_ip)
     SELECT ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?
      WHERE (SELECT COUNT(*) FROM submissions WHERE submitter_ip = ? AND created_at > ?) < ?`,
  )
    .bind(
      body.term.trim(),
      clean(body.foreslagen_juridisk_definition),
      clean(body.foreslagen_vardagsbetydelse),
      clean(body.foreslagen_exempel),
      clean(body.foreslaget_rattsomrade),
      clean(body.inskickare_namn),
      clean(body.inskickare_kommentar),
      now,
      identity,
      identity,
      since,
      RATE_LIMIT_MAX,
    )
    .run();
  if (!result.meta.changes)
    return json(
      { error: "För många förslag från samma adress. Försök igen om en stund." },
      { status: 429 },
    );
  return json(
    { ok: true, message: "Tack, ditt förslag granskas innan det publiceras." },
    { status: 201 },
  );
}

async function handleAdminQueue(request, env) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const { results } = await env.DB.prepare(
    `SELECT id, term, foreslagen_juridisk_definition, foreslagen_vardagsbetydelse,
            foreslagen_exempel, foreslaget_rattsomrade, inskickare_namn,
            inskickare_kommentar, reviewer_note, created_at
       FROM submissions WHERE status = 'pending' ORDER BY created_at ASC`,
  ).all();
  return json({ submissions: results }, { headers: { "cache-control": "no-store" } });
}

async function handleAdminReview(request, env, id) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const submissionId = parsePositiveId(id);
  if (!submissionId) return badRequest("Ogiltigt id.");
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ogiltig JSON.");
  }
  if (body?.action !== "approve" && body?.action !== "reject")
    return badRequest('Fältet "action" måste vara "approve" eller "reject".');
  const submission = await env.DB.prepare(
    `SELECT id FROM submissions WHERE id = ? AND status = 'pending'`,
  )
    .bind(submissionId)
    .first();
  if (!submission)
    return json({ error: "Förslaget hittades inte eller är redan granskat." }, { status: 404 });
  const note = clean(body.note);
  const now = new Date().toISOString();
  if (body.action === "reject") {
    await env.DB.prepare(
      `UPDATE submissions SET status = 'rejected', reviewed_at = ?, reviewer_note = ? WHERE id = ? AND status = 'pending'`,
    )
      .bind(now, note, submissionId)
      .run();
    return json({ ok: true, status: "rejected", published: false });
  }
  const publicationError = validatePublication(body.publication);
  if (publicationError) return badRequest(publicationError);
  const p = body.publication;
  try {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO published_terms
          (submission_id, term, rattsomrade, allmansprak, sprak_kalla_namn, sprak_kalla_url,
           institution, institution_kalla_namn, institution_kalla_url, skillnad, notering,
           status, published_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
      ).bind(
        submissionId,
        clean(p.term),
        clean(p.rattsomrade),
        clean(p.allmansprak),
        clean(p.sprak_kalla_namn),
        clean(p.sprak_kalla_url),
        clean(p.institution),
        clean(p.institution_kalla_namn),
        clean(p.institution_kalla_url),
        clean(p.skillnad),
        clean(p.notering),
        now,
        now,
      ),
      env.DB.prepare(
        `UPDATE submissions SET status = 'approved', reviewed_at = ?, reviewer_note = ? WHERE id = ? AND status = 'pending'`,
      ).bind(now, note, submissionId),
    ]);
  } catch (error) {
    if (duplicateError(error))
      return json(
        { error: "En publicerad term med samma normaliserade namn finns redan." },
        { status: 409 },
      );
    throw error;
  }
  return json({ ok: true, status: "approved", published: true });
}

async function handleAdminTerms(request, env) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const { results } = await env.DB.prepare(
    `SELECT id, submission_id, term, rattsomrade, allmansprak, sprak_kalla_namn, sprak_kalla_url,
            institution, institution_kalla_namn, institution_kalla_url, skillnad, notering,
            status, published_at, updated_at
       FROM published_terms ORDER BY status DESC, LOWER(term), id`,
  ).all();
  return json({ terms: results }, { headers: { "cache-control": "no-store" } });
}

async function handleAdminTermUpdate(request, env, id) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const termId = parsePositiveId(id);
  if (!termId) return badRequest("Ogiltigt id.");
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ogiltig JSON.");
  }
  const publicationError = validatePublication(body?.publication);
  if (publicationError) return badRequest(publicationError);
  const p = body.publication;
  const now = new Date().toISOString();
  try {
    const result = await env.DB.prepare(
      `UPDATE published_terms SET
         term = ?, rattsomrade = ?, allmansprak = ?, sprak_kalla_namn = ?, sprak_kalla_url = ?,
         institution = ?, institution_kalla_namn = ?, institution_kalla_url = ?,
         skillnad = ?, notering = ?, updated_at = ?
       WHERE id = ?`,
    )
      .bind(
        clean(p.term),
        clean(p.rattsomrade),
        clean(p.allmansprak),
        clean(p.sprak_kalla_namn),
        clean(p.sprak_kalla_url),
        clean(p.institution),
        clean(p.institution_kalla_namn),
        clean(p.institution_kalla_url),
        clean(p.skillnad),
        clean(p.notering),
        now,
        termId,
      )
      .run();
    if (!result.meta.changes) return json({ error: "Termen hittades inte." }, { status: 404 });
  } catch (error) {
    if (duplicateError(error))
      return json(
        { error: "En publicerad term med samma normaliserade namn finns redan." },
        { status: 409 },
      );
    throw error;
  }
  return json({ ok: true, updatedAt: now });
}

async function handleAdminTermStatus(request, env, id) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const termId = parsePositiveId(id);
  if (!termId) return badRequest("Ogiltigt id.");
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ogiltig JSON.");
  }
  if (body?.status !== "published" && body?.status !== "archived")
    return badRequest('Status måste vara "published" eller "archived".');
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    `UPDATE published_terms SET status = ?, updated_at = ? WHERE id = ?`,
  )
    .bind(body.status, now, termId)
    .run();
  if (!result.meta.changes) return json({ error: "Termen hittades inte." }, { status: 404 });
  return json({ ok: true, status: body.status, updatedAt: now });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    if (ALIAS_HOSTNAME && url.hostname === ALIAS_HOSTNAME) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    if (isD1ApiRoute(request.method, pathname)) {
      if ((request.method === "POST" || request.method === "PUT") && await requestBodyTooLarge(request)) {
        return json({ error: "Förfrågan är för stor." }, { status: 413 });
      }
      env = withD1Session(env, d1SessionConstraint(request.method, pathname));
    }
    if (request.method === "GET" && pathname === "/api/terms") return handleTerms(env);
    if (request.method === "POST" && pathname === "/api/submit") return handleSubmit(request, env);
    if (request.method === "GET" && pathname === "/api/admin/queue")
      return handleAdminQueue(request, env);
    if (request.method === "GET" && pathname === "/api/admin/terms")
      return handleAdminTerms(request, env);
    const reviewMatch = pathname.match(/^\/api\/admin\/review\/([^/]+)$/);
    if (request.method === "POST" && reviewMatch)
      return handleAdminReview(request, env, reviewMatch[1]);
    const statusMatch = pathname.match(/^\/api\/admin\/terms\/([^/]+)\/status$/);
    if (request.method === "POST" && statusMatch)
      return handleAdminTermStatus(request, env, statusMatch[1]);
    const termMatch = pathname.match(/^\/api\/admin\/terms\/([^/]+)$/);
    if (request.method === "PUT" && termMatch)
      return handleAdminTermUpdate(request, env, termMatch[1]);
    return env.ASSETS.fetch(request);
  },
};
