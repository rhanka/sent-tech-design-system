import * as i0 from "@angular/core";
export type KanbanBoardCard = {
    id: string;
    title: string;
    description?: string;
};
export type KanbanBoardColumn = {
    id: string;
    title: string;
    cards: KanbanBoardCard[];
};
export type KanbanBoardProps = {
    columns?: KanbanBoardColumn[];
    class?: string;
};
export declare class KanbanBoard {
    static readonly stComponentName = "KanbanBoard";
    readonly componentName = "KanbanBoard";
    columns: KanbanBoardColumn[];
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<KanbanBoard, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<KanbanBoard, "st-kanban-board", never, { "columns": { "alias": "columns"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=KanbanBoard.d.ts.map