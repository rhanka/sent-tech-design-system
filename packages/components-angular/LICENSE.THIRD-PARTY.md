<!-- GÉNÉRÉ par scripts/generate-third-party-notices.mjs — ne pas éditer à la main. -->
<!-- Régénérer : `npm run notices:generate`. La dérive fait échouer `npm run licensing:check`. -->

# Notices de tiers — `@sentropic/design-system-angular`

Licence de ce paquet : **MIT** — voir `LICENSE`.
Ce fichier couvre le code **tiers**, et lui seul.

Périmètre, littéralement : le code tiers recopié dans ce paquet (§1) et la
fermeture transitive de ses dépendances d'exécution (§2). Hors périmètre, et
c'est délibéré : les `peerDependencies`, fournies par le consommateur, et les
`devDependencies`, qui n'entrent dans aucun tarball.

## 1. Code tiers recopié dans ce paquet

Le code ci-dessous n'est pas une dépendance : il est **copié dans nos sources**
et compilé dans le `dist/` publié. Nous en distribuons donc une copie, et la
notice de copyright comme la notice de permission doivent l'accompagner. Elles
sont reproduites intégralement, sans abréviation.

L'inventaire ci-dessous est **mesuré** à la génération, en comparant nos
sources à l'amont installé : il ne peut pas se désynchroniser en silence.

### lucide — mesuré contre `lucide-react` 0.562.0 — ISC AND MIT

**Ce qui est copié.** Des chaînes de tracé SVG (attribut `d`) identiques octet pour octet aux données d'icônes lucide, écrites directement dans nos fichiers source et compilées dans le `dist/` publié.

**Étendue mesurée.** 43 chaîne(s) de tracé distincte(s),
75 occurrence(s), dans 21 fichier(s) source de ce paquet :

| Fichier source | Occurrences |
|---|---|
| `src/AppChrome.ts` | 5 |
| `src/Autosave.ts` | 2 |
| `src/BackToTop.ts` | 1 |
| `src/Calendar.ts` | 2 |
| `src/cellDecoration.ts` | 16 |
| `src/ChatComposer.ts` | 2 |
| `src/Combobox.ts` | 3 |
| `src/Dropdown.ts` | 1 |
| `src/FileUploader.ts` | 9 |
| `src/FilterPill.ts` | 2 |
| `src/Icon.ts` | 13 |
| `src/IdentityMenu.ts` | 1 |
| `src/InlineLoading.ts` | 1 |
| `src/MenuTriggerButton.ts` | 1 |
| `src/MultiSelect.ts` | 3 |
| `src/PaginationNav.ts` | 2 |
| `src/ProgressIndicator.ts` | 3 |
| `src/Search.ts` | 3 |
| `src/SelectionChip.ts` | 2 |
| `src/Tag.ts` | 2 |
| `src/TimePicker.ts` | 1 |

Glyphes amont concernés (une chaîne partagée par plusieurs glyphes les nomme tous) :
`alarm-clock-off`, `align-center-horizontal`, `align-vertical-justify-center`, `arrow-down`, `arrow-right`, `arrow-up`, `badge-check`, `barcode`, `bath`, `beer-off`, `bell-off`, `bluetooth-off`, `bug-off`, `calendar-off`, `camera-off`, `candy-off`, `cannabis-off`, `captions-off`, `check`, `chevron-down`, `chevron-left`, `chevron-right`, `cigarette-off`, `circle-check`, `circle-chevron-down`, `circle-off`, `circle-parking-off`, `circle-question-mark`, `clock`, `clock-4`, `clock-alert`, `clock-check`, `clock-fading`, `cloud-off`, `cloud-snow`, `cooking-pot`, `dna-off`, `download`, `droplet-off`, `egg-off`, `eye`, `eye-off`, `file`, `file-archive`, `file-axis-3d`, `file-badge`, `file-box`, `file-braces`, `file-braces-corner`, `file-chart-column`, `file-chart-column-increasing`, `file-chart-line`, `file-chart-pie`, `file-check`, `file-check-corner`, `file-clock`, `file-code`, `file-code-corner`, `file-cog`, `file-diff`, `file-digit`, `file-down`, `file-exclamation-point`, `file-headphone`, `file-heart`, `file-image`, `file-input`, `file-key`, `file-lock`, `file-minus`, `file-minus-corner`, `file-music`, `file-output`, `file-pen`, `file-play`, `file-plus`, `file-plus-corner`, `file-question-mark`, `file-scan`, `file-search`, `file-search-corner`, `file-signal`, `file-sliders`, `file-spreadsheet`, `file-symlink`, `file-terminal`, `file-text`, `file-type`, `file-type-corner`, `file-up`, `file-user`, `file-video-camera`, `file-volume`, `file-x`, `file-x-corner`, `flag-off`, `flashlight-off`, `flask-conical-off`, `github`, `globe`, `headphone-off`, `heart-off`, `hop-off`, `house-wifi`, `import`, `info`, `keyboard-music`, `keyboard-off`, `layers`, `lightbulb-off`, `loader-circle`, `locate-off`, `lollipop`, `map-pin-off`, `megaphone-off`, `message-circle-off`, `message-circle-question-mark`, `message-square-off`, `mic-off`, `minus`, `monitor-off`, `move`, `move-horizontal`, `pen-off`, `pencil-off`, `pin-off`, `plus`, `pointer-off`, `power-off`, `route-off`, `save-off`, `search-alert`, `search-check`, `search-code`, `search-slash`, `search-x`, `send`, `server-off`, `settings`, `shield-check`, `shield-off`, `shield-question-mark`, `shredder`, `square-check`, `square-chevron-down`, `square-parking-off`, `ticket-check`, `timer-off`, `touchpad-off`, `trending-down`, `trending-up`, `triangle-alert`, `umbrella-off`, `upload`, `video-off`, `volume-off`, `vote`, `webhook-off`, `wifi-off`, `x`, `zap-off`.

**Pourquoi c'est une redistribution.** Le jeu d'icônes du design system est lucide : `packages/components-angular/src/Icon.ts` le dit explicitement (« the same lucide (stroke-24) path data the other frameworks wrap — the single visual source of truth »). Inliner les données plutôt que dépendre du paquet ne supprime pas l'obligation : cela la déplace du `node_modules` du consommateur vers notre propre tarball. Le port Angular ne déclare aucune dépendance lucide et n'embarque que des copies ; les ports React, Vue et Svelte dépendent du paquet lucide ET en recopient une partie.

**Obligation.** ISC comme MIT exigent que la notice de copyright et la notice de permission figurent dans toute copie. Elles sont reproduites intégralement ci-dessous. Un identifiant SPDX seul ne satisfait ni l'une ni l'autre.

**Titulaires.** Lucide Contributors 2025 (ISC) ; Cole Bemis 2013-2023, pour les portions dérivées de Feather (MIT).
**Amont.** https://github.com/lucide-icons/lucide

**Notice intégrale**, telle que publiée par l'amont dans `node_modules/lucide-react/LICENSE` :

> ISC License
>
> Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
>
> Permission to use, copy, modify, and/or distribute this software for any
> purpose with or without fee is hereby granted, provided that the above
> copyright notice and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
> WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
> MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
> ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
> WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
> ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
> OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
>
> ---
>
> The MIT License (MIT) (for portions derived from Feather)
>
> Copyright (c) 2013-2023 Cole Bemis
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

## 2. Dépendances installées avec ce paquet

Aucune. Ce paquet ne déclare aucune dépendance tierce : installer ce paquet
n'installe aucun code tiers de notre fait.
