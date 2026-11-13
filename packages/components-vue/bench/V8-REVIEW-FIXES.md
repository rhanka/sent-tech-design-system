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
| M2 | Tiptap and collaboration peers are optional; markdown is an optional peer too. Local editor builds declare their own development dependencies. | Manifest guard; packed root imports before any editor peer is installed |
| M3 | Control SVGs compose Icon and use its token layer. Original glyph geometry and dimensions are retained. | SVG source guard, dimensions in both CopyButton states and six controls, diagram parity |
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

- Full `components-vue` suite: 124 files, 2,516 passing tests across Classic and Vapor.
- Dataviz Vue suite: 37 files, 160 passing tests.
- Both `vue-tsc` checks, published consumer types and Classic/Vapor/3.5 builds.
- K25 and AST guards; 41 publication/source guards and 142 review interaction
  witnesses in each runtime.
- Packed installations with npm 10.9.9: root import without editor peers,
  explicit editor-peer installation, P0/full capture and WebFrame identity;
  10 passing tests each for Classic, the 3.5 compiler output and Vapor.
- Vue smoke-pack, including strict peer resolution and consumer typechecking.
- Component-index: 436 fresh artifacts, 13 generation guards and 155 tests;
  provenance: 922 entries; licensing: 22 publishable packages.

The generated contract baseline records 25 Vue cells becoming complete after
the scalar restrictions remove extraction losses. It also records the typed
keyboard aliases, newly extractible caption and public presence class.

## Publication prerequisite

The live registry check rejects this candidate because
`@sentropic/design-system-themes@0.14.0` and
`@sentropic/diagram-canvas@0.2.0` are absent. Those prerequisites must be
published before the Vue release. Dataviz retains its five-package lockstep
version and pins this Vue candidate; its new gate likewise requires that pin
to exist before publishing the adapter. Local tarball installation does not
claim registry availability. No release tag is created by this follow-up.
