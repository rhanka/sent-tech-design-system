// Pure geometry helpers for the Menu cascade (spec SPEC_EVOL_MENU_CASCADE §3.3/§3.4).
// No DOM access here: every function is deterministic and unit-testable in jsdom/Node.

export const OPEN_DELAY = 150;
export const CLOSE_DELAY = 250;

export const VIEWPORT_MARGIN = 8;
export const SUBMENU_PANEL_PADDING_TOP = 5;
export const SUBMENU_DEFAULT_WIDTH = 192;

export type SubMenuSide = "auto" | "left" | "right";
export type ResolvedSubMenuSide = "left" | "right";

export interface CascadeRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface CascadePoint {
  x: number;
  y: number;
}

export interface SubMenuPanelSize {
  width: number;
  height: number;
}

export interface SubMenuViewport {
  width: number;
  height: number;
}

export interface ComputeSubMenuPositionInput {
  parentMenuRect: Pick<CascadeRect, "left" | "right">;
  parentItemRect: Pick<CascadeRect, "top">;
  panelSize: SubMenuPanelSize;
  viewport: SubMenuViewport;
  preferredSide: SubMenuSide;
  panelPaddingTop?: number;
}

export interface SubMenuPosition {
  side: ResolvedSubMenuSide;
  top: number;
  left: number;
  maxHeight?: number;
}

export function resolvePreferredSide(preferred: SubMenuSide): ResolvedSubMenuSide {
  if (preferred === "left") return "left";
  return "right";
}

/**
 * Deterministic sub-menu solver (§3.4). Returns viewport coordinates for a
 * `position: fixed` panel; the caller converts them with
 * `toContainingBlockPosition` when the panel sits under a transformed ancestor.
 */
export function computeSubMenuPosition(input: ComputeSubMenuPositionInput): SubMenuPosition {
  const {
    parentMenuRect,
    parentItemRect,
    panelSize,
    viewport,
    preferredSide,
    panelPaddingTop = SUBMENU_PANEL_PADDING_TOP
  } = input;
  const vw = viewport.width;
  const vh = viewport.height;
  const width = panelSize.width;
  const height = panelSize.height;
  const W = width > 0 ? width : SUBMENU_DEFAULT_WIDTH;
  const H = height;
  const preferred = resolvePreferredSide(preferredSide);
  const other: ResolvedSubMenuSide = preferred === "right" ? "left" : "right";

  const spaceRight = vw - VIEWPORT_MARGIN - parentMenuRect.right;
  const spaceLeft = parentMenuRect.left - VIEWPORT_MARGIN;
  const fits = (space: number) => space >= W;

  let side: ResolvedSubMenuSide;
  if (fits(preferred === "right" ? spaceRight : spaceLeft)) {
    side = preferred;
  } else if (fits(other === "right" ? spaceRight : spaceLeft)) {
    side = other;
  } else if (spaceRight === spaceLeft) {
    side = preferred;
  } else {
    side = spaceRight > spaceLeft ? "right" : "left";
  }

  let left = side === "right" ? parentMenuRect.right : parentMenuRect.left - W;
  if (W <= vw - 2 * VIEWPORT_MARGIN) {
    const min = VIEWPORT_MARGIN;
    const max = vw - VIEWPORT_MARGIN - W;
    if (left < min) left = min;
    else if (left > max) left = max;
  } else {
    // Narrow viewport: cap the panel via `min-width: 0` +
    // `max-width: calc(100vw - 16px)` so the 12rem CSS `min-width` cannot
    // override the cap (§3.4 step 3). The component applies those styles when
    // `isCappedSubMenuWidth` holds; the solver pins the origin.
    left = VIEWPORT_MARGIN;
  }

  let top = parentItemRect.top - panelPaddingTop;
  if (H > vh - 2 * VIEWPORT_MARGIN) {
    return { side, top: VIEWPORT_MARGIN, left, maxHeight: vh - 2 * VIEWPORT_MARGIN };
  }
  if (H > 0) {
    if (top + H > vh - VIEWPORT_MARGIN) top = vh - VIEWPORT_MARGIN - H;
    if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN;
    return { side, top, left };
  }
  // Unknown height (first frame): align on the parent line with only the
  // top clamp; the bottom clamp SHALL NOT apply (it would pin the panel to
  // the viewport bottom before measurement).
  if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN;
  return { side, top, left };
}

/** Context key through which a host (`MenuPopover`, `OverflowMenu`) shares its
 * root menu id and close entrypoint with an inner `Menu`. Internal only: no
 * public prop carries it (§2.2, D5). */
export const MENU_HOST_CONTEXT = "st-menu-host";

export interface MenuHostCloseOptions {
  focusTrigger: boolean;
}

export interface MenuHostContext {
  rootMenuId: string;
  requestClose: (options: MenuHostCloseOptions) => void;
  setHasCascade?: (hasCascade: boolean) => void;
}

/** True when the viewport is too narrow for the panel: the caller must apply
 * `min-width: 0` with `max-width: calc(100vw - 16px)` (§3.4 step 3). */
export function isCappedSubMenuWidth(panelWidth: number, viewportWidth: number): boolean {
  const W = panelWidth > 0 ? panelWidth : SUBMENU_DEFAULT_WIDTH;
  return W > viewportWidth - 2 * VIEWPORT_MARGIN;
}

function sign(p: CascadePoint, a: CascadePoint, b: CascadePoint): number {
  return (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
}

/**
 * Inclusive-edge point-in-triangle test (§3.3 step 3). Points on an edge count
 * as inside so a pointer grazing the triangle border never drops the panel.
 */
export function pointInSafeTriangle(
  p: CascadePoint,
  a: CascadePoint,
  b: CascadePoint,
  c: CascadePoint
): boolean {
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

export interface ContainingBlockPosition {
  top: number;
  left: number;
}

export interface ContainingBlockRect {
  top: number;
  left: number;
}

/** Convert viewport coordinates into the containing-block frame (D3, §3.4). */
export function toContainingBlockPosition(
  viewportPosition: ContainingBlockPosition,
  containingBlockRect: ContainingBlockRect | null | undefined
): ContainingBlockPosition {
  return {
    top: viewportPosition.top - (containingBlockRect?.top ?? 0),
    left: viewportPosition.left - (containingBlockRect?.left ?? 0)
  };
}
