import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type TileVariant = "static" | "clickable" | "selectable";

export type TileProps = {
  title?: unknown;
  description?: unknown;
  variant?: TileVariant;
  selected?: boolean;
  disabled?: boolean;
  class?: string;
};

export const Tile = defineComponent({
  name: "Tile",
  props: {
    title: { type: [String, Object] as unknown as () => unknown, default: undefined },
    description: { type: [String, Object] as unknown as () => unknown, default: undefined },
    variant: { type: String as () => TileVariant, default: "static" },
    selected: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "section",
        {
          ...attrs,
          class: classNames(
            "st-tile",
            `st-tile--${props.variant}`,
            props.selected && "st-tile--selected",
            props.disabled && "st-tile--disabled",
            props.class,
          ),
        },
        [
          h("div", { class: "st-tile__content" }, [
            props.title
              ? h(
                  "h3",
                  { class: "st-tile__title" },
                  props.title as string,
                )
              : null,
            props.description
              ? h(
                  "p",
                  { class: "st-tile__description" },
                  props.description as string,
                )
              : null,
            slots.default?.(),
          ]),
        ],
      );
  },
});
