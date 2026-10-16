# re-xyflow — mechanical enumeration for xyflow parity

Node only (no Python, no network). Sources are read-only under
`.ds-scrap/re-sources/xyflow` (see `.ds-scrap/re-sources/MANIFEST.md`).
TypeScript is loaded from the repository `node_modules/typescript`.

```bash
node tools/re-xyflow/enumerate.mjs   # writes docs/re/xyflow-inventory.json + tools/re-xyflow/raw-enumeration.json
node tools/re-xyflow/verify.mjs      # independent completeness guard (exit 1 on any disagreement)
```

Two separately written extractors derive the same surface, so the guard
compares two independent enumerations instead of comparing a file with
itself:

- `enumerate.mjs` (primary) is semantic: `ts.createProgram` +
  TypeChecker over `@xyflow/system` (0.0.83), `@xyflow/react` (12.12.0)
  and `@xyflow/svelte` (1.7.0). It extracts transitive public exports
  (async functions, multi-line export blocks, `export type *`),
  `ReactFlowProps`/`SvelteFlowProps` members, 27 sub-component prop
  types (intersections and `Pick`/`Omit` resolved), instance helpers
  (`ReactFlowInstance`, `useSvelteFlow` return), store fields and
  actions, change variants, model fields, enum members, edge path
  functions/types, anchored interaction behaviours, and example
  scenarios. Only members declared inside the xyflow tree count;
  generic DOM attribute expansions are excluded. Each entry carries
  `source` (path:line in the xyflow tree), `behaviour` (full signature
  plus that property's own JSDoc `@default` when documented),
  `acceptance`, `target`, `status` + `proof`, and `priority`. No
  xyflow code is copied — names, signatures and locations only.
- `verify.mjs` (guard) is syntactic and shares no code with the
  primary: a `ts.createSourceFile` AST walk (export graph, type
  expansion, enums, directory walk). It fails on any element present
  in one enumeration and absent from the other, lists both
  directions, and enforces proof discipline: `covered`/`partial`
  require a resolvable `proof` (path:line in
  `packages/graph|diagram-core|diagram-canvas`), while `missing` and
  `excluded` must carry `proof: null` — never a fabricated location.
- `raw-enumeration.json` is the primary extractor's key ledger; the
  guard checks it for consistency, but the completeness verdict comes
  from the independent AST enumeration, not from this file.

Counting convention: one entry per enumerated observable per family.
Families overlap by design (e.g. a hook appears in `api-react` as an
export and in `hooks` as a hook contract); the total (1598 at the
Gemini correction round) is the sum over families, not a count of
unique names. See `SPEC_RE_XYFLOW_PARITY.md` §2 and Annex A.
