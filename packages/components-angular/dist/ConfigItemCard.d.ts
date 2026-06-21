import * as i0 from "@angular/core";
export type ConfigItemSourceLevel = "code" | "admin" | "user";
export type ConfigItem = {
    id: string;
    name: string;
    key?: string;
    description?: string | null;
    /** Provenance : `code`/`admin` = système (verrouillé), `user` = personnalisé. */
    sourceLevel: ConfigItemSourceLevel;
    /** Identifiant du parent si l'item est une copie d'un défaut système. */
    parentId?: string | null;
    version?: number;
};
export type ConfigItemCardProps = {
    item: ConfigItem;
    hasCopy?: boolean;
    onCopy?: (id: string) => void;
    onEdit?: (id: string) => void;
    onReset?: (id: string) => void;
    onDelete?: (id: string) => void;
    disabled?: boolean;
    class?: string;
};
export declare class ConfigItemCard {
    static readonly stComponentName = "ConfigItemCard";
    readonly componentName = "ConfigItemCard";
    item: ConfigItem;
    hasCopy?: boolean;
    onCopy?: (id: string) => void;
    onEdit?: (id: string) => void;
    onReset?: (id: string) => void;
    onDelete?: (id: string) => void;
    disabled?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ConfigItemCard, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ConfigItemCard, "st-config-item-card", never, { "item": { "alias": "item"; "required": false; }; "hasCopy": { "alias": "hasCopy"; "required": false; }; "onCopy": { "alias": "onCopy"; "required": false; }; "onEdit": { "alias": "onEdit"; "required": false; }; "onReset": { "alias": "onReset"; "required": false; }; "onDelete": { "alias": "onDelete"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=ConfigItemCard.d.ts.map