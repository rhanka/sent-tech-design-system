import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { cellDecorationClass, cellDecorationLabel, renderCellDecorationIcon, } from "./cellDecoration.js";
import * as i0 from "@angular/core";
export class DataTable {
    static stComponentName = "DataTable";
    componentName = "DataTable";
    columns;
    rows;
    decorations;
    caption;
    size;
    selectable;
    selectedIds;
    onSelectionChange;
    sortable;
    sortBy;
    onSortChange;
    pageSize;
    page;
    onPageChange;
    selectAllLabel;
    selectRowLabel;
    sortAscendingLabel;
    sortDescendingLabel;
    sortNoneLabel;
    previousLabel;
    nextLabel;
    rangeLabel;
    emptyLabel;
    onRowClick;
    classInput;
    get hostClass() {
        return ["st-dataTable", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DataTable, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: DataTable, isStandalone: true, selector: "st-data-table", inputs: { columns: "columns", rows: "rows", decorations: "decorations", caption: "caption", size: "size", selectable: "selectable", selectedIds: "selectedIds", onSelectionChange: "onSelectionChange", sortable: "sortable", sortBy: "sortBy", onSortChange: "onSortChange", pageSize: "pageSize", page: "page", onPageChange: "onPageChange", selectAllLabel: "selectAllLabel", selectRowLabel: "selectRowLabel", sortAscendingLabel: "sortAscendingLabel", sortDescendingLabel: "sortDescendingLabel", sortNoneLabel: "sortNoneLabel", previousLabel: "previousLabel", nextLabel: "nextLabel", rangeLabel: "rangeLabel", emptyLabel: "emptyLabel", onRowClick: "onRowClick", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DataTable, decorators: [{
            type: Component,
            args: [{
                    selector: "st-data-table",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { columns: [{
                type: NgInput
            }], rows: [{
                type: NgInput
            }], decorations: [{
                type: NgInput
            }], caption: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], selectable: [{
                type: NgInput
            }], selectedIds: [{
                type: NgInput
            }], onSelectionChange: [{
                type: NgInput
            }], sortable: [{
                type: NgInput
            }], sortBy: [{
                type: NgInput
            }], onSortChange: [{
                type: NgInput
            }], pageSize: [{
                type: NgInput
            }], page: [{
                type: NgInput
            }], onPageChange: [{
                type: NgInput
            }], selectAllLabel: [{
                type: NgInput
            }], selectRowLabel: [{
                type: NgInput
            }], sortAscendingLabel: [{
                type: NgInput
            }], sortDescendingLabel: [{
                type: NgInput
            }], sortNoneLabel: [{
                type: NgInput
            }], previousLabel: [{
                type: NgInput
            }], nextLabel: [{
                type: NgInput
            }], rangeLabel: [{
                type: NgInput
            }], emptyLabel: [{
                type: NgInput
            }], onRowClick: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=DataTable.js.map