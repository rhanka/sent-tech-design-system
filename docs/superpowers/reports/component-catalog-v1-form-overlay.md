# Component Catalog V1 Form + Overlay Verification

Date: 2026-05-06

## Fait

- Added form controls: `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`.
- Added overlay and feedback components: `Modal`, `Tooltip`, `Toast`.
- Added token groups: `field`, `control`, `selection`, `overlay`, `tooltip`, `toast`.
- Added bilingual docs pages: `/components/forms` and `/components/overlays`.
- Pushed all work atomically to `main`.

## Verification

- `npm run verify`: passed.
- Component tests: 11 tests passed across 3 files.
- Token tests: 5 tests passed.
- `curl -I http://127.0.0.1:5173/components/forms`: returned `HTTP/1.1 200 OK`.
- `curl -I http://127.0.0.1:5173/components/overlays`: returned `HTTP/1.1 200 OK`.

## Reste a faire

- Form + Overlay tranche: 0%.
- Component Catalog V1 broader catalog: about 35% remains.

## Attendus

- Option 1, recommended: start data/navigation next (`Table`, `Tabs`, `Pagination`, `Breadcrumb`, `SideNav`). This makes the library useful for admin dashboards and Graphify-style screens.
- Option 2: start product integration in Forge/Entropic. This validates the API against real surfaces but will slow component catalog breadth.
- Option 3: start adapter package for Airbus-like compatibility. This strengthens white-label proof but is more abstract before data components exist.
