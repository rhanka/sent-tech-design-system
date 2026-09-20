# Comment porter un jeton jusqu'à un composant, sous CSP stricte

La sonde du dossier parent établit que passer une **propriété CSS personnalisée
à un composant** fait échouer `style-src-attr 'none'`. Or c'est l'idiome vers
lequel on tend naturellement quand on veut thématiser un composant par jeton.
Il fallait donc mesurer les chemins de remplacement, pas seulement nommer le
chemin interdit.

## Résultat mesuré

Chromium 151, CSP stricte en en-tête, même témoin positif que les autres sondes :

| Chemin | Violations | Enveloppe | Jeton appliqué |
|---|---:|---:|---|
| **A** — propriété CSS passée au composant | **1** | 1 `<svelte-css-wrapper>` | oui |
| **B** — variable posée sur un élément ancêtre (`style:--x={…}`) | **0** | 0 | oui |
| **C** — thématisation par classe | **0** | 0 | oui |
| **D** — CSSOM après montage (`setProperty`) | **0** | 0 | oui |
| **E** — même idiome qu'en A, dans l'espace de noms SVG | **0** | 0 (un `<g>`) | non concluant ici |

**Les trois remplacements fonctionnent et appliquent bien le jeton.** Le chemin
interdit n'a donc aucune justification fonctionnelle : il n'apporte rien que B,
C ou D n'apportent.

Sur E : le compilateur Svelte émet `<g>` au lieu de `<svelte-css-wrapper>` dans
l'espace de noms SVG, donc aucun attribut `style` littéral et aucune violation.
La mesure d'application du jeton n'est pas concluante dans cette sonde — elle
lisait `backgroundColor` sur un `<rect>`, qui se peint par `fill`. À remesurer
avant de s'appuyer dessus.

## La règle qui en découle

> Un composant destiné à tourner sous CSP stricte **ne reçoit pas ses jetons par
> propriété CSS personnalisée passée en attribut**. Il les reçoit par une
> variable posée sur un ancêtre, par une classe, ou par le CSSOM après montage.

Elle ne concerne pas les diagrammes : elle concerne **tout composant** écrit en
Svelte sous CSP stricte.

## Comment la rendre exécutoire

Les règles de `@sentropic/design-system-skills` s'appliquent au **DOM rendu**,
pas à la source. La forme naturelle est donc une règle qui signale tout élément
portant un attribut `style` littéral dans le rendu — ce qui attrape cette classe
de défaut, et les autres du même genre, sans avoir à reconnaître un idiome de
compilateur.

## Rejouer

```bash
./run.sh
```
