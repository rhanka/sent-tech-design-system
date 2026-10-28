# SPEC EVOL — DS-CANVAS-LIVE-COLLAB: canvas norm in the DS and live collaborative block editing with the AI as co-editor

| Field | Value |
| --- | --- |
| Status | Specification only. No implementation, no package, no test execution is claimed by this document. |
| Date | 2026-10-28 |
| Branch | `spec/canvas-live-collab`, cut from `main` `0d32d10b` |
| Track anchors | B2 `01M5A1Y37BP5VF255984D4N1GZ`; B1 `01M5A1Y31KMPMWJR721CEZSW8B`; JSON-render E (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md`) lots L1/L2/L8; RT-1 `@sentropic/design-system-rich-text` 0.1.0 + `@sentropic/design-system-svelte/rich-text-editor` |
| Lane gate | This lane starts after diagram-core M1-b (owner decision in the DS session, 2026-10-28). Canvas-norm contract lots that are independent of the L2 binding may proceed in parallel with M1-b follow-on once ratified; L2 lots do not start before that gate. |
| Stack rule | Node/TypeScript and native tooling already present only. No Python is used anywhere in the lots this specification defines. No network is used by this study. |

## 0. How to read this specification

### 0.1 Source tags

Every load-bearing choice carries one primary tag. A proposition inside a settled item is tagged separately.

| Tag | Meaning |
| --- | --- |
| `owner-verbatim` | Wording supplied as an owner quotation in the commissioning brief (the seven statements of 2026-10-28 and the 18/10 paragraph-diff request). Nothing beyond its literal content carries this tag. |
| `owner-decision` | A decision rendered from the owner statements or from the DS session lane choice, as instructed for this r1. The settlement is stated as decided; its rationale is given but the question is not reopened. |
| `conductor-decision` | A technical decision taken by the DS conductor for this r1 (Q2, Q4, Q5, Q6, Q7 as listed in §1.2), revisable by the owner. Rendered as a decision with rationale. |
| `measured` | Fact read on disk or through `git show` / `git grep` at the pins named in §2.1. Cited as `repo:path:line` or as a command. |
| `h2a-spec` | Statement taken from the pinned h2a Focus contract at `98060bd0a` or from FE-2 (`spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md`) where that specification is the contract in force. |
| `ds-proposition` | A design choice made by this specification for the design system. It requires DS owner ratification where §9 states so and must never be reported as an owner requirement. |
| `sentropic-input` | Fact taken from a sha256-pinned uncommitted input under `/home/antoinefa/src/sentropic/.tmp/` or from sentropic `origin/main` via git objects. The pin is named wherever the fact is used. |

`SHALL` / `MUST NOT` state the proposed contract. They acquire force only at ratification of the corresponding decision.

### 0.2 Ownership boundary (not negotiable)

| Owner | Owns | Does not own |
| --- | --- | --- |
| Design system (this specification) | The canvas norm as source of truth (§3), the collaborative document model types and editor binding (§4), the AI co-editor port (§5), the DS components that replace the sentropic editable cards (§6), presence/caret rendering, local editor rules. | Transport, persistence, workspace membership, authentication, authorisation, any business API. No WebSocket, no SSE, no `fetch`, no `XMLHttpRequest`, no database, no Track or Focus write enters a DS package. This is the FE-2 boundary (`spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md` §0.2, §5.9) restated for live editing. |
| Sentropic (host) | Artefact hosting and lifecycle (artifacts provider), catalogue projection and MCP exposure, object locks API today, Hocuspocus hosting, persistence of the live document and of the session journal, the AI bridge that translates MCP patch calls into CRDT operations, membership and authorisation. | The canvas norm, the DS component contracts, the editor binding. |
| h2a / `@sentropic/focus` | The return envelope, the editing manifest and paragraph identities, the diff, the reconciler, digests and schemas. | The editor widget, the canvas norm, transport. |

Consequence: no DS package imports `@sentropic/focus`, no DS type names a Focus return field, and the DS computes no per-paragraph `before`/`after` diff. The host adapter alone computes that diff at freeze time (§4.7).

### 0.3 Evidence and verification marks

- DS facts are measured on this worktree at `0d32d10b` unless a `feat/rich-text-core` pin is named. Sentropic facts are read only via `git -C /home/antoinefa/src/sentropic show origin/main:<path>` and `git -C /home/antoinefa/src/sentropic grep … origin/main`. h2a facts follow the B2 pinning (`98060bd0a`).
- The two uncommitted sentropic inputs were hash-verified before use in this session: `sha256sum /home/antoinefa/src/sentropic/.tmp/canvas-norm/REPORT.md` → `53b8928bb7834b1a849e7656b4a11bb69ee2b776394c9995c12e411eb39c6409`, matching the brief; `sha256sum /home/antoinefa/src/sentropic/.tmp/canvas-decision-dossier/dossier-r4b.md` → `b153f3cb60bbfa3b7d6e3b5f40a79dc04f6f5c7a67b5d31e9d28cebd87c6d364`, matching the brief. No mismatch was observed.
- A fact that could not be verified on disk without network is marked `unknown` or `source-gap` inline and collected in §11.
- No file is copied from another repository into the DS. Behavioural reference only, under the licence rule of §8.6.

## 1. Owner settlement

### 1.1 The seven owner statements (verbatim, 2026-10-28)

Relayed by the sentropic conductor and confirmed by the owner directly in the DS session. Source file: `/home/antoinefa/src/sent-tech-design-system/scratchpad/requests/2026-10-28-canvas-live-edit-via-sentropic.md:5-11` and `:18-19`.

1. « On avait dans app aussi le reversement à design system du template canvas en termes d'UI - c'est fait ? » then « Je veux dire la norme canvas ». `owner-verbatim`
2. « Au passage faudrait migrer les composants carte éditable de TipTap à l'édition live design system. » `owner-verbatim`
3. « Canvas devra gérer l'édition multi-utilisateur + IA live. » `owner-verbatim`
4. « Ce devrait même aller un cran plus loin en live à la Google Docs le canvas edit » `owner-verbatim`
5. « Genre IA + collaborateurs éditent le même bloc ensemble » `owner-verbatim`
6. « Ça c'est à faire par design system » `owner-verbatim`
7. « Par contre tu détiens la norme canvas pour l'instant je crois. Elle pourrait basculer côté design system pour être plus directe » (« tu » = the sentropic conductor). `owner-verbatim`

Earlier owner request that this lane also serves (18/10): « je veux reprendre asap la feature d'édition - tu pourrais reprendre tip-tap et il faut prévoir un retour ver l'IA (prévoir dans le yaml/json de retour un retour d'édition en diff par paragraphe) » (`spec/SPEC_STUDY_EDIT_B2_COLLABORATION.md:9`). `owner-verbatim`

Owner lane decision in the DS session (2026-10-28, AskUserQuestion): « Après M1-b (Recommandé) ». The study starts once M1-b is closed; M1-c..M1-e follow one heavy run at a time (`/home/antoinefa/src/sent-tech-design-system/scratchpad/requests/2026-10-28-canvas-live-edit-via-sentropic.md:23-25`). `owner-decision`

### 1.2 What the statements settle in the B2 study

`spec/SPEC_STUDY_EDIT_B2_COLLABORATION.md` §8 asked Q1–Q7 plus Q-JOINT-1. They are rendered here as follows and are not reopened. The B2 text remains the evidence base; this section is the decision layer over it.

| Question | Rendered decision | Source | Effect on this specification |
| --- | --- | --- | --- |
| Q1 — engage L2 and when | **L2 engaged now.** Real concurrent editing in the same block, Google-Docs class: presence, carets/selections, character-level merge, no lost edit. L0 locks remain a capability, not a prerequisite stage. | `owner-decision` (statements 3–5) | The lots of §8 deliver L2 as the headline, not as an optional follow-on. CB-0/CB-1 L0 work is retained only where it is on the critical path (provider port, badge) and is announced with the §5.3 discipline of B2, never as co-editing. |
| Q2 — L1 block locks for text | **A — no L1 for text.** | `conductor-decision` | No block-lock gesture guards are built for text. The exclusive-block guarantee for text is consciously not delivered. Diagram and spreadsheet granularity are not decided here. |
| Q3 — agent posture on a visualised object | **Superseded by a new posture.** The AI agent is a live co-editor in the same block at the same time as humans: a CRDT participant with presence, not a draft, not a lock holder, not a yielding background process. | `owner-decision` (statements 3, 5) | §5 defines the agent as a peer. The former B2 options A/B/C for Q3 (present-and-warn / live-wins / lock-for-agents) are superseded as defaults. A host MAY offer an explicit suggest mode as a preference, never as the default that replaces co-editing (sentropic dossier r4b §5, `sentropic-input` dossier-r4b.md:268). |
| Q4 — first live host | **A — sentropic hosts the first live session.** Persistence and transport stay host-side, consistent with the handover (`LiveDocumentStore` persistence host-side, B2 option C). | `conductor-decision` | §7 makes sentropic the first implementer of the provider and of the MCP bridge. The DS ships no server. |
| Q5 — per-paragraph attribution in the frozen return | **A — session-level provenance in the host journal, no per-paragraph attribution, no Focus contract change.** | `conductor-decision`, subject to the §5.8 finding | §5.8 records the analysis. Unless that finding is overturned, no Focus evolution is engaged for attribution. |
| Q6 — diagram granularity | **A — element claim + presence; whole-diagram lock only where the host already locks the parent object.** | `conductor-decision` | CB-4D equivalent in §8 (lot CL-6D). No merged concurrent geometry is promised. |
| Q7 — who may request the collective freeze | **A — any authorised participant may request it; the host serialises it and records session provenance.** | `conductor-decision` | §4.7 and lot CL-4 inherit the B2 §4.5 publication authority unchanged. |
| Q-JOINT-1 — spreadsheet ambition | **Out of scope for this lane.** | instruction | No spreadsheet lot is defined here. The shared lock/presence contract of B2 §5.1 remains available to B3; this specification takes no position on cell merge semantics. |

Technical choices that the sources leave open are decided in this specification with rationale and tagged `ds-proposition` or `conductor-decision`. They are not presented as owner questions. The remaining owner questions are collected in §9 and are short by construction.

## 2. Measured starting point

### 2.1 Pins read

- DS: this worktree at `0d32d10b` (`git log --oneline -3` in `.canvas-live-spec-wt`: `0d32d10b` M3 executor #200, `06bdab4f` RT-1 #199). FE-2 text is `spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md` (808 lines on this tree). B2 is `spec/SPEC_STUDY_EDIT_B2_COLLABORATION.md` (529 lines). B1 is `spec/SPEC_STUDY_EDIT_B1_SENTROPIC_EDITABLES.md` (461 lines). JSON-render is `spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md` (1858 lines). Comment presentation is `spec/SPEC_EVOL_DS_COMMENT_ANNOTATE_BLOCKS.md` (718 lines). Chat contract is `docs/chat-ui-contract.md` (119 lines). `measured` (commands run in this session).
- Sentropic `origin/main` via git objects only. The REPORT inventory pins it at `ea20bd9c0` (2026-10-28, #804) (`sentropic-input` REPORT.md:4). DS `origin/main` there is `0d32d10b`, the same HEAD as this worktree.
- h2a Focus contract at merge `98060bd0a`, as pinned by B2 and FE-2. Not re-read file by file here; B2 §2.4 is the measured summary and is cited as such.
- Collaboration pins on disk: `/home/antoinefa/src/sent-tech-design-system/.ds-scrap/re-sources/MANIFEST.md` (fetched 2026-10-16, added 2026-10-19T12:24Z): `yjs` v13.6.33 (`9ea3a4fb…`), `y-prosemirror` v1.3.7 (`f89fadd2…`), `tiptap` v3.32.0 (`388e722d…`), `hocuspocus` v4.7.1 (`bd288a44…`). The worktree `.ds-scrap/` holds only `METHOD-fr-top50.md`, `PLAN.md`, `SOP-theme-clone.md`; the pins live in the parent tree. `measured`

### 2.2 The canvas norm on paper: option E

The canvas norm is the contract by which an AI produces only data (JSON) and DS components render it in any host. The owner formulation is quoted at `spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:110-116`: « un standard pour permettre de render dans n'importe quelle UI (gemini, claude etc) mes composants de façon simple avec un simple JSON attendu en entrée », « un MCP disponible au sein de h2a avec le catalog de composants dont le decision dossier focus », « la norme canvas de Sentropic [doit gérer] ce type de contrat. bpmn-canvas devrait être un exemple ». `measured`

Owner choice 2026-10-15 (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:50-58`): **option E validated** — compiled web components distributed through npm and a CDN (jsDelivr mirror), an MCP server inside h2a serving `ui://` resources and the catalogue, a skill teaching an AI to produce the input JSON, a catalogue in A2UI v0.9.1 format (JSON Schema, `$id` equal to `catalogId`), plus the Sentropic canvas exchange envelope (`diagram-core` / `diagram-canvas`) for diagrams; A2UI and AG-UI adapters deferred. Owner goal verbatim: « que l'IA n'ait qu'à produire les objets de données, et que le layout soit fait par le design system et ses moteurs » (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:60-61`). `measured`

