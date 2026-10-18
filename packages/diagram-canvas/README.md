# @sentropic/diagram-canvas

The headless **scene** and its **hit test** for a diagram view, and the
**layout engine** that produces a view from a semantic document. Pure computation:
no DOM, no renderer, no framework, no design system package. One bare import
specifier, `@sentropic/diagram-core`.

This is the first slice of `GD-M2-CANVAS`. It delivers the `Scene` /
`GeometryFrame` of the study's five objects (§4.1) and the geometric selection
primitives of §7; the layout engine (SPEC_EVOL_DS_JSON_RENDER_STANDARD §10.5,
L8) was added after it. What it deliberately leaves out is listed
under *What is not covered yet*, with the lot that owns each item.

## Why this package is private

`"private": true` here is a **consequence**, not a preference.

It depends on `@sentropic/diagram-core`, which is itself `private: true` and is
not on the registry:

```
$ npm view @sentropic/diagram-core version
npm error code E404
npm error 404 Not Found - GET https://registry.npmjs.org/@sentropic%2fdiagram-core - Not found
```

A published package that names an unpublished dependency installs broken for
every consumer, and `pack:smoke` has already caught that exact failure once in
this repository (see the header of `scripts/verify-layering.test.mjs` on PR #65).
Inside the workspace the dependency resolves by link, which `package-lock.json`
records as `"resolved": "packages/diagram-core", "link": true` — no registry URL.
So this lot depends on no npm publication at all, and the publishable package
count stays at 17.

## The three contracts this slice fixes

`diagram-core` persists data and states, in as many words, that the meaning of
some of it belongs here. Each of the three is fixed in one module, with the
reasoning in that module's header.

### 1. The camera, and the one transform — `transform.ts`

`PresentationState.camera` is `{ x, y, zoom }`. `validateView` checks the three
are finite and that `zoom > 0`. **Nothing in `diagram-core` says what `x` and `y`
mean** — not `view.ts`, not its README, not a fixture. The comment there says only
that "a renderer adapter maps these three numbers to its own camera contract;
that adapter is GD-M2-CANVAS work".

This package fixes the reading:

> `camera.x`, `camera.y` are the **world point drawn at the view origin**, and
> `camera.zoom` is **CSS pixels per world unit**.

Chosen over a centre-based reading because it needs no viewport size, so
`worldToView` is a function of the camera alone and a scene can be built and
hit-tested with no viewport at all.

`worldToDevice(camera, viewport)` is the whole world → view → CSS pixel → device
pixel chain of study invariant 8, and `hitTestAtDevicePoint` **inverts that same
composition** rather than deriving its own. A test sweeps three cameras × three
viewports × five probe points and asserts the device-space answer and the
world-space answer name the same occurrence.

Note for a future `diagram-canvas → graph` edge: `packages/graph/src/gitflow-labels.ts`
carries a **different, centre-based** camera reading (`(wx - camera.x) * zoom +
camera.width / 2`) in four private closures, over a `GitFlowLabelCamera` that also
holds `width`/`height`. Two readings coexist in the repository today. Unifying
them means changing a published package's semantics, which is not this lot's to
do — it is recorded here so it is not discovered by surprise.

### 2. Filter evaluation and the cascade — `visibility.ts`

`diagram-core` declares, validates and persists `ViewFilter` and says it does not
evaluate it, naming this lot. Four points the schema leaves open are decided
there, each with its reason: how several filters of one kind combine, what
`attribute-equals` applies to, what it means for a `collection` attribute (which
has `items` and **no `value` field**, so the schema comment cannot be read
literally), and the cascade — **a relation occurrence whose endpoint is hidden is
excluded with reason `endpoint-hidden` and reported**, never dropped, because
study invariant 1 forbids an edge disappearing in silence.

### 3. Paint order and hit regions — `scene.ts`, `hit.ts`

`EntityOccurrence.z` is the only paint-order field in the model; a
`RelationOccurrence` and a `PortOccurrence` have none. So the scene derives a
**total** order — plane, then kind (edge, node, port), then port order, then
occurrence reference — a port inheriting its owner's plane and an edge taking the
lowest plane of the occurrences it joins. `hitTest` walks that same order
backwards, so "topmost" cannot disagree with what a renderer draws on top.

Two measured details that shaped the code rather than being assumed:

- **`width` and `height` may be negative.** `validateView` checks only that
  geometry values are *finite*; there is no non-negativity branch. So
  `{ x: 40, y: 25, width: -30, height: -20 }` is valid persisted data, and a
  scene that read `x .. x + width` as the span would make that shape
  unselectable while every normalising renderer drew it perfectly.
  `normaliseRect` is therefore required, not a nicety.
- **Negative zero is normalised away.** `invert(IDENTITY)` returned `-0` in four
  of six components on the first run. `-0 === 0`, so nothing miscomputed, but
  `Object.is(-0, 0)` is false while `canonicalise` writes both as `0` — two
  frames could compare unequal and hash identically, which is the one thing a
  revision must never do.

## `sceneRevision` holds no camera

The frame carries no camera, deliberately. A pan or a zoom changes no geometry
and no paint order, so folding the camera in would move `sceneRevision` on every
wheel event and destroy its only use. Asserted both ways: panning and zooming
leaves the revision alone, and moving one coordinate by one unit moves it.

`sceneRevision` is `fnv1a64` through `diagram-core`'s `hashContent` —
**non-cryptographic**, like that package's own caveat. It detects change; it
proves nothing.

## Conservation

Every occurrence of the view is either an item of the frame or an entry of
`exclusions`, exactly once. `sceneOccurrenceCount(frame)` is that sum and a test
compares it with the view's own count, including under the cascade that removes
most of the view. An occurrence dropped in silence breaks it, and an empty scene
cannot satisfy it unless the view was empty too.

## The graph edge this slice does not pose

`docs/graph-dataviz-architecture-dag.json` declares `diagram-canvas → graph`.
This slice does **not** pose it, and `tests/no-dom.test.ts` forbids the import so
the omission is enforced rather than merely intended. The reason: this scene is
built from **persisted view geometry**, where every rectangle carries its own
width and height, so there is no layout to run and no drawn radius to derive.
The layout engine (see Layout) does not change that: it writes such geometry
into a `ViewDocument` and imports nothing from `@sentropic/graph`.

When the canvas later hit-tests a **graph-rendered** scene — nodes sized from
`nodeSizes` through `drawnRadius`, edges tessellated into curves — it MUST consume
`packages/graph/src/render-geometry.ts`, which declares itself the single source
"so Canvas2D, WebGL, and the hit-test all consume ONE computation". Recomputing
those radii here would be the hit↔render drift that module exists to prevent.
That is the next slice's obligation, and it is written down here so it is not
rediscovered.

## What is not covered yet

| Not here | Owner |
|---|---|
| Selection state, marquee lifecycle, focus, keyboard traversal | next `GD-M2-CANVAS` slice |
| Geometric port editing (moving a port along a side, re-siding it) | next `GD-M2-CANVAS` slice, by SPEC 3.5 |
| Annotations and circling | `GD-M2-CANVAS`, later |
| Framework adapters (Svelte / React / Vue / Angular) | `GD-M2-DS-PRESENTATION` and the four DS packages |
| Rendering: SVG, Canvas2D, WebGL, export | `@sentropic/graph`'s renderer and later slices |
| Labels in the scene | the layout engine measures text through an injected function and places labels (`placeEdgeLabels`); `SceneFrame` still carries no label item |
| The group box of a collapsed group, and aggregate edges | later; this lot evaluates the `collapsed` flag and nothing more |
| Projection, `LayoutOutcome.inverse` | `@sentropic/graph/processing`, already delivered; the L-R1–L-R11 layout is here (see Layout) |
| Lasso and polygon selection | later; point and rectangle are what a selection needs first |
| A spatial index (quadtree, grid) | not yet warranted — see below |

### Why no spatial index

Hit testing is a linear scan over `SceneFrame.items`. Measured on this machine
(Node v22.22.1) rather than assumed, with `scripts/` untouched — see
`spec/SPEC_EVOL_GD_M2_CANVAS.md` §6 for the figures and the command. An index
would be the right answer above a node count this slice's scenes do not reach,
and adding one before the measurement said so would have been a second spatial
structure to keep correct. `packages/graph` already holds two private ones
(`OccupancyGrid` in `gitflow-labels.ts`, the Barnes-Hut `Quad` in
`processing/graph-layout.ts`); neither answers a point query, and neither is
exported.

## Layout

`layoutDocument(document, options)` is the layout engine of SPEC §10.5: it
implements the rules L-R1–L-R11, written in this repository from the rule text.
Pure TypeScript in `src/layout/`, no DOM, no dependency beyond
`@sentropic/diagram-core`.

**Input.** A `diagram-core` `SemanticDocument` under `generic@1`: `node` and
`container` entities, `link` relations, nesting through the `contains` tree, with
no view and no geometry. It goes through `validateDocument` first; an invalid
document is refused with those diagnostics, verbatim (`document-invalid`). A
relation or entity the engine does not lay out (`association`, another profile)
is refused by name, never dropped. `options` holds the profile registry, the
host's content width (`targetWidth`, CSS px) and a **text measurer**: the engine
has no font metric source, so the host injects one, and must draw labels with the
same one. Tests use a fixed-width measurer.

**Output.** A `diagram-core` `ViewDocument`, which `validateView` accepts, and
no other structure to persist:

- one entity occurrence per entity, with its bounds; containers have `z` below
  nodes (outermost lowest), nodes `z = 0`;
- one relation occurrence per `link`, whose `waypoints` are the whole route,
  dock to dock, source to target (`relationRoute` reads it back); `contains` is
  drawn by nesting and has no relation occurrence;
- one port occurrence per semantic port a link targets, with the side, slot order
  and anchor the docking chose;
- `presentation.camera.zoom` is the L-R7 scale.

The call also returns `fit` (direction, size at scale 1, zoom, `pans`, `phone`)
and `warnings` for what it could not fully satisfy (`label-unplaced`,
`route-obstructed`, `row-fill-partial`), reported rather than dropped.

| Rule | What the engine does | Fixture |
|---|---|---|
| L-R1 lone edge at the centre | an edge alone on its side docks at that side's centre | `tests/layout/rules.test.ts` |
| L-R2 shared side spread symmetrically | n slots at `(i - (n-1)/2) * s` from the centre; `s` widens for labels, narrows to `length/(n+1)`, and a node too short grows | idem |
| L-R3 bends minimised after docking | A* on an orthogonal grid, cost `bends * 1e7 + length`; checked against an independent 0-1 BFS oracle | idem |
| L-R4 row alignment and fill | top-to-bottom: the containers of a rank take its top and height; left-to-right: containers whose vertical spans overlap take a common top and height, members below are pushed down | idem |
| L-R5 flow direction | left-to-right when that drawing fits `targetWidth` at scale 1, else top-to-bottom (subject to L-R7 when neither fits); no option forces it | idem |
| L-R6 rank and order | longest path; edges taken in ascending relation id, the one closing a cycle (the greatest on it) reversed; barycentre sweeps, ties by entity id | idem |
| L-R7 target width, phone fallback | L-R5 chooses at every width, phone included; neither fits: the narrower drawing wins (top-to-bottom on a tie); zoom down to 0.75, then `pans`; the page never scrolls horizontally | idem |
| L-R8 edges across containers | every entity is an obstacle except the ancestors of either end | idem |
| L-R9 parallel edges | distinct slots, same id order at both ends; a grid unit used by a parallel edge is forbidden to the next | idem |
| L-R10 edge labels | centred on the longest segment that can hold the label (`placeEdgeLabels`, segments by decreasing length); when none can, the rank gap or the sibling gap the route crosses is widened until one can | idem |
| L-R11 legend | none: the view holds no legend occurrence, group or field, and the options have no switch | idem |

Determinism: the same document laid out twice, and with its entity and relation
records shuffled, gives byte-identical `serialiseView` output
(`tests/layout/determinism.test.ts`). Time: a document of 40 nodes in 3 nesting
levels (9 containers, 44 links, 4 labels, one cycle) lays out in a median of
about 9–15 ms on the development machine (Node v22.22.1), against a 1000 ms
budget in `tests/layout/performance.test.ts`, which prints the figure.

Limits, stated rather than hidden:

- A label no rank or sibling gap can clear is reported as `label-unplaced`:
  lengthening moves the lane and the blocker together (the same member carries
  both ends), the shape spans the lane past the label on both sides, or the
  segment lies outside any rank gap. Seen once on the 40-node fixture laid out
  left to right (`relation:x4`, a hand-off label thrown over the top of the
  drawing), pinned in `tests/layout/rules.test.ts`.
- A docking point on an entity occurrence is held as the first or last waypoint:
  a relation occurrence endpoint drawn on an entity cannot hold one, and a port
  occurrence may only draw the relation's own semantic port
  (`diagram-core/src/validate.ts`, the `occurrence-endpoint-mismatch` check).
  `buildScene` therefore adds a stub from the entity's centre to that first
  waypoint (`src/scene.ts`), which lies inside the entity and is painted under it.
- Cross positions come from barycentric isotonic placement per level, not a
  global straightening pass: a long edge can bend around a rank where a lane is
  not aligned with its docks. L-R3 holds for the docks it gets.
- Semantic ports no link targets get no port occurrence.

## Source tree

```
src/transform.ts    the camera contract and the one world -> device composition
src/geometry.ts     rectangles, points, segments, polylines; the two conventions
src/visibility.ts   filter evaluation, the cascade, the exclusion reasons
src/scene.ts        SceneFrame, port anchors, relation routes, paint order
src/hit.ts          point, region and device-space hit testing
src/layout/         the layout engine, L-R1–L-R11 (see Layout)
tests/              8 suites; types-nominal.test.ts is a COMPILER test
tests/layout/       one fixture per layout rule, contract, determinism, time budget, h2a dossiers
```

## Gates

```
npm run --workspace @sentropic/diagram-canvas build   # tsc -> dist
npm run --workspace @sentropic/diagram-canvas check   # tsc over src AND tests
npm run --workspace @sentropic/diagram-canvas test    # vitest, node environment
```

`check` compiles the tests on purpose. `tests/types-nominal.test.ts` proves the
nominal references survive this package's boundary with one `@ts-expect-error` per
illegitimate assignment; widen `sceneItemOf`'s parameter to `string` and `check`
reports three × TS2578 ("Unused '@ts-expect-error' directive") — measured, not
assumed. Remove one key from `REASON_KEYS` and it reports TS2741 naming the
missing reason.

Unlike `node --test`, `vitest run` exits **1** when its include pattern resolves
to nothing (measured: `npx vitest run --root packages/diagram-canvas
'tests/**/*.nomatch-zzz.ts'` prints "No test files found, exiting with code 1").
So this package's test gate cannot go green on an empty set, and needs no file
floor of its own.
