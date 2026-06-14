# Angular integration status

## Goal

Add Angular as the fourth documentation framework in `apps/docs`, at parity with
Svelte, React, and Vue for framework selection, URL state, live rendering, and
copyable examples.

## Current plan

1. Add Angular to the docs framework state and URL validation.
2. Add Angular code serialization from the existing neutral `NodeSpec` registry.
3. Add a client-only Angular island that mounts standalone Angular components
   with `createApplication` and `createComponent`.
4. Wire `TabbedExample`, `FrameworkPreview`, and interactive live demos to mount
   Angular when selected.
5. Keep Angular 21 pinned in docs runtime dependencies.
6. Run targeted docs tests/check/build, then push a scoped docs commit.

## Status

- Done: Angular 21 runtime dependencies added to `apps/docs`.
- Done: RED tests added for `?framework=angular` and Angular code generation.
- Done: Angular island imports `@sentropic/design-system-angular` strictly and
  loads `@angular/compiler` before the partially compiled package.
- Done: Shared framework wiring for selector, URL state, `TabbedExample`,
  `FrameworkPreview`, and interactive live demos.
- Done: View copy now says multi-framework and includes Angular.
- Done: targeted docs `test`, `check`, and `build --ignore-scripts` pass.
- Remaining: commit, rebase, push.

Progress: 100%

## Coordination notes

- `packages/components-angular` is now committed and pushed on the branch.
- The docs island relies on the layout's global DS stylesheet import; React and
  Angular package styles are byte-identical, so no per-island CSS import is
  needed.
- Do not edit `packages/tokens/src/*.dark.ts`, `apps/docs/src/lib/chrome/**`, or
  uncommitted chart work owned by other agents.
