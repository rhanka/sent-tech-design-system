# Spec — Parité anatomique contrôlée à l'import de thème (cible WP10 retargettée)

**Date** : 2026-05-27
**Statut** : design validé (Sections A + B) + revue croisée Codex 5.5 / Opus 4.7 intégrée — pilote à exécuter par sous-agent contre ce spec.

> **Promesse recadrée (consensus revue)** : on vise une **parité anatomique contrôlée**, PAS un « clone maximal / pixel ». Le résultat sera fidèle sur typographie / formes / couleurs / espacement, et **imparfait par construction** sur focus / décoration / micro-interactions (différences de *technique* CSS, pas de valeurs). La fidélité est **mesurée par la matrice**, pas affirmée par un pourcentage.

## 1. Problème

Importer un thème tiers (DSFR, Carbon) ne doit pas donner « Sentropic recoloré » mais un **clone maximal** du design system cible. Aujourd'hui seules les couleurs changent. Deux causes racines ont été trouvées (et corrigées en local, voir §6) :
- la couche `component` était figée sur le `semantic` de base → les composants ne suivaient pas le thème ;
- le compilateur émettait `--st-foundation-*` alors que les composants lisent les noms courts `--st-font-*`, `--st-radius-*`, etc. → police/radius/espacement jamais thémés.

Mais même corrigées, ces causes ne donnent qu'un re-skin. La **cible** est l'anatomie.

## 2. Cible

Clone **par anatomie** sur **nos** composants Svelte (on garde notre API + accessibilité), re-stylés **par thème** pour matcher l'anatomie de chaque DS : police, formes, radius, paddings, bordures, focus/hover/active/disabled, élévations — pas seulement les couleurs. Chaque composant est tracé dans une **matrice de traçabilité par thème**.

## 3. Mécanique : tokens d'anatomie (ratio mesuré) + échappement gouverné

L'anatomie est portée **au maximum** par des tokens (on étend fortement le DS), plus une **liste d'échappement gouvernée** de CSS scopée `[data-st-theme="<id>"]`. **Pas de cible en pourcentage** : la couverture est **mesurée par la matrice** = `propriétés CSS tokenisées / propriétés requises par la référence`, **par état** (default/hover/focus/disabled). On **attend ≥1 échappement structurel par composant** (focus, décoration) — c'est normal, pas un échec.

### Taxonomie (Section A — révisée après revue)
1. **Primitives `foundation`** (partagées, surchargées par thème) : `borderWidth {none,thin,thick}`, `borderStyle`, `density {controlHeight, paddingBlock, paddingInline, gap, minWidth} × {sm,md,lg}`, `typography` par rôle (`{family,size,weight,lineHeight,letterSpacing,textTransform,textDecoration,decorationThickness,decorationOffset}`), `disabledOpacity`, `transition {property,duration,easing}`, `cursor`, `iconSize`.
2. **Stratégie de focus = primitive de premier ordre** (pas des scalaires) : `focus.strategy ∈ {outline, ring, inset, double}` + `{width, offset, color, inset}`, consommée par **un mixin/utilitaire CSS partagé**. Raison (revue) : DSFR (outline décalé/double), Carbon (box-shadow **inset**) et notre base diffèrent par la **technique** CSS, non par des valeurs.
3. **Contrat `ComponentAnatomy` typé et versionné** = livrable n°1 du pilote. `component.<comp>` (dérivé via `createComponent(semantic, foundation)`) expose `shape` (radius, borderWidth, borderStyle), `density` (paddings, height, gap par taille), `typography` (rôle), `focus` (réf. stratégie), `icon` (size, gap), et **deltas d'états** `hover/active/focus/disabled` (`{bg,border,text,decoration,transform,opacity}`), en plus des rôles couleur. Le type est **obligatoire** (pas un `TokenTree` libre) pour empêcher la dérive.
4. **Échappement gouverné** : feuille `[data-st-theme="<id>"]{…}` ; chaque entrée porte **propriétaire, justification, date de revue, critère de retrait**, et figure dans la matrice. Réservé au non-tokenisable (pseudo-éléments, techniques de focus spécifiques, comportements).

Les composants Svelte sont refactorés pour **lire ces tokens** au lieu de valeurs en dur.

## 4. Vue globale (Section B — validée)

