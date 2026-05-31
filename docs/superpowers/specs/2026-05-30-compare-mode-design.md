# Compare Mode & Registre de Gaps — Spec de design

> Statut : **validé par l'utilisateur** (design révisé après revues croisées Codex 5.5 xhigh + Opus 4.8, verdict commun « à ajuster » → corrections intégrées).
> Date : 2026-05-30.

## Problème

Le banc `/compare` aligne aujourd'hui chaque composant Sent Tech à côté de son
équivalent officiel (DSFR, Carbon) en iframe CDN. Deux manques :

1. **Revue par composant impossible** : pas de vue bord-à-bord *sur la page d'un
   composant* pour une revue pixel-perfect accélérée, ni de moyen de **signaler**
   un écart sans casser la navigation.
2. **Pas de mémoire des écarts** : les gaps connus / impossibles à résoudre / à
   traiter ne sont consignés nulle part de façon versionnée et triable.

Cible : uniquement les **thèmes d'import de DS tiers** (DSFR, Carbon), pas les
variantes (`forge`/`entropic`/`sent-tech`).

## Contraintes du repo (vérifiées sur le code)

- Docs = SvelteKit **adapter-static** (GitHub Pages) → **aucune écriture serveur
  en prod**. `prerender = true`, `strict` (`apps/docs/svelte.config.js`).
- Le **thème actif est client-only** : `+layout.svelte:37` initialise toujours
  `sentTechTheme` au SSR ; le thème réel est lu depuis `localStorage`
  (`THEME_STORAGE_KEY = "st-docs-theme"`) dans un `$effect` après hydratation. Le
  prerender ne connaît donc **aucun** thème d'import.
- `TenantTheme` (`packages/themes/src/schema.ts`) est une **API npm publique**
  minimale : `{ id, label, mode, tokens }`.
- Duplication existante du savoir « référence » :
  - page : `CDN`, `FONT_LINKS`, `BRAND_FONT`, `ENTRIES`, `REF`, `refDoc()`
    (`apps/docs/src/routes/compare/+page.svelte`).
  - oracle : `COMPONENTS`, `COMPONENT_THEMES`, `OUR_SELECTOR`, `REF_SELECTOR`,
    `REF_SELECTOR_NOTE` (`tools/compare/fidelity.mjs:50-200`).
  - Cette duplication est la **cause du bug `--component`** : l'oracle localise
    l'iframe de référence par **index de ligne**
    (`rowIdx = themeComponents.indexOf(component)`, `fidelity.mjs:674` +
    `locateRefFrame`), donc un filtrage (`--component X`) décale l'index et mesure
    la **mauvaise** iframe silencieusement.
- L'oracle écrit `tools/compare/last-report.json` par **`writeFile` brut**
  (`fidelity.mjs:1003`, écrasement total).
- Tests : `apps/docs` → **vitest** (`vitest run src`) ; logique pure partageable →
  module `.mjs` importable par Vite **et** par Node (l'oracle est du `.mjs` ESM et
  **ne peut pas importer un `.ts`**).

## Décisions utilisateur (prises en brainstorming)

- Registre de gaps = **fichier JSON versionné**.
- Layout compare = **triptyque** (notre | officiel | rail), **nav de gauche
  conservée**.
- Persistance = **dev write-back + export statique**.
- **Vue nav « gaps »** (connus / impossibles / à traiter) pour les thèmes
  d'import.

## Corrections issues des revues croisées (Codex 5.5 xhigh + Opus 4.8)

