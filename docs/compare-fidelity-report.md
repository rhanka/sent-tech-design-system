# Rapport de fidélité — pixel-perfect par bord

Comparaison **bord par bord** de NOS composants mappés vs les **vrais composants officiels** DSFR / Carbon.
Toutes les valeurs proviennent des **styles calculés réels** (computed styles) ; aucune n'est inventée.

| Champ | Valeur |
|---|---|
| Date | 2026-05-29 |
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
| padding-top | 8px | 8px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 97.7px | 95.7px | ≠ Δ2.0px |
| box height | 42px | 40px | ≠ Δ2.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 500 | 500 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(0, 0, 145) | rgb(0, 0, 145) | = |
| color | rgb(255, 255, 255) | rgb(245, 245, 254) | ≠ rgb(255,255,255) vs rgb(245,245,254) |

**Fidélité Button (dsfr) : 90.3%** — 24 `=`, 4 `~`, 3 `≠` sur 31 propriétés.

### Input

- Notre sélecteur : `.cmp-scope--dsfr .st-control`
- Référence : iframe `.cmp-cell--ref` → `.fr-input`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 4px | ≠ Δ-4.0px |
| radius topRight | 0px | 4px | ≠ Δ-4.0px |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 8px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 320px | 320px | = |
| box height | 41px | 40px | ~ Δ1.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Input (dsfr) : 90.3%** — 26 `=`, 2 `~`, 3 `≠` sur 31 propriétés.

### Textarea

- Notre sélecteur : `.cmp-scope--dsfr .st-textarea`
- Référence : iframe `.cmp-cell--ref` → `textarea.fr-input`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 4px | ≠ Δ-4.0px |
| radius topRight | 0px | 4px | ≠ Δ-4.0px |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 10px | 8px | ≠ Δ2.0px |
| padding-right | 16px | 16px | = |
| padding-bottom | 10px | 8px | ≠ Δ2.0px |
| padding-left | 16px | 16px | = |
| box width | 320px | 320px | = |
| box height | 96px | 88px | ≠ Δ8.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Textarea (dsfr) : 80.6%** — 24 `=`, 1 `~`, 6 `≠` sur 31 propriétés.

### Select

- Notre sélecteur : `.cmp-scope--dsfr .st-select`
- Référence : iframe `.cmp-cell--ref` → `.fr-select`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 4px | ≠ Δ-4.0px |
| radius topRight | 0px | 4px | ≠ Δ-4.0px |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 8px | = |
| padding-right | 32px | 40px | ≠ Δ-8.0px |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 320px | 320px | = |
| box height | 43px | 40px | ≠ Δ3.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Select (dsfr) : 80.6%** — 24 `=`, 1 `~`, 6 `≠` sur 31 propriétés.

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
| box width | 78.3px | 78.3px | = |
| box height | 24px | 24px | = |
| font-family | Marianne | Marianne | = |
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
| border-top width | 0px | 0px | = |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgb(238, 238, 238) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | solid | none | = (bord 0px (invisible)) |
| border-right color | rgb(238, 238, 238) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(238, 238, 238) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgb(238, 238, 238) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 16px | 1px | ≠ Δ15.0px |
| padding-right | 16px | 1px | ≠ Δ15.0px |
| padding-bottom | 16px | 1px | ≠ Δ15.0px |
| padding-left | 16px | 1px | ≠ Δ15.0px |
| box width | 288px | 288px | = |
| box height | 82.4px | 106px | ≠ Δ-23.6px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Card (dsfr) : 80.6%** — 25 `=`, 0 `~`, 6 `≠` sur 31 propriétés.

### Tabs

- Notre sélecteur : `.cmp-scope--dsfr .st-tabs__tab[aria-selected="true"]`
- Référence : iframe `.cmp-cell--ref` → `.fr-tabs__tab[aria-selected="true"]`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(0, 0, 145) | rgb(0, 0, 145) | = |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 12px | 8px | ≠ Δ4.0px |
| padding-right | 4px | 16px | ≠ Δ-12.0px |
| padding-bottom | 12px | 8px | ≠ Δ4.0px |
| padding-left | 4px | 16px | ≠ Δ-12.0px |
| box width | 46.3px | 70.8px | ≠ Δ-24.5px |
| box height | 49px | 40px | ≠ Δ9.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 500 | 700 | ≠ 500 vs 700 |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | ≠ rgb(0,0,0)/a0 vs rgb(255,255,255) |
| color | rgb(58, 58, 58) | rgb(0, 0, 145) | ≠ rgb(58,58,58) vs rgb(0,0,145) |

**Fidélité Tabs (dsfr) : 67.7%** — 20 `=`, 1 `~`, 10 `≠` sur 31 propriétés.

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
| box width | 84.1px | 130.1px | ≠ Δ-46.0px |
| box height | 40px | 48px | ≠ Δ-8.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 18px | 18.0001px | ~ Δ0.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(15, 98, 254) | rgb(15, 98, 254) | = |
| color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |

**Fidélité Button (carbon) : 83.9%** — 24 `=`, 2 `~`, 5 `≠` sur 31 propriétés.

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
| box width | 320px | 320px | = |
| box height | 40px | 40px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 18px | 18.0001px | ~ Δ0.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(244, 244, 244) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Input (carbon) : 100%** — 30 `=`, 1 `~`, 0 `≠` sur 31 propriétés.

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
| box width | 320px | 320px | = |
| box height | 96px | 83px | ≠ Δ13.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 18px | 20px | ≠ Δ-2.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(244, 244, 244) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Textarea (carbon) : 93.5%** — 27 `=`, 2 `~`, 2 `≠` sur 31 propriétés.

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
| padding-left | 16px | 16px | = |
| box width | 320px | 320px | = |
| box height | 40px | 40px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 18.0001px | ≠ normal vs 18.0001px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(244, 244, 244) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Select (carbon) : 93.5%** — 29 `=`, 0 `~`, 2 `≠` sur 31 propriétés.

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
| box width | 64.2px | 64.2px | = |
| box height | 18px | 18px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 17.9999px | 18.0001px | ~ Δ0.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(15, 98, 254) | rgb(15, 98, 254) | = |

**Fidélité Link (carbon) : 100%** — 30 `=`, 1 `~`, 0 `≠` sur 31 propriétés.

### Card

- Notre sélecteur : `.cmp-scope--carbon .st-card`
- Référence : iframe `.cmp-cell--ref` → `.bx--tile`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgb(224, 224, 224) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | solid | none | = (bord 0px (invisible)) |
| border-right color | rgb(224, 224, 224) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(224, 224, 224) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgb(224, 224, 224) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 16px | 16px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 16px | 16px | = |
| padding-left | 16px | 16px | = |
| box width | 288px | 288px | = |
| box height | 78.4px | 100px | ≠ Δ-21.6px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 16px | 14px | ≠ Δ2.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 14px | ≠ normal vs 14px |
| letter-spacing | normal | 0.16px | ≠ normal vs 0.16px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(244, 244, 244) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Card (carbon) : 87.1%** — 27 `=`, 0 `~`, 4 `≠` sur 31 propriétés.

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
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 16px | 14px | ≠ Δ2.0px |
| font-weight | 400 | 400 | = |
| line-height | 18px | 16px | ≠ Δ2.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(82, 82, 82) | ≠ rgb(22,22,22) vs rgb(82,82,82) |

**Fidélité Tabs (carbon) : 79.3%** — 23 `=`, 0 `~`, 6 `≠` sur 29 propriétés.

## Récapitulatif global

- **Fidélité globale : 87.3%** (362 `=`, 15 `~`, 55 `≠` sur 432 propriétés mesurées).
- **Écarts nets restants : 55**

  - dsfr/Button: box width (Δ2.0px)
  - dsfr/Button: box height (Δ2.0px)
  - dsfr/Button: color (rgb(255,255,255) vs rgb(245,245,254))
  - dsfr/Input: border-bottom style (solid vs none)
  - dsfr/Input: radius topLeft (Δ-4.0px)
  - dsfr/Input: radius topRight (Δ-4.0px)
  - dsfr/Textarea: border-bottom style (solid vs none)
  - dsfr/Textarea: radius topLeft (Δ-4.0px)
  - dsfr/Textarea: radius topRight (Δ-4.0px)
  - dsfr/Textarea: padding-top (Δ2.0px)
  - dsfr/Textarea: padding-bottom (Δ2.0px)
  - dsfr/Textarea: box height (Δ8.0px)
  - dsfr/Select: border-bottom style (solid vs none)
  - dsfr/Select: radius topLeft (Δ-4.0px)
  - dsfr/Select: radius topRight (Δ-4.0px)
  - dsfr/Select: padding-right (Δ-8.0px)
  - dsfr/Select: box height (Δ3.0px)
  - dsfr/Select: line-height (normal vs 24px)
  - dsfr/Link: line-height (normal vs 24px)
  - dsfr/Link: text-decoration (underline vs none)
  - dsfr/Card: padding-top (Δ15.0px)
  - dsfr/Card: padding-right (Δ15.0px)
  - dsfr/Card: padding-bottom (Δ15.0px)
  - dsfr/Card: padding-left (Δ15.0px)
  - dsfr/Card: box height (Δ-23.6px)
  - dsfr/Card: line-height (normal vs 24px)
  - dsfr/Tabs: border-bottom style (solid vs none)
  - dsfr/Tabs: padding-top (Δ4.0px)
  - dsfr/Tabs: padding-right (Δ-12.0px)
  - dsfr/Tabs: padding-bottom (Δ4.0px)
  - dsfr/Tabs: padding-left (Δ-12.0px)
  - dsfr/Tabs: box width (Δ-24.5px)
  - dsfr/Tabs: box height (Δ9.0px)
  - dsfr/Tabs: font-weight (500 vs 700)
  - dsfr/Tabs: background-color (rgb(0,0,0)/a0 vs rgb(255,255,255))
  - dsfr/Tabs: color (rgb(58,58,58) vs rgb(0,0,145))
  - carbon/Button: padding-top (Δ-11.0px)
  - carbon/Button: padding-right (Δ-47.0px)
  - carbon/Button: padding-bottom (Δ-11.0px)
  - carbon/Button: box width (Δ-46.0px)
  - carbon/Button: box height (Δ-8.0px)
  - carbon/Textarea: box height (Δ13.0px)
  - carbon/Textarea: line-height (Δ-2.0px)
  - carbon/Select: padding-right (Δ-16.0px)
  - carbon/Select: line-height (normal vs 18.0001px)
  - carbon/Card: box height (Δ-21.6px)
  - carbon/Card: font-size (Δ2.0px)
  - carbon/Card: line-height (normal vs 14px)
  - carbon/Card: letter-spacing (normal vs 0.16px)
  - carbon/Tabs: border-bottom color (rgb(15,98,254) vs rgb(224,224,224))
  - carbon/Tabs: padding-right (Δ4.0px)
  - carbon/Tabs: padding-left (Δ4.0px)
  - carbon/Tabs: font-size (Δ2.0px)
  - carbon/Tabs: line-height (Δ2.0px)
  - carbon/Tabs: color (rgb(22,22,22) vs rgb(82,82,82))


