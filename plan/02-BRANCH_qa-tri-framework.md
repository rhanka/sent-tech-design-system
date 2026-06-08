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
- [ ] **Lot TAB — Routing des onglets (bug majeur owner #1)**
  - Demande owner: cliquer un onglet d'exemple doit SYNCHRONISER le framework dans l'argument de route (?framework=) ET basculer TOUS les onglets de la page en meme temps (comme le bouton du haut), sinon incomprehensible.
  - [ ] UAT: clic onglet -> ?framework= mis a jour + tous les onglets de la page suivent + le switcher du haut reflete l'etat.
- [ ] **Lot MONKEY — Methode "random monkey" critique**
  - Identifier une methode d'agent qui clique reellement chaque vue quelques minutes en mode critique (ideal: agent RL temps-reel ; dependance externe acceptable ; deepresearch lance).
  - [ ] UAT: methode monkey definie, outillee, executable par claude:ds-QA, documentee.
- [ ] **Lot SYS — Piloter la passe systematique (03-BRANCH, 147 pages)**
  - [ ] UAT: 100% des 147 pages verifiees et conformes aux criteres de succes.
