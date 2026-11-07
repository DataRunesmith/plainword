#!/bin/sh
# Renders the site with the values from the container environment, applies
# pending D1 migrations to /data and serves the Worker. Secrets reach wrangler
# through a private env file; nothing is baked into the image.
set -eu

# Saved settings from a one-time /data/import.env (see import-settings.sh).
. /opt/app/docker/import-settings.sh

: "${PUBLIC_HOST:=localhost}"
: "${ALIAS_HOST:=}"
: "${TURNSTILE_HOSTNAMES:=$PUBLIC_HOST}"
: "${TURNSTILE_SITE_KEY:=}"
: "${THEME_KEY_PREFIX:=plainword}"
: "${THEME_COOKIE_DOMAIN:=}"
: "${SITE_FAMILY:=Skog}"
: "${RELATED_SITE_HTML:=}"
export PUBLIC_HOST ALIAS_HOST TURNSTILE_HOSTNAMES TURNSTILE_SITE_KEY THEME_KEY_PREFIX \
  THEME_COOKIE_DOMAIN SITE_FAMILY RELATED_SITE_HTML
# Database ids only matter on Cloudflare.
export D1_DATABASE_NAME=plainword D1_DATABASE_ID=local

app=/opt/app
values=$(mktemp)
sed -n 's/^\([A-Z][A-Z0-9_]*\)=.*/\1/p' "$app/cloudflare.example.env" | while read -r name; do
  printf '%s=%s\n' "$name" "$(printenv "$name" || true)"
done >"$values"

site=/srv/site
node /opt/app/tools/render.mjs "$values" "$site" >/dev/null
cp "$app/docker/wrangler.jsonc" "$site/wrangler.jsonc"

vars=$(mktemp)
chmod 600 "$vars"
for name in ADMIN_TOKEN RATE_LIMIT_KEY TURNSTILE_SECRET TURNSTILE_HOSTNAMES; do
  value=$(printenv "$name" || true)
  [ -n "$value" ] && printf '%s=%s\n' "$name" "$value" >>"$vars"
done

cd "$site"
npx wrangler d1 migrations apply DB --local --persist-to /data

exec npx wrangler dev --local --persist-to /data \
  --ip 0.0.0.0 --port "${PORT:-8787}" \
  --env-file "$vars" --show-interactive-dev-session=false
