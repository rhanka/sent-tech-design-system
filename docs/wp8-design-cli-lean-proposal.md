# Proposition d'Architecture Lean & Factorisée — CLI `design` (WP8)

Ce document présente la refonte complète et la factorisation de la bibliothèque `impeccable` (16 méthodes brutes) en un modèle ultra-lean de **4 commandes majeures**. 

Cette architecture garantit la parité fonctionnelle tout en offrant une barrière d'entrée quasi nulle pour les débutants, sans enlever la finesse de contrôle requise par les designers les plus avancés.

---

## 📐 1. La Philosophie : Factoriser sans Perdre la Finesse

L'outil d'origine Impeccable multiplie les commandes (`layout`, `typeset`, `colorize`, `distill`, `clarify`, etc.), ce qui crée une surcharge cognitive pour un développeur débutant. 

Nous regroupons ces 16 concepts en **4 piliers fondamentaux** :

```
                  ╔═════════════════════════════════════════╗
                  ║            CLI  'design'                ║
                  ╚═════════════════════════════════════════╝
                                       │
         ┌───────────────┬─────────────┴─────────────┬───────────────┐
         ▼               ▼                           ▼               ▼
   1. design init  2. design build             3. design check  4. design polish
   (Configuration)  (Génération)                (Évaluation)     (Optimisation)
```

---

## 🗺️ 2. Cartographie didactique des 4 Piliers

Voici comment les 16 méthodes d'origine se factorisent proprement :

### 1. `design init` — La Fondation (Setup & Context)
*   **Méthodes d'origine fusionnées** : `teach` + `document` + `product` + `brand`.
*   **Pour le Débutant** : Un simple `design init` lance une interview interactive de 3 questions simples en français pour comprendre le produit, et scanne le code pour générer les fichiers de marque (`PRODUCT.md` et `DESIGN.md`).
*   **Pour le Designer Avancé** : Des options précises pour configurer finement les règles d'accessibilité cibles (WCAG AA ou AAA) ou injecter des tokens personnalisés.

### 2. `design build <feature>` — La Création (Generative Flow)
*   **Méthodes d'origine fusionnées** : `shape` (zoning) + `craft` (code) + `extract` (re-usability).
*   **Pour le Débutant** : Une seule commande : `design build "un formulaire de connexion"`. L'IA propose un zoning simple (shape), obtient ton accord implicite ("poursuis"), et écrit le code Svelte de bout en bout (craft).
*   **Pour le Designer Avancé** :
    *   `design build --shape-only` : Permet de générer uniquement les spécifications visuelles et ergonomiques (zoning) sans coder.
    *   `design build --extract` : Isole un composant existant et extrait ses variables en tokens CSS réutilisables dans le design system.

### 3. `design check <target>` — Le Diagnostic (Evaluate Flow)
*   **Méthodes d'origine fusionnées** : `audit` (technique) + `critique` (qualitatif) + `cognitive-load` + `personas`.
*   **Pour le Débutant** : Une commande unique `design check` qui renvoie un **Score de Santé Design (0 à 100)** et la liste des 3 priorités majeures (contrastes, targets, em-dashes) à corriger, sans jargon technique complexe.
*   **Pour le Designer Avancé** :
    *   `design check --heuristics` : Affiche le tableau détaillé des 10 scores heuristiques de Nielsen (0 à 4).
    *   `design check --personas` : Simule le comportement d'utilisateurs cibles (ex: Alex le Power-User, Jordan le Novice) pour lever des alertes ergonomiques spécifiques.

### 4. `design polish <target>` — L'Optimisation (Refine & Simplify)
C'est le chef-d'œuvre de la factorisation. Les 11 méthodes de micro-ajustement d'origine sont regroupées sous cette commande intelligente d'embellissement en un clic.
*   **Méthodes d'origine fusionnées** : `polish` + `animate` + `colorize` + `layout` + `typeset` + `delight` + `overdrive` + `quieter` + `adapt` + `clarify` + `distill`.
*   **Pour le Débutant** : Un simple `design polish src/MonBouton.svelte` applique automatiquement le "moteur de beauté" : conversion des couleurs en OKLCH, resserrement du rythme spatial type Carbon/DSFR, suppression du slop textuel ou visuel, et injection de micro-mouvements fluides.
*   **Pour le Designer Avancé** : L'accès aux filtres chirurgicaux via des drapeaux dédiés :
    *   `--motion` (ex-`animate`) : Ajuste uniquement les courbes exponentielles de transition (`ease-out-quint`).
    *   `--typo` (ex-`typeset`) : Optimise l'échelle typographique et les longueurs de ligne.
    *   `--spacing` (ex-`layout`) : Resserre la grille d'espacement de manière ultra-précise.
    *   `--distill` (ex-`distill`) : Purge les couches visuelles superflues et simplifie le DOM.
    *   `--delight` / `--overdrive` : Ajoute les finitions créatives de haute voltige.

---

## 📊 3. Tableau de Correspondance 1:1 pour les Spécifications

| Méthode d'origine Impeccable | Sous-commande de la CLI `design` | Option / Flag ciblé |
| :--- | :--- | :--- |
| **`teach`** | `design init` | Mode interactif par défaut |
| **`document`** | `design init` | `--extract-tokens` |
| **`shape`** | `design build` | `--shape-only` |
| **`craft`** | `design build` | Par défaut |
| **`extract`** | `design build` | `--extract` |
| **`audit`** | `design check` | `--technical` ( WP8 V1) |
| **`critique`** | `design check` | `--heuristics` |
| **`polish`** | `design polish` | Par défaut |
| **`animate`** | `design polish` | `--motion` |
| **`colorize`** | `design polish` | `--colorize` |
| **`layout`** | `design polish` | `--spacing` |
| **`typeset`** | `design polish` | `--typo` |
| **`delight`** | `design polish` | `--delight` |
| **`overdrive`** | `design polish` | `--overdrive` |
| **`quieter`** | `design polish` | `--quieter` |
| **`adapt`** | `design polish` | `--responsive` |
| **`clarify`** | `design polish` | `--copy` |
| **`distill`** | `design polish` | `--distill` |
