# Intention brute — fidélité du clone, banc /compare, versioning (2026-05-27)

Capture fidèle des 2 dernières requêtes utilisateur, pour dériver les fix.

## Requête A (banc /compare + QA composants + chat)

> le compare sert vraiment à rien.
> tu n'as pas pris en compte ma demande : notre DS mappé (au DSFR) vs les mêmes
> composants DSFR sans notre system. au moins maintenant cette merde est isolée.
> il faudrait que tu changes ça au moins avant de push main.
> ensuite, je propose que tu fasses une passe d'agents autour de chacun des
> composants en cliquant sur chacun. tu verras que certains ne correspondent pas
> en terme de contenu ou ne fonctionnent pas.
> enfin, côté chat tu n'as pas pris en compte mon enjeu relatif à l'input
> resizeable comme dans le chat ui de sentropic. on est très désaligné vs le
> composant sentropic chat ui qu'on a travaillé, faudrait que tu mènes une
> comparaison composant par composant pour comprendre mon point de vue.

## Requête B (versioning + corrections /compare + QA obligatoire dans le skill)

> 1. faudrait actualiser le numéro de version du design system d'ailleurs si on
>    est en 0.8.0 ... et mettre pour chaque thème la version de notre ds + celui
>    du thème.
> 2. compare: stp n'affiche pas sent tech dans ce contexte, le compare est pour
>    les thèmes importés.
> 3. compare: les boîtes gauche ne sont pas verticalement étendues comme elles le
>    sont à droite.
> 4. compare: stp regarde au moins ce que tu compares... presque tout est
>    différent pour le DSFR. faut que tu mettes une passe de QA dans le skill de
>    mapping, obligatoire et systématique.
> 5. compare: idem pour carbon, et on ne comprend pas pourquoi on a des trucs en
>    français d'autres en anglais.

## Dérivation en fix / tracks

- **Versioning** : `DOCS_VERSION` figé à `v0.7.0` alors que les packages sont en
  `0.9.0` → source unique (package.json), et afficher par thème « DS vX + thème vY ».
- **/compare** : retirer Sent Tech (banc réservé aux thèmes importés) ; boîtes
  gauche/droite à hauteur égale ; langue cohérente par DS (FR DSFR / EN Carbon).
- **Fidélité de mapping** : DSFR (et Carbon) très loin du réel → revoir les valeurs
  d'anatomie ET inscrire une **passe de QA obligatoire et systématique dans le
  skill de mapping** (comparer le mappé au réel, gate avant publication).
- **QA composants** : passe au clic composant par composant (contenu erroné /
  cassés) — pilotée par moi au navigateur (les sous-agents ne pilotent pas le
  navigateur).
- **Chat** : comparaison composant par composant vs `/home/antoinefa/src/sentropic/
  packages/chat-ui`, centrée sur l'input multiligne auto-resize (enjeu WP9 raté).
