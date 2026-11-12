# @sentropic/design-system-elements

JSON-render standard, lots L2/L6: thin Svelte custom-element wrappers over the
catalogue components of the sentropic design system. One ESM browser bundle
registers three elements (lot L6 imposes the Focus renderer defaults
F-R0–F-R7 on the dossier engine chunk; see below):

| Element | Catalogue component | Engine chunk (§6.6) |
| --- | --- | --- |
| `<st-bar-chart>` | `BarChart` | none — in the core chunk |
| `<st-bpmn-canvas>` | `BpmnCanvas` | `chunks/bpmn-canvas-*.js` (lazy, first mount) |
| `<st-decision-dossier>` | `DecisionDossier` | `chunks/focus-renderer-*.js` (lazy, first mount) |

Each wrapper: shadow DOM `open`, envelope validation through the L1
validator, the §4.5 error panel on refusal (never a blank element), props
mapping to the underlying component, and component callbacks translated to
§4.6 `st-intent` events. Every component in the bundle is compiled with
`css: "injected"` (§6.2 known risk: styles ship inside the chunk).

## Using the elements

```html
<script type="module" src="/…/elements.js"></script>

<!-- envelope as a child data island -->
<st-bar-chart id="chart">
  <script type="application/json">{ "root": { "component": "BarChart", "id": "q1", "label": "Revenue (M€)", "data": [ { "label": "Q1", "value": 12 } ] } }</script>
</st-bar-chart>

<!-- or the envelope as a JS property -->
<script type="module">
  const chart = document.getElementById("chart");
  chart.envelope = { root: { component: "BarChart", id: "q1", data: [ { "label": "Q1", "value": 12 } ] } };
</script>
```

### Wrapper API

| Member | Channel | Meaning |
| --- | --- | --- |
| `envelope` | JS property, or the first child `<script type="application/json">` (re-read through a MutationObserver when the island is replaced) | The render envelope. No attribute ever carries data (§6.2). A malformed island reaches the validator as raw text and is refused with a diagnostic — the panel shows it. |
| `hostConfig` | JS property, or the page-level `<script type="application/json" id="st-host-config">` island | Host configuration (§6.5): `{ theme?, colorScheme?, locale?, assetBase?, bpmn?: { watermark?: { hidden?, license? } } }`. The theme id is never taken from the envelope. |
| `diagramResolver` | JS property on `<st-decision-dossier>`, or `hostConfig.diagramResolver` in the JS object channel | Resolves reference diagrams. Functions are excluded from the envelope and the JSON host-config island. The element property takes precedence. |
| `state` | getter | `"idle" \| "rendering" \| "rendered" \| "refused"` |
| `diagnostics` | getter | The validator's diagnostics of the last ingest (`{ code, path, message, severity, … }[]`). |
| `ready` | getter | A `Promise<void>` that settles (never rejects) the first time the element reaches `rendered` or `refused`. |

Property semantics: an `envelope` (or `hostConfig`) assigned on the element
BEFORE the custom element is defined is picked up at definition time; an
assignment after that re-renders reactively. An invalid envelope never
throws — the element enters `refused` and lists the diagnostics in the
error panel.

### `st-intent` (§4.6)

Component callbacks never escape the element (the envelope is data);
each wrapper maps them to one composed, bubbling `CustomEvent("st-intent")`
on the host element:

```ts
interface IntentDetail {
  event: "intent";
  name: "select" | "choose-option";
  target: string;             // the catalogue key / option id
  context: Record<string, unknown>;
}
```

## Callback → intent mapping (AC-L2)

### `st-bar-chart` (`BarChart`)

| Component callback | Element behaviour |
| --- | --- |
| `onSelect(key)` | `st-intent` `select`, `target = key` |
| `onSelectKey(key)` — keyboard activation | `st-intent` `select`, `target = key`; `null` key (no selected bar) dispatches nothing |
| `onHoverKeyChange(key)` | local state only — no intent (hover is not an §4.6 intent) |

### `st-decision-dossier` (`DecisionDossier`)

