# Feature: QA pixel-perfect tri-framework + correction des bugs

## Objective
Amener le design system à un niveau **communicable** : chaque composant rendu **IDENTIQUE
(pixel-perfect)** en Svelte / React / Vue, sans bug visuel ni bug de sens. Constat owner
(2026-06-08) : sur 7 composants vérifiés à la main, **6 ont au moins 2 bugs** -> blocage de
communication ("si 90% est foireux, je ne peux pas communiquer sur le design system").

## Critères de succès (UAT globaux, appliqués à chaque page de la passe systématique — voir 03-BRANCH)
- Pixel-perfect entre Svelte, React et Vue (rendu, espacements, contours, états, hover).
- Aucun bug de z-index/crop : menus/overlays jamais coupés ni passant sous le contenu.
- Centrage / alignement / contours homogènes ; tailles réellement distinctes si annoncées ; pas de bug de sens.
- Validé par un "monkey" critique (clics réels, quelques minutes par vue) en plus de l'audit headless.

## Scope / Guardrails
- Conductor = claude:sent-tech-design-system ; exécution **déléguée à claude:ds-QA**.
- Suivi **page-par-page** dans `03-BRANCH_qa-systematic-pass` (147 pages).
- Bugs prioritaires identifiés par l'owner ci-dessous. Le z-index/crop est **transversal = quick win**.
- Outils dispo : `design audit:visual` (headless), à compléter par la méthode "monkey".

## Plan / Todo (lot-based)
- [x] **Lot Z — z-index/crop overlay transversal (QUICK WIN)**
  - Symptome: menus deroulants (combobox / date-picker / dropdown ...) coupes ou passant SOUS le contenu/sidebar dans les onglets et exemples.
  - Cause racine: `.tex { overflow: hidden }` (TabbedExample.svelte + TabbedLiveExample.svelte) clippait les panneaux absolus. Fix: `overflow: visible`. z-index (80 > sidebar 30) n'etait PAS en cause.
  - [x] UAT: tout menu/overlay s'affiche au-dessus, non coupe (verifie au screenshot sur combobox ; fix structurel = couvre combobox/dropdown/multiselect/datepicker/select/menu/overflow-menu/popover/search ; sweep complet 3fw dans 03-BRANCH).
- [x] **Lot CAL — Calendar regression (grille cassee)**
  - Symptome: numeros de jours superposes/illisibles (img owner) ; "nickel il y a quelques jours" -> regression. Verifier aussi date-picker.
  - DIAGNOSTIC ds-QA (2026-06-09, confirme au screenshot /tmp/parity-full/calendar block-0 svelte+react): cause racine = CSS GLOBAL NON SCOPE. `packages/components-react/src/styles.css` (l.8285) ET `packages/components-vue/src/styles.css` (l.8268) declarent `.st-calendar__weekdays,.st-calendar__days{display:grid;repeat(7)}` (ANCIENNE structure) et AUCUNE regle `.st-calendar__week`. Or le DOM courant des 3 fw = `__days > __week(x6) > __day(x7)` (cf Calendar.svelte l.526-543, Vue Calendar.ts l.454/515). La grille 7-col posee sur le CONTENEUR `__days` etale les 6 lignes-semaines en colonnes -> jours ecrases/superposes. Le CSS non scope fuit aussi sur le rendu Svelte (dont le scoped CSS est pourtant correct) -> casse les 3 fw sur la meme page docs. Ce n'est PAS un ecart de parite (les 3 sont cassees), c'est une regression de structure.
  - FIX PROPOSE (composant -> conductor publie): dans les DEUX styles.css, remplacer la regle combinee par 3 regles alignees sur le canon Svelte: `.st-calendar__weekdays{display:grid;gap:2px;grid-template-columns:repeat(7,minmax(2rem,1fr))}` ; `.st-calendar__days{display:grid;gap:2px}` (SANS columns = pile verticale) ; AJOUTER `.st-calendar__week{display:grid;gap:2px;grid-template-columns:repeat(7,minmax(2rem,1fr))}`.
  - FIX APPLIQUE+VERIFIE (conductor, diagnostic ds-QA): les 2 styles.css corriges (`.st-calendar__days` sans grille 7col + ajout `.st-calendar__week`). Re-audit parity calendar+date-picker = 0 flag.
  - [x] UAT: grille calendrier propre svelte+react+vue, jours alignes, aucune superposition (re-audit OK).
