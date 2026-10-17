# SPEC — Reverse engineering of xyflow for 100 % functional parity on `@sentropic/graph`

Status: specification only (no implementation in this lot). Date: 2026-10-15.
Owner request (2026-10-15): 100 % functional parity with xyflow on the sentropic
graph stack, specified against a renderer-independent contract so the same
specification can be replayed on the WebGL graph engine, and reusable as the
intermediate step toward bpmn-js parity (sister specification on
`.re-bpmnjs-wt`). Track: feature `01M518XJW7NZBFFPBH4PXQDWWE`, item
`01M518XK7CT6HN7E3M5DTM8Z7V`.

## 1. Scope and pinned versions

Reference sources (read-only, already downloaded; no network was used):

- `.ds-scrap/re-sources/MANIFEST.md` pins xyflow at `@xyflow/react@12.12.0`,
  commit `3d35b57317576b0916c0bfeaaedd573aaacc2839`.
- `@xyflow/system` 0.0.83, `@xyflow/react` 12.12.0, `@xyflow/svelte` 1.7.0
  (read from each `packages/*/package.json` at generation time and recorded in
  the inventory `meta.versions`).

In scope: every observable behaviour of the three packages — public API,
component props, hooks/stores, change protocol, edge path geometry,
interactions, options/defaults, and the monorepo examples as acceptance
scenarios. Out of scope for this lot: any implementation, any copy of xyflow
code, and the bpmn-js/JointJS specifications themselves (sister lots).

Targets named by the owner programme: `@sentropic/graph` 0.3.0
(`packages/graph`, WebGL2 + Canvas2D), `packages/diagram-core` (semantic model,
transactional commands), `packages/diagram-canvas` (camera transform, scene,
hit-test), the DS component packages, and — where no existing package can own
a DOM gesture engine — a new headless module (named `flow-interaction` in this
specification; the name is a proposal, not a created package).

## 2. Method: two independent enumerations and the completeness guard

"100 %" is not asserted from reading, and it is not asserted by comparing a
file with itself. Two separately written extractors derive the surface from
the same pinned sources, and the guard compares them in both directions:

```bash
node tools/re-xyflow/enumerate.mjs   # primary extractor, regenerates the inventory
node tools/re-xyflow/verify.mjs      # independent guard, exit 1 on any disagreement
```

- `enumerate.mjs` (primary) is **semantic**: `ts.createProgram` +
  TypeChecker (`getExportsOfModule`, `getPropertiesOfType`) over
  `packages/system/src/index.ts`, `packages/react/src/index.ts` and
  `packages/svelte/src/lib/index.ts`, loaded from the repository
  `node_modules/typescript`. It extracts transitive public exports
  (including `export async function`, multi-line `export {…} from` blocks
  and `export type * from`), members of `ReactFlowProps` /
  `SvelteFlowProps` (the Svelte shape already intersects `NodeEvents` /
  `EdgeEvents` / `PaneEvents` / `NodeSelectionEvents`, so those handlers
  are yielded once), 41 sub-component prop types across React and Svelte
  plus the inline React `ViewportPortal` children prop (intersections and
  `Pick`/`Omit` resolved, e.g. `ControlProps`, `HandleProps`,
  `ResizeControlProps`), `ReactFlowInstance` and the `useSvelteFlow`
  return contract, store fields and actions (`ReactFlowStore`,
  `ReactFlowActions`, `SvelteFlowStoreActions`,
  `SvelteFlowStoreState`), change variants, model fields (`NodeBase`,
  `EdgeBase` plus the React `Node`/`Edge` extensions and the Svelte-only
  `class` names), eight enums, edge path functions and the five built-in
  edge types, 26 anchored interaction behaviours, and the example
  scenarios (`examples/react/src/examples`,
  `examples/svelte/src/routes/examples`).
- `verify.mjs` (guard) is **syntactic and independently written**: a
  `ts.createSourceFile` AST walk (export graph, type-literal /
  intersection / conditional / `Pick`/`Omit` expansion, enum members,
  directory walk) that shares no enumeration table, constant or helper
  with `enumerate.mjs`. Each family is re-derived from the sources by a
  different route: public names from the syntactic export graph, flow
  props from every `*FlowProps` shape, sub-component props from every
  `*Props` shape in a component/plugin/`types` module whose component is
  on the public surface, hooks from the barrel names, the instance
  contract from the exported `*Instance` shape and the Svelte hook
  return shape, store slices from the store modules and the Svelte
  store class body, change names from the changes module, document
  bases by following the framework node/edge shapes to their base
  reference, enums from every enum declaration, path functions from
  the edge-utils/component files, built-in edge types from the
  `builtinEdgeTypes` object literal, interactions from the normative
  catalogue table below, and examples from the example directories.
  It compares the two enumerations in both directions and, for every
  shared key, the inventory `source` path:line against the syntactic
  candidate set and the signature detail carried by the inventory
  `behaviour` text. It also enforces proof discipline (below). The
  earlier guard, which compared two counters written by the same
  `add()` call, was a tautology and has been removed; a tamper test
  (one entry deleted, one invented, one source line moved) makes the
  new guard fail in each direction, and the restored inventory passes
  again.

Scope convention for members: only members **declared inside the xyflow
tree** count. Generic DOM expansions (`HTMLAttributes`,
`SVGAttributes`, `ButtonHTMLAttributes`, …) are excluded on both sides,
so `<div>` attributes are not flow observables. React and Svelte module
exports include the re-exported `@xyflow/system` surface of each entry
module; that overlap is part of each package's public import surface
and is counted per package.

Observed output after the second Gemini correction round (this worktree):

