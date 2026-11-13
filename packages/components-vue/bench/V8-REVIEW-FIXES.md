# PR 281 follow-up — Vue 0.41.0-next.3

The resumed change fixes the Blocking and Major findings in the Carbon review.
`origin/main` already contains `0.41.0-next.2`; the candidate and its consumers
therefore use `0.41.0-next.3`.

| Finding | Correction | Regression witness |
| --- | --- | --- |
| B1 | Vue and each dataviz publish check every runtime dependency and peer against npm, including optional peers. Exact pins must match; ranges must resolve to a published version. Vue smoke-pack includes rich-text and every V8 subpath. | `scripts/verify-deps-published.test.mjs`, `scripts/vue-v8-review.test.mjs`, strict packed installs |
| B2 | Both keyboard spellings invoke the neutral policy callback in capture phase. A returned `true` or `preventDefault()` suppresses Enter; inactive editors ignore events; identical aliases run once. | `src/v8-review.test.ts`, `src/vapor-runtime.test.ts`, packed composer witness |
| B3 | Public content fields accept scalars; rich markup uses the documented slots. The same restriction covers aliases and recursive list inputs. | `tests/types/review-contracts.ts`, Classic/Vapor slot and fallback witnesses |
| B4 | DataTable forwards attrs and native listeners once, onto its table. | Classic/Vapor duplicate-ID and click-count witnesses |
| M1 | LabelledIconButton composes Tooltip, forwards button attrs and retains Icon classes. Unknown names warn and render the decorative fallback. | Classic/Vapor focus, attrs and unknown-icon witnesses |
| M2 | Tiptap and collaboration peers are optional in the packed manifests. Vue and Svelte pin the new rich-text 0.1.1 release; its editor dependencies are optional peers. | Published-manifest assertions, registry-resolved transitive install, root and Vapor imports before peers, editor-only import rejection |
| M3 | Control SVGs compose Icon. Diagram controls use bare Icon with the reference classes, stroke 2 and accessibility attributes. | SVG source guard, dimensions, unmodified Svelte/Vue flow parity, exact reference DOM in existing Vue parity suites |
| M4 | Presence and iframe roots forward attrs and class. WebFrame config types are public; dataviz reuses the DS implementation in Classic and Vapor. | Type, attrs and packed identity witnesses |
| M5 | Full composer capture covers pending initialization, untouched Markdown slices, a touched paragraph and synthetic trailing-block elision. Full editor fixtures await readiness. V8 pack paths and the CSS alias are asserted. | Composer suite, native Vapor and packed P0/full captures, editor G1–G6 gates |
| M6 | Listener presence accepts `.once` and merged arrays, while Vue emits each event once. Unused RichTextEditor prop bindings are removed. | Classic/Vapor Toast and TreeView interaction witnesses |

The inexpensive Astra corrections are included: both editors reject undeclared
wrapper attrs, the mounted editor gate requires readiness and captured content,
and registry availability is checked separately from local tarballs.

## Failing-first evidence

The pre-reboot run recorded 12 failing V8 behavior witnesses, the full-profile
Composer test, four failing packaging/source guards, both workflow guards and
unused `@ts-expect-error` directives against the wider published types. Its log
is `scratchpad/vue-vapor/v8fix-sol.out` in the parent repository.

The resumed audit additionally reproduced seven icon-dimension failures and
unused negative type assertions for the remaining scalar aliases. The final
tests retain those cases. Existing fallback probes now explicitly require the
Vue type diagnostic when they deliberately pass a VNode to a scalar prop.
The source/AST guards also caught duplicate caret classes during composition;
Icon now owns the common classes and controls supply only their custom classes.

## Validation

- Full `components-vue` suite: 124 files, 2,524 passing tests across Classic and Vapor.
- Dataviz Vue suite: 37 files, 160 passing tests.
- Svelte diagram suites: 10 files, 473 passing tests, including all 53 normalized
  flow parity cases. `DiagramSceneFigure.flow-parity.test.ts` is unchanged.
- Both `vue-tsc` checks, published consumer types and Classic/Vapor/3.5 builds.
- K25 and exact toolchain checks, 12 AST integration tests and 97 targeted
  source/publication/generation guards.
- Packed installations with npm 10.9.9: only Vue/dataviz tarballs are direct
  inputs; workspace dependencies resolve by name/version from an HTTP registry
  serving their actual tarballs. Published peer metadata is checked throughout
  the closure, and the consumer lockfile contains no Tiptap/Yjs packages.
  Root and Vapor imports pass before peers; editor subpaths reject missing
  Tiptap. After explicit peer installation, P0/full capture and WebFrame identity
  pass: 10 tests each for Classic, the 3.5 compiler output and Vapor, plus the
  two pre-peer consumer tests.
- Vue smoke-pack, including strict peer resolution and consumer typechecking.
- Component-index: 436 fresh artifacts with generation guards;
  licensing: 22 publishable packages.

The generated contract baseline records 25 Vue cells becoming complete after
the scalar restrictions remove extraction losses. It also records the typed
keyboard aliases, newly extractible caption and public presence class.

## PR 286 failing-first follow-up

- The new immutable-release witness failed while rich-text still used the
  published 0.1.0 version. The registry probe returned E404 for 0.1.1 before
  selecting it; Vue's publication gate rejects the old version for the new pin.
- The existing Svelte `fold-toggle-isolation` case failed on the added `st-icon`,
  `focusable=false` and stroke 2.25. Bare Icon restores the reference contract;
  the Vue test helper no longer rewrites Svelte reference attributes.
- Classic and native Vapor initially-open dialog witnesses failed on missing
  scroll locks and overridden caller names. Immediate SSR-guarded initialization,
  render-time attrs and restoration of the previous overflow resolve them.
- Both new negative attribute guard witnesses failed before the AST change:
  disabled fallthrough without forwarding and ancestor/descendant forwarding.
  Intentional editor rejection is documented with parsed `@attrs none` JSDoc.
- The added native Vapor full-profile witness captures during pending mount,
  edits one paragraph, preserves the hard-break source slice, omits the empty
  synthetic trailing paragraph, and retains it once typed. A temporary mutation
  discarding untouched source seeds after an edit made the assertion fail
  (`Hard  \nbreak` became `Hard\\\nbreak`); restored output passes. This is a
  coverage addition; the existing composer implementation already retains seeds.

## Publication prerequisite

The live registry check rejects this candidate because
`@sentropic/design-system-themes@0.14.0` and
`@sentropic/diagram-canvas@0.2.0` are absent. Publish
`@sentropic/design-system-rich-text@0.1.1` before Vue or Svelte as well:
published 0.1.0 cannot receive the corrected peer metadata. Those prerequisites
must be published before the Vue release. Dataviz retains its five-package lockstep
version and pins this Vue candidate; its new gate likewise requires that pin
to exist before publishing the adapter. Local tarball installation does not
claim registry availability. No release tag is created by this follow-up.
