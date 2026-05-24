# WP7 — Consolidation V2 (audit DS Sent Tech)

## Objectif

Fournir une source unique de décision pour WP7 (17 findings consolidés + pistes de correction) qui alimente directement WP7-B (construction ruleset maison) sans dépendre d’un format “brut” ou redondant.

## Inputs consolidés

- `docs/ds-audit-report.md` (base “legacy” v1, 17 findings)
- `docs/ds-audit-typography.md`
- `docs/ds-audit-color.md`
- `docs/ds-audit-spatial.md`
- `docs/ds-audit-motion.md`
- `docs/ds-audit-meta.md`
- `docs/known-issues-and-fixes.md`

## Synthèse consolidée (sans doublons)

### Priorité P0

1. **Hard-coded colors dans la vitrine docs (`#fff`, `#000`, hex dispersées)**
   - Portée principale : `apps/docs/src/app.css`
   - Impact : cassure contrat token + incohérence visuelle globale.

2. **Contraste/alignement chromatique incohérent sur fonds colorés**
   - Portée : `apps/docs/src/app.css` + pages docs composants.
   - Impact : texte “sec” visuel, marqueur visuel hors palette OKLCH.

3. **Monotonie des grilles de cartes sur la home**
   - Portée : `apps/docs/src/routes/+page.svelte`, `apps/docs/src/app.css`.
   - Impact : signal “pattern-only”, faible profondeur visuelle.

4. **Longueur de ligne trop élevée (~96 caractères en zone texte principale)**
   - Portée : `apps/docs/src/app.css` (`max-width`).
   - Impact : fatigue de lecture, hiérarchie affaiblie.

5. **`single-font` / `overused-font`**
   - Portée : `apps/docs/src/app.css`.
   - Impact : style figé, hiérarchie typographique insuffisante.

### Priorité P1

1. **Échelle typographique dense**
   - Trop de paliers non harmonisés.
2. **Taille de cible tactile sous 44px (desktop)**
   - Sidebar/buttons/lang buttons.
3. **`—` (em dash) en microcopy**
4. **Rail gauche + surface arrondie dans le même langage visuel**
5. **Tailles d’espace (padding/marge) bruitées**
6. **Motion de démonstration quasi absente**
7. **Cramped spacing sur certains blocs docs**

### Priorité P2

1. Demo dark-mode non prévue sur la vitrine docs.
2. Badge inline dans le H1 de certains blocs de démo (mélange titre/réglements visuels).
3. Labels mineurs sans coût informationnel (footer/github text).
4. Statut des docs sans légende explicite.
5. Absence de `prefers-reduced-motion`.

## Alignement avec `known-issues-and-fixes.md`

- Side-tab + rounded (Toast/Alert) confirmé ici et déjà inscrit en bug.
- `OverflowMenu` z-index trop bas : **non détecté** par le scan deterministic.
- Drawer/menu close conflict : **non détecté** par le scan deterministic.

## Sortie opérationnelle pour WP8-B (règles initiales)

### Priorité immédiate (8 règles)

1. `no-bare-hex`
2. `no-em-dash`
3. `line-length-cap`
4. `single-font`
5. `side-tab-on-rounded`
6. `touch-target-44`
7. `cramped-padding`
8. `motion-subtle` (préférence transitions utiles + reduced-motion-aware)

### Priorité secondaire (2–4 règles)

1. `padding-scale-token`
2. `rail-vs-radius-consistency` (règle maison Sent Tech)
3. `grid-variance`

## Décision de conduite

Cette consolidation devient la base de vérité:
- WP7-A/B/C/D/E rédigent et maintiennent les détails.
- WP7-F consomme ce fichier comme feuille de route pour priorisation WP7-B.
- Toute nouvelle règle WP8 est explicitement reliée à une entrée ci-dessus.