```text
enumerated=1885 entries=1885
byFamily {"api-system":241,"api-react":210,"api-svelte":163,"props-flow":233,"props-components":497,"hooks":34,"instance":57,"store":222,"changes":12,"model":86,"edge-geometry":11,"interaction":26,"examples":93}
byStatus {"missing":1782,"excluded":3,"partial":100}
byTarget {"diagram-core":448,"graph":70,"nouveau module":387,"diagram-canvas":82,"composant DS":898}
expected(AST)=1885 inventory=1885
byFamily expected {"api-system":241,"api-react":210,"api-svelte":163,"props-flow":233,"props-components":497,"hooks":34,"instance":57,"store":222,"changes":12,"model":86,"edge-geometry":11,"examples":93,"interaction":26}
byFamily inventory {"api-system":241,"api-react":210,"api-svelte":163,"props-flow":233,"props-components":497,"hooks":34,"instance":57,"store":222,"changes":12,"model":86,"edge-geometry":11,"interaction":26,"examples":93}
byStatus {"missing":1782,"excluded":3,"partial":100}
GUARD PASS: 100% of the independently enumerated surface has an inventory entry and every inventory entry resolves in the sources; source files/lines and signature details match the syntactic derivation; ids unique; proof discipline holds.
```

"100 %" in this spec means exactly this guard passing: every element of
the independently enumerated surface has an inventory entry, and every
inventory entry resolves in the sources. It is a claim about
enumeration completeness, never about implementation parity (see
`covered` below).

Counting convention (stated with every figure in this spec): one entry per
enumerated observable per family. Families overlap by design (a hook is one
entry in `api-react` as an export and one in `hooks` as a hook contract), so
1885 is a sum over families, not a count of unique names. Every inventory
entry in `docs/re/xyflow-inventory.json` carries: stable `id`, `family`,
`name`, `source` (path:line in the xyflow tree), `behaviour` (observable
input → output / interaction → effect, with the full type signature and
the JSDoc `@default` of that same property when one is documented),
`acceptance` (differential test scenario), `target`, `status` with
`proof`, and `priority` (P0/P1/P2).

Status semantics are strict:

- `covered` — the same observable contract is already implemented and can be
  proven by the differential harness. Count today: **0**. No xyflow entry is
  iso today; claiming otherwise would require the harness of §6, which is
  lot L0 and does not exist yet.
- `partial` — a named underlying capability exists under a different
  contract (e.g. camera maths exists, the xyflow viewport API does not).
  `proof` is then a resolvable path:line in the sentropic corpus.
  Count: **100**.
- `missing` — no equivalent found by mechanical search of
  `packages/graph/src`, `packages/diagram-core/src`, `packages/diagram-canvas/src`
  at generation time. `proof` is `null` by rule: a missing capability has
  no location, and no fabricated location may stand in for one.
  Count: **1782**.
- `excluded` — enumerated, deliberately not ported as-is, with the reason
  recorded in `coverageNote`. `proof` is `null`. Count: **3** (the
  D3-coupled aliases `D3ZoomInstance`, `D3SelectionInstance`,
  `D3ZoomHandler`; see §6 and the annex).

Interaction catalogue (normative). The 26 interaction behaviours are
specification-defined gestures, not type members; this table is their
normative list. Each row cites the xyflow engine file that anchors the
behaviour (the inventory entry cites the anchor line in that file). The
guard derives its interaction expectation from this table, while the
primary extractor enumerates the same slugs from its anchored catalogue
in code; a drift between the two fails the guard.

| Slug | Anchor file |
|---|---|
| `pan-by-drag` | `packages/system/src/xypanzoom/XYPanZoom.ts` |
| `pan-on-scroll` | `packages/system/src/xypanzoom/eventhandler.ts` |
| `zoom-on-scroll-and-pinch` | `packages/system/src/xypanzoom/XYPanZoom.ts` |
| `zoom-on-double-click` | `packages/system/src/xypanzoom/XYPanZoom.ts` |
| `node-drag` | `packages/system/src/xydrag/XYDrag.ts` |
| `multi-node-drag` | `packages/system/src/xydrag/XYDrag.ts` |
| `snap-to-grid` | `packages/system/src/xydrag/utils.ts` |
| `selection-rectangle` | `packages/react/src/container/Pane/index.tsx` |
| `multi-selection-keys` | `packages/react/src/hooks/useGlobalKeyHandler.ts` |
| `connection-drag` | `packages/system/src/xyhandle/XYHandle.ts` |
| `click-to-connect` | `packages/react/src/components/Handle/index.tsx` |
| `connection-validation` | `packages/system/src/xyhandle/utils.ts` |
| `edge-reconnect` | `packages/react/src/components/EdgeWrapper/index.tsx` |
| `node-resize` | `packages/system/src/xyresizer/XYResizer.ts` |
| `parent-and-subflow` | `packages/system/src/utils/graph.ts` |
| `extent-clamping` | `packages/system/src/utils/graph.ts` |
| `auto-pan-on-drag` | `packages/system/src/xydrag/XYDrag.ts` |
| `keyboard-move-and-delete` | `packages/react/src/hooks/useGlobalKeyHandler.ts` |
| `keyboard-focus-and-a11y` | `packages/react/src/components/A11yDescriptions/index.tsx` |
| `only-render-visible-elements` | `packages/react/src/hooks/useVisibleNodeIds.ts` |
| `minimap-pan-zoom` | `packages/system/src/xyminimap/index.ts` |
| `controls-buttons` | `packages/react/src/additional-components/Controls/Controls.tsx` |
| `fit-view-on-init` | `packages/system/src/utils/graph.ts` |
| `elevate-on-select-zindex` | `packages/react/src/store/initialState.ts` |
| `color-mode` | `packages/react/src/hooks/useColorModeClass.ts` |
| `hidden-and-visibility` | `packages/system/src/types/nodes.ts` |

## 3. Inventory summary by family

