# @sentropic/diagram-core

The typed semantic core of the diagram programme: versioned documents and
profiles, views with occurrences, and transactional commands that return their
logical inverse. No runtime dependency, no DOM, no framework, no renderer.

This package is public as `@sentropic/diagram-core`, at version `0.3.0`.
Pin the exact version — never a range, never `latest`. Publication is CI-only
through `.github/workflows/diagram-core-publish.yml` on tags `diagram-core-v<version>`.

## The five objects, and which two live here

| Object | Where it lives |
|---|---|
| `SemanticDocument` — business truth | **here** |
| `ViewDocument` — drawings of that truth | **here** |
| `ProcessingSnapshot` — normalised input of a layout | `@sentropic/graph/processing` |
| `Scene` / `GeometryFrame` — what a backend draws | GD-M2-CANVAS, not written |
| `TextSource` — imported text with its AST and spans | GD-M4 codecs, not written |

## The model

### References are nominal, and they say their own namespace

Seven reference types, none assignable to another: `EntityRef`, `RelationRef`,
`OccurrenceRef`, `PortRef`, `ViewRef`, `ResourceRef`, `DocumentRef`. The brand is
a phantom property keyed by a module-private `unique symbol`, so nothing of it
survives compilation; at runtime a reference carries its identity namespace as a
prefix (`entity:alpha`, `occurrence:alpha-1`), which is how a function that
expects an occurrence refuses an entity that crossed a file or process boundary —
with a `reference-type-mismatch` diagnostic, not a silent misread.

The spec names five. `RelationRef` and `DocumentRef` are declared because a
relation occurrence points at a relation and a view at a document; typing either
as `EntityRef` would be exactly the mis-typing the rule exists to prevent.

### A document is a schema, not a bag

An entity is discriminated by `profile` **and** `type`, and every attribute is
read through the schema of that type: `text`, `boolean`, `date` (ISO-8601),
`quantity` (a magnitude **and** its unit), `enum`, `reference` (with the
namespace it must carry) or a **bounded** `collection` — `maxItems` is required,
because an unbounded list is how a schema becomes a bag. An attribute the schema
does not declare is refused; unmodelled content belongs in an extension.

