# `@sentropic/design-system-rich-text`

Framework-neutral rich-text core for the design system (lot RT-0, RED state).

## Status

Package skeleton plus RED tests only. The modules under `src/` are stubs:
every entry point exists so the tests load, and every entry point throws
`RT-0 RED: … not implemented` so each test fails for the stated reason
(missing implementation, never a missing module). Phase B implements the
modules; the tests below turn green without modification.

The package is `private: true` until the RT-1 gate, when it flips to
publishable in the same commit as its `LICENSE` and notices (spec §4.4).

## Content profile P0

Profile identifier `focus.markdown.p0@1`. Editable nodes are `paragraph`
(`paragraphId` attribute), `text` and `hardBreak`; editable marks are `bold`,
`italic` and `code`. Everything else travels as an opaque `preservedBlock`
(`paragraphId`, `raw`, `preservedKind`), carried byte-identical and never
edited. Undo/redo comes from `@tiptap/extensions` (`UndoRedo`): there is no
`@tiptap/extension-history` on the Tiptap v3 line. The Markdown codec bridge
is the official `@tiptap/markdown` (same v3 line as the core); see the lot
report for the reason and the pending spec amendment.

## Controlled model

The host owns the value (`RichTextDocument`: `format` plus ordered `blocks`
with opaque host-supplied `paragraphId`). The core converts
`RichTextDocument` ↔ ProseMirror document internally and emits the complete
document plus gesture provenance (`RichTextChangeEvent`). It computes no
per-paragraph diff, retains no baseline, and imports no host-side editing
module. The A → B → R1 → undo → R2 freeze sequence belongs to the h2a FE-3
host adapter, not to this package.

## Scripts

- `npm --workspace @sentropic/design-system-rich-text run build`
- `npm --workspace @sentropic/design-system-rich-text run check`
- Targeted RED run: `npm --workspace @sentropic/design-system-rich-text exec -- vitest run <exact test files>`
- Package regression: `npm --workspace @sentropic/design-system-rich-text run test`

Packaging follows `packages/codemirror`: `sideEffects: false`, `files:
["dist"]`, single `"."` export, build `tsc -p tsconfig.json`, test `vitest
run src`, Tiptap/ProseMirror as peers (`^3.0.0`), exact pins in
`devDependencies` for qualification.

## Layout

- `src/model.ts` — controlled document, gesture, readiness and event types
- `src/messages.ts` — injected-label catalogue shape
- `src/profile.ts` — P0 extension list and profile identifier
- `src/identity.ts` — paragraph-identity plugin entry
- `src/codec.ts` — Markdown segmentation/serialisation entries
- `src/theme.ts` — DS token bindings (data; applied by the adapter stylesheet)
- `src/editor.ts` — headless editor factory (document in, document plus
  gesture out, readiness signal, deferred capture)
- `src/*.test.ts` — RT-0 RED tests (RED 1–3 core halves, RED 7, RED 8 scan,
  internal reactivity witness, RED-P core half)
- `tests/fixtures/p0-corpus.md`, `tests/fixtures/list-corpus.md` — synthetic
  corpora (provenance stated in their headers)

Binding specification: `spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md` (§12, lot RT-0).
