# PLAN - Design System Harmonise `top-ai-ideas-fullstack` + `sentech-forge`

## Objectif

Construire un design system partage entre les deux produits a partir d'un socle de design tokens, puis decider si ce socle doit rester majoritairement custom ou s'appuyer sur une brique externe (`buy`) pour les primitives et/ou les composants.

Le resultat attendu n'est pas seulement un theme visuel commun. Il faut obtenir un systeme qui couvre:

- le site marketing et editorial de `sentech-forge`
- l'application metier de `top-ai-ideas-fullstack`
- les variantes d'usage visibles dans le code de `top-ai-ideas-fullstack`: web app, impression/rapport, extension Chrome, webview VS Code

## Perimetre

- Repo source 1: `/home/antoinefa/src/top-ai-ideas-fullstack`
- Repo source 2: `/home/antoinefa/src/sentech-forge`
- Repo cible de convergence: `/home/antoinefa/src/sentech-forge/sent-tech-design-system`

Le plan est organise en 3 phases:

1. analyser les besoins, composants et patterns existants ou implicites
2. choisir une strategie `make or buy`
3. implementer le socle retenu: `tokens`, `theme`, ou `tokens + theme + composants Svelte`

## Constats Initiaux Tires Du Code

### `top-ai-ideas-fullstack`

Constats visibles dans le code:

- stack SvelteKit + Tailwind CSS v3
- theming aujourd'hui partiellement implicite: `ui/tailwind.config.cjs` expose seulement `primary`, `accent`, `warning`
- grande partie du style encodee directement dans les classes utilitaires et dans `ui/src/app.css`
- theme sombre gere par surcouche CSS et classes applicatives (`topai-theme-dark`, `topai-theme-light`), pas par un vrai systeme de tokens semantiques
- nombreuses surfaces applicatives riches: navigation, auth, formulaires CRUD, tables/listes, dashboards, scatter plot, commentaires, verrous/presence, chat streaming, toasts, menus/popovers, import/export, edition riche/markdown, impression/docx
- contraintes denses et tres "enterprise app": etats de lecture seule, messages de statut, feedback, badges, overlays, side panel, densite forte

Fichiers structurants repérés:

- `/home/antoinefa/src/top-ai-ideas-fullstack/ui/tailwind.config.cjs`
- `/home/antoinefa/src/top-ai-ideas-fullstack/ui/src/app.css`
- `/home/antoinefa/src/top-ai-ideas-fullstack/ui/src/routes/dashboard/+page.svelte`
- `/home/antoinefa/src/top-ai-ideas-fullstack/ui/src/lib/components/ChatWidget.svelte`
- `/home/antoinefa/src/top-ai-ideas-fullstack/ui/src/lib/components/Header.svelte`
- `/home/antoinefa/src/top-ai-ideas-fullstack/ui/src/lib/components/WorkspaceSettingsPanel.svelte`

### `sentech-forge`

Constats visibles dans le code:

- stack Svelte 5 + Tailwind CSS v4
- presence deja nette d'un socle tokenise via variables CSS HSL et aliases Tailwind semantiques
- design plus simple mais plus proprement structure: hero, navigation, sections marketing, cartes, blog, CTA, pages editoriales
- gradients, ombres, radius, animations et couleurs deja nommes de maniere semantique
- bonne base pour servir de "grammaire" de tokens, mais couverture composant encore limitee aux besoins marketing/contenu

Fichiers structurants repérés:

- `/home/antoinefa/src/sentech-forge/tailwind.config.ts`
- `/home/antoinefa/src/sentech-forge/src/index.css`
- `/home/antoinefa/src/sentech-forge/src/components/Navigation.svelte`
- `/home/antoinefa/src/sentech-forge/src/components/Hero.svelte`
- `/home/antoinefa/src/sentech-forge/src/components/Services.svelte`
- `/home/antoinefa/src/sentech-forge/src/components/Blog.svelte`

### Hypothese Structurante

Le code actuel suggere un point de depart clair:

- `sentech-forge` porte deja une logique de tokens et de theme
- `top-ai-ideas-fullstack` porte la couverture fonctionnelle et la richesse des composants

