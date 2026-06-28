# Segmentation pérenne du suivi — Streams par domaine

> Statut : **validé (approche A)** le 2026-06-28. Source de vérité de la taxonomie de suivi (track).
> Remplace la lecture chronologique WP1–25 par des **streams permanents par domaine**.

## Pourquoi
Les WP1–25 sont des *bursts chronologiques* (phase bootstrap), quasi tous `done`. Bon **historique**, mauvais **support de suivi durable** : rien n'accueille l'activité récurrente (parité 4 frameworks, nouveaux thèmes, application chez les consommateurs, releases). On bascule vers des **streams permanents** ; chaque WP passé devient un **lot historique rattaché** à son stream (statut + items préservés → **rien perdu**). Le futur s'ajoute comme nouveaux lots/items dans le bon stream.

## Streams permanents (jamais fermés)

| Stream | Absorbe (lots historiques) | Activité récurrente |
|---|---|---|
| **S1 · Cœur & Composants** | WP1, WP4, WP6, WP18, WP22, WP23 | nouveaux composants, navsystem |
| **S2 · Frameworks & Parité** ♾️ | WP13 (React), WP24 (Angular), WP16 (pixel) | chaque composant → 4 fw + pixel-perfect |
| **S3 · Theming & Marques** ♾️ | WP10, WP14, WP21, WP25 (Paris) | nouveaux thèmes / chromes de marque |
| **S4 · Dataviz / BI** | WP5, WP15, WP19, WP20 | nouveaux charts, vagues BI |
| **S5 · Docs & Site** | WP2, WP3, WP12, WP17 | docs, contrat header, plateforme feedback |
| **S6 · Moteur, Outillage & Release** ♾️ | WP7, WP8, WP9, WP11 | moteur design, audits, skills, **pipeline publish (tags/OIDC/lockstep)** |
| **S7 · Application & QA Consommateurs** ♾️ **(nouveau)** | — | **1 tâche/consommateur** : audit récurrent « DS bien appliqué, 0 custo » |

♾️ = stream permanent à activité continue.

## Release / Publication — pas un domaine
La publication n'est **pas un stream** : c'est l'étape *ship* de chaque livrable. → « publié » devient un **critère d'acceptation** par item ; la **machinerie** (workflows tags `*-v*`, OIDC trusted-publishers, lockstep docs/lockfile) vit dans **S6 · Outillage**.

## S7 · Application & QA Consommateurs (permanent)
**But** : garantir que le DS est appliqué correctement (composants natifs, **0 customisation**, thèmes/chromes conformes) chez chaque consommateur, via un **audit récurrent** et une **tâche par consommateur**.

Consommateurs (seed, **extensible**) :
1. **immo** (radar-immobilier) — *en cours* : AppHeader 100% natif, besoin `MenuTriggerButton`/Dropdown (cf S1).
2. **sentropic.sent-tech.ca** (site vitrine principal)
3. **auth sentropic** (flux d'authentification)
4. **graphify**
5. **dataviz** (✅ conforme : marge + toggle alignés au DS, 2026-06-28)
6. **docs DS** (le site documentaire lui-même)
7. **sentech forge** (tenant)
8. **nc-full-stack**
> À ajouter au fil de l'eau : tenant *entropic*, *studio*, *slides ESN*…

## Premier item S1 généré par S7
**`MenuTriggerButton` / Dropdown natif** : popover **porté en body via Portal** (0 décalage selon `navAlign`), `onSelect` (nav SPA), items **gatés par rôle** ; utilisable depuis le slot `nav` d'`AppHeader` ; **extension `AppChrome.nav`** pour entrées dropdown non-href. Porté 4 frameworks + pixel-parité + publié. (Origine : ticket immo 2026-06-28.)

## Implémentation track
- Créer les 7 streams (role `workpackage`, workspace `streams`).
- Re-parenter WP1–25 sous leur stream (statut/items inchangés). **Dédupliquer le WP25 en double.**
- Créer **S7** + 1 item/consommateur (`to-do`/`in-progress` selon état).
- Créer l'item S1 `MenuTriggerButton`/Dropdown (`in-progress` — immo en attente).
