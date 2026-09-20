# Notices de tiers

Ce fichier recense les dépendances **redistribuées** par les paquets publiés du
design system, avec leur licence. Il existe parce que plusieurs licences
courantes — MIT, ISC, EPL-2.0 — exigent que leur notice accompagne le logiciel
distribué. Sans ce fichier, publier un paquet qui embarque ces dépendances les
enfreint.

## Ce qui est recensé, et ce qui ne l'est pas

Sont recensées les entrées de `dependencies` des paquets publiables, c'est-à-dire
ce qu'un consommateur installe réellement avec nous.

Ne sont pas recensées les `peerDependencies` — Angular, React, Svelte, Vue,
CodeMirror, Lezer. Elles sont fournies par le consommateur : nous ne les
distribuons pas, et leurs notices lui incombent.

Ne sont pas recensés non plus les outils de construction et de test, qui
n'entrent dans aucun paquet publié.

## Dépendances redistribuées

| Paquet | Licence | Distribué par |
|---|---|---|
| `@lucide/svelte` | ISC | `@sentropic/design-system-svelte` |
| `lucide-react` | ISC | `@sentropic/design-system-react` |
| `lucide-vue-next` | ISC | `@sentropic/design-system-vue` |
| `jsdom` | MIT | `@sentropic/design-system-skills` |

`@sentropic/design-system-angular` n'a aucune dépendance tierce : ses tracés
d'icônes sont inlinés.

## À ajouter avant tout embarquement de dépendance de diagramme

Les deux bibliothèques qualifiées au lot A0 ne sont pas encore embarquées. Quand
elles le seront, elles entrent ici, et chacune apporte une obligation qui va
au-delà d'une simple ligne de tableau.

**elkjs** est publié sous `EPL-2.0 OR GPL-3.0-or-later`. C'est un double
licenciement au choix du destinataire : nous retenons **EPL-2.0**, et ce choix
doit être écrit ici explicitement, faute de quoi rien n'indique laquelle des deux
branches nous engage. EPL-2.0 est un copyleft de fichier : tant que la
bibliothèque est consommée sans modification, notre code n'est pas affecté.

**bpmn-js** est sous licence MIT assortie d'une clause de filigrane. Le texte
exige que le code affichant le filigrane bpmn.io ne soit ni retiré ni modifié, et
que le filigrane reste **entièrement visible et non recouvert**. Ce n'est pas
qu'une notice à recopier : c'est une contrainte sur le rendu, qui impose une zone
d'exclusion de 100 × 48 px au coin bas-droit de tout conteneur bpmn-js, et qui
reste ouverte pour les exports, où le filigrane ne suit pas le SVG.

Voir `docs/a0-csp-dependency-qualification.md` dans la branche de rapatriement
pour les mesures et les conditions complètes.

## Icônes de fournisseurs

Un pack d'icônes de fournisseurs — AWS, GCP, Azure et autres — relève d'un régime
distinct, et l'ajouter ici ne suffira pas. Les collections candidates sont en CC0
ou MIT, mais le texte CC0 est explicite : « No trademark or patent rights held by
Affirmer are waived, abandoned, surrendered, licensed or otherwise affected by
this document. » La licence couvre le fichier, pas l'usage de la marque, qui
reste soumis aux conditions de chaque fournisseur.