The programme lots are: L1 catalogue and schema generator, L2 elements package, L8 canvas envelope (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:1379-1380` table; REPORT.md §1.3). At measurement the norm is specified, not delivered: no `packages/*elements*` exists on DS main, `diagram-core`/`diagram-canvas` are `private: true` with no JSON Schema for `SemanticDocument`/`ViewDocument`/`Transaction` (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:186-193`; REPORT.md:23-24). `measured`

Governance already assigns the norm to the DS on paper: C09 « Composition Canvas (UI + interaction IA) » owned by design-system (« gabarits de canevas »), sentropic contributing catalogue `kind:'canvas'`, MCP, artifacts; G3 (2026-10-19) DS owns annotate presentation, sentropic owns the annotation model (REPORT.md:15, citing `docs/governance/study.md` at `f3a22079e`). `sentropic-input`

### 2.3 What sentropic still holds (the handover list)

Per the DS session handover (`/home/antoinefa/src/sent-tech-design-system/scratchpad/requests/2026-10-28-canvas-live-edit-via-sentropic.md:27-36`) and REPORT.md §1.4 (`sentropic-input` REPORT.md:29-36). Each item is verified against `origin/main` below.

1. **Catalogue canvas kind.** `sentropic:api/src/services/catalog/types.ts:154-174` defines `CanvasEntry` (`kind: 'canvas'`, `template: CanvasTemplate`) and `CanvasTemplate` (`id`, `title`, `mimeType`, `initialContent?`, `schema?`). The header comment states the `LiveDocumentStore`/CRDT/editor runtime is carved out to `SPEC_EVOL_CHAT_CANVAS` and not included (`sentropic:api/src/services/catalog/types.ts:141-147,160-169`, via `git show`). `sentropic:api/src/services/catalog/sources/canvas-template-source.ts` ships two static seeds, `blank-markdown` (`text/markdown`, empty content) and `structured-plan` (`application/json`, `{title, sections[]}` with a JSON Schema), with the explicit note « No `LiveDocumentStore`/CRDT/editor runtime is included or imported » (`canvas-template-source.ts:1-16,52-89`, via `git show`). `spec/SPEC_EVOL_CATALOG.md:80-91,195` records D-CANVAS as kind-only, runtime carved out to a file that does not exist (`SPEC_EVOL_CATALOG.md` §2.4, via `git show`). `measured`
2. **Comment target kind `canvas`.** `sentropic:packages/comments/src/types.ts:11-16` defines `CommentTargetKind = 'message' | 'canvas' | 'artifact' | 'field' | 'record'`, with `CommentTarget { kind, id, sectionKey?, recordType? }` and `CommentAuthor { id, kind?: 'human'|'agent'|'nhi', displayLabel? }` (`packages/comments/src/types.ts:23-51`, via `git show`). The comments/annotations contract v1 is frozen under `docs/comments-annotations/contract/*` (REPORT.md:31). `measured`
3. **`LiveDocumentStore` stub.** `sentropic:packages/chat-core/src/ports.ts:66-72` is the whole surface: `export interface LiveDocumentStore { readonly _kind: 'LiveDocumentStore'; }` with the comment « Per SPEC §10.3 — canvas bidirectional editing. LiveDocumentStore carries the diff round-trip abstraction beyond the message log » (via `git show`). There is no read, watch, submit or reconcile method. B2 §2.1(b) records the same fact and the h2a capital K15. `measured`
4. **Raw canvas intent.** `sentropic:spec/SPEC_VOL_INTERACTIVE_CANVAS.md:1-9` is headed « raw intent: live canvas, agent-scope awareness, CLI integration, track/dossier as canvas » and self-describes as « SPEC_VOL = volition / raw owner intent, NOT a reviewed study ». Intentions I1 (live preferred over background filesystem edits), I2 (agent-scope awareness on a visualised object), I4/I5/I6 are intent, not delivered behaviour; §4 names the concurrency model as undecided (« lock (deny the agent), CRDT merge, or present-and-warn (live wins, agent yields)? ») (`SPEC_VOL_INTERACTIVE_CANVAS.md:22-62,84-89`, via `git show`). `measured`
5. **Artifacts hosting.** `sentropic:packages/artifacts/src/server/templates.ts` is a generic provider kit (`TemplateFile`, `ArtifactTemplate`, `TemplateCatalogPort`, `createDefaultTemplateCatalog()` with a `static-html` kit; `templates.ts:11-33,93-116`, via `git show`). Hosting, publication, releases, access and lifecycle stay sentropic; only the template/descriptor contract moves (§3.5). `measured`

No `ui/src/**/canvas*` component exists in sentropic; the only `<canvas>` elements are `InitiativeScatterPlot` and print CSS (REPORT.md:36). `sentropic-input`

### 2.4 The RT-1 editor as built on main

`packages/rich-text` is `@sentropic/design-system-rich-text` 0.1.0, MIT, `publishConfig.access: "public"`, exports `"."` (pure) and `"./editor"` (Tiptap-bound), peers `@tiptap/* ^3.0.0` with dev pins `3.32.0`, dependency `@tiptap/markdown ^3.32.0` (`packages/rich-text/package.json`, this worktree). `measured`

The pure entry (`packages/rich-text/src/index.ts:1-10`) re-exports only pure modules and states the side-effect-free invariant; `"."` loads no `@tiptap/*`, no `prosemirror-*`, no framework module, no DOM global. The controlled model is `packages/rich-text/src/model.ts:5-26` (`RichTextFormat`, `RichTextBlock { paragraphId, kind, text?, raw?, preservedKind? }`, `RichTextDocument { format, blocks }`), with gesture provenance (`model.ts:28-81`), representability (`model.ts:70-72`), external-conflict and readiness/capture surfaces (`model.ts:93-134`). The factory is `packages/rich-text/src/editor.ts:188` (`createRichTextEditor`), building a real Tiptap `Editor` from P0 extensions, carrying `paragraphId` as a node attribute, with the §5.6 echo/defer/conflict/apply decision, deferred capture and the neutral `RichTextCaptureUnavailable` error. `measured`

The Svelte adapter lives at `packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.svelte` (subpath `@sentropic/design-system-svelte/rich-text-editor`, `packages/components-svelte/package.json:25-30`), exposing `RichTextEditorProps { value, editable?, disabled?, messages, allocateId?, class?, onChange?, onExternalConflict?, onUnsupportedPaste?, onReadinessChange? }` (`RichTextEditor.svelte:23-34`) and the handle `captureDocument()` / `readiness()` (`RichTextEditor.svelte:156-164`). B1-L0c gaps are closed: `model.ts:80` carries `representability`, `model.ts:111-114` carries `RichTextCaptureResult` (REPORT.md:51). Maturity: merged (#199, `06bdab4f`) but not yet published at the REPORT measurement (npm latest `design-system-svelte` 0.36.0 without the subpath; `design-system-rich-text` 404) — `source-gap` for the current registry state, to be re-measured at lot start. `measured` / `sentropic-input`

What RT-1 does not have: any collaboration provider slot, any Yjs binding, any awareness rendering, any presence component. FE-2 §15 excludes collaborative editing; B2 §5.2 asked for the slot to be designed into RT-1. This specification provides that slot as an additive extension (§6.3), without forking the editor.

### 2.5 B2 collaboration pins (reference stack)

B2 §2.7 is the measured reference. Retained here as the starting point for §4.1:

- `yjs` v13.6.33 MIT: `Y.Doc` with `Y.Text`, `Y.XmlFragment`/`Y.XmlElement`, `Y.Map`, `Y.Array`; binary updates (`encodeStateAsUpdate`/`applyUpdate`); `RelativePosition`; `Snapshot`; per-client `UndoManager` that undoes only tracked origins. Awareness is not in `yjs` itself; it travels through the separate `y-protocols` package (`awareness` protocol), declared as a peer by its consumers and not vendored in `.ds-scrap/re-sources/` — `source-gap` (B2 §2.7). `measured` via B2
- `y-prosemirror` v1.3.7 MIT: `ySyncPlugin` (two-way ProseMirror ↔ `Y.XmlFragment` sync), `yUndoPlugin` (wraps `UndoManager`, `protectedNodes = {'paragraph'}` default), `yCursorPlugin` (remote carets/selections from awareness). `measured` via B2
- Tiptap collaboration extensions at v3.32.0 MIT: `@tiptap/extension-collaboration` (thin over `@tiptap/y-tiptap`, installs sync + undo, warns it is incompatible with `@tiptap/extension-undo-redo`), `@tiptap/extension-collaboration-caret` (installs the cursor plugin from an awareness-bearing provider, validates colour to `#RRGGBB` else `transparent`, provider typed `any`). Neither requires Tiptap Pro; `TiptapCloudProvider` is the paid hosted service and is prohibited. `measured` via B2
- Hocuspocus v4.7.1 MIT: `@hocuspocus/server` (Node WebSocket server, one `Document` per name, `onAuthenticate`/`onLoadDocument`/`onStoreDocument` hooks, pluggable `Database` extension) and `@hocuspocus/provider` (client `Y.Doc` + `Awareness`, socket sync). Host-side machinery only (§4.7 of B2). `measured` via B2
- `y-websocket`, `y-indexeddb` and other persistence/provider packages were not in the pinned set: `unknown` for packaging until a lot pins them (B2 §2.7). `unknown`

### 2.6 Comment presentation boundary (G3)

Owner decision G3 (2026-10-19, dossier v4): « design-system owns annotate (presentation only), sentropic owns the data model (anchors, threads, persistence; stable anchor contract per DS position) » (`spec/SPEC_EVOL_DS_COMMENT_ANNOTATE_BLOCKS.md:31-41`). The DS ships presentation and interaction blocks (`CommentListItem`, `AnnotateContextMenu`, `ElementPicker`, labelled/split icon buttons) over an opaque `anchor` value with host-supplied `label`/`kind`; it imports no sentropic data-model type and allocates no persistent comment identity (`SPEC_EVOL_DS_COMMENT_ANNOTATE_BLOCKS.md:43-51`). For canvas, the comment target kind is `canvas` with a free-form `sectionKey` that already covers a canvas object or a livedoc range (§2.3 item 2), so no comment-model change is needed to discuss a canvas block (B2 §2.3). `measured`

### 2.7 Chat contract (adjacent, not in this lane)

`docs/chat-ui-contract.md:29-34` fixes the ownership split (DS owns tokens and primitives; sentropic/chat-ui owns runtime state, streaming, persistence, tool execution) and states the DS does not freeze Svelte chat component APIs until the sentropic refactor has landed. The owner statement 8 relayed by sentropic (chat UI could move to the DS, but the app must migrate first, `scratchpad/requests/2026-10-28-canvas-live-edit-via-sentropic.md:19`) is therefore recorded here as an adjacent lane with no DS work before sentropic P0. This specification defines no chat component. `measured`

## 3. Canvas norm owned by the DS

Decision CL-D1 — The DS is the source of truth for the canvas norm. `owner-decision` (statement 7) + `conductor-decision` (transfer)

The norm moves to the DS. Sentropic becomes a consumer: it imports the DS contracts, projects them into its catalogue and MCP surface, hosts artefacts, and deletes its duplicate definitions after adoption. No legacy dual-norm state is kept. The transfer is per artefact, with the gate of §3.6 proving each step. Hosting does not move: the artifacts provider, publication, releases, access and lifecycle remain sentropic (`sentropic-input` dossier-r4b.md:295,302). Only the template/descriptor contract moves.

### 3.1 What the norm is

The canvas norm is the set of DS-owned contracts that let an AI produce only data and let any host render and edit it identically. It has four layers, each with a single DS owner:

| Layer | DS content | Source of the layer today |
| --- | --- | --- |
| Descriptor | The canvas template/descriptor contract (§3.2): identity, mime/profile, starter content, field layout, capability flags. Versioned, schema-validated, fixture-backed. | Sentropic `CanvasTemplate` + seeds (§2.3 item 1), absorbed and extended. |
| Catalogue | The A2UI v0.9.1 catalogue entry for canvas components and templates: one catalogue document (`$id` = `catalogId`) plus one standalone schema per component, both generated from one TypeScript source (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:373-425`). | JSON-render L1. |
| Elements | The compiled DS components that render and edit a canvas: the canvas shell, field cards, the editable-card editor surface (§6), presence and caret presentation. Distributed as npm + CDN (jsDelivr) compiled web components where option E requires it (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:50-58`). | JSON-render L2 + RT-1 + this specification. |
| Envelope | The exchange envelope for diagrams (`SemanticDocument`/`ViewDocument`/`Transaction`, `spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:673-683`) and the live-editing session envelope (§4). Layout is done by DS engines, never by the producer (« que l'IA n'ait qu'à produire les objets de données, et que le layout soit fait par le design system et ses moteurs », `spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:60-61`). | JSON-render L8 + GD-M2-CANVAS (`01M2KJTY6V3DC5N6ZBVG13808F`, REPORT.md:25). |

The norm is not a component. It is the contract surface that components, the catalogue generator, the MCP tools and the fixtures all derive from. Changing a norm contract is a DS version change under §7.5; hosts pin the version.

### 3.2 The canvas template/descriptor contract

Decision CL-D2 — One DS descriptor type absorbs `CanvasEntry`/`CanvasTemplate`. `ds-proposition`

The DS publishes the canonical descriptor in a framework-neutral package (the rich-text pure entry's sibling, or the elements package's contract module; the lot decides the file, the contract below is fixed). It absorbs the sentropic shape field by field so that adoption is an import change, not a translation:

```ts
// DS-owned (pure entry; no editor runtime, no transport)
export interface CanvasTemplateDescriptor {
  /** Stable kebab-case id (e.g. "blank-markdown"). Same rule as
      sentropic CanvasTemplate.id (types.ts:175-176). */
  id: string;
  /** Human-readable display title. Host localises the rendering; the
      descriptor carries the canonical title. */
  title: string;
  /** MIME type of the starter content ("text/markdown",
      "application/json", "text/plain"). Same rule as types.ts:183. */
  mimeType: string;
  /** Starter content body. Optional (may be empty). Same rule as
      types.ts:188. Renamed from initialContent at the DS boundary;
      the host adapter maps the two names once. */
  initialContent?: string;
  /** Optional JSON Schema for structured kinds. Same rule as
      types.ts:193. Absent for free-form text/markdown. */
  schema?: Record<string, unknown>;
  /** DS additions (additive, so existing sentropic consumers keep
      working): the editing profile the template opens with, and the
      field layout the canvas shell renders. */
  profile: CanvasProfile;          // "markdown" | "structured" | "plain"
  fields: readonly CanvasFieldDescriptor[];
  capabilities: CanvasCapabilities;
}

export interface CanvasFieldDescriptor {
  /** Field key, unique inside the template (the TemplateRenderer
      field.key vocabulary: text | list | scores | …). The DS does
      not enumerate host field kinds; it carries the key opaquely
      and the host interprets it (B1 source-gap U-B1-3). */
  key: string;
  kind: string;                    // opaque host token, e.g. "text"
  /** Whether this field is a live-editable block (§4). */
  editable: boolean;
  /** Comment target sectionKey for this field (the value the host
      passes as CommentTarget.sectionKey). */
  sectionKey?: string;
}

export interface CanvasCapabilities {
  liveEditing: "none" | "l0" | "l2";   // norm-level ceiling; the host
                                       // session may be lower, never higher
  comments: boolean;                    // comment-target presentation (§3.4)
}
```

Rules (blocking):

- R-DESC-1. The two sentropic seeds become DS fixtures verbatim in content: `blank-markdown` (`text/markdown`, `initialContent: ""`, no schema, `profile: "markdown"`, one editable markdown field) and `structured-plan` (`application/json`, the `{title:"", sections:[]}` starter and its `{title, sections[]}` schema of `canvas-template-source.ts:52-89`, `profile: "structured"`). A fixture test asserts byte equality of `initialContent` and deep equality of `schema` against the sentropic source at adoption time; afterwards the DS fixture is the source and the sentropic copy is deleted (§3.6).
- R-DESC-2. `id` is the identity. Renaming an `id` is a breaking change (new descriptor, new catalogue minor under §7.5). `mimeType` and `profile` together decide which editor surface opens; a descriptor whose `profile` disagrees with its `mimeType` family is refused by the validator with the JSON-render diagnostic shape (`{code, path, message, severity, source}`, `spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:339-353`).
- R-DESC-3. The descriptor carries no URL, no endpoint, no credential, no workspace id. Host configuration (theme, locale, `assetBase`, watermark reference) travels on the separate host channel of JSON-render §6.5, never in the envelope (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:311-313`).
- R-DESC-4. Catalogue projection is generated, never hand-written: the A2UI catalogue entry for a canvas template is emitted from this type by the L1 generator, with `x-sentropic.contract` versioning (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:412-415`). Sentropic's catalogue then imports the generated entry instead of defining `CanvasEntry` locally (§3.6).

### 3.3 Canvas UI patterns and elements (from option E)

Decision CL-D3 — The canvas UI is the DS component set of JSON-render L2 plus the editable-card surface of §6. `ds-proposition`

Option E already fixes the element shape: thin Svelte custom-element wrappers over the existing DS components, compiled with the `customElement` option, validating the envelope, mapping catalogue properties to props, turning callbacks into the `intent` event (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:452-471,356-367`). The canvas norm adopts that shape without a second runtime:

