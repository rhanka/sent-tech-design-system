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

## 2. Method: mechanical enumeration and the completeness guard

"100 %" is not asserted from reading. It is guarded mechanically:

```bash
node tools/re-xyflow/enumerate.mjs   # regenerates the inventory
node tools/re-xyflow/verify.mjs      # completeness guard, exit 1 on any gap
```

`enumerate.mjs` (Node, no dependencies, no network) extracts, from source only:

- the transitive public exports of each package entry (`export *` /
  `export {…} from` closure from `packages/system/src/index.ts`,
  `packages/react/src/index.ts`, `packages/svelte/src/lib/index.ts`);
- members of `ReactFlowProps` / `SvelteFlowProps` (plus the Svelte
  `NodeEvents`/`EdgeEvents`/`PaneEvents` intersections), sub-component prop
  types (Background, Controls, MiniMap, NodeToolbar, NodeResizer,
  EdgeToolbar, Panel, Handle), instance helpers (`GeneralHelpers`,
  `ViewportHelperFunctions`), and `ReactFlowStore` fields;
- change variants (`packages/system/src/types/changes.ts`), model fields
  (`NodeBase`, `EdgeBase`), enum members, edge path functions
  (`packages/system/src/utils/edges/*.ts`) and the five built-in edge types;
- 26 interaction behaviours, each anchored to a verified location in the
  engine sources (`xypanzoom`, `xydrag`, `xyhandle`, `xyresizer`, `xyminimap`);
- the examples (`examples/react/src/examples`, `examples/svelte/src/routes`)
  as acceptance scenarios.

Observed guard output at delivery (2026-10-15, this worktree):

```text
enumerated=1062 entries=1062
byFamily {"api-system":238,"api-react":121,"api-svelte":65,"props-flow":237,"props-components":70,"hooks":34,"instance":36,"store":85,"changes":12,"model":60,"edge-geometry":10,"interaction":26,"examples":68}
byStatus {"missing":1001,"partial":61}
GUARD PASS: 100% of enumerated elements have an inventory entry; ids unique; sources and proofs resolve.
```

Counting convention (stated with every figure in this spec): one entry per
enumerated observable per family. Families overlap by design (a hook is one
entry in `api-react` as an export and one in `hooks` as a hook contract), so
1062 is a sum over families, not a count of unique names. Every inventory
entry in `docs/re/xyflow-inventory.json` carries: stable `id`, `family`,
`source` (path:line in the xyflow tree), `behaviour` (observable
input → output / interaction → effect), `acceptance` (differential test
scenario), `target`, `status` with `proof` (path:line in the sentropic
corpus), and `priority` (P0/P1/P2).

Status semantics are strict:

- `covered` — the same observable contract is already implemented and can be
  proven by the differential harness. Count today: **0**. No xyflow entry is
  iso today; claiming otherwise would require the harness of §6, which is
  lot L0 and does not exist yet.
- `partial` — an underlying capability exists under a different contract
  (e.g. camera maths exists, the xyflow viewport API does not). Count: **61**.
- `missing` — no equivalent found by mechanical search of
  `packages/graph/src`, `packages/diagram-core/src`, `packages/diagram-canvas/src`
  at generation time. Count: **1001**.

## 3. Inventory summary by family

| Family | Entries | covered | partial | missing | Main target |
|---|---:|---:|---:|---:|---|
| api-system | 238 | 0 | 28 | 210 | graph / diagram-canvas |
| api-react | 121 | 0 | 7 | 114 | composant DS |
| api-svelte | 65 | 0 | 0 | 65 | composant DS |
| props-flow | 237 | 0 | 10 | 227 | composant DS |
| props-components | 70 | 0 | 0 | 70 | composant DS |
| hooks | 34 | 0 | 0 | 34 | composant DS |
| instance | 36 | 0 | 2 | 34 | composant DS / diagram-canvas |
| store | 85 | 0 | 7 | 78 | nouveau module |
| changes | 12 | 0 | 2 | 10 | diagram-core |
| model | 60 | 0 | 0 | 60 | diagram-core |
| edge-geometry | 10 | 0 | 1 | 9 | graph |
| interaction | 26 | 0 | 4 | 22 | nouveau module |
| examples | 68 | 0 | 0 | 68 | composant DS |
| **Total** | **1062** | **0** | **61** | **1001** | — |

By target: `composant DS` 731, `diagram-canvas` 111, `nouveau module` 111,
`diagram-core` 69, `graph` 40. By priority: P0 144, P1 850, P2 68.
185 entries carry a documented default extracted from JSDoc `@default`
(e.g. bezier `curvature` 0.25 in
`.ds-scrap/re-sources/xyflow/packages/system/src/utils/edges/bezier-edge.ts`);
defaults are part of each prop entry's `behaviour`, and §7 lists the
load-bearing ones.