## Annexe — fermeture F1 (largeur/hauteur) & F2 (police de marque)

*(Note manuelle, régénérée à part du corps automatique ci-dessus.)*

### F2 — police de marque : ✅ FERMÉE
Les polices de marque sont désormais chargées RÉELLEMENT des deux côtés du banc
(Marianne via les `@font-face` CDN absolus du DSFR côté nous + l'utilitaire DSFR
dans l'iframe ; IBM Plex Sans via Google Fonts ; `font-family` de marque forcée
sur le `<body>` de chaque iframe et `font-family: var(--st-font-sans)` posée sur
le scope pour que Link/Card héritent). **14/14 lignes `font-family` sont `=`, 0 `≠`**
(était : 7 `≠` `Marianne`/`IBM Plex Sans` vs `system-ui`). Les CDN jsDelivr (DSFR)
et Google Fonts / IBM (Carbon) ont bien servi les polices (statuts 200 vérifiés).

### F1 — largeur de boîte : ✅ FERMÉE (artefact de mise en page éliminé)
La référence ne s'affiche plus en pleine largeur ~329px : l'iframe est fixée à
`320 + 2×14 = 348px` (`box-sizing:border-box`) → zone de contenu **320px**
identique des deux côtés ; nos champs pleine largeur (Input/Textarea/Select) sont
posés à `width:320px` ; la carte est rendue dans le même contexte `18rem` (288px)
que la référence officielle.

- **box width** : 10 `=` / 3 `≠`. Les 3 champs et la carte (les 4 composants où
  l'écart venait du contexte de largeur) sont désormais `=`.
- **box height** : 4 `=`, 1 `~`, 8 `≠`.

### Résidus laissés (escapes légitimes — hors périmètre F1)
Les `≠` de boîte restants ne sont PLUS des artefacts de largeur ; ils dépendent de
l'anatomie (padding / line-height), couverte par d'autres familles :

| Résidu | Δ | Cause réelle | Famille |
|---|---|---|---|
| dsfr/Button box width | Δ2,0px | largeur intrinsèque (metrics Marianne + contenu) | intrinsèque |
| carbon/Button box width | Δ-46,0px | padding-right Carbon (≈63px) vs 16px | F9 (padding) |
| dsfr/Tabs box width | Δ-24,5px | padding onglet | F7/F9 |
| dsfr/Button box height | Δ2,0px | metrics Marianne | intrinsèque |
| carbon/Button box height | Δ-8,0px | padding vertical Carbon | F9 |
| dsfr/Select box height | Δ3,0px | line-height `<select>` (UA) | F5 |
| dsfr/Textarea, carbon/Textarea box height | Δ8 / Δ13px | line-height (rows) | F5 |
| dsfr/Card, carbon/Card box height | Δ-23,6 / Δ-21,6px | line-height + padding interne carte | F5 |
| dsfr/Tabs box height | Δ9,0px | padding onglet | F7/F9 |

Conclusion : pour F1, **toute la largeur de boîte imputable au banc** est fermée
(`=`). Les résidus de largeur intrinsèque et de hauteur sont pilotés par le
padding/line-height et seront résorbés par F5/F7/F9 (autre lot). F2 est fermée à 100 %.
