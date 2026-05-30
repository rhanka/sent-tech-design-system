# Rapport de fidélité — pixel-perfect par bord

Comparaison **bord par bord** de NOS composants mappés vs les **vrais composants officiels** DSFR / Carbon.
Toutes les valeurs proviennent des **styles calculés réels** (computed styles) ; aucune n'est inventée.

| Champ | Valeur |
|---|---|
| Date | 2026-05-30 |
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

### ButtonDisabled

- Notre sélecteur : `.cmp-scope--dsfr .st-button:disabled`
- Référence : iframe `.cmp-cell--ref` → `.fr-btn:disabled`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 1px | 0px | ~ Δ1.0px |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgba(0, 0, 0, 0) | rgb(146, 146, 146) | = (bord 0px (invisible)) |
| border-right width | 1px | 0px | ~ Δ1.0px |
| border-right style | solid | none | = (bord 0px (invisible)) |
| border-right color | rgba(0, 0, 0, 0) | rgb(146, 146, 146) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgba(0, 0, 0, 0) | rgb(146, 146, 146) | = (bord 0px (invisible)) |
| border-left width | 1px | 0px | ~ Δ1.0px |
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgba(0, 0, 0, 0) | rgb(146, 146, 146) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 8px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 110px | 108px | ≠ Δ2.0px |
| box height | 42px | 40px | ≠ Δ2.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 500 | 500 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(0, 0, 145) | rgb(229, 229, 229) | ≠ rgb(0,0,145) vs rgb(229,229,229) |
| color | rgb(255, 255, 255) | rgb(146, 146, 146) | ≠ rgb(255,255,255) vs rgb(146,146,146) |

**Fidélité ButtonDisabled (dsfr) : 87.1%** — 23 `=`, 4 `~`, 4 `≠` sur 31 propriétés.

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
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 4px | 4px | = |
| radius topRight | 4px | 4px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 8px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Input (dsfr) : 96.8%** — 30 `=`, 0 `~`, 1 `≠` sur 31 propriétés.

### InputError

- Notre sélecteur : `.cmp-scope--dsfr .st-control[aria-invalid="true"]`
- Référence : iframe `.cmp-cell--ref` → `.fr-input--error`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(206, 5, 0) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(206, 5, 0) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(206, 5, 0) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(206, 5, 0) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 4px | 4px | = |
| radius topRight | 4px | 4px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 8px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité InputError (dsfr) : 96.8%** — 30 `=`, 0 `~`, 1 `≠` sur 31 propriétés.

### InputDisabled

- Notre sélecteur : `.cmp-scope--dsfr .st-control:disabled`
- Référence : iframe `.cmp-cell--ref` → `.fr-input:disabled`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(146, 146, 146) | rgb(146, 146, 146) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(146, 146, 146) | rgb(146, 146, 146) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(146, 146, 146) | rgb(146, 146, 146) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(146, 146, 146) | rgb(146, 146, 146) | = (bord 0px (invisible)) |
| radius topLeft | 4px | 4px | = |
| radius topRight | 4px | 4px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 8px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(246, 246, 246) | rgb(238, 238, 238) | ≠ rgb(246,246,246) vs rgb(238,238,238) |
| color | rgb(146, 146, 146) | rgb(146, 146, 146) | = |

**Fidélité InputDisabled (dsfr) : 93.5%** — 29 `=`, 0 `~`, 2 `≠` sur 31 propriétés.

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
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 4px | 4px | = |
| radius topRight | 4px | 4px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 10px | 8px | ≠ Δ2.0px |
| padding-right | 16px | 16px | = |
| padding-bottom | 10px | 8px | ≠ Δ2.0px |
| padding-left | 16px | 16px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
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

**Fidélité Textarea (dsfr) : 87.1%** — 27 `=`, 0 `~`, 4 `≠` sur 31 propriétés.

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
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 4px | 4px | = |
| radius topRight | 4px | 4px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 8px | = |
| padding-right | 40px | 40px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Select (dsfr) : 96.8%** — 30 `=`, 0 `~`, 1 `≠` sur 31 propriétés.

### Search

- Notre sélecteur : `.cmp-scope--dsfr .st-search`
- Référence : iframe `.cmp-cell--ref` → `.fr-search-bar .fr-input`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 4px | ≠ Δ-4.0px |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 8px | ≠ Δ-8.0px |
| padding-right | 0px | 16px | ≠ Δ-16.0px |
| padding-bottom | 0px | 8px | ≠ Δ-8.0px |
| padding-left | 0px | 16px | ≠ Δ-16.0px |
| box width | 320px | 233px | ≠ Δ87.0px |
| box height | 40px | 40px | = |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Search (dsfr) : 77.4%** — 24 `=`, 0 `~`, 7 `≠` sur 31 propriétés.

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
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | underline | none | ≠ underline vs none |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(0, 0, 145) | rgb(0, 0, 145) | = |

**Fidélité Link (dsfr) : 96.8%** — 30 `=`, 0 `~`, 1 `≠` sur 31 propriétés.

### Checkbox

- Notre sélecteur : `.cmp-scope--dsfr .st-choice__label`
- Référence : iframe `.cmp-cell--ref` → `.fr-checkbox-group label`
- ⚠ Le contrôle visuel DSFR est dessiné en `::before` sur le label (non mesurable). On compare le LABEL (`.fr-checkbox-group label`) — la typo/couleur réellement peintes.

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 170.8px | 241px | ≠ Δ-70.2px |
| box height | 23px | 44px | ≠ Δ-21.0px |
| font-family | Marianne | Marianne | = |
| font-size | 15px | 16px | ~ Δ1.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(58, 58, 58) | rgb(22, 22, 22) | ≠ rgb(58,58,58) vs rgb(22,22,22) |

**Fidélité Checkbox (dsfr) : 87.1%** — 26 `=`, 1 `~`, 4 `≠` sur 31 propriétés.

### Radio

- Notre sélecteur : `.cmp-scope--dsfr .st-choice__label`
- Référence : iframe `.cmp-cell--ref` → `.fr-radio-group label`
- ⚠ Idem checkbox : contrôle en pseudo-élément. On compare le label (`.fr-radio-group label`).

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 32px | ≠ Δ-32.0px |
| box width | 170.8px | 103.1px | ≠ Δ67.7px |
| box height | 23px | 24px | ~ Δ1.0px |
| font-family | Marianne | Marianne | = |
| font-size | 15px | 16px | ~ Δ1.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(58, 58, 58) | rgb(22, 22, 22) | ≠ rgb(58,58,58) vs rgb(22,22,22) |

**Fidélité Radio (dsfr) : 87.1%** — 25 `=`, 2 `~`, 4 `≠` sur 31 propriétés.

