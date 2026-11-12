# Vue diagram port — P1

Scope: `feat/diagram-vue`, based on the Svelte scene host. Changes remain in
this worktree. No commit or publication is part of this port.

## Inventory

Paths in the first column are relative to `packages/components-svelte/src/lib`
unless another package is named. Status describes the initial Vue checkout.

| Svelte source | Initial Vue status | Result |
| --- | --- | --- |
| `DiagramCard.svelte` | missing | template SFC, select/diagnostic events, refusal state |
| `DiagramCardHeader.svelte` | missing | internal template SFC, same icon/header/toggle DOM |
| `DiagramZone.svelte` | missing | template SFC, collapsed/expanded/refused states, default slot |
| `DiagramZoneHeader.svelte` | missing | internal template SFC using the card header |
| `DiagramSceneFigure.svelte` | missing | template SFC, shared layout, camera, folding and transitions |
| `diagram-icons/DiagramIcon.svelte` | missing | template SFC behind the icons subpath |
| `diagram-icons/registry.ts` | missing | shared registry, compatibility exports in both frameworks |
| `diagram-render/renderCardSvg.ts` | missing | shared pure helper, Vue/Svelte subpath exports |
| `diagram-render/renderZoneSvg.ts` | missing | shared pure helper, Vue/Svelte subpath exports |
| `diagramCardModel.ts` | missing | moved to `diagram-canvas/src/presentation` |
| `diagramSceneModel.ts` | missing | moved to `diagram-canvas/src/presentation` |
| `GraphLegend.svelte` | partial | SFC; restores dash arrays, edge dash type and full swatch viewBox |
| `ForceGraph.svelte` | partial | SFC; shared processing layout, geometry and shape helpers |
| `ChordDiagram.svelte` | present | existing Vue component; public prop keys match |
| `ArcDiagramChart.svelte` | present | existing Vue component; public prop keys match |
| `DependencyWheelChart.svelte` | present | existing Vue component; public prop keys match |
| `SankeyChart.svelte` | present | existing Vue component; public prop keys match |
| `TreegraphChart.svelte` | present | existing Vue component; public prop keys match |
| `TreemapChart.svelte` | present | existing Vue component; public prop keys match |
| `DecompositionTreeChart.svelte` | present | existing Vue component; public prop keys match |
| `FlamegraphChart.svelte` | present | existing Vue component; public prop keys match |
| `StreamgraphChart.svelte` | present | existing Vue component; public prop keys match |
| `OrganizationChart.svelte`, `PackedBubblesChart.svelte`, `SunburstChart.svelte` | present | existing Vue graph/hierarchy components |
| `packages/graph/src/renderer.ts` | missing binding | `GraphCanvas.vue` and `useGraphEngine()`; no Svelte WebGL binding exists in this checkout |
| `packages/elements/src/element/dom/bpmn-canvas-element.svelte` | missing binding | `BpmnCanvas.vue` accepts the same `envelope`/`hostConfig`; shared validation, F1 serialization and canvas mount |

The WebGL renderer was an explicit draw surface. The added graph-package
adapter owns dirty-frame scheduling; Vue owns no continuous render loop.

## Decisions

1. Keep the pure models, glyph registry and SVG renderers in separate
   `@sentropic/diagram-canvas` subpaths. Existing Svelte imports remain valid.
   Neither component barrel resolves the diagram icon registry.
2. Keep the existing per-module TypeScript package layout. Use the already
   installed `vue-tsc` for template checking/declarations and the official
   SFC compiler for JavaScript. Copy SFC styles into the existing `styles.css`.
3. Use Vue's runtime-matched compiler for classic output. Pin the official
   `@vue/compiler-sfc` 3.6 RC for Vapor compilation and the opt-in `/vapor`
   entry. The RC compiler is development tooling; it is absent from runtime
   imports. `/vapor` requires a Vue 3.6 runtime with Vapor support. Existing
   components outside this port retain their current implementation.
4. Keep graph buffers in `markRaw`/`shallowRef`, with an explicit version
   trigger for in-place buffer updates. Watch only small selection, hover,
   viewport and filter refs. Batch their pushes in the graph engine's next
   frame; viewport changes do not rebuild graph or style buffers.
5. Reuse the committed FR/EN card corpus and collapsed/expanded zone corpus.
   Compare Vue and Svelte DOM trees, classes, attributes, ARIA, diagnostics
   and events in jsdom. Do not invoke the corpora's external reference readers.
6. Keep BPMN's validation-before-engine-load rule and its envelope API.
   Extract its framework-neutral preparation/mount code so both bindings
   use it. Abort pending mounts on replacement/unmount, and dispose on a
   readiness failure. No canvas library or palette is added.