| Family | Entries | covered | partial | missing | excluded | Main target |
|---|---:|---:|---:|---:|---:|---|
| api-system | 241 | 0 | 21 | 217 | 3 | diagram-core |
| api-react | 210 | 0 | 14 | 196 | 0 | diagram-core (re-exports) / composant DS |
| api-svelte | 163 | 0 | 10 | 153 | 0 | diagram-core (re-exports) / composant DS |
| props-flow | 233 | 0 | 0 | 233 | 0 | composant DS |
| props-components | 497 | 0 | 0 | 497 | 0 | composant DS |
| hooks | 34 | 0 | 0 | 34 | 0 | composant DS |
| instance | 57 | 0 | 28 | 29 | 0 | diagram-canvas / nouveau module |
| store | 222 | 0 | 0 | 222 | 0 | nouveau module |
| changes | 12 | 0 | 12 | 0 | 0 | diagram-core |
| model | 86 | 0 | 10 | 76 | 0 | nouveau module (transient) / diagram-core (identity) |
| edge-geometry | 11 | 0 | 2 | 9 | 0 | graph |
| interaction | 26 | 0 | 3 | 23 | 0 | nouveau module |
| examples | 93 | 0 | 0 | 93 | 0 | composant DS |
| **Total** | **1885** | **0** | **100** | **1782** | **3** | — |

By target: `composant DS` 898, `diagram-core` 448, `nouveau module` 387,
`diagram-canvas` 82, `graph` 70. By priority: P0 210, P1 1582, P2 93.
`api-react` and `api-svelte` count each package's full import surface,
including its re-exported `@xyflow/system` names; those re-exports keep
the target of their nature (headless core, canvas maths, or graph
geometry), and only components, hooks and framework wrappers target
`composant DS`. 174 entries carry a documented default taken from the
JSDoc `@default` of that same property (for example bezier `curvature`
0.25 in
`.ds-scrap/re-sources/xyflow/packages/system/src/utils/edges/bezier-edge.ts`);
runtime defaults that live only in initial state (for example
`snapToGrid: false`, `snapGrid: [15, 15]` in
`packages/react/src/store/initialState.ts`) are recorded in §7, not
invented from neighbouring JSDoc.

What the 100 `partial` entries are (full list is queryable in the JSON):
viewport/fit/centre helpers and bounds/intersection maths (the
`diagram-canvas` affine and rect algebra exist, the xyflow
`[tx, ty, zoom]` API shape does not), all 12 change variants plus
`apply*Changes` (transactional commands exist, the change-array protocol
does not), the identity fields of the model (`Entity`/`Relation` already
carry id, type and attributes/endpoints), `getStraightPath` and the
straight edge type (straight polylines exist, the SVG path contract does
not), and visibility culling (`evaluateVisibility` exists, the
`onlyRenderVisibleElements`/`hidden` wiring does not). Gesture entries
stay `missing`: a camera transform is not a gesture engine.

## 4. Renderer-independent target architecture (the capitalisation contract)

The specification describes behaviours against four contracts, never against
a renderer. Any engine (today's WebGL2/Canvas2D graph, a future WebGPU
engine) can be certified against the same inventory.

1. **Model contract** (owner: `diagram-core`). A serialisable flow document:
   nodes (`id`, `position`, `data`, `type`, measured size, `parentId`,
   `extent`, selection/drag/connect flags), edges (`id`, `source`, `target`,
   handle ids, `type`, markers, label), viewport. This maps to
   `diagram-core` documents/views/occurrences; the xyflow `positionAbsolute`,
   `internals` and lookup maps (`nodeLookup`, `parentLookup`, `edgeLookup`,
   `connectionLookup`) are derived indexes, not document state.
2. **Command/change contract** (owner: `diagram-core`). Every mutation is a
   transaction with a logical inverse (already the `diagram-core` model:
   `applyTransaction`, `packages/diagram-core/src/commands.ts`). The xyflow
   change-array protocol (`NodeChange`/`EdgeChange`, `applyNodeChanges`,
   `onBeforeDelete` gate, `deleteElements`) is specified as an adapter over
   transactions: same emitted arrays, same ordering, undo falls out of the
   inverses instead of being re-implemented.
3. **Event contract** (owner: new `flow-interaction` module on
   `diagram-canvas`). Gestures (pan, zoom, drag, connect, reconnect, resize,
   selection rect, keyboard) are specified as deterministic state machines
   over `diagram-canvas` primitives that already exist: the world/view/device
   affine (`worldToDevice`, `packages/diagram-canvas/src/transform.ts`),
   `buildScene` with deterministic paint order
   (`packages/diagram-canvas/src/scene.ts`), and point/region hit-testing
   (`hitTest`/`hitTestRegion`, `packages/diagram-canvas/src/hit.ts`). The
   module owns no rendering and no framework code; React/Svelte shells only
   bind DOM events to it and store slices to framework state.
4. **Abstract rendering contract** (owner: `@sentropic/graph`). The renderer
   consumes: node rects + ports, edge polylines/paths (straight, bezier,
   smoothstep/step, octilinear), markers, labels, selection chrome, minimap
   raster. `@sentropic/graph` already renders typed-buffer scenes
   (`createGraphRenderer`, `packages/graph/src/renderer.ts`), straight/arc
   edge polylines (`EdgeCurveMode`, `packages/graph/src/edge-geometry.ts`),
   octilinear routing (`EdgeRouteStyle`, `packages/graph/src/types.ts`),
   layouts in workers (`force-fa2`, `hierarchy-aware`,
   `packages/graph/src/processing/register.ts`; `handleLayoutRequest`,
   `packages/graph/src/worker.ts`). Custom-node HTML content cannot be a
   WebGL glyph: it is rendered by a DOM overlay synchronised to the camera
   (the hybrid pattern the graph box-label overlay already uses), which is
   also what the standard-E JSON/web-component rendering work assumes.
   Layout (ELK etc.) stays outside parity: xyflow has no built-in layout,
   so none is specified here beyond `fitView` framing.

