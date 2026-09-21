<!-- GÉNÉRÉ par scripts/generate-third-party-notices.mjs — ne pas éditer à la main. -->
<!-- Régénérer : `npm run notices:generate`. La dérive fait échouer `npm run licensing:check`. -->

# Notices de tiers — `@sentropic/design-system-theme-quebec`

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

- **Système** : Système de design gouvernemental (SDG) du Québec, publié sous forme de « trousse SDG ».
- **Éditeur** : gouvernement du Québec. Selon le README amont, le SDG est « sous la responsabilité de la Direction des communications numériques gouvernementales (DCNG), au Secrétariat à la communication gouvernementale (SCG) du ministère du Conseil exécutif ». Le paquet npm `qc-trousse-sdg` déclare `"author": "MCE"`.
- **Source** : https://github.com/Quebecca/qc_trousse_sdg (paquet npm `qc-trousse-sdg`). Documentation : https://design.quebec.ca/
- **Ce qui est transcrit** : des valeurs et des noms de jetons `--qc-*` du thème clair, relevés dans `public/css/qc-sdg-design-tokens.css`, et des métriques de composants, réécrites à la main dans `src/index.ts` et compilées dans `dist/`. Aucun fichier du SDG n'est recopié. Valeurs recoupées sur ce fichier au tag v1.5.2 (blob `b8c225d5225b5fc3fba6f9e4dfa498a1c7bb7696`).
- **Date de transcription** : 2026-06-11, d'après l'historique git de `packages/theme-quebec/src/index.ts`. Version amont exacte : `unverified`. À cette date, la dernière version publiée était la 1.5.2 (2026-04-27), toujours la dernière au 2026-09-21.

### Licence amont : MIT selon le fichier, ISC selon le manifeste

L'amont publie deux déclarations qui ne concordent pas :

- le fichier de licence du dépôt, `copyright.txt`, porte le texte MIT. C'est lui que GitHub détecte. Blob `79656060de00aa4659ad2c276d5be8830664d544`, identique au tag v1.5.2, introduit par le commit `98609e0593c819deaaf6a41de8ea8816069c2f29` du 2022-09-21 (« Ajout de la licence MIT ») ;
- le manifeste `package.json` déclare `"license": "ISC"`, et le registre npm publie `qc-trousse-sdg` 1.5.2 sous ISC. Le tarball npm embarque pourtant ce même `copyright.txt`.

Aucune mention de LiLiQ ni de CC BY n'a été trouvée, ni dans le README, le fichier de licence et le manifeste du dépôt, ni sur les pages de design.quebec.ca consultées (« Trousse de design », « Identité gouvernementale et logos »). La ligne de copyright du fichier nomme « Microsoft Corporation », qui n'est pas l'éditeur du SDG. Le fichier est reproduit tel que publié, sans correction ; seule son indentation de quatre espaces est retirée, et l'absence de point final est d'origine :

> MIT License
>
> Copyright (c) Microsoft Corporation.
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
> SOFTWARE

### Ce paquet

Le code de transcription de ce paquet, c'est-à-dire la mise en correspondance de ces valeurs sur la structure `TenantTheme`, est publié sous MIT : voir `LICENSE`. Cette licence ne couvre que ce code. Ce paquet n'est ni produit, ni approuvé, ni cautionné par le gouvernement du Québec.

### Marques et emblèmes d'État : hors de toute licence

La signature gouvernementale, le drapeau et les emblèmes du Québec ne relèvent d'aucune de ces licences. Le Programme d'identification visuelle (PIV) encadre les communications du gouvernement, des ministères et des organismes. Règles publiées par l'éditeur (« Utilisation ou reproduction du drapeau du Québec », quebec.ca, dernière mise à jour le 5 septembre 2025) :

- « La signature gouvernementale est à l'usage exclusif du gouvernement du Québec. »
- Sur la fleur de lys de la signature : « L'utilisation de cette fleur de lys n'est pas permise. Au même titre que le mot « Québec », elle est indissociable de la signature gouvernementale. »
- « Le drapeau et les symboles ou emblèmes nationaux ne peuvent être associés à la promotion d'un produit ou d'une entreprise, c'est-à-dire être utilisés à des fins publicitaires. »
- « De même, le drapeau du Québec et les armoiries sont protégés. Les dispositions légales interdisent à quiconque de les utiliser comme marque de commerce (logo) ou autrement. »
- Autorisation préalable : drapeau@mlf.gouv.qc.ca.

Ce que ce paquet embarque de ce registre, mesuré avec `npm pack --dry-run` (`LICENSE`, `LICENSE.THIRD-PARTY.md`, `package.json`, `dist/index.*`) : **aucun fichier** de marque ou d'emblème. Il n'y a ni signature, ni drapeau, ni fleur de lys, ni fonte, ni SVG amont ; la trousse amont publie `QUEBEC_couleur.svg` et `QUEBEC_blanc.svg`, ce paquet ne les reprend pas. Le seul SVG du paquet est un chevron de liste générique, commun aux thèmes du dépôt. Le paquet embarque en revanche, sous forme de chaînes : des couleurs, dont le bleu PIV `#095797` ; le nom de police `Open Sans`, sans binaire ; les noms de jetons SDG ; le libellé de thème `Gouvernement du Québec`.

### Ce qui reste ouvert

- **Titulaire du copyright amont** : la seule notice publiée par l'amont nomme « Microsoft Corporation », et son manifeste déclare ISC. Titulaire réel et licence retenue par l'éditeur : `source-gap`.
- **Version amont exacte** de la transcription : non consignée, `unverified`.
