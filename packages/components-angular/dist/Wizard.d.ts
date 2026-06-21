import * as i0 from "@angular/core";
export type WizardStep = {
    title: string;
    description?: string;
};
export type WizardProps = {
    steps?: WizardStep[];
    currentStep?: number;
    stepTitle?: string;
    cancelLabel?: string;
    backLabel?: string;
    nextLabel?: string;
    finishLabel?: string;
    isLast?: boolean;
    class?: string;
};
export declare class Wizard {
    static readonly stComponentName = "Wizard";
    readonly componentName = "Wizard";
    steps: WizardStep[];
    currentStep: number;
    stepTitle: string;
    cancelLabel?: string;
    backLabel?: string;
    nextLabel?: string;
    finishLabel?: string;
    isLast: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Wizard, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Wizard, "st-wizard", never, { "steps": { "alias": "steps"; "required": false; }; "currentStep": { "alias": "currentStep"; "required": false; }; "stepTitle": { "alias": "stepTitle"; "required": false; }; "cancelLabel": { "alias": "cancelLabel"; "required": false; }; "backLabel": { "alias": "backLabel"; "required": false; }; "nextLabel": { "alias": "nextLabel"; "required": false; }; "finishLabel": { "alias": "finishLabel"; "required": false; }; "isLast": { "alias": "isLast"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Wizard.d.ts.map