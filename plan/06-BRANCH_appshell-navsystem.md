# BR06 AppShell NavSystem

## Objective

- [x] Evolve `AppShell` into an explicit `site | workspace` shell contract without breaking current docs-site usage.
- [x] Make the Radar/immo shell use case first-class: top chrome, primary rail, navigation panel, main canvas, context panel, utility panel, chat inset.
- [x] Promote the NavSystem primitives needed by Radar, sentropic chat, nc-fullstack, graphify, and the DS docs site.
- [x] Keep product chat state outside the design system; the DS owns layout regions, insets, layers, focus rules, and responsive behavior.
- [x] Deliver AppShell/NavSystem v1 now; defer generalized resizing, panel stacks, and rich accordions after the fixed workspace contract is proven.

## Scope / Guardrails

- [x] Preserve `<AppShell config={shellConfig} />` as valid docs-site behavior.
- [x] Add explicit `<AppShell variant="site" ... />` and `<AppShell variant="workspace" ... />` contracts.
- [x] Separate route/navigation selection from panel disclosure state.
- [x] Treat `ChatDock` and app chat panels as occupants of shell regions, not as DS-owned product components.
- [x] Keep v1 fixed/tokenized by default; define but do not require persisted resizing.
- [x] Keep client repo changes isolated to explicit client commits/branches and record any exception in the completion dossier.
- [x] Keep Svelte as the proving implementation and ship React/Vue/Angular parity once the Svelte API is accepted in-wave.

## Branch Scope Boundaries

- [x] Allowed: `plan/06-BRANCH_appshell-navsystem.md`.
- [x] Allowed: `plan/06-NAVSYSTEM_COMPLETION.md`.
- [x] Allowed: `packages/components-svelte/src/lib/AppShell.svelte`.
- [x] Allowed: `packages/components-svelte/src/lib/AppChrome.svelte`.
- [x] Allowed: `packages/components-svelte/src/lib/NavShell.svelte`.
- [x] Allowed: `packages/components-svelte/src/lib/NavRail.svelte`.
- [x] Allowed: `packages/components-svelte/src/lib/NavDrawer.svelte`.
- [x] Allowed: `packages/components-svelte/src/lib/ContextPanel.svelte`.
- [x] Allowed: `packages/components-svelte/src/lib/UtilityPanel.svelte`.
- [x] Allowed: `packages/components-svelte/src/lib/ShellInsetProvider.*`.
- [x] Allowed: `packages/components-svelte/src/lib/index.ts`.
- [x] Allowed: `apps/docs/src/routes/app-shell/**`.
- [x] Allowed: `apps/docs/src/routes/nav-system/**`.
- [x] Allowed: `apps/docs/src/lib/**` only for docs navigation/example registration.
- [x] Allowed: component tests directly covering changed Svelte components.
- [x] Conditional BR06-EX1: `packages/components-react/**` only after the Svelte API is accepted and frozen for parity.
- [x] Conditional BR06-EX2: `packages/components-vue/**` only after the Svelte API is accepted and frozen for parity.
- [x] Conditional BR06-EX3: `../radar-immobilier/**`, `../sentropic/**`, `../nc-fullstack/**`, `../graphify/**` only in dedicated client migration branches.
- [x] Conditional BR06-EX4: lockfiles only if package graph changes are required, with explicit rollback notes.
- [x] Forbidden: `Makefile`.
- [x] Forbidden: `docker-compose*.yml`.
- [x] Forbidden: `.cursor/rules/**`.
- [x] Forbidden: unrelated token/theme changes.
- [x] Forbidden: moving `AppChatPanel` or product chat state into this design-system repo.

## Region Taxonomy

