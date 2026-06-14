import * as i0 from "@angular/core";
export type MediaKind = "image" | "video";
export type MediaContentProps = {
    title?: string;
    caption?: string;
    byline?: string;
    media?: string;
    mediaAlt?: string;
    mediaKind?: MediaKind;
    mediaControls?: boolean;
    aspectRatio?: string;
    mediaCaptions?: string;
    mediaCaptionsLabel?: string;
    mediaCaptionsLang?: string;
    class?: string;
};
export declare class MediaContent {
    static readonly stComponentName = "MediaContent";
    readonly componentName = "MediaContent";
    title?: string;
    caption?: string;
    byline?: string;
    media?: string;
    mediaAlt?: string;
    mediaKind?: MediaKind;
    mediaControls?: boolean;
    aspectRatio?: string;
    mediaCaptions?: string;
    mediaCaptionsLabel?: string;
    mediaCaptionsLang?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MediaContent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MediaContent, "st-media-content", never, { "title": { "alias": "title"; "required": false; }; "caption": { "alias": "caption"; "required": false; }; "byline": { "alias": "byline"; "required": false; }; "media": { "alias": "media"; "required": false; }; "mediaAlt": { "alias": "mediaAlt"; "required": false; }; "mediaKind": { "alias": "mediaKind"; "required": false; }; "mediaControls": { "alias": "mediaControls"; "required": false; }; "aspectRatio": { "alias": "aspectRatio"; "required": false; }; "mediaCaptions": { "alias": "mediaCaptions"; "required": false; }; "mediaCaptionsLabel": { "alias": "mediaCaptionsLabel"; "required": false; }; "mediaCaptionsLang": { "alias": "mediaCaptionsLang"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=MediaContent.d.ts.map