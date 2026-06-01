# WP14 Chrome Reference Kit

Reference pack for rebuilding the documentation chrome shape of Carbon, DSFR and Airbus without touching `apps/docs`.

## Scope

- `carbon/` and `dsfr/` contain public, committable SVG references plus JSON/MD implementation specs.
- `airbus/` contains the committable structure spec. Airbus SVG assets used by the docs chrome are now versioned under `apps/docs/static/chrome/airbus/` after the 2026-05-31 redistribution decision.
- The specs target chrome shape only: header, header nav, sidebar, active states and breadcrumb. Component bodies remain out of scope.

## Files

| Theme | Public assets | Spec |
|---|---|---|
| Carbon | `carbon/assets/carbon-wordmark.svg` | `carbon/chrome-spec.json` |
| DSFR | `dsfr/assets/logo-rf-marianne.svg` | `dsfr/chrome-spec.json` |
| Airbus | `apps/docs/static/chrome/airbus/logo*.svg` | `airbus/chrome-spec.json` |

## Integration Notes

- Carbon chrome should keep the full black 48px masthead and 256px left tree.
- DSFR chrome should keep the two-tier header, the underlined horizontal nav and the left active block with blue accent.
- Airbus chrome uses the versioned Airbus wordmark assets in `apps/docs/static/chrome/airbus/`.
