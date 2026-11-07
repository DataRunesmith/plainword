# Plainword

A Swedish plain-language reference that compares how terms are used in everyday speech and in official or legal language. Visitors can suggest terms, but nothing is published until an administrator has reviewed it.

The app is a Cloudflare Worker with a D1 database. All settings are `__NAME__` placeholders, so nothing specific to an environment is committed.

## Getting started

```sh
bun install --frozen-lockfile
npm test
```

Run your own copy:

```sh
cp cloudflare.example.env my-values.env
node tools/render.mjs my-values.env build
(cd build && npx wrangler dev)
```

Deploy with `npx wrangler deploy --cwd build` on the rendered copy. Create the D1 database yourself and put its name and ID in the values file; the tables are created by the files in `migrations/`. The admin area under `/admin` is meant to sit behind Cloudflare Access.

`docker/entrypoint.sh` renders and starts the app from environment variables in a container, with data in `/data`.
