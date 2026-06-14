# Angular Port Progress

## Status

- Package scaffold: complete.
- Public component exports: 188 / 188.
- Smoke tests: 188 component export checks plus runtime helper checks.
- Styles: copied byte-identically from React at 2026-06-14T18:59:29.875Z.
- Build: passing with Angular 21.2.17 / TypeScript 5.9.
- Test setup: `npm run test` rebuilds the package, imports the published `dist/`
  surface, and loads `@angular/compiler` for Angular partial compilation in
  Vitest. This avoids running Vitest directly against decorated Angular sources.

## Plan

1. Generate standalone Angular components from the Svelte export list and Vue/React prop surfaces.
2. Copy `styles.css` byte-identically from React.
3. Keep helper functions/types exported from `src/index.ts`.
4. Run only targeted workspace commands.

## Verification

- `npm run check --workspace @sentropic/design-system-angular`
- `npm run build --workspace @sentropic/design-system-angular`
- `npm run test --workspace @sentropic/design-system-angular` (2 files, 191
  tests)