A relation has two or more endpoints, each with a **role** declared by its type,
a cardinality per role and a declared set of legal targets. A hyperrelation
(`generic@1`'s `association`, 2..8 members) keeps one business id, which is what
lets a projection turn it into a junction node without losing it.

A semantic port belongs to an entity and has a direction. Its side, order and
anchor are geometric and live on the **port occurrence** in a view.

Collections are records keyed by the element's own reference. Insertion order is
therefore never content, and every order that matters is an explicit field
(`PortOccurrence.order`, `EntityOccurrence.z`).

### Profiles are versioned schema modules

`generic@1` is the only **complete** profile of this lot. `bpmn@1`,
`archimate@1` and `uml@1` are declared **skeletons**: they carry
`completeness: "skeleton"`, their types and relation arity are declared and
validated by the same machinery, their qualification fixtures are partial, and
each lists in `notes` what it does **not** declare. **No BPMN, ArchiMate or UML
conformance is claimed anywhere in this package.** The native profiles are GD-M3.

### A view holds drawings, never facts

One entity has N occurrences in a view and occurrences in several views. Removing
an occurrence removes a drawing. Deleting the **entity** requires an explicit
policy for its occurrences, its relations and its ports — the field is mandatory
in the type and a malformed one is `delete-policy-required` at runtime. A visual
group declares itself and membership lives on the occurrence (`group`), so there
is one source of truth for it.

The persisted presentation state holds a camera (`x`, `y`, `zoom`) and an
optional grid. It is stored here, and deliberately not imported from a renderer
package: a migration-versioned persisted schema must not be hostage to another
package's type evolution.

### Endpoint provenance: fold and chain

Endpoints attach a relation role to a drawn occurrence. When the drawing differs
from its semantic target, exactly one provenance arm supplies the witness:

| Form | Fields beyond `role`, `occurrence` |
| --- | --- |
| Plain | None; the occurrence draws the role target directly. |
| Fold | `semanticTarget` and `sourceOccurrence`; the current fold proves the representative. |
| Chain | `semanticTarget` and `chainProvenance`; `sourceOccurrence` is absent. |

`chainProvenance` contains a profile-declared `predicateId`, ordered relation
`hops` from the semantic target to the drawn entity, and aggregate-only `members`.
Profiles declare `chainPredicates` as serialisable DATA: typed directed steps,
repeat modes, strict string/boolean attribute constraints, alternatives and
`unique`, `ordered`, `first-drawn` or `aggregate` selection. Types include resolved
ancestry in their own profile. Walks see only that profile's semantic entities,
relations and attributes; the sole view input is whether an occurrence exists
for an entity. Geometry, groups, collapsed state and filters cannot prove a chain.
A drawn port is tested through its owner entity.

Walks stop at the first admitted end and close cycles with an iterative branch
stack. Completed suffixes are reused while their cycle-pruning ancestors remain
on the branch, preserving the first witness in candidate order. `first-drawn`
accepts a drawn completed single-step prefix (the exposer in an external-API
chain) without requiring the remaining suffix. A drawn non-admitted intermediate
blocks further lifting.
Aggregates recompute the complete member set, test each member's target and source
chains, sort by UTF-16 `(sourceId, targetId, relationId)`, and require the smallest
member as carrier. Any occurrence of the same repo entity is an equivalent end.

`validateView` reports `occurrence-endpoint-mismatch` with one of
`chain-not-declared`, `chain-hop-mismatch`, `chain-not-proven`, `chain-ambiguous`
or `chain-aggregation-mismatch` in `details.check`. Candidate lists are in `refs`;
details remain scalar. Pairing failures retain the fold `provenance-missing`
template, and dangling witness refs precede chain checks. `validateProfile` uses
`type-definition-conflict` with `chain-duplicate-id`, `chain-unknown-type`,
`chain-invalid-direction`, `chain-invalid-repeat` or `chain-members-not-aggregate`;
functions fail serialisation with `value-not-serialisable`.

Selection owns its cardinality outcome: several distinct ends under `unique`
give `chain-not-proven` with `cause: "cardinality"`; several drawn ends in the
chosen `ordered` alternative give `chain-ambiguous`. Semantic cardinality remains
profile-side; `validateView` never calls `validateDocument`.

Projection, removal repair and replacement inverses carry chain endpoints
verbatim, including hop/member order, and leave validation to `validateView`.
Old views keep their canonical bytes. Frozen schemas `@1/@2` refuse chain fields;
`@3` adds the exclusive pairing forms and resolves by exact pin only, without
changing the presentation pin. The package includes
[`schemas/diagram-view-schema-3.json`](schemas/diagram-view-schema-3.json) and its
[canonical SHA-256](schemas/diagram-view-schema-3.sha256):
`b415c05197692baa5f74ab35e3150ce58079cf9f06201df5e581d222a8d2c0df`.
The `@3` schema shipped with `0.2.0`. `@sentropic/diagram-canvas` pins this
package by exact version; schema inclusion does not certify downstream adoption.

### Commands are transactions

`applyTransaction(state, transaction, { registry })` returns either
`{ status: "applied", state, effects, inverse }` or
`{ status: "rejected", diagnostics }`.

- **No partial success.** Commands run on a working copy, the final state is
  validated once, and any refusal throws the whole copy away. The caller's state
  is never mutated.
- **Revision conflicts are explicit.** `baseRevision` must be the state's
  revision; otherwise `revision-conflict`, carrying `expected` and `seen`.
- **One counter.** A transaction bumps `document.revision` by one and stamps the
  views it touched with that revision, so a view is never ahead of its document.
- **An inverse, or a reason.** Every one of the 18 commands returns a logical
  inverse built from the pre-image it captured. `non-invertible` is returned when
  a cascade's inverse would exceed the declared `inverseBudget`, with the budget
  in the reason: an unbounded inverse is an unbounded cost on the host's undo
  stack.
- **Undo is a new transaction**, replayed against the current revision, never a
  rewrite of the journal. After a command and its inverse the content is
  identical and the revision is two ahead — which is why the round-trip tests
  compare `serialiseContent` (revisions normalised) and assert the revision
  arithmetic separately.

The 18th command, `remove-preserved-extension`, is an addition to the spec's list
of seventeen: adding an extension can only be undone by removing one, and no
command in the list removed one.

### Canonical form

`serialiseState` / `serialiseDocument` produce sorted-key JSON with no
whitespace. A function, a non-finite number, a `BigInt`, a symbol or a cycle is
**refused** with a diagnostic rather than silently turned into `null`. That
refusal is also what keeps a function out of a document.

`hashContent` is a 64-bit FNV-1a printed as `fnv1a64:<16 hex>`. It is **not
cryptographic**: it makes drift detectable, it must never gate trust. A real
digest belongs to the codecs lot, where a hash crosses a trust boundary.

### Migration

A stored version is migrated only by a registered, versioned function, which
returns a report: `from`, `to`, the operations it performed, the items it could
not carry over **with a reason each**, and the original bytes with their hash.
This build knows `1.0 -> 1.1`. An unknown **major** is refused for write and
preserved for inspection and export (`exportPreserved`).

A migration is not a repair. It migrates what it can and says what it could not,
so a migrated document may still be unwritable — for instance when a value that
failed to convert was a **required** attribute. The report names the element; the
decision is the host's.

## Layout-hint vocabulary (`ds-layout-hints@1`)

A view declaration names its layout through one closed vocabulary, authored,
versioned and pinned here. A consumer (engram's view mechanism) references the
pin and calls the validator; it never keeps a mode table of its own.

```ts
import { DS_LAYOUT_VOCABULARY_PIN, validateLayoutHints, lowerLayoutHints } from "@sentropic/diagram-core";

const layout = { vocabulary: "ds-layout-hints@1", mode: "auto-pack", grouping_axis: "rows" };
const diagnostics = validateLayoutHints(layout); // [] means valid
```

| Export | What it is |
|---|---|
| `DS_LAYOUT_HINTS_SCHEMA` | JSON Schema 2020-12, closed, deeply frozen. Also shipped as [`schemas/ds-layout-hints-1.json`](schemas/ds-layout-hints-1.json) (canonical bytes) with its [SHA-256](schemas/ds-layout-hints-1.sha256). |
| `DS_LAYOUT_HINTS_RULES` | The semantic rules as frozen data. Every list equals an enum of the schema's `$defs`. |
| `validateLayoutHints(value, context?)` | Pure, never throws. Structure and semantics in one pass; diagnostics sorted by (path, code). |
| `DS_LAYOUT_VOCABULARY_PIN` | `PresentationPin` `{ id, version, contentDigest }`. |
| `lowerLayoutHints(hints, roots?)` | A valid payload lowered to the hints the layout engine takes. |

The pin:

```
id             https://sentropic.dev/schemas/diagram/layout-hints/v1
version        ds-layout-hints@1
contentDigest  e72fd3f3446e19585b2992071f57c3777685f27087165c932806e12354ced42c
```

`contentDigest` is the SHA-256 (bare 64 lowercase hex) of the RFC 8785 bytes of
the schema: `sha256Hex(canonicalBytes(DS_LAYOUT_HINTS_SCHEMA))`. The refusal
classification lives in the schema's `$defs`, so the digest covers it. Any
change to the schema is `ds-layout-hints@2`; `tests/layout-hints.test.ts`
recomputes the digest and fails on an edit in place.

**Scope rule of `@1`: a payload that validates must render.** The vocabulary
admits only what the layout engine of `@sentropic/diagram-canvas` executes at
this version.

| `mode` | Engine entry | Admitted on |
|---|---|---|
| `auto-pack` | `layoutMeasured` | every view |
| `layered-flow` | `layoutDocument` | `generic@1` views without a typed presentation, stated through `context` |

Hints, read by `auto-pack` only: `ordering`, `rootOrder`, `grouping`
(recursive groups `{ id, direction, items, stretch? }`), `grouping_axis`
(`"rows" | "columns"`, a shorthand for one group over the root level, exclusive
with `grouping`) and `stretch`. `mode` is required: an absent mode is never
read as `auto-pack`.

Refusals are typed, and nothing is coerced to another mode:

| Code | Raised when |
|---|---|
| `layout-vocabulary-unknown` | `vocabulary` is absent or is not `ds-layout-hints@1`. Nothing else is read. |
| `layout-hints-invalid` | Structural failure: wrong type, malformed entity reference, missing member. |
| `layout-mode-not-implemented` | `lane-stack`, `matrix-grid`, `tree`: specified, not executed yet. `details.vocabulary` names `ds-layout-hints@2`. |
| `layout-mode-unknown` | Any other mode. |
| `layout-mode-out-of-scope` | `layered-flow` on a view that is not `generic@1`, that carries a typed presentation, that declares a presentation vocabulary, or whose `context` is not stated. |
| `layout-hint-forbidden` | A spacing override or a coordinate: `density`, `cardGapX`, `cardGapY`, `zoneGapX`, `zoneGapY`, `rankGap`, `gapAfter`, `x`, `y`, `width`, `height`, `edge_label_orientation`. |
| `layout-hint-not-implemented` | `direction`, `rotate_labels`: specified, not executed yet. |
| `layout-hint-out-of-scope` | A hint under `layered-flow`, which takes none. |
| `layout-hint-unknown` | Any other property. |
| `layout-hint-conflict` | `grouping` with `grouping_axis`; a group id used twice; a leaf placed twice; a member listed twice, ordered under two parents or under itself. |

What the validator cannot see: whether a reference exists in the document and
whether the members of a group are siblings. Both need the document and stay
with the layout engine (`validateHints` in `@sentropic/diagram-canvas`).
Whether a view kind takes a layout at all is the declaring grammar's rule.

## Notation pin (`diagram-notation@1`)

`DIAGRAM_NOTATION_PIN` is exported beside the layout pin:

```
id             diagram-notation
version        1
contentDigest  b4bfa7174a7a53ec23b8a8d7580d6bdfc3bab7f29deb1204aa2e4ce12424909f
```

`contentDigest` is the SHA-256 of the RFC 8785 bytes of
`{ schema: DIAGRAM_NOTATION_SCHEMA, rules: DIAGRAM_NOTATION_RULES }`. The schema
(`$id` `engram:diagram-notation-schema/1`) is structural only: closed objects,
enums, string bounds, required `role`, `nature` and `encoding`, slot shape. The
rules are frozen data: the role table (nature, `icon`, `kicker`, `variant`,
`holds`), the variants of each nature, the property list of each encoding,
slot ownership. Any change to either is `diagram-notation@2`.

Not covered: `validateNotation`, `validateViewNotation` and `resolveNotation`.
This version freezes the vocabulary a consumer pins and ships no executor for
it; `Profile` has no `notation` member yet.

## What this package does not import

Nothing. Not one specifier that is not a relative module of its own source, which
a test asserts by scanning every file. In particular:

- **no `@sentropic/graph`.** SPEC 3.1 allows DOM-free graph contracts and offers
  to create a `@sentropic/graph/contracts` subpath for them. This lot needs none:
  its only candidate consumer would be the persisted view schema, and binding a
  migration-versioned persisted schema to another package's evolving types is
  what the migration rule exists to prevent. `@sentropic/graph/processing` already
  exists and is DOM-free, and contains nothing this package consumes. The
  `diagram-core -> graph` edge of `docs/graph-dataviz-architecture-dag.json`
  stays `"status": "proposed"`, which is what that file already says.
- **no DOM.** Enforced by the compiler first: `tsconfig.json` gives `src`
  `lib: ["ES2022"]` and `types: []`, so `document`, `window` and every node
  builtin are unresolvable names. Then by tests: the barrel is imported in Node
  with no jsdom, with a throwing proxy installed as `document`/`window`, and the
  source is scanned for those identifiers in executable code.
- **no renderer, no WebGL, no framework, no design system package.**

## What is not covered yet

- **Projection** (study invariant 7): this package produces no projection,
  no geometry and no layout. `LayoutOutcome.inverse` in
  `@sentropic/graph/processing` already carries the origin → projected index →
  result correspondence; the scene side is GD-M2-CANVAS.
- **The world → view → CSS pixel → device pixel transform contract** (second half
  of invariant 8): a rendering contract. This package persists a camera and finite
  geometry and exposes no transform composition, no `devicePixelRatio` and no hit
  testing.
- **Codecs, source text, AST/CST and conversion reports**: GD-M4. Nothing here
  parses, fetches or executes imported content, a URI or markup.
- **Native BPMN / ArchiMate / UML profiles**: GD-M3. See the skeletons' `notes`.
- **The notation executor**: `diagram-notation@1` is pinned as data only.
- **Layout modes `lane-stack`, `matrix-grid`, `tree` and the hints `direction`,
  `rotate_labels`**: refused by `ds-layout-hints@1` until the layout engine
  executes them.
- **A reference disposition in the delete policy.** The policy governs
  occurrences, relations and ports. An entity a typed reference attribute still
  points at cannot be deleted: the transaction refuses itself on the final state
  (`dangling-reference`) rather than clearing someone's attribute. "Clear",
  "refuse" or "reassign" as an explicit choice is a later decision.
- **Filter evaluation, and commands over groups and filters.** A view's groups and
  filters are declared, validated and persisted here; nothing in this lot decides
  what a filter hides, nor what happens to a relation whose endpoint is hidden,
  and no command of this lot edits a group or a filter. Both are GD-M2-CANVAS.
- **Selection, geometric port editing and annotations**: GD-M2-CANVAS, by SPEC 3.5.
- **A cryptographic content hash**: see `hash.ts`.
- **Concurrency beyond compare-and-swap semantics.** `revision-conflict` is a
  refusal, not a merge. No conflict resolution, no CRDT, no operational transform.

## Layout

```
src/refs.ts          the seven nominal reference types, their guards and diagnostics
src/diagnostics.ts   one code per refusal; nothing returns a boolean validity
src/attributes.ts    typed attribute values and their schemas
src/profile.ts       profile declarations, registry, and profile self-validation
src/chain-profile.ts chain predicate DATA declaration checks
src/chain.ts         indexed document-only chain walks, selection and aggregate witnesses
src/profiles/        generic@1 (complete), bpmn@1 / archimate@1 / uml@1 (skeletons)
src/document.ts      SemanticDocument, entities, relations, ports, resources, extensions
src/view.ts          ViewDocument, the three occurrence kinds, groups, filters, presentation
src/state.ts         { document, views } - the transactional unit
src/canonical.ts     canonical JSON and content serialisation
src/hash.ts          fnv1a64, dependency-free, non-cryptographic
src/validate.ts      every refusal, including the nine named rejected cases
src/commands.ts      18 commands, transactions, effects, inverses
src/migrate.ts       registered migrations and their reports
src/layout-hints.ts  ds-layout-hints@1: schema, rules, validator, pin, lowering
src/notation.ts      diagram-notation@1: schema, rules, pin (no executor)
fixtures/            valid documents, a divergent-revision state, a command
                     sequence, the nine rejected cases, a 1.0 stored document
tests/               10 suites; `refs-nominal.test.ts` is a COMPILER test
```

## Gates

```
npm run --workspace @sentropic/diagram-core build   # tsc -> dist
npm run --workspace @sentropic/diagram-core check   # tsc over src AND tests
npm run --workspace @sentropic/diagram-core test    # vitest, node environment
```

`check` compiles the tests on purpose: `tests/refs-nominal.test.ts` proves the
reference types are not interchangeable with one `@ts-expect-error` per
illegitimate assignment (42 ordered pairs). Those assertions only mean something
if a compiler reads them. Remove the brand from `Ref<K>` and `check` reports 42
× TS2578 ("Unused '@ts-expect-error' directive") — measured, not assumed.

## Numbered flows (DC-2c.1)

`withFlowTypes`, `validateFlows` and `flowIndex` provide authored flow relations
and scenarios. Relation refinements resolve through `relationBaseType` and
`relationSchema`, preserving inherited roles and constraints. See
[the authoring contract and mapping examples](../../docs/DC2C_NUMBERED_FLOWS.md).