Matrice à 2 axes : composants (≈60) × thèmes. **La matrice EST le tableau de bord.** Une ligne par composant, **une colonne par thème**, cellule = état (🟢 tokens complet · 🟡 tokens+échappement justifié · 🔴 gap · ⚪ à faire · — N/A) + **ratio de couverture mesuré** (props tokenisées/requises, par état) en pied de colonne. **DSFR et Carbon sont strictement symétriques** (chacun : package, colonne, liste d'échappement gouvernée, sources publiques citées).

> **YAGNI pilote (revue)** : au pilote la matrice est **5×2** (DSFR, Carbon) — **pas** de colonnes « futurs thèmes » tant que le modèle n'est pas prouvé. Le ratio ne recompte pas ce qui est déjà thémé hors anatomie (data-viz, z-index, motion).

**Phases :**
- **Phase 0 — socle** (fait, local non poussé) : builder `createComponent` + alias de variables courts.
- **Phase 1 — pilote** (CE spec) : taxonomie + refactor des 5 composants noyau + valeurs DSFR & Carbon → comparaison côte-à-côte quasi-identique + matrice signée.
- **Phase 2 — rollout** : déroulé aux ~55 composants restants, par clusters, DSFR & Carbon en //.
- **Phase 3 — nouveaux thèmes** : Airbus / Scalian / CGI via le skill de mapping révisé, hors git.

## 5. Pilote (périmètre exécutable)

**Composants** : Button, Input/Field, Link, Card, Tabs. **Thèmes** : DSFR + Carbon.

> **Recadrage (revue)** : le pilote conçoit et **valide le contrat `ComponentAnatomy`** sur 5 composants — livrable n°1 = **le schéma**, pas « 5 composants finis ». **La Phase 2 ne démarre pas tant que le schéma bouge encore.**

**Livrables (produits par le sous-agent) :**
- **contrat `ComponentAnatomy` typé + versionné** (le schéma) + primitives `foundation` étendues ;
- 5 composants refactorés pour lire les tokens d'anatomie (sans régression sur Sent Tech) ;
- valeurs d'anatomie DSFR & Carbon pour ces 5 composants (sources publiques citées, `à confirmer` si inconnu) ;
- **page de comparaison** dans le docs : nos composants thémés **à côté des captures de référence officielles versionnées**, **par état** (default/hover/focus/disabled), pour les 2 thèmes ;
- **snapshots de styles calculés** (getComputedStyle) par composant/état/thème = artefact reproductible (pas « à l'œil » seul) ;
- **matrice de traçabilité** : 5 lignes × {DSFR, Carbon}, état + ratio mesuré + liste d'échappement gouvernée (propriétaire/justif/date/critère de retrait) ;
- **test** : tout `var(--st-*)` consommé par les 5 composants existe dans l'arbre de tokens compilé (anti-var-fantôme) ; corriger les fuites existantes (`--st-radius-small`…).

**Critère de « fini » (validation 1+3, durcie) :**
- **Signature** = matrice : pour chaque composant, ratio mesuré renseigné + échappements gouvernés ; aucun `var` fantôme (test vert).
- **UAT** = comparaison côte-à-côte **par état** vs références officielles + snapshots de styles calculés ; **quasi-identique à l'œil** confirmé (assistant + smoke utilisateur).
- **a11y (non négociable)** : visibilité focus clavier + contraste du focus vérifiés par thème, même si la régression complète est différée.
- **Smoke visuelle automatisée** conservée sur le pilote ; **pixel-diff complet** = différé (post-pilote).
- **Qualité** : `svelte-check`, build, lint verts.

## 6. Contraintes & garde-fous

- **Ne rien pousser** : le sous-agent travaille en local et rapporte. Le socle Phase 0 + le pilote seront commités **ensemble après preuve UAT**.
- Tests locaux avant toute affirmation (`svelte-check`, build, rendu navigateur réel — lire les styles **rendus**, pas seulement les variables).
- **Contrat de nommage testé** : tout `var(--st-*)` consommé doit exister dans l'arbre compilé (garde-fou anti-dérive le plus rentable, cf. revue). Les fallbacks qui « marchent » masquent l'absence de thématisation.
- Rien de privé dans git ; sources publiques DSFR/Carbon citées ; `à confirmer` plutôt qu'inventer.
- Pas de port 5173 pour les serveurs de dev (réservé à l'utilisateur).

## 7. Hors périmètre (YAGNI + explicite, revue)

- Les ~55 autres composants (Phase 2), les thèmes clients (Phase 3).
- Régression visuelle **pixel-diff complète** (différée ; une smoke est gardée).
- **Mode sombre** : DSFR et Carbon ont un thème sombre officiel ; nos thèmes sont `light` only. **Explicitement hors pilote** — donc on ne prétend pas au « clone total », d'où le recadrage « parité anatomique contrôlée ».
- **Icônes** officielles (jeux propres DSFR/Carbon), **polices réellement chargées** (binaires sous licence — on ne référence que les noms), **comportements JS natifs** des libs tierces, **DOM structurel** de leurs composants, **RTL**, **responsive avancé**.
- Toute refonte non liée à la parité d'anatomie.

## 8. À trancher pendant le pilote

La **liste d'échappement** exacte par thème (ce qui ne sera pas tokenisé) — proposée par le sous-agent, validée avec l'utilisateur avant d'être figée dans la matrice.
