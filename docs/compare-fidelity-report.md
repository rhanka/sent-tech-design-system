# Rapport de fidélité — pixel-perfect par bord

Comparaison **bord par bord** de NOS composants mappés vs les **vrais composants officiels** DSFR / Carbon.
Toutes les valeurs proviennent des **styles calculés réels** (computed styles) ; aucune n'est inventée.

| Champ | Valeur |
|---|---|
| Date | 2026-05-28 |
| Navigateur | Google Chrome système (`/usr/bin/google-chrome`) via puppeteer-core, headless |
| URL mesurée | http://localhost:4322/compare (build statique servi) |
| Tolérance longueur | ±1px → statut `~` |
| Tolérance couleur | distance RGB ≤ 12 → statut `~` |
| Statuts | `=` identique · `~` proche (tolérance) · `≠` écart net |
| Diff | NOS valeurs vs RÉFÉRENCE officielle ; fidélité = % de `=` + `~` |

## Thème : dsfr

### Button

- Notre sélecteur : `.cmp-scope--dsfr .st-button`
- Référence : iframe `.cmp-cell--ref` → `.fr-btn`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 1px | 0px | ~ Δ1.0px |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgba(0, 0, 0, 0) | rgb(245, 245, 254) | = (bord 0px (invisible)) |
| border-right width | 1px | 0px | ~ Δ1.0px |
| border-right style | solid | none | = (bord 0px (invisible)) |
| border-right color | rgba(0, 0, 0, 0) | rgb(245, 245, 254) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgba(0, 0, 0, 0) | rgb(245, 245, 254) | = (bord 0px (invisible)) |
| border-left width | 1px | 0px | ~ Δ1.0px |
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgba(0, 0, 0, 0) | rgb(245, 245, 254) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 8px | ≠ Δ-8.0px |
| padding-right | 16px | 16px | = |
| padding-bottom | 0px | 8px | ≠ Δ-8.0px |
| padding-left | 16px | 16px | = |
| box width | 97.3px | 95.8px | ≠ Δ1.5px |
| box height | 40px | 40px | = |
| font-family | Marianne | system-ui | ≠ Marianne vs system-ui |
| font-size | 16px | 16px | = |
| font-weight | 500 | 500 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(0, 0, 145) | rgb(0, 0, 145) | = |
| color | rgb(255, 255, 255) | rgb(245, 245, 254) | ≠ rgb(255,255,255) vs rgb(245,245,254) |

**Fidélité Button (dsfr) : 83.9%** — 22 `=`, 4 `~`, 5 `≠` sur 31 propriétés.

### Input

- Notre sélecteur : `.cmp-scope--dsfr .st-control`
- Référence : iframe `.cmp-cell--ref` → `.fr-input`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 4px | ≠ Δ-4.0px |
| radius topRight | 0px | 4px | ≠ Δ-4.0px |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 8px | ≠ Δ-8.0px |
| padding-right | 12px | 16px | ≠ Δ-4.0px |
| padding-bottom | 0px | 8px | ≠ Δ-8.0px |
| padding-left | 12px | 16px | ≠ Δ-4.0px |
| box width | 218px | 329px | ≠ Δ-111.0px |
| box height | 40px | 40px | = |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(22, 22, 22) | rgb(58, 58, 58) | ≠ rgb(22,22,22) vs rgb(58,58,58) |

**Fidélité Input (dsfr) : 71%** — 21 `=`, 1 `~`, 9 `≠` sur 31 propriétés.

### Textarea

- Notre sélecteur : `.cmp-scope--dsfr .st-textarea`
- Référence : iframe `.cmp-cell--ref` → `textarea.fr-input`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 4px | ≠ Δ-4.0px |
| radius topRight | 0px | 4px | ≠ Δ-4.0px |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 10px | 8px | ≠ Δ2.0px |
| padding-right | 12px | 16px | ≠ Δ-4.0px |
| padding-bottom | 10px | 8px | ≠ Δ2.0px |
| padding-left | 12px | 16px | ≠ Δ-4.0px |
| box width | 219px | 329px | ≠ Δ-110.0px |
| box height | 96px | 88px | ≠ Δ8.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(22, 22, 22) | rgb(58, 58, 58) | ≠ rgb(22,22,22) vs rgb(58,58,58) |

