# SPEC RE — bpmn-js / diagram-js functional parity on `@sentropic/graph`

**Status**: specification, inventory and enumeration tooling only — no implementation in this lot.
**Date**: 2026-10-15. **Track**: feature `01M518XJW7NZBFFPBH4PXQDWWE`, item `01M518XK1RJDXAB6XRAT7B98V6` (written by the conductor; this lot does not write `.track/`).
**Worktree**: `.re-bpmnjs-wt`, branch `spec/re-bpmnjs-parity`, cut from `origin/main`.
**Owner request (2026-10-15, verbatim)**: « tu peux programmer le reverse engineering de bpmn-js dans notre mode graph ou dans un premier temps en xyflow — je veux 100 % d'iso fonctionnel avec un plan complet. La spec devra être capitalisée pour le refaire avec notre graph webgl. Fais la même chose avec xyflow et avec jointjs vers notre graph. » This spec covers the bpmn-js/diagram-js leg; the xyflow and JointJS legs reuse the same contract (§6, §9) and are separate lots.

Conventions. `RE:` = `.ds-scrap/re-sources/` at the repository root (read-only, see `MANIFEST.md` there). `WT:` = this worktree. Every count states its convention; every factual claim carries a `path:line` or a command. `[JUDGMENT]` marks a design choice of this spec. `unknown` marks a gap that no source in the workspace settles.

---

## 1. Scope

**In scope**

- An exhaustive, mechanically enumerated inventory of the observable behaviour of bpmn-js and diagram-js (§3–§4), written to `docs/re/bpmn-js-inventory.json` by `tools/re-bpmn-js/enumerate.mjs` and guarded by `tools/re-bpmn-js/verify.mjs`.
- A renderer-independent target architecture (§5): behaviours are specified against a contract (model, commands, rules, events, abstract rendering, interaction), never against a rendering engine, so the same spec can be replayed on `@sentropic/graph` (WebGL) later — the owner's capitalisation requirement.
- A comparison of two delivery routes without a definitive commitment (§6): (1) directly on `@sentropic/graph`; (2) first on xyflow (authorised for published DS packages by revised decision D7), then on graph.
- A differential parity harness design (§8) and a complete, ordered lot plan with gates (§9).

**Out of scope**

- Any implementation. No editor, renderer, codec or component is built in this lot.
- BPMN execution semantics, and dialects other than the pinned metamodels (camunda, zeebe, …).
- XML parsing/serialisation as a runtime feature of DS packages (see the A′ articulation, §7 of this spec and the A′ spec): XML lives at the edges, inside tests.
- JointJS and xyflow inventories themselves (catalogued at reference level in `docs/graph-dataviz-reference-catalog.md`, 186 JointJS applications; their mechanical inventories are follow-up lots reusing §5).

## 2. Pinned versions and starting point

### 2.1 Reference versions (from `RE:MANIFEST.md`)

