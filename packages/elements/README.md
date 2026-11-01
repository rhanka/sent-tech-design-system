# @sentropic/design-system-elements

JSON-render standard, lot L2: thin Svelte custom-element wrappers over the
catalogue components of the sentropic design system. One ESM browser bundle
registers three elements:

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
| option card click / keyboard activation (when enabled) | `st-intent` `choose-option`, `target = <option id>`; an option gated inert by an `interactions` entry `{ name: "choose-option", targetRef, enabled: false }` dispatches nothing |

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
that renders `<st-bar-chart>` — is 53,916 B gzip of the 153,600 B budget
(re-measured at 0.1.0; 23 files pinned by `sri.json`).
The bundle is eval-free (§6.4: no `eval`, no `new Function` in any chunk —
enforced by `scripts/elements-browser-artifacts.test.mjs`), works mounted
under any subpath (no document-anchored preload hints), and needs no
per-chunk CSS assets.

## CDN (§7)

The published tarball is served from the CDN base with the exact version
pinned — never a range, never `latest` (the version segment is bumped with
each release):

```
https://cdn.jsdelivr.net/npm/@sentropic/design-system-elements@0.1.0/dist/browser/
```

Load the entry with its integrity hash (the sha384 from
`dist/browser/sri.json`) and `crossorigin="anonymous"`:

```html
<script type="module"
  src="https://cdn.jsdelivr.net/npm/@sentropic/design-system-elements@0.1.0/dist/browser/elements.js"
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