Two independent design reviews examined packaging/parity and engine lifecycle.
Their findings agreed on the GraphLegend viewBox/dash defects, ForceGraph's
duplicated old physics, absence of a Svelte WebGL binding, and the need for
an actual Vapor compiler. Those findings are addressed above.

## Public use

Classic diagram components are exported from `@sentropic/design-system-vue`; the
ported diagram components also have an opt-in `@sentropic/design-system-vue/vapor`
entry. Load `@sentropic/design-system-vue/styles.css` and a DS theme in either
mode. Icons stay at `/diagram-icons` or `/vapor/diagram-icons`, and pure SVG
renderers at `/diagram-render`. The optional BPMN binding is exported from
`/bpmn` or `/vapor/bpmn`, keeping its optional engine types out of the main entry.

Vue events use `@select`, `@diagnostic`, `@toggle`, `@fold-change`, `@layout`,
`@camera-change`, `@open-entity`, `@edge-hover`, `@node-hover` and
`@merge-complete`, preserving the Svelte payloads. Scene instances expose
`setZoom`, `zoomIn`, `zoomOut`, `fitToFrame` and `getCamera`. BPMN instances
expose `state`, `diagnostics` and `ready` and emit no intent events.

`GraphCanvas` takes raw `graph` buffers, theme-resolved `styles`, `label`,
optional engine `options`, and small `selection`, `hover`, `viewport` and
`filters` inputs. `filters` is an optional allowlist of node ids. Increment
`version` (or call the exposed `invalidateGraph`) after in-place buffer
changes; replace small intent arrays to signal changes. Renderer creation
options are initial mount inputs. The wrapper never invents a colour or size.

BPMN uses the optional `@sentropic/design-system-elements@0.2.0` peer; install
that existing runtime in applications that use `BpmnCanvas`. It is already
available in this monorepo. Other Vue components require no BPMN engine.

## Verification and P2 reuse

The Vue suite includes full DOM/ARIA corpus comparison, classic/Vapor compiler
checks, scene camera/fold cases, raw graph data and frame scheduling guards,
and BPMN lifecycle cases. Svelte's focused diagram/scene/ForceGraph suites
verify that the compatibility exports retain behavior. No browser raster or
WebGL pixel result is claimed by these jsdom checks.

A Preact + Signals P2 port can reuse the pure diagram models, registry,
SVG renderers, force-graph presentation/processing, dirty-frame graph engine,
BPMN envelope preparation/mount, theme tokens and parity fixtures. It needs
only its framework templates and signal/lifecycle adapters, plus its own
DOM/ARIA and lifecycle witnesses. No Preact implementation is included here.

The component index promotes card/zone Vue parity and records the new scene and
WebGL exports in its barrel inventory. The existing editorial
exclusion of the BPMN catalogue entry is preserved; no missing bilingual
copy is fabricated. Contract `partial` describes callback/measurer losses
in JSON extraction, not an incomplete Vue component.

## Verification results

- Vue: 1,728 tests across 106 files; includes 134 DOM/ARIA/compiler cases,
  three SSR witnesses and eight graph/BPMN lifecycle cases. All pass.
- All 11 new SFCs compile with the runtime-matched classic compiler and the
  official 3.6 RC Vapor compiler; both output entries build.
- Vue `check` and `build`: pass.
- Svelte focused diagram/scene/ForceGraph/SVG regression: 180 tests pass;
  both Svelte checks report zero errors (26 accessibility warnings in the
  broader package; parity check has zero warnings).
- Diagram canvas: 356 pass, one dense-layout performance benchmark skipped.
  The no-DOM guard and TypeScript checks pass.
- Elements: 15 runtime/F1 tests and both checks pass.
- Component-index resolver/extractor regression: 13 tests pass.
- No browser raster, actual GPU pixels or Vapor runtime execution is claimed.

- Component-index generation and `index:check`: pass.
- `notices:generate`: pass; the default Vue runtime closure stays unchanged.
- `git diff --check`: pass. Package-lock workspace manifests are synchronized.

## Changed files

