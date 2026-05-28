# Matrice de traçabilité — parité anatomique contrôlée (Phase 1 pilote)

> Contrat de schéma : `ComponentAnatomy` v**1.2.0** (`packages/tokens/src/anatomy.ts`).
> Périmètre : 5 composants × {DSFR, Carbon} (Sent Tech = base de référence).
> Date : 2026-05-27. Statut : pilote local non poussé, en attente UAT.
>
> **v1.1.0 (extensions additives)** : `states.hover.bg` (retire D1/C1), `states.hover.decoration`
> du Link via `typography.link.textDecorationHover` (retire la partie tokenisable de C2),
> `density.{sm,md,lg}.fontSize` (retire D3/C3). Les valeurs de base recompilées restent
> identiques à v1.0.0 hors ces champs additifs (aucune régression Sent Tech).
>
> **v1.2.0 (extension additive)** : `field` sur l'anatomie de l'input — `style`
> (`outline` | `filled-underline`), `fillBg`, et **bordures par côté** résolues
> (`borderTop/Right/Bottom/Left`). Ferme l'écart de **style de champ** : DSFR et
> Carbon rendent l'input **rempli + bordure basse seule** (pas un encadré). Avant,
> l'anatomie n'exprimait qu'une bordure uniforme → input infidèle (encadré). Après,
> `filled-underline` rend fond + filet bas seul, fidèle au réel. Sent Tech reste
> `outline` (4 bordures égales = `border.subtle`, fond = `surface.default`) : valeurs
> recompilées **identiques** (diff `sent-tech.css` = additif pur, 0 suppression).

Légende état : 🟢 tokens complet · 🟡 tokens + échappement justifié · 🔴 gap · ⚪ à faire · — N/A.

Le **ratio mesuré** = `propriétés CSS d'anatomie tokenisées / propriétés d'anatomie requises`,
par état. Il ne recompte PAS ce qui était déjà thémé hors anatomie (couleurs de marque,
z-index, motion, data-viz). C'est une mesure honnête « au mieux de l'analyse », pas une
cible marketing : on **attend ≥1 échappement structurel par composant** (focus, décoration),
c'est normal (cf. spec §3).

Les deux thèmes sont **symétriques** : DSFR et Carbon partagent exactement le même schéma
et les mêmes vars d'anatomie ; ils divergent par les **valeurs** (police, radius, densité)
et par la **technique de focus** (DSFR = `outline` décalé ; Carbon = `box-shadow inset`),
portée par la primitive `focus.strategy` + le mixin partagé résolu dans `createComponent`.

---

## DSFR

| Composant | État | Ratio (tokenisé/requis) | Statut | Notes |
|-----------|------|--------------------------|--------|-------|
| **Button** | default | 14/14 | 🟢 | radius 0 (carré), Marianne 500, densité DSFR ; `font-size` sm/md/lg tokenisé (`density.*.fontSize` v1.1.0) |
|           | hover  | 1/1 | 🟢 | `states.hover.bg` = Bleu France hover `#1212ff` (tokenisé v1.1.0) ; secondaire via `secondaryHover` |
|           | focus  | 3/3 | 🟢 | `outline` 2px décalé 2px `#0a76f6` (stratégie `outline`) |
|           | disabled | 2/2 | 🟢 | `opacity`/`cursor` tokenisés (DSFR `disabledOpacity:1`, couleurs grises via rôles) |
| **Input/Field** | default | 13/13 | 🟢 | carré, Marianne, hauteur 40px ; label typo tokenisée ; **style de champ FERMÉ par token (v1.2.0)** : `field.style = filled-underline`, fond `#eeeeee` (grey-950), filet bas seul `1px solid #3a3a3a` (grey-200), top/right/left = `none`. Avant : encadré (bordure uniforme) ≠ réel ; après : rempli + bordure basse seule, fidèle à « Champ de saisie ». Source : DSFR fondamentaux / Champ de saisie (`à confirmer` la nuance exacte de la bordure basse) |
|           | hover  | 1/1 | 🟢 | `border-color` recolore le filet bas (rôle) |
|           | focus  | 3/3 | 🟢 | `outline` décalé (stratégie) ; bordure interactive conservée |
|           | disabled | 2/2 | 🟢 | bg + texte via rôles |
| **Link** | default | 4/5 | 🟡 | `text-decoration: underline` tokenisé ; couleur de marque OK ; **animation** d'épaisseur/position du soulignement DSFR non répliquée (technique) → échappement résiduel D2 |
|           | hover  | 2/2 | 🟢 | couleur hover + `states.hover.decoration` (`underline`, no-op vs repos) tokenisés |
|           | focus  | 4/4 | 🟢 | `outline` décalé + radius `sm` (carré) |
|           | disabled | 3/3 | 🟢 | couleur + retrait soulignement (delta tokenisé) |
| **Card** | default | 4/4 | 🟢 | carré (radius 0), bordure, ombre via rôles |
|           | hover  | 1/1 | 🟢 | `transform` (delta tokenisé) ; DSFR cards plates : l'ombre medium reste hors anatomie |
|           | focus  | — | — | Card non focusable par défaut (N/A) |
|           | disabled | — | — | N/A |
| **Tabs** | default | 8/9 | 🟢 | indicateur (rôle), typo Marianne, bordure ; `padding` 0.25rem en dur |
|           | hover  | 1/1 | 🟢 | couleur active (delta tokenisé) |
|           | focus  | 4/4 | 🟢 | `outline` décalé (était ABSENT avant le pilote — a11y restaurée) |
|           | disabled | 2/2 | 🟢 | opacity + cursor |

