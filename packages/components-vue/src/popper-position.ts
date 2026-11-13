import type { PopperPlacement, PopperSide, PopperAlign, Rect } from './Popper.js';

/** Split a placement into its side and (optional) alignment. */
export function splitPlacement(placement: PopperPlacement): {
  side: PopperSide;
  align: PopperAlign;
} {
  const [side, align] = placement.split("-") as [PopperSide, PopperAlign?];
  return { side, align: align ?? "center" };
}

/** Recompose a side + alignment into a placement string. */
export function joinPlacement(side: PopperSide, align: PopperAlign): PopperPlacement {
  return (align === "center" ? side : `${side}-${align}`) as PopperPlacement;
}

const OPPOSITE: Record<PopperSide, PopperSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};



/**
 * Pure geometry: compute the panel coordinates (in the chosen strategy's
 * coordinate space) given the anchor rect, the panel size, and options.
 * Returns the resolved placement (after flip) and the top/left coordinates,
 * plus the arrow offset along the main edge.
 *
 * Coordinates are viewport-relative; callers add scroll offsets for the
 * `absolute` strategy. No DOM access here — safe to unit test.
 */
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

  // Flip: if the panel overflows on the chosen side, try the opposite side.
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
      // Only flip if the opposite side fits better.
      if (!flippedOverflows) side = flipped;
    }
  }

  let { top, left } = place(side, align);

  // Shift: clamp along the cross axis so the panel stays in the viewport.
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
