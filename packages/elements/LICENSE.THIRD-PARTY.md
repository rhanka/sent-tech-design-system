<!-- GÉNÉRÉ par scripts/generate-third-party-notices.mjs — ne pas éditer à la main. -->
<!-- Régénérer : `npm run notices:generate`. La dérive fait échouer `npm run licensing:check`. -->

# Notices de tiers — `@sentropic/design-system-elements`

Licence de ce paquet : **MIT** — voir `LICENSE`.
Ce fichier couvre le code **tiers**, et lui seul.

Périmètre, littéralement : le code tiers recopié dans ce paquet (§1) et la
fermeture transitive de ses dépendances d'exécution (§2). Hors périmètre, et
c'est délibéré : les `peerDependencies`, fournies par le consommateur, et les
`devDependencies`, qui n'entrent dans aucun tarball.

## 1. Code tiers recopié dans ce paquet

**Rien de mesuré.** Ce qui a été cherché, littéralement : les données de
tracé publiées par `lucide`, comparées octet pour octet aux sources de ce
paquet. Aucune n'y figure.

Ce qui n'a **pas** été cherché : tout amont non déclaré dans
`scripts/third-party-sources.json`. L'absence ci-dessus est donc l'absence
de ces données-là, et non un constat d'absence générale de code tiers dans
ce paquet.

Le contenu ci-dessous n'est pas une dépendance : il est **groupé dans le
`dist/` publié** (binaires et données embarqués par le build navigateur).
Nous en distribuons donc une copie, et les notices qui l'accompagnent
doivent voyager avec elle. La présence est déclarée dans
`scripts/third-party-sources.json` (ce générateur tourne aussi sur arbre
non construit) ; la garde du tarball publié vérifie que chaque famille
présente dans `dist/browser` est nommée ici.

### bpmn-font — groupé depuis `@sentropic/bpmn-canvas` 0.3.0 — OFL-1.1

**Ce qui est groupé.** Les binaires de la fonte d'icônes bpmn (ttf/woff/woff2) et le css qui les déclare, copiés octet pour octet depuis `dist/assets/bpmn-font/` de `@sentropic/bpmn-canvas` et réémis par le build navigateur sous `dist/browser/assets/bpmn-*` (sommes md5 mesurées identiques le 2026-11-01).

**Présence déclarée.** Préfixes `dist/browser/` couverts : `assets/bpmn-`.

**Pourquoi c'est une redistribution.** Le chunk moteur bpmn-canvas embarque le css généré qui référence cette fonte ; vite la réémet comme asset du bundle. Servir le tarball, c'est servir ces octets, et jsDelivr sert le tarball.

**Obligation.** La SIL OFL 1.1 exige que la notice de copyright et le texte de licence voyagent avec la fonte. Ils sont reproduits intégralement ci-dessous, relus depuis `licenses/bpmn-font.OFL-1.1.txt` du paquet amont installé, jamais recopiés à la main.

**Titulaires.** Copyright (c) 2014-present, Camunda Services GmbH.

**Notice intégrale**, telle que publiée par l'amont dans `node_modules/@sentropic/bpmn-canvas/licenses/bpmn-font.OFL-1.1.txt` :

> Copyright (c) 2014-present, Camunda Services GmbH
>
> This Font Software is licensed under the SIL Open Font License, Version 1.1.
> This license is copied below, and is also available with a FAQ at:
> http://scripts.sil.org/OFL
>
>
> -----------------------------------------------------------
> SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
> -----------------------------------------------------------
>
> PREAMBLE
> The goals of the Open Font License (OFL) are to stimulate worldwide
> development of collaborative font projects, to support the font creation
> efforts of academic and linguistic communities, and to provide a free and
> open framework in which fonts may be shared and improved in partnership
> with others.
>
> The OFL allows the licensed fonts to be used, studied, modified and
> redistributed freely as long as they are not sold by themselves. The
> fonts, including any derivative works, can be bundled, embedded,
> redistributed and/or sold with any software provided that any reserved
> names are not used by derivative works. The fonts and derivatives,
> however, cannot be released under any other type of license. The
> requirement for fonts to remain under this license does not apply
> to any document created using the fonts or their derivatives.
>
> DEFINITIONS
> "Font Software" refers to the set of files released by the Copyright
> Holder(s) under this license and clearly marked as such. This may
> include source files, build scripts and documentation.
>
> "Reserved Font Name" refers to any names specified as such after the
> copyright statement(s).
>
> "Original Version" refers to the collection of Font Software components as
> distributed by the Copyright Holder(s).
>
> "Modified Version" refers to any derivative made by adding to, deleting,
> or substituting -- in part or in whole -- any of the components of the
> Original Version, by changing formats or by porting the Font Software to a
> new environment.
>
> "Author" refers to any designer, engineer, programmer, technical
> writer or other person who contributed to the Font Software.
>
> PERMISSION & CONDITIONS
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of the Font Software, to use, study, copy, merge, embed, modify,
> redistribute, and sell modified and unmodified copies of the Font
> Software, subject to the following conditions:
>
> 1) Neither the Font Software nor any of its individual components,
> in Original or Modified Versions, may be sold by itself.
>
> 2) Original or Modified Versions of the Font Software may be bundled,
> redistributed and/or sold with any software, provided that each copy
> contains the above copyright notice and this license. These can be
> included either as stand-alone text files, human-readable headers or
> in the appropriate machine-readable metadata fields within text or
> binary files as long as those fields can be easily viewed by the user.
>
> 3) No Modified Version of the Font Software may use the Reserved Font
> Name(s) unless explicit written permission is granted by the corresponding
> Copyright Holder. This restriction only applies to the primary font name as
> presented to the users.
>
> 4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
> Software shall not be used to promote, endorse or advertise any
> Modified Version, except to acknowledge the contribution(s) of the
> Copyright Holder(s) and the Author(s) or with their explicit written
> permission.
>
> 5) The Font Software, modified or unmodified, in part or in whole,
> must be distributed entirely under this license, and must not be
> distributed under any other license. The requirement for fonts to
> remain under this license does not apply to any document created
> using the Font Software.
>
> TERMINATION
> This license becomes null and void if any of the above conditions are
> not met.
>
> DISCLAIMER
> THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
> OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
> COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
> INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
> DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
> FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
> OTHER DEALINGS IN THE FONT SOFTWARE.

### Adobe Helvetica AFM metrics — groupé depuis `@sentropic/bpmn-canvas` 0.3.0 — Adobe AFM — paragraphe de permission + notices de copyright et de marque (pas MIT)

**Ce qui est groupé.** La table des chasses Helvetica et Helvetica-Bold (95 entrées ASCII par graisse) embarquée dans `chunks/textMetrics-*.js` : extraction modifiée des métriques AFM PostScript d'Adobe, héritée du module textMetrics interne de `@sentropic/bpmn-canvas` (lui-même extrait du répertoire `pdfcorefonts` de Matplotlib v3.10.7, apostrophe et accent grave rabattus sur `quotesingle` et `grave`).

**Présence déclarée.** Préfixes `dist/browser/` couverts : `chunks/textMetrics-`.

**Pourquoi c'est une redistribution.** Le layout réserve la taille du texte avec cette table au lieu de `canvas measureText`, pour un résultat indépendant des fontes installées ; le bundler l'incline dans le chunk. C'est une redistribution de données, pas une dépendance.

**Obligation.** Les termes Adobe exigent que le paragraphe de permission et les notices de copyright et de marque voyagent avec les données, que les fichiers AFM ne voyagent pas sans lui, et que toute modification soit signalée : la source amont marque l'extraction comme modifiée, mention reprise telle quelle ci-dessous. Textes relus depuis `licenses/Adobe-AFM-readme.txt` et `licenses/Adobe-AFM-copyright.txt` du paquet amont installé.

**Titulaires.** Copyright (c) 1985, 1987, 1989, 1990, 1997 Adobe Systems Incorporated (Comment et Notice) ; Helvetica, marque de Linotype-Hell AG et/ou de ses filiales.
**Amont.** http://partners.adobe.com/public/developer/font/index.html

**Notices intégrales**, telles que publiées par l'amont dans `node_modules/@sentropic/bpmn-canvas/licenses/Adobe-AFM-readme.txt` et dans `node_modules/@sentropic/bpmn-canvas/licenses/Adobe-AFM-copyright.txt` :

#### node_modules/@sentropic/bpmn-canvas/licenses/Adobe-AFM-readme.txt

> Font Metrics for the 14 PDF Core Fonts
> ======================================
>
> This directory contains font metrics for the 14 PDF Core Fonts,
> downloaded from Adobe. The title and this paragraph were added by
> Matplotlib developers. The download URL was
> <http://partners.adobe.com/public/developer/font/index.html>.
>
> This file and the 14 PostScript(R) AFM files it accompanies may be used, copied, 
> and distributed for any purpose and without charge, with or without modification, 
> provided that all copyright notices are retained; that the AFM files are not 
> distributed without this file; that all modifications to this file or any of 
> the AFM files are prominently noted in the modified file(s); and that this 
> paragraph is not modified. Adobe Systems has no responsibility or obligation 
> to support the use of the AFM files.

#### node_modules/@sentropic/bpmn-canvas/licenses/Adobe-AFM-copyright.txt

> Comment Copyright (c) 1985, 1987, 1989, 1990, 1997 Adobe Systems Incorporated.  All Rights Reserved.
> Notice Copyright (c) 1985, 1987, 1989, 1990, 1997 Adobe Systems Incorporated.  All Rights Reserved.Helvetica is a trademark of Linotype-Hell AG and/or its subsidiaries.

## 2. Dépendances installées avec ce paquet

Fermeture **transitive** de `dependencies` et `optionalDependencies`, dérivée
de `package-lock.json` : 142 paquet(s), 7 famille(s) de licences.
Ces paquets ne sont pas recopiés dans notre tarball — npm les récupère du
registre avec leurs propres fichiers de licence. Ils sont recensés ici parce
qu'ils arrivent dans le `node_modules` du consommateur de notre fait.

