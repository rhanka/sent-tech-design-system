# BR06 AppShell NavSystem

## Objective

- [ ] Evolve `AppShell` into an explicit `site | workspace` shell contract without breaking current docs-site usage.
- [ ] Make the Radar/immo shell use case first-class: top chrome, primary rail, navigation panel, main canvas, context panel, utility panel, chat inset.
- [ ] Promote the NavSystem primitives needed by Radar, sentropic chat, nc-fullstack, graphify, and the DS docs site.
- [ ] Keep product chat state outside the design system; the DS owns layout regions, insets, layers, focus rules, and responsive behavior.
- [ ] Defer generalized resizing, panel stacks, rich accordions, and React/Vue parity until the Svelte workspace contract is proven.

## Scope / Guardrails

- [ ] Preserve `<AppShell config={shellConfig} />` as valid docs-site behavior.
- [ ] Add explicit `<AppShell variant="site" ... />` and `<AppShell variant="workspace" ... />` contracts.
- [ ] Separate route/navigation selection from panel disclosure state.
- [ ] Treat `ChatDock` and app chat panels as occupants of shell regions, not as DS-owned product components.
- [ ] Keep v1 fixed/tokenized by default; define but do not require persisted resizing.
- [ ] Keep client repos read-only from this branch unless a client-specific branch is explicitly opened.
- [ ] Keep Svelte as the proving implementation before React/Vue parity.

## Branch Scope Boundaries

- [ ] Allowed: `plan/06-BRANCH_appshell-navsystem.md`.
- [ ] Allowed: `packages/components-svelte/src/lib/AppShell.svelte`.
- [ ] Allowed: `packages/components-svelte/src/lib/AppChrome.svelte`.
- [ ] Allowed: `packages/components-svelte/src/lib/NavShell.svelte`.
- [ ] Allowed: `packages/components-svelte/src/lib/NavRail.svelte`.
- [ ] Allowed: `packages/components-svelte/src/lib/NavDrawer.svelte`.
- [ ] Allowed: `packages/components-svelte/src/lib/ContextPanel.svelte`.
- [ ] Allowed: `packages/components-svelte/src/lib/UtilityPanel.svelte`.
- [ ] Allowed: `packages/components-svelte/src/lib/ShellInsetProvider.*`.
- [ ] Allowed: `packages/components-svelte/src/lib/index.ts`.
- [ ] Allowed: `apps/docs/src/routes/app-shell/**`.
- [ ] Allowed: `apps/docs/src/routes/nav-system/**`.
- [ ] Allowed: `apps/docs/src/lib/**` only for docs navigation/example registration.
- [ ] Allowed: component tests directly covering changed Svelte components.
- [ ] Conditional BR06-EX1: `packages/components-react/**` only after the Svelte API is accepted and frozen for parity.
- [ ] Conditional BR06-EX2: `packages/components-vue/**` only after the Svelte API is accepted and frozen for parity.
- [ ] Conditional BR06-EX3: `../radar-immobilier/**`, `../sentropic/**`, `../nc-fullstack/**`, `../graphify/**` only in dedicated client migration branches.
- [ ] Conditional BR06-EX4: lockfiles only if package graph changes are required, with explicit rollback notes.
- [ ] Forbidden: `Makefile`.
- [ ] Forbidden: `docker-compose*.yml`.
- [ ] Forbidden: `.cursor/rules/**`.
- [ ] Forbidden: unrelated token/theme changes.
- [ ] Forbidden: moving `AppChatPanel` or product chat state into this design-system repo.

## Region Taxonomy

- [ ] `topChrome`: persistent top-level app chrome, normally `AppChrome` or `Header`.
- [ ] `primaryRail`: compact primary navigation rail, usually icon/label/count navigation.
- [ ] `navigationPanel`: left discovery/navigation/search/filter panel tied to the primary rail.
- [ ] `main`: primary route content, map, graph, editor, table, or canvas.
- [ ] `contextPanel`: contextual inspector/detail/selection panel, usually right-side on desktop.
- [ ] `utilityPanel`: assistant/chat/tools occupant region, with explicit inset and overlay/reserve behavior.
- [ ] `bottomPanel`: optional tools/output region deferred from v1 implementation unless needed by docs examples.