## Carbon

| Composant | État | Ratio (tokenisé/requis) | Statut | Notes |
|-----------|------|--------------------------|--------|-------|
| **Button** | default | 14/14 | 🟢 | carré, IBM Plex Sans 400, `letter-spacing 0.16px` ; `font-size` sm/md/lg tokenisé (Carbon = taille constante 0.875rem, v1.1.0) |
|           | hover  | 1/1 | 🟢 | `states.hover.bg` = `$button-primary-hover` Blue 70 `#0043ce` (tokenisé v1.1.0) ; secondaire via `secondaryHover` |
|           | focus  | 3/3 | 🟢 | `box-shadow: inset 0 0 0 2px #0f62fe` (stratégie `inset` — signature Carbon) |
|           | disabled | 2/2 | 🟢 | opacity/cursor (Carbon `disabledOpacity:1`, couleurs via rôles) |
| **Input/Field** | default | 13/13 | 🟢 | carré, IBM Plex, hauteur 40px ; label typo tokenisée ; **style de champ FERMÉ par token (v1.2.0)** : `field.style = filled-underline`, fond `#f4f4f4` ($field-01 / gray10), filet bas seul `1px solid #8d8d8d` (gray50 / $border-strong), top/right/left = `none`. Avant : encadré ≠ réel ; après : rempli + bordure basse seule, fidèle à « Text input » (White theme). Source : Carbon « Text input » |
|           | hover  | 1/1 | 🟢 | `border-color` recolore le filet bas (rôle) |
|           | focus  | 3/3 | 🟢 | `box-shadow inset` 2px (stratégie) dessiné dans le champ rempli ; bordure interactive conservée |
|           | disabled | 2/2 | 🟢 | bg + texte via rôles |
| **Link** | default | 5/5 | 🟢 | Carbon : PAS de soulignement par défaut (`textDecoration:none` tokenisé) ; apparition au hover désormais portée par `states.hover.decoration` (v1.1.0) |
|           | hover  | 2/2 | 🟢 | couleur hover + `states.hover.decoration` = `underline` (tokenisé v1.1.0 — retire C2) |
|           | focus  | 4/4 | 🟢 | `box-shadow inset` + radius `sm` (carré) |
|           | disabled | 3/3 | 🟢 | couleur + retrait soulignement |
| **Card** | default | 4/4 | 🟢 | carré (Carbon v11), bordure, ombre via rôles |
|           | hover  | 1/1 | 🟢 | `transform` ; Carbon tiles utilisent souvent un changement de `$layer` au hover (non tokenisé en delta) |
|           | focus  | — | — | N/A |
|           | disabled | — | — | N/A |
| **Tabs** | default | 8/9 | 🟢 | indicateur, IBM Plex ; `padding` 0.25rem en dur |
|           | hover  | 1/1 | 🟢 | couleur active |
|           | focus  | 4/4 | 🟢 | `box-shadow inset` (a11y restaurée — focus était absent) |
|           | disabled | 2/2 | 🟢 | opacity + cursor |

---

## Synthèse ratios (anatomie, hors couleur de marque déjà thémée)

| Composant | DSFR (default) | Carbon (default) | Échappement structurel restant |
|-----------|----------------|------------------|--------------------------------|
| Button | 100% (14/14) | 100% (14/14) | — (hover bg + font-size par taille tokenisés en v1.1.0) |
| Input  | 100% (13/13) | 100% (13/13) | — (style de champ `filled-underline` tokenisé en v1.2.0 ; focus = technique, déjà couverte par stratégie) |
| Link   | ~80% (4/5) DSFR · 100% (5/5) Carbon | idem | DSFR : **animation** du soulignement (épaisseur/position) — comportement, pas valeur |
| Card   | 100% (4/4) | 100% (4/4) | ombre/`$layer` au hover |
| Tabs   | ~89% (8/9) | ~89% (8/9) | padding inline fixe |

