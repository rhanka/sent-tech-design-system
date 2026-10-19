# SPEC EVOL — DS-RICH-TEXT-EDITOR: reusable controlled Tiptap editor (lot FE-2)

| Field | Value |
| --- | --- |
| Status | Specification only. No implementation, no package, no test execution is claimed by this document. |
| Date | 2026-10-19 |
| Branch | `spec/rich-text-editor`, cut from `origin/main` `2882a996` |
| Base measured | DS `origin/main` `2882a996` (this worktree); h2a merged contract at merge commit `98060bd0a` read read-only via `git -C /home/antoinefa/src/h2a show 98060bd0a:<path>`; h2a specification input `SPEC_EVOL_FOCUS_EDIT_RETURN.v3.md` SHA-256 `6d320f6627643c97a45baf47d103e0442618bbc2da4613054f8c7dd1e8b8e105` with its two GO-CODE reviews `cffe3a-last.md` and `cffe3s-last.md` (both `GO-CODE`, same SHA); sentropic read-only reference at the checkout present on disk (see §2.3). |
| Owner request | Verbatim, 18/10, relayed by the h2a conductor: « je veux reprendre asap la feature d'édition - tu pourrais reprendre tip-tap et il faut prévoir un retour ver l'IA (prévoir dans le yaml/json de retour un retour d'édition en diff par paragraphe). demande cette conception a qui de droit (je ne sais plus entre h2a/focus, design-system ...) » |
| Routing | Lot FE-2, the reusable editor component, is routed to the design system. Tag: `routed` — routed by the h2a conductor on the owner's request (see §0.1). This is not recorded as an owner verbatim decision. The h2a-side routing decision is D10 of the h2a specification. |
| Scope of this document | The DS side of lot FE-2 only: package placement, component surface, content profile P0, security, offline packaging, dependencies and licensing, provenance, the concrete FE-2 RED list, the lots inside the DS, and the interfaces with h2a lots FE-3 and FE-8. The Focus edit return itself is owned by h2a/Focus and is consumed by reference (§11, Appendix B). This specification defines no second return shape. |
| Related | [JSON render standard](SPEC_EVOL_DS_JSON_RENDER_STANDARD.md) §11.2 and the new §11.2.1 added by this delivery; h2a `docs/focus/document-editing.md` at `98060bd0a`. |

## 0. How to read this specification

### 0.1 Source tags (mandatory on every decision)

Every decision in §3 carries one primary source tag. A part that is only a proposition is tagged separately inside the decision.

| Tag | Meaning |
| --- | --- |
| `owner-verbatim` | Wording supplied as an owner quotation in the commissioning brief (the header quotation above, 18/10). Nothing beyond its literal content carries this tag. |
| `h2a-spec` | Statement taken from the binding h2a input: `SPEC_EVOL_FOCUS_EDIT_RETURN.v3.md` (decision or lot id cited), or from the merged h2a contract at `98060bd0a` where that code is the contract in force. Where the merged code differs from the v3 text, the merged code prevails and the difference is recorded (§2.2). |
| `routed` | The routing of the reusable editor component to the design system: routed by the h2a conductor on the owner's request. D10 in the h2a specification is the routing in force for this lot. |
| `ds-proposition` | A design choice made by this specification for the design system. It requires DS owner ratification where §12 states so and must never be reported as an owner requirement. |

`SHALL` / `MUST NOT` below state the proposed contract. They acquire force only at ratification of the corresponding decision.

### 0.2 Ownership boundary (not negotiable)

| Owner | Owns | Does not own |
| --- | --- | --- |
| h2a / `@sentropic/focus` | The return envelope, the editing manifest and paragraph identities, the diff, the reconciler, the digests and the schemas (`h2a-spec` D9). Merged surface: `packages/focus/src/editing/{contract,anchors,codec,diff,digest,structure,reconcile,index}.ts`, `packages/focus/schemas/focus-edit-return.v1.schema.json`, `packages/focus/schemas/focus-editing-manifest.v1.schema.json`, contract narrative `docs/focus/document-editing.md`, all at `98060bd0a`. | The editor widget, its theming, its keyboard/IME behaviour. |
| Design system (this specification) | A reusable controlled Tiptap editor component: controlled value in, transactions/change events out, opaque per-block identity attributes carried through editing, theming through DS tokens, offline-embeddable ESM/CSS. | The return envelope, the manifest, paragraph identity allocation policy, the diff algorithm, the reconciler, any digest, any schema. No Focus type, Track type, transport, persistence or business API enters the DS package. The component carries opaque identity attributes that a host-side Focus adapter supplies and reads (§5.2). |

Consequence: the DS component never imports `@sentropic/focus`, never names a Focus return field, and never computes a `baseHash`, `manifestBaseHash` or return digest. The host adapter (h2a `focus-kit`, sentropic app) is the only place where DS block identities meet Focus `paragraphId` values.

### 0.3 Evidence pinning and verification marks

- Every factual claim about either repository names its file. A claim that could not be verified on disk is marked `unverified` or `source-gap` inline and collected in §13.
- DS facts are measured on this worktree at `2882a996`. h2a facts are read through `git show 98060bd0a:<path>`; the local h2a checkout was not checked out or modified.
- sentropic facts are read-only reads of `/home/antoinefa/src/sentropic/ui/package.json`, `ui/src/lib/components/TipTap.svelte`, `ui/src/lib/extensions/tailwind-classes.ts`, `ui/src/lib/utils/markdown.ts` (§10). No sentropic file is copied.

## 1. Goal, scope, non-goals

### 1.1 Goal

Deliver the reusable controlled Tiptap editor that lot FE-2 of the h2a specification requires, so that two Svelte consumers can mount the same editor surface:

1. h2a `focus-kit`, the offline portable dossier host (first witness, lot FE-3);
2. the sentropic app, which today carries the Tiptap precedent (lot FE-7).

The editor edits source text in place, preserves opaque paragraph identities through split, merge, undo and paste, emits no change for an unchanged field, respects IME composition, carries no built-in natural language, performs no network access, and embeds into h2a's offline single-file artefact with no CDN.

### 1.2 In scope (this specification)

Section map: §4 package placement; §5 component surface (making h2a specification §5.7 concrete as an API);
§6 content profile P0 (Markdown round-trip path and its qualification, preserved non-editable blocks, and the
list-item paragraph gate); §7 security and CSP; §8 offline packaging (what the DS ships, what the host bundles);
§9 dependencies and licensing; §10 provenance; §11 tests (the FE-2 RED list made concrete); §12 lots inside
the DS; §13 interfaces with h2a lots FE-3, FE-7, FE-8 and the D23 fallback; §14 open questions to the owner;
§15 NOT covered; §16 residual factual uncertainties. No Python is used anywhere in the lots this specification
defines (implementation, tests, jobs, one-off scripts): the DS stack is Node/TypeScript and native tooling
already present.

### 1.3 Out of scope

See §15 for the exhaustive NOT-covered list. In particular: the Focus return, manifest, diff and reconciler (h2a FE-0/FE-1/FE-5); any toolbar product decision beyond keyboard and Markdown input rules in P0; React/Vue/Angular adapters claimed as delivered before their stage gate (§4.3); table/diagram/code editing; collaborative editing.

## 2. Starting point (measured)

### 2.1 The design system at `2882a996`

- Workspaces are `packages/*` and `apps/*` (root `package.json`, `workspaces`). Root scripts: `build`, `check`, `test` (which runs `node --test scripts/*.test.mjs` then workspace tests), `lint`, `notices:generate` (`scripts/generate-third-party-notices.mjs`), `licensing:check` (`scripts/verify-publishable-licensing.mjs`), `verify` (licensing + check + test + `pack:smoke`, `scripts/smoke-pack.mjs`). Targeted lot commands in §12 use these exact scripts.
- Framework component packages: `packages/components-svelte` (`@sentropic/design-system-svelte` 0.36.0 at measurement), `packages/components-react` (`@sentropic/design-system-react` 0.38.0), `packages/components-vue` (`@sentropic/design-system-vue` 0.38.0), `packages/components-angular` (`@sentropic/design-system-angular` 0.38.0). Each publishes a single root export today; `packages/components-svelte/package.json` declares `exports` with only `"."` (`svelte`/`types`/`import` → `./dist/index.js`), `files: ["dist", "!dist/**/*.test.js", …]`, `peerDependencies: { "svelte": "^5.53.2" }`, `sideEffects: ["**/*.css"]`.
- The Svelte library barrel is `packages/components-svelte/src/lib/index.ts` (one `export { default as X }` per component). A plain `Button`/`Card` import therefore loads the barrel module graph. Any Tiptap-bearing export placed on that barrel would load Tiptap for every consumer; §4 forbids that placement.
- Framework-neutral precedent: `packages/codemirror` (`@sentropic/design-system-codemirror` 0.1.0, `packages/codemirror/package.json`). It wraps CodeMirror as a peer dependency (`peerDependencies`: `@codemirror/language ^6`, `@codemirror/state ^6`, `@codemirror/view ^6`, `@lezer/highlight ^1`), ships only `dist` (`files: ["dist"]`, `sideEffects: false`), exposes a single `"."` export, and its entire runtime surface is a theme factory: `packages/codemirror/src/index.ts` exports `sentTechCodeMirror` and `SentTechCodeMirrorOptions` from `packages/codemirror/src/theme.ts`, which maps CodeMirror classes onto `--st-*` DS tokens. Build is `tsc -p tsconfig.json`; test is `vitest run src`. This is the packaging shape §4 mirrors for Tiptap.
- Other neutral cores exist and stay private until their own publication decision: `packages/diagram-core`, `packages/diagram-canvas` (both `private: true`, zero-DOM contracts), `packages/dataviz-core` (framework-agnostic store), `packages/graph` (`@sentropic/graph` 0.3.0, subpath exports `./processing`, `./worker`, `./layout-client` in `packages/graph/package.json` — the subpath-export precedent for an explicit non-barrel entry).
- Component test environment: `packages/components-svelte/vite.config.ts` uses `@sveltejs/vite-plugin-svelte` plus `@testing-library/svelte/vite` (`svelteTesting()`) with `test.environment: "jsdom"` and `testTimeout: 20000`. React and Vue packages use the same jsdom shape (`packages/components-react/vite.config.ts`, `packages/components-vue/vite.config.ts`). Real-browser precedent in this repository is not Vitest browser mode; it is `puppeteer-core` (root `package.json` devDependency `puppeteer-core ^25.1.0`) and `playwright-core` driven against a system Chromium, e.g. `scripts/visual-rounded-seam-audit.mjs` (`puppeteer.launch({ executablePath: … })`), `scripts/verify-theme-privacy.mjs` (`playwright-core` `chromium.launchPersistentContext`), `packages/skills/src/engine/parityAudit.ts` (dynamic `playwright-core` import, system Chrome auto-detection), `packages/graph/tests/golden/cdp-harness.mjs`. §11 uses jsdom for the assertions jsdom can carry and that puppeteer-core harness shape for IME/selection, which jsdom cannot.
- Theming: themes are CSS custom properties `--st-*` scoped by `[data-st-theme="<id>"]` (`packages/themes/css/sent-tech.css`, generated by `packages/themes/scripts/build-css.mjs`). Component anatomy tokens follow the `--st-component-<name>-…` pattern with semantic fallbacks (e.g. `packages/components-svelte/src/lib/CodeSnippet.svelte`: `--st-component-codeSnippet-background` falling back to `var(--st-semantic-surface-subtle)`; `Button.svelte` reads `--st-component-button-anatomy-*`). §5.8 follows that pattern.
- No Tiptap or rich-editor component exists in the DS at measurement: `grep -r "tiptap" packages/ apps/ scripts/` returns no match outside this specification's own tree. `packages/components-svelte/src/lib/ChatComposer.svelte` is a `<textarea>` composer (`value = $bindable("")`, `disabled`, injected `sendLabel`/`stopLabel`/`sendAriaLabel`/`stopAriaLabel`/`inputAriaLabel` props with French defaults in the current source — the injected-label shape to follow, not its default values). `docs/chat-ui-roadmap.md` and h2a capital K9 record the earlier decision to keep the rich editor app-local; this specification supersedes that posture only for the FE-2 surface, under the routing tag.
- Licensing guard: `scripts/verify-publishable-licensing.mjs` asserts, for every workspace whose manifest is not `private: true` (the single definition in `scripts/generate-third-party-notices.mjs`, `publishableWorkspaces`), a non-placeholder `license` field, a `LICENSE` file of at least 300 bytes, a current `LICENSE.THIRD-PARTY.md` (re-derived by `scripts/generate-third-party-notices.mjs` from `package-lock.json`), and real tarball membership via `npm pack --dry-run --json`. Its test `scripts/verify-publishable-licensing.test.mjs` currently asserts `publishable.length === 18` (measured live: 18 publishable workspaces, `packages/codemirror` through `packages/tokens`). Adding a nineteenth publishable package changes that count in the same commit and must regenerate notices (`npm run notices:generate`) or the gate fails. `scripts/smoke-pack.mjs` packs tarballs and deep-imports real entry points in a throwaway project; it is the packaging witness §11 extends.

### 2.2 The h2a contract in force (merged code prevails over the v3 text)

Read read-only at `98060bd0a` (`git -C /home/antoinefa/src/h2a show 98060bd0a:<path>`). The v3 specification (`SPEC_EVOL_FOCUS_EDIT_RETURN.v3.md`) is the design input; where the merged code differs, the merged code is the contract in force and the difference is recorded here:

| # | Topic | v3 text | Merged code at `98060bd0a` (contract in force) |
| --- | --- | --- | --- |
| M1 | Manifest fields | §5.1 lists `schemaVersion`, `manifestId`, `documentRef`, `baseHash`, `manifestBaseHash`, `fields[]`, `paragraphs[]`; `manifestBaseHash` is the only excluded field. | `packages/focus/src/editing/contract.ts`: `FocusEditingManifest` adds `retiredParagraphIds: string[]` as durable mapping data (retired identities never reallocated), included in the digest projection. `docs/focus/document-editing.md` flags this concrete field as needing the FE-0 Focus/DS review before merge. The DS consumes the merged shape by reference; it does not redefine it. |
| M2 | Change anchors | D14/§5.2: structural anchors `parentId`, `previousParagraphId`, `nextParagraphId` with explicit `null` boundaries. | `contract.ts`: each `ParagraphChange` carries both `beforeAnchors: Anchors \| null` and `anchors: Anchors`; `Anchors.parentId` is the literal `null` in v1 (no nested parent yet). `packages/focus/src/editing/diff.ts` enforces that `replace`/`delete` keep `anchors` equal to `beforeAnchors`. The DS transaction shape in §5.3 mirrors both anchor sets so a host adapter can map without recomputing topology. |
| M3 | Field and format vocabulary | §5.1: `contentFormat` is `text/plain` or "the declared Markdown profile identifier". | `contract.ts`: `Format = 'text/plain' \| 'focus.markdown.p0@1'`; `Address.field` is the closed enum `markdown \| question \| recommendedAnswer \| context \| label \| body \| consequence`; `EditingField.blockKind` is `prose \| question \| option`; `Paragraph.blockKind` is the constant `'paragraph'`, `parentId: null`, `range: { start, end, unit: 'utf16' }`. The DS profile identifier in §6 is exactly `focus.markdown.p0@1`. |
| M4 | Return envelope optionality | §5.2: `supersedesReturnId` optional, `supersededReturnIds[]` required, complete transitive ancestry (D16/D17/D21). | `contract.ts` + `structure.ts` (`packages/focus/src/editing/structure.ts` is the single source for both JSON Schemas): only `supersedesReturnId` is optional; absence means a lineage root with `supersededReturnIds: []`. The return embeds the full `manifest`, `capture: { at }`, `scope: { workspaceId } \| null`, `production: { producerId, generationId, requestId } \| null`, typed `answers[]` (`questionId`, `targetRef`, `optionIds`, `text`) and `notes[]` (`targetRef`, `text`). The DS defines none of this; §13 states what FE-3 passes to the adapter that builds it host-side. |
| M5 | Source codec vs editor codec | §5.3: FE-0 must name the parser/codec pair Markdown ↔ editor ↔ Markdown; a declared `tiptap-markdown` version is not a round-trip proof (U1). | `packages/focus/src/editing/codec.ts`: the Focus source codec is `@lezer/markdown@1.8.0` (CommonMark + GFM) retaining exact source slices with a CRLF/CR offset map; it does not regenerate Markdown from an AST. `docs/focus/document-editing.md` states this is a source-codec profile, not a qualified Tiptap round trip. Lists remain excluded until the real DS Tiptap/Markdown codec passes FE-2. The DS codec in §6 is therefore a separate qualification object; it must prove equivalence with the `focus.markdown.p0@1` segmentation, not assume it. |
| M6 | Segmentation | D20: practical paragraph defined by declared semantic segmentation, never blank-line splitting. | `codec.ts`: Markdown editable units are top-level `Paragraph` nodes whose children are only `Emphasis`, `StrongEmphasis`, `InlineCode`, `HardBreak`, `CodeMark`, `EmphasisMark`, `Escape`, `Entity` (a paragraph containing a link, image or raw HTML is not editable). Plain fields segment one unit per block of non-blank lines with exact offsets, no trimming. `anchors.ts`: an emptied plain field keeps one empty unit (`""` is content, D14). §6 adopts the same editable-set boundary for the Tiptap profile. |
| M7 | Identity seeding | D13: seeded once deterministically, seed position is not permanent identity. | `anchors.ts`: `seedManifest` derives `paragraph:<sha256-slice>` from `baseHash`, field key and order, and `manifest:<slice>`; subsequent revisions use `carryManifest` with explicit ranges and retained IDs and must not reseed. The DS component never seeds; the host adapter supplies identities (§5.2). |

No other material difference was found between the v3 text and the merged editing modules (`digest.ts`: RFC 8785 canonical JSON, UTF-8, SHA-256 `sha256:` prefix, `manifestBaseHash`/`digest` computed with the field removed — absent, not `null`; `reconcile.ts`: pure, data in/data out, lineage state passed in, fail-closed branches (3a)–(3e) of §5.4). Package facts at `98060bd0a`: `packages/focus/package.json` is `@sentropic/focus` 0.5.0, `license: MIT`, exports `./editing` plus `./schemas/focus-edit-return.v1` and `./schemas/focus-editing-manifest.v1`; the root export carries editing types only so render-only consumers do not load the codec. `docs/focus/document-editing.md` states the first editing increment is not qualified, FE-3 stops because the published DS package has no `RichTextEditor`, and no fallback editor is authorised there — the DS-side view of that stop is §13.2.

### 2.3 sentropic behavioural reference (read-only)

- `ui/package.json` (read on disk): `dependencies` include `@tiptap/core ^3.6.5`, `@tiptap/pm ^3.6.5`, `@tiptap/starter-kit ^3.6.5`, `@tiptap/extension-placeholder ^3.14.0`, `tiptap-markdown ^0.9.0`; `package-lock.json` resolves `@tiptap/core` to `3.29.0`. The h2a specification and the commissioning brief cite `^3.31.3` as the sentropic pin. That value was not observed in the file read for this specification and is recorded as `source-gap` (§16): the version line in force for §9 is derived from the observed file, and any re-pin is measured at lot start, never assumed from the brief.
- `ui/src/lib/components/TipTap.svelte`: a Svelte 4-style component (`export let value`, `createEventDispatcher`) constructing `@tiptap/core` `Editor` with `StarterKit` (list/heading extensions disabled and replaced), `tiptap-markdown` `Markdown`, and `Placeholder`. Behavioural capital to preserve, not code to copy (§10): Markdown emitted from `editor.storage.markdown.getMarkdown()` on update with a `lastValue` guard; external `value` changes applied via `setContent` only when the editor is not focused (focus guard), except a forced reset when the parent clears the value; selection saved before `setContent` and restored when the saved offsets remain valid; `disabled` drives `editable: !disabled` at construction and `editor.setEditable(!disabled)` reactively; `editor.destroy()` on destroy. Its `forceList` transaction/keydown machinery and Tailwind-class extensions (`ui/src/lib/extensions/tailwind-classes.ts`: `BulletList`/`OrderedList`/`ListItem`/`Heading` subclasses injecting Tailwind classes in `renderHTML`) are app styling coupling and are not carried into the DS.
- `ui/src/lib/utils/markdown.ts`: `normalizeMarkdownLineEndings` (CRLF/CR → LF, line endings only), use-case normalisation, `arrayToMarkdown`/`markdownToArray`, and a `marked` + `DOMPurify` render path with an explicit allow-list. The DS editor performs no HTML rendering of Markdown and inherits none of this file; its line-ending and empty-paragraph edge cases inform the round-trip corpus in §11 only.
- The business wrapper `EditableInput.svelte` (debounced autosave, `apiPut`, app stores, locks) stays in sentropic (h2a capital K8, lot FE-7). The viewer/locked rule — a viewer can neither type nor trigger any save, including via paste and shortcuts (`spec/COLLAB.md:346` as cited by the h2a specification) — is a component requirement in §5.4 and a RED item in §11.

## 3. Decisions

One decision per item required by the commission. Each decision carries its source tag; a proposition part inside a decision is tagged separately.

### RT-D1 — Package placement: neutral core package plus thin framework adapters, Svelte first — `ds-proposition` (consumers and subpath constraint: `h2a-spec` D10/§5.7, FE-2)

A dedicated framework-neutral package wraps Tiptap, and thin framework components sit on top of it. Svelte is the only adapter delivered in the first stage. The full reasoning, stage gates and the rejected Svelte-only placement are in §4.

### RT-D2 — Component surface is controlled, transaction-emitting, identity-carrying and language-free — `h2a-spec` §5.7/D14 (API concretisation: `ds-proposition`)

The component defined in §5 is controlled (value in, change/transactions out), carries the opaque per-block identity attribute of §5.2 through split, merge, undo and paste under the D14 rules, exposes `editable`/`disabled`/read-only states with immediate effect, surfaces external controlled updates during typing instead of overwriting, respects IME composition, takes every label and message by injection with the `untranslated` marker of §5.7, themes through DS tokens, mounts on demand, unmounts without listeners, and performs no network access.

### RT-D3 — Content profile P0 is paragraphs with bold/italic/inline-code only; everything else is preserved — `h2a-spec` D20 (profile concretisation aligned to merged `codec.ts`: `h2a-spec` M5/M6)

P0 (§6) enables `doc`, `paragraph`, `text`, `hardBreak` and the marks `bold`, `italic`, `code` under the profile identifier `focus.markdown.p0@1`. Headings, lists, tables, code blocks, diagrams, blockquotes, links, images and raw HTML are preserved as non-editable blocks and are never destroyed. The list-item paragraph question (h2a V7) is gated by a round-trip test whose verdict is recorded (§6.4); until that test passes, list items stay preserved.

### RT-D4 — Hostile paste is inert or rejected; no remote fetch — `h2a-spec` D14/§5.6 (mechanism: `ds-proposition`)

Paste is parsed against the P0 schema only. Scriptable markup, event handlers, raw HTML, scriptable link protocols and remote images never become executable or fetchable content (§7). The component is compatible with a host CSP of `connect-src 'none'` because it issues no request of any kind.

### RT-D5 — Offline packaging: DS ships ESM + CSS, the host bundles everything, no CDN — `owner-verbatim` D5 + `h2a-spec` D5 (DS ship/bundle split: `ds-proposition`)

Reading, editing, undo, diff preview support, export support and import support inside the component require no network and no server (§8). The DS publishes ESM entry points and one CSS file (plus types); the host bundles the component, Tiptap, ProseMirror and the resolved message catalogue into its single-file artefact.

### RT-D6 — Tiptap v3 line as peer dependencies, MIT-only, no Pro or cloud extension — `ds-proposition` (sentropic pin as observed: §2.3)

The neutral package declares Tiptap and ProseMirror as peer dependencies on the v3 line (§9), pins exact versions only in `devDependencies` and the lockfile for its own tests, and admits no Tiptap Pro or cloud extension. The licensing guard of §2.1 governs the new package from its first publishable state.

### RT-D7 — Provenance: behavioural reference only, fresh DS implementation — `h2a-spec` FE-2 capital list (DS enforcement: `ds-proposition`)

sentropic `TipTap.svelte`, `tailwind-classes.ts` and `markdown.ts` are read as behavioural reference only (viewer/locked rule, focus guard, debounce semantics). The DS component is written fresh in the DS; no file is copied (§10). The `EditableInput` business wrapper stays in sentropic. No code from any decision-dossier kit and no code from other repositories' `src/` beyond that read-only reference enters the DS.

### RT-D8 — The FE-2 RED list is eight concrete test items plus a packaging witness — `h2a-spec` FE-2 RED 1–8

Each RED item has an exact test file, a named environment (DS jsdom setup, or the repository's puppeteer-core real-browser harness where jsdom cannot carry the assertion) and an observable assertion (§11). The packaging witness — a plain component import never pulls the Tiptap subpath, and `pack:smoke` plus the licensing guards stay green — is part of the same gate.

### RT-D9 — Lots inside the DS run core first, Svelte adapter next, other frameworks staged — `ds-proposition`

Four DS lots (RT-0 to RT-3, §12), RED first, with exact `[N]` files, targeted commands taken from the real `package.json` scripts, and a gate per lot. Framework parity is never claimed for an adapter whose stage gate has not passed.

### RT-D10 — h2a interfaces: FE-3 consumes the pinned DS subpath; D23 fallback seen from the DS side; FE-8 consumes marker and invariants — `h2a-spec` FE-3/D23/FE-8

FE-3 consumes the published DS artefact at an exact pinned version (§13.1). The single allowed D23 fallback lives in h2a `focus-kit`, never in the DS tree, and its replacement gate from the DS side is defined in §13.2. FE-8 receives from the DS the `untranslated` marker form (§5.7) and the measurable reactivity invariants of §13.3. D10 itself is recorded as `routed`: routed by the h2a conductor on the owner's request.

### RT-D11 — The consumed Focus editing contract is recorded by reference in the JSON render standard — `h2a-spec` D9/H-1

`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md` gains one short subsection (§11.2.1) that records the consumed, pinned Focus editing contract by reference only: contract owner, pinned package and schema versions, and a pointer to this specification. It writes no second definition of the return (§13.4).

### RT-D12 — Open questions are only those the DS cannot settle from sources — `ds-proposition`

Three questions (§14), each with a recommendation. Everything else in this specification is settled from the sources cited.

## 4. Package placement (RT-D1)

### 4.1 Options considered

| Option | Shape | Assessment |
| --- | --- | --- |
| 1. Dedicated framework-neutral package + thin framework adapters | `packages/rich-text` (`@sentropic/design-system-rich-text`) wrapping `@tiptap/core` with Tiptap as peer dependencies, the way `packages/codemirror` wraps CodeMirror; adapters in `components-svelte` (then react/vue/angular) | Chosen. See §4.2. |
| 2. Svelte only, inside `packages/components-svelte` (the placement the h2a specification's FE-2 file list names: `packages/components-svelte/src/lib/RichTextEditor.svelte`, `src/lib/rich-text/profile.ts`, `paragraph-identity.ts`) | One Svelte component carrying the Tiptap schema, identity plugin and codec bridge | Rejected as the sole placement. It couples the framework-neutral profile/codec to one framework's package, makes the React/Vue/Angular stage a re-implementation instead of an adapter, and puts Tiptap one barrel edit away from every Svelte consumer. Its file names remain useful as the Svelte adapter's internal layout (§12, RT-1) once the neutral core exists. |
| 3. Thin framework components with no neutral package (each framework package wraps Tiptap directly) | Four independent Tiptap integrations | Rejected. The profile, identity carriage and codec bridge would be implemented four times and could drift; the h2a specification forbids maintaining competing editors (D23) and the same discipline applies inside the DS. |

### 4.2 Decision and reasoning

**Decision (`ds-proposition`):** create `packages/rich-text` as `@sentropic/design-system-rich-text`, a framework-neutral package that

- wraps `@tiptap/core` with Tiptap/ProseMirror as `peerDependencies` (mirroring `packages/codemirror/package.json`: peer range on the major line, exact pins only in `devDependencies` for its own build/tests);
- owns the framework-neutral half of the editor: the P0 extension list and schema, the `preservedBlock` node, the paragraph-identity ProseMirror plugin, the Markdown codec bridge (`focus.markdown.p0@1`), the controlled-document model and transaction types, and the DS-token theme mapping for ProseMirror classes (mirroring `packages/codemirror/src/theme.ts`);
- ships `sideEffects: false`, `files: ["dist"]`, ESM + types, build `tsc -p tsconfig.json`, test `vitest run src` (the `packages/codemirror` script shape);
- is consumed by thin framework adapters that own only mounting, prop/event idioms and lifecycle.

Reasoning, against the three constraints in the commission:

1. **A plain Button/Card import never loads Tiptap (`h2a-spec` §5.7/FE-2: explicit subpath export).** The neutral package is a separate workspace, so no `components-*` barrel can pull it transitively unless an adapter does. Inside `packages/components-svelte`, the adapter is exposed only through the explicit subpath export `@sentropic/design-system-svelte/rich-text-editor` (added to `packages/components-svelte/package.json` `exports` alongside the existing `"."`; the barrel `src/lib/index.ts` gains no rich-text export). A consumer importing `@sentropic/design-system-svelte` (Button, Card) resolves `"."` and never resolves the subpath module graph. This is witnessed by the packaging test of §11 (RED-P).
2. **DS framework parity rule.** The DS delivers components across Svelte/React/Vue/Angular and guards parity by measurement, not by type similarity (`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md` §5.1/AC-L1: parity recorded per component, never claimed from types alone; `docs/graph-dataviz-migration-plan.md` lot A4: adapters are declared equivalent only after a real vertical scenario). A neutral core with staged thin adapters is the only placement under which a later React/Vue/Angular adapter reuses the qualified profile and codec instead of re-qualifying them. Parity is claimed per stage, never in advance (§4.3).
3. **Consumers that exist now.** Both current consumers are Svelte: h2a `focus-kit` (`packages/h2a/focus-kit/src/App.svelte` at `98060bd0a`, Svelte) and the sentropic app (`ui/src/lib/components/TipTap.svelte`, Svelte). No React, Vue or Angular consumer of a rich editor exists in the sources read. Delivering the neutral core plus the Svelte adapter first serves both real consumers and keeps the other three adapters as a staged, gated extension rather than speculative work.

### 4.3 Stages and gates (parity is staged, never pre-claimed)

| Stage | Delivers | Gate (all must hold before the stage is announced) |
| --- | --- | --- |
| Stage 1 (this delivery's implementation lots RT-0 + RT-1 + RT-2) | Neutral core `packages/rich-text`; Svelte adapter `@sentropic/design-system-svelte/rich-text-editor`; P0 qualification (§6) | RT-0/RT-1/RT-2 gates (§12) green with command output; packaging witness (§11) green; licensing guard green at the new publishable count. Announced exactly as: "rich text editor available for Svelte; core framework-neutral; React/Vue/Angular not delivered." |
| Stage 2a | React adapter `@sentropic/design-system-react/rich-text-editor` on the same core | Same RED list (§11) executed against the React adapter surface in `packages/components-react`; a real vertical scenario (mount, edit, split/merge, paste, unmount) executed, not type-checked only; parity recorded in the delivery note with any residue named. |
| Stage 2b | Vue adapter `@sentropic/design-system-vue/rich-text-editor` on the same core | Same as Stage 2a, in `packages/components-vue`. |
| Stage 2c | Angular adapter `@sentropic/design-system-angular/rich-text-editor` on the same core | Same as Stage 2a, in `packages/components-angular`, including the package's build-then-test script shape (`npm run build && vitest run`). The Angular linker path is exercised by that package's own test run; `pack:smoke`'s documented Angular limitation (JIT fallback, no linker) is stated in the delivery note, not hidden. |

No stage blocks Stage 1. A stage that has not passed its gate is reported as not delivered; the catalogue/docs must not list the adapter as available.

### 4.4 Package facts fixed at creation

- Name `@sentropic/design-system-rich-text`, version `0.1.0`, `"type": "module"`, `license: "MIT"` (the licence every current DS package declares, e.g. `packages/codemirror/package.json`), `publishConfig.access: "public"` when it becomes publishable (§14 Q1 governs the initial `private` posture), repository directory `packages/rich-text`.
- The package starts `private: true` during RT-0 and flips to publishable only at the RT-1 gate, in the same commit that adds its `LICENSE`, generates its `LICENSE.THIRD-PARTY.md` (`npm run notices:generate`), updates the publishable count asserted by `scripts/verify-publishable-licensing.test.mjs` (18 → 19), and extends `scripts/smoke-pack.mjs` coverage if the lot chooses to deep-import it (the smoke script's own header states its coverage limits; leaving the new package outside the deep-import list must be a recorded choice, not an oversight).
- No dependency from any `@sentropic/design-system-*` package onto `@sentropic/dataviz-*`, `@sentropic/diagram-core` or `@sentropic/diagram-codecs` is introduced (guard: `scripts/verify-layering.test.mjs`). The new package depends on none of them; adapters depend on the new package and on their framework only.

## 5. Component surface (RT-D2)

This section makes h2a specification §5.7 precise as an API. Names below are the DS API (`ds-proposition` concretisation); semantics tagged `h2a-spec` are binding from §5.7/D14.

### 5.1 Controlled document model (framework-neutral, in `packages/rich-text`)

The component is controlled: the host owns the value; the component never owns a durable copy.

```ts
// packages/rich-text/src/model.ts (RT-0, [N])
export type RichTextFormat = "focus.markdown.p0@1" | "text/plain";

export interface RichTextBlock {
  /** Opaque per-block identity, host-supplied. See §5.2. */
  paragraphId: string;
  kind: "paragraph" | "preserved";
  /** Editable paragraph text (Markdown inline source for
      `focus.markdown.p0@1`, literal text for `text/plain`).
      Present iff kind === "paragraph". */
  text?: string;
  /** Verbatim source slice of a preserved block. Present iff
      kind === "preserved". Never edited, never reserialised. */
  raw?: string;
  /** Preserved block kind as segmented host-side (e.g. "heading",
      "list", "table", "codeBlock", "diagram"). Display only. */
  preservedKind?: string;
}

export interface RichTextDocument {
  format: RichTextFormat;
  blocks: readonly RichTextBlock[];
}
```

- The wire shape between DS and host is `RichTextDocument`, not Tiptap JSON and not ProseMirror positions (`h2a-spec` §5.7: ProseMirror positions and Tiptap JSON never leak into the wire contract). The neutral core converts `RichTextDocument` ↔ ProseMirror document internally.
- For `text/plain` fields the document holds exactly the plain-field segmentation the host adapter derived from the Focus manifest (one block per plain paragraph; an emptied plain field is one block with `text: ""`, §2.2 M6). The component does not re-segment plain text.
- For `focus.markdown.p0@1` the host adapter derives blocks from the Focus source codec segmentation (editable paragraphs vs opaque slices, §2.2 M5/M6) or from the DS codec bridge of §6.3 where the lot qualifies it; preserved slices travel as `raw` and return byte-identical.

### 5.2 Opaque per-block identity attribute

- **Name.** The identity is the ProseMirror node attribute `paragraphId` on `paragraph` and `preservedBlock` nodes, rendered to the DOM as `data-paragraph-id` (and `data-preserved-block` on preserved blocks). It is a single opaque string, unique within the document, allocated by the host. The component treats it as opaque: it never parses, derives, sorts by or displays it as content.
- **Supply.** The host adapter supplies identities through the initial `RichTextDocument` (one `paragraphId` per block). New identities created inside the editor (split tail, pasted blocks, inserted paragraphs) are allocated through the injected allocator (§5.5, `allocateId`); the component has no identity policy of its own. If the host supplies no allocator, the core default is `crypto.randomUUID()` — acceptable only for non-Focus hosts, because Focus allocation policy (deterministic seeding, retired-ID non-reuse) belongs to the producer/host (`h2a-spec` D13, merged `anchors.ts`), never to the component.
- **Carriage (D14, `h2a-spec`).**
  - *Split (Enter):* the leading paragraph keeps the original `paragraphId`; every following paragraph receives a fresh allocated identity.
  - *Merge (Backspace at paragraph start / Delete at end):* the leading paragraph's identity survives; consumed identities are retired inside the editor session and are never reallocated by the component.
  - *Undo/redo:* undo of a removal restores the same logical paragraph's identity (the identity is part of the ProseMirror node, so history restores it by construction; the RED list asserts it, §11 RED 3).
  - *Internal copy/paste:* pasted copies receive fresh allocated identities; a paste never duplicates a live identity inside the document.
  - *External paste:* pasted markup never supplies a trusted identity. The paste pipeline strips any `data-paragraph-id` (and any `paragraphId` attribute) from incoming content before it enters the document, then allocates fresh identities (§7). This rule has no exception, including paste of content copied from the same editor in another window.
- **Non-identity.** Display order, array index, DOM path, translated label, content hash and character offset are never used as identity anywhere in the component (`h2a-spec` D13). Selection and caret are ProseMirror positions internally and are never emitted as identity.

### 5.3 Transactions and change events out

```ts
// packages/rich-text/src/model.ts (RT-0, [N])
export interface RichTextAnchors {
  parentId: null;
  previousParagraphId: string | null;
  nextParagraphId: string | null;
}

export interface RichTextChange {
  paragraphId: string;
  operation: "replace" | "insert" | "delete" | "move";
  /** Exact before/after paragraph text. `null` means absent;
      `""` is content (h2a-spec D14). */
  before: string | null;
  after: string | null;
  beforeAnchors: RichTextAnchors | null;
  anchors: RichTextAnchors;
}

export interface RichTextTransaction {
  transactionId: string;
  changes: readonly RichTextChange[];
}

export interface RichTextChangeEvent {
  /** The complete new controlled value. */
  document: RichTextDocument;
  /** Coalesced delta against the last controlled value the host
      supplied or acknowledged. Undoing everything yields an
      event whose transactions carry zero changes. */
  transactions: readonly RichTextTransaction[];
}
```

- One editing gesture that the user perceives as one change (a split, a merge, a paste, a committed IME composition) emits one transaction grouping its paragraph changes (`h2a-spec` D14: split and merge are grouped paragraph changes inside one atomic transaction). Repeated typing in one paragraph coalesces against the last controlled value: the emitted delta is baseline-relative, and an unchanged paragraph is never emitted as a change.
- The host adapter maps `RichTextChange` onto the Focus diff host-side (merged `packages/focus/src/editing/diff.ts` computes the same operations from identity-bearing values; the adapter may either translate DS transactions or re-diff the emitted `document` against its baseline with `diffParagraphs` — it must not implement a second diff algorithm with different semantics, §13.1).
- No event is emitted for opening, focusing, rendering, locale/theme change, or leaving an unchanged editor (`h2a-spec` D12, FE-2 RED 2). No event is emitted mid-IME-composition (§5.6).

### 5.4 `editable` / `disabled` / read-only states

Framework adapters expose the same three-state semantics in their framework idiom; the Svelte adapter (RT-1) exposes:

| Prop | Default | Meaning |
| --- | --- | --- |
| `editable` | `true` | The field may be edited when `true`. `false` is the read-only state: text stays selectable and copyable, the caret may be placed, no mutation is possible. |
| `disabled` | `false` | The form-disabled state: not focusable, `aria-disabled`, no selection interaction. `disabled: true` wins over `editable`. |

- Effective editing is `editable && !disabled`. Both props take effect immediately on the live editor (`editor.setEditable(...)`), without remounting.
- In a non-editable state, typing, paste, drop, cut and every mutation shortcut are inert: no document mutation, no transaction, no save-like callback (`h2a-spec` §5.7; viewer/locked rule §2.3). This includes the viewer case: a host rendering for a viewer passes `editable={false}` (or `disabled`) and the RED list asserts the lock through paste and keyboard paths, not only typing (FE-2 RED 1).
- State changes never emit a change event and never alter the document.

### 5.5 Component props and callbacks (Svelte adapter surface; other adapters mirror it)

```ts
// packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.svelte (RT-1, [N])
export interface RichTextEditorProps {
  value: RichTextDocument;
  editable?: boolean;
  disabled?: boolean;
  messages: RichTextMessages;          // §5.7, all labels injected
  allocateId?: () => string;           // §5.2, host identity allocator
  class?: string;
  onChange?: (event: RichTextChangeEvent) => void;
  onExternalConflict?: (event: RichTextExternalConflictEvent) => void;
  onUnsupportedPaste?: (event: RichTextUnsupportedPasteEvent) => void;
}
```

- `value` is controlled. The component keeps an internal editor document initialised from `value` and emits `onChange`; it does not mutate the prop.
- `onExternalConflict` is the surfacing channel of §5.6. `onUnsupportedPaste` reports paste content that the profile rejected or preserved (§7) so the host can show its own notice through injected messages; the component shows no built-in notice text.
- No prop carries a Focus type, a Track type, a URL, a transport, a store or a business callback. There is no `onSave`, no autosave, no debounce-to-network semantics in the component; a host may debounce its own reaction to `onChange` (the sentropic debounce capital stays host-side, §10).

### 5.6 External controlled updates during typing; IME composition

**External updates (`h2a-spec` §5.7).** When the `value` prop changes after mount:

1. If the incoming document is identical to the last emitted/acknowledged document, it is ignored (echo suppression; this is the `lastValue` guard capital of §2.3).
2. Else if the editor is clean (no local divergence from the last acknowledged value) or not focused, the update is applied: content is replaced and the selection is restored when the saved ProseMirror positions remain valid in the new document, otherwise clamped to the nearest valid position (the selection-preservation capital of §2.3, generalised from offsets to block identities: selection is re-anchored by `paragraphId` plus intra-paragraph offset where the block survives).
3. Else (the user has local, unacknowledged work, is typing, or is composing): the incoming value **never overwrites** local work. The component keeps the local document and caret untouched and emits `onExternalConflict` carrying the incoming document and the local document. The host decides (keep local, accept external by remounting with a new key, or reconcile); the component applies no silent winner. A parent clearing the value to empty is an external update under the same rule — the sentropic precedent's focused-clear exception is not carried over, because §5.7 requires surfacing, never overwriting; hosts that need a forced reset remount explicitly.

**IME composition (`h2a-spec` §5.7).** The editor respects ProseMirror composition state: during `compositionstart`–`compositionend`, no `onChange` is emitted, no external update is applied, and no export-relevant snapshot can be taken from the component (the host's freeze reads the last emitted document, §13.1). The committed composition emits exactly one coalesced change. Accents, composed characters and emoji are ordinary text once committed. This behaviour requires a real browser for its witness (§11 RED 5); jsdom does not implement composition.

### 5.7 Injected labels, messages and the `untranslated` marker

```ts
// packages/rich-text/src/messages.ts (RT-0, [N])
export interface RichTextMessages {
  editorLabel: string;        // accessible name of the editing region
  placeholder: string;        // shown only when editable and empty
  preservedBlockLabel: string; // accessible name template for a preserved block, "{kind}" interpolated
  externalConflictLabel: string;
}
```

- Every user-visible or accessibility string comes from `messages`. The component source contains no natural-language literal for these strings (FE-2 RED 8 asserts this by rendering with sentinel messages and scanning the DOM; a source scan asserts no built-in label remains).
- **Marker form (fixed with FE-8, `h2a-spec` D7/§5.8, U9).** When a message key is absent from the supplied catalogue, the component renders the explicit marker `⟦untranslated:rich-text.<key>⟧` as the visible/accessible text and sets `data-untranslated="rich-text.<key>"` on the same element. Example: `⟦untranslated:rich-text.editorLabel⟧`. The marker is neutral, key-based and visibly flagged; it is never replaced by a hard-coded French or English string, never presented as a translation, and the requested locale still applies to the host document `lang`. The DS fixes this exact form; FE-8 lists marker-only locales as untranslated in its build report (§13.3). A stricter host policy that blocks on untranslated keys is a separately ratified host policy, never a consequence of this component.
- Changing `messages` (locale switch) re-renders labels in place: no remount, no identity change, no change event, caret/selection/scroll preserved (`h2a-spec` D22 invariants, §13.3).

### 5.8 Theming through DS tokens

- All visual styling reads DS tokens: component anatomy variables `--st-component-richTextEditor-*` with semantic fallbacks, following `CodeSnippet.svelte`/`Button.svelte` (§2.1). No colour, spacing, radius, font or motion value is hard-coded where a `--st-*` token exists.
- The neutral core exports the ProseMirror class mapping (`packages/rich-text/src/theme.ts`, mirroring `packages/codemirror/src/theme.ts`): editor surface, caret, selection, placeholder, preserved-block chrome, focus outline. Framework adapters apply it as a stylesheet; the Svelte adapter ships it as the subpath CSS (§8).
- Changing the host theme (`data-st-theme`, colour mode) requires no component prop and no remount: tokens resolve through CSS.

### 5.9 Mount on demand, unmount, no network

- The editor is created on mount (`onMount`) and only then: hosts mount it on demand for the active field/block (`h2a-spec` D6/C13). The subpath export is dynamically importable so a host can `await import("@sentropic/design-system-svelte/rich-text-editor")` at first edit activation; the DS does not require eager loading.
- Unmount destroys the Tiptap editor (`editor.destroy()`), removes every DOM listener the component added, cancels pending animation-frame/debounce work, and leaves no observer behind (FE-2 RED 8 asserts listener absence after unmount by instrumenting `addEventListener`/`removeEventListener` on the editor root).
- The component performs no network access of any kind: no `fetch`, no `XMLHttpRequest`, no remote image, font or stylesheet, no beacon. Its module graph contains no HTTP client (asserted by the import-graph scan in §11 RED 8).

## 6. Content profile P0 (RT-D3)

### 6.1 Enabled nodes and marks

Profile identifier: `focus.markdown.p0@1` (merged contract, §2.2 M3). The neutral core enables exactly:

| Kind | Tiptap/ProseMirror element | Editable | Notes |
| --- | --- | --- | --- |
| Node | `doc` | — | Root. |
| Node | `paragraph` (attr `paragraphId`) | Yes | The only editable block in P0. |
| Node | `text` | Yes | Inline text. |
| Node | `hardBreak` | Yes | Inside a paragraph. |
| Mark | `bold` (strong) | Yes | Keyboard + Markdown input. |
| Mark | `italic` (emphasis) | Yes | Keyboard + Markdown input. |
| Mark | `code` (inline code) | Yes | No code block follows from this mark. |
| Node | `preservedBlock` (attrs `paragraphId`, `raw`, `preservedKind`; `contenteditable=false`, atom) | No | Carries every unsupported block verbatim (§6.3). DS-internal node; never a Focus type. |

Everything else is absent from the schema. In particular there is no `heading`, `bulletList`, `orderedList`, `listItem`, `blockquote`, `codeBlock`, `table`, `image`, `link` mark or `horizontalRule` in the P0 schema. `StarterKit` is not enabled wholesale: the core composes the granular extensions (`@tiptap/extension-document`, `-paragraph`, `-text`, `-bold`, `-italic`, `-code`, `-hard-break`, `-history`, `-placeholder` or their v3 equivalents as resolved at lot start) so that an upstream default can never silently widen the profile (`h2a-spec` §5.3: activating StarterKit defaults is not a fidelity policy). Undo/redo history is enabled; placeholder display is enabled and reads `messages.placeholder`.

`text/plain` fields use the same document model with marks disabled by the adapter (a plain paragraph's text is literal; Markdown input rules do not fire).

### 6.2 What a paragraph may contain

An editable paragraph is a top-level paragraph whose inline content uses only text, `bold`, `italic`, `code` and `hardBreak` — the same editable set the merged Focus source codec accepts (§2.2 M6). A source paragraph containing a link, an image or raw HTML is not an editable paragraph: the host adapter segments it as a preserved block (§6.3), and the component renders it non-editable. The component never strips a link to make a paragraph editable.

### 6.3 Unsupported blocks: preserved and non-editable, never destroyed

- Tables, code blocks/fences, diagrams (including Mermaid sources), headings, lists (until §6.4 passes), blockquotes, images, raw HTML blocks and any other construct outside §6.1 are `preservedBlock` nodes. They render as visibly non-editable regions (`data-preserved-block`, `contenteditable=false`, accessible name from `messages.preservedBlockLabel`) and no editor gesture can place the caret inside them or transform them.
- A preserved block's `raw` is carried byte-identical through mount, editing elsewhere, and unmount, and is emitted unchanged in every `RichTextDocument`. Serialisation never regenerates a preserved block from an AST. This carries h2a capital C11/K11-adjacent preservation: a global Markdown → Tiptap → Markdown round trip must never silently normalise unsupported content away.
- If a user gesture would span a preserved block (select-all delete, paste replacing a selection covering one), the component refuses the destructive span and reports it through `onUnsupportedPaste`/a no-op with the preserved blocks intact; it never deletes a preserved block as a side effect of a text gesture. Explicit host-driven removal (the host supplies a new `value` without the block) is the only removal path.

### 6.4 List-item paragraph question (h2a V7): gated by round-trip evidence

- List-item paragraphs (present in the reference `s-reco`, `h2a-spec` V7/D20) join P0 only if the RT-2 round-trip tests (§11, §12) prove, on the final bundled codec, that bullet and ordered list items keep a stable `paragraphId` on the list item's paragraph through open/edit/close, split, merge and Markdown serialisation, with byte-identical output for unchanged lists.
- Until that verdict is recorded as passing in the RT-2 lot report (command + output), list blocks are preserved blocks under §6.3 and the delivery is announced exactly as "P0 fields editable, lists preserved" (`h2a-spec` D20). A failing or unrun list test keeps lists preserved; it never blocks the P0 delivery and never gets announced as list editing.

### 6.5 Markdown round-trip path and its qualification

- Path: source Markdown field → host segmentation (merged Focus codec or DS bridge) → `RichTextDocument` → ProseMirror document (core) → editing → `RichTextDocument` → Markdown via `tiptap-markdown` (`editor.storage.markdown.getMarkdown()` capital, §2.3) for editable paragraphs, with preserved `raw` slices spliced back at their block positions by the host adapter. Plain fields bypass Markdown entirely.
- The codec pair is `tiptap-markdown ^0.9.0` (observed sentropic pin, §2.3) over the §6.1 extension set, configured with the profile's serialisation options fixed in `packages/rich-text/src/profile.ts` (RT-0). The exact `tiptap-markdown` and `@tiptap/*` versions are pinned in the DS lockfile at lot start and recorded in the lot report.
- **Qualification, not declaration (`h2a-spec` §5.3/U1).** A declared `tiptap-markdown` version is not a round-trip proof. The profile is qualified only when the §11 round-trip witnesses pass on the final bundle: open/edit-nothing/close over every P0 construct and every preserved construct of the corpus (including Markdown tables and CRLF sources) yields byte-identical source values and an empty delta. Any marker, spacing or line-break normalisation of unchanged content is a failure, because it would manufacture false amendments.
- The DS codec must additionally prove segmentation equivalence with the merged Focus source codec (`@lezer/markdown` slices, §2.2 M5) on the shared corpus: the same source produces the same editable/preserved block boundaries and the same paragraph texts. The Focus codec remains the host's segmentation authority where the host already carries a manifest; the DS bridge is qualified against it, never substituted silently.

## 7. Security (RT-D4)

- **Parsing boundary.** Mounted content and pasted content enter only through the P0 ProseMirror schema (§6.1). Raw HTML is never assigned to the DOM as markup by the component; there is no `innerHTML` content path. Content the schema cannot represent becomes a preserved block or is rejected, per §6.3/§7 paste rules.
- **Hostile paste.** On paste, the component parses the clipboard payload (`text/html` when present, else `text/plain`) through the schema with these rules, in order:
  1. Strip every `data-paragraph-id`/`paragraphId` and allocate fresh identities (§5.2).
  2. Drop `script`, `iframe`, `object`, `embed`, `form`, event-handler attributes (`on*`), and `style` attributes wholesale; a pasted `</script>` sequence is text or dropped, never an element.
  3. Links: the `link` mark is not in the schema, so pasted links degrade to their text content; `javascript:`, `data:text/html` and other scriptable protocols never survive as attributes because no link node exists to carry them.
  4. Images: the `image` node is not in the schema. Remote images (`http:`, `https:`, protocol-relative) and local/data images alike produce no `<img>`, no request and no placeholder fetch; the alt text, when present, is inserted as plain text and the rejection is reported via `onUnsupportedPaste`.
  5. Tables, code fences and other unsupported structures become preserved blocks with verbatim `raw` when the paste carries their source text, or are reported via `onUnsupportedPaste` when only a rendered HTML table is available (the component does not reconstruct Markdown source from rendered HTML).
- **No remote fetch.** The component loads no remote image, font, stylesheet or script and issues no request (§5.9). Rendered output contains no `src`/`href` to a remote origin from edited content.
- **CSP.** The component is compatible with the portable host's `connect-src 'none'` posture (`h2a-spec` §5.5/D5) and with the MCP Apps default CSP shape recorded in the JSON render standard (`connect-src 'none'`). It requires no `unsafe-eval`, no inline-script exception beyond the host's own bundle, and no `img-src`/`font-src` remote allowance. Any future need for a CSP exception is a stop signal to record, not a waiver to add silently.

## 8. Offline packaging (RT-D5)

- **What the DS ships.** `@sentropic/design-system-rich-text`: ESM modules (`dist/index.js`, `dist/profile.js`, `dist/theme.js` or the built equivalents), type declarations, and no CSS asset (token mapping is exported as data; styling application is the adapter's). `@sentropic/design-system-svelte` subpath `./rich-text-editor`: ESM (`dist/rich-text-editor.js` as built by `svelte-package`), types, and one stylesheet `dist/rich-text-editor.css` carrying the `--st-component-richTextEditor-*` token bindings (§5.8). No CDN URL, no remote font, no sourcemap-required runtime asset is part of the contract.
- **What the host bundles.** The host (h2a `focus-kit` for FE-3; the sentropic app for FE-7) bundles the DS subpath, the Tiptap/ProseMirror peer closure, and the resolved message catalogue for the selected locale into its own artefact (h2a: the offline single-file portable dossier, embedded at build time per `h2a-spec` D5/§5.8). Catalogue resolution happens at production/build time host-side; the component only receives the resolved `messages` (§5.7). The DS ships no catalogue and fetches none.
- **Tree-shaking boundary.** The neutral package is `sideEffects: false`; the Svelte subpath is a separate module graph from the `"."` barrel (§4.2). A host that never edits never bundles Tiptap. Bundle size is reported in the RT-1 lot report as information; it is never accepted as reactivity evidence (`h2a-spec` D6/D22).

## 9. Dependencies and licensing (RT-D6)

### 9.1 Dependency lines

| Package | DS role | Line |
| --- | --- | --- |
| `@tiptap/core` | Editor core (peer) | v3 line; peer range `^3.0.0`; exact pin in `devDependencies`/lockfile at lot start, qualified by §11 |
| `@tiptap/pm` | ProseMirror re-export (peer) | Same v3 line as core |
| Granular extensions (`@tiptap/extension-document`, `-paragraph`, `-text`, `-bold`, `-italic`, `-code`, `-hard-break`, `-history`, `-placeholder`; final list fixed in `profile.ts` at lot start against the resolved v3 catalogue) | P0 schema and editing behaviour (peer) | Same v3 line |
| `tiptap-markdown` | Markdown codec bridge (§6.5) | `^0.9.0` as observed in sentropic; runtime dependency of the neutral package (not a peer), pinned exactly by the lockfile and qualified by round-trip tests |
| ProseMirror packages (`prosemirror-model`, `-state`, `-view`, `-transform`, `-history`, etc., as pulled by `@tiptap/pm`) | Transitive through the peer | MIT line carried by the peer closure; recorded through the notices flow when bundled by hosts |

Version-line basis: sentropic `ui/package.json` as observed declares `@tiptap/core ^3.6.5`, `@tiptap/pm ^3.6.5`, `@tiptap/starter-kit ^3.6.5`, `@tiptap/extension-placeholder ^3.14.0`, `tiptap-markdown ^0.9.0`, with the lockfile resolving `@tiptap/core` to `3.29.0` (§2.3). The brief's `^3.31.3` figure was not observed and is a `source-gap` (§16); RT-0 re-reads the sentropic manifest at lot start and records the line it actually aligns to. The DS peer range stays on the v3 major so hosts on any qualified v3 patch can consume it; qualification (§11) runs against the exact lockfile-resolved versions, and a version bump that changes round-trip behaviour reopens RT-2.

### 9.2 Licensing

- Tiptap core/extensions and ProseMirror are MIT-licensed open-source packages; `tiptap-markdown` is MIT-licensed. Licence texts are not retyped here: at lot start the implementation records each package's licence from its installed copy under `node_modules` and lets `scripts/generate-third-party-notices.mjs` derive `LICENSE.THIRD-PARTY.md` from `package-lock.json` (`npm run notices:generate`), exactly as the guard re-derives it (§2.1). Any package whose installed copy carries no licence file, or a non-MIT/non-permissive licence, fails the lot; it is never waved through.
- **No Tiptap Pro or cloud extension** is admitted: no `@tiptap-pro/*`, no collaboration/cloud package, no package requiring a licence key, account or network service. The P0 extension list (§6.1) is the allow-list; adding an extension requires amending §6.1 and re-running §11.
- The new publishable package satisfies the repository guard from its first publishable commit: `license: "MIT"`, a real `LICENSE` file (≥ 300 bytes), current `LICENSE.THIRD-PARTY.md`, tarball membership proven by `scripts/verify-publishable-licensing.mjs`, and the publishable-count assertion in `scripts/verify-publishable-licensing.test.mjs` updated in the same commit (18 → 19). `npm run licensing:check` and `npm run pack:smoke` are RT-1 gate commands (§12).

## 10. Provenance (RT-D7)

- Behavioural reference only: sentropic `ui/src/lib/components/TipTap.svelte`, `ui/src/lib/extensions/tailwind-classes.ts`, `ui/src/lib/utils/markdown.ts` (§2.3) may be read to recover behaviour — the viewer/locked rule, the focus guard for external updates, selection preservation around `setContent`, the `lastValue` echo guard, Markdown emission on update, destroy-on-unmount. The DS component is written fresh in the DS: no file is copied, no `$lib` alias, no Tailwind-class extension, no `marked`/`DOMPurify` render path and no app store enters the DS tree.
- The `EditableInput` business wrapper (autosave, `apiPut`, stores, locks beyond the component lock of §5.4) stays in sentropic and is consumed by lot FE-7 host-side. The DS component exposes `onChange`; debouncing, saving and conflict UI are host behaviour.
- No code from any decision-dossier kit and no code from other repositories' `src/` beyond the §2.3 read-only reference is used. Tiptap and ProseMirror enter only as registry dependencies (§9), never as vendored source.

## 11. Tests: the FE-2 RED list made concrete (RT-D8)

Rules for every item: the test is written and observed failing for the stated reason before the implementation lands (RED first); the lot report records the failing command + output and the passing command + output. A test that silently skips counts as failed. Targeted commands only (§12); the full suite runs once at integration by the conductor.

Environments: **(J)** the DS jsdom setup — `packages/components-svelte/vite.config.ts` (`environment: "jsdom"`, `@testing-library/svelte`) for the Svelte adapter, `packages/rich-text/vite.config.ts` [N] with the same jsdom shape for the neutral core. **(B)** a real browser through the repository's existing puppeteer-core harness shape (root `puppeteer-core ^25.1.0`, system Chromium, headless, `--no-sandbox`): required where the assertion depends on real selection, caret, focus or IME composition, which jsdom does not implement. The browser suite lives beside the component and is run by its own targeted command; it is never folded into the jsdom run.

### 11.1 The eight RED items

| RED | h2a FE-2 item | Exact test file | Env | Observable assertion |
| --- | --- | --- | --- | --- |
| RED 1 | Read-only/disabled effective, viewer case | [N] `packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.test.ts` (describe `editable/disabled states`) + core half in [N] `packages/rich-text/src/editor.test.ts` | J | With `editable={false}`, and separately `disabled={true}`: simulated typing, paste (`ClipboardEvent` with hostile and plain payloads) and mutation shortcuts produce zero document mutation, zero `onChange` calls and zero save-like callbacks. The viewer case is a named fixture (`editable={false}` labelled as the viewer lock). Assertions read the emitted event log and the resulting `RichTextDocument`, not internal editor state alone. |
| RED 2 | Open/focus/leave without a change emits nothing; byte-identical round trip | [N] `packages/rich-text/src/roundtrip.test.ts` (core) + the component half in `RichTextEditor.test.ts` (describe `no-change cycle`) | J | For every P0 construct and every preserved construct of the corpus fixture [N] `packages/rich-text/tests/fixtures/p0-corpus.md` (paragraphs with bold/italic/code/hard-break, a Markdown table, a code fence, a heading, a list, CRLF line endings, trailing blank lines): mount → focus → blur → unmount emits zero `onChange` calls, and serialising the unedited document reproduces the source byte-identically (string equality). Any normalisation diff fails the test with the diff shown. Joint witness with h2a FE-1 codec behaviour over the component's real serialisation. |
| RED 3 | Identity carriage through split, merge, undo/redo, internal paste; external paste cannot inject identity | [N] `packages/rich-text/src/identity.test.ts` (core plugin) + `RichTextEditor.test.ts` (describe `paragraph identity`) | J (split/merge/undo/paste mechanics); B for the real-selection merge at a paragraph boundary if jsdom selection proves insufficient — the lot records which environment carried each sub-assertion | Enter-split: leading block keeps its `paragraphId`, tail carries a fresh allocator-supplied ID. Backspace-merge: leading ID survives, consumed ID absent and never reallocated in the session. Undo of a delete restores the same ID; redo removes it again. Internal copy/paste: pasted block carries a fresh ID distinct from its source. External paste whose HTML carries `data-paragraph-id="paragraph:forged"`: the resulting block's ID is allocator-supplied and never `paragraph:forged`. IDs are read from the emitted `RichTextDocument` blocks and from `data-paragraph-id` DOM attributes. |
| RED 4 | Controlled external update during typing preserves caret/local text and surfaces concurrency | [N] `packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.browser.test.mjs` (real browser) with the clean-update half in `RichTextEditor.test.ts` | B (caret/focus truth) + J (clean path) | Browser: mount, type into paragraph 2 (caret mid-word), then apply an external `value` change to paragraph 1: the local paragraph-2 text and the caret (anchor block ID + offset, read from the real `Selection`) are unchanged, and exactly one `onExternalConflict` fires carrying both documents. Applying an external update while clean and unfocused replaces content and restores selection by block identity where the block survives. No path silently overwrites dirty local work. |
| RED 5 | IME composition emits nothing mid-composition; commit yields one coalesced change | [N] `packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.browser.test.mjs` (describe `IME composition`) | B only — jsdom does not implement composition; a jsdom version of this test is not accepted as a substitute | In headless Chromium, dispatch a real composition sequence (`compositionstart`, composing updates via `CompositionEvent`/insertion, `compositionend`) producing an accented character and an emoji: zero `onChange` calls during composition, exactly one `onChange` after `compositionend`, and the emitted document contains the composed text once. An export-snapshot read during composition returns the pre-composition document. |
| RED 6 | Editing inside a parent selection handler does not invoke it | [N] `packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.test.ts` (describe `parent selection isolation`) with fixture [N] `packages/components-svelte/src/lib/rich-text-editor/RichTextEditorFixture.svelte` (editor nested in a clickable card carrying a selection handler, mirroring the dossier option-card shape) | J | Typing, clicking into text and selecting text inside the editor invoke the parent card's selection handler zero times (event propagation is stopped at the editor boundary); clicking the card outside the editor still invokes it once. This is the component-level half of the `h2a-spec` D12 witness; the host half is FE-3. |
| RED 7 | Hostile paste inert/rejected; unsupported blocks round-trip through mount/unmount | [N] `packages/rich-text/src/paste.test.ts` (core paste pipeline) + `RichTextEditor.test.ts` (describe `hostile paste`) + the preserved-block half in `roundtrip.test.ts` | J; B spot-check in the browser suite that no request is issued (request interception counts zero network requests) | Paste payloads containing `</script><script>`, `onerror` attributes, `javascript:` links, remote `<img src="https://…">` and raw HTML: the resulting document and DOM contain no `script` element, no event-handler attribute, no link attribute and no `img`; scriptable content is dropped or present only as inert text; remote-image alt text, when kept, is plain text. A document carrying table/code/heading preserved blocks mounts and unmounts with those blocks' `raw` byte-identical and `data-preserved-block` regions non-editable. |
| RED 8 | All labels from injected messages; unmount leaves no listeners; no network/business dependency in the graph | [N] `packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.test.ts` (describe `messages and lifecycle`) + [N] `packages/rich-text/src/no-network.test.ts` (module-graph scan) | J + static scan | Rendering with sentinel `messages` (e.g. `editorLabel: "SENTINEL-LABEL"`) shows exactly the sentinel strings in the DOM/accessibility tree and zero built-in label strings; a missing key renders `⟦untranslated:rich-text.<key>⟧` with `data-untranslated` set (§5.7). After unmount, instrumented `addEventListener`/`removeEventListener` counts on the editor root balance and a further simulated keystroke mutates nothing. The module-graph scan asserts the component graph imports no `fetch`/HTTP client, no `@sentropic/focus`, no Track type, no `apiPut`-shaped dependency and no `$lib` specifier. |

### 11.2 Packaging witness (same gate, not a ninth RED item)

| Witness | Exact test file | Env | Observable assertion |
| --- | --- | --- | --- |
| RED-P | Plain component import never pulls Tiptap; guards stay green | [N] `packages/rich-text/src/packaging.test.ts` (import-graph assertion) + the repository guards `scripts/smoke-pack.mjs` and `scripts/verify-publishable-licensing.mjs` run as gate commands | J + Node | A test imports `@sentropic/design-system-svelte` (the `"."` barrel, Button/Card path) in a fresh module graph and asserts no `@tiptap/*` or `prosemirror-*` module is loaded and no `rich-text-editor` module resolves; importing `@sentropic/design-system-svelte/rich-text-editor` does load them. `npm run pack:smoke` and `npm run licensing:check` exit 0 with the new package at the updated publishable count (§9.2). A failure of either guard is a lot failure, never a waiver. |

### 11.3 Corpus and fixtures

- [N] `packages/rich-text/tests/fixtures/p0-corpus.md`: the round-trip corpus — every P0 construct, every preserved construct named in §6.3, two textually identical paragraphs, UTF-8 accents/emoji, CRLF, trailing blank lines and a final newline. Provenance is synthetic and stated in the fixture header; it is never presented as the qualified real dossier (h2a FE-9 governs that case).
- [N] `packages/rich-text/tests/fixtures/list-corpus.md`: bullet and ordered lists for the §6.4 gate, kept separate so the P0 corpus cannot silently depend on list support.

## 12. Lots inside the DS (RT-D9)

Order: neutral core first, Svelte adapter next, other frameworks staged (§4.3). Every lot is RED first: its tests are written and observed failing for the stated reason before implementation. `[N]` marks a new file. Commands are the real scripts of the measured tree: workspace tests via `npm --workspace <name> run test -- <target>` (each package's `test` script is `vitest run src`; the Svelte package's is `vitest run src`), build/check via the root `run-workspaces.mjs` wrappers or the workspace script directly.

### RT-0 — Neutral core package `packages/rich-text`

Depends on: nothing (starts in parallel with h2a FE-0/FE-1). Blocks: RT-1, RT-2.

Files:

- [N] `packages/rich-text/package.json` (`private: true` until RT-1 gate, §4.4), [N] `packages/rich-text/tsconfig.json`, [N] `packages/rich-text/vite.config.ts` (jsdom shape of §11), [N] `packages/rich-text/README.md`
- [N] `packages/rich-text/src/index.ts`, [N] `packages/rich-text/src/model.ts` (§5.1/§5.3 types), [N] `packages/rich-text/src/messages.ts` (§5.7), [N] `packages/rich-text/src/profile.ts` (P0 extension list + `focus.markdown.p0@1` serialisation config, §6), [N] `packages/rich-text/src/identity.ts` (paragraph-identity plugin, §5.2), [N] `packages/rich-text/src/codec.ts` (Markdown bridge, §6.5), [N] `packages/rich-text/src/theme.ts` (token mapping, §5.8), [N] `packages/rich-text/src/editor.ts` (headless editor factory: document in, transactions out, state control, composition guard)
- [N] `packages/rich-text/src/editor.test.ts`, [N] `packages/rich-text/src/identity.test.ts`, [N] `packages/rich-text/src/roundtrip.test.ts`, [N] `packages/rich-text/src/paste.test.ts`, [N] `packages/rich-text/src/no-network.test.ts`, [N] `packages/rich-text/src/packaging.test.ts`
- [N] `packages/rich-text/tests/fixtures/p0-corpus.md`, [N] `packages/rich-text/tests/fixtures/list-corpus.md`
- Existing, modified only as wiring: root `package-lock.json` (new workspace + Tiptap pins).

RED: the core halves of RED 1–3, RED 7, RED 8 (module-graph scan) and RED-P's core import assertion, failing because the modules do not exist.

Gate: `npm --workspace @sentropic/design-system-rich-text run build`, `npm --workspace @sentropic/design-system-rich-text run check` (`tsc --noEmit` shape), `npm --workspace @sentropic/design-system-rich-text run test` green with output; the package imports in Node without touching `document`/`window` except inside the editor factory's mount path (asserted by a no-DOM import test, following the diagram-core precedent of `SPEC_EVOL_GD_M2_MODEL.md` acceptance 3).

### RT-1 — Svelte adapter `@sentropic/design-system-svelte/rich-text-editor`

Depends on: RT-0. Blocks: h2a FE-3 (default path, §13.1).

Files:

- [N] `packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.svelte`, [N] `packages/components-svelte/src/lib/rich-text-editor/RichTextEditorFixture.svelte` (RED 6 fixture), [N] `packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.test.ts`, [N] `packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.browser.test.mjs`, [N] `packages/components-svelte/src/lib/rich-text-editor/rich-text-editor.css` (built to `dist/rich-text-editor.css`)
- Existing, modified: `packages/components-svelte/package.json` (add `./rich-text-editor` subpath export; add `@sentropic/design-system-rich-text` as a dependency and Tiptap peers surfaced for the subpath consumer — exact dependency-vs-peer placement recorded in the lot report; the `"."` barrel is untouched), `packages/components-svelte/src/lib/index.ts` (no change — explicitly asserted by RED-P), root `package-lock.json`.
- Existing, at the publishable flip (§4.4): [N] `packages/rich-text/LICENSE`, [N] `packages/rich-text/LICENSE.THIRD-PARTY.md` (generated, `npm run notices:generate`), `scripts/verify-publishable-licensing.test.mjs` (count 18 → 19), `packages/components-svelte/LICENSE.THIRD-PARTY.md` regenerated if its closure changes.

RED: RED 1–8 component halves and RED-P, failing because the subpath does not exist.

Gate: `npm --workspace @sentropic/design-system-svelte run test -- src/lib/rich-text-editor` (jsdom) green with output; `node packages/components-svelte/src/lib/rich-text-editor/RichTextEditor.browser.test.mjs` (or the lot's recorded puppeteer-core invocation) green with output for RED 4/5 and the RED 7 network spot-check; `npm --workspace @sentropic/design-system-svelte run build` and `run check` (`svelte-check`) green; root `npm run licensing:check` and `npm run pack:smoke` green. The published artefact is not announced as consumable until FE-3 verifies actual consumption (§13.1) — a green DS gate alone does not close that claim (`h2a-spec` FE-2 gate).

### RT-2 — Round-trip qualification and the list gate (V7)

Depends on: RT-0, RT-1. Gates: the P0 announcement wording; §6.4.

Files:

- Existing tests extended: `packages/rich-text/src/roundtrip.test.ts` (full corpus, CRLF, identical paragraphs), segmentation-equivalence tests against the merged Focus codec's published fixtures where h2a FE-0/FE-1 provides them (imported as test data by exact pinned version, never as a runtime dependency).
- [N] `packages/rich-text/src/list-roundtrip.test.ts` + `tests/fixtures/list-corpus.md` exercised for the §6.4 verdict.

Gate: the round-trip commands above green with output, and the list verdict (pass → lists join P0 by amending §6.1 in a follow-up commit; fail/unrun → lists stay preserved) recorded with its command and output in the lot report. No-change byte identity (§11 RED 2) is part of this gate.

### RT-3 — Theming, documentation and staged framework adapters

Depends on: RT-1. Each framework adapter is its own sub-lot under §4.3 Stage 2, with its own RED run.

Files:

- [N] `packages/components-svelte/src/lib/rich-text-editor/README.md` or the docs-app page the DS uses for component documentation at lot start (lot re-inventories the docs surface and records the choice), token additions only if a needed `--st-component-richTextEditor-*` token is missing (through the themes build, `packages/themes/scripts/build-css.mjs`, never hand-edited generated CSS).
- Stage 2, per framework: [N] `packages/components-react/src/rich-text-editor/RichTextEditor.tsx` + test, [N] `packages/components-vue/src/rich-text-editor/RichTextEditor.vue` + test, [N] `packages/components-angular/src/lib/rich-text-editor/` + test, each with its package's subpath export wiring.

Gate: per §4.3. Until a sub-lot passes, its framework is reported as not delivered.

## 13. Interfaces with h2a lots (RT-D10)

### 13.1 What FE-3 consumes, and when

FE-3 (h2a portable in-place editing) consumes, from the published DS packages at an exact pinned version recorded in `packages/h2a/focus-kit/package.json` host-side:

- `@sentropic/design-system-rich-text` (profile, codec bridge, types) and `@sentropic/design-system-svelte/rich-text-editor` (the component), imported by exact subpath — never the DS barrel.
- The host adapter (`packages/h2a/focus-kit/src/EditableField.svelte` + `editing-session.js`, h2a-side files named by the h2a specification) supplies: the Focus manifest's paragraph identities as `RichTextDocument` block IDs, a Focus-compatible `allocateId`, the resolved `messages` catalogue, the `editable` state from dossier-level amend mode, and the mapping from `RichTextChangeEvent.document` back to Focus paragraph values (via the merged `diffParagraphs`/`applyParagraphChanges`, host-side). The DS component supplies no diff algorithm to the wire; the return envelope is built host-side by h2a FE-4 machinery.
- Timing: FE-3's default path unblocks when RT-1's gate is green **and** h2a has installed the exact published artefact and run one offline paragraph/question edit against it (the observable unblock stated by merged `docs/focus/document-editing.md`: install the exact published artifact, run the FE-3 offline edit, then FE-4 export/import and the tarball round trip). A DS-internal green without that consumption witness does not unblock FE-3.

### 13.2 The D23 fallback, and its replacement gate seen from the DS side

- If, and only if, the DS component cannot be delivered or consumed in time for the first witness, h2a lot FE-3 may carry one thin temporary Tiptap adapter inside `focus-kit` under the same Focus contract and the same FE-2 RED list (`h2a-spec` D23). The merged h2a note at `98060bd0a` currently records that no fallback editor is authorised; engaging D23 requires the FE-3 lot owner's explicit go-ahead recorded host-side. No fallback code ever lands in the DS tree.
- DS-side replacement gate: the fallback is replaced when (a) RT-1 has published the subpath artefact, (b) FE-3 has consumed that exact artefact and passed its offline edit witness (§13.1), and (c) the `focus-kit` adapter is deleted in the same h2a delivery that switches to the DS export. Maintaining two editors beyond that gate is a defect (`h2a-spec` D23). From the DS side, the gate is considered met only on evidence of (b) — the DS does not declare the fallback replaced from its own test results.
- The sentropic `EditableInput` business wrapper is never copied into either the fallback or the DS component (§10).

### 13.3 What FE-8 needs from the DS

FE-8 (shared language and reactivity qualification, transversal, gating the first increment) receives from the DS:

- **Marker form:** the exact `untranslated` marker of §5.7 — visible text `⟦untranslated:rich-text.<key>⟧` plus `data-untranslated="rich-text.<key>"` — with the `rich-text.` key namespace fixed by RT-0's `messages.ts`. FE-8 renders a locale without a catalogue and lists every marker-only key in its build report; the DS guarantees the marker is never a hard-coded language string and that IDs, diffs and stored values stay bit-identical across locales (§5.7).
- **Measurable reactivity invariants on the component** (budgets themselves are FE-8's phase-B output, `h2a-spec` D22; the DS supplies the measurable surface, not the numbers):
  1. *No remount per keystroke:* the editor DOM root element identity and the ProseMirror view instance are stable across a typing burst (assertable by element identity in the browser suite).
  2. *No whole-document reparse per keystroke:* the component exposes no API that re-segments the field per transaction; the browser suite asserts a keystroke emits at most one coalesced `onChange` and that preserved blocks' `raw` is untouched (object identity in the emitted document).
  3. *Caret/selection/scroll preservation:* locale (`messages`) and theme (token) changes preserve the real `Selection` anchor (block ID + offset) and scroll position — asserted in `RichTextEditor.browser.test.mjs`.
  4. *Stale-result safety:* an external update arriving during composition or while dirty surfaces via `onExternalConflict` and never overwrites (§5.6); the exported snapshot equals the displayed revision (the host freeze reads the last emitted document, never a mid-composition state).
  5. *Zero network per session:* request interception in the browser suite counts zero requests from mount through edit to unmount.
- FE-7 (sentropic adoption) consumes the same subpath through its own facade; the DS surface it depends on is exactly §5, and the viewer lock it must preserve is RED 1's viewer fixture. No DS change is scheduled for FE-7 beyond the Stage-1 delivery.

### 13.4 Consumed contract recorded in the JSON render standard

`spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md` §11.2.1 (added by this delivery) records the consumed Focus editing contract by reference: owner h2a/`@sentropic/focus`, pinned contract `focus.markdown.p0@1` / schemaVersion 1 at `@sentropic/focus` 0.5.0 source state (merge `98060bd0a`; published availability not asserted, §2.2), subpaths `@sentropic/focus/editing`, `./schemas/focus-edit-return.v1`, `./schemas/focus-editing-manifest.v1`, and a pointer to this specification for the DS surface. It contains no return field definition; any future pin bump is a versioned change recorded in both specifications in the same delivery.

## 14. Open questions to the owner

Only questions the DS cannot settle from the sources read. Each carries a recommendation; none blocks RT-0.

| # | Question | Recommendation |
| --- | --- | --- |
| Q-RT-1 | Should `@sentropic/design-system-rich-text` be publishable from its first version, or stay `private: true` until FE-3 has consumed a published artefact once? The licensing guard treats both postures exactly (§4.4); the choice affects only the publishable count and the timing of the public commitment. | Stay `private: true` through RT-0, flip to publishable at the RT-1 gate in the same commit as its `LICENSE`/notices — one deliberate publication act instead of a package that is public before it is consumable. |
| Q-RT-2 | Is a formatting toolbar (bold/italic/code buttons) expected in the first increment, or are keyboard shortcuts and Markdown input rules sufficient? The h2a surface (§5.7) names no toolbar; sentropic's precedent has none. | No toolbar in P0. Keyboard and Markdown input only; a toolbar is a later, separately designed addition with its own injected labels. |
| Q-RT-3 | After the Svelte stage, which framework adapter is wanted next — or is Svelte-only the intended steady state while both consumers are Svelte (§4.2)? | Svelte-only steady state until a named React/Vue/Angular consumer exists; Stage 2 sub-lots (§4.3) start on that consumer's demand, not on parity symmetry. |

The h2a specification's principle questions Q1–Q4 (force of a correction, usable perimeter, divergence arbitration, producer succession) remain open on the h2a side and are not re-asked here; Q-RT-3's perimeter half is bounded by their answer at first-increment acceptance.

## 15. NOT covered

Each item below is explicitly excluded from this specification and from the Stage-1 delivery. Announcing any of them as delivered under this specification is a scope breach.

1. **The Focus return, manifest, diff, reconciler, digests and schemas.** Owned by h2a/Focus (FE-0/FE-1/FE-5). The DS consumes them by pinned reference only (§13.4) and defines no second shape.
2. **Full-document editing:** table-cell editing, diagram source or scene editing, code-block editing, heading editing, blockquote editing, link/image editing, and any Markdown construct outside the §6.1 P0 profile. Those blocks are preservation witnesses, not editing witnesses.
3. **List editing before the §6.4 verdict.** Lists stay preserved and visibly non-editable until RT-2 records a passing round-trip verdict.
4. **A formatting toolbar, slash menu, mention/autocomplete system, or any popover UI.** P0 input is keyboard + Markdown input rules (Q-RT-2).
5. **Collaborative or multi-writer editing:** CRDTs, presence, simultaneous cursors, a document server, and any `LiveDocumentStore` implementation.
6. **Persistence, autosave, transport and business logic in the component:** no localStorage draft, no `apiPut`, no store, no Track write, no inbox delivery. Draft recovery and export are host duties (h2a FE-4).
7. **React, Vue and Angular adapters claimed as delivered** before their §4.3 stage gates pass. Stage 1 is Svelte only and is announced as such.
8. **Retro-editing previously rendered HTML files** and any `renderHtml`+runtime host qualification (h2a V13): allowed by the Focus contract, not a DS gate here.
9. **Performance budgets.** Numeric keystroke/paint budgets are FE-8 phase-B outputs derived from measurement (`h2a-spec` D22). This specification supplies measurable invariants (§13.3) and no threshold numbers.
10. **The business substance of any dossier** and the qualification of the real reference case (h2a FE-9). DS fixtures are synthetic and labelled as such (§11.3).
11. **Publication mechanics beyond the DS guard:** npm availability of any h2a package, CDN distribution, and MCP `ui://` hosting of the editor are not asserted here.
12. **A second editor.** Neither a `focus-kit` fallback maintained past its replacement gate (§13.2) nor a per-framework re-implementation of the profile/codec (§4.1 option 3) is covered or permitted under this specification.

## 16. Residual factual uncertainties

| # | Uncertainty | Status | Settled where |
| --- | --- | --- | --- |
| U-RT-1 | sentropic `@tiptap/*` pin: the brief and the h2a specification cite `^3.31.3`; `ui/package.json` as read declares `^3.6.5` with the lockfile resolving `3.29.0` (§2.3). | `source-gap` — the observed file governs; the cited figure is unverified against the current sentropic checkout. | RT-0 lot start: re-read the sentropic manifest and record the aligned line. |
| U-RT-2 | Real round-trip fidelity of the chosen Tiptap + `tiptap-markdown` pair on the final bundle, including CRLF, identical paragraphs and preserved tables (h2a U1). No round trip was measured for this specification. | `unverified` | RT-2 gate (§12), RED 2/7 outputs. |
| U-RT-3 | IME composition and caret behaviour under `file://` in the actually targeted browsers (h2a U2, browser half). | `unverified` | RT-1 browser suite on the declared Chromium profile; wider browser claims need FE-8 profiles. |
| U-RT-4 | Published availability of `@sentropic/focus` 0.5.0 carrying the editing subpaths (merged source state at `98060bd0a`; `docs/focus/document-editing.md` asserts no published availability). | `unverified` | h2a publication; FE-3 consumption pins the exact artefact it installs. |
| U-RT-5 | Whether `packages/components-svelte`'s `svelte-package` build emits the subpath CSS at the exact `dist/rich-text-editor.css` path assumed in §8. | `unverified` | RT-1 first build; the lot records the real emitted path and amends §8 if it differs. |

## Appendix A — Source map

| Topic | Source (file) |
| --- | --- |
| Owner request verbatim | Commissioning brief, 18/10 (header, §0.1) |
| Routing to the DS (D10) | h2a `SPEC_EVOL_FOCUS_EDIT_RETURN.v3.md` D10, §5.7, lot FE-2; merged stop note in h2a `docs/focus/document-editing.md` at `98060bd0a` |
| GO-CODE reviews of the h2a specification | `cffe3a-last.md`, `cffe3s-last.md` (both `GO-CODE` on SHA-256 `6d320f66…e105`) in the h2a conductor scratchpad `…/0985/` |
| Merged Focus editing contract | `git -C /home/antoinefa/src/h2a show 98060bd0a:packages/focus/src/editing/{contract,anchors,codec,diff,digest,structure,reconcile,index}.ts`, `:packages/focus/schemas/focus-edit-return.v1.schema.json`, `:packages/focus/schemas/focus-editing-manifest.v1.schema.json`, `:packages/focus/package.json`, `:docs/focus/document-editing.md` |
| DS workspaces, scripts, guards | DS root `package.json`; `scripts/generate-third-party-notices.mjs` (`publishableWorkspaces`, `NOTICES_FILENAME`), `scripts/verify-publishable-licensing.mjs`, `scripts/verify-publishable-licensing.test.mjs` (count 18), `scripts/smoke-pack.mjs`, `scripts/verify-layering.test.mjs` |
| Neutral-package precedent | `packages/codemirror/package.json`, `packages/codemirror/src/index.ts`, `packages/codemirror/src/theme.ts`; subpath precedent `packages/graph/package.json` |
| Svelte package shape and barrel | `packages/components-svelte/package.json`, `packages/components-svelte/src/lib/index.ts`, `packages/components-svelte/vite.config.ts`, `packages/components-svelte/src/lib/ChatComposer.svelte`, `packages/components-svelte/src/lib/CodeSnippet.svelte`, `packages/components-svelte/src/lib/Button.svelte` |
| Test/browser environments | `packages/components-svelte/vite.config.ts` (jsdom), root `package.json` (`puppeteer-core ^25.1.0`), `scripts/visual-rounded-seam-audit.mjs`, `scripts/verify-theme-privacy.mjs`, `packages/skills/src/engine/parityAudit.ts`, `packages/graph/tests/golden/cdp-harness.mjs` |
| sentropic behavioural reference | `/home/antoinefa/src/sentropic/ui/package.json`, `/home/antoinefa/src/sentropic/ui/src/lib/components/TipTap.svelte`, `/home/antoinefa/src/sentropic/ui/src/lib/extensions/tailwind-classes.ts`, `/home/antoinefa/src/sentropic/ui/src/lib/utils/markdown.ts` |
| Parity discipline | DS `spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md` §5.1, §14, AC-L1; `docs/graph-dataviz-migration-plan.md` lot A4 |
| Focus contract record (reference only) | DS `spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md` §11.2 and new §11.2.1 |

## Appendix B — Consumed Focus contract pin (by reference)

The DS consumes exactly this h2a contract and no other editing contract. This appendix records the pin; it defines nothing.

| Field | Pinned value |
| --- | --- |
| Contract owner | h2a, `@sentropic/focus` (`h2a-spec` D9, owner decision H-1 of 2026-10-16) |
| Source state | Merge commit `98060bd0a` (PR #378), `packages/focus` version `0.5.0` in source; published availability `unverified` (U-RT-4) |
| Contract narrative | h2a `docs/focus/document-editing.md` at `98060bd0a` |
| API subpath | `@sentropic/focus/editing` (`packages/focus/src/editing/index.ts`) |
| Schemas | `@sentropic/focus/schemas/focus-edit-return.v1` (`urn:sentropic:focus:FocusEditReturn:1.0.0`), `@sentropic/focus/schemas/focus-editing-manifest.v1` (`urn:sentropic:focus:FocusEditingManifest:1.0.0`), `schemaVersion: 1` |
| Content profile identifier | `focus.markdown.p0@1` (Markdown fields); `text/plain` (plain narrative fields) |
| Identity the DS carries | Opaque `paragraphId` strings supplied by the host adapter (§5.2). The DS allocates, diffs, digests and reconciles nothing. |
| Recorded in the render standard | `spec/SPEC_EVOL_DS_JSON_RENDER_STANDARD.md` §11.2.1 (reference only, no second definition) |
