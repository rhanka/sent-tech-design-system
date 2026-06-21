import * as i0 from "@angular/core";
export type StatusDotTone = "neutral" | "info" | "success" | "warning" | "error";
export type StatusDotProps = {
    /** Ton sémantique, mappé sur --st-semantic-feedback-*. Ignoré si `color` est fourni. */
    tone?: StatusDotTone;
    /** Couleur arbitraire (hex, rgb(), var(--token)…), rendue en background inline. Prime sur `tone`. */
    color?: string;
    /** Diamètre du point en px (défaut 8). */
    size?: number;
    /** Halo animé pour un état « live ». Désactivé sous prefers-reduced-motion. */
    pulse?: boolean;
    /** Si fourni, rend le point + ce texte inline (un StatusIndicator). */
    label?: string;
    class?: string;
};
export declare class StatusDot {
    static readonly stComponentName = "StatusDot";
    readonly componentName = "StatusDot";
    tone?: StatusDotTone;
    color?: string;
    size?: number;
    pulse?: boolean;
    label?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<StatusDot, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StatusDot, "st-status-dot", never, { "tone": { "alias": "tone"; "required": false; }; "color": { "alias": "color"; "required": false; }; "size": { "alias": "size"; "required": false; }; "pulse": { "alias": "pulse"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=StatusDot.d.ts.map