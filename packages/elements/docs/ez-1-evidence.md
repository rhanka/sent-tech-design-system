# EZ-1 build evidence

Round 1 source `bde97d7a4bc176df3be7c6dfc07cf38007b37f74` from the PR head
`9e75cad2cf143a26b912eb469916d34547deff42`. Built in the isolated worktree
with Node 22.22.1, npm 11.21.1, Vite 8.3.4, Svelte 5.55.7 and Puppeteer
25.1.0 with Chrome Headless Shell 158.0.8127.36.

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
| `rtk npm run test --workspace @sentropic/design-system-elements -- tests/time-series-chart.test.ts` | 42 passed on the two validation seams and the Markdown formatter |
| `rtk npm run test --workspace @sentropic/design-system-elements` | 263 passed |
| `rtk npm exec --workspace @sentropic/design-system-svelte -- vitest run src/LineChart.test.ts src/ChartAxisConfig.test.ts src/ChartAccessibility.test.ts src/ChartForecastCluster.test.ts` | 48 passed |
| `rtk npm run build --workspace @sentropic/design-system-elements` | Node, CDN bundle and per-component shells built |
| `rtk npm run check --workspace @sentropic/design-system-elements` | Type checks passed |
| `rtk npm run catalog:check --workspace @sentropic/design-system-elements` | Seven generated files match |
| `rtk node packages/elements/tests/browser/chromium-suite.mjs` | All assertions passed. The three temporal datasets, categorical dataset and dossier rendered in their qualified shells without secondary requests |
| `rtk node --test scripts/elements-browser-artifacts.test.mjs scripts/elements-publish-tarball.test.mjs` | 17 passed, including packed shell measurements, the three fixture hashes and the rendering skill |
| `rtk npm run dist:import-closure -- --workspaces=@sentropic/design-system-elements` | Packed Node imports and public assets passed |
| `rtk node scripts/smoke-pack.mjs --workspaces=@sentropic/design-system-elements` | Installed package smoke passed |
| `rtk npm run index:check --workspace @sentropic/design-system-component-index` | 436 artifacts match after regenerating the LineChart and BarChart entries |

The temporal suite covers closed objects, millisecond precision, ordering,
unique series IDs and the 4096-byte Markdown boundary. Chromium verifies
that the same observations drive the plots and accessible table, that the
uneven series have the expected x/y coordinates, and that thresholds and
bands render. A2UI SDK 0.14.0 also accepted all four chart fixtures.

The regression tests first observed `each_key_duplicate` in LineChart and an
empty temporal plot, identical `Sensor` series names in HTML and Markdown,
and missing fixtures and skill in the tarball. A temporary render that put
every point at the same x passed the original Chromium checks and failed the
new coordinate check. The rebuilt renderer and package passed those tests.

## Complete HTML shell budgets

Complete shells include the module and HTML template. The limit is under
983,040 raw bytes and at most 153,600 gzip bytes, measured with fflate
0.8.3 at level 6 and mtime 0. The CDN entry closure measured 68,459 gzip
bytes at its existing level 9, reported separately in `sri.json`.

| Component | Raw bytes | Gzip bytes | Status | Complete HTML SHA-256 |
| --- | ---: | ---: | --- | --- |
| BarChart | 590774 | 99154 | qualified | `d4ae18d17302977f98a3fe32fcd14db4f902a349b72d02c38f2a6da1304192e8` |
| BpmnCanvas | 1430206 | 384892 | partial | `b0486bf7d067a15b96b2cf1fbe3e3ec7e5bd0d7186f9034db9ab2092835bc6de` |
| DecisionDossier | 621069 | 111621 | qualified | `2921d0e9c12f5bc550d3164e5472df22372b31d850e7b0bffb86e8bed8f646b7` |
| TimeSeriesChart | 589065 | 99327 | qualified | `a17a3d7f42370beed6511b99513e4ec56d7e0087bc1e883d8518f8f56a2e9730` |

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
sha512-SFtyDX3+8oSmH/MYkyeljgzDWr1NMY3Rs0+SrdLIJDTurEB4W5h+CKX5E/UjivLmdwmSrrYJf0mAslxEa9ryOg==
```

| Artifact or fixture | SHA-256 |
| --- | --- |
| `catalog.json` | `aaf10e748a9438d15422da5ad2af5cea007ee56858e0c80ab608ea27ccd6df32` |
| `envelope.json` | `6bf3351ba45c90a0dd3b40a7e7eddf019e72379a4551acc07a89f4436fc6cf2e` |
| `schemas/BarChart.v1.json` | `44b1be9a089c52f23ffcf8b2f2b24030488329c144127388a3471e0f84952c44` |
| `schemas/TimeSeriesChart.v1.json` | `98b9d246237a6533630fd6c8f50bb3b038f9db6190613572cedf07f12a0645fd` |
| `dist/browser/sri.json` | `3d568a1dff4c70fe4f6704702a492db47e32f327a0de1144ec6647ff15b8d97a` |
| `dist/shells/manifest.json` | `c9eaed730439967243fc1b3c1a8745ee3c33ab72bb263ae544bf78f7311b72a4` |
| `skill/SKILL.md` | `a30e2dc4fbfc608f6ed3a0f46a3f28beb652879e484996ae6d0c01f60eedcfa4` |
| `fixtures/time-series-single.json` | `9c2d8a2933d1635978687bc897324610f4bfef9e58f4adfa07939c589e317f58` |
| `fixtures/time-series-multi.json` | `8e3224ec6a1a8ad81666aab1f366fee80e24e82dc383ab7c19e9a0d5f63e4c08` |
| `fixtures/time-series-thresholds.json` | `ada7571fae5ab8682293d86e585f0eb064cdeb7d397de90bb7c264f73c3a337b` |
| `tests/fixtures/bar-chart-pdata-1.json` | `8aee0a43fc9c51cd933fa6f41f52fcc2b31727140230328b39b4a86e50574d82` |
| `tests/fixtures/decision-dossier.json` | `a49497891df2948341a7a8d7858470261f312ff430134f0327578a84365f8b43` |

FA-H9 can pin the standalone temporal schema. CK-H1a can pin the packed
shell manifest and read the qualified module and HTML files using the
paths and hashes it carries. The dependency version and integrity for
those integrations come from the release PR and the published archive.
Registry publication and the temporal host integration remain in the
release PR and CK-H1a.

The h2a fallback implementation on `6dad89f7f3617d049e0f0a47d0961ef629a98e42`
matches the implementation pinned at `e66d85c34`. Its MCP tool test first
received two text blocks and now verifies a single bounded Markdown table.
`rtk node --test packages/h2a/test/ui-render-tools.test.js` passed 22 tests
on the pushed [h2a companion commit](https://github.com/rhanka/h2a/commit/894f4ea26b528c488823b13438beed55a04a032a).
