# Proposition d'Architecture CLI `design` (V5) — Lean & Personnalisée (WP8)

Ce document présente la restructuration profonde, personnalisée et haut de gamme de la CLI **`design`**. Il élimine toute copie littérale des concepts originels, met en avant l'accessibilité (`a11y`) en tant que pilier de premier plan, et distingue formellement l'application des bases structurelles physiques (**`design align`**) du polissage de la finesse esthétique et créative (**`design polish`**).

> **Cadrage produit (canonique).**
> - **Package npm = `@sentropic/design-system-skills`** (module du design system). Le nom « impeccable » est **proscrit** : c'est la skill source, on ne clone pas. Le binaire reste `design`.
> - Le moteur `design` = **5 verbes** : `init`, `build`, `check`, `align`, `polish`. L'**audit n'est qu'un verbe** = `design check --tech`. Ne pas réduire le moteur à « audit ».
> - **État (2026-05-25)** : seul `design check --tech` est livré (V1). Les 4 autres verbes sont à implémenter.

---

## 📐 1. Les 5 Commandes Majeures de la CLI `design`

La CLI unique **`design`** factorise les 17 méthodes d'excellence en 5 grands verbes d'action intuitifs et d'une précision conceptuelle absolue :

1.  **`design init`** : Configuration du contexte de marque stratégique (`PRODUCT.md`) et documentation des tokens existants (`DESIGN.md`).
2.  **`design build <feature>`** : Phase de proposition ergonomique amont (`--propose`) et génération de composants (`craft`).
3.  **`design check <target>`** : Diagnostics automatisés déterministes techniques (`--tech`) et heuristiques humaines (`--human`).
4.  **`design align <target>`** : Calibrage et mise en conformité des **Fondations & Système** (règles physiques : couleurs, grille, typo, accessibilité, responsive).
5.  **`design polish <target>`** : Ajustements créatifs, animations et passes d'optimisation esthétique fine.

---

## 🎨 2. La Nouvelle Cartographie des Sous-Modules

Nous réorganisons les méthodes en **4 familles conceptuelles harmonieuses**. Les bases physiques et réglementaires de l'interface sont regroupées dans la catégorie **Fondations & Système** (pilotées par la commande structurelle **`design align`**), tandis que le mouvement, la clarté et l'allègement structurel constituent la catégorie **Raffinement & Esthétique** (pilotées par la commande créative **`design polish`**).

```
                      ╔══════════════════════════════════════════════╗
                      ║              CLI  'design'                   ║
                      ╚══════════════════════════════════════════════╝
                                              │
      ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
      ▼                   ▼                   ▼                   ▼                   ▼
1. CONFIGURATION     2. CRÉATION        3. DIAGNOSTIC       4. FONDATIONS       5. POLISSAGE
  (design init)     (design build)     (design check)      (design align)      (design polish)
      │                   │                   │                   │                   │
  ┌───┴───┐         ┌─────┼─────┐         ┌───┴───┐         ┌─────┼─────┐         ┌───────┼───────┐
  ▼       ▼         ▼     ▼     ▼         ▼       ▼         ▼     ▼     ▼         ▼       ▼       ▼
teach  document  propose craft extract  tech    human     tones layout typo    motion  spark    lucid
                                                          a11y  responsive     bolder  charm   essence
                                                                               quieter
```

---

## 🗺️ 3. Tableau de Correspondance & Rationale (17 Méthodes V5)

Voici le détail motivé de chaque méthode, avec leur nouveau nom premium sans équivalent trivial :

### Family A : L'INGESTION & STRATÉGIE (Command: `design init`)

#### 1. `teach` ➔ `design init`
*   **Rationale** : Ingestion stratégique de l'identité du produit (création de `PRODUCT.md` à la racine). Indispensable pour aligner l'IA sur l'ADN de la marque.

#### 2. `document` ➔ `design init --extract`
*   **Rationale** : Analyse le code existant pour figer les tokens de style réels (création de `DESIGN.md`), assurant une cohérence absolue avec les variables de thème.

---

### Family B : LA CRÉATION GÉNÉRATIVE (Command: `design build <feature>`)

#### 3. `propose` *(anciennement shape)* ➔ `design build --propose`
*   **Rationale** : Remplace "shape". L'atelier de proposition et d'ergonomie amont. Génère le zoning fonctionnel et l'architecture logique du composant pour validation conceptuelle avant de coder.

#### 4. `craft` ➔ `design build` *(Par défaut)*
*   **Rationale** : Le moteur de génération de code Svelte 5 / CSS. C'est l'outil de production principal du développeur.

