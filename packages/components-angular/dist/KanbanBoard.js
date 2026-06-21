import { Component, Input as NgInput } from "@angular/core";
import * as i0 from "@angular/core";
export class KanbanBoard {
    static stComponentName = "KanbanBoard";
    componentName = "KanbanBoard";
    columns = [];
    classInput;
    get hostClass() {
        return ["st-kb", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: KanbanBoard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: KanbanBoard, isStandalone: true, selector: "st-kanban-board", inputs: { columns: "columns", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: KanbanBoard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-kanban-board",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { columns: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=KanbanBoard.js.map