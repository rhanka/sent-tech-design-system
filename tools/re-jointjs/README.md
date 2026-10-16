# JointJS reverse-engineering enumeration

Mechanical enumeration of the JointJS (`@joint/core` 4.3.3) observable
surface for [SPEC_RE_JOINTJS_PARITY.md](../../spec/SPEC_RE_JOINTJS_PARITY.md).
Node only, no dependencies, no network.

## Run

```bash
node tools/re-jointjs/enumerate.mjs   # writes docs/re/jointjs-inventory.json
node tools/re-jointjs/verify.mjs      # completeness guard (bijection check)
```

Sources are read from `.ds-scrap/re-sources/joint` at the repository root
(override with `RE_SOURCES=/path/to/re-sources`). Our-stack status proofs
are resolved against `packages/graph`, `packages/diagram-core`, and
`packages/diagram-canvas` in this worktree at generation time.

## Counting conventions

The guard proves completeness relative to the conventions listed in the
header of `enumerate.mjs` and in the spec (§2). One inventory entry exists
per extracted raw item; `verify.mjs` re-runs the extraction and asserts
the bijection, field validity, and that every `source` and `proof`
`path:line` resolves.
