import { ChevronLeft, ChevronRight } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import {
  CLOSE_DELAY,
  MenuHostContext,
  OPEN_DELAY,
  computeSubMenuPosition,
  isCappedSubMenuWidth,
  pointInSafeTriangle,
  resolvePreferredSide,
  toContainingBlockPosition,
  type CascadePoint,
  type MenuHostContextValue,
  type ResolvedSubMenuSide,
  type SubMenuSide,
} from "./menu-cascade.js";
import type { ComponentChildren, TargetedKeyboardEvent, TargetedPointerEvent } from "./runtime.js";

type ActionItem = { id?: string; value?: string; label: ComponentChildren; disabled?: boolean; variant?: "default" | "danger"; danger?: boolean; icon?: ComponentChildren; onClick?: () => void }

// Normalises an action item so the rest of the component only deals with the
// React-native shape: `variant` (from variant|danger).
function isDangerAction(item: { variant?: "default" | "danger"; danger?: boolean }): boolean {
  return item.variant === "danger" || item.danger === true;
}

export interface MenuActionItem extends ActionItem {
  children?: MenuItem[];
  selected?: boolean;
}
// `kind` (Svelte-canonical) is accepted as an alias of `type`. Svelte groups
// are flat (label-only, no nested `items`); React groups may nest `items`.
export type MenuDividerItem = { type?: "divider"; kind?: "divider"; id?: string }
export type MenuGroupItem = { type?: "group"; kind?: "group"; id?: string; label: ComponentChildren; items?: MenuActionItem[] }
export type MenuItem = MenuActionItem | MenuDividerItem | MenuGroupItem;

function itemKind(item: MenuItem): string | undefined {
  const tagged = item as { type?: string; kind?: string }
  return tagged.type ?? tagged.kind;
}
function isDivider(item: MenuItem): item is MenuDividerItem {
  return itemKind(item) === "divider";
}
function isGroup(item: MenuItem): item is MenuGroupItem {
  return itemKind(item) === "group";
}
function isAction(item: MenuItem): item is MenuActionItem {
  return !isDivider(item) && !isGroup(item);
}
function hasSubMenu(item: MenuItem): item is MenuActionItem & { children: MenuItem[] } {
  return isAction(item) && Array.isArray(item.children) && item.children.length > 0;
}

/** React key derivation (§2.3): `id ?? value`, fallback `String(label)` text
 * (scalar labels only), then row index. */
function keyOf(item: MenuActionItem, rowIndex: number): string {
  const base = item.id ?? item.value;
  if (base !== undefined) return base;
  if (typeof item.label === "string" || typeof item.label === "number") return String(item.label);
  return String(rowIndex);
}

export function treeHasCascade(list: MenuItem[]): boolean {
  for (const entry of list) {
    if (hasSubMenu(entry)) return true;
    if (isAction(entry) && Array.isArray(entry.children) && treeHasCascade(entry.children)) return true;
    if (isGroup(entry)) {
      for (const child of entry.items ?? []) {
        if (Array.isArray(child.children) && child.children.length > 0) return true;
        if (Array.isArray(child.children) && treeHasCascade(child.children)) return true;
      }
    }
  }
  return false;
}

type MenuRow =
  | { kind: "divider" }
  | { kind: "group"; label: ComponentChildren }
  | { kind: "action"; item: MenuActionItem }

/** A level renders matching the Svelte row model: group labels are rows and
 * any nested group `items` flatten into sibling rows of the same level. */
function buildRows(list: MenuItem[]): MenuRow[] {
  const rows: MenuRow[] = [];
  for (const entry of list) {
    if (isDivider(entry)) rows.push({ kind: "divider" });
    else if (isGroup(entry)) {
      rows.push({ kind: "group", label: entry.label });
      for (const child of entry.items ?? []) rows.push({ kind: "action", item: child });
    } else rows.push({ kind: "action", item: entry as MenuActionItem });
  }
  return rows;
}

export type MenuSubmenuSide = SubMenuSide;

let menuInstanceCounter = 0;

