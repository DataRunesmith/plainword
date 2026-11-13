#!/bin/sh
# Used by the Deploy workflow: writes "ready=true" to $GITHUB_OUTPUT only when
# the Cloudflare token, the account ID and the public host are all set.
set -eu
if [ -n "${CLOUDFLARE_API_TOKEN:-}" ] && [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] && [ -n "${PUBLIC_HOST:-}" ]; then
  echo "ready=true" >>"$GITHUB_OUTPUT"
else
  echo "CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID and PUBLIC_HOST must all be set, so nothing is deployed."
fi
