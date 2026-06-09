import { defineComponent, h } from "vue";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-vue-next";
import { classNames } from "./classNames.js";

// `pageCount` (Svelte-canonical) is accepted as an alias of `totalPages`.
export type PaginationNavProps = {
  page?: number;
  pageCount?: number;
  totalPages?: number;
  siblings?: number;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  previousHref?: string;
  nextHref?: string;
  class?: string;
};

// Mirrors the Svelte reference: first/last anchors, sibling window around the
// current page, and two collapse points (ellipses) once the total exceeds
// `siblings * 2 + 5`.
type PaginationSlot = number | "ellipsis-start" | "ellipsis-end";
function paginationSlots(page: number, pageCount: number, siblings: number): PaginationSlot[] {
  const total = Math.max(0, Math.floor(pageCount));
  if (total <= 0) return [];
  const current = Math.min(Math.max(1, Math.floor(page)), total);
  const sib = Math.max(0, Math.floor(siblings));
  const minSlots = sib * 2 + 5;
  if (total <= minSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(current - sib, 1);
  const rightSibling = Math.min(current + sib, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;
  const result: PaginationSlot[] = [];
  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + sib * 2;
    for (let i = 1; i <= leftItemCount; i += 1) result.push(i);
    result.push("ellipsis-end");
    result.push(total);
  } else if (showLeftEllipsis && !showRightEllipsis) {
    result.push(1);
    result.push("ellipsis-start");
    const rightItemCount = 3 + sib * 2;
    for (let i = total - rightItemCount + 1; i <= total; i += 1) result.push(i);
  } else if (showLeftEllipsis && showRightEllipsis) {
    result.push(1);
    result.push("ellipsis-start");
    for (let i = leftSibling; i <= rightSibling; i += 1) result.push(i);
    result.push("ellipsis-end");
    result.push(total);
  } else {
    for (let i = 1; i <= total; i += 1) result.push(i);
  }
  return result;
}

export const PaginationNav = defineComponent({
  name: "PaginationNav",
  props: {
    page: { type: Number, default: 1 },
    pageCount: { type: Number, default: undefined },
    totalPages: { type: Number, default: undefined },
    siblings: { type: Number, default: 1 },
    label: { type: String, default: "Pagination" },
    previousLabel: { type: String, default: "Previous page" },
    nextLabel: { type: String, default: "Next page" },
    previousHref: { type: String, default: undefined },
    nextHref: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: ["page-change"],
  setup(props, { attrs, emit }) {
    return () => {
      const page = props.page ?? 1;
      const pages = props.pageCount ?? props.totalPages ?? 1;
      const slots = paginationSlots(page, pages, props.siblings ?? 1);

      const go = (target: number) => {
        if (target < 1 || target > pages || target === page) return;
        emit("page-change", target);
      };

      const prev = props.previousHref
        ? h(
            "a",
            { href: props.previousHref, class: "st-paginationNav__nav", "aria-label": props.previousLabel },
            [h(ChevronLeft, { size: 16, strokeWidth: 2, "aria-hidden": "true" })],
          )
        : h(
            "button",
            {
              type: "button",
              class: "st-paginationNav__nav",
              "aria-label": props.previousLabel,
              disabled: page <= 1 || pages <= 0,
              onClick: () => go(page - 1),
            },
            [h(ChevronLeft, { size: 16, strokeWidth: 2, "aria-hidden": "true" })],
          );

      const next = props.nextHref
        ? h(
            "a",
            { href: props.nextHref, class: "st-paginationNav__nav", "aria-label": props.nextLabel },
            [h(ChevronRight, { size: 16, strokeWidth: 2, "aria-hidden": "true" })],
          )
        : h(
            "button",
            {
              type: "button",
              class: "st-paginationNav__nav",
              "aria-label": props.nextLabel,
              disabled: page >= pages || pages <= 0,
              onClick: () => go(page + 1),
            },
            [h(ChevronRight, { size: 16, strokeWidth: 2, "aria-hidden": "true" })],
          );

      return h(
        "nav",
        {
          ...attrs,
          class: classNames("st-paginationNav", props.class),
          "aria-label": props.label,
        },
        [
          h("ul", { class: "st-paginationNav__list" }, [
            h("li", {}, [prev]),
            ...slots.map((slot, index) =>
              h(
                "li",
                { key: typeof slot === "number" ? `p-${slot}` : `${slot}-${index}` },
                [
                  slot === "ellipsis-start" || slot === "ellipsis-end"
                    ? h(
                        "span",
                        { class: "st-paginationNav__ellipsis", "aria-hidden": "true" },
                        [h(Ellipsis, { size: 16, strokeWidth: 2, "aria-hidden": "true" })],
                      )
                    : h(
                        "button",
                        {
                          type: "button",
                          class: classNames(
                            "st-paginationNav__page",
                            slot === page && "st-paginationNav__page--active",
                          ),
                          "aria-label": `Page ${slot}`,
                          "aria-current": slot === page ? "page" : undefined,
                          onClick: () => go(slot),
                        },
                        String(slot),
                      ),
                ],
              ),
            ),
            h("li", {}, [next]),
          ]),
        ],
      );
    };
  },
});
