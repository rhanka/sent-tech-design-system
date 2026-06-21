import * as i0 from "@angular/core";
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
export declare class TreeView {
    static readonly stComponentName = "TreeView";
    readonly componentName = "TreeView";
    nodes: TreeNode[];
    selectedId?: string;
    selected?: string;
    expandedIds?: string[];
    defaultExpandedIds?: string[];
    defaultExpanded?: string[];
    label?: string;
    classInput?: string;
    private localExpandedIds;
    ngOnInit(): void;
    get effectiveExpandedIds(): string[];
    get activeSelectedId(): string | undefined;
    get flatNodes(): Array<TreeNode & {
        depth: number;
        hasChildren: boolean;
    }>;
    isExpanded(id: string): boolean;
    isSelected(id: string): boolean;
    toggleNode(id: string): void;
    nodeClass(node: TreeNode & {
        depth: number;
    }): string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TreeView, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TreeView, "st-tree-view", never, { "nodes": { "alias": "nodes"; "required": false; }; "selectedId": { "alias": "selectedId"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "expandedIds": { "alias": "expandedIds"; "required": false; }; "defaultExpandedIds": { "alias": "defaultExpandedIds"; "required": false; }; "defaultExpanded": { "alias": "defaultExpanded"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=TreeView.d.ts.map