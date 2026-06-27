import * as i0 from "@angular/core";
export type FieldCardVariant = "plain" | "bordered" | "accent";
export type FieldCardTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type FieldCardProps = {
    label: string;
    variant?: FieldCardVariant;
    tone?: FieldCardTone;
    commentCount?: number;
    onOpenComments?: () => void;
    class?: string;
};
export declare class FieldCard {
    static readonly stComponentName = "FieldCard";
    readonly componentName = "FieldCard";
    label: string;
    variant: FieldCardVariant;
    tone?: FieldCardTone;
    commentCount?: number;
    onOpenComments?: () => void;
    classInput?: string;
    get count(): number;
    get showBadge(): boolean;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FieldCard, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FieldCard, "st-field-card", never, { "label": { "alias": "label"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "commentCount": { "alias": "commentCount"; "required": false; }; "onOpenComments": { "alias": "onOpenComments"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=FieldCard.d.ts.map