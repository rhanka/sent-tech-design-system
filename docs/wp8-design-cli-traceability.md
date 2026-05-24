# Traçabilité 1:1 — Des modules Impeccable vers la CLI `design` (WP8)

Ce document fournit la cartographie didactique complète de la skill originelle `impeccable` et démontre comment chaque domaine, règle et référence de fichier se transpose directement dans l'architecture de notre nouvelle ligne de commande unifiée **`design`**, avec l'accessibilité (`a11y`) en tant que citoyen de premier plan.

---

## 📚 1. Présentation Didactique des Modules Impeccable (V6)

La skill `impeccable` est restructurée pour éviter la copie mot à mot et proposer une sémantique ultra-premium, orientée design d'excellence. Elle fusionne les concepts redondants pour aboutir à un système plus lean de **14 méthodes structurantes** (5 fondations physiques, 6 raffinements esthétiques, et 3 flux de création).

### Famille A : L'Idéation & Création (Stratégie & Flux de Production)
*   **`teach`** : L'ingestion stratégique de l'identité du produit et de sa marque (`PRODUCT.md`).
*   **`document`** : L'extraction et la formalisation des tokens de style existants (`DESIGN.md`).
*   **`propose`** (anciennement `shape`) : Le zoning ergonomique, la proposition visuelle et l'architecture fonctionnelle d'un composant avant codage.
*   **`craft`** : La génération de code Svelte 5 / CSS ultra-propre et conforme.
*   **`promote`** (anciennement `extract`) : La promotion de styles et structures locaux d'un projet applicatif vers le design system global.
*   **`impeccable`** : Plus qu'une méthode isolée, c'est l'orchestrateur global d'assurance qualité et d'alignement visuel de notre commande de build.

### Famille B : Les Fondations & Système (Règles physiques du design)
Cette catégorie regroupe les 5 piliers physiques du design system. Ils sont pilotés par la commande d'alignement structurel **`design align`** :
*   **`tones`** (anciennement `colorize`) : Choix chromatique, espace OKLCH, contrastes réglementaires.
*   **`layout`** (anciennement `layout`) : Grille stricte, espacements (4px/8px), densité et harmonie spatiale.
*   **`typo`** (anciennement `typeset`) : Échelle typographique, hiérarchisation des titres, confort de lecture.
*   **`a11y`** (Nouveau) : Accessibilité exhaustive (WCAG, focus rings, cibles tactiles 44px, navigation clavier).
*   **`responsive`** (anciennement `adapt`) : Adaptabilité cross-device, gestion fluide des points de rupture.

