import * as i0 from "@angular/core";
export type DropdownOption = {
    value: string;
    label: unknown;
    disabled?: boolean;
};
export type DropdownProps = {
    label?: string;
    options: DropdownOption[];
    value?: string;
    open?: boolean;
    placeholder?: string;
    onSelect?: (value: string) => void;
    class?: string;
};
export declare class Dropdown {
    static readonly stComponentName = "Dropdown";
    readonly componentName = "Dropdown";
    label?: string;
    options: DropdownOption[];
    value?: string;
    open?: boolean;
    placeholder?: string;
    onSelect?: (value: string) => void;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Dropdown, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Dropdown, "st-dropdown", never, { "label": { "alias": "label"; "required": false; }; "options": { "alias": "options"; "required": false; }; "value": { "alias": "value"; "required": false; }; "open": { "alias": "open"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "onSelect": { "alias": "onSelect"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Dropdown.d.ts.map