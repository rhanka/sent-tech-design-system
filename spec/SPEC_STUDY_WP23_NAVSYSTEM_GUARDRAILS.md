# SPEC STUDY WP23 - NavSystem guardrails / design check rules

Superseded for execution by `spec/SPEC_EVOL_WP23_NAVSYSTEM_GUARDRAILS.md`.

## Context

WP23 restores the post-vague-3 NavSystem follow-up from the Claude traces:

- DetailPanel recipe for Radar Immo's "Outil de développement" inspector.
- `design check` rules after the NavSystem/AppShell release.

This is a guardrail/specification workpackage, not a replacement for WP22. WP22 covers the released AppShell/NavShell/rail/drawer/panel primitives. WP23 covers adoption safety and automated design checks.

## Scope

### DetailPanel recipe

Target: an inspector surface that can sit beside a main app/workspace canvas, especially Radar Immo.

Questions to close before implementation:

- Is `DetailPanel` a first-class component, a recipe over `ContextPanel`, or both?
- Does it own tabs/sections, or does it only define layout regions?
- Which positions are required: right, left, drawer, accordion-collapsed?
- Does it integrate chat/tool output or only structured inspection fields?

Initial recommendation:

- Start as a documented recipe over `ContextPanel` + `UtilityPanel`, not a new primitive, unless Radar Immo needs a stable import.
- Promote to component only if at least two clients need the same API.

### Design check rules

Rules restored from Claude:

- One primary action per surface.
- Color encodes state only.
- Interactive target >= 44px.
- No interactive control inside an option/list item.
- Depth / hierarchy limits for rail, drawer, tree and menu.
- Search fill affordance for drawer, rail+drawer and panel.

## Candidate implementation

- Add NavSystem rule definitions under the design skill/rule engine.
- Add docs examples that intentionally pass/fail each rule.
- Add a report section in the design-check output for NavSystem.
- Keep rules advisory at first unless false-positive rate is low.

## Acceptance

- DetailPanel adoption recipe exists for Radar Immo.
- Six NavSystem design-check rules are encoded or explicitly documented with examples.
- WP23 track children are marked done one by one, not bulk-closed.
