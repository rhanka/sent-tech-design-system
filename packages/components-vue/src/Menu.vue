<script lang="ts">
let menuInstanceCounter = 0;
</script>

<script setup lang="ts">
import type {
  MenuActionItem,
  MenuDividerItem,
  MenuGroupItem,
  MenuItem,
  MenuSubmenuSide,
} from "./Menu.vue";
import {
  computed,
  useAttrs,
  inject,
  nextTick,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { classNames } from "./classNames.js";
import MenuLabel from './MenuLabel.vue';
import type { MenuLabelSlots } from './menu-label-slots.js';
import {
  CLOSE_DELAY,
  MENU_HOST_KEY,
  OPEN_DELAY,
  SUBMENU_DEFAULT_WIDTH,
  VIEWPORT_MARGIN,
  computeSubMenuPosition,
  pointInSafeTriangle,
  resolvePreferredSide,
  toContainingBlockPosition,
  type CascadePoint,
  type ResolvedSubMenuSide,
} from "./menu-cascade.js";

function itemKind(item: MenuItem): string | undefined {
  const tagged = item as { type?: string; kind?: string };
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
function isDangerAction(item: MenuActionItem): boolean {
  return item.variant === "danger" || item.danger === true;
}
function actionKey(item: MenuActionItem): string {
  return item.id ?? item.value ?? String(item.label);
}
function hasSubMenu(
  item: MenuItem,
): item is MenuActionItem & { children: MenuItem[] } {
  return (
    isAction(item) && Array.isArray(item.children) && item.children.length > 0
  );
}
function treeHasCascade(list: MenuItem[]): boolean {
  for (const item of list) {
    if (hasSubMenu(item)) return true;
    if (isAction(item) && Array.isArray(item.children)) {
      if (treeHasCascade(item.children)) return true;
    }
    if (isGroup(item) && Array.isArray(item.items)) {
      if (treeHasCascade(item.items as MenuItem[])) return true;
    }
  }
  return false;
}

interface ExpandedRow {
  item: MenuItem;
  index: number;
  kind: "divider" | "group" | "action";
  action?: MenuActionItem;
}

defineSlots<MenuLabelSlots>();

defineOptions({ name: "Menu", inheritAttrs: false });
const props = defineProps({
  items: { type: Array as () => MenuItem[], required: true },
  dense: { type: Boolean, default: false },
  role: { type: String, default: undefined },
  class: { type: String, default: undefined },
  submenuSide: { type: String as () => MenuSubmenuSide, default: "auto" },
});
const emit = defineEmits(["select"]);
const attrs = useAttrs();

const hostContext = inject(MENU_HOST_KEY, undefined);
const isNested = hostContext !== undefined;
const instanceId = ++menuInstanceCounter;
const fallbackRootId = `st-menu-${instanceId}`;
const rootId = computed(
  () =>
    (attrs.id as string | undefined) ??
    hostContext?.rootMenuId ??
    fallbackRootId,
);

const hostRef = ref<HTMLElement | null>(null);
// Internal open state is an index path (never keys), so duplicate sibling
// keys cannot open or close together (§2.3, D7). Indices refer to the
// expanded level rows (group headers/dividers occupy slots; nested group
// items are lifted as siblings at the same level).
const openPath = ref<number[]>([]);
const roving = ref<number[]>([]);
const levelSides = ref<ResolvedSubMenuSide[]>([]);
const levelPositions = ref<
  { top: number; left: number; maxHeight?: number; capped: boolean }[]
>([]);

// Hover timers and triangle apex are intentionally NOT reactive: the
// `items`-validation watcher below cancels all timers, so tracking them
// would make every armed hover cancel itself on the next flush (§3.3).
let openTimer: ReturnType<typeof setTimeout> | undefined = undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined = undefined;
let closeLevel = -1;
let safeApex: CascadePoint | null = null;
let safeLevel = -1;
let warnedDuplicate = false;
const warnedDepthKeys = new Set<string>();
let destroyed = false;
let rafId: number | undefined = undefined;

const hasCascade = computed(() => treeHasCascade(props.items));

function expandLevel(list: MenuItem[]): ExpandedRow[] {
  const rows: ExpandedRow[] = [];
  list.forEach((item) => {
    if (isDivider(item)) {
      rows.push({ item, index: rows.length, kind: "divider" });
    } else if (isGroup(item)) {
      rows.push({ item, index: rows.length, kind: "group" });
      (item.items ?? []).forEach((child) => {
        const action = child as MenuActionItem;
        rows.push({
          item: action as MenuItem,
          index: rows.length,
          kind: "action",
          action,
        });
      });
    } else {
      const action = item as MenuActionItem;
      rows.push({ item, index: rows.length, kind: "action", action });
    }
  });
  return rows;
}

function levelRows(depth: number): ExpandedRow[] {
  let list = props.items;
  for (let d = 0; d < depth; d += 1) {
    const rows = expandLevel(list);
    const parent = rows[openPath.value[d]];
    if (!parent || parent.kind !== "action" || !parent.action) return [];
    const childList = parent.action.children;
    if (!Array.isArray(childList)) return [];
    list = childList;
  }
  return expandLevel(list);
}

function pathKeys(indexPath: number[]): string[] {
  const keys: string[] = [];
  let list = props.items;
  for (const index of indexPath) {
    const rows = expandLevel(list);
    const row = rows[index];
    if (!row || row.kind !== "action" || !row.action) break;
    keys.push(actionKey(row.action));
    list = Array.isArray(row.action.children) ? row.action.children : [];
  }
  return keys;
}

function subId(depth: number, index: number): string {
  return `${rootId.value}--sub-${depth}-${index}`;
}
function parentButtonId(depth: number, index: number): string {
  return `${rootId.value}--parent-${depth}-${index}`;
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
function cancelDeferredPositions() {
  if (rafId !== undefined && typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(rafId);
    rafId = undefined;
  }
}

onUnmounted(() => {
  destroyed = true;
  cancelAllTimers();
  cancelDeferredPositions();
  if (posCleanup) {
    posCleanup();
    posCleanup = null;
  }
});

function levelRootEl(level: number): Element | null {
  const host = hostRef.value;
  if (!host) return null;
  // The flat root IS its own level 0 element (querySelector skips self).
  if (host.matches(`[data-menu-level="${level}"]`)) return host;
  return host.querySelector(`[data-menu-level="${level}"]`);
}

function levelButtons(level: number): HTMLButtonElement[] {
  const levelRoot = levelRootEl(level);
  if (!levelRoot) return [];
  return Array.from(
    levelRoot.querySelectorAll<HTMLButtonElement>(
      '[role="menuitem"]:not(:disabled)',
    ),
  );
}

function rawIndexOf(button: HTMLButtonElement): number {
  const raw = button.getAttribute("data-item-index");
  return raw === null ? -1 : Number(raw);
}

function firstEnabledIndex(rows: ExpandedRow[]): number {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (row.kind === "action" && row.action && !row.action.disabled)
      return row.index;
  }
  return -1;
}

function rovingTarget(depth: number, rows: ExpandedRow[]): number {
  const stored = roving.value[depth];
  if (stored !== undefined) {
    const row = rows.find((r) => r.index === stored);
    if (row && row.kind === "action" && row.action && !row.action.disabled) {
      return stored;
    }
  }
  return firstEnabledIndex(rows);
}

function focusButton(level: number, index: number) {
  const levelRoot = levelRootEl(level);
  const button = levelRoot?.querySelector<HTMLButtonElement>(
    `[data-item-index="${index}"]`,
  );
  roving.value[level] = index;
  button?.focus();
}

function focusFirstEnabled(level: number): boolean {
  const buttons = levelButtons(level);
  if (buttons.length === 0) return false;
  roving.value[level] = rawIndexOf(buttons[0]);
  buttons[0].focus();
  return true;
}

function focusLevelIndex(
  buttons: HTMLButtonElement[],
  at: number,
  level: number,
) {
  if (buttons.length === 0) return;
  const size = buttons.length;
  const target = ((at % size) + size) % size;
  roving.value[level] = rawIndexOf(buttons[target]);
  buttons[target].focus();
}

function schedulePositions() {
  if (destroyed) return;
  void nextTick().then(() => {
    if (destroyed) return;
    computeAllPositions();
    if (typeof requestAnimationFrame === "function") {
      cancelDeferredPositions();
      rafId = requestAnimationFrame(() => {
        rafId = undefined;
        if (!destroyed) computeAllPositions();
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
  const host = hostRef.value;
  if (!host || typeof window === "undefined") return;
  const parentIndex = openPath.value[level - 1];
  if (parentIndex === undefined) return;
  const levelRoot = levelRootEl(level - 1);
  const panel = levelRootEl(level);
  const button = levelRoot?.querySelector(`[data-item-index="${parentIndex}"]`);
  if (!levelRoot || !panel || !button) return;
  const menuRect = levelRoot.getBoundingClientRect();
  const itemRect = button.getBoundingClientRect();
  // Measure the themed width without the previous viewport cap. Otherwise
  // a capped measurement would remove the cap on the next resize/scroll.
  const panelStyle = (panel as HTMLElement).style;
  const previousStyle = panelStyle.cssText;
  let panelRect: DOMRect;
  try {
    panelStyle.removeProperty("min-width");
    panelStyle.removeProperty("max-width");
    panelRect = panel.getBoundingClientRect();
  } finally {
    panelStyle.cssText = previousStyle;
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const solved = computeSubMenuPosition({
    parentMenuRect: { left: menuRect.left, right: menuRect.right },
    parentItemRect: { top: itemRect.top },
    panelSize: { width: panelRect.width, height: panelRect.height },
    viewport: { width: vw, height: vh },
    preferredSide: props.submenuSide,
  });
  const block = findContainingBlock(panel as HTMLElement);
  const converted = toContainingBlockPosition(
    { top: solved.top, left: solved.left },
    block ? block.getBoundingClientRect() : null,
  );
  levelSides.value[level - 1] = solved.side;
  levelPositions.value[level - 1] = {
    top: converted.top,
    left: converted.left,
    maxHeight: solved.maxHeight,
    capped:
      (panelRect.width > 0 ? panelRect.width : SUBMENU_DEFAULT_WIDTH) >
      vw - 2 * VIEWPORT_MARGIN,
  };
}

function computeAllPositions() {
  if (!hostRef.value || openPath.value.length === 0) return;
  for (let level = 1; level <= openPath.value.length; level += 1) {
    computeLevelPosition(level);
  }
}

function closeDeepestFrom(level: number, focusParent: boolean) {
  cancelAllTimers();
  const parentLevel = level - 1;
  const parentIndex = openPath.value[parentLevel];
  openPath.value = openPath.value.slice(0, parentLevel);
  if (focusParent && parentIndex !== undefined) {
    focusButton(parentLevel, parentIndex);
  }
}

function closeAll(focusTrigger: boolean) {
  cancelAllTimers();
  openPath.value = [];
  if (isNested && hasCascade.value) {
    hostContext?.requestClose({ focusTrigger });
  }
}

function indexPathFor(depth: number, index: number): number[] {
  return [...openPath.value.slice(0, depth), index];
}

function selectItem(
  item: MenuActionItem,
  fullPath: number[],
  modality: "pointer" | "keyboard",
) {
  if (item.disabled) return;
  // Leaf onClick precedes select; parent activation never reaches here.
  item.onClick?.();
  if (hasCascade.value) {
    emit("select", item, pathKeys(fullPath));
  } else {
    // Flat menus keep the legacy single-argument call (AC-01).
    emit("select", item);
  }
  cancelAllTimers();
  openPath.value = [];
  if (isNested && hasCascade.value) {
    hostContext?.requestClose({ focusTrigger: modality === "keyboard" });
  }
}

function openParent(depth: number, index: number, focusFirst: boolean) {
  cancelAllTimers();
  openPath.value = [...openPath.value.slice(0, depth), index];
  schedulePositions();
  if (focusFirst) {
    void nextTick().then(() => {
      if (destroyed) return;
      // No enabled item: focus stays on the parent line (§3.2).
      focusFirstEnabled(depth + 1);
    });
  }
}

function toggleParent(depth: number, index: number) {
  cancelAllTimers();
  if (openPath.value[depth] === index && openPath.value.length > depth) {
    // Second click closes that level and deeper; focus unchanged (AC-29).
    openPath.value = openPath.value.slice(0, depth);
  } else {
    openPath.value = [...openPath.value.slice(0, depth), index];
    schedulePositions();
  }
}

function isMouseEvent(event: Event): boolean {
  return (event as PointerEvent).pointerType === "mouse";
}

function triangleForLevel(
  level: number,
): [CascadePoint, CascadePoint, CascadePoint] | null {
  const host = hostRef.value;
  if (!host || safeApex === null || safeLevel !== level) return null;
  const panel = levelRootEl(level + 1);
  if (!panel) return null;
  const rect = panel.getBoundingClientRect();
  if (
    rect.width === 0 &&
    rect.height === 0 &&
    rect.left === 0 &&
    rect.right === 0
  ) {
    return null;
  }
  const side: ResolvedSubMenuSide =
    levelSides.value[level] ?? resolvePreferredSide(props.submenuSide);
  const edgeX = side === "right" ? rect.left : rect.right;
  return [
    { x: safeApex.x, y: safeApex.y },
    { x: edgeX, y: rect.top - 4 },
    { x: edgeX, y: rect.bottom + 4 },
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
  // Capture before the slice: the parent line of the closing level lives
  // at openPath[level] while the timer is pending (§3.3 step 5).
  const parentIndex = openPath.value[level];
  closeTimer = setTimeout(() => {
    const treeRoot = hostRef.value?.getRootNode();
    const active = treeRoot instanceof ShadowRoot
      ? treeRoot.activeElement
      : document.activeElement;
    const closingRoots = hostRef.value?.querySelectorAll(
      "[data-menu-level]",
    );
    openPath.value = openPath.value.slice(0, level);
    safeApex = null;
    safeLevel = -1;
    // Focus inside a pointer-closed level moves to its parent line (§3.3).
    if (active && closingRoots) {
      for (const root of closingRoots) {
        if (
          Number(root.getAttribute("data-menu-level")) > level &&
          root.contains(active)
        ) {
          if (parentIndex !== undefined) focusButton(level, parentIndex);
          break;
        }
      }
    }
    closeTimer = undefined;
    closeLevel = -1;
  }, CLOSE_DELAY);
}

function onParentPointerEnter(depth: number, index: number, event: Event) {
  if (!isMouseEvent(event) || !hasCascade.value) return;
  const pointer = event as PointerEvent;
  // Safe-triangle priority: crossings during the diagonal arm nothing (§3.3).
  if (pointInActiveTriangle(depth, { x: pointer.clientX, y: pointer.clientY }))
    return;
  cancelCloseTimer();
  cancelOpenTimer();
  openTimer = setTimeout(() => {
    openTimer = undefined;
    openPath.value = [...openPath.value.slice(0, depth), index];
    schedulePositions();
  }, OPEN_DELAY);
}

function onLeafPointerEnter(depth: number, event: Event) {
  if (!isMouseEvent(event) || !hasCascade.value) return;
  const pointer = event as PointerEvent;
  if (pointInActiveTriangle(depth, { x: pointer.clientX, y: pointer.clientY }))
    return;
  cancelOpenTimer();
  // Another branch open at this level: arm its close (§3.3 step 2).
  if (openPath.value.length > depth) {
    armClose(depth);
  }
}

function onParentPointerLeave(depth: number, index: number, event: Event) {
  if (!isMouseEvent(event) || !hasCascade.value) return;
  // Leaving before the hover delay must drop the pending open: the pointer
  // is already gone, so the panel shall never appear (§3.3 step 2).
  cancelOpenTimer();
  if (openPath.value[depth] !== index) return;
  const pointer = event as PointerEvent;
  // Record the exit point as the triangle apex (§3.3 step 3, D9).
  safeApex = { x: pointer.clientX, y: pointer.clientY };
  safeLevel = depth;
  armClose(depth);
}

function onHostPointerMove(event: Event) {
  if (!isMouseEvent(event) || !hasCascade.value || safeApex === null) return;
  const pointer = event as PointerEvent;
  const point = { x: pointer.clientX, y: pointer.clientY };
  const triangle = triangleForLevel(safeLevel);
  if (!triangle) return;
  // Test first, then refresh the apex (D9).
  if (pointInSafeTriangle(point, triangle[0], triangle[1], triangle[2])) {
    cancelCloseTimer();
    safeApex = point;
    return;
  }
  // Outside the triangle and over no open panel: exit away from the panel
  // re-arms the 250 ms close (§3.3 step 4). The armed-level guard keeps a
  // move stream from resetting the timer on every event.
  const target = event.target as Element | null;
  const inOpenPanel =
    target?.closest?.('[data-menu-level]:not([data-menu-level="0"])') ?? null;
  const parentButton = levelRootEl(safeLevel)?.querySelector(
    `[data-item-index="${openPath.value[safeLevel] ?? -1}"]`,
  );
  const inArmedParent =
    parentButton?.closest(".st-menu__itemWrap")?.contains(target ?? null) ??
    false;
  if (!inOpenPanel && !inArmedParent) {
    if (closeTimer === undefined || closeLevel !== safeLevel) {
      armClose(safeLevel);
    }
  }
}

function onPanelPointerEnter(event: Event) {
  if (!isMouseEvent(event) || !hasCascade.value) return;
  cancelAllTimers();
}

function onPanelPointerLeave(depth: number, event: Event) {
  if (!isMouseEvent(event) || !hasCascade.value) return;
  armClose(depth);
}

function openingArrow(): string {
  const side = resolvePreferredSide(props.submenuSide);
  return side === "right" ? "ArrowRight" : "ArrowLeft";
}

function resolvedSideFor(depth: number, index: number): ResolvedSubMenuSide {
  if (
    openPath.value[depth] === index &&
    openPath.value.length > depth &&
    levelSides.value[depth] !== undefined
  ) {
    return levelSides.value[depth];
  }
  return resolvePreferredSide(props.submenuSide);
}

/**
 * Expandable parents follow their own panel's resolved side, since each
 * level can flip independently. Leaves use their containing panel's side
 * so the opposite arrow closes that level (§3.4, AC-06/AC-19/AC-30).
 */
function openingSideFor(
  depth: number,
  index: number,
  item: MenuActionItem,
): ResolvedSubMenuSide {
  if (depth < 2 && hasSubMenu(item)) return resolvedSideFor(depth, index);
  if (depth >= 1 && levelSides.value[depth - 1] !== undefined) {
    return levelSides.value[depth - 1];
  }
  return openingArrow() === "ArrowRight" ? "right" : "left";
}

function onItemKeyDown(
  event: KeyboardEvent,
  depth: number,
  index: number,
  item: MenuActionItem,
) {
  const levelRoot = levelRootEl(depth);
  const buttons = levelRoot
    ? Array.from(
        levelRoot.querySelectorAll<HTMLButtonElement>(
          '[role="menuitem"]:not(:disabled)',
        ),
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
      if (openPath.value[depth] === index && openPath.value.length > depth) {
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
      if (openPath.value.length > 0)
        closeDeepestFrom(openPath.value.length, true);
    } else if (
      hasCascade.value &&
      openPath.value[0] === index &&
      openPath.value.length > 0
    ) {
      event.preventDefault();
      closeDeepestFrom(openPath.value.length, true);
    }
  }
}

function onLevelKeyDown(event: KeyboardEvent, depth: number) {
  if (!hasCascade.value) return;
  if (event.key === "Escape") {
    if (depth >= 1) {
      // Esc closes the deepest open level only, one level per press,
      // then stops the host close (D4, §3.6/D8).
      event.preventDefault();
      event.stopPropagation();
      if (openPath.value.length > 0)
        closeDeepestFrom(openPath.value.length, true);
      return;
    }
    if (openPath.value.length > 0) {
      // Esc on the root line with a sub-menu open closes the deepest level.
      event.preventDefault();
      event.stopPropagation();
      cancelAllTimers();
      const parentLevel = openPath.value.length - 1;
      const parentIndex = openPath.value[parentLevel];
      openPath.value = openPath.value.slice(0, parentLevel);
      if (parentIndex !== undefined) focusButton(parentLevel, parentIndex);
      return;
    }
    // Esc at the root closes everything via the host (nested menus only:
    // standalone Menu has no `dismissOnSelect`, §3.6).
    if (isNested) {
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

function scanList(list: MenuItem[], depth: number) {
  const seen = new Set<string>();
  for (const item of list) {
    if (isDivider(item)) continue;
    if (isGroup(item)) {
      (item.items ?? []).forEach((child) => {
        const childItem = child as MenuActionItem;
        const key = actionKey(childItem);
        if (seen.has(key) && !warnedDuplicate) {
          warnedDuplicate = true;
          console.warn(
            `[Menu] duplicate sibling key "${key}": open state follows the index path.`,
          );
        }
        seen.add(key);
        if (depth >= 2 && hasSubMenu(childItem) && !warnedDepthKeys.has(key)) {
          warnedDepthKeys.add(key);
          console.warn(
            `[Menu] item "${key}" is nested deeper than two sub-menu levels and renders as a leaf.`,
          );
        }
        if (Array.isArray(childItem.children)) {
          scanList(childItem.children, depth + 1);
        }
      });
      continue;
    }
    const action = item as MenuActionItem;
    const key = actionKey(action);
    if (seen.has(key) && !warnedDuplicate) {
      warnedDuplicate = true;
      console.warn(
        `[Menu] duplicate sibling key "${key}": open state follows the index path.`,
      );
    }
    seen.add(key);
    if (depth >= 2 && hasSubMenu(action) && !warnedDepthKeys.has(key)) {
      warnedDepthKeys.add(key);
      console.warn(
        `[Menu] item "${key}" is nested deeper than two sub-menu levels and renders as a leaf.`,
      );
    }
    if (Array.isArray(action.children)) {
      scanList(action.children, depth + 1);
    }
  }
}

function scanTreeWarnings() {
  scanList(props.items, 0);
}

// `items` (or the preferred side) changing removes orphan panels and
// cancels every pending hover timer (§3.2, AC-22, AC-38).
watch(
  [() => props.items, () => props.submenuSide],
  () => {
    cancelAllTimers();
    const previous = openPath.value;
    let list = props.items;
    const kept: number[] = [];
    for (const index of previous) {
      const rows = expandLevel(list);
      const row = rows[index];
      // A disabled parent is no longer expandable: prune its panel so
      // `aria-expanded` and the rendered levels agree (§3.2, AC-22).
      if (
        !row ||
        row.kind !== "action" ||
        !row.action ||
        !hasSubMenu(row.action) ||
        row.action.disabled
      )
        break;
      kept.push(index);
      list = row.action.children;
    }
    if (kept.length !== previous.length) {
      openPath.value = kept;
    }
    scanTreeWarnings();
  },
  { immediate: true, deep: true },
);

// Let the host know whether a cascade is present (focus-return + shadow
// decisions). Always reported so the flag resets when items lose their
// cascade instead of going stale.
watch(
  hasCascade,
  (value) => {
    if (isNested) {
      hostContext?.setHasCascade?.(value);
    }
  },
  { immediate: true },
);

// Recompute every open level against its own parent rect on scroll/resize,
// plus one recompute after mount once the real panel size is known (§3.4).
let posCleanup: (() => void) | null = null;
let posHandler: (() => void) | null = null;
watch(
  () => openPath.value.length,
  (length) => {
    if (posCleanup) {
      posCleanup();
      posCleanup = null;
      posHandler = null;
    }
    if (length === 0) return;
    schedulePositions();
    const recompute = () => computeAllPositions();
    posHandler = recompute;
    const onScroll = () => computeAllPositions();
    const onResize = () => computeAllPositions();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    posCleanup = () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    void recompute;
    void posHandler;
  },
  { immediate: false },
);

function panelStyle(depth: number): string | undefined {
  const position = levelPositions.value[depth];
  if (!position) return undefined;
  let style = `top: ${position.top}px; left: ${position.left}px;`;
  if (position.maxHeight !== undefined)
    style += ` max-height: ${position.maxHeight}px;`;
  if (position.capped) style += " min-width: 0; max-width: calc(100vw - 16px);";
  return style;
}

function chevronSide(depth: number, index: number): ResolvedSubMenuSide {
  return resolvedSideFor(depth, index);
}

function rowIsParent(row: ExpandedRow, depth: number) {
  return !!row.action && hasSubMenu(row.action) && depth < 2;
}
function rowIsOpen(depth: number, index: number) {
  return openPath.value[depth] === index && openPath.value.length > depth;
}
function rowClass(row: ExpandedRow, depth: number) {
  return classNames(
    "st-menu__item",
    rowIsParent(row, depth) && "st-menu__item--hasSubmenu",
    row.action && isDangerAction(row.action) && "st-menu__item--danger",
    (row.action?.selected || rowIsOpen(depth, row.index)) &&
      "st-menu__item--selected",
  );
}
function rowTabIndex(row: ExpandedRow, depth: number) {
  return row.action?.disabled
    ? undefined
    : rovingTarget(depth, levelRows(depth)) === row.index
      ? 0
      : -1;
}
const panelDepths = computed(() => [
  0,
  ...openPath.value
    .map((_, index) => index + 1)
    .filter((depth) => levelRows(depth).length > 0),
]);
</script>
<template>
  <div
    v-if="!hasCascade"
    v-bind="attrs"
    :id="rootId"
    ref="hostRef"
    :class="['st-menu', { 'st-menu--dense': props.dense }, props.class]"
    :role="props.role ?? 'menu'"
    data-menu-level="0"
  >
    <template
      v-for="row in levelRows(0)"
      :key="
        0 +
        '-' +
        row.kind +
        '-' +
        row.index +
        (row.action ? '-' + actionKey(row.action) : '')
      "
    >
      <div
        v-if="row.kind === 'divider'"
        class="st-menu__divider"
        role="separator"
        aria-hidden="true"
      />
      <div
        v-else-if="row.kind === 'group'"
        class="st-menu__group"
        :id="rootId + '--group-' + 0 + '-' + row.index"
        role="presentation"
      >
        <slot v-if="$slots['group-label']" name="group-label" :item="(row.item as MenuGroupItem)" :index="row.index" :depth="0" /><MenuLabel v-else :label="(row.item as MenuGroupItem).label" />
      </div>
      <button
        v-else
        :class="rowClass(row, 0)"
        type="button"
        role="menuitem"
        :data-item-index="row.index"
        :aria-disabled="row.action!.disabled ? 'true' : undefined"
        :disabled="row.action!.disabled"
        :tabindex="rowTabIndex(row, 0)"
        @click="selectItem(row.action!, indexPathFor(0, row.index), 'pointer')"
        @keydown="onItemKeyDown($event, 0, row.index, row.action!)"
        @pointerenter="onLeafPointerEnter(0, $event)"
        @focus="roving[0] = row.index"
      >
        <span
          v-if="row.action!.icon"
          class="st-menu__itemIcon"
          aria-hidden="true"
        >
          <template v-if="typeof row.action!.icon === 'string'">{{
            row.action!.icon
          }}</template>
          <component
            :is="row.action!.icon"
            v-else
            :size="16"
            :stroke-width="2"
          />
        </span>
        <span class="st-menu__itemLabel">
          <slot v-if="$slots['item-label']" name="item-label" :item="row.action!" :index="row.index" :depth="0" /><MenuLabel v-else :label="row.action!.label" />
        </span>
      </button>
    </template>
  </div>
  <div
    v-else
    v-bind="
      Object.fromEntries(
        Object.entries(attrs).filter(
          ([key]) => !['id', 'aria-label', 'aria-labelledby'].includes(key),
        ),
      )
    "
    ref="hostRef"
    :class="[
      'st-menu',
      { 'st-menu--dense': props.dense },
      'st-menu--hasCascade',
      props.class,
    ]"
    @pointermove="onHostPointerMove"
  >
    <div
      v-for="depth in panelDepths"
      :key="depth"
      :class="
        depth === 0
          ? 'st-menu__scroll'
          : ['st-menu', 'st-menu--submenu', { 'st-menu--dense': props.dense }]
      "
      :role="depth === 0 ? (props.role ?? 'menu') : 'menu'"
      :id="depth === 0 ? rootId : subId(depth - 1, openPath[depth - 1])"
      :aria-label="depth === 0 ? (attrs['aria-label'] as string) : undefined"
      :aria-labelledby="
        depth === 0
          ? (attrs['aria-labelledby'] as string)
          : parentButtonId(depth - 1, openPath[depth - 1])
      "
      :tabindex="-1"
      :data-menu-level="depth"
      :style="depth > 0 ? panelStyle(depth - 1) : undefined"
      @keydown="onLevelKeyDown($event, depth)"
      @pointerenter="depth > 0 && onPanelPointerEnter($event)"
      @pointerleave="depth > 0 && onPanelPointerLeave(depth - 1, $event)"
    >
      <template
        v-for="row in levelRows(depth)"
        :key="
          depth +
          '-' +
          row.kind +
          '-' +
          row.index +
          (row.action ? '-' + actionKey(row.action) : '')
        "
      >
        <div
          v-if="row.kind === 'divider'"
          class="st-menu__divider"
          role="separator"
          aria-hidden="true"
        />
        <div
          v-else-if="row.kind === 'group'"
          class="st-menu__group"
          :id="rootId + '--group-' + depth + '-' + row.index"
          role="presentation"
        >
          <slot v-if="$slots['group-label']" name="group-label" :item="(row.item as MenuGroupItem)" :index="row.index" :depth="depth" /><MenuLabel v-else :label="(row.item as MenuGroupItem).label" />
        </div>
        <div
          v-else-if="rowIsParent(row, depth)"
          class="st-menu__itemWrap"
          role="presentation"
          @pointerenter="
            !row.action!.disabled &&
            onParentPointerEnter(depth, row.index, $event)
          "
          @pointerleave="
            !row.action!.disabled &&
            onParentPointerLeave(depth, row.index, $event)
          "
        >
          <button
            :class="rowClass(row, depth)"
            type="button"
            role="menuitem"
            :id="parentButtonId(depth, row.index)"
            :data-item-index="row.index"
            aria-haspopup="menu"
            :aria-expanded="
              !row.action!.disabled && rowIsOpen(depth, row.index)
                ? 'true'
                : 'false'
            "
            :aria-controls="subId(depth, row.index)"
            :aria-disabled="row.action!.disabled ? 'true' : undefined"
            :disabled="row.action!.disabled"
            :tabindex="rowTabIndex(row, depth)"
            @click="!row.action!.disabled && toggleParent(depth, row.index)"
            @keydown="onItemKeyDown($event, depth, row.index, row.action!)"
            @focus="roving[depth] = row.index"
          >
            <span
              v-if="chevronSide(depth, row.index) === 'left'"
              class="st-menu__itemChevron st-menu__itemChevron--start"
              aria-hidden="true"
            >
              <component
                :is="ChevronLeft"
                :size="16"
                :stroke-width="2"
                aria-hidden="true"
              />
            </span>
            <span
              v-if="row.action!.icon"
              class="st-menu__itemIcon"
              aria-hidden="true"
            >
              <template v-if="typeof row.action!.icon === 'string'">{{
                row.action!.icon
              }}</template>
              <component
                :is="row.action!.icon"
                v-else
                :size="16"
                :stroke-width="2"
              />
            </span>
            <span class="st-menu__itemLabel">
              <slot v-if="$slots['item-label']" name="item-label" :item="row.action!" :index="row.index" :depth="depth" /><MenuLabel v-else :label="row.action!.label" />
            </span>
            <span
              v-if="chevronSide(depth, row.index) === 'right'"
              class="st-menu__itemChevron st-menu__itemChevron--end"
              aria-hidden="true"
            >
              <component
                :is="ChevronRight"
                :size="16"
                :stroke-width="2"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>
        <button
          v-else
          :class="rowClass(row, depth)"
          type="button"
          role="menuitem"
          :data-item-index="row.index"
          :aria-disabled="row.action!.disabled ? 'true' : undefined"
          :disabled="row.action!.disabled"
          :tabindex="rowTabIndex(row, depth)"
          @click="
            selectItem(row.action!, indexPathFor(depth, row.index), 'pointer')
          "
          @keydown="onItemKeyDown($event, depth, row.index, row.action!)"
          @pointerenter="onLeafPointerEnter(depth, $event)"
          @focus="roving[depth] = row.index"
        >
          <span
            v-if="row.action!.icon"
            class="st-menu__itemIcon"
            aria-hidden="true"
          >
            <template v-if="typeof row.action!.icon === 'string'">{{
              row.action!.icon
            }}</template>
            <component
              :is="row.action!.icon"
              v-else
              :size="16"
              :stroke-width="2"
            />
          </span>
          <span class="st-menu__itemLabel">
            <slot v-if="$slots['item-label']" name="item-label" :item="row.action!" :index="row.index" :depth="depth" /><MenuLabel v-else :label="row.action!.label" />
          </span>
        </button>
      </template>
    </div>
  </div>
</template>
