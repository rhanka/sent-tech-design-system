import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class MediaContent {
    static stComponentName = "MediaContent";
    componentName = "MediaContent";
    title;
    caption;
    byline;
    media;
    mediaAlt;
    mediaKind;
    mediaControls;
    aspectRatio;
    mediaCaptions;
    mediaCaptionsLabel;
    mediaCaptionsLang;
    classInput;
    get hostClass() {
        return ["st-mediaContent", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MediaContent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: MediaContent, isStandalone: true, selector: "st-media-content", inputs: { title: "title", caption: "caption", byline: "byline", media: "media", mediaAlt: "mediaAlt", mediaKind: "mediaKind", mediaControls: "mediaControls", aspectRatio: "aspectRatio", mediaCaptions: "mediaCaptions", mediaCaptionsLabel: "mediaCaptionsLabel", mediaCaptionsLang: "mediaCaptionsLang", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MediaContent, decorators: [{
            type: Component,
            args: [{
                    selector: "st-media-content",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], caption: [{
                type: NgInput
            }], byline: [{
                type: NgInput
            }], media: [{
                type: NgInput
            }], mediaAlt: [{
                type: NgInput
            }], mediaKind: [{
                type: NgInput
            }], mediaControls: [{
                type: NgInput
            }], aspectRatio: [{
                type: NgInput
            }], mediaCaptions: [{
                type: NgInput
            }], mediaCaptionsLabel: [{
                type: NgInput
            }], mediaCaptionsLang: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=MediaContent.js.map