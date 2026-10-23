# SPEC EVOL — GD-M3-DIAGRAM-MODEL: the complete architecture-diagram model

| Field | Value |
| --- | --- |
| Status | Specification only. No implementation, no profile publication and no consumer switch-over is claimed by this document. |
| Date | 2026-10-23 |
| Branch | `spec/diagram-model-complete`, cut from `origin/main` |
| Deliverable of this lot | This file only: `spec/SPEC_EVOL_GD_M3_DIAGRAM_MODEL.md`. Nothing else is written, including nothing under `.track/`. |
| Language / tooling | This document is in English. No network access is used by any lot defined here. No Python is used anywhere (implementation, tests, jobs, one-off scripts): the stack is Node/TypeScript and the native tooling already present. No attribution trailer is added to any commit. |
| Governance | G2 (owner decision 2026-10-19): Engram governs profiles, schemas, fixtures and migrations. The Design System retains and publishes the generic `@sentropic/diagram-core` executor, layout and rendering. Consumers pin profiles; no second diagram metamodel. |
| Pivot | `packages/diagram-core` (`SemanticDocument` / `ViewDocument`, transactional commands, versioned profiles). This specification completes that pivot for architecture-style diagrams. It does not introduce a second model. |
| Executor assumption | The `unique-attribute` reporting-order fix on branch `fix/diagram-core-unique-attribute-order` (duplicates reported in id order, independent of insertion order) is assumed merged before M1 starts. M1 does not reimplement it. |
| Engram carrier | Engram work is carried by the gr-conductor session (repository `rhanka/engram`, local checkout `/home/antoinefa/src/graphify`). This repository defines the required Engram artefacts and the hand-off contract in §6; it does not write Engram code. |

## Owner order

Owner order of 2026-10-23, verbatim:

> « Non mais je veux le modele de graph pas le graph hrpn toi tu es le generaliste et la lib putain tu travailles avec engram. Pas de patchware engram doit avoir son modele complet selon la spec qui historiquement etait portee ici. »

Effect on this specification, normative:

1. The deliverable is the **graph model**, not one consumer graph. The HRPN graph, the HRPN scenes and the governance central scene are acceptance instances of the model (§7), never its definition.
2. The design system is the **generic library**. Every rule below is stated for any consumer of the model. No rule names a consumer, a scene id, a zone id or a consumer tint vocabulary.
3. The model is **complete for the validated diagrams with zero consumer patches**. After M1, the following are defects, not supported patterns:
   - a preserved extension that carries standard card or zone slots (the measured instance is `hrpn.zone-slots@1`, `preserved-unvalidated`, one per zone);
   - a document-local type refinement that exists only to carry standard card slots (the measured instance is `hrpn-card`, an additive refinement of `node`);
   - a display title edited to dodge a global uniqueness rule (the measured instance is two zones titled « CI/CD » stored as « CI/CD · GENAI PCP PLATFORM » and « CI/CD · AIRBUS AWS », with the rendered title kept aside as `displayTitle`).
   A document that still needs one of these three to validate is evidence that the model is incomplete, and the gap is fixed in the profile or the executor, never in the consumer.
4. Engram carries the complete model as historically specified in this repository (`spec/SPEC_EVOL_GD_M2_MODEL.md`, `spec/SPEC_EVOL_GD_M2_DS_PRESENTATION.md`, `spec/SPEC_EVOL_GD_M2_CANVAS.md`, `spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md`): versioned profiles, typed attributes, views and occurrences, commands and transactions, migration, fixtures. §6 states what Engram holds and what this repository keeps.

## 0. How to read this specification

