// Margin-gutter pin vertical layout (SPEC-r6 §3: sort Y, gap 28px, clamped).

export const DEFAULT_PIN_GAP = 28;

export interface PinInput {
  id: string;
  /** Desired Y coordinate in container space (px). */
  targetY: number;
  /** Optional minimum slot height occupied by this pin (defaults to `gap`). */
  height?: number;
}

export interface PinLayoutOptions {
  /** Minimum vertical distance between consecutive pin tops in px (default 28). */
  gap?: number;
  /** Minimum Y coordinate in px (default 0). */
  minY?: number;
  /** Optional maximum Y coordinate in px (inclusive). */
  maxY?: number;
}

export interface PositionedPin {
  id: string;
  targetY: number;
  y: number;
  /** 1-based document order index. */
  index: number;
}

/**
 * Computes non-overlapping, clamped margin-gutter positions for comment pins:
 * 1. Stable-sort by `targetY` ascending (assigning 1-based `index`).
 * 2. Forward pass: start at `max(minY, targetY)` and enforce at least `gap` (28px)
 *    separation from the previous pin.
 * 3. Bottom clamping (when `maxY` is provided): push upward from `maxY` while
 *    preserving separation; if the available span `maxY - minY` is shorter than
 *    the total required spacing, distribute monotonically inside `[minY, maxY]`.
 */
export function layoutPins(
  pins: readonly PinInput[],
  options?: PinLayoutOptions,
): PositionedPin[] {
  if (pins.length === 0) {
    return [];
  }

  const gap = Math.max(0, options?.gap ?? DEFAULT_PIN_GAP);
  const minY = options?.minY ?? 0;
  const maxY =
    options?.maxY !== undefined && Number.isFinite(options.maxY)
      ? Math.max(minY, options.maxY)
      : undefined;

  const sorted = pins
    .map((pin, order) => ({ pin, order }))
    .sort((left, right) => {
      if (left.pin.targetY !== right.pin.targetY) {
        return left.pin.targetY - right.pin.targetY;
      }
      return left.order - right.order;
    });

  const n = sorted.length;
  const steps: number[] = sorted.map((entry) => Math.max(gap, entry.pin.height ?? gap));
  const ys: number[] = new Array<number>(n);

  // Forward pass (top-to-bottom)
  ys[0] = Math.max(minY, sorted[0]!.pin.targetY);
  for (let i = 1; i < n; i++) {
    ys[i] = Math.max(sorted[i]!.pin.targetY, ys[i - 1]! + steps[i - 1]!);
  }

  // Bottom clamping pass
  if (maxY !== undefined && ys[n - 1]! > maxY) {
    ys[n - 1] = maxY;
    for (let i = n - 2; i >= 0; i--) {
      const ceiling = ys[i + 1]! - steps[i]!;
      if (ys[i]! > ceiling) {
        ys[i] = ceiling;
      }
    }

    // Overcrowded container fallback: distribute monotonically within [minY, maxY]
    if (ys[0]! < minY) {
      if (n === 1 || maxY === minY) {
        for (let i = 0; i < n; i++) {
          ys[i] = minY;
        }
      } else {
        const span = maxY - minY;
        for (let i = 0; i < n; i++) {
          ys[i] = minY + (i / (n - 1)) * span;
        }
      }
    }
  }

  return sorted.map((entry, idx) => ({
    id: entry.pin.id,
    targetY: entry.pin.targetY,
    y: ys[idx]!,
    index: idx + 1,
  }));
}
