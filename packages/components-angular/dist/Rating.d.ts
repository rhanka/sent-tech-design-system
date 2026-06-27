import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type RatingSize = "sm" | "md" | "lg";
export type RatingProps = {
    /** Note courante (0..max). Pas de 1, ou 0.5 si `allowHalf`. */
    value?: number;
    /** Nombre d'étoiles. */
    max?: number;
    /** Appelé avec la nouvelle note au clic ou au clavier. */
    onChange?: (value: number) => void;
    /** Affichage seul : ni clic ni clavier n'émettent. */
    readonly?: boolean;
    /** Autorise les demi-étoiles (sélection au demi-point). */
    allowHalf?: boolean;
    size?: RatingSize;
    /** Attribut name (utile dans un formulaire / pour la sémantique radio). */
    name?: string;
    /** Étiquette accessible du groupe. */
    label?: string;
    class?: string;
};
export declare class Rating {
    static readonly stComponentName = "Rating";
    readonly componentName = "Rating";
    value?: number;
    max?: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    allowHalf?: boolean;
    size?: RatingSize;
    name?: string;
    label?: string;
    classInput?: string;
    readonly change: EventEmitter<number>;
    get resolvedValue(): number;
    get resolvedMax(): number;
    get resolvedSize(): RatingSize;
    get iconSize(): number;
    get stars(): number[];
    get focusedStar(): number;
    get valueText(): string;
    get hostClass(): string;
    fill(star: number): "full" | "half" | "empty";
    private commit;
    onStarClick(event: MouseEvent, star: number): void;
    onKeyDown(event: KeyboardEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Rating, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Rating, "st-rating", never, { "value": { "alias": "value"; "required": false; }; "max": { "alias": "max"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "readonly": { "alias": "readonly"; "required": false; }; "allowHalf": { "alias": "allowHalf"; "required": false; }; "size": { "alias": "size"; "required": false; }; "name": { "alias": "name"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "change": "change"; }, never, never, true, never>;
}
//# sourceMappingURL=Rating.d.ts.map