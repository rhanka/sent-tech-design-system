# re-bpmn-js — mechanical enumeration of bpmn-js / diagram-js

Node only, no dependencies, no network. Sources are the pinned checkouts in
`.ds-scrap/re-sources/` at the repository root (read-only; see its
`MANIFEST.md`): bpmn-js 18.31.0, diagram-js 15.28.1, bpmn-moddle 10.3.1,
bpmn-js-examples at 18.31.0.

```sh
node tools/re-bpmn-js/enumerate.mjs   # writes docs/re/bpmn-js-inventory.json
node tools/re-bpmn-js/verify.mjs      # completeness guard (independent AST bijection + schema + sources + proofs)
node tools/re-bpmn-js/extract-ast.mjs # debug: per-family counts of the second extractor
```

`enumerate.mjs` extracts the observable surface (modules, commands, rules,
palette / context-pad / replace / popup entries, keyboard bindings, EventBus
events, config options, renderer handlers, moddle types, public API, examples)
under the counting conventions stated in its header, maps each item onto our
stack (`graph` / `diagram-core` / `diagram-canvas` / DS component / new module)
with a `covered` / `partial` / `missing` status and a proof (`path:line` in
this worktree), and writes one inventory entry per extracted item.

`verify.mjs` is a non-tautological guard: it never re-runs `enumerate.mjs`.
It compares the inventory against a second, independent extraction by
`extract-ast.mjs` (TypeScript compiler API over the same pinned sources,
sharing no code with `enumerate.mjs`) and fails — listing both directions of
the difference — unless the two enumerations are in exact bijection, every
`source` and `proof` resolves to a real `path:line`, and every entry carries
the full schema. This is the mechanical guard behind any "100 %" claim:
100 % of the surface two independent extractors agree on, under the stated
conventions — nothing more.

Override the sources location with `RE_SOURCES=/path/to/re-sources` if needed.
