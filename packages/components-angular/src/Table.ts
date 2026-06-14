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
    return ["st-table", this.classInput].filter(Boolean).join(" ");
  }
}
