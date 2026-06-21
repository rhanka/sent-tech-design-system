import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export interface StepperStep {
    label: string;
    description?: string;
}
export type StepperOrientation = "horizontal" | "vertical";
export type StepperProps = {
    steps: StepperStep[];
    /** Index de l'étape courante (0-based). */
    current?: number;
    orientation?: StepperOrientation;
    /** Autorise la navigation au clic sur les étapes. */
    clickable?: boolean;
    onStepClick?: (index: number) => void;
    /** Étiquette a11y de la liste d'étapes. */
    label?: string;
    class?: string;
};
export declare class Stepper {
    static readonly stComponentName = "Stepper";
    readonly componentName = "Stepper";
    steps: StepperStep[];
    current?: number;
    orientation?: StepperOrientation;
    clickable?: boolean;
    onStepClick?: (index: number) => void;
    label?: string;
    classInput?: string;
    readonly stepClick: EventEmitter<number>;
    stateOf(index: number): "complete" | "current" | "upcoming";
    stepClass(index: number): string;
    handleClick(index: number): void;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Stepper, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Stepper, "st-stepper", never, { "steps": { "alias": "steps"; "required": false; }; "current": { "alias": "current"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "clickable": { "alias": "clickable"; "required": false; }; "onStepClick": { "alias": "onStepClick"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "stepClick": "stepClick"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=Stepper.d.ts.map