| Paquet | Version | Licence déclarée |
|---|---|---|
| `@bpmn-io/diagram-js-ui` | 0.2.4 | MIT |
| `@hono/node-server` | 2.1.5 | MIT |
| `@jridgewell/gen-mapping` | 0.3.13 | MIT |
| `@jridgewell/remapping` | 2.3.5 | MIT |
| `@jridgewell/resolve-uri` | 3.1.2 | MIT |
| `@jridgewell/sourcemap-codec` | 1.6.0 | MIT |
| `@jridgewell/trace-mapping` | 0.3.31 | MIT |
| `@lezer/common` | 1.5.2 | MIT |
| `@lezer/highlight` | 1.2.3 | MIT |
| `@lezer/markdown` | 1.8.0 | MIT |
| `@modelcontextprotocol/sdk` | 1.32.2 | MIT |
| `@noble/hashes` | 2.0.1 | MIT |
| `@sveltejs/acorn-typescript` | 1.0.9 | MIT |
| `@types/estree` | 1.0.9 | MIT |
| `@types/trusted-types` | 2.0.7 | MIT |
| `accepts` | 2.0.0 | MIT |
| `acorn` | 8.18.0 | MIT |
| `ajv` | 8.20.0 | MIT |
| `ajv-formats` | 3.0.1 | MIT |
| `aria-query` | 5.3.1 | Apache-2.0 |
| `axobject-query` | 4.1.0 | Apache-2.0 |
| `body-parser` | 2.4.0 | MIT |
| `bpmn-auto-layout` | 1.3.0 | MIT |
| `bpmn-js` | 18.30.1 | SEE LICENSE IN LICENSE |
| `bpmn-moddle` | 10.3.1 | MIT |
| `bytes` | 3.1.2 | MIT |
| `call-bind-apply-helpers` | 1.0.2 | MIT |
| `call-bound` | 1.0.4 | MIT |
| `clsx` | 2.1.1 | MIT |
| `content-disposition` | 2.0.1 | MIT |
| `content-type` | 1.0.5 | MIT |
| `content-type` | 2.1.0 | MIT |
| `content-type` | 2.1.0 | MIT |
| `content-type` | 2.1.0 | MIT |
| `content-type` | 2.1.0 | MIT |
| `cookie` | 0.7.2 | MIT |
| `cookie-signature` | 1.2.2 | MIT |
| `cors` | 2.8.6 | MIT |
| `cross-spawn` | 7.0.6 | MIT |
| `debug` | 4.4.3 | MIT |
| `depd` | 2.0.0 | MIT |
| `devalue` | 5.9.4 | MIT |
| `diagram-js` | 15.27.3 | MIT |
| `diagram-js-direct-editing` | 3.6.0 | MIT |
| `didi` | 11.0.1 | MIT |
| `domify` | 3.0.0 | MIT |
| `dompurify` | 3.4.17 | (MPL-2.0 OR Apache-2.0) |
| `dunder-proto` | 1.0.1 | MIT |
| `ee-first` | 1.1.1 | MIT |
| `encodeurl` | 2.0.1 | MIT |
| `es-define-property` | 1.0.1 | MIT |
| `es-errors` | 1.3.0 | MIT |
| `es-object-atoms` | 1.1.2 | MIT |
| `escape-html` | 1.0.3 | MIT |
| `esm-env` | 1.2.2 | MIT |
| `esrap` | 2.2.9 | MIT |
| `etag` | 1.8.1 | MIT |
| `eventsource` | 3.0.7 | MIT |
| `eventsource-parser` | 3.1.1 | MIT |
| `express` | 5.3.0 | MIT |
| `express-rate-limit` | 8.7.2 | MIT |
| `fast-deep-equal` | 3.1.3 | MIT |
| `fast-uri` | 3.1.9 | BSD-3-Clause |
| `finalhandler` | 2.1.1 | MIT |
| `forwarded` | 0.2.0 | MIT |
| `fresh` | 2.0.0 | MIT |
| `function-bind` | 1.1.2 | MIT |
| `get-intrinsic` | 1.3.0 | MIT |
| `get-proto` | 1.0.1 | MIT |
| `gopd` | 1.2.0 | MIT |
| `has-symbols` | 1.1.0 | MIT |
| `hasown` | 2.0.4 | MIT |
| `hono` | 4.13.14 | MIT |
| `htm` | 3.1.1 | Apache-2.0 |
| `http-errors` | 2.0.1 | MIT |
| `iconv-lite` | 0.7.3 | MIT |
| `ids` | 3.0.2 | MIT |
| `inherits` | 2.0.4 | ISC |
| `inherits-browser` | 0.1.0 | ISC |
| `ip-address` | 10.7.5 | MIT |
| `ipaddr.js` | 1.9.1 | MIT |
| `is-promise` | 4.0.0 | MIT |
| `is-reference` | 3.0.3 | MIT |
| `isexe` | 2.0.0 | ISC |
| `jose` | 6.2.3 | MIT |
| `json-schema-traverse` | 1.0.0 | MIT |
| `json-schema-typed` | 8.0.2 | BSD-2-Clause |
| `locate-character` | 3.0.0 | MIT |
| `magic-string` | 0.30.21 | MIT |
| `math-intrinsics` | 1.1.0 | MIT |
| `media-typer` | 1.1.1 | MIT |
| `merge-descriptors` | 2.0.0 | MIT |
| `mime-db` | 1.54.0 | MIT |
| `mime-types` | 3.0.2 | MIT |
| `min-dash` | 5.1.0 | MIT |
| `min-dom` | 5.3.0 | MIT |
| `moddle` | 8.2.1 | MIT |
| `moddle-xml` | 12.3.2 | MIT |
| `ms` | 2.1.3 | MIT |
| `negotiator` | 1.1.0 | MIT |
| `object-assign` | 4.1.1 | MIT |
| `object-inspect` | 1.13.4 | MIT |
| `object-refs` | 0.4.0 | MIT |
| `on-finished` | 2.4.2 | MIT |
| `once` | 1.4.0 | ISC |
| `parseurl` | 1.3.3 | MIT |
| `path-intersection` | 4.2.1 | MIT |
| `path-key` | 3.1.1 | MIT |
| `path-to-regexp` | 8.4.2 | MIT |
| `pkce-challenge` | 5.0.1 | MIT |
| `preact` | 10.29.8 | MIT |
| `proxy-addr` | 2.0.8 | MIT |
| `qs` | 6.17.1 | BSD-3-Clause |
| `range-parser` | 1.3.0 | MIT |
| `raw-body` | 3.0.2 | MIT |
| `require-from-string` | 2.0.2 | MIT |
| `router` | 2.2.0 | MIT |
| `safer-buffer` | 2.1.2 | MIT |
| `saxen` | 11.2.0 | MIT |
| `send` | 1.2.1 | MIT |
| `serve-static` | 2.2.1 | MIT |
| `setprototypeof` | 1.2.0 | ISC |
| `shebang-command` | 2.0.0 | MIT |
| `shebang-regex` | 3.0.0 | MIT |
| `side-channel` | 1.1.1 | MIT |
| `side-channel-list` | 1.0.1 | MIT |
| `side-channel-map` | 1.0.1 | MIT |
| `side-channel-weakmap` | 1.0.2 | MIT |
| `statuses` | 2.0.2 | MIT |
| `svelte` | 5.55.7 | MIT |
| `tiny-svg` | 4.1.4 | MIT |
| `toidentifier` | 1.0.1 | MIT |
| `type-is` | 2.1.0 | MIT |
| `ulid` | 3.0.2 | MIT |
| `unpipe` | 1.0.0 | MIT |
| `vary` | 1.1.2 | MIT |
| `which` | 2.0.2 | ISC |
| `wrappy` | 1.0.2 | ISC |
| `yaml` | 2.9.0 | ISC |
| `zimmerframe` | 1.1.4 | MIT |
| `zod` | 3.25.76 | MIT |
| `zod-to-json-schema` | 3.25.2 | ISC |

> **Apache-2.0.** Sa section 4(d) impose de reconduire le fichier `NOTICE` de
> l'amont, lorsqu'il en existe un, dans toute œuvre dérivée distribuée. Les
> textes ci-dessous reprennent chaque fichier de notice publié par l'amont.

> **BSD-3-Clause.** Sa troisième clause interdit d'employer le nom du
> titulaire ou de ses contributeurs pour endosser ou promouvoir un produit
> dérivé sans accord écrit préalable. Nous ne le faisons pas.

### Textes de notice

#### `@bpmn-io/diagram-js-ui` 0.2.4 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2022-present Camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `@hono/node-server` 2.1.5 — MIT

> MIT License
>
> Copyright (c) 2022 - present, Yusuke Wada and Hono contributors
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

#### `@jridgewell/gen-mapping` 0.3.13 — MIT

> Copyright 2024 Justin Ridgewell <justin@ridgewell.name>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

#### `@jridgewell/remapping` 2.3.5 — MIT

> Copyright 2024 Justin Ridgewell <justin@ridgewell.name>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

#### `@jridgewell/resolve-uri` 3.1.2 — MIT

> Copyright 2019 Justin Ridgewell <jridgewell@google.com>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

#### `@jridgewell/sourcemap-codec` 1.6.0 — MIT

> Copyright 2024 Justin Ridgewell <justin@ridgewell.name>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

#### `@jridgewell/trace-mapping` 0.3.31 — MIT

> Copyright 2024 Justin Ridgewell <justin@ridgewell.name>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

#### `@lezer/common` 1.5.2 — MIT

> MIT License
>
> Copyright (C) 2018 by Marijn Haverbeke <marijn@haverbeke.berlin> and others
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `@lezer/highlight` 1.2.3 — MIT

> MIT License
>
> Copyright (C) 2018 by Marijn Haverbeke <marijn@haverbeke.berlin> and others
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `@lezer/markdown` 1.8.0 — MIT

> MIT License
>
> Copyright (C) 2020 by Marijn Haverbeke <marijn@haverbeke.berlin> and others
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `@modelcontextprotocol/sdk` 1.32.2 — MIT

> MIT License
>
> Copyright (c) 2024 Anthropic, PBC
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

#### `@noble/hashes` 2.0.1 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2022 Paul Miller (https://paulmillr.com)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the “Software”), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `@sveltejs/acorn-typescript` 1.0.9 — MIT

> MIT License
>
> Copyright (c) 2022 Tyreal Hu
> Copyright (c) 2025 The Svelte Team
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

#### `@types/estree` 1.0.9 — MIT

>     MIT License
>
>     Copyright (c) Microsoft Corporation.
>
>     Permission is hereby granted, free of charge, to any person obtaining a copy
>     of this software and associated documentation files (the "Software"), to deal
>     in the Software without restriction, including without limitation the rights
>     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
>     copies of the Software, and to permit persons to whom the Software is
>     furnished to do so, subject to the following conditions:
>
>     The above copyright notice and this permission notice shall be included in all
>     copies or substantial portions of the Software.
>
>     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
>     SOFTWARE

#### `@types/trusted-types` 2.0.7 — MIT

>     MIT License
>
>     Copyright (c) Microsoft Corporation.
>
>     Permission is hereby granted, free of charge, to any person obtaining a copy
>     of this software and associated documentation files (the "Software"), to deal
>     in the Software without restriction, including without limitation the rights
>     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
>     copies of the Software, and to permit persons to whom the Software is
>     furnished to do so, subject to the following conditions:
>
>     The above copyright notice and this permission notice shall be included in all
>     copies or substantial portions of the Software.
>
>     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
>     SOFTWARE

#### `accepts` 2.0.0 — MIT

> (The MIT License)
>
> Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
> Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `acorn` 8.18.0 — MIT

> MIT License
>
> Copyright (C) 2012-2022 by various contributors (see AUTHORS)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `ajv` 8.20.0 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2015-2021 Evgeny Poberezkin
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

#### `ajv-formats` 3.0.1 — MIT

> MIT License
>
> Copyright (c) 2020 Evgeny Poberezkin
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

#### `aria-query` 5.3.1 — Apache-2.0