What the 61 `partial` entries are (full list is queryable in the JSON):
viewport/fit/center helpers and `getNodesBounds` (camera and rect algebra
exist), `getStraightPath`/`StraightEdge` (straight polylines exist, the SVG
path contract does not), `NodeChange`/`EdgeChange` + `apply*Changes`
(transactional commands exist, the change-array protocol does not), and the
`onMove*` family (transform exists, the gesture engine does not).

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

Same inputs, both implementations, compared outputs:

- **Fixtures**: serialised flow documents (nodes/edges/viewport/options),
  seeded from the 68 example scenarios and from minimal per-family fixtures.
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
  order), viewport transform (tolerance 1e-6), edge path strings (exact for
  the pure path functions; geometry tolerance 0.5 px for rendered output),
  and — only where text/DOM chrome is involved — screenshots with a stated
  pixel-difference threshold. Not compared: internal store shapes, d3
  transition internals, frame timing, CSS class names (except the documented
  color-mode class contract).
- **Gate mechanics**: an entry moves to `covered` only when its harness
  scenario passes on both sides. `verify.mjs` keeps guarding enumeration
  completeness; a second guard (to be built in L0) will assert that every
  `covered` entry names a passing scenario id. No lot may declare a gate on
  manual testing.

## 7. Load-bearing defaults (extract)

Full defaults live in each inventory entry. The ones that change geometry or
event semantics: `defaultViewport {x:0,y:0,zoom:1}` and
`defaultNodeOrigin [0,0]` (`packages/react/src/container/ReactFlow/init-values.ts`);
bezier curvature 0.25; node/edge built-in types (`input/default/output/group`;
`default/straight/step/smoothstep/simplebezier`,
`packages/react/src/index.ts`); `elevateNodesOnSelect: true`
(`packages/react/src/store/initialState.ts`); error/aria catalogues
(`packages/system/src/constants.ts`, incl. `error001`–`error016` and
`defaultAriaLabelConfig`). Snap grid, zoom extents and thresholds have no
single constant: they are prop-level defaults recorded per entry and must be
read from the JSON, not from this summary.

## 8. Plan (ordered lots, dependencies, gates, cost as judgement)

Costs are judgements (T-shirt + person-week range), not measurements.

| Lot | Covers (inventory) | Depends on | Gate (harness-proven `covered`) | Cost (judgement) |
|---|---|---|---|---|
| L0 Harness & fixtures | 0 entries; enables all gates | — | Reference + candidate runners execute the 68 example fixtures; compared outputs archived | M (2–4 pw) |
| L1 Model & change protocol | model 60, changes 12 | L0 | ≥ 72/1062 (7 %) | M (3–5 pw) |
| L2 Edge geometry & markers | edge-geometry 10 + edge entries in api-* (~30) | L1 | ≥ 100/1062 (9 %) | S–M (2–3 pw) |
| L3 Interaction engine (`flow-interaction`) | interaction 26, store 85 | L1 | ≥ 210/1062 (20 %) | XL (8–12 pw) |
| L4 Viewport, instance, visibility | instance 36 + viewport/fit entries (~40) | L3 | ≥ 250/1062 (24 %) | M (3–4 pw) |
| L5 Flow components + hooks (React, then Svelte) | props-flow 237, hooks 34, component exports | L3, L4 | ≥ 520/1062 (49 %) | XL (8–12 pw) |
| L6 Sub-components | props-components 70 (Controls, MiniMap, Background, Panel, NodeToolbar, NodeResizer, EdgeToolbar, Handle) | L5 | ≥ 590/1062 (56 %) | L (5–8 pw) |
| L7 System utils parity | api-system remainder (~200) | L1, L2 | ≥ 790/1062 (74 %) | M (3–5 pw) |
| L8 Examples, a11y, hardening | examples 68 + remaining P1/P2 | L5, L6, L7 | 1062/1062 (100 %) | L (5–8 pw) |

Total judgement: ~39–61 person-weeks. The critical path is L0 → L1 → L3 →
L5 → L8. Svelte parity inside L5/L6 assumes the contract of §4 holds; if the
Svelte binding needs its own store semantics, L5 splits and the total grows
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
decision recorded before the code is written.

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
- `unknown`: pro/attribution behaviour (`proOptions`, Attribution component)
  licensing expectations for a parity clone — before L6.
- `unknown`: bpmn-js lot's exact reuse point for the `flow-interaction`
  module (sister spec not yet landed) — before L3 API freeze.
- Not verified in this lot: runtime behaviour of any xyflow example (no
  browser was run; examples are enumerated as scenarios, not executed), and
  the sentropic golden/WebGL test lanes (out of scope for a spec lot).
