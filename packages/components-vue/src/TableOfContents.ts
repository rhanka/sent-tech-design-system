import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export interface TableOfContentsItem {
  id: string;
  label: string;
  level?: number;
}

export type TableOfContentsProps = {
  title?: string;
  items: TableOfContentsItem[];
  activeId?: string;
  class?: string;
};

const normalizeItemId = (value: string) => value.replace(/^#/, "");

export const TableOfContents = defineComponent({
  name: "TableOfContents",
  props: {
    title: { type: String, default: undefined },
    items: { type: Array as () => TableOfContentsItem[], required: true },
    activeId: { type: String, default: "" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const normalizedActive = normalizeItemId(props.activeId);
      const normalizedItems = props.items.map((item) => ({
        ...item,
        id: normalizeItemId(item.id),
        level: Math.max(item.level ?? 1, 1),
      }));
      return h(
        "nav",
        {
          ...attrs,
          class: classNames("st-tableOfContents", props.class),
          "aria-label": props.title ?? "Table des matières",
        },
        [
          props.title ? h("p", { class: "st-tableOfContents__title" }, props.title) : null,
          h(
            "ol",
            { class: "st-tableOfContents__list" },
            normalizedItems.map((item) =>
              h(
                "li",
                {
                  key: item.id,
                  class: "st-tableOfContents__item",
                  style: { "--st-tableOfContents-level": String(item.level - 1) },
                },
                h(
                  "a",
                  {
                    class: "st-tableOfContents__link",
                    href: `#${item.id}`,
                    "aria-current": item.id === normalizedActive ? "location" : undefined,
                  },
                  item.label,
                ),
              ),
            ),
          ),
        ],
      );
    };
  },
});
