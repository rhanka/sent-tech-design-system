import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type ChatComposerProps = {
    value?: string;
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
    maxLength?: number;
    label?: string;
    submitLabel?: unknown;
    class?: string;
};
export declare class ChatComposer {
    static readonly stComponentName = "ChatComposer";
    readonly componentName = "ChatComposer";
    value?: string;
    modelValue?: string;
    placeholder?: string;
    disabled: boolean;
    maxLength?: number;
    label?: string;
    submitLabel?: unknown;
    classInput?: string;
    readonly submit: EventEmitter<string>;
    readonly modelValueChange: EventEmitter<string>;
    get currentValue(): string;
    get hostClass(): string;
    onInput(e: Event): void;
    onEnter(e: Event): void;
    onSubmit(e: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ChatComposer, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ChatComposer, "st-chat-composer", never, { "value": { "alias": "value"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "maxLength": { "alias": "maxLength"; "required": false; }; "label": { "alias": "label"; "required": false; }; "submitLabel": { "alias": "submitLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "submit": "submit"; "modelValueChange": "modelValueChange"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=ChatComposer.d.ts.map