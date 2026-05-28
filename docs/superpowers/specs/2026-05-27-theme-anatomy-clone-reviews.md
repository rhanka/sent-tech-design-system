# Revues croisées du spec « parité anatomique contrôlée » (2026-05-27)

Deux relectures indépendantes du spec `2026-05-27-theme-anatomy-clone-design.md`, même brief.
**Consensus : « sain avec ajustements »** (les deux). Corrections intégrées au spec.

---

## Relecteur A — Codex (gpt-5.5, reasoning xhigh, read-only)

VERDICT : `sain avec ajustements`

1. **(Élevé)** « ~99% tokens » pas honnête : Button (font-weight/tailles/padding/transition/focus), Input (focus box-shadow fixe), Link (underline/offset/focus radius fixe), Tabs (padding/indicator/focus absent) encodent l'anatomie en dur. Viser 80-90% mesuré par propriété/état.
2. **(Élevé)** Taxonomie trop incomplète : `foundation` sans borderWidth/focusRing/density/typo structurée ; manque height, minWidth, paddingBlock/Inline, gap, borderStyle, outlineWidth/Offset/Inset, boxShadowFocus, textDecorationThickness/Offset, disabledOpacity, cursor, transition*, iconSize/position, stateLayer.
3. **(Moyen-élevé)** Double source tokens/CSS : schema accepte tout TokenTree sans validation, compilateur aplatit. Contrat typé/versionné par composant requis.
4. **(Moyen)** Validation pilote insuffisante comme feu vert rollout (~69 composants) : ajouter captures reproductibles, snapshots de styles calculés, navigation clavier/focus, axe/svelte-check/build.
5. **(Moyen)** « clone maximal » = mauvaise promesse ; renommer « parité anatomique contrôlée » ou embarquer les vrais composants si parité pixel/legale visée.

Hors-périmètre à expliciter : DOM structurel, icônes officielles, polices chargées, JS natif, dark mode, RTL, responsive avancé.

---

## Relecteur B — Opus 4.7 (sous-agent)

VERDICT : `sain avec ajustements`

1. **(Critique)** « ~99% » = chiffre de confort. Focus rings diffèrent par **technique** CSS (outline vs box-shadow vs inset vs double anneau), pas par valeurs → échappement structurel, pas marginal. Soulignement DSFR conditionnel/animé. Densité non tokenisée (Button en dur). → focus = primitive de stratégie + mixin ; cible mesurée par matrice.
2. **(Élevé)** Vars fantômes via fallback (`Link` lit `--st-radius-small`, foundation n'a que `sm`). → test : tout `var(--st-*)` consommé existe dans l'arbre compilé.
3. **(Élevé)** `createComponent` ne porte aucune dimension d'anatomie → quasi-réécriture. Pilote = concevoir le **schéma** (livrable), pas « 5 composants finis » ; geler le schéma avant rollout.
4. **(Moyen)** UAT « à l'œil » + matrice auto-signée = non falsifiable. → captures de référence officielles versionnées par état (default/hover/focus/disabled).
5. **(Moyen)** Risque a11y du clone de focus (inset Carbon, retrait underline DSFR) → vérif contraste focus + visibilité clavier par thème, non négociable.

Sur-dimensionné : colonnes futurs thèmes + symétrie stricte au pilote (garder 5×2) ; ne pas recompter data-viz/z/motion.
Manquant : dark mode (officiel chez les deux → sinon « clone » faux), icônes, contrat de nommage, stratégie focus.
Mauvaise archi ? Non — garder nos composants est correct (multi-tenant, une API/a11y) ; le danger est la **promesse**, pas l'architecture.
