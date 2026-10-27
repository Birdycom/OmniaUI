<!-- File: CONTRIBUTING.md | Map: principe -> component recept -> block recept -> wrappers -> Laravel -> controleren -> regels -->
# Bijdragen aan OmniaUI

## Principe: alleen nieuwe bestanden

Een component of block toevoegen doe je door **nieuwe bestanden te maken**. Je bewerkt geen gedeelde lijsten.
Zo kunnen meerdere mensen (of agents) tegelijk werken zonder merge-conflicten.

Deze dingen worden gegenereerd bij `npm run build`:

| Wat | Generator | Bron |
|---|---|---|
| CSS-bundels (`dist/*.css`, `public/css/oc-*.css`) | `scripts/build-packages.mjs` | alle `src/parts/*.css` (alfabetisch) |
| `manifest.json` (ui + blocks) | `scripts/build-manifests.mjs` | de eerste regel van elk snippet |
| Sidebar-nav (`public/data/oc-*-nav.json`) | `scripts/build-nav.mjs` | de meta-regel van elke content-pagina |
| Site-routes (`apps/site/src/pages`) | `apps/site/scripts/routes.mjs` | elk bestand in `apps/site/src/content` |
| React `src/index.ts` + manifest | `packages/react/scripts/build-manifest.mjs` | bestanden in `src/components` en `src/blocks` |
| Vue `src/index.ts` + manifest | `packages/vue/scripts/generate-index.mjs` | bestanden in `src/components` en `src/blocks` |
| Blade-componenten | geen registratie nodig | `Blade::anonymousComponentPath()` laadt de hele map |

## Recept: nieuw component `<name>` (kebab-case, bv. `rating`)

1. **CSS**: `packages/ui/src/parts/<name>.css`
   - Begin met `/* File: packages/ui/src/parts/<name>.css | Map: ... */`.
   - Alleen klassen met prefix `oc-<name>`. Geen element- of id-selectors op het hoogste niveau.
   - Alleen Omnia-kleuren: `var(--color-<naam>-<step>)` of de `--oc-*` tokens. Nooit hex, rgb of hsl.
2. **Snippet**: `packages/ui/snippets/<name>.html`. De **eerste regel** is verplicht in dit formaat:
   ```html
   <!-- OmniaUI component: <name> — Korte omschrijving. Needs @birdycom/omniaui CSS. -->
   ```
   Daaronder komt de kale HTML-markup. Het manifest-item (naam, omschrijving, `requires`) komt uit deze regel.
3. **Docs-pagina**: `apps/site/src/content/ui/components/<name>.html`. De eerste regel is de meta:
   ```html
   <!--oc-page {"title": "OmniaUI - Rating", "category": "Forms", "description": "Star rating on radio inputs.", "nav": "Rating", "layout": "sidebar", "shell": "ui", "shellClass": "ocd-shell", "bodyClass": "", "head": []}-->
   ```
   - `category` = de groep in de sidebar én op het overzicht. Kies een groep uit `scripts/lib/categories.mjs` (daar staat ook de volgorde); een nieuwe naam komt achteraan.
   - `description` = één zin voor de kaart op het overzicht `ui/components.html` of `ui/blocks.html`.
   - `nav` (optioneel) = het label in de sidebar. Zonder `nav` wordt de titel gebruikt, zonder "OmniaUI - ".
   - Volg de paginalayout van `button.html`: hero → Reference-tabel → demo + code → browser support.
   - Route `/ui/components/<name>.html` en het nav-item ontstaan vanzelf.

## Recept: nieuw block `<name>` (bv. `testimonials`)

1. **CSS**: `packages/blocks/src/parts/<name>.css`, met klassen `oc-block-<name>*`.
2. **Snippet**: `packages/blocks/blocks/<name>.html`, met als eerste regel:
   ```html
   <!-- OmniaUI block: <name> - Korte omschrijving. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS. -->
   ```
3. **Docs-pagina**: `apps/site/src/content/ui/blocks/<name>.html` met dezelfde meta-regel (fallback-categorie "Blocks").

## Wrappers (optioneel, ook alleen nieuwe bestanden)

| Framework | Component | Block |
|---|---|---|
| React | `packages/react/src/components/<Name>.tsx` | `packages/react/src/blocks/Block<Name>.tsx` |
| Vue | `packages/vue/src/components/Oc<Name>.vue` | `packages/vue/src/blocks/OcBlock<Name>.vue` |

- `<Name>` is PascalCase van de kebab-naam (`rating` → `Rating`). De snippet wordt dan automatisch gekoppeld.
- Gebruik exact dezelfde markup en klassen als het snippet.
- De index wordt opnieuw gemaakt bij `npm run build:wrappers` (of `npm run gen:index`). Commit de gegenereerde `index.ts` en `manifest.json` mee.
- Vue-subonderdelen met een andere naam dan het snippet (bv. `OcRatingItem`) staan in `snippetAlias` in `generate-index.mjs`. Dit is de enige gedeelde lijst; voeg daar je regel toe als dat nodig is.

## Laravel (optioneel)

- Component: `php-packages/omniaui-laravel/resources/views/components/<name>.blade.php` → `<x-oc::<name>>`.
- Block: genereer de view met `npm run blade:blocks` → `resources/views/components/block/<name>.blade.php` → `<x-oc::block.<name>>`.
- Livewire: `php-packages/omniaui-livewire/resources/views/components/wire/<name>.blade.php`.

## Controleren

```bash
npm test                                   # build + CLI + React + Vue tests
cd php-packages/omniaui-laravel && vendor/bin/phpunit   # als je Blade aanpaste
```

Bekijk daarna `https://omniaui.test/ui/components/<name>.html`. Het item staat in de sidebar onder de juiste categorie
en als kaart op het overzicht: `ui/components.html` en `ui/blocks.html` worden door `scripts/build-galleries.mjs` gemaakt
(deel van `site:build`), nooit met de hand bewerken. Een blok krijgt een thumbnail als `public/img/blocks/<name>.jpg`
(en `<name>-dark.jpg`, 16:10, schermafbeelding van de eerste demo) bestaat.

**Na het mergen (één persoon, niet parallel):** verhoog de versie: `npm run release -- minor "..."`.

## Regels

- Bestanden kort houden (< 200 regels). Elk nieuw bestand begint met een commentaar met de bestandsnaam en een "Map:".
- Geen namen van andere CSS-frameworks of componentbibliotheken.
- Zo weinig mogelijk JavaScript: gebruik popover, dialog, details, `:has()` en anchor positioning.
- Prefix `oc-` voor klassen, `x-oc::` voor Blade. Die blijven altijd hetzelfde.
