import * as i0 from "@angular/core";
export type EmbedProps = {
    /** URL of the embedded document (required). */
    src: string;
    /**
     * Accessible name of the frame (required for a11y — every iframe must carry a
     * meaningful `title`).
     */
    title: string;
    /**
     * `sandbox` token list. Defaults to `""` for the strictest sandbox. Pass your
     * own token list to relax it deliberately.
     */
    sandbox?: string;
    /** Aspect ratio of the frame container (CSS `aspect-ratio`). Default `16/9`. */
    aspectRatio?: string;
    /** `allow` permissions policy (e.g. `"fullscreen; picture-in-picture"`). */
    allow?: string;
    /** Iframe loading strategy. Default `lazy`; use `eager` for above-the-fold embeds. */
    loading?: "eager" | "lazy";
    class?: string;
};
export declare class Embed {
    static readonly stComponentName = "Embed";
    readonly componentName = "Embed";
    src: string;
    title: string;
    sandbox?: string;
    aspectRatio?: string;
    allow?: string;
    loading?: "eager" | "lazy";
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Embed, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Embed, "st-embed", never, { "src": { "alias": "src"; "required": false; }; "title": { "alias": "title"; "required": false; }; "sandbox": { "alias": "sandbox"; "required": false; }; "aspectRatio": { "alias": "aspectRatio"; "required": false; }; "allow": { "alias": "allow"; "required": false; }; "loading": { "alias": "loading"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Embed.d.ts.map