- [ ] **Lot CMB — Combobox (tailles + parite react/vue)**
  - Symptome: tailles sm/md/lg sans difference visible ; menu passe dessous ; layout react/vue casse (label colle a gauche / cropte).
  - [ ] UAT: tailles visuellement distinctes (ou retirees si non pertinentes) ; menu au-dessus ; rendu identique svelte/react/vue.
- [ ] **Lot DP — DatePicker (crop + onglets manquants dans les exemples)**
  - Symptome: meme crop z-index dans les onglets react/vue ; ET les sections "Exemples" n'ont plus les onglets svelte/react/vue.
  - FAIT ds-QA (2026-06-09, docs-only): `apps/docs/src/routes/components/date-picker/+page.svelte` — les 4 sous-sections "Exemples" (Date unique / Plage / Bornées / Champ invalide) rendaient un `<DatePicker>` Svelte brut (sans onglets). Remplacees par 4 `<TabbedExample nodes={...} title=... />` (NodeSpec inline, motif identique a password-input/slider) ; state live supprime ; import NodeSpec ajoute. UAT dev (vite): 5 groupes d'onglets Svelte|React|Vue presents (1 haut + 4 exemples) ; Svelte & React rendent les DatePickers a dimensions egales (md=40px, sm=32px) ; `svelte-check` = 0 erreur.
  - CAVEAT (a confirmer sur audit BUILDE): en dev, le switch d'onglet vers Vue est non fiable (bug dev-only SvelteKit `replaceState before router init` qui casse le wiring de l'etat framework route-backed) -> impossible de valider le rendu Vue en dev. La baseline `/tmp/parity-full/date-picker/block-0.vue.png` prouve que le DatePicker Vue REND dans le docs builde. => conductor: re-shoot date-picker (audit:parity sur build) pour confirmer la parite Vue des 4 nouvelles sections a onglets.
  - [ ] UAT: calendrier non coupe dans les onglets ; onglets svelte/react/vue presents sur TOUTES les sections d'exemples (onglets OK ; parite Vue a confirmer sur build).
- [ ] **Lot DD — Dropdown (crop)**
  - [ ] UAT: menu dropdown au-dessus, non coupe, 3 fw.
- [ ] **Lot FU — FileUploader (hover / alignement / parite / statut)**
  - Symptome: bouton invisible au hover ; bug d'alignement ; rendu different react vs svelte ; centrage des metadonnees de statut non homogene.
  - [ ] UAT: hover lisible ; alignement correct ; rendu identique 3 fw ; metadonnees de statut centrees identiquement.
- [ ] **Lot INP — Input (alignement par le haut)**
  - Symptome: champs avec labels/aide de hauteurs differentes -> doivent etre alignes par le haut pour paraitre naturels.
  - DIAGNOSTIC + FIX ds-QA (2026-06-09, confirme au screenshot /tmp/parity-full/input/block-0): cause racine = le wrapper de rangee des demos `.fp-row` (genere par `wrap()` dans examples.ts, 61 usages) avait `align-items: center` -> dans une rangee de hauteurs inegales (label seul vs label+aide vs label+erreur), le champ court etait centre = decale vers le bas. Fix DOCS (apps/docs): `align-items: flex-start` dans les 2 def de `.fp-row` -> `src/lib/framework/TabbedExample.svelte` (l.225, exemples a onglets actifs) + `src/lib/framework/FrameworkPreview.svelte` (l.198, ancien apercu). Framework-agnostique (CSS sur le wrapper docs, pas le composant) => identique svelte/react/vue.
  - UAT (mesure DOM live, vite): top exemple Input = 3 champs, labelTop=496 et inputTop=523 IDENTIQUES sur les 3 colonnes (avant: champ court plus bas). Verifie aussi au screenshot. CSS-only (valeur align-items) -> pas de risque type/markup.
  - [x] UAT: groupe d'inputs aligne par le haut, 3 fw (wrapper commun -> parite garantie).
  - FAIT ds-QA #2 (2026-06-09, meme classe que Lot DP): la page Input avait AUSSI le bug "onglets manquants" -> ses sections etats/tailles/types rendaient du `<Input>` Svelte BRUT (11 instances). Converties en 4 `<TabbedExample>` (statesDemo/bindingDemo/sizesDemo/typesDemo, NodeSpec locale-reactif `$derived`+`fr()`), `<Input>` brut + `liveValue` supprimes. UAT SSR (curl): 5 strips d'onglets, labels FR rendus, page 200 (compile+rend). Meme fichier: input/+page.svelte.
