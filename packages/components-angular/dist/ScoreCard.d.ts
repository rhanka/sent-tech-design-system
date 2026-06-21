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
    get starsArray(): number[];
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ScoreCard, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ScoreCard, "st-score-card", never, { "title": { "alias": "title"; "required": false; }; "score": { "alias": "score"; "required": false; }; "stars": { "alias": "stars"; "required": false; }; "max": { "alias": "max"; "required": false; }; "typeInput": { "alias": "type"; "required": false; }; "unit": { "alias": "unit"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ScoreCard.d.ts.map