export interface ConnectorExpectation {
    /** Expanded zones, drawn as frames under the connectors. */
    readonly frames: readonly string[];
    /** Cards and collapsed zones, drawn above the connectors. */
    readonly boxes: readonly string[];
    /** Every relation the scene draws: its occurrence and the two boxes it joins. */
    readonly relations: readonly {
        readonly occurrence: string;
        readonly ends: readonly [string, string];
    }[];
    /** Expanded zones with a footer: one cutout of the connector mask each. Defaults to `frames.length`. */
    readonly cutouts?: number;
}
/** The world's children in document order — the paint order: no layer of the scene sets a z-index. */
export declare function scenePaintOrder(container: HTMLElement): {
    children: HTMLElement[];
    connectors: number[];
    nodes: Map<string, number>;
    labels: Map<string, number>;
};
/**
 * Every expected relation has a connector whose two ends touch its two boxes
 * and a label; the expanded zone frames precede the connector layer, every
 * box follows it and the labels come last.
 */
export declare function expectConnectorPaint(container: HTMLElement, expected: ConnectorExpectation): void;
//# sourceMappingURL=connectorHostContract.d.ts.map