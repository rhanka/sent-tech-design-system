import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ContentSwitcherSize = "sm" | "md" | "lg";

export type ContentSwitcherItem = {
  id?: string;
  value?: string;
  label: unknown;
  disabled?: boolean;
};

export type ContentSwitcherProps = {
  items: ContentSwitcherItem[];
  value?: string;
  activeId?: string;
  size?: ContentSwitcherSize;
  class?: string;
};

function idFrom(
  item: { id?: string; value?: string },
  index: number,
  prefix: string,
): string {
  return item.id ?? item.value ?? `${prefix}-${index}`;
}

export const ContentSwitcher = defineComponent({
  name: "ContentSwitcher",
  props: {
    items: { type: Array as () => ContentSwitcherItem[], required: true },
    value: { type: String, default: undefined },
    activeId: { type: String, default: undefined },
    size: {
      type: String as () => ContentSwitcherSize,
      default: "md",
    },
    class: { type: String, default: undefined },
  },
  emits: ["change"],
  setup(props, { emit, attrs }) {
    return () => {
      const current =
        props.value ??
        props.activeId ??
        idFrom(props.items[0] ?? {}, 0, "content");

      return h(
        "div",
        {
          ...attrs,
          class: classNames(
            "st-contentSwitcher",
            `st-contentSwitcher--${props.size}`,
            props.class,
          ),
          role: "group",
        },
        props.items.map((item, index) => {
          const itemId = idFrom(item, index, "content");
          return h(
            "button",
            {
              key: itemId,
              type: "button",
              class: classNames(
                "st-contentSwitcher__option st-contentSwitcher__button",
                itemId === current && "st-contentSwitcher__option--selected",
              ),
              disabled: item.disabled,
              "aria-pressed": itemId === current,
              onClick: () => emit("change", itemId),
            },
            item.label as string,
          );
        }),
      );
    };
  },
});
