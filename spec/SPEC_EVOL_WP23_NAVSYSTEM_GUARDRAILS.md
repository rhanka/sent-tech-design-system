# SPEC EVOL WP23 - NavSystem guardrails and design audit rules

## Decision record

Double review verdict: no-go for direct engine implementation from the study spec, go for a first executable lot after closing API decisions, rule contracts, automation status and framework scope.

WP23 is therefore narrowed to:

- A Radar Immo DetailPanel adoption recipe over existing `ContextPanel` and `UtilityPanel` primitives.
- Deterministic `design audit` rules where the static input model is reliable.
- Explicit manual/deferred status for rules that need layout, product semantics or a larger NavSystem model.

## Non-goals

- No public `DetailPanel` component export in WP23.
- No new AppShell/NavShell primitive in WP23.
- No Angular/AppShell migration in WP23.
- No new design tokens in WP23.
- No chat panel API in WP23 beyond documenting a slot/region pattern inside the recipe.

## DetailPanel recipe contract

Target client: Radar Immo, "Outil de developpement" inspector beside a workspace canvas.

Implementation form:

- Recipe only: compose `ContextPanel` for the inspection surface and `UtilityPanel` for tool output or assistant affordances.
- Ownership: the client owns tabs, section labels, data loading and mutations.
- DS ownership: region anatomy, density, responsive behavior, empty/loading/error states, and do/don't guidance.
- Positions: right side panel by default; left side panel allowed; drawer mode on constrained widths; accordion collapse for secondary tool/chat regions.
- Chat/tool output: optional region, never hard-coupled to a chat implementation.

Required regions:

- Header: inspected object label, type badge, close/collapse action.
- Summary: stable key/value facts for the selected object.
- Primary action zone: at most one primary action.
- Sections: grouped details, history, diagnostics or related entities.
- Utility slot: optional assistant/tool output, collapsible top or bottom.
- State surfaces: empty, loading, error, stale data.

Responsive guidance:

- Desktop: panel sits beside the canvas, does not cover primary work unless drawer mode is selected.
- Tablet: panel may become a resizable drawer if the host AppShell supports it.
- Mobile: panel becomes a full-height drawer or routed detail screen; utility slot starts collapsed.

## Audit report contract

Encoded rules must emit standard `AuditReport.findings` entries:

- `ruleId`: stable `navsystem-*` id or an existing rule id.
- `severity`: `high`, `medium`, or `low`.
- `location`: CSS-like evidence from the DOM node or rule block.
- `message`: concrete violation.
- `suggestion`: remediation path.

Automation statuses:

- `encoded`: rule is implemented in `packages/skills` and included in `defaultRules`.
- `encoded-existing`: already covered by an existing default rule; WP23 documents the limitation.
- `advisory-heuristic`: can be implemented but must stay non-blocking until false positives are measured.
- `manual-only`: human/design review rule, not safe for static audit.
- `deferred`: explicitly not counted as WP23 done.

## Rule matrix

| Rule | Status | Severity | Static input model | Violation | Non-violation | Exceptions |
| --- | --- | --- | --- | --- | --- | --- |
| `navsystem-one-primary-action` | encoded | medium | Explicit primary markers inside a nearest surface: `data-variant="primary"`, `variant="primary"`, `.st-button--primary`, `.btn-primary`, `data-st-primary-action`, `data-primary-action`, `data-action-priority="primary"` | More than one explicit primary action in the same `main`, `section`, `aside`, `nav`, region, panel, drawer, rail or `data-st-surface` | One primary action per surface; multiple secondary actions | Disabled or aria-hidden actions are ignored |
| `navsystem-no-interactive-in-option` | encoded | high | Descendants of `role="option"`, native `option`, `data-st-option`, `.st-option` | Nested `button`, `a[href]`, input/select/textarea, summary, interactive role, or tabbable descendant | The option itself is selectable/focusable, with no nested control | `aria-hidden="true"` descendants are ignored |
| `touch-target-44` | encoded-existing | low | Existing inline style size parser on interactive elements | Explicit inline width/height or min-width/min-height below 44px | Inline min size is at least 44px | Static audit cannot infer computed CSS; visual audit remains required for full layout |
| `navsystem-color-state-only` | encoded | medium | Explicit state/status/intent markers in NavSystem surfaces | State/status color marker has no visible, `aria-label`, `title`, `aria-labelledby` or `data-state-label` label | Status color is paired with text, title, aria label or parent copy | Static audit cannot infer arbitrary product semantics; it only catches explicit state/status markers |
| `navsystem-depth-hierarchy` | encoded | low | Explicit rail/drawer/panel/menu/tree surfaces with nested lists or `aria-level` | Rail depth > 1; drawer/panel depth > 2; menu/tree depth > 3 | Depth stays within the surface threshold or uses a documented tree/disclosure pattern | `data-st-depth-exception` / `data-nav-depth-exception` can document intentional data-tree exceptions |
| `navsystem-search-fill-affordance` | encoded | low | Search controls inside explicit drawer/panel/rail-drawer surfaces | Search has no `width/inline-size:100%`, `flex:1`, `align-self:stretch`, or class/data fill/full/fluid/stretch marker | Search uses explicit full-width/flex fill affordance in drawer/panel command zones | Compact toolbar search remains allowed outside drawer/panel command surfaces |

## Fixtures

First encoded lot:

- `navsystem-one-primary-action` fail: one surface containing two explicit primary buttons.
- `navsystem-one-primary-action` pass: two surfaces each containing one explicit primary button.
- `navsystem-no-interactive-in-option` fail: `role="option"` containing a nested button.
- `navsystem-no-interactive-in-option` pass: the option itself is focusable/selectable with no nested control.

Later lots:

- `navsystem-color-state-only` fail/pass: status color marker without/with accessible state label.
- `navsystem-depth-hierarchy` fail/pass: nested rail over depth 1; drawer depth 2 allowed.
- `navsystem-search-fill-affordance` fail/pass: panel search without fill marker; drawer search with width 100%.
- `touch-target-44`: existing tests remain authoritative.

## Execution plan

1. Add the recipe doc for Radar Immo.
2. Encode the six NavSystem rules above in `packages/skills`, with advisory severity where the static model is limited.
3. Register the rules in `defaultRules` and public exports.
4. Add direct rule tests and update the README rule inventory.
5. Track WP23 children one by one; do not mark manual/deferred rules done.

## Acceptance for this lot

- EVOL spec exists and supersedes the study spec.
- DetailPanel recipe exists as documentation, not a public component.
- Six NavSystem rules are encoded in `design audit`, with explicit static/advisory limitations where applicable.
- Existing touch-target rule is documented as partial WP23 coverage.
- Color/depth/search rules are encoded as static/advisory signals with explicit limitations; they do not claim visual-computed coverage.
