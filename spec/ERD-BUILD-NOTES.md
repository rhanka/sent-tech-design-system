# ERD build notes

Branch: feat/erd-notation. Scope: this worktree only; no commit, push, stash, publication or release.

## Delivered contract

- diagram-core exports erdProfile (erd@1), convertEngramErdScene, EngramErdScene, and the ERD reference helpers. Register through m3ProfileRegistry or allProfilesRegistry and pass shippedExecutorBindings. The retained default registry stays compatible with the four earlier profiles.
- Entities carry name/schema. Each field is a semantic field port with name, dataType, pk, optional fk reference to another entity's field, nullable, and ordinal. One relationship has from/to endpoints and typed fromCardinality/toCardinality plus fromRole/toRole attributes. Existing document/endpoint shapes remain intact.
- diagram-canvas exports measureErdCard, renderErdCardSvg, erdMarkerGeometry, renderErdMarkerSvg and renderErdTable from its root and diagram-render subpath. layoutMeasured/layoutFolded dispatch ERD documents to the same packRows and routeEdges primitives used by the existing measured engine. DiagramSceneFigure in both frameworks uses the same geometry, escaped SVG and native HTML table helpers.
- Fixture is copied byte-for-byte from the supplied acceptance source, SHA-256: 5f09263a5ab8bf9a4f6229822fb1a4a76ae974998b29c46e50f3b77d0e1ac21a. Expected totals: 5 scenes, 49 entities, 529 fields, 49 PKs, 108 FKs, 134 relations.

## Pragmatic decisions against the spec and reviews

1. The user-provided single-PK, no-composite-key contract takes precedence over composite-key/bundle proposals. Missing or multiple PKs are errors. The profile's executable erd-keys constraint enforces 17 fields, distinct names/ordinals, FK existence and PK targeting; generic schema/endpoint validators enforce the remaining declared data types and two ends. No new port-limit field or digest exception is needed: maxFields is already covered by the profile-constraint digest.
2. The source scene's cardinalities are preserved verbatim, independently of field nullability. This resolves the Argon review's nine conflicting frozen relations. Both ends many means exactly one entity-to-entity relationship, with no join class or additional FK relation. FK-less relations use entity/header ends. Other materialized relations use FK-to-PK row ports.
3. Scenes do not explicitly bind a relation to a source FK column. For multiple candidate FKs, choose the best relation/field identifier word match; operatedBy selects operatedByActorId/operatedBySystemId, ownedBy selects ownerActorId, partOf prefers parentSystemId, assignsAccountable prefers accountableInstanceId. Ties preserve field declaration order. The source FK metadata itself is always retained unchanged.
4. Use one relationship type rather than separate reference/association types; endpoint target kind distinguishes row and entity attachment. A relation stays one relation. Names and labels retain source text. No identifying/non-identifying inference is made from the source.
5. Encode reference local IDs injectively as separated Unicode code points, avoiding illegal colons and punctuation collisions. Relation IDs include their source ordinal so parallel relations cannot overwrite each other.
6. ERD entities are foldable leaves, separate from containers. Generic counterpart-port behaviour is retained. The ERD measured adapter regenerates both west/east field occurrences on every pass, rebinds ends after placement, and hides their hit regions when folded. Folded port endpoints retain semanticTarget/sourceOccurrence provenance. Self relations remain visible on folded headers so entity/field/relation counts are conserved.
7. Geometry lives in component.diagramErd tokens and verified numeric mirrors, following the existing canvas pattern. Width 460, header minimum 64, row minimum 32; multiline rows grow from a shared measurement. Long identifiers/enums/FK targets wrap without truncation or refusal. Each row shows PK/FK, name, type, target, and ? (nullable) or NN (non-nullable). Header height also grows when necessary.
8. Row shelves use measured variable card heights, deterministic sorted entity order, and wider ERD gutters (160 inline, 120 block) to accommodate markers and labels. Layout is independent of viewport zoom. ERD uses row orientation; it does not reinterpret generic hierarchy hints or add mixed-profile layout support. The supplied scenes use one occurrence per entity; arbitrary multi-occurrence authored views are outside this minimal adapter.
9. Crow's-foot strokes are inline SVG geometry (no globally colliding marker IDs). Optional zero circles paint the surface token over the edge stroke. Marker directions follow the emitted endpoint route. Folded/entity header slots remain distinct even at high degree.
10. Both hosts retain their existing camera and fold callbacks. A native header button exposes aria-expanded and restores focus after toggling; SVG is decorative and the always-available details/table contains all fields, including folded ones, and all relations. Both frameworks share generated SVG/table markup and are compared structurally after expand/fold/re-expand.
11. Every role label is retained. The shared label placer first uses available route segments; crowded labels move to non-overlapping nearby boxes with leaders. Route warnings remain observable through the existing layout event/result, and the table is the complete semantic fallback.
12. No dependencies, browser, Python, package-version changes or publication flow are introduced. Descriptions and provenance metadata in the acceptance source remain in the vendored fixture rather than being promoted to ERD semantic attributes.

