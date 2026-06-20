import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TreeNode = {
  id: string;
  label: unknown;
  children?: TreeNode[];
  disabled?: boolean;
};

export type TreeViewProps = {
  nodes: TreeNode[];
  selectedId?: string;
  /** Svelte-canonical alias of `selectedId`. */
  selected?: string;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  /** Svelte-canonical alias of `defaultExpandedIds`. */
  defaultExpanded?: string[];
  /** Accessible name for the tree (parity with the Svelte `label`). */
  label?: string;
  class?: string;
};

@Component({
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
})
export class TreeView {
  static readonly stComponentName = "TreeView";
  readonly componentName = "TreeView";
  @NgInput() nodes!: TreeNode[];
  @NgInput() selectedId?: string;
  @NgInput() selected?: string;
  @NgInput() expandedIds?: string[];
  @NgInput() defaultExpandedIds?: string[];
  @NgInput() defaultExpanded?: string[];
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  private localExpandedIds: string[] = [];

  ngOnInit(): void {
    this.localExpandedIds = [...(this.defaultExpandedIds ?? this.defaultExpanded ?? [])];
  }

  get effectiveExpandedIds(): string[] {
    return this.expandedIds ?? this.localExpandedIds;
  }

  get activeSelectedId(): string | undefined {
    return this.selectedId ?? this.selected;
  }

  get flatNodes(): Array<TreeNode & { depth: number; hasChildren: boolean }> {
    const result: Array<TreeNode & { depth: number; hasChildren: boolean }> = [];
    const flatten = (nodes: TreeNode[], depth: number): void => {
      for (const node of nodes) {
        const hasChildren = (node.children?.length ?? 0) > 0;
        result.push({ ...node, depth, hasChildren });
        if (hasChildren && this.isExpanded(node.id)) {
          flatten(node.children!, depth + 1);
        }
      }
    };
    flatten(this.nodes ?? [], 0);
    return result;
  }

  isExpanded(id: string): boolean {
    return this.effectiveExpandedIds.includes(id);
  }

  isSelected(id: string): boolean {
    return id === this.activeSelectedId;
  }

  toggleNode(id: string): void {
    if (this.expandedIds !== undefined) return;
    if (this.localExpandedIds.includes(id)) {
      this.localExpandedIds = this.localExpandedIds.filter((e) => e !== id);
    } else {
      this.localExpandedIds = [...this.localExpandedIds, id];
    }
  }

  nodeClass(node: TreeNode & { depth: number }): string {
    return classNames(
      "st-treeView__node",
      this.isSelected(node.id) && "st-treeView__node--selected",
      node.disabled && "st-treeView__node--disabled",
    );
  }

  get hostClass(): string {
    return classNames("st-treeView", this.classInput);
  }
}
