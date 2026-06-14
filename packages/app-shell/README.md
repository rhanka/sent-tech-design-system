# `@sentropic/app-shell` — `<sentropic-app-shell>` (Web Component)

App-shell **unique** porté par le DS, consommé à l'identique par tous les sites (docs, dataviz,
geo, sentropic, cv, nc, sent-tech.ca, graphify, annotation…), **stable au changement de thème**
et **pixel-perfect par construction** (une seule implémentation).

> **Statut : INCUBATION** (`"private": true`, **aucun script** `build`/`test`/`check` → sauté par
> le `verify` partagé, donc zéro risque pour les publishes des autres packages ; non publié npm).
> JS pur (pas de build). `demo/index.html` se sert en HTTP local pour les vérifs visuelles.

## Décision d'architecture (consensus 2× Opus 4.8)

Cible = **un seul Web Component `<sentropic-app-shell>` (Shadow DOM, CSS encapsulé) + wrappers
fins par framework** (svelte/react/vue, zéro markup/CSS) ; HTML simple consomme le custom element nu.
Rejeté : composant-par-framework comme solution principale (= triple maintenance = la dérive
actuelle), module federation et edge-include (violent « shippable indépendamment » + « multi-réseau »).

## Go/no-go (ce prototype)

`index.html` déclare des tokens `--st-*` au `:root` de l'hôte (2 thèmes), monte le shell, et place
un élément `z-index: 9999` sous le header. Vérifié en headless :

| Test | Verdict |
|---|---|
| Les tokens `--st-*` de l'hôte **percolent** dans le Shadow DOM et **recolorent** (sent-tech ⇄ carbon) | **GO** |
| **Structure invariante** au changement de thème (hauteur barre + positions identiques) | **GO** |
| La palette de recherche en `popover` (**top layer**) passe **au-dessus** d'un `z-index: 9999` ET franchit la frontière shadow | **GO** |

⟹ **Shadow DOM viable. On part WC-first avec encapsulation.** Le SSR (Declarative Shadow DOM ou
mount client) reste à traiter à l'implémentation, mais ne remet pas en cause le choix.

## Reste à concevoir (implémentation, pas ce prototype)

- `siteConfig` déclaratif (marque, nav, recherche, thèmes, langue, framework-switcher, identité) + « token contract ».
- Wrappers fins `@sentropic/app-shell-{svelte,react,vue}`.
- Bascule **A/B réversible** chez chaque consommateur (ancien chrome ⇄ shell) — migration sans casser les DS déjà mappés.
- 1er consommateur de référence : le site docs (ses chromes par thème → 1 shell + N configs).
