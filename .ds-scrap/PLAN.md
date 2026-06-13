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

## Les 10 thèmes (à remplir depuis WP3)
| Slot | Société | theme-id | Source scrape | État |
|------|---------|----------|---------------|------|
| 1 | — | — | — | todo |
| 2 | — | — | — | todo |
| 3 | — | — | — | todo |
| 4 | — | — | — | todo |
| 5 | — | — | — | todo |
| 6 | — | — | — | todo |
| 7 | — | — | — | todo |
| 8 | — | — | — | todo |
| 9 | — | — | — | todo |
| 10 | — | — | — | todo |

## Journal
- 21:11Z ds-scrap en ligne, conductor notifié, 3 agents recon lancés (docs map / SOP / short-list).
