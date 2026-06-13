# ds-scrap — Enrichissement des thèmes (run autonome 3h)

Agent: **ds-scrap** (`claude:sent-tech-design-system:91c9a3c8686d`)
Conductor: `claude:sent-tech-design-system:ce9271edbcd8` (claude:design-system, pane %3)
Démarré: 2026-06-13 ~21:11Z · Cible: 10 thèmes de sociétés montréalaises, build→QA→PR→merge, en boucle.

## Décisions verrouillées
- **Modèle build**: Opus 4.8 fast pour les agents de thème (fidélité hex/px). Sonnet 4.6 réservé au boilerplate mécanique.
- **Anonymisation**: mode démo (Ctrl+Shift+X) cache les clones de **sociétés privées** (Carbon/IBM, Airbus + les 10 nouvelles). Restent visibles: gouvernementaux (DSFR, Canada, Québec) + tenants propres (sent-tech, forge, entropic). [à confirmer si gouvernementaux à cacher aussi]
- **Pas de publish npm** — modules préparés publish-ready uniquement.
- **Gate** = suite de tests COMPLÈTE du package (inclut tests transverses type hex-lint), pas que le composant touché.

## Workpackages (parallélisables)
| # | Finalité | Workpackage | État |
|---|----------|-------------|------|
| WP1 | Protéger le site public | Mode démo Ctrl+Shift+X (liste locale docs, 0 modif package) | implémenté, typecheck en cours |
| WP2 | Industrialiser le scrap | SOP `.ds-scrap/SOP-theme-clone.md` (+ skill CLI à figer) | SOP ✅ |
| WP3 | Cibler | Short-list 10 sociétés MTL + CGI (Drive) | relancé (2 agents) |
| WP4 | Produire | Build thèmes (lots ≤4 agents bg) — package SEUL, registration en série par ds-scrap | en attente WP3 |
| WP5 | Livrer | commit + push main par thème, boucle jusqu'à 10/10 | en attente WP4 |

### Décision technique (post-incident airbus)
Le flag `thirdParty` sur `TenantTheme` casse le build des consommateurs épinglés (`@sentropic/...@0.11.0` → typecheck vs version publiée, pas la source locale). **Abandonné.** Mode démo = liste locale `HIDDEN_THEME_IDS` dans `apps/docs/.../+layout.svelte` uniquement. Aucun package thème n'est modifié. Les agents de build ne touchent QUE leur dossier `packages/theme-<id>/` ; ds-scrap fait l'enregistrement docs en série.

## Les 10 thèmes (short-list ds-scrap, classés par confiance de build)
CGI = 11e en parallèle (scrape Drive). Hex = directionnel ; le build agent MESURE l'exact sur le CSS live.
| # | Société | theme-id | Secteur · MTL | Source scrape | Signature | État |
|---|---------|----------|----------------|---------------|-----------|------|
| 1 | SSENSE | ssense | luxe e-comm · MTL HQ | ssense.com | noir/blanc ultra-minimal, Helvetica-like, carré | todo |
| 2 | Lightspeed | lightspeed | commerce SaaS · MTL HQ | lightspeedhq.com | rouge vif, moderne, arrondi léger | todo |
| 3 | Desjardins | desjardins | finance coop · QC | desjardins.com | vert iconique ~#00874E | todo |
| 4 | Banque Nationale | national-bank | banque · MTL HQ | bnc.ca / nbc.ca | rouge corporate | todo |
| 5 | Cirque du Soleil | cirque-du-soleil | spectacle · MTL HQ | cirquedusoleil.com | noir + jaune soleil, théâtral | todo |
| 6 | Ubisoft | ubisoft | jeu vidéo · MTL studio | ubisoft.com | noir/blanc minimal, le swirl | todo |
| 7 | Bombardier | bombardier | aéro · MTL HQ | bombardier.com | bleu marine | todo |
| 8 | CAE | cae | simulation/aéro · MTL HQ | cae.com | bleu | todo |
| 9 | SAQ | saq | détail (vin) · QC | saq.com | bordeaux/raisin | todo |
| 10 | STM | stm | transport public · MTL | stm.info | bleu transit #009EE0 + vert | todo |
| 11 | CGI | cgi | conseil TI · MTL HQ | Drive + cgi.com | rouge CGI | scrape en cours |

Remplaçants si une source est faible : Nuvei (nuvei.com), Coveo (coveo.com), Aldo (aldoshoes.com), Moment Factory (momentfactory.com), Couche-Tard/Circle K (circlek.com).

## Recette d'enregistrement docs (étape SÉRIE faite par ds-scrap, par thème `<id>`)
1. `apps/docs/src/routes/+layout.svelte` : `import { <id>Theme } from "@sentropic/design-system-theme-<id>";` + ajout à `const THEMES` + ajout `"<id>"` à `HIDDEN_THEME_IDS` (société privée → cachée par défaut).
2. `apps/docs/src/lib/header-contract.test.ts:93` : mettre à jour le littéral exact `const THEMES: TenantTheme[] = [...]`.
3. `apps/docs/src/lib/url-state.ts` : ajouter `"<id>"` au type union `ThemeId` ET au tableau `VALID_THEME_IDS`.
4. `apps/docs/package.json` : dep `"@sentropic/design-system-theme-<id>":"0.1.0"` + append `&& npm --workspace packages/theme-<id> run build` aux scripts `predev` ET `prebuild`.
5. `npm install` (bump lockfile). Pas de chrome custom (chemin rapide).
Gate docs après chaque lot : `npm --workspace apps/docs run check` (0 erreur) puis build.

## Journal
- 21:11Z ds-scrap en ligne, conductor notifié, 3 agents recon lancés (docs map / SOP / short-list).
- 21:1x WP1 mode démo implémenté (liste locale), svelte-check 0 erreur, commité (0a08c62). SOP + skill `ds-theme-clone` écrits.
- ~22:0xZ session limit a tué les 2 recon (CGI+shortlist) → relancés une fois quotas revenus. Build docs prod lancé comme gate avant push main.