export type MenuProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  items: MenuItem[];
  dense?: boolean;
  /** Preferred side for sub-menu panels; `auto` prefers right (D2, §2.2). */
  submenuSide?: MenuSubmenuSide;
  /** Leaf selection. Cascade/nested menus pass `(item, path)` where `path`
   * holds the ancestor keys plus the leaf key; standalone flat menus call
   * with a single argument (AC-01). */
  onSelect?: (item: MenuActionItem, path?: string[]) => void;
};

export function Menu({ items, dense = false, submenuSide = "auto", onSelect, className, role, id, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...rest }: MenuProps) {
  const hostContext = useContext(MenuHostContext);
  const isNested = hostContext !== null;
  const fallbackIdRef = useRef("");
  if (fallbackIdRef.current === "") {
    menuInstanceCounter += 1;
    fallbackIdRef.current = `st-menu-${menuInstanceCounter}`;
  }
  const rootId = hostContext?.rootMenuId ?? id ?? fallbackIdRef.current;

  // Internal open state is an index path (never keys), so duplicate sibling
  // keys cannot open or close together (§2.3, D7).
  const [openPath, setOpenPath] = useState<number[]>([]);
  // Roving tabindex target per level (row index).
  const [roving, setRoving] = useState<number[]>([]);
  // Resolved opening side per parent level (drives chevron + opening arrow).
  const [levelSides, setLevelSides] = useState<ResolvedSubMenuSide[]>([]);
  const [levelPositions, setLevelPositions] = useState<
    { top: number; left: number; maxHeight?: number; capped: boolean }[]
  >([]);

  // Hover timers and triangle apex are intentionally NOT reactive state: the
  // `items`-validation effect below cancels all timers, so tracking them
  // would make every armed hover cancel itself on the next flush (§3.3).
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeLevelRef = useRef(-1);
  const safeApexRef = useRef<CascadePoint | null>(null);
  const safeLevelRef = useRef(-1);
  const warnedDuplicateRef = useRef(false);
  const warnedDepthKeysRef = useRef<Set<string>>(new Set());
  const destroyedRef = useRef(false);
  const rafIdRef = useRef<number | undefined>(undefined);
  const pendingFocusLevelRef = useRef<number | null>(null);
  const levelElsRef = useRef<Map<number, HTMLElement>>(new Map());

  const hasCascade = treeHasCascade(items);

  function levelList(depth: number): MenuItem[] {
    let list = items;
    for (let d = 0; d < depth; d += 1) {
      const parentIndex = openPath[d];
      if (parentIndex === undefined) return [];
      const row = buildRows(list)[parentIndex];
      if (!row || row.kind !== "action" || !Array.isArray(row.item.children)) return [];
      list = row.item.children;
    }
    return list;
  }

  function indexPathFor(depth: number, index: number): number[] {
    return [...openPath.slice(0, depth), index];
  }

  function pathKeys(indexPath: number[]): string[] {
    const keys: string[] = [];
    let list = items;
    for (const index of indexPath) {
      const row = buildRows(list)[index];
      if (!row || row.kind !== "action") break;
      keys.push(keyOf(row.item, index));
      list = Array.isArray(row.item.children) ? row.item.children : [];
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
    if (openTimerRef.current !== undefined) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = undefined;
    }
  }

  function cancelCloseTimer() {
    if (closeTimerRef.current !== undefined) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
    closeLevelRef.current = -1;
  }

  function cancelAllTimers() {
    cancelOpenTimer();
    cancelCloseTimer();
    safeApexRef.current = null;
    safeLevelRef.current = -1;
  }

  function cancelDeferredPositions() {
    if (rafIdRef.current !== undefined && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = undefined;
    }
  }

  useEffect(() => {
    destroyedRef.current = false;
    return () => {
      destroyedRef.current = true;
      cancelAllTimers();
      cancelDeferredPositions();
    }
  }, []);

  function levelButtons(level: number): HTMLButtonElement[] {
    const levelRoot = levelElsRef.current.get(level);
    if (!levelRoot) return [];
    return Array.from(levelRoot.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'));
  }

  function rawIndexOf(button: HTMLButtonElement): number {
    const raw = button.getAttribute("data-item-index");
    return raw === null ? -1 : Number(raw);
  }

  function firstEnabledIndex(rows: MenuRow[]): number {
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (row.kind === "action" && !row.item.disabled) return i;
    }
    return -1;
  }

  function rovingTarget(depth: number, rows: MenuRow[]): number {
    const stored = roving[depth];
    if (stored !== undefined && stored >= 0 && stored < rows.length) {
      const row = rows[stored];
      if (row.kind === "action" && !row.item.disabled) return stored;
    }
    return firstEnabledIndex(rows);
  }

  function setRovingIndex(level: number, index: number) {
    setRoving((prev) => {
      const next = [...prev];
      next[level] = index;
      return next;
    });
  }

  function focusButton(level: number, index: number) {
    const levelRoot = levelElsRef.current.get(level);
    const button = levelRoot?.querySelector<HTMLButtonElement>(`[data-item-index="${index}"]`);
    setRovingIndex(level, index);
    button?.focus();
  }

  function focusFirstEnabled(level: number): boolean {
    const buttons = levelButtons(level);
    if (buttons.length === 0) return false;
    setRovingIndex(level, rawIndexOf(buttons[0]));
    buttons[0].focus();
    return true;
  }

  function focusLevelIndex(buttons: HTMLButtonElement[], at: number, level: number) {
    if (buttons.length === 0) return;
    const size = buttons.length;
    const target = ((at % size) + size) % size;
    setRovingIndex(level, rawIndexOf(buttons[target]));
    buttons[target].focus();
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
    if (typeof window === "undefined") return;
    const parentIndex = openPath[level - 1];
    if (parentIndex === undefined) return;
    const levelRoot = levelElsRef.current.get(level - 1);
    const panel = levelElsRef.current.get(level);
    if (!levelRoot || !panel) return;
    const button = levelRoot.querySelector(`[data-item-index="${parentIndex}"]`);
    if (!button) return;
    const menuRect = levelRoot.getBoundingClientRect();
    const itemRect = button.getBoundingClientRect();
    // Measure the themed width without our previous viewport cap. Measuring
    // the capped result would remove the cap on the next positioning pass.
    const { minWidth, maxWidth, boxSizing } = panel.style;
    panel.style.minWidth = "";
    panel.style.maxWidth = "";
    panel.style.boxSizing = "";
    const panelRect = panel.getBoundingClientRect();
    panel.style.minWidth = minWidth;
    panel.style.maxWidth = maxWidth;
    panel.style.boxSizing = boxSizing;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const solved = computeSubMenuPosition({
      parentMenuRect: { left: menuRect.left, right: menuRect.right },
      parentItemRect: { top: itemRect.top },
      panelSize: { width: panelRect.width, height: panelRect.height },
      viewport: { width: vw, height: vh },
      preferredSide: submenuSide
    });
    const block = findContainingBlock(panel);
    const converted = toContainingBlockPosition(
      { top: solved.top, left: solved.left },
      block ? block.getBoundingClientRect() : null
    );
    setLevelSides((prev) => {
      if (prev[level - 1] === solved.side) return prev;
      const next = [...prev];
      next[level - 1] = solved.side;
      return next;
    });
    setLevelPositions((prev) => {
      const previous = prev[level - 1];
      const capped = isCappedSubMenuWidth(panelRect.width, vw);
      if (previous?.top === converted.top && previous.left === converted.left &&
        previous.maxHeight === solved.maxHeight && previous.capped === capped) return prev;
      const next = [...prev];
      next[level - 1] = {
        top: converted.top,
        left: converted.left,
        maxHeight: solved.maxHeight,
        capped
      }
      return next;
    });
  }

  function computeAllPositions() {
    if (openPath.length === 0) return;
    for (let level = 1; level <= openPath.length; level += 1) {
      computeLevelPosition(level);
    }
  }

  // Descendant rectangles depend on committed ancestor positions, including
  // host moves. Repeat after each commit until the measured positions agree;
  // the equality guards above stop updates once both levels are attached.
  useLayoutEffect(() => {
    computeAllPositions();
  });

  // Recompute every open level against its own parent rect on open, plus one
  // recompute after mount once the real panel size is known (§3.4 step 6).
  useEffect(() => {
    if (destroyedRef.current || openPath.length === 0) return;
    computeAllPositions();
    if (typeof requestAnimationFrame === "function") {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = undefined;
        if (!destroyedRef.current) computeAllPositions();
      });
    }
    return cancelDeferredPositions;
  }, [openPath, submenuSide, items]);

  useEffect(() => {
    if (openPath.length === 0) return;
    const recompute = () => computeAllPositions();
    window.addEventListener("scroll", recompute, true);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", recompute, true);
      window.removeEventListener("resize", recompute);
    }
  }, [openPath, submenuSide, items]);

  // Enter/Space and the opening arrow focus the first enabled sub item once
  // the panel has rendered (§3.2, AC-05/AC-06).
  useEffect(() => {
    const level = pendingFocusLevelRef.current;
    pendingFocusLevelRef.current = null;
    if (level !== null) focusFirstEnabled(level);
  }, [openPath]);

  function closeDeepestFrom(level: number, focusParent: boolean) {
    cancelAllTimers();
    const parentLevel = level - 1;
    const parentIndex = openPath[parentLevel];
    setOpenPath((prev) => prev.slice(0, parentLevel));
    if (focusParent && parentIndex !== undefined) {
      focusButton(parentLevel, parentIndex);
    }
  }

  function closeAll(focusTrigger: boolean) {
    cancelAllTimers();
    setOpenPath([]);
    if (isNested && hasCascade) hostContext?.requestClose({ focusTrigger });
  }

  function selectItem(item: MenuActionItem, fullPath: number[], modality: "pointer" | "keyboard") {
    if (item.disabled) return;
    item.onClick?.();
    if (hasCascade || isNested) {
      onSelect?.(item, pathKeys(fullPath));
    } else {
      // Standalone flat menus keep the legacy single-argument call (AC-01).
      onSelect?.(item);
    }
    cancelAllTimers();
    setOpenPath([]);
    if (isNested && hasCascade) hostContext?.requestClose({ focusTrigger: modality === "keyboard" });
  }

  function openParent(depth: number, index: number, focusFirst: boolean) {
    cancelAllTimers();
    setOpenPath((prev) => [...prev.slice(0, depth), index]);
    pendingFocusLevelRef.current = focusFirst ? depth + 1 : null;
  }

  function toggleParent(depth: number, index: number) {
    cancelAllTimers();
    pendingFocusLevelRef.current = null;
    if (openPath[depth] === index && openPath.length > depth) {
      // Second click closes that level and deeper; focus unchanged (AC-29).
      setOpenPath((prev) => prev.slice(0, depth));
    } else {
      setOpenPath((prev) => [...prev.slice(0, depth), index]);
    }
  }

  function isMouseEvent(event: TargetedPointerEvent<Element>): boolean {
    // React carries the native event on `nativeEvent`; Preact core hands the
    // native event directly. Read whichever shape is present.
    const native = (event as unknown as { nativeEvent?: { pointerType?: unknown } }).nativeEvent;
    const pointerType = native?.pointerType ?? (event as unknown as { pointerType?: unknown }).pointerType;
    return pointerType === "mouse";
  }

  function triangleForLevel(level: number): [CascadePoint, CascadePoint, CascadePoint] | null {
    const apex = safeApexRef.current;
    if (apex === null || safeLevelRef.current !== level) return null;
    const panel = levelElsRef.current.get(level + 1);
    if (!panel) return null;
    const rect = panel.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0 && rect.left === 0 && rect.right === 0) {
      return null;
    }
    const side: ResolvedSubMenuSide = levelSides[level] ?? resolvePreferredSide(submenuSide);
    const edgeX = side === "right" ? rect.left : rect.right;
    return [
      { x: apex.x, y: apex.y },
      { x: edgeX, y: rect.top - 4 },
      { x: edgeX, y: rect.bottom + 4 }
    ];
  }

  function pointInActiveTriangle(level: number, point: CascadePoint): boolean {
    const triangle = triangleForLevel(level);
    if (!triangle) return false;
    return pointInSafeTriangle(point, triangle[0], triangle[1], triangle[2]);
  }

  function restoreClosingFocus(level: number) {
    const parentIndex = openPath[level];
    const active = document.activeElement;
    const focusInClosingLevels = active && Array.from(levelElsRef.current).some(
      ([panelLevel, panel]) => panelLevel > level && panel.contains(active)
    );
    if (focusInClosingLevels && parentIndex !== undefined) focusButton(level, parentIndex);
  }

  function armClose(level: number) {
    cancelCloseTimer();
    closeLevelRef.current = level;
    closeTimerRef.current = setTimeout(() => {
      // Restore focus before removing any descendant panel (§3.3 step 5).
      restoreClosingFocus(level);
      setOpenPath((prev) => prev.slice(0, level));
      safeApexRef.current = null;
      safeLevelRef.current = -1;
      closeTimerRef.current = undefined;
      closeLevelRef.current = -1;
    }, CLOSE_DELAY);
  }

  function onParentPointerEnter(depth: number, index: number, event: TargetedPointerEvent<Element>) {
    if (!isMouseEvent(event) || !hasCascade) return;
    if (openPath[depth] === index) {
      // Re-entry cancels closure without reopening and truncating descendants.
      cancelAllTimers();
      return;
    }
    // Safe-triangle priority: crossings during the diagonal arm nothing (§3.3).
    if (pointInActiveTriangle(depth, { x: event.clientX, y: event.clientY })) return;
    cancelCloseTimer();
    cancelOpenTimer();
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = undefined;
      restoreClosingFocus(depth);
      setOpenPath((prev) => [...prev.slice(0, depth), index]);
    }, OPEN_DELAY);
  }

  function onLeafPointerEnter(depth: number, event: TargetedPointerEvent<Element>) {
    if (!isMouseEvent(event) || !hasCascade) return;
    if (pointInActiveTriangle(depth, { x: event.clientX, y: event.clientY })) return;
    cancelOpenTimer();
    // Another branch open at this level: arm its close (§3.3 step 2).
    if (openPath.length > depth) {
      armClose(depth);
    }
  }

  function onParentPointerLeave(depth: number, index: number, event: TargetedPointerEvent<Element>) {
    if (!isMouseEvent(event) || !hasCascade) return;
    // Leaving before the hover delay must drop the pending open: the pointer
    // is already gone, so the panel shall never appear (§3.3 step 2).
    cancelOpenTimer();
    if (openPath[depth] !== index) return;
    // Record the exit point as the triangle apex (§3.3 step 3, D9).
    safeApexRef.current = { x: event.clientX, y: event.clientY }
    safeLevelRef.current = depth;
    armClose(depth);
  }

  function onHostPointerMove(event: TargetedPointerEvent<HTMLDivElement>) {
    if (!isMouseEvent(event) || !hasCascade || safeApexRef.current === null) return;
    const point = { x: event.clientX, y: event.clientY }
    const triangle = triangleForLevel(safeLevelRef.current);
    if (!triangle) return;
    // Test first, then refresh the apex (D9).
    if (pointInSafeTriangle(point, triangle[0], triangle[1], triangle[2])) {
      cancelCloseTimer();
      safeApexRef.current = point;
      return;
    }
    // Outside the triangle and over no open panel: exit away from the panel
    // re-arms the 250 ms close (§3.3 step 4). The armed-level guard keeps a
    // move stream from resetting the timer on every event.
    const target = event.target as Element | null;
    const inOpenPanel = target?.closest?.('[data-menu-level]:not([data-menu-level="0"])') ?? null;
    const parentButton = levelElsRef.current
      .get(safeLevelRef.current)
      ?.querySelector(`[data-item-index="${openPath[safeLevelRef.current] ?? -1}"]`);
    const inArmedParent = parentButton?.closest(".st-menu__itemWrap")?.contains(target ?? null) ?? false;
    if (!inOpenPanel && !inArmedParent) {
      if (closeTimerRef.current === undefined || closeLevelRef.current !== safeLevelRef.current) {
        armClose(safeLevelRef.current);
      }
    }
  }

  function onPanelPointerEnter(event: TargetedPointerEvent<HTMLDivElement>) {
    if (!isMouseEvent(event) || !hasCascade) return;
    cancelAllTimers();
  }

  function onPanelPointerLeave(depth: number, event: TargetedPointerEvent<HTMLDivElement>) {
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

  /**
   * Expandable items follow their own panel's resolved side (AC-19).
   * Leaves use the containing panel's side for the closing arrow (AC-06).
   */
  function openingSideFor(depth: number, index: number, item: MenuActionItem): ResolvedSubMenuSide {
    if (hasSubMenu(item) && depth < 2) return resolvedSideFor(depth, index);
    if (depth >= 1 && levelSides[depth - 1] !== undefined) {
      return levelSides[depth - 1];
    }
    return openingArrow() === "ArrowRight" ? "right" : "left";
  }

  function onItemKeyDown(event: TargetedKeyboardEvent<HTMLButtonElement>, depth: number, index: number, item: MenuActionItem) {
    const buttons = levelButtons(depth);
    const current = buttons.indexOf(event.currentTarget as unknown as HTMLButtonElement);
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
    const resolved = openingSideFor(depth, index, item);
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
      // Opposite arrow closes the deepest open level only, one level per
      // press, and refocuses that level's parent line (§3.6, D8).
      if (depth >= 1) {
        event.preventDefault();
        if (openPath.length > 0) closeDeepestFrom(openPath.length, true);
      } else if (hasCascade && openPath[0] === index && openPath.length > 0) {
        event.preventDefault();
        closeDeepestFrom(openPath.length, true);
      }
    }
  }

  function onLevelKeyDown(event: TargetedKeyboardEvent<HTMLDivElement>, depth: number) {
    if (!hasCascade) return;
    if (event.key === "Escape") {
      if (depth >= 1) {
        // Esc closes the deepest open level only, one level per press,
        // then stops the host close (D4, §3.6/D8).
        event.preventDefault();
        event.stopPropagation();
        if (openPath.length > 0) closeDeepestFrom(openPath.length, true);
        return;
      }
      if (openPath.length > 0) {
        // Esc on the root line with a sub-menu open closes the deepest level.
        event.preventDefault();
        event.stopPropagation();
        closeDeepestFrom(openPath.length, true);
        return;
      }
      // Esc at the root closes everything via the host (standalone menus
      // have no root open state to close in this port).
      if (isNested) {
        event.preventDefault();
        event.stopPropagation();
        closeAll(true);
      }
      return;
    }
    if (event.key === "Tab") {
      // Keep a surviving focus anchor before unmounting the active panel.
      // The native Tab default then advances out of the menu in either
      // direction: from the host trigger, or the standalone root boundary.
      if (!isNested) {
        const buttons = levelButtons(0);
        const boundary = event.shiftKey ? buttons[0] : buttons[buttons.length - 1];
        if (boundary) focusButton(0, rawIndexOf(boundary));
      }
      closeAll(true);
    }
  }

  function scanTreeWarnings(list: MenuItem[], depth: number) {
    const seen = new Set<string>();
    for (const row of buildRows(list)) {
      if (row.kind !== "action") continue;
      const key = keyOf(row.item, 0);
      if (seen.has(key) && !warnedDuplicateRef.current) {
        warnedDuplicateRef.current = true;
        console.warn(`[Menu] duplicate sibling key "${key}": open state follows the index path.`);
      }
      seen.add(key);
      if (depth >= 2 && hasSubMenu(row.item) && !warnedDepthKeysRef.current.has(key)) {
        warnedDepthKeysRef.current.add(key);
        console.warn(`[Menu] item "${key}" is nested deeper than two sub-menu levels and renders as a leaf.`);
      }
      if (Array.isArray(row.item.children)) {
        scanTreeWarnings(row.item.children, depth + 1);
      }
    }
  }

  // `items` (or the preferred side) changing removes orphan panels and
  // cancels every pending hover timer (§3.2, AC-22, AC-38).
  useEffect(() => {
    cancelAllTimers();
    setOpenPath((previous) => {
      let list = items;
      const kept: number[] = [];
      for (const index of previous) {
        const row = buildRows(list)[index];
        // A disabled parent is no longer expandable: prune its panel so
        // `aria-expanded` and the rendered levels agree (§3.2, AC-22).
        if (!row || row.kind !== "action" || !hasSubMenu(row.item) || row.item.disabled) break;
        kept.push(index);
        list = row.item.children;
      }
      return kept.length === previous.length ? previous : kept;
    });
    scanTreeWarnings(items, 0);
  }, [items, submenuSide]);

  // Let the host know whether a cascade is present (focus-return decisions).
  // Always reported so the flag resets when items lose their cascade.
  useEffect(() => {
    hostContext?.setHasCascade?.(hasCascade);
  }, [hasCascade, hostContext]);

  function panelStyle(panelIndex: number): { top: string; left: string; maxHeight?: string; minWidth?: number; maxWidth?: string; boxSizing?: "border-box" } | undefined {
    const position = levelPositions[panelIndex];
    if (!position) return undefined;
    const style: { top: string; left: string; maxHeight?: string; minWidth?: number; maxWidth?: string; boxSizing?: "border-box" } = { top: `${position.top}px`, left: `${position.left}px` }
    if (position.maxHeight !== undefined) style.maxHeight = `${position.maxHeight}px`;
    if (position.capped) {
      style.minWidth = 0;
      style.maxWidth = "calc(100vw - 16px)";
      style.boxSizing = "border-box";
    }
    return style;
  }

  function renderRows(rows: MenuRow[], depth: number): ComponentChildren {
    return rows.map((row, index) => {
      if (row.kind === "divider") {
        return <div key={index} className="st-menu__divider" role="separator" aria-hidden="true" />;
      }
      if (row.kind === "group") {
        // Canon-aligned (Svelte): a group is a flat `div role="presentation"`
        // label; nested `items` (React-native shape) render as flat siblings
        // in the same level's row list.
        return (
          <div key={index} className="st-menu__group" id={`${rootId}--group-${depth}-${index}`} role="presentation">
            {row.label}
          </div>
        );
      }
      const item = row.item;
      const tabIndex = item.disabled ? undefined : rovingTarget(depth, rows) === index ? 0 : -1;
      const onFocus = () => setRovingIndex(depth, index);
      if (hasSubMenu(item) && depth < 2) {
        const isOpen = openPath[depth] === index && openPath.length > depth;
        const selected = Boolean(item.selected) || isOpen;
        const chevronSide = resolvedSideFor(depth, index);
        return (
          <div
            key={index}
            className="st-menu__itemWrap"
            role="presentation"
            onPointerEnter={(event) => {
              if (!item.disabled) onParentPointerEnter(depth, index, event);
            }}
            onPointerLeave={(event) => {
              if (!item.disabled) onParentPointerLeave(depth, index, event);
            }}
          >
            <button
              className={classNames("st-menu__item", "st-menu__item--hasSubmenu", isDangerAction(item) && "st-menu__item--danger", selected && "st-menu__item--selected")}
              type="button"
              role="menuitem"
              id={parentButtonId(depth, index)}
              data-item-index={index}
              aria-haspopup="menu"
              aria-expanded={item.disabled ? "false" : isOpen ? "true" : "false"}
              aria-controls={subId(depth, index)}
              aria-disabled={item.disabled ? "true" : undefined}
              disabled={item.disabled}
              tabIndex={tabIndex}
              onClick={() => {
                if (!item.disabled) toggleParent(depth, index);
              }}
              onKeyDown={(event) => onItemKeyDown(event, depth, index, item)}
              onFocus={onFocus}
            >
              {chevronSide === "left" ? (
                <span className="st-menu__itemChevron st-menu__itemChevron--start" aria-hidden="true">
                  <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                </span>
              ) : null}
              {item.icon ? <span className="st-menu__itemIcon" aria-hidden="true">{item.icon}</span> : null}
              <span className="st-menu__itemLabel">{item.label}</span>
              {chevronSide === "right" ? (
                <span className="st-menu__itemChevron st-menu__itemChevron--end" aria-hidden="true">
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </span>
              ) : null}
            </button>
          </div>
        );
      }
      const selected = Boolean(item.selected);
      return (
        <button
          key={index}
          className={classNames("st-menu__item", isDangerAction(item) && "st-menu__item--danger", selected && "st-menu__item--selected")}
          type="button"
          role="menuitem"
          data-item-index={index}
          aria-disabled={item.disabled ? "true" : undefined}
          disabled={item.disabled}
          tabIndex={tabIndex}
          onClick={() => selectItem(item, indexPathFor(depth, index), "pointer")}
          onKeyDown={(event) => onItemKeyDown(event, depth, index, item)}
          onPointerEnter={(event) => onLeafPointerEnter(depth, event)}
          onFocus={onFocus}
        >
          {item.icon ? <span className="st-menu__itemIcon" aria-hidden="true">{item.icon}</span> : null}
          <span className="st-menu__itemLabel">{item.label}</span>
        </button>
      );
    });
  }

  const rows0 = buildRows(items);
  const level1List = openPath.length >= 1 ? levelList(1) : [];
  const level2List = openPath.length >= 2 ? levelList(2) : [];

  if (!hasCascade) {
    return (
      <div
        {...rest}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        ref={(el: HTMLDivElement | null) => {
          if (el) levelElsRef.current.set(0, el);
          else levelElsRef.current.delete(0);
        }}
        className={classNames("st-menu", dense && "st-menu--dense", className)}
        role={role ?? "menu"}
        id={rootId}
        data-menu-level="0"
      >
        {renderRows(rows0, 0)}
      </div>
    );
  }

  return (
    <div
      {...rest}
      className={classNames("st-menu", "st-menu--hasCascade", dense && "st-menu--dense", className)}
      onPointerMove={onHostPointerMove}
    >
      <div
        className="st-menu__scroll"
        role="menu"
        id={rootId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        data-menu-level="0"
        ref={(el: HTMLDivElement | null) => {
          if (el) levelElsRef.current.set(0, el);
          else levelElsRef.current.delete(0);
        }}
        onKeyDown={(event) => onLevelKeyDown(event, 0)}
      >
        {renderRows(rows0, 0)}
      </div>
      {openPath.length >= 1 && level1List.length > 0 ? (
        <div
          className={classNames("st-menu", "st-menu--submenu", dense && "st-menu--dense")}
          role="menu"
          id={subId(0, openPath[0])}
          aria-labelledby={parentButtonId(0, openPath[0])}
          tabIndex={-1}
          data-menu-level="1"
          style={panelStyle(0)}
          ref={(el: HTMLDivElement | null) => {
            if (el) levelElsRef.current.set(1, el);
            else levelElsRef.current.delete(1);
          }}
          onKeyDown={(event) => onLevelKeyDown(event, 1)}
          onPointerEnter={onPanelPointerEnter}
          onPointerLeave={(event) => onPanelPointerLeave(0, event)}
        >
          {renderRows(buildRows(level1List), 1)}
        </div>
      ) : null}
      {openPath.length >= 2 && level2List.length > 0 ? (
        <div
          className={classNames("st-menu", "st-menu--submenu", dense && "st-menu--dense")}
          role="menu"
          id={subId(1, openPath[1])}
          aria-labelledby={parentButtonId(1, openPath[1])}
          tabIndex={-1}
          data-menu-level="2"
          style={panelStyle(1)}
          ref={(el: HTMLDivElement | null) => {
            if (el) levelElsRef.current.set(2, el);
            else levelElsRef.current.delete(2);
          }}
          onKeyDown={(event) => onLevelKeyDown(event, 2)}
          onPointerEnter={onPanelPointerEnter}
          onPointerLeave={(event) => onPanelPointerLeave(1, event)}
        >
          {renderRows(buildRows(level2List), 2)}
        </div>
      ) : null}
    </div>
  );
}
