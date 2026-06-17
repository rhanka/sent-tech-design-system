# BR06 NavSystem completion dossier

## Scope status

This dossier closes BR06 at the design-system workpackage level. It records the shell contract, a11y/responsive rules, client migration maps, and deferred backlog. Product chat state and client business state stay outside the design system.

Completed implementation scope:

- Svelte: AppShell `site | workspace`, NavShell, NavRail, NavDrawer, ContextPanel, UtilityPanel.
- React: matching public primitives and shared NavSystem CSS.
- Vue: matching public primitives and shared NavSystem CSS.
- Angular: matching public primitives, real `st-nav-drawer`, shared NavSystem CSS.
- Docs: AppShell workspace example with rail, navigation panel, context panel, and utility panel.
- Clients already patched: `sent-tech` offer builder and `sentech-forge` public site shell/mobile drawer.

## Accessibility and responsive shell rules

Region landmarks:

- `topChrome`: `header` or named top-level chrome. Must expose a visible or programmatic name when it contains navigation.
- `primaryRail`: `nav` with `aria-label`, icon-only actions must have `aria-label` or visible text.
- `navigationPanel`: `aside` or `nav` with a name tied to the active rail item. It must not steal route selection state.
- `main`: unique `main` landmark. Skip links must target this region.
- `contextPanel`: `aside` with `aria-label` describing the selected object or inspector purpose.
- `utilityPanel`: `aside`, `section`, or dialog depending on mode. Chat/tools content remains app-owned.
- `bottomPanel`: complementary tools/output region. When modal/fullscreen, it follows modal focus rules.

Keyboard behavior:

- Rail item activation uses native `button`/`a`; current item uses `aria-current="page"` where route-like.
- Drawer close is exposed through app callbacks; Escape closes only overlay/modal drawers, not reserved side panels.
- Focus trap applies only to modal drawers, mobile fullscreen utility panels, and floating dialogs.
- Reserved side panels do not trap focus; they participate in normal document tab order.
- Opening an overlay stores the invoker and returns focus on close unless the host explicitly owns close behavior.
- Collapsible panel headers use native buttons and `aria-expanded`.

Responsive collapse order:

- Desktop: `topChrome | primaryRail | navigationPanel | main | contextPanel | utilityPanel` with fixed/tokenized widths.
- Tablet: compact or horizontal rail, navigation panel may become drawer, context panel may stack below main.
- Mobile: top chrome first, rail second, main third, context/utility as drawers or bottom sheets.
- Mobile docked chat or utility fullscreen must close or yield on route navigation when it would hide destination content.
- Safe-area padding belongs to utility/bottom panel presentation, not to app business components.

Sizing and resizing:

- BR06 v1 uses fixed/tokenized region sizes via CSS variables.
- App-owned persisted `regionSizes` is reserved for v1.1.
- Drag handles and keyboard-resizable separators are deferred until their a11y contract is implemented end-to-end.
- Rail + drawer composition is supported now; resizable rail/drawer is v1.1.

## Radar immobilier migration map

Evidence read:

- `/home/antoinefa/src/radar-immobilier/ui/src/App.svelte`
- `/home/antoinefa/src/radar-immobilier/ui/src/lib/components/TopNav.svelte`
- `/home/antoinefa/src/radar-immobilier/ui/src/lib/components/ViewLayout.svelte`
- `/home/antoinefa/src/radar-immobilier/ui/src/lib/components/chat/ChatWidgetHost.svelte`
- panels discovered: `SignauxSelPanel`, `LotFichePanel`, `CityDetailPanel`, `RadarChatPanel`

Mapping:

- `TopNav` remains app-owned and moves into `topChrome`.
- `ViewLayout` controls slot maps to `navigationPanel`.
- Current route/canvas view maps to `main`.
- `ViewLayout` `sel` slot plus `SignauxSelPanel`, `LotFichePanel`, `CityDetailPanel` map to `contextPanel`.
- `ChatWidgetHost` docked/floating presentation maps to `utilityPanel` with `reserve` for docked and `floating` for floating.
- `chatWidgetLayout`, Radar chat turns, auth state, model selection, and context chips remain app state.

Migration sequence:

- Branch from Radar main in a client-specific branch.
- Bump DS package only if consuming the published BR06 package.
- Wrap authenticated content in `AppShell variant="workspace"`.
- Replace manual `padding-right: dockPaddingCss` with `utilityPanel` reserve mode.
- Move left controls/right selection panels from bespoke flex columns to named regions progressively per view.
- Keep `TopNav` visual behavior unchanged while moving placement only.

