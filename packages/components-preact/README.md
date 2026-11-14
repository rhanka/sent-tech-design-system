# `@sentropic/design-system-preact`

Preact + Signals components for the Sentropic design system, and the **JSX
source of truth** for two builds: the Preact package and the React tree emitted
from it by a build-time specifier rewrite.

Status: **spike S1**. Eight modules are ported; the package is not published.
Findings, measurements and the revised estimate are in
[`docs/preact-s1-spike.md`](../../docs/preact-s1-spike.md).

## Layout

```
src/                    Preact tree, the only authored source
  compat.ts             the only module importing preact/compat (createPortal)
  runtime.ts            core-only adapter: forwardRef, useInsertionEffect,
                        useSyncExternalStore, textInput, type aliases
  signals.ts            the only module importing @preact/signals:
                        MaybeSignal, useValue, unwrap
  <Component>.tsx       component modules: preact, preact/hooks, lucide-preact
  *.test.tsx            Preact leg (@testing-library/preact, jsdom)
react/                  React twins of the three adapters + React-leg checks
scripts/emit-react.mjs  the React emission (specifier rewrite + adapter swap)
scripts/measure.mjs     bundle-size report
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
npm run check        # type-check both trees + React props parity
npm test             # emitter cases, Preact leg, then the React leg
npm run test:react   # existing components-react tests on the emitted modules
npm run measure      # bundle sizes (after build)
```

The React leg runs unmodified test files of `packages/components-react`
against the emitted modules: `vitest.react.config.ts` resolves `./<Module>.js`
inside the hand-written React tree to the emitted module of the same name.
