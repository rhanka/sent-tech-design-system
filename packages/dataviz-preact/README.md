# `@sentropic/dataviz-preact`

Preact + Signals adapter and dashboard components for `@sentropic/dataviz-core`,
built on `@sentropic/design-system-preact`, and the **JSX source of truth** for
two builds: the Preact package and the React tree emitted from it by a
build-time specifier rewrite (lot P6 of the DS Preact+Signals programme).

Status: **lot P6** (private until lot P8 ships the release candidate). The
manifest stays `"private": true` until lot P8: the package is not published and
npm refuses to publish it; the repository publishable-licensing gate skips it
until then while `scripts/package-guard.mjs --check` pins its packaging state
(privacy, licence, single export, adapter side effects, runtime dependencies).

## Layout

```
src/                    Preact tree, the only authored source
  compat.ts             the only module importing preact/compat (createPortal)
  runtime.ts            core-only adapter: forwardRef, SVG attribute & tabIndex
                        normalisation, useInsertionEffect, useSyncExternalStore,
                        textInput, textChange, dblClick, focusWithin, focusOut,
                        type aliases
  signals.ts            the only module importing @preact/signals:
                        MaybeSignal, isSignal, useValue, unwrap
  classNames.ts         signal-aware class-name joiner
  adapter.ts            useDashboard + @sentropic/dataviz-core surface re-export
  lib/                  ported helpers and dashboard chart components
  *.test.tsx            Preact leg (@testing-library/preact, jsdom)
react/                  React twins of the three adapters + React-leg checks
                        (whole-Equal API parity, provenance, adapter paths)
coverage-manifest.json  P6 coverage manifest (PLAN section 2.9): one row per
                        ported module, the three adapters, semantic mappings
scripts/emit-react.mjs  the React emission (specifier rewrite + adapter swap)
scripts/coverage-manifest.mjs  check of the manifest against the tree
scripts/package-guard.mjs      check of the private packaging state
scripts/port-metrics.mjs       port table, remaining files, and runtime-gap
                               reach against dataviz-react at BASE_REF
measurements/           committed outputs of port-metrics.mjs
.react-emit/            generated React tree (git-ignored)
```

## Authoring rule

A component or helper module imports from `preact`, `preact/hooks`,
`@sentropic/design-system-preact`, `@sentropic/dataviz-core` and
`@sentropic/design-system-themes`. Anything whose name or behaviour differs
between Preact and React comes from an adapter (`./runtime.js`, `./compat.js`,
`./signals.js`). The emission fails on any runtime-specific specifier outside
the rewrite map, and the emitted tree is type-checked against `@types/react`
and `@sentropic/dataviz-react`.

| Specifier in `src/` | In the React emission |
|---|---|
| `preact` | `react` |
| `preact/hooks` | `react` |
| `@sentropic/design-system-preact` | `@sentropic/design-system-react` |
| `./runtime.js`, `./compat.js`, `./signals.js` | same specifier, file replaced by `react/<name>.ts` |

## Commands

```bash
npm run build              # dist/ (Preact) + .react-emit/ (React source and build)
npm run check              # type-check both trees, test files and whole-Equal React API parity
npm test                   # emitter tests, port-metrics check, scaffold guards, Preact leg, React leg
npm run test:scaffold      # manifest check + packaging guard
npm run test:preact        # Preact leg vitest suites
npm run test:react         # real dataviz-react suites on the emitted modules + React-leg checks
npm run measure:port       # regenerate measurements/port-metrics.{txt,json}
npm run measure:port:check # fail when committed port metrics are stale
```