- [x] `topChrome`: persistent top-level app chrome, normally `AppChrome` or `Header`.
- [x] `primaryRail`: compact primary navigation rail, usually icon/label/count navigation.
- [x] `navigationPanel`: left discovery/navigation/search/filter panel tied to the primary rail.
- [x] `main`: primary route content, map, graph, editor, table, or canvas.
- [x] `contextPanel`: contextual inspector/detail/selection panel, usually right-side on desktop.
- [x] `utilityPanel`: assistant/chat/tools occupant region, with explicit inset and overlay/reserve behavior.
- [x] `bottomPanel`: optional tools/output region deferred from v1 implementation unless needed by docs examples.

## State Contract

- [x] `variant`: `"site" | "workspace"`.
- [x] `activeNavItemId`: selected route/workspace item.
- [x] `openNavigationPanelId`: disclosed navigation/search/filter panel.
- [x] `openContextPanelId`: disclosed inspector/detail panel.
- [x] `utilityPanelState`: docked, floating, hidden, side, and inset mode metadata.
- [x] `collapsedRegions`: collapsed structural regions.
- [x] `regionSizes`: optional app-owned persisted sizes for v1.1.
- [x] `onActiveNavItemChange`: route/workspace selection callback.
- [x] `onOpenNavigationPanelChange`: navigation panel disclosure callback.
- [x] `onOpenContextPanelChange`: context panel disclosure callback.
- [x] `onUtilityPanelStateChange`: utility panel docking/disclosure callback.

## Lot 0 - Plan and Decision Record

- [x] Record the double audit consensus: `AppShell` name accepted with explicit variants.
- [x] Record the double audit consensus: chat is hosted/slotted, not imported as product state.
- [x] Record the double audit consensus: v1 fixed/tokenized first, resize and panel stack deferred.
- [x] Record the double audit consensus: client migration is staged by pilot branches.
- [x] Track this branch under a single durable WP: `NavSystem / vague 3 - AppShell, NavShell, rails, drawers, panels`.
- [x] Gate: branch scope and migration order are explicit enough for track import.
- [x] File-level verification list: `plan/06-BRANCH_appshell-navsystem.md`.

## Lot 1 - AppShell Taxonomy and Backward Compatibility

- [x] Add or document `AppShellVariant = "site" | "workspace"`.
- [x] Preserve current `config`-driven site shell rendering as the default mode.
- [x] Add explicit `variant="site"` support without changing current docs-site behavior.
- [x] Add a disabled or minimal `variant="workspace"` skeleton behind the same component contract.
- [x] Gate: docs-site import and current `<AppShell config={shellConfig} />` usage remain source-compatible.
- [x] File-level verification list: `packages/components-svelte/src/lib/AppShell.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/index.ts`.
- [x] File-level verification list: `apps/docs/src/routes/+layout.svelte`.
- [x] File-level verification list: `apps/docs/src/routes/app-shell/+page.svelte`.

## Lot 2 - Workspace Region Layout MVP

- [x] Implement workspace layout regions for `topChrome`, `primaryRail`, `navigationPanel`, `main`, `contextPanel`, and `utilityPanel`.
- [x] Expose stable CSS variables for region widths, insets, gaps, z-index layers, and responsive breakpoints.
- [x] Keep default desktop layout fixed/tokenized.
- [x] Define mobile collapse order: rail/menu, navigation drawer/modal, context drawer/route panel, utility bottom sheet/fullscreen.
- [x] Gate: a basic workspace page can render top chrome, left navigation, main content, right context, and utility placeholder without app CSS.
- [x] File-level verification list: `packages/components-svelte/src/lib/AppShell.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/ShellInsetProvider.*`.
- [x] File-level verification list: `apps/docs/src/routes/app-shell/**`.

## Lot 3 - NavSystem Public Primitives

- [x] Promote or replace `NavShell` as a public primitive only after naming is fixed.
- [x] Add `NavRail` for icon/label/count navigation with accessible labels and current-state semantics.
- [x] Add `NavDrawer` for search, filters, navigation groups, and discovery content.
- [x] Keep `activeNavItemId` separate from opened navigation panel state.
- [x] Support badges, disabled state, labels, grouped sections, custom swatches, and app callbacks.
- [x] Gate: nc-fullstack `rail -> drawer -> content` and Radar `rail controls -> map` can be represented without bespoke shell CSS.
- [x] File-level verification list: `packages/components-svelte/src/lib/NavShell.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/NavRail.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/NavDrawer.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/index.ts`.

