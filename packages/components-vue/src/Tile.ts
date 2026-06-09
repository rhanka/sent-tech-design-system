import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type TileVariant = "static" | "clickable" | "selectable";

export type TileProps = {
  title?: unknown;
  description?: unknown;
  variant?: TileVariant;
  /** Pour `clickable` : si fourni, rend un `<a>`, sinon un `<button>`. */
  href?: string;
  /** Pour `selectable` : état coché. */
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
    href: { type: String, default: undefined },
    selected: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  emits: ["select"],
  setup(props, { slots, attrs, emit }) {
    return () => {
      const tileClass = classNames(
        "st-tile",
        `st-tile--${props.variant}`,
        props.variant === "selectable" && props.selected && "st-tile--selected",
        props.disabled && "st-tile--disabled",
        props.class,
      );

      const bodyChildren = slots.default
        ? [slots.default()]
        : [
            props.title
              ? h("span", { class: "st-tile__title" }, props.title as string)
              : null,
            props.description
              ? h("span", { class: "st-tile__description" }, props.description as string)
              : null,
          ];
      const body = h("span", { class: "st-tile__content" }, bodyChildren);

      if (props.variant === "clickable" && props.href) {
        return h(
          "a",
          {
            ...attrs,
            class: tileClass,
            href: props.href,
            "aria-disabled": props.disabled ? "true" : undefined,
          },
          [body],
        );
      }
      if (props.variant === "clickable") {
        return h(
          "button",
          { ...attrs, type: "button", class: tileClass, disabled: props.disabled },
          [body],
        );
      }
      if (props.variant === "selectable") {
        return h("label", { class: tileClass }, [
          h("input", {
            type: "checkbox",
            class: "st-tile__input",
            checked: props.selected,
            disabled: props.disabled,
            onChange: (event: Event) =>
              emit("select", (event.target as HTMLInputElement).checked),
          }),
          body,
        ]);
      }
      return h("div", { ...attrs, class: tileClass }, [body]);
    };
  },
});
