import app from "./worker.js";
import { applyResponsePolicy, newNonce } from "./response-policy.js";

const ADMIN_PAGE = "/admin";
const ADMIN_ASSET = "/admin.html";
const ADMIN_API_PREFIX = "/admin/api/";
// The admin API is reached at /admin/api/ (under the Access-protected /admin
// path) and handled internally under /api/admin/.
const INTERNAL_ADMIN_API_PREFIX = "/api/admin/";
const INDEX_ROBOTS = "index, follow, max-image-preview:large";

export function isAdminPath(pathname) {
  return (
    pathname === ADMIN_PAGE ||
    pathname === `${ADMIN_PAGE}/` ||
    pathname === ADMIN_ASSET ||
    pathname.startsWith(ADMIN_API_PREFIX) ||
    pathname.startsWith(INTERNAL_ADMIN_API_PREFIX)
  );
}

export function adminRoute(pathname) {
  if (pathname === ADMIN_ASSET) {
    return { type: "redirect", pathname: ADMIN_PAGE };
  }
  // Workers Assets serves admin.html at /admin and itself redirects
  // /admin.html to /admin, so /admin must pass through unchanged.
  if (pathname === ADMIN_PAGE) {
    return { type: "pass", pathname };
  }
  if (pathname === `${ADMIN_PAGE}/`) {
    return { type: "redirect", pathname: ADMIN_PAGE };
  }
  if (pathname.startsWith(ADMIN_API_PREFIX)) {
    return {
      type: "rewrite",
      pathname: `${INTERNAL_ADMIN_API_PREFIX}${pathname.slice(ADMIN_API_PREFIX.length)}`,
    };
  }
  // Direct calls to the internal path are sent to the public one, so the admin
  // API is only ever reached through /admin/.
  if (pathname.startsWith(INTERNAL_ADMIN_API_PREFIX)) {
    return {
      type: "redirect",
      pathname: `${ADMIN_API_PREFIX}${pathname.slice(INTERNAL_ADMIN_API_PREFIX.length)}`,
    };
  }
  return { type: "pass", pathname };
}

export function seoForPath(pathname) {
  if (pathname === "/" || pathname === "/index.html") {
    return {
      robots: INDEX_ROBOTS,
      canonical: "https://__PUBLIC_HOST__/",
      description: null,
    };
  }
  if (pathname === "/varfor" || pathname === "/varfor/" || pathname === "/varfor.html") {
    return {
      robots: INDEX_ROBOTS,
      canonical: "https://__PUBLIC_HOST__/varfor",
      description:
        "Läs om Plainwords metod, syfte och kvalitetskrav för jämförelser mellan allmänspråk och offentlig användning.",
    };
  }
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return null;
  if (isDocsPath(pathname)) return { robots: INDEX_ROBOTS, canonical: null, description: null };
  return { robots: "noindex, nofollow", canonical: null, description: null };
}

function requestWithPath(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

export function isDocsPath(pathname) {
  return pathname === "/docs" || pathname.startsWith("/docs/");
}

function decorateHtml(response, { seo = null, scriptNonce = null } = {}) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const rewriter = new HTMLRewriter();

  // The documentation site under /docs (built by Zensical) has a few small
  // inline scripts; they get the response's CSP nonce so they may run.
  if (scriptNonce) {
    rewriter.on("script:not([src])", {
      element(element) {
        element.setAttribute("nonce", scriptNonce);
      },
    });
  }

  if (seo) {
    rewriter.on("head", {
      element(element) {
        element.append(`<meta name="robots" content="${seo.robots}">`, { html: true });
        if (seo.canonical) {
          element.append(`<link rel="canonical" href="${seo.canonical}">`, { html: true });
        }
        if (seo.description) {
          element.append(`<meta name="description" content="${seo.description}">`, { html: true });
        }
      },
    });
  }

  return rewriter.transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const externalUrl = new URL(request.url);
    const route = adminRoute(externalUrl.pathname);
    const seo = seoForPath(externalUrl.pathname);
    let response;

    if (route.type === "redirect") {
      const target = new URL(request.url);
      target.pathname = route.pathname;
      response = Response.redirect(target.toString(), 308);
    } else {
      const upstreamRequest =
        route.type === "rewrite" ? requestWithPath(request, route.pathname) : request;
      response = await app.fetch(upstreamRequest, env, ctx);
    }

    const nonce = newNonce();
    response = decorateHtml(response, {
      seo,
      scriptNonce: isDocsPath(externalUrl.pathname) ? nonce : null,
    });

    return applyResponsePolicy(response, {
      noStore: isAdminPath(externalUrl.pathname),
      robots: seo?.robots ?? null,
      nonce,
    });
  },
};
