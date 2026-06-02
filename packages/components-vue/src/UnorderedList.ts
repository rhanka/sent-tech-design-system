import { defineComponent, h, type VNodeChild } from "vue";
import { classNames } from "./classNames.js";

export type UnorderedListItem = { label: unknown; children?: UnorderedListInput[] };
export type UnorderedListInput = unknown;

export type UnorderedListProps = {
  items: UnorderedListInput[];
  class?: string;
};

function renderListItem(item: UnorderedListInput, index: number): VNodeChild {
  if (
    typeof item === "object" &&
    item !== null &&
    "label" in (item as Record<string, unknown>)
  ) {
    const cast = item as UnorderedListItem;
    return h(
      "li",
      {
        key: index,
        class: "st-unorderedList__item",
      },
      [
        String(cast.label ?? ""),
        cast.children
          ? h(UnorderedList, { items: cast.children })
          : null,
      ],
    );
  }
  return h(
    "li",
    {
      key: index,
      class: "st-unorderedList__item",
    },
    String(item ?? ""),
  );
}

export const UnorderedList = defineComponent({
  name: "UnorderedList",
  props: {
    items: { type: Array as () => UnorderedListInput[], required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "ul",
        {
          ...attrs,
          class: classNames("st-unorderedList", props.class),
        },
        props.items.map((item, index) => renderListItem(item, index)) as VNodeChild[],
      );
  },
});
