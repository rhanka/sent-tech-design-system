# Rapport de fidélité — pixel-perfect par bord

Comparaison **bord par bord** de NOS composants mappés vs les **vrais composants officiels** DSFR / Carbon.
Toutes les valeurs proviennent des **styles calculés réels** (computed styles) ; aucune n'est inventée.

| Champ | Valeur |
|---|---|
| Date | 2026-06-02 |
| Navigateur | Google Chrome système (`/usr/bin/google-chrome`) via puppeteer-core, headless |
| URL mesurée | http://0.0.0.0:40187/compare (build statique servi) |
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
| radius topLeft | 4px | 4px | = |
| radius topRight | 4px | 0px | ≠ Δ4.0px |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 8px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 320px | 233px | ≠ Δ87.0px |
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

**Fidélité Search (dsfr) : 93.5%** — 29 `=`, 0 `~`, 2 `≠` sur 31 propriétés.

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
| box width | 182.2px | 241px | ≠ Δ-58.8px |
| box height | 24px | 44px | ≠ Δ-20.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Checkbox (dsfr) : 93.5%** — 29 `=`, 0 `~`, 2 `≠` sur 31 propriétés.

### Radio

- Notre sélecteur : `.cmp-scope--dsfr .st-choice__label`
- Référence : iframe `.cmp-cell--ref` → `.fr-radio-group label`
- ⚠ Idem checkbox : contrôle en pseudo-élément. On compare le label (`.fr-radio-group label`).

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
| padding-left | 0px | 32px | ≠ Δ-32.0px |
| box width | 182.2px | 103.1px | ≠ Δ79.1px |
| box height | 24px | 24px | = |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Radio (dsfr) : 93.5%** — 29 `=`, 0 `~`, 2 `≠` sur 31 propriétés.

### Toggle

- Notre sélecteur : `.cmp-scope--dsfr .st-toggle__track`
- Référence : iframe `.cmp-cell--ref` → `.fr-toggle__label`
- ⚠ L'interrupteur DSFR est dessiné en `::before/::after` sur le label. On compare le label (`.fr-toggle__label`) — typo/couleur comparables.

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
| radius topLeft | 999px | 0px | ≠ Δ999.0px |
| radius topRight | 999px | 0px | ≠ Δ999.0px |
| radius bottomRight | 999px | 0px | ≠ Δ999.0px |
| radius bottomLeft | 999px | 0px | ≠ Δ999.0px |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 36px | 241px | ≠ Δ-205.0px |
| box height | 20px | 40px | ≠ Δ-20.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(0, 0, 145) | rgba(0, 0, 0, 0) | ≠ rgb(0,0,145) vs rgb(0,0,0)/a0 |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Toggle (dsfr) : 77.4%** — 24 `=`, 0 `~`, 7 `≠` sur 31 propriétés.

### Tag

- Notre sélecteur : `.cmp-scope--dsfr .st-tag`
- Référence : iframe `.cmp-cell--ref` → `.fr-tag`

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
| radius topLeft | 16px | 16px | = |
| radius topRight | 16px | 16px | = |
| radius bottomRight | 16px | 16px | = |
| radius bottomLeft | 16px | 16px | = |
| padding-top | 4px | 4px | = |
| padding-right | 12px | 12px | = |
| padding-bottom | 4px | 4px | = |
| padding-left | 12px | 12px | = |
| box width | 87px | 87px | = |
| box height | 32px | 32px | = |
| font-family | Marianne | Marianne | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Tag (dsfr) : 100%** — 31 `=`, 0 `~`, 0 `≠` sur 31 propriétés.

### Badge

- Notre sélecteur : `.cmp-scope--dsfr .st-badge`
- Référence : iframe `.cmp-cell--ref` → `.fr-badge`

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
| radius bottomRight | 4px | 4px | = |
| radius bottomLeft | 4px | 4px | = |
| padding-top | 0px | 0px | = |
| padding-right | 8px | 8px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 8px | 8px | = |
| box width | 89px | 89px | = |
| box height | 24px | 24px | = |
| font-family | Marianne | Marianne | = |
| font-size | 14px | 14px | = |
| font-weight | 700 | 700 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | uppercase | uppercase | = |
| text-decoration | none | none | = |
| background-color | rgb(238, 238, 238) | rgb(238, 238, 238) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Badge (dsfr) : 100%** — 31 `=`, 0 `~`, 0 `≠` sur 31 propriétés.

### Alert

- Notre sélecteur : `.cmp-scope--dsfr .st-alert`
- Référence : iframe `.cmp-cell--ref` → `.fr-alert`

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
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgb(0, 99, 203) | rgb(58, 58, 58) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 16px | 16px | = |
| padding-right | 36px | 36px | = |
| padding-bottom | 12px | 12px | = |
| padding-left | 56px | 56px | = |
| box width | 301px | 273px | ≠ Δ28.0px |
| box height | 98px | 108px | ≠ Δ-10.0px |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 400 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(58, 58, 58) | rgb(58, 58, 58) | = |

**Fidélité Alert (dsfr) : 93.5%** — 29 `=`, 0 `~`, 2 `≠` sur 31 propriétés.

### Accordion

- Notre sélecteur : `.cmp-scope--dsfr .st-accordion__trigger`
- Référence : iframe `.cmp-cell--ref` → `.fr-accordion__btn`

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
| padding-top | 12px | 12px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 12px | 12px | = |
| padding-left | 16px | 16px | = |
| box width | 301px | 273px | ≠ Δ28.0px |
| box height | 48px | 48px | = |
| font-family | Marianne | Marianne | = |
| font-size | 16px | 16px | = |
| font-weight | 500 | 500 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(0, 0, 145) | rgb(0, 0, 145) | = |

