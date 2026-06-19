import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type PaginationProps = {
  page: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  pageCount?: number;
  previousLabel?: string;
  nextLabel?: string;
  class?: string;
};

export const Pagination = defineComponent({
  name: "Pagination",
  props: {
    page: { type: Number, required: true },
    pageSize: { type: Number, default: 10 },
    totalItems: { type: Number, default: undefined },
    totalPages: { type: Number, default: undefined },
    pageCount: { type: Number, default: undefined },
    previousLabel: { type: String, default: "Previous" },
    nextLabel: { type: String, default: "Next" },
    class: { type: String, default: undefined },
  },
  emits: ["pageChange"],
  setup(props, { emit, attrs }) {
    return () => {
      const pages =
        props.pageCount ??
        props.totalPages ??
        (props.totalItems
          ? Math.max(1, Math.ceil(props.totalItems / (props.pageSize ?? 10)))
          : props.page);
      const start = props.totalItems
        ? (props.page - 1) * (props.pageSize ?? 10) + 1
        : props.page;
      const end = props.totalItems
        ? Math.min(props.page * (props.pageSize ?? 10), props.totalItems)
        : props.page;
      const visiblePages = Array.from({ length: pages }, (_, index) => index + 1);

      return h(
        "nav",
        {
          ...attrs,
          class: classNames("st-pagination", props.class),
          "aria-label": "Pagination",
        },
        [
          h(
            "button",
            {
              type: "button",
              disabled: props.page <= 1,
              onClick: () => emit("pageChange", props.page - 1),
            },
            props.previousLabel,
          ),
          h(
            "span",
            { class: "st-pagination__page--active" },
            props.totalItems
              ? `${start}-${end} of ${props.totalItems}`
              : `Page ${props.page} of ${pages}`,
          ),
          h(
            "span",
            { class: "st-pagination__pages" },
            visiblePages.map((pageNumber) =>
              h(
                "button",
                {
                  key: pageNumber,
                  type: "button",
                  class: classNames(
                    "st-pagination__page",
                    pageNumber === props.page && "st-pagination__page--active",
                  ),
                  "aria-label": `Page ${pageNumber}`,
                  "aria-current": pageNumber === props.page ? "page" : undefined,
                  onClick: () => emit("pageChange", pageNumber),
                },
                String(pageNumber),
              ),
            ),
          ),
          h(
            "button",
            {
              type: "button",
              disabled: props.page >= pages,
              onClick: () => emit("pageChange", props.page + 1),
            },
            props.nextLabel,
          ),
        ],
      );
    };
  },
});
