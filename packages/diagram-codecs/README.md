# @sentropic/diagram-codecs

Static string codecs over one resolved diagram scene: a draw.io export and
the scene SVG. Pure-string, DOM-free — no DOM, no renderer, no framework,
one dependency (`@sentropic/diagram-canvas`, pinned exact).

```ts
import { toDrawio, toSvg } from "@sentropic/diagram-codecs";

// `scene` is the `resolveScene` output for one view state.
const drawio = toDrawio(scene, { metadata: "<opaque carrier payload>" });
const svg = toSvg(sceneInput); // re-export of `renderSceneSvg`
```

## `toDrawio(scene, options)`

Builds a draw.io `<mxfile>` document from the `resolveScene` output:

- **Shapes** — rounded rects. Cards carry the tint of their resolved
  category reference (a fixed pastel palette; an unnamed category hashes
  stably into it), zones use a neutral frame fill.
- **Containment** — an expanded zone becomes a draw.io container: its
  children are parented inside it with geometry relative to the container,
  so the nesting edits like nesting. A folded zone is one atomic box.
- **Edges** — connected between the ids they touch (source and target are
  kept), with their intermediate waypoints. Stroke style, dashes and
  arrowheads follow the DE-2 connector registry words the scene edges
  carry: `solid | dashed | dotted`, `arrow | filled-triangle |
  open-triangle | none`, plus the emphasis colour/width axis. Dashes emit
  `dashPattern` from the registry dash array; `open-triangle` emits an
  outlined arrow; `none` omits the arrowhead.
- **Metadata** — `options.metadata` is an optional opaque string written
  verbatim alongside the diagram in the `<mxfile>` (a
  `DiagramCodecsMetadata` CDATA block). Callers that embed a carrier
  payload own both its format and its round-trip check; the export never
  reads or interprets it.

The export is **static**: the geometry of the single view state passed in.
There is no live folding, no relayout, no edge regrouping — open it in
draw.io and edit the shapes; the fold state does not come back. Output is
byte-stable for the same scene object (no timestamps, no random ids).

## `toSvg`

`toSvg` is a re-export of `renderSceneSvg` from
`@sentropic/diagram-canvas/diagram-render`: the identical function, the
identical bytes, under the codecs name.

## What is not covered yet

Edge labels are not carried into the draw.io document; only shape text is
(the scene's edge labels stay on the SVG, Svelte and Vue targets). ERD
cardinality markers (extra marker geometry on `erd@1` edges) are not
drawn; those edges are emitted without a registry arrowhead, mirroring
`renderSceneSvg`, which also paints no `marker-end` for them.

## Publication

Published through `.github/workflows/diagram-codecs-publish.yml` on tags
`diagram-codecs-v<version>` (CI only; release order in `docs/release.md`:
diagram-core → diagram-canvas → svelte → diagram-codecs). The first
publish bootstraps with the owner's temporary `NPM_TOKEN` (npm only allows
declaring a trusted publisher on a package that already exists), then the
trusted publisher is declared and an OIDC validation publish follows; the
bootstrap step and its `DECLARED_TOKEN_BOOTSTRAPS` entry are removed after
that.