**Fidélité Accordion (dsfr) : 96.8%** — 30 `=`, 0 `~`, 1 `≠` sur 31 propriétés.

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
| padding-right | 40px | 40px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 40px | 40px | = |
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

**Fidélité Search (carbon) : 96.8%** — 29 `=`, 1 `~`, 1 `≠` sur 31 propriétés.

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
| box width | 117.7px | 123.7px | ≠ Δ-6.0px |
| box height | 18px | 21px | ≠ Δ-3.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 18px | 18.0001px | ~ Δ0.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Checkbox (carbon) : 90.3%** — 27 `=`, 1 `~`, 3 `≠` sur 31 propriétés.

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
| box width | 117.7px | 55.7px | ≠ Δ62.0px |
| box height | 18px | 20px | ≠ Δ-2.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 18px | 20px | ≠ Δ-2.0px |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Radio (carbon) : 90.3%** — 28 `=`, 0 `~`, 3 `≠` sur 31 propriétés.

### Toggle

- Notre sélecteur : `.cmp-scope--carbon .st-toggle__track`
- Référence : iframe `.cmp-cell--ref` → `.bx--toggle__switch`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(82, 82, 82) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(82, 82, 82) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(82, 82, 82) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(82, 82, 82) | rgb(82, 82, 82) | = (bord 0px (invisible)) |
| radius topLeft | 999px | 0px | ≠ Δ999.0px |
| radius topRight | 999px | 0px | ≠ Δ999.0px |
| radius bottomRight | 999px | 0px | ≠ Δ999.0px |
| radius bottomLeft | 999px | 0px | ≠ Δ999.0px |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 48px | 48px | = |
| box height | 24px | 24px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 12px | 12px | = |
| font-weight | 400 | 400 | = |
| line-height | 16px | 16px | = |
| letter-spacing | 0.32px | 0.32px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(15, 98, 254) | rgba(0, 0, 0, 0) | ≠ rgb(15,98,254) vs rgb(0,0,0)/a0 |
| color | rgb(82, 82, 82) | rgb(82, 82, 82) | = |

**Fidélité Toggle (carbon) : 83.9%** — 26 `=`, 0 `~`, 5 `≠` sur 31 propriétés.

### Tag

- Notre sélecteur : `.cmp-scope--carbon .st-tag`
- Référence : iframe `.cmp-cell--ref` → `.bx--tag`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(57, 57, 57) | rgb(57, 57, 57) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(57, 57, 57) | rgb(57, 57, 57) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(57, 57, 57) | rgb(57, 57, 57) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(57, 57, 57) | rgb(57, 57, 57) | = (bord 0px (invisible)) |
| radius topLeft | 15px | 15px | = |
| radius topRight | 15px | 15px | = |
| radius bottomRight | 15px | 15px | = |
| radius bottomLeft | 15px | 15px | = |
| padding-top | 4px | 4px | = |
| padding-right | 8px | 8px | = |
| padding-bottom | 4px | 4px | = |
| padding-left | 8px | 8px | = |
| box width | 35.7px | 35.7px | = |
| box height | 24px | 24px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 12px | 12px | = |
| font-weight | 400 | 400 | = |
| line-height | 16px | 16px | = |
| letter-spacing | 0.32px | 0.32px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(224, 224, 224) | rgb(224, 224, 224) | = |
| color | rgb(57, 57, 57) | rgb(57, 57, 57) | = |

**Fidélité Tag (carbon) : 100%** — 31 `=`, 0 `~`, 0 `≠` sur 31 propriétés.

### Alert

- Notre sélecteur : `.cmp-scope--carbon .st-alert`
- Référence : iframe `.cmp-cell--ref` → `.bx--inline-notification`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(255, 255, 255) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(255, 255, 255) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(255, 255, 255) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-left width | 3px | 3px | = |
| border-left style | solid | solid | = |
| border-left color | rgb(69, 137, 255) | rgb(69, 137, 255) | = |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 191.6px | 288px | ≠ Δ-96.4px |
| box height | 39px | 66px | ≠ Δ-27.0px |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 14px | 14px | = |
| letter-spacing | 0.16px | 0.16px | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(57, 57, 57) | rgb(57, 57, 57) | = |
| color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |

**Fidélité Alert (carbon) : 93.5%** — 29 `=`, 0 `~`, 2 `≠` sur 31 propriétés.

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
| padding-top | 10px | 10px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 10px | 10px | = |
| padding-left | 0px | 0px | = |
| box width | 301px | 273px | ≠ Δ28.0px |
| box height | 40px | 40px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 13.3333px | 13.3333px | = |
| font-weight | 400 | 400 | = |
| line-height | normal | normal | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(22, 22, 22) | rgb(22, 22, 22) | = |

**Fidélité Accordion (carbon) : 96.8%** — 30 `=`, 0 `~`, 1 `≠` sur 31 propriétés.

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

## Thème : airbus

### Button

- Notre sélecteur : `.cmp-scope--airbus .st-button`
- Référence : iframe `.cmp-cell--ref` → `.ds-button--primary`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 2px | 0px | ≠ Δ2.0px |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-right width | 2px | 0px | ≠ Δ2.0px |
| border-right style | solid | none | = (bord 0px (invisible)) |
| border-right color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-bottom width | 2px | 0px | ≠ Δ2.0px |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-left width | 2px | 0px | ≠ Δ2.0px |
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| radius topLeft | 3px | 3px | = |
| radius topRight | 3px | 3px | = |
| radius bottomRight | 3px | 3px | = |
| radius bottomLeft | 3px | 3px | = |
| padding-top | 6px | 6px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 6px | 6px | = |
| padding-left | 16px | 16px | = |
| box width | 88.2px | 84.2px | ≠ Δ4.0px |
| box height | 40px | 36px | ≠ Δ4.0px |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 700 | 700 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(0, 32, 91) | rgb(0, 32, 91) | = |
| color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |

