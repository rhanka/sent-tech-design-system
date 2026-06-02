import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type PaginationNavProps = {
  page?: number;
  totalPages?: number;
  previousHref?: string;
  nextHref?: string;
  class?: string;
};

export const PaginationNav = defineComponent({
  name: "PaginationNav",
  props: {
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
    previousHref: { type: String, default: undefined },
    nextHref: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const page = props.page ?? 1;
      const totalPages = props.totalPages ?? 1;

      return h(
        "nav",
        {
          ...attrs,
          class: classNames("st-paginationNav", props.class),
          "aria-label": "Pagination navigation",
        },
        [
          props.previousHref
            ? h("a", { href: props.previousHref }, "Previous")
            : h("button", { type: "button", disabled: page <= 1 }, "Previous"),
          h(
            "ol",
            { class: "st-paginationNav__list" },
            Array.from({ length: totalPages }, (_, index) => index + 1).map((item) =>
              h("li", { key: item }, [
                h(
                  "button",
                  {
                    type: "button",
                    class: classNames(
                      "st-paginationNav__page",
                      item === page && "st-paginationNav__page--active",
                    ),
                  },
                  `Page ${item}`,
                ),
              ]),
            ),
          ),
          props.nextHref
            ? h("a", { href: props.nextHref }, "Next")
            : h("button", { type: "button", disabled: page >= totalPages }, "Next"),
        ],
      );
    };
  },
});