> Apache License
> Version 2.0, January 2004
> http://www.apache.org/licenses/
>
> TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
>
> 1. Definitions.
>
> "License" shall mean the terms and conditions for use, reproduction,
> and distribution as defined by Sections 1 through 9 of this document.
>
> "Licensor" shall mean the copyright owner or entity authorized by
> the copyright owner that is granting the License.
>
> "Legal Entity" shall mean the union of the acting entity and all
> other entities that control, are controlled by, or are under common
> control with that entity. For the purposes of this definition,
> "control" means (i) the power, direct or indirect, to cause the
> direction or management of such entity, whether by contract or
> otherwise, or (ii) ownership of fifty percent (50%) or more of the
> outstanding shares, or (iii) beneficial ownership of such entity.
>
> "You" (or "Your") shall mean an individual or Legal Entity
> exercising permissions granted by this License.
>
> "Source" form shall mean the preferred form for making modifications,
> including but not limited to software source code, documentation
> source, and configuration files.
>
> "Object" form shall mean any form resulting from mechanical
> transformation or translation of a Source form, including but
> not limited to compiled object code, generated documentation,
> and conversions to other media types.
>
> "Work" shall mean the work of authorship, whether in Source or
> Object form, made available under the License, as indicated by a
> copyright notice that is included in or attached to the work
> (an example is provided in the Appendix below).
>
> "Derivative Works" shall mean any work, whether in Source or Object
> form, that is based on (or derived from) the Work and for which the
> editorial revisions, annotations, elaborations, or other modifications
> represent, as a whole, an original work of authorship. For the purposes
> of this License, Derivative Works shall not include works that remain
> separable from, or merely link (or bind by name) to the interfaces of,
> the Work and Derivative Works thereof.
>
> "Contribution" shall mean any work of authorship, including
> the original version of the Work and any modifications or additions
> to that Work or Derivative Works thereof, that is intentionally
> submitted to Licensor for inclusion in the Work by the copyright owner
> or by an individual or Legal Entity authorized to submit on behalf of
> the copyright owner. For the purposes of this definition, "submitted"
> means any form of electronic, verbal, or written communication sent
> to the Licensor or its representatives, including but not limited to
> communication on electronic mailing lists, source code control systems,
> and issue tracking systems that are managed by, or on behalf of, the
> Licensor for the purpose of discussing and improving the Work, but
> excluding communication that is conspicuously marked or otherwise
> designated in writing by the copyright owner as "Not a Contribution."
>
> "Contributor" shall mean Licensor and any individual or Legal Entity
> on behalf of whom a Contribution has been received by Licensor and
> subsequently incorporated within the Work.
>
> 2. Grant of Copyright License. Subject to the terms and conditions of
> this License, each Contributor hereby grants to You a perpetual,
> worldwide, non-exclusive, no-charge, royalty-free, irrevocable
> copyright license to reproduce, prepare Derivative Works of,
> publicly display, publicly perform, sublicense, and distribute the
> Work and such Derivative Works in Source or Object form.
>
> 3. Grant of Patent License. Subject to the terms and conditions of
> this License, each Contributor hereby grants to You a perpetual,
> worldwide, non-exclusive, no-charge, royalty-free, irrevocable
> (except as stated in this section) patent license to make, have made,
> use, offer to sell, sell, import, and otherwise transfer the Work,
> where such license applies only to those patent claims licensable
> by such Contributor that are necessarily infringed by their
> Contribution(s) alone or by combination of their Contribution(s)
> with the Work to which such Contribution(s) was submitted. If You
> institute patent litigation against any entity (including a
> cross-claim or counterclaim in a lawsuit) alleging that the Work
> or a Contribution incorporated within the Work constitutes direct
> or contributory patent infringement, then any patent licenses
> granted to You under this License for that Work shall terminate
> as of the date such litigation is filed.
>
> 4. Redistribution. You may reproduce and distribute copies of the
> Work or Derivative Works thereof in any medium, with or without
> modifications, and in Source or Object form, provided that You
> meet the following conditions:
>
> (a) You must give any other recipients of the Work or
> Derivative Works a copy of this License; and
>
> (b) You must cause any modified files to carry prominent notices
> stating that You changed the files; and
>
> (c) You must retain, in the Source form of any Derivative Works
> that You distribute, all copyright, patent, trademark, and
> attribution notices from the Source form of the Work,
> excluding those notices that do not pertain to any part of
> the Derivative Works; and
>
> (d) If the Work includes a "NOTICE" text file as part of its
> distribution, then any Derivative Works that You distribute must
> include a readable copy of the attribution notices contained
> within such NOTICE file, excluding those notices that do not
> pertain to any part of the Derivative Works, in at least one
> of the following places: within a NOTICE text file distributed
> as part of the Derivative Works; within the Source form or
> documentation, if provided along with the Derivative Works; or,
> within a display generated by the Derivative Works, if and
> wherever such third-party notices normally appear. The contents
> of the NOTICE file are for informational purposes only and
> do not modify the License. You may add Your own attribution
> notices within Derivative Works that You distribute, alongside
> or as an addendum to the NOTICE text from the Work, provided
> that such additional attribution notices cannot be construed
> as modifying the License.
>
> You may add Your own copyright statement to Your modifications and
> may provide additional or different license terms and conditions
> for use, reproduction, or distribution of Your modifications, or
> for any such Derivative Works as a whole, provided Your use,
> reproduction, and distribution of the Work otherwise complies with
> the conditions stated in this License.
>
> 5. Submission of Contributions. Unless You explicitly state otherwise,
> any Contribution intentionally submitted for inclusion in the Work
> by You to the Licensor shall be under the terms and conditions of
> this License, without any additional terms or conditions.
> Notwithstanding the above, nothing herein shall supersede or modify
> the terms of any separate license agreement you may have executed
> with Licensor regarding such Contributions.
>
> 6. Trademarks. This License does not grant permission to use the trade
> names, trademarks, service marks, or product names of the Licensor,
> except as required for reasonable and customary use in describing the
> origin of the Work and reproducing the content of the NOTICE file.
>
> 7. Disclaimer of Warranty. Unless required by applicable law or
> agreed to in writing, Licensor provides the Work (and each
> Contributor provides its Contributions) on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
> implied, including, without limitation, any warranties or conditions
> of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
> PARTICULAR PURPOSE. You are solely responsible for determining the
> appropriateness of using or redistributing the Work and assume any
> risks associated with Your exercise of permissions under this License.
>
> 8. Limitation of Liability. In no event and under no legal theory,
> whether in tort (including negligence), contract, or otherwise,
> unless required by applicable law (such as deliberate and grossly
> negligent acts) or agreed to in writing, shall any Contributor be
> liable to You for damages, including any direct, indirect, special,
> incidental, or consequential damages of any character arising as a
> result of this License or out of the use or inability to use the
> Work (including but not limited to damages for loss of goodwill,
> work stoppage, computer failure or malfunction, or any and all
> other commercial damages or losses), even if such Contributor
> has been advised of the possibility of such damages.
>
> 9. Accepting Warranty or Additional Liability. While redistributing
> the Work or Derivative Works thereof, You may choose to offer,
> and charge a fee for, acceptance of support, warranty, indemnity,
> or other liability obligations and/or rights consistent with this
> License. However, in accepting such obligations, You may act only
> on Your own behalf and on Your sole responsibility, not on behalf
> of any other Contributor, and only if You agree to indemnify,
> defend, and hold each Contributor harmless for any liability
> incurred by, or claims asserted against, such Contributor by reason
> of your accepting any such warranty or additional liability.
>
> END OF TERMS AND CONDITIONS
>
> APPENDIX: How to apply the Apache License to your work.
>
> To apply the Apache License to your work, attach the following
> boilerplate notice, with the fields enclosed by brackets "{}"
> replaced with your own identifying information. (Don't include
> the brackets!)  The text should be enclosed in the appropriate
> comment syntax for the file format. We also recommend that a
> file or class name and description of purpose be included on the
> same "printed page" as the copyright notice for easier
> identification within third-party archives.
>
> Copyright 2020 A11yance
>
> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
> http://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.

#### `axobject-query` 4.1.0 — Apache-2.0

> Apache License
> Version 2.0, January 2004
> http://www.apache.org/licenses/
>
> TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
>
> 1. Definitions.
>
> "License" shall mean the terms and conditions for use, reproduction,
> and distribution as defined by Sections 1 through 9 of this document.
>
> "Licensor" shall mean the copyright owner or entity authorized by
> the copyright owner that is granting the License.
>
> "Legal Entity" shall mean the union of the acting entity and all
> other entities that control, are controlled by, or are under common
> control with that entity. For the purposes of this definition,
> "control" means (i) the power, direct or indirect, to cause the
> direction or management of such entity, whether by contract or
> otherwise, or (ii) ownership of fifty percent (50%) or more of the
> outstanding shares, or (iii) beneficial ownership of such entity.
>
> "You" (or "Your") shall mean an individual or Legal Entity
> exercising permissions granted by this License.
>
> "Source" form shall mean the preferred form for making modifications,
> including but not limited to software source code, documentation
> source, and configuration files.
>
> "Object" form shall mean any form resulting from mechanical
> transformation or translation of a Source form, including but
> not limited to compiled object code, generated documentation,
> and conversions to other media types.
>
> "Work" shall mean the work of authorship, whether in Source or
> Object form, made available under the License, as indicated by a
> copyright notice that is included in or attached to the work
> (an example is provided in the Appendix below).
>
> "Derivative Works" shall mean any work, whether in Source or Object
> form, that is based on (or derived from) the Work and for which the
> editorial revisions, annotations, elaborations, or other modifications
> represent, as a whole, an original work of authorship. For the purposes
> of this License, Derivative Works shall not include works that remain
> separable from, or merely link (or bind by name) to the interfaces of,
> the Work and Derivative Works thereof.
>
> "Contribution" shall mean any work of authorship, including
> the original version of the Work and any modifications or additions
> to that Work or Derivative Works thereof, that is intentionally
> submitted to Licensor for inclusion in the Work by the copyright owner
> or by an individual or Legal Entity authorized to submit on behalf of
> the copyright owner. For the purposes of this definition, "submitted"
> means any form of electronic, verbal, or written communication sent
> to the Licensor or its representatives, including but not limited to
> communication on electronic mailing lists, source code control systems,
> and issue tracking systems that are managed by, or on behalf of, the
> Licensor for the purpose of discussing and improving the Work, but
> excluding communication that is conspicuously marked or otherwise
> designated in writing by the copyright owner as "Not a Contribution."
>
> "Contributor" shall mean Licensor and any individual or Legal Entity
> on behalf of whom a Contribution has been received by Licensor and
> subsequently incorporated within the Work.
>
> 2. Grant of Copyright License. Subject to the terms and conditions of
> this License, each Contributor hereby grants to You a perpetual,
> worldwide, non-exclusive, no-charge, royalty-free, irrevocable
> copyright license to reproduce, prepare Derivative Works of,
> publicly display, publicly perform, sublicense, and distribute the
> Work and such Derivative Works in Source or Object form.
>
> 3. Grant of Patent License. Subject to the terms and conditions of
> this License, each Contributor hereby grants to You a perpetual,
> worldwide, non-exclusive, no-charge, royalty-free, irrevocable
> (except as stated in this section) patent license to make, have made,
> use, offer to sell, sell, import, and otherwise transfer the Work,
> where such license applies only to those patent claims licensable
> by such Contributor that are necessarily infringed by their
> Contribution(s) alone or by combination of their Contribution(s)
> with the Work to which such Contribution(s) was submitted. If You
> institute patent litigation against any entity (including a
> cross-claim or counterclaim in a lawsuit) alleging that the Work
> or a Contribution incorporated within the Work constitutes direct
> or contributory patent infringement, then any patent licenses
> granted to You under this License for that Work shall terminate
> as of the date such litigation is filed.
>
> 4. Redistribution. You may reproduce and distribute copies of the
> Work or Derivative Works thereof in any medium, with or without
> modifications, and in Source or Object form, provided that You
> meet the following conditions:
>
> (a) You must give any other recipients of the Work or
> Derivative Works a copy of this License; and
>
> (b) You must cause any modified files to carry prominent notices
> stating that You changed the files; and
>
> (c) You must retain, in the Source form of any Derivative Works
> that You distribute, all copyright, patent, trademark, and
> attribution notices from the Source form of the Work,
> excluding those notices that do not pertain to any part of
> the Derivative Works; and
>
> (d) If the Work includes a "NOTICE" text file as part of its
> distribution, then any Derivative Works that You distribute must
> include a readable copy of the attribution notices contained
> within such NOTICE file, excluding those notices that do not
> pertain to any part of the Derivative Works, in at least one
> of the following places: within a NOTICE text file distributed
> as part of the Derivative Works; within the Source form or
> documentation, if provided along with the Derivative Works; or,
> within a display generated by the Derivative Works, if and
> wherever such third-party notices normally appear. The contents
> of the NOTICE file are for informational purposes only and
> do not modify the License. You may add Your own attribution
> notices within Derivative Works that You distribute, alongside
> or as an addendum to the NOTICE text from the Work, provided
> that such additional attribution notices cannot be construed
> as modifying the License.
>
> You may add Your own copyright statement to Your modifications and
> may provide additional or different license terms and conditions
> for use, reproduction, or distribution of Your modifications, or
> for any such Derivative Works as a whole, provided Your use,
> reproduction, and distribution of the Work otherwise complies with
> the conditions stated in this License.
>
> 5. Submission of Contributions. Unless You explicitly state otherwise,
> any Contribution intentionally submitted for inclusion in the Work
> by You to the Licensor shall be under the terms and conditions of
> this License, without any additional terms or conditions.
> Notwithstanding the above, nothing herein shall supersede or modify
> the terms of any separate license agreement you may have executed
> with Licensor regarding such Contributions.
>
> 6. Trademarks. This License does not grant permission to use the trade
> names, trademarks, service marks, or product names of the Licensor,
> except as required for reasonable and customary use in describing the
> origin of the Work and reproducing the content of the NOTICE file.
>
> 7. Disclaimer of Warranty. Unless required by applicable law or
> agreed to in writing, Licensor provides the Work (and each
> Contributor provides its Contributions) on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
> implied, including, without limitation, any warranties or conditions
> of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
> PARTICULAR PURPOSE. You are solely responsible for determining the
> appropriateness of using or redistributing the Work and assume any
> risks associated with Your exercise of permissions under this License.
>
> 8. Limitation of Liability. In no event and under no legal theory,
> whether in tort (including negligence), contract, or otherwise,
> unless required by applicable law (such as deliberate and grossly
> negligent acts) or agreed to in writing, shall any Contributor be
> liable to You for damages, including any direct, indirect, special,
> incidental, or consequential damages of any character arising as a
> result of this License or out of the use or inability to use the
> Work (including but not limited to damages for loss of goodwill,
> work stoppage, computer failure or malfunction, or any and all
> other commercial damages or losses), even if such Contributor
> has been advised of the possibility of such damages.
>
> 9. Accepting Warranty or Additional Liability. While redistributing
> the Work or Derivative Works thereof, You may choose to offer,
> and charge a fee for, acceptance of support, warranty, indemnity,
> or other liability obligations and/or rights consistent with this
> License. However, in accepting such obligations, You may act only
> on Your own behalf and on Your sole responsibility, not on behalf
> of any other Contributor, and only if You agree to indemnify,
> defend, and hold each Contributor harmless for any liability
> incurred by, or claims asserted against, such Contributor by reason
> of your accepting any such warranty or additional liability.
>
> END OF TERMS AND CONDITIONS
>
> APPENDIX: How to apply the Apache License to your work.
>
> To apply the Apache License to your work, attach the following
> boilerplate notice, with the fields enclosed by brackets "{}"
> replaced with your own identifying information. (Don't include
> the brackets!)  The text should be enclosed in the appropriate
> comment syntax for the file format. We also recommend that a
> file or class name and description of purpose be included on the
> same "printed page" as the copyright notice for easier
> identification within third-party archives.
>
> Copyright 2020 A11yance
>
> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
> http://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.