### Toggle

- Notre sélecteur : `.cmp-scope--dsfr .st-toggle__track`
- Référence : iframe `.cmp-cell--ref` → `.fr-toggle__label`
- ⚠ L'interrupteur DSFR est dessiné en `::before/::after` sur le label. On compare le label (`.fr-toggle__label`) — typo/couleur comparables.

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 999px | 0px | ≠ Δ999.0px |
| radius topRight | 999px | 0px | ≠ Δ999.0px |
| radius bottomRight | 999px | 0px | ≠ Δ999.0px |
| radius bottomLeft | 999px | 0px | ≠ Δ999.0px |
| padding-top | 2px | 0px | ≠ Δ2.0px |
| padding-right | 2px | 0px | ≠ Δ2.0px |
| padding-bottom | 2px | 0px | ≠ Δ2.0px |
| padding-left | 2px | 0px | ≠ Δ2.0px |
| box width | 36px | 241px | ≠ Δ-205.0px |
| box height | 20px | 40px | ≠ Δ-20.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(0, 0, 145) | rgba(0, 0, 0, 0) | ≠ rgb(0,0,145) vs rgb(0,0,0)/a0 |
| color | rgb(58, 58, 58) | rgb(22, 22, 22) | ≠ rgb(58,58,58) vs rgb(22,22,22) |

**Fidélité Toggle (dsfr) : 58.1%** — 18 `=`, 0 `~`, 13 `≠` sur 31 propriétés.

### Tag

- Notre sélecteur : `.cmp-scope--dsfr .st-tag`
- Référence : iframe `.cmp-cell--ref` → `.fr-tag`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(102, 102, 102) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(102, 102, 102) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(102, 102, 102) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(102, 102, 102) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 999px | 16px | ≠ Δ983.0px |
| radius topRight | 999px | 16px | ≠ Δ983.0px |
| radius bottomRight | 999px | 16px | ≠ Δ983.0px |
| radius bottomLeft | 999px | 16px | ≠ Δ983.0px |
| padding-top | 4px | 4px | = |
| padding-right | 10px | 12px | ≠ Δ-2.0px |
| padding-bottom | 4px | 4px | = |
| padding-left | 10px | 12px | ≠ Δ-2.0px |
| box width | 74.7px | 87px | ≠ Δ-12.3px |
| box height | 20px | 32px | ≠ Δ-12.0px |
| font-family | Marianne | Marianne | = |
| font-size | 12px | 14px | ≠ Δ-2.0px |
| font-weight | 600 | 400 | ≠ 600 vs 400 |
| line-height | 12px | 24px | ≠ Δ-12.0px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(246, 246, 246) | rgb(238, 238, 238) | ≠ rgb(246,246,246) vs rgb(238,238,238) |
| color | rgb(102, 102, 102) | rgb(22, 22, 22) | ≠ rgb(102,102,102) vs rgb(22,22,22) |

**Fidélité Tag (dsfr) : 58.1%** — 18 `=`, 0 `~`, 13 `≠` sur 31 propriétés.

### Badge

- Notre sélecteur : `.cmp-scope--dsfr .st-badge`
- Référence : iframe `.cmp-cell--ref` → `.fr-badge`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(0, 99, 203) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(0, 99, 203) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(0, 99, 203) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(0, 99, 203) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 999px | 4px | ≠ Δ995.0px |
| radius topRight | 999px | 4px | ≠ Δ995.0px |
| radius bottomRight | 999px | 4px | ≠ Δ995.0px |
| radius bottomLeft | 999px | 4px | ≠ Δ995.0px |
| padding-top | 4px | 0px | ≠ Δ4.0px |
| padding-right | 8px | 8px | = |
| padding-bottom | 4px | 0px | ≠ Δ4.0px |
| padding-left | 8px | 8px | = |
| box width | 68.2px | 89px | ≠ Δ-20.8px |
| box height | 20px | 24px | ≠ Δ-4.0px |
| font-family | Marianne | Marianne | = |
| font-size | 12px | 14px | ≠ Δ-2.0px |
| font-weight | 650 | 700 | ≠ 650 vs 700 |
| line-height | 12px | 24px | ≠ Δ-12.0px |
| letter-spacing | normal | normal | = |
| text-transform | none | uppercase | ≠ none vs uppercase |
| text-decoration | none | none | = |
| background-color | color(srgb 0.86 0.914353 0.971451) | rgb(238, 238, 238) | ≠ color(srgb 0.86 0.914353 0.971451) vs rgb(238,238,238) |
| color | rgb(0, 99, 203) | rgb(58, 58, 58) | ≠ rgb(0,99,203) vs rgb(58,58,58) |

**Fidélité Badge (dsfr) : 54.8%** — 17 `=`, 0 `~`, 14 `≠` sur 31 propriétés.

### Alert

- Notre sélecteur : `.cmp-scope--dsfr .st-alert`
- Référence : iframe `.cmp-cell--ref` → `.fr-alert`

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
| border-left width | 4px | 0px | ≠ Δ4.0px |
| border-left style | solid | none | ≠ solid vs none |
| border-left color | rgb(0, 99, 203) | rgb(58, 58, 58) | ≠ rgb(0,99,203) vs rgb(58,58,58) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 16px | 16px | = |
| padding-right | 16px | 36px | ≠ Δ-20.0px |
| padding-bottom | 16px | 12px | ≠ Δ4.0px |
| padding-left | 16px | 56px | ≠ Δ-40.0px |
| box width | 296.2px | 273px | ≠ Δ23.2px |
| box height | 82px | 108px | ≠ Δ-26.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(255, 255, 255) | rgba(0, 0, 0, 0) | ≠ rgb(255,255,255) vs rgb(0,0,0)/a0 |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Alert (dsfr) : 48.4%** — 12 `=`, 3 `~`, 16 `≠` sur 31 propriétés.

### Accordion

- Notre sélecteur : `.cmp-scope--dsfr .st-accordion__trigger`
- Référence : iframe `.cmp-cell--ref` → `.fr-accordion__btn`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(58, 58, 58) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(58, 58, 58) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 14px | 12px | ≠ Δ2.0px |
| padding-right | 8px | 16px | ≠ Δ-8.0px |
| padding-bottom | 14px | 12px | ≠ Δ2.0px |
| padding-left | 8px | 16px | ≠ Δ-8.0px |
| box width | 301px | 273px | ≠ Δ28.0px |
| box height | 56px | 48px | ≠ Δ8.0px |
| font-family | Marianne | Marianne | = |
| font-size | 18.72px | 16px | ≠ Δ2.7px |
| font-weight | 600 | 500 | ≠ 600 vs 500 |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(58, 58, 58) | rgb(0, 0, 145) | ≠ rgb(58,58,58) vs rgb(0,0,145) |

