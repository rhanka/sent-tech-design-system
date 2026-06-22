import {
  Component,
  EventEmitter,
  Input as NgInput,
  Output,
} from "@angular/core";

import { classNames } from "./classNames.js";

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  disabled?: boolean;
}

export type TreeViewProps = {
  nodes: TreeNode[];
  /** Id du nœud sélectionné. */
  selected?: string;
  /** Alias compat de `selected`. */
  selectedId?: string;
  /** Ids dépliés au départ. */
  defaultExpanded?: string[];
  /** Alias compat de `defaultExpanded`. */
  defaultExpandedIds?: string[];
  /** Ids dépliés contrôlés. */
  expandedIds?: string[];
  label?: string;
  class?: string;
};

type FlatNode = {
  node: TreeNode;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
};

@Component({
  selector: "st-tree-view",
  standalone: true,
  template: `
    <ul
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="tree"
      [attr.aria-label]="label ?? 'Arborescence'"
    >
      @for (flat of visible; track flat.node.id) {
        <li role="none">
          <div
            role="treeitem"
            class="st-treeView__row"
            [class.st-treeView__row--selected]="activeSelected === flat.node.id"
            [class.st-treeView__row--disabled]="flat.node.disabled"
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
            @if (flat.hasChildren) {
              <span
                class="st-treeView__caret"
                [class.st-treeView__caret--open]="flat.expanded"
                aria-hidden="true"
              ></span>
            } @else {
              <span class="st-treeView__caret st-treeView__caret--leaf" aria-hidden="true"></span>
            }
            <span class="st-treeView__label">{{ flat.node.label }}</span>
          </div>
        </li>
      }
      <ng-content></ng-content>
    </ul>
  `,
})
export class TreeView {
  static readonly stComponentName = "TreeView";
  readonly componentName = "TreeView";
  @NgInput() nodes: TreeNode[] = [];
  @NgInput() selected?: string;
  @NgInput() selectedId?: string;
  @NgInput() defaultExpanded?: string[];
  @NgInput() defaultExpandedIds?: string[];
  @NgInput() expandedIds?: string[];
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;
  @Output() selectedChange = new EventEmitter<string>();
  @Output() select = new EventEmitter<string>();

  private localExpanded: Record<string, boolean> = {};
  private localSelected?: string;
  focusedId?: string;

  ngOnInit(): void {
    const seed = this.defaultExpanded ?? this.defaultExpandedIds ?? [];
    this.localExpanded = Object.fromEntries(seed.map((id) => [id, true]));
  }

  private get expandedMap(): Record<string, boolean> {
    if (this.expandedIds !== undefined) {
      return Object.fromEntries(this.expandedIds.map((id) => [id, true]));
    }
    return this.localExpanded;
  }

  get activeSelected(): string | undefined {
    return this.selected ?? this.selectedId ?? this.localSelected;
  }

  get visible(): FlatNode[] {
    const out: FlatNode[] = [];
    const map = this.expandedMap;
    const walk = (items: TreeNode[], level: number, parentId: string | null): void => {
      for (const node of items) {
        const hasChildren = Boolean(node.children && node.children.length > 0);
        const expanded = Boolean(map[node.id]);
        out.push({ node, level, parentId, hasChildren, expanded });
        if (hasChildren && expanded) walk(node.children!, level + 1, node.id);
      }
    };
    walk(this.nodes ?? [], 1, null);
    return out;
  }

  get tabbableId(): string | undefined {
    return this.focusedId ?? this.visible[0]?.node.id;
  }

  indentFor(level: number): string {
    return `calc(${level - 1} * var(--st-spacing-4, 1rem) + 0.25rem)`;
  }

  private toggle(id: string): void {
    if (this.expandedIds !== undefined) return;
    this.localExpanded = { ...this.localExpanded, [id]: !this.localExpanded[id] };
  }

  activate(flat: FlatNode): void {
    if (flat.node.disabled) return;
    this.focusedId = flat.node.id;
    if (flat.hasChildren) {
      this.toggle(flat.node.id);
    } else {
      this.localSelected = flat.node.id;
      this.selectedChange.emit(flat.node.id);
      this.select.emit(flat.node.id);
    }
  }

  private focusAt(index: number): void {
    const target = this.visible[index];
    if (!target) return;
    this.focusedId = target.node.id;
    queueMicrotask(() => {
      const rows = Array.from(
        document.querySelectorAll<HTMLElement>("[data-tree-id]"),
      );
      rows.find((row) => row.dataset["treeId"] === target.node.id)?.focus();
    });
  }

  onKey(event: KeyboardEvent, flat: FlatNode): void {
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
        if (flat.hasChildren && !flat.expanded) this.toggle(flat.node.id);
        else if (flat.hasChildren) this.focusAt(i + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (flat.hasChildren && flat.expanded) this.toggle(flat.node.id);
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

  get hostClass(): string {
    return classNames("st-treeView", this.classInput);
  }
}
