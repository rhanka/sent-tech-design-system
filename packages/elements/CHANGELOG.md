# Changelog

## 0.5.0

DE-3 Milestone 1 (`DE3-L1a`, `DE3-L2a`), consuming
`@sentropic/diagram-canvas@0.7.0` (built on `@sentropic/diagram-core@0.6.1`)
and updating the bundled browser runtime (`dist/browser/elements.js`).

### Changed

- Updated the pinned `@sentropic/diagram-canvas` dependency from `0.6.0` to
  `0.7.0` so Focus dossier `renderSceneSvg` renders adopt single-legend
  authority (`DE3-L1a`) and `3.5px` contrast-aligned `r7` links while keeping
  `process@1` (`2.5px`, `edgeStroke`) and `v1` (`1.5px`, `#64748b`) intact
  (`DE3-L2a`).

## 0.4.0

Process-flow simple boxes in Focus dossiers (Archify lot 1, L1d), consuming
`@sentropic/diagram-canvas@0.6.0` (built on `@sentropic/diagram-core@0.6.1`).

### Changed

- Focus diagram source resolution (`resolveDossierScene` and `readDossierScene`)
  now validates scenes through `validateSceneDocument` from
  `@sentropic/diagram-canvas/diagramSceneModel` while keeping `generic@1`
  bound locally to `foldableGenericProfile`.
- Untyped Mermaid `flowchart LR|TB|TD` sources lower to `process@1` simple
  boxes with content-derived `relation:<from>.<to>` (`.2`/`.3` parallel) IDs
  checked by `validateDocument`, with `TB`/`TD` carrying the validated
  `sentropic:process-flow` direction extension.
- Focus `process@1` diagrams pin `FOCUS_PROCESS_TARGET_WIDTH = 640`, keeping
  3 or fewer steps left-to-right and switching longer flows to top-to-bottom
  so 5-step process flows render at scale `>= 0.9` in the `72ch` column with
  visible straight/rounded connectors, no component icon, and no `+`/fold
  button.

### Added

- Collapsible accessible step table (`renderProcessTable`) below Focus
  `process@1` diagrams, styled for narrow and wide viewports (`390`, `820`,
  `1280` px) and hidden in fullscreen mode.

## 0.3.3

Focus static kit sizing fix (owner feedback 24/11,
track 01M85JMWB3YWBM69DAKPMZ9KX8). Vue consumers using the updated optional
BPMN peer require Elements `0.3.3`.

### Fixed

- Every `var(--st-semantic-*)` in the kit CSS (`dossier-page.css`,
  `engines/dossier.css`, `time-series-chart.svelte`) now carries the
  design-system light-theme literal as its fallback, so the Focus dossiers
  published as claude.ai artifacts render styled without a themed host.
- Focus diagrams render at their natural size and are never enlarged
  (`width: auto; max-width: 100%; height: auto` in
  `.st-dossier__diagramViewport > svg`, explicit `width`/`height`/`viewBox`
  on the SVG): a large diagram fits the column, a small one stays small. No
  media query in the kit CSS triggers above 599 px.

### Added

- A `Tout voir` toggle on every Focus diagram with the same behaviour and
  wording as the DiagramSceneFigure `Tout voir` mode: natural size by
  default, whole scene with no scroll in view-all, `Plein écran` offered
  while view-all stands, pinch zoom kept, Escape leaves fullscreen then
  view-all, keyboard and `aria-pressed` throughout, no animated motion.

## 0.3.2

Ships the `0.3.1` content, plus the publish workflow fix for the Chromium
singleton socket path. `0.3.1` was tagged (`elements-v0.3.1`) but never published
on npm because the `verify` job failed before publishing, which is why this
release is `0.3.2` and not a new minor (`0.4.0`) despite the added public
behaviour. Vue consumers using the updated optional BPMN peer require Elements
`0.3.2`.

### Fixed