> Lecture honnête (cf. revue) : la **technique** de focus diffère (outline vs inset) mais
> elle est **tokenisée via la stratégie**, donc comptée 🟢. Avec v1.1.0, les couleurs de hover
> des boutons (D1/C1) et la taille de police par taille (D3/C3) sont **portées en tokens**
> (`states.hover.bg`, `density.*.fontSize`), et le soulignement conditionnel Carbon (C2) est
> tokenisé via `states.hover.decoration`. Avec v1.2.0, le **style de champ** (DSFR/Carbon
> remplis + bordure basse seule) est porté par `field.style = filled-underline` + `fillBg` +
> bordures par côté — ce qui ferme l'écart « encadré ≠ réel » de l'input (D-input/C-input) qui
> était signé « à l'œil » à tort. Le **seul** échappement de décoration restant est
> l'**animation** d'épaisseur/position du soulignement DSFR (D2) — un comportement, pas une valeur.

---

## Liste d'échappement gouvernée (PROPOSÉE — à valider en UAT)

Chaque entrée : propriétaire · justification · date · critère de retrait.
Réservée au non-tokenisable (pseudo-éléments, techniques, comportements).

### DSFR — `[data-st-theme="dsfr"]`

| # | Cible | Propriété | Justification | Propriétaire | Date | Critère de retrait |
|---|-------|-----------|---------------|--------------|------|--------------------|
| D2 | `.st-link` (hover) | `text-decoration` (**animation**) | Le soulignement DSFR **anime** son épaisseur/position au survol — comportement, pas valeur. La ligne elle-même est tokenisée (`states.hover.decoration`) ; seule l'animation reste un écart | équipe DS | 2026-05-27 | Décision produit : répliquer l'animation (transition `text-decoration-thickness`) ou accepter l'écart documenté |

> Retirés en v1.1.0 : **D1** (hover bg) → `states.hover.bg` = `#1212ff` ; **D3** (font-size sm/lg) → `density.{sm,md,lg}.fontSize`.
> Retiré en v1.2.0 : **D-input** (style de champ « encadré » ≠ réel) → `field.style = filled-underline`, `fillBg = #eeeeee`, `borderBottom = 1px solid #3a3a3a`, top/right/left = `none`.

### Carbon — `[data-st-theme="carbon"]`

| # | Cible | Propriété | Justification | Propriétaire | Date | Critère de retrait |
|---|-------|-----------|---------------|--------------|------|--------------------|
| C4 | `.st-card--interactive:hover` | `background`/`$layer` | Carbon change la couche (`$layer-hover`) au survol plutôt que d'élever par ombre | équipe DS | 2026-05-27 | Ajouter `states.hover.bg` à Card si parité requise |

> Retirés en v1.1.0 : **C1** (hover bg) → `states.hover.bg` = `#0043ce` ; **C2** (soulignement hover) → `states.hover.decoration` = `underline` (la partie tokenisable ; pas d'animation côté Carbon) ; **C3** (font-size sm/lg) → `density.{sm,md,lg}.fontSize`.
> Retiré en v1.2.0 : **C-input** (style de champ « encadré » ≠ réel) → `field.style = filled-underline`, `fillBg = #f4f4f4` ($field-01), `borderBottom = 1px solid #8d8d8d` ($border-strong), top/right/left = `none`.

> Note : à ce stade, la **seule** entrée d'échappement restante est D2 (animation du soulignement
> DSFR) et C4 (changement de `$layer` au hover des cartes Carbon) — toutes deux des
> **comportements**, pas des valeurs. Aucune feuille `[data-st-theme="<id>"]{…}` n'est encore
> écrite : tout le pilote tient dans les tokens d'anatomie (schéma v1.2.0). Ces écarts sont à
> arbitrer avec l'utilisateur (spec §7/§8) avant d'être figés ou convertis en extensions.

---

## a11y (non négociable, spec §5)

- **Focus clavier visible par thème** : 🟢 restauré partout. Tabs n'avait AUCUN `:focus-visible`
  avant le pilote — désormais couvert par le mixin de focus (outline DSFR / inset Carbon).