**Fidélité Accordion (dsfr) : 67.7%** — 21 `=`, 0 `~`, 10 `≠` sur 31 propriétés.

### Breadcrumb

- Notre sélecteur : `.cmp-scope--dsfr .st-breadcrumb a`
- Référence : iframe `.cmp-cell--ref` → `.fr-breadcrumb__link`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(102, 102, 102) | rgb(102, 102, 102) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(102, 102, 102) | rgb(102, 102, 102) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(102, 102, 102) | rgb(102, 102, 102) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(102, 102, 102) | rgb(102, 102, 102) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 42.6px | 42.6px | = |
| box height | 20px | 18px | ≠ Δ2.0px |
| font-family | Marianne | Marianne | = |
| font-size | 12px | 12px | = |
| font-weight | 400 | 400 | = |
| line-height | 20px | 20px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(102, 102, 102) | rgb(102, 102, 102) | = |

**Fidélité Breadcrumb (dsfr) : 96.8%** — 30 `=`, 0 `~`, 1 `≠` sur 31 propriétés.

### Pagination

- Notre sélecteur : `.cmp-scope--dsfr .st-pagination__page--active`
- Référence : iframe `.cmp-cell--ref` → `.fr-pagination__link[aria-current="page"]`
- ⚠ Page active = `.fr-pagination__link[aria-current="page"]` (lien rempli Bleu France).

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgba(0, 0, 0, 0) | rgb(245, 245, 254) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | solid | none | = (bord 0px (invisible)) |
| border-right color | rgba(0, 0, 0, 0) | rgb(245, 245, 254) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgba(0, 0, 0, 0) | rgb(245, 245, 254) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgba(0, 0, 0, 0) | rgb(245, 245, 254) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 4px | 4px | = |
| padding-right | 12px | 12px | = |
| padding-bottom | 4px | 4px | = |
| padding-left | 12px | 12px | = |
| box width | 32.4px | 32.4px | = |
| box height | 32px | 32px | = |
| font-family | Marianne | Marianne | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(0, 0, 145) | rgb(0, 0, 145) | = |
| color | rgb(245, 245, 254) | rgb(245, 245, 254) | = |

**Fidélité Pagination (dsfr) : 100%** — 31 `=`, 0 `~`, 0 `≠` sur 31 propriétés.

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
| box width | 288px | 273px | ≠ Δ15.0px |
| box height | 82.4px | 106px | ≠ Δ-23.6px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
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
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgb(0, 0, 145) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(0, 0, 145) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(0, 0, 145) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(0, 0, 145) | rgb(0, 0, 145) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 8px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 70.8px | 70.8px | = |
| box height | 40px | 40px | = |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 700 | 700 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |
| color | rgb(0, 0, 145) | rgb(0, 0, 145) | = |

**Fidélité Tabs (dsfr) : 100%** — 31 `=`, 0 `~`, 0 `≠` sur 31 propriétés.

### Quote

- Notre sélecteur : `.cmp-scope--dsfr .st-quote`
- Référence : iframe `.cmp-cell--ref` → `.fr-quote`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-left width | 4px | 0px | ≠ Δ4.0px |
| border-left style | solid | none | ≠ solid vs none |
| border-left color | rgb(0, 0, 145) | rgb(58, 58, 58) | ≠ rgb(0,0,145) vs rgb(58,58,58) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 0px | ≠ Δ8.0px |
| padding-right | 0px | 8px | ≠ Δ-8.0px |
| padding-bottom | 8px | 32px | ≠ Δ-24.0px |
| padding-left | 16px | 8px | ≠ Δ8.0px |
| box width | 301px | 273px | ≠ Δ28.0px |
| box height | 102.6px | 204px | ≠ Δ-101.4px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Quote (dsfr) : 67.7%** — 21 `=`, 0 `~`, 10 `≠` sur 31 propriétés.

### Highlight

- Notre sélecteur : `.cmp-scope--dsfr .st-highlight`
- Référence : iframe `.cmp-cell--ref` → `.fr-highlight`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(58, 58, 58) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| border-left width | 4px | 0px | ≠ Δ4.0px |
| border-left style | solid | none | ≠ solid vs none |
| border-left color | rgb(0, 0, 145) | rgb(58, 58, 58) | ≠ rgb(0,0,145) vs rgb(58,58,58) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 16px | 0px | ≠ Δ16.0px |
| padding-right | 16px | 0px | ≠ Δ16.0px |
| padding-bottom | 16px | 0px | ≠ Δ16.0px |
| padding-left | 16px | 20px | ≠ Δ-4.0px |
| box width | 301px | 273px | ≠ Δ28.0px |
| box height | 111.3px | 48px | ≠ Δ63.3px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | 24px | ≠ normal vs 24px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(246, 246, 246) | rgba(0, 0, 0, 0) | ≠ rgb(246,246,246) vs rgb(0,0,0)/a0 |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Highlight (dsfr) : 64.5%** — 20 `=`, 0 `~`, 11 `≠` sur 31 propriétés.

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
| padding-top | 11px | 11px | = |
| padding-right | 63px | 63px | = |
| padding-bottom | 11px | 11px | = |
| padding-left | 16px | 15px | ~ Δ1.0px |
| box width | 131.1px | 130.1px | ~ Δ1.0px |
| box height | 48px | 48px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 18px | 18.0001px | ~ Δ0.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(15, 98, 254) | rgb(15, 98, 254) | = |
| color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |

**Fidélité Button (carbon) : 100%** — 28 `=`, 3 `~`, 0 `≠` sur 31 propriétés.

### ButtonDisabled

- Notre sélecteur : `.cmp-scope--carbon .st-button:disabled`
- Référence : iframe `.cmp-cell--ref` → `.bx--btn--primary:disabled`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 1px | 1px | = |
| border-top style | solid | solid | = |
| border-top color | rgba(0, 0, 0, 0) | rgb(198, 198, 198) | ≠ rgb(0,0,0)/a0 vs rgb(198,198,198) |
| border-right width | 1px | 1px | = |
| border-right style | solid | solid | = |
| border-right color | rgba(0, 0, 0, 0) | rgb(198, 198, 198) | ≠ rgb(0,0,0)/a0 vs rgb(198,198,198) |
| border-bottom width | 1px | 1px | = |
| border-bottom style | solid | solid | = |
| border-bottom color | rgba(0, 0, 0, 0) | rgb(198, 198, 198) | ≠ rgb(0,0,0)/a0 vs rgb(198,198,198) |
| border-left width | 1px | 1px | = |
| border-left style | solid | solid | = |
| border-left color | rgba(0, 0, 0, 0) | rgb(198, 198, 198) | ≠ rgb(0,0,0)/a0 vs rgb(198,198,198) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 11px | 11px | = |
| padding-right | 63px | 63px | = |
| padding-bottom | 11px | 11px | = |
| padding-left | 16px | 15px | ~ Δ1.0px |
| box width | 137.2px | 136.2px | ~ Δ1.0px |
| box height | 48px | 48px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 18px | 18.0001px | ~ Δ0.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(15, 98, 254) | rgb(198, 198, 198) | ≠ rgb(15,98,254) vs rgb(198,198,198) |
| color | rgb(255, 255, 255) | rgb(141, 141, 141) | ≠ rgb(255,255,255) vs rgb(141,141,141) |