- Roots the `chromium-suite.mjs` Chromium profile, TMPDIR and
  XDG_RUNTIME_DIR in a short directory: `RUNNER_TEMP` on GitHub runners,
  otherwise the repository `tmp/` (local rule: no system `/tmp`). The
  previous suite built its work dir under the GitHub workspace path, which
  made Chromium's singleton socket path exceed the Unix socket limit
  (`FATAL process_singleton_posix.cc Socket path too long`), so the
  `verify` job of `elements-publish.yml` failed twice before publishing,
  and the existing tag cannot be republished with the fixed workflow. The
  suite now fails early with a clear message if the resulting socket path
  would exceed 100 characters.
- Adds the same `chromium-suite.mjs` run, with the same pinned
  `browser-actions/setup-chrome` step and `CHROME_BIN` env as
  `elements-publish.yml`, to the pull-request CI as an
  `elements-browser-suite` job in `.github/workflows/verify.yml`, so the
  exact publish verification runs on every pull request that touches
  elements. This suite does not run in the pull-request CI otherwise,
  which is why it was never caught before.

## 0.3.1 (tagged, never published on npm)

Ships the `0.3.0` content, plus FA-D2 (#330), plus the publish workflow fix.
`0.3.0` was tagged (`elements-v0.3.0`) but never published on npm because the
`verify` job failed before publishing, which is why this release is `0.3.1` and
not a new minor (`0.4.0`) despite adding a public export and a runtime
dependency.

### Added

- FA-D2 (#330) adds r7 scene rendering and container folding (including in
  review mode) for Focus dossier diagrams in the static kit, exposes the new
  `./dossier-views` subpath export (`buildDossierViews`, `DossierDiagramViews`,
  `DossierViews`, `DossierDiagramError`), and adds the exact runtime dependency
  `@sentropic/diagram-canvas@0.5.0`.

### Fixed

- Adds the pinned `browser-actions/setup-chrome` step and `CHROME_BIN` env to
  the `verify` job in `.github/workflows/elements-publish.yml` so
  `chromium-suite.mjs` can run before publishing.

## 0.3.0 (tagged, never published on npm)

### Added

- FA-D1 (#322) ships the Focus static artifact kit for decision dossiers and
  reports. It includes a manifest with asset hashes and a helper for assembling
  a single offline HTML file with a hash-based CSP. Embedded hosts receive the
  current review root in `st-dossier-ready` after each render.
- EZ-1 (#321) adds `TimeSeriesChart` to the catalogue and ships the
  `<st-time-series-chart>` element. Multiple series share a UTC time axis. The
  element provides an accessible observations table, and
  `formatTimeSeriesMarkdown` formats the same rows for transcripts.
- FA-D3 (#332) integrates the review layer (`CommentLayer`, `ThreadPanel`,
  `OrphanList`) into the Focus dossier kit and `./dossier-mount` export, with
  explicit-aid B5 anchoring, hover and passthrough handling, and live
  `artifactVersion` tracking across re-renders. Reading remains unchanged when
  no review adapter is mounted.
- First publishes the `./bpmn` and `./bpmn-mount` subpath exports for the BPMN
  custom element and its embedded mount API (#267). Because `0.3.0` and `0.3.1`
  were never published on npm, Vue consumers using the updated optional BPMN peer
  require Elements `0.3.2`.
- Exposes the dossier mount via `./dossier-mount`, the Focus static kit via
  `./focus-kit`, `./focus-kit/manifest.json` and `./focus-kit/*`, the shell
  manifest via `./shells/manifest.json`, the sample envelopes via
  `./fixtures/*`, and the authoring instructions via `./skill/SKILL.md`.

### Changed

- The BarChart catalogue declares a text fallback in place of SVG.
- The dossier renderer uses `@sentropic/focus` 0.6.0,
  `DecisionDossierDocument` 1.1.0, `@sentropic/design-system-svelte` 0.43.2,
  and `@sentropic/design-system-review-core` 0.1.1.