**Fidélité Button (airbus) : 80.6%** — 25 `=`, 0 `~`, 6 `≠` sur 31 propriétés.

### ButtonDisabled

- Notre sélecteur : `.cmp-scope--airbus .st-button:disabled`
- Référence : iframe `.cmp-cell--ref` → `.ds-button--primary:disabled`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 2px | 0px | ≠ Δ2.0px |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-right width | 2px | 0px | ≠ Δ2.0px |
| border-right style | solid | none | = (bord 0px (invisible)) |
| border-right color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-bottom width | 2px | 0px | ≠ Δ2.0px |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-left width | 2px | 0px | ≠ Δ2.0px |
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| radius topLeft | 3px | 3px | = |
| radius topRight | 3px | 3px | = |
| radius bottomRight | 3px | 3px | = |
| radius bottomLeft | 3px | 3px | = |
| padding-top | 6px | 6px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 6px | 6px | = |
| padding-left | 16px | 16px | = |
| box width | 94.4px | 90.4px | ≠ Δ4.0px |
| box height | 40px | 36px | ≠ Δ4.0px |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 700 | 700 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(0, 32, 91) | rgb(0, 32, 91) | = |
| color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |

**Fidélité ButtonDisabled (airbus) : 80.6%** — 25 `=`, 0 `~`, 6 `≠` sur 31 propriétés.

### Input

- Notre sélecteur : `.cmp-scope--airbus .st-control`
- Référence : iframe `.cmp-cell--ref` → `.ds-input`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 3px | 3px | = |
| radius topRight | 3px | 3px | = |
| radius bottomRight | 3px | 0px | ≠ Δ3.0px |
| radius bottomLeft | 3px | 0px | ≠ Δ3.0px |
| padding-top | 8px | 8px | = |
| padding-right | 8px | 8px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 8px | 8px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 20px | 20px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(250, 250, 250) | rgb(250, 250, 250) | = |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Input (airbus) : 90.3%** — 28 `=`, 0 `~`, 3 `≠` sur 31 propriétés.

### InputError

- Notre sélecteur : `.cmp-scope--airbus .st-control[aria-invalid="true"]`
- Référence : iframe `.cmp-cell--ref` → `.ds-input--invalid`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(228, 0, 43) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(228, 0, 43) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(228, 0, 43) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(228, 0, 43) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 3px | 3px | = |
| radius topRight | 3px | 3px | = |
| radius bottomRight | 3px | 0px | ≠ Δ3.0px |
| radius bottomLeft | 3px | 0px | ≠ Δ3.0px |
| padding-top | 8px | 8px | = |
| padding-right | 8px | 8px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 8px | 8px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 20px | 20px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(250, 250, 250) | rgb(250, 250, 250) | = |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité InputError (airbus) : 90.3%** — 28 `=`, 0 `~`, 3 `≠` sur 31 propriétés.

### InputDisabled

- Notre sélecteur : `.cmp-scope--airbus .st-control:disabled`
- Référence : iframe `.cmp-cell--ref` → `.ds-input:disabled`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(145, 156, 176) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(145, 156, 176) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(145, 156, 176) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(145, 156, 176) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 3px | 3px | = |
| radius topRight | 3px | 3px | = |
| radius bottomRight | 3px | 0px | ≠ Δ3.0px |
| radius bottomLeft | 3px | 0px | ≠ Δ3.0px |
| padding-top | 8px | 8px | = |
| padding-right | 8px | 8px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 8px | 8px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 20px | 20px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(250, 250, 250) | rgb(250, 250, 250) | = |
| color | rgb(145, 156, 176) | rgb(20, 23, 29) | ≠ rgb(145,156,176) vs rgb(20,23,29) |

**Fidélité InputDisabled (airbus) : 87.1%** — 27 `=`, 0 `~`, 4 `≠` sur 31 propriétés.

### Textarea

- Notre sélecteur : `.cmp-scope--airbus .st-textarea`
- Référence : iframe `.cmp-cell--ref` → `textarea.ds-textarea`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 3px | 3px | = |
| radius topRight | 3px | 3px | = |
| radius bottomRight | 3px | 0px | ≠ Δ3.0px |
| radius bottomLeft | 3px | 0px | ≠ Δ3.0px |
| padding-top | 10px | 8px | ≠ Δ2.0px |
| padding-right | 8px | 8px | = |
| padding-bottom | 10px | 8px | ≠ Δ2.0px |
| padding-left | 8px | 8px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 96px | 76px | ≠ Δ20.0px |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 20px | 20px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(250, 250, 250) | rgb(250, 250, 250) | = |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Textarea (airbus) : 80.6%** — 25 `=`, 0 `~`, 6 `≠` sur 31 propriétés.

### Select

- Notre sélecteur : `.cmp-scope--airbus .st-select`
- Référence : iframe `.cmp-cell--ref` → `.ds-select`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 3px | 3px | = |
| radius topRight | 3px | 3px | = |
| radius bottomRight | 3px | 0px | ≠ Δ3.0px |
| radius bottomLeft | 3px | 0px | ≠ Δ3.0px |
| padding-top | 8px | 8px | = |
| padding-right | 8px | 32px | ≠ Δ-24.0px |
| padding-bottom | 8px | 8px | = |
| padding-left | 8px | 8px | = |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 20px | 20px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(250, 250, 250) | rgb(250, 250, 250) | = |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Select (airbus) : 87.1%** — 27 `=`, 0 `~`, 4 `≠` sur 31 propriétés.

