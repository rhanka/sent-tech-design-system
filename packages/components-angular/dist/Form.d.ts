import * as i0 from "@angular/core";
export type FormStatus = "idle" | "submitting" | "submitted" | "error";
export type FormProps = {
    status?: FormStatus;
    message?: string;
    class?: string;
};
export declare class Form {
    static readonly stComponentName = "Form";
    readonly componentName = "Form";
    status?: FormStatus;
    message?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Form, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Form, "st-form", never, { "status": { "alias": "status"; "required": false; }; "message": { "alias": "message"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Form.d.ts.map