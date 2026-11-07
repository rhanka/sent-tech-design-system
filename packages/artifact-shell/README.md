# @sentropic/design-system-artifact-shell

Viewer-chrome shell for the artifact viewer: the comment-mode surfaces
(`CommentModeToggle`, `CommentModeStatus`, `BlockHighlightOverlay`,
`LassoLayer`, `BlockCandidateList`) and, in later lots, the header, pins,
versions, composer, drawer and thread surfaces. The package is display-only:
it renders display models (opaque keys, viewer-space rectangles, label
strings) supplied by the host adapter and emits intents; it never parses
anchors, never touches the framed page DOM, and owns no mode state.

- **Status:** `private: true` at creation (version `0.1.0`). Publication is
  the AS-R release decision, which flips visibility and adds
  `publishConfig.access: public`; until then the licensing gate skips this
  package. `LICENSE` and the generated `LICENSE.THIRD-PARTY.md` are committed
  from day one so the AS-R flip is a manifest-only change.
- **Framework:** Svelte 5 only. Components are `.svelte` files compiled with
  `svelte-package`, mirroring `packages/components-svelte`. Svelte primitives
  are imported from `@sentropic/design-system-svelte` (peer + dev pin), never
  copied; lucide is reached only behind DS `Icon` names. React/Vue/Angular
  parity is staged in later AS-P lots and is not claimed here.
- **Elements parity:** `no-counterpart`. Viewer chrome is not a JSON-render
  catalogue component, so this package enters the component-index population
  only with its AS-P parity lots.
- **Root component:** none in v1. The package exports the individual
  components only; the AC-9 adapter composes them.

Spec: `scratchpad/artifact-shell/as01-spec-frozen.md` (sha256 `8f7bb962…`).
Spike log and lot record: `SPIKES.md` in this package.

This package ships no component documentation yet; AS-0 delivers the package
scaffold, the frozen display-model types (`src/lib/types.ts`), the fixture
factories (`src/lib/fixtures.ts`), the import-graph / client-neutrality gate
(`src/lib/import-graph.test.ts`) and the scaffold smoke witness.
