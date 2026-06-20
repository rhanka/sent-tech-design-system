import { defineComponent, h, type PropType } from "vue";
import { classNames } from "./classNames.js";

export type ObjectPageBreadcrumbItem = { label: string; href?: string };
export type ObjectPageKpi = { label: string; value: string; delta?: string };
export type ObjectPageField = { key: string; value: string };
export type ObjectPageColumn = { key: string; label: string };
export type ObjectPageRow = { id: string; [key: string]: unknown };

export type ObjectPageProps = {
  breadcrumb?: ObjectPageBreadcrumbItem[];
  entityTitle: string;
  entityStatus?: { label: string; tone?: string };
  primaryAction?: string;
  secondaryAction?: string;
  kpis?: ObjectPageKpi[];
  fieldsTitle?: string;
  fields?: ObjectPageField[];
  relatedTitle?: string;
  relatedColumns?: ObjectPageColumn[];
  relatedRows?: ObjectPageRow[];
  class?: string;
};

export const ObjectPage = defineComponent({
  name: "ObjectPage",
  props: {
    breadcrumb: { type: Array as PropType<ObjectPageBreadcrumbItem[]>, default: () => [] },
    entityTitle: { type: String, required: true },
    entityStatus: { type: Object as PropType<{ label: string; tone?: string }>, default: undefined },
    primaryAction: { type: String, default: undefined },
    secondaryAction: { type: String, default: undefined },
    kpis: { type: Array as PropType<ObjectPageKpi[]>, default: () => [] },
    fieldsTitle: { type: String, default: undefined },
    fields: { type: Array as PropType<ObjectPageField[]>, default: () => [] },
    relatedTitle: { type: String, default: undefined },
    relatedColumns: { type: Array as PropType<ObjectPageColumn[]>, default: () => [] },
    relatedRows: { type: Array as PropType<ObjectPageRow[]>, default: () => [] },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h("div", { ...attrs, class: classNames("st-op", props.class) }, [
        h("header", { class: "st-op__header" }, [
          (props.breadcrumb ?? []).length > 0
            ? h(
                "nav",
                { class: "st-breadcrumb" },
                (props.breadcrumb ?? []).map((item, i) =>
                  item.href
                    ? h("a", { key: i, href: item.href, class: "st-breadcrumb__item" }, item.label)
                    : h("span", { key: i, class: "st-breadcrumb__item" }, item.label),
                ),
              )
            : null,
          h("div", { class: "st-op__title-row" }, [
            h("h1", { class: "st-op__title" }, props.entityTitle),
            props.entityStatus
              ? h(
                  "span",
                  {
                    class: classNames(
                      "st-badge",
                      props.entityStatus.tone ? `st-badge--${props.entityStatus.tone}` : undefined,
                    ),
                  },
                  props.entityStatus.label,
                )
              : null,
          ]),
          h("div", { class: "st-op__header-actions" }, [
            props.secondaryAction
              ? h("button", { type: "button", class: "st-button st-button--secondary" }, props.secondaryAction)
              : null,
            props.primaryAction
              ? h("button", { type: "button", class: "st-button st-button--primary" }, props.primaryAction)
              : null,
          ]),
        ]),
        (props.kpis ?? []).length > 0
          ? h(
              "div",
              { class: "st-op__kpi-row" },
              (props.kpis ?? []).map((kpi, i) =>
                h("div", { key: i, class: "st-kpi-card" }, [
                  h("span", { class: "st-kpi-card__label" }, kpi.label),
                  h("span", { class: "st-kpi-card__value" }, kpi.value),
                  kpi.delta ? h("span", { class: "st-kpi-card__delta" }, kpi.delta) : null,
                ]),
              ),
            )
          : null,
        (props.fields ?? []).length > 0
          ? h("section", { class: "st-op__fields" }, [
              props.fieldsTitle ? h("h2", { class: "st-op__section-title" }, props.fieldsTitle) : null,
              h(
                "dl",
                { class: "st-op__field-list" },
                (props.fields ?? []).flatMap((f) => [
                  h("dt", { key: `dt-${f.key}` }, f.key),
                  h("dd", { key: `dd-${f.key}` }, f.value),
                ]),
              ),
            ])
          : null,
        (props.relatedRows ?? []).length > 0
          ? h("section", { class: "st-op__related" }, [
              props.relatedTitle ? h("h2", { class: "st-op__section-title" }, props.relatedTitle) : null,
              h("table", { class: "st-table" }, [
                h(
                  "thead",
                  null,
                  h(
                    "tr",
                    null,
                    (props.relatedColumns ?? []).map((col) =>
                      h("th", { key: col.key }, col.label),
                    ),
                  ),
                ),
                h(
                  "tbody",
                  null,
                  (props.relatedRows ?? []).map((row) =>
                    h(
                      "tr",
                      { key: row.id },
                      (props.relatedColumns ?? []).map((col) =>
                        h("td", { key: col.key }, String(row[col.key] ?? "")),
                      ),
                    ),
                  ),
                ),
              ]),
            ])
          : null,
      ]);
  },
});
