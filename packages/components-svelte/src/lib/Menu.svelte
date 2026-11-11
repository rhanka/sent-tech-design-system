<script lang="ts" module>
  import type { Component } from "svelte";
  import type { SubMenuSide } from "./menu-cascade.js";

  export type MenuIconProps = {
    size?: number | string;
    strokeWidth?: number | string;
    color?: string;
    class?: string;
  } & Record<`data-${string}`, unknown>;

  export type MenuIcon = Component<MenuIconProps> | string;

  export type MenuSubmenuSide = SubMenuSide;

  export interface MenuSelectDetail {
    path: string[];
    item: MenuActionItem;
  }

  export interface MenuActionItem {
    kind?: "item";
    label: string;
    value: string;
    disabled?: boolean;
    danger?: boolean;
    icon?: MenuIcon;
    children?: MenuItem[];
    selected?: boolean;
  }

  export interface MenuDividerItem {
    kind: "divider";
  }

  export interface MenuGroupItem {
    kind: "group";
    label: string;
  }

  export type MenuItem = MenuActionItem | MenuDividerItem | MenuGroupItem;

  let groupIdCounter = 0;
  function nextGroupId(): string {
    groupIdCounter += 1;
    return `st-menu-group-${groupIdCounter}`;
  }

  let menuInstanceCounter = 0;
</script>