**Fidélité Textarea (dsfr) : 67.7%** — 20 `=`, 1 `~`, 10 `≠` sur 31 propriétés.

### Select

- Notre sélecteur : `.cmp-scope--dsfr .st-select`
- Référence : iframe `.cmp-cell--ref` → `.fr-select`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 4px | ≠ Δ-4.0px |
| radius topRight | 0px | 4px | ≠ Δ-4.0px |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 8px | ≠ Δ-8.0px |
| padding-right | 32px | 40px | ≠ Δ-8.0px |
| padding-bottom | 0px | 8px | ≠ Δ-8.0px |
| padding-left | 12px | 16px | ≠ Δ-4.0px |
| box width | 164px | 329px | ≠ Δ-165.0px |
| box height | 40px | 40px | = |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(22, 22, 22) | rgb(58, 58, 58) | ≠ rgb(22,22,22) vs rgb(58,58,58) |

**Fidélité Select (dsfr) : 67.7%** — 20 `=`, 1 `~`, 10 `≠` sur 31 propriétés.

### Link

- Notre sélecteur : `.cmp-scope--dsfr .st-link`
- Référence : iframe `.cmp-cell--ref` → `.fr-link`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(0, 0, 145) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(0, 0, 145) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(0, 0, 145) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(0, 0, 145) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 76.8px | 76.8px | = |
| box height | 22px | 22px | = |
| font-family | system-ui | system-ui | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | underline | none | ≠ underline vs none |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(0, 0, 145) | rgb(0, 0, 145) | = |

**Fidélité Link (dsfr) : 93.5%** — 29 `=`, 0 `~`, 2 `≠` sur 31 propriétés.

### Card

- Notre sélecteur : `.cmp-scope--dsfr .st-card`
- Référence : iframe `.cmp-cell--ref` → `.fr-card`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 1px | 0px | ~ Δ1.0px |
| border-top style | solid | none | ≠ solid vs none |
| border-top color | rgb(238, 238, 238) | rgb(58, 58, 58) | ≠ rgb(238,238,238) vs rgb(58,58,58) |
| border-right width | 1px | 0px | ~ Δ1.0px |
| border-right style | solid | none | ≠ solid vs none |
| border-right color | rgb(238, 238, 238) | rgb(58, 58, 58) | ≠ rgb(238,238,238) vs rgb(58,58,58) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(238, 238, 238) | rgb(58, 58, 58) | ≠ rgb(238,238,238) vs rgb(58,58,58) |
| border-left width | 1px | 0px | ~ Δ1.0px |
| border-left style | solid | none | ≠ solid vs none |
| border-left color | rgb(238, 238, 238) | rgb(58, 58, 58) | ≠ rgb(238,238,238) vs rgb(58,58,58) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 16px | 1px | ≠ Δ15.0px |
| padding-right | 16px | 1px | ≠ Δ15.0px |
| padding-bottom | 16px | 1px | ≠ Δ15.0px |
| padding-left | 16px | 1px | ≠ Δ15.0px |
| box width | 185.1px | 288px | ≠ Δ-102.9px |
| box height | 82.4px | 106px | ≠ Δ-23.6px |
| font-family | system-ui | system-ui | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |
| color | rgb(22, 22, 22) | rgb(58, 58, 58) | ≠ rgb(22,22,22) vs rgb(58,58,58) |

**Fidélité Card (dsfr) : 48.4%** — 11 `=`, 4 `~`, 16 `≠` sur 31 propriétés.

### Tabs

- Notre sélecteur : `.cmp-scope--dsfr .st-tabs__tab[aria-selected="true"]`
- Référence : iframe `.cmp-cell--ref` → `.fr-tabs__tab[aria-selected="true"]`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(0, 0, 145) | rgb(0, 0, 145) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 12px | 8px | ≠ Δ4.0px |
| padding-right | 4px | 16px | ≠ Δ-12.0px |
| padding-bottom | 12px | 8px | ≠ Δ4.0px |
| padding-left | 4px | 16px | ≠ Δ-12.0px |
| box width | 45.9px | 69.3px | ≠ Δ-23.4px |
| box height | 49px | 40px | ≠ Δ9.0px |
| font-family | Marianne | system-ui | ≠ Marianne vs system-ui |
| font-size | 16px | 16px | = |
| font-weight | 500 | 700 | ≠ 500 vs 700 |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | ≠ rgb(0,0,0)/a0 vs rgb(255,255,255) |
| color | rgb(22, 22, 22) | rgb(0, 0, 145) | ≠ rgb(22,22,22) vs rgb(0,0,145) |

