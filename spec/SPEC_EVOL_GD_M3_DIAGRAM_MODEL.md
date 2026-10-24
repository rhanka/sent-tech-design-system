# SPEC EVOL — GD-M3-DIAGRAM-MODEL: the complete architecture-diagram model (r2, after Astra pass 1 + Engram consolidated r1)

| Field | Value |
| --- | --- |
| Status | Specification only. No implementation, no profile publication and no consumer switch-over is claimed by this document. |
| Date | 2026-10-24 (r2; r1 was 2026-10-23 at `b8f5982c`) |
| Branch | `spec/diagram-model-complete`, cut from `origin/main` |
| Deliverable of this lot | This file only: `spec/SPEC_EVOL_GD_M3_DIAGRAM_MODEL.md`. Nothing else is written, including nothing under `.track/`. |
| Language / tooling | This document is in English. No network access is used by any lot defined here. No Python is used anywhere (implementation, tests, jobs, one-off scripts): the stack is Node/TypeScript and the native tooling already present. No attribution trailer is added to any commit. |
| Governance | G2 (owner decision 2026-10-19): Engram governs profiles, schemas, fixtures and migrations as data. The Design System (DS) retains and publishes the generic `@sentropic/diagram-core` executor, layout and rendering. Consumers pin profiles; no second diagram metamodel. |
| Pivot | `packages/diagram-core` (`SemanticDocument` / `ViewDocument`, transactional commands, versioned profiles). This specification completes that pivot for architecture-style diagrams. It does not introduce a second model. |
| Review closed by r2 | Astra pass 1 (`scratchpad/rev/dmodel-rev1.out`, 7 blocking + 8 to-fix + 2 minor, findings 1–17) and Engram consolidated r1 (`CONSOLIDATED-M3-r1-engram.md`, part A confirmed + part B findings B1–B9). Every finding is closed in a named section; the traceability table is in §10. |
| Executor assumption | The `unique-attribute` reporting-order fix at `610c0353` (duplicates reported in UTF-16 id order, independent of insertion order; first id in the order is the reference, refs `[reported, reference]`, PR #193) is merged before M1 starts. M1 does not reimplement it; §5.3 keeps that order rule inside each scope. |
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
4. Engram carries the complete model as historically specified in this repository (`spec/SPEC_EVOL_GD_M2_MODEL.md`, `spec/SPEC_EVOL_GD_M2_DS_PRESENTATION.md`, `spec/SPEC_EVOL_GD_M2_CANVAS.md`, `spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md`): versioned profiles, typed attributes, views and occurrences, commands and transactions, migration, fixtures. §6 states what Engram holds and what this repository keeps. Zero preserved extension, zero local refinement for standard slots, zero name hacks is the acceptance criterion; §7 enforces it per instance.

## 0. How to read this specification

- `SHALL` / `MUST NOT` state the proposed contract. A clause tagged `frozen-requirement` restates an owner-validated value from `DS-DIAGRAM-MODULES-REQUIREMENTS.md` (owner-validated 2026-10-21, reference render sentropic PR #711 merged as `4138a0ec`) and is not re-opened here. A clause tagged `measured-code` states a fact read from a pinned file, with its locator. A clause tagged `decision` states a technical choice settled by this specification; its rationale is recorded next to it and it is not an open question. The single open owner decision is Q1 in §9; everything else is settled.
- All card sizes are card pixels (CSS pixels at zoom 1). The atomic-card footprint is `460 × 200` in every state (`frozen-requirement`); §4.4 defines the state-dependent footprints and the fixed-axis policy that gives that sentence its exact meaning. No other size in this document is a card size.
- “Card” means the atomic-card entity type. “Container” means the wrapping-container entity type. “Fold” always means view state (§4), never a semantic attribute.
- File paths are relative to this repository unless an absolute path is given. Engram paths are relative to `/home/antoinefa/src/graphify` unless stated otherwise.
- **Normative scope (B9).** This specification is normative for three things only: (a) the semantic model and the completed profile content, (b) the view contract (occurrences, folds, folded projection, measurement input, layout hints), and (c) the `diagram-core` / `diagram-canvas` executor surface that validates and lays out (a) and (b). Everything downstream — xyflow node forms, consumer replacement and switch-over, draw.io export, rich-text editing, re-connectable edges — is **not** normative here. §8 keeps milestones M2–M6 as a roadmap with gates and pointers to the separately authorised specifications that own those surfaces (`SPEC_EVOL_DS_DIAGRAM_CARDS.md` for components, the L8 dossier for draw.io, Track `01M5F3XSAJC2H6S9ZREP7JFFJ6` for edges, RT-1 for rich text); no clause in §§3–7 depends on them, and no M1 gate requires them.

## 1. Profile identity is the single variable; content is identical under either choice

### 1.1 The parametric rule

`decision` (parametric) — The complete model is published under **one** profile id, and that id is the only variable in this specification. Everywhere the text below writes `PROFILE_ID`, the bytes, types, constraints, limits, diagnostics, fixtures and migration behaviour are identical; only the id string changes. Two instantiations are admitted:

- **Instantiation A (recommended):** `PROFILE_ID = generic@2`, the successor major of the existing `generic@1` family.
- **Instantiation B:** `PROFILE_ID = architecture@1`, a new profile family; `generic@1` stays as the broader generic profile and is not superseded.

The executor, the layout engine, the schemas and the corpus are written against `PROFILE_ID` as data. No code path branches on the id string: a test that special-cases `generic@2` or `architecture@1` by name fails its gate. §9 (Q1) is where the owner picks A or B; §§2–8 are valid under either pick without a second edit pass, except for the migration path of §3.9, which is written for both instantiations explicitly (§3.9.1 for A, §3.9.2 for B).

For readability, worked examples and fixture names in this r2 instantiate `PROFILE_ID` as `generic@2`. A reader applying instantiation B substitutes `architecture@1` for `generic@2` in every such example; no other character changes. The file `packages/diagram-core/src/profiles/generic.ts` at the branch base declares `generic@1`; the completed declaration is added beside it under whichever id Q1 selects, and the other id is never registered.

### 1.2 Rationale, grounded (finding 16)

The r1 text overstated the rejected option in two places, and r2 corrects both. It is recorded here without overstatement in either direction:

- Several versioned profiles on one model and one executor are supported by the existing contracts (G0 §1.2: two admitted shapes, no third shape; M2 §3.3: versioned profiles; `packages/diagram-core/src/profile.ts:21`: `<name>@<major>` ids coexist in one registry). Publishing `architecture@1` would **not** create a second metamodel, and a registered migration from `generic@1` to `architecture@1` is expressible in the same migration machinery as a migration to `generic@2` (the migrator rewrites `profileRefs` and every `.profile` field; the family name is data). Neither option is impossible, and neither is forced by the executor.
- The choice therefore rests on three material trade-offs, stated fully in §9: (i) **consumer continuity** — existing `generic@1` consumers (layout engine, dossier binding, h2a dossier builder) re-pin one major under A, or re-pin to a new family under B; (ii) **scope of the generic profile** — under A the fixed card anatomy (`460 × 200`, §4.4) and the card/legend chrome become part of the generic successor, while under B that contract is isolated as an opt-in architecture profile and `generic@1` remains available for broader, non-card uses; (iii) **maintenance and the Engram catalog** — A governs one complete generic profile, B governs two complete profiles with overlapping card/container/link semantics and the compatibility obligations that follow.
- `decision` (recommendation, not settlement) — This specification **recommends instantiation A (`generic@2`)** on grounds (i) and (iii): one governed complete profile, one migration, and no fork of the input contract that current consumers already pin. The recommendation is recorded here so that M1 can be planned; it does not settle Q1. If the owner selects B, §§3–8 apply unchanged with the id substituted and §3.9.2 as the migration path.

### 1.3 What the completed profile changes, in one paragraph

`PROFILE_ID` keeps the `generic@1` type ids (`node`, `container`, `port`, `link`, `contains`, `association`), the `contains` tree hierarchy (`containment`), the limits shape and the command set. It adds the presentation-neutral card and container slots of §3.2 (including the legend header slots of §3.7), adds the legend types of §3.7, adds the generic relation-presentation slot of §3.5 (`strokeStyle`) and the authored aggregate-label input of §4.5 (`summaryLabels`), removes the global `unique-attribute` constraint on container `name`, removes the semantic `collapsed` attribute from `container`, raises the `link` label bound, and is validated by an executor that (a) accepts hierarchy parents by type family through one shared cycle-safe resolver (§5.1), (b) enforces only scoped uniqueness (§5.3) with legacy unscoped constraints read through a versioned compatibility adapter (§5.3.3) so `generic@1` bytes stay immutable, (c) enforces every legend/tone/hierarchy rule as profile constraint data through generic mechanisms (§3.10, §5.4), and (d) validates folded view projections (§4.3, §5.6). Everything else in `generic@1` carries over unchanged.

## 2. Starting point, measured

Every fact below carries its locator. Where a measurement contradicts the completed model, the completed model is the fix and the measurement is the evidence. Finding 17 is closed here: the BPMN coverage file is `spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md` (the r1 locator `SPEC_EVOL_GD_M2_BPMN_MODDLE_COVERAGE.md` does not exist), and the persisted-shape inventory is reconciled in §4.3.2 (one field on `RelationOccurrenceEndpoint`, two fields on `RelationOccurrence` for presentation, one record on `ViewDocument` for authored aggregate labels; no other view field is added).

### 2.1 The historical model (M2) already specifies the shape

`spec/SPEC_EVOL_GD_M2_MODEL.md` settles the core and this lot does not re-open it: a typed semantic core with versioned profiles, not a property bag (decision D1-A, §1 of that spec); broad read-only import with unvalidated content kept as `preserved-unvalidated` and never promoted to a fact (decision D3-C); seven nominal, non-interchangeable reference types; a `SemanticDocument` that excludes positions, camera and components; a `ViewDocument` of occurrences, visual groups, filters and persistable presentation state; transactional commands with an inverse or a documented reason; versioned schema migration that keeps the original and refuses an unknown major in write; fixtures including named rejected cases with asserted diagnostics.

`spec/SPEC_EVOL_GD_M2_MODEL.md` §3.4 is load-bearing for B2: an entity has **N occurrences in one view** and occurrences in several views; removing an occurrence removes a drawing, nothing else; removing the entity demands an explicit policy. §4.1 and §4.3 are written against that rule, not against a one-occurrence assumption.

`spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md` (decision A′) adds the kernel direction this lot reuses for hierarchy families: type constraints are satisfied by the named type or any subtype, and containment is a structural parent link, not a relation endpoint competing with a reference (§5, §6 K1/K4 of that spec). The executor change of §5.2 is the `PROFILE_ID` application of that already-decided rule, generalised by the shared resolver of §5.1.

### 2.2 The current executor, and the three gaps it proves

Current code is `packages/diagram-core/src/` at the branch base. Measured facts:

- `generic@1` is the only `complete` profile (`packages/diagram-core/src/profiles/generic.ts:17`). `node` declares `name` (required, ≤ 200), `state`, `weight`, `duration`, `createdAt`, `pinned`, `tags`, `owner`. `container` declares `name` (required, ≤ 200) and `collapsed`. Neither declares `kicker`, `body`, `detail`, `footer`, `icon`, `subtitle` or `tone`, and `validateDocument` refuses an undeclared attribute as `attribute-not-in-schema` (`packages/diagram-core/src/validate.ts`, `packages/diagram-core/src/attributes.ts`). Standard card slots therefore cannot be stored as attributes today.
- The `contains` parent role accepts exactly `entityTypes: ["container"]` (`packages/diagram-core/src/profiles/generic.ts:78`), and the validator compares the target type by strict equality (`packages/diagram-core/src/validate.ts:329`, `role.entityTypes.includes(target.type)`). A document refinement of `container` therefore cannot parent: the diagnostic is `endpoint-target-not-allowed`. **Gap 1.**
- `generic@1` declares `{ kind: "unique-attribute", entityType: "container", attribute: "name" }` globally (`packages/diagram-core/src/profiles/generic.ts:102`), enforced over every container in the document (`packages/diagram-core/src/validate.ts`, `validateConstraints`). Two zones legitimately titled « CI/CD » collide as `unique-attribute-violation`. **Gap 2.**
- `effectiveEntitySchemas` (`packages/diagram-core/src/validate.ts:48`) resolves **one** document refinement level only: a profile type returns its attributes; a document definition returns `[...base.attributes, ...definition.attributes]` where `base` must be a directly declared profile type. A refinement of a refinement fails with `unknown-entity-type` before endpoint-family acceptance matters, and the type-definition validation loop likewise requires a directly declared profile base. Canvas `readGraph` (`packages/diagram-canvas/src/layout/graph.ts`) resolves one level the same way. **Gap 1b (finding 11 / B5): multi-level refinement is larger than the r1 helper described.** §5.1 specifies the single shared resolver that closes it.
- The text schema (`packages/diagram-core/src/attributes.ts`, `ScalarSchema` arm `text`) supports only `maxLength`. There is no declarative carrier for a minimum length, a character grammar or a pattern, so the key-shape rule of §3.3 has no implementation contract today. **Gap 4 (finding 12).** §3.3 and §5.8 add the declarative constraints.
- Because of gaps 1 and 2, the measured HRPN target (`/home/antoinefa/src/airbus-genair-hrpolnav/docs/architecture/hrpn/engram/`, `README.md`, `build-engram.mjs`, `S2-target.semantic.json`) stores card slots in a document-local refinement `hrpn-card` (additive refinement of `node`, six text attributes), stores zone slots in 19 preserved extensions `hrpn.zone-slots@1` (`preserved-unvalidated`, source JSON with `kicker`, `subtitle`, `footer`, `icon`, `tint`, `displayTitle`), and stores the two « CI/CD » zones under suffixed names. The documents validate with zero diagnostics today precisely because the patches route around the gaps. **Gap 3 is the pair of workarounds, gaps 1 and 2 are its causes.**
- Fold state today has two carriers: the semantic `container.collapsed` attribute and `VisualGroup.collapsed` in the view (`packages/diagram-core/src/view.ts:88`). The component specification (`spec/SPEC_EVOL_DS_DIAGRAM_CARDS.md` at `97ecf69b`, §4.3) already decides the view carrier is the fold state; §4.1 below makes that a model rule and removes the semantic carrier in `PROFILE_ID`.
- The layout engine (`packages/diagram-canvas/src/layout/`) lays out `generic@1` only, reads only the `name` attribute per entity (`packages/diagram-canvas/src/layout/graph.ts`, `readGraph`), measures text through `TextMeasurer = (text, role) => TextSize` with roles `node | container-title | edge-label` (`packages/diagram-canvas/src/layout/types.ts:28`), and enlarges nodes for docking demand (`packages/diagram-canvas/src/layout/place.ts`, `packages/diagram-canvas/src/layout/engine.ts`). It accepts no fold input, no per-entity footprint and no measured header input, and it emits `groups: {}`. The measurer receives `(text, role)` and returns width/height: there is no entity measurement input, no available wrapping width, no toggle allocation and no shared line-layout result. These are the measured inputs of finding 3 (§4.4).
- `packages/diagram-canvas/src/visibility.ts` already evaluates `VisualGroup.collapsed`: a member of a collapsed group is excluded as `group-collapsed`, a relation whose endpoint is hidden as `endpoint-hidden`, with every exclusion reported. The scene (`packages/diagram-canvas/src/scene.ts`) conserves occurrences (every occurrence is an item or an exclusion, exactly once). §4.3 keeps this cascade and adds the folded-edge projection it currently cannot express.
- `ViewDocument.revision` (`packages/diagram-core/src/view.ts`) is defined as “the document revision this view was last changed at; never ahead of the document”, and `validateView` refuses `view.revision > document.revision` as `revision-divergence` (`packages/diagram-core/src/validate.ts:814`). The supplied HRPN view at revision 1 against a document at revision 1 validates; incrementing the view to 2 for a fold produces `revision-divergence`. **Measured input of finding 10 / B1.** §4.1.3 fixes the meaning.
- Every profile-bearing record carries its own `profile` field: `Entity.profile`, `Relation.profile`, `SemanticPort.profile`, `TypeDefinition.profile` (`packages/diagram-core/src/document.ts:28–84`), plus the document-level `profileRefs`. Replacing `profileRefs` alone therefore leaves four record families pinned to the old profile. **Measured input of finding 4 / A4.** §3.9 enumerates every rewrite.

### 2.3 The review blockings this specification closes

Independent review `scratchpad/rev/dcards-rev1.out` on the component specification, two blockings, restated as model requirements and closed by r2 together with the pass-1 findings that extend them:

- **Blocking 1 — folded edge projection cannot produce a valid `ViewDocument`.** Retargeting a relation occurrence whose semantic endpoint sits inside a collapsed container (the review example: `CHAT → TOPIC` drawn to collapsed `MSGZ`) produces `occurrence-endpoint-mismatch`, because `packages/diagram-core/src/validate.ts` requires the drawn occurrence to draw exactly a semantic endpoint target. §4.3 defines the projected endpoint as view data with occurrence-level provenance, selects the outermost visible collapsed ancestor, and recomputes the projection from recoverable original endpoints on every transition. Every folded output SHALL pass `validateView`.
- **Blocking 2 — the engine contract lacks the fixed-footprint measurement input it promises.** No per-entity footprint or measured header input exists, and placement enlarges nodes for docking, contradicting the fixed `460 × 200` card. §4.4 defines the exact measurement types and call sequence, state-dependent footprints, the fixed-axis policy and the overflow result; §5.6 assigns the implementation. A measurer that only observes role calls is explicitly insufficient (§4.4.5).

The same review records (item 4) that the three gaps of §2.2 do not justify weakening generic executor validation. This specification follows that: gaps 1 and 2 are closed by making the rules mean what they should mean for every profile (family acceptance through the shared resolver, scoped uniqueness), not by exempting one consumer.

## 3. The complete model: `PROFILE_ID` (semantic)

The semantic model remains the M2 model: a `SemanticDocument` (identity, schema version, monotonic revision, declared profiles, document type definitions, entities, relations, semantic ports, resources, preserved extensions) and no geometry. This section declares the `PROFILE_ID` profile content and the semantic rules that complete it. Persisted-shape impact is gathered in §3.9: the additions are profile data and the view fields of §4.3.2/§4.5; the only semantic removal is the `container.collapsed` attribute.

### 3.1 Entity types

`PROFILE_ID` declares four entity types. Type ids `node` and `container` are unchanged from `generic@1` so stored documents, the layout engine's type dispatch and the migration stay small (`decision`, §1.2). Under instantiation B the same four ids are declared by `architecture@1`; the ids do not change with the profile family.

| Type id | Role in a diagram | Parents via the hierarchy relation | Children via the hierarchy relation |
| --- | --- | --- | --- |
| `node` | Atomic card (leaf). One card, fixed footprint, never grows with its text. | No | No |
| `container` | Wrapping container (zone). Expanded it frames its children; collapsed it is one atomic card (§4). | Yes | Yes: `node`, `container`, `legend` |
| `legend` | Legend frame. Carries the document's colour-key categories as model data (§3.7), with the same header slots as a container. | Yes | Only the key type declared by the legend constraint (§3.10) |
| `legend-key` | One legend category: a key, a label and a colour token. Rendered as a colour-key line, never as an atomic card. | No | No |

`decision` — Container capability is a declared property of the type, not an inference from its id. Each `EntityTypeDeclaration` in `PROFILE_ID` carries the executor-visible classification of §5.2 (`container: true` for `container` and `legend`). A document type definition that refines `container` or `legend` inherits the capability through its base chain as resolved by the shared resolver (§5.1); a refinement of `node` or `legend-key` never acquires it. This is what lets a refined container parent (§3.4) without any consumer-specific rule, and it is also what the synthetic-profile test of §5.4 exercises under different identifiers.

Abstract types remain non-instantiable, as today. `PROFILE_ID` declares no abstract card or container type: the four types above are concrete, and specialisation is expressed by document refinement (§3.4), not by a fifth type.

### 3.2 First-class presentation-neutral slots

All slots are typed attributes validated against the profile, exactly as M2 requires: a value carries its kind, an undeclared attribute refuses as `attribute-not-in-schema`, and no slot is ever carried by an extension or a free property bag. Length bounds are set so the measured validated corpus fits without moving the frozen geometry; a longer text is a wording defect reported by measurement (§4.4), never a reason to enlarge a card.

#### 3.2.1 Atomic card (`node`)

| Attribute | Kind | Required | Meaning (presentation-neutral) |
| --- | --- | --- | --- |
| `name` | text ≤ 200 | yes | Title. The single identity-adjacent display string; it is content, never parsed, split or prefixed by an executor or a renderer. |
| `kicker` | text ≤ 80, key-shaped where §3.3 applies | no | Short code or family line above the title (for example a service code). Display case is a rendering transform under the host locale; the stored string is the authored string. |
| `body` | text ≤ 400 | no | First body line (function line). One line of content; wrapping is measurement, not storage. |
| `detail` | text ≤ 400 | no | Second body line (detail line), rendered in the secondary text role. The `body` / `detail` split carries the line role in the model, so measurement, rendering and editing read the same role (closes the component review item on untyped `string[]` body input). |
| `footer` | text ≤ 120 | no | One pinned footer line (for example an owning service). Absent means no rule and no footer are drawn. |
| `icon` | text ≤ 40, key grammar (§3.3) | no | Pictogram registry name (for example `server`, `brain`, `robot`). A name, never SVG data, never a path. An unknown name is a rendering diagnostic, not a semantic refusal (§3.3). |
| `tone` | text ≤ 40, key grammar (§3.3) | no | Tone category key (for example `neutral`). A key into the document legend (§3.7) when the category-membership constraint applies, otherwise consumer category data; never a colour value. Absent means the neutral category. |

The `generic@1` general attributes `state`, `weight`, `duration`, `createdAt`, `pinned`, `tags` and `owner` carry over unchanged on `node`. They are not card chrome and no card renderer is required to display them.

Body cardinality (`decision`): a leaf card stores at most the two body lines above. The frozen card anatomy allocates exactly two body lines; a third line has no allocation to measure against and would reintroduce growth-by-text. Content needing more lines belongs in a container's `subtitle` (wrapped, §3.2.2) or in a child card. A profile that later needs longer leaf prose does so by a new major, not by widening these bounds silently.

#### 3.2.2 Wrapping container (`container`)

| Attribute | Kind | Required | Meaning (presentation-neutral) |
| --- | --- | --- | --- |
| `name` | text ≤ 200 | yes | Title **without** any package prefix. A stored title that embeds a prefix (for example « H2A · … ») is producer content to migrate, never a string a renderer splits. |
| `kicker` | text ≤ 80 | no | Package or family name carried by the header (for example `H2A`, `ENGRAM`). Same slot shape as the card kicker, so one header measurement and one header component serve both types. |
| `subtitle` | text ≤ 600 | no | Wrapped description under the header when expanded; the centred summary content when collapsed (§4.2). One string; line breaking is measurement. |
| `footer` | text ≤ 120 | no | Footer line shown by the collapsed card form (rule plus pinned footer). Carried as content when expanded; expanded frames draw no footer rule at the frame bottom. This is the declared form of the field the measured adapter had to invent as `cardFooter`. |
| `icon` | text ≤ 40, key grammar (§3.3) | no | Pictogram registry name, same registry and same slot rules as the card icon. The container icon box is the card icon box (`frozen-requirement`: same size for groups and cards). |
| `tone` | text ≤ 40, key grammar (§3.3) | no | Tone category key, same category space as the card tone. One key, one token resolution in both the expanded and collapsed forms, subject to §3.7 binding. |

`PROFILE_ID` container declares **no** `collapsed` attribute. The `generic@1` semantic boolean is removed (§3.9): fold is view state (§4.1), two views of one document fold differently, and a fold never bumps the document revision.

#### 3.2.3 What a slot never carries

- No colour value (hex, rgb, token value) is stored in any slot. Colour enters only as a category key (`tone`, legend `token` name in §3.7) resolved through design tokens at render time.
- No geometry (size, position, folded height) is stored in any slot. Geometry is view data (§4).
- No markup, no SVG, no URL and no executable content is stored in any slot. Imported content that a profile does not validate keeps the M2 levels `validated | preserved-unvalidated | unsupported` and is never promoted to a slot value.
- No language-specific string is stored by the profile or the executor. Slots store authored content in the document's language; §3.8 states the localisation rule.

### 3.3 Icon and tone: registry names, category keys, and declarative text constraints (finding 12)

`decision` — `icon` and `tone` are **open key spaces with a closed shape**, not closed enumerations in the profile.

- Shape: a key is 1–40 characters matching the language-neutral key form (lowercase ASCII letters, digits and hyphen, starting with a letter). The executor enforces the shape and the length; it does not enumerate the keys, because the pictogram registry and the tone category set are rendering and theme data that evolve without a profile major.
- **Declarative carrier (new).** The shape is not prose: the text schema gains declarative constraints, validated generically by `attributes.ts` (§5.8). A text attribute schema MAY declare:
  ```ts
  { kind: "text", maxLength?: number, minLength?: number,
    pattern?: string /* anchored RegExp source, ASCII, no flags */,
    patternName?: string /* stable name recorded in diagnostics, e.g. "key" */ }
  ```
  `PROFILE_ID` declares `icon` and `tone` (and `legend-key.category`, `legend-key.token` under their own grammars below) with `minLength: 1` and `pattern: "^[a-z][a-z0-9-]*$"` (called `key` in diagnostics). `token` declares `patternName: "token-name"` with pattern `"^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$"` (dot-separated token path segments), `minLength: 1`, `maxLength: 80`. A value that violates `minLength` or `pattern` refuses as `text-pattern-mismatch` (new diagnostic code, §5.8, Appendix C) with `details: { pattern: <patternName>, length, maxLength? }`; the existing `text-too-long` code is unchanged for `maxLength`. Empty, uppercase, whitespace-bearing and colour-shaped values (`#fff`, `rgb(…)`) therefore refuse at semantic validation, while a well-formed but unknown icon name still validates (shape only) and is handled at render time. Token-name syntax is defined independently of the key grammar, so the two patterns are tested separately (§5.8).
- Icon resolution: the renderer resolves `icon` against the design-system pictogram registry delivered on its own subpath (one duotone family, 64-unit viewBox; the validated set includes `brain`, `robot`, `server`, `people`, `window`, `link`, `db`, `shield`, `cloud` and the remaining glyphs of the validated scenes). An unmapped name draws no icon, collapses the icon slot and raises the rendering diagnostic `card-icon-unknown` / `zone-icon-unknown`; it does not refuse the document. Semantic validation therefore stays stable when a glyph is added.
- Tone resolution: the renderer resolves `tone` through the tone-token mapping in force (theme tokens, never a component-local colour). When the document declares a legend and the profile declares the category-membership constraint (§3.10), every non-neutral `tone` value in the document SHALL equal a declared legend category key under the binding rule of §3.7.3; §5.4 implements that check generically as `tone-category-unknown`. Without the constraint, a tone key is consumer category data and the executor checks its shape only. The validated HRPN category keys (`genair`, `specific`, `added`, `removed`, `risk`, `custom`, `outside`) and the governance keys (`neutral`, `proposal`, `identity`) are therefore all storable without a profile change, and none of them is named by the generic profile: they enter as legend data (§3.7) in each corpus instance.

### 3.4 Containment: one hierarchy, family parents, nesting depth

Containment is the single hierarchy of the model.

1. **One relation, one hierarchy.** The hierarchy relation (id `contains` in `PROFILE_ID`, roles `parent` / `child`, each `1..1`, directed) is the only hierarchy-bearing relation. Its hierarchy id remains `containment`, shape `tree`. The relation id and the hierarchy id are **profile data**, not executor literals: §3.10 declares them in a `hierarchy` constraint, and the executor reads the ids from the pinned profile. A synthetic profile that names its hierarchy relation `nesting` and its hierarchy `nesting-tree` is executed by the same code (§5.4 test 3). Business containment, processing hierarchy and visual grouping stay distinct, as in M2: `VisualGroup` membership is not containment, a `link` is not containment, and no second hierarchy is declared by `PROFILE_ID`.
2. **Family parents.** The `parent` role accepts any entity whose effective type — as resolved by the shared chain resolver of §5.1 — is in the container family (its base chain contains a type declared `container: true`). The `child` role accepts any declared entity type. A refined container therefore parents with no extension, no second relation type and no profile change. The executor mechanism (effective-type resolution over the base chain) is specified in §5.1–§5.2 and applies to every `entityTypes` constraint, not only to `contains`.
3. **Tree rule.** Each child has at most one hierarchy parent; a second parent refuses as `hierarchy-multiple-parents`; any cycle refuses as `hierarchy-cycle` with its members. Both diagnostics exist today and keep their codes.
4. **Nesting depth.** Depth is the number of hierarchy ancestors (a top-level entity has depth 0). `PROFILE_ID` imposes no depth cap below its entity limits: nesting is bounded only by acyclicity and by the profile limits (`maxEntities`, §3.6). A collapsed container has the atomic footprint at every depth (§4.4). Executors and layout SHALL traverse containment iteratively or with an explicitly bounded stack, so depth is a data property, never a call-stack limit. (Measured need: the validated scenes nest to depth 4; the rule deliberately allows more rather than encoding today's deepest scene as a limit.)
5. **Occurrence independence.** Containment is semantic. A container may be drawn expanded in one view and collapsed in another, and a child may have occurrences in a view where its parent has none (the drawing is then placed by the view, and §4.3 governs its edges). Deleting a container entity still requires the explicit occurrence / relation / port policy of the M2 command contract; nothing in this section adds a silent cascade.

Document type definitions keep the M2 rule: additive only, a redeclared base attribute refuses as `type-definition-conflict`. Refinements remain available for genuinely consumer-specific attributes. A refinement that re-declares a §3.2 slot name on `node` or `container` is a `type-definition-conflict` by that same rule once `PROFILE_ID` declares the slots — which is the mechanism that makes the measured `hrpn-card` pattern unnecessary and, if retained, loudly redundant rather than silently divergent. Refinement resolution itself (chains, cycles, inherited conflicts) is defined once in §5.1 and used by validation, endpoint checks and layout classification alike.

### 3.5 Relations, ports, and relation presentation (finding 1 / A7)

`PROFILE_ID` keeps the three `generic@1` relation types and the one port type. No relation type is added: the validated diagrams need labelled directed links, containment and hyper-association, and nothing else. What is added is the generic presentation carrier the corpus already carries and r1 could not represent.

| Relation type | Direction | Roles (cardinality) | Attributes |
| --- | --- | --- | --- |
| `contains` (hierarchy relation; id is profile data, §3.4) | directed | `parent` 1..1, `child` 1..1 (§3.4) | none |
| `link` | directed | `source` 1..1, `target` 1..1; each target an entity or a port | `label` text ≤ 200; `weight` quantity (unchanged); `strokeStyle` enum `solid \| dashed` (new, §3.5.1) |
| `association` | undirected | `member` 2..8, entities only | `label` text ≤ 120; `strokeStyle` enum `solid \| dashed` (new, §3.5.1) |

- The `link` label bound rises from 120 to 200 so the longest labelled relations of the validated corpus store without truncation (`decision`; the bound is profile data, and the migration of §3.9 records it). A `link` without a label is valid; the label is content, never a routing instruction.
- The business id of a relation survives every projection, including the folded projection of §4.3 and any junction-node projection of a hyper-relation. A projection never mints a new business relation.

#### 3.5.1 Relation presentation: `strokeStyle` as a generic relation slot

`decision` — Stroke style is **semantic presentation data on the relation**, with an optional view override. It is not a consumer field, not a renderer default and not inferred from the label.

1. **Semantic slot.** Each `link` and each `association` MAY carry `strokeStyle: { kind: "enum", value: "solid" | "dashed" }`. Absent means `solid`. The slot is declared in the profile as an `enum` attribute with values `["solid", "dashed"]`; it is validated like every other attribute (an undeclared value refuses as `enum-value-not-allowed`). The meaning is presentation-neutral: `dashed` records that the relation is drawn with a dashed stroke (the corpus reading is “dormant, optional or not built”, `tint-legend.json` `relationStyles`); the model stores the style, never the consumer's reason for it.
2. **View override.** `RelationOccurrence` gains an optional field `strokeStyle?: "solid" | "dashed"` (§4.3.2 inventory). When present it overrides the semantic value for that drawing only; when absent the drawing inherits the semantic value (or `solid`). The override is view data: changing it never mutates the `SemanticDocument` and never bumps `document.revision`. A folded projection (§4.3) copies the effective style onto the projected occurrence, so a dashed relation stays dashed when folded and when exported.
3. **Rendering mapping.** The renderer maps `solid` to a continuous stroke and `dashed` to the dashed stroke of the diagram token set, at the same stroke width and colour resolution as every other relation. No other presentation (colour, width, arrowhead) is carried by this slot.
4. **Corpus assertion (normative).** The re-expressed acceptance instances SHALL preserve the distinction per relation id: S2-asbuilt carries **7 dashed / 37 solid** of 44 links, S1-conversational **10 dashed / 14 solid** of 24, S3-agentfactory **3 dashed / 33 solid** of 36, S2-target **0 dashed / 54 solid** (fixture form) and A5 **0 dashed** in its 31 links (measured from `ds-fixtures/MANIFEST.md` and `tint-legend.json:relationStyles`). A conversion that validates semantically but drops or invents a dash fails the instance (§7). Fold and export round trips (§8, roadmap) assert the same per-id styles on the way back.

Semantic ports are unchanged in shape: a port belongs to an entity, has a direction (`in | out | inout`), a name and typed attributes; side, order and anchor are geometric and live on the port occurrence in a view. A `link` endpoint that targets a port is drawn through that port's occurrence (§4.3 covers its folded form, including the representative's port occurrence). Endpoint type constraints on every role are family constraints under §5.1–§5.2: naming a type accepts that type and its refinements.

### 3.6 Limits

Carried from `generic@1` unless stated: `maxEndpointsPerRelation: 8`; document-level `maxEntities: 100000`, `maxRelations: 500000` as executor refusal limits, not as scene guidance.

`decision` — The `generic@1` constraint `max-entities-of-type container ≤ 64` is **not** carried as a hard refusal in `PROFILE_ID`. The validated corpus exceeds any small round container bound once scenes compose, and a count of frames is a layout and readability concern, not a semantic validity condition. `PROFILE_ID` declares no `max-entities-of-type` constraint. Hosts that need a scene-size policy enforce it as a consumer bound (the Focus dossier precedent: 1–80 entities, ≤ 240 relations, recorded as consumer bounds, not as profile validity) and report it under their own diagnostic, never as a profile refusal. The executor mechanism for `max-entities-of-type` stays available to profiles that genuinely need it. §3.9.4 proves by resolve witness that this removed constraint is not inherited back into `PROFILE_ID` through G0 stacking (§3.10, finding 13).

### 3.7 Legend as model data (findings 8, 9 / B3, B6)

The legend is semantic data: which categories exist, what each is called and which token paints it. It is not a drawing, a caption string or a set of sample cards.

#### 3.7.1 Legend frame and header slots

- A legend is one `legend` entity. `legend` declares the **same header slots as `container`** — `name` (required, ≤ 200), `kicker` (≤ 80), `subtitle` (≤ 600), `footer` (≤ 120), `icon` (key grammar, ≤ 40), `tone` (key grammar, ≤ 40) — plus no slot of its own. This closes finding 8: the measured A5 `LEGEND` container carries `kicker`, `subtitle` and `icon` in its `hrpn.zone-slots@1` extension (`{"icon":"window","kicker":"HRPN","subtitle":"Card tints and link styles of this scene"}`); under `PROFILE_ID` those three values are ordinary `legend` attributes and need no extension. A legend with no header content beyond `name` is valid; the header slots are optional exactly as on `container`.
- Its categories are its key children through the hierarchy relation, constrained by the legend-children constraint of §3.10 (in `PROFILE_ID`: legend type `legend`, key type `legend-key`, hierarchy `containment`). An executor does not refuse a nested legend, but layout places legends by occurrence geometry as given.
- Rendering a legend is a colour-key list (swatch plus label per category), placeable inside the diagram through the legend entity's occurrence geometry. It is never rendered as a set of atomic cards, and its keys never use the card footprint (§4.4 gives the legend-key footprint).

#### 3.7.2 Legend keys and explicit ordering (finding 9)

Each key entity (type `legend-key` in `PROFILE_ID`) declares:

| Attribute | Kind | Required | Meaning |
| --- | --- | --- | --- |
| `name` | text ≤ 120 | yes | Category label as displayed (authored content, §3.8). |
| `category` | text ≤ 40, key grammar (§3.3) | yes | Category key, same key space as `tone` (§3.3). Unique **within its legend** (§5.3, scoped uniqueness). |
| `token` | text ≤ 80, token-name grammar (§3.3) | yes | Design-token name that resolves the category colour (for example a semantic data-category token name). A token name, never a colour value. An unresolvable token name is a rendering diagnostic, not a semantic refusal. |
| `description` | text ≤ 200 | no | Optional longer label for accessible text and export legends. |
| `order` | quantity, unit `unit`, integer ≥ 0 | yes | **Authored display order inside its legend.** Lower sorts first; ties refuse (see below). Order is an explicit field, never derived from the entity reference. |

`decision` (ordering) — Category order is the `order` field, sorted ascending, with the entity id (UTF-16 order) as a deterministic tie-break that never decides a distinct `order` value. Renaming an entity reference therefore never reorders a legend, and reordering a legend never requires renaming an id. Two keys in one legend with the same `order` value report `unique-attribute-violation` under the scoped-uniqueness constraint on `(legend, order)` declared in §3.10 — order is data with a uniqueness scope, exactly like `category`. The r1 rule (“sorted reference order; name keys so the sorted order is intended”) is withdrawn: it encoded authored order by renaming identity, contrary to the M2 rule that every order that matters is an explicit field. A host that needs an authored order sets `order`; the reference itself is never the field.

A legend with zero keys is valid data and renders nothing. Duplicate category keys inside one legend refuse (§5.3); the same key in two different legends is governed by §3.7.3, not by the per-legend uniqueness scope.

#### 3.7.3 Legend binding: deterministic resolution and conflict refusal (finding 9 / B6)

A document MAY carry several legends (composed scenes, imported fragments). A bare `tone` key does not name its legend, so resolution SHALL be deterministic and never depend on insertion order or on a consumer tint table:

1. **Binding field.** `SemanticDocument` gains no field. Binding is expressed per entity by an optional reference attribute declared in `PROFILE_ID` on `node`, `container` and `legend`: `legendRef` (kind `reference`, `refKind: "entity"`, optional). When present, the entity's `tone` resolves against the legend entity it names, and against no other. The reference is validated as a reference (a dangling or non-legend target reports the reference diagnostics of §5.4); it is not a tint table and it is stored in the document, so two hosts resolve the same document identically.
2. **Single-legend default.** When an entity carries no `legendRef` and the document contains exactly one `legend` entity, its `tone` resolves against that legend. This is the common corpus case and needs no per-entity field.
3. **Conflict refusal.** When an entity carries no `legendRef`, the document contains two or more legends, and those legends declare the same `category` with **different `token` values**, resolving that entity's `tone` reports `tone-category-unknown` with `details.legendBinding: "ambiguous"` (frozen contract, Appendix C) — resolution refuses rather than picking the first legend in record order. When the legends agree on the token for that category, resolution succeeds with that token (agreement is not ambiguity). When the entity's `tone` category is declared by no legend, the same code reports with `details.legendBinding: "undeclared"`. An entity MAY always disambiguate by setting `legendRef`.
4. **No order dependence.** The check collects the set of `(category → token)` bindings across all legends in the document, sorted by legend entity id, and compares token values as data. Permuting record insertion order, legend order or key order never changes the verdict; the whole-array comparison test of §5.4 asserts this under reordered input.

The `tone` values used by cards and containers in the same document therefore resolve against declared categories with a stated binding, and the legend explains the document that carries it with no consumer-side tint table.

### 3.8 Text, language and identifiers

- Every text slot stores authored content in the language of the document. The profile, the executor and the renderers hold no language: no kicker table, no « N links » string, no fold label is built into the model. Strings a renderer must generate (aggregate counts, expand/collapse labels, diagnostics text) are host-supplied or host-localised, never stored in the semantic document. §4.5 carries the authored exception: an aggregate label the author wrote (`summaryLabels`) is stored as view data because it is authored content, not a generated string.
- One document carries one language per slot. A translated diagram is a second document instance produced by its author or translator, sharing entity references where the host wants cross-language correspondence; the executor never rewrites a stored string in place and never holds two languages in one attribute. This keeps canonical bytes, hashes and migration reports single-language and auditable.
- Case transforms (kicker uppercase) are rendering transforms under the host locale's case mapping. The stored string is never uppercased in the document.
- New identifiers are language-neutral: profile ids, type ids, attribute names, category keys, icon names and token names are ASCII key forms (§3.3). Persisted values in another language remain readable forever; a rename of a persisted value is a migration with a report, never an in-place rewrite.

### 3.9 Migration (finding 4 / A4; supersession in §3.9.4)

Two distinct version axes exist and are not conflated: the persisted **schema version** (`SemanticDocument.schemaVersion`, currently `1.1`) and the **profile major** (`generic@1 → PROFILE_ID`). This lot bumps the profile identity. It does not bump the schema major: no `SemanticDocument` field is added or removed. The view additions of §4.3.2 and §4.5 are optional fields on existing view records plus one optional record on `ViewDocument` (`summaryLabels`), readable by the current view validator's successor without a stored-shape break (a view without them is a valid unfolded view). Finding 17's inventory is therefore: **semantic shape — no field added, one attribute removed from one type by profile data; view shape — `RelationOccurrenceEndpoint` gains two optional fields, `RelationOccurrence` gains two optional fields, `ViewDocument` gains one optional record.** Earlier drafts that announced “two view additions” are superseded by this inventory.

The profile migration is a registered, versioned function with the M2 contract: it produces a report (`from`, `to`, operations, unmigrated items with reasons) and keeps the original. “A migrated document validates” is a normative outcome of this section: a migration that completes with an empty `unmigrated` list SHALL produce a document that `validateDocument` accepts with zero diagnostics under the target profile, with every business id and every non-profile content value retained. A migration that cannot reach that outcome lists the blocking items in `unmigrated` and does not present its output as a valid target document.

#### 3.9.1 Instantiation A: `generic@1 → generic@2` (supersession)

Operations run in **deterministic order**: profile references first, then type definitions sorted by id, then entities sorted by id, then relations sorted by id, then ports sorted by id. Record insertion order never changes the operation list or the output bytes (the reversed-insertion fixture of §5.7 asserts this). Every transformation is reported; no transformation is silent.

1. **`profileRefs`**: replace `generic@1` with `generic@2`, preserving the position of the replaced entry and every unrelated profile reference unchanged. A document that declares no `generic@1` is not an input to this migration (`unmigrated`, reason `profile-not-declared` on the document path). A document declaring both `generic@1` and `generic@2` refuses migration (mixed majors are not created or consumed by migration; the author chooses the major per document).
2. **Every profile-bearing record** (the enumeration whose omission caused finding 4): for each record whose `profile` field equals `generic@1`, rewrite that field to `generic@2` and record one operation `rewrite-profile` with the record path. The record families are, exhaustively: `typeDefinitions.*.profile`, `entities.*.profile`, `relations.*.profile`, `ports.*.profile` (semantic ports). Records naming any other profile are carried unchanged and are not reported as rewritten. After this step no record in the migrated document names `generic@1`; a post-migration scan that finds one is a migrator defect, and the §5.7 fixture asserts the scan is empty.
3. **Type definitions — refinement resolution and remapping** (kept distinct from unresolved migration): for each `TypeDefinition` whose (rewritten) `profile` is `generic@2`, resolve its base chain through the shared resolver (§5.1) against the **target** profile.
   - If the definition redeclares no attribute that the target profile now declares on its effective base chain, carry the definition unchanged (its additive attributes remain consumer-specific data).
   - If the definition redeclares one or more attributes that `PROFILE_ID` now declares with the **same kind and a bound that accepts every stored value** of that attribute in the document (the measured `hrpn-card` case: `kicker`, `body`, `detail`, `footer`, `icon`, `tint`→`tone` — see the rename note below), the migration **remaps**: every entity whose `type` is that definition id is rewritten to the definition's effective base type id, each redeclared attribute value is carried onto the entity under the profile attribute name, the definition is dropped, and one operation `remap-refinement` per definition plus one `remap-instance` per rewritten entity is recorded. The migrated document then validates without the redundant refinement; deleting the definition alone (which would leave unknown types) never happens.
   - The `tint` → `tone` rename inside a remapped refinement is a declared mapping of this migration, recorded per attribute as `rename-attribute tint->tone` in the operation detail; it is the single attribute rename the migration performs, and it applies only inside a remapped refinement, never to a free-standing attribute.
   - If the definition redeclares a now-declared slot with a **different kind, or a bound that rejects a stored value**, the definition is **not** remapped: it is listed in `unmigrated` with reason `type-definition-conflict` and carried unchanged, and the migration outcome is “carried with unmigrated items” — its output is not claimed valid until the author edits. Migration never silently deletes a consumer attribute and never truncates a value to fit a new bound.
   - A definition whose base chain does not resolve against the target profile (missing base, cycle) is listed in `unmigrated` with the resolver's diagnostic code and carried unchanged.
4. **Entities**: per entity, carry every attribute that the target profile still declares on the entity's effective type, unchanged. The new §3.2 slots are absent after migration (they are optional); migration never invents kicker, body, icon or tone content. Per `container` entity: drop the `collapsed` attribute. Record one operation `drop-attribute container.collapsed` per affected entity, with the dropped boolean in the operation detail, so a host can seed its first view's fold state (§4.2) from the report. The value is not carried into any semantic field. The three stored cases — attribute absent, `collapsed: false`, `collapsed: true` — are distinct report lines and are fixtured separately (§5.7).
5. **Relations and ports**: carry endpoints, attributes and direction unchanged, except the `profile` rewrite of step 2. The raised `link` label bound (120 → 200) is recorded once as an operation `profile-bound-change link.label 120->200` on the profile path; no stored label is rewritten. A stored `strokeStyle` cannot exist in a `generic@1` document (the slot is new), so migration invents none: every migrated link is effectively `solid` until an author sets the slot.
6. **Extensions, resources**: carry over unchanged. A preserved extension whose content duplicates the new slots (the measured `hrpn.zone-slots@1` pattern) is carried as preserved data and listed in the report as `preserved-duplicates-profile-slots` (informational operation detail, not an `unmigrated` item): removing it is the consumer switch-over edit witnessed in §7, so migration alone never deletes preserved content (decision D3-C).

An unknown profile major in a stored document refuses in write and is preserved for inspection, as today. `generic@1` remains registered and validatable after `generic@2` ships: migration is per-document and explicit, never a registry replacement. Recovery is the retained original: the report carries `originalCanonical` and its hash, and “recovery of the original” (restoring the pre-migration bytes from the report) is a fixtured operation, not a re-run of the migrator backwards.

#### 3.9.2 Instantiation B: `generic@1` kept, `architecture@1` as a new family

Under Q1-B the same migrator runs with `to = architecture@1`. Steps 1–6 apply verbatim with the target id substituted, with two recorded differences: (a) there is no supersession — `generic@1` is not deprecated by this migration, and documents that stay on `generic@1` are a supported end state, not a pending migration; (b) the catalog records `architecture@1` with an empty G0 lineage `parents` list and its own stack (§3.9.4, §6), while `generic@1` keeps its existing record untouched. The remapping, reporting, determinism and “migrated document validates” rules are identical; a fixture pair (same input migrated under A and under B) SHALL differ only in the profile id strings and the catalog relationship, never in content, counts or diagnostics.

#### 3.9.3 Reserved-name collisions

If a document already declares a type definition, entity type usage or attribute that collides with a name `PROFILE_ID` introduces (for example a document definition id `legend` or an attribute `order` on a key-like type), the collision is detected **before** any rewrite: the migrator lists each colliding path in `unmigrated` with reason `type-definition-conflict` and detail `reserved-name-collision`, performs no rewrite on the colliding records, and still rewrites the non-colliding records deterministically. A collision never produces a document that validates under neither profile.

#### 3.9.4 Supersession is not G0 stacking ancestry (finding 13 / A5)

G0 defines `lineage.parents` as **composition layers** under narrowing-only stacking rules (G0 §2.3: S-1 a child may add types and narrow constraints; S-2 a child may not remove a parent type, widen a cardinality or redeclare an attribute). `PROFILE_ID` removes the `collapsed` attribute and the container-name uniqueness and count constraints, widens the `link` label bound, and relaxes scoped uniqueness relative to `generic@1`. It therefore **cannot** be a G0 stacking child of `generic@1`, and r2 does not record it as one:

- Under instantiation A, `generic@2` is published as a **replacement major** related to `generic@1` by an explicit **migration/supersession relationship**: the catalog record for `generic@1` gains `supersededBy` pointing at the `generic@2` pin, paired with the migration reference of §3.9.1 (G0 §1.4: `supersededBy` is required iff lifecycle is `superseded`, and on a superseded record it is paired with a migration reference). The `generic@2` record's own `lineage.parents` is the empty list (a base with no parent) and its `stack` is the single-layer stack containing only its own pin. No delta, no derivation record and no parent pin names `generic@1` as a layer.
- Under instantiation B, `architecture@1` likewise records empty `parents` and a single-layer stack; `generic@1` is neither its parent nor superseded by it, and the migration reference is recorded as a cross-family migration, not as lineage.
- **Resolve witness (normative).** Resolving the `PROFILE_ID` stack SHALL produce an effective profile in which (i) no `unique-attribute` constraint on container `name` exists, (ii) no `max-entities-of-type` constraint on `container` exists, and (iii) the `link` label bound is 200. A resolve that inherits any of the three from `generic@1` fails qualification. The §5.7 test asserts all three on the resolved declaration, proving the removed and relaxed constraints are not inherited back.

### 3.10 Every rule is profile constraint data; the executor holds only generic mechanisms (finding 7 / A3)

No legend, tone or hierarchy rule is coded in the executor against literal type or attribute names. Each rule below is a **profile constraint declaration** (data, governed by Engram under G2, covered by the G0 content digest of §6.3), and the executor implements the generic mechanism that executes the declaration for whatever identifiers the declaration names. A profile that omits a declaration does not acquire the rule, and a profile that uses those English words for other purposes does not acquire it either — name matching is never the trigger.

The `ProfileConstraint` union (`packages/diagram-core/src/profile.ts`) gains the following arms. Existing arms (`acyclic-hierarchy`, `unique-attribute`, `max-entities-of-type`) are unchanged except for the scoped form of `unique-attribute` in §5.3.

| Constraint kind (data) | Fields (all identifiers are data) | Generic mechanism (executor) | Declared by `PROFILE_ID` as |
| --- | --- | --- | --- |
| `hierarchy` | `relationType`, `hierarchyId`, `parentRole`, `childRole` | The named relation is the tree/dag hierarchy; cycle and multiple-parent checks run over the named roles. No relation id is assumed. | `relationType: "contains"`, `hierarchyId: "containment"`, roles `parent`/`child` (also carried on the relation declaration's `hierarchy` field; the constraint is the executable statement) |
| `parent-family` | `hierarchyId`, `familyRoots: string[]` | A hierarchy parent is accepted iff the target's effective base chain (§5.1) contains any of `familyRoots` (each root being a type declared `container: true`, or a type whose chain reaches one). | `hierarchyId: "containment"`, `familyRoots: ["container", "legend"]` |
| `children-restricted` | `parentFamilyRoots: string[]`, `childTypes: string[]`, `hierarchyId` | A hierarchy child of a parent in the family must have an effective type in `childTypes` (family satisfaction, §5.1). | `parentFamilyRoots: ["legend"]`, `childTypes: ["legend-key"]`, `hierarchyId: "containment"` |
| `category-membership` | `valueTypes: string[]`, `attribute`, `categoryType`, `categoryAttribute`, `neutralValue`, `bindingAttribute` | For each entity of `valueTypes`, its `attribute` value (unless absent or equal to `neutralValue`) must equal the `categoryAttribute` value of some key entity of `categoryType`, resolved under the binding rule of §3.7.3 where `bindingAttribute` names the optional per-entity legend reference. | `valueTypes: ["node", "container"]`, `attribute: "tone"`, `categoryType: "legend-key"`, `categoryAttribute: "category"`, `neutralValue: "neutral"`, `bindingAttribute: "legendRef"` |
| `key-shape` (schema-level, §3.3) | On the attribute schema: `minLength`, `pattern`, `patternName` | Generic text validation in `attributes.ts`; no attribute name is inspected. | Declared on `icon`, `tone`, `category`, `token` schemas (§3.3) |

Consequences, normative:

- The legend-parenting rule (r1 §5.4(a)) and the tone-membership rule (r1 §5.4(b)) exist **only** because `PROFILE_ID` declares `children-restricted` and `category-membership`. The diagnostic codes `legend-key-parent-invalid` and `tone-category-unknown` are raised by the generic mechanisms when those constraints are violated, for whatever types the constraint names; their frozen contracts are in Appendix C. An executor build that contains the string `"legend"` outside profile data, test fixtures and diagnostic messages fails the §5.4 synthetic-profile gate.
- The hierarchy relation name is likewise data: cycle, parent-family and child-restriction checks read `relationType`/`hierarchyId` from the constraint and the relation declaration, never from a literal `"contains"`. Scoped uniqueness (§5.3) resolves its `siblings` and `withinType` scopes through the hierarchy named by the profile's `hierarchy` constraint, not through an assumed relation.
- **Synthetic-profile proof (required).** §5.4 defines a synthetic profile with different identifiers throughout — hierarchy relation `nesting`, legend-equivalent types `palette` / `swatch`, value attribute `hue`, category attribute `code`, binding attribute `paletteRef` — and asserts: the same generic mechanisms enforce parenting, membership, scoping and key shape under those names; a profile that deliberately omits `children-restricted` and `category-membership` validates a `swatch` parented by a plain container and an undeclared `hue` with no legend present. Both directions are gates, not illustrations.

## 4. View model: folds, folded projections, measurement and layout hints

The view remains the M2 `ViewDocument`: occurrences of entities, relations and ports, visual groups, filters and persistable presentation state, pointing at exactly one `SemanticDocument` and never ahead of its revision. This section adds the fold contract, the folded-edge projection that stays valid, the measurement input that layout consumes, and the generic layout hints that replace consumer packing. Transient state (hover, in-flight drag, marquee) stays out of the view, as today.

### 4.1 Fold state is view data, bound to occurrences (finding 2 / B2)

#### 4.1.1 Binding rule

- The fold state of a container drawing in a view is the `collapsed` flag of exactly one `VisualGroup` of that view, bound to an **entity occurrence**, not to an entity. `VisualGroup` gains one optional field (view-shape inventory, §3.9):
  ```ts
  interface VisualGroup {
    readonly id: string;
    readonly label?: string;
    readonly collapsed?: boolean;
    /** The entity occurrence this group folds. Present on every fold group in a PROFILE_ID view. */
    readonly occurrence?: OccurrenceRef;
  }
  ```
  For each entity occurrence in the view whose effective type (shared resolver, §5.1) is in the container family (`container: true` on its base chain), the view MAY hold one group whose `occurrence` equals that occurrence's id and whose `collapsed` is the fold state of **that drawing** in that view. The group id is `grp.<len>.<localId>` where `<localId>` is the local id of the **occurrence** (not the entity) and `<len>` is its length — the id form already used by the measured HRPN view, re-anchored from entity to occurrence. Group membership follows the existing derived rule: an entity occurrence belongs to the group named by its `EntityOccurrence.group`, and that group is the fold group of its hierarchy parent's occurrence in the same view. Membership itself is never duplicated as a member list.
- **N occurrences (M2 §3.4, B2).** The same container entity MAY have several occurrences in one view; each occurrence has its own fold group and may fold independently. The r1 rule (“one fold per container; a second occurrence reuses the same group”) is withdrawn. Two views of one document fold independently, as before. A container occurrence with no fold group is expanded. A fold group whose `occurrence` names no entity occurrence of the view, or an occurrence whose effective type is outside the container family, reports `dangling-reference` / `occurrence-endpoint-mismatch` under the view validation of §5.6 (the group is view data and is validated as such).
- Folding or unfolding is a view change. It is expressed by replacing the `ViewDocument` (§4.1.3), or by the host re-running layout with a new collapse input (§4.4) and replacing the view wholesale. It never mutates the `SemanticDocument`, never bumps `document.revision`, and never travels through an `update-entity-attributes` command. The semantic `container.collapsed` attribute of `generic@1` is not a fold carrier (§3.2.2).
- The rendering consequence is fixed: expanded, a container occurrence draws its header plus its visible children; collapsed, the same occurrence draws exactly one atomic card (`460 × 200`, §4.4) carrying the container's `kicker`, `name`, `subtitle` (as centred summary lines), `footer`, `icon` and `tone`, plus the fold control. No child occurrence of a collapsed container occurrence is a scene item (§4.3, step 1).

#### 4.1.2 Why occurrence binding is required

With entity binding, two drawings of one container cannot fold differently, and the projection of §4.3 cannot say **which** drawing an edge was retargeted from when the same entity is drawn twice. Occurrence binding removes both gaps without new machinery: the fold group, the hidden-by-fold test and the representative are all computed per occurrence, and §4.3.2 preserves the original endpoint occurrence so unfolding restores the exact drawing.

#### 4.1.3 Revision meaning: fold-only changes keep the semantic revision (finding 10 / B1)

`decision` — `ViewDocument.revision` keeps its current meaning exactly: **the document revision this view was last changed at; never ahead of the document** (`packages/diagram-core/src/view.ts`, refused as `revision-divergence` when ahead). A fold-only change therefore **retains** that value:

- Folding, unfolding, expand-all, collapse-all, changing a view `strokeStyle` override, editing a `summaryLabels` entry and re-projecting (§4.3) all produce a replacement view whose `revision` equals the source view's `revision` (which equals the document revision the view was built against). No fold operation increments `ViewDocument.revision`, and no fold operation requires a semantic command. The HRPN witness is normative: the supplied view at revision 1 folded in any way stays at revision 1 and validates; a fold that produced revision 2 against a document at revision 1 would refuse `revision-divergence` and is a defect.
- View concurrency is **not** carried by `revision`. A host that needs optimistic concurrency over views uses a separate host revision: the canonical content hash of the view (the executor's canonical serialisation, §6.3 artifact digest discipline) or a host-minted view generation counter stored outside the `ViewDocument`. This specification gives that value no field name inside the view, because two hosts mint it differently and neither meaning is the document revision. Tests assert the observable contract: repeated fold/unfold at document revision 0 (and at revision 1 on the HRPN view) validates at every step with `view.revision === document.revision` throughout, and the semantic document bytes are unchanged by every fold (§5.6, §5.7).
- A semantic change (any command that bumps `document.revision`) does not automatically rebase existing views: a view whose `revision` is behind the document revision is stale in the M2 sense and is rebuilt or re-projected by its host; `validateView` continues to refuse only the ahead case, as today.

### 4.2 Default folds

- Default folds are **input data**, not component defaults and not semantic data. A host supplies `defaultFolds: readonly OccurrenceRef[]` (container **occurrences** folded in the initial view; a host building a fresh view from a document MAY instead supply entity refs, which the view builder resolves to the occurrences it creates, recording the resolved occurrence ids in the produced view) when it first builds or lays out a view. The layout or view builder stamps exactly those occurrences' fold groups `collapsed: true` in the produced `ViewDocument`; every other container group is `collapsed: false` or absent-means-expanded by the rule that an undeclared group is expanded.
- A stored `ViewDocument` therefore fully determines the displayed folds without consulting any default list. Reopening a stored view never re-applies defaults. Changing defaults after a view exists has no effect until a new view is produced.
- Expand-all and collapse-all are host operations over the same data: they produce a new view in which every container fold group is expanded, respectively every container fold group whose occurrence has at least one child occurrence is collapsed. They mint no semantic change and are bounded by the interaction budget of §8.

### 4.3 Folded-edge projection that yields a valid `ViewDocument` (finding 2; closes blocking 1)

This section defines the only folded projection. A folded output that does not follow it is not a valid view, and the M1 gates assert `validateView(foldedView, document)` returns zero diagnostics on every folded acceptance scene. Two r1 defects are closed by construction: the representative is the **outermost visible** collapsed ancestor (never an invisible inner one), and the projection is **recomputed from recoverable original endpoints on every transition** (never mutated in place, so unfolding reverses it).

#### 4.3.1 Definitions (per occurrence)

For a given view, let `containsParentEntity(entity)` be the semantic hierarchy parent (at most one, §3.4), and let `parentOccurrence(occurrence)` be the entity occurrence of that parent entity that contains this occurrence in this view (resolved through `EntityOccurrence.group` → fold group → `VisualGroup.occurrence`; when a child has several parent drawings, the one whose fold group the child occurrence names). All definitions below are per occurrence, so N occurrences of one entity project independently.

- An entity occurrence is **hidden by fold** when any hierarchy ancestor **occurrence** of it (walking `parentOccurrence` upward) is folded (its fold group `collapsed: true`). A collapsed container occurrence's own drawing stays visible as a card; its child occurrences, at any depth, are hidden by fold. This matches the existing `group-collapsed` cascade: hidden occurrences are reported, never silently dropped.
- The **visible representative** of an entity occurrence `O` in a view is defined by walking the ancestor-occurrence chain upward from `O`:
  1. Collect every ancestor occurrence (including `O` itself when `O` is a container occurrence, for the question “where do edges to `O`'s children land”) whose fold group is collapsed, in order from innermost to outermost.
  2. If the collection is empty, the representative is `O` itself.
  3. Otherwise the representative is the **outermost** element of the collection — the collapsed ancestor closest to the root. By construction no ancestor above it is collapsed, so it is visible; every inner collapsed ancestor is hidden beneath it and is never selected. (The governance `collapseGovernanceScene` behaviour is the measured precedent: the representative is the collapsed ancestor that stays visible through the whole chain.)
  For a port occurrence, the representative is the visible representative of the port's owner occurrence, drawn through the representative's port occurrence bound to that representative when one exists in the view, otherwise through the representative occurrence itself (§4.3.2, port rule).
- A relation occurrence is **internal** to a collapsed container occurrence when both endpoints' visible representatives are that same occurrence. Internal relations draw nothing in the folded view. A relation with exactly one endpoint hidden is **projected**; a relation with no endpoint hidden is **untouched**.

#### 4.3.2 The projected occurrence (view data) — persisted-shape inventory

The persisted view gains the following optional fields, and no others (finding 17 inventory; `VIEW_DOCUMENT_FIELDS` itself is unchanged because every addition is on a record inside the view, not on the view record — a test asserts the view field set still refuses a stray `hover`-style key):

1. On `RelationOccurrenceEndpoint`: `semanticTarget?: EntityRef | PortRef`. Present **iff** the drawn `occurrence` does not itself draw the semantic endpoint target for that role. Its value is the semantic relation's endpoint target for that role, copied verbatim. Absent means “the drawn occurrence draws the semantic target”, exactly as today.
2. On `RelationOccurrenceEndpoint`: `sourceOccurrence?: OccurrenceRef`. Present **iff** `semanticTarget` is present. Its value is the **original endpoint occurrence** — the occurrence that drew the semantic target in the unprojected (source) view. This is the endpoint-occurrence provenance B2 requires: the projection never loses which drawing it came from, including when the same entity has several occurrences (the original is identified by occurrence id, not by entity id). On an unprojected endpoint both fields are absent.
3. On `RelationOccurrence`: `strokeStyle?: "solid" | "dashed"` — the view override of §3.5.1. Absent means inherit the semantic value.
4. On `RelationOccurrence`: no aggregation field. Aggregation is derived, never stored (§4.3.4).
5. On `ViewDocument`: `summaryLabels?: Readonly<Record<string, AggregateSummary>>` — authored aggregate labels for collapsed overviews (§4.5). Absent means no authored labels; derived count labels are computed at render time and never stored.

```ts
interface RelationOccurrenceEndpoint {
  readonly role: string;
  readonly occurrence: OccurrenceRef;
  readonly semanticTarget?: EntityRef | PortRef;
  readonly sourceOccurrence?: OccurrenceRef;
}
interface RelationOccurrence {
  readonly id: OccurrenceRef;
  readonly relation: RelationRef;
  readonly endpoints: readonly RelationOccurrenceEndpoint[];
  readonly waypoints?: readonly Point[];
  readonly strokeStyle?: "solid" | "dashed";
}
```

**Pinned source view.** A folded view is always derived from a stated source view by the pure projection of §4.3.3. A host that folds interactively either (a) keeps the source (unfolded) view pinned and re-derives the displayed view on every fold change, or (b) stores only folded views, in which case each folded view is still self-sufficient for restoration because every projected endpoint carries its `sourceOccurrence` and `semanticTarget`. Option (b) without provenance is not a valid folded view: provenance is what makes the original endpoints recoverable from the folded view alone.

#### 4.3.3 Projection procedure: recomputed from original endpoints on every transition

Projection is a **pure function**; it is never an in-place mutation of a stored view, and it is re-run from original endpoints on every fold transition:

```
projectView(document, sourceView, collapsedOccurrenceIds) -> ViewDocument
```

- **Inputs.** `document`: the `SemanticDocument` (unchanged). `sourceView`: a view of that document in which **no endpoint is projected for fold reasons** — every relation endpoint either draws its semantic target or is an authored drawing with no `semanticTarget`. In practice the source view is the unfolded view (or the least-folded view the host pinned). Callers MUST NOT pass an already-projected view as `sourceView`; the function refuses (diagnostic `occurrence-endpoint-mismatch`, detail `projection-source-projected`) if any input endpoint already carries `semanticTarget`. This is the rule that makes unfolding exact: a fold change is always `projectView(document, sourceView, newCollapsedSet)`, never “patch the previous projection”.
- **Step 1 — hidden set.** Compute hidden-by-fold occurrences (§4.3.1) from `collapsedOccurrenceIds` (the set of container occurrences whose fold groups are collapsed in the output). Hidden entity occurrences stay in the output `ViewDocument` records (their geometry is the source geometry, retained so unfolding restores it byte-for-byte) and are excluded from the scene as `group-collapsed`, as today. Do not delete occurrences to fold.
- **Step 2 — per relation occurrence.** Let the semantic relation's endpoints be known from `document`. For each relation occurrence in `sourceView`:
  - Compute each endpoint's visible representative (§4.3.1) from the endpoint's **original** drawn occurrence (`endpoint.occurrence` in the source view).
  - If both representatives are the same occurrence, the relation is internal: copy the occurrence record unchanged (original endpoints, no provenance fields) and let the scene exclude it as `endpoint-hidden` with its cause reported. It draws nothing.
  - Else, for each endpoint whose original occurrence is hidden by fold: set the output endpoint's `occurrence` to the representative occurrence (for a port endpoint, the representative's port occurrence when one exists in the view, otherwise the representative's entity occurrence), set `semanticTarget` to the semantic endpoint target for that role, and set `sourceOccurrence` to the original `endpoint.occurrence`. Endpoints that are not hidden are copied unchanged and carry neither provenance field.
  - Copy `waypoints` and the effective `strokeStyle` (view override if present in the source, else the semantic value resolved at projection time and stored on the output occurrence so the folded drawing does not re-read semantics to know its style; unfolding re-derives from the source, so the stored copy cannot drift).
- **Step 3 — groups, filters, summaries.** Stamp fold groups for exactly `collapsedOccurrenceIds`; copy every filter unchanged (filters and folds combine, §4.3.6); carry `summaryLabels` (§4.5) by copying entries whose representative pair still exists in the output and dropping — in the output copy only — entries whose pair no longer arises. Leave every other occurrence, group and presentation value unchanged. The output keeps the source view's `viewId` only when the host replaces that view; a folded derivative that coexists with its source uses a new `viewId`. The output `revision` equals the source `revision` (§4.1.3).
- **Restoration property (normative).** For any collapsed sets `A` and `B`, `projectView(document, sourceView, A)` followed by discarding the result and computing `projectView(document, sourceView, B)` is the only transition. In particular, `projectView(document, sourceView, ∅)` returns a view whose relation occurrences are byte-identical to the source view's (canonical serialisation), and repeated fold/unfold cycles `A → ∅ → A → ∅` produce identical bytes at each repetition. No `semanticTarget` or representative endpoint survives into a view whose collapsed set does not hide that endpoint, because the projection is recomputed, not patched. The r1 defect — expanding a previously projected view leaving `semanticTarget` and the ancestor endpoint intact, then failing `projection-not-folded` — cannot occur under this procedure, and §5.6 fixtures assert the cycle explicitly.

#### 4.3.4 Validation of a projected endpoint

`validateView` accepts a projected endpoint **iff** all of the following hold; otherwise it reports the stated diagnostic. The unprojected rule is unchanged: without `semanticTarget`, the drawn occurrence must draw exactly a semantic endpoint target for its role, else `occurrence-endpoint-mismatch`.

- `semanticTarget` equals one of the semantic relation's endpoint targets for the endpoint's role (the same set the current check uses). Otherwise `occurrence-endpoint-mismatch`.
- `sourceOccurrence` is present, names an occurrence of this view, and that occurrence draws `semanticTarget` (its entity/port equals `semanticTarget`). Otherwise `occurrence-endpoint-mismatch` with detail `provenance-missing` (absent) or `provenance-mismatch` (names a different target).
- The drawn (`occurrence`) occurrence exists in the view and is not itself hidden by fold. Otherwise `dangling-reference` (missing) or `occurrence-endpoint-mismatch` with detail `representative-hidden`. Under §4.3.1 the representative is visible by construction, so `representative-hidden` witnesses a hand-written or stale projection, never a correct one.
- Walking hierarchy parent **occurrences** from `sourceOccurrence` up to the drawn occurrence passes only through occurrences hidden by fold (every intermediate ancestor occurrence is folded or is a child of a folded occurrence), the drawn occurrence is folded (collapsed) itself, and it is the outermost folded occurrence on that walk. If the walk never reaches the drawn occurrence, reaches it without any folded occurrence, or stops at an inner folded occurrence while an outer one is also folded, the projection is spurious: `occurrence-endpoint-mismatch` with detail `projection-not-folded` (no fold on the walk) or `projection-not-outermost` (an inner representative was chosen). The r1 nested defect — `TOPIC` selecting nearest collapsed ancestor `MSGZ` itself hidden beneath collapsed `PPROZ`, `PRODZ` and `GCP`, then rejected as `representative-hidden` — is refused at authoring time by the `projection-not-outermost` arm and never produced by §4.3.3.
- The drawn entity is in the container family when `semanticTarget` differs from the drawn target (a projection target is always a container card, never a leaf card that happens to be an ancestor by geometry). Otherwise `occurrence-endpoint-mismatch` with detail `representative-not-container`.

These checks make the folded view self-describing: a validator needs only the document, the view and the hierarchy tree — no layout output, no scene and no fold list. Appendix B works the review example end to end, including the nested form.

#### 4.3.5 Aggregation is derived, never stored — with authored labels as view data

When several semantic relations project onto the same ordered pair of visible representatives, each keeps its own `RelationOccurrence` with its own business id (§3.5). A renderer MAY group projected occurrences that share the same (source representative occurrence, target representative occurrence) pair into one drawn stroke; that grouping is computed from the view at render time, is recomputed on every fold change, and is never persisted as a relation, an occurrence or an extension. The constituent relation ids of a drawn aggregate are exactly the relation ids of the grouped occurrences — grouping never mints, merges or drops a business id.

What a renderer draws as the aggregate's label is governed by §4.5: an authored `summaryLabels` entry for that representative pair wins; otherwise the renderer MAY draw a count label whose text is host-localised (§3.8). The count is derived; the authored label is stored view data. Both preserve the constituent ids, and export (§8 roadmap) serialises the authored label with its constituent ids so a folded overview round-trips.

#### 4.3.6 Filters combined with folds; ports

- Filters and folds are independent exclusions with distinct reasons. A filter that hides an endpoint excludes its relation occurrence as `endpoint-hidden` (filter cause), independently of fold exclusions; the two reasons stay distinct so a host can tell a fold from a filter. Projection runs **after** filter evaluation is known to the host only in this sense: §4.3.3 projects on fold visibility; a relation occurrence already excluded by a filter is still projected by the same rules (its endpoints' representatives are computed identically), so removing the filter later never requires re-projection logic — the scene simply stops excluding it. §5.6 fixtures assert simultaneous filter+fold states: an endpoint hidden by both produces one exclusion with the fold reason taking precedence in the record and the filter cause retained in the exclusion's `cause` field, and clearing either one alone restores the correct drawing without touching the other.
- Ports: a port endpoint hidden by fold projects to the representative's port occurrence when the representative occurrence has a port occurrence for the same semantic port's counterpart (same `PortRef` drawn on the representative is impossible — ports belong to their owner — so the rule is: the port occurrence whose `ownerOccurrence` is the representative occurrence and whose `port` is a port of the representative entity with the same direction, when exactly one exists; otherwise the representative's entity occurrence). The chosen drawing is recorded identically (`occurrence` = chosen occurrence, `semanticTarget` = original port ref, `sourceOccurrence` = original port occurrence), so port folds validate by §4.3.4 with the port arm of the walk. A port with no counterpart on the representative still projects (to the entity occurrence) and still restores, because provenance names the original port occurrence.

#### 4.3.7 Scene consequence

The scene builder keeps its conservation rule. In a folded view: hidden occurrences are exclusions (`group-collapsed`), internal relation occurrences are exclusions (`endpoint-hidden`), projected relation occurrences are edge items whose path runs representative-anchor to representative-anchor (persisted waypoints of the source occurrence, when still inside the visible region, are retained as route hints on the retained record and ignored for the projected segment outside it — the router owns the final route). No occurrence is silently dropped and no edge disappears without a reported exclusion.

### 4.4 Fixed footprints and the measurement API (finding 3; closes blocking 2)

This section replaces the r1 prose (“layout receives measured headers”) with exact types and a call sequence. The executor surface is §5.6; the component rendering contract that consumes the same line-layout result is owned by `SPEC_EVOL_DS_DIAGRAM_CARDS.md` and is referenced, not restated, except where the shared result is defined.

#### 4.4.1 Footprints: state-dependent, with a fixed-axis policy

Layout consumes a footprint per entity occurrence. A footprint is resolved from the pinned profile declaration plus view state (fold), never from a component constant. The profile declaration carries (§5.5):

```ts
interface FootprintDecl {
  readonly width: number;   // card pixels at zoom 1
  readonly height: number;
  readonly fixedAxes: "both" | "height" | "none";
}
```

| Entity occurrence (in view state) | Footprint | `fixedAxes` | Source |
| --- | --- | --- | --- |
| `node` occurrence (any view) | fixed `460 × 200` | `both` | `frozen-requirement` |
| Container-family occurrence, **collapsed** in this view | fixed `460 × 200` | `both` | `frozen-requirement` (collapsed wrapping card takes the atomic-card size at every nesting level) |
| Container-family occurrence, **expanded** | computed: header height (§4.4.3) + children extent + frozen insets (rule gaps 4, content insets 16) | `none` (both axes are outputs) | `frozen-requirement` spacing values |
| `legend` occurrence, collapsed | fixed `460 × 200` (it is a container-family fold) | `both` | §4.1 |
| `legend` occurrence, expanded | computed like a container, over legend-key lines | `none` | this section |
| `legend-key` occurrence | width **follows the legend's inner width** (legend width minus its content insets); height fixed `64` | `height` (width is an input from the parent, height is fixed) | measured compact legend line of the validated HRPN scenes; a layout input, not a card token |

The r1 declaration `legend-key.fixed: true` with a variable width was contradictory and is withdrawn: `fixed` is not a boolean on the type, it is `fixedAxes` on the footprint in a state. A collapsed container's footprint comes from the **view state** (fold), not from a second type declaration: the profile declares one footprint per type for its atomic form, and §4.4.1 maps (type, folded?) to the consumed footprint. The token change rule is unchanged: a token change that alters a fixed footprint recomputes placement, docks and routes in the same layout call; an appearance-only change inside an unchanged box never moves a dock.

#### 4.4.2 Measurement types (exact)

Text measurement is injected, as today, because the engine holds no font metric and no DOM. The `(text, role) => TextSize` measurer is replaced by a request/result pair that carries the entity, the wrapping width and the toggle allocation, and returns the **shared line-layout result** that layout and rendering both consume:

```ts
type TextRole = "kicker" | "title" | "body" | "detail" | "footer"
              | "subtitle" | "legend-label" | "edge-label";

interface MeasureRequest {
  readonly text: string;
  readonly role: TextRole;
  /** Available wrapping width in card pixels for this slot in this entity state. */
  readonly availableWidth: number;
  /** Line-height and font metrics are the measurer's host data; the request names the role only. */
}

interface LineLayout {
  readonly lines: readonly string[];  // wrapped lines, in order; text is never altered
  readonly width: number;             // widest line, card pixels
  readonly height: number;            // lines.length × line-height(role)
  readonly overflow: boolean;         // true iff lines.length exceeds the slot allocation (§4.4.4)
}

type LineMeasurer = (request: MeasureRequest) => LineLayout;

interface EntityMeasurementInput {
  readonly entity: EntityRef;
  readonly occurrence: OccurrenceRef;
  readonly effectiveType: string;       // resolved by §5.1
  readonly folded: boolean;
  readonly toggle: boolean;             // true iff a fold control is rendered for this occurrence
  readonly slots: Readonly<Partial<Record<TextRole, string>>>; // every §3.2 slot value present on the entity
  readonly availableWidth: number;      // card inner width for this state (460 minus insets and, when toggle, the toggle allocation)
}

interface HeaderMeasurement {
  readonly occurrence: OccurrenceRef;
  readonly kicker?: LineLayout;
  readonly title: LineLayout;
  readonly subtitle?: LineLayout;       // containers and legends, expanded and collapsed forms measured separately
  readonly height: number;              // header band height consumed by placement
  readonly overflow: boolean;           // any slot overflowed its allocation
}
```

- The measurer is called per **slot**, with its `availableWidth`. Roles are: `kicker`, `title`, `body`, `detail`, `footer`, `subtitle`, `legend-label`, `edge-label`. The same `LineLayout` (`lines`, `width`, `height`) MUST be usable to render the text: layout reserves `height` and the renderer draws `lines`. A second, divergent wrapping at render time is a contract violation.
- Per entity, layout reads **all** §3.2 slots (not only `name`): kicker, title, body, detail, footer for cards; kicker, title, subtitle, footer for containers and legends; label for legend keys and relation labels for edges. A measurer that receives only the title is a contract violation caught by the M1 layout tests.
- **Toggle allocation.** When `toggle` is true, the header's `availableWidth` for `title` (and `kicker`) is reduced by the toggle allocation (the fold control's reserved slot) **before** measuring, and the same reduced width is what the renderer wraps against. The header allocation with the control reserved therefore differs from the allocation without it by construction, and measurement and rendering use the same allocation for the same occurrence in the same view. There is no post-hoc `FOLD_TITLE` cap, no `padding-right` override and no parenthesis relocation (the kit devices DH-07 are replaced by this input).
- **Legend-key width.** A legend key is measured with `availableWidth` equal to the legend's inner width minus the swatch allocation, and placed at that width with height `64` (§4.4.1). Its `LineLayout` height is asserted ≤ 64 by the overflow rule; a longer label overflows the key line, never widens the legend by itself (the legend width is computed from its header and its longest key at the measured width — the key width follows the legend, the legend does not follow one key's unwrapped width).

#### 4.4.3 Call sequence (normative order)

One `layoutDocument` call performs, in order:

1. **Resolve.** Read the document through the shared resolver (§5.1); classify each occurrence (card / container-expanded / container-collapsed / legend / legend-key) from (effective type, fold set). Refuse unsupported profiles/types by name, as today.
2. **Measure headers.** For every card and every container/legend occurrence, build its `EntityMeasurementInput` (folded form and expanded form are different inputs; a collapsed container is measured as a card with `folded: true`) and measure kicker/title/subtitle through `LineMeasurer`, producing a `HeaderMeasurement` per occurrence. Header measurements are computed **before** any child placement.
3. **Place children bottom-up.** Expanded containers place their visible children using the children's footprints (fixed children at their fixed boxes; nested expanded containers recursively), then compute their own box as header height + children extent + insets. Collapsed occurrences place no children. The supplied header measurements **affect child placement observably**: a taller measured subtitle header pushes the first child row down by exactly the header-height delta (asserted in §5.6 tests by two measurers differing only in subtitle line count).
4. **Measure bodies and labels.** Measure card body/detail/footer lines at the card inner width, legend-key labels at the legend inner width, and edge labels at their label allocation, all through the same `LineMeasurer`. Body measurement never changes a fixed box (§4.4.4).
5. **Dock and route.** Assign docks against fixed boxes under §4.4.5; route projected and untouched edges between representative anchors.
6. **Emit.** Produce the `ViewDocument` (occurrences with geometry, fold groups, projected endpoints per §4.3, `summaryLabels` carried through) plus `LayoutResult { fit, warnings, measurements }` where `measurements` is the per-occurrence `HeaderMeasurement` list the renderer consumes. Layout and rendering therefore share one line-layout result per slot; a renderer that re-wraps with a different width fails the §5.6 sharing test.

#### 4.4.4 Overflow result

Overflow is a measurement outcome, never a size change: when measured text needs more lines than its frozen allocation holds, layout still places the fixed box, keeps every character, and reports the overflow with needed versus allocated size. The result type is:

```ts
interface MeasurementOverflow {
  readonly occurrence: OccurrenceRef;
  readonly slot: TextRole;
  readonly neededHeight: number;
  readonly allocatedHeight: number;
  readonly lines: number;          // measured line count
  readonly allocatedLines: number; // frozen allocation for the slot
}
```

Overflows surface as layout warnings (`card-overflow` for a card slot, `zone-overflow` for a container/legend header or collapsed-subtitle slot — the component diagnostic names of `SPEC_EVOL_DS_DIAGRAM_CARDS.md`, carried here as warning codes) and fail the geometry gate of the milestone that owns the scene. The wording is shortened by the author; no slot is ever truncated, clipped or ellipsised by layout or rendering.

#### 4.4.5 Fixed-size policy and docking overflow

- A fixed footprint (`fixedAxes: "both"`, or the fixed axis of a `height`-fixed footprint) is never enlarged, for docking or for any other reason. The current placement behaviour that grows a node to fit its dock slots is removed for fixed types (§5.6).
- When the docks required on one side of a fixed box exceed what the side holds at the declared slot spacing, the outcome is: keep the box, place the docks that fit in declared order, route the remainder from the box edge at the nearest free anchor, and report one `docking-overflow` layout warning per affected occurrence (side, required slots, fitted slots). No silent drop: every relation keeps an occurrence and a route (scene conservation, §4.3.7).
- Expanded containers are computed boxes and may grow for their children and headers; they never shrink a fixed child to fit.

#### 4.4.6 What “observing role calls” does not prove

A test that records that the measurer was invoked with each role, without asserting that the returned `LineLayout` changed placement, does not close blocking 2. §5.6 therefore requires: (a) two measurers differing only in measured subtitle height produce different first-child `y` by exactly that delta; (b) the `lines` returned at layout are the `lines` the renderer draws (same array content asserted through the scene figure fixture); (c) a toggle-bearing header wraps its title at the reduced width in both layout and rendering. Role-call observation MAY be asserted additionally; it is never sufficient alone.

### 4.5 Authored aggregate labels for collapsed overviews: `summaryLabels` (finding 1)

The #711 all-collapsed overview draws **authored** summary labels on its aggregate edges (the kit's `summaryLabels`), not only counts. A count-only rule loses that content while counts and semantic validity still pass, so the authored input is model data (view data, because it labels a folded drawing):

```ts
interface AggregateSummary {
  /** Stable id of this summary entry, unique within the view. */
  readonly id: string;
  readonly sourceOccurrence: OccurrenceRef; // visible representative occurrence
  readonly targetOccurrence: OccurrenceRef; // visible representative occurrence
  readonly label: string;                    // authored text, document language (§3.8)
  /** Constituent semantic relations grouped under this label, sorted, non-empty. */
  readonly relationIds: readonly RelationRef[];
  readonly strokeStyle?: "solid" | "dashed"; // aggregate stroke; absent means solid
}
```

- Storage: `ViewDocument.summaryLabels?: Readonly<Record<string, AggregateSummary>>`, keyed by `AggregateSummary.id`. An entry is **authored input**: a host or producer writes it; the projection (§4.3.3 step 3) never invents one and never rewrites a label. It only carries entries whose (source, target) representative pair still arises in the output, and drops — in the output copy — entries whose pair no longer arises (the source view retains them, so refolding restores them).
- Precedence: for a representative pair with a `summaryLabels` entry, the renderer draws `label` (and the entry's `strokeStyle` when present). For a pair without an entry, the renderer MAY draw the derived count label (§4.3.5). An authored label never hides its constituents: the entry's `relationIds` SHALL equal the set of relation ids whose occurrences project onto that pair in that view, and `validateView` (§5.6) refuses an entry whose `relationIds` is empty, names an unknown relation, or omits a relation that projects onto the pair (resp. names one that does not), with `occurrence-endpoint-mismatch` detail `summary-constituents-mismatch`. Keeping constituent ids is therefore validated, not conventional.
- Round trip: folded export and re-import (§8 roadmap) serialise each drawn aggregate as its authored label plus `relationIds` plus effective `strokeStyle`; re-import reconstructs the same `summaryLabels` entries and the same per-relation `strokeStyle` values (§3.5.1). A round trip that returns counts in place of authored labels, or loses a constituent id, fails.
- Corpus assertion: each acceptance instance's all-collapsed overview view SHALL carry the authored labels of its source overview (for A1, the `4138a0ec` overview labels; for A2–A5 folded overviews, the labels authored in their source figures where they exist), each with its constituent ids asserted. An overview that renders only “N links” where the source authored a label fails the instance.

### 4.6 Generic layout hints replacing consumer packing (finding 14)

`FOLDED-CARD-HACKS.md` and the HRPN adapter require column stretch and zone spacing to become layout options, and the adapter carries authored row/column trees. M4's switch-over (roadmap, §8) deletes the local packing code, so the replacement surface is defined here as **generic layout input** — no consumer tree, zone id or scene flag enters the engine:

```ts
interface LayoutHints {
  /** Authored ordering of siblings where the host has an order to express. */
  readonly ordering?: Readonly<Record<EntityRef, readonly EntityRef[]>>; // parent -> ordered child ids
  /** Grouping of roots or children into rows/columns, as data. Absent means engine grouping. */
  readonly grouping?: {
    readonly direction?: "rows" | "columns";
    readonly groups?: readonly { readonly id: string; readonly members: readonly EntityRef[] }[];
  };
  /** Stretch expanded containers (and their rows) to the group width. Never stretches a fixed card. */
  readonly stretch?: boolean;
  /** Gap between sibling cards (across-flow neighbour gap). */
  readonly cardGap?: number;
  /** Gap between sibling containers/zones, distinct from cardGap. */
  readonly zoneGap?: number;
  /** Gap between ranks (along-flow). */
  readonly rankGap?: number;
}
```

- `LayoutOptions` gains `hints?: LayoutHints` (§5.6 file inventory). Defaults reproduce the current engine metrics (`rankGap` from `LayoutMetrics.rankGap`, `cardGap` from `nodeGap`, `zoneGap` defaulting to `cardGap` when unset), so an absent hint changes nothing.
- **Semantics.** `ordering` constrains sibling order where listed (unlisted siblings sort by reference after listed ones, deterministically); `grouping` constrains which siblings share a row/column band; `stretch` widens **computed** boxes (expanded containers) and their row bands to the group width and never alters a fixed `460 × 200` card or a fixed axis; `cardGap` spaces card neighbours, `zoneGap` spaces container neighbours, and the two are independent inputs (setting one never moves the other). Existing `rankGap`/`nodeGap` metrics remain the engine tuning; the hints are the per-call authored surface on top of them. Frozen card footprints are preserved under every hint combination (asserted in §5.6).
- **Corpus witnesses.** The HRPN packing behaviours map as data, not code: column stretch → `stretch: true`; zone spacing (`zoneGapY: 96` in the adapter) → `zoneGap: 96` with `cardGap` at its scene value; authored row/column trees → `grouping` + `ordering` entries per scene. Each acceptance instance records the hints it was laid out with in its corpus manifest (§7); a layout that needs a consumer-side tree or a scene flag to reproduce the instance fails.

### 4.7 Filters, presentation and legend placement

View filters and presentation state are otherwise unchanged. The legend entity, when present, is placed by its occurrence geometry like any container; its keys are placed by the footprint of §4.4.1 inside it, ordered by `order` (§3.7.2). A host that prefers legend chrome outside the diagram omits the legend entity from the document and renders its own key list from consumer data — that is a consumer choice, and the generic figure never invents a legend the document does not declare (the model carries the legend, §3.7, or there is none).

## 5. Executor changes (`diagram-core`, plus the layout surface in `diagram-canvas`)

This section is the implementation contract for milestone M1 (model half, including the prerequisite layout/projection surface that M1 gates depend on — see §8 for the corrected order). Each change names its exact files, its behaviour and its RED test: the test is written first and observed failing against the current executor for the stated reason, then passes after the change. No change weakens an existing refusal: every new acceptance is paired with the refusal that bounds it.

Executor ownership follows G2: this repository implements and publishes the generic executor; Engram owns the profile data it executes (§6). Profile-content changes (§5.5) land as data in both places from the same hand-off (§6.3).

### 5.1 One shared, cycle-safe, profile-aware type resolver (finding 11 / B5)

This is the single resolver every other change uses. There is no second chain walk in validation, endpoint checks, migration or layout: a behaviour difference between call sites is a defect in the resolver, fixed once.

- **Files:** `packages/diagram-core/src/validate.ts` [M] (the resolver lives beside `effectiveEntitySchemas` and replaces its body; exported for tests through the existing validation surface), `packages/diagram-core/src/profile.ts` [M] (no shape change; the resolver reads existing declarations plus the `container` flag of §5.2). Canvas consumes it, it does not reimplement it: `packages/diagram-canvas/src/layout/graph.ts` [M] calls the core resolver (§5.6).
- **Contract.** Given `(document, profile, typeId)` the resolver returns one of:
  ```ts
  type ResolvedType =
    | { readonly kind: "profile"; readonly chain: readonly string[];        // [typeId, ...ancestors], profile ids only
        readonly schemas: readonly AttributeSchema[]; readonly container: boolean; readonly abstract: boolean }
    | { readonly kind: "refinement"; readonly chain: readonly string[];    // [definitionId, base..., ...profile ancestors]
        readonly schemas: readonly AttributeSchema[]; readonly container: boolean; readonly abstract: false }
    | { readonly kind: "refused"; readonly diagnostic: Diagnostic };
  ```
  Resolution walks document `TypeDefinition.baseType` links iteratively (explicit stack, no recursion) until a profile type is reached, collecting schemas base-first so a derived schema is `[...baseSchemas, ...definitionSchemas]` at every level. `container` is true iff any profile type on the chain declares `container: true`. `abstract` is true iff the reached profile type is abstract (a refinement of an abstract type stays non-instantiable until a concrete profile type is reached — refinements never concretise an abstract base by themselves).
- **Refusals (all existing codes, no new code).** A base id declared by neither the document nor the profile → `unknown-entity-type` (details `{ type, profile }`, path `typeDefinitions.<id>.baseType` at the link that fails). A cycle in the document definition graph (including a self-refinement) → `type-definition-conflict` with details `{ cycle: "id+id+..." }` (members joined in walk order) on the first definition of the cycle in id order; the walk detects the cycle by visited set and never loops. An attribute redeclared at any level of the chain (same `name` as any base schema, profile or intermediate definition) → `type-definition-conflict` with details `{ attribute }` on the redeclaring definition (this is the inherited-name conflict: a chain `A refines B refines node` where `A` redeclares an attribute `B` added also refuses). A definition whose `profile` field names a different profile than the one being resolved against (cross-profile misuse) → `unknown-entity-type` with details `{ type, profile, declaredProfile }`: a definition is resolved only against its own declared profile, never silently against the caller's profile.
- **What replaces what.** `effectiveEntitySchemas(document, profile, typeId)` keeps its exported name and its return shape (`{ schemas } | { diagnostic }`) and is reimplemented as a projection of the resolver, so existing callers are untouched. Attribute validation, endpoint family checks (§5.2), legend/tone constraint execution (§5.4), migration remapping (§3.9) and canvas classification (§5.6) all read `chain`, `schemas` and `container` from the resolver.
- **RED tests:** `packages/diagram-core/tests/type-resolver.test.ts` [N] —
  1. a refinement of a refinement of `container` resolves to a chain ending in `container` with concatenated schemas and `container: true` — fails today with `unknown-entity-type` (one-level walk);
  2. chained attributes: values for attributes declared at each level validate, and an undeclared attribute still refuses `attribute-not-in-schema`;
  3. a cycle `A→B→A` and a self-cycle `A→A` each refuse `type-definition-conflict` without hanging (test completes under the suite timeout);
  4. a missing base refuses `unknown-entity-type`; an inherited redeclaration (grandchild redeclares a child-added attribute) refuses `type-definition-conflict`;
  5. a definition declaring profile `bpmn@1` resolved against `generic@1` refuses (cross-profile misuse), while the same definition resolved against its own profile succeeds.

### 5.2 Hierarchy parents by type family (closes gap 1)

- **Files:** `packages/diagram-core/src/profile.ts` [M], `packages/diagram-core/src/validate.ts` [M].
- **Profile shape:** `EntityTypeDeclaration` gains `readonly container?: boolean` (`true` means the type is in the container family and may parent through a hierarchy relation whose parent-family constraint (§3.10) names its family root; absent means leaf family). `validateProfile` refuses `container: true` on an abstract type (`type-definition-conflict`, detail `abstract-container`): an abstract container has no occurrence to fold or to draw.
- **Validation behaviour:** everywhere a role declares `entityTypes`, the check becomes family satisfaction through the resolver: the target entity satisfies the constraint when its effective base chain (§5.1) contains any declared type id. This replaces the strict-equality comparison at the current `validate.ts` endpoint check, for the hierarchy parent role and uniformly for every role of every profile (the A′ subsumption rule, §2.1). The diagnostic stays `endpoint-target-not-allowed` with the same path and refs; its `details` gain `seenChain` (the target's chain, joined with `>`) alongside the existing `seenType` / `allowed`, so a refusal explains the family it tested. `details` values remain scalars (Appendix C discipline).
- **What does not change:** role cardinality, target-kind checks (`entity` vs `port`), hierarchy cycle and multiple-parent checks, and the refusal for a leaf-family parent (a `node` refinement used as a hierarchy parent still refuses `endpoint-target-not-allowed`).
- **RED tests:** `packages/diagram-core/tests/hierarchy-family.test.ts` [N]:
  1. a `container` refinement (and a refinement of that refinement) used as a hierarchy parent validates with zero diagnostics — fails today with `endpoint-target-not-allowed` on the HRPN-shaped fixture;
  2. a `node` refinement used as a hierarchy parent still refuses `endpoint-target-not-allowed`;
  3. a non-hierarchy role naming `container` (a synthetic test profile) accepts a refined container target and refuses a refined node target, proving the rule is uniform, not a hierarchy special case.

### 5.3 Scoped uniqueness, legacy adapter, immutable `generic@1` (closes gap 2; findings 6, A2)

- **Files:** `packages/diagram-core/src/profile.ts` [M], `packages/diagram-core/src/validate.ts` [M], `packages/diagram-core/src/diagnostics.ts` [M] (no new code; see below).
- **Profile shape (new declarations):** the `unique-attribute` constraint gains a **mandatory** scope in the new declaration format:
  ```ts
  | { readonly kind: "unique-attribute"; readonly entityType: string; readonly attribute: string;
        readonly scope: "document" | "siblings" | { readonly withinType: string } }
  ```
  `document` = across every entity of the type in the document (the r1 “current behaviour, now explicit” only for new declarations); `siblings` = across entities sharing the same hierarchy parent (top-level entities form one sibling set), resolved through the profile's hierarchy constraint (§3.10), never through an assumed relation id; `{ withinType }` = across entities contained (transitively) under the same ancestor of the named type — the legend scope of §3.7 is `{ withinType: "legend" }` applied to `legend-key.category` and, separately, to `legend-key.order`. A `unique-attribute` declaration without a scope in a **new-format** profile refuses at `validateProfile` (`type-definition-conflict`, detail `unique-scope-missing`): an unscoped uniqueness is exactly the defect being removed, so the new shape makes it unrepresentable.
- **Validation behaviour:** `validateConstraints` groups by the scope key before comparing canonical values. Identity is never a uniqueness constraint: entity, relation, port and occurrence ids stay record keys checked as `duplicate-id` / `record-key-mismatch`, as today. Display titles (`name`, `kicker`, legend `name`) are unique nowhere in `PROFILE_ID`.
- **Order rule (PR #193, kept per scope).** Within each scope group, constrained entities are walked sorted by id in UTF-16 code-unit order; the first id in that order is the reference and is never reported; each subsequent duplicate reports `refs: [reportedId, referenceId]` (the `610c0353` discipline). Reordering record insertion never changes which entity is reported. The whole diagnostics array for a document is compared as an array in the tests, under reordered input.
- **Diagnostic contract.** `unique-attribute-violation` keeps its code, severity `error`, path `entities.<id>.attributes.<attribute>` and refs order. Its `details` gain exactly one new scalar: `scope` with value `"document"`, `"siblings"` or `"within:<typeId>"` (the `{ withinType }` object is flattened to a scalar string, because `Diagnostic.details` holds scalars only — B7). Full frozen contract in Appendix C.
- **RED tests:** `packages/diagram-core/tests/scoped-uniqueness.test.ts` [N]:
  1. two sibling `legend-key` entities with the same `category` under different legends validate; the same pair under one legend refuses `unique-attribute-violation` with `details.scope: "within:legend"`;
  2. two `container` entities both named « CI/CD » validate under `PROFILE_ID` (zero diagnostics);
  3. a new-format test profile declaring `unique-attribute` without `scope` refuses in `validateProfile` (`unique-scope-missing`);
  4. `siblings` scope: two same-named cards under different parents validate, under one parent refuse (synthetic profile), proving the scope key is the parent, not the document;
  5. duplicate `order` values inside one legend refuse; the same values across two legends validate.

#### 5.3.3 Legacy compatibility adapter: `generic@1` bytes never change (finding 6)

`generic@1` declares `{ kind: "unique-attribute", entityType: "container", attribute: "name" }` with **no** `scope` field, and §5.5 requires its declaration bytes to stay untouched (editing them would change its G0 content digest, §6.3, and invalidate existing pins). The two requirements are reconciled by interpretation, not by editing:

- The historical bytes are preserved exactly: `packages/diagram-core/src/profiles/generic.ts` is not modified by M1 (a test asserts its canonical P-CONTENT-DIAGRAM digest, §6.3, is unchanged, and that `validateDocument` results on the `generic@1` fixture corpus are unchanged — same codes, paths, refs and details as at the branch base).
- Interpretation goes through a **versioned compatibility adapter**: `LEGACY_PROFILE_ADAPTER = "legacy-constraints@1"`. When the validator loads a profile whose declaration predates the scoped format (detected structurally: a `unique-attribute` constraint with no `scope` property), it normalises each such constraint in memory to `scope: "document"` — the semantics that profile always had — and records the adaptation in the validation trace (profile id + adapter version), never in stored bytes. New-format profiles never pass through the adapter for this rule: a missing scope there is the `unique-scope-missing` refusal above. The adapter version is part of the executor version; bumping its semantics requires a new adapter version and a fixture update, never a silent change.
- The same discipline applies to any other legacy shape the scoped format supersedes: interpretation is versioned, stored profile bytes are immutable, and a digest is always computed over stored bytes (through the G0 projection, §6.3), never over the adapted in-memory form.

### 5.4 Legend, tone and hierarchy rules as generic constraint execution (finding 7 / B7)

- **Files:** `packages/diagram-core/src/validate.ts` [M], `packages/diagram-core/src/diagnostics.ts` [M], `packages/diagram-core/src/profile.ts` [M] (constraint arms of §3.10).
- **Behaviour.** The executor implements three generic mechanisms, each driven entirely by its constraint declaration (§3.10); no type id, attribute name or relation id is literal in the mechanism:
  (a) `children-restricted`: a hierarchy child whose parent's effective type is in `parentFamilyRoots` must have an effective type in `childTypes`; violations report `legend-key-parent-invalid` (the code name is kept for stability; the mechanism is generic and a synthetic profile violating its own declaration reports the same code with its own identifiers in `details`). A child of any other parent is unconstrained by this mechanism.
  (b) `category-membership`: as defined in §3.7.3/§3.10, including the `legendRef`-equivalent binding attribute named by the declaration (`bindingAttribute`). Violations report `tone-category-unknown`. When the profile declares no `category-membership` constraint, no membership check runs at all (shape only, §3.3). When the constraint exists but the document contains no legend-family entity, every non-neutral value reports `undeclared` (a document that uses tones without declaring its legend is the defect the code names).
  (c) `parent-family` + `hierarchy`: executed as in §5.2/§3.4 through the resolver.
  Icon names are not checked semantically (§3.3). Hierarchy cycle/multiple-parent checks read the hierarchy ids from the `hierarchy` constraint.
- **Frozen diagnostic contracts (B7).** Both new codes are frozen in Appendix C with path template, message template, refs (content and order), scalar `details` keys, multiplicity (one diagnostic per violating entity, resp. per violating child) and severity (`error` for both). `details` values are scalars only: in particular the uniqueness `scope` detail is the flattened scalar of §5.3, never the `{ withinType }` object. Tests compare whole diagnostic arrays (`code`, `severity`, `path`, `message`, `refs`, `details`) under reordered input and assert byte-identical arrays.
- **RED tests:** `packages/diagram-core/tests/profile-constraints.test.ts` [N]:
  1. Under `PROFILE_ID`: a legend with keys explains the tones used by its document (zero diagnostics); an undeclared tone in a legend-bearing document refuses `tone-category-unknown` (`legendBinding: "undeclared"`); a key parented by a plain `container` refuses `legend-key-parent-invalid`; the same tone in a document whose profile omits the membership constraint validates (shape only). Each fails today (`unknown-entity-type` for the legend types, or no mechanism).
  2. **Synthetic profile, different identifiers:** a profile declaring types `palette` (container family) / `swatch`, hierarchy relation `nesting`, value attribute `hue`, category attribute `code`, binding attribute `paletteRef`, with the same three constraints under those names, enforces parenting, membership (including the ambiguous-binding refusal of test 4) and scoping identically. A build whose executor source contains the literal `"legend"`, `"tone"` or `"contains"` outside profile data, fixtures and messages fails this gate (source scan asserted in the test).
  3. **Omitted constraints:** the synthetic profile minus `children-restricted` and `category-membership` validates a `swatch` under a plain container and an undeclared `hue` — proving no rule leaks in by name matching.
  4. **Ambiguous binding (B6):** two legends declaring the same category with different tokens; an unbound entity using that tone refuses `tone-category-unknown` (`legendBinding: "ambiguous"`); the same entity with `legendRef` set to either legend validates; two legends agreeing on the token validate unbound. Whole-array equality asserted under all insertion-order permutations of legends, keys and entities.

### 5.5 The `PROFILE_ID` profile declaration (data)

- **Files:** `packages/diagram-core/src/profiles/generic.ts` [M] (add the completed declaration beside `genericProfile`, which stays untouched byte-for-byte), `packages/diagram-core/src/profiles/completed.ts` [N] (the `PROFILE_ID` declaration lives in its own module so the `generic@1` file is never edited; the module exports whichever id Q1 selects and is the single transcription point of §6.3), `packages/diagram-core/src/profiles/index.ts` [M] (register `PROFILE_ID`; the registry holds the previous profiles plus the completed one; `completeProfiles` lists `generic@1` and the completed profile under instantiation A, or `generic@1` unchanged plus `architecture@1` under B), `packages/diagram-core/src/profile.ts` [M] (the `footprint` and constraint-shape additions).
- **Declaration:** profile id `PROFILE_ID`, `completeness: "complete"`. Entity types `node`, `container`, `legend`, `legend-key` with the §3.2/§3.7 attributes and bounds (including `order` and `legendRef`); `container: true` on `container` and `legend`; footprints: `node { width: 460, height: 200, fixedAxes: "both" }`, `legend-key { width: 460, height: 64, fixedAxes: "height" }` (width is the default before the legend width is known; §4.4.1 governs the consumed width), `container` and `legend` carry the atomic footprint for their collapsed form (`460 × 200, both`) with expanded size computed (§4.4.1 maps state to footprint; the declaration records the atomic form). Port type `port` unchanged. Relation types `link` (label ≤ 200, `strokeStyle` enum), hierarchy relation (tree), `association` (label ≤ 120, `strokeStyle` enum) unchanged otherwise. Constraints: `hierarchy`, `parent-family`, `children-restricted`, `category-membership` (§3.10 table, right column); `acyclic-hierarchy` on the hierarchy; `unique-attribute` on `legend-key.category` scope `{ withinType: "legend" }` and on `legend-key.order` scope `{ withinType: "legend" }`; no `unique-attribute` on `name`; no `max-entities-of-type`. Limits as in §3.6. Notes state that fold is view state and that `generic@1` documents migrate by §3.9.
- **Profile shape additions:** `EntityTypeDeclaration` gains `readonly container?: boolean` (§5.2) and `readonly footprint?: FootprintDecl` (§4.4.1). `validateProfile` refuses a non-positive or non-finite footprint dimension (`limit-exceeded` on the profile path, detail `footprint`) and an unknown `fixedAxes` value (`type-definition-conflict`).
- **RED tests:** `packages/diagram-core/tests/completed-profile.test.ts` [N]: the registry lists `PROFILE_ID`; `validateProfile(completedProfile)` is empty; each §3.2 slot validates at its bound and refuses one character past it (`text-too-long`); an undeclared slot (for example `subtitle` on `node`) still refuses `attribute-not-in-schema`; `generic@1`'s profile digest and validation results are unchanged (§5.3.3). Fails today (`unknown-profile` / missing export).

### 5.6 View validation for folded projections; layout surface; measurement execution

Core view change:

- **Files:** `packages/diagram-core/src/view.ts` [M] (`RelationOccurrenceEndpoint.semanticTarget?` + `sourceOccurrence?`; `RelationOccurrence.strokeStyle?`; `VisualGroup.occurrence?`; `ViewDocument.summaryLabels?`; `VIEW_DOCUMENT_FIELDS` unchanged — a test asserts the view field set still refuses a stray `hover`-style key), `packages/diagram-core/src/validate.ts` [M] (the checks of §4.3.4, the `summaryLabels` constituent check of §4.5, and fold-group binding validation of §4.1.1, reusing `occurrence-endpoint-mismatch` and `dangling-reference`; no new `DiagnosticCode` for folds).
- **RED tests:** `packages/diagram-core/tests/folded-view.test.ts` [N]:
  1. the Appendix B document and folded view validate with zero diagnostics — fails today as `occurrence-endpoint-mismatch`;
  2. the same view with `semanticTarget` removed refuses `occurrence-endpoint-mismatch` (the projection field is load-bearing, not decoration);
  3. a `semanticTarget` naming a target of a different role, a representative that is not a collapsed ancestor, an inner (non-outermost) representative in a nested fold, and a representative in the leaf family each refuse with the §4.3.4 details (`projection-not-folded`, `projection-not-outermost`, `representative-not-container`, `representative-hidden`);
  4. **nested collapse:** outer → inner → card with both containers collapsed (the HRPN `TOPIC`/`MSGZ`/`PPROZ` shape) projects the card's edges to the outer representative and validates; the inner representative is never drawn;
  5. **repeated fold/unfold restores:** `projectView` cycles (collapse set A → ∅ → A → ∅) reproduce identical canonical bytes at each repetition, and the ∅ view's relation occurrences are byte-identical to the source view's (projection recomputed, not patched);
  6. **multiple occurrences (B2):** one container entity drawn twice, folded in one drawing only; edges to children of each drawing project (resp. do not project) independently, and unfolding restores each original endpoint occurrence by id;
  7. **ports:** a link to a port inside a collapsed container projects to the representative (port counterpart where one exists, entity occurrence otherwise) with port provenance, validates, and restores;
  8. **filters combined:** an endpoint hidden by a filter and by a fold at once produces the §4.3.6 exclusion; clearing the filter alone and clearing the fold alone each restore the correct drawing;
  9. **revision (B1):** every fold/unfold in tests 4–8 runs at document revision 0, and again on the HRPN-shaped fixture at revision 1, with `view.revision === document.revision` at every step and unchanged semantic bytes;
  10. an internal relation occurrence in a folded view validates and is excluded by the scene as `endpoint-hidden` (asserted in `diagram-canvas` tests below).

Layout surface (`packages/diagram-canvas`), in the same milestone (M1 includes this surface; §8 orders the gates accordingly):

- **Files:** `packages/diagram-canvas/src/layout/types.ts` [M] (`LineMeasurer`, `MeasureRequest`, `LineLayout`, `EntityMeasurementInput`, `HeaderMeasurement`, `MeasurementOverflow`, `LayoutHints` of §4; `LayoutOptions` gains `collapsed: readonly OccurrenceRef[]`, `hints?: LayoutHints`, and reads footprints from the pinned profile; `TextMeasurer`/`TextSize` kept as a deprecated adapter that wraps a `LineMeasurer` for one release, never the other way), `packages/diagram-canvas/src/layout/graph.ts` [M] (read every §3.2 slot into the working graph through the shared core resolver — chained refinements classify correctly; keep the refusal for unsupported profiles/types by name), `packages/diagram-canvas/src/layout/engine.ts` [M] (accept `PROFILE_ID` alongside `generic@1`; stamp fold groups from the collapse input instead of emitting `groups: {}`; produce projected relation occurrences per §4.3.3 when a collapse input is present; run the §4.4.3 call sequence), `packages/diagram-canvas/src/layout/place.ts` [M] and `packages/diagram-canvas/src/layout/dock.ts` [M] (fixed footprints never enlarged; docking overflow per §4.4.5; hints of §4.6 honoured), `packages/diagram-canvas/src/visibility.ts` [M] and `packages/diagram-canvas/src/scene.ts` [M] (projected edges are items, internal edges are `endpoint-hidden` exclusions; conservation asserted as today).
- **Layout warnings:** `LayoutWarningCode` gains `docking-overflow`, `card-overflow`, `zone-overflow`. No other warning code is added.
- **RED tests:** `packages/diagram-canvas/tests/layout/fixed-footprint.test.ts` [N] (a card with maximal docks keeps `460 × 200` and reports `docking-overflow`; fails today by enlarged geometry), `packages/diagram-canvas/tests/layout/folded-projection.test.ts` [N] (laying out an acceptance document with a collapse input returns a view that passes `validateView` and whose scene conserves occurrences; fails today because no collapse input exists), `packages/diagram-canvas/tests/layout/measurement.test.ts` [N] (the §4.4.6 assertions: header-height delta moves the first child row by exactly that delta under two measurers; layout `lines` equal renderer `lines`; toggle headers wrap at the reduced width; legend-key height stays 64 at the legend-following width), `packages/diagram-canvas/tests/layout/hints.test.ts` [N] (`stretch` widens expanded containers but never a fixed card; `zoneGap` and `cardGap` move disjoint sibling sets; `ordering`/`grouping` reproduce the recorded HRPN packing as data).

### 5.7 Commands, migration registration and remaining core files

- **Commands:** no new command kind. Slot edits travel through `update-entity-attributes`; legend keys are ordinary entities (`create-entity`, `delete-entity` with its explicit policy); folds mint no command (§4.1). `packages/diagram-core/src/commands.ts` needs no change for M1, and a test asserts the command-kind list is unchanged so a fold command cannot be smuggled in: `packages/diagram-core/tests/commands-inverse.test.ts` [M] gains one case (a `PROFILE_ID` document round-trips `command → inverse → initial content` byte-for-byte on canonical content with revisions normalised, the established pattern).
- **Migration:** `packages/diagram-core/src/migrate.ts` [M] registers the §3.9 profile migration in a profile-migration registry parallel to the schema migrations (same report shape: `from`, `to`, operations, `unmigrated`, original retained, plus `adapter` naming `legacy-constraints@1` where the legacy interpretation was used). `packages/diagram-core/src/document.ts` [M] only in its documentation of the current schema version (no field change). RED tests: `packages/diagram-core/tests/migrate-completed.test.ts` [N] —
  1. a plain `generic@1` graph with a relation and a port migrates: every `.profile` field (document, entities, relations, ports, type definitions) rewritten, zero records still naming the source profile, output validates with zero diagnostics, ids and content retained, every transformation present in `operations`;
  2. `collapsed` absent / `false` / `true` produce the three distinct report lines of §3.9 step 4;
  3. a compatible refinement (the `hrpn-card` shape) is remapped (instances rewritten to the base type, definition dropped, document validates); a conflicting refinement (different kind or rejecting bound) is carried in `unmigrated` and its output is not claimed valid;
  4. mixed majors refuse; reversed record insertion yields identical operations and identical output bytes; the original is recoverable from the report byte-for-byte;
  5. an unknown profile major refuses in write and is preserved; unrelated profiles in the same document are untouched;
  6. **resolve witness:** the resolved `PROFILE_ID` declaration contains no container-name uniqueness, no container count limit, and `link` label bound 200 (§3.9.4).
- **Diagnostics summary:** the `DiagnosticCode` union gains exactly three codes (`legend-key-parent-invalid`, `tone-category-unknown`, `text-pattern-mismatch`). Folded-projection refusals reuse existing codes with new `details` values (§4.3.4), so consumers that switch on codes see no new refusal class for folds.
- **Barrel and docs:** `packages/diagram-core/src/index.ts` [M] re-exports nothing new by name beyond the profile and the resolver/measurement types (the new types ride the existing module exports); `packages/diagram-core/README.md` [M] records the completed model, the family/scope/constraint rules and the folded-view contract in English.

### 5.8 Declarative text-key validation (finding 12)

- **Files:** `packages/diagram-core/src/attributes.ts` [M] (the `text` schema arm gains `minLength?`, `pattern?`, `patternName?`; `validateScalar` checks length bounds then pattern, in that order, so a too-long value reports `text-too-long` and a malformed in-bounds value reports `text-pattern-mismatch`), `packages/diagram-core/src/diagnostics.ts` [M] (the `text-pattern-mismatch` code), `packages/diagram-core/src/profile.ts` [M] (`validateProfile` refuses a `pattern` that does not compile as an anchored ASCII RegExp, or a `pattern` without a `patternName`, as `type-definition-conflict` detail `text-pattern-invalid` — a profile with an unexecutable grammar is refused at qualification, never at document time).
- **Behaviour:** patterns are matched against the whole value (the stored pattern source is used as given; profiles declare anchored sources, §3.3). Matching uses the host `RegExp` with no flags; no Unicode flag is added, so the ASCII grammar means the same bytes everywhere. Pattern validation runs for every text value of a schema that declares one, including collection items whose item schema declares one.
- **RED tests:** `packages/diagram-core/tests/text-keys.test.ts` [N]: empty value refuses `text-pattern-mismatch` (`pattern: "key"`); uppercase, embedded whitespace and `#fff` refuse; a well-formed unknown icon name validates; a token name with a dot segment validates under `token-name` and refuses under `key`, and vice versa for a hyphen-only name, proving the two grammars are independent; a profile declaring a non-compiling pattern refuses in `validateProfile`.

## 6. Engram side: what Engram holds, what the DS keeps (G2)

Governance is G2, verbatim: « Engram governs profiles, schemas, fixtures and migrations. The Design System retains and publishes the generic @sentropic/diagram-core executor, layout and rendering. Consumers pin profiles; no second diagram metamodel. » The frozen guardian contracts (`SPEC-G0-guardian-contracts.md`, pinned in the oracle manifest of §7.3) apply: an ontology is a five-part record (versioned profile, conformance corpus, identity and digests, lineage record, catalog entry), no part alone is an ontology, and the guardian invents no third profile shape — the diagram shape stays the `diagram-core` `Profile`, the Engram shape stays the Engram `OntologyProfile`, referenced through explicit versioned adapters. This section states the `PROFILE_ID` instance of that contract. Engram artefacts are produced in the Engram repository by its own lots; this repository consumes them by pin.

### 6.1 What Engram must hold for `PROFILE_ID`

All of the following, versioned and immutable once published (bytes under an id and version never change; any change is a new version):

1. **The profile definition as data**: the `PROFILE_ID` declaration of §5.5 serialized canonically (entity, port and relation types with roles and cardinalities, the `container` family flags, footprints, constraints with their scopes, limits, completeness `complete`, notes). This is the normative declaration; the TypeScript literal in this repository is a transcription checked against it (§6.3), not a second authority.
2. **JSON schemas**: (a) the profile schema (what a `PROFILE_ID` profile document must satisfy, used by `validateProfile` qualification); (b) the `SemanticDocument` schema at schema `1.1` as written by this executor generation (unchanged shape, §3.9); (c) the `ViewDocument` schema including the `semanticTarget`/`sourceOccurrence` endpoint fields, the `strokeStyle` occurrence field, the fold-group `occurrence` field and the `summaryLabels` record of §4. Schemas are generated from or checked against the executor's validators by fixture, never hand-diverged.
3. **The conformance corpus**: the §7 acceptance documents and views (valid instances), the rejected cases with asserted diagnostics (including the new §5 cases: leaf parent, spurious and non-outermost projections, duplicate legend category and duplicate order in one legend, undeclared and ambiguous tone bindings, missing uniqueness scope in a new-format profile, malformed keys), and the command/inverse sequences. A profile without its green corpus is a draft outside the catalog and is not pinnable (§6.4 admission).
4. **Migrations**: the registered profile migration of §3.9 as a versioned function with its report contract, plus the schema-migration references the lineage record needs. Migration functions keep the original; an unknown major refuses in write.
5. **The ontology record and catalog entry**: the complete G0 hand-off mapping of §6.4 (every field named there, with its value rule for this profile). Publication is the G0 §5.5 admission gate (§6.4), never “green corpus” alone.

Engram also keeps its existing stewardship unchanged: no private consumer content is held guardian-side (private stacks are pins, digests and receipts only), display labels are never identity, and preserved foreign content keeps its three levels and is never promoted.

### 6.2 What the DS keeps in this repository

- The **generic executor**: `packages/diagram-core` (validators including the shared resolver and the generic constraint mechanisms, commands with inverses, canonical serialisation, migration runtime, diagnostics) and `packages/diagram-canvas` (scene, visibility, transform, hit test, layout engine including the §5.6 fold, measurement and hints surface). The executor executes whatever pinned profile it is handed; it contains no `PROFILE_ID` content beyond the transcription literal used by tests and by consumers that pin this repository's build before the Engram publication is qualified (the transitional state G2 allows: a pinned build-time copy, replaced by the pinned Engram artefact once its implementation and qualification evidence exist — two distinct evidence states, never conflated).
- **Rendering contracts by reference**: the card/container/legend rendering contract is owned by `SPEC_EVOL_DS_DIAGRAM_CARDS.md`; this repository keeps the components, tokens, pictogram registry and themes that implement it (roadmap M2, §8). No runtime rendering path depends on a network or MCP call: consumers load pinned profiles offline at build or start time.
- **This specification and its successors**, plus the executor's own unit fixtures. Conformance fixtures that Engram catalogs are mirrored here only as test inputs pinned by digest (§6.3), never edited into a local variant.

### 6.3 Digests: G0 exact preimages, vectors, and the separate artifact digest (finding 5 / A1)

The r1 rule (“SHA-256 over the complete canonical profile”) contradicts G0 and is withdrawn. Digests follow G0 §7 exactly; this section restates the operative preimages so an implementer never has to guess which bytes are hashed, and names the one additional digest this lot needs under a different name.

#### 6.3.1 The four G0 digests (never interchanged)

| Digest | Question it answers | Preimage (G0 §7.2) | Changes when |
| --- | --- | --- | --- |
| `contentDigest` | Which profile bytes are these? | Per shape. For a diagram profile: **P-CONTENT-DIAGRAM** (§6.3.2). d2d keeps its `profile-c14n/2` bytes; engram keeps the `profile_hash` stable serialisation. The DS FNV-1a value (`packages/diagram-core/src/hash.ts`) is none of these and never a trust gate. | Only when the profile's own declarative content changes (new version) |
| `pinsDigest` | Which pins were declared? | **P-PINS** (§6.3.3): ordered layer pins + rule-sheet pins + delta/mapping digests in one hashed object. Even a single-layer stack hashes the pin structure, never the profile bytes. | Any layer pin, layer order, rule-sheet pin, delta or mapping change |
| `resultDigest` | Which resolved result was produced? | **P-RESULT** (§6.3.4): effective declarations + effective rule set (guardian-computable scope) or the owner's complete effective document (private scope). | Any pin, order or delta change, or a composition-rule change with pins unchanged |
| `entryDigest` | Which catalog entry is this? | **P-ENTRY**: SHA-256 over the RFC 8785 bytes of the whole catalog entry (envelope plus payload), computed externally, never self-embedded. | Any entry field change (including deprecation), never a profile-byte change alone |

#### 6.3.2 P-CONTENT-DIAGRAM (diagram `contentDigest`)

Source: G0 P-CONTENT-DIAGRAM at `SPEC-G0-guardian-contracts.md` §7.2 (oracle-pinned, §7.3). The preimage is the closed object below, canonicalised with RFC 8785 (JCS), UTF-8, no trailing newline, and hashed with SHA-256. Keys in canonical (sorted) order:

| Key | Value |
| --- | --- |
| `completeness` | String (`skeleton` or `complete`), verbatim |
| `constraints` | Array of the profile's executable constraint declarations, in declared order, each as its native JSON value |
| `entityTypes` | Array of entity type declarations, in declared order, each as its native JSON value (labels, attribute schemas, `abstract` flags, and the M1 additions `container`, `footprint`, text `pattern`/`patternName`/`minLength` where declared) |
| `limits` | Closed object with exactly `maxEntities`, `maxRelations`, `maxEndpointsPerRelation`; each the declared number or **`null`** where the source omits it (omission hashed as `null`, never `0`, never dropped) |
| `portTypes` | Array of port type declarations, in declared order (`[]` where none) |
| `profile` | String `name@major` — the source `id` under this key (renamed; the value is identical) |
| `relationTypes` | Array of relation type declarations, in declared order (labels, direction, roles with `min`/`max`, targets, entity types, attributes, `hierarchy` where declared) |

Excluded (never hashed): `name`, `version`, `notes` as standalone fields (identity is carried by `profile`; human notes are outside the delegated projection), runtime code, file paths, the DS FNV drift value, view documents, occurrences, geometry, layout results, theme identifiers and token values, and every catalog field. Consequences, normative and fixtured (§6.3.5): changing `completeness`, a `container` flag, a `footprint`, or a constraint `scope` **changes** `contentDigest`; changing only `notes` **does not**. The transcription check of §6.3.6 uses this projection on both sides.

#### 6.3.3 P-PINS, P-DELTA, P-MAPPING

- **P-PINS**: closed object `{ deltaDigest, layers, mappingDigest, ruleSheets }` where `layers` is an array of Pin objects exactly `{ contentDigest, id, version }` in stack order (top layer last; reordering changes the digest; even a single-layer stack hashes this array), `ruleSheets` the same Pin shape in composed order (`[]` where none), and `deltaDigest`/`mappingDigest` each a digest or `null`. `pinsDigest` is SHA-256 over the RFC 8785 bytes of that object. Hashing profile pins alone, or omitting `ruleSheets` where sheets compose, fails qualification.
- **P-DELTA**: the delta digest inside P-PINS is SHA-256 over the RFC 8785 bytes of `{ base, mappingRef, operations, retiredFixtures, retiredRules }`, where each operation's `declarationDigest` is computed over the **single declared value alone** (diagram: RFC 8785 bytes of that declaration JSON value), never over a whole profile (G0 P-DELTA, complete in the pinned G0).
- **P-MAPPING**: the mapping digest is SHA-256 over the RFC 8785 bytes of `{ entries, mappingId, version }`, each entry its flat typed object with every arm field verbatim; the file's own `contentDigest` field is excluded.

#### 6.3.4 P-RESULT

Guardian-computable diagram scope: SHA-256 over the RFC 8785 bytes of `{ effectiveDeclarations, effectiveRuleSet, severityPolicyDigest }`, where `effectiveDeclarations` is the P-CONTENT-DIAGRAM object of the **effective** (resolved) profile, `effectiveRuleSet` the composed effective rules as closed `{ classification, code, messageKey, ruleBody, ruleId, severity }` objects (`ruleBody` the complete effective native rule value), and `severityPolicyDigest` the pinned SHA-256 of canonical `{ phase, readinessPolicy, settings }` (or `null` where no rule sheet applies). Changing an effective body, option, severity, classification or selected policy changes this digest even with pins held fixed. The owner-side private procedure (whole effective document, S-D2DC14N) does not apply to this public diagram profile and is not used here.

#### 6.3.5 Frozen vectors (must reproduce exactly)

An implementation must reproduce each digest from the exact bytes. A mismatch fails qualification; the vectors decide the freeze (G0 §7.2).

| Vector | Exact canonical bytes (UTF-8, no trailing newline) | SHA-256 |
| --- | --- | --- |
| V-PINS-1 (P-PINS, single layer, no delta/mapping/rules) | `{"deltaDigest":null,"layers":[{"contentDigest":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","id":"generic","version":"1.0.0"}],"mappingDigest":null,"ruleSheets":[]}` (186 bytes) | `467becc10978220abbbe6d9fdad72eddec4c62a3dd9f2150bc3f9fe1bd7313fe` |
| V-DIAGRAM-1 (P-CONTENT-DIAGRAM, minimal) | `{"completeness":"complete","constraints":[],"entityTypes":[{"id":"node"}],"limits":{"maxEndpointsPerRelation":4,"maxEntities":100,"maxRelations":200},"portTypes":[],"profile":"generic@1","relationTypes":[]}` (206 bytes) | `4d2c641281713349753eb80ba40e0b08ec29b2f93847e4d0f2feb18e25381c94` |
| V-MAPPING-1 (P-MAPPING, one rename) | `{"entries":[{"from":"a","kind":"rename","to":"b"}],"mappingId":"m1","version":"1.0.0"}` (86 bytes) | `b5770fd9b0623a047f65ed3d7811340afa965a623faaf0fd3e58babbc1be2516` |
| V-DELTA-1 (P-DELTA, one add) | `{"base":{"contentDigest":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","id":"generic","version":"1.0.0"},"mappingRef":null,"operations":[{"declarationDigest":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","op":"add","subject":"c4-system"}],"retiredFixtures":[],"retiredRules":[]}` (320 bytes) | `436065f4f09c6de4dc7f25f8eb3821088e43f27c2f9454137fc19042bebff3e2` |

Mutation fixtures (in addition to G0 §7.4 FX-DIG-*): for `PROFILE_ID`, flipping `completeness`, toggling a `container` flag, changing a `footprint` dimension, and changing a constraint `scope` each change the computed `contentDigest`; editing only `notes` leaves it unchanged; omitting a limit vs declaring it `null`-equivalent is distinguished exactly as G0 prescribes (declared number vs `null`).

#### 6.3.6 Transcription check and the separate artifact digest

- **Pins.** A consumer pins a profile by an exact pin `{ id, version, contentDigest }` — exact version, full SHA-256 `contentDigest` over the P-CONTENT-DIAGRAM projection, no range, no tag, no `latest` fallback anywhere. An unknown version, digest or major refuses; it never falls back.
- **Transcription check.** The `PROFILE_ID` literal shipped in `packages/diagram-core` must project (P-CONTENT-DIAGRAM) to bytes whose SHA-256 equals the pinned Engram `contentDigest`. The M1 gate runs this check; a mismatch refuses the build (`digest-mismatch` discipline) rather than silently preferring either copy.
- **Artifact digest (separate, where complete-file equality is also required).** `artifactDigest` is SHA-256 over the RFC 8785 canonical bytes of the **complete** profile artifact as published (including `name`, `version`, `notes` and any governed metadata the projection excludes), computed externally and recorded beside — never instead of — `contentDigest`. It exists so a publisher can prove two complete files are byte-equivalent where that stronger statement is needed (for example a mirrored transcription audit). Rules: `artifactDigest` never gates pin resolution, never substitutes for `contentDigest` in P-PINS/P-RESULT, and is labelled `artifactDigest` wherever recorded so the two are never interchanged. A notes-only change changes `artifactDigest` and leaves `contentDigest` unchanged; both behaviours are fixtured.
- **Fixture hand-off:** each acceptance fixture (§7) is identified by its canonical SHA-256 as recorded in the corpus manifest. A hash mismatch at lot time aborts the lot's fixture step as a fixture error, not a test failure.
- **Change flow:** a profile change is proposed as data in Engram, qualified against the corpus there, published as a new version with its digests, and only then transcribed or re-pinned here. This repository never edits a published profile's bytes in place, and Engram never edits executor code.

### 6.4 Complete G0 hand-off mapping, DIA receipt and admission gate (B8)

The r1 §6.1 item 5 named five fields. G0 requires the full record and payload; this table supplies every field for `PROFILE_ID`, with the value rule an implementer fills. Admission is the G0 §5.5 gate, not “green corpus”, and the r1 M1 phrase “pinnable draft” is withdrawn everywhere (§8): a candidate without full admission evidence stays a **draft outside the catalog** and is never described as pinnable, published or qualified.

**Ontology record (G0 §1.4) and catalog payload (G0 §5.3) — value rules for `PROFILE_ID`:**

| G0 field | Value for `PROFILE_ID` |
| --- | --- |
| `namespace` | The Engram diagram namespace segment for governed diagram profiles (the value Engram records for the `generic` family; recorded verbatim in the entry, never derived from a display label). |
| `id` / `version` | Ontology id `generic` with version `2` (instantiation A) or `architecture` with version `1` (instantiation B); the profile id string is `PROFILE_ID` (`generic@2` resp. `architecture@1`). |
| `owner` | The durable owner handle Engram records for diagram profiles (DS diagram-core maintainers as owning team; publication without an owner refuses, G0 `missing-owner`). |
| `lifecycle` | `draft` until §5.5 admission passes, then `published`; `generic@1` moves to `superseded` only under instantiation A, paired with `supersededBy` + migration reference (§3.9.4); under B both stay `published`. |
| `completeness` | `complete` (never waives evidence, G0 R-3). |
| `visibility` | `public`. |
| `profileShape` | `diagram-profile`. |
| `artifactKind` / `artifactBinding` | `artifactKind: "profile"`; binding variant `profile`: `{ profilePin, stack, relationMatrixRef? }` where `profilePin` is the `PROFILE_ID` pin, `stack` repeats the payload `stack` value, and `relationMatrixRef` is absent (public profile; required only for private profiles). |
| `profileRef.canonicalRef` | Canonical reference string of the versioned profile as Engram records it (the governed profile reference, distinct from the catalog entry id); `profileRef.contentDigest` is the P-CONTENT-DIAGRAM digest (§6.3). In the payload this is `canonicalRef` (payload field) with `profilePin` carrying `(id, version, contentDigest)`. |
| `catalogEntryRef` | Reference to the §5 catalog entry of kind `ontology`; absent while the profile is a draft outside the catalog, required once admitted. |
| `provenance` | Closed `{ sourceRef, sourceRevision }`: the dossier/spec source reference and the exact source revision (this specification at its r2 commit) that the entry was authored from. Licence closure and coverage are separate payload fields, never provenance fields. |
| `stack` | Single-layer stack: exactly one pin, the `PROFILE_ID` pin itself (§3.9.4). `lineage.parents` is the empty list; `lineage.migrations` names the §3.9 migration reference; `lineage.mappings` is empty (no mapping file); no derivation record (not a derived profile). |
| `conflictPolicy` | String reference to the G0 §§2–4 stack/derive/merge conflict handling (mapping-required, never silent overwrite); the field names the versioned policy record that applies and never weakens it. |
| `compatibility` | Closed `{ renderer, adapter }` pinned string references: the qualified `diagram-core`/`diagram-canvas` executor version range recorded at admission, plus the profile-schema binding below. Consumers pin the published executor version once qualified; a pinned build-time copy is the transitional state before qualification (two evidence states, never conflated). |
| `linkedTools` | Array of string references to the linked invocation-tool entries (G0 §9) through which hosts consume the profile; empty only where Engram records no tool link yet, and then admission records that explicitly. |
| `ruleSheets` | `[]` — no unit rule sheet composes over `PROFILE_ID` at M1. Where a sheet later applies, each entry is `{ sheetPin, ruleIds, selections }` with the public `SelectionMetadata` of G0 §5.3, and P-PINS takes only `sheetPin` in composed order (§6.3.3). |
| Schema binding | Payload `compatibility` plus the governed schema assets: profile schema, `SemanticDocument` 1.1 schema and `ViewDocument` schema (§6.1 item 2), each recorded as a digest-bound asset (`DocumentSchema`-style `{ name, schemaId, version, assetPath, sha256 }` in the entry `assets`/`bindings` as the registry envelope requires). The schema assets are catalog-bound: a schema change without a new asset digest fails admission. |
| `corpusRef` | Closed `{ ref, digest }`: the conformance-corpus reference and its manifest digest (§7). Required for a published record; an ontology without a corpus is not admitted. |
| `digests` / `resultEvidence` | Closed `{ contentDigest, pinsDigest, resultEvidence }` where `resultEvidence` is the G0 `DigestEvidence` over `resultDigest`: arm `resolved` (with the digest) is required for publication; arm `unresolved` (no digest value, no placeholder) is the only pre-admission state and never passes the gate. `entryDigest` is computed over the whole entry externally (P-ENTRY) and never embedded. |
| `migrations` | Array with the §3.9 migration reference (plus schema-migration references the lineage needs); empty only where no migration exists — not the case here. |
| `consumers` | Catalog ids / repository pins to notify before the major ships (layout engine, dossier binding, h2a dossier builder, HRPN and governance consumers); publication requires the list present. |
| `supersededBy` / `migrationRef` / `deprecatedReason` / `deprecatedAt` | Per lifecycle (§3.9.4): `supersededBy` required iff the predecessor is `superseded` (instantiation A, on the `generic@1` record), paired with `migrationRef`; deprecation fields only on a `deprecated` record. |
| `licenceClosure` / `coverage` | Required iff the entry is an EXT pack entry; absent for this profile entry. Recorded explicitly as absent, not omitted by oversight. |

**DIA `family-corpus` receipt (required receipt for this entry).** Under G0 §5.4 a `profile` entry with `profileShape diagram-profile` (family DIA) is admitted on **validator receipts**: for `PROFILE_ID`, exactly one receipt kind is required, the `family-corpus` arm, produced by the DS executor's own test run and stored by the guardian (the guardian executes no library itself):

| Receipt field | Value rule |
| --- | --- |
| `receiptKind` | `family-corpus` |
| `family` | `DIA` |
| `corpusDigest` | Digest of the §7 corpus manifest the run covered |
| `fixtureDigest` | Manifest digest of the DIA conformance corpus (same value as `corpusRef.digest` for this entry) |
| `libraryId` / `libraryVersion` | The implementing library and its exact version (`@sentropic/diagram-core` + `diagram-canvas` executor build that ran the corpus) |
| `validatorRole` | `qualified-ds-execution` once parity is proven under the study gates; `transitional-oracle` witnesses expected verdicts during transition only and never satisfies a switch to the reference role. The role actually executed is recorded; claiming `qualified-ds-execution` without `reference-qualified` transition evidence refuses admission. |
| `transitionQualification` | Arm `reference-qualified` (`{ claim, parityMatrixDigest, qualifiedExecutorPin, gateEvidenceRef }`) iff `validatorRole` is `qualified-ds-execution`; arm `oracle-witness` iff `transitional-oracle`; absent iff `retained-check` (not applicable here). |
| `verdict` | `pass` required; a required rule at `not-evaluated` never counts as pass for that rule. |
| `evaluatedStack` | Closed `{ stack, pinsDigest, resultEvidence }`: the exact single-pin stack, its P-PINS digest, and the evaluated `resultDigest` in `DigestEvidence` form. Both this `resultEvidence` and the entry's `digests.resultEvidence` must be `resolved` with equal digests before any comparison (see gate). |
| `severityPolicyDigest` | The selected digest where a rule sheet applies; **`null`** here (no rule sheet composes, `ruleSheets: []`), present as a field with that explicit null per the non-`bpmn-parity` selection-binding rule. |
| `ruleVerdicts` | Present; `[]` only because no rule sheet applies. Each verdict, where present, carries `ruleId`, effective `severity` and `studyDisposition` where applicable. |
| `issuedAt` | Date the receipt was produced by the library's own test run. |

No BPMN proof set (`published-corpus`, `local-expectations`), no bijection receipt and no other family's receipt is required of this DIA entry, and none may be presented in its place.

**Admission gate (G0 §5.5, normative; replaces every “green corpus” formulation).** Admission refuses while any required receipt is missing, failed or mismatched, at any completeness including `skeleton`:

1. First require resolved result evidence: `entry.digests.resultEvidence.evidenceState` and the receipt's `evaluatedStack.resultEvidence.evidenceState` must both be `resolved` with present, equal digest values. A `verdict: pass` receipt with an unresolved arm refuses explicitly; two unresolved arms never constitute a match.
2. Then compare the evaluated stack in order, `pinsDigest`, and the resolved result digests field by field against the entry; refuse every mismatch (`FX-RCPT-MISMATCH` discipline). For public rule-sheet scopes, additionally recompute the selected `(phase, readinessPolicy)` policy digest over complete settings and compare it with the receipt's selection binding (vacuous here: no sheet, explicit `null` on both sides).
3. A receipt with `verdict: fail`, a wrong `validatorRole` for the claimed qualification, a required rule at `not-evaluated`, or a `parity: open` rule presented as satisfying `qualified-ds-execution` each refuse exactly as a missing receipt does (`missing-receipt`). Profile self-validation green, corpus green, licence closure recorded and every applicable digest resolved are all required; no single one admits.

Development artifacts (§8 stage S1), the qualified profile publication (stage S2) and package publication (stage S3, owner gesture) are three distinct states; only S2 is catalog admission, and only S3 publishes a package.

## 7. Acceptance instances with zero extensions

Acceptance is a set of pure instances of the completed model. An instance qualifies only when **all** of the following hold, checked by the named gates:

- `profileRefs` is exactly `["PROFILE_ID"]` (instantiated per Q1);
- `extensions` is empty (no preserved extension carries slots, titles or tints);
- `typeDefinitions` is empty (no local refinement carries standard slots);
- every entity type is one of `node`, `container`, `legend`, `legend-key` (after the conversion ledger of §7.2); every relation type is `link`, the hierarchy relation or `association`;
- `validateDocument` and, per view, `validateView` return **zero diagnostics**, including on every folded view (§4.3);
- display titles are stored literally (the two « CI/CD » zones are both stored as « CI/CD »);
- relation presentation is stored per relation id (§3.5.1 counts) and authored aggregate labels are stored as `summaryLabels` with constituent ids (§4.5);
- geometry in each view is produced by the DS layout from the semantic document (expanded views, with the §4.6 hints recorded per instance) and by the §4.3 projection (folded views), never copied from a consumer layout as input.

Counts below are typed counts (per resulting type), containment-relation counts and link counts separately — never a single entity total (finding 8 / B3). A re-expression with a different typed count, a different containment count or a different link count is a different graph and fails the instance.

### 7.1 The instances

| # | Instance (source of truth for content) | Content that must be re-expressed | Fold witness |
| --- | --- | --- | --- |
| A1 | Governance central scene: sentropic `4138a0ecba9c5b37409abb5ac00f732d02b7dc8d`, `docs/governance/kit/src/governance-central.js` (`buildGovernanceCentral`), plus `governance-collapse.js` fold behaviour and `presentation-scenes.json` scene dressing (oracle-pinned, §7.3) | Top frames `h2a`, `surfaces`, `cluster-mesh`, `engram`, `design-system`; nested frames `cm-catalog`, `cat-mcp`, `cm-storage`, `cm-security`, `cm-cluster`; every card with its kicker (package/family), title, body/detail lines, footer (`service: …`) and icon; every labelled relation (the relation set of the builder, counted in the oracle manifest); legend categories `neutral`, `proposal`, `identity` as one legend with `order` values | Expanded view; the all-collapsed overview with its authored `summaryLabels` (§4.5); at least one single-fold view per top frame; each folded view passes `validateView`; nested folds select the outermost representative (§4.3) |
| A2 | HRPN scene S2-asbuilt (fixture corpus: 41 cards / 17 zones / 44 links, 7 dashed) | Cards, zones, containment and labelled links as pure `PROFILE_ID`; tints as `tone` keys explained by the scene legend; dashes as `strokeStyle` per id | Recorded default folds for the scene, re-expressed as `defaultFolds` input; folded view valid |
| A3 | HRPN scene S2-target, fixture form (51 cards / 22 zones / 54 links, 0 dashed) | As A2. Kept as the regression form; it is not replaced by A5. | As A2 |
| A4 | HRPN scenes S1-conversational (23/17/24, 10 dashed) and S3-agentfactory (37/15/36, 3 dashed) | As A2 | As A2 |
| A5 | HRPN S2-target graph, Engram form: `/home/antoinefa/src/airbus-genair-hrpolnav/docs/architecture/hrpn/engram/S2-target.semantic.json` (sha256 `46f64154bb6592d49ccda5633b2c4d4205fb1c6752ef218be31d6757923ecf91`, 19 containers + 37 `hrpn-card`, 51 `contains` + 31 `link`, revision 1) + `S2-target.view.json` (7 default folds: `MSGZ`, `VERTEXZ`, `INGZ`, `PCICD`, `OBSZ`, `GENSRC`, `AWSCI`) | The same graph converted by the ledger of §7.2: refinements dissolved, extensions dissolved, titles literal, slots and legend native (§7.2 typed result) | The stored expanded geometry is replaced by DS layout (with recorded hints); the 7 default folds become the `defaultFolds` input and the folded view is projected per §4.3 and validates at revision 1 (§4.1.3) |

A1's relation count is taken from the builder's relation table at the pinned commit; the oracle manifest records the exact count and the fixture digest (§6.3). No instance count in this table is asserted from prose: each is recomputed from its oracle bytes at gate time and compared with the manifest value.

### 7.2 A5 conversion ledger: identity-preserving, typed counts (finding 8 / B3)

A5's source form cannot be renamed in place: its legend is a `container` holding four sample cards, and its cards use a refinement. The conversion is therefore a **ledger**: every source entity maps to exactly one target entity with the **same entity id**, and the ledger is part of the corpus fixture (checked, not narrated). Source bytes: 56 entities (19 `container`, 37 `hrpn-card`), 82 relations (51 `contains`, 31 `link`), 19 `hrpn.zone-slots@1` extensions, 1 type definition (`hrpn-card`), `profileRefs: ["generic@1"]`.

| Source (id pattern) | Target type | Slot provenance (where each value comes from) | Count |
| --- | --- | --- | --- |
| `entity:LEGEND` (`container`, name “Legend”) | `legend` (same id) | `name` from the entity; `kicker`/`subtitle`/`icon` from its zone-slots extension source (`HRPN` / “Card tints and link styles of this scene” / `window`); `footer`/`tone` absent (extension carries none) | 1 legend |
| `entity:legend-genair`, `entity:legend-custom`, `entity:legend-outside`, `entity:legend-none` (`hrpn-card` children of `LEGEND`) | `legend-key` (same ids) | `name` from the card's display content; `category` from the card's `tint` value (`genair`/`custom`/`outside`; `legend-none` maps to category `none` with the neutral token, recorded explicitly in the ledger); `token` from the scene legend mapping in the oracle manifest (source-to-token table, §7.3 — never invented at conversion time); `order` assigned 0,1,2,3 in source legend order; `description` from the card body where present | 4 legend keys |
| Remaining 18 `container` entities | `container` (same ids) | Header slots from each entity's zone-slots extension source (`kicker`, `subtitle`, `footer`, `icon`); `tint` → `tone` by the declared rename (§3.9); `displayTitle`, where the extension carries one, becomes the entity `name` and the suffixed stored name is discarded (the two « CI/CD » zones both become `name: "CI/CD"`) | 18 containers |
| Remaining 33 `hrpn-card` entities | `node` (same ids) | `kicker`/`body`/`detail`/`footer`/`icon` from the refinement attributes; `tint` → `tone` by the declared rename | 33 nodes |

**Typed result (asserted separately, normative):** 33 `node` + 18 `container` + 1 `legend` + 4 `legend-key` = 56 entities; 51 `contains` relations (unchanged ids; the four LEGEND containment relations now target `legend-key` children under a `legend` parent, which the `children-restricted` constraint accepts); 31 `link` relations (unchanged ids, labels and endpoints; `strokeStyle` absent ⇒ `solid` for all 31, matching the source's all-solid target). Total entities (56), containment count (51) and link count (31) are asserted as three separate numbers alongside the four typed counts; the r1 gate language (“different card/zone count fails”) is replaced by this table, because the native legend necessarily changes the card/zone split (37→33, 19→18+1) while preserving every id and every content value. Extensions after conversion: 0. Type definitions after conversion: 0. The ledger records, per entity, source type → target type and the extension/attribute each slot came from, so a slot with no provenance fails the conversion review.

The same ledger discipline applies to A2–A4 (fixture-form scenes): each zone-slots or tint value names its target slot, each dashed relation names its `strokeStyle`, and typed counts are asserted against the manifest. A conversion with no ledger does not qualify as a corpus fixture.

### 7.3 Oracle manifest: every acceptance and normative source is frozen (B4)

Acceptance and normative sources are not given by name or by mutable working-tree path. They are frozen in an **oracle manifest** — a corpus artifact (Engram-governed, §6.1) whose entries are `(revision, path, sha256)` triples plus the derived expectations. A gate that reads a source not in the manifest, or whose bytes hash differently, fails as a fixture error before any assertion runs.

The manifest SHALL contain at least:

| Entry | What is pinned | Derived expectations recorded beside the pin |
| --- | --- | --- |
| HRPN fixtures A2, A3, A4 | `docs/architecture/hrpn/ds-fixtures/S2-asbuilt.json`, `S2-target.json`, `S1-conversational.json`, `S3-agentfactory.json` at their recorded sha256 (`MANIFEST.md` table) plus `tint-legend.json` and `reference-renders.json` | Per scene: card/zone/link counts, solid/dashed counts (§3.5.1), tint-category set, default folds, expected diagnostics (zero) |
| A5 source | `S2-target.semantic.json` sha256 `46f64154bb6592d49ccda5633b2c4d4205fb1c6752ef218be31d6757923ecf91` + `S2-target.view.json` at its recorded sha256 | Conversion ledger (§7.2), typed result counts, 7 default folds, revision 1 |
| A1 source | sentropic commit `4138a0ecba9c5b37409abb5ac00f732d02b7dc8d`: `governance-central.js`, `governance-collapse.js`, `presentation-scenes.json` blobs by sha256 | Relation count from the builder table, overview `summaryLabels` with constituent ids, top/nested frame ids |
| G0 | `SPEC-G0-guardian-contracts.md` at its pinned revision + sha256 (Engram checkout) | P-CONTENT-DIAGRAM/P-PINS/P-RESULT preimages and the four frozen vectors (§6.3.5) are asserted from these bytes |
| Dossier + study | `DOSSIER-ontology-guardian.md` and `STUDY-conformance-by-graph-composition.md` at pinned revisions + sha256 | The §6.4 field sources and the DIA receipt discipline trace to these pins |
| M2 | `spec/SPEC_EVOL_GD_M2_MODEL.md` (+ `SPEC_EVOL_GD_M2_DS_PRESENTATION.md`, `SPEC_EVOL_GD_M2_CANVAS.md`, `SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md`) at the r2 commit + sha256 | §3.4 N-occurrence rule, D1-A/D3-C decisions, A′ family rule |
| Requirements + component spec | `DS-DIAGRAM-MODULES-REQUIREMENTS.md` (owner-validated 2026-10-21) and `SPEC_EVOL_DS_DIAGRAM_CARDS.md` at `97ecf69b`, by sha256 | Frozen `460 × 200`, spacing values, overflow/icon diagnostic names |
| Reviews closed | `dmodel-rev1.out`, `CONSOLIDATED-M3-r1-engram.md` (+ raw `review-M3-sol-r1.out`, `review-M3-astra-r1.out`) by sha256 | The §10 traceability table asserts coverage against these bytes |

Each entry also records: source-to-slot mapping (which source field feeds which §3.2/§3.7 slot), source-to-token mapping for legend conversion (tint/category → token name), default folds per scene, layout hints per scene (§4.6), and expected diagnostics per fixture (zero for valid instances; the asserted diagnostic arrays for rejected cases). “Source-gap”, “missing source” and “unverified” are the recorded states for any entry that cannot be pinned at manifest authoring time; a gate never substitutes a mutable path for a missing pin.

### 7.4 Where the instances live and who checks them

The instances are authored once as Engram corpus fixtures (§6.1, item 3) and consumed in this repository by path plus digest. The M1 gate checks semantic and view validity (zero diagnostics, zero extensions, zero refinements, typed counts, per-id stroke styles, authored labels); the roadmap gates of §8 check rendering and interaction against the same pinned instances. No instance file is copied into this repository as a locally edited variant: a correction to an instance is a corpus change in Engram with a new digest.

## 8. Milestones, gates and publication stages (finding 15; B9 roadmap discipline)

Milestones run in order; a gate is a set of **named executable commands with exit 0** plus the named witnesses. No milestone is reported done on a partial gate. The r1 contradiction is removed: the layout/projection surface that folded-view gates depend on is **inside M1**, so no M1 gate waits for M3 work, and no gate is stated against geometry that no earlier milestone produces.

**Publication stages (distinct; never conflated):**

- **S1 — Development artifacts.** Code, tests and draft profile data in this repository and draft corpus data in Engram. A draft is outside the catalog (§6.4); S1 artifacts are never called pinnable, published or qualified.
- **S2 — Qualified profile publication.** The G0 §5.5 admission gate (§6.4) passes in Engram: self-validation green, corpus green, licence closure recorded, digests resolved, DIA `family-corpus` receipt present and matching. Only S2 makes `PROFILE_ID` pinnable by consumers.
- **S3 — Package publication.** Making a package (including a private package) public or releasing a version. Always an owner gesture; no gate below implies it.

| Milestone | Delivers (normative scope of this spec in **bold**) | Gate (all must hold; commands are run from the repository root) |
| --- | --- | --- |
| **M1 — Model, executor and folded views** | **`PROFILE_ID` declaration (§5.5); shared resolver (§5.1); family parents (§5.2); scoped uniqueness + legacy adapter (§5.3); profile-constraint mechanisms incl. legend/tone (§5.4); text-key validation (§5.8); folded-view validation and projection (§5.6 core, §4.3); measurement + layout surface incl. fixed footprints, hints (§5.6 layout, §§4.4/4.6); profile migration (§5.7); S1 Engram artifacts of §6.1 (draft, outside catalog); corpus instances A1–A5 authored with oracle manifest (§7)** | Every §5 RED test green after having been observed RED; `validateProfile(PROFILE_ID)` empty; A1–A5 semantic documents validate with zero diagnostics, zero extensions, zero refinements, typed counts and per-id stroke styles as in §7; every folded view of A1–A5 (including nested, multi-occurrence, port and filter+fold fixtures) passes `validateView`; Appendix B folded views validate; transcription digest check (§6.3.6) and frozen vectors (§6.3.5) green; `generic@1` digest and validation results unchanged (§5.3.3). Commands: `npm run build`, `npm run check`, `npm test` (workspace tests for `diagram-core` and `diagram-canvas` run in series as part of the root test script); publishable-package count unchanged; no Python introduced. S2 admission is **not** part of the M1 gate: M1 ends at S1 with the admission evidence prepared. |
| **M2 — Cards render from the model** *(roadmap; normative contract in `SPEC_EVOL_DS_DIAGRAM_CARDS.md`)* | Atomic card and wrapping container (collapsed form is the atomic card) rendered directly from `PROFILE_ID` slots, consuming the shared `LineLayout` of §4.4; pictogram resolution by registry name; tone resolution through tokens and the document legend; colour-key legend rendering | Pointer gate (owned by the component spec): pixel-parity witnesses, slot-for-slot rendering of A1/A5 with no consumer adapter, overflow and unknown-icon diagnostics. Recorded here as a dependency of M3, with no normative clause in this spec. |
| **M3 — Interactive fold, layout and routing** *(roadmap behaviour over the M1 normative surface)* | Fold/unfold in place (per-container control, expand-all/collapse-all, per-zone chips) driving the M1 projection; re-routing; derived aggregation with authored `summaryLabels` | Behaviour gate over M1 surfaces: every folded view of A1–A5 passes `validateView` (M1 already asserts this; M3 asserts it through the interactive controls, not only through `projectView` calls); scene conservation on every fold state; fixed footprints never enlarged (`docking-overflow` witnessed); reflow without collisions on every fold toggle. **Finite interaction corpus (named, not “the interaction set”):** 600 scripted interactions (the union of per-scene fold toggles, chip toggles, expand/collapse-all and representative edge inspections over A1–A5) plus 240 stress toggles (rapid repeated fold/unfold of the deepest nested containers); worst interaction under the 1.8 s budget over that corpus, no continuous work at idle, timeouts never raised. The corpus list is a versioned fixture; adding scenes extends it by a recorded revision, never by prose. |
| **M4 — xyflow nodes and consumer switch-over** *(roadmap; separate authorisations)* | xyflow (Svelte Flow) node forms and consumer import switch-over. **Owned by their own specifications; no normative content here.** | Roadmap pointer only: the owning spec's gate applies (plain-import module-graph checks, consumer hack inventory empty in the switched consumers). Nothing in §§3–7 depends on this milestone. |
| **M5 — Exports** *(roadmap)* | draw.io export keeping folds as collapsible groups, plus static exports rendering the supplied view exactly. **Owned by the L8 dossier / converter spec.** | Roadmap pointer only: the owning spec's round-trip witness applies (folded + expanded export/re-import re-validates with same typed counts, same per-id `strokeStyle`, same `summaryLabels` with constituent ids). |
| **M6 — Editing** *(roadmap)* | Rich-text editing gated on RT-1, then editable/re-connectable edges as host-applied proposals over `diagram-core` commands (Track `01M5F3XSAJC2H6S9ZREP7JFFJ6`). **Owned by RT-1 and the edge-editing spec.** | Roadmap pointer only: RT-1 gate green before any editing lot starts; refused proposals change nothing. |

Staging rules: Svelte is the first framework for the roadmap component work; other frameworks follow the same contracts per stage and are never claimed delivered from types alone. draw.io and edge editing stay out of M1 scope even when a consumer asks early; their absence blocks no M1 gate.

## 9. Decisions: one owner decision (Q1); everything else settled

The r1 §9 (« no open questions ») is replaced. Every technical choice the validated diagrams left open is settled in §§3–8 and collected in §9.2. Exactly one choice changes what is governed and how consumers pin, and it is put to the owner here. No other question is put to the owner by this specification.

### 9.1 Q1 — Profile identity (owner decision, material trade-off stated without overstatement)

> **Q1 — Under which identity is the completed model of §§3–8 published?**
>
> **Q1 A — `generic@2` (recommended).** The completed model succeeds `generic@1` as a new major of the same family. Migration is the supersession of §3.9.1: `generic@1` is deprecated-then-superseded, paired with the migration reference; `generic@2` records an empty G0 `parents` list and a single-layer stack. Existing `generic@1` consumers (layout engine, dossier binding, h2a dossier builder) re-pin one major.
>
> **Q1 B — `architecture@1`.** The completed model is a new profile family. `generic@1` is kept, not superseded, and remains the broader generic profile for non-card uses. Migration is the cross-family migration of §3.9.2 with identical content, reporting and validation outcomes. Consumers re-pin to the new family; two complete profiles with overlapping card/container/link semantics are governed thereafter.

Material trade-off (each row is a consequence, not a forecast):

| Dimension | Q1 A (`generic@2`) | Q1 B (`architecture@1`) |
| --- | --- | --- |
| Consumer continuity | One family, one major bump; pins, tooling and dossier code that name `generic` keep their shape | Every diagram consumer re-pins to a new family name; `generic@1` pins stay valid for other uses |
| Scope of the generic profile | The fixed card anatomy (`460 × 200`), card/legend chrome and legend types become part of the generic successor; a future non-card generic use inherits that contract | That contract is isolated as an opt-in architecture profile; `generic@1` stays free of card anatomy for broader uses |
| Maintenance | One complete generic profile to govern, qualify and keep compatible | Two complete profiles to govern, with overlapping semantics and the compatibility obligations (fixtures, migrations, catalog entries) that follow |
| Engram catalog | One ontology record succeeds the other (supersession + migration reference) | Two live ontology records; `architecture@1` starts with empty lineage, `generic@1` keeps its record untouched |
| Executor / model cost | Identical: same `Profile` shape, same resolver, same migration machinery (neither option needs a second metamodel, and neither makes migration impossible — §1.2) | Identical |

**Recommendation: Q1 A.** On consumer continuity and on governing one complete profile instead of two, with no executor cost difference. The recommendation does not settle the question: M1 implementation is written against `PROFILE_ID` (§1.1) and proceeds under either answer; the only edits Q1 triggers are the id instantiation and choosing §3.9.1 or §3.9.2 as the recorded migration path. A reviewer who prefers B contests the recommendation here, with §§3–8 unchanged.

### 9.2 Settled choices (contestable in one place; none is an open question)

| # | Choice | Settled as | Where |
| --- | --- | --- | --- |
| 1 | Profile identity | **Q1 (owner decision, §9.1)** — content parametric in `PROFILE_ID`; A recommended | §1, §9.1 |
| 2 | Card/container type ids | `node` / `container` / `legend` / `legend-key` kept/added as data; ids unchanged under either Q1 answer | §3.1 |
| 3 | Leaf body shape | Two role-carrying lines (`body`, `detail`), not an untyped string list | §3.2.1 |
| 4 | Icon and tone key spaces | Open keys with a closed shape, declared as text-schema `pattern`/`minLength` data; rendering resolves, semantics checks shape (and membership when the profile declares it) | §3.3, §5.8 |
| 5 | Container count limit | No hard profile refusal in `PROFILE_ID`; scene-size bounds are consumer policy | §3.6 |
| 6 | Legend form | Semantic `legend` (with container header slots) / `legend-key` (with `order`, `legendRef` binding) entities; rendered as colour keys, never as cards | §3.7 |
| 7 | Relation presentation | Semantic `strokeStyle` (`solid`/`dashed`) + view override; authored `summaryLabels` with constituent ids for collapsed overviews | §3.5, §4.5 |
| 8 | Localisation | One language per document instance; identifiers language-neutral; renderer-generated strings host-localised; authored aggregate labels stored as view data | §3.8, §4.5 |
| 9 | Fold carrier and binding | `VisualGroup.collapsed` in the view, bound per **occurrence** (`VisualGroup.occurrence`); semantic `collapsed` removed; folds keep `ViewDocument.revision` | §4.1 |
| 10 | Folded edges | Outermost visible representative; projection recomputed from original endpoints (`semanticTarget` + `sourceOccurrence`) on every transition; aggregation derived, authored labels stored | §4.3 |
| 11 | Measurement | Exact `LineMeasurer`/`EntityMeasurementInput`/`HeaderMeasurement` types, §4.4.3 call sequence, shared `LineLayout`, state-dependent footprints with `fixedAxes`, overflow as a result | §4.4 |
| 12 | Docking beyond a fixed side | `docking-overflow` warning and edge routing; the box never grows | §4.4.5 |
| 13 | Rules governance | Every rule (hierarchy name, parent family, legend children, tone membership, key shape) is profile constraint/schema data executed by generic mechanisms; synthetic-profile proof under other identifiers | §3.10, §5.4 |
| 14 | Refinement | One shared cycle-safe resolver for schemas, identity, capabilities and layout classification | §5.1 |
| 15 | Uniqueness | Scoped only in new declarations; legacy unscoped constraints read through `legacy-constraints@1`; `generic@1` bytes immutable | §5.3 |
| 16 | Migration | Every `.profile` record rewritten in deterministic order; refinement remapping distinct from unresolved migration; migrated document validates; supersession distinct from G0 stacking parents | §3.9 |
| 17 | Digests | G0 exact preimages and vectors; `artifactDigest` separate where complete-file equality is needed | §6.3 |
| 18 | Ordering | Explicit `order` field in the legend; never encoded by renaming ids | §3.7.2 |
| 19 | Layout packing | Generic `LayoutHints` (ordering, grouping, stretch, card/zone/rank gaps) as engine input; no consumer trees in the engine | §4.6 |
| 20 | Commands for folds and legends | None added; folds are view replacement, legend keys are entities | §5.7 |
| 21 | New diagnostic codes | Exactly three (`legend-key-parent-invalid`, `tone-category-unknown`, `text-pattern-mismatch`); folds reuse existing codes | §5.7, App. C |
| 22 | Normative scope | Model + view contract + executor only; xyflow/switch-over/draw.io/editing are roadmap pointers to their own specs | §0, §8 |

## 10. Review traceability (Astra 1–17 + Engram A/B → r2 section)

| Finding | Status in r2 | Closing section(s) |
| --- | --- | --- |
| 1 — relation presentation + authored aggregate labels; dashed 7/10/3 | Closed | §3.5.1 (`strokeStyle`), §4.5 (`summaryLabels` + constituent ids), §7 corpus assertions |
| 2 — nested folds invisible representative; unfold does not reverse | Closed | §4.1 (occurrence binding), §4.3.1 (outermost), §4.3.3 (recomputed from originals), §5.6 tests 4–8 |
| 3 — measurement API missing; footprints; legend-key fixed conflict | Closed | §4.4 (types, sequence, `fixedAxes`, overflow), §5.6 measurement tests |
| 4 — migration leaves `.profile` fields; refinement remap | Closed | §3.9.1 steps 2–3, §5.7 migration tests |
| 5 — digest contradicts G0 | Closed | §6.3 (P-CONTENT-DIAGRAM/P-PINS/P-RESULT/P-ENTRY, vectors, `artifactDigest`) |
| 6 — mandatory scopes break immutable `generic@1` | Closed | §5.3.3 (`legacy-constraints@1` adapter, bytes untouched) |
| 7 — rules embedded in executor | Closed | §3.10 (constraint data), §5.4 (generic mechanisms + synthetic profile) |
| 8 — legend slots lost; A5 counts contradict | Closed | §3.7.1 (header slots), §7.2 (conversion ledger, typed counts) |
| 9 — legend resolution + ordering ambiguous | Closed | §3.7.2 (`order` field), §3.7.3 (`legendRef` binding + conflict refusal), §5.4 test 4 |
| 10 — fold revision meaning | Closed | §4.1.3 (revision retained; host revision separate), §5.6 test 9 |
| 11 — multi-level refinement larger than helper | Closed | §5.1 (shared cycle-safe resolver), §5.1 tests |
| 12 — key-shape has no carrier | Closed | §3.3 (declarative `pattern`/`minLength`), §5.8 |
| 13 — migration ancestry vs G0 stacking | Closed | §3.9.4 (supersession, empty parents, resolve witness) |
| 14 — HRPN layout controls have no surface | Closed | §4.6 (`LayoutHints`), §5.6 hints tests |
| 15 — milestone order contradictory; “pinnable draft” | Closed | §8 (layout inside M1; S1/S2/S3 stages; gate commands; 600/240 corpus) |
| 16 — profile rationale overstates rejection | Closed | §1.2 (grounded rationale), §9.1 (trade-off without overstatement) |
| 17 — wrong filename; “two view additions” | Closed | §2 (locator corrected), §3.9/§4.3.2 (full shape inventory) |
| A1 (digest preimage, abridged P-PINS) | Closed | §6.3.2–§6.3.5 |
| A2 (scoped uniqueness mutates `generic@1`) | Closed | §5.3.3 |
| A3 (executor-coded rules; key grammar carrier) | Closed | §3.10, §5.4, §5.8 |
| A4 (migration rewrites only `profileRefs`) | Closed | §3.9.1 |
| A5 (`generic@1` as G0 parent) | Closed | §3.9.4 |
| A6 (nested folds invisible representative) | Closed | §4.3.1 |
| A7 (no dashed carrier; 7/10/3) | Closed | §3.5.1 |
| B1 (fold view revision) | Closed | §4.1.3 |
| B2 (occurrence identity; provenance; round trips) | Closed | §4.1.1, §4.3.2–§4.3.3, §5.6 test 6 |
| B3 (A5 counts; sha `46f64154…`) | Closed | §7.1–§7.2 (33+18+1+4; sha recorded) |
| B4 (sources not frozen) | Closed | §7.3 (oracle manifest) |
| B5 (refinement chains) | Closed | §5.1 |
| B6 (multiple legends ambiguous) | Closed | §3.7.3, §5.4 test 4 |
| B7 (diagnostic contracts incomplete) | Closed | §5.3–§5.4, Appendix C (frozen contracts, scalar `scope`, #193 order per scope) |
| B8 (G0 hand-off incomplete; admission; draft contradiction) | Closed | §6.4 (full mapping, DIA `family-corpus` receipt, §5.5 gate) |
| B9 (scope expansion normative) | Closed | §0 normative scope, §8 (M2–M6 roadmap pointers) |
| C / Q1 (profile choice to owner) | Open as Q1 (only open item) | §1, §9.1 (A/B, trade-off, recommendation) |

## Appendix A — `PROFILE_ID` declaration sketch (normative content, abbreviated syntax)

```ts
// Profile id PROFILE_ID (generic@2 under Q1-A, architecture@1 under Q1-B), completeness "complete".
// Entity types (attributes abbreviated to name/kind/bound; all text unless noted):
//   node (container: false, footprint 460x200 fixedAxes "both"):
//     name! , kicker, body, detail, footer, icon(key), tone(key), legendRef(reference entity),
//     state(enum), weight(quantity), duration(quantity), createdAt(date),
//     pinned(boolean), tags(collection text<=40, max 8), owner(reference entity)
//   container (container: true, atomic footprint 460x200 "both"; expanded computed):
//     name!, kicker, subtitle, footer, icon(key), tone(key), legendRef(reference entity)
//   legend (container: true, atomic footprint 460x200 "both"; expanded computed):
//     name!, kicker, subtitle, footer, icon(key), tone(key), legendRef(reference entity)
//   legend-key (footprint 460x64 fixedAxes "height"):
//     name!, category!(key), token!(token-name), description, order!(quantity unit, integer >= 0)
// Port types: port (directions in/out/inout; attribute label text<=80)
// Relation types:
//   link (directed; source 1..1, target 1..1, targets entity|port;
//         attributes label text<=200, weight quantity, strokeStyle enum[solid,dashed])
//   <hierarchy relation> (directed; parent 1..1, child 1..1;
//         hierarchy <hierarchyId>, shape tree) — ids are constraint data (§3.10)
//   association (undirected; member 2..8 entities;
//         attributes label text<=120, strokeStyle enum[solid,dashed])
// Constraints (all §3.10 data):
//   hierarchy(relationType, hierarchyId, parentRole, childRole)
//   parent-family(hierarchyId, familyRoots) ; children-restricted(...) ;
//   category-membership(valueTypes, attribute, categoryType, categoryAttribute, neutralValue, bindingAttribute)
//   acyclic-hierarchy(hierarchyId)
//   unique-attribute(legend-key.category, scope { withinType: "legend" })
//   unique-attribute(legend-key.order,    scope { withinType: "legend" })
// Limits: maxEntities 100000, maxRelations 500000, maxEndpointsPerRelation 8
// Legacy note: generic@1 constraints without scope are read via legacy-constraints@1 (§5.3.3);
//   their stored bytes and digest are unchanged.
// Stack note: PROFILE_ID lineage.parents = [] ; stack = [ PROFILE_ID pin ] (§3.9.4).
```

## Appendix B — Worked folded projections (blocking-1 example, plus its nested form)

**B.1 Single fold (review example).** Document (fragment): containers `MSGZ` (collapsed in the view), cards `CHAT` (outside `MSGZ`) and `TOPIC` (contained in `MSGZ`); semantic relation `link` `CHAT → TOPIC`. Source view: occurrences `occ:CHAT`, `occ:MSGZ`, `occ:TOPIC`; `occ:TOPIC` names the fold group of `occ:MSGZ`; that group (`occurrence: occ:MSGZ`) is `collapsed: true`.

Projection (§4.3.3) with collapsed set `{occ:MSGZ}`: `occ:TOPIC` is hidden by fold; its visible representative is `occ:MSGZ` (the only, hence outermost, collapsed ancestor occurrence). The relation occurrence becomes: source endpoint `{ role: "source", occurrence: occ:CHAT }` (unchanged, no provenance fields); target endpoint `{ role: "target", occurrence: occ:MSGZ, semanticTarget: "entity:TOPIC", sourceOccurrence: occ:TOPIC }`.

Validation (§4.3.4): `entity:TOPIC` is a target of the semantic relation for role `target`; `sourceOccurrence` draws it; the `MSGZ` occurrence exists, is visible and is folded; walking parent occurrences from `occ:TOPIC` reaches `occ:MSGZ` through the collapsed group; `MSGZ` is in the container family. Zero diagnostics. Removing `semanticTarget` makes the same view refuse `occurrence-endpoint-mismatch`, which is the RED state of the current executor on this input and the first test of `packages/diagram-core/tests/folded-view.test.ts`. Unfolding is `projectView(document, sourceView, ∅)`, whose target endpoint is again `{ occurrence: occ:TOPIC }` byte-identically (no patched residue).

**B.2 Nested fold (finding 2 witness).** Add ancestors `PPROZ` (contains `MSGZ`) and `GCP`/`PRODZ` above it, all collapsed, with `TOPIC` inside `MSGZ`. Collapsed set `{occ:GCP…, occ:PPROZ, occ:MSGZ}` (every ancestor occurrence folded). The representative of `occ:TOPIC` is the **outermost** collapsed ancestor occurrence (the root-most folded one), which is visible because nothing above it is folded. The inner folded occurrences (`MSGZ`, `PPROZ`) are hidden and are never selected; a hand-written projection naming `occ:MSGZ` as representative refuses with detail `projection-not-outermost` (and, under the r1 rule, would have drawn to a hidden occurrence). Collapsing only `MSGZ` (ancestors expanded) selects `occ:MSGZ`, as in B.1. Both folded views validate, and each unfold step is a fresh `projectView` from the pinned source view.

**B.3 Authored aggregate (finding 1 witness).** Two links `CHAT → TOPIC` and `CHAT → SUB` (both endpoints inside collapsed `MSGZ`/`INGZ` representatives `occ:MSGZ`/`occ:INGZ` as applicable) project onto the same representative pair. Without a `summaryLabels` entry the renderer draws the derived count. With entry `{ id: "sum:overview-chat", sourceOccurrence: occ:CHAT, targetOccurrence: occ:MSGZ, label: "<authored overview label>", relationIds: [both relation ids, sorted] }` the renderer draws the authored label, `validateView` checks the constituent set exactly, and export serialises label + ids + effective `strokeStyle` so re-import restores the same entry.

## Appendix C — Frozen diagnostic contracts (B7)

Conventions for every row: severity is `error` unless stated; `refs` order is as listed; `details` values are scalars only (strings/numbers/booleans) — an object or array in `details` is a contract violation; multiplicity is per violating record as stated; messages are templates (`<…>` are substitutions). Whole diagnostic arrays are compared in tests under reordered input; the PR #193 order rule (UTF-16 id order, first id is the reference) applies inside each uniqueness scope (§5.3).

| Code | Status | Path template | Message template | Refs (ordered) | Details (scalar keys) | Multiplicity |
| --- | --- | --- | --- | --- | --- | --- |
| `legend-key-parent-invalid` | new | `entities.<childId>` (child side) | `key entity <childId> is contained by <parentId>, which is outside the legend family declared by the profile constraint` | `[childId, parentId]` | `childType`, `parentType`, `constraint: "children-restricted"` | One per violating child |
| `tone-category-unknown` | new | `entities.<entityId>.attributes.<attribute>` (`tone` under `PROFILE_ID`) | `tone <value> on <entityId> is not declared by its legend` (undeclared) / `… resolves ambiguously across legends` (ambiguous) | `[entityId]` (+ `legendRef` target when bound) | `attribute`, `value`, `legendBinding: "undeclared" \| "ambiguous" \| "bound"`, `categoryType` | One per violating entity attribute |
| `text-pattern-mismatch` | new | `<recordPath>.attributes.<attribute>` (entity/relation/port or collection item `…[i]`) | `value does not match the <patternName> grammar` | `[]` (record path carries the location) | `pattern` (patternName), `length`, plus `maxLength` when declared | One per violating value |
| `unique-attribute-violation` | reused (details gain scalar `scope`) | `entities.<id>.attributes.<attribute>` | `attribute <attribute> must be unique among <entityType> entities; <referenceId> carries the same value` | `[reportedId, referenceId]` (reference first in UTF-16 order, never reported) | `attribute`, `type`, `scope: "document" \| "siblings" \| "within:<typeId>"` | One per duplicate beyond the reference, per scope group |
| `endpoint-target-not-allowed` | reused (details gain `seenChain`) | `relations.<id>.endpoints[<i>]` (existing template kept) | Existing template kept | Existing refs kept | `seenType`, `seenChain` (chain joined with `>`), `allowed` | One per violating endpoint |
| `occurrence-endpoint-mismatch` (fold arms) | reused (new `details` values, no new code) | `relationOccurrences.<id>.endpoints[<i>].occurrence` (resp. `.summaryLabels` path for constituent mismatch) | Existing template kept; fold arms name the failed check in the message | `[occurrenceId, drawnTarget, …roleTargets]` as today | `role`, plus exactly one of `representative-hidden`, `projection-not-folded`, `projection-not-outermost`, `representative-not-container`, `provenance-missing`, `provenance-mismatch`, `projection-source-projected`, `summary-constituents-mismatch` | One per violating endpoint (resp. per `summaryLabels` entry) |
| `type-definition-conflict` (new details) | reused | `profiles.<id>.constraints` / `typeDefinitions.<id>` (per arm) | Per arm; names the missing scope, abstract container, bad text pattern or cycle | `[typeId]` where applicable | `unique-scope-missing`, `abstract-container`, `text-pattern-invalid`, `attribute`, `cycle` (joined ids) per arm — exactly one detail key per arm in addition to any existing keys | One per violating declaration |
| `docking-overflow` (layout warning, not a core diagnostic) | new (warning) | n/a (layout result, refs carry location) | `side <side> of <occurrence> needs <required> docks, fits <fitted>` | `[occurrenceId]` | n/a (`LayoutWarning { code, refs, message }` shape kept) | One per affected occurrence side |

Layout warnings `card-overflow` / `zone-overflow` carry a `MeasurementOverflow` (§4.4.4) in the layout result; they are not `Diagnostic` codes and never enter `validateDocument` output.

## Appendix D — Oracle manifest entry shape (B4, normative skeleton)

```ts
interface OracleEntry {
  readonly id: string;              // e.g. "a5-semantic", "g0", "m2-model"
  readonly revision: string;        // commit sha or exact version; never a branch name alone
  readonly path: string;            // repository-relative or governed absolute path as recorded
  readonly sha256: string;          // full lowercase hex over exact file bytes
  readonly derived: Readonly<Record<string, unknown>>; // counts, folds, mappings, expected diagnostics
}
// Manifest: { entries: OracleEntry[], manifestDigest: string /* SHA-256 over RFC 8785 bytes of entries */ }
```

A gate resolves each entry by path, recomputes `sha256` over exact bytes, and refuses (fixture error) on any mismatch or missing entry before asserting `derived`. Mutable working-tree paths without a recorded sha256 are not oracle entries.