#### `body-parser` 2.4.0 — MIT

> (The MIT License)
>
> Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
> Copyright (c) 2014-2015 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `bpmn-auto-layout` 1.3.0 — MIT

> `source-gap` : le paquet publié ne contient aucun fichier de licence.
> Identifiant déclaré dans son manifeste : MIT.
> Auteur déclaré : bpmn.io contributors (https://github.com/bpmn-io).
> Dépôt déclaré : git+https://github.com/bpmn-io/bpmn-auto-layout.git.
> Le texte doit être relu à la source avant toute redistribution d'une copie
> de ce paquet.

#### `bpmn-js` 18.30.1 — SEE LICENSE IN LICENSE

> Copyright (c) 2014-present Camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the "Software"), to deal in the
> Software without restriction, including without limitation the rights to use, copy,
> modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
> and to permit persons to whom the Software is furnished to do so, subject to the
> following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> The source code responsible for displaying the bpmn.io project watermark that
> links back to https://bpmn.io as part of rendered diagrams MUST NOT be
> removed or changed. When this software is being used in a website or application,
> the watermark must stay fully visible and not visually overlapped by other elements.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
> INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
> PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
> LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
> OR OTHER DEALINGS IN THE SOFTWARE.

#### `bpmn-moddle` 10.3.1 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2014 camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `bytes` 3.1.2 — MIT

> (The MIT License)
>
> Copyright (c) 2012-2014 TJ Holowaychuk <tj@vision-media.ca>
> Copyright (c) 2015 Jed Watson <jed.watson@me.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `call-bind-apply-helpers` 1.0.2 — MIT

> MIT License
>
> Copyright (c) 2024 Jordan Harband
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

#### `call-bound` 1.0.4 — MIT

> MIT License
>
> Copyright (c) 2024 Jordan Harband
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

#### `clsx` 2.1.1 — MIT

> MIT License
>
> Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `content-disposition` 2.0.1 — MIT

> (The MIT License)
>
> Copyright (c) 2014-2017 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `content-type` 1.0.5 — MIT

> (The MIT License)
>
> Copyright (c) 2015 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `content-type` 2.1.0 — MIT

> (The MIT License)
>
> Copyright (c) 2015 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `content-type` 2.1.0 — MIT

> (The MIT License)
>
> Copyright (c) 2015 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `content-type` 2.1.0 — MIT

> (The MIT License)
>
> Copyright (c) 2015 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `content-type` 2.1.0 — MIT

> (The MIT License)
>
> Copyright (c) 2015 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `cookie` 0.7.2 — MIT

> (The MIT License)
>
> Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
> Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `cookie-signature` 1.2.2 — MIT

> (The MIT License)
>
> Copyright (c) 2012–2024 LearnBoost <tj@learnboost.com> and other contributors;
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `cors` 2.8.6 — MIT

> (The MIT License)
>
> Copyright (c) 2013 Troy Goode <troygoode@gmail.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `cross-spawn` 7.0.6 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2018 Made With MOXY Lda <hello@moxy.studio>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `debug` 4.4.3 — MIT

> (The MIT License)
>
> Copyright (c) 2014-2017 TJ Holowaychuk <tj@vision-media.ca>
> Copyright (c) 2018-2021 Josh Junon
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software
> and associated documentation files (the 'Software'), to deal in the Software without restriction,
> including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
> and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial
> portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
> LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
> WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `depd` 2.0.0 — MIT

> (The MIT License)
>
> Copyright (c) 2014-2018 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `devalue` 5.9.4 — MIT

> Copyright (c) 2018-19 [these people](https://github.com/rich-harris/devalue/graphs/contributors)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `diagram-js` 15.27.3 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2014-present Camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `diagram-js-direct-editing` 3.6.0 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2014-2017 camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `didi` 11.0.1 — MIT

> The MIT License
>
> Copyright (C) 2013 Vojta Jína.
> Copyright (C) 2015-present Nico Rehwaldt.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the "Software"), to deal in
> the Software without restriction, including without limitation the rights to
> use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
> of the Software, and to permit persons to whom the Software is furnished to do
> so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
> FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
> COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
> IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `domify` 3.0.0 — MIT

> MIT License
>
> Copyright (c) TJ Holowaychuk <tj@tjholowaychuk.com>
> Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `dompurify` 3.4.17 — (MPL-2.0 OR Apache-2.0)

