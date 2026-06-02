# Rapport de fidélité — pixel-perfect par bord

Comparaison **bord par bord** de NOS composants mappés vs les **vrais composants officiels** DSFR / Carbon.
Toutes les valeurs proviennent des **styles calculés réels** (computed styles) ; aucune n'est inventée.

| Champ | Valeur |
|---|---|
| Date | <date> |
| Navigateur | Google Chrome système (`/usr/bin/google-chrome`) via puppeteer-core, headless |
| URL mesurée | http://127.0.0.1:4322/compare (build statique servi) |
| Tolérance longueur | ±1px → statut `~` |
| Tolérance couleur | distance RGB ≤ 12 → statut `~` |
| Statuts | `=` identique · `~` proche (tolérance) · `≠` écart net |
| Diff | NOS valeurs vs RÉFÉRENCE officielle ; fidélité = % de `=` + `~` |

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

### Switch

- Notre sélecteur : `.cmp-scope--carbon .st-switch__track`
- Référence : iframe `.cmp-cell--ref` → `.bx--toggle__switch`
- ⚠ Carbon n'expose pas de composant "Switch" séparé dans ce périmètre, mais le mapping le plus fidèle est le même patron Toggle.

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
| padding-top | 0px | 0px | = |
| padding-right | 0px | 0px | = |
| padding-bottom | 0px | 0px | = |
| padding-left | 0px | 0px | = |
| box width | 48px | 48px | = |
| box height | 24px | 24px | = |
| font-family | IBM Plex Sans | IBM Plex Sans | = |
| font-size | 16px | 12px | ≠ Δ4.0px |
| font-weight | 400 | 400 | = |
| line-height | normal | 16px | ≠ normal vs 16px |
| letter-spacing | normal | 0.32px | ≠ normal vs 0.32px |
| text-transform | none | none | = |
| text-decoration | none | none | = |
| background-color | rgb(15, 98, 254) | rgba(0, 0, 0, 0) | ≠ rgb(15,98,254) vs rgb(0,0,0)/a0 |
| color | rgb(22, 22, 22) | rgb(82, 82, 82) | ≠ rgb(22,22,22) vs rgb(82,82,82) |

**Fidélité Switch (carbon) : 71%** — 22 `=`, 0 `~`, 9 `≠` sur 31 propriétés.

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

## Récap de fidélité par composant

Couverture mesurée : **20 paires** (notre composant mappé vs vrai composant officiel).

| Thème | Composant / variant | Fidélité | `=` | `~` | `≠` | Réf stylée ? |
|---|---|---|---|---|---|---|
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
| carbon | Switch | 71% | 22 | 0 | 9 | oui |
| carbon | Tag | 100% | 31 | 0 | 0 | oui |
| carbon | Alert | 93.5% | 29 | 0 | 2 | oui |
| carbon | Accordion | 96.8% | 30 | 0 | 1 | oui |
| carbon | Breadcrumb | 100% | 30 | 1 | 0 | oui |
| carbon | Pagination | 100% | 31 | 0 | 0 | oui |
| carbon | Card | 93.5% | 29 | 0 | 2 | oui |
| carbon | Tabs | 93.1% | 27 | 0 | 2 | oui |

## Récapitulatif global

- **Fidélité globale : 92.7%** (557 `=`, 16 `~`, 45 `≠` sur 618 propriétés mesurées).
- **Couverture : 20 paires composant×thème mesurées.**
- **Écarts nets restants : 45**

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
  - carbon/Switch: radius topLeft (Δ999.0px)
  - carbon/Switch: radius topRight (Δ999.0px)
  - carbon/Switch: radius bottomRight (Δ999.0px)
  - carbon/Switch: radius bottomLeft (Δ999.0px)
  - carbon/Switch: font-size (Δ4.0px)
  - carbon/Switch: line-height (normal vs 16px)
  - carbon/Switch: letter-spacing (normal vs 0.32px)
  - carbon/Switch: background-color (rgb(15,98,254) vs rgb(0,0,0)/a0)
  - carbon/Switch: color (rgb(22,22,22) vs rgb(82,82,82))
  - carbon/Alert: box width (Δ-96.4px)
  - carbon/Alert: box height (Δ-27.0px)
  - carbon/Accordion: box width (Δ28.0px)
  - carbon/Card: box width (Δ15.0px)
  - carbon/Card: box height (Δ-27.6px)
  - carbon/Tabs: border-bottom color (rgb(15,98,254) vs rgb(224,224,224))
  - carbon/Tabs: color (rgb(22,22,22) vs rgb(82,82,82))