Camera conversion (normative). xyflow and `diagram-canvas` use opposite
camera conventions, and every viewport entry depends on this formula.
xyflow maps flow to screen as `x_screen = x_flow * zoom + viewport.x`
(`rendererPointToPoint`, `packages/system/src/utils/general.ts`), while
`diagram-canvas` maps world to view as
`x_view = (x_world - camera.x) * zoom`
(`worldToView`, `packages/diagram-canvas/src/transform.ts`). The exact
bridge is therefore `viewport.x = -camera.x * camera.zoom` (same for
`y`), with `zoom` identical on both sides; `getViewport`, `setViewport`,
`useViewport`, `onMove` and the MiniMap must implement this conversion
and no other. The inverse (`pointToRendererPoint` vs the
`diagram-canvas` inverse affine) follows by algebra and is covered by
the same differential fixtures.

Hybrid rendering on WebGL (normative). Built-in nodes and edges render
in the WebGL scene; custom nodes and custom edges supplied as React or
Svelte components (`nodeTypes`, `edgeTypes`, `NodeProps`, `EdgeProps`)
render in a DOM overlay synchronised to the camera
(`transform: translate3d(…) scale(…)` over the canvas framebuffer),
with a single mixed paint order: WebGL edges below overlay nodes unless
an entry states otherwise. `<Handle>`, `<NodeToolbar>`,
`<EdgeToolbar>`, `<EdgeLabelRenderer>` and `<ViewportPortal>` content
lives in that overlay; picking for WebGL content goes through
`diagram-canvas` hit-testing (`hitTest`/`hitTestRegion`), which
synthesises node/edge/handle enter/move/leave/click sequences from
canvas pointer events. Node measurement follows the overlay: a DOM
node's measured size feeds `node.measured` and `nodesInitialized`
exactly as xyflow's `ResizeObserver` cycle does, handle anchor bounds
derive from the same measured rects, and a node with no overlay
representation must declare explicit dimensions or the layout-provided
size. Edge path functions stay pure SVG-string contracts for API
compatibility; the WebGL pipeline tessellates the same cubic and
step geometry into polylines/quads, and hit-testing uses that same
tessellation widened by `interactionWidth`. Transient interaction
state (`dragging`, `selected`, `measured`, `resizing`,
`interactionWidth` and selection rectangles) is owned by the
view/store side (`nouveau module`, over `diagram-canvas` view state);
it is never written to `diagram-core`'s `SemanticDocument`, whose
invariants forbid geometry and interaction state
(`packages/diagram-core/src/document.ts`,
`packages/diagram-core/src/view.ts`). Persisted geometry lives on
view occurrences (`EntityOccurrence.geometry`).

Per family, what exists and what is missing:

| Family | Already on the sentropic stack (proof) | Missing |
|---|---|---|
| model | Typed documents, profiles, views (`packages/diagram-core/src/document.ts`, `view.ts`) | xyflow node/edge field semantics (handles, `measured`, `extent`, z rules) |
| changes | Transactions + inverses (`packages/diagram-core/src/commands.ts`) | Change-array adapter, `onBeforeDelete`, batching semantics |
| edge-geometry | Straight/arc polylines, octilinear (`packages/graph/src/edge-geometry.ts`, `types.ts`) | Bezier/simple-bezier/smoothstep/step path functions, markers, edge labels |
| interaction | Transform, scene, hit-test (`packages/diagram-canvas/src/transform.ts`, `scene.ts`, `hit.ts`) | All gesture state machines (drag, panzoom, handle, resizer, selection) |
| store/instance | — (renderer camera is not a flow store) | Headless flow store, lookups, viewport helpers with padding/duration/easing |
| props/hooks/components | DS component infrastructure (4 frameworks) | The flow components themselves (Flow, Controls, MiniMap, Background, Panel, toolbars, resizer, Handle, EdgeLabelRenderer) |
| api-system utils | Rect algebra (`packages/diagram-canvas/src/geometry.ts`) | Graph traversal (`getIncomers`…), connection helpers, marker defs, `getViewportForBounds` API shape |

## 5. xyflow as the intermediate step toward bpmn-js

The owner programme runs three reverse-engineering lots (bpmn-js, xyflow,
JointJS) toward the same graph target. xyflow parity is the cheapest
interaction layer of the three: bpmn-js needs a node-based editor surface
(drag, connect, resize, sub-flows, minimap, keyboard) before it needs BPMN
semantics, and that surface is exactly families `interaction`, `changes`,
`props-flow` and `props-components` here. Delivering this spec's lots L1–L4
therefore de-risks the bpmn-js route (model in `diagram-core` per decision
A′, rendering on graph) without committing to bpmn-js's own model. The
converse also holds: nothing in this spec's contracts names React, Svelte,
SVG or d3, so the bpmn-js lot can reuse the same harness fixtures with a
different initial document.

## 6. Differential parity harness

Implementation (Lot L0): the harness described in this section is built as the single shared harness in [tools/re-harness/README.md](../tools/re-harness/README.md) (fixture schemas, comparators, coverage verifier, frozen contracts). Read that README for the runner status per library; this section remains the normative design.

Same inputs, both implementations, compared outputs:

- **Fixtures**: serialised flow documents (nodes/edges/viewport/options),
  seeded from the 93 example scenarios and from minimal per-family fixtures.
  One fixture per inventory entry's `acceptance` field; fixtures are data,
  never copied xyflow code.
- **Driver**: scripted interactions (pointer/keyboard sequences with fixed
  coordinates and timing) executed in headless Chrome against (a) a reference
  page running xyflow and (b) the sentropic implementation. Repository fact:
  the harness available in this repo is `puppeteer-core` (root
  `package.json`) plus the CDP pattern of
  `packages/graph/tests/golden/cdp-harness.mjs`; `playwright-core` is **not**
  present in this repo (checked: no `playwright-core` in `package.json` /
  `node_modules`). The plan therefore budgets adapting the CDP harness, and
  records the task premise ("playwright-core, already present") as a
  source-gap, not as a verified fact.