### Search

- Notre sélecteur : `.cmp-scope--airbus .st-search`
- Référence : iframe `.cmp-cell--ref` → `.ds-input.ds-input--adorned-start`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 3px | 3px | = |
| radius topRight | 3px | 3px | = |
| radius bottomRight | 3px | 0px | ≠ Δ3.0px |
| radius bottomLeft | 3px | 0px | ≠ Δ3.0px |
| padding-top | 8px | 8px | = |
| padding-right | 40px | 8px | ≠ Δ32.0px |
| padding-bottom | 8px | 8px | = |
| padding-left | 40px | 36px | ≠ Δ4.0px |
| box width | 320px | 273px | ≠ Δ47.0px |
| box height | 40px | 40px | = |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 20px | 20px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(250, 250, 250) | rgb(250, 250, 250) | = |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Search (airbus) : 83.9%** — 26 `=`, 0 `~`, 5 `≠` sur 31 propriétés.

### Link

- Notre sélecteur : `.cmp-scope--airbus .st-link`
- Référence : iframe `.cmp-cell--ref` → `.ds-link`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(37, 95, 204) | rgb(37, 95, 204) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(37, 95, 204) | rgb(37, 95, 204) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(37, 95, 204) | rgb(37, 95, 204) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(37, 95, 204) | rgb(37, 95, 204) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 3px | ≠ Δ-3.0px |
| radius topRight | 0px | 3px | ≠ Δ-3.0px |
| radius bottomRight | 0px | 3px | ≠ Δ-3.0px |
| radius bottomLeft | 0px | 3px | ≠ Δ-3.0px |
| padding-top | 0px | 3px | ≠ Δ-3.0px |
| padding-right | 0px | 8px | ≠ Δ-8.0px |
| padding-bottom | 0px | 3px | ≠ Δ-3.0px |
| padding-left | 0px | 8px | ≠ Δ-8.0px |
| box width | 66.7px | 89.8px | ≠ Δ-23.1px |
| box height | 18px | 24px | ≠ Δ-6.0px |
| font-family | Inter | Inter | = |
| font-size | 16px | 16px | = |
| font-weight | 400 | 700 | ≠ 400 vs 700 |
| line-height | normal | normal | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | underline | underline | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(37, 95, 204) | rgb(37, 95, 204) | = |

**Fidélité Link (airbus) : 64.5%** — 20 `=`, 0 `~`, 11 `≠` sur 31 propriétés.

### Checkbox

- Notre sélecteur : `.cmp-scope--airbus .st-choice__label`
- Référence : iframe `.cmp-cell--ref` → `.ds-checkbox-label`
- ⚠ Airbus draws the checkbox control in pseudo-elements on the label. Measuring `.ds-checkbox-label` for comparable text/box metrics.

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 111.3px | 135.3px | ≠ Δ-24.0px |
| box height | 16px | 16px | = |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 16px | 16px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Checkbox (airbus) : 96.8%** — 30 `=`, 0 `~`, 1 `≠` sur 31 propriétés.

### Radio

- Notre sélecteur : `.cmp-scope--airbus .st-choice__label`
- Référence : iframe `.cmp-cell--ref` → `.ds-radio-label`
- ⚠ Airbus draws the radio control in pseudo-elements on the label. Measuring `.ds-radio-label` for comparable text/box metrics.

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 111.3px | 77.7px | ≠ Δ33.6px |
| box height | 16px | 16px | = |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 16px | 16px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Radio (airbus) : 96.8%** — 30 `=`, 0 `~`, 1 `≠` sur 31 propriétés.

### Toggle

- Notre sélecteur : `.cmp-scope--airbus .st-toggle__track`
- Référence : iframe `.cmp-cell--ref` → `.ds-toggle-label`
- ⚠ Airbus toggle is painted through the label pseudo-elements. The selector measures the styled label wrapper.

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 48px | ≠ Δ-48.0px |
| box width | 48px | 169.4px | ≠ Δ-121.4px |
| box height | 24px | 24px | = |
| font-family | Inter | Inter | = |
| font-size | 16px | 14px | ≠ Δ2.0px |
| font-weight | 400 | 400 | = |
| line-height | 24px | 20px | ≠ Δ4.0px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(0, 32, 91) | rgba(0, 0, 0, 0) | ≠ rgb(0,32,91) vs rgb(0,0,0)/a0 |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Toggle (airbus) : 83.9%** — 26 `=`, 0 `~`, 5 `≠` sur 31 propriétés.

### Tag

- Notre sélecteur : `.cmp-scope--airbus .st-tag`
- Référence : iframe `.cmp-cell--ref` → `.ds-chip`
- ⚠ Airbus' closest tag equivalent is Chip.

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 12px | 12px | = |
| radius topRight | 12px | 12px | = |
| radius bottomRight | 12px | 12px | = |
| radius bottomLeft | 12px | 12px | = |
| padding-top | 0px | 0px | = |
| padding-right | 12px | 0px | ≠ Δ12.0px |
| padding-bottom | 0px | 0px | = |
| padding-left | 12px | 0px | ≠ Δ12.0px |
| box width | 46.6px | 46.6px | = |
| box height | 24px | 24px | = |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 500 | 500 | = |
| line-height | normal | normal | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(224, 227, 233) | rgb(239, 241, 244) | ≠ rgb(224,227,233) vs rgb(239,241,244) |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Tag (airbus) : 90.3%** — 28 `=`, 0 `~`, 3 `≠` sur 31 propriétés.

