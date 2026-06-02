import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type DataTableColumn = {
  key: string;
  label: unknown;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  width?: string;
  render?: (row: DataTableRow, column: DataTableColumn) => unknown;
};

export type DataTableRow = {
  id: string;
  [key: string]: unknown;
};

export type DataTableSize = "sm" | "md" | "lg";

export type DataTableProps = {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  caption?: unknown;
  size?: DataTableSize;
  pageSize?: number;
  page?: number;
  totalItems?: number;
  class?: string;
};

export const DataTable = defineComponent({
  name: "DataTable",
  props: {
    columns: { type: Array as () => DataTableColumn[], required: true },
    rows: { type: Array as () => DataTableRow[], required: true },
    caption: { type: [String, Object] as unknown as () => unknown, default: undefined },
    size: { type: String as () => DataTableSize, default: "md" },
    pageSize: { type: Number, default: undefined },
    page: { type: Number, default: 1 },
    totalItems: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const visibleRows = props.pageSize
        ? props.rows.slice((props.page - 1) * props.pageSize, props.page * props.pageSize)
        : props.rows;
      const total = props.totalItems ?? props.rows.length;

      return h("div", { class: "st-dataTable-wrap" }, [
        h(
          "table",
          {
            ...attrs,
            class: classNames("st-dataTable", `st-dataTable--${props.size}`, props.class),
          },
          [
            props.caption ? h("caption", {}, props.caption as string) : null,
            h(
              "thead",
              {},
              h(
                "tr",
                {},
                props.columns.map((col) => h("th", { key: col.key }, col.label as string)),
              ),
            ),
            h(
              "tbody",
              {},
              visibleRows.map((row) =>
                h(
                  "tr",
                  { key: row.id },
                  props.columns.map((col) =>
                    h(
                      "td",
                      {
                        key: col.key,
                        class: classNames(
                          col.align === "center" && "st-dataTable__cell--center",
                          col.align === "end" && "st-dataTable__cell--end",
                        ),
                      },
                      col.render
                        ? (col.render(row, col) as string)
                        : String(row[col.key] ?? ""),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        props.pageSize
          ? h(
              "div",
              { class: "st-dataTable__pagerStatus" },
              `${(props.page - 1) * props.pageSize + 1}-${Math.min(props.page * props.pageSize, total)} of ${total}`,
            )
          : null,
      ]);
    };
  },
});
