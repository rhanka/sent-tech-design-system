import { defineComponent, h, type PropType } from "vue";
import { classNames } from "./classNames.js";

export type ListReportPageNavItem = { label: string; href: string; active?: boolean };
export type ListReportPageColumn = { key: string; label: string };
export type ListReportPageRow = { id: string; [key: string]: unknown };
export type ListReportPageAction = { id: string; label: string };
export type ListReportPageFilter = { field: string; operator: string; value: string };

export type ListReportPageProps = {
  appTitle?: string;
  navItems?: ListReportPageNavItem[];
  pageTitle: string;
  primaryAction?: string;
  secondaryAction?: string;
  searchPlaceholder?: string;
  columns: ListReportPageColumn[];
  rows?: ListReportPageRow[];
  rowActions?: ListReportPageAction[];
  onprimaryaction?: () => void;
  onsearch?: (q: string) => void;
  class?: string;
};

export const ListReportPage = defineComponent({
  name: "ListReportPage",
  props: {
    appTitle: { type: String, default: undefined },
    navItems: { type: Array as PropType<ListReportPageNavItem[]>, default: () => [] },
    pageTitle: { type: String, required: true },
    primaryAction: { type: String, default: undefined },
    secondaryAction: { type: String, default: undefined },
    searchPlaceholder: { type: String, default: "Search…" },
    columns: { type: Array as PropType<ListReportPageColumn[]>, required: true },
    rows: { type: Array as PropType<ListReportPageRow[]>, default: () => [] },
    rowActions: { type: Array as PropType<ListReportPageAction[]>, default: () => [] },
    onprimaryaction: { type: Function as PropType<() => void>, default: undefined },
    onsearch: { type: Function as PropType<(q: string) => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h("div", { ...attrs, class: classNames("st-lrp", props.class) }, [
        h("div", { class: "st-lrp__body" }, [
          h("aside", { class: "st-lrp__aside" }, [
            props.appTitle ? h("div", { class: "st-lrp__app-title" }, props.appTitle) : null,
            h(
              "nav",
              { class: "st-sidenav" },
              (props.navItems ?? []).map((item) =>
                h(
                  "a",
                  {
                    key: item.href,
                    href: item.href,
                    class: classNames("st-sidenav__item", item.active ? "st-sidenav__item--active" : undefined),
                  },
                  item.label,
                ),
              ),
            ),
          ]),
          h("main", { class: "st-lrp__main" }, [
            h("div", { class: "st-lrp__titlebar" }, [
              h("h1", { class: "st-lrp__title" }, props.pageTitle),
              h("div", { class: "st-lrp__actions" }, [
                props.secondaryAction
                  ? h("button", { type: "button", class: "st-button st-button--secondary" }, props.secondaryAction)
                  : null,
                props.primaryAction
                  ? h(
                      "button",
                      {
                        type: "button",
                        class: "st-button st-button--primary",
                        onClick: () => props.onprimaryaction?.(),
                      },
                      props.primaryAction,
                    )
                  : null,
              ]),
            ]),
            h("div", { class: "st-lrp__toolbar" }, [
              h("input", {
                type: "search",
                class: "st-lrp__search",
                placeholder: props.searchPlaceholder ?? "Search…",
                onInput: (e: Event) => props.onsearch?.((e.target as HTMLInputElement).value),
              }),
            ]),
            h("table", { class: "st-lrp__table" }, [
              h(
                "thead",
                null,
                h(
                  "tr",
                  null,
                  (props.columns ?? []).map((col) =>
                    h("th", { key: col.key, class: "st-lrp__th" }, col.label),
                  ),
                ),
              ),
              h(
                "tbody",
                null,
                (props.rows ?? []).map((row) =>
                  h(
                    "tr",
                    { key: row.id },
                    (props.columns ?? []).map((col) =>
                      h("td", { key: col.key, class: "st-lrp__td" }, String(row[col.key] ?? "")),
                    ),
                  ),
                ),
              ),
            ]),
          ]),
        ]),
      ]);
  },
});
