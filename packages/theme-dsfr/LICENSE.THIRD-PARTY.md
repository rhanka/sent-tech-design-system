<!-- GÉNÉRÉ par scripts/generate-third-party-notices.mjs — ne pas éditer à la main. -->
<!-- Régénérer : `npm run notices:generate`. La dérive fait échouer `npm run licensing:check`. -->

# Notices de tiers — `@sentropic/design-system-theme-dsfr`

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

- **Système** : Système de Design de l'État (DSFR).
- **Éditeur** : Service d'information du Gouvernement (SIG), République française.
- **Source** : https://github.com/GouvernementFR/dsfr (paquet npm `@gouvfr/dsfr`). Documentation : https://www.systeme-de-design.gouv.fr/
- **Ce qui est transcrit** : des valeurs de jetons (couleurs, espacements, rayons, métriques de composants) et des noms de jetons (`--blue-france-sun-113-625`, `--red-marianne-main-472`, …), réécrits à la main dans `src/index.ts` et compilés dans `dist/`. Aucun fichier du DSFR n'est recopié.
- **Date de transcription** : du 2026-05-26 au 2026-06-02, d'après l'historique git de `packages/theme-dsfr/src/index.ts`. Version amont exacte : `unverified`. À ces dates, la dernière version publiée du DSFR était la v1.14.4 (2026-03-03).

### Licence amont des valeurs transcrites : MIT

Jusqu'à la v1.15.0 incluse, le `LICENSE.md` du dépôt (blob `b21b8e9b08b73f14d63ebeee3010d18666f10631`, identique aux tags v1.14.4 et v1.15.0) place le dépôt sous MIT, fonte Marianne exceptée. Ce fichier ne porte **aucune ligne de copyright nominative**. Il est reproduit tel quel, son lien relatif rendu absolu :

> Le contenu de ce dépôt est placé sous licence MIT License, à l'exception de la fonte Marianne.
> Voir les [conditions générales d'utilisation](https://github.com/GouvernementFR/dsfr/blob/v1.15.0/doc/legal/cgu.md)
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

Les conditions générales d'utilisation de la même période (`doc/legal/cgu.md` au tag v1.14.4, art. 2.2, 2°) disposent : « Tous les Autres Utilisateurs sont autorisés à utiliser le code source selon les conditions de la licence MIT. »

### Changement de régime amont, postérieur à la transcription

Le 2026-07-20, le DSFR est passé sous **Licence Ouverte 2.0 (Etalab 2.0)** : commit `3d40e0cd1cb367b68719dd10cf10a833d1d4830c` (PR #1483), `LICENSE.md` blob `0bfeff06ba03e2eb41ea3134f6b0af5f4628f5a3`, première version publiée v1.15.1. Sur npm, `@gouvfr/dsfr` 1.15.3 déclare `etalab-2.0`. De nouvelles modalités d'utilisation l'accompagnent (commit `cec9ace837f11c6917962896270b4c9d44dff6ec`, version 1.0.1 du 20 juillet 2026). Le `LICENSE.md` actuel s'ouvre ainsi :

> Le code du DSFR est sous licence Etalab 2.0, mais son utilisation est encadrée par des [modalités d'utilisation](https://github.com/GouvernementFR/dsfr/blob/v1.15.3/doc/legal/cgu.md). En raison de son rôle de marqueur d'identité visuelle de l'État, le DSFR ne doit pas être utilisé par des entités extérieures à l'administration, et limite sa réplicabilité en dehors d'un nom de domaine en .gouv.fr. En cas d’usage à des fins trompeuses ou frauduleuses, l'État se réserve le droit d’entreprendre les actions nécessaires pour y mettre un terme.

Les valeurs de ce paquet sont antérieures à ce changement et n'ont pas été resynchronisées depuis. Une resynchronisation sur la v1.15.1 ou une version ultérieure relèverait de la Licence Ouverte 2.0 et de ces modalités. Cette licence exige de mentionner la source (a minima le nom du « Concédant ») et la date de dernière mise à jour de l'« Information » réutilisée, sans conférer de caractère officiel à la réutilisation ni suggérer de caution. La présente section nomme l'éditeur, l'URL de la source et la période de transcription. Ce paquet n'est ni produit, ni approuvé, ni cautionné par le SIG ou par l'État.

### Ce paquet

Le code de transcription de ce paquet, c'est-à-dire la mise en correspondance de ces valeurs sur la structure `TenantTheme`, est publié sous MIT : voir `LICENSE`. Cette licence ne couvre que ce code. Elle ne s'étend ni au DSFR, ni aux éléments de la Marque de l'État.

### Marques et emblèmes d'État : hors de toute licence

La Marque de l'État ne relève ni de la licence MIT, ni de la Licence Ouverte 2.0 : son usage est réservé à l'État. Les modalités d'utilisation du 20 juillet 2026 rangent parmi les « Fondamentaux » du DSFR « les éléments graphiques de la Marque État (bloc marque, couleurs, typographies, iconographies) ». Règles publiées par l'éditeur dans ces modalités :

- § 7 : « Il a vocation à être utilisé dans le cadre de la conception et de l’exploitation des sites Internet en [.gouv.fr] et des applications mobiles de l’État. »
- § 8 : « Toute utilisation du DSFR en dehors de son cadre institutionnel est susceptible de créer une confusion avec un service public officiel et, le cas échéant, d’exposer son auteur à des sanctions pénales notamment sur le fondement de l’article 433-13 du code pénal […] »
- § 14 : « Les Fondamentaux du DSFR ne peuvent pas être modifiés, de sorte à préserver l’unité et l’intégrité visuelle de l’État. »
- § 20 : « l’utilisation des typographies « Marianne Institution » et « Marianne Expression » est soumise à l’acceptation de modalités d’utilisation spécifiques », publiées sur https://www.info.gouv.fr/marque-de-letat/la-typographie

Ce que ce paquet embarque de ce registre, mesuré avec `npm pack --dry-run` (`LICENSE`, `LICENSE.THIRD-PARTY.md`, `package.json`, `dist/index.*`) : **aucun fichier** de marque ou d'emblème. Il n'y a ni bloc-marque, ni Marianne, ni fonte, ni SVG amont ; le seul SVG du paquet est un chevron de liste générique, commun aux thèmes du dépôt. Le paquet embarque en revanche, sous forme de chaînes : le **nom** de police `Marianne` dans les piles `font-family`, sans le binaire ; les couleurs Bleu France `#000091` et Rouge Marianne `#e1000f` ; les noms de jetons DSFR ; le libellé de thème `DSFR`.

### Ce qui reste ouvert

- **Fonte Marianne** : la page d'info.gouv.fr qui porte ses conditions d'usage a répondu HTTP 403 à la vérification du 2026-09-21. Texte `unverified`.
- **Régime amont actuel** : le passage sous Licence Ouverte 2.0 et les modalités du 20 juillet 2026 sont postérieurs à la transcription. Ces modalités réservent le DSFR à l'administration et rangent couleurs et typographies parmi les Fondamentaux. La décision d'attribution amont repose sur un DSFR sous MIT, ce qui est exact pour la période de transcription et ne l'est plus pour l'amont actuel. L'effet de ce changement sur la publication de ce paquet relève de l'owner.
