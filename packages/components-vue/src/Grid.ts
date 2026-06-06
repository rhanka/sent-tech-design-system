import { defineComponent, h } from "vue";
import type { CSSProperties } from "vue";
import { classNames } from "./classNames.js";
import { spacingToken } from "./Flex.js";

export type GridProps = {
  /** Number of equal columns: `repeat(columns, minmax(0, 1fr))`. */
  columns?: number;
  /**
   * Responsive auto mode: `repeat(auto-fill, minmax(minItemWidth, 1fr))`.
   * Takes priority over `columns` when provided.
   */
  minItemWidth?: string;
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  as?: string;
  class?: string;
};

/** Resolve the `grid-template-columns` value. `minItemWidth` (responsive
    auto-fill) wins over a fixed column count. */
export function gridTemplateColumns(
  columns: number | undefined,
  minItemWidth: string | undefined,
): string | undefined {
  if (minItemWidth != null && minItemWidth !== "") {
    return `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`;
  }
  if (columns != null) {
    const clamped = Math.max(1, Math.round(columns));
    return `repeat(${clamped}, minmax(0, 1fr))`;
  }
  return undefined;
}

export const Grid = defineComponent({
  name: "Grid",
  props: {
    columns: { type: Number, default: undefined },
    minItemWidth: { type: String, default: undefined },
    gap: { type: Number, default: undefined },
    as: { type: String, default: "div" },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const style: CSSProperties = {
        display: "grid",
        gridTemplateColumns: gridTemplateColumns(props.columns, props.minItemWidth),
        gap: spacingToken(props.gap),
        ...(attrs.style as CSSProperties | undefined),
      };
      return h(
        props.as,
        {
          ...attrs,
          class: classNames("st-grid", props.class),
          style,
        },
        slots.default?.(),
      );
    };
  },
});