- **Compared**: resulting model (`toObject` JSON, exact after normalising key
  order), emitted event/change sequences (exact names, payload shapes,
  order), viewport transform (tolerance 1e-6), edge paths (the SVG `d`
  string is parsed into commands `M`/`L`/`C`/`Q` and the coordinates are
  compared numerically at 1e-6; character-exact string equality is not
  required, because float formatting order may legitimately differ at
  1e-16; rendered geometry tolerance 0.5 px), and — only where text/DOM
  chrome is involved — screenshots with a stated pixel-difference
  threshold. Not compared: internal store shapes, d3 transition
  internals, frame timing, CSS class names (except the documented
  color-mode class contract).
- **Driving**: two layers. L1 (headless, Vitest-style) covers pure
  contracts: system utilities, change application, path geometry,
  bounds/fit maths. L2 (browser) covers gestures and rendering. L2
  scripts drive both implementations by viewport coordinates
  (`clientX`, `clientY` computed from the model and the §4 camera
  conversion), never by xyflow DOM selectors (`.react-flow__node` and
  friends do not exist on a WebGL canvas). Animated helpers
  (`fitView` with duration, `setCenter`, `setViewport`, `zoomIn` /
  `zoomOut`) run under a frozen clock (`performance.now` and
  `requestAnimationFrame` are harness-controlled); final states are
  compared at 1e-6 and intermediate states only at harness-stepped
  timestamps against the documented easing contract.
- **Exclusions**: the three D3 aliases (`D3ZoomInstance`,
  `D3SelectionInstance`, `D3ZoomHandler`) are `excluded`, not ported:
  no D3 instance exists on the sentropic stack, and callers receive the
  documented absence instead of a fabricated object. The
  `proOptions` / attribution surface is accepted as props (callers must
  not break), but no `xyflow.com` watermark is injected by default;
  the product decision is recorded in §10.
- **Gate mechanics**: an entry moves to `covered` only when its harness
  scenario passes on both sides. `verify.mjs` guards enumeration
  completeness (two independent extractors, §2); a harness guard (to be
  built in L0) will assert that every `covered` entry names a passing
  scenario id. No lot may declare a gate on manual testing.

## 7. Load-bearing defaults (extract)

Full defaults live in each inventory entry. The ones that change geometry or
event semantics: `defaultViewport {x:0,y:0,zoom:1}` and
`defaultNodeOrigin [0,0]` (`packages/react/src/container/ReactFlow/init-values.ts`);
bezier curvature 0.25; node/edge built-in types (`input/default/output/group`;
`default/straight/step/smoothstep/simplebezier`,
`packages/react/src/index.ts`); `elevateNodesOnSelect: true`
(`packages/react/src/store/initialState.ts`); error/aria catalogues
(`packages/system/src/constants.ts`, incl. `error001`–`error016` and
`defaultAriaLabelConfig`); `snapToGrid: false` and `snapGrid: [15, 15]`
(`packages/react/src/store/initialState.ts`). Zoom extents and thresholds
have no single constant: they are prop-level defaults recorded per entry
and must be read from the JSON, not from this summary. A documented
default in an entry always comes from that property's own JSDoc; no
default is inherited from a neighbouring property.

## 8. Plan (ordered lots, dependencies, gates, cost as judgement)

Costs are judgements (T-shirt + person-week range), not measurements.

| Lot | Covers (inventory) | Depends on | Gate (harness-proven `covered`) | Cost (judgement) |
|---|---|---|---|---|
| L0 Harness & fixtures | 0 entries; enables all gates | — | Reference + candidate runners execute the 93 example fixtures on L1+L2 drivers; compared outputs archived | M (2–4 pw) |
| L1 Model & change protocol | model 86, changes 12 | L0 | ≥ 98/1885 (5 %) | M (3–5 pw) |
| L2 Edge geometry & markers | edge-geometry 11 + edge entries in api-* (~35) | L1 | ≥ 140/1885 (7 %) | S–M (2–3 pw) |
| L3 Pan-zoom & viewport core | pan/zoom gestures, instance viewport helpers (57 shared with L4), `onMove*` | L1 | ≥ 230/1885 (12 %) | L (5–7 pw) |
| L4 Flow store & interaction engine (`flow-interaction`) | store 222, interaction 26 | L1, L3 | ≥ 380/1885 (20 %) | XL (8–12 pw) |
| L5 Providers, flow shells, components + hooks (React, then Svelte) | props-flow 233, hooks 34, component exports; providers/shells land first inside the lot, hooks are gated after them | L4 | ≥ 720/1885 (38 %) | XL (10–14 pw) |
| L6 Sub-components | props-components 497 (Controls, MiniMap, Background, Panel, NodeToolbar, NodeResizer, EdgeToolbar, Handle, labels) | L5 | ≥ 1010/1885 (54 %) | L (5–8 pw) |
| L7 System utils parity | api-system / api-react / api-svelte remainder | L1, L2 | ≥ 1500/1885 (80 %) | M (3–5 pw) |
| L8 Examples, a11y, hardening | examples 93 + remaining P1/P2 | L5, L6, L7 | 1885/1885 (100 %) | L (5–8 pw) |

Total judgement: ~43–66 person-weeks. The critical path is L0 → L1 → L3 →
L4 → L5 → L8. Sequencing notes: the harness (L0) precedes every gate that
cites it; viewport helpers (L3) precede the store and hooks that consume
them; providers and flow shells precede hook acceptance inside L5, so no
lot tests hooks against containers that do not exist yet. The custom-node
DOM overlay (§4) is the main cost risk and sits in L5. Svelte parity
inside L5/L6 assumes the contract of §4 holds; if the Svelte binding
needs its own store semantics, L5 splits and the total grows
(see unknowns).

## 9. Licence and clean-room rule

