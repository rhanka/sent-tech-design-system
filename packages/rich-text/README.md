# `@sentropic/design-system-rich-text`

Framework-neutral rich-text core for the design system (lot RT-0).

## Status

RT-0 implementation: the neutral core (controlled document model, P0
profile data, identity contract, Markdown bridge, token mapping and the
headless editor factory) is implemented and covered by `src/*.test.ts`.
The package turned publishable at the RT-1 gate, in the same commit as
its `LICENSE` and notices (spec §4.4).

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

## Entries: pure `"."` and Tiptap-bound `"./editor"`

`src/index.ts` (entry `"."`) is pure: model, messages, P0 profile
descriptors, identity attribute contract, document equality plus the §5.6
decision function and capture/readiness state (`src/document.ts`), and the
token mapping. It imports no `@tiptap/*`, `prosemirror-*`, framework or DOM
module. `src/editor.ts` (entry `"./editor"`, with the `src/editor-*.ts`
helpers) builds the real Tiptap `Editor` from the P0 extensions, carries
`paragraphId` through a live ProseMirror plugin, converts
`RichTextDocument` to and from ProseMirror, and converts editable paragraph
Markdown through `@tiptap/markdown` per paragraph only.

At the DS boundary the round-trip rule is block identity (§6.5): same order,
same identities, every paragraph `text` and every preserved `raw`
byte-identical. Full-source byte identity, separators included, is the FE-3
host splice and is asserted nowhere here.

## `createRichTextEditor` (Tiptap-bound factory surface)

`createRichTextEditor(options)` from `"./editor"` builds the real Tiptap
editor: document in, document plus gesture out. It copies the supplied
document, initialises the acknowledgement reference to that copy, and never
mutates the caller's value. Every emitted document is an independent copy
with exact keys. Split, merge, undo/redo, paste parsing and Markdown
conversion are ProseMirror/Tiptap behaviour, never re-implemented.

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

## Conversion (no DS source segmentation)

The DS ships no source segmentation and no full-source serialiser (spec
§6.5): the host Focus codec segments, and the host adapter splices returned
paragraph texts and preserved `raw` slices back at their ranges. The
`"./editor"` conversion preserves exactly the host-segmented blocks it is
given (`RichTextDocument` → ProseMirror → `RichTextDocument`: same order,
same identities, same texts, same `raw` values), and each editable
paragraph's Markdown goes through `@tiptap/markdown` per paragraph only.
Unedited paragraphs keep the exact host-segmented slice that entered, so no
block-content normalisation can manufacture false amendments.

## CL-2 delta note (FE-2 seams)

Canvas-live CL-2 (editor integration: L0 projection, live seams, composer
surface) lands in three places: the adapter surface of spec §6.2 (the Svelte
`RichTextEditor` beside the editor: `provider` / `binding` / `actor` / `lock`
/ `presence` / `capabilities` props plus the `collab.*` message keys, with
the R-API-2 `computeEffectiveEditable` computation shared from this entry),
the §6.2.1 composer surface (`src/composer-document.ts` here, the
`ComposerEditor` Svelte surface beside it), and the three §6.3 seams below.
The `LiveSessionBindingSource` contract (Yjs-backed, §5.7) is intentionally
absent: it arrives with the CL-3 Yjs binding, which resolves live sessions
against the identity-only `collaborationBinding` slot. The `profile` prop is
accepted and pinned to the P0 path; `full` arrives with CL-2F. The full badge
is CL-1B's; CL-2 renders only the composition seam (lock/presence facts as
injected text, never driving `editable`).

1. Identity discipline — the allocator injection point is the single
   identity source in both modes. The only `crypto.randomUUID()` call site
   is the `defaultAllocateId` factory (non-Focus hosts only); no session
   path (`editor*.ts`) mints identities. The composer reuses the same rule:
   its identities come from the injected `allocateId` (or a mount-local
   fallback) and never reach the chat host. Asserted by
   `src/cl2-seams.test.ts`.
