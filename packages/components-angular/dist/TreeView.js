import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class TreeView {
    static stComponentName = "TreeView";
    componentName = "TreeView";
    nodes;
    selectedId;
    selected;
    expandedIds;
    defaultExpandedIds;
    defaultExpanded;
    label;
    classInput;
    get hostClass() {
        return ["st-treeView", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreeView, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: TreeView, isStandalone: true, selector: "st-tree-view", inputs: { nodes: "nodes", selectedId: "selectedId", selected: "selected", expandedIds: "expandedIds", defaultExpandedIds: "defaultExpandedIds", defaultExpanded: "defaultExpanded", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreeView, decorators: [{
            type: Component,
            args: [{
                    selector: "st-tree-view",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { nodes: [{
                type: NgInput
            }], selectedId: [{
                type: NgInput
            }], selected: [{
                type: NgInput
            }], expandedIds: [{
                type: NgInput
            }], defaultExpandedIds: [{
                type: NgInput
            }], defaultExpanded: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=TreeView.js.map