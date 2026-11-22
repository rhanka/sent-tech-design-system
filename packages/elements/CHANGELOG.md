# Changelog

## 0.3.1

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
  custom element and its embedded mount API (#267). Because `0.3.0` was never
  published on npm, Vue consumers using the updated optional BPMN peer require
  Elements `0.3.1`.
- Exposes the dossier mount via `./dossier-mount`, the Focus static kit via
  `./focus-kit`, `./focus-kit/manifest.json` and `./focus-kit/*`, the shell
  manifest via `./shells/manifest.json`, the sample envelopes via
  `./fixtures/*`, and the authoring instructions via `./skill/SKILL.md`.

### Changed

- The BarChart catalogue declares a text fallback in place of SVG.
- The dossier renderer uses `@sentropic/focus` 0.6.0,
  `DecisionDossierDocument` 1.1.0, `@sentropic/design-system-svelte` 0.43.2,
  and `@sentropic/design-system-review-core` 0.1.1.
