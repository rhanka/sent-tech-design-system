# `@sentropic/design-system-preact`

Preact + Signals components for the Sentropic design system, and the **JSX
source of truth** for two builds: the Preact package and the React tree emitted
from it by a build-time specifier rewrite.

Status: **lot P0 scaffold** (built on spike S1). Eight modules are ported
and the lot ports no more. The manifest stays `"private": true` until lot P8
ships the release candidate: the package is not published and npm refuses to
publish it; the licensing and notices gates of the repository, which follow
publishable packages, skip it until then. `scripts/package-guard.mjs --check`
pins this state (privacy, licence, single export, adapter side effects).
Findings, measurements and the revised estimate are in
[`docs/preact-s1-spike.md`](../../docs/preact-s1-spike.md).

## Layout

```
src/                    Preact tree, the only authored source
  compat.ts             the only module importing preact/compat (createPortal)
  runtime.ts            core-only adapter: forwardRef, useInsertionEffect,
                        useSyncExternalStore, textInput, focusWithin, type
                        aliases
  signals.ts            the only module importing @preact/signals:
                        MaybeSignal, useValue, unwrap
  <Component>.tsx       component modules: preact, preact/hooks, lucide-preact
  *.test.tsx            Preact leg (@testing-library/preact, jsdom)
react/                  React twins of the three adapters + React-leg checks
                        (props parity, provenance, adapter paths)
coverage-manifest.json  P0 hook for the programme coverage manifest (PLAN 2.9):
                        one row per module with its owning W3 lot, the three
                        P5 adapters, the semantic-mapping rows of the port
scripts/emit-react.mjs  the React emission (specifier rewrite + adapter swap)
scripts/coverage-manifest.mjs  check of the manifest hook against the tree
scripts/package-guard.mjs      check of the private packaging state
scripts/measure.mjs     bundle-size report
scripts/port-metrics.mjs        port table, port rate, lines per W3 lot,
                                projection and reach counts of the spike
scripts/probe-preact-major.mjs  the same source on another Preact major, in
                                an isolated project
measurements/           raw timing log (input) and raw outputs of the two
                        scripts above
.react-emit/            generated React tree (git-ignored)
```

## Authoring rule

A component module imports from `preact`, `preact/hooks` and `lucide-preact`
only the names that exist under the same name in `react` and `lucide-react`.
Anything whose name or behaviour differs between the two runtimes comes from an
adapter (`./runtime.js`, `./compat.js`, `./signals.js`). The emission fails on a
runtime-specific specifier anywhere else, and the emitted tree is type-checked
against `@types/react`, so a name missing from React fails `npm run check`.

| Specifier in `src/` | In the React emission |
|---|---|
| `preact` | `react` |
| `preact/hooks` | `react` |
| `lucide-preact` | `lucide-react` |
| `./runtime.js`, `./compat.js`, `./signals.js` | same specifier, file replaced by `react/<name>.ts` |

## Signals at the edges

A prop typed `MaybeSignal<T>` takes a value or a signal; the component reads it
once with `useValue` (tracked) or `unwrap` (untracked) and uses hooks inside.
Attributes spread onto an intrinsic element accept a signal natively and are
bound to the DOM without a re-render. In the React emission `MaybeSignal<T>` is
`T`: the emitted props are the ones `@sentropic/design-system-react` publishes.

## Commands

```bash
npm run build        # dist/ (Preact) + .react-emit/ (React source and build)
npm run check        # type-check both trees and every test file + React API parity
npm test             # emitter cases, port-metrics staleness gate, scaffold checks, Preact leg, then the React leg
npm run test:scaffold  # manifest hook + packaging guard (also run by npm test, hence by CI)
npm run test:react   # existing components-react tests on the emitted modules
npm run measure      # bundle sizes (after build)
npm run measure:port        # port metrics -> measurements/port-metrics.{txt,json}
npm run measure:port:check  # fails when that committed output is stale (part of npm test, hence of CI)
npm run probe:preact        # Preact 11.2.0 probe (network) -> measurements/preact-major-probe.txt
```

`sideEffects` names `dist/runtime.js` and `dist/signals.js`: the first installs
a Preact `options` hook when it is loaded, the second imports
`@preact/signals`, which installs its own. Both must stay in a bundle even
when none of their exports is used.

The React leg runs unmodified test files of `packages/components-react`
against the emitted modules: `vitest.react.config.ts` resolves `./<Module>.js`
inside the hand-written React tree to the emitted module of the same name.
