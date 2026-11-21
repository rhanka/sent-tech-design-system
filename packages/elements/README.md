# @sentropic/design-system-elements

JSON-render standard, lots L2/L6: thin Svelte custom-element wrappers over the
catalogue components of the sentropic design system. One ESM browser bundle
registers four elements (lot L6 imposes the Focus renderer defaults
F-R0–F-R7 on the dossier engine chunk; see below):

| Element | Catalogue component | Engine chunk (§6.6) |
| --- | --- | --- |
| `<st-bar-chart>` | `BarChart` | none — in the core chunk |
| `<st-bpmn-canvas>` | `BpmnCanvas` | `chunks/bpmn-canvas-*.js` validates F1, then `chunks/bpmn-mount-*.js` loads the view |
| `<st-decision-dossier>` | `DecisionDossier` | `chunks/focus-renderer-*.js` (lazy, first mount) |
| `<st-time-series-chart>` | `TimeSeriesChart` | none — in the core chunk |

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

### `st-time-series-chart` (`TimeSeriesChart`)

Select `TimeSeriesChart` when an MCP result reports numeric measurements over
time. Use `BarChart` for categorical measurements. Pass the data envelope
to the design-system element, which draws each series with `LineChart`.
The packaged [rendering skill](skill/SKILL.md) guides MCP tool selection.

Send a chart label and at least one series with a unique `id`, a label and
its `data` array. Each point carries `x` as whole UTC Unix epoch
milliseconds and `y` as a finite number. Timestamps must increase strictly
within each series. A timestamp may recur in different series. Normalize
source dates with a known timezone to milliseconds before calling the
renderer. The chart uses one time domain across all series and displays UTC
ISO timestamps with millisecond precision. The common `referenceLines`,
`bands` and `goalLine` use value units, with whole UTC epoch milliseconds
for any reference line on the x axis.

The element exposes the observations in an accessible table with columns for
time, series label, series ID and value. Rows sort by ascending time, with
input series order breaking ties. The series ID identifies each series even
when labels collide.
For the transcript, validate the envelope against the pinned catalogue, then
call `formatTimeSeriesMarkdown(envelope.root)` with the validated props.
It formats the same rows, escapes Markdown delimiters and fails with a
`RangeError` if the complete table exceeds 4096 UTF-8 bytes.

The package ships three temporal fixtures under `@sentropic/design-system-elements/fixtures/`.
They cover [one series](fixtures/time-series-single.json),
[sparse aligned series](fixtures/time-series-multi.json) and
[thresholds and bands](fixtures/time-series-thresholds.json).

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
their sections, ids and outcome from the input. Diagrams render as the
fenced fallback until a diagram renderer exists.

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
`dist/browser/`, its `sri.json` and `dist/shells/` are produced together.
`npm run build:browser` re-runs those builds. The browser SRI manifest
lists every payload file with raw, gzip and brotli sizes and a SHA-384
integrity hash. The CDN entry closure still has a 153,600-byte gzip budget.
The bundle is eval-free (§6.4: no `eval`, no `new Function` in any chunk —
enforced by `scripts/elements-browser-artifacts.test.mjs`), works mounted
under any subpath (no document-anchored preload hints), and needs no
per-chunk CSS assets.

The packaged `dist/shells/manifest.json` (exported as `./shells/manifest.json`)
lists per-component capabilities, complete HTML sizes, and SHA-256
fingerprints for the shell files, module entries and input schemas. The
limits are strictly below 960 KiB raw and at most 150 KiB gzip (fflate
level 6, mtime 0). Consumers can pin the standalone temporal schema for
FA-H9 and read the qualified module and shell files relative to the
manifest for CK-H1a. Provide the envelope through the element property
or insert a child JSON island at
`<!-- st-envelope -->` in the HTML template. Escape every `<` in the island
JSON as `\u003c` when embedding it in HTML. Keep the inline module bytes
for the shell's CSP hash, and measure the final HTML again if the host adds
data or protocol code.

A `partial` BPMN entry records the measured complete candidate and requests
the text fallback with a URL supplied by the host when available. The
chunked browser entry still supports the full canvas. See the
[EZ-1 build evidence](docs/ez-1-evidence.md) for measurements and fixtures.

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
