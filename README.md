# Plainword

Ett svenskt uppslagsverk i enkel svenska som jämför hur ord används i vardagen och i myndighets- och juridiskt språk. Besökare kan föreslå nya ord, men inget publiceras innan en administratör har granskat det.

Appen är en Cloudflare Worker med D1-databas. Alla inställningar är platshållare av typen `__NAMN__`, så ingen miljöspecifik uppgift ligger i koden: dina egna värden ligger i en fil som git ignorerar, i hemligheter i GitHub Actions eller i byggvariabler hos Cloudflare.

## Kör en egen kopia

Det finns fyra sätt, och alla ger samma app. Välj ett.

| Sätt | Du behöver | Körs på |
|---|---|---|
| [Docker](#docker) | Docker | Din egen dator eller server |
| [Direkt med Wrangler](#direkt-med-wrangler) | Node.js 24, ett Cloudflare-konto | Cloudflare |
| [GitHub Actions](#github-actions) | Ett GitHub-konto, ett Cloudflare-konto | Cloudflare, vid varje push till `main` |
| [Cloudflare Workers Builds](#cloudflare-workers-builds) | Ett GitHub- eller GitLab-konto, ett Cloudflare-konto | Cloudflare, vid varje push till `main` |

Ett GitHub-konto behövs bara för de två sista. För de två första räcker det att ladda ned källkoden som ZIP-fil eller klona den.

### Docker

```sh
ADMIN_TOKEN='en-lång-slumpad-sträng' docker compose up -d
```

Öppna <http://localhost:8787>. Granskningskön finns på `/admin`; logga in där med token. Databasen sparas i volymen `data`. Sätt `PUBLIC_HOST` för att köra under ett annat värdnamn, och `TURNSTILE_SITE_KEY` och `TURNSTILE_SECRET` för att besökare ska kunna föreslå ord. I stället för att skriva värdena på kommandoraden kan du lägga dem i en fil med namnet `.env` bredvid `compose.yaml`; git ignorerar den.

### Dina värden hos Cloudflare

De tre Cloudflare-sätten använder samma värden. De står i `cloudflare.example.env`:

| Namn | Värde |
|---|---|
| `PUBLIC_HOST` | Värdnamnet som sajten körs på, till exempel `terms.example.com`. Domänen måste finnas i ditt Cloudflare-konto. |
| `ALIAS_HOST` | Valfritt. Ett andra värdnamn som skickar vidare till `PUBLIC_HOST`. |
| `D1_DATABASE_NAME`, `D1_DATABASE_ID` | Namn och ID för din D1-databas. |
| `TURNSTILE_SITE_KEY` | Webbplatsnyckeln för en Turnstile-widget. Utan den kan besökare inte föreslå ord. |
| `TURNSTILE_HOSTNAMES` | Värdnamnen som widgeten får användas på, åtskilda med komma; normalt samma som `PUBLIC_HOST`. |
| `THEME_KEY_PREFIX` | Namnet som temainställningen sparas under i webbläsaren, till exempel `plainword`. |
| `THEME_COOKIE_DOMAIN` | Valfritt. En överordnad domän att dela temainställningen med dina andra sajter på. |
| `SITE_FAMILY` | Namnet som visas för standardtemat. |
| `RELATED_SITE_HTML` | Valfritt. HTML som visas på sidan om sajten, till exempel en länk till en besläktad sajt. |

Gör detta en gång, före första driftsättningen:

1. Skapa databasen. Kommandot skriver ut dess ID:

   ```sh
   npx wrangler d1 create plainword
   ```

2. Skapa en Turnstile-widget för `PUBLIC_HOST` i Cloudflares kontrollpanel och notera dess webbplatsnyckel och hemliga nyckel.
3. Skapa en API-token för driftsättning från mallen "Edit Cloudflare Workers" och lägg till behörigheten Account: D1: Edit. Den är värdet för `CLOUDFLARE_API_TOKEN` nedan.

Och detta en gång, efter första driftsättningen. Varje kommando frågar efter värdet; hemligheterna ligger kvar vid senare driftsättningar:

```sh
npx wrangler secret put ADMIN_TOKEN --name plainword
```

```sh
npx wrangler secret put TURNSTILE_SECRET --name plainword
```

`ADMIN_TOKEN` är en lång slumpad sträng som du väljer själv och loggar in med på `/admin`. Lägg också `/admin` bakom Cloudflare Access. Tabellerna skapas och uppdateras av filerna i `migrations/` vid varje driftsättning.

### Direkt med Wrangler

```sh
cp cloudflare.example.env .cloudflare.env
```

Fyll i `.cloudflare.env` (git ignorerar alla `*.env`-filer utom exemplet), logga in en gång och driftsätt:

```sh
npx wrangler login
```

```sh
sh tools/deploy.sh .cloudflare.env
```

Kör det sista kommandot igen när du vill driftsätta en nyare version. `tools/deploy.sh` fyller i värdena i en tillfällig kopia, bygger dokumentationen till `/docs` om python3 finns, kör nya databasmigreringar, driftsätter kopian och tar bort den. Extra argument går vidare till `wrangler deploy`; `sh tools/deploy.sh .cloudflare.env --dry-run` bygger utan att röra databasen eller ladda upp något.

### GitHub Actions

Forka repot, eller pusha en kopia till ditt eget konto. Fyll i `.cloudflare.env` som ovan och lägg till raderna `CLOUDFLARE_API_TOKEN=...` och `CLOUDFLARE_ACCOUNT_ID=...`. Spara sedan alla värden som hemligheter i repot med [GitHub CLI](https://cli.github.com/):

```sh
grep -v '=$' .cloudflare.env | gh secret set -f - -R ditt-konto/plainword
```

Samma sak går att göra för hand under Settings → Secrets and variables → Actions. Därefter driftsätter arbetsflödet Deploy varje push till `main`, och det kan startas för hand under Actions → Deploy → Run workflow. Värdena skrivs aldrig till någon fil i repot och GitHub maskerar dem i loggarna. Utan hemligheten `CLOUDFLARE_API_TOKEN` gör arbetsflödet ingenting.

### Cloudflare Workers Builds

Skapa en Worker med namnet `plainword` från ditt repo i Cloudflares kontrollpanel (Workers & Pages → Create → Import a repository) och ange:

- Deploy command: `sh tools/deploy.sh`
- Build variables and secrets: varje namn i tabellen ovan med ditt värde
- API token: den token du skapade ovan; den token som Cloudflare skapar själv kan inte köra D1-migreringar
- Settings → Build → Branch control: stäng av Enable Preview Builds

Cloudflare driftsätter sedan varje push till `main`. Använd antingen detta eller GitHub Actions, inte båda, annars driftsätts varje push två gånger.

## Utveckla

```sh
bun install --frozen-lockfile
npm test
```

Prova lokalt utan Docker genom att rendera en kopia med dina värden och starta den:

```sh
node tools/render.mjs .cloudflare.env build
```

```sh
(cd build && npx wrangler d1 migrations apply DB --local && npx wrangler dev)
```

English: see [docs/eng/README.md](docs/eng/README.md).
