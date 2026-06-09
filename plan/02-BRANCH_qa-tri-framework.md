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
- [ ] **Lot CAL — Calendar regression (grille cassee)**
  - Symptome: numeros de jours superposes/illisibles (img owner) ; "nickel il y a quelques jours" -> regression. Verifier aussi date-picker.
  - [ ] UAT: grille calendrier propre svelte+react+vue, jours alignes, aucune superposition.
- [ ] **Lot CMB — Combobox (tailles + parite react/vue)**
  - Symptome: tailles sm/md/lg sans difference visible ; menu passe dessous ; layout react/vue casse (label colle a gauche / cropte).
  - [ ] UAT: tailles visuellement distinctes (ou retirees si non pertinentes) ; menu au-dessus ; rendu identique svelte/react/vue.
- [ ] **Lot DP — DatePicker (crop + onglets manquants dans les exemples)**
  - Symptome: meme crop z-index dans les onglets react/vue ; ET les sections "Exemples" n'ont plus les onglets svelte/react/vue.
  - [ ] UAT: calendrier non coupe dans les onglets ; onglets svelte/react/vue presents sur TOUTES les sections d'exemples.
- [ ] **Lot DD — Dropdown (crop)**
  - [ ] UAT: menu dropdown au-dessus, non coupe, 3 fw.
- [ ] **Lot FU — FileUploader (hover / alignement / parite / statut)**
  - Symptome: bouton invisible au hover ; bug d'alignement ; rendu different react vs svelte ; centrage des metadonnees de statut non homogene.
  - [ ] UAT: hover lisible ; alignement correct ; rendu identique 3 fw ; metadonnees de statut centrees identiquement.
- [ ] **Lot INP — Input (alignement par le haut)**
  - Symptome: champs avec labels/aide de hauteurs differentes -> doivent etre alignes par le haut pour paraitre naturels.
  - [ ] UAT: groupe d'inputs aligne par le haut, 3 fw.
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