La phase 1 devra donc:

- reutiliser `sentech-forge` comme point de depart pour la taxonomie de tokens
- cartographier `top-ai-ideas-fullstack` pour identifier les primitives et patterns manquants
- separer tres tot ce qui releve de la fondation visuelle, du theme, du composant generique et du composant metier

## Phase 1 - Analyse Des Besoins Et Mapping

### Objectif

Etablir une cartographie exploitable des composants, patterns, et tokens necessaires pour couvrir les deux UIs sans refaire un audit ad hoc a chaque sprint.

### Questions Auxquelles Repondre

- Quelles familles de composants existent deja explicitement dans le code?
- Quels patterns UI sont repetes sans etre nommes comme composants?
- Quels styles sont aujourd'hui hardcodes et devraient devenir des tokens?
- Quels besoins sont communs aux deux repos, et quels besoins sont propres a l'un des deux?
- Quelle partie du systeme doit rester purement thematique, et quelle partie exige de vrais composants partages?

### Travaux A Mener

#### 1. Inventaire Des Surfaces UI

- lister les routes, pages et zones fonctionnelles de chaque repo
- regrouper les ecrans par type: marketing, edition, administration, analyse, collaboration, auth, contenu
- relever les supports a couvrir: responsive web, dark mode, impression, extension/webview

#### 2. Inventaire Des Composants Existants

- reperer les composants explicites deja presents dans `src/components`, `src/lib/components` et les pages qui portent encore leur propre UI
- distinguer:
  - primitives potentielles
  - composants composites partageables
  - composants metier a ne pas mettre dans le design system de base

#### 3. Inventaire Des Patterns "Devines" Depuis Le Code

Patterns probables a formaliser:

- app shell / header / navigation responsive / burger / user menu
- hero marketing / section shell / CTA / cartes editoriales
- formulaires et champs avec validation, lecture seule, inline edit
- listes, tableaux, cartes de dashboard, empty states, loading states, errors
- badges, tags, stat pills, etats de statut, feedback success/warning/error/info
- dropdowns, popovers, menus contextuels, modales, drawers
- chat panel, timeline de messages, composer, upload/document attach, jobs/queue
- collaboration: commentaires, lock/presence, annotations, compteurs
- data viz et objets analytiques: score cards, scatter plot, matrices, rapport imprimable
- contenu riche: markdown, rich text, blog post, references

#### 4. Extraction Des Tokens Implicites

Categories de tokens a extraire:

- couleur: brand, surface, text, border, accent, status, chart, overlay
- typographie: familles, tailles, graisses, line-heights, tracking
- spacing: echelle de padding, gap, layout, section spacing
- rayon: controles, cartes, overlays, pill badges
- ombres: subtle, medium, floating, overlay
- border widths et opacites
- breakpoints et largeur container
- motion: durations, easings, entry/exit, hover, attention
- z-index et couches d'interface
- densite: compact / default / spacious si necessaire

#### 5. Construction D'Une Taxonomie Cible

Structurer les tokens en trois niveaux:

- `foundation`: valeurs brutes (palette, type scale, spacing scale, radius scale)
- `semantic`: `surface-default`, `text-muted`, `action-primary`, `feedback-danger`, etc.
- `component`: variantes fines propres a certains composants, seulement si necessaire

#### 6. Mapping Composants -> Tokens

Pour chaque famille UI, documenter:

- composant ou pattern source dans `top-ai-ideas-fullstack`
- composant ou pattern source dans `sentech-forge`
- cible design system
- tokens requis
- niveau de mutualisation possible: shared, themed, ou product-specific

### Besoins Deja Visibles Dans Les Deux Repos

#### Besoins Communs

- navigation responsive
- systeme de cartes
- hierarchie typographique riche
- CTA / boutons / liens d'action
- etats de feedback et badges
- theming light/dark au minimum pour l'app, potentiellement light-first pour le site
- support bilingue FR/EN
- tokens de layout coherents: container, sections, gutters, breakpoints