### Alert

- Notre sélecteur : `.cmp-scope--airbus .st-alert`
- Référence : iframe `.cmp-cell--ref` → `.ds-toast`
- ⚠ Airbus' closest inline alert equivalent in @airbus/styles is Toast.

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 4px | ≠ Δ-4.0px |
| border-left style | solid | solid | = |
| border-left color | rgb(37, 95, 204) | rgb(37, 95, 204) | = |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 16px | ≠ Δ-8.0px |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 16px | ≠ Δ-8.0px |
| padding-left | 24px | 16px | ≠ Δ8.0px |
| box width | 225.5px | 273px | ≠ Δ-47.5px |
| box height | 61px | 76px | ≠ Δ-15.0px |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 400 | 400 | = |
| line-height | 20px | 20px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Alert (airbus) : 80.6%** — 25 `=`, 0 `~`, 6 `≠` sur 31 propriétés.

### Accordion

- Notre sélecteur : `.cmp-scope--airbus .st-accordion__trigger`
- Référence : iframe `.cmp-cell--ref` → `.ds-collapsible-button`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(20, 23, 29) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 12px | ≠ Δ-4.0px |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 12px | ≠ Δ-4.0px |
| padding-left | 16px | 16px | = |
| box width | 301px | 273px | ≠ Δ28.0px |
| box height | 40px | 48px | ≠ Δ-8.0px |
| font-family | Inter | Inter | = |
| font-size | 16px | 14px | ≠ Δ2.0px |
| font-weight | 700 | 700 | = |
| line-height | 24px | 20px | ≠ Δ4.0px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | ≠ rgb(0,0,0)/a0 vs rgb(255,255,255) |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Accordion (airbus) : 77.4%** — 24 `=`, 0 `~`, 7 `≠` sur 31 propriétés.

### Breadcrumb

- Notre sélecteur : `.cmp-scope--airbus .st-breadcrumb a`
- Référence : iframe `.cmp-cell--ref` → `.ds-breadcrumb-item .ds-link`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | none | none | = (bord 0px (invisible)) |
| border-top color | rgb(37, 95, 204) | rgb(37, 95, 204) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(37, 95, 204) | rgb(37, 95, 204) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | none | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(37, 95, 204) | rgb(37, 95, 204) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(37, 95, 204) | rgb(37, 95, 204) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 3px | ≠ Δ-3.0px |
| radius topRight | 0px | 3px | ≠ Δ-3.0px |
| radius bottomRight | 0px | 3px | ≠ Δ-3.0px |
| radius bottomLeft | 0px | 3px | ≠ Δ-3.0px |
| padding-top | 0px | 3px | ≠ Δ-3.0px |
| padding-right | 0px | 8px | ≠ Δ-8.0px |
| padding-bottom | 0px | 3px | ≠ Δ-3.0px |
| padding-left | 0px | 8px | ≠ Δ-8.0px |
| box width | 37.4px | 60.5px | ≠ Δ-23.1px |
| box height | 24px | 26px | ≠ Δ-2.0px |
| font-family | Inter | Inter | = |
| font-size | 14px | 16px | ≠ Δ-2.0px |
| font-weight | 400 | 700 | ≠ 400 vs 700 |
| line-height | 24px | 20px | ≠ Δ4.0px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | underline | ≠ none vs underline |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(37, 95, 204) | rgb(37, 95, 204) | = |

**Fidélité Breadcrumb (airbus) : 54.8%** — 17 `=`, 0 `~`, 14 `≠` sur 31 propriétés.

### Pagination

- Notre sélecteur : `.cmp-scope--airbus .st-pagination__page--active`
- Référence : iframe `.cmp-cell--ref` → `.ds-pagination-item--active`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 2px | 0px | ≠ Δ2.0px |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-right width | 2px | 0px | ≠ Δ2.0px |
| border-right style | solid | none | = (bord 0px (invisible)) |
| border-right color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-bottom width | 2px | 0px | ≠ Δ2.0px |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| border-left width | 2px | 0px | ≠ Δ2.0px |
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgba(0, 0, 0, 0) | rgb(255, 255, 255) | = (bord 0px (invisible)) |
| radius topLeft | 3px | 3px | = |
| radius topRight | 3px | 3px | = |
| radius bottomRight | 3px | 3px | = |
| radius bottomLeft | 3px | 3px | = |
| padding-top | 0px | 6px | ≠ Δ-6.0px |
| padding-right | 0px | 10px | ≠ Δ-10.0px |
| padding-bottom | 0px | 6px | ≠ Δ-6.0px |
| padding-left | 0px | 10px | ≠ Δ-10.0px |
| box width | 32px | 32px | = |
| box height | 32px | 32px | = |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 500 | 700 | ≠ 500 vs 700 |
| line-height | 24px | 20px | ≠ Δ4.0px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgb(0, 32, 91) | ≠ rgb(0,0,0)/a0 vs rgb(0,32,91) |
| color | rgb(20, 23, 29) | rgb(255, 255, 255) | ≠ rgb(20,23,29) vs rgb(255,255,255) |

**Fidélité Pagination (airbus) : 61.3%** — 19 `=`, 0 `~`, 12 `≠` sur 31 propriétés.

### Card

