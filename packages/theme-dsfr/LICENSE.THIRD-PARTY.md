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

### Licence du dépôt (`LICENSE.md`) : MIT

Jusqu'à la v1.15.0 incluse, le `LICENSE.md` du dépôt (blob `b21b8e9b08b73f14d63ebeee3010d18666f10631`, identique aux tags v1.14.4 et v1.15.0) place le dépôt sous MIT, fonte Marianne exceptée. Ce fichier ne porte **aucune ligne de copyright nominative**. Il est reproduit tel quel, à un seul écart près : son lien relatif `doc/legal/cgu.md` est rendu absolu et pointe vers les CGU du tag v1.14.4, citées dans la sous-section suivante.

> Le contenu de ce dépôt est placé sous licence MIT License, à l'exception de la fonte Marianne. 
> Voir les [conditions générales d'utilisation](https://github.com/GouvernementFR/dsfr/blob/v1.14.4/doc/legal/cgu.md)
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

### Conditions générales d'utilisation de la même période

Les CGU publiées dans le dépôt pendant la transcription sont celles du tag v1.14.4 : `doc/legal/cgu.md`, blob `66f1efe3c82efe1a00c26875c29acf9c509e1395`, inchangé depuis le commit `a81e25016fdd2cc82ac00d37797d552dffdbccdb` du 2023-11-09. C'est aussi le blob présent sur la branche `main` du 2026-05-26 au 2026-06-02, avec le même `LICENSE.md`. Elles disposent :

- art. 1, définition : « Eléments d’Identité : désigne les éléments des Composants qui identifient les Entités Autorisées (dénomination, logos, autres Éléments graphiques comme les couleurs, typographies, iconographies, etc.) définis dans la « Marque État ». »
- art. 2.2 : « Toutes les Ressources sont la propriété de l’État. »
- art. 2.2, 2°, « Conditions d’utilisation des Composants par les Autres Utilisateurs », en entier : « Tous les Autres Utilisateurs sont autorisés à utiliser le code source selon les conditions de la licence MIT. » puis « Il est expressément rappelé aux Autres Utilisateurs que toute utilisation des Composants en dehors des limites visées aux présentes ou dans le but de les détourner et de s’approprier d’une manière ou d’une autre la Marque de l’État est punissable de sanctions civiles et/ou pénales. »

### Chronologie amont : modalités d'utilisation, puis Licence Ouverte 2.0

- **Modalités d'utilisation 1.0.0.** Le texte porte « Version du 20 mai 2026 – version définitive ». Il entre dans le dépôt le 2026-06-10 et y remplace les CGU ci-dessus : commit `e165c60f381e0f70ddc97ffe3947ebe25b6dd8d7` (PR #1372), `cguVersion: '1.0.0'`.
- **v1.15.0, publiée le 2026-07-17.** Elle contient déjà ces modalités (`doc/legal/cgu.md`, blob `ee556738ee85730487136e80bf3a88ab6fa4f666`), alors que son `LICENSE.md` est encore le texte MIT reproduit plus haut. Elle subordonne aussi l'installation du paquet à leur acceptation (commit `8f9c8882ce1ea8254594ebeca891d95a1b6e219c`, 2026-06-30). En effet, `scripts/preinstall.js` exige un fichier `.dsfr.yml` portant `accept-license`, ou la variable `DSFR_ACCEPT_LICENSE=1`, et `tool/license/consent.js` écrit ce fichier.
- **Licence Ouverte 2.0 (Etalab 2.0), le 2026-07-20.** Commit `3d40e0cd1cb367b68719dd10cf10a833d1d4830c` (PR #1483), `LICENSE.md` blob `0bfeff06ba03e2eb41ea3134f6b0af5f4628f5a3`, première version publiée v1.15.1. Ce même commit numérote les paragraphes des modalités ([1], [2], …) et y ajoute des liens. Sur npm, `@gouvfr/dsfr` 1.15.3 déclare `etalab-2.0`.
- **Modalités 1.0.1, le même jour.** Le commit `cec9ace837f11c6917962896270b4c9d44dff6ec` (PR #1486) ne change que la version (1.0.0 → 1.0.1), la date (20 mai → 20 juillet 2026) et un mot (« CGU » → « modalités », § 54).
- **Vigueur des modalités 1.0.0 pendant la transcription** (du 2026-05-26 au 2026-06-02) : `unverified`. Elles sont datées du 20 mai 2026, mais n'étaient pas encore dans le dépôt. Leur publication sur systeme-de-design.gouv.fr à ces dates n'a pas été vérifiée.

Le `LICENSE.md` actuel s'ouvre ainsi :

> Le code du DSFR est sous licence Etalab 2.0, mais son utilisation est encadrée par des [modalités d'utilisation](https://github.com/GouvernementFR/dsfr/blob/v1.15.3/doc/legal/cgu.md). En raison de son rôle de marqueur d'identité visuelle de l'État, le DSFR ne doit pas être utilisé par des entités extérieures à l'administration, et limite sa réplicabilité en dehors d'un nom de domaine en .gouv.fr. En cas d’usage à des fins trompeuses ou frauduleuses, l'État se réserve le droit d’entreprendre les actions nécessaires pour y mettre un terme.

Les valeurs de ce paquet n'ont pas été resynchronisées depuis la transcription. Une resynchronisation sur la v1.15.0 relèverait des modalités 1.0.0. Sur la v1.15.1 ou une version ultérieure, elle relèverait de la Licence Ouverte 2.0 et des modalités 1.0.1. La Licence Ouverte 2.0 exige de mentionner la source (a minima le nom du « Concédant ») et la date de dernière mise à jour de l'« Information » réutilisée, sans conférer de caractère officiel à la réutilisation ni suggérer de caution. La présente section nomme l'éditeur, l'URL de la source et la période de transcription. Ce paquet n'est ni produit, ni approuvé, ni cautionné par le SIG ou par l'État.

### Ce paquet

Le code de transcription de ce paquet, c'est-à-dire la mise en correspondance de ces valeurs sur la structure `TenantTheme`, est publié sous MIT : voir `LICENSE`. Cette licence ne couvre que ce code. Elle ne s'étend ni au DSFR, ni aux éléments de la Marque de l'État.

### Marques et emblèmes d'État : hors de toute licence

La Marque de l'État ne relève ni de la licence MIT, ni de la Licence Ouverte 2.0. L'amont en fixe lui-même le périmètre :

- les CGU de la v1.14.4 rangent les couleurs et les typographies parmi les « Eléments d’Identité » définis dans la « Marque État » (voir plus haut) ;
- les modalités 1.0.0 et 1.0.1 définissent la Marque de l'État par « ses éléments graphiques (bloc marque, couleurs, typographies, iconographies) ».

Règles publiées par l'éditeur dans les modalités. La numérotation est celle de la version 1.0.1 ; le même texte figure, non numéroté, dans la version 1.0.0 de la v1.15.0.

- § 7 : « Il a vocation à être utilisé dans le cadre de la conception et de l’exploitation des sites Internet en [.gouv.fr] et des applications mobiles de l’État. »
- § 8 : « Toute utilisation du DSFR en dehors de son cadre institutionnel est susceptible de créer une confusion avec un service public officiel et, le cas échéant, d’exposer son auteur à des sanctions pénales notamment sur le fondement de l’article 433-13 du code pénal […] »
- § 14 : « L’utilisation des Ressources a pour seule destination la conception, le développement et la mise à disposition du public de sites internet exploités avec l’extension [.gouv.fr] ou d’applications mobiles. Les Fondamentaux du DSFR ne peuvent pas être modifiés, de sorte à préserver l’unité et l’intégrité visuelle de l’État. »
- § 20 : « L’Utilisateur s'engage à ne pas porter atteinte, directement ou indirectement, aux droits de propriété intellectuelle de l’État sur le DSFR, et en particulier sur les Fondamentaux. En particulier, l’utilisation des typographies « Marianne Institution » et « Marianne Expression » est soumise à l’acceptation de modalités d’utilisation spécifiques. » La version 1.0.1 renvoie pour ces modalités à https://www.info.gouv.fr/marque-de-letat/la-typographie

Ce que ce paquet embarque, mesuré avec `npm pack --dry-run` :

- le tarball contient `LICENSE`, `LICENSE.THIRD-PARTY.md`, `package.json` et, sous `dist/`, `index.js`, `index.d.ts`, `index.test.js`, `index.test.d.ts` et leurs quatre fichiers `.map` ;
- il contient en plus `dist/.srchash` quand le build passe par `scripts/ensure-theme-dists.mjs`.

On n'y trouve **aucun fichier** de marque ni d'emblème : ni bloc-marque, ni Marianne, ni fonte, ni SVG amont. Le seul SVG, une URI `data:` dans `dist/index.js`, est un chevron de liste générique, commun aux thèmes du dépôt. Le paquet embarque en revanche, sous forme de chaînes, des éléments que l'amont range dans la Marque de l'État :

- les couleurs de la palette DSFR, dont Bleu France `#000091` et Rouge Marianne `#e1000f` ;
- le nom de police `Marianne` dans les piles `font-family`, sans le binaire.

S'y ajoutent les noms de jetons DSFR et le libellé de thème `DSFR`.

### Ce qui reste ouvert

- **Prémisse MIT et Marque de l'État.** La décision d'attribution amont repose sur un DSFR sous MIT. Cette prémisse vaut pour le `LICENSE.md` de la période de transcription. Les CGU de la même période (v1.14.4) rangeaient pourtant déjà les couleurs et les typographies parmi les éléments de la « Marque État ». Elles déclaraient aussi toutes les Ressources propriété de l'État, et rappelaient que toute appropriation de la Marque de l'État est punissable de sanctions civiles et/ou pénales. Or ce paquet embarque, sous forme de chaînes, Bleu France `#000091`, Rouge Marianne `#e1000f` et le nom de police `Marianne`. L'effet de ces conditions sur la publication de ce paquet relève de l'owner.
- **Régime amont actuel.** Depuis la v1.15.0 (2026-07-17), les modalités 1.0.0 destinent les Ressources aux seuls sites en .gouv.fr et aux applications mobiles (§ 14), et l'installation du paquet amont exige de les accepter. Depuis la v1.15.1 (2026-07-20), le code est sous Licence Ouverte 2.0, et le `LICENSE.md` précise que le DSFR « ne doit pas être utilisé par des entités extérieures à l'administration ». Toute resynchronisation relève de l'owner.
- **Vigueur des modalités 1.0.0 pendant la transcription** (du 2026-05-26 au 2026-06-02) : `unverified`.
- **Fonte Marianne** : la page d'info.gouv.fr qui porte ses conditions d'usage a répondu HTTP 403 à la vérification du 2026-09-21. Texte `unverified`.
- **Version amont exacte** de la transcription : non consignée, `unverified`.
