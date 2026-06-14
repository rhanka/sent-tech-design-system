import type { AvatarSize } from "./Avatar.js";
import * as i0 from "@angular/core";
export type AvatarGroupProps = {
    /** Nombre maximum d'avatars visibles. Au-delà, un jeton « +N » est affiché. */
    max?: number;
    /** Taille appliquée au jeton de débordement (doit refléter les Avatar). */
    size?: AvatarSize;
    /** Nombre total réel d'éléments (sert à calculer le « +N » si > max). */
    total?: number;
    class?: string;
};
export declare class AvatarGroup {
    static readonly stComponentName = "AvatarGroup";
    readonly componentName = "AvatarGroup";
    max?: number;
    size?: AvatarSize;
    total?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<AvatarGroup, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AvatarGroup, "st-avatar-group", never, { "max": { "alias": "max"; "required": false; }; "size": { "alias": "size"; "required": false; }; "total": { "alias": "total"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=AvatarGroup.d.ts.map