> LICENSE:
>
>
>                                  Apache License
>                            Version 2.0, January 2004
>                         http://www.apache.org/licenses/
>
>    TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
>
>    1. Definitions.
>
>       "License" shall mean the terms and conditions for use, reproduction,
>       and distribution as defined by Sections 1 through 9 of this document.
>
>       "Licensor" shall mean the copyright owner or entity authorized by
>       the copyright owner that is granting the License.
>
>       "Legal Entity" shall mean the union of the acting entity and all
>       other entities that control, are controlled by, or are under common
>       control with that entity. For the purposes of this definition,
>       "control" means (i) the power, direct or indirect, to cause the
>       direction or management of such entity, whether by contract or
>       otherwise, or (ii) ownership of fifty percent (50%) or more of the
>       outstanding shares, or (iii) beneficial ownership of such entity.
>
>       "You" (or "Your") shall mean an individual or Legal Entity
>       exercising permissions granted by this License.
>
>       "Source" form shall mean the preferred form for making modifications,
>       including but not limited to software source code, documentation
>       source, and configuration files.
>
>       "Object" form shall mean any form resulting from mechanical
>       transformation or translation of a Source form, including but
>       not limited to compiled object code, generated documentation,
>       and conversions to other media types.
>
>       "Work" shall mean the work of authorship, whether in Source or
>       Object form, made available under the License, as indicated by a
>       copyright notice that is included in or attached to the work
>       (an example is provided in the Appendix below).
>
>       "Derivative Works" shall mean any work, whether in Source or Object
>       form, that is based on (or derived from) the Work and for which the
>       editorial revisions, annotations, elaborations, or other modifications
>       represent, as a whole, an original work of authorship. For the purposes
>       of this License, Derivative Works shall not include works that remain
>       separable from, or merely link (or bind by name) to the interfaces of,
>       the Work and Derivative Works thereof.
>
>       "Contribution" shall mean any work of authorship, including
>       the original version of the Work and any modifications or additions
>       to that Work or Derivative Works thereof, that is intentionally
>       submitted to Licensor for inclusion in the Work by the copyright owner
>       or by an individual or Legal Entity authorized to submit on behalf of
>       the copyright owner. For the purposes of this definition, "submitted"
>       means any form of electronic, verbal, or written communication sent
>       to the Licensor or its representatives, including but not limited to
>       communication on electronic mailing lists, source code control systems,
>       and issue tracking systems that are managed by, or on behalf of, the
>       Licensor for the purpose of discussing and improving the Work, but
>       excluding communication that is conspicuously marked or otherwise
>       designated in writing by the copyright owner as "Not a Contribution."
>
>       "Contributor" shall mean Licensor and any individual or Legal Entity
>       on behalf of whom a Contribution has been received by Licensor and
>       subsequently incorporated within the Work.
>
>    2. Grant of Copyright License. Subject to the terms and conditions of
>       this License, each Contributor hereby grants to You a perpetual,
>       worldwide, non-exclusive, no-charge, royalty-free, irrevocable
>       copyright license to reproduce, prepare Derivative Works of,
>       publicly display, publicly perform, sublicense, and distribute the
>       Work and such Derivative Works in Source or Object form.
>
>    3. Grant of Patent License. Subject to the terms and conditions of
>       this License, each Contributor hereby grants to You a perpetual,
>       worldwide, non-exclusive, no-charge, royalty-free, irrevocable
>       (except as stated in this section) patent license to make, have made,
>       use, offer to sell, sell, import, and otherwise transfer the Work,
>       where such license applies only to those patent claims licensable
>       by such Contributor that are necessarily infringed by their
>       Contribution(s) alone or by combination of their Contribution(s)
>       with the Work to which such Contribution(s) was submitted. If You
>       institute patent litigation against any entity (including a
>       cross-claim or counterclaim in a lawsuit) alleging that the Work
>       or a Contribution incorporated within the Work constitutes direct
>       or contributory patent infringement, then any patent licenses
>       granted to You under this License for that Work shall terminate
>       as of the date such litigation is filed.
>
>    4. Redistribution. You may reproduce and distribute copies of the
>       Work or Derivative Works thereof in any medium, with or without
>       modifications, and in Source or Object form, provided that You
>       meet the following conditions:
>
>       (a) You must give any other recipients of the Work or
>           Derivative Works a copy of this License; and
>
>       (b) You must cause any modified files to carry prominent notices
>           stating that You changed the files; and
>
>       (c) You must retain, in the Source form of any Derivative Works
>           that You distribute, all copyright, patent, trademark, and
>           attribution notices from the Source form of the Work,
>           excluding those notices that do not pertain to any part of
>           the Derivative Works; and
>
>       (d) If the Work includes a "NOTICE" text file as part of its
>           distribution, then any Derivative Works that You distribute must
>           include a readable copy of the attribution notices contained
>           within such NOTICE file, excluding those notices that do not
>           pertain to any part of the Derivative Works, in at least one
>           of the following places: within a NOTICE text file distributed
>           as part of the Derivative Works; within the Source form or
>           documentation, if provided along with the Derivative Works; or,
>           within a display generated by the Derivative Works, if and
>           wherever such third-party notices normally appear. The contents
>           of the NOTICE file are for informational purposes only and
>           do not modify the License. You may add Your own attribution
>           notices within Derivative Works that You distribute, alongside
>           or as an addendum to the NOTICE text from the Work, provided
>           that such additional attribution notices cannot be construed
>           as modifying the License.
>
>       You may add Your own copyright statement to Your modifications and
>       may provide additional or different license terms and conditions
>       for use, reproduction, or distribution of Your modifications, or
>       for any such Derivative Works as a whole, provided Your use,
>       reproduction, and distribution of the Work otherwise complies with
>       the conditions stated in this License.
>
>    5. Submission of Contributions. Unless You explicitly state otherwise,
>       any Contribution intentionally submitted for inclusion in the Work
>       by You to the Licensor shall be under the terms and conditions of
>       this License, without any additional terms or conditions.
>       Notwithstanding the above, nothing herein shall supersede or modify
>       the terms of any separate license agreement you may have executed
>       with Licensor regarding such Contributions.
>
>    6. Trademarks. This License does not grant permission to use the trade
>       names, trademarks, service marks, or product names of the Licensor,
>       except as required for reasonable and customary use in describing the
>       origin of the Work and reproducing the content of the NOTICE file.
>
>    7. Disclaimer of Warranty. Unless required by applicable law or
>       agreed to in writing, Licensor provides the Work (and each
>       Contributor provides its Contributions) on an "AS IS" BASIS,
>       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
>       implied, including, without limitation, any warranties or conditions
>       of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
>       PARTICULAR PURPOSE. You are solely responsible for determining the
>       appropriateness of using or redistributing the Work and assume any
>       risks associated with Your exercise of permissions under this License.
>
>    8. Limitation of Liability. In no event and under no legal theory,
>       whether in tort (including negligence), contract, or otherwise,
>       unless required by applicable law (such as deliberate and grossly
>       negligent acts) or agreed to in writing, shall any Contributor be
>       liable to You for damages, including any direct, indirect, special,
>       incidental, or consequential damages of any character arising as a
>       result of this License or out of the use or inability to use the
>       Work (including but not limited to damages for loss of goodwill,
>       work stoppage, computer failure or malfunction, or any and all
>       other commercial damages or losses), even if such Contributor
>       has been advised of the possibility of such damages.
>
>    9. Accepting Warranty or Additional Liability. While redistributing
>       the Work or Derivative Works thereof, You may choose to offer,
>       and charge a fee for, acceptance of support, warranty, indemnity,
>       or other liability obligations and/or rights consistent with this
>       License. However, in accepting such obligations, You may act only
>       on Your own behalf and on Your sole responsibility, not on behalf
>       of any other Contributor, and only if You agree to indemnify,
>       defend, and hold each Contributor harmless for any liability
>       incurred by, or claims asserted against, such Contributor by reason
>       of your accepting any such warranty or additional liability.
>
>    END OF TERMS AND CONDITIONS
>
>    APPENDIX: How to apply the Apache License to your work.
>
>       To apply the Apache License to your work, attach the following
>       boilerplate notice, with the fields enclosed by brackets "[]"
>       replaced with your own identifying information. (Don't include
>       the brackets!)  The text should be enclosed in the appropriate
>       comment syntax for the file format. We also recommend that a
>       file or class name and description of purpose be included on the
>       same "printed page" as the copyright notice for easier
>       identification within third-party archives.
>
>    Copyright [yyyy] [name of copyright owner]
>
>    Licensed under the Apache License, Version 2.0 (the "License");
>    you may not use this file except in compliance with the License.
>    You may obtain a copy of the License at
>
>        http://www.apache.org/licenses/LICENSE-2.0
>
>    Unless required by applicable law or agreed to in writing, software
>    distributed under the License is distributed on an "AS IS" BASIS,
>    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
>    See the License for the specific language governing permissions and
>    limitations under the License.
>
> LICENSE-MPL:
>
> Mozilla Public License Version 2.0
> ==================================
>
> 1. Definitions
> --------------
>
> 1.1. "Contributor"
>     means each individual or legal entity that creates, contributes to
>     the creation of, or owns Covered Software.
>
> 1.2. "Contributor Version"
>     means the combination of the Contributions of others (if any) used
>     by a Contributor and that particular Contributor's Contribution.
>
> 1.3. "Contribution"
>     means Covered Software of a particular Contributor.
>
> 1.4. "Covered Software"
>     means Source Code Form to which the initial Contributor has attached
>     the notice in Exhibit A, the Executable Form of such Source Code
>     Form, and Modifications of such Source Code Form, in each case
>     including portions thereof.
>
> 1.5. "Incompatible With Secondary Licenses"
>     means
>
>     (a) that the initial Contributor has attached the notice described
>         in Exhibit B to the Covered Software; or
>
>     (b) that the Covered Software was made available under the terms of
>         version 1.1 or earlier of the License, but not also under the
>         terms of a Secondary License.
>
> 1.6. "Executable Form"
>     means any form of the work other than Source Code Form.
>
> 1.7. "Larger Work"
>     means a work that combines Covered Software with other material, in 
>     a separate file or files, that is not Covered Software.
>
> 1.8. "License"
>     means this document.
>
> 1.9. "Licensable"
>     means having the right to grant, to the maximum extent possible,
>     whether at the time of the initial grant or subsequently, any and
>     all of the rights conveyed by this License.
>
> 1.10. "Modifications"
>     means any of the following:
>
>     (a) any file in Source Code Form that results from an addition to,
>         deletion from, or modification of the contents of Covered
>         Software; or
>
>     (b) any new file in Source Code Form that contains any Covered
>         Software.
>
> 1.11. "Patent Claims" of a Contributor
>     means any patent claim(s), including without limitation, method,
>     process, and apparatus claims, in any patent Licensable by such
>     Contributor that would be infringed, but for the grant of the
>     License, by the making, using, selling, offering for sale, having
>     made, import, or transfer of either its Contributions or its
>     Contributor Version.
>
> 1.12. "Secondary License"
>     means either the GNU General Public License, Version 2.0, the GNU
>     Lesser General Public License, Version 2.1, the GNU Affero General
>     Public License, Version 3.0, or any later versions of those
>     licenses.
>
> 1.13. "Source Code Form"
>     means the form of the work preferred for making modifications.
>
> 1.14. "You" (or "Your")
>     means an individual or a legal entity exercising rights under this
>     License. For legal entities, "You" includes any entity that
>     controls, is controlled by, or is under common control with You. For
>     purposes of this definition, "control" means (a) the power, direct
>     or indirect, to cause the direction or management of such entity,
>     whether by contract or otherwise, or (b) ownership of more than
>     fifty percent (50%) of the outstanding shares or beneficial
>     ownership of such entity.
>
> 2. License Grants and Conditions
> --------------------------------
>
> 2.1. Grants
>
> Each Contributor hereby grants You a world-wide, royalty-free,
> non-exclusive license:
>
> (a) under intellectual property rights (other than patent or trademark)
>     Licensable by such Contributor to use, reproduce, make available,
>     modify, display, perform, distribute, and otherwise exploit its
>     Contributions, either on an unmodified basis, with Modifications, or
>     as part of a Larger Work; and
>
> (b) under Patent Claims of such Contributor to make, use, sell, offer
>     for sale, have made, import, and otherwise transfer either its
>     Contributions or its Contributor Version.
>
> 2.2. Effective Date
>
> The licenses granted in Section 2.1 with respect to any Contribution
> become effective for each Contribution on the date the Contributor first
> distributes such Contribution.
>
> 2.3. Limitations on Grant Scope
>
> The licenses granted in this Section 2 are the only rights granted under
> this License. No additional rights or licenses will be implied from the
> distribution or licensing of Covered Software under this License.
> Notwithstanding Section 2.1(b) above, no patent license is granted by a
> Contributor:
>
> (a) for any code that a Contributor has removed from Covered Software;
>     or
>
> (b) for infringements caused by: (i) Your and any other third party's
>     modifications of Covered Software, or (ii) the combination of its
>     Contributions with other software (except as part of its Contributor
>     Version); or
>
> (c) under Patent Claims infringed by Covered Software in the absence of
>     its Contributions.
>
> This License does not grant any rights in the trademarks, service marks,
> or logos of any Contributor (except as may be necessary to comply with
> the notice requirements in Section 3.4).
>
> 2.4. Subsequent Licenses
>
> No Contributor makes additional grants as a result of Your choice to
> distribute the Covered Software under a subsequent version of this
> License (see Section 10.2) or under the terms of a Secondary License (if
> permitted under the terms of Section 3.3).
>
> 2.5. Representation
>
> Each Contributor represents that the Contributor believes its
> Contributions are its original creation(s) or it has sufficient rights
> to grant the rights to its Contributions conveyed by this License.
>
> 2.6. Fair Use
>
> This License is not intended to limit any rights You have under
> applicable copyright doctrines of fair use, fair dealing, or other
> equivalents.
>
> 2.7. Conditions
>
> Sections 3.1, 3.2, 3.3, and 3.4 are conditions of the licenses granted
> in Section 2.1.
>
> 3. Responsibilities
> -------------------
>
> 3.1. Distribution of Source Form
>
> All distribution of Covered Software in Source Code Form, including any
> Modifications that You create or to which You contribute, must be under
> the terms of this License. You must inform recipients that the Source
> Code Form of the Covered Software is governed by the terms of this
> License, and how they can obtain a copy of this License. You may not
> attempt to alter or restrict the recipients' rights in the Source Code
> Form.
>
> 3.2. Distribution of Executable Form
>
> If You distribute Covered Software in Executable Form then:
>
> (a) such Covered Software must also be made available in Source Code
>     Form, as described in Section 3.1, and You must inform recipients of
>     the Executable Form how they can obtain a copy of such Source Code
>     Form by reasonable means in a timely manner, at a charge no more
>     than the cost of distribution to the recipient; and
>
> (b) You may distribute such Executable Form under the terms of this
>     License, or sublicense it under different terms, provided that the
>     license for the Executable Form does not attempt to limit or alter
>     the recipients' rights in the Source Code Form under this License.
>
> 3.3. Distribution of a Larger Work
>
> You may create and distribute a Larger Work under terms of Your choice,
> provided that You also comply with the requirements of this License for
> the Covered Software. If the Larger Work is a combination of Covered
> Software with a work governed by one or more Secondary Licenses, and the
> Covered Software is not Incompatible With Secondary Licenses, this
> License permits You to additionally distribute such Covered Software
> under the terms of such Secondary License(s), so that the recipient of
> the Larger Work may, at their option, further distribute the Covered
> Software under the terms of either this License or such Secondary
> License(s).
>
> 3.4. Notices
>
> You may not remove or alter the substance of any license notices
> (including copyright notices, patent notices, disclaimers of warranty,
> or limitations of liability) contained within the Source Code Form of
> the Covered Software, except that You may alter any license notices to
> the extent required to remedy known factual inaccuracies.
>
> 3.5. Application of Additional Terms
>
> You may choose to offer, and to charge a fee for, warranty, support,
> indemnity or liability obligations to one or more recipients of Covered
> Software. However, You may do so only on Your own behalf, and not on
> behalf of any Contributor. You must make it absolutely clear that any
> such warranty, support, indemnity, or liability obligation is offered by
> You alone, and You hereby agree to indemnify every Contributor for any
> liability incurred by such Contributor as a result of warranty, support,
> indemnity or liability terms You offer. You may include additional
> disclaimers of warranty and limitations of liability specific to any
> jurisdiction.
>
> 4. Inability to Comply Due to Statute or Regulation
> ---------------------------------------------------
>
> If it is impossible for You to comply with any of the terms of this
> License with respect to some or all of the Covered Software due to
> statute, judicial order, or regulation then You must: (a) comply with
> the terms of this License to the maximum extent possible; and (b)
> describe the limitations and the code they affect. Such description must
> be placed in a text file included with all distributions of the Covered
> Software under this License. Except to the extent prohibited by statute
> or regulation, such description must be sufficiently detailed for a
> recipient of ordinary skill to be able to understand it.
>
> 5. Termination
> --------------
>
> 5.1. The rights granted under this License will terminate automatically
> if You fail to comply with any of its terms. However, if You become
> compliant, then the rights granted under this License from a particular
> Contributor are reinstated (a) provisionally, unless and until such
> Contributor explicitly and finally terminates Your grants, and (b) on an
> ongoing basis, if such Contributor fails to notify You of the
> non-compliance by some reasonable means prior to 60 days after You have
> come back into compliance. Moreover, Your grants from a particular
> Contributor are reinstated on an ongoing basis if such Contributor
> notifies You of the non-compliance by some reasonable means, this is the
> first time You have received notice of non-compliance with this License
> from such Contributor, and You become compliant prior to 30 days after
> Your receipt of the notice.
>
> 5.2. If You initiate litigation against any entity by asserting a patent
> infringement claim (excluding declaratory judgment actions,
> counter-claims, and cross-claims) alleging that a Contributor Version
> directly or indirectly infringes any patent, then the rights granted to
> You by any and all Contributors for the Covered Software under Section
> 2.1 of this License shall terminate.
>
> 5.3. In the event of termination under Sections 5.1 or 5.2 above, all
> end user license agreements (excluding distributors and resellers) which
> have been validly granted by You or Your distributors under this License
> prior to termination shall survive termination.
>
> ************************************************************************
> *                                                                      *
> *  6. Disclaimer of Warranty                                           *
> *  -------------------------                                           *
> *                                                                      *
> *  Covered Software is provided under this License on an "as is"       *
> *  basis, without warranty of any kind, either expressed, implied, or  *
> *  statutory, including, without limitation, warranties that the       *
> *  Covered Software is free of defects, merchantable, fit for a        *
> *  particular purpose or non-infringing. The entire risk as to the     *
> *  quality and performance of the Covered Software is with You.        *
> *  Should any Covered Software prove defective in any respect, You     *
> *  (not any Contributor) assume the cost of any necessary servicing,   *
> *  repair, or correction. This disclaimer of warranty constitutes an   *
> *  essential part of this License. No use of any Covered Software is   *
> *  authorized under this License except under this disclaimer.         *
> *                                                                      *
> ************************************************************************
>
> ************************************************************************
> *                                                                      *
> *  7. Limitation of Liability                                          *
> *  --------------------------                                          *
> *                                                                      *
> *  Under no circumstances and under no legal theory, whether tort      *
> *  (including negligence), contract, or otherwise, shall any           *
> *  Contributor, or anyone who distributes Covered Software as          *
> *  permitted above, be liable to You for any direct, indirect,         *
> *  special, incidental, or consequential damages of any character      *
> *  including, without limitation, damages for lost profits, loss of    *
> *  goodwill, work stoppage, computer failure or malfunction, or any    *
> *  and all other commercial damages or losses, even if such party      *
> *  shall have been informed of the possibility of such damages. This   *
> *  limitation of liability shall not apply to liability for death or   *
> *  personal injury resulting from such party's negligence to the       *
> *  extent applicable law prohibits such limitation. Some               *
> *  jurisdictions do not allow the exclusion or limitation of           *
> *  incidental or consequential damages, so this exclusion and          *
> *  limitation may not apply to You.                                    *
> *                                                                      *
> ************************************************************************
>
> 8. Litigation
> -------------
>
> Any litigation relating to this License may be brought only in the
> courts of a jurisdiction where the defendant maintains its principal
> place of business and such litigation shall be governed by laws of that
> jurisdiction, without reference to its conflict-of-law provisions.
> Nothing in this Section shall prevent a party's ability to bring
> cross-claims or counter-claims.
>
> 9. Miscellaneous
> ----------------
>
> This License represents the complete agreement concerning the subject
> matter hereof. If any provision of this License is held to be
> unenforceable, such provision shall be reformed only to the extent
> necessary to make it enforceable. Any law or regulation which provides
> that the language of a contract shall be construed against the drafter
> shall not be used to construe this License against a Contributor.
>
> 10. Versions of the License
> ---------------------------
>
> 10.1. New Versions
>
> Mozilla Foundation is the license steward. Except as provided in Section
> 10.3, no one other than the license steward has the right to modify or
> publish new versions of this License. Each version will be given a
> distinguishing version number.
>
> 10.2. Effect of New Versions
>
> You may distribute the Covered Software under the terms of the version
> of the License under which You originally received the Covered Software,
> or under the terms of any subsequent version published by the license
> steward.
>
> 10.3. Modified Versions
>
> If you create software not governed by this License, and you want to
> create a new license for such software, you may create and use a
> modified version of this License if you rename the license and remove
> any references to the name of the license steward (except to note that
> such modified license differs from this License).
>
> 10.4. Distributing Source Code Form that is Incompatible With Secondary
> Licenses
>
> If You choose to distribute Source Code Form that is Incompatible With
> Secondary Licenses under the terms of this version of the License, the
> notice described in Exhibit B of this License must be attached.
>
> Exhibit A - Source Code Form License Notice
> -------------------------------------------
>
>   This Source Code Form is subject to the terms of the Mozilla Public
>   License, v. 2.0. If a copy of the MPL was not distributed with this
>   file, You can obtain one at http://mozilla.org/MPL/2.0/.
>
> If it is not possible or desirable to put the notice in a particular
> file, then You may include the notice in a location (such as a LICENSE
> file in a relevant directory) where a recipient would be likely to look
> for such a notice.
>
> You may add additional accurate notices of copyright ownership.
>
> Exhibit B - "Incompatible With Secondary Licenses" Notice
> ---------------------------------------------------------
>
>   This Source Code Form is "Incompatible With Secondary Licenses", as
>   defined by the Mozilla Public License, v. 2.0.

