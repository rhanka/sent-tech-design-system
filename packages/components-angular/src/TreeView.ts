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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
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

  get hostClass(): string {
    return ["st-treeView", this.classInput].filter(Boolean).join(" ");
  }
}
