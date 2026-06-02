import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type StructuredListItem = {
  term?: unknown;
  label?: unknown;
  description?: unknown;
  value?: unknown;
};

export type StructuredListProps = {
  items: StructuredListItem[];
  bordered?: boolean;
  class?: string;
};

export const StructuredList = defineComponent({
  name: "StructuredList",
  props: {
    items: { type: Array as () => StructuredListItem[], required: true },
    bordered: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "dl",
        {
          ...attrs,
          class: classNames(
            "st-structuredList",
            props.bordered && "st-structuredList--bordered",
            props.class,
          ),
        },
        props.items.map((item, index) =>
          h("div", { key: index, class: "st-structuredList__row" }, [
            h(
              "dt",
              { class: "st-structuredList__term" },
              (item.term ?? item.label) as string,
            ),
            h(
              "dd",
              { class: "st-structuredList__definition" },
              (item.description ?? item.value) as string,
            ),
          ]),
        ),
      );
  },
});
