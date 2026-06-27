import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Table {
    static stComponentName = "Table";
    componentName = "Table";
    columns;
    rows;
    caption;
    classInput;
    get tableClass() {
        return classNames("st-table", this.classInput);
    }
    cellClass(col) {
        return classNames(col.align === "right" && "st-table__cell--right", col.align === "center" && "st-table__cell--center");
    }
    cellValue(row, key) {
        return String(row[key] ?? "");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Table, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Table, isStandalone: true, selector: "st-table", inputs: { columns: "columns", rows: "rows", caption: "caption", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Table, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { columns: [{
                type: NgInput
            }], rows: [{
                type: NgInput
            }], caption: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Table.js.map