xyflow is MIT (`LICENSE` at the monorepo root: Copyright (c) 2019-2025
webkid GmbH). MIT permits reuse, but this programme's rule is stricter:
**no third-party code is copied**. This specification and the inventory
describe behaviours, names, signatures and source locations only; the
enumeration scripts extract identifiers and line numbers, never function
bodies. Implementations must be written from the `behaviour`/`acceptance`
contracts. Where a sentropic package later ships code informed by this spec,
its notices must still credit xyflow as a behavioural reference if any
xyflow-derived material were ever used — under the clean-room rule the
expected amount is zero, and any exception requires an explicit owner
decision recorded before the code is written. If TypeScript type
declarations, CSS constants or geometry formulas were ever taken over
substantially, the MIT notice (`Copyright (c) 2019-2025 webkid GmbH`)
must be preserved in the shipping package's notices; the clean-room
rule otherwise forbids literal copying of declarations and is the
default. The `proOptions` surface is accepted for caller compatibility;
no third-party commercial watermark is rendered by default (§6).

## 10. Risks, pre-mortem, unknowns

Pre-mortem (it is 2027 and parity failed — why): (1) custom-node HTML was
forced into WebGL instead of the DOM overlay, blocking every real-world
flow; (2) the change-array ordering/batching semantics were approximated,
so controlled-mode apps diverged silently; (3) Svelte 5 binding semantics
were assumed symmetric with React controlled props and were not; (4) the
harness compared screenshots instead of models/events, so gates passed
while behaviour differed; (5) scope crept from "observable behaviour" to
"internal store shape", doubling L3.

Risks: d3-zoom easing/duration equivalence for animated viewport helpers;
touch/pinch gesture coverage on real devices; text measurement differences
for edge labels between SVG (xyflow) and the graph label path; performance
at the `Stress` example scale on WebGL vs DOM nodes; a11y announcement
timing (`aria-live`) not being deterministically comparable in the harness.

Unknowns (status `unknown`, to resolve before the named lot):

- `unknown`: whether `playwright-core` should be adopted (new dependency,
  owner decision D7-style) or the CDP/puppeteer-core harness extended — L0.
- `unknown`: SvelteFlow store/binding divergences from ReactFlow beyond the
  prop surface (the inventory enumerates props, not runtime binding
  semantics) — before L5 Svelte half.
- `unknown`: which xyflow CSS/DOM contracts (class names, `data-id`
  attributes) count as observable for parity — before L5.
- Resolved: the three D3 aliases are `excluded` (§6); Svelte names its
  zoom helper `setZoom` where React uses `zoomTo`
  (`packages/svelte/src/lib/hooks/useSvelteFlow.svelte.ts`), and both
  names are enumerated as distinct instance entries.
- `unknown`: pro/attribution product behaviour beyond prop acceptance
  (`proOptions`, Attribution component) for a parity clone — before L6.
- `unknown`: bpmn-js lot's exact reuse point for the `flow-interaction`
  module (sister spec not yet landed) — before L3 API freeze.
- Not verified in this lot: runtime behaviour of any xyflow example (no
  browser was run; examples are enumerated as scenarios, not executed), and
  the sentropic golden/WebGL test lanes (out of scope for a spec lot).

## Annex A. Gemini review: corrections applied / refused

Independent review: `.ds-scrap/re-reviews/xyflow-gemini-review.md`
(verdict: à refaire). Every item was checked against the pinned sources
before being applied. "Applied" means the inventory, the tooling or this
spec now reflects the correction; counts below are the first-round
post-correction figures (1598 entries at that round, superseded by
Annex B).

Applied:

1. Guard tautology (`verify.mjs` compared two counters written by the
   same `add()` call). Replaced by the independent syntactic AST
   extractor of §2; it compares both directions and fails on any
   one-sided element. First run exposed 34 further missing Svelte
   NodeResizer props, one conditional-type member and one mis-cited
   anchor; all fixed, guard passes.
2. `export async function` missed (`fitViewport`,
   `packages/system/src/utils/graph.ts:375`; `getElementsToRemove`,
   same file:483; `panBy`, `packages/system/src/utils/store.ts:510`).
   All three are now in `api-system` (241 entries).
3. Multi-line `export {…} from` and `export type * from` missed. The
   Svelte edge components and types and the general types are now
   enumerated (`api-svelte` 163 entries, including `BezierEdge`,
   `Edge`, `KeyModifier`); React/Svelte re-exports of
   `@xyflow/system` are counted as part of each package's import
   surface and keep the target of their nature.
4. Twenty hallucinated entries invented from callback parameters
   (`ReactFlow.event/edge/handleType/connectionState` and sixteen
   `instance.*` parameter fragments). Deleted; full multi-line
   signatures are now taken from the TypeChecker, with no truncation.
5. `ViewportHelperFunctions` read from the wrong file, plus
   `viewportInitialized` and the whole `useSvelteFlow` contract
   (including `setZoom` vs React `zoomTo`). `instance` is now 57
   entries (32 React + 25 Svelte).
6. `ControlsProps` does not exist; the type is `ControlProps`
   (`packages/react/src/additional-components/Controls/types.ts:9`)
   with `ControlButtonProps` at line 68. All 14 props are enumerated.
7. `Handle` geometry mistaken for `<Handle>` props; `EdgeToolbar`
   base props and the Svelte/React sub-component props missing.
   `props-components` is now 291 entries over 27 prop types, with
   `HandleProps`, `EdgeToolbarBaseProps` (via intersection),
   `ResizeControlProps`, `MiniMapNodeProps`, `BaseEdgeProps`,
   `EdgeTextProps` and the Svelte counterparts resolved.
8. `@default` values inherited from the preceding property
   (`snapToGrid`/`snapGrid`, `onBeforeDelete`, `MiniMap.inversePan`,
   `NodeResizer.onResize*`, `nodeTypes`/`edgeTypes`). Defaults now
   come only from the property's own JSDoc; runtime defaults such as
   `snapToGrid: false` and `snapGrid: [15, 15]`
   (`packages/react/src/store/initialState.ts`) are stated in §7.