**Fidélité Tabs (dsfr) : 64.5%** — 19 `=`, 1 `~`, 11 `≠` sur 31 propriétés.

## Thème : carbon

### Button

- Notre sélecteur : `.cmp-scope--carbon .st-button`
- Référence : iframe `.cmp-cell--ref` → `.bx--btn--primary`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 1px | 1px | = |
| border-top style | solid | solid | = (bord 0px (invisible)) |
| border-top color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = (bord 0px (invisible)) |
| border-right width | 1px | 1px | = |
| border-right style | solid | solid | = (bord 0px (invisible)) |
| border-right color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 1px | = |
| border-bottom style | solid | solid | = (bord 0px (invisible)) |
| border-bottom color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = (bord 0px (invisible)) |
| border-left width | 1px | 1px | = |
| border-left style | solid | solid | = (bord 0px (invisible)) |
| border-left color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 11px | ≠ Δ-11.0px |
| padding-right | 16px | 63px | ≠ Δ-47.0px |
| padding-bottom | 0px | 11px | ≠ Δ-11.0px |
| padding-left | 16px | 15px | ~ Δ1.0px |
| box width | 86.9px | 132.9px | ≠ Δ-46.0px |
| box height | 40px | 48px | ≠ Δ-8.0px |
| font-family | IBM Plex Sans | system-ui | ≠ IBM Plex Sans vs system-ui |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 18.06px | 18.0001px | ~ Δ0.1px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(15, 98, 254) | rgb(15, 98, 254) | = |
| color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |

**Fidélité Button (carbon) : 80.6%** — 23 `=`, 2 `~`, 6 `≠` sur 31 propriétés.

### Input

- Notre sélecteur : `.cmp-scope--carbon .st-control`
- Référence : iframe `.cmp-cell--ref` → `.bx--text-input`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 1px | = |
| border-bottom style | solid | solid | = |
| border-bottom color | rgb(141, 141, 141) | rgb(141, 141, 141) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 16px | 16px | = |
| box width | 234px | 329px | ≠ Δ-95.0px |
| box height | 40px | 40px | = |
| font-family | IBM Plex Sans | system-ui | ≠ IBM Plex Sans vs system-ui |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 20.02px | 18.0001px | ≠ Δ2.0px |
| letter-spacing | normal | 0.16px | ≠ normal vs 0.16px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(244, 244, 244) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Input (carbon) : 87.1%** — 27 `=`, 0 `~`, 4 `≠` sur 31 propriétés.

### Textarea

- Notre sélecteur : `.cmp-scope--carbon .st-textarea`
- Référence : iframe `.cmp-cell--ref` → `.bx--text-area`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 1px | = |
| border-bottom style | solid | solid | = |
| border-bottom color | rgb(141, 141, 141) | rgb(141, 141, 141) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 10px | 11px | ~ Δ1.0px |
| padding-right | 16px | 16px | = |
| padding-bottom | 10px | 11px | ~ Δ1.0px |
| padding-left | 16px | 16px | = |
| box width | 209px | 329px | ≠ Δ-120.0px |
| box height | 96px | 83px | ≠ Δ13.0px |
| font-family | IBM Plex Sans | system-ui | ≠ IBM Plex Sans vs system-ui |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 20.02px | 20px | ~ Δ0.0px |
| letter-spacing | normal | 0.16px | ≠ normal vs 0.16px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(244, 244, 244) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Textarea (carbon) : 87.1%** — 24 `=`, 3 `~`, 4 `≠` sur 31 propriétés.

### Select

