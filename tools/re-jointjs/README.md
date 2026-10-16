# JointJS reverse-engineering enumeration

Mechanical enumeration of the JointJS (`@joint/core` 4.3.3) observable
surface for [SPEC_RE_JOINTJS_PARITY.md](../../spec/SPEC_RE_JOINTJS_PARITY.md).
Node only, no network. TypeScript is resolved from the repository
`node_modules/typescript` (its compiler API drives both extractors).

## Run

```bash
node tools/re-jointjs/enumerate.mjs   # writes docs/re/jointjs-inventory.json
node tools/re-jointjs/verify.mjs      # independent AST completeness guard
node --test tools/re-jointjs/extract-ast.test.mjs  # guard regression tests
```

Sources are read from `.ds-scrap/re-sources/joint` at the repository root
(override with `RE_SOURCES=/path/to/re-sources`). Our-stack status proofs
are resolved against `packages/graph`, `packages/diagram-core`, and
`packages/diagram-canvas` in this worktree at generation time.

## Counting conventions and the guard

Conventions are listed in the header of `enumerate.mjs` and in the spec
(§2). `enumerate.mjs` is the primary extractor (TypeScript AST via
`ts.createSourceFile`). The guard is deliberately non-tautological:
`verify.mjs` never imports `enumerate.mjs`; it compares the stored
inventory bidirectionally with a second, independently written extractor,
`extract-ast.mjs` (TypeScript AST via `ts.createProgram` + TypeChecker,
separate traversal code), and fails on any item present on exactly one
side, printing the differences by family. It also checks field validity,
that every `source` and `proof` `path:line` resolves, that behaviour text
states an entry contract (the former generic templates are rejected), and
that the stored counts — including the parity denominator, which excludes
the 109 JointJS+ greenfield rows — match the recomputed counts.
"100 %" may be claimed only when `verify.mjs` exits 0.