## State Contract

- [ ] `variant`: `"site" | "workspace"`.
- [ ] `activeNavItemId`: selected route/workspace item.
- [ ] `openNavigationPanelId`: disclosed navigation/search/filter panel.
- [ ] `openContextPanelId`: disclosed inspector/detail panel.
- [ ] `utilityPanelState`: docked, floating, hidden, side, and inset mode metadata.
- [ ] `collapsedRegions`: collapsed structural regions.
- [ ] `regionSizes`: optional app-owned persisted sizes for v1.1.
- [ ] `onActiveNavItemChange`: route/workspace selection callback.
- [ ] `onOpenNavigationPanelChange`: navigation panel disclosure callback.
- [ ] `onOpenContextPanelChange`: context panel disclosure callback.
- [ ] `onUtilityPanelStateChange`: utility panel docking/disclosure callback.

## Lot 0 - Plan and Decision Record

- [ ] Record the double audit consensus: `AppShell` name accepted with explicit variants.
- [ ] Record the double audit consensus: chat is hosted/slotted, not imported as product state.
- [ ] Record the double audit consensus: v1 fixed/tokenized first, resize and panel stack deferred.
- [ ] Record the double audit consensus: client migration is staged by pilot branches.
- [ ] Track this branch under a single durable WP: `NavSystem / vague 3 - AppShell, NavShell, rails, drawers, panels`.
- [ ] Gate: branch scope and migration order are explicit enough for track import.
- [ ] File-level verification list: `plan/06-BRANCH_appshell-navsystem.md`.

## Lot 1 - AppShell Taxonomy and Backward Compatibility

- [ ] Add or document `AppShellVariant = "site" | "workspace"`.
- [ ] Preserve current `config`-driven site shell rendering as the default mode.
- [ ] Add explicit `variant="site"` support without changing current docs-site behavior.
- [ ] Add a disabled or minimal `variant="workspace"` skeleton behind the same component contract.
- [ ] Gate: docs-site import and current `<AppShell config={shellConfig} />` usage remain source-compatible.
- [ ] File-level verification list: `packages/components-svelte/src/lib/AppShell.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/index.ts`.
- [ ] File-level verification list: `apps/docs/src/routes/+layout.svelte`.
- [ ] File-level verification list: `apps/docs/src/routes/app-shell/+page.svelte`.

## Lot 2 - Workspace Region Layout MVP

- [ ] Implement workspace layout regions for `topChrome`, `primaryRail`, `navigationPanel`, `main`, `contextPanel`, and `utilityPanel`.
- [ ] Expose stable CSS variables for region widths, insets, gaps, z-index layers, and responsive breakpoints.
- [ ] Keep default desktop layout fixed/tokenized.
- [ ] Define mobile collapse order: rail/menu, navigation drawer/modal, context drawer/route panel, utility bottom sheet/fullscreen.
- [ ] Gate: a basic workspace page can render top chrome, left navigation, main content, right context, and utility placeholder without app CSS.
- [ ] File-level verification list: `packages/components-svelte/src/lib/AppShell.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/ShellInsetProvider.*`.
- [ ] File-level verification list: `apps/docs/src/routes/app-shell/**`.

## Lot 3 - NavSystem Public Primitives

- [ ] Promote or replace `NavShell` as a public primitive only after naming is fixed.
- [ ] Add `NavRail` for icon/label/count navigation with accessible labels and current-state semantics.
- [ ] Add `NavDrawer` for search, filters, navigation groups, and discovery content.
- [ ] Keep `activeNavItemId` separate from opened navigation panel state.
- [ ] Support badges, disabled state, labels, grouped sections, custom swatches, and app callbacks.
- [ ] Gate: nc-fullstack `rail -> drawer -> content` and Radar `rail controls -> map` can be represented without bespoke shell CSS.
- [ ] File-level verification list: `packages/components-svelte/src/lib/NavShell.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/NavRail.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/NavDrawer.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/index.ts`.

