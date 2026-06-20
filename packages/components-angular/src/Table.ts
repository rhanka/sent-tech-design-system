import { Component, Input as NgInput } from "@angular/core";

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

@Component({
  selector: "st-table",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <table class="st-table__table">
        @if (caption) {
          <caption class="st-table__caption">{{ caption }}</caption>
        }
        <thead class="st-table__head">
          <tr>
            @for (col of columns ?? []; track col.key) {
              <th class="st-table__th" [attr.data-align]="col.align ?? 'start'" scope="col">{{ col.label }}</th>
            }
          </tr>
        </thead>
        <tbody class="st-table__body">
          @for (row of rows ?? []; track $index) {
            <tr class="st-table__row">
              @for (col of columns ?? []; track col.key) {
                <td class="st-table__td" [attr.data-align]="col.align ?? 'start'">{{ row[col.key] }}</td>
              }
            </tr>
          }
          @if ((rows ?? []).length === 0) {
            <tr>
              <td [attr.colspan]="(columns ?? []).length" class="st-table__empty">—</td>
            </tr>
          }
        </tbody>
      </table>
      <ng-content></ng-content>
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

  get hostClass(): string {
    return classNames("st-table", this.classInput);
  }
}