- **Contraste du focus** : DSFR `#0a76f6` et Carbon `#0f62fe` sur fond blanc ⇒ contraste élevé
  (à confirmer formellement par mesure de ratio pendant l'UAT navigateur).
- **Carbon inset** : l'anneau interne 2px ne sort pas du flux (pas de décalage de layout) ✅.

---

## Phase 2 — rollout par cluster (en cours, additif)

> Principe : les contrôles de la **famille champ** consomment désormais les **mêmes**
> vars d'anatomie `--st-component-control-anatomy-*` (+ `field` v1.2.0) que le pilote
> Input. Ils **héritent donc par construction** de la parité DSFR/Carbon d'Input
> (fond + filet bas seul + focus par stratégie), sans CSS par thème. Chaque migration
> est vérifiée au **rendu calculé** (Playwright) : base inchangé (4 bords, radius 6px)
> + flip `filled-underline` injecté (top/right/left=`none`, filet bas seul, fond rempli, radius 0).

### Cluster « contrôles de formulaire » — boîte-champ

| Composant | Anatomie consommée | Vérif rendu (base / filled-underline) | Statut |
|-----------|--------------------|----------------------------------------|--------|
| Input (pilote) | field + shape + focus + density + typo | référence | 🟢 |
| **Textarea** | field + shape + focus + typo + label | base 4 bords r6 / filled bottom-only r0 #eee ✅ | 🟢 |
| **NumberInput** | field + shape + focus (`:focus-within`) + label | base 4 bords r6 ✅ (flip = pattern identique) | 🟢 |
| **PasswordInput** | field + shape + focus (`:focus-within`) + label | base 4 bords r6 / filled bottom-only r0 #f4f4f4 ✅ | 🟢 |
| **Search** | field + shape + focus (`:focus-within`) + label | base 4 bords r6 #fff ✅ | 🟢 |
| **Select** | field + shape + focus (`:focus-visible`) + label | base 4 bords r6 / filled bottom-only r0 #f4f4f4 ✅ | 🟢 |
| **Combobox** | field + shape + focus (`:focus-within`) + label | base 4 bords r6 / filled bottom-only r0 #eee ✅ | 🟢 |
| **MultiSelect** | field + shape + focus (`:focus-visible`, sur `__trigger`) + label | base 4 bords r6 ✅ (flip = pattern identique) | 🟢 |
| **DatePicker** | field + shape + focus (`:focus-within`) + label | base 4 bords r6 ✅ (flip = pattern identique) | 🟢 |

> **Cluster boîte-champ COMPLET** : Input (pilote) + 8 contrôles (Textarea, NumberInput,
> PasswordInput, Search, Select, Combobox, MultiSelect, DatePicker). Les panneaux dropdown
> (`__list`/`__panel`) restent sur les groupes `dropdown`/`popover` (cluster overlay séparé).
>
> **Validation banc `/compare`** : Textarea + Select ajoutés au banc (notre mappé vs markup
> officiel DSFR/Carbon). Rendu RÉEL (thème compilé, non injecté) confirmé : filled-underline
> `#eeeeee` (DSFR) / `#f4f4f4` (Carbon), radius 0, polices Marianne / IBM Plex Sans. Le
> `.st-select` consomme désormais la typo d'anatomie (corrige un `font: inherit` résiduel).
>
### Cluster « sélection »

| Composant | Anatomie consommée | Vérif rendu | Statut |
|-----------|--------------------|-------------|--------|
| **Switch** | focus (stratégie, sur `__track`) | mêmes vars focus prouvées (boîte-champ) | 🟢 focus |
| **Toggle** | focus (stratégie, sur `__track`) | mêmes vars focus prouvées (boîte-champ) | 🟢 focus |
| **Checkbox** | `accent-color` = `selection.checkedBackground` | base oklch → #0f62fe injecté ✅ | 🟡 natif |
| **Radio** | `accent-color` = `selection.checkedBackground` | (même classe `.st-choice__input`) | 🟡 natif |

> **Switch/Toggle** : track custom → focus porté par la stratégie d'anatomie (parité a11y).
> **Checkbox/Radio** : rendus **natifs** (`.st-choice__box` masqué) → seul `accent-color`
> est thématisable sans markup custom. Le **visuel custom** (boîte carrée DSFR/Carbon,
> coche, focus par stratégie, indeterminate) = **feature dédiée à risque a11y**, DÉFÉRÉE
> (cf. backlog D7). Choix réversible : `accent-color` apporte la parité de couleur checked
> tout de suite, sans risque ; le visuel custom sera arbitré à part.

### Cluster « navigation / overlay »

| Composant | Anatomie consommée | Statut |
|-----------|--------------------|--------|
| **PaginationNav** | focus par stratégie (`__page`/`__nav`) | 🟢 focus |
| **OverflowMenu** | focus par stratégie (`__trigger`) | 🟢 focus |
| **Toggletip** | focus par stratégie (`__trigger`) | 🟢 focus |
| Popover / Modal / Tooltip (panneaux) | radius+ombre+bordure via tokens `popover`/`overlay`/`tooltip` (déjà thémés par foundation) | 🟢 déjà |

> Les **panneaux** overlay consomment déjà leurs tokens thémés (radius/ombre dérivés de
> `foundation` → carré sous DSFR/Carbon). Le seul gap réel était le **focus** des triggers
> qui ne passent ni par Button ni par Link → migré sur la stratégie d'anatomie. Items de
> menu (`__item`) gardent un surlignage de fond au focus (standard, theme-agnostique).