- [ ] **Lot DOCS-TABS — Sections d'exemples sans onglets tri-framework (audit ds-QA)**
  - SCAN ds-QA (2026-06-09): 36 pages docs rendent des composants DS en direct. La plupart sont des demos INTERACTIVES legitimes (Modal/Drawer/Toast/Popover/Notification/chat-*/Form/menu = etat + triggers, restent Svelte-only par design, cf overlays/datepicker note). MAIS un sous-ensemble a le bug "exemples statiques sans onglets" (comme DP/INP). FAITS (verifies SSR, composants prouves tri-framework via registre): date-picker (Lot DP), input, highlight, quote, ordered-list, unordered-list, structured-list, message-status-badge. INTERACTIFS = laisser Svelte-only (confirme par marqueurs $state/bind/handlers): form-group, multi-select, tile-group, pagination, header. RESTE A CONVERTIR (statiques): code-snippet, aspect-ratio, empty-state, footer. Pages overview (0 onglet, composites: data-navigation, plan-completion, [slug]) = hors scope composant.
  - [ ] UAT: chaque page composant -> sections d'exemples STATIQUES en onglets svelte/react/vue (interactives documentees comme exceptions).
- [ ] **Lot I18N — Fuites de chaines anglaises sur pages FR (33 findings audit)**
  - TRIAGE ds-QA (2026-06-09): 3 familles.
  - (A) CONTENU DE DEMO = ma lane, fixe en docs:
    - overlays (Edit/Delete + tout le menu OverflowMenu hardcode EN): FAIT -> `apps/docs/src/routes/components/overlays/+page.svelte` rendu locale-reactif (`$derived` + helper `fr()`): Row actions/Edit/Rename/Duplicate/Distribute/Share/Archive/Delete -> Actions de ligne/Modifier/Renommer/Dupliquer/Distribuer/Partager/Archiver/Supprimer. UAT SSR (curl): tous libelles FR presents, tous mots EN absents ; ternaire fr() => EN preserve (pas de reverse-leak).
  - (B) FAUX POSITIFS (ne pas "corriger" = bug de sens):
    - selectable-row « next »: c'est un NOM DE BRANCHE git (demo « Branche deployee » main/next/edge). Laisser tel quel.
    - data-table « Search API »/« Graph API »: noms de SERVICES (donnees de demo, proper nouns). Acceptables. (Polir eventuellement les STATUTS Warning/Degraded -> Alerte/Degrade, non flague, basse prio.)
    - dropdown « Produit: Select »: l'initialDemo a deja `value:"forge"` + `fr()` -> leak probablement STALE (baseline anterieure) OU = placeholder par defaut composant (voir C). Re-audit le confirmera.
  - (C) DEFAUTS COMPOSANT EN (lane conductor: rendre les libellis par defaut locale-aware, comme DatePicker le fait) -> PROPOSE, pas touche par moi:
    - code-snippet « Copy » (CopyButton.__label) ; inline-loading « Loading » (react+vue, InlineLoading.__label) ; skeleton-text « Loading » (react+vue, a11y st-visually-hidden) [NB conductor edite SkeletonText.ts en batch2] ; multi-select « Select items » (placeholder) ; data-table « Previous/Next » (pager) ; pagination « Previous/Next » (PaginationNav, batch1 commite -> re-audit) ; toast « Close » ; dropdown « Select » (placeholder).
  - [ ] UAT: re-audit i18n apres fix conductor (defauts locale-aware) -> 0 fuite hors faux-positifs documentes.