## Verification

Final commands/results are recorded below after the closing run. Initial checks required building graph, rich-text, tokens/themes, elements and the DSFR theme from the locked workspace sources. A concurrent canvas performance run exceeded its test-level timeout; the final full canvas run is serialized without changing timeouts or budgets. The view-schema receipt refresh changes only hashes for modified implementation files, leaving governed schema pins intact.

## Integration

The converter returns { document, view, presentation }, ready to pass as DiagramSceneFigure props together with registry: m3ProfileRegistry and bindings: shippedExecutorBindings. Existing labels, defaultFolds/collapsed, fold callbacks, camera props and theme styles continue to apply. For a static asset, measureErdCard plus renderErdCardSvg renders an entity without a framework; renderErdMarkerSvg renders either end of a routed edge.

## Closing results

- npm ci --no-audit --no-fund: passed once, using the requested npm_config_cache. No new dependency.
- npm run test -w @sentropic/diagram-core -- --maxWorkers=2: 42 files, 553 tests passed.
- npm run test -w @sentropic/diagram-canvas -- --maxWorkers=2 --no-file-parallelism: 32 files, 365 tests passed, 1 skipped. Existing performance budgets/timeouts unchanged.
- npm exec -w @sentropic/design-system-svelte -- vitest run src/lib/DiagramErd.test.ts src/lib/DiagramSceneFigure.test.ts src/lib/DiagramSceneFigure.ssr.test.ts --maxWorkers=2: 3 files, 40 tests passed.
- npm exec -w @sentropic/design-system-vue -- vitest run src/erd-parity.test.ts src/diagram-parity.test.ts --maxWorkers=2: 2 files, 139 tests passed, including all five ERD scenes and exact structural DOM/ARIA comparison through two fold toggles.
- npm run check and npm run build for diagram-core and diagram-canvas: passed, including test type checking.
- npm run check and npm run build for components-svelte and components-vue: passed. Svelte check reports 0 errors / 26 warnings in its main configuration and 0 errors / 0 warnings in its parity configuration; Vue check passes.
- Tokens/themes builds and necessary existing workspace declaration builds for the global index: passed. index:generate, index:check and notices:generate: passed. Notices regeneration produced no notice diff.
- git diff --check: passed. No root test command, local browser or Python was run.

## Remaining limits

The dense diagram:archi@1 scene emits 7 route-obstructed warnings from the existing orthogonal router (operatedBy twice, loadedBy, partOf, consumesApi, uses, documents). Each retains an explicit elbow fallback and its cardinalities, markers and label. All 55 relations in that scene (134 in total) are present. Further shared-PK corridor optimization is optional follow-up; the accessible table remains complete. No release/publication is performed.