- Notre sélecteur : `.cmp-scope--carbon .st-select`
- Référence : iframe `.cmp-cell--ref` → `.bx--select-input`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 1px | = |
| border-bottom style | solid | solid | = |
| border-bottom color | rgb(141, 141, 141) | rgb(141, 141, 141) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 32px | 48px | ≠ Δ-16.0px |
| padding-bottom | 0px | 0px | = |
| padding-left | 12px | 16px | ≠ Δ-4.0px |
| box width | 103px | 329px | ≠ Δ-226.0px |
| box height | 40px | 40px | = |
| font-family | IBM Plex Sans | system-ui | ≠ IBM Plex Sans vs system-ui |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 18.0001px | ≠ normal vs 18.0001px |
| letter-spacing | normal | 0.16px | ≠ normal vs 0.16px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(244, 244, 244) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Select (carbon) : 80.6%** — 25 `=`, 0 `~`, 6 `≠` sur 31 propriétés.

### Link

- Notre sélecteur : `.cmp-scope--carbon .st-link`
- Référence : iframe `.cmp-cell--ref` → `.bx--link`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(15, 98, 254) | rgb(15, 98, 254) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(15, 98, 254) | rgb(15, 98, 254) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(15, 98, 254) | rgb(15, 98, 254) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(15, 98, 254) | rgb(15, 98, 254) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 73.3px | 65.9px | ≠ Δ7.4px |
| box height | 22px | 18px | ≠ Δ4.0px |
| font-family | system-ui | system-ui | = |
| font-size | 16px | 14px | ≠ Δ2.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 18.0001px | ≠ normal vs 18.0001px |
| letter-spacing | normal | 0.16px | ≠ normal vs 0.16px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(15, 98, 254) | rgb(15, 98, 254) | = |

**Fidélité Link (carbon) : 83.9%** — 26 `=`, 0 `~`, 5 `≠` sur 31 propriétés.

### Card

- Notre sélecteur : `.cmp-scope--carbon .st-card`
- Référence : iframe `.cmp-cell--ref` → `.bx--tile`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 1px | 0px | ~ Δ1.0px |
| border-top style | solid | none | ≠ solid vs none |
| border-top color | rgb(224, 224, 224) | rgb(22, 22, 22) | ≠ rgb(224,224,224) vs rgb(22,22,22) |
| border-right width | 1px | 0px | ~ Δ1.0px |
| border-right style | solid | none | ≠ solid vs none |
| border-right color | rgb(224, 224, 224) | rgb(22, 22, 22) | ≠ rgb(224,224,224) vs rgb(22,22,22) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(224, 224, 224) | rgb(22, 22, 22) | ≠ rgb(224,224,224) vs rgb(22,22,22) |
| border-left width | 1px | 0px | ~ Δ1.0px |
| border-left style | solid | none | ≠ solid vs none |
| border-left color | rgb(224, 224, 224) | rgb(22, 22, 22) | ≠ rgb(224,224,224) vs rgb(22,22,22) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 16px | 16px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 16px | 16px | = |
| padding-left | 16px | 16px | = |
| box width | 177.1px | 288px | ≠ Δ-110.9px |
| box height | 82.4px | 100px | ≠ Δ-17.6px |
| font-family | system-ui | system-ui | = |
| font-size | 16px | 14px | ≠ Δ2.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 14px | ≠ normal vs 14px |
| letter-spacing | normal | 0.16px | ≠ normal vs 0.16px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(255, 255, 255) | rgb(244, 244, 244) | ≠ rgb(255,255,255) vs rgb(244,244,244) |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Card (carbon) : 54.8%** — 13 `=`, 4 `~`, 14 `≠` sur 31 propriétés.

### Tabs

- Notre sélecteur : `.cmp-scope--carbon .st-tabs__tab[aria-selected="true"]`
- Référence : iframe `.cmp-cell--ref` → `.bx--tabs__nav-item--selected .bx--tabs__nav-link`
- ⚠ Spec selector `.bx--tabs__nav-item--selected` is the `<li>` wrapper (0×0 box). Measuring its inner `.bx--tabs__nav-link` — the actual styled tab.
- ⚠ reference element is styled (CDN loaded) but its own box collapsed to 0; box width/height excluded from the diff

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 1px | = |
| border-bottom style | solid | solid | = |
| border-bottom color | rgb(15, 98, 254) | rgb(224, 224, 224) | ≠ rgb(15,98,254) vs rgb(224,224,224) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 12px | 12px | = |
| padding-right | 4px | 0px | ≠ Δ4.0px |
| padding-bottom | 12px | 12px | = |
| padding-left | 4px | 0px | ≠ Δ4.0px |
| font-family | IBM Plex Sans | system-ui | ≠ IBM Plex Sans vs system-ui |
| font-size | 16px | 14px | ≠ Δ2.0px |
| font-weight | 400 | 400 | = |
| line-height | 20.64px | 16px | ≠ Δ4.6px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(82, 82, 82) | ≠ rgb(22,22,22) vs rgb(82,82,82) |