#### `dunder-proto` 1.0.1 — MIT

> MIT License
>
> Copyright (c) 2024 ECMAScript Shims
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

#### `ee-first` 1.1.1 — MIT

>
> The MIT License (MIT)
>
> Copyright (c) 2014 Jonathan Ong me@jongleberry.com
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `encodeurl` 2.0.1 — MIT

> (The MIT License)
>
> Copyright (c) 2016 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `es-define-property` 1.0.1 — MIT

> MIT License
>
> Copyright (c) 2024 Jordan Harband
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

#### `es-errors` 1.3.0 — MIT

> MIT License
>
> Copyright (c) 2024 Jordan Harband
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

#### `es-object-atoms` 1.1.2 — MIT

> MIT License
>
> Copyright (c) 2024 Jordan Harband
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

#### `escape-html` 1.0.3 — MIT

> (The MIT License)
>
> Copyright (c) 2012-2013 TJ Holowaychuk
> Copyright (c) 2015 Andreas Lubbe
> Copyright (c) 2015 Tiancheng "Timothy" Gu
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `esm-env` 1.2.2 — MIT

> Copyright 2022 Benjamin McCann
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `esrap` 2.2.9 — MIT

> Copyright (c) 2023-2025 [these people](https://github.com/sveltejs/esrap/graphs/contributors)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `etag` 1.8.1 — MIT

> (The MIT License)
>
> Copyright (c) 2014-2016 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `eventsource` 3.0.7 — MIT

> The MIT License
>
> Copyright (c) EventSource GitHub organisation
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> "Software"), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
> LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
> OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
> WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `eventsource-parser` 3.1.1 — MIT

> MIT License
>
> Copyright (c) 2026 Espen Hovlandsdal <espen@hovlandsdal.com>
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

#### `express` 5.3.0 — MIT

> (The MIT License)
>
> Copyright (c) 2009-2014 TJ Holowaychuk <tj@vision-media.ca>
> Copyright (c) 2013-2014 Roman Shtylman <shtylman+expressjs@gmail.com>
> Copyright (c) 2014-2015 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `express-rate-limit` 8.7.2 — MIT

> MIT License
>
> Copyright 2023 Nathan Friedly, Vedant K
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the "Software"), to deal in
> the Software without restriction, including without limitation the rights to
> use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
> the Software, and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
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

#### `fast-deep-equal` 3.1.3 — MIT

> MIT License
>
> Copyright (c) 2017 Evgeny Poberezkin
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

#### `fast-uri` 3.1.9 — BSD-3-Clause