**Fidélité ButtonDisabled (carbon) : 80.6%** — 22 `=`, 3 `~`, 6 `≠` sur 31 propriétés.

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
| box width | 320px | 273px | ≠ Δ47.0px |
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

**Fidélité Input (carbon) : 96.8%** — 29 `=`, 1 `~`, 1 `≠` sur 31 propriétés.

### InputError

- Notre sélecteur : `.cmp-scope--carbon .st-control[aria-invalid="true"]`
- Référence : iframe `.cmp-cell--ref` → `.bx--text-input--invalid`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(218, 30, 40) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(218, 30, 40) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 1px | = |
| border-bottom style | solid | solid | = |
| border-bottom color | rgb(218, 30, 40) | rgb(141, 141, 141) | ≠ rgb(218,30,40) vs rgb(141,141,141) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(218, 30, 40) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 16px | 40px | ≠ Δ-24.0px |
| padding-bottom | 0px | 0px | = |
| padding-left | 16px | 16px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
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

**Fidélité InputError (carbon) : 90.3%** — 27 `=`, 1 `~`, 3 `≠` sur 31 propriétés.

### InputDisabled

- Notre sélecteur : `.cmp-scope--carbon .st-control:disabled`
- Référence : iframe `.cmp-cell--ref` → `.bx--text-input:disabled`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(111, 111, 111) | rgb(198, 198, 198) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(111, 111, 111) | rgb(198, 198, 198) | = (bord 0px (invisible)) |
| border-bottom width | 1px | 1px | = |
| border-bottom style | solid | solid | = |
| border-bottom color | rgb(141, 141, 141) | rgba(0, 0, 0, 0) | ≠ rgb(141,141,141) vs rgb(0,0,0)/a0 |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(111, 111, 111) | rgb(198, 198, 198) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 16px | 16px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 18px | 18.0001px | ~ Δ0.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(244, 244, 244) | = |
| color | rgb(111, 111, 111) | rgb(198, 198, 198) | ≠ rgb(111,111,111) vs rgb(198,198,198) |

**Fidélité InputDisabled (carbon) : 90.3%** — 27 `=`, 1 `~`, 3 `≠` sur 31 propriétés.

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
| box width | 320px | 273px | ≠ Δ47.0px |
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

**Fidélité Textarea (carbon) : 90.3%** — 26 `=`, 2 `~`, 3 `≠` sur 31 propriétés.

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
| padding-right | 48px | 48px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 16px | 16px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
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

**Fidélité Select (carbon) : 96.8%** — 29 `=`, 1 `~`, 1 `≠` sur 31 propriétés.

### Search

- Notre sélecteur : `.cmp-scope--carbon .st-search`
- Référence : iframe `.cmp-cell--ref` → `.bx--search-input`

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
| padding-right | 0px | 40px | ≠ Δ-40.0px |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 40px | ≠ Δ-40.0px |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 16px | 14px | ≠ Δ2.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 18.0001px | ≠ normal vs 18.0001px |
| letter-spacing | normal | 0.16px | ≠ normal vs 0.16px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(244, 244, 244) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Search (carbon) : 80.6%** — 25 `=`, 0 `~`, 6 `≠` sur 31 propriétés.

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

### Checkbox

- Notre sélecteur : `.cmp-scope--carbon .st-choice__label`
- Référence : iframe `.cmp-cell--ref` → `.bx--checkbox-label-text`
- ⚠ Carbon checkbox control is a `::before` on the label. Measuring the label text (`.bx--checkbox-label-text`) — the comparable typography/colour.

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 6px | ≠ Δ-6.0px |
| box width | 123px | 123.7px | ~ Δ0.7px |
| box height | 19px | 21px | ≠ Δ-2.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 15px | 14px | ~ Δ1.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 18.0001px | ≠ normal vs 18.0001px |
| letter-spacing | normal | 0.16px | ≠ normal vs 0.16px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Checkbox (carbon) : 87.1%** — 25 `=`, 2 `~`, 4 `≠` sur 31 propriétés.

### Radio

- Notre sélecteur : `.cmp-scope--carbon .st-choice__label`
- Référence : iframe `.cmp-cell--ref` → `.bx--radio-button__label-text`
- ⚠ Carbon radio control is `.bx--radio-button__appearance` (a circle). Measuring the label text (`.bx--radio-button__label-text`) — comparable typography/colour.

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 123px | 55.7px | ≠ Δ67.3px |
| box height | 19px | 20px | ~ Δ1.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 15px | 14px | ~ Δ1.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 20px | ≠ normal vs 20px |
| letter-spacing | normal | 0.16px | ≠ normal vs 0.16px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Radio (carbon) : 90.3%** — 26 `=`, 2 `~`, 3 `≠` sur 31 propriétés.

### Toggle

- Notre sélecteur : `.cmp-scope--carbon .st-toggle__track`
- Référence : iframe `.cmp-cell--ref` → `.bx--toggle__switch`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(22, 22, 22) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| radius topLeft | 999px | 0px | ≠ Δ999.0px |
| radius topRight | 999px | 0px | ≠ Δ999.0px |
| radius bottomRight | 999px | 0px | ≠ Δ999.0px |
| radius bottomLeft | 999px | 0px | ≠ Δ999.0px |
| padding-top | 2px | 0px | ≠ Δ2.0px |
| padding-right | 2px | 0px | ≠ Δ2.0px |
| padding-bottom | 2px | 0px | ≠ Δ2.0px |
| padding-left | 2px | 0px | ≠ Δ2.0px |
| box width | 36px | 48px | ≠ Δ-12.0px |
| box height | 20px | 24px | ≠ Δ-4.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 16px | 12px | ≠ Δ4.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 16px | ≠ normal vs 16px |
| letter-spacing | normal | 0.32px | ≠ normal vs 0.32px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(15, 98, 254) | rgba(0, 0, 0, 0) | ≠ rgb(15,98,254) vs rgb(0,0,0)/a0 |
| color | rgb(22, 22, 22) | rgb(82, 82, 82) | ≠ rgb(22,22,22) vs rgb(82,82,82) |

