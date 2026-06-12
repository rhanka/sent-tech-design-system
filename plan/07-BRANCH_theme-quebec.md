# Feature: WP21 — Thème Gouvernement du Québec (Système de design gouvernemental / SDG)

> **Pour les workers agentiques :** ce WP se livre lot par lot. Statuts dans les sous-bullets
> (PAS dans les titres → import track idempotent). Clone strict du pattern **theme-canada** (WP20).

## Objective
Ajouter le thème **Gouvernement du Québec** (Système de design gouvernemental — https://design.quebec.ca,
code open source MIT `Quebecca/qc_trousse_sdg`) au design system, en clonant l'approche du thème **Canada** :
un package `@sentropic/design-system-theme-quebec` qui mappe la palette/typo/anatomie **publique** du SDG
(tokens `--qc-*`) sur la structure de tokens Sentropic (`TenantTheme`), + un chrome documentaire fidèle au
site Québec.ca (signature « Québec » fleurdelisé, bande bleue PIV, langue FR/EN, footer bleu) + enregistrement
dans l'app docs. Précédé d'un inventaire des composants SDG mappé sur le DS, complétant les manques.

## Scope / Guardrails
- Valeurs **publiques** SDG uniquement (tokens open source `--qc-*`) ; ne référencer que les *noms* de police (Open Sans).
- Cloner strictement le pattern **theme-canada** (foundation + semantic + `createComponent`), pas de divergence d'archi.
- Chrome = imite le vrai header/footer Québec.ca (signature fleurdelisé, bande bleue PIV, langue FR/EN) ;
  **pas de rail gauche + container arrondi** (anti-pattern proscrit).
- Parité : le thème agit via CSS vars `:root`, **aucun fork** des composants tri-framework.
- Gate = **suite complète** des packages touchés (lint hex, anatomy, build, tests), pas seulement le nouveau.
- Publish par **tag** (`quebec-v*`, OIDC), jamais par push. Pins docs + lockfile synchro à chaque bump.
- Logos **pixel-perfect** : reprendre l'asset officiel `QUEBEC_couleur.svg` du repo Quebecca, pas de redessin.

## Référence — valeurs réelles SDG (déjà extraites du repo officiel, ne pas re-chercher)

**Palette (thème clair) — `public/css/qc-sdg-design-tokens.css` :**
| token SDG | hex | rôle Sentropic |
|---|---|---|
| `--qc-color-blue-piv` | `#095797` | **brand / action primaire / lien** (bleu de la signature) |
| `--qc-color-blue-medium` | `#19406C` | hover action primaire |
| `--qc-color-blue-dark` | `#223654` | surface inverse / bandeau foncé |
| `--qc-color-blue-regular` | `#1472bf` | interactif / focus |
| `--qc-color-blue-light` | `#4a98d9` | — |
| `--qc-color-blue-pale` | `#dae6f0` | teinte claire bleue (hover secondaire) |
| `--qc-color-purple` | `#6b4fa1` | accent / lien visité |
| `--qc-color-grey-pale` | `#f1f1f2` | surface alt |
| `--qc-color-grey-light` | `#c5cad2` | bordure subtile |
| `--qc-color-grey-regular` | `#8893a2` | bordure forte |
| `--qc-color-grey-medium` | `#6b778a` | texte secondaire |
| `--qc-color-grey-dark` | `#4e5662` | texte secondaire foncé |
| (texte primaire) | `#1c2025` | texte primaire (à confirmer via `--qc-color-text-primary` clair) |
| `--qc-color-red-regular` | `#cb381f` | danger / erreur |
| `--qc-color-green-regular` | `#4f813d` | succès |
| `--qc-color-yellow-regular` | `#e0ad03` | warning (assombrir → `#ad781c` pour AA sur blanc) |
| `--qc-color-pink-regular` | `#e58271` | accent décoratif |

