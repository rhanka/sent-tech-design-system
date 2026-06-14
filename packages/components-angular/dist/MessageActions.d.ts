import * as i0 from "@angular/core";
export type MessageActionVariant = "default" | "danger";
/**
 * `label` (React/Vue) is rendered when present; otherwise `icon` (the
 * Svelte-canonical content) is rendered. `label` is always used for the
 * accessible name when provided. At least one of `label`/`icon` should be set.
 */
export type MessageAction = {
    id?: string;
    label?: unknown;
    icon?: unknown;
    disabled?: boolean;
    variant?: MessageActionVariant;
    onClick?: () => void;
};
export type MessageActionsProps = {
    actions: MessageAction[];
    visibility?: "always" | "hover";
    class?: string;
};
export declare class MessageActions {
    static readonly stComponentName = "MessageActions";
    readonly componentName = "MessageActions";
    actions: MessageAction[];
    visibility?: "always" | "hover";
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MessageActions, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MessageActions, "st-message-actions", never, { "actions": { "alias": "actions"; "required": false; }; "visibility": { "alias": "visibility"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=MessageActions.d.ts.map