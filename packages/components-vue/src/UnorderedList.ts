import { defineComponent, h, type VNodeChild } from "vue";
import { classNames } from "./classNames.js";

// Forme item alignée sur le canon Svelte : `content` (+ `label` en alias compat).
export type UnorderedListItem = { content?: unknown; label?: unknown; children?: UnorderedListInput[] };
export type UnorderedListInput = unknown;

export type UnorderedListProps = {
  items: UnorderedListInput[];
  class?: string;
};

function renderListItem(item: UnorderedListInput, index: number): VNodeChild {
  if (
    typeof item === "object" &&
    item !== null &&
    ("content" in (item as Record<string, unknown>) || "label" in (item as Record<string, unknown>))
  ) {
    const cast = item as UnorderedListItem;
    const hasChildren = Array.isArray(cast.children) && cast.children.length > 0;
    return h(
      "li",
      {
        key: index,
        class: "st-unorderedList__item",
      },
      [
        String((cast.content ?? cast.label) ?? ""),
        hasChildren
          ? h(
              "ul",
              { class: "st-unorderedList st-unorderedList--nested" },
              (cast.children as UnorderedListInput[]).map((child, childIndex) =>
                renderListItem(child, childIndex),
              ),
            )
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
