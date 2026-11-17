import type { TableHTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { text } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export interface TableColumn {
  key: string;
  label: ComponentChildren;
  align?: "left" | "center" | "right" | "start" | "end";
}

export type TableRow = Record<string, unknown>;

export type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  columns: TableColumn[];
  rows: TableRow[];
  caption?: ComponentChildren;
};

export function Table({ columns, rows, caption = "Table", className, ...rest }: TableProps) {
  return (
    <div className="st-table-wrap">
      <table {...rest} className={classNames("st-table", className)}>
        <caption>{caption}</caption>
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={text(row.id) || index}>
              {columns.map((column) => <td key={column.key} className={classNames(column.align === "center" && "st-table__cell--center", (column.align === "right" || column.align === "end") && "st-table__cell--right")}>{text(row[column.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
