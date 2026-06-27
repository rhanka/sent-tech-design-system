import { Component, EventEmitter, Input as NgInput, Output, } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class TreeView {
    static stComponentName = "TreeView";
    componentName = "TreeView";
    nodes = [];
    selected;
    selectedId;
    defaultExpanded;
    defaultExpandedIds;
    expandedIds;
    label;
    classInput;
    selectedChange = new EventEmitter();
    select = new EventEmitter();
    localExpanded = {};
    localSelected;
    focusedId;
    ngOnInit() {
        const seed = this.defaultExpanded ?? this.defaultExpandedIds ?? [];
        this.localExpanded = Object.fromEntries(seed.map((id) => [id, true]));
    }
    get expandedMap() {
        if (this.expandedIds !== undefined) {
            return Object.fromEntries(this.expandedIds.map((id) => [id, true]));
        }
        return this.localExpanded;
    }
    get activeSelected() {
        return this.selected ?? this.selectedId ?? this.localSelected;
    }
    get visible() {
        const out = [];
        const map = this.expandedMap;
        const walk = (items, level, parentId) => {
            for (const node of items) {
                const hasChildren = Boolean(node.children && node.children.length > 0);
                const expanded = Boolean(map[node.id]);
                out.push({ node, level, parentId, hasChildren, expanded });
                if (hasChildren && expanded)
                    walk(node.children, level + 1, node.id);
            }
        };
        walk(this.nodes ?? [], 1, null);
        return out;
    }
    get tabbableId() {
        return this.focusedId ?? this.visible[0]?.node.id;
    }
    indentFor(level) {
        return `calc(${level - 1} * var(--st-spacing-4, 1rem) + 0.25rem)`;
    }
    rowClass(flat) {
        return classNames("st-treeView__row", this.activeSelected === flat.node.id && "st-treeView__row--selected", flat.node.disabled && "st-treeView__row--disabled");
    }
    caretClass(flat) {
        return classNames("st-treeView__caret", !flat.hasChildren && "st-treeView__caret--leaf", flat.expanded && "st-treeView__caret--open");
    }
    toggle(id) {
        if (this.expandedIds !== undefined)
            return;
        this.localExpanded = { ...this.localExpanded, [id]: !this.localExpanded[id] };
    }
    activate(flat) {
        if (flat.node.disabled)
            return;
        this.focusedId = flat.node.id;
        if (flat.hasChildren) {
            this.toggle(flat.node.id);
        }
        else {
            this.localSelected = flat.node.id;
            this.selectedChange.emit(flat.node.id);
            this.select.emit(flat.node.id);
        }
    }
    focusAt(index) {
        const target = this.visible[index];
        if (!target)
            return;
        this.focusedId = target.node.id;
        queueMicrotask(() => {
            const rows = Array.from(document.querySelectorAll("[data-tree-id]"));
            rows.find((row) => row.dataset["treeId"] === target.node.id)?.focus();
        });
    }
    onKey(event, flat) {
        const list = this.visible;
        const i = list.findIndex((v) => v.node.id === flat.node.id);
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                this.focusAt(i + 1);
                break;
            case "ArrowUp":
                event.preventDefault();
                this.focusAt(i - 1);
                break;
            case "Home":
                event.preventDefault();
                this.focusAt(0);
                break;
            case "End":
                event.preventDefault();
                this.focusAt(list.length - 1);
                break;
            case "ArrowRight":
                event.preventDefault();
                if (flat.hasChildren && !flat.expanded)
                    this.toggle(flat.node.id);
                else if (flat.hasChildren)
                    this.focusAt(i + 1);
                break;
            case "ArrowLeft":
                event.preventDefault();
                if (flat.hasChildren && flat.expanded)
                    this.toggle(flat.node.id);
                else if (flat.parentId)
                    this.focusAt(list.findIndex((v) => v.node.id === flat.parentId));
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                this.activate(flat);
                break;
        }
    }
    get hostClass() {
        return classNames("st-treeView", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreeView, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TreeView, isStandalone: true, selector: "st-tree-view", inputs: { nodes: "nodes", selected: "selected", selectedId: "selectedId", defaultExpanded: "defaultExpanded", defaultExpandedIds: "defaultExpandedIds", expandedIds: "expandedIds", label: "label", classInput: ["class", "classInput"] }, outputs: { selectedChange: "selectedChange", select: "select" }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="tree"
      [attr.aria-label]="label ?? 'Arborescence'"
    >
      @for (flat of visible; track flat.node.id) {
        <div
          role="treeitem"
          [class]="rowClass(flat)"
          [attr.aria-level]="flat.level"
          [attr.aria-expanded]="flat.hasChildren ? flat.expanded : null"
          [attr.aria-selected]="activeSelected === flat.node.id"
          [attr.aria-disabled]="flat.node.disabled || null"
          [attr.data-tree-id]="flat.node.id"
          [attr.tabindex]="flat.node.id === tabbableId ? 0 : -1"
          [style.padding-inline-start]="indentFor(flat.level)"
          (click)="activate(flat)"
          (keydown)="onKey($event, flat)"
          (focus)="focusedId = flat.node.id"
        >
          <span [class]="caretClass(flat)" aria-hidden="true"></span>
          <span class="st-treeView__label">{{ flat.node.label }}</span>
        </div>
      }
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
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="tree"
      [attr.aria-label]="label ?? 'Arborescence'"
    >
      @for (flat of visible; track flat.node.id) {
        <div
          role="treeitem"
          [class]="rowClass(flat)"
          [attr.aria-level]="flat.level"
          [attr.aria-expanded]="flat.hasChildren ? flat.expanded : null"
          [attr.aria-selected]="activeSelected === flat.node.id"
          [attr.aria-disabled]="flat.node.disabled || null"
          [attr.data-tree-id]="flat.node.id"
          [attr.tabindex]="flat.node.id === tabbableId ? 0 : -1"
          [style.padding-inline-start]="indentFor(flat.level)"
          (click)="activate(flat)"
          (keydown)="onKey($event, flat)"
          (focus)="focusedId = flat.node.id"
        >
          <span [class]="caretClass(flat)" aria-hidden="true"></span>
          <span class="st-treeView__label">{{ flat.node.label }}</span>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { nodes: [{
                type: NgInput
            }], selected: [{
                type: NgInput
            }], selectedId: [{
                type: NgInput
            }], defaultExpanded: [{
                type: NgInput
            }], defaultExpandedIds: [{
                type: NgInput
            }], expandedIds: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], selectedChange: [{
                type: Output
            }], select: [{
                type: Output
            }] } });
//# sourceMappingURL=TreeView.js.map