#### 5. `extract` ➔ `design build --promote`
*   **Rationale** : Isole un composant local et extrait ses styles sous forme de variables CSS réutilisables dans le design system global.

#### 6. `impeccable` ➔ `design build --global`
*   **Rationale** : Pipeline complet d'alignement visuel et de conformité pour valider globalement un composant par rapport à toutes les exigences de marque.

---

### Family C : LES DIAGNOSTICS (Command: `design check <target>`)

#### 7. `audit` ➔ `design check --tech` *(WP8 V1)*
*   **Rationale** : Diagnostics techniques déterministes automatisés (analyse statique regex / AST des hex bruts, longueurs de lignes, accessibilité).

#### 8. `critique` ➔ `design check --human`
*   **Rationale** : Évaluation qualitative globale menée par l'IA basée sur le facteur humain (charge cognitive de l'utilisateur, score Nielsen, simulation de parcours).

---

### Family D : LES FONDATIONS & SYSTÈME (Command: `design align <target> --flag`)
*Cette catégorie regroupe les bases mathématiques et physiques requises pour donner vie à une interface solide, structurée et accessible. Elle ne relève pas du simple polissage créatif.*

#### 9. `tones` *(anciennement colorize)* ➔ `design align --tones`
*   **Rationale** : Remplace "colorize". Le terme **tones** désigne la justesse de la palette chromatique, l'utilisation stricte de l'OKLCH pour des dégradés harmonieux et le respect des contrastes de couleur.

#### 10. `layout` ➔ `design align --spacing`
*   **Rationale** : Pilote la grille technique stricte (multiples de 4px/8px), la gestion rationnelle des paddings et la cohérence de l'alignement structurel.

#### 11. `typo` *(anciennement typeset)* ➔ `design align --typo`
*   **Rationale** : Structure l'échelle typographique, le choix des familles de polices, les interlinéages confortables (`line-height`) et la hiérarchie des niveaux de titre.

#### 12. `a11y` *(Nouveau pilier)* ➔ `design align --a11y`
*   **Rationale** : L'accessibilité devient un pilier autonome central de nos fondations. Elle gère spécifiquement les cibles tactiles de 44x44px, la conformité WCAG aux lecteurs d'écran, l'évitement des focus invisibles et la navigabilité générale au clavier.

#### 13. `responsive` *(anciennement adapt)* ➔ `design align --responsive`
*   **Rationale** : Gère l'adaptabilité physique et fluide de l'interface sur les résolutions mobiles, tablettes et larges écrans de bureau.

---

### Family E : LE RAFFINEMENT ESTHÉTIQUE & CRÉATIF (Command: `design polish <target> --flag`)
*Cette catégorie gère la finesse, le mouvement, le ressenti émotionnel et la simplicité pure de l'expérience utilisateur.*

#### 14. `motion` *(anciennement animate)* ➔ `design polish --motion`
*   **Rationale** : Gère les animations, les transitions Svelte fluides, les courbes cinétiques harmonieuses et le respect de la préférence système de réduction de mouvement (`prefers-reduced-motion`).

#### 15. `bolder` / `quieter` ➔ `design polish --bolder` / `--quieter`
*   **Rationale** : Ajuste dynamiquement le volume visuel global d'une interface en accentuant les poids visuels (bolder) ou en réduisant le bruit pour reposer l'œil (quieter).

#### 16. `spark` *(anciennement overdrive)* ➔ `design polish --spark`
*   **Rationale** : Remplace "overdrive". Le terme **spark** incarne l'intensité cinétique dynamique, les effets de halo/lumière d'exception et les micro-survols cinétiques intenses.

#### 17. `charm` *(anciennement delight)* ➔ `design polish --charm`
*   **Rationale** : Remplace "delight". Le terme **charm** incarne le ravissement émotionnel discret, l'intégration minutieuse d'illustrations de marque personnalisées et le soin des états vides.

#### 18. `lucid` *(anciennement clarify / copy)* ➔ `design polish --lucid`
*   **Rationale** : Remplace "clarify" et "copy". Le terme **lucid** incarne la limpidité textuelle et informationnelle. Il affine la microcopie UX, bannit les termes flous et le jargon, et simplifie la grammaire pour une compréhension immédiate.

#### 19. `essence` *(anciennement distill)* ➔ `design polish --essence`
*   **Rationale** : Remplace "distill". Le terme **essence** incarne l'épuration absolue. Il nettoie la structure HTML en éliminant les cartes imbriquées superflues et les conteneurs inutiles pour ne laisser briller que le contenu pur.

