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
    localExpandedIds = [];
    ngOnInit() {
        this.localExpandedIds = [...(this.defaultExpandedIds ?? this.defaultExpanded ?? [])];
    }
    get effectiveExpandedIds() {
        return this.expandedIds ?? this.localExpandedIds;
    }
    get activeSelectedId() {
        return this.selectedId ?? this.selected;
    }
    get flatNodes() {
        const result = [];
        const flatten = (nodes, depth) => {
            for (const node of nodes) {
                const hasChildren = (node.children?.length ?? 0) > 0;
                result.push({ ...node, depth, hasChildren });
                if (hasChildren && this.isExpanded(node.id)) {
                    flatten(node.children, depth + 1);
                }
            }
        };
        flatten(this.nodes ?? [], 0);
        return result;
    }
    isExpanded(id) {
        return this.effectiveExpandedIds.includes(id);
    }
    isSelected(id) {
        return id === this.activeSelectedId;
    }
    toggleNode(id) {
        if (this.expandedIds !== undefined)
            return;
        if (this.localExpandedIds.includes(id)) {
            this.localExpandedIds = this.localExpandedIds.filter((e) => e !== id);
        }
        else {
            this.localExpandedIds = [...this.localExpandedIds, id];
        }
    }
    nodeClass(node) {
        return classNames("st-treeView__node", this.isSelected(node.id) && "st-treeView__node--selected", node.disabled && "st-treeView__node--disabled");
    }
    get hostClass() {
        return classNames("st-treeView", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreeView, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TreeView, isStandalone: true, selector: "st-tree-view", inputs: { nodes: "nodes", selectedId: "selectedId", selected: "selected", expandedIds: "expandedIds", defaultExpandedIds: "defaultExpandedIds", defaultExpanded: "defaultExpanded", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <ul
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="tree"
      [attr.aria-label]="label ?? 'Arbre'"
    >
      @for (node of flatNodes; track node.id) {
        <li
          role="treeitem"
          [class]="nodeClass(node)"
          [style.paddingLeft]="(node.depth * 1.25) + 'rem'"
          [attr.aria-selected]="isSelected(node.id)"
          [attr.aria-expanded]="node.hasChildren ? isExpanded(node.id) : null"
        >
          @if (node.hasChildren) {
            <button
              type="button"
              class="st-treeView__toggle"
              (click)="toggleNode(node.id)"
              [attr.aria-label]="isExpanded(node.id) ? 'Réduire' : 'Développer'"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path [attr.d]="isExpanded(node.id) ? 'M6 9l6 6 6-6' : 'M9 6l6 6-6 6'" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          }
          <span class="st-treeView__label">{{ node.label }}</span>
        </li>
      }
      <ng-content></ng-content>
    </ul>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreeView, decorators: [{
            type: Component,
            args: [{
                    selector: "st-tree-view",
                    standalone: true,
                    template: `
    <ul
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="tree"
      [attr.aria-label]="label ?? 'Arbre'"
    >
      @for (node of flatNodes; track node.id) {
        <li
          role="treeitem"
          [class]="nodeClass(node)"
          [style.paddingLeft]="(node.depth * 1.25) + 'rem'"
          [attr.aria-selected]="isSelected(node.id)"
          [attr.aria-expanded]="node.hasChildren ? isExpanded(node.id) : null"
        >
          @if (node.hasChildren) {
            <button
              type="button"
              class="st-treeView__toggle"
              (click)="toggleNode(node.id)"
              [attr.aria-label]="isExpanded(node.id) ? 'Réduire' : 'Développer'"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path [attr.d]="isExpanded(node.id) ? 'M6 9l6 6 6-6' : 'M9 6l6 6-6 6'" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          }
          <span class="st-treeView__label">{{ node.label }}</span>
        </li>
      }
      <ng-content></ng-content>
    </ul>
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