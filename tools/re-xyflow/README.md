# re-xyflow — mechanical enumeration for xyflow parity

Node only (no Python, no network). Sources are read-only under
`.ds-scrap/re-sources/xyflow` (see `.ds-scrap/re-sources/MANIFEST.md`).

```bash
node tools/re-xyflow/enumerate.mjs   # writes docs/re/xyflow-inventory.json + tools/re-xyflow/raw-enumeration.json
node tools/re-xyflow/verify.mjs      # completeness guard (exit 1 on any gap)
```

- `enumerate.mjs` extracts the observable surface mechanically: transitive
  public exports of `@xyflow/system` (0.0.83), `@xyflow/react` (12.12.0) and
  `@xyflow/svelte` (1.7.0); `ReactFlowProps`/`SvelteFlowProps` members;
  sub-component props; public hooks; instance helpers; store fields; change
  variants; model fields; enum members; edge path functions/types; anchored
  interaction behaviours; example scenarios. Each entry carries `source`
  (path:line in the xyflow tree), `behaviour`, `acceptance`, `target`,
  `status` + `proof` (path:line in `packages/graph|diagram-core|diagram-canvas`),
  and `priority`. No xyflow code is copied — names, signatures and locations only.
- `verify.mjs` is the completeness guard: raw enumerated count must equal the
  inventory count, ids must be unique, every `source`/`proof` file must resolve,
  and `status`/`target`/`priority` must be in their closed vocabularies.
- `raw-enumeration.json` is the generated enumeration ledger (keys only).

Counting convention: one entry per enumerated observable per family. Families
overlap by design (e.g. a hook appears in `api-react` as an export and in
`hooks` as a hook contract); the total (1062 at generation) is the sum over
families, not a count of unique names. See `SPEC_RE_XYFLOW_PARITY.md`.
