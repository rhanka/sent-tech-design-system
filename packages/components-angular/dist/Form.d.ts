import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type FormStatus = "idle" | "submitting" | "submitted" | "error";
export type FormProps = {
    helperText?: string;
    errorText?: string;
    successText?: string;
    submitting?: boolean;
    noNoscript?: boolean;
    class?: string;
};
export declare class Form {
    static readonly stComponentName = "Form";
    readonly componentName = "Form";
    helperText?: string;
    errorText?: string;
    successText?: string;
    submitting?: boolean;
    noNoscript?: boolean;
    classInput?: string;
    readonly submit: EventEmitter<SubmitEvent>;
    get showError(): boolean;
    get showSuccess(): boolean;
    get showHelper(): boolean;
    get hostClass(): string;
    onSubmit(event: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Form, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Form, "st-form", never, { "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "successText": { "alias": "successText"; "required": false; }; "submitting": { "alias": "submitting"; "required": false; }; "noNoscript": { "alias": "noNoscript"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "submit": "submit"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=Form.d.ts.map