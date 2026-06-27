import * as i0 from "@angular/core";
/** Niveau de titre porté par l'Overline d'en-tête de section. `h2`/`h3` quand la
 * section est une vraie région titrée d'un rail/drawer ; choisis selon la
 * profondeur du sommaire. */
export type NavSectionHeadingLevel = "h2" | "h3";
export type NavSectionProps = {
    /** Libellé de la section, rendu via Overline (small-caps muet). */
    label: string;
    /** Compteur optionnel → Badge circle en queue de l'en-tête. */
    count?: number;
    /** Si true, l'en-tête devient le trigger d'un Collapsible (aria-expanded)
     * qui montre/cache le contenu. Sinon : groupe titré statique. */
    collapsible?: boolean;
    /** État d'ouverture quand `collapsible`. */
    open?: boolean;
    /** Niveau de titre de l'Overline quand la section n'est pas repliable. */
    as?: NavSectionHeadingLevel;
    class?: string;
};
export declare class NavSection {
    static readonly stComponentName = "NavSection";
    readonly componentName = "NavSection";
    readonly uid: string;
    private localOpen?;
    label: string;
    count?: number;
    collapsible?: boolean;
    open?: boolean;
    as?: NavSectionHeadingLevel;
    classInput?: string;
    get hasCount(): boolean;
    /** Count bubble accessible name (« N éléments »). */
    get countAriaLabel(): string;
    /** Trigger accessible name : announces the count alongside the label. */
    get triggerAriaLabel(): string;
    /** `open` is the INITIAL value (mirror of the Vue/Svelte `bind:open`): the
     * section owns its disclosure state once mounted. Defaults to open. */
    get currentOpen(): boolean;
    toggle(): void;
    private get rootClasses();
    /** Collapsible variant reuses the Collapsible anatomy (no size modifier, like
     * the Vue/React reference) merged with the NavSection root classes. */
    get collapsibleClass(): string;
    get staticClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NavSection, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NavSection, "st-nav-section", never, { "label": { "alias": "label"; "required": false; }; "count": { "alias": "count"; "required": false; }; "collapsible": { "alias": "collapsible"; "required": false; }; "open": { "alias": "open"; "required": false; }; "as": { "alias": "as"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*", "*"], true, never>;
}
//# sourceMappingURL=NavSection.d.ts.map