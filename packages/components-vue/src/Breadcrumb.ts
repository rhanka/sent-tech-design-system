import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export interface BreadcrumbItem {
  label: unknown;
  href?: string;
  current?: boolean;
}

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  label?: string;
  class?: string;
};

export const Breadcrumb = defineComponent({
  name: "Breadcrumb",
  props: {
    items: { type: Array as () => BreadcrumbItem[], required: true },
    label: { type: String, default: "Breadcrumb" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "nav",
        {
          ...attrs,
          class: classNames("st-breadcrumb", props.class),
          "aria-label": props.label,
        },
        [
          h(
            "ol",
            {},
            props.items.map((item, index) =>
              h("li", { key: index }, [
                item.href && !item.current
                  ? h("a", { href: item.href }, item.label as string)
                  : h(
                      "span",
                      {
                        "aria-current": item.current ? "page" : undefined,
                      },
                      item.label as string,
                    ),
                index < props.items.length - 1
                  ? h(
                      "span",
                      { class: "st-breadcrumb__separator" },
                      "/",
                    )
                  : null,
              ]),
            ),
          ),
        ],
      );
  },
});
