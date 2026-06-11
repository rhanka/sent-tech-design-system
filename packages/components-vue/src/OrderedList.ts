import { defineComponent, h, type VNodeChild } from "vue";
import { classNames } from "./classNames.js";

// Forme item alignée sur le canon Svelte : `content` (+ `label` en alias compat).
export type OrderedListItem = { content?: unknown; label?: unknown; children?: OrderedListInput[] };
export type OrderedListInput = unknown;

export type OrderedListProps = {
  items: OrderedListInput[];
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
    ("content" in (item as Record<string, unknown>) || "label" in (item as Record<string, unknown>))
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
        String((cast.content ?? cast.label) ?? ""),
        hasChildren ? renderNested(cast.children as OrderedListInput[], ordered) : null,
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
          class: classNames("st-orderedList", props.class),
        },
        props.items.map((item, index) => renderListItem(item, index, true)) as VNodeChild[],
      );
  },
});
