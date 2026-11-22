# Changelog

## 0.3.1

- 0.3.1 — same content as 0.3.0, publish workflow fix.

## 0.3.0

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
  custom element and its embedded mount API (#267). Vue consumers using the
  updated optional BPMN peer require Elements 0.3.0.
- Exposes the dossier mount via `./dossier-mount`, the Focus static kit via
  `./focus-kit`, `./focus-kit/manifest.json` and `./focus-kit/*`, the shell
  manifest via `./shells/manifest.json`, the sample envelopes via
  `./fixtures/*`, and the authoring instructions via `./skill/SKILL.md`.

### Changed

- The BarChart catalogue declares a text fallback in place of SVG.
- The dossier renderer uses `@sentropic/focus` 0.6.0,
  `DecisionDossierDocument` 1.1.0, `@sentropic/design-system-svelte` 0.43.2,
  and `@sentropic/design-system-review-core` 0.1.1.