> Copyright (c) 2011-2021, Gary Court until https://github.com/garycourt/uri-js/commit/a1acf730b4bba3f1097c9f52e7d9d3aba8cdcaae
> Copyright (c) 2021-present The Fastify team <https://github.com/fastify/fastify#team>
> All rights reserved.
>
> Redistribution and use in source and binary forms, with or without
> modification, are permitted provided that the following conditions are met:
>     * Redistributions of source code must retain the above copyright
>       notice, this list of conditions and the following disclaimer.
>     * Redistributions in binary form must reproduce the above copyright
>       notice, this list of conditions and the following disclaimer in the
>       documentation and/or other materials provided with the distribution.
>     * The names of any contributors may not be used to endorse or promote
>       products derived from this software without specific prior written
>       permission.
>
> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
> ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
> WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
> DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS AND CONTRIBUTORS BE LIABLE FOR ANY
> DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
> (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
> LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
> ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
> (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
> SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
>
>                                   *   *   *
>
> The complete list of contributors can be found at:
> - https://github.com/garycourt/uri-js/graphs/contributors

#### `finalhandler` 2.1.1 — MIT

> (The MIT License)
>
> Copyright (c) 2014-2022 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `forwarded` 0.2.0 — MIT

> (The MIT License)
>
> Copyright (c) 2014-2017 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `fresh` 2.0.0 — MIT

> (The MIT License)
>
> Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca>
> Copyright (c) 2016-2017 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `function-bind` 1.1.2 — MIT

> Copyright (c) 2013 Raynos.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `get-intrinsic` 1.3.0 — MIT

> MIT License
>
> Copyright (c) 2020 Jordan Harband
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

#### `get-proto` 1.0.1 — MIT

> MIT License
>
> Copyright (c) 2025 Jordan Harband
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

#### `gopd` 1.2.0 — MIT

> MIT License
>
> Copyright (c) 2022 Jordan Harband
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

#### `has-symbols` 1.1.0 — MIT

> MIT License
>
> Copyright (c) 2016 Jordan Harband
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

#### `hasown` 2.0.4 — MIT

> MIT License
>
> Copyright (c) Jordan Harband and contributors
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

#### `hono` 4.13.14 — MIT

> MIT License
>
> Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
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

#### `htm` 3.1.1 — Apache-2.0

>
>                                  Apache License
>                            Version 2.0, January 2004
>                         http://www.apache.org/licenses/
>
>    TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
>
>    1. Definitions.
>
>       "License" shall mean the terms and conditions for use, reproduction,
>       and distribution as defined by Sections 1 through 9 of this document.
>
>       "Licensor" shall mean the copyright owner or entity authorized by
>       the copyright owner that is granting the License.
>
>       "Legal Entity" shall mean the union of the acting entity and all
>       other entities that control, are controlled by, or are under common
>       control with that entity. For the purposes of this definition,
>       "control" means (i) the power, direct or indirect, to cause the
>       direction or management of such entity, whether by contract or
>       otherwise, or (ii) ownership of fifty percent (50%) or more of the
>       outstanding shares, or (iii) beneficial ownership of such entity.
>
>       "You" (or "Your") shall mean an individual or Legal Entity
>       exercising permissions granted by this License.
>
>       "Source" form shall mean the preferred form for making modifications,
>       including but not limited to software source code, documentation
>       source, and configuration files.
>
>       "Object" form shall mean any form resulting from mechanical
>       transformation or translation of a Source form, including but
>       not limited to compiled object code, generated documentation,
>       and conversions to other media types.
>
>       "Work" shall mean the work of authorship, whether in Source or
>       Object form, made available under the License, as indicated by a
>       copyright notice that is included in or attached to the work
>       (an example is provided in the Appendix below).
>
>       "Derivative Works" shall mean any work, whether in Source or Object
>       form, that is based on (or derived from) the Work and for which the
>       editorial revisions, annotations, elaborations, or other modifications
>       represent, as a whole, an original work of authorship. For the purposes
>       of this License, Derivative Works shall not include works that remain
>       separable from, or merely link (or bind by name) to the interfaces of,
>       the Work and Derivative Works thereof.
>
>       "Contribution" shall mean any work of authorship, including
>       the original version of the Work and any modifications or additions
>       to that Work or Derivative Works thereof, that is intentionally
>       submitted to Licensor for inclusion in the Work by the copyright owner
>       or by an individual or Legal Entity authorized to submit on behalf of
>       the copyright owner. For the purposes of this definition, "submitted"
>       means any form of electronic, verbal, or written communication sent
>       to the Licensor or its representatives, including but not limited to
>       communication on electronic mailing lists, source code control systems,
>       and issue tracking systems that are managed by, or on behalf of, the
>       Licensor for the purpose of discussing and improving the Work, but
>       excluding communication that is conspicuously marked or otherwise
>       designated in writing by the copyright owner as "Not a Contribution."
>
>       "Contributor" shall mean Licensor and any individual or Legal Entity
>       on behalf of whom a Contribution has been received by Licensor and
>       subsequently incorporated within the Work.
>
>    2. Grant of Copyright License. Subject to the terms and conditions of
>       this License, each Contributor hereby grants to You a perpetual,
>       worldwide, non-exclusive, no-charge, royalty-free, irrevocable
>       copyright license to reproduce, prepare Derivative Works of,
>       publicly display, publicly perform, sublicense, and distribute the
>       Work and such Derivative Works in Source or Object form.
>
>    3. Grant of Patent License. Subject to the terms and conditions of
>       this License, each Contributor hereby grants to You a perpetual,
>       worldwide, non-exclusive, no-charge, royalty-free, irrevocable
>       (except as stated in this section) patent license to make, have made,
>       use, offer to sell, sell, import, and otherwise transfer the Work,
>       where such license applies only to those patent claims licensable
>       by such Contributor that are necessarily infringed by their
>       Contribution(s) alone or by combination of their Contribution(s)
>       with the Work to which such Contribution(s) was submitted. If You
>       institute patent litigation against any entity (including a
>       cross-claim or counterclaim in a lawsuit) alleging that the Work
>       or a Contribution incorporated within the Work constitutes direct
>       or contributory patent infringement, then any patent licenses
>       granted to You under this License for that Work shall terminate
>       as of the date such litigation is filed.
>
>    4. Redistribution. You may reproduce and distribute copies of the
>       Work or Derivative Works thereof in any medium, with or without
>       modifications, and in Source or Object form, provided that You
>       meet the following conditions:
>
>       (a) You must give any other recipients of the Work or
>           Derivative Works a copy of this License; and
>
>       (b) You must cause any modified files to carry prominent notices
>           stating that You changed the files; and
>
>       (c) You must retain, in the Source form of any Derivative Works
>           that You distribute, all copyright, patent, trademark, and
>           attribution notices from the Source form of the Work,
>           excluding those notices that do not pertain to any part of
>           the Derivative Works; and
>
>       (d) If the Work includes a "NOTICE" text file as part of its
>           distribution, then any Derivative Works that You distribute must
>           include a readable copy of the attribution notices contained
>           within such NOTICE file, excluding those notices that do not
>           pertain to any part of the Derivative Works, in at least one
>           of the following places: within a NOTICE text file distributed
>           as part of the Derivative Works; within the Source form or
>           documentation, if provided along with the Derivative Works; or,
>           within a display generated by the Derivative Works, if and
>           wherever such third-party notices normally appear. The contents
>           of the NOTICE file are for informational purposes only and
>           do not modify the License. You may add Your own attribution
>           notices within Derivative Works that You distribute, alongside
>           or as an addendum to the NOTICE text from the Work, provided
>           that such additional attribution notices cannot be construed
>           as modifying the License.
>
>       You may add Your own copyright statement to Your modifications and
>       may provide additional or different license terms and conditions
>       for use, reproduction, or distribution of Your modifications, or
>       for any such Derivative Works as a whole, provided Your use,
>       reproduction, and distribution of the Work otherwise complies with
>       the conditions stated in this License.
>
>    5. Submission of Contributions. Unless You explicitly state otherwise,
>       any Contribution intentionally submitted for inclusion in the Work
>       by You to the Licensor shall be under the terms and conditions of
>       this License, without any additional terms or conditions.
>       Notwithstanding the above, nothing herein shall supersede or modify
>       the terms of any separate license agreement you may have executed
>       with Licensor regarding such Contributions.
>
>    6. Trademarks. This License does not grant permission to use the trade
>       names, trademarks, service marks, or product names of the Licensor,
>       except as required for reasonable and customary use in describing the
>       origin of the Work and reproducing the content of the NOTICE file.
>
>    7. Disclaimer of Warranty. Unless required by applicable law or
>       agreed to in writing, Licensor provides the Work (and each
>       Contributor provides its Contributions) on an "AS IS" BASIS,
>       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
>       implied, including, without limitation, any warranties or conditions
>       of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
>       PARTICULAR PURPOSE. You are solely responsible for determining the
>       appropriateness of using or redistributing the Work and assume any
>       risks associated with Your exercise of permissions under this License.
>
>    8. Limitation of Liability. In no event and under no legal theory,
>       whether in tort (including negligence), contract, or otherwise,
>       unless required by applicable law (such as deliberate and grossly
>       negligent acts) or agreed to in writing, shall any Contributor be
>       liable to You for damages, including any direct, indirect, special,
>       incidental, or consequential damages of any character arising as a
>       result of this License or out of the use or inability to use the
>       Work (including but not limited to damages for loss of goodwill,
>       work stoppage, computer failure or malfunction, or any and all
>       other commercial damages or losses), even if such Contributor
>       has been advised of the possibility of such damages.
>
>    9. Accepting Warranty or Additional Liability. While redistributing
>       the Work or Derivative Works thereof, You may choose to offer,
>       and charge a fee for, acceptance of support, warranty, indemnity,
>       or other liability obligations and/or rights consistent with this
>       License. However, in accepting such obligations, You may act only
>       on Your own behalf and on Your sole responsibility, not on behalf
>       of any other Contributor, and only if You agree to indemnify,
>       defend, and hold each Contributor harmless for any liability
>       incurred by, or claims asserted against, such Contributor by reason
>       of your accepting any such warranty or additional liability.
>
>    END OF TERMS AND CONDITIONS
>
>    APPENDIX: How to apply the Apache License to your work.
>
>       To apply the Apache License to your work, attach the following
>       boilerplate notice, with the fields enclosed by brackets "[]"
>       replaced with your own identifying information. (Don't include
>       the brackets!)  The text should be enclosed in the appropriate
>       comment syntax for the file format. We also recommend that a
>       file or class name and description of purpose be included on the
>       same "printed page" as the copyright notice for easier
>       identification within third-party archives.
>
>    Copyright 2018 Google Inc.
>
>    Licensed under the Apache License, Version 2.0 (the "License");
>    you may not use this file except in compliance with the License.
>    You may obtain a copy of the License at
>
>        http://www.apache.org/licenses/LICENSE-2.0
>
>    Unless required by applicable law or agreed to in writing, software
>    distributed under the License is distributed on an "AS IS" BASIS,
>    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
>    See the License for the specific language governing permissions and
>    limitations under the License.

#### `http-errors` 2.0.1 — MIT

>
> The MIT License (MIT)
>
> Copyright (c) 2014 Jonathan Ong me@jongleberry.com
> Copyright (c) 2016 Douglas Christopher Wilson doug@somethingdoug.com
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `iconv-lite` 0.7.3 — MIT

> Copyright (c) 2011 Alexander Shtuchkin
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> "Software"), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
> LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
> OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
> WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `ids` 3.0.2 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2014 camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `inherits` 2.0.4 — ISC

> The ISC License
>
> Copyright (c) Isaac Z. Schlueter
>
> Permission to use, copy, modify, and/or distribute this software for any
> purpose with or without fee is hereby granted, provided that the above
> copyright notice and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
> REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
> FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
> INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
> LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
> OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
> PERFORMANCE OF THIS SOFTWARE.

#### `inherits-browser` 0.1.0 — ISC

> The ISC License
>
> Copyright (c) 2022-present Nico Rehwaldt
> Copyright (c) 2011-2022 Isaac Z. Schlueter
>
> Permission to use, copy, modify, and/or distribute this software for any
> purpose with or without fee is hereby granted, provided that the above
> copyright notice and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
> REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
> FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
> INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
> LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
> OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
> PERFORMANCE OF THIS SOFTWARE.

#### `ip-address` 10.7.5 — MIT

> Copyright (C) 2011 by Beau Gunderson
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `ipaddr.js` 1.9.1 — MIT

> Copyright (C) 2011-2017 whitequark <whitequark@whitequark.org>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `is-promise` 4.0.0 — MIT

> Copyright (c) 2014 Forbes Lindesay
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `is-reference` 3.0.3 — MIT

> `source-gap` : le paquet publié ne contient aucun fichier de licence.
> Identifiant déclaré dans son manifeste : MIT.
> Auteur déclaré : Rich Harris.
> Dépôt déclaré : git+https://github.com/Rich-Harris/is-reference.git.
> Le texte doit être relu à la source avant toute redistribution d'une copie
> de ce paquet.

#### `isexe` 2.0.0 — ISC

> The ISC License
>
> Copyright (c) Isaac Z. Schlueter and Contributors
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
> ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
> IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

#### `jose` 6.2.3 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2018 Filip Skokan
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

#### `json-schema-traverse` 1.0.0 — MIT

> MIT License
>
> Copyright (c) 2017 Evgeny Poberezkin
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

#### `json-schema-typed` 8.0.2 — BSD-2-Clause

> BSD 2-Clause License
> 
> Original source code is copyright (c) 2019-2025 Remy Rylan
> <https://github.com/RemyRylan>
> 
> All JSON Schema documentation and descriptions are copyright (c):
> 
> 2009 [draft-0] IETF Trust <https://www.ietf.org/>, Kris Zyp <kris@sitepen.com>,
> and SitePen (USA) <https://www.sitepen.com/>.
> 
> 2009 [draft-1] IETF Trust <https://www.ietf.org/>, Kris Zyp <kris@sitepen.com>,
> and SitePen (USA) <https://www.sitepen.com/>.
> 
> 2010 [draft-2] IETF Trust <https://www.ietf.org/>, Kris Zyp <kris@sitepen.com>,
> and SitePen (USA) <https://www.sitepen.com/>.
> 
> 2010 [draft-3] IETF Trust <https://www.ietf.org/>, Kris Zyp <kris@sitepen.com>,
> Gary Court <gary.court@gmail.com>, and SitePen (USA) <https://www.sitepen.com/>.
> 
> 2013 [draft-4] IETF Trust <https://www.ietf.org/>), Francis Galiegue
> <fgaliegue@gmail.com>, Kris Zyp <kris@sitepen.com>, Gary Court
> <gary.court@gmail.com>, and SitePen (USA) <https://www.sitepen.com/>.
> 
> 2018 [draft-7] IETF Trust <https://www.ietf.org/>, Austin Wright <aaa@bzfx.net>,
> Henry Andrews <henry@cloudflare.com>, Geraint Luff <luffgd@gmail.com>, and
> Cloudflare, Inc. <https://www.cloudflare.com/>.
> 
> 2019 [draft-2019-09] IETF Trust <https://www.ietf.org/>, Austin Wright
> <aaa@bzfx.net>, Henry Andrews <andrews_henry@yahoo.com>, Ben Hutton
> <bh7@sanger.ac.uk>, and Greg Dennis <gregsdennis@yahoo.com>.
> 
> 2020 [draft-2020-12] IETF Trust <https://www.ietf.org/>, Austin Wright
> <aaa@bzfx.net>, Henry Andrews <andrews_henry@yahoo.com>, Ben Hutton
> <ben@jsonschema.dev>, and Greg Dennis <gregsdennis@yahoo.com>.
> 
> All rights reserved.
> 
> Redistribution and use in source and binary forms, with or without modification,
> are permitted provided that the following conditions are met:
> 
> 1. Redistributions of source code must retain the above copyright notice, this
>    list of conditions and the following disclaimer.
> 
> 2. Redistributions in binary form must reproduce the above copyright notice,
>    this list of conditions and the following disclaimer in the documentation
>    and/or other materials provided with the distribution.
> 
> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
> ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
> WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
> DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
> ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
> (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
> LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
> ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
> (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
> SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

#### `locate-character` 3.0.0 — MIT

> `source-gap` : le paquet publié ne contient aucun fichier de licence.
> Identifiant déclaré dans son manifeste : MIT.
> Auteur déclaré : Rich Harris.
> Dépôt déclaré : git+https://gitlab.com/Rich-Harris/locate-character.git.
> Le texte doit être relu à la source avant toute redistribution d'une copie
> de ce paquet.

#### `magic-string` 0.30.21 — MIT

> Copyright 2018 Rich Harris
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `math-intrinsics` 1.1.0 — MIT

> MIT License
>
> Copyright (c) 2024 ECMAScript Shims
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

#### `media-typer` 1.1.1 — MIT

> (The MIT License)
>
> Copyright (c) 2014-2017 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `merge-descriptors` 2.0.0 — MIT

> MIT License
>
> Copyright (c) Jonathan Ong <me@jongleberry.com>
> Copyright (c) Douglas Christopher Wilson <doug@somethingdoug.com>
> Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `mime-db` 1.54.0 — MIT

> (The MIT License)
>
> Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
> Copyright (c) 2015-2022 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `mime-types` 3.0.2 — MIT

> (The MIT License)
>
> Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
> Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `min-dash` 5.1.0 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2017-present camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `min-dom` 5.3.0 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2014 Nico Rehwaldt
> Copyright (c) 2015-present camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `moddle` 8.2.1 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2014-present Camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `moddle-xml` 12.3.2 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2014-present Camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `ms` 2.1.3 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2020 Vercel, Inc.
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

#### `negotiator` 1.1.0 — MIT

> (The MIT License)
>
> Copyright (c) 2012-2014 Federico Romero
> Copyright (c) 2012-2014 Isaac Z. Schlueter
> Copyright (c) 2014-2015 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `object-assign` 4.1.1 — MIT

> The MIT License (MIT)
>
> Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `object-inspect` 1.13.4 — MIT

> MIT License
>
> Copyright (c) 2013 James Halliday
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

#### `object-refs` 0.4.0 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2014-present camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `on-finished` 2.4.2 — MIT

> (The MIT License)
>
> Copyright (c) 2013 Jonathan Ong <me@jongleberry.com>
> Copyright (c) 2014 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `once` 1.4.0 — ISC

> The ISC License
>
> Copyright (c) Isaac Z. Schlueter and Contributors
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
> ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
> IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

#### `parseurl` 1.3.3 — MIT

>
> (The MIT License)
>
> Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
> Copyright (c) 2014-2017 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `path-intersection` 4.2.1 — MIT

> LICENSE:
>
> The MIT License (MIT)
>
> Copyright (c) 2017 camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
>
> NOTICE:
>
> path-intersection is licensed under the MIT license, 2017 (see LICENSE file).
>
> It's implementation is derived from the intersection login used in
> Snap.svg. See license notice below:
>
>
>     https://github.com/adobe-webplatform/Snap.svg
>
>     Copyright 2013 Adobe Systems Incorporated
>
>     Licensed under the Apache License, Version 2.0 (the "License");
>     you may not use this file except in compliance with the License.
>     You may obtain a copy of the License at
>
>        http://www.apache.org/licenses/LICENSE-2.0
>
>     Unless required by applicable law or agreed to in writing, software
>     distributed under the License is distributed on an "AS IS" BASIS,
>     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
>     See the License for the specific language governing permissions and
>     limitations under the License.

#### `path-key` 3.1.1 — MIT

> MIT License
>
> Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `path-to-regexp` 8.4.2 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2014 Blake Embrey (hello@blakeembrey.com)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `pkce-challenge` 5.0.1 — MIT

> MIT License
>
> Copyright (c) 2019 
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

#### `preact` 10.29.8 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2015-present Jason Miller
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

#### `proxy-addr` 2.0.8 — MIT

> (The MIT License)
>
> Copyright (c) 2014-2016 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `qs` 6.17.1 — BSD-3-Clause

> BSD 3-Clause License
>
> Copyright (c) 2014, Nathan LaFreniere and other [contributors](https://github.com/ljharb/qs/graphs/contributors)
> All rights reserved.
>
> Redistribution and use in source and binary forms, with or without
> modification, are permitted provided that the following conditions are met:
>
> 1. Redistributions of source code must retain the above copyright notice, this
>    list of conditions and the following disclaimer.
>
> 2. Redistributions in binary form must reproduce the above copyright notice,
>    this list of conditions and the following disclaimer in the documentation
>    and/or other materials provided with the distribution.
>
> 3. Neither the name of the copyright holder nor the names of its
>    contributors may be used to endorse or promote products derived from
>    this software without specific prior written permission.
>
> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
> AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
> IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
> DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
> FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
> DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
> SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
> CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
> OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
> OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

#### `range-parser` 1.3.0 — MIT

> (The MIT License)
>
> Copyright (c) 2012-2014 TJ Holowaychuk <tj@vision-media.ca>
> Copyright (c) 2015-2016 Douglas Christopher Wilson <doug@somethingdoug.com
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `raw-body` 3.0.2 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2013-2014 Jonathan Ong <me@jongleberry.com>
> Copyright (c) 2014-2022 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `require-from-string` 2.0.2 — MIT

> The MIT License (MIT)
>
> Copyright (c) Vsevolod Strukchinsky <floatdrop@gmail.com> (github.com/floatdrop)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `router` 2.2.0 — MIT

> (The MIT License)
>
> Copyright (c) 2013 Roman Shtylman
> Copyright (c) 2014-2022 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `safer-buffer` 2.1.2 — MIT

> MIT License
>
> Copyright (c) 2018 Nikita Skovoroda <chalkerx@gmail.com>
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

#### `saxen` 11.2.0 — MIT

> The MIT License (MIT)
> Copyright (c) 2012 Vopilovskii Konstantin   <flash.vkv@gmail.com>
> Copyright (c) 2017-present Nico Rehwaldt
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the "Software"), to deal in
> the Software without restriction, including without limitation the rights to
> use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
> of the Software, and to permit persons to whom the Software is furnished to do
> so, subject to the following conditions:
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

#### `send` 1.2.1 — MIT

> (The MIT License)
>
> Copyright (c) 2012 TJ Holowaychuk
> Copyright (c) 2014-2022 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `serve-static` 2.2.1 — MIT

> (The MIT License)
>
> Copyright (c) 2010 Sencha Inc.
> Copyright (c) 2011 LearnBoost
> Copyright (c) 2011 TJ Holowaychuk
> Copyright (c) 2014-2016 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `setprototypeof` 1.2.0 — ISC

> Copyright (c) 2015, Wes Todd
>
> Permission to use, copy, modify, and/or distribute this software for any
> purpose with or without fee is hereby granted, provided that the above
> copyright notice and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
> WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
> MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
> SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
> WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
> OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
> CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

#### `shebang-command` 2.0.0 — MIT

> MIT License
>
> Copyright (c) Kevin Mårtensson <kevinmartensson@gmail.com> (github.com/kevva)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `shebang-regex` 3.0.0 — MIT

> MIT License
>
> Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `side-channel` 1.1.1 — MIT

> MIT License
>
> Copyright (c) 2019 Jordan Harband
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

#### `side-channel-list` 1.0.1 — MIT

> MIT License
>
> Copyright (c) 2024 Jordan Harband
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

#### `side-channel-map` 1.0.1 — MIT

> MIT License
>
> Copyright (c) 2024 Jordan Harband
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

#### `side-channel-weakmap` 1.0.2 — MIT

> MIT License
>
> Copyright (c) 2019 Jordan Harband
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

#### `statuses` 2.0.2 — MIT

>
> The MIT License (MIT)
>
> Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
> Copyright (c) 2016 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `svelte` 5.55.7 — MIT

> Copyright (c) 2016-2025 [Svelte Contributors](https://github.com/sveltejs/svelte/graphs/contributors)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `tiny-svg` 4.1.4 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2014 Nico Rehwaldt
> Copyright (c) 2015-present camunda Services GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

#### `toidentifier` 1.0.1 — MIT

> MIT License
>
> Copyright (c) 2016 Douglas Christopher Wilson <doug@somethingdoug.com>
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

#### `type-is` 2.1.0 — MIT

> (The MIT License)
>
> Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
> Copyright (c) 2014-2015 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `ulid` 3.0.2 — MIT

> The MIT License (MIT)
>
> Copyright (c) 2017 Alizain Feerasta
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

#### `unpipe` 1.0.0 — MIT

> (The MIT License)
>
> Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `vary` 1.1.2 — MIT

> (The MIT License)
>
> Copyright (c) 2014-2017 Douglas Christopher Wilson
>
> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#### `which` 2.0.2 — ISC

> The ISC License
>
> Copyright (c) Isaac Z. Schlueter and Contributors
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
> ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
> IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

#### `wrappy` 1.0.2 — ISC

> The ISC License
>
> Copyright (c) Isaac Z. Schlueter and Contributors
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
> ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
> IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

#### `yaml` 2.9.0 — ISC

> Copyright Eemeli Aro <eemeli@gmail.com>
>
> Permission to use, copy, modify, and/or distribute this software for any purpose
> with or without fee is hereby granted, provided that the above copyright notice
> and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
> REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
> FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
> INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
> OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
> TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
> THIS SOFTWARE.

#### `zimmerframe` 1.1.4 — MIT

> MIT License
>
> Copyright (c) 2023 [these people](https://github.com/Rich-Harris/zimmerframe/graphs/contributors)
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

#### `zod` 3.25.76 — MIT

> MIT License
>
> Copyright (c) 2025 Colin McDonnell
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

#### `zod-to-json-schema` 3.25.2 — ISC

> ISC License
>
> Copyright (c) 2020, Stefan Terdell
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