**Police :** **Open Sans** (toutes graisses 400/500/600/700) pour titres ET corps — `src/sdg/bases/typography/_fonts.scss`.
Pas de police d'affichage distincte. Mono : fallback système.

**Asset signature officiel :** `public/img/QUEBEC_couleur.svg` (repo Quebecca) → à télécharger dans
`apps/docs/static/chrome/quebec/`. Version blanche pour footer : dériver/extraire si dispo.

**Bonus SDG :** le repo publie un **thème sombre complet** (`--qc-color-*` redéfinis, cf. `src/sdg/_dark-theme.js`).
Hors scope du livrable minimal ; voir lot optionnel **QC-DARK**.

---

## Plan / Todo (lot-based)

- [ ] **Lot QC-INVENTORY — inventaire + mapping composants SDG**
  - Énumérer `src/sdg/components/*` du repo `Quebecca/qc_trousse_sdg`
    (`gh api repos/Quebecca/qc_trousse_sdg/git/trees/main?recursive=1 --jq '.tree[].path' | grep components/`).
  - Produire `docs/quebec-sdg-mapping.md` : tableau `# | composant SDG | rôle | équivalent DS | statut (✅ couvert / ⛔ gap / ➖ chrome)`.
  - Lister les **gaps réels** (composants SDG sans équivalent DS) → entrée du lot QC-COMPLETE.
  - Vérif : `wc -l docs/quebec-sdg-mapping.md` ; relire les `⛔`.

- [ ] **Lot QC-COMPLETE — complétion DS (gaps SDG)**
  - Pour chaque gap : livrer le composant **tri-framework** (Svelte + React + Vue) + page docs + entrée catalogue + tests.
  - Fichiers (pattern, par composant `Xxx`) :
    - `packages/components-svelte/src/Xxx.svelte` + `Xxx.test.ts` + export `index.ts`
    - `packages/components-react/src/Xxx.tsx` + `Xxx.test.tsx` + export `index.ts`
    - `packages/components-vue/src/Xxx.ts` + `Xxx.test.ts` + export `index.ts`
    - `apps/docs/src/routes/components/xxx/+page.svelte`
  - **Répartition 4 agents** : A=svelte, B=react, C=vue, D=pages docs+catalogue (fichiers disjoints → pas de conflit).
  - Vérif : `npm --workspace packages/components-{svelte,react,vue} test` (tous verts) ; catalogue == exports Svelte.
  - NB : si l'inventaire ne révèle **aucun** gap (probable, SDG ⊂ DS), ce lot est *no-op* → cocher avec note « 0 gap ».