## Lot 4 - Context and Utility Panels

- [ ] Add `ContextPanel` for selection/detail/inspector content.
- [ ] Add `UtilityPanel` for chat/tools/search occupants without chat-specific product state.
- [ ] Define overlay versus reserved-space behavior.
- [ ] Define focus return, escape behavior, landmarks, and z-index collisions.
- [ ] Define safe-area behavior for mobile bottom sheet/fullscreen utility mode.
- [ ] Gate: Radar detail panels and sentropic `ChatDock` can map to named regions with explicit inset behavior.
- [ ] File-level verification list: `packages/components-svelte/src/lib/ContextPanel.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/UtilityPanel.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/ShellInsetProvider.*`.
- [ ] File-level verification list: `apps/docs/src/routes/nav-system/**`.

## Lot 5 - Accessibility and Responsive Rules

- [ ] Define landmarks for top chrome, navigation, main, complementary/context, and utility regions.
- [ ] Define accessible names for rails, drawers, panels, and icon-only actions.
- [ ] Define keyboard behavior for rail navigation, drawer open/close, context panel close, and utility panel close.
- [ ] Define focus trapping only for modal drawer/fullscreen states.
- [ ] Define skip-link behavior from top chrome to main and navigation.
- [ ] Gate: shell behavior is specified before client pilots depend on it.
- [ ] File-level verification list: `packages/components-svelte/src/lib/AppShell.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/NavRail.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/NavDrawer.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/ContextPanel.svelte`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/UtilityPanel.svelte`.

## Lot 6 - Docs Examples and Migration Guide

- [ ] Add a site-mode example preserving the current docs-site shell.
- [ ] Add a basic workspace shell example.
- [ ] Add a workspace example with primary rail and navigation panel.
- [ ] Add a workspace example with right context panel.
- [ ] Add a workspace example with utility/chat placeholder and reserved inset.
- [ ] Add migration notes for current `AppShell config` consumers.
- [ ] Gate: clients can copy a documented Svelte example before migrating.
- [ ] File-level verification list: `apps/docs/src/routes/app-shell/**`.
- [ ] File-level verification list: `apps/docs/src/routes/nav-system/**`.
- [ ] File-level verification list: `apps/docs/src/lib/**`.

## Lot 7 - Radar Pilot Plan

- [ ] Map `TopNav` to `topChrome` with `AppChrome` or current header-compatible DS primitive.
- [ ] Map `ViewLayout` left controls to `navigationPanel`.
- [ ] Map map/canvas views to `main`.
- [ ] Map `SignauxSelPanel`, `LotFichePanel`, and `CityDetailPanel` to `contextPanel`.
- [ ] Map `RadarChatPanel` and `ChatWidgetHost` inset behavior to `utilityPanel`.
- [ ] Keep Radar app state, chat turns, model selection, and auth outside the DS.
- [ ] Gate: Radar can remove shell/layout bespoke CSS after DS MVP is published.
- [ ] File-level verification list: `../radar-immobilier/ui/src/App.svelte`.
- [ ] File-level verification list: `../radar-immobilier/ui/src/lib/components/TopNav.svelte`.
- [ ] File-level verification list: `../radar-immobilier/ui/src/lib/components/ViewLayout.svelte`.
- [ ] File-level verification list: `../radar-immobilier/ui/src/lib/components/chat/ChatWidgetHost.svelte`.

## Lot 8 - Sentropic Chat Integration Plan

- [ ] Keep `AppChatPanel` app-owned.
- [ ] Integrate `ChatDock` through `utilityPanel` and shell inset state.
- [ ] Preserve web floating, web docked, Chrome overlay, Chrome sidepanel, and VSCode sidepanel host modes.
- [ ] Preserve forced compact nav when docked chat consumes desktop width.
- [ ] Preserve mobile close-on-navigation behavior.
- [ ] Gate: sentropic can consume DS shell without moving product chat logic.
- [ ] File-level verification list: `../sentropic/packages/chat-ui/src/components/ChatDock.svelte`.
- [ ] File-level verification list: `../sentropic/packages/chat-ui/src/stores/chatWidgetLayout.ts`.
- [ ] File-level verification list: `../sentropic/ui/src/routes/+layout.svelte`.
- [ ] File-level verification list: `../sentropic/ui/src/lib/components/Header.svelte`.

## Lot 9 - nc-fullstack and graphify Migration Plans

- [ ] Map nc-fullstack `tabs -> rail -> drawer -> content` to `NavRail`, `NavDrawer`, and `main`.
- [ ] Map nc-fullstack docked chat to `utilityPanel`.
- [ ] Keep nc-fullstack source navigation handoff as app callbacks, not shell state mutation.
- [ ] Map graphify `WorkspaceShell` to `AppShell variant="workspace"`.
- [ ] Map graphify `LeftRail` search/large lists to `navigationPanel` without forcing expensive list remounts.
- [ ] Map graphify `SelectionPanel` and `EntityPanel` to `contextPanel`.
- [ ] Keep graphify generated HTML workspace as a separate migration branch.
- [ ] Gate: both clients have migration plans that preserve their current performance and state-coupling constraints.
- [ ] File-level verification list: `../nc-fullstack/ui/src/routes/App.svelte`.
- [ ] File-level verification list: `../nc-fullstack/ui/src/routes/Rail.svelte`.
- [ ] File-level verification list: `../nc-fullstack/ui/src/routes/Drawer.svelte`.
- [ ] File-level verification list: `../nc-fullstack/ui/src/routes/Chatbot.svelte`.
- [ ] File-level verification list: `../graphify/studio/src/components/WorkspaceShell.svelte`.
- [ ] File-level verification list: `../graphify/studio/src/components/LeftRail.svelte`.
- [ ] File-level verification list: `../graphify/studio/src/components/SelectionPanel.svelte`.

## Lot 10 - Deferred v1.1 / v2 Work

- [ ] Defer resizable regions to v1.1 after fixed workspace shell proves stable.
- [ ] Defer keyboard-resizable handles until a11y rules and persistence contract are accepted.
- [ ] Defer `PanelStack` and VSCode-like top/bottom collapsible regions to v2.
- [ ] Defer rich Accordion dependency from AppShell v1.
- [ ] Defer React/Vue parity until the Svelte API is accepted.
- [ ] Gate: deferred work is explicitly out of the blocking Radar MVP.
- [ ] File-level verification list: `packages/components-react/**`.
- [ ] File-level verification list: `packages/components-vue/**`.
- [ ] File-level verification list: `packages/components-svelte/src/lib/Accordion.svelte`.
- [ ] File-level verification list: `packages/components-vue/src/Accordion.ts`.

## Feedback Loop

- [ ] BR06-D1: accept `AppShell` as the long-term name with explicit `site | workspace` variants.
- [ ] BR06-D2: choose final region names before implementation; default proposal is `topChrome`, `primaryRail`, `navigationPanel`, `main`, `contextPanel`, `utilityPanel`, `bottomPanel`.
- [ ] BR06-D3: confirm that `utilityPanel` is an occupant region and not a chat product abstraction.
- [ ] BR06-D4: confirm that Radar is the first client pilot and that sentropic/nc-fullstack/graphify follow as separate migrations.
- [ ] BR06-D5: confirm resize/panel-stack/rich-accordion are deferred from the Radar-blocking MVP.
- [ ] BR06-B1: `plan/BRANCH_TEMPLATE.md` is missing; this file uses the harness plan structure directly.
- [ ] BR06-B2: track write/import tooling is available; BR06 is imported under one durable NavSystem/vague 3 WP after correcting an initial over-split into cancelled pseudo-WPs.