9. Model, geometry and store gaps: `NodeBase.type` (conditional
   intersection member), React `Node`/`Edge` extensions,
   `BackgroundVariant`/`ResizeControlVariant` members,
   `getSimpleBezierPath`
   (`packages/react/src/components/Edges/SimpleBezierEdge.tsx:47`),
   `ReactFlowActions` (20 actions) and `SvelteFlowStoreActions`
   (22 actions). `model` is 84 entries, `store` 127, `edge-geometry`
   11. One cited anchor was itself wrong and is corrected:
   `zoomOnDoubleClick` lives in
   `packages/system/src/xypanzoom/XYPanZoom.ts`, not in
   `eventhandler.ts`.
10. Svelte examples read from the wrong directory. `examples` is now
    93 scenarios (66 React + 27 Svelte directories under
    `examples/svelte/src/routes/examples`).
11. Targets and statuses: `@xyflow/system` no longer defaults to
    `composant DS` (707 such entries remain, all genuine components,
    hooks, wrappers and overlays); transient model fields target the
    view/store side, never `SemanticDocument`; change variants are
    uniformly `partial` on the transaction proof; visibility entries
    are `partial` on `evaluateVisibility`; every `missing`/`excluded`
    entry carries `proof: null` (the fabricated
    `packages/graph/src/renderer.ts:1180` proof is gone).
12. Architecture and plan: §4 now specifies the hybrid WebGL + DOM
    overlay, the measured-node cycle, edge tessellation with
    hit-testing, and the exact camera conversion
    (`viewport.x = -camera.x * camera.zoom`); §6 compares parsed SVG
    commands numerically at 1e-6, drives L2 by coordinates under a
    frozen clock, and records the D3 exclusions; §8 starts with the
    harness (L0), puts viewport (L3) before store/hooks, and
    providers/shells before hook acceptance inside L5. Gates were
    stated over 1598 at that round; total judgement is now ~43–66 person-weeks.

Refused (with source proof):

- The review header pins `@xyflow/system@0.0.75`; the pinned tree is
  0.0.83 (`packages/system/package.json`), as §1 already stated. The
  `api-svelte` size is stated as 24 entries; the delivered inventory
  held 65 (now 163). The missing-items substance was applied; the two
  figures were not.
- Three names listed as `ReactFlowActions` members
  (`updateNodeDimensions`, `fitView`, `setPaneClickDistance`) are not
  members of that type (`packages/react/src/types/store.ts`,
  `ReactFlowActions` block); the actual 20 include
  `updateNodeInternals`, `updateConnection` and `setCenter`, and
  `fitView` is an instance helper
  (`packages/react/src/types/instance.ts`). Applied with the corrected
  list.
- The store fields `d3zoom`/`d3selection`/`d3zoomhandler` cited at
  `packages/react/src/types/store.ts:81-83` do not exist in this tree
  (the store holds `panZoom: PanZoomInstance`); the D3 aliases live in
  `packages/system/src/types/general.ts:258-260`. The exclusion
  principle was applied to those three aliases; the cited fields and
  location were not.
- The claim that `packages/graph/src/renderer.ts` already implements
  pointer pan/zoom was not confirmed (no pointer/pan handling in that
  file; the camera is caller-driven state). Pan gestures therefore
  stay `missing` instead of becoming `partial` on that evidence.
- The gate figure of 91 examples was not retained: the directories
  count 66 + 27 = 93, which is what the guard enumerates.

## Annex B. Gemini review round 2: corrections applied / refused

Independent review: `.ds-scrap/re-reviews/xyflow-gemini-review-r2.md`
(verdict: fusionnable après corrections). Every item in its §4 list was
checked against the pinned sources in `.ds-scrap/re-sources/xyflow`
before being applied. Counts below are the post-correction figures
guarded in §2 (1885 entries). The five first-round refusals were
re-judged valid by the review and are not reopened here.

Applied:

1. Sixteen duplicated `SvelteFlow.on* (*Events)` entries in
   `props-flow` removed. `SvelteFlowProps` already intersects
   `NodeEvents`, `EdgeEvents`, `PaneEvents` and `NodeSelectionEvents`
   (`packages/svelte/src/lib/container/SvelteFlow/types.ts`, the
   intersection at the head of the shape), so the semantic expansion
   yields each handler once. The redundant second loop is deleted on
   the primary side and the syntactic guard derives the same handlers
   from the `*FlowProps` shape alone. `props-flow` is now 233 entries
   (was 249 with the duplicates).
2. Value/type detection and type rendering in the public-export
   extraction corrected. Value presence is now tested on the resolved
   alias, and pure types are rendered from their declaration text (or
   the declared type) instead of the value-space type, so no entry
   carries `(type, any)`. Checked samples: `StepEdge`,
   `useReactFlow` and `useStore` are `(value, ...)`; `Viewport` is
   `(type, { x: number; y: number; zoom: number })`;
   `SmoothStepEdgeProps` keeps its named alias text.
3. All fixed-length signature truncations removed. Signatures are
   rendered without truncation, so no behaviour text ends inside an
   identifier (the `AdoptUs` / `}: St` artefacts are gone).
4. The five `edgeType:*` sources corrected to their own component
   file and line: `default (bezier)` to `BezierEdge.tsx`, `straight`
   to `StraightEdge.tsx`, `step` to `StepEdge.tsx`, `smoothstep` to
   `SmoothStepEdge.tsx`, `simplebezier` to `SimpleBezierEdge.tsx`,
   each at its component definition, instead of the React barrel path
   combined with the Bezier line.