- Notre sélecteur : `.cmp-scope--airbus .st-card`
- Référence : iframe `.cmp-cell--ref` → `.ds-card`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgb(224, 227, 233) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | solid | none | = (bord 0px (invisible)) |
| border-right color | rgb(224, 227, 233) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(224, 227, 233) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | solid | none | = (bord 0px (invisible)) |
| border-left color | rgb(224, 227, 233) | rgb(20, 23, 29) | = (bord 0px (invisible)) |
| radius topLeft | 6px | 6px | = |
| radius topRight | 6px | 6px | = |
| radius bottomRight | 6px | 6px | = |
| radius bottomLeft | 6px | 6px | = |
| padding-top | 16px | 0px | ≠ Δ16.0px |
| padding-right | 16px | 0px | ≠ Δ16.0px |
| padding-bottom | 16px | 0px | ≠ Δ16.0px |
| padding-left | 16px | 0px | ≠ Δ16.0px |
| box width | 288px | 273px | ≠ Δ15.0px |
| box height | 76.4px | 100px | ≠ Δ-23.6px |
| font-family | Inter | Inter | = |
| font-size | 16px | 14px | ≠ Δ2.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 20px | ≠ normal vs 20px |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(255, 255, 255) | rgb(255, 255, 255) | = |
| color | rgb(20, 23, 29) | rgb(20, 23, 29) | = |

**Fidélité Card (airbus) : 74.2%** — 23 `=`, 0 `~`, 8 `≠` sur 31 propriétés.

### Tabs

- Notre sélecteur : `.cmp-scope--airbus .st-tabs__tab[aria-selected="true"]`
- Référence : iframe `.cmp-cell--ref` → `.ds-tab--selected`

| Propriété / Bord | Nous | Référence officielle | Δ / statut |
|---|---|---|---|
| border-top width | 0px | 0px | = |
| border-top style | solid | none | = (bord 0px (invisible)) |
| border-top color | rgb(0, 32, 91) | rgb(0, 32, 91) | = (bord 0px (invisible)) |
| border-right width | 0px | 0px | = |
| border-right style | none | none | = (bord 0px (invisible)) |
| border-right color | rgb(6, 59, 158) | rgb(0, 32, 91) | = (bord 0px (invisible)) |
| border-bottom width | 0px | 0px | = |
| border-bottom style | solid | none | = (bord 0px (invisible)) |
| border-bottom color | rgb(0, 32, 91) | rgb(0, 32, 91) | = (bord 0px (invisible)) |
| border-left width | 0px | 0px | = |
| border-left style | none | none | = (bord 0px (invisible)) |
| border-left color | rgb(6, 59, 158) | rgb(0, 32, 91) | = (bord 0px (invisible)) |
| radius topLeft | 0px | 0px | = |
| radius topRight | 0px | 0px | = |
| radius bottomRight | 0px | 0px | = |
| radius bottomLeft | 0px | 0px | = |
| padding-top | 8px | 8px | = |
| padding-right | 16px | 16px | = |
| padding-bottom | 8px | 8px | = |
| padding-left | 16px | 16px | = |
| box width | 74px | 74px | = |
| box height | 40px | 40px | = |
| font-family | Inter | Inter | = |
| font-size | 14px | 14px | = |
| font-weight | 700 | 700 | = |
| line-height | 24px | 24px | = |
| letter-spacing | normal | normal | = |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | = |
| color | rgb(6, 59, 158) | rgb(0, 32, 91) | ≠ rgb(6,59,158) vs rgb(0,32,91) |

**Fidélité Tabs (airbus) : 96.8%** — 30 `=`, 0 `~`, 1 `≠` sur 31 propriétés.

## Récap de fidélité par composant

Couverture mesurée : **60 paires** (notre composant mappé vs vrai composant officiel).

| Thème | Composant / variant | Fidélité | `=` | `~` | `≠` | Réf stylée ? |
|---|---|---|---|---|---|---|
| dsfr | Button | 90.3% | 24 | 4 | 3 | oui |
| dsfr | ButtonDisabled | 87.1% | 23 | 4 | 4 | oui |
| dsfr | Input | 96.8% | 30 | 0 | 1 | oui |
| dsfr | InputError | 96.8% | 30 | 0 | 1 | oui |
| dsfr | InputDisabled | 93.5% | 29 | 0 | 2 | oui |
| dsfr | Textarea | 87.1% | 27 | 0 | 4 | oui |
| dsfr | Select | 96.8% | 30 | 0 | 1 | oui |
| dsfr | Search | 93.5% | 29 | 0 | 2 | oui |
| dsfr | Link | 96.8% | 30 | 0 | 1 | oui |
| dsfr | Checkbox | 93.5% | 29 | 0 | 2 | oui |
| dsfr | Radio | 93.5% | 29 | 0 | 2 | oui |
| dsfr | Toggle | 77.4% | 24 | 0 | 7 | oui |
| dsfr | Tag | 100% | 31 | 0 | 0 | oui |
| dsfr | Badge | 100% | 31 | 0 | 0 | oui |
| dsfr | Alert | 93.5% | 29 | 0 | 2 | oui |
| dsfr | Accordion | 96.8% | 30 | 0 | 1 | oui |
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
| carbon | Search | 96.8% | 29 | 1 | 1 | oui |
| carbon | Link | 100% | 30 | 1 | 0 | oui |
| carbon | Checkbox | 90.3% | 27 | 1 | 3 | oui |
| carbon | Radio | 90.3% | 28 | 0 | 3 | oui |
| carbon | Toggle | 83.9% | 26 | 0 | 5 | oui |
| carbon | Tag | 100% | 31 | 0 | 0 | oui |
| carbon | Alert | 93.5% | 29 | 0 | 2 | oui |
| carbon | Accordion | 96.8% | 30 | 0 | 1 | oui |
| carbon | Breadcrumb | 100% | 30 | 1 | 0 | oui |
| carbon | Pagination | 100% | 31 | 0 | 0 | oui |
| carbon | Card | 93.5% | 29 | 0 | 2 | oui |
| carbon | Tabs | 93.1% | 27 | 0 | 2 | oui |
| airbus | Button | 80.6% | 25 | 0 | 6 | oui |
| airbus | ButtonDisabled | 80.6% | 25 | 0 | 6 | oui |
| airbus | Input | 90.3% | 28 | 0 | 3 | oui |
| airbus | InputError | 90.3% | 28 | 0 | 3 | oui |
| airbus | InputDisabled | 87.1% | 27 | 0 | 4 | oui |
| airbus | Textarea | 80.6% | 25 | 0 | 6 | oui |
| airbus | Select | 87.1% | 27 | 0 | 4 | oui |
| airbus | Search | 83.9% | 26 | 0 | 5 | oui |
| airbus | Link | 64.5% | 20 | 0 | 11 | oui |
| airbus | Checkbox | 96.8% | 30 | 0 | 1 | oui |
| airbus | Radio | 96.8% | 30 | 0 | 1 | oui |
| airbus | Toggle | 83.9% | 26 | 0 | 5 | oui |
| airbus | Tag | 90.3% | 28 | 0 | 3 | oui |
| airbus | Alert | 80.6% | 25 | 0 | 6 | oui |
| airbus | Accordion | 77.4% | 24 | 0 | 7 | oui |
| airbus | Breadcrumb | 54.8% | 17 | 0 | 14 | oui |
| airbus | Pagination | 61.3% | 19 | 0 | 12 | oui |
| airbus | Card | 74.2% | 23 | 0 | 8 | oui |
| airbus | Tabs | 96.8% | 30 | 0 | 1 | oui |

