# WP14 Chrome Reference Kit

Reference pack for rebuilding the documentation chrome shape of Carbon, DSFR and Airbus without touching `apps/docs`.

## Scope

- `carbon/` and `dsfr/` contain public, committable SVG references plus JSON/MD implementation specs.
- `airbus/` contains the committable structure spec only. Airbus SVG assets are private and were copied outside git to `/tmp/sent-tech-wp14-chrome-private/airbus/`.
- The specs target chrome shape only: header, header nav, sidebar, active states and breadcrumb. Component bodies remain out of scope.

## Files

| Theme | Public assets | Spec |
|---|---|---|
| Carbon | `carbon/assets/carbon-wordmark.svg` | `carbon/chrome-spec.json` |
| DSFR | `dsfr/assets/logo-rf-marianne.svg` | `dsfr/chrome-spec.json` |
| Airbus | private `/tmp/sent-tech-wp14-chrome-private/airbus/logo*.svg` | `airbus/chrome-spec.json` |

## Integration Notes

- Carbon chrome should keep the full black 48px masthead and 256px left tree.
- DSFR chrome should keep the two-tier header, the underlined horizontal nav and the left active block with blue accent.
- Airbus chrome should use the official Airbus wordmark from the private local asset path and keep its assets out of git.