```text
package-lock.json
packages/component-index/contract-baseline.json
packages/component-index/generated/component-contract-index.json
packages/component-index/generated/component-index.json
packages/component-index/generated/contracts/data-image.json
packages/component-index/generated/contracts/data-table.json
packages/component-index/generated/contracts/dataviz-data-image.json
packages/component-index/generated/contracts/diagram-card.json
packages/component-index/generated/contracts/diagram-zone.json
packages/component-index/generated/contracts/embed.json
packages/component-index/generated/contracts/force-graph.json
packages/component-index/generated/contracts/labelled-icon-button.json
packages/component-index/generated/contracts/time-series-line-chart.json
packages/component-index/generated/contracts/typography.json
packages/component-index/generated/contracts/url-sync.json
packages/component-index/generated/entries/design-tokens.json
packages/component-index/generated/entries/diagram-card.json
packages/component-index/generated/entries/diagram-zone.json
packages/component-index/generated/entries/force-graph.json
packages/component-index/parity-baseline.json
packages/component-index/src/generator/barrels.ts
packages/component-index/src/generator/contracts/resolve.ts
packages/component-index/src/generator/contracts/vue.ts
packages/component-index/tests/contracts/barrels.test.ts
packages/component-index/tests/contracts/fixtures/vue-fixture.d.ts
packages/component-index/tests/contracts/resolve.test.ts
packages/component-index/tests/contracts/vue.test.ts
packages/components-svelte/src/lib/ForceGraph.svelte
packages/components-svelte/src/lib/diagram-card-parity/diagram-card-parity.test.ts
packages/components-svelte/src/lib/diagram-icons/registry.ts
packages/components-svelte/src/lib/diagram-render/renderCardSvg.ts
packages/components-svelte/src/lib/diagram-render/renderZoneSvg.ts
packages/components-svelte/src/lib/diagram-zone-parity/diagram-zone-parity.test.ts
packages/components-svelte/src/lib/diagramCardModel.ts
packages/components-svelte/src/lib/diagramSceneModel.ts
packages/components-vue/LICENSE.THIRD-PARTY.md
packages/components-vue/package.json
packages/components-vue/scripts/build-sfc.mjs
packages/components-vue/scripts/copy-styles.mjs
packages/components-vue/src/BpmnCanvas.test.ts
packages/components-vue/src/BpmnCanvas.vue
packages/components-vue/src/DiagramCard.vue
packages/components-vue/src/DiagramCardHeader.vue
packages/components-vue/src/DiagramControlGlyph.vue
packages/components-vue/src/DiagramSceneFigure.types.ts
packages/components-vue/src/DiagramSceneFigure.vue
packages/components-vue/src/DiagramZone.vue
packages/components-vue/src/DiagramZoneHeader.vue
packages/components-vue/src/ForceGraph.ts
packages/components-vue/src/ForceGraph.types.ts
packages/components-vue/src/ForceGraph.vue
packages/components-vue/src/GraphCanvas.vue
packages/components-vue/src/GraphLegend.ts
packages/components-vue/src/GraphLegend.vue
packages/components-vue/src/bpmn/index.ts
packages/components-vue/src/diagram-icons/DiagramIcon.vue
packages/components-vue/src/diagram-icons/index.ts
packages/components-vue/src/diagram-icons/registry.ts
packages/components-vue/src/diagram-parity.test.ts
packages/components-vue/src/diagram-render/index.ts
packages/components-vue/src/diagram-ssr.test.ts
packages/components-vue/src/diagramCardModel.ts
packages/components-vue/src/diagramSceneModel.ts
packages/components-vue/src/index.ts
packages/components-vue/src/useGraphEngine.test.ts
packages/components-vue/src/useGraphEngine.ts
packages/components-vue/tsconfig.json
packages/components-vue/vite.config.ts
packages/diagram-canvas/package.json
packages/diagram-canvas/src/presentation/diagramCardModel.ts
packages/diagram-canvas/src/presentation/diagramSceneModel.ts
packages/diagram-canvas/src/presentation/index.ts
packages/diagram-canvas/src/presentation/registry.ts
packages/diagram-canvas/src/presentation/renderCardSvg.ts
packages/diagram-canvas/src/presentation/renderZoneSvg.ts
packages/elements/package.json
packages/elements/src/element/bpmn-mount.ts
packages/elements/src/element/bpmn-types.ts
packages/elements/src/element/bpmn.ts
packages/elements/src/element/dom/element-runtime.svelte.ts
packages/elements/src/element/dom/engines/bpmn-canvas.ts
packages/elements/src/element/dom/validator.ts
packages/elements/src/element/validator.ts
packages/elements/src/types/json.d.ts
packages/graph/package.json
packages/graph/src/engine.ts
packages/graph/src/presentation.ts
packages/graph/tsup.config.ts
packages/themes/css/entropic.css
packages/themes/css/forge.css
packages/themes/css/sent-tech.css
packages/tokens/src/component.ts
spec/SPEC_EVOL_DIAGRAM_VUE.md
```
