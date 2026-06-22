import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TableColumn = {
  key: string;
  label: unknown;
  align?: "left" | "center" | "right";
};

export type TableRow = Record<string, unknown>;

export type TableProps = {
  columns: TableColumn[];
  rows: TableRow[];
  caption?: unknown;
  class?: string;
};

@Component({
  selector: "st-table",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" class="st-table-wrap">
      <table [class]="tableClass">
        @if (caption) {
          <caption>{{ caption }}</caption>
        }
        <thead>
          <tr>
            @for (col of columns ?? []; track col.key) {
              <th [class]="cellClass(col)" scope="col">{{ col.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows ?? []; track $index) {
            <tr>
              @for (col of columns ?? []; track col.key) {
                <td [class]="cellClass(col)">{{ cellValue(row, col.key) }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class Table {
  static readonly stComponentName = "Table";
  readonly componentName = "Table";
  @NgInput() columns!: TableColumn[];
  @NgInput() rows!: TableRow[];
  @NgInput() caption?: unknown;
  @NgInput("class") classInput?: string;

  get tableClass(): string {
    return classNames("st-table", this.classInput);
  }

  cellClass(col: TableColumn): string {
    return classNames(
      col.align === "right" && "st-table__cell--right",
      col.align === "center" && "st-table__cell--center",
    );
  }

  cellValue(row: TableRow, key: string): string {
    return String(row[key] ?? "");
  }
}