**Fidélité Tabs (carbon) : 75.9%** — 22 `=`, 0 `~`, 7 `≠` sur 29 propriétés.

## Récapitulatif global

- **Fidélité globale : 74.8%** (302 `=`, 21 `~`, 109 `≠` sur 432 propriétés mesurées).
- **Écarts nets restants : 109**

  - dsfr/Button: padding-top (Δ-8.0px)
  - dsfr/Button: padding-bottom (Δ-8.0px)
  - dsfr/Button: box width (Δ1.5px)
  - dsfr/Button: font-family (Marianne vs system-ui)
  - dsfr/Button: color (rgb(255,255,255) vs rgb(245,245,254))
  - dsfr/Input: border-bottom style (solid vs none)
  - dsfr/Input: radius topLeft (Δ-4.0px)
  - dsfr/Input: radius topRight (Δ-4.0px)
  - dsfr/Input: padding-top (Δ-8.0px)
  - dsfr/Input: padding-right (Δ-4.0px)
  - dsfr/Input: padding-bottom (Δ-8.0px)
  - dsfr/Input: padding-left (Δ-4.0px)
  - dsfr/Input: box width (Δ-111.0px)
  - dsfr/Input: color (rgb(22,22,22) vs rgb(58,58,58))
  - dsfr/Textarea: border-bottom style (solid vs none)
  - dsfr/Textarea: radius topLeft (Δ-4.0px)
  - dsfr/Textarea: radius topRight (Δ-4.0px)
  - dsfr/Textarea: padding-top (Δ2.0px)
  - dsfr/Textarea: padding-right (Δ-4.0px)
  - dsfr/Textarea: padding-bottom (Δ2.0px)
  - dsfr/Textarea: padding-left (Δ-4.0px)
  - dsfr/Textarea: box width (Δ-110.0px)
  - dsfr/Textarea: box height (Δ8.0px)
  - dsfr/Textarea: color (rgb(22,22,22) vs rgb(58,58,58))
  - dsfr/Select: border-bottom style (solid vs none)
  - dsfr/Select: radius topLeft (Δ-4.0px)
  - dsfr/Select: radius topRight (Δ-4.0px)
  - dsfr/Select: padding-top (Δ-8.0px)
  - dsfr/Select: padding-right (Δ-8.0px)
  - dsfr/Select: padding-bottom (Δ-8.0px)
  - dsfr/Select: padding-left (Δ-4.0px)
  - dsfr/Select: box width (Δ-165.0px)
  - dsfr/Select: line-height (normal vs 24px)
  - dsfr/Select: color (rgb(22,22,22) vs rgb(58,58,58))
  - dsfr/Link: line-height (normal vs 24px)
  - dsfr/Link: text-decoration (underline vs none)
  - dsfr/Card: border-top style (solid vs none)
  - dsfr/Card: border-top color (rgb(238,238,238) vs rgb(58,58,58))
  - dsfr/Card: border-right style (solid vs none)
  - dsfr/Card: border-right color (rgb(238,238,238) vs rgb(58,58,58))
  - dsfr/Card: border-bottom style (solid vs none)
  - dsfr/Card: border-bottom color (rgb(238,238,238) vs rgb(58,58,58))
  - dsfr/Card: border-left style (solid vs none)
  - dsfr/Card: border-left color (rgb(238,238,238) vs rgb(58,58,58))
  - dsfr/Card: padding-top (Δ15.0px)
  - dsfr/Card: padding-right (Δ15.0px)
  - dsfr/Card: padding-bottom (Δ15.0px)
  - dsfr/Card: padding-left (Δ15.0px)
  - dsfr/Card: box width (Δ-102.9px)
  - dsfr/Card: box height (Δ-23.6px)
  - dsfr/Card: line-height (normal vs 24px)
  - dsfr/Card: color (rgb(22,22,22) vs rgb(58,58,58))
  - dsfr/Tabs: border-bottom style (solid vs none)
  - dsfr/Tabs: padding-top (Δ4.0px)
  - dsfr/Tabs: padding-right (Δ-12.0px)
  - dsfr/Tabs: padding-bottom (Δ4.0px)
  - dsfr/Tabs: padding-left (Δ-12.0px)
  - dsfr/Tabs: box width (Δ-23.4px)
  - dsfr/Tabs: box height (Δ9.0px)
  - dsfr/Tabs: font-family (Marianne vs system-ui)
  - dsfr/Tabs: font-weight (500 vs 700)
  - dsfr/Tabs: background-color (rgb(0,0,0)/a0 vs rgb(255,255,255))
  - dsfr/Tabs: color (rgb(22,22,22) vs rgb(0,0,145))
  - carbon/Button: padding-top (Δ-11.0px)
  - carbon/Button: padding-right (Δ-47.0px)
  - carbon/Button: padding-bottom (Δ-11.0px)
  - carbon/Button: box width (Δ-46.0px)
  - carbon/Button: box height (Δ-8.0px)
  - carbon/Button: font-family (IBM Plex Sans vs system-ui)
  - carbon/Input: box width (Δ-95.0px)
  - carbon/Input: font-family (IBM Plex Sans vs system-ui)
  - carbon/Input: line-height (Δ2.0px)
  - carbon/Input: letter-spacing (normal vs 0.16px)
  - carbon/Textarea: box width (Δ-120.0px)
  - carbon/Textarea: box height (Δ13.0px)
  - carbon/Textarea: font-family (IBM Plex Sans vs system-ui)
  - carbon/Textarea: letter-spacing (normal vs 0.16px)
  - carbon/Select: padding-right (Δ-16.0px)
  - carbon/Select: padding-left (Δ-4.0px)
  - carbon/Select: box width (Δ-226.0px)
  - carbon/Select: font-family (IBM Plex Sans vs system-ui)
  - carbon/Select: line-height (normal vs 18.0001px)
  - carbon/Select: letter-spacing (normal vs 0.16px)
  - carbon/Link: box width (Δ7.4px)
  - carbon/Link: box height (Δ4.0px)
  - carbon/Link: font-size (Δ2.0px)
  - carbon/Link: line-height (normal vs 18.0001px)
  - carbon/Link: letter-spacing (normal vs 0.16px)
  - carbon/Card: border-top style (solid vs none)
  - carbon/Card: border-top color (rgb(224,224,224) vs rgb(22,22,22))
  - carbon/Card: border-right style (solid vs none)
  - carbon/Card: border-right color (rgb(224,224,224) vs rgb(22,22,22))
  - carbon/Card: border-bottom style (solid vs none)
  - carbon/Card: border-bottom color (rgb(224,224,224) vs rgb(22,22,22))
  - carbon/Card: border-left style (solid vs none)
  - carbon/Card: border-left color (rgb(224,224,224) vs rgb(22,22,22))
  - carbon/Card: box width (Δ-110.9px)
  - carbon/Card: box height (Δ-17.6px)
  - carbon/Card: font-size (Δ2.0px)
  - carbon/Card: line-height (normal vs 14px)
  - carbon/Card: letter-spacing (normal vs 0.16px)
  - carbon/Card: background-color (rgb(255,255,255) vs rgb(244,244,244))
  - carbon/Tabs: border-bottom color (rgb(15,98,254) vs rgb(224,224,224))
  - carbon/Tabs: padding-right (Δ4.0px)
  - carbon/Tabs: padding-left (Δ4.0px)
  - carbon/Tabs: font-family (IBM Plex Sans vs system-ui)
  - carbon/Tabs: font-size (Δ2.0px)
  - carbon/Tabs: line-height (Δ4.6px)
  - carbon/Tabs: color (rgb(22,22,22) vs rgb(82,82,82))