5. Missing observables completed, with the guard re-derived rather
   than copied. In `store`, the Svelte store state is enumerated from
   `SvelteFlowStoreState` (`packages/svelte/src/lib/store/types.ts`,
   `ReturnType<typeof getInitialStore>` over the class in
   `packages/svelte/src/lib/store/initial-store.svelte.ts`); the guard
   re-derives the same slices from that class body. `store` is now
   222 entries (105 React slices/actions, 22 Svelte actions, 95 Svelte
   state slices). In `props-components`, the following are added:
   `ReactFlowProviderProps` (14, `packages/react/src/components/ReactFlowProvider/index.tsx`),
   `SvelteFlowProviderProps` (1, `packages/svelte/src/lib/components/SvelteFlowProvider/types.ts`),
   `svelte:Panel` `PanelProps` (5, `packages/svelte/src/lib/container/Panel/types.ts`),
   `svelte:BaseEdge` `BaseEdgeProps` (11, `packages/svelte/src/lib/types/edges.ts`),
   React `EdgeLabelRendererProps` (1, `packages/react/src/components/EdgeLabelRenderer/index.tsx`),
   the inline React `ViewportPortal` children prop
   (`packages/react/src/components/ViewportPortal/index.tsx`, the
   `{ children: ReactNode }` parameter, no named alias in the sources),
   and the predefined edge-component props `BezierEdgeProps`,
   `SmoothStepEdgeProps`, `StepEdgeProps`, `StraightEdgeProps`,
   `SimpleBezierEdgeProps` on the React side and `BezierEdgeProps`,
   `SmoothStepEdgeProps`, `StepEdgeProps`, `StraightEdgeProps` on the
   Svelte side (`packages/react/src/types/edges.ts`,
   `packages/svelte/src/lib/types/edges.ts`), including `pathOptions`.
   `props-components` is now 497 entries. In `model`, the Svelte-only
   names `svelte:Node.class` (`packages/svelte/src/lib/types/nodes.ts`,
   `class?: ClassValue`) and `svelte:Edge.class`
   (`packages/svelte/src/lib/types/edges.ts`, `class?: ClassValue`)
   are added; `model` is now 86 entries. On the guard side, no
   sub-component table is copied from the primary: `*Props` shapes are
   discovered in component/plugin/`types` modules on the public
   surface (see §2), so a future component forgotten by the primary
   list would fail the guard in the missing direction.
6. Target mapping adjusted: `zoom` joins the `diagram-canvas` rule so
   `GetZoom`, `ZoomInOut` and `ZoomTo`
   (`packages/system/src/types/general.ts`) align with their
   `partial` proof in `diagram-canvas`, and `ViewportPortal*` is
   matched as a DS component before the viewport rule, so
   `ViewportPortalProps` targets `composant DS`.
7. Inventory regenerated and spec counts updated: 1885 entries
   (see §2/§3/§8). `missing` 1782, `partial` 100, `excluded` 3
   (unchanged); documented defaults 174.

Guard independence and comparison (applies across items 1, 5 and 7):
the guard shares no enumeration table, whitelist, constant or helper
function with the primary extractor (the primary component table,
change list, model/enum lists, edge-type list and interaction list
have no counterpart literal in the guard; each guard family is derived
by the distinct routes listed in §2, and kind detection is scoped to
the export-reachable files of the owning package so internal homonyms
do not flip a public type). For every shared key the guard now also
compares the inventory `source` path:line against the syntactic
candidate set and the signature detail in the inventory `behaviour`
text, not only identifiers. One primary citation was corrected to
make that comparison exact: `ReactFlow` now cites its function
definition (`packages/react/src/container/ReactFlow/index.tsx`, the
`function ReactFlow` declaration) instead of the
`export default fixedForwardRef(ReactFlow)` wrapper line in the same
file. Tamper evidence in this round: deleting one entry, inventing
one entry, and moving one source line each make the guard fail
(exit 1); the restored inventory passes (see §2).

Refused (with source proof):

- Per-member expansion of `ConnectionLineComponentProps` in
  `props-components` is refused. That shape is the contract of a
  caller-supplied component type,
  `ConnectionLineComponent = ComponentType<ConnectionLineComponentProps>`
  (`packages/react/src/types/edges.ts:286`), not of a library-rendered
  sub-component. The precedent in this inventory is uniform:
  caller-component shapes (`NodeProps`, `EdgeProps`) are enumerated
  once as public exports and are not expanded per member in
  `props-components`; `ConnectionLineComponentProps`
  (`packages/react/src/types/edges.ts:263`) and
  `ConnectionLineComponent` are likewise already present as
  `api-react` exports. The predefined edge-component props (previous
  item) are applied because those components are rendered by the
  library itself.
- A distinct `svelte:Edge.interactionWidth` model field is refused.
  The Svelte `Edge` shape (`packages/svelte/src/lib/types/edges.ts:19`,
  the `EdgeBase & { ... }` intersection at lines 22-40) declares
  `label`, `labelStyle`, `style`, `class` (`.../edges.ts:26`),
  `focusable`, `ariaRole` and `domAttributes`, with no direct
  `interactionWidth` member. `interactionWidth` is already counted
  once as `EdgeBase.interactionWidth`
  (`packages/system/src/types/edges.ts:42`) from the system shape it
  is inherited through, so a Svelte-prefixed duplicate would
  double-count one observable. The genuinely Svelte-only `class`
  name is applied (previous item).
- Three syntactic over-derivations are not added to the inventory;
  the guard derivation was narrowed from the sources instead.
  (a) The payload shapes declared next to the instance contract
  (`packages/react/src/types/instance.ts:5` and
  `packages/react/src/types/instance.ts:11`, whose members are
  `nodes`, `edges`, `viewport`) are not instance methods; the
  instance family is the exported `*Instance` shape
  (`packages/react/src/types/instance.ts:251`) plus the Svelte hook
  return. (b) Derived shapes that reuse node/edge fields by
  `Omit`/`Pick` (the default-edge-options, fit-view options/params
  and internal-node shapes in `packages/system/src/types/`) declare
  no new document field; the document bases are the shapes the
  framework node/edge shapes extend. (c) The Background dot/line
  pattern helper shapes
  (`packages/react/src/additional-components/Background/Patterns.tsx:5`
  and `packages/react/src/additional-components/Background/Patterns.tsx:22`)
  are declared inside the pattern implementation file, not in a
  plugin `types` module, and their components are not on the public
  surface; they are internal rendering helpers of `Background`, whose
  own props are counted.