### Famille C : Le Raffinement & Finesse (Polissage esthétique)
Ces modules gèrent les détails créatifs et émotionnels fins. Ils sont pilotés par la commande **`design polish`** :
*   **`motion`** (anciennement `animate`) : Transitions sveltes, cinétique fluide et respect de `prefers-reduced-motion`.
*   **`volume`** (fusion de `bolder` et `quieter`) : Régulation de l'intensité visuelle et de l'emphase (accentuation hiérarchique ou adoucissement pour reposer l'œil).
*   **`spark`** (anciennement `overdrive`) : Intensité cinétique dynamique, micro-effets de survol saisissants et transitions d'exception.
*   **`charm`** (anciennement `delight`) : Ravissement émotionnel discret, illustrations de marque soignées et design des états vides.
*   **`lucid`** (anciennement `clarify` / `copy`) : Clarté pure de la microcopie et de l'architecture de l'information (UX writing sans jargon).
*   **`essence`** (anciennement `distill`) : Épuration structurelle, élimination des couches de DOM superflues et cartes imbriquées pour ne garder que l'essentiel.

### Famille D : Les Diagnostics (Contrôle & Qualité)
*   **`tech`** (anciennement `audit`) : L'analyse technique déterministe (scans regex et DOM, conformité stricte aux tokens).
*   **`human`** (anciennement `critique`) : L'évaluation heuristique qualitative (Nielsen, charge cognitive, tests par personas).

---

## 🗺️ 2. Tableau de Correspondance Complet (14 Méthodes Épurées V6)

Voici la traçabilité rigoureuse à la maille des méthodes d'origine réorganisées sous une structure factorisée :

| N° | Famille d'Origine | Méthode d'Origine | Catégorie Cible | Nouveau Nom Premium | Commande CLI `design` | Rôle & Action dans le projet Sent Tech |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Create** | `shape` | **Création & Flux** | **`propose`** | **`design build --propose`** | Propose le plan de zoning et l'ergonomie fonctionnelle avant code. |
| **2** | **Create** | `craft` | **Création & Flux** | **`craft`** | **`design build`** | Génère le code Svelte 5 / CSS complet du composant. |
| **3** | **Create** | `extract` | **Création & Flux** | **`promote`** | **`design build --promote`** | Promeut un composant local éprouvé vers le design system global. |
| **4** | **Evaluate** | `audit` | **Diagnostics** | **`tech`** | **`design check --tech`**| Moteur de diagnostics techniques déterministes. *(WP8 V1)* |
| **5** | **Evaluate** | `critique` | **Diagnostics** | **`human`** | **`design check --human`**| Revue de charge cognitive et score heuristique Nielsen. |
| **6** | **Refine** | `colorize` | **Fondations & Système** | **`tones`** | **`design align --tones`** | Calibrage chromatique en OKLCH et contrastes WCAG stricts. |
| **7** | **Refine** | `layout` | **Fondations & Système** | **`layout`** | **`design align --spacing`** | Structure la grille technique (4/8px) et aligne les paddings. |
| **8** | **Refine** | `typeset` | **Fondations & Système** | **`typo`** | **`design align --typo`** | Définit la hiérarchie réglementaire de titres et de lecture. |
| **9** | **Nouveau** | *Ajout requis* | **Fondations & Système** | **`a11y`** | **`design align --a11y`** | Assure la conformité WCAG, focus visibles et cibles de 44px. |
| **10**| **Simplify** | `adapt` | **Fondations & Système** | **`responsive`**| **`design align --responsive`**| Optimise le rendu fluide sur tous les points de rupture physiques. |
| **11**| **Refine** | `animate` | **Raffinement Esthétique** | **`motion`** | **`design polish --motion`** | Injecte des transitions sveltes et courbes cinétiques fluides. |
| **12**| **Refine** | `bolder` / `quieter` | **Raffinement Esthétique** | **`volume`** | **`design polish --volume`** | Régule l'intensité de l'emphase visuelle (accentuation/calme). |
| **13**| **Refine** | `overdrive` | **Raffinement Esthétique** | **`spark`** | **`design polish --spark`** | Intègre les micro-interactions d'exception (effets intenses). |
| **14**| **Refine** | `delight` | **Raffinement Esthétique** | **`charm`** | **`design polish --charm`** | Ajoute le ravissement (illustrations, élégance, vide-états). |
| **15**| **Simplify** | `clarify` | **Raffinement Esthétique** | **`lucid`** | **`design polish --lucid`** | Épure la microcopie et simplifie l'expression textuelle. |
| **16**| **Simplify** | `distill` | **Raffinement Esthétique** | **`essence`** | **`design polish --essence`** | Élimine les conteneurs superflus et couches de DOM imbriquées. |

*(Note: Le concept global **`impeccable`** agit comme l'orchestrateur d'assurance qualité global au sein de la commande **`design build`**).*

---

## 🎯 3. Focus sur WP8 V1 : Le module `design check` (Technical Audit)

Le moteur de vérification technique déterministe est lancé via **`design check --tech`**.

### Règles Déterministes implémentées en V1 :
1.  **`no-bare-hex`** (`tones`) : Scanne les CSS et Svelte pour interdire les couleurs hexadécimales brutes (`#000`, `#fff`) et imposer les variables de tokens ou OKLCH.
2.  **`side-tab-on-rounded`** (`layout`) : Détecte l'utilisation de bandes colorées de bordure (`border-left-width`) sur des conteneurs à fort arrondi (`border-radius > 2px`).
3.  **`line-length-cap`** (`typo`) : Alerte sur les paragraphes `<p>` dépassant 80 caractères sans contrainte de largeur.
4.  **`touch-target-44`** (`a11y`) : Vérifie que tous les éléments interactifs (boutons, liens) ont une dimension minimale ou un padding garantissant une cible tactile de 44x44px.
5.  **`no-em-dash`** (`lucid`) : Interdit les tirets cadratins `—` ou `--` dans la copie produit, suggérant des structures plus claires (deux-points, virgules).
ont).*
*`document`** sont mappées vers **`design init`** et **`design init --extract`** pour le cadrage amont).*

---

## 🎯 3. Focus sur WP8 V1 : Le module `design check` (Technical Audit)

Le moteur de vérification technique déterministe est lancé via **`design check --tech`**.

### Règles Déterministes implémentées en V1 :
1.  **`no-bare-hex`** (`tones`) : Scanne les CSS et Svelte pour interdire les couleurs hexadécimales brutes (`#000`, `#fff`) et imposer les variables de tokens ou OKLCH.
2.  **`side-tab-on-rounded`** (`layout`) : Détecte l'utilisation de bandes colorées de bordure (`border-left-width`) sur des conteneurs à fort arrondi (`border-radius > 2px`).
3.  **`line-length-cap`** (`typo`) : Alerte sur les paragraphes `<p>` dépassant 80 caractères sans contrainte de largeur.
4.  **`touch-target-44`** (`a11y`) : Vérifie que tous les éléments interactifs (boutons, liens) ont une dimension minimale ou un padding garantissant une cible tactile de 44x44px.
5.  **`no-em-dash`** (`lucid`) : Interdit les tirets cadratins `—` ou `--` dans la copie produit, suggérant des structures plus claires (deux-points, virgules).


