# Changelog

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