- [x] **Lot TAB — Routing des onglets (bug majeur owner #1)**
  - Demande owner: cliquer un onglet d'exemple doit SYNCHRONISER le framework dans l'argument de route (?framework=) ET basculer TOUS les onglets de la page en meme temps (comme le bouton du haut), sinon incomprehensible.
  - Fait: etat unique global (framework.value) route-backed ?framework=, override local supprime (TabbedExample/TabbedLiveExample), init URL->state en untrack (corrige une boucle de feedback qui reinitialisait au defaut apres le clic).
  - [x] UAT verifie (playwright): clic onglet React -> ?framework=react + les 5 groupes d'onglets de la page basculent en react + switcher header reflete.
- [ ] **Lot MONKEY — Methode "random monkey" critique**
  - METHODE DECIDEE (deepresearch + DOUBLE opus 4.8-max + codex 5.5-high sur MODELES 2026, 2026-06-08): architecture EN COUCHES, pas un agent VLM monolithique. NB 2026: les VLM actuels (Opus 4.8, Gemini 3.1 Pro, GPT-5.4) LISENT tres bien l'UI (ScreenSpot-Pro Opus 4.8 87,9% ; OCR CharXiv 89,9%) -> "VLM inutile" est OBSOLETE. MAIS ils restent NON fiables comme juge unique de parite/spatial fin: DiffSpot mai 2026 = 40,7% recall sur 1 propriete CSS mutee, <23% tier dur ; spatial 59,9% vs humain 95% ; et SCALER NE CORRIGE PAS (magnitude pixel non correlee a la detection). Consensus opus+codex identique. Pile 3 couches :
    1. PIXEL-DIFF DETERMINISTE (fiable, recall ~100%) = screenshots Playwright (env fige: viewport/fonts/DPR/locale/anim off) + diff pixel/perceptuel (pixelmatch maison ; masques zones volatiles). (a) PARITE cross-fw: diff des 3 onglets svelte/react/vue -> attrape "react/vue fucked" ; (b) REGRESSION: baseline + diff -> attrape Calendar.
    2. ASSERTIONS DOM/CSS DETERMINISTES = boundingBox / getComputedStyle / overflow / z-index / hit-test / aria / cles i18n / tokens / tailles attendues. EXACT la ou le VLM est spatialement aveugle (z-index, centrage, alignement). NB: deja prouve (check overflowsFrame sur combobox).
    3. VLM-COMME-CRITIQUE (Opus 4.8) UNIQUEMENT sur cas suspects/echantillons: triptyque + heatmap de diff + crops + DOM metadata -> sortie STRUCTUREE pass/fail/uncertain + categorie + severite + coords. Detecte les bugs de SENS (libelle non traduit, tailles non distinctes, lisibilite) + triage/diagnostic des diffs. JAMAIS juge final ni gate CI bloquant seul.
    - Stack 100% maison: playwright-core (deja) + pixelmatch + claude. Pas de dependance RL exotique (RL/monkey = exploration/crash only, faible maturite). Calibrer les seuils sur un set de defauts injectes ; 'uncertain' = resultat normal.
  - HARNAIS LIVRE (couches 1+2, skills 0.3.0, commit f531b71): `design audit:parity` = screenshots 3 fw par bloc + pixel-diff (pixelmatch, DIMS≠/ratio) + assertions DOM + score + heatmaps + JSON. Smoke 5 pages: score 38/100, flague combobox/file-uploader/calendar (react+vue dims≠ svelte). Audit complet 147 pages lance. Couche 3 (VLM-critique) = role de claude:ds-QA / conductor sur les artefacts.
  - [x] UAT couches 1+2: harnais pixel-diff cross-fw + assertions DOM outille + valide sur 5 pages. [ ] reste: couche 3 VLM-critique systematisee + open-state interactif (v2).
- [ ] **Lot SYS — Piloter la passe systematique (03-BRANCH, 147 pages)**
  - [ ] UAT: 100% des 147 pages verifiees et conformes aux criteres de succes.
