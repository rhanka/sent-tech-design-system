# EZ-1 build evidence

Build source `a9baae53c70b55e855c2d91a4ca498f3e252c47f`, based on DS
`5dc58e07fb07bfb445664e797a9d5950d56ec708`. Built in the isolated worktree
with Node 22.22.1, npm 11.21.1, Vite 8.3.4, Svelte 5.55.7 and
Puppeteer 25.1.0 with Chromium headless shell build 1243.

## Baseline

On the test-only tree recorded in `d175851f6`, the two validator seams reported
36 failures on the missing component and passed both categorical cases.
The headless suite against the pre-change browser build reported 11
temporal failures. The pinned h2a source `e66d85c34` reported a complete
BPMN HTML shell of 1,232,053 raw bytes and 311,259 gzip bytes in
`packages/h2a/fixtures/ui-render-ac-l3/offline-measurement.v1.json`.
Recompressing its checked-in `BpmnCanvas.js` with fflate 0.8.3, level 6,
mtime 0, yielded 308,064 bytes from 1,222,509 raw bytes. The JS fingerprint
was `c3c5519e966032466a2fce65b1c7fffb753e60e8c851f2f3f410c4158e5133d8`.

## Scoped verification

The worktree supplied explicit temporary, runtime, browser profile and npm
cache directories. These commands ran from the DS worktree.

| Command | Result |
| --- | --- |
| `rtk npm run test --workspace @sentropic/design-system-elements -- tests/time-series-chart.test.ts` | 41 passed on the two validation seams and the Markdown formatter |
| `rtk npm run test --workspace @sentropic/design-system-elements` | 261 passed |
| `rtk npm exec --workspace @sentropic/design-system-svelte -- vitest run src/LineChart.test.ts src/ChartAxisConfig.test.ts src/ChartAccessibility.test.ts src/ChartForecastCluster.test.ts` | 47 passed |
| `rtk npm run build --workspace @sentropic/design-system-elements` | Node, CDN bundle and per-component shells built |
| `rtk npm run check --workspace @sentropic/design-system-elements` | Type checks passed |
| `rtk npm run catalog:check --workspace @sentropic/design-system-elements` | Seven generated files match |
| `rtk node packages/elements/tests/browser/chromium-suite.mjs` | All assertions passed. The three temporal datasets, categorical dataset and dossier rendered in their qualified shells without secondary requests |
| `rtk node --test scripts/elements-browser-artifacts.test.mjs scripts/elements-publish-tarball.test.mjs` | 15 passed, including packed shell byte counts and fingerprints |
| `rtk npm run dist:import-closure -- --workspaces=@sentropic/design-system-elements` | Packed Node imports and public assets passed |

The temporal suite covers closed objects, millisecond precision, ordering,
unique series IDs and the 4096-byte Markdown boundary. Chromium verifies
that the same observations drive the plots and accessible table, that
uneven series align by timestamp, and that thresholds and bands render.

## Complete HTML shell budgets

Complete shells include the module and HTML template. The limit is under
983,040 raw bytes and at most 153,600 gzip bytes, measured with fflate
0.8.3 at level 6 and mtime 0. The CDN entry closure measured 68,381 gzip
bytes at its existing level 9, reported separately in `sri.json`.

| Component | Raw bytes | Gzip bytes | Status | Complete HTML SHA-256 |
| --- | ---: | ---: | --- | --- |
| BarChart | 590773 | 99149 | qualified | `087239228b6eb9a66faa9c99fb0ed7c58b93db401242b7451ff80e378529de3d` |
| BpmnCanvas | 1430205 | 384890 | partial | `0502054a75e4e7114b08c3f24982b86c7689b38fb2a06a05553563dab82bc204` |
| DecisionDossier | 621068 | 111621 | qualified | `9bcaa73541649718fe2590a2da086436647315ea08a883fa1980e6087202a474` |
| TimeSeriesChart | 588919 | 99237 | qualified | `db38cff04edccd2367817648f5f72bc94d0da00b6565dafa4dd2cdeee68eefc1` |

The BPMN candidate still exceeds both limits. Its manifest retains the
text fallback and optional host URL. The chunked CDN entry continues to
load the BPMN semantic engine and canvas view on demand. The generated
manifest records the BPMN candidate measurement. The package ships the
qualified HTML and modules.

## Package handoff

Local `npm pack --workspace @sentropic/design-system-elements --json`
reported version `0.2.0`, filename `sentropic-design-system-elements-0.2.0.tgz`,
and the following integrity, verified against the archive bytes.

```text
sha512-5sZxa0ULD1kF3EHJbzSSGFdVokmlDAVRiPKg4CTqZuLRFvHa//ibykNwgPc46q83cczGJnKX8EpfVKrNusIFOQ==
```

| Artifact or fixture | SHA-256 |
| --- | --- |
| `catalog.json` | `38cf4d1fa2334947081be92f1e8e01e2ad6d63030664dfbfbf57ce64a96ae766` |
| `envelope.json` | `6bf3351ba45c90a0dd3b40a7e7eddf019e72379a4551acc07a89f4436fc6cf2e` |
| `schemas/TimeSeriesChart.v1.json` | `98b9d246237a6533630fd6c8f50bb3b038f9db6190613572cedf07f12a0645fd` |
| `dist/browser/sri.json` | `5f427637eddd7f9552ddd15490bc97cfaf137b0fafa83808ce6c7ae8f9d2d1a9` |
| `dist/shells/manifest.json` | `818ba1938207456c736a996f5b09fb5efbdc4e90a630f66c3f4b275645750bef` |
| `tests/fixtures/time-series-single.json` | `9c2d8a2933d1635978687bc897324610f4bfef9e58f4adfa07939c589e317f58` |
| `tests/fixtures/time-series-multi.json` | `8e3224ec6a1a8ad81666aab1f366fee80e24e82dc383ab7c19e9a0d5f63e4c08` |
| `tests/fixtures/time-series-thresholds.json` | `ada7571fae5ab8682293d86e585f0eb064cdeb7d397de90bb7c264f73c3a337b` |
| `tests/fixtures/bar-chart-pdata-1.json` | `8aee0a43fc9c51cd933fa6f41f52fcc2b31727140230328b39b4a86e50574d82` |
| `tests/fixtures/decision-dossier.json` | `a49497891df2948341a7a8d7858470261f312ff430134f0327578a84365f8b43` |

FA-H9 can pin the standalone temporal schema. CK-H1a can pin the packed
shell manifest and read the qualified module and HTML files using the
paths and hashes it carries. The dependency version and integrity for
those integrations come from the release PR and the published archive.
This build did not publish a registry version or exercise an h2a host.
The pinned h2a categorical transcript fallback still constructs SVG
in `packages/h2a/src/runtime/mcp/ui-render/fallback.ts`.
