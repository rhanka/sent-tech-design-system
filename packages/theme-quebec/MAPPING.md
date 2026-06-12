# Gouvernement du Québec (SDG) → Sentropic mapping

Ce package mappe les tokens **publics** du [Système de design gouvernemental (SDG)](https://design.quebec.ca/)
sur la structure de tokens Sentropic (`TenantTheme`). Seuls les tokens open source (`--qc-*`) et
les *noms* de police (Open Sans) sont référencés — aucun binaire de police. Le code source SDG est
distribué sous licence MIT par le projet [Quebecca/qc_trousse_sdg](https://github.com/Quebecca/qc_trousse_sdg).

## Sources

- Système de design gouvernemental (SDG) — https://design.quebec.ca/
- Tokens publics couleur — `public/css/qc-sdg-design-tokens.css` (repo Quebecca)
- Typographie — `src/sdg/bases/typography/_fonts.scss` (Open Sans 400/500/600/700)
- Thème sombre (hors scope lot minimal, voir QC-DARK) — `src/sdg/_dark-theme.js`

## Palette couleur — mapping Sentropic

| Rôle Sentropic | Token SDG | Valeur hex |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` | `--qc-color-blue-piv` | `#095797` |
| `action.primaryHover` | `--qc-color-blue-medium` | `#19406C` |
| `surface.inverse` (bandeau foncé) | `--qc-color-blue-dark` | `#223654` |
| `focus.color` | `--qc-color-blue-regular` | `#1472bf` |
| accent `cyan.50` (lien visité) | `--qc-color-purple` | `#6b4fa1` |
| `blue.10` / `buttonSecondary.hoverBackground` | `--qc-color-blue-pale` | `#dae6f0` |
| `text.primary` | (à confirmer `--qc-color-text-primary`) | `#1c2025` |
| `text.secondary` | `--qc-color-grey-medium` | `#6b778a` |
| `text.muted` / `border.strong` | `--qc-color-grey-regular` | `#8893a2` |
| `surface.subtle` / `action.secondary` | `--qc-color-grey-pale` | `#f1f1f2` |
| `surface.default` / `surface.raised` | (blanc) | `#ffffff` |
| `border.subtle` | `--qc-color-grey-light` | `#c5cad2` |
| `action.danger` / `feedback.error` | `--qc-color-red-regular` | `#cb381f` |
| `feedback.success` | `--qc-color-green-regular` | `#4f813d` |
| accent décoratif (`accent`) | `--qc-color-pink-regular` | `#e58271` |
| `feedback.warning` | `--qc-color-yellow-regular` assombri (AA/blanc) | `#ad781c` |
| `feedback.info` | `--qc-color-blue-piv` | `#095797` |

### « À confirmer » (pas de token SDG direct)

- `#1c2025` pour le texte primaire — valeur attendue de `--qc-color-text-primary` (thème clair) ; à vérifier
  contre la variable réelle une fois la feuille de style complète parsée.
- `#ad781c` pour `feedback.warning` — `--qc-color-yellow-regular` (`#e0ad03`) assombri manuellement pour
  atteindre WCAG AA (4.5:1) sur fond blanc.
- La palette catégorielle `data.category1..8` est une **proposition cohérente** depuis les teintes SDG ;
  non publiée officiellement par le SDG comme échelle de dataviz.
- `shadow.*` et `motion.*` — le SDG ne publie pas ces valeurs explicitement ; conservés alignés
  sur la base Sentropic.

## Typographie

- **Tous les rôles** (`font.sans`, `font.display`, `typography.control`, `typography.field`, `typography.label`) :
  `'Open Sans', system-ui, sans-serif` — le SDG utilise Open Sans pour les titres **et** le corps de texte,
  sans police d'affichage distincte.
- **Monospace** (`font.mono`) : fallback système uniquement (`SFMono-Regular, Consolas, Liberation Mono, Courier New`).

## Signatures anatomiques

- **Champs** : `field.style = "outline"` — inputs en mode bordure (fond blanc, bordure 1px gris `#8893a2`,
  rayon 4px), comme dans le SDG. Pas de filled-underline.
- **Rayon** : 4px sur les contrôles et cartes (`radius.sm/md/lg = 0.25rem`) ; pills `999px`.
- **Focus** : outline épais 3px offset 1px dans le bleu régulier `#1472bf` (`--qc-color-blue-regular`).
- **Boutons** : primaire = fond bleu PIV `#095797` ; secondaire = outlined bleu PIV, hover pale-bleu `#dae6f0`.
- **Tabs / nav** : onglet actif = label gras bleu PIV + soulignement bas (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination** : liens bleu PIV sans bordure ; page active = fond bleu PIV, texte blanc.
- **Chevron select** : SVG redessiné en `#095797` (bleu PIV SDG).
- **Densité** : contrôles SDG touch-friendly (md ≈ 44px hauteur) avec padding horizontal généreux.

## Asset officiel

- Signature SVG : `public/img/QUEBEC_couleur.svg` (repo Quebecca/qc_trousse_sdg) — à placer dans
  `apps/docs/static/chrome/quebec/signature.svg` (lot QC-CHROME).
- Version blanche pour le footer : à extraire/dériver depuis l'asset officiel (ne pas redessiner).
