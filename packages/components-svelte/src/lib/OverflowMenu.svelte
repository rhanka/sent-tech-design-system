<script lang="ts" module>
  import type { Component } from "svelte";
  import type { SubMenuSide } from "./menu-cascade.js";

  export type OverflowMenuIconProps = {
    size?: number | string;
    strokeWidth?: number | string;
    color?: string;
    class?: string;
  } & Record<`data-${string}`, unknown>;

  export type OverflowMenuIcon = Component<OverflowMenuIconProps> | string;

  export type OverflowMenuSubmenuSide = SubMenuSide;

  export interface OverflowMenuActionItem {
    kind?: "item";
    value: string;
    label: string;
    disabled?: boolean;
    danger?: boolean;
    icon?: OverflowMenuIcon;
    onclick?: () => void;
    children?: OverflowMenuItem[];
    selected?: boolean;
  }

  export interface OverflowMenuDividerItem {
    kind: "divider";
  }

  export interface OverflowMenuGroupItem {
    kind: "group";
    label: string;
  }

  export type OverflowMenuItem =
    | OverflowMenuActionItem
    | OverflowMenuDividerItem
    | OverflowMenuGroupItem;

  let overflowMenuInstanceCounter = 0;
</script>

<script lang="ts">
  import { Ellipsis } from "@lucide/svelte";
  import { setContext, tick } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Menu from "./Menu.svelte";
  import type { MenuItem, MenuSelectDetail } from "./Menu.svelte";
  import { MENU_HOST_CONTEXT, type MenuHostContext } from "./menu-cascade.js";

  type OverflowMenuProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onselect"> & {
    items: OverflowMenuItem[];
    label?: string;
    open?: boolean;
    placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
    class?: string;
    triggerLabel?: string;
    dense?: boolean;
    submenuSide?: OverflowMenuSubmenuSide;
    onselect?: (value: string, detail?: MenuSelectDetail) => void;
  };

  let {
    items,
    label = "Menu",
    open = $bindable(false),
    placement = "bottom-end",
    class: className,
    triggerLabel = "More actions",
    dense = false,
    submenuSide = "auto",
    onselect,
    ...rest
  }: OverflowMenuProps = $props();

  const rootMenuId = `st-overflowmenu-${++overflowMenuInstanceCounter}`;

  let host: HTMLDivElement | undefined = $state();
  let trigger: HTMLButtonElement | undefined = $state();

  // Cap viewport-aware (aligné sur MenuPopover) : sans ça, une longue liste
  // (~12+ items) déborde du viewport en mobile <768px sans scroll. On borne la
  // hauteur du panneau à l'espace réellement disponible sous (ou au-dessus, en
  // placement `top`) le déclencheur ; le Menu interne scrolle via
  // `--st-menu-maxHeight`.
  let maxHeight = $state(0);
  const VIEWPORT_GAP = 4;
  const VIEWPORT_MARGIN = 8;
  const MIN_PANEL_HEIGHT = 160;

  function computeMaxHeight() {
    if (!host || typeof window === "undefined") return;
    const rect = host.getBoundingClientRect();
    const up = placement === "top-start" || placement === "top-end";
    maxHeight = up
      ? Math.max(rect.top - VIEWPORT_GAP - VIEWPORT_MARGIN, MIN_PANEL_HEIGHT)
      : Math.max(window.innerHeight - rect.bottom - VIEWPORT_GAP - VIEWPORT_MARGIN, MIN_PANEL_HEIGHT);
  }

  // À l'ouverture : calcule la hauteur dispo et suit scroll/resize tant qu'ouvert.
  $effect(() => {
    if (!open) return;
    computeMaxHeight();
    const recompute = () => computeMaxHeight();
    window.addEventListener("scroll", recompute, true);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", recompute, true);
      window.removeEventListener("resize", recompute);
    };
  });

  function treeHasCascade(list: OverflowMenuItem[]): boolean {
    for (const item of list) {
      if (
        (item.kind === undefined || item.kind === "item") &&
        Array.isArray((item as OverflowMenuActionItem).children) &&
        ((item as OverflowMenuActionItem).children?.length ?? 0) > 0
      ) {
        return true;
      }
      const children = (item as OverflowMenuActionItem).children;
      if (Array.isArray(children) && treeHasCascade(children)) return true;
    }
    return false;
  }

  function findByValue(list: OverflowMenuItem[], value: string): OverflowMenuActionItem | undefined {
    for (const item of list) {
      if (item.kind !== undefined && item.kind !== "item") continue;
      const action = item as OverflowMenuActionItem;
      if (action.value === value) return action;
      if (Array.isArray(action.children)) {
        const found = findByValue(action.children, value);
        if (found) return found;
      }
    }
    return undefined;
  }

  function requestClose(options: { focusTrigger: boolean }) {
    open = false;
    if (options.focusTrigger) {
      trigger?.focus();
    }
  }

  const hostContext: MenuHostContext = { rootMenuId, requestClose };
  setContext(MENU_HOST_CONTEXT, hostContext);

  function focusFirstMenuItem() {
    const first = host?.querySelector<HTMLButtonElement>(
      '[role="menuitem"]:not(:disabled)'
    );
    first?.focus();
  }

  function openAndFocus() {
    open = true;
    tick().then(() => {
      focusFirstMenuItem();
    });
  }

  const classes = () =>
    [
      "st-overflowMenu",
      `st-overflowMenu--${placement}`,
      dense ? "st-overflowMenu--dense" : null,
      className
    ]
    .filter(Boolean)
    .join(" ");

  function toggle() {
    if (open) {
      close();
    } else {
      openAndFocus();
    }
  }

  function close() {
    open = false;
  }

  function panelPositionStyle(): string {
    // The inner Menu owns the surface; the host only pins the panel box.
    const offset = "calc(100% + var(--st-spacing-1, 0.25rem))";
    let position: string;
    if (placement === "bottom-start") {
      position = `position: absolute; left: 0; top: ${offset};`;
    } else if (placement === "top-end") {
      position = `position: absolute; right: 0; bottom: ${offset};`;
    } else if (placement === "top-start") {
      position = `position: absolute; left: 0; bottom: ${offset};`;
    } else {
      position = `position: absolute; right: 0; top: ${offset};`;
    }
    const cap = maxHeight ? ` --st-menu-maxHeight: ${maxHeight}px;` : "";
    return `${position} z-index: var(--st-component-popover-zIndex, 80);${cap}`;
  }

  function handleMenuSelect(value: string, detail?: MenuSelectDetail) {
    const cascade = treeHasCascade(items);
    // Leaf `onclick` still precedes `select`; parent activation never reaches
    // here (the Menu opens the sub-menu instead). The Menu passes its item
    // reference through, so `detail.item` is this host's own object.
    const source = detail?.item
      ? (detail.item as unknown as OverflowMenuActionItem)
      : findByValue(items, value);
    source?.onclick?.();
    if (cascade) {
      onselect?.(value, detail);
    } else {
      // Flat menus keep the legacy single-argument call (AC-01).
      onselect?.(value);
    }
    close();
  }

  function onWindowKeydown(event: KeyboardEvent) {
    // A nested menu level already consumed this key (D4).
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      // Keyboard closes return focus to the trigger (§3.6).
      requestClose({ focusTrigger: true });
    }
  }

  function onWindowPointerDown(event: PointerEvent) {
    if (event.defaultPrevented) return;
    if (!open) return;
    const composed = event as PointerEvent & { composedPath?: () => EventTarget[] };
    const path = typeof composed.composedPath === "function" ? composed.composedPath() : [];
    const target = event.target as Node | null;
    const inside =
      host !== undefined &&
      (path.length > 0 ? path.includes(host) : Boolean(target && host.contains(target)));
    if (!inside) close();
  }

  function onTriggerKeyDown(event: KeyboardEvent) {
    if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    if (open) {
      focusFirstMenuItem();
    } else {
      openAndFocus();
    }
  }
