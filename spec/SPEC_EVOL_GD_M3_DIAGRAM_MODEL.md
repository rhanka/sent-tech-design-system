# SPEC EVOL — GD-M3-DIAGRAM-MODEL: one metamodel across generic, archimate, bpmn, uml (r3)

| Field | Value |
| --- | --- |
| Status | Specification only. No implementation, no profile publication and no consumer switch-over is claimed by this document. |
| Date | 2026-10-25 (r3; r2 was 2026-10-24 at `8d1727a1`, r1 was 2026-10-23 at `b8f5982c`) |
| Branch | `spec/diagram-model-complete`, cut from `origin/main` |
| Deliverable of this lot | This file only: `spec/SPEC_EVOL_GD_M3_DIAGRAM_MODEL.md`. Nothing else is written, including nothing under `.track/`. |
| Language / tooling | This document is English. No network access is used by any lot defined here. No Python is used anywhere (implementation, tests, jobs, one-off scripts): the stack is Node/TypeScript and the native tooling already present. No attribution trailer is added to any commit. |
| Governance | G2 (owner decision 2026-10-19): Engram governs profiles, schemas, fixtures and migrations as data. The Design System (DS) retains and publishes the generic `@sentropic/diagram-core` executor, layout and rendering. Consumers pin profiles; no second diagram metamodel. |
| Pivot | `packages/diagram-core` (`SemanticDocument` / `ViewDocument`, transactional commands, versioned profiles) plus `bpmn-canvas` `profile-c14n/2`. This specification completes that pivot for every study family. It does not introduce a second model and it withdraws `architecture@1`. |
| Executor assumption | The `unique-attribute` reporting-order fix at `610c0353` (duplicates reported in UTF-16 id order, independent of insertion order; first id in the order is the reference, refs `[reported, reference]`, PR #193) is merged before M1 starts. M1 does not reimplement it; §4.3 keeps that order rule inside each scope. |
| Engram carrier | Engram work is carried by the gr-conductor session (repository `rhanka/engram`, local checkout `/home/antoinefa/src/graphify`). This repository defines the required Engram artefacts and the hand-off contract in §7; it does not write Engram code. |

## Owner orders

Owner order of 2026-10-23, verbatim:

> « je veux le modele de graph pas le graph hrpn … Pas de patchware engram doit avoir son modele complet selon la spec qui historiquement etait portee ici. »

Owner order of 2026-10-25, rejecting the r2 question « generic@2 vs architecture@1 », verbatim:

> « Attention on a deja cree une etude et un mode[le] pour les diagrammes cote sentropic que tu devrais reprendre. Il couvrait aussi bpmn. Tes mots demontre qu il y a eu un oubli majeur »

Effect on this specification, normative:

1. The deliverable is the **graph model**, not one consumer graph. The HRPN graph, the HRPN scenes and the governance central scene are acceptance instances of the model (§8), never its definition.
2. The design system is the **generic library**. Every rule below is stated for any consumer of the model. No rule names a consumer, a scene id, a zone id or a consumer tint vocabulary.
3. The model is **complete for the validated diagrams with zero consumer patches**. After M1, the following are defects, not supported patterns:
   - a preserved extension that carries standard card or zone slots (the measured instance is `hrpn.zone-slots@1`, `preserved-unvalidated`, one per zone);
   - a document-local type refinement that exists only to carry standard card slots (the measured instance is `hrpn-card`, an additive refinement of `node`);
   - a display title edited to dodge a global uniqueness rule (the measured instance is two zones titled « CI/CD » stored as « CI/CD · GENAI PCP PLATFORM » and « CI/CD · AIRBUS AWS », with the rendered title kept aside as `displayTitle`).
   A document that still needs one of these three to validate is evidence that the model is incomplete, and the gap is fixed in the profile or the executor, never in the consumer.
4. Engram carries the complete model as historically specified in this repository (`spec/SPEC_EVOL_GD_M2_MODEL.md`, `spec/SPEC_EVOL_GD_M2_DS_PRESENTATION.md`, `spec/SPEC_EVOL_GD_M2_CANVAS.md`, `spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md`): versioned profiles, typed attributes, views and occurrences, commands and transactions, migration, fixtures. §7 states what Engram holds and what this repository keeps. Zero preserved extension, zero local refinement for standard slots, zero name hacks is the acceptance criterion; §8 enforces it per instance.
5. **The r2 omission is corrected.** r2 treated « the complete model » as one profile and invented `architecture@1`, ignoring the existing `archimate@1`, `bpmn@1` and `uml@1` profiles and the owner-finalized governance-unification study. r3 reframes the complete model as the single metamodel covering every study family (§1). `architecture@1` is withdrawn and is never registered.

## Binding source: the governance-unification study

The binding source is `/home/antoinefa/src/sentropic/.tmp/governance-unification/study.md` (r10, owner-finalized 2026-10-19, sha256 `7e3a3d1cb863eafce347bceff2639d5fdbc12a6dc2515371b34c2524687c5335`). Every clause below that cites the study is traceable to that file at that digest. Two further owner sources in the same directory are binding and are pinned here at the digests computed from the files: `/home/antoinefa/src/sentropic/.tmp/governance-unification/owner-diagram-decisions-via-hcond.md` (owner verbatim arbitrations of 2026-10-18, sha256 `76eee3b4e91b34027c030c8c4c48006e0d387d224ffd4bd990085b557aa2a985`) and `/home/antoinefa/src/sentropic/.tmp/governance-unification/DS-DIAGRAM-MODULES-REQUIREMENTS.md` (final owner requirements for the two card modules, owner-validated 2026-10-21, validated on #711 at sentropic `4138a0ec`, sha256 `c65f5f3afc752b387d3ee2498f894fb6a8637fa7a845b9e0608b450b4325e944`). The project positions the study cites were also read when present under the same directory: `engram.md`, `decisions.md`, `reconciliation.md`.

What the study binds, for this lot:

- **§1.2 row 4 (line 47): no second diagram metamodel.** Keep `SemanticDocument` / `ViewDocument` (`@sentropic/diagram-core`) and the semantics of the existing profiles `generic@1`, `bpmn@1`, `archimate@1`, `uml@1`, plus bpmn-canvas `profile-c14n/2`. No competing entity-edge format.
- **§1.2 row 10 and §4.1: graph / layout / presentation as three layers.** Every diagram is a graph (nested, openable); every representation is a synthesis. `SemanticDocument` is the graph, `ViewDocument` plus the L8 layout is the layout, and presentation skills are the third layer. Atomic transactions; offline without CDN (the 32 MB order of magnitude for an embedded JS bundle is accepted and is not a ceiling).
- **N13 (around line 183): BPMN rendering and editing never lose extensions**, through the `bpmn@1` ↔ bpmn-moddle mapping (F1), DS mechanics and Engram governance.
- **§7 M4 (line 295) and §9 G2: Engram profiles pinned by digest and the DS engine qualified together.** G2 verbatim: « Engram governs profiles, schemas, fixtures and migrations. The Design System retains and publishes the generic @sentropic/diagram-core executor, layout and rendering. Consumers pin profiles; no second diagram metamodel. »
- **R-06 (line 312): no divergence** between bpmn-canvas, Focus, d2d and diagram-core, no loss of BPMN extensions, keep `profile-c14n/2` and fixture identity.
- **Owner arbitrations of 2026-10-18** (`owner-diagram-decisions-via-hcond.md`, sha256 `76eee3b4e91b34027c030c8c4c48006e0d387d224ffd4bd990085b557aa2a985`), verbatim and binding: « Tout diagramme est un graph et toute representation est une forme de synthese. Il faut bien modeliser diagramme layout et skills de presentation » — model (graph), layout and presentation skill stay three separate layers (§1.2, §1.3 layer tags); « diagrammes gigogne (ouvrables) » — nested, openable diagrams (§4.1, §4.4); our own JS implementations of open algorithms (§1.2); offline use with no CDN, embedded JS budget up to 32 MB (§1.2, §10).

DS sources for the historical model: `spec/SPEC_EVOL_GD_M2_MODEL.md`, `spec/SPEC_EVOL_GD_M2_DS_PRESENTATION.md`, `spec/SPEC_EVOL_GD_M2_CANVAS.md`, `spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md`, `spec/SPEC_RE_BPMN_JS_PARITY.md`; code `packages/diagram-core/src/` (`profile.ts`, `profiles/generic.ts`, `profiles/skeletons.ts` for the archimate/uml/bpmn skeletons, `validate.ts`, `view.ts`, `migrate.ts`). BPMN canonicalization: `/home/antoinefa/src/bpmn-canvas/src/profile/canonical.ts` (`profile-c14n/2`, sha256 `287d8cb87beb7384fc89a8d6141681010dcba50ee895aaadc3b31345541191ba` at inspection). Engram G0 contracts: `/home/antoinefa/src/graphify/.graphify/scratch/design/ontology-guardian/SPEC-G0-guardian-contracts.md` (sha256 `e6362445f87d6581ac31224c2dc44e15214b3a7debc2afff2b3d25b8b37ff8f6` computed from the file at r3 authoring; the four frozen vectors of §7.3.5 are unchanged at 186/206/86/320 bytes).

## 0. How to read this specification

- `SHALL` / `MUST NOT` state the proposed contract. A clause tagged `frozen-requirement` restates an owner-validated value from `DS-DIAGRAM-MODULES-REQUIREMENTS.md` (owner-validated 2026-10-21, reference render sentropic PR #711 merged as `4138a0ec`) and is not re-opened here. A clause tagged `measured-code` states a fact read from a pinned file, with its locator. A clause tagged `decision` states a technical choice settled by this specification; its rationale is recorded next to it and it is not an open question. §9 settles the architecture landing with evidence and asks nothing; there is no open owner question in r3.
- All card sizes are card pixels (CSS pixels at zoom 1). The atomic-card footprint is `460 × 200` in every state (`frozen-requirement`); §4.6 defines the state-dependent footprints and the fixed-axis policy that gives that sentence its exact meaning. No other size in this document is a card size.
- “Card” means the atomic-card presentation of a leaf entity. “Container” means the wrapping-container presentation of a container-family entity. Neither word names a family type: §1.3 states where each presentation lives. “Fold” always means view state (§4), never a semantic attribute.
- File paths are relative to this repository unless an absolute path is given. Engram paths are relative to `/home/antoinefa/src/graphify` unless stated otherwise.
- **Normative scope.** This specification is normative for three things only: (a) the shared metamodel and view contract (`SemanticDocument` / `ViewDocument`, occurrences, folds, measurement input, layout hints), (b) the per-family profile deltas declared as Engram data, and (c) the `diagram-core` / `diagram-canvas` executor surface that validates and lays out (a) and (b). Everything downstream — xyflow node forms, consumer replacement and switch-over, draw.io export, rich-text editing, re-connectable edges, BPMN editing and rendering — is **not** normative here. §10 keeps milestones M2–M6 as a roadmap with gates and pointers to the separately authorised specifications that own those surfaces (`SPEC_EVOL_DS_DIAGRAM_CARDS.md` for components, the L8 dossier for draw.io, Track `01M5F3XSAJC2H6S9ZREP7JFFJ6` for edges, RT-1 for rich text, `SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md` (A′) and `SPEC_RE_BPMN_JS_PARITY.md` for BPMN); no clause in §§3–8 depends on them, and no M1 gate requires them.

## 1. Reframe: one metamodel, every family

### 1.1 The single metamodel

`decision` — The complete model is the single metamodel (`SemanticDocument` / `ViewDocument` in `@sentropic/diagram-core`) covering every study family, not one profile. A family is a versioned profile declared as data and governed by Engram (G2). The executor is family-neutral: it holds mechanisms, never family semantics. `generic@1`, `archimate@1`, `bpmn@1`, `uml@1` and the `profile-c14n/2` canonicalization are five rows of one system, not five models.

```text
Engram data (governed, pinned by digest)
  generic@* | archimate@* | bpmn@* | uml@* | profile-c14n/2 | presentation fragment
        \         |           |         |            |              /
         +--------+-----------+---------+------------+-------------+
                  |  profiles declare types, relations, constraints
                  v
DS executor (family-neutral, published by the DS)
  SemanticDocument / ViewDocument + resolver, validation, commands,
  migration, canonical serialisation, scene, layout, measurement
                  |
                  v
Presentation skills (third layer, study §4.1)
  card / container / legend rendering, themes, pictogram registry
```

Consequences, normative:

- No second entity-edge format exists. A consumer that needs a new diagram kind declares a profile (or composes a governed stack) over this metamodel; it never invents a parallel document shape.
- A profile major is a governance event in Engram (new version, new digests, corpus, migration reference). It is never a new executor and never a new metamodel.
- `architecture@1` is withdrawn. It is not registered, not pinned and not migrated to. Architecture diagrams land as settled in §9.

### 1.2 Three layers (study §4.1, row 10)

| Layer | Carrier | Owner of the contract |
| --- | --- | --- |
| Graph (nested, openable) | `SemanticDocument`: entities, relations, ports, type definitions, resources, preserved extensions. No geometry. | Engram governs the profile data; the DS executor validates it. |
| Layout | `ViewDocument` (occurrences, groups, filters, presentation state) plus the deterministic L8 layout in `diagram-canvas`. Own JS strains; public/free algorithms reimplemented, never imported as a black box. | DS executor and layout. |
| Presentation skills | Card/container/legend rendering, themes, pictogram registry, Focus dossier rendering, BPMN synthesis views. Each representation is a synthesis of a sub-graph for one intent. | DS components and themes; family semantics never live here. |

Atomicity and offline follow the study: every mutation is one transaction over `SemanticDocument` / `ViewDocument` with immediate local recomputation, and every standalone bundle embeds its JS/styles with no CDN dependency.

### 1.3 Where each capability lives

The table is the reframe. “Shared” means the family-neutral metamodel/view contract executed by `diagram-core` / `diagram-canvas` for every family. “Profile” means family semantics declared as Engram data (types, relation matrix, constraints, limits). “Presentation fragment” means family-neutral presentation data governed once and composed with any family; it is data, but it is not family semantics, and it never enters an `archimate`, `bpmn` or `uml` type declaration as a family attribute.

**Layer tagging (owner arbitration of 2026-10-18, normative).** Every capability also states its layer — **model** (graph: `SemanticDocument`, no geometry), **layout** (`ViewDocument` plus the L8 layout in `diagram-canvas`), or **presentation skill** (card/container/legend rendering, themes, pictogram registry). A capability that spans layers is split into its per-layer rows below; no presentation or layout field may sit in the graph model. Concretely: `SemanticDocument` carries only model-layer fields; fold state, footprints, measurement results, layout hints and authored-summary activation are layout-layer data and never semantic attributes; slot rendering, tone-to-token resolution and icon drawing are presentation-skill behaviour and never family semantics. The “Layer” column is part of the contract: an implementation that stores a layout or presentation field in `SemanticDocument`, or a family attribute in the presentation fragment, fails the leak rule.

| Capability | Layer | Shared metamodel / view contract (executor mechanism) | Profile (family semantics, Engram data) | Presentation fragment (family-neutral data) |
| --- | --- | --- | --- | --- |
| Atomic card slots (stored text) | **model** | Typed-attribute mechanism over `SemanticDocument`; the executor validates any declared text slot generically (§3.2, §5.8). No geometry is stored. | A family declares leaf types (for example `node`, ArchiMate elements, BPMN flow nodes, UML classifiers). It declares no card slot as family semantics. | Slots `name`, `kicker`, `body`, `detail`, `footer`, `icon`, `tone`, `legendRef` with the bounds of §3.2, available to any leaf type that composes the fragment. The stored strings are model data; their drawing is a separate presentation row. |
| Atomic card drawing | **presentation skill** | No executor field. The executor supplies the measured `LineLayout` (§4.6) the renderer consumes; it never draws. | No family content. | Rendering of the slots above (typography, accent bar, rule, footer pinning) is owned by `SPEC_EVOL_DS_DIAGRAM_CARDS.md` (M2, §10). An unknown `icon` name is a rendering diagnostic, never a semantic refusal (§3.3). |
| Wrapping container slots (stored text) | **model** | Containment tree over `SemanticDocument` (§3.4); stored header text is validated as typed attributes. | A family declares which types may contain (for example generic `container`, BPMN `subProcess`/`participant`, UML `package`, ArchiMate `grouping`). | Slots `name`, `kicker`, `subtitle`, `footer`, `icon`, `tone`, `legendRef` with the bounds of §3.2, available to any container-family type that composes the fragment. |
| Wrapping container drawing (expanded frame / collapsed card) | **presentation skill** | No executor field. Fold state that selects the form is layout data (row below); the frame drawing itself is a skill. | No family content. | One header component for expanded and collapsed forms, collapsed form at the atomic footprint, owned by the component specification (M2/M3, §10). |
| Containment by any container, including refinements | **model** | One shared cycle-safe resolver (§5.1); family satisfaction for every `entityTypes` role (§5.2); tree/dag checks read hierarchy ids from constraint data. | Each family declares its hierarchy relation(s) and parent family roots as constraint data (§3.4, §5.4). BPMN composition slots (A′ K4) are the BPMN instance of the same rule. | No presentation content. |
| Scoped uniqueness | **model** | Generic grouping by scope key (`document` / `siblings` / `withinType`) with the PR #193 order rule per scope (§5.3). | Each family declares which attribute is unique in which scope. `generic` declares legend scopes only; no family declares a global display-title uniqueness. | No presentation content. |
| Labelled relations (stored label) | **model** | Relation declarations and label validation are semantic; the label is content, never a routing instruction (§3.5). | Each family declares its relation types, roles, cardinalities and label bounds (ArchiMate matrix, BPMN flows, UML relations, generic `link`/`association`). | No presentation content in the label itself. |
| Styled relations (stored style) | **model** | Semantic `strokeStyle` is a typed relation attribute; the view override is layout data (next row). Absent means `solid` (§3.5.1). | Families declare whether a relation type carries the slot; the value space (`solid`/`dashed`) is generic. | The token-to-stroke mapping at draw time is presentation behaviour; the stored key is model data. |
| Relation drawing and folded projection | **layout** | Relation occurrence, folded projection (§4.4), view `strokeStyle` override, derived aggregation (§4.5). Never a semantic attribute. | No family declares projection state. | Projected strokes reuse the relation presentation; aggregation grouping is computed at render time and never stored (§4.4.5). |
| Legend as data (stored legend) | **model** | Legend binding resolution, scoped uniqueness of `category`/`order`, `order` sorting (§3.6). | No family owns the legend types. A document of any family may carry a legend; family profiles do not redeclare it. | Types `legend` / `legend-key` with header slots, `category`, `token`, `description`, `order` (§3.6), composed with the document's family profile. |
| Legend drawing | **presentation skill** | No executor field. | No family content. | Swatch/token rendering and header drawing, owned by the component specification (M2). |
| Folds and folded projection | **layout** | `VisualGroup.collapsed` bound per occurrence, outermost-visible representative, recomputation from a retained source view, folded geometry composition (§4.4). Fold is view state only. | No family declares fold state. A family never stores `collapsed` as a semantic attribute in the completed profiles. | Collapsed form reuses the card presentation (§4.6). The fold control itself is an M3 interactive behaviour (§10). |
| Fixed footprints | **layout** | Footprint resolution from (type, view state), `fixedAxes` policy, docking overflow (§4.6). Footprints are never stored in `SemanticDocument`. | A family declares no footprint. | Footprints: leaf/collapsed `460 × 200` (`both`), legend-key height `64` (`height`), expanded computed (`none`) (§4.6). The values are frozen requirements; the box drawing is presentation. |
| Measurement | **layout** | `LineMeasurer` request/result, per-slot measurements for every slot, call sequence (§4.6). Results are layout output, never semantic data. | No family declares metrics. | Slot allocations and roles (`kicker`, `title`, `body`, `detail`, `footer`, `subtitle`, `legend-label`, `edge-label`) bound the measurement; rendering consumes the same `LineLayout` (M2 gate). |
| Layout hints | **layout** | `LayoutHints` (ordering, recursive grouping, stretch, gaps) as engine input (§4.7). Hints are per-call authored data, never stored in the semantic document. | No family declares hints. | No presentation content. |
| Authored summaries (definitions) | **layout** | `summaryLabels` definitions are `ViewDocument` data (§4.5.1); activation is derived per folded state (§4.5.2) and never stored. | No family declares summaries. | Authored label text is view data in the document language (§3.7); its drawing on the aggregate stroke is presentation behaviour. |
| Occurrences | **layout** | `ViewDocument` occurrences (entity/relation/port), N occurrences per entity, scene conservation. M2 §3.4 is unchanged. Occurrence geometry lives only in the view/layout. | A family declares what may be drawn (types), never how a drawing is identified. | No presentation content. |

**Leak rule (normative).** Card and legend presentation SHALL NOT leak into family semantics. Concretely: completing `archimate@1`, `bpmn@*` or `uml@1` adds no `kicker`, `body`, `detail`, `footer`, `icon`, `tone`, `subtitle` attribute to a family type, adds no `legend`/`legend-key` family type, and adds no card footprint to a family declaration. A family diagram that is drawn as cards composes the presentation fragment with its family profile at the document level (`profileRefs` plus the fragment pin in the stack, §7); the family profile bytes and digest do not contain the fragment. The synthetic-profile gate of §5.4 proves the executor contains no family or presentation literal.

### 1.4 What “complete” means per family

| Family | Complete means | Not claimed |
| --- | --- | --- |
| `generic` | The successor of `generic@1` (§3.8) with native card/container slots via the presentation fragment, legend, scoped uniqueness, family parents, folded views and migration from `generic@1`. | No BPMN, ArchiMate or UML conformance. |
| `archimate` | `archimate@1` completed from its skeleton (§3.9): element catalogue per layer/aspect, the versioned relation/source/target matrix, grouping containment, viewpoints as view filters. Card drawing composes the presentation fragment. | No card anatomy as ArchiMate semantics; no Open Group exchange claim beyond the declared namespaces. |
| `bpmn` | The A′ completion (§3.10): profiles generated from bpmn-moddle descriptors (`bpmn@2` family), F1 moddle JSON ↔ `DiagramState` bijection, complete DI, extension preservation. `bpmn@1` stays readable as a skeleton (§6). | No rendering or editing parity (owned by `SPEC_RE_BPMN_JS_PARITY.md` lots); no second BPMN evaluator beside bpmn-canvas/d2d (§6). |
| `uml` | `uml@1` completed from its skeleton (§3.11): classifiers, properties, operations, association/generalization/dependency with multiplicities, package containment. Activity/sequence/state are separate profiles when authorised. | UML does not reduce to PlantUML text; the pivot is a codec concern (GD-M4). |
| `profile-c14n/2` | Unchanged canonicalization (§3.12). Identity is the c14n bytes → SHA-256; no re-canonicalization by any catalog or executor. | It is not a profile and not an evaluator; it never validates a document. |

### 1.5 Requirements of `DS-DIAGRAM-MODULES-REQUIREMENTS.md` mapped to this model

Source: `/home/antoinefa/src/sentropic/.tmp/governance-unification/DS-DIAGRAM-MODULES-REQUIREMENTS.md` (sha256 `c65f5f3afc752b387d3ee2498f894fb6a8637fa7a845b9e0608b450b4325e944`, owner-validated 2026-10-21 on #711 at sentropic `4138a0ec`). Every requirement below maps to a §1.3 capability row (with its layer) or is explicitly out of M3 normative scope with its roadmap pointer (§10). No requirement is left unmapped and no M1 gate depends on an out-of-scope row.

| Requirement (paraphrased; values verbatim where frozen) | §1.3 capability / layer | Disposition in this specification |
| --- | --- | --- |
| Pivot format is the diagram-core document; Engram provides the profiles; no second model | Single metamodel (§1.1) — **model** | Normative here: §§1, 3, 7. |
| Atomic card fixed `460 × 200`, never grows with text; square corners; accent bar/border | Fixed footprints — **layout** (box); card drawing — **presentation skill** | Footprint normative here (§4.6.1); corner/accent drawing owned by `SPEC_EVOL_DS_DIAGRAM_CARDS.md` (M2). |
| Card header: icon 70, icon→text gap 6, kicker 22/400 uppercase, title 32/700 lh 1.3; body 24/400 lh 1.3, left inset +4 (14 to first glyph); rule 1 px staying 1 screen px at every zoom; footer pinned (bottom 9.25); no ellipsis ever, overflow diagnostic instead | Atomic card slots — **model** (stored strings); measurement — **layout**; drawing — **presentation skill** | Slot bounds and measurement/overflow contract normative here (§§3.2, 4.6); typography, rule and pinning rendering owned by the component specification (M2); the no-ellipsis rule is enforced here as the overflow result (§4.6.4). |
| Wrapping card: one header component for all zones; same typography (title 32/700, kicker 22/400 uppercase not bold, subtitle 24/400); icon 70 same as cards; kicker carries the package name, title without package prefix; header follows actual content; expanded subtitle wraps under the icon; collapsed subtitle centred with 16 px side margins, no justification/stretching; side-by-side frames share top/height, rows/columns aligned 0 px deviation | Wrapping container slots — **model**; footprints/measurement — **layout**; header drawing — **presentation skill** | Slot and prefix rules normative here (§3.2.2: stored title never carries the prefix); footprint and centred-summary measurement normative here (§§4.1, 4.6); header component and alignment rendering owned by the component specification (M2), alignment asserted by its geometry gate. |
| Icons: one blue duotone family on its own subpath, 64-unit viewBox, includes `brain`/`robot`, never Lucide inside cards | Atomic/container slots `icon` — **model** (registry name only); drawing — **presentation skill** | Name-only storage and shape grammar normative here (§3.3); the registry asset itself is DS presentation data (M2). |
| Both modules usable as xyflow (Svelte Flow) custom nodes with handles, and standalone | Occurrences — **layout** contract only | **Out of M3 normative scope.** Roadmap M4 (§10), owned by its own specification. No clause in §§3–8 depends on xyflow node forms. |
| Both modules embeddable in graphs and editable Tiptap-style | — | **Out of M3 normative scope.** Roadmap M6 (§10), gated on RT-1. No M1 gate requires editing. |
| Expanded zone spacing: subtitle→rule 4 px; rule→children 16 px; children→bottom 16 px; edges route in gutters/frame/outside, never reserve empty height | Fixed footprints / measurement — **layout** | Spacing values normative as layout insets here (§4.6.1, §4.6.3); edge routing is the layout/routing surface of M1 (§4.6) with interactive re-routing in M3. |
| Interactive fold/unfold in place (+/− DS IconButton, `:focus-visible` ring only), collapsed at `460 × 200` at every nesting level, reflow without collisions, edges re-route, Expand all / Collapse all, per-zone chips | Folds and folded projection — **layout** (state and projection); control rendering — **presentation skill** | Fold state, projection and footprint normative here (§§4.1, 4.4, 4.6); the interactive controls and reflow behaviour are roadmap M3 (§10) over that surface. |
| Performance: no continuous work at idle; worst interaction under 1.8 s | — (system property) | **Out of M3 normative scope as a model clause.** The budget is asserted by the M3 behaviour gate over its enumerated finite interaction corpus (§10); the r2 “600/240” totals are withdrawn there as unenumerated prose. No timeout is ever raised. |
| Edges re-connectable and labels editable inline as host-applied proposals (Track `01M5F3XSAJC2H6S9ZREP7JFFJ6`) | Labelled relations — **model** (stored label only) | **Out of M3 normative scope.** Roadmap M6 (§10). The stored label contract is normative here (§3.5); the editing interaction is not. |
| Offline without CDN; own JS strains for open algorithms; atomic transactions | Three layers (§1.2) — cross-layer system property | Offline/atomicity normative as executor properties here (§§1.2, 5); bundle composition (32 MB order of magnitude, not a ceiling) is a delivery property recorded in §10, never a model field. |


## 2. Starting point, measured

Every fact below carries its locator. Where a measurement contradicts the completed model, the completed model is the fix and the measurement is the evidence.

### 2.1 The historical model (M2) already specifies the shape

`spec/SPEC_EVOL_GD_M2_MODEL.md` (sha256 `5e7798a451c5b92cbbde6fbf85ea5f890c32c863ece3c73e5d9772efa9cff078`) settles the core and this lot does not re-open it: a typed semantic core with versioned profiles, not a property bag (decision D1-A, §1 of that spec); broad read-only import with unvalidated content kept as `preserved-unvalidated` and never promoted to a fact (decision D3-C); seven nominal, non-interchangeable reference types; a `SemanticDocument` that excludes positions, camera and components; a `ViewDocument` of occurrences, visual groups, filters and persistable presentation state; transactional commands with an inverse or a documented reason; versioned schema migration that keeps the original and refuses an unknown major in write; fixtures including named rejected cases with asserted diagnostics.

`spec/SPEC_EVOL_GD_M2_MODEL.md` §3.4 is load-bearing: an entity has **N occurrences in one view** and occurrences in several views; removing an occurrence removes a drawing, nothing else; removing the entity demands an explicit policy. §4 is written against that rule, not against a one-occurrence assumption.

`spec/SPEC_EVOL_GD_M2_DS_PRESENTATION.md` and `spec/SPEC_EVOL_GD_M2_CANVAS.md` settle the presentation and scene boundaries this lot respects: the DS layer never depends on the diagram model, the headless scene owns the world→device transform and the hit test, and `diagram-core` stores no transform. M1 does not move any of those boundaries.

`spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md` (A′, sha256 `7b29e147873287402a271d8b95e86bc0d39cd320152bbd8c6b1f6ef4c6e87505`) adds the kernel direction this lot reuses for hierarchy families: type constraints are satisfied by the named type or any subtype, and containment is a structural parent link, not a relation endpoint competing with a reference (§5, §6 K1/K4 of that spec). The executor change of §5.2 is the application of that already-decided rule, generalised by the shared resolver of §5.1. A′ also decides the BPMN completion path (§3.10): profiles generated from moddle descriptors, F1 as the exchange pivot, unknown-namespace content preserved, and `bpmn@1` superseded by the generated family (§6.1 keeps `bpmn@1` readable; it does not promise an automatic `bpmn@1` → `bpmn@2` document migration).

### 2.2 The current executor, and the gaps it proves

Current code is `packages/diagram-core/src/` at the branch base (`8d1727a1`). Measured facts:

- `generic@1` is the only `complete` profile (`packages/diagram-core/src/profiles/generic.ts:17`, sha256 `b19967fe65483abdbf0e271f197e13691904e4b087c1542de23c52e2ad4f45c3`). `node` declares `name` (required, ≤ 200), `state`, `weight`, `duration`, `createdAt`, `pinned`, `tags`, `owner`. `container` declares `name` (required, ≤ 200) and `collapsed`. Neither declares `kicker`, `body`, `detail`, `footer`, `icon`, `subtitle` or `tone`, and `validateDocument` refuses an undeclared attribute as `attribute-not-in-schema` (`packages/diagram-core/src/validate.ts`, `packages/diagram-core/src/attributes.ts`). Standard card slots therefore cannot be stored as attributes today. **Gap C (card slots).**
- The three skeletons live in `packages/diagram-core/src/profiles/skeletons.ts` (sha256 `0a01fd2569e68c2b99ca754f28dc7cbbbd9a1d491ffa9981161cae3bbf56b54e`). `bpmn@1` declares 7 entity types, 1 port type, 4 relation types (including `flowElementContainment`); `archimate@1` declares 3 entity types (`element`, `junction`, `grouping`), no port types, 11 relation names with arity only; `uml@1` declares 5 entity types, no port types, 4 relation types (including `packageContainment`). Each carries `completeness: "skeleton"` and notes that list what is NOT declared. No conformance is claimed for any of the three. **Gap F (family completion).**
- The `contains` parent role accepts exactly `entityTypes: ["container"]` (`packages/diagram-core/src/profiles/generic.ts:78`), and the validator compares the target type by strict equality (`packages/diagram-core/src/validate.ts:329`, `role.entityTypes.includes(target.type)`). A document refinement of `container` therefore cannot parent: the diagnostic is `endpoint-target-not-allowed`. The same strict-equality test governs every role of every profile, so a refined BPMN `subProcess`, a refined ArchiMate `grouping` and a refined UML `package` fail identically. **Gap 1 (family parents).**
- `generic@1` declares `{ kind: "unique-attribute", entityType: "container", attribute: "name" }` globally (`packages/diagram-core/src/profiles/generic.ts:102`), enforced over every container in the document (`packages/diagram-core/src/validate.ts`, `validateConstraints`). Two zones legitimately titled « CI/CD » collide as `unique-attribute-violation`. **Gap 2 (global uniqueness).**
- `effectiveEntitySchemas` (`packages/diagram-core/src/validate.ts:48`) resolves **one** document refinement level only: a profile type returns its attributes; a document definition returns `[...base.attributes, ...definition.attributes]` where `base` must be a directly declared profile type. A refinement of a refinement fails with `unknown-entity-type` before endpoint-family acceptance matters, and the type-definition validation loop likewise requires a directly declared profile base. Canvas `readGraph` (`packages/diagram-canvas/src/layout/graph.ts`) resolves one level the same way. **Gap 1b (multi-level refinement).** §5.1 specifies the single shared resolver that closes it.
- The text schema (`packages/diagram-core/src/attributes.ts`, `ScalarSchema` arm `text`) supports only `maxLength`. There is no declarative carrier for a minimum length, a character grammar or a pattern, and the quantity schema supports units only (no integer or bound carrier). The key-shape rule of §3.3 and the legend-order rule of §3.6 therefore have no implementation contract today. **Gap 4 (declarative constraints).** §3.3, §5.8 add the carriers.
- Because of gaps 1 and 2, the measured HRPN target (`/home/antoinefa/src/airbus-genair-hrpolnav/docs/architecture/hrpn/engram/`, `README.md`, `build-engram.mjs`, `S2-target.semantic.json` sha256 `46f64154bb6592d49ccda5633b2c4d4205fb1c6752ef218be31d6757923ecf91`) stores card slots in a document-local refinement `hrpn-card` (additive refinement of `node`, six text attributes), stores zone slots in 19 preserved extensions `hrpn.zone-slots@1` (`preserved-unvalidated`, source JSON with `kicker`, `subtitle`, `footer`, `icon`, `tint`, `displayTitle`), and stores the two « CI/CD » zones under suffixed names. The documents validate with zero diagnostics today precisely because the patches route around the gaps. **Gap 3 is the pair of workarounds; gaps 1 and 2 are its causes.**
- Fold state today has two carriers: the semantic `container.collapsed` attribute and `VisualGroup.collapsed` in the view (`packages/diagram-core/src/view.ts:88`). The component specification (`spec/SPEC_EVOL_DS_DIAGRAM_CARDS.md` at `97ecf69b`, §4.3) already decides the view carrier is the fold state; §4.1 below makes that a model rule and removes the semantic carrier from every completed profile.
- The layout engine (`packages/diagram-canvas/src/layout/`) lays out `generic@1` only, reads only the `name` attribute per entity (`packages/diagram-canvas/src/layout/graph.ts`, `readGraph`), measures text through `TextMeasurer = (text, role) => TextSize` with roles `node | container-title | edge-label` (`packages/diagram-canvas/src/layout/types.ts:28`), and enlarges nodes for docking demand (`packages/diagram-canvas/src/layout/place.ts`, `packages/diagram-canvas/src/layout/engine.ts`). It accepts no fold input, no per-entity footprint and no measured header input, and it emits `groups: {}`. The measurer receives `(text, role)` and returns width/height: there is no entity measurement input, no available wrapping width, no toggle allocation and no shared line-layout result. **Gap M (measurement).** §4.6 specifies the replacement.
- `packages/diagram-canvas/src/visibility.ts` already evaluates `VisualGroup.collapsed`: a member of a collapsed group is excluded as `group-collapsed`, a relation whose endpoint is hidden as `endpoint-hidden`, with every exclusion reported. The scene (`packages/diagram-canvas/src/scene.ts`) conserves occurrences (every occurrence is an item or an exclusion, exactly once). §4.4 keeps this cascade and adds the folded-edge projection it currently cannot express.
- `ViewDocument.revision` (`packages/diagram-core/src/view.ts`) is defined as “the document revision this view was last changed at; never ahead of the document”, and `validateView` refuses `view.revision > document.revision` as `revision-divergence` (`packages/diagram-core/src/validate.ts:814`). The supplied HRPN view at revision 1 against a document at revision 1 validates; incrementing the view to 2 for a fold produces `revision-divergence`. **Gap R (fold revision).** §4.1 fixes the meaning.
- Every profile-bearing record carries its own `profile` field: `Entity.profile`, `Relation.profile`, `SemanticPort.profile`, `TypeDefinition.profile` (`packages/diagram-core/src/document.ts:28–84`), plus the document-level `profileRefs`. Replacing `profileRefs` alone therefore leaves four record families pinned to the old profile. **Gap Mig (profile migration).** §3.13 enumerates every rewrite.

### 2.3 The review blockings this specification carries forward

Independent review `scratchpad/rev/dcards-rev1.out` on the component specification, two blockings, restated as model requirements and carried into r3 together with the pass-2 findings that extend them (§11):

- **Blocking 1 — folded edge projection cannot produce a valid `ViewDocument`.** Retargeting a relation occurrence whose semantic endpoint sits inside a collapsed container (the review example: `CHAT → TOPIC` drawn to collapsed `MSGZ`) produces `occurrence-endpoint-mismatch`, because `packages/diagram-core/src/validate.ts` requires the drawn occurrence to draw exactly a semantic endpoint target. §4.4 defines the projected endpoint as view data with occurrence-level provenance, selects the outermost visible collapsed ancestor, and recomputes the projection from a retained source view on every transition. Every folded output SHALL pass `validateView`.
- **Blocking 2 — the engine contract lacks the fixed-footprint measurement input it promises.** No per-entity footprint or measured header input exists, and placement enlarges nodes for docking, contradicting the fixed `460 × 200` card. §4.6 defines the exact measurement types and call sequence, state-dependent footprints, the fixed-axis policy and the overflow result; §5.6 assigns the implementation. A measurer that only observes role calls is explicitly insufficient (§4.6.5).

The same review records (item 4) that the three gaps of §2.2 do not justify weakening generic executor validation. This specification follows that: gaps 1 and 2 are closed by making the rules mean what they should mean for every profile (family acceptance through the shared resolver, scoped uniqueness), not by exempting one consumer.

## 3. The completed profiles as Engram data

The semantic model remains the M2 model: a `SemanticDocument` (identity, schema version, monotonic revision, declared profiles, document type definitions, entities, relations, semantic ports, resources, preserved extensions) and no geometry. This section declares the completed profile content per family and the shared presentation fragment. Persisted-shape impact is gathered in §3.13: the additions are profile data and the view fields of §4.4/§4.5; the only semantic removal in the generic successor is the `container.collapsed` attribute, and the BPMN completion follows the A′ schema-major path of §3.10.

### 3.1 Reading the profile tables

Each family table lists entity types, port types, relation types and constraints. “Container family” is a declared property (`container: true` on the type declaration, §5.2), never an inference from an id. A document type definition that refines a container-family type inherits the capability through its base chain as resolved by the shared resolver (§5.1); a refinement of a leaf type never acquires it. Abstract types remain non-instantiable, as today.

The presentation fragment (§3.2–§3.3, §3.6) is not repeated inside each family table. A family type that is drawn as a card composes it at the document level; the family declaration itself does not gain the slots.

### 3.2 Presentation fragment: atomic-card slots

All slots are typed attributes validated against the composed effective schema, exactly as M2 requires: a value carries its kind, an undeclared attribute refuses as `attribute-not-in-schema`, and no slot is ever carried by an extension or a free property bag. Length bounds are set so the measured validated corpus fits without moving the frozen geometry; a longer text is a wording defect reported by measurement (§4.6), never a reason to enlarge a card.

#### 3.2.1 Atomic card (leaf presentation)

| Attribute | Kind | Required | Meaning (presentation-neutral) |
| --- | --- | --- | --- |
| `name` | text ≤ 200 | yes | Title. The single identity-adjacent display string; it is content, never parsed, split or prefixed by an executor or a renderer. For family types the same slot name is the family name attribute where the family already declares it; composition does not duplicate it. |
| `kicker` | text ≤ 80, key-shaped where §3.3 applies | no | Short code or family line above the title (for example a service code). Display case is a rendering transform under the host locale; the stored string is the authored string. |
| `body` | text ≤ 400 | no | First body line (function line). One line of content; wrapping is measurement, not storage. |
| `detail` | text ≤ 400 | no | Second body line (detail line), rendered in the secondary text role. The `body` / `detail` split carries the line role in the model, so measurement, rendering and editing read the same role. |
| `footer` | text ≤ 120 | no | One pinned footer line (for example an owning service). Absent means no rule and no footer are drawn. |
| `icon` | text ≤ 40, key grammar (§3.3) | no | Pictogram registry name (for example `server`, `brain`, `robot`). A name, never SVG data, never a path. An unknown name is a rendering diagnostic, not a semantic refusal (§3.3). |
| `tone` | text ≤ 40, key grammar (§3.3) | no | Tone category key (for example `neutral`). A key into the document legend (§3.6) when the category-membership constraint applies, otherwise consumer category data; never a colour value. Absent means the neutral category. |
| `legendRef` | reference, `refKind: "entity"` | no | Optional binding to the legend entity against which `tone` resolves (§3.6.3). Validated as a reference; family membership of the target is checked by the generic mechanism of §5.4. |

The `generic@1` general attributes `state`, `weight`, `duration`, `createdAt`, `pinned`, `tags` and `owner` carry over unchanged on generic `node`. They are not card chrome and no card renderer is required to display them. Other families keep their own general attributes; the fragment adds only the rows above.

Body cardinality (`decision`): a leaf card stores at most the two body lines above. The frozen card anatomy allocates exactly two body lines; a third line has no allocation to measure against and would reintroduce growth-by-text. Content needing more lines belongs in a container's `subtitle` (wrapped, §3.2.2) or in a child card. A profile that later needs longer leaf prose does so by a new major, not by widening these bounds silently.

#### 3.2.2 Wrapping container (container presentation)

| Attribute | Kind | Required | Meaning (presentation-neutral) |
| --- | --- | --- | --- |
| `name` | text ≤ 200 | yes | Title **without** any package prefix. A stored title that embeds a prefix (for example « H2A · … ») is producer content to migrate, never a string a renderer splits. |
| `kicker` | text ≤ 80 | no | Package or family name carried by the header (for example `H2A`, `ENGRAM`). Same slot shape as the card kicker, so one header measurement and one header component serve both presentations. |
| `subtitle` | text ≤ 600 | no | Wrapped description under the header when expanded; the centred summary content when collapsed (§4.2). One string; line breaking is measurement. |
| `footer` | text ≤ 120 | no | Footer line shown by the collapsed card form (rule plus pinned footer). Carried as content when expanded; expanded frames draw no footer rule at the frame bottom. |
| `icon` | text ≤ 40, key grammar (§3.3) | no | Pictogram registry name, same registry and same slot rules as the card icon. The container icon box is the card icon box (`frozen-requirement`: same size for groups and cards). |
| `tone` | text ≤ 40, key grammar (§3.3) | no | Tone category key, same category space as the card tone. One key, one token resolution in both the expanded and collapsed forms, subject to §3.6 binding. |
| `legendRef` | reference, `refKind: "entity"` | no | Optional legend binding, as on the card. |

No completed profile declares a semantic `collapsed` attribute. The `generic@1` boolean is removed by the generic successor (§3.8, §3.13): fold is view state (§4.1), two views of one document fold differently, and a fold never bumps the document revision. BPMN collapsed sub-process state and UML/ArchiMate equivalents, where a family needs a semantic collapsed concept, are family attributes with family names; they are never the view fold carrier.

#### 3.2.3 What a slot never carries

- No colour value (hex, rgb, token value) is stored in any slot. Colour enters only as a category key (`tone`, legend `token` name in §3.6) resolved through design tokens at render time.
- No geometry (size, position, folded height) is stored in any slot. Geometry is view data (§4).
- No markup, no SVG, no URL and no executable content is stored in any slot. Imported content that a profile does not validate keeps the M2 levels `validated | preserved-unvalidated | unsupported` and is never promoted to a slot value.
- No language-specific string is stored by the profile or the executor. Slots store authored content in the document's language; §3.7 states the localisation rule.

### 3.3 Icon and tone: registry names, category keys, and declarative text constraints

`decision` — `icon` and `tone` are **open key spaces with a closed shape**, not closed enumerations in any profile.

- Shape: a key is 1–40 characters matching the language-neutral key form (lowercase ASCII letters, digits and hyphen, starting with a letter). The executor enforces the shape and the length; it does not enumerate the keys, because the pictogram registry and the tone category set are rendering and theme data that evolve without a profile major.
- **Declarative carrier.** The shape is not prose: the text schema gains declarative constraints, validated generically by `attributes.ts` (§5.8). A text attribute schema MAY declare:
  ```ts
  { kind: "text", maxLength?: number, minLength?: number,
    pattern?: string /* anchored RegExp source, ASCII, no flags */,
    patternName?: string /* stable name recorded in diagnostics, e.g. "key" */ }
  ```
  The fragment declares `icon` and `tone` (and `legend-key.category`, `legend-key.token` under their own grammars below) with `minLength: 1` and `pattern: "^[a-z][a-z0-9-]*$"` (called `key` in diagnostics). `token` declares `patternName: "token-name"` with pattern `"^[a-z][a-z0-9-]*(\\.[a-z][a-z0-9-]*)*$"` (dot-separated token path segments; the escaped dot is part of the stored pattern source), `minLength: 1`, `maxLength: 80`. A value that violates `minLength` or `pattern` refuses as `text-pattern-mismatch` (diagnostic code, §5.8, Appendix C) with `details: { pattern: <patternName>, length, maxLength? }`; the existing `text-too-long` code is unchanged for `maxLength`. A minimum-length failure without a pattern declares `patternName: "min-length"` and reports the same code with `details: { pattern: "min-length", length, minLength }` (the literal arm of Appendix C). Empty, uppercase, whitespace-bearing and colour-shaped values (`#fff`, `rgb(…)`) therefore refuse at semantic validation, while a well-formed but unknown icon name still validates (shape only) and is handled at render time. Token-name syntax is defined independently of the key grammar, so the two patterns are tested separately (§5.8): a dotted name is token-only; a single-segment hyphenated key satisfies both grammars and that overlap is asserted, never treated as a failure.
- Icon resolution: the renderer resolves `icon` against the design-system pictogram registry delivered on its own subpath (one duotone family, 64-unit viewBox; the validated set includes `brain`, `robot`, `server`, `people`, `window`, `link`, `db`, `shield`, `cloud` and the remaining glyphs of the validated scenes). An unmapped name draws no icon, collapses the icon slot and raises the rendering diagnostic `card-icon-unknown` / `zone-icon-unknown`; it does not refuse the document. Semantic validation therefore stays stable when a glyph is added.
- Tone resolution: the renderer resolves `tone` through the tone-token mapping in force (theme tokens, never a component-local colour). When the document declares a legend and the composed stack declares the category-membership constraint (§5.4), every non-neutral `tone` value in the document SHALL equal a declared legend category key under the binding rule of §3.6.3; §5.4 implements that check generically as `tone-category-unknown`. Without the constraint, a tone key is consumer category data and the executor checks its shape only. The validated HRPN category keys (`genair`, `specific`, `added`, `removed`, `risk`, `custom`, `outside`) and the governance keys (`neutral`, `proposal`, `identity`) are therefore all storable without a profile change, and none of them is named by any family profile: they enter as legend data (§3.6) in each corpus instance.

### 3.4 Containment: one hierarchy mechanism, family hierarchies as data

Containment is the single hierarchy mechanism of the metamodel. Each family declares its own hierarchy relation(s) as data; the executor holds no hierarchy literal.

1. **One mechanism, family relations.** A hierarchy is declared by a `hierarchy` constraint (`relationType`, `hierarchyId`, `parentRole`, `childRole`, §5.4) plus the relation declaration's `hierarchy` field. The generic successor declares `contains` / `containment`; BPMN declares its containment slot forest (A′ K4) and `flowElementContainment` during transition; ArchiMate declares grouping containment; UML declares `packageContainment`. Business containment, processing hierarchy and visual grouping stay distinct, as in M2: `VisualGroup` membership is not containment, a `link` is not containment, and no second hierarchy mechanism is added.
2. **Family parents.** A hierarchy parent is accepted exactly when the target's effective type — as resolved by the shared chain resolver of §5.1 — is in the container family named by the `parent-family` constraint for that hierarchy (its base chain contains a type declared `container: true`). The `child` role accepts any declared entity type unless a `children-restricted` or inverse-parent constraint (§5.4) narrows it. A refined container therefore parents with no extension, no second relation type and no profile change, in every family. The executor mechanism (effective-type resolution over the base chain) is specified in §5.1–§5.2 and applies to every `entityTypes` constraint, not only to hierarchy parents.
3. **Tree rule.** Each child has at most one hierarchy parent per hierarchy; a second parent refuses as `hierarchy-multiple-parents`; any cycle refuses as `hierarchy-cycle` with its members. Both diagnostics exist today and keep their codes. A family that declares `shape: "dag"` allows several parents and still refuses cycles.
4. **Nesting depth.** Depth is the number of hierarchy ancestors (a top-level entity has depth 0). No completed profile imposes a depth cap below its entity limits: nesting is bounded only by acyclicity and by the profile limits (§3.8–§3.11). A collapsed container has the atomic footprint at every depth (§4.6). Executors and layout SHALL traverse containment iteratively or with an explicitly bounded stack, so depth is a data property, never a call-stack limit. (Measured need: the validated scenes nest to depth 4; the rule deliberately allows more rather than encoding today's deepest scene as a limit.)
5. **Occurrence independence.** Containment is semantic. A container may be drawn expanded in one view and collapsed in another, and a child may have occurrences in a view where its parent has none (the drawing is then placed by the view, and §4.4 governs its edges). Deleting a container entity still requires the explicit occurrence / relation / port policy of the M2 command contract; nothing in this section adds a silent cascade.

Document type definitions keep the M2 rule: additive only, a redeclared base attribute refuses as `type-definition-conflict`. Refinements remain available for genuinely consumer-specific attributes. A refinement that re-declares a fragment slot name on a type that composes the fragment is a `type-definition-conflict` by that same rule once the composed schema declares the slots — which is the mechanism that makes the measured `hrpn-card` pattern unnecessary and, if retained, loudly redundant rather than silently divergent. Refinement resolution itself (chains, cycles, inherited conflicts) is defined once in §5.1 and used by validation, endpoint checks and layout classification alike.

### 3.5 Relations, ports, and relation presentation

No relation presentation is family semantics. Each family declares its relation types; the generic slots below compose with any directed or undirected relation that declares them.

| Concern | Generic successor | ArchiMate (completed) | BPMN (A′ generated) | UML (completed) |
| --- | --- | --- | --- | --- |
| Relation types | `link`, hierarchy `contains`, `association` (hyper, 2..8) | The 11 skeleton names with the versioned source/target matrix (§3.9) | Generated types per A′ §5: connectors are entities with typed references, projected to edges for display; `sequenceFlow`, `messageFlow`, associations as generated types | `association`, `generalization`, `dependency`, hierarchy `packageContainment` |
| Label | `link.label` ≤ 200; `association.label` ≤ 120 | Per matrix; label slot where the matrix declares it | Generated from descriptors; condition/default as typed attributes, never as label text | `sourceMultiplicity` / `targetMultiplicity` as typed text, plus label where declared |
| Ports | `port` (`in`/`out`/`inout`) | None in the skeleton; completion adds none unless the matrix requires it | Generated DI and flow ports per A′ K8/K9 | None |

- The `link` label bound rises from 120 to 200 in the generic successor so the longest labelled relations of the validated corpus store without truncation (`decision`; the bound is profile data, and the migration of §3.13 records it). A `link` without a label is valid; the label is content, never a routing instruction.
- The business id of a relation survives every projection, including the folded projection of §4.4 and any junction-node projection of a hyper-relation. A projection never mints a new business relation.

#### 3.5.1 Relation presentation: `strokeStyle` as a generic relation slot

`decision` — Stroke style is **semantic presentation data on the relation**, with an optional view override. It is not a consumer field, not a renderer default and not inferred from the label. It composes with any family relation that declares it; BPMN sequence-flow line style, where BPMN semantics requires it, stays a generated BPMN attribute and is never replaced by this slot.

1. **Semantic slot.** Each generic `link` and each generic `association` MAY carry `strokeStyle: { kind: "enum", value: "solid" | "dashed" }`. Absent means `solid`. The slot is declared in the composed presentation data as an `enum` attribute with values `["solid", "dashed"]`; it is validated like every other attribute (an undeclared value refuses as `enum-value-not-allowed`). The meaning is presentation-neutral: `dashed` records that the relation is drawn with a dashed stroke (the corpus reading is “dormant, optional or not built”, `tint-legend.json` `relationStyles`); the model stores the style, never the consumer's reason for it.
2. **View override.** `RelationOccurrence` gains an optional field `strokeStyle?: "solid" | "dashed"` (§4.4.2 inventory). When present it overrides the semantic value for that drawing only; when absent the drawing inherits the semantic value (or `solid`). The override is view data: changing it never mutates the `SemanticDocument` and never bumps `document.revision`. A folded projection (§4.4) preserves override presence exactly (§4.4.3): an untouched endpoint keeps its source bytes, and a projected endpoint derives its effective style at render time without materialising a value the source did not carry.
3. **Rendering mapping.** The renderer maps `solid` to a continuous stroke and `dashed` to the dashed stroke of the diagram token set, at the same stroke width and colour resolution as every other relation. No other presentation (colour, width, arrowhead) is carried by this slot.
4. **Corpus assertion (normative).** The re-expressed acceptance instances SHALL preserve the distinction per relation id: S2-asbuilt carries **7 dashed / 37 solid** of 44 links, S1-conversational **10 dashed / 14 solid** of 24, S3-agentfactory **3 dashed / 33 solid** of 36, S2-target **0 dashed / 54 solid** (fixture form) and A5 **0 dashed** in its 31 links (measured from `ds-fixtures/MANIFEST.md` and `tint-legend.json:relationStyles`). A conversion that validates semantically but drops or invents a dash fails the instance (§8). Fold and export round trips (§10, roadmap) assert the same per-id styles on the way back.

Semantic ports are unchanged in shape: a port belongs to an entity, has a direction (`in | out | inout`), a name and typed attributes; side, order and anchor are geometric and live on the port occurrence in a view. A `link` endpoint that targets a port is drawn through that port's occurrence (§4.4 covers its folded form, including the representative's port occurrence). Endpoint type constraints on every role are family constraints under §5.1–§5.2: naming a type accepts that type and its refinements. The n-ary case is normative: an `association` with 3–8 `member` endpoints projects **every endpoint independently** (§4.4.3); suppression requires an actual fold and is decided over the complete representative set, never over an ordered pair. Pair aggregation (§4.5) is restricted to the binary case and to compatible effective styles.

### 3.6 Legend as model data

The legend is semantic presentation data: which categories exist, what each is called and which token paints it. It is not a drawing, a caption string or a set of sample cards, and it is not family semantics.

#### 3.6.1 Legend frame and header slots

- A legend is one `legend` entity from the presentation fragment. `legend` declares the **same header slots as a container** — `name` (required, ≤ 200), `kicker` (≤ 80), `subtitle` (≤ 600), `footer` (≤ 120), `icon` (key grammar, ≤ 40), `tone` (key grammar, ≤ 40), `legendRef` — plus no slot of its own. This closes the measured gap: the A5 `LEGEND` container carries `kicker`, `subtitle` and `icon` in its `hrpn.zone-slots@1` extension (`{"icon":"window","kicker":"HRPN","subtitle":"Card tints and link styles of this scene"}`); under the completed model those three values are ordinary `legend` attributes and need no extension. A legend with no header content beyond `name` is valid; the header slots are optional exactly as on `container`.
- Its categories are its key children through the hierarchy relation named by the composed stack, constrained by the legend constraints of §5.4 (in the generic composition: legend type `legend`, key type `legend-key`, hierarchy `containment`). An executor does not refuse a nested legend, but layout places legends by occurrence geometry as given.
- Rendering a legend is a colour-key list (swatch plus label per category), placeable inside the diagram through the legend entity's occurrence geometry. It is never rendered as a set of atomic cards, and its keys never use the card footprint (§4.6 gives the legend-key footprint).

#### 3.6.2 Legend keys and explicit ordering

Each key entity (type `legend-key` in the fragment) declares:

| Attribute | Kind | Required | Meaning |
| --- | --- | --- | --- |
| `name` | text ≤ 120 | yes | Category label as displayed (authored content, §3.7). |
| `category` | text ≤ 40, key grammar (§3.3) | yes | Category key, same key space as `tone` (§3.3). Unique **within its legend** (§5.3, scoped uniqueness). |
| `token` | text ≤ 80, token-name grammar (§3.3) | yes | Design-token name that resolves the category colour (for example a semantic data-category token name). A token name, never a colour value. An unresolvable token name is a rendering diagnostic, not a semantic refusal. |
| `description` | text ≤ 200 | no | Optional longer label for accessible text and export legends. |
| `order` | quantity, unit `unit`, integer ≥ 0 (§5.8 numeric constraints) | yes | **Authored display order inside its legend.** Lower sorts first; ties refuse (see below). Order is an explicit field, never derived from the entity reference. |

`decision` (ordering) — Category order is the `order` field, sorted ascending, with the entity id (UTF-16 order) as a deterministic tie-break that never decides a distinct `order` value. Renaming an entity reference therefore never reorders a legend, and reordering a legend never requires renaming an id. Two keys in one legend with the same `order` value report `unique-attribute-violation` under the scoped-uniqueness constraint on `(legend, order)` declared in §5.4 — order is data with a uniqueness scope, exactly like `category`. Encoding authored order by renaming identity is withdrawn: it contradicts the M2 rule that every order that matters is an explicit field. A host that needs an authored order sets `order`; the reference itself is never the field. The numeric carrier is declarative (§5.8): `order` declares `integer: true, min: 0` on its quantity schema; `-1` and `0.5` refuse as `quantity-not-integer` / `quantity-below-min` (Appendix C) in every family that composes the fragment.

A legend with zero keys is valid data and renders nothing. Duplicate category keys inside one legend refuse (§5.3); the same key in two different legends is governed by §3.6.3, not by the per-legend uniqueness scope.

#### 3.6.3 Legend binding: deterministic resolution and conflict refusal

A document MAY carry several legends (composed scenes, imported fragments). A bare `tone` key does not name its legend, so resolution SHALL be deterministic and never depend on insertion order or on a consumer tint table:

1. **Binding field.** `SemanticDocument` gains no field. Binding is expressed per entity by the optional `legendRef` attribute (§3.2) composed on `node`, container-family types and `legend`. When present, the entity's `tone` resolves against the legend entity it names, and against no other. The reference is validated as a reference (a dangling target reports `dangling-reference`; a target outside the legend family reports `tone-category-unknown` with `details.legendBinding: "bound-target-not-legend"`, Appendix C); it is not a tint table and it is stored in the document, so two hosts resolve the same document identically.
2. **Single-legend default.** When an entity carries no `legendRef` and the document contains exactly one `legend` entity, its `tone` resolves against that legend. This is the common corpus case and needs no per-entity field.
3. **Conflict refusal.** When an entity carries no `legendRef`, the document contains two or more legends, and those legends declare the same `category` with **different `token` values**, resolving that entity's `tone` reports `tone-category-unknown` with `details.legendBinding: "ambiguous"` (frozen contract, Appendix C) — resolution refuses rather than picking the first legend in record order. When the legends agree on the token for that category, resolution succeeds with that token (agreement is not ambiguity). When the entity's `tone` category is declared by no legend, the same code reports with `details.legendBinding: "undeclared"`. An entity MAY always disambiguate by setting `legendRef`. Legend entities themselves are included as value holders where the composed constraint lists them: a legend's own `tone` resolves by the same three rules.
4. **No order dependence.** The check collects the set of `(category → token)` bindings across all legends in the document, sorted by legend entity id, and compares token values as data. Permuting record insertion order, legend order or key order never changes the verdict; the whole-array comparison test of §5.4 asserts this under reordered input.

The `tone` values used by cards and containers in the same document therefore resolve against declared categories with a stated binding, and the legend explains the document that carries it with no consumer-side tint table.

### 3.7 Text, language and identifiers

- Every text slot stores authored content in the language of the document. The profile, the executor and the renderers hold no language: no kicker table, no « N links » string, no fold label is built into the model. Strings a renderer must generate (aggregate counts, expand/collapse labels, diagnostics text) are host-supplied or host-localised, never stored in the semantic document. §4.5 carries the authored exception: an aggregate label the author wrote (`summaryLabels`) is stored as view data because it is authored content, not a generated string.
- One document carries one language per slot. A translated diagram is a second document instance produced by its author or translator, sharing entity references where the host wants cross-language correspondence; the executor never rewrites a stored string in place and never holds two languages in one attribute. This keeps canonical bytes, hashes and migration reports single-language and auditable.
- Case transforms (kicker uppercase) are rendering transforms under the host locale's case mapping. The stored string is never uppercased in the document.
- New identifiers are language-neutral: profile ids, type ids, attribute names, category keys, icon names and token names are ASCII key forms (§3.3). Persisted values in another language remain readable forever; a rename of a persisted value is a migration with a report, never an in-place rewrite.

### 3.8 Generic successor (`generic@2`)

`decision` — The generic family completes as `generic@2`, the successor major of `generic@1`. No other generic major is created by this lot.

| Item | `generic@2` declaration |
| --- | --- |
| Entity types | `node`, `container` (family types) composing the presentation fragment (§3.2); `legend`, `legend-key` available through the fragment composition, not as generic family types. `container: true` on `container` (and on `legend` through the fragment). |
| Port types | `port` unchanged (`in`/`out`/`inout`, `label` ≤ 80). |
| Relation types | `link` (label ≤ 200, `strokeStyle`), hierarchy `contains` (tree), `association` (label ≤ 120, `strokeStyle`, members 2..8). |
| Constraints (all §5.4 data) | `hierarchy`, `parent-family`, `children-restricted`, inverse required-parent for keys, `category-membership`, `acyclic-hierarchy`; `unique-attribute` on `legend-key.category` scope `{ withinType: "legend" }` and on `legend-key.order` scope `{ withinType: "legend" }`; no `unique-attribute` on `name`; no `max-entities-of-type`. |
| Limits | `maxEntities: 100000`, `maxRelations: 500000`, `maxEndpointsPerRelation: 8` as executor refusal limits, not scene guidance. |
| Migration | §3.13.1 (supersession of `generic@1`). |
| Completeness | `complete`. |

The `generic@1` constraint `max-entities-of-type container ≤ 64` is **not** carried as a hard refusal. The validated corpus exceeds any small round container bound once scenes compose, and a count of frames is a layout and readability concern, not a semantic validity condition. Hosts that need a scene-size policy enforce it as a consumer bound (the Focus dossier precedent: 1–80 entities, ≤ 240 relations, recorded as consumer bounds, not as profile validity) and report it under their own diagnostic, never as a profile refusal. The executor mechanism for `max-entities-of-type` stays available to families that genuinely need it. §3.13.4 proves by resolve witness that the removed constraints are not inherited back through G0 stacking.

### 3.9 ArchiMate completion (`archimate@1` completed from its skeleton)

`decision` — ArchiMate diagrams land on `archimate@1` completed **in place** as the same profile id at a new governed version (Engram versioning, §7); no `archimate@2` is created by this lot unless the completed matrix itself breaks the skeleton's declared types, in which case the break is a new major decided in Engram with its migration reference. The skeleton's three types are the starting point, not the target.

Completion delta (profile data only; executor changes are the shared mechanisms of §5):

| Skeleton today (`skeletons.ts`) | Completed `archimate@1` |
| --- | --- |
| `element` (single type, `layer` enum 7 values, `aspect` enum) | Element catalogue: one entity type per ArchiMate element kind, each declaring its `layer`/`aspect` as constrained values and its family attributes. The skeleton `element` type is retained as the abstract supertype reading for skeleton documents (§6.2); new documents use the catalogue types. |
| `junction` (`and`/`or`), `grouping` (name only) | `junction` unchanged; `grouping` gains `container: true` and parents through the ArchiMate hierarchy constraint. Grouping composes the container presentation (§3.2.2) when drawn as a frame. |
| 11 relation names, 1..1 arity, no matrix | The same 11 ids with the **versioned source/target matrix**: each relation declares `entityTypes` per role from the catalogue, cardinalities per the ArchiMate specification, and `access` mode where the specification requires it. The matrix is data; the executor enforces it through the uniform family rule (§5.2). |
| No hierarchy constraint | `hierarchy` + `parent-family` for grouping containment (`containment` hierarchy id in the ArchiMate namespace); `acyclic-hierarchy` over it. |
| No ports | No port type is added. ArchiMate has no semantic port in this completion; occurrence geometry carries any drawn port. |
| Fixture: one skeleton document | Conformance corpus: one valid fixture per matrix row class plus the rejected matrix cases with asserted diagnostics (§7 corpus). |

Card drawing of an ArchiMate diagram composes the presentation fragment (§1.3). An ArchiMate element drawn as a card stores its `kicker`/`body`/`detail`/`footer`/`icon`/`tone` through the composed schema; the ArchiMate profile bytes contain none of those names. Viewpoints are `ViewDocument` filters (`entity-type` / `attribute-equals`), never new semantic types.

### 3.10 BPMN completion (A′ generated family; `bpmn@1` skeleton retained readable)

`decision` — BPMN completes by the A′ path, not by hand-completing the `bpmn@1` skeleton. The hand-written skeleton was the M2 placeholder; the complete BPMN semantics are generated from the bpmn-moddle descriptors, because hand-writing ≈ 1 200 slots freezes a schema without multi-view proof (A′ §1.3).

| Item | Completed state |
| --- | --- |
| Profiles | Generated profiles `bpmn@2`, `bpmndi@1`, `dc@1`, `di@1`, `bioc@1`, `color@1`, `sem@1` from the descriptor snapshot pinned in A′ §8 (bpmn-moddle 10.3.1 descriptors plus `semantics.json` sha256 `c274f46f773b5f557f7995fa70aae9d8a50384aedfcc6c3a5d166563a17a7c97`). `bpmn@1` is **not** hand-extended. |
| Kernel | A′ K1–K13 (supertypes/subsumption, typed references, NCName ids, composition slots, unbounded descriptor-derived collections, structured values, body text, overlays, complete DI, preserved-extension source, numeric scalars, commands). Each mechanism is generic; no BPMN name appears in kernel code. |
| Exchange | F1 moddle JSON end-to-end; XML only at the edges inside tests (A′ §1.2, owner decision 2026-10-15: F1 preserves unknown extensions, `xmlns`, `xsi`). |
| DI / views | One `ViewDocument` per `BPMNDiagram`; plane as view root; shape/edge occurrence forms per A′ K9. `diagram-canvas` paints `edge` occurrences from their DI waypoints verbatim. |
| `bpmn@1` | Stays registered and validatable as a `skeleton` (§6.1). A′ K10 removes the hand-written `bpmn@1` declaration only inside the A′ implementation lot that ships the generated family, and only under the gates of §6; this specification does not remove it. No automatic `bpmn@1` → `bpmn@2` document migration is promised (A′ K10 reasons 1–3 are normative here). |
| Canonicalization | `profile-c14n/2` is untouched (§3.12). The generated profiles are pinned by G0 `contentDigest` (P-CONTENT-DIAGRAM); F1 JSON identity stays the c14n discipline of bpmn-canvas. The two digest systems are never interchanged (§7.3). |

BPMN rendering and editing parity are **not** part of this completion. They are owned by `SPEC_RE_BPMN_JS_PARITY.md` (planes 1–5, lots L0–L9) and by bpmn-canvas as the production editor until its harness proves parity. This specification supplies plane 1 (the model) and the executor mechanisms planes 2–3 consume; it claims no renderer, palette, context-pad or keyboard coverage. §6 states the no-regression gates that keep that boundary intact.

### 3.11 UML completion (`uml@1` completed from its skeleton)

`decision` — UML class-diagram semantics complete `uml@1` **in place** as the same profile id at a new governed version, on the same terms as §3.9. Activity, sequence and state diagrams are separate profiles when authorised; they are not folded into this completion.

| Skeleton today | Completed `uml@1` |
| --- | --- |
| `class`, `interface`, `package`, `property`, `operation` | Same ids, completed attributes: multiplicity as typed structured values (lower/upper, unbounded as data), visibility, derived/static markers, stereotype application as typed references to declared stereotype types. `package` gains `container: true`. |
| `association` (directed, multiplicity as text), `generalization` (class/interface only), `dependency`, `packageContainment` (tree) | `association` with end multiplicities and aggregation kind as enums; `generalization` over classifiers; `dependency` unchanged in shape; `packageContainment` executed through the shared hierarchy mechanism with `parent-family` roots `["package"]`. |
| Notes: “NOT declared: full multiplicity semantics, profiles and stereotype rules” | Those three are exactly the completion. PlantUML text remains a codec surface (GD-M4), never the model. |

### 3.12 `profile-c14n/2` (no change)

`profile-c14n/2` is the bpmn-canvas canonicalization (`/home/antoinefa/src/bpmn-canvas/src/profile/canonical.ts`): RFC 8785 canonical JSON over profile values, `rawDigest` over exact bytes, `canonicalDigest`, `stableId` under `profile-mechanism/1`. This specification changes none of it:

- No byte of its output changes for any existing input. Fixture identity (corpus manifests, sealed vectors, W01–W12 cases) is preserved bit-for-bit (§6 gates).
- No executor in this repository re-implements it, and the Engram catalog never re-canonicalizes a c14n artifact (G0 §7.3). `diagram-core` content digests (P-CONTENT-DIAGRAM) and c14n digests answer different questions and are recorded under different names (§7.3).
- The unique-attribute parity fixed at DS commit `610c0353` (Q-G0-2) is a `diagram-core` validator property; it is not a c14n property and c14n code does not acquire it.

### 3.13 Migration and supersession

Two distinct version axes exist and are not conflated: the persisted **schema version** (`SemanticDocument.schemaVersion`, currently `1.1`; A′ proposes `2.0` for the BPMN kernel shapes under its own gate) and the **profile major/version**. This lot bumps profile identities. It does not bump the DS schema major: no `SemanticDocument` field is added or removed by the generic/archimate/uml completions. The view additions of §4.4.2 and §4.5 are optional fields on existing view records plus one optional field on `VisualGroup` and one optional record on `ViewDocument` (`summaryLabels`), readable by the current view validator's successor without a stored-shape break (a view without them is a valid unfolded view). The full persisted-shape inventory is: **semantic shape — no field added, one attribute removed from one generic type by profile data; view shape — `RelationOccurrenceEndpoint` gains two optional fields, `RelationOccurrence` gains one optional field, `VisualGroup` gains one optional field, `ViewDocument` gains one optional field.** The r2 sentences that counted otherwise are superseded by this inventory, and `VIEW_DOCUMENT_FIELDS` gains `summaryLabels` while still refusing transient keys (§5.6).

A profile migration is a registered, versioned function with the M2 contract: it produces a report (`from`, `to`, operations, unmigrated items with reasons) and keeps the original. “A migrated document validates” is a normative outcome: a migration that completes with an empty `unmigrated` list SHALL produce a document that `validateDocument` accepts with zero diagnostics under the target profile, with every business id and every non-profile content value retained. A migration that cannot reach that outcome lists the blocking items in `unmigrated` and does not present its output as a valid target document. A blocking collision (§3.13.3) refuses the migration atomically: the outcome is the retained original plus the report, never a mixed candidate that validates under neither profile.

#### 3.13.1 Generic: `generic@1 → generic@2` (supersession)

Operations run in **deterministic order**: profile references first, then type definitions sorted by id, then entities sorted by id, then relations sorted by id, then ports sorted by id. Record insertion order never changes the operation list or the output bytes (the reversed-insertion fixture of §5.7 asserts this). Every transformation is reported; no transformation is silent.

1. **`profileRefs`**: replace `generic@1` with `generic@2`, preserving the position of the replaced entry and every unrelated profile reference unchanged. A document that declares no `generic@1` is not an input to this migration (`unmigrated`, reason `profile-not-declared` on the document path). A document declaring both `generic@1` and `generic@2` refuses migration (mixed majors are not created or consumed by migration; the author chooses the major per document).
2. **Every profile-bearing record**: for each record whose `profile` field equals `generic@1`, rewrite that field to `generic@2` and record one operation `rewrite-profile` with the record path. The record families are, exhaustively: `typeDefinitions.*.profile`, `entities.*.profile`, `relations.*.profile`, `ports.*.profile` (semantic ports). Records naming any other profile are carried unchanged and are not reported as rewritten. After this step no record in the migrated document names `generic@1`; a post-migration scan that finds one is a migrator defect, and the §5.7 fixture asserts the scan is empty.
3. **Type definitions — residual refinements retained (atomic remapping).** Migration never drops a definition wholesale and never drops a stored value:
   - Resolve each definition's **source** chain first (against `generic@1` plus the document's own definitions, through the shared resolver of §5.1). A definition whose source chain does not resolve is listed in `unmigrated` with the resolver's diagnostic code and carried unchanged; the migration outcome is then “carried with unmigrated items” and its output is not claimed valid.
   - Compute the overlap between the definition's additive attributes (over its whole source chain) and the attributes the target composed schema now declares on the effective base. Attributes with **no overlap** are consumer data: the definition is **retained as a residual refinement** over the target base, re-based deterministically (its `baseType` is rewritten to the nearest retained ancestor, or to the profile base type when every ancestor was removed), and every instance keeps its type id and every value. Dependent definitions that refined the re-based definition are re-based in id order in the same pass, so no `baseType` ever dangles.
   - Attributes that overlap a now-native slot with the **same kind and a bound that accepts every stored value** are promoted: the value is carried onto each instance under the profile attribute name (with the single declared rename `tint` → `tone`, recorded per attribute as `rename-attribute tint->tone`, applying only inside a promoted overlap, never to a free-standing attribute), and the overlapping declaration is removed from the retained definition. A definition whose every additive attribute is promoted and which has no retained dependent is removed, with one operation `remap-refinement` per definition plus one `remap-instance` per rewritten entity recorded. A definition that retains any consumer attribute stays, and its instances keep their type id.
   - If an overlapping attribute has a **different kind, or a bound that rejects a stored value**, that attribute is not promoted: it stays in the retained residual definition under its original name (shadowing is impossible because the target schema is consulted through the resolver, which reports the redeclaration; the migration therefore renames the retained attribute only when the resolver reports a true name collision with a different kind, recording `retain-renamed <old>-><new>` and rewriting instance keys accordingly). The migration still completes and validates; no value is truncated to fit a new bound and no consumer attribute is silently deleted.
4. **Entities**: per entity, carry every attribute that the target composed schema still declares on the entity's effective type, unchanged. The new fragment slots are absent after migration (they are optional); migration never invents kicker, body, icon or tone content. Per `container` entity: drop the `collapsed` attribute. Record one operation `drop-attribute container.collapsed` per affected entity, with the dropped boolean in the operation detail, so a host can seed its first view's fold state (§4.2) from the report. The value is not carried into any semantic field. The three stored cases — attribute absent, `collapsed: false`, `collapsed: true` — are distinct report lines and are fixtured separately (§5.7).
5. **Relations and ports**: carry endpoints, attributes and direction unchanged, except the `profile` rewrite of step 2. The raised `link` label bound (120 → 200) is recorded once as an operation `profile-bound-change link.label 120->200` on the profile path; no stored label is rewritten. A stored `strokeStyle` cannot exist in a `generic@1` document (the slot is new), so migration invents none: every migrated link is effectively `solid` until an author sets the slot.
6. **Extensions, resources**: carry over unchanged. A preserved extension whose content duplicates the new slots (the measured `hrpn.zone-slots@1` pattern) is carried as preserved data and listed in the report as `preserved-duplicates-profile-slots` (informational operation detail, not an `unmigrated` item): removing it is the consumer switch-over edit witnessed in §8, so migration alone never deletes preserved content (decision D3-C).

An unknown profile major in a stored document refuses in write and is preserved for inspection, as today. `generic@1` remains registered and validatable after `generic@2` ships: migration is per-document and explicit, never a registry replacement. Recovery is the retained original: the report carries `originalCanonical` and its hash, and “recovery of the original” (restoring the pre-migration bytes from the report) is a fixtured operation, not a re-run of the migrator backwards.

#### 3.13.2 ArchiMate and UML: completion in place

Completing `archimate@1` / `uml@1` in place (§3.9, §3.11) is a governed profile-version change, not a document migration: skeleton documents remain validatable under the skeleton pin forever (pins are immutable, §7), and a document that adopts the completed matrix re-pins to the completed version explicitly. Where the completed matrix narrows a skeleton acceptance (a relation the skeleton allowed by arity that the matrix forbids), the re-pin validation reports the matrix diagnostic; no silent document rewrite is performed. If Engram instead decides a new major for either family, the migration contract of §3.13.1 applies verbatim with the target id substituted (every `.profile` record rewritten, residual refinements retained, atomic collision refusal), and the fixture pair (same input under both targets) SHALL differ only in profile id strings and catalog relationships, never in content, counts or diagnostics.

#### 3.13.3 Reserved-name collisions (atomic)

If a document already declares a type definition, entity type usage or attribute that collides with a name a completed profile introduces (for example a document definition id `legend` or an attribute `order` on a key-like type), the collision is detected **before** any rewrite. A collision that would leave a retained record naming a removed profile, or a schema that validates under neither the source nor the target, is **blocking**: the migrator refuses the whole migration, returns the unchanged original plus a report whose `unmigrated` lists each colliding path with reason `type-definition-conflict` and detail `reserved-name-collision`, and performs no rewrite at all. There is no partial-output candidate. A collision that is purely nominal and resolvable by the residual-retention rule of step 3 (retain and, only on a true kind collision, rename with a recorded operation) is not blocking and follows that rule. A collision never produces a document that validates under neither profile.

#### 3.13.4 Supersession is not G0 stacking ancestry

G0 defines `lineage.parents` as **composition layers** under narrowing-only stacking rules (G0 §2.3: S-1 a child may add types and narrow constraints; S-2 a child may not remove a parent type, widen a cardinality or redeclare an attribute). The generic successor removes the `collapsed` attribute and the container-name uniqueness and count constraints, widens the `link` label bound, and relaxes scoped uniqueness relative to `generic@1`. It therefore **cannot** be a G0 stacking child of `generic@1`, and this specification does not record it as one. The same test applies to any future major of any family.

- `generic@2` is published as a **replacement major** related to `generic@1` by an explicit **migration/supersession relationship**: the catalog record for `generic@1` gains `supersededBy` pointing at the `generic@2` pin, paired with the migration reference of §3.13.1 (G0 §1.4: `supersededBy` is required iff lifecycle is `superseded`, and on a superseded record it is paired with a migration reference). The `generic@2` record classifies as a **base** (G0 §5.3: base binding, not the stacked `profile` binding): its `lineage.parents` is the empty list and its `stack` is the single-layer stack containing only its own pin. No delta, no derivation record and no parent pin names `generic@1` as a layer. ArchiMate/UML completions in place keep their existing lineage; a future new major of those families follows the same base rule.
- **Resolve witness (normative).** Resolving the `generic@2` stack SHALL produce an effective profile in which (i) no `unique-attribute` constraint on container `name` exists, (ii) no `max-entities-of-type` constraint on `container` exists, and (iii) the `link` label bound is 200. A resolve that inherits any of the three from `generic@1` fails qualification. The §5.7 test asserts all three on the resolved declaration, proving the removed and relaxed constraints are not inherited back.

## 4. View model: folds, folded projections, measurement and layout hints

The view remains the M2 `ViewDocument`: occurrences of entities, relations and ports, visual groups, filters and persistable presentation state, pointing at exactly one `SemanticDocument` and never ahead of its revision. This section adds the fold contract, the folded-edge projection that stays valid, the measurement input that layout consumes, and the generic layout hints that replace consumer packing. Transient state (hover, in-flight drag, marquee) stays out of the view, as today. Every rule in this section is family-neutral: it executes identically for generic, ArchiMate, BPMN (DI views) and UML documents, because it reads only occurrence, hierarchy and fold data.

### 4.1 Fold state is view data, bound to occurrences

#### 4.1.1 Binding rule

- The fold state of a container drawing in a view is the `collapsed` flag of exactly one `VisualGroup` of that view, bound to an **entity occurrence**, not to an entity. `VisualGroup` gains one optional field (view-shape inventory, §3.13):
  ```ts
  interface VisualGroup {
    readonly id: string;
    readonly label?: string;
    readonly collapsed?: boolean;
    /** The entity occurrence this group folds. Present on every fold group in a completed-profile view. */
    readonly occurrence?: OccurrenceRef;
  }
  ```
  For each entity occurrence in the view whose effective type (shared resolver, §5.1) is in the container family (`container: true` on its base chain), the view MAY hold one group whose `occurrence` equals that occurrence's id and whose `collapsed` is the fold state of **that drawing** in that view. The group id is `grp.<len>.<localId>` where `<localId>` is the local id of the **occurrence** (not the entity) and `<len>` is its length — the id form already used by the measured HRPN view, re-anchored from entity to occurrence. Group membership follows the existing derived rule: an entity occurrence belongs to the group named by its `EntityOccurrence.group`, and that group is the fold group of its hierarchy parent's occurrence in the same view. Membership itself is never duplicated as a member list.
- **N occurrences (M2 §3.4).** The same container entity MAY have several occurrences in one view; each occurrence has its own fold group and may fold independently. Two views of one document fold independently, as before. A container occurrence with no fold group is expanded. A fold group whose `occurrence` names no entity occurrence of the view, or an occurrence whose effective type is outside the container family, reports `dangling-reference` / `occurrence-endpoint-mismatch` under the view validation of §5.6 (the group is view data and is validated as such).
- Folding or unfolding is a view change. It is expressed by replacing the `ViewDocument` (§4.1.3), or by the host re-running layout with a new collapse input (§4.6) and replacing the view wholesale. It never mutates the `SemanticDocument`, never bumps `document.revision`, and never travels through an `update-entity-attributes` command. No completed profile's semantic `collapsed` attribute is a fold carrier (§3.2.2).
- The rendering consequence is fixed: expanded, a container occurrence draws its header plus its visible children; collapsed, the same occurrence draws exactly one atomic card (`460 × 200`, §4.6) carrying the container's `kicker`, `name`, `subtitle` (as centred summary lines), `footer`, `icon` and `tone`, plus the fold control. No child occurrence of a collapsed container occurrence is a scene item (§4.4, step 1).

#### 4.1.2 Why occurrence binding is required

With entity binding, two drawings of one container cannot fold differently, and the projection of §4.4 cannot say **which** drawing an edge was retargeted from when the same entity is drawn twice. Occurrence binding removes both gaps without new machinery: the fold group, the hidden-by-fold test and the representative are all computed per occurrence, and §4.4.2 preserves the original endpoint occurrence so unfolding restores the exact drawing.

#### 4.1.3 Revision meaning: fold-only changes keep the semantic revision

`decision` — `ViewDocument.revision` keeps its current meaning exactly: **the document revision this view was last changed at; never ahead of the document** (`packages/diagram-core/src/view.ts`, refused as `revision-divergence` when ahead). A fold-only change therefore **retains** that value:

- Folding, unfolding, expand-all, collapse-all, changing a view `strokeStyle` override, editing a `summaryLabels` entry and re-projecting (§4.4) all produce a replacement view whose `revision` equals the source view's `revision` (which equals the document revision the view was built against). No fold operation increments `ViewDocument.revision`, and no fold operation requires a semantic command. The HRPN witness is normative: the supplied view at revision 1 folded in any way stays at revision 1 and validates; a fold that produced revision 2 against a document at revision 1 would refuse `revision-divergence` and is a defect.
- View concurrency is **not** carried by `revision`. A host that needs optimistic concurrency over views uses a separate host revision: the canonical content hash of the view (the executor's canonical serialisation, §7.3 artifact digest discipline) or a host-minted view generation counter stored outside the `ViewDocument`. This specification gives that value no field name inside the view, because two hosts mint it differently and neither meaning is the document revision. Tests assert the observable contract: repeated fold/unfold at document revision 0 (and at revision 1 on the HRPN view) validates at every step with `view.revision === document.revision` throughout, and the semantic document bytes are unchanged by every fold (§5.6, §5.7).
- A semantic change (any command that bumps `document.revision`) does not automatically rebase existing views: a view whose `revision` is behind the document revision is stale in the M2 sense and is rebuilt or re-projected by its host; `validateView` continues to refuse only the ahead case, as today.

### 4.2 Default folds

- Default folds are **input data**, not component defaults and not semantic data. A host supplies `defaultFolds: readonly OccurrenceRef[]` (container **occurrences** folded in the initial view; a host building a fresh view from a document MAY instead supply entity refs, which the view builder resolves to the occurrences it creates, recording the resolved occurrence ids in the produced view) when it first builds or lays out a view. The layout or view builder stamps exactly those occurrences' fold groups `collapsed: true` in the produced `ViewDocument`; every other container group is `collapsed: false` or absent-means-expanded by the rule that an undeclared group is expanded.
- A stored `ViewDocument` therefore fully determines the displayed folds without consulting any default list. Reopening a stored view never re-applies defaults. Changing defaults after a view exists has no effect until a new view is produced.
- Expand-all and collapse-all are host operations over the same data: they produce a new view in which every container fold group is expanded, respectively every container fold group whose occurrence has at least one child occurrence is collapsed. They mint no semantic change and are bounded by the interaction budget of §10.

### 4.3 Scoped uniqueness execution

Scoped uniqueness is executed as §5.3 specifies. This section states only the view-visible consequence: no view rule depends on display-title uniqueness in any family. Two containers both titled « CI/CD », two ArchiMate elements with the same name, two BPMN tasks with the same name and two UML classes with the same name are all valid unless their family profile declares a scoped uniqueness over that attribute in that scope. Legend `category` and `order` uniqueness (§3.6) are the only title-adjacent uniqueness rules the completed compositions declare, and both are scoped `withinType: "legend"`.

### 4.4 Folded-edge projection that yields a valid `ViewDocument`

This section defines the only folded projection. A folded output that does not follow it is not a valid view, and the M1 gates assert `validateView(foldedView, document)` returns zero diagnostics on every folded acceptance scene. Two r1 defects are closed by construction: the representative is the **outermost visible** collapsed ancestor (never an invisible inner one), and the projection is **recomputed from a retained source view on every transition** (never mutated in place, so unfolding reverses it). Folded-only persistence without a retained source is not a valid mode (§4.4.2).

#### 4.4.1 Definitions (per occurrence)

For a given view, let `containsParentEntity(entity)` be the semantic hierarchy parent under the hierarchy named by the composed stack (at most one per hierarchy, §3.4), and let `parentOccurrence(occurrence)` be the entity occurrence of that parent entity that contains this occurrence in this view (resolved through `EntityOccurrence.group` → fold group → `VisualGroup.occurrence`; when a child has several parent drawings, the one whose fold group the child occurrence names). All definitions below are per occurrence, so N occurrences of one entity project independently. For BPMN DI views the same definitions run over the DI plane hierarchy; no BPMN name is tested by the mechanism.

- An entity occurrence is **hidden by fold** when any hierarchy ancestor **occurrence** of it (walking `parentOccurrence` upward) is folded (its fold group `collapsed: true`). A collapsed container occurrence's own drawing stays visible as a card; its child occurrences, at any depth, are hidden by fold. This matches the existing `group-collapsed` cascade: hidden occurrences are reported, never silently dropped.
- The **visible representative** of an entity occurrence `O` in a view is defined by walking the ancestor-occurrence chain upward from `O`:
  1. Collect every ancestor occurrence (including `O` itself when `O` is a container occurrence, for the question “where do edges to `O`'s children land”) whose fold group is collapsed, in order from innermost to outermost.
  2. If the collection is empty, the representative is `O` itself.
  3. Otherwise the representative is the **outermost** element of the collection — the collapsed ancestor closest to the root. By construction no ancestor above it is collapsed, so it is visible; every inner collapsed ancestor is hidden beneath it and is never selected. (The governance `collapseGovernanceScene` behaviour is the measured precedent: the representative is the collapsed ancestor that stays visible through the whole chain.)
  For a port occurrence, the representative is the visible representative of the port's owner occurrence, drawn through the representative's port occurrence bound to that representative when one exists in the view, otherwise through the representative occurrence itself (§4.4.2, port rule).
- A relation occurrence is **internal** to a collapsed container occurrence when **every** endpoint's visible representative is that same occurrence **and at least one endpoint was actually hidden by a fold** (a visible self-link whose endpoints already coincide without any fold is untouched, never internal). Internal relations draw nothing in the folded view. A relation with at least one endpoint hidden and not internal is **projected**; a relation with no endpoint hidden is **untouched**. For an n-ary `association` the test runs over the complete representative set: internal iff the set has one element and a fold was involved; projected iff the set has more than one element and at least one endpoint was hidden; untouched otherwise. Each endpoint projects independently.

#### 4.4.2 The projected occurrence (view data) — persisted-shape inventory

The persisted view gains the following optional fields, and no others (§3.13 inventory; `VIEW_DOCUMENT_FIELDS` gains exactly `summaryLabels` — a test asserts the view field set still refuses a stray `hover`-style key):

1. On `RelationOccurrenceEndpoint`: `semanticTarget?: EntityRef | PortRef`. Present **iff** the drawn `occurrence` does not itself draw the semantic endpoint target for that role. Its value is the semantic relation's endpoint target for that role, copied verbatim. Absent means “the drawn occurrence draws the semantic target”, exactly as today.
2. On `RelationOccurrenceEndpoint`: `sourceOccurrence?: OccurrenceRef`. Present **iff** `semanticTarget` is present. Its value is the **original endpoint occurrence** — the occurrence that drew the semantic target in the source view. This is the endpoint-occurrence provenance the reviews require: the projection never loses which drawing it came from, including when the same entity has several occurrences (the original is identified by occurrence id, not by entity id). On an unprojected endpoint both fields are absent.
3. On `RelationOccurrence`: `strokeStyle?: "solid" | "dashed"` — the view override of §3.5.1. Absent means inherit the semantic value. Projection **preserves override presence exactly**: an untouched occurrence carries the source field or its absence byte-for-byte; a projected occurrence carries the source override when the source carried one and carries no field when the source carried none (the effective style is derived at render time, never materialised). §4.4.3 step 2 states the rule; the empty-collapse byte-identity witness of §5.6 enforces it.
4. On `RelationOccurrence`: no aggregation field. Aggregation is derived, never stored (§4.5).
5. On `VisualGroup`: `occurrence?: OccurrenceRef` — the fold binding of §4.1.1.
6. On `ViewDocument`: `summaryLabels?: Readonly<Record<string, SummaryDefinition>>` — authored summary **definitions** (§4.5.1), distinct from their active projection (§4.5.2). Absent means no authored labels; derived count labels are computed at render time and never stored.

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

**Retained source view (normative).** A folded view is always derived from a stated source view by the pure projection of §4.4.3. The host **retains the source (least-folded) view** for as long as it offers fold transitions over that document view. Storing only folded views is not a supported persistence mode: endpoint provenance alone cannot recover an originally absent `strokeStyle` override, a discarded summary activation, or source geometry, so no reconstruction operation is specified and none is claimed. A folded view read back from storage without its source validates as a view (§4.4.4) and renders, but it is not a projection input; the host rebuilds a source view (unfolded layout) before the next fold transition. This replaces the r2 alternative that permitted folded-only storage.

#### 4.4.3 Projection procedure: recomputed from the retained source on every transition, with folded geometry

Projection is a **pure function**; it is never an in-place mutation of a stored view, and it is re-run from the retained source on every fold transition. Fold projection alone does not produce displayed geometry: the displayed folded view is the composition **fold → measure → place → route** (§4.6.3), in which projection supplies the folded occurrence set and endpoints, measurement supplies the collapsed footprints, placement assigns the `460 × 200` collapsed boxes, and routing draws between representative anchors. Source geometry is retained on hidden occurrence records for restoration and is never emitted as the folded box.

```
projectView(document, sourceView, collapsedOccurrenceIds) -> ViewDocument   // endpoints + groups only
layoutFolded(document, sourceView, collapsedOccurrenceIds, hints?) -> ViewDocument  // projectView + measure/place/route
```

- **Inputs.** `document`: the `SemanticDocument` (unchanged). `sourceView`: the retained view of that document in which **no endpoint is projected for fold reasons** — every relation endpoint either draws its semantic target or is an authored drawing with no `semanticTarget`. Callers MUST NOT pass an already-projected view as `sourceView`; the function refuses (diagnostic `occurrence-endpoint-mismatch`, detail `projection-source-projected`) if any input endpoint already carries `semanticTarget`. This is the rule that makes unfolding exact: a fold change is always `projectView(document, sourceView, newCollapsedSet)`, never “patch the previous projection”.
- **Step 1 — hidden set.** Compute hidden-by-fold occurrences (§4.4.1) from `collapsedOccurrenceIds` (the set of container occurrences whose fold groups are collapsed in the output). Hidden entity occurrences stay in the output `ViewDocument` records (their geometry is the source geometry, retained so unfolding restores it byte-for-byte) and are excluded from the scene as `group-collapsed`, as today. Do not delete occurrences to fold.
- **Step 2 — per relation occurrence.** Let the semantic relation's endpoints be known from `document`. For each relation occurrence in `sourceView`:
  - Compute each endpoint's visible representative (§4.4.1) from the endpoint's **original** drawn occurrence (`endpoint.occurrence` in the source view). Every endpoint is handled independently, including each `member` of an n-ary association.
  - If the relation is internal (§4.4.1: complete representative set of one, with a fold involved), copy the occurrence record unchanged (original endpoints, no provenance fields, override presence unchanged) and let the scene exclude it as `endpoint-hidden` with its cause reported. It draws nothing.
  - Else, for each endpoint whose original occurrence is hidden by fold: set the output endpoint's `occurrence` to the representative occurrence (for a port endpoint, the representative's port occurrence when one exists in the view, otherwise the representative's entity occurrence), set `semanticTarget` to the semantic endpoint target for that role, and set `sourceOccurrence` to the original `endpoint.occurrence`. Endpoints that are not hidden are copied unchanged and carry neither provenance field.
  - Copy `waypoints` unchanged on the retained record. Copy the `strokeStyle` field **iff** the source occurrence carried it, with the same value; never add the field and never remove it. The effective style of a projected occurrence is derived at render time (view override if present, else semantic value, else `solid`) and is not stored.
- **Step 3 — groups, filters, summaries, geometry hand-off.** Stamp fold groups for exactly `collapsedOccurrenceIds`; copy every filter unchanged (filters and folds combine, §4.4.6); carry `summaryLabels` **definitions** through unchanged (§4.5.1 — definitions are never dropped by projection; activation is derived per folded state, §4.5.2). Leave every other occurrence and presentation value unchanged, except geometry: entity occurrence geometry in the output of `layoutFolded` is the placed folded geometry (collapsed occurrences at `460 × 200`, expanded occurrences recomputed over visible children), while `projectView` alone leaves geometry as the source geometry and is therefore an intermediate, never a displayed view. The output keeps the source view's `viewId` only when the host replaces that view; a folded derivative that coexists with its source uses a new `viewId`. The output `revision` equals the source `revision` (§4.1.3).
- **Restoration property (normative).** For any collapsed sets `A` and `B`, `projectView(document, sourceView, A)` followed by discarding the result and computing `projectView(document, sourceView, B)` is the only transition. In particular, `projectView(document, sourceView, ∅)` returns a view whose relation occurrences are **byte-identical** to the source view's (canonical serialisation, including `strokeStyle` presence and `summaryLabels` definitions), and repeated fold/unfold cycles `A → ∅ → A → ∅` produce identical bytes at each repetition. No `semanticTarget` or representative endpoint survives into a view whose collapsed set does not hide that endpoint, because the projection is recomputed, not patched. The r1 defect — expanding a previously projected view leaving `semanticTarget` and the ancestor endpoint intact, then failing `projection-not-folded` — cannot occur under this procedure, and §5.6 fixtures assert the cycle explicitly.

#### 4.4.4 Validation of a projected endpoint

`validateView` accepts a projected endpoint **iff** all of the following hold; otherwise it reports the stated diagnostic. The unprojected rule is unchanged: without `semanticTarget`, the drawn occurrence must draw exactly a semantic endpoint target for its role, else `occurrence-endpoint-mismatch`.

- `semanticTarget` equals one of the semantic relation's endpoint targets for the endpoint's role (the same set the current check uses). Otherwise `occurrence-endpoint-mismatch`.
- `sourceOccurrence` is present, names an occurrence of this view, and that occurrence draws `semanticTarget` (its entity/port equals `semanticTarget`). Otherwise `occurrence-endpoint-mismatch` with detail `provenance-missing` (absent) or `provenance-mismatch` (names a different target).
- The drawn (`occurrence`) occurrence exists in the view and is not itself hidden by fold. Otherwise `dangling-reference` (missing) or `occurrence-endpoint-mismatch` with detail `representative-hidden`. Under §4.4.1 the representative is visible by construction, so `representative-hidden` witnesses a hand-written or stale projection, never a correct one.
- Walking hierarchy parent **occurrences** from `sourceOccurrence` up to the drawn occurrence passes only through occurrences hidden by fold (every intermediate ancestor occurrence is folded or is a child of a folded occurrence), the drawn occurrence is folded (collapsed) itself, and it is the outermost folded occurrence on that walk. If the walk never reaches the drawn occurrence, reaches it without any folded occurrence, or stops at an inner folded occurrence while an outer one is also folded, the projection is spurious: `occurrence-endpoint-mismatch` with detail `projection-not-folded` (no fold on the walk) or `projection-not-outermost` (an inner representative was chosen). The nested defect — `TOPIC` selecting nearest collapsed ancestor `MSGZ` itself hidden beneath collapsed `PPROZ`, `PRODZ` and `GCP`, then rejected as `representative-hidden` — is refused at authoring time by the `projection-not-outermost` arm and never produced by §4.4.3.
- The drawn entity is in the container family when `semanticTarget` differs from the drawn target (a projection target is always a container card, never a leaf card that happens to be an ancestor by geometry). Otherwise `occurrence-endpoint-mismatch` with detail `representative-not-container`.

These checks make the folded view self-describing: a validator needs only the document, the view and the hierarchy tree — no layout output, no scene and no fold list. Appendix B works the review example end to end, including the nested form and a three-member association spanning two collapsed branches.

#### 4.4.5 Aggregation is derived, never stored — with authored labels as view data

When several semantic relations project onto the same visible representatives, each keeps its own `RelationOccurrence` with its own business id (§3.5). A renderer MAY group projected occurrences into one drawn stroke only under the compatibility rule of §4.5.3; that grouping is computed from the view at render time, is recomputed on every fold change, and is never persisted as a relation, an occurrence or an extension. The constituent relation ids of a drawn aggregate are exactly the relation ids of the grouped occurrences — grouping never mints, merges or drops a business id.

What a renderer draws as the aggregate's label is governed by §4.5: an active authored summary for that aggregate wins; otherwise the renderer MAY draw a count label whose text is host-localised (§3.7). The count is derived; the authored label is stored view data. Both preserve the constituent ids, and export (§10 roadmap) serialises the authored label with its constituent ids so a folded overview round-trips.

#### 4.4.6 Filters combined with folds; ports

- Filters and folds are independent exclusions with distinct reasons. A filter that hides an endpoint excludes its relation occurrence as `endpoint-hidden` (filter cause), independently of fold exclusions; the two reasons stay distinct so a host can tell a fold from a filter. Projection runs **after** filter evaluation is known to the host only in this sense: §4.4.3 projects on fold visibility; a relation occurrence already excluded by a filter is still projected by the same rules (its endpoints' representatives are computed identically), so removing the filter later never requires re-projection logic — the scene simply stops excluding it. §5.6 fixtures assert simultaneous filter+fold states: an endpoint hidden by both produces one exclusion with the fold reason taking precedence in the record and the filter cause retained in the exclusion's `cause` field, and clearing either one alone restores the correct drawing without touching the other.
- Ports: a port endpoint hidden by fold projects to the representative's port occurrence when the representative occurrence has a port occurrence for the same semantic port's counterpart (same `PortRef` drawn on the representative is impossible — ports belong to their owner — so the rule is: the port occurrence whose `ownerOccurrence` is the representative occurrence and whose `port` is a port of the representative entity with the same direction, when exactly one exists; otherwise the representative's entity occurrence). The chosen drawing is recorded identically (`occurrence` = chosen occurrence, `semanticTarget` = original port ref, `sourceOccurrence` = original port occurrence), so port folds validate by §4.4.4 with the port arm of the walk. A port with no counterpart on the representative still projects (to the entity occurrence) and still restores, because provenance names the original port occurrence.

#### 4.4.7 Scene consequence

The scene builder keeps its conservation rule. In a folded view: hidden occurrences are exclusions (`group-collapsed`), internal relation occurrences are exclusions (`endpoint-hidden`), projected relation occurrences are edge items whose path runs representative-anchor to representative-anchor (persisted waypoints of the source occurrence, when still inside the visible region, are retained as route hints on the retained record and ignored for the projected segment outside it — the router owns the final route). No occurrence is silently dropped and no edge disappears without a reported exclusion.

### 4.5 Authored aggregate labels for collapsed overviews: definitions and active projection

The #711 all-collapsed overview draws **authored** summary labels on its aggregate edges (the kit's `summaryLabels`), not only counts. A count-only rule loses that content while counts and semantic validity still pass, so the authored input is model data (view data, because it labels a folded drawing). r3 separates the two things r2 conflated: a **persistent definition** that is valid in the source view, and its **active projection** in a folded view.

#### 4.5.1 Persistent definitions (valid in the source view)

```ts
interface SummaryDefinition {
  /** Stable id of this definition, unique within the view. The aggregate key is (sourceOccurrence, targetOccurrence, strokeStyle). */
  readonly id: string;
  readonly sourceOccurrence: OccurrenceRef; // an occurrence of the source view (never a representative)
  readonly targetOccurrence: OccurrenceRef; // an occurrence of the source view
  readonly label: string;                    // authored text, document language (§3.7)
  /** Constituent semantic relations this label summarises, sorted, non-empty. Each relation has one
      endpoint drawn by sourceOccurrence's entity subtree and the other by targetOccurrence's. */
  readonly relationIds: readonly RelationRef[];
  readonly strokeStyle?: "solid" | "dashed"; // the style this definition aggregates; absent means solid-only
}
```

- Storage: `ViewDocument.summaryLabels?: Readonly<Record<string, SummaryDefinition>>`, keyed by `SummaryDefinition.id`. A definition is **authored input**: a host or producer writes it against the source view; the projection (§4.4.3) carries definitions through unchanged and never invents, rewrites or drops one.
- Source-view validation (`validateView` definition arm): `id` unique in the view; `sourceOccurrence` and `targetOccurrence` name entity occurrences of this view; `relationIds` is non-empty, sorted, names known relations, and for each named relation at least one endpoint target lies in the hierarchy subtree of `sourceOccurrence`'s entity and the other in the subtree of `targetOccurrence`'s entity (subtree = the entity plus its hierarchy descendants under the composed hierarchy), with the direction matching the definition's source/target order for directed relations; every relation whose endpoints satisfy that subtree condition for the pair is named (no omission, no extra). No folded state is consulted: a definition whose pair currently projects nothing (both endpoints visible and unrelated at the top level, as in the kit's `h2a:surfaces` child-to-child labels) is valid in the source view and simply inactive. Violations report `occurrence-endpoint-mismatch` with detail `summary-constituents-mismatch` (Appendix C gives the literal arms, including the inactive-valid case as a non-diagnostic witness).
- Uniqueness of the aggregate key: at most one definition per `(sourceOccurrence, targetOccurrence, effectiveStyle)` triple, where `effectiveStyle` is `strokeStyle ?? "solid"`. Two definitions for the same triple refuse as `occurrence-endpoint-mismatch` with detail `summary-duplicate-key`, even when their labels differ. Definitions for the same pair with different styles are distinct aggregates (§4.5.3).

#### 4.5.2 Active projection (derived per folded state, never stored)

For a folded view derived from the source, a definition is **active** for the ordered representative pair `(Rsrc, Rtgt)` and style `S` exactly when: the visible representative of `sourceOccurrence` is `Rsrc`, of `targetOccurrence` is `Rtgt`, `Rsrc ≠ Rtgt` or a fold is involved, and the set of relation ids whose occurrences project onto `(Rsrc, Rtgt)` with effective style `S` equals the definition's `relationIds` intersected with the relations that actually project in this state — with the normative tightening that an active definition SHALL name **exactly** the projecting set for its pair and style in that state, so a definition authored for one fold state that only partially matches another state is inactive there (the renderer falls back per §4.5.3) rather than mislabelled. Activation is computed at render time from the folded view plus the carried definitions; it is never persisted as a second record, and unfolding (collapsed set `∅`) deactivates every definition whose pair no longer arises while the definitions themselves remain stored for the next fold.

#### 4.5.3 Rendering and aggregation compatibility

- Aggregation groups projected occurrences by `(source representative occurrence, target representative occurrence, effective strokeStyle)`. A solid and a dashed relation therefore **never** merge into one stroke. The effective style of each occurrence is its view override if present, else its semantic `strokeStyle`, else `solid`.
- For an aggregate group with an active authored definition (§4.5.2) of the same style, the renderer draws the definition's `label` (and that style's stroke). For a group without an active definition, the renderer MAY draw the derived count label. An authored label never hides its constituents: the definition's `relationIds` are the constituent ids, validated in the source view (§4.5.1) and re-derived in the folded state (§4.5.2).
- Round trip: folded export and re-import (§10 roadmap) serialise each drawn aggregate as its authored label (when active) plus `relationIds` plus effective `strokeStyle`; re-import reconstructs the same definitions and the same per-relation `strokeStyle` values (§3.5.1). A round trip that returns counts in place of authored labels, merges mixed styles, or loses a constituent id fails.
- Corpus assertion: each acceptance instance's all-collapsed overview view SHALL carry the authored definitions of its source overview (for A1, the `4138a0ec` overview labels; for A2–A5 folded overviews, the labels authored in their source figures where they exist), each validated as a definition in its source view and active in the overview state. An overview that renders only “N links” where the source authored a label fails the instance.

### 4.6 Fixed footprints and the measurement API

This section replaces any prose of the form “layout receives measured headers” with exact types and a call sequence. The executor surface is §5.6; the component rendering contract that consumes the same line-layout result is owned by `SPEC_EVOL_DS_DIAGRAM_CARDS.md` and is referenced, not restated, except where the shared result is defined.

#### 4.6.1 Footprints: state-dependent, with a fixed-axis policy

Layout consumes a footprint per entity occurrence. A footprint is resolved from the composed presentation data plus view state (fold), never from a component constant and never from a family declaration. The presentation data carries (§5.5):

```ts
interface FootprintDecl {
  readonly width: number;   // card pixels at zoom 1
  readonly height: number;
  readonly fixedAxes: "both" | "height" | "none";
}
```

| Entity occurrence (in view state) | Footprint | `fixedAxes` | Source |
| --- | --- | --- | --- |
| Leaf occurrence (any family, any view) | fixed `460 × 200` | `both` | `frozen-requirement` |
| Container-family occurrence, **collapsed** in this view | fixed `460 × 200` | `both` | `frozen-requirement` (collapsed wrapping card takes the atomic-card size at every nesting level) |
| Container-family occurrence, **expanded** | computed: header height (§4.6.3) + children extent + frozen insets (rule gaps 4, content insets 16) | `none` (both axes are outputs) | `frozen-requirement` spacing values |
| `legend` occurrence, collapsed | fixed `460 × 200` (it is a container-family fold) | `both` | §4.1 |
| `legend` occurrence, expanded | computed like a container, over legend-key lines | `none` | this section |
| `legend-key` occurrence | width **follows the legend's inner width** (legend width minus its content insets); height fixed `64` | `height` (width is an input from the parent, height is fixed) | measured compact legend line of the validated HRPN scenes; a layout input, not a card token |

`fixed` is not a boolean on a type, it is `fixedAxes` on the footprint in a state. A collapsed container's footprint comes from the **view state** (fold), not from a second type declaration: the presentation data declares one footprint per presentation form, and this table maps (form, folded?) to the consumed footprint. The token change rule is unchanged: a token change that alters a fixed footprint recomputes placement, docks and routes in the same layout call; an appearance-only change inside an unchanged box never moves a dock.

#### 4.6.2 Measurement types (exact)

Text measurement is injected, as today, because the engine holds no font metric and no DOM. The `(text, role) => TextSize` measurer is replaced by a request/result pair that carries the entity, the wrapping width, the toggle allocation and the slot allocation, and returns the **shared line-layout result** that layout and rendering both consume:

```ts
type TextRole = "kicker" | "title" | "body" | "detail" | "footer"
              | "subtitle" | "legend-label" | "edge-label";

interface MeasureRequest {
  readonly text: string;
  readonly role: TextRole;
  /** Available wrapping width in card pixels for this slot in this entity state. */
  readonly availableWidth: number;
  /** Allocated lines for this slot in this state; overflow is lines beyond this count. */
  readonly allocatedLines: number;
  /** True when the slot belongs to a collapsed (card-form) occurrence. */
  readonly folded: boolean;
}

interface LineLayout {
  readonly lines: readonly string[];  // wrapped lines, in order; text is never altered
  readonly width: number;             // widest line, card pixels
  readonly height: number;            // lines.length × line-height(role)
  readonly overflow: boolean;         // true iff lines.length exceeds allocatedLines
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
  readonly allocatedLines: Readonly<Partial<Record<TextRole, number>>>; // frozen allocation per slot for this state
}

interface SlotMeasurement {
  readonly occurrence: OccurrenceRef;   // entity occurrence, or relation occurrence for edge-label
  readonly role: TextRole;
  readonly layout: LineLayout;
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

- The measurer is called per **slot**, with its `availableWidth` and `allocatedLines`. Roles are: `kicker`, `title`, `body`, `detail`, `footer`, `subtitle`, `legend-label`, `edge-label`. The same `LineLayout` (`lines`, `width`, `height`) MUST be usable to render the text: layout reserves `height` and the renderer draws `lines`. A second, divergent wrapping at render time is a contract violation.
- Per entity, layout reads **all** fragment slots (not only `name`): kicker, title, body, detail, footer for cards; kicker, title, subtitle, footer for containers and legends; label for legend keys and relation labels for edges. A measurer that receives only the title is a contract violation caught by the M1 layout tests.
- **Toggle allocation.** When `toggle` is true, the header's `availableWidth` for `title` (and `kicker`) is reduced by the toggle allocation (the fold control's reserved slot) **before** measuring, and the same reduced width is what the renderer wraps against. The header allocation with the control reserved therefore differs from the allocation without it by construction, and measurement and rendering use the same allocation for the same occurrence in the same view. There is no post-hoc `FOLD_TITLE` cap, no `padding-right` override and no parenthesis relocation.
- **Legend-key width.** A legend key is measured with `availableWidth` equal to the legend's inner width minus the swatch allocation, and placed at that width with height `64` (§4.6.1). Its `LineLayout` height is asserted ≤ 64 by the overflow rule; a longer label overflows the key line, never widens the legend by itself (the legend width is computed from its header and its longest key at the measured width — the key width follows the legend, the legend does not follow one key's unwrapped width).
- **Expanded width determination (order fixed).** An expanded container's inner width is determined **before** its header is measured: it is the maximum over (a) the header's unwrapped title/kicker width at the toggle-reduced allocation, (b) the widest fixed child footprint plus content insets, and (c) the grouping width implied by `LayoutHints` (§4.7), in that priority with (c) as an authored override. The header is then measured at that determined inner width, so subtitle wrapping is stable and vertical placement never depends on a width discovered afterwards. §4.6.3 step 2 fixes this order; a layout that measures an expanded header at the card width and later widens the box fails the §5.6 sharing test.

#### 4.6.3 Call sequence (normative order)

One `layoutDocument` / `layoutFolded` call performs, in order:

1. **Resolve.** Read the document through the shared resolver (§5.1); classify each occurrence (leaf / container-expanded / container-collapsed / legend / legend-key) from (effective type, fold set). Refuse unsupported profiles/types by name, as today.
2. **Determine widths bottom-up.** For every expanded container/legend, determine its inner width by §4.6.2 (children footprints and hints known before any header measurement). Fixed occurrences take their fixed width.
3. **Measure headers.** For every leaf and every container/legend occurrence, build its `EntityMeasurementInput` (folded form and expanded form are different inputs; a collapsed container is measured as a card with `folded: true`) and measure kicker/title/subtitle through `LineMeasurer`, producing a `HeaderMeasurement` per occurrence. Header measurements are computed **before** any child placement.
4. **Place children bottom-up.** Expanded containers place their visible children using the children's footprints (fixed children at their fixed boxes; nested expanded containers recursively), then compute their own box as header height + children extent + insets. Collapsed occurrences place no children and take the `460 × 200` box. The supplied header measurements **affect child placement observably**: a taller measured subtitle header pushes the first child row down by exactly the header-height delta (asserted in §5.6 tests by two measurers differing only in subtitle line count).
5. **Measure bodies and labels.** Measure card body/detail/footer lines at the card inner width, legend-key labels at the legend inner width, and edge labels at their label allocation, all through the same `LineMeasurer`.
6. **Dock and route.** Assign docks against fixed boxes under §4.6.4; route projected and untouched edges between representative anchors.
7. **Emit.** Produce the `ViewDocument` (occurrences with placed geometry, fold groups, projected endpoints per §4.4, `summaryLabels` definitions carried through) plus `LayoutResult { fit, warnings, measurements }` where `measurements` carries a `HeaderMeasurement` per entity occurrence **and** a `SlotMeasurement` for every non-header slot measured in step 5 (body, detail, footer, legend-label, edge-label), keyed by occurrence and role. Layout and rendering therefore share one line-layout result per slot; a renderer that re-wraps with a different width fails the §5.6 sharing test. M1 asserts the measurement output only; the renderer-sharing assertion over rendered pixels belongs to M2 (§10), and no M1 gate depends on it.

#### 4.6.4 Overflow result

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

#### 4.6.5 Fixed-size policy and docking overflow

- A fixed footprint (`fixedAxes: "both"`, or the fixed axis of a `height`-fixed footprint) is never enlarged, for docking or for any other reason. The current placement behaviour that grows a node to fit its dock slots is removed for fixed types (§5.6).
- When the docks required on one side of a fixed box exceed what the side holds at the declared slot spacing, the outcome is: keep the box, place the docks that fit in declared order, route the remainder from the box edge at the nearest free anchor, and report one `docking-overflow` layout warning per affected occurrence (side, required slots, fitted slots). No silent drop: every relation keeps an occurrence and a route (scene conservation, §4.4.7).
- Expanded containers are computed boxes and may grow for their children and headers; they never shrink a fixed child to fit.

#### 4.6.6 What “observing role calls” does not prove

A test that records that the measurer was invoked with each role, without asserting that the returned `LineLayout` changed placement, does not close blocking 2. §5.6 therefore requires: (a) two measurers differing only in measured subtitle height produce different first-child `y` by exactly that delta; (b) the `lines` returned at layout are the `lines` recorded in `LayoutResult.measurements` for every slot (same array content asserted through the layout fixture); (c) a toggle-bearing header wraps its title at the reduced width in both the measurement input and the emitted measurement. Role-call observation MAY be asserted additionally; it is never sufficient alone. The rendered-pixel sharing assertion is an M2 gate (§10), not an M1 gate.

### 4.7 Generic layout hints replacing consumer packing (recursive)

Consumer packing code (authored row/column trees, column stretch, zone spacing) is replaced by **generic layout input** — no consumer tree, zone id or scene flag enters the engine:

```ts
interface LayoutGroup {
  readonly id: string;
  readonly direction: "rows" | "columns";
  readonly members: readonly EntityRef[];
  readonly groups?: readonly LayoutGroup[];   // recursive: a group contains groups
  readonly stretch?: boolean;                  // scoped stretch for this group's computed boxes
  readonly gapAfter?: number;                  // gap after this group, card pixels
}

interface LayoutHints {
  /** Authored ordering of siblings where the host has an order to express. */
  readonly ordering?: Readonly<Record<EntityRef, readonly EntityRef[]>>; // parent -> ordered child ids
  /** Recursive grouping of roots or children into row/column bands, as data. Absent means engine grouping. */
  readonly grouping?: readonly LayoutGroup[];
  /** Stretch expanded containers (and their rows) to the group width. Never stretches a fixed card.
      A group-local `stretch` overrides this global value for that group. */
  readonly stretch?: boolean;
  /** Gap between sibling cards across the flow (horizontal neighbour gap). */
  readonly cardGapX?: number;
  /** Gap between sibling cards along the flow (vertical neighbour gap). */
  readonly cardGapY?: number;
  /** Gap between sibling containers/zones across the flow. */
  readonly zoneGapX?: number;
  /** Gap between sibling containers/zones along the flow. Distinct from zoneGapX. */
  readonly zoneGapY?: number;
  /** Gap between ranks (along-flow band gap). */
  readonly rankGap?: number;
}
```

- `LayoutOptions` gains `hints?: LayoutHints` (§5.6 file inventory). Defaults reproduce the current engine metrics (`rankGap` from `LayoutMetrics.rankGap`, card gaps from `nodeGap`, zone gaps defaulting to the corresponding card gap when unset), so an absent hint changes nothing. The r2 single `cardGap`/`zoneGap` scalars are superseded by the axis-split fields above; a caller that sets only the legacy intent sets both axes explicitly.
- **Semantics.** `ordering` constrains sibling order where listed (unlisted siblings sort by reference after listed ones, deterministically); `grouping` constrains which siblings share a row/column band **recursively** (a `LayoutGroup` may contain sub-groups with their own direction, stretch and gap, which is the exact carrier for the HRPN authored trees — `kit.root` and the `PPROZ` subtree of `scene-metadata.mjs:139–148` translate group-for-group, §8.4 records the per-scene translations); `stretch` widens **computed** boxes (expanded containers) and their row bands to the group width and never alters a fixed `460 × 200` card or a fixed axis, with group-local `stretch` taking precedence over the global value inside that group; `cardGapX`/`cardGapY` space card neighbours on each axis independently, `zoneGapX`/`zoneGapY` space container neighbours independently (setting one axis never moves the other), and `rankGap` spaces bands. Existing `rankGap`/`nodeGap` metrics remain the engine tuning; the hints are the per-call authored surface on top of them. Frozen card footprints are preserved under every hint combination (asserted in §5.6).
- **Corpus witnesses.** The HRPN packing behaviours map as data, not code: column stretch → `stretch: true` (global or group-local as the source scopes it); zone spacing (`zoneGapY: 96` in the adapter) → `zoneGapY: 96` with the card gaps at their scene values; authored row/column trees → `grouping` (recursive) plus `ordering` entries per scene. Each acceptance instance records the hints it was laid out with in its corpus manifest (§8); a layout that needs a consumer-side tree or a scene flag to reproduce the instance fails.

### 4.8 Filters, presentation and legend placement

View filters and presentation state are otherwise unchanged. The legend entity, when present, is placed by its occurrence geometry like any container; its keys are placed by the footprint of §4.6.1 inside it, ordered by `order` (§3.6.2). A host that prefers legend chrome outside the diagram omits the legend entity from the document and renders its own key list from consumer data — that is a consumer choice, and the generic figure never invents a legend the document does not declare (the model carries the legend, §3.6, or there is none).

## 5. Executor changes (`diagram-core`, plus the layout surface in `diagram-canvas`)

This section is the implementation contract for milestone M1 (model half, including the prerequisite layout/projection surface that M1 gates depend on — see §10 for the order). Each change names its exact files, its behaviour and its RED test: the test is written first and observed failing against the current executor for the stated reason, then passes after the change. No change weakens an existing refusal: every new acceptance is paired with the refusal that bounds it. Every mechanism below is family-neutral and is exercised under renamed identifiers (§5.4) so no family or presentation literal can hide in the executor.

Executor ownership follows G2: this repository implements and publishes the generic executor; Engram owns the profile data it executes (§7). Profile-content changes (§5.5) land as data in both places from the same hand-off (§7.3).

### 5.1 One shared, cycle-safe, profile-aware type resolver

This is the single resolver every other change uses. There is no second chain walk in validation, endpoint checks, migration or layout: a behaviour difference between call sites is a defect in the resolver, fixed once.

- **Files:** `packages/diagram-core/src/validate.ts` [M] (the resolver lives beside `effectiveEntitySchemas` and replaces its body; exported for tests through the existing validation surface), `packages/diagram-core/src/profile.ts` [M] (no shape change; the resolver reads existing declarations plus the `container` flag of §5.2). Canvas consumes it, it does not reimplement it: `packages/diagram-canvas/src/layout/graph.ts` [M] calls the core resolver (§5.6).
- **Contract.** Given `(document, profile, typeId)` the resolver returns one of:
  ```ts
  type ResolvedType =
    | { readonly kind: "profile"; readonly chain: readonly string[];        // [typeId, ...ancestors], profile ids only
        readonly schemas: readonly AttributeSchema[]; readonly container: boolean; readonly abstract: boolean }
    | { readonly kind: "refinement"; readonly chain: readonly string[];    // [definitionId, base..., ...profile ancestors]
        readonly schemas: readonly AttributeSchema[]; readonly container: boolean; readonly abstract: boolean }
    | { readonly kind: "refused"; readonly diagnostic: Diagnostic };
  ```
  Resolution walks document `TypeDefinition.baseType` links iteratively (explicit stack, no recursion) until a profile type is reached, collecting schemas base-first so a derived schema is `[...baseSchemas, ...definitionSchemas]` at every level. `container` is true iff any profile type on the chain declares `container: true`. `abstract` describes the **reached profile type only**: a document refinement of an abstract profile type is a concrete, instantiable type (`abstract: false` on the refinement result) while direct instantiation of the abstract profile type itself stays refused — the distinction the current executor already implements and which the resolver preserves verbatim. A refinement never concretises an abstract base by naming it directly as an entity type; it concretises it by refining it.
- **Refusals (all existing codes, no new code).** A base id declared by neither the document nor the profile → `unknown-entity-type` (details `{ type, profile }`, path `typeDefinitions.<id>.baseType` at the link that fails). A cycle in the document definition graph (including a self-refinement) → `type-definition-conflict` with details `{ cycle: "id+id+..." }` (members joined in walk order) on the first definition of the cycle in id order; the walk detects the cycle by visited set and never loops. An attribute redeclared at any level of the chain (same `name` as any base schema, profile or intermediate definition) → `type-definition-conflict` with details `{ attribute }` on the redeclaring definition (this is the inherited-name conflict: a chain `A refines B refines node` where `A` redeclares an attribute `B` added also refuses). A definition whose `profile` field names a different profile than the one being resolved against (cross-profile misuse) → `unknown-entity-type` with details `{ type, profile, declaredProfile }`: a definition is resolved only against its own declared profile, never silently against the caller's profile.
- **What replaces what.** `effectiveEntitySchemas(document, profile, typeId)` keeps its exported name and its return shape (`{ schemas } | { diagnostic }`) and is reimplemented as a projection of the resolver, so existing callers are untouched. Attribute validation, endpoint family checks (§5.2), legend/tone constraint execution (§5.4), migration remapping (§3.13) and canvas classification (§5.6) all read `chain`, `schemas` and `container` from the resolver.
- **RED tests:** `packages/diagram-core/tests/type-resolver.test.ts` [N] —
  1. a refinement of a refinement of `container` resolves to a chain ending in `container` with concatenated schemas and `container: true` — fails today with `unknown-entity-type` (one-level walk);
  2. chained attributes: values for attributes declared at each level validate, and an undeclared attribute still refuses `attribute-not-in-schema`;
  3. a cycle `A→B→A` and a self-cycle `A→A` each refuse `type-definition-conflict` without hanging (test completes under the suite timeout);
  4. a missing base refuses `unknown-entity-type`; an inherited redeclaration (grandchild redeclares a child-added attribute) refuses `type-definition-conflict`;
  5. a definition declaring profile `bpmn@1` resolved against `generic@1` refuses (cross-profile misuse), while the same definition resolved against its own profile succeeds;
  6. a concrete document refinement of an abstract profile type resolves with `abstract: false` and instantiates, while the abstract profile type itself refuses instantiation — the compatibility witness for the pinned executor behaviour.

### 5.2 Hierarchy parents by type family (closes gap 1)

- **Files:** `packages/diagram-core/src/profile.ts` [M], `packages/diagram-core/src/validate.ts` [M].
- **Profile shape:** `EntityTypeDeclaration` gains `readonly container?: boolean` (`true` means the type is in the container family and may parent through a hierarchy relation whose parent-family constraint (§5.4) names its family root; absent means leaf family). `validateProfile` refuses `container: true` on an abstract type (`type-definition-conflict`, detail `abstract-container`): an abstract container has no occurrence to fold or to draw.
- **Validation behaviour:** everywhere a role declares `entityTypes`, the check becomes family satisfaction through the resolver: the target entity satisfies the constraint when its effective base chain (§5.1) contains any declared type id. This replaces the strict-equality comparison at the current `validate.ts` endpoint check, for hierarchy parents and uniformly for every role of every profile (the A′ subsumption rule, §2.1). The diagnostic stays `endpoint-target-not-allowed` with the same path and refs; its `details` gain `seenChain` (the target's chain, joined with `>`) alongside the existing `seenType` / `allowed`, so a refusal explains the family it tested. `details` values remain scalars (Appendix C discipline).
- **What does not change:** role cardinality, target-kind checks (`entity` vs `port`), hierarchy cycle and multiple-parent checks, and the refusal for a leaf-family parent (a `node` refinement used as a hierarchy parent still refuses `endpoint-target-not-allowed`).
- **RED tests:** `packages/diagram-core/tests/hierarchy-family.test.ts` [N]:
  1. a `container` refinement (and a refinement of that refinement) used as a hierarchy parent validates with zero diagnostics — fails today with `endpoint-target-not-allowed` on the HRPN-shaped fixture;
  2. a `node` refinement used as a hierarchy parent still refuses `endpoint-target-not-allowed`;
  3. a non-hierarchy role naming `container` (a synthetic test profile) accepts a refined container target and refuses a refined node target, proving the rule is uniform, not a hierarchy special case;
  4. the same three cases under renamed family types (synthetic ArchiMate/BPMN/UML-shaped profiles) pass identically, proving no family literal is consulted.

### 5.3 Scoped uniqueness, legacy adapter, immutable published bytes

- **Files:** `packages/diagram-core/src/profile.ts` [M], `packages/diagram-core/src/validate.ts` [M], `packages/diagram-core/src/diagnostics.ts` [M] (no new code; see below).
- **Profile shape (new declarations):** the `unique-attribute` constraint gains a **mandatory** scope in the new declaration format:
  ```ts
  | { readonly kind: "unique-attribute"; readonly entityType: string; readonly attribute: string;
        readonly scope: "document" | "siblings" | { readonly withinType: string } }
  ```
  `document` = across every entity of the type in the document (the explicit form of the historical behaviour, for new declarations only); `siblings` = across entities sharing the same hierarchy parent (top-level entities form one sibling set), resolved through the profile's hierarchy constraint (§5.4), never through an assumed relation id; `{ withinType }` = across entities contained (transitively) under the same ancestor of the named type — the legend scope of §3.6 is `{ withinType: "legend" }` applied to `legend-key.category` and, separately, to `legend-key.order`. A `unique-attribute` declaration without a scope in a **new-format** profile refuses at `validateProfile` (`type-definition-conflict`, detail `unique-scope-missing`): an unscoped uniqueness is exactly the defect being removed, so the new shape makes it unrepresentable.
- **Validation behaviour:** `validateConstraints` groups by the scope key before comparing canonical values. Identity is never a uniqueness constraint: entity, relation, port and occurrence ids stay record keys checked as `duplicate-id` / `record-key-mismatch`, as today. Display titles (`name`, `kicker`, legend `name`) are unique nowhere in any completed composition.
- **Order rule (PR #193, kept per scope).** Within each scope group, constrained entities are walked sorted by id in UTF-16 code-unit order; the first id in that order is the reference and is never reported; each subsequent duplicate reports `refs: [reportedId, referenceId]` (the `610c0353` discipline). Reordering record insertion never changes which entity is reported. The whole diagnostics array for a document is compared as an array in the tests, under reordered input. **Total ordering of the diagnostics array (normative):** diagnostics are emitted sorted by `(path, code, refs[0] ?? "", refs[1] ?? "")` in UTF-16 order, so two runs over permuted inputs produce byte-identical arrays; Appendix C fixtures assert that array, not a set.
- **Diagnostic contract.** `unique-attribute-violation` keeps its code, severity `error`, path `entities.<id>.attributes.<attribute>` and refs order. Under the **new** contract its `details` gain exactly one new scalar: `scope` with value `"document"`, `"siblings"` or `"within:<typeId>"` (the `{ withinType }` object is flattened to a scalar string, because `Diagnostic.details` holds scalars only). Under the **legacy** contract (§5.3.1) no `scope` detail is added and the historical array is preserved byte-for-byte. Full frozen contracts in Appendix C.
- **RED tests:** `packages/diagram-core/tests/scoped-uniqueness.test.ts` [N]:
  1. two sibling `legend-key` entities with the same `category` under different legends validate; the same pair under one legend refuses `unique-attribute-violation` with `details.scope: "within:legend"`;
  2. two `container` entities both named « CI/CD » validate under the generic successor (zero diagnostics);
  3. a new-format test profile declaring `unique-attribute` without `scope` refuses in `validateProfile` (`unique-scope-missing`);
  4. `siblings` scope: two same-named cards under different parents validate, under one parent refuse (synthetic profile), proving the scope key is the parent, not the document;
  5. duplicate `order` values inside one legend refuse; the same values across two legends validate;
  6. the legacy fixture of §5.3.1 produces the historical diagnostics array byte-for-byte (no `scope` detail), under reordered input.

#### 5.3.1 Legacy compatibility adapter: published bytes never change

Every published profile's stored bytes are immutable: editing `packages/diagram-core/src/profiles/generic.ts` would change its G0 content digest (§7.3) and invalidate existing pins. The historical declarations are therefore preserved exactly, and interpretation goes through a **versioned compatibility adapter** selected by an **independent discriminator**, never by the absence of a field:

- **Discriminator.** Each profile artefact carries an explicit declaration-format identifier in its governed metadata (Engram record field `declarationFormat`, values `legacy-constraints@1` for every profile published before the scoped format, `scoped-constraints@1` for every new declaration). The executor bundle records the same binding per registered profile id in a pinned adapter table (`LEGACY_ADAPTER_BINDINGS`, part of the executor version, covered by the executor's own tests). A profile whose id is listed in that table is read through `LEGACY_PROFILE_ADAPTER = "legacy-constraints@1"`; every other profile is read as new-format. The table — not the presence or absence of `scope` — is the discriminator, so a malformed new profile that omits `scope` is never silently adopted as legacy: it hits the `unique-scope-missing` refusal of §5.3. Adding a profile to the legacy table after the scoped format ships requires a new adapter version and a fixture update, never a silent edit.
- **Adaptation.** When the validator loads a legacy-bound profile, it normalises each unscoped `unique-attribute` constraint in memory to `scope: "document"` — the semantics that profile always had — and records the adaptation in the validation trace (profile id + adapter version), never in stored bytes. New-format profiles never pass through the adapter for this rule.
- **Diagnostic projection.** Legacy validation projects its diagnostics through the legacy shape: `unique-attribute-violation` carries `details: { attribute, type }` exactly as at the branch base, with no `scope` key. New-format validation carries the `scope` scalar. The two projections are distinct code paths selected by the same adapter binding; a test asserts the legacy array byte-for-byte and the new array with its scalar, over the same duplicate input re-expressed under each format.
- **Digest discipline.** A digest is always computed over stored bytes (through the G0 projection, §7.3), never over the adapted in-memory form. The same discipline applies to any other legacy shape the scoped format supersedes: interpretation is versioned, stored profile bytes are immutable.

### 5.4 Legend, tone and hierarchy rules as generic constraint execution

- **Files:** `packages/diagram-core/src/validate.ts` [M], `packages/diagram-core/src/diagnostics.ts` [M] (adapter update, §5.4.1), `packages/diagram-core/src/profile.ts` [M] (constraint arms below).
- **Constraint declarations (all data, governed by Engram, covered by the G0 content digest of §7.3).** The `ProfileConstraint` union gains:
  ```ts
  | { readonly kind: "hierarchy"; readonly relationType: string; readonly hierarchyId: string;
      readonly parentRole: string; readonly childRole: string }
  | { readonly kind: "parent-family"; readonly hierarchyId: string; readonly familyRoots: readonly string[] }
  | { readonly kind: "children-restricted"; readonly parentFamilyRoots: readonly string[];
      readonly childTypes: readonly string[]; readonly hierarchyId: string }
  | { readonly kind: "required-parent"; readonly childTypes: readonly string[];
      readonly parentFamilyRoots: readonly string[]; readonly hierarchyId: string }
  | { readonly kind: "category-membership"; readonly valueTypes: readonly string[]; readonly attribute: string;
      readonly legendType: string; readonly categoryType: string; readonly categoryAttribute: string;
      readonly tokenAttribute: string; readonly neutralValue: string; readonly bindingAttribute: string;
      readonly hierarchyId: string }
  ```
  Existing arms (`acyclic-hierarchy`, `unique-attribute`, `max-entities-of-type`) are unchanged except for the scoped form of `unique-attribute` in §5.3. `PROFILE` compositions declare: generic successor — `hierarchy(contains, containment, parent, child)`, `parent-family(containment, ["container", "legend"])`, `children-restricted(["legend"], ["legend-key"], containment)`, `required-parent(["legend-key"], ["legend"], containment)`, `category-membership(valueTypes: ["node", "container", "legend"], attribute: "tone", legendType: "legend", categoryType: "legend-key", categoryAttribute: "category", tokenAttribute: "token", neutralValue: "neutral", bindingAttribute: "legendRef", hierarchyId: "containment")`. ArchiMate/BPMN/UML compositions declare their own hierarchies and matrices under their own identifiers; none declares the legend constraints unless it composes the fragment.
- **Behaviour.** The executor implements the generic mechanisms, each driven entirely by its constraint declaration; no type id, attribute name or relation id is literal in the mechanism:
  (a) `children-restricted`: a hierarchy child whose parent's effective type is in `parentFamilyRoots` must have an effective type in `childTypes`; violations report `legend-key-parent-invalid` arm A (Appendix C).
  (b) `required-parent` (the inverse direction): an entity whose effective type is in `childTypes` MUST have a hierarchy parent (under `hierarchyId`) whose effective type is in `parentFamilyRoots`. A key under a plain container, a key under a leaf, and an orphan key with no hierarchy parent each refuse — arms B, B and C of `legend-key-parent-invalid` respectively (Appendix C gives the three literal messages). This is the mechanism that enforces “keys live only under legends” in both directions; `children-restricted` alone leaves other parents unconstrained and is never presented as enforcing it.
  (c) `category-membership`: as defined in §3.6.3, executed with every selector taken from the declaration (`legendType` identifies the legend family for the binding walk, `hierarchyId` identifies the containment walk that collects keys under each legend, `tokenAttribute` names the compared value, `bindingAttribute` names the per-entity legend reference). Violations report `tone-category-unknown`, including the `bound-target-not-legend` arm when `legendRef` names a non-legend entity. When the composed stack declares no `category-membership` constraint, no membership check runs at all (shape only, §3.3). When the constraint exists but the document contains no legend-family entity, every non-neutral value reports `undeclared`.
  (d) `parent-family` + `hierarchy`: executed as in §5.2/§3.4 through the resolver. Icon names are not checked semantically (§3.3). Hierarchy cycle/multiple-parent checks read the hierarchy ids from the `hierarchy` constraint.
- **Frozen diagnostic contracts.** Both new codes are frozen in Appendix C with path template, literal message, refs (content and order), scalar `details` keys and values, multiplicity and severity (`error` for both). `details` values are scalars only: in particular the uniqueness `scope` detail is the flattened scalar of §5.3, never the `{ withinType }` object. Tests compare whole diagnostic arrays (`code`, `severity`, `path`, `message`, `refs`, `details`) under reordered input and assert byte-identical arrays in the total order of §5.3.
- **RED tests:** `packages/diagram-core/tests/profile-constraints.test.ts` [N]:
  1. Under the generic composition: a legend with keys explains the tones used by its document (zero diagnostics); an undeclared tone in a legend-bearing document refuses `tone-category-unknown` (`legendBinding: "undeclared"`); a key parented by a plain `container` refuses `legend-key-parent-invalid` arm B; an orphan key refuses arm C; a non-key child under a legend refuses arm A; the same tone in a document whose stack omits the membership constraint validates (shape only). Each fails today (`unknown-entity-type` for the legend types, or no mechanism).
  2. **Synthetic profile, different identifiers:** a profile declaring types `palette` (container family) / `swatch`, hierarchy relation `nesting`, value attribute `hue`, category attribute `code`, binding attribute `paletteRef`, with the same constraints under those names, enforces parenting (both directions), membership (including the ambiguous-binding refusal of test 4) and scoping identically. A build whose executor source contains the literal `"legend"`, `"tone"` or `"contains"` outside profile data, fixtures and messages fails this gate (source scan asserted in the test).
  3. **Omitted constraints:** the synthetic profile minus `children-restricted`, `required-parent` and `category-membership` validates a `swatch` under a plain container, an orphan `swatch` and an undeclared `hue` — proving no rule leaks in by name matching.
  4. **Ambiguous binding:** two legends declaring the same category with different tokens; an unbound entity using that tone refuses `tone-category-unknown` (`legendBinding: "ambiguous"`); the same entity with `legendRef` set to either legend validates; two legends agreeing on the token validate unbound; a `legendRef` naming a non-legend refuses `bound-target-not-legend`. Whole-array equality asserted under all insertion-order permutations of legends, keys and entities.

#### 5.4.1 Engram diagnostic-adapter handoff (versioned)

The three new codes (`legend-key-parent-invalid`, `tone-category-unknown`, `text-pattern-mismatch`) plus the numeric codes of §5.8 are not in the G0-frozen `DiagnosticCode` union (G0 source shape S-DSDIAG at `25c0f3d3`). They enter the system only through a **versioned Engram diagnostic adapter**:

- Engram publishes a diagnostic-adapter revision that maps each new native `diagram-core` code to its G0 diagnostic variant, preserving the native code verbatim in `nativeCode`, every native field (`severity`, `path`, `message`, `refs`, scalar `details`) and the total order of §5.3. The adapter revision is pinned by digest in the catalog entry (§7.4); an executor build and an adapter revision are qualified together (study §7 M4).
- Receipt round-trip fixtures (normative): for each new code, a native diagnostic serialised by `diagram-core`, carried through the adapter, and read back yields the identical native code, fields and order. A code with no adapter mapping refuses catalog admission (`missing-receipt` discipline, §7.4); it never acquires a second evaluator and never renames the native code.
- BPMN diagnostics are unaffected: bpmn-canvas Report/2 codes keep their own adapter path and are never routed through the diagram adapter.

### 5.5 Completed profile declarations (data)

- **Files:** `packages/diagram-core/src/profiles/generic.ts` [M] (add the `generic@2` declaration beside `genericProfile`, which stays untouched byte-for-byte), `packages/diagram-core/src/profiles/completed.ts` [N] (the completed declarations and the presentation-fragment composition data live here so no published file is ever edited; the module is the single transcription point of §7.3), `packages/diagram-core/src/profiles/skeletons.ts` [M] (completed `archimate@1` / `uml@1` declarations added beside the skeletons, which stay untouched; the BPMN generated profiles are **not** transcribed here — they are generated artefacts pinned by digest, §3.10), `packages/diagram-core/src/profiles/index.ts` [M] (register every completed profile; the registry holds the previous profiles plus the completed ones), `packages/diagram-core/src/profile.ts` [M] (the `footprint`, constraint-shape and schema additions).
- **Generic successor declaration:** profile id `generic@2`, `completeness: "complete"`. Entity types `node`, `container` with the fragment slots of §3.2 (composed schema), `container: true` on `container`; fragment types `legend`, `legend-key` available through composition (§3.6, `order` with its numeric constraints). Port type `port` unchanged. Relation types `link` (label ≤ 200, `strokeStyle` enum), hierarchy relation (tree), `association` (label ≤ 120, `strokeStyle` enum) unchanged otherwise. Constraints as in §5.4. Limits as in §3.8. Notes state that fold is view state and that `generic@1` documents migrate by §3.13.
- **ArchiMate / UML declarations:** the completed matrices of §3.9 / §3.11 as data in the same module discipline (skeleton bytes untouched, completed versions added beside them, each with its own governed version and digest). No card slot, legend type or footprint appears in either declaration.
- **Profile shape additions:** `EntityTypeDeclaration` gains `readonly container?: boolean` (§5.2). The presentation data gains `FootprintDecl` (§4.6.1). `validateProfile` refuses a non-positive or non-finite footprint dimension (`limit-exceeded` on the profile path, detail `footprint`) and an unknown `fixedAxes` value (`type-definition-conflict`).
- **RED tests:** `packages/diagram-core/tests/completed-profile.test.ts` [N]: the registry lists every completed id; `validateProfile` of each completed declaration is empty; each fragment slot validates at its bound and refuses one character past it (`text-too-long`); an undeclared slot (for example `subtitle` on a generic `node` without composition) still refuses `attribute-not-in-schema`; `generic@1`'s profile digest and validation results are unchanged (§5.3.1); the ArchiMate matrix fixtures and UML multiplicity fixtures validate/refuse as §3.9/§3.11 declare. Fails today (`unknown-profile` / missing export).

### 5.6 View validation for folded projections; layout surface; measurement execution

Core view change:

- **Files:** `packages/diagram-core/src/view.ts` [M] (`RelationOccurrenceEndpoint.semanticTarget?` + `sourceOccurrence?`; `RelationOccurrence.strokeStyle?`; `VisualGroup.occurrence?`; `ViewDocument.summaryLabels?`; `VIEW_DOCUMENT_FIELDS` gains exactly `"summaryLabels"` — a test asserts the view field set still refuses a stray `hover`-style key), `packages/diagram-core/src/validate.ts` [M] (the checks of §4.4.4, the definition/activation checks of §4.5, fold-group binding validation of §4.1.1, and dependency-aware deletion support of §5.7, reusing `occurrence-endpoint-mismatch` and `dangling-reference`; no new `DiagnosticCode` for folds).
- **RED tests:** `packages/diagram-core/tests/folded-view.test.ts` [N]:
  1. the Appendix B document and folded view validate with zero diagnostics — fails today as `occurrence-endpoint-mismatch`;
  2. the same view with `semanticTarget` removed refuses `occurrence-endpoint-mismatch` (the projection field is load-bearing, not decoration);
  3. a `semanticTarget` naming a target of a different role, a representative that is not a collapsed ancestor, an inner (non-outermost) representative in a nested fold, and a representative in the leaf family each refuse with the §4.4.4 details (`projection-not-folded`, `projection-not-outermost`, `representative-not-container`, `representative-hidden`);
  4. **nested collapse:** outer → inner → card with both containers collapsed (the HRPN `TOPIC`/`MSGZ`/`PPROZ` shape) projects the card's edges to the outer representative and validates; the inner representative is never drawn;
  5. **repeated fold/unfold restores:** `projectView` cycles (collapse set A → ∅ → A → ∅) reproduce identical canonical bytes at each repetition, and the ∅ view's relation occurrences are byte-identical to the source view's, including `strokeStyle` presence and `summaryLabels` definitions (projection recomputed from the retained source, §4.4.2);
  6. **multiple occurrences:** one container entity drawn twice, folded in one drawing only; edges to children of each drawing project (resp. do not project) independently, and unfolding restores each original endpoint occurrence by id;
  7. **ports:** a link to a port inside a collapsed container projects to the representative (port counterpart where one exists, entity occurrence otherwise) with port provenance, validates, and restores;
  8. **filters combined:** an endpoint hidden by a filter and by a fold at once produces the §4.4.6 exclusion; clearing the filter alone and clearing the fold alone each restore the correct drawing;
  9. **revision:** every fold/unfold in tests 4–8 runs at document revision 0, and again on the HRPN-shaped fixture at revision 1, with `view.revision === document.revision` at every step and unchanged semantic bytes;
  10. an internal relation occurrence in a folded view validates and is excluded by the scene as `endpoint-hidden` (asserted in `diagram-canvas` tests below);
  11. **n-ary association:** a three-member association spanning two collapsed branches and one external entity projects each endpoint independently, validates, aggregates only within its single effective style, and restores; a visible self-link with no fold involved stays untouched;
  12. **summaries:** a definition valid but inactive in the source view (§4.5.1, the kit `h2a:surfaces` shape) validates in the source, activates in the folded overview, refuses on a duplicate aggregate key (`summary-duplicate-key`) and on a constituent mismatch, and survives a fold/unfold cycle unchanged.

Layout surface (`packages/diagram-canvas`), in the same milestone (M1 includes this surface; §10 orders the gates accordingly):

- **Files:** `packages/diagram-canvas/src/layout/types.ts` [M] (`LineMeasurer`, `MeasureRequest`, `LineLayout`, `EntityMeasurementInput`, `SlotMeasurement`, `HeaderMeasurement`, `MeasurementOverflow`, recursive `LayoutHints` of §4; `LayoutOptions` gains `collapsed: readonly OccurrenceRef[]`, `hints?: LayoutHints`, and reads footprints from the composed presentation data; `TextMeasurer`/`TextSize` kept as a deprecated adapter that wraps a `LineMeasurer` for one release, never the other way), `packages/diagram-canvas/src/layout/graph.ts` [M] (read every fragment slot into the working graph through the shared core resolver — chained refinements classify correctly; keep the refusal for unsupported profiles/types by name; accept every completed family profile, not only the generic successor), `packages/diagram-canvas/src/layout/engine.ts` [M] (accept every completed profile alongside `generic@1`; stamp fold groups from the collapse input instead of emitting `groups: {}`; produce projected relation occurrences per §4.4.3 and placed folded geometry per §4.6.3 when a collapse input is present; run the §4.6.3 call sequence), `packages/diagram-canvas/src/layout/place.ts` [M] and `packages/diagram-canvas/src/layout/dock.ts` [M] (fixed footprints never enlarged; docking overflow per §4.6.5; recursive hints of §4.7 honoured), `packages/diagram-canvas/src/visibility.ts` [M] and `packages/diagram-canvas/src/scene.ts` [M] (projected edges are items, internal edges are `endpoint-hidden` exclusions; conservation asserted as today).
- **Layout warnings:** `LayoutWarningCode` gains `docking-overflow`, `card-overflow`, `zone-overflow`. No other warning code is added.
- **RED tests:** `packages/diagram-canvas/tests/layout/fixed-footprint.test.ts` [N] (a card with maximal docks keeps `460 × 200` and reports `docking-overflow`; a collapse-all layout emits `460 × 200` collapsed boxes, never the source expanded box; fails today by enlarged/retained geometry), `packages/diagram-canvas/tests/layout/folded-projection.test.ts` [N] (laying out an acceptance document with a collapse input returns a view that passes `validateView` and whose scene conserves occurrences; fails today because no collapse input exists), `packages/diagram-canvas/tests/layout/measurement.test.ts` [N] (the §4.6.6 assertions: header-height delta moves the first child row by exactly that delta under two measurers; emitted `measurements` carry every slot's `lines`; toggle headers wrap at the reduced width; legend-key height stays 64 at the legend-following width; an expanded header measured at its determined width), `packages/diagram-canvas/tests/layout/hints.test.ts` [N] (`stretch` widens expanded containers but never a fixed card; `zoneGapY` and `zoneGapX` move disjoint sibling sets; recursive `grouping` reproduces the recorded HRPN trees as data, group-local stretch included).

### 5.7 Commands, migration registration and remaining core files

- **Commands:** no new command kind. Slot edits travel through `update-entity-attributes`; legend keys are ordinary entities (`create-entity`, `delete-entity` with its explicit policy); folds mint no command (§4.1). `packages/diagram-core/src/commands.ts` [M] is extended only for **dependency-aware deletion and inverse restoration over the new view references**: deleting an entity occurrence cleans its fold group (`VisualGroup.occurrence`), its projected endpoints (`sourceOccurrence` / `semanticTarget` are rewritten only through re-projection from the retained source, never patched), and any `summaryLabels` definition that names the occurrence or a relation being deleted (the definition is removed with the deletion and restored by its inverse, byte-for-byte). Deleting a semantic relation removes it from every definition's `relationIds`; a definition that would become empty is removed with the deletion and restored by the inverse. Final-state validation after any such cascade SHALL pass; a delete that leaves a dangling fold group, provenance or constituent is a defect. RED tests: delete/undo witnesses on folded and summarised views (fold group, projected endpoint, summary definition each removed and restored exactly), plus the established round-trip: `packages/diagram-core/tests/commands-inverse.test.ts` [M] gains the `generic@2` case (a completed-profile document round-trips `command → inverse → initial content` byte-for-byte on canonical content with revisions normalised) and an assertion that the command-kind list gains no fold or legend kind.
- **Migration:** `packages/diagram-core/src/migrate.ts` [M] registers the §3.13 profile migrations in a profile-migration registry parallel to the schema migrations (same report shape: `from`, `to`, operations, `unmigrated`, original retained, plus `adapter` naming `legacy-constraints@1` where the legacy interpretation was used). `packages/diagram-core/src/document.ts` [M] only in its documentation of the current schema version (no field change by this lot; the A′ `2.0` bump is governed by §6 gates). RED tests: `packages/diagram-core/tests/migrate-completed.test.ts` [N] —
  1. a plain `generic@1` graph with a relation and a port migrates: every `.profile` field (document, entities, relations, ports, type definitions) rewritten, zero records still naming the source profile, output validates with zero diagnostics, ids and content retained, every transformation present in `operations`;
  2. `collapsed` absent / `false` / `true` produce the three distinct report lines of §3.13.1 step 4;
  3. a compatible refinement (the `hrpn-card` shape) is promoted where it overlaps and **retained residually** where it carries a consumer attribute (the `kicker` + `ticket` case: `ticket` schema and values survive, dependents re-based, output validates); a kind-conflicting overlap is retained renamed with its recorded operation; deleting a definition alone never happens;
  4. a blocking reserved-name collision refuses atomically (original returned unchanged, no partial rewrite); mixed majors refuse; reversed record insertion yields identical operations and identical output bytes; the original is recoverable from the report byte-for-byte;
  5. an unknown profile major refuses in write and is preserved; unrelated profiles in the same document are untouched;
  6. **resolve witness:** the resolved `generic@2` declaration contains no container-name uniqueness, no container count limit, and `link` label bound 200 (§3.13.4).
- **Diagnostics summary:** the `DiagnosticCode` union gains exactly the codes frozen in Appendix C through the adapter of §5.4.1 (`legend-key-parent-invalid`, `tone-category-unknown`, `text-pattern-mismatch`, `quantity-not-integer`, `quantity-below-min`). Folded-projection refusals reuse existing codes with new `details` values (§4.4.4), so consumers that switch on codes see no new refusal class for folds.
- **Barrel and docs:** `packages/diagram-core/src/index.ts` [M] re-exports nothing new by name beyond the completed profiles and the resolver/measurement types (the new types ride the existing module exports); `packages/diagram-core/README.md` [M] records the completed model, the family/scope/constraint rules and the folded-view contract in English.

### 5.8 Declarative text and numeric constraints

- **Files:** `packages/diagram-core/src/attributes.ts` [M] (the `text` schema arm gains `minLength?`, `pattern?`, `patternName?`; the `quantity` schema arm gains `integer?: boolean`, `min?: number`, `max?: number`; `validateScalar` checks length bounds then pattern for text, in that order, so a too-long value reports `text-too-long` and a malformed in-bounds value reports `text-pattern-mismatch`; for quantity it checks finiteness, then integrality (`quantity-not-integer`), then bounds (`quantity-below-min` / `quantity-above-max`), then unit — unit reporting keeps its named-case priority only where the existing order already guarantees it), `packages/diagram-core/src/diagnostics.ts` [M] (the new codes, through §5.4.1), `packages/diagram-core/src/profile.ts` [M] (`validateProfile` refuses a `pattern` that does not compile as an anchored ASCII RegExp, a `pattern` without a `patternName`, a `minLength` greater than a declared `maxLength`, or numeric bounds with `min > max`, as `type-definition-conflict` detail `text-pattern-invalid` / `numeric-constraint-invalid` — a profile with an unexecutable grammar is refused at qualification, never at document time).
- **Behaviour:** patterns are matched against the whole value (the stored pattern source is used as given; profiles declare anchored sources, §3.3). Matching uses the host `RegExp` with no flags; no Unicode flag is added, so the ASCII grammar means the same bytes everywhere. Pattern validation runs for every text value of a schema that declares one, including collection items whose item schema declares one. Numeric constraints are part of the profile's declarative content and are covered by its `contentDigest` (§7.3): changing `integer` or `min` changes the digest.
- **RED tests:** `packages/diagram-core/tests/text-keys.test.ts` [N]: empty value refuses `text-pattern-mismatch` (`pattern: "key"`); uppercase, embedded whitespace and `#fff` refuse; a well-formed unknown icon name validates; a dotted token validates under `token-name` and refuses under `key`, while a single-segment hyphenated key validates under **both** (the subset relation is asserted, never denied); a minimum-length-only schema refuses with `pattern: "min-length"`; a profile declaring a non-compiling pattern refuses in `validateProfile`. `packages/diagram-core/tests/numeric-constraints.test.ts` [N]: `order: -1` refuses `quantity-below-min`, `order: 0.5` refuses `quantity-not-integer`, `order: 0` and `order: 3` validate, and the same constraints under a renamed synthetic attribute refuse identically.

## 6. BPMN no-regression: behaviour, canonicalization, fixture identity

Study N13 and R-06 bind this lot: BPMN rendering and editing never lose extensions, and bpmn-canvas, Focus, d2d and diagram-core never diverge. This section is the non-regression contract. It changes no BPMN behaviour; it states what must stay identical and where coordination happens.

### 6.1 What does not change

| Surface | Frozen property | Pinned evidence |
| --- | --- | --- |
| bpmn-canvas behaviour | Every existing bpmn-canvas test verdict, F1 codec verdict and layout verdict at the pinned bpmn-canvas revision stays as it is. This lot adds no BPMN rendering, editing or lint behaviour. | bpmn-canvas checkout `/home/antoinefa/src/bpmn-canvas` (HEAD `05f7378` at inspection, message “Record the conductor deferral…”); its suite is the oracle, not this spec. |
| `profile-c14n/2` output | `canonicalize` / `rawDigest` / `canonicalDigest` / `stableId` in `/home/antoinefa/src/bpmn-canvas/src/profile/canonical.ts` (sha256 `287d8cb87beb7384fc89a8d6141681010dcba50ee895aaadc3b31345541191ba`) produce byte-identical output for every existing input. No re-canonicalization, no trailing-LF handling change, no number-token change. | Canonical vectors `tests/fixtures/parity-corpus/canonical-vectors.json` (sha256 `f238aef110a43381416fd0025326f883f760dc75510a9f0cc5817415eb02d1c6`) keep their digests. |
| Fixture identity | Every existing bpmn-canvas fixture keeps its path and SHA-256. The corpus `tests/fixtures/corpus/*.bpmn` (10 files, §8.3) and the parity corpus `tests/fixtures/parity-corpus/cases/W*.json` (W01–W12 with variants, index sha256 `40284149ca3538b35250e5896694e7d15c80d3c3233241e0d7ac3d91266df03a`) are read, never rewritten, by any M1 lot. | Hashes computed from the files at inspection (§8.5 manifest); a mismatch aborts the lot as a fixture error. |
| Unique-attribute parity (Q-G0-2) | The `diagram-core` order rule fixed at DS commit `610c0353` (UTF-16 id order, first id is the reference, refs `[reported, reference]`) holds inside every scope (§5.3) and is not reimplemented in bpmn-canvas, d2d or the catalog. | PR #193; §5.3 tests under reordered input. |
| `bpmn@1` readability | Documents naming `bpmn@1` (skeleton) keep validating/refusing exactly as at `8d1727a1` until the separate A′ lot ships the generated family under its G0/G3 gates. This lot removes nothing from `skeletons.ts`. | Skeleton sha256 `0a01fd2569e68c2b99ca754f28dc7cbbbd9a1d491ffa9981161cae3bbf56b54e` unchanged by M1. |
| d2d contracts | d2d keeps its private business profile, its `profile-c14n/2` bytes, its compatibility matrix (mechanismVersion × profile version × document version, one error code per case) and its JS/Python byte parity. The guardian holds pins and receipts only, never private content (d2d position §1–§3). | d2d position `evidence-astra/threads/ontology/d2d.md`: parity corpus `profile-corpus-v1.0.0` (198 files, manifest-pinned), `unicode-case/1` (UCD 15.0.0). |

### 6.2 Regression gates (all must hold before any BPMN-adjacent claim)

1. **bpmn-canvas suite unchanged.** The bpmn-canvas test suite at its pinned revision passes with the same verdicts before and after M1. M1 runs it read-only; it edits no file under `/home/antoinefa/src/bpmn-canvas`.
2. **c14n vectors unchanged.** Every vector in `canonical-vectors.json` recomputes to its recorded digest; `profile-corpus` and `unicode-case` pins recompute identically.
3. **Fixture hashes unchanged.** Every hash in §8.5 for bpmn-canvas and d2d-shared artefacts recomputes from the files. Any drift is a fixture error that stops the lot, never a test update.
4. **Skeleton verdicts unchanged.** The `bpmn@1` skeleton fixtures (`fixtures/valid/bpmn-skeleton-document.json` and its rejected cases) produce the same diagnostics arrays (total order §5.3) before and after M1. The legacy adapter (§5.3.1) is the only permitted interpretation change, and it preserves those arrays byte-for-byte.
5. **No second evaluator.** No M1 code validates BPMN semantics outside `diagram-core` (for DIA entries) and the bpmn-canvas/d2d libraries (for MECH/D2D entries). The Engram guardian executes no library (§7.4).

### 6.3 Coordination points

| Point | Owners | Contract |
| --- | --- | --- |
| F1 shape (moddle JSON) | bpmn-canvas (producer) ↔ DS (consumer via A′) | Alignment items F1-A1…A7 (A′ §4.4) stay `unknown` until bpmn-canvas publishes F1. M1 consumes no unpublished F1 shape. Owner decision 2026-10-15 (F1 preserves unknown extensions, `xmlns`, `xsi`) is the target; its lot is tests-first on the bpmn-canvas side. |
| Generated BPMN profiles | Engram (governance) + DS (executor) + bpmn-canvas (oracle) | Descriptor snapshot pinned by SHA-256 (A′ §8); bijection `moddle JSON ↔ DiagramState` proven in the separate private package with bpmn-moddle as a pinned test dependency; gate G3 (no `bpmn@2` document persisted outside fixtures before the multi-view bijection passes). |
| `profile-c14n/2` | bpmn-canvas + d2d (producers), Engram (pin holder) | Bytes are identity. Any c14n change is a new canonicalization version with its own vectors, never an in-place edit. |
| Private d2d profile | d2d (owner) ↔ Engram (catalog) | Tenant-scoped catalog entries (digest, owner, stack, corpus ref) with no content exposure; adoption at or after d2d lot 6; no runtime MCP dependency in d2d import/lint/render/export paths. |
| Watermark / licence | bpmn-canvas | `SENTROPIC_BPMN_WATERMARK_LICENSE` server-side protection (study N13) is untouched by this lot. |

## 7. Engram side: what Engram holds, what the DS keeps (G2)

Governance is G2, verbatim: « Engram governs profiles, schemas, fixtures and migrations. The Design System retains and publishes the generic @sentropic/diagram-core executor, layout and rendering. Consumers pin profiles; no second diagram metamodel. » The frozen guardian contracts (`SPEC-G0-guardian-contracts.md`, pinned in the oracle manifest of §8.5) apply: an ontology is a five-part record (versioned profile, conformance corpus, identity and digests, lineage record, catalog entry), no part alone is an ontology, and the guardian invents no third profile shape — the diagram shape stays the `diagram-core` `Profile`, the Engram shape stays the Engram `OntologyProfile`, referenced through explicit versioned adapters. This section states the completed-families instance of that contract. Engram artefacts are produced in the Engram repository by its own lots; this repository consumes them by pin.

### 7.1 What Engram must hold for each completed family

All of the following, per family (`generic`, `archimate`, `bpmn` generated stack, `uml`), versioned and immutable once published (bytes under an id and version never change; any change is a new version):

1. **The profile definition as data**: the completed declaration of §3.8/§3.9/§3.10/§3.11 plus the presentation-fragment composition, serialized canonically (entity, port and relation types with roles and cardinalities, the `container` family flags, footprints, constraints with their scopes, limits, completeness, notes, declaration format §5.3.1). This is the normative declaration; the TypeScript literal in this repository is a transcription checked against it (§7.3), not a second authority. For BPMN the definition is the generated artefact set with its descriptor snapshot pin.
2. **JSON schemas**: (a) the profile schema (what a profile document must satisfy, used by `validateProfile` qualification); (b) the `SemanticDocument` schema at the schema version this executor generation writes (unchanged shape by this lot, §3.13; the A′ `2.0` schemas join when that lot ships); (c) the `ViewDocument` schema including the `semanticTarget`/`sourceOccurrence` endpoint fields, the `strokeStyle` occurrence field, the fold-group `occurrence` field and the `summaryLabels` record of §4. Schemas are generated from or checked against the executor's validators by fixture, never hand-diverged.
3. **The conformance corpus**: the §8 acceptance documents and views (valid instances), the rejected cases with asserted diagnostics (including the §5 cases: leaf parent, spurious and non-outermost projections, duplicate legend category and duplicate order in one legend, undeclared and ambiguous tone bindings, key under a plain container, orphan key, missing uniqueness scope in a new-format profile, malformed keys, negative/fractional legend order), and the command/inverse sequences. A profile without its green corpus is a draft outside the catalog and is not pinnable (§7.4 admission).
4. **Migrations**: the registered profile migrations of §3.13 as versioned functions with their report contracts, plus the schema-migration references the lineage records need. Migration functions keep the original; an unknown major refuses in write.
5. **The ontology record and catalog entry**: the complete G0 hand-off mapping of §7.4 (every field named there, with its value rule for these profiles). Publication is the G0 §5.5 admission gate (§7.4), never “green corpus” alone.
6. **The diagnostic-adapter revision** of §5.4.1, pinned by digest, with its receipt round-trip fixtures.

Engram also keeps its existing stewardship unchanged: no private consumer content is held guardian-side (private stacks are pins, digests and receipts only, including the d2d private profile), display labels are never identity, and preserved foreign content keeps its three levels and is never promoted.

### 7.2 What the DS keeps in this repository

- The **generic executor**: `packages/diagram-core` (validators including the shared resolver and the generic constraint mechanisms, commands with inverses, canonical serialisation, migration runtime, diagnostics) and `packages/diagram-canvas` (scene, visibility, transform, hit test, layout engine including the §5.6 fold, measurement and hints surface). The executor executes whatever pinned profile it is handed; it contains no family content beyond the transcription literals used by tests and by consumers that pin this repository's build before the Engram publication is qualified (the transitional state G2 allows: a pinned build-time copy, replaced by the pinned Engram artefact once its implementation and qualification evidence exist — two distinct evidence states, never conflated).
- **Rendering contracts by reference**: the card/container/legend rendering contract is owned by `SPEC_EVOL_DS_DIAGRAM_CARDS.md`; this repository keeps the components, tokens, pictogram registry and themes that implement it (roadmap M2, §10). No runtime rendering path depends on a network or MCP call: consumers load pinned profiles offline at build or start time.
- **This specification and its successors**, plus the executor's own unit fixtures. Conformance fixtures that Engram catalogs are mirrored here only as test inputs pinned by digest (§7.3), never edited into a local variant.

### 7.3 Digests: G0 exact preimages, vectors, and the separate artifact digest

Digests follow G0 §7 exactly; this section restates the operative preimages so an implementer never has to guess which bytes are hashed, and names the one additional digest this lot needs under a different name. `resultDigest` changes exactly when its effective preimage changes; a pin change necessarily changes `pinsDigest` and changes `resultDigest` only when the resolved effective declarations or rule set change (the r2 sentence that every pin change changes `resultDigest` is withdrawn).

#### 7.3.1 The four G0 digests (never interchanged)

| Digest | Question it answers | Preimage (G0 §7.2) | Changes when |
| --- | --- | --- | --- |
| `contentDigest` | Which profile bytes are these? | Per shape. For a diagram profile: **P-CONTENT-DIAGRAM** (§7.3.2). d2d keeps its `profile-c14n/2` bytes; engram keeps the `profile_hash` stable serialisation. The DS FNV-1a value (`packages/diagram-core/src/hash.ts`) is none of these and never a trust gate. | Only when the profile's own declarative content changes (new version) |
| `pinsDigest` | Which pins were declared? | **P-PINS** (§7.3.3): ordered layer pins + rule-sheet pins + delta/mapping digests in one hashed object. Even a single-layer stack hashes the pin structure, never the profile bytes. | Any layer pin, layer order, rule-sheet pin, delta or mapping change |
| `resultDigest` | Which resolved result was produced? | **P-RESULT** (§7.3.4): effective declarations + effective rule set (guardian-computable scope) or the owner's complete effective document (private scope). | Any change to the effective preimage (pin, order, delta or composition-rule change that alters the effective result) |
| `entryDigest` | Which catalog entry is this? | **P-ENTRY**: SHA-256 over the RFC 8785 bytes of the whole catalog entry (envelope plus payload), computed externally, never self-embedded. | Any entry field change (including deprecation), never a profile-byte change alone |

#### 7.3.2 P-CONTENT-DIAGRAM (diagram `contentDigest`)

Source: G0 P-CONTENT-DIAGRAM at `SPEC-G0-guardian-contracts.md` §7.2 (oracle-pinned, §8.5). The preimage is the closed object below, canonicalised with RFC 8785 (JCS), UTF-8, no trailing newline, and hashed with SHA-256. Keys in canonical (sorted) order:

| Key | Value |
| --- | --- |
| `completeness` | String (`skeleton` or `complete`), verbatim |
| `constraints` | Array of the profile's executable constraint declarations, in declared order, each as its native JSON value |
| `entityTypes` | Array of entity type declarations, in declared order, each as its native JSON value (labels, attribute schemas, `abstract` flags, and the M1 additions `container`, `footprint`, text `pattern`/`patternName`/`minLength`, numeric `integer`/`min`/`max` where declared) |
| `limits` | Closed object with exactly `maxEntities`, `maxRelations`, `maxEndpointsPerRelation`; each the declared number or **`null`** where the source omits it (omission hashed as `null`, never `0`, never dropped) |
| `portTypes` | Array of port type declarations, in declared order (`[]` where none) |
| `profile` | String `name@major` — the source `id` under this key (renamed; the value is identical) |
| `relationTypes` | Array of relation type declarations, in declared order (labels, direction, roles with `min`/`max`, targets, entity types, attributes, `hierarchy` where declared) |

Excluded (never hashed): `name`, `version`, `notes` as standalone fields (identity is carried by `profile`; human notes are outside the delegated projection), runtime code, file paths, the DS FNV drift value, view documents, occurrences, geometry, layout results, theme identifiers and token values, and every catalog field. Consequences, normative and fixtured (§7.3.5): changing `completeness`, a `container` flag, a `footprint`, a constraint `scope`, a text `pattern` or a numeric bound **changes** `contentDigest`; changing only `notes` **does not**. The transcription check of §7.3.6 uses this projection on both sides.

#### 7.3.3 P-PINS, P-DELTA, P-MAPPING

- **P-PINS**: closed object `{ deltaDigest, layers, mappingDigest, ruleSheets }` where `layers` is an array of Pin objects exactly `{ contentDigest, id, version }` in stack order (top layer last; reordering changes the digest; even a single-layer stack hashes this array), `ruleSheets` the same Pin shape in composed order (`[]` where none), and `deltaDigest`/`mappingDigest` each a digest or `null`. `pinsDigest` is SHA-256 over the RFC 8785 bytes of that object. Hashing profile pins alone, or omitting `ruleSheets` where sheets compose, fails qualification.
- **P-DELTA**: the delta digest inside P-PINS is SHA-256 over the RFC 8785 bytes of `{ base, mappingRef, operations, retiredFixtures, retiredRules }`, where each operation's `declarationDigest` is computed over the **single declared value alone** (diagram: RFC 8785 bytes of that declaration JSON value), never over a whole profile (G0 P-DELTA, complete in the pinned G0).
- **P-MAPPING**: the mapping digest is SHA-256 over the RFC 8785 bytes of `{ entries, mappingId, version }`, each entry its flat typed object with every arm field verbatim; the file's own `contentDigest` field is excluded.

#### 7.3.4 P-RESULT

Guardian-computable diagram scope: SHA-256 over the RFC 8785 bytes of `{ effectiveDeclarations, effectiveRuleSet, severityPolicyDigest }`, where `effectiveDeclarations` is the P-CONTENT-DIAGRAM object of the **effective** (resolved) profile, `effectiveRuleSet` the composed effective rules as closed `{ classification, code, messageKey, ruleBody, ruleId, severity }` objects (`ruleBody` the complete effective native rule value), and `severityPolicyDigest` the pinned SHA-256 of canonical `{ phase, readinessPolicy, settings }` (or `null` where no rule sheet applies). Changing an effective body, option, severity, classification or selected policy changes this digest even with pins held fixed. The owner-side private procedure (whole effective document, S-D2DC14N) does not apply to public diagram profiles and is not used here; private (d2d) results are computed owner-side and recorded as receipt data only.

#### 7.3.5 Frozen vectors (must reproduce exactly)

An implementation must reproduce each digest from the exact bytes. A mismatch fails qualification; the vectors decide the freeze (G0 §7.2).

| Vector | Exact canonical bytes (UTF-8, no trailing newline) | SHA-256 |
| --- | --- | --- |
| V-PINS-1 (P-PINS, single layer, no delta/mapping/rules) | `{"deltaDigest":null,"layers":[{"contentDigest":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","id":"generic","version":"1.0.0"}],"mappingDigest":null,"ruleSheets":[]}` (186 bytes) | `467becc10978220abbbe6d9fdad72eddec4c62a3dd9f2150bc3f9fe1bd7313fe` |
| V-DIAGRAM-1 (P-CONTENT-DIAGRAM, minimal) | `{"completeness":"complete","constraints":[],"entityTypes":[{"id":"node"}],"limits":{"maxEndpointsPerRelation":4,"maxEntities":100,"maxRelations":200},"portTypes":[],"profile":"generic@1","relationTypes":[]}` (206 bytes) | `4d2c641281713349753eb80ba40e0b08ec29b2f93847e4d0f2feb18e25381c94` |
| V-MAPPING-1 (P-MAPPING, one rename) | `{"entries":[{"from":"a","kind":"rename","to":"b"}],"mappingId":"m1","version":"1.0.0"}` (86 bytes) | `b5770fd9b0623a047f65ed3d7811340afa965a623faaf0fd3e58babbc1be2516` |
| V-DELTA-1 (P-DELTA, one add) | `{"base":{"contentDigest":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","id":"generic","version":"1.0.0"},"mappingRef":null,"operations":[{"declarationDigest":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","op":"add","subject":"c4-system"}],"retiredFixtures":[],"retiredRules":[]}` (320 bytes) | `436065f4f09c6de4dc7f25f8eb3821088e43f27c2f9454137fc19042bebff3e2` |

Mutation fixtures (in addition to G0 §7.4 FX-DIG-*): for each completed profile, flipping `completeness`, toggling a `container` flag, changing a `footprint` dimension, changing a constraint `scope`, changing a text `pattern` and changing a numeric bound each change the computed `contentDigest`; editing only `notes` leaves it unchanged; omitting a limit vs declaring it `null`-equivalent is distinguished exactly as G0 prescribes (declared number vs `null`).

#### 7.3.6 Transcription check and the separate artifact digest

- **Pins.** A consumer pins a profile by an exact pin `{ id, version, contentDigest }` — exact version, full SHA-256 `contentDigest` over the P-CONTENT-DIAGRAM projection, no range, no tag, no `latest` fallback anywhere. An unknown version, digest or major refuses; it never falls back.
- **Transcription check.** Each completed-profile literal shipped in `packages/diagram-core` must project (P-CONTENT-DIAGRAM) to bytes whose SHA-256 equals the pinned Engram `contentDigest`. The M1 gate runs this check; a mismatch refuses the build (`digest-mismatch` discipline) rather than silently preferring either copy.
- **Artifact digest (separate, where complete-file equality is also required).** `artifactDigest` is SHA-256 over the RFC 8785 canonical bytes of the **complete** profile artifact as published (including `name`, `version`, `notes` and any governed metadata the projection excludes), computed externally and recorded beside — never instead of — `contentDigest`. It exists so a publisher can prove two complete files are byte-equivalent where that stronger statement is needed (for example a mirrored transcription audit). Rules: `artifactDigest` never gates pin resolution, never substitutes for `contentDigest` in P-PINS/P-RESULT, and is labelled `artifactDigest` wherever recorded so the two are never interchanged. A notes-only change changes `artifactDigest` and leaves `contentDigest` unchanged; both behaviours are fixtured.
- **Fixture hand-off:** each acceptance fixture (§8) is identified by its canonical SHA-256 as recorded in the corpus manifest. A hash mismatch at lot time aborts the lot's fixture step as a fixture error, not a test failure.
- **Change flow:** a profile change is proposed as data in Engram, qualified against the corpus there, published as a new version with its digests, and only then transcribed or re-pinned here. This repository never edits a published profile's bytes in place, and Engram never edits executor code.

### 7.4 Complete G0 hand-off mapping, DIA receipt and admission gate

Admission is the G0 §5.5 gate, not “green corpus”, and no candidate without full admission evidence is ever described as pinnable, published or qualified: a candidate without full admission evidence stays a **draft outside the catalog** (§10 stages S1/S2/S3).

**Ontology record (G0 §1.4) and catalog payload (G0 §5.3) — value rules.** The table gives the rule for the completed diagram families; concrete identity values (namespace segment, owner handle, canonical references, executor pins) are **pinned lookups**: each names the Engram registry record or the qualified DS build from which the value is read verbatim at admission time, and the admission fixture records the value actually read. Prose descriptions in place of a read value fail admission.

| G0 field | Value rule for the completed families |
| --- | --- |
| `namespace` | Read verbatim from the Engram diagram namespace record (registry lookup `diagram.namespace` at admission); never derived from a display label. The read value is recorded in the admission fixture. |
| `id` / `version` | Ontology id `generic` version `2`, `archimate` (completed version), `uml` (completed version), and the generated BPMN stack ids/versions of §3.10; the profile id strings are `generic@2`, `archimate@1` (completed version), `bpmn@2` stack, `uml@1` (completed version). |
| `owner` | Read verbatim from the Engram owner registry (lookup by profile id at admission); publication without a resolved owner refuses (`missing-owner`). |
| `lifecycle` | `draft` until §5.5 admission passes, then `published`; `generic@1` moves to `superseded` paired with `supersededBy` + migration reference (§3.13.4); skeleton pins stay `published` as skeletons forever. |
| `completeness` | `complete` for the successor/completed/generated entries (never waives evidence, G0 R-3); `skeleton` only for the retained skeleton entries. |
| `visibility` | `public` for the diagram families; d2d private entries stay `private:<tenant>` and are out of this table's scope. |
| `profileShape` | `diagram-profile`. Root classification: the successor/completed bases use the G0 **base** binding (empty parents, §3.13.4); stacked compositions (family + presentation fragment) use the `profile` binding with their ordered stack. The two bindings are never mixed on one record. |
| `artifactKind` / `artifactBinding` | `artifactKind: "profile"` for stacked entries, `"base"` for base entries, each with its corresponding closed binding variant (`{ profilePin, stack, relationMatrixRef? }` for `profile`, the base pin for `base`); `relationMatrixRef` present only where a private matrix requires it. |
| `profileRef.canonicalRef` | Read verbatim from the Engram profile registry (the governed canonical reference, distinct from the catalog entry id); `profileRef.contentDigest` is the P-CONTENT-DIAGRAM digest (§7.3). In the payload this is `canonicalRef` with `profilePin` carrying `(id, version, contentDigest)`. |
| `catalogEntryRef` | Reference to the §5 catalog entry of kind `ontology`; absent while the profile is a draft outside the catalog, required once admitted. |
| `provenance` | Closed `{ sourceRef, sourceRevision }`: the dossier/spec source reference and the exact source revision (this specification at its r3 commit) that the entry was authored from. Licence closure and coverage are separate payload fields, never provenance fields. |
| `stack` | For bases: the single-layer stack of §3.13.4. For card-drawn family documents: the ordered stack `[family pin, presentation-fragment pin]` (fragment last); `lineage.parents` lists the stack pins in order; `lineage.migrations` names the §3.13 migration references; `lineage.mappings` empty unless a governed mapping file exists. |
| `conflictPolicy` | Exact pinned reference to the G0 §§2–4 stack/derive/merge conflict-handling record (id + version + digest read at admission); never a prose paraphrase and never a weakening. |
| `compatibility` | Closed `{ renderer, adapter }` with **exact pinned references** (executor artefact id + version + digest read from the qualified DS build at admission; the profile-schema binding below). Version ranges appear only in the package envelope, never in ontology compatibility. Consumers pin the published executor version once qualified; a pinned build-time copy is the transitional state before qualification (two evidence states, never conflated). |
| `linkedTools` | Array of exact string references to the linked invocation-tool entries (G0 §9) through which hosts consume the profile; empty only where Engram records no tool link yet, and then admission records that explicitly. |
| `ruleSheets` | `[]` — no unit rule sheet composes over the diagram entries at M1. Where a sheet later applies, each entry is `{ sheetPin, ruleIds, selections }` with the public `SelectionMetadata` of G0 §5.3, and P-PINS takes only `sheetPin` in composed order (§7.3.3). |
| Schema binding | Each governed schema asset is recorded in the entry's `assets` as `{ role, path, mediaType, sha256 }` (G0 exact asset shape) and bound from `bindings` as `{ key, contract, required }` (G0 exact binding shape), where `contract` is the pinned schema reference. Assets: profile schema, `SemanticDocument` schema, `ViewDocument` schema (§7.1 item 2). A schema change without a new asset digest fails admission. No `DocumentSchema`-shaped object is placed in either field. |
| `corpusRef` | Closed `{ ref, digest }`: the conformance-corpus reference and its manifest digest (§8). Required for a published record; an ontology without a corpus is not admitted. |
| `digests` / `resultEvidence` | Closed `{ contentDigest, pinsDigest, resultEvidence }` where `resultEvidence` is the G0 `DigestEvidence` over `resultDigest`: arm `resolved` (with the digest) is required for publication; arm `unresolved` (no digest value, no placeholder) is the only pre-admission state and never passes the gate. `entryDigest` is computed over the whole entry externally (P-ENTRY) and never embedded. |
| `migrations` | Array with the §3.13 migration references (plus schema-migration references the lineage needs); empty only where no migration exists — not the case for the generic successor. |
| `consumers` | Catalog ids / repository pins to notify before the major ships (layout engine, dossier binding, h2a dossier builder, HRPN and governance consumers, bpmn-canvas/d2d where a shared mechanism changes); publication requires the list present. |
| `supersededBy` / `migrationRef` / `deprecatedReason` / `deprecatedAt` | Per lifecycle (§3.13.4): `supersededBy` required iff the predecessor is `superseded` (on the `generic@1` record), paired with `migrationRef`; deprecation fields only on a `deprecated` record. |
| `licenceClosure` / `coverage` | Required iff the entry is an EXT pack entry; absent for these profile entries. Recorded explicitly as absent, not omitted by oversight. |
| Diagnostic adapter | The §5.4.1 adapter pin (id, version, digest) recorded beside `compatibility`; its receipt round-trip fixtures are part of admission evidence. |

**Specimen requirement.** Admission evidence includes one **schema-valid specimen** per binding kind (one base entry, one stacked entry) serialised in the closed G0 envelope shapes, with the pinned lookups resolved to the values read at admission. A specimen that fails envelope validation, carries a range in `compatibility`, or places a schema object in `assets`/`bindings` refuses admission. The specimen bytes are corpus fixtures; their digests join §8.5.

**DIA `family-corpus` receipt (required receipt for these entries).** Under G0 §5.4 a `profile`/`base` entry with `profileShape diagram-profile` (family DIA) is admitted on **validator receipts**: for the completed families, exactly one receipt kind is required, the `family-corpus` arm, produced by the DS executor's own test run and stored by the guardian (the guardian executes no library itself):

| Receipt field | Value rule |
| --- | --- |
| `receiptKind` | `family-corpus` |
| `family` | `DIA` |
| `corpusDigest` | Digest of the §8 corpus manifest the run covered |
| `fixtureDigest` | Manifest digest of the DIA conformance corpus (same value as `corpusRef.digest` for this entry) |
| `libraryId` / `libraryVersion` | The implementing library and its exact version (`@sentropic/diagram-core` + `diagram-canvas` executor build that ran the corpus) |
| `validatorRole` | `qualified-ds-execution` once parity is proven under the study gates; `transitional-oracle` witnesses expected verdicts during transition only and never satisfies a switch to the reference role. The role actually executed is recorded; claiming `qualified-ds-execution` without `reference-qualified` transition evidence refuses admission. |
| `transitionQualification` | Arm `reference-qualified` (`{ claim, parityMatrixDigest, qualifiedExecutorPin, gateEvidenceRef }`) iff `validatorRole` is `qualified-ds-execution`; arm `oracle-witness` iff `transitional-oracle`; absent iff `retained-check` (not applicable here). |
| `verdict` | `pass` required; a required rule at `not-evaluated` never counts as pass for that rule. |
| `evaluatedStack` | Closed `{ stack, pinsDigest, resultEvidence }`: the exact stack, its P-PINS digest, and the evaluated `resultDigest` in `DigestEvidence` form. Both this `resultEvidence` and the entry's `digests.resultEvidence` must be `resolved` with equal digests before any comparison (see gate). |
| `severityPolicyDigest` | The selected digest where a rule sheet applies; **`null`** here (no rule sheet composes, `ruleSheets: []`), present as a field with that explicit null per the non-`bpmn-parity` selection-binding rule. |
| `ruleVerdicts` | Present; `[]` only because no rule sheet applies. Each verdict, where present, carries `ruleId`, effective `severity` and `studyDisposition` where applicable. |
| `issuedAt` | Date the receipt was produced by the library's own test run. |

No BPMN proof set (`published-corpus`, `local-expectations`), no bijection receipt and no other family's receipt is required of a DIA entry, and none may be presented in its place. Generated-BPMN DIA entries additionally carry their A′ bijection evidence under their own G0 arm; that evidence never substitutes for the `family-corpus` receipt of a non-BPMN entry.

**Admission gate (G0 §5.5, normative; replaces every “green corpus” formulation).** Admission refuses while any required receipt is missing, failed or mismatched, at any completeness including `skeleton`:

1. First require resolved result evidence: `entry.digests.resultEvidence.evidenceState` and the receipt's `evaluatedStack.resultEvidence.evidenceState` must both be `resolved` with present, equal digest values. A `verdict: pass` receipt with an unresolved arm refuses explicitly; two unresolved arms never constitute a match.
2. Then compare the evaluated stack in order, `pinsDigest`, and the resolved result digests field by field against the entry; refuse every mismatch (`FX-RCPT-MISMATCH` discipline). For public rule-sheet scopes, additionally recompute the selected `(phase, readinessPolicy)` policy digest over complete settings and compare it with the receipt's selection binding (vacuous here: no sheet, explicit `null` on both sides).
3. A receipt with `verdict: fail`, a wrong `validatorRole` for the claimed qualification, a required rule at `not-evaluated`, or a `parity: open` rule presented as satisfying `qualified-ds-execution` each refuse exactly as a missing receipt does (`missing-receipt`). Profile self-validation green, corpus green, licence closure recorded and every applicable digest resolved are all required; no single one admits.

Development artifacts (§10 stage S1), the qualified profile publication (stage S2) and package publication (stage S3, owner gesture) are three distinct states; only S2 is catalog admission, and only S3 publishes a package.

## 8. Coverage matrix and acceptance instances

Acceptance is a set of pure instances of the completed model. An instance qualifies only when **all** of the following hold, checked by the named gates:

- `profileRefs` names exactly the family profile(s) plus, where cards are drawn, the presentation-fragment composition — never a consumer profile invented for the instance;
- `extensions` carries no card/zone slot, title or tint (preserved foreign content under D3-C is the only permitted extension content, counted separately);
- `typeDefinitions` carries no refinement that exists only to carry fragment slots (a retained residual refinement after §3.13 migration carries consumer data and names it);
- every entity/relation type is declared by the composed stack; `validateDocument` and, per view, `validateView` return **zero diagnostics**, including on every folded view (§4.4);
- display titles are stored literally (the two « CI/CD » zones are both stored as « CI/CD »);
- relation presentation is stored per relation id (§3.5.1 counts) and authored aggregate definitions are stored as `summaryLabels` with constituent ids (§4.5);
- geometry in each view is produced by the DS layout from the semantic document (expanded views, with the §4.7 hints recorded per instance) and by the §4.4 projection composed with §4.6 placement (folded views), never copied from a consumer layout as input.

Counts below are typed counts (per resulting type), containment-relation counts and link counts separately — never a single entity total. A re-expression with a different typed count, a different containment count or a different link count is a different graph and fails the instance.

### 8.1 Pinned sources (what each column means)

| Column | Pinned source | Identity |
| --- | --- | --- |
| #711 central scene | sentropic commit `4138a0ecba9c5b37409abb5ac00f732d02b7dc8d` (PR #711 merged), kit at `/home/antoinefa/src/sentropic/.tmp/governance-unification/kit/src/`: `governance-central.js` sha256 `1f7490ff48c02fced30a43bd03d8554b7d894bdfcf6cda43e6dd948f9254af50`, `governance-collapse.js` sha256 `585709daedd8bc8b46594394e88f9c2c24678edcd4e0f679933c1833eaff405d`, `presentation-scenes.json` sha256 `7c9fcab414ac469ce91db5783a4479c8b302bc7ae3242011bb87151e09e25140`; portable `docs/governance/governance-r11-portable.html` sha256 `831cbdee9bb5820e7e19ed55c942522a5848c402db9be0c89d87d02559bf6f35` (per `DS-DIAGRAM-MODULES-REQUIREMENTS.md`) | Builder `buildGovernanceCentral`; frames `h2a`, `surfaces`, `cluster-mesh`, `engram`, `design-system`; nested `cm-catalog`, `cat-mcp`, `cm-storage`, `cm-security`, `cm-cluster` |
| Four HRPN scenes | `/home/antoinefa/src/airbus-genair-hrpolnav/docs/architecture/hrpn/ds-fixtures/` — `MANIFEST.md` sha256 `9558092fa2af669af9dcd4df6d9380e24a1cba723dbdd603ad2ebd86c6439a49`; `S2-asbuilt.json` `7abc427f7beca5b0f87947efc9df4daf6316f24725074f47f1da2b04be76ba2e`, `S2-target.json` `28a7271dd0bec89fa9ad435174a614ab4a40b346b10724da95736f9c55b574d9`, `S1-conversational.json` `d9f7f7cb80894b5301e11cc7b7f0fc2775d1933aa15013152001395d716a32c7`, `S3-agentfactory.json` `e362b9a8da84082e5389127ae463d282fb773ef8950f41017222e0b3ef9002fc`; `tint-legend.json` `cc47a3e3a2019af8c436ce28a34d0d52d71b8439cf55a44a33f1c0239752a26d`; `reference-renders.json` `7afee15ef473389452011d38fbaf8547973b5eed572440cc0c31ee8d921e25db` | Fixture form (`entities[]`/`relations[]`/`zoneHierarchy`/`profileMapping` → `generic@1`); counts: S2-asbuilt 41/17/44 (7 dashed), S2-target 51/22/54 (0 dashed), S1 23/17/24 (10 dashed), S3 37/15/36 (3 dashed) |
| HRPN S2-target engram graph | `/home/antoinefa/src/airbus-genair-hrpolnav/docs/architecture/hrpn/engram/S2-target.semantic.json` sha256 `46f64154bb6592d49ccda5633b2c4d4205fb1c6752ef218be31d6757923ecf91` + `S2-target.view.json` sha256 `82930614efe070bdb8e5acce3aecea29dfdb2d1ab625b7d376507f97fb6f8b50`; `MANIFEST.json` sha256 `54ef0dd0ac0e923aa99435625780902d07c3819e9c2c340868c921d1f956fd91` | Semantic form (`generic@1`, 19 containers + 37 `hrpn-card`, 51 `contains` + 31 `link`, revision 1, 7 default folds `MSGZ`, `VERTEXZ`, `INGZ`, `PCICD`, `OBSZ`, `GENSRC`, `AWSCI`) |
| bpmn-canvas fixtures | `/home/antoinefa/src/bpmn-canvas/tests/fixtures/corpus/*.bpmn` (10 files: `comments`, `duplicate-id`, `extension-ok`, `io-specification-incomplete`, `no-di`, `notation`, `partial-di`, `rogue-extension`, `tiny`, `unresolved-reference`; full hashes in §8.5) + `tests/fixtures/parity-corpus/` (index sha256 `40284149ca3538b35250e5896694e7d15c80d3c3233241e0d7ac3d91266df03a`, cases W01–W12) + `canonical-vectors.json` `f238aef110a43381416fd0025326f883f760dc75510a9f0cc5817415eb02d1c6` | F1 / bpmn-moddle XML corpus; MIWG-adjacent extension cases included |
| d2d fixtures | d2d position (`evidence-astra/threads/ontology/d2d.md`): parity corpus `profile-corpus-v1.0.0` (198 files, manifest-pinned, vendored by hash in bpmn-canvas at `/home/antoinefa/src/bpmn-canvas/tests/fixtures/profile-parity-corpus/profile-parity-corpus/1/manifest.json` sha256 `01b81fd9fb69f110a7f302631d6da92126bcb1672c67bea3ea68ff802df39faf`, pin file `/home/antoinefa/src/bpmn-canvas/tests/fixtures/profile-parity-corpus.pin.json` sha256 `d34ee889917b8c5ef14c8d7bbd3fa2b222d93f4ac61de4bd0b41deb5767378a2`) + `unicode-case/1` (UCD 15.0.0, pin `tests/fixtures/unicode-case-15.0.0.pin.json` sha256 `989aa11b6c138115a356c39867a26d8da281d2fd4b926508c72199b87fa4b762` in the bpmn-canvas checkout). The d2d private business profile body is never a public fixture. | Shared JS/Python parity corpus; private content stays owner-side (pins/digests/receipts only) |

### 8.2 Coverage matrix

Reading: **covered** = the row's completed contract expresses the column's content with zero extensions/refinements for standard slots and zero diagnostics; **partial** = the content is expressible today only with a named gap or a consumer patch; **absent** = the row does not claim the column (wrong family; claiming it would be a category error). Every cell names its pinned source and its missing element. “—” never appears: an absent cell still names why.

**Layer tagging in this matrix (owner arbitration, normative).** A verdict without a layer tag is meaningless, so every verdict is a **model-layer** verdict unless the cell says otherwise: *covered* means the `SemanticDocument` content stores natively (model layer). Layout-layer coverage (folds, footprints, measurement, hints, occurrences — §4) is family-neutral and therefore identical for every row that reads *covered* at the model layer; it is never claimed by a *partial* or *absent* model cell. Presentation-skill coverage (card/container/legend drawing) is never claimed by any cell in this matrix: drawing is the M2 roadmap (§10) composing the presentation fragment, and a model *covered* cell is the precondition for it, not a substitute. No cell stores a layout or presentation field in the graph model; the leak rule of §1.3 governs every row.

| Row ↓ / Column → | #711 central scene | Four HRPN scenes (fixture form) | HRPN S2-target engram graph | bpmn-canvas fixtures | d2d fixtures |
| --- | --- | --- | --- | --- | --- |
| `generic@1` (today, `complete`) | **partial [model]** — kit frames/cards map to `node`/`container`/`link`, but kicker/body/footer/icon/tone have no slot (Gap C) and the two « CI/CD » titles collide (Gap 2). Source: kit hashes §8.1. Missing: fragment slots, scoped uniqueness, legend types, folded projection. | **partial** — fixtures are authored for `generic@1` and validate, but tints/dashes live outside the profile (`tint-legend.json`, `style` field) and zone titles were uniquified by the generator. Source: MANIFEST `9558092fa2af669af9dcd4df6d9380e24a1cba723dbdd603ad2ebd86c6439a49`. Missing: native `tone`/`strokeStyle`, legend, folds. | **partial** — validates with zero diagnostics **only because** of `hrpn-card` + 19× `hrpn.zone-slots@1` + suffixed titles (§2.2). Source: semantic sha `46f64154bb6592d49ccda5633b2c4d4205fb1c6752ef218be31d6757923ecf91`. Missing: the completed successor; the patches are the gap. | **absent** — BPMN semantics are not generic semantics; forcing the corpus through `generic@1` would drop every BPMN type. Source: corpus hashes §8.5. Missing: by design; see `bpmn@1` / A′ rows. | **absent** — same category boundary; d2d BPMN content is not generic content. Source: d2d position. Missing: by design. |
| `generic@2` + fragment (completed, §3.8) | **covered [model]** — every frame/card/relation/legend category (`neutral`, `proposal`, `identity`) and every authored overview label (§4.5) stores natively; folded views validate (§4.4). Source: kit §8.1. Missing: none for content; rendering is M2 (§10). | **covered [model]** — cards/zones/links/tints/dashes store natively (`tone`, `strokeStyle`, legend); typed counts preserved per scene (§8.3). Source: ds-fixtures §8.1. Missing: none. | **covered [model]** — via the §8.4 ledger (33 `node` + 18 `container` + 1 `legend` + 4 `legend-key`; 51 `contains`, 31 `link`, 0 extensions, 0 refinements, revision-1 folds valid). Source: semantic/view hashes §8.1. Missing: none. | **absent** — generic completion adds no BPMN type and claims no BPMN fixture. Source: §3.10 boundary (corpus §8.1). Missing: by design (category boundary; BPMN content belongs to the `bpmn@1` / generated rows). | **absent** — generic completion adds no BPMN type and claims no d2d fixture. Source: d2d position §1 (corpus §8.1). Missing: by design (same category boundary). |
| `archimate@1` skeleton (today) | **partial [model]** — frames read as `grouping`/`element` and relations by name, but there is no matrix, no catalogue and no card slot; claiming coverage would be arity-only. Source: `skeletons.ts` `0a01fd2569e68c2b99ca754f28dc7cbbbd9a1d491ffa9981161cae3bbf56b54e`. Missing: §3.9 completion. | **partial [model]** — zones/cards coerce to `element`/`grouping` with layer/aspect invented; tints, dashes, legend and folds have no carrier. Source: ds-fixtures §8.1. Missing: matrix + fragment composition (family bytes gain neither). | **partial [model]** — same coercion over the engram graph; the `hrpn-card` refinement has no ArchiMate reading. Source: semantic sha §8.1. Missing: §3.9 completion. | **absent** — ArchiMate claims no BPMN fixture. Source: skeleton notes (corpus §8.1). Missing: by design (category boundary). | **absent** — ArchiMate claims no d2d fixture. Source: d2d position §1 (corpus §8.1). Missing: by design (category boundary). |
| `archimate@1` completed (§3.9) + fragment | **partial [model]** — the governance scene is **not** an ArchiMate model: its relations (`fulfills`, `routesTo`, … study §4.1) are governance-routing relations, not the ArchiMate matrix. It stays a generic diagram (A1, §8.3) even after ArchiMate completes. Source: study §4.1, kit §8.1. Missing: none — the cell is partial because the family is the wrong landing for this column (§9), not because the profile is incomplete. | **partial [model]** — HRPN scenes are card architecture diagrams without an ArchiMate matrix claim; they remain generic instances (A2–A4). An HRPN diagram that later asserts ArchiMate semantics re-pins here with its matrix validated. Source: ds-fixtures §8.1. Missing: an ArchiMate assertion by the producer (not a profile gap). | **partial [model]** — same landing reason as the fixture form. Source: semantic sha §8.1. Missing: producer assertion, not profile content. | **absent** — completed ArchiMate claims no BPMN fixture. Source: corpus §8.1. Missing: by design (category boundary). | **absent** — completed ArchiMate claims no d2d fixture. Source: d2d position §1 (corpus §8.1). Missing: by design (category boundary). |
| `bpmn@1` skeleton (today) | **absent** — the governance scene contains no BPMN process; no cell is claimed. Source: kit §8.1. Missing: by design (no BPMN content in this column). | **absent** — HRPN card scenes are not BPMN processes. Source: ds-fixtures §8.1. Missing: by design (no BPMN content in this column). | **absent** — the engram graph contains no BPMN process. Source: semantic sha §8.1. Missing: by design (no BPMN content in this column). | **partial [model]** — element/sequence/message arity validates, but there is no containment rule, no event matrix, no DI and no extension preservation; 3 of 7 measured corpus files need preserved unknown namespaces (A′ §4.3). Source: corpus §8.1, skeleton notes. Missing: A′ generated family (K1–K13). | **partial [model]** — d2d consumes bpmn-moddle + the profile mechanism, not the hand-written skeleton; the skeleton neither reads its private profile nor its placement contract. Source: d2d position §1. Missing: the §3.10 mapping (skeleton as readable placeholder only). |
| `bpmn@2` generated stack (A′, §3.10) | **absent** — the governance scene contains no BPMN process. Source: kit §8.1. Missing: by design (no BPMN content in this column). | **absent** — HRPN card scenes are not BPMN processes. Source: ds-fixtures §8.1. Missing: by design (no BPMN content in this column). | **absent** — the engram graph contains no BPMN process. Source: semantic sha §8.1. Missing: by design (no BPMN content in this column). | **covered [model]** *(at A′ completion, gated)* — descriptor coverage 100 %, F1 bijection, complete DI, unknown extensions preserved; MIWG `B.1.0`/`C.4.0`/`C.5.0` round-trip once F1-A1/A2 land. Until gate G3 passes the cell reads **partial** with that exact remainder. Source: A′ §§4–10, corpus §8.1. Missing today: F1 publication + G3 bijection. | **covered [model]** *(for the shared mechanism)* — d2d keeps bpmn-moddle + `profile-c14n/2` + its private profile; the generated stack is the diagram-core reading of the same descriptors, mapped explicitly (A′/d2d open point closed as: skeleton/generated profiles are views over the mechanism, never a second evaluator, §6.3). Private content is never re-modelled. Source: d2d position §4 (corpus §8.1). Missing: the pinned mapping artefact (Engram data) at A′ lot time. |
| `uml@1` skeleton (today) | **absent** — no UML classifiers in the governance scene. Source: kit §8.1. Missing: by design (no UML content in this column). | **absent** — HRPN cards are not UML classifiers. Source: ds-fixtures §8.1. Missing: by design (no UML content in this column). | **absent** — the engram graph holds no UML classifiers. Source: semantic sha §8.1. Missing: by design (no UML content in this column). | **absent** — UML claims no BPMN fixture. Source: corpus §8.1. Missing: by design (category boundary). | **absent** — UML claims no d2d fixture. Source: d2d position §1 (corpus §8.1). Missing: by design (category boundary). |
| `uml@1` completed (§3.11) + fragment | **absent** — completion adds no governance-scene claim; the scene holds no UML classifiers. Source: kit §8.1. Missing: by design (no UML content in this column). | **absent** — HRPN cards are not UML classifiers. Source: ds-fixtures §8.1. Missing: by design (no UML content in this column). | **absent** — the engram graph holds no UML classifiers. Source: semantic sha §8.1. Missing: by design (no UML content in this column). | **absent** — completed UML claims no BPMN fixture. Source: corpus §8.1. Missing: by design (category boundary). | **absent** — completed UML claims no d2d fixture. Source: d2d position §1 (corpus §8.1). Missing: by design (category boundary). |
| `profile-c14n/2` | **absent** — c14n canonicalizes profile values; the kit scene is not a profile artefact. Source: canonical.ts §3.12 (kit §8.1). Missing: by design (not a profile; canonicalizes values, never validates a document). | **absent** — the HRPN fixtures are documents, not c14n artefacts. Source: ds-fixtures §8.1. Missing: by design (same boundary). | **absent** — the engram graph is a document, not a c14n artefact. Source: semantic sha §8.1. Missing: by design (same boundary). | **covered [model]** — every parity-corpus case and canonical vector is a c14n artefact; identity and vectors are frozen (§6). Source: parity corpus §8.1. Missing: none. | **covered [model]** — d2d identity *is* c14n bytes → SHA-256; corpus manifests and sealed vectors validate byte-identically (§6). Source: d2d position §1/§3 (corpus §8.1). Missing: none. |

The matrix has no empty cell and no silent “covered”: the two gated BPMN cells state their remainder (F1 publication, G3) in the cell itself, and the ArchiMate-completed cells over card scenes state that their remainder is a producer assertion, not profile content. §9 draws the landing conclusion the matrix supports.

### 8.3 The instances

| # | Instance (source of truth for content) | Content that must be re-expressed | Fold witness |
| --- | --- | --- | --- |
| A1 | Governance central scene: sentropic `4138a0ec`, kit `governance-central.js` (`buildGovernanceCentral`), plus `governance-collapse.js` fold behaviour and `presentation-scenes.json` scene dressing (oracle-pinned, §8.5). Landing: **generic successor** (§9). | Top frames `h2a`, `surfaces`, `cluster-mesh`, `engram`, `design-system`; nested frames `cm-catalog`, `cat-mcp`, `cm-storage`, `cm-security`, `cm-cluster`; every card with its kicker (package/family), title, body/detail lines, footer (`service: …`) and icon; every labelled relation (the relation set of the builder, counted in the oracle manifest); legend categories `neutral`, `proposal`, `identity` as one legend with `order` values | Expanded view; the all-collapsed overview with its authored summary definitions (§4.5, valid in the source view, active in the overview); at least one single-fold view per top frame; each folded view passes `validateView`; nested folds select the outermost representative (§4.4) |
| A2 | HRPN scene S2-asbuilt (fixture corpus: 41 cards / 17 zones / 44 links, 7 dashed) | Cards, zones, containment and labelled links as a pure generic-successor instance; tints as `tone` keys explained by the scene legend; dashes as `strokeStyle` per id | Recorded default folds for the scene, re-expressed as `defaultFolds` input; folded view valid |
| A3 | HRPN scene S2-target, fixture form (51 cards / 22 zones / 54 links, 0 dashed) | As A2. Kept as the regression form; it is not replaced by A5. | As A2 |
| A4 | HRPN scenes S1-conversational (23/17/24, 10 dashed) and S3-agentfactory (37/15/36, 3 dashed) | As A2. Each scene that gains a native legend records its added legend/key entities and containment relations explicitly in its ledger (the fixture form carries no legend entity today; the legend is authored conversion data with its source-to-token mapping in §8.5, and the resulting typed counts — cards, zones, legend, keys, contains, links — are asserted per scene, never folded into the source counts). | As A2 |
| A5 | HRPN S2-target graph, Engram form: `S2-target.semantic.json` (sha256 `46f64154bb6592d49ccda5633b2c4d4205fb1c6752ef218be31d6757923ecf91`, 19 containers + 37 `hrpn-card`, 51 `contains` + 31 `link`, revision 1) + `S2-target.view.json` (7 default folds: `MSGZ`, `VERTEXZ`, `INGZ`, `PCICD`, `OBSZ`, `GENSRC`, `AWSCI`) | The same graph converted by the ledger of §8.4: refinements dissolved or retained residually per §3.13, extensions dissolved, titles literal, slots and legend native (§8.4 typed result) | The stored expanded geometry is replaced by DS layout (with recorded hints); the 7 default folds become the `defaultFolds` input and the folded view is projected per §4.4 (geometry per §4.6) and validates at revision 1 (§4.1.3) |
| A6 | BPMN corpus (bpmn-canvas `tests/fixtures/corpus/*.bpmn` + parity corpus W01–W12) under the A′ generated stack | Descriptor coverage, F1 bijection and DI round-trip per A′ §§9–10; unknown extensions preserved and counted separately. This instance gates the BPMN row of the matrix; it is owned by the A′ lot and referenced here, never re-authored here. | Collapsed sub-process plane witness from the A′ multi-view fixture (§3.10 K9) |
| A7 | ArchiMate matrix corpus + UML multiplicity corpus (§3.9/§3.11) | One valid fixture per matrix row class (ArchiMate) and per multiplicity form (UML), plus each rejected case with its asserted diagnostic. These corpora are authored with the completions; until they exist the corresponding matrix cells stay at their skeleton readings. | Grouping/package folds validate as generic view folds (§4.4) over the family hierarchies |

A1's relation count is taken from the builder's relation table at the pinned commit; the oracle manifest records the exact count and the fixture digest (§7.3). No instance count in this table is asserted from prose: each is recomputed from its oracle bytes at gate time and compared with the manifest value.

### 8.4 A5 conversion ledger: identity-preserving, typed counts, lossless

A5's source form cannot be renamed in place: its legend is a `container` holding four sample cards, and its cards use a refinement. The conversion is therefore a **ledger**: every source entity maps to exactly one target entity with the **same entity id**, every source field names its disposition, and the ledger is part of the corpus fixture (checked, not narrated). Source bytes: 56 entities (19 `container`, 37 `hrpn-card`), 82 relations (51 `contains`, 31 `link`), 19 `hrpn.zone-slots@1` extensions, 1 type definition (`hrpn-card`), `profileRefs: ["generic@1"]`.

| Source (id pattern) | Target type | Slot provenance (where each value comes from; every source field accounted) | Count |
| --- | --- | --- | --- |
| `entity:LEGEND` (`container`, name “Legend”) | `legend` (same id) | `name` from the entity; `kicker`/`subtitle`/`icon` from its zone-slots extension source (`HRPN` / “Card tints and link styles of this scene” / `window`); `footer`/`tone` absent (extension carries none) | 1 legend |
| `entity:legend-genair`, `entity:legend-custom`, `entity:legend-outside`, `entity:legend-none` (`hrpn-card` children of `LEGEND`) | `legend-key` (same ids) | `name` + `category` + `token` + `order` + `description` from the mapping table in §8.5; **plus** the card's remaining authored fields: `kicker` → `description` prefix is **not** used — instead: the source card's `body` becomes `description`, its `detail` is appended to `description` as a second sentence (recorded per key in the ledger, e.g. `legend-genair.detail = "standard GenAiR code and service"` is preserved verbatim inside `description`), its `footer` becomes the key's accessible footer text carried in `description`'s ledger note, and its `icon` is retired as presentation metadata **explicitly recorded as retired** in the ledger (reason: legend keys render as swatch lines, never as cards, §3.6.1; the icon name itself is preserved in the ledger entry so no authored string is lost silently). `tint` → `category` by the declared mapping; `legend-none` maps to category `none` with the neutral token, recorded explicitly. | 4 legend keys |
| Remaining 18 `container` entities | `container` (same ids) | Header slots from each entity's zone-slots extension source (`kicker`, `subtitle`, `footer`, `icon`); `tint` → `tone` by the declared rename (§3.13); `displayTitle`, where the extension carries one, becomes the entity `name` and the suffixed stored name is discarded (the two « CI/CD » zones both become `name: "CI/CD"`) | 18 containers |
| Remaining 33 `hrpn-card` entities | `node` (same ids) | `kicker`/`body`/`detail`/`footer`/`icon` from the refinement attributes; `tint` → `tone` by the declared rename | 33 nodes |

**Typed result (asserted separately, normative):** 33 `node` + 18 `container` + 1 `legend` + 4 `legend-key` = 56 entities; 51 `contains` relations (unchanged ids; the four LEGEND containment relations now target `legend-key` children under a `legend` parent, which the `children-restricted` + `required-parent` constraints accept); 31 `link` relations (unchanged ids, labels and endpoints; `strokeStyle` absent ⇒ `solid` for all 31, matching the source's all-solid target). Total entities (56), containment count (51) and link count (31) are asserted as three separate numbers alongside the four typed counts. Extensions after conversion: 0. Type definitions after conversion: 0 (the `hrpn-card` overlap promotes fully for A5; a consumer attribute would instead retain a residual definition per §3.13.1 and the ledger would record it — A5 has none). The ledger records, per entity, source type → target type, the extension/attribute each slot came from, and the disposition of every retired field, so a slot or a string with no provenance fails the conversion review. The same ledger discipline applies to A2–A4: each zone-slots or tint value names its target slot, each dashed relation names its `strokeStyle`, each added legend names its source-to-token mapping, and typed counts (including the added legend/keys and their containment relations) are asserted against the manifest. A conversion with no ledger does not qualify as a corpus fixture.

### 8.5 Oracle manifest: populated, hashes computed from the files

Acceptance and normative sources are frozen in an **oracle manifest** — a corpus artifact (Engram-governed, §7.1) whose entries are `(revision, path, sha256)` triples plus the derived expectations. A gate that reads a source not in the manifest, or whose bytes hash differently, fails as a fixture error before any assertion runs. The entries below are populated at r3 authoring time with hashes computed from the files (the “shall contain” form of r2 is withdrawn). “Source-gap”, “missing source” and “unverified” are the recorded states for any entry that cannot be pinned; a gate never substitutes a mutable path for a missing pin. Entries whose hash could not be computed in this lot are marked `unverified` with the reason, never given an invented hash.

| Entry | Revision / path | sha256 (computed) | Derived expectations recorded beside the pin |
| --- | --- | --- | --- |
| study | r10, `/home/antoinefa/src/sentropic/.tmp/governance-unification/study.md` | `7e3a3d1cb863eafce347bceff2639d5fdbc12a6dc2515371b34c2524687c5335` | Rows 4/10, N13, M4/G2, R-06 as cited in the header |
| G0 | `/home/antoinefa/src/graphify/.graphify/scratch/design/ontology-guardian/SPEC-G0-guardian-contracts.md` | `e6362445f87d6581ac31224c2dc44e15214b3a7debc2afff2b3d25b8b37ff8f6` | P-CONTENT-DIAGRAM/P-PINS/P-RESULT preimages and the four frozen vectors (§7.3.5) asserted from these bytes (vectors unchanged at 186/206/86/320 bytes) |
| M2 model | `spec/SPEC_EVOL_GD_M2_MODEL.md` @ r3 base | `5e7798a451c5b92cbbde6fbf85ea5f890c32c863ece3c73e5d9772efa9cff078` | §3.4 N-occurrence rule, D1-A/D3-C decisions |
| BPMN coverage (A′) | `spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md` @ r3 base | `7b29e147873287402a271d8b95e86bc0d39cd320152bbd8c6b1f6ef4c6e87505` | A′ family rule, K1–K13, F1-A1…A7, G0/G3 gates |
| generic@1 bytes | `packages/diagram-core/src/profiles/generic.ts` @ `8d1727a1` | `b19967fe65483abdbf0e271f197e13691904e4b087c1542de23c52e2ad4f45c3` | Digest-unchanged witness (§5.3.1) |
| skeletons bytes | `packages/diagram-core/src/profiles/skeletons.ts` @ `8d1727a1` | `0a01fd2569e68c2b99ca754f28dc7cbbbd9a1d491ffa9981161cae3bbf56b54e` | Skeleton verdicts unchanged (§6.2 gate 4) |
| c14n code | `/home/antoinefa/src/bpmn-canvas/src/profile/canonical.ts` | `287d8cb87beb7384fc89a8d6141681010dcba50ee895aaadc3b31345541191ba` | `profile-c14n/2` byte identity (§6) |
| kit central | sentropic `4138a0ec`, `kit/src/governance-central.js` | `1f7490ff48c02fced30a43bd03d8554b7d894bdfcf6cda43e6dd948f9254af50` | Relation count from the builder table; frame/card inventory for A1 |
| kit collapse | sentropic `4138a0ec`, `kit/src/governance-collapse.js` | `585709daedd8bc8b46594394e88f9c2c24678edcd4e0f679933c1833eaff405d` | Outermost-representative precedent; overview summary labels for A1 |
| kit scenes | sentropic `4138a0ec`, `kit/src/presentation-scenes.json` | `7c9fcab414ac469ce91db5783a4479c8b302bc7ae3242011bb87151e09e25140` | Scene dressing for A1 |
| HRPN manifest | `docs/architecture/hrpn/ds-fixtures/MANIFEST.md` (airbus-genair-hrpolnav) | `9558092fa2af669af9dcd4df6d9380e24a1cba723dbdd603ad2ebd86c6439a49` | Per-scene card/zone/link, solid/dashed, tint counts (§8.3) |
| HRPN S2-asbuilt | `ds-fixtures/S2-asbuilt.json` | `7abc427f7beca5b0f87947efc9df4daf6316f24725074f47f1da2b04be76ba2e` | 41/17/44, 7 dashed |
| HRPN S2-target (fixture) | `ds-fixtures/S2-target.json` | `28a7271dd0bec89fa9ad435174a614ab4a40b346b10724da95736f9c55b574d9` | 51/22/54, 0 dashed |
| HRPN S1 | `ds-fixtures/S1-conversational.json` | `d9f7f7cb80894b5301e11cc7b7f0fc2775d1933aa15013152001395d716a32c7` | 23/17/24, 10 dashed |
| HRPN S3 | `ds-fixtures/S3-agentfactory.json` | `e362b9a8da84082e5389127ae463d282fb773ef8950f41017222e0b3ef9002fc` | 37/15/36, 3 dashed |
| HRPN tint legend | `ds-fixtures/tint-legend.json` | `cc47a3e3a2019af8c436ce28a34d0d52d71b8439cf55a44a33f1c0239752a26d` | Source-to-token mapping: `genair`/`specific`/`added`/`removed`/`risk`/`custom`/`outside`/`none` → governed token names (recorded verbatim in the corpus artefact; the mapping table itself is Engram data, hashed with the corpus) |
| HRPN renders | `ds-fixtures/reference-renders.json` | `7afee15ef473389452011d38fbaf8547973b5eed572440cc0c31ee8d921e25db` | Reference geometry witnesses (never layout input) |
| A5 semantic | `engram/S2-target.semantic.json` | `46f64154bb6592d49ccda5633b2c4d4205fb1c6752ef218be31d6757923ecf91` | Ledger §8.4; typed result 33+18+1+4; 51/31 |
| A5 view | `engram/S2-target.view.json` | `82930614efe070bdb8e5acce3aecea29dfdb2d1ab625b7d376507f97fb6f8b50` | 7 default folds; revision 1 |
| A5 manifest | `engram/MANIFEST.json` | `54ef0dd0ac0e923aa99435625780902d07c3819e9c2c340868c921d1f956fd91` | Counts 19/37/31, folds list |
| bpmn corpus (10 files) | `/home/antoinefa/src/bpmn-canvas/tests/fixtures/corpus/*.bpmn` | `comments 0f3b5609248ed3eb3cb6f63b8cf2c7f2ee8f4036fb9de8d52ff3d9732f731d30`, `duplicate-id 0b3bc8a15b3a2a265e93f4106d5f1d168973d5f343240ea17411581f63df6151`, `extension-ok 0f47cd0cb28482cddbbb1ed4210c1ac5ee8c0387320028186d00a62080934a69`, `io-specification-incomplete ff99f2ed6e1a826d90b249a701aa29055416347c19967b6ce2f81d2be3efcf7f`, `no-di f092763b04317e16565f83dfa84be412778d6372f2bbbed5715917375c2fad5f`, `notation 9d39d6cf37f477ee14451b035dec7e1605f6da765df90c3d51441e4f870f763d`, `partial-di 73c526076bfb556a7974419b4f28f7e5f512b812a9a6fe3a08afe3acd4f73795`, `rogue-extension 3db5a5412a5f48f14b9c6e76f1c3a7cb1760941d01ce543031c66a88e9753cef`, `tiny 29142ab44afc7c4d55049d2ee27bc72af2dcb36785020c634d9aa853c7f92350`, `unresolved-reference 43da5729c80c31fd46e0ef1c5673ce7b83e46dc01a52addf3f3daed7c9d43b0c` | F1 verdicts per file (A′ §4.3 method) |
| bpmn parity index | `tests/fixtures/parity-corpus/index.json` | `40284149ca3538b35250e5896694e7d15c80d3c3233241e0d7ac3d91266df03a` | W01–W12 valid/invalid partition (§8.1) |
| bpmn vectors | `tests/fixtures/parity-corpus/canonical-vectors.json` | `f238aef110a43381416fd0025326f883f760dc75510a9f0cc5817415eb02d1c6` | c14n digest witnesses (§6.2 gate 2) |
| unicode pin | `tests/fixtures/unicode-case-15.0.0.pin.json` (bpmn-canvas) | `989aa11b6c138115a356c39867a26d8da281d2fd4b926508c72199b87fa4b762` | `unicode-case/1` UCD 15.0.0 lock |
| d2d corpus | `profile-corpus-v1.0.0` (198 files, vendored by hash) at `/home/antoinefa/src/bpmn-canvas/tests/fixtures/profile-parity-corpus/profile-parity-corpus/1/manifest.json` + pin `/home/antoinefa/src/bpmn-canvas/tests/fixtures/profile-parity-corpus.pin.json` | manifest `01b81fd9fb69f110a7f302631d6da92126bcb1672c67bea3ea68ff802df39faf`; pin `d34ee889917b8c5ef14c8d7bbd3fa2b222d93f4ac61de4bd0b41deb5767378a2` | JS/Python byte parity; compatibility-matrix verdicts |
| owner diagram decisions | `/home/antoinefa/src/sentropic/.tmp/governance-unification/owner-diagram-decisions-via-hcond.md` (2026-10-18) | `76eee3b4e91b34027c030c8c4c48006e0d387d224ffd4bd990085b557aa2a985` | Three-layer arbitration, nested diagrams, own JS strains, offline 32 MB (§§1.2, 1.3) |
| requirements | `/home/antoinefa/src/sentropic/.tmp/governance-unification/DS-DIAGRAM-MODULES-REQUIREMENTS.md` (owner-validated 2026-10-21) + `SPEC_EVOL_DS_DIAGRAM_CARDS.md` @ `97ecf69b` | requirements `c65f5f3afc752b387d3ee2498f894fb6a8637fa7a845b9e0608b450b4325e944`; component specification digest recorded in the corpus artefact at M1 lot time | Frozen `460 × 200`, spacing values, overflow/icon diagnostic names (§1.5 mapping) |
| reviews closed | `scratchpad/rev/dmodel-rev2.out`; Engram `review-M3-sol-r2.out`, `review-M3-astra-r2.out` (graphify m3/) | hashes computed at M1 lot time from those files; r3 §11 asserts coverage against their text | §11 traceability |

Each entry also records, in the corpus artefact: source-to-slot mapping (which source field feeds which §3.2/§3.6 slot), source-to-token mapping for legend conversion (tint/category → token name), default folds per scene, recursive layout hints per scene (§4.7 — the HRPN trees translated group-for-group, including `kit.root` and the `PPROZ` subtree, with per-group direction/stretch/gaps), and expected diagnostics per fixture (zero for valid instances; the asserted diagnostic arrays for rejected cases). No entry in this table is left `unverified`: every hash above was computed from the file at r3 authoring, and a gate recomputes each one before asserting its derived expectations.

### 8.6 Where the instances live and who checks them

The instances are authored once as Engram corpus fixtures (§7.1, item 3) and consumed in this repository by path plus digest. The M1 gate checks semantic and view validity (zero diagnostics, zero slot-carrying extensions, typed counts, per-id stroke styles, authored definitions); the roadmap gates of §10 check rendering and interaction against the same pinned instances. No instance file is copied into this repository as a locally edited variant: a correction to an instance is a corpus change in Engram with a new digest.

## 9. Architecture landing: settled with evidence, no owner question

The r2 question (« `generic@2` vs `architecture@1` ») is withdrawn. `architecture@1` is never registered. The matrix of §8.2 settles the landing without a trade-off left for the owner:

**Settled.** Card architecture diagrams — the #711 central scene (A1), the four HRPN scenes (A2–A4) and the HRPN S2-target engram graph (A5) — land on the **generic successor (`generic@2` + presentation fragment)**. ArchiMate diagrams land on **`archimate@1` completed from its skeleton** (§3.9) and compose the same fragment when drawn as cards. The two landings coexist on the one metamodel; neither is the other's successor and no document migrates between them to change its drawing.

Evidence, each item checkable against the pinned sources:

1. **Content.** A1/A2–A5 use only `node`/`container`-shaped entities, `contains` containment and labelled `link`s (plus the legend). None asserts an ArchiMate relation, layer/aspect assignment or viewpoint. Forcing them onto the ArchiMate matrix would invent semantics the producers never claimed — the matrix cells for `archimate@1` completed over those columns therefore read **partial with “producer assertion missing”**, while the generic-successor cells read **covered with “missing: none”** (§8.2). A landing is chosen by which row covers the content, not by the word “architecture”.
2. **Measured validity.** The HRPN fixtures are authored for `generic@1` (`profileMapping` in every fixture, MANIFEST `9558092fa2af669af9dcd4df6d9380e24a1cba723dbdd603ad2ebd86c6439a49`) and the engram graph declares `profileRefs: ["generic@1"]` (semantic sha `46f64154bb6592d49ccda5633b2c4d4205fb1c6752ef218be31d6757923ecf91`). The generic successor is the only completion under which those bytes migrate by the value-preserving path of §3.13.1 (including the literal « CI/CD » titles). An ArchiMate landing would require a cross-family document rewrite with no source assertion to justify it.
3. **Leak rule.** Putting the card anatomy into `archimate@1` as family attributes would violate §1.3 (card presentation in family semantics) and would have to be repeated for BPMN and UML card drawings. Composing one fragment with whichever family a document declares keeps each family's bytes free of presentation and keeps the fragment governed once.
4. **Study.** The study's central diagram is itself a `governance-routing` instance projected on `generic@1` (study §4.1), and its architecture need (N12) is “reuse `SemanticDocument`; the DS renders a `ViewDocument`” — a generic-metamodel statement, with ArchiMate governance assigned to Engram profile stewardship (C07), not to a separate drawing model.

Retained obligations, stated without overstatement: under this landing `generic@1` remains registered, resolvable and regression-tested forever (pins are immutable), exactly as `archimate@1` skeleton pins do. The cost difference against the withdrawn alternative is therefore not “one profile versus two to keep alive” — both families stay alive under either landing — but **one card-presentation governance (the fragment) versus three copies of it**, plus the absence of an invented cross-family migration. §§3–8 are normative under this landing as written; no section is parametric in a withdrawn id.

## 10. Milestones, gates and publication stages

Milestones run in order; a gate is a set of **named executable commands with exit 0** plus the named witnesses. No milestone is reported done on a partial gate. The layout/projection surface that folded-view gates depend on is **inside M1**, so no M1 gate waits for M3 work, and no gate is stated against geometry that no earlier milestone produces.

**Publication stages (distinct; never conflated):**

- **S1 — Development artifacts.** Code, tests and draft profile data in this repository and draft corpus data in Engram. A draft is outside the catalog (§7.4); S1 artifacts are never called pinnable, published or qualified.
- **S2 — Qualified profile publication.** The G0 §5.5 admission gate (§7.4) passes in Engram: self-validation green, corpus green, licence closure recorded, digests resolved, DIA `family-corpus` receipt present and matching, diagnostic-adapter fixtures green. Only S2 makes a completed profile pinnable by consumers.
- **S3 — Package publication.** Making a package (including a private package) public or releasing a version. Always an owner gesture; no gate below implies it.

| Milestone | Delivers (normative scope of this spec in **bold**) | Gate (all must hold; commands are run from the repository root) |
| --- | --- | --- |
| **M1 — Model, executor and folded views (all families)** | **Completed profile declarations (§5.5); shared resolver (§5.1); family parents (§5.2); scoped uniqueness + legacy adapter (§5.3); generic constraint mechanisms incl. legend/tone (§5.4) with the diagnostic adapter (§5.4.1); text/numeric constraints (§5.8); folded-view validation and projection (§5.6 core, §4.4); measurement + layout surface incl. fixed footprints, recursive hints (§5.6 layout, §§4.6/4.7); profile migration (§5.7); S1 Engram artifacts of §7.1 (draft, outside catalog); corpus instances A1–A5 (+ A7 corpora as authored) with the populated oracle manifest (§8.5). BPMN generated-stack work (A6) proceeds in its own A′ lot and is gated there; M1 claims no BPMN completion.** | Every §5 RED test green after having been observed RED; `validateProfile` of each completed declaration empty; A1–A5 semantic documents validate with zero diagnostics, zero slot-carrying extensions, typed counts and per-id stroke styles as in §8; every folded view of A1–A5 (including nested, multi-occurrence, port, n-ary and filter+fold fixtures) passes `validateView`; Appendix B folded views validate; summary definitions validate in their source views and activate in their overviews (§4.5); transcription digest check (§7.3.6) and frozen vectors (§7.3.5) green; `generic@1` and skeleton digests and validation results unchanged (§5.3.1, §6.2). Commands: `npm run build`, `npm run check`, `npm test` (workspace tests for `diagram-core` and `diagram-canvas` run in series as part of the root test script); §6.2 BPMN gates 2–4 re-run read-only; publishable-package count unchanged; no Python introduced. S2 admission is **not** part of the M1 gate: M1 ends at S1 with the admission evidence prepared. |
| **M2 — Cards render from the model** *(roadmap; normative contract in `SPEC_EVOL_DS_DIAGRAM_CARDS.md`)* | Atomic card and wrapping container (collapsed form is the atomic card) rendered directly from fragment slots for every family that composes them, consuming the shared `LineLayout` of §4.6; pictogram resolution by registry name; tone resolution through tokens and the document legend; colour-key legend rendering | Pointer gate (owned by the component spec): pixel-parity witnesses, slot-for-slot rendering of A1/A5 with no consumer adapter, overflow and unknown-icon diagnostics, and the rendered-pixel sharing assertion deferred from M1 (§4.6.6). Recorded here as a dependency of M3, with no normative clause in this spec. |
| **M3 — Interactive fold, layout and routing** *(roadmap behaviour over the M1 normative surface)* | Fold/unfold in place (per-container control, expand-all/collapse-all, per-zone chips) driving the M1 projection; re-routing; derived aggregation with authored summaries | Behaviour gate over M1 surfaces: every folded view of A1–A5 passes `validateView` (M1 already asserts this; M3 asserts it through the interactive controls, not only through `projectView` calls); scene conservation on every fold state; fixed footprints never enlarged (`docking-overflow` witnessed); reflow without collisions on every fold toggle. **Finite interaction corpus:** the versioned fixture listing, per instance, every fold toggle of every container occurrence, every chip toggle, expand/collapse-all in both orders, and one representative edge inspection per relation — enumerated in the corpus artefact with its count (the r2 “600/240” totals are withdrawn as unenumerated prose; the M3 lot publishes the enumerated list and its measured worst interaction under the 1.8 s budget over that list, with no continuous work at idle and timeouts never raised). |
| **M4 — xyflow nodes and consumer switch-over** *(roadmap; separate authorisations)* | xyflow (Svelte Flow) node forms and consumer import switch-over. **Owned by their own specifications; no normative content here.** | Roadmap pointer only: the owning spec's gate applies (plain-import module-graph checks, consumer hack inventory empty in the switched consumers). Nothing in §§3–8 depends on this milestone. |
| **M5 — Exports** *(roadmap)* | draw.io export keeping folds as collapsible groups, plus static exports rendering the supplied view exactly. **Owned by the L8 dossier / converter spec.** BPMN XML export stays at the A′ test edge. | Roadmap pointer only: the owning spec's round-trip witness applies (folded + expanded export/re-import re-validates with same typed counts, same per-id `strokeStyle`, same summary definitions with constituent ids). |
| **M6 — Editing** *(roadmap)* | Rich-text editing gated on RT-1, then editable/re-connectable edges as host-applied proposals over `diagram-core` commands (Track `01M5F3XSAJC2H6S9ZREP7JFFJ6`). BPMN editing stays in bpmn-canvas until the parity harness of `SPEC_RE_BPMN_JS_PARITY.md` proves otherwise. **Owned by RT-1, the edge-editing spec and the parity lots.** | Roadmap pointer only: RT-1 gate green before any editing lot starts; refused proposals change nothing. |

Staging rules: Svelte is the first framework for the roadmap component work; other frameworks follow the same contracts per stage and are never claimed delivered from types alone. draw.io and edge editing stay out of M1 scope even when a consumer asks early; their absence blocks no M1 gate.

## 11. Review traceability: surviving findings and their status in r3

Sources: DS Astra pass 2 (`/home/antoinefa/src/sent-tech-design-system/scratchpad/rev/dmodel-rev2.out`, findings R2-1…R2-18 over r2 `8d1727a1`), Engram Sol r2 (`/home/antoinefa/src/graphify/.graphify/scratch/design/ontology-guardian/m3/review-M3-sol-r2.out`) and Engram Astra r2 (`review-M3-astra-r2.out` in the same directory). “Survives” means the finding still applies under the one-metamodel reframe and is closed by the cited r3 section. “Moot” means the reframe removes the premise; the reason is stated and no section pretends to close it. Findings the two Engram reviews number differently are mapped to the R2 numbering where they coincide; Engram-only items are listed as E-sol/E-astra rows.

| Finding | Status in r3 | Closing section(s) / moot reason |
| --- | --- | --- |
| R2-1 — exact fold restoration (`strokeStyle` materialisation; folded-only storage unrecoverable) | **Survives — closed** | §4.4.2 (override presence preserved; retained source required, folded-only storage not supported), §4.4.3 step 2, §5.6 test 5 (empty-collapse byte identity incl. definitions) |
| R2-2 — authored summaries invalid in the source view; field inventory miscounted | **Survives — closed** | §4.5.1 definitions valid inactive in the source (kit `h2a:surfaces` witness), §4.5.2 activation derived, §3.13 inventory (2 endpoint + 1 relation + 1 group + 1 view fields), §5.6 test 12 |
| R2-3 — folded geometry never produced (4340×3050 retained vs 460×200) | **Survives — closed** | §4.4.3 (`layoutFolded = fold → measure → place → route`; source geometry retained, folded geometry placed), §4.6.1/§4.6.3, §5.6 fixed-footprint tests |
| R2-4 — migration drops residual content; dependents dangle; collisions mixed-invalid | **Survives — closed** | §3.13.1 step 3 (residual retention, deterministic re-basing, promote-only-overlap), §3.13.3 (blocking collisions atomic), §5.7 migration tests 3–4 |
| R2-5 — legacy discriminator is the missing field; legacy diagnostics gain `scope` | **Survives — closed** | §5.3.1 (pinned adapter table + `declarationFormat` as the discriminator; legacy projection without `scope`), §5.3 tests 3/6 |
| R2-6 — legend constraints enforce the wrong direction; membership selectors missing; `legendRef` target unchecked | **Survives — closed** | §5.4 (`required-parent` inverse mechanism + full membership selectors incl. `legendType`/`hierarchyId`/`tokenAttribute`; `bound-target-not-legend` arm), §5.4 tests 1–2 |
| R2-7 — measurements emitted only for headers; measurer lacks allocation/state; expanded width unresolved | **Survives — closed** | §4.6.2 (`SlotMeasurement` for every slot; `MeasureRequest.allocatedLines`/`folded`; width determination before header measurement), §4.6.3 steps 2/7, §5.6 measurement tests |
| R2-8 — oracle manifest still a promise | **Survives — closed** | §8.5 populated manifest (every hash computed from the file at r3 authoring; no `unverified` entry remains) |
| R2-9 — G0 compatibility ranges; schema objects in closed `assets`/`bindings`; identity placeholders | **Survives — closed** | §7.4 (exact pinned `compatibility`; G0-shaped `{role,path,mediaType,sha256}` assets + `{key,contract,required}` bindings; namespace/owner/canonical refs as pinned lookups recorded at admission; schema-valid specimen required) |
| R2-10 — hints cannot encode nested trees; `zoneGap` loses the axis distinction | **Survives — closed** | §4.7 (recursive `LayoutGroup` with scoped direction/stretch/gaps; axis-split `cardGapX/Y`, `zoneGapX/Y`; per-scene translations recorded in §8.5) |
| R2-11 — A5 ledger drops key `kicker`/`detail`/`footer`/`icon`; A2–A4 legend accounting missing | **Survives — closed** | §8.4 (every source field dispositioned: `detail` preserved in `description`, `icon` retired explicitly in the ledger; per-scene added-legend counts asserted) |
| R2-12 — legend `order` integer/≥0 has no carrier | **Survives — closed** | §3.6.2 + §5.8 (declarative `integer`/`min`/`max` on quantity schemas, digest-covered), numeric-constraints tests (`-1`, `0.5` refuse) |
| R2-13 — Appendix C placeholders (“per arm”, “template kept”) | **Survives — closed** | Appendix C (literal message + scalar detail values per arm, incl. orphan/wrong-parent forms; total diagnostics order §5.3; whole-array fixtures) |
| R2-14 — M1 depends on M2 rendering (layout lines = renderer lines) | **Survives — closed** | §4.6.3 step 7 + §4.6.6 (M1 asserts emitted measurements only), §10 M2 pointer gate owns the rendered-pixel sharing assertion |
| R2-15 — fold rules binary; n-ary association and fold-free self-links undefined; mixed-style aggregation | **Survives — closed** | §3.5/§4.4.1 (per-endpoint projection, complete-set internal test with an actual fold), §4.5.3 (aggregation keyed by effective style; duplicate-key refusal §4.5.1), §5.6 tests 11–12 |
| R2-16 — maintenance comparison overstates A (retained `generic@1` obligations) | **Moot as a decision input; retained as a cost note** | The A/B choice no longer exists (§9 settled landing). §9 states the retained-pin obligations under the settled landing and the real cost difference (one fragment governance). No section compares the withdrawn options. |
| R2-17 — grammar test demands hyphenated key fail `token-name` (impossible; token grammar subsumes key) | **Survives — closed** | §3.3 + §5.8 tests (dotted = token-only; single-segment key satisfies both, asserted as overlap) |
| R2-18 — resolver `abstract: false` on refinements contradicts inherited-abstractness prose | **Survives — closed** | §5.1 (`abstract` = reached profile type; refinement of an abstract base is concrete), §5.1 test 6 (compatibility witness) |
| E-sol 11 / E-astra 10 (handoff part) — G0 record cannot be constructed (base vs profile binding; specimen missing) | **Survives — closed** | §7.4 (base vs stacked binding separated per §3.13.4; schema-valid specimen as admission evidence) |
| E-sol 12 — new diagnostic codes have no G0 adapter handoff | **Survives — closed** | §5.4.1 (versioned diagnostic-adapter revision, pinned, with receipt round-trip fixtures per new code; admission refuses unmapped codes) |
| E-astra 6 — new view references break “commands unchanged” (dangling fold groups/summaries on delete) | **Survives — closed** | §5.7 (dependency-aware deletion + inverse restoration over `VisualGroup.occurrence`, provenance and `summaryLabels`; delete/undo witnesses) |
| E-sol 16 — `resultDigest` “changes when” contradicts P-RESULT | **Survives — closed** | §7.3 preamble + §7.3.1 table (result changes exactly when its effective preimage changes) |
| Pass-1 findings 1–17, A1–A7, B1–B9 closed in r2 (digests, outermost representative, dashed carrier, fold revision, resolver, supersession, binding/order, scope discipline) | **Survive where the reframe keeps their mechanism; otherwise subsumed** | Digests §7.3; representative §4.4.1; `strokeStyle` §3.5.1; revision §4.1.3; resolver §5.1; supersession §3.13.4 (generic only — ArchiMate/UML complete in place, BPMN by generation); legend binding/order §3.6; normative scope §0/§10. The r2 parametric-`PROFILE_ID` device itself is **moot**: replaced by per-family declarations (§3.8–§3.11) with no withdrawn id anywhere. |

## Appendix A — Completed declaration sketches (normative content, abbreviated syntax)

```ts
// Presentation fragment (family-neutral, composed with any family; governed once):
//   leaf presentation (on any leaf type):  name!, kicker, body, detail, footer,
//     icon(key), tone(key), legendRef(reference entity)
//   container presentation (on any container-family type): name!, kicker,
//     subtitle, footer, icon(key), tone(key), legendRef(reference entity)
//   legend (container: true, atomic footprint 460x200 "both"; expanded computed):
//     name!, kicker, subtitle, footer, icon(key), tone(key), legendRef(reference entity)
//   legend-key (footprint 460x64 fixedAxes "height"):
//     name!, category!(key), token!(token-name), description,
//     order!(quantity unit, integer >= 0)
// Footprints: leaf/collapsed 460x200 "both"; legend-key height 64 "height";
//   expanded computed "none" (§4.6.1).
//
// generic@2 (completeness "complete"):
//   node, container(container: true) + fragment; legend/legend-key via composition.
//   port (in/out/inout; label text<=80).
//   link (directed; source/target 1..1 entity|port; label<=200, weight, strokeStyle[solid,dashed])
//   contains (directed; parent/child 1..1; hierarchy containment, tree)
//   association (undirected; member 2..8; label<=120, strokeStyle[solid,dashed])
//   Constraints (§5.4 data): hierarchy, parent-family, children-restricted,
//     required-parent, category-membership, acyclic-hierarchy;
//     unique-attribute(legend-key.category, {withinType:"legend"}),
//     unique-attribute(legend-key.order,    {withinType:"legend"}).
//   Limits: maxEntities 100000, maxRelations 500000, maxEndpointsPerRelation 8.
//   Legacy note: generic@1 constraints without scope are read via the pinned
//     legacy-constraints@1 binding (§5.3.1); stored bytes and digest unchanged.
//   Stack note: generic@2 lineage.parents = []; stack = [generic@2 pin] (§3.13.4).
//
// archimate@1 completed (§3.9): element catalogue per layer/aspect over the
//   skeleton supertype reading; junction; grouping(container: true);
//   11 relations with the versioned source/target matrix; grouping hierarchy.
// uml@1 completed (§3.11): class, interface, package(container: true),
//   property, operation; association/generalization/dependency;
//   packageContainment hierarchy.
// bpmn generated stack (§3.10, A′): bpmn@2/bpmndi@1/dc@1/di@1/bioc@1/color@1/sem@1
//   generated from the pinned descriptor snapshot; bpmn@1 skeleton retained
//   readable (§6). No declaration is transcribed in this appendix for BPMN:
//   the generated artefacts are the data.
```

## Appendix B — Worked folded projections

**B.1 Single fold (review example).** Document (fragment): containers `MSGZ` (collapsed in the view), cards `CHAT` (outside `MSGZ`) and `TOPIC` (contained in `MSGZ`); semantic relation `link` `CHAT → TOPIC`. Source view: occurrences `occ:CHAT`, `occ:MSGZ`, `occ:TOPIC`; `occ:TOPIC` names the fold group of `occ:MSGZ`; that group (`occurrence: occ:MSGZ`) is `collapsed: true`.

Projection (§4.4.3) with collapsed set `{occ:MSGZ}`: `occ:TOPIC` is hidden by fold; its visible representative is `occ:MSGZ` (the only, hence outermost, collapsed ancestor occurrence). The relation occurrence becomes: source endpoint `{ role: "source", occurrence: occ:CHAT }` (unchanged, no provenance fields); target endpoint `{ role: "target", occurrence: occ:MSGZ, semanticTarget: "entity:TOPIC", sourceOccurrence: occ:TOPIC }`. Laid out by `layoutFolded`, `occ:MSGZ` takes the `460 × 200` collapsed box and the edge routes representative-anchor to representative-anchor; the source geometry of `occ:TOPIC` stays on its retained record.

Validation (§4.4.4): `entity:TOPIC` is a target of the semantic relation for role `target`; `sourceOccurrence` draws it; the `MSGZ` occurrence exists, is visible and is folded; walking parent occurrences from `occ:TOPIC` reaches `occ:MSGZ` through the collapsed group; `MSGZ` is in the container family. Zero diagnostics. Removing `semanticTarget` makes the same view refuse `occurrence-endpoint-mismatch`, which is the RED state of the current executor on this input and the first test of `packages/diagram-core/tests/folded-view.test.ts`. Unfolding is `projectView(document, sourceView, ∅)`, whose target endpoint is again `{ occurrence: occ:TOPIC }` byte-identically (no patched residue, no materialised `strokeStyle`).

**B.2 Nested fold.** Add ancestors `PPROZ` (contains `MSGZ`) and `GCP`/`PRODZ` above it, all collapsed, with `TOPIC` inside `MSGZ`. Collapsed set `{occ:GCP…, occ:PPROZ, occ:MSGZ}` (every ancestor occurrence folded). The representative of `occ:TOPIC` is the **outermost** collapsed ancestor occurrence (the root-most folded one), which is visible because nothing above it is folded. The inner folded occurrences (`MSGZ`, `PPROZ`) are hidden and are never selected; a hand-written projection naming `occ:MSGZ` as representative refuses with detail `projection-not-outermost` (and would have drawn to a hidden occurrence). Collapsing only `MSGZ` (ancestors expanded) selects `occ:MSGZ`, as in B.1. Both folded views validate, and each unfold step is a fresh `projectView` from the retained source view.

**B.3 N-ary association across two collapsed branches.** An `association` with members `occ:A1` (inside collapsed `occ:ZONE-A`), `occ:B1` (inside collapsed `occ:ZONE-B`) and `occ:EXT` (outside any fold). Representatives: `occ:ZONE-A`, `occ:ZONE-B`, `occ:EXT` — three distinct representatives with folds involved, so the occurrence is projected (each endpoint independently, provenance per endpoint), never internal, and validates. Collapsing further so that all three representatives coincide (one outer zone folded over both branches and the external member drawn inside it) makes the representative set a single element with a fold involved: the occurrence becomes internal and draws nothing. With no fold at all, three coincident representatives cannot arise from distinct visible occurrences, and a visible self-link stays untouched (§4.4.1).

**B.4 Authored aggregate.** Two links `CHAT → TOPIC` and `CHAT → SUB` project onto representative pair `(occ:CHAT, occ:MSGZ)`, one `solid` and one `dashed`. They form **two** aggregate groups (style-keyed, §4.5.3) and never merge. The source view carries definition `{ id: "sum:overview-chat", sourceOccurrence: occ:CHAT, targetOccurrence: occ:MSGZ, label: "<authored overview label>", relationIds: [the solid relation id], strokeStyle: "solid" }` — valid in the source view by the subtree rule (§4.5.1) even though no top-level `CHAT → MSGZ` relation exists there. In the folded overview the definition is active for the solid group and the renderer draws its label; the dashed group falls back to its count label. A second definition for the same `(occ:CHAT, occ:MSGZ, solid)` triple refuses `summary-duplicate-key`. Export serialises label + ids + style so re-import restores the same definition.

## Appendix C — Frozen diagnostic contracts

Conventions for every row: severity is `error` unless stated; `refs` order is as listed; `details` values are scalars only (strings/numbers/booleans) — an object or array in `details` is a contract violation; multiplicity is per violating record as stated; messages are **literal** (`<…>` are substitutions with the stated value domain). Whole diagnostic arrays are compared in tests under reordered input in the total order of §5.3 (`(path, code, refs[0], refs[1])`, UTF-16); the PR #193 order rule (UTF-16 id order, first id is the reference) applies inside each uniqueness scope (§5.3).

| Code | Status | Path template | Literal message | Refs (ordered) | Details (scalar keys with value domains) | Multiplicity |
| --- | --- | --- | --- | --- | --- | --- |
| `legend-key-parent-invalid` arm A (wrong child under a legend) | new | `entities.<childId>` | `key entity <childId> is contained by legend <parentId>; only legend-key entities may be contained by a legend` | `[childId, parentId]` | `childType: <effective type id>`, `parentType: <effective type id>`, `constraint: "children-restricted"` | One per violating child |
| `legend-key-parent-invalid` arm B (key under a non-legend) | new | `entities.<childId>` | `key entity <childId> is contained by <parentId>, which is outside the legend family; a legend-key must be contained by a legend` | `[childId, parentId]` | `childType: <effective type id>`, `parentType: <effective type id>`, `constraint: "required-parent"` | One per violating child |
| `legend-key-parent-invalid` arm C (orphan key) | new | `entities.<childId>` | `key entity <childId> has no hierarchy parent; a legend-key must be contained by a legend` | `[childId]` | `childType: <effective type id>`, `parentType: "none"`, `constraint: "required-parent"` | One per orphan key |
| `tone-category-unknown` (undeclared) | new | `entities.<entityId>.attributes.<attribute>` | `tone <value> on <entityId> is not declared by any legend in this document` | `[entityId]` | `attribute: <attribute name>`, `value: <tone value>`, `legendBinding: "undeclared"`, `categoryType: <category type id>` | One per violating entity attribute |
| `tone-category-unknown` (ambiguous) | new | `entities.<entityId>.attributes.<attribute>` | `tone <value> on <entityId> resolves ambiguously across legends; set legendRef to bind it` | `[entityId]` | `attribute`, `value`, `legendBinding: "ambiguous"`, `categoryType` (as above) | One per violating entity attribute |
| `tone-category-unknown` (bound target not a legend) | new | `entities.<entityId>.attributes.<bindingAttribute>` | `legendRef on <entityId> names <targetId>, which is not a legend` | `[entityId, targetId]` | `attribute: <binding attribute name>`, `value: <tone value or "">`, `legendBinding: "bound-target-not-legend"`, `categoryType` | One per violating binding |
| `text-pattern-mismatch` (pattern arm) | new | `<recordPath>.attributes.<attribute>` (entity/relation/port or collection item `…[i]`) | `value does not match the <patternName> grammar` | `[]` (record path carries the location) | `pattern: <patternName>`, `length: <value length>`, `maxLength: <declared bound>` (only when declared) | One per violating value |
| `text-pattern-mismatch` (minimum-length arm) | new | `<recordPath>.attributes.<attribute>` | `value is shorter than the minimum length for <attribute>` | `[]` | `pattern: "min-length"`, `length: <value length>`, `minLength: <declared minimum>` | One per violating value |
| `quantity-not-integer` | new | `<recordPath>.attributes.<attribute>` | `value <value> is not an integer` | `[]` | `value: <numeric value>`, `integer: "required"` | One per violating value |
| `quantity-below-min` / `quantity-above-max` | new | `<recordPath>.attributes.<attribute>` | `value <value> is below the minimum <min>` / `value <value> is above the maximum <max>` | `[]` | `value`, plus `min` resp. `max` (numeric scalars) | One per violating value |
| `unique-attribute-violation` (new contract) | reused (details gain scalar `scope`) | `entities.<id>.attributes.<attribute>` | `attribute <attribute> must be unique among <entityType> entities in scope <scope>; <referenceId> carries the same value` | `[reportedId, referenceId]` (reference first in UTF-16 order, never reported) | `attribute`, `type`, `scope: "document" \| "siblings" \| "within:<typeId>"` | One per duplicate beyond the reference, per scope group |
| `unique-attribute-violation` (legacy projection) | reused (frozen historical shape) | `entities.<id>.attributes.<attribute>` | `attribute <attribute> must be unique among <entityType> entities; <referenceId> carries the same value` | `[reportedId, referenceId]` | `attribute`, `type` (no `scope` key, §5.3.1) | As above |
| `endpoint-target-not-allowed` | reused (details gain `seenChain`) | `relations.<id>.endpoints[<i>]` (existing template kept) | Existing template kept | Existing refs kept | `seenType`, `seenChain` (chain joined with `>`), `allowed` | One per violating endpoint |
| `occurrence-endpoint-mismatch` (fold arms) | reused (new `details` values, no new code) | `relationOccurrences.<id>.endpoints[<i>].occurrence` (resp. the `summaryLabels.<id>` path for definition arms) | `projected endpoint for role <role> fails check <detailValue>` (definition arms: `summary definition <id> fails check <detailValue>`) | `[occurrenceId, drawnTarget, …roleTargets]` as today (definition arms: `[summaryId, sourceOccurrence, targetOccurrence]`) | `role`, plus exactly one of `representative-hidden`, `projection-not-folded`, `projection-not-outermost`, `representative-not-container`, `provenance-missing`, `provenance-mismatch`, `projection-source-projected`, `summary-constituents-mismatch`, `summary-duplicate-key` | One per violating endpoint (resp. per summary definition) |
| `type-definition-conflict` (new details) | reused | `profiles.<id>.constraints` / `typeDefinitions.<id>` (per arm) | Per arm; names the missing scope, abstract container, bad text pattern, bad numeric bounds or cycle | `[typeId]` where applicable | Exactly one of `unique-scope-missing`, `abstract-container`, `text-pattern-invalid`, `numeric-constraint-invalid` per arm (in addition to any existing keys of that arm), plus `attribute` / `cycle` (joined ids) where the arm states them | One per violating declaration |

Layout warnings `card-overflow` / `zone-overflow` carry a `MeasurementOverflow` (§4.6.4) in the layout result; `docking-overflow` carries `{ code, refs: [occurrenceId], message: "side <side> of <occurrence> needs <required> docks, fits <fitted>" }`. None of the three is a `Diagnostic` code and none enters `validateDocument` output.

## Appendix D — Oracle manifest entry shape (normative skeleton)

```ts
interface OracleEntry {
  readonly id: string;              // e.g. "a5-semantic", "g0", "m2-model"
  readonly revision: string;        // commit sha or exact version; never a branch name alone
  readonly path: string;            // repository-relative or governed absolute path as recorded
  readonly sha256: string;          // full lowercase hex over exact file bytes, or "unverified: <reason>"
  readonly derived: Readonly<Record<string, unknown>>; // counts, folds, mappings, expected diagnostics
}
// Manifest: { entries: OracleEntry[], manifestDigest: string /* SHA-256 over RFC 8785 bytes of entries */ }
```

A gate resolves each entry by path, recomputes `sha256` over exact bytes, and refuses (fixture error) on any mismatch or missing entry before asserting `derived`. An entry marked `unverified` blocks any gate that depends on its `derived` values and blocks none that does not. Mutable working-tree paths without a recorded sha256 are not oracle entries.