2. Mode-neutral capture — `captureDocument()` returns `{ document,
   representability }` as the freeze input whichever mode produced it; no
   consumer assumes consecutive captures differ by one gesture. Witnessed by
   an external replacement between two captures yielding a second capture
   equal to the replacement (`src/cl2-seams.test.ts`).
3. Empty provider slot — `"./editor"` accepts an optional identity-only
   `collaborationBinding` at construction (`getBinding()`; `null` for
   controlled editors) and the history extension is factored to the single
   `createHistoryExtension()` replacement point where the CL-3 `UndoManager`
   (no ProseMirror history) takes the place of `UndoRedo`. Controlled mode
   loads no collaboration graph: no Yjs, `y-protocols`, Hocuspocus, Tiptap
   collaboration extension, socket or framework import in the `editor*.ts`
   graph (asserted by `src/cl2-seams.test.ts`; the `"."` entry additionally
   asserts no editor/Yjs/DOM module in `src/packaging.test.ts`, and the
   offline browser dossier asserts the built harness provider-free).

## Scripts

- `npm --workspace @sentropic/design-system-rich-text run build`
- `npm --workspace @sentropic/design-system-rich-text run check`
- Targeted gate: `npm --workspace @sentropic/design-system-rich-text exec -- vitest run <exact test files>`
- Package regression: `npm --workspace @sentropic/design-system-rich-text run test`

Packaging follows `packages/codemirror`: `sideEffects: false`, `files:
["dist"]`, exports exactly `"."` and `"./editor"`, build `tsc -p
tsconfig.json`, test `vitest run src`, Tiptap/ProseMirror as peers
(`^3.0.0`), exact pins in `devDependencies` for qualification, and
`@tiptap/markdown` as a runtime dependency reachable only from `"./editor"`.

## Layout

- `src/index.ts` — pure `"."` entry (re-exports pure modules only)
- `src/model.ts` — controlled document, gesture, readiness and event types
- `src/messages.ts` — injected-label catalogue shape and marker helpers
- `src/profile.ts` — P0 extension descriptors as data, bridge config as data
- `src/identity.ts` — paragraph-identity attribute contract as data
- `src/document.ts` — pure document logic: exact-key copy, §5.6 equality and
  decision, capture/readiness state
- `src/theme.ts` — DS token bindings (data; applied by the adapter stylesheet)
- `src/editor.ts` — `"./editor"` entry: `createRichTextEditor`
- `src/editor-extensions.ts` — P0 extension instantiation, `preservedBlock`
- `src/editor-identity.ts` — live paragraph-identity ProseMirror plugin
- `src/editor-conversion.ts` — `RichTextDocument` ↔ ProseMirror, per-paragraph
  Markdown through `@tiptap/markdown`
- `src/editor-paste.ts` — paste through the ProseMirror clipboard parser plus
  the Markdown bridge, with whole-refusal classification
- `src/collaboration.ts` — CL-1M model plus the CL-2 R-API-2
  `computeEffectiveEditable` computation (pure; also re-exported by `"."`)
- `src/composer-document.ts` — CL-2 §6.2.1 string ↔ document conversion
  (pure; blank-line paragraph split, positional identity reuse by the
  adapter, preserved `raw` verbatim on join)
- `src/cl2-seams.test.ts`, `src/composer-document.test.ts`,
  `src/composer-capture.test.ts` — CL-2 witnesses (seams, conversion, core
  capture over the real core)
- `src/*.test.ts` — RT-0 tests (document, editor, identity, gesture,
  reactivity, roundtrip, paste, no-network, packaging)
- `tests/fixtures/p0-corpus.md`, `tests/fixtures/list-corpus.md` — synthetic
  corpora (provenance stated in their headers)
- `tests/fixtures/p0-corpus.segments.json` — recorded host segmentation of
  the corpus (provenance stated in the file)

Binding specification: `spec/SPEC_EVOL_DS_RICH_TEXT_EDITOR.md` (§12, lot RT-0).