## Lot 4 - Context and Utility Panels

- [x] Add `ContextPanel` for selection/detail/inspector content.
- [x] Add `UtilityPanel` for chat/tools/search occupants without chat-specific product state.
- [x] Define overlay versus reserved-space behavior.
- [x] Define focus return, escape behavior, landmarks, and z-index collisions.
- [x] Define safe-area behavior for mobile bottom sheet/fullscreen utility mode.
- [x] Gate: Radar detail panels and sentropic `ChatDock` can map to named regions with explicit inset behavior.
- [x] File-level verification list: `packages/components-svelte/src/lib/ContextPanel.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/UtilityPanel.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/ShellInsetProvider.*`.
- [x] File-level verification list: `apps/docs/src/routes/nav-system/**`.

## Lot 5 - Accessibility and Responsive Rules

- [x] Define landmarks for top chrome, navigation, main, complementary/context, and utility regions.
- [x] Define accessible names for rails, drawers, panels, and icon-only actions.
- [x] Define keyboard behavior for rail navigation, drawer open/close, context panel close, and utility panel close.
- [x] Define focus trapping only for modal drawer/fullscreen states.
- [x] Define skip-link behavior from top chrome to main and navigation.
- [x] Gate: shell behavior is specified before client pilots depend on it.
- [x] File-level verification list: `packages/components-svelte/src/lib/AppShell.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/NavRail.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/NavDrawer.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/ContextPanel.svelte`.
- [x] File-level verification list: `packages/components-svelte/src/lib/UtilityPanel.svelte`.

## Lot 6 - Docs Examples and Migration Guide

- [x] Add a site-mode example preserving the current docs-site shell.
- [x] Add a basic workspace shell example.
- [x] Add a workspace example with primary rail and navigation panel.
- [x] Add a workspace example with right context panel.
- [x] Add a workspace example with utility/chat placeholder and reserved inset.
- [x] Add migration notes for current `AppShell config` consumers.
- [x] Gate: clients can copy a documented Svelte example before migrating.
- [x] File-level verification list: `apps/docs/src/routes/app-shell/**`.
- [x] File-level verification list: `apps/docs/src/routes/nav-system/**`.
- [x] File-level verification list: `apps/docs/src/lib/**`.

## Lot 7 - Radar Pilot Plan

- [x] Map `TopNav` to `topChrome` with `AppChrome` or current header-compatible DS primitive.
- [x] Map `ViewLayout` left controls to `navigationPanel`.
- [x] Map map/canvas views to `main`.
- [x] Map `SignauxSelPanel`, `LotFichePanel`, and `CityDetailPanel` to `contextPanel`.
- [x] Map `RadarChatPanel` and `ChatWidgetHost` inset behavior to `utilityPanel`.
- [x] Keep Radar app state, chat turns, model selection, and auth outside the DS.
- [x] Gate: Radar can remove shell/layout bespoke CSS after DS MVP is published.
- [x] File-level verification list: `../radar-immobilier/ui/src/App.svelte`.
- [x] File-level verification list: `../radar-immobilier/ui/src/lib/components/TopNav.svelte`.
- [x] File-level verification list: `../radar-immobilier/ui/src/lib/components/ViewLayout.svelte`.
- [x] File-level verification list: `../radar-immobilier/ui/src/lib/components/chat/ChatWidgetHost.svelte`.

## Lot 8 - Sentropic Chat Integration Plan