#### Besoins `top-ai-ideas-fullstack`

- primitives de formulaires robustes
- tables et listes denses
- overlays et menus riches
- chat et composants conversationnels
- feedback systematique: toasts, inline alerts, badges d'etat
- data visualization et cartes analytiques
- patterns collaboratifs: commentaires, presence, verrouillage
- impression et rapports exportables
- compatibilite web app + extension + webview

#### Besoins `sentech-forge`

- hero / sections marketing / blog cards / editorial blocks
- gradients, surfaces premium, visual storytelling
- composants de contenu et CTA plus expressifs
- navigation scrollee / anchor links / page blog
- theme de marque plus narratif que l'application metier

### Livrables Attendus En Sortie De Phase 1

- un inventaire `components-and-patterns.md`
- une matrice de mapping `component-mapping.csv` ou `.md`
- une premiere taxonomie de tokens `tokens-draft.md`
- une liste priorisee des composants a mutualiser
- un backlog des ecarts: `missing-primitives`, `missing-theme-bridge`, `product-specific-components`

### Definition Of Done Phase 1

- 100% des grandes surfaces UI des deux repos sont classees
- chaque pattern important a un proprietaire logique: token, theme, composant partage, composant metier
- les tokens indispensables sont identifies sans ambiguite
- un ordre de migration est propose

## Phase 2 - Strategie Make Or Buy

### Objectif

Choisir le niveau d'externalisation le plus rationnel pour accelerer la convergence sans perdre la capacite a couvrir les besoins app + marketing.

### Criteres De Decision

- compatibilite Svelte / SvelteKit / Svelte 5
- capacite de theming par tokens CSS variables
- couverture de primitives accessibles
- qualite des overlays, formulaires, navigation, table, feedback
- aptitude a couvrir a la fois une app dense et un site marketing
- cout de migration depuis Tailwind v3 et v4
- possibilite de conserver un branding fort pour `sentech-forge`
- possibilite de gerer des besoins "enterprise" pour `top-ai-ideas-fullstack`
- maturite de documentation, maintenance, licence, ergonomie pour l'equipe

### Options A Evaluer

#### Option A - Tokens + Themes Custom, Peu De Buy

Quand la choisir:

- si le besoin de controle est prioritaire
- si la divergence marketing/app est forte
- si les composants metier dominent largement les primitives

Implication:

- effort plus eleve
- meilleure maitrise long terme

#### Option B - Buy Pour Les Primitives, Custom Pour Le Theme Et Les Composites

Options candidates a mettre dans la short list:

- `daisyUI`: rapide pour theming Tailwind, bon pour demarrer, moins fort pour une gouvernance DS exigeante
- `Carbon`: fort sur l'enterprise, mais risque de cout d'integration et d'ecart avec l'ecosysteme Svelte et avec le site marketing
- `Bits UI` / `shadcn-svelte` / equivalent: souvent plus adaptes si on veut des primitives accessibles et garder la main sur les tokens et le rendu
- `Skeleton`: pertinent a examiner pour un contexte Svelte + Tailwind si l'on veut un point d'appui plus proche de l'ecosysteme local

Implication:

- meilleur compromis probable si l'on veut mutualiser vite sans enfermer le branding

#### Option C - Buy Plus Large Avec Theme Mince

Quand l'envisager:

- si la priorite devient la vitesse de livraison court terme
- si l'equipe accepte une personnalisation plus limitee

Risque:

- dette de contournement importante sur les composants metier de `top-ai-ideas-fullstack`
- resultat marketing potentiellement trop generique pour `sentech-forge`

### Methode D'Evaluation

- choisir 3 options maximum
- scorer chaque option sur une matrice commune
- realiser un spike court sur 2 ecrans tests:
  - un ecran marketing `sentech-forge`
  - un ecran dense `top-ai-ideas-fullstack`
- mesurer:
  - vitesse de reproduction
  - flexibilite theming
  - qualite accessibilite
  - ecart fonctionnel
  - dette CSS de contournement

### Livrables Attendus En Sortie De Phase 2

