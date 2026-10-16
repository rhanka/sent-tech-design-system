# SPEC EVOL — DS-JSON-RENDER: one JSON in, one design-system component out, in any MCP Apps host (option E)

**Status**: specification and traceability only. No implementation, no package, no workflow in this PR.
**Date**: 2026-10-15. **Owner decisions rendered**: 2026-10-15, relayed by the `design-system` conductor.
**Base measured**: `origin/main` = `30c13318` (DS). Other revisions read: h2a `origin/main` = `61ddcec9`;
bpmn-canvas `origin/main` = `62ec95f` and local, **unpushed** branch `workbench/functions-20261004` = `e9f5f89`;
A2UI repository pinned at commit `3b0e0373`.
**Source dossier** (French, not committed): `DOSSIER-contrat-canvas-vs-a2ui-agui.md`, revised 2026-10-15 after the
muse 1.3 review, sha256 `d476b4fb9fa6f0246ee2322fc150a255fb87e88012321e958de5e0ad3919fdd0`; its source ledger
`sources.md`, sha256 `1ff064b7ae395779d99ad408d4cdcd46476be1b09975d2355b4c7dcc0e285622`. Identifiers `S-…` (internal) and
`E-…` (external) below refer to that ledger. Every load-bearing fact is also restated here with a primary locator
(repository path and line, or a URL pinned to a commit), so this spec can be checked without the ledger.
**Related**: [GD-BPMN-MODDLE (A′), PR #164](https://github.com/rhanka/sent-tech-design-system/pull/164) (open);
[decisions](SPEC_DECISIONS_GRAPH_DATAVIZ_REPATRIATION.md); [M2-CANVAS](SPEC_EVOL_GD_M2_CANVAS.md);
[migration plan](../docs/graph-dataviz-migration-plan.md); [CSP qualification](../docs/a0-csp-dependency-qualification.md).
**Track**: see §19.

Conventions. `DS:` = this repository at `30c13318`. `H2A:` = `git -C /home/antoinefa/src/h2a show 61ddcec9:<path>`.
`BC:` = `git -C /home/antoinefa/src/bpmn-canvas show 62ec95f:<path>`; `BC-WB:` = the same at `e9f5f89`.
`A2UI:` = `https://raw.githubusercontent.com/a2ui-project/a2ui/3b0e0373/<path>`.
`MCPA:` = `https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx`, lines as
downloaded on 2026-10-06 and re-checked on 2026-10-15 (status line unchanged: "Stable (2026-01-26)").
`[JUDGMENT]` marks a design choice of this spec, not a measured fact. `unknown` marks a gap that a lot must measure.

**Expiry of external facts.** A2UI ships roughly every two weeks (`@a2ui/react` 0.12.0 on 2026-09-28, 0.13.0 on
2026-10-09, E-A2-21). Anyone reading this after **2026-11-15** re-checks the A2UI, AG-UI and MCP Apps lines of §3.4
before relying on them.

---

## 1. Decision

### 1.1 Owner choices (2026-10-15)

1. **Option E is validated.** Its parts:
   - **compiled web components** for the DS components, distributed through npm and a CDN (the jsDelivr mirror of
     the npm package);
   - an **MCP server inside h2a** that serves those components as `ui://` resources (MCP Apps) and exposes the
     catalogue;
   - a **skill** that teaches an AI to produce the input JSON;
   - a **catalogue in the A2UI v0.9.1 format** (JSON Schema, `$id` equal to `catalogId`), plus the Sentropic canvas
     **exchange envelope** (`diagram-core` and `diagram-canvas`) for diagram components;
   - **A2UI and AG-UI adapters deferred.**

   Owner goal, verbatim: « que l'IA n'ait qu'à produire les objets de données, et que le layout soit fait par le
   design system et ses moteurs ».
2. **Gemini is not mandatory.** The owner rejects the style Gemini Enterprise imposes. The first targets are our own
   web components in Claude, ChatGPT and any MCP Apps host. Gemini comes later through an A2UI adapter, if third-party
   catalogues become possible there.
3. **Publication.** The elements package is **public**. It includes `diagram-core` and the Focus renderer, which become
   public, **and `bpmn-canvas`**. The owner revises gate D7 for `bpmn-canvas` and bpmn-js. **bpmn.io watermark**: the
   bpmn-js license forbids removing it; the owner will supply a **Camunda license reference**. The watermark is hidden
   only through `bpmn-canvas`'s `watermark: { hidden, license }` option, fed by host configuration. **Never hidden
   without a license**: publishing anything with the watermark hidden is blocked while the reference is missing (§13).
4. **Focus decision-dossier schema** (`DecisionDossierDocument`): **h2a defines it, the DS renders it.** The DS
   consumes a pinned version of the h2a schema. A `focus` skill exposes the whole.
5. **BPMN input** is moddle JSON in the F1 form. F1 **keeps** unknown extensions (content of `extensionElements`,
   foreign attributes, unregistered `xmlns`, `xsi`) instead of refusing them, as bpmn-moddle does. This is an F1 lot on
   the `bpmn-canvas` and d2d-cond side; its status is `unknown` until it is published. A′ (`diagram-core` covering
   bpmn-moddle) is specified in PR #164.
6. Decisions also recorded in Track by this PR (§18): **E** (commitment), **D2 = A**, **D4 = A**, **D7′** (revision of
   D7=A).

The owner's original requests (2026-10-04 and 2026-10-06), verbatim from the dossier:
- « un standard pour permettre de render dans n'importe quelle UI (gemini, claude etc) mes composants de façon simple
  avec un skill et éventuellement une lib js déjà compilée et disponible en CDN […] de façon à ce que chaque composant
  puisse être renderé avec un simple JSON attendu en entrée » ;
- « un MCP disponible au sein de h2a avec le catalog de composants dont le decision dossier focus (qui pourrait être
  accessible directement via le skill focus) » ;
- « la norme canvas de Sentropic [doit gérer] ce type de contrat. bpmn-canvas devrait être un exemple ».

### 1.2 Options as presented (dossier §1 and §4.1)

| id | option | pilot cost (dossier §4.2, [JUDGMENT], GD-M2-MODEL-sized lots) |
|---|---|---|
| 0 | status quo: each component or dossier produces its own HTML | ~0 |
| A | A2UI as exchange format; the DS becomes an A2UI catalogue | 2.6–4.1 (2.9–4.6 with a Gemini Enterprise projection) |
| B | AG-UI for transport and events, plus our own catalogue, rendered in a Sentropic app | 2–3 |
| C | a complete Sentropic standard with A2UI, AG-UI and MCP Apps adapters from day one | 4–6 |
| D | compiled web components on a CDN, a JSON Schema catalogue manifest, an h2a MCP server and a skill | 2.2–3.4 |
| **E** (recommended, **selected**) | D, with the catalogue in the A2UI v0.9.1 format, the canvas exchange envelope, and deferred A2UI/AG-UI adapters behind written triggers | 2.5–3.9 |

### 1.3 Corrections to the brief found while specifying

Each was measured before being written here. None changes the decision; each changes how it is implemented.

| # | brief said | measured | consequence in this spec |
|---|---|---|---|
| C1 | "one JSON Schema document per component, `$id` = `catalogId`" | In A2UI v0.9.1 **the catalogue** is one JSON Schema document whose `components` object holds one schema per component; `$id` and `catalogId` are set on that document. `A2UI:specification/v0_9_1/docs/a2ui_protocol.md:316` ("catalog definitions should include both `$id` … and `catalogId` … set to the same URI"); `A2UI:specification/v0_9_1/catalogs/basic/catalog.json` top-level keys `$schema, $id, title, description, catalogId, components, functions, $defs`, 18 components. | §5.2: one catalogue document (A2UI form, authoritative for A2UI tooling) **and** one standalone schema per component (for MCP `inputSchema` and `get_schema`), both generated from one source, with a test that they agree. |
| C2 | "the spec provides the `watermark: { hidden, license }` option of bpmn-canvas" | The option **already exists** in the published `@sentropic/bpmn-canvas` 0.3.0: `BC:README.md:360-380`, `BC:src/internal/canvas.ts:131-133` (non-blank `license` → `data-bpmn-canvas-watermark="hidden"`; otherwise a `watermark-refused` warning diagnostic and the logo stays). | No `bpmn-canvas` change is needed for the watermark. §13 specifies where the license reference comes from and the gates around it. |
| C3 | `@sentropic/focus` is private (dossier S-FO2) | `H2A:packages/focus/package.json` has no `private` field and declares `"publishConfig": {"access": "public"}`; `npm view @sentropic/focus version` → `0.3.0`, published 2026-06-23T19:14:50Z. Its README still says « This package is **private** » (`H2A:packages/focus/README.md:8`). | The model package is already on npm. The Focus **renderer** (`<st-decision-dossier>`) is new and becomes public in the elements package (§6). The README contradiction is reported to h2a (§17, U-9). |
| C4 | D4 = A is « publication de dataviz-angular maintenant, avec la matrice des absences » | Option A in `spec/graph-dataviz-decisions.json` reads « Tranche M3 identique sur 4 frameworks avant public, dette globale visible »; its recommendation text says « publier la matrice des absences ». `@sentropic/dataviz-angular` 0.5.0 is not `private` in its manifest, is wired into `.github/workflows/dataviz-publish.yml:12-14,159`, and `npm view @sentropic/dataviz-angular` returns E404. | Recorded as A with the owner's wording as a precision that prevails over the option text (§18.2). Flagged for owner confirmation (§17, Q-3). |
| C5 | run "the guards of `verify.yml` on `spec/` and `.track/`" | `.github/workflows/verify.yml` triggers only on `packages/**`, `apps/docs/**`, `scripts/**`, `tools/**`, `docs/graph-dataviz-*`, `package.json`, `package-lock.json`, `.github/workflows/**`, `.ds-scrap/METHOD-fr-top50.md` (push paths from line 13, pull-request
paths from line 27). No guard reads `spec/` or `.track/` (`grep -ln "spec/\|\.track" scripts/*.test.mjs` → empty). | No workflow runs on this PR's paths. The guards were run locally anyway (§19.3). |

---

## 2. Scope

**In**: the input contract of a renderable component; the catalogue format, its generation and its discovery; the
elements package (build, theming, isolation, CSP, weight, lazy engines); its distribution (npm, jsDelivr, SRI); the
h2a MCP surface; the skills; the canvas exchange envelope for diagrams; the two pilots (`bpmn-canvas`, Focus); the
watermark and license rules; lots, gates, acceptance criteria, risks and unknowns.

**Out**: any implementation; a generic diagram renderer (step A of the migration plan: xyflow, elkjs and bpmn-js,
not started, `DS:docs/graph-dataviz-migration-plan.md:141`); the A′ codec (PR #164); the A2UI and AG-UI adapters
(deferred, §12); composing several components into one surface (A2UI's surface model) — one render shows one
component, which may itself be a composition such as the decision dossier; Gemini.

---

## 3. Starting point (measured)

### 3.1 The design system

- Four framework packages: `packages/components-{svelte,react,vue,angular}`. `packages/components-svelte/src/lib`
  holds 224 `.svelte` files (`ls packages/components-svelte/src/lib/*.svelte | wc -l`).
- **No custom element and no UMD/IIFE build** anywhere in the repository:
  `git grep -nIi "customElements.define\|\"umd\"\|iife" 30c13318 -- packages apps tools scripts docs` → no line
  outside two theme `MAPPING.md` files, which only quote upstream `unpkg` URLs (dossier S-DS2, corrected).
- Props mix JSON data and non-JSON values. Example: `DS:packages/components-svelte/src/lib/BarChart.svelte` declares
  `onSelect?: (key: string) => void` (line 91), `onHoverKeyChange` (142), `onSelectKey` (157), closed by
  `}: BarChartProps = $props();` (183). The catalogue therefore carries a **JSON subset** of each component's props
  (§5.1).
- Theming: tokens are CSS custom properties `--st-*` scoped by `[data-st-theme="<id>"]`
  (`DS:packages/themes/src/compile.ts:12,43`); `@sentropic/design-system-themes` 0.11.0 exports
  `./css/{sent-tech,forge,entropic}.css`. A Svelte `ThemeProvider.svelte` exists (context-based).
- Svelte 5.55.7 (root `node_modules/svelte/package.json`) supports the `customElement` compile option and
  `<svelte:options customElement={{ tag, shadow: 'open' | 'none', … }}>`
  (`node_modules/svelte/types/index.d.ts:1037,1247-1249`). In that mode CSS is "always `'injected'`" into the shadow
  root (same file, line 1062).
- Svelte is the DS's reference pilot: « Svelte est le pilote de référence »
  (`DS:docs/graph-dataviz-migration-plan.md:59`).
- A precedent data contract exists: `SiteConfig` (`DS:packages/components-svelte/src/lib/site-config.ts:1-22`):
  frozen `SITE_CONFIG_SCHEMA_VERSION = 1`, additive evolution only, « le shell SIGNALE, l'hôte APPLIQUE ».

### 3.2 The canvas contract

- `@sentropic/diagram-core` 0.1.0 and `@sentropic/diagram-canvas` 0.1.0 are `private: true`
  (`DS:packages/diagram-core/package.json`, `DS:packages/diagram-canvas/package.json`). `diagram-core`: « This package is
  private. `"private": true` is part of its contract for this lot » (`DS:packages/diagram-core/README.md:7-8`), zero
  dependency, no DOM, transactional commands with logical inverses, compare-and-swap, migrations (README lines 3-5,
  84-104, 123-127, 178-179).
- No JSON Schema exists for `SemanticDocument`, `ViewDocument` or `Transaction` (dossier S-DC17).
- `PresentationState.theme` is « A theme id the host resolves. No colour, no token value is stored here. »
  (`DS:packages/diagram-core/src/view.ts:119-124`).

### 3.3 bpmn-canvas and F1

- `@sentropic/bpmn-canvas` 0.3.0 is published (2026-10-03T16:27:47Z). Its public contract is XML (« The BPMN XML is
  authoritative. », `BC:README.md:42`).
- It already ships a CDN build: `dist/browser/bpmn-canvas.min.js` (ESM), `bpmn-canvas.iife.min.js` (global
  `BpmnCanvas`), `sri.json` with sha384 per file, licenses file; « about 768 kB raw, 224 kB gzip, 188 kB brotli » at
  0.2; the `assetBase` option for an inlined bundle « written into an `iframe srcdoc`, as an agent-supplied HTML panel
  does »; `styles: "auto"` installs CSS « once per root node (document or shadow root) » (`BC:README.md:225-270`).
- Watermark option: see C2 (§1.3).
- F1 (moddle JSON): on `BC-WB:` (version 0.4.0, **unpushed**, unpublished) `hydrate(json, cfg)` / `project(model, cfg)`
  with `contractVersion: "1"` (dossier S-BC8). F1 **refuses** today what decision 5 asks it to keep:
  `BC-WB:src/io/moddle-json.ts:151` fails `unsupported-extension` on a qualified attribute or an unregistered `xmlns`;
  lines 161-163 fail `unknown-type` on an unregistered `$type`. PR #164 lists the same gap as alignment items
  F1-A1 (unknown-namespace content) and F1-A2 (`xmlns` declarations).

### 3.4 Hosts and standards (status at 2026-10-15)

- **MCP Apps** (SEP-1865, "Stable (2026-01-26)", `MCPA:9`): `ui://` resources, `mimeType` `text/html;profile=mcp-app`
  (`MCPA:51`); extension id `io.modelcontextprotocol/ui` (`MCPA:40`), optional and negotiated (`MCPA:53`); tool → UI
  link `_meta.ui.resourceUri` and `visibility`, default `["model","app"]` (`MCPA:318-345,397-402`);
  `_meta.ui.csp.{connectDomains,resourceDomains,frameDomains,baseUriDomains}` (`MCPA:243-250`); **default CSP when
  `ui.csp` is omitted**: `default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
  img-src 'self' data:; media-src 'self' data:; connect-src 'none'` (`MCPA:276-285`); hosts may cache resource content
  (`MCPA:392`); `structuredContent` is « Structured data optimized for UI rendering (not added to model context) »
  (`MCPA:1474`); `ui/notifications/tool-input-partial` streams arguments (`MCPA:1120`).
- **Hosts rendering MCP Apps** (dossier §2.1 table): Claude web, Desktop, iOS; ChatGPT; VS Code; goose
  (experimental). **Claude Code does not** (user report, `unverified` on Anthropic's side, E-H-4).
- **Claude Code artifacts**: scripts allowed from cdnjs, unpkg, Tailwind, jQuery and « selected paths on jsDelivr
  such as /npm/ »; « The CSP blocks every external image and all other external scripts, stylesheets, and fonts »;
  rendered page « 16 MiB or smaller » (E-H-5, `claude-code-artifacts.txt:146`). Consequence for BPMN: `bpmn-canvas`
  loads fonts and images as files from `dist/assets/` with no `data:` URI (`BC:README.md:225-228`), so its icons and
  font are expected to be blocked in a Claude Code artifact (`unknown` until measured, §17 U-6).
- **A2UI**: "Early stage public preview", production v0.9.1, v1.0 candidate (E-A2-2). No Svelte or Vue renderer
  (E-A2-20). **Gemini Enterprise renders only its own catalogue** (basic and material), validated and styled by GE
  (E-A2-33, E-A2-28).
- **AG-UI** 1.0 (2026-09-17): « AG-UI is not a generative UI specification » (E-AG-10).

### 3.5 h2a (MCP server, Focus)

- MCP SDK `@modelcontextprotocol/sdk` `^1.30.0` (`H2A:packages/h2a/package.json:54`). Servers use the low-level
  `Server` with `setRequestHandler` and declare `capabilities: { tools: {} }` only
  (`H2A:packages/h2a/src/runtime/mcp-central.ts:779-787`; `H2A:packages/track/src/mcp/server.ts:415-422`). The stdio
  server is hand-rolled and accepts only `initialize`, `tools/list`, `tools/call`
  (`H2A:packages/h2a/src/runtime/mcp/stdio.ts:294-322`).
- **No resource and no `structuredContent`** anywhere:
  `git grep -nI "ui://\|registerResource\|structuredContent" 61ddcec9 -- packages apps` → empty.
- **The Focus model is a TypeScript type, not a versioned schema.** `export interface DecisionDossierDocument` exists
  at `H2A:packages/focus/src/model.ts:155-167` (`ref, subject, title, hash, cursor, sections, interactions,
  provenance, amendmentTrace`), with node families `prose | question | optionSet | outcome | amendmentTrace |
  diagram` (`:107-113`) and `DiagramSyntax = "mermaid" | "plantuml"` (`:30`); a compiled copy is vendored in
  `H2A:packages/track/src/focus-vendor/model.d.ts:129`. **No JSON Schema** exists for it (no `$schema`, zod, typebox
  or schema generator in `packages/focus`). Renderers `renderTerminal`, `renderMd`, `renderHtml`
  (`H2A:packages/focus/src/index.ts:40-43`); `track focus <decision-id> --format terminal|md|html` projects a Track
  decision into that type and renders it (`H2A:packages/track/src/cli/index.ts:1413-1419`). A separate derivation,
  `deriveDecisionDossier` / `DeriveDecisionDossierInput`, lives in `H2A:packages/h2a/src/decision-dossier.ts:50,197`.
  `@sentropic/focus-interactive` 0.1.0 is private. `h2a focus serve` serves a private SvelteKit app (`apps/focus`,
  `@sentropic/focus-app` 0.3.1) that depends on `@sentropic/design-system-svelte ^0.34.40`, not on `@sentropic/focus`.
- **Statement from h2a (h-cond, relayed on 2026-10-15)**, which this spec follows: there is no versioned
  `DecisionDossierDocument` schema; the owner's format rule is a document, not a schema
  (`docs/focus/decision-dossier-format.md`, also on h2a branch `docs/dossier-diagrammes` at `f76f46df`); the schema is
  **to be created on the h2a side from `@sentropic/focus`**, status `unknown` until it is versioned; the DS consumes a
  pinned version. h-cond's wording « il n'existe pas de type `DecisionDossierDocument` » differs from the measurement
  above (the TS interface exists); the two agree that **no versioned schema** exists, which is what this spec depends on.
- **No skill named `focus`** exists (h2a `packages/*/skills`, `~/.claude/skills`, `~/.claude/plugins`); only
  `present-decision` exists (`H2A:packages/track/skills/present-decision/SKILL.md`).
- The `decision-focus*.html` files are self-contained HTML written by agents following the format document, through
  per-repository build chains copied from repository to repository, **not** by a shared h2a generator:
  `kc/docs/kc-decision/decision-focus.html` (1 419 787 bytes, data schema `kc-decision-map/v1`, input = Mermaid blocks
  extracted from a Markdown dossier, `@xyflow/svelte` + `dagre-d3-es`, 12 `--st-*` tokens **redefined locally** in
  `chain/style.css:4`); `airbus-genair-d2d/docs/d2d-decision/decision-focus*.html` (data schema
  `d2d-progress-decision-map/v1`, 7.4–12 MB). Neither carries a `DecisionDossierDocument`; both work without a Claude
  session. They are the **visual reference** for the Focus pilot, not its data contract.

---

## 4. Input contract

### 4.1 Principle

The AI produces **data only**: one JSON document, the **render envelope**. Layout, styling, engines and
interaction belong to the component. The envelope never carries a function, markup, a script, a style or a URL that
the renderer would load.

### 4.2 The render envelope [JUDGMENT]

```jsonc
{
  "catalogId": "https://design-system.sent-tech.ca/catalogs/elements/v1/catalog.json", // optional; default = the renderer's catalogue
  "contract": "1.0",          // component-contract version the producer targets
  "mode": "snapshot",         // "snapshot" (default) | "preview" (reserved, §10.3)
  "root": {                   // exactly one A2UI v0.9.1 component object
    "id": "root",
    "component": "BarChart",  // a key of catalogue.components
    "data": [ { "key": "q1", "label": "Q1", "value": 12 } ],
    "valueLabel": "Revenue (M€)"
  }
}
```

- `root` is an **A2UI v0.9.1 component object** — `id`, `component` and the component's properties as siblings
  (`A2UI:specification/v0_9_1/docs/a2ui_protocol.md`, section "The component object") — with `id` fixed to `"root"`.
  This deviates on purpose from the dossier's §4.4 sketch (`{component, contract, props, mode}`): the A2UI adapter
  (§12) then wraps the same object in `createSurface` + `updateComponents` without reshaping it.
- Data binding (A2UI `DynamicString` paths) is **not** used in v1: every property value is a literal. Child references
  (`ComponentId`, `ChildList`) are not used either: a render shows one component.
- **Host configuration is not part of the envelope.** Theme id, colour scheme, locale, `assetBase` and the BPMN
  watermark license (§13) come from the host through a separate channel (§6.5). A property that only a host may set
  is absent from every catalogue schema, so an AI cannot set it.

### 4.3 Validation

1. **Structure**: the envelope schema, then `catalogue.components[root.component]`, JSON Schema draft 2020-12, with
   `unevaluatedProperties: false` on each component as in the A2UI basic catalogue. Strict refusal is deliberate
   [JUDGMENT]: the producer is an AI that benefits from a correction loop, unlike `SiteConfig`, whose
   ignore-unknown-keys rule serves human-authored forward compatibility.
2. **Semantics**: properties whose validity a JSON Schema cannot express are validated by the owning runtime, which
   stays authoritative: `diagram-core` validation for a `SemanticDocument`, F1 `hydrate` for BPMN, the pinned h2a
   validator for a `DecisionDossierDocument` once h2a ships one.
3. **Size**: the serialized envelope (UTF-8) is at most **1 MiB** [JUDGMENT]; beyond it, `payload-too-large`.

### 4.4 Versioning

- The catalogue **major** is in `catalogId` (`…/v1/catalog.json`). A breaking change creates `v2` beside `v1`.
- Each component carries `x-sentropic.contract` (`"1.0"`, `"1.1"`, …). Within a major, changes are additive only, as
  for `SiteConfig`.
- A renderer accepts an envelope whose `contract` has its major and a minor less than or equal to its own. A higher
  minor is refused with `unsupported-contract` (never rendered partially), so a newer producer facing an older
  renderer gets an explicit error.

### 4.5 Errors

One diagnostic shape everywhere — element, MCP tool result, skill validation step:

```jsonc
{ "code": "schema-violation", "path": "/root/data/3/value", "message": "Expected number", "severity": "error",
  "source": "catalog" }   // "catalog" | "diagram-core" | "bpmn-canvas" | "focus" | "host"
```

- `path` is a JSON Pointer (RFC 6901) into the envelope, as A2UI's `VALIDATION_FAILED` uses (E-A2-15).
- Codes: `unknown-component`, `unsupported-contract`, `schema-violation`, `semantic-invalid` (the owning runtime's own
  code is kept in `detail.code`, for example F1's `unsupported-type` or a `diagram-core` diagnostic code),
  `payload-too-large`, `host-capability-missing`, `engine-load-failed`, and the pass-through warning
  `watermark-refused`.
- An invalid envelope **never** renders a blank surface: the element shows an error panel listing the diagnostics;
  the MCP `render` tool returns `isError: true` with the diagnostics as text, so the model can correct and retry.

### 4.6 Output events

The component emits events; it never mutates the producer's data by itself.

| event | shape | standalone page | MCP Apps |
|---|---|---|---|
| intent | `{ "event": "intent", "name": "select" \| "open" \| "choose-option" \| "comment", "target": "<id>", "context": {} }` | DOM `CustomEvent("st-intent")` | `ui/message` by default; `tools/call` to a named intent tool when the host server declares one (that tool keeps `"app"` in its visibility, `MCPA:401`) |
| proposal (diagrams only) | `{ "event": "proposal", "transaction": { "commandId", "baseRevision", "commands": [] } }` | `CustomEvent("st-proposal")` | `tools/call` to a server tool that applies it with compare-and-swap; the UI never applies it alone |

---

## 5. Catalogue

### 5.1 Single source and generation [JUDGMENT]

- The source is the **TypeScript prop types of the Svelte components** (the reference pilot, §3.1), reduced to their
  JSON subset by a declared contract module per catalogued component in the elements package
  (`src/contracts/<id>.ts`). That module names the Svelte props type and the props it excludes (functions, snippets,
  `children`); the exclusion list is explicit, never inferred.
- A Node/TS generator (no Python) emits the catalogue and the standalone schemas from those modules. A TS-to-JSON-Schema
  tool is needed; the candidate is `ts-json-schema-generator` (MIT), as a **devDependency** of the elements package.
  Its version and license are qualified in L1; it never enters a runtime manifest.
- Semantic documents reuse their owners' types: `SemanticDocument`, `ViewDocument` and `Transaction` from
  `diagram-core` (schemas generated in L8), `DecisionDossierDocument` from the pinned h2a schema (§11.2), F1 as a
  structural envelope (`$type` required) whose real validation is `hydrate` (§4.3).
- **Parity across the four frameworks**: a guard compares, for each catalogued component, the names and JSON types of
  the catalogued props against the public types of the React, Vue and Angular packages. A mismatch fails the guard, or
  is recorded in `x-sentropic.parity` with a reason. The catalogue never claims parity from types alone (the
  migration plan's rule A4-A5, `DS:docs/graph-dataviz-migration-plan.md:59-60`).
- A `--check` mode regenerates in memory and fails on any diff with the committed files (freshness guard, run by
  `scripts/run-script-guards.mjs`).

### 5.2 Format: A2UI v0.9.1

**The catalogue document** (`catalog.json`, authoritative for A2UI tooling):

- `$schema` = `https://json-schema.org/draft/2020-12/schema`; `$id` = `catalogId` =
  `https://design-system.sent-tech.ca/catalogs/elements/v1/catalog.json` [JUDGMENT: the docs site's domain, so the id
  can also resolve once published; A2UI does not require it to resolve, `a2ui_protocol.md:314`].
- `components`: one entry per component, keyed by its A2UI name (`BarChart`, `BpmnCanvas`, `DecisionDossier`), in
  the basic catalogue's form: `allOf` the A2UI `ComponentCommon` reference and a local object with
  `component: { "const": "<Name>" }`, the props and `required`; `unevaluatedProperties: false`.
- `functions`: `{}` (none in v1). `$defs`: `anyComponent` (`oneOf` over the components) and `theme`
  (`{ "themeId": string }`).
- Sentropic extension, per component, under `x-sentropic` (JSON Schema 2020-12 treats an unknown keyword as an
  annotation): `{ "contract", "element": "st-bar-chart", "engine": "core" | "lazy:<chunk>", "events": [...],
  "fallback": "text" | "svg", "parity": {...}, "schema": "<standalone schema $id>", "example": {...} }`.
- Whether A2UI SDKs accept a catalogue with `x-` keywords and an empty `functions` is `unknown` (no meta-schema exists
  for v0.9.x: `specification/v0_9{,_1}/json/catalog_definition.json` → HTTP 404 at `3b0e0373`, E-A2-32). L1 tests it
  with `@a2ui/web_core` at an exact version.

**Standalone component schemas** (`schemas/<id>.v1.json`): the envelope schema specialised to one component, with
`$id` = `https://design-system.sent-tech.ca/catalogs/elements/v1/components/<id>.json`. A test asserts that the
component part of each standalone schema is equivalent, after canonical sorting, to `catalog.json#/components/<Name>`.

### 5.3 Discovery

| channel | what | when |
|---|---|---|
| npm | `@sentropic/design-system-elements/catalog.json` and `/schemas/*` (package `exports`) | after L7 |
| jsDelivr | `https://cdn.jsdelivr.net/npm/@sentropic/design-system-elements@<exact>/catalog.json` | after L7 |
| MCP | tools `list_components`, `get_schema` (§8) | from L3 (inline, before any publication) |
| MCP resource | `a2ui://sentropic/catalog/v1`, MIME `application/schema+json` [JUDGMENT], for A2UI-over-MCP clients (E-A2-24) | L3, optional |
| skill | component list and examples generated from the catalogue (§9) | L4 |

### 5.4 Initial content

Three entries, chosen by the dossier to cover the three kinds: `BarChart` (plain data), `BpmnCanvas` (third-party
engine, F1 input), `DecisionDossier` (composition, Focus). The catalogue grows component by component afterwards;
each addition is a lot item with its own parity check.

---

## 6. Elements package

### 6.1 Name and tags [JUDGMENT]

`@sentropic/design-system-elements`, beside `@sentropic/design-system-{svelte,react,vue,angular}`. Tags use the
existing `st-` class prefix: `<st-bar-chart>`, `<st-bpmn-canvas>`, `<st-decision-dossier>`.

### 6.2 Build: thin Svelte custom-element wrappers [JUDGMENT]

- Each element is a **thin wrapper** compiled with Svelte's `customElement` option. It imports the existing component
  from `@sentropic/design-system-svelte` (or the engine package), validates the envelope (§4.3), maps catalogue
  properties to component props, and turns callbacks into events (§4.6). No component is reimplemented.
- **Why not Lit as the default**: Lit would mean rewriting every catalogued component, a genuine fifth implementation,
  which is the first failure the dossier's pre-mortem names. Lit stays the **named fallback**, with the dossier's
  threshold: L2 measures the Svelte route on the three pilot elements; if one of the three loses a function that cannot
  be worked around (snippets or slots, `ThemeProvider` context, transitions), the route switches to Lit for the
  affected elements, and the switch is recorded in Track.
- **Known risk to measure first**: `@sveltejs/vite-plugin-svelte` 7.1.2 defaults to `emitCss: true` (« Emit Svelte
  styles as virtual CSS files », `node_modules/@sveltejs/vite-plugin-svelte/src/public.d.ts:32-37`). For child
  components compiled outside custom-element mode, that CSS would land in a document-level file, not in the
  element's shadow root [JUDGMENT, to confirm in L2]. L2 compiles every component that enters the bundle with
  `css: 'injected'` and asserts that each element's computed styles match the framework component's on the same
  input.
- **json-render comparison** (dossier §2.4, "other standards"): L2 also renders `BarChart` with
  `@json-render/svelte` and records runtime size, schema form and catalogue mapping, before the wrapper route is
  frozen. json-render is not adopted as the base (0.x, Labs status, its own spec format, a Zod catalogue that would
  duplicate the TS types).

### 6.3 Theme and tokens

- CSS custom properties inherit across the shadow boundary, so `--st-*` tokens set on an ancestor reach the element.
  The element also sets `data-st-theme="<id>"` on its internal root and adopts the theme stylesheet in its shadow root,
  so a page with no DS stylesheet still renders branded.
- The theme id comes from host configuration (§6.5), never from the envelope — the same rule as `PresentationState.theme`
  (§3.2).
- MCP Apps hosts supply `light`/`dark` and CSS variables (`MCPA:544-549`). L3 writes a mapping table from those
  variables to `--st-*` tokens; the mapping never overrides brand tokens, only the colour scheme.

### 6.4 Isolation and CSP

- **Shadow DOM `open`** by default: isolation from the host page's CSS on artifact pages, standalone files and
  third-party pages. Inside an MCP Apps iframe the document is already ours; shadow DOM costs nothing there.
- Target environments and expectations:

| environment | CSP | expectation | status |
|---|---|---|---|
| MCP Apps resource, bundle inlined | default `MCPA:276-285` (`'unsafe-inline'` scripts and styles, no external origin) | works with no `ui.csp` declaration | to measure (L3) |
| MCP Apps resource, engines from jsDelivr | `_meta.ui.csp.resourceDomains: ["https://cdn.jsdelivr.net"]` | lazy chunks load with SRI | after L7 |
| strict page (no `'unsafe-inline'`) | `script-src <cdn>; style-src <cdn> 'nonce-…'` | Svelte's injected `<style>` is blocked; fallback: build-time CSS in a `.css` file adopted through constructable stylesheets, or a nonce | `unknown` (L2) |
| Claude Code artifact | jsDelivr `/npm/` scripts allowed; external fonts, stylesheets and images blocked (E-H-5) | scripts load; DS fonts and `bpmn-canvas` assets do not | `unknown` (L2, L5) |

- No `eval` and no `new Function` in the bundle: L2 adds a guard that scans the built chunks.
- Rich text (Markdown in prose nodes) is sanitized by the element before insertion, never injected as raw HTML.

### 6.5 Host configuration channel

The host sets `element.hostConfig` (a JS property, not an attribute) or provides
`<script type="application/json" id="st-host-config">` in the page:

```jsonc
{ "theme": "sent-tech", "colorScheme": "light", "locale": "fr",
  "assetBase": "https://cdn.jsdelivr.net/npm/@sentropic/bpmn-canvas@0.x.y/dist/assets/",
  "bpmn": { "watermark": { "hidden": true, "license": "<reference supplied by the owner>" } } }
```

Only the host writes it: the MCP server when it builds the resource HTML, the page author on a standalone page. The
skill's artifact template never writes `bpmn.watermark` (§9).

### 6.6 Weight and lazy engines

- Budgets [JUDGMENT], measured in L2 and reported in `dist/browser/sri.json` with raw, gzip and brotli sizes, as
  `bpmn-canvas` does: core runtime plus `BarChart` ≤ **150 kB gzip**; each engine is its own chunk.
- Lazy loading: in the ESM build, an element registers immediately and `import()`s its engine chunk on first
  connection (`bpmn-canvas`, later diagram engines). In the inlined MCP mode, `import()` of a sibling file is not
  available, so the MCP server assembles the resource with the chunks of the requested component only (§8.3).
- Reference weights: `bpmn-canvas` ≈ 224 kB gzip at 0.2 (§3.3); bpmn-js Viewer 200 966 B and Modeler 375 295 B
  (`DS:docs/a0-csp-dependency-qualification.md:81`); elkjs chunk 1 433 439 B, 443 kB gzip (same file, line 61). The
  full React IIFE outside the repository (209 components) weighs about 1 MB (dossier S-DS5).

### 6.7 Content and licensing

- Public package containing the wrappers, the catalogue, the schemas, and as runtime dependencies at exact
  versions: `@sentropic/design-system-svelte`, `@sentropic/design-system-themes`, `@sentropic/bpmn-canvas` (lazy
  chunk), `@sentropic/diagram-core` (public from L7, §18.4), and the Focus renderer.
- `npm run licensing:check` applies as soon as the manifest is not `private`: `license`, `LICENSE`,
  `LICENSE.THIRD-PARTY.md` (which then includes the bpmn-js license with its watermark clause) and their presence in
  the tarball (`DS:scripts/verify-publishable-licensing.mjs:10-24`).

---

## 7. Distribution

- **npm**: `@sentropic/design-system-elements`, published by a new `elements-publish.yml` workflow on tags
  `elements-v*`, through npm Trusted Publishing (OIDC), on the model of `dataviz-publish.yml`. First publication of a
  new name follows the bootstrap path documented in `docs/release.md`.
- **jsDelivr**: no separate upload; jsDelivr serves the npm package files as published, as for `bpmn-canvas`
  (`BC:README.md:229-232`). Generated snippets always pin an **exact** version, never a range or `latest`.
- **SRI**: `dist/browser/sri.json` gives, per browser file, its size and `integrity` (sha384). A test recomputes the
  hashes from `npm pack` output and fails on a mismatch. Documentation snippets carry `integrity` and
  `crossorigin="anonymous"`.
- **Formats**: ESM (`dist/elements.js` plus chunks) and one self-contained IIFE per element
  (`dist/browser/<id>.iife.min.js`) for script-tag pages and inlining; fonts and images stay files resolved through
  `assetBase`, never `data:` URIs (the `bpmn-canvas` rule).

---

## 8. MCP server in h2a

Cross-repository. This section is the **contract the h2a MCP server must meet**; it does not choose the h2a package
or server that carries it. Today no h2a MCP server serves a `ui://` resource and no package is designated to carry
one (§3.5; h-cond, 2026-10-15): **carrier `unknown`**, decided by the owner on the h2a side (H-4). The DS supplies the
elements package (bundled from the lockfile before publication, from npm after) and the catalogue.

### 8.1 Capability

The server advertises the `io.modelcontextprotocol/ui` extension (`MCPA:40,53`) and answers `resources/list` and
`resources/read`. None of the existing h2a servers does today: they declare `capabilities: { tools: {} }` only, and the
stdio one accepts only `initialize`, `tools/list` and `tools/call` (§3.5). When a client does not negotiate the
extension, every tool still answers with a text (and, where cheap, SVG image) fallback in `content`.

### 8.2 Tools

All three keep the default visibility, written explicitly as `["model","app"]` (`MCPA:318-330`).

| tool | input | result |
|---|---|---|
| `list_components` | `{}` | `content`: one line per component (name, summary, contract). `structuredContent`: `{ catalogId, components: [{ name, element, contract, engine, summary }] }`. |
| `get_schema` | `{ "component": "<Name>" }` | `content`: **the schema and one example as text** — the model must read them, and `structuredContent` is not added to model context (`MCPA:1474`). `structuredContent`: `{ catalogId, schema, example }`. |
| `render` | `inputSchema` = the envelope schema (`anyComponent` for `root`) | `_meta.ui.resourceUri: "ui://sentropic/render/v1"`. `content`: a text summary (component, counts, validation result). `structuredContent`: `{ envelope, diagnostics }`. `isError: true` when validation fails (§4.5). |

### 8.3 Resource

- `ui://sentropic/render/v1`, `text/html;profile=mcp-app`. The HTML is built by the server from the pinned elements
  package: the core runtime, the elements, and host configuration (§6.5). The app reads the envelope from
  `ui/notifications/tool-input`, renders, then refines with `ui/notifications/tool-result` (validated envelope and
  diagnostics). `tool-input-partial` is ignored until `mode: "preview"` exists (§10.3).
- **Pilot mode (before publication)**: everything inlined, no `ui.csp` declaration, default CSP. Size budget for the
  resource: **≤ 2 MiB** raw [JUDGMENT]; the real host limit is `unknown` (§17 U-1). If the measured resource exceeds a
  host's limit, the fallback is one resource per component (`ui://sentropic/<id>/v1`) linked from per-component tools.
- **Published mode**: core inlined, engines loaded from jsDelivr with SRI, declared in
  `_meta.ui.csp.resourceDomains: ["https://cdn.jsdelivr.net"]`.
- Security: the executed code is the pinned DS bundle; the AI supplies only data. This is MCP Apps' equivalent of
  A2UI's "catalog of trusted, pre-approved UI components" (E-A2-3).

### 8.4 Size bounds

Envelope ≤ 1 MiB (§4.3), resource ≤ 2 MiB in pilot mode (§8.3). Both bounds are written in the server and covered by a
test with an oversize input.

---

## 9. Skills

- **`sentropic-render`**: source in the elements package (`skill/SKILL.md`, shipped in the tarball so it versions with
  the catalogue), vendored at a pinned version by the h2a plugin. Its component list, schema links and examples are
  generated from the catalogue; the rest is hand-written. It teaches:
  1. produce only the envelope; read `get_schema` first when the MCP server is available;
  2. route by host: MCP `render` when the tool exists; otherwise an artifact or standalone page from the skill's fixed
     template (exact jsDelivr version, SRI, the envelope in a `<script type="application/json">` data island);
     otherwise a text answer;
  3. on `isError`, fix each diagnostic at its `path` and retry, at most twice;
  4. never write component code, never add markup or style beyond the template, never set host configuration
     (theme, watermark).
- **`focus`** (to create; it does not exist, §3.5). It wraps `sentropic-render` for `DecisionDossier`, explains how
  to obtain a `DecisionDossierDocument` from a Track decision (`track focus`, §3.5), and how to render it in a host or
  as a standalone file without a Claude session (`H2A:docs/focus/decision-dossier-format.md:3-5`). **Carrier
  `unknown`**: proposed h2a [JUDGMENT], because h2a owns the schema (decision 4), `track focus` and
  `present-decision`; the DS supplies `sentropic-render` and the element. Open as H-3.
- Measurable skill check (L4) [JUDGMENT]: on 10 fixed prompts per pilot component, at least 8 produce a valid envelope
  on the first attempt and 10 after the correction loop; the prompts and results are committed.

---

## 10. Canvas exchange envelope for diagrams

### 10.1 What is added, what does not change

- For diagram components (`DiagramCanvas`, later), `root` carries `document` (`SemanticDocument`, validated by its
  profile, D1=A) and optionally `view` (`ViewDocument`; absent means the engine lays out). The theme stays a host id.
- Unchanged in `diagram-core`: transactions, inverses, compare-and-swap, migrations, zero dependency. The exchange
  pieces (generated JSON Schemas, envelope helpers) live in a separate subpath or package [JUDGMENT], so
  `diagram-core`'s zero-dependency guard holds.
- Generated JSON Schemas for `SemanticDocument`, `ViewDocument` and `Transaction`; runtime validation stays the
  authority.

### 10.2 BPMN

For `BpmnCanvas`, `root.document` is the **F1 moddle JSON** tree (`bpmn:Definitions`). XML appears only at the edges
(owner rule relayed by d2d-cond: « un seul modèle JSON moddle de bout en bout, XML seulement en sortie »). Conversion
to `diagram-core` is A′ (PR #164) and is not needed for rendering.

### 10.3 Streaming preview

`mode: "preview"` is reserved: a non-validating, ephemeral render of a partial document during argument streaming
(the study's « aperçu éphémère », dossier S-SP4). It is not implemented by any lot of this spec; until it is, a
`preview` envelope is refused with `unsupported-contract`.

### 10.4 Mapping to external protocols (for the deferred adapters)

A transaction maps to a JSON Patch (AG-UI `STATE_DELTA`) or an A2UI `updateDataModel` **with loss** (no inverse, no
compare-and-swap); the mapping declares that loss. An external delta is converted into a transaction and **refused**
on conflict, never merged (dossier §2.4, lines 4, 6, 7).

---

## 11. Pilots

### 11.1 P-BPMN: `<st-bpmn-canvas>`

Wraps `@sentropic/bpmn-canvas` at an exact version; input F1 (`hydrate`, then render); no XML input in the contract.

Preconditions (external, status `unknown`): a published `bpmn-canvas` that exports F1, and the F1 lot that keeps
unknown extensions (decision 5).

Criteria:
1. One F1 JSON file renders identically (same element count, screenshot diff below 0.1 % of pixels) in Claude
   Desktop through `render`, in a second MCP Apps host (ChatGPT or VS Code), and in a standalone HTML file.
2. Without host license configuration the bpmn.io logo is visible (`.bjs-powered-by` present, opacity 1, not
   overlapped); a `hidden: true` request without a license yields `watermark-refused` in the diagnostics.
3. With host configuration carrying a non-blank license, the logo is hidden and no `watermark-refused` appears; the
   envelope cannot produce either state (a test sends `watermark` inside `root` and gets `schema-violation`).
4. An F1 document with an `acme:` extension element, a foreign attribute and an unregistered `xmlns` renders, and the
   F1 tree read back from the element equals the input (after F1's canonical ordering).
5. A page that renders no BPMN never requests the `bpmn-canvas` chunk (network log).
6. Zero CSP violations under the MCP Apps default CSP; keyboard focus reaches the canvas; axe reports no violation of
   impact `serious` or `critical`.

### 11.2 P-FOCUS: `<st-decision-dossier>`

Renders a `DecisionDossierDocument` against the **h2a schema pinned by version** (decision 4).

Preconditions (h2a, status `unknown`): h2a **creates** a JSON Schema for `DecisionDossierDocument` from
`@sentropic/focus` and publishes it inside a versioned artefact (proposal [JUDGMENT]:
`@sentropic/focus/schema/decision-dossier.v1.json` in a new `@sentropic/focus` release), with a validator; the DS
pins that exact version and records the schema's sha256. Until then the catalogue entry `DecisionDossier` carries
`x-sentropic.status: "unknown"` and L6 cannot start.

Criteria:
1. A dossier produced by `track focus <id>` from this repository's Track renders in Claude Desktop, in a second MCP
   Apps host and as a standalone file opened without network access beyond the pinned CDN.
2. Content parity with h2a's `renderHtml` on the same document: same sections in the same order, same option ids and
   titles, same outcome (text comparison of the rendered DOM).
3. No hard-coded colour: every colour resolves to a `--st-*` token (a test scans computed styles against the token set),
   unlike the copied chain (§3.5).
4. Clicking an option emits `intent` `choose-option` with the option id; in MCP Apps it reaches the host as
   `ui/message` (the h2a `/api/decisions/inject` route is wired in a later h2a item).
5. `diagram` nodes render as the fenced fallback (as `@sentropic/focus` does today) until a diagram renderer exists
   (L8).
6. The four repositories that copy the chain (radar-immobilier, genair-cutter, d2d, kc) are not migrated
   retroactively; new dossiers use the element.

### 11.3 P-DATA: `<st-bar-chart>`

The plain-data control case and the json-render comparison point (§6.2). Criteria: same rendered SVG as the Svelte
component on five fixtures (attribute-level diff, ignoring generated ids); `select` intent emitted on click and on
keyboard activation.

---

## 12. Deferred adapters and their triggers

| adapter | does | trigger (any one) | review |
|---|---|---|---|
| A2UI | wraps `root` in `createSurface` + `updateComponents`; for Gemini Enterprise, projects onto the `basic` or `material` catalogue (DS brand lost by construction, E-A2-33) | the owner confirms a Gemini need; **or** Gemini Enterprise accepts third-party catalogues; **or** A2UI v1.0 is stable **and** Claude or ChatGPT renders A2UI natively | at each Track report, and no later than 2026-11-15 |
| AG-UI | streams agent ↔ UI state for Focus web or the Sentropic workspace (`STATE_SNAPSHOT`, `STATE_DELTA`, mapping of §10.4) | Focus web or the workspace needs streamed agent ↔ UI state | at each Track report |

---

## 13. Watermark and license

### 13.1 Facts

- bpmn-js 18.30.1 license (`/home/antoinefa/src/bpmn-canvas/node_modules/bpmn-js/LICENSE:13-16`): « The source code
  responsible for displaying the bpmn.io project watermark that links back to https://bpmn.io as part of rendered
  diagrams MUST NOT be removed or changed. When this software is being used in a website or application, the
  watermark must stay fully visible and not visually overlapped by other elements. »
- `bpmn-canvas` keeps the logo visible by default and hides it only on `watermark: { hidden: true, license }` with a
  non-blank `license`; « whether hiding the logo is allowed is the host's responsibility » (`BC:README.md:360-380`).
- Measured in place (bpmn-js 18.28.0): `.bjs-powered-by`, 53 × 23 px, 15 px from the bottom-right corner; the DS
  qualification requires a 100 × 48 px exclusion zone in that corner and forbids hiding through `opacity`,
  `visibility`, `clip-path` or transparent overlap (`DS:docs/a0-csp-dependency-qualification.md:66-81`).
- Open owner point from the same file (lines 83-87): the logo is a DOM sibling of the SVG, so an SVG, PDF or PNG export
  carries no logo.

### 13.2 Rules

- **W1** Visible by default, for every consumer, in every element and every published artefact.
- **W2** The AI cannot affect it: `watermark` appears in no catalogue schema; P-BPMN criterion 3 tests it.
- **W3** Host configuration only (§6.5). For the h2a MCP server, the reference is read from the server's runtime
  environment, variable **`SENTROPIC_BPMN_WATERMARK_LICENSE`** [JUDGMENT on the name], set in the deployment's
  `.env` (git-ignored) and **documented by name** in h2a's MCP documentation, with its rotation owner. Absent or blank:
  the server passes no watermark option.
- **W4** No license value is committed in any repository. L2 and L3 each add a guard that fails when a tracked file
  sets `hidden: true` together with a literal non-placeholder `license` string (allowed placeholders:
  `"<your license reference>"`, `"<reference supplied by the owner>"`).
- **W5** Publication gate: no published artefact (npm tarball defaults, docs-site page, demo, CDN example, MCP default
  configuration) hides the logo until the owner has supplied the Camunda reference. When supplied, Track records the
  fact, the date and where the value is held (W3) — never the value.
- **W6** No exporter: the elements offer no SVG/PDF/PNG export of a bpmn-js rendering until the owner rules on the
  open point of §13.1.
- **W7** The exclusion zone of §13.1 applies to every DS chrome placed over `<st-bpmn-canvas>` (toolbar, zoom
  controls, error panel).

---

## 14. Lots, dependencies and gates

| lot | repository | content | depends on | gate |
|---|---|---|---|---|
| **L0** | DS | this spec, Track records (§19) | — | **G0**: PR reviewed and merged |
| **L1** | DS | catalogue and schema generator (§5), envelope validator and diagnostics (§4), freshness guard, A2UI SDK acceptance test | L0 | **G1**: AC-L1 |
| **L2** | DS | elements package, `private: true`: three wrappers, theme, shadow DOM, CSP and size measurements, `sri.json`, Svelte-vs-Lit threshold, json-render comparison, W4 guard | L1 | **G2**: AC-L2; the Svelte/Lit outcome recorded in Track |
| **L3** | h2a (carrier `unknown`, H-4) | MCP extension negotiation, `resources/*`, three tools, `ui://sentropic/render/v1` inlined, fallbacks, size bounds, W3/W4 | L2 | **G3**: AC-L3 |
| **L4** | DS + h2a | skills `sentropic-render` (DS) and `focus` (carrier `unknown`, H-3), skill check | L3 | **G4**: AC-L4 |
| **L5** | DS (+ bpmn-canvas, d2d-cond) | pilot P-BPMN | L3; external: F1 published with unknown-extension retention | **G5**: §11.1 criteria |
| **L6** | DS (+ h2a) | pilot P-FOCUS | L3; external: h2a schema and validator published | **G6**: §11.2 criteria |
| **L7** | DS | publication: `elements-publish.yml`, `diagram-core` made public, first `npm publish`, jsDelivr and SRI check, W5 | L5, L6 | **G7**: AC-L7. **Point of no return** |
| **L8** | DS | canvas exchange: generated `diagram-core` schemas, `DiagramCanvas` element, proposal events | L2; external: a generic diagram renderer (migration plan step A) | **G8**: AC-L8 |

The adapters of §12 are not lots until a trigger fires.

## 15. Acceptance criteria

- **AC-L1**: `node <generator> --check` exits 0 inside `scripts/run-script-guards.mjs`; `catalog.json` has `$id` equal
  to `catalogId` and three components; each standalone schema agrees with its catalogue entry (test); each component's
  `example` validates and a mutated example fails with the expected `path` (`DecisionDossier` is exempt while its h2a
  schema is `unknown`: its `document` property is then `{ "type": "object" }` and the entry carries
  `x-sentropic.status: "unknown"`); the A2UI SDK test (`@a2ui/web_core`, exact
  version) loads the catalogue, or its refusal is recorded with the SDK's message; the four-framework parity guard
  passes or records each mismatch in `x-sentropic.parity`.
- **AC-L2**: for each of the three elements, one envelope renders in Chromium with zero console errors and zero CSP
  violations under the MCP Apps default CSP; computed styles of the element equal the Svelte component's on the same
  input for the checked properties; `sri.json` hashes match `npm pack` output; sizes are reported and the core budget
  (≤ 150 kB gzip) holds or is re-decided in Track; the strict-CSP and Claude Code artifact rows of §6.4 have a measured
  status; the no-`eval` and W4 guards run in `scripts/run-script-guards.mjs`.
- **AC-L3**: **one envelope file renders the same component in Claude Desktop and in a second MCP Apps host**
  (ChatGPT or VS Code), with screenshots committed; in a client that does not negotiate the extension, `render`
  returns the text fallback; an oversize envelope returns `payload-too-large`; the resource size is measured against
  the 2 MiB budget; `get_schema`'s `content` carries the schema text.
- **AC-L4**: the skill check of §9 meets its thresholds; the skill never writes `watermark` (grep of the produced
  outputs).
- **AC-L5** and **AC-L6**: the criteria of §11.1 and §11.2. The P-DATA criteria (§11.3) are part of AC-L2.
- **AC-L7**: `npm run licensing:check` passes with the elements package and `diagram-core` publishable; the published
  tarball's `sri.json` matches jsDelivr's served bytes for every browser file; the docs page snippet loads from
  jsDelivr with `integrity`; no published artefact hides the watermark unless W5 is satisfied; D7′ is recorded (§18.4).
- **AC-L8**: generated schemas for `SemanticDocument`, `ViewDocument` and `Transaction` agree with `diagram-core`'s
  runtime validation on every existing fixture (accepted by both, or refused by both); a proposal event is never
  applied without the host's compare-and-swap.

## 16. Risks (dossier pre-mortem) and mitigations

| risk | mitigation in this spec |
|---|---|
| the elements drift from the four frameworks: a fifth source of bugs | thin wrappers over the Svelte components (§6.2), parity guard (§5.1), style equality test (AC-L2) |
| Svelte → custom element loses snippets, context or transitions, and the Lit fallback is triggered too late | threshold measured on three elements in L2, outcome recorded at G2 |
| the bundle weighs megabytes and exceeds an unknown `ui://` limit | budgets (§6.6, §8.3), per-component resource fallback, measurement in L3 |
| Claude Code still does not render MCP Apps | artifact route through the skill template; text fallback (§8.1) |
| Gemini stays uncovered because the A2UI trigger is never fired | dated review of §12 at each Track report, deadline 2026-11-15 |
| hand-written schemas drift from the TS types | schemas generated, freshness guard (§5.1) |
| the elements package is never published | publication is decided (§1.1, decision 3); L7 is a lot with its own gate |
| the watermark is hidden without a license | W1–W7 (§13.2) |
| the F1 or h2a preconditions never land | L5 and L6 are blocked explicitly; L2–L4 still deliver `BarChart` end to end |

## 17. Unknowns and open questions

Unknowns (each measured by the named lot):

| id | unknown | lot |
|---|---|---|
| U-1 | maximum size of a `ui://` resource in Claude and ChatGPT | L3 |
| U-2 | whether A2UI SDKs accept `x-` keywords and an empty `functions` in a v0.9.1 catalogue | L1 |
| U-3 | elements bundle size | L2 |
| U-4 | styles of Svelte custom elements under a strict CSP | L2 |
| U-5 | MCP Apps support in Claude Code | L3 (observation only) |
| U-6 | `bpmn-canvas` fonts and images inside a Claude Code artifact | L5 |
| U-7 | publication date of an F1 that keeps unknown extensions | external (bpmn-canvas, d2d-cond) |
| U-8 | creation, versioning and publication of h2a's `DecisionDossierDocument` JSON Schema | external (h2a) |
| U-10 | the h2a package or server that carries the MCP contract of §8 | external (h2a, owner) |
| U-11 | the carrier of the `focus` skill | external (h2a, owner) |
| U-9 | `@sentropic/focus` status: README « private » versus manifest public and npm 0.3.0 | external (h2a) |

Questions for the owner:
- **Q-1** Is the Camunda license reference confidential? If it is, it cannot reach the browser through `hostConfig`
  (it would be visible in the page), and the hiding decision must be made server-side with only a non-identifying
  marker passed to `bpmn-canvas`, which needs an explicit owner rule.
- **Q-2** Confirm the catalogue id domain `design-system.sent-tech.ca` and the package name
  `@sentropic/design-system-elements`.
- **Q-3** D4 = A: confirm that « publication maintenant » replaces the option's precondition « tranche M3 identique sur
  4 frameworks avant public » (§18.2).
- **Q-4** Exports of bpmn-js renderings (W6): reincorporate the attribution in exports, or no bpmn-js exporter.

Questions for h2a:
- **H-1** Where and in which artefact the `DecisionDossierDocument` JSON Schema and its validator are published, and
  their versioning rule.
- **H-2** The owner of `SENTROPIC_BPMN_WATERMARK_LICENSE` in the MCP deployment, and its rotation cycle.
- **H-3** Who carries the `focus` skill (proposed: h2a), and where.
- **H-4** Which h2a package or server carries the MCP contract of §8 (owner decision on the h2a side).

## 18. Other decisions recorded by this PR

### 18.1 D2 = A — releases and npm publication

Option A of `spec/graph-dataviz-decisions.json` D2: « graph indépendant ; dataviz lockstep ; DS garde ses familles ».
It matches what `.github/workflows/dataviz-publish.yml:3-5` already does (five `@sentropic/dataviz-*` packages in
lockstep on their own version line, independent of `@sentropic/graph`).

### 18.2 D4 = A — dataviz-angular publication threshold

Option A of D4, with the owner's precision as relayed: « publication de dataviz-angular maintenant, avec la matrice des
absences ». Measured context: `@sentropic/dataviz-angular` exports 76 components against about 118 for Svelte, React
and Vue (`DS:docs/dataviz-docs-parity.md:33,42`); never published (E404); first publication goes through the bootstrap
token path (`.github/workflows/dataviz-publish.yml:12-14`). See C4 and Q-3.

### 18.3 Why new Track records for D2 and D4

`plan/replay-graph-dataviz-track.mjs` created the pending records `01M2KK5XPJCP07FDBQBX16TV08` (D2) and
`01M2KK5XS2SXGMSSQPAVCF2XJ4` (D4) from `spec/graph-dataviz-decisions.json`. `docs/graph-dataviz-verify.mjs:60-63`
asserts that every record of `docs/graph-dataviz-track-sync.json` `decisions` is `pending` with no selected option, and
the replay refuses to revise a settled record (`plan/replay-graph-dataviz-track.mjs:131-132`). Selecting an option on
those records would break both. The owner's choices are therefore recorded as **new** decision records, as was done
for D1 and D3 on 2026-09-24 (`.track/events.jsonl:1559-1568`) and as PR #164 does for its `rendered` notes. The
compared fields of `spec/graph-dataviz-decisions.json` (`context`, `options`, `recommendation`) are unchanged; only
`status` and a `rendered` object are added. On `origin/main`, `node docs/graph-dataviz-verify.mjs` already fails at
line 58 (`Unexpected source adaptation packages/dataviz-angular/package.json`), before reaching line 62; it is run by
no workflow.

### 18.4 D7′ — third-party runtimes in published DS manifests (revision of D7=A)

D7=A: « nouveau runtime tiers seulement après décision owner explicite »
(`DS:docs/a0-csp-dependency-qualification.md:469`). Revised by the owner on 2026-10-15:
- **elkjs and xyflow are allowed in published DS manifests.** The qualification conditions of
  `docs/a0-csp-dependency-qualification.md` §2 keep applying (elkjs: exact pin, dedicated adapter package, lazy
  `import()`, never in a DS component barrel nor in `@sentropic/dataviz-*`, no fork).
- **bpmn-js is allowed through `bpmn-canvas`** inside the elements package, its watermark governed by §13.
- This supersedes, for future lots, the migration plan's « Aucun des lots ci-dessus n'introduit `@xyflow/svelte`,
  `bpmn-js` ni `diagram-js` » (`DS:docs/graph-dataviz-migration-plan.md:141`) as a gate; that plan is not edited by
  this PR.

## 19. Traceability

### 19.1 Track

Track workspace `streams`, written with the `track` CLI 0.98.0 from this branch, from the worktree root. The CLI
derives the actor from `git config user.email` (`human:<email>`); the owner decisions were relayed by the
`design-system` conductor, which each decision's context states. `track validate` → `OK: 1657 events, integrity +
desync clean` (1604 on `origin/main`, 53 appended). No acceptance run, no waiver and no comprehension record was
created.

| object | Track id |
|---|---|
| feature DS-JSON-RENDER (parent: stream S6 · Moteur, Outillage & Release `01KW860ATXPNDVSCVHT92KB6P2`) | `01M519DQZ9HERKFR70BGDVNWWN` |
| L0 — spec and traceability (in progress) | `01M519E5NPW4C4GZ5EN31YVB2X` |
| L1 — catalogue and schema generator | `01M519E5VX34GQ7BBFBPYRR328` |
| L2 — elements package and measurements | `01M519E62VZ92KY3TV4KQTFFST` |
| L3 — MCP Apps contract on the h2a side | `01M519E690VYDW2FRCYAE65DDT` |
| L4 — skills | `01M519E6F1SEQSBVHJJTRCD96G` |
| L5 — pilot bpmn-canvas | `01M519E6MZYCPK2M8SDQJVFT5P` |
| L6 — pilot Focus | `01M519E6V8PQ27Y5T3YYAAK4FN` |
| L7 — publication | `01M519E73CVRPKZGGBBEAN9B00` |
| L8 — canvas exchange envelope | `01M519E7AFC8CJVEHZWTCGFPE7` |
| decision **E** (commitment) — options `0`, `A`, `B`, `C`, `D`, `E`; recommendation `E`; selected `E`, outcome `go`; artifact `rendered-view` → this spec, source dossier sha256 `d476b4fb…fdd0` | `01M519FQDB50MVE6HQ62RJ2T1J` |
| decision **D2** (orientation) — options `A`, `B`, `C` from `spec/graph-dataviz-decisions.json`; selected `A`, outcome `go`; target GD-M1-PACKAGING `01M2KJTXM16G2D1YRE2S2CR5EK` | `01M519GE5EA3WF17TRHKPWWFT1` |
| decision **D4** (orientation) — options `A`, `B`, `C`; selected `A`, outcome `go`; owner precision in its context; target GD-M2-PARITY `01M2KJTY950VZE61KCYBT87TBP` | `01M519GEGJ509PDJYRSRWA796K` |
| decision **D7′** (commitment) — options `A` (D7=A unchanged), `revisee`; selected `revisee`, outcome `go`; artifact `rendered-view` → §18.4; targets the feature above and GD-M3-SLICE `01M2KJTYE8AX2VWQWTD852TKRK` | `01M519GRZ1FMHBF6HJ710BWSHP` |

Dependencies L1 → L0, L2 → L1, L3 → L2, L4 → L3, L5 → L3, L6 → L3, L7 → L5, L7 → L6, L8 → L2 are `dependency`
blockers with rule `linked-accepted`; each lot carries one acceptance criterion pointing at §11 or §15.

### 19.2 `spec/graph-dataviz-decisions.json`

D2 and D4 now read `"status": "rendered"` with a `rendered` object (selected option, outcome, `trackDecisionId`,
`pendingReplayRecordId`, note; D4 also carries the owner's precision). The fields that
`plan/replay-graph-dataviz-track.mjs` compares (`context`, `options`, `recommendation`) are unchanged; the file
round-trips byte-identically through `JSON.stringify(…, null, 2)`, which was used to write it. The replay preview
reports **0 operations** before and after the change. The pending records `01M2KK5XPJCP07FDBQBX16TV08` and
`01M2KK5XS2SXGMSSQPAVCF2XJ4` are still `pending` with no selected option (`track decision ls --format json`).

### 19.3 Checks run on the final tree

`node scripts/run-script-guards.mjs`, `npm run licensing:check`, `node tools/graph-dataviz-provenance/verify.mjs`,
`track validate`, the replay preview; results in the PR description. No workflow runs on this PR's paths (C5).

### 19.4 Concurrency with PR #164

PR #164 also appends to `.track/events.jsonl` (22 events after line 1604) and edits D1 and D3 in
`spec/graph-dataviz-decisions.json`. The event log is a hash chain (`prevHash`), so the PR merged second cannot be
resolved by concatenation: it must be rebased and its Track writes replayed with the CLI on top of the other's log,
which assigns new identifiers, then this section is updated.
