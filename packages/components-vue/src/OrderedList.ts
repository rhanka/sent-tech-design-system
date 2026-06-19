import { defineComponent, h, type VNodeChild } from "vue";
import { classNames } from "./classNames.js";

// Forme item alignée sur le canon Svelte : `content` (+ `label` en alias compat).
export type OrderedListItem = { content?: unknown; children?: OrderedListInput[] };
export type OrderedListInput = unknown;

export type OrderedListProps = {
  items: OrderedListInput[];
  nested?: boolean;
  class?: string;
};

function renderNested(children: OrderedListInput[], ordered: boolean): VNodeChild {
  return h(
    ordered ? "ol" : "ul",
    {
      class: ordered
        ? "st-orderedList st-orderedList--nested"
        : "st-unorderedList st-unorderedList--nested",
    },
    children.map((child, index) => renderListItem(child, index, ordered)),
  );
}

function renderListItem(item: OrderedListInput, index: number, ordered: boolean): VNodeChild {
  if (
    typeof item === "object" &&
    item !== null &&
    "content" in (item as Record<string, unknown>)
  ) {
    const cast = item as OrderedListItem;
    const hasChildren = Array.isArray(cast.children) && cast.children.length > 0;
    return h(
      "li",
      {
        key: index,
        class: ordered ? "st-orderedList__item" : "st-unorderedList__item",
      },
      [
        cast.content as VNodeChild,
        ...(hasChildren ? [renderNested(cast.children as OrderedListInput[], ordered)] : []),
      ],
    );
  }
  return h(
    "li",
    {
      key: index,
      class: ordered ? "st-orderedList__item" : "st-unorderedList__item",
    },
    [item] as import("vue").VNodeArrayChildren,
  );
}

export const OrderedList = defineComponent({
  name: "OrderedList",
  props: {
    items: { type: Array as () => OrderedListInput[], required: true },
    nested: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "ol",
        {
          ...attrs,
          class: classNames("st-orderedList", props.nested && "st-orderedList--nested", props.class),
        },
        props.items.map((item, index) => renderListItem(item, index, true)) as VNodeChild[],
      );
  },
});
