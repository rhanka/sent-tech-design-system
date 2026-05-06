# Component Catalog V1 Slice A Verification

Date: 2026-05-06

## Fait

- Added form token groups: `field`, `control`, and `selection`.
- Added Svelte form controls: `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, and `Switch`.
- Added bilingual Forms documentation using the real components.
- Pushed atomic commits on `main`.

## Verification

- `npm --workspace packages/tokens test`: passed.
- `npm --workspace packages/components-svelte test`: passed, 7 tests.
- `npm --workspace packages/components-svelte run check`: passed.
- `npm --workspace packages/components-svelte run build`: passed.
- `npm run docs:build`: passed.
- `npm --workspace apps/docs run check`: passed.
- `npm run verify`: passed.
- `curl -I http://127.0.0.1:5173/components/forms`: returned `HTTP/1.1 200 OK`.

## Reste a faire

- Slice A Form controls: 0%.
- Component Catalog V1 overall: about 55% remains.

## Attendus

- Option 1, recommended: start Slice B overlays and feedback (`Modal`, `Tooltip`, `Toast`). This completes the initially recommended Form + Overlay tranche.
- Option 2: start data/navigation (`Table`, `Tabs`, `Pagination`, `Breadcrumb`). This is useful for dashboards but leaves overlay primitives missing.
- Option 3: pause catalog and integrate forms into Forge/Entropic. This validates product fit early but may slow catalog completion.
