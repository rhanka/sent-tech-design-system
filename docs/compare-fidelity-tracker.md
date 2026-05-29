# Tracker — fermeture des écarts de fidélité (objectif : 0 écart net)

Source de vérité chiffrée : `docs/compare-fidelity-report.md` (régénéré par `tools/compare/fidelity.mjs`).
Ce tracker = stratégie de fermeture + statut par **famille** d'écarts. Mis à jour à chaque itération du loop.

> Départ : **74,8 %** (109 ≠) → 1ère passe **84,0 %** (69 ≠) → passe F1+F2 **87,3 %** (55 ≠) → passe F3+F4+F6 (boîte-champ DSFR) **89,4 %** (46 ≠). **Cible : 100 % de fermeture**
> (tout écart restant doit être soit fermé, soit un escape PROUVÉ irréductible et justifié ici).

Statut : ⬜ ouvert · 🟦 en cours · ✅ fermé · 🛡️ escape justifié (irréductible, accepté).

| # | Famille d'écart | Composants touchés | Stratégie de fermeture | Statut |
|---|---|---|---|---|
| F1 | **Largeur de boîte** (artefact de mise en page) | champs + Card | ✅ Banc apples-to-apples : iframe réf à largeur fixe (348px → zone de contenu **320px** identique des deux côtés) + champs (Input/Textarea/Select) à `width:320px` + carte rendue dans le même contexte 18rem que la réf. **box width** des 3 champs et de la carte désormais `=`. Résidu : box-width `≠` ne subsiste que sur 3 composants **à largeur intrinsèque** (dsfr/Button Δ2px metrics Marianne, carbon/Button Δ-46px et dsfr/Tabs Δ-24,5px = **padding** → F7/F9, pas F1). Box-**height** résiduelles = line-height (F5) / padding (F7/F9), pas l'artefact de largeur. | ✅ |
| F2 | **Police de marque** vs system-ui (≈7) | Button/Tabs DSFR, Button/Input/Textarea/Select/Tabs Carbon | ✅ Polices chargées RÉELLEMENT des deux côtés : **Marianne** (DSFR) via `@font-face` CDN absolus (sans injecter le reset global dsfr.min.css) + utilitaire DSFR dans l'iframe ; **IBM Plex Sans** (Carbon) via Google Fonts ; `font-family` de marque forcée sur le `<body>` de l'iframe + `font-family: var(--st-font-sans)` sur le scope (Link/Card héritent). **14/14 `font-family` désormais `=`, 0 `≠`.** | ✅ |
| F3 | **Rayon haut 4px champs DSFR** (6) | Input/Textarea/Select | ✅ Extension additive **anatomie v1.3.0** : `field.radiusTop` (Css-ready, défaut = `shape.radius` → base inchangée) résolu dans `fieldOf`, émis par `createComponent` pour TOUS les thèmes (anti-var-fantôme), consommé en `border-top-left/right-radius` (bas = `shape.radius`). DSFR pose 4px haut / 0 bas. **radius topLeft/topRight des 3 champs DSFR désormais `=`.** | ✅ |
| F4 | **Filet bas DSFR : bordure vs none** (4) | Input/Textarea/Select/~~Tabs~~ | ✅ (champs) DSFR (`field.underlineMode: "shadow"`) rend son filet bas via **`box-shadow: inset 0 -1px 0 0 #3a3a3a`** ; `border-bottom: none`. Composé avec le focus (outline DSFR) sans perdre le soulignement de repos. Carbon GARDE son vrai `border-bottom` (sa vraie technique → 100 % préservé). **`border-bottom style` des 3 champs DSFR = `=` (none vs none).** Le filet de l'onglet DSFR reste dans le lot Tabs (F7/F8). | ✅ |
| F5 | **line-height non posé** (≈7) | Select/Link/Card DSFR + Select/Link/Card/Input/Tabs Carbon | Poser la line-height d'anatomie là où le composant ne la consomme pas ; investiguer `<select>` (UA). | ⬜ |
| F6 | **Couleur de texte** nuances (≈4) | Input/Textarea/Select/Card DSFR (#161616 vs #3a3a3a) | ✅ `semantic.text.primary` = grey-200 `#3a3a3a` (`--text-default-grey`), contraste ~8:1 sur fond `#eee` (AA+). **`color` des 3 champs DSFR = `=` (rgb(58,58,58) des deux côtés)**, re-mesuré. (Le résidu Card est piloté par F5 line-height, hors F6.) | ✅ |
| F7 | **Onglet actif DSFR** (≈5) | Tabs | poids 700, fond blanc, couleur Bleu France, padding 16px : aligner l'anatomie Tabs DSFR. | ⬜ |
| F8 | **Onglet actif Carbon** (≈4) | Tabs | couleur/bordure/padding — aligner sur le markup Carbon v11 (sélecteur + indicateur). | ⬜ |
| F9 | **Résidus padding** (≈3) | Button DSFR (block 8px), Select padding-droit | densité par rôle/thème (gabarit chevron Select). | ⬜ |

## Détections dans le moteur `design-system-skills`
- ✅ **Détection de fidélité par bord exposée dans la skill** (capacité issue de
  `tools/compare/fidelity.mjs`) : nouvelle commande `fidelity` de la skill
  multi-harness `sent-tech-design` via le wrapper portable
  `tools/skills/sent-tech-skills/scripts/fidelity.mjs` (résout le repo via
  `SENT_TECH_DS_ROOT`, lance la comparaison bord par bord vs DSFR/Carbon
  officiels, écrit `docs/compare-fidelity-report.md` + `tools/compare/last-report.json`).
  Propagé aux 4 copies installées (Claude / Gemini / Codex / plugin agy).
  `SKILL.md` documente les deux commandes (`audit` lint statique, `fidelity`
  comparaison par bord) + `allowed-tools`.
- ✅ **Règle statique source-level bonus** : `underline-hardcoded-border` ajoutée
  au moteur `@sentropic/design-system-skills` — signale un champ dessinant son
  filet bas via un `border-bottom` en dur au lieu d'un `box-shadow inset`
  (anti-pattern révélé par la famille d'écart F4). Couverte par un test
  positif + négatif (26 tests verts).

## Publication (pré-autorisée, conditionnelle)
- ⬜ Quand **toutes** les familles ci-dessus sont ✅/🛡️ et `verify` vert : bump patch cohérent
  (tokens/themes/svelte **0.10.1**, theme-dsfr/carbon **0.2.1**), tags `v0.10.1` + `themes-v0.2.1`,
  publication OIDC, confirmation `npm view`. *(Auto-publish autorisé par l'utilisateur pour cette nuit.)*
