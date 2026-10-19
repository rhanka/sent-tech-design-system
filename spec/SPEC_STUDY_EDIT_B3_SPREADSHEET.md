# SPEC STUDY — EDIT-B3: a spreadsheet editor (Google-Sheets / Odoo o-spreadsheet style) in the plan

| Field | Value |
| --- | --- |
| Status | STUDY only. No implementation, no package, no test execution is claimed by this document. |
| Date | 2026-10-19 |
| Track item | `01M5A1Y3D0A01W88MSE6CV5PP8` |
| Workpackage | `01M5A1XQ3R04V6P9MEYMRJN6J4` |
| Branch / tree | `spec/editing-brainstorm` in `.edit-bs-wt`, cut from `origin/main`. This file is the only file this run writes. |
| Owner request (2026-10-19, verbatim) | « Je voudrais que tu engages le reverse engineering pour tous les éléments editables TipTap comme le templater de sentropic ou on l'utilise. rappelle toi que dans le mode canvas on a les fonctions collaboratives (prévoir l'édition concurrente et le lock), ce pourrait peut être être intégré nativement. il faudra aussi prévoir l'éditeur type ghseet comme celui d'odoo dans le plan. track et engage les phases de brain storm stp » |
| Earlier owner request (18/10, which started the editor) | « je veux reprendre asap la feature d'édition - tu pourrais reprendre tip-tap et il faut prévoir un retour ver l'IA (prévoir dans le yaml/json de retour un retour d'édition en diff par paragraphe) » |
| Reference pinned | `odoo/o-spreadsheet` 20.0.3 (`66907fa5c176fd8df97522a38e6db5e36ac1ddd0`) in `.ds-scrap/re-sources/o-spreadsheet`, listed in `.ds-scrap/re-sources/MANIFEST.md` (added 2026-10-19T12:24Z for the rich-text / collaboration / spreadsheet brainstorms). LGPL-3.0-or-later: behavioural reference only. |
| Ladder rung | STUDY (`SPEC_STUDY_<TOPIC>.md`) per harness-brainstorm: open question, options, trade-offs. No commitment yet. VOL and EVOL are later rungs. |
| Companion brainstorms | B1 covers the sentropic editables, B2 covers collaboration and locking. This study is B3 only. Where B3 needs a lock / presence / concurrency decision, it states the interface it needs from B2 and does not settle B2. |
| Language | This study is written in English. No hard-coded natural language is proposed for any component (§6.4). |

## How to read this study

- Every measured claim carries a `repo:path:line` citation or a command that was run in this session. A claim that could not be verified on disk without network is tagged `unknown` or `source-gap` inline and collected in §2.9.
- Tags on decisions and recommendations: `owner-verbatim` means the wording is the owner's quoted request above and nothing beyond its literal content; `ds-proposition` means a design choice made by this study for the design system, requiring owner ratification where §8 states so; `h2a-spec` means a statement taken from the pinned h2a Focus contract at `98060bd0a`; `routed` means routed by the conductor. `SHALL` / `MUST NOT` below state the proposed contract. They acquire force only at ratification.
- Two adversarial lenses were applied and reconciled in §5 before the recommendation: (a) correctness / licence / layering risk, (b) user value / effort / time to first usable grid. Divergences are stated where they changed the recommendation. This satisfies the harness-brainstorm requirement for at least two independent angles at STUDY rung without claiming a VOL decision.
- No Python is used anywhere in the lots this study proposes (implementation, tests, jobs, one-off scripts): the DS stack is Node / TypeScript and native tooling already present.
- LGPL rule (owner rule, restated as a constraint on every option): no code, no data file and no grammar may be copied from the LGPL reference into the MIT DS packages, and no LGPL package may become a DS dependency without an owner decision. §4.4 and §5 enforce this per option.

---

## 1. Question and scope

### 1.1 The question

The owner asks that the plan also provide for a spreadsheet editor of the Google Sheets type, as exemplified by Odoo's o-spreadsheet: « il faudra aussi prévoir l'éditeur type ghseet comme celui d'odoo dans le plan » (`owner-verbatim`, header).

This study answers, at STUDY rung:

1. What does the pinned o-spreadsheet reference actually contain, measured — model, plugins, formula parser and evaluator, collaborative model (revisions, commands, OT), canvas rendering, function list, xlsx at the edges — so scope is measured and not assumed?
2. What does the DS already own that a spreadsheet could reuse — grid or table components across the four frameworks, `packages/dataviz-*` for charts that could bind to sheet ranges, `packages/diagram-canvas` for canvas rendering and layering — and what does the layering guard forbid reusing in that direction?
3. Does sentropic already need or mention a spreadsheet anywhere (including the google-docs and drive connectors), and is there an existing DS or sentropic model to reuse under the owner rule *no new model where one exists*?
4. If no reusable model exists, what is the smallest JSON-first model, in the style of the h2a / Focus contracts and of `diagram-core`?
5. How do scope tiers S0–S3 (§1.2) sequence, what does each tier cost and risk, and where should the plan stop until the owner decides otherwise?
6. How does a spreadsheet relate to FE-2 (the controlled Tiptap editor, `spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md`): rich-text cells if any, and whether the AI edit-return should carry a per-cell diff analogous to the per-paragraph diff — flagged as an h2a contract question, not settled here?
7. DOM grid or canvas, with performance targets measured and not assumed (the h2a specification's D22 discipline, carried over by the brief)?
8. Accessibility, language injection and offline capability.
9. Build vs adopt: implement in the DS from behaviour; adopt a permissive (MIT / Apache) engine for formulas only, with candidates named and licences marked `unverified` where they cannot be checked without network; or wrap o-spreadsheet behind an app-side boundary, LGPL, never inside DS packages.

### 1.2 Scope tiers (the brief's tiers, used throughout)

| Tier | Content | In / out of the first plan |
| --- | --- | --- |
| S0 | An editable data grid: cells, types, validation, keyboard navigation, copy / paste, no formulas | Proposed as the first delivered tier (§5, §7 Lot SS-0 / SS-1) |
| S1 | Formulas: parser, evaluator, dependency graph, recalculation, a function subset, references and ranges, errors | Proposed as the second tier, subset-first (§7 Lot SS-2) |
| S2 | A workbook: sheets, formatting, merges, freeze panes, conditional formats, charts bound to dataviz | Proposed only as a gated extension after S1 measurements (§7 Lot SS-3); full S2 parity with the reference is explicitly not proposed |
| S3 | Collaboration and an import / export format (xlsx, at the edges only, as with BPMN XML in the A′ articulation) | Not proposed for delivery in this plan. Studied in §3 and §6 so the S0–S1 model does not foreclose it; delivery requires the B2 decision and a separate owner decision (§8 Q4, Q5) |

Vocabulary: *workbook* means the whole JSON document (several sheets); *sheet* means one grid inside it; *cell* means one addressable position; *range* means a rectangular `A1:B2`-style zone; *formula* means cell content beginning with `=`. These match the reference's terminology (`doc/data-model.md`, `.ds-scrap/re-sources/o-spreadsheet/doc/data-model.md:1`) without copying its data file.

### 1.3 In scope for this study

- The measured inventory of §2 (reference, DS, sentropic, FE-2 / h2a, precedents).
- Observable behaviour per surface in §3.
- The model question in §4 (reuse or smallest new model), the FE-2 relation, rendering, accessibility, language and offline.
- Options, recommendation, interfaces and lots in §5–§7.
- Open questions that only the owner can settle, in §8, each with options and a recommendation so the owner can answer « Q1 A ».

### 1.4 Out of scope for this study

See §9 for the exhaustive NOT-covered list. In particular: any implementation; any Track write (the conductor writes Track); the B1 inventory of sentropic editables and the B2 lock / presence design themselves; a VOL or EVOL commitment; and any copy of LGPL code, data or grammar.

---

## 2. Measured inventory

Conventions for this section. `DS:` means this worktree (`.edit-bs-wt`, branch `spec/editing-brainstorm` from `origin/main`). `REF:` means `.ds-scrap/re-sources/o-spreadsheet` at the pin in the header. `H2A:` means `git -C /home/antoinefa/src/h2a show 98060bd0a:<path>` read read-only. `SENT:` means `git -C /home/antoinefa/src/sentropic grep … origin/main`. Line numbers are those observed in this session; where a file is generated or very long, the citation names the file and the symbol instead of pretending a stable line.

### 2.1 The reference: o-spreadsheet 20.0.3, measured

#### 2.1.1 Identity, licence, size

- Package `@odoo/o-spreadsheet` 20.0.3, `license: LGPL-3.0-or-later` (`REF:package.json`, `name` / `version` / `license`). The licence text is the LGPL-3.0 with the GPL-3.0 appended (`REF:LICENSE:1`, « o-spreadsheet is published under the GNU LESSER GENERAL PUBLIC LICENSE, Version 3 »). The README describes « A standalone spreadsheet for the web, easily integrable and extendable », with real-time collaboration and Excel import / export (`REF:readme.md:1`).
- Size, measured with `find REF/src -type f | wc -l` → 1046 files, of which 743 are `*.ts`; `find REF/src -name '*.ts' | xargs wc -l | tail -1` → 141488 total lines under `src/` (this includes the xlsx and chart subtrees). The test estate is 414 files under `REF/tests`, of which 297 are `*.test.ts` (`find REF/tests -type f | wc -l`, `find REF/tests -name '*.test.ts' | wc -l`). These numbers are the scope signal: a full parity rebuild is a multi-quarter programme, not a component. They are the reason §5 recommends tiering instead of parity.
- Entry points: ESM / CJS / IIFE bundles plus types (`REF:package.json`, `main` / `browser` / `module` / `types`), built with TypeScript + Rolldown, tested with Jest (`REF:package.json`, `scripts`). The UI framework is Owl (Odoo's framework), via an internal compatibility layer (`REF:src/owl3_compatibility_layer.ts`, `REF:src/index.ts` importing `App, Component` from it). Consequence for adoption: the reference is not framework-neutral; embedding it means embedding Owl and its XML templates (`.xml` files under `REF:src/components/**`), its CSS and its icon bundle. This is measured from the source layout, not from marketing material.

#### 2.1.2 Architecture: model, commands, getters, plugins

The reference architecture is documented by its authors and confirmed in code:

- Two parts: the model and the spreadsheet rendering in the DOM (`REF:doc/extending/architecture.md:1`, « o-spreadsheet is architected in two main parts »). The model follows command–query separation: commands update state, getters read it (`REF:doc/extending/architecture.md`, « Commands » / « Getters », with the `UPDATE_CELL` example).
- `Model` is the coordinator and defers state work to plugins (`REF:src/model.ts:1`, class comment: « The Model class is the owner of the state of the Spreadsheet. However, it has more a coordination role: it defers the actual state manipulation work to plugins »; 778 lines in that file, `wc -l REF/src/model.ts`). It also renders the visible viewport on a canvas (same comment). The model can be used standalone, without UI (same comment: « the Model can be used in a standalone way »).
- Commands are dispatched to the model and relayed to plugins and to the history handler; an `update` event notifies listeners when a command was not cancelled (`REF:src/model.ts`, header imports of `CommandDispatcher`, `CoreCommand`, registries). The command vocabulary is large: `grep -cE '^\s+"[A-Z_]+"' REF/src/types/commands.ts` → 171 quoted command names in a 1669-line file (`REF:src/types/commands.ts`, `REF:src/types/getters.ts` at 205 lines). Examples observed: `UPDATE_CELL`, `CREATE_SHEET` / `DELETE_SHEET` / `RENAME_SHEET`, `ADD_COLUMNS_ROWS` / `REMOVE_COLUMNS_ROWS`, `ADD_MERGE` / `REMOVE_MERGE`, `ADD_CONDITIONAL_FORMAT`, `SET_BORDER`, `EVALUATE_CELLS`, `UNDO` / `REDO`, `LOCK_SHEET` / `UNLOCK_SHEET`. The exact count depends on the counting convention (the file groups core, evaluation and UI commands); the order of magnitude — well over one hundred commands — is the measured fact.
- Plugins are split in three families with distinct read / handle rights (`REF:doc/extending/architecture.md`, « Plugins »):
  - Core plugins own persisted data and business rules, one data structure each, under `REF:src/plugins/core/` — 24 files (`ls REF/src/plugins/core/*.ts | wc -l` → 24; 9807 lines total, `wc -l REF/src/plugins/core/*.ts | tail -1`). Observed: `cell.ts` (1085 lines), `sheet.ts` (1131), `borders.ts`, `chart.ts`, `conditional_format.ts`, `data_validation.ts`, `figures.ts`, `merge.ts`, `named_range.ts`, `pivot.ts`, `tables.ts`, `header_grouping.ts`, `settings.ts`, plus squisher / unsquisher for the compressed export form.
  - Evaluation plugins own derived state (cell evaluation, computed style, chart runtime), never persisted and never transmitted to collaborators (`REF:doc/extending/architecture.md`; `REF:src/plugins/evaluation/`, including `cell_evaluation/`, `evaluation_conditional_format.ts`, `evaluation_data_validation.ts`, `formula_tracker.ts`).
  - UI plugins split into stateful UI (`REF:src/plugins/ui_stateful/`: `selection.ts`, `collaborative.ts`, …) and UI features (`REF:src/plugins/ui_feature/`: `sort.ts`, `lock_sheet.ts`, `format.ts`, …). Together with evaluation, `find REF/src/plugins -name '*.ts' | wc -l` → 74 plugin files; `find REF/src/components -name '*.ts' | wc -l` → 280 component files.
- Integration surface: `Model(data, config)` with `mode: normal | readonly | dashboard`, a `transportService` and a `client` for collaboration, `custom` / `external` dependency injection (`fileStore`, `loadCurrencies`, `loadLocales`), and a `Spreadsheet` Owl component taking `model` plus `notifyUser` / `askConfirmation` / `raiseError` callbacks (`REF:doc/integrating/integration.md`, « Model creation », « Spreadsheet component props »). Translation is injected via `setTranslationMethod(_t)` (`REF:doc/integrating/integration.md`, « Translation »; `REF:src/translation.ts`). This injected-messages shape matters for §6.4: the reference already assumes host-injected language, which aligns with the DS rule.

#### 2.1.3 The JSON data model (WorkbookData)

- The import / export JSON is `WorkbookData` (`REF:src/types/workbook_data.ts:81`, `export interface WorkbookData`), documented in `REF:doc/data-model.md:1`. Top level: `version` (the documented shape is for version `18.4.2`), `revisionId` (`"START_REVISION"` in single-user use), `sheets[]` (order is tab order), `styles` / `formats` / `borders` dictionaries, `uniqueFigureIds`, `settings.locale`, `pivots`, `pivotNextId`, `customTableStyles`. This is a JSON-first model in exactly the sense the brief asks about: the whole workbook is one serialisable value, loaded via `load` / migrations (`REF:src/migrations/data.ts`, imported in `REF:src/model.ts`).
- One sheet (`SheetData`, `REF:src/types/workbook_data.ts`, `export interface SheetData`): `id`, `name`, `colNumber`, `rowNumber`, `rows` / `cols` size-and-hidden maps, `merges` as `A1:B2` strings, `cells` keyed by address or range holding the squished content, `styles` / `formats` / `borders` as zone → dictionary-id maps, `conditionalFormats[]`, `dataValidationRules[]`, `figures[]`, `tables[]`, `areGridLinesVisible`, `isVisible`, `headerGroups`, `panes` (`xSplit` / `ySplit` for freeze panes), `color`. Styles, formats and borders are interned dictionaries referenced by id — a compression choice that any DS model must consciously accept or reject (§4.2).
- Cells: `Cell = LiteralCell | FormulaCell` (`REF:src/types/cells.ts:25`). A literal cell carries raw `content: string` and a `parsedValue: CellValue` where `CellValue = string | number | boolean | null` (null is the empty cell, chosen over `undefined` so JS default parameters do not substitute it — comment in the same file). A formula cell carries a `CompiledFormula` instead of content. Evaluated cells are a separate discriminated union `EvaluatedCell = NumberCell | TextCell | BooleanCell | EmptyCell | ErrorCell` with `formattedValue`, `defaultAlign` and `isAutoSummable` (`REF:src/types/cells.ts:44`). The three-layer split (stored → compiled → evaluated) is the single most important structural lesson for §4: conflating stored text with evaluated value is what makes naive grids unable to grow into S1.
- Errors are values, not exceptions, at the cell level: `CellErrorType` maps ten codes (`#N/A`, `#REF`, `#BAD_EXPR`, `#CYCLE`, `#NAME?`, `#DIV/0!`, `#NUM!`, `#SPILL!`, `#ERROR`, `#NULL!`) with an `EvaluationError` class hierarchy (`REF:src/types/errors.ts:4`, `export const CellErrorType`). Any S1 design must adopt an error-value vocabulary of this kind (§4.3); the exact codes are an owner / compatibility question (§8 Q2), not a copy target.
- Locale is data: `Locale { name, code, thousandsSeparator, decimalSeparator, weekStart, dateFormat, timeFormat, formulaArgSeparator }` with three built-in locales (`en_US`, `fr_FR` with `;` as the formula argument separator, `en_IN`) and host-loadable additional locales (`REF:src/types/locale.ts:5`, `export interface Locale`; `REF:doc/integrating/integration.md`, « External Locales »). Formula parsing is therefore locale-dependent (decimal separator, argument separator) — a fact S1 cannot ignore (§6.4).

#### 2.1.4 Formulas: tokenizer, parser, compiler, evaluator, functions

- Pipeline: `tokenize` → `parse` / `parseTokens` → `CompiledFormula` → execution. Files: `REF:src/formulas/tokenizer.ts` (297 lines), `parser.ts` (478), `compiler.ts` (737), `code_builder.ts` (146), `range_tokenizer.ts` (162), `formula_formatter.ts` (398), `composer_tokenizer.ts` (287) — 2505 lines for the pipeline alone (`wc -l REF/src/formulas/*.ts`). Public exports include `tokenize`, `parse`, `parseTokens`, `iterateAstNodes`, `astToFormula`, `CompiledFormula`, `functionCache` (`REF:src/index.ts`, `export { tokenize }`, `export { parse … }`).
- The tokenizer is locale-aware (numbers, argument separator, array separators) and produces token types including `REFERENCE`, `INVALID_REFERENCE`, `ARG_SEPARATOR`, `ARRAY_ROW_SEPARATOR` (`REF:src/formulas/tokenizer.ts`, header comment and `TokenType` union). The parser builds a typed AST (`NUMBER`, `STRING`, `BOOLEAN`, `REFERENCE`, `UNARY_OPERATION`, `BIN_OPERATION`, `FUNCALL`, `SYMBOL`, `ARRAY`, …) over a `TokenList` (`REF:src/formulas/parser.ts`, `ASTBase` and the `AST*` interfaces). The compiler translates the AST to generated JavaScript functions via a code builder, with a structural cache so `=2*sum(A1:A4)` and `=2*sum(B1:B4)` share one compiled shape (`REF:src/formulas/compiler.ts`, header comment on `functionCache` and class `CompiledFormula`). Operator mapping is explicit (`OPERATOR_MAP`: `=` → `EQ`, `^` → `POWER`, `&` → `CONCATENATE`; `UNARY_OPERATOR_MAP`: `%` → `UNARY.PERCENT`, `#` → `SPILLED.RANGE`, same file).
- Dependencies are tracked explicitly: a compiled formula exposes `rangeDependencies: Range[]`, `hasDependencies`, `literalValues` and `symbols` (same file). Evaluation is a plugin concern (`REF:src/plugins/evaluation/cell_evaluation/`, `formula_tracker.ts`) so recalculation order follows the dependency graph rather than a full re-evaluation. Any DS S1 must provide the same three properties — parse once, track range dependencies, evaluate in dependency order with cycle detection (`#CYCLE`) — or recalculation cost grows quadratically. The implementation technique (generated JS code) is a reference behaviour to evaluate, not a grammar or code to copy; §4.4 states the clean-room boundary.
- Function library: `grep -rhoE 'export const [A-Z][A-Z0-9_]+' REF/src/functions/module_*.ts | sort | wc -l` → 336 exported function constants across 15 modules, registered by category in `REF:src/functions/function_registry_population.ts` (Array, Database, Date, Filter, Financial, Info, Lookup, Logical, Math, Operator, Statistical, Text, Engineering, Web, Parser; the population loop replaces `_` with `.` in names, e.g. `AVERAGE_WEIGHTED`). Per-module counts measured: Statistical 66, Math 61, Financial 49, Date 32, Text 28, Array 23, Lookup 20, Operators 16, Database 12, Logical 11, Info 11, Filter 4, Engineering 1, Web 1, Parser 1. Hosts can add functions via `addFunction` (`REF:src/index.ts`, `export function addFunction`). 336 functions is the parity denominator; §5 proposes a named subset for S1 and explicitly refuses to promise the long tail (financial, engineering, web) without a usage source.
- What the functions need from the host: evaluation context with getters, locale, and `custom` external dependencies (`REF:doc/integrating/integration.md`, « Model creation », `custom`). A DS formula engine must likewise be host-extensible without forking the core (§4.3).

#### 2.1.5 Workbook features beyond the grid (S2 surface)

Measured from the core plugin list and the data model, the reference S2 surface includes: multiple sheets with tab colour, visibility and lock state (`SheetData`, `REF:src/types/workbook_data.ts`; `LockSheetPlugin` refuses non-allowlisted commands on a locked sheet, `REF:src/plugins/ui_feature/lock_sheet.ts:1`); merges; freeze panes (`panes`); header groups (outline collapse); row / column sizing and hiding; styles / formats / borders as interned dictionaries; conditional formatting rules; data validation rules; named ranges; filter tables and pivot tables (`REF:src/plugins/core/pivot.ts`, `tables.ts`); figures (images and charts) anchored by cell + pixel offset (`FigureData<T>`, same file); and charts rendered with Chart.js (`chart.js 4.5.0` in `REF:package.json` dependencies, `REF:src/components/figures/chart/chartJs/chartjs.ts`). Print rendering exists as a separate component subtree (`REF:src/components/spreadsheet_print/`). Each of these is a separable feature with its own plugin; none is required by S0 or S1. This separability is what makes tiering credible.

#### 2.1.6 Rendering: canvas grid with DOM overlays

- The grid itself is rendered on an HTML canvas; everything else is Owl DOM (`REF:doc/extending/architecture.md`, « UI rendering »: « The grid itself is rendered on an HTML canvas. All other elements are rendered with the owl UI framework »). The Grid component comment says the same at code level: « The grid is rendered on a canvas. 3 sub components are (sometimes) displayed on top of the canvas: a composer (to edit the cell content), a horizontal resizer, a vertical resizer » (`REF:src/components/grid/grid.ts:97`). The canvas element is `<canvas t-ref="this.canvasRef" class="os-theme-dependant pe-none"/>` inside the grid template (`REF:src/components/grid/grid.xml`, `o-spreadsheet-Grid` template), with DOM overlays for figures, selection, highlights, autofill handle, client tags (collaborator cursors), scrollbars and popovers (same template).
- Rendering is layered and typed: `REF:src/types/rendering.ts` defines `RenderingBox` / `Box` (content, style, border, clip rect, error / merge / overflow flags, icons), `Viewport` as a `Zone`, scroll info in pixels, and a `GridRenderingTheme` whose grid background deliberately comes from the `--os-canvas-background-color` CSS variable so integrators can override it (comment in the same file). Viewports are collected per sheet (`REF:src/helpers/viewport_collection.ts`, `REF:src/stores/grid_renderer_store.ts`). The model owns the renderer list and its layer order (`REF:src/model.ts`, `renderers: Partial<Record<LayerName, UIPlugin[]>>`).
- Consequence: the reference chose canvas for the cell surface (tens of thousands of cells without DOM nodes) and DOM for everything interactive around it (composer, menus, figures). §6.1 weighs the same split for the DS with DS-specific constraints (four frameworks, tokens, accessibility) instead of importing the conclusion.

#### 2.1.7 Collaboration: revisions, server-ordered OT, selective history

- Transport is host-provided: a `TransportService` sends and receives messages through a central coordinating server that orders messages and maintains the current spreadsheet revision (`REF:doc/integrating/collaborative/collaborative.md`, « Transport Service », « Coordinating server »). Messages split into always-accepted presence messages (`ClientJoined` / `ClientMoved` / `ClientLeft`) and state messages (`RemoteRevision`, `RevisionUndone`, `RevisionRedone`) carrying `serverRevisionId` / `nextRevisionId`: a state message is accepted only if its `serverRevisionId` equals the server's, after which the server's revision becomes `nextRevisionId`; otherwise it is rejected and the client must transform and resend (same document). The initial revision id is `"START_REVISION"` (same document; `REF:src/constants.ts`, `DEFAULT_REVISION_ID`).
- The algorithm is Operational Transform with client-side transformation: a locally executed action is applied immediately, sent, and kept pending; on rejection the pending actions are reverted, transformed against the intervening accepted revisions, re-applied and resent (`REF:doc/integrating/collaborative/collaborative.md`, « Operational Transform »; design rationale in `REF:doc/integrating/collaborative/collaborative_choices.md`, which records that CRDT was explored and set aside for this codebase because of the plugin architecture, and that server-side transformation was rejected to avoid duplicating transforms in two languages). Only `CoreCommand`s are synchronised; UI commands (selection, composer state) stay local (same documents). Each new core command may need a transformation function against grid-changing commands and an inverse function for selective undo, registered in dedicated registries (`otRegistry.addTransformation`, `inverseCommandRegistry.add`, same collaborative document, « Extension »).
- Code shape: `Session` (559 lines, `REF:src/collaborative/session.ts`) extends an `EventBus`, tracks `clients` positions, `pendingMessages`, `waitingAck` / `waitingUndoRedoAck` (undo / redo block optimistic update until the server accepts — a stated con), and `processedRevisions`; `Revision` bundles an id, a client id, the synchronised `CoreCommand[]`, the root command and the history changes (`REF:src/collaborative/revisions.ts`, class `Revision`); OT lives in `REF:src/collaborative/ot/` (`ot.ts`, `ot_helpers.ts`, `ot_specific.ts`, `srt_specific.ts`); history is a selective, tree-structured log (`REF:src/history/`, `selective_history.ts`, `tree.ts`, `operation_sequence.ts`). Commands are squished for transport (`REF:src/collaborative/command_squisher.ts`, 221 lines).
- Presence is therefore part of the same session object (client positions rendered as `ClientTag` overlays, §2.1.6), and locking has two distinct meanings in the reference that §6.3 keeps apart: sheet lock (a user-facing protection flag, `LockSheetPlugin`) and revision ordering (the server CAS on `serverRevisionId`). Neither is a cell-level lock. B2 must decide which of these meanings, if any, the DS collaboration model adopts; B3 only states what it needs (§6.3).

#### 2.1.8 xlsx at the edges

- Export: `Model.exportXLSX()` returns the files to zip into an `.xlsx` (`REF:src/model.ts:760`, `async exportXLSX()`; `REF:src/xlsx/xlsx_writer.ts`, `getXLSX(data)` building workbook, worksheets, styles, shared strings, rels and content types per ECMA-376). Import: `XlsxReader(files).convertXlsx()` parses the zip's XML parts and converts them to `WorkbookData` with a warning manager for lossy conversions (`REF:src/xlsx/xlsx_reader.ts`, class `XlsxReader`, `EXCEL_IMPORT_VERSION = "18.4.2"`). Conversion and extraction are split into per-feature modules (`REF:src/xlsx/conversion/`: sheet, style, formula, figure, table, conditional-format, data-validation, named-range conversions; `REF:src/xlsx/extraction/`: matching extractors). The internal model stays JSON; xlsx exists only at import / export. This is exactly the A′ articulation the brief cites (BPMN XML at the edges, JSON inside), and §4.5 adopts the same placement for any DS xlsx work.
- The xlsx subtree is not small (writer 469 lines, reader 180, plus ~20 conversion / extraction modules and a 722-line `REF:src/types/xlsx.ts`). S3 xlsx fidelity is therefore a programme of its own; §5 treats « xlsx round-trip » as a fidelity spectrum with explicit loss reporting (the reference's `XLSXImportWarningManager` is the behavioural precedent), never as a binary promise.

#### 2.1.9 What the reference does not give the DS

- No framework neutrality (Owl + XML templates, §2.1.1), no DS tokens (its theme is CSS variables of its own, e.g. `--os-canvas-background-color`), and no four-framework parity story. A DS spreadsheet must be designed against the DS component conventions (§2.2) and cannot inherit these from the reference.
- Accessibility surface is thin in the measured sources: the grid container carries `tabindex="-1"` and keyboard handling at grid level (`REF:src/components/grid/grid.xml`, `o-spreadsheet-Grid`), with scattered `role="button"` / `tabindex` uses in composer and menus (`grep -rn 'aria\|role\|tabindex' REF/src --include='*.ts' --include='*.xml'` returns no grid `role="grid"`, no `aria-rowcount` virtualisation contract, no screen-reader cell announcement strategy). This is recorded as measured absence, not as a criticism: the DS must design its own accessibility contract (§6.2) and cannot claim one by reference.
- No per-cell rich text: cell content is a string (literal) or a formula; links are a cell property (`link` on the evaluated cell, §2.1.3), not inline rich text. The FE-2 relation is therefore an open design question (§4.6), not a reference behaviour to replicate.

### 2.2 The DS today (this worktree)

#### 2.2.1 Tables and grids that exist

- There is no spreadsheet, editable grid, or formula component in the DS. Measured: `grep -rn 'spreadsheet' DS:packages --include='*.ts' --include='*.svelte' --include='*.md' -i` returns only stylesheet false positives (theme `MAPPING.md` files and `darkModeRule.ts`); no component, package or spec in `DS:packages` names a spreadsheet. The spreadsheet-shaped JointJS catalogue entry is explicitly « not covered » with « primitives DS à réutiliser » (`DS:docs/graph-dataviz-reference-catalog.md:343`, `spreadsheet-shapes-with-handsontable`, replaced by « the Sentropic DataGrid » per `DS:spec/SPEC_RE_JOINTJS_PARITY.md:23` — a forward reference to a component that does not yet exist under that name).
- What exists is a read-only data-table family, present in all four frameworks with the same props contract:
  - Svelte: `DS:packages/components-svelte/src/lib/DataTable.svelte` (643 lines, `wc -l`) and the simpler `DS:packages/components-svelte/src/lib/Table.svelte` (107 lines). `DataTable` props (Svelte `<script module>` block): `columns: DataTableColumn[]` (`key`, `label`, `sortable`, `align`, `width`, optional `cell` snippet, optional `cellDecoration` callback), `rows: DataTableRow[]` (`id` plus arbitrary keys), `decorations` map (`rowId → colId → CellDecoration`, taking precedence over the column callback), `caption`, `size`, `selectable: none | single | multiple`, `selectedIds` (bindable), `sortable`, `sortBy` (bindable), `pageSize` / `page` (bindable), `locale` (default `fr-FR`), and injected labels (`selectAllLabel`, `sortAscendingLabel`, `previousLabel`, `rangeLabel`, `emptyLabel`, …). Behaviour implemented in the component: client-side sorting (numeric or locale string compare), pagination slicing, select-all-visible semantics, `aria-sort`, visually-hidden sort state text. Cells render `String(row[key] ?? '')` or the host snippet; there is no editing, no focusable cell, no keyboard navigation between cells, no clipboard handling.
  - React: `DS:packages/components-react/src/DataTable.tsx` (same exported types `DataTableColumn`, `DataTableRow`, `DataTableSelectMode`, `DataTableSort`; controlled-or-uncontrolled selection / sort / page via `selectedIds` + `onSelectionChange` style callbacks). Vue: `DS:packages/components-vue/src/DataTable.ts`; Angular: `DS:packages/components-angular/src/DataTable.ts` (standalone component, selector `st-data-table`). The four implementations share the type contract and the `st-dataTable` class anatomy; they are four hand-maintained renderings of one display contract, which is the DS parity pattern any spreadsheet adapter must follow (§6.5).
  - Supporting pieces: `Table.svelte` (display-only, `columns` + `rows` + `caption`), `Grid.svelte` / `DashboardGrid.svelte` (layout grids, not data grids — `DS:packages/components-svelte/src/lib/Grid.svelte`, tested as CSS `display: grid` containers in `DS:packages/components-svelte/src/Layout.test.ts`, `describe('Grid')`), and form controls that an S0 editor would compose for cell editing (`Input.svelte`, `NumberInput.svelte`, `Select.svelte`, `Combobox.svelte`, `Checkbox.svelte` under `DS:packages/components-svelte/src/lib/`).
- Cell decoration (the DS conditional-formatting surface today): `CellDecoration { intent: positive | negative | warning | info | neutral, icon? }` with token-only rendering and a screen-reader label per intent (`DS:packages/components-svelte/src/lib/cellDecoration.ts:1`, header: « Décoration sémantique d'une cellule (DataTable) ou d'une carte (KpiCard) »; the header states the rule engine lives in dataviz-core and the DS only renders). The same intent vocabulary is produced presentation-free by `DS:packages/dataviz-core/src/conditional-format.ts:1` (`ConditionalFormat` rules: comparator conditions `gt / gte / lt / lte / eq / ne / between` and rank conditions `top / bottom`, first match wins, mapping a numeric value to a `ConditionalDecoration`). This pair — engine in dataviz-core, rendering in the DS — is the existing precedent for where a spreadsheet's conditional-format evaluation should live (§4.2, §6.6), and the layering guard (§2.2.4) constrains which direction the dependency may run.

#### 2.2.2 dataviz: what could bind to sheet ranges, and what cannot yet

- `DS:packages/dataviz-core` is a framework-agnostic engine (139 files under `src/`, `ls DS:packages/dataviz-core/src/*.ts | wc -l` counting tests) whose model is BI-shaped, not sheet-shaped: `DataModel { dimensions: Dimension[], measures: Measure[] }`, `Row = Record<string, Cell>` with `Cell = string | number | boolean | null` (`DS:packages/dataviz-core/src/model.ts:1`). It provides aggregation, pivot construction shaped for `DataTable` (`buildPivotTable` returning `PivotTable { columns, rows }`, `DS:packages/dataviz-core/src/pivot.ts:1`, header: « The output is intentionally presentation-neutral but shaped for DS DataTable »), conditional formatting (§2.2.1), formatting, and an immutable observable dashboard store with declarative, serialisable filter / selection / drill state (`DS:packages/dataviz-core/src/store.ts:1`, `DashboardStore`).
- Framework bindings exist per framework (`DS:packages/dataviz-svelte`, `dataviz-react`, `dataviz-vue`, `dataviz-angular`), and chart components live in the four `components-*` packages (e.g. `BarChart`, `LineChart` under `DS:packages/components-svelte/src/lib/`).
- Measured gap: nothing in dataviz-core consumes a sheet range (`A1:B2`, a named range, or a sheet id + zone). `grep -rn 'range' DS:packages/dataviz-core/src/*.ts` in the chart-binding sense returns range *chart* builders (`DS:packages/dataviz-core/src/range.ts`, area-range / column-range data), not cell ranges. A chart « bound to a sheet range » therefore needs a new binding contract (range → `Row[]` + `DataModel` projection, with live recalculation on edit) whose ownership is constrained by layering (§2.2.4, §6.6). The data shapes are compatible (`Cell` is the same scalar union as the reference's `CellValue`), which makes the binding a projection problem rather than a type-conversion problem.

#### 2.2.3 diagram-canvas and diagram-core: reusable ideas, not reusable grid code

- `DS:packages/diagram-canvas` (private, `DS:packages/diagram-canvas/package.json`, « Headless scene and hit testing over a diagram view ») provides one world → view → CSS-pixel → device-pixel transform, deterministic paint order, and filter evaluation with reported exclusions (`DS:packages/diagram-canvas/src/index.ts`, exporting `transform`, `geometry`, `visibility`, `scene`, `hit`, `layout`). Its README fixes the camera reading (`camera.x / y` are the world point at the view origin, `zoom` is CSS pixels per world unit, `DS:packages/diagram-canvas/README.md`, « The camera, and the one transform ») and the conservation rule (every occurrence is either rendered or reported excluded, never dropped silently). What it deliberately leaves out includes selection state, keyboard traversal, rendering itself (SVG / Canvas2D / WebGL) and framework adapters (same README, « What is not covered yet »).
- `DS:packages/diagram-core` (private, zero-DOM, `DS:packages/diagram-core/package.json`) provides versioned documents, transactional commands with logical inverses and explicit revision conflicts (`DS:packages/diagram-core/src/commands.ts:1`, header rules 1–4: no partial success, explicit `baseRevision` conflict, an inverse or a reason, no silent delete policy), canonical JSON and hashing (`DS:packages/diagram-core/src/canonical.ts`, `hash.ts`). The spreadsheet model in §4 borrows these *disciplines* (transaction, inverse, revision, canonical form) without importing the diagram meta-model: the owner rule is « diagrams use the diagram-core meta-model » for diagrams; a workbook is not a diagram, and forcing cells into entities / relations / occurrences would be a new model wearing an old one's clothes. §4.1 records this as a considered-and-rejected reuse.
- `DS:packages/graph` (0.3.0, WebGL-oriented graph rendering, `DS:packages/graph/package.json`) is a known-position graph renderer (typed buffers, `render-geometry.ts` as the single geometry source for Canvas2D / WebGL / hit-test). It is not a grid renderer: cells are not graph nodes, and §6.1 does not propose routing cell rendering through it. Its relevance is methodological (one geometry source for render + hit) and as the chart / diagram rendering neighbour, not as spreadsheet infrastructure.

#### 2.2.4 Packaging, layering and licensing guards (hard constraints on every option)

- Workspaces are `packages/*` and `apps/*` (`DS:package.json`, `workspaces`). Root gates: `licensing:check` (`node scripts/verify-publishable-licensing.mjs`), `check`, `test` (`node --test scripts/*.test.mjs` then workspace tests), `pack:smoke` (`node scripts/smoke-pack.mjs`), composed as `verify` (`DS:package.json`, `scripts`).
- Licensing guard: for every workspace whose manifest is not `private: true` (the single definition is `publishableWorkspaces` in `DS:scripts/generate-third-party-notices.mjs:108`), `DS:scripts/verify-publishable-licensing.mjs:1` asserts a non-placeholder `license` field, a `LICENSE` file of at least 300 bytes, a current `LICENSE.THIRD-PARTY.md` re-derived from `package-lock.json`, and real tarball membership via `npm pack --dry-run --json`. The count is pinned by test: `DS:scripts/verify-publishable-licensing.test.mjs:84` asserts `publishable.length === 18`. Adding a publishable package therefore changes the count in the same commit and requires `npm run notices:generate`; adding a `private: true` package (the `diagram-core` / `diagram-canvas` / `rich-text`-on-its-branch posture) does not. All current DS packages declare MIT (`DS:packages/components-svelte/package.json`, `"license": "MIT"`; `DS:packages/codemirror/package.json`, `"license": "MIT"`; `DS:packages/diagram-core/package.json`, `"license": "MIT"` while `private: true`).
- Layering guard: `DS:scripts/verify-layering.test.mjs:1` forbids any `@sentropic/design-system*` package from depending on (manifest) or importing (source) `@sentropic/dataviz-*`, `@sentropic/diagram-core` or `@sentropic/diagram-codecs` — the header records that PR #65 briefly shipped such a dependency and turned `pack:smoke` red. The same file whitelists the intended edges `design-system-{svelte,react,vue,angular} → @sentropic/graph` and `→ @sentropic/diagram-canvas`. Consequence: a spreadsheet core placed inside the `design-system-*` namespace *cannot* import dataviz-core (chart binding must be composed by the host or by a non-DS-namespace package), and cannot import diagram-core. §4 and §6.6 design around this instead of proposing to weaken the guard.
- Precedent for a neutral wrapper package: `DS:packages/codemirror` (`@sentropic/design-system-codemirror` 0.1.0) wraps CodeMirror as peer dependencies (`@codemirror/* ^6`, `@lezer/highlight ^1`), ships only `dist` with `sideEffects: false` and a single `.` export, and its whole runtime surface is a theme factory mapping editor classes onto `--st-*` tokens (`DS:packages/codemirror/src/index.ts`, `DS:packages/codemirror/src/theme.ts`). FE-2's rich-text placement (§2.4) mirrors this shape. A spreadsheet package should mirror it too (§4.5).
- Theming: themes are CSS custom properties `--st-*` scoped by `[data-st-theme="<id>"]` (`DS:packages/themes/css/sent-tech.css`, generated), and component anatomy tokens follow `--st-component-<name>-…` with semantic fallbacks (e.g. DataTable reads `--st-component-dataTable-rowBackground` falling back to `--st-semantic-surface-default`, `DS:packages/components-svelte/src/lib/DataTable.svelte`, `<style>` block). Any spreadsheet surface must read tokens the same way and hard-code no colour, spacing or font where a token exists.
- Smoke pack: `DS:scripts/smoke-pack.mjs:1` packs tarballs for an explicit package list (13 packages in the `packages` array at line 185, with a `deepVerify` closure / peers map at line 284) and deep-imports real entry points in a throwaway project; the licensing gate inside it runs over every publishable workspace regardless of selection. Extending coverage to a new package is a wiring change in that file plus the licensing count, exactly as FE-2 §2.1 records for the editor.

### 2.3 Sentropic: spreadsheet need or mention (read-only, `origin/main`)

Command run in this session, exactly as the brief prescribes: `git -C /home/antoinefa/src/sentropic grep -n -i "spreadsheet\|tableur\|sheet" origin/main -- spec ui/src packages ':!*/dist/*'`. Findings, grouped by what they actually are:

- No spreadsheet editor, editable grid or formula engine exists in sentropic. No hit describes an in-app tableur; the product's editable surface today is the Tiptap-based `EditableInput` / `TemplateRenderer` chain (see §2.4), not a grid. This is a measured absence over the prescribed perimeter (`spec`, `ui/src`, `packages`, excluding `dist`), not a claim about code outside that perimeter.
- Google Sheets appears only as an external system read through connectors, never as an embedded editor:
  - `SENT:packages/mcp-connector-googlesheets` is a BR-72 read-only benchmark proof (« READ-ONLY Google Sheets connector adapter », synthetic fixtures only, « NOT the production connector », `SENT:packages/mcp-connector-googlesheets/README.md:1`, `package.json` description). Its manifest offers read capabilities only: `get_spreadsheet_info`, `get_sheet_names`, `valuesGet` (A1-notation range read), `search_spreadsheets`, `batchGet`, `get_conditional_format_rules`, `get_data_validation_rules`, `search_developer_metadata`, all under `spreadsheets.readonly` + Drive readonly scopes (`SENT:packages/mcp-connector-googlesheets/src/manifest.ts:207`). There is no write, no formula evaluation and no editing surface to reuse.
  - `SENT:packages/mcp-connector-googledocs` exposes `list_spreadsheet_charts` (chart metadata from a Google Sheets file, Sheets readonly scope) alongside document tools (`SENT:packages/mcp-connector-googledocs/src/manifest.ts:163`). Again: metadata read, not a grid.
  - `SENT:packages/mcp-connector-googledrive` fixtures include a spreadsheet file (`Q2 Financials`, `application/vnd.google-apps.spreadsheet`) whose content fixture is CSV text (`SENT:packages/mcp-connector-googledrive/src/fixtures.ts:32`). Ingestion is text-first: « Google Sheets to CSV » for summarisation, with user downloads exporting Sheets to XLSX (`SENT:spec/SPEC_EVOL_GOOGLE_DRIVE_CONNECTOR.md:53`, and the MVP format decision at line 416). The spreadsheet is a source document for RAG / export, not an editing target.
  - `SENT:spec/TOOLS.md:41` documents the document tool's xlsx handling: `list_sheets` returns sheet names + 1-based index + row counts; `get_sheet_content` returns one sheet as tab-separated rows where formula cells surface both the formula and the computed value (`=FORMULA → value`, cross-sheet refs in `Sheet!A1` form). This is the closest existing sentropic behaviour to « reading a workbook »: a server-side xlsx reader that already distinguishes formula text from computed value. It is a tool implementation behind an API, not a reusable DS model, and its parser is `unknown` from this grep alone (the tool's implementation files were not opened in this study; see §2.9). It proves demand for *reading* sheets, not for *editing* them in the browser.
- Mentions that are not spreadsheet needs: the chat canvas carve-out listing « 3D-CATIA/sheets » among future editors (`SENT:spec/SPEC_EVOL_CHAT_ECOSYSTEM.md:52`, carved out, no design); the functional-perimeter benchmark naming spreadsheet products as comparators (Excel Copilot, Google Sheets + Gemini, ExcelJS, Univer, Rows, Equals; Luckysheet as watch / legacy, `SENT:spec/SPEC_STUDY_BENCHMARKS_FUNCTIONAL_PERIMETER.md:175`); `product-datasheet` workspace types (`SENT:spec/SPEC_EVOL_WORKSPACE_TYPES.md:893`), which are product documents, not grids; and UI file-type labels (`FileSpreadsheet` icon, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` accept lists, `SENT:ui/src/lib/utils/documents.ts:52`).
- The templater the owner cites (« comme le templater de sentropic ou on l'utilise », header) is `TemplateRenderer.svelte`: a JSON-driven generic view renderer (tabs, rows, grids, field types) rendering `FieldCard`, `ScoreTable`, `EditableInput`, entity loops and print layout (`SENT:spec/SPEC.md:824`), whose text fields edit through `EditableInput` → `TipTap` with debounced autosave, and whose list fields force list structure (`forceList`, §2.4). A spreadsheet would be a new field / widget type inside that system if sentropic ever embeds one — an interface question for B1 (§6.7), not an existing spreadsheet to reuse.

Conclusion for the model question: sentropic holds (a) read-only external-sheet connectors, (b) a server-side sheet-reading tool behaviour, and (c) a template system with rich-text fields. None is a workbook model, a cell model or a formula engine the DS could adopt under « no new model where one exists ». §4 therefore designs the smallest new workbook model and states how the sentropic reader behaviour and the template field system would consume it, without importing either.

### 2.4 FE-2 (rich text) and the h2a Focus contract, as they constrain B3

- FE-2 is specified in `DS:spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md` (merged on main as #181, commit `b481940e`; latest text also read on branch `feat/rich-text-core` via `git show feat/rich-text-core:spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md`). Its ownership boundary is the template for B3's contract discipline: h2a / `@sentropic/focus` owns the return envelope, the editing manifest and paragraph identities, the diff, the reconciler, digests and schemas; the DS owns only a reusable controlled editor component (controlled value in, complete document plus gesture provenance out), carrying opaque per-block identity attributes that a host-side Focus adapter supplies and reads. The DS component never imports `@sentropic/focus`, never computes a per-paragraph diff and never retains a Focus baseline (`DS:spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md`, §0.2). B3 must hold the same line for cells (§4.6).
- The pinned contract in force is the merged code at `98060bd0a`, which prevails over the v3 text where they differ (FE-2 §2.2, differences M1–M8 recorded there). The return shape is `FocusReturn { kind: 'focus.return', schemaVersion: 1, returnId, digest, capture, scope, source, production, manifest, answers, notes, editReturn: { mode: 'cumulative', transactions: [{ transactionId, changes: ParagraphChange[] }] } }` where each change carries `paragraphId`, `operation: replace | insert | delete | move`, `before` / `after` text and sibling anchors (`H2A:packages/focus/src/editing/contract.ts:1`, `FocusEditingManifest`, `ParagraphChange`, `freezeReturn`). Validation is three-layered (structure / serialisation / semantics) and reconciliation is pure, fail-closed and cumulative (`H2A:docs/focus/document-editing.md:1`, « Three validation layers », « Cumulative reconciliation »). The DS-side lesson: identity, diff and reconciliation belong to the contract owner, and the widget's job is to preserve opaque identities through gestures and to emit complete documents, not diffs.
- RT-0 code exists on `feat/rich-text-core` (read-only in this study via `git show`): `packages/rich-text` (`@sentropic/design-system-rich-text` 0.1.0, `private: true`, MIT) with a pure `.` entry (model, messages, profile descriptors, theme mapping, document equality, external-update decision rules — no Tiptap, ProseMirror, Svelte or DOM import) and a Tiptap-bound `./editor` entry (`git show feat/rich-text-core:packages/rich-text/package.json`, `exports`). The document model is `RichTextDocument { format: 'focus.markdown.p0@1' | 'text/plain', blocks: RichTextBlock[] }` where a block is `paragraph` (editable text) or `preserved` (verbatim `raw` slice, never reserialised), each carrying a host-supplied opaque `paragraphId`; gestures emit `RichTextChangeEvent { document, gesture }` with split / merge / paste identity provenance and explicitly « no text diff is carried » (`git show feat/rich-text-core:packages/rich-text/src/model.ts:1`). Messages are injected with an `⟦untranslated:rich-text.<key>⟧` marker for missing keys (`git show feat/rich-text-core:packages/rich-text/src/messages.ts:1`), and theming is a token-mapping table exported as data (`git show feat/rich-text-core:packages/rich-text/src/theme.ts:1`, prefix `--st-component-richTextEditor`). §4.6 and §6 reuse each of these shapes for cells by analogy, flagged as analogy.
- The pinned-contract limits matter for B3 planning: FE-2 §5.10 / M8 records that the pinned Focus code refuses, at export time, draft paragraph shapes it cannot carry (empty `text/plain` paragraphs, leading / trailing newlines), so the DS allows the gesture locally, claims no agreement for refused shapes and reports them unsupported at export with the draft preserved. A per-cell return would need the same fail-closed reporting discipline: the widget must not block ordinary gestures (Enter, clear) to satisfy a contract that cannot yet carry their result. This study therefore flags the per-cell diff as an h2a contract question (§4.6, §8 Q6) and designs the DS side to emit complete cell state plus gesture provenance, exactly as FE-2 does for paragraphs, so either contract outcome (diff or no diff) remains implementable host-side.
- Sentropic behavioural precedent for text editing (read as behaviour, not code, per FE-2 §2.3): `TipTap.svelte` guards external value changes while focused, restores selection across `setContent`, drives `editable` from `disabled`, and destroys the editor on unmount; `EditableInput.svelte` adds debounced autosave and the viewer / locked rule (« a viewer can neither type nor trigger any save, including via paste and shortcuts », `SENT:spec/COLLAB.md:346`). B1 owns the full inventory; B3 only notes that a spreadsheet embedded in the same screens must obey the same locked rule (§6.3).

### 2.5 Reverse-engineering method precedent (how this repo measures a reference)

- Three merged studies define the method this study follows at STUDY rung: `DS:spec/SPEC_RE_BPMN_JS_PARITY.md` (bpmn-js / diagram-js parity on `@sentropic/graph`), `DS:spec/SPEC_RE_XYFLOW_PARITY.md` and `DS:spec/SPEC_RE_JOINTJS_PARITY.md`. Their shared contract: pinned sources in `.ds-scrap/re-sources/MANIFEST.md`; a mechanically enumerated inventory (for BPMN: 1237 entries across 14 families, produced by `tools/re-bpmn-js/enumerate.mjs` and guarded by an independently written AST extractor in `tools/re-bpmn-js/verify.mjs`, with « 100 % » defined as exact bijection between the two extractors at the same source and detail, `DS:spec/SPEC_RE_BPMN_JS_PARITY.md`, §3); a renderer-independent target architecture; a differential parity harness; and lots with gates (§9 of that spec). XML lives at the edges, inside tests, per the A′ articulation.
- This B3 study is the *brainstorm* that precedes any such enumeration for spreadsheets: it measures the reference coarsely (counts, architecture, model, pipeline) to size the tiers, and its lots (§7) include, as an explicit early lot, the mechanical enumeration (plugins, commands, functions, workbook fields) with the same two-extractor guard before any parity claim is made. No parity percentage is claimed anywhere in this study.
- The licensing discipline of the precedents applies unchanged: catalogue names are coverage references, not reuse rights; third-party dependencies embedded in reference recipes (Handsontable proprietary, ELK EPL-2.0, libavoid LGPL) must be replaced, never shipped (`DS:spec/SPEC_RE_JOINTJS_PARITY.md:23`, `DS:docs/graph-dataviz-reference-catalog.md:5`). For B3 the corresponding line is sharper: the reference *itself* is LGPL, so the clean-room boundary in §4.4 governs every lot.

### 2.6 Collaboration references pinned alongside (for B2 alignment)

- The brainstorm pin added, next to o-spreadsheet, `yjs` v13.6.33, `y-prosemirror` v1.3.7, `tiptap` v3.32.0 and `hocuspocus` v4.7.1 (`.ds-scrap/re-sources/MANIFEST.md`, « Added 2026-10-19 »). Measured licences on disk: `yjs` is MIT (`.ds-scrap/re-sources/yjs/package.json:73`, `"license": "MIT"`; README: CRDT framework with shared types, network-agnostic, offline editing, undo / redo, shared cursors); `y-prosemirror` is MIT (`.ds-scrap/re-sources/y-prosemirror/package.json`, `"license": "MIT"`). The `tiptap` checkout's root manifest is the monorepo root (`private: true`, no licence field observed at the root; the published `@tiptap/*` package licences are `unknown` from this checkout alone — §2.9). The `hocuspocus` checkout returned no `license` field from the grep in this session (`unknown`, §2.9). These pins are B2's primary material; B3 records them only to state the alignment requirement (§6.3): the spreadsheet must not invent a second lock / presence / concurrency model next to whatever B2 selects for rich text and canvas.
- The reference's own collaborative choice (server-ordered OT over revisions, §2.1.7) and Yjs's choice (CRDT shared types) are the two poles B2 must reconcile. They are not interchangeable at the cell level: OT transforms *commands* (including grid-structure commands such as insert-column), while a CRDT spreadsheet binding would share *state* (cells map, sheet order) and must still define how structural operations and formula dependencies converge. §6.3 states B3's requirements without picking the pole.

### 2.7 Repo conventions that bind a spreadsheet package

- Framework parity is measured, never claimed from types: the DS delivers the same component contract in Svelte, React, Vue and Angular (§2.2.1) and records parity per component after a real vertical scenario (FE-2 §4, Stage gates). A spreadsheet must follow the same staging: neutral core first, one framework adapter delivered and gated, the others announced only when their gate passes.
- No hard-coded language: component labels and messages are injected (DataTable's `*Label` props; rich-text's `RichTextMessages` catalogue with the untranslated marker). A spreadsheet has far more strings (function names and descriptions, error messages, menu labels, number-format names); §6.4 designs the catalogue accordingly and keeps formula *syntax* (function names in stored formulas) distinct from formula *presentation* (descriptions shown in autocomplete), because stored names are data compatibility, not UI language.
- Offline: a no-CDN offline capability must remain possible (owner rule). FE-2 states it as: the DS ships ESM + CSS, the host bundles everything, no CDN, no remote font, no network call from the component (FE-2 §8, RT-D5). A spreadsheet must meet the same bar, including its formula engine and any xlsx code (which must not fetch DTDs, schemas or fonts). §6.5 makes this a lot gate.
- Reactivity and atomicity of edits outrank artefact size (owner rule). For a spreadsheet this means: a cell edit, its dependent recalculations and the emitted change are one atomic, synchronously observable step; a partially recalculated state must never be emitted or rendered as final. §4.3 and the lot gates (§7) encode this as a testable invariant, ahead of bundle-size optimisation.

### 2.8 Summary of the inventory (what exists, what does not)

| Question | Measured answer |
| --- | --- |
| DS editable grid / spreadsheet | Does not exist. Read-only `DataTable` / `Table` in four frameworks (§2.2.1). |
| DS formula engine | Does not exist. No tokenizer, parser, evaluator or function library in `DS:packages`. |
| DS workbook / cell model | Does not exist. Closest scalar union is dataviz `Cell` and the reference `CellValue`, both `string \| number \| boolean \| null` (§2.2.2, §2.1.3). |
| Charts bindable to ranges | Charts exist (dataviz-core + four bindings); range binding does not (§2.2.2). Layering forbids DS → dataviz imports (§2.2.4). |
| Canvas grid rendering in DS | Does not exist. `diagram-canvas` is a headless diagram scene, not a grid renderer (§2.2.3). |
| Sentropic spreadsheet editor | Does not exist. Read-only Sheets connectors + server-side sheet reading (§2.3). |
| Existing model to reuse (owner rule) | None for workbooks. `diagram-core` disciplines are reusable as patterns; its meta-model is not (§2.2.3, §4.1). The h2a Focus contract is the model for *returns*, not for workbook state (§2.4). |
| Reference scope | 1046 source files, ~141k lines, 336 functions, 171 command names, canvas grid + OT collaboration + xlsx (§2.1). Full parity is not a component-sized effort. |

### 2.9 Unknowns and source gaps (collected)

| # | Item | Tag | What would settle it |
| --- | --- | --- | --- |
| U1 | Published `@tiptap/*`, `hocuspocus` package licences as resolved from the registry (only monorepo checkouts were read; no network) | `unknown` | Registry / lockfile read at lot start (§7 Lot SS-0). FE-2 §9 governs the Tiptap line for rich text; a spreadsheet must not assume it transfers. |
| U2 | Implementation and licence of sentropic's server-side xlsx reading behind `SENT:spec/TOOLS.md:41` (parser library, formula evaluation depth) | `source-gap` | B1 / sentropic read of the tool implementation. Needed only if §5 Option D (host-side reading) is pursued. |
| U3 | Real spreadsheet usage in sentropic or h2a today: which screens, how many rows / columns, which functions, xlsx fidelity expectations | `unknown` | Owner / B1 usage inventory. Drives the S1 function subset (§8 Q2) and the performance envelopes (§6.1). Until then, subsets and envelopes in this study are proposals, not measurements. |
| U4 | B2's selected lock / presence / concurrency model (OT vs CRDT vs single-writer lock) | `unknown` (parallel run) | B2 study + joint interface (§6.3). S3 cannot be designed until this lands. |
| U5 | Permissive formula-engine candidates' current licences, maintenance and Excel-semantics fidelity (no network in this study) | `unverified` per candidate (§5.3) | Licence + semantics spike at Lot SS-2 start, with registry and repository reads. No candidate is recommended for adoption before that spike. |
| U6 | Whether any consumer needs print / PDF rendering of sheets, pivot tables, or macro / external-link support | `unknown` | Owner (§8). Assumed out (§9) until stated. |
| U7 | Performance of DOM vs canvas grids at DS scale in the four frameworks (no DS grid exists to measure) | `unknown` | Lot SS-1 measurement harness (§6.1, §7). The brief's D22 discipline forbids assuming the answer. |

---

## 3. Observable behaviour

This section states what a user can do, per surface, in the reference (measured in §2.1) and what the DS tiers would expose. It is the behavioural contract the lots in §7 are gated against. Reference behaviours are cited to §2.1 subsections; DS tier behaviours are `ds-proposition`.

### 3.1 The grid surface (all tiers)

Reference behaviour (§2.1.6, §2.1.2): the user sees one sheet as a scrollable canvas grid with row / column headers, a selection (single cell, range, whole rows / columns), an in-cell composer for editing, column / row resizers, scrollbars, freeze panes, merged regions, and overlays for figures and collaborators. Keyboard: arrows move the anchor, Shift extends, Enter commits and moves, Escape cancels, Tab moves across, copy / paste / cut work through the OS clipboard and an internal clipboard, undo / redo are available, and function keys / shortcuts drive formatting and navigation (command vocabulary, §2.1.2). Mouse: click selects, double-click edits, drag extends or fills (autofill handle), drag on headers resizes or reorders, right-click opens cell / row / column menus.

DS tier reading:

- S0 keeps: navigation (arrows, Tab, PageUp / Down, Home / End, Ctrl+arrows to data edges), range selection, in-place editing with commit / cancel, fill-handle-free copy / paste (values and, within the workbook, cell types), insert / delete rows and columns, resize, hide / show, sort and filter at the grid level (reusing DataTable's sort semantics where they coincide), undo / redo. S0 drops: formulas in cells (a leading `=` is stored as text and flagged, never evaluated), merges, freeze panes, figures.
- S1 adds: formula entry with syntax highlighting and function autocomplete in the composer, range picking while editing, recalculation on commit, error values in cells with an injected error description, and name-box navigation (type `B12` or a named range to jump). No chart or formatting behaviour changes.
- S2 adds, only behind its gate: sheet tabs (create, rename, duplicate, delete, reorder, colour, hide, lock), merges, freeze panes, number formats and cell styling, conditional formats, data validation dropdowns, and charts anchored to the sheet.
- At every tier the grid is controlled: the host supplies the workbook value and receives complete-workbook (or complete-sheet, see §4.2) change events with gesture provenance; the component never persists, fetches or routes. Read-only / disabled / locked states remove editing affordances entirely (no hidden save path via paste or shortcuts, per the §2.4 locked rule).

### 3.2 The formula surface (S1 and above)

Reference behaviour (§2.1.4): typing `=` opens formula editing; the composer tokenises live (references coloured, ranges highlighted in the grid), autocompletes function names with injected descriptions and argument hints, and commits to a compiled formula whose evaluated value is displayed while the formula remains visible in the formula bar. References may be relative (`A1`), absolute (`$A$1`), mixed, cross-sheet (`Sheet2!A1`), ranges (`A1:B2`), whole-column / row, named ranges, and structured spill references (`#`). Operators include arithmetic, comparison, concatenation (`&`), postfix percent (`%`) and spill (`#`). Circular references, unknown functions, bad expressions and division by zero surface as error values (§2.1.3), not as crashes. Copying a formula cell adjusts relative references; the compiled-form cache makes this cheap.

DS S1 proposal (`ds-proposition`, detailed in §4.3): a named subset of this behaviour — A1 references (relative / absolute / mixed), ranges, cross-sheet references within the workbook, the operator set above minus spill in the first subset, and a function subset (§8 Q2 proposes the subset ballot). Dynamic arrays / spill, structured table references, external-workbook references and volatile functions with side effects are deferred (§9). The user-visible invariant is Excel / Google-Sheets familiarity for the subset: the same formula text gives the same value (or the same error value) as the reference semantics for every case in the differential corpus (§7), and any case outside the subset gives an explicit unsupported signal rather than a silently different value.

### 3.3 The workbook surface (S2)

Reference behaviour (§2.1.5): sheet tabs, tab menus, sheet-level protection (locked sheet refuses edits with a reason), header grouping (outline collapse), table styles, pivot creation, image / chart insertion and resizing via DOM figure overlays, and a print preview surface. Collaboration behaviour (§2.1.7): remote cursors with client name tags on the grid, remote selections highlighted, edits appearing live, and undo that only undoes one's own revisions (selective history).

DS S2 proposal: sheet management, merges, freeze panes, styling, conditional formats and validation first; charts bound to ranges (§6.6) as a separate gated step; pivots, images, print and dashboard mode deferred (§9). Sheet lock in S2 means the reference's user-facing protection flag; it is not the collaboration lock (§6.3 keeps the two apart).

### 3.4 Import / export behaviour (S3, edges only)

Reference behaviour (§2.1.8): opening an `.xlsx` converts it to the JSON model with warnings for lossy conversions; exporting writes an `.xlsx` from the JSON model. CSV / TSV paste and copy are the everyday interchange. DS proposal: S0 already supports TSV / CSV clipboard interchange (paste a TSV block, copy a range as TSV) because it costs no file-format code; `.xlsx` import / export is S3, lives outside the core package (§4.5), reports every loss as a typed warning (feature, range, reason) and never silently drops formulas, formats or sheets. Google Sheets / Odoo JSON are not import formats (§9).

### 3.5 What the user never sees (non-behaviours)

At every DS tier: no network request from the component, no CDN asset, no telemetry, no built-in natural language (missing catalogue entries render the untranslated marker, §6.4), no partial recalculation presented as final (§2.7), and no data loss on unsupported input — unsupported paste kinds, unsupported formula functions and unsupported xlsx features are reported with kinds / ranges and the prior state is preserved (§4.2, §7 RED witnesses). These non-behaviours are gated, not aspirational (§7).

---

## 4. The model

### 4.1 Is there an existing model to reuse? (owner rule: no new model where one exists)

Candidates examined and the verdict for each:

| Candidate | What it is | Verdict |
| --- | --- | --- |
| `diagram-core` meta-model (entities / relations / ports / occurrences, `DS:packages/diagram-core/src/document.ts:1`) | Versioned semantic documents for diagrams | Rejected as the workbook model. A cell is not an entity occurrence; formulas, ranges and sheet geometry have no counterpart there. Reuse its *disciplines* (transactions with inverses, explicit revision conflict, canonical JSON, `DS:packages/diagram-core/src/commands.ts:1`) as design patterns, with no import (the layering guard forbids DS → diagram-core in any case, §2.2.4). |
| dataviz `DataModel` / `Row` (`DS:packages/dataviz-core/src/model.ts:1`) | BI dimensions / measures over row records | Rejected as the workbook model. It describes a dataset's shape, not addressable cells, formulas or sheets. It is the *target* of a range projection for charts (§6.6), not the source model. |
| `DataTable` props (`columns` + `rows`, §2.2.1) | Display contract for read-only tables | Rejected as the workbook model; retained as the S0 *interchange* shape. A DataTable value is a projection of a sheet range (headers + rows), useful for embedding and testing, but it cannot hold formulas, merges, multiple sheets or cell-level types. §4.2 defines the projection both ways. |
| h2a Focus editing manifest / return (`H2A:packages/focus/src/editing/contract.ts:1`) | Paragraph identities, per-paragraph diff, cumulative reconciliation | Not a workbook model. It is the contract a *return* would follow if the owner commissions a per-cell return (§4.6). Workbook state itself stays DS-owned JSON (§4.2). |
| Sentropic connectors / tools (§2.3) | Read-only external sheet access | No reusable model. Their A1-range read shape confirms A1 notation as the interchange vocabulary; nothing else transfers. |
| Reference `WorkbookData` (`REF:src/types/workbook_data.ts:81`) | The LGPL JSON model | Behavioural reference only. Its *shape decisions* (sheets array, cells keyed by address, interned style dictionaries, locale as data) are studied in §2.1.3; its types, field order and file are not copied (§4.4). |

Conclusion (`ds-proposition`): no existing model covers workbooks, so the smallest new model in §4.2 is required. This satisfies the owner rule by exhaustion: the rule forbids duplicating an existing model, and the inventory shows none exists for this domain.

### 4.2 The smallest workbook model (JSON first) — `ds-proposition`

Design constraints taken from the measured precedents: JSON first, as the h2a / Focus contracts are (a single serialisable value, versioned, with canonical form for hashing); framework-neutral and DOM-free (the `diagram-core` / RT-0 pure-entry discipline); stored / evaluated separation (§2.1.3); sparse by default (empty cells cost nothing); and small enough that S0 can ship without S1 fields becoming dead weight. Field names below are proposals for the EVOL rung, stated here so interfaces (§6) can be discussed; they are not a committed schema.

```text
Workbook {
  version: 1,
  sheets: Sheet[],            // array order is tab order
  activeSheetId: string,
  namedRanges: { [name: string]: string },   // name -> "Sheet!A1:B2" (S1+; {} at S0)
  locale: Locale,             // { code, decimalSeparator, thousandsSeparator?, dateFormat, timeFormat, formulaArgSeparator, weekStart }
  revision: number            // monotone counter, bumped once per atomic change (diagram-core discipline)
}
Sheet {
  id: string,                 // opaque, host-allocated, stable across renames
  name: string,               // display name, unique per workbook (case-insensitive)
  rowCount: number, colCount: number,
  cells: { [a1: string]: Cell },   // sparse; only non-empty cells present. Key is "B12" (no sheet prefix)
  rows: { [row: number]: { size?: number, hidden?: boolean } },
  cols: { [col: number]: { size?: number, hidden?: boolean } },
  merges: string[],           // "A1:B2" (S2; [] at S0/S1)
  panes: { xSplit: number, ySplit: number },  // freeze (S2; 0,0 before)
  conditionalFormats: [], dataValidationRules: [], figures: [],   // S2; [] before
  isVisible: boolean, isLocked: boolean, color?: string
}
Cell {
  content: string,            // exactly what the user typed: "42", "TRUE", "hello", "=SUM(A1:A3)", "" never stored (absence = empty)
  // S1 evaluation cache is NOT stored here; see below.
}
```

Decisions inside the sketch, each `ds-proposition`:

1. Cells keyed by A1 address in a sparse record (reference behaviour, §2.1.3) rather than a dense 2D array: measured workbooks are sparse, JSON diffs stay small, and a range read is a key filter. Row / column counts bound the grid; inserting rows re-keys affected cells in one transaction.
2. Stored content is always the typed string; type inference (number / boolean / date / text / formula) happens at parse time into a separate evaluated map `{ [a1]: EvaluatedValue }` owned by the evaluator, never persisted in the workbook JSON. `EvaluatedValue = { type: 'number'|'text'|'boolean'|'empty'|'error', value, formatted: string }` mirrors the reference's evaluated union (§2.1.3) without copying its types. Persistence, diffing and collaboration therefore operate on typed strings only — the property that lets S3 choose OT-over-commands or CRDT-over-state later without migrating stored data.
3. Styles / formats / borders are *not* in the S0 / S1 model. When S2 adds them, they follow the reference's interning idea (dictionaries + zone → id maps) as a separate additive field, so S0 / S1 workbooks remain valid S2 workbooks with empty dictionaries. Number formatting needed by S1 (display of evaluated values) is a *presentation* concern: the evaluator produces a default formatted string from the locale, and explicit number formats wait for S2. This is the model's main deliberate divergence from the reference, taken to keep S1 small; §8 Q3 asks the owner to confirm it.
4. Identity: sheets have opaque stable ids; cells have no identity beyond (sheetId, address). This is the crucial difference from FE-2 paragraphs (which carry host-supplied opaque ids surviving split / merge). A cell's address *is* its identity until a structural operation (insert row, delete column, move sheet) transforms it — which is precisely what OT transforms or CRDT structural operations must define (§6.3). Giving every cell a persistent id (paragraph-style) was considered and rejected for S0 / S1: it multiplies storage and diff size for every workbook to serve a return contract that does not yet exist (§4.6). If the owner commissions a per-cell return, the adapter can allocate ephemeral ids host-side from (sheetId, address, revision) without changing stored data.
5. Versioning and canonical form: `version: 1` with additive-only evolution (new optional fields, never reinterpreted ones), migrations as pure functions (reference precedent: `REF:src/migrations/data.ts`), and a canonical JSON serialisation (sorted keys, no whitespace variance) for hashing, following `diagram-core` canonical + hash and the Focus RFC 8785 discipline by analogy. The workbook hash, if a return ever needs one, is computed host-side; the DS core exports the canonicaliser, not a digest policy.
6. DataTable projection: `sheet → DataTable` (first row or named header row → `columns`, remaining rows → `rows` with generated ids) and `DataTable → sheet` (values only, types inferred) are pure functions in the core, so S0 embeds in existing screens and tests without the full grid component. The projection is lossy (formulas become values or text per a flag) and says so in its return type.

### 4.3 Formulas at S1: parser, evaluator, dependency graph — `ds-proposition`

The S1 engine is a pure package (no DOM, no framework) with four stages, each independently testable:

1. Tokeniser (locale-aware: decimal separator, argument separator, string quoting, reference lexing including `Sheet!A1`, `$` absolutes and range `:`). Rejects unknown characters as a typed parse error with position, never as an exception escaping the package.
2. Parser → AST (`number | string | boolean | reference | range | unary | binary | funcall | array`), with Excel-compatible precedence and associativity stated as a table in the EVOL and tested per row. Array constants are parsed (needed for corpus compatibility) but spill evaluation is deferred (§9).
3. Dependency extraction: every AST yields its referenced addresses / ranges / names; the evaluator builds a directed graph (cell → precedents) per sheet (cross-sheet edges included) and evaluates in topological order, detecting cycles and reporting the cycle members as `#CYCLE` error values on exactly those cells. Recalculation is incremental: editing a cell re-evaluates its transitive dependents only, and the edit + full recalculation commit atomically (§2.7). Volatile functions (if any are admitted) are the explicit exception, listed in the function registry.
4. Function registry: name → `{ arity, argument types, evaluate(args, context), volatile?, descriptionKey }`, where `descriptionKey` is a catalogue key (§6.4), never a hard-coded description. Stored function names are the Excel English names (data compatibility); autocomplete shows the localised description next to the canonical name. Hosts may register additional functions through the same registry (reference precedent: `addFunction`, §2.1.4) without forking the evaluator. Unknown functions evaluate to the unknown-function error value and are reported in the change event (kinds + positions), so a host can surface « this workbook uses functions outside the subset » instead of silently miscalculating.

Error values at S1 (`ds-proposition`, ballot in §8 Q2): `#DIV/0!`, `#NAME?`, `#REF!`, `#VALUE!`, `#N/A`, `#NUM!`, `#CYCLE` (cycle), `#BAD_EXPR` (parse failure) — aligned with the reference's ten-code vocabulary (§2.1.3) narrowed to what the subset can produce, with `#SPILL!` / `#NULL!` reserved. Errors propagate: a precedent's error value makes dependents error values (except functions documented to handle errors, e.g. `IFERROR`), matching reference / Excel behaviour in the corpus.

Performance shape (to be measured, §6.1): parse once per edit (not per recalculation), compiled-form cache keyed by formula structure (reference behaviour, §2.1.4) so filled / copied formulas share compilation, and range dependencies stored as ranges (not expanded cell lists) so `SUM(A:A)` does not materialise a million edges. Whole-column references are evaluated over the sheet's used range.

### 4.4 Clean-room boundary (licence) — constraint, not a proposition

- The reference is LGPL-3.0-or-later (§2.1.1). DS packages are MIT (§2.2.4). Therefore: no source file, test file, data file (including demo data), grammar, function implementation or comment is copied from `REF:` into any DS package; no LGPL package (including `@odoo/o-spreadsheet` itself) becomes a dependency (runtime, dev, peer or optional) of any DS package without an owner decision recorded in the EVOL.
- What *may* be taken: observable behaviour (what a formula computes, what a command does to the JSON, what the user sees), measured counts, and architectural ideas (plugin separation, stored / evaluated split, server-ordered revisions) re-expressed in DS terms. This is the same line the RE precedents hold for JointJS / BPMN (§2.5).
- Enforcement in the lots (§7): a provenance note per package (`MAPPING.md`-style, following the theme-clone precedent), a dependency-manifest check in Lot SS-0 (the new packages' manifests list no LGPL dependency), and the existing licensing guard (§2.2.4) which fails if notices drift. Behavioural corpus cases (§7) are authored from spreadsheet semantics (Excel / Google Sheets documented behaviour and hand-computed expectations), not transcribed from reference test files; where a case is inspired by reference behaviour, the expectation is computed independently and the inspiration is noted without copying assertions.

### 4.5 Package placement — `ds-proposition`

Following the `codemirror` / `rich-text` precedent (neutral core + thin adapters, §2.2.4, §2.4):

- `packages/spreadsheet-core` (`@sentropic/design-system-spreadsheet-core`, name to be ratified at VOL): the pure model (§4.2), parser / evaluator / registry (§4.3), DataTable projection, canonicalisation, and the gesture / change-event types. No DOM, no framework, no Tiptap, no dataviz import. Two entries mirroring RT-0: `.` (pure: model, projection, canonical form, messages catalogue type, theme-mapping data) and `./engine` (tokeniser / parser / evaluator, the heavier graph code) so a consumer rendering a read-only grid never loads the formula engine. Posture `private: true` until the owner decides publication (the `diagram-core` / `rich-text` posture), so the licensing count (§2.2.4) is untouched until then.
- Framework adapters (`SpreadsheetGrid` / `Spreadsheet` components) live in the four `components-*` packages behind explicit subpath exports (the FE-2 `./rich-text-editor` pattern), never on the barrel, so a `Button` import never loads the grid or the engine. Svelte is delivered first (both current consumers are Svelte, §2.4); React / Vue / Angular follow as staged gates (§6.5), never pre-claimed.
- xlsx, if commissioned (S3), is a separate package or a `./xlsx` subpath of the core with the zip / XML dependencies isolated there, so grid-only consumers never load it (§2.1.8 sizing is the reason). Charts binding (§6.6) is composed by the host, not by the core, per layering.

### 4.6 Relation to FE-2: rich-text cells and the per-cell diff question

- Rich-text cells: the reference has none (§2.1.9); DataTable cells render plain strings or host snippets (§2.2.1). Proposal (`ds-proposition`): S0 / S1 cells are plain text / typed values only. A cell that needs formatted text is, at S2 at the earliest, a *host-rendered* cell (the grid delegates that cell's rendering / editing to a host snippet which may embed the FE-2 `RichTextEditor` for that cell's content), with the stored cell content remaining a string in the workbook JSON (Markdown source under the FE-2 profile identifier if the host so chooses). The grid never imports Tiptap itself; the `./editor` boundary of `rich-text` (§2.4) is consumed by the host, not by `spreadsheet-core`. This keeps the two editors composable without coupling their release trains, and it reuses FE-2's preserved-block lesson: content the grid cannot represent is preserved verbatim, never destroyed.
- Per-cell diff for the AI edit-return: **flagged as an h2a contract question, not settled here.** The owner's 18/10 request asks for a per-paragraph diff in the YAML / JSON return for text (§1, header). Whether a workbook edit should return `transactions[].changes[]` with per-cell `before` / `after`, addresses and anchors analogous to `ParagraphChange` (`H2A:packages/focus/src/editing/contract.ts:1`) is for h2a / Focus and the owner to decide (§8 Q6), because only the contract owner can define cell identity under structural operations (§4.2 decision 4), cumulative reconciliation semantics for ranges, and digest domains. DS-side commitment made here regardless of that decision: the grid emits (a) the complete new workbook (or sheet) value, (b) gesture provenance per completed gesture (kind: type / formula-edit / paste / fill / insert / delete / sort / sheet-operation; affected addresses / ranges in resulting order; structural operations with their address transform), and (c) readiness / composition signals analogous to FE-2 §5.6 — never a computed diff, never a retained baseline. A host-side Focus adapter can then compute any per-cell diff the future contract defines, exactly as the FE-2 adapter computes the per-paragraph diff today (§2.4). If the owner decides against a per-cell return, nothing in the DS changes.

---

## 5. Options

Four options were considered. Each is stated with effort, risk, licence, offline, framework parity and fit with FE-2 and the h2a contract. Effort is expressed in DS lots (§7) and in relative size against the measured reference (§2.1.1); no calendar estimate is given where the usage inventory (U3) is missing.

### 5.1 Option A — Build in the DS, from behaviour, tiered S0 → S1 → (gated) S2 (`ds-proposition`, recommended)

Shape: `spreadsheet-core` pure package (§4.5) + Svelte adapter first, staged to the other frameworks; DOM grid first with a measured canvas decision (§6.1); own formula engine for the S1 subset (§4.3); xlsx and collaboration not delivered until S3 decisions.

| Dimension | Assessment |
| --- | --- |
| Effort | Largest build effort of the four, but tiered: S0 (model + DOM grid + DataTable projection) is component-sized; S1 (engine + differential corpus) is the first programme-sized lot; S2 is explicitly gated and descoped (§3.3). The mechanical enumeration lot (SS-0) bounds the parity denominator before S1 is estimated. |
| Risk | Technical risk concentrated in formula semantics (differential corpus mitigates) and grid performance (measurement gate mitigates, §6.1). No licence risk. Schedule risk if the owner later demands full 336-function or xlsx fidelity — mitigated by naming the subset and the fidelity spectrum up front (§8 Q2, Q5). |
| Licence | Clean: all-new MIT code, no LGPL dependency, licensing guard passes by construction (§4.4). |
| Offline | Full: pure TS engine, no network, no CDN, host bundles everything (§6.5). |
| Framework parity | Best fit: neutral core + staged adapters is the DS pattern (§2.2.4, §2.4). Parity claimed per stage gate only. |
| FE-2 / h2a fit | Best fit: controlled value + gesture provenance mirrors FE-2 (§4.6); per-cell return remains computable host-side; language injection and token theming follow FE-2 shapes. |

### 5.2 Option B — Build the grid in the DS, adopt a permissive engine for formulas only

Shape: Option A for S0 and the grid, but the S1 tokeniser / parser / evaluator (or only the function library) is an adopted MIT / Apache library behind the §4.3 registry interface, so the DS owns the model and the grid but not the formula semantics.

Candidates (named as the brief requires; every licence below is `unverified` in this study because no network was available to check the registry or the repository — §2.9 U5; none is recommended until the Lot SS-2 spike verifies licence, maintenance, TypeScript quality, offline bundling and semantics):

| Candidate (to verify) | Claimed shape | Licence to verify | Fit note |
| --- | --- | --- | --- |
| HyperFormula (Handsontable's engine) | Full Excel-semantics engine with dependency graph | `unverified` — believed GPL-3.0 / commercial dual licence; if confirmed, it fails the permissive-only requirement and is excluded | Named precisely so the spike can exclude it on evidence rather than adopt it by reputation. |
| `@formulajs/formulajs` (Formula.js lineage) | Function library (Excel functions as JS functions), no parser / graph | `unverified` — believed MIT | Could supply function *implementations* only; parser, references, ranges and recalculation would still be DS-built (§4.3 stages 1–3). |
| `fast-formula-parser` | Formula parser + evaluator over a cell provider | `unverified` — believed MIT | Closest shape to stages 1–4 together; semantics coverage and maintenance to be measured against the differential corpus. |
| `formula-parser` (hot-formula-parser lineage) | Parser with variable / function hooks | `unverified` — believed MIT | Similar to the row above; listed so the spike compares at least two parser-shaped candidates. |
| Univer / Luckysheet lineage | Full spreadsheet frameworks | `unverified` — Univer believed Apache-2.0 for parts, Luckysheet believed MIT but legacy / watch per `SENT:spec/SPEC_STUDY_BENCHMARKS_FUNCTIONAL_PERIMETER.md:175` | Framework-shaped, not engine-shaped: adopting one collapses into Option C (a wrapped app), with DS token / parity / controlled-component fit to re-prove. Not an « engine only » adoption. |

| Dimension | Assessment |
| --- | --- |
| Effort | Saves the function-library long tail only if a function-library candidate verifies; saves more if a parser candidate verifies *and* matches Excel semantics on the corpus. The grid, model, graph UI and gates are unchanged from Option A. |
| Risk | Highest uncertainty: licence (see HyperFormula row), semantics drift (an adopted parser's precedence, error propagation or date system differing silently), and abandonment risk. Mitigation: adoption only behind the registry interface, differential corpus as the acceptance gate, and a recorded fallback to Option A for any failing stage. |
| Licence | Conditional: only a spike-verified MIT / Apache candidate with notices generated (§2.2.4) may enter. GPL / commercial candidates are excluded without an owner decision. |
| Offline | Achievable (all candidates are local libraries), to be verified per candidate (no telemetry, no CDN font / worker). |
| Framework parity | Same as Option A (engine is framework-neutral). |
| FE-2 / h2a fit | Same as Option A, provided the engine emits DS error values and dependency information; an engine that hides its graph breaks incremental recalculation and must be rejected on that ground alone. |

Verdict: retained as a *sub-decision inside* the recommended plan (Lot SS-2 opens with the verification spike and may adopt per stage), not as a standalone plan. Choosing it today would be choosing `unverified` licences.

### 5.3 Option C — Wrap o-spreadsheet behind an app-side boundary (LGPL, never inside DS packages)

Shape: sentropic (or another host app) embeds `@odoo/o-spreadsheet` directly — Owl runtime, XML templates, CSS, Chart.js and all — behind an application-side adapter that maps host data to `WorkbookData` JSON (§2.1.3) and host language to `setTranslationMethod`. No DS package depends on it, imports it or re-exports it; DS components may at most provide surrounding chrome (toolbar buttons, panels) that never links the LGPL code.

| Dimension | Assessment |
| --- | --- |
| Effort | Smallest effort to a full-featured sheet (S0–S3 behaviours arrive together, including OT collaboration and xlsx, §2.1). Integration effort is real (Owl lifecycle inside a Svelte app, theming mismatch, bundle size, server for OT ordering) but bounded. |
| Risk | Product risk, not code risk: LGPL obligations travel with the *app* distribution (notice, source offer for the library, relinkability for the IIFE / ESM forms as applicable — to be confirmed by the owner's licence review, not by this study); DS token theming is approximated via CSS variables only; framework parity is nil (Owl only, no React / Vue / Angular story); upstream tracking (Odoo release train, Owl majors) becomes the host's maintenance burden. The DS learns nothing reusable: a second host in another framework restarts from zero. |
| Licence | LGPL-3.0-or-later at the app boundary only. DS packages stay MIT and clean. Requires an explicit owner decision (the brief's rule: « no LGPL package may become a DS dependency without an owner decision » — here it would become an *app* dependency, which still needs the owner's recorded acceptance for the product surface). |
| Offline | Achievable (the library is local static assets; the OT server is the exception — collaboration needs the coordinating server, §2.1.7, so offline collaboration degrades to single-user or queued revisions, to be stated in the host's product contract). |
| Framework parity | None. Acceptable only if the need is Svelte-app-only and time-bound. |
| FE-2 / h2a fit | Weakest: the wrapped editor is uncontrolled in FE-2's sense (its own Model, commands and history), emits no DS gesture provenance, and a per-cell Focus return would need an adapter over its command / revision stream (possible — revisions carry commands, §2.1.7 — but it is new host code with OT-transform semantics to preserve). Language injection exists (`setTranslationMethod`) but the catalogue is the reference's string set, not the DS catalogue. |

Verdict: the right answer *if* the owner needs a complete spreadsheet in one app quickly and accepts LGPL at the app boundary; the wrong answer as the DS plan, because it delivers no DS capital. §8 Q1 puts exactly this fork to the owner. If chosen, it should be recorded as an app decision *instead of* (not before) Lots SS-1 / SS-2 for that host, while SS-0 (enumeration + model) still proceeds so a later DS build inherits the measurements.

### 5.4 Option D — Extend DataTable into an editable grid; no workbook (S0-lite)

Shape: add cell editing (typed inputs, validation, keyboard navigation, clipboard) to the existing four-framework `DataTable`, with columns / rows as the model. No sheets, no formulas, no workbook JSON.

| Dimension | Assessment |
| --- | --- |
| Effort | Smallest DS effort: one component family, four adapters already exist (§2.2.1). |
| Risk | Strategic risk: it answers « editable table » but not the owner's « éditeur type gsheet » (header). Every later step to formulas requires replacing the row-record model with the §4.2 cell model, discarding the editing state machine built here. The JointJS catalogue's « Sentropic DataGrid » forward reference (§2.2.1) suggests this component may be wanted for its own sake — but as a *separate* component, not as the spreadsheet's foundation. |
| Licence / offline / parity | Clean MIT, offline, four-framework parity from day one (the only option with that property). |
| FE-2 / h2a fit | Neutral: a DataTable edit emits row changes, not cell gestures; no path to a per-cell return. |

Verdict: rejected as the spreadsheet plan; noted as a possible *independent* DS component if B1 finds editable-table demand (e.g. in the templater's `ScoreTable`-like fields). It must not be sold as S0, because its model cannot grow into S1 (§4.1).

### 5.5 Adversarial reconciliation (harness-brainstorm gate)

- Lens (a) correctness / licence / layering argued for Option A with Option B's spike inside it: it is the only option that keeps MIT cleanliness, layering, controlled-component discipline and the per-cell-return possibility simultaneously, and it refuses to adopt `unverified` licences.
- Lens (b) user value / time-to-first-grid argued for Option C (a complete sheet now) and, failing that, Option D (editable cells in weeks). It correctly observes that Option A's S1 is programme-sized and that U3 (real usage) is `unknown`, so building 336-function parity blind would waste the effort.
- Reconciliation (the recommendation in §5.6): tiering resolves the divergence — Option A with S0 first delivers an editable grid on DS foundations without waiting for S1; the SS-0 enumeration + the §8 ballots force the usage and subset decisions *before* programme-sized work; Option C remains available to the owner as an app-side fast path (Q1) without contaminating DS packages; Option D is split off as a separate possible component so its genuine value is not used to justify a dead-end model. Lens (b)'s « complete sheet now » is therefore an owner fork, not a study failure to decide.

### 5.6 Recommendation — `ds-proposition`

**Adopt Option A, tiered: build `spreadsheet-core` + Svelte-first grid in the DS from behaviour (S0, then S1 subset), with Option B reduced to a verified sub-decision at the S1 gate, S2 gated on S1 measurements, and S3 (collaboration + xlsx) designed-for but not delivered until B2 and the owner decide. Keep Option C available as an app-side alternative that the owner may choose per host instead of waiting for S1 / S2, with no DS package ever depending on LGPL code.**

Three-line form for the conductor's report: (1) No reusable workbook model or spreadsheet exists in the DS or sentropic, so the plan builds the smallest JSON workbook core and a DOM-first editable grid (S0), then a subset formula engine proven against a differential corpus (S1). (2) Full o-spreadsheet parity (336 functions, OT collaboration, xlsx) is measured as programme-sized and LGPL-bound, so it is gated (S2) or deferred (S3) rather than promised. (3) The owner forks are: DS build vs app-side LGPL wrap, the S1 function subset and compatibility target, and whether h2a commissions a per-cell edit-return.

---

## 6. Interfaces

### 6.1 Rendering: DOM grid or canvas (performance targets measured, not assumed)

The reference renders cells on canvas with DOM overlays (§2.1.6). The DS must not import that conclusion: its constraints differ (four frameworks, DS tokens, DataTable accessibility precedent, no Owl). Proposal (`ds-proposition`): **DOM first at S0 / S1, with a pre-registered measurement that may trigger a canvas cell layer at S2 scale — and no canvas work before the measurement exists.** This follows the brief's D22 discipline: targets are fixed, then measured, never assumed.

- DOM shape at S0 / S1: a `role="grid"` table-like structure (or CSS-grid equivalent with grid semantics) rendering only the visible viewport (row / column virtualisation with spacer rows, the pattern DataTable pagination approximates at page scale), one focusable anchor cell with `aria-activedescendant` or roving tabindex (ballot at EVOL; both patterns are gated by the §6.2 tests), an absolutely-positioned composer input over the editing cell (the reference's composer-overlay idea, re-expressed in DS components), and DOM overlays for selection, fill handle and remote cursors. Visible-cell count, not workbook size, bounds DOM nodes.
- Pre-registered envelopes (to be fixed numerically at VOL with U3 usage data; stated here as the *shape* of the gate): (a) scroll / navigation frame budget at 10k rows × 50 columns with 100×20 visible (key-to-paint latency and scroll frame time, measured with the repo's puppeteer-core harness precedent, FE-2 §2.1); (b) edit-to-recalculated-paint latency at 1k formula cells with a 100-deep dependency chain; (c) memory at the virtualisation boundary (no growth with off-screen rows). Lot SS-1 builds the harness and records the baseline; if DOM misses an envelope, Lot SS-3 may introduce a canvas *cell-paint layer* under the same DOM semantics layer (canvas paints values, DOM keeps focus, selection, composer and accessibility tree — the reference's split, §2.1.6, adopted as a fallback architecture, not as the starting point). `@sentropic/graph` is not used for cells (§2.2.3); any canvas layer is plain Canvas2D in the adapter, consuming one geometry source shared with hit-testing (the `diagram-canvas` / `graph` methodological lesson).
- What is rejected: canvas-first (accessibility tree, text selection, IME and four-framework parity all become reconstructions, §2.1.9 shows the reference itself carries a thin accessibility surface there), and full-DOM without virtualisation (fails envelope (a) by construction at 10k rows).

### 6.2 Accessibility — `ds-proposition`

- Semantics: `role="grid"` with `aria-rowcount` / `aria-colcount` (total, not rendered, counts under virtualisation), `role="row"` / `role="gridcell"` (or `columnheader` / `rowheader` for headers), `aria-selected` on cells / rows, `aria-sort` where grid-level sorting exists (DataTable precedent, §2.2.1), and an accessible name per grid from the injected catalogue (§6.4). Editing cells expose the composer input with its label; error cells expose the injected error description (not only the `#…` code and not colour alone — the `cellDecoration` lesson that tint is never the sole indication, §2.2.1).
- Keyboard contract is §3.1's list, tested as specified behaviour (not as implementation detail): every grid action reachable without a pointer, focus visible via DS tokens, focus never lost on re-render / recalculation / sheet switch, and a focus-return rule after dialogs (format, validation) close. IME composition in the composer must not commit partial compositions (FE-2 readiness discipline carried over: no change event while composing).
- Screen-reader announcements: selection moves and recalculation results are announced through a polite live region only where the EVOL specifies (cell address + value on navigation is host-configurable, off by default to avoid verbosity); validation failures are asserted, not only politely announced. Reduced-motion and forced-colours (Windows high-contrast) behaviour follows DS theme conventions; canvas fallback (§6.1) must preserve the full DOM accessibility tree regardless of paint layer.
- Non-goal at S0 / S1: braille / spreadsheet-specific screen-reader modes beyond the grid contract above. Any stronger claim requires assistive-technology testing recorded at the S2 gate.

### 6.3 Collaboration and locking: the interface B3 needs from B2 (S3, not delivered here)

B2 owns the selection of one lock, presence and concurrency model for canvas / rich-text / spreadsheet (the owner's « fonctions collaboratives (prévoir l'édition concurrente et le lock) », header). B3 states its requirements and the two candidate shapings, and designs S0–S2 so neither shaping requires a model migration (§4.2 decision 2):

- Vocabulary separation (binding on all later specs): *sheet lock* = the user-facing protection flag (§3.3, reference `LockSheetPlugin`, §2.1.5); *document lock / single-writer* = at most one editor at a time with presence showing the holder; *concurrent editing* = simultaneous edits converging (OT or CRDT). These are three different products. The brief's « lock » is ambiguous between the second and third; §8 Q4 forces the owner / B2 ballot. S0–S2 deliver the first (as an S2 flag) and remain compatible with either of the others.
- If B2 selects single-writer lock + presence (the smallest model): B3 needs from B2 the lock identity (document id, holder, expiry / heartbeat), the presence roster shape (client id, display name, colour) and the read-only enforcement contract (locked viewers cannot mutate through any path, §2.4). The grid then renders presence (holder banner, remote selection if the roster carries it) and disables editing when not the holder. No core change: the workbook `revision` (§4.2) is the CAS token the lock service compares.
- If B2 selects concurrent editing: B3 needs B2 to choose between (i) reference-style server-ordered OT over *commands* (revisions carrying synchronised core commands, server CAS on `serverRevisionId`, client transform + selective undo, §2.1.7) — which requires the DS core to expose its mutations as a named command vocabulary with transforms for structural commands, a significant core contract to add at S3; and (ii) CRDT over *state* (shared cells map + sheet list, Yjs-shaped, §2.6) — which requires structural-operation semantics (insert-row as an operation on order + address remapping) and formula-dependency convergence rules, plus an offline merge contract. Either way, formula recalculation stays local and derived (§4.2 decision 2): collaborators synchronise typed strings, never evaluated values, so convergence of inputs implies convergence of displayed values under a deterministic evaluator. Undo semantics (own-changes-only selective undo vs shared undo) must be fixed by B2 before S3; the reference's blocking undo-until-ACK (§2.1.7) is recorded as a known cost of shaping (i), not adopted by default.
- Presence rendering (either shaping): remote cursors / selections as DOM overlays with client name tags (reference behaviour, §2.1.7), colours from DS tokens with non-colour differentiation (name label always present), and no presence information in the persisted workbook JSON (presence is session state, as in the reference's `Session`, §2.1.7).

### 6.4 Language injection, locale and number / date handling — `ds-proposition`

- No hard-coded language (owner rule): the grid takes a `messages` catalogue resolved host-side (the FE-2 / rich-text shape, §2.4): grid label, composer labels, validation messages, error-value descriptions, function descriptions (keyed by canonical function name), sheet-tab actions, import-warning templates. A missing key renders `⟦untranslated:spreadsheet.<key>⟧` with a `data-untranslated` attribute (rich-text marker precedent) — visible in tests, never a hard-coded sentence in any language. Function *names in stored formulas* stay canonical English (data compatibility, §4.3); only descriptions and UI text localise.
- Workbook locale (§4.2) is data, distinct from UI language: decimal / thousands separators, date / time formats, formula argument separator and week start travel with the workbook (reference `Locale`, §2.1.3), defaulting from the host locale at creation. The tokeniser and the number / date parsers consume the workbook locale; the UI catalogue consumes the UI language. Confusing the two is a tested failure (e.g. `1,5` must parse as one-and-a-half under a comma-decimal workbook locale regardless of UI language).
- Dates are serial numbers with date formats (spreadsheet convention), with the epoch and the 1900 leap-year compatibility behaviour stated explicitly at EVOL and corpus-tested (§7); the DS model stores the serial as a number cell with a format, never as an ISO string, so arithmetic (`date + 1`) works. Time zones never enter cell arithmetic (serials are naive); any host needing zoned dates formats at the boundary.

### 6.5 Offline, packaging and framework staging — `ds-proposition`

- Offline (owner rule): the core and adapters perform no network access, load no CDN asset and require no server for S0–S2 (reading, editing, undo, recalculation, TSV / CSV interchange). Tests assert this the FE-2 way (no-network witness: the package graph contains no fetch / XHR / remote URL, and a mounted grid works in a network-disabled harness). S3 collaboration is the sole exception and degrades as §5.3 states. xlsx code (S3) must parse XML without external entities / DTD fetching (XXE-safe configuration, tested with a hostile fixture).
- Packaging mirrors §4.5 + FE-2 §8: the core ships ESM + types (no CSS asset; token mapping exported as data), adapters ship component + one stylesheet via explicit subpaths (`./spreadsheet`, `./spreadsheet.css` shape, final names at VOL), the host bundles core + adapter + catalogue into its artefact. `pack:smoke` gains the new tarballs and `licensing:check` the new count if / when the owner makes the packages publishable; while `private: true`, both gates must still pass (§2.2.4). A plain DS barrel import never loads the grid or the engine (packaging witness, §7 RED-P analogue).
- Framework staging: Stage 1 = core + Svelte adapter (S0, then S1). Stage 2a / 2b / 2c = React / Vue / Angular adapters on the same core, each gated by the same RED list executed against that adapter plus a real vertical scenario (mount, edit, formula, paste, unmount), with parity recorded and residue named (FE-2 §4.3 discipline). No stage is announced before its gate; docs state exactly « spreadsheet available for Svelte; core framework-neutral; React / Vue / Angular not delivered » until each lands.

### 6.6 Charts bound to ranges (dataviz interface) — `ds-proposition`

- Ownership under layering (§2.2.4): `spreadsheet-core` defines the *binding value* — `{ sheetId, range: "A1:B2", headers: 'first-row'|'first-column'|'both'|'none', seriesDirection }` — as pure data, and a pure projection `range → { model: DataModel-shaped, rows: Row[] }` using dataviz-compatible scalar types (§2.2.2) *without importing dataviz-core* (structural typing, no manifest dependency). The host (or a future non-DS-namespace composition package) feeds that projection to `dataviz-core` builders and renders DS chart components; the grid renders only the chart's anchor / selection affordance (S2 figures), or nothing at all if the host places charts outside the sheet. This keeps the forbidden DS → dataviz edge absent while making binding a one-function host concern.
- Reactivity: the projection is recomputed from evaluated values (§4.3) on each atomic change; charts therefore update in the same commit as recalculation, never from stale intermediates (§2.7). Range references follow structural edits through the same address transform as formulas (§6.3), and a deleted range produces an explicit broken-binding state (injected message), never a silently retargeted chart.
- Reference comparison: the reference embeds Chart.js figures inside the sheet (§2.1.5). The DS deliberately does not embed a chart renderer in the grid; DS charts already exist (§2.2.2) and embedding a second renderer would duplicate them. Figure-anchored in-sheet charts, if ever required, are an S2 extension consuming the same binding value.

### 6.7 Interfaces with FE-2 (RT lots), B1, B2, h2a and sentropic (summary)

| Counterpart | B3 gives | B3 needs | Settled where |
| --- | --- | --- | --- |
| FE-2 / RT lots (`packages/rich-text`, Svelte adapter) | A grid that never imports Tiptap; a host-composition point for rich-text cells at S2 (§4.6) | The published `RichTextEditor` subpath + `./editor` boundary if rich-text cells are commissioned; shared catalogue / token conventions | §4.6; RT stage gates (FE-2 §4.3). No RT lot is blocked by B3. |
| B1 (sentropic editables) | The workbook model + grid as a candidate templater field type; the DataTable projection for `ScoreTable`-like fields | The templater field inventory: which fields are grids vs tables vs text, sizes, autosave / lock expectations (§2.3, §2.4) | B1 study; joint interface at VOL. |
| B2 (collaboration / locking) | Workbook `revision` as CAS token; typed-string-only synchronisation unit; presence rendering points (§6.3) | One lock / presence / concurrency model; undo semantics; roster shape | B2 study; §8 Q4. S3 blocked on it by design. |
| h2a / Focus (`98060bd0a` contract) | Complete workbook + gesture provenance + readiness, diff-free (§4.6) | Decision: per-cell return or not; if yes, cell identity + reconciliation semantics owned by Focus | §8 Q6 (h2a contract question). FE-3+ witnesses unchanged until then. |
| Sentropic app | Embeddable Svelte grid; TSV / CSV interchange; (S3) xlsx at the edges | Host bundling, catalogue resolution, persistence, server (only for S3 collaboration / xlsx services if host-side) | Host integration, not a DS lot. Connectors (§2.3) remain read-only and unchanged. |
| dataviz (`dataviz-core` + bindings) | Range-binding value + structural projection (§6.6) | Nothing (no import). Chart rendering stays host-composed. | §6.6. |

---

## 7. Proposed lots

Order, gates and RED-first witnesses. Lot ids `SS-*` are proposals for the conductor's Track entries; the conductor writes Track, this study does not. Every lot is RED-first: its witness tests are written and observed failing before the implementation they gate. Commands use the real root scripts (§2.2.4): targeted workspace tests (`npm --workspace <name> run test`), `npm run licensing:check`, `npm run pack:smoke`, and `node --test scripts/*.test.mjs` for the guards. No lot claims framework parity beyond its stage (§6.5).

### Lot SS-0 — Enumeration, model freeze candidate, licence spike (STUDY → VOL gate)

Deliverables: (1) the mechanical enumeration of the reference surface relevant to S0–S2 (core plugins, commands, workbook fields, function names per module), produced by a Node enumerator and guarded by an independently written second extractor with exact bijection at the same source and detail — the RE precedent (§2.5) applied at spreadsheet scale, with the counting conventions stated in the lot; (2) the §4.2 model written as versioned TypeScript types + JSON Schema + canonicaliser in `packages/spreadsheet-core` (pure `.` entry only, `private: true`, no adapter, no engine), with the DataTable projection; (3) the Option B licence spike report (registry + repository reads for every §5.2 candidate, with notices impact); (4) the U3 usage inventory questions answered or explicitly carried as `unknown` into VOL.

RED-first witnesses: schema tests (valid / invalid workbooks, additive-evolution cases, canonical-form stability across key order); projection tests (sheet ↔ DataTable round-trip on values, loss flags asserted); enumerator guard failing on a tampered inventory entry (control case, RE precedent).

Gate: enumeration guard green; model tests green; licence spike recorded (whatever its outcome); `licensing:check` green with the private package present. No UI exists after this lot. This lot must complete before SS-2 is estimated (the VOL decision consumes its outputs and the §8 answers).

### Lot SS-1 — S0 editable grid, Svelte first (DOM, virtualised)

Deliverables: the Svelte `SpreadsheetGrid` adapter (subpath export, §6.5) over the SS-0 core: controlled workbook value, §3.1 S0 behaviour (navigation, selection, in-place editing with typed parsing — number / boolean / date-text / text, no formulas — validation with injected messages, keyboard contract, TSV / CSV copy-paste, insert / delete / resize / hide, grid sort / filter, undo / redo), §6.2 accessibility contract, §6.4 catalogue with untranslated marker, token theming (`--st-component-spreadsheet-*`, final prefix at EVOL), and the §6.1 performance harness with recorded DOM baselines at the pre-registered envelopes.

RED-first witnesses (each a named test file in the adapter package, jsdom where it can carry the assertion and the puppeteer-core real-browser harness where it cannot, FE-2 §2.1 distinction): keyboard navigation matrix; edit-commit / cancel (Enter, Tab, Escape, blur) with no event during IME composition; paste TSV block (including ragged rows and locale decimal text) with prior-state preservation on refused kinds; locked / read-only state refusing mutation via typing, paste and shortcuts (§2.4 rule); complete-value emission (every change event carries the full workbook + gesture provenance, never a patch); virtualisation (off-screen rows absent from the DOM, `aria-rowcount` still total); no-network witness; packaging witness (barrel import loads neither grid nor engine).

Gate: RED list green with command output; performance baselines recorded (pass / fail against the VOL-fixed envelopes stated, not silently re-baselined); `pack:smoke` + `licensing:check` green. Announced exactly as §6.5 Stage 1 (S0 part).

### Lot SS-2 — S1 formula engine (pure) + grid integration

Deliverables: the `./engine` entry (§4.3 stages 1–4) for the owner-balloted subset (§8 Q2), the differential corpus (hand-computed / documented-semantics cases per function, per operator, per error-propagation rule, per locale; reference-inspired cases independently computed, §4.4), incremental recalculation with cycle detection, composer formula editing (token colours via DS tokens, autocomplete with catalogue descriptions, range picking), formula-bar / name-box, and the Option B adoption decision executed per stage (adopted code, if any, behind the registry with notices generated). Depends on SS-0 (enumeration + spike) and SS-1 (grid).

RED-first witnesses: tokeniser / parser corpus (precedence table rows, reference forms, locale separators); evaluator corpus (each subset function, error values and propagation, date serials including the stated epoch rule); dependency tests (chain, diamond, cycle with exact member set, whole-column over used range, cross-sheet); atomicity test (no emitted state with stale dependents); unsupported-function signal (known text, error value + report, never silent miscalculation); relative-reference adjustment on copy / fill.

Gate: corpus green; atomicity + incremental-recalculation tests green; S0 RED list still green (no regression); performance envelope (b) (§6.1) measured. Announced as S1 for Svelte only.

### Lot SS-3 — S2 workbook features + canvas decision + remaining frameworks (gated, may split)

Deliverables (each independently gated; the lot may split at VOL): sheets management, merges, freeze panes, cell styling / number formats (interned dictionaries, §4.2 decision 3), conditional formats (evaluated presentation-free, rendered via the `cellDecoration` intent precedent, §2.2.1), data validation, range-binding value + projection for host-composed charts (§6.6), the canvas cell-paint layer *only if* SS-1 baselines missed an envelope (§6.1), and React / Vue / Angular adapters as separate stage gates (§6.5). Sheet lock (protection flag) lands here (§6.3).

RED-first witnesses: per-feature behavioural tests mirroring §3.3; structural-edit transform tests (insert / delete shifting merges, formats, bindings and formulas consistently); broken-binding state; adapter vertical scenarios per framework.

Gate: per-feature gates green; parity recorded per framework with residue named. Nothing in this lot is required for S0 / S1 consumers.

### Lot SS-4 — S3 design only (no delivery without B2 + owner decisions)

Deliverables: an EVOL-grade design (not code) for collaboration (per the B2 selection, §6.3) and for xlsx import / export at the edges (§3.4, §4.5) with the fidelity spectrum and warning taxonomy, the per-cell return adapter *if* h2a commissions it (§4.6), and the OT-transform or CRDT structural-operation contracts costed against the SS-0 enumeration. Delivery lots are proposed only after §8 Q4–Q6 are answered.

Gate: owner + B2 + h2a decisions recorded. This study proposes no S3 implementation lot.

### Dependency order

SS-0 → SS-1 → SS-2 → (gated) SS-3; SS-4 design may start after SS-0 but delivers nothing shippable. Option C (§5.3), if the owner selects it for a host, runs outside this order as host work and does not cancel SS-0.

---

## 8. Open questions to the owner

Only what the sources cannot settle (§2.9). Each question carries options and a recommendation, written so the owner can answer « Q1 A ». Answers are treated as final for the VOL; re-examination happens in prose, not by re-polling (harness-brainstorm batched-decisions rule). Questions are grouped in lots of at most four.

### Q1 — DS build or app-side LGPL wrap for the first real need?

Context: §5.1 (DS build, tiered, MIT, reusable) vs §5.3 (wrap o-spreadsheet in one app, LGPL at the app boundary, complete now, no DS capital). Sources cannot settle this because it is a product / licence / urgency decision (U3).

- Q1 A — DS build (Option A). The DS gains the spreadsheet; first usable tier is S0, formulas follow at S1.
- Q1 B — App-side wrap first (Option C) for the named host, DS build still planned (SS-0 proceeds; SS-1 / SS-2 scheduled after).
- Q1 C — App-side wrap only. No DS spreadsheet lots beyond this study.

Recommendation: **Q1 A** if no dated single-app deadline exists; **Q1 B** if one does. (Study recommendation: Q1 A, since no deadline is recorded in the sources.)

### Q2 — S1 compatibility target and function subset?

Context: 336 reference functions measured (§2.1.4); Excel / Google Sheets semantics as the familiarity target (§3.2). The subset bounds SS-2.

- Q2 A — Core subset (proposed ballot for VOL to enumerate, ~40 functions: arithmetic / statistical / logical / text / date essentials, `SUM AVERAGE COUNT IF VLOOKUP`-class lookups, operators and ranges; financial / engineering / web / database long tail excluded, unknown functions reported, never silent).
- Q2 B — Broad subset (~120 functions, adding financial and advanced statistical / lookup).
- Q2 C — Full 336-function parity as the stated goal (programme-sized; requires the SS-0 enumeration as denominator and a multi-lot commitment).

Recommendation: **Q2 A**, with the exact ballot fixed at VOL from the U3 usage inventory; widen by named functions with corpus cases, never by category wholesale.

### Q3 — Confirm the S0 / S1 model divergence: no styling in the model until S2?

Context: §4.2 decision 3 (evaluator default formatting only; styles / formats / borders arrive interned at S2). The alternative is reference-shaped styling from S0, which enlarges SS-1.

- Q3 A — Confirm divergence (S0 / S1 stay small; S2 adds styling additively).
- Q3 B — Styling from the start (larger SS-1; S2 shrinks correspondingly).

Recommendation: **Q3 A**.

### Q4 — Collaboration ambition for sheets (with B2)?

Context: §6.3 vocabulary (sheet lock vs single-writer + presence vs concurrent OT / CRDT). S3 design (SS-4) is blocked on this; S0–S2 are unaffected.

- Q4 A — Sheet protection flag only (S2); no multi-user editing in the plan.
- Q4 B — Single-writer lock + presence (smallest multi-user product; B2 supplies lock / roster contract).
- Q4 C — Concurrent editing (B2 then chooses OT-over-commands vs CRDT-over-state, §6.3, with undo semantics).

Recommendation: **Q4 B** as the planned ambition (it matches the owner's « édition concurrente et le lock » wording least expansively while keeping a real multi-user story), with Q4 C as a later EVOL if usage proves it. Final selection belongs to the joint B2 / owner decision, not to B3 alone.

### Q5 — xlsx ambition (S3 edges)?

Context: §2.1.8 sizing, §3.4 fidelity-with-warnings behaviour.

- Q5 A — TSV / CSV only in the plan; xlsx deferred without design.
- Q5 B — xlsx design at SS-4 (import + export, warning taxonomy, fidelity spectrum stated per feature).
- Q5 C — xlsx delivery committed now (requires Q5 B's design first in practice).

Recommendation: **Q5 B** (design the edges early so S0–S2 choices — stored strings, locale, error values — stay xlsx-compatible; deliver only on a later gate).

### Q6 — Per-cell AI edit-return: commission h2a to define it?

Context: §4.6. The DS emits complete value + gesture provenance either way; only h2a / Focus can own cell identity, diff and reconciliation (the FE-2 boundary, §2.4).

- Q6 A — Commission: h2a / Focus designs a per-cell return (cell identity under structural edits, cumulative reconciliation, digests) consumed host-side like the per-paragraph return.
- Q6 B — No per-cell return: workbook edits return through the existing envelope without a cell diff (host sends the workbook or a summary by its own means).
- Q6 C — Defer: DS proceeds; h2a decides when a concrete AI-over-sheets use case is stated.

Recommendation: **Q6 C** (defer with the DS-side guarantee in place), moving to Q6 A when a named use case exists. Flagged explicitly as an h2a contract question.

### Q7 — Framework order after Svelte?

Context: §6.5 staging. Both current consumers are Svelte (§2.4); parity is gated per framework.

- Q7 A — Svelte only until S1 is proven; then React, Vue, Angular in that order as demand appears.
- Q7 B — Svelte + React at S0 (doubles adapter work before the model is proven).
- Q7 C — All four at S0 (rejected in §5 analysis; listed for completeness).

Recommendation: **Q7 A**.

### Q8 — Publication posture for the new packages?

Context: `private: true` (no licensing-count change) vs publishable MIT (count 18 → 19+, notices, `pack:smoke` deep verification, §2.2.4). FE-2's core on its branch is private (§2.4).

- Q8 A — Private until S1 is proven, then publish on owner gesture.
- Q8 B — Publishable from SS-1 (public consumers from S0).

Recommendation: **Q8 A**.

---

## 9. NOT covered

Exhaustive for this study. Anything listed here is neither designed nor promised; its absence from §§3–7 is deliberate.

- Implementation of any kind: no package, component, schema file, test or enumerator is created by this study. No Track entry is written (the conductor writes Track).
- Full parity with o-spreadsheet (or with Excel / Google Sheets): no 336-function commitment, no 171-command commitment, no parity percentage (§2.5). Pivot tables (creation, grouping, calculated fields), dashboard mode, print / PDF rendering and print layout, image insertion and figure editing, header-group outline beyond S2 freeze / hide basics if the gate descopes it, table styles gallery, conditional-format icon sets / data bars / colour scales beyond the intent-based rendering (§6.6 precedent), data-validation types beyond list / whole-number basics if the gate descopes them, named-range management UI beyond name-box navigation, find-and-replace across the workbook, sort / filter advanced dialogs, autofill series intelligence, text-to-columns, and accessibility beyond the §6.2 contract.
- Formula long tail: dynamic arrays and spill (`#SPILL!` behaviour), structured table references, external-workbook references, array-entered (CSE) formulas, volatile / web / engineering function families, user-defined functions executed from workbook content (any host function is registered host-side code, §4.3 — workbook content never supplies executable code), and macro (VBA / Apps Script) anything.
- Collaboration delivery: no transport, server, OT transform, CRDT binding, presence service or offline-merge implementation is designed here (SS-4 is design-only and decision-gated, §6.3). Google Sheets / Microsoft 365 realtime protocols are not targeted.
- File formats beyond the stated edges: no Google Sheets API sync, no Odoo JSON import, no `.xls` / `.ods` / Numbers support, no CSV dialect detection beyond delimiter / quote basics at S0, and no xlsx delivery (Q5). xlsx fidelity, where designed at SS-4, excludes macros, external links, pivot caches and embedded objects except as preserved-opaque with warnings.
- Rich-text cells beyond the §4.6 host-composition point; cell comments / notes threads; version history UI; sharing / permissions UI; and any sentropic product surface (templater field rollout, connector writes to Google Sheets) — those are B1 / host decisions consuming this study, not DS lots.
- The B1 inventory (sentropic editables, templater field list) and the B2 design (lock / presence / concurrency selection) themselves; this study states only the interfaces it needs from them (§6.7). The FE-2 lots (RT-0…RT-3) are neither replanned nor blocked here.
- Performance numbers: no latency, memory or bundle figure is asserted for the DS grid (U7). The §6.1 envelopes are gate shapes to be fixed at VOL and measured at SS-1.
- Licence advice: §4.4 / §5 state engineering constraints and measured licence fields; the legal reading of LGPL obligations for any app distribution (Q1 B / C) belongs to the owner's licence review.

---

## Appendix A — Commands and reads behind the inventory (reproducibility)

- Reference sizing: `find .ds-scrap/re-sources/o-spreadsheet/src -type f | wc -l` (1046), `find … -name '*.ts' | wc -l` (743), `find … -name '*.ts' | xargs wc -l | tail -1` (141488), `ls …/src/plugins/core/*.ts | wc -l` (24), `wc -l …/src/plugins/core/*.ts | tail -1` (9807), `find …/src/plugins -name '*.ts' | wc -l` (74), `find …/src/components -name '*.ts' | wc -l` (280), `find …/tests -type f | wc -l` (414), `find …/tests -name '*.test.ts' | wc -l` (297).
- Functions / commands: `grep -rhoE 'export const [A-Z][A-Z0-9_]+' …/src/functions/module_*.ts | sort | wc -l` (336) with per-module `grep -cE 'export const [A-Z]'`; `grep -cE '^\s+"[A-Z_]+"' …/src/types/commands.ts` (171), `wc -l …/src/types/commands.ts …/src/types/getters.ts …/src/model.ts …/src/formulas/*.ts`.
- DS: `ls .edit-bs-wt/packages`, `ls .edit-bs-wt/packages/components-svelte/src/lib` (DataTable / Table / Grid presence), `wc -l` on `DataTable.svelte` (643) and `Table.svelte` (107), `find …/packages/components-{react,vue,angular} -name '*DataTable*'` (four-framework presence), `ls .edit-bs-wt/packages/dataviz-core/src/*.ts | wc -l`, `cat` / `head` reads of the files cited inline.
- Sentropic: `git -C /home/antoinefa/src/sentropic grep -n -i "spreadsheet\|tableur\|sheet" origin/main -- spec ui/src packages ':!*/dist/*'` (full output grouped in §2.3).
- h2a: `git -C /home/antoinefa/src/h2a show 98060bd0a:packages/focus/src/editing/contract.ts`, `git -C /home/antoinefa/src/h2a show 98060bd0a:docs/focus/document-editing.md`; FE-2 latest: `git show feat/rich-text-core:spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md`, `git show feat/rich-text-core:packages/rich-text/package.json`, `git show feat/rich-text-core:packages/rich-text/src/model.ts`, `…/src/messages.ts`, `…/src/theme.ts`, `git ls-tree -r --name-only feat/rich-text-core -- packages/rich-text/`.
- No network was used. No file other than this study file was written. Nothing under `.track/` was touched.






