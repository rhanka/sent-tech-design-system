import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type PopperStrategy = "absolute" | "fixed";

export type PopperPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export type PopperSide = "top" | "bottom" | "left" | "right";

export type PopperAlign = "start" | "center" | "end";

export type PopperProps = {
  /** Reference element the panel is positioned against. */
  anchor: HTMLElement | null;
  /** Controlled open state. When false (or no anchor) nothing renders. */
  open?: boolean;
  /** Wanted placement of the panel relative to the anchor. */
  placement?: PopperPlacement;
  /** Main-axis distance (px) between the anchor and the panel. */
  offset?: number;
  /** Flip to the opposite side when the panel would overflow the viewport. */
  flip?: boolean;
  /** Shift along the cross axis to keep the panel within the viewport. */
  shift?: boolean;
  /** Expose a positioned arrow element. */
  arrow?: boolean;
  /** CSS positioning strategy. */
  strategy?: PopperStrategy;
  /** Render the panel into `document.body` via a Teleport. */
  portal?: boolean;
  /** Optional class applied to the floating panel. */
  class?: string;
  /** Notified whenever the resolved placement changes (after flip). */
  onPlacementChange?: (placement: PopperPlacement) => void;
  /**
   * (a11y, opt-in) When true, traps keyboard focus inside the panel while it
   * is open (Tab cycles through focusable children; Shift+Tab cycles backward).
   * Intended for modal overlays built on top of Popper. Non-modal usage (menus,
   * tooltips) should leave this false (default) to keep the natural tab order.
   */
  trapFocus?: boolean;
  /**
   * (a11y) When true (default when open), pressing Escape calls `onClose` so
   * the consumer can set `open = false`. Set to false to suppress this behavior.
   */
  closeOnEscape?: boolean;
  /**
   * Called when the panel requests closing (Escape key, or future outside-click).
   * The consumer is responsible for updating `open` in response.
   */
  onClose?: () => void;
};

export type Rect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

const OPPOSITE: Record<PopperSide, PopperSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

export function splitPlacement(placement: PopperPlacement): {
  side: PopperSide;
  align: PopperAlign;
} {
  const [side, align] = placement.split("-") as [PopperSide, PopperAlign?];
  return { side, align: align ?? "center" };
}

export function joinPlacement(side: PopperSide, align: PopperAlign): PopperPlacement {
  return (align === "center" ? side : `${side}-${align}`) as PopperPlacement;
}

export function computePosition(
  anchorRect: Rect,
  panelWidth: number,
  panelHeight: number,
  options: {
    placement: PopperPlacement;
    offset: number;
    flip: boolean;
    shift: boolean;
    viewportWidth: number;
    viewportHeight: number;
  },
): { placement: PopperPlacement; top: number; left: number } {
  const { offset, flip, shift, viewportWidth, viewportHeight } = options;
  let { side, align } = splitPlacement(options.placement);

  const place = (s: PopperSide, a: PopperAlign) => {
    let top = 0;
    let left = 0;
    if (s === "top" || s === "bottom") {
      top = s === "top" ? anchorRect.top - panelHeight - offset : anchorRect.bottom + offset;
      if (a === "start") left = anchorRect.left;
      else if (a === "end") left = anchorRect.right - panelWidth;
      else left = anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
    } else {
      left = s === "left" ? anchorRect.left - panelWidth - offset : anchorRect.right + offset;
      if (a === "start") top = anchorRect.top;
      else if (a === "end") top = anchorRect.bottom - panelHeight;
      else top = anchorRect.top + anchorRect.height / 2 - panelHeight / 2;
    }
    return { top, left };
  };

  if (flip) {
    const candidate = place(side, align);
    const overflows =
      (side === "top" && candidate.top < 0) ||
      (side === "bottom" && candidate.top + panelHeight > viewportHeight) ||
      (side === "left" && candidate.left < 0) ||
      (side === "right" && candidate.left + panelWidth > viewportWidth);
    if (overflows) {
      const flipped = OPPOSITE[side];
      const flippedPos = place(flipped, align);
      const flippedOverflows =
        (flipped === "top" && flippedPos.top < 0) ||
        (flipped === "bottom" && flippedPos.top + panelHeight > viewportHeight) ||
        (flipped === "left" && flippedPos.left < 0) ||
        (flipped === "right" && flippedPos.left + panelWidth > viewportWidth);
      if (!flippedOverflows) side = flipped;
    }
  }

  let { top, left } = place(side, align);
  if (shift) {
    if (side === "top" || side === "bottom") {
      const max = Math.max(0, viewportWidth - panelWidth);
      left = Math.min(Math.max(0, left), max);
    } else {
      const max = Math.max(0, viewportHeight - panelHeight);
      top = Math.min(Math.max(0, top), max);
    }
  }

  return { placement: joinPlacement(side, align), top, left };
}

@Component({
  selector: "st-popper",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Popper {
  static readonly stComponentName = "Popper";
  readonly componentName = "Popper";
  @NgInput() anchor!: HTMLElement | null;
  @NgInput() open?: boolean;
  @NgInput() placement?: PopperPlacement;
  @NgInput() offset?: number;
  @NgInput() flip?: boolean;
  @NgInput() shift?: boolean;
  @NgInput() arrow?: boolean;
  @NgInput() strategy?: PopperStrategy;
  @NgInput() portal?: boolean;
  @NgInput("class") classInput?: string;
  @NgInput() onPlacementChange?: (placement: PopperPlacement) => void;
  @NgInput() trapFocus?: boolean;
  @NgInput() closeOnEscape?: boolean;
  @NgInput() onClose?: () => void;

  get hostClass(): string {
    return ["st-popper", this.classInput].filter(Boolean).join(" ");
  }
}