- [ ] **Lot QC-THEME — package theme-quebec**
  - Créer `packages/theme-quebec/` : `package.json`, `tsconfig.json`, `MAPPING.md`, `src/index.ts`, `src/index.test.ts`.
  - `package.json` = clone de `packages/theme-canada/package.json` avec :
    - `"name": "@sentropic/design-system-theme-quebec"`, `"version": "0.1.0"`,
    - `description` = "Gouvernement du Québec (Système de design gouvernemental / SDG) theme mapping…",
    - `repository.directory` = `"packages/theme-quebec"`,
    - deps `@sentropic/design-system-themes` et `@sentropic/design-system-tokens` épinglées **`0.11.0`** (= version courante, lockstep),
    - `devDependencies.typescript: "^5.9.3"`, scripts `build`/`check`/`test` identiques.
  - `tsconfig.json` = copie exacte de `packages/theme-canada/tsconfig.json`.
  - `src/index.ts` = clone de theme-canada, palette remplacée par les valeurs Québec ci-dessus. Squelette :
    ```ts
    import { createComponent } from "@sentropic/design-system-themes";
    import type { TenantTheme } from "@sentropic/design-system-themes";

    // --- SDG raw colour palette (public design tokens --qc-*) -----------------
    const quebecColor = {
      blue: {
        piv: "#095797",     // --qc-color-blue-piv (signature / action primaire / lien)
        medium: "#19406C",  // --qc-color-blue-medium (hover primaire)
        dark: "#223654",    // --qc-color-blue-dark (surface inverse / bandeau)
        regular: "#1472bf", // --qc-color-blue-regular (interactif / focus)
        light: "#4a98d9",   // --qc-color-blue-light
        pale: "#dae6f0"     // --qc-color-blue-pale (teinte claire)
      },
      purple: "#6b4fa1",    // --qc-color-purple (accent / visité)
      grey: {
        0: "#ffffff",
        50: "#f1f1f2",      // --qc-color-grey-pale (surface alt)
        200: "#c5cad2",     // --qc-color-grey-light (bordure subtile)
        400: "#8893a2",     // --qc-color-grey-regular (bordure forte)
        600: "#6b778a",     // --qc-color-grey-medium (texte secondaire)
        700: "#4e5662",     // --qc-color-grey-dark
        900: "#1c2025"      // texte primaire (à confirmer)
      },
      system: {
        success: "#4f813d", // --qc-color-green-regular
        error: "#cb381f",   // --qc-color-red-regular
        warning: "#ad781c", // --qc-color-yellow-dark (AA sur blanc ; regular #e0ad03)
        info: "#095797"     // --qc-color-blue-piv
      },
      accent: "#e58271"     // --qc-color-pink-regular (décoratif)
    } as const;
    ```
    Puis, **calquer la structure `foundation` / `semantic` de theme-canada** en substituant :
    - `foundation.color.blue` {10:`blue.pale`, 60:`blue.piv`, 80:`blue.dark`} ;
    - `foundation.color.cyan` (slot accent) → famille `purple`/`accent` {10:`blue.pale`, 50:`purple`, 70:`blue.medium`} ;
    - `foundation.color.slate` → échelle `grey` (0/10/20/60/80/90 = grey 0/50/200/600/900/… ) ;
    - `foundation.color.feedback` = `system` ;
    - `font.sans` = `font.display` = `"'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"` ;
      `font.mono` = fallback système mono ;
    - `typography.control/field/label` → toutes en `'Open Sans'` (SDG n'a pas de police titre distincte) ;
    - `focus` outline en `blue.regular` `#1472bf` ; `field.style: "outline"`, fill blanc, bordure `grey.400`,
      chevron select redessiné en `blue.piv` ;
    - `action.primary` `blue.piv`, `action.primaryHover` `blue.medium`, `text.link` `blue.piv`,
      `surface.inverse` `blue.dark`, `border.strong` `grey.400` ;
    - `data.category1..8` = bleus/violet/vert/rouge/jaune SDG (proposition cohérente, noter « à confirmer »).
    - `export const quebecTheme: TenantTheme = { id: "quebec", label: "Gouvernement du Québec", mode: "light", tokens: { foundation, semantic, component: createComponent(semantic, foundation) } }; export default quebecTheme;`
  - `src/index.test.ts` = clone de theme-canada (3 tests vitest) adapté : `id==="quebec"`, `label==="Gouvernement du Québec"`,
    `mode==="light"`, anatomie (composants clés présents), `compileTheme` → `--st-semantic-action-primary` contient `#095797`.
  - `MAPPING.md` = sources SDG + tableau couleurs + notes « à confirmer ».
  - Vérif : `npm --workspace packages/theme-quebec test` (3/3) ; `npm --workspace packages/theme-quebec run build` (exit 0).

- [ ] **Lot QC-CHROME — chrome documentaire ChromeQuebec.svelte**
  - Télécharger l'asset officiel :
    `gh api repos/Quebecca/qc_trousse_sdg/contents/public/img/QUEBEC_couleur.svg --jq '.content' | base64 -d > apps/docs/static/chrome/quebec/signature.svg`
    (+ une variante blanche pour le footer si besoin).
  - Créer `apps/docs/src/lib/chrome/ChromeQuebec.svelte` en **clonant `ChromeCanada.svelte`** et en reskinant Québec.ca :
    - Header blanc, signature « Québec » (fleurdelisé) en haut à gauche, bande/accent **bleu PIV `#095797`**.
    - Nav horizontale, **sélecteur de langue FR/EN** (SDG bilingue), recherche.
    - Sidebar gauche (item actif accent bleu PIV), fil d'Ariane, **footer bande bleue** + signature blanche.
    - **Pas** de rail gauche couplé à un container arrondi.
    - Contrat de props **identique** aux autres chromes : `children, activeThemeId, isThemeOpen, onThemeToggle,
      themeSwitcher, frameworkSwitcher, localeSwitcher, compareButton, mobileMenuOpen, onMobileMenuToggle`.
    - Préfixe de classe dédié `qc-*` (`qc-shell`, `qc-header`, `qc-sidebar`, `qc-sidebar-footer`, `qc-nav`, `qc-breadcrumb`).
  - Vérif : rendu sans rail-gauche-arrondi ; signature pixel-perfect depuis l'asset officiel.

- [ ] **Lot QC-DOCS — intégration app docs (diffs exacts)**
  - `apps/docs/package.json` :
    - ajouter `"@sentropic/design-system-theme-quebec": "0.1.0"` dans `dependencies` (ordre alpha, après `-canada`) ;
    - ajouter `&& npm --workspace packages/theme-quebec run build` dans **`predev`** ET **`prebuild`** (après `theme-canada`).
  - `apps/docs/src/routes/+layout.svelte` :
    - import : `import { quebecTheme } from "@sentropic/design-system-theme-quebec";`
    - import chrome : `import ChromeQuebec from "$lib/chrome/ChromeQuebec.svelte";`
    - `const THEMES: TenantTheme[] = [sentTechTheme, dsfrTheme, carbonTheme, airbusTheme, canadaTheme, quebecTheme];`
    - `useCustomChrome` : ajouter `|| activeThemeId === "quebec"`.
    - ajouter le bloc `{:else if useCustomChrome && activeThemeId === "quebec"}` avec `<ChromeQuebec …>` (mêmes props que `<ChromeCanada>`).
  - `apps/docs/src/lib/url-state.ts` :
    - `ThemeId` union : `… | "canada" | "quebec";`
    - `VALID_THEME_IDS` : ajouter `"quebec"`.
  - `apps/docs/src/lib/compare/reference-themes.mjs` :
    - constante `const QC_SDG_CDN = "https://cdn.jsdelivr.net/gh/Quebecca/qc_trousse_sdg@<TAG>/dist/css";`
      (résoudre `<TAG>` via `gh api repos/Quebecca/qc_trousse_sdg/releases/latest --jq .tag_name` ; **doit** matcher `/@\d/`).
    - entrée `quebec: { label: "Système de design gouvernemental (Québec)", cssUrl: \`${QC_SDG_CDN}/qc-sdg.min.css\`,
      fontLinks: Open Sans via Google Fonts (preconnect + css2?family=Open+Sans:wght@400;500;600;700),
      brandFont: "'Open Sans', system-ui, sans-serif", lang: "fr" }`.
  - Vérif : `npm --workspace apps/docs run check` (svelte-check 0 erreur) ; sélecteur affiche « Gouvernement du Québec ».

- [ ] **Lot QC-CONTRACT — tests de contrat docs (mettre à jour, sinon ils cassent)**
  - `apps/docs/src/lib/compare/reference-themes.test.ts` :
    `expect(Object.keys(REFERENCE_THEMES).sort()).toEqual(["canada", "carbon", "dsfr", "quebec"]);`
  - `apps/docs/src/lib/header-contract.test.ts` :
    - ajouter lecture de `ChromeQuebec.svelte` (`quebecChromeSource`) ;
    - étendre l'assertion `THEMES` : `… airbusTheme, canadaTheme, quebecTheme]` ;
    - étendre l'assertion `useCustomChrome` avec `|| activeThemeId === "quebec"` ;
    - `expect(layoutSource).toContain("<ChromeQuebec");` ;
    - assertions structure : `qc-shell`, `qc-header`, `qc-sidebar`, signature officielle, `frameworkSwitcher`, `qc-sidebar-footer`.
  - Vérif : `npm --workspace apps/docs test` (tous verts, dont `reference-themes.test` + `header-contract.test`).

- [ ] **Lot QC-VERIFY — gate CI complète + livraison**
  - Créer `.github/workflows/quebec-publish.yml` = clone de `canada-publish.yml`, `canada`→`quebec` partout
    (tag `quebec-v*`, package `@sentropic/design-system-theme-quebec`, name « Quebec Theme Publish »).
  - Bumper les pins/lockfile si des composants ont changé (QC-COMPLETE) ; `npm install` pour regénérer le lockfile.
  - Gate locale (toute la suite, pas que le nouveau package) :
    ```
    npm run build
    npm --workspace apps/docs run check
    npm run test --workspaces
    npm run pack:smoke
    ```
    + design quality ≥ 95/100 et parité tri-framework 0 divergence (`--st-semantic-action-primary === #095797` sur svelte/react/vue).
  - Cocher les lots `[x]` dans ce fichier ; commit `docs(plan): WP21 thème Québec livré` ; **push main** ; CI verte.
  - Trusted publisher npm OIDC pour `@sentropic/design-system-theme-quebec` à câbler avant le 1er tag (utilisateur = 2FA).

- [ ] **Lot QC-AUDIT — audit de parité tri-framework**
  - Sweep headless `?framework={svelte|react|vue}&theme=quebec` sur les pages composant ;
    vérifier `--st-semantic-action-primary === #095797` identique sur les 3 frameworks.
  - Produire `docs/quebec-parity-audit.md` (verdict + tableau) ; commit `docs(quebec): audit de parité tri-framework`.

- [ ] **Lot QC-DARK *(optionnel)* — variante sombre SDG**
  - Le SDG publie un thème sombre complet (`src/sdg/_dark-theme.js`). Si l'infra dark du DS le permet
    (cf. `packages/tokens/src/*.dark.ts` en cours), livrer `quebecDarkTheme` (`mode: "dark"`) à partir du bloc
    sombre `--qc-color-*`. Sinon, documenter et reporter. **Ne pas bloquer QC-VERIFY là-dessus.**

---

## Carte de parallélisation (4 agents, fichiers disjoints, non-isolés)
> Les worktrees isolés timeout sur ce repo (npm ci ~19 min) → agents **non-isolés**, partition par fichiers.

| Phase | Agent A | Agent B | Agent C | Agent D |
|---|---|---|---|---|
| QC-COMPLETE (si gaps) | svelte | react | vue | pages docs + catalogue |
| QC-THEME / QC-CHROME | theme-quebec (package) | ChromeQuebec.svelte + asset | — | — |
| QC-DOCS / QC-CONTRACT | layout + url-state | package.json + reference-themes | header-contract.test | reference-themes.test |

Orchestrateur (boucle `/loop`) : barrière après chaque phase → `git add` ciblé → commit → **push main** ; ne jamais
laisser 2 agents éditer le même fichier dans une même vague.

## Checklist gates avant chaque push/merge
1. Lockstep : deps tokens/themes épinglées `0.11.0`, pas de bump non voulu.
2. Pins docs : `grep theme-quebec apps/docs/package.json` ; `npm ci` sans 404.
3. Suite complète : `npm run test --workspaces` + `npm run check` (lint hex, anatomy, contrats) tous verts.
4. Publish par tag `quebec-v*` (OIDC), jamais par push.
5. `.track` / `plan/` édités **uniquement** depuis le repo principal (main), pas un worktree concurrent.
6. Signature SVG = asset officiel `QUEBEC_couleur.svg`, pas de redessin.
7. Pas de rail gauche + container arrondi dans ChromeQuebec.