| Source | Version | Commit |
|---|---|---|
| bpmn-js | 18.31.0 | `e3e9ea21093ffa71b4d3e57c43da6f3a5f620a98` |
| diagram-js | 15.28.1 | `b7977a15eb0edd3372227493f48099fb923d98de` |
| bpmn-js-examples | 18.31.0 (examples tree) | `e6a99f5c6741599476859c65c6c05a17e2186ae5` |
| bpmn-moddle | 10.3.1 | `f35959afc443444b706a4f39542530134233db07` |
| xyflow (route comparison only) | `@xyflow/react@12.12.0` | `3d35b57317576b0916c0bfeaaedd573aaacc2839` |
| JointJS (out of this lot's inventory) | `@joint/core@4.3.3` | `e0ee1a6a1b842df12eb6d1815a3099193a76588a` |

Package identities agree with the checkouts: `bpmn-js` 18.31.0 (`RE:bpmn-js/package.json`, `name`/`version`), `diagram-js` 15.28.1 (`RE:diagram-js/package.json`), `bpmn-moddle` 10.3.1 (`RE:bpmn-moddle/package.json`).

### 2.2 Our stack, as measured in this worktree

| Package | State relevant to parity | Evidence |
|---|---|---|
| `@sentropic/graph` 0.3.0 | WebGL2 + Canvas2D renderer over typed buffers; camera, snapshot, octilinear routing, generic shape codes, layouts (`force-fa2`, `hierarchy-aware`, grid/radial/metro/gitflow), workers. No BPMN glyphs, no diagram editing. | `WT:packages/graph/package.json` (`name`, `version`); renderer entry `WT:packages/graph/src/renderer.ts:1180`; generic shapes only `WT:packages/graph/src/shape-geometry.ts` (`shapeCode`) |
| `@sentropic/diagram-core` 0.1.0 (private) | Versioned documents/profiles, views with occurrences, 18 transactional commands with logical inverses, canonical JSON, one registered migration. `generic@1` complete; `bpmn@1` a declared skeleton claiming no conformance. | 18 kinds at `WT:packages/diagram-core/src/commands.ts:149`; skeleton at `WT:packages/diagram-core/src/profiles/skeletons.ts:50` |
| `@sentropic/diagram-canvas` 0.1.0 (private) | Headless scene + hit test: one world→device transform, paint order, filter cascade, point/region hit testing. No selection lifecycle, keyboard, drag, connect or rendering. | `WT:packages/diagram-canvas/src/scene.ts:168`; `WT:packages/diagram-canvas/src/hit.ts:85` |
| DS components (`packages/components-*`) | Generic DS chrome exists; no diagram editor shell, palette, context pad, inspector for diagrams, or minimap is delivered in this worktree. | `WT:packages/diagram-canvas/README.md`, "What is not covered yet" (framework adapters, rendering listed as not covered) |

Two pre-existing documents bound this spec and are prolonged, not redone: the reference catalogue (`WT:docs/graph-dataviz-reference-catalog.md`, 2026-09-15: ELK 21 algorithms / 286 options, Graphviz 10 engines, 186 JointJS applications — catalogue level only) and the migration plan (`WT:docs/graph-dataviz-migration-plan.md`: step A = xyflow + bpmn-js vertical, step B = Sentropic capitalisation; D7 revised so `elkjs` and `xyflow` are authorised in published DS packages). The semantic model decision is A′ (§7 below).

## 3. Enumeration method and the completeness guard

"100 %" is defined mechanically, not by reading. `tools/re-bpmn-js/enumerate.mjs` (Node, zero dependencies, no network) extracts the observable surface from the pinned sources; `tools/re-bpmn-js/verify.mjs` re-runs the same extraction and asserts an exact bijection with the inventory, plus schema, source-resolution and proof-resolution checks. **"100 %" therefore means: 100 % of the items produced by this extraction, under the conventions below.** Anything the conventions cannot see is listed as a limit (§3.3), never silently dropped.

### 3.1 Counting conventions (one entry per distinct key, per family)

| Family | Mechanical definition | Extractor anchor |
|---|---|---|
| `module` | Every `index.js` under `lib/` of bpmn-js and diagram-js (one didi module each) | directory walk in `enumerate.mjs` (`extractModules`) |
| `command` | Distinct ids from the `Modeling.getHandlers()` maps, `commandStack.registerHandler('…')` and `commandStack.execute('…')` | `RE:diagram-js/lib/features/modeling/Modeling.js` (`getHandlers`), `RE:bpmn-js/lib/features/modeling/Modeling.js` (`getHandlers`) |
| `rule` | Distinct `addRule('…')` action names (array forms expanded) | `RE:bpmn-js/lib/features/rules/BpmnRules.js` (`init`) |
| `palette` | Keys returned by bpmn-js `PaletteProvider.getPaletteEntries` | `RE:bpmn-js/lib/features/palette/PaletteProvider.js` (`getPaletteEntries`) |
| `context-pad` | Distinct entry keys assigned in bpmn-js `ContextPadProvider` (single- and multi-element) | `RE:bpmn-js/lib/features/context-pad/ContextPadProvider.js` (`getContextPadEntries`) |
| `replace-menu` | Keys of the shared `PopupEntries` catalog — the atoms replace/append/create menus compose | `RE:bpmn-js/lib/features/popup-menu/PopupEntries.js` (`PopupEntries`) |
| `popup-menu` | Provider ids registered on the popup menu (`registerProvider('…', …)`) | `RE:bpmn-js/lib/features/popup-menu/ReplaceMenuProvider.js:89`; `RE:bpmn-js/lib/features/align-elements/AlignElementsMenuProvider.js:45` |
| `keyboard` | Editor-action names in `SHORTCUTS_KEY_BINDINGS` + diagram-js default `addListener` actions + `KeyboardUtil` key groups | `RE:bpmn-js/lib/features/keyboard/BpmnKeyboardBindings.js` (`SHORTCUTS_KEY_BINDINGS`) |
| `event` | Distinct EventBus names from `fire('…')`, `.on('…')`, `.on([…])` over both `lib/` trees; JSDoc lines (starting with `*`) excluded; names ending in `.` kept once and flagged `dynamicPrefix` | e.g. `RE:diagram-js/lib/features/bendpoints/BendpointMove.js:131` |
| `config` | `BaseViewerOptions`/`DiagramOptions` fields + first-level `config.*` / `options.*` reads | `RE:bpmn-js/lib/BaseViewer.js` (`BaseViewerOptions` typedef) |
| `renderer` | Keys of the `BpmnRenderer` `handlers` map | `RE:bpmn-js/lib/draw/BpmnRenderer.js` (`handlers`, from line 1318) |
| `moddle-type` | Types of the five JSON descriptors present in the checkout (bpmn, bpmndi, di, dc, bioc) | `RE:bpmn-moddle/resources/bpmn/json/bpmn.json` and siblings |
| `api` | Public (non-`_`) prototype methods of `BaseViewer`/`Viewer`/`NavigatedViewer`/`Modeler`/`BaseModeler` and diagram-js `Diagram`/`Canvas` | e.g. `RE:bpmn-js/lib/BaseViewer.js:220` (`importXML`) |
| `example` | Top-level `bpmn-js-examples` directories carrying a `README.md` | `RE:bpmn-js-examples/` (29 directories) |

Each inventory entry carries: `id` (`RE.<family>.<slug>`, stable), `family`, `key`, `source` (`path:line` in `RE:`), `behaviour` (observable input → output / interaction → effect), `acceptance` (a differential test scenario), `target` (`graph` / `diagram-core` / `diagram-canvas` / `ds-component` / `new-module`), `status` (`covered` / `partial` / `missing`) with `proof` (`path:line` in `WT:`), and `priority` (`P0` blocking, `P1` editing parity, `P2` polish). [JUDGMENT] The `target`/`priority` assignments and the `partial` thresholds are this spec's mapping, defined in §4.1; the extraction itself is judgement-free.

### 3.2 Guard output (measured in this worktree)

```console
$ node tools/re-bpmn-js/enumerate.mjs
wrote docs/re/bpmn-js-inventory.json entries=727
$ node tools/re-bpmn-js/verify.mjs
COMPLETENESS GUARD: PASS entries=727 extracted=727 bijection=exact
```

The guard fails (exit 1) on: an extracted item without an entry, an entry without an extracted item, duplicate ids, a `source` or `proof` that does not resolve to a real `path:line`, or a missing/short `behaviour`/`acceptance`. Re-running `enumerate.mjs` after any source or mapping change and then `verify.mjs` is the required loop; a green guard is a precondition for quoting any coverage figure from the inventory.

### 3.3 Limits of the enumeration (what "100 %" does not claim)

1. **Runtime-built names.** Event names assembled by concatenation (`commandStack.` + id, `drag.`, `keyboard.`) appear once as `dynamicPrefix` entries. Their concrete suffixed forms are not statically enumerable; the harness (§8) must log them at runtime to extend the guard.
2. **The `color` moddle package (source-gap).** bpmn-moddle registers six packages; five have JSON descriptors in this checkout (163 types). The sixth, `color` (3 types per the A′ spec), is imported from the external `bpmn-in-color-moddle` package (`RE:bpmn-moddle/lib/simple.js:12`), whose files are absent (no `node_modules`, no built `dist`). It is recorded in the inventory `meta.sourceGaps`, not counted. The A′ total of 166 types = 163 counted here + 3 `color`.
3. **Behaviour behind a key.** Extraction proves a key exists at a `path:line`; the *semantics* behind it (e.g. the full `canConnect` decision tree in `RE:bpmn-js/lib/features/rules/BpmnRules.js`) are specified per family in §5 and proven only by the differential harness, not by the inventory.
4. **CSS, fonts and assets.** bpmn-font icons, `bpmn-js.css`/`diagram-js.css` class behaviour and the powered-by watermark rendering are observable but not key-enumerable; they are covered as renderer/config entries and by the visual arm of the harness (§8.4), and listed in §11 as residual surface.
5. **Specs as behaviour.** `*.spec.ts` files are excluded from extraction (they are tests, including doc-example event names such as `foo`); JSDoc example lines are likewise excluded from the `event` family.

## 4. Inventory summary and current coverage

### 4.1 How status was assigned [JUDGMENT, applied mechanically]

- `covered`: the behaviour is fully present in our stack today, citable at a `path:line`. **No entry qualifies.** This is a measured result, not a rhetorical one: the DS has no BPMN editor, and each candidate analogue is partial by its own README (see the proofs in the inventory).
- `partial`: a generic mechanism exists that covers a proper subset (e.g. `diagram-core` create/move/delete occurrences for `shape.create`; the `diagram-canvas` camera for `canvas.viewbox.changed`; graph edges for `bpmn:SequenceFlow`). The proof names the mechanism; the missing subset is what the lots in §9 must close.
- `missing`: no mechanism. The proof points at the document that records the gap (package README "What is not covered yet", or the skeleton's `NOT declared` notes at `WT:packages/diagram-core/src/profiles/skeletons.ts`, `NOT declared`).

### 4.2 Counts (convention: §3.1; generated 2026-10-15)

| Family | Entries | covered | partial | missing | Main target(s) |
|---|---:|---:|---:|---:|---|
| module | 92 | 0 | 17 | 75 | new-module (75), diagram-canvas (13), diagram-core (4) |
| command | 33 | 0 | 13 | 20 | diagram-core (29) |
| rule | 13 | 0 | 2 | 11 | diagram-core (13) |
| palette | 15 | 0 | 0 | 15 | ds-component (15) |
| context-pad | 18 | 0 | 0 | 18 | ds-component (18) |
| replace-menu | 70 | 0 | 0 | 70 | ds-component (70) |
| popup-menu | 2 | 0 | 0 | 2 | ds-component (2) |
| keyboard | 23 | 0 | 0 | 23 | diagram-canvas (23) |
| event | 151 | 0 | 13 | 138 | new-module (138) |
| config | 32 | 0 | 0 | 32 | new-module (32) |
| renderer | 37 | 0 | 5 | 32 | graph (37) |
| moddle-type | 163 | 0 | 30 | 133 | diagram-core (163) |
| api | 49 | 0 | 10 | 39 | new-module (39), diagram-canvas (10) |
| example | 29 | 0 | 0 | 29 | new-module (29) |
| **Total** | **727** | **0** | **90** | **637** | — |

By target: `diagram-core` 213, `new-module` 313, `ds-component` 105, `diagram-canvas` 58, `graph` 38. By priority: `P0` 201, `P1` 330, `P2` 196. All figures are reproducible with `node tools/re-bpmn-js/enumerate.mjs` (summary printed to stdout, full detail in `docs/re/bpmn-js-inventory.json`).

Reading of the result. The estate to rebuild is dominated by three blocks: the semantic metamodel (`moddle-type` 163, owned by A′ generation, §7), the event/interaction surface (`event` 151 + `module` 92, i.e. the didi module wiring and its EventBus contract), and the menu atoms (`replace-menu` 70). The genuinely-started blocks are the transactional core (13/33 commands partial), the headless scene/camera (10 API + 13 event/module entries partial) and connection rendering (5/37 renderer entries partial). Nothing is `covered`: parity work starts from partial mechanisms, not from finished behaviour — any plan that assumes otherwise understates every lot in §9.

### 4.3 Cross-checks against independent counts

- Moddle types: 163 counted here (137 `bpmn` + 6 `bpmndi` + 11 `di` + 7 `dc` + 2 `bioc`; 27 abstract, 136 concrete) + 3 `color` (source-gap, §3.3) = 166, matching the A′ spec's registry measurement (166 types, 27 abstract). The two counts were produced by different routes (JSON descriptors vs runtime registry) and agree once `color` is accounted for.
- Renderer handlers (37) vs moddle types (163): the renderer draws *diagram* shapes/connections, not metamodel types; the gap is expected — most moddle types (event definitions, artefacts' internals) have no dedicated glyph and are rendered through their flow-node handler plus markers/icons. The per-type rendering obligation is therefore: every concrete flow element type must resolve to a handler + marker/icon variant, which the harness checks by fixture (§8), not by counting handlers.
- Commands (33) vs `diagram-core` commands (18 at `WT:packages/diagram-core/src/commands.ts:149`): different vocabularies (diagram operations vs semantic transactions). §5.2 defines the mapping contract; no numeric parity is claimed between the two lists.

## 5. Target architecture — renderer-independent contract

The capitalisation requirement: **no behaviour in this section names SVG, DOM, WebGL, xyflow or any framework.** A behaviour is specified as a contract over five planes; each route in §6 is an implementation of the same planes. Replaying the spec on the WebGL graph then means re-implementing planes 4–5 only.

### 5.1 Plane 1 — Semantic model (owner: `diagram-core`, per A′)

The model is the A′ model (§7): `SemanticDocument` + `ViewDocument`(s) in `diagram-core`, with BPMN profiles *generated* from the bpmn-moddle descriptors. bpmn-js's runtime object graph (`businessObject`, `$parent`, DI elements) is a *reference reading* of that model, never a second authority. Contract obligations:

- Every `moddle-type` entry (163 + `color` 3) maps to a generated profile type or to preserved unknown-namespace content (counted separately, per A′).
- Containment, references (including `isMany`, `isReference`, virtual/replaces/redefines handling) follow the A′ mapping rules; connectors (`SequenceFlow`, `MessageFlow`, associations, data associations) are entities with typed references, projected to edges for display (A′ §5 rationale).
- The exchange form is moddle JSON (F1) end-to-end; XML only at the edges (import/export, inside tests), per A′ and the migration plan's "one JSON model" rule.

### 5.2 Plane 2 — Commands and transactions (owner: `diagram-core` + a new interaction layer)

Each `command` entry becomes a contract: *preconditions (plane 3 rules) → transaction → effects + emitted events (plane 5 contract names) → logical inverse (undo) → redo*. `diagram-core` already provides the transaction machinery (apply/inverse/revision-conflict, `WT:packages/diagram-core/src/commands.ts:149`); what parity adds is the BPMN command vocabulary on top of it:

- The 21 diagram-js generic commands (`shape.*`, `connection.*`, `elements.*`, `label.create`, `spaceTool`, …) map to occurrence/relation transactions; the 11 bpmn-js commands (`lane.*`, `element.updateProperties`, `element.updateModdleProperties`, `element.updateLabel`, `element.setColor`, `canvas.updateRoot`, `group.updateRefs`, `id.updateClaim`, `dataStore.updateContainment`) map to entity/attribute transactions. The inventory's `command` entries carry this mapping per item (`target` + `behaviour`).
- Undo/redo, command-stack dirty state and `commandStack.*` event semantics (including the dynamic suffixes, §3.3) are part of the contract: an implementation that mutates without an inverse fails parity even if the end state matches.
- Behaviours attached to commands in bpmn-js (the 44 behaviour files under `RE:bpmn-js/lib/features/modeling/behavior/`, excluding `index.js`; counted with `find … -name "*.js" ! -name "index.js" | wc -l` → 44, e.g. boundary-event, label, lane and subprocess-plane behaviours) are *effects of* the command contract, enumerated indirectly through the `command`/`event` families; each behaviour file must be accounted for by the lot that implements its command (checked in lot acceptance, §9).

### 5.3 Plane 3 — Rules (owner: `diagram-core` validation + interaction layer)

Each `rule` entry is a pure predicate over (model, geometry context) returning boolean or a typed result (`{ type: 'bpmn:MessageFlow' }`, `{ replacements: [...] }`, `'attach'`, …), exactly as `BpmnRules` returns them (`RE:bpmn-js/lib/features/rules/BpmnRules.js`, `init` and the `can*` functions). Rules never mutate. The BPMN well-formedness matrix they encode (sequence/message/data flow eligibility, boundary attach, drop/insert/replace, resize, copy) is specified by the reference implementation's *observable verdicts*; the harness probes verdicts, it does not port the code (clean room, §10). Rules that diagram-js provides generically (`elements.move/create` partial today) are completed to BPMN specificity here.

### 5.4 Plane 4 — Abstract rendering (owner: `@sentropic/graph` on route 1; xyflow on route 2)

Rendering is specified as: *(scene: typed nodes/edges/labels with geometry) → (draw list: shapes, paths, markers, icons, text) at a camera*. The 37 `renderer` entries define the required draw vocabulary: per handler, the shape outline, fill/stroke, marker set (e.g. message/timer/signal glyphs inside events), icons (task type glyphs), connection line style (solid/dashed/dotted, arrowheads), and label placement. `@sentropic/graph` today provides the substrate — typed buffers, generic shape codes (`WT:packages/graph/src/shape-geometry.ts`, `shapeCode`), edge routing including octilinear (`WT:packages/graph/src/renderer.ts:1180` and `render-geometry`) — but no BPMN glyph set; the lot in §9 adds a BPMN draw layer *consuming* `render-geometry` as the single geometry source (the discipline `diagram-canvas` already applies for hit↔render consistency). Text measurement (bpmn-js `TextRenderer`) is part of this plane: a font-metric source must be decided (open point, §11); `diagram-canvas` currently defers labels for exactly this reason.

### 5.5 Plane 5 — Interaction and chrome (owner: `diagram-canvas` extension + DS components + new editor module)

- **Scene/hit substrate (exists)**: camera transform, scene frame, paint order, point/region hit test (`WT:packages/diagram-canvas/src/scene.ts:168`, `WT:packages/diagram-canvas/src/hit.ts:85`). Parity extends it with selection state, marquee/lasso, drag/connect/create lifecycles, bendpoint editing, resize, space tool, snapping (grid + element), auto-place/auto-resize, align/distribute, ordering (z), overlays, drilldown (subprocess planes), label editing (direct editing), copy-paste, search/search-pad, hand/lasso tool management and keyboard handling — each traceable to `module`/`event`/`keyboard` inventory entries.
- **Chrome (new DS components)**: palette (15), context pad (18), replace/popup menus (70 atoms behind 2 providers), properties interaction surfaces. These are DS components consuming the planes above; they own no model logic. The standard-E rendering-by-JSON work (web components), currently in specification, is the intended host contract for this chrome; this spec does not pre-empt its decisions.
- **Events as contract**: the 151 `event` entries are the observable seams between planes (e.g. `element.hover`, `shape.move.*`, `commandStack.changed`, `import.render.*`, `selection.changed`). An implementation emits/compares these names (or a documented translation of them) — the harness compares event logs, so silently renaming an event is a parity failure unless the translation is declared in the lot.

### 5.6 What stays out of the contract

Framework idioms (React/Svelte props, didi injection, xyflow node types as an *authoring* format) are route implementation details. The persisted form is A′ state + F1 JSON at the boundary; the interaction state (selection, drag previews, open menus) is ephemeral and never persisted.


## 6. Two routes, compared without a definitive commitment

Both routes implement §5 identically at planes 1–3 (model, commands, rules). They differ at planes 4–5. D7 (revised) authorises xyflow in published DS packages, so route 2 is legal; legality is not a recommendation. [JUDGMENT] The table states, per family, what xyflow (`@xyflow/react` 12.12.0 / `@xyflow/svelte`, sources at `RE:xyflow/`) provides off the shelf and what must still be built; "free" means shipped and maintained upstream, not zero-integration-cost.

| Family (entries) | Route 1 — direct on `@sentropic/graph` (WebGL) | Route 2 — xyflow first, then graph |
|---|---|---|
| module (92) | Build the editor module set on `diagram-canvas` + new modules. Nothing free; full control of the event contract. | xyflow provides viewport/drag/connect/selection primitives (its `xypanzoom`, `xydrag`, `xyhandle` under `RE:xyflow/packages/system/src/`); the bpmn-js module semantics (behaviours, drilldown, ordering…) still to build as xyflow plugins/custom nodes. |
| command (33) | Implement on `diagram-core` transactions (§5.2). Same work on both routes. | Identical (plane 2 is route-independent). xyflow's own change events must be adapted into transactions — an adapter to write and keep honest (no direct xyflow state mutation). |
| rule (13) | Pure predicates in the interaction layer. Same on both routes. | Identical; xyflow `isValidConnection` is a hook, not the BPMN matrix. |
| palette (15) / context-pad (18) / replace-menu (70) / popup-menu (2) | DS components over our scene/hit substrate. | DS components over xyflow-rendered nodes (toolbar/panel idioms exist: `Panel`, `NodeToolbar` under `RE:xyflow/packages/react/src/`); menu atoms and BPMN logic unchanged — xyflow saves chrome plumbing, not BPMN content. |
| keyboard (23) | Implement on the canvas focus model; full control of chord/modifier/text-input rules. | Partially free (xyflow ships key handling for delete/pan/zoom/selection); BPMN chords (`SHORTCUTS_KEY_BINDINGS`) and editor-action wiring still to build. |
| event (151) | Our EventBus contract mirrors the reference names; harness compares directly. | An event-translation layer is required (xyflow callbacks → contract events). Permanent tax on every harness comparison. |
| config (32) | Editor options designed against §5; `viewer.*`-shaped facade (§5, `api`). | xyflow props cover viewport/interaction options; BPMN options (moddle extensions, renderer config, feature toggles) still ours. Two option surfaces to reconcile. |
| renderer (37) | BPMN draw layer on graph buffers/geometry (WebGL2 + Canvas2D). One geometry source for render + hit. Highest build cost; no intermediate renderer to discard. | xyflow renders DOM/SVG custom nodes: BPMN glyphs as SVG components — faster to first pixels, but the whole draw layer is rewritten for WebGL at capitalisation, and hit geometry lives in the DOM, not in `render-geometry`. |
| moddle-type (163) | A′ generation into `diagram-core`. Identical on both routes. | Identical. |
| api (49) | Facade over planes 1–5 (`importXML`-shaped import via F1 at the edge, `saveXML`/`saveSVG`-shaped export, canvas operations). | Same facade; internally delegates viewport ops to xyflow until capitalisation. Facade insulates consumers from the swap — if the facade leaks xyflow types, the swap cost returns. |
| example (29) | Each example is an acceptance scenario (§8); framework/embedding examples re-hosted on DS chrome. | Same scenarios; `embedding`/`theming`/`minimap` examples map more directly onto xyflow idioms (MiniMap/Controls/Background ship under `RE:xyflow/packages/react/src/additional-components/`). |

**Trade-off summary [JUDGMENT].** Route 2 reaches a demonstrable BPMN vertical sooner (viewport, minimap, controls, node chrome) and de-risks interaction engineering, at the price of a throwaway draw/hit layer and a permanent event/option translation until capitalisation. Route 1 pays the interaction cost once, keeps one geometry source from day one, and has no swap event. What route 2 does *not* save: planes 1–3 (the largest blocks: 163 + 33 + 13 entries plus behaviour effects), the menu atoms (105 entries), or the harness. The decision gate is therefore not "which is cheaper overall" but "is an early vertical worth a disposable plane-4/5 implementation" — an owner decision, prepared (not taken) by lot L0/L1 measurements in §9 (CSP spike already exists for both engines under `WT:tools/csp-spike/` and `WT:tools/xyflow-csp-probe/`; bpmn-js under strict CSP measured a violation for xyflow at load — see the migration plan's CSP gate, still to measure for the chosen route).

**JointJS note (owner request, third leg).** JointJS enters as a *reference* (186 catalogued applications, `WT:docs/graph-dataviz-reference-catalog.md`), not as a runtime dependency: its role in this programme is scenario coverage (which editor applications must our contract express?), feeding `example`-style acceptance scenarios. A mechanical JointJS inventory, if wanted, reuses §3's method against `RE:joint/` in a separate lot; no JointJS code or API shape is adopted.

## 7. Articulation with A′ (semantic model) and with bpmn-canvas

- **Authority.** The semantic model is `diagram-core` under A′ (spec on branch `spec/gd-bpmn-moddle-coverage`, `spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md`): profiles generated from the bpmn-moddle descriptors, F1 moddle JSON as the exchange pivot, bijection `moddle JSON ↔ DiagramState` proven in a separate private package with bpmn-moddle as a pinned test dependency. This parity spec *consumes* that model; it does not re-decide it. In particular, A′ gate G3 (no `bpmn@2` document persisted outside fixtures before the multi-view bijection passes) binds every lot in §9.
- **What bpmn-js is here.** A behavioural reference only: the source of observable editing/rendering verdicts (rules, commands, menus, rendering, events). It is never linked, copied or redistributed by the target implementation (clean room, §10).
- **What bpmn-canvas remains.** The production BPMN editor (bpmn-js based, separate repository) until parity is *proven* by the harness (§8) at the gate defined in §9. No DS package depends on bpmn-canvas; the F1 shape alignment items (A′ §4.4, F1-A1…A6) remain `unknown` until bpmn-canvas publishes F1, and every lot touching unknown-namespace retention inherits that status.
- **Input.** Parity fixtures enter as F1 moddle JSON (per A′); XML fixtures enter only through the test-side bpmn-moddle conversion, mirroring A′'s rule that XML exists at the edges inside tests.

## 8. Differential parity harness

### 8.1 Principle

The same inputs are played on the reference (bpmn-js 18.31.0 + diagram-js 15.28.1, pinned sources) and on the target implementation; outputs are compared. A behaviour is `covered` (in the strong, post-implementation sense) only when its differential scenario passes — the inventory's static `status` (§4) is the *starting* coverage, the harness verdict is the *proven* coverage quoted by lot gates (§9). [JUDGMENT] This two-word use is deliberate: static status says where we start, harness verdict says what we may claim.

### 8.2 Inputs

- **Model fixtures**: BPMN files covering every concrete `moddle-type` and every `renderer` handler (including the MIWG corpus files used by A′, event-definition variants, lanes/pools, data objects/stores, groups, text annotations, collapsed/expanded subprocesses, event subprocesses, transactions). Stored as XML (reference-native) + derived F1 JSON (target-native, via the A′ codec under test).
- **Interaction scenarios**: scripted sequences (create via palette/context-pad, drag, connect, reconnect, bendpoint move, resize, space tool, align/distribute, copy-paste, replace via menu, label edit, keyboard chords, drilldown in/out, undo/redo chains). Each scenario names the inventory entries it exercises; the union over scenarios must cover every `P0`/`P1` entry (checked mechanically against the inventory, same style as `verify.mjs`).

### 8.3 Comparison points (in order of strength)

1. **Resulting model**: F1 moddle JSON, canonicalised (sorted keys; DI floats compared with tolerance, §8.4). Strongest signal; catches semantic drift that pixels hide.
2. **Event log**: ordered contract event names + payload keys (values compared where deterministic: ids are remapped through a declared id-correspondence, since creation order may legitimately differ).
3. **Geometry**: element bounds, waypoints, label bounds, viewbox — numeric, with tolerances.
4. **Pixels**: screenshot diff as a *secondary* signal for the renderer family only (font/AA differences make it unfit as a primary gate).

### 8.4 Tooling and tolerances [JUDGMENT]

- Browser driver: Chrome headless via `playwright-core` (present in the repository lockfile; the graph golden harness already drives Chrome via CDP — `WT:packages/graph/tests/golden/`). Both implementations run in the same harness page shell, same viewport, same device pixel ratio, same font set.
- Tolerances: geometry ±1 CSS px for bounds/waypoints (rounding), text metrics excluded from numeric comparison until the font-metric decision (§11); pixel diff threshold per-fixture with a stored baseline and a failure gallery (no global percentage pulled from the air — each threshold is set when its fixture is added and reviewed with it).
- Determinism: fixed seeds, animations/reduced-motion forced off, timers controlled; scenarios that cannot be made deterministic are compared on model+events only and named as such.

### 8.5 What is not compared

Pixel-perfect glyph rasterisation (compared geometrically + by marker/icon presence), upstream bugs (a reference bug is recorded as a *deviation entry* with its source `path:line`, never reproduced silently), performance (measured separately; parity is functional), and bpmn-js extension points with no DS counterpart decision yet (properties-panel ecosystem examples — see §11).

## 9. Lot plan (ordered, with dependencies, gates and cost judgement)

Costs are orders of magnitude in person-weeks for one experienced engineer, stated as judgement [JUDGMENT], calibrated on the inventory sizes — not estimates. Each gate is expressed as proven coverage (harness verdicts, §8.1) over the lot's inventory entries; a lot is done when its gate passes *and* `verify.mjs` still passes. Dependencies: `A′` = the A′ programme lots (G0/G3 gates there); `E` = the standard-E (rendering by JSON) specification, for chrome hosting only.

| Lot | Content (inventory families/keys) | Depends on | Gate (proven coverage) | Cost [JUDGMENT] |
|---|---|---|---|---|
| L0 — Harness & fixtures | Differential harness (§8), fixture corpus, id-correspondence, scenario→entry coverage checker; CSP re-measure for the route decision input | — | Harness runs the reference against itself green (self-parity), including undo chains | 3–5 |
| L1 — Model completion (A′ consumption) | `moddle-type` 163 (+`color` when its source lands), F1 codec consumption, preserved-extension retention | A′ (G0, G3) | 100 % of `moddle-type` entries bijection-proven; unknown-namespace fixtures retained | (A′ budget; parity-side 2–3) |
| L2 — Commands & rules core | `command` 33, `rule` 13, behaviour effects of generic commands; transaction/inverse semantics | L1 | 100 % of P0 `command`/`rule` entries differential-green; undo/redo round-trips equal | 6–10 |
| L3 — Scene, camera, hit (complete diagram-canvas) | `api` canvas subset (10 partial), selection/marquee, paint-order/hit completion | L2 (can start on L1 fixtures) | Point/region/lasso selection verdicts equal on fixtures; camera events equal | 4–6 |
| L4 — Interaction lifecycle | drag/create/connect/bendpoints/resize/space-tool/snapping/auto-place/align/distribute/ordering/drilldown/label-editing/copy-paste/search (`module` + `event` + `keyboard` subsets) | L2, L3 | 100 % of P0, ≥90 % of P1 interaction entries green; event-log comparison on all scripted scenarios | 10–16 |
| L5 — BPMN rendering | `renderer` 37 on route-1 draw layer (or route-2 SVG nodes), markers/icons, text measurement decision implemented | L3; font-metric decision (§11) | Geometry comparison green on all renderer fixtures; pixel secondaries within per-fixture thresholds | 6–10 |
| L6 — Chrome (DS components) | `palette` 15, `context-pad` 18, `replace-menu` 70, `popup-menu` 2 as DS components; editor shell, minimap/outline, overlays | L4, L5; E for hosting contract | Every menu entry reachable and differential-green from each offering element type | 6–9 |
| L7 — Route decision & (route 2 only) capitalisation | Owner decision on §6 evidence (L0 CSP + L4/L5 route measurements); if route 2 was taken: re-implement planes 4–5 on `@sentropic/graph`, retire translation layer | L0 (decision input), L6 (capitalisation) | Decision recorded; (route 2) full harness green on graph with the xyflow path removed | decision: 1; capitalisation: 8–14 |
| L8 — Public API, config, examples | `api` 49 facade, `config` 32, `example` 29 as acceptance scenarios (embedding/theming/i18n/overlays/minimap behaviours productised or explicitly refused) | L6 | Facade differential-green; every example either green or carrying a recorded refusal with owner | 4–7 |
| L9 — Hardening | a11y/keyboard completeness, reduced-motion, large-model performance, error/empty states, docs & migration path from bpmn-canvas | L8 | Full inventory: 100 % P0/P1 proven, P2 proven or explicitly waived per entry; bpmn-canvas cutover decision prepared | 4–6 |

Programme reading: L1–L6 are the parity core (~35–55 person-weeks plus the A′ budget, same judgement basis); route 2 adds L7 capitalisation later while (possibly) shortening L4–L6 — the L0/L4 measurements exist to price that trade with evidence instead of preference. No lot rewrites `.track/`; the conductor records lot openings/closures.

## 10. Licence and clean room

- bpmn-js is distributed under the bpmn.io licence: MIT terms **plus** the watermark clause — the source displaying the bpmn.io watermark linking to https://bpmn.io must not be removed or changed, and the watermark must stay fully visible when the software is used in a website or application (`RE:bpmn-js/LICENSE`, watermark paragraph). diagram-js is MIT (`RE:diagram-js/LICENSE`). bpmn-moddle is MIT (per its `LICENSE`).
- This programme **redistributes none of them**: it reimplements *behaviours* from observation (inputs → outputs, verdicts, geometry) in a clean room. Consequences: (a) no bpmn-js/diagram-js code, comments, file layout or asset (icons, CSS, fonts) is copied into DS packages — glyphs are redrawn from the BPMN 2.0 specification shapes and DS icon conventions; (b) the watermark clause has no object here, since no bpmn-js rendering ships — if a future lot *embeds* bpmn-js (route exceptions, spikes), the clause applies in full and the watermark stays; (c) `THIRD-PARTY-NOTICES.md` in this worktree gains entries only if a dependency is actually taken (e.g. xyflow, MIT, `RE:xyflow/LICENSE`, if route 2 is adopted) — decided at adoption, checked by the repository licensing gates.
- The inventory itself (behaviour descriptions, counts, `path:line` references) is factual documentation about the reference, written for interoperability; it contains no copied code. Scripts in `tools/re-bpmn-js/` are original Node code written for this lot.

## 11. Risks, pre-mortem and unknowns

### 11.1 Pre-mortem (it is 2027 and parity failed — why?)

1. **The model ate the schedule.** A′ generation (K-mechanisms, F1 alignment) slips, L2+ starve for fixtures, and "parity" quietly degrades into a renderer demo on hand-written models. Mitigation: L0 self-parity + L1 gate ordering; no rendering lot claims progress without model fixtures.
2. **Event-contract drift.** The target emits *almost* the reference events; integrations (undo, drilldown, search) break in ways model comparison cannot see. Mitigation: event-log comparison from L2 onward, dynamic-suffix logging (§3.3.1) in the harness.
3. **Route 2 becomes the product.** The xyflow vertical ships, capitalisation (L7) is never funded, and the DS carries a translation layer plus a DOM hit-test forever. Mitigation: L7 is in the plan from day one with its own gate; the facade (L8) is forbidden from leaking xyflow types — checked by type tests.
4. **Text measurement.** Label geometry depends on font metrics; WebGL text and DOM text disagree, fixtures flake, thresholds widen until the pixel arm is meaningless. Mitigation: font-metric decision before L5; geometry-first comparison (§8.3).
5. **The long tail of behaviours.** The 44 behaviour files (`RE:bpmn-js/lib/features/modeling/behavior/`, §5.2 count) hide most edge cases (boundary events, lanes, compensation). Command-level parity passes, real diagrams misbehave. Mitigation: behaviour-file accounting in L2/L4 acceptance; scenario corpus grows from every upstream spec file name, not from imagination.

### 11.2 Risk register (top items)

| Risk | Likelihood / impact [JUDGMENT] | Mitigation (lot) |
|---|---|---|
| F1 shape changes after the pinned `84c93dc` reading (A′ §4.2 drift already observed) | high / medium | Pin + alignment items F1-A1…A6; codec isolated in one package (L1) |
| CSP: strict `style-src-attr 'none'` vs interactive editors (xyflow violation already measured at load) | known / high for route 2 | L0 re-measure; capability-gated interactive surface, static SVG fallback (migration plan) |
| bpmn-js upstream moves (19.x) during the programme | medium / low | Pinned reference; re-run enumeration per upgrade — the guard reprices the delta mechanically |
| DS framework spread (Svelte pilot vs React/Vue/Angular parity) | medium / medium | Contract-first chrome (plane 5); per-framework proof only via executed scenarios (migration plan A4 discipline) |

### 11.3 Unknowns (`unknown` — no source in this workspace settles them)

- `unknown`: the `color` package's 3 type descriptors (source-gap, §3.3.2) — needs the `bpmn-in-color-moddle` files or a built bpmn-moddle dist.
- `unknown`: F1 final shape and the F1-A1…A6 alignments (bpmn-canvas unpublished branch) — owned by the A′ G0 gate.
- `unknown`: the standard-E (rendering by JSON) hosting contract for editor chrome — in specification elsewhere; L6 depends on its outcome for component shape, not for behaviour.
- `unknown`: font-metric source for WebGL text (self-hosted font + metrics table vs DOM measurement bridge) — decision required before L5.
- `unknown`: properties-panel ecosystem scope (several `bpmn-js-examples` entries demonstrate panel extensions; whether the DS offers an equivalent extension surface is a product decision, prepared in L8 as explicit refusals-or-scenarios).
- `unknown`: performance envelope demanded of the WebGL route (largest diagram size × interaction frame budget) — no figure exists in the workspace; L9 cannot gate without one.

---

*End of spec. Companion files: `docs/re/bpmn-js-inventory.json` (727 entries), `tools/re-bpmn-js/enumerate.mjs`, `tools/re-bpmn-js/verify.mjs`, `tools/re-bpmn-js/README.md`.*