## Sentropic ChatDock migration map

Evidence read:

- `/home/antoinefa/src/sentropic/packages/chat-ui/src/components/ChatDock.svelte`
- `/home/antoinefa/src/sentropic/packages/chat-ui/src/stores/chatWidgetLayout.ts`
- `/home/antoinefa/src/sentropic/ui/src/routes/+layout.svelte`
- `/home/antoinefa/src/sentropic/ui/src/lib/components/Header.svelte`

Mapping:

- `ChatDock` remains the generic app/chat dock surface.
- `AppChatPanel` remains app-owned; no product chat logic moves into DS.
- `ChatDock` is hosted through `utilityPanel` and continues publishing `chatWidgetLayout`.
- `Header.svelte` compact behavior continues reading `chatWidgetLayout` during migration.
- Web floating, web docked, Chrome overlay, Chrome sidepanel, and VSCode sidepanel host modes stay supported.
- Mobile close-on-navigation behavior stays host-owned via `sentropic:close-chat`.

Migration sequence:

- Introduce `AppShell variant="workspace"` in `ui/src/routes/+layout.svelte` around header/content/chat.
- Map header to `topChrome` and primary app route content to `main`.
- Host `ChatWidget`/`ChatDock` as `utilityPanel` occupant without changing `ChatDock` internals.
- Replace layout padding/left width calculations only after DS `utilityMode="reserve"` covers the current behavior.

## nc-fullstack migration map

Evidence read:

- `/home/antoinefa/src/nc-fullstack/ui/src/routes/App.svelte`
- `/home/antoinefa/src/nc-fullstack/ui/src/routes/Rail.svelte`
- `/home/antoinefa/src/nc-fullstack/ui/src/routes/Drawer.svelte`
- `/home/antoinefa/src/nc-fullstack/ui/src/routes/Chatbot.svelte`

Mapping:

- `tabs[].rail` maps to `NavRail` items with badges.
- `Rail.svelte` expand state maps to app-owned `openNavigationPanelId` and `NavDrawer` disclosure.
- `Drawer.svelte` maps to `navigationPanel`/`NavDrawer` content.
- Active tab content maps to `main`.
- `Chatbot.svelte` maps to `utilityPanel`; AI/runtime/chat business logic stays in nc-fullstack.
- Current source/reference handoff remains app callbacks and stores.

Migration sequence:

- Wrap `App.svelte` content in `AppShell variant="workspace"`.
- Replace fixed-position rail/drawer CSS with AppShell regions.
- Keep existing `tabs` array as the single source of navigation truth.
- Convert `RailItem` output to `NavRailItem` data without changing tab selection stores.
- Move docked chat sizing to `utilityPanel` once the shell reserve mode is active.

## Graphify migration map

Evidence read:

- `/home/antoinefa/src/graphify/studio/src/components/WorkspaceShell.svelte`
- `/home/antoinefa/src/graphify/studio/src/components/LeftRail.svelte`
- `/home/antoinefa/src/graphify/studio/src/components/SelectionPanel.svelte`

Mapping:

- `WorkspaceShell` maps directly to `AppShell variant="workspace"`.
- `LeftRail` maps to `navigationPanel`, not `primaryRail`, because it contains search and large selectable lists.
- Future compact primary navigation can use `primaryRail` if graphify adds app-level route categories.
- Graph canvas maps to `main`.
- `SelectionPanel` maps to `contextPanel`.
- Search/list state, graph selection, entity cache, and focus remain graphify-owned.

Migration sequence:

- Replace the three-column CSS grid with AppShell regions using equivalent width CSS variables.
- Keep large lists outside DS roving-list registration where performance comments already warn about O(n^2) mount costs.
- Preserve scrollbar-gutter behavior in the navigation panel until DS provides a tokenized equivalent.
- Migrate generated HTML workspace separately; do not couple it to the studio branch.

## Deferred v1.1 / v2 backlog

v1.1:

- Optional resizable rail/drawer/context/utility regions.
- Keyboard-accessible resize handles with persisted app-owned `regionSizes`.
- Better shared package for NavSystem CSS generation to avoid manual parity drift.
- Bottom drawer parity hardening in examples across React/Vue/Angular.
- Client-specific implementation branches for Radar, sentropic, nc-fullstack, and graphify after BR06 package publication.

v2:

- `PanelStack` for VSCode-like stacked top/bottom/side panels.
- Rich top/bottom collapsible accordions as shell occupants, not shell dependency.
- Multi-utility panel orchestration.
- Generated HTML graphify workspace migration.
- Formal shell acceptance harness for keyboard and responsive behavior.
