# DC-2c.1 numbered flows

DC-2c.1 adds authored numbered interactions to the measured engine and Svelte
DiagramSceneFigure. Package versions are unchanged. Vue integration is pending
PR #267; animated direction, owned data and detail levels belong to DC-2c.2.

## Authoring

Call `withFlowTypes(document)` and check its diagnostics before using the returned
document. It adds document refinements `flow-step` → `link` and `flow-scenario` →
`node`, without a new profile. Run `validateDocument` then `validateFlows`.
`step` is an integer quantity in `unit`, 1–999; `branch` is a single lowercase
letter. `scenario` references a scenario entity; omission means the implicit
scenario. Omitted `kind` remains absent. Scenarios are metadata and have no view
occurrence. A flow relation has at most one occurrence per view; duplicate or
scenario occurrences refuse layout with `document-invalid`. Absent or filtered
steps are excluded from navigation. A self-step, or any step whose visible ends
resolve to the same box, is internal: navigation retains it without a route,
arrow or badge.

Numbers and kinds are consumer-authored. The DS does not parse BPMN. An
interaction from another component targets the reached task's executor; initial
and consecutive same-component tasks use self-steps. First interactions after a
gateway share a number and take branch letters; later branch steps get further
numbers. A join has one step per incoming interaction, sharing `realises` when
appropriate. A loop back-flow is numbered once, without unrolling iterations.
Multiple starts and named paths each have a scenario. See the hand-written facts
in `packages/diagram-core/tests/flows/mapping.ts` and the standalone
[Svelte reference](examples/DC2CNumberedFlows.svelte).

## Layout and interaction

`flows: { fanOutMax, countTemplate }` configures measured layout. The cap defaults
to 4. Svelte exposes `flows.fanOutMax` and uses `labels.count` as the count
template (`{n}` by default). Fold bundles take precedence over fan-out bundles;
obstructed groups get one whole-view repair. Unplaceable badges are omitted,
with warnings and retained targets. All bundle-member text labels are suppressed;
active summary labels remain available in descriptions only. Ordinary links keep
independent edges and receive no arrows. No-flow scene digests stay unchanged.

Selection and filter props are controlled when defined: `activeStep`, `scenario`;
otherwise `defaultActiveStep`, `defaultScenario` seed local state. User changes
emit `onStepChange`, `onScenarioChange`, `onHighlightChange`. Mount and prop
changes emit none; removal of a selected relation emits null once. Hover wins
over focus, then selection; filter-only state dims other scenarios. Escape clears
selection and mutes unchanged hover/focus until their identity changes. Internal
steps retain their relation identity on their visible box, including same-box
hover/focus. Node selection survives folding and retargets to its visible box.

Badges and sibling node buttons have separate roving groups (arrows, Home, End).
Brackets walk all logical steps, including internal and omitted-badge steps.
Escape clears; form fields, contenteditable and modified shortcuts are excluded.
Native buttons provide Enter/Space activation. Touch pans do not activate clicks.
Selection scrolling changes neither zoom nor layout. Geometry and cache keys do
not depend on hover, focus, selection or scenario filtering.

All visual values are diagramScene tokens. Colour derivation is tested for every
shipped theme mode, including dimmed text/pressed/stroke/focus contrast. Card
measurement's dependency-free geometry leaf mirrors badge typography; parity
checks bind it to the canvas defaults and token leaves. Flow CSS has no motion.

## Shared model and Vue handoff

Import `@sentropic/diagram-canvas/diagramSceneModel` for layout/scene geometry and
`@sentropic/diagram-canvas/flowModel` for `visibleOf`, `effectiveTarget`,
`highlightOf`, `reduce`, `describeTarget`, `announce`, `flowHitSize`, `stepChange`
and `flowMarksSvg`. `SceneModel` carries ordered badges, arrows, bundle members,
visible targets, node targets, endpoints, ancestors and entity representatives.
The Vue host should bind these outputs; it must not reimplement these rules.

After #267 merges, port Svelte's controlled-state boundary, delegated DOM events,
focus/scroll repair, navigator and token styles. Run the same unpublished
`diagram-canvas/test-support/flowHostCases.ts` table through a Vue adapter, then
compare the normalized DOM projections from both hosts. Canvas build emits this
support into ignored `dist-test-support`; it is outside published `dist` and has
no package export. Vue must also pass SSR arrows/badges, the 200-change budget,
retained-selection idle checks, token literal scan and controlled repair cases.
Vue host tests and cross-host DOM comparison remain pending; they are not
represented as passing Svelte evidence.

## DC-2c.2 handoff

Add data-item/state-group definitions, stateMatrix and ownership validation;
resolve authored folds/presets/overrides once; add opt-in finite dash pulses and
all cancellation paths. Keep the DC-2c.1 engine version. Astra3 requires empty
collection defaults, deduplicated/sorted reader and writer ids, and per-edge
completion assertions: running while any pulse remains, settled after the last.
No motion, data model or detail-control implementation is included here.

## Review and verification

Astra3's two blocking findings (internal identity and self-step classification)
and its view-cardinality/scenario/mapping clarifications are covered by tests.
Two independent design-verification passes also covered routing, labels,
controlled state, focusability, retained geometry and scene repair. The h2a MCP
review launcher is unavailable in this session; these are design reviews, not a
completed harness h2a consensus review.

Rendered appearance is not covered: no browser was launched. Reproduction and
AC-to-test evidence are recorded in `DC2C_RESULTS.md`.
