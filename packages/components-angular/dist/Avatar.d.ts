import * as i0 from "@angular/core";
export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
export type AvatarTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type AvatarProps = {
    /** Nom complet, utilisé pour dériver les initiales et l'étiquette a11y. */
    name: string;
    /** URL de la photo. Si absente, on rend un cercle d'initiales. */
    src?: string;
    /** Texte alternatif de l'image. Par défaut = `name`. */
    alt?: string;
    size?: AvatarSize;
    shape?: AvatarShape;
    /** Catégorie de couleur pour le fond des initiales. */
    tone?: AvatarTone;
    class?: string;
};
export declare class Avatar {
    static readonly stComponentName = "Avatar";
    readonly componentName = "Avatar";
    name: string;
    src?: string;
    alt?: string;
    size?: AvatarSize;
    shape?: AvatarShape;
    tone?: AvatarTone;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Avatar, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Avatar, "st-avatar", never, { "name": { "alias": "name"; "required": false; }; "src": { "alias": "src"; "required": false; }; "alt": { "alias": "alt"; "required": false; }; "size": { "alias": "size"; "required": false; }; "shape": { "alias": "shape"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Avatar.d.ts.map