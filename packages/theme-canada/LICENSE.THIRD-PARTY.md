<!-- GÉNÉRÉ par scripts/generate-third-party-notices.mjs — ne pas éditer à la main. -->
<!-- Régénérer : `npm run notices:generate`. La dérive fait échouer `npm run licensing:check`. -->

# Notices de tiers — `@sentropic/design-system-theme-canada`

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

Ce paquet porte par ailleurs une section « Points ouverts », plus bas :
elle nomme ce que cette mesure ne couvre pas.

## 2. Dépendances installées avec ce paquet

Aucune. Ce paquet ne déclare aucune dépendance tierce : installer ce paquet
n'installe aucun code tiers de notre fait.

## Points ouverts

Cette section consigne l'attribution amont de ce paquet, puis ce qui, à son sujet, reste ouvert. Décision de l'owner : les trois thèmes d'État restent sous MIT et citent leur source. Vérifié le 2026-09-21.

### Système amont

- **Système** : Système de design GC (GC Design System, GCDS).
- **Éditeur** : Service numérique canadien – Canadian Digital Service, gouvernement du Canada.
- **Sources** : jetons, https://github.com/cds-snc/gcds-tokens (paquet npm `@gcds-core/tokens`) ; composants, https://github.com/cds-snc/gcds-components (paquet npm `@gcds-core/components`). Documentation : https://design-system.canada.ca/
- **Ce qui est transcrit** : des valeurs et des noms de jetons `--gcds-*` (couleurs, rayons) et des métriques de composants relevées sur le rendu GCDS (hauteurs, marges, focus), réécrites à la main dans `src/index.ts` et compilées dans `dist/`. Aucun fichier GCDS n'est recopié. Valeurs recoupées sur `build/web/css/` de `gcds-tokens` au 2026-09-21.
- **Date de transcription** : 2026-06-11, d'après l'historique git de `packages/theme-canada/src/index.ts`. Version amont exacte : `unverified`. Les deux fichiers `LICENSE` amont sont inchangés depuis 2021 et 2018 : le régime ci-dessous est celui de la date de transcription.

### Licence amont : MIT

Jetons — `cds-snc/gcds-tokens`, fichier `LICENSE` (blob `a8a69f4c0bd864d71c538a0547b81adbdd4d9b83`, identique au tag `@gcds-core/tokens-v1.6.0` ; dernière modification : commit `be88021f1f6ca7275fede37267aecd56e13900b5`, 2021-09-15). Reproduit tel quel :

> MIT License
>
> Copyright (c) 2021 Canadian Digital Service – Service numérique canadien
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

Composants — `cds-snc/gcds-components`, fichier `LICENSE` (blob `b442934b7df2ca786056d5ee739d2f3dd4f2661a`, identique au tag `@gcds-core/components-v1.6.0` ; dernière modification : commit `3155230076543c123b4af75a721de0ecbc184eb4`, 2018-11-24). La ligne de copyright amont ne nomme aucun titulaire. Reproduit tel quel :

> MIT License
>
> Copyright (c) 2018
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

### Ce paquet

Le code de transcription de ce paquet, c'est-à-dire la mise en correspondance de ces valeurs sur la structure `TenantTheme`, est publié sous MIT : voir `LICENSE`. Cette licence ne couvre que ce code. Ce paquet n'est pas un produit officiel du gouvernement du Canada, qui ne l'a ni approuvé ni cautionné.

### Marques et emblèmes d'État : hors de toute licence

Les symboles officiels du gouvernement du Canada relèvent du Programme de coordination de l'image de marque (PCIM, en anglais Federal Identity Program), et non de la licence MIT des dépôts GCDS. Ces symboles sont la signature du gouvernement du Canada, le mot-symbole « Canada » et les armoiries du Canada. Règle publiée par l'éditeur, en substance (« Legal protection of the official symbols of the Government of Canada », canada.ca, modifiée le 2026-08-07) :

- leur usage est réservé aux communications, aux opérations et aux activités du gouvernement du Canada ;
- ils sont protégés contre tout usage non autorisé, au Canada et à l'étranger, avec toutes leurs variantes de dessin et de couleur, par la Loi sur les marques de commerce (par. 9(1), marques interdites), par la Loi sur le droit d'auteur et par l'article 6ter de la Convention de Paris ;
- les dessins, logos ou marques qui leur ressemblent ou peuvent être confondus avec eux sont poursuivis comme usage non autorisé ;
- toute demande de reproduction s'adresse au ministère fédéral responsable du sujet.

Ce que ce paquet embarque, mesuré avec `npm pack --dry-run` :

- le tarball contient `LICENSE`, `LICENSE.THIRD-PARTY.md`, `package.json` et, sous `dist/`, `index.js`, `index.d.ts`, `index.test.js`, `index.test.d.ts` et leurs quatre fichiers `.map` ;
- il contient en plus `dist/.srchash` quand le build passe par `scripts/ensure-theme-dists.mjs`.

On n'y trouve **aucun fichier** de marque ni d'emblème : ni signature, ni mot-symbole, ni armoiries, ni drapeau, ni fonte, ni SVG amont. Le seul SVG, une URI `data:` dans `dist/index.js`, est un chevron de liste générique, commun aux thèmes du dépôt. Le paquet embarque en revanche, sous forme de chaînes :

- des couleurs, dont le bleu `#26374a` que ses commentaires rattachent au PCIM ;
- les noms de police `Lato`, `Noto Sans` et `Noto Sans Mono`, sans binaire ;
- les noms de jetons GCDS et le libellé de thème `Government of Canada`.

### Ce qui reste ouvert

- **Version amont exacte** de la transcription : non consignée, `unverified`.
- **Citation de la règle PCIM** : canada.ca n'a pas pu être lu en direct le 2026-09-21 ; la règle ci-dessus est un relevé en substance, pas une citation littérale.