| Interaction | Element behaviour |
| --- | --- |
| option card click / keyboard activation (when enabled) | `st-intent` `choose-option`, `target = <option id>`; an option gated inert by an `interactions` entry `{ name: "choose-option", targetRef, enabled: false }` renders as an inert card and dispatches nothing |
| card click again / another card (single-selection rule) | local renderer state only: reselecting clears the card with no emission, choosing another card moves the selection with one emission; the envelope and the document are never written back |
| expand control on a long card | toggles the folded argument, emits nothing, never selects |

### Dossier renderer defaults (F-R0–F-R7, lot L6)

The `focus-renderer` chunk (`src/element/dom/engines/focus-renderer.ts` plus
its stylesheet `dossier-styles.ts`) imposes the §11.2 defaults; the author
cannot work around them:

- F-R0: no author layout property exists anywhere — a `layout` hint at
  `root` level is refused by the catalogue structure and one inside the
  document by the embedded focus schema, both with `schema-violation`
  (§4.5 panel, never a partial dossier).
- F-R1: the whole option card is the single selection control (one node
  carries both `data-option-card` and `data-option-id`).
- F-R2: card outlines are `1px solid var(--st-…)`; every colour resolves to
  a `--st-*` token and no rule exceeds 1 px (static scan in
  `tests/focus-renderer-l6.test.ts`, computed scan in
  `tests/browser/chromium-suite.mjs`).
- F-R3: selection is a light local state (1 px outline change and/or token
  tint, no layout shift); F-R7: nothing is ever preselected, not even the
  recommended option.
- F-R4: an argument over 300 characters (the option `body`, else its
  label-plus-consequence text) renders collapsed with a labelled expand
  control; shorter arguments render fully with no fold control.
- F-R5: the renderer alone picks `list` (any long option, or one or two
  options) or `grid` (three or more short options, capped at two columns),
  exposed as `data-st-layout` (`decideOptionSetLayout`).
- F-R6: annotations render as display state only — no per-option control
  besides the card (and the fold control on long cards).
- F-R7: the recommended option carries one discreet badge; an unmatched
  `recommendedAnswer` renders as question context text, never as a
  preselection.

Content parity with the owner `renderHtml` is witnessed on the
presentation-valid fixtures (`tests/focus-renderer-l6.test.ts`); inputs the
owner presentation gate refuses (long bodies, legacy documents) still render
their sections, ids and outcome from the input. Inline diagrams keep their
preformatted source fallback.

### Diagram references (elements 0.3.0 delivery lot)

Reference-mode producers use envelope `contract: "1.1"`. A diagram section
contains `sourceRef`, `renderComponent` and a required non-blank `alt`, with
no `source`, `syntax` or `scene`. Prose and question sections can also carry
`inputs: [{ ref, kind, label? }]` and `completionCriterion`; these display as
text. See [acceptance and integration status](docs/diagram-reference-acceptance.md).

```js
// Adapt a host export without a DS dependency on its storage client.
const exportsByRef = new Map([
  ["engram:roadmap", {
    component: "GanttChart",
    props: { label: "Roadmap", data: [{ task: "Prototype", start: 0, end: 4 }] },
  }],
]);
const dossier = document.querySelector("st-decision-dossier");
dossier.diagramResolver = (sourceRef, context) => {
  // context: diagramId, targetRef, documentRef, renderComponent, alt.
  return exportsByRef.get(sourceRef) ?? null;
};
// Equivalent JS-only seam:
// dossier.hostConfig = { diagramResolver: dossier.diagramResolver };
```

The host receives each opaque reference verbatim, once per diagram per
render pass. It may return `{ component, props }`, an envelope root
`{ component, id, ...props }`, or a promise of either. The DS performs no
fetch, scheme dispatch, caching, retries or resolver timeouts. `ready`
settles while diagrams are still pending; observe `data-diagram-state` on
the figure for per-diagram progress. Replacing the resolver retries only
pending figures. Selection and folding add no resolver calls. Re-ingest or
destroy discards earlier async results and aborts a pending BPMN mount.

The private allow-list contains `GanttChart` and `BpmnCanvas`. Gantt accepts
`data`, `label`, optional finite `width`, `height`, `marker`, and up to 500
tasks `{ task, start, end, category? }`; task names must be non-blank and
times finite. `class` and unknown props refuse. BPMN accepts `document`
with `$type: "bpmn:Definitions"` and delegates F1 validation/serialization
and mounting to the dynamically loaded BPMN engine. `DiagramCanvas` and
`RoadmapChart` are reserved; other ids are unsupported. These ids never
call the resolver. The catalogue still has three entries.