- The **canvas shell** renders a descriptor: header (title, presence badge slot, lock/connection state), field stack (one card per `CanvasFieldDescriptor`), comment affordances per field. It owns layout (the DS engines rule of §3.1); the producer supplies data only.
- **Field cards** reuse the DS `FieldCard`/`ScoreCard`/`ConfigItemCard` already published (REPORT.md:27) and the `TemplateRenderer` FieldCard pattern (`TemplateRenderer.svelte` FieldCards at `sentropic:ui/src/lib/components/TemplateRenderer.svelte:499,520`, via `git grep`). The coloured-header variant gap (D9, REPORT.md:27) stays a host/DS card lot; this specification does not invent a new card.
- **The editable card** is the §6 component built on RT-1. In snapshot mode (no live session) it is the controlled `RichTextEditor`; in live mode it is the same component with the collaboration binding attached (§6.3). One component, two bindings — never two editors (the D23 discipline of FE-2 §4.1).
- **Diagram canvases** consume the L8 envelope (`SemanticDocument`/`ViewDocument`) and the GD-M2-CANVAS transaction model. Text co-editing (§4) does not convert diagram geometry into CRDT text (dossier r4b §5 three-planes rule: `expectedRevision`/`operationId` for surface structure, Yjs for same-block text, business transactions for métier; `sentropic-input` dossier-r4b.md:272). Diagram arbitration is lot CL-6D only.
- The envelope `mode` rule carries over: `"snapshot"` renders, `"preview"` is refused with `unsupported-mode` until a lot implements it (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:691-695`). Live editing is not `preview`; it is a session (§4), opened explicitly by the host.

### 3.4 Comment-target presentation for canvas

Decision CL-D4 — Annotation model stays sentropic; presentation is DS. `owner-decision` G3

Per G3 (`spec/SPEC_EVOL_DS_COMMENT_ANNOTATE_BLOCKS.md:31-41`), the split is:

- Sentropic owns: anchors, threads, persistence, the stable anchor contract, the `CommentTargetKind 'canvas'` vocabulary and the frozen v1 contract (`docs/comments-annotations/contract/*`). The DS deletes no part of this and copies none of it.
- DS owns: the presentation that targets a canvas — the comment list item, the context menu on a selection or a shape, the element picker, the per-field comment count and anchor link inside the canvas shell (§3.3). Those blocks already exist as `CommentListItem` / `AnnotateContextMenu` / `ElementPicker` contracts (`SPEC_EVOL_DS_COMMENT_ANNOTATE_BLOCKS.md` §7–§9) with an opaque `anchor` (`Anchor = unknown` default, specialised by the host at the composition site, §13 of that specification). Canvas reuses them unchanged; the only canvas-specific fact is the join key below.
- Join: the host maps a canvas field to `CommentTarget { kind: 'canvas', id: <artifactId>, sectionKey: <field.sectionKey> }`. `sectionKey` is preserved verbatim (`'description'`, `'matrix.cell.x.y'`, a livedoc range, or a field path; `packages/comments/src/types.ts:27-32`). Under L2 the text under an anchor can move; the sentropic annotations resolver (exact / source changed / unresolved / unavailable, B2 §2.3) reports the outcome instead of silently reattaching. The DS renders that outcome; it never resolves an anchor itself.

No new comment kind is introduced. A DS lot that needs to branch on `kind` has misunderstood the boundary and fails its own gate (the §0.3 rule of the comment specification).

### 3.5 Boundary with sentropic hosting

Decision CL-D5 — Hosting stays sentropic; only the contract moves. `conductor-decision`

| Concern | DS (norm) | Sentropic (host) |
| --- | --- | --- |
| Template/descriptor types, fixtures, catalogue generation | Owns (§3.2) | Imports the pinned DS version; projects into its catalogue/MCP |
| Canvas shell, field cards, editable cards, presence UI | Owns (§3.3, §6) | Composes them; supplies data, messages, capabilities |
| Artefact identity (`artifactId`/`releaseId`), publication, releases, access, lifecycle | Does not own | Owns (artifacts provider; `templates.ts` kit is the provider seam, §2.3 item 5) |
| Live session transport, Hocuspocus hosting, persistence, session journal | Does not own (§4.9) | Owns (§7.4) |
| MCP tools that create/patch a live artefact (B′ live artefact patchable by MCP) | Defines the port (§5.6) | Implements the tools and the bridge (§5.7, §7.4) |
| Auth, membership, agent admission and revocation | Renders opaque actor facts only | Owns and enforces (dossier r4b §5 admission gates) |

The DS norm therefore has no deployment. A host that cannot run the live session still consumes the norm in snapshot mode; the norm never requires a server (the offline `file://` dossier configuration of B2 §5.1).

### 3.6 Per-artefact transfer protocol (DS version → adoption → deletion)

Every artefact of the handover list follows the same four steps. No step is skipped and the deletion step is part of the adoption lot, not a later cleanup (dossier r4b L0-NORM gate: « inventorier les usages et propriétaires ; publier la norme, les exports/gabarits et fixtures DS avec version/digest et notes de migration ; épingler cette version dans Sentropic ; vérifier rendu, édition, import/export, compatibilité des IDs et contrats publics ; supprimer les copies remplacées dans le lot d'adoption », `sentropic-input` dossier-r4b.md:300).

Gate NORM-G (must all hold before a deletion is claimed for any row):

1. The DS version is published at an exact version with a digest (npm tarball + `sri.json` where option E applies) and migration notes naming the sentropic source path it replaces.
2. Sentropic pins that exact version (no range) and its CI renders/edits through the DS artefact on the recorded fixtures.
3. Equivalence is witnessed on the fixture set for that row (render output, edit round-trip, id compatibility, public contract), with command output recorded.
4. The sentropic copy is deleted in the same adoption change; `git grep` for the deleted symbol/path in sentropic returns no active reference outside history and the migration note.
5. The conductor keeps the receipt `source path → DS export@version → consumer site → deletion commit`.

| # | Artefact (sentropic source) | DS version (what becomes canonical) | Sentropic adoption | Deletion (no legacy) | Row gate (in addition to NORM-G) |
| --- | --- | --- | --- | --- | --- |
| N1 | `api/src/services/catalog/types.ts:154-194` (`CanvasEntry`/`CanvasTemplate`) | `CanvasTemplateDescriptor` (§3.2) + generated catalogue entry | Catalogue imports the DS type; `CanvasEntry.template` is typed by the DS descriptor through an adapter that maps `initialContent` once | Local `CanvasTemplate` interface deleted; no parallel canvas template type remains | Fixture: `blank-markdown` and `structured-plan` descriptors deep-equal the sentropic seeds; catalogue `list/search/get` parity for `kind:'canvas'` unchanged |
| N2 | `api/src/services/catalog/sources/canvas-template-source.ts` (two seeds) | DS fixtures for the two seeds (R-DESC-1) | `CanvasTemplateSource` reads the DS fixture set through the pinned package (or a generated JSON asset) | Inline `CANVAS_TEMPLATES` array deleted | Byte equality of both `initialContent` values and deep equality of the `structured-plan` schema, asserted in both repos before deletion |
| N3 | `spec/SPEC_EVOL_CATALOG.md:80-91,195` (D-CANVAS kind-only) + `spec/SPEC_VOL_INTERACTIVE_CANVAS.md` (raw intent) | Normative canvas chapters move into DS versioned specs (this file + JSON-render); sentropic keeps an integration note pointing at the DS version | Sentropic spec replaced by a version reference + host-only contracts | The duplicated normative sections deleted; the dangling `SPEC_EVOL_CHAT_CANVAS` reference resolved to the DS live-editing contract (§7) | A reader following the sentropic note reaches the DS contract without encountering a second normative definition |
| N4 | `packages/chat-core/src/ports.ts:70-72` (`LiveDocumentStore` stub) | The live-document contract is the DS provider port + host persistence contract (§7.3–§7.4); the DS defines no store | Sentropic implements the host store behind that contract (§7.4) | The `_kind` stub deleted once the implementation lands; no parallel signature kept | The implementation passes the §7.4 persistence witnesses (snapshot/journal/replay); the stub's absence breaks no import |
| N5 | `packages/artifacts/src/server/templates.ts` (template kit) | Only the canvas-relevant generic templates/descriptors become DS norm (§3.2); the provider kit mechanism stays sentropic | Provider imports DS canvas descriptors for canvas artefacts; generic `static-html` kit stays host-side | Copied canvas templates inside the provider deleted; provider code that defined them now imports | Artefact create/publish/read through the provider with a DS canvas descriptor renders identically to the pre-transfer fixture |
| N6 | `packages/comments/src/types.ts:13` (`'canvas'` kind) — G3 carve-out | DS presentation reference only (§3.4). No DS copy of the model. | No adoption needed; the host keeps using its own type | **Nothing deleted.** The public discriminant `'canvas'` and contract v1 are not broken (dossier r4b §5 row 6). A duplicate DS-side definition, if one appears, is the thing deleted. | The §3.4 join renders in the canvas shell against the frozen v1 contract; `CommentTargetKind` is unchanged |
| N7 | `ui/src/lib/components/TipTap.svelte` + generic part of `EditableInput.svelte` + TemplateRenderer FieldCards | The §6 editable-card components on RT-1 | Field-class migration (B1 order: templater text + score first, chat second, `forceList` last) | `TipTap.svelte` and the replaced generic wrapper parts deleted after the profile gates for the migrated classes pass | B1 witness matrix (§6.5) green for the migrated class; unmigrated classes keep the host wrapper and are announced as such |
| N8 | This dossier's normative canvas prescriptions (B′ r4) | Decisions, co-editing criteria, contracts and fixtures integrated into E/B2 and this file | Sentropic keeps its consumer plan and historical evidence (r3/r4 dossiers preserved) | Active normative copies retired after the DS reference is in place; historical dossiers are evidence and are not erased | The correspondence register (source → DS section) is recorded; no active sentropic norm competes with the DS one |

Ordering: N1/N2 (descriptor contract) are independent of the L2 binding and may run before it. N7 depends on the §6 components. N4 depends on §7.4. N6 has no deletion and may be verified at any point.

## 4. Collaborative document model

### 4.1 CRDT choice and rationale

Decision CL-D6 — Keep Yjs + y-prosemirror (via the Tiptap collaboration extensions). `ds-proposition`, B2 reference retained

The B2 reference (Yjs + y-prosemirror, Hocuspocus host-side) is kept. No evidence in the sources justifies replacing it, and three measured properties make it the fit for the §1.2 settlement:

1. Same-block character merge. Concurrent inserts into the same Yjs sequence merge deterministically on every replica without a central lock, with deletions as tombstones (§2.5). That is the Google-Docs class behaviour the owner statements require; a lock-based or patch-based model cannot produce it.
2. ProseMirror binding already exists. `ySyncPlugin` keeps a ProseMirror document and a `Y.XmlFragment` in two-way sync, `yUndoPlugin` wraps the per-client `UndoManager`, `yCursorPlugin` renders remote carets from awareness (§2.5). The DS editor is a ProseMirror/Tiptap editor (`packages/rich-text/src/editor.ts:188`); no second editor engine is introduced.
3. Licence and packaging. All pins are MIT (§2.5), compatible with the MIT DS packages under the repo licensing gate; no Tiptap Pro or cloud dependency is required. The alternative families (operational transform over commands, last-writer-wins patches) were the B2 options A/B/D, each rejected or deferred there for the same-block case (B2 §4, Option D rejected on dependency/contract costs that Option C avoids). Replacing the CRDT now would reopen that analysis with no new measurement.

What is pinned, and what is not: `yjs` 13.6.33 and `y-prosemirror` 1.3.7 (or `@tiptap/y-tiptap` 3.0.10 behind `@tiptap/extension-collaboration` 3.32.0, the Tiptap-published binding of the same plugin set) are the stage-two candidates; the lot chooses one binding line and records it. `y-protocols` (awareness) must be pinned explicitly at that lot — it is `source-gap` today (§2.5) and cannot be assumed present because `yjs` is. `y-websocket`/`y-indexeddb` remain `unknown` until a host lot pins them; the DS never depends on a persistence provider package.

### 4.2 Block identity

Decision CL-D7 — `paragraphId` is the block identity in both modes. `h2a-spec` D13/D14, carried by B2 §4.5

- The identity is the opaque `paragraphId` string on `paragraph` and `preservedBlock` nodes, rendered as `data-paragraph-id` (`packages/rich-text/src/model.ts:7-21`; FE-2 §5.2). The DS never parses, derives, sorts by or displays it as content.
- In the Yjs binding, node attributes map onto `Y.XmlElement` attributes, so the identity rides the shared element itself rather than a position, an index or a text offset (B2 §4.5). Concurrent character inserts inside one element interleave without touching its identity attribute.
- Split allocates through the injected allocator (the leading paragraph keeps its id, tails receive fresh ids); merge retires consumed ids without reallocation; clear-field keeps the first block's id; undo restores identities by construction (FE-2 §5.2, `packages/rich-text/src/editor.ts` identity plugin). In a live session the allocator must be collision-free across sessions (host-issued or UUID-class); deterministic producer seeding is a baseline operation, never a live-session operation (B2 §4.5 failure mode 1).
- External paste strips incoming `data-paragraph-id` before insertion, without exception — now with the additional reason that a pasted id could collide with a live remote element (B2 §4.5 failure mode 3).
- Display order, array index, DOM path, content hash and character offset are never identities (h2a D13).

### 4.3 How a canvas block maps to the shared state

Decision CL-D8 — One `Y.Doc` per canvas artefact; one `Y.XmlFragment` per editable field. `ds-proposition`

```
Y.Doc (guid = host session document name, e.g. "canvas:<artifactId>")
 ├─ Y.Map "meta"        — norm version, profile, descriptor id (host-written, DS-read)
 └─ Y.XmlFragment "<fieldKey>"   — one per CanvasFieldDescriptor with editable: true
      └─ Y.XmlElement "paragraph" (attrs: paragraphId) — one per RichTextBlock
           └─ Y.XmlText — the paragraph characters (marks as Yjs attributes)
      └─ Y.XmlElement "preservedBlock" (attrs: paragraphId, preservedKind) — host-spliced, immutable (§4.4)
```

Rules (blocking):

- R-MAP-1. The field key is the `CanvasFieldDescriptor.key`. A canvas with three editable fields has three fragments in one doc; presence and awareness are per doc, so a collaborator's caret is located by `(fieldKey, paragraphId, relative position)`. Per-field docs were rejected: they would fragment awareness and the freeze (§4.7) into per-field lineages for no gain.
- R-MAP-2. The DS binding receives exactly one fragment plus the awareness object for the field it renders (§4.9). Framework adapters never receive the `Y.Doc`.
- R-MAP-3. Seeding: the host seeds the fragment once from the retained baseline's `RichTextDocument` (paragraph elements with their `paragraphId` attributes, text as `Y.XmlText`). Seeding is a host operation at session open; the DS binding assumes the fragment already reflects the baseline and never reseeds. Reseeding identities mid-session is prohibited (B2 §4.5 session/base discipline).
- R-MAP-4. A field whose descriptor says `editable: false`, or a structured (`application/json`) field, is not a text fragment. Structured canvas content (the `structured-plan` seed shape) is edited through its own host surface and merges by the host's business transaction rules, not by Yjs text. Claiming CRDT merge for JSON structure under this specification is a scope breach (§10).

### 4.4 Preserved blocks inside a live fragment

Blocking constraint, carried from B2 §4.4: `preservedBlock` nodes carry verbatim source slices (`raw`) that the pinned Focus contract cannot transport as edits. In a Yjs-bound document they are immutable atoms owned by host segmentation: present in the shared fragment for rendering context, excluded from collaborative text mutation (`contenteditable=false`, the atom posture of the P0 schema), and re-spliced host-side exactly as in controlled mode. If the binding cannot keep preserved slices byte-identical through arbitrary merges (including a collaborator deleting adjacent paragraphs), L2 applies to paragraph-only fields and preserved-bearing fields stay in controlled/L0 mode. This is a gate (lot CL-3 witness 3), not a hope.

### 4.5 Undo/redo per participant

Decision CL-D9 — The Yjs `UndoManager` replaces ProseMirror history in bound mode, exactly once. `ds-proposition`, B2 §4.4

- In bound mode the history is the Yjs `UndoManager` (via `yUndoPlugin` / Tiptap collaboration), which undoes only the local user's tracked origins. My undo never removes a collaborator's text; that is the required multi-writer semantics and the only available one, since a global ProseMirror history in a merged document would revert remote changes.
- The P0 extension list changes exactly once behind the binding slot (remove `UndoRedo` from `@tiptap/extensions`, add the collaboration pair), never per-session toggling. Enabling collaboration extensions alongside `UndoRedo` is the warned-against configuration (§2.5) and is a lot failure if shipped.
- Undo of a split/merge must still restore the same logical paragraph's identity (the attribute rides the `Y.XmlElement`, §4.2), now requiring a merge-interleaved undo witness (lot CL-3 witness 2).
- `protectedNodes = {'paragraph'}` (the y-prosemirror default delete filter) interacts with the DS `preservedBlock` atom: preserved blocks are excluded from collaborative mutation entirely (§4.4), so the undo delete-filter needs a DS-side witness with preserved blocks present.
- L0/controlled mode keeps ProseMirror `UndoRedo` unchanged.

### 4.6 IME composition safety

The single shared rule is IME-LOCK-1 (B2 §4.4, FE-2 amendment A-IME-1), reproduced here because every live lot depends on it. It is not restated in different words elsewhere; B1 and B3 cite this same text.

> **IME-LOCK-1.** (1) Content arrivals are deferred during composition: an external controlled value arriving while composing is neither applied nor signalled as a conflict mid-composition; it is re-evaluated once, immediately after the composition commit and its single `onChange`, under FE-2 §5.6 rules 1, 3 and 4. In bound mode a remote Yjs transaction is document content, not a controlled value: it is not routed through `onExternalConflict`, and the same no-emission-mid-composition rule applies to its local notification. (2) Rights revocation is immediate, never deferred: a host-driven `editable: true → false` calls `setEditable` at once on the live editor, without remount, even mid-composition (FE-2 §5.4). (3) The uncommitted composition is discarded (A-IME-1): the composition terminates without a commit, its text is discarded, the displayed document reverts to the last committed revision, and no `RichTextChangeEvent` is emitted for the discarded text. (4) A pending `captureDocument()` rejects exactly once with `RichTextCaptureUnavailable` (`name: "RichTextCaptureUnavailable"`, `message: "rich-text.capture-unavailable"`). (5) Nothing is emitted after revocation; whether an in-flight host save is accepted is decided only by the host atomic save control, never by the editor.

L2 additions that stage two must re-witness (not part of IME-LOCK-1): no `onChange` mid-composition in bound mode, the committed composition emits exactly one coalesced change, deferred capture resolves with the committed revision, and the local caret (expressed via relative positions for sharing) does not jump when a remote insert lands before it. jsdom cannot witness real IME behaviour (FE-2 §11); the browser suite carries it (lot CL-3 witness 5, shared witness W-IME-1 of B2 §4.4).

### 4.7 Offline, reconnect, snapshot/version, and the paragraph-diff return

**Offline/reconnect.** Editing continues offline in bound mode; Yjs updates queue in the doc and sync on reconnect, merging with whatever arrived meanwhile (§2.5 convergence). The DS contributes no persistence for this: a local-persistence provider (`y-indexeddb` class) is a host choice, `unknown` until pinned. The offline `file://` dossier stays single-user in controlled mode, byte-identical to today; Yjs offline editing exists only inside connected hosts that explicitly enable it.

**Snapshot/version.** A version of the shared state is a Yjs snapshot (`Y.Snapshot`) plus the state vector at capture. The host persists snapshots and the update journal (Hocuspocus `onStoreDocument` / Database extension seam, §2.5); the DS never stores them. Snapshot equality is how the host verifies that the replicas it freezes from agree (§4.7 freeze step).

**Conversion to the h2a edit-return paragraph diff.** The owner request of 18/10 (AI return as diff by paragraph, §1.1) is served at freeze time, unchanged from B2 §4.5:

1. The host retains the baseline manifest (the FE-3 posture once qualified; at the pin FE-3 is not yet qualified, `h2a:docs/focus/document-editing.md:6` via B2 §4.5 — a future host requirement, not a delivered behaviour). The session edits a Yjs document seeded from that baseline's paragraphs (§4.3 R-MAP-3).
2. At freeze the host captures the current blocks (`captureDocument()` semantics: complete document, identities, representability flags), maps blocks to `ParagraphValue[]` through the manifest identities, and computes `diffParagraphs` against the retained baseline with `@sentropic/focus/editing`. Repeated typing, remote merges, splits and undos coalesce into that one baseline-relative cumulative delta — typing/merging to B then undoing to A yields the empty cumulative diff (FE-2 §5.3 witness re-run in bound mode, lot CL-3 witness 4).
3. Publication still happens exactly once per frozen return under FE-6's single CAS/single-writer boundary. Inside a live session, collaborators' merged text is the session's joint draft, not third-party divergence; third-party divergence remains everything outside the session and is handled at the host boundary (re-read, pure `reconcile()`, atomic publish only on `ok`), never inside the DS. The reconciler is pure; the host is the publication authority with the four duties of B2 §4.5 (per-lineage head registry, serialised collective freeze, pre-publication re-check, journaled recovery) and the DRAFT-LINEAGE-1 rules (lineage identity `(documentRef, manifestId, baseHash, manifestBaseHash, production)`, explicit adoption before common succession, forks fail closed, freeze membership with recorded exclusions, host-side provenance journal). Those rules are adopted here by reference and are not restated with different semantics.
4. Two announcements stay separate (B2 §4.5): the DS client binding (lot CL-3) qualifies a candidate capture against a test-double publication authority; a connected-publication claim additionally requires the FE-6 host gate. CL-3 green alone announces at most « concurrent editing client qualified », never « connected publication delivered ».

**Bound-mode notification (settled here).** B2 §5.2 left open whether remote transactions emit `RichTextChangeEvent`. This specification settles it as option (a) of that section: remote-origin document changes in bound mode are surfaced only through capture/readiness — the bound document is the document, the host learns it changed via the binding's session signal and reads it with `captureDocument()` — and no `RichTextChangeEvent` is emitted for purely remote transactions. Local gestures in bound mode keep the existing closed gesture list, with undo/redo driven by the Yjs manager. Rationale: a remote transaction has no single author gesture and may interleave several authors; forcing it into the local gesture shape would define neither its emission nor its provenance. If a future host needs a remote-change notification, FE-2 is amended first with an explicit remote-origin provenance (a new gesture kind or a separate `onRemoteDocument` signal) — that amendment is `unknown` until proposed and is not assumed here.

### 4.8 Schema evolution

- The text schema inside the fragment is the RT-1 P0 profile (`focus.markdown.p0@1`: `paragraph`/`text`/`hardBreak` + `bold`/`italic`/`code`, everything else preserved; FE-2 §6). A live session does not widen it. Lists, headings and other StarterKit constructs become editable only through a new versioned profile (`p1` class) with its own round-trip qualification and, for Focus-bound fields, the FE-2 §6.4 three-condition gate (h2a evolution, new pin, joint witnesses). The two gates (DS list profile for `apiPut` fields; Focus gate for return-bound fields) are not interchangeable (B1 §4.1.2).
- Descriptor evolution follows §7.5 (catalogue major in `catalogId`, per-component `x-sentropic.contract` minors additive within a major). A breaking descriptor change creates `v2` beside `v1`; a renderer refuses an envelope whose contract major disagrees (`unsupported-contract`, never a partial render; `spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:328-335`).
- Representability is evaluated on the merged live content at emission/capture time: two individually representable paragraphs that merge into a non-representable one are flagged once on the result, never blocked at input time and never repaired by a merge step (B2 §4.4, FE-2 §6.6 non-mutating rule). The DS reports `RichTextRepresentability { nonRepresentableParagraphIds }`; the host adapter separately evaluates the pinned Focus checks at export (FE-2 §5.10).

### 4.9 What lives where (DS vs host)

| Concern | DS package | Host |
| --- | --- | --- |
| Model types (`RichTextDocument`, collaboration types of §5.6/§7) | Pure `"."` entry: types + pure helpers only; no Yjs, no ProseMirror, no DOM | Consumes the types |
| Editor binding (ProseMirror ↔ `Y.XmlFragment` sync, undo manager wiring, caret decorations) | `"./editor"` graph only (`editor-collaboration.ts` class module); loads only when a provider is injected | Supplies the fragment/awareness pair (§7.3) |
| Presence/caret rendering (avatars, badge, remote caret/selection decorations with DS tokens) | Renders from injected snapshots and awareness facts; validates caret colour to `#RRGGBB` else `transparent`; labels as text, never markup | Supplies actor facts; decides who may write |
| Local rules (IME-LOCK-1, `editable && !disabled` enforcement, paste refusal, preserved-block guard, representability flagging) | Enforces locally in both modes | Drives `editable` from role/lock/session state; never widens permissions through awareness |
| Transport (WebSocket/SSE), Hocuspocus server, socket lifecycle | None. No socket is opened by DS code (witnessed at runtime, §8) | Owns entirely |
| Persistence (Yjs updates, snapshots, session journal, `LiveDocumentStore` implementation) | None | Owns entirely (§7.4) |
| Auth, membership, agent admission/revocation, publication authority (freeze serialisation, CAS) | None; renders opaque actor identities | Owns entirely |

Importing `"."` or mounting a controlled editor loads no CRDT code (extended RED-P packaging witness, lot CL-3 witness 7). The offline dossier artefact with no provider is byte-identical in behaviour to RT-1.

## 5. AI co-editor channel

Posture (settled, §1.2 Q3): the AI agent is a live co-editor in the same block at the same time as humans — a CRDT participant with presence, not a draft, not a lock holder, not a yielding background process. This section defines how that peer joins, what it may do, and where the DS ends and the host bridge begins. The sentropic dossier's B′ formulation is the host-side shape: « live artifact patchable by MCP » (dossier r4b recommendation B′; `sentropic-input` dossier-r4b.md:9,244) — the artefact stays live and MCP calls patch it, translated into CRDT operations by a host-side bridge. The DS defines the port; sentropic implements the bridge.

### 5.1 Identity, presence and caret

Decision CL-D10 — The agent is `CollaborationActor` with `kind: 'agent'`. `ds-proposition` over B2 §5.1

B2 §5.1 already carries the actor shape this lane needs: `CollaborationActor { actorId, kind: 'human'|'agent'|'nhi', displayLabel, color, activity? }` with `CollaborationActivity { scopeRef, state: 'viewing'|'holding'|'planned'|'yielded', since }`, plus `CollaborationCapabilities { currentActorId, canAcquire, canRequestUnlock, canForceUnlock }` (B2 §5.1, `packages/rich-text/src/collaboration.ts` types). This specification adopts that shape without renaming:

- The host creates the agent actor at session admission: `actorId` is an opaque host/NHI identity, `kind: 'agent'`, `displayLabel` is host-supplied (rendered as text), `color` is host-supplied and validated by the DS to `#RRGGBB` else `transparent` (the caret extension rule, §2.5). The `activity` fact (scope reference, state, since) is present only when the host can prove it (h2a engagement / track scope); the DS invents none (B2 §3.2).
- Presence: the agent appears in the same presence snapshot and the same avatar stack as humans (`PresenceSnapshot { scopeRef, actors }`, current actor excluded by the host, B2 §5.1). A viewer sees that an agent is present and where its caret is; presence confers no right (B2 §5.1 rule: presence is rendering only, `editable` is a separate host decision).
- Caret/selection: in bound mode the agent's caret and selection render through the same awareness decorations as a human's (the `yCursorPlugin` path): a caret element and a selection highlight carrying the agent's label and validated colour. The public component surface exposes users as data (the `collaborationCaret.users` shape); it never exposes a `Y.Doc`, an awareness instance or a socket (B2 §5.1).
- Agent identity in the CRDT: the bridge (§5.3) transacts on the shared `Y.Doc` with a distinct transaction origin per agent actor, so the per-client `UndoManager` scoping (§5.4) and the host journal (§5.8) can attribute operations to that origin. The origin string is host-chosen and opaque; the DS binding forwards it as data and never interprets it.

### 5.2 Edit granularity and limits

Decision CL-D11 — Character/range operations only; whole-block replacement is refused at the bridge. `ds-proposition`

- Granularity: the agent edits by character/range operations on the shared fragment — insert text at a relative position, delete a range, apply marks over a range — the same operation family the sync plugin produces for a human keystroke. The bridge translates each MCP patch into Yjs operations; it never replaces a whole paragraph or a whole field in one operation. Rationale: whole-block replacement would (a) destroy concurrent human characters inside that block (the exact « no lost edit » property L2 is engaged for), (b) bypass the identity discipline (a replacement paragraph would need a fresh `paragraphId`, retiring the identity collaborators' carets and comment anchors point at, §4.2/§3.4), and (c) make per-operation undo (§5.4) meaningless. A structural intent (split this paragraph, delete this block) is expressed as the corresponding structural operation through the same channel, subject to the host policy gate for non-mergeable operations (§5.5).
- Rate and size limits (defaults; host-configurable within the stated ceilings, enforced by the host bridge, witnessed in lot CL-4): at most 20 operations per second per agent actor sustained (burst 40), at most 2000 characters inserted per operation, at most 64 KiB of Yjs update payload per operation, at most 8 concurrent agent actors per document. The DS side of the limit is a pure validator in the `"."` entry (operation shape and size checks over the port types of §5.7) so the same limits are testable without a server; enforcement (counting, throttling, refusal) is host-side because only the host sees the session. A refused operation returns a typed refusal (`rate-limited` / `too-large` / `scope-denied`) to the MCP caller; it is never silently truncated. These numbers are starting budgets derived from the interaction targets of dossier r4b §6 (local response ≤50 ms, ordinary patch ≤250 ms native; `sentropic-input` dossier-r4b.md:621) scaled to stay well under them; they are revisable by measurement at lot start, and §8 requires the revision to be recorded, not silent.
- Scope: the agent's admission names the documents and fields it may edit (the bounded scope of dossier r4b §5: « ses opérations sont admises dans le même flux partagé que celles des humains » inside a bounded scope with provenance). Operations outside that scope are refused at admission of the operation, not filtered after merge. Membership in the session is necessary and not sufficient: each operation is re-authorised (a revoked agent's queued operations never merge; dossier r4b §5 gate « Droits et arrêt de l'agent »).

### 5.3 How agent edits arrive: the host-side bridge

The agent never speaks Yjs directly. The path is:

```
AI (MCP client) ──MCP tool call──► Sentropic host ──► Agent bridge ──► Y.Doc transaction (origin = agent actor)
   (patch by paragraph/range)        (auth, scope,        (validate, rate-limit,
                                      session admission)   translate to CRDT ops)
                                                                    │
Browser editors ◄── Hocuspocus sync (Yjs updates + awareness) ◄─────┘
```

- The MCP surface is host-side (sentropic): tools in the family of the B′ live-artefact patch (create/patch a live artefact by MCP). Concretely the bridge exposes, per live document: read current state (per field, per paragraph, with identities), read awareness (who is present, caret positions as paragraph + offset), and apply a patch (a list of character/range operations addressed by `(fieldKey, paragraphId, relative position or offset range)`). Tool names and the MCP transport are sentropic's to freeze in its implementation lot; the contract that binds the DS is the port and bridge obligations of §5.7. No MCP type enters a DS package.
- Translation: the bridge resolves each addressed range against the current `Y.XmlFragment` (relative positions survive concurrent inserts; a range whose anchor paragraph no longer exists is refused as `target-gone`, never re-anchored by text search — the D13/C4 rule of §4.2). It then applies the operations in one Yjs transaction with the agent origin. That transaction syncs to every replica like a human's.
- Ordering with human input: there is no ordering service and none is needed. CRDT convergence (§4.1) makes concurrent operations in the same range merge deterministically; the bridge does not queue behind human typing and humans do not queue behind the bridge.

### 5.4 How humans see and undo agent edits

- Visibility: agent characters appear in place as they merge, with the agent's caret/selection visible in the same awareness rendering (§5.1). The session journal (§5.8) records which operations arrived under the agent origin, so a human can review what the agent changed after the fact. There is no separate agent draft view and no accept/reject step in the default posture; an explicit suggest mode, if a host offers it, is a host preference layered over the same operations (operations staged outside the shared doc and applied on acceptance), never the DS default and never a replacement for co-editing (dossier r4b §5).
- Undo: each human's undo removes only that human's tracked origins (§4.5). Undoing an agent's edit is therefore not done with a human's undo stack. It is done by an explicit host operation: revert the agent operations in a recorded range/session window (the host mints inverse operations under its own origin, attributed in the journal as a revert of the named agent operations), or request the agent to undo its own last operations (its `UndoManager` scope). The DS editor exposes the gesture (a host-wired command over the §5.7 port); the policy (who may revert an agent) is host authorisation. This separation is deliberate: silently letting one participant's undo delete another participant's merged text would break the undo-isolation property that lot CL-3 witness 2 exists to prove.
- Human edits made on top of agent text are ordinary merged text. Reverting the agent operation underneath them follows CRDT semantics (the inverse operation deletes the agent's characters; the human's concurrent characters remain). The bridge must not implement revert as restoring a snapshot of the block, for the same whole-block reason as §5.2.

### 5.5 Conflict behaviour in the same range

When a human and the agent type in the same range at the same time, the behaviour is merge, not refusal: both character sequences survive, interleaved by the CRDT order, on every replica identically, with no lost edit and no per-keystroke warning (the L2 row of B2 §3.1). Specifically:

- Same word, same moment: neither side is blocked, locked out or warned. The result may read as interleaved text that the participants then repair by ordinary editing — that is the Google-Docs class contract the owner asked for, stated plainly so it is not later misreported as a defect.
- Structural operations are the exception and are governed by explicit host policy, not by merge: paragraph split/merge, block deletion, block type/profile change and preserved-block splice are non-mergeable in the same sense as dossier r4b §5 (« suppression/type/migration de bloc protégés par politique explicite, avec état conservé »). The bridge refuses or serialises them while the target range is under active concurrent edit, with a typed refusal the caller can retry. The default policy is: allow split/merge (they are identity operations, §4.2), refuse block deletion and type migration against a range with unmerged concurrent input, and never let a text undo revert a business transaction (the three-planes rule, §3.3).
- Rights changes are not conflicts: revoking the agent (or a human) mid-session follows IME-LOCK-1 clause (2)/(5) for the editor surface and session teardown host-side (close the socket, stop the bridge actor, re-authorise queued operations). A revoked actor's text already merged stays merged; revocation stops future operations, it does not rewrite history.

### 5.6 What the agent reads

Through the host bridge (never through a DS package), the agent reads: the current document state per field as `RichTextDocument` captures (the same capture shape humans freeze from, §4.7), the awareness snapshot (actors present, caret/selection positions expressed as field + paragraph identity + offset), and the session journal entries for its own operations (accepted/refused with reasons). Reading current state before patching is the intended flow; the bridge may require a state-vector precondition on a patch (the caller names the snapshot it read; if the doc has moved, character/range operations still apply by relative position, while structural operations are refused for re-evaluation). The agent reads no host credential, no other session's journal, and no data outside its admitted scope.

### 5.7 The exact port the DS exposes, and the host bridge contract

Decision CL-D12 — The DS exposes data and capabilities; the host implements transport and the agent bridge. `ds-proposition`, extending B2 §5.1

Pure entry (`packages/rich-text/src/collaboration.ts`, types + pure helpers only; no Yjs type appears here):

```ts
export type CollaborationActorKind = 'human' | 'agent' | 'nhi';
export interface CollaborationActor {
  actorId: string; kind: CollaborationActorKind;
  displayLabel: string; color: string;           // DS validates #RRGGBB else fallback
  activity?: { scopeRef: string; state: 'viewing'|'holding'|'planned'|'yielded'; since: string };
}
export interface CollaborationCapabilities {
  currentActorId: string; canAcquire: boolean; canRequestUnlock: boolean; canForceUnlock: boolean;
}
export interface LockUnitRef { scopeRef: string; unitRef?: string }
export interface LockSnapshot { unit: LockUnitRef; holder: CollaborationActor | null; expiresAt: string | null; unlockRequestedBy?: CollaborationActor | null }
export interface PresenceSnapshot { scopeRef: string; actors: readonly CollaborationActor[] }

// One character/range operation, the agent-edit vocabulary (§5.2).
export type AgentEditOperation =
  | { type: 'insert'; fieldKey: string; paragraphId: string; at: number; text: string }
  | { type: 'delete'; fieldKey: string; paragraphId: string; from: number; to: number }
  | { type: 'mark'; fieldKey: string; paragraphId: string; from: number; to: number; mark: 'bold'|'italic'|'code'; applied: boolean }
  | { type: 'split'; fieldKey: string; paragraphId: string; at: number }
  | { type: 'mergeWithPrevious'; fieldKey: string; paragraphId: string };
export interface AgentPatch { patchId: string; baseStateVector?: string; operations: readonly AgentEditOperation[] }
export type AgentPatchResult =
  | { status: 'applied'; patchId: string }
  | { status: 'refused'; patchId: string; reason: 'rate-limited'|'too-large'|'scope-denied'|'target-gone'|'structural-conflict'|'revoked'; detail?: string };

export interface CollaborationProvider {
  acquireLock(u: LockUnitRef): Promise<{ acquired: boolean; lock: LockSnapshot }>;
  refreshLock(u: LockUnitRef): Promise<LockSnapshot>;
  releaseLock(u: LockUnitRef): Promise<void>;
  requestUnlock(u: LockUnitRef): Promise<LockSnapshot>;
  acceptUnlock(u: LockUnitRef): Promise<LockSnapshot>;
  forceUnlock(u: LockUnitRef): Promise<void>;
  recordPresence(scopeRef: string): Promise<PresenceSnapshot>;
  leavePresence(scopeRef: string): Promise<void>;
  subscribeLock(u: LockUnitRef, cb: (s: LockSnapshot) => void): () => void;
  subscribePresence(scopeRef: string, cb: (s: PresenceSnapshot) => void): () => void;
  openLiveSession?(input: { scopeRef: string; actor: CollaborationActor }):
    Promise<{ kind: 'live-session'; sessionId: string; dispose(): Promise<void> }>;
  // AI co-editor surface (host bridge implements; DS renders the results):
  applyAgentPatch?(patch: AgentPatch): Promise<AgentPatchResult>;
  readAwareness?(scopeRef: string): Promise<PresenceSnapshot>;
}
```

Editor-graph binding (the only Yjs-reachable module, `"./editor"` graph only; framework adapters never receive these objects), as in B2 §5.1:

```ts
import type * as Y from 'yjs';
import type { Awareness } from 'y-protocols/awareness';
export interface LiveSessionBinding { fragment: Y.XmlFragment; awareness: Awareness }
export interface LiveSessionBindingSource {
  resolveBinding(handle: { sessionId: string }): LiveSessionBinding;
  releaseBinding(handle: { sessionId: string }): void;
}
```

Bridge contract (sentropic implements; the DS witnesses it through lot CL-4):

- B-BRIDGE-1. Each accepted patch is applied as Yjs operations in the addressed fragments in one transaction per patch, with the agent actor as origin. Whole-block replacement is not expressible: a patch whose effect is to delete a paragraph's entire text and insert different text in the same patch is refused as `structural-conflict` with guidance to use range operations. (Witnessed by lot CL-4.)
- B-BRIDGE-2. Limits of §5.2 are enforced per agent actor; refusals are typed (`AgentPatchResult`) and journaled. No operation is partially applied: a patch applies whole or refuses whole.
- B-BRIDGE-3. Every operation is authorised against the agent's admitted scope at apply time (document, field, operation family). A socket-level authentication alone does not satisfy this (dossier r4b §5: « une socket authentifiée seule ne prouve pas cette autorisation »).
- B-BRIDGE-4. The bridge serves reads (state capture, awareness) in the shapes above and requires no DS code to run: the same bridge must work with the editor closed (headless agent session), because awareness and state are host-side facts the DS only renders when mounted.
- B-BRIDGE-5. Revocation stops the bridge actor within one operation window: after revocation, `applyAgentPatch` returns `revoked` and no queued operation merges. Already-merged text is untouched (§5.5).

### 5.8 Finding on Q5: per-change attribution is not required (Q5 A stands)

The §1.2 settlement (Q5 A) is conditional on this analysis. The finding is: **per-paragraph attribution in the Focus return is not necessary for any requirement in this lane, and Q5 A therefore stands without a Focus contract change.**

Reasons, each tied to a requirement that might have needed it:

1. Undo isolation does not need return attribution. « My undo never removes your text » is delivered by `UndoManager` origin tracking inside the session (§4.5), which attributes operations by transaction origin at edit time. The frozen return is computed afterwards by diffing the merged result against the baseline (§4.7); nothing in that computation needs to know who typed which character.
2. Review and accountability do not need it in the envelope. The host session journal (B2 DRAFT-LINEAGE-1 (f)) already records, keyed by `returnId`: `sessionId`, the provable participant roster, the head named at freeze, excluded replicas and the capture digest — and this lane adds the per-operation agent record (§5.4). A reviewer can reconstruct « the agent changed these ranges in this session » from the journal plus the Yjs origins, without widening the pinned `FocusReturn` schema (which is closed, `additionalProperties: false`, and carries only `production { producerId, generationId, requestId }` and `scope { workspaceId }`; B2 §4.5). Putting per-paragraph authorship in the envelope would require a Focus evolution with a new pin, engaged separately — cost with no consumer in this lane.
3. Conflict handling does not need it. At freeze, merged text is the joint draft; third-party divergence is defined by lineage, not by authorship (§4.7). Per-paragraph authorship would not change any reconcile outcome.
4. The one case that would need it is named so it can be recognised if it ever becomes a requirement: a regulatory or product rule requiring the published document itself (not the journal) to prove, per paragraph, whether a human or a named agent wrote it, in a form that survives export outside the host. No source in this lane states such a rule (the dossier's provenance gates concern session-level provenance and anchor provenance, dossier r4b §5). If that rule is ever stated, it is a Focus contract evolution plus a host provenance mechanism (Q5 B), to be qualified before any announcement that depends on it — it is not retrofitted into this lane's lots.

## 6. Component API to consume

This section is the surface sentropic migrates to. It replaces `TipTap.svelte` (mounted only at `EditableInput.svelte:679`; `sentropic-input` REPORT.md:44) and the generic part of `EditableInput.svelte` (955 lines: markdown/TipTap, textarea and input modes with autosave, `apiPut`, unsaved store and lock gating). The business wrapper — debounce, `apiPut` payloads, stores, `beforeunload` flush, sibling reassembly, normalisation, citation `[N]` DOM decoration — stays in sentropic (FE-2 §10, B1 P14). The DS supplies the editor and the live binding; the host keeps saving.

### 6.1 The components

Decision CL-D13 — Two DS components cover the editable cards: the card editor and the presence badge. `ds-proposition`

| DS component | Package / entry | Replaces | Notes |
| --- | --- | --- | --- |
| `RichTextEditor` (extended) | `@sentropic/design-system-svelte/rich-text-editor` (subpath; barrel gains no export, FE-2 RED-P) over `@sentropic/design-system-rich-text` `"."` + `"./editor"` | `TipTap.svelte` inside every `EditableInput` markdown mount | RT-1 as built (§2.4) plus the additive collaboration props of §6.2. No fork, no second editor. |
| `LockPresenceBadge` | Svelte adapter beside the editor (subpath or badge slot; lot decides, recorded in the lot report, B2 CB-0) | Sentropic `LockPresenceBadge.svelte` behaviour and the lock half of `EditableInput` gating display | Derives from `LockSnapshot` + `PresenceSnapshot` + injected `CollaborationCapabilities`; every string from injected messages, no `User` fallback (§2.2 of B2). |
| Canvas shell + field cards | DS components (§3.3) composing the two above per `CanvasFieldDescriptor` | `TemplateRenderer` FieldCard composition | Shell is composition, not a new editor. |

Plain fields (the 7 non-markdown `EditableInput` sites: multiline names and single-line industry/workspace) do not go through the rich editor. They re-point at the existing DS `Input`/`Textarea` components (B1 P13); routing them through ProseMirror would lose native form semantics.

### 6.2 Props and events (Svelte surface; other frameworks mirror it by stage gate)

The RT-1 surface is retained verbatim and extended additively. Existing consumers that pass no collaboration prop observe byte-identical controlled behaviour (the no-provider regression, lot CL-2 witness 5).

```ts
// Existing RT-1 (packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.svelte:23-34)
interface RichTextEditorProps {
  value: RichTextDocument;
  editable?: boolean;              // default true; effective = editable && !disabled
  disabled?: boolean;              // default false; wins over editable
  messages: RichTextMessages;      // every label injected; ⟦untranslated:rich-text.<key>⟧ marker
  allocateId?: () => string;       // sole identity source in both modes (B2 §5.2)
  class?: string;
  onChange?: (e: RichTextChangeEvent) => void;          // local gestures only in bound mode (§4.7)
  onExternalConflict?: (e: RichTextExternalConflictEvent) => void;  // controlled mode only
  onUnsupportedPaste?: (e: RichTextUnsupportedPasteEvent) => void;
  onReadinessChange?: (e: RichTextReadiness) => void;
  // ── Additive live extension (this specification) ──
  provider?: CollaborationProvider;          // injected; absent ⇒ controlled mode
  bindingSource?: LiveSessionBindingSource;  // host side of the §5.7 binding; required iff a live session is open
  session?: { scopeRef: string; actor: CollaborationActor };  // opens via provider.openLiveSession
  capabilities?: CollaborationCapabilities;  // badge derivation facts (B2 §5.1)
  onPresenceChange?: (s: PresenceSnapshot) => void;
  onLockChange?: (s: LockSnapshot) => void;
}
// Handle (unchanged): captureDocument(): Promise<RichTextCaptureResult>; readiness(): RichTextReadiness
```

Rules (blocking):

- R-API-1. No prop carries a Focus type, a Track type, a URL, a socket, a Yjs object or a business callback. There is no `onSave`, no autosave, no debounce-to-network semantics in the component (FE-2 §5.5). The host debounces its own reaction to `onChange`.
- R-API-2. Lock state drives the existing props only: `holder === currentActor` → editable; `holder === other` → `editable={false}` with the badge in locked-by-other mode; `holder === null` → host policy (editable with acquire-on-first-gesture, or read-only until acquired). The editor component gains no lock-specific prop beyond the badge inputs, the capabilities and the provider reference (B2 §5.1).
- R-API-3. In bound mode, `value` seeds the session once at mount (through the host seeding of §4.3) and is thereafter the capture surface, not a controlled value the host pushes per keystroke. A host attempt to replace the whole value mid-session means: end the session or surface a session-level conflict — never a silent `setContent` (B2 §4.5). Controlled-mode fields keep the §5.6 echo/defer/conflict/apply discipline exactly.
- R-API-4. `editable={false}` (viewer, locked-by-other, preserved) keeps text selectable/copyable with no mutation path; `disabled` removes focusability; both take effect immediately via `setEditable` without remount, including mid-composition under IME-LOCK-1. A collaboration session never widens permissions: awareness shows who is present, the host decides who may write, the editor enforces `editable && !disabled` locally regardless of what the provider delivers.
- R-API-5. Every label comes from injected messages under the `rich-text.*` / `collab.*` namespaces with the marker form `⟦untranslated:<ns>.<key>⟧` plus `data-untranslated`. Component sources contain no natural-language literal for these strings, including no owner fallback.

### 6.3 The collaboration slot / provider port

The slot is the provider port of §5.7 injected through the props above, with the B2 §5.2 seams made normative for RT-1's successors:

1. Identities declared CRDT-stable (already true of RT-1, §4.2): the allocator injection point is the single identity source in both modes; no code path mints an identity from `crypto.randomUUID()` inside a Focus/live session (the factory default remains for non-Focus hosts only).
2. Capture stays mode-neutral: `captureDocument()` → `{ document, representability }` is the freeze input whichever mode produced it; no consumer may assume consecutive captures differ by one local gesture (witnessed by an external replacement between two captures).
3. The slot exists, empty by default: `"./editor"` accepts an optional collaboration binding at construction and the extension composition is factored so the collaboration pair replaces `UndoRedo` in exactly one place (§4.5). Controlled mode never loads the collaboration graph.

A test double that resolves synchronously from an in-memory map must be sufficient to run every DS collaboration test (the `CommentStore` in-memory-adapter precedent). If a DS test needs a server, the port is wrong (B2 §5.1).

### 6.4 Presence UI

- Badge: overlapping avatars with the owner's avatar ordered as in the sentropic badge (owner last in the stack, key overlay for a requester), the count including the current user while the avatar list excludes them, and the states holder / requester / admin / viewer derived from snapshots plus capabilities (never from snapshots alone). Read-only mode still shows the badge; request-unlock is disabled there and the tooltip omits the request wording (B2 §2.2 measured behaviour, re-expressed with DS tokens and injected messages).
- Carets: remote caret/selection decorations consume `{ actor, color, label }` plus relative positions computed inside `"./editor"`; colours validated to `#RRGGBB` else `transparent`; labels rendered as text. The agent actor renders identically, with its `kind` available to the host's own surrounding chrome (for example an « agent » tag the host draws) but with no DS-invented scope line: `activity` facts render verbatim when supplied and no line renders when absent (B2 CB-0 witness 6).
- Connection state (connecting / live / offline / reconnecting) is host session state rendered in the shell header slot. The DS defines the slot and the message keys; it does not detect connectivity itself.

### 6.5 Parity requirements against the 24 sites

Measured baseline (B1 §2.3, REPORT.md:48): `<EditableInput` occurs 24 times in 10 files — TemplateRenderer 8 (4 text at `:499…`, 4 list `forceList` at `:520…`, inside FieldCards), chat `AppChatPanel` 3 (`:3131/:3228/:3369`), matrix 3, OrganizationForm 2, folder/new 2, folders/[id] 2, InitiativeDetail 1 (plus TemplateRenderer `:135/:270`), ScoreTable 1, dashboard 1 (plus TemplateRenderer `:1266`), WorkspaceSettingsPanel 1. At runtime a templater field renders in exactly one layout branch, so 8 is a source count, not 8 simultaneous editors (B1 §2.6).

Adoption is by field class, in B1 order, and each class is announced by its witnessed state only:

| Class | Sites | DS path | Gate before the class migrates |
| --- | --- | --- | --- |
| Templater text fields | TemplateRenderer 4 text mounts; ScoreTable justification 1 | §6.2 editor in controlled mode first, live mode when the host session exists; host adapter keeps buffers, sibling payloads, normalisation (`normalizeUseCaseMarkdown`), autosave and the representability gate before `apiPut` (a flagged draft is preserved live and never saved-then-remounted) | B1 witness matrix W1/W3/W4/W5 for prose (round-trip byte identity at block level, paste refusal, IME/external-update, lock/theme/locale) + §4.2 identity witnesses |
| Folder context (markdown, non-templater) | folder/new 1, folders/[id] 1 | Same as above | Same |
| Matrix fields | 3 (axis names + level description) | Same; axis names migrate as short markdown fields (B1 §2.8: whether formatting must remain in them is B1 Q-B1-4, still the host's to answer) | Same; the Q-B1-4 answer recorded per field |
| Chat composers / message edit | AppChatPanel 3, host-valued, no `apiEndpoint` | Controlled string surface through the chat shell seam; per-mount inertness preserved exactly (comments composer follows shell `disabled`; edit form imposes none; AI composer stays typeable while sending, B1 §2.7) | Chat witness: Enter/send and mention key forwarding host-side; no autosave migration claimed |
| Plain name/industry fields | 7 (multiline + single-line) | DS `Input`/`Textarea`; measured-width/auto-height sizing and unsaved chrome matched observably host-side | Form witness: sizing, locked inertness, no save before creation on creation pages |
| Templater list fields (`forceList`) | TemplateRenderer 4 list mounts + incidental lists in text | Stay on the sentropic wrapper (or a host list-forcing wrapper) until a DS list profile (`p1`) is qualified on its own corpus; `forceList` never becomes a DS prop (B1 R-B1-3) | W2 list witness under the new profile; Focus-bound list editing additionally needs the FE-2 §6.4 gate. Until then the observable narrowing (lists visible, preserved, not editable) is stated per field, never shipped silently |
| Citations `[N]` | Decoration over templater/chat text | Host decoration outside the ProseMirror document (rendered-output transformation recomputed per render; never a DOM mutation of editor nodes, B1 §4.1.1) | Decoration witness (decorate → type around it → capture → remount, wire byte-identical). Stability is `unverified` (U-B1-7) until it runs |

Two cross-cutting parity rules: (a) the differential witness is black-box (public surfaces only, expected outcomes as data, three scenario classes parity/divergence/DS-only per B1 §4.2) — no sentropic source is imported or snapshotted; (b) the two Markdown bridges differ (`tiptap-markdown ^0.9.0` host-side vs `@tiptap/markdown 3.32.0` DS-side), so round-trip equivalence on real content is `unverified` (U-B1-2) until the W1 corpus runs. A DS-only green never announces Focus agreement, list editing or full adoption (B1 R-B1-6).

## 7. Interfaces for sentropic

This section is written so the sentropic host can be implemented against it without reading the DS rationale. Where this section and a DS-internal section disagree on a name, this section prevails for implementers and the disagreement is a defect to fix in the DS text.

### 7.1 Component API (consume these)

- Editor: `@sentropic/design-system-svelte/rich-text-editor` (default export `RichTextEditor`), props and handle exactly as in §6.2. Consume `RichTextDocument` / `RichTextChangeEvent` / `RichTextCaptureResult` / `RichTextMessages` from `@sentropic/design-system-rich-text` (the `"."` entry). Do not import `@sentropic/design-system-rich-text/editor` from application code; that entry is for the adapter and for headless factory use in tests.
- Badge: `LockPresenceBadge` (path fixed by the CL-1 lot report) with inputs `lock: LockSnapshot`, `presence: PresenceSnapshot`, `capabilities: CollaborationCapabilities`, `messages` (collab catalogue) and callbacks `onRequestUnlock`, `onAcceptUnlock`, `onForceUnlock`, `onReleaseLock`. Render it in the page header / canvas shell header; it owns no data fetching.
- Descriptor: `CanvasTemplateDescriptor`, `CanvasFieldDescriptor`, `CanvasCapabilities` from the DS contract package (path fixed by the CL-0 lot report; generated catalogue JSON at `@sentropic/design-system-elements/catalog.json` once L1 lands, schemas under `schemas/`). Pin the exact version (§7.5).

### 7.2 Collaborative document model types (implement against these)

From `@sentropic/design-system-rich-text` `"."`: `RichTextDocument`, `RichTextBlock`, `RichTextFormat`, plus the collaboration types of §5.7 (`CollaborationActor`, `CollaborationCapabilities`, `LockUnitRef`, `LockSnapshot`, `PresenceSnapshot`, `AgentEditOperation`, `AgentPatch`, `AgentPatchResult`, `CollaborationProvider`). The host treats `paragraphId` values as opaque, allocates split-tail identities through the injected `allocateId` (collision-free across sessions), and never derives identity from order, offset or hash. The shared-state shape is §4.3: one `Y.Doc` per artefact (`canvas:<artifactId>`), one `Y.XmlFragment` per editable field key, paragraph elements carrying the `paragraphId` attribute. The host seeds fragments from the retained baseline at session open and never reseeds mid-session.

### 7.3 Provider port (implement this host-side)

Implement `CollaborationProvider` (§5.7) over your own transport:

- L0 methods (`acquireLock` … `leavePresence`, `subscribe*`) over the existing sentropic API: `GET/POST/DELETE /api/v1/locks`, `request-unlock`/`accept-unlock`/`force-unlock`, `presence` record/list/leave, notified through the existing `/streams/sse` `lock_update`/`presence_update` channel (B2 §2.2; client starting point `ui/src/lib/utils/object-lock.ts`). Badge snapshots you feed the DS must be host-authoritative; the DS renders them and grants nothing itself.
- `openLiveSession({ scopeRef, actor })`: create or join the session for `scopeRef`, return `{ kind: 'live-session', sessionId, dispose() }`, and register the `LiveSessionBindingSource` that resolves that `sessionId` to `{ fragment, awareness }` for each editable field. A handle that resolves to no binding, or to a binding for a different field, is a conformance failure (lot CL-3 witness 8). `dispose()` leaves presence, closes the local binding and does not delete host-persisted state.
- `applyAgentPatch(patch)` / `readAwareness(scopeRef)`: the bridge surface of §5.7 (B-BRIDGE-1…5). Implement throttling and per-operation authorisation there; return typed refusals, never partial application.

### 7.4 Persistence contract (the `LiveDocumentStore` replacement)

Decision CL-D14 — The stub is replaced by a host implementation behind the DS port; no DS store exists. `conductor-decision` (Q4 A)

The sentropic host implements, in its own storage (Postgres/DB of its choosing; the DS prescribes no schema):

1. **Live document store.** Per session document (`canvas:<artifactId>`): the Yjs update log and periodic snapshots (`Y.Snapshot` + state vector) sufficient to rebuild the doc after restart, plus the artefact's retained baseline link (`documentRef`, `baseHash`, `manifestBaseHash`, lineage head at open, §4.7). Rebuild after restart must reproduce the doc exactly (snapshot + journal replay), witnessed by kill/restart in lot CL-5.
2. **Session journal.** Per `returnId` (and per session before any freeze): `sessionId`, lineage identity, head named at freeze, provable participant roster (including agent actors and their origins), excluded replicas at freeze, capture digest, and the per-operation agent record (patch id, origin, applied/refused with reason, revert links). The journal is the provenance record of §5.8; the Focus envelope is not extended.
3. **Publication authority.** The freeze/CAS discipline of §4.7 (serialised collective freeze per lineage, pre-publication re-read, pure `reconcile()`, atomic publish only on `ok`, journaled pending freeze with fsync + atomic commit of manifest/lineage/receipt, idempotent replay reporting `already-processed`). This is FE-6 host work; the DS client gate (CL-3) does not substitute for it.
4. **Atomic save control for `apiPut` surfaces.** The §2.2-of-B2 check-then-write gap is closed host-side: the save transaction re-checks lock ownership and the expected version/base and writes conditionally, refusing with a conflict when either no longer matches. Without it, a late save after lock expiry silently overwrites (B2 CB-2 discriminating witness). No Focus reconciler exists on that path to catch it instead.

Hocuspocus is the reference host for the first session (Q4 A): self-hosted `@hocuspocus/server` behind sentropic auth/workspace checks (`onAuthenticate` is where membership is verified; the DS never asserts identity), with its `Database` extension (or the host store above) behind `onLoadDocument`/`onStoreDocument`. A hand-rolled WebSocket/SSE+POST provider that satisfies the same port and witnesses is equally conforming; the DS gate requires a real Hocuspocus-backed witness alongside the test double (lot CL-3 witness 8) so interchangeability is proven, not asserted.

### 7.5 Comment presentation join (implement this)

Per §3.4: map each canvas field to `CommentTarget { kind: 'canvas', id: artifactId, sectionKey: field.sectionKey }` using the frozen sentropic v1 contract; render threads through the DS comment blocks (`CommentListItem` et al. of `SPEC_EVOL_DS_COMMENT_ANNOTATE_BLOCKS.md`) with the opaque `anchor` specialised at your composition site. Surface the annotations resolver outcome (exact / changed / unresolved / unavailable) in the DS rendering; do not reattach by text search. No DS package will import your comment model, and your model needs no change for canvas.

### 7.6 MCP bridge for the AI co-editor (implement this)

Expose host MCP tools (names yours to freeze) providing, per live document: `read state` (per-field `RichTextDocument` captures with identities), `read awareness` (`PresenceSnapshot` in the §5.7 shape), and `apply patch` (`AgentPatch` → `AgentPatchResult`). Enforce §5.2 limits and §5.7 B-BRIDGE rules in the bridge. The DS-side pure validator for patch shape/size ships in the `"."` entry so client and bridge check the same limits; counting/enforcement is yours. Agent admission (which agent actor, which documents/fields, which operation families) is your auth decision, recorded in the session journal.

### 7.7 Versioning and pin discipline

- DS packages are pinned exactly (no ranges) by every host: `@sentropic/design-system-rich-text`, `@sentropic/design-system-svelte` (including the `rich-text-editor` subpath), and the elements/catalogue package once published. A pin bump is a reviewed change with the lot witnesses for the changed surface re-run; hosts do not float on `^` for the editor or the descriptor (the catalogue major rule of §4.4/§5.4 of JSON-render: same-major minors additive, cross-major refused).
- The descriptor/catalogue contract versions by `catalogId` major + `x-sentropic.contract` minor (§4.8). A breaking norm change ships `v2` beside `v1`; sentropic migrates descriptors explicitly and the old major's fixtures stay runnable until migration completes. This is format versioning, not a legacy dual-norm: the DS remains the single source for both majors during the window, and the window closes by deletion of the migrated sentropic copies (§3.6), never by keeping two definitions of the same major.
- Yjs/binding pins (`yjs`, `y-protocols`, the ProseMirror binding line, Tiptap collaboration extensions) are pinned in the DS lockfile at the CL-3 lot with `LICENSE.THIRD-PARTY.md` regenerated in the same change; sentropic's Hocuspocus pins are host lockfile facts, recorded in the CL-5 report. No pin is assumed from this specification's candidate versions (§4.1) without the lot's own measurement.

## 8. Lots, gates and acceptance

This section replaces B2's CB-0..CB-4 for this lane. CB-0/CB-1 work that is already on the critical path is carried into CL-1/CL-2 with its witnesses intact; CB-2's host prerequisite is carried into CL-5; CB-3 becomes CL-3/CL-4/CL-5 with the AI channel added; CB-4D becomes CL-6D; CB-4S is not carried (Q-JOINT-1 out of scope, §1.2). L1-for-text appears in no lot (Q2 A). Order is normative: a later lot never compensates for an earlier gate that failed. Every lot is RED-first (witnesses written and observed failing for the stated reason before implementation), uses targeted test runs per repo convention (the conductor runs the full suite at integration), and uses no Python. Canvas-norm contract lots (CL-0) are independent of the L2 binding and may run before it; the lane gate (after M1-b, §1.1) orders CL-3 onward.

Estimates are relative sizes at specification time (S ≈ one focused lot-week class, M ≈ two to three, L ≈ four plus), stated to order the work, not as commitments. Each lot re-estimates at start from its own file count.

### CL-0 — Canvas norm contract (descriptor, fixtures, catalogue projection)

Depends on: JSON-render L1 generator availability (or a minimal generator in this lot if L1 has not landed; recorded either way). Blocks: CL-1 announcements about the norm; sentropic N1/N2 adoption. Size: S.

- Files (DS): `[N]` descriptor types + validator + the two seed fixtures (§3.2, R-DESC-1) in the framework-neutral contract location; catalogue generation for the canvas entries; `[N]` fixture and validator tests. Sentropic (adoption, separate host change): catalogue imports the pinned DS descriptor; seeds read from DS fixtures.
- RED witnesses: (1) both seed fixtures byte/deep-equal the sentropic sources (§3.6 N1/N2); (2) a descriptor with a `profile`/`mimeType` family disagreement is refused with the JSON-render diagnostic shape (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:339-353`); (3) the generated catalogue entry and the standalone schema agree after canonical sorting (the JSON-render §5.2 test) and carry the canvas contract under `x-sentropic.contract`; (4) a consumer importing only the pure entry loads no editor runtime (RED-P half).
- Gate: targeted DS tests green with output; NORM-G steps 1–3 witnessed for N1/N2 (publication itself is a release act recorded separately). Announced exactly as: « canvas norm contract published; sentropic adoption pending » until §3.6 step 4 (deletion) lands, then « norm transferred for N1/N2 ».

### CL-1 — Collaboration model and badge (L0 protocol, pure entry + Svelte)

Depends on: RT-1 (present on main, §2.4). Blocks: CL-2. Size: M. (Carries B2 CB-0.)

- Files: `[N] packages/rich-text/src/collaboration.ts` (the §5.7 types plus pure helpers: expiry evaluation against an injected clock, badge state derivation, colour validation, patch shape/size validator), `[N] packages/rich-text/src/collaboration.test.ts`; `[N] packages/components-svelte/src/lib/presence-badge/LockPresenceBadge.svelte` (+ test), message keys under the `collab.*` namespace.
- RED witnesses (B2 CB-0, retained): (1) badge derives holder/requester/admin/viewer states from snapshots plus injected `CollaborationCapabilities` and the current actor — the same snapshot renders differently for viewer/editor/admin; no snapshot, no badge lock state; (2) an expired lock renders as no lock (pure TTL evaluation, never `Date.now()` inside the helper); (3) every visible string comes from injected messages with the `⟦untranslated:collab.<key>⟧` marker and zero built-in literals, including no `User` fallback (sentinel render + source scan); (4) colour outside `#RRGGBB` falls back, labels render as text with markup inert; (5) an in-memory provider double drives acquire → request → accept (holder transfer) → force, with badge state asserted at each step and no network/socket/timer in the DS test; (6) an `kind: 'agent'` actor with a host-supplied `activity` renders its scope/state/since verbatim, and an actor without `activity` renders no scope line.
- Gate: targeted pure + jsdom tests green with output; licensing guard green (no new publishable package); `pack:smoke` extended only if a new subpath ships. Stage announcement per B2 §5.3 (« presence and object locking available (Svelte); concurrent editing not included »).

### CL-2 — Editor integration of L0 and the live seams (with the RT-1 successor)

Depends on: CL-1. Blocks: any host adoption claim. Size: M. (Carries B2 CB-1 + the §6.3 seams.)

- Files: adapter surface of §6.2 (provider/badge composition beside the editor), the three seams recorded as an FE-2 delta note (identity discipline, mode-neutral capture, empty provider slot in `"./editor"`).
- RED witnesses (B2 CB-1, retained): (1) lock held by another ⇒ typing, paste, drop, cut and mutation shortcuts inert, no `onChange`, text still selectable (viewer fixture under lock); (2) acquiring the lock flips to editable without remount (same ProseMirror instance, caret/selection preserved); (3) W-IME-1 verbatim (IME-LOCK-1, browser suite); (4) capture neutrality only: an external document replacement between two captures yields a second capture equal to the replacement; (5) no provider ⇒ byte-identical controlled behaviour to RT-1 without this lot.
- Gate: jsdom + browser suites green with these witnesses; offline dossier configuration asserted provider-free.

### CL-3 — L2 binding: Yjs session behind the provider slot

Depends on: CL-2, FE-3 freeze bridge green (host-side), the §4.4 preserved-block gate decision. Blocks: any « concurrent editing » announcement. A connected-publication announcement additionally requires the FE-6 host gate (CL-5). Size: L.

- Files (DS): `[N] packages/rich-text/src/editor-collaboration.ts` (the only Yjs-reachable module, `"./editor"` graph only; holds the `LiveSessionBindingSource` contract), extension composition change (collaboration pair replaces `UndoRedo` when bound), caret/selection decoration rendering with DS tokens; pins added (`yjs`, `y-protocols`, binding line of §4.1) with lockfile + notices regenerated in the same change (`npm run notices:generate`; licensing guard and `pack:smoke` wiring for every new entry/peer, §8.6).
- RED witnesses (B2 CB-3 witnesses 1–8, retained and renumbered here as the DS client gate): (1) **multi-client convergence + no lost edit in the same word:** two sessions on one fragment type into the same paragraph — including the same word — concurrently ⇒ after quiescence both texts are present on both replicas, the `paragraphId` set is unchanged except allocator-fresh split tails, and no id collides across sessions; (2) **undo isolation:** split/merge/undo interleaved with remote edits ⇒ undo removes only local changes, identities restored per §4.2; (3) **preserved-block gate:** a preserved-bearing field through arbitrary merges keeps every `raw` byte-identical, else the field refuses bound mode; (4) **freeze bridge:** capture ⇒ host `diffParagraphs` against the retained baseline yields exactly the merged delta, undo-to-baseline yields the empty cumulative return, the baseline is never advanced by the session; (5) **IME:** a remote update mid-composition ⇒ no mid-composition emission, one coalesced commit change, caret stable (browser suite), and a session revocation mid-composition follows IME-LOCK-1; (6) **read-only bound session** renders remote updates with all local mutation paths inert; (7) **packaging:** importing `"."` or mounting controlled loads no Yjs module (extended RED-P), and the offline artefact with no provider behaves byte-identically to CL-2; (8) **provider conformance with a real witness:** the same binding runs against (i) a Hocuspocus-backed host provider and (ii) an in-memory test-double provider, both resolving the §5.7 binding for the requested field and failing closed on a handle bound to a different field. The test double alone never passes this gate.
- Gate: witnesses 1–8 green with output in jsdom + browser suites (DS client qualification); `pack:smoke` and licensing green at the new dependency set. Announcement: « concurrent editing client qualified where the host provides a collaboration session; offline dossiers unchanged ». Performance budgets (§8.5) measured and recorded at this gate.

### CL-4 — AI co-editor channel (agent as peer)

Depends on: CL-3 (DS client gate). Blocks: any « AI co-edits live » announcement. Size: M.

- Files (DS): the `AgentEditOperation`/`AgentPatch` validator in the pure entry (shape/size/scope vocabulary), agent presence/caret rendering assertions, the revert-gesture surface over the port. Files (host, sentropic): the MCP tools and bridge (§7.6), per-operation authorisation, throttling, journal records.
- RED witnesses: (1) **agent + 2 humans in one block:** two human sessions and one agent actor insert/replace simultaneously in the same identified block ⇒ all replicas converge after quiescence with no silent loss and no whole-block replacement wiping concurrent human characters (the dossier r4b L2-CB3 same-block gate); (2) the agent's caret/selection and presence render for humans, and the agent reads awareness + current state through the bridge before patching; (3) a patch attempting whole-block replacement is refused `structural-conflict` and applies nothing; (4) limits: the 21st sustained operation in a second, an insert over 2000 characters, and an out-of-scope field each refuse with their typed reason and apply nothing; (5) a human revert of a recorded agent window removes the agent's characters and preserves concurrent human characters on top of them; a human's ordinary undo never removes agent text; (6) revocation: after the agent actor is revoked, its next patch returns `revoked`, queued operations do not merge, and already-merged text is unchanged.
- Gate: DS witnesses green against both the test double and the Hocuspocus-backed host, with the bridge running headless (editor closed) for at least the read/patch witnesses. Announcement: « AI co-editor qualified in the same block (bounded scope) » naming the scope; never an unbounded agent claim.

### CL-5 — First host adoption and connected publication (sentropic)

Depends on: CL-3, CL-4 for the AI claim. Owner: sentropic host lot (FE-7 sibling), not a DS-only claim. Size: L (host) + S (DS support).

- Scope: provider implementation over the sentropic locks/presence API and SSE channel; Hocuspocus hosting behind sentropic auth; the §7.4 store, journal and publication authority; the §7.4 atomic save control; DS badge replacing the local badge behind a parity checklist (avatar ordering, key overlay, read-only tooltip wording, force inside tooltip); field-class migration of §6.5 in B1 order.
- RED witnesses (host-side; B2 CB-2/CB-3 host witnesses retained): stale badge after SSE drop recovers by re-read; **expiry discriminating witness** (writer A's lock expires, writer B acquires and saves V2 and releases, then A's late save with its stale expected version is refused by the atomic save control and V2 remains — the form that fails against the current guard, which passes a save when no lock is active); **reconnect after offline edits** (a roster participant disconnects, edits offline, the connected converged replicas freeze and publish meanwhile with the disconnected member recorded as excluded, and on reconnect its edits re-enter as a merged state followed by adoption and a re-freeze against the new head — never as a second return on the old head); collective-freeze serialisation, demonstrated-ancestry (not delivery-order), external-change-between-freeze-and-publication, and the W-LIN-1/2/3 lineage witnesses of B2 CB-3 (adoption keeps both corrections; stale omission refused before minting; independent lineages fail closed) against the host publication authority; kill/restart rebuild of the live doc from snapshot + journal.
- Gate: host targeted tests green with output; DS packages unchanged unless a CL-1..CL-4 defect is found (then fixed in its own lot, never patched host-side). Announcements follow §4.7: « connected publication delivered » only when this gate including FE-6 is green, per host, never globally.

### CL-6D — Diagram arbitration surface

Depends on: CL-1 (shared model). Independent of CL-3. Size: M. (Carries B2 CB-4D; Q6 A, §1.2.)

Claim rendering on element selection, holder highlight, `editable` arbitration for the claimed unit, badge composition in the surface header. Diagram refs cross as opaque strings; no `diagram-core` import from any DS collaboration code (layering guard `scripts/verify-layering.test.mjs`). RED witnesses: claim by another ⇒ unit non-editable locally with holder shown; expiry releases without a server push; force-release admin path; presence without claim leaves editing untouched. Announced as arbitration/presence only — never as merged concurrent editing.

Sequencing summary: CL-0 (norm contract) may start first and in parallel with the lane gate. CL-1 → CL-2 form the L0 delivery. CL-3 is the only L2 binding lot; CL-4 adds the agent as peer; CL-5 is the first host adoption and the only route to a connected-publication claim. CL-6D runs parallel to either stage. No lot delivers L1-for-text, merged diagram editing or spreadsheet collaboration.

### 8.5 Performance budgets

Budgets are targets to measure at the named gate, not claims (B2 §9 item 12 posture, now made concrete as the commission requires). Measured on the lot's recorded fixture hardware with at least 30 repetitions per scenario, errors/cache/payload/host published with the numbers (the dossier r4b §6 measurement discipline, `sentropic-input` dossier-r4b.md:621-623):

| Budget | Target | Gate |
| --- | --- | --- |
| Local keystroke → local render (bound mode, 3 participants) | p95 ≤ 50 ms | CL-3 |
| Remote operation → visible on a second client (same host, LAN-class) | p95 ≤ 250 ms | CL-3 (Hocuspocus witness) |
| Agent patch (≤20 ops) → merged and visible | p95 ≤ 250 ms | CL-4 |
| Reconnect with a bounded offline backlog (≤500 queued ops) → converged | ≤ 2 s | CL-5 |
| Presence/caret update propagation | p95 ≤ 250 ms, awareness payload per update ≤ 4 KiB | CL-3 |
| Document size envelope for the live path | Fragment ≤ 2000 paragraphs, doc state ≤ 5 MiB; beyond it the host falls back to controlled mode with the reason surfaced | CL-3 (refusal witnessed, not silent) |

A missed budget blocks the announcement it is attached to; it does not block the correctness gate, and the miss is recorded with its measurement rather than retuned silently.

### 8.6 Security and licensing (every lot)

- Auth stays host: the DS stores and renders opaque actor facts only and never asserts identity. A forged « you hold the lock » snapshot can at most make a field typeable locally; publication still passes the host mutation guard and the FE-6 reconciliation (B2 §4.7). No secret, token or credential enters a DS package, a descriptor or a fixture; the BPMN watermark licence value likewise never reaches the browser (JSON-render §13) and no lot in this lane touches it.
- Agent permission scope: admission names documents/fields/operation families; every operation is re-authorised at apply time; revocation is witnessed (CL-4 witness 6, CL-5). Awareness data is display data; the one injectable value the DS renders (caret colour) is validated, and labels render as text, never markup. Pasted or merged content stays inert under the P0 profile in both modes; collaboration adds no HTML-rendering path.
- Licensing: every new dependency is MIT at the pinned version (§2.5). Each lot that adds one regenerates `LICENSE.THIRD-PARTY.md` (`npm run notices:generate`), keeps `scripts/verify-publishable-licensing.mjs` green (including its publishable-count assertion when a package flips), and wires `scripts/smoke-pack.mjs` (`packages` entry + `deepVerify` closure/peers) for every new entry or peer in the same change. Behavioural reference versus code reuse follows the owner rule cumulatively: consuming a public API is ordinary dependency use; copying or adapting any file from another repository requires both a compatible licence and recorded owner agreement per file, stated in the lot report. LGPL code enters no MIT DS package. No Tiptap Pro, no Tiptap Cloud, no hosted CRDT SaaS is a required dependency at any lot; the DS remains fully functional with a self-hosted provider, and the test double qualifies the client binding only where §8 says so.

## 9. Remaining owner questions

Only what neither the sources nor the decisions of §1.2 settle. Each question blocks only the lot named; the rest proceed. Technical choices are decided in the body with rationale and are not listed here.

**Q-CL-1 — Structured canvas fields (`application/json`, the `structured-plan` shape): merge strategy when they leave the host business surface?**
Context: §4.3 R-MAP-4 keeps structured fields on host business transactions today. If a future canvas needs concurrent structured editing, the mechanism is open.
- A. Keep structured fields host-merged permanently; this lane never CRDT-merges JSON structure. *(Recommendation — smallest scope; the text lane already covers the owner's statements, which concern text blocks.)*
- B. Add a later DS study for `Y.Map`/`Y.Array` structured merge with its own identity and conflict rules.
Blocks: nothing in §8. Recorded so the R-MAP-4 boundary is a decision, not an omission.

**Q-CL-2 — May an agent actor hold the L0 lock on an object, in a host that still runs L0 surfaces beside live ones?**
Context: §1.2 Q3 supersedes the agent-as-lock-holder posture for live blocks, but L0-only surfaces (whole-object locked records) still exist during migration. The DS renders either fact; who may hold a lock is a host policy the owner may want to fix once.
- A. No: agents never hold L0 locks; they edit only through live sessions, and L0 surfaces show agent activity as presence (`activity: planned/holding`) without lock ownership. *(Recommendation — one posture across surfaces.)*
- B. Yes, where the host chooses: an agent may acquire the same L0 lock as a human, with the same request/force vocabulary.
Blocks: CL-5 host policy only.

**Q-CL-3 — React/Vue/Angular timing for the live components?**
Context: FE-2 stages frameworks (Svelte first, each adapter behind its own RED run and vertical scenario, parity never claimed from types). The live extension multiplies that cost per framework (binding + caret decorations).
- A. Svelte only for the whole lane; other frameworks staged afterwards by demand, each behind its own gate. *(Recommendation — follows the measured consumer set: both current consumers are Svelte, §2.4.)*
- B. Commit now to a named second framework and its gate inside this lane.
Blocks: nothing; the answer only schedules work.

## 10. NOT covered

Each item is explicitly excluded from this specification and from every lot it defines. Announcing any of them as delivered under this specification is a scope breach.

1. **Any server in the DS.** No Hocuspocus, WebSocket, SSE or persistence code in any DS package; no DS-hosted document service; no Tiptap Cloud or Pro dependency (§8.6).
2. **Block-level text locks (L1).** Not built (Q2 A, §1.2). No exclusive-block guarantee is offered for text.
3. **Merged concurrent diagram editing.** No concurrent dragging or geometry merge; diagrams receive arbitration and presence only (CL-6D).
4. **Spreadsheet collaboration.** Owned by B3 under Q-JOINT-1, not carried here. The shared lock/presence contract remains available to B3; this specification designs no cell/range claim, no grid merge and no sheet surface.
5. **Structured (`application/json`) CRDT merge.** Structured canvas fields stay on host business transactions (R-MAP-4) unless Q-CL-1 B engages a separate study.
6. **The h2a Focus contract.** No change to the return envelope, manifest, diff, reconciler, digests, lineage or schemas; no new Track event kind; per-paragraph attribution only through the Q5 B path of §5.8, which this lane does not engage.
7. **`LiveDocumentStore` as a DS artefact.** The replacement is a host implementation behind the DS port (§7.4). The DS ships no store.
8. **The full `SPEC_VOL_INTERACTIVE_CANVAS` programme.** Kanban-as-canvas (I4), dossier-as-canvas beyond the FE-2 editor surface (I5), CLI surfacing (I3) and the reusable sentropic canvas module (I6) are separate promotions. This lane covers the editor collaboration layer they would share and the canvas norm contract, not their surfaces.
9. **Comment/annotation model changes.** Anchors, threads and the annotations resolver are consumed as-is (§3.4, §7.5).
10. **Identity, authentication and membership.** Host-owned in every lot; the DS stores and renders opaque actor facts only.
11. **Offline multi-writer return merging.** Merging two independently produced offline returns remains the reconciler's job (rebase/conflict at the host boundary), not a CRDT merge; the `file://` dossier stays single-user.
12. **Chat component migration.** No chat component is defined or frozen here (§2.7). Chat editable mounts migrate as editor consumers (§6.5) without a chat API claim.
13. **List/heading editing beyond P0.** Preserved until the versioned-profile route of §4.8 passes; `forceList` fields stay wrapped (§6.5).
14. **Framework delivery beyond Svelte.** React/Vue/Angular live adapters are staged by their own gates (Q-CL-3); until a gate passes, that framework is reported as not delivered for live editing.

## 11. Unverified register

Claims this specification depends on but could not verify from the sources available to it. Each names where it must be settled. Nothing in §§3–8 silently assumes the favourable answer.

| # | Item | Tag | Settled where |
| --- | --- | --- | --- |
| U-CL-1 | `y-protocols` (awareness) source and exact version: not vendored in `.ds-scrap/re-sources/`, observable only through its consumers (B2 §2.7) | `source-gap` | CL-3 pins it explicitly and records the version; the binding lot fails if the awareness API differs from the assumed `Awareness` shape |
| U-CL-2 | `y-websocket` / `y-indexeddb`-class provider and local-persistence packages: not in the pinned set | `unknown` | Host lots pin them if chosen; the DS never depends on them |
| U-CL-3 | Registry state of `@sentropic/design-system-rich-text` and the `rich-text-editor` subpath (REPORT measured them unpublished at 0.36.0-era) | `source-gap` | Re-measured at CL-1/CL-3 lot start; publication is a release act, not assumed |
| U-CL-4 | Whether preserved-bearing fields can stay byte-identical through arbitrary merges (the §4.4 gate) | `unknown` | CL-3 witness 3; a negative result permanently scopes those fields to controlled/L0 mode |
| U-CL-5 | Exact `@tiptap/starter-kit` default set behind the sentropic editor and the finer parity claims that depend on it (B1 U-B1-1); round-trip equivalence of the two Markdown bridges on real content (B1 U-B1-2); stability of literal `[N]` citation text across host decoration (B1 U-B1-7) | `source-gap` / `unverified` | B1-L0 corpus and the §6.5 witnesses; no finer parity is claimed before they run |
| U-CL-6 | Legal templater descriptor vocabulary as stored server-side (B1 U-B1-3) and whether stored content already needs headings/lists editable (B1 U-B1-4) | `source-gap` / `unknown` | Host inventory at the CL-5 adoption lot; decides migration order and any `p1` profile need, not the P0 profile |
| U-CL-7 | FE-3 qualification state at the time CL-3 starts (FE-3 was not qualified at the B2 pin) and the FE-6 host gate's own witnesses | `unknown` | CL-3 depends on the freeze bridge being green; CL-5 carries the FE-6 witnesses. Client qualification never substitutes for either |
| U-CL-8 | Performance numbers of §8.5 on real host hardware and real document sizes | `unknown` | Measured at the CL-3/CL-4/CL-5 gates with the recorded discipline; budgets are targets until then |
| U-CL-9 | Sentropic server-side enforcement behind the standalone settings/chat saves that show no client lock (B1 U-B1-5), and the final MCP tool names/shape for the bridge | `unknown` | Host confirms at CL-5; the DS contract (§7.6) binds shapes, not tool names |
| U-CL-10 | Whether any host needs the remote-change notification that §4.7 defers (capture-only is the settled default) | `unknown` | Only an FE-2 amendment with explicit remote-origin provenance settles it; until then bound mode emits no remote `RichTextChangeEvent` |

## Appendix A. Decision index

| Id | Decision | Tag | Section |
| --- | --- | --- | --- |
| CL-D1 | DS is the source of truth for the canvas norm; sentropic consumes and deletes duplicates | `owner-decision` + `conductor-decision` | §3, §3.6 |
| CL-D2 | One DS descriptor absorbs `CanvasEntry`/`CanvasTemplate` and both seeds | `ds-proposition` | §3.2 |
| CL-D3 | Canvas UI = JSON-render L2 elements + the §6 editable-card surface | `ds-proposition` | §3.3 |
| CL-D4 | Annotation model stays sentropic; presentation is DS (G3) | `owner-decision` G3 | §3.4 |
| CL-D5 | Hosting stays sentropic; only the contract moves | `conductor-decision` | §3.5 |
| CL-D6 | Keep Yjs + y-prosemirror; Hocuspocus host-side only | `ds-proposition` | §4.1 |
| CL-D7 | `paragraphId` is the block identity in both modes | `h2a-spec` | §4.2 |
| CL-D8 | One `Y.Doc` per artefact, one `Y.XmlFragment` per editable field | `ds-proposition` | §4.3 |
| CL-D9 | Yjs `UndoManager` replaces ProseMirror history in bound mode, exactly once | `ds-proposition` | §4.5 |
| CL-D10 | Agent actor is `CollaborationActor kind: 'agent'` with presence and caret | `ds-proposition` | §5.1 |
| CL-D11 | Character/range operations only; whole-block replacement refused at the bridge | `ds-proposition` | §5.2 |
| CL-D12 | DS exposes the §5.7 port; sentropic implements transport and the MCP bridge | `ds-proposition` | §5.7 |
| CL-D13 | `RichTextEditor` (extended) + `LockPresenceBadge` replace the editable cards | `ds-proposition` | §6.1 |
| CL-D14 | `LiveDocumentStore` stub replaced by the §7.4 host implementation; no DS store | `conductor-decision` | §7.4 |

Settled B2 questions (not reopened): Q1 L2 engaged now; Q2 A; Q3 superseded (agent as live co-editor); Q4 A; Q5 A (finding §5.8); Q6 A; Q7 A; Q-JOINT-1 out of scope. See §1.2.

## Appendix B. Evidence ledger for implementers

- Norm on paper: `spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md:50-61` (option E), `:373-425` (catalogue), `:673-683` (envelope), `:1379-1380` (lots L1/L2/L8). Category L1 = catalogue, L2 = elements, L8 = envelope.
- Descriptor sources: `sentropic:api/src/services/catalog/types.ts:154-194`; seeds `sentropic:api/src/services/catalog/sources/canvas-template-source.ts:52-89`; kind-only ruling `sentropic:spec/SPEC_EVOL_CATALOG.md` §2.4 (D-CANVAS).
- Comment join: `sentropic:packages/comments/src/types.ts:11-51`; presentation boundary `spec/SPEC_EVOL_DS_COMMENT_ANNOTATE_BLOCKS.md:31-51`.
- Editor as built: `packages/rich-text/package.json`; `packages/rich-text/src/model.ts:5-134`; `packages/rich-text/src/index.ts:1-10`; `packages/rich-text/src/editor.ts:188`; `packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.svelte:23-34,156-164`.
- Collaboration reference: `spec/SPEC_STUDY_EDIT_B2_COLLABORATION.md` §2.7 (pins), §4.4–§4.5 (undo/IME, Focus bridge, DRAFT-LINEAGE-1), §5.1–§5.2 (port and seams), §7 (CB lots carried into §8 here).
- Editable-card inventory: `spec/SPEC_STUDY_EDIT_B1_SENTROPIC_EDITABLES.md` §2.3 (24 sites), §4.1 (parity P1–P20), §4.2 (witness matrix).
- Inputs (sha256-verified, §0.3): `/home/antoinefa/src/sentropic/.tmp/canvas-norm/REPORT.md` (`53b8928b…`), `/home/antoinefa/src/sentropic/.tmp/canvas-decision-dossier/dossier-r4b.md` (`b153f3cb…`, L0-NORM at its lines 82/300/576 in the conductor's numbering; recommendation B′ at its §1/§5).
- Owner record: `/home/antoinefa/src/sent-tech-design-system/scratchpad/requests/2026-10-28-canvas-live-edit-via-sentropic.md:5-11,18-25,27-36`.

