# MANDAT — Rapatriement @sentropic/graph + dataviz vers le design system (programme ouvert)

Owner-demandé 2026-09-15. Conducteur = design-system (moi). Exécutant principal = **astra ultra** (délégation owner).
Format des questions ouvertes = **decision dossier rendu via le module h2a-focus + le design system**, challengé **fable 5.1 + gemini 3.7**.
Puis **boucle** : (a) design → build par **astra** + revue **fable 5.1** ; (b) build par **gpt-5.6-sol xhigh** + revue **gemini 3.8**.

## Règles dures (owner / CLAUDE.md)
- **AUCUN trailer d'attribution IA sur les commits** (Co-Authored-By / Claude-Session / Generated with…), tous repos. Prime sur le défaut du harnais.
- Jamais le terme « honnête » ni dérivés → termes factuels (`unknown`, `source-gap`, `N-A`, `unverified`, `partial`, `not covered`).
- h2a/track : écrire via interfaces supportées ; ne pas éditer à la main journaux/hashes ; ne pas attribuer une action d'agent à un humain. Ne jamais présenter un plan local comme déjà créé dans track.
- Réutiliser le code Sentropic lors des rapatriements. Tiers diagramming/layout (ELK, Graphviz, diagram-js, JointJS) = **références de couverture, PAS dépendances runtime implicites** : « reprendre algorithmes et capacités, pas copier le code ». Distinguer réimplémentation autonome / adaptateur envisagé / dépendance autorisée. Inventorier les deps tierces déjà présentes, sans réécriture opportuniste.
- Ne pas fusionner toutes les responsabilités dans un package de composants ; conserver la séparation noyaux TS / modèles métier / processing / rendu / interaction / état dashboards / apps.
- Préserver noms `@sentropic/graph` et `@sentropic/dataviz-*` (tout renommage = justification + stratégie de compat).

## Checkouts locaux (vérifiés présents)
- DS : `/home/antoinefa/src/sent-tech-design-system` (branche feat/geo-adapter-svelte). Fichiers mandat présents : PRODUCT.md, PLAN.md, plan/00-SEGMENTATION-STREAMS.md, docs/workpackages.md, docs/graphics-roadmap.md, docs/sentropic-alignment-inventory.md, spec/SPEC_EVOL_WP20_DATAVIZ_FR.md, plan/07-BRANCH_wp20_dataviz_fr.md, apps/docs/src/lib/feedback/DiagramAnnotator.svelte. Composants apparentés : ForceGraph, GraphLegend, ArcDiagramChart, ChordDiagram, DashboardGrid (packages/components-{svelte,react,vue,angular}).
- Graphify : `/home/antoinefa/src/graphify` — `packages/graph` (@sentropic/graph, WebGL/Canvas2D, buffers typés) + `packages/graph/src/layout-registry.ts` (force, typed-layer, time-oriented, git-flow, radial, grid, metro).
- Dataviz : `/home/antoinefa/src/dataviz/packages/` — dataviz-core, dataviz-svelte, dataviz-react, dataviz-vue, dataviz-angular (angular = private:true, tarball DS local à résoudre).
- Sentropic : `/home/antoinefa/src/sentropic` (contrats pertinents).

## Décision produit (mandat §1)
Le DS devient le dépôt de référence des bibliothèques partagées graphes/diagrammes/dataviz. Rapatrier : (1) `@sentropic/graph` + capacités génériques de graphify → graphify devient CONSOMMATEUR ; (2) TOUTES les bibliothèques dataviz (contrats, tests, adaptateurs, doc, distribution). Remplace le choix antérieur « garder graph dans Graphify + adaptateur optionnel DS ». Graphify garde : ingestion, indexation, connaissance, evidence, orchestration. État inter-vues reste dans les packages dataviz dédiés (désormais même monorepo). Composants présentationnels restent contrôlés.