- une decision argumentee `make-buy-decision.md`
- une matrice de scoring
- un plan de migration cible
- une recommandation explicite:
  - `tokens only`
  - `tokens + themes`
  - `tokens + themes + shared svelte components`

### Decision Probable A Challenger Pendant La Phase 2

Hypothese de travail raisonnable au vu du code actuel:

- conserver un socle de tokens et de themes custom
- evaluer un `buy` surtout pour les primitives accessibles et overlays
- garder custom les composants metier, analytiques, conversationnels et editoriaux

## Phase 3 - Implementation

### Objectif

Mettre en production le design system choisi, avec une strategie de migration progressive qui n'oblige pas a reerire toutes les UIs d'un coup.

### Architecture Cible Recommandee

Le repo `sent-tech-design-system` devrait pouvoir heberger a terme:

- une source de verite des tokens
- des themes produits
- des primitives ou composants Svelte partages si la phase 2 le justifie
- la documentation et les exemples de mapping

Structure cible possible:

- `tokens/` ou `packages/tokens/`
- `themes/` ou `packages/themes/`
- `packages/svelte/` pour les primitives partagees
- `docs/` pour guidelines, mapping et conventions

### Lots D'Implementation

#### Lot 1 - Foundations

- definir la taxonomie de tokens finale
- figer les noms semantiques
- produire les formats de sortie utiles: CSS variables, JSON, eventuellement Tailwind preset
- traiter explicitement la cohabitation Tailwind v3 / Tailwind v4

#### Lot 2 - Themes Produits

- theme `sent-marketing`
- theme `topai-app`
- alignment des modes clair/sombre
- bridge de compatibilite pour les classes utilitaires existantes pendant la migration

#### Lot 3 - Primitives Partagees

Cibles minimales probables:

- button
- link
- input / textarea / select / checkbox / radio / switch
- card
- badge
- alert
- menu / popover / dropdown
- dialog / drawer
- tabs
- table
- toast
- empty state / loading state

#### Lot 4 - Composants Composites Partages

Seulement si la phase 1 montre une vraie convergence:

- app shell/header/footer de base
- section shell marketing
- stat card / metric card
- content block / article card
- form field wrappers

#### Lot 5 - Composants Metier Restant Hors DS De Base

A priori a laisser dans les produits ou dans une couche "product-ui":

- chat widget et timeline conversationnelle
- scatter plot et visualisations metier
- rapport imprimable/docx
- presence/lock/comments workflow
- composants lies aux dossiers, organisations, use cases

### Ordre De Migration Recommande

1. tokens et themes sans changer les comportements
2. remplacement progressif des classes hardcodees par des tokens semantiques
3. adoption des primitives partagees sur les surfaces les moins risquées
4. migration des ecrans applicatifs denses
5. traitement a part des surfaces speciales: print, extension, webview

### Verification Et Qualite

- snapshots visuels ou captures de reference
- checklist accessibilite clavier/focus/contraste
- verification des modes responsive
- verification light/dark
- verification impression pour `top-ai-ideas-fullstack`
- revue des regressions de densite et de lisibilite

### Definition Of Done Phase 3

- un socle de tokens unique alimente les deux produits
- les themes des deux produits sont alignes sur ce socle
- les primitives partagees couvrent les cas communs sans contorsions majeures
- les composants metier restent isoles quand la mutualisation n'apporte pas de valeur
- la dette CSS hardcodee critique baisse fortement dans `top-ai-ideas-fullstack`

## Risques A Suivre Des Le Debut

- ecart Tailwind v3 vs v4
- tentation de mettre trop de composants metier dans le design system
- conflit entre branding marketing et ergonomie applicative
- sous-estimation des etats complexes de `top-ai-ideas-fullstack`
- absence de bridge temporaire provoquant une migration trop brutale

## Premiers Principes Proposes

- partir d'un socle `token-first`
- nommer les tokens par role, pas par couleur brute
- garder des themes differents pour le marketing et l'app si necessaire
- acheter eventuellement des primitives, pas l'identite produit complete
- ne mutualiser un composant que s'il couvre un besoin commun stable