Returns are JSON-round-tripped before mounting, with a 1,048,576-byte
inclusive UTF-8 budget for normalized `props`. Functions, cycles, DOM
nodes, invalid props and mismatched components produce a named placeholder
and one `diagram-*` host warning at the section pointer. Missing or failed
resolution also degrades to a placeholder; the dossier remains rendered.
These warnings do not extend the closed envelope diagnostic codes.

Every state retains the `alt` figcaption and visible reference/component.
Placeholders and BPMN containers have a named `img` role. Gantt provides an
SVG title plus one text row per task. A polite live region announces
changes without moving focus. Payload strings enter as text nodes; print
keeps the resolved SVG or the reference placeholder. Local acceptance uses
jsdom and stubbed BPMN engines; live canvas pixels are outside this gate.

### `st-bpmn-canvas` (`BpmnCanvas`)

The catalogue contract records no interactive callbacks for this component;
the element emits no intent. The canvas renders the envelope's BPMN document
(via the lazy `@sentropic/bpmn-canvas` engine); `assetBase` for its assets
comes from `hostConfig` (§6.5), never from a `data:` URI; the watermark
follows §13 (passed only in the `hostConfig` form the W4 guard accepts).

## Theme (§6.3)

The internal root carries `data-st-theme` (from `hostConfig.theme`, default
`sent-tech`) and `data-color-mode`; the theme stylesheet is adopted inside
the shadow root (`sent-tech` in the core chunk, `forge` / `entropic` as lazy
chunks). `--st-*` custom properties inherit through the shadow boundary;
the wrappers define no font of their own (the content inherits the page's).

## Build, sizes, integrity

`npm run build` runs the Node build and then the browser bundle, so
`dist/browser/` and `dist/browser/sri.json` are produced together
(`npm run build:browser` re-runs the bundle step alone). `sri.json` lists
every file with raw / gzip / brotli sizes and a sha384 integrity hash
(`sri.json` never lists itself). The §6.6 core budget — the entry closure
that renders `<st-bar-chart>` — is 53,920 B gzip of the 153,600 B budget
(53,919 B at L7a, +1 B rebuild variance; 23 files pinned by `sri.json`).
The L6 `focus` chunk is 21,174 B gzip (19,073 B at L7a, +2,101 B for the
stylesheet, fold/layout and selection logic); core + focus raw bytes stay
far under the §8.3 2 MiB `ui://` resource budget.
The bundle is eval-free (§6.4: no `eval`, no `new Function` in any chunk —
enforced by `scripts/elements-browser-artifacts.test.mjs`), works mounted
under any subpath (no document-anchored preload hints), and needs no
per-chunk CSS assets.

## CDN (§7)

The published tarball is served from the CDN base with the exact version
pinned — never a range, never `latest` (the version segment is bumped with
each release):

```
https://cdn.jsdelivr.net/npm/@sentropic/design-system-elements@0.2.0/dist/browser/
```

Load the entry with its integrity hash (the sha384 from
`dist/browser/sri.json`) and `crossorigin="anonymous"`:

```html
<script type="module"
  src="https://cdn.jsdelivr.net/npm/@sentropic/design-system-elements@0.2.0/dist/browser/elements.js"
  integrity="sha384-<hash from dist/browser/sri.json>"
  crossorigin="anonymous"></script>
```

Lazy chunks resolve module-relative to that base, so the whole
`dist/browser/` tree must be served, not the entry alone. SRI limit: the
entry hash above is browser-enforced; the chunk hashes in `sri.json` are the
audit pin a host or reviewer recomputes — `scripts/elements-publish-tarball.test.mjs`
is that recomputation against the tarball bytes. For the h2a consumer the
CDN is an optimisation; the inlined module remains the fallback.

Further reading:

- `docs/json-render-comparison.md` — the §6.2 comparison against
  `@json-render` (not adopted).
- `tests/browser/chromium-suite.mjs` — the offline Chromium suite: CSP rows,
  P-DATA parity, computed-style parity, lazy-chunk boundary.
- `catalog.json` / `envelope.json` — the L1 catalogue and envelope schemas
  the validator runs (A2UI v0.9.1).