**Fidélité Toggle (carbon) : 51.6%** — 16 `=`, 0 `~`, 15 `≠` sur 31 propriétés.

### Tag

- Notre sélecteur : `.cmp-scope--carbon .st-tag`
- Référence : iframe `.cmp-cell--ref` → `.bx--tag`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(82, 82, 82) | rgb(57, 57, 57) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(82, 82, 82) | rgb(57, 57, 57) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(82, 82, 82) | rgb(57, 57, 57) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(82, 82, 82) | rgb(57, 57, 57) | = (bord 0px (invisible)) |
| radius topLeft | 999px | 15px | ≠ Δ984.0px |
| radius topRight | 999px | 15px | ≠ Δ984.0px |
| radius bottomRight | 999px | 15px | ≠ Δ984.0px |
| radius bottomLeft | 999px | 15px | ≠ Δ984.0px |
| padding-top | 4px | 4px | = |
| padding-right | 10px | 8px | ≠ Δ2.0px |
| padding-bottom | 4px | 4px | = |
| padding-left | 10px | 8px | ≠ Δ2.0px |
| box width | 39.4px | 35.7px | ≠ Δ3.7px |
| box height | 20px | 24px | ≠ Δ-4.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 12px | 12px | = |
| font-weight | 600 | 400 | ≠ 600 vs 400 |
| line-height | 12px | 16px | ≠ Δ-4.0px |
| letter-spacing | normal | 0.32px | ≠ normal vs 0.32px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(224, 224, 224) | ≠ rgb(244,244,244) vs rgb(224,224,224) |
| color | rgb(82, 82, 82) | rgb(57, 57, 57) | ≠ rgb(82,82,82) vs rgb(57,57,57) |

**Fidélité Tag (carbon) : 58.1%** — 18 `=`, 0 `~`, 13 `≠` sur 31 propriétés.

### Alert

- Notre sélecteur : `.cmp-scope--carbon .st-alert`
- Référence : iframe `.cmp-cell--ref` → `.bx--inline-notification`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 1px | 0px | ~ Δ1.0px |
| border-top style | solid | none | ≠ solid vs none |
| border-top color | rgb(224, 224, 224) | rgb(255, 255, 255) | ≠ rgb(224,224,224) vs rgb(255,255,255) |
| border-right width | 1px | 0px | ~ Δ1.0px |
| border-right style | solid | none | ≠ solid vs none |
| border-right color | rgb(224, 224, 224) | rgb(255, 255, 255) | ≠ rgb(224,224,224) vs rgb(255,255,255) |
| border-bottom width | 1px | 0px | ~ Δ1.0px |
| border-bottom style | solid | none | ≠ solid vs none |
| border-bottom color | rgb(224, 224, 224) | rgb(255, 255, 255) | ≠ rgb(224,224,224) vs rgb(255,255,255) |
| border-left width | 4px | 3px | ~ Δ1.0px |
| border-left style | solid | solid | = |
| border-left color | rgb(0, 67, 206) | rgb(69, 137, 255) | ≠ rgb(0,67,206) vs rgb(69,137,255) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 16px | 0px | ≠ Δ16.0px |
| padding-right | 16px | 0px | ≠ Δ16.0px |
| padding-bottom | 16px | 0px | ≠ Δ16.0px |
| padding-left | 16px | 0px | ≠ Δ16.0px |
| box width | 221.2px | 288px | ≠ Δ-66.8px |
| box height | 78px | 66px | ≠ Δ12.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 16px | 14px | ≠ Δ2.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 14px | ≠ normal vs 14px |
| letter-spacing | normal | 0.16px | ≠ normal vs 0.16px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(255, 255, 255) | rgb(57, 57, 57) | ≠ rgb(255,255,255) vs rgb(57,57,57) |
| color | rgb(22, 22, 22) | rgb(255, 255, 255) | ≠ rgb(22,22,22) vs rgb(255,255,255) |

**Fidélité Alert (carbon) : 41.9%** — 9 `=`, 4 `~`, 18 `≠` sur 31 propriétés.

### Accordion

- Notre sélecteur : `.cmp-scope--carbon .st-accordion__trigger`
- Référence : iframe `.cmp-cell--ref` → `.bx--accordion__heading`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(22, 22, 22) | rgb(22, 22, 22) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 14px | 10px | ≠ Δ4.0px |
| padding-right | 8px | 0px | ≠ Δ8.0px |
| padding-bottom | 14px | 10px | ≠ Δ4.0px |
| padding-left | 8px | 0px | ≠ Δ8.0px |
| box width | 301px | 273px | ≠ Δ28.0px |
| box height | 52px | 40px | ≠ Δ12.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 18.72px | 13.3333px | ≠ Δ5.4px |
| font-weight | 600 | 400 | ≠ 600 vs 400 |
| line-height | normal | normal | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Accordion (carbon) : 74.2%** — 23 `=`, 0 `~`, 8 `≠` sur 31 propriétés.

### Breadcrumb

- Notre sélecteur : `.cmp-scope--carbon .st-breadcrumb a`
- Référence : iframe `.cmp-cell--ref` → `.bx--breadcrumb-item .bx--link`

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
| box width | 38.3px | 38.3px | = |
| box height | 18px | 18px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 18px | 18.0001px | ~ Δ0.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(15, 98, 254) | rgb(15, 98, 254) | = |

**Fidélité Breadcrumb (carbon) : 100%** — 30 `=`, 1 `~`, 0 `≠` sur 31 propriétés.

### Pagination

- Notre sélecteur : `.cmp-scope--carbon .st-pagination__page--active`
- Référence : iframe `.cmp-cell--ref` → `.bx--pagination-nav__page--active`
- ⚠ Active page = `.bx--pagination-nav__page--active` (the styled active page button).

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgba(0, 0, 0, 0) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | solid | none | = (bord 0px (invisible)) |
| border-right color | rgba(0, 0, 0, 0) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgba(0, 0, 0, 0) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgba(0, 0, 0, 0) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 17px | 17px | = |
| padding-right | 4px | 4px | = |
| padding-bottom | 17px | 17px | = |
| padding-left | 4px | 4px | = |
| box width | 48px | 48px | = |
| box height | 48px | 48px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 600 | 600 | = |
| line-height | 14px | 14px | = |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(82, 82, 82) | rgb(82, 82, 82) | = |