## Récapitulatif global

- **Fidélité globale : 89.1%** (1631 `=`, 24 `~`, 203 `≠` sur 1858 propriétés mesurées).
- **Couverture : 60 paires composant×thème mesurées.**
- **Écarts nets restants : 203**

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
  - dsfr/Search: radius topRight (Δ4.0px)
  - dsfr/Search: box width (Δ87.0px)
  - dsfr/Link: text-decoration (underline vs none)
  - dsfr/Checkbox: box width (Δ-58.8px)
  - dsfr/Checkbox: box height (Δ-20.0px)
  - dsfr/Radio: padding-left (Δ-32.0px)
  - dsfr/Radio: box width (Δ79.1px)
  - dsfr/Toggle: radius topLeft (Δ999.0px)
  - dsfr/Toggle: radius topRight (Δ999.0px)
  - dsfr/Toggle: radius bottomRight (Δ999.0px)
  - dsfr/Toggle: radius bottomLeft (Δ999.0px)
  - dsfr/Toggle: box width (Δ-205.0px)
  - dsfr/Toggle: box height (Δ-20.0px)
  - dsfr/Toggle: background-color (rgb(0,0,145) vs rgb(0,0,0)/a0)
  - dsfr/Alert: box width (Δ28.0px)
  - dsfr/Alert: box height (Δ-10.0px)
  - dsfr/Accordion: box width (Δ28.0px)
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
  - carbon/Search: box width (Δ47.0px)
  - carbon/Checkbox: padding-left (Δ-6.0px)
  - carbon/Checkbox: box width (Δ-6.0px)
  - carbon/Checkbox: box height (Δ-3.0px)
  - carbon/Radio: box width (Δ62.0px)
  - carbon/Radio: box height (Δ-2.0px)
  - carbon/Radio: line-height (Δ-2.0px)
  - carbon/Toggle: radius topLeft (Δ999.0px)
  - carbon/Toggle: radius topRight (Δ999.0px)
  - carbon/Toggle: radius bottomRight (Δ999.0px)
  - carbon/Toggle: radius bottomLeft (Δ999.0px)
  - carbon/Toggle: background-color (rgb(15,98,254) vs rgb(0,0,0)/a0)
  - carbon/Alert: box width (Δ-96.4px)
  - carbon/Alert: box height (Δ-27.0px)
  - carbon/Accordion: box width (Δ28.0px)
  - carbon/Card: box width (Δ15.0px)
  - carbon/Card: box height (Δ-27.6px)
  - carbon/Tabs: border-bottom color (rgb(15,98,254) vs rgb(224,224,224))
  - carbon/Tabs: color (rgb(22,22,22) vs rgb(82,82,82))
  - airbus/Button: border-top width (Δ2.0px)
  - airbus/Button: border-right width (Δ2.0px)
  - airbus/Button: border-bottom width (Δ2.0px)
  - airbus/Button: border-left width (Δ2.0px)
  - airbus/Button: box width (Δ4.0px)
  - airbus/Button: box height (Δ4.0px)
  - airbus/ButtonDisabled: border-top width (Δ2.0px)
  - airbus/ButtonDisabled: border-right width (Δ2.0px)
  - airbus/ButtonDisabled: border-bottom width (Δ2.0px)
  - airbus/ButtonDisabled: border-left width (Δ2.0px)
  - airbus/ButtonDisabled: box width (Δ4.0px)
  - airbus/ButtonDisabled: box height (Δ4.0px)
  - airbus/Input: radius bottomRight (Δ3.0px)
  - airbus/Input: radius bottomLeft (Δ3.0px)
  - airbus/Input: box width (Δ47.0px)
  - airbus/InputError: radius bottomRight (Δ3.0px)
  - airbus/InputError: radius bottomLeft (Δ3.0px)
  - airbus/InputError: box width (Δ47.0px)
  - airbus/InputDisabled: radius bottomRight (Δ3.0px)
  - airbus/InputDisabled: radius bottomLeft (Δ3.0px)
  - airbus/InputDisabled: box width (Δ47.0px)
  - airbus/InputDisabled: color (rgb(145,156,176) vs rgb(20,23,29))
  - airbus/Textarea: radius bottomRight (Δ3.0px)
  - airbus/Textarea: radius bottomLeft (Δ3.0px)
  - airbus/Textarea: padding-top (Δ2.0px)
  - airbus/Textarea: padding-bottom (Δ2.0px)
  - airbus/Textarea: box width (Δ47.0px)
  - airbus/Textarea: box height (Δ20.0px)
  - airbus/Select: radius bottomRight (Δ3.0px)
  - airbus/Select: radius bottomLeft (Δ3.0px)
  - airbus/Select: padding-right (Δ-24.0px)
  - airbus/Select: box width (Δ47.0px)
  - airbus/Search: radius bottomRight (Δ3.0px)
  - airbus/Search: radius bottomLeft (Δ3.0px)
  - airbus/Search: padding-right (Δ32.0px)
  - airbus/Search: padding-left (Δ4.0px)
  - airbus/Search: box width (Δ47.0px)
  - airbus/Link: radius topLeft (Δ-3.0px)
  - airbus/Link: radius topRight (Δ-3.0px)
  - airbus/Link: radius bottomRight (Δ-3.0px)
  - airbus/Link: radius bottomLeft (Δ-3.0px)
  - airbus/Link: padding-top (Δ-3.0px)
  - airbus/Link: padding-right (Δ-8.0px)
  - airbus/Link: padding-bottom (Δ-3.0px)
  - airbus/Link: padding-left (Δ-8.0px)
  - airbus/Link: box width (Δ-23.1px)
  - airbus/Link: box height (Δ-6.0px)
  - airbus/Link: font-weight (400 vs 700)
  - airbus/Checkbox: box width (Δ-24.0px)
  - airbus/Radio: box width (Δ33.6px)
  - airbus/Toggle: padding-left (Δ-48.0px)
  - airbus/Toggle: box width (Δ-121.4px)
  - airbus/Toggle: font-size (Δ2.0px)
  - airbus/Toggle: line-height (Δ4.0px)
  - airbus/Toggle: background-color (rgb(0,32,91) vs rgb(0,0,0)/a0)
  - airbus/Tag: padding-right (Δ12.0px)
  - airbus/Tag: padding-left (Δ12.0px)
  - airbus/Tag: background-color (rgb(224,227,233) vs rgb(239,241,244))
  - airbus/Alert: border-left width (Δ-4.0px)
  - airbus/Alert: padding-top (Δ-8.0px)
  - airbus/Alert: padding-bottom (Δ-8.0px)
  - airbus/Alert: padding-left (Δ8.0px)
  - airbus/Alert: box width (Δ-47.5px)
  - airbus/Alert: box height (Δ-15.0px)
  - airbus/Accordion: padding-top (Δ-4.0px)
  - airbus/Accordion: padding-bottom (Δ-4.0px)
  - airbus/Accordion: box width (Δ28.0px)
  - airbus/Accordion: box height (Δ-8.0px)
  - airbus/Accordion: font-size (Δ2.0px)
  - airbus/Accordion: line-height (Δ4.0px)
  - airbus/Accordion: background-color (rgb(0,0,0)/a0 vs rgb(255,255,255))
  - airbus/Breadcrumb: radius topLeft (Δ-3.0px)
  - airbus/Breadcrumb: radius topRight (Δ-3.0px)
  - airbus/Breadcrumb: radius bottomRight (Δ-3.0px)
  - airbus/Breadcrumb: radius bottomLeft (Δ-3.0px)
  - airbus/Breadcrumb: padding-top (Δ-3.0px)
  - airbus/Breadcrumb: padding-right (Δ-8.0px)
  - airbus/Breadcrumb: padding-bottom (Δ-3.0px)
  - airbus/Breadcrumb: padding-left (Δ-8.0px)
  - airbus/Breadcrumb: box width (Δ-23.1px)
  - airbus/Breadcrumb: box height (Δ-2.0px)
  - airbus/Breadcrumb: font-size (Δ-2.0px)
  - airbus/Breadcrumb: font-weight (400 vs 700)
  - airbus/Breadcrumb: line-height (Δ4.0px)
  - airbus/Breadcrumb: text-decoration (none vs underline)
  - airbus/Pagination: border-top width (Δ2.0px)
  - airbus/Pagination: border-right width (Δ2.0px)
  - airbus/Pagination: border-bottom width (Δ2.0px)
  - airbus/Pagination: border-left width (Δ2.0px)
  - airbus/Pagination: padding-top (Δ-6.0px)
  - airbus/Pagination: padding-right (Δ-10.0px)
  - airbus/Pagination: padding-bottom (Δ-6.0px)
  - airbus/Pagination: padding-left (Δ-10.0px)
  - airbus/Pagination: font-weight (500 vs 700)
  - airbus/Pagination: line-height (Δ4.0px)
  - airbus/Pagination: background-color (rgb(0,0,0)/a0 vs rgb(0,32,91))
  - airbus/Pagination: color (rgb(20,23,29) vs rgb(255,255,255))
  - airbus/Card: padding-top (Δ16.0px)
  - airbus/Card: padding-right (Δ16.0px)
  - airbus/Card: padding-bottom (Δ16.0px)
  - airbus/Card: padding-left (Δ16.0px)
  - airbus/Card: box width (Δ15.0px)
  - airbus/Card: box height (Δ-23.6px)
  - airbus/Card: font-size (Δ2.0px)
  - airbus/Card: line-height (normal vs 20px)
  - airbus/Tabs: color (rgb(6,59,158) vs rgb(0,32,91))

