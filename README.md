# Plainword

Ett svenskt uppslagsverk i enkel svenska som jämför hur ord används i vardagen och i myndighets- och juridiskt språk. Besökare kan föreslå nya ord, men inget publiceras innan en administratör har granskat det.

Appen är en Cloudflare Worker med D1-databas. Alla inställningar är platshållare av typen `__NAMN__`, så ingen miljöspecifik uppgift ligger i koden.

## Kom igång

```sh
bun install --frozen-lockfile
npm test
```

Kör en egen kopia:

```sh
cp cloudflare.example.env mina-värden.env
node tools/render.mjs mina-värden.env build
(cd build && npx wrangler dev)
```

Distribuera med `npx wrangler deploy --cwd build` på den renderade kopian. Skapa D1-databasen själv och skriv in dess namn och ID i värdefilen; tabellerna skapas av filerna i `migrations/`. Adminsidan under `/admin` ska ligga bakom Cloudflare Access.

`docker/entrypoint.sh` renderar och startar appen från miljövariabler i en container, med data i `/data`.

English: see [docs/eng/README.md](docs/eng/README.md).