<script lang="ts">
  import { ChevronLeft, ChevronRight } from "@lucide/svelte";
  import { getContext, onDestroy, tick, untrack } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import {
    CLOSE_DELAY,
    MENU_HOST_CONTEXT,
    OPEN_DELAY,
    computeSubMenuPosition,
    isCappedSubMenuWidth,
    pointInSafeTriangle,
    resolvePreferredSide,
    toContainingBlockPosition,
    type CascadePoint,
    type MenuHostContext,
    type ResolvedSubMenuSide
  } from "./menu-cascade.js";

  type MenuProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onselect"> & {
    label: string;
    items: MenuItem[];
    open?: boolean;
    dismissOnSelect?: boolean;
    class?: string;
    dense?: boolean;
    submenuSide?: MenuSubmenuSide;
    onselect?: (value: string, detail?: MenuSelectDetail) => void;
    /**
     * Internal class hook for OverflowMenu parity (AC-37). NOT public API and
     * NOT documented: only OverflowMenu sets it. A flat menu then renders the
     * origin/main `st-overflowMenu__*` DOM on the same elements instead of
     * `st-menu*` rows. Cascade branches are unaffected.
     */
    internalOverflowClasses?: boolean;
  };

  let {
    label,
    items,
    open = $bindable(true),
    dismissOnSelect = false,
    class: className,
    dense = false,
    submenuSide = "auto",
    onselect,
    internalOverflowClasses = false,
    ...rest
  }: MenuProps = $props();

  const instanceId = ++menuInstanceCounter;
  const fallbackRootId = `st-menu-${instanceId}`;
  const hostContext = getContext<MenuHostContext | undefined>(MENU_HOST_CONTEXT);
  const isNested = hostContext !== undefined && hostContext !== null;
  const rootId = $derived(
    (rest as { id?: string }).id ?? hostContext?.rootMenuId ?? fallbackRootId
  );

  let host: HTMLElement | undefined = $state();
  // Internal open state is an index path (never keys), so duplicate sibling
  // keys cannot open or close together (§2.3, D7).
  let openPath: number[] = $state([]);
  // Roving tabindex target per level (raw item index); falls back to the
  // first enabled item when unset.
  let roving: number[] = $state([]);
  // Resolved opening side per parent level (drives chevron + opening arrow).
  let levelSides: ResolvedSubMenuSide[] = $state([]);
  let levelPositions: { top: number; left: number; maxHeight?: number; capped: boolean }[] =
    $state([]);

  // Hover timers and triangle apex are intentionally NOT reactive: the
  // `items`-validation $effect below cancels all timers, so tracking them
  // would make every armed hover cancel itself on the next flush (§3.3).
  let openTimer: ReturnType<typeof setTimeout> | undefined = undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined = undefined;
  let closeLevel = -1;
  let safeApex: CascadePoint | null = null;
  let safeLevel = -1;
  let warnedDuplicate = false;
  const warnedDepthKeys = new Set<string>();

  function isAction(item: MenuItem): item is MenuActionItem {
    return item.kind === undefined || item.kind === "item";
  }

  function hasSubMenu(item: MenuItem): item is MenuActionItem & { children: MenuItem[] } {
    return (
      isAction(item) &&
      Array.isArray(item.children) &&
      item.children.length > 0
    );
  }

  function treeHasCascade(list: MenuItem[]): boolean {
    for (const item of list) {
      if (hasSubMenu(item)) return true;
      if (isAction(item) && Array.isArray(item.children)) {
        if (treeHasCascade(item.children)) return true;
      }
    }
    return false;
  }

  const hasCascade = $derived(treeHasCascade(items));

  function keyOf(item: MenuActionItem): string {
    return item.value;
  }

  function levelItems(depth: number): MenuItem[] {
    let list = items;
    for (let d = 0; d < depth; d += 1) {
      const parent = list[openPath[d]];
      if (!parent || !isAction(parent) || !Array.isArray(parent.children)) return [];
      list = parent.children;
    }
    return list;
  }

  function pathKeys(indexPath: number[]): string[] {
    const keys: string[] = [];
    let list = items;
    for (const index of indexPath) {
      const item = list[index];
      if (!item || !isAction(item)) break;
      keys.push(keyOf(item));
      list = Array.isArray(item.children) ? item.children : [];
    }
    return keys;
  }

  function subId(depth: number, index: number): string {
    return `${rootId}--sub-${depth}-${index}`;
  }

  function parentButtonId(depth: number, index: number): string {
    return `${rootId}--parent-${depth}-${index}`;
  }

  function cancelOpenTimer() {
    if (openTimer !== undefined) {
      clearTimeout(openTimer);
      openTimer = undefined;
    }
  }

  function cancelCloseTimer() {
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
    closeLevel = -1;
  }

  function cancelAllTimers() {
    cancelOpenTimer();
    cancelCloseTimer();
    safeApex = null;
    safeLevel = -1;
  }

  onDestroy(cancelAllTimers);

  function levelRootEl(level: number): Element | null {
    if (!host) return null;
    // The flat root IS its own level 0 element (querySelector skips self).
    if (host.matches(`[data-menu-level="${level}"]`)) return host;
    return host.querySelector(`[data-menu-level="${level}"]`);
  }

  function levelButtons(level: number): HTMLButtonElement[] {
    const levelRoot = levelRootEl(level);
    if (!levelRoot) return [];
    return Array.from(
      levelRoot.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
    );
  }

  function rawIndexOf(button: HTMLButtonElement): number {
    const raw = button.getAttribute("data-item-index");
    return raw === null ? -1 : Number(raw);
  }

  function firstEnabledIndex(list: MenuItem[]): number {
    for (let i = 0; i < list.length; i += 1) {
      const item = list[i];
      if (isAction(item) && !item.disabled) return i;
    }
    return -1;
  }

  function rovingTarget(depth: number, list: MenuItem[]): number {
    const stored = roving[depth];
    if (
      stored !== undefined &&
      list[stored] !== undefined &&
      isAction(list[stored]) &&
      !(list[stored] as MenuActionItem).disabled
    ) {
      return stored;
    }
    return firstEnabledIndex(list);
  }

  function focusButton(level: number, index: number) {
    const levelRoot = levelRootEl(level);
    const button = levelRoot?.querySelector<HTMLButtonElement>(
      `[data-item-index="${index}"]`
    );
    roving[level] = index;
    button?.focus();
  }

  function focusFirstEnabled(level: number): boolean {
    const buttons = levelButtons(level);
    if (buttons.length === 0) return false;
    roving[level] = rawIndexOf(buttons[0]);
    buttons[0].focus();
    return true;
  }

  function focusLevelIndex(buttons: HTMLButtonElement[], at: number, level: number) {
    if (buttons.length === 0) return;
    const size = buttons.length;
    const target = ((at % size) + size) % size;
    roving[level] = rawIndexOf(buttons[target]);
    buttons[target].focus();
  }

  function schedulePositions() {
    tick().then(() => {
      computeAllPositions();
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => {
          computeAllPositions();
        });
      }
    });
  }

  function findContainingBlock(element: HTMLElement): HTMLElement | null {
    let node: HTMLElement | null = element.parentElement;
    while (node) {
      const style = getComputedStyle(node);
      const transform = style.transform;
      const filter = style.filter;
      const perspective = style.perspective;
      const contain = style.contain;
      const willChange = style.willChange;
      if (
        (transform && transform !== "none") ||
        (filter && filter !== "none") ||
        (perspective && perspective !== "none") ||
        (contain && /layout|paint|strict|content/.test(contain)) ||
        (willChange && /transform|filter|perspective/.test(willChange))
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function computeLevelPosition(level: number) {
    if (!host || typeof window === "undefined") return;
    const parentIndex = openPath[level - 1];
    if (parentIndex === undefined) return;
    const levelRoot = levelRootEl(level - 1);
    const panel = levelRootEl(level);
    const button = levelRoot?.querySelector(
      `[data-item-index="${parentIndex}"]`
    );
    if (!levelRoot || !panel || !button) return;
    const menuRect = levelRoot.getBoundingClientRect();
    const itemRect = button.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const solved = computeSubMenuPosition({
      parentMenuRect: { left: menuRect.left, right: menuRect.right },
      parentItemRect: { top: itemRect.top },
      panelSize: { width: panelRect.width, height: panelRect.height },
      viewport: { width: vw, height: vh },
      preferredSide: submenuSide
    });
    const block = findContainingBlock(panel as HTMLElement);
    const converted = toContainingBlockPosition(
      { top: solved.top, left: solved.left },
      block ? block.getBoundingClientRect() : null
    );
    levelSides[level - 1] = solved.side;
    levelPositions[level - 1] = {
      top: converted.top,
      left: converted.left,
      maxHeight: solved.maxHeight,
      capped: isCappedSubMenuWidth(panelRect.width, vw)
    };
  }

  function computeAllPositions() {
    if (!host || openPath.length === 0) return;
    for (let level = 1; level <= openPath.length; level += 1) {
      computeLevelPosition(level);
    }
  }

  function closeDeepestFrom(level: number, focusParent: boolean) {
    cancelAllTimers();
    const parentLevel = level - 1;
    const parentIndex = openPath[parentLevel];
    openPath = openPath.slice(0, parentLevel);
    if (focusParent && parentIndex !== undefined) {
      focusButton(parentLevel, parentIndex);
    }
  }

  function closeAll(focusTrigger: boolean) {
    cancelAllTimers();
    openPath = [];
    if (isNested) {
      if (hasCascade) hostContext?.requestClose({ focusTrigger });
    } else if (dismissOnSelect) {
      open = false;
    }
  }

  function indexPathFor(depth: number, index: number): number[] {
    return [...openPath.slice(0, depth), index];
  }

  function selectItem(item: MenuActionItem, fullPath: number[], modality: "pointer" | "keyboard") {
    if (item.disabled) return;
    const cascade = treeHasCascade(items);
    if (cascade) {
      onselect?.(item.value, { path: pathKeys(fullPath), item });
    } else {
      // Flat menus keep the legacy single-argument call (AC-01).
      onselect?.(item.value);
    }
    cancelAllTimers();
    openPath = [];
    if (isNested) {
      if (cascade) hostContext?.requestClose({ focusTrigger: modality === "keyboard" });
    } else if (dismissOnSelect) {
      open = false;
    }
  }

  function openParent(depth: number, index: number, focusFirst: boolean) {
    cancelAllTimers();
    openPath = [...openPath.slice(0, depth), index];
    schedulePositions();
    if (focusFirst) {
      tick().then(() => {
        // No enabled item: focus stays on the parent line (§3.2).
        focusFirstEnabled(depth + 1);
      });
    }
  }

  function toggleParent(depth: number, index: number) {
    cancelAllTimers();
    if (openPath[depth] === index && openPath.length > depth) {
      // Second click closes that level and deeper; focus unchanged (AC-29).
      openPath = openPath.slice(0, depth);
    } else {
      openPath = [...openPath.slice(0, depth), index];
      schedulePositions();
    }
  }

  function isMouseEvent(event: Event): boolean {
    return (event as PointerEvent).pointerType === "mouse";
  }

  function triangleForLevel(level: number): [CascadePoint, CascadePoint, CascadePoint] | null {
    if (!host || safeApex === null || safeLevel !== level) return null;
    const panel = levelRootEl(level + 1);
    if (!panel) return null;
    const rect = panel.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0 && rect.left === 0 && rect.right === 0) {
      return null;
    }
    const side: ResolvedSubMenuSide = levelSides[level] ?? resolvePreferredSide(submenuSide);
    const edgeX = side === "right" ? rect.left : rect.right;
    return [
      { x: safeApex.x, y: safeApex.y },
      { x: edgeX, y: rect.top - 4 },
      { x: edgeX, y: rect.bottom + 4 }
    ];
  }

  function pointInActiveTriangle(level: number, point: CascadePoint): boolean {
    const triangle = triangleForLevel(level);
    if (!triangle) return false;
    return pointInSafeTriangle(point, triangle[0], triangle[1], triangle[2]);
  }

  function armClose(level: number) {
    cancelCloseTimer();
    closeLevel = level;
    closeTimer = setTimeout(() => {
      const active = document.activeElement;
      const closingRoots = host?.querySelectorAll(`[data-menu-level="${level + 1}"]`);
      openPath = openPath.slice(0, level);
      safeApex = null;
      safeLevel = -1;
      // Focus inside a pointer-closed level moves to its parent line (§3.3).
      if (active && closingRoots) {
        for (const root of closingRoots) {
          if (root.contains(active)) {
            const parentIndex = openPath[level - 1];
            if (parentIndex !== undefined) focusButton(level - 1, parentIndex);
            break;
          }
        }
      }
      closeTimer = undefined;
      closeLevel = -1;
    }, CLOSE_DELAY);
  }

  function onParentPointerEnter(depth: number, index: number, event: Event) {
    if (!isMouseEvent(event) || !hasCascade) return;
    const pointer = event as PointerEvent;
    // Safe-triangle priority: crossings during the diagonal arm nothing (§3.3).
    if (pointInActiveTriangle(depth, { x: pointer.clientX, y: pointer.clientY })) return;
    cancelCloseTimer();
    cancelOpenTimer();
    openTimer = setTimeout(() => {
      openTimer = undefined;
      openPath = [...openPath.slice(0, depth), index];
      schedulePositions();
    }, OPEN_DELAY);
  }

  function onLeafPointerEnter(depth: number, event: Event) {
    if (!isMouseEvent(event) || !hasCascade) return;
    const pointer = event as PointerEvent;
    if (pointInActiveTriangle(depth, { x: pointer.clientX, y: pointer.clientY })) return;
    cancelOpenTimer();
    // Another branch open at this level: arm its close (§3.3 step 2).
    if (openPath.length > depth) {
      armClose(depth);
    }
  }

  function onParentPointerLeave(depth: number, index: number, event: Event) {
    if (!isMouseEvent(event) || !hasCascade) return;
    if (openPath[depth] !== index) return;
    const pointer = event as PointerEvent;
    // Record the exit point as the triangle apex (§3.3 step 3, D9).
    safeApex = { x: pointer.clientX, y: pointer.clientY };
    safeLevel = depth;
    armClose(depth);
  }

  function onHostPointerMove(event: Event) {
    if (!isMouseEvent(event) || !hasCascade || safeApex === null) return;
    const pointer = event as PointerEvent;
    const point = { x: pointer.clientX, y: pointer.clientY };
    const triangle = triangleForLevel(safeLevel);
    if (!triangle) return;
    // Test first, then refresh the apex (D9).
    if (pointInSafeTriangle(point, triangle[0], triangle[1], triangle[2])) {
      cancelCloseTimer();
      safeApex = point;
    }
  }

  function onPanelPointerEnter(event: Event) {
    if (!isMouseEvent(event) || !hasCascade) return;
    cancelAllTimers();
  }

  function onPanelPointerLeave(depth: number, event: Event) {
    if (!isMouseEvent(event) || !hasCascade) return;
    armClose(depth);
  }

  function openingArrow(): string {
    const side = resolvePreferredSide(submenuSide);
    return side === "right" ? "ArrowRight" : "ArrowLeft";
  }

  function resolvedSideFor(depth: number, index: number): ResolvedSubMenuSide {
    if (openPath[depth] === index && openPath.length > depth && levelSides[depth] !== undefined) {
      return levelSides[depth];
    }
    return resolvePreferredSide(submenuSide);
  }

  function onItemKeyDown(
    event: KeyboardEvent,
    depth: number,
    index: number,
    item: MenuActionItem
  ) {
    const levelRoot = levelRootEl(depth);
    const buttons = levelRoot
      ? Array.from(
          levelRoot.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
        )
      : [];
    const current = buttons.indexOf(event.currentTarget as HTMLButtonElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusLevelIndex(buttons, current + 1, depth);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusLevelIndex(buttons, current - 1, depth);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusLevelIndex(buttons, 0, depth);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusLevelIndex(buttons, buttons.length - 1, depth);
      return;
    }
    if (item.disabled) return;
    // The opening arrow follows the resolved (possibly flipped) side (§3.4).
    const resolved = hasSubMenu(item) ? resolvedSideFor(depth, index) : openingArrow() === "ArrowRight" ? "right" : "left";
    const opening = resolved === "right" ? "ArrowRight" : "ArrowLeft";
    const opposite = opening === "ArrowRight" ? "ArrowLeft" : "ArrowRight";
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (hasSubMenu(item) && depth < 2) {
        // Enter/Space on a parent opens and focuses the first enabled item.
        openParent(depth, index, true);
      } else {
        selectItem(item, indexPathFor(depth, index), "keyboard");
      }
      return;
    }
    if (event.key === opening) {
      if (hasSubMenu(item) && depth < 2) {
        event.preventDefault();
        if (openPath[depth] === index && openPath.length > depth) {
          // Already open: focus first enabled without closing (AC-30).
          focusFirstEnabled(depth + 1);
        } else {
          openParent(depth, index, true);
        }
      }
      return;
    }
    if (event.key === opposite) {
      if (depth >= 1) {
        // Opposite arrow in a sub-menu closes it and refocuses the parent.
        event.preventDefault();
        closeDeepestFrom(depth, true);
      } else if (hasCascade && openPath[0] === index && openPath.length > 0) {
        event.preventDefault();
        cancelAllTimers();
        openPath = [];
      }
    }
  }

  function onLevelKeyDown(event: KeyboardEvent, depth: number) {
    if (!hasCascade) return;
    if (event.key === "Escape") {
      if (depth >= 1) {
        // Esc closes that level only, then stops the host close (D4).
        event.preventDefault();
        event.stopPropagation();
        closeDeepestFrom(depth, true);
        return;
      }
      if (openPath.length > 0) {
        // Esc on the root line with a sub-menu open closes the deepest level.
        event.preventDefault();
        event.stopPropagation();
        cancelAllTimers();
        const parentLevel = openPath.length - 1;
        const parentIndex = openPath[parentLevel];
        openPath = openPath.slice(0, parentLevel);
        if (parentIndex !== undefined) focusButton(parentLevel, parentIndex);
        return;
      }
      // Esc at the root closes everything; the root close stays governed by
      // `dismissOnSelect` for standalone menus (§3.6).
      if (isNested || dismissOnSelect) {
        event.preventDefault();
        event.stopPropagation();
        closeAll(true);
      }
      return;
    }
    if (event.key === "Tab") {
      // Tab closes everything and lets focus leave the menu (no trap, AC-32).
      closeAll(false);
    }
  }

  function onWindowKeydown(event: KeyboardEvent) {
    // A level handler already consumed this key (D4).
    if (event.defaultPrevented) return;
    // A host owns the global close for nested cascade menus.
    if (isNested && treeHasCascade(items)) return;
    if (event.key === "Escape" && open && dismissOnSelect) {
      event.preventDefault();
      cancelAllTimers();
      openPath = [];
      open = false;
    }
  }

  function onWindowPointerDown(event: MouseEvent) {
    if (event.defaultPrevented) return;
    if (isNested && treeHasCascade(items)) return;
    if (!open || !dismissOnSelect) return;
    const composed = event as MouseEvent & { composedPath?: () => EventTarget[] };
    const path = typeof composed.composedPath === "function" ? composed.composedPath() : [];
    const target = event.target as Node | null;
    const inside =
      host !== undefined &&
      (path.length > 0 ? path.includes(host) : Boolean(target && host.contains(target)));
    if (!inside) {
      cancelAllTimers();
      openPath = [];
      open = false;
    }
  }

  function scanTreeWarnings(list: MenuItem[], depth: number) {
    const seen = new Set<string>();
    for (const item of list) {
      if (!isAction(item)) continue;
      const key = keyOf(item);
      if (seen.has(key) && !warnedDuplicate) {
        warnedDuplicate = true;
        console.warn(`[Menu] duplicate sibling key "${key}": open state follows the index path.`);
      }
      seen.add(key);
      if (depth >= 2 && hasSubMenu(item) && !warnedDepthKeys.has(key)) {
        warnedDepthKeys.add(key);
        console.warn(
          `[Menu] item "${key}" is nested deeper than two sub-menu levels and renders as a leaf.`
        );
      }
      if (isAction(item) && Array.isArray(item.children)) {
        scanTreeWarnings(item.children, depth + 1);
      }
    }
  }

  // `items` (or the preferred side) changing removes orphan panels and
  // cancels every pending hover timer (§3.2, AC-22, AC-38).
  $effect(() => {
    void items;
    void submenuSide;
    cancelAllTimers();
    const previous = untrack(() => openPath);
    let list = items;
    const kept: number[] = [];
    for (const index of previous) {
      const item = list[index];
      if (!item || !hasSubMenu(item)) break;
      kept.push(index);
      list = item.children;
    }
    if (kept.length !== previous.length) {
      openPath = kept;
    }
    untrack(() => scanTreeWarnings(items, 0));
  });

  // Let the host know a cascade is present (focus-return + shadow decisions).
  $effect(() => {
    if (isNested && treeHasCascade(items)) {
      hostContext?.setHasCascade?.(true);
    }
  });

  // Recompute every open level against its own parent rect on scroll/resize,
  // plus one recompute after mount once the real panel size is known (§3.4).
  $effect(() => {
    if (!open || openPath.length === 0) return;
    schedulePositions();
    const recompute = () => computeAllPositions();
    window.addEventListener("scroll", recompute, true);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", recompute, true);
      window.removeEventListener("resize", recompute);
    };
  });

  const classes = () =>
    [
      "st-menu",
      dense ? "st-menu--dense" : null,
      hasCascade ? "st-menu--hasCascade" : null,
      className
    ]
      .filter(Boolean)
      .join(" ");

  // Origin/main OverflowMenu flat root class set (AC-37). Dense stays on the
  // host (`st-overflowMenu--dense`); the list itself carries no modifier.
  const overflowClasses = () =>
    ["st-overflowMenu__list", className].filter(Boolean).join(" ");

  // The host pins the panel box through `style` (absolute per placement plus
  // the `--st-menu-maxHeight` viewport cap). The overflow list consumes that
  // cap as a real `max-height`, mirroring the origin/main inline cap.
  function overflowPanelStyle(): string {
    const raw = (rest as { style?: unknown }).style;
    const cap = "max-height: var(--st-menu-maxHeight, calc(100vh - 2rem));";
    return typeof raw === "string" && raw.length > 0 ? `${raw} ${cap}` : cap;
  }

  function panelStyle(depth: number): string | undefined {
    const position = levelPositions[depth];
    if (!position) return undefined;
    let style = `top: ${position.top}px; left: ${position.left}px;`;
    if (position.maxHeight !== undefined) style += ` max-height: ${position.maxHeight}px;`;
    if (position.capped) style += " min-width: 0; max-width: calc(100vw - 16px);";
    return style;
  }

  function chevronSide(depth: number, index: number): ResolvedSubMenuSide {
    return resolvedSideFor(depth, index);
  }
