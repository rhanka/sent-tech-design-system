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
| 1 | SSENSE | ssense | luxe e-comm · MTL HQ | ssense.com | noir/blanc ultra-minimal, Helvetica-like, carré | ✅ main b71c46b |
| 2 | Lightspeed | lightspeed | commerce SaaS · MTL HQ | lightspeedhq.com | rouge #e81c1c, pill+6px, ring noir | ✅ main 9688b3c |
| 3 | Desjardins | desjardins | finance coop · QC | desjardins.com | vert #00874e, focus bleu, Desjardins Sans | ✅ main 9688b3c |
| 4 | Banque Nationale | national-bank | banque · MTL HQ | bnc.ca / nbc.ca | rouge #e41c23, marine #00314d, Gilroy | ✅ main cb2b222 |
| 5 | Cirque du Soleil | cirque-du-soleil | spectacle · MTL HQ | cirquedusoleil.com | DARK, or #dca85d sur noir, Cds Sans | ✅ main cb2b222 |
| 6 | Ubisoft | ubisoft | jeu vidéo · MTL studio | ubisoft.com | DARK, bleu #006ef5 sur noir, Ubisoft Sans | ✅ main 73c2660 |
| 7 | Bombardier | bombardier | aéro · MTL HQ | bombardier.com | petrol-teal #003e51 + or, champs carrés | ✅ main 73c2660 |
| 8 | CAE | cae | simulation/aéro · MTL HQ | cae.com | navy #06103D + bleu #2969F2, Red Hat Display | ✅ main df62cf9 |
| 9 | SAQ | saq | détail (vin) · QC | saq.com | coral #fc4d30 + burgundy #7e003f, Maax | ✅ main df62cf9 |
| 10 | STM | stm | transport public · MTL | stm.info | bleu transit #009ee0 + greys | ✅ main df62cf9 |
| 11 | CGI | cgi | conseil TI · MTL HQ | cgi.com (web; Drive down) | VIOLET #5236ab + rouge #e41937, Source Sans Pro/Nunito | ✅ main df62cf9 |

## Extension (objectif max SLOC utile) — lot 7
| 12 | Nuvei | nuvei | fintech/paiements · MTL HQ | nuvei.com | indigo #160850 + cyan #0C98D4, Inter Tight | ✅ main aeda7f8 |
| 13 | Coveo | coveo | AI-search SaaS · QC | coveo.com | rouge #d2271b + bleu, police Gibson | ✅ main aeda7f8 |
| 14 | Circle K | circle-k | dépanneurs (Couche-Tard) · MTL HQ | circlek.com | rouge #DA291C + ink | ✅ main aeda7f8 |
| 15 | Aldo | aldo | mode/chaussures · MTL HQ | aldoshoes.com | noir + JAUNE #ffef71 signature | ✅ main aeda7f8 |

## Phase chrome (header+logo+boutons par marque) — DEMANDE UTILISATEUR
Pattern : `Chrome<Marque>.svelte` (calqué sur ChromeCanada) + logo officiel `static/chrome/<id>/` + câblage (import + useCustomChrome + branche rendu + header-contract test).
### ✅ ROLLOUT CHROME COMPLET — 15/15 chromes de marque
- lightspeed (bc6aea1) · desjardins+ssense+ubisoft (bcb1fcf) · cirque+cgi+national-bank (1e1c8b7) · bombardier+saq+nuvei+coveo (446d27b) · cae+stm+circle-k+aldo (2324b89).
- Tous : header + nav + sidebar + footer de la marque (calqués ChromeCanada) + **logo officiel** (Wikimedia / site officiel / wordmark typographique fidèle ; CAE = PNG officiel, aucun dessin à la main) + câblage useCustomChrome + branche + header-contract.test. svelte-check 0 erreur à chaque lot.
- Méthode rollout : agents solo/×3-4 (logo prefetch curl quand possible), ds-scrap câble en série. Le rate-limit tue les spawns ×3+ sous forte charge → fallback solo.
Remplaçant prêt si besoin : Mirego (mirego.com — noir/crème, font Almirego).

## ✅ RUN — 11 thèmes core live sur main (+ extension lot 7 en cours)
Pushes : ssense (b71c46b) · lightspeed+desjardins (9688b3c) · national-bank+cirque (cb2b222) · ubisoft+bombardier (73c2660) · cae+saq+cgi+stm (df62cf9). + mode démo Ctrl+Shift+X (toutes les sociétés privées cachées hors démo) + SOP `.ds-scrap/SOP-theme-clone.md` + skill CLI `ds-theme-clone`. Tous gate-verts, valeurs mesurées sur CSS live. Build prod docs (Pages) en cours de vérification.

Note CGI : identité moderne **violet-led** (#5236ab dominant 252×), rouge #e41937 en accent héritage. Drive jamais revenu → scrape web cgi.com (riche, suffisant).

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
