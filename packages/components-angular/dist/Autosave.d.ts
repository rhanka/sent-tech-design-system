import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type AutosaveStatus = "idle" | "saving" | "saved" | "error";
export type AutosaveLabels = {
    idle?: string;
    saving?: string;
    saved?: string;
    error?: string;
};
export type AutosaveProps = {
    status?: AutosaveStatus;
    /** Horodatage de la dernière sauvegarde réussie. */
    lastSaved?: string | Date;
    /** Affiche un bouton « Réessayer » sur le statut `error`. */
    onRetry?: () => void;
    /** Surcharge des libellés par statut. */
    labels?: AutosaveLabels;
    /** Étiquette du bouton de relance. */
    retryLabel?: string;
    locale?: string;
    class?: string;
};
export declare class Autosave {
    static readonly stComponentName = "Autosave";
    readonly componentName = "Autosave";
    status?: AutosaveStatus;
    lastSaved?: string | Date;
    onRetry?: () => void;
    labels?: AutosaveLabels;
    retryLabel?: string;
    locale?: string;
    classInput?: string;
    readonly retry: EventEmitter<void>;
    get resolvedStatus(): AutosaveStatus;
    private get isFr();
    private get defaultLabels();
    get statusLabel(): string;
    get resolvedRetryLabel(): string;
    get role(): string;
    get relativeTime(): string;
    get showRelative(): boolean;
    get hostClass(): string;
    triggerRetry(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Autosave, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Autosave, "st-autosave", never, { "status": { "alias": "status"; "required": false; }; "lastSaved": { "alias": "lastSaved"; "required": false; }; "onRetry": { "alias": "onRetry"; "required": false; }; "labels": { "alias": "labels"; "required": false; }; "retryLabel": { "alias": "retryLabel"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "retry": "retry"; }, never, never, true, never>;
}
//# sourceMappingURL=Autosave.d.ts.map