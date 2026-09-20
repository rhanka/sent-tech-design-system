<!-- GÉNÉRÉ par scripts/generate-third-party-notices.mjs — ne pas éditer à la main. -->
<!-- Régénérer : `npm run notices:generate`. La dérive fait échouer `npm run licensing:check`. -->

# Notices de tiers — `@sentropic/design-system-react`

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

**Étendue mesurée.** 27 chaîne(s) de tracé distincte(s),
30 occurrence(s), dans 3 fichier(s) source de ce paquet :

| Fichier source | Occurrences |
|---|---|
| `src/AppChrome.tsx` | 4 |
| `src/catalog.tsx` | 5 |
| `src/cellDecoration.tsx` | 21 |

Glyphes amont concernés (une chaîne partagée par plusieurs glyphes les nomme tous) :
`align-center-horizontal`, `align-vertical-justify-center`, `arrow-down`, `arrow-right`, `arrow-up`, `badge-percent`, `barcode`, `bath`, `check`, `chevron-down`, `circle-check-big`, `circle-percent`, `circle-question-mark`, `circle-x`, `cloud-snow`, `cooking-pot`, `file-exclamation-point`, `file-question-mark`, `flame`, `github`, `globe`, `house-wifi`, `info`, `keyboard-music`, `menu`, `message-circle-question-mark`, `message-circle-x`, `minus`, `move`, `move-horizontal`, `octagon-x`, `plus`, `shield-question-mark`, `square-check-big`, `square-percent`, `square-x`, `ticket-percent`, `trending-down`, `trending-up`, `triangle-alert`, `x`.

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

Fermeture **transitive** de `dependencies` et `optionalDependencies`, dérivée
de `package-lock.json` : 1 paquet(s), 1 famille(s) de licences.
Ces paquets ne sont pas recopiés dans notre tarball — npm les récupère du
registre avec leurs propres fichiers de licence. Ils sont recensés ici parce
qu'ils arrivent dans le `node_modules` du consommateur de notre fait.

| Paquet | Version | Licence déclarée |
|---|---|---|
| `lucide-react` | 0.562.0 | ISC |

### Textes de notice

#### `lucide-react` 0.562.0 — ISC

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