- `SHALL` / `MUST NOT` state the proposed contract. A clause tagged `frozen-requirement` restates an owner-validated value from `DS-DIAGRAM-MODULES-REQUIREMENTS.md` (owner-validated 2026-10-21, reference render sentropic PR #711 merged as `4138a0ec`) and is not re-opened here. A clause tagged `measured-code` states a fact read from a pinned file, with its locator. A clause tagged `decision` states a technical choice settled by this specification; its rationale is recorded next to it and it is not an open question.
- All card sizes are card pixels (CSS pixels at zoom 1). The atomic card footprint is `460 × 200` in every state (`frozen-requirement`). No other size in this document is a card size.
- “Card” means the atomic-card entity type. “Container” means the wrapping-container entity type. “Fold” always means view state (§4), never a semantic attribute.
- File paths are relative to this repository unless an absolute path is given. Engram paths are relative to `/home/antoinefa/src/graphify` unless stated otherwise.

## 1. Decision: the completed profile is `generic@2`

### 1.1 The choice

`decision` — The complete model is published as **`generic@2`**, a new major of the existing complete diagram profile. It is not published as `architecture@1`, and no second complete generic profile is created.

The profile id keeps the established form `<name>@<major>` (`packages/diagram-core/src/profile.ts:21`), so `generic@1` and `generic@2` coexist in one registry and a document names exactly the major it was written against. An unknown major refuses in write and is preserved for inspection, as today.

### 1.2 Why not `architecture@1`

| Criterion | `generic@2` (chosen) | `architecture@1` (rejected) |
| --- | --- | --- |
| Existing consumers | The layout engine, the dossier binding and the h2a dossier builder already consume `generic@1` (`node`, `container`, `link`, `contains`). They re-pin one major. | Every consumer re-pins to a new family and the `generic@1` input contract forks. |
| Metamodel count | One complete generic diagram profile, completed. | Two complete generic profiles with overlapping card, container and link semantics: a second metamodel in effect, against G2. |
| Meaning of the additions | Kicker, title, body, footer, icon, tone, subtitle and legend keys are generic diagram chrome, not architecture-domain semantics. | The name claims a domain the slots do not have, and invites BPMN, UML or C4 work to duplicate the same chrome under further names. |
| Migration | One registered profile migration `generic@1 → generic@2` (§3.9, §5). Type ids do not change, so the migration is additive except for the two removals named there. | No migration exists by construction; every stored `generic@1` document is orphaned or hand-converted per consumer. |

Architecture remains a use of the model, not a profile name. A future domain profile (BPMN generated profiles under decision A′, ArchiMate, UML, C4) declares its own domain types and reuses the executor mechanisms of §5; it does not inherit card chrome by copying this profile.

### 1.3 What changes from `generic@1`, in one paragraph

`generic@2` keeps the `generic@1` type ids (`node`, `container`, `port`, `link`, `contains`, `association`), the `contains` tree hierarchy (`containment`), the limits shape and the command set. It adds the presentation-neutral card and container slots of §3.2, adds the legend types of §3.7, removes the global `unique-attribute` constraint on container `name`, removes the semantic `collapsed` attribute from `container`, raises the `link` label bound, and is validated by an executor that accepts hierarchy parents by type family, enforces only scoped uniqueness, and validates folded view projections. Everything else in `generic@1` carries over unchanged, so the migration of §3.9 is small and auditable.

## 2. Starting point, measured

Every fact below carries its locator. Where a measurement contradicts the completed model, the completed model is the fix and the measurement is the evidence.

### 2.1 The historical model (M2) already specifies the shape

`spec/SPEC_EVOL_GD_M2_MODEL.md` settles the core and this lot does not re-open it: a typed semantic core with versioned profiles, not a property bag (decision D1-A, §1 of that spec); broad read-only import with unvalidated content kept as `preserved-unvalidated` and never promoted to a fact (decision D3-C); seven nominal, non-interchangeable reference types; a `SemanticDocument` that excludes positions, camera and components; a `ViewDocument` of occurrences, visual groups, filters and persistable presentation state; transactional commands with an inverse or a documented reason; versioned schema migration that keeps the original and refuses an unknown major in write; fixtures including named rejected cases with asserted diagnostics.

`spec/SPEC_EVOL_GD_M2_BPMN_MODDLE_COVERAGE.md` (decision A′) adds the kernel direction this lot reuses for hierarchy families: type constraints are satisfied by the named type or any subtype, and containment is a structural parent link, not a relation endpoint competing with a reference (§5, §6 K1/K4 of that spec). The executor change of §5.2 is the `generic@2` application of that already-decided rule.

### 2.2 The current executor, and the three gaps it proves

Current code is `packages/diagram-core/src/` at the branch base. Measured facts:

- `generic@1` is the only `complete` profile (`packages/diagram-core/src/profiles/generic.ts:17`). `node` declares `name` (required, ≤ 200), `state`, `weight`, `duration`, `createdAt`, `pinned`, `tags`, `owner`. `container` declares `name` (required, ≤ 200) and `collapsed`. Neither declares `kicker`, `body`, `detail`, `footer`, `icon`, `subtitle` or `tone`, and `validateDocument` refuses an undeclared attribute as `attribute-not-in-schema` (`packages/diagram-core/src/validate.ts`, `packages/diagram-core/src/attributes.ts`). Standard card slots therefore cannot be stored as attributes today.
- The `contains` parent role accepts exactly `entityTypes: ["container"]` (`packages/diagram-core/src/profiles/generic.ts:78`), and the validator compares the target type by strict equality (`packages/diagram-core/src/validate.ts:329`, `role.entityTypes.includes(target.type)`). A document refinement of `container` therefore cannot parent: the diagnostic is `endpoint-target-not-allowed`. **Gap 1.**
- `generic@1` declares `{ kind: "unique-attribute", entityType: "container", attribute: "name" }` globally (`packages/diagram-core/src/profiles/generic.ts:102`), enforced over every container in the document (`packages/diagram-core/src/validate.ts`, `validateConstraints`). Two zones legitimately titled « CI/CD » collide as `unique-attribute-violation`. **Gap 2.**
- Because of gaps 1 and 2, the measured HRPN target (`/home/antoinefa/src/airbus-genair-hrpolnav/docs/architecture/hrpn/engram/`, `README.md`, `build-engram.mjs`, `S2-target.semantic.json`) stores card slots in a document-local refinement `hrpn-card` (additive refinement of `node`, six text attributes), stores zone slots in 19 preserved extensions `hrpn.zone-slots@1` (`preserved-unvalidated`, source JSON with `kicker`, `subtitle`, `footer`, `icon`, `tint`, `displayTitle`), and stores the two « CI/CD » zones under suffixed names. The documents validate with zero diagnostics today precisely because the patches route around the gaps. **Gap 3 is the pair of workarounds, gaps 1 and 2 are its causes.**
- Fold state today has two carriers: the semantic `container.collapsed` attribute and `VisualGroup.collapsed` in the view (`packages/diagram-core/src/view.ts:88`). The component specification under review (`git show spec/diagram-cards:spec/SPEC_EVOL_DS_DIAGRAM_CARDS.md`, §4.3) already decides the view carrier is the fold state; §4.1 below makes that a model rule and removes the semantic carrier in `generic@2`.
- The layout engine (`packages/diagram-canvas/src/layout/`) lays out `generic@1` only, reads only the `name` attribute per entity (`packages/diagram-canvas/src/layout/graph.ts`, `readGraph`), measures text through `TextMeasurer = (text, role) => TextSize` with roles `node | container-title | edge-label` (`packages/diagram-canvas/src/layout/types.ts`), and enlarges nodes for docking demand (`packages/diagram-canvas/src/layout/place.ts`, `packages/diagram-canvas/src/layout/engine.ts`). It accepts no fold input, no per-entity footprint and no measured header input, and it emits `groups: {}`. These are the measured inputs of blocking 2 (§4.4).
- `packages/diagram-canvas/src/visibility.ts` already evaluates `VisualGroup.collapsed`: a member of a collapsed group is excluded as `group-collapsed`, a relation whose endpoint is hidden as `endpoint-hidden`, with every exclusion reported. The scene (`packages/diagram-canvas/src/scene.ts`) conserves occurrences (every occurrence is an item or an exclusion, exactly once). §4.3 keeps this cascade and adds the folded-edge projection it currently cannot express.

### 2.3 The review blockings this specification closes

Independent review `scratchpad/rev/dcards-rev1.out` on the component specification, two blockings, restated as model requirements:

- **Blocking 1 — folded edge projection cannot produce a valid `ViewDocument`.** Retargeting a relation occurrence whose semantic endpoint sits inside a collapsed container (the review example: `CHAT → TOPIC` drawn to collapsed `MSGZ`) produces `occurrence-endpoint-mismatch`, because `packages/diagram-core/src/validate.ts` requires the drawn occurrence to draw exactly a semantic endpoint target. §4.3 defines the projected endpoint as view data with provenance, and §5 assigns the validator change. Every folded output SHALL pass `validateView`.
- **Blocking 2 — the engine contract lacks the fixed-footprint measurement input it promises.** No per-entity footprint or measured header input exists, and placement enlarges nodes for docking, contradicting the fixed `460 × 200` card. §4.4 defines footprints and header measurement as layout input, a fixed-size policy that never enlarges a fixed footprint, and the docking-overflow outcome.

The same review records (item 4) that the three gaps of §2.2 do not justify weakening generic executor validation. This specification follows that: gaps 1 and 2 are closed by making the rules mean what they should mean for every profile (family acceptance, scoped uniqueness), not by exempting one consumer.

## 3. The complete model: `generic@2` (semantic)

The semantic model remains the M2 model: a `SemanticDocument` (identity, schema version, monotonic revision, declared profiles, document type definitions, entities, relations, semantic ports, resources, preserved extensions) and no geometry. This section declares the `generic@2` profile content and the three semantic rules that complete it. Persisted-shape impact is gathered in §3.9: the additions are profile data and two view fields; the only semantic removal is the `container.collapsed` attribute.

### 3.1 Entity types

`generic@2` declares four entity types. Type ids `node` and `container` are unchanged from `generic@1` so stored documents, the layout engine's type dispatch and the migration stay small (`decision`, §1.2).

| Type id | Role in a diagram | Parents via `contains` | Children via `contains` |
| --- | --- | --- | --- |
| `node` | Atomic card (leaf). One card, fixed footprint, never grows with its text. | No | No |
| `container` | Wrapping container (zone). Expanded it frames its children; collapsed it is one atomic card (§4). | Yes | Yes: `node`, `container`, `legend` |
| `legend` | Legend frame. Carries the document's colour-key categories as model data (§3.7). | Yes | Only `legend-key` (by convention enforced in §3.7 validation) |
| `legend-key` | One legend category: a key, a label and a colour token. Rendered as a colour-key line, never as an atomic card. | No | No |

`decision` — Container capability is a declared property of the type, not an inference from its id. Each `EntityTypeDeclaration` in `generic@2` carries the executor-visible classification of §5.2 (`container: true` for `container` and `legend`). A document type definition that refines `container` or `legend` inherits the capability through its base chain; a refinement of `node` or `legend-key` never acquires it. This is what lets a refined container parent (§3.4) without any consumer-specific rule.

Abstract types remain non-instantiable, as today. `generic@2` declares no abstract card or container type: the four types above are concrete, and specialisation is expressed by document refinement (§3.4), not by a fifth type.

### 3.2 First-class presentation-neutral slots

All slots are typed attributes validated against the profile, exactly as M2 requires: a value carries its kind, an undeclared attribute refuses as `attribute-not-in-schema`, and no slot is ever carried by an extension or a free property bag. Length bounds are set so the measured validated corpus fits without moving the frozen geometry; a longer text is a wording defect reported by measurement (§4.4), never a reason to enlarge a card.

#### 3.2.1 Atomic card (`node`)

| Attribute | Kind | Required | Meaning (presentation-neutral) |
| --- | --- | --- | --- |
| `name` | text ≤ 200 | yes | Title. The single identity-adjacent display string; it is content, never parsed, split or prefixed by an executor or a renderer. |
| `kicker` | text ≤ 80 | no | Short code or family line above the title (for example a service code). Display case is a rendering transform under the host locale; the stored string is the authored string. |
| `body` | text ≤ 400 | no | First body line (function line). One line of content; wrapping is measurement, not storage. |
| `detail` | text ≤ 400 | no | Second body line (detail line), rendered in the secondary text role. The `body` / `detail` split carries the line role in the model, so measurement, rendering and editing read the same role (closes the component review item on untyped `string[]` body input). |
| `footer` | text ≤ 120 | no | One pinned footer line (for example an owning service). Absent means no rule and no footer are drawn. |
| `icon` | text ≤ 40 | no | Pictogram registry name (for example `server`, `brain`, `robot`). A name, never SVG data, never a path. An unknown name is a rendering diagnostic, not a semantic refusal (§3.3). |
| `tone` | text ≤ 40 | no | Tone category key (for example `neutral`). A key into the document legend (§3.7) or a consumer category set; never a colour value. Absent means the neutral category. |

The `generic@1` general attributes `state`, `weight`, `duration`, `createdAt`, `pinned`, `tags` and `owner` carry over unchanged on `node`. They are not card chrome and no card renderer is required to display them.

Body cardinality (`decision`): a leaf card stores at most the two body lines above. The frozen card anatomy allocates exactly two body lines; a third line has no allocation to measure against and would reintroduce growth-by-text. Content needing more lines belongs in a container's `subtitle` (wrapped, §3.2.2) or in a child card. A profile that later needs longer leaf prose does so by a new major, not by widening these bounds silently.

#### 3.2.2 Wrapping container (`container`)

| Attribute | Kind | Required | Meaning (presentation-neutral) |
| --- | --- | --- | --- |
| `name` | text ≤ 200 | yes | Title **without** any package prefix. A stored title that embeds a prefix (for example « H2A · … ») is producer content to migrate, never a string a renderer splits. |
| `kicker` | text ≤ 80 | no | Package or family name carried by the header (for example `H2A`, `ENGRAM`). Same slot shape as the card kicker, so one header measurement and one header component serve both types. |
| `subtitle` | text ≤ 600 | no | Wrapped description under the header when expanded; the centred summary content when collapsed (§4.2). One string; line breaking is measurement. |
| `footer` | text ≤ 120 | no | Footer line shown by the collapsed card form (rule plus pinned footer). Carried as content when expanded; expanded frames draw no footer rule at the frame bottom. This is the declared form of the field the measured adapter had to invent as `cardFooter`. |
| `icon` | text ≤ 40 | no | Pictogram registry name, same registry and same slot rules as the card icon. The container icon box is the card icon box (`frozen-requirement`: same size for groups and cards). |
| `tone` | text ≤ 40 | no | Tone category key, same category space as the card tone. One key, one token resolution in both the expanded and collapsed forms. |

`generic@2` container declares **no** `collapsed` attribute. The `generic@1` semantic boolean is removed (§3.9): fold is view state (§4.1), two views of one document fold differently, and a fold never bumps the document revision.

#### 3.2.3 What a slot never carries

- No colour value (hex, rgb, token value) is stored in any slot. Colour enters only as a category key (`tone`, legend `token` name in §3.7) resolved through design tokens at render time.
- No geometry (size, position, folded height) is stored in any slot. Geometry is view data (§4).
- No markup, no SVG, no URL and no executable content is stored in any slot. Imported content that a profile does not validate keeps the M2 levels `validated | preserved-unvalidated | unsupported` and is never promoted to a slot value.
- No language-specific string is stored by the profile or the executor. Slots store authored content in the document's language; §3.8 states the localisation rule.

### 3.3 Icon and tone: registry names and category keys

`decision` — `icon` and `tone` are **open key spaces with a closed shape**, not closed enumerations in the profile.

- Shape: a key is 1–40 characters matching the language-neutral key form (lowercase ASCII letters, digits and hyphen, starting with a letter). The executor enforces the shape and the length; it does not enumerate the keys, because the pictogram registry and the tone category set are rendering and theme data that evolve without a profile major.
- Icon resolution: the renderer resolves `icon` against the design-system pictogram registry delivered on its own subpath (one duotone family, 64-unit viewBox; the validated set includes `brain`, `robot`, `server`, `people`, `window`, `link`, `db`, `shield`, `cloud` and the remaining glyphs of the validated scenes). An unmapped name draws no icon, collapses the icon slot and raises the rendering diagnostic `card-icon-unknown` / `zone-icon-unknown`; it does not refuse the document. Semantic validation therefore stays stable when a glyph is added.
- Tone resolution: the renderer resolves `tone` through the tone-token mapping in force (theme tokens, never a component-local colour). When the document declares a legend (§3.7), every non-neutral `tone` value in the document SHALL equal a declared legend category key; §5.4 adds that check as `tone-category-unknown`. Without a legend, a tone key is consumer category data and the executor checks its shape only. The validated HRPN category keys (`genair`, `specific`, `added`, `removed`, `risk`, `custom`, `outside`) and the governance keys (`neutral`, `proposal`, `identity`) are therefore all storable without a profile change, and none of them is named by the generic profile.

### 3.4 Containment: one hierarchy, family parents, nesting depth

Containment is the single hierarchy of the model.

1. **One relation, one hierarchy.** `contains` (roles `parent` / `child`, each `1..1`, directed) is the only hierarchy-bearing relation. Its hierarchy id remains `containment`, shape `tree`. Business containment, processing hierarchy and visual grouping stay distinct, as in M2: `VisualGroup` membership is not containment, a `link` is not containment, and no second hierarchy is declared by `generic@2`.
2. **Family parents.** The `parent` role accepts any entity whose effective type is `container`, `legend`, or a document type definition whose base chain reaches `container` or `legend`. The `child` role accepts any declared entity type. A refined container therefore parents with no extension, no second relation type and no profile change. The executor mechanism (effective-type resolution over the base chain) is specified in §5.2 and applies to every `entityTypes` constraint, not only to `contains`.
3. **Tree rule.** Each child has at most one `contains` parent; a second parent refuses as `hierarchy-multiple-parents`; any cycle refuses as `hierarchy-cycle` with its members. Both diagnostics exist today and keep their codes.
4. **Nesting depth.** Depth is the number of `contains` ancestors (a top-level entity has depth 0). `generic@2` imposes no depth cap below its entity limits: nesting is bounded only by acyclicity and by the profile limits (`maxEntities`, and the container count limit carried from `generic@1`, re-expressed in §3.6). A collapsed container has the atomic footprint at every depth (§4.4). Executors and layout SHALL traverse containment iteratively or with an explicitly bounded stack, so depth is a data property, never a call-stack limit. (Measured need: the validated scenes nest to depth 4; the rule deliberately allows more rather than encoding today's deepest scene as a limit.)
5. **Occurrence independence.** Containment is semantic. A container may be drawn expanded in one view and collapsed in another, and a child may have occurrences in a view where its parent has none (the drawing is then placed by the view, and §4.3 governs its edges). Deleting a container entity still requires the explicit occurrence / relation / port policy of the M2 command contract; nothing in this section adds a silent cascade.

Document type definitions keep the M2 rule: additive only, a redeclared base attribute refuses as `type-definition-conflict`. Refinements remain available for genuinely consumer-specific attributes. A refinement that re-declares a §3.2 slot name on `node` or `container` is a `type-definition-conflict` by that same rule once `generic@2` declares the slots — which is the mechanism that makes the measured `hrpn-card` pattern unnecessary and, if retained, loudly redundant rather than silently divergent.

### 3.5 Relations and ports

`generic@2` keeps the three `generic@1` relation types and the one port type. No relation is added: the validated diagrams need labelled directed links, containment and hyper-association, and nothing else.

| Relation type | Direction | Roles (cardinality) | Attributes |
| --- | --- | --- | --- |
| `contains` | directed | `parent` 1..1, `child` 1..1 (§3.4) | none |
| `link` | directed | `source` 1..1, `target` 1..1; each target an entity or a port | `label` text ≤ 200; `weight` quantity (unchanged) |
| `association` | undirected | `member` 2..8, entities only | `label` text ≤ 120 |

- The `link` label bound rises from 120 to 200 so the longest labelled relations of the validated corpus store without truncation (`decision`; the bound is profile data, and the migration of §3.9 records it). A `link` without a label is valid; the label is content, never a routing instruction.
- The business id of a relation survives every projection, including the folded projection of §4.3 and any junction-node projection of a hyper-relation. A projection never mints a new business relation.
- Semantic ports are unchanged: a port belongs to an entity, has a direction (`in | out | inout`), a name and typed attributes; side, order and anchor are geometric and live on the port occurrence in a view. A `link` endpoint that targets a port is drawn through that port's occurrence (§4.3 covers its folded form).
- Endpoint type constraints on every role are family constraints under §5.2: naming a type accepts that type and its refinements.

### 3.6 Limits

Carried from `generic@1` unless stated: `maxEndpointsPerRelation: 8`; document-level `maxEntities: 100000`, `maxRelations: 500000` as executor refusal limits, not as scene guidance.

`decision` — The `generic@1` constraint `max-entities-of-type container ≤ 64` is **not** carried as a hard refusal in `generic@2`. The validated corpus exceeds any small round container bound once scenes compose, and a count of frames is a layout and readability concern, not a semantic validity condition. `generic@2` declares no `max-entities-of-type` constraint. Hosts that need a scene-size policy enforce it as a consumer bound (the Focus dossier precedent: 1–80 entities, ≤ 240 relations, recorded as consumer bounds, not as profile validity) and report it under their own diagnostic, never as a profile refusal. The executor mechanism for `max-entities-of-type` stays available to profiles that genuinely need it.

### 3.7 Legend as model data

The legend is semantic data: which categories exist, what each is called and which token paints it. It is not a drawing, a caption string or a set of sample cards.

- A legend is one `legend` entity, contained at top level (it has no `contains` parent in a well-formed scene; an executor does not refuse a nested legend, but layout places legends by occurrence geometry as given).
- Its categories are its `legend-key` children through `contains`, in document order of their entity references (record keys carry no order, so category order is the sorted reference order the executor already uses everywhere; a host that needs a authored order names keys so the sorted order is the intended order, and states that in its authoring guide — no order field is added, per the M2 rule that every order that matters is an explicit field: here the reference itself is the field).
- Each `legend-key` declares:

| Attribute | Kind | Required | Meaning |
| --- | --- | --- | --- |
| `name` | text ≤ 120 | yes | Category label as displayed (authored content, §3.8). |
| `category` | text ≤ 40 | yes | Category key, same key space as `tone` (§3.3). Unique **within its legend** (§5.3). |
| `token` | text ≤ 80 | yes | Design-token name that resolves the category colour (for example a semantic data-category token name). A token name, never a colour value. An unresolvable token name is a rendering diagnostic, not a semantic refusal. |
| `description` | text ≤ 200 | no | Optional longer label for accessible text and export legends. |

- A legend with zero keys is valid data and renders nothing. Duplicate category keys inside one legend refuse (§5.3); the same key in two different legends (two documents, or a document composed of two legends by a host) is not a collision, because the scope is the legend.
- Rendering a legend is a colour-key list (swatch plus label per category), placeable inside the diagram through the legend entity's occurrence geometry. It is never rendered as a set of atomic cards, and its keys never use the card footprint (§4.4 gives the legend-key footprint).
- The `tone` values used by cards and containers in the same document resolve against these categories when a legend is present (§3.3). The legend therefore explains the document that carries it, with no consumer-side tint table.

### 3.8 Text, language and identifiers

- Every text slot stores authored content in the language of the document. The profile, the executor and the renderers hold no language: no kicker table, no « N links » string, no fold label is built into the model. Strings a renderer must generate (aggregate counts, expand/collapse labels, diagnostics text) are host-supplied or host-localised, never stored in the semantic document.
- One document carries one language per slot. A translated diagram is a second document instance produced by its author or translator, sharing entity references where the host wants cross-language correspondence; the executor never rewrites a stored string in place and never holds two languages in one attribute. This keeps canonical bytes, hashes and migration reports single-language and auditable.
- Case transforms (kicker uppercase) are rendering transforms under the host locale's case mapping. The stored string is never uppercased in the document.
- New identifiers are language-neutral: profile ids, type ids, attribute names, category keys, icon names and token names are ASCII key forms (§3.3). Persisted values in another language remain readable forever; a rename of a persisted value is a migration with a report, never an in-place rewrite.

### 3.9 Migration: `generic@1 → generic@2` (profile migration, schema impact)

Two distinct version axes exist and are not conflated: the persisted **schema version** (`SemanticDocument.schemaVersion`, currently `1.1`) and the **profile major** (`generic@1 → generic@2`). This lot bumps the profile major. It does not bump the schema major: no `SemanticDocument` field is added or removed, and the two view additions of §4.3 are optional fields on existing view records, readable by the current view validator's successor without a stored-shape break (a view without them is a valid unfolded view).

The profile migration is a registered, versioned function with the M2 contract: it produces a report (`from`, `to`, operations, unmigrated items with reasons) and keeps the original. Operations, in order:

1. `profileRefs`: replace `generic@1` with `generic@2`. A document declaring both majors refuses migration (`unmigrated`, reason `profile-not-declared` discipline: the author must choose the major per document; mixed-major documents are not created by migration).
2. Per entity of type `node` or `container`: carry every attribute that `generic@2` still declares, unchanged. The new §3.2 slots are absent after migration (they are optional); migration never invents kicker, body, icon or tone content.
3. Per `container` entity: drop the `collapsed` attribute. Record one operation `drop-attribute container.collapsed` per affected entity, with the dropped boolean in the operation detail, so a host can seed its first view's fold state (§4.2) from the report. The value is not carried into any semantic field.
4. Per document type definition refining `node` or `container`: if the definition redeclares a now-declared slot name, list it in `unmigrated` with reason `type-definition-conflict` and carry the definition unchanged; the migrated document then refuses validation until the author removes the redundant refinement. Migration never silently deletes a consumer attribute: the measured `hrpn-card` pattern migrates by this rule, and its removal is an explicit author edit witnessed by the acceptance corpus (§7), not a migration side effect.
5. Extensions, resources, ports and relations carry over unchanged. A preserved extension whose content duplicates the new slots (the measured `hrpn.zone-slots@1` pattern) is carried as preserved data and listed in the report as `preserved-duplicates-profile-slots` (informational operation detail, not an `unmigrated` item): removing it is the consumer switch-over edit of milestone M4, witnessed in §7, so migration alone never deletes preserved content (decision D3-C).

An unknown profile major in a stored document refuses in write and is preserved for inspection, as today. `generic@1` remains registered and validatable after `generic@2` ships: migration is per-document and explicit, never a registry replacement.

## 4. View model: folds, folded projections and fixed footprints

The view remains the M2 `ViewDocument`: occurrences of entities, relations and ports, visual groups, filters and persistable presentation state, pointing at exactly one `SemanticDocument` and never ahead of its revision. This section adds the fold contract, the folded-edge projection that stays valid, and the footprint and measurement inputs that layout consumes. Transient state (hover, in-flight drag, marquee) stays out of the view, as today.

### 4.1 Fold state is view data, one fold per container occurrence

- The fold state of a container in a view is the `collapsed` flag of exactly one `VisualGroup` of that view. The binding is deterministic and stored, not derived from geometry:
  - for each entity occurrence in the view whose effective type is in the container family (`container`, `legend`, or a refinement of either), the view holds one group whose id is `grp.<len>.<localId>`, where `<localId>` is the local id of the **container entity** and `<len>` is its length (the id form already used by the measured HRPN view and by the L8 dossier rules). That group's `collapsed` is the fold state of that container in that view.
  - membership follows the existing derived rule: an entity occurrence belongs to the group of its `contains` parent when the parent has an occurrence in the same view. `EntityOccurrence.group` names that group. Group membership itself is never duplicated as a member list.
- A container with no occurrence in a view has no fold in that view. A container with several occurrences in one view has one fold per occurrence only when the occurrences are distinguished by distinct groups; the validated scenes draw one occurrence per container per view, and `generic@2` views SHALL do the same for containers (a second occurrence of one container in one view reuses the same group and therefore the same fold — hosts needing two folds of one container use two views).
- Folding or unfolding is a view change. It is expressed by replacing the `ViewDocument` (new view revision, never ahead of the document revision), or by the host re-running layout with a new collapse input (§4.2) and replacing the view wholesale. It never mutates the `SemanticDocument`, never bumps `document.revision`, and never travels through an `update-entity-attributes` command. The semantic `container.collapsed` attribute of `generic@1` is not a fold carrier (§3.2.2).
- The rendering consequence is fixed: expanded, a container occurrence draws its header plus its visible children; collapsed, the same occurrence draws exactly one atomic card (`460 × 200`, §4.4) carrying the container's `kicker`, `name`, `subtitle` (as centred summary lines), `footer`, `icon` and `tone`, plus the fold control. No child occurrence of a collapsed container is a scene item (§4.3, step 1).

### 4.2 Default folds

- Default folds are **input data**, not component defaults and not semantic data. A host supplies `defaultFolds: readonly EntityRef[]` (container entities folded in the initial view) when it first builds or lays out a view. The layout or view builder stamps exactly those containers' groups `collapsed: true` in the produced `ViewDocument`; every other container group is `collapsed: false` or absent-means-expanded by the rule that an undeclared group is expanded.
- A stored `ViewDocument` therefore fully determines the displayed folds without consulting any default list. Reopening a stored view never re-applies defaults. Changing defaults after a view exists has no effect until a new view is produced.
- Expand-all and collapse-all are host operations over the same data: they produce a new view in which every container group is expanded, respectively every container group that has at least one child occurrence is collapsed. They mint no semantic change and are bounded by the interaction budget of §8 (M3 gate).

### 4.3 Folded-edge projection that yields a valid `ViewDocument` (closes blocking 1)

This section defines the only folded projection. A folded output that does not follow it is not a valid view, and the M1/M3 gates assert `validateView(foldedView, document)` returns zero diagnostics on every folded acceptance scene.

#### 4.3.1 Definitions

For a given view, let `containsParent(entity)` be the semantic `contains` parent (at most one, §3.4), and let `folded(group)` be the group's `collapsed` flag.

- An entity occurrence is **hidden by fold** when any `contains` ancestor container of its entity (including itself only when the question is about its children — a collapsed container's own occurrence stays visible as a card) has its group collapsed in this view. A collapsed container's child occurrences, at any depth, are hidden by fold. This matches the existing `group-collapsed` cascade: hidden occurrences are reported, never silently dropped.
- The **visible representative** of an entity `E` in a view is: `E` itself when no ancestor container of `E` is collapsed; otherwise the nearest collapsed ancestor container of `E` (walking `containsParent` upward, the first ancestor whose group is collapsed). For a port, the representative is the visible representative of the port's owner entity, drawn through the port occurrence bound to the representative's occurrence when one exists, otherwise through the representative occurrence itself.
- A relation is **internal** to a collapsed container when both endpoints' visible representatives are that same container, or when one endpoint's representative is the container and the other endpoint is contained in it. Internal relations draw nothing in the folded view.

#### 4.3.2 The projected occurrence (view data)

The persisted view gains two optional fields. Both are view data: they describe a drawing, they never change the semantic relation.

1. On `RelationOccurrenceEndpoint`: `semanticTarget?: EntityRef | PortRef`. Present **iff** the drawn `occurrence` does not itself draw the semantic endpoint target for that role. Its value is the semantic relation's endpoint target for that role, copied verbatim. Absent means “the drawn occurrence draws the semantic target”, exactly as today.
2. On `RelationOccurrence`: no new field. Aggregation is derived, not stored (§4.3.4).

Projection procedure (deterministic; the layout engine and any host that folds a stored view follow the same steps):

1. Compute hidden-by-fold occurrences (§4.3.1). Hidden entity occurrences stay in the `ViewDocument` records (their geometry is the expanded geometry, retained so unfolding restores it byte-for-byte) and are excluded from the scene as `group-collapsed`, as today. Do not delete occurrences to fold.
2. For each relation occurrence whose semantic relation has at least one endpoint hidden by fold:
   - if the relation is internal (§4.3.1), keep the occurrence record unchanged and let the scene exclude it as `endpoint-hidden` with its cause reported. It draws nothing.
   - otherwise, for each endpoint whose target is hidden by fold, set the endpoint's `occurrence` to the occurrence of the visible representative (the collapsed container's occurrence; for a port endpoint, the representative's port occurrence when one exists in the view, otherwise the representative's entity occurrence) and set `semanticTarget` to the semantic endpoint target. Endpoints that are not hidden keep `occurrence` and carry no `semanticTarget`.
   - a relation whose two representatives coincide after projection is internal by the rule above and draws nothing.
3. Leave every other occurrence, group, filter and presentation value unchanged. The projected view keeps the source view's `viewId` only when the host replaces that view; a folded derivative that coexists with its source uses a new `viewId`.

#### 4.3.3 Validation of a projected endpoint

`validateView` accepts a projected endpoint **iff** all of the following hold; otherwise it reports the stated diagnostic. The unprojected rule is unchanged: without `semanticTarget`, the drawn occurrence must draw exactly a semantic endpoint target for its role, else `occurrence-endpoint-mismatch`.

- `semanticTarget` equals one of the semantic relation's endpoint targets for the endpoint's role (the same set the current check uses). Otherwise `occurrence-endpoint-mismatch`.
- The drawn occurrence exists in the view and is not itself hidden by fold. Otherwise `dangling-reference` (missing) or `occurrence-endpoint-mismatch` with detail `representative-hidden`.
- Walking `containsParent` from `semanticTarget`'s entity (for a port target, from the port's owner) reaches the drawn occurrence's entity, and every container on that walk from the target up to but excluding the representative is contained under a collapsed group, with the representative itself collapsed-or-visible as the nearest collapsed ancestor (§4.3.1). If the walk never reaches the drawn entity, or reaches it through no collapsed container, the projection is spurious: `occurrence-endpoint-mismatch` with detail `projection-not-folded`.
- The drawn entity is in the container family when `semanticTarget` differs from it (a projection target is always a container card, never a leaf card that happens to be an ancestor by geometry). Otherwise `occurrence-endpoint-mismatch` with detail `representative-not-container`.

These four checks make the folded view self-describing: a validator needs only the document, the view and the `contains` tree — no layout output, no scene and no fold list. Appendix B works the review example end to end.

#### 4.3.4 Aggregation is derived, never stored

When several semantic relations project onto the same ordered pair of visible representatives, each keeps its own `RelationOccurrence` with its own business id (§3.5). A renderer MAY group projected occurrences that share the same (source representative, target representative) pair into one drawn stroke with a count label; that grouping is computed from the view at render time, is recomputed on every fold change, and is never persisted as a relation, an occurrence or an extension. The count label text is host-localised (§3.8). This preserves the M2 invariant that a business id survives projection, while giving the folded drawing the aggregated reading the validated scenes use.

#### 4.3.5 Scene consequence

The scene builder keeps its conservation rule. In a folded view: hidden occurrences are exclusions (`group-collapsed`), internal relation occurrences are exclusions (`endpoint-hidden`), projected relation occurrences are edge items whose path runs representative-anchor to representative-anchor (persisted waypoints of the source occurrence, when still inside the visible region, are retained as route hints on the retained record and ignored for the projected segment outside it — the router of M3 owns the final route). No occurrence is silently dropped and no edge disappears without a reported exclusion.

### 4.4 Fixed footprints and measured headers as layout input (closes blocking 2)

#### 4.4.1 Footprints

Layout consumes a footprint per entity. A footprint is either **fixed** (the box is the input; placement, docking and routing adapt to it) or **computed** (the box is the output of laying out children plus header).

| Entity (in view state) | Footprint | Source |
| --- | --- | --- |
| `node` occurrence | fixed `460 × 200` | `frozen-requirement` |
| `container` occurrence, collapsed in this view | fixed `460 × 200` | `frozen-requirement` (collapsed wrapping card takes the atomic card size at every nesting level) |
| `container` occurrence, expanded | computed: header height (§4.4.2) + children extent + frozen insets (rule gaps 4, content insets 16) | `frozen-requirement` spacing values |
| `legend` occurrence, expanded | computed like a container, over legend-key lines | this section |
| `legend-key` occurrence | fixed `460 × 64` (width follows the legend width when the legend is narrower; height stays 64) | measured compact legend line of the validated HRPN scenes; a layout input, not a card token |
| `legend` occurrence, collapsed | fixed `460 × 200` (it is a container-family fold) | §4.1 |

The profile declaration carries the fixed sizes as data (`footprint` on the entity type declaration, §5.5), so a layout run reads them from the pinned profile instead of from a component constant. A token change that alters a fixed footprint recomputes placement, docks and routes in the same layout call; an appearance-only change inside an unchanged box never moves a dock.

#### 4.4.2 Measurement input

Text measurement is injected, as today, because the engine holds no font metric and no DOM. The input contract is completed as follows (executor surface in §5.6):

- The measurer is called per **slot role**, not per drawn string alone. Roles are: `kicker`, `title`, `body`, `detail`, `footer`, `subtitle`, `legend-label`, `edge-label`. The same measurer output must be usable to render the text, or the reserved space will not match the drawing.
- Per entity, layout reads **all** §3.2 slots (not only `name`): kicker, title, body, detail, footer for cards; kicker, title, subtitle, footer for containers; label for legend keys and relation labels for edges. A measurer that receives only the title is a contract violation caught by the M1 layout tests.
- Per container (and per card rendered with a fold control), layout receives the **measured header height** computed from its kicker/title/subtitle lines with the toggle slot reserved when the card is foldable. The header allocation with the control reserved differs from the allocation without it; measurement and rendering use the same allocation for the same entity in the same view.
- Overflow is a measurement outcome, never a size change: when measured text needs more lines than its frozen allocation holds, layout still places the fixed box, keeps every character, and reports the card/zone overflow diagnostic with needed versus allocated size. A scene with an unresolved overflow fails its geometry gate (M2/M3), and the wording is shortened by the author.

#### 4.4.3 Fixed-size policy and docking overflow

- A fixed footprint is never enlarged, for docking or for any other reason. The current placement behaviour that grows a node to fit its dock slots is removed for fixed types (§5.6).
- When the docks required on one side of a fixed box exceed what the side holds at the declared slot spacing, the outcome is: keep the box, place the docks that fit in declared order, route the remainder from the box edge at the nearest free anchor, and report one `docking-overflow` layout warning per affected occurrence (side, required slots, fitted slots). No silent drop: every relation keeps an occurrence and a route (scene conservation, §4.3.5).
- Expanded containers are computed boxes and may grow for their children and headers; they never shrink a fixed child to fit.

### 4.5 Filters, presentation and legend placement

View filters and presentation state are unchanged. A filter that hides an endpoint excludes its relation occurrence as `endpoint-hidden`, as today, independently of fold exclusions; the two reasons stay distinct so a host can tell a fold from a filter. The legend entity, when present, is placed by its occurrence geometry like any container; its keys are placed by the footprint of §4.4.1 inside it. A host that prefers legend chrome outside the diagram omits the legend entity from the document and renders its own key list from consumer data — that is a consumer choice, and the generic figure never invents a legend the document does not declare (the model carries the legend, §3.7, or there is none).

## 5. Executor changes (`diagram-core`, plus the layout surface in `diagram-canvas`)

This section is the implementation contract for milestone M1 (model half) and the layout half of M3. Each change names its exact files, its behaviour and its RED test: the test is written first and observed failing against the current executor for the stated reason, then passes after the change. No change weakens an existing refusal: every new acceptance is paired with the refusal that bounds it.

Executor ownership follows G2: this repository implements and publishes the generic executor; Engram owns the profile data it executes (§6). Profile-content changes (§5.5) land as data in both places from the same hand-off (§6.3).

### 5.1 Effective-type resolution (shared helper)

- **Files:** `packages/diagram-core/src/validate.ts` [M] (new internal helper, exported for tests through the existing validation surface), `packages/diagram-core/src/profile.ts` [M] (no shape change; the helper reads existing declarations).
- **Behaviour:** `effectiveBaseChain(document, profile, typeId)` returns the ordered chain of profile type ids a type resolves through: `[typeId]` for a profile type; for a document type definition, `[definitionId, baseType, …chain of baseType]`. A missing base keeps the existing `unknown-entity-type` diagnostic. Attribute validation already computes the effective schema this way (`effectiveEntitySchemas`); the helper generalises the same walk to type identity so schema and endpoint checks can never disagree.
- **RED test:** `packages/diagram-core/tests/effective-type.test.ts` [N] — a refinement of a refinement of `container` resolves to a chain ending in `container`; a type whose definition names an undeclared base reports `unknown-entity-type`. Fails today because no such helper exists (import error is the recorded RED state).

### 5.2 Hierarchy parents by type family (closes gap 1)

- **Files:** `packages/diagram-core/src/profile.ts` [M], `packages/diagram-core/src/validate.ts` [M].
- **Profile shape:** `EntityTypeDeclaration` gains `readonly container?: boolean` (`true` means the type is in the container family and may parent through a hierarchy relation whose parent role names its family root; absent means leaf family). `validateProfile` refuses `container: true` on an abstract type (`type-definition-conflict`, detail `abstract-container`): an abstract container has no occurrence to fold or to draw.
- **Validation behaviour:** everywhere a role declares `entityTypes`, the check becomes family satisfaction: the target entity satisfies the constraint when its effective base chain (§5.1) contains any declared type id. This replaces the strict-equality comparison at the current `validate.ts` endpoint check, for the `contains` parent role and uniformly for every role of every profile (the A′ subsumption rule, §2.1). The diagnostic stays `endpoint-target-not-allowed` with the same path and refs; its `details` gain `seenChain` (the target's chain, joined) alongside the existing `seenType` / `allowed`, so a refusal explains the family it tested.
- **What does not change:** role cardinality, target-kind checks (`entity` vs `port`), hierarchy cycle and multiple-parent checks, and the refusal for a leaf-family parent (a `node` refinement used as a `contains` parent still refuses `endpoint-target-not-allowed`).
- **RED tests:** `packages/diagram-core/tests/hierarchy-family.test.ts` [N]:
  1. a `container` refinement (and a refinement of that refinement) used as a `contains` parent validates with zero diagnostics — fails today with 51-style `endpoint-target-not-allowed` on the HRPN-shaped fixture;
  2. a `node` refinement used as a `contains` parent still refuses `endpoint-target-not-allowed`;
  3. a non-`contains` role naming `container` (a synthetic test profile) accepts a refined container target and refuses a refined node target, proving the rule is uniform, not a `contains` special case.

### 5.3 Scoped uniqueness (closes gap 2)

- **Files:** `packages/diagram-core/src/profile.ts` [M], `packages/diagram-core/src/validate.ts` [M], `packages/diagram-core/src/diagnostics.ts` [M].
- **Profile shape:** the `unique-attribute` constraint gains a mandatory scope:
  ```ts
  | { readonly kind: "unique-attribute"; readonly entityType: string; readonly attribute: string;
        readonly scope: "document" | "siblings" | { readonly withinType: string } }
  ```
  `document` = across every entity of the type in the document (the current behaviour, now explicit); `siblings` = across entities sharing the same `contains` parent (top-level entities form one sibling set); `{ withinType }` = across entities contained (transitively) under the same ancestor of the named type — the legend scope of §3.7 is `{ withinType: "legend" }` applied to `legend-key.category`. A `unique-attribute` declaration without a scope refuses at `validateProfile` (`type-definition-conflict`, detail `unique-scope-missing`): an unscoped uniqueness is exactly the defect being removed, so the shape makes it unrepresentable. Existing profiles are migrated by stating their scope explicitly; `generic@1` keeps `scope: "document"` for its container-name constraint so its stored behaviour is unchanged, and `generic@2` declares no `unique-attribute` on any display text (§3.6 records why).
- **Validation behaviour:** `validateConstraints` groups by the scope key before comparing canonical values. Identity is never a uniqueness constraint: entity, relation, port and occurrence ids stay record keys checked as `duplicate-id` / `record-key-mismatch`, as today. Display titles (`name`, `kicker`, legend `name`) are unique nowhere in `generic@2`.
- **New diagnostics:** none for the violation itself (`unique-attribute-violation` keeps its code, path and refs; its `details` gain `scope`). One profile-shape code is reused (`type-definition-conflict`) for the missing-scope refusal, so the `DiagnosticCode` union grows only in §5.4.
- **RED tests:** `packages/diagram-core/tests/scoped-uniqueness.test.ts` [N]:
  1. two sibling `legend-key` entities with the same `category` under different legends validate; the same pair under one legend refuses `unique-attribute-violation` — the cross-legend half fails today only because `legend` types do not exist, the same-legend half passes trivially today and is kept as the bounding refusal;
  2. two `container` entities both named « CI/CD » validate under `generic@2` (zero diagnostics) — fails today as `unique-attribute-violation`;
  3. a test profile declaring `unique-attribute` without `scope` refuses in `validateProfile` — fails today because the field does not exist;
  4. `siblings` scope: two same-named cards under different parents validate, under one parent refuse (synthetic profile), proving the scope key is the parent, not the document.

### 5.4 Legend and tone checks

- **Files:** `packages/diagram-core/src/validate.ts` [M], `packages/diagram-core/src/diagnostics.ts` [M].
- **Behaviour:** (a) a `legend-key` whose `contains` parent is not in the legend family (effective chain contains `legend`) reports `legend-key-parent-invalid` (new code); a `legend` child that is not a `legend-key` (or a refinement of it) reports the same code on the child. (b) When a document contains at least one `legend`, every `tone` value on `node` / `container` entities that is not `neutral` and does not equal a `category` of a legend in the same document reports `tone-category-unknown` (new code, severity `error`: an unexplained colour in a document that declares its legend is a data defect the author must fix, not a rendering fallback). Without any legend, no tone check beyond shape runs. Icon names are not checked semantically (§3.3).
- **RED tests:** `packages/diagram-core/tests/legend.test.ts` [N]: a legend with keys explains the tones used by its document (zero diagnostics); an undeclared tone in a legend-bearing document refuses `tone-category-unknown`; a `legend-key` parented by a plain `container` refuses `legend-key-parent-invalid`; the same tone without any legend validates (shape only). Each fails today (`unknown-entity-type` for the legend types).

### 5.5 The `generic@2` profile declaration (data)

- **Files:** `packages/diagram-core/src/profiles/generic.ts` [M] (add `generic2Profile`, keep `genericProfile` untouched), `packages/diagram-core/src/profiles/index.ts` [M] (register `generic@2`; `defaultProfileRegistry` holds five profiles; `completeProfiles` holds both generic majors), `packages/diagram-core/src/profile.ts` [M] (the `footprint` field below).
- **Declaration:** profile id `generic@2`, `completeness: "complete"`. Entity types `node`, `container`, `legend`, `legend-key` with the §3.2/§3.7 attributes and bounds; `container: true` on `container` and `legend`; `footprint: { width: 460, height: 200, fixed: true }` on `node`, `footprint: { width: 460, height: 64, fixed: true }` on `legend-key` (height fixed, width is the legend's width at layout, §4.4.1 — the declaration records the fixed height and the card width as the default width). Port type `port` unchanged. Relation types `link` (label ≤ 200), `contains` (hierarchy `containment`, tree), `association` unchanged. Constraints: `acyclic-hierarchy` on `containment`; `unique-attribute` on `legend-key.category` with scope `{ withinType: "legend" }`; no `unique-attribute` on `name`; no `max-entities-of-type`. Limits as in §3.6. Notes state that fold is view state and that `generic@1` documents migrate by §3.9.
- **Profile shape addition:** `EntityTypeDeclaration` gains `readonly footprint?: { readonly width: number; readonly height: number; readonly fixed: boolean }`. `validateProfile` refuses a non-positive or non-finite footprint (`limit-exceeded` on the profile path, detail `footprint`).
- **RED tests:** `packages/diagram-core/tests/generic2-profile.test.ts` [N]: the registry lists `generic@2`; `validateProfile(generic2Profile)` is empty; each §3.2 slot validates at its bound and refuses one character past it (`text-too-long`); an undeclared slot (for example `subtitle` on `node`) still refuses `attribute-not-in-schema`. Fails today (`unknown-profile` / missing export).

### 5.6 View validation for folded projections; layout surface

Core view change:

- **Files:** `packages/diagram-core/src/view.ts` [M] (`RelationOccurrenceEndpoint.semanticTarget?`; `VIEW_DOCUMENT_FIELDS` unchanged because the new field is on the endpoint record, not the view record — a test asserts the view field set still refuses a stray `hover`-style key), `packages/diagram-core/src/validate.ts` [M] (the four checks of §4.3.3, reusing `occurrence-endpoint-mismatch` and `dangling-reference`; no new `DiagnosticCode`).
- **RED tests:** `packages/diagram-core/tests/folded-view.test.ts` [N]:
  1. the Appendix B document and folded view validate with zero diagnostics — fails today as `occurrence-endpoint-mismatch`;
  2. the same view with `semanticTarget` removed refuses `occurrence-endpoint-mismatch` (the projection field is load-bearing, not decoration);
  3. a `semanticTarget` naming a target of a different role, a representative that is not a collapsed ancestor, and a representative in the leaf family each refuse with the §4.3.3 details;
  4. an internal relation occurrence in a folded view validates and is excluded by the scene as `endpoint-hidden` (asserted in `diagram-canvas` tests below).

Layout surface (`packages/diagram-canvas`), same milestone discipline:

- **Files:** `packages/diagram-canvas/src/layout/types.ts` [M] (measurer roles of §4.4.2; `LayoutOptions` gains `collapsed: readonly EntityRef[]` — the fold input the engine applies when stamping groups — and reads footprints from the pinned profile), `packages/diagram-canvas/src/layout/graph.ts` [M] (read every §3.2 slot into the working graph; keep the refusal for unsupported profiles/types by name), `packages/diagram-canvas/src/layout/engine.ts` [M] (accept `generic@2` alongside `generic@1`; stamp `VisualGroup` folds from the collapse input instead of emitting `groups: {}`; produce projected relation occurrences per §4.3.2 when a collapse input is present), `packages/diagram-canvas/src/layout/place.ts` [M] and `packages/diagram-canvas/src/layout/dock.ts` [M] (fixed footprints never enlarged; docking overflow per §4.4.3), `packages/diagram-canvas/src/visibility.ts` [M] and `packages/diagram-canvas/src/scene.ts` [M] (projected edges are items, internal edges are `endpoint-hidden` exclusions; conservation asserted as today).
- **Layout warnings:** `LayoutWarningCode` gains `docking-overflow`. No other warning code is added.
- **RED tests:** `packages/diagram-canvas/tests/layout/fixed-footprint.test.ts` [N] (a card with maximal docks keeps `460 × 200` and reports `docking-overflow`; fails today by enlarged geometry), `packages/diagram-canvas/tests/layout/folded-projection.test.ts` [N] (laying out an acceptance document with a collapse input returns a view that passes `validateView` and whose scene conserves occurrences; fails today because no collapse input exists), `packages/diagram-canvas/tests/layout/slot-measurement.test.ts` [N] (the measurer receives kicker/body/detail/footer/subtitle roles; a measurer that throws on an unexpected role proves the calls happen — fails today because only `name` is read).

### 5.7 Commands, migration registration and remaining core files

- **Commands:** no new command kind. Slot edits travel through `update-entity-attributes`; legend keys are ordinary entities (`create-entity`, `delete-entity` with its explicit policy); folds mint no command (§4.1). `packages/diagram-core/src/commands.ts` needs no change for M1, and a test asserts the command-kind list is unchanged so a fold command cannot be smuggled in: `packages/diagram-core/tests/commands-inverse.test.ts` [M] gains one case (a `generic@2` document round-trips `command → inverse → initial content` byte-for-byte on canonical content with revisions normalised, the established pattern).
- **Migration:** `packages/diagram-core/src/migrate.ts` [M] registers the §3.9 profile migration in a profile-migration registry parallel to the schema migrations (same report shape: `from`, `to`, operations, `unmigrated`, original retained). `packages/diagram-core/src/document.ts` [M] only in its documentation of the current schema version (no field change). RED tests: `packages/diagram-core/tests/migrate-generic2.test.ts` [N] — a `generic@1` fixture with a semantic `collapsed: true` container migrates with the drop operation recorded and zero invented slot content; a fixture whose refinement redeclares a new slot appears in `unmigrated` and the result refuses validation until edited; an unknown profile major refuses in write and is preserved.
- **Diagnostics summary:** the `DiagnosticCode` union gains exactly two codes (`legend-key-parent-invalid`, `tone-category-unknown`). Folded-projection refusals reuse existing codes with new `details` values (§4.3.3), so consumers that switch on codes see no new refusal class for folds.
- **Barrel and docs:** `packages/diagram-core/src/index.ts` [M] re-exports nothing new by name beyond the profile (the new types ride the existing module exports); `packages/diagram-core/README.md` [M] records the completed model, the family and scope rules and the folded-view contract in English.

## 6. Engram side: what Engram holds, what the DS keeps (G2)

Governance is G2, verbatim: « Engram governs profiles, schemas, fixtures and migrations. The Design System retains and publishes the generic @sentropic/diagram-core executor, layout and rendering. Consumers pin profiles; no second diagram metamodel. » The frozen guardian contracts (`SPEC-G0-guardian-contracts.md`) apply: an ontology is a five-part record (versioned profile, conformance corpus, identity and digests, lineage record, catalog entry), no part alone is an ontology, and the guardian invents no third profile shape — the diagram shape stays the `diagram-core` `Profile`, the Engram shape stays the Engram `OntologyProfile`, referenced through explicit versioned adapters. This section states the `generic@2` instance of that contract. Engram artefacts are produced in the Engram repository by its own lots; this repository consumes them by pin.

### 6.1 What Engram must hold for `generic@2`

All of the following, versioned and immutable once published (bytes under an id and version never change; any change is a new version):

1. **The profile definition as data**: the `generic@2` declaration of §5.5 serialized canonically (entity, port and relation types with roles and cardinalities, the `container` family flags, footprints, constraints with their scopes, limits, completeness `complete`, notes). This is the normative declaration; the TypeScript literal in this repository is a transcription checked against it (§6.3), not a second authority.
2. **JSON schemas**: (a) the profile schema (what a `generic@2` profile document must satisfy, used by `validateProfile` qualification); (b) the `SemanticDocument` schema at schema `1.1` as written by this executor generation (unchanged shape, §3.9); (c) the `ViewDocument` schema including the `semanticTarget` endpoint field of §4.3.2. Schemas are generated from or checked against the executor's validators by fixture, never hand-diverged.
3. **The conformance corpus**: the §7 acceptance documents and views (valid instances), the rejected cases with asserted diagnostics (including the new §5 cases: leaf parent, spurious projection, duplicate legend category in one legend, undeclared tone in a legend-bearing document, missing uniqueness scope), and the command/inverse sequences. A profile without its green corpus is a draft outside the catalog and is not pinnable.
4. **Migrations**: the registered `generic@1 → generic@2` profile migration (§3.9) as a versioned function with its report contract, plus the schema-migration references the lineage record needs. Migration functions keep the original; an unknown major refuses in write.
5. **The ontology record and catalog entry**: namespace, id (`generic`), version (`2`), owner, lifecycle (`draft → published → deprecated → superseded`), completeness, the profile reference with its content digest, the corpus reference with its manifest digest, the lineage (parent pin `generic@1` with its digest, the migration reference) and the consumer list to notify before the major ships. Publication requires profile self-validation green, corpus green with every required receipt, licence closure recorded and every applicable digest resolved — no receipt may be missing, at any completeness.

Engram also keeps its existing stewardship unchanged: no private consumer content is held guardian-side (private stacks are pins, digests and receipts only), display labels are never identity, and preserved foreign content keeps its three levels and is never promoted.

### 6.2 What the DS keeps in this repository

- The **generic executor**: `packages/diagram-core` (validators, commands with inverses, canonical serialisation, migration runtime, diagnostics) and `packages/diagram-canvas` (scene, visibility, transform, hit test, layout engine including the §5.6 fold and footprint surface). The executor executes whatever pinned profile it is handed; it contains no `generic@2` content beyond the transcription literal used by tests and by consumers that pin this repository's build before the Engram publication is qualified (the transitional state G2 allows: a pinned build-time copy, replaced by the pinned Engram artefact once its implementation and qualification evidence exist — two distinct evidence states, never conflated).
- **Rendering**: card and container components, tokens, pictogram registry, themes, the scene figure and its controls (milestones M2–M4). No runtime rendering path depends on a network or MCP call: consumers load pinned profiles offline at build or start time.
- **This specification and its successors**, plus the executor's own unit fixtures. Conformance fixtures that Engram catalogs are mirrored here only as test inputs pinned by digest (§6.3), never edited into a local variant.

### 6.3 Hand-off contract (pins and digests)

- A consumer pins a profile by an exact pin: `{ id, version, contentDigest }` — exact version, full SHA-256 content digest over the canonical profile bytes, no range, no tag, no `latest` fallback anywhere. An unknown version, digest or major refuses; it never falls back.
- Digests are distinct and never interchanged: `contentDigest` (profile bytes), `pinsDigest` (ordered parent pins), `resultDigest` (effective resolved declaration), `entryDigest` (catalog entry, computed externally, never self-embedded). The executor's FNV-1a content hash remains an internal drift receipt inside artefacts and is none of these digests and never a trust gate.
- Transcription check: the `generic@2` literal shipped in `packages/diagram-core` must canonicalise to bytes whose SHA-256 equals the pinned Engram `contentDigest`. The M1 gate runs this check; a mismatch refuses the build (`digest-mismatch` discipline) rather than silently preferring either copy.
- Fixture hand-off: each acceptance fixture (§7) is identified by its canonical SHA-256 as recorded in the corpus manifest. A hash mismatch at lot time aborts the lot's fixture step as a fixture error, not a test failure.
- Change flow: a profile change is proposed as data in Engram, qualified against the corpus there, published as a new version with its digests, and only then transcribed or re-pinned here. This repository never edits a published profile's bytes in place, and Engram never edits executor code.

## 7. Acceptance instances with zero extensions

Acceptance is a set of pure instances of the completed model. An instance qualifies only when **all** of the following hold, checked by the named gates:

- `profileRefs` is exactly `["generic@2"]`;
- `extensions` is empty (no preserved extension carries slots, titles or tints);
- `typeDefinitions` is empty (no local refinement carries standard slots);
- every entity type is one of `node`, `container`, `legend`, `legend-key`; every relation type is `link`, `contains` or `association`;
- `validateDocument` and, per view, `validateView` return **zero diagnostics**, including on every folded view (§4.3);
- display titles are stored literally (the two « CI/CD » zones are both stored as « CI/CD »);
- geometry in each view is produced by the DS layout from the semantic document (expanded views) and by the §4.3 projection (folded views), never copied from a consumer layout as input.

### 7.1 The instances

| # | Instance (source of truth for content) | Content that must be re-expressed | Fold witness |
| --- | --- | --- | --- |
| A1 | Governance central scene: sentropic `4138a0ec`, `docs/governance/kit/src/governance-central.js` (`buildGovernanceCentral`), plus `governance-collapse.js` fold behaviour and `presentation-scenes.json` scene dressing | Top frames `h2a`, `surfaces`, `cluster-mesh`, `engram`, `design-system`; nested frames `cm-catalog`, `cat-mcp`, `cm-storage`, `cm-security`, `cm-cluster`; every card with its kicker (package/family), title, body/detail lines, footer (`service: …`) and icon; every labelled relation (the 50-relation set of the builder); legend categories `neutral`, `proposal`, `identity` as one legend | Expanded view; the all-collapsed overview; at least one single-fold view per top frame; each folded view passes `validateView` |
| A2 | HRPN scene S2-asbuilt (fixture corpus, 41 cards / 17 zones / 44 relations) | Cards, zones, containment and labelled links as pure `generic@2`; tints as `tone` keys explained by the scene legend | Recorded default folds for the scene, re-expressed as `defaultFolds` input; folded view valid |
| A3 | HRPN scene S2-target, fixture form (51 cards / 22 zones / 54 relations) | As A2. Kept as the regression form; it is not replaced by A5. | As A2 |
| A4 | HRPN scenes S1-conversational (23/17/24) and S3-agentfactory (37/15/36) | As A2 | As A2 |
| A5 | HRPN S2-target graph, current form: `/home/antoinefa/src/airbus-genair-hrpolnav/docs/architecture/hrpn/engram/S2-target.semantic.json` + `S2-target.view.json` (19 zones, 37 cards, 31 links, 7 default folds: `MSGZ`, `VERTEXZ`, `INGZ`, `PCICD`, `OBSZ`, `GENSRC`, `AWSCI` in the source view) | The same graph with: `hrpn-card` dissolved into `node` plus §3.2 slots; the 19 `hrpn.zone-slots@1` extensions dissolved into `container` slots; the two « CI/CD » zones stored literally; zone footers, subtitles, icons and tints as declared slots and legend keys (`genair`, `custom`, `outside` and the remaining scene categories) | The stored expanded geometry is replaced by DS layout; the 7 default folds become the `defaultFolds` input and the folded view is projected per §4.3 and validates |

Counts are content witnesses: a re-expression with a different card, zone or relation count is a different graph and fails the instance. A1's relation count is taken from the builder's relation table at the pinned commit; the corpus manifest records the exact count and the fixture digest (§6.3).

### 7.2 Where the instances live and who checks them

The instances are authored once as Engram corpus fixtures (§6.1, item 3) and consumed in this repository by path plus digest. The M1 gate checks semantic and view validity (zero diagnostics, zero extensions, zero refinements); the M2 gate checks that cards and zones render from the instances without slot loss; the M3 gate checks every folded view. No instance file is copied into this repository as a locally edited variant: a correction to an instance is a corpus change in Engram with a new digest.

## 8. Milestones and gates

Milestones run in order; a gate is a set of commands with exit 0 plus the named witnesses. No milestone is reported done on a partial gate. Publication of any package (including making a private package public) remains an owner gesture and is not implied by any gate below.

| Milestone | Delivers | Gate (all must hold) |
| --- | --- | --- |
| **M1 — Model and executor** | `generic@2` declaration (§5.5); family parents (§5.2); scoped uniqueness (§5.3); legend/tone checks (§5.4); folded-view validation (§5.6 core); profile migration (§5.7); Engram artefacts of §6.1 published as a pinnable draft with digests; corpus instances A1–A5 authored | Every §5 RED test green after having been observed RED; `validateProfile(generic@2)` empty; A1–A5 semantic documents validate with zero diagnostics, zero extensions, zero refinements; the Appendix B folded view validates; transcription digest check (§6.3) green; `npm run build`, `npm run check`, the `diagram-core` and `diagram-canvas` test suites green in series; publishable-package count unchanged; no Python introduced |
| **M2 — Cards render from the model** | Atomic card and wrapping container (collapsed form is the atomic card) rendered directly from `generic@2` slots; pictogram resolution by registry name; tone resolution through tokens and the document legend; colour-key legend rendering | Pixel-parity witnesses against the validated renders for atomic and collapsed cards and for expanded zones; slot-for-slot rendering of A1 and A5 with no consumer adapter (the instance feeds the renderer unmodified); overflow and unknown-icon diagnostics asserted; no hex literal and no locally redefined token in the card/zone sources |
| **M3 — Interactive fold, layout and routing** | Fold/unfold in place (per-container control, expand-all/collapse-all, per-zone chips); layout with fold input, fixed footprints and measured headers (§5.6 layout); folded-edge projection and re-routing; derived aggregation (§4.3.4) | Every folded view of A1–A5 passes `validateView`; scene conservation holds on every fold state; fixed footprints never enlarged (`docking-overflow` witnessed); reflow without collisions on every fold toggle of the corpus; worst interaction under the 1.8 s budget over the recorded interaction set, no continuous work at idle, timeouts never raised |
| **M4 — xyflow nodes and consumer switch-over** | The card and container as xyflow (Svelte Flow) custom nodes with handles, plus standalone use; consumers (the governance figure, the HRPN scenes) import the DS modules and delete their local card, zone, fold and legend code and the workarounds catalogued as display hacks | A plain consumer import does not load the pictogram, xyflow or editor module graphs beyond their declared entry points; the HRPN and governance renderings reproduce from the DS modules with the acceptance instances unmodified; the consumer-side hack inventory is empty (no folded-card renderer, no tint duplication, no title surgery, no `hrpn-card`, no `hrpn.zone-slots@1` remaining in the switched consumers) |
| **M5 — Exports** | draw.io export in which a folded container exports as a collapsible group (and unfolds back), plus static exports (SVG/PNG/print) that render the supplied view exactly, including its folds and its legend | Round-trip witness: export each acceptance instance folded and expanded, re-import the draw.io form, and re-validate (zero diagnostics, same counts); static export of a folded view equals the interactive rendering of the same view; no consumer-side draw.io edits are needed or present |
| **M6 — Editing** | First the rich-text editing surface for text slots, gated on the Svelte rich-text adapter (RT-1) passing its own gate — no fallback editor; then editable and re-connectable edges as host-applied proposals over `diagram-core` commands (sentropic Track `01M5F3XSAJC2H6S9ZREP7JFFJ6`) | RT-1 gate green before any editing lot starts; edit → propose → host apply-or-refuse → re-render witnesses for each text slot, with `revision-conflict` refusal leaving the rendered document untouched; edge re-connection and label edits expressed only as proposals (a refused proposal changes nothing); no component mutates a document or a view directly at any point |

Staging rules (normative): Svelte is the first framework for M2–M4; other frameworks follow the same contracts per stage and are never claimed delivered from types alone. draw.io and edge editing stay out of M1–M4 scope even when a consumer asks early; their absence blocks no earlier gate.

## 9. Settled choices — no open questions

No question is put to the owner by this specification. Every technical choice the validated diagrams left open is settled above; the settlements are collected here so a reviewer can contest them in one place. A genuine product choice would be one that changes what a user sees as a different product (a new diagram family, a public API renaming, a publication); none is needed to complete this model.

| # | Choice | Settled as | Where |
| --- | --- | --- | --- |
| 1 | Profile identity | `generic@2`, not `architecture@1` | §1 |
| 2 | Card/container type ids | `node` / `container` kept from `generic@1` | §3.1 |
| 3 | Leaf body shape | Two role-carrying lines (`body`, `detail`), not an untyped string list | §3.2.1 |
| 4 | Icon and tone key spaces | Open keys with a closed shape; rendering resolves, semantics checks shape (and legend membership when a legend exists) | §3.3, §5.4 |
| 5 | Container count limit | No hard profile refusal in `generic@2`; scene-size bounds are consumer policy | §3.6 |
| 6 | Legend form | Semantic `legend` / `legend-key` entities with token names; rendered as colour keys, never as cards | §3.7 |
| 7 | Localisation | One language per document instance; identifiers language-neutral; renderer strings host-localised | §3.8 |
| 8 | Fold carrier | `VisualGroup.collapsed` in the view; semantic `collapsed` removed | §4.1, §3.9 |
| 9 | Folded edges | Projected endpoints with `semanticTarget` provenance; aggregation derived, never stored | §4.3 |
| 10 | Docking beyond a fixed side | `docking-overflow` warning and edge routing; the box never grows | §4.4.3 |
| 11 | Commands for folds and legends | None added; folds are view replacement, legend keys are entities | §5.7 |
| 12 | New diagnostic codes | Exactly two (`legend-key-parent-invalid`, `tone-category-unknown`); folds reuse existing codes | §5.7 |

## Appendix A — `generic@2` declaration sketch (normative content, abbreviated syntax)

```ts
// Profile id "generic@2", completeness "complete".
// Entity types (attributes abbreviated to name/kind/bound; all text unless noted):
//   node (footprint 460x200 fixed):
//     name! , kicker, body, detail, footer, icon, tone,
//     state(enum), weight(quantity), duration(quantity), createdAt(date),
//     pinned(boolean), tags(collection text<=40, max 8), owner(reference entity)
//   container (container: true):
//     name!, kicker, subtitle, footer, icon, tone
//   legend (container: true):
//     name!
//   legend-key (footprint 460x64 fixed):
//     name!, category!, token!, description
// Port types: port (directions in/out/inout; attribute label text<=80)
// Relation types:
//   link (directed; source 1..1, target 1..1, targets entity|port;
//         attributes label text<=200, weight quantity)
//   contains (directed; parent 1..1 container-family, child 1..1 any;
//             hierarchy containment, shape tree)
//   association (undirected; member 2..8 entities; attribute label text<=120)
// Constraints:
//   acyclic-hierarchy(containment)
//   unique-attribute(legend-key.category, scope { withinType: "legend" })
// Limits: maxEntities 100000, maxRelations 500000, maxEndpointsPerRelation 8
```

## Appendix B — Worked folded projection (the blocking-1 example)

Document (fragment): containers `MSGZ` (collapsed in the view), cards `CHAT` (outside `MSGZ`) and `TOPIC` (contained in `MSGZ`); semantic relation `link` `CHAT → TOPIC`. Source view: occurrences for all three entities; `TOPIC`'s occurrence names the group of `MSGZ`; the `MSGZ` group is `collapsed: true`.

Projection (§4.3.2): `TOPIC` is hidden by fold; its visible representative is `MSGZ`. The relation occurrence becomes: source endpoint `{ role: "source", occurrence: <CHAT occurrence> }` (unchanged, no `semanticTarget`); target endpoint `{ role: "target", occurrence: <MSGZ occurrence>, semanticTarget: "entity:TOPIC" }`.

Validation (§4.3.3): `entity:TOPIC` is a target of the semantic relation for role `target`; the `MSGZ` occurrence exists and is visible; walking `containsParent` from `TOPIC` reaches `MSGZ` through the collapsed `MSGZ` group; `MSGZ` is in the container family. Zero diagnostics. Removing `semanticTarget` makes the same view refuse `occurrence-endpoint-mismatch`, which is the RED state of the current executor on this input and the first test of `packages/diagram-core/tests/folded-view.test.ts`.

## Appendix C — Diagnostic additions at a glance

| Code | New or reused | Raised when |
| --- | --- | --- |
| `legend-key-parent-invalid` | new | A `legend-key` is not contained by the legend family, or a legend contains a non-key child |
| `tone-category-unknown` | new | A legend-bearing document uses a non-neutral `tone` its legend does not declare |
| `endpoint-target-not-allowed` | reused (details gain `seenChain`) | A hierarchy parent or any typed endpoint is outside the declared type family |
| `unique-attribute-violation` | reused (details gain `scope`) | A scoped uniqueness of §5.3 is violated inside its scope |
| `occurrence-endpoint-mismatch` | reused (details `representative-hidden`, `projection-not-folded`, `representative-not-container`) | A folded projection of §4.3.3 does not describe a collapsed-ancestor drawing |
| `type-definition-conflict` | reused (details `unique-scope-missing`, `abstract-container`) | A profile declares an unscoped uniqueness or an abstract container |
| `docking-overflow` (layout warning, not a core diagnostic) | new | A fixed footprint side cannot hold its docks (§4.4.3) |
