import { defineComponent, h, type VNodeChild } from "vue";
import { classNames } from "./classNames.js";

export type OrderedListItem = { label: unknown; children?: OrderedListInput[] };
export type OrderedListInput = unknown;

export type OrderedListProps = {
  items: OrderedListInput[];
  class?: string;
};

function renderListItem(item: OrderedListInput, index: number, ordered: boolean): VNodeChild {
  if (
    typeof item === "object" &&
    item !== null &&
    "label" in (item as Record<string, unknown>)
  ) {
    const cast = item as OrderedListItem;
    return h(
      "li",
      {
        key: index,
        class: ordered ? "st-orderedList__item" : "st-unorderedList__item",
      },
      [
        String(cast.label ?? ""),
        cast.children
          ? ordered
            ? h(OrderedList, { items: cast.children })
            : h(UnorderedListHelper, { items: cast.children })
          : null,
      ],
    );
  }
  return h(
    "li",
    {
      key: index,
      class: ordered ? "st-orderedList__item" : "st-unorderedList__item",
    },
    String(item ?? ""),
  );
}

export const OrderedList = defineComponent({
  name: "OrderedList",
  props: {
    items: { type: Array as () => OrderedListInput[], required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "ol",
        {
          ...attrs,
          class: classNames("st-orderedList st-ol", props.class),
        },
        props.items.map((item, index) => renderListItem(item, index, true)) as VNodeChild[],
      );
  },
});

// Internal helper to avoid circular import issues
const UnorderedListHelper = defineComponent({
  name: "UnorderedList",
  props: {
    items: { type: Array as () => OrderedListInput[], required: true },
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
        props.items.map((item, index) => renderListItem(item, index, false)) as VNodeChild[],
      );
  },
});
