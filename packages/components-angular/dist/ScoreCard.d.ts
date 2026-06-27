import * as i0 from "@angular/core";
export type ScoreCardType = "value" | "complexity";
export type ScoreCardSize = "sm" | "md" | "lg";
export type ScoreCardProps = {
    title: string;
    score: number;
    stars: number;
    max?: number;
    type?: ScoreCardType;
    unit?: string;
    size?: ScoreCardSize;
    class?: string;
};
export declare class ScoreCard {
    static readonly stComponentName = "ScoreCard";
    readonly componentName = "ScoreCard";
    title: string;
    score: number;
    stars: number;
    max?: number;
    typeInput?: ScoreCardType;
    unit?: string;
    size?: ScoreCardSize;
    classInput?: string;
    readonly starPath = "m7 1.5 1.7 3.45 3.8.55-2.75 2.68.65 3.79L7 10.18 3.6 11.96l.65-3.79L1.5 5.5l3.8-.55L7 1.5Z";
    readonly crossPath = "M3.5 3.5l7 7M10.5 3.5l-7 7";
    get resolvedMax(): number;
    get resolvedType(): ScoreCardType;
    get resolvedUnit(): string;
    get resolvedSize(): ScoreCardSize;
    get filled(): number;
    get symbols(): boolean[];
    get scoreText(): string;
    get ariaLabel(): string;
    symbolClass(on: boolean): string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ScoreCard, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ScoreCard, "st-score-card", never, { "title": { "alias": "title"; "required": false; }; "score": { "alias": "score"; "required": false; }; "stars": { "alias": "stars"; "required": false; }; "max": { "alias": "max"; "required": false; }; "typeInput": { "alias": "type"; "required": false; }; "unit": { "alias": "unit"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=ScoreCard.d.ts.map