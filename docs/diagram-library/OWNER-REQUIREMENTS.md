# Diagram library — owner requirement register (single source)

| Field | Value |
| --- | --- |
| Status | Living register. Opened 2026-11-07 by the design-system design agent after owner Decision A = A1. |
| Accountable | Design system (owner Decision A = A1, DLR-004). |
| Scope | Every owner requirement on the diagram library: model, text form, layout, routing, folds, zoom, cards and zones, rendering, editing, exports and their bijections. |
| Seeded from | h2a handoff `VERBATIM-REGISTER.md` (entry request + groups E01–E15) and its `source-excerpts.txt`, cross-checked with the h2a dossier kit (`content.json`, `quote-fidelity.json` = PASS on 58 quotes). |
| Merged from | sentropic `DS-DIAGRAM-MODULES-REQUIREMENTS.md` (frozen #711 values) and its raw feedback file; DS spec `SPEC_EVOL_DS_DIAGRAM_CARDS.md` §2.1 and §17; `scratchpad/diagram-cards/dc1-review-criteria.md`; DS spec `SPEC_EVOL_LOT_BE_BPMN_EDITING.md`; owner Decisions A and B of 2026-11-07 and the owner's Decision C answer (DEC:932); the BE answers of 2026-11-05 and the card-semantics decision of 2026-11-06 as recorded in the DS conductor journal (CHK); the owner answers of 2026-11-07 to open questions Q4–Q7 (AskUserQuestion, recorded in `scratchpad/diag-lib/owner-questions.md`, OQ). |
| Language | Surrounding text in English. Owner words in French, exactly as recorded, typos kept. |

## 0. Owner entry request (verbatim)

> « Est tu capable de faire le rendering mermaid en pixel perfect pour nos diagrammes d archi. Sj kuj ca me va sion as tu bien mis des ia sur le sujet. Je veux que qq1 porte mes ecigengces formulees precedemment la lib de diag mais je sais pas qui porte ca. Donc deja tu presente qui fait quoi avant une decision aussi importamtehi »
> — 07/11/2026, vers 20:15 (BRIEF:4; VR:6)

> « Je veux un decision dossier en bonne et due forme avec des diagrammes »
> — 07/11/2026, vers 20:20 (BRIEF:5; VR:7)

> « Bascule le dossier avec verbatim d entree coté ds stp »
> — 07/11/2026 (VR:8)

## 1. Rules of this register

1. **Verbatim fidelity.** The owner column holds the owner's words exactly as recorded at the earliest raw source, typos, insults and image references included. « […] » is never used to replace them. A label that the compiler of a raw file placed at the very start of a quote (a screenshot tag such as « [naming-104] », or a date such as « (2026-10-21) ») is treated as an index label: the quote starts right after it, and the label is named in the Source column. A tag inside the sentence is kept as it stands.
2. **Raw source wins.** When two sources quote the same words differently, the earliest raw source is used and the difference is listed in §4 (conflicts).
3. **Editor notes stay editor notes.** A sentence written by a journal editor, an agent or a session is never placed in the owner column. Such records appear either in a group's « Editor notes » list or, when the DS already acts on them, as a row whose kind says `relayed decision — editor wording`, with the editor text in its own column.
4. **No invented requirement.** Every row has a source with file and line. Frozen values written by an agent and validated en bloc by the owner (DLR-084) keep the agent wording in the « Recorded value » column, never in the owner column.
5. **Statuses.** `frozen` (decided, not reopened), `implemented in <PR/version>`, `pending (<lot>)`, `superseded by DLR-xxx`. A row in conflict stays `pending` and names its conflict `C-n`.
6. **Append only.** Ids are never reused or renumbered. A changed requirement gets a new row; the old row becomes `superseded by DLR-xxx`.
7. **DS artefacts** are named by package, version and lot: `@sentropic/design-system-svelte` 0.37.0 (`DiagramCard`, `DiagramZone`, `./diagram-render`, `./diagram-icons`, DC-1, PR #250); `@sentropic/diagram-core` 0.1.0; `@sentropic/diagram-canvas` 0.1.0 (private, workspace-only, unpublished: owner 05/11, CHK:303); lots DC-2 (scenes and folds), DC-3 (scene figure, viewer, pixel parity), DC-4 (xyflow nodes, graph embedding), DC-5 (editing) of `SPEC_EVOL_DS_DIAGRAM_CARDS.md`; lot BE of `SPEC_EVOL_LOT_BE_BPMN_EDITING.md`; lots DL-0…DL-7 of the B2 demonstration plan (`scratchpad/diag-lib/b2-demo-plan.md`).

Source keys are resolved in §6. Kinds follow the h2a dossier vocabulary: `citation` (word for word), `extrait` (word-for-word extract), `citation relayée` (word for word, relayed by a session), `citation rapportée` (word for word, reported in a summary).

## 2. Register

### 2.0 Entry request and owner decisions of 2026-11-07

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-001 | « Est tu capable de faire le rendering mermaid en pixel perfect pour nos diagrammes d archi. Sj kuj ca me va sion as tu bien mis des ia sur le sujet. Je veux que qq1 porte mes ecigengces formulees precedemment la lib de diag mais je sais pas qui porte ca. Donc deja tu presente qui fait quoi avant une decision aussi importamtehi » | 07/11 ~20:15 | citation | BRIEF:4; DEC:911; VR:6 | pending (who-does-what answered by DLR-004; the Mermaid question is answered by the B2 demonstration, DLR-006) | B2 plan DL-0…DL-7; DS decision dossier B2 |
| DLR-002 | « Je veux un decision dossier en bonne et due forme avec des diagrammes » | 07/11 ~20:20 | citation | BRIEF:5; DEC:912; VR:7 | implemented in h2a dossier `diag-lib-20261107` r2 | — (h2a artefact); the DS dossier of DLR-006 follows the same rule |
| DLR-003 | « Bascule le dossier avec verbatim d entree coté ds stp » | 07/11 | citation | VR:8; DEC:933 | implemented in `docs/diagram-library/OWNER-REQUIREMENTS.md` (branch `docs/diagram-library-register`, commit pending) | this register |
| DLR-004 | — (option choice; see note) | 07/11 | relayed decision (option label = dossier wording) | KIT:1589 (option text); relay by h-cond in the brief of this register; VR:3; DEC:932 | frozen | this register; `docs/diagram-library/README.md`; switch-over table of `SPEC_EVOL_DS_DIAGRAM_CARDS.md` §14 (h2a kits retired after DC-3) |
| DLR-005 | « Orientation b2 avec demonstration dans un devision dossier coté design system. » | 07/11 | extrait | VR:3 (owner decision B, verbatim); DEC:932 | frozen (conflicts C-3 and C-4 resolved, §4.2) | B2 plan; DL-1 (Mermaid strict + annotations codec, with engram) |
| DLR-006 | « Je veux la demode toutes les bijections de toute facon - bpmn draw.io mermaid etc » | 07/11 | extrait | VR:3; DEC:932 | pending (DL-0…DL-7; demo corpus fixed by DLR-381; archify, TOGAF and UML exchange kept out of B2 by DLR-382) | DS decision dossier B2 (outline in the B2 plan §10) |
| DLR-007 | « Mais toi tu garde la partie skill voir mcp de diagramme (comme sous composant de focus?) etc donc potentiellemt 2 dossiers ? » | 07/11 (journal: 00:05) | citation | DEC:934-935 | frozen (2 dossiers: DS = diagram library, bijective exports and this register; h2a = architecture skill + diagram MCP tools as a Focus sub-component + consumption of the DS library; boundary confirmed by the DS, DEC:935) | this register; `docs/diagram-library/README.md` (ownership); h2a `archi-skill-dossier/DS-BOUNDARY.md` |

Notes.
- DLR-004: the owner chose option A1 of the dossier, labelled « A1 · Le design system répond de toute la bibliothèque et tient le registre unique » (KIT:1589, dossier wording). The journal records « A = A1 » (DEC:932, editor wording). No owner sentence exists for this choice. The English wording of A1 in the README is h-cond's relay, not owner words.
- DLR-005: option B2 of the dossier reads « B2 · Un vrai fichier Mermaid, avec des annotations, devient la source » (KIT:1821). The dossier recommended B1 (KIT:1860). See C-3.
- Decision C (tab « C · Six points d’accord » of the dossier): on Decision C (ratify D1–D6, KIT:1879), the owner answered « Je lis le dossier d abord » on 07/11 23:40 (DEC:932; CHK:384). D1 is replaced by B2. D3 and D6 carry the DS conditions of OWN:43-50 and DSS:64-67. DEC:933 records that the DS must pose Decision C again. The DS posed it as open question Q7; on 2026-11-07 the owner ratified D2–D6 with the DS conditions on D3 and D6 (DLR-383, OQ:114; CHK:406). Q7 is closed.
- DLR-007: the journal dates the entry « 07/11 00:05 », right after its 23:55 entry (DEC:933-934). h-cond answered « oui, 2 dossiers ». The DS confirmed the boundary at 00:10 (DEC:935). DLR-150 (architecture skill) belongs to the h2a dossier under this split.

### 2.1 E01 — Cartes de même taille, 460 × 200

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-010 | « utilise un seule modele de largeur pour les fiches (le moins large petit donc) » | 19/10 | extrait | RAW:88; VR:12 | implemented in 0.37.0 (DC-1, #250) | `DiagramCard` fixed 460 × 200; `diagram-canvas` `FIXED_CARD_WIDTH` (`measure.ts:16`) |
| DLR-011 | « toutes devraient avoir la meme taille en hauteur comme ne largeur » | 20/10 | extrait | RAW:155; VR:13 | implemented in 0.37.0 (DC-1, #250) | `DiagramCard`; `FIXED_CARD_HEIGHT` (`measure.ts:17`) |
| DLR-012 | « pour les 3 px arrondi... il sont strictement invisibles » | 20/10 | extrait | RAW:170; VR:14 | implemented in 0.37.0 (DC-1, #250) | token `--st-component-diagramCard-radius` 0 (CARDS App. A) |
| DLR-013 | « les cases sont censées avoir toutes la meme tailles. » | 05/11 | citation | R6B:16; INV:27428; VR:15 | implemented in 0.37.0 (h2a consumption pending: focus-kit retrofit, DEC:913) | `DiagramCard` / `DiagramZone` folded face |
| DLR-014 | « tu te sens vraiment obliger de customiser le modele de la carte - c'est pas exactement celui que j'ai validé, c'est celui qui a été validé pour le dossier sentropic (diagrame h2a/engram/sentropic/designsystem )? + dossier est ko (boucle infinie d'UI js) » | 05/11 | extrait | R6B:16; INV:26692; VR:16 | implemented in 0.37.0 (tokens only, no host customisation; h2a consumption pending) | `DiagramCard` (CARDS §5.5: a locally redefined `--st-*` token is a defect) |

### 2.2 E02 — Pliage et zones

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-020 | « Avoir des diagrammes gigogne (ouvrables) pour les complexités est aussi une bonne facon. » | 18/10 | extrait | DEC:184; INV:7331; VR:22 | pending (DC-2: scene fold engine; zone shipped in 0.37.0) | `DiagramZone` 0.37.0; `layoutFolded` (private); DC-2 |
| DLR-021 | « c,est globalement tres bien pourrais tu faire une version "depliable" (avec moi de détail, pour masquer / afficher) le contenu de chaque boite qui a des sous-boites ? » | 19/10 | extrait | RAW:44; VR:23 | pending (DC-2) | `DiagramZone` 0.37.0; DC-2 |
| DLR-022 | « a la premiere présentation, laisse tout replié » | 19/10 | extrait | RAW:94; VR:24 | superseded by DLR-380 (C-8 resolved 2026-11-07: all folded at first display by default, with exceptions written in each diagram) | consumer default-fold data (CARDS DC-D12); DC-3 `DiagramSceneFigure` initial state |
| DLR-023 | « quand on est replié on devrait avoir le meme aspect ratio que les cartes a l'intérieur - [img/collapsed-ratio-68.png] la aussi toutes devraient avoir la meme taille (qd repliées) » | 20/10 | extrait | RAW:141; VR:25 | implemented in 0.37.0 (DC-1, #250) | `DiagramZone` collapsed = `DiagramCard` face 460 × 200 |
| DLR-024 | « k pour 711 - donne le retour au design system pour avoir les 2 types de cartes (+ étitables) stp incluant le mécanisme de dépliment interactif » | 21/10 | extrait | RAW:201 (leading label « (2026-10-21) »); VR:26 | pending (cards in 0.37.0; interactive fold in scenes DC-2/DC-3; editing DC-5; quote fidelity C-1) | `DiagramCard`, `DiagramZone`; DC-2, DC-3, DC-5 |
| DLR-025 | « Pour 711 on a fait dans hrpolnav des cartes depliables identiques aux cartes normales mais avec des hack d affichage. Reprend ce deveait etre ca maintenant notre base apres comvergence coté design system » | 22/10 | citation relayée | ORD:2; CARDS:92; VR:27 | implemented in 0.37.0 (collapsed zone = atomic card, CARDS DC-D13; kit deletion at DC-3, CARDS §14) | `DiagramZone`; CARDS §2.1.1, §14 |
| DLR-026 | « pour les cartes du dossier normalement coté design system on a des cartes de la meme dimension mais avec un mode "depliable" vérifie » | 05/11 | citation | R6B:16; INV:26495; VR:28 | implemented in 0.37.0 (DC-1, #250) | `DiagramCard` + `DiagramZone` |
| DLR-027 | « c'est pas censé être ca les putain de cartes dépliables c'est quand y a des sous composant connard, fais en sorte d'enquêter avec le design system qui est censé avoir capitalisé sur hrpn » | 05/11 | citation | R6B:16; INV:27481; VR:29 | implemented in 0.37.0 (a card with no children is never foldable, RET §2) | `DiagramZone` (`toggleLabel` absent = not foldable) |

Editor notes (not owner words).
- 06/11 — « Selon le journal, vous avez décidé qu'une zone repliée est une carte atomique de 460 sur 200. » (DEC:796; INV:28173; VR:32). Implemented by DLR-023/DLR-025.

### 2.3 E03 — Zoom plafonné à la taille des cartes

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-030 | « stp faut pas abuser sur la taille du zoom la faudrait un zoom maxi a 100% pour la taille des cartes ... » | 05/11 | citation rapportée | R5H:3; INV:19200; VR:36 | pending (DC-3; today only in an h2a kit) | `DiagramSceneFigure` viewer (DC-3): zoom cap 100 % = 460 px card |
| DLR-031 | « sans oublier le zoom d'habitude on peut zoomer / dezoomer (avec un zoom max a la taille des cartes deja la merci) » | 07/11 | extrait | COM:26; VR:37 | pending (DC-3) | `DiagramSceneFigure` (DC-3): ± buttons, Ctrl+wheel, pinch, cap 100 % |

### 2.4 E04 — Mise en page : dépliage horizontal, alignement, nos propres algorithmes

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-040 | « il doit y avoir une notion d'alignement et de remplissage » | 16/10 | extrait | EVS:1569; INV:29762; VR:43 | pending (engine hints `stretch` exist in the private engine; public scene in DC-2) | `diagram-canvas` `hints.ts` (`stretch`, `grouping`); DC-2 |
| DLR-041 | « + assure la justification verticale stp ça manque d'harmonie » | 18/10 | extrait | RAW:20; VR:44 | pending (DC-2 acceptance) | DLR-319; DC-2 geometry gate |
| DLR-042 | « 1 + on planifie le recodage de tous les algo d elk » | 18/10 | citation | DEC:182; INV:6668; VR:45 | pending (no DS plan recorded yet) | `diagram-canvas` L8 engine (L-R1…L-R12 on main); plan to be written as a DS spec |
| DLR-043 | « Les algo open licence libre ou algo public mais dans notre js a nous » | 18/10 | extrait | DEC:184; INV:7276; VR:46 | implemented in `@sentropic/diagram-canvas` 0.1.0 (private; zero dependency beyond `diagram-core`, CARDS:196) | `diagram-canvas` |
| DLR-044 | « pardon mais l'orientation verticale dépliée est débile - tous devraient se deplier horizontalement. » | 07/11 | extrait | COM:26; VR:47 | pending (DC-2: expanded-zone children in rows by default) | `layoutMeasured` / `layoutFolded`, `LayoutGroup.direction: "rows"`; DC-2 |

Editor notes (not owner words).
- 17/10 — « Selon le journal, vous avez décidé que le design system recode le moteur de mise en page avec Focus, sans reprise du code d'un kit. La session design system a relayé cette décision. » (DEC:160; INV:5384; VR:50). Consistent with DLR-004.

### 2.5 E05 — Routage des flèches : branchées au centre, sans croisement

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-050 | « c'est très perturbant quand les flèches ne sont pas branchées au centre des diagrammes quand c'est possible … je pense même que ce n'est pas à un skill de faire ça mais à un layout optimizer » | 16/10 | citation | EVS:1569; INV:29695; VR:54 | pending (DC-2 acceptance: centred docking measured on the acceptance scenes) | `diagram-canvas` routing; DC-2 |
| DLR-051 | « demande à diagramme de mutualiser, car ils sont pas si mal que ça à part les flèches mal centrées » | 18/10 | extrait | DEC:190; INV:7839; VR:55 | pending (ownership decided by DLR-004; kit retirement after DC-3) | CARDS §14 switch-over |
| DLR-052 | « stp fais attention a certains fleches encore bien pourries » | 19/10 | extrait | RAW:93; VR:56 | pending (DC-2) | `diagram-canvas` routing; DC-2 |
| DLR-053 | « on a encore bcp de lignes placées en dehors des centres de cellules, c'est weird. un autolayout devrait l'empecher » | 19/10 | citation | RAW:112; VR:57 | pending (DC-2) | `diagram-canvas` routing; DC-2 |

Editor notes (not owner words).
- 05/11 — « Selon la position du design system, rédigée en anglais, vous avez décidé un routage strict par défaut. Une scène peut demander un routage relâché. » (DSS:20; VR:60). The owner answer itself is recorded as DLR-342.

### 2.6 E06 — Texte : jamais d'ellipse, marges soignées

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-060 | « je ne sais pas qui détient ce style. mais il faudrait 1 ou 2px de plus de marge a gauche pour le texte en bas pour que ca paraisse plus pro et aéré » | 19/10 | citation | EVS:2444; INV:39771; VR:64 | superseded by DLR-308 (value settled at + 4 px) | — |
| DLR-061 | « ah oui j'avais demandé de mettre 2px de plus en marge gauche du texte du milieu et en bas. peux tu faire ca. ca veut dire peut être qu'il faut encore en raccourcir. » | 20/10 | extrait | RAW:167; VR:65 | superseded by DLR-308 (value settled at + 4 px) | — |
| DLR-062 | « pourquoi lui le texte va pas a la ligne... stp utilise le meme composant pour tous. » | 21/10 | extrait | RAW:189; VR:66 | implemented in 0.37.0 (DC-1, #250) | one zone header for all zones (DLR-312) |

Editor notes (not owner words).
- 21/10 — « La liste des exigences finales, écrite en anglais par un agent puis validée par vous, interdit toute ellipse. Un texte qui ne tient pas doit donner un diagnostic de dépassement. » (DSR:29; DSR:3; VR:69). The frozen value is DLR-311.

### 2.7 E07 — Sens des cartes : nature en haut, dépôt en pied

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-070 | « pour ceux la : utilise le meme mécanisme : le nom du paquet au dessus en majuscule en gris » | 21/10 | extrait | RAW:183; VR:73 | superseded by DLR-350 for kicker content (kicker typography 22/400/uppercase/grey implemented in @sentropic/design-system-svelte 0.37.0, DC-1, PR #250) | kicker slot of `DiagramCard` / `DiagramZone` (22/400, uppercase, grey) |

Editor notes (not owner words).
- 06/11 — « Selon le journal, vous avez demandé une sémantique standard des cartes d'architecture. Elle doit distinguer une bibliothèque, un moteur d'exécution et un dépôt. » (DEC:800; INV:18712; VR:76).
- 06/11 — « Selon le journal, vous avez répondu oui aux cinq questions présentées par engram sur le sens des cartes. Le haut dit la nature. Le pied dit le dépôt, puis le paquet. La description est écrite dans le dépôt du code, puis validée par engram. » (DEC:836; INV:28768; VR:77). The DS acts on it through DLR-350…DLR-352, DLR-358 and DLR-359.

### 2.8 E08 — Capitaliser au design system, pas dans un kit

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-080 | « Je comprends pas pkoi quand je demande un dossier de decision j ai pas de base la putain de version focus design system avec les diag de notre ecosysteme » | 17/10 | extrait | DEC:158; INV:5216; VR:81 | pending (focus-kit retrofit to 0.37.0, DEC:913; scene figure DC-3) | 0.37.0 `./diagram-render`; DC-3 |
| DLR-081 | « tout ça doit être porté par le module design system + focus / ce ne doit pas être porté par hrpolnav merci » | 19/10 | extrait | EVS:2438; INV:52687; VR:82 | pending (CARDS §14 switch-over after DC-3) | CARDS §14 |
| DLR-082 | « pardon mais pour la taille de police: utilises tu bien le standard design system, sans custo = merci » | 20/10 | citation | RAW:127; VR:83 | implemented in 0.37.0 (DC-1, #250) | typography tokens (CARDS App. A) |
| DLR-083 | « et puis faudrait que tu capitalises les cartes dans le DS, Ja,vais demadné ca un jour ca ne semble jamais s'eê fait » | 20/10 | extrait | RAW:167; VR:84 | implemented in 0.37.0 (DC-1, #250) | `DiagramCard`, `DiagramZone` |
| DLR-084 | « écoute c'est bon pour 711, stp squashe un peu et livre les 2 composants au design system avec tous mes requirements (les finaux) » | 21/10 | citation | RAW:197; DSR:3; VR:85 | implemented in 0.37.0 (DC-1, #250); the requirements it validates are DLR-300…DLR-327 | `DiagramCard`, `DiagramZone` |
| DLR-085 | « les tokens de réflexion ne devraient pas être gâchés à de la mise en forme. focus / design system doivent être des modules automatisés de mise en forme d un fond » | 06/11 | extrait | DEC:832; INV:28660; VR:86 | pending (DC-2/DC-3: layout from the model alone; B2 renderer DL-2) | `layoutMeasured`; DC-3; DL-2 |

Notes.
- DLR-081: the Track item that carries this quote is titled « Commentaires et annotations des dossiers portés par Focus + design system » (EVS:2438). Its first scope is comments and annotations. The handoff files it under E08. Kept here with that caveat.

### 2.9 E09 — Variante à texte centré

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-090 | « blanc sur blanc c pas terrible, et puis la ca mériterait d'être centré quand y a pas bcp de texte. fais un retour aupres du skill stp » | 19/10 | citation | EVS:2439; INV:52756; VR:92 | implemented in 0.37.0 (centring: `align: "center"`; contrast through tokens and tones) | `DiagramCard` / `DiagramZone` `align` prop |
| DLR-091 | « j'ai demandé de centrer le texte pas de justifier les caracteres » | 21/10 | extrait | RAW:195; VR:93 | implemented in 0.37.0 (DC-1, #250) | collapsed-subtitle centring, no justification (DLR-318) |

Editor notes (not owner words).
- 06/11 — « Selon le journal, vous avez demandé de capitaliser au design system la carte de hrpn, repliée ou non. Vous avez aussi demandé une variante à texte centré, de même taille. » (DEC:798; INV:28228; VR:96). Implemented in 0.37.0 (`align`).

### 2.10 E10 — Rendu déterministe : même entrée, même image

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-100 | « à un moment le focus devrait être un renderer qui prend les options et layout tout seul sans te laisser le choix du mauvais goût » | 16/10 | extrait | EVS:1570; INV:41143; VR:100 | pending (DC-3; B2 renderer DL-2) | pure renderers of `./diagram-render`; DC-3 |
| DLR-101 | « pour t'assurer que ce soit un composant réutilisable au pixel, mode xyflow ou la suite » | 21/10 | extrait | RAW:176; VR:101 | pending (pure renderer in 0.37.0; pixel parity DC-3; xyflow node DC-4) | `renderCardSvg` / `renderZoneSvg`; DC-3; DC-4 |
| DLR-102 | « Est tu capable de faire le rendering mermaid en pixel perfect pour nos diagrammes d archi. » | 07/11 | extrait | BRIEF:4; VR:102 | pending (DL-2, DL-7) | B2 plan DL-2 (renderer of the Mermaid-strict text) |

Notes.
- DLR-100: the Track item is about decision-dossier option cards (EVS:1570, title « Renderer de dossier de décision Focus »). The handoff applies it to diagrams. Kept with that caveat.

### 2.11 E11 — Édition en direct

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-110 | « L enjeu n est pas la taille mais la reactivité et l atomicité des editions pour aller rapidement pour les petits et gros dossiers. » | 18/10 | extrait | DEC:184; INV:7387; VR:108 | pending (DC-5) | DC-5 (editing through `diagram-core` commands) |
| DLR-111 | « je veux reprendre asap la feature d'édition - tu pourrais reprendre tip-tap et il faut prévoir un retour ver l'IA (prévoir dans le yaml/json de retour un retour d'édition en diff par paragraphe). demande cette conception a qui de droit (je ne sais plus entre h2a/focus, design-system ...) » | 18/10 | extrait | EVS:2034; INV:47238; VR:109 | pending (rich text RT-1 shipped in `@sentropic/design-system-rich-text` 0.1.0; diagram editing DC-5) | RT-1; DC-5 |
| DLR-112 | « les deux modules : carte de wrapping et carte atomique doivent devenir des modules design system incuables dans les graphiques et doivent devenir éditables a la tiptap » | 21/10 | extrait | RAW:186; VR:110 | pending (DC-4, DC-5; quote fidelity C-1) | DC-4 (graph embedding); DC-5 (editing) |
| DLR-113 | « j'ai mis a comme commentaire ca devrait se fixer instantanément en cible dans l'outil de commentaire claude comme celui de notre natif artefact. demande a la chaine h2a-focus de porter cette responsabilité pour le future merci » | 07/11 | citation | COM:50; VR:111 | pending (owner-assigned to the h2a-focus chain; DS consulted for deterministic re-render) | deterministic renderers (DLR-100); DC-5 |

### 2.12 E12 — Texte committable et bijectif

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-120 | « meme les diagrammes doivent etre des elements structurés formels parsables par le module diagramme pour affichage » | 06/09 | extrait | EVS:1684; INV:34001; VR:117 | pending (model in `@sentropic/diagram-core` 0.1.0; Focus still shows diagrams as fenced text) | `diagram-core` `SemanticDocument`; DL-1 codec; DC-3 |
| DLR-121 | « le graph d'archi devrait être un standard commitable (a la mermaid) il faudrait un format de sérialisation ergonomique et totalement bijectif stp (mermaid avec annotation ou autre propriétaire / compatible) » | 07/11 | extrait | TRK:2533; VR:118 | pending (form chosen by DLR-005; codec DL-1 with engram; Decision C D2–D6 ratified by DLR-383) | DL-1 (engram codec, DS conformance fixtures) |
| DLR-122 | « je ne sais plsu qui fait ca, mais il faut la version committable. » | 07/11 | extrait | TRK:2533; VR:119 | pending (owner of the text decided by DLR-004: engram; Decision C D2, engram owns the codec, ratified by DLR-383) | DL-1 |

### 2.13 E13 — Exports bijectifs

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-130 | « il doit supporter les format archifiy, plantuml, mermaid, archimate, togaf, et aussi les export drawio, » | 18/09 | extrait | EVS:1722; INV:38395; VR:125 | pending (PlantUML, Mermaid, ArchiMate and draw.io in DL-3…DL-6; archify and TOGAF deferred out of B2 by DLR-382, no lot yet) | DL-3…DL-6 |
| DLR-131 | « ou doit pouvoir faire les exports bpmn, uml, plantuml, mermaid, drawio et jaque fois en mode bijectif » | 07/11 | extrait | TRK:2533; VR:126 | pending (DL-3…DL-6; UML exchange (XMI) deferred out of B2 by DLR-382, no lot yet) | DL-3…DL-6 |
| DLR-132 | « Le drawio.png pourrait être une optim tant que la bijectivité 100% est démontrée pour chacun des format (BPMN, archimate, notre diagramme principal repliable etc) » | 07/11 | extrait | TRK:2533; VR:127 | pending (DL-4, DL-7) | DL-4 (`.drawio.png` with embedded payload) |

### 2.14 E14 — La vue globale d'abord

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-140 | « Je voudrais mettre un diagramme au cœur d'un contrat long terme d'unification de la gouvernance h2a engram sentropic et design system » | 18/10 | extrait | DEC:186; INV:7502; VR:133 | implemented in sentropic PR #711 (merge `4138a0ec`, frozen central scene) | central scene = fifth DS acceptance scene (CARDS App. C) |
| DLR-141 | « mais en priorité une vue globale (comme fait dans hrpn, ou icond, ou sentropic pour la vue multi systemes). » | 07/11 | extrait | TRK:2533; VR:134 | pending (modelled global view, study lot L1, sentropic) | DC-3 figure; DL-7 demo uses a global view |

### 2.15 E15 — Jusqu'aux actifs vivants de dev, préprod et prod

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-150 | « je veux vraiment avoir un skill d'architecture qui prépare les graph des composants, jusqu'au assets live de dev/preprod/prod. il faudrait modéliser ca via engram, avec les contraintes de rendering design system » | 07/11 | extrait | TRK:2533; VR:140 | pending (skill = h2a dossier, DLR-007; DS supplies rendering constraints) | `diagram-presentation@1` forms; measurement rules |

Notes.
- DLR-150: at the source the sentence continues with « , pour pouvoir maintenir a chaque moment un ou des diagrammes pour le design system. » (TRK:2533).
- DLR-150: under the 2-dossier split of DLR-007, the skill and the diagram MCP tools sit in the h2a dossier. This register keeps the row because the DS supplies the rendering constraints.

### 2.16 Cross-check additions (same primary sources, not in the handoff groups)

| ID | Owner verbatim (FR, as recorded) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-160 | « Il faut pouvoir modéliser aussi les vues processus / archimate le cas échéant, mais en priorité une vue globale » | 07/11 | extrait | TRK:2533 | pending (process views = BPMN family, DL-3; ArchiMate = DL-6) | DL-3; DL-6 |
| DLR-161 | « L'idéal serait de s'inspirer de facon anonymiser (et sans trace dans un commit) des besoins d'un dossier d'archi a la airbus pour pouvoir recenser les vues dont on devrait avoir besoin, afin de s'assurer de pouvoir modéliser toutes les vues. » | 07/11 | extrait | TRK:2533 | pending (owner of the view inventory = h2a skill; DS checks each view maps to existing forms; the B2 demonstration applies the no-trace rule through DLR-381) | `diagram-presentation@1` forms (card / container / legend / legend-key) |
| DLR-162 | « et retire le logo bpmn.io [Image #41] stp » | 24/09 | extrait | EVS:1722 | pending (C-5; Q8 not put to the owner on 2026-11-07, deferred to the start of lot BE as the question dossier recommends, OQ:115) | `<st-bpmn-canvas>` watermark rules W1–W7 (JSON render standard §13.4) |

Notes.
- DLR-160 overlaps DLR-141 on the words « mais en priorité une vue globale ». Both are kept: DLR-160 carries the process and ArchiMate views.
- DLR-161 binds the B2 demonstration: Airbus-derived content must not leave a trace in a DS commit (see the B2 plan, risk R-1). On 2026-11-07 the owner chose the anonymised S2-target plus the #711 central scene as the demo corpus, the mapping table staying outside any repository (DLR-381).

### 2.17 Frozen #711 values (owner-validated en bloc on 21/10 by DLR-084)

The « Recorded value » column is the wording of the requirements file (agent-written, English). The owner column quotes the raw owner words behind the value when they exist.

| ID | Recorded value (DSR wording, not owner words) | Owner verbatim behind it (FR, as recorded) | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- |
| DLR-300 | Pixel-exact; visual parity test against the #711 render | see DLR-101 (« réutilisable au pixel ») | DSR:12 | pending (DC-3 parity harness) | CARDS §10; DC-3 |
| DLR-301 | Usable as an xyflow (Svelte Flow) custom node with handles, and standalone | see DLR-101 (« mode xyflow ou la suite ») | DSR:13 | pending (DC-4) | `./diagram-nodes` (DC-4) |
| DLR-302 | Embeddable in graphs and editable Tiptap-style | see DLR-112 | DSR:14 | pending (DC-4, DC-5) | DC-4; DC-5 |
| DLR-303 | Pivot format: the diagram-core document, the model engram took over; engram provides the profiles; no second model | « idem pour les fleches (doivent être éditables: reracordable: texte editable. le format pivot derriere le module doit être le format de modele de donnée de diagramme basculé engram (si pas déja fait faut demander a design system d'embarquer ca). ceci est pour le futur, tu fais la demande, tu la track, mais ca boque pas notre travail » (21/10) | DSR:15; RAW:187 (leading label « (edges, 2026-10-21) ») | implemented in `@sentropic/diagram-core` 0.1.0 + 0.37.0 (`renderCardSvgFromPresentation`) | `diagram-core`; `diagram-presentation@1` |
| DLR-304 | Fixed size 460 × 200 (ratio 2.30:1); every card the same size; never grows with its text | see DLR-010, DLR-011, DLR-013 | DSR:18 | implemented in 0.37.0 (DC-1, #250) | `DiagramCard` |
| DLR-305 | Square corners, no radius | see DLR-012 | DSR:19 | implemented in 0.37.0 | radius token 0 |
| DLR-306 | Left accent bar and border as in the radar-immobilier ServiceNode reference (`fa8133c2`) | « t'a pas pigé les cartes ce sont celles comme dans le dossier i-cond ou hrpolnav ou les précédents design system : [Image #40] (avec les modifications de 2px demandées et les contrastes de couleurs). » (19/10) | DSR:20; RAW:73 | implemented in 0.37.0 | `DiagramCard` accent and border tokens |
| DLR-307 | Header: icon 70; icon → text gap 6; kicker 22 px / 400 / uppercase / grey secondary token; title 32 px / 700 / line-height 1.3 | see DLR-070 (kicker style) and DLR-314 (icon) | DSR:21-25 | implemented in 0.37.0 | card header tokens |
| DLR-308 | Body 24 px / 400 / 1.3; body left inset = original + 4 px (accent bar → first glyph 14 px) | « marge - ok faut probablement passer a 4 alors. » (20/10) | DSR:26; RAW:170 | implemented in 0.37.0 | `bodyInsetFromBar` 14 px (8 + 2 + 4) |
| DLR-309 | Rule 1 px, border-subtle token, 4 px margins; stays 1 screen px at every zoom, including the overview | « utilise la meme ligne de séparation pour le header quand deplié que le footer des cartes atomiques » (21/10); « y a pas le trait » (20/10) | DSR:27; RAW:183; RAW:155 | implemented in 0.37.0 (non-scaling stroke; zoom witness in DC-3) | rule tokens; DC-3 viewer witness |
| DLR-310 | Footer pinned to the bottom; bottom offset 9.25 px; extra bottom inset rejected | « t'a agumenté la marge basse sans me demandé » (20/10) | DSR:28; RAW:171 (tag « [naming-97] ») | implemented in 0.37.0 | footer pin (CARDS DIF-04) |
| DLR-311 | No ellipsis, ever; wording must fit or an overflow diagnostic is emitted; no clipping (no specific owner words; validated en bloc by DLR-084) | — | DSR:29 | implemented in 0.37.0 (`{ kind: "refused" }`, `card-overflow` / `zone-overflow`) | `renderCardSvg` (`renderCardSvg.ts:196-236`) |
| DLR-312 | One header component for all zones | see DLR-062 | DSR:32 | implemented in 0.37.0 | `DiagramZoneHeader` |
| DLR-313 | Zone typography = card typography for every role; kicker 22/400, not bold | « pourquoi en gras c'est débile ? » (21/10); « pourquoi la taille de police est très légereme supérieure dans les boites d'encapsulation vs les autres » (21/10); « pourquoi la police cartes sont devenues plus grandes que celle des zones ? » (20/10) | DSR:33-36; RAW:188 (tag « [naming-104] »); RAW:190 (tag « [naming-107/108] »); RAW:134 | implemented in 0.37.0 | zone tokens aliased to card tokens |
| DLR-314 | Zone icon 70, the same as the cards | « pourquoi les icone des groupes sont plus petits » (20/10) | DSR:37; RAW:168 (tag « [naming-95] ») | implemented in 0.37.0 | icon box token 70 |
| DLR-315 | Kicker carries the package name (H2A, SENTROPIC, ENGRAM, DESIGN SYSTEM; « SENTROPIC & 3RD PARTIES » / « SENTROPIC & TIERS »); title shown without the package prefix | see DLR-070; « Pour le "titre" tu peux mettre SENTROPIC & 3RD PARTIES  (SENTROPIC & TIERS en francais) ? » (21/10) | DSR:38; RAW:189 | superseded by DLR-350 for kicker content (package moved to footer « repo: X · package » on 06/11; prefix-free title rule retained) | kicker table CARDS §6.3 |
| DLR-316 | Header follows its actual content; title → subtitle gap equals the card's | « pourquoi y a tant d'espace entre Access Surafces et AI providers. y a comme des espaces vides contrairement aux autres cartes » (21/10) | DSR:39; RAW:192 (tag « [naming-109] ») | implemented in 0.37.0 | zone header |
| DLR-317 | Expanded: subtitle wraps under the icon from the left inset; header separated from the body by the card-footer rule | « et le contenu en retour a la ligne sous l'icone » (21/10) | DSR:40; RAW:183 | implemented in 0.37.0 | zone header |
| DLR-318 | Collapsed: subtitle centred horizontally and vertically, 16 px side margins, no justification or stretching | « quand la carte est déployée c'est bien. quand la carte est compactée ca fait bizarre. je propose plutôt que le petit texte en dessous soit justifiée et centré horizontalement et verticalement dans l'espace sous le (icone+titres) » (21/10); « et centré avec un peu de marge du coup (genre au moins 8px marge droite gauche a toi de voir ce qui semble raisonnable je ne sais pas si tu es en px ou en .rem ou etc » (21/10); see DLR-091 | DSR:41; RAW:193 (tag « [naming-112/113] »); RAW:194 (tag « [naming-113 addendum] ») | implemented in 0.37.0 (re-based in the card body area, CARDS §6.2.1) | `collapsedSubtitleMarginInline` 16 px |
| DLR-319 | Zone frames side by side share top and height; card rows and columns aligned with 0 px deviation | see DLR-041 | DSR:42 | pending (DC-2 geometry gate) | `diagram-canvas`; DC-2 |
| DLR-320 | One blue duotone pictogram family on its own subpath; includes `brain` and `robot`; no Lucide outline icon inside cards | « faudrait parmi la meme game d'icone. la cherche dans la gamme des bleu si possible » (20/10); « c'est pas un icone de catalog c'est un icone de storage disque - un icone de cerveau ce serait bien » (21/10); « t'as pas un icone de robot pour ca ? » (21/10) | DSR:45-46; RAW:164 (tag « [naming-89] »); RAW:177 (tag « [naming-98] »); RAW:178 (tag « [naming-99] ») | implemented in 0.37.0 | `./diagram-icons` |
| DLR-321 | Edges re-connectable and labels editable inline, as proposals the host applies or refuses, in diagram-core (future, non-blocking) | see DLR-303 (RAW:187) | DSR:49 | pending (Track `01M5F3XSAJC2H6S9ZREP7JFFJ6`; out of DC scope, CARDS §13) | `diagram-core` commands (future lot) |
| DLR-322 | No continuous work at idle; worst interaction under 1.8 s; timeouts never raised | « doit y avoir un bug dans 711 ca me sature mon navigateur a chaque fois » (21/10) | DSR:52-53; DSR:65; RAW:191 (tag « [perf] ») | pending (DC-2/DC-3 witnesses: 600 interactions, 240 stress toggles) | CARDS App. A budgets |
| DLR-323 | Expanded zone spacing: subtitle → rule 4 px; rule → children 16 px; children → bottom 16 px; edges never reserve empty height | « L'espace au dessus du trait de séparation du header est trop grand deja dans [Access surfaces] mais surtout dans agent platform. et dans toutes les cartes, L'espace entre le trait du header et les boites est aussi vraiment trop grand : la marge haut et bas au dessus des boites devrait être plus équilibré meme s'il y a des traits » (21/10) | DSR:56-58; RAW:200 (tag « [naming-121/122] ») | implemented in 0.37.0 (`measure.ts:23-29`) | `RULE_GAP`, `RULE_TO_FIRST_CHILD_GAP`, `LAST_CHILD_TO_BOTTOM_GAP` |
| DLR-324 | Every wrapping card folds in place with a +/− DS Lucide `IconButton`; focus ring on keyboard focus only | « les "+" sont immondes (bcp trop grand, et on a un design system) » (19/10); « et ca c immonde. j'ai deja demandé d'utiliser pour les + et les - les icones u design system et puis stp il faut les placer de facon adaptée dans de diagramme dans l'object xyflow ca n'a ps de bon sens » (20/10) | DSR:62; RAW:50; RAW:133 | implemented in 0.37.0 | `DiagramZone` toggle (`IconButton` sm) |
| DLR-325 | Collapsed, the wrapping card takes 460 × 200 at every nesting level | see DLR-023, DLR-025 | DSR:63 | implemented in 0.37.0 | `DiagramZone` |
| DLR-326 | Fold reflows without collision and edges re-route; « Expand all / Collapse all »; per-zone chips above the canvas | « les +/- sont un peu bogué fonctionnent pas tjs » (19/10); see DLR-024 | DSR:64; RAW:89 | pending (DC-2, DC-3) | `DiagramZoneFoldBar`; `DiagramSceneFigure` |
| DLR-327 | (not in the frozen file) a single DS render, bilingual | « une seule version design system sera suffisant, et par contre il la faut bilngue » (19/10) | RAW:91 | pending (DC-3 FR/EN corpus) | CARDS §10 FR/EN corpus |

### 2.18 Owner answers recorded in the DS spec (2026-11-05)

| ID | Recorded answer (spec and journal form, not a re-read owner message) | Option text (DS spec wording, not owner words) | Date | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-340 | Q1 A | Zone kickers stay non-editable (package identity); card kickers, titles, bodies, footers and zone titles/subtitles/footers edit | 05/11 | CARDS:952; CARDS:958; CHK:314 | frozen (applies at DC-5; zone kicker remains non-editable as profile-supplied element kind per DLR-350) | DC-5 |
| DLR-341 | Q2 A | The legend renders with the zone mechanisms alone (`legend` / `legend-key` forms, `LEGEND_KEY_HEIGHT` 64); no DS key-row component for now | 05/11 | CARDS:952; CARDS:958; CHK:314 | frozen | DC-2, DC-3 |
| DLR-342 | Q3 A | Engine default stays `strict`; each scene's host declares `relaxed` as data and owns its count threshold | 05/11 | CARDS:952; CARDS:958; CHK:314 | frozen (`routingRelaxation` still to implement in DC-2) | `diagram-canvas` `routingRelaxation` (DC-2) |

Note. The spec records the answers in the form « Q1 A ». The DS conductor journal records them as « Owner: DC Q1 A (kicker zone non éditable), Q2 A (légende = zone seule), Q3 A (routage strict par défaut) » (CHK:314). Both are editor records. The exact owner message was not re-read for this register, so no owner verbatim is claimed for these rows.

### 2.19 Card-semantics decisions of 2026-11-06 (relayed; no owner verbatim)

| ID | Kind | Recorded text (editor wording, not owner words) | Date | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- |
| DLR-350 | relayed decision — editor wording | « Q1+Q3 oui (haut = nature, pied = repo puis paquet) » (DEC:836); DS journal: « kicker=nature, footer « repo: X · package », zone=entité conteneur, proposé=tirets » (CHK:326) | 06/11 | DEC:836; CHK:326; DC1:6; RET:18-26; INV:28768 | frozen (neutral slots implemented in @sentropic/design-system-svelte 0.37.0, DC-1, PR #250; engram archi@1 / archi-cards@1 projection pending) | neutral slots of 0.37.0 |
| DLR-351 | relayed decision — editor wording | « Q4 oui (teinte = légende, proposé = tirets) » ; DC-1 criterion 5: « Proposed » state always drawn dashed, neutral prop independent of tint | 06/11 | DEC:836; DC1:10 | implemented in 0.37.0 (`proposed?` prop; tint host-supplied) | `DiagramCard` / `DiagramZone` `proposed` |
| DLR-352 | relayed decision — editor wording | « Q5 oui (archi écrite dans le repo du code, ingérée et validée par engram, Focus rend seulement) » | 06/11 | DEC:836 | frozen | renderers never write faces (RET §2: slots are neutral) |
| DLR-353 | relayed decision — editor wording | DC-1 criterion 1: neutral slot API only; no hard-coded text in any slot; the host / engram vocabulary fills them | 06/11 | DC1:6 | implemented in 0.37.0 (DC-1, #250) | `DiagramCardProps`, `DiagramZoneProps` |
| DLR-354 | relayed decision — editor wording | DC-1 criterion 2 (Astra J4): every rendered line measured, a single long word included; wrap by the DS rule or refuse; long-word test required | 06/11 | DC1:7 | implemented in 0.37.0 | `cardLineMeasurer`; refusal result |
| DLR-355 | relayed decision — editor wording | DC-1 criterion 3: kicker uppercase + 0.04 em; 66 px reserved for the + button; folded title width 290; overflow = refusal | 06/11 | DC1:8 | implemented in 0.37.0 (`TOGGLE_ALLOCATION` 66, `measure.ts:34`; doc conflict C-7, resolved) | `measure.ts`; `CARD_GEOMETRY` |
| DLR-356 | relayed decision — editor wording | DC-1 criterion 4: a folded zone shows the same face as expanded (same kicker/title/footer); folding never changes the footer | 06/11 | DC1:9 | implemented in 0.37.0 | `DiagramZone` |
| DLR-357 | relayed decision — editor wording | Follow-up: 5 kind icons requested by engram for the `diagram-icons` family | 06/11 | DC1:11 | pending (no lot yet) | `./diagram-icons` |
| DLR-358 | relayed decision — editor wording | « Q2 oui (Track système distinct, zone « h2a ») » | 06/11 | DEC:836; JNT:28 | frozen (content rule of the engram `archi@1` descriptions; no DS change) | — (consumer data in the neutral slots of 0.37.0) |
| DLR-359 | relayed decision — editor wording | « zone=entité conteneur » (CHK:326); joint proposal: « Une zone est une entité conteneur (système, repo, paquet, hôte) » (JNT:9) | 06/11 | CHK:326; JNT:9; JNT:22; RET:18-26 | implemented in 0.37.0 (`DiagramZone` = container entity; a card with no children is never foldable, RET:25) | `DiagramZone`; `diagram-presentation@1` forms (`card` / `container`) |

### 2.20 BPMN editing (lot BE) — owner rules of 2026-11-05

| ID | Owner verbatim (FR, as recorded) | Recorded answer (editor wording, not owner words) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DLR-370 | « la page ne sauvegarde pas un xml normalement, elle renvoie un bpmn au format bpmn moddle (ou mieux engram ayant repris le modèle bpmn-moddle) » | Answer of 05/11 to Q-BE-R2, DS journal: « ATTENDRE DiagramState (pas F1 seul) » (CHK:300). The owner did not accept F1 alone as BE output. | 05/11 | citation | BE:20; BE:22; CHK:300 | pending (owner 05/11 chose to wait for `DiagramState`, not F1 alone, CHK:300, recorded as D12-R in BE revision 2, BE:329; BE blocked on the @sentropic/diagram-bpmn-moddle bijection + gate G3 and on bpmn-canvas 0.4.1 `getDocument()`, CHK:303) | `<st-bpmn-canvas>` Elements 0.3.0 (lot BE) |
| DLR-371 | « le bpmn canevas permet des exports au bpmn xml ou draw io ou sparks ce doit être des options activables ou non du bpmn canvas » | — | 05/11 | citation | BE:68 | pending (BE-2b, decision D11; the all-off default, first conductor decision CD-BE-6, is an owner answer of 05/11 in BE revision 2, BE:68, BE:70, BE:573) | `exportFile(format)`; `hostConfig.bpmn.exports` |
| DLR-372 | — | Owner answer « ACCEPTED » (spec wording) to Q-BE-1: default stays read-only, editing enabled by the host. DS journal: « Q1 lecture seule par défaut OK » (CHK:294). | 05/11 | owner answer — editor wording | BE:58; CHK:294 | frozen (today the wrapper is read-only only) | `hostConfig.bpmn.readOnly` + `readOnly` property (D8) |
| DLR-373 | — | Owner answer to Q-BE-4 (spec wording): Elements 0.2.0 published as prepared, BE ships as Elements 0.3.0 | 05/11 | owner answer — editor wording | BE:61 | frozen | Elements release train (BE §7) |
| DLR-374 | — | Owner 05/11, DS journal: « ATTENDRE moteur bpmn-canvas 0.4.0 (livraison unique) ET ATTENDRE DiagramState (pas F1 seul) » (Q-BE-R1 and Q-BE-R2, CHK:300), then « bpmn-canvas 0.4.0 telle quelle + getDocument en 0.4.1 » (CHK:303) | 05/11 | owner answer — editor wording (journal) | CHK:300, 303; DSS:39; BE:65-67; BE:570-572 | frozen (waiting on bpmn-canvas 0.4.1 + gate G3) | TD-BE-1, TD-BE-2 (re-targeted to 0.4.1 in BE revision 2, BE:139); TD-BE-3, TD-BE-4 (bijection, gate G3 and Engram receipt, BE:22) |

Note. BE spec revision 1 listed Q-BE-R1 and Q-BE-R2 as open (BE §11) and asked for `getDocument()` in 0.4.0. The two journal entries of 05/11 postdated it and governed (C-6, resolved). A later journal entry relays, through the bpmn-canvas conductor, an owner confirmation of 07/11: « 0.4.0 gelée, getDocument en 0.4.1, BE épingle 0.4.1 » (CHK:388, editor wording). The BE spec has since been edited in place to revision 2 (2026-11-07; CHK:398-400), which records these 05/11 and 07/11 decisions: §1.4 (BE:65-68), §3.2 (BE:130-140: `getDocument(descriptors?)` in 0.4.1, exact pin 0.4.1), §5.5 D12-R (BE:329: `DiagramState` is the host contract, F1 stays internal) and §11 « Questions tranchées » (BE:564-575: no owner question open for lot BE). Spec and journal now agree. The BE line citations of this section point to revision 2.

### 2.21 Owner answers of 2026-11-07 to open questions Q4–Q7

The owner answered through AskUserQuestion in the design-system session. Each label below is the option label the owner selected, quoted as recorded (OQ:111-114). The labels were written in the question by the design-system session, not typed by the owner (same treatment as the option choice of DLR-004); the option text in the next column is the question-dossier wording (owner-questions.md), not owner words.

| ID | Owner verbatim (selected option label, as recorded) | Option chosen (question-dossier wording, not owner words) | Date | Kind | Source | Status | DS artefact |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DLR-380 | « Replié + exceptions (Recommandé) » | Q4 → B: « Tout replié par défaut, avec des exceptions écrites dans chaque schéma. » (OQ:23) | 2026-11-07 | option choice (label written in the question, selected by the owner) | AskUserQuestion, design-system session, 2026-11-07 (scratchpad/diag-lib/owner-questions.md); OQ:111; CHK:406 | frozen (supersedes DLR-022; C-8 resolved) | DC-3 `DiagramSceneFigure` viewer: default fold rule = all folded at first display, with per-diagram exceptions written in the diagram (consumer default-fold data, CARDS DC-D12) |
| DLR-381 | « S2-target anonymisé + 711 (Recommandé) » | Q5 → A: « Version anonymisée de S2-target, plus la scène centrale de « 711 ». » (OQ:41); recommendation: « La table de correspondance reste hors de tout dépôt. » (OQ:49) | 2026-11-07 | option choice (label written in the question, selected by the owner) | AskUserQuestion, design-system session, 2026-11-07 (scratchpad/diag-lib/owner-questions.md); OQ:112; CHK:406 | frozen | B2 demo corpus: anonymised S2-target (`S2-target-anon`, generator in DL-0) plus the #711 central scene (DLR-140); mapping table kept outside any repository (B2 plan DL-0, risk R-1) |
| DLR-382 | « Plus tard (Recommandé) » | Q6 → A: « Les laisser hors de cette démonstration, et les noter pour plus tard. » (OQ:60) | 2026-11-07 | option choice (label written in the question, selected by the owner) | AskUserQuestion, design-system session, 2026-11-07 (scratchpad/diag-lib/owner-questions.md); OQ:113; CHK:406 | frozen | archify, TOGAF and UML exchange (XMI) deferred out of B2 and noted for later (DLR-130, DLR-131); B2 keeps DL-0…DL-7 |
| DLR-383 | « Ratifier D2–D6 + conditions (Recommandé) » | Q7 → A: « Ratifier D2 à D6 avec les conditions du design system. » (OQ:81) | 2026-11-07 | option choice (label written in the question, selected by the owner) | AskUserQuestion, design-system session, 2026-11-07 (scratchpad/diag-lib/owner-questions.md); OQ:114; CHK:406 | frozen | Decision C (KIT:1879) D2–D6 ratified with the DS conditions: D3, every export byte-identical at a pinned version (DSS:64 (a), OQ:78); D6, no new card shape without a separate decision (DSS:67, OQ:79). D1 stays replaced by B2 (DLR-005). B2 plan P-1, P-3, P-8; DL-1…DL-6 |

Notes.
- Q8 (bpmn.io logo, DLR-162, C-5) was not put to the owner on 2026-11-07. It is deferred to the start of the BPMN editing lot (lot BE), as the question dossier recommends (option B, OQ:104-108; OQ:115). Until then the logo exclusion zone stays as it is (BE §5.4, W7).
- DLR-383: the DS conditions are those of DSS:64-67 and OWN:43-50; the D3 condition also names both BPMN owners, payload-based bijectivity for Mermaid and PlantUML, and new DS work after DC-2/DC-3 and AS-0/AS-1 (DSS:64 (b)–(d)).

## 3. Status summary

| Status | Rows |
| --- | ---: |
| implemented (in a named PR or version) | 44 |
| frozen (decided, not yet or not applicable to build) | 16 |
| pending (including rows in conflict) | 47 |
| superseded | 5 |
| **Total** | **112** |

## 4. Conflicts between sources

Open questions are numbered as in the B2 plan §11 and in `scratchpad/diag-lib/owner-questions.md` (main checkout). Q1, Q2 and Q3 are closed; Q4–Q7 were answered by the owner on 2026-11-07 and are closed (§2.21); Q8 is deferred to the start of lot BE.

### 4.1 Open

| ID | Rows | What conflicts | Sources | Handling |
| --- | --- | --- | --- | --- |
| C-5 | DLR-162 | The owner asked to remove the bpmn.io logo (24/09). The JSON render standard keeps a bpmn.io logo exclusion zone (W7). The Camunda licence decision H-2 is the owner's and is confidential. | EVS:1722 vs BE §5.4 (W7) | Pending the owner's licence decision (open question Q8). Q8 was not put to the owner on 2026-11-07; it is deferred to the start of lot BE (OQ:115). The exclusion zone stays as it is until then. Not reopened by the DS. |

### 4.2 Resolved

| ID | Rows | What conflicted | Deciding source | Resolution and follow-up |
| --- | --- | --- | --- | --- |
| C-1 | DLR-014, DLR-023, DLR-024, DLR-027, DLR-041, DLR-112 | Quote fidelity. The DS requirements file and the cards spec quote corrected words: « (+ éditables) … dépliement interactif » for raw « (+ étitables) … dépliment interactif », and « incubables » for raw « incuables ». The DS quote of RAW:201 also drops its opening « k pour 711 - ». The h2a journal keeps a typo-corrected copy of the entry request (DEC:911). The h2a handoff register drops « + dossier est ko (boucle infinie d'UI js) » (VR:16), replaces « [img/collapsed-ratio-68.png] » and « connard » by « […] » (VR:25, VR:29), drops « k pour 711 - » (VR:26) and drops the leading « + » (VR:44). | Rule 2 (earliest raw source): RAW:20, RAW:141, RAW:186, RAW:201; R6B:16 (INV:26692, INV:27481); BRIEF:4 | This register quotes the raw words. Follow-up: correct DSR:14, DSR:61, CARDS:60 and CARDS:76 at the next spec revision; report the VR differences to h-cond. |
| C-2 | DLR-070, DLR-315, DLR-340, DLR-350 | Kicker content. The frozen file (21/10) and the cards spec §6.3 put the package name in the zone kicker; §17 Q1 A (05/11) keeps zone kickers non-editable as « package identity ». The 06/11 decision (relayed) puts the **nature** in the top line and the **repo then package** in the footer; the retrofit spec says « kicker = element kind · form, footer « repo: R · P » ». | DEC:836; CHK:326; JNT:27 (§1 Q1+Q3) | Resolved: the 06/11 owner decision (DEC:836; CHECKPOINT-design-system.md:326; PROPOSAL-joint.fr.md §1 Q1+Q3) supersedes the 21/10 package-in-kicker rule (DLR-070, DLR-315). Neutral slots in 0.37.0 already support it; update SPEC_EVOL_DS_DIAGRAM_CARDS.md §6.3 and §17 Q1 wording at next spec revision. Open question Q3 is closed. |
| C-3 | DLR-005, DLR-121, DLR-383 | Committed text form. The owner chose B2 (strict Mermaid + annotations as the committed source). The dossier recommended B1 (`.archi` text); the study's D1 (T2 `.archi` as the only committed source) was « agreed by engram and DS, owner to confirm »; the exports study says « Mermaid itself is never parsed for semantics ». | Owner Decision B = B2 (VR:3; DEC:932) | B2 governs. D1's form is replaced; engram gates (i)–(iii) must be restated for Mermaid + annotations (co-planning point P-1 of the B2 plan). D2 (engram owns the codec) is consistent with A1. On Decision C (ratify D1–D6, KIT:1879), the owner answered « Je lis le dossier d abord » on 07/11 23:40 (DEC:932; CHECKPOINT-design-system.md:384): D1 is replaced by B2, and D2–D6 remained pending owner reading (open question Q7). On 2026-11-07 the owner ratified D2–D6 with the DS conditions on D3 (byte-identical export at a pinned version) and D6 (no new card shape without a separate decision) (DLR-383; OQ:114; CHK:406). Q7 is closed. |
| C-4 | DLR-006, DLR-130…132 | Priority of the export work. The journal records « Priorité des exports DS : sans préférence » (07/11 20:15, editor wording), which places new encoders after DC-2/DC-3 and AS-0/AS-1. Decision B asks for the demonstration of every bijection « de toute facon ». | DEC:911 (« sans préférence »); DSS:64 (DS default order); DEC:932 (Decision B) | The owner answered the priority question with « sans préférence », so the DS default order holds: the new encoders and the demonstration come after DC-2/DC-3 and AS-0/AS-1. Decision B makes the demonstration certain, not earlier. DL-2 needs DC-2 in any case. Open question Q1 is closed. |
| C-6 | DLR-370, DLR-374 | Engine version for `getDocument()` and BE output format. | CHK:300; CHK:303 | SPEC_EVOL_LOT_BE_BPMN_EDITING.md rev 1 (§3.2, §5.5 D12, §11 Q-BE-R1/Q-BE-R2) was written before the two 05/11 owner decisions in CHECKPOINT-design-system.md:300,303 (« ATTENDRE moteur bpmn-canvas 0.4.0 (livraison unique) ET ATTENDRE DiagramState (pas F1 seul) », then « bpmn-canvas 0.4.0 telle quelle + getDocument en 0.4.1 »). The 05/11 owner decisions govern. Done in the spec: SPEC_EVOL_LOT_BE_BPMN_EDITING.md was edited in place to revision 2 (2026-11-07; CHK:398-400), aligned with CHK:300, 303 and 388: §1.4 (BE:65-68), §3.2 (BE:130-140), §5.5 D12-R (BE:329), §11 « Questions tranchées » (BE:564-575). Revision 2 stays untracked until BE-0 records it (BE:3, BE:552). |
| C-7 | DLR-355 | `TOGGLE_ALLOCATION`. Cards spec §2.4 states 32; the code (`measure.ts:34`) and the DC-1 criterion state 66. | `measure.ts:34`; DC1:8 | Code and criterion agree on 66. Follow-up: documentation fix of CARDS:196 only. |
| C-8 | DLR-022, DLR-380 | Default folds. The owner asked « a la premiere présentation, laisse tout replié » (19/10, on #711). The hrpn default-fold rule folds the delivery path and keeps the runtime path and the legend expanded. The DS shipped no fold list (DC-D12). | RAW:94 vs CARDS:176 (hrpn `defaults.js`); owner answer to Q4, « Replié + exceptions (Recommandé) » (OQ:111; CHK:406) | Resolved 2026-11-07: all folded at first display is the library default, with exceptions written in each diagram (DLR-380, which supersedes DLR-022). Follow-up: the DC-3 viewer applies the rule; each exception is declared in the diagram's data. Open question Q4 is closed. |

Closed open question Q2 (committed text of process diagrams): the owner's architecture request names « le graph d'archi » as the Mermaid-like committed text (TRK:2533, DLR-121), and his BPMN rule names the bpmn-moddle model, or the engram model built on it, as the BPMN format (BE:20, DLR-370). Process diagrams therefore stay in the BPMN model; no Mermaid text is planned for them.

## 5. Candidates found during the cross-check, not registered

These owner words exist at the source but their binding force on the library is unclear. They are listed so nobody loses them; they become rows only after owner confirmation.

- « [Image #38] par contre dans le style influence les texte sur les fleches sont mieux placés » (19/10, RAW:65) — edge-label placement.
- « [Image #39] dans les couleurs cela est mieux de ce côté (avoir des fonds non blanc pour le fond global our pour les autres aide a la lisibilité » (19/10, RAW:68) — later followed by « une seule version design system sera suffisant » (RAW:91).
- « [Image #30] stp tu peux ranger ces annotation de fleche a un autre endroit en termes de layout [Image #31] la fleche est particulierement mal placée et peu lisible » (19/10, RAW:43).
- « J'aimerais qu'il y a aussi l'intégration des skills de diagramme plus basiques a la archifify ou a la bpmn (lib bpmn-canvas qu'on est en train d'intégrer) et j'aimerais que le bon choix soit fait sur le type de diagramme (simple a la archifify quand pas trop de cellules) » (03/10, EVS:1722; truncated at the source).

## 6. Source keys

| Key | File |
| --- | --- |
| VR | [`VERBATIM-REGISTER.md`](file:///home/antoinefa/src/h2a/tmp/h-cond/diag-lib-dossier/handoff-ds/VERBATIM-REGISTER.md) (handoff h2a → DS, 2026-11-07) |
| SX | [`source-excerpts.txt`](file:///home/antoinefa/src/h2a/tmp/h-cond/diag-lib-dossier/handoff-ds/source-excerpts.txt) (excerpts with file sha256) |
| KIT | [`content.json`](file:///home/antoinefa/src/h2a/tmp/h-cond/diag-lib-dossier/kit/src/content.json) (h2a dossier `diag-lib-20261107` r2) |
| BRIEF | `/home/antoinefa/src/h2a/tmp/h-cond/brief-diag-lib-dossier.txt` (lines 3-5, via SX) |
| DEC | `/home/antoinefa/src/h2a/tmp/h-cond/DECISIONS-owner.md` (via SX; lines 836 and 911-935 also read directly) |
| EVS | `/home/antoinefa/src/h2a/tmp/h-cond/skills-dossier/evidence-r7/corpus/events.jsonl` (via SX) |
| INV | `/home/antoinefa/src/h2a/tmp/h-cond/skills-dossier/remarks-inventory.json` (via SX) |
| TRK | `/home/antoinefa/src/h2a/.track/events.jsonl` line 2533 (via SX) |
| R6B | `/home/antoinefa/src/h2a/tmp/h-cond/memory-dossier/kit/dossier-r6b.json` (via SX) |
| R5H | `/home/antoinefa/src/h2a/tmp/h-cond/memory-dossier-r5h-last.md` (via SX) |
| COM | `/home/antoinefa/src/h2a/tmp/h-cond/memory-dossier/owner-r8/comments-2026-11-07.md` (via SX) |
| OWN, EXP, SER, DSS | `/home/antoinefa/src/h2a/tmp/h-cond/archi-skill/` `OWNERSHIP.md`, `EXPORTS.md`, `SERIALIZATION.md`, `DS-STANCE.md` (via SX) |
| RET | `/home/antoinefa/src/h2a/tmp/h-cond/focus-retrofit/DS-RETROFIT-SPEC.md` (via SX) |
| JNT | `/home/antoinefa/src/h2a/tmp/h-cond/archi-card-semantics/PROPOSAL-joint.fr.md` (joint card-semantics proposal r2, decided 06/11) |
| CHK | `/home/antoinefa/src/sent-tech-design-system/scratchpad/CHECKPOINT-design-system.md` (DS conductor journal, main checkout; editor wording) |
| ORD | `/home/antoinefa/src/sentropic/.tmp/governance-unification/OWNER-ORDER-711-hrpolnav-base.md` |
| DSR | [`DS-DIAGRAM-MODULES-REQUIREMENTS.md`](file:///home/antoinefa/src/sentropic/.tmp/governance-unification/DS-DIAGRAM-MODULES-REQUIREMENTS.md) (sha256 `c65f5f3a…`) |
| RAW | [`OWNER-FEEDBACK-RAW.md`](file:///home/antoinefa/src/sentropic/.tmp/governance-unification/owner-feedback-diagram/OWNER-FEEDBACK-RAW.md) |
| CARDS | [`spec/SPEC_EVOL_DS_DIAGRAM_CARDS.md`](../../spec/SPEC_EVOL_DS_DIAGRAM_CARDS.md) (r3, 2026-11-05) |
| DC1 | `/home/antoinefa/src/sent-tech-design-system/scratchpad/diagram-cards/dc1-review-criteria.md` |
| BE | `/home/antoinefa/src/sent-tech-design-system/spec/SPEC_EVOL_LOT_BE_BPMN_EDITING.md` (revision 2, 2026-11-07, edited in place over revision 1; untracked in the main checkout until BE-0 records it; line numbers cited from revision 2) |
| OQ | `/home/antoinefa/src/sent-tech-design-system/scratchpad/diag-lib/owner-questions.md` (main checkout; questions Q4–Q8 in French, owner answers of 2026-11-07 at lines 110-115) |
| `measure.ts`, `hints.ts`, `renderCardSvg.ts` | `packages/diagram-canvas/src/layout/measure.ts`, `packages/diagram-canvas/src/layout/hints.ts`, `packages/components-svelte/src/lib/diagram-render/renderCardSvg.ts` |

## 7. Change log

| Date | Change |
| --- | --- |
| 2026-11-07 | Register opened: 105 rows (52 handoff quotes in E01–E15, 6 entry/decision rows, 3 cross-check additions, 28 frozen #711 values, 3 spec owner answers, 8 relayed card-semantics decisions, 5 BE rules); 8 conflicts recorded. |
| 2026-11-07 | Argon review applied: 108 rows (DLR-007 two dossiers; DLR-358, DLR-359 card semantics). Raw words restored in DLR-014, DLR-023, DLR-024, DLR-027, DLR-041. Leading screenshot and date labels moved from the owner column to Source in §2.17. §2.18 and §2.20 separate recorded answers from owner words. BE answers of 05/11 recorded (DLR-370, DLR-374). C-2 settled (DLR-070, DLR-315 superseded). Conflicts split into open (C-5, C-8) and resolved (C-1, C-2, C-3, C-4, C-6, C-7). |
| 2026-11-07 | Argon review, resume pass: README cross-references DLR-007 (two dossiers); §2.20 note cites CHK:388. Not applied, source checked: the RAW:189 « marges hautes » quote for DLR-318 (absent from RAW), the 20/10 re-dating of §2.17 (RAW headings RAW:173 and RAW:185 date those quotes 21/10), the « 05–06/11 » dates (rows already match VR and TRK:2533 is 2026-11-07), and the « Et toi » wording of DLR-007 (DEC:934 reads « Mais toi »). DLR-014 keeps the INV:26692 words (trailing « + dossier est ko (boucle infinie d'UI js) » included); the review's replacement text merged it with DLR-013 (INV:27428). |
| 2026-11-07 | Owner answers of 2026-11-07 folded in: 112 rows (44 implemented, 16 frozen, 47 pending, 5 superseded). Added §2.21: DLR-380 (Q4, default fold rule with per-diagram exceptions), DLR-381 (Q5, demo corpus), DLR-382 (Q6, archify, TOGAF and UML exchange deferred out of B2), DLR-383 (Q7, Decision C D2–D6 ratified with DS conditions on D3 and D6). DLR-022 superseded by DLR-380. Statuses updated: DLR-006, DLR-121, DLR-122, DLR-130, DLR-131, DLR-161, DLR-162; §2.0 Decision C note; C-3 (Q7 closed). C-8 resolved; C-5 stays open, Q8 deferred to the start of lot BE. Second Argon review, non-blocking note applied: BE spec revision 2 cross-referenced in the §2.20 note, C-6 and §6 key BE; BE line citations moved to revision 2 (DLR-371 BE:68, DLR-372 BE:58, DLR-373 BE:61; DLR-370 and DLR-374 also cite revision 2). `scratchpad/diag-lib/b2-demo-plan.md:98` (main checkout, outside this worktree) not touched. Source key OQ added. |