| Réf | Correction | Origine |
|-----|------------|---------|
| C1 | **Identité de gap stable** : `theme/component/scenario/state/property` + `manifestHash`. `{edge,ours,ref,delta}` seul est insuffisant. Prérequis du merge. | les deux (bloquant) |
| C2 | **La donnée « référence » sort du paquet npm** : registre **docs-local** `REFERENCE_THEMES[themeId]`, pas de champ sur `TenantTheme`. Zéro changement d'API publique. | les deux |
| C3 | **Mode compare client-only** + **deep-link encode le thème** : `?compare=1&theme=dsfr&scenario=…` (le thème n'est pas dans l'URL aujourd'hui → lien non reproductible). | les deux |
| C4 | **Invariant : aucune mesure de style côté navigateur.** L'iframe officielle est **purement visuelle** ; les Δ affichés viennent **du registre** produit par l'oracle (Puppeteer). | les deux |
| C5 | **Oracle merge, pas écrasement** : ne touche que `source:oracle` + champs mesurés, **préserve** `status`/`note` humains. `last-report.json` reste généré tel quel ; `compare-gaps.json` est curaté. | les deux |
| C6 | **Sélection par `data-compare-*`**, fin de l'indexation positionnelle (corrige `--component`). | les deux |
| C7 | **Write-back dev durci** : plugin Vite **serve-only**, bind **127.0.0.1**, contrôle `Origin`/`Host`, chemin de sortie **hardcodé** (jamais dérivé du payload), validation de schéma, taille max, écriture atomique. | les deux |
| C8 | **Reproductibilité** : **CDN pinés** (pas `latest`) ; chaque entrée stampe `manifestHash` + `anatomyVersion`/`dsVersion`/`themeVersion` + `lastSeen` → état **dérivé** `stale`/`regressed`. | les deux |
| C9 | **Modèle scénario/état** : le manifeste porte `component`+`scenario`+`state`, pas seulement `component`. États v1 = `rest`/`focus`/`disabled`/`error`/`selected` (déjà mesurables). **`hover` hors-périmètre** (non forçable sans Puppeteer hover). | les deux |
| C10 | **Emplacement du registre** : sous `apps/docs/src/lib/compare/` (importé au build, donc lisible par nav+rail déployés). Export = **JSON complet mergé**, pas un patch partiel. | Codex (placement) + Opus (export complet) |

## Architecture cible

### Source unique partagée (`apps/docs/src/lib/compare/`)

1. **`manifest.mjs`** (+ `manifest.d.ts`) — donnée ESM pure, importable par la page
   `/compare`, le mode compare par composant **et** l'oracle. Clé
   `theme → key`, valeur :
   ```
   {
     component: string,   // "Button"
     scenario: string,    // "primary" | "disabled" | "error" | ...
     state: "rest" | "focus" | "disabled" | "error" | "selected",
     ourSelector: string, // ".st-button" (relatif au scope)
     refSelector: string, // ".fr-btn"
     refMarkup: string,   // markup officiel (langue du thème)
     lang: "fr" | "en",
     note?: string        // déviation justifiée (ex. pseudo-élément)
   }
   ```
   Remplace `COMPONENTS`/`COMPONENT_THEMES`/`OUR_SELECTOR`/`REF_SELECTOR`/
   `REF_SELECTOR_NOTE` (oracle) **et** `ENTRIES`/`REF` (page). Migration **1:1** des
   22 clés de banc existantes (aucune nouvelle couverture en Lot 1) : les clés
   d'état (`ButtonDisabled`, `InputError`, `InputDisabled`) deviennent des
   scénarios explicites du composant parent (`{component:"Button",
   scenario:"disabled", state:"disabled"}`).

2. **`reference-themes.mjs`** (+ `.d.ts`) — `REFERENCE_THEMES[themeId] =
   { label, cssUrl, fontLinks, brandFont }`, **CDN pinés**. Remplace `CDN`/
   `FONT_LINKS`/`BRAND_FONT` de la page. La **présence** d'une entrée = « thème
   d'import » → active (côté client) le bouton Compare + l'item nav « gaps ».

3. **`registry.mjs`** (+ `registry.test.ts` vitest) — fonctions **pures**
   partagées par l'oracle et la page :
   - `gapKey({theme, component, scenario, state, property}) → string`
   - `manifestHash(manifest) → string` (hash déterministe stable)
   - `mergeRegistry(existing, oracleResults, {manifestHash, stamp}) → registry`
     (préserve `status`/`note`/`source:manual` ; met à jour `ours`/`ref`/`delta`/
     `lastSeen`/`manifestHash` pour `source:oracle`)
   - `deriveStatus(entry, currentManifestHash) → "open"|"escape"|"fixed"|"stale"|"regressed"`
     (`stale` = `manifestHash` ne correspond plus ; `regressed` = marqué `fixed`
     mais l'oracle remesure un écart)

4. **`compare-gaps.json`** — registre versionné, committé :
   ```
   {
     version: 1,
     generatedAt: "<ISO, stampé hors-script>",
     manifestHash: "<hash>",
     anatomyVersion, dsVersion, themeVersion,
     entries: {
       "<gapKey>": {
         theme, component, scenario, state, property,
         ours, ref, delta,
         status: "open" | "escape" | "fixed",   // triage HUMAIN
         note?: string,
         source: "oracle" | "manual",
         lastSeen: "<ISO>",
         manifestHash: "<hash au dernier passage oracle>"
       }
     }
   }
   ```

### Oracle (`tools/compare/fidelity.mjs`)

- Importe `manifest.mjs` + `reference-themes.mjs` + `registry.mjs` (relatif).
- Localise l'iframe de référence via **`data-compare-theme` / `data-compare-component`
  / `data-compare-scenario`**, plus par index (corrige `--component`).
- Continue d'écrire `last-report.json` **tel quel** (rétro-compat) ; **en plus**,
  produit `compare-gaps.json` via `mergeRegistry` (jamais d'écrasement du triage).

### Mode compare par composant (Lot 2)

- Bouton « Compare » dans l'entête, affiché **ssi** le thème actif (client) a une
  entrée `REFERENCE_THEMES`. Bascule `?compare=1&theme=<id>&scenario=<id>`.
- Triptyque : **notre live** | **iframe officielle (visuelle)** | **rail de gaps**
  (liste lue du registre + Δ par propriété + bouton « ⚑ Signaler »). **Nav gauche
  conservée.** Rail **repliable** sous un breakpoint (triptyque + sidebar serré).
- **Aucune mesure client** : tous les Δ proviennent du registre.
- Notes de gap rendues en **interpolation texte Svelte** (jamais HTML brut).

### Persistance (Lot 3)

- `npm run dev` : **plugin Vite serve-only** ; ⚑ POST → écrit `compare-gaps.json`
  (gardes C7). Écriture atomique (tmp + rename).
- Statique déployé : rail **lecture seule** + bouton « Exporter » (download du JSON
  complet mergé à committer).

### Vue nav « gaps » (Lot 3)

Tableau de bord lisant le registre : À traiter (`open`) / Impossibles (`escape`) /
Résolus (`fixed`) + signalés `stale`/`regressed`, par composant (fidélité % +
compteurs), liens vers le compare. **Zéro iframe.**

## Découpage (3 lots — l'identité/merge d'abord)

| Lot | Intitulé clair | Contenu | Testable seul ? |
|-----|----------------|---------|-----------------|
| **Lot 1** | **Socle de vérité partagée** (sans UI compare) | manifeste + `reference-themes` ; `registry.mjs` (gapKey/hash/merge/deriveStatus) + tests ; oracle consomme le manifeste ; sélection `data-compare-*` (corrige `--component`) ; oracle écrit `compare-gaps.json` par merge ; seed initial. | **Oui** — oracle + tests, aucun rendu de page modifié. |
| **Lot 2** | **Vue compare en lecture** | bouton Compare (client-only) ; triptyque ; deep-links avec thème ; Δ lus du registre. | Oui (sur le socle Lot 1). |
| **Lot 3** | **Triage** | write-back dev durci + export ; vue nav « gaps » ; états additionnels (hover). | Oui. |

Ce document n'engage que la **direction**. Le plan d'implémentation détaillé (tâches
bite-size, TDD) vit dans `docs/superpowers/plans/2026-05-30-compare-mode-lot1.md`
(Lot 1 d'abord ; Lots 2-3 planifiés une fois le socle livré).

## Invariants (non négociables)

1. **Aucune mesure de style côté navigateur** — l'oracle (Puppeteer) est seul juge ; l'iframe est visuelle.
2. **L'oracle ne détruit jamais le triage humain** — merge par `gapKey`, jamais d'écrasement.
3. **Zéro changement d'API npm** — toute la donnée référence est docs-local.
4. **Additif** — base Sent Tech intacte, per-thème uniquement.
5. **CDN pinés** — reproductibilité du registre.

## Hors-périmètre (v1)

- État `hover` (non forçable sans Puppeteer hover ciblé).
- Mesure live dans le navigateur.
- Branchement de tous les exemples docs arbitraires (on part des scénarios déjà
  couverts par `/compare`).