- [x] Keep `AppChatPanel` app-owned.
- [x] Integrate `ChatDock` through `utilityPanel` and shell inset state.
- [x] Preserve web floating, web docked, Chrome overlay, Chrome sidepanel, and VSCode sidepanel host modes.
- [x] Preserve forced compact nav when docked chat consumes desktop width.
- [x] Preserve mobile close-on-navigation behavior.
- [x] Gate: sentropic can consume DS shell without moving product chat logic.
- [x] File-level verification list: `../sentropic/packages/chat-ui/src/components/ChatDock.svelte`.
- [x] File-level verification list: `../sentropic/packages/chat-ui/src/stores/chatWidgetLayout.ts`.
- [x] File-level verification list: `../sentropic/ui/src/routes/+layout.svelte`.
- [x] File-level verification list: `../sentropic/ui/src/lib/components/Header.svelte`.

## Lot 9 - nc-fullstack and graphify Migration Plans

- [x] Map nc-fullstack `tabs -> rail -> drawer -> content` to `NavRail`, `NavDrawer`, and `main`.
- [x] Map nc-fullstack docked chat to `utilityPanel`.
- [x] Keep nc-fullstack source navigation handoff as app callbacks, not shell state mutation.
- [x] Map graphify `WorkspaceShell` to `AppShell variant="workspace"`.
- [x] Map graphify `LeftRail` search/large lists to `navigationPanel` without forcing expensive list remounts.
- [x] Map graphify `SelectionPanel` and `EntityPanel` to `contextPanel`.
- [x] Keep graphify generated HTML workspace as a separate migration branch.
- [x] Gate: both clients have migration plans that preserve their current performance and state-coupling constraints.
- [x] File-level verification list: `../nc-fullstack/ui/src/routes/App.svelte`.
- [x] File-level verification list: `../nc-fullstack/ui/src/routes/Rail.svelte`.
- [x] File-level verification list: `../nc-fullstack/ui/src/routes/Drawer.svelte`.
- [x] File-level verification list: `../nc-fullstack/ui/src/routes/Chatbot.svelte`.
- [x] File-level verification list: `../graphify/studio/src/components/WorkspaceShell.svelte`.
- [x] File-level verification list: `../graphify/studio/src/components/LeftRail.svelte`.
- [x] File-level verification list: `../graphify/studio/src/components/SelectionPanel.svelte`.

## Lot 10 - Deferred v1.1 / v2 Work

- [x] Defer resizable regions to v1.1 after fixed workspace shell proves stable.
- [x] Defer keyboard-resizable handles until a11y rules and persistence contract are accepted.
- [x] Defer `PanelStack` and VSCode-like top/bottom collapsible regions to v2.
- [x] Defer rich Accordion dependency from AppShell v1.
- [x] Keep React/Vue/Angular parity delivered in BR06; defer deeper parity hardening to v1.1.
- [x] Gate: deferred work is explicitly out of the blocking Radar MVP.
- [x] File-level verification list: `packages/components-react/**`.
- [x] File-level verification list: `packages/components-vue/**`.
- [x] File-level verification list: `packages/components-svelte/src/lib/Accordion.svelte`.
- [x] File-level verification list: `packages/components-vue/src/Accordion.ts`.

## Feedback Loop

- [x] BR06-D1: accept `AppShell` as the long-term name with explicit `site | workspace` variants.
- [x] BR06-D2: choose final region names before implementation; default proposal is `topChrome`, `primaryRail`, `navigationPanel`, `main`, `contextPanel`, `utilityPanel`, `bottomPanel`.
- [x] BR06-D3: confirm that `utilityPanel` is an occupant region and not a chat product abstraction.
- [x] BR06-D4: confirm that Radar is the first client pilot and that sentropic/nc-fullstack/graphify follow as separate migrations.
- [x] BR06-D5: confirm resize/panel-stack/rich-accordion are deferred from the Radar-blocking MVP.
- [x] BR06-B1: `plan/BRANCH_TEMPLATE.md` is missing; this file uses the harness plan structure directly.
- [x] BR06-B2: track write/import tooling is available; BR06 is imported under one durable NavSystem/vague 3 WP after correcting an initial over-split into cancelled pseudo-WPs.
