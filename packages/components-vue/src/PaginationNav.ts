import { defineComponent, h } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { classNames } from "./classNames.js";

// `pageCount` (Svelte-canonical) is accepted as an alias of `totalPages`.
export type PaginationNavProps = {
  page?: number;
  totalPages?: number;
  pageCount?: number;
  previousHref?: string;
  nextHref?: string;
  class?: string;
};

export const PaginationNav = defineComponent({
  name: "PaginationNav",
  props: {
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: undefined },
    pageCount: { type: Number, default: undefined },
    previousHref: { type: String, default: undefined },
    nextHref: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const page = props.page ?? 1;
      const totalPages = props.totalPages ?? props.pageCount ?? 1;

      return h(
        "nav",
        {
          ...attrs,
          class: classNames("st-paginationNav", props.class),
          "aria-label": "Pagination navigation",
        },
        [
          props.previousHref
            ? h(
                "a",
                { href: props.previousHref, class: "st-paginationNav__nav", "aria-label": "Previous" },
                [h(ChevronLeft, { size: 16, strokeWidth: 2, "aria-hidden": "true" })],
              )
            : h(
                "button",
                { type: "button", class: "st-paginationNav__nav", "aria-label": "Previous", disabled: page <= 1 },
                [h(ChevronLeft, { size: 16, strokeWidth: 2, "aria-hidden": "true" })],
              ),
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
            ? h(
                "a",
                { href: props.nextHref, class: "st-paginationNav__nav", "aria-label": "Next" },
                [h(ChevronRight, { size: 16, strokeWidth: 2, "aria-hidden": "true" })],
              )
            : h(
                "button",
                { type: "button", class: "st-paginationNav__nav", "aria-label": "Next", disabled: page >= totalPages },
                [h(ChevronRight, { size: 16, strokeWidth: 2, "aria-hidden": "true" })],
              ),
        ],
      );
    };
  },
});
