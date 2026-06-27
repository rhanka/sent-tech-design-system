import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
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
export declare class TreeView {
    static readonly stComponentName = "TreeView";
    readonly componentName = "TreeView";
    nodes: TreeNode[];
    selected?: string;
    selectedId?: string;
    defaultExpanded?: string[];
    defaultExpandedIds?: string[];
    expandedIds?: string[];
    label?: string;
    classInput?: string;
    selectedChange: EventEmitter<string>;
    select: EventEmitter<string>;
    private localExpanded;
    private localSelected?;
    focusedId?: string;
    ngOnInit(): void;
    private get expandedMap();
    get activeSelected(): string | undefined;
    get visible(): FlatNode[];
    get tabbableId(): string | undefined;
    indentFor(level: number): string;
    rowClass(flat: FlatNode): string;
    caretClass(flat: FlatNode): string;
    private toggle;
    activate(flat: FlatNode): void;
    private focusAt;
    onKey(event: KeyboardEvent, flat: FlatNode): void;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TreeView, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TreeView, "st-tree-view", never, { "nodes": { "alias": "nodes"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "selectedId": { "alias": "selectedId"; "required": false; }; "defaultExpanded": { "alias": "defaultExpanded"; "required": false; }; "defaultExpandedIds": { "alias": "defaultExpandedIds"; "required": false; }; "expandedIds": { "alias": "expandedIds"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "selectedChange": "selectedChange"; "select": "select"; }, never, ["*"], true, never>;
}
export {};
//# sourceMappingURL=TreeView.d.ts.map