</script>

<svelte:window onkeydown={onWindowKeydown} onpointerdown={onWindowPointerDown} />

{#snippet menurows(list: MenuItem[], depth: number)}
  {#each list as item, index (index)}
    {#if isAction(item)}
      {@const Icon = item.icon}
      {@const isParent = hasSubMenu(item) && depth < 2}
      {@const isOpen = openPath[depth] === index && openPath.length > depth}
      {@const selected = Boolean(item.selected) || isOpen}
      {@const tabIndex = rovingTarget(depth, list) === index ? 0 : -1}
      {#if isParent}
        <div
          class="st-menu__itemWrap"
          role="presentation"
          onpointerenter={(event) => {
            if (!item.disabled) onParentPointerEnter(depth, index, event);
          }}
          onpointerleave={(event) => {
            if (!item.disabled) onParentPointerLeave(depth, index, event);
          }}
        >
          <button
            class="st-menu__item st-menu__item--hasSubmenu"
            class:st-menu__item--danger={item.danger}
            class:st-menu__item--selected={selected}
            type="button"
            role="menuitem"
            id={parentButtonId(depth, index)}
            data-item-index={index}
            aria-haspopup="menu"
            aria-expanded={item.disabled ? "false" : isOpen ? "true" : "false"}
            aria-controls={subId(depth, index)}
            aria-disabled={item.disabled ? "true" : undefined}
            disabled={item.disabled}
            tabindex={item.disabled ? undefined : tabIndex}
            onclick={() => {
              if (!item.disabled) toggleParent(depth, index);
            }}
            onkeydown={(event) => onItemKeyDown(event, depth, index, item)}
            onfocus={() => {
              roving[depth] = index;
            }}
          >
            {#if chevronSide(depth, index) === "left"}
              <span class="st-menu__itemChevron st-menu__itemChevron--start" aria-hidden="true">
                <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
              </span>
            {/if}
            {#if Icon}
              <span class="st-menu__itemIcon" aria-hidden="true">
                {#if typeof Icon === "string"}
                  {Icon}
                {:else}
                  <Icon size={16} strokeWidth={2} />
                {/if}
              </span>
            {/if}
            <span class="st-menu__itemLabel">{item.label}</span>
            {#if chevronSide(depth, index) === "right"}
              <span class="st-menu__itemChevron st-menu__itemChevron--end" aria-hidden="true">
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
              </span>
            {/if}
          </button>
        </div>
      {:else}
        <button
          class="st-menu__item"
          class:st-menu__item--danger={item.danger}
          class:st-menu__item--selected={selected}
          type="button"
          role="menuitem"
          data-item-index={index}
          aria-disabled={item.disabled ? "true" : undefined}
          disabled={item.disabled}
          tabindex={item.disabled ? undefined : tabIndex}
          onclick={() => selectItem(item, indexPathFor(depth, index), "pointer")}
          onkeydown={(event) => onItemKeyDown(event, depth, index, item)}
          onpointerenter={(event) => onLeafPointerEnter(depth, event)}
          onfocus={() => {
            roving[depth] = index;
          }}
        >
          {#if Icon}
            <span class="st-menu__itemIcon" aria-hidden="true">
              {#if typeof Icon === "string"}
                {Icon}
              {:else}
                <Icon size={16} strokeWidth={2} />
              {/if}
            </span>
          {/if}
          <span class="st-menu__itemLabel">{item.label}</span>
        </button>
      {/if}
    {:else if item.kind === "divider"}
      <div class="st-menu__divider" role="separator" aria-hidden="true"></div>
    {:else}
      {@const groupId = nextGroupId()}
      <div
        class="st-menu__group"
        id={groupId}
        role="presentation"
      >
        {item.label}
      </div>
    {/if}
  {/each}
{/snippet}

{#snippet overflowrows(list: MenuItem[], depth: number)}
  {#each list as item, index (index)}
    {#if isAction(item)}
      {@const Icon = item.icon}
      {@const tabIndex = rovingTarget(depth, list) === index ? 0 : -1}
      <li role="none" class="st-overflowMenu__listItem">
        <button
          class="st-overflowMenu__item"
          class:st-overflowMenu__item--danger={item.danger}
          type="button"
          role="menuitem"
          data-item-index={index}
          aria-disabled={item.disabled ? "true" : undefined}
          disabled={item.disabled}
          tabindex={item.disabled ? undefined : tabIndex}
          onclick={() => selectItem(item, indexPathFor(depth, index), "pointer")}
          onkeydown={(event) => onItemKeyDown(event, depth, index, item)}
          onpointerenter={(event) => onLeafPointerEnter(depth, event)}
          onfocus={() => {
            roving[depth] = index;
          }}
        >
          {#if Icon}
            <span class="st-overflowMenu__itemIcon" aria-hidden="true">
              {#if typeof Icon === "string"}
                {Icon}
              {:else}
                <Icon size={16} strokeWidth={2} />
              {/if}
            </span>
          {/if}
          <span class="st-overflowMenu__itemLabel">{item.label}</span>
        </button>
      </li>
    {:else if item.kind === "divider"}
      <li role="separator" aria-hidden="true" class="st-overflowMenu__divider"></li>
    {:else}
      <li role="presentation" class="st-overflowMenu__group">{item.label}</li>
    {/if}
  {/each}
{/snippet}

{#if open}
  {#if hasCascade}
    <!-- The root menu id lives on the inner role=menu list (not the outer
         host) so host aria-controls resolves to the menu itself (§2.2). -->
    <div
      {...rest}
      id={undefined}
      bind:this={host}
      class={classes()}
      onpointermove={onHostPointerMove}
    >
      <div
        class="st-menu__scroll"
        role="menu"
        id={rootId}
        aria-label={label}
        tabindex="-1"
        data-menu-level="0"
        onkeydown={(event) => onLevelKeyDown(event, 0)}
      >
        {@render menurows(items, 0)}
      </div>
      {#if openPath.length >= 1 && isAction(items[openPath[0]]) && Array.isArray((items[openPath[0]] as MenuActionItem).children)}
        {@const level1 = (items[openPath[0]] as MenuActionItem).children as MenuItem[]}
        <div
          class={["st-menu", "st-menu--submenu", dense ? "st-menu--dense" : null]
            .filter(Boolean)
            .join(" ")}
          role="menu"
          id={subId(0, openPath[0])}
          aria-labelledby={parentButtonId(0, openPath[0])}
          tabindex="-1"
          data-menu-level="1"
          style={panelStyle(0)}
          onkeydown={(event) => onLevelKeyDown(event, 1)}
          onpointerenter={onPanelPointerEnter}
          onpointerleave={(event) => onPanelPointerLeave(0, event)}
        >
          {@render menurows(level1, 1)}
        </div>
      {/if}
      {#if openPath.length >= 2}
        {@const mid = (levelItems(1)[openPath[1]] as MenuActionItem | undefined)?.children as MenuItem[] | undefined}
        {#if mid}
          <div
            class={["st-menu", "st-menu--submenu", dense ? "st-menu--dense" : null]
              .filter(Boolean)
              .join(" ")}
            role="menu"
            id={subId(1, openPath[1])}
            aria-labelledby={parentButtonId(1, openPath[1])}
            tabindex="-1"
            data-menu-level="2"
            style={panelStyle(1)}
            onkeydown={(event) => onLevelKeyDown(event, 2)}
            onpointerenter={onPanelPointerEnter}
            onpointerleave={(event) => onPanelPointerLeave(1, event)}
          >
            {@render menurows(mid, 2)}
          </div>
        {/if}
      {/if}
    </div>
  {:else if internalOverflowClasses}
    <!-- Overflow host parity (AC-37): origin/main `st-overflowMenu__*` flat DOM
         on the same elements (`ul > li` list, item buttons, icon/label spans,
         divider/group rows). Only reachable when the internal hook is set, so
         standalone Menu DOM is unchanged (AC-01). -->
    <ul
      {...(rest as unknown as Omit<HTMLAttributes<HTMLUListElement>, "class">)}
      id={rootId}
      bind:this={host}
      class={overflowClasses()}
      role="menu"
      aria-label={label}
      data-menu-level="0"
      style={overflowPanelStyle()}
    >
      {@render overflowrows(items, 0)}
    </ul>
  {:else}
    <div
      {...rest}
      id={rootId}
      bind:this={host}
      class={classes()}
      role="menu"
      aria-label={label}
      data-menu-level="0"
    >
      {@render menurows(items, 0)}
    </div>
  {/if}
{/if}

<style>
  .st-menu {
    background: var(--st-component-menu-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-menu-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-menu-radius, 0.375rem);
    box-shadow: var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14));
    color: var(--st-component-menu-text, var(--st-semantic-text-primary));
    display: grid;
    min-width: var(--st-component-menu-minWidth, 12rem);
    max-width: var(--st-component-menu-maxWidth, 18rem);
    /* Scroll quand la liste dépasse le viewport (ex: 24+ thèmes) plutôt que de
       déborder hors de l'écran. */
    max-height: var(--st-menu-maxHeight, 80vh);
    overflow-y: auto;
    padding: var(--st-spacing-1, 0.25rem);
  }

  /* Cascade marker: the root panel escapes the root scroll container, so it
     must not clip the fixed sub-menu panels; both root and sub-menu panels
     use the popover shadow chain (§5, D12). */
  .st-menu--hasCascade {
    box-shadow: var(
      --st-component-popover-shadow,
      var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14))
    );
    overflow: visible;
  }

  .st-menu__scroll {
    display: grid;
    max-height: var(--st-menu-maxHeight, 80vh);
    overflow-y: auto;
  }

  .st-menu--submenu {
    box-shadow: var(
      --st-component-popover-shadow,
      var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14))
    );
    max-height: var(--st-menu-maxHeight, 80vh);
    overflow-y: auto;
    position: fixed;
    z-index: calc(var(--st-component-popover-zIndex, 80) + 2);
  }

  .st-menu__itemWrap {
    position: relative;
  }

  .st-menu__item {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-radius-small, 0.375rem);
    color: inherit;
    cursor: pointer;
    display: flex;
    font: inherit;
    font-size: var(--st-component-menu-fontSize, 0.875rem);
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
    width: 100%;
  }

  .st-menu--dense .st-menu__item {
    padding: 0.3rem 0.6rem;
  }

  .st-menu__item:hover:not(:disabled),
  .st-menu__item:focus-visible {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    outline: none;
  }

  .st-menu__item:disabled {
    color: var(--st-component-menu-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-menu__item--danger {
    color: var(--st-component-menu-dangerText, var(--st-semantic-feedback-error));
  }

  .st-menu__item--danger:hover:not(:disabled),
  .st-menu__item--danger:focus-visible {
    background: var(
      --st-component-menu-dangerHoverBackground,
      var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle))
    );
  }

  /* Selected parent line / `selected: true`: existing selectableRow tokens,
     same no-color-mix fallback strategy as SelectableRow (no accent bar). */
  .st-menu__item--selected {
    background: var(
      --st-component-selectableRow-selectedBackground,
      color-mix(in oklch, var(--st-semantic-action-primary, #2563eb) 12%, transparent)
    );
    color: var(
      --st-component-selectableRow-selectedText,
      color-mix(in oklch, var(--st-semantic-action-primary, #2563eb) 78%, black)
    );
  }

  @supports not (color: color-mix(in oklch, red, blue)) {
    .st-menu__item--selected {
      background: var(
        --st-component-selectableRow-selectedBackground,
        var(--st-semantic-surface-subtle, #eef2ff)
      );
      color: var(
        --st-component-selectableRow-selectedText,
        var(--st-semantic-text-primary, #0f172a)
      );
    }
  }

  .st-menu__itemIcon {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
    width: 1rem;
  }

  .st-menu__itemChevron {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
  }

  .st-menu__itemChevron--end {
    margin-left: auto;
  }

  .st-menu__itemChevron--start {
    margin-right: auto;
    order: -1;
  }

  .st-menu__itemChevron--start + .st-menu__itemIcon {
    order: 0;
  }

  .st-menu__itemLabel {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .st-menu__divider {
    background: var(--st-component-menu-border, var(--st-semantic-border-subtle));
    height: 1px;
    margin: 0.25rem 0;
  }

  .st-menu__group {
    color: var(--st-component-menu-groupText, var(--st-semantic-text-muted));
    font-size: 0.72rem;
    font-weight: 650;
    letter-spacing: 0.04em;
    padding: 0.45rem 0.75rem 0.25rem;
    text-transform: uppercase;
  }
</style>