</script>

<svelte:window onkeydown={onWindowKeydown} onpointerdown={onWindowPointerDown} />

<div {...rest} bind:this={host} class={classes()}>
  <button
    type="button"
    bind:this={trigger}
    class="st-overflowMenu__trigger"
    aria-haspopup="menu"
    aria-expanded={open ? "true" : "false"}
    aria-controls={open ? rootMenuId : undefined}
    aria-label={triggerLabel}
    onclick={toggle}
    onkeydown={onTriggerKeyDown}
  >
    <Ellipsis size={18} strokeWidth={2.25} aria-hidden="true" />
  </button>
  {#if open}
    <Menu
      items={items as unknown as MenuItem[]}
      label={label}
      submenuSide={submenuSide}
      dense={dense}
      id={rootMenuId}
      style={panelPositionStyle()}
      internalOverflowClasses
      onselect={handleMenuSelect}
    />
  {/if}
</div>

<style>
  .st-overflowMenu {
    display: inline-block;
    position: relative;
  }

  .st-overflowMenu__trigger {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--st-component-overflowMenu-triggerRadius, var(--st-radius-small, 0.375rem));
    color: var(--st-component-overflowMenu-triggerText, var(--st-semantic-text-primary));
    cursor: pointer;
    display: inline-flex;
    height: 2rem;
    justify-content: center;
    padding: 0;
    width: 2rem;
  }

  .st-overflowMenu__trigger:hover {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  /* Focus = stratégie d'anatomie partagée (outline DSFR / inset Carbon / ring base). */
  .st-overflowMenu__trigger:focus-visible {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive)));
  }

  .st-overflowMenu__trigger[aria-expanded="true"] {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  /* Flat list/item visual (AC-37, D6): restored origin/main rules. Flat rows
     render inside the child Menu (D5), so these selectors are global —
     component scoping cannot reach child-rendered elements. Cascade panels
     keep their `.st-menu*` styling, scoped to the cascade marker. */
  :global(.st-overflowMenu__list) {
    background: var(--st-component-menu-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-menu-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-menu-radius, 0.375rem);
    box-shadow: var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14));
    display: grid;
    list-style: none;
    margin: 0;
    min-width: var(--st-component-menu-minWidth, 12rem);
    max-width: var(--st-component-menu-maxWidth, 18rem);
    /* Fallback CSS si le calcul JS n'a pas encore posé le max-height inline ;
       overflow-y:auto rend la liste scrollable quand elle dépasse le viewport. */
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    padding: var(--st-spacing-1, 0.25rem);
    position: absolute;
    z-index: var(--st-component-popover-zIndex, 80);
  }

  :global(.st-overflowMenu--bottom-end .st-overflowMenu__list) {
    right: 0;
    top: calc(100% + var(--st-spacing-1, 0.25rem));
  }

  :global(.st-overflowMenu--bottom-start .st-overflowMenu__list) {
    left: 0;
    top: calc(100% + var(--st-spacing-1, 0.25rem));
  }

  :global(.st-overflowMenu--top-end .st-overflowMenu__list) {
    bottom: calc(100% + var(--st-spacing-1, 0.25rem));
    right: 0;
  }

  :global(.st-overflowMenu--top-start .st-overflowMenu__list) {
    bottom: calc(100% + var(--st-spacing-1, 0.25rem));
    left: 0;
  }

  :global(.st-overflowMenu__listItem) {
    margin: 0;
    padding: 0;
  }

  :global(.st-overflowMenu__item) {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-small, 0.375rem);
    color: var(--st-component-menu-text, var(--st-semantic-text-primary));
    cursor: pointer;
    display: flex;
    font: inherit;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
    width: 100%;
  }

  :global(.st-overflowMenu--dense .st-overflowMenu__item) {
    padding: 0.3rem 0.6rem;
  }

  :global(.st-overflowMenu__item:hover:not(:disabled)) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    outline: none;
  }

  :global(.st-overflowMenu__item:focus-visible) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    outline: none;
  }

  :global(.st-overflowMenu__item:disabled) {
    color: var(--st-component-menu-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  :global(.st-overflowMenu__item--danger) {
    color: var(--st-component-overflowMenu-dangerText, var(--st-semantic-feedback-error));
  }

  :global(.st-overflowMenu__item--danger:hover:not(:disabled)) {
    background: var(
      --st-component-overflowMenu-dangerHoverBackground,
      var(--st-semantic-feedback-error)
    );
    color: var(--st-component-overflowMenu-dangerHoverText, var(--st-semantic-action-primaryText));
  }

  :global(.st-overflowMenu__item--danger:focus-visible) {
    background: var(
      --st-component-overflowMenu-dangerHoverBackground,
      var(--st-semantic-feedback-error)
    );
    color: var(--st-component-overflowMenu-dangerHoverText, var(--st-semantic-action-primaryText));
  }

  :global(.st-overflowMenu__itemIcon) {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
  }

  :global(.st-overflowMenu__itemLabel) {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.st-overflowMenu__divider) {
    background: var(--st-component-menu-border, var(--st-semantic-border-subtle));
    height: 1px;
    list-style: none;
    margin: 0.25rem 0;
  }

  :global(.st-overflowMenu__group) {
    color: var(--st-component-menu-groupText, var(--st-semantic-text-muted));
    font-size: 0.72rem;
    font-weight: 650;
    letter-spacing: 0.04em;
    padding: 0.45rem 0.75rem 0.25rem;
    text-transform: uppercase;
    list-style: none;
  }
</style>