Cible = bibliothèque custom extensible : moteurs WebGL/SVG/HTML-DOM + hybrides ; processing graphe/layouts/routage ; modèles formels riches + profils métier + pivots interop ; édition canevas modèle humain/agent Sentropic ; bibliothèque d'apps/recettes ; intégration cohérente de toute la dataviz.

## Livrables attendus d'astra (dans les conventions du dépôt)
M0 (démarrer MAINTENANT) : **audit ciblé + réconciliation** — inventaire source→destination→décision→item track de tous les packages/exports (graph + dataviz-*), historique h2a/track réconcilié avec code/tests/commits, doublons/écarts/dépendances, programme track initialisé sur les streams existants. Puis : architecture cible (2 diagrammes Mermaid : flux fonctionnel + dépendances de packages, sans cycles), modèle formel & pivots (§4), catalogue processing/algorithmes/layouts (§5 : ELK algos + groupes d'options + Graphviz + moteurs réels graphify/dataviz, avec date/version), rendu/canevas (§6), bibliothèque d'apps (§7 : catalogue JointJS comme couverture min), feeding track (§8, streams S1–S7), migration par lots M1–M6 (§9), preuves/critères (§10), livrables (§11).

Cadre complet = les 11 sections du prompt owner (voir conversation). Points d'entrée à REVALIDER (pas un inventaire fini) : graphify packages/graph (buffers typés WebGL/Canvas2D) ; layout-registry (le registre force transmet des positions déjà calculées → retrouver les vrais moteurs/workers ailleurs) ; composants graphes/annotation DS existants (recouvrements/APIs) ; dataviz 5 packages (tous rapatriés, même ceux omis des README) ; dataviz-angular private+tarball local ; builders/filtres/cross-filter/agrégation/annotations/palettes/dashboard/bookmarks/exports (inventorier au niveau exports+usages).

## Streams track (mandat §8) — rattacher, ne pas recréer la taxonomie
S1 Cœur & Composants · S2 Frameworks & Parité (svelte/react/vue/angular équilibré) · S3 Theming & Marques · S4 Dataviz/BI (rapatriement principal) · S5 Docs & Site · S6 Moteur/Outillage/Release (workspace, workers, CI, packaging, OIDC/trusted publishing) · S7 Application & QA Consommateurs (bascule graphify/sentropic/dataviz). Un item = 1 propriétaire principal + liens de dépendance (pas de copies multi-stream). Clé de rapprochement stable (idempotent). Retrouver+compléter les items existants avant d'en créer.

## Architecture cible (mandat §3) — responsabilités, pas 1 package/case
Contrats&noyau · Domaines&codecs · Processing · Scène&géométrie · Moteurs (WebGL/SVG/HTML/compo, Canvas2D compat transition) · Interaction · Adaptateurs DS (tokens/thèmes/wrappers 4-fw) · Dataviz (état inter-vues) · Applications. Noyau utilisable sans DOM ni framework. Aucun import graphify/app dans les couches génériques. Deps lourdes isolées/lazy.

## Formel & pivots (mandat §4) — pas nodes/edges + sac de props
Séparer : Document sémantique / Vues&occurrences / Projection processing / Géométrie&scène / Sources textuelles (AST/CST). Pivots min : UML/PlantUML, Mermaid, BPMN (natif+XML+DI), ArchiMate (Open Group exchange), draw.io (mxGraph), Sparx EA (XMI/profils — pas de format universel inventé), pivots de rendu (SVG/DOM/WebGL). Chaque conversion → rapport (converti/conservé-extension/dégradé/ignoré/non-supporté). Pas d'aller-retour universel sans perte promis.

## Processing (mandat §5)
Catalogue exhaustif : ELK algos + ELK option-groups (2 axes séparés) + Graphviz moteurs + moteurs réels graphify/dataviz, avec id source/référence/équivalent Sentropic/statut/item. Ne pas supposer tous les moteurs ELK dispo dans elkjs/navigateur. Registre : types/contraintes, phases composables, généralistes (layered/Sugiyama, arbres, radial, force/stress, grids, packing, compaction, dé-chevauchement), routage (orthogonal/octilinéaire/courbe, évitement, ports, labels, self-loops), spécialisations métier (émettent contraintes, exploitent phases communes), déterminisme/seed/incrémental/annulation/diagnostics. Résultats riches (rects, ports, routes, labels, identités, métriques, diagnostics) + compat PositionFrame. Workers sur snapshots versionnés (pas d'écrasement de modifs récentes).

## Rendu & canevas (mandat §6)
Contrat de scène unique → WebGL+SVG ; HTML backend DOM ou couche interactive hybride (traitement explicite des arêtes). Cohérence coords/caméra/zoom/ports/hit-testing. Préserver renderer graphify comme couche dessin ; sélection géométrique mutualisée indépendante backend. Canevas : sélection/déplacement/redim/liens/ports/snap/groupes/copier-coller/palette/inspecteur/undo-redo/annotations/cerclage, primitives DS+tokens. Humains ET agents → commandes typées, même validation. Distinguer aperçu/transaction/persistance ; occurrence vs entité vs vue. Présence/activité/live Sentropic après audit (scopes h2a/track ≠ verrous). Persistance/ressources par ports ; cœur utilisable hors Sentropic.

## Migration par lots (mandat §9) M0→M6
M0 réconciliation · M1 rapatriement (graph+tous dataviz au workspace, compat+packaging) · M2 fondations (contrats doc/vues/scène/processing/commandes) · M3 tranche complète (diagramme éditable, SVG/WebGL, saisie HTML, layout/routage, BPMN+ArchiMate natifs) · M4 interop (codecs pivots par sous-ensembles prouvés) · M5 couverture (algos/options + apps des inventaires) · M6 adoption (consommateurs basculés, release, retrait anciennes implémentations). Rapatrier d'abord comportement+provenance+tests puis refactor par tranches. Éviter 2 implémentations divergentes actives (points d'entrée transitoires délèguent au canonique). Traiter chemins internes/exports/peer-deps/CSS/assets/tarballs/lockfiles/build/versions/OIDC.

## Preuves (mandat §10)
Inventaire complet sans oubli silencieux ; imports/build/types/packaging/usages consommateurs ; indépendance noyaux + absence cycles + lazy ; invariants profils/refs/multi-vues/migrations schéma ; fixtures aller-retour formats + rapports pertes ; layout/routage sous contraintes + cas impossibles diagnostiqués + stabilité incrémentale ; géométrie/sélection/SVG-WebGL/HTML/exports ; clavier/focus/IME/thèmes/a11y/SSR ; transactions/undo-redo/conflits révision/rejet worker périmé ; état inter-vues dataviz/filtres/bookmarks/exports sans régression ; perfs mesurées ; apps démontrables via APIs publiques + écarts parité visibles. Inventorié ≠ implémenté ; démo rendue ≠ conformité métier ; build vert ≠ adoption.

## Références de départ (à revalider)
DS streams commit 4227768 · DS WP20 contrat · DS ForceGraph Svelte · Graphify graph contrat commit 1a72369 · Graphify layout registry · Dataviz archi commit 0869ae5 · Dataviz core exports · Dataviz Angular manifest · Dataviz handover historique à réconcilier (ex : ancien handover dit WP20 bloqué alors que plan DS le déclare terminé → vérifier le contrat effectif).

## Comportement attendu
Commencer par l'audit ciblé + réconciliation, alimenter le plan/track, puis engager le 1er lot réalisable. Ne pas s'arrêter à une proposition. Avancer sans redemander les décisions déjà prises. Ne pas inventer de contrainte bloquante ; consigner hypothèses réversibles. Arbitrage réellement nécessaire → concret (options+conséquences) tout en poursuivant les travaux indépendants. Checkpoint : livré / restant / blocages / IDs track / prochaine action. Programme OUVERT tant que couverture+migrations non réalisées.

---
## Journal
- 2026-09-15 : M0 inventaires produits (inv-graphify-graph.md : @sentropic/graph v0.2.0 MIT 0-dep, vrai moteur force = graph-layout.ts hors package ; inv-dataviz.md : 5 packages v0.4.52, core TS 0-dep, WP20=partial/unverified). astra ultra LANCÉ via h2a_run (codex gpt-6-astra xhigh, session astra-repat, worktree .repat-wt off main, inputs dans .astra-inputs/). Il exécute M0 (réconciliation + track init + archi + questions de décision). Blocages contournés : classifieur bash "unsafe agents" → h2a_run MCP (owner a reconnecté h2a). Hypothèses réversibles : fable-5.1→fable-5, gemini-3.8→3.7 en attendant routage, ultra→xhigh.
- SUITE : monitorer le checkpoint astra → réconcilier decision dossier (rendu h2a-focus+DS, challenge fable 5.1 + gemini 3.7) → présenter owner → installer la boucle (design→astra+fable ; build→5.6-sol-xhigh+gemini 3.8) pour M1+.
- 2026-09-15 (M0 rendu) : astra a produit SPEC_STUDY + SPEC_DECISIONS (D1–D4) + decisions.json + source-map (audit.mjs/json/md) + ds-audit + architecture-dag + reference-catalog + m1-provenance + track-sync + plan/10-BRANCH + replay track ; init track (.track/events.jsonl modifié) ; M1 conservatoire commencé (packages/graph/ + packages/dataviz-core/ copiés). 0 commit (working-tree). astra tourne encore.
- 4 DÉCISIONS OWNER : D1 contrat document/profils (A noyau typé+profils / B natifs par domaine / C source-maître) ; D2 release/npm (A graph indép+dataviz lockstep+DS / B monorepo lockstep / C par-package) ; D3 fidélité pivots M4 (A sous-ensembles qualifiés / B round-trip 1 dialecte profond / C import large read-only) ; D4 seuil publication dataviz-angular (A tranche M3 4-fw / B catalogue complet / C seam expérimental). astra lean = A partout (provisoire).
- CHALLENGES lancés : fable (Agent model:fable) → scratchpad/challenge-fable-decisions.md ; gemini-3.7-flash (h2a codex, session gemini-challenge) → .repat-wt/docs/challenge-gemini-decisions.md. SUITE : réconcilier les 2 challenges + recos astra → présenter les 4 décisions à l'owner via h2a-focus + DS → puis boucle build.
- 2026-09-15 (checkpoint M0 astra) : docs/graph-dataviz-checkpoint.md — M0 complet (3547 exports mappés, track S1-S7 init 21+5 items, catalogue couverture) + M1 graph+core intégrés, tests verts. Acceptation track unknown (rien fabriqué).
- CHALLENGE fable RENDU (scratchpad/challenge-fable-decisions.md) — TRANCHANT :
  * 2 ERREURS FACTUELLES de mon inventaire dataviz, VÉRIFIÉES vraies : F1 @sentropic/design-system-angular EST publié npm 0.37.0 (blocage tarball de D4 caduc) ; F2 a3f464b (DashboardGrid éditable) EST dans v0.4.51/v0.4.52 (publié → "drift" D2 = 3 commits après v0.4.52).
  * Verdicts : D2→A′ (tags préfixés obligatoires, DS `v[0-9]*` déjà pris ; lockstep dataviz = les "bumps massifs" reprochés à B ; C = convention native DS). D4→REJETER tel quel (ancrer un adaptateur BI sur la tranche M3 = erreur de catégorie) → C′ (seam sur ligne de version séparée + dist-tag next + matrice parité). D1→nuancer (pas de RelationRef dans l'étude ; décider maintenant seulement l'irréversible). D3→nuancer (A = wording du mandat §9 ; vrai coût = infra de parsing ; poser la politique deps parseurs).
  * NOUVELLES décisions owner que astra a prises seul et à remonter : 3 noms `@sentropic/diagram-*` + la dépendance design-system-fw → graph/diagram-canvas (impacte TOUS les consommateurs DS) ; politique de pins ; politique de deps parseurs.
- gemini-3.7 challenge : RUNNING (pid 41805). SUITE : gemini → réconcilier (astra+fable+gemini+corrections F1/F2) → présenter via h2a-focus+DS.
- 2026-09-15 (correction owner) : gemini = **3.8** (gemini-3.8-flash), PAS 3.7. Vérifié routable via h2a codex+gateway (session gemini38-challenge, pid 123566) → challenge relancé en 3.8 (canonique dossier+boucle). Le run 3.7 (pid 41805) finit en bonus. Substitution 3.8→3.7 RETIRÉE. Rendu prévu : track focus <ID> --format html + thème DS, ouvert dans Chromium (/snap/bin/chromium, DISPLAY :0).

## [2026-09-15] NOUVELLE DIRECTION OWNER — decision dossier = section DS (format h2a-focus)
- Mon rendu HTML bespoke = MAUVAIS format (pas h2a-focus). Corrigé.
- Owner : (1) rendre le decision dossier au vrai format h2a-focus ; (2) consulter h-cond (capitalisation sur i-cond + sentropic) ; (3) échanger avec h2a sur écrans & composants ; (4) INTÉGRER le decision dossier au DS comme SECTION à part entière, theme-portable.
- Action : message envoyé à h-cond [fd1e0b] — demandé: chemin de rendu focus canonique + contrat decision-document ; router la session h2a (h-arch/focus owner) pour écrans&composants ; pointer le travail i-cond+sentropic à capitaliser. Objectif: composants DS-owned, parité 4-fw, tokens --st-*.
- Cas immédiat: dossier graph/dataviz D1–D7 (IDs track GD-*/01M2KK5X…, .repat-wt/spec) à re-rendre en focus une fois le contrat obtenu.
- gemini 3.8 challenge continue en // (enrichira le CONTENU du dossier).

## [2026-09-15] h-cond répond — convergence focus/DS-section
- Rendu DS-stylé AUJOURD'HUI = kit focus sentropic (~/src/sentropic/.tmp/focus-cluster-mesh-decision-kit, schema sentropic.focus.decision-kit/v4, Svelte5+DS+build-portable.mjs → HTML autoportant). h-cond a rendu 3 dossiers ainsi cette session.
- h-cond = mon contact h2a focus (pas de session h-arch live). Il extrait le contrat composants (PendingDecision/DecisionOption/render-core, repo h2a).
- À CAPITALISER (owner "reverser dans DS") : kit sentropic (v4+DS+xyflow) + i-cond (gabarit carte v11, SvelteFlow/subflow, + DESIGN DOSSIER déjà écrit & revu fable/gemini : DESIGN-focus-svelteflow-decision-dossier.md rév.2, couvre DS-section+cross-fw+CLI).
- CONVERGENCE: analyse astra-focus-2 (h-cond) en cours tranche déjà OÙ vit le render + flux h2a focus <json>→HTML + xyflow/vueflow/angular = exactement ma cible. RÉPARTITION actée (une seule initiative): astra-focus-2 = render/contrat ; MOI = section DS (4-fw, --st-*) ; h-cond = contrat focus + CLI. Je NE lance PAS d'analyse parallèle ; h-cond me loope au rendu astra.
- Anti-doublon clarifié: mes challenges fable/gemini = CONTENU décisions GD, pas archi render.
- J'ai dit GO → h-cond pousse schema v4 + design doc i-cond. INTERIM: mapper dossier GD → v4 → rendre via kit → HTML DS-stylé → ouvrir Chromium owner.

## [2026-09-15] INTERIM rendu au format h2a-focus (kit sentropic v4) — SERVI
- Mappé le dossier GD → schema v4 : scratchpad/graph-dataviz-dossier.v4.json (7 décisions D1–D7, facts F1/F2, recos réconciliées astra+fable ; gemini 3.8 à folder).
- Copie du kit (sans node_modules, symlink) : scratchpad/focus-gd-kit. App.svelte importe ../dossier.json → swap = mon contenu. `vite build` (natif, node22) OK (4431 modules) → `build-portable.mjs` → dist/cluster-mesh-r14-portable.html (429Ko autoportant). Titre corrigé GD.
- SERVI : python3 http.server 127.0.0.1:5610 (tâche bsfj961gt, run_in_background) → http://127.0.0.1:5610/ (HTTP 200 vérifié). Owner ouvre dans Chromium (sandbox ne peut pas GUI-launch).
- Caveat : scène architecture-canvas résiduelle/vide (pas de diagramme GD généré) ; contenu décisions = GD. Rebuild à la sortie gemini 3.8.
- Rendu fait nativement (pas besoin d'offload à h-cond). Structurel (section DS) : sur base convergée astra-focus-2 + design doc i-cond ; h-cond loope.

## [2026-09-15] FIX rendu focus — owner a vu du résidu cluster-mesh (2 premières pages)
- Cause: kit App.svelte a introSlides=3 (3 slides intro cluster-mesh EN DUR: Architecture/Plan API + ArchitectureCanvas, preuves inter-agents, enrôlements MCP) + badges "D1–D17"/"modalités D18" + Alert "Convergence r13→r14" + wording "Position r13" + title "cluster-mesh plugin Hono". Le swap dossier.json ne pilotait QUE les décisions ; l'intro restait cluster-mesh.
- FIX (App.svelte dossier-driven): introSlides=0, currentLabel simplifié, 2 badges retirés, Convergence alert désactivée, 3 blocs intro {#if false}, wording "Recommandé (conducteur)", title GD (App.svelte + index.html), raw-spec.md neutralisé GD. Rebuild vite OK. Résidu visible = 0 (D1–D17/Plan API/Position r13/title-Hono = 0). Restent 2 "cluster-mesh" invisibles (data scène architecture morte, {#if false}).
- Servi (même URL http://127.0.0.1:5610/, tâche bsfj961gt). 7 décisions D1–D7 rendues, title GD.
- Directionnel: App.svelte dossier-driven = 1er pas vers le renderer générique de la section DS.
- Leçon: j'avais sous-estimé la spécialisation cluster-mesh du kit (au-delà de dossier.json). Corrigé.

## [2026-09-15] astra-focus-3 livré — contrat de frontière DS (section decision-dossier)
- Analyse lue: R/focus-render-home-analysis.md + focus-render-home-dossier.json (D1–D4 pending, gate Opus Incomplete).
- Reco: D1=B (@sentropic/focus-render dans h2a, consomme le DS) ; D2=A (CLI h2a focus json→html, CSP stricte) ; D3=A (1 compilateur + 4 adapters qualifiés) ; D4=A (coexistence bornée+rollback).
- MA FRONTIÈRE (D1=B, §5.1): focus-render possède v4/compilateur/build/CLI/scènes ; MOI = composants DS + thème + parité 4-fw + qualification CSP. Pas d'absorption contrat/Track. = split ADR-0025.
- RISQUE DS clé (§5.4): CSP stricte (style-src-attr none, pas d'unsafe-inline) × styles dynamiques xyflow (handles/transforms) = "incompatibilité à MESURER". Si incompatible → styles fixes en classes + mutations viewport qualifiées. L0 joint Focus+DS.
- v4: 11 clés racine; extension additive diagram.definition proposée (scènes déclaratives) dans le MÊME v4 (pas de 2e format). formalisation générique v4 = L1 focus-render.
- MON POSTURE: PREP conception section DS + plan qualif CSP ; HOLD build jusqu'à ratification owner de D1. Offert à h-cond de lancer la passe Opus (Opus dans mon routing) pour clore son gate.
- 2 dossiers pending owner: GD (:5610) + focus-render (h-cond rend). Interface render-core (App/ArchitectureCanvas/Node/Edge) à recevoir de h-cond.

## [2026-09-15] Interface render-core reçue + passe Opus lancée
- Interface: R/focus-render-core-interface.md. Composants à généraliser (DS-owned, 4-fw): ArchitectureCanvas {scene,label,title,compact,fitView} (wrappe xyflow + DS Badge/Flex/Stack, layout routeScene Dagre LR — LOCUS CSP), ArchitectureNode {data:{title,function,detail,kind,level,status,statusLabel,tone}}, ArchitectureEdge (xyflow standard BaseEdge). Frontière DATA = scène {nodes:[{id,data}],edges:[]} (moteur produit / composant DS consomme). 4-fw: svelte @xyflow/svelte, react @xyflow/react, vue @vue-flow/core, angular = pas d'xyflow officiel → adapter à qualifier (gap D3). Props identiques cross-fw, tokens --st-*.
- Opus pass: h-cond a dit GO (revue, pas build → conforme règle owner). Lancé Agent model:opus (a65495defc8c1954e) revue indépendante focus-render → opus-review-focus-render.md. Verdict+amendements à renvoyer à h-cond avant ratif owner.
- 2 dossiers pending owner: GD (:5610) + focus-render (:5612, ouvert par h-cond dans le navigateur owner ; + "décision 0.97.1" surfacée par h-cond).

## [2026-09-15] Passe Opus focus-render RENDUE → ratifiable-avec-amendements
- Fichier: scratchpad/opus-review-focus-render.md. Aucun [FACT] pris en défaut.
- D1 nuance (B pré-empte O-K2/wp6 = focus canonique sentropic ; frontière composants carte v11 non tranchée ; v4-unique=direction). D2 nuance/conditionnel (interactif sous style-src-attr none = unverified + hors contrôle @xyflow → v1=SVG statique, interactif derrière spike L0). D3 nuance (Angular sous-estimé ; hybride "3+1" = 3 moteurs + Angular SVG ; parité=contenu). D4 solide (owner+date retrait ; licence routeur .tmp = bloquant L0).
- 3 amendements: (1) spike CSP L0 avant interactif, v1=SVG ; (2) D1 "package dédié, dépôt-hôte à confirmer O-K2" + trancher propriété composants carte v11 + non-écrasement DossierDataV1 ; (3) gater diagram.definition par capability marker/v4.1.
- Relayé à h-cond (intègre avant ratif owner). MA LANE: cible section DS static-SVG-first (CSP-safe) + interactif derrière spike ; demandé à h-cond son lean sur la propriété des composants carte v11. HOLD build jusqu'à ratif D1.

## [2026-09-15] Convergence focus-render — propriété composants carte tranchée
- Gate present-decision COMPLET (codex astra + Opus = double-instruction). h-cond intègre les 3 amendements + D3 "3+1" + D4 avant ratif owner.
- PROPRIÉTÉ COMPOSANTS CARTE v11 (lean h-cond, accepté): composant visuel ServiceNode/Subflow (forme/tokens --st-*/handles/thème) = DS (MOI), parité 4-fw ; shape scène {nodes:[{id,data}],edges} + layout routeScene/Dagre = focus-render (moteur). Moteur produit / DS peint. Formalisé en sous-décision D1.
- D1 re-scope: "package dédié, dépôt-hôte à confirmer via O-K2 (h2a vs sentropic)" → surfacé à l'owner comme LA décision D1.
- Spike CSP L0: nécessite observation navigateur (violations style-src-attr none × xyflow) → mon sandbox ne peut pas piloter navigateur. Découpage: MOI prépare fixture DS-side (composant DS min + scène xyflow + HTML CSP stricte hash-only) ; h-cond/Focus/owner exécute l'observation navigateur. Proposé à h-cond.
- Attente: dossier focus-render amendé (h-cond) pour ratif owner. HOLD build section DS jusqu'à ratif D1.
