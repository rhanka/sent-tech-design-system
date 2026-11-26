# Changelog

## Unreleased — @sentropic/diagram-canvas 0.8.0 (focus-bridge subpath)

- diagram-canvas: publish `@sentropic/diagram-canvas/focus-bridge` subpath
  re-exporting `validateSceneDocument`, `layoutScene`, `renderProcessTable`,
  `shippedSceneRegistry`, `shippedSceneBindings` and scene types without DOM
  or side effects.
- design-system-elements: switch Focus dossier diagram imports to
  `@sentropic/diagram-canvas/focus-bridge`.
- Bump `@sentropic/diagram-canvas` to `0.8.0` and update exact pins in
  `design-system-elements`, `design-system-svelte`, `design-system-vue`, and
  `diagram-codecs` plus `package-lock.json`.

## @sentropic/design-system-svelte 0.48.0 — Survey kit (S-1..S-4)

- **S-1 (PR #347)**: add `LikertScale` (4–7 steps, `@container` auto/stacked/horizontal layout, `aria-describedby` poles); add `card` variant (`>= 48 px` touch targets), `columns={2}` / `horizontal` `@container (min-width: 520px)` layout, `$bindable` `value`, validation/error wiring (`description`, `required`, `invalid`, `errorText`) to `Radio`/`RadioGroup` and `Checkbox`/`CheckboxGroup`, plus `exclusiveValues`, `minSelections`, `maxSelections` and live status region on `CheckboxGroup`.
- **S-2 (PR #348)**: add `SurveyQuestionCard`, `SurveyNav` (with explicit partial-submit confirmation `Modal` and `>= 44 px` controls), and `SurveyPrivacyNotice` (`auto` / `card` / `collapsible`, `sticky` side card); add `Stepper` `compactMobile` (`< 25rem` container query) and `Input` `aria-describedby` linking for `helperText` / `errorText`.
- **S-3 (PR #345)**: add `SurveyForm` and `survey-types`, `survey-storage`, `survey-flow` helpers (`fromKeynoteQuestionnaire`, `shuffleSurveyOptions`, salted `hashSurveyEmail`, 30 min draft TTL, 24 h explicit offline submission queue, magic-link flow without draft resume bypass, optional passkey prompt).
- **S-4 (PR #346)**: add `SurveyResults` and `survey-results-model` (16:9 projection/standard SSE snapshot room view, client privacy thresholds `minCellSize = 5`, `minSegmentSize = 10`, `lowNThreshold = 120`, `ForceGraph` co-response network, segmented `BarChart` / `Table` breakdowns); add `BarChart` `labelPlacement` (`"auto" | "margin" | "after-value" | "inside-bar" | "above-bar"`) and `labelFontSize`; add `GraphLegend` `size` (`"sm" | "md" | "lg"`), `variant` (`"overlay" | "inline"`), and typed edge colours.
- Align `@sentropic/design-system-svelte` `0.48.0` pins in `dataviz-svelte`, `artifact-shell`, and `apps/docs`, align `theme-devmtl` `tokens`/`themes` `0.17.0` pins with its committed `devmtl.css`, regenerate lockfile and `component-index` artifacts, and update `docs/graph-dataviz-m1-provenance.json`.

## Unreleased — DE-3 Milestone 1 (DE3-L1a, DE3-L2a)

- diagram-canvas, Svelte and Vue `DiagramSceneFigure`: suppress auto-generated
  link legend when a scene already carries a visible authored `form: "legend"`
  node (`data-authored-legend=""`), and pre-reserve scene legend rectangles in
  label clearance (`DE3-L1a`).
- tokens and themes: add `diagramScene.linkStroke` (`semantic.text.primary` /
  `#0f172a` light, `oklch(96% 0.005 250)` dark) and raise default `r7`
  `linkStrokeWidth` / `linkRelatedStrokeWidth` from `2.5px` / `3px` to `3.5px`
  across regenerated theme CSS (`sent-tech`, `entropic`, `forge`); keep
  `emphasis` at `3.5px` (`D-DE3-1` open) (`DE3-L2a`).
- diagram-canvas, diagram-codecs, design-system-elements, Svelte and Vue
  `DiagramSceneFigure`: align `r7` resting link strokes, `<marker>` fills,
  legend swatches, rendered bounds and draw.io `r7` export to `linkStroke` and
  `3.5px` while preserving `process@1` (`2.5px`, `edgeStroke`) and `v1`
  byte-identity (`DE3-L2a`).
- Bumped minors for changed defaults and pins: `tokens` `0.17.0`, `themes`
  `0.17.0`, `diagram-canvas` `0.7.0`, `diagram-codecs` `0.2.0`,
  `design-system-elements` `0.5.0`, `design-system-svelte` `0.47.0` (above
  PR #350's `0.46.1` Stepper patch), `design-system-vue` `0.43.0-next.0`.

## @sentropic/design-system-svelte 0.46.1 — Stepper horizontal alignment fix

- Stepper: centre horizontal step connectors on the step bubbles and join the
  last step cleanly (PR #344).

## Unreleased — DC-2c.1

- diagram-core: additive relation refinements, authored flow types, validation,
  deterministic indexing and process-mapping fixtures.
- diagram-canvas: ordered parallel routes, fold/fan-out/obstructed bundles,
  arrow and badge placement, one-pass repair, flow-aware cache keys and a pure
  shared interaction/static-mark model.
- tokens: frozen flow geometry and contrast-tested colours in shipped modes.
- Svelte and Vue DiagramSceneFigure: badges, hover/focus/selection, scenario navigator,
  keyboard, controlled props, focus repair and token-sized targets.
- Both hosts pass a shared case table, normalized DOM comparison, SSR and
  interaction budgets. Controlled proposals wait for props before updating
  readouts, announcements or filters; plain links retain their scenario-filter
  appearance. Compatibility layout and label diagnosis refuse invalid flows.
- Animated direction, owned state and detail controls follow in DC-2c.2.
- Planned package minors: tokens/themes 0.14.0, diagram-canvas 0.2.0 and Svelte 0.41.0.
# 0.41.0-next.2 — Vue V8 review corrections

- Guard Vue and dataviz publication on npm dependency and peer availability;
  include rich-text and the V8 subpaths in packed-consumer checks.
- Restore Composer capture-phase key interception, attribute forwarding,
  accessible tooltips, optional editor peers and the DS Icon token contract.
- Reject VNode/component content props in favor of the documented named slots;
  see `packages/components-vue/bench/CONTRACT-CHANGES.md` for migration examples.
- Share WebFrame with dataviz-vue and preserve `.once` and merged listeners.
- Pin rich-text 0.1.1 so published optional editor/collaboration peers reach
  consumers; verify registry-resolved tarball installs without those peers.
- Preserve Svelte fold-toggle SVG attributes while composing DS Icon, initialize
  initially open Modal/Drawer, and retain caller dialog labels and scrolling.
- Reject missing or duplicate ancestor/descendant attribute forwarding and cover
  full-profile paragraph edits and synthetic trailing paragraphs in native Vapor.
