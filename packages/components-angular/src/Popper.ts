import {
  Component,
  ElementRef,
  Input as NgInput,
  ViewChild,
} from "@angular/core";
import type { AfterViewInit, OnChanges, OnDestroy } from "@angular/core";

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
    @if (open && anchor) {
      <div
        #panel
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [attr.data-popper-placement]="resolvedPlacement"
        [style]="panelStyle"
        [attr.tabindex]="trapFocus ? -1 : null"
      >
        <ng-content></ng-content>
        @if (arrow) {
          <span
            class="st-popper__arrow"
            [attr.data-popper-side]="panelSide"
            aria-hidden="true"
          ></span>
        }
      </div>
    }
  `,
})
export class Popper implements AfterViewInit, OnChanges, OnDestroy {
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

  @ViewChild("panel") panel?: ElementRef<HTMLDivElement>;

  top = 0;
  left = 0;
  private flippedPlacement?: PopperPlacement;
  private onScroll = () => this.reposition();
  private onResize = () => this.reposition();
  private onDocKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.open && (this.closeOnEscape ?? true)) {
      e.preventDefault();
      this.onClose?.();
    }
  };

  get resolvedPlacement(): PopperPlacement {
    return this.flippedPlacement ?? this.placement ?? "bottom";
  }

  get panelSide(): PopperSide {
    return splitPlacement(this.resolvedPlacement).side;
  }

  get panelStyle(): string {
    const strategy = this.strategy ?? "absolute";
    return `position: ${strategy}; top: ${this.top}px; left: ${this.left}px;`;
  }

  get hostClass(): string {
    return classNames("st-popper", this.classInput);
  }

  ngAfterViewInit(): void {
    if (typeof window === "undefined") return;
    window.addEventListener("scroll", this.onScroll, true);
    window.addEventListener("resize", this.onResize);
    document.addEventListener("keydown", this.onDocKeydown);
    this.reposition();
  }

  ngOnChanges(): void {
    if (typeof window === "undefined") return;
    // Recompute after Angular renders the panel for the new state.
    queueMicrotask(() => this.reposition());
  }

  ngOnDestroy(): void {
    if (typeof window === "undefined") return;
    window.removeEventListener("scroll", this.onScroll, true);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("keydown", this.onDocKeydown);
  }

  private reposition(): void {
    if (typeof window === "undefined") return;
    const panelEl = this.panel?.nativeElement;
    if (!this.open || !this.anchor || !panelEl) return;

    const anchorRect = this.anchor.getBoundingClientRect();
    const panelRect = panelEl.getBoundingClientRect();
    const strategy = this.strategy ?? "absolute";

    const result = computePosition(
      {
        top: anchorRect.top,
        left: anchorRect.left,
        right: anchorRect.right,
        bottom: anchorRect.bottom,
        width: anchorRect.width,
        height: anchorRect.height,
      },
      panelRect.width,
      panelRect.height,
      {
        placement: this.placement ?? "bottom",
        offset: this.offset ?? 8,
        flip: this.flip ?? true,
        shift: this.shift ?? true,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      },
    );

    if (strategy === "absolute") {
      this.top = result.top + window.scrollY;
      this.left = result.left + window.scrollX;
    } else {
      this.top = result.top;
      this.left = result.left;
    }

    if (result.placement !== this.resolvedPlacement) {
      this.flippedPlacement = result.placement;
      this.onPlacementChange?.(result.placement);
    }
  }
}
