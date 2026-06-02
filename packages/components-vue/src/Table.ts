import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type TableColumn = {
  key: string;
  label: unknown;
  align?: "left" | "center" | "right" | "start" | "end";
};

export type TableRow = Record<string, unknown>;

export type TableProps = {
  columns: TableColumn[];
  rows: TableRow[];
  caption?: unknown;
  class?: string;
};

export const Table = defineComponent({
  name: "Table",
  props: {
    columns: { type: Array as () => TableColumn[], required: true },
    rows: { type: Array as () => TableRow[], required: true },
    caption: { type: [String, Object] as unknown as () => unknown, default: "Table" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      return h("div", { class: "st-table-wrap" }, [
        h(
          "table",
          {
            ...attrs,
            class: classNames("st-table", props.class),
          },
          [
            h("caption", {}, props.caption as string),
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
              props.rows.map((row, index) =>
                h(
                  "tr",
                  { key: String(row.id ?? index) },
                  props.columns.map((col) =>
                    h(
                      "td",
                      {
                        key: col.key,
                        class: classNames(
                          col.align === "center" && "st-table__cell--center",
                          (col.align === "right" || col.align === "end") && "st-table__cell--right",
                        ),
                      },
                      String(row[col.key] ?? ""),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ]);
    };
  },
});
