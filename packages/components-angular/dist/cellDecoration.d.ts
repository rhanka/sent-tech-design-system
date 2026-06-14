export type CellDecorationIntent = "positive" | "negative" | "warning" | "info" | "neutral";
export interface CellDecoration {
    intent: CellDecorationIntent;
    icon?: string;
}
export declare const cellDecorationLabel: Record<CellDecorationIntent, string>;
export declare function cellDecorationClass(intent: CellDecorationIntent): string;
type IconNode = Array<[string, Record<string, string | number>]>;
export declare const cellDecorationIconNodes: Record<string, IconNode>;
export declare function hasCellDecorationIcon(icon: string | undefined): boolean;
export declare function renderCellDecorationIcon(icon: string | undefined): unknown | null;
export {};
//# sourceMappingURL=cellDecoration.d.ts.map