**Fidélité Pagination (carbon) : 100%** — 31 `=`, 0 `~`, 0 `≠` sur 31 propriétés.

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
| box width | 288px | 273px | ≠ Δ15.0px |
| box height | 72.4px | 100px | ≠ Δ-27.6px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 14px | 14px | = |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(244, 244, 244) | rgb(244, 244, 244) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Card (carbon) : 93.5%** — 29 `=`, 0 `~`, 2 `≠` sur 31 propriétés.

### Tabs

- Notre sélecteur : `.cmp-scope--carbon .st-tabs__tab[aria-selected="true"]`
- Référence : iframe `.cmp-cell--ref` → `.bx--tabs__nav-item--selected .bx--tabs__nav-link`
- ⚠ Spec selector `.bx--tabs__nav-item--selected` is the `<li>` wrapper (0×0 box). Measuring its inner `.bx--tabs__nav-link` — the actual styled tab.
- ⚠ reference element is styled (CDN loaded) but its own box collapsed to 0; box width/height excluded from the diff

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgb(15, 98, 254) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
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
| padding-right | 0px | 0px | = |
| padding-bottom | 12px | 12px | = |
| padding-left | 0px | 0px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 16px | 16px | = |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(82, 82, 82) | ≠ rgb(22,22,22) vs rgb(82,82,82) |

**Fidélité Tabs (carbon) : 93.1%** — 27 `=`, 0 `~`, 2 `≠` sur 29 propriétés.

## Récap de fidélité par composant

Couverture mesurée : **41 paires** (notre composant mappé vs vrai composant officiel).

| Thème | Composant / variant | Fidélité | `=` | `~` | `≠` | Réf stylée ? |
|---|---|---|---|---|---|---|
| dsfr | Button | 90.3% | 24 | 4 | 3 | oui |
| dsfr | ButtonDisabled | 87.1% | 23 | 4 | 4 | oui |
| dsfr | Input | 96.8% | 30 | 0 | 1 | oui |
| dsfr | InputError | 96.8% | 30 | 0 | 1 | oui |
| dsfr | InputDisabled | 93.5% | 29 | 0 | 2 | oui |
| dsfr | Textarea | 87.1% | 27 | 0 | 4 | oui |
| dsfr | Select | 96.8% | 30 | 0 | 1 | oui |
| dsfr | Search | 77.4% | 24 | 0 | 7 | oui |
| dsfr | Link | 96.8% | 30 | 0 | 1 | oui |
| dsfr | Checkbox | 87.1% | 26 | 1 | 4 | oui |
| dsfr | Radio | 87.1% | 25 | 2 | 4 | oui |
| dsfr | Toggle | 58.1% | 18 | 0 | 13 | oui |
| dsfr | Tag | 58.1% | 18 | 0 | 13 | oui |
| dsfr | Badge | 54.8% | 17 | 0 | 14 | oui |
| dsfr | Alert | 48.4% | 12 | 3 | 16 | oui |
| dsfr | Accordion | 67.7% | 21 | 0 | 10 | oui |
| dsfr | Breadcrumb | 96.8% | 30 | 0 | 1 | oui |
| dsfr | Pagination | 100% | 31 | 0 | 0 | oui |
| dsfr | Card | 80.6% | 25 | 0 | 6 | oui |
| dsfr | Tabs | 100% | 31 | 0 | 0 | oui |
| dsfr | Quote | 67.7% | 21 | 0 | 10 | oui |
| dsfr | Highlight | 64.5% | 20 | 0 | 11 | oui |
| carbon | Button | 100% | 28 | 3 | 0 | oui |
| carbon | ButtonDisabled | 80.6% | 22 | 3 | 6 | oui |
| carbon | Input | 96.8% | 29 | 1 | 1 | oui |
| carbon | InputError | 90.3% | 27 | 1 | 3 | oui |
| carbon | InputDisabled | 90.3% | 27 | 1 | 3 | oui |
| carbon | Textarea | 90.3% | 26 | 2 | 3 | oui |
| carbon | Select | 96.8% | 29 | 1 | 1 | oui |
| carbon | Search | 80.6% | 25 | 0 | 6 | oui |
| carbon | Link | 100% | 30 | 1 | 0 | oui |
| carbon | Checkbox | 87.1% | 25 | 2 | 4 | oui |
| carbon | Radio | 90.3% | 26 | 2 | 3 | oui |
| carbon | Toggle | 51.6% | 16 | 0 | 15 | oui |
| carbon | Tag | 58.1% | 18 | 0 | 13 | oui |
| carbon | Alert | 41.9% | 9 | 4 | 18 | oui |
| carbon | Accordion | 74.2% | 23 | 0 | 8 | oui |
| carbon | Breadcrumb | 100% | 30 | 1 | 0 | oui |
| carbon | Pagination | 100% | 31 | 0 | 0 | oui |
| carbon | Card | 93.5% | 29 | 0 | 2 | oui |
| carbon | Tabs | 93.1% | 27 | 0 | 2 | oui |

## Récapitulatif global

