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
    get hostClass() {
        return classNames("st-table", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Table, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Table, isStandalone: true, selector: "st-table", inputs: { columns: "columns", rows: "rows", caption: "caption", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Table, decorators: [{
            type: Component,
            args: [{
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