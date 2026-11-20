#!/bin/sh
# Builds the documentation site into <assets-dir>/docs, so the app's own Worker
# serves it under /docs. tools/deploy.sh runs it in the rendered copy.
# The Worker (src/response-policy.js) sets the CSP for /docs itself.
set -eu
dir=${1:?usage: sh tools/docs-cloudflare.sh <assets-dir>}
python3 -m venv .venv-docs
.venv-docs/bin/pip install --quiet --no-deps -r requirements-docs.txt
node tools/docs-site.mjs
.venv-docs/bin/zensical build --clean
rm -rf "$dir/docs"
cp -r site "$dir/docs"