- **Fidélité globale : 83.1%** (1019 `=`, 36 `~`, 214 `≠` sur 1269 propriétés mesurées).
- **Couverture : 41 paires composant×thème mesurées.**
- **Écarts nets restants : 214**

  - dsfr/Button: box width (Δ2.0px)
  - dsfr/Button: box height (Δ2.0px)
  - dsfr/Button: color (rgb(255,255,255) vs rgb(245,245,254))
  - dsfr/ButtonDisabled: box width (Δ2.0px)
  - dsfr/ButtonDisabled: box height (Δ2.0px)
  - dsfr/ButtonDisabled: background-color (rgb(0,0,145) vs rgb(229,229,229))
  - dsfr/ButtonDisabled: color (rgb(255,255,255) vs rgb(146,146,146))
  - dsfr/Input: box width (Δ47.0px)
  - dsfr/InputError: box width (Δ47.0px)
  - dsfr/InputDisabled: box width (Δ47.0px)
  - dsfr/InputDisabled: background-color (rgb(246,246,246) vs rgb(238,238,238))
  - dsfr/Textarea: padding-top (Δ2.0px)
  - dsfr/Textarea: padding-bottom (Δ2.0px)
  - dsfr/Textarea: box width (Δ47.0px)
  - dsfr/Textarea: box height (Δ8.0px)
  - dsfr/Select: box width (Δ47.0px)
  - dsfr/Search: radius topLeft (Δ-4.0px)
  - dsfr/Search: padding-top (Δ-8.0px)
  - dsfr/Search: padding-right (Δ-16.0px)
  - dsfr/Search: padding-bottom (Δ-8.0px)
  - dsfr/Search: padding-left (Δ-16.0px)
  - dsfr/Search: box width (Δ87.0px)
  - dsfr/Search: line-height (normal vs 24px)
  - dsfr/Link: text-decoration (underline vs none)
  - dsfr/Checkbox: box width (Δ-70.2px)
  - dsfr/Checkbox: box height (Δ-21.0px)
  - dsfr/Checkbox: line-height (normal vs 24px)
  - dsfr/Checkbox: color (rgb(58,58,58) vs rgb(22,22,22))
  - dsfr/Radio: padding-left (Δ-32.0px)
  - dsfr/Radio: box width (Δ67.7px)
  - dsfr/Radio: line-height (normal vs 24px)
  - dsfr/Radio: color (rgb(58,58,58) vs rgb(22,22,22))
  - dsfr/Toggle: radius topLeft (Δ999.0px)
  - dsfr/Toggle: radius topRight (Δ999.0px)
  - dsfr/Toggle: radius bottomRight (Δ999.0px)
  - dsfr/Toggle: radius bottomLeft (Δ999.0px)
  - dsfr/Toggle: padding-top (Δ2.0px)
  - dsfr/Toggle: padding-right (Δ2.0px)
  - dsfr/Toggle: padding-bottom (Δ2.0px)
  - dsfr/Toggle: padding-left (Δ2.0px)
  - dsfr/Toggle: box width (Δ-205.0px)
  - dsfr/Toggle: box height (Δ-20.0px)
  - dsfr/Toggle: line-height (normal vs 24px)
  - dsfr/Toggle: background-color (rgb(0,0,145) vs rgb(0,0,0)/a0)
  - dsfr/Toggle: color (rgb(58,58,58) vs rgb(22,22,22))
  - dsfr/Tag: radius topLeft (Δ983.0px)
  - dsfr/Tag: radius topRight (Δ983.0px)
  - dsfr/Tag: radius bottomRight (Δ983.0px)
  - dsfr/Tag: radius bottomLeft (Δ983.0px)
  - dsfr/Tag: padding-right (Δ-2.0px)
  - dsfr/Tag: padding-left (Δ-2.0px)
  - dsfr/Tag: box width (Δ-12.3px)
  - dsfr/Tag: box height (Δ-12.0px)
  - dsfr/Tag: font-size (Δ-2.0px)
  - dsfr/Tag: font-weight (600 vs 400)
  - dsfr/Tag: line-height (Δ-12.0px)
  - dsfr/Tag: background-color (rgb(246,246,246) vs rgb(238,238,238))
  - dsfr/Tag: color (rgb(102,102,102) vs rgb(22,22,22))
  - dsfr/Badge: radius topLeft (Δ995.0px)
  - dsfr/Badge: radius topRight (Δ995.0px)
  - dsfr/Badge: radius bottomRight (Δ995.0px)
  - dsfr/Badge: radius bottomLeft (Δ995.0px)
  - dsfr/Badge: padding-top (Δ4.0px)
  - dsfr/Badge: padding-bottom (Δ4.0px)
  - dsfr/Badge: box width (Δ-20.8px)
  - dsfr/Badge: box height (Δ-4.0px)
  - dsfr/Badge: font-size (Δ-2.0px)
  - dsfr/Badge: font-weight (650 vs 700)
  - dsfr/Badge: line-height (Δ-12.0px)
  - dsfr/Badge: text-transform (none vs uppercase)
  - dsfr/Badge: background-color (color(srgb 0.86 0.914353 0.971451) vs rgb(238,238,238))
  - dsfr/Badge: color (rgb(0,99,203) vs rgb(58,58,58))
  - dsfr/Alert: border-top style (solid vs none)
  - dsfr/Alert: border-top color (rgb(238,238,238) vs rgb(58,58,58))
  - dsfr/Alert: border-right style (solid vs none)
  - dsfr/Alert: border-right color (rgb(238,238,238) vs rgb(58,58,58))
  - dsfr/Alert: border-bottom style (solid vs none)
  - dsfr/Alert: border-bottom color (rgb(238,238,238) vs rgb(58,58,58))
  - dsfr/Alert: border-left width (Δ4.0px)
  - dsfr/Alert: border-left style (solid vs none)
  - dsfr/Alert: border-left color (rgb(0,99,203) vs rgb(58,58,58))
  - dsfr/Alert: padding-right (Δ-20.0px)
  - dsfr/Alert: padding-bottom (Δ4.0px)
  - dsfr/Alert: padding-left (Δ-40.0px)
  - dsfr/Alert: box width (Δ23.2px)
  - dsfr/Alert: box height (Δ-26.0px)
  - dsfr/Alert: line-height (normal vs 24px)
  - dsfr/Alert: background-color (rgb(255,255,255) vs rgb(0,0,0)/a0)
  - dsfr/Accordion: padding-top (Δ2.0px)
  - dsfr/Accordion: padding-right (Δ-8.0px)
  - dsfr/Accordion: padding-bottom (Δ2.0px)
  - dsfr/Accordion: padding-left (Δ-8.0px)
  - dsfr/Accordion: box width (Δ28.0px)
  - dsfr/Accordion: box height (Δ8.0px)
  - dsfr/Accordion: font-size (Δ2.7px)
  - dsfr/Accordion: font-weight (600 vs 500)
  - dsfr/Accordion: line-height (normal vs 24px)
  - dsfr/Accordion: color (rgb(58,58,58) vs rgb(0,0,145))
  - dsfr/Breadcrumb: box height (Δ2.0px)
  - dsfr/Card: padding-top (Δ15.0px)
  - dsfr/Card: padding-right (Δ15.0px)
  - dsfr/Card: padding-bottom (Δ15.0px)
  - dsfr/Card: padding-left (Δ15.0px)
  - dsfr/Card: box width (Δ15.0px)
  - dsfr/Card: box height (Δ-23.6px)
  - dsfr/Quote: border-left width (Δ4.0px)
  - dsfr/Quote: border-left style (solid vs none)
  - dsfr/Quote: border-left color (rgb(0,0,145) vs rgb(58,58,58))
  - dsfr/Quote: padding-top (Δ8.0px)
  - dsfr/Quote: padding-right (Δ-8.0px)
  - dsfr/Quote: padding-bottom (Δ-24.0px)
  - dsfr/Quote: padding-left (Δ8.0px)
  - dsfr/Quote: box width (Δ28.0px)
  - dsfr/Quote: box height (Δ-101.4px)
  - dsfr/Quote: line-height (normal vs 24px)
  - dsfr/Highlight: border-left width (Δ4.0px)
  - dsfr/Highlight: border-left style (solid vs none)
  - dsfr/Highlight: border-left color (rgb(0,0,145) vs rgb(58,58,58))
  - dsfr/Highlight: padding-top (Δ16.0px)
  - dsfr/Highlight: padding-right (Δ16.0px)
  - dsfr/Highlight: padding-bottom (Δ16.0px)
  - dsfr/Highlight: padding-left (Δ-4.0px)
  - dsfr/Highlight: box width (Δ28.0px)
  - dsfr/Highlight: box height (Δ63.3px)
  - dsfr/Highlight: line-height (normal vs 24px)
  - dsfr/Highlight: background-color (rgb(246,246,246) vs rgb(0,0,0)/a0)
  - carbon/ButtonDisabled: border-top color (rgb(0,0,0)/a0 vs rgb(198,198,198))
  - carbon/ButtonDisabled: border-right color (rgb(0,0,0)/a0 vs rgb(198,198,198))
  - carbon/ButtonDisabled: border-bottom color (rgb(0,0,0)/a0 vs rgb(198,198,198))
  - carbon/ButtonDisabled: border-left color (rgb(0,0,0)/a0 vs rgb(198,198,198))
  - carbon/ButtonDisabled: background-color (rgb(15,98,254) vs rgb(198,198,198))
  - carbon/ButtonDisabled: color (rgb(255,255,255) vs rgb(141,141,141))
  - carbon/Input: box width (Δ47.0px)
  - carbon/InputError: border-bottom color (rgb(218,30,40) vs rgb(141,141,141))
  - carbon/InputError: padding-right (Δ-24.0px)
  - carbon/InputError: box width (Δ47.0px)
  - carbon/InputDisabled: border-bottom color (rgb(141,141,141) vs rgb(0,0,0)/a0)
  - carbon/InputDisabled: box width (Δ47.0px)
  - carbon/InputDisabled: color (rgb(111,111,111) vs rgb(198,198,198))
  - carbon/Textarea: box width (Δ47.0px)
  - carbon/Textarea: box height (Δ13.0px)
  - carbon/Textarea: line-height (Δ-2.0px)
  - carbon/Select: box width (Δ47.0px)
  - carbon/Search: padding-right (Δ-40.0px)
  - carbon/Search: padding-left (Δ-40.0px)
  - carbon/Search: box width (Δ47.0px)
  - carbon/Search: font-size (Δ2.0px)
  - carbon/Search: line-height (normal vs 18.0001px)
  - carbon/Search: letter-spacing (normal vs 0.16px)
  - carbon/Checkbox: padding-left (Δ-6.0px)
  - carbon/Checkbox: box height (Δ-2.0px)
  - carbon/Checkbox: line-height (normal vs 18.0001px)
  - carbon/Checkbox: letter-spacing (normal vs 0.16px)
  - carbon/Radio: box width (Δ67.3px)
  - carbon/Radio: line-height (normal vs 20px)
  - carbon/Radio: letter-spacing (normal vs 0.16px)
  - carbon/Toggle: radius topLeft (Δ999.0px)
  - carbon/Toggle: radius topRight (Δ999.0px)
  - carbon/Toggle: radius bottomRight (Δ999.0px)
  - carbon/Toggle: radius bottomLeft (Δ999.0px)
  - carbon/Toggle: padding-top (Δ2.0px)
  - carbon/Toggle: padding-right (Δ2.0px)
  - carbon/Toggle: padding-bottom (Δ2.0px)
  - carbon/Toggle: padding-left (Δ2.0px)
  - carbon/Toggle: box width (Δ-12.0px)
  - carbon/Toggle: box height (Δ-4.0px)
  - carbon/Toggle: font-size (Δ4.0px)
  - carbon/Toggle: line-height (normal vs 16px)
  - carbon/Toggle: letter-spacing (normal vs 0.32px)
  - carbon/Toggle: background-color (rgb(15,98,254) vs rgb(0,0,0)/a0)
  - carbon/Toggle: color (rgb(22,22,22) vs rgb(82,82,82))
  - carbon/Tag: radius topLeft (Δ984.0px)
  - carbon/Tag: radius topRight (Δ984.0px)
  - carbon/Tag: radius bottomRight (Δ984.0px)
  - carbon/Tag: radius bottomLeft (Δ984.0px)
  - carbon/Tag: padding-right (Δ2.0px)
  - carbon/Tag: padding-left (Δ2.0px)
  - carbon/Tag: box width (Δ3.7px)
  - carbon/Tag: box height (Δ-4.0px)
  - carbon/Tag: font-weight (600 vs 400)
  - carbon/Tag: line-height (Δ-4.0px)
  - carbon/Tag: letter-spacing (normal vs 0.32px)
  - carbon/Tag: background-color (rgb(244,244,244) vs rgb(224,224,224))
  - carbon/Tag: color (rgb(82,82,82) vs rgb(57,57,57))
  - carbon/Alert: border-top style (solid vs none)
  - carbon/Alert: border-top color (rgb(224,224,224) vs rgb(255,255,255))
  - carbon/Alert: border-right style (solid vs none)
  - carbon/Alert: border-right color (rgb(224,224,224) vs rgb(255,255,255))
  - carbon/Alert: border-bottom style (solid vs none)
  - carbon/Alert: border-bottom color (rgb(224,224,224) vs rgb(255,255,255))
  - carbon/Alert: border-left color (rgb(0,67,206) vs rgb(69,137,255))
  - carbon/Alert: padding-top (Δ16.0px)
  - carbon/Alert: padding-right (Δ16.0px)
  - carbon/Alert: padding-bottom (Δ16.0px)
  - carbon/Alert: padding-left (Δ16.0px)
  - carbon/Alert: box width (Δ-66.8px)
  - carbon/Alert: box height (Δ12.0px)
  - carbon/Alert: font-size (Δ2.0px)
  - carbon/Alert: line-height (normal vs 14px)
  - carbon/Alert: letter-spacing (normal vs 0.16px)
  - carbon/Alert: background-color (rgb(255,255,255) vs rgb(57,57,57))
  - carbon/Alert: color (rgb(22,22,22) vs rgb(255,255,255))
  - carbon/Accordion: padding-top (Δ4.0px)
  - carbon/Accordion: padding-right (Δ8.0px)
  - carbon/Accordion: padding-bottom (Δ4.0px)
  - carbon/Accordion: padding-left (Δ8.0px)
  - carbon/Accordion: box width (Δ28.0px)
  - carbon/Accordion: box height (Δ12.0px)
  - carbon/Accordion: font-size (Δ5.4px)
  - carbon/Accordion: font-weight (600 vs 400)
  - carbon/Card: box width (Δ15.0px)
  - carbon/Card: box height (Δ-27.6px)
  - carbon/Tabs: border-bottom color (rgb(15,98,254) vs rgb(224,224,224))
  - carbon/Tabs: color (rgb(22,22,22) vs rgb(82,82,82))

