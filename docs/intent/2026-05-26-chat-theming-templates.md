# Intention brute — nouveaux chantiers (2026-05-26)

Capture fidèle du message utilisateur (intention brute), puis dérivation en chantiers.
Source pour la mise à jour de `docs/workpackages.md`.

## Message brut

> j'ai vu quelques bugs sur le site, mais le premier truc qui me choque c'est le
> désalignement autour des composants de chat. premièrement, les composants
> devraient être sortis du formulaire et les éléments mis dans un topic "chat" ou
> "agent". devraient y figurer la chat avec l'input qui se resize en multilignes,
> il me semble qu'il faut un réalignement sur les différentes notions, incluant le
> streaming / reasoning et tool calling.
>
> pour le moteur skills, il faudrait probablement ajouter deux features :
> - appliquer le design system sentropic (en choisissant le cas échéant un thème,
>   ou en en créant un de façon assistée)
> - mapper au design system sentropic un design system tiers (permettant de créer
>   un thème) — pourrait s'appliquer sur le design system FR (DSFR) en test, on en
>   profiterait pour publier `@sentropic/design-system-theme-dsfr`, et celui de
>   Carbon d'IBM. On l'appliquera avec celui d'Airbus (je le fournirai), celui de
>   Scalian (je le récupèrerai) et de CGI aussi.
>
> ce serait la première chose à faire avant WP7.
>
> par ailleurs j'aimerais que tu utilises le moteur publié pour pouvoir l'appliquer
> sur toi-même (complément au WP7 : s'il faut installer la lib, le fera et me dira).
>
> enfin j'aimerais ajouter une section pour les templates doc et présentations
> slides. je ne sais pas si c'est usuel de gérer ce périmètre, mais ça me semble
> important aussi à couvrir. Je pourrais fournir un deck de Scalian et CGI, non pas
> pour prendre la partie "colorspace", mais pour la typologie slides d'ESN.

## Dérivation en chantiers

1. **Surface Chat / Agent (bug + re-scope)** — sortir les composants de chat du
   topic "Formulaire", créer un topic dédié **« Chat » / « Agent »** ; input qui
   se redimensionne en multilignes ; **réaligner les notions** : streaming,
   reasoning, tool calling. → nouveau **WP9**.

2. **Theming via le moteur `design` (skills)** — 2 features :
   - `design` qui **applique le DS Sentropic** (choisir un thème, ou en créer un
     de façon assistée) ;
   - `design` qui **mappe un DS tiers → thème** Sentropic.
   - Livrables : `@sentropic/design-system-theme-dsfr` (DSFR, en test) +
     `@sentropic/design-system-theme-carbon` (IBM Carbon). Puis Airbus (fourni),
     Scalian (à récupérer), CGI. → nouveau **WP10**.
   - **Priorité : à faire AVANT WP7.**

3. **Dogfooding du moteur publié** — utiliser `@sentropic/design-system-skills`
   publié pour l'appliquer **sur notre propre repo/site** (auto-audit, complément
   WP7) ; installer la lib si nécessaire et le signaler. → nouveau **WP11**.

4. **Templates docs & slides (ESN)** — nouveau périmètre : templates de
   documents + **typologie de slides** type ESN (pas la colorimétrie). Decks
   Scalian / CGI fournis par l'utilisateur comme référence de typologie. → nouveau
   **WP12**.

## Ordre de priorité exprimé

- WP10 (theming) **avant** WP7.
- WP9 (chat) = le désalignement le plus visible → urgent.
- WP11 (dogfooding) = complément WP7.
- WP12 (templates/slides) = périmètre nouveau à cadrer.
