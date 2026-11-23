# OmniaUI-versie (semver, alle packages in lockstep)

Formaat: `MAJOR.MINOR.PATCH` (bijv. `0.6.0`). npm accepteert geen vier-delige versies, daarom drie delen
(zelfde workflow als OmniaDesk). Root `package.json` en alle `@birdycom/omniaui*` packages hebben altijd dezelfde versie.

**OmniaCSS en OmniaUI houden dezelfde versie.** Bump je hier, bump dan ook de OmniaCSS-repo (`npm run release -- x.y.z "..."`
daar), en ververs daarna `vendor/omniacss` met `npm run sync:omniacss`. De peerDependency `@birdycom/omniacss` volgt mee.

## Agent bepaalt de bump (niet de gebruiker vragen)

| Soort wijziging | Bump | Voorbeeld `0.6.0` → |
|-----------------|------|----------------------|
| **Kleine ingreep** — bugfix, polish, typo, kleine UI-tweak | `patch` | `0.6.1` |
| **Nieuw item** — component, block, wrapper, docs-pagina, merkbare wijziging | `minor` | `0.7.0` |
| **Breaking** — klasse hernoemd/verwijderd, nieuwe verplichte setup | `major` | `1.0.0` |

Bij twijfel: de **kleinere** bump. Geen bump bij pure interne docs/rules zonder effect voor gebruikers.

## Werkwijze

```bash
npm run release -- minor "Korte omschrijving van de wijziging"
```

Dit script:
1. zet de versie in `package.json` + `packages/*/package.json` + `apps/site/package.json` (en de `@birdycom/*`-ranges),
2. werkt **Versie:** en de tabel **Recente wijzigingen** (nieuwste bovenaan) in `README.md` bij,
3. zet dezelfde rij bovenaan in `docs/release-history.json`.

De Composer-packages (`php-packages/*/composer.json`, `OmniacssServiceProvider::VERSION`, `config/omniacss.php`) zet je met de hand mee.

## Elke commit vermeldt de versie vooraan

```
<type>: [vX.Y.Z] - <korte omschrijving>
```

Voorbeelden: `fix: [v0.6.1] - hero padding op mobiel`, `feat: [v0.7.0] - block testimonials`.

## Publiceren (alleen op vraag van de gebruiker)

Eerst `@birdycom/omniacss` (OmniaCSS-repo) met dezelfde versie, daarna hier:

```bash
npm run build
npm publish --access public -w @birdycom/omniaui -w @birdycom/omniaui-blocks -w @birdycom/omniaui-react -w @birdycom/omniaui-vue
```
