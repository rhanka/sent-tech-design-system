import { defineComponent, h, type PropType } from "vue";
import { classNames } from "./classNames.js";

export type MasterDetailNavItem = { label: string; href: string; active?: boolean };
export type MasterDetailItem = {
  id: string;
  primary: string;
  secondary?: string;
  statusLabel?: string;
  active?: boolean;
};
export type MasterDetailField = { key: string; value: string };

export type MasterDetailProps = {
  listTitle: string;
  searchPlaceholder?: string;
  listItems?: MasterDetailItem[];
  detailTitle: string;
  detailStatus?: { label: string; tone?: string };
  detailActions?: string[];
  detailFields?: MasterDetailField[];
  class?: string;
};

export const MasterDetail = defineComponent({
  name: "MasterDetail",
  props: {
    listTitle: { type: String, required: true },
    searchPlaceholder: { type: String, default: "Search…" },
    listItems: { type: Array as PropType<MasterDetailItem[]>, default: () => [] },
    detailTitle: { type: String, required: true },
    detailStatus: { type: Object as PropType<{ label: string; tone?: string }>, default: undefined },
    detailActions: { type: Array as PropType<string[]>, default: () => [] },
    detailFields: { type: Array as PropType<MasterDetailField[]>, default: () => [] },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h("div", { ...attrs, class: classNames("st-md", props.class) }, [
        h("div", { class: "st-md__split" }, [
          h("aside", { class: "st-md__list" }, [
            h("div", { class: "st-md__list-header" }, [
              h("h2", { class: "st-md__list-title" }, props.listTitle),
              h("input", {
                type: "search",
                class: "st-md__search",
                placeholder: props.searchPlaceholder ?? "Search…",
              }),
            ]),
            h(
              "ul",
              { class: "st-md__list-items" },
              (props.listItems ?? []).map((item) =>
                h(
                  "li",
                  {
                    key: item.id,
                    class: classNames("st-md__list-item", item.active ? "st-md__list-item--active" : undefined),
                  },
                  [
                    h("span", { class: "st-md__item-primary" }, item.primary),
                    item.secondary ? h("span", { class: "st-md__item-secondary" }, item.secondary) : null,
                    item.statusLabel ? h("span", { class: "st-md__item-status" }, item.statusLabel) : null,
                  ],
                ),
              ),
            ),
          ]),
          h("main", { class: "st-md__detail" }, [
            h("div", { class: "st-md__detail-header" }, [
              h("h1", { class: "st-md__detail-title" }, props.detailTitle),
              props.detailStatus
                ? h(
                    "span",
                    {
                      class: classNames(
                        "st-badge",
                        props.detailStatus.tone ? `st-badge--${props.detailStatus.tone}` : undefined,
                      ),
                    },
                    props.detailStatus.label,
                  )
                : null,
              (props.detailActions ?? []).length > 0
                ? h(
                    "div",
                    { class: "st-md__detail-actions" },
                    (props.detailActions ?? []).map((action, i) =>
                      h("button", { key: i, type: "button", class: "st-button st-button--secondary" }, action),
                    ),
                  )
                : null,
            ]),
            (props.detailFields ?? []).length > 0
              ? h(
                  "dl",
                  { class: "st-md__detail-fields" },
                  (props.detailFields ?? []).flatMap((f) => [
                    h("dt", { key: `dt-${f.key}` }, f.key),
                    h("dd", { key: `dd-${f.key}` }, f.value),
                  ]),
                )
              : null,
            slots.default ? h("div", { class: "st-md__detail-content" }, slots.default()) : null,
          ]),
        ]),
      ]);
  },
});
