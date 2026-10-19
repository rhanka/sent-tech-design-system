# `@sentropic/design-system-rich-text`

Framework-neutral rich-text core for the design system (lot RT-0).

## Status

RT-0 implementation: the neutral core (controlled document model, P0
profile data, identity contract, Markdown bridge, token mapping and the
headless editor factory) is implemented and covered by `src/*.test.ts`.
The package is `private: true` until the RT-1 gate, when it flips to
publishable in the same commit as its `LICENSE` and notices (spec §4.4).

## Content profile P0

Profile identifier `focus.markdown.p0@1`. Editable nodes are `paragraph`
(`paragraphId` attribute), `text` and `hardBreak`; editable marks are `bold`,
`italic` and `code`. Everything else travels as an opaque `preservedBlock`
(`paragraphId`, `raw`, `preservedKind`), carried byte-identical and never
edited. Undo/redo comes from `@tiptap/extensions` (`UndoRedo`): there is no
`@tiptap/extension-history` on the Tiptap v3 line. The Markdown codec bridge
is the official `@tiptap/markdown` (same v3 line as the core, v3-native
storage API; transitive `marked`, MIT) — see spec §6.5 and
`src/profile.ts` (`P0_MARKDOWN_SERIALISATION`).

`createP0Extensions()` returns the P0 extension set as frozen descriptor
data in composition order, so the neutral core imports no `@tiptap/*`
runtime module and stays side-effect free in Node. The runtime editor
(RT-1+) instantiates the named packages against these descriptors.

## Controlled model

The host owns the value (`RichTextDocument`: `format` plus ordered `blocks`
with opaque host-supplied `paragraphId`). The core converts
`RichTextDocument` ↔ block state internally and emits the complete
document plus gesture provenance (`RichTextChangeEvent`). It computes no
per-paragraph diff, retains no baseline, and imports no host-side editing
module. The A → B → R1 → undo → R2 freeze sequence belongs to the h2a FE-3
host adapter, not to this package.

## `HeadlessEditor` (internal factory surface)

`createHeadlessEditor(options)` builds the headless editor: document in,
document plus gesture out. It copies the supplied document, initialises the
acknowledgement reference to that copy, and never mutates the caller's
value. Every emitted document is an independent copy with exact keys.

- `getDocument()` / `getSelection()` — independent copies of the displayed
  document and the logical selection (`anchorParagraphId` plus
  intra-paragraph offset).
- `setEditable(editable)` / `setDisabled(disabled)` — take effect
  immediately without remounting; emit nothing and alter nothing.
  Effective editing is `editable && !disabled`; `disabled` wins. In a
  non-editable state every mutation entry (typing, paste, split, merge,
  delete, undo, redo) is inert: no mutation, no `onChange`.
- `typeText(paragraphId, text)` — appends to the paragraph; one `type`
  event. `clearParagraph(paragraphId)` — sets `text: ""` under the same
  identity (never a removal); one `type` event, none when already empty.
- `splitParagraph(paragraphId, offset)` — leading block keeps its identity,
  the tail carries a fresh allocator-supplied identity; `gesture.split`
  names source and fresh tails. `mergeWithPrevious(paragraphId)` —
  concatenates into the leading block, retires the consumed identity
  without reallocating it; `gesture.merge` names survivor and retired.
- `deleteBlocks(paragraphIds)` — one `delete` event; unknown identities
  are a silent no-op. `undo()` / `redo()` — snapshot history, one
  `undo`/`redo` event each; empty stacks are silent.
- `copyToPayload(paragraphIds)` — builds a `{ text }` payload from live
  block identities (internal origin). `paste(payload)` — parses `text/html`
  when present, else `text/plain`, against the P0 schema only (spec §7):
  identity attributes are stripped (only text survives), scriptable markup
  is dropped, links degrade to their text, images degrade to their alt
  text with an `image` report, and any payload that would create a
  non-paragraph block is refused whole (one `onUnsupportedPaste`, zero
  `onChange`, document and selection unchanged).
- `applyExternalUpdate(next)` — spec §5.6 rules 1–4 in order: echo
  acknowledgement without replacement, composition deferral, conflict
  surfacing without overwrite (`onExternalConflict` carries incoming and
  local), automatic no-conflict application with selection re-anchored by
  paragraph identity. No path silently overwrites locally divergent work.
- `captureDocument()` / `readiness()` — deferred capture (spec §5.6):
  resolves immediately when ready, waits for the composition commit while
  composing, rejects pending captures exactly once at `destroy()` with the
  neutral capture error (`name: "RichTextCaptureUnavailable"`, `message:
  "rich-text.capture-unavailable"`). After destruction, captures return an
  already-rejected promise and `readiness()` returns
  `{ composing: false, ready: false }`.
- `destroy()` — settles every pending capture, then silences the editor.

Gesture identifiers (`gestureId`) are component-allocated; fresh block
identities come from the host-injected `allocateId` (default
`crypto.randomUUID()`, acceptable only for non-manifest hosts).

## Serialisation

`documentFromSource` segments the source into editable paragraphs (bare
inline slice as `text`) and preserved blocks (verbatim slice as `raw`),
with `text/plain` mirroring the pinned Focus `segmentText` exactly.
`sourceFromDocument` emits the canonical LF form: block serialisations
joined by a blank line with a single final newline (an emptied field
emits `""`). Separators are structural gaps owned by the manifest
host-side (spec §6.5) and the fixed `RichTextDocument` (§5.1) carries no
separator storage, so sources with non-LF separators (CRLF gaps) or
trailing blank lines do not survive this emission byte-identically; the
host-side splice (preserved `raw` plus Focus segmentation) is the
byte-identical path in production.

## Scripts

- `npm --workspace @sentropic/design-system-rich-text run build`
- `npm --workspace @sentropic/design-system-rich-text run check`
- Targeted gate: `npm --workspace @sentropic/design-system-rich-text exec -- vitest run <exact test files>`
- Package regression: `npm --workspace @sentropic/design-system-rich-text run test`

Packaging follows `packages/codemirror`: `sideEffects: false`, `files:
["dist"]`, single `"."` export, build `tsc -p tsconfig.json`, test `vitest
run src`, Tiptap/ProseMirror as peers (`^3.0.0`), exact pins in
`devDependencies` for qualification.

## Layout

- `src/model.ts` — controlled document, gesture, readiness and event types
- `src/messages.ts` — injected-label catalogue shape and marker helpers
- `src/profile.ts` — P0 extension list, profile identifier, bridge config
- `src/identity.ts` — paragraph-identity attribute contract and wiring
- `src/codec.ts` — Markdown segmentation/serialisation entries
- `src/theme.ts` — DS token bindings (data; applied by the adapter stylesheet)
- `src/editor.ts` — headless editor factory (document in, document plus
  gesture out, readiness signal, deferred capture)
- `src/*.test.ts` — RT-0 tests (RED 1–3 core halves, RED 7, RED 8 scan,
  internal reactivity witness, RED-P core half)
- `tests/fixtures/p0-corpus.md`, `tests/fixtures/list-corpus.md` — synthetic
  corpora (provenance stated in their headers)

Binding specification: `spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md` (§12, lot RT-0).
