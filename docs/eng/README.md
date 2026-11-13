# Plainword

A Swedish plain-language reference that compares how terms are used in everyday speech and in official or legal language. Visitors can suggest terms, but nothing is published until an administrator has reviewed it.

The app is a Cloudflare Worker with a D1 database. All settings are `__NAME__` placeholders, so nothing specific to an environment is committed: your own values stay in a file git ignores, in GitHub Actions secrets or in Cloudflare build variables.

## Run your own copy

There are four ways, and they all end in the same app. Pick one.

| Way | You need | Runs on |
|---|---|---|
| [Docker](#docker) | Docker | Your own machine or server |
| [From your computer](#from-your-computer) | Node.js 24, a Cloudflare account | Cloudflare |
| [GitHub Actions](#github-actions) | A GitHub account, a Cloudflare account | Cloudflare, on every push to `main` |
| [Cloudflare Workers Builds](#cloudflare-workers-builds) | A GitHub or GitLab account, a Cloudflare account | Cloudflare, on every push to `main` |

A GitHub account is only needed for the last two. For the first two, download the source as a ZIP file or clone it.

### Docker

```sh
ADMIN_TOKEN='a-long-random-string' docker compose up -d
```

Open <http://localhost:8787>. The review queue is at `/admin`; sign in there with the token. The database is kept in the `data` volume. Set `PUBLIC_HOST` to serve it under another host name, and `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET` to let visitors suggest terms. Instead of typing the values on the command line you can put them in a file named `.env` next to `compose.yaml`; git ignores it.

The port is published on this machine only. To reach the app from other machines, put a reverse proxy with HTTPS in front of it; `BIND_ADDRESS=0.0.0.0` publishes the port on every network interface without encryption, so use that on a trusted network only. Use Docker Engine 28.3.3 or later; older versions let other hosts on the same network reach ports published on 127.0.0.1.

### Your values on Cloudflare

The three Cloudflare ways use the same values. They are listed in `cloudflare.example.env`:

| Name | Value |
|---|---|
| `PUBLIC_HOST` | The host name the site is served on, for example `terms.example.com`. The domain must be in your Cloudflare account. |
| `ALIAS_HOST` | Optional. A second host name that redirects to `PUBLIC_HOST`. |
| `D1_DATABASE_NAME`, `D1_DATABASE_ID` | Name and ID of your D1 database. |
| `TURNSTILE_SITE_KEY` | Site key of a Turnstile widget. Without it visitors cannot suggest terms. |
| `TURNSTILE_HOSTNAMES` | The host names the widget is allowed on, comma separated; normally the same as `PUBLIC_HOST`. |
| `THEME_KEY_PREFIX` | Name used for the theme setting in the browser, for example `plainword`. |
| `THEME_COOKIE_DOMAIN` | Optional. A parent domain to share the theme setting with your other sites. |
| `SITE_FAMILY` | Name shown for the default theme. |
| `RELATED_SITE_HTML` | Optional. HTML shown on the about page, for example a link to a related site. |

The commands below need Node.js; each step can also be done in the Cloudflare dashboard.

Do this once, before the first deploy:

1. Create the database. The command prints its ID:

   ```sh
   npx wrangler d1 create plainword
   ```

2. Create a Turnstile widget for `PUBLIC_HOST` in the Cloudflare dashboard and note its site key and secret key.
3. Create an API token for deploying, from the "Edit Cloudflare Workers" template, and add the permission Account: D1: Edit. It is the value of `CLOUDFLARE_API_TOKEN` below.

And this once, after the first deploy. Each command asks for the value; the secrets stay in place across later deploys:

```sh
npx wrangler secret put ADMIN_TOKEN --name plainword
```

```sh
npx wrangler secret put TURNSTILE_SECRET --name plainword
```

`ADMIN_TOKEN` is a long random string of your own choice, used to sign in at `/admin`. Put `/admin` behind Cloudflare Access as well. The tables are created and updated by the files in `migrations/` on every deploy.

### From your computer

```sh
cp cloudflare.example.env .cloudflare.env
```

Fill in `.cloudflare.env` (git ignores every `*.env` file except the example), sign in once and deploy:

```sh
npx wrangler login
```

```sh
sh tools/deploy.sh .cloudflare.env
```

Run the last command again whenever you want to deploy a newer version. `tools/deploy.sh` fills the values into a temporary copy, builds the documentation into `/docs` if python3 is installed, applies new database migrations, deploys the copy and removes it. Extra arguments go to `wrangler deploy`; `sh tools/deploy.sh .cloudflare.env --dry-run` builds without touching the database or uploading. If `.cloudflare.env` also has the lines `CLOUDFLARE_API_TOKEN=...` and `CLOUDFLARE_ACCOUNT_ID=...`, they are used and `wrangler login` is not needed; if either of the two is already exported in your shell, that value wins over the file.

### GitHub Actions

Fork the repo, or push a copy to your own account. Fill in `.cloudflare.env` as above and add the lines `CLOUDFLARE_API_TOKEN=...` and `CLOUDFLARE_ACCOUNT_ID=...`. Then store every value as a repository secret with the [GitHub CLI](https://cli.github.com/):

```sh
grep -v '=$' .cloudflare.env | gh secret set -f - -R your-account/plainword
```

The same can be done by hand under Settings → Secrets and variables → Actions. From then on the Deploy workflow deploys every push to `main`, and it can be started by hand under Actions → Deploy → Run workflow. The values are never written to a file in the repo and GitHub masks them in the logs. Without the secret `CLOUDFLARE_API_TOKEN` the workflow does nothing.

### Cloudflare Workers Builds

In the Cloudflare dashboard, create a Worker named `plainword` from your repository (Workers & Pages → Create → Import a repository) and set:

- Deploy command: `sh tools/deploy.sh`
- Build variables and secrets: every name from the table above with your value
- API token: the token you created above; the token Cloudflare creates by itself cannot apply D1 migrations
- Settings → Build → Branch control: turn off Enable Preview Builds

Cloudflare then deploys every push to `main`. Use either this or the GitHub Actions way, not both, or each push is deployed twice.

## Develop

```sh
bun install --frozen-lockfile
npm test
```

To try it locally without Docker, render a copy with your values and start it:

```sh
node tools/render.mjs .cloudflare.env build
```

The output directory must be `build` (or `dist`, `site-docs`, `.wrangler`) in the repository or a directory below the system temp directory, and an overlay directory must be below the working directory, the repository or the temp directory. The tool only deletes and writes there.

```sh
(cd build && npx wrangler d1 migrations apply DB --local && npx wrangler dev)
```
